/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/index.ts
 * @description Point d'entrée pour tous les composants de transformation d'espace syntaxique
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

// Types et interfaces
export * from './types/SpaceTransformationTypes';

// Validateur principal
export { SyntacticSpaceValidator } from './SyntacticSpaceValidator';

// Stratégies de transformation
export { ZoneTransformationStrategy } from './strategies/ZoneTransformationStrategy';

// Factory
export { SpaceTransformationFactory } from './factories/SpaceTransformationFactory';

// Métriques
export { SyntacticSpaceMetrics } from './metrics/SyntacticSpaceMetrics';

// Réexport des types utiles
export type {
    SpaceTransformationContext,
    SpaceTransformationResult,
    SpacePerformanceMetrics,
    SpaceStrategyConfig,
    SpatialTransformationOptions,
    ISpatialValidator,
    ISpatialImpactAnalyzer
} from './types/SpaceTransformationTypes';

export {
    SpatialZoneType,
    SpatialReferenceType,
    DegradationLevel
} from './types/SpaceTransformationTypes';