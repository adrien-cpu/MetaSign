//src/ai/types/expressions/interfaces.ts
/**
 * Interfaces liées aux expressions LSF
 */

/**
 * Valeurs des composantes d'expression
 * Représente un mapping de propriétés à des valeurs numériques
 */
export interface ExpressionComponentValues {
    [key: string]: number;
}

/**
 * Configuration des mains
 */
export interface HandConfiguration {
    tension?: number;
    flexion?: number;
    extension?: number;
    spread?: number;
    position?: string;
    [key: string]: number | string | undefined;
}

/**
 * Mouvements des mains
 */
export interface HandMovement {
    speed?: number;
    direction?: string;
    amplitude?: number;
    fluidity?: number;
    repetition?: number;
    [key: string]: number | string | undefined;
}

/**
 * Posture corporelle
 */
export interface BodyPosture {
    tension?: number;
    openness?: number;
    inclination?: number;
    orientation?: string;
    [key: string]: number | string | undefined;
}

/**
 * Mouvement corporel
 */
export interface BodyMovement {
    speed?: number;
    amplitude?: number;
    direction?: string;
    acceleration?: number;
    tension?: number;
    [key: string]: number | string | undefined;
}

/**
 * Timing de l'expression
 */
export interface ExpressionTiming {
    duration?: number;
    onset?: number;
    offset?: number;
    hold?: number;
    repeat?: number;
    [key: string]: number | undefined;
}

/**
 * Options pour l'application d'expressions
 */
export interface ExpressionOptions {
    duration?: number;
    priority?: 'high' | 'normal' | 'low';
    transitionTime?: number;
    region?: string;
    emotionalIntensity?: number;
    culturalContext?: string[];
}

/**
 * Timing d'un résultat d'expression
 */
export interface ExpressionResultTiming {
    start: number;
    duration: number;
    end: number;
}

/**
 * Performance d'un résultat d'expression
 */
export interface ExpressionResultPerformance {
    preparationTimeMs: number;
    renderTimeMs: number;
    totalTimeMs: number;
}

/**
 * Résultat d'application d'expression
 */
export interface ExpressionResult {
    success: boolean;
    expressionId?: string;
    issues?: ValidationIssue[];
    timing?: ExpressionResultTiming;
    performance?: ExpressionResultPerformance;
    [key: string]: unknown; // Pour compatibilité avec ResponseBody
}

/**
 * Type de problème de validation
 */
export type ValidationIssueType = 'SYNTACTIC' | 'SEMANTIC' | 'CULTURAL' | 'TECHNICAL';

/**
 * Sévérité d'un problème de validation
 */
export type ValidationIssueSeverity = 'INFO' | 'WARNING' | 'ERROR';

/**
 * Problème de validation
 */
export interface ValidationIssue {
    type: ValidationIssueType;
    severity: ValidationIssueSeverity;
    message: string;
    component?: string;
    details?: Record<string, unknown>;
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    score?: number;
}