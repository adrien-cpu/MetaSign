// src/ai/systems/expressions/lsf/types.ts
import { LSFExpressionType } from '../grammar/types/transition-types';

/**
 * Interface pour les propriétés des composants d'expression
 * Représente un ensemble de valeurs numériques pour différents paramètres
 */
export interface ExpressionComponentProperties {
    [key: string]: number | boolean | Record<string, unknown> | undefined;
}

/**
 * Interface pour la position 3D
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
    [key: string]: number; // Signature d'index pour permettre l'accès dynamique
}

/**
 * Position des sourcils pour une expression LSF
 */
export interface EyebrowsPosition {
    raised?: number;
    furrowed?: number;
    asymmetry?: number;
    intensity?: number;
    [key: string]: number | undefined; // Signature d'index pour permettre l'accès dynamique
}

/**
 * Position de la tête pour une expression LSF
 */
export interface HeadPosition {
    rotation?: Position3D;
    tilt?: number;
    nod?: number;
    intensity?: number;
    [key: string]: number | Position3D | undefined; // Signature d'index pour permettre l'accès dynamique
}

/**
 * Configuration de la bouche pour une expression LSF
 */
export interface MouthConfiguration {
    openness?: number;
    spread?: number;
    roundness?: number;
    tensed?: boolean;
    intensity?: number;
    [key: string]: number | boolean | undefined; // Signature d'index pour permettre l'accès dynamique
}

/**
 * Interface pour un composant d'expression faciale/corporelle
 */
export interface ExpressionComponent {
    /** Position du composant */
    position: number;

    /** Intensité du composant (0.0 à 1.0) */
    intensity: number;

    /** Durée d'activation en millisecondes */
    duration: number;

    /** Propriétés spécifiques au composant */
    properties: Record<string, number | boolean>;
}

/**
 * Interface pour les composants manuels (signes)
 */
export interface ManualComponent {
    /** Forme de la main */
    handShape: string;

    /** Orientation de la main */
    orientation: string;

    /** Mouvement de la main */
    movement: string;

    /** Position de la main */
    location: Position3D;
}

/**
 * Interface pour le timing d'une expression
 */
export interface TimingComponent {
    /** Durée totale en millisecondes */
    duration: number;

    /** Temps de début de l'expression en millisecondes */
    onset: number;

    /** Temps de maintien à l'intensité maximale en millisecondes */
    hold?: number;

    /** Temps de relâchement de l'expression en millisecondes */
    release?: number;

    /** Composants temporels spécifiques */
    components?: Record<string, number>;

    /** Transitions entre les états */
    transitions?: unknown[];

    /** Durée totale */
    totalDuration?: number;

    /** Autres propriétés de timing */
    [key: string]: number | Record<string, number> | unknown[] | undefined;
}

/**
 * Métadonnées pour une expression LSF
 */
export interface LSFExpressionMetadata {
    /** Durée totale de l'expression en millisecondes */
    duration?: number;

    /** Intensité globale de l'expression (0.0 à 1.0) */
    intensity?: number;

    /** Priorité de l'expression (0.0 à 1.0) */
    priority?: number;

    /** Contexte culturel de l'expression */
    cultural?: string;

    /** Authenticité de l'expression (0.0 à 1.0) */
    authenticity?: number;

    /** Précision culturelle de l'expression (0.0 à 1.0) */
    culturalAccuracy?: number;

    /** Expressivité de l'expression (0.0 à 1.0) */
    expressiveness?: number;

    /** Adaptation sociale de l'expression */
    socialAdaptation?: number;

    /** Autres métadonnées */
    [key: string]: number | string | undefined;
}

/**
 * Expression complète en LSF, combinant différents composants
 */
export interface LSFExpression {
    /** Type d'expression grammaticale */
    expressionType?: LSFExpressionType;

    /** Configuration des sourcils */
    eyebrows: EyebrowsPosition;

    /** Configuration de la tête */
    head: HeadPosition;

    /** Configuration de la bouche */
    mouth: MouthConfiguration;

    /** Configuration des yeux (optionnel) */
    eyes?: ExpressionComponentProperties;

    /** Composantes corporelles (optionnel) */
    body?: {
        /** Posture du corps */
        posture?: ExpressionComponentProperties;

        /** Mouvement du corps */
        movement?: ExpressionComponentProperties;
    };

    /** Composant manuel pour les signes (optionnel) */
    manual?: ManualComponent;

    /** Configuration temporelle de l'expression (optionnel) */
    timing?: TimingComponent;

    /** Type d'émotion exprimée (optionnel) */
    emotionType?: string;

    /** Métadonnées de l'expression */
    metadata?: LSFExpressionMetadata;
}

// Alias pour la compatibilité avec le code existant
export type LSFSign = LSFExpression;