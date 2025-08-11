/**
 * @file: src/ai/coordinators/types/metrics.types.ts
 * Types communs pour le système de métriques
 */

/**
 * Type pour les tags des métriques
 */
export type MetricTags = Record<string, string>;

/**
 * Type de métrique (jauge, compteur, histogramme, résumé)
 */
export type MetricType = 'gauge' | 'counter' | 'histogram' | 'summary';

/**
 * Interface pour une valeur de métrique
 */
export interface MetricValue {
    /** Valeur de la métrique */
    value: number;
    /** Horodatage */
    timestamp: number;
    /** Tags associés */
    tags: MetricTags;
}

/**
 * Interface pour une valeur de métrique stockée (usage interne)
 */
export interface StoredMetricValue extends MetricValue {
    /** Type de métrique */
    type: MetricType;
}

/**
 * Statistiques calculées pour une métrique
 */
export interface MetricStats {
    /** Valeur minimale */
    min: number;
    /** Valeur maximale */
    max: number;
    /** Valeur moyenne */
    avg: number;
    /** Nombre de valeurs */
    count: number;
    /** Somme des valeurs */
    sum: number;
    /** Dernière valeur */
    last: number;
}