/**
 * Types et interfaces pour les expressions LSF
 * 
 * Ce fichier contient toutes les définitions de types relatives
 * aux expressions en Langue des Signes Française (LSF).
 */

/**
 * Valeurs des composantes d'expression
 * Représente un mapping de propriétés à des valeurs numériques
 */
export interface ExpressionComponentValues {
    [key: string]: number;
}

/**
 * Expression faciale regroupant les différentes composantes
 */
export interface FacialExpression {
    eyebrows?: ExpressionComponentValues;
    mouth?: ExpressionComponentValues;
    eyes?: ExpressionComponentValues;
}

/**
 * Configuration d'une émotion
 */
export interface EmotionConfig {
    type: string;
    intensity?: number;
    priority?: number;
    duration?: number;
}

/**
 * Type d'expression LSF
 */
export type LSFExpressionType =
    | 'manual'
    | 'non-manual'
    | 'spatial'
    | 'emotional'
    | 'lexical'
    | 'grammatical';

/**
 * Type de problème de validation
 */
export type ValidationIssueType =
    | 'SYNTACTIC'
    | 'SEMANTIC'
    | 'CULTURAL'
    | 'TECHNICAL'
    | 'TEMPORAL'
    | 'SPATIAL'
    | 'ETHICAL';

/**
 * Sévérité d'un problème de validation
 */
export type ValidationIssueSeverity =
    | 'INFO'
    | 'WARNING'
    | 'ERROR'
    | 'CRITICAL';

/**
 * Interface pour les problèmes de validation d'expression
 */
export interface ValidationIssue {
    type: ValidationIssueType;
    severity: ValidationIssueSeverity;
    message: string;
    component?: string;
    details?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

/**
 * Résultat de validation d'une expression
 */
export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    score?: number;
}

/**
 * Contexte d'une expression LSF
 */
export interface LSFContext {
    expressions?: LSFExpression[];
    timestamp?: number;
    metadata?: Record<string, string>;
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
 * Résultat d'application d'expression complet
 */
export interface ExpressionResult {
    success: boolean;
    expressionId?: string;
    id?: string;
    message?: string;
    issues?: ValidationIssue[];
    timing?: ExpressionResultTiming;
    performance?: ExpressionResultPerformance;
    [key: string]: unknown; // Pour compatibilité avec ResponseBody
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
 * Structure d'une expression LSF
 * Version consolidée qui regroupe toutes les propriétés des différentes définitions
 */
export interface LSFExpression {
    /**
     * Identifiant unique de l'expression
     */
    id?: string;

    /**
     * Type d'expression
     */
    type: LSFExpressionType | string;

    /**
     * Valeur ou identifiant de l'expression
     */
    value?: string;

    /**
     * Durée en millisecondes
     */
    duration?: number;

    /**
     * Paramètres supplémentaires
     */
    parameters?: Record<string, unknown>;

    /**
     * Information de timing
     */
    timing?: Record<string, unknown>;

    /**
     * Configuration des sourcils
     */
    eyebrows?: Record<string, unknown>;

    /**
     * Configuration de la bouche
     */
    mouth?: Record<string, unknown>;

    /**
     * Configuration des yeux
     */
    eyes?: Record<string, unknown>;

    /**
     * Configuration du corps
     */
    body?: {
        posture?: Record<string, unknown>;
        movement?: Record<string, unknown>;
    };

    /**
     * Configuration des mains
     */
    handshape?: {
        /**
         * Configuration de la main dominante
         */
        dominant?: {
            configuration?: Record<string, unknown>;
            movement?: Record<string, unknown>;
        };

        /**
         * Configuration de la main non-dominante
         */
        nonDominant?: {
            configuration?: Record<string, unknown>;
            movement?: Record<string, unknown>;
        };
    } | Record<string, unknown>;

    /**
     * Contexte émotionnel
     */
    emotionalContext?: {
        emotion: string;
        intensity: number;
    };

    /**
     * Informations spatiales
     */
    spatialInfo?: {
        location: {
            x: number;
            y: number;
            z: number;
        };
        references?: Record<string, unknown>;
    };

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}

// Définitions des interfaces utilisées dans le système d'expressions
export interface HandConfiguration {
    tension?: number;
    flexion?: number;
    extension?: number;
    spread?: number;
    position?: string;
    [key: string]: number | string | undefined;
}

export interface HandMovement {
    speed?: number;
    direction?: string;
    amplitude?: number;
    fluidity?: number;
    repetition?: number;
    [key: string]: number | string | undefined;
}

export interface BodyPosture {
    tension?: number;
    openness?: number;
    inclination?: number;
    orientation?: string;
    [key: string]: number | string | undefined;
}

export interface BodyMovement {
    speed?: number;
    amplitude?: number;
    direction?: string;
    acceleration?: number;
    tension?: number;
    [key: string]: number | string | undefined;
}

export interface ExpressionTiming {
    duration?: number;
    onset?: number;
    offset?: number;
    hold?: number;
    repeat?: number;
    [key: string]: number | undefined;
}