// src/ai/api/rpm/types/MetricTypes.ts
export interface RPMMetric {
    id: string;
    value: number;
    timestamp: number;
    type: RPMMetricType;
    context: MetricContext;
}

export type RPMMetricType = 'PERFORMANCE' | 'RESOURCE' | 'MEMORY' | 'CPU' | 'NETWORK';

export interface MetricContext {
    operation: string;
    resource: string;
    priority: number;
    tags: Map<string, string>;
}