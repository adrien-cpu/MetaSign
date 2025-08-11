/**
 * Constantes pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/Constants.ts
 * @module ai/services/learning/personalization/types
 * @description Constantes et valeurs par défaut pour la personnalisation des parcours LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    CECRLLevel,
    StepType,
    StepStatus,
    LearningStyle,
    PathGenerationMode,
    LSFSkillType,
    IntensityLevel,
    DayOfWeek,
    LearningModality,
    PathCategory,
    ResourceType,
    EvaluationCriterionType,
    MasteryLevel,
    PathEventType
} from './BaseTypes';

import type { StepDistributionConfig } from './PathInterfaces';

/**
 * Constantes principales pour les parcours d'apprentissage LSF
 */
export const LEARNING_PATH_CONSTANTS = {
    /**
     * Niveaux CECRL supportés pour l'apprentissage de la LSF
     */
    VALID_CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const satisfies readonly CECRLLevel[],

    /**
     * Types d'étapes disponibles dans les parcours
     */
    VALID_STEP_TYPES: ['exercise', 'lesson', 'assessment', 'revision', 'practice'] as const satisfies readonly StepType[],

    /**
     * Statuts possibles pour les étapes
     */
    VALID_STEP_STATUSES: ['pending', 'available', 'completed', 'locked'] as const satisfies readonly StepStatus[],

    /**
     * Styles d'apprentissage supportés
     */
    VALID_LEARNING_STYLES: ['inductive', 'deductive', 'mixed'] as const satisfies readonly LearningStyle[],

    /**
     * Modes de génération de parcours
     */
    VALID_GENERATION_MODES: ['balanced', 'mastery', 'comprehensive', 'fast-track'] as const satisfies readonly PathGenerationMode[],

    /**
     * Compétences LSF principales
     */
    VALID_LSF_SKILLS: [
        'basicVocabulary', 'advancedVocabulary', 'fingerSpelling',
        'grammaticalStructures', 'spatialExpression', 'facialExpressions',
        'culturalContext', 'conversationSkills', 'comprehension', 'expression'
    ] as const satisfies readonly LSFSkillType[],

    /**
     * Niveaux d'intensité supportés
     */
    VALID_INTENSITY_LEVELS: [1, 2, 3, 4, 5] as const satisfies readonly IntensityLevel[],

    /**
     * Jours de la semaine
     */
    VALID_DAYS_OF_WEEK: [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ] as const satisfies readonly DayOfWeek[],

    /**
     * Modalités d'apprentissage
     */
    VALID_LEARNING_MODALITIES: [
        'visual', 'kinesthetic', 'interactive', 'collaborative', 'self_paced', 'guided'
    ] as const satisfies readonly LearningModality[],

    /**
     * Catégories de parcours
     */
    VALID_PATH_CATEGORIES: [
        'beginner', 'intermediate', 'advanced', 'specialized', 'preparation', 'certification', 'cultural', 'professional'
    ] as const satisfies readonly PathCategory[],

    /**
     * Types de ressources pédagogiques
     */
    VALID_RESOURCE_TYPES: [
        'video', 'document', 'interactive', 'audio', 'image', 'simulation', 'quiz', 'external_link'
    ] as const satisfies readonly ResourceType[],

    /**
     * Types de critères d'évaluation
     */
    VALID_EVALUATION_CRITERION_TYPES: [
        'comprehension', 'expression', 'precision', 'fluency', 'grammar', 'vocabulary', 'cultural_context', 'interaction'
    ] as const satisfies readonly EvaluationCriterionType[],

    /**
     * Niveaux de maîtrise
     */
    VALID_MASTERY_LEVELS: [
        'novice', 'beginner', 'intermediate', 'advanced', 'expert'
    ] as const satisfies readonly MasteryLevel[],

    /**
     * Types d'événements de parcours
     */
    VALID_PATH_EVENT_TYPES: [
        'created', 'started', 'step_completed', 'step_failed', 'adapted', 'paused', 'resumed', 'completed', 'archived'
    ] as const satisfies readonly PathEventType[]
} as const;

/**
 * Durées par défaut par niveau CECRL (en jours)
 */
export const DEFAULT_LEVEL_DURATIONS: Readonly<Record<CECRLLevel, number>> = {
    A1: 30,  // 1 mois - Découverte de base
    A2: 45,  // 1.5 mois - Consolidation élémentaire
    B1: 60,  // 2 mois - Indépendance
    B2: 75,  // 2.5 mois - Avancé
    C1: 90,  // 3 mois - Autonomie
    C2: 90   // 3 mois - Maîtrise
} as const;

/**
 * Répartition par défaut des types d'étapes selon le mode
 */
export const DEFAULT_STEP_DISTRIBUTIONS: Readonly<Record<PathGenerationMode, StepDistributionConfig>> = {
    balanced: {
        lesson: 0.3,      // 30% de leçons théoriques
        exercise: 0.4,    // 40% d'exercices pratiques
        practice: 0.15,   // 15% de pratique contextuelle
        assessment: 0.1,  // 10% d'évaluations
        revision: 0.05    // 5% de révisions
    },
    mastery: {
        lesson: 0.2,      // 20% de leçons
        exercise: 0.5,    // 50% d'exercices intensifs
        practice: 0.2,    // 20% de pratique
        assessment: 0.1,  // 10% d'évaluations
        revision: 0.0     // Pas de révisions (focus maîtrise)
    },
    comprehensive: {
        lesson: 0.35,     // 35% de leçons détaillées
        exercise: 0.25,   // 25% d'exercices
        practice: 0.15,   // 15% de pratique
        assessment: 0.15, // 15% d'évaluations
        revision: 0.1     // 10% de révisions
    },
    'fast-track': {
        lesson: 0.15,     // 15% de leçons condensées
        exercise: 0.6,    // 60% d'exercices intensifs
        practice: 0.2,    // 20% de pratique
        assessment: 0.05, // 5% d'évaluations
        revision: 0.0     // Pas de révisions (rapidité)
    }
} as const;

/**
 * Paramètres par défaut pour la personnalisation
 */
export const DEFAULT_PERSONALIZATION_PARAMS = {
    /**
     * Intensité par défaut (modérée)
     */
    DEFAULT_INTENSITY: 3 as IntensityLevel,

    /**
     * Durée de session par défaut en minutes
     */
    DEFAULT_SESSION_DURATION: 30,

    /**
     * Niveau de difficulté par défaut
     */
    DEFAULT_DIFFICULTY: 0.5,

    /**
     * Seuil de progression minimal pour débloquer les étapes suivantes
     */
    MIN_PROGRESS_THRESHOLD: 0.8,

    /**
     * Nombre maximum de prérequis par étape
     */
    MAX_PREREQUISITES_PER_STEP: 3,

    /**
     * Nombre maximum d'étapes par parcours
     */
    MAX_STEPS_PER_PATH: 100,

    /**
     * Durée minimale d'une étape en minutes
     */
    MIN_STEP_DURATION: 5,

    /**
     * Durée maximale d'une étape en minutes
     */
    MAX_STEP_DURATION: 120,

    /**
     * Score minimum pour valider une étape (sur 100)
     */
    MIN_PASSING_SCORE: 60,

    /**
     * Nombre maximum de tentatives par étape
     */
    MAX_ATTEMPTS_PER_STEP: 3,

    /**
     * Délai de rétention des données d'historique en jours
     */
    HISTORY_RETENTION_DAYS: 365,

    /**
     * Intervalle de sauvegarde automatique en minutes
     */
    AUTO_SAVE_INTERVAL: 5
} as const;

/**
 * Configurations prédéfinies pour différents types d'utilisateurs
 */
export const PRESET_CONFIGURATIONS = {
    /**
     * Configuration pour débutants complets
     */
    ABSOLUTE_BEGINNER: {
        targetLevel: 'A1' as CECRLLevel,
        mode: 'comprehensive' as PathGenerationMode,
        intensity: 2 as IntensityLevel,
        focusAreas: ['basicVocabulary', 'fingerSpelling'] as readonly LSFSkillType[],
        targetDuration: 45,
        includeRevisions: true,
        includeAssessments: true
    },

    /**
     * Configuration pour apprentissage rapide
     */
    FAST_LEARNER: {
        targetLevel: 'B1' as CECRLLevel,
        mode: 'fast-track' as PathGenerationMode,
        intensity: 4 as IntensityLevel,
        focusAreas: ['conversationSkills', 'expression'] as readonly LSFSkillType[],
        targetDuration: 30,
        includeRevisions: false,
        includeAssessments: true
    },

    /**
     * Configuration pour perfectionnement
     */
    ADVANCED_USER: {
        targetLevel: 'C1' as CECRLLevel,
        mode: 'mastery' as PathGenerationMode,
        intensity: 5 as IntensityLevel,
        focusAreas: ['culturalContext', 'spatialExpression', 'grammaticalStructures'] as readonly LSFSkillType[],
        targetDuration: 90,
        includeRevisions: true,
        includeAssessments: true
    },

    /**
     * Configuration équilibrée standard
     */
    BALANCED_LEARNER: {
        targetLevel: 'A2' as CECRLLevel,
        mode: 'balanced' as PathGenerationMode,
        intensity: 3 as IntensityLevel,
        focusAreas: ['basicVocabulary', 'comprehension', 'expression'] as readonly LSFSkillType[],
        targetDuration: 60,
        includeRevisions: true,
        includeAssessments: true
    }
} as const;

/**
 * Mappings pour la traduction et l'affichage
 */
export const DISPLAY_MAPPINGS = {
    /**
     * Noms d'affichage pour les niveaux CECRL
     */
    CECRL_LEVEL_NAMES: {
        A1: 'Découverte',
        A2: 'Survie',
        B1: 'Seuil',
        B2: 'Avancé',
        C1: 'Autonome',
        C2: 'Maîtrise'
    } as const satisfies Readonly<Record<CECRLLevel, string>>,

    /**
     * Noms d'affichage pour les types d'étapes
     */
    STEP_TYPE_NAMES: {
        lesson: 'Leçon',
        exercise: 'Exercice',
        practice: 'Pratique',
        assessment: 'Évaluation',
        revision: 'Révision'
    } as const satisfies Readonly<Record<StepType, string>>,

    /**
     * Noms d'affichage pour les compétences LSF
     */
    LSF_SKILL_NAMES: {
        basicVocabulary: 'Vocabulaire de base',
        advancedVocabulary: 'Vocabulaire avancé',
        fingerSpelling: 'Dactylologie',
        grammaticalStructures: 'Structures grammaticales',
        spatialExpression: 'Expression spatiale',
        facialExpressions: 'Expressions faciales',
        culturalContext: 'Contexte culturel',
        conversationSkills: 'Compétences conversationnelles',
        comprehension: 'Compréhension',
        expression: 'Expression'
    } as const satisfies Readonly<Record<LSFSkillType, string>>,

    /**
     * Descriptions des modes de génération
     */
    GENERATION_MODE_DESCRIPTIONS: {
        balanced: 'Approche équilibrée entre théorie et pratique',
        mastery: 'Focus sur la maîtrise complète des compétences',
        comprehensive: 'Apprentissage approfondi et méthodique',
        'fast-track': 'Progression accélérée et intensive'
    } as const satisfies Readonly<Record<PathGenerationMode, string>>
} as const;

/**
 * Seuils et limites du système
 */
export const SYSTEM_LIMITS = {
    /**
     * Taille maximale du cache des parcours
     */
    MAX_CACHE_SIZE: 1000,

    /**
     * TTL du cache en millisecondes (30 minutes)
     */
    CACHE_TTL: 30 * 60 * 1000,

    /**
     * Nombre maximum de parcours par utilisateur
     */
    MAX_PATHS_PER_USER: 10,

    /**
     * Taille maximale d'un nom de parcours en caractères
     */
    MAX_PATH_NAME_LENGTH: 100,

    /**
     * Taille maximale d'une description en caractères
     */
    MAX_DESCRIPTION_LENGTH: 500,

    /**
     * Nombre maximum de tags par parcours
     */
    MAX_TAGS_PER_PATH: 10,

    /**
     * Nombre maximum de compétences focus par parcours
     */
    MAX_FOCUS_AREAS: 5,

    /**
     * Durée maximale d'un parcours en jours
     */
    MAX_PATH_DURATION_DAYS: 365,

    /**
     * Fréquence minimale de sauvegarde en millisecondes
     */
    MIN_SAVE_FREQUENCY: 1000
} as const;