// src/ai/managers/interfaces/IPerformanceMonitor.ts

/**
 * Interface for performance tracker
 */
export interface IPerformanceTracker {
    /**
     * Stop the performance tracking
     */
    stop(): void;

    /**
     * Get the duration of the tracked operation
     * @returns Duration in milliseconds
     */
    getDuration(): number;
}

/**
 * Interface for performance monitoring
 */
export interface IPerformanceMonitor {
    /**
     * Start tracking a performance operation
     * @param operationName Name of the operation to track
     * @returns Performance tracker instance
     */
    startTracking(operationName: string): IPerformanceTracker;
}