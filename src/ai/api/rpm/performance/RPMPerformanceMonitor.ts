// src/ai/api/rpm/performance/RPMPerformanceMonitor.ts
export class RPMPerformanceMonitor {
    private readonly metricsBatcher: MetricsBatcher;
    private readonly performanceAnalyzer: PerformanceAnalyzer;

    async collectRealTimeMetrics(): Promise<RPMMetrics> {
        const batchedMetrics = await this.metricsBatcher.getBatch();
        return this.performanceAnalyzer.analyze(batchedMetrics);
    }
}