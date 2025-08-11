/**
 * @file src/ai/services/learning/human/evaluation/types.ts
 * @description Types pour le module d'évaluation de l'apprentissage
 * @module services/learning/human/evaluation/types
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

// Type d'une valeur de réponse
export type AnswerValue = string | number | boolean | string[] | Record<string, unknown> | null | number[] | Date | undefined;

// Interface pour l'évaluation d'une réponse
export interface AnswerEvaluation {
    questionId: string;
    conceptId: string;
    userAnswer: AnswerValue;
    expectedAnswer: AnswerValue;
    score: number;
    maxScore: number;
    feedback: string;
    correct: boolean;
}

/**
 * @enum ComprehensionLevel
 * @description Niveaux de compréhension d'un concept
 */
export enum ComprehensionLevel {
    UNKNOWN = 'unknown',
    VERY_LOW = 'very_low',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    MASTERY = 'mastery'
}

/**
 * @interface EvaluationConfig
 * @description Configuration pour l'évaluateur de compréhension
 */
export interface EvaluationConfig {
    /**
     * Seuil de confiance pour les prédictions (0-1)
     */
    confidenceThreshold: number;

    /**
     * Seuil de score pour considérer un concept comme maîtrisé
     */
    masteryThreshold?: number;

    /**
     * Nombre maximum de recommandations à générer
     */
    maxRecommendations?: number;
}

/**
 * @interface ConceptEvaluation
 * @description Évaluation d'un concept spécifique
 */
export interface ConceptEvaluation {
    /**
     * Identifiant du concept
     */
    conceptId: string;

    /**
     * Score de compréhension (0-100)
     */
    score: number;

    /**
     * Niveau de compréhension
     */
    level: ComprehensionLevel;

    /**
     * Confiance dans l'évaluation (0-1)
     */
    confidence: number;

    /**
     * Dernière pratique du concept
     */
    lastPracticed: Date | null;

    /**
     * Nombre de fois que le concept a été pratiqué
     */
    practiceCount: number;

    /**
     * Tendance de progression
     */
    trend: 'improving' | 'stable' | 'declining';

    /**
     * Taux d'oubli prévu
     */
    predictedForgettingRate: number;
}

/**
 * @interface LearningGap
 * @description Lacune identifiée dans l'apprentissage
 */
export interface LearningGap {
    /**
     * Identifiant du concept concerné
     */
    conceptId: string;

    /**
     * Nom du concept
     */
    conceptName: string;

    /**
     * Score actuel
     */
    score: number;

    /**
     * Statut de la lacune
     */
    status: 'identified' | 'in_progress' | 'addressed' | 'resolved';

    /**
     * Priorité (1-10, 10 étant la plus haute)
     */
    priority: number;

    /**
     * Prérequis faibles associés
     */
    weakPrerequisites: string[];

    /**
     * Date d'identification
     */
    identifiedAt: Date;

    /**
     * Date de résolution (si applicable)
     */
    resolvedAt?: Date;

    /**
     * Ressources recommandées
     */
    recommendedResources: string[];
}

/**
 * @interface ComprehensionEvaluationResult
 * @description Résultat complet d'une évaluation de compréhension
 */
export interface ComprehensionEvaluationResult {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Identifiant du cours (si applicable)
     */
    courseId: string;

    /**
     * Score global (0-100)
     */
    globalScore: number;

    /**
     * Niveau de compréhension global
     */
    comprehensionLevel: ComprehensionLevel;

    /**
     * Date de l'évaluation
     */
    evaluationDate: Date;

    /**
     * Évaluations détaillées par concept
     */
    conceptEvaluations: ConceptEvaluation[];

    /**
     * Points forts identifiés (IDs des concepts)
     */
    strengths: string[];

    /**
     * Points faibles identifiés (IDs des concepts)
     */
    weaknesses: string[];

    /**
     * Lacunes identifiées
     */
    gaps: LearningGap[];

    /**
     * Recommandations de parcours d'apprentissage
     */
    recommendations: string[];

    /**
     * Confiance générale dans l'évaluation (0-1)
     */
    confidence: number;
}

/**
 * @interface Exercise
 * @description Un exercice d'apprentissage
 */
export interface Exercise {
    /**
     * Identifiant de l'exercice
     */
    id: string;

    /**
     * Titre de l'exercice (optionnel)
     */
    title?: string;

    /**
     * Description de l'exercice (optionnel)
     */
    description?: string;

    /**
     * Type d'exercice
     */
    type: string;

    /**
     * Difficulté
     */
    difficulty: string;

    /**
     * Concepts associés
     */
    concepts?: string[];

    /**
     * Réponses attendues
     */
    expectedAnswers: Array<{
        id: string;
        conceptId?: string;
        answer: AnswerValue;
        answerType: string;
        points?: number;
    }>;

    /**
     * Métadonnées additionnelles
     */
    metadata?: Record<string, unknown>;
}

/**
 * @interface Submission
 * @description Soumission d'un utilisateur pour un exercice
 */
export interface Submission {
    /**
     * Identifiant de la soumission
     */
    id: string;

    /**
     * Identifiant de l'exercice
     */
    exerciseId: string;

    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Réponses de l'utilisateur
     */
    answers: Array<{
        questionId: string;
        value: AnswerValue;
    }>;

    /**
     * Date de soumission
     */
    submittedAt: Date;

    /**
     * Temps passé (en secondes)
     */
    timeSpent?: number;

    /**
     * Métadonnées additionnelles
     */
    metadata?: Record<string, unknown>;
}

/**
 * @interface SubmissionEvaluationResult
 * @description Résultat de l'évaluation d'une soumission
 */
export interface SubmissionEvaluationResult {
    /**
     * Identifiant de l'exercice
     */
    exerciseId: string;

    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Score obtenu (0-100)
     */
    score: number;

    /**
     * Indique si la soumission est globalement correcte
     */
    isCorrect: boolean;

    /**
     * Évaluations détaillées par réponse
     */
    answerEvaluations: AnswerEvaluation[];

    /**
     * Niveaux de maîtrise des concepts
     */
    conceptMastery: Record<string, number>;

    /**
     * Lacunes potentielles identifiées
     */
    potentialGaps: LearningGap[];

    /**
     * Points forts identifiés
     */
    strengths: string[];

    /**
     * Points faibles identifiés
     */
    weaknesses: string[];

    /**
     * Difficulté recommandée pour le prochain exercice
     */
    recommendedDifficulty: string;

    /**
     * Date de soumission
     */
    submittedAt: Date;
}

/**
 * @interface SessionContext
 * @description Contexte de la session d'apprentissage
 */
export interface SessionContext {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Identifiant de la session
     */
    sessionId: string;

    /**
     * Identifiant du cours
     */
    courseId?: string;

    /**
     * Informations sur l'appareil
     */
    deviceInfo?: {
        type: string;
        browser: string;
        os: string;
    };

    /**
     * Locale de l'utilisateur
     */
    locale?: string;

    /**
     * Informations sur la connexion
     */
    connectionInfo?: {
        type: string;
        quality: string;
    };

    /**
     * Métadonnées additionnelles
     */
    metadata?: Record<string, unknown>;
}

/**
 * @interface ServiceHealth
 * @description État de santé d'un service
 */
export interface ServiceHealth {
    /**
     * Indique si le service est en bonne santé
     */
    healthy: boolean;

    /**
     * Message décrivant l'état du service
     */
    message?: string | undefined;
}

/**
 * @interface NeRFEnvironmentManagerConfig
 * @description Configuration pour le gestionnaire d'environnements NeRF
 */
export interface NeRFEnvironmentManagerConfig {
    /**
     * Type de rendu à utiliser
     */
    rendererType: string;

    /**
     * Nombre maximum d'environnements simultanés
     */
    maxConcurrentEnvironments: number;

    /**
     * Activer l'optimisation pour l'appareil
     */
    deviceOptimization: boolean;
}

/**
 * @interface EvaluationResultWithGamification
 * @description Résultat d'évaluation avec des informations de gamification
 */
export interface EvaluationResultWithGamification extends ComprehensionEvaluationResult {
    /**
     * Résultats de gamification (points, badges, etc.)
     */
    gamification?: GamificationResult;
}

/**
 * @interface GamificationResult
 * @description Résultat de la gamification
 */
export interface GamificationResult {
    /**
     * Points gagnés
     */
    points: number;

    /**
     * Badges débloqués
     */
    badges: string[];

    /**
     * Niveau actuel
     */
    level: number;

    /**
     * Progrès vers le niveau suivant (0-100)
     */
    levelProgress: number;
}