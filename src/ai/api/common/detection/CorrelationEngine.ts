/**
 * src/ai/api/common/detection/CorrelationEngine.ts
 * @file CorrelationEngine.ts
 * @description
 * Classe pour la détection de corrélations entre anomalies
 * Utilisée pour détecter des anomalies corrélées dans les systèmes distribués
 * Utilisée pour la détection d'anomalies et la corrélation entre métriques système
 * Utilisée pour l'analyse des tendances
 */
import {
    SystemMetrics,
    Anomaly,
    BaseCorrelation,
    CorrelatedAnomaly,
    CorrelationConfig,
    CorrelationMetrics,
    AnomalyGroup,
    Correlation,
    CorrelationDetectionResult
} from './types';

export class CorrelationEngine {
    private config: CorrelationConfig;
    private metrics: CorrelationMetrics;

    constructor(config: CorrelationConfig) {
        this.config = config;
        this.metrics = this.initializeMetrics();
    }

    async correlateAnomalies(detectionResults: CorrelationDetectionResult[]): Promise<CorrelatedAnomaly[]> {
        const correlatedAnomalies: CorrelatedAnomaly[] = [];

        for (const result of detectionResults) {
            for (const anomaly of result.anomalies) {
                const correlations = await this.findCorrelations(anomaly, result.metrics);
                if (correlations.length > 0) {
                    correlatedAnomalies.push({
                        sourceMetric: anomaly.metricName,
                        targetMetric: correlations[0].targetMetric,
                        correlationCoefficient: correlations[0].correlationCoefficient,
                        timeWindow: this.config.timeWindowMs,
                        anomalies: [anomaly],
                        confidence: correlations[0].confidence
                    });
                }
            }
        }

        return correlatedAnomalies;
    }
    private calculateConfidenceScore(coefficient: number): number {
        return Math.min(1, coefficient * 1.2);
    }
    private async findCorrelations(
        anomaly: Anomaly,
        metrics: SystemMetrics[]
    ): Promise<BaseCorrelation[]> {
        const correlations: BaseCorrelation[] = [];
        const anomalyMetrics = metrics.filter(m => m.metricName === anomaly.metricName);
        const otherMetrics = metrics.filter(m => m.metricName !== anomaly.metricName);

        for (const metric of otherMetrics) {
            const coefficient = await this.calculateCorrelationCoefficient(anomalyMetrics,
                metrics.filter(m => m.metricName === metric.metricName)
            );

            if (coefficient >= this.config.minCorrelationScore) {
                correlations.push({
                    sourceMetric: anomaly.metricName,
                    targetMetric: metric.metricName,
                    correlationCoefficient: coefficient,
                    timeWindow: this.config.timeWindowMs,
                    confidence: this.calculateConfidenceScore(coefficient)
                });
            }
        }

        return correlations;
    }

    private alignTimeSeries(series1: SystemMetrics[], series2: SystemMetrics[]): {
        values1: number[];
        values2: number[];
    } {
        const timestamps = new Set([
            ...series1.map(m => m.timestamp),
            ...series2.map(m => m.timestamp)
        ]);

        const aligned = {
            values1: [] as number[],
            values2: [] as number[]
        };

        for (const ts of timestamps) {
            const metric1 = series1.find(m => m.timestamp === ts);
            const metric2 = series2.find(m => m.timestamp === ts);

            if (metric1 && metric2) {
                aligned.values1.push(metric1.value);
                aligned.values2.push(metric2.value);
            }
        }

        return aligned;
    }

    private async calculateCorrelationCoefficient(series1: SystemMetrics[], series2: SystemMetrics[]): Promise<number> {
        if (series1.length === 0 || series2.length === 0) {
            return 0;
        }

        // Aligner les séries temporelles
        const alignedSeries = this.alignTimeSeries(series1, series2);
        if (alignedSeries.values1.length < 2) {
            return 0;
        }

        // Calcul de la corrélation de Pearson
        const mean1 = alignedSeries.values1.reduce((a, b) => a + b, 0) / alignedSeries.values1.length;
        const mean2 = alignedSeries.values2.reduce((a, b) => a + b, 0) / alignedSeries.values2.length;

        let num = 0;
        let den1 = 0;
        let den2 = 0;

        for (let i = 0; i < alignedSeries.values1.length; i++) {
            const diff1 = alignedSeries.values1[i] - mean1;
            const diff2 = alignedSeries.values2[i] - mean2;
            num += diff1 * diff2;
            den1 += diff1 * diff1;
            den2 += diff2 * diff2;
        }

        if (den1 === 0 || den2 === 0) {
            return 0;
        }

        return Math.abs(num / Math.sqrt(den1 * den2));
    }
    private initializeMetrics(): CorrelationMetrics {
        return {
            totalGroups: 0,
            averageGroupSize: 0,
            correlationScores: [],
            processingTime: 0,
            confidence: 0
        };
    }

    private async analyzeCorrelations(detectionResult: CorrelationDetectionResult): Promise<Correlation[]> {
        if (detectionResult.anomalies.length === 0) {
            return [];
        }

        const groups = await this.analyzeGroups([detectionResult]);
        const allCorrelations: Correlation[] = [];

        for (const group of groups) {
            const groupCorrelations = group.anomalies.flatMap(anomaly =>
                this.calculateCorrelations(anomaly, group.anomalies)
            );
            allCorrelations.push(...groupCorrelations);
        }

        return allCorrelations;
    }

    private async analyzeGroups(detectionResults: CorrelationDetectionResult[]): Promise<AnomalyGroup[]> {
        const anomalies = detectionResults.flatMap(result => result.anomalies);
        return this.groupRelatedAnomalies(anomalies);
    }

    async generateCorrelatedAnomalies(groups: AnomalyGroup[]): Promise<CorrelatedAnomaly[]> {
        const correlatedAnomalies: CorrelatedAnomaly[] = [];

        for (const group of groups) {
            for (const anomaly of group.anomalies) {
                correlatedAnomalies.push({
                    sourceMetric: anomaly.metricName,
                    targetMetric: group.anomalies[0].metricName,
                    correlationCoefficient: group.correlationScore,
                    timeWindow: this.config.timeWindowMs,
                    anomalies: [anomaly],
                    confidence: group.correlationScore
                });
            }
        }

        return correlatedAnomalies;
    }

    async groupRelatedAnomalies(anomalies: Anomaly[]): Promise<AnomalyGroup[]> {
        const groups: AnomalyGroup[] = [];
        const processed = new Set<string>();

        for (const anomaly of anomalies) {
            if (processed.has(this.getCorrelationKey(anomaly))) continue;

            const group = {
                id: `group-${groups.length + 1}`,
                anomalies: [anomaly],
                correlationScore: 1,
                startTime: anomaly.timestamp,
                endTime: anomaly.timestamp,
                status: 'active' as const
            };

            const relatedAnomalies = this.findRelatedAnomalies(anomaly, anomalies);
            for (const related of relatedAnomalies) {
                if (!processed.has(this.getCorrelationKey(related))) {
                    group.anomalies.push(related);
                    group.endTime = Math.max(group.endTime, related.timestamp);
                    processed.add(this.getCorrelationKey(related));
                }
            }

            group.correlationScore = this.calculateGroupScore(group);
            if (group.correlationScore >= this.config.minCorrelationScore) {
                groups.push(group);
            }
        }

        return groups;
    }

    private getCorrelationKey(anomaly: Anomaly): string {
        return `${anomaly.metricName}-${anomaly.timestamp}`;
    }

    private findRelatedAnomalies(source: Anomaly, allAnomalies: Anomaly[]): Anomaly[] {
        return allAnomalies.filter(target => {
            if (target === source) return false;

            const timeWindow = Math.abs(target.timestamp - source.timestamp);
            if (timeWindow > this.config.timeWindowMs) return false;

            return this.calculateCorrelationScore(source, target) >= this.config.minCorrelationScore;
        });
    }

    private calculateCorrelationScore(a1: Anomaly, a2: Anomaly): number {
        const timeScore = this.calculateTimeScore(a1.timestamp, a2.timestamp);
        const severityScore = this.calculateSeverityScore(a1.severity, a2.severity);
        const typeScore = a1.type === a2.type ? 1 : 0.5;

        return (timeScore + severityScore + typeScore) / 3;
    }

    private calculateTimeScore(t1: number, t2: number): number {
        const diff = Math.abs(t1 - t2);
        return Math.max(0, 1 - (diff / this.config.timeWindowMs));
    }

    private calculateSeverityScore(s1: 'low' | 'medium' | 'high', s2: 'low' | 'medium' | 'high'): number {
        const severityMap = {
            low: 1,
            medium: 2,
            high: 3
        } as const;
        const diff = Math.abs(severityMap[s1] - severityMap[s2]);
        return 1 - (diff / 2);
    }

    private calculateGroupScore(group: AnomalyGroup): number {
        if (group.anomalies.length < 2) return 1;

        let totalScore = 0;
        let comparisons = 0;

        for (let i = 0; i < group.anomalies.length; i++) {
            for (let j = i + 1; j < group.anomalies.length; j++) {
                totalScore += this.calculateCorrelationScore(
                    group.anomalies[i],
                    group.anomalies[j]
                );
                comparisons++;
            }
        }

        return totalScore / comparisons;
    }

    private calculateCorrelations(source: Anomaly, groupAnomalies: Anomaly[]): Correlation[] {
        return groupAnomalies
            .filter(target => target !== source)
            .map(target => ({
                sourceMetric: source.metricName,
                targetMetric: target.metricName,
                correlationCoefficient: this.calculateCorrelationScore(source, target),
                timeWindow: Math.abs(target.timestamp - source.timestamp),
                confidence: this.calculateCorrelationConfidence(source, target),
                timestamp: Date.now()
            }));
    }

    private calculateCorrelationConfidence(a1: Anomaly, a2: Anomaly): number {
        const timeConfidence = this.calculateTimeScore(a1.timestamp, a2.timestamp);
        const severityConfidence = this.calculateSeverityScore(a1.severity, a2.severity);
        return (timeConfidence + severityConfidence) / 2;
    }

    private updateMetrics(groups: AnomalyGroup[], processingTime: number): void {
        this.metrics = {
            totalGroups: groups.length,
            averageGroupSize: groups.reduce((sum, g) => sum + g.anomalies.length, 0) / groups.length,
            correlationScores: groups.map(g => g.correlationScore),
            processingTime,
            confidence: groups.reduce((sum, g) => sum + g.correlationScore, 0) / groups.length
        };
    }

    public getMetrics(): CorrelationMetrics {
        return { ...this.metrics };
    }
}