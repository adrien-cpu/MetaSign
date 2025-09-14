/**
 * @file index.ts
 * @description Point d'entrée pour tous les hooks d'apprentissage
 * @author MetaSign Team
 * @version 1.0.0
 */

// Hook principal
export { useLearningService } from './useLearningService';

// Hooks spécialisés
export { useExercises } from './useExercises';
export { useUserProfile } from './useUserProfile';
export { useLearningSession } from './useLearningSession';

// Types pour l'interface
export type {
  ExerciseRequest,
  ExerciseResponse,
  EvaluationRequest,
  EvaluationResponse,
  LearningSessionConfig,
  LearningSessionData,
  UserLearningProfile,
  LearningServiceConfig
} from '../services/LearningServiceBridge';