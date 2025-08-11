/**
 * ConsensusTypes.ts
 * 
 * Types for the distributed consensus system.
 */

/**
 * Represents a training result from a single node
 */
export interface NodeTrainingResult {
    /**
     * Unique identifier for the node
     */
    nodeId: string;

    /**
     * Task or training ID
     */
    taskId: string;

    /**
     * Training iteration or epoch
     */
    iteration: number;

    /**
     * Model weights or parameters
     */
    modelParameters: {
        /**
         * Version of the model
         */
        version: string;

        /**
         * Parameters or weights of the model
         */
        weights: Record<string, number[] | Float32Array>;

        /**
         * Hash of the weights for integrity checking
         */
        hash?: string;
    };

    /**
     * Metrics from the training
     */
    metrics: {
        /**
         * Loss value from training
         */
        loss: number;

        /**
         * Accuracy or other performance metric
         */
        accuracy?: number;

        /**
         * Convergence metric
         */
        convergence?: number;

        /**
         * Additional metrics
         */
        [key: string]: number | undefined;
    };

    /**
     * Timestamp of the result
     */
    timestamp: number;

    /**
     * Training configuration
     */
    config?: {
        /**
         * Learning rate used
         */
        learningRate?: number;

        /**
         * Batch size used
         */
        batchSize?: number;

        /**
         * Optimizer used
         */
        optimizer?: string;

        /**
         * Additional configuration parameters
         */
        [key: string]: unknown;
    };

    /**
     * Node system information
     */
    systemInfo?: {
        /**
         * Hardware details
         */
        hardware?: string;

        /**
         * Software/framework details
         */
        software?: string;

        /**
         * Data size processed
         */
        dataSize?: number;
    };
}

/**
 * Types of weight functions that can be used for consensus calculation
 */
export type WeightFunctionType =
    | 'weighted-majority'
    | 'uniform'
    | 'performance-based'
    | 'trust-based'
    | 'adaptive'
    | 'reliability-based'
    | 'freshness-based'
    | 'unweighted';

/**
 * Parameters for configuring consensus rounds
 */
export interface ConsensusRoundParameters {
    /**
     * Weight function to apply
     */
    weightFunction: WeightFunctionType;

    /**
     * Threshold for agreement to be considered consensus (0.0-1.0)
     */
    agreementThreshold: number;

    /**
     * Timeout for each iteration in milliseconds
     */
    iterationTimeout: number;

    /**
     * Whether to exclude statistical outliers from consensus
     */
    excludeOutliers: boolean;

    /**
     * Additional parameters
     */
    [key: string]: unknown;
}

/**
 * Generic model parameters type for consensus results
 */
export interface ModelParameters {
    /**
     * Version of the agreed model
     */
    version: string;

    /**
     * Agreed-upon parameters or weights
     */
    weights: Record<string, number[] | Float32Array>;

    /**
     * Hash of the weights for integrity checking
     */
    hash?: string;
}

/**
 * Represents a consensus agreement result
 */
export interface ConsensusResult<T = unknown> {
    /**
     * Whether consensus was reached
     */
    consensusReached: boolean;

    /**
     * Final consensus value, if reached
     */
    value?: T;

    /**
     * The agreed-upon model parameters
     */
    modelParameters: ModelParameters;

    /**
     * Aggregation method used to reach consensus
     */
    aggregationMethod: 'average' | 'median' | 'weighted' | 'federated' | string;

    /**
     * Confidence in the consensus (0-1)
     */
    confidence: number;

    /**
     * Agreement level achieved (0.0-1.0)
     */
    agreementLevel: number;

    /**
     * Number of rounds taken to reach consensus
     */
    rounds: number;

    /**
     * Duration of the consensus process in milliseconds
     */
    duration: number;

    /**
     * Number of nodes that participated
     */
    participants: number;

    /**
     * Number of nodes that agreed with the final value
     */
    agreementCount: number;

    /**
     * Performance metrics for the consensus model
     */
    metrics: {
        /**
         * Estimated performance improvement
         */
        improvement?: number;

        /**
         * Other metrics
         */
        [key: string]: number | undefined;
    };

    /**
     * Timestamp of consensus
     */
    timestamp: number;

    /**
     * Parameters used for the final round
     */
    parameters: ConsensusRoundParameters;
}

/**
 * Status of a consensus round
 */
export enum ConsensusStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    TIMED_OUT = 'timed_out'
}

/**
 * Information about a consensus process
 */
export interface ConsensusInfo {
    /**
     * Whether consensus was achieved
     */
    achieved: boolean;

    /**
     * Round in which consensus was achieved
     */
    round: number;

    /**
     * The consensus agreement
     */
    agreement: ConsensusResult<unknown>;

    /**
     * Number of participants
     */
    participants: number;

    /**
     * Percentage of nodes that agreed
     */
    agreementPercentage?: number;

    /**
     * Time taken to reach consensus
     */
    duration?: number;

    /**
     * Additional metadata
     */
    metadata?: Record<string, unknown>;
}

/**
 * Vote from a node in the consensus process
 */
export interface ConsensusVote {
    /**
     * ID of the voting node
     */
    nodeId: string;

    /**
     * Which model version the node votes for
     */
    preferredVersion: string;

    /**
     * Weight of this node's vote (0-1)
     */
    weight: number;

    /**
     * Reasons for the vote
     */
    reasons?: string[];

    /**
     * Alternative versions the node would accept
     */
    alternativeVersions?: string[];

    /**
     * Metrics used to make the voting decision
     */
    decisionMetrics?: Record<string, number>;
}

/**
 * Types of conflicts that can occur during consensus
 */
export enum ConflictType {
    /**
     * Disagreement on model parameters
     */
    PARAMETER_DISAGREEMENT = 'parameter_disagreement',

    /**
     * Divergence in training direction
     */
    TRAINING_DIVERGENCE = 'training_divergence',

    /**
     * Stale or outdated models
     */
    STALENESS = 'staleness',

    /**
     * Adversarial or malicious updates
     */
    ADVERSARIAL = 'adversarial',

    /**
     * Underperforming model updates
     */
    UNDERPERFORMANCE = 'underperformance',

    /**
     * Conflicting optimization objectives
     */
    OBJECTIVE_CONFLICT = 'objective_conflict',

    /**
     * Inconsistent state across nodes
     */
    INCONSISTENT_STATE = 'inconsistent_state',

    /**
     * Data corruption detected
     */
    DATA_CORRUPTION = 'data_corruption',

    /**
     * Validation failures
     */
    VALIDATION_FAILURE = 'validation_failure',

    /**
     * Network timeout issues
     */
    TIMEOUT = 'timeout',

    /**
     * Network partition detected
     */
    NETWORK_PARTITION = 'network_partition',

    /**
     * Node failure detected
     */
    NODE_FAILURE = 'node_failure',

    /**
     * Divergence in the consensus process
     */
    DIVERGENCE = 'divergence',

    /**
     * Oscillation in consensus values
     */
    OSCILLATION = 'oscillation',

    /**
     * Failure to converge
     */
    NON_CONVERGENCE = 'non_convergence',

    /**
     * Unknown conflict type
     */
    UNKNOWN = 'unknown'
}

/**
 * Options for the consensus process
 */
export interface ConsensusOptions {
    /**
     * Initial parameters for the process
     */
    initialParameters?: Partial<ConsensusRoundParameters>;

    /**
     * Maximum number of rounds before giving up
     */
    maxRounds?: number;

    /**
     * Overall timeout for the process in milliseconds
     */
    timeout?: number;

    /**
     * Whether to allow dynamic parameter adjustment
     */
    allowParameterAdjustment?: boolean;

    /**
     * Minimum number of participants required
     */
    minParticipants?: number;
}

/**
 * Types of events emitted during consensus
 */
export enum ConsensusEventType {
    ROUND_STARTED = 'round_started',
    ROUND_COMPLETED = 'round_completed',
    PARAMETERS_ADJUSTED = 'parameters_adjusted',
    CONFLICT_DETECTED = 'conflict_detected',
    CONSENSUS_REACHED = 'consensus_reached',
    CONSENSUS_FAILED = 'consensus_failed'
}