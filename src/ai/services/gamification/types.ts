/**
 * @file src/ai/services/gamification/types.ts
 * @description Types et interfaces pour le système de gamification
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

/**
 * @interface LearningMetricsSummary
 * @description Résumé des métriques d'une session d'apprentissage
 */
export interface LearningMetricsSummary {
    /** Identifiant de la session */
    readonly sessionId: string;

    /** Durée totale de la session en millisecondes */
    readonly duration: number;

    /** Nombre d'exercices complétés */
    readonly exercisesCompleted: number;

    /** Score moyen de la session (0-100) */
    readonly averageScore: number;

    /** Taux de réussite (0-1) */
    readonly successRate: number;

    /** Concepts maîtrisés durant la session */
    readonly conceptsMastered: string[];

    /** Temps passé par type d'activité */
    readonly timeByActivity: Record<string, number>;

    /** Métadonnées additionnelles */
    readonly metadata?: Record<string, unknown>;
}

/**
 * @enum BadgeType
 * @description Types de badges disponibles dans le système
 */
export enum BadgeType {
    ACHIEVEMENT = 'achievement',   // Réalisation d'un objectif spécifique
    COMPLETION = 'completion',     // Complétion d'un cours ou module
    STREAK = 'streak',             // Assiduité sur une période
    MASTERY = 'mastery',           // Maîtrise d'un concept
    SOCIAL = 'social',             // Interaction sociale
    SPECIAL = 'special',           // Badge spécial ou événementiel
    PROGRESSION = 'progression',   // Progression globale
    SKILL = 'skill'                // Compétences acquises
}

/**
 * @enum RewardType
 * @description Types de récompenses disponibles dans le système
 */
export enum RewardType {
    POINTS = 'points',             // Points d'expérience
    BADGE = 'badge',               // Badge
    FEATURE = 'feature',           // Fonctionnalité débloquée
    CONTENT = 'content',           // Contenu exclusif
    CUSTOMIZATION = 'customization', // Option de personnalisation
    PRIVILEGE = 'privilege'        // Privilège spécial
}

/**
 * @enum ChallengeType
 * @description Types de défis disponibles dans le système
 */
export enum ChallengeType {
    DAILY = 'daily',           // Défi quotidien
    WEEKLY = 'weekly',         // Défi hebdomadaire
    COURSE = 'course',         // Défi lié à un cours
    SKILL = 'skill',           // Défi de compétence
    SOCIAL = 'social',         // Défi social
    SPECIAL = 'special',       // Défi spécial ou événementiel
    STREAK = 'streak'          // Défi d'assiduité
}

/**
 * @enum ChallengeCriteriaType
 * @description Types de critères pour les défis
 */
export enum ChallengeCriteriaType {
    EXERCISE_COUNT = 'exercise_count',
    SUCCESS_RATE = 'success_rate',
    STREAK = 'streak',
    SKILL_MASTERY = 'skill_mastery',
    TIME_SPENT = 'time_spent',
    CUSTOM = 'custom'
}

/**
 * @interface Badge
 * @description Structure d'un badge dans le système
 */
export interface Badge {
    /** Identifiant unique du badge */
    readonly id: string;

    /** Titre du badge */
    readonly title: string;

    /** Nom du badge (pour compatibilité) */
    readonly name?: string;

    /** Description du badge */
    readonly description: string;

    /** Catégorie du badge */
    readonly category: BadgeType | string;

    /** Type de badge (pour compatibilité) */
    readonly type?: BadgeType;

    /** Niveau du badge (1-3, où 3 est le plus élevé) */
    readonly level: 1 | 2 | 3;

    /** URL de l'icône du badge */
    readonly iconUrl?: string;

    /** URL de l'image du badge */
    readonly imageUrl?: string;

    /** Couleur du badge */
    readonly color?: string;

    /** Date d'obtention */
    readonly earnedAt?: Date;

    /** Critères d'obtention (pour affichage) */
    readonly criteria: string | BadgeCriteria;

    /** Points bonus attribués lors de l'obtention */
    readonly bonusPoints: number;

    /** Points accordés (autre nom pour compatibilité) */
    readonly pointsReward?: number;

    /** Rareté du badge */
    readonly rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

    /** Date de création du badge */
    readonly createdAt?: Date;
}

/**
 * @interface BadgeCriteria
 * @description Critères détaillés pour l'obtention d'un badge
 */
export interface BadgeCriteria {
    /** Type d'événement requis */
    readonly eventType: string;

    /** Conditions spécifiques */
    readonly conditions: {
        readonly requiredCount?: number;
        readonly requiredLevel?: number;
        readonly requiredStreak?: number;
        readonly requiredScore?: number;
        readonly requiredConcepts?: string[];
        readonly requiredBadges?: string[];
        readonly customCondition?: {
            readonly type: string;
            readonly value: number | string | boolean;
        };
    };
}

/**
 * @interface UserBadge
 * @description Badge obtenu par un utilisateur
 */
export interface UserBadge {
    /** Identifiant unique de l'attribution */
    readonly id: string;

    /** Identifiant de l'utilisateur */
    readonly userId: string;

    /** Identifiant du badge */
    readonly badgeId: string;

    /** Référence au badge */
    readonly badge: Badge;

    /** Date d'obtention */
    readonly earnedAt: Date;
}

/**
 * @interface Challenge
 * @description Structure d'un défi dans le système
 */
export interface Challenge {
    /** Identifiant unique du défi */
    readonly id: string;

    /** Titre du défi */
    readonly title: string;

    /** Description du défi */
    readonly description: string;

    /** Type de défi */
    readonly type: ChallengeType | string;

    /** Difficulté du défi (1-5) */
    readonly difficulty: number | 'easy' | 'medium' | 'hard' | 'expert';

    /** Date de début du défi */
    readonly startDate: Date;

    /** Date de fin du défi */
    readonly endDate: Date;

    /** Points attribués en cas de réussite */
    readonly rewardPoints: number;

    /** Badge attribué en cas de réussite (optionnel) */
    readonly rewardBadgeId?: string;

    /** Critères de réussite */
    readonly criteria: {
        /** Type de critère */
        readonly type: ChallengeCriteriaType | string;

        /** Valeur cible */
        readonly target: number;

        /** Paramètres additionnels */
        readonly params?: Record<string, unknown>;
    };

    /** Objectifs détaillés (pour compatibilité) */
    readonly objectives?: ChallengeObjective[];

    /** Progression actuelle (0-1) */
    progress: number;

    /** Indique si le défi a été complété */
    completed: boolean;

    /** Date de complétion */
    completedAt?: Date;

    /** Récompenses à obtenir */
    readonly rewards?: ChallengeReward[];

    /** Tags associés au défi */
    readonly tags?: string[];
}

/**
 * @interface ChallengeObjective
 * @description Structure détaillée d'un objectif de défi
 */
export interface ChallengeObjective {
    /** Identifiant unique de l'objectif */
    readonly id: string;

    /** Description de l'objectif */
    readonly description: string;

    /** Valeur requise pour compléter l'objectif */
    readonly requiredValue: number;

    /** Valeur actuelle */
    currentValue: number;

    /** Indique si l'objectif est complété */
    isComplete: boolean;

    /** Type d'objectif */
    readonly type: 'count' | 'score' | 'time' | 'streak' | 'custom';

    /** Métadonnées additionnelles */
    readonly metadata?: {
        readonly conceptId?: string;
        readonly exerciseType?: string;
        readonly difficulty?: string;
        readonly timeFrame?: number;
    };
}

/**
 * @interface ChallengeReward
 * @description Structure détaillée d'une récompense de défi
 */
export interface ChallengeReward {
    /** Type de récompense */
    readonly type: RewardType;

    /** Valeur de la récompense */
    readonly value: RewardValue;

    /** Métadonnées de la récompense */
    readonly metadata?: {
        readonly rarity?: string;
        readonly expiresAt?: Date;
        readonly conditions?: string[];
    };
}

/**
 * @interface RewardValue
 * @description Types possibles pour les valeurs de récompenses
 */
export interface RewardValue {
    /** Points accordés */
    readonly points?: number;

    /** Identifiant du badge accordé */
    readonly badgeId?: string;

    /** Identifiant de la fonctionnalité débloquée */
    readonly featureId?: string;

    /** Identifiant du contenu débloqué */
    readonly contentId?: string;

    /** Identifiant de l'option de personnalisation */
    readonly customizationId?: string;

    /** Identifiant du privilège accordé */
    readonly privilegeId?: string;

    /** Métadonnées de la récompense */
    readonly metadata?: {
        readonly duration?: number;
        readonly expiresAt?: Date;
        readonly restrictions?: string[];
        readonly requirements?: string[];
    };
}

/**
 * @interface UserChallenge
 * @description Défi attribué à un utilisateur
 */
export interface UserChallenge {
    /** Identifiant unique de l'attribution */
    readonly id: string;

    /** Identifiant de l'utilisateur */
    readonly userId: string;

    /** Identifiant du défi */
    readonly challengeId: string;

    /** Référence au défi */
    readonly challenge: Challenge;

    /** Progression sur les objectifs */
    readonly objectiveProgress: Record<string, number>;

    /** Statut du défi */
    status: 'active' | 'completed' | 'failed' | 'expired';

    /** Date d'attribution */
    readonly assignedAt: Date;

    /** Date de complétion */
    completedAt?: Date;

    /** Récompenses réclamées */
    rewardsClaimed: boolean;
}

/**
 * @interface GamificationLevel
 * @description Structure pour un niveau dans le système de progression
 */
export interface GamificationLevel {
    /** Identifiant du niveau */
    readonly level: number;

    /** Titre du niveau */
    readonly title: string;

    /** Description du niveau */
    readonly description: string;

    /** Points requis pour atteindre ce niveau */
    readonly requiredPoints: number;

    /** Récompenses débloquées à ce niveau */
    readonly rewards: {
        /** Points bonus */
        readonly bonusPoints?: number;

        /** Badge attribué */
        readonly badgeId?: string;

        /** Fonctionnalités débloquées */
        readonly unlockedFeatures?: string[];

        /** Autres récompenses */
        readonly other?: Record<string, unknown>;
    };
}

/**
 * @interface GamificationProfile
 * @description Structure du profil de gamification d'un utilisateur
 */
export interface GamificationProfile {
    /** Identifiant unique de l'utilisateur */
    readonly userId: string;

    /** Total des points accumulés */
    totalPoints: number;

    /** Niveau actuel dans le système de gamification */
    currentLevel: number;

    /** Points requis pour le prochain niveau */
    pointsToNextLevel: number;

    /** Badges obtenus */
    readonly badges: Badge[];

    /** Défis actifs */
    readonly activeChallenges: Challenge[];

    /** Défis complétés */
    readonly completedChallenges: Challenge[];

    /** Séquence actuelle (nombre de jours consécutifs d'activité) */
    currentStreak: number;

    /** Meilleure séquence atteinte */
    bestStreak: number;

    /** Date de dernière activité */
    lastActivityDate: Date;

    /** Historique d'activité (points par jour) */
    readonly activityHistory: Array<{ date: Date; points: number }>;

    /** Statistiques diverses */
    readonly stats: {
        /** Nombre total d'exercices complétés */
        readonly exercisesCompleted: number;

        /** Nombre de jours d'activité */
        readonly activeDays: number;

        /** Nombre de points par catégorie */
        readonly pointsByCategory: Record<string, number>;

        /** Moyenne quotidienne de points */
        readonly averageDailyPoints: number;
    };

    /** Préférences de gamification */
    readonly preferences: {
        /** Notifications activées */
        readonly notificationsEnabled: boolean;

        /** Affichage du classement activé */
        readonly leaderboardEnabled: boolean;

        /** Défis sociaux activés */
        readonly socialChallengesEnabled: boolean;

        /** Style visuel préféré */
        readonly visualStyle: 'default' | 'minimal' | 'colorful' | 'dark';
    };
}

/**
 * @interface UserProgress
 * @description Progression simplifiée d'un utilisateur (compatibilité)
 */
export interface UserProgress {
    /** Identifiant de l'utilisateur */
    readonly userId: string;

    /** Points accumulés */
    points: number;

    /** Niveau actuel */
    level: number;

    /** Assiduité actuelle (jours consécutifs) */
    currentStreak: number;

    /** Record d'assiduité */
    longestStreak: number;

    /** Réalisations débloquées */
    readonly achievements: string[];

    /** Jalons atteints par cours */
    readonly courseMilestones: Record<string, string[]>;

    /** Fonctionnalités débloquées */
    readonly unlockedFeatures: string[];

    /** Date de dernière activité */
    lastActivity: Date;
}

/**
 * @interface GamificationEvent
 * @description Interface pour un événement de gamification
 */
export interface GamificationEvent {
    /** Type d'événement */
    readonly type: 'exercise_completed' | 'level_up' | 'badge_earned' | 'challenge_completed' | 'streak_updated' | 'custom';

    /** Identifiant de l'utilisateur */
    readonly userId: string;

    /** Horodatage de l'événement */
    readonly timestamp: Date;

    /** Données associées à l'événement */
    readonly data: Record<string, unknown>;

    /** Points gagnés (si applicable) */
    readonly pointsEarned?: number;

    /** Identifiant du badge gagné (si applicable) */
    readonly badgeEarned?: string;

    /** Identifiant du défi complété (si applicable) */
    readonly challengeCompleted?: string;

    /** Nouveau niveau atteint (si applicable) */
    readonly newLevel?: number;
}

/**
 * @type DetailedGamificationEvent
 * @description Types détaillés d'événements de gamification
 */
export type DetailedGamificationEvent =
    | { type: 'exercise_completion'; exerciseId: string; score: number; difficulty: string; conceptId: string }
    | { type: 'session_completion'; metrics: LearningMetricsSummary }
    | { type: 'course_milestone'; courseId: string; milestone: number; progressPercentage: number }
    | { type: 'course_completion'; courseId: string }
    | { type: 'daily_streak'; streakDays: number }
    | { type: 'courses_completed_count'; count: number }
    | { type: 'level_up'; oldLevel: number; newLevel: number }
    | { type: 'challenge_completion'; challengeId: string }
    | { type: 'feature_usage'; featureId: string; usageCount: number };

/**
 * @interface GamificationResult
 * @description Interface pour le résultat d'un processus de gamification
 */
export interface GamificationResult {
    /** Points gagnés */
    readonly pointsEarned: number;

    /** Badges obtenus */
    readonly badgesEarned: Badge[];

    /** Défis complétés */
    readonly challengesCompleted: Challenge[];

    /** Indique si un niveau a été atteint */
    readonly levelUp: boolean;

    /** Niveau atteint (si levelUp est vrai) */
    readonly newLevel?: number;

    /** Événements générés */
    readonly events: GamificationEvent[];

    /** Feedback descriptif */
    readonly feedback?: string;

    /** Données supplémentaires */
    readonly extraData?: Record<string, unknown>;
}

/**
 * @type ActivityData
 * @description Type pour les données d'activité utilisées pour mettre à jour les défis
 */
export type ActivityData = Record<string, unknown>;

/**
 * @interface LevelUpResult
 * @description Type pour le résultat de vérification de niveau
 */
export interface LevelUpResult {
    /** Indique si un niveau a été franchi */
    readonly levelUp: boolean;

    /** Niveau précédent */
    readonly previousLevel: number;

    /** Nouveau niveau */
    readonly newLevel: number;
}