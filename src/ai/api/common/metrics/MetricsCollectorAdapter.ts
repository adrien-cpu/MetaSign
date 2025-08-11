/**
 * src/ai/api/common/metrics/MetricsCollectorAdapter.ts
 * @file MetricsCollectorAdapter.ts
 * @description
 * Crée un adaptateur pour faire le lien entre différentes implémentations de MetricsCollector.
 * Adaptateur pour MetricsCollector provenant du package coordinators.
 * Adapte le collecteur de métriques du coordinateur pour fonctionner avec l'interface IMetricsCollector.
 * Utilisé pour faire le pont entre différentes implémentations de collecteurs de métriques
 * dans le système.
 * Centralise la logique de collecte des métriques
 * dans les systèmes distribués.
 * Utilisé pour le suivi des performances du système et la journalisation des événements.
 */

import { IMetricsCollector } from './interfaces/IMetricsCollector';
import { MetricsCollector as CoordinatorMetricsCollector } from '@ai/coordinators/services/metrics/MetricsCollector';
import {
    SystemMetrics,
    MetricData,
    TimeFrame,
    MetricQuery,
    MetricValidation,
    MetricTransformation
} from './types/MetricTypes';

// Types pour le stockage local
interface EventData {
    timestamp: number;
    data: Record<string, unknown>;
}

interface TimerData {
    name: string;
    startTime: number;
}

/**
 * Adaptateur pour MetricsCollector provenant du package coordinators.
 * Adapte le collecteur de métriques du coordinateur pour fonctionner avec l'interface IMetricsCollector.
 */
export class MetricsCollectorAdapter implements IMetricsCollector {
    private adaptedCollector: CoordinatorMetricsCollector;
    // Propriété privée pour stocker les timers si l'implémentation de fallback est utilisée
    private timerStorage: Map<string, TimerData> = new Map();
    // Stockage des événements
    private eventStorage: Map<string, Array<EventData>> = new Map();
    // Stockage des métriques
    private metricsStorage: Map<string, Array<SystemMetrics>> = new Map();

    constructor(adaptedCollector: CoordinatorMetricsCollector) {
        this.adaptedCollector = adaptedCollector;
    }

    /**
     * Enregistre un événement avec ses données associées
     * @param eventName Nom de l'événement
     * @param data Données associées à l'événement
     */
    trackEvent(eventName: string, data?: Record<string, unknown>): void {
        // Stockage de l'événement localement
        const events = this.eventStorage.get(eventName) || [];
        events.push({
            timestamp: Date.now(),
            data: data || {}
        });
        this.eventStorage.set(eventName, events);

        // Enregistrement comme métrique standard également
        this.recordMetric(`event_${eventName}`, 1, {
            eventType: eventName,
            ...(data ? { hasData: 'true' } : {})
        });
    }

    /**
     * Enregistre une métrique nommée avec sa valeur
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param tags Tags associés à la métrique
     */
    trackMetric(name: string, value: number, tags?: Record<string, string>): void {
        // Utiliser directement recordMetric
        this.recordMetric(name, value, tags);
    }

    /**
     * Démarre un timer pour mesurer une durée
     * @param name Nom du timer
     * @returns Identifiant du timer
     */
    startTimer(name: string): string {
        const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        this.timerStorage.set(timerId, {
            name,
            startTime: Date.now()
        });

        return timerId;
    }

    /**
     * Arrête un timer et enregistre sa durée
     * @param timerId Identifiant du timer
     * @returns Durée en millisecondes ou -1 si le timer n'existe pas
     */
    stopTimer(timerId: string): number {
        if (!this.timerStorage.has(timerId)) {
            console.warn(`Timer with ID ${timerId} not found`);
            return -1;
        }

        const timer = this.timerStorage.get(timerId)!;
        const duration = Date.now() - timer.startTime;

        // Enregistrer cette durée comme métrique
        this.recordMetric(`timer_${timer.name}`, duration, {
            timerName: timer.name,
            timerType: 'custom'
        });

        // Nettoyer le timer
        this.timerStorage.delete(timerId);

        return duration;
    }

    /**
     * Enregistre une métrique en déléguant au collecteur adapté.
     * 
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param tags Étiquettes optionnelles pour catégoriser la métrique
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void {
        // Adapter l'appel au collecteur sous-jacent
        const metricType = tags?.type || 'gauge';
        const filteredTags = { ...tags };

        // Supprimer le tag type s'il existe pour éviter les doublons
        if (filteredTags && filteredTags.type) {
            delete filteredTags.type;
        }

        try {
            // On utilise une conversion de type sans any
            const typeAsCoordinatorType = metricType as unknown as 'counter' | 'gauge' | 'histogram';

            // Essayer d'utiliser le collecteur adapté avec sa propre signature
            this.adaptedCollector.recordMetric(name, value, typeAsCoordinatorType, filteredTags);
        } catch (error) {
            console.error(`Error in recordMetric adapter: ${error}`);

            // Stocker la métrique localement en cas d'erreur
            this.storeMetricLocally(name, value, tags);
        }
    }

    /**
     * Collecte une métrique complète du système
     * @param metric La métrique à collecter
     */
    async collect(metric: SystemMetrics): Promise<boolean> {
        try {
            // Stocker la métrique dans notre stockage local
            this.storeMetricLocally(metric.name, metric.value, {
                ...metric.tags,
                unit: metric.unit,
                source: metric.source,
                type: metric.type
            });
            return true;
        } catch (error) {
            console.error(`Error in collect method: ${error}`);
            return false;
        }
    }

    /**
     * Récupère les métriques pour une période donnée
     * @param timeFrame Période de temps pour laquelle récupérer les métriques
     */
    async getMetrics(timeFrame: TimeFrame): Promise<SystemMetrics[]> {
        // Calculer la date limite pour le filtre de temps
        const cutoffTime = timeFrame.start;
        const endTime = timeFrame.end;

        // Filtrer et agréger les métriques de notre stockage local
        const result: SystemMetrics[] = [];

        for (const [metricName, metrics] of this.metricsStorage.entries()) {
            // Filtrer par période
            const filteredMetrics = metrics.filter(m =>
                m.timestamp >= cutoffTime && m.timestamp <= endTime
            );

            if (filteredMetrics.length > 0) {
                // Calculer la moyenne des valeurs
                const sum = filteredMetrics.reduce((acc, m) => acc + m.value, 0);
                const avg = sum / filteredMetrics.length;

                // Ajouter la métrique agrégée
                result.push({
                    name: metricName,
                    timestamp: Date.now(),
                    value: avg,
                    unit: filteredMetrics[0].unit,
                    tags: filteredMetrics[0].tags,
                    source: 'collector-adapter',
                    type: filteredMetrics[0].type
                });
            }
        }

        return result;
    }

    /**
     * Agrège une métrique spécifique sur une période donnée
     * @param metricName Nom de la métrique à agréger
     * @param timeFrame Période de temps pour l'agrégation
     */
    async aggregateMetric(metricName: string, timeFrame: TimeFrame): Promise<MetricData> {
        const metrics = this.metricsStorage.get(metricName) || [];

        // Filtrer par période
        const filteredMetrics = metrics.filter(m =>
            m.timestamp >= timeFrame.start && m.timestamp <= timeFrame.end
        );

        if (filteredMetrics.length === 0) {
            return {
                min: 0,
                max: 0,
                avg: 0,
                sum: 0,
                count: 0,
                lastUpdate: Date.now()
            };
        }

        // Calculer les statistiques
        const values = filteredMetrics.map(m => m.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = sum / values.length;

        return {
            min,
            max,
            avg,
            sum,
            count: values.length,
            lastUpdate: Math.max(...filteredMetrics.map(m => m.timestamp))
        };
    }

    /**
     * Exécute une requête sur les métriques selon des critères spécifiques
     * @param query Requête de métriques avec filtres et période
     */
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

    /**
     * Valide une métrique selon des règles prédéfinies
     * @param metric Métrique à valider
     */
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

    /**
     * Transforme une métrique selon une transformation spécifiée
     * @param metric Métrique à transformer
     * @param transformation Transformation à appliquer
     */
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
                const previousValues = this.metricsStorage.get(metric.name) || [];
                const previousMetrics = previousValues
                    .filter(m => m.timestamp < metric.timestamp)
                    .sort((a, b) => b.timestamp - a.timestamp);

                if (previousMetrics.length > 0) {
                    const previousValue = previousMetrics[0].value;
                    transformed.value = (metric.value - previousValue) / transformation.value;
                }
                break;
            case 'delta':
                const prevValues = this.metricsStorage.get(metric.name) || [];
                const prevMetrics = prevValues
                    .filter(m => m.timestamp < metric.timestamp)
                    .sort((a, b) => b.timestamp - a.timestamp);

                if (prevMetrics.length > 0) {
                    const previousValue = prevMetrics[0].value;
                    transformed.value = metric.value - previousValue;
                }
                break;
        }

        return transformed;
    }

    /**
     * Nettoie les métriques plus anciennes qu'une date spécifiée
     * @param olderThan Timestamp avant lequel les métriques doivent être supprimées
     */
    async cleanup(olderThan?: number): Promise<number> {
        const cutoffTimestamp = olderThan || (Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 jours par défaut
        let totalDeleted = 0;

        // Nettoyer les métriques
        for (const [metricName, metrics] of this.metricsStorage.entries()) {
            const newMetrics = metrics.filter(m => m.timestamp >= cutoffTimestamp);
            totalDeleted += (metrics.length - newMetrics.length);

            if (newMetrics.length === 0) {
                this.metricsStorage.delete(metricName);
            } else {
                this.metricsStorage.set(metricName, newMetrics);
            }
        }

        // Nettoyer les événements
        for (const [eventName, events] of this.eventStorage.entries()) {
            const newEvents = events.filter(e => e.timestamp >= cutoffTimestamp);
            totalDeleted += (events.length - newEvents.length);

            if (newEvents.length === 0) {
                this.eventStorage.delete(eventName);
            } else {
                this.eventStorage.set(eventName, newEvents);
            }
        }

        return totalDeleted;
    }

    /**
     * Récupère des statistiques sur la collection de métriques
     */
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

        // Calculer les statistiques pour les métriques
        for (const metrics of this.metricsStorage.values()) {
            totalMetrics += metrics.length;

            for (const metric of metrics) {
                oldestMetric = Math.min(oldestMetric, metric.timestamp);
                newestMetric = Math.max(newestMetric, metric.timestamp);
                storageSize += JSON.stringify(metric).length * 2; // Estimation approximative
            }
        }

        // Compter le total d'événements
        let totalEvents = 0;
        for (const events of this.eventStorage.values()) {
            totalEvents += events.length;
            storageSize += JSON.stringify(events).length * 2; // Estimation approximative
        }

        // Compter les timers actifs
        const activeTimers = this.timerStorage.size;

        return {
            totalMetrics,
            oldestMetric: oldestMetric === Date.now() ? 0 : oldestMetric,
            newestMetric,
            storageSize,
            totalEvents,
            activeTimers
        };
    }

    /**
     * Stocke une métrique localement
     * @private
     */
    private storeMetricLocally(name: string, value: number, tags?: Record<string, string>): void {
        const metrics = this.metricsStorage.get(name) || [];

        // S'assurer que le type est une valeur valide pour SystemMetrics.type
        const metricType = (tags?.type || 'gauge') as SystemMetrics['type'];

        metrics.push({
            name,
            timestamp: Date.now(),
            value,
            unit: tags?.unit || 'count',
            tags: tags || {},
            source: 'collector-adapter',
            type: metricType
        });

        this.metricsStorage.set(name, metrics);
    }
}