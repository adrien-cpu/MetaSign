/**
 * Types et interfaces pour les actions de gamification
 * 
 * @file src/ai/services/gamification/types/action.ts
 */

/**
 * Contextes d'action disponibles dans le système
 */
export enum ActionContext {
    LEARNING = 'learning',
    TRANSLATION = 'translation',
    SOCIAL = 'social',
    VALIDATION = 'validation',
    SYSTEM = 'system',
    GLOBAL = 'global'
}

/**
 * Types d'action disponibles dans le système
 */
export enum ActionType {
    // Actions communes
    SESSION_COMPLETED = 'session_completed',
    FEATURE_DISCOVERED = 'feature_discovered',
    STREAK_ACHIEVED = 'streak_achieved',
    CONTENT_CREATED = 'content_created',

    // Actions spécifiques au learning
    EXERCISE_COMPLETED = 'exercise_completed',
    SKILL_MASTERED = 'skill_mastered',
    COURSE_COMPLETED = 'course_completed',

    // Actions spécifiques à la traduction
    TRANSLATION_COMPLETED = 'translation_completed',
    TRANSLATION_VALIDATED = 'translation_validated',

    // Actions sociales
    CONTENT_SHARED = 'content_shared',
    FEEDBACK_PROVIDED = 'feedback_provided',

    // Actions système
    LEVEL_UP = 'level_up',

    // Actions personnalisées
    CUSTOM = 'custom'
}

/**
 * Résultat générique d'une action
 */
export interface ActionResult {
    /**
     * Indique si l'action a réussi
     */
    success: boolean;

    /**
     * Score obtenu (si applicable), entre 0 et 1
     */
    score?: number;

    /**
     * Détails spécifiques à l'action
     */
    details?: Record<string, unknown>;
}

/**
 * Données d'une action de gamification
 */
export interface ActionData {
    /**
     * ID unique de l'action
     */
    actionId: string;

    /**
     * Type d'action
     */
    type: ActionType | string;

    /**
     * Contexte de l'action
     */
    context: ActionContext | string;

    /**
     * Résultat de l'action
     */
    result: ActionResult;

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}