// src/ai/api/distributed/optimization/types/optimization.types.ts
export type ResourceType = 'cpu' | 'memory' | 'network' | 'storage' | 'gpu';

export type OptimizationPriority = 1 | 2 | 3 | 4 | 5; // 1: lowest, 5: highest

export enum BottleneckType {
    CPU = 'cpu',
    MEMORY = 'memory',
    NETWORK = 'network',
    STORAGE = 'storage',
    GPU = 'gpu',
    GENERAL = 'general'
}

export enum OptimizationActionType {
    SCALE_UP = 'scale_up',
    SCALE_DOWN = 'scale_down',
    REDISTRIBUTE = 'redistribute',
    MIGRATE = 'migrate',
    CACHE = 'cache',
    COMPRESS = 'compress'
}

export enum OptimizationStrategyType {
    RESOURCE_BALANCING = 'resource_balancing',
    LATENCY_OPTIMIZATION = 'latency_optimization',
    THROUGHPUT_OPTIMIZATION = 'throughput_optimization',
    PARAMETER_PRUNING = 'parameter_pruning',
    MODEL_COMPRESSION = 'model_compression',
    KNOWLEDGE_DISTILLATION = 'knowledge_distillation'
}

export interface ResourceMetrics {
    utilization: number; // percentage (0-100)
    available: number; // absolute value
    total: number; // absolute value
    averageLoad: number; // average load over time
    peakLoad: number; // peak load
    bottlenecks: Bottleneck[];
}

export interface ResourceData {
    resources: Record<ResourceType, ResourceMetrics>;
    timestamp: number;
    systemId: string;
    currentLoad: number; // overall system load
    requestRate: number; // requests per second
    contextData?: Record<string, unknown>; // additional context
}

export interface ResourceAllocation {
    allocations: Record<ResourceType, number>; // absolute values
    distribution: Record<string, number>; // percentage distribution by component
    estimatedCapacity: number; // estimated capacity after allocation
    reservedCapacity: number; // reserved for spikes
    timestamp: number;
}

export interface BottleneckMetrics {
    currentValue: number;
    threshold: number;
    duration: number; // milliseconds
    frequency: number; // occurrences per minute
}

export interface ImpactAssessment {
    systemPerformance: number; // impact on performance (0-100)
    userExperience: number; // impact on UX (0-100)
    reliability: number; // impact on reliability (0-100)
    cost: number; // financial impact
}

export interface Bottleneck {
    type: BottleneckType;
    severity: number; // 0-100
    metrics: BottleneckMetrics;
    impact: ImpactAssessment;
    recommendations?: string[];
}

export interface OptimizationAction {
    type: OptimizationActionType;
    target: ResourceType | string;
    amount: number; // absolute value or percentage
    priority: OptimizationPriority;
    estimatedImpact: ImpactAssessment;
    constraints?: Record<string, unknown>;
}

export interface OptimizationMetrics {
    improvementPercentage: number;
    resourceEfficiency: number;
    estimatedLatencyReduction: number; // milliseconds
    estimatedCostSavings: number;
    consistencyScore: number; // 0-100
    balanceScore: number; // 0-100
    sustainability: number; // 0-100
}

export interface OptimizationResult {
    optimizations: OptimizationAction[];
    metrics: OptimizationMetrics;
    suggestedAllocation?: ResourceAllocation;
    warnings?: string[];
    timestamp: number;
}

export interface LatencyOptimization {
    type: string;
    impact: number;
    actions: OptimizationAction[];
    estimatedImprovement: number;
}