// src/ai/api/distributed/types/DistributedTypes.ts

/**
 * Types for distributed intelligence processing and model aggregation
 */

/**
 * Types of distributed tasks
 */
export enum TaskType {
    TRAINING = 'training',
    INFERENCE = 'inference',
    OPTIMIZATION = 'optimization',
    VALIDATION = 'validation',
    AGGREGATION = 'aggregation',
    ANALYSIS = 'analysis'
}

/**
 * Optimization strategies for distributed learning
 */
export enum OptimizationStrategy {
    FEDERATED_AVERAGING = 'federated_averaging',
    FEDERATED_SGD = 'federated_sgd',
    KNOWLEDGE_DISTILLATION = 'knowledge_distillation',
    WEIGHTED_AVERAGING = 'weighted_averaging'
}

//==============================
// Task & Distribution Interfaces
//==============================


/**
 * Requirements for task execution
 */
export interface TaskRequirements {
    minCpuCores: number;
    minMemoryMB: number;
    minGpuMemoryMB?: number;
    expectedTimeSeconds: number;
    priorityLevel: number;
}

/**
 * Constraints for task execution
 */
export interface TaskConstraints {
    deadline?: number; // Timestamp
    maxExecutionTimeSeconds?: number;
    requiredCapabilities?: string[];
    allowedRegions?: string[];
    securityLevel?: number;
}

/**
 * Subtask definition for distributed processing
 */
export interface SubTask {
    id: string;
    parentTaskId: string;
    data: unknown;
    order?: number;
    dependencies?: string[]; // IDs of dependent subtasks
}

/**
 * Requirements for node selection
 */
export interface NodeRequirements {
    minReliabilityScore: number;
    minPerformanceScore: number;
    capabilities: string[];
    preferredRegions?: string[];
    minVersion?: string;
}

//==============================
// Model & Parameter Interfaces
//==============================

/**
 * Model parameters structure
 */
export interface ModelParameters {
    weights: Record<string, number[]>;
    biases: Record<string, number[]>;
    /** 
     * Hyperparameters - using non-optional type to comply with exactOptionalPropertyTypes
     */
    hyperparameters: Record<string, unknown>;
    shape: Record<string, unknown>;
    version: string;
}

/**
 * Training result from a distributed node
 */
export interface NodeTrainingResult {
    nodeId: string;
    modelVersion: string;
    parameters: ModelParameters;
    accuracy: number;
    loss: number;
    samplesProcessed: number;
    /** 
     * Duration of training in milliseconds 
     */
    trainingDuration: number;
    /** 
     * Total size of the dataset 
     */
    datasetSize: number;
    /** 
     * Timestamp of when training completed 
     */
    timestamp: number;
    /** 
     * Additional metrics from training 
     */
    metrics: {
        [key: string]: number;
    };
    /** 
     * Optional metadata about the environment 
     */
    metadata?: {
        hardwareInfo?: {
            cpuCores: number;
            memory: number;
            gpuModel?: string;
        };
        environmentInfo?: {
            version: string;
            platform: string;
        };
    };
}

/**
 * Aggregated model result
 */
export interface AggregatedModel {
    parameters: ModelParameters;
    metadata: AggregatedModelMetadata;
    consensus: ConsensusResult;
}

/**
 * Metadata for aggregated model
 */
export interface AggregatedModelMetadata {
    timestamp: number;
    version: string;
    contributors: string[];
    aggregationMethod: string;
    performanceEstimate: {
        accuracy: number;
        loss: number;
        convergence: number;
    };
    datasetInfo: {
        totalSamples: number;
        avgSamplesPerNode: number;
        distributionMetrics: Record<string, number>;
    };
}

/**
 * Consensus result
 */
export interface ConsensusResult {
    achieved: boolean;
    confidence: number;
    votingResults?: Record<string, boolean>;
    decisionReason?: string;
    participantCount: number;
    consensusMethod: string;
    outliers?: string[];
}

//==============================
// Result & Metrics Interfaces
//==============================

/**
 * Processing result from a node
 */
export interface ProcessingResult {
    nodeId: string;
    result: unknown;
    metrics: ProcessingMetrics;
    integrity: IntegrityProof;
}

/**
 * Metrics from task processing
 */
export interface ProcessingMetrics {
    executionTimeMs: number;
    cpuUsagePercent: number;
    memoryUsageMB: number;
    gpuUsagePercent?: number;
    networkUsageKB?: number;
    operationsPerSecond?: number;
}

/**
 * Integrity verification for results
 */
export interface IntegrityProof {
    checksum: string;
    signature?: string;
    timestamp: number;
    verificationMethod: 'hash' | 'signature' | 'merkle';
}

/**
 * Metadata for distributed results
 */
export interface ResultMetadata {
    processingTimeMs: number;
    nodesContributed: number;
    aggregationMethod: string;
    timestamp: number;
    version: string;
}

/**
 * Fused final result
 */
export interface DistributedResult {
    fused: unknown;
    confidence: number;
    metadata: ResultMetadata;
}

//==============================
// Performance & Reliability
//==============================

/**
 * Performance metrics for a node
 */
export interface PerformanceMetrics {
    score: number;
    accuracy: number;
    latency: number;
    throughput: number;
    convergenceSpeed: number;
    resourceEfficiency: number;
    scalability?: number;
}

/**
 * Reliability assessment for a node
 */
export interface ReliabilityScore {
    score: number;
    uptime: number;
    consistency: number;
    errorRate: number;
    failureHistory: number;
    recoveryTime: number;
    trustScore: number;
}

/**
 * Data quality metrics for training data
 */
export interface DataQualityMetrics {
    score: number;
    completeness: number;
    accuracy: number;
    consistency: number;
    uniqueness: number;
    distribution: number;
    diversity: number;
    balance: number;
    biasScore: number;
}

/**
 * Node health status information
 */
export interface NodeHealthStatus {
    nodeId: string;
    isAlive: boolean;
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    lastChecked: number;
    consecutiveFailures: number;
}

/**
 * Communication options for distributed nodes
 */
export interface CommunicationOptions {
    protocol: 'grpc' | 'http' | 'websocket';
    compression: boolean;
    encryptionEnabled: boolean;
    batchSize: number;
    timeout: number;
}

/**
 * Distribution configuration
 */
export interface DistributionConfig {
    minNodes: number;
    maxNodes: number;
    strategy: OptimizationStrategy;
    aggregationFrequency: number;
    communication: CommunicationOptions;
    securityLevel: 'basic' | 'advanced' | 'enterprise';
}

/**
 * 
 * Types for the distributed intelligence system.
 */

/**
 * Enums for task priority
 */
export enum TaskPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

/**
 * Enums for task complexity
 */
export enum TaskComplexity {
    SIMPLE = 'SIMPLE',
    MODERATE = 'MODERATE',
    COMPLEX = 'COMPLEX',
    VERY_COMPLEX = 'VERY_COMPLEX',
    EXTREME = 'EXTREME'
}

/**
 * Represents a distributed task to be processed
 */
export interface DistributedTask {
    /**
     * Unique identifier for the task
     */
    id: string;

    /**
     * Task name or description
     */
    name: string;

    /**
     * Task execution mode
     */
    executionMode?: 'sequential' | 'parallel';

    /**
     * Task complexity
     */
    complexity?: TaskComplexity;

    /**
     * Task priority
     */
    priority?: TaskPriority;

    /**
     * Whether the task is parallelizable
     */
    parallelizable?: boolean;

    /**
     * Task dependencies
     */
    dependencies?: string[];

    /**
     * Estimated task size (arbitrary units)
     */
    size?: number;

    /**
     * Risk level (0-1)
     */
    riskLevel?: number;

    /**
     * Whether the task requires ethical validation
     */
    requiresEthicalValidation?: boolean;

    /**
     * Whether the task impacts user experience
     */
    impactsUserExperience?: boolean;

    /**
     * Task type or category
     */
    type?: string;

    /**
     * Task-specific data
     */
    data?: Record<string, unknown>;
}

/**
 * Represents the distribution of tasks across nodes
 */
export interface TaskDistribution {
    /**
     * Distribution ID
     */
    id: string;

    /**
     * Original task
     */
    task: DistributedTask;

    /**
     * List of nodes involved in distribution
     */
    nodes?: {
        id: string;
        capabilities?: string[];
        [key: string]: unknown;
    }[];

    /**
     * Task assignments to nodes
     */
    assignments?: {
        taskId: string;
        nodeId: string;
        estimatedLoad: number;
        [key: string]: unknown;
    }[];

    /**
     * Data location mapping
     */
    dataLocations?: {
        dataId: string;
        nodeId: string;
        [key: string]: unknown;
    }[];

    /**
     * Task dependencies
     */
    taskDependencies?: {
        sourceTaskId: string;
        targetTaskId: string;
        [key: string]: unknown;
    }[];

    /**
     * Distribution metadata
     */
    metadata?: Record<string, unknown>;
}