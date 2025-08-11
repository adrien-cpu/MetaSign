// src/ai/api/rpm/analysis/PerformanceAnalyzer.ts
export class PerformanceAnalyzer {
    private readonly analysisPipeline: AnalysisPipeline;

    async analyze(batch: MetricsBatch): Promise<RPMAnalysis> {
        const enrichedMetrics = await this.enrichMetrics(batch);
        const analysis = await this.analysisPipeline.process(enrichedMetrics);
        return this.generateReport(analysis);
    }

    private async enrichMetrics(batch: MetricsBatch): Promise<EnrichedMetrics[]> {
        return Promise.all(batch.metrics.map(async metric => ({
            base: metric,
            context: await this.getMetricContext(metric),
            correlations: await this.findCorrelations(metric)
        })));
    }
}