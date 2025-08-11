// src/ai/systems/expressions/emotions/types.ts
import { LSFExpression } from './lsf/types';
export type { LSFExpression };
/**
 * Types d'émotions de base
 */
export type EmotionType = 'JOY' | 'SADNESS' | 'ANGER' | 'SURPRISE' | 'FEAR' | 'DISGUST';

/**
 * Définit les informations d'entrée pour une émotion à exprimer
 */
export interface EmotionInput {
    /** Type d'émotion (joie, tristesse, colère, etc.) */
    type: string;

    /** Intensité de l'émotion (0.0 à 1.0) */
    intensity: number;

    /** Valence émotionnelle (-1.0 à 1.0, négatif à positif) */
    valence?: number;

    /** Durée souhaitée pour l'expression (en ms) */
    duration?: number;

    /** Contexte optionnel de l'émotion */
    context?: EmotionalContext;

    /** Nuances optionnelles pour raffiner l'expression */
    nuances?: EmotionalNuances;

    /** Métadonnées additionnelles */
    metadata?: EmotionMetadata;
}

/**
 * Représente une émotion analysée et prête à être traduite en LSF
 */
export interface AnalyzedEmotion {
    /** Type d'émotion de base */
    baseType: string;

    /** Intensité calibrée (0.0 à 1.0) */
    calibratedIntensity: number;

    /** Composantes faciales de l'émotion */
    facialComponents: {
        eyebrows: EmotionComponent;
        eyes: EmotionComponent;
        mouth: EmotionComponent;
        head?: EmotionComponent;
    };

    /** Composantes corporelles de l'émotion */
    bodyComponents: {
        shoulders?: EmotionComponent;
        arms?: EmotionComponent;
        posture?: EmotionComponent;
        movement?: EmotionComponent;
    };

    /** Métriques de qualité de l'expression émotionnelle */
    metrics: {
        authenticity: number;
        culturalAccuracy: number;
        expressiveness: number;
    };

    /** Temporalité de l'expression */
    timing: {
        onset: number;
        apex: number;
        offset: number;
        totalDuration: number;
    };
}

/**
 * Définit le contexte émotionnel
 */
export interface EmotionalContext {
    /** But ou objectif de l'expression (information, éducation, etc.) */
    purpose?: string;

    /** Contexte social (formel, informel, éducatif, etc.) */
    social?: string;

    /** Niveau de formalité (0.0 à 1.0) */
    formalityLevel?: number;

    /** Contexte culturel spécifique */
    culturalContext?: string;

    /** Contraintes culturelles spécifiques */
    culturalConstraints?: string[];

    /** Public cible */
    audience?: string;

    /** Environnement de l'interaction */
    environment?: string;

    /** Participants à l'interaction */
    participants?: string[];

    /** Relations entre les participants */
    relationship?: string;
}

/**
 * Nuances émotionnelles pour raffiner l'expression
 */
export interface EmotionalNuances {
    /** Subtilité de l'expression (0.0 à 1.0) */
    subtlety?: number;

    /** Prépondérance faciale vs corporelle (0.0 = corps, 1.0 = visage) */
    facialVsBodyEmphasis?: number;

    /** Émotion secondaire à mélanger */
    secondaryEmotion?: {
        type: string;
        blendRatio: number; // 0.0 à 1.0
    };

    /** Aspects culturels spécifiques à accentuer */
    culturalEmphasis?: string[];
}

/**
 * Métadonnées additionnelles pour l'émotion
 */
export interface EmotionMetadata {
    /** Authenticité de l'expression (0.0 à 1.0) */
    authenticity: number;

    /** Précision culturelle (0.0 à 1.0) */
    culturalAccuracy: number;

    /** Expressivité (0.0 à 1.0) */
    expressiveness: number;

    /** Adaptation sociale (0.0 à 1.0) */
    socialAdaptation?: number;

    /** Source de la requête émotionnelle */
    source?: string;

    /** Priorité de l'émotion (pour la gestion des conflits) */
    priority?: number;

    /** Identifiant unique de l'émotion */
    id?: string;

    /** Timestamp de la requête */
    timestamp?: number;

    /** Tags associés à l'émotion */
    tags?: string[];
}

/**
 * Composante individuelle d'une expression émotionnelle
 */
export interface EmotionComponent {
    /** Intensité de la composante (0.0 à 1.0) */
    intensity: number;

    /** Timing spécifique à cette composante */
    timing: {
        onset: number;
        hold: number;
        release: number;
    };

    /** Paramètres spécifiques à cette composante */
    parameters: Record<string, number>;
}

/**
 * Expression émotionnelle complète
 */
export interface EmotionExpression {
    /** Expression LSF générée */
    expression: LSFExpression;

    /** Nuances appliquées */
    nuances: EmotionalNuances;

    /** Métadonnées de l'expression */
    metadata: EmotionMetadata;
}

/**
 * État émotionnel complet
 */
export interface EmotionState {
    /** Type d'émotion */
    type: string;

    /** Intensité globale */
    intensity: number;

    /** Composantes de l'expression */
    components: EmotionalComponents;

    /** Dynamique temporelle */
    dynamics: EmotionalDynamics;
}

/**
 * Composantes émotionnelles (faciales et gestuelles)
 */
export interface EmotionalComponents {
    /** Expressions faciales */
    facial: FacialExpression;

    /** Expressions gestuelles */
    gestural: GesturalExpression;

    /** Intensité globale */
    intensity: number;
}

/**
 * Dynamique temporelle de l'émotion
 */
export interface EmotionalDynamics {
    /** Durée totale en ms */
    duration: number;

    /** Type de transition */
    transition: TransitionType;

    /** Séquence d'expressions */
    sequence: EmotionalComponents[];
}

/**
 * Type de transition entre expressions
 */
export type TransitionType = 'smooth' | 'abrupt' | 'gradual';

/**
 * Expression faciale
 */
export interface FacialExpression {
    /** Configuration des sourcils */
    eyebrows: string;

    /** Configuration des yeux */
    eyes: string;

    /** Configuration de la bouche */
    mouth: string;

    /** Intensité globale de l'expression faciale */
    intensity: number;
}

/**
 * Expression gestuelle
 */
export interface GesturalExpression {
    /** Configuration des mains */
    hands: string;

    /** Configuration des bras */
    arms: string;

    /** Configuration du corps */
    body: string;

    /** Intensité globale de l'expression gestuelle */
    intensity: number;
}

/**
 * Contexte narratif
 */
export interface NarrativeContext {
    /** Scène actuelle */
    scene: string;

    /** Ambiance générale */
    mood: string;

    /** Émotions précédentes dans la séquence */
    previousEmotions: string[];
}

/**
 * Contexte temporel
 */
export interface TemporalContext {
    /** Durée totale en ms */
    duration: number;

    /** Vitesse de l'expression */
    pace: number;

    /** Points de transition */
    transitions: TransitionPoint[];
}

/**
 * Point de transition émotionnelle
 */
export interface TransitionPoint {
    /** Timestamp en ms */
    timestamp: number;

    /** Émotion au point de transition */
    emotion: string;

    /** Intensité au point de transition */
    intensity: number;
}

/**
 * Résultat d'une expression émotionnelle
 */
export interface EmotionResult {
    /** Expression LSF générée */
    expression: LSFExpression;

    /** Métriques de qualité */
    metrics: {
        authenticity: number;
        culturalAccuracy: number;
        expressiveness: number;
        coherence: number;
    };

    /** Problèmes détectés */
    issues: string[];

    /** Succès de la génération */
    success: boolean;
}