/**
 * IConflictResolver.ts
 * 
 * Interface for the conflict resolution system used in consensus.
 */

import { NodeTrainingResult } from '../types/ConsensusTypes';
import { Conflict } from '../types/conflict.types';

/**
 * Interface for systems that resolve conflicts in distributed consensus
 */
export interface IConflictResolver {
    /**
     * Identifies conflicts among node results
     * @param results Training results to analyze
     * @returns List of detected conflicts
     */
    identifyConflicts(results: NodeTrainingResult[]): Promise<Conflict[]>;

    /**
     * Resolves identified conflicts
     * @param conflicts Conflicts to resolve
     * @param results Original training results
     * @returns Adjusted training results after conflict resolution
     */
    resolveConflicts(conflicts: Conflict[], results: NodeTrainingResult[]): Promise<NodeTrainingResult[]>;

    /**
     * Evaluates the severity of conflicts
     * @param conflicts Conflicts to evaluate
     * @returns Overall conflict severity (0-1)
     */
    evaluateConflictSeverity(conflicts: Conflict[]): number;

    /**
     * Identifies potentially malicious or faulty nodes
     * @param results Training results to analyze
     * @returns Map of suspicious node IDs with confidence scores
     */
    identifySuspiciousNodes(results: NodeTrainingResult[]): Map<string, number>;

    /**
     * Sets the detection threshold for conflicts
     * @param threshold New threshold value (0-1)
     */
    setDetectionThreshold(threshold: number): void;

    /**
     * Gets the current detection threshold
     * @returns Current detection threshold
     */
    getDetectionThreshold(): number;
}