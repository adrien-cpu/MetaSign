/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/index.ts
 * @description Point d'entrée pour tous les transformateurs d'erreurs
 * @author MetaSign
 * @version 1.0.1
 * @since 2025-05-29
 */

// Transformateurs principaux
export { BaseErrorTransformer } from './BaseErrorTransformer';
export { SpatialReferenceTransformer } from './SpatialReferenceTransformer';

// Autres transformateurs (à adapter selon votre structure)
export { ProformeTransformer } from './ProformeTransformer';
export { RhythmTransformer } from './RhythmTransformer';
export { SignOrderTransformer } from './SignOrderTransformer';
export { HandConfigurationTransformer } from './HandConfigurationTransformer';
export { LocationTransformer } from './LocationTransformer';
export { MovementTransformer } from './MovementTransformer';
export { OrientationTransformer } from './OrientationTransformer';
export { FacialExpressionTransformer } from './FacialExpressionTransformer';
export { SyntacticSpaceTransformer } from './SyntacticSpaceTransformer';

// Factory
export { ErrorTransformerFactory } from './ErrorTransformerFactory';

// Types et interfaces des transformateurs
export type {
    ErrorTransformation,
    ErrorCatalogEntry,
    ErrorTransformationType,
    ErrorCategoryType
} from '../types/ErrorTypes';