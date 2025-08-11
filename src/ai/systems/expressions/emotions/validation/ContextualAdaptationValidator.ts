// src/ai/systems/expressions/emotions/validation/ContextualAdaptationValidator.ts

import {
    EmotionState,
    ContextualInformation,
    ValidationResult,
    ValidationIssue,
    SocialContext,
    NarrativeContext
} from '../contextual/types';
import { CulturalContext } from '@ai/specialized/spatial/types';
import { IContextualAdaptationValidator } from '../contextual/interfaces';

/**
 * Validateur des adaptations contextuelles pour le système d'émotions LSF
 */
export class ContextualAdaptationValidator implements IContextualAdaptationValidator {
    // Seuils de validation
    private readonly THRESHOLDS = {
        INTENSITY_DEVIATION_MAX: 0.5, // Déviation maximale d'intensité acceptée
        EMOTION_TYPE_MISMATCH: false, // Le type d'émotion peut-il changer
        MIN_INTENSITY: 0.1, // Intensité minimale
        MAX_INTENSITY: 1.0, // Intensité maximale
        MIN_DURATION: 0.5, // Durée minimale en secondes
        MAX_DURATION: 10.0 // Durée maximale en secondes
    };

    /**
     * Valide une adaptation contextuelle d'émotion
     * @param adaptedEmotion État émotionnel adapté
     * @param originalEmotion État émotionnel original
     * @param context Informations contextuelles
     * @returns Résultat de validation
     */
    public async validateContextualAdaptation(
        adaptedEmotion: EmotionState,
        originalEmotion: EmotionState,
        context: ContextualInformation
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        try {
            // Validation de l'intégrité structurelle
            this.validateStructuralIntegrity(adaptedEmotion);

            // Validation de la pertinence contextuelle
            const contextValidation = await this.validateContextualRelevance(adaptedEmotion, context);
            if (!contextValidation.valid) {
                issues.push(...contextValidation.issues);
            }

            // Validation de l'authenticité émotionnelle
            const authenticityValidation = await this.validateEmotionalAuthenticity(adaptedEmotion, originalEmotion);
            if (!authenticityValidation.valid) {
                issues.push(...authenticityValidation.issues);
            }

            // Validation de la cohérence culturelle
            const culturalValidation = await this.validateCulturalCoherence(adaptedEmotion, context.cultural);
            if (!culturalValidation.valid) {
                issues.push(...culturalValidation.issues);
            }

            // Validation des contraintes temporelles
            const temporalValidation = await this.validateTemporalConstraints(adaptedEmotion, context.temporal);
            if (!temporalValidation.valid) {
                issues.push(...temporalValidation.issues);
            }

            const valid = issues.length === 0;

            return {
                valid,
                issues,
                score: valid ? 1.0 : this.calculateValidationScore(issues)
            };
        } catch (error) {
            // En cas d'erreur de validation, créer un problème avec le message d'erreur
            const errorIssue: ValidationIssue = {
                code: 'VALIDATION_ERROR',
                severity: 'error',
                message: error instanceof Error ? error.message : 'Erreur de validation inconnue',
                details: { error: error instanceof Error ? error.stack : 'Unknown error' }
            };

            issues.push(errorIssue);

            return {
                valid: false,
                issues,
                score: 0.1 // Score très bas en cas d'erreur critique
            };
        }
    }

    /**
     * Valide l'intégrité structurelle de l'émotion adaptée
     * @param emotion État émotionnel à valider
     * @throws Error si l'intégrité structurelle est compromise
     */
    private validateStructuralIntegrity(emotion: EmotionState): void {
        // Vérifier que l'émotion existe et est de type objet
        if (!emotion || typeof emotion !== 'object') {
            throw new Error('L\'émotion adaptée est invalide ou manquante');
        }

        // Vérifier la présence de propriétés essentielles
        if (!emotion.type) {
            throw new Error('L\'émotion adaptée doit avoir un type');
        }

        if (typeof emotion.intensity !== 'number') {
            throw new Error('L\'émotion adaptée doit avoir une intensité numérique');
        }

        // Vérifier l'intensité dans les bornes acceptables
        if (emotion.intensity < this.THRESHOLDS.MIN_INTENSITY ||
            emotion.intensity > this.THRESHOLDS.MAX_INTENSITY) {
            throw new Error(`L'intensité de l'émotion doit être entre ${this.THRESHOLDS.MIN_INTENSITY} et ${this.THRESHOLDS.MAX_INTENSITY}`);
        }

        // Vérifier la présence des composantes
        if (!emotion.components || typeof emotion.components !== 'object') {
            throw new Error('L\'émotion adaptée doit avoir des composantes');
        }

        // Vérifier les composantes faciales
        if (!emotion.components.facial || typeof emotion.components.facial !== 'object') {
            throw new Error('L\'émotion adaptée doit avoir des composantes faciales');
        }

        // Vérifier les composantes gestuelles
        if (!emotion.components.gestural || typeof emotion.components.gestural !== 'object') {
            throw new Error('L\'émotion adaptée doit avoir des composantes gestuelles');
        }

        // Vérifier la dynamique
        if (!emotion.dynamics || typeof emotion.dynamics !== 'object') {
            throw new Error('L\'émotion adaptée doit avoir une dynamique');
        }

        // Vérifier la dynamique temporelle
        if (typeof emotion.dynamics.duration !== 'number' || emotion.dynamics.duration <= 0) {
            throw new Error('L\'émotion adaptée doit avoir une durée positive');
        }
    }

    /**
     * Valide la pertinence contextuelle
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Résultat de validation
     */
    private async validateContextualRelevance(
        emotion: EmotionState,
        context: ContextualInformation
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // Vérification de la pertinence sociale
        const socialScore = this.evaluateSocialRelevance(emotion, context.social);
        if (socialScore < 0.6) {
            issues.push({
                code: 'SOCIAL_RELEVANCE_LOW',
                severity: 'warning',
                message: 'Émotion insuffisamment adaptée au contexte social',
                details: {
                    socialContext: context.social.setting,
                    emotionType: emotion.type,
                    score: socialScore,
                    threshold: 0.6
                }
            });
        }

        // Vérification de la pertinence narrative
        const narrativeScore = this.evaluateNarrativeRelevance(emotion, context.narrative);
        if (narrativeScore < 0.6) {
            issues.push({
                code: 'NARRATIVE_RELEVANCE_LOW',
                severity: 'info',
                message: 'Émotion insuffisamment alignée avec le contexte narratif',
                details: {
                    narrativeType: context.narrative.type,
                    emotionType: emotion.type,
                    score: narrativeScore,
                    threshold: 0.6
                }
            });
        }

        const valid = issues.length === 0;

        return {
            valid,
            issues,
            score: valid ? 1.0 : 0.7 - (issues.length * 0.1)
        };
    }

    /**
     * Valide l'authenticité émotionnelle
     * @param adaptedEmotion État émotionnel adapté
     * @param originalEmotion État émotionnel original
     * @returns Résultat de validation
     */
    private async validateEmotionalAuthenticity(
        adaptedEmotion: EmotionState,
        originalEmotion: EmotionState
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // Vérification de la préservation de l'essence émotionnelle
        if (!this.THRESHOLDS.EMOTION_TYPE_MISMATCH &&
            adaptedEmotion.type !== originalEmotion.type) {
            issues.push({
                code: 'EMOTION_TYPE_CHANGED',
                severity: 'error',
                message: 'Le type d\'émotion a été modifié lors de l\'adaptation',
                details: {
                    original: originalEmotion.type,
                    adapted: adaptedEmotion.type
                }
            });
        }

        // Vérification de l'intensité
        const intensityDifference = Math.abs(originalEmotion.intensity - adaptedEmotion.intensity);
        if (intensityDifference > this.THRESHOLDS.INTENSITY_DEVIATION_MAX) {
            issues.push({
                code: 'INTENSITY_CHANGE_EXCESSIVE',
                severity: 'warning',
                message: 'Changement d\'intensité émotionnelle trop important',
                details: {
                    original: originalEmotion.intensity,
                    adapted: adaptedEmotion.intensity,
                    difference: intensityDifference,
                    threshold: this.THRESHOLDS.INTENSITY_DEVIATION_MAX
                }
            });
        }

        // Vérification des composantes faciales
        const facialIntensityDifference = Math.abs(
            originalEmotion.components.facial.intensity - adaptedEmotion.components.facial.intensity
        );
        if (facialIntensityDifference > this.THRESHOLDS.INTENSITY_DEVIATION_MAX) {
            issues.push({
                code: 'FACIAL_INTENSITY_CHANGE_EXCESSIVE',
                severity: 'warning',
                message: 'Changement d\'intensité faciale trop important',
                details: {
                    original: originalEmotion.components.facial.intensity,
                    adapted: adaptedEmotion.components.facial.intensity,
                    difference: facialIntensityDifference,
                    threshold: this.THRESHOLDS.INTENSITY_DEVIATION_MAX
                }
            });
        }

        // Vérification des composantes gestuelles
        const gesturalIntensityDifference = Math.abs(
            originalEmotion.components.gestural.intensity - adaptedEmotion.components.gestural.intensity
        );
        if (gesturalIntensityDifference > this.THRESHOLDS.INTENSITY_DEVIATION_MAX) {
            issues.push({
                code: 'GESTURAL_INTENSITY_CHANGE_EXCESSIVE',
                severity: 'warning',
                message: 'Changement d\'intensité gestuelle trop important',
                details: {
                    original: originalEmotion.components.gestural.intensity,
                    adapted: adaptedEmotion.components.gestural.intensity,
                    difference: gesturalIntensityDifference,
                    threshold: this.THRESHOLDS.INTENSITY_DEVIATION_MAX
                }
            });
        }

        const valid = issues.length === 0;

        return {
            valid,
            issues,
            score: valid ? 1.0 : this.calculateValidationScore(issues)
        };
    }

    /**
     * Valide la cohérence culturelle
     * @param emotion État émotionnel adapté
     * @param cultural Contexte culturel
     * @returns Résultat de validation
     */
    private async validateCulturalCoherence(
        emotion: EmotionState,
        cultural: CulturalContext
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // Vérification de la cohérence avec les normes culturelles
        const culturalAlignment = this.evaluateCulturalAlignment(emotion, cultural);
        if (culturalAlignment < 0.6) {
            issues.push({
                code: 'CULTURAL_ALIGNMENT_LOW',
                severity: 'warning',
                message: 'Expression émotionnelle insuffisamment alignée avec le contexte culturel',
                details: {
                    region: cultural.region,
                    alignmentScore: culturalAlignment,
                    threshold: 0.6
                }
            });
        }

        // Vérification spécifique pour certains contextes culturels
        if (cultural.context === 'educational' && emotion.intensity > 0.8) {
            issues.push({
                code: 'FORMAL_CONTEXT_HIGH_INTENSITY',
                severity: 'warning',
                message: 'Intensité émotionnelle trop élevée pour un contexte formel',
                details: {
                    intensity: emotion.intensity,
                    context: cultural.context,
                    recommendedMax: 0.8
                }
            });
        }

        // Vérification spécifique pour les régions
        if (cultural.region === 'academic' && emotion.intensity > 0.7) {
            issues.push({
                code: 'ACADEMIC_CONTEXT_HIGH_INTENSITY',
                severity: 'info',
                message: 'Intensité émotionnelle élevée pour un contexte académique',
                details: {
                    intensity: emotion.intensity,
                    region: cultural.region,
                    recommendedMax: 0.7
                }
            });
        }

        const valid = issues.length === 0;

        return {
            valid,
            issues,
            score: valid ? 1.0 : 0.8 - (issues.length * 0.1)
        };
    }

    /**
     * Valide les contraintes temporelles
     * @param emotion État émotionnel adapté
     * @param temporalContext Contexte temporel
     * @returns Résultat de validation
     */
    private async validateTemporalConstraints(
        emotion: EmotionState,
        temporalContext: ContextualInformation['temporal']
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];
        const duration = emotion.dynamics.duration;

        // Vérification des limites globales de durée
        if (duration < this.THRESHOLDS.MIN_DURATION) {
            issues.push({
                code: 'DURATION_TOO_SHORT',
                severity: 'warning',
                message: `La durée ${duration}s est inférieure à la durée minimale ${this.THRESHOLDS.MIN_DURATION}s`,
                details: {
                    duration,
                    minDuration: this.THRESHOLDS.MIN_DURATION
                }
            });
        }

        if (duration > this.THRESHOLDS.MAX_DURATION) {
            issues.push({
                code: 'DURATION_TOO_LONG',
                severity: 'warning',
                message: `La durée ${duration}s est supérieure à la durée maximale ${this.THRESHOLDS.MAX_DURATION}s`,
                details: {
                    duration,
                    maxDuration: this.THRESHOLDS.MAX_DURATION
                }
            });
        }

        // Vérification de la cohérence avec la durée contextuelle
        if (typeof temporalContext.duration === 'number' && temporalContext.duration > 0) {
            const contextDuration = temporalContext.duration;
            // Permettre une marge de 30% autour de la durée contextuelle
            const minContextDuration = contextDuration * 0.7;
            const maxContextDuration = contextDuration * 1.3;

            if (duration < minContextDuration) {
                issues.push({
                    code: 'DURATION_BELOW_CONTEXT',
                    severity: 'info',
                    message: `La durée ${duration}s est significativement inférieure à la durée contextuelle recommandée`,
                    details: {
                        duration,
                        contextDuration,
                        recommendedMin: minContextDuration
                    }
                });
            } else if (duration > maxContextDuration) {
                issues.push({
                    code: 'DURATION_ABOVE_CONTEXT',
                    severity: 'info',
                    message: `La durée ${duration}s est significativement supérieure à la durée contextuelle recommandée`,
                    details: {
                        duration,
                        contextDuration,
                        recommendedMax: maxContextDuration
                    }
                });
            }
        }

        const valid = issues.length === 0;

        return {
            valid,
            issues,
            score: valid ? 1.0 : 0.9 - (issues.length * 0.1)
        };
    }

    /**
     * Calcule un score de validation basé sur les problèmes identifiés
     * @param issues Problèmes de validation
     * @returns Score de validation (0-1)
     */
    private calculateValidationScore(issues: ValidationIssue[]): number {
        // Score de base
        let score = 0.8;

        // Réduction pour chaque problème selon sa sévérité
        for (const issue of issues) {
            if (issue.severity === 'error') {
                score -= 0.3;
            } else if (issue.severity === 'warning') {
                score -= 0.1;
            } else if (issue.severity === 'info') {
                score -= 0.05;
            }
        }

        return Math.max(0.1, score);
    }

    /**
     * Évalue l'alignement culturel
     * @param emotion État émotionnel adapté
     * @param cultural Contexte culturel
     * @returns Score d'alignement culturel (0-1)
     */
    private evaluateCulturalAlignment(
        emotion: EmotionState,
        cultural: CulturalContext
    ): number {
        // Score de base
        const score = 0.8;

        // Ajustement en fonction du contexte culturel et de l'émotion
        const intensityFactor = emotion.intensity > 0.7 && cultural.formalityLevel > 0.6 ? -0.2 : 0;
        const expressivityFactor = cultural.region === 'france' ?
            (emotion.components.facial.intensity > 0.6 ? 0.1 : -0.1) : 0;

        // Ajustement en fonction du contexte
        let contextFactor = 0;
        if (cultural.context === 'educational' && emotion.intensity > 0.7) {
            contextFactor = -0.1;
        } else if (cultural.context === 'custom' && emotion.intensity < 0.6) {
            contextFactor = -0.1;
        }

        return Math.min(1.0, Math.max(0.1, score + intensityFactor + expressivityFactor + contextFactor));
    }

    /**
     * Évalue la pertinence sociale
     * @param emotion État émotionnel
     * @param social Contexte social
     * @returns Score de pertinence sociale (0-1)
     */
    private evaluateSocialRelevance(emotion: EmotionState, social: SocialContext): number {
        // Score de base
        const score = 0.75;

        // Ajustement basé sur le type d'émotion et le contexte social
        let contextFactor = 0;

        // Contextes formels
        if (social.setting === 'professional' || social.setting === 'academic') {
            if (emotion.intensity > 0.8) {
                contextFactor = -0.2; // Pénalité pour intensité élevée en contexte professionnel
            } else if (emotion.intensity < 0.5) {
                contextFactor = 0.1; // Bonus pour modération en contexte professionnel
            }
        }
        // Contextes informels
        else if (social.setting === 'intimate' || social.setting === 'casual') {
            if (emotion.intensity < 0.5 && ['joy', 'surprise'].includes(emotion.type)) {
                contextFactor = -0.15; // Pénalité pour intensité faible en contexte intime (émotions positives)
            } else if (emotion.intensity > 0.7) {
                contextFactor = 0.1; // Bonus pour expressivité en contexte intime
            }
        }

        // Ajustement basé sur le nombre de participants
        let participantsFactor = 0;
        if (social.participants?.count) {
            if (social.participants.count > 10 && emotion.intensity > 0.8) {
                participantsFactor = -0.1; // Pénalité pour intensité élevée devant large public
            }
        }

        return Math.min(1.0, Math.max(0.1, score + contextFactor + participantsFactor));
    }

    /**
     * Évalue la pertinence narrative
     * @param emotion État émotionnel
     * @param narrative Contexte narratif
     * @returns Score de pertinence narrative (0-1)
     */
    private evaluateNarrativeRelevance(emotion: EmotionState, narrative: NarrativeContext): number {
        // Score de base
        const score = 0.7;

        // Ajustement basé uniquement sur le type de narration et le type d'émotion
        let contextFactor = 0;

        // Ajustement en fonction du type de narration
        if (narrative.type === 'dramatic') {
            if (emotion.type === 'fear' || emotion.type === 'anger' || emotion.type === 'sadness') {
                contextFactor += 0.2; // Émotions fortes appropriées dans un contexte dramatique
            } else if (emotion.type === 'joy' && emotion.intensity > 0.7) {
                contextFactor -= 0.15; // Joie intense moins appropriée dans un contexte dramatique
            }
        } else if (narrative.type === 'comedic') {
            if (emotion.type === 'joy' || emotion.type === 'surprise') {
                contextFactor += 0.2; // Émotions positives appropriées dans un contexte comique
            } else if ((emotion.type === 'sadness' || emotion.type === 'anger') && emotion.intensity > 0.7) {
                contextFactor -= 0.15; // Émotions négatives intenses moins appropriées (sauf pour l'humour noir)
            }
        } else if (narrative.type === 'instructional') {
            // Pour un contexte instructif, des émotions plus modérées sont généralement préférables
            contextFactor = emotion.intensity > 0.7 ? -0.15 : 0.1;
        }

        // Ajustement en fonction des éléments de l'histoire
        let storyFactor = 0;
        if (narrative.storyElements?.tone) {
            const tone = narrative.storyElements.tone.toLowerCase();

            if (tone === 'dramatic' && emotion.intensity < 0.6) {
                storyFactor = -0.1; // Pénalité pour intensité faible avec ton dramatique
            } else if (tone === 'light' && emotion.intensity > 0.8) {
                storyFactor = -0.1; // Pénalité pour intensité excessive avec ton léger
            }
        }

        return Math.min(1.0, Math.max(0.1, score + contextFactor + storyFactor));
    }
}