// src/ai/systems/expressions/timing/types.ts

/**
 * Représente un composant individuel d'une frame d'animation
 */
export interface FrameComponent {
    /** Position actuelle du composant */
    position: number;
    /** Vitesse actuelle du mouvement */
    velocity: number;
    /** Accélération actuelle */
    acceleration: number;
}

/**
 * Représente une frame complète d'animation avec tous ses composants
 */
export interface Frame {
    /** État des sourcils */
    eyebrows: FrameComponent;
    /** État des yeux */
    eyes: FrameComponent;
    /** État de la bouche */
    mouth: FrameComponent;
    /** Horodatage de la frame en millisecondes */
    timestamp: number;
}

/**
 * Configuration de la séquence d'animation
 */
export interface TimingConfig {
    /** Durée totale de l'animation en millisecondes */
    duration: number;
    /** Taux de rafraîchissement en frames par seconde */
    frameRate: number;
    /** Délai avant le début de l'animation */
    startDelay?: number;
}

/**
 * Paramètres d'interpolation pour les transitions
 */
export interface InterpolationParams {
    /** Type de courbe d'interpolation */
    type: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
    /** Durée de l'interpolation en millisecondes */
    duration: number;
    /** Valeurs de contrôle pour les courbes de Bézier */
    controlPoints?: [number, number, number, number];
}