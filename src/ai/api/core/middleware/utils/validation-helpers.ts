// src/ai/api/core/middleware/utils/validation-helpers.ts
import { IAPIContext } from '@api/core/types';
import { ValidationError, ErrorSeverity } from '@api/common/validation/types/ValidationTypes';

// Fonction d'aide pour créer des ValidationError complètes
function createValidationError(code: string, field: string, message: string): ValidationError {
    return {
        code,
        field,
        message,
        severity: ErrorSeverity.MEDIUM,
        timestamp: Date.now(), // Utiliser Date.now() qui retourne un timestamp en millisecondes (number)
        // Ne pas inclure les propriétés optionnelles si elles ne sont pas nécessaires
    };
}

export interface ValidationOptions {
    strictMode?: boolean;
    customErrorMessages?: Record<string, string>;
    throwOnError?: boolean;
}

/**
 * Validates that required headers are present in the request
 * @param context API context containing the request
 * @param requiredHeaders Array of required header names
 * @param options Validation options
 * @returns Result object with validation status and errors
 */
export function validateRequiredHeaders(
    context: IAPIContext,
    requiredHeaders: string[],
    options: ValidationOptions = {}
): { isValid: boolean; errors: ValidationError[] } {
    const { strictMode = false, customErrorMessages = {}, throwOnError = false } = options;
    const errors: ValidationError[] = [];

    // Correction: S'assurer que headers existe avant d'appeler Object.keys
    const headers = context.request.headers || {};
    const headersLowerCase = Object.keys(headers).map(h => h.toLowerCase());

    for (const header of requiredHeaders) {
        const headerLowerCase = header.toLowerCase();
        if (!headersLowerCase.includes(headerLowerCase)) {
            const message = customErrorMessages[header] || `Missing required header: ${header}`;
            errors.push(createValidationError(
                'MISSING_REQUIRED_HEADER',
                header,
                message
            ));
        }
    }

    // In strict mode, check for empty values
    if (strictMode) {
        for (const header of requiredHeaders) {
            const headerLowerCase = header.toLowerCase();
            // Correction: Utiliser les headers définis ci-dessus
            const headerValue = headers[headerLowerCase];

            if (headersLowerCase.includes(headerLowerCase) &&
                (headerValue === undefined || headerValue === null || headerValue === '')) {
                const message = customErrorMessages[`${header}_empty`] ||
                    `Required header ${header} cannot be empty`;
                errors.push(createValidationError(
                    'EMPTY_REQUIRED_HEADER',
                    header,
                    message
                ));
            }
        }
    }

    const isValid = errors.length === 0;

    if (!isValid && throwOnError) {
        throw new Error(
            `Validation failed: ${errors.map(e => e.message).join(', ')}`
        );
    }

    return { isValid, errors };
}

/**
 * Validates request body against a schema
 * @param body Request body
 * @param schema Validation schema (property name to type)
 * @param options Validation options
 * @returns Result object with validation status and errors
 */
export function validateRequestBody<T extends Record<string, unknown>>(
    body: unknown,
    schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'array'>,
    options: ValidationOptions = {}
): { isValid: boolean; errors: ValidationError[]; validatedBody?: T } {
    const { strictMode = false, customErrorMessages = {}, throwOnError = false } = options;
    const errors: ValidationError[] = [];

    // Check if body is an object
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        errors.push(createValidationError(
            'INVALID_BODY_FORMAT',
            'body',
            'Request body must be an object'
        ));

        if (throwOnError) {
            throw new Error('Validation failed: Request body must be an object');
        }

        return { isValid: false, errors };
    }

    const typedBody = body as Record<string, unknown>;
    const validatedBody: Record<string, unknown> = {};

    // Check required fields and types
    for (const [field, expectedType] of Object.entries(schema)) {
        const value = typedBody[field];

        if (value === undefined || value === null) {
            const message = customErrorMessages[field] || `Missing required field: ${field}`;
            errors.push(createValidationError(
                'MISSING_REQUIRED_FIELD',
                field,
                message
            ));
            continue;
        }

        // Type validation
        let isTypeValid = false;

        switch (expectedType) {
            case 'string':
                isTypeValid = typeof value === 'string';
                break;
            case 'number':
                isTypeValid = typeof value === 'number';
                break;
            case 'boolean':
                isTypeValid = typeof value === 'boolean';
                break;
            case 'object':
                isTypeValid = typeof value === 'object' && !Array.isArray(value) && value !== null;
                break;
            case 'array':
                isTypeValid = Array.isArray(value);
                break;
        }

        if (!isTypeValid) {
            const message = customErrorMessages[`${field}_type`] ||
                `Invalid type for field ${field}. Expected ${expectedType}`;
            errors.push(createValidationError(
                'INVALID_FIELD_TYPE',
                field,
                message
            ));
            continue;
        }

        // Add to validated body
        validatedBody[field] = value;
    }

    // In strict mode, check for extra fields
    if (strictMode) {
        const schemaFields = Object.keys(schema);
        const bodyFields = Object.keys(typedBody);

        for (const field of bodyFields) {
            if (!schemaFields.includes(field)) {
                const message = customErrorMessages['extra_fields'] ||
                    `Unexpected field in request body: ${field}`;
                errors.push(createValidationError(
                    'UNEXPECTED_FIELD',
                    field,
                    message
                ));
            }
        }
    }

    const isValid = errors.length === 0;

    if (!isValid && throwOnError) {
        throw new Error(
            `Validation failed: ${errors.map(e => e.message).join(', ')}`
        );
    }

    // Correction: Rendre l'expression de retour plus explicite pour TypeScript
    if (isValid) {
        return {
            isValid,
            errors,
            validatedBody: validatedBody as T
        };
    } else {
        return {
            isValid,
            errors
        };
    }
}