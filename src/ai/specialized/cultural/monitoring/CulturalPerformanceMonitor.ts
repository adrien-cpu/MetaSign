// src/ai/specialized/cultural/monitoring/CulturalPerformanceMonitor.ts

/**
 * Interface pour les métriques de performance
 */
export interface PerformanceMetrics {
    operationName: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    error?: Error;
    metadata?: Record<string, unknown>;
}

/**
 * Moniteur de performance pour les opérations culturelles
 */
export class CulturalPerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private readonly MAX_METRICS = 1000;

    /**
     * Mesure le temps d'exécution d'une opération
     * @param operationName Nom de l'opération
     * @param operation Fonction à exécuter
     * @param metadata Métadonnées associées
     * @returns Résultat de l'opération
     */
    async measureOperation<T>(
        operationName: string,
        operation: () => Promise<T>,
        metadata?: Record<string, unknown>
    ): Promise<T> {
        const startTime = Date.now();
        let success = false;
        let error: Error | undefined;

        try {
            const result = await operation();
            success = true;
            return result;
        } catch (e) {
            error = e as Error;
            throw e;
        } finally {
            const endTime = Date.now();
            this.recordMetric({
                operationName,
                startTime,
                endTime,
                duration: endTime - startTime,
                success,
                error,
                metadata
            });
        }
    }

    /**
     * Enregistre une métrique
     * @param metric Métrique à enregistrer
     */
    private recordMetric(metric: PerformanceMetrics): void {
        // Limiter le nombre de métriques stockées
        if (this.metrics.length >= this.MAX_METRICS) {
            this.metrics.shift(); // Supprimer la métrique la plus ancienne
        }

        this.metrics.push(metric);
    }

    /**
     * Récupère les métriques globales
     */
    getGlobalMetrics(): Record<string, unknown> {
        const operations = [...new Set(this.metrics.map(metric => metric.operationName))];

        const result: Record<string, unknown> = {
            totalOperations: this.metrics.length,
            uniqueOperationTypes: operations.length,
            operationMetrics: {}
        };

        // Calculer les métriques pour chaque type d'opération
        const operationMetrics: Record<string, unknown> = {};
        for (const operation of operations) {
            const operationData = this.getMetricsForOperation(operation);
            operationMetrics[operation] = {
                count: operationData.length,
                averageDuration: this.calculateAverageDuration(operationData),
                successRate: this.calculateSuccessRate(operationData)
            };
        }

        result.operationMetrics = operationMetrics;
        return result;
    }

    /**
     * Récupère les métriques pour une opération spécifique
     */
    private getMetricsForOperation(operationName: string): PerformanceMetrics[] {
        return this.metrics.filter(metric => metric.operationName === operationName);
    }

    /**
     * Calcule la durée moyenne d'exécution
     */
    private calculateAverageDuration(metrics: PerformanceMetrics[]): number {
        if (metrics.length === 0) return 0;
        return metrics.reduce((sum, metric) => sum + metric.duration, 0) / metrics.length;
    }

    /**
     * Calcule le taux de succès
     */
    private calculateSuccessRate(metrics: PerformanceMetrics[]): number {
        if (metrics.length === 0) return 0;
        return metrics.filter(m => m.success).length / metrics.length;
    }
}