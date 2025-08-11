/**
 * ConflictResolver.ts
 * 
 * Implementation of the conflict resolution system for consensus.
 */

import { IConflictResolver } from './interfaces/IConflictResolver';
import { Conflict } from './types/conflict.types';
import {
    NodeTrainingResult,
    ConflictType
} from './types/ConsensusTypes';
import { LogService } from '../../common/monitoring/LogService';

/**
 * Interface for adjustment recommendation
 */
interface AdjustmentRecommendation {
    type: string;
    conflictType: ConflictType;
    recommendation: string;
}

/**
 * Interface for resolution proposal
 */
interface ResolutionProposal {
    conflicts: number;
    excludeNodes: string[];
    adjustmentRecommendations: AdjustmentRecommendation[];
    timeGenerated: number;
}

/**
 * Resolves conflicts that arise during the consensus process
 */
export class ConflictResolver implements IConflictResolver {
    private readonly logger: LogService;
    // Removed readonly to allow modification in setDetectionThreshold
    private detectionThreshold: number;

    /**
     * Creates a new conflict resolver
     * @param detectionThreshold Threshold for detecting conflicts (0-1)
     * @param logger Logger service
     */
    constructor(
        detectionThreshold = 0.3,
        logger = new LogService('ConflictResolver')
    ) {
        this.detectionThreshold = detectionThreshold;
        this.logger = logger;
    }

    /**
     * Identifies conflicts among node results
     * @param results Training results to analyze
     * @returns List of detected conflicts
     */
    public async identifyConflicts(results: NodeTrainingResult[]): Promise<Conflict[]> {
        if (results.length < 2) {
            return []; // No conflicts possible with fewer than 2 nodes
        }

        this.logger.info('Identifying conflicts', { nodeCount: results.length });

        const conflicts: Conflict[] = [];

        // Check for parameter disagreements
        conflicts.push(...this.detectParameterDisagreements(results));

        // Check for training divergence
        conflicts.push(...this.detectTrainingDivergence(results));

        // Check for staleness
        conflicts.push(...this.detectStaleness(results));

        // Check for adversarial updates
        conflicts.push(...this.detectAdversarialUpdates(results));

        this.logger.info('Conflict identification complete', {
            conflictCount: conflicts.length,
            conflictTypes: JSON.stringify(conflicts.map(c => c.type))
        });

        return conflicts;
    }

    /**
     * Detects parameter disagreements between nodes
     * @param results Training results to analyze
     * @returns List of detected parameter disagreement conflicts
     */
    private detectParameterDisagreements(results: NodeTrainingResult[]): Conflict[] {
        const conflicts: Conflict[] = [];

        // Group by model version
        const versionGroups = new Map<string, NodeTrainingResult[]>();

        for (const result of results) {
            const version = result.modelParameters.version;

            if (!versionGroups.has(version)) {
                versionGroups.set(version, []);
            }

            versionGroups.get(version)?.push(result);
        }

        // If we have more than one version group, we have a disagreement
        if (versionGroups.size > 1) {
            // Get the nodes in each group
            const involvedNodes: string[] = [];
            const versions: string[] = [];

            for (const [version, nodes] of versionGroups.entries()) {
                if (nodes.length > 0) {
                    versions.push(version);
                    involvedNodes.push(...nodes.map(n => n.nodeId));
                }
            }

            // Calculate severity based on how evenly distributed the disagreement is
            // More even distribution = higher severity
            const maxGroupSize = Math.max(...Array.from(versionGroups.values()).map(g => g.length));
            const evenness = maxGroupSize / results.length;
            const severity = 1 - evenness; // More even = higher severity

            conflicts.push({
                type: ConflictType.PARAMETER_DISAGREEMENT,
                involvedNodes,
                severity,
                description: `Parameter disagreement across ${versions.length} different model versions`,
                conflictingParameters: ['model-version'],
                suggestedResolution: 'Evaluate performance of each version group and select the best performing'
            });
        }

        return conflicts;
    }

    /**
     * Detects training divergence among nodes
     * @param results Training results to analyze
     * @returns List of detected training divergence conflicts
     */
    private detectTrainingDivergence(results: NodeTrainingResult[]): Conflict[] {
        const conflicts: Conflict[] = [];

        // Analyze loss metrics
        const losses = results.map(r => r.metrics.loss);
        const meanLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;
        const stdDevLoss = Math.sqrt(
            losses.reduce((sum, loss) => sum + Math.pow(loss - meanLoss, 2), 0) / losses.length
        );

        // Detect outliers (nodes with loss > mean + 2*stdDev)
        const outlierThreshold = meanLoss + (2 * stdDevLoss);
        const outliersHigh = results.filter(r => r.metrics.loss > outlierThreshold);

        if (outliersHigh.length > 0) {
            const severity = Math.min(0.9, outliersHigh.length / results.length);

            conflicts.push({
                type: ConflictType.TRAINING_DIVERGENCE,
                involvedNodes: outliersHigh.map(r => r.nodeId),
                severity,
                description: `${outliersHigh.length} nodes show significantly higher loss values than average`,
                suggestedResolution: 'Review training data and hyperparameters for divergent nodes'
            });
        }

        return conflicts;
    }

    /**
     * Detects stale models among nodes
     * @param results Training results to analyze
     * @returns List of detected staleness conflicts
     */
    private detectStaleness(results: NodeTrainingResult[]): Conflict[] {
        const conflicts: Conflict[] = [];

        // Find latest timestamp
        const latestTimestamp = Math.max(...results.map(r => r.timestamp));

        // Calculate threshold for staleness (e.g., more than 1 hour old)
        const stalenessThreshold = 60 * 60 * 1000; // 1 hour in milliseconds

        // Find stale nodes
        const staleNodes = results.filter(r => latestTimestamp - r.timestamp > stalenessThreshold);

        if (staleNodes.length > 0) {
            const severity = Math.min(0.8, staleNodes.length / results.length);

            conflicts.push({
                type: ConflictType.STALENESS,
                involvedNodes: staleNodes.map(r => r.nodeId),
                severity,
                description: `${staleNodes.length} nodes have stale models (>1 hour old)`,
                suggestedResolution: 'Update stale nodes with fresh training data'
            });
        }

        return conflicts;
    }

    /**
     * Detects potentially adversarial updates
     * @param results Training results to analyze
     * @returns List of detected adversarial conflicts
     */
    private detectAdversarialUpdates(results: NodeTrainingResult[]): Conflict[] {
        const conflicts: Conflict[] = [];

        // This is a simplified implementation
        // A real system would have more sophisticated adversarial detection

        // For now, we'll check for unusually good metrics that might indicate poisoning
        const accuracies = results
            .filter(r => typeof r.metrics.accuracy === 'number')
            .map(r => r.metrics.accuracy as number);

        if (accuracies.length === 0) {
            return conflicts;
        }

        const meanAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
        const stdDevAccuracy = Math.sqrt(
            accuracies.reduce((sum, acc) => sum + Math.pow(acc - meanAccuracy, 2), 0) / accuracies.length
        );

        // Suspiciously high accuracy (more than 3 stdDev above mean)
        const suspiciousThreshold = meanAccuracy + (3 * stdDevAccuracy);
        const suspiciousNodes = results
            .filter(r => typeof r.metrics.accuracy === 'number' && r.metrics.accuracy as number > suspiciousThreshold);

        if (suspiciousNodes.length > 0) {
            conflicts.push({
                type: ConflictType.ADVERSARIAL,
                involvedNodes: suspiciousNodes.map(r => r.nodeId),
                severity: 0.9, // High severity for potential adversarial attacks
                description: `${suspiciousNodes.length} nodes show suspiciously high accuracy values`,
                suggestedResolution: 'Validate models on trusted test data and consider excluding suspicious nodes'
            });
        }

        return conflicts;
    }

    /**
     * Resolves identified conflicts
     * @param conflicts Conflicts to resolve
     * @param results Original training results
     * @returns Adjusted training results after conflict resolution
     */
    public async resolveConflicts(conflicts: Conflict[], results: NodeTrainingResult[]): Promise<NodeTrainingResult[]> {
        if (conflicts.length === 0) {
            return results;
        }

        this.logger.info('Resolving conflicts', { conflictCount: conflicts.length });

        // Create a copy of results to avoid modifying the original
        let resolvedResults = [...results];

        // Apply resolution strategies based on conflict type
        for (const conflict of conflicts) {
            switch (conflict.type) {
                case ConflictType.PARAMETER_DISAGREEMENT:
                    resolvedResults = this.resolveParameterDisagreement(conflict, resolvedResults);
                    break;

                case ConflictType.TRAINING_DIVERGENCE:
                    resolvedResults = this.resolveTrainingDivergence(conflict, resolvedResults);
                    break;

                case ConflictType.STALENESS:
                    resolvedResults = this.resolveStaleness(conflict, resolvedResults);
                    break;

                case ConflictType.ADVERSARIAL:
                    resolvedResults = this.resolveAdversarial(conflict, resolvedResults);
                    break;

                // Handle other conflict types as needed
                default:
                    this.logger.warn('Unhandled conflict type', { type: conflict.type });
                    break;
            }
        }

        this.logger.info('Conflict resolution complete', {
            originalCount: results.length,
            resolvedCount: resolvedResults.length
        });

        return resolvedResults;
    }

    /**
     * Resolves parameter disagreement conflicts
     * @param conflict Conflict to resolve
     * @param results Training results to adjust
     * @returns Adjusted training results
     */
    private resolveParameterDisagreement(conflict: Conflict, results: NodeTrainingResult[]): NodeTrainingResult[] {
        // Group by version
        const versionGroups = new Map<string, NodeTrainingResult[]>();

        for (const result of results) {
            const version = result.modelParameters.version;

            if (!versionGroups.has(version)) {
                versionGroups.set(version, []);
            }

            versionGroups.get(version)?.push(result);
        }

        // Find the group with the best average performance
        let bestVersion = '';
        let bestPerformance = Number.POSITIVE_INFINITY;

        for (const [version, group] of versionGroups.entries()) {
            const avgLoss = group.reduce((sum, r) => sum + r.metrics.loss, 0) / group.length;

            if (avgLoss < bestPerformance) {
                bestPerformance = avgLoss;
                bestVersion = version;
            }
        }

        // Keep only the best performing group
        return results.filter(r => r.modelParameters.version === bestVersion);
    }

    /**
     * Resolves training divergence conflicts
     * @param conflict Conflict to resolve
     * @param results Training results to adjust
     * @returns Adjusted training results
     */
    private resolveTrainingDivergence(conflict: Conflict, results: NodeTrainingResult[]): NodeTrainingResult[] {
        // Remove nodes with divergent training
        const filteredResults = results.filter(r => !conflict.involvedNodes.includes(r.nodeId));

        // If we filtered too many, keep some of the less divergent ones
        if (filteredResults.length < results.length / 2) {
            // Sort divergent nodes by loss (ascending)
            const divergentNodes = results
                .filter(r => conflict.involvedNodes.includes(r.nodeId))
                .sort((a, b) => a.metrics.loss - b.metrics.loss);

            // Add back the better half of divergent nodes
            const nodesToReinclude = divergentNodes.slice(0, Math.floor(divergentNodes.length / 2));

            return [...filteredResults, ...nodesToReinclude];
        }

        return filteredResults;
    }

    /**
     * Resolves staleness conflicts
     * @param conflict Conflict to resolve
     * @param results Training results to adjust
     * @returns Adjusted training results
     */
    private resolveStaleness(conflict: Conflict, results: NodeTrainingResult[]): NodeTrainingResult[] {
        // Remove stale nodes
        return results.filter(r => !conflict.involvedNodes.includes(r.nodeId));
    }

    /**
     * Resolves adversarial conflicts
     * @param conflict Conflict to resolve
     * @param results Training results to adjust
     * @returns Adjusted training results
     */
    private resolveAdversarial(conflict: Conflict, results: NodeTrainingResult[]): NodeTrainingResult[] {
        // Remove suspected adversarial nodes
        return results.filter(r => !conflict.involvedNodes.includes(r.nodeId));
    }

    /**
     * Determines the severity of conflicts
     * @param conflicts Conflicts to evaluate
     * @returns Overall conflict severity (0-1)
     */
    public evaluateConflictSeverity(conflicts: Conflict[]): number {
        if (conflicts.length === 0) {
            return 0;
        }

        // Weight conflicts by their individual severity
        const severitySum = conflicts.reduce((sum, conflict) => sum + conflict.severity, 0);

        // Apply diminishing returns for many conflicts
        return Math.min(0.95, severitySum / (conflicts.length + 2));
    }

    /**
     * Identifies potentially malicious or faulty nodes
     * @param results Training results to analyze
     * @returns List of suspicious node IDs with confidence scores
     */
    public identifySuspiciousNodes(results: NodeTrainingResult[]): Map<string, number> {
        const suspiciousNodes = new Map<string, number>();

        // This is a simplified implementation
        // In a real system, would use more sophisticated detection methods

        // For now, just identify extreme outliers in loss
        const losses = results.map(r => r.metrics.loss);
        const meanLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;
        const stdDevLoss = Math.sqrt(
            losses.reduce((sum, loss) => sum + Math.pow(loss - meanLoss, 2), 0) / losses.length
        );

        // Very high or very low loss can be suspicious
        for (const result of results) {
            const zScore = Math.abs(result.metrics.loss - meanLoss) / stdDevLoss;

            if (zScore > 3) {
                // More than 3 standard deviations is suspicious
                const confidence = Math.min(0.95, (zScore - 3) / 2);
                suspiciousNodes.set(result.nodeId, confidence);
            }
        }

        return suspiciousNodes;
    }

    /**
     * Creates a proposal to resolve conflicts
     * @param conflicts Conflicts to address
     * @returns Proposed adjustments to resolve conflicts
     */
    public createResolutionProposal(conflicts: Conflict[]): ResolutionProposal {
        const proposal: ResolutionProposal = {
            conflicts: conflicts.length,
            excludeNodes: [],
            adjustmentRecommendations: [],
            timeGenerated: Date.now()
        };

        // Add specific recommendations based on conflict types
        for (const conflict of conflicts) {
            switch (conflict.type) {
                case ConflictType.PARAMETER_DISAGREEMENT:
                    proposal.adjustmentRecommendations.push({
                        type: 'parameter_unification',
                        conflictType: conflict.type,
                        recommendation: 'Use consensus mechanism to select a single parameter set'
                    });
                    break;

                case ConflictType.TRAINING_DIVERGENCE:
                    // Add divergent nodes to exclusion list if severe enough
                    if (conflict.severity > 0.7) {
                        proposal.excludeNodes.push(...conflict.involvedNodes);
                    }

                    proposal.adjustmentRecommendations.push({
                        type: 'hyperparameter_adjustment',
                        conflictType: conflict.type,
                        recommendation: 'Standardize learning rates and batch sizes'
                    });
                    break;

                case ConflictType.STALENESS:
                    // Add stale nodes to exclusion list
                    proposal.excludeNodes.push(...conflict.involvedNodes);

                    proposal.adjustmentRecommendations.push({
                        type: 'freshness_enforcement',
                        conflictType: conflict.type,
                        recommendation: 'Enforce maximum model age requirement'
                    });
                    break;

                case ConflictType.ADVERSARIAL:
                    // Always exclude suspected adversarial nodes
                    proposal.excludeNodes.push(...conflict.involvedNodes);

                    proposal.adjustmentRecommendations.push({
                        type: 'security_improvement',
                        conflictType: conflict.type,
                        recommendation: 'Implement additional security checks for model updates'
                    });
                    break;
            }
        }

        // Deduplicate excluded nodes
        proposal.excludeNodes = Array.from(new Set(proposal.excludeNodes));

        return proposal;
    }

    /**
     * Sets the detection threshold for conflicts
     * @param threshold New threshold value (0-1)
     */
    public setDetectionThreshold(threshold: number): void {
        if (threshold < 0 || threshold > 1) {
            throw new Error(`Invalid detection threshold: ${threshold}. Must be between 0 and 1.`);
        }

        this.detectionThreshold = threshold;
    }

    /**
     * Gets the current detection threshold
     * @returns Current detection threshold
     */
    public getDetectionThreshold(): number {
        return this.detectionThreshold;
    }
}