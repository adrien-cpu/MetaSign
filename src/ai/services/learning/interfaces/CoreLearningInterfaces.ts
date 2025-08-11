/**
 * @file src/ai/services/learning/interfaces/CoreLearningInterfaces.ts
 * @description Interfaces de base pour les services d'apprentissage LSF
 * Version consolidée qui combine les types fondamentaux et les structures de données principales
 * Compatible avec exactOptionalPropertyTypes: true
 * @module CoreLearningInterfaces
 * @version 3.0.0
 * @since 2024
 * @author MetaSign Learning Team
 * @lastModified 2025-01-15
 * 
 * @example
 * ```typescript
 * import type { 
 *   LearningProgress, 
 *   QuizAttempt, 
 *   LSFSkillProgress,
 *   CompetencyLevel
 * } from './CoreLearningInterfaces';
 * ```
 */

// ================================
// TYPES DE BASE POUR LSF
// ================================

/**
 * Catégories de modules d'apprentissage LSF
 */
export type ModuleCategory =
    | 'LSF_Débutant'
    | 'LSF_Intermédiaire'
    | 'LSF_Avancé'
    | 'LSF_Expert'
    | 'Culture_Sourde'
    | 'Histoire_LSF'
    | 'Linguistique_LSF';

/**
 * Statuts possibles pour un module LSF
 */
export type ModuleStatus =
    | 'locked'
    | 'available'
    | 'in_progress'
    | 'completed'
    | 'mastered';

/**
 * Types d'événements du système LSF
 */
export type LSFEventType =
    | 'module_started'
    | 'module_completed'
    | 'quiz_attempted'
    | 'exercise_completed'
    | 'badge_earned'
    | 'level_up'
    | 'skill_mastered'
    | 'daily_goal_reached'
    | 'streak_milestone'
    | 'assessment_completed'
    | 'content_rated'
    | 'collaboration_joined'
    | 'mentorship_requested';

/**
 * Niveaux de compétence CECRL pour LSF
 */
export type CompetencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Types de préférences d'apprentissage
 */
export type LearningStyle = 'visual' | 'kinesthetic' | 'mixed';

/**
 * Types de contenu LSF
 */
export type LSFContentType = 'video' | 'image' | 'text' | 'interactive' | 'quiz' | 'exercise' | 'dictionary';

/**
 * Niveaux de difficulté LSF
 */
export type LSFDifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

/**
 * Niveau CECR pour LSF (alias)
 */
export type CECRLevel = CompetencyLevel;

/**
 * Type pour les fonctions de callback des services
 */
export type ServiceCallback<T = unknown> = (error: Error | null, result?: T) => void;

// ================================
// INTERFACES DE PROGRESSION LSF
// ================================

/**
 * Progression dans les compétences spécifiques à la LSF
 */
export interface LSFSkillProgress {
    /** Compétence en dactylologie (alphabet manuel) */
    readonly fingerspelling: number;
    /** Maîtrise de l'espace de signation */
    readonly spatialGrammar: number;
    /** Compréhension des expressions faciales grammaticales */
    readonly facialExpressions: number;
    /** Précision des configurations manuelles */
    readonly handshapes: number;
    /** Compréhension des mouvements et orientations */
    readonly movements: number;
    /** Vocabulaire de base en signes */
    readonly basicVocabulary: number;
    /** Grammaire avancée LSF */
    readonly advancedGrammar: number;
}

/**
 * Préférences d'apprentissage pour la LSF
 */
export interface LearningPreferences {
    /** Style d'apprentissage préféré */
    readonly learningStyle: LearningStyle;
    /** Rythme d'apprentissage (1-5) */
    readonly pace: number;
    /** Types de contenu préférés */
    readonly preferredContentTypes: readonly string[];
    /** Durée de session préférée (minutes) */
    readonly sessionDuration: number;
    /** Feedback souhaité */
    readonly feedbackLevel: 'minimal' | 'moderate' | 'detailed';
    /** Notifications activées */
    readonly notificationsEnabled: boolean;
}

/**
 * Contexte d'apprentissage LSF
 */
export interface LearningContext {
    /** Identifiant de la session */
    readonly sessionId: string;
    /** Utilisateur concerné */
    readonly userId: string;
    /** Module en cours */
    readonly currentModule: string;
    /** Activité en cours */
    readonly currentActivity: string;
    /** Niveau de l'utilisateur */
    readonly userLevel: CompetencyLevel;
    /** Timestamp de début */
    readonly startTime: Date;
    /** Durée écoulée (secondes) */
    readonly elapsed: number;
    /** Environnement d'apprentissage */
    readonly environment: 'web' | 'mobile' | 'vr' | 'classroom';
}

/**
 * Session d'apprentissage LSF
 */
export interface LearningSession {
    /** Identifiant unique de la session */
    readonly id: string;
    /** Utilisateur de la session */
    readonly userId: string;
    /** Date de début */
    readonly startTime: Date;
    /** Date de fin (optionnel) */
    readonly endTime?: Date;
    /** Modules traités dans la session */
    readonly modulesAccessed: readonly string[];
    /** Activités réalisées */
    readonly activitiesCompleted: readonly string[];
    /** Score total de la session */
    readonly sessionScore: number;
    /** Temps total passé (minutes) */
    readonly timeSpent: number;
    /** Contexte de la session */
    readonly context: LearningContext;
}

/**
 * Tentative de quiz spécialisé pour l'apprentissage LSF
 */
export interface QuizAttempt {
    /** Identifiant du quiz LSF */
    readonly quizId: string;
    /** Score obtenu (0-100) */
    readonly score: number;
    /** Nombre de réponses correctes */
    readonly correctAnswers: number;
    /** Nombre total de questions */
    readonly totalQuestions: number;
    /** Temps passé sur le quiz (secondes) */
    readonly timeSpent: number;
    /** Date de la tentative */
    readonly date: Date;
    /** Type de quiz LSF (optionnel) */
    readonly quizType?: 'vocabulary' | 'grammar' | 'comprehension' | 'production';
    /** Compétences LSF évaluées (optionnel) */
    readonly skillsAssessed?: readonly string[];
}

/**
 * Tentative d'exercice pratique LSF
 */
export interface ExerciseAttempt {
    /** Identifiant de l'exercice LSF */
    readonly exerciseId: string;
    /** Score obtenu */
    readonly score: number;
    /** Temps passé (secondes) */
    readonly timeSpent: number;
    /** Date de la tentative */
    readonly date: Date;
    /** Type d'exercice LSF (optionnel) */
    readonly exerciseType?: 'signing' | 'recognition' | 'translation' | 'conversation';
    /** Données spécifiques à l'exercice LSF (optionnel) */
    readonly exerciseData?: {
        /** Signes pratiqués (optionnel) */
        readonly signsPracticed?: readonly string[];
        /** Erreurs de forme détectées (optionnel) */
        readonly formErrors?: readonly string[];
        /** Qualité gestuelle (0-1) (optionnel) */
        readonly gestureQuality?: number;
        /** Fluidité de signation (0-1) (optionnel) */
        readonly fluency?: number;
    };
}

/**
 * Enregistrement d'interaction avec les contenus LSF
 */
export interface InteractionRecord {
    /** Type d'interaction LSF */
    readonly type: 'quiz' | 'exercise' | 'module' | 'badge' | 'video' | 'dictionary';
    /** Identifiant de l'élément LSF */
    readonly itemId: string;
    /** Horodatage de l'interaction */
    readonly timestamp: Date;
    /** Score associé (optionnel) */
    readonly score?: number;
    /** Durée de l'interaction (secondes) (optionnel) */
    readonly duration?: number;
    /** Contexte spécifique LSF (optionnel) */
    readonly context?: {
        /** Thème abordé (optionnel) */
        readonly topic?: string;
        /** Niveau de difficulté (optionnel) */
        readonly difficulty?: number;
        /** Mode d'interaction (optionnel) */
        readonly mode?: 'guided' | 'free' | 'assessment';
    };
}

/**
 * Profil d'apprentissage utilisateur pour LSF
 */
export interface UserLearningProfile {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Niveau actuel en LSF */
    readonly currentLevel: CompetencyLevel;
    /** Compétences LSF développées */
    readonly lsfSkills: LSFSkillProgress;
    /** Préférences d'apprentissage */
    readonly preferences: LearningPreferences;
    /** Objectifs d'apprentissage */
    readonly goals: readonly string[];
    /** Date de création du profil */
    readonly createdAt: Date;
    /** Dernière mise à jour */
    readonly updatedAt: Date;
    /** Expérience totale acquise */
    readonly totalExperience: number;
    /** Niveau général (calculé) */
    readonly level: number;
}

/**
 * Suivi de progression d'apprentissage spécialisé
 */
export interface ProgressTracking {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Module ou activité concerné */
    readonly targetId: string;
    /** Type de cible */
    readonly targetType: 'module' | 'exercise' | 'quiz' | 'skill';
    /** Progression actuelle (0-100) */
    readonly progress: number;
    /** Date de début */
    readonly startedAt: Date;
    /** Date de dernière mise à jour */
    readonly lastUpdated: Date;
    /** Date de complétion (optionnel) */
    readonly completedAt?: Date;
    /** Données de performance (optionnel) */
    readonly performanceData?: Readonly<Record<string, number>>;
}

/**
 * Objectif d'apprentissage LSF
 */
export interface LearningGoal {
    /** Identifiant de l'objectif */
    readonly id: string;
    /** Titre de l'objectif */
    readonly title: string;
    /** Description */
    readonly description: string;
    /** Type d'objectif */
    readonly type: 'skill' | 'module' | 'level' | 'time' | 'custom';
    /** Cible à atteindre */
    readonly target: number;
    /** Progression actuelle */
    readonly current: number;
    /** Date limite (optionnel) */
    readonly deadline?: Date;
    /** Récompense associée (optionnel) */
    readonly reward?: string;
    /** Statut de l'objectif */
    readonly status: 'active' | 'completed' | 'paused' | 'abandoned';
}

/**
 * Évaluation de compétence LSF
 */
export interface SkillAssessment {
    /** Identifiant de l'évaluation */
    readonly id: string;
    /** Compétence évaluée */
    readonly skillId: string;
    /** Nom de la compétence */
    readonly skillName: string;
    /** Niveau évalué */
    readonly assessedLevel: CompetencyLevel;
    /** Score obtenu (0-100) */
    readonly score: number;
    /** Confiance de l'évaluation (0-1) */
    readonly confidence: number;
    /** Date de l'évaluation */
    readonly assessmentDate: Date;
    /** Évaluateur (human/ai) */
    readonly assessor: 'human' | 'ai';
    /** Recommandations (optionnel) */
    readonly recommendations?: readonly string[];
}

/**
 * Progression d'apprentissage étendue spécifique à la LSF
 */
export interface LearningProgress {
    /** Identifiant unique de l'utilisateur */
    readonly userId: string;
    /** Modules LSF complétés par l'utilisateur */
    readonly completedModules: readonly string[];
    /** Progression par module LSF (ID → pourcentage 0-100) */
    readonly moduleProgress: Readonly<Record<string, number>>;
    /** Tentatives de quiz LSF par quiz ID */
    readonly quizAttempts: Readonly<Record<string, readonly QuizAttempt[]>>;
    /** Tentatives d'exercices de signes par exercice ID */
    readonly exerciseAttempts: Readonly<Record<string, readonly ExerciseAttempt[]>>;
    /** Badges LSF obtenus par l'utilisateur */
    readonly earnedBadges: readonly string[];
    /** Expérience totale acquise dans l'apprentissage LSF */
    readonly totalExperience: number;
    /** Niveau actuel de l'utilisateur en LSF */
    readonly level: number;
    /** Date de la dernière activité d'apprentissage */
    readonly lastActivityDate: Date;
    /** Temps total passé en apprentissage LSF (minutes) */
    readonly timeSpent: number;
    /** Module LSF actuellement en cours */
    readonly currentModule: string;
    /** Historique des interactions avec les contenus LSF */
    readonly interactionHistory: readonly InteractionRecord[];
    /** Concepts LSF maîtrisés (optionnel) */
    readonly masteredConcepts?: readonly string[];
    /** Compétences spécifiques LSF développées (optionnel) */
    readonly lsfSkills?: LSFSkillProgress;
}

/**
 * Résumé des changements lors d'une mise à jour de progression
 */
export interface ProgressUpdateSummary {
    /** Progression précédente */
    readonly previousProgress: LearningProgress;
    /** Progression mise à jour */
    readonly updatedProgress: LearningProgress;
    /** Changements de niveau */
    readonly levelChanges: {
        readonly oldLevel: number;
        readonly newLevel: number;
        readonly levelUp: boolean;
    };
    /** Nouveaux badges obtenus */
    readonly newBadges: readonly string[];
    /** Expérience gagnée */
    readonly experienceGained: number;
}

/**
 * Statistiques détaillées de progression LSF
 */
export interface ProgressStatistics {
    /** Niveau actuel en LSF */
    readonly level: number;
    /** Expérience requise pour le niveau suivant */
    readonly experienceToNextLevel: number;
    /** Progression vers le niveau suivant (%) */
    readonly progressToNextLevel: number;
    /** Nombre de modules LSF complétés */
    readonly modulesCompleted: number;
    /** Nombre total de tentatives de quiz LSF */
    readonly totalQuizAttempts: number;
    /** Score moyen aux quiz LSF */
    readonly averageQuizScore: number;
    /** Nombre de badges LSF gagnés */
    readonly badgesEarned: number;
    /** Temps d'étude LSF en heures */
    readonly studyTimeHours: number;
    /** Compétences LSF maîtrisées (optionnel) */
    readonly masteredLSFSkills?: readonly string[];
}

/**
 * Configuration du système de progression LSF
 */
export interface ProgressSystemConfig {
    /** Multiplicateur d'expérience de base */
    readonly baseExperienceMultiplier: number;
    /** Expérience de base pour le premier niveau */
    readonly baseExperienceForLevel: number;
    /** Facteur de croissance des niveaux */
    readonly levelGrowthFactor: number;
    /** Bonus temporels activés */
    readonly enableTimeBasedBonuses: boolean;
    /** Multiplicateur pour compétences LSF (optionnel) */
    readonly lsfSkillMultiplier?: number;
    /** Bonus pour consistance quotidienne (optionnel) */
    readonly dailyStreakBonus?: number;
    /** Malus pour inactivité prolongée (optionnel) */
    readonly inactivityPenalty?: number;
}

/**
 * Calcul détaillé de l'expérience gagnée
 */
export interface ExperienceCalculation {
    /** Expérience de base */
    readonly baseExperience: number;
    /** Bonus de performance */
    readonly performanceBonus: number;
    /** Bonus temporel */
    readonly timeBonus: number;
    /** Expérience totale */
    readonly totalExperience: number;
    /** Détails du calcul */
    readonly calculationDetails: string;
    /** Facteurs appliqués (optionnel) */
    readonly appliedFactors?: {
        /** Multiplicateur de difficulté (optionnel) */
        readonly difficultyMultiplier?: number;
        /** Bonus de première tentative (optionnel) */
        readonly firstAttemptBonus?: number;
        /** Bonus de perfection (optionnel) */
        readonly perfectScoreBonus?: number;
        /** Bonus de série (optionnel) */
        readonly streakBonus?: number;
    };
}

/**
 * Métriques d'apprentissage
 */
export interface LearningMetrics {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Période des métriques */
    readonly period: {
        readonly start: Date;
        readonly end: Date;
    };
    /** Temps total d'apprentissage (minutes) */
    readonly totalLearningTime: number;
    /** Nombre de sessions */
    readonly sessionCount: number;
    /** Score moyen */
    readonly averageScore: number;
    /** Progression par compétence */
    readonly skillProgress: Readonly<Record<string, number>>;
    /** Activités les plus utilisées */
    readonly topActivities: readonly string[];
    /** Taux de complétion */
    readonly completionRate: number;
}

// ================================
// CONSTANTES ET VALIDATEURS
// ================================

/**
 * Constantes LSF
 */
export const LSFConstants = {
    LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,
    DIFFICULTIES: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const,
    CONTENT_TYPES: ['video', 'image', 'text', 'interactive', 'quiz', 'exercise', 'dictionary'] as const,
    CATEGORIES: ['LSF_Débutant', 'LSF_Intermédiaire', 'LSF_Avancé', 'LSF_Expert', 'Culture_Sourde', 'Histoire_LSF', 'Linguistique_LSF'] as const
} as const;

/**
 * Validateurs pour LSF
 */
export const LSFValidators = {
    validateCECRLevel: (level: string): level is CompetencyLevel => {
        return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);
    },
    validateDifficulty: (difficulty: number): boolean => {
        return difficulty >= 1 && difficulty <= 10;
    },
    validateProgress: (progress: number): boolean => {
        return progress >= 0 && progress <= 100;
    },
    validateModuleCategory: (category: string): category is ModuleCategory => {
        return LSFConstants.CATEGORIES.includes(category as ModuleCategory);
    },
    validateContentType: (type: string): type is LSFContentType => {
        return LSFConstants.CONTENT_TYPES.includes(type as LSFContentType);
    }
} as const;

/**
 * Constantes par défaut pour le système LSF
 */
export const DEFAULT_LSF_CONSTANTS = {
    DEFAULT_DURATIONS: {
        MODULE: 30,
        QUIZ: 10,
        EXERCISE: 15,
        CACHE_TTL: 3600
    },
    DEFAULT_THRESHOLDS: {
        MASTERY: 80,
        PASSING: 60,
        EXCELLENCE: 90
    },
    LIMITS: {
        MAX_MODULES_PER_USER: 100,
        MAX_BADGES_PER_USER: 50,
        MAX_SESSION_DURATION: 180
    }
} as const;