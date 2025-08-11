/**
 * RoundManager.ts
 * 
 * Manages rounds in the consensus process.
 */

import { IRoundManager } from './interfaces/IRoundManager';
import {
    ConsensusRoundParameters,
    WeightFunctionType,
    ConflictType
} from './types/ConsensusTypes';
import { LogService } from '@monitoring/LogService';
import { IMetricsCollector } from '@metrics/interfaces/IMetricsCollector';
import { Conflict } from './types/conflict.types';

/**
 * Default round parameters
 */
const DEFAULT_ROUND_PARAMETERS: ConsensusRoundParameters = {
    weightFunction: 'weighted-majority',
    agreementThreshold: 0.67,
    iterationTimeout: 30000, // 30 seconds
    excludeOutliers: false
};

/**
 * Metrics tracked for each round
 */
interface RoundMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    successful: boolean;
    conflicts: number;
    parameters: Readonly<ConsensusRoundParameters>;
}

/**
 * Manages consensus rounds, including tracking state and adjusting parameters
 */
export class RoundManager implements IRoundManager {
    private parameters: ConsensusRoundParameters;
    private roundMetrics: Map<number, RoundMetrics>;
    private readonly logger: LogService;
    private readonly metricsCollector: IMetricsCollector | undefined;

    /**
     * Creates a new round manager
     * @param initialParameters Initial round parameters
     * @param logger Logger service
     * @param metricsCollector Optional metrics collector for performance monitoring
     */
    constructor(
        initialParameters: Partial<ConsensusRoundParameters> = {},
        logger = new LogService('RoundManager'),
        metricsCollector?: IMetricsCollector
    ) {
        // Merge default parameters with provided initial parameters
        this.parameters = {
            ...DEFAULT_ROUND_PARAMETERS,
            ...initialParameters
        };

        this.roundMetrics = new Map<number, RoundMetrics>();
        this.logger = logger;
        this.metricsCollector = metricsCollector;
    }

    /**
     * Gets the current round parameters
     * @returns Current parameters for consensus rounds
     */
    public getCurrentParameters(): Readonly<ConsensusRoundParameters> {
        return { ...this.parameters }; // Return a copy to prevent external modification
    }

    /**
     * Sets new round parameters
     * @param parameters Parameters to update
     */
    public setParameters(parameters: Partial<ConsensusRoundParameters>): void {
        // Update only the provided parameters
        this.parameters = {
            ...this.parameters,
            ...parameters
        };

        this.logger.info('Round parameters updated', {
            parametersJson: JSON.stringify(this.parameters)
        });

        // Track parameter changes in metrics if collector is available
        if (this.metricsCollector) {
            this.metricsCollector.trackEvent('consensus_parameters_updated', {
                parameters: JSON.stringify(this.parameters)
            });
        }
    }

    /**
     * Starts a new consensus round
     * @param round Round number
     */
    public startRound(round: number): void {
        const roundStart = Date.now();

        this.roundMetrics.set(round, {
            startTime: roundStart,
            successful: false,
            conflicts: 0,
            parameters: { ...this.parameters }
        });

        this.logger.info('Starting consensus round', {
            round,
            parametersJson: JSON.stringify(this.parameters)
        });

        // Track round start in metrics if collector is available
        if (this.metricsCollector) {
            this.metricsCollector.trackEvent('consensus_round_started', {
                round: round.toString(),
                timestamp: roundStart.toString()
            });
        }
    }

    /**
     * Ends a consensus round and records metrics
     * @param round Round number
     * @param successful Whether the round reached consensus
     */
    public endRound(round: number, successful: boolean): void {
        const metrics = this.roundMetrics.get(round);

        if (!metrics) {
            this.logger.warn('Ending round that was not started', { round });
            return;
        }

        const endTime = Date.now();
        const duration = endTime - metrics.startTime;

        this.roundMetrics.set(round, {
            ...metrics,
            endTime,
            duration,
            successful
        });

        this.logger.info('Consensus round completed', {
            round,
            successful,
            duration
        });

        // Track round completion in metrics if collector is available
        if (this.metricsCollector) {
            this.metricsCollector.trackEvent('consensus_round_completed', {
                round: round.toString(),
                successful: successful.toString(),
                duration: duration.toString(),
                conflictCount: metrics.conflicts.toString()
            });
        }
    }

    /**
     * Adjusts round parameters based on conflicts
     * @param conflicts Conflicts detected in the round
     * @param round Current round number
     */
    public async adjustParameters(conflicts: Conflict[], round: number): Promise<void> {
        // Update metrics for the round
        const metrics = this.roundMetrics.get(round);
        if (metrics) {
            const updatedMetrics = {
                ...metrics,
                conflicts: conflicts.length
            };
            this.roundMetrics.set(round, updatedMetrics);
        }

        this.logger.info('Adjusting parameters based on conflicts', {
            conflictCount: conflicts.length,
            round
        });

        // Start with current parameters
        const newParameters: Partial<ConsensusRoundParameters> = {};

        // Adjust agreement threshold based on round and conflict severity
        // Generally, we relax requirements as rounds increase
        if (round > 0) {
            const totalSeverity = conflicts.reduce((sum, conflict) => sum + conflict.severity, 0);
            const averageSeverity = conflicts.length > 0 ? totalSeverity / conflicts.length : 0;

            // Calculate new threshold - more severe conflicts lead to lower threshold
            const reductionFactor = 0.02 * (1 + Math.min(2, round / 2));
            const newThreshold = Math.max(
                0.51, // Never go below simple majority
                this.parameters.agreementThreshold - (reductionFactor * averageSeverity)
            );

            newParameters.agreementThreshold = newThreshold;
        }

        // Adjust weight function based on conflict types
        const conflictTypes = conflicts.map(c => c.type);

        if (conflictTypes.includes(ConflictType.PARAMETER_DISAGREEMENT)) {
            // For parameter disagreements, performance-based weighting may help
            newParameters.weightFunction = 'performance-based' as WeightFunctionType;
        } else if (conflictTypes.includes(ConflictType.STALENESS)) {
            // For staleness conflicts, emphasize recent results
            newParameters.weightFunction = 'trust-based' as WeightFunctionType;
        } else if (conflictTypes.includes(ConflictType.ADVERSARIAL)) {
            // For potential adversarial nodes, we need robust aggregation
            newParameters.excludeOutliers = true;
        }

        // Adjust iteration timeout if rounds are taking too long
        if (round > 1) {
            // Check duration of previous rounds
            const previousMetrics = this.roundMetrics.get(round - 1);
            if (previousMetrics?.duration && previousMetrics.duration > this.parameters.iterationTimeout * 0.8) {
                // Increase timeout if previous round was getting close to the limit
                newParameters.iterationTimeout = Math.min(
                    120000, // Cap at 2 minutes
                    this.parameters.iterationTimeout * 1.5
                );
            }
        }

        // Apply the parameter updates
        if (Object.keys(newParameters).length > 0) {
            this.setParameters(newParameters);
        }
    }

    /**
     * Gets metrics for a specific round
     * @param round Round number
     * @returns Metrics for the specified round, or undefined if not found
     */
    public getRoundMetrics(round: number): Readonly<RoundMetrics> | undefined {
        const metrics = this.roundMetrics.get(round);
        return metrics ? { ...metrics } : undefined;
    }

    /**
     * Gets metrics for all rounds
     * @returns Map of round numbers to their metrics
     */
    public getAllRoundMetrics(): ReadonlyMap<number, Readonly<RoundMetrics>> {
        // Return a copy to prevent external modification
        const metricsCopy = new Map<number, Readonly<RoundMetrics>>();

        for (const [round, metrics] of this.roundMetrics.entries()) {
            metricsCopy.set(round, { ...metrics });
        }

        return metricsCopy;
    }

    /**
     * Gets average duration of consensus rounds
     * @returns Average duration in milliseconds, or undefined if no rounds completed
     */
    public getAverageRoundDuration(): number | undefined {
        let totalDuration = 0;
        let completedRounds = 0;

        for (const metrics of this.roundMetrics.values()) {
            if (metrics.duration !== undefined) {
                totalDuration += metrics.duration;
                completedRounds++;
            }
        }

        return completedRounds > 0 ? totalDuration / completedRounds : undefined;
    }

    /**
     * Gets success rate of consensus rounds
     * @returns Percentage of successful rounds, or undefined if no rounds completed
     */
    public getSuccessRate(): number | undefined {
        if (this.roundMetrics.size === 0) {
            return undefined;
        }

        let successfulRounds = 0;

        for (const metrics of this.roundMetrics.values()) {
            if (metrics.successful) {
                successfulRounds++;
            }
        }

        return (successfulRounds / this.roundMetrics.size) * 100;
    }

    /**
     * Resets the round manager, clearing all metrics
     */
    public reset(): void {
        this.roundMetrics.clear();
        this.parameters = { ...DEFAULT_ROUND_PARAMETERS };
        this.logger.info('Round manager reset');
    }
}