// src/ai/specialized/grammar/types/index.ts

/**
 * Résultat de validation avec score de confiance et détails
 */
export interface ValidationResult {
    isValid: boolean;
    score: number;
    details: ValidationDetails;
}

/**
 * Détails de validation - structure générique
 */
export interface ValidationDetails {
    message?: string;
    errorDetails?: Record<string, unknown>;
    issues?: string[];
    timestamp: number;
    [key: string]: unknown;
}

/**
 * Contexte grammatical pour évaluer les expressions dans leur contexte
 */
export interface GrammaticalContext {
    sentenceType?: 'DECLARATION' | 'QUESTION' | 'COMMAND' | 'EXCLAMATION';
    topic?: string;
    mood?: 'NEUTRAL' | 'EMPHATIC' | 'CONDITIONAL' | 'SUBJUNCTIVE';
    tense?: 'PRESENT' | 'PAST' | 'FUTURE';
    register?: 'FORMAL' | 'INFORMAL' | 'FAMILIAR';
    spatialSetup?: Record<string, unknown>;
    currentReferents?: string[];
    [key: string]: unknown;
}

// Export des types spécifiques à la posture corporelle
export * from './body-posture.types';