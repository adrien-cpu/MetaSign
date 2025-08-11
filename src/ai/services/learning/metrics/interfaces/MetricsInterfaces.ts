/**
 * @file src/ai/services/learning/metrics/interfaces/MetricsInterfaces.ts
 * @description Interfaces principales pour le système de métriques d'apprentissage
 * @module MetricsInterfaces
 * @requires @/ai/services/learning/LearningService
 * @requires @/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem
 * @requires @/ai/services/learning/human/coda/codavirtuel/repositories/UserReverseApprenticeshipRepository
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { UserReverseProfile } from '../../human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { ExerciseResult } from '../../human/coda/codavirtuel/repositories/UserReverseApprenticeshipRepository';

/**
 * Interface pour une session d'apprentissage
 * @interface LearningSession
 */
export interface LearningSession {
    /** Identifiant de la session */
    sessionId: string;
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Date de début */
    startTime: Date;
    /** Date de fin (optionnelle) */
    endTime?: Date;
    /** Statistiques de la session */
    stats: {
        /** Nombre d'exercices complétés */
        exercisesCompleted: number;
        /** Score moyen */
        averageScore?: number;
        /** Temps total en minutes */
        totalTime?: number;
    };
}

/**
 * Types de métriques disponibles
 * @enum {string}
 */
export enum MetricType {
    NUMBER = 'number',
    PERCENTAGE = 'percentage',
    STRING = 'string',
    BOOLEAN = 'boolean',
    ARRAY = 'array',
    OBJECT = 'object'
}

/**
 * Interface pour une métrique d'apprentissage
 * @interface LearningMetric
 */
export interface LearningMetric {
    /** Identifiant unique de la métrique */
    id: string;
    /** Nom de la métrique */
    name: string;
    /** Description de la métrique */
    description?: string;
    /** Type de la métrique */
    type?: string;
    /** Valeur actuelle */
    value: unknown;
    /** Unité de mesure */
    unit?: string;
    /** Date de dernière mise à jour */
    updatedAt?: Date;
    /** Type de valeur (pour validation et formatage) */
    valueType?: 'number' | 'boolean' | 'string' | 'object' | 'array';
    /** Catégorie de la métrique */
    category?: string;
    /** Tags pour le filtrage et la recherche */
    tags?: string[];
    /** Métadonnées associées */
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour un profil de métriques utilisateur
 * @interface UserMetricsProfile
 */
export interface UserMetricsProfile {
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Nom de l'utilisateur (optionnel) */
    userName?: string;
    /** Date de création du profil */
    createdAt?: Date;
    /** Date de dernière modification */
    updatedAt?: Date;
    /** Métriques standards */
    standardMetrics?: Record<string, LearningMetric>;
    /** Métriques personnalisées */
    customMetrics?: Record<string, LearningMetric>;
    /** Objectifs d'apprentissage */
    learningGoals?: Record<string, LearningGoal>;
    /** Configuration et préférences */
    settings?: MetricsSettings;
    /** Préférences de métriques (affichage, notifications, etc.) */
    preferences?: {
        displayPreferences?: {
            defaultView?: 'daily' | 'weekly' | 'monthly';
            charts?: {
                type?: 'line' | 'bar' | 'radar';
                colors?: string[];
            };
        };
        notificationPreferences?: {
            enabled?: boolean;
            frequency?: 'daily' | 'weekly' | 'monthly';
            targets?: ('improvement' | 'decline' | 'milestone')[];
        };
    };
}

/**
 * Interface pour un objectif d'apprentissage
 * @interface LearningGoal
 */
export interface LearningGoal {
    /** Identifiant de l'objectif */
    id: string;
    /** Nom de l'objectif */
    name: string;
    /** Description de l'objectif */
    description?: string;
    /** Métrique associée */
    metricId: string;
    /** Valeur cible */
    targetValue: unknown;
    /** Date de début */
    startDate: Date;
    /** Date d'échéance */
    dueDate?: Date;
    /** Statut de l'objectif */
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    /** Progression actuelle (0-100) */
    progress: number;
}

/**
 * Interface pour les options de filtrage des métriques
 * @interface MetricsFilterOptions
 */
export interface MetricsFilterOptions {
    /** Date de début pour le filtrage */
    startDate?: Date;
    /** Date de fin pour le filtrage */
    endDate?: Date;
    /** Types de métriques à inclure */
    metricTypes?: string[];
    /** Tags de filtrage */
    tags?: string[];
    /** Nombre maximum de résultats à retourner */
    limit?: number;
    /** Nombre de résultats à ignorer (pour la pagination) */
    offset?: number;
    /** Filtre sur les catégories */
    categories?: string[];
    /** Ordre de tri */
    sort?: 'asc' | 'desc';
    /** Champ pour le tri */
    sortBy?: 'timestamp' | 'value';
}

/**
 * Interface pour les paramètres des métriques
 * @interface MetricsSettings
 */
export interface MetricsSettings {
    /** Activer le suivi automatique */
    enableAutoTracking: boolean;
    /** Fréquence de suivi */
    trackingFrequency: 'daily' | 'weekly' | 'monthly';
    /** Préférences de notification */
    notifications: {
        /** Activer les notifications */
        enabled: boolean;
        /** Types de notifications */
        types: Array<'goal_progress' | 'goal_completion' | 'milestone' | 'reminder'>;
    };
    /** Options d'affichage */
    display: {
        /** Métriques favorites à afficher en priorité */
        favoriteMetrics: string[];
        /** Style de visualisation par défaut */
        defaultVisualization: 'line' | 'bar' | 'radar' | 'table';
    };
}

/**
 * Interface pour le service de stockage des métriques
 * @interface IMetricsStore
 */
export interface IMetricsStore {
    /**
     * Sauvegarde un profil de métriques
     * @param {UserMetricsProfile} profile - Profil de métriques
     * @returns {Promise<UserMetricsProfile>} Profil sauvegardé
     */
    saveProfile(profile: UserMetricsProfile): Promise<UserMetricsProfile>;

    /**
     * Charge un profil de métriques
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<UserMetricsProfile | undefined>} Profil de métriques ou undefined si non trouvé
     */
    loadProfile(userId: string): Promise<UserMetricsProfile | undefined>;

    /**
     * Sauvegarde un instantané de métrique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningMetric} metric - Métrique à sauvegarder
     * @returns {Promise<LearningMetric>} Métrique sauvegardée
     */
    saveMetricSnapshot(userId: string, metric: LearningMetric): Promise<LearningMetric>;

    /**
     * Charge l'historique d'une métrique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Promise<Array<{ timestamp: Date; value: unknown }>>} Historique de la métrique
     */
    loadMetricHistory(
        userId: string,
        metricId: string,
        options?: MetricsFilterOptions
    ): Promise<Array<{ timestamp: Date; value: unknown }>>;

    /**
     * Supprime un profil de métriques
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<boolean>} Vrai si le profil a été supprimé
     */
    deleteProfile(userId: string): Promise<boolean>;

    /**
     * Supprime une métrique personnalisée
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @returns {Promise<boolean>} Vrai si la métrique a été supprimée
     */
    deleteCustomMetric(userId: string, metricId: string): Promise<boolean>;

    /**
     * Ajoute une métrique d'exercice
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} exerciseId - Identifiant de l'exercice
     * @param {Record<string, unknown>} metrics - Métriques à ajouter
     * @returns {Promise<Record<string, unknown>>} Métriques enregistrées
     */
    addExerciseMetric(
        userId: string,
        exerciseId: string,
        metrics: Record<string, unknown>
    ): Promise<Record<string, unknown>>;

    /**
     * Récupère les métriques pour un utilisateur
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Promise<Record<string, LearningMetric>>} Métriques de l'utilisateur
     */
    getMetrics(
        userId: string,
        options?: MetricsFilterOptions
    ): Promise<Record<string, LearningMetric>>;
}

/**
 * Interface principale du collecteur de métriques
 * @interface ILearningMetricsCollector
 */
export interface ILearningMetricsCollector {
    /**
     * Enregistre un résultat d'exercice
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ExerciseResult} exerciseResult - Résultat de l'exercice
     * @returns {Promise<UserMetricsProfile>} Profil de métriques mis à jour
     */
    recordExerciseResult(userId: string, exerciseResult: ExerciseResult): Promise<UserMetricsProfile>;

    /**
     * Enregistre les métriques d'une session
     * @param {LearningSession} session - Session d'apprentissage
     * @returns {Promise<UserMetricsProfile>} Profil de métriques mis à jour
     */
    recordSessionMetrics(session: LearningSession): Promise<UserMetricsProfile>;

    /**
     * Met à jour le profil d'apprentissage
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {UserReverseProfile} reverseProfile - Profil d'apprentissage inversé
     * @returns {Promise<UserMetricsProfile>} Profil de métriques mis à jour
     */
    updateLearningProfile(userId: string, reverseProfile: UserReverseProfile): Promise<UserMetricsProfile>;

    /**
     * Obtient le profil de métriques d'un utilisateur
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<UserMetricsProfile>} Profil de métriques
     */
    getUserMetricsProfile(userId: string): Promise<UserMetricsProfile>;

    /**
     * Obtient des métriques spécifiques
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string[]} metricIds - Identifiants des métriques
     * @returns {Promise<LearningMetric[]>} Métriques demandées
     */
    getUserMetrics(userId: string, metricIds: string[]): Promise<LearningMetric[]>;

    /**
     * Obtient l'historique d'une métrique
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Promise<Array<{ timestamp: Date; value: unknown }>>} Historique
     */
    getMetricHistory(
        userId: string,
        metricId: string,
        options?: MetricsFilterOptions
    ): Promise<Array<{ timestamp: Date; value: unknown }>>;

    /**
     * Crée une métrique personnalisée
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {Omit<LearningMetric, 'updatedAt'>} metric - Définition de la métrique
     * @returns {Promise<LearningMetric>} Métrique créée
     */
    createCustomMetric(userId: string, metric: Omit<LearningMetric, 'updatedAt'>): Promise<LearningMetric>;

    /**
     * Met à jour une métrique personnalisée
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {unknown} value - Nouvelle valeur
     * @param {Record<string, unknown>} [metadata] - Métadonnées optionnelles
     * @returns {Promise<LearningMetric>} Métrique mise à jour
     */
    updateCustomMetric(
        userId: string,
        metricId: string,
        value: unknown,
        metadata?: Record<string, unknown>
    ): Promise<LearningMetric>;
}