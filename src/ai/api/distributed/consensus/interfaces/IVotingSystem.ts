/**
 * IVotingSystem.ts
 * 
 * Interface for the consensus voting system.
 */

import {
    ConsensusVote,
    ConsensusResult,
    NodeTrainingResult
} from '../types/ConsensusTypes';

/**
 * Interface for systems that handle voting during consensus
 */
export interface IVotingSystem {
    /**
     * Processes votes to determine if consensus is reached
     * @param votes Collection of votes from nodes
     * @returns Consensus result if achieved, or null if no consensus
     */
    processVotes(votes: ConsensusVote[]): Promise<ConsensusResult | null>;

    /**
     * Calculates voting weights for nodes based on their performance
     * @param nodes Node results to evaluate
     * @returns Map of node IDs to their calculated weights
     */
    calculateWeights(nodes: NodeTrainingResult[]): Map<string, number>;

    /**
     * Determines if the votes have reached the agreement threshold
     * @param votes Collection of votes to check
     * @returns Whether agreement threshold is reached
     */
    hasReachedAgreement(votes: ConsensusVote[]): boolean;

    /**
     * Gets the configured agreement threshold
     * @returns Current agreement threshold (0-1)
     */
    getAgreementThreshold(): number;

    /**
     * Sets a new agreement threshold
     * @param threshold New threshold value (0-1)
     */
    setAgreementThreshold(threshold: number): void;

    /**
     * Gets the voting algorithm currently in use
     * @returns Name of the voting algorithm
     */
    getVotingAlgorithm(): string;

    /**
     * Changes the voting algorithm
     * @param algorithm Name of the algorithm to use
     */
    setVotingAlgorithm(algorithm: string): void;
}