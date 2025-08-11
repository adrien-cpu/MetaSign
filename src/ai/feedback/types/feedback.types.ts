/**
 * Interface pour le contenu d'entrée du feedback
 */
export interface FeedbackContent {
    emotion?: unknown;
    expression?: unknown;
    context?: unknown;
    [key: string]: unknown;
}

/**
 * Interface pour une entrée de feedback
 */
export interface FeedbackEntry {
    id: string;
    timestamp: number;
    userId?: string;
    content: FeedbackContent;
    source: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour les métriques de qualité
 */
export interface QualityMetrics {
    accuracy: number;
    consistency: number;
    relevance: number;
    timeliness: number;
    additional?: Record<string, number>;
}

/**
 * Interface pour un pattern identifié dans le feedback
 */
export interface FeedbackPattern {
    type: string;
    description: string;
    confidence: number;
    occurrences: number;
    frequency: number;
    associatedContexts: string[];
    data: Record<string, unknown>;
}

/**
 * Interface pour l'impact attendu d'une recommandation
 */
export interface ExpectedImpact {
    metrics: Partial<QualityMetrics>;
    description: string;
}

/**
 * Interface pour une recommandation de feedback
 */
export interface FeedbackRecommendation {
    type: string;
    description: string;
    actions: string[];
    priority: number;
    difficulty: number;
    expectedImpact: ExpectedImpact;
    examples?: string[] | undefined; // Compatible avec exactOptionalPropertyTypes
}

/**
 * Interface pour une analyse de feedback
 */
export interface FeedbackAnalysis {
    entry: FeedbackEntry;
    metrics: QualityMetrics;
    patterns: FeedbackPattern[];
    recommendations: FeedbackRecommendation[];
    timestamp: number;
    analysisTime: number;
    analyzerVersion: string;
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour un gestionnaire de feedback
 */
export interface IFeedbackHandler {
    handle(entry: FeedbackEntry): Promise<FeedbackAnalysis>;
}