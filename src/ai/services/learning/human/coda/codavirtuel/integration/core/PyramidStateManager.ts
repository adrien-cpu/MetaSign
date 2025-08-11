/**
 * Gestionnaire d'état pour la Pyramide IA MetaSign
 * @file src/ai/services/learning/human/coda/codavirtuel/integration/core/PyramidStateManager.ts
 * @module ai/services/learning/human/coda/codavirtuel/integration/core
 * @description Gère l'état global de la pyramide IA et sa configuration
 * Compatible avec exactOptionalPropertyTypes: true - Respecte la limite de 300 lignes
 * Corrections v3.1.0: Suppression des imports inutilisés (PYRAMID_LEVEL_CAPABILITIES, DEFAULT_PYRAMID_CONFIG)
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-24
 */

import type {
    PyramidLevel,
    PyramidIntegrationConfig,
    PyramidSystemState,
    MutablePyramidSystemState,
    PyramidResponse
} from '../types';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Gestionnaire centralisé de l'état de la pyramide IA
 * 
 * Responsabilités :
 * - Maintenir l'état global du système
 * - Gérer la configuration de la pyramide
 * - Suivre les métriques de performance
 * - Détecter les goulots d'étranglement
 * - Fournir des informations d'état en temps réel
 */
export class PyramidStateManager {
    private readonly logger = LoggerFactory.getLogger('PyramidStateManager');
    private readonly config: Required<PyramidIntegrationConfig>;
    private readonly systemState: MutablePyramidSystemState;

    /**
     * Constructeur avec configuration
     * @param userConfig Configuration utilisateur (partielle)
     */
    constructor(userConfig: Partial<PyramidIntegrationConfig> = {}) {
        this.config = this.mergeWithDefaults(userConfig);
        this.systemState = this.initializeSystemState();

        this.logger.info('PyramidStateManager initialized', {
            enabledLevels: this.config.enabledLevels,
            cachingEnabled: this.config.caching.enabled
        });
    }

    /**
     * Initialise le gestionnaire d'état
     */
    public async initialize(): Promise<void> {
        this.logger.info('Initializing PyramidStateManager');

        // Réinitialiser l'état du système
        this.resetSystemState();

        // Valider la configuration
        this.validateConfiguration();

        this.logger.info('PyramidStateManager initialized successfully');
    }

    /**
     * Obtient l'état complet du système (version readonly)
     * @returns État du système pyramide
     */
    public getSystemState(): PyramidSystemState {
        return {
            levels: { ...this.systemState.levels },
            globalMetrics: { ...this.systemState.globalMetrics }
        };
    }

    /**
     * Obtient les niveaux activés
     * @returns Liste des niveaux activés
     */
    public getEnabledLevels(): readonly PyramidLevel[] {
        return this.config.enabledLevels;
    }

    /**
     * Obtient les niveaux actuellement actifs (non offline)
     * @returns Liste des niveaux actifs
     */
    public getActiveLevels(): readonly PyramidLevel[] {
        return this.config.enabledLevels.filter(level =>
            this.systemState.levels[level]?.status !== 'offline'
        );
    }

    /**
     * Met à jour les métriques d'une requête pour un niveau
     * @param level Niveau concerné
     * @param response Réponse reçue
     */
    public updateRequestMetrics(level: PyramidLevel, response: PyramidResponse): void {
        const levelState = this.systemState.levels[level];
        if (!levelState) return;

        // Mettre à jour les métriques du niveau
        const metrics = levelState.performanceMetrics;
        const newTotal = metrics.totalRequests + 1;

        metrics.avgResponseTime = (
            (metrics.avgResponseTime * metrics.totalRequests) + response.processingTime
        ) / newTotal;

        metrics.successRate = (
            (metrics.successRate * metrics.totalRequests) + (response.success ? 1 : 0)
        ) / newTotal;

        metrics.totalRequests = newTotal;

        // Mettre à jour les métriques globales
        this.updateGlobalMetrics();

        this.logger.debug('Request metrics updated', {
            level,
            totalRequests: newTotal,
            avgResponseTime: metrics.avgResponseTime,
            successRate: metrics.successRate
        });
    }

    /**
     * Met à jour l'état de santé d'un niveau
     * @param level Niveau concerné
     * @param healthy État de santé
     */
    public updateLevelHealth(level: PyramidLevel, healthy: boolean): void {
        const levelState = this.systemState.levels[level];
        if (!levelState) return;

        levelState.status = healthy ? 'active' : 'error';
        levelState.lastHeartbeat = new Date();

        this.updateGlobalMetrics();

        this.logger.debug('Level health updated', { level, healthy, status: levelState.status });
    }

    /**
     * Obtient la charge d'un niveau (0-1)
     * @param level Niveau concerné
     * @returns Charge du niveau
     */
    public getLevelLoad(level: PyramidLevel): number {
        return this.systemState.levels[level]?.load ?? 0;
    }

    /**
     * Obtient la santé d'un niveau (0-1)
     * @param level Niveau concerné
     * @returns Santé du niveau
     */
    public getLevelHealth(level: PyramidLevel): number {
        const levelState = this.systemState.levels[level];
        if (!levelState) return 0;

        return levelState.status === 'active' ? 1 :
            levelState.status === 'busy' ? 0.5 : 0;
    }

    /**
     * Obtient le timeout configuré pour un niveau
     * @param level Niveau concerné
     * @returns Timeout en millisecondes
     */
    public getTimeoutForLevel(level: PyramidLevel): number {
        return this.config.timeouts[level] ?? 5000;
    }

    /**
     * Vérifie si le cache est activé
     * @returns true si le cache est activé
     */
    public isCachingEnabled(): boolean {
        return this.config.caching.enabled;
    }

    /**
     * Obtient la taille maximale du cache
     * @returns Taille maximale du cache
     */
    public getMaxCacheSize(): number {
        return this.config.caching.maxSize;
    }

    /**
     * Obtient le TTL du cache
     * @returns TTL en millisecondes
     */
    public getCacheTTL(): number {
        return this.config.caching.ttlMs;
    }

    /**
     * Détecte les goulots d'étranglement dans le système
     * @returns Niveaux identifiés comme goulots
     */
    public detectBottlenecks(): readonly PyramidLevel[] {
        return this.getActiveLevels().filter(level => {
            const levelState = this.systemState.levels[level];
            return levelState && (
                levelState.load > 0.8 ||
                levelState.performanceMetrics.avgResponseTime > 5000 ||
                levelState.performanceMetrics.successRate < 0.7
            );
        });
    }

    /**
     * Nettoyage des ressources
     */
    public async cleanup(): Promise<void> {
        this.logger.info('Cleaning up PyramidStateManager');

        // Réinitialiser l'état
        this.resetSystemState();

        this.logger.info('PyramidStateManager cleaned up successfully');
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Fusionne la configuration utilisateur avec les valeurs par défaut
     * @param userConfig Configuration utilisateur
     * @returns Configuration complète
     */
    private mergeWithDefaults(userConfig: Partial<PyramidIntegrationConfig>): Required<PyramidIntegrationConfig> {
        // Valeurs par défaut locales pour éviter les dépendances circulaires
        const defaults: Required<PyramidIntegrationConfig> = {
            enabledLevels: [1, 2, 3, 4, 5, 6, 7],
            timeouts: {
                1: 1000, 2: 2000, 3: 3000, 4: 5000, 5: 3000, 6: 4000, 7: 6000
            },
            retryPolicies: {
                1: { maxRetries: 3, backoffMs: 500 },
                2: { maxRetries: 3, backoffMs: 500 },
                3: { maxRetries: 2, backoffMs: 1000 },
                4: { maxRetries: 2, backoffMs: 1000 },
                5: { maxRetries: 3, backoffMs: 750 },
                6: { maxRetries: 2, backoffMs: 1000 },
                7: { maxRetries: 1, backoffMs: 2000 }
            },
            loadBalancing: {
                enabled: true,
                strategy: 'performance-based'
            },
            caching: {
                enabled: true,
                ttlMs: 300000,
                maxSize: 1000
            }
        };

        return {
            enabledLevels: userConfig.enabledLevels ?? defaults.enabledLevels,
            timeouts: { ...defaults.timeouts, ...userConfig.timeouts },
            retryPolicies: { ...defaults.retryPolicies, ...userConfig.retryPolicies },
            loadBalancing: { ...defaults.loadBalancing, ...userConfig.loadBalancing },
            caching: { ...defaults.caching, ...userConfig.caching }
        };
    }

    /**
     * Initialise l'état du système pyramide
     * @returns État initial du système
     */
    private initializeSystemState(): MutablePyramidSystemState {
        const levels = {} as MutablePyramidSystemState['levels'];

        // Capacités par niveau (déclaration locale pour éviter les dépendances circulaires)
        const levelCapabilities: Record<PyramidLevel, readonly string[]> = {
            1: ['data-collection', 'sensor-processing', 'signal-analysis'],
            2: ['data-processing', 'filtering', 'normalization', 'validation'],
            3: ['pattern-synthesis', 'data-aggregation', 'correlation-analysis'],
            4: ['predictive-analysis', 'trend-detection', 'risk-assessment'],
            5: ['recommendation-generation', 'assistance-provision', 'user-support'],
            6: ['adaptive-guidance', 'path-optimization', 'personalization'],
            7: ['strategic-mentorship', 'long-term-planning', 'supervision']
        };

        for (const level of this.config.enabledLevels) {
            levels[level] = {
                status: 'active',
                load: 0,
                lastHeartbeat: new Date(),
                capabilities: levelCapabilities[level],
                performanceMetrics: {
                    avgResponseTime: 0,
                    successRate: 1,
                    totalRequests: 0
                }
            };
        }

        return {
            levels,
            globalMetrics: {
                totalRequests: 0,
                avgSystemResponseTime: 0,
                systemHealth: 1,
                bottlenecks: []
            }
        };
    }

    /**
     * Remet à zéro l'état du système
     */
    private resetSystemState(): void {
        // Réinitialiser les métriques globales
        this.systemState.globalMetrics = {
            totalRequests: 0,
            avgSystemResponseTime: 0,
            systemHealth: 1,
            bottlenecks: []
        };

        // Réinitialiser chaque niveau
        for (const level of this.config.enabledLevels) {
            if (this.systemState.levels[level]) {
                this.systemState.levels[level].performanceMetrics = {
                    avgResponseTime: 0,
                    successRate: 1,
                    totalRequests: 0
                };
                this.systemState.levels[level].status = 'active';
                this.systemState.levels[level].load = 0;
                this.systemState.levels[level].lastHeartbeat = new Date();
            }
        }
    }

    /**
     * Met à jour les métriques globales du système
     */
    private updateGlobalMetrics(): void {
        const activeLevels = this.getActiveLevels();
        const totalLevels = activeLevels.length;

        if (totalLevels === 0) {
            this.systemState.globalMetrics.systemHealth = 0;
            return;
        }

        // Calculer la santé globale
        const healthyLevels = activeLevels.filter(level =>
            this.systemState.levels[level]?.status === 'active'
        ).length;

        this.systemState.globalMetrics.systemHealth = healthyLevels / totalLevels;

        // Calculer le temps de réponse moyen global
        const totalResponseTime = activeLevels.reduce((sum, level) => {
            const metrics = this.systemState.levels[level]?.performanceMetrics;
            return sum + (metrics?.avgResponseTime ?? 0);
        }, 0);

        this.systemState.globalMetrics.avgSystemResponseTime = totalResponseTime / totalLevels;

        // Détecter les goulots d'étranglement
        this.systemState.globalMetrics.bottlenecks = this.detectBottlenecks();

        // Calculer le total des requêtes
        this.systemState.globalMetrics.totalRequests = activeLevels.reduce((sum, level) => {
            const metrics = this.systemState.levels[level]?.performanceMetrics;
            return sum + (metrics?.totalRequests ?? 0);
        }, 0);
    }

    /**
     * Valide la configuration du système
     * @throws {Error} Si la configuration est invalide
     */
    private validateConfiguration(): void {
        if (this.config.enabledLevels.length === 0) {
            throw new Error('At least one pyramid level must be enabled');
        }

        for (const level of this.config.enabledLevels) {
            if (level < 1 || level > 7) {
                throw new Error(`Invalid pyramid level: ${level}. Must be between 1 and 7`);
            }
        }

        if (this.config.caching.maxSize < 0) {
            throw new Error('Cache max size must be non-negative');
        }

        if (this.config.caching.ttlMs < 0) {
            throw new Error('Cache TTL must be non-negative');
        }
    }
}