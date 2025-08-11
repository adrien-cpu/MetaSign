/**
 * src/ai/api/common/detection/AnomalyDetector.ts
 * @file AnomalyDetector.ts
 * @description
 * Classe AnomalyDetector pour la détection d'anomalies dans les métriques système
 * Utilisée pour détecter des anomalies dans les systèmes distribués
 * et pour l'analyse des tendances
 * Utilisée pour la détection d'anomalies et la corrélation entre métriques système
 * Centralisation des types pour la détection d'anomalies et de corrélations
 * dans les systèmes distribués
 * Utilisés pour détecter des anomalies corrélées dans les systèmes distribués
 * et pour l'analyse des tendances
 */

import {
    SystemMetrics,
    Anomaly,
    AnomalyType,
    MetricStats,
    IAnomalyDetector,
    AffectedMetrics,
    AnomalyContext
} from './types/AnomalyTypes';

import { CorrelationEngine } from './CorrelationEngine';
import { MetricsCollector } from './MetricsCollector';

// Implémentation concrète de AnomalyDetectionError
class AnomalyDetectionError extends Error {
    constructor(
        message: string,
        public readonly metricName?: string,
        public readonly errorCode?: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'AnomalyDetectionError';
    }
}

interface AnomalyThresholds {
    zScoreThreshold: number;
    iqrMultiplier: number;
    trendThreshold: number;
    contextualThreshold: number;
}

export class AnomalyDetector implements IAnomalyDetector {
    private readonly metricsCollector: MetricsCollector;
    private readonly correlationEngine: CorrelationEngine;
    private readonly thresholds: AnomalyThresholds;
    private baselineStats: MetricStats;
    private metricHistory: SystemMetrics[];
    private readonly MAX_HISTORY_SIZE = 100;

    constructor(
        metricsCollector: MetricsCollector,
        correlationEngine: CorrelationEngine,
        thresholds: AnomalyThresholds
    ) {
        this.metricsCollector = metricsCollector;
        this.correlationEngine = correlationEngine;
        this.thresholds = thresholds;
        this.metricHistory = [];
        this.baselineStats = this.initializeBaselineStats();
    }

    async detectAnomalies(metrics: SystemMetrics): Promise<Anomaly[]> {
        try {
            // Mettre à jour l'historique des métriques
            this.updateMetricHistory(metrics);

            await this.metricsCollector.collect([metrics]);
            this.updateBaselineStats(metrics);

            const trendAnomalies = await this.detectTrendAnomalies(metrics);
            const contextualAnomalies = await this.detectContextualAnomalies(metrics);

            // Utiliser l'historique pour des analyses supplémentaires si nécessaire
            const correlatedAnomalies = await this.analyzeMetricPatterns(metrics);

            return [...trendAnomalies, ...contextualAnomalies, ...correlatedAnomalies];
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new AnomalyDetectionError(
                `Anomaly detection failed: ${errorMessage}`,
                metrics.metricName,
                'DETECTION_FAILURE',
                error instanceof Error ? error : undefined
            );
        }
    }

    public updateBaselineStats(newMetrics: SystemMetrics): void {
        const value = newMetrics.value;
        this.baselineStats = {
            ...this.baselineStats,
            count: this.baselineStats.count + 1,
            sum: this.baselineStats.sum + value,
            mean: (this.baselineStats.sum + value) / (this.baselineStats.count + 1),
        };
        this.updateVarianceAndStdDev(value);
    }

    async detectTrendAnomalies(metrics: SystemMetrics): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];
        if (Math.abs(metrics.value - this.baselineStats.mean) > this.thresholds.trendThreshold) {
            anomalies.push(this.createAnomaly(
                'performance',
                this.calculateSeverity(metrics.value, this.thresholds.trendThreshold),
                `Trend anomaly detected for ${metrics.metricName}`,
                {
                    name: metrics.metricName,
                    currentValue: metrics.value,
                    threshold: this.thresholds.trendThreshold,
                    deviation: Math.abs(metrics.value - this.baselineStats.mean)
                },
                metrics.metricName,
                metrics.timestamp
            ));
        }
        return anomalies;
    }

    async detectContextualAnomalies(metrics: SystemMetrics): Promise<Anomaly[]> {
        return this.detectZScoreAnomalies(metrics, this.baselineStats);
    }

    async detectZScoreAnomalies(metrics: SystemMetrics, stats: MetricStats): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];
        const zScore = Math.abs((metrics.value - stats.mean) / stats.stdDev);

        if (zScore > this.thresholds.zScoreThreshold) {
            anomalies.push(this.createAnomaly(
                'performance',
                this.calculateSeverity(zScore, this.thresholds.zScoreThreshold),
                `Z-score anomaly detected for ${metrics.metricName}`,
                {
                    name: metrics.metricName,
                    currentValue: metrics.value,
                    threshold: this.thresholds.zScoreThreshold,
                    deviation: zScore
                },
                metrics.metricName,
                metrics.timestamp
            ));
        }
        return anomalies;
    }

    async detectIQRAnomalies(metrics: SystemMetrics): Promise<Anomaly[]> {
        const { q1, q3, iqr } = this.calculateQuartiles([metrics.value]);
        const anomalies: Anomaly[] = [];

        if (metrics.value < q1 - iqr * this.thresholds.iqrMultiplier ||
            metrics.value > q3 + iqr * this.thresholds.iqrMultiplier) {
            anomalies.push(this.createAnomaly(
                'performance',
                'high',
                `IQR anomaly detected for ${metrics.metricName}`,
                {
                    name: metrics.metricName,
                    currentValue: metrics.value,
                    threshold: this.thresholds.iqrMultiplier,
                    deviation: Math.abs(metrics.value - ((q1 + q3) / 2))
                },
                metrics.metricName,
                metrics.timestamp
            ));
        }
        return anomalies;
    }

    // Nouvelle méthode pour mettre à jour l'historique des métriques
    private updateMetricHistory(metrics: SystemMetrics): void {
        this.metricHistory.push(metrics);
        if (this.metricHistory.length > this.MAX_HISTORY_SIZE) {
            this.metricHistory.shift();
        }
    }



    // Nouvelle méthode pour analyser des patterns dans l'historique des métriques
    private async analyzeMetricPatterns(currentMetrics: SystemMetrics): Promise<Anomaly[]> {
        if (this.metricHistory.length < 5) {
            return [];
        }

        const anomalies: Anomaly[] = [];

        try {
            // Analyse simple: vérifier si la métrique actuelle s'écarte significativement
            // de la tendance des dernières métriques
            const recentMetrics = this.metricHistory.slice(-5); // Dernières 5 métriques
            const recentValues = recentMetrics.map(m => m.value);
            const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
            const recentStdDev = Math.sqrt(
                recentValues.reduce((acc, val) => acc + Math.pow(val - recentMean, 2), 0) / recentValues.length
            );

            // Z-score de la valeur actuelle par rapport aux métriques récentes
            const currentZScore = Math.abs((currentMetrics.value - recentMean) / (recentStdDev || 1));

            if (currentZScore > this.thresholds.contextualThreshold) {
                anomalies.push(this.createAnomaly(
                    'performance',
                    this.calculateSeverity(currentZScore, this.thresholds.contextualThreshold),
                    `Pattern anomaly detected for ${currentMetrics.metricName}`,
                    {
                        name: currentMetrics.metricName,
                        currentValue: currentMetrics.value,
                        threshold: this.thresholds.contextualThreshold,
                        deviation: currentZScore
                    },
                    currentMetrics.metricName,
                    currentMetrics.timestamp
                ));
            }

            // TODO: Améliorer l'analyse des patterns en intégrant une méthode appropriée de CorrelationEngine
            // lorsqu'elle sera disponible ou en implémentant un algorithme plus sophistiqué.
        } catch (error) {
            // Loguer l'erreur mais ne pas l'envoyer pour ne pas interrompre la détection principale
            console.error('Error analyzing metric patterns:', error);
        }

        return anomalies;
    }

    private initializeBaselineStats(): MetricStats {
        return {
            mean: 0,
            stdDev: 0,
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            count: 0,
            sum: 0,
            variance: 0
        };
    }

    private updateVarianceAndStdDev(value: number): void {
        const diff = value - this.baselineStats.mean;
        this.baselineStats.variance =
            ((this.baselineStats.count - 1) * this.baselineStats.variance +
                diff * diff * this.baselineStats.count) / this.baselineStats.count;
        this.baselineStats.stdDev = Math.sqrt(this.baselineStats.variance);
    }

    private calculateQuartiles(values: number[]): { q1: number; q3: number; iqr: number } {
        const sorted = [...values].sort((a, b) => a - b);
        const q1Index = Math.floor(sorted.length * 0.25);
        const q3Index = Math.floor(sorted.length * 0.75);

        return {
            q1: sorted[q1Index],
            q3: sorted[q3Index],
            iqr: sorted[q3Index] - sorted[q1Index]
        };
    }

    private calculateSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' {
        const ratio = value / threshold;
        if (ratio > 2) return 'high';
        if (ratio > 1.5) return 'medium';
        return 'low';
    }

    private createAnomaly(
        type: AnomalyType,
        severity: 'low' | 'medium' | 'high',
        details: string,
        metrics: AffectedMetrics,
        metricName: string,    // Paramètre ajouté
        timestamp: number      // Paramètre ajouté
    ): Anomaly {
        const context: AnomalyContext = {
            timestamp: Date.now(),
            source: 'AnomalyDetector',
            relatedEvents: []
        };

        return {
            type,
            severity,
            details,
            metrics,
            context,
            metricName,       // Ajout de la propriété requise
            timestamp,        // Ajout de la propriété requise
            value: metrics.currentValue,  // Valeur à partir des métriques affectées
            deviation: metrics.deviation  // Écart à partir des métriques affectées
        };
    }
}