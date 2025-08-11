/**
 * @file: src/ai/coordinators/services/MetricsCollector.ts
 * 
 * Service de collecte et gestion des métriques de performance.
 * Fournit une interface unifiée pour la collecte, l'accès et l'analyse des métriques.
 */

/**
 * @file: src/ai/coordinators/services/MetricsCollector.ts
 * 
 * Service de collecte et gestion des métriques de performance.
 * Fournit une interface unifiée pour la collecte, l'accès et l'analyse des métriques.
 */

import { Logger } from '@ai/utils/Logger';
import {
    MetricValue,
    MetricTags,
    StoredMetricValue,
    MetricType,
    MetricStats
} from '../types/metrics.types';
import {
    IMetricsCollector,
    MetricsCollectorConfig
} from '../interfaces/IMetricsCollector';

// Le reste du code...

/**
 * Service de collecte et gestion des métriques de performance
 */export class MetricsCollector implements IMetricsCollector {
    private readonly logger = Logger.getInstance('MetricsCollector');
    private readonly metrics = new Map<string, StoredMetricValue[]>();
    private readonly config: Required<MetricsCollectorConfig>;
    private aggregationTimer: NodeJS.Timeout | undefined;
    private cleanupTimer: NodeJS.Timeout | undefined;

    /**
     * Crée une nouvelle instance du collecteur de métriques
     * @param namespace Espace de noms pour les métriques (pour éviter les collisions)
     * @param config Configuration du collecteur
     */
    constructor(
        private readonly namespace: string,
        config: MetricsCollectorConfig = {}
    ) {
        // Configuration par défaut
        this.config = {
            maxHistorySize: 1000,
            retentionPeriod: 24 * 60 * 60 * 1000, // 24 heures
            enableAggregation: true,
            aggregationInterval: 60 * 1000, // 1 minute
            ...config
        };

        this.logger.debug(`MetricsCollector initialized for namespace: ${namespace}`, { config: this.config });

        // Si l'agrégation est activée, démarrer la tâche d'agrégation périodique
        if (this.config.enableAggregation) {
            this.startTasks();
        }
    }

    /**
     * Enregistre une valeur de métrique
     * @param name Nom de la métrique
     * @param value Valeur à enregistrer
     * @param type Type de métrique
     * @param tags Tags associés à la métrique
     */
    public recordMetric(
        name: string,
        value: number,
        type: MetricType = 'gauge',
        tags: MetricTags = {}
    ): void {
        // Préfixer le nom avec l'espace de noms
        const metricName = `${this.namespace}.${name}`;

        // Créer l'entrée de collection si elle n'existe pas
        if (!this.metrics.has(metricName)) {
            this.metrics.set(metricName, []);
        }

        // Récupérer la collection
        const values = this.metrics.get(metricName)!;

        // Ajouter la nouvelle valeur
        const metricValue: StoredMetricValue = {
            value,
            timestamp: Date.now(),
            type,
            tags
        };

        values.push(metricValue);

        // Limiter la taille de l'historique
        if (values.length > this.config.maxHistorySize) {
            values.shift();
        }

        // Traitement spécial selon le type de métrique
        if (type === 'counter') {
            this.checkThresholds(metricName, value);
        }

        this.logger.debug(`Recorded metric: ${metricName}`, { value, type, tags });
    }

    /**
     * Récupère la dernière valeur d'une métrique
     * @param name Nom de la métrique
     * @param tags Tags pour filtrer (optionnel)
     * @returns Dernière valeur de la métrique ou undefined
     */
    public getMetric(name: string, tags?: MetricTags): MetricValue | undefined {
        const metricName = `${this.namespace}.${name}`;
        const values = this.metrics.get(metricName);

        if (!values || values.length === 0) {
            return undefined;
        }

        // Si des tags sont spécifiés, filtrer les valeurs correspondantes
        if (tags) {
            const filteredValues = this.filterByTags(values, tags);
            if (filteredValues.length === 0) {
                return undefined;
            }

            const lastValue = filteredValues[filteredValues.length - 1];
            return {
                value: lastValue.value,
                timestamp: lastValue.timestamp,
                tags: lastValue.tags
            };
        }

        // Retourner la dernière valeur
        const lastValue = values[values.length - 1];
        return {
            value: lastValue.value,
            timestamp: lastValue.timestamp,
            tags: lastValue.tags
        };
    }

    /**
     * Récupère toutes les métriques par préfixe
     * @param prefix Préfixe des noms de métriques
     * @returns Carte des dernières valeurs de métriques
     */
    public getMetricsByPrefix(prefix: string): Map<string, MetricValue> {
        const result = new Map<string, MetricValue>();
        const fullPrefix = `${this.namespace}.${prefix}`;

        for (const [name, values] of this.metrics.entries()) {
            if (name.startsWith(fullPrefix) && values.length > 0) {
                const lastValue = values[values.length - 1];
                result.set(name.substring(this.namespace.length + 1), {
                    value: lastValue.value,
                    timestamp: lastValue.timestamp,
                    tags: lastValue.tags
                });
            }
        }

        return result;
    }

    /**
     * Récupère l'historique d'une métrique
     * @param name Nom de la métrique
     * @param limit Limite du nombre de valeurs à retourner
     * @param tags Tags pour filtrer (optionnel)
     * @returns Historique des valeurs de la métrique
     */
    public getMetricHistory(
        name: string,
        limit: number = 100,
        tags?: MetricTags
    ): MetricValue[] {
        const metricName = `${this.namespace}.${name}`;
        const values = this.metrics.get(metricName);

        if (!values || values.length === 0) {
            return [];
        }

        // Si des tags sont spécifiés, filtrer les valeurs correspondantes
        let filteredValues = values;
        if (tags) {
            filteredValues = this.filterByTags(values, tags);
        }

        // Limiter le nombre de valeurs et convertir au format MetricValue
        return filteredValues.slice(-limit).map(v => ({
            value: v.value,
            timestamp: v.timestamp,
            tags: v.tags
        }));
    }

    /**
     * Récupère toutes les métriques
     * @returns Toutes les dernières valeurs de métriques
     */
    public getAllMetrics(): Record<string, number> {
        const result: Record<string, number> = {};

        for (const [name, values] of this.metrics.entries()) {
            if (values.length > 0) {
                // Extraire le nom sans le préfixe de l'espace de noms
                const shortName = name.substring(this.namespace.length + 1);
                result[shortName] = values[values.length - 1].value;
            }
        }

        return result;
    }

    /**
     * Calcule des statistiques pour une métrique
     * @param name Nom de la métrique
     * @returns Statistiques calculées
     */
    public getMetricStats(name: string): MetricStats | null {
        const metricName = `${this.namespace}.${name}`;
        const values = this.metrics.get(metricName);

        if (!values || values.length === 0) {
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
        const now = Date.now();
        const cutoffTime = now - this.config.retentionPeriod;
        let totalCleaned = 0;

        for (const [name, values] of this.metrics.entries()) {
            const originalLength = values.length;
            const newValues = values.filter(v => v.timestamp >= cutoffTime);
            totalCleaned += originalLength - newValues.length;

            this.metrics.set(name, newValues);
        }

        if (totalCleaned > 0) {
            this.logger.debug(`Cleaned up ${totalCleaned} old metric values`);
        }
    }

    /**
     * Réinitialise une métrique
     * @param name Nom de la métrique
     */
    public resetMetric(name: string): void {
        const metricName = `${this.namespace}.${name}`;
        this.metrics.delete(metricName);
        this.logger.debug(`Reset metric: ${metricName}`);
    }

    /**
     * Réinitialise toutes les métriques
     */
    public resetAllMetrics(): void {
        this.metrics.clear();
        this.logger.debug('Reset all metrics');
    }

    /**
     * Arrête les tâches périodiques
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

        this.logger.debug('MetricsCollector shutdown');
    }

    /**
     * Démarre les tâches périodiques
     */
    private startTasks(): void {
        // Tâche d'agrégation
        this.aggregationTimer = setInterval(() => {
            this.aggregateMetrics();
        }, this.config.aggregationInterval);

        // Tâche de nettoyage
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, Math.min(this.config.retentionPeriod / 10, 3600000)); // Au plus toutes les heures

        this.logger.debug('Started metrics tasks', {
            aggregationInterval: this.config.aggregationInterval
        });
    }

    /**
     * Vérifie les seuils pour les métriques de type compteur
     * @param name Nom de la métrique
     * @param value Valeur actuelle
     */
    private checkThresholds(name: string, value: number): void {
        const thresholds = [10, 100, 1000, 10000];

        for (const threshold of thresholds) {
            // Si la valeur vient de dépasser un seuil
            if (value >= threshold && value < threshold * 1.1) {
                this.logger.info(`Metric ${name} has reached threshold ${threshold}`, { value });
            }
        }
    }

    /**
     * Filtre les valeurs de métrique par tags
     * @param values Valeurs à filtrer
     * @param tags Tags pour filtrer
     * @returns Valeurs filtrées
     */
    private filterByTags(values: StoredMetricValue[], tags: MetricTags): StoredMetricValue[] {
        return values.filter(value => {
            for (const [key, tagValue] of Object.entries(tags)) {
                if (value.tags[key] !== tagValue) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Agrège les métriques
     */
    private aggregateMetrics(): void {
        for (const [name, values] of this.metrics.entries()) {
            if (values.length < 2) {
                continue; // Pas assez de valeurs pour agréger
            }

            const lastValue = values[values.length - 1];

            switch (lastValue.type) {
                case 'gauge':
                    this.aggregateGauge(name, values);
                    break;
                case 'counter':
                    this.aggregateCounter(name, values);
                    break;
                case 'histogram':
                    this.aggregateHistogram(name, values);
                    break;
                case 'summary':
                    this.aggregateSummary(name, values);
                    break;
            }
        }
    }

    /**
     * Récupère les valeurs récentes pour l'agrégation
     * @param values Toutes les valeurs
     * @returns Valeurs récentes
     */
    private getRecentValues(values: StoredMetricValue[]): StoredMetricValue[] {
        const cutoffTime = Date.now() - this.config.aggregationInterval;
        return values.filter(v => v.timestamp >= cutoffTime);
    }

    /**
     * Agrège une métrique de type jauge
     * @param name Nom de la métrique
     * @param values Valeurs à agréger
     */
    private aggregateGauge(name: string, values: StoredMetricValue[]): void {
        const recentValues = this.getRecentValues(values);
        if (recentValues.length === 0) return;

        const sum = recentValues.reduce((acc, v) => acc + v.value, 0);
        const avg = sum / recentValues.length;

        this.recordMetric(
            `${name.substring(this.namespace.length + 1)}.avg`,
            avg,
            'gauge',
            { aggregation: 'avg' }
        );
    }

    /**
     * Agrège une métrique de type compteur
     * @param name Nom de la métrique
     * @param values Valeurs à agréger
     */
    private aggregateCounter(name: string, values: StoredMetricValue[]): void {
        const recentValues = this.getRecentValues(values);
        if (recentValues.length < 2) return;

        const first = recentValues[0];
        const last = recentValues[recentValues.length - 1];

        const deltaValue = last.value - first.value;
        const deltaTime = (last.timestamp - first.timestamp) / 1000; // en secondes

        if (deltaTime <= 0) return;

        const rate = deltaValue / deltaTime;

        this.recordMetric(
            `${name.substring(this.namespace.length + 1)}.rate`,
            rate,
            'gauge',
            { aggregation: 'rate' }
        );
    }

    /**
     * Agrège une métrique de type histogramme
     * @param name Nom de la métrique
     * @param values Valeurs à agréger
     */
    private aggregateHistogram(name: string, values: StoredMetricValue[]): void {
        const recentValues = this.getRecentValues(values);
        if (recentValues.length === 0) return;

        // Trier les valeurs
        const sortedValues = [...recentValues].sort((a, b) => a.value - b.value);

        // Calculer les percentiles
        const p50 = this.calculatePercentile(sortedValues, 50);
        const p90 = this.calculatePercentile(sortedValues, 90);
        const p95 = this.calculatePercentile(sortedValues, 95);
        const p99 = this.calculatePercentile(sortedValues, 99);

        // Enregistrer les percentiles comme métriques dérivées
        const baseMetricName = name.substring(this.namespace.length + 1);
        this.recordMetric(`${baseMetricName}.p50`, p50, 'gauge', { aggregation: 'p50' });
        this.recordMetric(`${baseMetricName}.p90`, p90, 'gauge', { aggregation: 'p90' });
        this.recordMetric(`${baseMetricName}.p95`, p95, 'gauge', { aggregation: 'p95' });
        this.recordMetric(`${baseMetricName}.p99`, p99, 'gauge', { aggregation: 'p99' });
    }

    /**
     * Agrège une métrique de type résumé
     * @param name Nom de la métrique
     * @param values Valeurs à agréger
     */
    private aggregateSummary(name: string, values: StoredMetricValue[]): void {
        const recentValues = this.getRecentValues(values);
        if (recentValues.length === 0) return;

        const numericValues = recentValues.map(v => v.value);
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;

        // Enregistrer les statistiques comme métriques dérivées
        const baseMetricName = name.substring(this.namespace.length + 1);
        this.recordMetric(`${baseMetricName}.min`, min, 'gauge', { aggregation: 'min' });
        this.recordMetric(`${baseMetricName}.max`, max, 'gauge', { aggregation: 'max' });
        this.recordMetric(`${baseMetricName}.avg`, avg, 'gauge', { aggregation: 'avg' });
    }

    /**
     * Calcule un percentile spécifique
     * @param sortedValues Valeurs triées
     * @param percentile Percentile à calculer (0-100)
     * @returns Valeur du percentile
     */
    private calculatePercentile(sortedValues: StoredMetricValue[], percentile: number): number {
        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))].value;
    }
}