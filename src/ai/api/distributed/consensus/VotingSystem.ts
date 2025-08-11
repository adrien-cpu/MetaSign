/**
 * VotingSystem.ts
 * 
 * Implementation of the consensus voting system.
 */

import { IVotingSystem } from './interfaces/IVotingSystem';
import {
    ConsensusVote,
    ConsensusResult,
    NodeTrainingResult,
    WeightFunctionType
} from './types/ConsensusTypes';
import { LogService } from '../../common/monitoring/LogService';

/**
 * Type d'algorithmes de vote supportés
 */
export type VotingAlgorithm = 'uniform' | 'performance-based' | 'weighted-majority' | 'trust-based' | string;

/**
 * System for collecting and processing votes during consensus
 */
export class VotingSystem implements IVotingSystem {
    private agreementThreshold: number;
    private votingAlgorithm: VotingAlgorithm;
    private readonly logger: LogService;
    private readonly validAlgorithms: VotingAlgorithm[] = ['uniform', 'performance-based', 'weighted-majority', 'trust-based'];

    /**
     * Creates a new voting system
     * @param agreementThreshold Threshold required for agreement (0-1)
     * @param votingAlgorithm Algorithm to use for voting
     * @param logger Logger service
     */
    constructor(
        agreementThreshold = 0.67,
        votingAlgorithm: VotingAlgorithm = 'weighted-majority',
        logger = new LogService('VotingSystem')
    ) {
        this.validateThreshold(agreementThreshold);
        this.agreementThreshold = agreementThreshold;
        this.votingAlgorithm = votingAlgorithm;
        this.logger = logger;
    }

    /**
     * Processes votes to determine if consensus is reached
     * @param votes Collection of votes from nodes
     * @returns Consensus result if achieved, or null if no consensus
     */
    public async processVotes(votes: ConsensusVote[]): Promise<ConsensusResult | null> {
        if (!votes || votes.length === 0) {
            this.logger.warn('No votes provided for processing');
            return null;
        }

        this.logger.info('Processing votes', { count: votes.length, algorithm: this.votingAlgorithm });

        // Group votes by preferred version
        const votesByVersion = new Map<string, ConsensusVote[]>();
        const weightsByVersion = new Map<string, number>();

        // Calculate total weight for each version
        for (const vote of votes) {
            const version = vote.preferredVersion;

            if (!votesByVersion.has(version)) {
                votesByVersion.set(version, []);
                weightsByVersion.set(version, 0);
            }

            votesByVersion.get(version)?.push(vote);
            weightsByVersion.set(version, (weightsByVersion.get(version) || 0) + vote.weight);
        }

        // Find the version with the highest total weight
        let highestWeight = 0;
        let winningVersion = '';
        let totalWeight = 0;

        for (const [version, weight] of weightsByVersion.entries()) {
            totalWeight += weight;

            if (weight > highestWeight) {
                highestWeight = weight;
                winningVersion = version;
            }
        }

        // Check if winning version meets the threshold
        const winningRatio = highestWeight / totalWeight;

        if (winningRatio >= this.agreementThreshold) {
            // Get winning votes to extract model parameters
            const winningVotes = votesByVersion.get(winningVersion) || [];

            if (winningVotes.length === 0) {
                this.logger.warn('No votes for winning version', { winningVersion });
                return null;
            }

            const startTime = Date.now() - 1000; // Exemple: supposer que le processus a commencé il y a 1 seconde

            // Convert voting algorithm to WeightFunctionType
            const weightFunction: WeightFunctionType = this.mapAlgorithmToWeightFunction(this.votingAlgorithm);

            // Create consensus result
            const result: ConsensusResult = {
                consensusReached: true,
                value: winningVotes[0].preferredVersion,
                modelParameters: this.aggregateModelParameters(winningVotes),
                aggregationMethod: this.votingAlgorithm,
                confidence: winningRatio,
                agreementLevel: winningRatio,
                rounds: 1, // Supposons que c'est le premier round
                duration: Date.now() - startTime,
                participants: votes.length,
                agreementCount: votesByVersion.get(winningVersion)?.length || 0,
                metrics: {
                    votingParticipation: votes.length,
                    winningMajority: winningRatio,
                    improvement: 0 // Valeur par défaut
                },
                timestamp: Date.now(),
                parameters: {
                    weightFunction: weightFunction,
                    agreementThreshold: this.agreementThreshold,
                    iterationTimeout: 30000, // Valeur par défaut
                    excludeOutliers: false // Valeur par défaut
                }
            };

            this.logger.info('Consensus achieved', {
                winningVersion,
                confidence: winningRatio,
                threshold: this.agreementThreshold
            });

            return result;
        }

        this.logger.info('No consensus reached', {
            highestAgreement: winningRatio,
            threshold: this.agreementThreshold,
            leadingVersion: winningVersion
        });

        return null;
    }

    /**
     * Maps a voting algorithm string to a WeightFunctionType
     * @param algorithm The voting algorithm string
     * @returns The corresponding WeightFunctionType
     */
    private mapAlgorithmToWeightFunction(algorithm: VotingAlgorithm): WeightFunctionType {
        switch (algorithm) {
            case 'uniform':
                return 'unweighted';
            case 'performance-based':
                return 'performance-based';
            case 'trust-based':
                return 'trust-based';
            case 'weighted-majority':
                return 'weighted-majority';
            default:
                // Si l'algorithme n'est pas reconnu, utilisez une valeur par défaut
                this.logger.warn('Unmapped algorithm type, using weighted-majority', { algorithm });
                return 'weighted-majority';
        }
    }

    /**
     * Aggregates model parameters from winning votes
     * @param votes Votes for the winning version
     * @returns Aggregated model parameters
     */
    private aggregateModelParameters(votes: ConsensusVote[]): ConsensusResult['modelParameters'] {
        // This is a simplified implementation
        // In a real system, this would combine parameters from multiple models

        // Assuming votes contain nodeId references that could be used to look up the actual models
        // For now, we'll return a placeholder with the correct types

        const weights: Record<string, number[]> = {
            // Add a placeholder weight array to avoid empty object issues
            'placeholder': [0.0]
        };

        return {
            version: votes[0].preferredVersion,
            weights: weights,
            // Don't include hash property at all instead of setting it to undefined
        };
    }

    /**
     * Calculates voting weights for nodes based on their performance
     * @param nodes Node results to evaluate
     * @returns Map of node IDs to their calculated weights
     */
    public calculateWeights(nodes: NodeTrainingResult[]): Map<string, number> {
        const weights = new Map<string, number>();

        if (nodes.length === 0) {
            return weights;
        }

        // Calculate weights based on metrics
        switch (this.votingAlgorithm) {
            case 'uniform':
                this.calculateUniformWeights(nodes, weights);
                break;

            case 'performance-based':
                this.calculatePerformanceBasedWeights(nodes, weights);
                break;

            case 'trust-based':
                this.calculateTrustBasedWeights(nodes, weights);
                break;

            case 'weighted-majority':
            default:
                this.calculateWeightedMajorityWeights(nodes, weights);
                break;
        }

        return weights;
    }

    /**
     * Calculates uniform weights for all nodes
     * @param nodes Node results to evaluate
     * @param weights Map to store the calculated weights
     */
    private calculateUniformWeights(nodes: NodeTrainingResult[], weights: Map<string, number>): void {
        const uniformWeight = 1.0 / nodes.length;
        nodes.forEach(node => weights.set(node.nodeId, uniformWeight));
    }

    /**
     * Calculates performance-based weights
     * @param nodes Node results to evaluate
     * @param weights Map to store the calculated weights
     */
    private calculatePerformanceBasedWeights(nodes: NodeTrainingResult[], weights: Map<string, number>): void {
        // Weight based on inverse loss (better performance = higher weight)
        const totalInverseLoss = nodes.reduce((sum, node) => {
            // Avoid division by zero
            const inverseLoss = node.metrics.loss > 0 ? 1.0 / node.metrics.loss : 100;
            return sum + inverseLoss;
        }, 0);

        nodes.forEach(node => {
            const inverseLoss = node.metrics.loss > 0 ? 1.0 / node.metrics.loss : 100;
            weights.set(node.nodeId, inverseLoss / totalInverseLoss);
        });
    }

    /**
     * Calculates trust-based weights (placeholder implementation)
     * @param nodes Node results to evaluate
     * @param weights Map to store the calculated weights
     */
    private calculateTrustBasedWeights(nodes: NodeTrainingResult[], weights: Map<string, number>): void {
        // In a real system, this would incorporate trust scores, reputation, etc.
        // For now, we'll use a placeholder that gives slightly higher weight to nodes with more iterations

        const totalIterations = nodes.reduce((sum, node) => sum + node.iteration, 0);

        if (totalIterations === 0) {
            // Fallback to uniform weights
            this.calculateUniformWeights(nodes, weights);
            return;
        }

        nodes.forEach(node => {
            const trustWeight = node.iteration / totalIterations;
            weights.set(node.nodeId, trustWeight);
        });
    }

    /**
     * Calculates weighted-majority weights
     * @param nodes Node results to evaluate
     * @param weights Map to store the calculated weights
     */
    private calculateWeightedMajorityWeights(nodes: NodeTrainingResult[], weights: Map<string, number>): void {
        // Combine performance with data size if available
        const totalScore = nodes.reduce((sum, node) => {
            const performanceScore = 1.0 / Math.max(0.001, node.metrics.loss);
            const dataScore = node.systemInfo?.dataSize || 1;
            return sum + (performanceScore * Math.log(Math.max(1, dataScore)));
        }, 0);

        nodes.forEach(node => {
            const performanceScore = 1.0 / Math.max(0.001, node.metrics.loss);
            const dataScore = node.systemInfo?.dataSize || 1;
            const score = performanceScore * Math.log(Math.max(1, dataScore));
            weights.set(node.nodeId, score / totalScore);
        });
    }

    /**
     * Determines if the votes have reached the agreement threshold
     * @param votes Collection of votes to check
     * @returns Whether agreement threshold is reached
     */
    public hasReachedAgreement(votes: ConsensusVote[]): boolean {
        if (votes.length === 0) {
            return false;
        }

        // Group by preferred version and sum weights
        const votesByVersion = new Map<string, number>();
        let totalWeight = 0;

        for (const vote of votes) {
            const version = vote.preferredVersion;
            const currentWeight = votesByVersion.get(version) || 0;
            votesByVersion.set(version, currentWeight + vote.weight);
            totalWeight += vote.weight;
        }

        // Find highest weight
        let highestWeight = 0;

        for (const weight of votesByVersion.values()) {
            if (weight > highestWeight) {
                highestWeight = weight;
            }
        }

        // Check if any version meets the threshold
        return highestWeight / totalWeight >= this.agreementThreshold;
    }

    /**
     * Gets the configured agreement threshold
     * @returns Current agreement threshold (0-1)
     */
    public getAgreementThreshold(): number {
        return this.agreementThreshold;
    }

    /**
     * Sets a new agreement threshold
     * @param threshold New threshold value (0-1)
     */
    public setAgreementThreshold(threshold: number): void {
        this.validateThreshold(threshold);
        this.agreementThreshold = threshold;
    }

    /**
     * Validates an agreement threshold
     * @param threshold Threshold to validate
     * @throws Error if the threshold is invalid
     */
    private validateThreshold(threshold: number): void {
        if (threshold < 0 || threshold > 1) {
            throw new Error(`Invalid agreement threshold: ${threshold}. Must be between 0 and 1.`);
        }
    }

    /**
     * Gets the voting algorithm currently in use
     * @returns Name of the voting algorithm
     */
    public getVotingAlgorithm(): VotingAlgorithm {
        return this.votingAlgorithm;
    }

    /**
     * Changes the voting algorithm
     * @param algorithm Name of the algorithm to use
     */
    public setVotingAlgorithm(algorithm: VotingAlgorithm): void {
        if (!this.validAlgorithms.includes(algorithm) && !algorithm.startsWith('custom-')) {
            this.logger.warn('Using unrecognized voting algorithm', { algorithm });
        }

        this.votingAlgorithm = algorithm;
    }
}