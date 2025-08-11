/**
 * Factory pour créer des agrégateurs de modèles avec différentes configurations
 */
import { ModelAggregator } from './ModelAggregator';
import { OptimizedModelAggregator } from './OptimizedModelAggregator';
import { WeightCalculator } from './weights/WeightCalculator';
import { ConsensusManager } from '../consensus/ConsensusManager';
import { IPerformanceMonitor } from '@api/distributed/monitoring/interfaces/IPerformanceMonitor';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { Logger } from '@common/monitoring/LogService';
import { MetricsCollectorAdapter } from './adapters/MetricsCollectorAdapter';
import { IModelAggregatorFactory } from './interfaces/IModelAggregatorFactory';
import { AggregationStrategy } from './types/aggregation.types';

/**
 * Options de configuration pour l'agrégateur de modèles
 */
export interface ModelAggregatorConfig {
    /**
     * Utiliser l'implémentation optimisée avec des fonctionnalités avancées
     */
    useOptimized: boolean;

    /**
     * Activer la mise en cache des résultats de calcul intermédiaires
     */
    enableCaching: boolean;

    /**
     * Activer la collecte détaillée des métriques
     */
    enableMetrics: boolean;

    /**
     * Nombre maximal de nœuds à traiter en parallèle
     */
    maxParallelNodes?: number;

    /**
     * Taille limite du cache pour les calculs intermédiaires
     */
    cacheSize?: number;

    /**
     * Stratégie d'agrégation à utiliser
     */
    strategy?: AggregationStrategy;

    /**
     * Timeout pour les opérations d'agrégation (ms)
     */
    aggregationTimeoutMs?: number;

    /**
     * Signature d'index permettant des propriétés supplémentaires
     */
    [key: string]: unknown;
}

/**
 * Factory pour créer des agrégateurs de modèles avec différentes configurations
 */
export class ModelAggregatorFactory implements IModelAggregatorFactory {
    private readonly logger: Logger;
    private readonly weightCalculator: WeightCalculator;
    private readonly consensusManager: ConsensusManager;
    private readonly performanceMonitor: IPerformanceMonitor;
    private readonly metricsCollector: IMetricsCollector;

    /**
     * Constructeur
     * 
     * @param weightCalculator - Calculateur de poids pour l'agrégation
     * @param consensusManager - Gestionnaire de consensus
     * @param performanceMonitor - Moniteur de performance
     * @param metricsCollector - Collecteur de métriques
     */
    constructor(
        weightCalculator: WeightCalculator,
        consensusManager: ConsensusManager,
        performanceMonitor: IPerformanceMonitor,
        metricsCollector: IMetricsCollector
    ) {
        this.logger = new Logger('ModelAggregatorFactory');
        this.weightCalculator = weightCalculator;
        this.consensusManager = consensusManager;
        this.performanceMonitor = performanceMonitor;
        this.metricsCollector = metricsCollector;
    }

    /**
     * Crée un agrégateur de modèle en fonction de la configuration
     * 
     * @param config - Configuration de l'agrégateur
     * @returns Agrégateur de modèle standard ou optimisé
     */
    public createAggregator(config: ModelAggregatorConfig): ModelAggregator | OptimizedModelAggregator {
        this.logger.debug('Creating model aggregator', config);

        if (config.useOptimized) {
            this.logger.info('Creating optimized model aggregator');

            // Création d'un adaptateur pour convertir IMetricsCollector en IExtendedMetricsCollector
            const metricsAdapter = new MetricsCollectorAdapter(
                this.metricsCollector,
                this.performanceMonitor
            );

            return new OptimizedModelAggregator(
                this.weightCalculator,
                this.consensusManager,
                metricsAdapter,
                config
            );
        } else {
            this.logger.info('Creating standard model aggregator');
            return new ModelAggregator(
                this.weightCalculator,
                this.consensusManager,
                config
            );
        }
    }

    /**
     * Crée un agrégateur de modèle par défaut avec les paramètres recommandés
     * 
     * @returns Agrégateur de modèle avec configuration par défaut
     */
    public createDefaultAggregator(): ModelAggregator | OptimizedModelAggregator {
        return this.createAggregator({
            useOptimized: true,
            enableCaching: true,
            enableMetrics: true,
            maxParallelNodes: 4,
            cacheSize: 50,
            strategy: 'weighted_average',
            aggregationTimeoutMs: 30000 // 30 secondes
        });
    }

    /**
     * Crée un agrégateur de modèle léger pour les environnements contraints
     * 
     * @returns Agrégateur de modèle standard léger
     */
    public createLightweightAggregator(): ModelAggregator {
        return new ModelAggregator(
            this.weightCalculator,
            this.consensusManager,
            {
                useOptimized: false,
                enableCaching: false,
                enableMetrics: false,
                maxParallelNodes: 1,
                strategy: 'simple_average'
            }
        );
    }

    /**
     * Crée un agrégateur de modèle haute précision pour les tâches critiques
     * 
     * @returns Agrégateur de modèle optimisé pour la précision
     */
    public createHighPrecisionAggregator(): OptimizedModelAggregator {
        // Création d'un adaptateur pour convertir IMetricsCollector en IExtendedMetricsCollector
        const metricsAdapter = new MetricsCollectorAdapter(
            this.metricsCollector,
            this.performanceMonitor
        );

        return new OptimizedModelAggregator(
            this.weightCalculator,
            this.consensusManager,
            metricsAdapter,
            {
                useOptimized: true,
                enableCaching: true,
                enableMetrics: true,
                maxParallelNodes: 8,
                cacheSize: 100,
                strategy: 'confidence_weighted',
                aggregationTimeoutMs: 60000 // 60 secondes
            }
        );
    }
}