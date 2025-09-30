/**
 * Index principal du module d'apprentissage personnalisé
 * 
 * @file src/ai/services/learning/index.ts
 * @module ai/services/learning
 * @description Expose les composants d'apprentissage conformes aux diagrammes d'état
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

// Service principal de parcours personnalisés
export { PersonalizedLearningPath } from './personalization/PersonalizedLearningPath';

// Gestionnaire de cache
export { PathCacheManager } from './personalization/cache/PathCacheManager';

// Service de validation
export {
    PathValidationService,
    PathValidationError,
    VALIDATION_ERROR_CODES
} from './personalization/validation/PathValidationService';

// Avatar Apprenant - Système d'apprentissage inverse CODA virtuel
export {
    AvatarApprenant,
    AVATAR_LEVELS,
    type AvatarLevel
} from './avatars/AvatarApprenant';

// Système d'évaluation CECRL
export {
    EvaluationCECRL,
    CECRL_CATEGORIES,
    type CECRLCategory
} from './evaluation/EvaluationCECRL';

// Types partagés
export type {
    PersonalizedLearningPathModel,
    PathGenerationOptions,
    PathStatistics,
    LearningPathStep,
    CECRLLevel
} from './types/LearningPathTypes';

// Types d'évaluation
export type {
    CECRLEvaluationResult,
    CategoryEvaluationResult,
    EvaluationData
} from './evaluation/EvaluationCECRL';

// Types d'avatar
export type {
    AvatarLearningState,
    AvatarResponse,
    TeachingSession
} from './avatars/AvatarApprenant';