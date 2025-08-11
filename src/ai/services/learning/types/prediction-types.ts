/**
 * Types liés aux modèles prédictifs pour l'apprentissage adaptatif
 */

/**
 * Caractéristiques utilisateur utilisées par les modèles prédictifs
 */
export interface UserFeatures {
    /**
     * Identifiant unique de l'utilisateur
     */
    userId: string;

    /**
     * Temps total passé sur l'apprentissage (en secondes)
     */
    timeSpent: number;

    /**
     * Nombre de sessions d'apprentissage
     */
    sessionCount: number;

    /**
     * Taux de complétion des modules (0-1)
     */
    completionRate: number;

    /**
     * Score moyen de l'utilisateur (0-1)
     */
    averageScore: number;

    /**
     * Taux de clics (interactions par minute)
     */
    clickRate: number;

    /**
     * Fréquence des pauses (par heure)
     */
    pauseFrequency: number;

    /**
     * Heure de la journée (Date)
     */
    timeOfDay: Date;

    /**
     * Jour de la semaine (0-6, 0 = dimanche)
     */
    dayOfWeek: number;

    /**
     * Taux d'erreur dans les exercices (0-1)
     */
    errorRate: number;

    /**
     * Tendance du temps par tâche (-1 à 1)
     * Valeur positive = diminution du temps par tâche (amélioration)
     */
    timePerTaskTrend: number;

    /**
     * Fréquence des clics (par minute)
     */
    clickFrequency: number;

    /**
     * Nombre de demandes d'aide
     */
    helpRequests: number;

    /**
     * Taux d'abandon des tâches (0-1)
     */
    taskAbandonment: number;

    /**
     * Score de cohérence de navigation (0-1)
     */
    navigationPatternScore: number;

    /**
     * Nombre de révisions d'entrée/corrections
     */
    inputRevisions: number;

    /**
     * Timestamp de la dernière activité
     */
    lastActivityTimestamp: Date;

    /**
     * Caractéristiques additionnelles spécifiques au cas d'usage
     */
    [key: string]: unknown;
}

/**
 * Prédiction d'engagement utilisateur
 */
export interface EngagementPrediction {
    /**
     * Niveau d'engagement prédit (0-1)
     */
    predictedEngagement: number;

    /**
     * Niveau de confiance dans la prédiction (0-1)
     */
    confidence: number;

    /**
     * Facteurs qui contribuent le plus à la prédiction
     */
    topContributingFactors?: Array<{
        factor: string;
        weight: number;
    }>;

    /**
     * Recommandations pour améliorer l'engagement
     */
    recommendations?: string[];

    /**
     * Métadonnées additionnelles sur la prédiction
     */
    metadata?: Record<string, unknown>;
}

/**
 * Prédiction de frustration utilisateur
 */
export interface FrustrationPrediction {
    /**
     * Score de frustration prédit (0-1)
     */
    score: number;

    /**
     * Niveau de confiance dans la prédiction (0-1)
     */
    confidence: number;

    /**
     * Causes probables de frustration identifiées
     */
    probableCauses?: string[];

    /**
     * Niveau de sévérité ('low', 'medium', 'high')
     */
    severity?: 'low' | 'medium' | 'high';

    /**
     * Suggestions pour réduire la frustration
     */
    mitigationSuggestions?: string[];

    /**
     * Métadonnées additionnelles sur la prédiction
     */
    metadata?: Record<string, unknown>;
}