/**
 * Types et interfaces pour le système de monitoring de santé
 * @file src/ai/api/distributed/monitoring/types/health.types.ts
 */

/**
 * Types d'événements de changement d'état de santé
 */
export enum HealthEventType {
    STATUS_CHANGED = 'status_changed',
    METRIC_THRESHOLD_EXCEEDED = 'metric_threshold_exceeded',
    SERVICE_DISCOVERED = 'service_discovered',
    SERVICE_LOST = 'service_lost',
    DEPENDENCY_ISSUE = 'dependency_issue',
    RECOVERY = 'recovery',
    MANUAL_UPDATE = 'manual_update'
}

/**
 * Niveau de gravité pour les alertes
 */
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

/**
 * État de santé du système (terminologie interne)
 */
export type SystemHealth = 'healthy' | 'degraded' | 'unhealthy';

/**
 * États de santé possibles
 */
export enum HealthStatus {
    HEALTHY = 'HEALTHY',
    DEGRADED = 'DEGRADED',
    UNHEALTHY = 'UNHEALTHY',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Alias pour SystemHealth pour compatibilité
 */
export type HealthCheckStatus = SystemHealth;

/**
 * État de santé du système (compatible avec l'API externe)
 */
export type SystemStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

/**
 * Métrique en temps réel pour le monitoring
 */
export interface RealtimeMetric {
    /** Nom de la métrique */
    name: string;

    /** Valeur actuelle de la métrique */
    value: number;

    /** Horodatage de la mesure (Unix timestamp) */
    timestamp: number;

    /** Unité de mesure (ex: "ms", "%", "MB") */
    unit?: string | undefined;

    /** Tags associés à la métrique pour le filtrage et la catégorisation */
    tags?: Map<string, string> | undefined;

    /** Métadonnées supplémentaires à propos de la métrique */
    metadata?: Record<string, unknown> | undefined;

    /** Source de la métrique (ex: "cpu", "memory", "network") */
    source?: string | undefined;

    /** Identifiant du nœud générant la métrique (pour systèmes distribués) */
    nodeId?: string | undefined;

    /** Contexte additionnel */
    context?: Record<string, unknown> | undefined;
}

/**
 * Interface pour les éléments ayant un horodatage
 */
export interface TimestampedMetric {
    /** Horodatage de la métrique */
    timestamp: number;

    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

/**
 * Configuration de seuil pour les alertes
 */
export interface ThresholdConfig {
    /** Nom de la métrique */
    metricName: string;

    /** Seuil critique */
    criticalThreshold: number;

    /** Seuil d'avertissement */
    warningThreshold: number;

    /** Opérateur de comparaison */
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';

    /** Durée pendant laquelle le seuil doit être dépassé (ms) */
    duration?: number | undefined;

    /** Action à effectuer lorsque le seuil est dépassé */
    action?: string | undefined;

    /** Valeur maximale autorisée */
    maxValue?: number | undefined;

    /** Seuil critique haut */
    criticalHigh?: number | undefined;

    /** Seuil d'avertissement haut */
    warningHigh?: number | undefined;

    /** Seuil d'avertissement bas */
    warningLow?: number | undefined;

    /** Seuil critique bas */
    criticalLow?: number | undefined;

    /** Valeur minimale autorisée */
    minValue?: number | undefined;

    /** Durée minimale de dépassement avant déclenchement (ms) */
    durationThreshold?: number | undefined;

    /** Niveau de gravité de l'alerte */
    severity?: AlertSeverity | undefined;

    /** Si l'alerte est activée */
    enabled?: boolean | undefined;

    /** Description du seuil */
    description?: string | undefined;
}

/**
 * Vérification de santé à exécuter
 */
export interface HealthCheck {
    /** Nom unique de la vérification */
    name: string;

    /** Identifiant unique (optionnel) */
    id?: string | undefined;

    /** Description de ce que cette vérification examine */
    description?: string | undefined;

    /** Fonction d'exécution de la vérification */
    execute(): Promise<HealthCheckResult>;

    /** Méthode alternative pour l'exécution de la vérification (pour compatibilité) */
    check?(): Promise<HealthCheckResult>;

    /** Configuration de seuil pour cette vérification */
    thresholds?: ThresholdConfig | undefined;

    /** Catégorie de la vérification */
    category?: string | undefined;

    /** Importance de la vérification */
    critical?: boolean | undefined;

    /** Vérifie si la vérification est activée */
    isEnabled?(): boolean;

    /** Active ou désactive la vérification */
    setEnabled?(enabled: boolean): void;

    /** Timeout pour l'exécution (ms) */
    timeout?: number | undefined;
}

/**
 * Résultat d'une vérification de santé
 */
export interface HealthCheckResult {
    /** État de santé déterminé */
    status: HealthStatus;

    /** Composant vérifié */
    component: string;

    /** Message explicatif */
    message: string;

    /** Horodatage de l'exécution */
    timestamp: number;

    /** Nom de la vérification qui a produit ce résultat */
    checkName?: string | undefined;

    /** Nom alternatif de la vérification (pour compatibilité) */
    name?: string | undefined;

    /** ID de la vérification qui a produit ce résultat */
    checkId?: string | undefined;

    /** Détails supplémentaires */
    details?: Record<string, unknown> | undefined;

    /** Métriques associées */
    metrics?: Record<string, number> | RealtimeMetric[] | undefined;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown> | undefined;

    /** Recommandations d'actions */
    recommendations?: string[] | undefined;

    /** Durée d'exécution (ms) */
    duration?: number | undefined;
}

/**
 * Événement émis lors d'un changement d'état de santé
 */
export interface HealthChangeEvent {
    /** Type d'événement */
    type?: HealthEventType | undefined;

    /** Identifiant du service */
    serviceId?: string | undefined;

    /** État de santé précédent */
    from?: SystemHealth | undefined;

    /** Nouvel état de santé */
    to?: SystemHealth | undefined;

    /** État de santé précédent (alias) */
    previousStatus?: HealthStatus | undefined;

    /** Nouvel état de santé (alias) */
    newStatus?: HealthStatus | undefined;

    /** Horodatage du changement */
    timestamp: number;

    /** Message détaillant le changement */
    message?: string | undefined;

    /** Métrique concernée (si applicable) */
    metric?: string | undefined;

    /** Valeur actuelle de la métrique (si applicable) */
    value?: number | undefined;

    /** Seuil dépassé (si applicable) */
    threshold?: number | undefined;

    /** Durée du problème en ms (si applicable) */
    duration?: number | undefined;

    /** Résultats détaillés des vérifications ayant conduit au changement */
    details?: HealthCheckResult[] | Record<string, unknown> | undefined;
}

/**
 * Options de configuration du HealthChecker
 */
export interface HealthCheckerOptions {
    /** Intervalle entre les vérifications en ms */
    checkInterval?: number | undefined;

    /** Taille du tampon de métriques */
    bufferSize?: number | undefined;

    /** Nombre maximal d'événements stockés */
    maxEventHistory?: number | undefined;

    /** Démarrer automatiquement les vérifications */
    autoStart?: boolean | undefined;

    /** Délai d'expiration pour les vérifications individuelles (ms) */
    checkTimeout?: number | undefined;

    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | undefined;
}

/**
 * Configuration des options de vérification de santé
 */
export interface HealthCheckOptions {
    /** Si la vérification est activée par défaut */
    enabled?: boolean | undefined;

    /** Timeout en millisecondes */
    timeout?: number | undefined;

    /** Seuils spécifiques à la vérification */
    thresholds?: Record<string, number> | ThresholdConfig | undefined;

    /** Tags pour catégoriser les vérifications */
    tags?: string[] | undefined;

    /** Description de ce que vérifie cette vérification */
    description?: string | undefined;

    /** Catégorie de la vérification */
    category?: string | undefined;

    /** Indique si cette vérification est critique pour la santé du système */
    critical?: boolean | undefined;
}

/**
 * Rapport de vérification de santé
 */
export interface HealthReport {
    /** Statut global */
    status: HealthStatus;

    /** Horodatage du rapport */
    timestamp: number;

    /** Résultats des vérifications par composant */
    results: Record<string, HealthCheckResult>;

    /** Métriques globales */
    metrics: Record<string, number>;

    /** Recommandations */
    recommendations?: string[] | undefined;
}

/**
 * Résumé de rapport de vérification de santé
 * Utilisé pour agréger les résultats de plusieurs vérifications
 */
export interface HealthCheckReportSummary {
    /** Statut global */
    status: SystemHealth;

    /** Horodatage du rapport */
    timestamp: string;

    /** Nombre total de vérifications */
    total: number;

    /** Nombre de vérifications en santé */
    healthy: number;

    /** Nombre de vérifications dégradées */
    degraded: number;

    /** Nombre de vérifications en échec */
    unhealthy: number;

    /** Durée totale d'exécution (ms) */
    totalDuration: number;
}

/**
 * Rapport complet de santé
 * Utilisé pour présenter les résultats agrégés
 */
export interface HealthCheckReport {
    /** Résumé global */
    summary: HealthCheckReportSummary;

    /** Résultats détaillés par vérification */
    results: HealthCheckResult[];
}

/**
 * Résumé de santé pour un système complet
 */
export interface SystemHealthSummary {
    /** Statut global du système */
    status: HealthStatus;

    /** Horodatage du résumé */
    timestamp: number;

    /** Composants par statut */
    componentCounts: Record<HealthStatus, number>;

    /** Liste des composants non sains */
    unhealthyComponents: HealthCheckResult[];

    /** Métriques clés du système */
    keyMetrics: Record<string, number>;

    /** Version du système */
    systemVersion?: string | undefined;

    /** Depuis combien de temps le système est en marche (ms) */
    uptime: number;
}

/**
 * État de santé global du système
 */
export interface SystemHealthStatus {
    /** Statut global du système */
    status: SystemStatus;

    /** Résultats individuels des vérifications */
    checks: HealthCheckResult[];

    /** Horodatage de l'évaluation de santé */
    timestamp: number;

    /** Vérifications critiques qui ont contribué au statut */
    criticalChecks?: HealthCheckResult[] | undefined;

    /** Vérifications d'avertissement qui ont contribué au statut */
    warningChecks?: HealthCheckResult[] | undefined;

    /** Temps d'exécution total de toutes les vérifications en ms */
    executionTime?: number | undefined;
}

/**
 * Métriques CPU pour la surveillance de santé
 */
export interface CPUMetrics {
    /** Pourcentage d'utilisation CPU (0-100) */
    utilization: number;

    /** Charge moyenne CPU (1min, 5min, 15min) */
    loadAverage?: [number, number, number] | undefined;

    /** Nombre de cœurs CPU disponibles */
    cores: number;

    /** Pourcentage d'utilisation CPU par le processus */
    processUsage?: number | undefined;

    /** Pourcentage d'utilisation CPU par le système */
    systemUsage?: number | undefined;
}

/**
 * Métriques mémoire pour la surveillance de santé
 */
export interface MemoryMetrics {
    /** Mémoire totale utilisée en octets */
    used: number;

    /** Mémoire totale disponible en octets */
    total: number;

    /** Pourcentage d'utilisation mémoire (0-100) */
    utilization: number;

    /** Utilisation de la mémoire heap (pour runtimes managés) */
    heap?: {
        used: number;
        committed: number;
        max: number;
        utilization: number;
    } | undefined;
}

/**
 * Métriques réseau pour la surveillance de santé
 */
export interface NetworkMetrics {
    /** Octets reçus */
    bytesReceived: number;

    /** Octets envoyés */
    bytesSent: number;

    /** Connexions actives actuelles */
    activeConnections: number;

    /** Erreurs réseau rencontrées */
    errors: number;

    /** Latence réseau en millisecondes */
    latency?: number | undefined;
}

/**
 * Métriques de traitement pour surveiller le débit du système
 */
export interface ProcessingMetrics {
    /** Requêtes/opérations par seconde */
    throughput: number;

    /** Temps de réponse moyen en millisecondes */
    responseTime: number;

    /** Taux d'erreur (0-1) */
    errorRate: number;

    /** Nombre de requêtes/opérations en attente */
    pendingCount: number;
}

/**
 * État de santé d'un nœud distribué
 */
export interface NodeHealth {
    /** Identifiant du nœud */
    nodeId: string;

    /** Statut global du nœud */
    status: HealthStatus;

    /** Adresse du nœud */
    address: string;

    /** Dernière fois que le nœud a répondu */
    lastSeen: number;

    /** Latence réseau vers le nœud (ms) */
    latency?: number | undefined;

    /** Métriques de santé spécifiques au nœud */
    metrics?: Record<string, number> | undefined;

    /** Statuts des sous-composants */
    components?: Record<string, HealthStatus> | undefined;
}

/**
 * Métriques spécifiques à un nœud
 */
export interface NodeMetrics {
    /** Identifiant unique du nœud */
    nodeId: string;

    /** Métriques individuelles pour ce nœud */
    metrics: {
        cpu: CPUMetrics;
        memory: MemoryMetrics;
        network: NetworkMetrics;
        processing: ProcessingMetrics;
    };

    /** Métriques traitées pour ce nœud */
    processed: ProcessedMetrics;

    /** Analyse de tendance pour ce nœud */
    trends: MetricTrends;
}

/**
 * Métriques traitées et statistiques
 */
export interface ProcessedMetrics {
    /** Valeurs min/max/moy pour les métriques clés */
    statistics: {
        cpu: { min: number; max: number; avg: number };
        memory: { min: number; max: number; avg: number };
        responseTime: { min: number; max: number; avg: number };
        throughput: { min: number; max: number; avg: number };
    };

    /** Fenêtre temporelle pour ces métriques en millisecondes */
    timeWindow: number;

    /** Nombre d'échantillons inclus */
    sampleCount: number;
}

/**
 * Analyse de tendance des métriques dans le temps
 */
export interface MetricTrends {
    /** Tendance d'utilisation CPU */
    cpu: TrendData;

    /** Tendance d'utilisation mémoire */
    memory: TrendData;

    /** Tendance du temps de réponse */
    responseTime: TrendData;

    /** Tendance du débit */
    throughput: TrendData;

    /** Tendance du taux d'erreur */
    errorRate: TrendData;
}

/**
 * Données de tendance pour une métrique spécifique
 */
export interface TrendData {
    /** Direction actuelle de la tendance */
    direction: 'increasing' | 'decreasing' | 'stable';

    /** Taux de changement (unités par minute) */
    changeRate: number;

    /** Indicateur de volatilité/stabilité (0-1) */
    volatility: number;
}

/**
 * Métriques agrégées pour tous les nœuds
 */
export interface AggregateMetrics {
    /** Métriques CPU agrégées */
    cpu: {
        avgUtilization: number;
        maxUtilization: number;
        totalCores: number;
    };

    /** Métriques mémoire agrégées */
    memory: {
        totalUsed: number;
        totalAvailable: number;
        avgUtilization: number;
    };

    /** Métriques réseau agrégées */
    network: {
        totalBytesReceived: number;
        totalBytesSent: number;
        totalConnections: number;
        totalErrors: number;
    };

    /** Métriques de traitement agrégées */
    processing: {
        totalThroughput: number;
        avgResponseTime: number;
        totalErrors: number;
        errorRate: number;
    };

    /** Nombre de nœuds inclus dans l'agrégation */
    nodeCount: number;

    /** Horodatage de l'agrégation */
    timestamp: number;
}

/**
 * Options pour l'historique de santé
 */
export interface HealthHistoryOptions {
    /** Interval de temps pour l'historique */
    timeRange: {
        start: number;
        end: number;
    };

    /** Résolution des points de données (ms) */
    resolution: number;

    /** Composants à inclure (tous si non spécifié) */
    components?: string[] | undefined;

    /** Agréger par nœud */
    aggregateByNode?: boolean | undefined;
}

/**
 * Configuration pour la surveillance CPU
 */
export interface CPUMonitorConfig {
    /** Intervalle de vérification en ms */
    interval: number;

    /** Seuils d'alerte */
    thresholds: {
        /** Seuil d'avertissement en pourcentage */
        warning: number;

        /** Seuil critique en pourcentage */
        critical: number;
    };

    /** Taille de l'échantillon pour les moyennes */
    sampleSize: number;
}

/**
 * Configuration pour la surveillance mémoire
 */
export interface MemoryMonitorConfig {
    /** Intervalle de vérification en ms */
    interval: number;

    /** Seuils d'alerte */
    thresholds: {
        /** Seuil d'avertissement en pourcentage */
        warning: number;

        /** Seuil critique en pourcentage */
        critical: number;
    };

    /** Suivre les métriques du tas (heap) */
    trackHeap: boolean;
}

/**
 * Configuration pour la surveillance réseau
 */
export interface NetworkMonitorConfig {
    /** Intervalle de vérification en ms */
    interval: number;

    /** Ports à surveiller */
    ports: number[];

    /** Suivre la latence */
    trackLatency: boolean;
}

/**
 * Configuration globale de surveillance
 */
export interface MonitoringConfig {
    /** Configuration CPU */
    cpu: CPUMonitorConfig;

    /** Configuration mémoire */
    memory: MemoryMonitorConfig;

    /** Configuration réseau */
    network: NetworkMonitorConfig;
}

/**
 * Type pour les métriques spécifiques
 */
export type MonitoringMetrics = {
    /** Horodatage de la métrique */
    timestamp: number;

    /** Autres propriétés de métriques */
    [key: string]: number | string | boolean | Record<string, unknown>;
};

/**
 * Interface pour les moniteurs temps réel
 */
export interface IRealtimeMonitor {
    /** Démarre le moniteur */
    start(config: MonitoringConfig): Promise<void>;

    /** Arrête le moniteur */
    stop(): Promise<void>;

    /** Récupère les métriques actuelles */
    getMetrics(): Promise<MonitoringMetrics>;
}

/**
 * Point de données historique sur la santé
 */
export interface HealthHistoryPoint {
    /** Horodatage du point */
    timestamp: number;

    /** Statuts par composant */
    componentStatus: Record<string, HealthStatus>;

    /** Métriques clés */
    metrics: Record<string, number>;
}

/**
 * Historique de santé d'un système sur une période
 */
export interface HealthHistory {
    /** Plage de temps couverte */
    timeRange: {
        start: number;
        end: number;
    };

    /** Résolution des données (ms) */
    resolution: number;

    /** Points de données */
    dataPoints: HealthHistoryPoint[];

    /** Disponibilité par composant (pourcentage) */
    availability: Record<string, number>;

    /** Statistiques sur les métriques */
    metricStats: Record<string, {
        min: number;
        max: number;
        avg: number;
    }>;
}