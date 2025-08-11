/**
 * src/ai/api/distributed/fusion/index.ts
 * Point d'entrée du module de fusion
 */

// Exporter l'implémentation principale
export { FusionManager } from './FusionManager';

// Exporter les interfaces
export { IFusionManager } from './interfaces/IFusionManager';
export { IEnhancedMetricsCollector } from './interfaces/IEnhancedMetricsCollector';

// Exporter les types
export {
    FusionStrategy,
    FusionOptions,
    EnhancedProcessingResult,
    EnhancedDistributedResult
} from './types/fusion.types';

// Exporter les types d'erreur
export {
    ValidationError,
    IntegrityError,
    FusionStrategyError,
    FusionTimeoutError
} from './types/errors.types';