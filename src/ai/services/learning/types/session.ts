/**
 * Types spécialisés pour les sessions d'apprentissage - Module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/session.ts
 * @module ai/services/learning/types
 * @description Types pour la gestion des sessions, cache et contexte d'apprentissage
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-07-01
 * @requires ./base - Énumérations de base pour l'apprentissage
 * @requires ./interaction - Types d'interaction utilisateur
 */

import type {
    LearningSessionType,
    LearningLevel,
    LearningMode
} from './base';
import type { UserInteraction } from './interaction';

/**
 * Configuration d'une session d'apprentissage
 * @interface SessionConfig
 * @description Définit les paramètres et comportements d'une session d'apprentissage
 * @example
 * ```typescript
 * const config: SessionConfig = {
 *   type: 'guided',
 *   mode: 'standard',
 *   targetLevel: 'A1',
 *   passingThreshold: 0.8,
 *   adaptiveSettings: {
 *     enabled: true,
 *     adjustDifficulty: true,
 *     adjustPacing: false,
 *     considerUserFatigue: true
 *   }
 * };
 * ```
 */
export interface SessionConfig {
    /** Type de session */
    readonly type: LearningSessionType;
    /** Mode d'apprentissage */
    readonly mode: LearningMode;
    /** Niveau cible */
    readonly targetLevel: LearningLevel;
    /** Durée maximale en millisecondes (optionnel) */
    readonly maxDuration?: number;
    /** Nombre maximum d'exercices (optionnel) */
    readonly maxExercises?: number;
    /** Seuil de réussite pour passer au suivant (0-1) */
    readonly passingThreshold: number;
    /** Configuration d'adaptation automatique */
    readonly adaptiveSettings: {
        readonly enabled: boolean;
        readonly adjustDifficulty: boolean;
        readonly adjustPacing: boolean;
        readonly considerUserFatigue: boolean;
    };
    /** Configuration des pauses (optionnel) */
    readonly breakConfig?: {
        readonly enableAutoBreaks: boolean;
        readonly breakInterval: number;
        readonly breakDuration: number;
    };
}

/**
 * Contexte d'une session d'apprentissage
 * @interface SessionContext
 * @description Contient toutes les informations contextuelles d'une session active
 */
export interface SessionContext {
    /** Identifiant unique de la session */
    readonly sessionId: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Configuration de la session */
    readonly config: SessionConfig;
    /** Variables de contexte dynamiques */
    readonly variables: {
        readonly currentExerciseIndex: number;
        readonly totalExercises: number;
        readonly consecutiveCorrect: number;
        readonly consecutiveIncorrect: number;
        readonly userFatigueLevel: number;
        readonly adaptationHistory: ReadonlyArray<{
            readonly timestamp: Date;
            readonly adjustment: string;
            readonly reason: string;
        }>;
    };
    /** État temporel de la session */
    readonly sessionState: {
        readonly startTime: Date;
        readonly lastActivityTime: Date;
        readonly pausedTime?: Date;
        readonly estimatedEndTime?: Date;
        readonly isOnBreak: boolean;
    };
}

/**
 * Métriques de session en temps réel
 * @interface SessionMetrics
 * @description Agrège les performances et indicateurs d'une session active
 */
export interface SessionMetrics {
    /** Identifiant de la session */
    readonly sessionId: string;
    /** Temps écoulé depuis le début (ms) */
    readonly elapsedTime: number;
    /** Temps effectif d'apprentissage hors pauses (ms) */
    readonly activeTime: number;
    /** Nombre d'exercices complétés */
    readonly exercisesCompleted: number;
    /** Score moyen de la session (0-1) */
    readonly averageScore: number;
    /** Taux de réussite actuel (0-1) */
    readonly currentSuccessRate: number;
    /** Vitesse moyenne de réponse (ms) */
    readonly averageResponseTime: number;
    /** Niveau d'engagement estimé (0-1) */
    readonly engagementLevel: number;
    /** Indice de fatigue estimé (0-1) */
    readonly fatigueIndex: number;
    /** Progression vers l'objectif (0-1) */
    readonly progressToGoal: number;
    /** Prédiction de réussite de la session (0-1) */
    readonly successPrediction: number;
}

/**
 * Événement de session
 * @interface SessionEvent
 * @description Représente un événement significatif dans le cycle de vie d'une session
 */
export interface SessionEvent {
    /** Identifiant unique de l'événement */
    readonly id: string;
    /** Identifiant de la session */
    readonly sessionId: string;
    /** Type d'événement */
    readonly type: SessionEventType;
    /** Horodatage de l'événement */
    readonly timestamp: Date;
    /** Données spécifiques à l'événement */
    readonly data: Record<string, unknown>;
    /** Contexte additionnel de l'événement (optionnel) */
    readonly context?: {
        readonly exerciseId?: string;
        readonly score?: number;
        readonly duration?: number;
        readonly userAction?: string;
        readonly adaptationTriggered?: boolean;
    };
}

/**
 * Types d'événements de session possibles
 * @type SessionEventType
 */
export type SessionEventType =
    | 'start'
    | 'pause'
    | 'resume'
    | 'complete'
    | 'abandon'
    | 'exercise_start'
    | 'exercise_complete'
    | 'break_start'
    | 'break_end'
    | 'adaptation'
    | 'milestone_reached'
    | 'threshold_exceeded';

/**
 * Données de cache pour les sessions
 * @interface SessionCacheData
 * @description Structure pour le stockage en cache des données de session
 */
export interface SessionCacheData {
    /** Identifiant de la session */
    readonly sessionId: string;
    /** État sérialisé de la session */
    readonly sessionState: string;
    /** Métadonnées de cache */
    readonly cacheMetadata: {
        readonly createdAt: Date;
        readonly lastAccessed: Date;
        readonly hitCount: number;
        readonly size: number;
        readonly ttl: number;
    };
    /** Données d'exercices en cache */
    readonly exerciseData: Record<string, unknown>;
    /** Interactions mises en cache */
    readonly cachedInteractions: ReadonlyArray<UserInteraction>;
    /** Configuration de compression (optionnel) */
    readonly compression?: {
        readonly algorithm: 'gzip' | 'deflate' | 'none';
        readonly originalSize: number;
        readonly compressedSize: number;
    };
}

/**
 * Configuration du cache de session
 * @interface SessionCacheConfig
 * @description Paramètres pour la gestion du cache des sessions
 */
export interface SessionCacheConfig {
    /** Taille maximale du cache en Mo */
    readonly maxSizeInMB: number;
    /** TTL par défaut en millisecondes */
    readonly defaultTTL: number;
    /** Stratégie d'éviction mémoire */
    readonly evictionStrategy: 'lru' | 'lfu' | 'fifo' | 'random';
    /** Activation de la compression */
    readonly enableCompression: boolean;
    /** Intervalle de nettoyage automatique (ms) */
    readonly cleanupInterval: number;
    /** Seuil de prévention de débordement (0-1) */
    readonly overflowThreshold: number;
    /** Configuration de persistance (optionnel) */
    readonly persistence?: {
        readonly enabled: boolean;
        readonly storageType: 'memory' | 'disk' | 'hybrid';
        readonly syncInterval: number;
    };
}

/**
 * Résumé de session complétée
 * @interface SessionSummary
 * @description Synthèse complète d'une session terminée
 */
export interface SessionSummary {
    /** Identifiant de la session */
    readonly sessionId: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Configuration utilisée */
    readonly config: SessionConfig;
    /** Métriques finales */
    readonly finalMetrics: SessionMetrics;
    /** Analyse de performance globale */
    readonly performance: {
        readonly overallScore: number;
        readonly successRate: number;
        readonly timeEfficiency: number;
        readonly improvementRate: number;
        readonly consistencyScore: number;
    };
    /** Événements majeurs de la session */
    readonly majorEvents: ReadonlyArray<SessionEvent>;
    /** Analyse qualitative de la session */
    readonly analysis: {
        readonly strengths: ReadonlyArray<string>;
        readonly weaknesses: ReadonlyArray<string>;
        readonly recommendations: ReadonlyArray<string>;
        readonly nextSteps: ReadonlyArray<string>;
    };
    /** Données de comparaison */
    readonly comparison: {
        readonly personalBest: boolean;
        readonly averageComparison: number;
        readonly improvementFromPrevious: number;
        readonly rankInPeerGroup?: number;
    };
}

/**
 * Interface pour la gestion des sessions
 * @interface SessionManager
 * @description Contrat pour l'implémentation d'un gestionnaire de sessions
 */
export interface SessionManager {
    /** Démarre une nouvelle session */
    startSession(userId: string, config: SessionConfig): Promise<SessionContext>;
    /** Met en pause une session active */
    pauseSession(sessionId: string): Promise<boolean>;
    /** Reprend une session en pause */
    resumeSession(sessionId: string): Promise<boolean>;
    /** Termine une session et génère le résumé */
    completeSession(sessionId: string): Promise<SessionSummary>;
    /** Abandonne une session avec raison optionnelle */
    abandonSession(sessionId: string, reason?: string): Promise<boolean>;
    /** Obtient le contexte actuel d'une session */
    getSessionContext(sessionId: string): Promise<SessionContext | undefined>;
    /** Met à jour les métriques de session */
    updateMetrics(sessionId: string, newData: Partial<SessionMetrics>): Promise<boolean>;
    /** Enregistre un événement de session */
    recordEvent(sessionId: string, event: Omit<SessionEvent, 'id' | 'timestamp'>): Promise<boolean>;
}

/**
 * Adaptateur de session pour différents types d'apprentissage
 * @interface SessionAdapter
 * @description Permet l'adaptation dynamique selon le type de session
 */
export interface SessionAdapter {
    /** Type de session supporté */
    readonly supportedType: LearningSessionType;
    /** Adapte la configuration selon le contexte */
    adaptConfig(config: SessionConfig, context: SessionContext): SessionConfig;
    /** Calcule les métriques spécifiques au type */
    calculateSpecificMetrics(context: SessionContext): Record<string, number>;
    /** Détermine si une adaptation est nécessaire */
    shouldAdapt(context: SessionContext, metrics: SessionMetrics): boolean;
    /** Applique une adaptation avec justification */
    applyAdaptation(context: SessionContext, adaptationType: string): SessionContext;
}

/**
 * Factory pour créer des sessions selon le type
 * @interface SessionFactory
 * @description Interface pour la création de sessions typées
 */
export interface SessionFactory {
    /** Crée une session guidée avec tuteur IA */
    createGuidedSession(userId: string, level: LearningLevel): Promise<SessionContext>;
    /** Crée une session libre d'exploration */
    createFreeSession(userId: string, preferences: Record<string, unknown>): Promise<SessionContext>;
    /** Crée une session d'évaluation certifiante */
    createAssessmentSession(userId: string, targetLevel: LearningLevel): Promise<SessionContext>;
    /** Crée une session immersive avec scénarios */
    createImmersiveSession(userId: string, scenario: string): Promise<SessionContext>;
    /** Crée une session de révision ciblée */
    createReviewSession(userId: string, topicsToReview: ReadonlyArray<string>): Promise<SessionContext>;
}