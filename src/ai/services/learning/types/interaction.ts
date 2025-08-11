/**
 * Types d'interaction pour le module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/interaction.ts
 * @module ai/services/learning/types
 * @description Types spécialisés pour les interactions utilisateur et leurs filtres
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

import type { InteractionType } from './base';

/**
 * Informations sur l'appareil utilisé
 * @interface DeviceInfo
 */
export interface DeviceInfo {
    /** Type d'appareil */
    readonly type: 'desktop' | 'tablet' | 'mobile' | 'tv' | 'vr' | 'other';
    /** Système d'exploitation */
    readonly os: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'other';
    /** Version du navigateur (optionnel) */
    readonly browserVersion?: string;
    /** Support tactile disponible (optionnel) */
    readonly touchSupported?: boolean;
    /** Résolution de l'écran (optionnel) */
    readonly screenResolution?: {
        readonly width: number;
        readonly height: number;
    };
    /** Informations sur la connectivité (optionnel) */
    readonly connectivity?: {
        readonly type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
        readonly speed?: 'slow' | 'medium' | 'fast';
    };
}

/**
 * Détails spécifiques d'une interaction utilisateur
 * @interface InteractionDetails
 */
export interface InteractionDetails {
    /** Écran ou composant où l'interaction a eu lieu */
    readonly screen: string;
    /** Succès de l'interaction */
    readonly success: boolean;
    /** Score obtenu lors de l'interaction (optionnel) */
    readonly score?: number;
    /** Nombre de tentatives (optionnel) */
    readonly attempts?: number;
    /** Position de l'interaction (optionnel) */
    readonly position?: {
        readonly x: number;
        readonly y: number;
    };
    /** Élément ciblé (optionnel) */
    readonly targetElement?: string;
    /** Données contextuelles supplémentaires (optionnel) */
    readonly contextData?: Record<string, string | number | boolean>;
    /** Erreurs rencontrées (optionnel) */
    readonly errors?: ReadonlyArray<string>;
    /** Aide utilisée (optionnel) */
    readonly helpUsed?: boolean;
    /** Temps de réflexion en millisecondes (optionnel) */
    readonly thinkingTime?: number;
}

/**
 * Représente une interaction utilisateur complète dans le système
 * @interface UserInteraction
 */
export interface UserInteraction {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Horodatage de l'interaction */
    readonly timestamp: Date;
    /** Identifiant de l'activité */
    readonly activityId: string;
    /** Type d'interaction */
    readonly interactionType: InteractionType;
    /** Durée de l'interaction en millisecondes */
    readonly duration: number;
    /** Détails spécifiques de l'interaction */
    readonly details: InteractionDetails;
    /** Informations sur l'appareil utilisé */
    readonly deviceInfo: DeviceInfo;
    /** Identifiant de session (optionnel) */
    readonly sessionId?: string;
    /** Contexte d'apprentissage (optionnel) */
    readonly learningContext?: {
        readonly level: string;
        readonly skill: string;
        readonly difficulty: number;
    };
}

/**
 * Filtre pour la recherche d'interactions
 * @interface InteractionFilter
 */
export interface InteractionFilter {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Types d'interactions à inclure (optionnel) */
    readonly interactionTypes?: ReadonlyArray<InteractionType>;
    /** Identifiants d'activités à inclure (optionnel) */
    readonly activityIds?: ReadonlyArray<string>;
    /** Date de début pour la recherche (optionnel) */
    readonly startDate?: Date;
    /** Date de fin pour la recherche (optionnel) */
    readonly endDate?: Date;
    /** Nombre maximum de résultats (optionnel) */
    readonly limit?: number;
    /** Identifiants de session à inclure (optionnel) */
    readonly sessionIds?: ReadonlyArray<string>;
    /** Filtres sur l'appareil utilisé (optionnel) */
    readonly deviceFilters?: {
        readonly types?: ReadonlyArray<DeviceInfo['type']>;
        readonly os?: ReadonlyArray<DeviceInfo['os']>;
    };
    /** Filtres sur les performances (optionnel) */
    readonly performanceFilters?: {
        readonly minScore?: number;
        readonly maxScore?: number;
        readonly minDuration?: number;
        readonly maxDuration?: number;
        readonly successOnly?: boolean;
    };
}

/**
 * Statistiques d'interactions utilisateur
 * @interface InteractionStatistics
 */
export interface InteractionStatistics {
    /** Nombre total d'interactions */
    readonly totalInteractions: number;
    /** Durée totale en millisecondes */
    readonly totalDuration: number;
    /** Durée moyenne en millisecondes */
    readonly averageDuration: number;
    /** Taux de succès (0-1) */
    readonly successRate: number;
    /** Score moyen (optionnel) */
    readonly averageScore?: number;
    /** Répartition par type d'interaction */
    readonly interactionsByType: Record<InteractionType, number>;
    /** Répartition par activité */
    readonly interactionsByActivity: Record<string, number>;
    /** Répartition par appareil */
    readonly interactionsByDevice: Record<DeviceInfo['type'], number>;
    /** Interactions par jour (derniers 30 jours) */
    readonly dailyInteractions: Record<string, number>;
    /** Statistiques de performance */
    readonly performanceStats: {
        readonly bestStreak: number;
        readonly currentStreak: number;
        readonly totalErrors: number;
        readonly helpRequests: number;
        readonly averageThinkingTime?: number;
    };
    /** Période couverte par les statistiques */
    readonly period: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
}

/**
 * Configuration pour le service d'interactions utilisateur
 * @interface InteractionServiceConfig
 */
export interface InteractionServiceConfig {
    /** Taille maximale du cache d'interactions */
    readonly maxCacheSize: number;
    /** Temps de rétention du cache en millisecondes */
    readonly retentionTime: number;
    /** Intervalle de nettoyage automatique en millisecondes */
    readonly cleanupInterval: number;
    /** Activer l'agrégation automatique des métriques */
    readonly enableAutoAggregation: boolean;
    /** Seuil de performance pour les alertes */
    readonly performanceThreshold: number;
    /** Nombre maximum d'interactions à traiter en batch */
    readonly batchSize: number;
    /** Délai maximum pour l'envoi des données en millisecondes */
    readonly maxFlushDelay: number;
}

/**
 * Résultat d'une recherche d'interactions
 * @interface InteractionSearchResult
 */
export interface InteractionSearchResult {
    /** Interactions trouvées */
    readonly interactions: ReadonlyArray<UserInteraction>;
    /** Nombre total d'interactions correspondant aux critères */
    readonly totalCount: number;
    /** Indique s'il y a plus de résultats */
    readonly hasMore: boolean;
    /** Token pour la pagination (optionnel) */
    readonly nextPageToken?: string;
    /** Métadonnées de la recherche */
    readonly metadata: {
        readonly searchTime: number;
        readonly fromCache: boolean;
        readonly filters: InteractionFilter;
    };
}

/**
 * Options pour l'agrégation d'interactions
 * @interface InteractionAggregationOptions
 */
export interface InteractionAggregationOptions {
    /** Grouper par type d'interaction */
    readonly groupByType?: boolean;
    /** Grouper par activité */
    readonly groupByActivity?: boolean;
    /** Grouper par appareil */
    readonly groupByDevice?: boolean;
    /** Grouper par jour */
    readonly groupByDay?: boolean;
    /** Inclure les statistiques détaillées */
    readonly includeDetailedStats?: boolean;
    /** Inclure les données de performance */
    readonly includePerformanceData?: boolean;
}