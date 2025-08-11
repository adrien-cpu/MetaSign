// src/ai/api/performance/metrics/RealTimeMetricsCollector.ts
export class RealTimeMetricsCollector {
    private metrics: Map<string, number[]> = new Map();
    private readonly MAX_SAMPLES = 100;

    startMeasurement(operation: string): () => void {
        const startTime = performance.now();
        return () => this.endMeasurement(operation, startTime);
    }

    private endMeasurement(operation: string, startTime: number): void {
        const duration = performance.now() - startTime;
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }

        const samples = this.metrics.get(operation)!;
        samples.push(duration);

        if (samples.length > this.MAX_SAMPLES) {
            samples.shift();
        }
    }

    getOperationStats(operation: string): {
        avg: number;
        min: number;
        max: number;
        p95: number;
        samples: number;
    } {
        const samples = this.metrics.get(operation) || [];
        if (samples.length === 0) {
            return { avg: 0, min: 0, max: 0, p95: 0, samples: 0 };
        }

        const sorted = [...samples].sort((a, b) => a - b);
        return {
            avg: samples.reduce((sum, val) => sum + val, 0) / samples.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            samples: samples.length
        };
    }

    getAllOperationStats(): Record<string, ReturnType<typeof this.getOperationStats>> {
        const result: Record<string, ReturnType<typeof this.getOperationStats>> = {};
        for (const [operation] of this.metrics) {
            result[operation] = this.getOperationStats(operation);
        }
        return result;
    }
}