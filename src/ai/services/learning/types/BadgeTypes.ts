/**
 * @file src/ai/services/learning/types/BadgeTypes.ts
 * @description Types pour le système de badges - Interface Badge corrigée
 * 
 * Fonctionnalités :
 * - 🎯 Interface Badge complète avec toutes les propriétés nécessaires
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * - 📊 Types pour évaluation et statistiques
 * - 🌟 Configuration système de badges
 * 
 * @module BadgeTypes
 * @version 1.0.0 - Types Badge corrigés
 * @since 2025
 * @author MetaSign Team - Badge System Types
 * @lastModified 2025-07-06
 */

/**
 * Catégories de badges disponibles
 */
export type BadgeCategory = 'progression' | 'completion' | 'achievement' | 'consistency';

/**
 * Niveaux de difficulté pour les badges
 */
export type BadgeDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

/**
 * Interface principale pour un badge (toutes les propriétés nécessaires)
 */
export interface Badge {
    /** Identifiant unique du badge */
    readonly id: string;

    /** Nom du badge (legacy, utiliser title) */
    readonly name: string;

    /** Titre affiché du badge */
    readonly title: string;

    /** Description détaillée du badge */
    readonly description: string;

    /** URL de l'image du badge */
    readonly imageUrl: string;

    /** Critères d'obtention (texte descriptif) */
    readonly criteria: string;

    /** Nom du fichier d'icône */
    readonly icon: string;

    /** Points accordés lors de l'obtention */
    readonly pointsReward: number;

    /** Niveau de difficulté */
    readonly difficulty: BadgeDifficulty;

    /** Catégorie du badge */
    readonly category: BadgeCategory;

    /** Date de création (optionnelle) */
    readonly createdAt?: Date;

    /** Métadonnées additionnelles (optionnelles) */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface étendue pour les badges avec informations additionnelles
 */
export interface ExtendedBadge extends Badge {
    /** Nombre d'utilisateurs ayant obtenu ce badge */
    readonly earnedCount?: number;

    /** Pourcentage d'utilisateurs ayant obtenu ce badge */
    readonly earnedPercentage?: number;

    /** Date de première obtention */
    readonly firstEarnedAt?: Date;

    /** Date de dernière obtention */
    readonly lastEarnedAt?: Date;

    /** Statistiques d'obtention par période */
    readonly earnedStats?: Readonly<Record<string, number>>;
}

/**
 * Résultat de l'évaluation d'un badge
 */
export interface BadgeEvaluationResult {
    /** Identifiant du badge évalué */
    readonly badgeId: string;

    /** Indique si le badge a été attribué */
    readonly awarded: boolean;

    /** Raison de l'attribution ou du refus */
    readonly reason: string;

    /** Progression vers l'obtention (0-100) */
    readonly progressTowards: number;

    /** Critères manquants (optionnel) */
    readonly missingCriteria?: readonly string[];

    /** Prochaine étape recommandée (optionnel) */
    readonly nextStep?: string;
}

/**
 * Configuration du système de badges
 */
export interface BadgeSystemConfig {
    /** Active l'attribution automatique */
    readonly enableAutoAward?: boolean;

    /** Active les badges par défaut */
    readonly enableDefaultBadges?: boolean;

    /** Limite quotidienne d'attribution */
    readonly dailyBadgeLimit?: number;

    /** Délai minimum entre attributions (ms) */
    readonly minTimeBetweenAwards?: number;

    /** Active les notifications d'attribution */
    readonly enableNotifications?: boolean;

    /** Configuration des catégories actives */
    readonly enabledCategories?: readonly BadgeCategory[];

    /** Configuration des difficultés actives */
    readonly enabledDifficulties?: readonly BadgeDifficulty[];
}

/**
 * Progression d'apprentissage utilisateur (interface simplifiée pour badges)
 */
export interface LearningProgress {
    /** Identifiant utilisateur */
    readonly userId: string;

    /** Niveau actuel */
    readonly level: number;

    /** Expérience totale */
    readonly totalExperience: number;

    /** Modules complétés */
    readonly completedModules: readonly string[];

    /** Badges obtenus */
    readonly earnedBadges: readonly string[];

    /** Tentatives de quiz par module */
    readonly quizAttempts: Record<string, readonly QuizAttempt[]>;

    /** Historique des interactions */
    readonly interactionHistory: readonly InteractionRecord[];

    /** Statistiques de performance */
    readonly performanceStats?: PerformanceStats;
}

/**
 * Tentative de quiz
 */
export interface QuizAttempt {
    /** Identifiant de la tentative */
    readonly id: string;

    /** Score obtenu (0-100) */
    readonly score: number;

    /** Nombre de réponses correctes */
    readonly correctAnswers: number;

    /** Nombre total de questions */
    readonly totalQuestions: number;

    /** Temps passé en millisecondes */
    readonly timeSpent: number;

    /** Date de la tentative */
    readonly completedAt: Date;
}

/**
 * Enregistrement d'interaction
 */
export interface InteractionRecord {
    /** Identifiant de l'interaction */
    readonly id: string;

    /** Type d'interaction */
    readonly type: string;

    /** Module ou contenu concerné */
    readonly contentId: string;

    /** Durée de l'interaction (ms) */
    readonly duration: number;

    /** Timestamp de l'interaction */
    readonly timestamp: Date;

    /** Succès de l'interaction */
    readonly success: boolean;
}

/**
 * Statistiques de performance
 */
export interface PerformanceStats {
    /** Score moyen */
    readonly averageScore: number;

    /** Temps moyen par exercice */
    readonly averageTime: number;

    /** Taux de réussite global */
    readonly successRate: number;

    /** Série d'étude actuelle (jours) */
    readonly currentStreak: number;

    /** Plus longue série d'étude */
    readonly longestStreak: number;

    /** Dernière activité */
    readonly lastActivity: Date;
}

/**
 * Critères d'évaluation personnalisés pour les badges
 */
export interface CustomBadgeCriteria {
    /** Type de critère */
    readonly type: 'progression' | 'completion' | 'achievement' | 'consistency' | 'custom';

    /** Valeur seuil à atteindre */
    readonly threshold: number;

    /** Fonction d'évaluation personnalisée (optionnelle) */
    readonly evaluator?: (progress: LearningProgress) => boolean;

    /** Description du critère */
    readonly description?: string;

    /** Unité de mesure */
    readonly unit?: string;
}

/**
 * Statistiques des badges
 */
export interface BadgeStatistics {
    /** Nombre total de badges */
    readonly totalBadges: number;

    /** Badges par catégorie */
    readonly badgesByCategory: Readonly<Record<BadgeCategory, number>>;

    /** Badges par difficulté */
    readonly badgesByDifficulty: Readonly<Record<BadgeDifficulty, number>>;

    /** Taux d'obtention moyen */
    readonly averageEarnRate: number;

    /** Badge le plus obtenu */
    readonly mostEarnedBadge?: Badge;

    /** Badge le plus rare */
    readonly rarestBadge?: Badge;
}

/**
 * Événement d'attribution de badge
 */
export interface BadgeAwardEvent {
    /** Identifiant de l'événement */
    readonly id: string;

    /** Identifiant utilisateur */
    readonly userId: string;

    /** Badge attribué */
    readonly badge: Badge;

    /** Timestamp de l'attribution */
    readonly awardedAt: Date;

    /** Contexte de l'attribution */
    readonly context?: Readonly<Record<string, unknown>>;

    /** Source de l'attribution */
    readonly source: 'automatic' | 'manual' | 'system';
}

/**
 * Factory functions pour créer des badges
 */
export const BadgeFactory = {
    /**
     * Crée un badge de progression
     */
    createProgressionBadge(
        id: string,
        title: string,
        description: string,
        level: number,
        difficulty: BadgeDifficulty = 'easy'
    ): Badge {
        return {
            id,
            name: title,
            title,
            description,
            imageUrl: `/badges/progression/${id}.png`,
            criteria: `Atteindre le niveau ${level}`,
            icon: `${id}.png`,
            pointsReward: level * 100,
            difficulty,
            category: 'progression'
        };
    },

    /**
     * Crée un badge de complétion
     */
    createCompletionBadge(
        id: string,
        title: string,
        description: string,
        moduleCount: number,
        difficulty: BadgeDifficulty = 'medium'
    ): Badge {
        return {
            id,
            name: title,
            title,
            description,
            imageUrl: `/badges/completion/${id}.png`,
            criteria: `Compléter ${moduleCount} modules`,
            icon: `${id}.png`,
            pointsReward: moduleCount * 50,
            difficulty,
            category: 'completion'
        };
    },

    /**
     * Crée un badge de réalisation
     */
    createAchievementBadge(
        id: string,
        title: string,
        description: string,
        criteria: string,
        points: number,
        difficulty: BadgeDifficulty = 'hard'
    ): Badge {
        return {
            id,
            name: title,
            title,
            description,
            imageUrl: `/badges/achievement/${id}.png`,
            criteria,
            icon: `${id}.png`,
            pointsReward: points,
            difficulty,
            category: 'achievement'
        };
    },

    /**
     * Crée un badge de régularité
     */
    createConsistencyBadge(
        id: string,
        title: string,
        description: string,
        streakDays: number,
        difficulty: BadgeDifficulty = 'medium'
    ): Badge {
        return {
            id,
            name: title,
            title,
            description,
            imageUrl: `/badges/consistency/${id}.png`,
            criteria: `Maintenir une série de ${streakDays} jours`,
            icon: `${id}.png`,
            pointsReward: streakDays * 10,
            difficulty,
            category: 'consistency'
        };
    }
};

/**
 * Utilitaires pour les badges
 */
export const BadgeUtils = {
    /**
     * Valide la structure d'un badge
     */
    validateBadge(badge: Badge): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!badge.id?.trim()) {
            errors.push('Un badge doit avoir un identifiant unique non vide');
        }

        if (!badge.title?.trim()) {
            errors.push('Un badge doit avoir un titre non vide');
        }

        if (!badge.description?.trim()) {
            errors.push('Un badge doit avoir une description non vide');
        }

        const validCategories: readonly BadgeCategory[] = ['progression', 'completion', 'achievement', 'consistency'];
        if (!validCategories.includes(badge.category)) {
            errors.push(`Catégorie de badge invalide: ${badge.category}`);
        }

        const validDifficulties: readonly BadgeDifficulty[] = ['easy', 'medium', 'hard', 'legendary'];
        if (!validDifficulties.includes(badge.difficulty)) {
            errors.push(`Difficulté de badge invalide: ${badge.difficulty}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Calcule le score d'un badge basé sur sa rareté
     */
    calculateRarityScore(badge: ExtendedBadge): number {
        if (!badge.earnedPercentage) return 1;

        // Plus le badge est rare, plus le score est élevé
        return Math.max(0.1, 1 - (badge.earnedPercentage / 100));
    },

    /**
     * Détermine si un badge est rare
     */
    isRareBadge(badge: ExtendedBadge, threshold: number = 0.05): boolean {
        return (badge.earnedPercentage || 0) < threshold * 100;
    },

    /**
     * Groupe les badges par propriété
     */
    groupBadgesByProperty<K extends keyof Badge>(
        badges: readonly Badge[],
        property: K
    ): Record<string, Badge[]> {
        return badges.reduce((acc, badge) => {
            const key = String(badge[property]);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(badge);
            return acc;
        }, {} as Record<string, Badge[]>);
    }
};

/**
 * Constantes pour le système de badges
 */
export const BADGE_CONSTANTS = {
    /** Catégories de badges */
    CATEGORIES: ['progression', 'completion', 'achievement', 'consistency'] as const,

    /** Niveaux de difficulté */
    DIFFICULTIES: ['easy', 'medium', 'hard', 'legendary'] as const,

    /** Points par difficulté */
    POINTS_BY_DIFFICULTY: {
        easy: 100,
        medium: 250,
        hard: 500,
        legendary: 1000
    } as const,

    /** Couleurs par catégorie */
    CATEGORY_COLORS: {
        progression: '#3B82F6',
        completion: '#10B981',
        achievement: '#F59E0B',
        consistency: '#8B5CF6'
    } as const,

    /** Configuration par défaut */
    DEFAULT_CONFIG: {
        enableAutoAward: true,
        enableDefaultBadges: true,
        dailyBadgeLimit: 5,
        minTimeBetweenAwards: 60000, // 1 minute
        enableNotifications: true,
        enabledCategories: ['progression', 'completion', 'achievement', 'consistency'] as const,
        enabledDifficulties: ['easy', 'medium', 'hard', 'legendary'] as const
    } as const
} as const;