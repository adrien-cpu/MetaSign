// src/ai/api/rpm/batch/MetricsBatcher.ts
export class MetricsBatcher {
    private static readonly BATCH_WINDOW = 100; // ms
    private currentBatch: MetricsBatch = new MetricsBatch();

    async addMetric(metric: RPMMetric): Promise<void> {
        if (this.shouldStartNewBatch()) {
            await this.processBatch();
        }
        this.currentBatch.add(metric);
    }

    private async processBatch(): Promise<void> {
        await this.validateBatch(this.currentBatch);
        this.currentBatch = new MetricsBatch();
    }
}