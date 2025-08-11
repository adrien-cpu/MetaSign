// src/ai/api/distributed/monitoring/analysis/CPUAnalyzer.ts
import { Logger } from '@api/common/monitoring/LogService';
import { ThreadAnalyzer } from './ThreadAnalyzer';
import { ContextSwitchAnalyzer } from './ContextSwitchAnalyzer';
import {
    PerformanceMetrics,
    CPUAnalysis,
    ThreadAnalysisResult,
    ContextSwitchAnalysisResult,
    PerformanceScore,
    Profile,
    Hotspot
} from '../types/performance.types';

/**
 * Analyzes CPU performance metrics to identify bottlenecks and performance issues
 */
export class CPUAnalyzer {
    private readonly logger: Logger;
    private readonly threadAnalyzer: ThreadAnalyzer;
    private readonly contextSwitchAnalyzer: ContextSwitchAnalyzer;

    /**
     * Creates a new CPU analyzer
     * @param threadAnalyzer Analyzer for thread-related metrics
     * @param contextSwitchAnalyzer Analyzer for context switch metrics
     */
    constructor(
        threadAnalyzer: ThreadAnalyzer,
        contextSwitchAnalyzer: ContextSwitchAnalyzer
    ) {
        this.logger = new Logger('CPUAnalyzer');
        this.threadAnalyzer = threadAnalyzer;
        this.contextSwitchAnalyzer = contextSwitchAnalyzer;
    }

    /**
     * Analyzes CPU metrics and generates a comprehensive analysis report
     * @param metrics Array of performance metrics to analyze
     * @returns CPU analysis result
     */
    async analyze(metrics: PerformanceMetrics[]): Promise<CPUAnalysis> {
        this.logger.debug('Starting CPU analysis', { metricsCount: metrics.length });

        try {
            const threadAnalysis = await this.threadAnalyzer.analyze(metrics);
            const contextSwitches = await this.contextSwitchAnalyzer.analyze(metrics);
            const utilization = this.analyzeUtilization(metrics);

            const result = {
                utilization,
                hotspots: await this.identifyHotspots(metrics),
                threads: threadAnalysis,
                contextSwitches,
                performance: this.calculatePerformanceScore({
                    threadAnalysis,
                    contextSwitches,
                    utilization
                }),
                timestamp: new Date(),
                duration: this.calculateAnalysisDuration(metrics)
            };

            this.logger.debug('CPU analysis completed', {
                utilizationAvg: result.utilization.average,
                hotspotsCount: result.hotspots.length,
                performanceScore: result.performance.score
            });

            return result;
        } catch (error) {
            this.logger.error('Error during CPU analysis', error);
            throw new Error(`CPU analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyzes CPU utilization patterns from performance metrics
     * @param metrics Performance metrics to analyze
     * @returns CPU utilization analysis
     */
    private analyzeUtilization(metrics: PerformanceMetrics[]): {
        average: number;
        peak: number;
        minimum: number;
        variance: number;
        pattern: 'stable' | 'spiky' | 'increasing' | 'decreasing';
    } {
        if (!metrics.length) {
            return {
                average: 0,
                peak: 0,
                minimum: 0,
                variance: 0,
                pattern: 'stable'
            };
        }

        // Extract CPU utilization values from metrics
        const utilizationValues = metrics.map(m => m.cpu?.utilization || 0);

        // Calculate basic statistics
        const average = utilizationValues.reduce((sum, val) => sum + val, 0) / utilizationValues.length;
        const peak = Math.max(...utilizationValues);
        const minimum = Math.min(...utilizationValues);

        // Calculate variance
        const variance = utilizationValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / utilizationValues.length;

        // Determine utilization pattern
        const pattern = this.determineUtilizationPattern(utilizationValues);

        return {
            average,
            peak,
            minimum,
            variance,
            pattern
        };
    }

    /**
     * Determines CPU utilization pattern from a series of measurements
     * @param utilizationValues Array of CPU utilization values
     * @returns Pattern classification
     */
    private determineUtilizationPattern(utilizationValues: number[]): 'stable' | 'spiky' | 'increasing' | 'decreasing' {
        if (utilizationValues.length < 3) {
            return 'stable';
        }

        // Check for spiky pattern (high variance)
        const average = utilizationValues.reduce((sum, val) => sum + val, 0) / utilizationValues.length;
        const variance = utilizationValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / utilizationValues.length;
        const standardDeviation = Math.sqrt(variance);

        if (standardDeviation > average * 0.25) {
            return 'spiky';
        }

        // Check for increasing/decreasing trend
        const firstThird = utilizationValues.slice(0, Math.floor(utilizationValues.length / 3));
        const lastThird = utilizationValues.slice(Math.floor(2 * utilizationValues.length / 3));

        const firstThirdAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
        const lastThirdAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;

        if (lastThirdAvg > firstThirdAvg * 1.1) {
            return 'increasing';
        } else if (lastThirdAvg < firstThirdAvg * 0.9) {
            return 'decreasing';
        }

        return 'stable';
    }

    /**
     * Calculates overall CPU performance score
     * @param data Analysis data to use for score calculation
     * @returns Performance score and details
     */
    private calculatePerformanceScore(data: {
        threadAnalysis: ThreadAnalysisResult;
        contextSwitches: ContextSwitchAnalysisResult;
        utilization: {
            average: number;
            peak: number;
            minimum: number;
            variance: number;
            pattern: string;
        };
    }): PerformanceScore {
        // Base score starts at 100 (perfect)
        let score = 100;
        const details: string[] = [];

        // Penalize for high CPU utilization
        if (data.utilization.average > 80) {
            const penalty = (data.utilization.average - 80) * 0.5;
            score -= penalty;
            details.push(`High average CPU utilization (${data.utilization.average.toFixed(1)}%): -${penalty.toFixed(1)} points`);
        }

        // Penalize for CPU utilization spikes
        if (data.utilization.pattern === 'spiky') {
            const variance = data.utilization.variance;
            const variancePenalty = Math.min(variance * 10, 15);
            score -= variancePenalty;
            details.push(`CPU utilization is unstable (variance: ${variance.toFixed(2)}): -${variancePenalty.toFixed(1)} points`);
        }

        // Penalize for excessive context switches
        if (data.contextSwitches.rate > 10000) {
            const switchPenalty = Math.min((data.contextSwitches.rate - 10000) / 1000, 20);
            score -= switchPenalty;
            details.push(`High context switch rate (${data.contextSwitches.rate.toFixed(0)}/s): -${switchPenalty.toFixed(1)} points`);
        }

        // Penalize for uneven thread utilization
        if (data.threadAnalysis.imbalance > 0.3) {
            const imbalancePenalty = data.threadAnalysis.imbalance * 50;
            score -= imbalancePenalty;
            details.push(`Thread load imbalance (${data.threadAnalysis.imbalance.toFixed(2)}): -${imbalancePenalty.toFixed(1)} points`);
        }

        // Ensure score is between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // Determine performance level
        let level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
        if (score < 50) level = 'critical';
        else if (score < 70) level = 'poor';
        else if (score < 85) level = 'fair';
        else if (score < 95) level = 'good';
        else level = 'excellent';

        return {
            score,
            level,
            details
        };
    }

    /**
     * Identifies CPU performance hotspots
     * @param metrics Performance metrics to analyze
     * @returns Array of identified hotspots
     */
    private async identifyHotspots(metrics: PerformanceMetrics[]): Promise<Hotspot[]> {
        const profiles = await this.collectProfiles(metrics);
        return this.analyzeProfiles(profiles);
    }

    /**
     * Collects CPU profiles from performance metrics
     * @param metrics Performance metrics to analyze
     * @returns Array of CPU profiles
     */
    private async collectProfiles(metrics: PerformanceMetrics[]): Promise<Profile[]> {
        this.logger.debug('Collecting CPU profiles');

        // Extract any profile data from metrics
        const profiles: Profile[] = [];

        for (const metric of metrics) {
            if (metric.cpu?.profile) {
                profiles.push(metric.cpu.profile);
            }
        }

        return profiles;
    }

    /**
     * Analyzes CPU profiles to identify hotspots
     * @param profiles CPU profiles to analyze
     * @returns Array of identified hotspots
     */
    private analyzeProfiles(profiles: Profile[]): Hotspot[] {
        if (!profiles.length) {
            return [];
        }

        // Combine all profiles into a single merged profile
        const mergedProfile = this.mergeProfiles(profiles);

        // Find nodes with highest self time
        const hotspots: Hotspot[] = [];

        for (const node of mergedProfile.nodes) {
            if (node.selfTime > 10) { // Consider nodes with >10ms self time as potential hotspots
                hotspots.push({
                    location: node.functionName,
                    impact: node.selfTime / mergedProfile.totalTime * 100,
                    duration: node.selfTime,
                    frequency: node.hitCount,
                    callStack: node.callStack || []
                });
            }
        }

        // Sort hotspots by impact (descending)
        return hotspots.sort((a, b) => b.impact - a.impact);
    }

    /**
     * Merges multiple CPU profiles into a single profile
     * @param profiles Profiles to merge
     * @returns Merged profile
     */
    private mergeProfiles(profiles: Profile[]): Profile {
        // This is a simplified implementation
        const nodes: {
            functionName: string;
            selfTime: number;
            totalTime: number;
            hitCount: number;
            callStack?: string[];
        }[] = [];

        let totalTime = 0;

        // Collect and merge nodes from all profiles
        for (const profile of profiles) {
            totalTime += profile.totalTime;

            for (const node of profile.nodes) {
                const existingNode = nodes.find(n => n.functionName === node.functionName);

                if (existingNode) {
                    existingNode.selfTime += node.selfTime;
                    existingNode.totalTime += node.totalTime;
                    existingNode.hitCount += node.hitCount;
                } else {
                    nodes.push({ ...node });
                }
            }
        }

        return {
            totalTime,
            nodes
        };
    }

    /**
     * Calculates the total duration covered by the analysis
     * @param metrics Performance metrics to analyze
     * @returns Duration in milliseconds
     */
    private calculateAnalysisDuration(metrics: PerformanceMetrics[]): number {
        if (!metrics.length) return 0;

        const startTimes = metrics.map(m => m.timestamp.getTime());
        const endTimes = metrics.map(m => m.timestamp.getTime() + m.duration);

        const minStart = Math.min(...startTimes);
        const maxEnd = Math.max(...endTimes);

        return maxEnd - minStart;
    }
}