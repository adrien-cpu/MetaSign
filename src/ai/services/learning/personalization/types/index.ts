/**
 * Point d'entrée centralisé pour tous les types des parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/index.ts
 * @module ai/services/learning/personalization/types
 * @description Exports centralisés de tous les types, interfaces, constantes et utilitaires
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ===== TYPES DE BASE =====
export type {
    CECRLLevel,
    StepType,
    StepStatus,
    LearningStyle,
    PathGenerationMode,
    IntensityLevel,
    LSFSkillType,
    DifficultyLevel,
    DurationMinutes,
    StepPriority,
    UniqueId,
    DisplayName,
    Description,
    Metadata,
    ConfigParams
} from './BaseTypes';

export {
    isCECRLLevel,
    isStepType,
    isStepStatus,
    isLearningStyle,
    isPathGenerationMode,
    isIntensityLevel,
    isLSFSkillType,
    normalizeDifficulty,
    normalizeDuration,
    normalizePriority
} from './BaseTypes';

// ===== INTERFACES DES ÉTAPES =====
export type {
    LearningPathStep,
    StepResource,
    ResourceType,
    EvaluationCriterion,
    EvaluationCriterionType,
    StepCompletionResult,
    CriterionResult,
    SkillEvaluationDetail,
    MasteryLevel
} from './StepInterfaces';

export {
    isResourceType,
    isEvaluationCriterionType,
    isMasteryLevel,
    calculateMasteryLevel
} from './StepInterfaces';

// ===== INTERFACES DES PARCOURS =====
export type {
    PersonalizedLearningPathModel,
    LearningPreferences,
    TimeSlot,
    DayOfWeek,
    LearningModality,
    PathCategory,
    PathGenerationOptions,
    StepDistributionConfig,
    PathAdaptationResult,
    PathStatistics,
    PathHistory,
    PathEvent,
    PathEventType,
    ProgressSnapshot
} from './PathInterfaces';

export {
    isDayOfWeek,
    isLearningModality,
    isPathCategory,
    isPathEventType
} from './PathInterfaces';

// ===== CONSTANTES =====
export {
    LEARNING_PATH_CONSTANTS,
    DEFAULT_LEVEL_DURATIONS,
    DEFAULT_STEP_DISTRIBUTIONS,
    DEFAULT_PERSONALIZATION_PARAMS,
    PRESET_CONFIGURATIONS,
    DISPLAY_MAPPINGS,
    SYSTEM_LIMITS
} from './Constants';

// ===== UTILITAIRES =====
export {
    LearningPathTypeUtils,
    LearningPreferencesUtils
} from './TypeUtils';

// ===== EXEMPLES DE CONFIGURATION PRÊTS À L'EMPLOI =====

/**
 * Options de parcours prédéfinies pour différents profils d'utilisateurs
 */
export const EXAMPLE_PATH_OPTIONS = {
    /**
     * Configuration pour un débutant complet en LSF
     */
    beginner: {
        targetLevel: 'A1' as CECRLLevel,
        mode: 'comprehensive' as PathGenerationMode,
        intensity: 2 as IntensityLevel,
        focusAreas: ['basicVocabulary', 'fingerSpelling'] as readonly LSFSkillType[],
        targetDuration: 45,
        includeRevisions: true,
        includeAssessments: true
    },

    /**
     * Configuration pour un apprentissage équilibré
     */
    balanced: {
        targetLevel: 'A2' as CECRLLevel,
        mode: 'balanced' as PathGenerationMode,
        intensity: 3 as IntensityLevel,
        focusAreas: ['basicVocabulary', 'comprehension', 'expression'] as readonly LSFSkillType[],
        targetDuration: 60,
        includeRevisions: true,
        includeAssessments: true
    },

    /**
     * Configuration pour un apprentissage accéléré
     */
    accelerated: {
        targetLevel: 'B1' as CECRLLevel,
        mode: 'fast-track' as PathGenerationMode,
        intensity: 4 as IntensityLevel,
        focusAreas: ['conversationSkills', 'expression', 'comprehension'] as readonly LSFSkillType[],
        targetDuration: 30,
        includeRevisions: false,
        includeAssessments: true
    },

    /**
     * Configuration pour un perfectionnement avancé
     */
    advanced: {
        targetLevel: 'C1' as CECRLLevel,
        mode: 'mastery' as PathGenerationMode,
        intensity: 5 as IntensityLevel,
        focusAreas: ['culturalContext', 'spatialExpression', 'grammaticalStructures'] as readonly LSFSkillType[],
        targetDuration: 90,
        includeRevisions: true,
        includeAssessments: true
    }
} as const;

// ===== CONFIGURATIONS D'ENVIRONNEMENT =====

/**
 * Configuration pour l'environnement de production
 */
export const PROD_PERSONALIZATION_CONFIG = {
    maxCacheSize: SYSTEM_LIMITS.MAX_CACHE_SIZE,
    cacheTTL: SYSTEM_LIMITS.CACHE_TTL,
    enableAutoAdaptation: true,
    enableAutoIdGeneration: true,
    strictValidation: true,
    performanceOptimizations: true
} as const;

/**
 * Configuration pour l'environnement de développement
 */
export const DEV_PERSONALIZATION_CONFIG = {
    maxCacheSize: 100,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    enableAutoAdaptation: true,
    enableAutoIdGeneration: true,
    strictValidation: false,
    performanceOptimizations: false,
    debugMode: true,
    verboseLogging: true
} as const;

/**
 * Configuration pour les tests
 */
export const TEST_PERSONALIZATION_CONFIG = {
    maxCacheSize: 10,
    cacheTTL: 1000, // 1 seconde
    enableAutoAdaptation: false,
    enableAutoIdGeneration: false,
    strictValidation: true,
    performanceOptimizations: false,
    testMode: true,
    mockData: true
} as const;

// ===== FONCTIONS UTILITAIRES RAPIDES =====

/**
 * Validation rapide des options de parcours
 * 
 * @param options Options à valider
 * @returns True si les options sont valides
 * 
 * @example
 * ```typescript
 * import { quickValidatePathOptions } from '@/ai/services/learning/personalization/types';
 * 
 * const isValid = quickValidatePathOptions({
 *     targetLevel: 'A1',
 *     intensity: 3
 * });
 * ```
 */
export const quickValidatePathOptions = LearningPathTypeUtils.quickValidatePathOptions;

/**
 * Estimation rapide de la durée d'un parcours
 * 
 * @param fromLevel Niveau de départ
 * @param toLevel Niveau cible
 * @param intensity Intensité
 * @returns Durée estimée en jours
 * 
 * @example
 * ```typescript
 * import { estimatePathDuration } from '@/ai/services/learning/personalization/types';
 * 
 * const duration = estimatePathDuration('A1', 'A2', 3);
 * ```
 */
export const estimatePathDuration = LearningPathTypeUtils.estimatePathDuration;

/**
 * Génération rapide d'un identifiant unique pour un parcours
 * 
 * @param userId Identifiant de l'utilisateur
 * @param prefix Préfixe optionnel
 * @returns Identifiant unique
 * 
 * @example
 * ```typescript
 * import { generateUniquePathId } from '@/ai/services/learning/personalization/types';
 * 
 * const id = generateUniquePathId('user-123', 'custom');
 * ```
 */
export const generateUniquePathId = LearningPathTypeUtils.generatePathId;

/**
 * Formatage rapide d'un nom de compétence LSF
 * 
 * @param skill Compétence LSF
 * @returns Nom formaté
 * 
 * @example
 * ```typescript
 * import { formatSkillName } from '@/ai/services/learning/personalization/types';
 * 
 * const formatted = formatSkillName('basicVocabulary'); // "Vocabulaire de base"
 * ```
 */
export const formatSkillName = LearningPathTypeUtils.formatSkillName;

/**
 * Normalisation rapide des options de parcours
 * 
 * @param options Options à normaliser
 * @returns Options normalisées
 * 
 * @example
 * ```typescript
 * import { normalizePathOptions } from '@/ai/services/learning/personalization/types';
 * 
 * const normalized = normalizePathOptions({
 *     targetLevel: 'a1', // sera normalisé en 'A1'
 *     intensity: 6 // sera normalisé en 5
 * });
 * ```
 */
export const normalizePathOptions = LearningPathTypeUtils.normalizePathOptions;

// ===== TYPES UTILITAIRES AVANCÉS =====

/**
 * Type utilitaire pour les options de configuration du cache
 */
export interface CacheConfiguration {
    readonly maxCacheSize: number;
    readonly cacheTTL: number;
    readonly enableAutoCleanup: boolean;
    readonly cleanupInterval: number;
}

/**
 * Type utilitaire pour les options de validation
 */
export interface ValidationOptions {
    readonly strictMode: boolean;
    readonly enablePerformanceOptimizations: boolean;
    readonly customValidators: readonly string[];
}

/**
 * Type utilitaire pour les métriques de performance
 */
export interface PerformanceMetrics {
    readonly generationTime: number;
    readonly cacheHitRate: number;
    readonly validationTime: number;
    readonly adaptationTime: number;
}

/**
 * Type utilitaire pour les erreurs de validation
 */
export interface ValidationError {
    readonly field: string;
    readonly message: string;
    readonly code: string;
    readonly severity: 'error' | 'warning' | 'info';
}

/**
 * Type de retour pour les opérations avec validation
 */
export interface ValidationResult<T = unknown> {
    readonly isValid: boolean;
    readonly data?: T;
    readonly errors: readonly ValidationError[];
    readonly warnings: readonly ValidationError[];
}

// ===== DOCUMENTATION DES EXPORTS =====

/**
 * @namespace PersonalizationTypes
 * @description
 * Ce module fournit tous les types, interfaces, constantes et utilitaires
 * nécessaires pour la gestion des parcours d'apprentissage personnalisés LSF.
 * 
 * ## Utilisation recommandée
 * 
 * ```typescript
 * import {
 *     PathGenerationOptions,
 *     PersonalizedLearningPathModel,
 *     LearningPathTypeUtils,
 *     EXAMPLE_PATH_OPTIONS
 * } from '@/ai/services/learning/personalization/types';
 * 
 * // Utilisation d'options prédéfinies
 * const options = EXAMPLE_PATH_OPTIONS.beginner;
 * 
 * // Validation rapide
 * if (LearningPathTypeUtils.quickValidatePathOptions(options)) {
 *     // Générer le parcours
 * }
 * ```
 * 
 * ## Organisation des exports
 * 
 * - **Types de base** : CECRLLevel, StepType, etc.
 * - **Interfaces des étapes** : LearningPathStep, StepResource, etc.
 * - **Interfaces des parcours** : PersonalizedLearningPathModel, PathGenerationOptions, etc.
 * - **Constantes** : LEARNING_PATH_CONSTANTS, DEFAULT_LEVEL_DURATIONS, etc.
 * - **Utilitaires** : LearningPathTypeUtils, LearningPreferencesUtils
 * - **Exemples** : EXAMPLE_PATH_OPTIONS avec configurations prêtes
 * - **Configurations** : PROD_CONFIG, DEV_CONFIG, TEST_CONFIG
 */