export type ValidatorType = 'human' | 'ai' | 'community';
export type ValidationStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export interface ValidationRequest {
    id: string;
    contentId: string;
    contentType: string;
    content: unknown;
    criteria: string[];
    status: ValidationStatus;
    requiredValidators?: number;
    createdAt: number;
    updatedAt: number;
}

export interface Validation {
    id: string;
    requestId: string;
    validatorId: string;
    validatorType: ValidatorType;
    criteria: string;
    score: number; // 0-100
    feedback: string;
    timestamp: number;
}

export interface ValidationResults {
    request: ValidationRequest;
    validations: Validation[];
    scores: Record<string, number>;
    avgScore: number;
    consensusReached: boolean;
}
