// src/ai/systems/expressions/emotions/contextual/EmotionAdaptationEngine.ts

import {
    EmotionBase,
    EmotionContext,
    AdaptedEmotion,
    EmotionIntensity,
    EmotionAdaptationResult,
    CulturalContext,
    NarrativeContext,
    SocialContext,
    TemporalContext
} from '@ai/types/emotions/contextual.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { ContextualAdaptationValidator } from './evaluation/ContextualAdaptationValidator';
import { Logger } from '@ai/utils/Logger';

// Ajout des interfaces nécessaires
interface AdaptationPlan {
    cultural?: CulturalAdaptationPlan;
    narrative?: NarrativeAdaptationPlan;
    social?: SocialAdaptationPlan;
    temporal?: TemporalAdaptationPlan;
}

interface CulturalAdaptationPlan {
    intensityAdjustment: IntensityAdjustment;
    expressionModifications: ExpressionModifications;
    culturalNotes: string[];
}

interface NarrativeAdaptationPlan {
    intensityAdjustment: IntensityAdjustment;
    progressionModifiers: ProgressionModifiers;
    characterConsistency: CharacterConsistency;
}

interface SocialAdaptationPlan {
    intensityAdjustment: IntensityAdjustment;
    formalityModifiers: FormalityModifiers;
    relationshipModifiers: RelationshipModifiers;
}

interface TemporalAdaptationPlan {
    durationModifier: DurationModifier;
    transitionTiming: TransitionTiming;
    repetitionPattern: RepetitionPattern;
}

interface IntensityAdjustment {
    factor: number;
    reason: string;
}

interface ExpressionModifications {
    facialExpression?: FacialExpressionModification;
    handMovements?: HandMovementModification;
    [key: string]: unknown;
}

interface FacialExpressionModification {
    eyebrows?: string;
    eyes?: string;
    restraint?: string;
    neutralization?: string;
    dynamism?: string;
}

interface HandMovementModification {
    amplitude?: string;
    speed?: string;
}

interface ProgressionModifiers {
    facialExpression?: {
        intensity?: string;
        dynamism?: string;
    };
    bodyPosture?: {
        tension?: string;
        forward_lean?: string;
    };
    timing?: {
        acceleration?: string;
        rhythm?: string;
    };
}

interface CharacterConsistency {
    consistent: boolean;
    notes: string[];
}

interface FormalityModifiers {
    facialExpression?: FacialExpressionModification;
    bodyPosture?: {
        openness?: string;
        tension?: string;
    };
}

interface RelationshipModifiers {
    expressionBoundaries?: {
        limitExpressionIntensity?: boolean;
        maintainProfessionalDistance?: boolean;
        allowIncreasedWarmth?: boolean;
        culturalFamilyNorms?: string;
        maintainRespectMarkers?: boolean;
        allowPedagogicalExaggeration?: boolean;
    };
}

interface DurationModifier {
    duration: number;
    reason: string;
}

interface TransitionTiming {
    fadeIn: TransitionProperties;
    fadeOut: TransitionProperties;
    fromPrevious?: EmotionTransition;
    toNext?: EmotionTransition;
}

interface TransitionProperties {
    duration: number;
    curve: string;
}

interface EmotionTransition {
    emotionType: string;
    duration: number;
    elements: string[];
}

interface RepetitionPattern {
    enabled: boolean;
    count: number;
    interval?: number;
    rhythm?: 'building' | 'diminishing';
    intensityProgression?: 'increasing' | 'decreasing';
}

// Ajout des types spécifiques pour les retours des méthodes
interface ValidationSummary {
    isValid: boolean;
    errors: Array<{
        code: string;
        message: string;
        severity: 'warning' | 'error';
        component?: string;
    }>;
}

interface AdaptationMetrics {
    processingTime: number;
    adaptationsApplied: number;
    validationsPassed: number;
    validationsFailed: number;
}

interface EmotionAdjustment {
    component: string;
    originalValue: number;
    adjustedValue: number;
    factor: number;
    reason: string;
}

/**
 * The EmotionAdaptationEngine is responsible for adapting base emotions to specific contexts,
 * ensuring cultural appropriateness, narrative coherence, social appropriateness, and proper
 * temporal expression in LSF.
 */
export class EmotionAdaptationEngine {
    private readonly metricsCollector: IMetricsCollector;
    private readonly adaptationValidator: ContextualAdaptationValidator;
    private readonly logger: Logger;

    constructor(
        metricsCollector: IMetricsCollector,
        adaptationValidator: ContextualAdaptationValidator,
        logger: Logger
    ) {
        this.metricsCollector = metricsCollector;
        this.adaptationValidator = adaptationValidator;
        this.logger = logger;
    }

    /**
     * Adapts a base emotion to the provided context
     * @param baseEmotion The base emotion to adapt
     * @param context The context to adapt the emotion to
     * @returns The adapted emotion and validation results
     */
    public async adaptEmotion(
        baseEmotion: EmotionBase,
        context: EmotionContext
    ): Promise<EmotionAdaptationResult> {
        this.metricsCollector.recordMetric('emotion_adaptation.start', 1);
        const startTime = performance.now();

        try {
            this.logger.info('Starting emotion adaptation', {
                emotion: baseEmotion.type,
                intensity: baseEmotion.intensity,
                contextTypes: Object.keys(context)
            });

            // Step 1: Generate adaptation plan
            const adaptationPlan = this.generateAdaptationPlan(baseEmotion, context);

            // Step 2: Apply contextual adaptations in sequence
            const culturallyAdapted = this.applyCulturalAdaptation(
                baseEmotion,
                adaptationPlan,
                context.cultural
            );

            const narrativelyAdapted = this.applyNarrativeAdaptation(
                culturallyAdapted,
                adaptationPlan,
                context.narrative
            );

            const sociallyAdapted = this.applySocialAdaptation(
                narrativelyAdapted,
                adaptationPlan,
                context.social
            );

            const temporallyAdapted = this.applyTemporalAdaptation(
                sociallyAdapted,
                adaptationPlan,
                context.temporal
            );

            // Step 3: Finalize adapted emotion with all contextual modifications
            const adaptedEmotion = this.finalizeAdaptation(
                baseEmotion,
                temporallyAdapted,
                adaptationPlan,
                context
            );

            // Step 4: Validate the adaptation
            const validationResult = await this.validateAdaptation(
                baseEmotion,
                adaptedEmotion,
                context
            );

            // Log detailed information about the adaptation
            this.logger.info('Emotion adaptation completed', {
                originalEmotion: baseEmotion.type,
                adaptedEmotion: adaptedEmotion.type,
                originalIntensity: baseEmotion.intensity,
                adaptedIntensity: adaptedEmotion.intensity,
                modifiedComponents: adaptedEmotion.modifiedComponents,
                validationSuccess: validationResult.isValid
            });

            // Record metrics
            this.metricsCollector.recordMetric('emotion_adaptation.success', 1);
            this.metricsCollector.recordMetric('emotion_adaptation.time_ms', performance.now() - startTime);
            this.metricsCollector.recordMetric(`emotion_adaptation.type.${baseEmotion.type}`, 1);

            if (!validationResult.isValid) {
                this.metricsCollector.recordMetric('emotion_adaptation.validation_failure', 1);
            }

            return {
                baseEmotion,
                adaptedEmotion,
                adaptationPlan,
                validationResult,
                processingTimeMs: performance.now() - startTime
            };
        } catch (error) {
            // Log and record error
            this.logger.error('Emotion adaptation failed', {
                emotion: baseEmotion.type,
                error: error instanceof Error ? error.message : String(error)
            });

            this.metricsCollector.recordMetric('emotion_adaptation.error', 1);

            // Return error result
            return {
                baseEmotion,
                adaptedEmotion: null,
                adaptationPlan: {},
                validationResult: {
                    isValid: false,
                    validationErrors: [{
                        errorType: 'adaptation_failure',
                        message: error instanceof Error ? error.message : String(error),
                        severity: 'error',
                        component: 'adaptation_engine'
                    }],
                    validationWarnings: []
                },
                processingTimeMs: performance.now() - startTime,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Generates a plan for adapting the emotion based on the context
     */
    private generateAdaptationPlan(
        baseEmotion: EmotionBase,
        context: EmotionContext
    ): AdaptationPlan {
        const plan: AdaptationPlan = {};

        // Plan for cultural adaptation
        if (context.cultural) {
            plan.cultural = this.generateCulturalAdaptationPlan(baseEmotion, context.cultural);
        }

        // Plan for narrative adaptation
        if (context.narrative) {
            plan.narrative = this.generateNarrativeAdaptationPlan(baseEmotion, context.narrative);
        }

        // Plan for social adaptation
        if (context.social) {
            plan.social = this.generateSocialAdaptationPlan(baseEmotion, context.social);
        }

        // Plan for temporal adaptation
        if (context.temporal) {
            plan.temporal = this.generateTemporalAdaptationPlan(baseEmotion, context.temporal);
        }

        return plan;
    }

    /**
     * Generates a plan for cultural adaptation
     */
    private generateCulturalAdaptationPlan(
        baseEmotion: EmotionBase,
        culturalContext: CulturalContext
    ): CulturalAdaptationPlan {
        // Cultural appropriateness checks
        const intensityAdjustment = this.determineCulturalIntensityAdjustment(baseEmotion, culturalContext);
        const expressionModifications = this.determineCulturalExpressionModifications(baseEmotion, culturalContext);

        return {
            intensityAdjustment,
            expressionModifications,
            culturalNotes: this.getCulturalNotes(baseEmotion, culturalContext)
        };
    }

    /**
     * Generates a plan for narrative adaptation
     */
    private generateNarrativeAdaptationPlan(
        baseEmotion: EmotionBase,
        narrativeContext: NarrativeContext
    ): NarrativeAdaptationPlan {
        // Narrative coherence planning
        const narrativeIntensityAdjustment = this.calculateNarrativeIntensityAdjustment(baseEmotion, narrativeContext);
        const narrativeProgressionModifiers = this.calculateNarrativeProgressionModifiers(baseEmotion, narrativeContext);

        return {
            intensityAdjustment: narrativeIntensityAdjustment,
            progressionModifiers: narrativeProgressionModifiers,
            characterConsistency: this.assessCharacterConsistency(baseEmotion, narrativeContext)
        };
    }

    /**
     * Generates a plan for social adaptation
     */
    private generateSocialAdaptationPlan(
        baseEmotion: EmotionBase,
        socialContext: SocialContext
    ): SocialAdaptationPlan {
        // Social appropriateness planning
        const socialIntensityAdjustment = this.calculateSocialIntensityAdjustment(baseEmotion, socialContext);
        const formalityModifiers = this.calculateFormalityModifiers(baseEmotion, socialContext);

        return {
            intensityAdjustment: socialIntensityAdjustment,
            formalityModifiers,
            relationshipModifiers: this.determineRelationshipModifiers(baseEmotion, socialContext)
        };
    }

    /**
     * Generates a plan for temporal adaptation
     */
    private generateTemporalAdaptationPlan(
        baseEmotion: EmotionBase,
        temporalContext: TemporalContext
    ): TemporalAdaptationPlan {
        // Temporal expression planning
        const durationModifier = this.calculateEmotionDuration(baseEmotion, temporalContext);
        const transitionTiming = this.calculateTransitionTiming(baseEmotion, temporalContext);

        return {
            durationModifier,
            transitionTiming,
            repetitionPattern: this.determineRepetitionPattern(baseEmotion, temporalContext)
        };
    }

    /**
     * Applies cultural adaptations to the emotion
     */
    private applyCulturalAdaptation(
        emotion: EmotionBase,
        adaptationPlan: AdaptationPlan,
        culturalContext?: CulturalContext
    ): Partial<AdaptedEmotion> {
        if (!culturalContext || !adaptationPlan.cultural) {
            return { ...emotion };
        }

        // Apply intensity adjustments based on cultural norms
        const culturallyAdjustedIntensity = this.adjustIntensityForCulture(
            emotion.intensity,
            adaptationPlan.cultural.intensityAdjustment
        );

        // Apply expression modifications based on cultural norms
        const culturallyAdjustedComponents = this.applyCulturalExpressionModifications(
            emotion,
            adaptationPlan.cultural.expressionModifications
        );

        return {
            ...emotion,
            intensity: culturallyAdjustedIntensity,
            components: {
                ...emotion.components,
                ...culturallyAdjustedComponents
            },
            modifiedComponents: ['intensity', ...Object.keys(culturallyAdjustedComponents)]
        };
    }

    /**
     * Applies narrative adaptations to the emotion
     */
    private applyNarrativeAdaptation(
        emotion: Partial<AdaptedEmotion>,
        adaptationPlan: AdaptationPlan,
        narrativeContext?: NarrativeContext
    ): Partial<AdaptedEmotion> {
        if (!narrativeContext || !adaptationPlan.narrative) {
            return emotion;
        }

        // Apply narrative progression adjustments
        const narrativeAdjustedIntensity = this.adjustIntensityForNarrative(
            emotion.intensity!,
            adaptationPlan.narrative.intensityAdjustment
        );

        // Apply progression modifiers
        const narrativeAdjustedComponents = this.applyNarrativeProgressionModifiers(
            emotion,
            adaptationPlan.narrative.progressionModifiers
        );

        // Track modified components
        const modifiedComponents = [
            ...(emotion.modifiedComponents || []),
            ...(narrativeAdjustedIntensity !== emotion.intensity ? ['intensity'] : []),
            ...Object.keys(narrativeAdjustedComponents)
        ];

        return {
            ...emotion,
            intensity: narrativeAdjustedIntensity,
            components: {
                ...emotion.components,
                ...narrativeAdjustedComponents
            },
            modifiedComponents: [...new Set(modifiedComponents)]
        };
    }

    /**
     * Applies social adaptations to the emotion
     */
    private applySocialAdaptation(
        emotion: Partial<AdaptedEmotion>,
        adaptationPlan: AdaptationPlan,
        socialContext?: SocialContext
    ): Partial<AdaptedEmotion> {
        if (!socialContext || !adaptationPlan.social) {
            return emotion;
        }

        // Apply social setting adjustments
        const sociallyAdjustedIntensity = this.adjustIntensityForSocialContext(
            emotion.intensity!,
            adaptationPlan.social.intensityAdjustment
        );

        // Apply formality modifiers
        const sociallyAdjustedComponents = this.applySocialFormalityModifiers(
            emotion,
            adaptationPlan.social.formalityModifiers,
            adaptationPlan.social.relationshipModifiers
        );

        // Track modified components
        const modifiedComponents = [
            ...(emotion.modifiedComponents || []),
            ...(sociallyAdjustedIntensity !== emotion.intensity ? ['intensity'] : []),
            ...Object.keys(sociallyAdjustedComponents)
        ];

        return {
            ...emotion,
            intensity: sociallyAdjustedIntensity,
            components: {
                ...emotion.components,
                ...sociallyAdjustedComponents
            },
            modifiedComponents: [...new Set(modifiedComponents)]
        };
    }

    /**
     * Applies temporal adaptations to the emotion
     */
    private applyTemporalAdaptation(
        emotion: Partial<AdaptedEmotion>,
        adaptationPlan: AdaptationPlan,
        temporalContext?: TemporalContext
    ): Partial<AdaptedEmotion> {
        if (!temporalContext || !adaptationPlan.temporal) {
            return emotion;
        }

        // Apply timing adjustments
        const temporallyAdjustedComponents = this.applyTemporalTimingModifiers(
            emotion,
            adaptationPlan.temporal.durationModifier,
            adaptationPlan.temporal.transitionTiming,
            adaptationPlan.temporal.repetitionPattern
        );

        // Track modified components
        const modifiedComponents = [
            ...(emotion.modifiedComponents || []),
            ...Object.keys(temporallyAdjustedComponents)
        ];

        return {
            ...emotion,
            components: {
                ...emotion.components,
                ...temporallyAdjustedComponents
            },
            timing: {
                duration: adaptationPlan.temporal.durationModifier.duration,
                transitions: adaptationPlan.temporal.transitionTiming,
                repetition: adaptationPlan.temporal.repetitionPattern
            },
            modifiedComponents: [...new Set(modifiedComponents)]
        };
    }

    /**
     * Finalizes the emotion adaptation with all contextual modifications
     */
    private finalizeAdaptation(
        baseEmotion: EmotionBase,
        adaptedPartial: Partial<AdaptedEmotion>,
        adaptationPlan: AdaptationPlan,
        context: EmotionContext
    ): AdaptedEmotion {
        // Construct the fully adapted emotion
        const adaptedEmotion: AdaptedEmotion = {
            type: baseEmotion.type,
            intensity: adaptedPartial.intensity || baseEmotion.intensity,
            components: {
                ...baseEmotion.components,
                ...adaptedPartial.components
            },
            modifiedComponents: adaptedPartial.modifiedComponents || [],
            timing: adaptedPartial.timing || {
                duration: 0,
                transitions: {},
                repetition: {}
            },
            adaptationDetails: {
                culturalAdaptations: adaptationPlan.cultural || {},
                narrativeAdaptations: adaptationPlan.narrative || {},
                socialAdaptations: adaptationPlan.social || {},
                temporalAdaptations: adaptationPlan.temporal || {}
            },
            originalEmotion: baseEmotion
        };

        // Add summaries of adaptations performed
        adaptedEmotion.adaptationSummary = this.generateAdaptationSummary(
            baseEmotion,
            adaptedEmotion,
            adaptationPlan,
            context
        );

        return adaptedEmotion;
    }

    /**
     * Generates a summary of adaptations performed
     */
    private generateAdaptationSummary(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        adaptationPlan: AdaptationPlan,
        context: EmotionContext
    ): string {
        const adaptations: string[] = [];

        // Intensity changes
        if (baseEmotion.intensity !== adaptedEmotion.intensity) {
            const direction = baseEmotion.intensity < adaptedEmotion.intensity ? 'increased' : 'decreased';
            adaptations.push(`Intensity ${direction} from ${baseEmotion.intensity} to ${adaptedEmotion.intensity}`);
        }

        // Cultural adaptations
        if (context.cultural && adaptationPlan.cultural) {
            adaptations.push(`Cultural adaptations for ${context.cultural.culturalBackground} context`);
        }

        // Narrative adaptations
        if (context.narrative && adaptationPlan.narrative) {
            adaptations.push(`Narrative adaptations for ${context.narrative.narrativePhase} phase`);
        }

        // Social adaptations
        if (context.social && adaptationPlan.social) {
            adaptations.push(`Social adaptations for ${context.social.formalityLevel} formality level`);
        }

        // Temporal adaptations
        if (context.temporal && adaptationPlan.temporal) {
            adaptations.push(`Temporal adaptations for expression timing and transitions`);
        }

        // Component modifications
        if (adaptedEmotion.modifiedComponents.length > 0) {
            adaptations.push(`Modified components: ${adaptedEmotion.modifiedComponents.join(', ')}`);
        }

        return adaptations.join('. ');
    }

    // ======== Culture-specific adaptation methods ========

    /**
     * Determines intensity adjustment based on cultural context
     */
    private determineCulturalIntensityAdjustment(
        emotion: EmotionBase,
        culturalContext: CulturalContext
    ): IntensityAdjustment {
        // In a real implementation, this would include detailed cultural models
        // Simplified version for demonstration

        const { culturalBackground, expressivityNorms } = culturalContext;

        // Default factor (no adjustment)
        let factor = 1.0;
        let reason = 'No cultural adjustment needed';

        // Adjust based on cultural expressivity norms
        if (expressivityNorms === 'reserved') {
            factor = 0.8; // Reduce intensity for reserved cultures
            reason = 'Reduced intensity for reserved cultural expression norms';
        } else if (expressivityNorms === 'expressive') {
            factor = 1.2; // Increase intensity for expressive cultures
            reason = 'Increased intensity for expressive cultural norms';
        }

        // Emotion-specific cultural adjustments
        if (emotion.type === 'anger' && culturalBackground === 'formal_french') {
            factor *= 0.7; // Further reduce anger expression in formal French context
            reason += '. Additional reduction for anger in formal French context';
        } else if (emotion.type === 'joy' && culturalBackground === 'mediterranean') {
            factor *= 1.3; // Amplify joy expression in Mediterranean context
            reason += '. Additional amplification for joy in Mediterranean context';
        }

        return { factor, reason };
    }

    /**
     * Determines cultural expression modifications
     */
    private determineCulturalExpressionModifications(
        emotion: EmotionBase,
        culturalContext: CulturalContext
    ): ExpressionModifications {
        // Simplified implementation
        const modifications: ExpressionModifications = {};

        // Modify facial expressions for cultural appropriateness
        if (culturalContext.culturalBackground === 'formal_french' && emotion.type === 'surprise') {
            modifications.facialExpression = {
                eyebrows: 'raised_moderate', // Less exaggerated eyebrow raising
                eyes: 'widened_moderate'     // Less exaggerated eye widening
            };
        }

        // Modify hand movements for cultural specificity
        if (culturalContext.expressivityNorms === 'reserved') {
            modifications.handMovements = {
                amplitude: 'reduced',
                speed: 'moderate'
            };
        }

        return modifications;
    }

    /**
     * Gets cultural notes for a specific emotion in context
     */
    private getCulturalNotes(
        emotion: EmotionBase,
        culturalContext: CulturalContext
    ): string[] {
        const notes: string[] = [];

        // Add relevant cultural notes
        if (culturalContext.culturalBackground === 'formal_french') {
            notes.push('Formal French LSF contexts emphasize controlled expressions');
        }

        if (culturalContext.expressivityNorms === 'reserved' && emotion.intensity > 0.7) {
            notes.push('High intensity emotions may require moderation in reserved cultural contexts');
        }

        return notes;
    }

    /**
     * Adjusts intensity based on cultural factors
     */
    private adjustIntensityForCulture(
        baseIntensity: EmotionIntensity,
        adjustment: IntensityAdjustment
    ): EmotionIntensity {
        // Apply cultural adjustment factor
        const adjustedIntensity = baseIntensity * adjustment.factor;

        // Ensure intensity stays within valid range
        return Math.max(0.1, Math.min(1.0, adjustedIntensity)) as EmotionIntensity;
    }

    /**
     * Applies cultural expression modifications
     */
    private applyCulturalExpressionModifications(
        emotion: EmotionBase,
        modifications: ExpressionModifications
    ): Record<string, any> {
        // Apply each modification to the appropriate component
        // In a real implementation, this would involve detailed mapping logic

        const result: Record<string, any> = {};

        // Apply facial expression modifications
        if (modifications.facialExpression) {
            result.facialExpression = {
                ...emotion.components.facialExpression,
                ...modifications.facialExpression
            };
        }

        // Apply hand movement modifications
        if (modifications.handMovements) {
            result.handMovements = {
                ...emotion.components.handMovements,
                ...modifications.handMovements
            };
        }

        return result;
    }

    // ======== Narrative-specific adaptation methods ========

    /**
     * Calculates intensity adjustment based on narrative context
     */
    private calculateNarrativeIntensityAdjustment(
        emotion: EmotionBase,
        narrativeContext: NarrativeContext
    ): IntensityAdjustment {
        // Default factor (no adjustment)
        let factor = 1.0;
        let reason = 'No narrative adjustment needed';

        // Adjust based on narrative phase
        switch (narrativeContext.narrativePhase) {
            case 'introduction':
                // Moderate emotions during introduction
                factor = 0.8;
                reason = 'Moderate intensity for narrative introduction';
                break;

            case 'climax':
                // Amplify emotions during climax
                factor = 1.3;
                reason = 'Amplified intensity for narrative climax';
                break;

            case 'resolution':
                // Varied adjustment for resolution based on emotion type
                if (emotion.type === 'joy' || emotion.type === 'relief') {
                    factor = 1.2;
                    reason = 'Amplified positive emotion for narrative resolution';
                } else if (emotion.type === 'sadness' || emotion.type === 'grief') {
                    factor = 0.9;
                    reason = 'Slightly reduced negative emotion for narrative resolution';
                }
                break;

            default:
                // No adjustment for other phases
                break;
        }

        return { factor, reason };
    }

    /**
     * Calculates progression modifiers based on narrative context
     */
    private calculateNarrativeProgressionModifiers(
        emotion: EmotionBase,
        narrativeContext: NarrativeContext
    ): ProgressionModifiers {
        const modifiers: ProgressionModifiers = {};

        // Apply narrative progression modifiers
        if (narrativeContext.narrativePhase === 'climax') {
            modifiers.facialExpression = {
                intensity: 'heightened',
                dynamism: 'increased'
            };

            modifiers.bodyPosture = {
                tension: 'increased',
                forward_lean: 'increased'
            };
        }

        if (narrativeContext.emotionalArc === 'building_tension') {
            modifiers.timing = {
                acceleration: 'gradual_increase',
                rhythm: 'intensifying'
            };
        }

        return modifiers;
    }

    /**
     * Assesses character consistency with narrative context
     */
    private assessCharacterConsistency(
        emotion: EmotionBase,
        narrativeContext: NarrativeContext
    ): CharacterConsistency {
        // Default to consistent
        const result = { consistent: true, notes: [] as string[] };

        // Check character consistency
        if (narrativeContext.characterPersonality === 'reserved' && emotion.intensity > 0.7) {
            result.consistent = false;
            result.notes.push('High intensity emotion may be inconsistent with reserved character');
        }

        if (narrativeContext.emotionalArc === 'sudden_change' && emotion.type === narrativeContext.previousEmotion) {
            result.consistent = false;
            result.notes.push('Emotion should change during a sudden change emotional arc');
        }

        return result;
    }

    /**
     * Adjusts intensity based on narrative factors
     */
    private adjustIntensityForNarrative(
        baseIntensity: EmotionIntensity,
        adjustment: IntensityAdjustment
    ): EmotionIntensity {
        // Apply narrative adjustment factor
        const adjustedIntensity = baseIntensity * adjustment.factor;

        // Ensure intensity stays within valid range
        return Math.max(0.1, Math.min(1.0, adjustedIntensity)) as EmotionIntensity;
    }

    /**
     * Applies narrative progression modifiers
     */
    private applyNarrativeProgressionModifiers(
        emotion: Partial<AdaptedEmotion>,
        modifiers: ProgressionModifiers
    ): Record<string, any> {
        const result: Record<string, any> = {};

        // Apply facial expression modifiers
        if (modifiers.facialExpression) {
            result.facialExpression = {
                ...(emotion.components?.facialExpression || {}),
                ...modifiers.facialExpression
            };
        }

        // Apply body posture modifiers
        if (modifiers.bodyPosture) {
            result.bodyPosture = {
                ...(emotion.components?.bodyPosture || {}),
                ...modifiers.bodyPosture
            };
        }

        // Apply timing modifiers
        if (modifiers.timing) {
            result.timing = {
                ...(emotion.components?.timing || {}),
                ...modifiers.timing
            };
        }

        return result;
    }

    // ======== Social-specific adaptation methods ========

    /**
     * Calculates intensity adjustment based on social context
     */
    private calculateSocialIntensityAdjustment(
        emotion: EmotionBase,
        socialContext: SocialContext
    ): IntensityAdjustment {
        // Default factor (no adjustment)
        let factor = 1.0;
        let reason = 'No social adjustment needed';

        // Adjust based on formality level
        switch (socialContext.formalityLevel) {
            case 'formal':
                // Reduce intensity in formal settings
                factor = 0.7;
                reason = 'Reduced intensity for formal social context';
                break;

            case 'casual':
                // Slightly increase intensity in casual settings
                factor = 1.1;
                reason = 'Slightly increased intensity for casual social context';
                break;

            case 'intimate':
                // Increase intensity in intimate settings
                factor = 1.2;
                reason = 'Increased intensity for intimate social context';
                break;

            default:
                // No adjustment for other formality levels
                break;
        }

        // Adjust based on power dynamics
        if (socialContext.powerDynamics === 'subordinate' && emotion.type === 'anger') {
            factor *= 0.6; // Significantly reduce anger expression in subordinate position
            reason += '. Additional reduction for anger in subordinate power position';
        }

        return { factor, reason };
    }

    /**
     * Calculates formality modifiers based on social context
     */
    private calculateFormalityModifiers(
        emotion: EmotionBase,
        socialContext: SocialContext
    ): FormalityModifiers {
        const modifiers: FormalityModifiers = {};

        // Apply formality modifiers
        if (socialContext.formalityLevel === 'formal') {
            modifiers.facialExpression = {
                restraint: 'increased',
                neutralization: 'partial'
            };

            modifiers.bodyPosture = {
                openness: 'reduced',
                tension: 'controlled'
            };
        }

        if (socialContext.formalityLevel === 'casual') {
            modifiers.facialExpression = {
                restraint: 'minimal',
                dynamism: 'natural'
            };
        }

        return modifiers;
    }

    /**
     * Determines relationship modifiers based on social context
     */
    private determineRelationshipModifiers(
        emotion: EmotionBase,
        socialContext: SocialContext
    ): RelationshipModifiers {
        const modifiers: RelationshipModifiers = {};

        // Apply relationship modifiers
        switch (socialContext.relationshipType) {
            case 'professional':
                modifiers.expressionBoundaries = {
                    limitExpressionIntensity: true,
                    maintainProfessionalDistance: true
                };
                break;

            case 'familial':
                modifiers.expressionBoundaries = {
                    allowIncreasedWarmth: true,
                    culturalFamilyNorms: socialContext.culturalContext
                };
                break;

            case 'educational':
                modifiers.expressionBoundaries = {
                    maintainRespectMarkers: true,
                    allowPedagogicalExaggeration: true
                };
                break;
        }

        return modifiers;
    }

    /**
     * Adjusts intensity based on social factors
     */
    private adjustIntensityForSocialContext(
        baseIntensity: EmotionIntensity,
        adjustment: IntensityAdjustment
    ): EmotionIntensity {
        // Apply social adjustment factor
        const adjustedIntensity = baseIntensity * adjustment.factor;

        // Ensure intensity stays within valid range
        return Math.max(0.1, Math.min(1.0, adjustedIntensity)) as EmotionIntensity;
    }

    /**
     * Applies social formality modifiers
     */
    private applySocialFormalityModifiers(
        emotion: Partial<AdaptedEmotion>,
        formalityModifiers: FormalityModifiers,
        relationshipModifiers: RelationshipModifiers
    ): Record<string, any> {
        const result: Record<string, any> = {};

        // Apply facial expression modifiers
        if (formalityModifiers.facialExpression) {
            result.facialExpression = {
                ...(emotion.components?.facialExpression || {}),
                ...formalityModifiers.facialExpression
            };
        }

        // Apply body posture modifiers
        if (formalityModifiers.bodyPosture) {
            result.bodyPosture = {
                ...(emotion.components?.bodyPosture || {}),
                ...formalityModifiers.bodyPosture
            };
        }

        // Apply relationship boundaries
        if (relationshipModifiers.expressionBoundaries) {
            result.expressionBoundaries = {
                ...(emotion.components?.expressionBoundaries || {}),
                ...relationshipModifiers.expressionBoundaries
            };
        }

        return result;
    }

    // ======== Temporal-specific adaptation methods ========

    /**
     * Calculates emotion duration based on temporal context
     */
    private calculateEmotionDuration(
        emotion: EmotionBase,
        temporalContext: TemporalContext
    ): DurationModifier {
        // Default duration (in milliseconds)
        let duration = 1000; // 1 second default
        let reason = 'Standard emotion duration';

        // Adjust duration based on emotion type
        switch (emotion.type) {
            case 'surprise':
                duration = 800; // Surprise is typically brief
                reason = 'Brief duration for surprise emotion';
                break;

            case 'sadness':
                duration = 2000; // Sadness typically lasts longer
                reason = 'Extended duration for sadness emotion';
                break;

            case 'joy':
                duration = 1500; // Joy is moderately sustained
                reason = 'Moderately sustained duration for joy';
                break;
        }

        // Adjust based on temporal context
        if (temporalContext.pacingSetting === 'slow') {
            duration *= 1.5;
            reason += '. Extended for slow pacing setting';
        } else if (temporalContext.pacingSetting === 'fast') {
            duration *= 0.7;
            reason += '. Compressed for fast pacing setting';
        }

        // Adjust based on emphasis requirements
        if (temporalContext.emphasisRequired) {
            duration *= 1.2;
            reason += '. Extended for required emphasis';
        }

        return { duration, reason };
    }

    /**
     * Calculates transition timing based on temporal context
     */
    private calculateTransitionTiming(
        emotion: EmotionBase,
        temporalContext: TemporalContext
    ): TransitionTiming {
        const transitions: TransitionTiming = {
            fadeIn: {
                duration: 200, // Default fade in (ms)
                curve: 'ease-in'
            },
            fadeOut: {
                duration: 300, // Default fade out (ms)
                curve: 'ease-out'
            }
        };

        // Set up transitions based on emotion and context
        if (temporalContext.previousEmotion && temporalContext.previousEmotion !== emotion.type) {
            // Transitioning from a different emotion
            transitions.fromPrevious = {
                emotionType: temporalContext.previousEmotion,
                duration: 500, // Transition duration (ms)
                elements: ['facialExpression', 'bodyPosture']
            };
        }

        if (temporalContext.nextEmotion && temporalContext.nextEmotion !== emotion.type) {
            // Transitioning to a different emotion
            transitions.toNext = {
                emotionType: temporalContext.nextEmotion,
                duration: 500, // Transition duration (ms),
                elements: ['facialExpression', 'bodyPosture']
            };
        }

        return transitions;
    }

    /**
     * Determines repetition pattern based on temporal context
     */
    private determineRepetitionPattern(
        emotion: EmotionBase,
        temporalContext: TemporalContext
    ): RepetitionPattern {
        const repetition: RepetitionPattern = {
            enabled: false,
            count: 1
        };

        // Enable repetition based on context
        if (temporalContext.repetitive) {
            repetition.enabled = true;
            repetition.count = 3; // Default repetition count
            repetition.interval = 500; // Default interval between repetitions (ms)

            // Adjust based on emotion intensity
            if (emotion.intensity > 0.7) {
                repetition.count = 4; // More repetitions for high intensity
                repetition.interval = 400; // Shorter intervals
            }
        }

        // Specific rhythmic patterns for certain emotions
        if (emotion.type === 'excitement' || emotion.type === 'joy') {
            repetition.rhythm = 'building'; // Building rhythm for positive emotions
            repetition.intensityProgression = 'increasing';
        } else if (emotion.type === 'sadness' || emotion.type === 'disappointment') {
            repetition.rhythm = 'diminishing'; // Diminishing rhythm for negative emotions
            repetition.intensityProgression = 'decreasing';
        }

        return repetition;
    }

    /**
     * Applies temporal timing modifiers
     */
    private applyTemporalTimingModifiers(
        emotion: Partial<AdaptedEmotion>,
        durationModifier: DurationModifier,
        transitionTiming: TransitionTiming,
        repetitionPattern: RepetitionPattern
    ): Record<string, any> {
        const result: Record<string, any> = {};

        // Apply timing modifications
        result.timing = {
            ...(emotion.components?.timing || {}),
            duration: durationModifier.duration,
            transitions: transitionTiming,
            repetition: repetitionPattern
        };

        // Apply specific component timing adjustments
        if (repetitionPattern.enabled) {
            result.facialExpression = {
                ...(emotion.components?.facialExpression || {}),
                repetitionEnabled: true,
                repetitionCount: repetitionPattern.count,
                repetitionInterval: repetitionPattern.interval
            };

            result.bodyPosture = {
                ...(emotion.components?.bodyPosture || {}),
                adaptToRepetition: true
            };
        }

        return result;
    }

    private async validateAdaptation(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        context: EmotionContext
    ): Promise<ValidationSummary> {
        const startTime = performance.now();

        try {
            // ...existing code...

            return {
                isValid: true,
                errors: []
            };
        } catch (error) {
            this.logger.error('Validation error', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                isValid: false,
                errors: [{
                    code: 'VALIDATION_ERROR',
                    message: error instanceof Error ? error.message : String(error),
                    severity: 'error'
                }]
            };
        }
    }

    private collectMetrics(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        processingTime: number
    ): AdaptationMetrics {
        const adaptationsApplied = adaptedEmotion.modifiedComponents.length;
        const metrics: AdaptationMetrics = {
            processingTime,
            adaptationsApplied,
            validationsPassed: 0,
            validationsFailed: 0
        };

        return metrics;
    }

    private calculateAdjustments(
        baseEmotion: EmotionBase,
        context: EmotionContext
    ): EmotionAdjustment[] {
        const adjustments: EmotionAdjustment[] = [];

        // Traitement des ajustements culturels
        if (context.cultural) {
            adjustments.push(this.calculateCulturalAdjustment(baseEmotion, context.cultural));
        }

        // Traitement des ajustements narratifs
        if (context.narrative) {
            adjustments.push(this.calculateNarrativeAdjustment(baseEmotion, context.narrative));
        }

        return adjustments;
    }

    private calculateCulturalAdjustment(
        emotion: EmotionBase,
        culturalContext: CulturalContext
    ): EmotionAdjustment {
        return {
            component: 'intensity',
            originalValue: emotion.intensity,
            adjustedValue: this.adjustIntensityForCulture(emotion.intensity, { factor: 1, reason: '' }),
            factor: culturalContext.expressivityLevel,
            reason: `Cultural adjustment for ${culturalContext.culturalBackground}`
        };
    }

    private calculateNarrativeAdjustment(
        emotion: EmotionBase,
        narrativeContext: NarrativeContext
    ): EmotionAdjustment {
        return {
            component: 'intensity',
            originalValue: emotion.intensity,
            adjustedValue: this.adjustIntensityForNarrative(emotion.intensity, { factor: 1, reason: '' }),
            factor: narrativeContext.emotionalIntensity,
            reason: `Narrative adjustment for ${narrativeContext.narrativePhase}`
        };
    }
}