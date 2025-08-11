// src/ai/api/multimodal/quality/types.ts

export interface ValidationInput {
    content: QualityContent;
    parameters: QualityParameters;
    context: QualityContext;
}

export interface ValidationRule {
    id: string;
    check(input: ValidationInput): Promise<boolean>;
    severity: 'error' | 'warning' | 'info';
}

export interface QualityMetricCalculator {
    calculateMetrics(input: ValidationInput): Promise<QualityMetrics>;
}

export interface QualityMetrics {
    overallQuality: number;
    metrics: Record<string, number>;
}

export interface QualityContent {
    type: string;
    data: unknown;
    metadata: Record<string, unknown>;
}

export interface QualityParameters {
    thresholds: Record<string, number>;
    weights: Record<string, number>;
    options: Record<string, unknown>;
}

export interface QualityContext {
    environment: string;
    constraints: Record<string, unknown>;
    requirements: string[];
}

export interface CoherenceChecker {
    checkCoherence(input: ValidationInput): Promise<CoherenceResult>;
}

export interface CoherenceResult {
    score: number;
    issues: string[];
}

export interface SystemeControleEthique {
    validateOutput(output: ValidationInput): Promise<void>;
    getFinalReport(): Promise<ValidationReport>;
}

export interface SupervisionHumaineRenforcee {
    reviewOutput(output: ValidationInput): Promise<void>;
    getValidationStatus(): Promise<ValidationReport>;
}

export interface ValidationReport {
    status: 'approved' | 'rejected' | 'pending';
    comments: string[];
    timestamp: number;
}

export interface ValidationContext {
    type: string;
    constraints: ValidationConstraints;
    preferences: ValidationPreferences;
}

export interface ValidationConstraints {
    minQuality: number;
    minCoherence: number;
    requiredRules: string[];
}

export interface ValidationPreferences {
    priorityMetrics: string[];
    toleranceLevel: number;
}

export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    score: number;
}

export interface ValidationIssue {
    type: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}