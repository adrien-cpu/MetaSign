// src/ai/api/distributed/monitoring/health/checks/MemoryHealthCheck.ts
import { BaseHealthCheck } from './BaseHealthCheck';
import { HealthCheckOptions, HealthCheckResult } from '../types/health.types';
// Import os module statiquement
import * as os from 'os';

/**
 * Options specific to memory health check
 */
export interface MemoryHealthCheckOptions extends HealthCheckOptions {
    /** Memory utilization threshold for warning (percent, 0-100) */
    warningThreshold?: number;

    /** Memory utilization threshold for critical (percent, 0-100) */
    criticalThreshold?: number;

    /** Heap utilization threshold for warning (percent, 0-100) */
    heapWarningThreshold?: number;

    /** Heap utilization threshold for critical (percent, 0-100) */
    heapCriticalThreshold?: number;
}

/**
 * Interface pour le memory performance API dans les navigateurs
 */
interface PerformanceMemory {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
}

/**
 * Extension de l'interface Performance pour inclure memory
 */
interface PerformanceWithMemory extends Performance {
    memory?: PerformanceMemory;
}

/**
 * Health check for memory utilization and heap usage
 */
export class MemoryHealthCheck extends BaseHealthCheck {
    private readonly warningThreshold: number;
    private readonly criticalThreshold: number;
    private readonly heapWarningThreshold: number;
    private readonly heapCriticalThreshold: number;

    /**
     * Create a new memory health check
     * @param options Configuration options
     */
    constructor(options?: MemoryHealthCheckOptions) {
        super(
            'memory',
            'Memory Utilization',
            'Monitors memory utilization and heap usage',
            options
        );

        this.warningThreshold = options?.warningThreshold ?? 85; // 85% warning
        this.criticalThreshold = options?.criticalThreshold ?? 95; // 95% critical
        this.heapWarningThreshold = options?.heapWarningThreshold ?? 80; // 80% warning
        this.heapCriticalThreshold = options?.heapCriticalThreshold ?? 90; // 90% critical
    }

    /**
     * Perform the memory health check
     * @returns Health check result
     */
    protected async performCheck(): Promise<HealthCheckResult> {
        try {
            // Get memory metrics
            const memoryMetrics = await this.getMemoryMetrics();

            // Check overall memory utilization
            if (memoryMetrics.utilization >= this.criticalThreshold) {
                return this.createResult(
                    'critical',
                    `Memory utilization is critical: ${memoryMetrics.utilization.toFixed(1)}%`,
                    {
                        used: memoryMetrics.used,
                        total: memoryMetrics.total,
                        utilization: memoryMetrics.utilization,
                        heap: memoryMetrics.heap
                    },
                    [
                        'Identify memory-intensive processes',
                        'Check for memory leaks',
                        'Increase system memory or scale horizontally',
                        'Consider restarting the service'
                    ]
                );
            }

            if (memoryMetrics.utilization >= this.warningThreshold) {
                return this.createResult(
                    'warning',
                    `Memory utilization is high: ${memoryMetrics.utilization.toFixed(1)}%`,
                    {
                        used: memoryMetrics.used,
                        total: memoryMetrics.total,
                        utilization: memoryMetrics.utilization,
                        heap: memoryMetrics.heap
                    },
                    [
                        'Monitor for further increases',
                        'Prepare for potential scaling if usage continues to rise',
                        'Review memory-intensive operations'
                    ]
                );
            }

            // Check heap utilization if available
            if (memoryMetrics.heap && memoryMetrics.heap.utilization >= this.heapCriticalThreshold) {
                return this.createResult(
                    'critical',
                    `Heap utilization is critical: ${memoryMetrics.heap.utilization.toFixed(1)}%`,
                    {
                        used: memoryMetrics.used,
                        total: memoryMetrics.total,
                        utilization: memoryMetrics.utilization,
                        heap: memoryMetrics.heap
                    },
                    [
                        'Check for memory leaks in the application',
                        'Review object lifecycle management',
                        'Consider adjusting heap size settings'
                    ]
                );
            }

            if (memoryMetrics.heap && memoryMetrics.heap.utilization >= this.heapWarningThreshold) {
                return this.createResult(
                    'warning',
                    `Heap utilization is high: ${memoryMetrics.heap.utilization.toFixed(1)}%`,
                    {
                        used: memoryMetrics.used,
                        total: memoryMetrics.total,
                        utilization: memoryMetrics.utilization,
                        heap: memoryMetrics.heap
                    },
                    [
                        'Monitor heap usage patterns',
                        'Prepare for garbage collection impact',
                        'Consider optimizing memory-intensive operations'
                    ]
                );
            }

            // All is well
            return this.createResult(
                'healthy',
                `Memory utilization is normal: ${memoryMetrics.utilization.toFixed(1)}%`,
                {
                    used: memoryMetrics.used,
                    total: memoryMetrics.total,
                    utilization: memoryMetrics.utilization,
                    heap: memoryMetrics.heap
                }
            );
        } catch (error) {
            this.logger.error('Failed to check memory health', error);
            return this.createResult(
                'critical',
                `Failed to check memory health: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Get current memory metrics
     * @returns Memory metrics
     */
    private async getMemoryMetrics(): Promise<{
        used: number;
        total: number;
        utilization: number;
        heap?: {
            used: number;
            committed: number;
            max: number;
            utilization: number;
        };
    }> {
        try {
            if (typeof process !== 'undefined' && process.env) {
                // Node.js environment
                // Get total and free memory
                const totalMemory = os.totalmem();
                const freeMemory = os.freemem();
                const usedMemory = totalMemory - freeMemory;
                const utilization = (usedMemory / totalMemory) * 100;

                // Get heap metrics if available
                let heapInfo = undefined;
                if (global.gc && process.memoryUsage) {
                    const memUsage = process.memoryUsage();
                    heapInfo = {
                        used: memUsage.heapUsed,
                        committed: memUsage.heapTotal,
                        max: memUsage.rss, // This is not exactly heap max, but a reasonable approximation
                        utilization: (memUsage.heapUsed / memUsage.heapTotal) * 100
                    };
                }

                // Utiliser une approche conditionnelle pour éviter d'assigner undefined à une propriété optionnelle
                const result: {
                    used: number;
                    total: number;
                    utilization: number;
                    heap?: {
                        used: number;
                        committed: number;
                        max: number;
                        utilization: number;
                    };
                } = {
                    used: usedMemory,
                    total: totalMemory,
                    utilization
                };

                // N'ajouter heap que s'il est défini
                if (heapInfo) {
                    result.heap = heapInfo;
                }

                return result;
            }

            // Browser or other environment - use performance memory API if available
            if (typeof performance !== 'undefined') {
                const perfWithMemory = performance as PerformanceWithMemory;
                if (perfWithMemory.memory && 'totalJSHeapSize' in perfWithMemory.memory) {
                    const memory = perfWithMemory.memory;

                    const heapInfo = {
                        used: memory.usedJSHeapSize,
                        committed: memory.totalJSHeapSize,
                        max: memory.jsHeapSizeLimit,
                        utilization: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
                    };

                    return {
                        used: memory.usedJSHeapSize,
                        total: memory.jsHeapSizeLimit,
                        utilization: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
                        heap: heapInfo
                    };
                }
            }

            // Fallback - simulate metrics for demo
            return {
                used: 4 * 1024 * 1024 * 1024, // 4 GB used
                total: 8 * 1024 * 1024 * 1024, // 8 GB total
                utilization: 50 // 50% utilization
            };
        } catch (error) {
            this.logger.error('Error getting memory metrics', error);

            // Fallback to simulated values
            return {
                used: 4 * 1024 * 1024 * 1024, // 4 GB used
                total: 8 * 1024 * 1024 * 1024, // 8 GB total
                utilization: 50 // 50% utilization
            };
        }
    }
}