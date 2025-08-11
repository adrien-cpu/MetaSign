/**
 * @file: src/ai/coordinators/errors/orchestrator.errors.ts
 * 
 * Classes d'erreurs spécifiques pour le SystemeOrchestrateurCentral
 * Permet une meilleure gestion des erreurs et une traçabilité améliorée
 */

/**
 * Erreur de base pour l'orchestrateur
 */
export class OrchestratorError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly component?: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'OrchestratorError';
    }
}

/**
 * Erreur lors de l'initialisation d'un composant
 */
export class ComponentInitializationError extends OrchestratorError {
    constructor(
        component: string,
        details?: unknown
    ) {
        super(
            `Failed to initialize component: ${component}`,
            'COMPONENT_INIT_ERROR',
            component,
            details
        );
        this.name = 'ComponentInitializationError';
    }
}

/**
 * Erreur lors du traitement d'une requête
 */
export class RequestProcessingError extends OrchestratorError {
    constructor(
        sessionId: string,
        requestType: string,
        details?: unknown
    ) {
        super(
            `Error processing request of type: ${requestType}`,
            'REQUEST_PROCESSING_ERROR',
            requestType,
            details
        );
        this.name = 'RequestProcessingError';
    }
}

/**
 * Erreur lors de la validation éthique
 */
export class EthicsValidationError extends OrchestratorError {
    constructor(
        reason: string,
        details?: unknown
    ) {
        super(
            `Ethics validation failed: ${reason}`,
            'ETHICS_VALIDATION_ERROR',
            'ethics',
            details
        );
        this.name = 'EthicsValidationError';
    }
}

/**
 * Erreur lors de l'orchestration
 */
export class OrchestrationError extends OrchestratorError {
    constructor(
        requestType: string,
        details?: unknown
    ) {
        super(
            `Orchestration error for request type: ${requestType}`,
            'ORCHESTRATION_ERROR',
            requestType,
            details
        );
        this.name = 'OrchestrationError';
    }
}

/**
 * Erreur liée au cache
 */
export class CacheError extends OrchestratorError {
    constructor(
        operation: string,
        details?: unknown
    ) {
        super(
            `Cache operation failed: ${operation}`,
            'CACHE_ERROR',
            'cache',
            details
        );
        this.name = 'CacheError';
    }
}

/**
 * Erreur liée à l'épuisement de ressources
 */
export class ResourceExhaustedError extends OrchestratorError {
    constructor(
        resource: string,
        details?: unknown
    ) {
        super(
            `Resource exhausted: ${resource}`,
            'RESOURCE_EXHAUSTED',
            resource,
            details
        );
        this.name = 'ResourceExhaustedError';
    }
}

/**
 * Erreur de sécurité
 */
export class SecurityError extends OrchestratorError {
    constructor(
        securityIssue: string,
        details?: unknown
    ) {
        super(
            `Security issue detected: ${securityIssue}`,
            'SECURITY_ERROR',
            'security',
            details
        );
        this.name = 'SecurityError';
    }
}

/**
 * Erreur liée à un composant externe
 */
export class ExternalComponentError extends OrchestratorError {
    constructor(
        component: string,
        operation: string,
        details?: unknown
    ) {
        super(
            `External component error in ${component}.${operation}`,
            'EXTERNAL_COMPONENT_ERROR',
            component,
            details
        );
        this.name = 'ExternalComponentError';
    }
}