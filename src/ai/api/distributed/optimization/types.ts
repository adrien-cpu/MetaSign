// src/ai/api/distributed/optimization/types.ts

/**
 * Types d'optimisation
 */
export enum OptimizationType {
    PERFORMANCE = 'performance',
    MEMORY = 'memory',
    CPU = 'cpu',
    NETWORK = 'network',
    STORAGE = 'storage',
    THROUGHPUT = 'throughput',
    LATENCY = 'latency',
    RESOURCE_USAGE = 'resource_usage',
    CUSTOM = 'custom'
}

/**
 * Entrée pour l'optimisation
 */
export interface OptimizationInput {
    data: unknown;
    context?: Record<string, unknown>;
    constraints?: OptimizationConstraints;
    metaData?: Record<string, unknown>;
}

/**
 * Résultat d'une optimisation
 */
export interface OptimizationResult {
    optimizedData: unknown;
    metrics: OptimizationMetrics;
}

/**
 * Contraintes d'optimisation
 */
export interface OptimizationConstraints {
    maxLatencyMs?: number;
    minThroughput?: number;
    maxMemoryUsage?: number;
    maxCpuUsage?: number;
    maxNetworkBandwidth?: number;
    maxStorageUsage?: number;
    preserveAccuracy?: boolean;
    targetPlatform?: string;
    customConstraints?: Record<string, unknown>;
}

/**
 * Métriques d'optimisation
 */
export interface OptimizationMetrics {
    optimizationType: OptimizationType;
    improvementPercentage?: number;
    latencyReductionMs?: number;
    throughputImprovement?: number;
    memoryReduction?: number;
    cpuUsageReduction?: number;
    storageReduction?: number;
    networkBandwidthReduction?: number;
    accuracyImpact?: number;
    optimizationTimeMs?: number;
    customMetrics?: Record<string, number>;
}

/**
 * Évaluation d'impact
 */
export interface ImpactAssessment {
    performance?: number;
    memory?: number;
    cpu?: number;
    network?: number;
    storage?: number;
    accuracy?: number;
    overallImpact: number;
}

/**
 * Stratégie d'optimisation
 */
export interface OptimizationStrategy {
    type: OptimizationType;
    impact: number;
    steps: OptimizationStep[];
}

/**
 * Étape d'optimisation
 */
export interface OptimizationStep {
    type: string;
    priority: number;
    constraints: OptimizationConstraints;
    estimatedImpact: ImpactAssessment;
}

/**
 * Plan d'optimisation
 */
export interface OptimizationPlan {
    steps: OptimizationStep[];
    priority: number;
    estimatedImpact: ImpactAssessment;
}

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
    latencyMs: number;
    throughput: number;
    cpuUsage: number;
    memoryUsage: number;
    networkUsage?: number;
    storageUsage?: number;
    errorRate?: number;
    customMetrics?: Record<string, number>;
}