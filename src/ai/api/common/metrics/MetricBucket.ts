/**
 * src/ai/api/common/metrics/MetricBucket.ts
 * @file MetricBucket.ts
 * @description
 * Classe MetricBucket pour la gestion des métriques
 * Utilisée pour stocker et gérer les données de métriques
 * dans les systèmes distribués
 * Centralisation de la logique de gestion des métriques
 * dans les systèmes distribués
 * Utilisée pour la collecte, l'analyse et la détection d'anomalies
 * dans les systèmes distribués
 * Utilisée pour la gestion des données de métriques
 * dans les systèmes distribués
 */
import { MetricData, TimeFrame } from './types/MetricTypes';

export class MetricBucket {
    private values: number[] = [];
    private timestamps: number[] = [];
    private currentBucketData: MetricData;

    constructor() {
        this.currentBucketData = this.initializeMetricData();
    }

    private initializeMetricData(): MetricData {
        return {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY,
            avg: 0,
            sum: 0,
            count: 0,
            lastUpdate: Date.now()
        };
    }

    addValue(value: number, timestamp: number): void {
        this.values.push(value);
        this.timestamps.push(timestamp);
        this.updateBucketData(value);
    }

    getBucketData(): MetricData {
        return { ...this.currentBucketData };
    }

    async aggregateByTimeFrame(timeFrame: TimeFrame): Promise<MetricData> {
        try {
            const { start, end } = timeFrame;
            const relevantValues = this.values.filter((_, index) => {
                const timestamp = this.timestamps[index];
                return timestamp >= start && timestamp <= end;
            });

            if (relevantValues.length === 0) {
                return this.initializeMetricData();
            }

            const aggregatedData: MetricData = {
                min: Math.min(...relevantValues),
                max: Math.max(...relevantValues),
                sum: relevantValues.reduce((acc, val) => acc + val, 0),
                count: relevantValues.length,
                avg: 0,
                lastUpdate: Date.now()
            };

            aggregatedData.avg = aggregatedData.sum / aggregatedData.count;

            // Calcul des percentiles si suffisamment de données
            if (relevantValues.length >= 10) {
                const sortedValues = [...relevantValues].sort((a, b) => a - b);
                aggregatedData.p50 = this.calculatePercentile(sortedValues, 50);
                aggregatedData.p90 = this.calculatePercentile(sortedValues, 90);
                aggregatedData.p95 = this.calculatePercentile(sortedValues, 95);
                aggregatedData.p99 = this.calculatePercentile(sortedValues, 99);
            }

            return aggregatedData;
        } catch (error) {
            console.error('Error aggregating metrics:', error);
            throw new Error('Failed to aggregate metrics by time frame');
        }
    }

    private updateBucketData(value: number): void {
        this.currentBucketData.min = Math.min(this.currentBucketData.min, value);
        this.currentBucketData.max = Math.max(this.currentBucketData.max, value);
        this.currentBucketData.sum += value;
        this.currentBucketData.count++;
        this.currentBucketData.avg = this.currentBucketData.sum / this.currentBucketData.count;
        this.currentBucketData.lastUpdate = Date.now();
    }

    private calculatePercentile(sortedValues: number[], percentile: number): number {
        const index = (percentile / 100) * (sortedValues.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;

        if (upper === lower) {
            return sortedValues[lower];
        }

        return (1 - weight) * sortedValues[lower] + weight * sortedValues[upper];
    }

    cleanupOldData(olderThan: number): number {
        const initialLength = this.values.length;
        const cutoffIndex = this.timestamps.findIndex(ts => ts >= olderThan);

        if (cutoffIndex === -1) {
            return 0;
        }

        if (cutoffIndex > 0) {
            this.values = this.values.slice(cutoffIndex);
            this.timestamps = this.timestamps.slice(cutoffIndex);
            this.recalculateBucketData();
        }

        return initialLength - this.values.length;
    }

    private recalculateBucketData(): void {
        this.currentBucketData = this.initializeMetricData();
        this.values.forEach(value => this.updateBucketData(value));
    }

    getStorageSize(): number {
        // Estimation approximative de la taille en mémoire
        const numberSize = 8; // Taille approximative d'un nombre en octets
        return (this.values.length + this.timestamps.length) * numberSize;
    }
}