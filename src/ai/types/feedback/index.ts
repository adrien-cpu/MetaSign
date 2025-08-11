// src/ai/types/feedback/index.ts

/**
 * Représente une entrée de feedback
 */
export interface FeedbackEntry {
    id: string;
    userId: string;
    timestamp: Date;
    content: FeedbackContentType;
    type: string;
    context?: string;
}

/**
 * Type de contenu de feedback
 */
export interface FeedbackContentType {
    text?: string;
    rating?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * Métriques de qualité pour l'analyse de feedback
 */
export interface QualityMetrics {
    accuracy: number;
    consistency: number;
    relevance: number;
    timeliness: number;
}

/**
 * Pattern détecté dans un feedback
 */
export interface FeedbackPattern {
    name: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    type: string;
    description: string;
    occurrences: number;
}

/**
 * Recommandation basée sur l'analyse du feedback
 */
export interface FeedbackRecommendation {
    type: string;
    priority: number;
    description: string;
    actions: string[];
    difficulty: number;
    expectedImpact: {
        metrics: Partial<QualityMetrics>;
        description: string;
    };
}

/**
 * Résultat complet de l'analyse d'un feedback
 */
export interface FeedbackAnalysis {
    entry: FeedbackEntry;
    metrics: QualityMetrics;
    patterns: FeedbackPattern[];
    recommendations: FeedbackRecommendation[];
}