//src/ai/pyramid/AdvancedMetricsCollector.ts
import { PyramidLevelType } from '../types';
import { Logger } from '@ai/utils/Logger';
import os from 'os';

/**
 * Types de métriques disponibles
 */
export enum MetricType {
    COUNTER = 'counter',      // Valeur qui ne peut qu'augmenter
    GAUGE = 'gauge',          // Valeur qui peut monter ou descendre
    HISTOGRAM = 'histogram',  // Distribution de valeurs
    SUMMARY = 'summary',      // Résumé statistique (quantiles, etc.)
    TIMER = 'timer'           // Chronométrage (cas spécial d'histogramme)
}

/**
 * Labels associés à une métrique
 */
export interface MetricLabels {
    // Niveau de la pyramide
    level?: PyramidLevelType;

    // Direction (montante ou descendante)
    direction?: 'up' | 'down';

    // Composant (module, sous-système)
    component?: string;

    // Étape du traitement
    stage?: string;

    // Statut (succès, échec, etc.)
    status?: string;

    // Labels personnalisés
    [key: string]: string | number | boolean | undefined;
}

/**
 * Configuration d'une métrique
 */
export interface MetricConfig {
    // Nom de la métrique
    name: string;

    // Description de la métrique
    description: string;

    // Type de métrique
    type: MetricType;

    // Labels par défaut
    defaultLabels?: MetricLabels;

    // Pour les histogrammes: buckets/limites
    buckets?: number[];

    // Pour les résumés: quantiles
    quantiles?: number[];

    // Unité de mesure (ms, bytes, etc.)
    unit?: string;

    // Agrégation des valeurs (sum, avg, min, max)
    aggregation?: 'sum' | 'avg' | 'min' | 'max';
}

/**
 * Valeur d'une métrique
 */
export interface MetricValue {
    // Valeur de la métrique
    value: number;

    // Labels associés
    labels: MetricLabels;

    // Timestamp de la mesure
    timestamp: number;
}

/**
 * Point dans une série temporelle
 */
export interface TimeSeriesPoint {
    // Valeur
    value: number;

    // Timestamp
    timestamp: number;
}

/**
 * Série temporelle
 */
export interface TimeSeries {
    // Nom de la métrique
    metric: string;

    // Labels associés
    labels: MetricLabels;

    // Points de données
    points: TimeSeriesPoint[];
}

/**
 * Statistiques d'une métrique
 */
export interface MetricStats {
    // Valeur minimum
    min: number;

    // Valeur maximum
    max: number;

    // Valeur moyenne
    avg: number;

    // Somme des valeurs
    sum: number;

    // Nombre de mesures
    count: number;

    // Écart-type
    stdDev?: number;

    // 95ème percentile
    p95?: number;

    // 99ème percentile
    p99?: number;
}

/**
 * Configuration des alertes
 */
export interface AlertConfig {
    // Nom de la métrique
    metric: string;

    // Labels à surveiller
    labels?: MetricLabels;

    // Seuil d'alerte
    threshold: number;

    // Opérateur de comparaison
    operator: '>' | '>=' | '<' | '<=' | '==' | '!=';

    // Durée pendant laquelle la condition doit être remplie (ms)
    duration: number;

    // Sévérité de l'alerte
    severity: 'info' | 'warning' | 'error' | 'critical';

    // Description de l'alerte
    description: string;
}

/**
 * Alerte déclenchée
 */
export interface Alert {
    // ID unique de l'alerte
    id: string;

    // Configuration de l'alerte
    config: AlertConfig;

    // Métrique concernée
    metric: string;

    // Valeur actuelle
    value: number;

    // Labels associés
    labels: MetricLabels;

    // Timestamp de déclenchement
    triggeredAt: number;

    // Timestamp de résolution (si résolue)
    resolvedAt?: number;

    // État de l'alerte
    state: 'active' | 'resolved';
}

/**
 * Options de stockage des métriques
 */
export interface MetricsStorageOptions {
    // Durée de rétention (ms)
    retentionPeriod: number;

    // Nombre maximum de points par série
    maxPointsPerSeries: number;

    // Intervalle d'agrégation (ms)
    aggregationInterval: number;

    // Purger automatiquement les anciennes données
    autoPurge: boolean;

    // Intervalle de purge (ms)
    purgeInterval: number;

    // Stockage persistant
    persistentStorage?: {
        // Type de stockage
        type: 'file' | 'database';
        // Chemin du fichier ou URL de connexion
        path: string;
        // Sauvegarder automatiquement
        autoSave: boolean;
        // Intervalle de sauvegarde (ms)
        saveInterval: number;
    };
}

/**
 * Collecteur de métriques avancé pour la pyramide IA
 * Permet de collecter, stocker et analyser des métriques détaillées
 * sur le fonctionnement du système
 */
export class AdvancedMetricsCollector {
    private metrics: Map<string, MetricConfig> = new Map();
    private values: Map<string, MetricValue[]> = new Map();
    private timers: Map<string, number> = new Map();
    private alerts: Map<string, Alert> = new Map();
    private alertConfigs: AlertConfig[] = [];
    private logger: Logger;
    private storageOptions: MetricsStorageOptions;
    private systemMetricsInterval?: NodeJS.Timeout;
    private purgeInterval?: NodeJS.Timeout;
    private lastAnomalyCheck: number = 0;
    private memorySamples: number[] = [];

    /**
     * Crée une nouvelle instance du collecteur de métriques avancé
     * @param options Options de stockage des métriques
     */
    constructor(options?: Partial<MetricsStorageOptions>) {
        this.logger = new Logger('AdvancedMetricsCollector');

        this.storageOptions = {
            retentionPeriod: options?.retentionPeriod || 7 * 24 * 60 * 60 * 1000, // 7 jours par défaut
            maxPointsPerSeries: options?.maxPointsPerSeries || 1000,
            aggregationInterval: options?.aggregationInterval || 60000, // 1 minute par défaut
            autoPurge: options?.autoPurge !== undefined ? options.autoPurge : true,
            purgeInterval: options?.purgeInterval || 3600000, // 1 heure par défaut
            persistentStorage: options?.persistentStorage
        };

        this.logger.info('Advanced metrics collector initialized', { storageOptions: this.storageOptions });

        // Initialiser les métriques système
        this.initializeSystemMetrics();

        // Configurer la purge automatique si activée
        if (this.storageOptions.autoPurge) {
            this.purgeInterval = setInterval(() => {
                this.purgeOldData();
            }, this.storageOptions.purgeInterval);
        }
    }

    /**
     * Initialise les métriques système (CPU, mémoire, etc.)
     */
    private initializeSystemMetrics(): void {
        // Enregistrer les métriques système
        this.registerMetric({
            name: 'system.cpu.usage',
            description: 'Utilisation CPU en pourcentage',
            type: MetricType.GAUGE,
            unit: '%'
        });

        this.registerMetric({
            name: 'system.memory.usage',
            description: 'Utilisation mémoire en bytes',
            type: MetricType.GAUGE,
            unit: 'bytes'
        });

        this.registerMetric({
            name: 'system.memory.percentage',
            description: 'Pourcentage d\'utilisation mémoire',
            type: MetricType.GAUGE,
            unit: '%'
        });

        this.registerMetric({
            name: 'system.load.average',
            description: 'Charge moyenne du système',
            type: MetricType.GAUGE
        });

        // Collecter les métriques système à intervalles réguliers
        this.systemMetricsInterval = setInterval(() => {
            this.collectSystemMetrics();
        }, 10000); // Toutes les 10 secondes
    }

    /**
     * Collecte les métriques système actuelles
     */
    private collectSystemMetrics(): void {
        try {
            // Collecter l'utilisation CPU
            const cpuUsage = this.calculateCPUUsage();
            this.recordMetric('system.cpu.usage', cpuUsage, { component: 'system' });

            // Collecter l'utilisation mémoire
            const memoryUsage = process.memoryUsage();
            this.recordMetric('system.memory.usage', memoryUsage.rss, { component: 'system', type: 'rss' });
            this.recordMetric('system.memory.usage', memoryUsage.heapTotal, { component: 'system', type: 'heapTotal' });
            this.recordMetric('system.memory.usage', memoryUsage.heapUsed, { component: 'system', type: 'heapUsed' });

            // Calculer le pourcentage d'utilisation mémoire
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;
            const memoryPercentage = (usedMemory / totalMemory) * 100;

            this.recordMetric('system.memory.percentage', memoryPercentage, { component: 'system' });

            // Collecter des échantillons pour la détection d'anomalies
            this.memorySamples.push(memoryPercentage);
            if (this.memorySamples.length > 60) { // Garder 1 heure d'échantillons (à 10s d'intervalle)
                this.memorySamples.shift();
            }

            // Collecter la charge moyenne
            const loadAverage = os.loadavg();
            this.recordMetric('system.load.average', loadAverage[0], { component: 'system', period: '1m' });
            this.recordMetric('system.load.average', loadAverage[1], { component: 'system', period: '5m' });
            this.recordMetric('system.load.average', loadAverage[2], { component: 'system', period: '15m' });

            // Détecter les anomalies périodiquement (toutes les minutes)
            const now = Date.now();
            if (now - this.lastAnomalyCheck > 60000) {
                this.detectAnomalies();
                this.lastAnomalyCheck = now;
            }
        } catch (error) {
            this.logger.error('Error collecting system metrics', { error });
        }
    }

    /**
     * Calcule l'utilisation CPU actuelle
     * @returns Pourcentage d'utilisation CPU
     */
    private calculateCPUUsage(): number {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        }

        // Calculer le pourcentage d'utilisation (100% - % idle)
        return 100 - (totalIdle / totalTick * 100);
    }

    /**
     * Enregistre une nouvelle métrique
     * @param config Configuration de la métrique
     * @returns true si la métrique a été enregistrée, false si elle existait déjà
     */
    public registerMetric(config: MetricConfig): boolean {
        const key = config.name;

        if (this.metrics.has(key)) {
            this.logger.warn(`Metric ${key} already registered. Ignoring.`);
            return false;
        }

        this.metrics.set(key, config);
        this.values.set(key, []);

        this.logger.debug(`Registered metric ${key}`, { type: config.type });
        return true;
    }

    /**
     * Enregistre une valeur de métrique
     * @param name Nom de la métrique
     * @param value Valeur à enregistrer
     * @param labels Labels associés à la valeur
     * @returns true si la valeur a été enregistrée, false si la métrique n'existe pas
     */
    public recordMetric(name: string, value: number, labels: MetricLabels = {}): boolean {
        // Vérifier si la métrique existe
        const metricConfig = this.metrics.get(name);
        if (!metricConfig) {
            this.logger.warn(`Metric ${name} not registered. Ignoring.`);
            return false;
        }

        // Fusionner les labels par défaut et ceux fournis
        const mergedLabels = { ...metricConfig.defaultLabels, ...labels };

        // Créer la valeur de métrique
        const metricValue: MetricValue = {
            value,
            labels: mergedLabels,
            timestamp: Date.now()
        };

        // Récupérer les valeurs existantes
        const values = this.values.get(name) || [];

        // Ajouter la nouvelle valeur
        values.push(metricValue);

        // Limiter le nombre de points si nécessaire
        if (values.length > this.storageOptions.maxPointsPerSeries) {
            values.shift(); // Supprimer le point le plus ancien
        }

        // Mettre à jour les valeurs
        this.values.set(name, values);

        // Vérifier les alertes si nécessaire
        this.checkAlerts(name, value, mergedLabels);

        return true;
    }

    /**
     * Démarre un chronomètre pour mesurer un temps d'exécution
     * @param name Nom du timer
     * @returns ID du timer
     */
    public startTimer(name: string): string {
        const timerId = `${name}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        this.timers.set(timerId, Date.now());
        return timerId;
    }

    /**
     * Arrête un chronomètre et enregistre le temps écoulé
     * @param timerId ID du timer
     * @param labels Labels associés
     * @returns Durée en ms ou -1 si le timer n'existe pas
     */
    public stopTimer(timerId: string, labels: MetricLabels = {}): number {
        const startTime = this.timers.get(timerId);
        if (startTime === undefined) {
            this.logger.warn(`Timer ${timerId} not found. Ignoring.`);
            return -1;
        }

        // Calculer la durée
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Supprimer le timer
        this.timers.delete(timerId);

        // Extraire le nom de la métrique du timerId
        const metricName = timerId.split(':')[0];

        // Enregistrer la durée comme métrique
        this.recordMetric(metricName, duration, { ...labels, unit: 'ms' });

        return duration;
    }

    /**
     * Configure une alerte sur une métrique
     * @param config Configuration de l'alerte
     * @returns ID de l'alerte
     */
    public configureAlert(config: AlertConfig): string {
        // Générer un ID unique pour l'alerte
        const alertId = `${config.metric}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

        // Ajouter la configuration
        this.alertConfigs.push(config);

        this.logger.info(`Configured alert for metric ${config.metric}`, {
            threshold: config.threshold,
            operator: config.operator,
            severity: config.severity
        });

        return alertId;
    }

    /**
     * Vérifie si des alertes doivent être déclenchées pour une métrique
     * @param metric Nom de la métrique
     * @param value Valeur actuelle
     * @param labels Labels associés
     */
    private checkAlerts(metric: string, value: number, labels: MetricLabels): void {
        // Filtrer les configurations d'alerte qui correspondent à la métrique
        const relevantConfigs = this.alertConfigs.filter(config =>
            config.metric === metric && this.labelsMatch(labels, config.labels || {})
        );

        if (relevantConfigs.length === 0) {
            return; // Aucune alerte configurée pour cette métrique
        }

        const now = Date.now();

        // Vérifier chaque configuration
        for (const config of relevantConfigs) {
            // Vérifier si la condition est remplie
            const isTriggered = this.evaluateAlertCondition(value, config.threshold, config.operator);

            // Générer un ID unique pour cette combinaison métrique/labels
            const labelsKey = JSON.stringify(labels);
            const alertKey = `${config.metric}:${labelsKey}:${config.threshold}:${config.operator}`;

            // Vérifier si l'alerte existe déjà
            const existingAlert = this.alerts.get(alertKey);

            if (isTriggered) {
                if (!existingAlert) {
                    // Nouvelle alerte
                    const alert: Alert = {
                        id: alertKey,
                        config,
                        metric,
                        value,
                        labels,
                        triggeredAt: now,
                        state: 'active'
                    };

                    this.alerts.set(alertKey, alert);

                    // Notifier l'alerte (log, notification, etc.)
                    this.notifyAlert(alert);
                } else if (existingAlert.state === 'resolved') {
                    // Alerte précédemment résolue qui se déclenche à nouveau
                    existingAlert.state = 'active';
                    existingAlert.triggeredAt = now;
                    existingAlert.value = value;
                    existingAlert.resolvedAt = undefined;

                    // Notifier l'alerte
                    this.notifyAlert(existingAlert);
                }
            } else if (existingAlert && existingAlert.state === 'active') {
                // L'alerte est résolue
                existingAlert.state = 'resolved';
                existingAlert.resolvedAt = now;

                // Notifier la résolution
                this.notifyAlertResolution(existingAlert);
            }
        }
    }

    /**
     * Vérifie si des labels correspondent aux critères de filtrage
     * @param labels Labels à vérifier
     * @param filter Critères de filtrage
     * @returns true si les labels correspondent
     */
    private labelsMatch(labels: MetricLabels, filter: MetricLabels): boolean {
        for (const key in filter) {
            if (filter[key] !== undefined && labels[key] !== filter[key]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Évalue une condition d'alerte
     * @param value Valeur à évaluer
     * @param threshold Seuil de comparaison
     * @param operator Opérateur de comparaison
     * @returns true si la condition est remplie
     */
    private evaluateAlertCondition(
        value: number,
        threshold: number,
        operator: '>' | '>=' | '<' | '<=' | '==' | '!='
    ): boolean {
        switch (operator) {
            case '>': return value > threshold;
            case '>=': return value >= threshold;
            case '<': return value < threshold;
            case '<=': return value <= threshold;
            case '==': return value === threshold;
            case '!=': return value !== threshold;
            default: return false;
        }
    }

    /**
     * Notifie une nouvelle alerte ou une alerte réactivée
     * @param alert Alerte à notifier
     */
    private notifyAlert(alert: Alert): void {
        this.logger.warn(`Alert triggered: ${alert.config.description}`, {
            metric: alert.metric,
            value: alert.value,
            threshold: alert.config.threshold,
            operator: alert.config.operator,
            severity: alert.config.severity,
            labels: alert.labels
        });

        // Ici, on pourrait envoyer des notifications (email, webhook, etc.)
        // selon la gravité de l'alerte
    }

    /**
     * Notifie la résolution d'une alerte
     * @param alert Alerte résolue
     */
    private notifyAlertResolution(alert: Alert): void {
        this.logger.info(`Alert resolved: ${alert.config.description}`, {
            metric: alert.metric,
            value: alert.value,
            threshold: alert.config.threshold,
            operator: alert.config.operator,
            severity: alert.config.severity,
            labels: alert.labels,
            duration: alert.resolvedAt! - alert.triggeredAt
        });

        // Ici, on pourrait envoyer des notifications de résolution
    }

    /**
     * Récupère les valeurs d'une métrique
     * @param name Nom de la métrique
     * @param filter Filtre sur les labels
     * @param timeRange Plage de temps (ms depuis maintenant, ou objet avec début/fin)
     * @returns Valeurs de la métrique
     */
    public getMetricValues(
        name: string,
        filter: Partial<MetricLabels> = {},
        timeRange?: number | { start: number; end: number }
    ): MetricValue[] {
        const values = this.values.get(name) || [];

        // Filtrer par labels
        let filteredValues = values.filter(value => this.labelsMatch(value.labels, filter));

        // Filtrer par plage de temps
        if (timeRange !== undefined) {
            const now = Date.now();

            if (typeof timeRange === 'number') {
                // Timerange est un nombre de ms dans le passé
                const startTime = now - timeRange;
                filteredValues = filteredValues.filter(value => value.timestamp >= startTime);
            } else {
                // Timerange est un objet {start, end}
                filteredValues = filteredValues.filter(
                    value => value.timestamp >= timeRange.start && value.timestamp <= timeRange.end
                );
            }
        }

        return filteredValues;
    }

    /**
     * Calcule des statistiques sur une métrique
     * @param name Nom de la métrique
     * @param filter Filtre sur les labels
     * @param timeRange Plage de temps (ms depuis maintenant, ou objet avec début/fin)
     * @returns Statistiques calculées
     */
    public getMetricStats(
        name: string,
        filter: Partial<MetricLabels> = {},
        timeRange?: number | { start: number; end: number }
    ): MetricStats | null {
        const values = this.getMetricValues(name, filter, timeRange);

        if (values.length === 0) {
            return null;
        }

        // Extraire les valeurs numériques
        const numericValues = values.map(v => v.value);

        // Calculer les statistiques de base
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const count = numericValues.length;
        const avg = sum / count;

        // Calculer l'écart-type
        const sumSquaredDiff = numericValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0);
        const stdDev = Math.sqrt(sumSquaredDiff / count);

        // Calculer les percentiles
        const sortedValues = [...numericValues].sort((a, b) => a - b);
        const p95Index = Math.floor(sortedValues.length * 0.95);
        const p99Index = Math.floor(sortedValues.length * 0.99);

        return {
            min,
            max,
            avg,
            sum,
            count,
            stdDev,
            p95: sortedValues[p95Index],
            p99: sortedValues[p99Index]
        };
    }

    /**
     * Récupère les séries temporelles pour une métrique
     * @param name Nom de la métrique
     * @param filter Filtre sur les labels
     * @param timeRange Plage de temps
     * @param groupBy Labels à utiliser pour le regroupement
     * @returns Séries temporelles
     */
    public getTimeSeries(
        name: string,
        filter: Partial<MetricLabels> = {},
        timeRange?: number | { start: number; end: number },
        groupBy: string[] = []
    ): TimeSeries[] {
        const values = this.getMetricValues(name, filter, timeRange);

        if (values.length === 0) {
            return [];
        }

        // Si pas de groupBy, retourner une seule série
        if (groupBy.length === 0) {
            return [{
                metric: name,
                labels: {},
                points: values.map(v => ({ value: v.value, timestamp: v.timestamp }))
            }];
        }

        // Grouper les valeurs par labels spécifiés
        const seriesByLabels: Record<string, { labels: MetricLabels; points: TimeSeriesPoint[] }> = {};

        for (const value of values) {
            // Créer une clé de groupe basée sur les labels spécifiés
            const groupLabels: MetricLabels = {};
            for (const label of groupBy) {
                if (value.labels[label] !== undefined) {
                    groupLabels[label] = value.labels[label];
                }
            }

            const groupKey = JSON.stringify(groupLabels);

            if (!seriesByLabels[groupKey]) {
                seriesByLabels[groupKey] = {
                    labels: groupLabels,
                    points: []
                };
            }

            seriesByLabels[groupKey].points.push({
                value: value.value,
                timestamp: value.timestamp
            });
        }

        // Convertir en tableau de séries
        return Object.values(seriesByLabels).map(series => ({
            metric: name,
            labels: series.labels,
            points: series.points
        }));
    }

    /**
     * Détecte les anomalies dans les métriques système
     */
    private detectAnomalies(): void {
        if (this.memorySamples.length < 10) {
            return; // Pas assez d'échantillons
        }

        // Calculer la moyenne et l'écart-type
        const sum = this.memorySamples.reduce((a, b) => a + b, 0);
        const mean = sum / this.memorySamples.length;

        const sumSquaredDiff = this.memorySamples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        const stdDev = Math.sqrt(sumSquaredDiff / this.memorySamples.length);

        // Vérifier si la dernière valeur est anormale (> moyenne + 2*écart-type)
        const lastValue = this.memorySamples[this.memorySamples.length - 1];

        if (lastValue > mean + 2 * stdDev) {
            this.logger.warn('Memory usage anomaly detected', {
                value: lastValue,
                mean,
                stdDev,
                threshold: mean + 2 * stdDev
            });

            // Enregistrer l'anomalie comme métrique
            this.recordMetric('system.anomalies', 1, {
                component: 'system',
                type: 'memory',
                severity: lastValue > mean + 3 * stdDev ? 'high' : 'medium'
            });
        }
    }

    /**
     * Purge les données anciennes selon la période de rétention
     */
    private purgeOldData(): void {
        const cutoffTime = Date.now() - this.storageOptions.retentionPeriod;
        let purgedCount = 0;

        // Parcourir toutes les métriques
        for (const [name, values] of this.values.entries()) {
            const newValues = values.filter(v => v.timestamp >= cutoffTime);
            purgedCount += values.length - newValues.length;
            this.values.set(name, newValues);
        }

        if (purgedCount > 0) {
            this.logger.debug(`Purged ${purgedCount} old metric values`);
        }
    }

    /**
     * Exporte les métriques dans un format spécifique
     * @param format Format d'export
     * @returns Métriques exportées dans le format spécifié
     */
    public exportMetrics(format: 'json' | 'prometheus' | 'influxdb' = 'json'): string {
        if (format === 'prometheus') {
            return this.exportPrometheusFormat();
        } else if (format === 'influxdb') {
            return this.exportInfluxDBFormat();
        } else {
            // Format JSON par défaut
            const export_data: Record<string, any> = {};

            for (const [name, config] of this.metrics.entries()) {
                const values = this.values.get(name) || [];

                export_data[name] = {
                    config,
                    values: values.map(v => ({
                        value: v.value,
                        labels: v.labels,
                        timestamp: v.timestamp
                    }))
                };
            }

            return JSON.stringify(export_data);
        }
    }

    /**
     * Exporte les métriques au format Prometheus
     * @returns Métriques au format Prometheus
     */
    private exportPrometheusFormat(): string {
        const lines: string[] = [];

        for (const [name, config] of this.metrics.entries()) {
            // Ajouter un commentaire avec la description
            lines.push(`# HELP ${name} ${config.description}`);

            // Ajouter le type
            let type: string;
            switch (config.type) {
                case MetricType.COUNTER:
                    type = 'counter';
                    break;
                case MetricType.GAUGE:
                    type = 'gauge';
                    break;
                case MetricType.HISTOGRAM:
                case MetricType.TIMER:
                    type = 'histogram';
                    break;
                case MetricType.SUMMARY:
                    type = 'summary';
                    break;
                default:
                    type = 'untyped';
            }
            lines.push(`# TYPE ${name} ${type}`);

            // Ajouter les valeurs
            const values = this.values.get(name) || [];
            for (const value of values) {
                const labelPairs = Object.entries(value.labels)
                    .filter(([_, v]) => v !== undefined)
                    .map(([k, v]) => `${k}="${v}"`)
                    .join(',');

                const labelStr = labelPairs.length > 0 ? `{${labelPairs}}` : '';

                lines.push(`${name}${labelStr} ${value.value} ${Math.floor(value.timestamp / 1000)}`);
            }

            // Ligne vide entre les métriques
            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Exporte les métriques au format InfluxDB Line Protocol
     * @returns Métriques au format InfluxDB
     */
    private exportInfluxDBFormat(): string {
        const lines: string[] = [];

        for (const [name, _] of this.metrics.entries()) {
            const values = this.values.get(name) || [];

            for (const value of values) {
                const measurement = name.replace(/\./g, '_');

                // Préparer les tags (labels)
                const tagSet = Object.entries(value.labels)
                    .filter(([_, v]) => v !== undefined)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(',');

                // Préparer les fields
                const fieldSet = `value=${value.value}`;

                // Timestamp en nanosecondes
                const timestamp = value.timestamp * 1000000;

                // Construire la ligne
                const line = tagSet.length > 0
                    ? `${measurement},${tagSet} ${fieldSet} ${timestamp}`
                    : `${measurement} ${fieldSet} ${timestamp}`;

                lines.push(line);
            }
        }

        return lines.join('\n');
    }

    /**
     * Arrête proprement le collecteur de métriques
     */
    public shutdown(): void {
        this.logger.info('Shutting down metrics collector...');

        // Arrêter les intervalles
        if (this.systemMetricsInterval) {
            clearInterval(this.systemMetricsInterval);
        }

        if (this.purgeInterval) {
            clearInterval(this.purgeInterval);
        }

        // Si stockage persistant configuré, sauvegarder les données
        if (this.storageOptions.persistentStorage?.autoSave) {
            this.saveMetrics();
        }

        this.logger.info('Metrics collector shutdown complete');
    }

    /**
     * Sauvegarde les métriques dans le stockage persistant
     */
    private saveMetrics(): void {
        if (!this.storageOptions.persistentStorage) {
            return;
        }

        try {
            // Exporter les données au format JSON
            const data = this.exportMetrics('json');

            // Simuler la sauvegarde (dans un vrai système, on écrirait dans un fichier ou une base de données)
            this.logger.info(`Metrics saved (${data.length} bytes)`);
        } catch (error) {
            this.logger.error('Error saving metrics', { error });
        }
    }
}