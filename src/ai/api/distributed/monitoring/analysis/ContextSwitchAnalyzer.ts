// src/ai/api/distributed/monitoring/analysis/ContextSwitchAnalyzer.ts
import { Logger } from '@api/common/monitoring/LogService';
import { PerformanceMetrics, ContextSwitchAnalysisResult } from '../types/performance.types';
// Import os module instead of using require
import * as os from 'os';

/**
 * Analyzes context switch metrics to identify performance issues
 */
export class ContextSwitchAnalyzer {
    private readonly logger: Logger;

    // Thresholds for context switch analysis
    private readonly HIGH_RATE_THRESHOLD = 15000; // context switches per second
    private readonly MEDIUM_RATE_THRESHOLD = 8000; // context switches per second
    private readonly HIGH_INVOLUNTARY_RATIO = 0.6; // 60% involuntary switches

    constructor() {
        this.logger = new Logger('ContextSwitchAnalyzer');
    }

    /**
     * Analyzes context switch metrics and generates a comprehensive analysis
     * @param metrics Array of performance metrics to analyze
     * @returns Context switch analysis result
     */
    async analyze(metrics: PerformanceMetrics[]): Promise<ContextSwitchAnalysisResult> {
        this.logger.debug('Analyzing context switch metrics', { metricsCount: metrics.length });

        try {
            // Extract context switch metrics
            const contextSwitchMetrics = metrics
                .filter(m => m.contextSwitch)
                .map(m => m.contextSwitch!);

            if (!contextSwitchMetrics.length) {
                this.logger.warn('No context switch metrics found for analysis');
                return this.createEmptyAnalysis();
            }

            // Calculate averages
            const voluntary = this.calculateAverage(contextSwitchMetrics.map(m => m.voluntary));
            const involuntary = this.calculateAverage(contextSwitchMetrics.map(m => m.involuntary));
            const total = voluntary + involuntary;
            const rate = this.calculateAverage(contextSwitchMetrics.map(m => m.rate));

            // Calculate impact based on rate and involuntary ratio
            const involuntaryRatio = total > 0 ? involuntary / total : 0;
            const rateImpact = this.calculateRateImpact(rate);
            const ratioImpact = this.calculateInvoluntaryRatioImpact(involuntaryRatio);

            // Combined impact factor (0-1)
            const impact = Math.max(rateImpact, ratioImpact);

            // Determine if context switching is problematic
            const isProblematic = impact > 0.5;

            // Identify root causes if problematic
            let rootCauses: string[] = [];
            if (isProblematic) {
                rootCauses = this.identifyRootCauses({
                    rate,
                    involuntaryRatio,
                    metrics
                });
            }

            // Generate recommendations
            const recommendations = this.generateRecommendations({
                rate,
                involuntaryRatio,
                impact,
                isProblematic,
                rootCauses
            });

            const result: ContextSwitchAnalysisResult = {
                voluntary: Math.round(voluntary),
                involuntary: Math.round(involuntary),
                total: Math.round(total),
                rate: Math.round(rate),
                impact,
                isProblematic,
                rootCauses,
                recommendations
            };

            this.logger.debug('Context switch analysis completed', {
                rate: result.rate,
                impact: result.impact,
                isProblematic: result.isProblematic
            });

            return result;
        } catch (error) {
            this.logger.error('Error during context switch analysis', error);
            throw new Error(`Context switch analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Creates an empty context switch analysis result when no metrics are available
     * @returns Empty context switch analysis result
     */
    private createEmptyAnalysis(): ContextSwitchAnalysisResult {
        return {
            voluntary: 0,
            involuntary: 0,
            total: 0,
            rate: 0,
            impact: 0,
            isProblematic: false,
            rootCauses: [],
            recommendations: ['No context switch metrics available for analysis']
        };
    }

    /**
     * Calculates the average of an array of numbers
     * @param values Array of numbers
     * @returns Average value
     */
    private calculateAverage(values: number[]): number {
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    /**
     * Calculates impact factor (0-1) based on context switch rate
     * @param rate Context switch rate
     * @returns Impact factor
     */
    private calculateRateImpact(rate: number): number {
        if (rate >= this.HIGH_RATE_THRESHOLD) {
            // Linear scaling from 0.6 (at threshold) to 1.0 (at double threshold)
            return Math.min(0.6 + 0.4 * (rate - this.HIGH_RATE_THRESHOLD) / this.HIGH_RATE_THRESHOLD, 1.0);
        } else if (rate >= this.MEDIUM_RATE_THRESHOLD) {
            // Linear scaling from 0.3 (at medium threshold) to 0.6 (at high threshold)
            return 0.3 + 0.3 * (rate - this.MEDIUM_RATE_THRESHOLD) / (this.HIGH_RATE_THRESHOLD - this.MEDIUM_RATE_THRESHOLD);
        } else {
            // Linear scaling from 0 to 0.3
            return Math.max(0, rate / this.MEDIUM_RATE_THRESHOLD * 0.3);
        }
    }

    /**
     * Calculates impact factor (0-1) based on involuntary context switch ratio
     * @param ratio Involuntary to total context switch ratio
     * @returns Impact factor
     */
    private calculateInvoluntaryRatioImpact(ratio: number): number {
        if (ratio >= this.HIGH_INVOLUNTARY_RATIO) {
            // Linear scaling from 0.5 (at threshold) to 0.9 (at 100% involuntary)
            return 0.5 + 0.4 * (ratio - this.HIGH_INVOLUNTARY_RATIO) / (1 - this.HIGH_INVOLUNTARY_RATIO);
        } else {
            // Linear scaling from 0 to 0.5
            return ratio / this.HIGH_INVOLUNTARY_RATIO * 0.5;
        }
    }

    /**
     * Identifies potential root causes of context switch issues
     * @param data Analysis data
     * @returns Array of identified root causes
     */
    private identifyRootCauses(data: {
        rate: number;
        involuntaryRatio: number;
        metrics: PerformanceMetrics[];
    }): string[] {
        const causes: string[] = [];

        // Check for high CPU utilization
        const cpuUtilization = this.getAverageCpuUtilization(data.metrics);
        if (cpuUtilization > 85) {
            causes.push(`High CPU utilization (${cpuUtilization.toFixed(1)}%) causing scheduling contention`);
        }

        // Check for excessive thread count
        const threadCount = this.getAverageThreadCount(data.metrics);
        const cpuCores = this.getEstimatedCoreCount();
        if (threadCount > cpuCores * 5) {
            causes.push(`Excessive thread count (${threadCount}) relative to available cores (${cpuCores})`);
        }

        // Check for high involuntary context switches
        if (data.involuntaryRatio > this.HIGH_INVOLUNTARY_RATIO) {
            causes.push(`High proportion of involuntary context switches (${(data.involuntaryRatio * 100).toFixed(1)}%) indicating CPU contention`);
        }

        // Check for I/O bound workload
        if (data.rate > this.MEDIUM_RATE_THRESHOLD && data.involuntaryRatio < 0.4) {
            causes.push('High voluntary context switch rate suggesting I/O bound or lock-heavy workload');
        }

        // If no specific causes identified, add a general one
        if (causes.length === 0) {
            if (data.rate > this.HIGH_RATE_THRESHOLD) {
                causes.push(`Extremely high context switch rate (${Math.round(data.rate)}/s) indicating system-level scheduling issues`);
            }
        }

        return causes;
    }

    /**
     * Generates recommendations based on context switch analysis
     * @param analysis Context switch analysis data
     * @returns Array of recommendations
     */
    private generateRecommendations(analysis: {
        rate: number;
        involuntaryRatio: number;
        impact: number;
        isProblematic: boolean;
        rootCauses: string[];
    }): string[] {
        const recommendations: string[] = [];

        if (!analysis.isProblematic) {
            if (analysis.rate > this.MEDIUM_RATE_THRESHOLD * 0.7) {
                recommendations.push(`Context switch rate (${Math.round(analysis.rate)}/s) is approaching concerning levels. Monitor for increases.`);
            } else {
                recommendations.push('Context switch rates are within acceptable ranges. No action needed.');
            }
            return recommendations;
        }

        // General recommendations for high context switch rates
        if (analysis.rate > this.HIGH_RATE_THRESHOLD) {
            recommendations.push('Reduce the number of active threads to minimize scheduling overhead.');
            recommendations.push('Consider implementing work batching to reduce context switch frequency.');
        }

        // Recommendations for high involuntary ratio
        if (analysis.involuntaryRatio > this.HIGH_INVOLUNTARY_RATIO) {
            recommendations.push('Optimize CPU-bound operations to reduce time slice exhaustion.');
            recommendations.push('Consider increasing process/thread priority for critical components.');
        }

        // Recommendations for voluntary-dominated switching
        if (analysis.rate > this.MEDIUM_RATE_THRESHOLD && analysis.involuntaryRatio < 0.4) {
            recommendations.push('Optimize I/O operations to reduce voluntary context switches.');
            recommendations.push('Review lock acquisition patterns to reduce contention.');
            recommendations.push('Consider asynchronous processing for I/O-bound operations.');
        }

        // Add specific recommendations based on root causes
        if (analysis.rootCauses.some(cause => cause.includes('CPU utilization'))) {
            recommendations.push('Optimize CPU-intensive tasks or add more CPU resources.');
        }

        if (analysis.rootCauses.some(cause => cause.includes('thread count'))) {
            recommendations.push('Implement or optimize thread pooling with size based on available cores.');
        }

        return recommendations;
    }

    /**
     * Gets average CPU utilization from metrics
     * @param metrics Performance metrics
     * @returns Average CPU utilization
     */
    private getAverageCpuUtilization(metrics: PerformanceMetrics[]): number {
        const values = metrics
            .filter(m => m.cpu && typeof m.cpu.utilization === 'number')
            .map(m => m.cpu!.utilization);

        return this.calculateAverage(values);
    }

    /**
     * Gets average thread count from metrics
     * @param metrics Performance metrics
     * @returns Average thread count
     */
    private getAverageThreadCount(metrics: PerformanceMetrics[]): number {
        const values = metrics
            .filter(m => m.thread && typeof m.thread.count === 'number')
            .map(m => m.thread!.count);

        return this.calculateAverage(values);
    }

    /**
     * Gets an estimate of available CPU cores
     * @returns Estimated number of CPU cores
     */
    private getEstimatedCoreCount(): number {
        try {
            // In Node.js environment
            if (typeof process !== 'undefined' && process.env) {
                return os.cpus().length;
            }
        } catch {
            // Ignore errors, underscore used to indicate unused variable
        }

        // Fallback to a reasonable default
        return 4;
    }
}