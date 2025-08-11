/**
 * Exports centralisés pour les types du module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/index.ts
 * @module ai/services/learning/types
 * @description Point d'entrée centralisé pour tous les types, utilitaires et constantes
 * Compatible avec exactOptionalPropertyTypes: true et maintient la compatibilité ascendante
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

// ===== IMPORTS POUR USAGE INTERNE =====
import type { UserInteraction } from './interaction';
import type { InteractionType, LearningLevel, LearningDifficulty } from './base';
import { LEARNING_CONSTANTS, LearningConstants } from './constants';
import { InteractionUtils } from './interaction-utils';

// ===== EXPORTS DES ÉNUMÉRATIONS ET TYPES DE BASE =====
export {
    ProfilType,
    InteractionType,
    LearningSessionType,
    LearningSessionState,
    LearningStyle,
    SkillLevel,
    CompetencyLevel,
    ReinforcementType,
    LearningExerciseType,
    LearningLevel,
    LearningMode,
    LearningDifficulty
} from './base';

export type {
    SettingValue,
    RewardItem,
    Badge,
    Exercise
} from './base';

// ===== EXPORTS DES TYPES D'INTERACTION =====
export type {
    DeviceInfo,
    InteractionDetails,
    UserInteraction,
    InteractionFilter,
    InteractionStatistics,
    InteractionServiceConfig,
    InteractionSearchResult,
    InteractionAggregationOptions
} from './interaction';

// ===== EXPORTS DES TYPES D'APPRENTISSAGE =====
export type {
    ExerciseGenerationParams,
    LearningExercise,
    ExerciseContent,
    EvaluationCriteria,
    ExerciseEvaluationResult,
    LearningSession,
    SessionProgress,
    LearningPath,
    LearningRecommendations,
    LearningMetrics
} from './learning';

// ===== EXPORTS DES TYPES UTILISATEUR =====
export type {
    AccessibilityPreferences,
    LearningPreferences,
    LearningGoals,
    BaseUserProfile,
    PersonalInfo,
    LearningProfile,
    ExtendedUserProfile,
    UserProgressData,
    NotificationPreferences,
    UserContext
} from './user';

// ===== EXPORTS DES TYPES DE SESSION =====
export type {
    SessionConfig,
    SessionContext,
    SessionMetrics,
    SessionEvent,
    SessionCacheData,
    SessionCacheConfig,
    SessionSummary,
    SessionManager,
    SessionAdapter,
    SessionFactory
} from './session';

// ===== EXPORTS DES UTILITAIRES =====
export { InteractionUtils } from './interaction-utils';

// ===== EXPORTS DE LA VALIDATION =====
export type {
    ValidationResult,
    ValidationOptions,
    ValidationContext,
    ValidationType
} from './validation';

export { SystemValidator } from './validation';

// ===== EXPORTS DES CONSTANTES =====
export { LEARNING_CONSTANTS, LearningConstants } from './constants';

// ===== UTILITAIRES DE VALIDATION ET MANIPULATION (COMPATIBILITÉ) =====

/**
 * Utilitaires de validation et manipulation des types d'apprentissage
 * Maintient la compatibilité avec l'API existante
 * @namespace LearningTypeUtils
 */
export const LearningTypeUtils = {
    /**
     * Valide une interaction utilisateur
     * @param interaction L'interaction à valider
     * @returns true si l'interaction est valide
     */
    validateUserInteraction(interaction: unknown): interaction is UserInteraction {
        if (!interaction || typeof interaction !== 'object') {
            return false;
        }

        const obj = interaction as Record<string, unknown>;

        return typeof obj.userId === 'string' &&
            obj.timestamp instanceof Date &&
            typeof obj.activityId === 'string' &&
            typeof obj.interactionType === 'string' &&
            LEARNING_CONSTANTS.VALID_INTERACTION_TYPES.includes(obj.interactionType as InteractionType) &&
            typeof obj.duration === 'number' &&
            obj.duration >= 0 &&
            typeof obj.details === 'object' &&
            obj.details !== null &&
            typeof obj.deviceInfo === 'object' &&
            obj.deviceInfo !== null;
    },

    /**
     * Valide un type d'interaction
     * @param type Le type à valider
     * @returns true si le type est valide
     */
    validateInteractionType(type: unknown): type is InteractionType {
        return typeof type === 'string' &&
            LEARNING_CONSTANTS.VALID_INTERACTION_TYPES.includes(type as InteractionType);
    },

    /**
     * Valide un niveau CECRL
     * @param level Le niveau à valider
     * @returns true si le niveau est valide
     */
    validateCECRLevel(level: unknown): level is LearningLevel {
        return typeof level === 'string' &&
            LEARNING_CONSTANTS.VALID_CECRL_LEVELS.includes(level as LearningLevel);
    },

    /**
     * Valide une difficulté
     * @param difficulty La difficulté à valider
     * @returns true si la difficulté est valide
     */
    validateDifficulty(difficulty: unknown): difficulty is LearningDifficulty {
        return typeof difficulty === 'string' &&
            LEARNING_CONSTANTS.VALID_DIFFICULTIES.includes(difficulty as LearningDifficulty);
    },

    /**
     * Calcule les statistiques de base (alias pour compatibilité)
     * @param interactions Liste des interactions
     * @returns Statistiques détaillées
     */
    calculateBasicStatistics: InteractionUtils.calculateBasicStatistics,

    /**
     * Convertit une durée en format lisible (alias pour compatibilité)
     * @param milliseconds Durée en millisecondes
     * @returns Chaîne formatée
     */
    formatDuration: LearningConstants.formatDuration,

    /**
     * Calcule un score de performance normalisé (alias pour compatibilité)
     * @param score Score brut
     * @param maxScore Score maximum possible
     * @returns Score normalisé entre 0 et 1
     */
    normalizeScore: LearningConstants.normalizeScore,

    /**
     * Détermine le niveau de performance basé sur un score (alias pour compatibilité)
     * @param score Score normalisé (0-1)
     * @returns Niveau de performance
     */
    getPerformanceLevel: LearningConstants.getPerformanceLevel,

    /**
     * Crée une interaction utilisateur par défaut
     * @param userId Identifiant de l'utilisateur
     * @param activityId Identifiant de l'activité
     * @param interactionType Type d'interaction
     * @returns Interaction utilisateur par défaut
     */
    createDefaultUserInteraction(
        userId: string,
        activityId: string,
        interactionType: InteractionType
    ): UserInteraction {
        return {
            userId,
            timestamp: new Date(),
            activityId,
            interactionType,
            duration: 0,
            details: {
                screen: 'unknown',
                success: false,
                attempts: 1
            },
            deviceInfo: {
                type: 'desktop',
                os: 'other'
            }
        };
    }
} as const;