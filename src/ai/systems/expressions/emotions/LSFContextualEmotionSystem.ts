// src/ai/systems/expressions/emotions/LSFContextualEmotionSystem.ts

import {
    EmotionState,
    AdaptedEmotion,
    ContextualInformation,
    AdaptationPlan,
    ExpressionAdjustments,
    TemporalModifications,
    AdaptationScores,
    AuthenticityScores,
    ContextAnalysis,
    SocialContext,
    NarrativeContext,
    FacialAdjustments,
    GesturalAdjustments,
    PosturalAdjustments,
    DurationModification,
    TransitionModification,
    RhythmModification,
    SocialFactorsAnalysis,
    NarrativeElementsAnalysis,
    CulturalConsiderationsAnalysis
} from './contextual/types';

import {
    SocialContextAnalyzer,
    NarrativeContextAnalyzer,
    CulturalContextAnalyzer,
    TemporalContextAnalyzer
} from './contextual/analyzers';

import { ContextualAdaptationValidator } from './validation/ContextualAdaptationValidator';
import { CulturalContext } from '@ai/specialized/spatial/types';

/**
 * Système contextuel d'émotions pour la LSF
 * Adapte les expressions émotionnelles en fonction du contexte social, narratif, culturel et temporel
 */
export class LSFContextualEmotionSystem {
    private readonly CONTEXTUAL_RULES = {
        // Règles contextuelles (comme dans le fichier original)
        SOCIAL_CONTEXT: {
            FORMAL: {
                PROFESSIONAL: {
                    emotion_modulation: {
                        intensity_cap: 0.7,
                        expression_control: 'highly_regulated',
                        recovery_speed: 'swift'
                    },
                    spatial_adaptation: {
                        signing_space: 'contained',
                        movement_precision: 'enhanced',
                        posture: 'formal_maintained'
                    },
                    non_manual_features: {
                        facial_expressions: {
                            range: 'controlled',
                            transitions: 'smooth',
                            duration: 'measured'
                        },
                        head_movements: {
                            amplitude: 'reduced',
                            frequency: 'moderate',
                            purpose: 'grammatical_primary'
                        }
                    }
                },

                ACADEMIC: {
                    emotion_modulation: {
                        intensity_cap: 0.75,
                        expression_control: 'balanced',
                        recovery_speed: 'moderate'
                    },
                    spatial_adaptation: {
                        signing_space: 'structured',
                        movement_precision: 'high',
                        posture: 'engaged_proper'
                    },
                    emphasis_patterns: {
                        emotional_markers: 'subtle',
                        grammatical_markers: 'clear',
                        balance: 'grammar_priority'
                    }
                }
            },

            INFORMAL: {
                SOCIAL_GATHERING: {
                    emotion_modulation: {
                        intensity_cap: 0.9,
                        expression_control: 'natural',
                        recovery_speed: 'natural'
                    },
                    spatial_adaptation: {
                        signing_space: 'expanded',
                        movement_dynamics: 'fluid',
                        posture: 'relaxed_engaged'
                    },
                    non_manual_features: {
                        facial_expressions: {
                            range: 'full',
                            transitions: 'dynamic',
                            duration: 'natural'
                        },
                        head_movements: {
                            amplitude: 'natural',
                            frequency: 'context_driven',
                            purpose: 'expressive_grammatical'
                        }
                    }
                },

                INTIMATE: {
                    emotion_modulation: {
                        intensity_cap: 1.0,
                        expression_control: 'minimal',
                        recovery_speed: 'natural_extended'
                    },
                    spatial_adaptation: {
                        signing_space: 'comfortable',
                        movement_dynamics: 'free',
                        posture: 'natural_intimate'
                    },
                    expression_freedom: {
                        emotional_range: 'full',
                        transition_style: 'fluid',
                        intensity_variation: 'natural'
                    }
                }
            }
        },

        NARRATIVE_CONTEXT: {
            STORYTELLING: {
                CHARACTER_EMOTIONS: {
                    embodiment: {
                        intensity: 'role_appropriate',
                        transitions: 'character_driven',
                        maintenance: 'consistent'
                    },
                    spatial_marking: {
                        character_zones: 'distinct',
                        emotional_spaces: 'clear',
                        transitions: 'fluid'
                    },
                    temporal_patterns: {
                        build_up: 'narrative_paced',
                        climax: 'emphasized',
                        resolution: 'natural_closure'
                    }
                },

                NARRATIVE_FLOW: {
                    emotional_arc: {
                        development: 'progressive',
                        peaks: 'story_driven',
                        transitions: 'smooth'
                    },
                    engagement_patterns: {
                        intensity_variation: 'dramatic',
                        audience_connection: 'maintained',
                        emotional_clarity: 'high'
                    }
                }
            },

            PERSONAL_EXPERIENCE: {
                EMOTIONAL_AUTHENTICITY: {
                    expression: {
                        intensity: 'genuine',
                        modulation: 'experience_based',
                        sustainability: 'natural'
                    },
                    connection: {
                        audience_rapport: 'direct',
                        emotional_resonance: 'high',
                        engagement: 'personal'
                    }
                },

                MEMORY_INFLUENCE: {
                    emotional_recall: {
                        intensity: 'authentic',
                        adaptation: 'present_context',
                        balance: 'past_present'
                    },
                    expression_patterns: {
                        build_up: 'memory_paced',
                        emphasis: 'key_moments',
                        resolution: 'reflective'
                    }
                }
            }
        },

        CULTURAL_CONTEXT: {
            COMMUNITY_EVENTS: {
                COLLECTIVE_EXPRESSION: {
                    shared_emotions: {
                        synchronization: 'community_rhythm',
                        intensity: 'collectively_modulated',
                        spread: 'natural_flow'
                    },
                    cultural_markers: {
                        traditional_elements: 'preserved',
                        modern_integration: 'balanced',
                        authenticity: 'maintained'
                    }
                },

                GROUP_DYNAMICS: {
                    emotional_resonance: {
                        collective_amplification: 'controlled',
                        individual_expression: 'harmonized',
                        group_cohesion: 'enhanced'
                    },
                    spatial_organization: {
                        group_spacing: 'cultural_appropriate',
                        interaction_zones: 'defined',
                        movement_patterns: 'coordinated'
                    }
                }
            },

            INTERCULTURAL_SETTINGS: {
                ADAPTATION_PATTERNS: {
                    emotional_bridging: {
                        expression_clarity: 'enhanced',
                        cultural_sensitivity: 'high',
                        accessibility: 'balanced'
                    },
                    communication_style: {
                        emotional_markers: 'universal_local',
                        expression_format: 'culturally_adapted',
                        intensity_modulation: 'context_aware'
                    }
                },

                CULTURAL_AWARENESS: {
                    expression_choices: {
                        appropriateness: 'culturally_informed',
                        adaptability: 'responsive',
                        respect: 'maintained'
                    },
                    interaction_patterns: {
                        engagement_style: 'culturally_sensitive',
                        emotional_exchange: 'balanced',
                        feedback_integration: 'adaptive'
                    }
                }
            }
        }
    };

    private socialAnalyzer: SocialContextAnalyzer;
    private narrativeAnalyzer: NarrativeContextAnalyzer;
    private culturalAnalyzer: CulturalContextAnalyzer;
    private temporalAnalyzer: TemporalContextAnalyzer;
    private validator: ContextualAdaptationValidator;

    constructor() {
        this.socialAnalyzer = new SocialContextAnalyzer();
        this.narrativeAnalyzer = new NarrativeContextAnalyzer();
        this.culturalAnalyzer = new CulturalContextAnalyzer();
        this.temporalAnalyzer = new TemporalContextAnalyzer();
        this.validator = new ContextualAdaptationValidator();
    }

    /**
     * Analyse le contexte global
     * @param context Informations contextuelles
     * @returns Analyse du contexte
     */
    private async analyzeContext(context: ContextualInformation): Promise<ContextAnalysis> {
        return {
            socialFactors: this.socialAnalyzer.analyzeSocialContext(context.social),
            narrativeElements: this.narrativeAnalyzer.analyzeNarrativeContext(context.narrative),
            culturalConsiderations: this.culturalAnalyzer.analyzeCulturalContext(context.cultural),
            temporalPatterns: this.temporalAnalyzer.analyzeTemporalContext(context.temporal)
        };
    }

    /**
     * Détermine les adaptations contextuelles
     * @param emotion État émotionnel
     * @param analysis Analyse du contexte
     * @returns Plan d'adaptation
     */
    private determineContextualAdaptations(
        emotion: EmotionState,
        analysis: ContextAnalysis
    ): AdaptationPlan {
        return {
            intensityModulation: this.calculateIntensityModulation(emotion, analysis),
            expressionAdjustments: this.determineExpressionAdjustments(analysis),
            temporalModifications: this.determineTemporalModifications(analysis)
        };
    }

    /**
     * Calcule la modulation d'intensité
     * @param emotion État émotionnel
     * @param analysis Analyse du contexte
     * @returns Facteur de modulation d'intensité
     */
    private calculateIntensityModulation(emotion: EmotionState, analysis: ContextAnalysis): number {
        const socialFactor = this.calculateSocialIntensityFactor(analysis.socialFactors);
        const narrativeFactor = this.calculateNarrativeIntensityFactor(analysis.narrativeElements);
        const culturalFactor = this.calculateCulturalIntensityFactor(analysis.culturalConsiderations);

        // Combinaison pondérée des facteurs
        return (socialFactor * 0.5) + (narrativeFactor * 0.3) + (culturalFactor * 0.2);
    }

    /**
     * Détermine les ajustements d'expression
     * @param analysis Analyse du contexte
     * @returns Ajustements d'expression
     */
    private determineExpressionAdjustments(analysis: ContextAnalysis): ExpressionAdjustments {
        return {
            facial: this.adjustFacialExpressions(analysis),
            gestural: this.adjustGestures(analysis),
            postural: this.adjustBodyPosture(analysis)
        };
    }

    /**
     * Détermine les modifications temporelles
     * @param analysis Analyse du contexte
     * @returns Modifications temporelles
     */
    private determineTemporalModifications(analysis: ContextAnalysis): TemporalModifications {
        return {
            duration: this.calculateModifiedDuration(analysis),
            transitions: this.adjustTransitionTiming(analysis),
            rhythm: this.determineRhythmPatterns(analysis)
        };
    }

    /**
     * Applique les adaptations contextuelles
     * @param emotion État émotionnel
     * @param adaptations Plan d'adaptation
     * @param context Informations contextuelles
     * @returns État émotionnel adapté
     */
    private async applyContextualAdaptations(
        emotion: EmotionState,
        adaptations: AdaptationPlan,
        context: ContextualInformation
    ): Promise<EmotionState> {
        return {
            type: emotion.type,
            intensity: this.applyIntensityModulation(emotion.intensity, adaptations),
            components: this.applyComponentAdjustments(emotion.components, adaptations),
            dynamics: this.applyDynamicModifications(emotion.dynamics, adaptations),
            metadata: {
                ...emotion.metadata,
                contextualAdaptation: {
                    source: 'contextual_system',
                    adaptationType: this.determineAdaptationType(context),
                    confidenceScore: this.calculateAdaptationConfidence(adaptations)
                }
            }
        };
    }

    /**
     * Adapte une émotion à un contexte
     * @param emotion État émotionnel à adapter
     * @param context Informations contextuelles
     * @returns Émotion adaptée avec métadonnées
     */
    async adaptEmotionToContext(
        emotion: EmotionState,
        context: ContextualInformation
    ): Promise<AdaptedEmotion> {
        const contextualAnalysis = await this.analyzeContext(context);
        const adaptations = this.determineContextualAdaptations(emotion, contextualAnalysis);
        const adaptedEmotion = await this.applyContextualAdaptations(emotion, adaptations, context);

        // Valider l'adaptation
        await this.validator.validateContextualAdaptation(adaptedEmotion, emotion, context);

        return {
            emotion: adaptedEmotion,
            metadata: {
                contextualRelevance: this.evaluateContextualRelevance(adaptedEmotion, context),
                adaptationQuality: this.evaluateAdaptationQuality(emotion, adaptedEmotion),
                culturalAuthenticity: this.evaluateCulturalAuthenticity(adaptedEmotion, context)
            }
        };
    }

    /**
     * Calcule le facteur d'intensité sociale
     * @param socialFactors Facteurs sociaux
     * @returns Facteur d'intensité
     */
    private calculateSocialIntensityFactor(socialFactors: SocialFactorsAnalysis): number {
        // Plus le niveau de formalité est élevé, plus l'intensité est réduite
        const formalityLevel = socialFactors.formalityLevel || 0.5;
        const formalityAdjustment = 1 - (formalityLevel * 0.3);

        // L'intimité peut augmenter légèrement l'intensité
        const intimacy = (socialFactors.relationshipDynamics as Record<string, number>)?.intimacy || 0.5;
        const intimacyAdjustment = 1 + (intimacy * 0.1);

        // Les distractions peuvent réduire l'intensité
        const distractionLevel = (socialFactors.environmentalFactors as Record<string, number>)?.distractionLevel || 0.3;
        const environmentalAdjustment = 1 - (distractionLevel * 0.1);

        return formalityAdjustment * intimacyAdjustment * environmentalAdjustment;
    }

    /**
     * Calcule le facteur d'intensité narratif
     * @param narrativeElements Éléments narratifs
     * @returns Facteur d'intensité
     */
    private calculateNarrativeIntensityFactor(narrativeElements: NarrativeElementsAnalysis): number {
        // Le ton narratif affecte l'intensité
        const tone = narrativeElements.storyElements?.tone || 'neutral';
        const toneAdjustment = tone === 'dramatic' ? 1.2 :
            tone === 'subdued' ? 0.8 : 1.0;

        // Les arcs émotionnels peuvent amplifier l'intensité
        const hasEmotionalArcs = (narrativeElements.emotionalArcs?.length || 0) > 0;
        const arcsAdjustment = hasEmotionalArcs ? 1.1 : 1.0;

        return toneAdjustment * arcsAdjustment;
    }

    /**
     * Calcule le facteur d'intensité culturel
     * @param culturalConsiderations Considérations culturelles
     * @returns Facteur d'intensité
     */
    private calculateCulturalIntensityFactor(culturalConsiderations: CulturalConsiderationsAnalysis): number {
        // Les normes culturelles peuvent affecter l'intensité
        const culturalNorms = culturalConsiderations.culturalNorms || [];
        const hasRestraintNorms = culturalNorms.some(
            (norm: string) => ['restraint', 'moderation', 'formality'].includes(norm)
        );

        const normAdjustment = hasRestraintNorms ? 0.9 : 1.0;

        // Les éléments traditionnels peuvent encourager l'authenticité
        const traditionalElements = culturalConsiderations.traditionalElements || {};
        const traditionalFactor = Object.values(traditionalElements).length > 0 ? 1.05 : 1.0;

        return normAdjustment * traditionalFactor;
    }

    /**
     * Ajuste les expressions faciales
     * @param analysis Analyse du contexte
     * @returns Ajustements des expressions faciales
     */
    private adjustFacialExpressions(analysis: ContextAnalysis): FacialAdjustments {
        const formalityLevel = analysis.socialFactors.formalityLevel;

        // Plus le contexte est formel, plus l'expression est contrôlée
        return {
            range: formalityLevel > 0.7 ? 'restricted' : 'full',
            intensity: Math.max(0.3, 1 - formalityLevel),
            control: formalityLevel > 0.7 ? 'high' : 'moderate',
            emphasis: {
                eyebrows: formalityLevel > 0.7 ? 'subtle' : 'dynamic',
                mouth: formalityLevel > 0.7 ? 'controlled' : 'expressive',
                eyes: formalityLevel > 0.7 ? 'measured' : 'animated'
            }
        };
    }

    /**
     * Ajuste les gestes
     * @param analysis Analyse du contexte
     * @returns Ajustements gestuels
     */
    private adjustGestures(analysis: ContextAnalysis): GesturalAdjustments {
        const formalityLevel = analysis.socialFactors.formalityLevel;
        const culturalNorms = analysis.culturalConsiderations.culturalNorms;

        // Adaptation des gestes selon le contexte et les normes culturelles
        return {
            amplitude: formalityLevel > 0.7 ? 'reduced' : 'natural',
            precision: formalityLevel > 0.7 ? 'enhanced' : 'standard',
            space: formalityLevel > 0.7 ? 'contained' : 'comfortable',
            cultural_alignment: culturalNorms.includes('formal_introduction') ? 'high' : 'standard'
        };
    }

    /**
     * Ajuste la posture corporelle
     * @param analysis Analyse du contexte
     * @returns Ajustements posturaux
     */
    private adjustBodyPosture(analysis: ContextAnalysis): PosturalAdjustments {
        const formalityLevel = analysis.socialFactors.formalityLevel;

        return {
            formality: formalityLevel > 0.7 ? 'formal' : 'relaxed',
            alignment: 'upright',
            tension: formalityLevel > 0.7 ? 'controlled' : 'natural',
            movement_freedom: formalityLevel > 0.7 ? 'restricted' : 'fluid'
        };
    }

    /**
     * Calcule la durée modifiée
     * @param analysis Analyse du contexte
     * @returns Modifications temporelles
     */
    private calculateModifiedDuration(analysis: ContextAnalysis): DurationModification {
        const formalityLevel = analysis.socialFactors.formalityLevel;
        const timingPatterns = analysis.temporalPatterns.timingPatterns;

        // Détermination de la durée basée sur le contexte
        const baseDuration = timingPatterns[0]?.duration || 1.0;

        // Dans un contexte formel, les expressions émotionnelles sont souvent plus brèves
        const formalityFactor = formalityLevel > 0.7 ? 0.8 : 1.0;

        return {
            base: baseDuration,
            adjusted: baseDuration * formalityFactor,
            factor: formalityFactor,
            reason: formalityLevel > 0.7 ? 'formal_context_brevity' : 'standard_duration'
        };
    }

    /**
     * Ajuste le timing des transitions
     * @param analysis Analyse du contexte
     * @returns Ajustements de timing
     */
    private adjustTransitionTiming(analysis: ContextAnalysis): TransitionModification {
        const formalityLevel = analysis.socialFactors.formalityLevel;

        // Dans un contexte formel, les transitions sont plus nettes et contrôlées
        return {
            style: formalityLevel > 0.7 ? 'precise' : 'natural',
            speed: formalityLevel > 0.7 ? 'moderate' : 'variable',
            smoothness: formalityLevel > 0.7 ? 'controlled' : 'organic'
        };
    }

    /**
     * Détermine les motifs rythmiques
     * @param analysis Analyse du contexte
     * @returns Motifs rythmiques
     */
    private determineRhythmPatterns(analysis: ContextAnalysis): RhythmModification {
        const narrativeElements = analysis.narrativeElements;
        const culturalConsiderations = analysis.culturalConsiderations;

        // Le rythme est influencé par le contexte narratif et culturel
        const narrativeInfluence = narrativeElements.storyElements.tone === 'dramatic' ? 'dynamic' : 'steady';
        const culturalInfluence = culturalConsiderations.culturalNorms.includes('precision') ? 'precise' : 'flowing';

        return {
            base: narrativeInfluence,
            cultural_overlay: culturalInfluence,
            pattern: `${narrativeInfluence}_${culturalInfluence}`,
            variations: Object.keys(culturalConsiderations.traditionalElements).length > 0 ? 'culturally_informed' : 'standard'
        };
    }

    /**
     * Applique la modulation d'intensité
     * @param baseIntensity Intensité de base
     * @param adaptations Plan d'adaptation
     * @returns Intensité modulée
     */
    private applyIntensityModulation(baseIntensity: number, adaptations: AdaptationPlan): number {
        return Math.min(1.0, Math.max(0.1, baseIntensity * adaptations.intensityModulation));
    }

    /**
     * Applique les ajustements aux composantes
     * @param baseComponents Composantes de base
     * @param adaptations Plan d'adaptation
     * @returns Composantes ajustées
     */
    private applyComponentAdjustments(
        baseComponents: EmotionState['components'],
        adaptations: AdaptationPlan
    ): EmotionState['components'] {
        return {
            facial: this.applyFacialAdjustments(baseComponents.facial, adaptations.expressionAdjustments.facial),
            gestural: this.applyGesturalAdjustments(baseComponents.gestural, adaptations.expressionAdjustments.gestural),
            intensity: baseComponents.intensity * adaptations.intensityModulation
        };
    }

    /**
     * Applique les ajustements faciaux
     * @param baseFacial Expression faciale de base
     * @param adjustments Ajustements à appliquer
     * @returns Expression faciale ajustée
     */
    private applyFacialAdjustments(
        baseFacial: EmotionState['components']['facial'],
        adjustments: FacialAdjustments
    ): EmotionState['components']['facial'] {
        return {
            eyebrows: baseFacial.eyebrows,
            eyes: baseFacial.eyes,
            mouth: baseFacial.mouth,
            intensity: baseFacial.intensity * (adjustments.intensity || 1.0)
        };
    }

    /**
     * Applique les ajustements gestuels
     * @param baseGestural Expression gestuelle de base
     * @param adjustments Ajustements à appliquer
     * @returns Expression gestuelle ajustée
     */
    private applyGesturalAdjustments(
        baseGestural: EmotionState['components']['gestural'],
        adjustments: GesturalAdjustments
    ): EmotionState['components']['gestural'] {
        // Adaptation des amplitudes gestuelles
        const amplitude = adjustments.amplitude || 'natural';
        const amplitudeFactor = amplitude === 'reduced' ? 0.7 :
            amplitude === 'natural' ? 1.0 : 1.2;

        return {
            hands: baseGestural.hands,
            arms: baseGestural.arms,
            body: baseGestural.body,
            intensity: baseGestural.intensity * amplitudeFactor
        };
    }

    /**
     * Applique les modifications dynamiques
     * @param baseDynamics Dynamique de base
     * @param adaptations Plan d'adaptation
     * @returns Dynamique modifiée
     */
    private applyDynamicModifications(
        baseDynamics: EmotionState['dynamics'],
        adaptations: AdaptationPlan
    ): EmotionState['dynamics'] {
        // Ajustement de la durée
        const durationFactor = (adaptations.temporalModifications.duration.factor || 1.0);

        return {
            duration: baseDynamics.duration * durationFactor,
            transition: this.determineTransitionType(adaptations.temporalModifications.transitions),
            sequence: baseDynamics.sequence
        };
    }

    /**
     * Détermine le type de transition
     * @param transitionAdjustments Ajustements des transitions
     * @returns Type de transition
     */
    private determineTransitionType(transitionAdjustments: TransitionModification): EmotionState['dynamics']['transition'] {
        const style = transitionAdjustments.style || 'natural';
        if (style === 'precise') return 'smooth';
        if (style === 'natural') return 'gradual';
        return 'smooth';
    }

    /**
     * Détermine le type d'adaptation
     * @param context Informations contextuelles
     * @returns Type d'adaptation
     */
    private determineAdaptationType(context: ContextualInformation): string {
        // Déterminer le type d'adaptation principal
        if (context.social && context.social.setting) {
            return `social_${context.social.setting.toLowerCase()}`;
        } else if (context.narrative && context.narrative.type) {
            return `narrative_${context.narrative.type.toLowerCase()}`;
        } else if (context.cultural && context.cultural.region) {
            return `cultural_${context.cultural.region.toLowerCase()}`;
        }
        return 'generic';
    }

    /**
     * Calcule la confiance dans l'adaptation
     * @param adaptations Plan d'adaptation
     * @returns Score de confiance
     */
    private calculateAdaptationConfidence(adaptations: AdaptationPlan): number {
        // Calculer la confiance en fonction de la pertinence des ajustements
        const hasValidIntensity = adaptations.intensityModulation >= 0.5 && adaptations.intensityModulation <= 1.5;
        const hasValidExpressionAdjustments = Object.keys(adaptations.expressionAdjustments).length >= 2;
        const hasValidTemporalModifications = Object.keys(adaptations.temporalModifications).length >= 2;

        let confidence = 0.5;
        if (hasValidIntensity) confidence += 0.2;
        if (hasValidExpressionAdjustments) confidence += 0.2;
        if (hasValidTemporalModifications) confidence += 0.1;

        return Math.min(1.0, confidence);
    }

    /**
     * Évalue la pertinence contextuelle
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Score de pertinence contextuelle
     */
    private evaluateContextualRelevance(
        emotion: EmotionState,
        context: ContextualInformation
    ): AdaptationScores {
        return {
            overall: 0.85,
            social: this.evaluateSocialRelevance(emotion, context.social),
            narrative: this.evaluateNarrativeRelevance(emotion, context.narrative),
            cultural: this.evaluateCulturalRelevance(emotion, context.cultural)
        };
    }

    /**
     * Évalue la pertinence sociale
     * @param emotion État émotionnel adapté
     * @param social Contexte social
     * @returns Score de pertinence sociale
     */
    private evaluateSocialRelevance(emotion: EmotionState, social: SocialContext): number {
        // Évaluation de base
        let score = 0.8;

        // Ajustements en fonction du contexte
        if (social.setting === 'professional' && emotion.intensity > 0.7) {
            score -= 0.2; // Trop intense pour un contexte professionnel
        } else if (social.setting === 'intimate' && emotion.intensity < 0.6) {
            score -= 0.1; // Pas assez expressif pour un contexte intime
        }

        return Math.min(1.0, Math.max(0.1, score));
    }

    /**
     * Évalue la pertinence narrative
     * @param emotion État émotionnel adapté
     * @param narrative Contexte narratif
     * @returns Score de pertinence narrative
     */
    private evaluateNarrativeRelevance(emotion: EmotionState, narrative: NarrativeContext): number {
        // Score de base
        let score = 0.75;

        // Ajustements en fonction du contexte narratif
        if (narrative.type === 'dramatic' && ['fear', 'anger', 'sadness'].includes(emotion.type)) {
            score += 0.15; // Émotions bien adaptées à un contexte dramatique
        } else if (narrative.type === 'comedic' && ['joy', 'surprise'].includes(emotion.type)) {
            score += 0.15; // Émotions bien adaptées à un contexte comique
        }

        return Math.min(1.0, Math.max(0.1, score));
    }

    /**
     * Évalue la pertinence culturelle
     * @param emotion État émotionnel adapté
     * @param cultural Contexte culturel
     * @returns Score de pertinence culturelle
     */
    private evaluateCulturalRelevance(emotion: EmotionState, cultural: CulturalContext): number {
        // Score de base
        let score = 0.8;

        // Ajustements en fonction du contexte culturel
        if (cultural.formalityLevel > 0.7 && emotion.intensity > 0.8) {
            score -= 0.15; // Trop intense pour une culture formelle
        }

        return Math.min(1.0, Math.max(0.1, score));
    }

    /**
     * Évalue la qualité de l'adaptation
     * @param originalEmotion État émotionnel original
     * @param adaptedEmotion État émotionnel adapté
     * @returns Score de qualité d'adaptation
     */
    private evaluateAdaptationQuality(originalEmotion: EmotionState, adaptedEmotion: EmotionState): number {
        // Vérifier si l'adaptation a préservé l'essence émotionnelle
        const typePreserved = originalEmotion.type === adaptedEmotion.type;

        // Vérifier les modifications d'intensité
        const intensityChange = Math.abs(originalEmotion.intensity - adaptedEmotion.intensity);
        const intensityScore = intensityChange > 0.5 ? 0.6 :
            intensityChange > 0.3 ? 0.8 : 0.95;

        // Score global
        const baseScore = typePreserved ? 0.9 : 0.5;
        return baseScore * intensityScore;
    }

    /**
     * Évalue l'authenticité culturelle
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Scores d'authenticité
     */
    private evaluateCulturalAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): AuthenticityScores {
        return {
            overall: 0.82,
            expressiveness: this.evaluateExpressivenessAuthenticity(emotion, context),
            appropriateness: this.evaluateAppropriatenessAuthenticity(emotion, context),
            coherence: this.evaluateCoherenceAuthenticity(emotion, context)
        };
    }

    /**
      * Évalue l'authenticité de l'expressivité
      * @param emotion État émotionnel adapté
      * @param context Informations contextuelles
      * @returns Score d'authenticité d'expressivité
      */
    private evaluateExpressivenessAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): number {
        // Évaluation de base de l'expressivité selon le contexte culturel
        const baseScore = 0.8;

        // Ajustements spécifiques
        let adjustment = 0;
        if (context.cultural && context.cultural.region === 'france') {
            adjustment += 0.1; // Bonus pour l'expressivité française
        }

        // Ajustements basés sur l'intensité émotionnelle
        if (emotion.intensity > 0.8 && context.social.setting === 'intimate') {
            adjustment += 0.05; // Authentique pour les émotions intenses en contexte intime
        } else if (emotion.intensity > 0.7 && context.social.setting === 'professional') {
            adjustment -= 0.05; // Moins authentique pour les émotions intenses en contexte professionnel
        }

        return Math.min(1.0, Math.max(0.1, baseScore + adjustment));
    }


    /**
      * Évalue l'authenticité de la pertinence
      * @param emotion État émotionnel adapté
      * @param context Informations contextuelles
      * @returns Score d'authenticité de pertinence
      */
    private evaluateAppropriatenessAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): number {
        // Score de base
        let score = 0.85;

        // Ajustements basés sur la pertinence de l'émotion au contexte
        if (context.narrative.type === 'dramatic') {
            if (['sadness', 'fear', 'anger'].includes(emotion.type)) {
                score += 0.1; // Ces émotions sont appropriées pour un contexte dramatique
            } else if (['joy'].includes(emotion.type)) {
                score -= 0.1; // La joie est moins appropriée pour un contexte dramatique sauf cas spécifique
            }
        } else if (context.narrative.type === 'comedic') {
            if (['joy', 'surprise'].includes(emotion.type)) {
                score += 0.1; // Ces émotions sont appropriées pour un contexte comique
            }
        }

        // Ajustements culturels
        if (context.cultural.formalityLevel > 0.7 && emotion.intensity > 0.7) {
            score -= 0.15; // Moins approprié d'avoir des émotions intenses dans un contexte formel
        }

        return Math.min(1.0, Math.max(0.1, score));
    }

    /**
    * Évalue l'authenticité de la cohérence
    * @param emotion État émotionnel adapté
    * @param context Informations contextuelles
    * @returns Score d'authenticité de cohérence
    */
    private evaluateCoherenceAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): number {
        // Évaluation de base de la cohérence
        let score = 0.8;

        // Évaluer la cohérence entre les différentes composantes de l'émotion
        const intensityCoherence = this.evaluateComponentsIntensityCoherence(emotion);

        // Évaluer la cohérence avec le contexte temporel
        const temporalCoherence = this.evaluateTemporalCoherence(emotion, context.temporal);

        // Ajuster le score en fonction des évaluations spécifiques
        score = (score + intensityCoherence + temporalCoherence) / 3;

        return Math.min(1.0, Math.max(0.1, score));
    }

    /**
 * Évalue la cohérence d'intensité entre les composantes
 * @param emotion État émotionnel
 * @returns Score de cohérence
 */
    private evaluateComponentsIntensityCoherence(emotion: EmotionState): number {
        // Calculer les écarts d'intensité entre les différentes composantes
        const facialIntensity = emotion.components.facial.intensity;
        const gesturalIntensity = emotion.components.gestural.intensity;
        const globalIntensity = emotion.intensity;

        // Calculer les différences
        const facialGesturalDiff = Math.abs(facialIntensity - gesturalIntensity);
        const facialGlobalDiff = Math.abs(facialIntensity - globalIntensity);
        const gesturalGlobalDiff = Math.abs(gesturalIntensity - globalIntensity);

        // Calculer le score basé sur les différences (plus la différence est petite, plus le score est élevé)
        const maxDifference = Math.max(facialGesturalDiff, facialGlobalDiff, gesturalGlobalDiff);

        // Une différence de 0.3 ou plus est considérée comme incohérente
        return Math.max(0, 1 - (maxDifference / 0.3));
    }

    /**
         * Évalue la cohérence temporelle
         * @param emotion État émotionnel
         * @param temporal Contexte temporel
         * @returns Score de cohérence
         */
    private evaluateTemporalCoherence(emotion: EmotionState, temporal: ContextualInformation['temporal']): number {
        // Évaluer si la durée de l'émotion est cohérente avec le contexte temporel
        const emotionDuration = emotion.dynamics.duration;
        const contextDuration = temporal.duration;

        // Calculer la différence relative (normalisée)
        const relativeDifference = Math.abs(emotionDuration - contextDuration) / Math.max(emotionDuration, contextDuration);

        // Une différence relative de 0.5 ou plus est considérée comme incohérente
        return Math.max(0, 1 - (relativeDifference / 0.5));
    }

}