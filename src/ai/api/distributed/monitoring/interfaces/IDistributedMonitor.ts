// src/ai/api/distributed/monitoring/interfaces/IDistributedMonitor.ts

/**
 * Interface for distributed monitoring functionality
 */
export interface IDistributedMonitor {
    /**
     * Add a health check callback function
     * @param callback The callback function that returns a health status
     */
    addHealthCheckCallback(callback: () => Promise<boolean>): void;

    /**
     * Start the monitoring process
     */
    startMonitoring(): void;

    /**
     * Stop the monitoring process
     */
    stopMonitoring(): Promise<void>;
}
