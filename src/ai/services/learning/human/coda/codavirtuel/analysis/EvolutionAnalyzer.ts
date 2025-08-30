export interface EvolutionData {
    performance?: number;
    behavior?: Record<string, unknown>;
    pattern?: Record<string, unknown>;
    metrics?: Record<string, number>;
    [key: string]: unknown;
}

import type {
    EvolutionMetrics,
    EvolutionEvent,
    EvolutionPrediction,
    EvolutionAnalysisResult,
    EvolutionFactors
} from '@/ai/services/learning/human/coda/codavirtuel/types/evolution.types';

export interface AnalysisResult {
    id: string;
    timestamp: number;
    type: 'performance' | 'behavioral' | 'pattern' | 'anomaly';
    confidence: number;
    data: EvolutionData;
    recommendations: string[];
}

export interface AnalysisConfig {
    depth: number;
    enablePatternRecognition: boolean;
    enableAnomalyDetection: boolean;
    thresholds: {
        confidence: number;
        performance: number;
    };
}

export class EvolutionAnalyzer {
    private readonly config: AnalysisConfig;
    private analysisHistory: AnalysisResult[] = [];
    
    constructor(config?: Partial<AnalysisConfig>) {
        this.config = {
            depth: 10,
            enablePatternRecognition: true,
            enableAnomalyDetection: true,
            thresholds: {
                confidence: 0.7,
                performance: 0.8
            },
            ...config
        };
    }

    async analyzeEvolution(
        studentId: string,
        currentMetrics: EvolutionMetrics,
        history: readonly EvolutionEvent[],
        factors: EvolutionFactors,
        predictions: readonly EvolutionPrediction[]
    ): Promise<EvolutionAnalysisResult> {
        const overallScore = this.calculateOverallScore(currentMetrics, history, factors);
        const recommendations = this.generateRecommendations(factors);
        const nextSteps = this.generateNextSteps(currentMetrics, predictions);
        
        const result: EvolutionAnalysisResult = {
            currentMetrics,
            recentEvolutions: history.slice(-10),
            evolutionPredictions: predictions,
            improvementRecommendations: recommendations,
            overallEvolutionScore: overallScore,
            nextSteps
        };
        
        return result;
    }


    private calculateOverallScore(
        metrics: EvolutionMetrics,
        history: readonly EvolutionEvent[],
        factors: EvolutionFactors
    ): number {
        const values = Object.values(metrics);
        const avgMetrics = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0.5;
        
        const historyBonus = Math.min(0.2, history.length * 0.01);
        const factorsBonus = factors.memoryMetrics ? Math.min(0.1, factors.memoryMetrics.retentionRate * 0.1) : 0;
        
        return Math.min(1, Math.max(0, avgMetrics + historyBonus + factorsBonus));
    }

    private generateNextSteps(
        metrics: EvolutionMetrics,
        predictions: readonly EvolutionPrediction[]
    ): string[] {
        const steps = [];
        
        if (predictions.length > 0) {
            steps.push('Surveiller les prédictions à court terme');
        }
        
        const avgScore = Object.values(metrics).reduce((sum, val) => sum + val, 0) / Object.values(metrics).length;
        if (avgScore < 0.5) {
            steps.push('Améliorer les performances générales');
        }
        
        steps.push('Continuer l\'analyse des patterns d\'évolution');
        
        return steps;
    }

    private generateRecommendations(factors: EvolutionFactors): string[] {
        const recommendations = [];
        
        if (factors.memoryMetrics && factors.memoryMetrics.retentionRate < this.config.thresholds.performance) {
            recommendations.push('Améliorer la rétention de mémoire');
        }
        
        if (this.config.enablePatternRecognition) {
            recommendations.push('Analyser les patterns récurrents');
        }
        
        if (this.config.enableAnomalyDetection) {
            recommendations.push('Surveiller les anomalies détectées');
        }
        
        return recommendations;
    }

    getAnalysisHistory(): AnalysisResult[] {
        return [...this.analysisHistory];
    }

    clearHistory(): void {
        this.analysisHistory = [];
    }
}