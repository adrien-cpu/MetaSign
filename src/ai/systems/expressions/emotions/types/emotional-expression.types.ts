// src/ai/systems/expressions/emotions/types/emotional-expression.types.ts

import { LSFExpression } from './LSFExpression';

/**
 * Interface pour les sourcils dans une expression émotionnelle LSF
 */
export interface LSFEyebrows {
    raised?: number;
    furrowed?: number;
    // Autres propriétés des sourcils
    [key: string]: number | undefined;
}

/**
 * Interface pour les yeux dans une expression émotionnelle LSF
 */
export interface LSFEyes {
    openness?: number;
    // Autres propriétés des yeux
    [key: string]: number | Record<string, unknown> | undefined;
}

/**
 * Interface pour la bouche dans une expression émotionnelle LSF
 */
export interface LSFMouth {
    smiling?: number;
    tension?: number;
    corners?: number;
    // Autres propriétés de la bouche
    [key: string]: number | undefined;
}

/**
 * Interface pour la posture corporelle dans une expression émotionnelle LSF
 */
export interface LSFPosture {
    upright?: number;
    tension?: number;
    // Autres propriétés de posture
    [key: string]: number | Record<string, unknown> | undefined;
}

/**
 * Interface pour le mouvement corporel dans une expression émotionnelle LSF
 */
export interface LSFMovement {
    // Propriétés du mouvement
    [key: string]: number | Record<string, unknown> | undefined;
}

/**
 * Interface pour le corps dans une expression émotionnelle LSF
 */
export interface LSFBody {
    posture?: LSFPosture;
    movement?: LSFMovement;
    // Autres propriétés corporelles
    [key: string]: Record<string, unknown> | undefined;
}

/**
 * Interface étendant LSFExpression pour les expressions émotionnelles
 */
export interface EmotionalLSFExpression extends LSFExpression {
    /**
     * Type d'émotion exprimée
     */
    emotionType: string;

    /**
     * Composantes faciales - sourcils
     */
    eyebrows?: LSFEyebrows;

    /**
     * Composantes faciales - yeux
     */
    eyes?: LSFEyes;

    /**
     * Composantes faciales - bouche
     */
    mouth?: LSFMouth;

    /**
     * Composantes corporelles
     */
    body?: LSFBody;
}

/**
 * Interface pour un résultat de cohérence
 */
export interface CoherenceResult {
    isCoherent: boolean;
    issues: string[];
}

/**
 * Interface pour le résultat de cohérence faciale
 */
export interface FacialCoherenceResult extends CoherenceResult { }

/**
 * Interface pour le résultat de cohérence corporelle
 */
export interface BodyCoherenceResult extends CoherenceResult { }