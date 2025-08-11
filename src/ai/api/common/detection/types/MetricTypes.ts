/**
 * src/ai/api/common/detection/types/MetricTypes.ts
 * @file MetricTypes.ts
 * @description
 * Types et interfaces pour les métriques système
 * Utilisés pour la détection d'anomalies et la corrélation
 */
export interface CPUMetrics {
    usage: number;
    load: number;
    temperature?: number;
    processCount: number;
    threadCount: number;
}

export interface MemoryMetrics {
    used: number;
    free: number;
    total: number;
    swapUsed?: number;
    swapFree?: number;
}

export interface NetworkMetrics {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
    latency: number;
}

export interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    errorRate: number;
    queueLength: number;
}
