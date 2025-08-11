/**
 * Utility functions for handling results in a consistent way
 */

import { ValidationError } from '@ai/validation/types';

/**
 * Standard result type with success/failure information
 */
export interface Result<T> {
    /**
     * Whether the operation was successful
     */
    success: boolean;

    /**
     * Data returned by the operation (only present if success is true)
     */
    data?: T;

    /**
     * Error information (only present if success is false)
     */
    error?: ValidationError;
}

/**
 * Error codes for different failure scenarios
 */
export enum ErrorCode {
    // Erreurs génériques
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    OPERATION_FAILED = 'OPERATION_FAILED',
    INVALID_INPUT = 'INVALID_INPUT',

    // Erreurs de ressources
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    VALIDATION_NOT_FOUND = 'VALIDATION_NOT_FOUND',
    EXPERT_NOT_FOUND = 'EXPERT_NOT_FOUND',
    CLUB_NOT_FOUND = 'CLUB_NOT_FOUND',
    FEEDBACK_NOT_FOUND = 'FEEDBACK_NOT_FOUND',

    // Erreurs d'état
    INVALID_STATE = 'INVALID_STATE',
    VALIDATION_EXPIRED = 'VALIDATION_EXPIRED',
    CONSENSUS_ALREADY_REACHED = 'CONSENSUS_ALREADY_REACHED',

    // Erreurs de duplication
    DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
    EXPERT_ALREADY_EXISTS = 'EXPERT_ALREADY_EXISTS',
    FEEDBACK_ALREADY_EXISTS = 'FEEDBACK_ALREADY_EXISTS',

    // Erreurs d'autorisation
    UNAUTHORIZED = 'UNAUTHORIZED',
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

    // Erreurs de validation
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    MIN_FEEDBACK_NOT_REACHED = 'MIN_FEEDBACK_NOT_REACHED',

    // Erreurs système
    SYSTEM_NOT_INITIALIZED = 'SYSTEM_NOT_INITIALIZED',
    COMPONENT_NOT_AVAILABLE = 'COMPONENT_NOT_AVAILABLE',

    // Erreurs additionnelles pour l'implémentation des managers
    INVALID_TRANSITION = 'INVALID_TRANSITION',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
    NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',
    TRANSACTION_FAILED = 'TRANSACTION_FAILED',
    INSUFFICIENT_FEEDBACK = 'INSUFFICIENT_FEEDBACK',
    CONSENSUS_CALCULATION_FAILED = 'CONSENSUS_CALCULATION_FAILED',

    // Ajouts pour la compatibilité avec validation-helpers.ts
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_DATA = 'INVALID_DATA',
    STATE_TRANSITION_DENIED = 'STATE_TRANSITION_DENIED'
}

/**
 * Creates a success result
 * @param data Data to include in the result
 * @returns Success result
 */
export function success<T>(data: T): Result<T> {
    return {
        success: true,
        data
    };
}

/**
 * Creates a failure result
 * @param code Error code
 * @param message Error message
 * @param details Additional error details
 * @returns Failure result
 */
export function failure<T>(
    code: ErrorCode | string,
    message: string,
    details?: Record<string, unknown>
): Result<T> {
    const error: ValidationError = {
        code,
        message,
        ...(details !== undefined ? { details } : {})
    };

    return {
        success: false,
        error
    };
}

/**
 * Creates a "resource not found" failure
 * @param resourceType Type of resource that was not found
 * @param resourceId ID of the resource that was not found
 * @returns Failure result
 */
export function notFound<T>(resourceType: string, resourceId: string): Result<T> {
    const codeMap: Record<string, ErrorCode> = {
        'validation': ErrorCode.VALIDATION_NOT_FOUND,
        'expert': ErrorCode.EXPERT_NOT_FOUND,
        'club': ErrorCode.CLUB_NOT_FOUND,
        'feedback': ErrorCode.FEEDBACK_NOT_FOUND
    };

    const code = codeMap[resourceType.toLowerCase()] || ErrorCode.RESOURCE_NOT_FOUND;

    return failure(
        code,
        `${resourceType} with ID '${resourceId}' not found`,
        { resourceType, resourceId }
    );
}

/**
 * Creates an "invalid state" failure
 * @param resourceType Type of resource in invalid state
 * @param resourceId ID of the resource in invalid state
 * @param currentState Current state of the resource
 * @param allowedStates Allowed states for the operation
 * @returns Failure result
 */
export function invalidState<T>(
    resourceType: string,
    resourceId: string,
    currentState: string,
    allowedStates: string[]
): Result<T> {
    return failure(
        ErrorCode.INVALID_STATE,
        `Invalid state for ${resourceType} ${resourceId}: ${currentState} (allowed: ${allowedStates.join(', ')})`,
        { resourceType, resourceId, currentState, allowedStates }
    );
}

/**
 * Crée un résultat d'erreur pour un système non initialisé
 * @param componentName Nom du composant
 * @returns Résultat avec échec
 */
export function notInitialized<T>(componentName: string): Result<T> {
    return failure(
        ErrorCode.SYSTEM_NOT_INITIALIZED,
        `${componentName} is not initialized`,
        { componentName }
    );
}

/**
 * Utility to execute an operation and handle errors consistently
 * @param operation Function to execute
 * @param errorCode Error code to use if the operation fails
 * @param errorMessage Error message to use if the operation fails
 * @returns Result from the operation
 */
export async function tryCatch<T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    errorMessage: string
): Promise<Result<T>> {
    try {
        const result = await operation();
        return success(result);
    } catch (error) {
        console.error(`${errorMessage}: ${error}`);
        return failure(
            errorCode,
            errorMessage,
            { error: error instanceof Error ? error.message : String(error) }
        );
    }
}