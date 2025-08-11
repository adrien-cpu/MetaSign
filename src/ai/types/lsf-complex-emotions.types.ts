// src/ai/types/lsf-complex-emotions.types.ts

/**
 * Représente une expression LSF avec ses composantes émotionnelles
 */
export interface LSFExpression {
    // Composants essentiels de l'expression
    facialComponents: FacialComponents;
    manualComponents: ManualComponents;
    bodyPosture: BodyPostureComponents;
    timing: TimingComponents;

    // Métadonnées associées
    emotion?: string;
    intensity?: number;
    culturalContext?: string;
}

/**
 * Composantes faciales d'une expression LSF
 */
export interface FacialComponents {
    eyebrows?: {
        position?: string;
        inner?: string;
        outer?: string;
        tension?: string;
    };
    eyes?: {
        aperture?: string;
        focus?: string;
        whites?: string;
        blink_rate?: string;
        gaze?: string;
    };
    nose?: {
        wrinkle?: string;
        flare?: string;
        tension?: string;
    };
    mouth?: {
        shape?: string;
        tension?: string;
        corners?: string;
        lips?: string;
        upper_lip?: string;
        lower_lip?: string;
    };
    cheeks?: {
        raise?: string;
        tension?: string;
        side?: string;
    };
}

/**
 * Composantes manuelles d'une expression LSF
 */
export interface ManualComponents {
    handshape?: string;
    orientation?: string;
    location?: string;
    movement?: string;
    nonManualMarkers?: boolean;
}

/**
 * Composantes de posture corporelle
 */
export interface BodyPostureComponents {
    head?: {
        position?: string;
        movement?: string;
        tilt?: string;
        turn?: string;
        alignment?: string;
    };
    shoulders?: {
        position?: string;
        tension?: string;
    };
    body?: {
        tension?: string;
        movement?: string;
        orientation?: string;
    };
}

/**
 * Composantes temporelles d'une expression
 */
export interface TimingComponents {
    onset?: number;
    apex?: number;
    hold?: number;
    offset?: number;
    totalDuration?: number;
    sequence?: SequenceStep[];
}

/**
 * Étape d'une séquence d'expressions
 */
export interface SequenceStep {
    type: string;
    duration: number;
    intensity: string;
    characteristics?: string;
}

/**
 * Contexte émotionnel pour l'évaluation d'expressions
 */
export interface EmotionalContext {
    culturalBackground?: string;
    region?: string;
    generation?: string;
    primaryLanguage?: string;
    emotionalState?: string;
    socialContext?: string;
}

/**
 * Résultat de validation avec score et problèmes détectés
 */
export interface ValidationResult {
    isValid: boolean;
    score: number;
    issues: ValidationIssue[];
}

/**
 * Problème identifié lors de la validation
 */
export interface ValidationIssue {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    details?: Record<string, unknown>;
}

/**
 * Résultat de validation spécifique aux émotions complexes
 */
export interface ComplexValidationResult extends ValidationResult {
    components: {
        primaryEmotionScore: number;
        microExpressionsScore: number;
        emotionalMixtureScore: number;
        culturalAuthenticityScore: number;
    };
    details: {
        microExpressions: MicroExpression[];
        emotionalBalance?: number | undefined;
        integrationPattern?: string | undefined;
    };
}

/**
 * Micro-expression détectée dans une expression LSF
 */
export interface MicroExpression {
    type: string;
    duration: number;
    intensity: number;
    timing: {
        start: number;
        end: number;
    };
    components: Record<string, unknown>;
}

/**
 * Résultat d'analyse d'intégration émotionnelle
 */
export interface EmotionalIntegration {
    type: 'layered' | 'alternating' | 'sequential' | 'blended' | 'conflicting';
    quality: number;
    details?: Record<string, unknown>;
}

/**
 * Types pour les règles d'émotions complexes
 */

export type EmotionKey = 'SURPRISE' | 'FEAR' | 'DISGUST';

export type MixedEmotionKey = 'JOY_SADNESS' | 'ANGER_FEAR' | 'SURPRISE_DISGUST';

export interface ComplexEmotionRules {
    EMOTIONS: Record<EmotionKey, EmotionDefinition>;
    MICRO_EXPRESSIONS: MicroExpressionRules;
    MIXED_EMOTIONS: Record<MixedEmotionKey, MixedEmotionDefinition>;
}

export interface EmotionDefinition {
    PRIMARY_MARKERS: Record<string, unknown>;
    VARIATIONS: Record<string, unknown>;
}

export interface MicroExpressionRules {
    GRAMMATICAL: Record<string, unknown>;
    MODALITY: Record<string, unknown>;
    FEEDBACK: Record<string, unknown>;
}

export interface MixedEmotionDefinition {
    COMPONENTS: {
        primary: string;
        secondary: string;
        balance: number;
        integration: string;
    };
    EXPRESSION: Record<string, unknown>;
}