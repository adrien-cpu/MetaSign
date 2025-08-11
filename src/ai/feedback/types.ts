// src/ai/feedback/types.ts
import { EmotionState } from '@ai/emotions/types/base';

/**
 * Type de source de feedback
 */
export enum FeedbackSourceType {
    USER = 'user',
    SYSTEM = 'system',
    AUTOMATED = 'automated',
    EXPERT = 'expert'
}

/**
 * Niveau de priorité de feedback
 */
export enum FeedbackPriorityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * Type de feedback
 */
export enum FeedbackType {
    EMOTION = 'emotion',
    EXPRESSION = 'expression',
    SIGN = 'sign',
    PERFORMANCE = 'performance',
    LEARNING = 'learning',
    TECHNICAL = 'technical'
}

/**
 * Statut de traitement du feedback
 */
export enum FeedbackStatus {
    NEW = 'new',
    PROCESSING = 'processing',
    ANALYZED = 'analyzed',
    ACTIONED = 'actioned',
    IGNORED = 'ignored',
    ARCHIVED = 'archived'
}

/**
 * Structure représentant un signe LSF
 */
export interface LSFSign {
    /** Identifiant du signe */
    id: string;
    /** Code du signe */
    code: string;
    /** Traduction en français */
    translation: string;
    /** Paramètres du signe */
    parameters?: Record<string, unknown>;
}

/**
 * Contenu d'un feedback
 */
export interface FeedbackContentType {
    /** Feedback sur un signe */
    sign?: LSFSign;
    /** Feedback sur une performance */
    performance?: {
        /** Précision (0-1) */
        accuracy: number;
        /** Fluidité (0-1) */
        fluency: number;
        /** Clarté (0-1) */
        clarity: number;
    };
    /** Feedback sur des émotions */
    emotion?: EmotionState;
}

/**
 * Donnée contextuelle du feedback
 */
export interface FeedbackContext {
    /** Environnement */
    environment?: string;
    /** Utilisateur */
    user?: {
        /** Identifiant utilisateur */
        id: string;
        /** Niveau de compétence */
        skillLevel?: string;
        /** Préférences */
        preferences?: Record<string, unknown>;
    };
    /** Session */
    session?: {
        /** Identifiant de session */
        id: string;
        /** Durée de session (ms) */
        duration?: number;
        /** Type d'activité */
        activityType?: string;
    };
    /** Facteurs temporels */
    temporal?: {
        /** Horodatage */
        timestamp: number;
        /** Activité précédente */
        previousActivity?: string;
        /** Temps depuis dernière interaction (ms) */
        timeSinceLastInteraction?: number;
    };
    /** Informations techniques */
    technical?: {
        /** Plateforme */
        platform: string;
        /** Version */
        version: string;
        /** Appareil */
        device?: string;
    };
    /** Autres informations contextuelles */
    [key: string]: unknown;
}

/**
 * Entrée de feedback
 */
export interface FeedbackEntry {
    /** Identifiant unique */
    id: string;
    /** Horodatage de création */
    timestamp: number;
    /** Type de feedback */
    type: FeedbackType;
    /** Contenu du feedback */
    content: FeedbackContentType;
    /** Source du feedback */
    source: {
        /** Type de source */
        type: FeedbackSourceType;
        /** Identifiant de la source */
        id?: string;
        /** Métadonnées de la source */
        metadata?: Record<string, unknown>;
    };
    /** Niveau de priorité */
    priority: FeedbackPriorityLevel;
    /** Statut de traitement */
    status: FeedbackStatus;
    /** Contexte du feedback */
    context?: FeedbackContext;
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Métriques de qualité
 */
export interface QualityMetrics {
    /** Précision (0-1) */
    accuracy: number;
    /** Cohérence (0-1) */
    consistency: number;
    /** Pertinence (0-1) */
    relevance: number;
    /** Opportunité temporelle (0-1) */
    timeliness: number;
    /** Métriques additionnelles */
    [key: string]: number;
}

/**
 * Pattern identifié
 */
export interface FeedbackPattern {
    /** Type de pattern */
    type: string;
    /** Description */
    description: string;
    /** Confiance (0-1) */
    confidence: number;
    /** Occurrences */
    occurrences: number;
    /** Fréquence */
    frequency?: number;
    /** Contextes associés */
    associatedContexts?: string[];
    /** Données associées */
    data?: Record<string, unknown>;
}

/**
 * Recommandation d'amélioration
 */
export interface FeedbackRecommendation {
    /** Type de recommandation */
    type: string;
    /** Description */
    description: string;
    /** Actions concrètes */
    actions: string[];
    /** Priorité (0-1) */
    priority: number;
    /** Difficulté de mise en œuvre (0-1) */
    difficulty: number;
    /** Impact attendu */
    expectedImpact: {
        /** Impact sur les métriques */
        metrics: Partial<QualityMetrics>;
        /** Description de l'impact */
        description: string;
    };
}

/**
 * Analyse de feedback
 */
export interface FeedbackAnalysis {
    /** Entrée de feedback analysée */
    entry: FeedbackEntry;
    /** Métriques de qualité */
    metrics: QualityMetrics;
    /** Patterns identifiés */
    patterns: FeedbackPattern[];
    /** Recommandations */
    recommendations: FeedbackRecommendation[];
    /** Horodatage de l'analyse */
    timestamp?: number;
    /** Temps d'analyse (ms) */
    analysisTime?: number;
    /** Version de l'analyseur */
    analyzerVersion?: string;
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour les gestionnaires de feedback
 */
export interface IFeedbackHandler {
    /** 
     * Traite une entrée de feedback
     * @param entry Entrée de feedback à traiter
     * @returns Analyse de feedback
     */
    handle(entry: FeedbackEntry): Promise<FeedbackAnalysis>;
}