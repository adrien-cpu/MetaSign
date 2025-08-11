/**
 * ConsensusErrorTypes.ts
 * 
 * Error types for the consensus system.
 */

/**
 * Custom error class for consensus-related errors
 */
export class ConsensusError extends Error {
    /**
     * Error code for categorization
     */
    public readonly code: string;

    /**
     * Additional details about the error
     */
    public readonly details: Record<string, unknown> | undefined;

    /**
     * Creates a new consensus error
     * @param message Error message
     * @param code Error code
     * @param details Additional error details
     */
    constructor(message: string, code = 'CONSENSUS_ERROR', details?: Record<string, unknown>) {
        super(message);
        this.name = 'ConsensusError';
        this.code = code;
        this.details = details;

        // For better stack traces in Node.js
        Error.captureStackTrace(this, ConsensusError);
    }
}

/**
 * Consensus error types as constants
 */
export enum ConsensusErrorTypes {
    // General errors
    GENERAL_ERROR = 'CONSENSUS_ERROR_001: General consensus error',
    TIMEOUT_ERROR = 'CONSENSUS_ERROR_002: Consensus timeout',

    // Configuration errors
    INVALID_CONFIG = 'CONSENSUS_ERROR_101: Invalid configuration',
    INCOMPATIBLE_PARAMS = 'CONSENSUS_ERROR_102: Incompatible parameters',

    // Node errors
    NODE_FAILURE = 'CONSENSUS_ERROR_201: Node failure',
    INSUFFICIENT_NODES = 'CONSENSUS_ERROR_202: Insufficient nodes for consensus',
    MALICIOUS_NODE = 'CONSENSUS_ERROR_203: Potentially malicious node detected',

    // Voting errors
    VOTING_ERROR = 'CONSENSUS_ERROR_301: Error in voting process',
    NO_MAJORITY = 'CONSENSUS_ERROR_302: No majority achieved',
    SPLIT_VOTE = 'CONSENSUS_ERROR_303: Split vote detected',

    // Aggregation errors
    AGGREGATION_ERROR = 'CONSENSUS_ERROR_401: Error aggregating results',
    DIVERGENT_MODELS = 'CONSENSUS_ERROR_402: Models too divergent to aggregate',
    WEIGHT_ERROR = 'CONSENSUS_ERROR_403: Error calculating weights',

    // Conflict errors
    CONFLICT_DETECTION_ERROR = 'CONSENSUS_ERROR_501: Error detecting conflicts',
    UNRESOLVABLE_CONFLICT = 'CONSENSUS_ERROR_502: Unresolvable conflict',

    // Data errors
    DATA_CORRUPTION = 'CONSENSUS_ERROR_601: Data corruption detected',
    INVALID_MODEL = 'CONSENSUS_ERROR_602: Invalid model parameters',

    // System errors
    COMMUNICATION_ERROR = 'CONSENSUS_ERROR_701: Communication failure',
    RESOURCE_EXHAUSTION = 'CONSENSUS_ERROR_702: Resource exhaustion'
}