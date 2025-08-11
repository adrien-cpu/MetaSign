// src/ai/systems/expressions/utils/PerformanceMonitor.ts

import { RPMMetricsCollector } from '../../rpm/metrics/RPMMetricsCollector';

/**
 * Wrapper simplifié pour le système de métriques RPM
 * Adapte l'interface RPMMetricsCollector pour le système d'émotions
 */
export class PerformanceMonitor {
    private metricsCollector: RPMMetricsCollector;

    constructor() {
        this.metricsCollector = new RPMMetricsCollector();
    }

    /**
     * Enregistre la durée d'une opération
     * @param operationName Nom de l'opération
     * @param duration Durée en millisecondes
     */
    recordOperation(operationName: string, duration: number): void {
        this.metricsCollector.recordTiming(`emotion.${operationName}`, duration);
    }

    /**
     * Incrémente un compteur d'opération
     * @param counterName Nom du compteur
     */
    incrementCounter(counterName: string): void {
        this.metricsCollector.incrementCounter(`emotion.${counterName}`);
    }

    /**
     * Obtient la durée moyenne d'une opération
     * @param operationName Nom de l'opération
     * @returns Durée moyenne en millisecondes
     */
    getAverageOperationTime(operationName: string): number {
        return this.metricsCollector.getAverageTiming(`emotion.${operationName}`);
    }
}