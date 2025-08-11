// src/ai/api/validation/interfaces/IValidationSystem.ts

/**
 * Interface for validation request
 */
export interface ValidationRequest {
    type: string;
    content: Record<string, unknown>;
    requester: string;
    minFeedbackRequired?: number;
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
    success: boolean;
    data?: string;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Interface for validation collaboration manager
 */
export interface ICollaborationManager {
    /**
     * Submit a validation proposal
     * @param request Validation request
     * @returns Validation result
     */
    submitProposal(request: ValidationRequest): Promise<ValidationResult>;
}

/**
 * Interface for validation system
 */
export interface IValidationSystem {
    /**
     * Initialize the validation system
     */
    initialize(): Promise<void>;

    /**
     * Get the collaboration manager
     * @returns Collaboration manager instance
     */
    getCollaborationManager(): ICollaborationManager;

    /**
     * Perform health check
     * @returns Health status
     */
    healthCheck(): Promise<{ healthy: boolean; componentName: string }>;

    /**
     * Shutdown the validation system
     */
    shutdown(): Promise<void>;
}