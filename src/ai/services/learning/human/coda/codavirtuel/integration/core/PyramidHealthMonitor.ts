/**
 * Moniteur de santé pour la Pyramide IA MetaSign
 * @file src/ai/services/learning/human/coda/codavirtuel/integration/core/PyramidHealthMonitor.ts
 * @module ai/services/learning/human/coda/codavirtuel/integration/core
 * @description Surveille la santé et les performances des niveaux de la pyramide IA
 * Compatible avec exactOptionalPropertyTypes: true - Respecte la limite de 300 lignes
 * Corrections v3.2.0: Interface PyramidRequestManager mise à jour pour PyramidResponse standard
 * @author MetaSign Learning Team
 * @version 3.2.0
 * @since 2024
 * @lastModified 2025-01-24
 */

import type { PyramidLevel, PyramidResponse } from '../types';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Interface pour le gestionnaire d'état de la pyramide
 * @interface PyramidStateManager
 */
interface PyramidStateManager {
    getEnabledLevels(): PyramidLevel[];
    getActiveLevels(): PyramidLevel[];
    updateLevelHealth(level: PyramidLevel, healthy: boolean): void;
}

/**
 * Interface pour le gestionnaire de requêtes pyramide
 * @interface PyramidRequestManager
 */
interface PyramidRequestManager {
    requestFromLevel(
        level: PyramidLevel,
        action: string,
        data: Record<string, unknown>,
        priority: 'high' | 'medium' | 'low'
    ): Promise<PyramidResponse>;
}

/**
 * Résultat d'un check de santé
 */
interface HealthCheckResult {
    readonly level: PyramidLevel;
    readonly healthy: boolean;
    readonly responseTime: number;
    readonly timestamp: Date;
    readonly error?: string;
}

/**
 * Moniteur de santé pour la pyramide IA
 * 
 * Responsabilités :
 * - Vérifier périodiquement la santé des niveaux
 * - Détecter les pannes et dégradations
 * - Alerter en cas de problèmes
 * - Maintenir des statistiques de disponibilité
 * - Orchestrer la récupération automatique
 */
export class PyramidHealthMonitor {
    private readonly logger = LoggerFactory.getLogger('PyramidHealthMonitor');
    private readonly stateManager: PyramidStateManager;
    private readonly requestManager: PyramidRequestManager;

    // État du monitoring
    private monitoringActive = false;
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private readonly healthHistory = new Map<PyramidLevel, HealthCheckResult[]>();

    // Configuration du monitoring
    private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 secondes
    private readonly MAX_HISTORY_SIZE = 100; // Garder 100 derniers checks par niveau
    private readonly UNHEALTHY_THRESHOLD = 3; // 3 échecs consécutifs = unhealthy

    /**
     * Constructeur avec injection des dépendances
     * @param stateManager Gestionnaire d'état
     * @param requestManager Gestionnaire de requêtes
     */
    constructor(
        stateManager: PyramidStateManager,
        requestManager: PyramidRequestManager
    ) {
        this.stateManager = stateManager;
        this.requestManager = requestManager;

        this.logger.info('PyramidHealthMonitor initialized');
    }

    /**
     * Démarre le monitoring périodique de santé
     */
    public async startMonitoring(): Promise<void> {
        if (this.monitoringActive) {
            this.logger.warn('Health monitoring already active');
            return;
        }

        this.logger.info('Starting pyramid health monitoring');

        // Effectuer un check initial
        await this.performFullHealthCheck();

        // Programmer les checks périodiques
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.performFullHealthCheck();
            } catch (error) {
                this.logger.error('Periodic health check failed', { error });
            }
        }, this.HEALTH_CHECK_INTERVAL);

        this.monitoringActive = true;

        this.logger.info('Pyramid health monitoring started', {
            interval: this.HEALTH_CHECK_INTERVAL,
            levels: this.stateManager.getEnabledLevels()
        });
    }

    /**
     * Arrête le monitoring de santé
     */
    public async stopMonitoring(): Promise<void> {
        if (!this.monitoringActive) {
            this.logger.warn('Health monitoring not active');
            return;
        }

        this.logger.info('Stopping pyramid health monitoring');

        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        this.monitoringActive = false;

        this.logger.info('Pyramid health monitoring stopped');
    }

    /**
     * Effectue un check de santé complet sur tous les niveaux
     * @returns Santé globale du système (0-1)
     */
    public async performHealthCheck(): Promise<number> {
        const enabledLevels = this.stateManager.getEnabledLevels();

        this.logger.debug('Performing health check', {
            levels: enabledLevels
        });

        const healthChecks = enabledLevels.map(level =>
            this.checkLevelHealth(level)
        );

        const results = await Promise.allSettled(healthChecks);

        // Traiter les résultats
        let healthyCount = 0;
        const totalCount = results.length;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const level = enabledLevels[i];

            if (result.status === 'fulfilled') {
                const healthResult = result.value;
                this.recordHealthResult(level, healthResult);

                if (healthResult.healthy) {
                    healthyCount++;
                }
            } else {
                // Échec du check = niveau unhealthy
                const errorResult: HealthCheckResult = {
                    level,
                    healthy: false,
                    responseTime: 0,
                    timestamp: new Date(),
                    error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
                };

                this.recordHealthResult(level, errorResult);
                this.logger.warn('Health check failed for level', {
                    level,
                    error: errorResult.error
                });
            }
        }

        const globalHealth = totalCount > 0 ? healthyCount / totalCount : 0;

        this.logger.debug('Health check completed', {
            healthyLevels: healthyCount,
            totalLevels: totalCount,
            globalHealth
        });

        return globalHealth;
    }

    /**
     * Obtient l'historique de santé d'un niveau
     * @param level Niveau concerné
     * @param maxResults Nombre maximum de résultats
     * @returns Historique des checks de santé
     */
    public getHealthHistory(level: PyramidLevel, maxResults = 10): readonly HealthCheckResult[] {
        const history = this.healthHistory.get(level) ?? [];
        return history.slice(-maxResults);
    }

    /**
     * Obtient les statistiques de disponibilité d'un niveau
     * @param level Niveau concerné
     * @param periodHours Période d'analyse en heures
     * @returns Statistiques de disponibilité
     */
    public getAvailabilityStats(level: PyramidLevel, periodHours = 24): {
        readonly availability: number; // 0-1
        readonly totalChecks: number;
        readonly successfulChecks: number;
        readonly avgResponseTime: number;
        readonly periodStart: Date;
    } {
        const history = this.healthHistory.get(level) ?? [];
        const cutoffTime = new Date(Date.now() - periodHours * 60 * 60 * 1000);

        const recentHistory = history.filter(result =>
            result.timestamp >= cutoffTime
        );

        if (recentHistory.length === 0) {
            return {
                availability: 0,
                totalChecks: 0,
                successfulChecks: 0,
                avgResponseTime: 0,
                periodStart: cutoffTime
            };
        }

        const successfulChecks = recentHistory.filter(result => result.healthy).length;
        const avgResponseTime = recentHistory.reduce((sum, result) =>
            sum + result.responseTime, 0
        ) / recentHistory.length;

        return {
            availability: successfulChecks / recentHistory.length,
            totalChecks: recentHistory.length,
            successfulChecks,
            avgResponseTime,
            periodStart: cutoffTime
        };
    }

    /**
     * Vérifie si le monitoring est actif
     * @returns true si le monitoring est actif
     */
    public isMonitoringActive(): boolean {
        return this.monitoringActive;
    }

    /**
     * Force une vérification de récupération pour les niveaux unhealthy
     */
    public async triggerRecoveryCheck(): Promise<void> {
        const activeLevels = this.stateManager.getActiveLevels();
        const unhealthyLevels = activeLevels.filter(level => {
            const recentHistory = this.getHealthHistory(level, this.UNHEALTHY_THRESHOLD);
            return recentHistory.length >= this.UNHEALTHY_THRESHOLD &&
                recentHistory.every(result => !result.healthy);
        });

        if (unhealthyLevels.length === 0) {
            this.logger.info('No unhealthy levels detected, recovery check not needed');
            return;
        }

        this.logger.info('Triggering recovery check for unhealthy levels', {
            levels: unhealthyLevels
        });

        for (const level of unhealthyLevels) {
            try {
                const result = await this.checkLevelHealth(level);
                this.recordHealthResult(level, result);

                if (result.healthy) {
                    this.logger.info('Level recovered during recovery check', { level });
                }
            } catch (error) {
                this.logger.error('Recovery check failed for level', {
                    level,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Effectue un check de santé complet sur tous les niveaux
     */
    private async performFullHealthCheck(): Promise<void> {
        try {
            const globalHealth = await this.performHealthCheck();

            // Alerter si la santé globale est faible
            if (globalHealth < 0.5) {
                this.logger.warn('System health is low', {
                    globalHealth,
                    threshold: 0.5
                });
            }

            // Déclencher une vérification de récupération si nécessaire
            if (globalHealth < 0.8) {
                await this.triggerRecoveryCheck();
            }
        } catch (error) {
            this.logger.error('Full health check failed', { error });
        }
    }

    /**
     * Vérifie la santé d'un niveau spécifique
     * @param level Niveau à vérifier
     * @returns Résultat du check de santé
     */
    private async checkLevelHealth(level: PyramidLevel): Promise<HealthCheckResult> {
        const startTime = Date.now();

        try {
            // Effectuer une requête de health check simple
            const response = await this.requestManager.requestFromLevel(
                level,
                'analysis',
                { healthCheck: true },
                'low'
            );

            const responseTime = Date.now() - startTime;
            const healthy = response.success && responseTime < 10000; // Timeout 10s

            return {
                level,
                healthy,
                responseTime,
                timestamp: new Date(),
                ...(healthy ? {} : { error: 'Response timeout or failure' })
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            return {
                level,
                healthy: false,
                responseTime,
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Enregistre un résultat de check de santé
     * @param level Niveau concerné
     * @param result Résultat à enregistrer
     */
    private recordHealthResult(level: PyramidLevel, result: HealthCheckResult): void {
        // Obtenir l'historique existant
        let history = this.healthHistory.get(level);
        if (!history) {
            history = [];
            this.healthHistory.set(level, history);
        }

        // Ajouter le nouveau résultat
        history.push(result);

        // Limiter la taille de l'historique
        if (history.length > this.MAX_HISTORY_SIZE) {
            history.splice(0, history.length - this.MAX_HISTORY_SIZE);
        }

        // Mettre à jour l'état dans le StateManager
        this.stateManager.updateLevelHealth(level, result.healthy);

        // Logger si changement d'état
        const previousResult = history[history.length - 2];
        if (previousResult && previousResult.healthy !== result.healthy) {
            this.logger.info('Level health status changed', {
                level,
                from: previousResult.healthy ? 'healthy' : 'unhealthy',
                to: result.healthy ? 'healthy' : 'unhealthy',
                responseTime: result.responseTime,
                error: result.error
            });
        }
    }
}