// src/ai/api/resilience/types/OptimizationTypes.ts

import { SystemMetrics } from './ResilienceTypes';

export interface Bottleneck {
    resource: string;
    severity: number;
    impact: {
        service: string;
        performance: number;
        users: number;
    };
}

export interface OptimizationStrategy {
    name: string;
    priority: number;
    apply(metrics: SystemMetrics): Promise<boolean>;
    validate(metrics: SystemMetrics): Promise<boolean>;
    rollback(): Promise<void>;
}

export interface PerformanceMonitor {
    getCurrentMetrics(): Promise<SystemMetrics>;
    getHistoricalMetrics(timeRange: number): Promise<SystemMetrics[]>;
    analyzePerformance(metrics: SystemMetrics): Promise<{
        bottlenecks: Bottleneck[];
        recommendations: string[];
    }>;
}