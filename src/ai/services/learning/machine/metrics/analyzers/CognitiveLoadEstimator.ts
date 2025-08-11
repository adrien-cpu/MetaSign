// src/ai/learning/realtime/analyzers/CognitiveLoadEstimator.ts

import { EngagementSignals, CognitiveLoadEstimate, CognitiveLoadFactor } from '@ai/learning/types/engagement.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';

/**
 * Estimates the cognitive load of a learner based on real-time engagement signals.
 * Cognitive load represents the mental effort being used in working memory.
 */
export class CognitiveLoadEstimator {
    private readonly metricsCollector: IMetricsCollector;
    private readonly factorWeights: Map<string, number>;

    constructor(metricsCollector: IMetricsCollector) {
        this.metricsCollector = metricsCollector;

        // Initialize factor weights for cognitive load calculation
        this.factorWeights = new Map<string, number>([
            ['responseTime', 0.25],        // Response time to prompts
            ['errorRate', 0.2],            // Rate of errors made
            ['pauseDuration', 0.15],       // Duration of pauses when responding
            ['revisitFrequency', 0.1],     // Frequency of revisiting content
            ['complexityLevel', 0.15],     // Complexity level of current content
            ['multiTaskingIndicators', 0.1], // Indicators of multitasking
            ['consistencyVariance', 0.05]  // Variance in response consistency
        ]);
    }

    /**
     * Estimates cognitive load based on engagement signals and context
     * @param signals Array of engagement signals
     * @param contextData Additional context data
     * @returns Cognitive load estimate with level and contributing factors
     */
    public estimateCognitiveLoad(
        signals: EngagementSignals[],
        contextData?: Record<string, any>
    ): CognitiveLoadEstimate {
        this.metricsCollector.recordMetric('cognitive_load.estimation_start', 1);
        const startTime = performance.now();

        try {
            if (signals.length === 0) {
                return { level: 0.5, factors: [] };
            }

            // Extract cognitive load factors from signals
            const factors: CognitiveLoadFactor[] = [];
            let totalLoadLevel = 0;
            let totalWeight = 0;

            // Response time factor
            const responseTimeFactor = this.calculateResponseTimeFactor(signals);
            if (responseTimeFactor) {
                factors.push(responseTimeFactor);
                totalLoadLevel += responseTimeFactor.contribution * (this.factorWeights.get('responseTime') || 0);
                totalWeight += this.factorWeights.get('responseTime') || 0;
            }

            // Error rate factor
            const errorRateFactor = this.calculateErrorRateFactor(signals);
            if (errorRateFactor) {
                factors.push(errorRateFactor);
                totalLoadLevel += errorRateFactor.contribution * (this.factorWeights.get('errorRate') || 0);
                totalWeight += this.factorWeights.get('errorRate') || 0;
            }

            // Pause duration factor
            const pauseDurationFactor = this.calculatePauseDurationFactor(signals);
            if (pauseDurationFactor) {
                factors.push(pauseDurationFactor);
                totalLoadLevel += pauseDurationFactor.contribution * (this.factorWeights.get('pauseDuration') || 0);
                totalWeight += this.factorWeights.get('pauseDuration') || 0;
            }

            // Revisit frequency factor
            const revisitFactor = this.calculateRevisitFactor(signals);
            if (revisitFactor) {
                factors.push(revisitFactor);
                totalLoadLevel += revisitFactor.contribution * (this.factorWeights.get('revisitFrequency') || 0);
                totalWeight += this.factorWeights.get('revisitFrequency') || 0;
            }

            // Content complexity factor (from context data)
            if (contextData?.difficulty !== undefined) {
                const complexityFactor: CognitiveLoadFactor = {
                    name: 'contentComplexity',
                    value: contextData.difficulty,
                    contribution: contextData.difficulty, // Higher difficulty = higher cognitive load
                    description: `Content difficulty level: ${contextData.difficulty.toFixed(2)}`
                };

                factors.push(complexityFactor);
                totalLoadLevel += complexityFactor.contribution * (this.factorWeights.get('complexityLevel') || 0);
                totalWeight += this.factorWeights.get('complexityLevel') || 0;
            }

            // Multitasking indicators
            const multitaskingFactor = this.calculateMultitaskingFactor(signals);
            if (multitaskingFactor) {
                factors.push(multitaskingFactor);
                totalLoadLevel += multitaskingFactor.contribution * (this.factorWeights.get('multiTaskingIndicators') || 0);
                totalWeight += this.factorWeights.get('multiTaskingIndicators') || 0;
            }

            // Consistency variance
            const consistencyFactor = this.calculateConsistencyFactor(signals);
            if (consistencyFactor) {
                factors.push(consistencyFactor);
                totalLoadLevel += consistencyFactor.contribution * (this.factorWeights.get('consistencyVariance') || 0);
                totalWeight += this.factorWeights.get('consistencyVariance') || 0;
            }

            // Normalize cognitive load level
            const normalizedLevel = totalWeight > 0
                ? Math.min(1, Math.max(0, totalLoadLevel / totalWeight))
                : 0.5; // Default to medium if no factors

            const result: CognitiveLoadEstimate = {
                level: normalizedLevel,
                factors: factors.sort((a, b) => b.contribution - a.contribution)
            };

            this.metricsCollector.recordMetric('cognitive_load.estimation_success', 1);
            this.metricsCollector.recordMetric('cognitive_load.estimation_time_ms', performance.now() - startTime);

            return result;
        } catch (error) {
            this.metricsCollector.recordMetric('cognitive_load.estimation_error', 1);

            // Return a default estimate in case of error
            return {
                level: 0.5,
                factors: [],
                error: String(error)
            };
        }
    }

    /**
     * Calculates the response time factor for cognitive load
     */
    private calculateResponseTimeFactor(signals: EngagementSignals[]): CognitiveLoadFactor | null {
        const responseTimeSignals = signals
            .filter(s => s.responseTime !== undefined)
            .map(s => s.responseTime!);

        if (responseTimeSignals.length < 2) {
            return null;
        }

        // Calculate average response time
        const avgResponseTime = responseTimeSignals.reduce((sum, time) => sum + time, 0) / responseTimeSignals.length;

        // Normalize to a 0-1 scale (assumes response times typically range from 0-10000ms)
        // Higher values indicate higher cognitive load
        const normalizedValue = Math.min(avgResponseTime / 10000, 1);

        return {
            name: 'responseTime',
            value: avgResponseTime,
            contribution: normalizedValue,
            description: `Average response time: ${avgResponseTime.toFixed(0)}ms`
        };
    }

    /**
     * Calculates the error rate factor for cognitive load
     */
    private calculateErrorRateFactor(signals: EngagementSignals[]): CognitiveLoadFactor | null {
        const interactionSignals = signals.filter(s => s.interactionResult !== undefined);

        if (interactionSignals.length < 3) {
            return null;
        }

        // Count errors
        const errorCount = interactionSignals.filter(s => s.interactionResult === 'error').length;
        const errorRate = errorCount / interactionSignals.length;

        return {
            name: 'errorRate',
            value: errorRate,
            contribution: errorRate, // Higher error rate = higher cognitive load
            description: `Error rate: ${(errorRate * 100).toFixed(1)}%`
        };
    }

    /**
     * Calculates the pause duration factor for cognitive load
     */
    private calculatePauseDurationFactor(signals: EngagementSignals[]): CognitiveLoadFactor | null {
        const pauseSignals = signals.filter(s => s.pauseDuration !== undefined);

        if (pauseSignals.length < 2) {
            return null;
        }

        // Calculate average pause duration
        const avgPauseDuration = pauseSignals.reduce((sum, s) => sum + s.pauseDuration!, 0) / pauseSignals.length;

        // Normalize to a 0-1 scale (assumes pause durations typically range from 0-5000ms)
        const normalizedValue = Math.min(avgPauseDuration / 5000, 1);

        return {
            name: 'pauseDuration',
            value: avgPauseDuration,
            contribution: normalizedValue, // Longer pauses indicate higher cognitive load
            description: `Average pause duration: ${avgPauseDuration.toFixed(0)}ms`
        };
    }

    /**
     * Calculates the content revisit factor for cognitive load
     */
    private calculateRevisitFactor(signals: EngagementSignals[]): CognitiveLoadFactor | null {
        const navigationSignals = signals.filter(s => s.navigationAction !== undefined);

        if (navigationSignals.length < 3) {
            return null;
        }

        // Count backward navigation actions (revisits)
        const revisitCount = navigationSignals.filter(s =>
            s.navigationAction === 'back' ||
            s.navigationAction === 'repeat'
        ).length;

        const revisitRate = revisitCount / navigationSignals.length;

        return {
            name: 'revisitFrequency',
            value: revisitRate,
            contribution: revisitRate, // Higher revisit rate suggests higher cognitive load
            description: `Content revisit rate: ${(revisitRate * 100).toFixed(1)}%`
        };
    }

    /**
     * Calculates the multitasking factor for cognitive load
     */
    private calculateMultitaskingFactor(signals: EngagementSignals[]): CognitiveLoadFactor | null {
        const focusSignals = signals.filter(s => s.focusState !== undefined);

        if (focusSignals.length < 3) {
            return null;
        }

        // Count focus transitions (potential multitasking indicators)
        let focusTransitions = 0;
        for (let i = 1; i < focusSignals.length; i++) {
            if (focusSignals[i].focusState !== focusSignals[i - 1].focusState) {
                focusTransitions++;
            }
        }

        // Calculate transitions per minute
        const sessionDurationMinutes = (focusSignals[focusSignals.length - 1].timestamp - focusSignals[0].timestamp) / 60000;

        if (sessionDurationMinutes < 0.1) { // Less than 6 seconds
            return null;
        }

        const transitionsPerMinute = focusTransitions / sessionDurationMinutes;

        // Normalize to 0-1 (assume 0-10 transitions per minute range)
        const normalizedValue = Math.min(transitionsPerMinute / 10, 1);

        return {
            name: 'multitaskingIndicators',
            value: transitionsPerMinute,
            contribution: normalizedValue, // More focus transitions suggest higher cognitive load due to task switching
            description: `Focus transitions per minute: ${transitionsPerMinute.toFixed(1)}`
        };
    }

    /**
     * Calculates the consistency factor for cognitive load
     */
    private calculateConsistencyFactor(signals: EngagementSignals[]): CognitiveLoadFactor | null {
        const interactionSignals = signals.filter(s => s.interactionDuration !== undefined);

        if (interactionSignals.length < 4) {
            return null;
        }

        // Calculate variance in interaction durations
        const durations = interactionSignals.map(s => s.interactionDuration!);
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

        const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
        const stdDev = Math.sqrt(variance);

        // Calculate coefficient of variation (normalized measure of dispersion)
        const cv = stdDev / avgDuration;

        // Normalize to 0-1 scale (assume CV ranges from 0-1)
        const normalizedValue = Math.min(cv, 1);

        return {
            name: 'consistencyVariance',
            value: cv,
            contribution: normalizedValue, // Higher variance suggests inconsistent performance, potentially due to cognitive load
            description: `Interaction consistency variance: ${cv.toFixed(2)}`
        };
    }
}