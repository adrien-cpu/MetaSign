/**
 * src/ai/api/detection/types/CorrelationTypes.ts
 * @file CorrelationTypes.ts
 * @description
 * Types et interfaces pour la détection de corrélations entre métriques système
 * Utilisés pour détecter des anomalies corrélées dans les systèmes distribués
 */
import { SystemMetrics, Anomaly } from './AnomalyTypes';

export interface CorrelationDetectionResult {
    source: string;
    anomalies: Anomaly[];
    timestamp: number;
    metrics: SystemMetrics[];
    metadata?: {
        confidence: number;
        processingTime: number;
    };
}

export interface BaseCorrelation {
    sourceMetric: string;
    targetMetric: string;
    correlationCoefficient: number;
    timeWindow: number;
    confidence: number;
}

export interface CorrelatedAnomaly extends BaseCorrelation {
    anomalies: Anomaly[];
}

export interface CorrelationConfig {
    timeWindowMs: number;
    minCorrelationScore: number;
    maxGroupSize: number;
    enableTemporalAnalysis: boolean;
    confidenceThreshold: number;
}

export interface CorrelationMetrics {
    totalGroups: number;
    averageGroupSize: number;
    correlationScores: number[];
    processingTime: number;
    confidence: number;
}

export interface AnomalyGroup {
    id: string;
    anomalies: Anomaly[];
    correlationScore: number;
    startTime: number;
    endTime: number;
    status: 'active' | 'resolved' | 'investigating';
}
// types/UnifiedTypes.ts

export interface Correlation {
    sourceMetric: string;
    targetMetric: string;
    correlationCoefficient: number;
    timeWindow: number;
    confidence: number;
    timestamp: number;
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

export interface DetectionResult {
    source: string;
    anomalies: Anomaly[];
    timestamp: number;
    metrics: SystemMetrics[];
    context: {
        environment: string;
        timeWindow: {
            start: number;
            end: number;
        };
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

export interface AnomalyAnalysisResult {
    detectionResult: DetectionResult;
    correlations: Correlation[];
    trends: Array<{
        metric: string;
        direction: 'increasing' | 'decreasing' | 'stable';
        rate: number;
    }>;
    performance: {
        processingTime: number;
        dataPointsAnalyzed: number;
        anomaliesFound: number;
    };
}