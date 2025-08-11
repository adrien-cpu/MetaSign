// src/ai/coordinators/services/metrics/MetricsStorage.ts
import { IMetricsStorage, StoredMetricValue, RetrieveOptions, MetricTags } from '@ai/coordinators/types';
import { Logger } from '@ai/utils/Logger';

export class MemoryMetricsStorage implements IMetricsStorage {
    private readonly logger = Logger.getInstance('MemoryMetricsStorage');
    private readonly metrics: Map<string, Map<string, StoredMetricValue[]>> = new Map();
    private readonly maxHistorySize: number;

    constructor(maxHistorySize: number = 1000) {
        this.maxHistorySize = maxHistorySize;
    }

    public store(namespace: string, name: string, value: StoredMetricValue): void {
        const key = this.getNamespaceKey(namespace);

        if (!this.metrics.has(key)) {
            this.metrics.set(key, new Map());
        }

        const namespaceMetrics = this.metrics.get(key)!;

        if (!namespaceMetrics.has(name)) {
            namespaceMetrics.set(name, []);
        }

        const values = namespaceMetrics.get(name)!;
        values.push(value);

        // Limiter la taille de l'historique
        if (values.length > this.maxHistorySize) {
            values.shift();
        }
    }

    public retrieve(namespace: string, name: string, options?: RetrieveOptions): StoredMetricValue[] {
        const key = this.getNamespaceKey(namespace);
        const namespaceMetrics = this.metrics.get(key);

        if (!namespaceMetrics || !namespaceMetrics.has(name)) {
            return [];
        }

        let values = namespaceMetrics.get(name)!;

        // Appliquer les filtres
        if (options?.since) {
            values = values.filter(v => v.timestamp >= options.since);
        }

        if (options?.tags) {
            values = this.filterByTags(values, options.tags);
        }

        // Appliquer la limite
        if (options?.limit && options.limit < values.length) {
            values = values.slice(-options.limit);
        }

        return [...values]; // Retourner une copie pour éviter les modifications accidentelles
    }

    public getLatest(namespace: string, name: string, tags?: MetricTags): StoredMetricValue | undefined {
        const values = this.retrieve(namespace, name, { tags });
        return values.length > 0 ? values[values.length - 1] : undefined;
    }

    public cleanup(olderThan: number): void {
        let totalCleaned = 0;

        for (const [namespaceKey, namespaceMetrics] of this.metrics.entries()) {
            for (const [name, values] of namespaceMetrics.entries()) {
                const originalLength = values.length;
                const newValues = values.filter(v => v.timestamp >= olderThan);
                totalCleaned += originalLength - newValues.length;

                namespaceMetrics.set(name, newValues);
            }
        }

        if (totalCleaned > 0) {
            this.logger.debug(`Cleaned up ${totalCleaned} old metric values`);
        }
    }

    public clear(namespace?: string, name?: string): void {
        if (namespace && name) {
            const key = this.getNamespaceKey(namespace);
            const namespaceMetrics = this.metrics.get(key);

            if (namespaceMetrics) {
                namespaceMetrics.delete(name);
            }
        } else if (namespace) {
            const key = this.getNamespaceKey(namespace);
            this.metrics.delete(key);
        } else {
            this.metrics.clear();
        }
    }

    private getNamespaceKey(namespace: string): string {
        return namespace;
    }

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
}