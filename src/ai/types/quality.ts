// src/ai/types/quality.ts
export interface QualityMetrics {
    overallQuality: number;
    metrics: Record<string, number>;
}

export interface CoherenceResult {
    score: number;
    issues: string[];
}