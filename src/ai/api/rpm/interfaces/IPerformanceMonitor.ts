// src/ai/api/rpm/interfaces/IPerformanceMonitor.ts
export interface IPerformanceMonitor {
    collectRealTimeMetrics(): Promise<RPMMetrics>;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
    getStatus(): MonitoringStatus;
}