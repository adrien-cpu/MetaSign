// src/ai/systems/expressions/rpm/metrics/interfaces/IMetricsCollector.ts
import { SystemMetrics, MetricData, TimeFrame, MetricQuery, MetricValidation, MetricTransformation } from '../types/MetricTypes';

export interface IMetricsCollector {
    incrementCounter(name: string): void;
    recordTiming(name: string, value: number): void;
    getCounter(name: string): number;
    getAverageTiming(name: string): number;
    collect(metric: SystemMetrics): Promise<boolean>;
    getMetrics(timeFrame: TimeFrame): Promise<SystemMetrics[]>;
    aggregateMetric(metricName: string, timeFrame: TimeFrame): Promise<MetricData>;
    queryMetrics(query: MetricQuery): Promise<SystemMetrics[]>;
    validateMetric(metric: SystemMetrics): MetricValidation;
    transformMetric(metric: SystemMetrics, transformation: MetricTransformation): SystemMetrics;
    cleanup(olderThan: number): Promise<number>;
    getCollectionStats(): Promise<{
        totalMetrics: number;
        oldestMetric: number;
        newestMetric: number;
        storageSize: number;
    }>;
}