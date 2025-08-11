/**
 * src/ai/systems/expressions/emotions/contextual-emotions.types.ts
 * @file contextual-emotions.types.ts
 * @description
 * Types et interfaces pour les émotions contextuelles
 * Utilisés pour la détection d'anomalies et la corrélation entre métriques système
 * Centralisation des types pour la détection d'anomalies et de corrélations
 * dans les systèmes distribués
 * Utilisés pour détecter des anomalies corrélées dans les systèmes distribués
 * et pour l'analyse des tendances
 */
import { SystemMetrics } from './types/AnomalyTypes';

export class MetricsCollector {
    private metrics: Map<string, SystemMetrics[]>;

    constructor() {
        this.metrics = new Map();
    }

    async collect(newMetrics: SystemMetrics[]): Promise<boolean> {
        try {
            for (const metric of newMetrics) {
                const metricList = this.metrics.get(metric.metricName) || [];
                metricList.push(metric);
                this.metrics.set(metric.metricName, metricList);
            }
            return true;
        } catch (error) {
            console.error('Error collecting metrics:', error);
            return false;
        }
    }

    getMetrics(): Map<string, SystemMetrics[]> {
        return new Map(this.metrics);
    }

    getMetricsByName(metricName: string): SystemMetrics[] {
        return this.metrics.get(metricName) || [];
    }

    clear(): void {
        this.metrics.clear();
    }

    getMetricCount(): number {
        return Array.from(this.metrics.values()).reduce(
            (count, metrics) => count + metrics.length,
            0
        );
    }
}