//src/ai/types/expressions/index.ts
/**
 * Types principaux pour les expressions LSF
 */
import { BodyMovement, BodyPosture, HandConfiguration, HandMovement, ValidationIssue, ValidationResult } from './interfaces';

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
 * Structure d'une expression LSF
 */
export interface LSFExpression {
    /**
     * Type d'expression
     */
    type: LSFExpressionType;

    /**
     * Valeur ou identifiant de l'expression
     */
    value?: string;

    /**
     * Durée en millisecondes
     */
    duration?: number;

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
        posture?: BodyPosture;
        movement?: BodyMovement;
    };

    /**
     * Configuration des mains
     */
    handshape?: {
        /**
         * Configuration de la main dominante
         */
        dominant?: {
            configuration?: HandConfiguration;
            movement?: HandMovement;
        };

        /**
         * Configuration de la main non-dominante
         */
        nonDominant?: {
            configuration?: HandConfiguration;
            movement?: HandMovement;
        };
    };

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

export { ValidationIssue, ValidationResult };