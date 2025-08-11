// src/ai/api/distributed/monitoring/analysis/MemoryLeakDetector.ts
import { Logger } from '@api/common/monitoring/LogService';
import {
    CircularBuffer,
    MemorySnapshot,
    MemoryMetrics,
    MemoryLeak,
    GrowthTrend,
    LeakLocation,
    LeakSeverity
} from '../types/memory.types';
import * as os from 'os';

// Heap profile structure
interface HeapNode {
    id: number;
    name: string;
    type: string;
    size: number;
    retainedSize: number;
    children: number[];
    references?: number[];
    module?: string;
}

interface HeapProfile {
    nodes: HeapNode[];
    edges: Array<{ from: number; to: number; type: string }>;
    timestamps: {
        startTime: number;
        endTime: number;
    };
}

interface DominatorInfo {
    node: HeapNode;
    retainedSize: number;
    growth: number;
    instances: number;
}

/**
 * Detects memory leaks by analyzing memory usage patterns over time
 */
export class MemoryLeakDetector {
    private readonly logger: Logger;
    private readonly history: CircularBuffer<MemorySnapshot>;
    private readonly growthThreshold = 0.05; // 5% growth
    private readonly analysisWindow = 3600000; // 1 hour
    private readonly historySize = 120; // Keep 120 snapshots
    private lastNotificationTime = 0;
    private notificationCooldown = 3600000; // 1 hour between notifications

    constructor() {
        this.logger = new Logger('MemoryLeakDetector');
        this.history = new CircularBuffer<MemorySnapshot>(this.historySize);
    }

    /**
     * Analyzes current memory metrics to detect potential memory leaks
     * @param currentMetrics Current memory metrics
     * @returns Memory leak information if detected, null otherwise
     */
    async analyze(currentMetrics: MemoryMetrics): Promise<MemoryLeak | null> {
        this.logger.debug('Analyzing memory metrics for leaks', {
            heapUsed: currentMetrics.heap.used,
            rss: currentMetrics.rss
        });

        this.history.push(this.createSnapshot(currentMetrics));
        const trend = await this.analyzeGrowthTrend();

        if (this.isLeakPattern(trend)) {
            // Check cooldown to avoid too frequent notifications
            const now = Date.now();
            if (now - this.lastNotificationTime < this.notificationCooldown) {
                this.logger.debug('Memory leak detected but in notification cooldown period');
                return null;
            }

            this.lastNotificationTime = now;
            const severity = this.calculateSeverity(trend);

            this.logger.warn('Memory leak detected', {
                severity,
                growthRate: `${(trend.slope * 3600000 / (1024 * 1024)).toFixed(2)} MB/hour`,
                confidence: trend.confidence
            });

            const location = await this.identifyLeakLocation(trend);

            return {
                type: 'MEMORY_LEAK',
                severity,
                location,
                trend,
                recommendations: this.generateRecommendations(trend, severity)
            };
        }

        this.logger.debug('No memory leak pattern detected');
        return null;
    }

    /**
     * Creates a memory snapshot from current metrics
     * @param metrics Current memory metrics
     * @returns Memory snapshot
     */
    private createSnapshot(metrics: MemoryMetrics): MemorySnapshot {
        return {
            timestamp: Date.now(),
            heapUsed: metrics.heap.used,
            heapTotal: metrics.heap.total,
            external: metrics.external || 0,
            rss: metrics.rss,
            arrayBuffers: metrics.arrayBuffers,
            gcInfo: metrics.gcMetrics ? {
                majorGCs: 0, // These details may not be available in metrics
                minorGCs: 0,
                incrementalGCs: 0
            } : undefined
        };
    }

    /**
     * Analyzes growth trend in memory usage
     * @returns Growth trend analysis
     */
    private async analyzeGrowthTrend(): Promise<GrowthTrend> {
        const snapshots = this.history.toArray();
        if (snapshots.length < 3) {
            return {
                slope: 0,
                confidence: 0,
                sustainedGrowth: {
                    duration: 0,
                    percentage: 0,
                    steady: false
                }
            };
        }

        const regressionResult = this.performLinearRegression(snapshots);
        const sustainedGrowth = this.calculateSustainedGrowth(snapshots);

        return {
            slope: regressionResult.slope,
            confidence: regressionResult.r2,
            sustainedGrowth
        };
    }

    /**
     * Performs linear regression on heap usage to detect growth trends
     * @param snapshots Array of memory snapshots
     * @returns Regression results including slope and R² value
     */
    private performLinearRegression(snapshots: MemorySnapshot[]): { slope: number, intercept: number, r2: number } {
        // Skip if we don't have enough data points
        if (snapshots.length < 2) {
            return { slope: 0, intercept: 0, r2: 0 };
        }

        // Extract x (time) and y (heap used) values
        const x: number[] = snapshots.map(s => s.timestamp);
        const y: number[] = snapshots.map(s => s.heapUsed);

        // Calculate means
        const n = x.length;
        const xMean = x.reduce((sum, val) => sum + val, 0) / n;
        const yMean = y.reduce((sum, val) => sum + val, 0) / n;

        // Calculate slope and intercept using least squares method
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (x[i] - xMean) * (y[i] - yMean);
            denominator += (x[i] - xMean) ** 2;
        }

        // Avoid division by zero
        if (denominator === 0) {
            return { slope: 0, intercept: yMean, r2: 0 };
        }

        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;

        // Calculate R-squared
        const yPredicted = x.map(xVal => slope * xVal + intercept);
        const ssTotal = y.reduce((sum, yVal) => sum + (yVal - yMean) ** 2, 0);
        const ssResidual = y.reduce((sum, yVal, i) => sum + (yVal - yPredicted[i]) ** 2, 0);
        const r2 = 1 - (ssResidual / ssTotal);

        return { slope, intercept, r2 };
    }

    /**
     * Calculates sustained growth metrics from memory snapshots
     * @param snapshots Array of memory snapshots
     * @returns Sustained growth metrics
     */
    private calculateSustainedGrowth(snapshots: MemorySnapshot[]): GrowthTrend['sustainedGrowth'] {
        if (snapshots.length < 2) {
            return { duration: 0, percentage: 0, steady: false };
        }

        // Sort snapshots by timestamp (oldest first)
        const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

        // Calculate duration
        const duration = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;

        // Calculate total growth percentage
        const startHeap = sorted[0].heapUsed;
        const endHeap = sorted[sorted.length - 1].heapUsed;
        const growthPercentage = (endHeap - startHeap) / startHeap;

        // Check if growth is steady
        // We'll calculate the coefficient of variation of growth rates between snapshots
        const growthRates: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
            const timeInterval = sorted[i].timestamp - sorted[i - 1].timestamp;
            if (timeInterval > 0) {
                const growthRate = (sorted[i].heapUsed - sorted[i - 1].heapUsed) / timeInterval;
                growthRates.push(growthRate);
            }
        }

        // Calculate coefficient of variation (CV) to measure steadiness
        // Lower CV means more steady growth
        let steady = false;
        if (growthRates.length > 1) {
            const mean = growthRates.reduce((sum, val) => sum + val, 0) / growthRates.length;
            const variance = growthRates.reduce((sum, val) => sum + (val - mean) ** 2, 0) / growthRates.length;
            const stdDev = Math.sqrt(variance);
            const cv = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;

            // A CV less than 0.5 indicates relatively steady growth
            steady = cv < 0.5;
        }

        return {
            duration,
            percentage: growthPercentage,
            steady
        };
    }

    /**
     * Determines if the growth trend indicates a memory leak pattern
     * @param trend Growth trend analysis
     * @returns Whether the pattern indicates a memory leak
     */
    private isLeakPattern(trend: GrowthTrend): boolean {
        // Check if we have enough data
        if (trend.confidence === 0) {
            return false;
        }

        // If the growth rate (slope) is positive and significant
        const significantSlope = trend.slope > 0.1; // At least 0.1 bytes/ms (360KB/hour)

        // If the growth has been sustained for a significant period
        const significantDuration = trend.sustainedGrowth.duration >= this.analysisWindow / 3; // At least 1/3 of the analysis window

        // If the total growth percentage exceeds our threshold
        const significantGrowth = trend.sustainedGrowth.percentage >= this.growthThreshold;

        // If the confidence in the linear regression is high enough
        const highConfidence = trend.confidence >= 0.6; // R² at least 0.6

        // Memory leak is detected when growth is significant, sustained, and consistent
        return significantSlope && significantDuration && significantGrowth && highConfidence;
    }

    /**
     * Calculates the severity of the detected memory leak
     * @param trend Growth trend analysis
     * @returns Severity level of the leak
     */
    private calculateSeverity(trend: GrowthTrend): LeakSeverity {
        // Calculate hourly growth rate in MB
        const hourlyGrowthMB = trend.slope * 3600000 / (1024 * 1024);

        // Calculate days until heap would reach critical level
        // Assuming critical level is 80% of the heap limit (typical Node.js heap limit is ~1.4GB)
        const assumedHeapLimit = 1.4 * 1024; // 1.4GB in MB
        const latestSnapshot = this.history.toArray().slice(-1)[0];
        const currentUsageMB = latestSnapshot ? latestSnapshot.heapUsed / (1024 * 1024) : 0;
        const remainingHeapMB = 0.8 * assumedHeapLimit - currentUsageMB;

        // Calculate days until critical
        const daysUntilCritical = hourlyGrowthMB > 0
            ? remainingHeapMB / (hourlyGrowthMB * 24)
            : Number.POSITIVE_INFINITY;

        // Determine severity based on growth rate and time until critical
        if (daysUntilCritical <= 1 || hourlyGrowthMB > 50) {
            return LeakSeverity.CRITICAL;
        } else if (daysUntilCritical <= 3 || hourlyGrowthMB > 20) {
            return LeakSeverity.HIGH;
        } else if (daysUntilCritical <= 7 || hourlyGrowthMB > 5) {
            return LeakSeverity.MEDIUM;
        } else {
            return LeakSeverity.LOW;
        }
    }

    /**
     * Attempts to identify the location of the memory leak
     * @param trend Growth trend analysis
     * @returns Information about the likely leak location
     */
    private async identifyLeakLocation(trend: GrowthTrend): Promise<LeakLocation> {
        try {
            // Attempt to capture heap profile (if available)
            const heapProfile = await this.captureHeapProfile();

            if (heapProfile) {
                // Analyze dominator tree to find potential leak objects
                const dominators = this.analyzeDominatorTree(heapProfile);

                // Find most likely leak source
                return this.findLeakSource(dominators, trend);
            }

            // Fallback when heap profiling is not available
            return this.createGenericLeakLocation(trend);
        } catch (error) {
            this.logger.error('Failed to identify leak location', error);
            return this.createGenericLeakLocation(trend);
        }
    }

    /**
     * Creates a generic leak location when detailed heap analysis is not available
     * @param trend Growth trend analysis
     * @returns Generic leak location information
     */
    private createGenericLeakLocation(trend: GrowthTrend): LeakLocation {
        return {
            module: 'unknown',
            type: 'unknown',
            size: 0,
            instances: 0,
            retainedSize: 0,
            growth: trend.sustainedGrowth.percentage * 100
        };
    }

    /**
     * Attempts to capture a heap profile (if supported by the environment)
     * @returns Heap profile or null if not supported
     */
    private async captureHeapProfile(): Promise<HeapProfile | null> {
        try {
            // Check if we're in a Node.js environment with heap profiling capabilities
            if (typeof process !== 'undefined' && process.env) {
                // This would use a heap profiler like v8-profiler-next in a real implementation
                this.logger.debug('Heap profiling not implemented');
                return null;
            }

            return null;
        } catch {
            this.logger.error('Failed to capture heap profile');
            return null;
        }
    }

    /**
     * Analyzes the dominator tree to identify memory-heavy objects
     * @param heapProfile Heap profile snapshot
     * @returns Analysis of dominator tree or null if not available
     */
    private analyzeDominatorTree(heapProfile: HeapProfile | null): DominatorInfo[] | null {
        if (!heapProfile) {
            return null;
        }

        // In a real implementation, this would analyze the heap snapshot
        // to find objects that dominate large portions of the heap
        this.logger.debug('Dominator tree analysis not implemented');
        return null;
    }

    /**
     * Identifies the most likely source of a memory leak
     * @param dominators Dominator tree analysis
     * @param trend Growth trend analysis
     * @returns Information about the likely leak source
     */
    private findLeakSource(dominators: DominatorInfo[] | null, trend: GrowthTrend): LeakLocation {
        if (!dominators) {
            return this.createGenericLeakLocation(trend);
        }

        // In a real implementation, this would analyze the dominators
        // to find the most likely source of the leak based on growth patterns
        // and retention paths

        // For now, return a generic location
        return this.createGenericLeakLocation(trend);
    }

    /**
     * Generates recommendations for addressing the memory leak
     * @param trend Growth trend analysis
     * @param severity Leak severity
     * @returns Array of recommendations
     */
    private generateRecommendations(trend: GrowthTrend, severity: LeakSeverity): string[] {
        const recommendations: string[] = [];

        // General recommendations
        recommendations.push('Monitor memory usage trends closely over the next 24 hours.');

        // Add severity-specific recommendations
        if (severity === LeakSeverity.CRITICAL || severity === LeakSeverity.HIGH) {
            recommendations.push('Consider restarting the service as a temporary mitigation.');
            recommendations.push('Implement memory usage alerts to detect future issues.');
        }

        if (trend.sustainedGrowth.steady) {
            recommendations.push('Look for objects being continuously created but not garbage collected.');
            recommendations.push('Check for event listeners that are not being properly removed.');
        }

        // Add recommendations for specific types of leaks
        recommendations.push('Review code for common memory leak patterns:');
        recommendations.push('- Closures retaining references to large objects');
        recommendations.push('- Event listeners not being properly removed');
        recommendations.push('- Caches without size limits or TTL');
        recommendations.push('- Circular references preventing garbage collection');

        return recommendations;
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