/**
 * @file src/ai/services/learning/types/LearningExtensions.ts
 * @description Types d'extension pour combler les lacunes entre les types existants
 * et les besoins des services refactorisés.
 * @version 1.0.0
 * @since 2024
 */

import type {
    Badge as ExistingBadge,
    LearningSession as ExistingLearningSession,
    LearningPathProgress,
    LearningSessionMetrics,
    ProfilType,
    SkillLevel,
    LearningStyle
} from '@/ai/services/learning/types';

/**
 * Extension du type Badge existant avec les propriétés nécessaires
 */
export interface ExtendedBadge extends ExistingBadge {
    /** Titre du badge (alias pour name) */
    title: string;
    /** Niveau de difficulté */
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    /** Catégorie du badge */
    category: 'progression' | 'completion' | 'achievement' | 'consistency';
    /** URL de l'image */
    imageUrl: string;
}

/**
 * Progression d'apprentissage étendue basée sur LearningPathProgress
 */
export interface LearningProgress extends Omit<LearningPathProgress, 'courseId'> {
    /** Tentatives de quiz par quiz ID */
    quizAttempts: Record<string, QuizAttempt[]>;
    /** Tentatives d'exercices par exercice ID */
    exerciseAttempts: Record<string, ExerciseAttempt[]>;
    /** Badges obtenus par l'utilisateur */
    earnedBadges: string[];
    /** Expérience totale acquise */
    totalExperience: number;
    /** Niveau actuel de l'utilisateur */
    level: number;
    /** Date de la dernière activité */
    lastActivityDate: Date;
    /** Temps total passé en apprentissage (minutes) */
    timeSpent: number;
    /** Module actuellement en cours */
    currentModule: string;
    /** Historique des interactions */
    interactionHistory: InteractionRecord[];
    /** Progression par module (ID -> pourcentage) */
    moduleProgress: Record<string, number>;
}

/**
 * Tentative de quiz
 */
export interface QuizAttempt {
    /** Identifiant du quiz */
    quizId: string;
    /** Score obtenu (0-100) */
    score: number;
    /** Nombre de réponses correctes */
    correctAnswers: number;
    /** Nombre total de questions */
    totalQuestions: number;
    /** Temps passé sur le quiz (secondes) */
    timeSpent: number;
    /** Date de la tentative */
    date: Date;
}

/**
 * Tentative d'exercice
 */
export interface ExerciseAttempt {
    /** Identifiant de l'exercice */
    exerciseId: string;
    /** Score obtenu */
    score: number;
    /** Temps passé (secondes) */
    timeSpent: number;
    /** Date de la tentative */
    date: Date;
    /** Données spécifiques à l'exercice */
    exerciseData?: Record<string, unknown>;
}

/**
 * Enregistrement d'interaction
 */
export interface InteractionRecord {
    /** Type d'interaction */
    type: 'quiz' | 'exercise' | 'module' | 'badge';
    /** Identifiant de l'élément */
    itemId: string;
    /** Horodatage */
    timestamp: Date;
    /** Score associé (optionnel) */
    score?: number;
}

/**
 * Types de catégories de modules
 */
export type ModuleCategory = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';

/**
 * Statuts possibles pour un module
 */
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/**
 * Module d'apprentissage
 */
export interface LearningModule {
    /** Identifiant unique du module */
    id: string;
    /** Titre du module */
    title: string;
    /** Description détaillée */
    description: string;
    /** Catégorie du module */
    category: ModuleCategory;
    /** Niveau de difficulté (1-10) */
    difficulty: number;
    /** Prérequis nécessaires */
    prerequisites: string[];
    /** Statut actuel du module */
    status: ModuleStatus;
    /** Progression actuelle (0-100) */
    progress: number;
    /** Temps estimé d'apprentissage (minutes) */
    estimatedTime: number;
    /** Compétences développées */
    skills: string[];
    /** Contenu du module */
    content: {
        sections: ModuleSection[];
        quizzes: string[];
        exercises: string[];
        resources: string[];
    };
}

/**
 * Section d'un module
 */
export interface ModuleSection {
    /** Identifiant de la section */
    id: string;
    /** Titre de la section */
    title: string;
    /** Contenu de la section */
    content: string;
    /** Ordre dans le module */
    order: number;
}

/**
 * Session d'apprentissage étendue avec métriques complètes
 */
export interface ExtendedLearningSession extends ExistingLearningSession {
    /** Durée de la session calculée */
    duration?: number;
    /** Nombre d'exercices complétés */
    exercisesCompleted?: number;
    /** Métriques étendues */
    extendedMetrics?: {
        accuracy: number;
        averageTimePerExercise: number;
        conceptsCovered: string[];
        improvementAreas: string[];
    };
}

/**
 * Configuration pour les critères de filtrage de modules
 */
export interface ModuleFilterCriteria {
    /** Catégorie de module */
    category?: ModuleCategory;
    /** Niveau de difficulté */
    difficulty?: number;
    /** Statut du module */
    status?: ModuleStatus;
    /** Compétences requises */
    requiredSkills?: string[];
    /** Temps d'apprentissage estimé maximum */
    maxEstimatedTime?: number;
}

/**
 * Configuration par défaut pour les modules
 */
export interface DefaultModuleConfig {
    /** Activer les modules par défaut */
    enableDefaultModules: boolean;
    /** Langue par défaut pour les modules */
    defaultLanguage: string;
    /** Niveau de difficulté de départ */
    startingDifficulty: number;
}

/**
 * Configuration du système de badges
 */
export interface BadgeSystemConfig {
    /** Activer l'attribution automatique des badges */
    enableAutoAward: boolean;
    /** Activer les badges par défaut */
    enableDefaultBadges: boolean;
    /** Limite de badges qu'un utilisateur peut gagner par jour */
    dailyBadgeLimit: number;
}

/**
 * Configuration du système de progression
 */
export interface ProgressSystemConfig {
    /** Multiplicateur d'expérience de base */
    baseExperienceMultiplier: number;
    /** Expérience de base pour le premier niveau */
    baseExperienceForLevel: number;
    /** Facteur de croissance entre les niveaux */
    levelGrowthFactor: number;
    /** Activer le système de bonus temporels */
    enableTimeBasedBonuses: boolean;
}

/**
 * Résultat d'évaluation des badges
 */
export interface BadgeEvaluationResult {
    /** Identifiant du badge */
    badgeId: string;
    /** Badge attribué ou non */
    awarded: boolean;
    /** Raison de l'attribution ou du refus */
    reason: string;
    /** Progression vers l'obtention du badge (0-100) */
    progressTowards: number;
}

/**
 * Détails du calcul d'expérience
 */
export interface ExperienceCalculation {
    /** Expérience de base */
    baseExperience: number;
    /** Bonus de performance */
    performanceBonus: number;
    /** Bonus temporel */
    timeBonus: number;
    /** Expérience totale attribuée */
    totalExperience: number;
    /** Détails de calcul */
    calculationDetails: string;
}

/**
 * Résumé des changements de progression
 */
export interface ProgressUpdateSummary {
    /** Progression précédente */
    previousProgress: LearningProgress;
    /** Nouvelle progression */
    updatedProgress: LearningProgress;
    /** Changements de niveau */
    levelChanges: {
        oldLevel: number;
        newLevel: number;
        levelUp: boolean;
    };
    /** Nouveaux badges obtenus */
    newBadges: string[];
    /** Expérience gagnée */
    experienceGained: number;
}

/**
 * Alias pour les types existants afin d'assurer la compatibilité
 */
export type Badge = ExtendedBadge;
export type LearningSession = ExtendedLearningSession;

/**
 * Re-export des types de base nécessaires
 */
export type {
    ProfilType,
    SkillLevel,
    LearningStyle,
    LearningSessionMetrics
};

/**
 * Interface pour les événements d'apprentissage
 */
export interface LearningServiceEvents {
    /** Module créé ou mis à jour */
    'module.updated': {
        moduleId: string;
        isNew: boolean;
        module: LearningModule;
    };
    /** Module supprimé */
    'module.removed': {
        moduleId: string;
    };
    /** Badge créé ou mis à jour */
    'badge.updated': {
        badgeId: string;
        isNew: boolean;
        badge: Badge;
    };
    /** Badge attribué à un utilisateur */
    'badge.awarded': {
        badgeId: string;
        userId: string;
        badge: Badge;
    };
    /** Progression de module mise à jour */
    'progress.module.updated': {
        userId: string;
        moduleId: string;
        oldProgress: number;
        newProgress: number;
        completed: boolean;
    };
    /** Niveau utilisateur changé */
    'progress.level.changed': {
        userId: string;
        oldLevel: number;
        newLevel: number;
        experienceGained: number;
    };
    /** Nouvelle progression utilisateur créée */
    'progress.user.created': {
        userId: string;
        initialProgress: LearningProgress;
    };
}