// src/ai/api/distributed/monitoring/health/checks/CPUHealthCheck.ts
import { BaseHealthCheck } from './BaseHealthCheck';
import { HealthCheckOptions, HealthCheckResult } from '../types/health.types';
// Import os module statiquement
import * as os from 'os';

/**
 * Options specific to CPU health check
 */
export interface CPUHealthCheckOptions extends HealthCheckOptions {
    /** CPU utilization threshold for warning (percent, 0-100) */
    warningThreshold?: number;

    /** CPU utilization threshold for critical (percent, 0-100) */
    criticalThreshold?: number;

    /** Load average threshold for warning */
    loadWarningThreshold?: number;

    /** Load average threshold for critical */
    loadCriticalThreshold?: number;
}

/**
 * Structure de la CPU et ses temps d'exécution
 */
interface CPUInfo {
    model: string;
    speed: number;
    times: {
        user: number;
        nice: number;
        sys: number;
        idle: number;
        irq: number;
    };
}

/**
 * Health check for CPU utilization and load
 */
export class CPUHealthCheck extends BaseHealthCheck {
    private readonly warningThreshold: number;
    private readonly criticalThreshold: number;
    private readonly loadWarningThreshold: number;
    private readonly loadCriticalThreshold: number;

    /**
     * Create a new CPU health check
     * @param options Configuration options
     */
    constructor(options?: CPUHealthCheckOptions) {
        super(
            'cpu',
            'CPU Utilization',
            'Monitors CPU utilization and load average',
            options
        );

        this.warningThreshold = options?.warningThreshold ?? 80; // 80% warning
        this.criticalThreshold = options?.criticalThreshold ?? 90; // 90% critical

        // Load average thresholds default to core count
        const cpuCount = this.getCpuCount();
        this.loadWarningThreshold = options?.loadWarningThreshold ?? cpuCount * 0.8;
        this.loadCriticalThreshold = options?.loadCriticalThreshold ?? cpuCount * 1.0;
    }

    /**
     * Perform the CPU health check
     * @returns Health check result
     */
    protected async performCheck(): Promise<HealthCheckResult> {
        try {
            // Get CPU metrics
            const cpuMetrics = await this.getCpuMetrics();

            // Check CPU utilization
            if (cpuMetrics.utilization >= this.criticalThreshold) {
                return this.createResult(
                    'critical',
                    `CPU utilization is critical: ${cpuMetrics.utilization.toFixed(1)}%`,
                    {
                        utilization: cpuMetrics.utilization,
                        loadAverage: cpuMetrics.loadAverage,
                        cores: cpuMetrics.cores
                    },
                    [
                        'Identify and terminate CPU-intensive processes',
                        'Scale up CPU resources if possible',
                        'Add more nodes to distribute load'
                    ]
                );
            }

            if (cpuMetrics.utilization >= this.warningThreshold) {
                return this.createResult(
                    'warning',
                    `CPU utilization is high: ${cpuMetrics.utilization.toFixed(1)}%`,
                    {
                        utilization: cpuMetrics.utilization,
                        loadAverage: cpuMetrics.loadAverage,
                        cores: cpuMetrics.cores
                    },
                    [
                        'Monitor for further increases',
                        'Check for abnormal CPU usage patterns',
                        'Consider optimizing CPU-intensive tasks'
                    ]
                );
            }

            // Check load average if available
            if (cpuMetrics.loadAverage && cpuMetrics.loadAverage[0] >= this.loadCriticalThreshold) {
                return this.createResult(
                    'critical',
                    `CPU load average is critical: ${cpuMetrics.loadAverage[0].toFixed(2)}`,
                    {
                        utilization: cpuMetrics.utilization,
                        loadAverage: cpuMetrics.loadAverage,
                        cores: cpuMetrics.cores
                    },
                    [
                        'Identify processes causing high load',
                        'Check for I/O bottlenecks',
                        'Consider adding more CPU resources'
                    ]
                );
            }

            if (cpuMetrics.loadAverage && cpuMetrics.loadAverage[0] >= this.loadWarningThreshold) {
                return this.createResult(
                    'warning',
                    `CPU load average is high: ${cpuMetrics.loadAverage[0].toFixed(2)}`,
                    {
                        utilization: cpuMetrics.utilization,
                        loadAverage: cpuMetrics.loadAverage,
                        cores: cpuMetrics.cores
                    },
                    [
                        'Monitor for further increases',
                        'Prepare for potential scaling if load continues to rise'
                    ]
                );
            }

            // All is well
            return this.createResult(
                'healthy',
                `CPU utilization is normal: ${cpuMetrics.utilization.toFixed(1)}%`,
                {
                    utilization: cpuMetrics.utilization,
                    loadAverage: cpuMetrics.loadAverage,
                    cores: cpuMetrics.cores
                }
            );
        } catch (error) {
            this.logger.error('Failed to check CPU health', error);
            return this.createResult(
                'critical',
                `Failed to check CPU health: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Get current CPU metrics
     * @returns CPU metrics
     */
    private async getCpuMetrics(): Promise<{
        utilization: number;
        loadAverage?: [number, number, number];
        cores: number;
    }> {
        try {
            if (typeof process !== 'undefined' && process.env) {
                // Node.js environment
                // Get CPU count
                const cpuCount = os.cpus().length;

                // Get load average (if available)
                const loadAverage = os.loadavg() as [number, number, number];

                // Calculate CPU utilization (use cpu-stat or similar in real implementation)
                // This is a simplified approach that just estimates utilization
                const cpuInfo = os.cpus();
                const totalIdle = cpuInfo.reduce((acc: number, cpu: CPUInfo) => acc + cpu.times.idle, 0);
                const totalTick = cpuInfo.reduce((acc: number, cpu: CPUInfo) =>
                    acc + cpu.times.idle + cpu.times.user + cpu.times.sys + cpu.times.nice + cpu.times.irq, 0);

                // Simple estimation - for production, use proper CPU monitoring
                const utilization = 100 - (totalIdle / totalTick * 100);

                return {
                    utilization,
                    loadAverage,
                    cores: cpuCount
                };
            }

            // Browser or other environment - simulate metrics for demo
            return {
                utilization: Math.random() * 100,
                cores: 4
            };
        } catch (error) {
            this.logger.error('Error getting CPU metrics', error);

            // Fallback to simulated values
            return {
                utilization: 50, // Assume 50% utilization
                cores: this.getCpuCount()
            };
        }
    }

    /**
     * Get the number of CPU cores
     * @returns Number of CPU cores
     */
    private getCpuCount(): number {
        try {
            if (typeof process !== 'undefined' && process.env) {
                return os.cpus().length;
            }

            // Browser environment - use navigator.hardwareConcurrency if available
            if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
                return navigator.hardwareConcurrency;
            }

            // Fallback
            return 4;
        } catch {
            // Ignorer les erreurs
            return 4; // Default to 4 cores
        }
    }
}