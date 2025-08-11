// src/ai/emotions/types/base.ts

/**
 * Type d'émotion de base en LSF
 */
export enum EmotionType {
    JOY = 'joy',
    SADNESS = 'sadness',
    ANGER = 'anger',
    FEAR = 'fear',
    SURPRISE = 'surprise',
    DISGUST = 'disgust',
    NEUTRAL = 'neutral',
    // Émotions complexes
    EXCITEMENT = 'excitement',
    DISAPPOINTMENT = 'disappointment',
    FRUSTRATION = 'frustration',
    ANXIETY = 'anxiety',
    CURIOSITY = 'curiosity',
    PRIDE = 'pride',
    SHAME = 'shame',
    GUILT = 'guilt',
    TRUST = 'trust',
    CONTEMPT = 'contempt'
}

/**
 * Niveau d'intensité d'une émotion
 */
export enum EmotionIntensity {
    VERY_LOW = 0.2,
    LOW = 0.4,
    MEDIUM = 0.6,
    HIGH = 0.8,
    VERY_HIGH = 1.0
}

/**
 * Transition émotionnelle
 */
export interface EmotionTransition {
    /** Émotion cible */
    to: EmotionType;
    /** Délai avant transition (ms) */
    delay: number;
    /** Durée de la transition (ms) */
    duration: number;
}

/**
 * Composante faciale d'une émotion
 */
export interface FacialComponent {
    /** Position des sourcils */
    eyebrows: 'raised' | 'lowered' | 'neutral' | 'furrowed' | string;
    /** Ouverture des yeux */
    eyes: 'wide' | 'narrowed' | 'neutral' | 'closed' | string;
    /** Position des lèvres */
    mouth: 'smile' | 'frown' | 'open' | 'closed' | 'pursed' | string;
    /** Tension des joues */
    cheeks?: 'relaxed' | 'tense' | 'puffed' | string;
    /** Intensité des composantes faciales (0-1) */
    intensity: number;
}

/**
 * Composante gestuelle d'une émotion
 */
export interface GesturalComponent {
    /** Position des mains */
    hands: 'relaxed' | 'tense' | 'fists' | 'open' | string;
    /** Vitesse des mouvements */
    speed: 'slow' | 'normal' | 'fast' | 'very_fast' | string;
    /** Amplitude des mouvements */
    amplitude: 'small' | 'medium' | 'large' | 'very_large' | string;
    /** Tension corporelle */
    tension: 'relaxed' | 'slight' | 'tense' | 'very_tense' | string;
    /** Intensité des composantes gestuelles (0-1) */
    intensity: number;
}

/**
 * Composantes d'une émotion
 */
export interface EmotionComponents {
    /** Composante faciale */
    facial: FacialComponent;
    /** Composante gestuelle */
    gestural: GesturalComponent;
    /** Composantes supplémentaires */
    additional?: Record<string, unknown>;
}

/**
 * Dynamique d'une émotion
 */
export interface EmotionDynamics {
    /** Durée de l'expression (ms) */
    duration: number;
    /** Délai avant l'expression maximale (ms) */
    peakDelay: number;
    /** Durée de maintien (ms) */
    holdDuration: number;
    /** Temps de décroissance (ms) */
    decayTime: number;
    /** Transitions vers d'autres émotions */
    transitions: EmotionTransition[];
}

/**
 * Version partielle de EmotionDynamics qui gère explicitement transitions | undefined
 * Cette interface est utilisée pour les opérations de fusion avec exactOptionalPropertyTypes: true
 */
export interface PartialEmotionDynamics {
    /** Durée de l'expression (ms) */
    duration?: number;
    /** Délai avant l'expression maximale (ms) */
    peakDelay?: number;
    /** Durée de maintien (ms) */
    holdDuration?: number;
    /** Temps de décroissance (ms) */
    decayTime?: number;
    /** Transitions vers d'autres émotions */
    transitions?: EmotionTransition[];
}

/**
 * Contexte d'une émotion
 */
export interface EmotionContext {
    /** Déclencheur de l'émotion */
    trigger: string;
    /** Cible de l'émotion */
    target?: string;
    /** Informations contextuelles */
    contextualInfo?: Record<string, unknown>;
    /** Niveau de désirabilité (-1 à 1) */
    desirability?: number;
    /** Niveau de contrôle (0-1) */
    control?: number;
    /** Pertinence sociale (0-1) */
    socialRelevance?: number;
}

/**
 * État d'une émotion
 */
export interface EmotionState {
    /** Type d'émotion */
    type: EmotionType;
    /** Intensité (0-1) */
    intensity: number;
    /** Composantes de l'émotion */
    components: EmotionComponents;
    /** Dynamique de l'émotion */
    dynamics: EmotionDynamics;
    /** Contexte de l'émotion */
    context?: EmotionContext;
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Pattern émotionnel identifié
 */
export interface EmotionPattern {
    /** Type de pattern */
    type: 'intensity' | 'component' | 'dynamic' | 'contextual';
    /** Description du pattern */
    description: string;
    /** Taux de confiance (0-1) */
    confidence: number;
    /** Fréquence d'apparition */
    frequency?: number;
    /** Émotions impliquées */
    emotions: EmotionType[];
    /** Données additionnelles */
    data?: Record<string, unknown>;
}

/**
 * Ajustement recommandé pour une émotion
 */
export interface EmotionAdjustment {
    /** Type d'ajustement */
    type: 'intensity' | 'component' | 'dynamic' | 'transition';
    /** Description de l'ajustement */
    description: string;
    /** Priorité (0-1) */
    priority: number;
    /** Valeur actuelle */
    currentValue: number | string;
    /** Valeur recommandée */
    recommendedValue: number | string;
    /** Raison de l'ajustement */
    reason: string;
}

/**
 * Métriques pour l'évaluation des émotions
 */
export interface EmotionMetrics {
    /** Précision de l'expression (0-1) */
    accuracy: number;
    /** Cohérence des composantes (0-1) */
    consistency: number;
    /** Pertinence contextuelle (0-1) */
    relevance: number;
    /** Adéquation temporelle (0-1) */
    timeliness: number;
    /** Métriques additionnelles */
    additional?: Record<string, number>;
}

/**
 * Recommandation pour améliorer l'expression émotionnelle
 */
export interface EmotionRecommendation {
    /** Type de recommandation */
    type: 'intensity' | 'component' | 'dynamic';
    /** Description */
    description: string;
    /** Priorité (0-10) */
    priority: number;
    /** Actions spécifiques à entreprendre */
    actions: string[];
    /** Exemples pratiques */
    examples?: string[];
    /** Impact attendu sur les métriques */
    expectedImprovement?: Partial<EmotionMetrics>;
}

/**
 * Analyse complète d'une émotion
 */
export interface EmotionAnalysis {
    /** Analyse d'intensité */
    intensity: {
        /** Valeur d'intensité (0-1) */
        value: number;
        /** Pertinence de l'intensité (0-1) */
        appropriateness: number;
        /** Cohérence de l'intensité (0-1) */
        consistency: number;
    };
    /** Analyse des composantes */
    components: {
        /** Analyse faciale */
        facial: Record<string, unknown>;
        /** Analyse gestuelle */
        gestural: Record<string, unknown>;
        /** Cohérence entre composantes (0-1) */
        coherence: number;
    };
    /** Analyse de la dynamique */
    dynamics: {
        /** Analyse du timing */
        timing: Record<string, unknown>;
        /** Analyse des transitions */
        transitions: Record<string, unknown>;
        /** Fluidité du flux émotionnel (0-1) */
        flow: number;
    };
    /** Analyse contextuelle */
    context: {
        /** Pertinence contextuelle (0-1) */
        relevance: number;
        /** Adéquation sociale (0-1) */
        socialAppropriateness: number;
        /** Facteurs contextuels identifiés */
        factors: string[];
    };
}

/**
 * Ajustements déterminés pour l'émotion
 */
export interface EmotionAdjustments {
    /** Ajustements d'intensité */
    intensity: EmotionAdjustment[];
    /** Ajustements de composantes */
    components: EmotionAdjustment[];
    /** Ajustements de dynamique */
    dynamics: EmotionAdjustment[];
}