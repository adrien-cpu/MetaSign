// src/ai/performance/EvaluationPerformance.ts

import { ComponentType, PerformanceMetrics, ProcessingResult, RequestContext } from '../coordinators/types';
import { MetricsCollector } from './collectors/MetricsCollector';
import { PerformanceAnalyzer } from './analysis/PerformanceAnalyzer';
import { BottleneckDetector } from './detection/BottleneckDetector';
import { UserFeedbackAggregator } from './feedback/UserFeedbackAggregator';
import { NaturalityEvaluator } from './naturalness/NaturalityEvaluator';
import { OptimizationRecommender } from './optimization/OptimizationRecommender';
import { PerformanceReport, OptimizationRecommendation, NaturalityReport, UserFeedback } from './types';

/**
 * Configuration du système d'évaluation
 */
export interface PerformanceEvaluatorConfig {
    metricsCollectionInterval: number; // ms
    retentionPeriod: number; // ms
    alertThresholds: {
        processingTime: number; // ms
        errorRate: number; // pourcentage
        memoryUsage: number; // pourcentage
        cpuUsage: number; // pourcentage
    };
    naturalityEvaluation: {
        enabled: boolean;
        sampleRate: number; // 0.0 à 1.0, pourcentage de requêtes à évaluer
        minimumSamples: number; // nombre minimal d'échantillons avant analyse
    };
    optimizationRecommendations: {
        enabled: boolean;
        minimumDataPoints: number;
        recommendationInterval: number; // ms
    };
}

/**
 * Gestionnaire d'état du système d'évaluation
 */
interface EvaluatorState {
    isRunning: boolean;
    lastMetricsCollection: number;
    lastRecommendationGeneration: number;
    totalRequestsAnalyzed: number;
    totalNaturalityEvaluations: number;
    alertsGenerated: number;
    metricsCollectionInterval: NodeJS.Timeout | null;
}

/**
 * Système d'évaluation des performances
 * Fournit des métriques détaillées et des recommandations d'optimisation
 */
export class EvaluationPerformance {
    private readonly state: EvaluatorState = {
        isRunning: false,
        lastMetricsCollection: 0,
        lastRecommendationGeneration: 0,
        totalRequestsAnalyzed: 0,
        totalNaturalityEvaluations: 0,
        alertsGenerated: 0,
        metricsCollectionInterval: null
    };

    constructor(
        private readonly metricsCollector: MetricsCollector,
        private readonly performanceAnalyzer: PerformanceAnalyzer,
        private readonly bottleneckDetector: BottleneckDetector,
        private readonly userFeedbackAggregator: UserFeedbackAggregator,
        private readonly naturalityEvaluator: NaturalityEvaluator,
        private readonly optimizationRecommender: OptimizationRecommender,
        private readonly config: PerformanceEvaluatorConfig
    ) { }

    /**
     * Démarre le système d'évaluation
     */
    public start(): void {
        if (this.state.isRunning) {
            return;
        }

        // Démarrer la collecte périodique de métriques
        this.state.metricsCollectionInterval = setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.metricsCollectionInterval);

        this.state.isRunning = true;
        console.log('Performance evaluation system started');
    }

    /**
     * Arrête le système d'évaluation
     */
    public stop(): void {
        if (!this.state.isRunning) {
            return;
        }

        // Arrêter la collecte périodique
        if (this.state.metricsCollectionInterval) {
            clearInterval(this.state.metricsCollectionInterval);
            this.state.metricsCollectionInterval = null;
        }

        this.state.isRunning = false;
        console.log('Performance evaluation system stopped');
    }

    /**
     * Analyse une requête et sa réponse
     */
    public analyzeRequest(
        context: RequestContext,
        result: ProcessingResult,
        metrics: Map<ComponentType, PerformanceMetrics>
    ): void {
        if (!this.state.isRunning) {
            return;
        }

        // Collecter les métriques de cette requête
        this.metricsCollector.collectRequestMetrics(context, result, metrics);

        // Incrémenter le compteur de requêtes
        this.state.totalRequestsAnalyzed++;

        // Détecter les goulots d'étranglement pour cette requête
        const bottlenecks = this.bottleneckDetector.detectBottlenecks(metrics);

        // Si des goulots d'étranglement critiques sont détectés, générer des alertes
        if (bottlenecks.criticalBottlenecks.length > 0) {
            this.generatePerformanceAlert(bottlenecks.criticalBottlenecks);
        }

        // Évaluer la naturalité (pour un échantillon de requêtes)
        if (
            this.config.naturalityEvaluation.enabled &&
            Math.random() < this.config.naturalityEvaluation.sampleRate
        ) {
            this.evaluateNaturality(result);
        }

        // Vérifier si c'est le moment de générer des recommandations
        const now = Date.now();
        if (
            this.config.optimizationRecommendations.enabled &&
            now - this.state.lastRecommendationGeneration > this.config.optimizationRecommendations.recommendationInterval &&
            this.state.totalRequestsAnalyzed >= this.config.optimizationRecommendations.minimumDataPoints
        ) {
            this.generateOptimizationRecommendations();
            this.state.lastRecommendationGeneration = now;
        }
    }

    /**
     * Soumet un retour utilisateur
     */
    public submitUserFeedback(feedback: UserFeedback): void {
        this.userFeedbackAggregator.addFeedback(feedback);
    }

    /**
     * Collecte des métriques système
     */
    private collectSystemMetrics(): void {
        try {
            // Collecter les métriques système
            this.metricsCollector.collectSystemMetrics();

            // Mettre à jour le timestamp
            this.state.lastMetricsCollection = Date.now();

            // Nettoyer les anciennes métriques
            this.metricsCollector.cleanupOldMetrics(this.config.retentionPeriod);
        } catch (error) {
            console.error(`Error collecting system metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Génération d'alertes de performance
     */
    private generatePerformanceAlert(criticalBottlenecks: Array<{ component: ComponentType; metric: string; value: number; threshold: number }>): void {
        // Dans un système réel, cela pourrait déclencher des notifications
        // ou s'intégrer à un système de monitoring

        console.warn('Performance alert generated', {
            timestamp: new Date().toISOString(),
            bottlenecks: criticalBottlenecks,
            affectedComponents: criticalBottlenecks.map(b => b.component)
        });

        this.state.alertsGenerated++;
    }

    /**
     * Évalue la naturalité d'un résultat
     */
    private evaluateNaturality(result: ProcessingResult): void {
        if (!result.expressionData) {
            return;
        }

        try {
            // Exécuter l'évaluation de naturalité
            this.naturalityEvaluator.evaluateExpression(result.expressionData);

            // Incrémenter le compteur
            this.state.totalNaturalityEvaluations++;
        } catch (error) {
            console.error(`Error evaluating naturalness: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Génère des recommandations d'optimisation
     */
    private generateOptimizationRecommendations(): void {
        try {
            // Récupérer les données agrégées
            const performanceData = this.performanceAnalyzer.analyzeCollectedMetrics();
            const bottlenecks = this.bottleneckDetector.analyzeHistoricalBottlenecks();
            const userFeedback = this.userFeedbackAggregator.getAggregatedFeedback();
            const naturalityResults = this.naturalityEvaluator.getEvaluationResults();

            // Générer les recommandations
            const recommendations = this.optimizationRecommender.generateRecommendations({
                performanceData,
                bottlenecks,
                userFeedback,
                naturalityResults
            });

            console.log(`Generated ${recommendations.length} optimization recommendations`);

            // Dans un système réel, on pourrait stocker ces recommandations
            // ou les envoyer à un service d'optimisation automatique
        } catch (error) {
            console.error(`Error generating optimization recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Génère un rapport de performance complet
     */
    public generatePerformanceReport(): PerformanceReport {
        const performanceData = this.performanceAnalyzer.analyzeCollectedMetrics();
        const bottlenecks = this.bottleneckDetector.analyzeHistoricalBottlenecks();
        const userFeedback = this.userFeedbackAggregator.getAggregatedFeedback();
        const naturalityResults = this.naturalityEvaluator.getEvaluationResults();
        const recommendations = this.optimizationRecommender.generateRecommendations({
            performanceData,
            bottlenecks,
            userFeedback,
            naturalityResults
        });

        return {
            timestamp: Date.now(),
            period: {
                start: Date.now() - this.config.retentionPeriod,
                end: Date.now()
            },
            metrics: {
                requestsProcessed: this.state.totalRequestsAnalyzed,
                naturalityEvaluations: this.state.totalNaturalityEvaluations,
                alertsGenerated: this.state.alertsGenerated
            },
            performanceData,
            bottlenecks,
            userFeedbackSummary: {
                total: userFeedback.totalFeedback,
                positive: userFeedback.positiveFeedback,
                negative: userFeedback.negativeFeedback,
                averageRating: userFeedback.averageRating
            },
            naturalitySummary: {
                averageScore: naturalityResults.averageScore,
                sampleSize: naturalityResults.sampleSize,
                distribution: naturalityResults.scoreDistribution
            },
            recommendations: recommendations.slice(0, 10) // Top 10 recommandations
        };
    }

    /**
     * Récupère les dernières recommandations d'optimisation
     */
    public getLatestRecommendations(): OptimizationRecommendation[] {
        return this.optimizationRecommender.getLatestRecommendations();
    }

    /**
     * Récupère le dernier rapport de naturalité
     */
    public getLatestNaturalityReport(): NaturalityReport {
        return this.naturalityEvaluator.getEvaluationResults();
    }
}