// src/ai/coordinators/services/metrics/aggregation/AggregationStrategies.ts
import {
    AggregationStrategy,
    AggregationResult,
    StoredMetricValue
} from '@ai/coordinators/types';

export class GaugeAggregationStrategy implements AggregationStrategy {
    public aggregate(namespace: string, name: string, values: StoredMetricValue[]): AggregationResult[] {
        if (values.length === 0) return [];

        const numericValues = values.map(v => v.value);
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const avg = sum / numericValues.length;

        return [{
            name: `${name}.avg`,
            value: avg,
            tags: { ...values[0].tags, aggregation: 'avg' },
            timestamp: Date.now()
        }];
    }
}

export class CounterAggregationStrategy implements AggregationStrategy {
    public aggregate(namespace: string, name: string, values: StoredMetricValue[]): AggregationResult[] {
        if (values.length < 2) return [];

        const first = values[0];
        const last = values[values.length - 1];

        const deltaValue = last.value - first.value;
        const deltaTime = (last.timestamp - first.timestamp) / 1000; // en secondes

        if (deltaTime <= 0) return [];

        const rate = deltaValue / deltaTime;

        return [{
            name: `${name}.rate`,
            value: rate,
            tags: { ...last.tags, aggregation: 'rate' },
            timestamp: Date.now()
        }];
    }
}

export class HistogramAggregationStrategy implements AggregationStrategy {
    public aggregate(namespace: string, name: string, values: StoredMetricValue[]): AggregationResult[] {
        if (values.length === 0) return [];

        // Trier les valeurs
        const sortedValues = [...values].sort((a, b) => a.value - b.value);
        const timestamp = Date.now();

        // Calculer les percentiles
        return [50, 90, 95, 99].map(percentile => {
            const value = this.calculatePercentile(sortedValues, percentile);
            return {
                name: `${name}.p${percentile}`,
                value,
                tags: { ...values[0].tags, aggregation: `p${percentile}` },
                timestamp
            };
        });
    }

    private calculatePercentile(sortedValues: StoredMetricValue[], percentile: number): number {
        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))].value;
    }
}

export class SummaryAggregationStrategy implements AggregationStrategy {
    public aggregate(namespace: string, name: string, values: StoredMetricValue[]): AggregationResult[] {
        if (values.length === 0) return [];

        const numericValues = values.map(v => v.value);
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const timestamp = Date.now();

        return [
            {
                name: `${name}.min`,
                value: min,
                tags: { ...values[0].tags, aggregation: 'min' },
                timestamp
            },
            {
                name: `${name}.max`,
                value: max,
                tags: { ...values[0].tags, aggregation: 'max' },
                timestamp
            },
            {
                name: `${name}.avg`,
                value: avg,
                tags: { ...values[0].tags, aggregation: 'avg' },
                timestamp
            }
        ];
    }
}