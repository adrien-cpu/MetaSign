/**
 * Types spécialisés pour l'apprentissage et les exercices - Module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/learning.ts
 * @module ai/services/learning/types
 * @description Types pour les exercices, sessions d'apprentissage et progression
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

import type {
    LearningExerciseType,
    LearningLevel,
    LearningMode,
    LearningDifficulty,
    LearningSessionType,
    LearningSessionState
} from './base';

/**
 * Paramètres de génération d'exercice
 * @interface ExerciseGenerationParams
 */
export interface ExerciseGenerationParams {
    /** Type d'exercice à générer */
    readonly type: LearningExerciseType;
    /** Niveau CECRL cible */
    readonly level: LearningLevel;
    /** Difficulté relative (0-1) */
    readonly difficulty: number;
    /** Mode d'apprentissage */
    readonly mode?: LearningMode;
    /** Domaines de focus (optionnel) */
    readonly focusAreas?: ReadonlyArray<string>;
    /** Types d'exercices préférés (optionnel) */
    readonly preferredExerciseTypes?: ReadonlyArray<LearningExerciseType>;
    /** Durée cible en millisecondes (optionnel) */
    readonly targetDuration?: number;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Contexte d'apprentissage (optionnel) */
    readonly context?: {
        readonly sessionId?: string;
        readonly previousExercises?: ReadonlyArray<string>;
        readonly userPreferences?: Record<string, unknown>;
    };
}

/**
 * Structure d'un exercice d'apprentissage
 * @interface LearningExercise
 */
export interface LearningExercise {
    /** Identifiant unique de l'exercice */
    readonly id: string;
    /** Type d'exercice */
    readonly type: LearningExerciseType;
    /** Titre de l'exercice */
    readonly title: string;
    /** Description détaillée */
    readonly description: string;
    /** Niveau CECRL */
    readonly level: LearningLevel;
    /** Difficulté relative (0-1) */
    readonly difficulty: number;
    /** Durée estimée en millisecondes */
    readonly estimatedDuration: number;
    /** Instructions pour l'utilisateur */
    readonly instructions: string;
    /** Contenu de l'exercice */
    readonly content: ExerciseContent;
    /** Critères d'évaluation */
    readonly evaluationCriteria: EvaluationCriteria;
    /** Métadonnées de l'exercice */
    readonly metadata: {
        readonly createdAt: Date;
        readonly updatedAt: Date;
        readonly version: string;
        readonly tags: ReadonlyArray<string>;
        readonly conceptIds: ReadonlyArray<string>;
    };
}

/**
 * Contenu d'un exercice (structure flexible)
 * @interface ExerciseContent
 */
export interface ExerciseContent {
    /** Question ou énoncé principal */
    readonly question: string;
    /** Options pour les exercices à choix multiples (optionnel) */
    readonly options?: ReadonlyArray<{
        readonly id: string;
        readonly text: string;
        readonly isCorrect: boolean;
    }>;
    /** Éléments pour drag & drop (optionnel) */
    readonly draggableItems?: ReadonlyArray<{
        readonly id: string;
        readonly content: string;
        readonly targetZone: string;
    }>;
    /** Médias associés (optionnel) */
    readonly media?: {
        readonly images?: ReadonlyArray<string>;
        readonly videos?: ReadonlyArray<string>;
        readonly audio?: ReadonlyArray<string>;
    };
    /** Données spécifiques au type d'exercice (optionnel) */
    readonly typeSpecificData?: Record<string, unknown>;
}

/**
 * Critères d'évaluation d'un exercice
 * @interface EvaluationCriteria
 */
export interface EvaluationCriteria {
    /** Score maximum possible */
    readonly maxScore: number;
    /** Seuil de réussite (0-1) */
    readonly passingThreshold: number;
    /** Critères de notation */
    readonly scoringRules: ReadonlyArray<{
        readonly criterion: string;
        readonly weight: number;
        readonly description: string;
    }>;
    /** Temps limite en millisecondes (optionnel) */
    readonly timeLimit?: number;
    /** Nombre maximum de tentatives (optionnel) */
    readonly maxAttempts?: number;
}

/**
 * Résultat d'évaluation d'un exercice
 * @interface ExerciseEvaluationResult
 */
export interface ExerciseEvaluationResult {
    /** Identifiant de l'exercice évalué */
    readonly exerciseId: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Score obtenu */
    readonly score: number;
    /** Score maximum possible */
    readonly maxScore: number;
    /** Pourcentage de réussite */
    readonly percentage: number;
    /** Indique si l'exercice est réussi */
    readonly passed: boolean;
    /** Temps pris pour compléter */
    readonly completionTime: number;
    /** Nombre de tentatives utilisées */
    readonly attemptsUsed: number;
    /** Feedback détaillé */
    readonly feedback: {
        readonly summary: string;
        readonly strengths: ReadonlyArray<string>;
        readonly improvements: ReadonlyArray<string>;
        readonly suggestions: ReadonlyArray<string>;
    };
    /** Horodatage de l'évaluation */
    readonly evaluatedAt: Date;
}

/**
 * Session d'apprentissage complète
 * @interface LearningSession
 */
export interface LearningSession {
    /** Identifiant unique de la session */
    readonly id: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Type de session */
    readonly type: LearningSessionType;
    /** État actuel de la session */
    readonly state: LearningSessionState;
    /** Titre de la session */
    readonly title: string;
    /** Description de la session */
    readonly description: string;
    /** Niveau CECRL cible */
    readonly targetLevel: LearningLevel;
    /** Mode d'apprentissage */
    readonly mode: LearningMode;
    /** Exercices de la session */
    readonly exercises: ReadonlyArray<LearningExercise>;
    /** Progression actuelle */
    readonly progress: SessionProgress;
    /** Métadonnées de session */
    readonly metadata: {
        readonly startedAt: Date;
        readonly updatedAt: Date;
        readonly completedAt?: Date;
        readonly estimatedDuration: number;
        readonly actualDuration?: number;
    };
}

/**
 * Progression dans une session d'apprentissage
 * @interface SessionProgress
 */
export interface SessionProgress {
    /** Exercices complétés */
    readonly completedExercises: ReadonlyArray<string>;
    /** Exercice actuellement en cours (optionnel) */
    readonly currentExercise?: string;
    /** Pourcentage de progression (0-1) */
    readonly progressPercentage: number;
    /** Score global de la session */
    readonly overallScore: number;
    /** Scores détaillés par exercice */
    readonly exerciseScores: Record<string, number>;
    /** Temps total passé */
    readonly totalTimeSpent: number;
    /** Statistiques de performance */
    readonly performanceStats: {
        readonly averageScore: number;
        readonly successRate: number;
        readonly averageCompletionTime: number;
        readonly strugglingAreas: ReadonlyArray<string>;
        readonly strengths: ReadonlyArray<string>;
    };
}

/**
 * Parcours d'apprentissage personnalisé
 * @interface LearningPath
 */
export interface LearningPath {
    /** Identifiant unique du parcours */
    readonly id: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Titre du parcours */
    readonly title: string;
    /** Description du parcours */
    readonly description: string;
    /** Niveau de départ */
    readonly startLevel: LearningLevel;
    /** Niveau cible */
    readonly targetLevel: LearningLevel;
    /** Sessions du parcours */
    readonly sessions: ReadonlyArray<LearningSession>;
    /** Progression globale */
    readonly overallProgress: {
        readonly completedSessions: number;
        readonly totalSessions: number;
        readonly progressPercentage: number;
        readonly estimatedTimeRemaining: number;
    };
    /** Métadonnées du parcours */
    readonly metadata: {
        readonly createdAt: Date;
        readonly updatedAt: Date;
        readonly lastAccessedAt: Date;
        readonly isActive: boolean;
        readonly difficulty: LearningDifficulty;
    };
}

/**
 * Recommandations d'apprentissage
 * @interface LearningRecommendations
 */
export interface LearningRecommendations {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Exercices recommandés */
    readonly recommendedExercises: ReadonlyArray<{
        readonly exerciseId: string;
        readonly priority: number;
        readonly reason: string;
        readonly estimatedBenefit: number;
    }>;
    /** Sessions recommandées */
    readonly recommendedSessions: ReadonlyArray<{
        readonly sessionType: LearningSessionType;
        readonly description: string;
        readonly priority: number;
        readonly estimatedDuration: number;
    }>;
    /** Domaines à améliorer */
    readonly improvementAreas: ReadonlyArray<{
        readonly area: string;
        readonly priority: number;
        readonly suggestions: ReadonlyArray<string>;
    }>;
    /** Horodatage des recommandations */
    readonly generatedAt: Date;
    /** Validité des recommandations */
    readonly validUntil: Date;
}

/**
 * Métriques d'apprentissage
 * @interface LearningMetrics
 */
export interface LearningMetrics {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Période couverte */
    readonly period: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
    /** Temps total d'apprentissage */
    readonly totalLearningTime: number;
    /** Nombre de sessions complétées */
    readonly completedSessions: number;
    /** Nombre d'exercices complétés */
    readonly completedExercises: number;
    /** Score moyen */
    readonly averageScore: number;
    /** Taux de réussite */
    readonly successRate: number;
    /** Progression par niveau */
    readonly levelProgress: Record<LearningLevel, {
        readonly exercisesCompleted: number;
        readonly averageScore: number;
        readonly timeSpent: number;
    }>;
    /** Tendances d'apprentissage */
    readonly trends: {
        readonly scoreImprovement: number;
        readonly speedImprovement: number;
        readonly consistencyScore: number;
    };
}