/**
 * @file: src/ai/monitoring/MonitoringUnifie.ts
 * 
 * Système de monitoring unifié pour l'application LSF.
 * Centralise la collecte des métriques, la gestion des alertes et 
 * l'optimisation des performances.
 */

import { EventEmitter } from 'events';
// Ajouter cette ligne au début du fichier, après l'import EventEmitter
import { logger } from '../utils/Logger';

// Types pour le système de monitoring
export type MetricType = 'gauge' | 'counter' | 'histogram' | 'summary';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';
export type ResourceType = 'cpu' | 'memory' | 'disk' | 'performance' | 'other';

export interface MetricValue {
    timestamp: number;
    value: number;
    type: MetricType;
    tags: Record<string, string>;
}

export interface MetricThreshold {
    warningThreshold: number;
    criticalThreshold: number;
    comparisonOperator: '>' | '>=' | '<' | '<=' | '==' | '!=';
}

export interface AlertConfig {
    enabled?: boolean;
    cooldown?: number; // ms entre alertes
    autoOptimize?: boolean;
}

export interface MonitoringConfig {
    retentionPeriod: number; // ms
    samplingInterval: number; // ms
    maxDataPoints: number;
    alertCooldown: number; // ms
    alertEnabled: boolean;
    autoOptimizationEnabled: boolean;
}

export interface MonitoringState {
    metricCount: number;
    thresholdCount: number;
    alertCount: number;
    lastAlert: {
        timestamp: number;
        level: AlertLevel;
        metricName: string;
        message: string;
        value: number;
        threshold: number;
    } | null;
    isCollecting: boolean;
    config: MonitoringConfig;
    availableMetrics: string[];
}

export interface Alert {
    id: string;
    level: AlertLevel;
    metric: string;
    message: string;
    timestamp: number;
    value: number;
    threshold: number;
    resolved: boolean;
    resolvedAt?: number;
}

/**
 * Interface pour le système de monitoring unifié
 */
export interface UnifiedMonitoring {
    /** Démarre le système de monitoring */
    start(): void;

    /** Arrête le système de monitoring */
    stop(): void;

    /**
     * Enregistre une métrique
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param type Type de métrique
     * @param tags Tags associés
     */
    recordMetric(name: string, value: number, type?: MetricType, tags?: Record<string, string>): void;

    /**
     * Obtient une métrique par son nom
     * @param name Nom de la métrique
     * @param tags Tags pour filtrer
     * @returns Métrique si trouvée
     */
    getMetric(name: string, tags?: Record<string, string>): MetricValue | undefined;

    /**
     * Obtient les métriques par préfixe
     * @param prefix Préfixe du nom de métrique
     * @returns Liste des métriques correspondantes
     */
    getMetricsByPrefix(prefix: string): MetricValue[];

    /**
     * Obtient toutes les métriques disponibles
     * @returns Liste de toutes les métriques
     */
    getAvailableMetrics(): string[];

    /**
     * Ajoute une règle d'alerte
     * @param rule Règle d'alerte
     */
    setThreshold(metricName: string, threshold: MetricThreshold): void;

    /**
     * Obtient toutes les alertes actives
     * @returns Liste des alertes actives
     */
    getActiveAlerts(): Alert[];

    /**
     * S'abonne aux alertes
     * @param handler Fonction de rappel pour les alertes
     */
    onAlert(handler: (alert: Alert) => void): void;
}

/**
 * Système de monitoring unifié 
 * 
 * Centralise la collecte des métriques, la génération d'alertes,
 * et l'optimisation autonome pour l'ensemble du système LSF.
 */
export class MonitoringUnifie extends EventEmitter implements UnifiedMonitoring {
    private static instance: MonitoringUnifie;

    // Stockage des métriques en mémoire
    private metrics: Map<string, Array<MetricValue>> = new Map();

    // Configuration des seuils d'alerte
    private thresholds: Map<string, MetricThreshold> = new Map();

    // Historique des alertes
    private alertHistory: Array<{
        timestamp: number;
        level: AlertLevel;
        metricName: string;
        message: string;
        value: number;
        threshold: number;
    }> = [];

    // Alertes actives
    private activeAlerts: Map<string, Alert> = new Map();

    // Configuration du monitoring
    private config: MonitoringConfig;

    // État interne
    private isCollecting: boolean = false;
    private lastAlertTimestamps: Map<string, number> = new Map();
    private collectionInterval: NodeJS.Timeout | null = null;

    /**
     * Constructeur privé (pattern Singleton)
     */
    private constructor() {
        super();

        // Configuration par défaut
        this.config = {
            retentionPeriod: 24 * 60 * 60 * 1000, // 24 heures
            samplingInterval: 60 * 1000, // 1 minute
            maxDataPoints: 1000, // Par métrique
            alertCooldown: 5 * 60 * 1000, // 5 minutes entre alertes identiques
            alertEnabled: true,
            autoOptimizationEnabled: true
        };

        // Configurer les seuils par défaut
        this.setupDefaultThresholds();

        logger.info('MonitoringUnifie initialized');
    }

    /**
     * Obtient l'instance unique du système de monitoring (Singleton)
     */
    public static getInstance(): MonitoringUnifie {
        if (!MonitoringUnifie.instance) {
            MonitoringUnifie.instance = new MonitoringUnifie();
        }
        return MonitoringUnifie.instance;
    }

    /**
     * Configure les seuils d'alerte par défaut
     */
    private setupDefaultThresholds(): void {
        // Seuils pour l'utilisation CPU
        this.setThreshold('system.cpu.usage', {
            warningThreshold: 70,
            criticalThreshold: 90,
            comparisonOperator: '>'
        });

        // Seuils pour l'utilisation mémoire
        this.setThreshold('system.memory.usage', {
            warningThreshold: 75,
            criticalThreshold: 85,
            comparisonOperator: '>'
        });

        // Seuils pour le temps de réponse
        this.setThreshold('system.response_time', {
            warningThreshold: 500,
            criticalThreshold: 1000,
            comparisonOperator: '>'
        });

        // Seuils pour le taux d'erreur
        this.setThreshold('system.error_rate', {
            warningThreshold: 5,
            criticalThreshold: 10,
            comparisonOperator: '>'
        });

        // Seuils pour l'utilisation du disque
        this.setThreshold('system.disk.usage', {
            warningThreshold: 80,
            criticalThreshold: 90,
            comparisonOperator: '>'
        });

        // Seuils pour le ratio de hit du cache
        this.setThreshold('system.cache.hit_ratio', {
            warningThreshold: 40,
            criticalThreshold: 20,
            comparisonOperator: '<'
        });

        // Seuils pour les requêtes en attente
        this.setThreshold('system.requests.pending', {
            warningThreshold: 50,
            criticalThreshold: 100,
            comparisonOperator: '>'
        });
    }

    /**
     * Démarre la collecte périodique des métriques et le monitoring
     */
    public start(): void {
        if (this.collectionInterval) {
            // Déjà démarré
            return;
        }

        this.collectionInterval = setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.samplingInterval);

        logger.info('Monitoring started with interval', {
            interval: this.config.samplingInterval
        });
    }

    /**
     * Arrête la collecte périodique des métriques
     */
    public stop(): void {
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
            logger.info('Monitoring stopped');
        }
    }

    /**
     * Collecte les métriques système de base
     */
    private async collectSystemMetrics(): Promise<void> {
        if (this.isCollecting) return;

        this.isCollecting = true;

        try {
            // Simuler la collecte des métriques système
            // Dans une implémentation réelle, utiliser des APIs système

            // CPU
            const cpuUsage = Math.random() * 30 + 40; // 40-70%
            this.recordMetric('system.cpu.usage', cpuUsage, 'gauge', { system: 'lsf-app' });

            // Mémoire
            const memoryUsage = Math.random() * 20 + 60; // 60-80%
            this.recordMetric('system.memory.usage', memoryUsage, 'gauge', { system: 'lsf-app' });

            // Disque
            const diskUsage = Math.random() * 30 + 50; // 50-80%
            this.recordMetric('system.disk.usage', diskUsage, 'gauge', { system: 'lsf-app' });

            // Temps de réponse
            const responseTime = Math.random() * 400 + 100; // 100-500ms
            this.recordMetric('system.response_time', responseTime, 'gauge', { system: 'lsf-app' });

            // Taux d'erreur
            const errorRate = Math.random() * 5; // 0-5%
            this.recordMetric('system.error_rate', errorRate, 'gauge', { system: 'lsf-app' });

            // Requêtes par seconde
            const requestRate = Math.random() * 50 + 10; // 10-60 req/s
            this.recordMetric('system.request_rate', requestRate, 'counter', { system: 'lsf-app' });

            // Simuler le ratio de hit du cache
            const cacheHitRatio = Math.random() * 60 + 30; // 30-90%
            this.recordMetric('system.cache.hit_ratio', cacheHitRatio, 'gauge', { system: 'lsf-app' });

            // Requêtes en attente
            const pendingRequests = Math.random() * 40 + 5; // 5-45
            this.recordMetric('system.requests.pending', pendingRequests, 'gauge', { system: 'lsf-app' });

            // Vérifier les seuils après collecte
            this.checkThresholds();

            // Nettoyer les anciennes métriques périodiquement
            this.cleanupOldMetrics();

        } catch (error) {
            logger.error('Error collecting system metrics', {
                error: error instanceof Error ? error.message : String(error)
            });
        } finally {
            this.isCollecting = false;
        }
    }

    /**
     * Enregistre une métrique
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param type Type de métrique
     * @param tags Tags additionnels
     */
    public recordMetric(
        name: string,
        value: number,
        type: MetricType = 'gauge',
        tags: Record<string, string> = {}
    ): void {
        // Créer l'entrée si elle n'existe pas
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        // Récupérer la série de données
        const series = this.metrics.get(name)!;

        // Ajouter le point de données
        series.push({
            timestamp: Date.now(),
            value,
            type,
            tags
        });

        // Limiter le nombre de points de données
        if (series.length > this.config.maxDataPoints) {
            series.shift();
        }

        // Vérifier le seuil immédiatement si c'est une métrique clé
        this.checkThreshold(name, value);
    }

    /**
     * Vérifie tous les seuils configurés
     */

    private checkThresholds(): void {
        if (!this.config.alertEnabled) return;

        for (const [metricName, _threshold] of this.thresholds.entries()) {
            // ^ Notez le préfixe underscore ici ↑ pour indiquer une variable délibérément non utilisée
            const series = this.metrics.get(metricName);
            if (!series || series.length === 0) continue;

            const latestValue = series[series.length - 1].value;
            this.checkThreshold(metricName, latestValue);
        }
    }

    /**
     * Vérifie un seuil spécifique
     * @param metricName Nom de la métrique
     * @param value Valeur à vérifier
     */
    private checkThreshold(metricName: string, value: number): void {
        const threshold = this.thresholds.get(metricName);
        if (!threshold) return;

        const now = Date.now();
        const lastAlertTime = this.lastAlertTimestamps.get(metricName) || 0;

        // Vérifier le cooldown
        if (now - lastAlertTime < this.config.alertCooldown) {
            return;
        }

        let alertLevel: AlertLevel | null = null;
        let thresholdValue = 0;

        // Vérifier le seuil critique d'abord
        if (this.compareValues(value, threshold.criticalThreshold, threshold.comparisonOperator)) {
            alertLevel = 'critical';
            thresholdValue = threshold.criticalThreshold;
        }
        // Puis vérifier le seuil d'avertissement
        else if (this.compareValues(value, threshold.warningThreshold, threshold.comparisonOperator)) {
            alertLevel = 'warning';
            thresholdValue = threshold.warningThreshold;
        }

        if (alertLevel) {
            // Mettre à jour le timestamp de dernière alerte
            this.lastAlertTimestamps.set(metricName, now);

            // Créer le message d'alerte
            const message = `${alertLevel === 'critical' ? 'CRITIQUE' : 'AVERTISSEMENT'}: 
                La métrique ${metricName} a atteint ${value.toFixed(2)} 
                (seuil: ${thresholdValue})`;

            // Identifiant unique pour l'alerte
            const alertId = `${metricName}-${alertLevel}-${now}`;

            // Créer l'alerte
            const alert: Alert = {
                id: alertId,
                timestamp: now,
                level: alertLevel,
                metric: metricName,
                message,
                value,
                threshold: thresholdValue,
                resolved: false
            };

            // Ajouter à l'historique des alertes
            this.alertHistory.push({
                timestamp: now,
                level: alertLevel,
                metricName,
                message,
                value,
                threshold: thresholdValue
            });

            // Limiter la taille de l'historique des alertes
            if (this.alertHistory.length > 1000) {
                this.alertHistory.shift();
            }

            // Ajouter aux alertes actives
            this.activeAlerts.set(alertId, alert);

            // Émettre un événement d'alerte
            this.emit('alert', alert);

            // Journaliser l'alerte
            logger.warn(message, {
                metricName,
                value,
                threshold: thresholdValue,
                level: alertLevel
            });

            // Déclencher l'optimisation automatique si activée
            if (this.config.autoOptimizationEnabled && alertLevel === 'critical') {
                this.triggerAutoOptimization(metricName, value);
            }
        }
    }

    /**
     * Compare deux valeurs selon l'opérateur spécifié
     * @param value1 Première valeur
     * @param value2 Deuxième valeur
     * @param operator Opérateur de comparaison
     * @returns Résultat de la comparaison
     */
    private compareValues(
        value1: number,
        value2: number,
        operator: '>' | '>=' | '<' | '<=' | '==' | '!='
    ): boolean {
        switch (operator) {
            case '>':
                return value1 > value2;
            case '>=':
                return value1 >= value2;
            case '<':
                return value1 < value2;
            case '<=':
                return value1 <= value2;
            case '==':
                return value1 === value2;
            case '!=':
                return value1 !== value2;
            default:
                return false;
        }
    }

    /**
     * Déclenche une optimisation automatique basée sur une métrique
     * @param metricName Nom de la métrique
     * @param value Valeur actuelle
     */
    private triggerAutoOptimization(metricName: string, value: number): void {
        // Déterminer le type de ressource à optimiser
        let resourceType: ResourceType;

        if (metricName.includes('cpu')) {
            resourceType = 'cpu';
        } else if (metricName.includes('memory')) {
            resourceType = 'memory';
        } else if (metricName.includes('disk')) {
            resourceType = 'disk';
        } else if (metricName.includes('response_time') || metricName.includes('request_rate')) {
            resourceType = 'performance';
        } else {
            resourceType = 'other';
        }

        // Émettre un événement d'optimisation
        this.emit('optimize', {
            timestamp: Date.now(),
            resourceType,
            metricName,
            currentValue: value,
            optimizationReason: `Valeur critique pour ${metricName}: ${value}`
        });

        logger.info(`Déclenchement d'optimisation automatique pour ${resourceType}`, {
            metricName,
            value
        });
    }

    /**
     * Résout une alerte active
     * @param alertId Identifiant de l'alerte
     * @returns true si l'alerte a été résolue, false sinon
     */
    public resolveAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) return false;

        // Marquer l'alerte comme résolue
        alert.resolved = true;
        alert.resolvedAt = Date.now();

        // Mettre à jour l'alerte dans la map
        this.activeAlerts.set(alertId, alert);

        // Émettre un événement de résolution
        this.emit('alertResolved', alert);

        logger.info(`Alerte résolue: ${alert.message}`, {
            alertId,
            metric: alert.metric
        });

        return true;
    }

    /**
     * Nettoie les métriques plus anciennes que la période de rétention
     */
    private cleanupOldMetrics(): void {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        let cleanedCount = 0;

        this.metrics.forEach((series, name) => {
            const originalLength = series.length;
            const newSeries = series.filter(point => point.timestamp >= cutoffTime);

            cleanedCount += originalLength - newSeries.length;
            this.metrics.set(name, newSeries);
        });

        if (cleanedCount > 0) {
            logger.debug(`Cleaned up ${cleanedCount} old metric points`);
        }
    }

    /**
     * Définit un seuil d'alerte pour une métrique
     * @param metricName Nom de la métrique
     * @param threshold Configuration du seuil
     */
    public setThreshold(metricName: string, threshold: MetricThreshold): void {
        this.thresholds.set(metricName, threshold);
        logger.debug(`Threshold configured for ${metricName}`, { threshold });
    }

    /**
     * Configure les alertes
     * @param config Configuration des alertes
     */
    public configureAlerts(config: AlertConfig): void {
        this.config.alertEnabled = config.enabled !== undefined ? config.enabled : this.config.alertEnabled;
        this.config.alertCooldown = config.cooldown || this.config.alertCooldown;
        this.config.autoOptimizationEnabled = config.autoOptimize !== undefined ?
            config.autoOptimize : this.config.autoOptimizationEnabled;

        logger.info('Alert configuration updated', {
            alertEnabled: this.config.alertEnabled,
            cooldown: this.config.alertCooldown,
            autoOptimizationEnabled: this.config.autoOptimizationEnabled
        });
    }

    /**
     * Récupère les dernières valeurs d'une métrique
     * @param metricName Nom de la métrique
     * @param limit Nombre maximal de points à récupérer
     * @returns Tableau des valeurs de la métrique
     */
    public getMetricValues(metricName: string, limit = 100): MetricValue[] {
        const series = this.metrics.get(metricName);
        if (!series) return [];

        return series.slice(-limit);
    }

    /**
     * Obtient une métrique par son nom
     * @param name Nom de la métrique
     * @param tags Tags pour filtrer
     * @returns Métrique si trouvée
     */
    public getMetric(name: string, tags?: Record<string, string>): MetricValue | undefined {
        const series = this.metrics.get(name);
        if (!series || series.length === 0) return undefined;

        if (!tags) {
            // Retourner la dernière valeur
            return series[series.length - 1];
        }

        // Filtrer par tags
        const filteredSeries = series.filter(point => {
            for (const [key, value] of Object.entries(tags)) {
                if (point.tags[key] !== value) {
                    return false;
                }
            }
            return true;
        });

        if (filteredSeries.length === 0) return undefined;

        // Retourner la dernière valeur correspondante
        return filteredSeries[filteredSeries.length - 1];
    }

    /**
     * Obtient les métriques par préfixe
     * @param prefix Préfixe du nom de métrique
     * @returns Liste des métriques correspondantes
     */
    public getMetricsByPrefix(prefix: string): MetricValue[] {
        const result: MetricValue[] = [];

        for (const [name, series] of this.metrics.entries()) {
            if (name.startsWith(prefix) && series.length > 0) {
                result.push(series[series.length - 1]);
            }
        }

        return result;
    }

    /**
     * Calcule des statistiques pour une métrique
     * @param metricName Nom de la métrique
     * @returns Statistiques calculées
     */
    public getMetricStats(metricName: string): {
        min: number;
        max: number;
        avg: number;
        count: number;
        last: number;
        trend: 'up' | 'down' | 'stable';
    } | null {
        const series = this.metrics.get(metricName);
        if (!series || series.length === 0) return null;

        const values = series.map(point => point.value);
        const sum = values.reduce((acc, val) => acc + val, 0);

        // Calculer la tendance en comparant la moyenne des 5 dernières valeurs
        // avec la moyenne des 5 valeurs précédentes
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (series.length >= 10) {
            const recentValues = values.slice(-5);
            const previousValues = values.slice(-10, -5);

            const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
            const previousAvg = previousValues.reduce((a, b) => a + b, 0) / previousValues.length;

            const difference = recentAvg - previousAvg;
            const threshold = 0.05 * previousAvg; // 5% de différence pour considérer un changement

            if (difference > threshold) {
                trend = 'up';
            } else if (difference < -threshold) {
                trend = 'down';
            }
        }

        return {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: sum / values.length,
            count: values.length,
            last: values[values.length - 1],
            trend
        };
    }

    /**
     * Récupère l'historique des alertes
     * @param limit Nombre maximal d'alertes à récupérer
     * @returns Historique des alertes
     */
    public getAlertHistory(limit = 100): typeof this.alertHistory {
        return this.alertHistory.slice(-limit);
    }

    /**
     * Récupère les alertes actives (non résolues)
     * @returns Alertes actives
     */
    public getActiveAlerts(): Alert[] {
        return Array.from(this.activeAlerts.values())
            .filter(alert => !alert.resolved);
    }

    /**
     * Récupère la liste des métriques disponibles
     * @returns Tableau des noms de métriques
     */
    public getAvailableMetrics(): string[] {
        return Array.from(this.metrics.keys());
    }

    /**
     * Récupère la configuration actuelle du système de monitoring
     * @returns Configuration du monitoring
     */
    public getConfig(): MonitoringConfig {
        return { ...this.config };
    }

    /**
     * Met à jour la configuration du système de monitoring
     * @param config Nouvelle configuration
     */
    public updateConfig(config: Partial<MonitoringConfig>): void {
        const oldInterval = this.config.samplingInterval;

        this.config = { ...this.config, ...config };
        logger.info('Monitoring configuration updated');

        // Si l'intervalle d'échantillonnage a changé et que la collecte est active,
        // redémarrer avec le nouvel intervalle
        if (oldInterval !== this.config.samplingInterval && this.collectionInterval) {
            this.stop();
            this.start();
        }
    }

    /**
     * Récupère l'état actuel du système de monitoring
     * @returns État du monitoring
     */
    public getState(): MonitoringState {
        return {
            metricCount: this.metrics.size,
            thresholdCount: this.thresholds.size,
            alertCount: this.alertHistory.length,
            lastAlert: this.alertHistory.length > 0 ?
                this.alertHistory[this.alertHistory.length - 1] : null,
            isCollecting: this.isCollecting,
            config: this.getConfig(),
            availableMetrics: this.getAvailableMetrics()
        };
    }

    /**
     * Enregistre une fonction d'écoute pour les alertes
     * @param listener Fonction d'écoute
     */
    public onAlert(listener: (alert: Alert) => void): void {
        this.on('alert', listener);
    }

    /**
     * Enregistre une fonction d'écoute pour les résolutions d'alertes
     * @param listener Fonction d'écoute
     */
    public onAlertResolved(listener: (alert: Alert) => void): void {
        this.on('alertResolved', listener);
    }

    /**
     * Enregistre une fonction d'écoute pour les événements d'optimisation
     * @param listener Fonction d'écoute
     */
    public onOptimize(listener: (event: {
        timestamp: number;
        resourceType: ResourceType;
        metricName: string;
        currentValue: number;
        optimizationReason: string
    }) => void): void {
        this.on('optimize', listener);
    }
}

/**
 * Fonction utilitaire pour récupérer l'instance du système de monitoring
 * @returns Instance du système de monitoring
 */
export function getMonitoringSystem(): MonitoringUnifie {
    return MonitoringUnifie.getInstance();
}