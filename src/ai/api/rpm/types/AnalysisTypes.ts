// src/ai/api/rpm/types/AnalysisTypes.ts
export interface RPMAnalysis {
    metrics: RPMMetrics;
    anomalies: Anomaly[];
    trends: TrendAnalysis;
    recommendations: RPMRecommendation[];
}

export interface TrendAnalysis {
    shortTerm: Trend[];
    longTerm: Trend[];
    predictions: Prediction[];
}

export interface RPMRecommendation {
    type: RecommendationType;
    priority: number;
    action: string;
    impact: Impact;
}