// src/ai/api/rpm/types/BatchTypes.ts
export class MetricsBatch {
    metrics: RPMMetric[] = [];
    timestamp: number = Date.now();

    add(metric: RPMMetric): void {
        this.metrics.push(metric);
    }

    get size(): number {
        return this.metrics.length;
    }
}

export interface BatchConfig {
    windowSize: number;
    maxSize: number;
    processingDelay: number;
}