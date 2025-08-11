/**
 * Type of recovery strategy to apply
 */
export type RecoveryType =
    | 'RETRY_SIMPLE'
    | 'RETRY_WITH_FALLBACK'
    | 'RESET_CONNECTION'
    | 'CLEAN_RESOURCES'
    | 'REINITIALIZE'
    | 'ESCALATE';

/**
 * @interface RecoveryStep
 * @brief Represents a single step in a recovery process
 */
export interface RecoveryStep {
    /**
     * Unique identifier for the step
     */
    id: string;

    /**
     * Human-readable name of the step
     */
    name: string;

    /**
     * Whether this step is critical (failure stops recovery)
     */
    critical: boolean;

    /**
     * Execute the recovery step
     */
    execute: () => Promise<void>;

    /**
     * Result data from execution
     */
    result?: unknown;

    /**
     * Whether the step was successfully executed
     */
    successful?: boolean;
}

/**
 * @interface RecoveryStrategy
 * @brief Defines a complete strategy for recovering from errors
 */
export interface RecoveryStrategy {
    /**
     * Type of recovery strategy
     */
    type: RecoveryType;

    /**
     * Ordered array of recovery steps to execute
     */
    steps: RecoveryStep[];

    /**
     * Maximum number of times to attempt the entire recovery
     */
    maxAttempts: number;

    /**
     * Timeout in milliseconds for the entire recovery
     */
    timeout: number;

    /**
     * Optional description of the strategy
     */
    description?: string;
}