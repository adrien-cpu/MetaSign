// src/ai/types/feedback/validation.ts

/**
 * Interface pour les résultats de validation
 */
export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    score: number;
    metadata?: ValidationMetadata;
}

/**
 * Interface pour les problèmes de validation
 */
export interface ValidationIssue {
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    code?: string;
    location?: {
        elementId?: string;
        position?: {
            x: number;
            y: number;
            z: number;
        };
    };
}

/**
 * Interface pour les métadonnées de validation
 */
export interface ValidationMetadata {
    timestamp?: number;
    validator?: string;
    version?: string;
    executionTime?: number;
    validatedAt?: number;
    validatedBy?: string;
    validationContext?: Record<string, unknown>;
}

/**
 * Type pour le niveau de sévérité
 */
export type ValidationSeverity = 'high' | 'medium' | 'low';

/**
 * Interface pour les options de validation
 */
export interface ValidationOptions {
    strictMode?: boolean;
    includeWarnings?: boolean;
    contextSpecific?: Record<string, unknown>;
    validationLevels?: ValidationSeverity[];
}