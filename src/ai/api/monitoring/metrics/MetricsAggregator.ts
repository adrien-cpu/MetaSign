// metrics/MetricsAggregator.ts
export class MetricsAggregator {
    private readonly timeWindows = [
        60 * 1000,     // 1 minute
        5 * 60 * 1000, // 5 minutes
        15 * 60 * 1000 // 15 minutes
    ];

    private metrics: Map<string, TimeSeriesMetric>;

    aggregate(newMetrics: APIMetrics): void {
        const timestamp = Date.now();
        
        for (const [key, value] of Object.entries(newMetrics)) {
            const timeSeries = this.metrics.get(key) || new TimeSeriesMetric();
            timeSeries.add(timestamp, value);
            this.metrics.set(key, timeSeries);
        }
    }

    getAggregatedMetrics(): AggregatedMetrics {
        const result: AggregatedMetrics = {};
        
        for (const [key, timeSeries] of this.metrics.entries()) {
            result[key] = this.timeWindows.map(window => ({
                window,
                avg: timeSeries.average(window),
                max: timeSeries.maximum(window),
                min: timeSeries.minimum(window)
            }));
        }

        return result;
    }
}