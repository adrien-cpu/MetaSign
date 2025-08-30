/**
 * Types liés à la personnalité et aux émotions
 * @file types/personality.ts
 */

import { PrimaryEmotion, EmotionIntensity, CODAPersonalityType, CulturalEnvironment } from './base';

/** Traits de personnalité Big Five */
export interface BigFiveTraits {
    readonly openness: number;
    readonly conscientiousness: number;
    readonly extraversion: number;
    readonly agreeableness: number;
    readonly neuroticism: number;
}

/** Préférences d'apprentissage */
export interface LearningPreferences {
    readonly preferredTeachingMethods: readonly string[];
    readonly optimalPace: number;
    readonly repetitionTolerance: number;
    readonly visualLearningAffinity?: number;
    readonly socialLearningPreference?: number;
    readonly immediateFeedbackNeed?: number;
}

/** Traits culturels LSF */
export interface LSFCulturalTraits {
    readonly deafCulturalSensitivity: number;
    readonly contextualAdaptation: number;
    readonly regionalNuancesUnderstanding: number;
    readonly socialCodesRespect: number;
    readonly communityIntegration: number;
}

/** Profil de personnalité complet */
export interface PersonalityProfile {
    readonly personalityType: CODAPersonalityType;
    readonly bigFiveTraits: BigFiveTraits;
    readonly learningPreferences: LearningPreferences;
    readonly culturalTraits: LSFCulturalTraits;
    readonly culturalBackground: CulturalEnvironment;
    readonly intrinsicMotivation: number;
    readonly resilience: number;
}

/** État émotionnel complet */
export interface EmotionalState {
    readonly primaryEmotion: PrimaryEmotion;
    readonly intensity: EmotionIntensity;
    readonly secondaryEmotions: ReadonlyMap<PrimaryEmotion, EmotionIntensity>;
    readonly valence: number;
    readonly arousal: number;
    readonly stability: number;
    readonly timestamp: Date;
    readonly triggers?: readonly string[];
    readonly expectedDuration?: number;
}

/** Préférences d'apprentissage étendues pour IA */
export interface ExtendedLearningPreferences extends LearningPreferences {
    readonly visualLearningAffinity: number;
    readonly socialLearningPreference: number;
}

/** Profil de personnalité IA étendu avec traits LSF */
export interface AIPersonalityProfile extends PersonalityProfile {
    readonly lsfTraits?: {
        readonly spatialExpression: number;
        readonly facialExpression: number;
        readonly manualPrecision: number;
        readonly culturalAwareness: number;
        readonly gestualFluency: number;
        readonly contextualAdaptation: number;
    };
    readonly learningPreferences: ExtendedLearningPreferences;
}