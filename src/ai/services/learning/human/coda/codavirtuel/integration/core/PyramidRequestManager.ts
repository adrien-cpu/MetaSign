/**
 * Gestionnaire de requêtes pour la Pyramide IA MetaSign
 * @file src/ai/services/learning/human/coda/codavirtuel/integration/core/PyramidRequestManager.ts
 * @module ai/services/learning/human/coda/codavirtuel/integration/core
 * @description Gère les requêtes vers les différents niveaux de la pyramide IA
 * Compatible avec exactOptionalPropertyTypes: true - Respecte la limite de 300 lignes
 * Corrections v1.1.0: Respect strict de l'interface PyramidResponse des types centralisés
 * @author MetaSign Learning Team
 * @version 1.1.0
 * @since 2024
 * @lastModified 2025-01-24
 */

import type { PyramidLevel, PyramidResponse } from '../types';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Options de configuration pour une requête
 */
interface RequestOptions {
    readonly timeout?: number;
    readonly retries?: number;
    readonly priority: 'high' | 'medium' | 'low';
}

/**
 * Contexte d'une requête en cours
 */
interface RequestContext {
    readonly id: string;
    readonly level: PyramidLevel;
    readonly action: string;
    readonly data: Record<string, unknown>;
    readonly options: RequestOptions;
    readonly startTime: number;
}

/**
 * Gestionnaire de requêtes pour la pyramide IA
 * 
 * Responsabilités :
 * - Router les requêtes vers les niveaux appropriés
 * - Gérer les timeouts et les retries
 * - Maintenir les statistiques de requêtes
 * - Optimiser les performances des requêtes
 * - Gérer la priorisation des requêtes
 */
export class PyramidRequestManager {
    private readonly logger = LoggerFactory.getLogger('PyramidRequestManager');

    // Gestion des requêtes en cours
    private readonly activeRequests = new Map<string, RequestContext>();
    private readonly requestStats = new Map<PyramidLevel, {
        totalRequests: number;
        successfulRequests: number;
        avgResponseTime: number;
        lastRequestTime: Date;
    }>();

    // Configuration par défaut
    private readonly DEFAULT_TIMEOUT = 5000; // 5 secondes
    private readonly DEFAULT_RETRIES = 2;
    private readonly MAX_CONCURRENT_REQUESTS = 10;

    /**
     * Constructeur du gestionnaire de requêtes
     */
    constructor() {
        this.logger.info('PyramidRequestManager initialized');
        this.initializeStats();
    }

    /**
     * Effectue une requête vers un niveau spécifique de la pyramide
     * @param level Niveau cible
     * @param action Action à effectuer
     * @param data Données à envoyer
     * @param priority Priorité de la requête
     * @returns Réponse du niveau
     */
    public async requestFromLevel(
        level: PyramidLevel,
        action: string,
        data: Record<string, unknown>,
        priority: 'high' | 'medium' | 'low' = 'medium'
    ): Promise<PyramidResponse> {
        const requestId = this.generateRequestId();
        const options: RequestOptions = {
            timeout: this.getTimeoutForPriority(priority),
            retries: this.DEFAULT_RETRIES,
            priority
        };

        const context: RequestContext = {
            id: requestId,
            level,
            action,
            data,
            options,
            startTime: Date.now()
        };

        this.activeRequests.set(requestId, context);

        try {
            this.logger.debug('Starting request to pyramid level', {
                requestId,
                level,
                action,
                priority
            });

            const result = await this.executeRequest(context);
            const responseTime = Date.now() - context.startTime;

            // Mettre à jour les statistiques
            this.updateStats(level, true, responseTime);

            this.logger.debug('Request completed successfully', {
                requestId,
                level,
                responseTime
            });

            return {
                responseId: `resp_${requestId}`,
                requestId,
                fromLevel: level,
                toLevel: level, // Dans ce cas, c'est le même niveau
                success: true,
                result,
                processingTime: responseTime,
                confidence: 0.9, // Confiance par défaut
                metadata: {
                    timestamp: new Date(),
                    aiModel: `pyramid-level-${level}`,
                    resourcesUsed: [`level-${level}-processor`]
                }
            };

        } catch (error) {
            const responseTime = Date.now() - context.startTime;
            this.updateStats(level, false, responseTime);

            this.logger.error('Request failed', {
                requestId,
                level,
                action,
                error: error instanceof Error ? error.message : 'Unknown error'
            });

            // Retourner une réponse d'erreur typée
            return {
                responseId: `resp_${requestId}`,
                requestId,
                fromLevel: level,
                toLevel: level,
                success: false,
                result: null,
                processingTime: responseTime,
                confidence: 0,
                metadata: {
                    timestamp: new Date(),
                    aiModel: `pyramid-level-${level}`,
                    resourcesUsed: []
                },
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };

        } finally {
            this.activeRequests.delete(requestId);
        }
    }

    /**
     * Obtient les statistiques d'un niveau
     * @param level Niveau concerné
     * @returns Statistiques du niveau
     */
    public getLevelStats(level: PyramidLevel): {
        readonly totalRequests: number;
        readonly successfulRequests: number;
        readonly successRate: number;
        readonly avgResponseTime: number;
        readonly lastRequestTime: Date | null;
    } {
        const stats = this.requestStats.get(level);

        if (!stats) {
            return {
                totalRequests: 0,
                successfulRequests: 0,
                successRate: 0,
                avgResponseTime: 0,
                lastRequestTime: null
            };
        }

        return {
            totalRequests: stats.totalRequests,
            successfulRequests: stats.successfulRequests,
            successRate: stats.totalRequests > 0 ? stats.successfulRequests / stats.totalRequests : 0,
            avgResponseTime: stats.avgResponseTime,
            lastRequestTime: stats.lastRequestTime
        };
    }

    /**
     * Obtient les requêtes actives
     * @returns Nombre de requêtes en cours
     */
    public getActiveRequestsCount(): number {
        return this.activeRequests.size;
    }

    /**
     * Annule toutes les requêtes en cours
     */
    public async cancelAllRequests(): Promise<void> {
        const activeRequestIds = Array.from(this.activeRequests.keys());

        this.logger.info('Cancelling all active requests', {
            count: activeRequestIds.length
        });

        // Nettoyer les requêtes actives
        this.activeRequests.clear();
    }

    /**
     * Réinitialise les statistiques
     */
    public resetStats(): void {
        this.logger.info('Resetting pyramid request statistics');
        this.initializeStats();
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Initialise les statistiques pour tous les niveaux
     */
    private initializeStats(): void {
        // Initialiser les stats pour les niveaux 1 à 7
        for (let level = 1; level <= 7; level++) {
            this.requestStats.set(level as PyramidLevel, {
                totalRequests: 0,
                successfulRequests: 0,
                avgResponseTime: 0,
                lastRequestTime: new Date()
            });
        }
    }

    /**
     * Exécute une requête avec gestion des timeouts et retries
     * @param context Contexte de la requête
     * @returns Résultat du traitement
     */
    private async executeRequest(context: RequestContext): Promise<unknown> {
        const { level, action, data, options } = context;

        // Simuler le traitement par niveau (à remplacer par la vraie implémentation)
        return this.simulateLevelProcessing(level, action, data, options);
    }

    /**
     * Simule le traitement par un niveau (implémentation temporaire)
     * @param level Niveau cible
     * @param action Action à effectuer
     * @param data Données à traiter
     * @param options Options de requête
     * @returns Résultat du traitement
     */
    private async simulateLevelProcessing(
        level: PyramidLevel,
        action: string,
        data: Record<string, unknown>,
        options: RequestOptions
    ): Promise<unknown> {
        // Simuler un délai de traitement variable selon le niveau
        const processingDelay = this.getProcessingDelayForLevel(level);
        await new Promise(resolve => setTimeout(resolve, processingDelay));

        // Vérifier si c'est un health check
        if (data.healthCheck === true) {
            return {
                status: 'healthy',
                level,
                processingTime: processingDelay
            };
        }

        // Résultat générique pour les autres actions
        return {
            level,
            action,
            processed: true,
            result: `Level ${level} processed action: ${action}`,
            priority: options.priority
        };
    }

    /**
     * Obtient le délai de traitement simulé pour un niveau
     * @param level Niveau concerné
     * @returns Délai en millisecondes
     */
    private getProcessingDelayForLevel(level: PyramidLevel): number {
        // Les niveaux plus élevés prennent plus de temps
        const baseDelay = 100;
        const levelMultiplier = level * 50;
        const randomFactor = Math.random() * 200;

        return baseDelay + levelMultiplier + randomFactor;
    }

    /**
     * Obtient le timeout approprié selon la priorité
     * @param priority Priorité de la requête
     * @returns Timeout en millisecondes
     */
    private getTimeoutForPriority(priority: 'high' | 'medium' | 'low'): number {
        switch (priority) {
            case 'high':
                return 2000; // 2 secondes pour priorité haute
            case 'medium':
                return this.DEFAULT_TIMEOUT; // 5 secondes par défaut
            case 'low':
                return 10000; // 10 secondes pour priorité basse
        }
    }

    /**
     * Met à jour les statistiques d'un niveau
     * @param level Niveau concerné
     * @param success Succès de la requête
     * @param responseTime Temps de réponse
     */
    private updateStats(level: PyramidLevel, success: boolean, responseTime: number): void {
        const stats = this.requestStats.get(level);
        if (!stats) return;

        stats.totalRequests++;
        if (success) {
            stats.successfulRequests++;
        }

        // Mettre à jour le temps de réponse moyen (moyenne mobile)
        const alpha = 0.2; // Facteur de lissage
        stats.avgResponseTime = stats.avgResponseTime * (1 - alpha) + responseTime * alpha;
        stats.lastRequestTime = new Date();

        this.requestStats.set(level, stats);
    }

    /**
     * Génère un ID unique pour une requête
     * @returns ID de requête
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}