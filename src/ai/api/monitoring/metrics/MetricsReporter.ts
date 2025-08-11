// metrics/MetricsReporter.ts
export class MetricsReporter {
    private aggregator: MetricsAggregator;s
    private alertManager: AlertManager;

    async generateReport(): Promise<MetricsReport> {
        const metrics = this.aggregator.getAggregatedMetrics();
        await this.alertManager.processMetrics(metrics);
        return this.formatReport(metrics);
    }
}