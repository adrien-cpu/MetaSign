// src/ai/systems/expressions/situations/educational/special_needs/tracking/types.ts

export interface LearningHistory {
    student: string;
    sessions: LearningSession[];
    evaluations: Evaluation[];
    progress: ProgressMetrics;
}

export interface LearningSession {
    date: string;
    duration: number;
    topics: string[];
    performance: {
        accuracy: number;
        speed: number;
        retention: number;
    };
}

export interface Evaluation {
    type: string;
    score: number;
    feedback: string[];
    timestamp: string;
}

export interface ProgressMetrics {
    overall: number;
    byTopic: Record<string, number>;
    trends: {
        lastMonth: number[];
        lastWeek: number[];
    };
}

export interface ParticipationHistory {
    events: ParticipationEvent[];
    metrics: ParticipationMetrics;
    feedback: FeedbackEntry[];
}

export interface ParticipationEvent {
    type: string;
    date: string;
    duration: number;
    engagement: number;
}

export interface ParticipationMetrics {
    frequency: number;
    quality: number;
    improvement: number;
}

export interface FeedbackEntry {
    source: string;
    content: string;
    rating: number;
    date: string;
}

export interface CulturalIntervention {
    type: string;
    objective: string;
    methods: string[];
    duration: number;
    outcomes: {
        success: boolean;
        metrics: {
            understanding: number;
            application: number;
            integration: number;
        };
    };
}

export interface AdaptationResponse {
    student: string;
    adaptationType: string;
    effectiveness: number;
    duration: number;
    feedback: string[];
}

export interface EmotionalChallenge {
    type: string;
    intensity: number;
    duration: number;
    response: {
        initial: string;
        adjusted: string;
        effectiveness: number;
    };
}

export interface SupportIntervention {
    type: string;
    resources: string[];
    duration: number;
    impact: {
        immediate: number;
        sustained: number;
    };
}

export interface EmotionalResponse {
    student: string;
    challenge: string;
    coping: string[];
    effectiveness: number;
    improvements: string[];
}

export interface PeriodicAssessment {
    period: string;
    skills: {
        [key: string]: number;
    };
    overall: number;
    recommendations: string[];
}

export interface ProgressOutcome {
    area: string;
    baseline: number;
    current: number;
    target: number;
    timeline: string[];
}

export interface TransferPerformance {
    context: string;
    skill: string;
    performance: number;
    adaptability: number;
    consistency: number;
}

export interface Learner {
    id: string;
    baseline: {
        manual_skills: {
            accuracy: number;
            fluency: number;
        };
        non_manual_features: {
            precision: number;
            naturalness: number;
        };
    };
    learning_history: LearningRecord[];
}

export interface LearningRecord {
    day: number;
    performance: {
        accuracy: number;
        fluency: number;
    };
}

export interface TrackingPeriod {
    duration: string;
    startDate?: Date;
    endDate?: Date;
}

export interface ManualProgress {
    accuracy_trend: number[];
    handshape_mastery: number;
    movement_control: number;
}

export interface NonManualProgress {
    naturalness_trend: number[];
    facial_accuracy: number;
    body_coordination: number;
}

export interface IntegrationMetrics {
    overall_score: number;
    synchronization: number;
    fluidity: number;
}

export interface SpatialProgress {
    reference_management: number;
    memory_integration: number;
    overall: number;
}

export interface LinguisticProcessingProgress {
    grammar_comprehension: number;
    metalinguistic_awareness: number;
    overall: number;
}

export interface AdaptationEffectiveness {
    support_utilization: number;
    outcome_impact: number;
    overall: number;
}

export interface OverallProgress {
    linguistic_score: number;
    cognitive_score: number;
    adaptation_score: number;
    total_score: number;
}

export interface ProgressRecommendations {
    linguistic: string[];
    cognitive: string[];
    adaptation: string[];
    general: string[];
}

export interface LinguisticProgress {
    manual: ManualProgress;
    nonManual: NonManualProgress;
    integration: IntegrationMetrics;
}

export interface CognitiveProgress {
    spatial: SpatialProgress;
    linguistic: LinguisticProcessingProgress;
    integration: IntegrationMetrics;
}

export interface ProgressReport {
    linguistic: LinguisticProgress;
    cognitive: CognitiveProgress;
    adaptations: AdaptationEffectiveness;
    overall: OverallProgress;
    recommendations: ProgressRecommendations;
}