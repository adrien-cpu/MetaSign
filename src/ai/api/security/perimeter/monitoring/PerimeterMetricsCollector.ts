// src/ai/api/security/perimeter/monitoring/PerimeterMetricsCollector.ts

import { MetricsCollector } from '@api/common/metrics/MetricsCollector';
import { MetricTypes } from '@api/common/metrics/types/MetricTypes';

export class PerimeterMetricsCollector {
    constructor(
        private readonly metricsCollector: MetricsCollector
    ) { }

    recordAccessAttempt(zoneId: string, allowed: boolean): void {
        this.metricsCollector.incrementCounter({
            name: 'security_perimeter_access_attempts',
            tags: { zone: zoneId, outcome: allowed ? 'allowed' : 'denied' }
        });
    }

    recordRuleEvaluation(ruleId: string, matched: boolean): void {
        this.metricsCollector.incrementCounter({
            name: 'security_perimeter_rule_evaluations',
            tags: { rule_id: ruleId, matched: matched ? 'true' : 'false' }
        });
    }

    recordProcessingTime(operation: string, durationMs: number): void {
        this.metricsCollector.recordHistogram({
            name: 'security_perimeter_processing_time',
            value: durationMs,
            tags: { operation }
        });
    }

    recordCacheHitRate(hitRate: number): void {
        this.metricsCollector.recordGauge({
            name: 'security_perimeter_cache_hit_rate',
            value: hitRate
        });
    }
}