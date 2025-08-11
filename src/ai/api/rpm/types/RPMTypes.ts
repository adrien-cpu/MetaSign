// types/RPMTypes.ts
export interface RPMMetric {
    id: string;
    value: number;
    timestamp: number;
    type: RPMMetricType;
    context: MetricContext;
}

export interface RPMAnalysis {
    metrics: RPMMetrics;
    anomalies: Anomaly[];
    trends: TrendAnalysis;
    recommendations: RPMRecommendation[];
}

export interface MetricContext {
    operation: string;
    resource: string;
    priority: number;
    tags: Map<string, string>;
}

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