/**
 * IRoundManager.ts
 * 
 * Interface for consensus round management.
 */

import { ConsensusRoundParameters } from '../types/ConsensusTypes';
import { Conflict } from '../types/conflict.types';

/**
 * Interface for managing consensus rounds
 */
export interface IRoundManager {
    /**
     * Gets the current round parameters
     * @returns Current parameters for consensus rounds
     */
    getCurrentParameters(): Readonly<ConsensusRoundParameters>;

    /**
     * Sets new round parameters
     * @param parameters Parameters to update
     */
    setParameters(parameters: Partial<ConsensusRoundParameters>): void;

    /**
     * Starts a new consensus round
     * @param round Round number
     */
    startRound(round: number): void;

    /**
     * Ends a consensus round and records metrics
     * @param round Round number
     * @param successful Whether the round reached consensus
     */
    endRound(round: number, successful: boolean): void;

    /**
     * Adjusts round parameters based on conflicts
     * @param conflicts Conflicts detected in the round
     * @param round Current round number
     */
    adjustParameters(conflicts: Conflict[], round: number): Promise<void>;

    /**
     * Gets metrics for a specific round
     * @param round Round number
     * @returns Metrics for the specified round, or undefined if not found
     */
    getRoundMetrics(round: number): Readonly<unknown> | undefined;

    /**
     * Gets metrics for all rounds
     * @returns Map of round numbers to their metrics
     */
    getAllRoundMetrics(): ReadonlyMap<number, Readonly<unknown>>;

    /**
     * Gets average duration of consensus rounds
     * @returns Average duration in milliseconds, or undefined if no rounds completed
     */
    getAverageRoundDuration(): number | undefined;

    /**
     * Gets success rate of consensus rounds
     * @returns Percentage of successful rounds, or undefined if no rounds completed
     */
    getSuccessRate(): number | undefined;

    /**
     * Resets the round manager, clearing all metrics
     */
    reset(): void;
}