/**
 * src/ai/api/common/detection/types/UnifiedTypes.ts
 * @file UnifiedTypes.ts
 * @description
 * Types et interfaces pour la détection d'anomalies et de corrélations
 * Utilisés pour la détection d'anomalies et la corrélation entre métriques système
 * Centralisation des types pour la détection d'anomalies et de corrélations
 * dans les systèmes distribués
 * Utilisés pour détecter des anomalies corrélées dans les systèmes distribués
 * et pour l'analyse des tendances
 * Utilisés pour la détection d'anomalies et la corrélation entre métriques système
 */
import { SystemMetrics, Anomaly } from './AnomalyTypes';

export interface Correlation {
    sourceMetric: string;
    targetMetric: string;
    correlationCoefficient: number;
    timeWindow: number;
    confidence: number;
    timestamp: number;
}

export interface TrendAnalysis {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
}

export interface DetectionResult {
    source: string;
    anomalies: Anomaly[];
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

export interface UnifiedAnomalyReport {
    timestamp: number;
    metrics: SystemMetrics[];
    anomalies: Anomaly[];
    correlations: Correlation[];
    impact: {
        severity: 'low' | 'medium' | 'high';
        affectedComponents: string[];
        recommendations: string[];
    };
    metadata: {
        detectionDuration: number;
        analyzedDataPoints: number;
        confidence: number;
    };
}

export interface UnifiedDetectionConfig {
    enableCorrelation: boolean;
    enableTrendAnalysis: boolean;
    confidenceThreshold: number;
    timeWindowMs: number;
    maxAnomalies: number;
    minDataPoints: number;
}