// src/ai/systems/expressions/emotions/contextual/evaluation/ContextualAdaptationValidator.ts

import {
    EmotionBase,
    EmotionContext,
    AdaptedEmotion,
    ValidationResult,
    ValidationError,
    ValidationWarning,
    CulturalContext,
    NarrativeContext,
    SocialContext,
    TemporalContext
} from '@ai/types/emotions/contextual.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { Logger } from '@ai/utils/Logger';
import { SpatialValidator } from '@ai/feedback/validators/SpatialValidator';
import { GrammaticalValidator } from '@ai/feedback/validators/GrammaticalValidator';

// Ajout des interfaces pour les plans d'adaptation
interface AdaptationPlan {
    cultural?: CulturalAdaptationPlan;
    narrative?: NarrativeAdaptationPlan;
    social?: SocialAdaptationPlan;
    temporal?: TemporalAdaptationPlan;
}

interface CulturalAdaptationPlan {
    intensityAdjustment?: {
        factor: number;
        reason: string;
    };
    expressionModifications?: {
        type: string;
        value: number;
    }[];
}

interface NarrativeAdaptationPlan {
    emotionalArc?: string;
    intensityProgression?: number;
    characterConsistency?: {
        maintained: boolean;
        adjustments?: string[];
    };
}

interface SocialAdaptationPlan {
    formalityAdjustments?: {
        type: string;
        value: number;
    }[];
    relationshipBoundaries?: {
        type: string;
        restrictions: string[];
    };
}

interface TemporalAdaptationPlan {
    duration?: number;
    transitions?: {
        fromPrevious?: {
            duration: number;
            type: string;
        };
        toNext?: {
            duration: number;
            type: string;
        };
    };
}

/**
 * Validates the contextual adaptation of emotions to ensure they meet
 * linguistic, cultural, semantic, and spatial requirements for LSF.
 */
export class ContextualAdaptationValidator {
    private readonly metricsCollector: IMetricsCollector;
    private readonly logger: Logger;
    private readonly spatialValidator: SpatialValidator;
    private readonly grammaticalValidator: GrammaticalValidator;

    constructor(
        metricsCollector: IMetricsCollector,
        logger: Logger,
        spatialValidator: SpatialValidator,
        grammaticalValidator: GrammaticalValidator
    ) {
        this.metricsCollector = metricsCollector;
        this.logger = logger;
        this.spatialValidator = spatialValidator;
        this.grammaticalValidator = grammaticalValidator;
    }

    /**
     * Validates an emotion adaptation against the provided context
     * @param baseEmotion Original emotion before adaptation
     * @param adaptedEmotion Adapted emotion after context processing
     * @param context Context used for adaptation
     * @param adaptationPlan Plan used for adapting the emotion
     * @returns Validation result with potential errors and warnings
     */
    public async validateAdaptation(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        context: EmotionContext,
        adaptationPlan: AdaptationPlan
    ): Promise<ValidationResult> {
        this.metricsCollector.recordMetric('emotion_adaptation_validation.start', 1);
        const startTime = performance.now();

        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        try {
            this.logger.info('Starting emotion adaptation validation', {
                originalEmotion: baseEmotion.type,
                adaptedEmotion: adaptedEmotion.type
            });

            // Validate across different dimensions

            // 1. Validate cultural appropriateness
            if (context.cultural) {
                const culturalValidation = this.validateCulturalAppropriateness(
                    baseEmotion,
                    adaptedEmotion,
                    context.cultural,
                    adaptationPlan.cultural
                );

                errors.push(...culturalValidation.errors);
                warnings.push(...culturalValidation.warnings);
            }

            // 2. Validate narrative coherence
            if (context.narrative) {
                const narrativeValidation = this.validateNarrativeCoherence(
                    baseEmotion,
                    adaptedEmotion,
                    context.narrative,
                    adaptationPlan.narrative
                );

                errors.push(...narrativeValidation.errors);
                warnings.push(...narrativeValidation.warnings);
            }

            // 3. Validate social appropriateness
            if (context.social) {
                const socialValidation = this.validateSocialAppropriateness(
                    baseEmotion,
                    adaptedEmotion,
                    context.social,
                    adaptationPlan.social
                );

                errors.push(...socialValidation.errors);
                warnings.push(...socialValidation.warnings);
            }

            // 4. Validate temporal expressions
            if (context.temporal) {
                const temporalValidation = this.validateTemporalExpression(
                    baseEmotion,
                    adaptedEmotion,
                    context.temporal,
                    adaptationPlan.temporal
                );

                errors.push(...temporalValidation.errors);
                warnings.push(...temporalValidation.warnings);
            }

            // 5. Validate LSF grammatical correctness
            const grammaticalValidation = await this.validateGrammaticalCorrectness(
                adaptedEmotion
            );

            errors.push(...grammaticalValidation.errors);
            warnings.push(...grammaticalValidation.warnings);

            // 6. Validate spatial coherence in LSF
            const spatialValidation = await this.validateSpatialCoherence(
                adaptedEmotion
            );

            errors.push(...spatialValidation.errors);
            warnings.push(...spatialValidation.warnings);

            // 7. Perform cross-dimension validation (interactions between different contexts)
            const crossValidation = this.validateCrossDimensionConsistency(
                adaptedEmotion,
                context,
                adaptationPlan
            );

            errors.push(...crossValidation.errors);
            warnings.push(...crossValidation.warnings);

            // Create final validation result
            const validationResult: ValidationResult = {
                isValid: errors.length === 0,
                validationErrors: errors,
                validationWarnings: warnings
            };

            this.logger.info('Emotion adaptation validation completed', {
                isValid: validationResult.isValid,
                errorCount: errors.length,
                warningCount: warnings.length
            });

            this.metricsCollector.recordMetric('emotion_adaptation_validation.complete', 1);
            this.metricsCollector.recordMetric('emotion_adaptation_validation.time_ms', performance.now() - startTime);

            if (errors.length > 0) {
                this.metricsCollector.recordMetric('emotion_adaptation_validation.error_count', errors.length);
            }

            if (warnings.length > 0) {
                this.metricsCollector.recordMetric('emotion_adaptation_validation.warning_count', warnings.length);
            }

            return validationResult;
        } catch (error) {
            this.logger.error('Emotion adaptation validation failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            this.metricsCollector.recordMetric('emotion_adaptation_validation.error', 1);

            // Return error validation result
            return {
                isValid: false,
                validationErrors: [
                    {
                        errorType: 'validation_system_failure',
                        message: error instanceof Error ? error.message : String(error),
                        severity: 'error',
                        component: 'validation_system'
                    }
                ],
                validationWarnings: []
            };
        }
    }

    /**
     * Validates cultural appropriateness of the adapted emotion
     */
    private validateCulturalAppropriateness(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        culturalContext: CulturalContext,
        adaptationPlan: CulturalAdaptationPlan
    ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check cultural intensity appropriateness
        if (adaptedEmotion.intensity > 0.8 && culturalContext.expressivityNorms === 'reserved') {
            errors.push({
                errorType: 'cultural_intensity_inappropriate',
                message: 'Emotion intensity too high for reserved cultural context',
                severity: 'error',
                component: 'cultural'
            });
        }

        // Check cultural expression components
        if (culturalContext.culturalBackground === 'formal_french' &&
            adaptedEmotion.components.facialExpression?.intensity === 'exaggerated') {
            warnings.push({
                warningType: 'cultural_expression_nuance',
                message: 'Exaggerated facial expressions may be inappropriate in formal French context',
                severity: 'medium',
                component: 'cultural'
            });
        }

        // Check cultural taboos
        if (culturalContext.taboos && culturalContext.taboos.includes(adaptedEmotion.type)) {
            errors.push({
                errorType: 'cultural_taboo_violation',
                message: `Emotion '${adaptedEmotion.type}' is culturally inappropriate in this context`,
                severity: 'error',
                component: 'cultural'
            });
        }

        // Check if cultural adaptation is sufficient
        if (adaptationPlan.intensityAdjustment &&
            Math.abs(baseEmotion.intensity - adaptedEmotion.intensity) < 0.1 &&
            Math.abs(adaptationPlan.intensityAdjustment.factor - 1.0) > 0.2) {
            warnings.push({
                warningType: 'insufficient_cultural_adaptation',
                message: 'Cultural adaptation intensity adjustment may be insufficient',
                severity: 'low',
                component: 'cultural'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validates narrative coherence of the adapted emotion
     */
    private validateNarrativeCoherence(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        narrativeContext: NarrativeContext,
        adaptationPlan: NarrativeAdaptationPlan
    ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check narrative phase coherence
        if (narrativeContext.narrativePhase === 'climax' && adaptedEmotion.intensity < 0.6) {
            warnings.push({
                warningType: 'narrative_intensity_mismatch',
                message: 'Emotion intensity may be too low for narrative climax',
                severity: 'medium',
                component: 'narrative'
            });
        }

        // Check character consistency
        if (narrativeContext.characterPersonality === 'reserved' && adaptedEmotion.intensity > 0.8) {
            errors.push({
                errorType: 'character_consistency_violation',
                message: 'Emotion intensity inconsistent with reserved character personality',
                severity: 'error',
                component: 'narrative'
            });
        }

        // Check emotional arc consistency
        if (narrativeContext.emotionalArc === 'building_tension' &&
            adaptedEmotion.intensity <= baseEmotion.intensity) {
            warnings.push({
                warningType: 'emotional_arc_inconsistency',
                message: 'Emotion intensity should increase during building tension arc',
                severity: 'medium',
                component: 'narrative'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validates social appropriateness of the adapted emotion
     */
    private validateSocialAppropriateness(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        socialContext: SocialContext,
        adaptationPlan: SocialAdaptationPlan
    ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check formality level appropriateness
        if (socialContext.formalityLevel === 'formal' && adaptedEmotion.intensity > 0.7) {
            warnings.push({
                warningType: 'formality_intensity_mismatch',
                message: 'Emotion intensity may be too high for formal social context',
                severity: 'medium',
                component: 'social'
            });
        }

        // Check power dynamics appropriateness
        if (socialContext.powerDynamics === 'subordinate' &&
            adaptedEmotion.type === 'anger' &&
            adaptedEmotion.intensity > 0.5) {
            errors.push({
                errorType: 'power_dynamic_violation',
                message: 'Anger expression too intense for subordinate power position',
                severity: 'error',
                component: 'social'
            });
        }

        // Check relationship type appropriateness
        if (socialContext.relationshipType === 'professional' &&
            !adaptedEmotion.components.expressionBoundaries?.maintainProfessionalDistance) {
            warnings.push({
                warningType: 'relationship_boundary_issue',
                message: 'Professional distance boundary not maintained in professional relationship',
                severity: 'medium',
                component: 'social'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validates temporal expression of the adapted emotion
     */
    private validateTemporalExpression(
        baseEmotion: EmotionBase,
        adaptedEmotion: AdaptedEmotion,
        temporalContext: TemporalContext,
        adaptationPlan: TemporalAdaptationPlan
    ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check duration appropriateness
        if (temporalContext.pacingSetting === 'fast' &&
            adaptedEmotion.timing.duration > 1500) {
            warnings.push({
                warningType: 'duration_pacing_mismatch',
                message: 'Emotion duration too long for fast pacing setting',
                severity: 'low',
                component: 'temporal'
            });
        }

        // Check transition appropriateness
        if (temporalContext.previousEmotion &&
            temporalContext.previousEmotion !== baseEmotion.type &&
            (!adaptedEmotion.timing.transitions.fromPrevious ||
                adaptedEmotion.timing.transitions.fromPrevious.duration < 300)) {
            warnings.push({
                warningType: 'transition_duration_insufficient',
                message: 'Transition from previous emotion may be too abrupt',
                severity: 'medium',
                component: 'temporal'
            });
        }

        // Check repetition appropriateness
        if (temporalContext.repetitive &&
            (!adaptedEmotion.timing.repetition || !adaptedEmotion.timing.repetition.enabled)) {
            errors.push({
                errorType: 'repetition_missing',
                message: 'Repetition required but not applied in adaptation',
                severity: 'error',
                component: 'temporal'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validates grammatical correctness of LSF expressions in the adapted emotion
     */
    private async validateGrammaticalCorrectness(
        adaptedEmotion: AdaptedEmotion
    ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        try {
            // Use existing grammatical validator to check LSF grammar
            const validationResult = await this.grammaticalValidator.validate({
                expressionType: 'emotion',
                components: adaptedEmotion.components,
                intensity: adaptedEmotion.intensity,
                timing: adaptedEmotion.timing
            });

            // Process validation results
            if (!validationResult.isValid) {
                // Convert grammatical errors to adaptation validation errors
                for (const issue of validationResult.issues) {
                    if (issue.severity === 'error') {
                        errors.push({
                            errorType: 'grammatical_error',
                            message: issue.message,
                            severity: 'error',
                            component: issue.component || 'grammatical',
                            details: issue.details
                        });
                    } else {
                        warnings.push({
                            warningType: 'grammatical_warning',
                            message: issue.message,
                            severity: issue.severity === 'warning' ? 'medium' : 'low',
                            component: issue.component || 'grammatical',
                            details: issue.details
                        });
                    }
                }
            }
        } catch (error) {
            // Add error for validation failure
            errors.push({
                errorType: 'grammatical_validation_failure',
                message: error instanceof Error ? error.message : String(error),
                severity: 'error',
                component: 'grammatical'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validates spatial coherence of LSF expressions in the adapted emotion
     */
    private async validateSpatialCoherence(
        adaptedEmotion: AdaptedEmotion
    ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        try {
            // Use existing spatial validator to check LSF spatial coherence
            const validationResult = await this.spatialValidator.validate({
                expressionType: 'emotion',
                components: adaptedEmotion.components,
                intensity: adaptedEmotion.intensity,
                timing: adaptedEmotion.timing
            });

            // Process validation results
            if (!validationResult.isValid) {
                // Convert spatial errors to adaptation validation errors
                for (const issue of validationResult.issues) {
                    if (issue.severity === 'error') {
                        errors.push({
                            errorType: 'spatial_error',
                            message: issue.message,
                            severity: 'error',
                            component: issue.component || 'spatial',
                            details: issue.details
                        });
                    } else {
                        warnings.push({
                            warningType: 'spatial_warning',
                            message: issue.message,
                            severity: issue.severity === 'warning' ? 'medium' : 'low',
                            component: issue.component || 'spatial',
                            details: issue.details
                        });
                    }
                }
            }
        } catch (error) {
            // Add error for validation failure
            errors.push({
                errorType: 'spatial_validation_failure',
                message: error instanceof Error ? error.message : String(error),
                severity: 'error',
                component: 'spatial'
            });
        }

        return { errors, warnings };
    }

    /**
     * Validates cross-dimension consistency between different contexts
     */
    private validateCrossDimensionConsistency(
        adaptedEmotion: AdaptedEmotion,
        context: EmotionContext,
        adaptationPlan: AdaptationPlan
    ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check for conflicts between cultural and social adaptations
        if (context.cultural && context.social &&
            context.cultural.expressivityNorms === 'expressive' &&
            context.social.formalityLevel === 'formal' &&
            adaptedEmotion.intensity > 0.7) {
            warnings.push({
                warningType: 'cultural_social_conflict',
                message: 'Conflict between expressive cultural norms and formal social setting',
                severity: 'medium',
                component: 'cross_dimension'
            });
        }

        // Check for conflicts between narrative and temporal adaptations
        if (context.narrative && context.temporal &&
            context.narrative.narrativePhase === 'climax' &&
            context.temporal.pacingSetting === 'fast' &&
            adaptedEmotion.timing.duration > 1000) {
            warnings.push({
                warningType: 'narrative_temporal_conflict',
                message: 'Emotion duration too long for fast pacing during narrative climax',
                severity: 'low',
                component: 'cross_dimension'
            });
        }

        // Check for excessive modifications that might overcomplicate the expression
        const modifiedComponents = adaptedEmotion.modifiedComponents || [];
        if (modifiedComponents.length > 5) {
            warnings.push({
                warningType: 'adaptation_complexity',
                message: 'Multiple component modifications may result in overly complex expression',
                severity: 'low',
                component: 'cross_dimension'
            });
        }

        return { errors, warnings };
    }
}