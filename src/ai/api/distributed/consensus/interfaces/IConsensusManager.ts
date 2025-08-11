/**
 * IConsensusManager.ts
 * 
 * Interface for consensus management in distributed intelligence.
 */

import {
    NodeTrainingResult,
    ConsensusInfo,
    ConsensusRoundParameters
} from '../types/ConsensusTypes';

/**
 * Interface for systems that manage consensus among distributed nodes
 */
export interface IConsensusManager {
    /**
     * Attempts to achieve consensus among nodes
     * @param results Training results from participating nodes
     * @returns Information about the consensus process and result
     */
    achieveConsensus(results: NodeTrainingResult[]): Promise<ConsensusInfo>;

    /**
     * Gets the current round parameters
     * @returns The current consensus round parameters
     */
    getCurrentRoundParameters(): ConsensusRoundParameters;

    /**
     * Updates the consensus round parameters
     * @param parameters New parameters to set
     */
    updateRoundParameters(parameters: Partial<ConsensusRoundParameters>): void;

    /**
     * Gets the maximum number of rounds allowed
     * @returns Maximum number of rounds
     */
    getMaxRounds(): number;

    /**
     * Sets the maximum number of rounds allowed
     * @param maxRounds New maximum rounds value
     */
    setMaxRounds(maxRounds: number): void;

    /**
     * Estimates the quality of a potential consensus
     * @param results Training results to evaluate
     * @returns Estimated quality score (0-1)
     */
    estimateConsensusQuality(results: NodeTrainingResult[]): Promise<number>;
}