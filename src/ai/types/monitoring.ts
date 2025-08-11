/**
 * @file: src/ai/types/monitoring.ts
 * 
 * Types et interfaces pour le système de monitoring
 */

/**
 * Types de métriques
 */
export enum MetricType {
    /** Métrique de type jauge (valeur instantanée) */
    GAUGE = 'gauge',
    /** Métrique de type compteur (valeur incrémentale) */
    COUNTER = 'counter',
    /** Métrique de type histogramme (distribution de valeurs) */
    HISTOGRAM = 'histogram'
}

/**
 * Niveaux d'alerte
 */
export enum AlertLevel {
    /** Alerte de niveau avertissement */
    WARNING = 'warning',
    /** Alerte de niveau critique */
    CRITICAL = 'critical'
}

/**
 * Types de ressources
 */
export enum ResourceType {
    /** Ressource CPU */
    CPU = 'cpu',
    /** Ressource mémoire */
    MEMORY = 'memory',
    /** Ressource disque */
    DISK = 'disk',
    /** Performances générales */
    PERFORMANCE = 'performance',
    /** Autre type de ressource */
    OTHER = 'other'
}

/**
 * Valeur de métrique
 */
export interface MetricValue {
    /** Horodatage de la mesure en ms */
    timestamp: number;
    /** Valeur mesurée */
    value: number;
    /** Type de métrique */
    type: MetricType;
    /** Tags additionnels */
    tags: Record<string, string>;
}

/**
 * Seuil de métrique
 */
export interface MetricThreshold {
    /** Seuil d'avertissement */
    warningThreshold: number;
    /** Seuil critique */
    criticalThreshold: number;
    /** Opérateur de comparaison */
    comparisonOperator: '>' | '>=' | '<' | '<=' | '==' | '!=';
}

/**
 * Configuration d'alerte
 */
export interface AlertConfig {
    /** Activer/désactiver les alertes */
    enabled?: boolean;
    /** Temps minimum entre alertes identiques (ms) */
    cooldown?: number;
    /** Activer l'optimisation automatique */
    autoOptimize?: boolean;
}

/**
 * Configuration du monitoring
 */
export interface MonitoringConfig {
    /** Période de rétention des métriques (ms) */
    retentionPeriod: number;
    /** Intervalle d'échantillonnage (ms) */
    samplingInterval: number;
    /** Nombre maximum de points de données par métrique */
    maxDataPoints: number;
    /** Temps minimum entre alertes identiques (ms) */
    alertCooldown: number;
    /** Alertes activées */
    alertEnabled: boolean;
    /** Optimisation automatique activée */
    autoOptimizationEnabled: boolean;
}

/**
 * État du système de monitoring
 */
export interface MonitoringState {
    /** Nombre de métriques */
    metricCount: number;
    /** Nombre de seuils configurés */
    thresholdCount: number;
    /** Nombre d'alertes historiques */
    alertCount: number;
    /** Dernière alerte */
    lastAlert: {
        timestamp: number;
        level: AlertLevel;
        metricName: string;
        message: string;
        value: number;
        threshold: number;
    } | null;
    /** Collecte en cours */
    isCollecting: boolean;
    /** Configuration */
    config: MonitoringConfig;
    /** Métriques disponibles */
    availableMetrics: string[];
}

/**
 * Alerte
 */
export interface Alert {
    /** Identifiant unique */
    id: string;
    /** Niveau d'alerte */
    level: AlertLevel;
    /** Métrique concernée */
    metric: string;
    /** Message d'alerte */
    message: string;
    /** Horodatage de création */
    timestamp: number;
    /** Valeur ayant déclenché l'alerte */
    value: number;
    /** Seuil dépassé */
    threshold: number;
    /** Si l'alerte est résolue */
    resolved: boolean;
    /** Horodatage de résolution */
    resolvedAt?: number;
}

/**
 * Interface pour le système de monitoring
 */
export interface IMonitoringSystem {
    /** Démarrer le monitoring */
    start(): void;
    /** Arrêter le monitoring */
    stop(): void;
    /** Enregistrer une métrique */
    recordMetric(name: string, value: number, type?: MetricType, tags?: Record<string, string>): void;
    /** Définir un seuil d'alerte */
    setThreshold(metricName: string, threshold: MetricThreshold): void;
    /** Configurer les alertes */
    configureAlerts(config: AlertConfig): void;
    /** Récupérer les valeurs d'une métrique */
    getMetricValues(metricName: string, limit?: number): MetricValue[];
    /** Récupérer les statistiques d'une métrique */
    getMetricStats(metricName: string): {
        min: number;
        max: number;
        avg: number;
        count: number;
        last: number;
        trend: 'up' | 'down' | 'stable';
    } | null;
    /** Récupérer l'historique des alertes */
    getAlertHistory(limit?: number): Alert[];
    /** Récupérer les alertes actives */
    getActiveAlerts(): Alert[];
    /** Résoudre une alerte */
    resolveAlert(alertId: string): boolean;
    /** Récupérer la configuration */
    getConfig(): MonitoringConfig;
    /** Mettre à jour la configuration */
    updateConfig(config: Partial<MonitoringConfig>): void;
    /** Récupérer l'état du système */
    getState(): MonitoringState;
    /** S'abonner aux alertes */
    onAlert(listener: (alert: Alert) => void): void;
    /** S'abonner aux résolutions d'alertes */
    onAlertResolved(listener: (alert: Alert) => void): void;
}

/**
 * Statistiques de performance du composant
 */
export interface ComponentMetrics {
    /** Temps de réponse moyen (ms) */
    averageResponseTime: number;
    /** Taux d'erreur (%) */
    errorRate: number;
    /** Nombre d'appels */
    callCount: number;
    /** Utilisation mémoire (optionnel) */
    memoryUsage?: number;
    /** Métriques personnalisées (optionnel) */
    custom?: Record<string, number>;
}

/**
 * Événement d'optimisation
 */
export interface OptimizationEvent {
    /** Horodatage */
    timestamp: number;
    /** Type de ressource concernée */
    resourceType: ResourceType;
    /** Métrique ayant déclenché l'optimisation */
    metricName: string;
    /** Valeur actuelle */
    currentValue: number;
    /** Raison de l'optimisation */
    optimizationReason: string;
}