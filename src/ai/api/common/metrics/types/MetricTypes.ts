/**
 * ssrc/ai/api/common/metrics/types/MetricTypes.ts
 * @file MetricTypes.ts
 * @description
 * Types et interfaces pour les métriques système
 * Utilisés pour la collecte, l'analyse et la détection d'anomalies
 * dans les systèmes distribués
 * Centralisation des types pour la collecte de métriques
 * dans les systèmes distribués
 */
export interface SystemMetrics {
    timestamp: number;
    name: string;
    value: number;
    unit: string;
    tags: Record<string, string>;
    source: string;
    type: 'gauge' | 'counter' | 'histogram' | 'summary';
}

export interface MetricData {
    min: number;
    max: number;
    avg: number;
    sum: number;
    count: number;
    p50?: number;
    p90?: number;
    p95?: number;
    p99?: number;
    lastUpdate: number;
}

export interface TimeFrame {
    start: number;
    end: number;
    interval?: number;
}

export interface MetricThresholds {
    warning: number;
    critical: number;
    recovery?: number;
}

export interface MetricBucket {
    timestamp: number;
    value: number;
    count: number;
}

export interface MetricAggregation {
    timeFrame: TimeFrame;
    data: MetricData;
    buckets?: MetricBucket[];
}

export interface MetricQuery {
    metricName: string;
    timeFrame: TimeFrame;
    aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    filters?: Record<string, string | string[]>;
    groupBy?: string[];
}

export interface MetricValidation {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
}

export interface MetricTransformation {
    type: 'scale' | 'offset' | 'rate' | 'delta';
    value: number;
}