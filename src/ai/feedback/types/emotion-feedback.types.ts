// Ces importations sont utilisées dans les types référencés
/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmotionState } from '@ai/emotions/types/base';
import { QualityMetrics, FeedbackPattern, FeedbackRecommendation } from './feedback.types';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Interface pour les analyses d'intensité d'émotion
 * @param emotion État d'émotion (type EmotionState)
 */
export interface EmotionIntensityAnalysis {
    value: number;
    appropriateness: number;
    consistency: number;
}

/**
 * Interface pour les analyses de composantes faciales
 */
export interface FacialComponentAnalysis {
    eyebrows: unknown;
    eyes: unknown;
    mouth: unknown;
    intensity: number;
    quality: number;
}

/**
 * Interface pour les analyses de composantes gestuelles
 */
export interface GesturalComponentAnalysis {
    hands: unknown;
    speed: unknown;
    amplitude: unknown;
    tension: unknown;
    intensity: number;
    quality: number;
}

/**
 * Interface pour les analyses de composantes d'émotion
 */
export interface EmotionComponentAnalysis {
    facial: FacialComponentAnalysis;
    gestural: GesturalComponentAnalysis;
    coherence: number;
}

/**
 * Interface pour les analyses de timing d'émotion
 */
export interface EmotionTimingAnalysis {
    duration: number;
    peakDelay: number;
    holdDuration: number;
    decayTime: number;
    quality: number;
}

/**
 * Interface pour les détails de transition
 */
export interface TransitionDetail {
    targetEmotion: string;
    delay: number;
    duration: number;
    smoothness: number;
}

/**
 * Interface pour les analyses de transitions d'émotion
 */
export interface EmotionTransitionAnalysis {
    count: number;
    quality: number;
    details: TransitionDetail[];
}

/**
 * Interface pour les analyses de dynamique d'émotion
 */
export interface EmotionDynamicsAnalysis {
    timing: EmotionTimingAnalysis;
    transitions: EmotionTransitionAnalysis;
    flow: number;
}

/**
 * Interface pour les analyses de contexte d'émotion
 * @see QualityMetrics - Type référencé pour les métriques de qualité
 */
export interface EmotionContextAnalysis {
    relevance: number;
    appropriateness: number;
    socialAppropriateness?: number;
    factors?: string[];
    [key: string]: unknown;
}

/**
 * Interface pour les analyses d'émotion complètes
 */
export interface EmotionAnalysis {
    intensity: EmotionIntensityAnalysis;
    components: EmotionComponentAnalysis;
    dynamics: EmotionDynamicsAnalysis;
    context: EmotionContextAnalysis;
}

/**
 * Type pour les ajustements d'intensité
 */
export type IntensityAdjustment = {
    type: 'intensity';
    description: string;
    priority: number;
    currentValue: number;
    recommendedValue: number;
    reason: string;
};

/**
 * Type pour les ajustements de composante
 */
export type ComponentAdjustment = {
    type: 'component';
    description: string;
    priority: number;
    currentValue: string;
    recommendedValue: string;
    reason: string;
};

/**
 * Type pour les ajustements de dynamique
 */
export type DynamicAdjustment = {
    type: 'dynamic';
    description: string;
    priority: number;
    currentValue: string;
    recommendedValue: string;
    reason: string;
};

/**
 * Interface pour les ajustements d'émotion
 */
export interface EmotionAdjustments {
    intensity: IntensityAdjustment[];
    components: ComponentAdjustment[];
    dynamics: DynamicAdjustment[];
}

/**
 * Interface pour les patterns d'émotion
 * @see EmotionState - Type utilisé pour référencer l'état d'émotion
 */
export interface EmotionPattern {
    type: 'intensity' | 'component' | 'dynamic';
    description: string;
    confidence: number;
    emotions: string[];
    data?: Record<string, unknown>;
}

/**
 * Interface pour les métriques attendues d'une recommandation
 * @see FeedbackRecommendation - Type référencé pour les recommandations
 */
export interface ExpectedMetricImprovements {
    accuracy?: number;
    consistency?: number;
    relevance?: number;
    timeliness?: number;
    [key: string]: number | undefined;
}

/**
 * Interface pour les recommandations d'émotion
 */
export interface EmotionRecommendation {
    type: 'intensity' | 'component' | 'dynamic';
    description: string;
    priority: number;
    actions: string[];
    examples?: string[];
    expectedImprovement?: ExpectedMetricImprovements;
}

/**
 * Type pour les données spécifiques aux émotions dans un FeedbackPattern
 * @see FeedbackPattern - Type utilisé pour les modèles de feedback
 */
export type EmotionFeedbackPatternData = {
    emotions: string[];
    [key: string]: unknown;
};