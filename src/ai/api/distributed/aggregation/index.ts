/**
 * src/ai/apidistributed/aggregation/index.ts
 * Module d'agrégation de modèles distribués
 * 
 * Fournit des outils pour agréger les résultats et les modèles
 * provenant de différentes sources dans un environnement distribué
 */

// Exportation des classes principales
export { ModelAggregator } from './ModelAggregator';
export { OptimizedModelAggregator } from './OptimizedModelAggregator';
export { ModelAggregatorFactory, ModelAggregatorConfig } from './ModelAggregatorFactory';
export { WeightCalculator } from './weights/WeightCalculator';
export { MetricsCollectorAdapter } from './adapters/MetricsCollectorAdapter';

// Exportation des interfaces
export { IModelAggregatorFactory } from './interfaces/IModelAggregatorFactory';
export { IExtendedMetricsCollector } from './interfaces/IExtendedMetricsCollector';

// Exportation des types
export {
    AggregationStrategy,
    AggregationState,
    AggregationResult,
    AggregationOptions,
    AggregationMetadata
} from './types/aggregation.types';