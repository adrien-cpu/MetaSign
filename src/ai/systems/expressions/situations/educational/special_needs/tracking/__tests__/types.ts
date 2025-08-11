// src/ai/systems/expressions/situations/educational/special_needs/tracking/__tests__/types.ts

export interface SupportHistory {
    timeline: SupportEvent[];
    adaptations: AdaptationRecord[];
    effectiveness: EffectivenessMetrics;
}

export interface SupportEvent {
    timestamp: number;
    type: string;
    details: Record<string, unknown>;
}

export interface AdaptationRecord {
    type: string;
    duration: number;
    impact: number;
}

export interface EffectivenessMetrics {
    overall: number;
    byType: Record<string, number>;
}

export interface ProgressData {
    daily_metrics: DailyMetric[];
}

export interface DailyMetric {
    day: number;
    performance: {
        accuracy: number;
        fluency: number;
        confidence: number;
    };
    engagement: number;
    adaptations_used: string[];
}

export interface ChannelMetrics {
    accuracy: number[];
    response_time: number[];
    consistency: number[];
}

export interface AdaptationMetrics {
    effectiveness: number;
    duration: number;
    impact: Record<string, number>;
}

export interface IntegrationData {
    success_rate: number;
    synchronization: number;
    bottlenecks: string[];
}

export interface ExpressionSample {
    type: string;
    context: string;
    components: string[];
    cultural_markers: string[];
}

export interface ContextScenario {
    type: string;
    complexity: number;
    cultural_elements: string[];
}

export interface CommunityFeedback {
    source: string;
    rating: number;
    comments: string[];
}