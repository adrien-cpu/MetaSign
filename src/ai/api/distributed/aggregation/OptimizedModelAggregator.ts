/**
 * src/ai/api/distributed/aggregation/OptimizedModelAggregator.ts
 * 
 * Agrégateur de modèles optimisé pour les systèmes d'apprentissage distribués.
 * Ce composant permet d'agréger des modèles provenant de plusieurs nœuds en utilisant
 * différentes stratégies de pondération et des mécanismes de consensus.
 */

import { Logger } from '@api/common/monitoring/LogService';
import { WeightCalculator } from './weights/WeightCalculator';
import { ConsensusManager } from '../consensus/ConsensusManager';
import {
    NodeTrainingResult,
    AggregatedModel
} from '../types/DistributedTypes';
import {
    AggregationOptions,
    AggregationResult,
    AggregationState,
    AggregationStrategy,
    AggregationMetadata
} from './types/aggregation.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { CacheManager } from './cache/CacheManager';
import { ParameterAggregator } from './aggregators/ParameterAggregator';
import { MetadataAggregator } from './aggregators/MetadataAggregator';
import { ConsensusAdapter } from './adapters/ConsensusAdapter';
import { MetricsRecorder } from './metrics/MetricsRecorder';

/**
 * Interface pour le collecteur de métriques étendu
 */
interface IExtendedMetricsCollector extends IMetricsCollector {
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}

/**
 * Représente une entrée dans le cache avec métadonnées
 */
interface CacheEntry {
    model: AggregatedModel;
    timestamp: number;
    metadata: AggregationMetadata;
}

/**
 * Agrégateur de modèles optimisé avec mise en cache et performances améliorées
 * pour les systèmes d'apprentissage distribué.
 */
export class OptimizedModelAggregator {
    private readonly logger: Logger;
    private readonly weightCalculator: WeightCalculator;
    private readonly consensusManager: ConsensusManager;
    private readonly metricsRecorder: MetricsRecorder;
    private readonly cacheManager: CacheManager<string, CacheEntry>;
    private readonly parameterAggregator: ParameterAggregator;
    private readonly metadataAggregator: MetadataAggregator;
    private readonly consensusAdapter: ConsensusAdapter;
    private readonly defaultStrategy: AggregationStrategy;
    private readonly enableDetailedLogs: boolean;

    // Métriques de performance
    private lastWeightCalculationTime = 0;
    private lastConsensusTime = 0;
    private lastResultFromCache = false;

    /**
     * Crée un nouvel agrégateur de modèles optimisé
     */
    constructor(
        weightCalculator: WeightCalculator,
        consensusManager: ConsensusManager,
        metricsCollector: IExtendedMetricsCollector | undefined,
        config?: AggregatorConfig
    ) {
        this.logger = new Logger('OptimizedModelAggregator');
        this.weightCalculator = weightCalculator;
        this.consensusManager = consensusManager;

        // Configuration
        const cacheExpiryMs = config?.cacheExpiryMs ?? 5 * 60 * 1000; // 5 minutes
        const maxCacheEntries = config?.maxCacheEntries ?? 100;
        this.enableDetailedLogs = config?.enableDetailedLogs ?? false;
        this.defaultStrategy = config?.defaultStrategy ?? 'weighted_average';

        // Initialisation des composants
        this.cacheManager = new CacheManager<string, CacheEntry>(cacheExpiryMs, maxCacheEntries);
        this.parameterAggregator = new ParameterAggregator(this.logger);
        this.metadataAggregator = new MetadataAggregator();
        this.consensusAdapter = new ConsensusAdapter();
        this.metricsRecorder = new MetricsRecorder(metricsCollector);

        if (this.enableDetailedLogs) {
            this.logger.debug('OptimizedModelAggregator initialized', {
                cacheExpiryMs,
                maxCacheEntries,
                defaultStrategy: this.defaultStrategy
            });
        }
    }

    /**
     * Agrège les modèles de plusieurs nœuds avec métriques détaillées
     */
    async aggregateWithMetrics(
        results: NodeTrainingResult[],
        options?: Partial<AggregationOptions>
    ): Promise<AggregationResult<AggregatedModel>> {
        const startTime = Date.now();
        const strategy = options?.strategy ?? this.defaultStrategy;

        try {
            const model = await this.aggregate(results, options);

            const executionTimeMs = Date.now() - startTime;

            return {
                state: AggregationState.COMPLETED,
                data: model,
                modelsCount: results.length,
                strategy,
                confidence: model.consensus.confidence,
                executionTimeMs,
                metrics: {
                    weightCalculationMs: this.lastWeightCalculationTime,
                    consensusMs: this.lastConsensusTime,
                    totalDurationMs: executionTimeMs,
                    cacheHitRate: this.lastResultFromCache ? 1 : 0
                }
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            this.logger.error(`Aggregation failed: ${errorMessage}`, { error });

            return {
                state: AggregationState.FAILED,
                modelsCount: results.length,
                strategy,
                confidence: 0,
                executionTimeMs: Date.now() - startTime,
                error: errorMessage
            };
        }
    }

    /**
     * Agrège les modèles de plusieurs nœuds avec optimisation
     */
    async aggregate(
        results: NodeTrainingResult[],
        options?: Partial<AggregationOptions>
    ): Promise<AggregatedModel> {
        this.validateResults(results, options);
        this.resetPerformanceMetrics();

        const startTime = Date.now();
        const strategy = options?.strategy ?? this.defaultStrategy;
        const cacheKey = this.generateCacheKey(results);

        // Vérifier le cache si pas de timeout spécifié
        if (!options?.timeoutMs) {
            const cachedResult = this.checkCache(cacheKey);
            if (cachedResult) {
                this.lastResultFromCache = true;
                this.metricsRecorder.recordCacheHit(startTime, options?.metricsTags);
                return cachedResult;
            }
        }

        this.metricsRecorder.recordCacheMiss(options?.metricsTags);

        try {
            // Calcul des poids
            const weights = await this.calculateWeights(results, options);

            // Obtenir le consensus
            const consensus = await this.getConsensus(results);
            this.validateConsensus(consensus, options);

            // Agréger les paramètres et métadonnées
            const parameters = this.parameterAggregator.aggregateParameters(results, weights, strategy);
            const metadata = this.metadataAggregator.aggregateMetadata(results, weights, strategy);

            const finalResult: AggregatedModel = {
                parameters,
                metadata,
                consensus
            };

            // Métadonnées pour le cache
            const aggregationMetadata = this.createAggregationMetadata(
                startTime, results, weights, strategy
            );

            // Mettre en cache
            this.cacheResult(cacheKey, finalResult, aggregationMetadata);
            this.metricsRecorder.recordAggregationComplete(startTime, options?.metricsTags);

            this.logAggregationResult(consensus, results, startTime, strategy, options);

            return finalResult;
        } catch (error) {
            this.metricsRecorder.recordError(options?.metricsTags);
            this.handleAggregationError(error);
        }
    }

    /**
     * Valide les résultats d'entrée
     */
    private validateResults(
        results: NodeTrainingResult[],
        options?: Partial<AggregationOptions>
    ): void {
        if (!results || results.length === 0) {
            throw new Error('Cannot aggregate empty results');
        }

        const minRequired = options?.minModelsRequired ?? 1;
        if (results.length < minRequired) {
            throw new Error(`Insufficient models for aggregation: got ${results.length}, required ${minRequired}`);
        }
    }

    /**
     * Réinitialise les métriques de performance
     */
    private resetPerformanceMetrics(): void {
        this.lastWeightCalculationTime = 0;
        this.lastConsensusTime = 0;
        this.lastResultFromCache = false;
    }

    /**
     * Calcule les poids pour les contributions des nœuds
     */
    private async calculateWeights(
        results: NodeTrainingResult[],
        options?: Partial<AggregationOptions>
    ): Promise<Map<string, number>> {
        const weightStart = Date.now();

        const weights = options?.predefinedWeights
            ? new Map(Object.entries(options.predefinedWeights))
            : await this.weightCalculator.calculateWeights(results);

        this.lastWeightCalculationTime = Date.now() - weightStart;
        this.metricsRecorder.recordWeightCalculation(
            this.lastWeightCalculationTime,
            options?.metricsTags
        );

        return weights;
    }

    /**
     * Obtient le consensus pour les résultats
     */
    private async getConsensus(results: NodeTrainingResult[]): Promise<ConsensusResult> {
        const consensusStart = Date.now();

        const consensusResults = this.consensusAdapter.adaptResultsForConsensus(results);
        const consensusInfo = await this.consensusManager.achieveConsensus(consensusResults);
        const consensus = this.consensusAdapter.convertToConsensusResult(consensusInfo);

        this.lastConsensusTime = Date.now() - consensusStart;
        this.metricsRecorder.recordConsensusTime(this.lastConsensusTime);

        return consensus;
    }

    /**
     * Valide le niveau de confiance du consensus
     */
    private validateConsensus(
        consensus: ConsensusResult,
        options?: Partial<AggregationOptions>
    ): void {
        const minConfidence = options?.minConfidenceRequired ?? 0;
        if (consensus.confidence < minConfidence) {
            throw new Error(`Confidence level too low: ${consensus.confidence}, required ${minConfidence}`);
        }
    }

    /**
     * Crée les métadonnées d'agrégation pour le cache
     */
    private createAggregationMetadata(
        startTime: number,
        results: NodeTrainingResult[],
        weights: Map<string, number>,
        strategy: AggregationStrategy
    ): AggregationMetadata {
        return {
            startTimestamp: startTime,
            endTimestamp: Date.now(),
            contributingNodeIds: results.map(r => r.nodeId),
            nodeWeights: Object.fromEntries(weights),
            aggregationMethod: strategy,
            version: `aggr-${Date.now()}-${results.length}`
        };
    }

    /**
     * Journalise le résultat de l'agrégation si les logs détaillés sont activés
     */
    private logAggregationResult(
        consensus: ConsensusResult,
        results: NodeTrainingResult[],
        startTime: number,
        strategy: AggregationStrategy,
        options?: Partial<AggregationOptions>
    ): void {
        if (this.enableDetailedLogs || options?.detailedLogging) {
            this.logger.debug('Model aggregation completed', {
                consensusAchieved: consensus.achieved,
                contributingNodes: results.length,
                strategy,
                durationMs: Date.now() - startTime,
                cacheHit: false
            });
        }
    }

    /**
     * Gère les erreurs d'agrégation
     */
    private handleAggregationError(error: unknown): never {
        if (error instanceof Error) {
            this.logger.error(`Aggregation error: ${error.message}`, { error });
            throw error;
        } else {
            const genericError = new Error('Unknown error during model aggregation');
            this.logger.error(genericError.message);
            throw genericError;
        }
    }

    /**
     * Génère une clé de cache unique pour les résultats
     */
    private generateCacheKey(results: NodeTrainingResult[]): string {
        const sortedResults = [...results].sort((a, b) => a.nodeId.localeCompare(b.nodeId));
        return sortedResults.map(r =>
            `${r.nodeId}:${r.modelVersion}:${r.samplesProcessed}`
        ).join('|');
    }

    /**
     * Vérifie si un résultat mis en cache valide existe
     */
    private checkCache(key: string): AggregatedModel | undefined {
        const cachedEntry = this.cacheManager.get(key);
        return cachedEntry?.model;
    }

    /**
     * Met en cache un résultat d'agrégation
     */
    private cacheResult(
        key: string,
        result: AggregatedModel,
        metadata: AggregationMetadata
    ): void {
        this.cacheManager.set(key, {
            model: result,
            timestamp: Date.now(),
            metadata
        });
        this.metricsRecorder.recordCacheStore();
    }

    /**
     * Vide le cache
     */
    public clearCache(): void {
        const cacheSize = this.cacheManager.size();
        this.cacheManager.clear();
        this.metricsRecorder.recordCacheClear(cacheSize);

        if (this.enableDetailedLogs) {
            this.logger.debug(`Cache cleared, ${cacheSize} entries removed`);
        }
    }

    /**
     * Obtient les statistiques du cache
     */
    public getCacheStats(): Record<string, number> {
        return this.cacheManager.getStats();
    }

    /**
     * Préchauffe le cache avec des résultats prédéfinis
     */
    public preloadCache(data: Record<string, AggregatedModel>): number {
        let loadedCount = 0;

        for (const [key, model] of Object.entries(data)) {
            if (this.isValidAggregatedModel(model)) {
                this.cacheManager.set(key, {
                    model,
                    timestamp: Date.now(),
                    metadata: {
                        startTimestamp: Date.now() - 1000,
                        endTimestamp: Date.now(),
                        contributingNodeIds: model.metadata.contributors || [],
                        nodeWeights: {},
                        aggregationMethod: model.metadata.aggregationMethod || 'weighted_average',
                        version: model.metadata.version
                    }
                });
                loadedCount++;
            }
        }

        this.metricsRecorder.recordCachePreload(loadedCount);

        if (this.enableDetailedLogs) {
            this.logger.debug(`Cache preloaded with ${loadedCount} entries`);
        }

        return loadedCount;
    }

    /**
     * Vérifie si un objet est un modèle agrégé valide
     */
    private isValidAggregatedModel(model: unknown): model is AggregatedModel {
        return Boolean(
            model &&
            typeof model === 'object' &&
            model &&
            'parameters' in model &&
            'metadata' in model &&
            'consensus' in model
        );
    }
}

/**
 * Configuration de l'agrégateur de modèles optimisé
 */
export interface AggregatorConfig {
    /** Temps d'expiration du cache en millisecondes */
    cacheExpiryMs?: number;
    /** Nombre maximal d'entrées dans le cache avant éviction */
    maxCacheEntries?: number;
    /** Activer les logs détaillés */
    enableDetailedLogs?: boolean;
    /** Stratégie d'agrégation par défaut */
    defaultStrategy?: AggregationStrategy;
}

/**
 * Interface pour le résultat du consensus
 * Défini ici pour éviter les imports circulaires
 */
interface ConsensusResult {
    achieved: boolean;
    confidence: number;
    participantCount: number;
    consensusMethod: string;
    votingResults?: Record<string, boolean>;
    decisionReason?: string;
    outliers?: string[];
}