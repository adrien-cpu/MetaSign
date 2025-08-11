// src/ai/performance/types.ts

import { ComponentType } from '../coordinators/types';

/**
 * Types de métrique de performance
 */
export enum MetricType {
    ProcessingTime = 'processing-time',
    MemoryUsage = 'memory-usage',
    CpuUsage = 'cpu-usage',
    ThroughputRate = 'throughput-rate',
    ErrorRate = 'error-rate',
    CacheHitRate = 'cache-hit-rate',
    LatencyP95 = 'latency-p95',
    LatencyP99 = 'latency-p99'
}

/**
 * Métrique brute avec timestamp
 */
export interface RawMetric {
    timestamp: number;
    component: ComponentType;
    metricType: MetricType;
    value: number;
    metadata?: Record<string, unknown>;
}

/**
 * Agrégation de métriques pour un intervalle
 */
export interface MetricAggregate {
    component: ComponentType;
    metricType: MetricType;
    period: {
        start: number;
        end: number;
    };
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
    samples: number;
    trend: 'improving' | 'stable' | 'degrading';
}

/**
 * Données de performance agrégées
 */
export interface PerformanceData {
    period: {
        start: number;
        end: number;
    };
    metrics: MetricAggregate[];
    systemLoad: {
        avgCpu: number;
        avgMemory: number;
        peakCpu: number;
        peakMemory: number;
    };
    componentPerformance: Record<ComponentType, {
        avgProcessingTime: number;
        throughput: number;
        errorRate: number;
    }>;
}

/**
 * Détection de goulot d'étranglement
 */
export interface BottleneckDetection {
    timestamp: number;
    criticalBottlenecks: Array<{
        component: ComponentType;
        metric: string;
        value: number;
        threshold: number;
    }>;
    warningBottlenecks: Array<{
        component: ComponentType;
        metric: string;
        value: number;
        threshold: number;
    }>;
    impactEstimation: {
        responseTimeIncrease: number; // pourcentage
        throughputDecrease: number; // pourcentage
        errorRateIncrease: number; // pourcentage
    };
}

/**
 * Analyse des goulots d'étranglement historiques
 */
export interface BottleneckAnalysis {
    period: {
        start: number;
        end: number;
    };
    mostFrequentBottlenecks: Array<{
        component: ComponentType;
        metric: string;
        occurrences: number;
        averageImpact: number; // 0.0 à 1.0
    }>;
    impactByComponent: Record<ComponentType, {
        totalImpact: number; // 0.0 à 1.0
        frequency: number;
        averageSeverity: number; // 0.0 à 1.0
    }>;
    trends: {
        improving: ComponentType[];
        stable: ComponentType[];
        degrading: ComponentType[];
    };
}

/**
 * Retour utilisateur
 */
export interface UserFeedback {
    userId: string;
    requestId: string;
    timestamp: number;
    rating: number; // 1-5
    naturalityScore?: number; // 0.0 à 1.0
    comments?: string;
    satisfactionAreas?: string[];
    improvementAreas?: string[];
    context?: Record<string, unknown>;
}

/**
 * Retour utilisateur agrégé
 */
export interface AggregatedUserFeedback {
    period: {
        start: number;
        end: number;
    };
    totalFeedback: number;
    positiveFeedback: number;
    negativeFeedback: number;
    neutralFeedback: number;
    averageRating: number;
    naturalityScores: {
        average: number;
        distribution: Record<number, number>; // score -> count
    };
    commonIssues: Array<{
        area: string;
        frequency: number;
        impact: number; // 0.0 à 1.0
    }>;
    topPerformingAreas: string[];
    improvementAreas: string[];
}

/**
 * Évaluation de naturalité
 */
export interface NaturalityEvaluation {
    expressionId: string;
    timestamp: number;
    overallScore: number; // 0.0 à 1.0
    facialExpressionScore: number; // 0.0 à 1.0
    gestureScore: number; // 0.0 à 1.0
    spatialConsistencyScore: number; // 0.0 à 1.0
    temporalCoherenceScore: number; // 0.0 à 1.0
    nonManualElementsScore: number; // 0.0 à 1.0
    culturalAppropriatenessScore: number; // 0.0 à 1.0
    contextAdaptationScore: number; // 0.0 à 1.0
    improvementSuggestions: string[];
}

/**
 * Rapport de naturalité
 */
export interface NaturalityReport {
    period: {
        start: number;
        end: number;
    };
    averageScore: number;
    sampleSize: number;
    scoreDistribution: Record<string, number>; // interval -> count
    componentScores: {
        facialExpression: number;
        gesture: number;
        spatialConsistency: number;
        temporalCoherence: number;
        nonManualElements: number;
        culturalAppropriateness: number;
        contextAdaptation: number;
    };
    trend: 'improving' | 'stable' | 'degrading';
    commonIssues: Array<{
        area: string;
        frequency: number;
        averageImpact: number; // 0.0 à 1.0
    }>;
    bestPerformingFeatures: string[];
    worstPerformingFeatures: string[];
}

/**
 * Recommandation d'optimisation
 */
export interface OptimizationRecommendation {
    id: string;
    timestamp: number;
    component: ComponentType;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: 'performance' | 'memory' | 'cpu' | 'cache' | 'naturalness' | 'user-experience';
    title: string;
    description: string;
    currentMetric: {
        name: string;
        value: number;
    };
    targetMetric: {
        name: string;
        value: number;
    };
    estimatedImpact: {
        responseTimeImprovement: number; // pourcentage
        throughputImprovement: number; // pourcentage
        userSatisfactionImprovement: number; // pourcentage
    };
    implementation: {
        difficulty: 'easy' | 'medium' | 'hard';
        estimatedEffort: number; // heures
        requiredChanges: string[];
        risks: string[];
    };
    status: 'pending' | 'in-progress' | 'implemented' | 'rejected';
}

/**
 * Rapport de performance complet
 */
export interface PerformanceReport {
    timestamp: number;
    period: {
        start: number;
        end: number;
    };
    metrics: {
        requestsProcessed: number;
        naturalityEvaluations: number;
        alertsGenerated: number;
    };
    performanceData: PerformanceData;
    bottlenecks: BottleneckAnalysis;
    userFeedbackSummary: {
        total: number;
        positive: number;
        negative: number;
        averageRating: number;
    };
    naturalitySummary: {
        averageScore: number;
        sampleSize: number;
        distribution: Record<string, number>;
    };
    recommendations: OptimizationRecommendation[];
}

/**
 * Données pour la génération de recommandations
 */
export interface RecommendationInput {
    performanceData: PerformanceData;
    bottlenecks: BottleneckAnalysis;
    userFeedback: AggregatedUserFeedback;
    naturalityResults: NaturalityReport;
}

/**
 * Niveau de criticité d'une alerte
 */
export enum AlertSeverity {
    Critical = 'critical',
    High = 'high',
    Medium = 'medium',
    Low = 'low',
    Info = 'info'
}

/**
 * Alerte de performance
 */
export interface PerformanceAlert {
    id: string;
    timestamp: number;
    component: ComponentType;
    metric: string;
    value: number;
    threshold: number;
    severity: AlertSeverity;
    message: string;
    impactEstimation: {
        responseTimeImpact: number; // pourcentage
        throughputImpact: number; // pourcentage
        userExperienceImpact: number; // pourcentage
    };
    recommendedAction?: string;
    status: 'active' | 'acknowledged' | 'resolved';
}