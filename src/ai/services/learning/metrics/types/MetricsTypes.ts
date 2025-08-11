/**
 * @file src/ai/services/learning/metrics/types/MetricsTypes.ts
 * @description Types spécifiques pour les métriques d'apprentissage
 * @module MetricsTypes
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module définit les types utilisés dans le système de métriques d'apprentissage,
 * complémentaires aux interfaces principales.
 */

import { MetricsFilterOptions } from '../interfaces/MetricsInterfaces';

/**
 * Options du store de métriques
 * @interface MetricsStoreOptions
 */
export interface MetricsStoreOptions {
    /**
     * URL de la base de données
     */
    dbUrl?: string;

    /**
     * Période de rétention des données (en jours)
     */
    retentionPeriod?: number;

    /**
     * Activer la persistance des données
     */
    enablePersistence?: boolean;

    /**
     * Mode de stockage
     */
    storageMode?: 'memory' | 'database' | 'file';
}

/**
 * Entrée d'historique de métrique
 * @interface MetricHistoryEntry
 */
export interface MetricHistoryEntry {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Identifiant de la métrique
     */
    metricId: string;

    /**
     * Horodatage
     */
    timestamp: Date;

    /**
     * Valeur de la métrique
     */
    value: unknown;

    /**
     * Métadonnées
     */
    metadata?: Record<string, unknown>;
}

/**
 * Options d'exportation de métriques
 * @interface MetricsExportOptions
 */
export interface MetricsExportOptions extends MetricsFilterOptions {
    /**
     * Format d'exportation
     */
    format: 'json' | 'csv' | 'excel';

    /**
     * Inclure les métadonnées
     */
    includeMetadata?: boolean;

    /**
     * Fusionner les données liées
     */
    mergeRelatedData?: boolean;

    /**
     * Liste des métriques à inclure
     */
    includeMetrics?: string[];

    /**
     * Liste des métriques à exclure
     */
    excludeMetrics?: string[];

    /**
     * Exporter les données brutes
     */
    rawData?: boolean;
}

/**
 * Types de format de données
 * @enum {string}
 */
export enum DataFormat {
    NUMERIC = 'numeric',
    STRING = 'string',
    BOOLEAN = 'boolean',
    DATE = 'date',
    OBJECT = 'object',
    ARRAY = 'array',
    MIXED = 'mixed'
}

/**
 * Informations sur le format d'une métrique
 * @interface MetricFormatInfo
 */
export interface MetricFormatInfo {
    /**
     * Type de données
     */
    dataType: DataFormat;

    /**
     * Unité de mesure
     */
    unit?: string;

    /**
     * Précision pour les nombres
     */
    precision?: number;

    /**
     * Format d'affichage
     */
    displayFormat?: string;

    /**
     * Minimum autorisé
     */
    min?: number;

    /**
     * Maximum autorisé
     */
    max?: number;

    /**
     * Valeurs autorisées pour les énumérations
     */
    allowedValues?: unknown[];
}

/**
 * Options d'agrégation de métriques
 * @interface MetricsAggregationOptions
 */
export interface MetricsAggregationOptions {
    /**
     * Fonction d'agrégation
     */
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';

    /**
     * Période de regroupement
     */
    groupBy?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

    /**
     * Ignorer les valeurs nulles
     */
    ignoreNull?: boolean;

    /**
     * Valeur par défaut si aucune donnée
     */
    defaultValue?: unknown;
}

/**
 * Résultat d'analyse comparative de métriques
 * @interface MetricsBenchmarkResult
 */
export interface MetricsBenchmarkResult {
    /**
     * Identifiant de la métrique
     */
    metricId: string;

    /**
     * Valeur de l'utilisateur
     */
    userValue: unknown;

    /**
     * Valeur moyenne de référence
     */
    benchmarkAverage: unknown;

    /**
     * Différence en pourcentage
     */
    percentDifference: number;

    /**
     * Percentile de l'utilisateur
     */
    percentile?: number;

    /**
     * Classement relatif
     */
    ranking?: string;
}

/**
 * Contexte de collecte de métriques
 * @interface MetricsCollectionContext
 */
export interface MetricsCollectionContext {
    /**
     * Source de la métrique
     */
    source: 'exercise' | 'session' | 'assessment' | 'system' | 'custom';

    /**
     * Environnement
     */
    environment: 'production' | 'development' | 'testing';

    /**
     * Appareil
     */
    device?: string;

    /**
     * Navigateur
     */
    browser?: string;

    /**
     * Version de l'application
     */
    appVersion?: string;

    /**
     * Informations additionnelles
     */
    additionalInfo?: Record<string, unknown>;
}