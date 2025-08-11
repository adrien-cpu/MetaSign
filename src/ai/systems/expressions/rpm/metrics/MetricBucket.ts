// src/ai/systems/expressions/rpm/metrics/MetricBucket.ts
import { MetricData, TimeFrame } from './types/MetricTypes';

interface DataPoint {
    value: number;
    timestamp: number;
}

export class MetricBucket {
    private dataPoints: DataPoint[] = [];
    private cachedData: MetricData;

    constructor() {
        this.cachedData = this.createEmptyMetricData();
    }

    /**
     * Ajoute une valeur au bucket
     */
    addValue(value: number, timestamp: number): void {
        this.dataPoints.push({ value, timestamp });
        this.updateCachedData();
    }

    /**
     * Met à jour les données en cache
     */
    private updateCachedData(): void {
        if (this.dataPoints.length === 0) {
            this.cachedData = this.createEmptyMetricData();
            return;
        }

        let min = this.dataPoints[0].value;
        let max = this.dataPoints[0].value;
        let sum = 0;
        let lastUpdate = this.dataPoints[0].timestamp;

        for (const point of this.dataPoints) {
            min = Math.min(min, point.value);
            max = Math.max(max, point.value);
            sum += point.value;
            lastUpdate = Math.max(lastUpdate, point.timestamp);
        }

        this.cachedData = {
            min,
            max,
            avg: sum / this.dataPoints.length,
            sum,
            count: this.dataPoints.length,
            lastUpdate
        };
    }

    /**
     * Récupère les données du bucket
     */
    getBucketData(): MetricData {
        return { ...this.cachedData };
    }

    /**
     * Agrège les données selon une période donnée
     */
    async aggregateByTimeFrame(timeFrame: TimeFrame): Promise<MetricData> {
        const { start, end } = timeFrame;
        const filteredPoints = this.dataPoints.filter(
            point => point.timestamp >= start && point.timestamp <= end
        );

        if (filteredPoints.length === 0) {
            return this.createEmptyMetricData();
        }

        let min = filteredPoints[0].value;
        let max = filteredPoints[0].value;
        let sum = 0;
        let lastUpdate = filteredPoints[0].timestamp;

        for (const point of filteredPoints) {
            min = Math.min(min, point.value);
            max = Math.max(max, point.value);
            sum += point.value;
            lastUpdate = Math.max(lastUpdate, point.timestamp);
        }

        return {
            min,
            max,
            avg: sum / filteredPoints.length,
            sum,
            count: filteredPoints.length,
            lastUpdate
        };
    }

    /**
     * Nettoie les données anciennes
     */
    cleanupOldData(olderThan: number): number {
        const initialCount = this.dataPoints.length;
        this.dataPoints = this.dataPoints.filter(point => point.timestamp >= olderThan);

        if (initialCount !== this.dataPoints.length) {
            this.updateCachedData();
        }

        return initialCount - this.dataPoints.length;
    }

    /**
     * Récupère la taille de stockage approximative
     */
    getStorageSize(): number {
        // Approximation de la taille en octets (16 octets par point de données)
        return this.dataPoints.length * 16;
    }

    /**
     * Crée un objet MetricData vide
     */
    private createEmptyMetricData(): MetricData {
        return {
            min: 0,
            max: 0,
            avg: 0,
            sum: 0,
            count: 0,
            lastUpdate: Date.now()
        };
    }
}