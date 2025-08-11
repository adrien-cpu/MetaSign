// src/ai/coordinators/services/metrics/MetricsCollector.ts
import { Logger } from '@ai/utils/Logger';
import {
    IMetricsCollector,
    MetricValue,
    MetricTags,
    StoredMetricValue,
    MetricType,
    MetricStats,
    MetricsCollectorConfig,
    IMetricsStorage,
    IMetricsAggregator,
    AggregationResult
} from '@ai/coordinators/types';
import { Observable } from '@ai/utils/Observable';
import { LRUCache } from '@ai/utils/Cache';
import { ThresholdManager, ThresholdEvent } from './alerts/ThresholdManager';
import {
    GaugeAggregationStrategy,
    CounterAggregationStrategy,
    HistogramAggregationStrategy,
    SummaryAggregationStrategy
} from './aggregation/AggregationStrategies';
import { MetricsPersistenceStrategy } from './persistence/MetricsPersistenceStrategy';
import { MemoryMetricsStorage } from './MetricsStorage';

export interface MetricUpdate {
    namespace: string;
    name: string;
    value: number;
    type: MetricType;
    tags: MetricTags;
    timestamp: number;
}

export class MetricsCollector extends Observable<MetricUpdate> implements IMetricsCollector {
    private readonly logger = Logger.getInstance('MetricsCollector');
    private readonly config: Required<MetricsCollectorConfig>;
    private readonly storage: IMetricsStorage;
    private readonly aggregator: IMetricsAggregator;
    private readonly thresholdManager: ThresholdManager;
    private readonly metricsCache: LRUCache<string, MetricValue>;
    private readonly persistenceStrategy?: MetricsPersistenceStrategy;
    private aggregationTimer?: NodeJS.Timeout;
    private cleanupTimer?: NodeJS.Timeout;
    private persistTimer?: NodeJS.Timeout;
    private readonly nodeId?: string;

    constructor(
        private readonly namespace: string,
        options: {
            config?: MetricsCollectorConfig,
            storage?: IMetricsStorage,
            aggregator?: IMetricsAggregator,
            thresholdManager?: ThresholdManager,
            persistenceStrategy?: MetricsPersistenceStrategy,
            nodeId?: string
        } = {}
    ) {
        super();

        // Configuration par défaut
        this.config = {
            maxHistorySize: 1000,
            retentionPeriod: 24 * 60 * 60 * 1000, // 24 heures
            enableAggregation: true,
            aggregationInterval: 60 * 1000, // 1 minute
            ...options.config
        };

        // Composants
        this.storage = options.storage || new MemoryMetricsStorage(this.config.maxHistorySize);
        this.aggregator = options.aggregator || this.createDefaultAggregator();
        this.thresholdManager = options.thresholdManager || new ThresholdManager();
        this.persistenceStrategy = options.persistenceStrategy;
        this.nodeId = options.nodeId;

        // Cache pour les métriques fréquemment accédées
        this.metricsCache = new LRUCache<string, MetricValue>(100);

        // S'abonner aux événements de seuil
        this.thresholdManager.addObserver(this.handleThresholdEvent.bind(this));

        this.logger.debug(`MetricsCollector initialized for namespace: ${namespace}`, {
            config: this.config,
            nodeId: this.nodeId
        });

        // Démarrer les tâches périodiques
        this.startTasks();
    }

    /**
     * Enregistre une valeur de métrique
     */
    public recordMetric(
        name: string,
        value: number,
        type: MetricType = 'gauge',
        tags: MetricTags = {}
    ): void {
        // Ajouter le nodeId aux tags si présent
        if (this.nodeId) {
            tags = { ...tags, nodeId: this.nodeId };
        }

        // Créer la valeur de métrique
        const metricValue: StoredMetricValue = {
            value,
            timestamp: Date.now(),
            type,
            tags
        };

        // Stocker la métrique
        this.storage.store(this.namespace, name, metricValue);

        // Invalider le cache
        this.invalidateCache(name, tags);

        // Vérifier les seuils
        this.thresholdManager.checkThreshold(this.namespace, name, value, tags);

        // Notifier les observateurs
        const update: MetricUpdate = {
            namespace: this.namespace,
            name,
            value,
            type,
            tags,
            timestamp: metricValue.timestamp
        };

        this.notifyObservers(update);

        this.logger.debug(`Recorded metric: ${this.namespace}.${name}`, { value, type, tags });
    }

    /**
     * Récupère la dernière valeur d'une métrique
     */
    public getMetric(name: string, tags?: MetricTags): MetricValue | undefined {
        // Vérifier le cache d'abord
        const cacheKey = this.getCacheKey(name, tags);
        const cachedValue = this.metricsCache.get(cacheKey);

        if (cachedValue) {
            return cachedValue;
        }

        // Récupérer depuis le stockage
        const storedValue = this.storage.getLatest(this.namespace, name, tags);

        if (!storedValue) {
            return undefined;
        }

        // Convertir en MetricValue
        const result: MetricValue = {
            value: storedValue.value,
            timestamp: storedValue.timestamp,
            tags: storedValue.tags
        };

        // Mettre en cache
        this.metricsCache.set(cacheKey, result);

        return result;
    }

    /**
     * Récupère toutes les métriques par préfixe
     */
    public getMetricsByPrefix(prefix: string): Map<string, MetricValue> {
        const result = new Map<string, MetricValue>();

        // Implémentation à compléter

        return result;
    }

    /**
     * Récupère l'historique d'une métrique
     */
    public getMetricHistory(
        name: string,
        limit: number = 100,
        tags?: MetricTags
    ): MetricValue[] {
        const values = this.storage.retrieve(this.namespace, name, { limit, tags });

        // Convertir en MetricValue[]
        return values.map(v => ({
            value: v.value,
            timestamp: v.timestamp,
            tags: v.tags
        }));
    }

    /**
     * Récupère toutes les métriques
     */
    public getAllMetrics(): Record<string, number> {
        // Implémentation à compléter
        return {};
    }

    /**
     * Calcule des statistiques pour une métrique
     */
    public getMetricStats(name: string): MetricStats | null {
        const values = this.storage.retrieve(this.namespace, name);

        if (values.length === 0) {
            return null;
        }

        const numericValues = values.map(v => v.value);
        const sum = numericValues.reduce((a, b) => a + b, 0);

        return {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            avg: sum / numericValues.length,
            count: numericValues.length,
            sum,
            last: numericValues[numericValues.length - 1]
        };
    }

    /**
     * Nettoie les métriques anciennes
     */
    public cleanup(): void {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        this.storage.cleanup(cutoffTime);
    }

    /**
     * Réinitialise une métrique
     */
    public resetMetric(name: string): void {
        this.storage.clear(this.namespace, name);

        // Invalider le cache
        this.invalidateCache(name);

        this.logger.debug(`Reset metric: ${this.namespace}.${name}`);
    }

    /**
     * Réinitialise toutes les métriques
     */
    public resetAllMetrics(): void {
        this.storage.clear(this.namespace);

        // Invalider tout le cache
        this.metricsCache.clear();

        this.logger.debug('Reset all metrics');
    }

    /**
     * Arrête toutes les tâches périodiques
     */
    public shutdown(): void {
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
            this.aggregationTimer = undefined;
        }

        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }

        if (this.persistTimer) {
            clearInterval(this.persistTimer);
            this.persistTimer = undefined;
        }

        this.logger.debug('MetricsCollector shutdown');
    }

    /**
     * Démarre les tâches périodiques
     */
    private startTasks(): void {
        // Tâche d'agrégation
        if (this.config.enableAggregation) {
            this.aggregationTimer = setInterval(() => {
                this.aggregateMetrics();
            }, this.config.aggregationInterval);

            this.logger.debug('Started metrics aggregation task', {
                interval: this.config.aggregationInterval
            });
        }

        // Tâche de nettoyage
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, Math.min(this.config.retentionPeriod / 10, 3600000)); // Au plus toutes les heures

        // Tâche de persistance
        if (this.persistenceStrategy) {
            this.persistTimer = setInterval(() => {
                this.persistMetrics();
            }, 300000); // Toutes les 5 minutes
        }
    }

    /**
     * Persiste les métriques
     */
    private async persistMetrics(): Promise<void> {
        if (!this.persistenceStrategy) return;

        try {
            // Implémentation à compléter
            this.logger.debug('Persisted metrics');
        } catch (error) {
            this.logger.error('Failed to persist metrics', { error });
        }
    }

    /**
     * Agrège les métriques
     */
    private aggregateMetrics(): void {
        // Implémentation à compléter
    }

    /**
     * Crée un agrégateur par défaut
     */
    private createDefaultAggregator(): IMetricsAggregator {
        // Implémentation à compléter
        return {
            aggregate: () => [],
            registerAggregationStrategy: () => { }
        };
    }

    /**
     * Génère une clé de cache
     */
    private getCacheKey(name: string, tags?: MetricTags): string {
        if (!tags || Object.keys(tags).length === 0) {
            return `${this.namespace}.${name}`;
        }

        const tagsString = Object.entries(tags)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => `${key}=${value}`)
            .join(',');

        return `${this.namespace}.${name}[${tagsString}]`;
    }

    /**
     * Invalide les entrées du cache
     */
    private invalidateCache(name: string, tags?: MetricTags): void {
        if (!tags) {
            // Invalider toutes les entrées pour cette métrique
            const prefix = `${this.namespace}.${name}`;
            this.metricsCache.removeByPrefix(prefix);
        } else {
            // Invalider une entrée spécifique
            const cacheKey = this.getCacheKey(name, tags);
            this.metricsCache.remove(cacheKey);
        }
    }

    /**
     * Gère un événement de seuil
     */
    private handleThresholdEvent(event: ThresholdEvent): void {
        const { config, currentValue, timestamp, exceeded } = event;

        if (exceeded) {
            this.logger.warn(`Threshold exceeded for ${config.namespace}.${config.metric}`, {
                threshold: config.value,
                operator: config.operator,
                currentValue,
                severity: config.severity
            });

            // Générer une métrique d'alerte
            this.recordMetric(
                `alert.${config.metric}`,
                1,
                'counter',
                {
                    severity: config.severity,
                    thresholdValue: config.value.toString(),
                    operator: config.operator
                }
            );
        }
    }
}