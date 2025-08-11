/**
 * @file: src/ai/coordinators/services/CacheService.ts
 * 
 * Service de cache pour l'orchestrateur
 * Gère les opérations de cache avec la logique métier associée
 */

import { MultiLevelCache } from '@ai/performance/cache/MultiLevelCache';
import { LSFRequest, OrchestrationResult } from '@ai/coordinators/types/orchestrator.types';
import { Logger } from '@ai/utils/Logger';
import { MetricsCollector } from '@ai/coordinators/services/MetricsCollector';
import { RequestType } from '@ai/coordinators/types';
import { CacheError } from '@ai/coordinators/errors/orchestrator.errors';

/**
 * Interface pour les options de cache
 */
export interface CacheServiceOptions {
    enabled: boolean;
    l1Size: number;
    l2Size: number;
    enablePredictiveCache: boolean;
    defaultTTL: number;
    compressionEnabled: boolean;
}

/**
 * Service de cache pour l'orchestrateur
 * Encapsule la logique de cache pour SystemeOrchestrateurCentral
 */
export class CacheService {
    private readonly logger = Logger.getInstance('CacheService');
    private readonly cache: MultiLevelCache<unknown>;
    private readonly metrics: MetricsCollector;

    /**
     * Crée une nouvelle instance du service de cache
     */
    constructor(options: CacheServiceOptions, metrics: MetricsCollector) {
        this.metrics = metrics;
        this.logger.debug('Initializing cache service');

        this.cache = new MultiLevelCache<unknown>({
            l1Size: options.l1Size,
            l2Size: options.l2Size,
            enablePredictiveCache: options.enablePredictiveCache,
            defaultTTL: options.defaultTTL,
            evictionPolicy: 'lru-with-time-decay',
            compressionEnabled: options.compressionEnabled
        });

        this.logger.debug('Cache service initialized successfully');
    }

    /**
     * Vérifie si un résultat est en cache pour une requête donnée
     * @param request Requête à vérifier
     * @returns Résultat en cache ou null si non trouvé
     */
    public async get<T>(request: LSFRequest): Promise<OrchestrationResult<T> | null> {
        try {
            if (!request.noCache) {
                const cacheKey = this.generateCacheKey(request);
                const startTime = Date.now();
                const cached = await this.cache.get<OrchestrationResult<T>>(cacheKey);

                // Enregistrer le temps d'accès au cache
                this.metrics.recordMetric('cache_access_time', Date.now() - startTime);

                if (cached) {
                    this.metrics.recordMetric('cache_hits', 1);
                    return cached as OrchestrationResult<T>;
                }

                this.metrics.recordMetric('cache_misses', 1);
            }
            return null;
        } catch (error) {
            this.logger.warn('Error checking cache', {
                error: error instanceof Error ? error.message : String(error)
            });

            // Enregistrer l'erreur de cache
            this.metrics.recordMetric('cache_errors', 1);
            return null;
        }
    }

    /**
     * Met en cache un résultat d'orchestration
     * @param request Requête associée
     * @param result Résultat à mettre en cache
     */
    public async set<T>(request: LSFRequest, result: OrchestrationResult<T>): Promise<void> {
        if (request.noCache || !result.success) {
            return;
        }

        try {
            const cacheKey = this.generateCacheKey(request);
            const ttl = this.getCacheTTL(request);

            await this.cache.set(cacheKey, result, {
                ttl,
                metadata: {
                    requestType: request.type,
                    timestamp: Date.now()
                }
            });

            this.metrics.recordMetric('cache_sets', 1);
        } catch (error) {
            this.logger.warn('Error setting cache', {
                error: error instanceof Error ? error.message : String(error)
            });

            this.metrics.recordMetric('cache_set_errors', 1);
            throw new CacheError('set', error);
        }
    }

    /**
     * Prépare un résultat mis en cache en mettant à jour ses métriques
     * @param cachedResult Résultat mis en cache
     * @param startTime Temps de début du traitement
     * @returns Résultat préparé
     */
    public prepareCachedResult<T>(cachedResult: OrchestrationResult<T>, startTime: number): OrchestrationResult<T> {
        const executionTime = Date.now() - startTime;

        return {
            ...cachedResult,
            metrics: {
                ...cachedResult.metrics,
                executionTime,
                cacheUsed: true,
                cacheRetrievalTime: executionTime,
                originalExecutionTime: cachedResult.metrics.executionTime,
                cacheTimestamp: cachedResult.metrics.timestamp
            }
        };
    }

    /**
     * Optimise le cache pour un mode spécifique
     * @param mode Mode d'optimisation (speed, precision, latency, balanced)
     */
    public optimizeFor(mode: 'speed' | 'precision' | 'latency' | 'balanced'): void {
        this.logger.info('Optimizing cache for mode', { mode });

        try {
            switch (mode) {
                case 'speed':
                    // Optimisation pour la vitesse
                    this.cache.updateStrategy({
                        cacheFirst: true,
                        aggressiveCaching: true,
                        preloadFrequent: true
                    });
                    break;

                case 'precision':
                    // Optimisation pour la précision
                    this.cache.updateStrategy({
                        cacheFirst: false,
                        strictValidation: true,
                        shorterTTL: true
                    });
                    break;

                case 'latency':
                    // Optimisation pour la latence
                    this.cache.updateStrategy({
                        cacheFirst: true,
                        prefetchingEnabled: true,
                        compressionDisabled: true
                    });
                    break;

                case 'balanced':
                default:
                    // Mode équilibré
                    this.cache.updateStrategy({
                        cacheFirst: true,
                        aggressiveCaching: false,
                        preloadFrequent: true,
                        strictValidation: false
                    });
                    break;
            }

            this.metrics.recordMetric('cache_optimization', 1);
        } catch (error) {
            this.logger.error('Error optimizing cache', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new CacheError('optimize', error);
        }
    }

    /**
     * Nettoie le cache
     * @param ratio Ratio du cache à nettoyer (0-1)
     */
    public cleanup(ratio: number = 0.5): void {
        this.logger.info('Cleaning up cache', { ratio });
        try {
            this.cache.cleanup(ratio);
            this.metrics.recordMetric('cache_cleanup', 1);
        } catch (error) {
            this.logger.error('Error cleaning up cache', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new CacheError('cleanup', error);
        }
    }

    /**
     * Supprime les entrées les moins utilisées du cache
     * @param percentage Pourcentage à supprimer (0-100)
     */
    public clearLeastUsed(percentage: number): void {
        this.logger.info('Clearing least used cache entries', { percentage });
        try {
            this.cache.clearLeastUsed(percentage);
            this.metrics.recordMetric('cache_clear_least_used', 1);
        } catch (error) {
            this.logger.error('Error clearing least used cache entries', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new CacheError('clearLeastUsed', error);
        }
    }

    /**
     * Retourne les métriques du cache
     */
    public getMetrics(): Record<string, number> {
        return this.cache.getMetrics();
    }

    /**
     * Génère une clé de cache unique pour une requête
     * @param request Requête à mettre en cache
     * @returns Clé de cache unique
     */
    private generateCacheKey(request: LSFRequest): string {
        const { type, modality, data, userId } = request;

        // Ignorer les informations temporelles et aléatoires dans la clé
        const stableData = this.removeNonDeterministicData(data);

        // Générer une clé basée sur le hachage
        const dataString = JSON.stringify(stableData);
        const hash = this.simpleHash(dataString);

        return `${type}:${modality}:${userId}:${hash}`;
    }

    /**
     * Supprime les données non déterministes d'un objet pour générer une clé de cache stable
     * @param data Données à traiter
     * @returns Données sans éléments non déterministes
     */
    private removeNonDeterministicData(data: unknown): unknown {
        if (data === null || data === undefined) {
            return data;
        }

        if (typeof data !== 'object') {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.removeNonDeterministicData(item));
        }

        const result: Record<string, unknown> = {};
        const obj = data as Record<string, unknown>;

        // Exclure les propriétés non déterministes comme les timestamps, ids aléatoires, etc.
        const excludedKeys = ['timestamp', 'id', 'requestId', 'sessionId', 'random', 'seed'];

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && !excludedKeys.includes(key)) {
                result[key] = this.removeNonDeterministicData(obj[key]);
            }
        }

        return result;
    }

    /**
     * Fonction de hachage simple pour générer des clés de cache
     * @param str Chaîne à hacher
     * @returns Hachage
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Conversion en un entier 32 bits
        }
        return hash.toString(36);
    }

    /**
     * Détermine la durée de vie du cache selon le type de requête
     * @param request Requête
     * @returns Durée de vie en millisecondes
     */
    private getCacheTTL(request: LSFRequest): number {
        // Valeurs par défaut selon le type de requête
        switch (request.type) {
            case RequestType.TRANSLATION:
                return 24 * 60 * 60 * 1000; // 24h pour les traductions

            case RequestType.EXPRESSION:
                return 12 * 60 * 60 * 1000; // 12h pour les expressions

            case RequestType.ANALYSIS:
                return 4 * 60 * 60 * 1000;  // 4h pour les analyses

            default:
                return 1 * 60 * 60 * 1000;  // 1h par défaut
        }
    }