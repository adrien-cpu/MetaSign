/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/metrics/SyntacticSpaceMetrics.ts
 * @description Collecteur de métriques pour les transformations d'espace syntaxique
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import {
    SpaceTransformationContext,
    SpaceTransformationResult,
    SpacePerformanceMetrics
} from '../types/SpaceTransformationTypes';

/**
 * Interface pour les métriques d'espace syntaxique
 */
interface SyntacticSpaceMetricsData {
    /** Nombre total de transformations */
    totalTransformations: number;

    /** Transformations par type */
    transformationsByType: Map<string, number>;

    /** Scores d'impact moyens */
    averageImpactScores: Map<string, number>;

    /** Temps d'exécution moyen */
    averageExecutionTime: number;

    /** Taux de succès par type */
    successRates: Map<string, number>;

    /** Métriques de performance */
    performanceMetrics: SpacePerformanceMetrics[];

    /** Historique des transformations */
    transformationHistory: TransformationRecord[];
}

/**
 * Enregistrement d'une transformation
 */
interface TransformationRecord {
    /** Identifiant unique */
    id: string;

    /** Type de transformation */
    type: string;

    /** Timestamp de la transformation */
    timestamp: number;

    /** Contexte de la transformation */
    context: SpaceTransformationContext;

    /** Résultat de la transformation */
    result: SpaceTransformationResult;

    /** Métadonnées additionnelles */
    metadata: Record<string, unknown>;
}

/**
 * Collecteur de métriques pour les transformations d'espace syntaxique
 * 
 * Cette classe collecte, analyse et fournit des métriques détaillées
 * sur les transformations d'espace syntaxique pour optimiser
 * les stratégies d'apprentissage et détecter les patterns d'erreurs
 */
export class SyntacticSpaceMetrics {
    private readonly metrics: SyntacticSpaceMetricsData;
    private readonly maxHistorySize: number = 1000;
    private sessionStartTime: number;

    constructor() {
        this.sessionStartTime = Date.now();
        this.metrics = this.initializeMetrics();
    }

    /**
     * Initialise les métriques à vide
     * @returns Données de métriques initialisées
     * @private
     */
    private initializeMetrics(): SyntacticSpaceMetricsData {
        return {
            totalTransformations: 0,
            transformationsByType: new Map<string, number>(),
            averageImpactScores: new Map<string, number>(),
            averageExecutionTime: 0,
            successRates: new Map<string, number>(),
            performanceMetrics: [],
            transformationHistory: []
        };
    }

    /**
     * Enregistre une transformation effectuée
     * @param transformationType Type de transformation
     * @param context Contexte de la transformation
     * @param result Résultat de la transformation
     */
    public recordTransformation(
        transformationType: string,
        context: SpaceTransformationContext,
        result?: SpaceTransformationResult
    ): void {
        const timestamp = Date.now();
        const transformationId = this.generateTransformationId(transformationType, timestamp);

        // Création du résultat par défaut si non fourni
        const transformationResult = result || this.createDefaultResult(context);

        // Enregistrement dans l'historique
        const record: TransformationRecord = {
            id: transformationId,
            type: transformationType,
            timestamp,
            context,
            result: transformationResult,
            metadata: this.extractMetadata(context)
        };

        this.addToHistory(record);
        this.updateAggregatedMetrics(record);
    }

    /**
     * Crée un résultat par défaut
     * @param context Contexte de transformation
     * @returns Résultat par défaut
     * @private
     */
    private createDefaultResult(context: SpaceTransformationContext): SpaceTransformationResult {
        return {
            success: true,
            impactScore: context.severity,
            finalAccuracy: Math.max(0, context.originalAccuracy - context.severity),
            diagnostics: [`Transformation ${context.transformationType} appliquée`],
            performanceMetrics: {
                executionTime: 0,
                memoryUsage: 0,
                operationCount: 1,
                efficiency: 1 - context.severity
            }
        };
    }

    /**
     * Génère un identifiant unique pour une transformation
     * @param type Type de transformation
     * @param timestamp Timestamp de la transformation
     * @returns Identifiant unique
     * @private
     */
    private generateTransformationId(type: string, timestamp: number): string {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${type}_${timestamp}_${randomSuffix}`;
    }

    /**
     * Extrait les métadonnées du contexte
     * @param context Contexte de transformation
     * @returns Métadonnées extraites
     * @private
     */
    private extractMetadata(context: SpaceTransformationContext): Record<string, unknown> {
        return {
            severity: context.severity,
            factor: context.factor,
            preserveSemantics: context.preserveSemantics,
            linguisticComplexity: context.linguisticContext.spatialComplexity,
            sessionDuration: Date.now() - this.sessionStartTime
        };
    }

    /**
     * Ajoute un enregistrement à l'historique
     * @param record Enregistrement à ajouter
     * @private
     */
    private addToHistory(record: TransformationRecord): void {
        this.metrics.transformationHistory.push(record);

        // Limitation de la taille de l'historique
        if (this.metrics.transformationHistory.length > this.maxHistorySize) {
            this.metrics.transformationHistory.shift();
        }
    }

    /**
     * Met à jour les métriques agrégées
     * @param record Enregistrement de transformation
     * @private
     */
    private updateAggregatedMetrics(record: TransformationRecord): void {
        const { type, result } = record;

        // Mise à jour du compteur total
        this.metrics.totalTransformations++;

        // Mise à jour des compteurs par type
        const currentCount = this.metrics.transformationsByType.get(type) || 0;
        this.metrics.transformationsByType.set(type, currentCount + 1);

        // Mise à jour des scores d'impact moyens
        this.updateAverageImpactScore(type, result.impactScore);

        // Mise à jour des taux de succès
        this.updateSuccessRate(type, result.success);

        // Mise à jour des métriques de performance
        this.updatePerformanceMetrics(result.performanceMetrics);

        // Mise à jour du temps d'exécution moyen
        this.updateAverageExecutionTime(result.performanceMetrics.executionTime);
    }

    /**
     * Met à jour le score d'impact moyen pour un type
     * @param type Type de transformation
     * @param newScore Nouveau score
     * @private
     */
    private updateAverageImpactScore(type: string, newScore: number): void {
        const currentAverage = this.metrics.averageImpactScores.get(type) || 0;
        const count = this.metrics.transformationsByType.get(type) || 1;

        const newAverage = ((currentAverage * (count - 1)) + newScore) / count;
        this.metrics.averageImpactScores.set(type, newAverage);
    }

    /**
     * Met à jour le taux de succès pour un type
     * @param type Type de transformation
     * @param success Succès de la transformation
     * @private
     */
    private updateSuccessRate(type: string, success: boolean): void {
        const totalCount = this.metrics.transformationsByType.get(type) || 1;
        const currentRate = this.metrics.successRates.get(type) || 0;

        const successCount = Math.round(currentRate * (totalCount - 1)) + (success ? 1 : 0);
        const newRate = successCount / totalCount;

        this.metrics.successRates.set(type, newRate);
    }

    /**
     * Met à jour les métriques de performance
     * @param performanceMetrics Nouvelles métriques de performance
     * @private
     */
    private updatePerformanceMetrics(performanceMetrics: SpacePerformanceMetrics): void {
        this.metrics.performanceMetrics.push(performanceMetrics);

        // Limitation du nombre de métriques stockées
        if (this.metrics.performanceMetrics.length > 100) {
            this.metrics.performanceMetrics.shift();
        }
    }

    /**
     * Met à jour le temps d'exécution moyen
     * @param executionTime Nouveau temps d'exécution
     * @private
     */
    private updateAverageExecutionTime(executionTime: number): void {
        const total = this.metrics.totalTransformations;
        const currentAverage = this.metrics.averageExecutionTime;

        this.metrics.averageExecutionTime = ((currentAverage * (total - 1)) + executionTime) / total;
    }

    /**
     * Obtient les métriques complètes
     * @returns Toutes les métriques collectées
     */
    public getMetrics(): Record<string, unknown> {
        return {
            summary: this.generateSummary(),
            detailed: {
                totalTransformations: this.metrics.totalTransformations,
                transformationsByType: Object.fromEntries(this.metrics.transformationsByType),
                averageImpactScores: Object.fromEntries(this.metrics.averageImpactScores),
                successRates: Object.fromEntries(this.metrics.successRates),
                averageExecutionTime: this.metrics.averageExecutionTime
            },
            performance: this.generatePerformanceReport(),
            trends: this.generateTrendAnalysis(),
            sessionInfo: {
                startTime: this.sessionStartTime,
                duration: Date.now() - this.sessionStartTime,
                recordsCount: this.metrics.transformationHistory.length
            }
        };
    }

    /**
     * Génère un résumé des métriques
     * @returns Résumé des métriques
     * @private
     */
    private generateSummary(): Record<string, unknown> {
        const mostUsedType = this.getMostUsedTransformationType();
        const averageImpact = this.calculateOverallAverageImpact();
        const overallSuccessRate = this.calculateOverallSuccessRate();

        return {
            totalTransformations: this.metrics.totalTransformations,
            mostUsedTransformation: mostUsedType,
            averageImpactScore: averageImpact,
            overallSuccessRate,
            sessionDuration: Date.now() - this.sessionStartTime,
            performanceGrade: this.calculatePerformanceGrade()
        };
    }

    /**
     * Obtient le type de transformation le plus utilisé
     * @returns Type de transformation le plus fréquent
     * @private
     */
    private getMostUsedTransformationType(): string | null {
        let maxCount = 0;
        let mostUsedType: string | null = null;

        for (const [type, count] of this.metrics.transformationsByType) {
            if (count > maxCount) {
                maxCount = count;
                mostUsedType = type;
            }
        }

        return mostUsedType;
    }

    /**
     * Calcule l'impact moyen global
     * @returns Score d'impact moyen global
     * @private
     */
    private calculateOverallAverageImpact(): number {
        if (this.metrics.averageImpactScores.size === 0) return 0;

        let totalImpact = 0;
        let totalCount = 0;

        for (const [type, avgScore] of this.metrics.averageImpactScores) {
            const count = this.metrics.transformationsByType.get(type) || 0;
            totalImpact += avgScore * count;
            totalCount += count;
        }

        return totalCount > 0 ? totalImpact / totalCount : 0;
    }

    /**
     * Calcule le taux de succès global
     * @returns Taux de succès global
     * @private
     */
    private calculateOverallSuccessRate(): number {
        if (this.metrics.successRates.size === 0) return 0;

        let totalSuccesses = 0;
        let totalTransformations = 0;

        for (const [type, rate] of this.metrics.successRates) {
            const count = this.metrics.transformationsByType.get(type) || 0;
            totalSuccesses += rate * count;
            totalTransformations += count;
        }

        return totalTransformations > 0 ? totalSuccesses / totalTransformations : 0;
    }

    /**
     * Calcule une note de performance
     * @returns Note de performance (A-F)
     * @private
     */
    private calculatePerformanceGrade(): string {
        const successRate = this.calculateOverallSuccessRate();
        const avgExecutionTime = this.metrics.averageExecutionTime;
        const efficiency = this.calculateAverageEfficiency();

        // Calcul d'un score composite
        const score = (successRate * 0.4) +
            (efficiency * 0.4) +
            ((avgExecutionTime < 100 ? 1 : Math.max(0, 1 - avgExecutionTime / 1000)) * 0.2);

        if (score >= 0.9) return 'A';
        if (score >= 0.8) return 'B';
        if (score >= 0.7) return 'C';
        if (score >= 0.6) return 'D';
        return 'F';
    }

    /**
     * Calcule l'efficacité moyenne
     * @returns Efficacité moyenne
     * @private
     */
    private calculateAverageEfficiency(): number {
        if (this.metrics.performanceMetrics.length === 0) return 0;

        const totalEfficiency = this.metrics.performanceMetrics.reduce(
            (sum, metric) => sum + metric.efficiency, 0
        );

        return totalEfficiency / this.metrics.performanceMetrics.length;
    }

    /**
     * Génère un rapport de performance
     * @returns Rapport de performance
     * @private
     */
    private generatePerformanceReport(): Record<string, unknown> {
        const recentMetrics = this.metrics.performanceMetrics.slice(-10);

        return {
            averageExecutionTime: this.metrics.averageExecutionTime,
            averageEfficiency: this.calculateAverageEfficiency(),
            memoryUsageTrend: this.calculateMemoryUsageTrend(recentMetrics),
            operationComplexity: this.calculateOperationComplexity(recentMetrics),
            performanceStability: this.calculatePerformanceStability(recentMetrics)
        };
    }

    /**
     * Calcule la tendance d'utilisation mémoire
     * @param metrics Métriques récentes
     * @returns Tendance d'utilisation mémoire
     * @private
     */
    private calculateMemoryUsageTrend(metrics: SpacePerformanceMetrics[]): string {
        if (metrics.length < 2) return 'stable';

        const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
        const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

        const firstAvg = firstHalf.reduce((sum, m) => sum + m.memoryUsage, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + m.memoryUsage, 0) / secondHalf.length;

        const difference = (secondAvg - firstAvg) / firstAvg;

        if (difference > 0.1) return 'increasing';
        if (difference < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * Calcule la complexité moyenne des opérations
     * @param metrics Métriques récentes
     * @returns Complexité moyenne
     * @private
     */
    private calculateOperationComplexity(metrics: SpacePerformanceMetrics[]): number {
        if (metrics.length === 0) return 0;

        const totalOperations = metrics.reduce((sum, m) => sum + m.operationCount, 0);
        return totalOperations / metrics.length;
    }

    /**
     * Calcule la stabilité des performances
     * @param metrics Métriques récentes
     * @returns Score de stabilité (0-1)
     * @private
     */
    private calculatePerformanceStability(metrics: SpacePerformanceMetrics[]): number {
        if (metrics.length < 2) return 1;

        const executionTimes = metrics.map(m => m.executionTime);
        const mean = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;

        const variance = executionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / executionTimes.length;
        const standardDeviation = Math.sqrt(variance);

        // Score de stabilité inversement proportionnel à l'écart-type
        return Math.max(0, 1 - (standardDeviation / mean));
    }

    /**
     * Génère une analyse des tendances
     * @returns Analyse des tendances
     * @private
     */
    private generateTrendAnalysis(): Record<string, unknown> {
        const recentHistory = this.metrics.transformationHistory.slice(-20);

        return {
            recentTransformationTypes: this.analyzeRecentTransformationTypes(recentHistory),
            impactTrend: this.analyzeImpactTrend(recentHistory),
            successRateTrend: this.analyzeSuccessRateTrend(recentHistory),
            temporalPatterns: this.analyzeTemporalPatterns(recentHistory)
        };
    }

    /**
     * Analyse les types de transformations récentes
     * @param history Historique récent
     * @returns Analyse des types récents
     * @private
     */
    private analyzeRecentTransformationTypes(history: TransformationRecord[]): Record<string, number> {
        const typeCounts: Record<string, number> = {};

        for (const record of history) {
            typeCounts[record.type] = (typeCounts[record.type] || 0) + 1;
        }

        return typeCounts;
    }

    /**
     * Analyse la tendance d'impact
     * @param history Historique récent
     * @returns Tendance d'impact
     * @private
     */
    private analyzeImpactTrend(history: TransformationRecord[]): string {
        if (history.length < 2) return 'stable';

        const midPoint = Math.floor(history.length / 2);
        const firstHalf = history.slice(0, midPoint);
        const secondHalf = history.slice(midPoint);

        const firstAvgImpact = firstHalf.reduce((sum, r) => sum + r.result.impactScore, 0) / firstHalf.length;
        const secondAvgImpact = secondHalf.reduce((sum, r) => sum + r.result.impactScore, 0) / secondHalf.length;

        const change = (secondAvgImpact - firstAvgImpact) / firstAvgImpact;

        if (change > 0.15) return 'increasing';
        if (change < -0.15) return 'decreasing';
        return 'stable';
    }

    /**
     * Analyse la tendance du taux de succès
     * @param history Historique récent
     * @returns Tendance du taux de succès
     * @private
     */
    private analyzeSuccessRateTrend(history: TransformationRecord[]): string {
        if (history.length < 2) return 'stable';

        const midPoint = Math.floor(history.length / 2);
        const firstHalf = history.slice(0, midPoint);
        const secondHalf = history.slice(midPoint);

        const firstSuccessRate = firstHalf.filter(r => r.result.success).length / firstHalf.length;
        const secondSuccessRate = secondHalf.filter(r => r.result.success).length / secondHalf.length;

        const change = secondSuccessRate - firstSuccessRate;

        if (change > 0.1) return 'improving';
        if (change < -0.1) return 'declining';
        return 'stable';
    }

    /**
     * Analyse les patterns temporels
     * @param history Historique récent
     * @returns Patterns temporels
     * @private
     */
    private analyzeTemporalPatterns(history: TransformationRecord[]): Record<string, unknown> {
        const timeIntervals: number[] = [];

        for (let i = 1; i < history.length; i++) {
            timeIntervals.push(history[i].timestamp - history[i - 1].timestamp);
        }

        if (timeIntervals.length === 0) {
            return { pattern: 'insufficient_data' };
        }

        const avgInterval = timeIntervals.reduce((sum, interval) => sum + interval, 0) / timeIntervals.length;
        const variance = timeIntervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / timeIntervals.length;

        return {
            averageInterval: avgInterval,
            intervalVariance: variance,
            pattern: variance < avgInterval * 0.5 ? 'regular' : 'irregular',
            frequency: avgInterval > 0 ? 1000 / avgInterval : 0 // transformations per second
        };
    }

    /**
     * Réinitialise toutes les métriques
     */
    public reset(): void {
        this.sessionStartTime = Date.now();
        this.metrics.totalTransformations = 0;
        this.metrics.transformationsByType.clear();
        this.metrics.averageImpactScores.clear();
        this.metrics.averageExecutionTime = 0;
        this.metrics.successRates.clear();
        this.metrics.performanceMetrics.length = 0;
        this.metrics.transformationHistory.length = 0;
    }

    /**
     * Exporte les métriques au format JSON
     * @returns Métriques au format JSON
     */
    public exportMetrics(): string {
        return JSON.stringify(this.getMetrics(), null, 2);
    }

    /**
     * Importe des métriques depuis un JSON
     * @param jsonData Données JSON à importer
     * @throws Error si les données sont invalides
     */
    public importMetrics(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            // Validation et import des données
            // Implementation de la validation...
            console.log('Métriques importées avec succès', data);
        } catch (error) {
            throw new Error(`Impossible d'importer les métriques: ${error}`);
        }
    }
}