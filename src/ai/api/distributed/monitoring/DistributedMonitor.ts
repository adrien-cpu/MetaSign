// src/ai/api/distributed/monitoring/DistributedMonitor.ts
export class DistributedMonitor {
    private metricsCollector: DistributedMetricsCollector;
    private healthChecker: DistributedHealthChecker;

    async monitorDistributedSystem(): Promise<DistributedMetrics> {
        const [metrics, health] = await Promise.all([
            this.metricsCollector.collect(),
            this.healthChecker.check()
        ]);

        return this.aggregateMetrics(metrics, health);
    }

    private aggregateMetrics(metrics: NodeMetrics[], health: HealthStatus): DistributedMetrics {
        return {
            nodes: metrics,
            systemHealth: health,
            timestamp: Date.now(),
            aggregates: this.calculateAggregates(metrics)
        };
    }
}