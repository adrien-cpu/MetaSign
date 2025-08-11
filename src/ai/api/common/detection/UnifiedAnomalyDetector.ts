/**
 * src/ai/api/common/detection/UnifiedAnomalyDetector.ts
 * @file UnifiedAnomalyDetector.ts
 * @description
 * Classe UnifiedAnomalyDetector pour détecter les anomalies et les corrélations dans les métriques système.
 * Cette classe intègre plusieurs méthodes de détection et fournit une interface unifiée pour la détection
 * des anomalies et l'analyse des corrélations.
 * Elle utilise les classes AnomalyDetector et CorrelationEngine pour effectuer la détection et l'analyse des corrélations.
 * Elle propose également des méthodes pour générer des rapports et analyser les tendances.
 * La classe est conçue pour être extensible et configurable, permettant l'utilisation de différentes méthodes
 * de détection et techniques de corrélation.
 * Elle inclut également des métriques de performance et une évaluation de l'impact des anomalies détectées.
 * La classe est conçue pour être utilisée dans un environnement de système distribué
 * et peut gérer de grands volumes de données.
 * La classe est conçue pour être utilisée en environnement de production et inclut la gestion des erreurs et la validation.
 * La classe est conçue pour être utilisée en environnement de test et inclut des cas de test pour validation.
 * La classe est conçue pour être utilisée en environnement de développement et inclut des outils de débogage et de journalisation.
 */
import {
    SystemMetrics,
    UnifiedDetectionConfig,
    Correlation,
    TrendAnalysis,
    UnifiedDetectionResult,
    UnifiedAnomalyReport,
    UnifiedAnalysisResult,
    AnomalyGroup,
    Anomaly
} from './types';
import { AnomalyDetector } from './AnomalyDetector';
import { CorrelationEngine } from './CorrelationEngine';
import { MetricsCollector } from './MetricsCollector';

// Définition du type DetectionResult manquant
interface DetectionResult {
    source: string;
    anomalies: Anomaly[]; // Utilisé le type correct des anomalies
    timestamp: number;
    metrics: SystemMetrics[];
    context: {
        source: string;
        environment: 'development' | 'production' | 'test';
        timeWindow: {
            start: number;
            end: number;
        };
    };
}

// Interface pour les données de corrélation
interface CorrelationDetectionResult {
    source: string;
    anomalies: Anomaly[];
    timestamp: number;
    metrics: SystemMetrics[];
    context: {
        source: string;
        environment: string;
        timeWindow: {
            start: number;
            end: number;
        };
    };
}

export class UnifiedAnomalyDetector {
    private anomalyDetector: AnomalyDetector;
    private correlationEngine: CorrelationEngine;
    private metricsCollector: MetricsCollector;
    private config: UnifiedDetectionConfig;
    private lastPerformance: {
        dataPointsAnalyzed: number;
        processingTime: number;
        anomaliesFound: number;
    } = {
            dataPointsAnalyzed: 0,
            processingTime: 0,
            anomaliesFound: 0
        };

    constructor(config: Partial<UnifiedDetectionConfig> = {}) {
        this.config = {
            enableCorrelation: true,
            enableTrendAnalysis: true,
            confidenceThreshold: 0.8,
            timeWindowMs: 3600000, // 1 heure
            maxAnomalies: 100,
            minDataPoints: 10,
            ...config
        };

        const defaultThresholds = {
            zScoreThreshold: 3.0,
            iqrMultiplier: 1.5,
            trendThreshold: 0.5,
            contextualThreshold: 0.7
        };

        const correlationConfig = {
            timeWindowMs: this.config.timeWindowMs,
            minCorrelationScore: 0.7,
            maxGroupSize: 10,
            enableTemporalAnalysis: true,
            confidenceThreshold: this.config.confidenceThreshold
        };

        this.metricsCollector = new MetricsCollector();
        this.correlationEngine = new CorrelationEngine(correlationConfig);
        this.anomalyDetector = new AnomalyDetector(
            this.metricsCollector,
            this.correlationEngine,
            defaultThresholds
        );
    }

    async detectAnomalies(metrics: SystemMetrics[]): Promise<DetectionResult> {
        const startTime = Date.now();
        try {
            // Validation des données d'entrée
            if (!this.validateInput(metrics)) {
                throw new Error('Invalid input metrics');
            }

            // Collecte et prétraitement des métriques
            await this.metricsCollector.collect(metrics);
            const processedMetrics = await this.preprocessMetrics(metrics);

            // Détection des anomalies pour chaque métrique
            const allAnomalies: Anomaly[] = [];
            for (const metric of processedMetrics) {
                const anomalies = await this.anomalyDetector.detectAnomalies(metric);
                allAnomalies.push(...anomalies);
            }

            // Création du résultat
            return {
                source: 'unified_detector',
                anomalies: allAnomalies,
                timestamp: Date.now(),
                metrics: processedMetrics,
                context: {
                    source: 'unified_detector',
                    environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
                    timeWindow: {
                        start: startTime,
                        end: Date.now()
                    }
                }
            };
        } catch (error) {
            throw new Error(`Unified anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Helper pour convertir UnifiedDetectionResult en AnomalyGroup[]
    private async analyzeGroups(detectionResult: UnifiedDetectionResult): Promise<AnomalyGroup[]> {
        // Conversion de type sécurisée
        return this.correlationEngine.groupRelatedAnomalies(
            detectionResult.anomalies as unknown as Anomaly[]
        );
    }

    private updateMetrics(groups: AnomalyGroup[], duration: number): void {
        const performance = {
            dataPointsAnalyzed: groups.reduce((sum, g) => sum + g.anomalies.length, 0),
            processingTime: duration,
            anomaliesFound: groups.reduce((sum, g) => sum + g.anomalies.length, 0),
        };
        this.lastPerformance = performance;
    }

    async analyzeAnomalies(metrics: SystemMetrics[]): Promise<UnifiedAnalysisResult> {
        const startTime = Date.now();
        const detectionResult = await this.detectAnomalies(metrics);

        const correlations: Correlation[] = [];
        if (this.config.enableCorrelation) {
            // Conversion de type sécurisée en deux étapes
            const detectionResultForGroups = {
                ...detectionResult,
                anomalies: detectionResult.anomalies as unknown as Anomaly[]
            };
            const groups = await this.analyzeGroups(detectionResultForGroups as unknown as UnifiedDetectionResult);
            this.updateMetrics(groups, Date.now() - startTime);
            const correlatedResults = await this.analyzeCorrelations(detectionResult);
            correlations.push(...correlatedResults);
        }

        const trends: TrendAnalysis[] = this.config.enableTrendAnalysis
            ? await this.analyzeTrends(metrics)
            : [];

        return {
            detectionResult,
            correlations,
            trends,
            performance: {
                dataPointsAnalyzed: metrics.length,
                processingTime: Date.now() - startTime,
                anomaliesFound: detectionResult.anomalies.length
            }
        };
    }

    async generateReport(metrics: SystemMetrics[]): Promise<UnifiedAnomalyReport> {
        const startTime = Date.now();
        const analysis = await this.analyzeAnomalies(metrics);

        return {
            timestamp: Date.now(),
            metrics: analysis.detectionResult.metrics,
            anomalies: analysis.detectionResult.anomalies,
            correlations: analysis.correlations,
            impact: this.assessImpact(analysis),
            metadata: {
                detectionDuration: Date.now() - startTime,
                analyzedDataPoints: metrics.length,
                confidence: this.calculateConfidence(analysis)
            }
        };
    }

    private async analyzeCorrelations(detection: DetectionResult): Promise<Correlation[]> {
        if (detection.anomalies.length === 0) {
            return [];
        }

        // Convertir l'input en format attendu par correlateAnomalies
        const correlationInput: CorrelationDetectionResult = {
            source: detection.source,
            anomalies: detection.anomalies,
            timestamp: detection.timestamp,
            metrics: detection.metrics,
            context: detection.context
        };

        const correlationResults = await this.correlationEngine.correlateAnomalies([correlationInput]);

        return correlationResults.map(result => ({
            sourceMetric: result.sourceMetric,
            targetMetric: result.targetMetric,
            correlationCoefficient: result.correlationCoefficient,
            timeWindow: result.timeWindow,
            confidence: result.confidence,
            timestamp: Date.now()
        }));
    }

    private async analyzeTrends(metrics: SystemMetrics[]): Promise<TrendAnalysis[]> {
        const groupedMetrics = this.groupMetricsByName(metrics);
        const trends: TrendAnalysis[] = [];

        for (const [name, metricGroup] of groupedMetrics) {
            const trend = this.calculateTrend(metricGroup);
            if (trend) {
                trends.push({
                    metric: name,
                    ...trend
                });
            }
        }

        return trends;
    }

    private calculateTrend(metrics: SystemMetrics[]): {
        direction: 'increasing' | 'decreasing' | 'stable';
        rate: number;
    } | null {
        if (metrics.length < 2) return null;

        const values = metrics.map(m => m.value);
        const timestamps = metrics.map(m => m.timestamp);
        const timeRange = timestamps[timestamps.length - 1] - timestamps[0];
        const valueChange = values[values.length - 1] - values[0];
        const rate = valueChange / timeRange;

        let direction: 'increasing' | 'decreasing' | 'stable';
        if (Math.abs(rate) < 0.001) {
            direction = 'stable';
        } else {
            direction = rate > 0 ? 'increasing' : 'decreasing';
        }

        return { direction, rate: Math.abs(rate) };
    }

    private assessImpact(analysis: AnomalyAnalysisResult): {
        severity: 'low' | 'medium' | 'high';
        affectedComponents: string[];
        recommendations: string[];
    } {
        const anomalyCount = analysis.detectionResult.anomalies.length;
        const criticalAnomalies = analysis.detectionResult.anomalies.filter(
            (anomaly: Anomaly) => anomaly.severity === 'high'
        ).length;

        const severity =
            criticalAnomalies > 0 ? 'high' :
                anomalyCount > 5 ? 'medium' : 'low';

        // Convertir chaque metricName en string pour garantir la compatibilité
        const affectedComponents = [...new Set(
            analysis.detectionResult.anomalies.map((anomaly: Anomaly) =>
                String(anomaly.metricName)
            )
        )];

        const recommendations = this.generateRecommendations(analysis);

        return {
            severity,
            affectedComponents,
            recommendations
        };
    }

    private calculateConfidence(analysis: AnomalyAnalysisResult): number {
        const factors = [
            analysis.performance.dataPointsAnalyzed >= this.config.minDataPoints ? 1 : 0.5,
            analysis.correlations.length > 0 ? 1 : 0.8,
            analysis.detectionResult.anomalies.length < this.config.maxAnomalies ? 1 : 0.7
        ];

        return factors.reduce((acc, factor) => acc * factor, 1);
    }

    private generateRecommendations(analysis: AnomalyAnalysisResult): string[] {
        const recommendations = new Set<string>();

        // Recommandations basées sur les anomalies
        if (analysis.detectionResult.anomalies.length > 0) {
            recommendations.add('Investigate detected anomalies');
        }

        // Recommandations basées sur les corrélations
        if (analysis.correlations.length > 0) {
            recommendations.add('Analyze correlated metrics for root cause');
        }

        // Recommandations basées sur les tendances
        const increasingTrends = analysis.trends.filter(t => t.direction === 'increasing');
        if (increasingTrends.length > 0) {
            recommendations.add('Monitor increasing trends for potential issues');
        }

        return Array.from(recommendations);
    }

    private async processAndValidateMetrics(metrics: SystemMetrics[]): Promise<SystemMetrics[]> {
        // Validation des données d'entrée
        if (!this.validateInput(metrics)) {
            throw new Error('Invalid input metrics');
        }

        // Collecte et prétraitement des métriques
        await this.metricsCollector.collect(metrics);
        return this.preprocessMetrics(metrics);
    }

    private async preprocessMetrics(metrics: SystemMetrics[]): Promise<SystemMetrics[]> {
        // Tri par timestamp
        const sortedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp);

        // Filtrage des valeurs aberrantes basiques
        return sortedMetrics.filter(metric =>
            !isNaN(metric.value) &&
            isFinite(metric.value)
        );
    }

    private groupMetricsByName(metrics: SystemMetrics[]): Map<string, SystemMetrics[]> {
        return metrics.reduce((groups, metric) => {
            const group = groups.get(metric.metricName) || [];
            group.push(metric);
            groups.set(metric.metricName, group);
            return groups;
        }, new Map<string, SystemMetrics[]>());
    }

    private validateInput(metrics: SystemMetrics[]): boolean {
        return (
            Array.isArray(metrics) &&
            metrics.length >= this.config.minDataPoints &&
            metrics.every(metric =>
                typeof metric.timestamp === 'number' &&
                typeof metric.value === 'number' &&
                typeof metric.metricName === 'string'
            )
        );
    }

    // Getters pour les composants internes
    getAnomalyDetector(): AnomalyDetector {
        return this.anomalyDetector;
    }

    getCorrelationEngine(): CorrelationEngine {
        return this.correlationEngine;
    }

    getMetricsCollector(): MetricsCollector {
        return this.metricsCollector;
    }

    getConfig(): UnifiedDetectionConfig {
        return { ...this.config };
    }

    updateConfig(newConfig: Partial<UnifiedDetectionConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export interface AnomalyAnalysisResult {
    detectionResult: DetectionResult;
    correlations: Correlation[];
    trends: TrendAnalysis[];
    performance: {
        dataPointsAnalyzed: number;
        processingTime: number;
        anomaliesFound: number;
    };
}