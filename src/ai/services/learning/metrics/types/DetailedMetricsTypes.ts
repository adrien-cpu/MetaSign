/**
 * @file src/ai/services/learning/metrics/types/DetailedMetricsTypes.ts
 * @description Types détaillés pour les métriques d'apprentissage
 * @module DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce fichier définit les types détaillés utilisés par le système de métriques
 * d'apprentissage, offrant une structure plus riche que les interfaces de base.
 */

import { LearningMetric, UserMetricsProfile } from '../interfaces/MetricsInterfaces';

/**
 * Niveau d'apprentissage avec date d'obtention et durée
 * @interface LevelHistoryEntry
 */
export interface LevelHistoryEntry {
    /**
     * Niveau atteint
     */
    level: string;

    /**
     * Date d'obtention du niveau
     */
    achievedAt: Date;

    /**
     * Durée passée à ce niveau (en jours)
     * @optional
     */
    duration?: number;
}

/**
 * Progression détaillée de l'apprentissage
 * @interface DetailedProgressionMetrics
 */
export interface DetailedProgressionMetrics {
    /**
     * Niveau actuel
     */
    currentLevel: string;

    /**
     * Progression dans le niveau actuel (0-1)
     */
    progressInCurrentLevel: number;

    /**
     * Historique des niveaux atteints
     */
    levelHistory: LevelHistoryEntry[];

    /**
     * Vitesse de progression (niveaux par mois)
     */
    progressionSpeed: number;

    /**
     * Progression par domaine de compétence
     */
    skillAreaProgress: Record<string, number>;

    /**
     * Temps estimé jusqu'au prochain niveau (en jours)
     * @optional
     */
    estimatedTimeToNextLevel?: number;

    /**
     * Taux de progression par domaine comparé à la moyenne
     * @optional
     */
    relativeProgressionRates?: Record<string, number>;
}

/**
 * Performance détaillée d'apprentissage
 * @interface DetailedPerformanceMetrics
 */
export interface DetailedPerformanceMetrics {
    /**
     * Taux de réussite global (0-1)
     */
    successRate: number;

    /**
     * Taux de réussite par type d'exercice
     */
    exerciseTypeSuccessRates: Record<string, number>;

    /**
     * Taux de réussite par compétence
     */
    skillSuccessRates: Record<string, number>;

    /**
     * Nombre total d'exercices complétés
     */
    totalExercisesCompleted: number;

    /**
     * Temps moyen par exercice (en secondes)
     */
    averageTimePerExercise: number;

    /**
     * Temps moyen par type d'exercice (en secondes)
     */
    exerciseTypeAverageTimes: Record<string, number>;

    /**
     * Tendance de performance (variation sur 30 jours)
     */
    performanceTrend: number;

    /**
     * Scores des derniers exercices
     */
    recentScores: Array<{
        exerciseId: string;
        score: number;
        timestamp: Date;
    }>;

    /**
     * Taux d'erreurs par catégorie
     */
    errorRates: Record<string, number>;

    /**
     * Nombre de tentatives moyennes par exercice réussi
     */
    averageAttemptsUntilSuccess: number;
}

/**
 * Métriques détaillées de maîtrise
 * @interface DetailedMasteryMetrics
 */
export interface DetailedMasteryMetrics {
    /**
     * Compétences maîtrisées
     */
    masteredSkills: string[];

    /**
     * Compétences faibles
     */
    weaknessSkills: string[];

    /**
     * Nombre de compétences maîtrisées
     */
    masteredSkillsCount: number;

    /**
     * Niveaux de maîtrise par compétence (0-1)
     */
    skillMasteryLevels: Record<string, number>;

    /**
     * Courbe d'oubli estimée par compétence
     */
    forgettingCurves: Record<string, Array<{
        daysFromLastPractice: number;
        retentionRate: number;
    }>>;

    /**
     * Taux de rétention estimé par compétence
     */
    retentionRates: Record<string, number>;

    /**
     * Cohérence des performances par compétence
     */
    performanceConsistency: Record<string, number>;

    /**
     * Vitesse d'acquisition des compétences
     */
    skillAcquisitionRates: Record<string, number>;
}

/**
 * Métriques détaillées d'engagement
 * @interface DetailedEngagementMetrics
 */
export interface DetailedEngagementMetrics {
    /**
     * Durée moyenne des sessions (en minutes)
     */
    averageSessionDuration: number;

    /**
     * Nombre d'exercices par session
     */
    exercisesPerSession: number;

    /**
     * Fréquence d'utilisation (sessions par semaine)
     */
    usageFrequency: number;

    /**
     * Temps total d'apprentissage (en minutes)
     */
    totalLearningTime: number;

    /**
     * Activité par jour de la semaine
     */
    activityByDayOfWeek: Record<number, number>;

    /**
     * Activité par heure de la journée
     */
    activityByHourOfDay: Record<number, number>;

    /**
     * Taux de complétion des sessions
     */
    sessionCompletionRate: number;

    /**
     * Nombre de jours consécutifs d'activité
     */
    streakDays: number;

    /**
     * Nombre maximal de jours consécutifs d'activité
     */
    maxStreakDays: number;

    /**
     * Niveau d'interactivité (interactions par minute)
     */
    interactivityLevel: number;
}

/**
 * Profil détaillé des métriques d'un utilisateur
 * @interface DetailedUserMetricsProfile
 * @extends {UserMetricsProfile}
 */
export interface DetailedUserMetricsProfile extends UserMetricsProfile {
    /**
     * Métriques de progression détaillées
     */
    progression: DetailedProgressionMetrics;

    /**
     * Métriques de performance détaillées
     */
    performance: DetailedPerformanceMetrics;

    /**
     * Métriques de maîtrise détaillées
     */
    mastery: DetailedMasteryMetrics;

    /**
     * Métriques d'engagement détaillées
     */
    engagement: DetailedEngagementMetrics;

    /**
     * Métriques standards calculées
     */
    standardMetrics: Record<string, LearningMetric>;

    /**
     * Métriques personnalisées
     */
    customMetrics: Record<string, LearningMetric>;

    /**
     * Date de dernière mise à jour
     */
    lastUpdated: Date;

    /**
     * Version du profil
     */
    profileVersion: string;
}