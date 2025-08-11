/**
 * ConsensusManager.ts
 * 
 * Manages the consensus process for distributed intelligence.
 */

import { IConsensusManager } from './interfaces/IConsensusManager';
import {
    NodeTrainingResult,
    ConsensusInfo,
    ConsensusVote,
    ConsensusRoundParameters,
    ConsensusResult
} from './types/ConsensusTypes';
import { ConsensusError, ConsensusErrorTypes } from './types/ConsensusErrorTypes';
import { VotingSystem } from './VotingSystem';
import { ConflictResolver } from './ConflictResolver';
import { RoundManager } from './RoundManager';
import { LogService } from '../../common/monitoring/LogService';
import { Conflict } from './types/conflict.types';

/**
 * Manages the consensus process between distributed nodes for achieving
 * agreement on model parameters, weights, and other training results
 */
export class ConsensusManager implements IConsensusManager {
    private readonly roundManager: RoundManager;
    private readonly votingSystem: VotingSystem;
    private readonly conflictResolver: ConflictResolver;
    private readonly logger: LogService;
    private maxRounds: number;

    /**
     * Creates a new consensus manager
     * @param maxRounds Maximum number of rounds to attempt
     * @param votingSystem Optional custom voting system
     * @param conflictResolver Optional custom conflict resolver
     * @param roundManager Optional custom round manager
     * @param logger Logger service
     */
    constructor(
        maxRounds = 5,
        votingSystem?: VotingSystem,
        conflictResolver?: ConflictResolver,
        roundManager?: RoundManager,
        logger = new LogService('ConsensusManager')
    ) {
        this.maxRounds = maxRounds;
        this.logger = logger;

        // Initialize subsystems with defaults if not provided
        this.votingSystem = votingSystem || new VotingSystem();
        this.conflictResolver = conflictResolver || new ConflictResolver();
        this.roundManager = roundManager || new RoundManager();
    }

    /**
     * Attempts to achieve consensus among nodes
     * @param results Training results from participating nodes
     * @returns Information about the consensus process and result
     * @throws ConsensusError if consensus cannot be achieved
     */
    public async achieveConsensus(results: NodeTrainingResult[]): Promise<ConsensusInfo> {
        if (results.length === 0) {
            throw new ConsensusError('No training results provided', ConsensusErrorTypes.INSUFFICIENT_NODES);
        }

        this.logger.info('Starting consensus process', { nodesCount: results.length });

        let round = 0;
        let consensus: ConsensusResult | null = null;
        const startTime = Date.now();

        // Try to achieve consensus within the maximum number of rounds
        while (!consensus && round < this.maxRounds) {
            // Start a new round
            this.roundManager.startRound(round);

            try {
                // Collect votes from all nodes
                const votes = await this.collectVotes(results, round);

                // Process votes to try to reach consensus
                consensus = await this.votingSystem.processVotes(votes);

                if (!consensus) {
                    // Handle consensus failure for this round
                    await this.handleConsensusFailure(results, round);
                    round++;
                }
            } catch (error) {
                this.logger.error('Error during consensus round', {
                    round,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });

                if (error instanceof ConsensusError) {
                    throw error; // Re-throw specific consensus errors
                }

                throw new ConsensusError(
                    `Error during consensus round ${round}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    ConsensusErrorTypes.GENERAL_ERROR
                );
            } finally {
                // End the round
                this.roundManager.endRound(round, consensus !== null);
            }
        }

        // Check if we achieved consensus
        if (!consensus) {
            throw new ConsensusError(
                `Failed to achieve consensus after ${round} rounds`,
                ConsensusErrorTypes.NO_MAJORITY
            );
        }

        // Create consensus info
        const consensusInfo: ConsensusInfo = {
            achieved: true,
            round,
            agreement: consensus,
            participants: results.length,
            agreementPercentage: this.calculateAgreementPercentage(consensus),
            duration: Date.now() - startTime,
            metadata: {
                rounds: round + 1,
                finalThreshold: this.votingSystem.getAgreementThreshold(),
                finalAlgorithm: this.votingSystem.getVotingAlgorithm()
            }
        };

        this.logger.info('Consensus achieved', {
            round,
            agreementPercentage: consensusInfo.agreementPercentage,
            duration: consensusInfo.duration
        });

        return consensusInfo;
    }

    /**
     * Calculates the percentage of nodes that agreed with the consensus
     * @param consensus The consensus result
     * @returns Agreement percentage (0-100)
     */
    private calculateAgreementPercentage(consensus: ConsensusResult): number {
        // This is a simplified implementation
        // In a real system, would compare model parameters more precisely
        return consensus.confidence * 100;
    }

    /**
     * Collects votes from all nodes based on their training results
     * @param results Training results to process
     * @param round Current round number
     * @returns Collection of votes from nodes
     */
    private async collectVotes(results: NodeTrainingResult[], round: number): Promise<ConsensusVote[]> {
        this.logger.debug('Collecting votes', { round, nodeCount: results.length });

        // Calculate weights for each node
        const weights = this.votingSystem.calculateWeights(results);

        // Convert training results to votes
        const votes: ConsensusVote[] = results.map(result => {
            return {
                nodeId: result.nodeId,
                preferredVersion: result.modelParameters.version,
                weight: weights.get(result.nodeId) || (1.0 / results.length), // Fallback to uniform weighting
                decisionMetrics: {
                    loss: result.metrics.loss,
                    accuracy: result.metrics.accuracy || 0,
                    iteration: result.iteration
                }
            };
        });

        this.logger.debug('Votes collected', { voteCount: votes.length });

        return votes;
    }

    /**
     * Handles the case when consensus fails in a round
     * @param results Training results
     * @param round Current round number
     */
    private async handleConsensusFailure(results: NodeTrainingResult[], round: number): Promise<void> {
        this.logger.info('Handling consensus failure', { round });

        // Identify conflicts between nodes
        const conflicts: Conflict[] = await this.conflictResolver.identifyConflicts(results);

        if (conflicts.length > 0) {
            const conflictTypes = conflicts.map(c => c.type);
            this.logger.info('Conflicts identified', {
                conflictCount: conflicts.length,
                types: JSON.stringify(conflictTypes)
            });

            // Adjust round parameters based on conflicts
            await this.roundManager.adjustParameters(conflicts, round);

            // Update voting threshold based on round parameters
            const newParams = this.roundManager.getCurrentParameters();
            this.votingSystem.setAgreementThreshold(newParams.agreementThreshold);

            if (newParams.weightFunction) {
                this.votingSystem.setVotingAlgorithm(newParams.weightFunction);
            }
        } else {
            this.logger.info('No specific conflicts identified, adjusting parameters for next round', { round });

            // Gradually lower the threshold if no specific conflicts but still failing
            if (round > 1) {
                const currentThreshold = this.votingSystem.getAgreementThreshold();
                const newThreshold = Math.max(0.51, currentThreshold - 0.03);
                this.votingSystem.setAgreementThreshold(newThreshold);

                this.logger.info('Lowering agreement threshold', {
                    previousThreshold: currentThreshold,
                    newThreshold
                });
            }
        }
    }

    /**
     * Gets the current round parameters
     * @returns The current consensus round parameters
     */
    public getCurrentRoundParameters(): ConsensusRoundParameters {
        return this.roundManager.getCurrentParameters();
    }

    /**
     * Updates the consensus round parameters
     * @param parameters New parameters to set
     */
    public updateRoundParameters(parameters: Partial<ConsensusRoundParameters>): void {
        this.roundManager.setParameters(parameters);

        // Sync voting system with round parameters
        if (parameters.agreementThreshold !== undefined) {
            this.votingSystem.setAgreementThreshold(parameters.agreementThreshold);
        }

        if (parameters.weightFunction) {
            this.votingSystem.setVotingAlgorithm(parameters.weightFunction);
        }
    }

    /**
     * Gets the maximum number of rounds allowed
     * @returns Maximum number of rounds
     */
    public getMaxRounds(): number {
        return this.maxRounds;
    }

    /**
     * Sets the maximum number of rounds allowed
     * @param maxRounds New maximum rounds value
     * @throws Error if maxRounds is less than 1
     */
    public setMaxRounds(maxRounds: number): void {
        if (maxRounds < 1) {
            throw new Error('Maximum rounds must be at least 1');
        }

        this.maxRounds = maxRounds;
    }

    /**
     * Estimates the quality of a potential consensus
     * @param results Training results to evaluate
     * @returns Estimated quality score (0-1)
     */
    public async estimateConsensusQuality(results: NodeTrainingResult[]): Promise<number> {
        if (results.length < 2) {
            return 1.0; // Perfect consensus with single node
        }

        // Collect factors affecting quality

        // 1. Model consistency
        const versions = new Set(results.map(r => r.modelParameters.version));
        const versionConsistency = 1 - ((versions.size - 1) / results.length);

        // 2. Performance consistency
        const losses = results.map(r => r.metrics.loss);
        const meanLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;
        const variances = losses.map(loss => Math.pow(loss - meanLoss, 2));
        const variance = variances.reduce((sum, var_) => sum + var_, 0) / variances.length;
        const performanceConsistency = 1 / (1 + variance);

        // 3. Check for conflicts
        const conflicts = await this.conflictResolver.identifyConflicts(results);
        const conflictFactor = 1 - this.conflictResolver.evaluateConflictSeverity(conflicts);

        // 4. Node diversity
        let diversityFactor = 1.0;
        if (results.length > 3) {
            // Check for diversity in node system info if available
            const systems = new Set(results.map(r => r.systemInfo?.hardware).filter(Boolean));
            diversityFactor = Math.min(1.0, systems.size / (results.length * 0.7));
        }

        // Weighted average of factors
        const quality = (
            versionConsistency * 0.3 +
            performanceConsistency * 0.3 +
            conflictFactor * 0.3 +
            diversityFactor * 0.1
        );

        return Math.min(1.0, Math.max(0.0, quality));
    }
}