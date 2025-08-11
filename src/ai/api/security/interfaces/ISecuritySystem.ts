// src/ai/api/security/interfaces/ISecuritySystem.ts

/**
 * Interface representing security access request
 */
export interface SecurityAccessRequest {
    source: {
        zone: string;
        endpoint: string;
    };
    target: {
        zone: string;
        resource: string;
    };
    context: Record<string, unknown>;
    operation: string;
}

/**
 * Interface representing security access result
 */
export interface SecurityAccessResult {
    allowed: boolean;
    reason: string;
}

/**
 * Interface for component registration
 */
export interface ComponentRegistration {
    accessLevel: string;
    component: unknown;
    operations: string[];
    auditLevel: string;
}

/**
 * Interface for security system functionality
 */
export interface ISecuritySystem {
    /**
     * Register a component with the security system
     * @param componentId Unique identifier for the component
     * @param registration Component registration details
     */
    registerComponent(componentId: string, registration: ComponentRegistration): Promise<void>;

    /**
     * Unregister a component from the security system
     * @param componentId Unique identifier for the component
     */
    unregisterComponent(componentId: string): Promise<void>;

    /**
     * Validate access for a security request
     * @param request Access request to validate
     * @returns Access result
     */
    validateAccess(request: SecurityAccessRequest): Promise<SecurityAccessResult>;
}