// Example usage of the DistributedHealthChecker

import {
    DistributedHealthChecker,
    CPUHealthCheck,
    MemoryHealthCheck,
    HealthStatus
} from '@api/distributed/monitoring/health';

// Create custom health checks by extending BaseHealthCheck
import { BaseHealthCheck } from '@api/distributed/monitoring/health';
import { HealthCheckResult } from '@api/distributed/monitoring/health';

class DatabaseHealthCheck extends BaseHealthCheck {
    constructor() {
        super(
            'database',
            'Database Connection',
            'Checks database connectivity and response time'
        );
    }

    protected async performCheck(): Promise<HealthCheckResult> {
        try {
            // Simulate database check
            const connectionTime = await this.checkDatabaseConnection();

            if (connectionTime > 500) {
                return this.createResult(
                    'warning',
                    `Database response time is slow: ${connectionTime}ms`,
                    { connectionTime }
                );
            }

            return this.createResult(
                'healthy',
                `Database connection is healthy: ${connectionTime}ms`,
                { connectionTime }
            );
        } catch (error) {
            return this.createResult(
                'critical',
                `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    private async checkDatabaseConnection(): Promise<number> {
        // Simulate database connection check
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.random() * 1000);
            }, 50);
        });
    }
}

// Initialize the health checker with options
const healthChecker = new DistributedHealthChecker({
    globalTimeout: 10000,           // 10 second timeout for all checks
    parallelChecks: true,           // Run checks in parallel
    maxConcurrentChecks: 5,         // Max 5 concurrent checks
    retryFailedChecks: true,        // Retry failed checks
    maxRetryAttempts: 2             // Max 2 retry attempts
});

// Register multiple health checks
healthChecker
    .registerCheck(new CPUHealthCheck({
        warningThreshold: 75,         // Customize thresholds
        criticalThreshold: 90
    }))
    .registerCheck(new MemoryHealthCheck({
        tags: ['resources', 'memory']  // Add tags for filtering
    }))
    .registerCheck(new DatabaseHealthCheck());

// Set up a status change handler
healthChecker.setStatusChangeHandler((status: HealthStatus) => {
    console.log(`System health changed to: ${status.status}`);

    if (status.status === 'critical') {
        // Send alerts, trigger automated recovery, etc.
        console.log('ALERT: Critical system health status detected!');
        console.log('Critical checks:', status.criticalChecks);
    }
});

// Periodic health checking
async function monitorHealth() {
    try {
        const healthStatus = await healthChecker.check();

        console.log(`System health: ${healthStatus.status}`);
        console.log(`Checks executed: ${healthStatus.checks.length}`);
        console.log(`Execution time: ${healthStatus.executionTime}ms`);

        // Log details of any non-healthy checks
        const nonHealthyChecks = healthStatus.checks.filter(c => c.status !== 'healthy');
        if (nonHealthyChecks.length > 0) {
            console.log('Non-healthy checks:', nonHealthyChecks);
        }

        // Schedule next check
        setTimeout(monitorHealth, 60000); // Check every minute
    } catch (error) {
        console.error('Health monitoring error:', error);

        // Even on error, continue monitoring
        setTimeout(monitorHealth, 60000);
    }
}

// Start health monitoring
monitorHealth();