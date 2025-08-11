import { Logger } from '@/ai/api/common/monitoring/LogService';
import { PerformanceMetrics, ThreadAnalysisResult } from '../types/performance.types';

// Import os module statiquement plutôt qu'avec require()
import * as os from 'os';

/**
 * Analyzes thread-related performance metrics to identify issues and bottlenecks
 */
export class ThreadAnalyzer {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger('ThreadAnalyzer');
    }

    /**
     * Analyzes thread metrics and generates a comprehensive thread analysis
     * @param metrics Array of performance metrics to analyze
     * @returns Thread analysis result
     */
    public async analyze(metrics: PerformanceMetrics[]): Promise<ThreadAnalysisResult> {
        this.logger.debug('Analyzing thread metrics', { metricsCount: metrics.length });

        try {
            // Extract thread-related metrics
            const threadMetrics = metrics
                .filter(m => m.thread)
                .map(m => m.thread!);

            if (!threadMetrics.length) {
                this.logger.warn('No thread metrics found for analysis');
                return this.createEmptyAnalysis();
            }

            // Calculate thread count statistics
            const threadCounts = threadMetrics.map(m => m.count);
            const averageThreadCount = threadCounts.reduce((sum, count) => sum + count, 0) / threadCounts.length;

            // Aggregate thread states
            const aggregatedStates = {
                running: 0,
                blocked: 0,
                waiting: 0,
                idle: 0
            };

            threadMetrics.forEach(m => {
                aggregatedStates.running += m.states.running;
                aggregatedStates.blocked += m.states.blocked;
                aggregatedStates.waiting += m.states.waiting;
                aggregatedStates.idle += m.states.idle;
            });

            // Calculate averages
            const metricCount = threadMetrics.length;
            const averageStates = {
                running: aggregatedStates.running / metricCount,
                blocked: aggregatedStates.blocked / metricCount,
                waiting: aggregatedStates.waiting / metricCount,
                idle: aggregatedStates.idle / metricCount
            };

            // Calculate utilization
            const totalThreads = averageStates.running + averageStates.blocked +
                averageStates.waiting + averageStates.idle;
            const utilization = totalThreads > 0 ?
                (averageStates.running + averageStates.blocked) / totalThreads : 0;

            // Calculate thread imbalance
            const imbalance = this.calculateThreadImbalance(threadMetrics);

            // Analyze blocking events
            const blockingEvents = this.analyzeBlockingEvents(threadMetrics);

            // Analyze thread pools
            const pools = this.analyzeThreadPools(threadMetrics);

            // Generate recommendations
            const recommendations = this.generateRecommendations({
                threadCount: averageThreadCount,
                states: averageStates,
                utilization,
                imbalance,
                blockingEvents,
                pools
            });

            const result: ThreadAnalysisResult = {
                count: Math.round(averageThreadCount),
                states: averageStates,
                utilization,
                imbalance,
                blockingEvents,
                pools,
                recommendations
            };

            this.logger.debug('Thread analysis completed', {
                threadCount: result.count,
                utilization: result.utilization,
                imbalance: result.imbalance
            });

            return result;
        } catch (error) {
            this.logger.error('Error during thread analysis', error);
            throw new Error(`Thread analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Creates an empty thread analysis result when no metrics are available
     * @returns Empty thread analysis result
     */
    private createEmptyAnalysis(): ThreadAnalysisResult {
        return {
            count: 0,
            states: {
                running: 0,
                blocked: 0,
                waiting: 0,
                idle: 0
            },
            utilization: 0,
            imbalance: 0,
            blockingEvents: {
                count: 0,
                duration: 0,
                impact: 0
            },
            pools: [],
            recommendations: ['No thread metrics available for analysis']
        };
    }

    /**
     * Calculates thread imbalance factor (0-1)
     * @param threadMetrics Thread metrics to analyze
     * @returns Imbalance factor where 0 is perfect balance and 1 is complete imbalance
     */
    private calculateThreadImbalance(threadMetrics: NonNullable<PerformanceMetrics['thread']>[]): number {
        // Calculate imbalance based on thread pool utilization if available
        const poolMetrics = threadMetrics
            .filter(m => m.pools && m.pools.length > 0)
            .flatMap(m => m.pools!);

        if (poolMetrics.length > 0) {
            const poolUtilizations = poolMetrics.map(p => p.active / Math.max(p.size, 1));

            if (poolUtilizations.length > 1) {
                const avgUtilization = poolUtilizations.reduce((sum, util) => sum + util, 0) / poolUtilizations.length;
                const varianceSum = poolUtilizations.reduce((sum, util) => sum + Math.pow(util - avgUtilization, 2), 0);
                const variance = varianceSum / poolUtilizations.length;

                // Normalize to 0-1 range (using sqrt of variance, i.e., standard deviation)
                return Math.min(Math.sqrt(variance) / avgUtilization, 1) || 0;
            }
        }

        // Fall back to running/waiting thread ratio variance if no pools
        const runningRatios = threadMetrics.map(m => {
            const total = m.states.running + m.states.blocked + m.states.waiting + m.states.idle;
            return total > 0 ? m.states.running / total : 0;
        });

        if (runningRatios.length > 1) {
            const avgRatio = runningRatios.reduce((sum, ratio) => sum + ratio, 0) / runningRatios.length;
            const varianceSum = runningRatios.reduce((sum, ratio) => sum + Math.pow(ratio - avgRatio, 2), 0);
            const variance = varianceSum / runningRatios.length;

            // Normalize to 0-1 range
            return Math.min(Math.sqrt(variance) / (avgRatio || 1), 1);
        }

        return 0;
    }

    /**
     * Analyzes thread blocking events
     * @param threadMetrics Thread metrics to analyze
     * @returns Blocking events analysis
     */
    private analyzeBlockingEvents(threadMetrics: NonNullable<PerformanceMetrics['thread']>[]): {
        count: number;
        duration: number;
        impact: number;
    } {
        // Calculate blocked thread statistics
        const blockedThreads = threadMetrics.map(m => m.states.blocked);
        const avgBlockedThreads = blockedThreads.reduce((sum, count) => sum + count, 0) / blockedThreads.length;

        // Estimate blocking duration (this would require more detailed metrics in practice)
        const estimatedBlockingDuration = avgBlockedThreads * 100; // Simplified estimation

        // Calculate impact (0-1 scale)
        const totalThreads = threadMetrics.reduce((sum, m) => {
            return sum + m.states.running + m.states.blocked + m.states.waiting + m.states.idle;
        }, 0) / threadMetrics.length;

        const impact = totalThreads > 0 ? Math.min(avgBlockedThreads / totalThreads, 1) : 0;

        return {
            count: Math.round(avgBlockedThreads),
            duration: Math.round(estimatedBlockingDuration),
            impact
        };
    }

    /**
     * Analyzes thread pool metrics
     * @param threadMetrics Thread metrics to analyze
     * @returns Thread pool analysis
     */
    private analyzeThreadPools(threadMetrics: NonNullable<PerformanceMetrics['thread']>[]): ThreadAnalysisResult['pools'] {
        // Collect all pool data
        const allPools = threadMetrics
            .filter(m => m.pools && m.pools.length > 0)
            .flatMap(m => m.pools!);

        if (!allPools.length) {
            return [];
        }

        // Group pools by name
        const poolsByName: Record<string, typeof allPools> = {};

        for (const pool of allPools) {
            if (!poolsByName[pool.name]) {
                poolsByName[pool.name] = [];
            }
            poolsByName[pool.name].push(pool);
        }

        // Calculate average metrics for each pool
        return Object.entries(poolsByName).map(([name, pools]) => {
            const size = pools.reduce((sum, p) => sum + p.size, 0) / pools.length;
            const active = pools.reduce((sum, p) => sum + p.active, 0) / pools.length;
            const queued = pools.reduce((sum, p) => sum + p.queued, 0) / pools.length;
            const completed = pools.reduce((sum, p) => sum + p.completed, 0) / pools.length;
            const utilization = size > 0 ? active / size : 0;

            return {
                name,
                size: Math.round(size),
                active: Math.round(active),
                queued: Math.round(queued),
                completed: Math.round(completed),
                utilization
            };
        });
    }

    /**
     * Generates recommendations based on thread analysis
     * @param analysis Thread analysis data
     * @returns Array of recommendations
     */
    private generateRecommendations(analysis: {
        threadCount: number;
        states: ThreadAnalysisResult['states'];
        utilization: number;
        imbalance: number;
        blockingEvents: ThreadAnalysisResult['blockingEvents'];
        pools: ThreadAnalysisResult['pools'];
    }): string[] {
        const recommendations: string[] = [];

        // Thread count recommendations
        const availableCores = this.getEstimatedCoreCount();
        if (analysis.threadCount > availableCores * 4) {
            recommendations.push(`Consider reducing thread count (${analysis.threadCount}) as it significantly exceeds available cores (${availableCores})`);
        } else if (analysis.threadCount < availableCores && analysis.utilization > 0.8) {
            recommendations.push(`Consider increasing thread count (${analysis.threadCount}) to better utilize available cores (${availableCores})`);
        }

        // Thread balance recommendations
        if (analysis.imbalance > 0.4) {
            recommendations.push(`Address thread imbalance (${(analysis.imbalance * 100).toFixed(1)}%) to improve resource utilization`);
        }

        // Blocking event recommendations
        if (analysis.blockingEvents.impact > 0.2) {
            recommendations.push(`Investigate thread blocking events affecting ${analysis.blockingEvents.count} threads with significant performance impact`);
        }

        // Thread pool recommendations
        for (const pool of analysis.pools) {
            if (pool.utilization > 0.9) {
                recommendations.push(`Thread pool '${pool.name}' is nearly saturated (${(pool.utilization * 100).toFixed(1)}% utilization). Consider increasing size.`);
            }

            if (pool.queued > pool.size * 2) {
                recommendations.push(`Thread pool '${pool.name}' has excessive queue buildup (${pool.queued} queued tasks). Consider increasing size or optimizing task processing.`);
            }
        }

        // If no specific recommendations, add a general one
        if (recommendations.length === 0) {
            if (analysis.utilization < 0.5) {
                recommendations.push('Thread utilization is low. Consider optimizing resource allocation for better efficiency.');
            } else if (analysis.utilization > 0.5 && analysis.utilization < 0.85) {
                recommendations.push('Thread utilization is within optimal range. No immediate changes needed.');
            }
        }

        return recommendations;
    }

    /**
     * Gets an estimate of available CPU cores
     * @returns Estimated number of CPU cores
     */
    private getEstimatedCoreCount(): number {
        try {
            // Dans un environnement Node.js, utilise le module os importé statiquement
            if (typeof process !== 'undefined' && process.env) {
                return os.cpus().length;
            }
        } catch {
            // Ignorer les erreurs avec un underscore pour variable non utilisée
        }

        // Fallback to a reasonable default
        return 4;
    }
}