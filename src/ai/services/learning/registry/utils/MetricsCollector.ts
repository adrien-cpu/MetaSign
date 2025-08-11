/**
 * @file src/ai/services/learning/registry/utils/MetricsCollector.ts
 * @description Collecteur de métriques pour le suivi des performances et événements
 * dans le système d'apprentissage avec support de persistence et agrégation.
 * @version 1.0.0
 * @since 2024
 */

import { LearningLogger } from '@/ai/services/learning/utils/logger';

/**
 * Interface pour un événement métrique
 */
export interface MetricEvent {
    /** Nom de l'événement */
    name: string;
    /** Données associées à l'événement */
    data: Record<string, unknown>;
    /** Horodatage de l'événement */
    timestamp: Date;
    /** Catégorie de l'événement */
    category: string;
    /** Niveau de priorité */
    priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Interface pour une métrique agrégée
 */
export interface AggregatedMetric {
    /** Nom de la métrique */
    name: string;
    /** Nombre d'occurrences */
    count: number;
    /** Valeur moyenne (si applicable) */
    average?: number;
    /** Valeur minimale */
    min?: number;
    /** Valeur maximale */
    max?: number;
    /** Somme totale */
    total?: number;
    /** Dernière mise à jour */
    lastUpdate: Date;
    /** Première occurrence */
    firstOccurrence: Date;
}

/**
 * Configuration du collecteur de métriques
 */
export interface MetricsCollectorConfig {
    /** Taille maximale du buffer d'événements */
    maxBufferSize: number;
    /** Intervalle d'agrégation en millisecondes */
    aggregationInterval: number;
    /** Activer la persistence des métriques */
    enablePersistence: boolean;
    /** Niveau de détail des logs */
    logLevel: 'none' | 'basic' | 'detailed';
    /** Durée de rétention des métriques (en jours) */
    retentionDays: number;
}

/**
 * @class MetricsCollector
 * @description Collecteur centralisé de métriques avec capacités d'agrégation,
 * de filtrage et de reporting pour le système d'apprentissage.
 */
export class MetricsCollector {
    private readonly events: MetricEvent[] = [];
    private readonly aggregatedMetrics: Map<string, AggregatedMetric> = new Map();
    private readonly config: MetricsCollectorConfig;
    private aggregationTimer: NodeJS.Timeout | null = null;

    /**
     * Initialise le collecteur de métriques
     * @param config - Configuration du collecteur
     */
    constructor(config: Partial<MetricsCollectorConfig> = {}) {
        this.config = {
            maxBufferSize: 10000,
            aggregationInterval: 60000, // 1 minute
            enablePersistence: false,
            logLevel: 'basic',
            retentionDays: 30,
            ...config
        };

        this.startAggregationTimer();

        LearningLogger.info('MetricsCollector initialisé', {
            maxBufferSize: this.config.maxBufferSize,
            aggregationInterval: this.config.aggregationInterval,
            enablePersistence: this.config.enablePersistence
        });
    }

    /**
     * Enregistre un événement métrique
     * @param eventName - Nom de l'événement
     * @param data - Données associées à l'événement
     * @param category - Catégorie de l'événement (par défaut: 'general')
     * @param priority - Priorité de l'événement (par défaut: 'medium')
     */
    public recordEvent(
        eventName: string,
        data: Record<string, unknown> = {},
        category = 'general',
        priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ): void {
        const event: MetricEvent = {
            name: eventName,
            data: { ...data },
            timestamp: new Date(),
            category,
            priority
        };

        this.events.push(event);

        // Vérifier la taille du buffer
        if (this.events.length > this.config.maxBufferSize) {
            this.events.shift(); // Supprimer l'événement le plus ancien
        }

        // Mettre à jour les métriques agrégées immédiatement
        this.updateAggregatedMetric(event);

        // Log selon le niveau configuré
        if (this.config.logLevel === 'detailed') {
            LearningLogger.debug(`Événement enregistré: ${eventName}`, {
                eventName,
                category,
                priority,
                dataKeys: Object.keys(data)
            });
        } else if (this.config.logLevel === 'basic' && priority === 'critical') {
            LearningLogger.info(`Événement critique: ${eventName}`, { category, priority });
        }
    }

    /**
     * Récupère tous les événements filtrés par critères
     * @param filters - Critères de filtrage
     * @returns Événements filtrés
     */
    public getEvents(filters: {
        name?: string;
        category?: string;
        priority?: string;
        since?: Date;
        until?: Date;
    } = {}): MetricEvent[] {
        return this.events.filter(event => {
            if (filters.name && event.name !== filters.name) return false;
            if (filters.category && event.category !== filters.category) return false;
            if (filters.priority && event.priority !== filters.priority) return false;
            if (filters.since && event.timestamp < filters.since) return false;
            if (filters.until && event.timestamp > filters.until) return false;
            return true;
        });
    }

    /**
     * Récupère les métriques agrégées
     * @param metricName - Nom de la métrique (optionnel)
     * @returns Métriques agrégées
     */
    public getAggregatedMetrics(metricName?: string): AggregatedMetric[] {
        if (metricName) {
            const metric = this.aggregatedMetrics.get(metricName);
            return metric ? [metric] : [];
        }
        return Array.from(this.aggregatedMetrics.values());
    }

    /**
     * Récupère les statistiques générales du collecteur
     * @returns Statistiques du collecteur
     */
    public getCollectorStats(): {
        totalEvents: number;
        bufferUsage: number;
        aggregatedMetricsCount: number;
        oldestEvent?: Date;
        newestEvent?: Date;
        eventsByCategory: Record<string, number>;
        eventsByPriority: Record<string, number>;
    } {
        const eventsByCategory: Record<string, number> = {};
        const eventsByPriority: Record<string, number> = {};

        this.events.forEach(event => {
            eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
            eventsByPriority[event.priority] = (eventsByPriority[event.priority] || 0) + 1;
        });

        return {
            totalEvents: this.events.length,
            bufferUsage: (this.events.length / this.config.maxBufferSize) * 100,
            aggregatedMetricsCount: this.aggregatedMetrics.size,
            oldestEvent: this.events.length > 0 ? this.events[0].timestamp : undefined,
            newestEvent: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : undefined,
            eventsByCategory,
            eventsByPriority
        };
    }

    /**
     * Efface tous les événements et métriques
     */
    public clearAll(): void {
        this.events.length = 0;
        this.aggregatedMetrics.clear();
        LearningLogger.info('Toutes les métriques ont été effacées');
    }

    /**
     * Efface les événements anciens selon la politique de rétention
     */
    public cleanupOldEvents(): void {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

        const initialCount = this.events.length;
        const filteredEvents = this.events.filter(event => event.timestamp > cutoffDate);

        this.events.length = 0;
        this.events.push(...filteredEvents);

        const removedCount = initialCount - this.events.length;
        if (removedCount > 0) {
            LearningLogger.info(`Nettoyage effectué: ${removedCount} événements anciens supprimés`);
        }
    }

    /**
     * Export des métriques au format JSON
     * @returns Données d'export
     */
    public exportMetrics(): {
        events: MetricEvent[];
        aggregatedMetrics: AggregatedMetric[];
        collectorStats: ReturnType<typeof this.getCollectorStats>;
        exportTimestamp: Date;
    } {
        return {
            events: [...this.events],
            aggregatedMetrics: this.getAggregatedMetrics(),
            collectorStats: this.getCollectorStats(),
            exportTimestamp: new Date()
        };
    }

    /**
     * Arrête le collecteur et nettoie les ressources
     */
    public shutdown(): void {
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
            this.aggregationTimer = null;
        }

        LearningLogger.info('MetricsCollector arrêté', {
            finalEventCount: this.events.length,
            finalMetricsCount: this.aggregatedMetrics.size
        });
    }

    /**
     * Met à jour une métrique agrégée avec un nouvel événement
     * @param event - Événement à traiter
     */
    private updateAggregatedMetric(event: MetricEvent): void {
        const existing = this.aggregatedMetrics.get(event.name);

        if (existing) {
            existing.count++;
            existing.lastUpdate = event.timestamp;

            // Mise à jour des valeurs numériques si présentes
            this.updateNumericAggregates(existing, event.data);
        } else {
            const newMetric: AggregatedMetric = {
                name: event.name,
                count: 1,
                lastUpdate: event.timestamp,
                firstOccurrence: event.timestamp
            };

            // Initialiser les agrégats numériques
            this.updateNumericAggregates(newMetric, event.data);

            this.aggregatedMetrics.set(event.name, newMetric);
        }
    }

    /**
     * Met à jour les agrégats numériques d'une métrique
     * @param metric - Métrique à mettre à jour
     * @param data - Données de l'événement
     */
    private updateNumericAggregates(metric: AggregatedMetric, data: Record<string, unknown>): void {
        // Chercher des valeurs numériques dans les données
        const numericValues = Object.values(data).filter((value): value is number =>
            typeof value === 'number' && !isNaN(value)
        );

        if (numericValues.length > 0) {
            const sum = numericValues.reduce((acc, val) => acc + val, 0);
            const avg = sum / numericValues.length;

            metric.total = (metric.total || 0) + sum;
            metric.average = metric.count === 1 ? avg :
                ((metric.average || 0) * (metric.count - 1) + avg) / metric.count;
            metric.min = metric.min === undefined ? avg : Math.min(metric.min, avg);
            metric.max = metric.max === undefined ? avg : Math.max(metric.max, avg);
        }
    }

    /**
     * Démarre le timer d'agrégation périodique
     */
    private startAggregationTimer(): void {
        if (this.config.aggregationInterval > 0) {
            this.aggregationTimer = setInterval(() => {
                this.performPeriodicAggregation();
            }, this.config.aggregationInterval);
        }
    }

    /**
     * Effectue l'agrégation périodique des métriques
     */
    private performPeriodicAggregation(): void {
        // Nettoyage des événements anciens
        this.cleanupOldEvents();

        // Log des statistiques périodiques
        if (this.config.logLevel !== 'none') {
            const stats = this.getCollectorStats();
            LearningLogger.debug('Agrégation périodique des métriques', {
                totalEvents: stats.totalEvents,
                metricsCount: stats.aggregatedMetricsCount,
                bufferUsage: Math.round(stats.bufferUsage)
            });
        }
    }
}