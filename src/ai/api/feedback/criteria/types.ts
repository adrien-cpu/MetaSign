// src/ai/api/feedback/criteria/types.ts

export type CriteriaType =
    | 'GRAMMATICAL_ACCURACY'
    | 'SIGN_CLARITY'
    | 'CONTEXTUAL_RELEVANCE'
    | 'CULTURAL_APPROPRIATENESS'
    | 'TIMING_FLUIDITY';

export interface RatingCriteria {
    type: CriteriaType;
    value: number;
    comment?: string;
}

export interface CriteriaEvaluation {
    type: CriteriaType;
    score: number;
    weight: number;
    feedback: string;
}

export interface CriteriaValidator {
    validate(value: number): Promise<number>;
}

export interface WeightCalculator {
    calculate(type: CriteriaType): number;
}

export interface LearningInteraction {
    id: string;
    type: string;
    timestamp: number;
    data: Record<string, unknown>;
}

export interface LearningOutcome {
    success: boolean;
    score: number;
    feedback: string;
}

export interface SuccessMetrics {
    accuracy: number;
    completion: number;
    speed: number;
}

export interface ComprehensionLevel {
    basic: number;
    intermediate: number;
    advanced: number;
}

export interface Improvement {
    area: string;
    suggestion: string;
    priority: number;
}

export interface LearningStep {
    order: number;
    description: string;
    requirements: string[];
}