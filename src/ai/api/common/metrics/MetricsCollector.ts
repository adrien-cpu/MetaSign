/**
 * src/ai/api/common/metrics/MetricsCollector.ts
 * @file MetricsCollector.ts
 * @description
 * Classe MetricsCollector pour la collecte de métriques système
 * Utilisée pour la collecte, l'analyse et la détection d'anomalies
 * dans les systèmes distribués
 * Centralisation de la logique de collecte de métriques
 * dans les systèmes distribués
 * Utilisée pour la gestion des données de métriques
 * dans les systèmes distribués
 */
import { IMetricsCollector } from './interfaces/IMetricsCollector';
import {
    SystemMetrics,
    MetricData,
    TimeFrame,
    MetricQuery,
    MetricValidation,
    MetricTransformation
} from './types/MetricTypes';

// Types supplémentaires pour les nouvelles fonctionnalités
interface EventData {
    timestamp: number;
    data: Record<string, unknown>;
}

interface TimerData {
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
}
import { MetricBucket } from './MetricBucket';

export class MetricsCollector implements IMetricsCollector {
    private metrics: Map<string, MetricBucket> = new Map();
    private readonly maxRetentionTime: number = 30 * 24 * 60 * 60 * 1000; // 30 jours
    private counters: Map<string, number> = new Map();
    private timings: Map<string, number[]> = new Map();
    private timers: Map<string, TimerData> = new Map();
    private events: Map<string, EventData[]> = new Map();

    /**
     * Incrémente un compteur
     * @param name Nom du compteur
     */
    incrementCounter(name: string): void {
        const currentValue = this.counters.get(name) || 0;
        this.counters.set(name, currentValue + 1);
    }

    /**
     * Enregistre une durée
     * @param name Nom de la métrique de durée
     * @param value Valeur de la durée
     */
    recordTiming(name: string, value: number): void {
        const values = this.timings.get(name) || [];
        values.push(value);
        this.timings.set(name, values);
    }

    /**
     * Récupère la valeur d'un compteur
     * @param name Nom du compteur
     * @returns Valeur actuelle du compteur ou 0 si non trouvé
     */
    getCounter(name: string): number {
        return this.counters.get(name) || 0;
    }

    /**
     * Récupère la moyenne d'une durée
     * @param name Nom de la métrique de durée
     * @returns Moyenne des durées ou 0 si non trouvé
     */
    getAverageTiming(name: string): number {
        const values = this.timings.get(name);
        if (!values || values.length === 0) {
            return 0;
        }
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    }

    /**
     * Enregistre un événement
     * @param eventName Nom de l'événement
     * @param data Données associées à l'événement
     */
    trackEvent(eventName: string, data?: Record<string, unknown>): void {
        const events = this.events.get(eventName) || [];
        events.push({
            timestamp: Date.now(),
            data: data || {}
        });
        this.events.set(eventName, events);
    }

    /**
     * Enregistre une métrique nommée avec sa valeur
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param tags Tags associés à la métrique
     */
    trackMetric(name: string, value: number, tags?: Record<string, string>): void {
        const metric: SystemMetrics = {
            name,
            timestamp: Date.now(),
            value,
            unit: 'count',
            tags: tags || {},
            source: 'collector',
            type: 'gauge'
        };

        this.storeMetric(metric);
    }

    /**
     * Démarre un timer
     * @param name Nom du timer
     * @returns Identifiant du timer
     */
    startTimer(name: string): string {
        const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.timers.set(timerId, {
            name,
            startTime: Date.now(),
            endTime: 0,
            duration: 0
        });
        return timerId;
    }

    /**
     * Arrête un timer et enregistre sa durée
     * @param timerId Identifiant du timer
     * @returns Durée en millisecondes ou -1 si le timer n'existe pas
     */
    stopTimer(timerId: string): number {
        const timer = this.timers.get(timerId);
        if (!timer) {
            return -1;
        }

        const endTime = Date.now();
        const duration = endTime - timer.startTime;

        timer.endTime = endTime;
        timer.duration = duration;
        this.timers.set(timerId, timer);

        // Enregistre également cette durée comme métrique standard
        this.recordTiming(timer.name, duration);
        this.trackMetric(`${timer.name}_duration`, duration);

        return duration;
    }

    /**
     * Enregistre une métrique
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param tags Tags associés à la métrique
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void {
        const metric: SystemMetrics = {
            name,
            timestamp: Date.now(),
            value,
            unit: 'count',
            tags: tags || {},
            source: 'collector',
            type: 'gauge'
        };

        this.storeMetric(metric);
    }

    async collect(metric: SystemMetrics): Promise<boolean> {
        try {
            await Promise.all([
                this.collectPerformanceMetrics(metric),
                this.collectResourceMetrics(metric),
                this.collectBusinessMetrics(metric)
            ]);
            return true;
        } catch (error) {
            console.error('Error collecting metrics:', error);
            return false;
        }
    }

    private async collectPerformanceMetrics(metric: SystemMetrics): Promise<void> {
        if (this.isPerformanceMetric(metric)) {
            await this.storeMetric(metric);
        }
    }

    private async collectResourceMetrics(metric: SystemMetrics): Promise<void> {
        if (this.isResourceMetric(metric)) {
            await this.storeMetric(metric);
        }
    }

    private async collectBusinessMetrics(metric: SystemMetrics): Promise<void> {
        if (this.isBusinessMetric(metric)) {
            await this.storeMetric(metric);
        }
    }

    private isPerformanceMetric(metric: SystemMetrics): boolean {
        return metric.tags.type === 'performance';
    }

    private isResourceMetric(metric: SystemMetrics): boolean {
        return metric.tags.type === 'resource';
    }

    private isBusinessMetric(metric: SystemMetrics): boolean {
        return metric.tags.type === 'business';
    }

    async getMetrics(timeFrame: TimeFrame): Promise<SystemMetrics[]> {
        const result: SystemMetrics[] = [];
        for (const [metricName, bucket] of this.metrics) {
            const bucketData = await bucket.aggregateByTimeFrame(timeFrame);
            result.push({
                name: metricName,
                timestamp: Date.now(),
                value: bucketData.avg,
                unit: 'count',
                tags: {},
                source: 'collector',
                type: 'gauge'
            });
        }
        return result;
    }

    async aggregateMetric(metricName: string, timeFrame: TimeFrame): Promise<MetricData> {
        const bucket = this.getBucketForMetric(metricName);
        if (!bucket) {
            return this.createEmptyMetricData();
        }
        return bucket.aggregateByTimeFrame(timeFrame);
    }

    private getBucketForMetric(metricName: string): MetricBucket | undefined {
        let bucket = this.metrics.get(metricName);
        if (!bucket) {
            bucket = new MetricBucket();
            this.metrics.set(metricName, bucket);
        }
        return bucket;
    }

    private createEmptyMetricData(): MetricData {
        return {
            min: 0,
            max: 0,
            avg: 0,
            sum: 0,
            count: 0,
            lastUpdate: Date.now()
        };
    }

    async queryMetrics(query: MetricQuery): Promise<SystemMetrics[]> {
        const { timeFrame, filters } = query;
        let metrics = await this.getMetrics(timeFrame);

        // Appliquer les filtres
        if (filters) {
            metrics = metrics.filter(metric => {
                return Object.entries(filters).every(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.includes(metric.tags[key]);
                    }
                    return metric.tags[key] === value;
                });
            });
        }

        return metrics;
    }

    validateMetric(metric: SystemMetrics): MetricValidation {
        const validation: MetricValidation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Vérifier les champs requis
        if (!metric.name) {
            validation.isValid = false;
            validation.errors?.push('Metric name is required');
        }

        if (typeof metric.value !== 'number') {
            validation.isValid = false;
            validation.errors?.push('Metric value must be a number');
        }

        if (!metric.timestamp) {
            validation.isValid = false;
            validation.errors?.push('Timestamp is required');
        }

        // Vérifier les valeurs aberrantes
        if (metric.value < 0 && !metric.tags.allowNegative) {
            validation.warnings?.push('Negative value detected');
        }

        return validation;
    }

    transformMetric(metric: SystemMetrics, transformation: MetricTransformation): SystemMetrics {
        const transformed = { ...metric };

        switch (transformation.type) {
            case 'scale':
                transformed.value *= transformation.value;
                break;
            case 'offset':
                transformed.value += transformation.value;
                break;
            case 'rate':
                // Calculer le taux de changement
                const previousValue = this.getPreviousValue(metric.name);
                if (previousValue !== undefined) {
                    transformed.value = (metric.value - previousValue) / transformation.value;
                }
                break;
            case 'delta':
                const lastValue = this.getPreviousValue(metric.name);
                if (lastValue !== undefined) {
                    transformed.value = metric.value - lastValue;
                }
                break;
        }

        return transformed;
    }

    private getPreviousValue(metricName: string): number | undefined {
        const bucket = this.metrics.get(metricName);
        if (bucket) {
            const data = bucket.getBucketData();
            return data.count > 0 ? data.avg : undefined;
        }
        return undefined;
    }

    private async storeMetric(metric: SystemMetrics): Promise<void> {
        const bucket = this.getBucketForMetric(metric.name);
        if (bucket) {
            bucket.addValue(metric.value, metric.timestamp);
        }
    }

    async cleanup(olderThan?: number): Promise<number> {
        const cutoffTimestamp = olderThan || (Date.now() - this.maxRetentionTime);
        let totalDeleted = 0;

        for (const [metricName, bucket] of this.metrics) {
            const deleted = bucket.cleanupOldData(cutoffTimestamp);
            totalDeleted += deleted;

            // Supprimer les buckets vides
            if (bucket.getBucketData().count === 0) {
                this.metrics.delete(metricName);
            }
        }

        // Nettoyer également les événements anciens
        for (const [eventName, events] of this.events) {
            const newEvents = events.filter(event => event.timestamp >= cutoffTimestamp);
            if (newEvents.length < events.length) {
                totalDeleted += (events.length - newEvents.length);
                this.events.set(eventName, newEvents);

                // Supprimer les entrées vides
                if (newEvents.length === 0) {
                    this.events.delete(eventName);
                }
            }
        }

        // Nettoyer les timers terminés et anciens
        for (const [timerId, timer] of this.timers) {
            if (timer.endTime > 0 && timer.endTime < cutoffTimestamp) {
                this.timers.delete(timerId);
                totalDeleted++;
            }
        }

        return totalDeleted;
    }

    async getCollectionStats(): Promise<{
        totalMetrics: number;
        oldestMetric: number;
        newestMetric: number;
        storageSize: number;
        totalEvents: number;
        activeTimers: number;
    }> {
        let totalMetrics = 0;
        let oldestMetric = Date.now();
        let newestMetric = 0;
        let storageSize = 0;

        for (const bucket of this.metrics.values()) {
            const data = bucket.getBucketData();
            totalMetrics += data.count;
            oldestMetric = Math.min(oldestMetric, data.lastUpdate);
            newestMetric = Math.max(newestMetric, data.lastUpdate);
            storageSize += bucket.getStorageSize();
        }

        // Compter le total d'événements
        let totalEvents = 0;
        for (const events of this.events.values()) {
            totalEvents += events.length;
            storageSize += JSON.stringify(events).length * 2; // Estimation approximative
        }

        // Compter les timers actifs
        const activeTimers = Array.from(this.timers.values())
            .filter(timer => timer.endTime === 0)
            .length;

        return {
            totalMetrics,
            oldestMetric,
            newestMetric,
            storageSize,
            totalEvents,
            activeTimers
        };
    }
}