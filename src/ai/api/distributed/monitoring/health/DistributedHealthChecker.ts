// src/ai/api/distributed/monitoring/health/DistributedHealthChecker.ts
import { Logger } from '@api/common/monitoring/LogService';
import { HealthCheck, HealthCheckResult, HealthStatus, SystemStatus } from './types/health.types';

/**
 * Configuration options for DistributedHealthChecker
 */
export interface DistributedHealthCheckerOptions {
    /** How long to wait for health checks to complete (ms) */
    globalTimeout?: number;

    /** Whether to run checks in parallel or series */
    parallelChecks?: boolean;

    /** Max number of concurrent health checks when running in parallel */
    maxConcurrentChecks?: number;

    /** Auto-retry failed checks */
    retryFailedChecks?: boolean;

    /** Number of retry attempts for failed checks */
    maxRetryAttempts?: number;

    /** Delay between retry attempts (ms) */
    retryDelay?: number;

    /** Filter checks by tag for selective execution */
    filterTags?: string[];
}

/**
 * Health check manager for distributed systems
 * Manages and executes multiple health checks to provide a system-wide health status
 */
export class DistributedHealthChecker {
    private readonly logger: Logger;
    private readonly healthChecks: Map<string, HealthCheck> = new Map();
    private readonly options: Required<DistributedHealthCheckerOptions>;

    /** Callback for health status changes */
    private onStatusChange?: (status: HealthStatus) => void;

    /** Last known health status */
    private lastStatus: HealthStatus | null = null;

    /**
     * Create a new distributed health checker
     * @param options Configuration options
     */
    constructor(options: DistributedHealthCheckerOptions = {}) {
        this.logger = new Logger('DistributedHealthChecker');

        // Set default options
        this.options = {
            globalTimeout: options.globalTimeout ?? 30000, // 30 seconds default
            parallelChecks: options.parallelChecks ?? true,
            maxConcurrentChecks: options.maxConcurrentChecks ?? 10,
            retryFailedChecks: options.retryFailedChecks ?? true,
            maxRetryAttempts: options.maxRetryAttempts ?? 2,
            retryDelay: options.retryDelay ?? 1000,
            filterTags: options.filterTags ?? []
        };

        this.logger.debug('Initialized DistributedHealthChecker', { options: this.options });
    }

    /**
     * Register a health check
     * @param check Health check implementation
     * @returns The current health checker instance (for chaining)
     */
    public registerCheck(check: HealthCheck): DistributedHealthChecker {
        if (this.healthChecks.has(check.id)) {
            this.logger.warn(`Health check with ID "${check.id}" already registered. Overwriting.`);
        }

        this.healthChecks.set(check.id, check);
        this.logger.debug(`Registered health check: ${check.id}`);

        return this;
    }

    /**
     * Unregister a health check by ID
     * @param checkId ID of the health check to remove
     * @returns true if check was found and removed, false otherwise
     */
    public unregisterCheck(checkId: string): boolean {
        const result = this.healthChecks.delete(checkId);

        if (result) {
            this.logger.debug(`Unregistered health check: ${checkId}`);
        } else {
            this.logger.warn(`Attempted to unregister non-existent health check: ${checkId}`);
        }

        return result;
    }

    /**
     * Get a health check by ID
     * @param checkId ID of the health check to retrieve
     * @returns Health check instance or undefined if not found
     */
    public getCheck(checkId: string): HealthCheck | undefined {
        return this.healthChecks.get(checkId);
    }

    /**
     * Get all registered health checks
     * @param enabledOnly If true, return only enabled checks
     * @returns Array of health checks
     */
    public getAllChecks(enabledOnly: boolean = false): HealthCheck[] {
        const checks = Array.from(this.healthChecks.values());
        return enabledOnly ? checks.filter(check => check.isEnabled()) : checks;
    }

    /**
     * Perform all registered health checks and determine overall system health
     * @returns System health status
     */
    public async check(): Promise<HealthStatus> {
        const startTime = Date.now();
        this.logger.debug('Starting health check execution');

        try {
            // Get all enabled health checks
            const checks = this.getAllChecks(true);

            if (checks.length === 0) {
                this.logger.warn('No health checks available for execution');
                return this.createEmptyStatus('unknown', 'No health checks available');
            }

            // Execute all checks in parallel
            const checks_results = await Promise.all(
                checks.map(check => this.executeCheckSafely(check))
            );

            // Generate health status
            const status = this.createHealthStatus(checks_results, startTime);

            // Notify on status change if needed
            if (this.hasStatusChanged(status)) {
                this.notifyStatusChange(status);
            }

            // Update last status
            this.lastStatus = status;

            return status;
        } catch (error) {
            this.logger.error('Error executing health checks', error);

            // Create a critical status for global errors
            const errorStatus = this.createEmptyStatus(
                'critical',
                `Failed to execute health checks: ${error instanceof Error ? error.message : String(error)}`
            );

            return errorStatus;
        }
    }

    /**
     * Set callback for health status changes
     * @param callback Function to call when health status changes
     */
    public setStatusChangeHandler(callback: (status: HealthStatus) => void): void {
        this.onStatusChange = callback;
    }

    /**
     * Execute a single health check with error handling
     * @param check Health check to execute
     * @returns Result of the health check
     */
    private async executeCheckSafely(check: HealthCheck): Promise<HealthCheckResult> {
        this.logger.debug(`Executing health check: ${check.id}`);

        try {
            return await check.execute();
        } catch (error) {
            this.logger.error(`Health check "${check.id}" threw an unhandled exception`, error);

            return {
                checkId: check.id,
                status: 'critical',
                details: `Check failed with error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Determine the overall system status from health check results
     * @param checks Health check results
     * @returns Overall system status
     */
    private determineOverallStatus(checks: HealthCheckResult[]): SystemStatus {
        if (checks.some(c => c.status === 'critical')) return 'critical';
        if (checks.some(c => c.status === 'warning')) return 'warning';
        return 'healthy';
    }

    /**
     * Create a health status from check results
     * @param results Health check results
     * @param startTime When the checks started
     * @returns Health status
     */
    private createHealthStatus(results: HealthCheckResult[], startTime: number): HealthStatus {
        const status = this.determineOverallStatus(results);
        const endTime = Date.now();

        // Separate critical and warning checks
        const criticalChecks = results.filter(r => r.status === 'critical');
        const warningChecks = results.filter(r => r.status === 'warning');

        return {
            status,
            checks: results,
            timestamp: endTime,
            criticalChecks: criticalChecks.length > 0 ? criticalChecks : undefined,
            warningChecks: warningChecks.length > 0 ? warningChecks : undefined,
            executionTime: endTime - startTime
        };
    }

    /**
     * Create an empty health status with a given status and message
     * @param status System status
     * @param details Details message
     * @returns Empty health status
     */
    private createEmptyStatus(status: SystemStatus, details: string): HealthStatus {
        return {
            status,
            checks: [{
                checkId: 'system',
                status,
                details,
                timestamp: Date.now()
            }],
            timestamp: Date.now()
        };
    }

    /**
     * Check if health status has changed from previous status
     * @param currentStatus Current health status
     * @returns true if status has changed
     */
    private hasStatusChanged(currentStatus: HealthStatus): boolean {
        if (!this.lastStatus) return true;
        return this.lastStatus.status !== currentStatus.status;
    }

    /**
     * Notify subscribers of a health status change
     * @param status New health status
     */
    private notifyStatusChange(status: HealthStatus): void {
        if (this.onStatusChange) {
            try {
                this.onStatusChange(status);
            } catch (error) {
                this.logger.error('Error in status change handler', error);
            }
        }
    }
}