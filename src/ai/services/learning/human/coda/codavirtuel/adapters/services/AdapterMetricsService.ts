/**
 * Service de métriques pour l'adaptateur d'exercices
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/services/AdapterMetricsService.ts
 * @module ai/services/learning/codavirtuel/adapters/services
 * @description Service spécialisé dans la collecte et l'analyse des métriques d'adaptation
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @version 3.0.0
 * @author MetaSign Learning Team
 * @since 2024
 * @lastModified 2025-01-15
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Métriques d'adaptation collectées
 */
interface AdaptationMetrics {
    readonly totalAdaptations: number;
    readonly successfulAdaptations: number;
    readonly failedAdaptations: number;
    readonly totalProcessingTime: number;
    readonly averageProcessingTime: number;
    readonly errorSimulationsPerformed: number;
    readonly lastAdaptationTime: Date | null;
}

/**
 * Événement d'adaptation enregistré
 */
interface AdaptationEvent {
    readonly timestamp: Date;
    readonly processingTimeMs: number;
    readonly success: boolean;
    readonly errorSimulated: boolean;
    readonly exerciseType?: string;
    readonly userId?: string;
}

/**
 * Statistiques calculées
 */
interface CalculatedStats {
    readonly successRate: number;
    readonly averageAdaptationTime: number;
    readonly errorSimulationRate: number;
    readonly adaptationsPerMinute: number;
}

/**
 * Service de métriques pour l'adaptateur d'exercices
 * Responsable de la collecte, du stockage et de l'analyse des métriques de performance
 * @class AdapterMetricsService
 */
export class AdapterMetricsService {
    private readonly logger = LoggerFactory.getLogger('AdapterMetricsService');

    // Stockage des métriques en mémoire
    private metrics: AdaptationMetrics = {
        totalAdaptations: 0,
        successfulAdaptations: 0,
        failedAdaptations: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        errorSimulationsPerformed: 0,
        lastAdaptationTime: null
    };

    // Historique des événements pour analyses détaillées
    private readonly eventHistory: AdaptationEvent[] = [];
    private readonly maxHistorySize: number = 1000;

    // Fenêtre glissante pour calculs temps réel
    private readonly recentEvents: AdaptationEvent[] = [];
    private readonly recentWindowMs: number = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.logger.debug('AdapterMetricsService initialized');
    }

    /**
     * Enregistre une adaptation d'exercice
     * @param processingTimeMs Temps de traitement en millisecondes
     * @param errorSimulated Indique si une erreur a été simulée
     * @param success Indique si l'adaptation a réussi (optionnel, défaut: true)
     * @param exerciseType Type d'exercice adapté (optionnel)
     * @param userId Identifiant de l'utilisateur (optionnel)
     */
    public recordAdaptation(
        processingTimeMs: number,
        errorSimulated: boolean,
        success: boolean = true,
        exerciseType?: string,
        userId?: string
    ): void {
        const event: AdaptationEvent = {
            timestamp: new Date(),
            processingTimeMs,
            success,
            errorSimulated,
            exerciseType,
            userId
        };

        // Enregistrer l'événement
        this.addEventToHistory(event);
        this.addEventToRecentWindow(event);
        this.updateMetrics(event);

        this.logger.debug('Adaptation recorded', {
            processingTimeMs,
            success,
            errorSimulated,
            exerciseType,
            totalAdaptations: this.metrics.totalAdaptations
        });
    }

    /**
     * Enregistre un échec d'adaptation
     * @param processingTimeMs Temps de traitement avant échec
     * @param errorDetails Détails de l'erreur (optionnel)
     * @param exerciseType Type d'exercice (optionnel)
     * @param userId Identifiant utilisateur (optionnel)
     */
    public recordFailure(
        processingTimeMs: number,
        errorDetails?: string,
        exerciseType?: string,
        userId?: string
    ): void {
        this.recordAdaptation(processingTimeMs, false, false, exerciseType, userId);

        this.logger.warn('Adaptation failure recorded', {
            processingTimeMs,
            errorDetails,
            exerciseType,
            userId
        });
    }

    /**
     * Obtient les métriques actuelles
     * @returns Métriques d'adaptation
     */
    public getMetrics(): AdaptationMetrics {
        return { ...this.metrics };
    }

    /**
     * Obtient des statistiques calculées
     * @returns Statistiques calculées
     */
    public getCalculatedStats(): CalculatedStats {
        const successRate = this.metrics.totalAdaptations > 0
            ? this.metrics.successfulAdaptations / this.metrics.totalAdaptations
            : 0;

        const errorSimulationRate = this.metrics.totalAdaptations > 0
            ? this.metrics.errorSimulationsPerformed / this.metrics.totalAdaptations
            : 0;

        const adaptationsPerMinute = this.calculateAdaptationsPerMinute();

        return {
            successRate,
            averageAdaptationTime: this.metrics.averageProcessingTime,
            errorSimulationRate,
            adaptationsPerMinute
        };
    }

    /**
     * Obtient les métriques des événements récents (5 dernières minutes)
     * @returns Métriques des événements récents
     */
    public getRecentMetrics(): CalculatedStats {
        this.cleanupRecentEvents();

        if (this.recentEvents.length === 0) {
            return {
                successRate: 0,
                averageAdaptationTime: 0,
                errorSimulationRate: 0,
                adaptationsPerMinute: 0
            };
        }

        const successfulEvents = this.recentEvents.filter(e => e.success).length;
        const errorSimulatedEvents = this.recentEvents.filter(e => e.errorSimulated).length;
        const totalProcessingTime = this.recentEvents.reduce((sum, e) => sum + e.processingTimeMs, 0);

        const successRate = successfulEvents / this.recentEvents.length;
        const averageAdaptationTime = totalProcessingTime / this.recentEvents.length;
        const errorSimulationRate = errorSimulatedEvents / this.recentEvents.length;

        // Calcul des adaptations par minute sur la fenêtre récente
        const timeSpanMs = this.getRecentTimeSpanMs();
        const adaptationsPerMinute = timeSpanMs > 0
            ? (this.recentEvents.length / timeSpanMs) * 60000
            : 0;

        return {
            successRate,
            averageAdaptationTime,
            errorSimulationRate,
            adaptationsPerMinute
        };
    }

    /**
     * Remet à zéro toutes les métriques
     */
    public resetMetrics(): void {
        this.metrics = {
            totalAdaptations: 0,
            successfulAdaptations: 0,
            failedAdaptations: 0,
            totalProcessingTime: 0,
            averageProcessingTime: 0,
            errorSimulationsPerformed: 0,
            lastAdaptationTime: null
        };

        this.eventHistory.length = 0;
        this.recentEvents.length = 0;

        this.logger.info('Metrics reset');
    }

    /**
     * Obtient un résumé de performance pour logging
     * @returns Résumé de performance
     */
    public getPerformanceSummary(): string {
        const stats = this.getCalculatedStats();
        const recentStats = this.getRecentMetrics();

        return `Adaptations: ${this.metrics.totalAdaptations}, ` +
            `Success Rate: ${(stats.successRate * 100).toFixed(1)}%, ` +
            `Avg Time: ${stats.averageAdaptationTime.toFixed(0)}ms, ` +
            `Recent Rate: ${recentStats.adaptationsPerMinute.toFixed(1)}/min`;
    }

    /**
     * Ajoute un événement à l'historique
     * @param event Événement à ajouter
     * @private
     */
    private addEventToHistory(event: AdaptationEvent): void {
        this.eventHistory.push(event);

        // Limiter la taille de l'historique
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Ajoute un événement à la fenêtre récente
     * @param event Événement à ajouter
     * @private
     */
    private addEventToRecentWindow(event: AdaptationEvent): void {
        this.recentEvents.push(event);
        this.cleanupRecentEvents();
    }

    /**
     * Met à jour les métriques avec un nouvel événement
     * @param event Événement d'adaptation
     * @private
     */
    private updateMetrics(event: AdaptationEvent): void {
        this.metrics = {
            ...this.metrics,
            totalAdaptations: this.metrics.totalAdaptations + 1,
            successfulAdaptations: event.success
                ? this.metrics.successfulAdaptations + 1
                : this.metrics.successfulAdaptations,
            failedAdaptations: !event.success
                ? this.metrics.failedAdaptations + 1
                : this.metrics.failedAdaptations,
            totalProcessingTime: this.metrics.totalProcessingTime + event.processingTimeMs,
            averageProcessingTime: (this.metrics.totalProcessingTime + event.processingTimeMs) /
                (this.metrics.totalAdaptations + 1),
            errorSimulationsPerformed: event.errorSimulated
                ? this.metrics.errorSimulationsPerformed + 1
                : this.metrics.errorSimulationsPerformed,
            lastAdaptationTime: event.timestamp
        };
    }

    /**
     * Nettoie les événements récents en supprimant ceux hors de la fenêtre
     * @private
     */
    private cleanupRecentEvents(): void {
        const cutoffTime = Date.now() - this.recentWindowMs;

        while (this.recentEvents.length > 0 &&
            this.recentEvents[0]!.timestamp.getTime() < cutoffTime) {
            this.recentEvents.shift();
        }
    }

    /**
     * Calcule les adaptations par minute sur l'historique total
     * @returns Adaptations par minute
     * @private
     */
    private calculateAdaptationsPerMinute(): number {
        if (this.eventHistory.length < 2) {
            return 0;
        }

        const firstEvent = this.eventHistory[0]!;
        const lastEvent = this.eventHistory[this.eventHistory.length - 1]!;
        const timeSpanMs = lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime();

        if (timeSpanMs <= 0) {
            return 0;
        }

        return (this.eventHistory.length / timeSpanMs) * 60000;
    }

    /**
     * Calcule la durée de la fenêtre récente
     * @returns Durée en millisecondes
     * @private
     */
    private getRecentTimeSpanMs(): number {
        if (this.recentEvents.length < 2) {
            return 0;
        }

        const firstEvent = this.recentEvents[0]!;
        const lastEvent = this.recentEvents[this.recentEvents.length - 1]!;

        return lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime();
    }
}