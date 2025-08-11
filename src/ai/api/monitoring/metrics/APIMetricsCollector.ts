// src/ai/api/monitoring/metrics/APIMetricsCollector.ts
import { MetricsCollector } from '../../common/metrics/MetricsCollector';
export class APIMetricsCollector extends MetricsCollector {
    private rpmMetricsCollector: RPMMetricsCollector;
    private metricsAggregator: MetricsAggregator;

    async collectMetrics(context: APIContext): Promise<void> {
        const apiMetrics = this.getAPIMetrics(context);
        const rpmMetrics = await this.rpmMetricsCollector.collect();

        await this.metricsAggregator.aggregate({
            ...apiMetrics,
            ...rpmMetrics
        });
    }

    private getAPIMetrics(context: APIContext): APIMetrics {
        return {
            endpoint: context.request.endpoint,
            responseTime: context.duration,
            statusCode: context.response.status,
            errorCount: context.errors.length
        };
    }
}