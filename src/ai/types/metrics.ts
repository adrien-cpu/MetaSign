//src/ai/types/metrics.ts

/**
 * Structure pour une série de métriques
 */
export interface MetricSeries {
    /** Valeurs collectées */
    values: PerformanceDataPoint[];

    /** Map des tags associés */
    tags: Map<string, Set<string>>;

    /** Dernier moment d'alerte */
    lastAlertTime: number;
}

/**
 * Structure pour les métriques de performance
 */
export interface PerformanceMetrics {
    /** Plage de temps des métriques */
    timeRange: {
        start: number;
        end: number;
    };

    /** Métriques collectées */
    metrics: Record<string, {
        count: number;
        min: number;
        max: number;
        avg: number;
        latest: number;
        dataPoints: PerformanceDataPoint[];
    }>;
    systems: {
        [systemId: string]: SystemPerformanceMetrics;
    };
    /** 
     * Horodatage de la collecte des métriques 
     */
    timestamp: number;

    /** 
     * Temps de traitement moyen global en ms 
     */
    processingTime?: number;

    /** 
     * Nombre total de requêtes traitées 
     */
    requestsProcessed?: number;

    /** 
     * Nombre total d'erreurs 
     */
    errors?: number;

    /** 
     * Nombre total de hits de cache 
     */
    cacheHits?: number;

    /** 
     * Nombre total de miss de cache 
     */
    cacheMisses?: number;

    /** 
     * Utilisation mémoire globale en MB 
     */
    memoryUsage?: number;
}

/**
 * Métriques de performance pour un système spécifique
 */
export interface SystemPerformanceMetrics {
    /** 
     * Temps de traitement moyen en ms 
     */
    processingTime: number;

    /** 
     * Nombre de requêtes traitées 
     */
    requestsProcessed: number;

    /** 
     * Nombre d'erreurs rencontrées 
     */
    errors: number;

    /** 
     * Taux de succès en pourcentage (0-100) 
     */
    successRate: number;

    /** 
     * Utilisation CPU en pourcentage (0-100) 
     */
    cpuUsage: number;

    /** 
     * Utilisation mémoire en MB 
     */
    memoryUsage: number;

    /** 
     * Taille du cache en MB 
     */
    cacheSize?: number;

    /** 
     * Taux de hit du cache en pourcentage (0-100) 
     */
    cacheHitRate?: number;

    /** 
     * Métriques supplémentaires spécifiques au système 
     */
    [key: string]: number | undefined;
}

/**
 * Types d'événements de performance
 */
export enum PerformanceEventType {
    CPU_WARNING = 'CPU_WARNING',
    CPU_CRITICAL = 'CPU_CRITICAL',
    MEMORY_WARNING = 'MEMORY_WARNING',
    MEMORY_CRITICAL = 'MEMORY_CRITICAL',
    ERROR_RATE_WARNING = 'ERROR_RATE_WARNING',
    ERROR_RATE_CRITICAL = 'ERROR_RATE_CRITICAL',
    LATENCY_WARNING = 'LATENCY_WARNING',
    LATENCY_CRITICAL = 'LATENCY_CRITICAL'
}

/**
 * Événement de performance
 */
export interface PerformanceEvent {
    /** 
     * Type d'événement 
     */
    type: PerformanceEventType;

    /** 
     * Valeur actuelle 
     */
    value: number;

    /** 
     * Seuil déclenché 
     */
    threshold: number;

    /** 
     * Horodatage de l'événement 
     */
    timestamp: number;

    /** 
     * Composant concerné (optionnel) 
     */
    component?: string;

    /** 
     * Données supplémentaires (optionnel) 
     */
    data?: Record<string, unknown>;
}

/**
 * Options de collecte de métriques
 */
export interface MetricsCollectionOptions {
    /** 
     * Intervalle de collecte en ms 
     */
    interval: number;

    /** 
     * Métrique à collecter (si vide, toutes les métriques sont collectées) 
     */
    metrics?: string[];

    /** 
     * Systèmes à surveiller (si vide, tous les systèmes sont surveillés) 
     */
    systems?: string[];

    /** 
     * Seuil d'alerte pour l'utilisation CPU (0-100) 
     */
    cpuWarningThreshold?: number;

    /** 
     * Seuil d'alerte pour l'utilisation mémoire (0-100) 
     */
    memoryWarningThreshold?: number;

    /** 
     * Seuil d'alerte pour le taux d'erreur (0-100) 
     */
    errorRateWarningThreshold?: number;

    /** 
     * Seuil d'alerte pour la latence en ms 
     */
    latencyWarningThreshold?: number;
}

/**
 * Types pour le système de monitoring des performances
 */

/**
 * Types de ressources système surveillées
 */
export type SystemResource = 'cpu' | 'memory' | 'network' | 'storage';

/**
 * Point de données de performance
 */
export interface PerformanceDataPoint {
    /** Timestamp de la mesure */
    timestamp: number;

    /** Valeur mesurée */
    value: number;

    /** Tags additionnels */
    tags: Record<string, string>;
}

/**
 * Métriques agrégées pour une mesure particulière
 */
export interface MetricData {
    /** Nombre de points de données */
    count: number;

    /** Valeur minimum */
    min: number;

    /** Valeur maximum */
    max: number;

    /** Valeur moyenne */
    avg: number;

    /** Dernière valeur mesurée */
    latest: number;

    /** Points de données individuels */
    dataPoints: PerformanceDataPoint[];
}

/**
 * Statistiques d'utilisation d'une ressource
 */
export interface ResourceStats {
    /** Valeur minimum */
    min: number;

    /** Valeur maximum */
    max: number;

    /** Valeur moyenne */
    avg: number;

    /** Dernière valeur mesurée */
    latest: number;
}

/**
 * Informations sur la santé du système de métriques
 */
export interface SystemHealthInfo {
    /** Nombre total de métriques suivies */
    metricsCount: number;

    /** Nombre total de points de données */
    totalDataPoints: number;

    /** Nombre de métriques actives (avec des données récentes) */
    activeMetricsCount: number;

    /** Liste des métriques actives */
    activeMetrics: string[];

    /** Liste des ressources système suivies */
    resourcesTracked: string[];

    /** Nombre de seuils configurés */
    thresholdsCount: number;

    /** Timestamp de la dernière activité */
    lastActivityTimestamp: number;
}

/**
 * Fonction d'écoute pour les alertes
 */
export type AlertListener = (
    metricKey: string,
    value: number,
    threshold: number
) => void;

/**
 * Métadonnées d'export de métriques
 */
export interface MetricsExportMetadata {
    /** Timestamp de l'export */
    exportTime: number;

    /** Nombre de métriques dans l'export */
    metricsCount: number;

    /** Nombre de ressources dans l'export */
    resourcesCount: number;
}

/**
 * Structure d'export de métriques
 */
export interface MetricsExport {
    /** Métadonnées de l'export */
    metadata: MetricsExportMetadata;

    /** Métriques exportées */
    metrics: Record<string, PerformanceDataPoint[]>;

    /** Données d'utilisation des ressources */
    resources: Record<string, number[]>;

}

/**
 * Options pour l'import de métriques
 */
export interface MetricsImportOptions {
    /** Métriques à importer */
    metrics?: Record<string, PerformanceDataPoint[]>;

    /** Données d'utilisation des ressources à importer */
    resources?: Record<string, number[]>;
}

/**
 * Structure complète des métriques de performance
 */
export interface PerformanceMetrics {
    /** Plage temporelle des données */
    timeRange: {
        /** Début de la plage (timestamp) */
        start: number;

        /** Fin de la plage (timestamp) */
        end: number;
    };

    /** Métriques par nom */
    metrics: Record<string, MetricData>;

    /** Timestamp des données */
    timestamp: number;

    /** Informations sur les systèmes */
    systems: { [systemId: string]: SystemPerformanceMetrics };
}