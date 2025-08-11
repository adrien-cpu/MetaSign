// src/ai/api/rpm/RPMIntegrationManager.ts
export class RPMIntegrationManager {
    private metricsCollector: MetricsCollector;
    private anomalyDetector: AnomalyDetector;
    private performanceMonitor: RPMPerformanceMonitor;

    async monitorRealTimePerformance(): Promise<RPMMetrics> {
        const metrics = await this.performanceMonitor.collectRealTimeMetrics();
        await this.metricsCollector.addMetric(this.transformMetrics(metrics));
        return metrics;
    }

    async analyzePerformance(): Promise<RPMAnalysis> {
        const metrics = await this.monitorRealTimePerformance();
        const anomalies = await this.anomalyDetector.detectAnomalies(metrics);
        return this.createAnalysis(metrics, anomalies);
    }
}