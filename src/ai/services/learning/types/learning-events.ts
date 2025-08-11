/**
 * Types pour les événements d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/learning-events.ts
 * @module ai/services/learning/types
 * @description Types centralisés pour le système d'événements d'apprentissage
 * Compatible avec exactOptionalPropertyTypes: true et la structure existante
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

/**
 * Types d'événements d'apprentissage supportés
 */
export type LearningEventType =
    | 'lesson_start'
    | 'lesson_complete'
    | 'lesson_pause'
    | 'lesson_resume'
    | 'exercise_start'
    | 'exercise_complete'
    | 'exercise_failed'
    | 'exercise_retry'
    | 'quiz_start'
    | 'quiz_complete'
    | 'progress_updated'
    | 'level_achieved'
    | 'skill_mastered'
    | 'interaction_recorded'
    | 'error_occurred'
    | 'feedback_provided'
    | 'adaptation_triggered'
    | 'session_start'
    | 'session_end';

/**
 * Statuts possibles d'un événement
 */
export type EventStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'retrying';

/**
 * Niveaux de priorité des événements
 */
export type EventPriority =
    | 'critical'
    | 'high'
    | 'normal'
    | 'low';

/**
 * Interface de base pour les données d'événement
 */
export interface BaseLearningEventData {
    readonly userId: string;
    readonly sessionId: string;
    readonly activityId: string;
    readonly timestamp?: Date;
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Données spécifiques aux événements de leçon
 */
export interface LessonEventData extends BaseLearningEventData {
    readonly lessonId: string;
    readonly progress?: number;
    readonly duration?: number;
    readonly conceptsCovered?: readonly string[];
}

/**
 * Données spécifiques aux événements d'exercice
 */
export interface ExerciseEventData extends BaseLearningEventData {
    readonly exerciseId: string;
    readonly exerciseType: string;
    readonly result?: number;
    readonly timeSpent?: number;
    readonly attempts?: number;
    readonly correctAnswers?: number;
    readonly totalQuestions?: number;
    readonly hintsUsed?: number;
    readonly errors?: readonly string[];
}

/**
 * Données spécifiques aux événements de quiz
 */
export interface QuizEventData extends BaseLearningEventData {
    readonly quizId: string;
    readonly score?: number;
    readonly maxScore?: number;
    readonly duration?: number;
    readonly questions?: readonly string[];
    readonly answers?: readonly string[];
}

/**
 * Données spécifiques aux événements d'erreur
 */
export interface ErrorEventData extends BaseLearningEventData {
    readonly errorType: string;
    readonly errorMessage: string;
    readonly errorStack?: string;
    readonly errorCode?: string;
    readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * Données spécifiques aux événements de progression
 */
export interface ProgressEventData extends BaseLearningEventData {
    readonly previousLevel?: string;
    readonly newLevel?: string;
    readonly skillsGained?: readonly string[];
    readonly competenciesUnlocked?: readonly string[];
    readonly overallProgress?: number;
}

/**
 * Union type pour toutes les données d'événement
 */
export type LearningEventData =
    | LessonEventData
    | ExerciseEventData
    | QuizEventData
    | ErrorEventData
    | ProgressEventData
    | BaseLearningEventData;

/**
 * Interface complète d'un événement d'apprentissage
 */
export interface LearningEvent {
    readonly id: string;
    readonly type: LearningEventType;
    readonly timestamp: Date;
    readonly priority: EventPriority;
    status: EventStatus;
    readonly data: LearningEventData;
    retryCount: number;
    lastError?: string;
    readonly createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Configuration du gestionnaire d'événements
 */
export interface EventHandlerConfig {
    readonly maxQueueSize: number;
    readonly maxRetries: number;
    readonly retryDelay: number;
    readonly eventRetentionTime: number;
    readonly enableAutoCleanup: boolean;
    readonly cleanupInterval: number;
    readonly metricsEnabled: boolean;
    readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Interface pour les handlers d'événements spécialisés
 */
export interface EventHandler {
    /**
     * Traite un événement spécifique
     */
    handle(event: LearningEvent): Promise<void>;

    /**
     * Indique si ce handler peut traiter le type d'événement donné
     */
    canHandle(eventType: LearningEventType): boolean;

    /**
     * Nom du handler pour identification
     */
    readonly name: string;

    /**
     * Version du handler
     */
    readonly version: string;
}

/**
 * Interface pour les écouteurs d'événements
 */
export interface EventListener {
    /**
     * Appelé quand un événement est émis
     */
    onEvent(event: LearningEvent): Promise<void>;

    /**
     * Types d'événements écoutés
     */
    readonly eventTypes: readonly LearningEventType[];

    /**
     * Nom de l'écouteur pour identification
     */
    readonly name: string;
}

/**
 * Événement spécialisé pour les exercices complétés
 */
export interface ExerciseCompletedEvent extends LearningEvent {
    readonly type: 'exercise_complete';
    readonly data: ExerciseEventData;
}

/**
 * Métriques des événements
 */
export interface EventMetrics {
    readonly totalEvents: number;
    readonly eventsByType: Readonly<Record<LearningEventType, number>>;
    readonly eventsByStatus: Readonly<Record<EventStatus, number>>;
    readonly averageProcessingTime: number;
    readonly errorRate: number;
    readonly retryRate: number;
}

/**
 * Constantes du système d'apprentissage
 */
export const LEARNING_CONSTANTS = {
    DEFAULT_EVENT_HANDLER_CONFIG: {
        maxQueueSize: 1000,
        maxRetries: 3,
        retryDelay: 5000,
        eventRetentionTime: 24 * 60 * 60 * 1000, // 24 heures
        enableAutoCleanup: true,
        cleanupInterval: 60 * 60 * 1000, // 1 heure
        metricsEnabled: true,
        logLevel: 'info' as const
    } satisfies EventHandlerConfig,

    EVENT_PRIORITIES: {
        error_occurred: 'critical' as const,
        session_start: 'high' as const,
        session_end: 'high' as const,
        exercise_complete: 'normal' as const,
        lesson_complete: 'normal' as const,
        progress_updated: 'normal' as const,
        interaction_recorded: 'low' as const
    } satisfies Partial<Record<LearningEventType, EventPriority>>,

    MAX_EVENT_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 jours
    MAX_RETRY_ATTEMPTS: 5,
    DEFAULT_RETRY_DELAY_MS: 1000
} as const;

/**
 * Utilitaires pour les types d'apprentissage
 */
export class LearningTypeUtils {
    /**
     * Génère un identifiant unique pour un événement
     */
    static generateEventId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `event_${timestamp}_${random}`;
    }

    /**
     * Valide si un type d'événement est supporté
     */
    static isValidLearningEventType(type: string): type is LearningEventType {
        const validTypes: readonly string[] = [
            'lesson_start', 'lesson_complete', 'lesson_pause', 'lesson_resume',
            'exercise_start', 'exercise_complete', 'exercise_failed', 'exercise_retry',
            'quiz_start', 'quiz_complete', 'progress_updated', 'level_achieved',
            'skill_mastered', 'interaction_recorded', 'error_occurred',
            'feedback_provided', 'adaptation_triggered', 'session_start', 'session_end'
        ];
        return validTypes.includes(type);
    }

    /**
     * Calcule la priorité d'un événement basé sur son type
     */
    static calculateEventPriority(type: LearningEventType): EventPriority {
        return LEARNING_CONSTANTS.EVENT_PRIORITIES[type as keyof typeof LEARNING_CONSTANTS.EVENT_PRIORITIES] || 'normal';
    }

    /**
     * Valide les données d'un événement
     */
    static validateEventData(data: LearningEventData): boolean {
        if (!data.userId || typeof data.userId !== 'string') {
            return false;
        }
        if (!data.sessionId || typeof data.sessionId !== 'string') {
            return false;
        }
        if (!data.activityId || typeof data.activityId !== 'string') {
            return false;
        }
        return true;
    }

    /**
     * Crée un événement avec des valeurs par défaut
     */
    static createEvent(
        type: LearningEventType,
        data: LearningEventData,
        priority?: EventPriority
    ): LearningEvent {
        const now = new Date();
        return {
            id: this.generateEventId(),
            type,
            timestamp: now,
            priority: priority || this.calculateEventPriority(type),
            status: 'pending',
            data,
            retryCount: 0,
            createdAt: now,
            updatedAt: now
        };
    }

    /**
     * Vérifie si un événement est expiré
     */
    static isEventExpired(event: LearningEvent): boolean {
        const now = Date.now();
        const eventTime = event.timestamp.getTime();
        return (now - eventTime) > LEARNING_CONSTANTS.MAX_EVENT_AGE_MS;
    }

    /**
     * Calcule le délai de retry basé sur le nombre de tentatives
     */
    static calculateRetryDelay(retryCount: number): number {
        const baseDelay = LEARNING_CONSTANTS.DEFAULT_RETRY_DELAY_MS;
        return Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Max 30 secondes
    }
}

/**
 * Factory pour créer des événements typés
 */
export class EventFactory {
    /**
     * Crée un événement d'exercice complété
     */
    static createExerciseCompletedEvent(
        userId: string,
        sessionId: string,
        exerciseId: string,
        result: number,
        timeSpent: number
    ): ExerciseCompletedEvent {
        const data: ExerciseEventData = {
            userId,
            sessionId,
            activityId: exerciseId,
            exerciseId,
            exerciseType: 'standard',
            result,
            timeSpent,
            attempts: 1
        };

        return LearningTypeUtils.createEvent('exercise_complete', data) as ExerciseCompletedEvent;
    }

    /**
     * Crée un événement d'erreur
     */
    static createErrorEvent(
        userId: string,
        sessionId: string,
        activityId: string,
        errorType: string,
        errorMessage: string
    ): LearningEvent {
        const data: ErrorEventData = {
            userId,
            sessionId,
            activityId,
            errorType,
            errorMessage
        };

        return LearningTypeUtils.createEvent('error_occurred', data, 'critical');
    }
}