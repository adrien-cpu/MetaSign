// src/ai/systems/expressions/emotions/contextual/evaluation/EmotionAdaptationEvaluator.ts

import {
    EmotionState,
    ContextualInformation,
    AdaptationScores,
    AuthenticityScores
} from '../types';
import { IEmotionAdaptationEvaluator } from '../interfaces';

// Ajout des interfaces nécessaires
interface RelationshipDynamics {
    intimacy: number;
    power: number;
    trust: number;
    familiarity: number;
}

interface StoryElements {
    phase: 'setup' | 'buildup' | 'climax' | 'resolution';
    tone: 'light' | 'neutral' | 'serious' | 'dramatic';
    tempo: number;
    intensity: number;
}

interface EmotionalComponent {
    intensity: number;
    variation: number;
    duration: number;
}

interface EmotionDynamics {
    duration: number;
    transition: 'smooth' | 'gradual' | 'abrupt';
    sequence: string[];
}

// Extension des types existants
interface SocialContext {
    setting: 'professional' | 'casual' | 'intimate';
    formalityLevel: number;
    relationshipDynamics: RelationshipDynamics;
}

interface NarrativeContext {
    type: 'dramatic' | 'comedic' | 'informative';
    storyElements: StoryElements;
}

/**
 * Évaluateur des adaptations émotionnelles contextuelles
 * Mesure la qualité et la pertinence des adaptations
 */
export class EmotionAdaptationEvaluator implements IEmotionAdaptationEvaluator {
    /**
     * Évalue la pertinence contextuelle d'une émotion adaptée
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Scores de pertinence contextuelle
     */
    public evaluateContextualRelevance(
        emotion: EmotionState,
        context: ContextualInformation
    ): AdaptationScores {
        // Évaluer la pertinence par rapport au contexte social
        const socialScore = this.evaluateSocialRelevance(emotion, context.social);

        // Évaluer la pertinence par rapport au contexte narratif
        const narrativeScore = this.evaluateNarrativeRelevance(emotion, context.narrative);

        // Évaluer la pertinence par rapport au contexte culturel
        const culturalScore = this.evaluateCulturalRelevance(emotion, context.cultural);

        // Calculer le score global (moyenne pondérée)
        const overall = this.calculateWeightedAverage([
            { value: socialScore, weight: 0.4 },
            { value: narrativeScore, weight: 0.3 },
            { value: culturalScore, weight: 0.3 }
        ]);

        return {
            overall,
            social: socialScore,
            narrative: narrativeScore,
            cultural: culturalScore
        };
    }

    /**
     * Évalue la qualité de l'adaptation par rapport à l'émotion originale
     * @param originalEmotion État émotionnel original
     * @param adaptedEmotion État émotionnel adapté
     * @returns Score de qualité de l'adaptation
     */
    public evaluateAdaptationQuality(
        originalEmotion: EmotionState,
        adaptedEmotion: EmotionState
    ): number {
        // Évaluer la préservation de l'essence émotionnelle
        const essencePreservation = this.evaluateEssencePreservation(originalEmotion, adaptedEmotion);

        // Évaluer la cohérence des modifications
        const modificationsCoherence = this.evaluateModificationsCoherence(originalEmotion, adaptedEmotion);

        // Évaluer la fluidité des transitions
        const transitionSmoothing = this.evaluateTransitionSmoothing(adaptedEmotion);

        // Calculer le score global (moyenne pondérée)
        return this.calculateWeightedAverage([
            { value: essencePreservation, weight: 0.5 },
            { value: modificationsCoherence, weight: 0.3 },
            { value: transitionSmoothing, weight: 0.2 }
        ]);
    }

    /**
     * Évalue l'authenticité culturelle d'une émotion adaptée
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Scores d'authenticité culturelle
     */
    public evaluateCulturalAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): AuthenticityScores {
        // Évaluer l'expressivité authentique
        const expressiveness = this.evaluateExpressivenessAuthenticity(emotion, context);

        // Évaluer la pertinence des expressions
        const appropriateness = this.evaluateAppropriatenessAuthenticity(emotion, context);

        // Évaluer la cohérence interne
        const coherence = this.evaluateCoherenceAuthenticity(emotion, context);

        // Calculer le score global (moyenne pondérée)
        const overall = this.calculateWeightedAverage([
            { value: expressiveness, weight: 0.4 },
            { value: appropriateness, weight: 0.4 },
            { value: coherence, weight: 0.2 }
        ]);

        return {
            overall,
            expressiveness,
            appropriateness,
            coherence
        };
    }

    /**
     * Évalue la pertinence sociale d'une émotion adaptée
     * @param emotion État émotionnel adapté
     * @param social Contexte social
     * @returns Score de pertinence sociale (0-1)
     */
    private evaluateSocialRelevance(
        emotion: EmotionState,
        social: SocialContext
    ): number {
        // Score de base
        let score = 0.8;

        // Ajustements en fonction du contexte
        if (social.setting === 'professional' && emotion.intensity > 0.7) {
            score -= 0.2; // Trop intense pour un contexte professionnel
        } else if (social.setting === 'intimate' && emotion.intensity < 0.6) {
            score -= 0.1; // Pas assez expressif pour un contexte intime
        }

        // Ajustements basés sur le niveau de formalité
        if (social.formalityLevel > 0.7) {
            // Contexte formel - vérifier la modération
            if (emotion.intensity > 0.7) {
                score -= 0.3; // Trop intense pour un contexte formel
            } else if (emotion.intensity < 0.3) {
                score += 0.1; // Bonne modération pour un contexte formel
            }
        } else if (social.formalityLevel < 0.3) {
            // Contexte informel - vérifier l'expressivité
            if (emotion.intensity < 0.5 && ['joy', 'surprise'].includes(emotion.type)) {
                score -= 0.2; // Pas assez expressif pour un contexte informel
            } else if (emotion.intensity > 0.6) {
                score += 0.1; // Bonne expressivité pour un contexte informel
            }
        }

        // Ajustements basés sur les dynamiques relationnelles
        if (social.relationshipDynamics) {
            const { intimacy } = social.relationshipDynamics;
            if (intimacy > 0.7 && emotion.components.facial.intensity < 0.5) {
                score -= 0.1; // Pas assez expressif facialément pour une relation intime
            } else if (intimacy < 0.3 && emotion.components.facial.intensity > 0.7) {
                score -= 0.1; // Trop expressif facialément pour une relation distante
            }
        }

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue la pertinence narrative d'une émotion adaptée
     * @param emotion État émotionnel adapté
     * @param narrative Contexte narratif
     * @returns Score de pertinence narrative (0-1)
     */
    private evaluateNarrativeRelevance(
        emotion: EmotionState,
        narrative: NarrativeContext
    ): number {
        // Score de base
        let score = 0.75;

        // Ajustements en fonction du type narratif
        if (narrative.type === 'dramatic') {
            if (['fear', 'anger', 'sadness'].includes(emotion.type)) {
                score += 0.15; // Émotions adaptées à un contexte dramatique
            } else if (emotion.type === 'joy' && emotion.intensity > 0.7) {
                score -= 0.2; // Joie intense peu adaptée à un contexte dramatique
            }
        } else if (narrative.type === 'comedic') {
            if (['joy', 'surprise'].includes(emotion.type)) {
                score += 0.15; // Émotions adaptées à un contexte comique
            } else if (['sadness', 'fear'].includes(emotion.type) && emotion.intensity > 0.6) {
                score -= 0.2; // Tristesse/peur intenses peu adaptées à un contexte comique
            }
        } else if (narrative.type === 'informative') {
            if (emotion.intensity > 0.7) {
                score -= 0.2; // Intensité trop élevée pour un contexte informatif
            } else if (emotion.intensity < 0.5) {
                score += 0.1; // Bonne modération pour un contexte informatif
            }
        }

        // Ajustements basés sur les éléments de l'histoire
        if (narrative.storyElements) {
            const { phase, intensity } = narrative.storyElements;
            if (phase === 'climax' && emotion.intensity < 0.6) {
                score -= 0.15; // Pas assez intense pour un moment culminant
            } else if (phase === 'resolution' && emotion.intensity > 0.8) {
                score -= 0.1; // Trop intense pour une résolution
            }
        }

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue la pertinence culturelle d'une émotion adaptée
     * @param emotion État émotionnel adapté
     * @param cultural Contexte culturel
     * @returns Score de pertinence culturelle (0-1)
     */
    private evaluateCulturalRelevance(
        emotion: EmotionState,
        cultural: ContextualInformation['cultural']
    ): number {
        // Score de base
        let score = 0.8;

        // Ajustements basés sur la région
        if (cultural.region === 'france') {
            if (emotion.components.facial.intensity < 0.5) {
                score -= 0.15; // Expression faciale insuffisante pour la région française
            } else if (emotion.components.facial.intensity > 0.7) {
                score += 0.1; // Bonne expressivité faciale pour la région française
            }
        } else if (cultural.region === 'academic') {
            if (emotion.intensity > 0.7) {
                score -= 0.2; // Trop intense pour un contexte académique
            } else if (emotion.intensity < 0.5) {
                score += 0.1; // Bonne modération pour un contexte académique
            }
        }

        // Ajustements basés sur le niveau de formalité culturelle
        if (cultural.formalityLevel > 0.7 && emotion.intensity > 0.7) {
            score -= 0.15; // Trop intense pour une culture formelle
        } else if (cultural.formalityLevel < 0.3 && emotion.intensity < 0.5) {
            score -= 0.1; // Pas assez expressif pour une culture informelle
        }

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue la préservation de l'essence émotionnelle
     * @param originalEmotion État émotionnel original
     * @param adaptedEmotion État émotionnel adapté
     * @returns Score de préservation de l'essence (0-1)
     */
    private evaluateEssencePreservation(
        originalEmotion: EmotionState,
        adaptedEmotion: EmotionState
    ): number {
        // Vérifier si le type émotionnel est préservé
        const typePreserved = originalEmotion.type === adaptedEmotion.type;

        // Calculer la différence d'intensité
        const intensityDifference = Math.abs(originalEmotion.intensity - adaptedEmotion.intensity);

        // Calculer la différence dans les composantes
        const facialDifference = this.calculateComponentDifference(
            originalEmotion.components.facial,
            adaptedEmotion.components.facial
        );

        const gesturalDifference = this.calculateComponentDifference(
            originalEmotion.components.gestural,
            adaptedEmotion.components.gestural
        );

        // Score de base selon la préservation du type
        let score = typePreserved ? 0.9 : 0.4;

        // Ajustements basés sur les différences
        score -= intensityDifference * 0.5; // Pénalité pour les différences d'intensité
        score -= facialDifference * 0.3; // Pénalité pour les différences faciales
        score -= gesturalDifference * 0.3; // Pénalité pour les différences gestuelles

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Calcule la différence entre deux composantes
     * @param originalComponent Composante originale
     * @param adaptedComponent Composante adaptée
     * @returns Score de différence (0-1)
     */
    private calculateComponentDifference(
        originalComponent: EmotionalComponent,
        adaptedComponent: EmotionalComponent
    ): number {
        // Calcul de la différence d'intensité si présente
        if (typeof originalComponent.intensity === 'number' &&
            typeof adaptedComponent.intensity === 'number') {
            return Math.abs(
                originalComponent.intensity - adaptedComponent.intensity
            );
        }

        // Si pas d'intensité, retourner une différence modérée
        return 0.3;
    }

    /**
     * Évalue la cohérence des modifications apportées à l'émotion
     * @param originalEmotion État émotionnel original
     * @param adaptedEmotion État émotionnel adapté
     * @returns Score de cohérence des modifications (0-1)
     */
    private evaluateModificationsCoherence(
        originalEmotion: EmotionState,
        adaptedEmotion: EmotionState
    ): number {
        // Comparer les ratios d'intensité entre les différentes composantes
        const originalFacialToGesturalRatio = originalEmotion.components.facial.intensity /
            originalEmotion.components.gestural.intensity;

        const adaptedFacialToGesturalRatio = adaptedEmotion.components.facial.intensity /
            adaptedEmotion.components.gestural.intensity;

        // Calculer la différence des ratios
        const ratioDifference = Math.abs(originalFacialToGesturalRatio - adaptedFacialToGesturalRatio);

        // Calculer la cohérence des dynamiques
        const dynamicsCoherence = this.evaluateDynamicsCoherence(originalEmotion.dynamics, adaptedEmotion.dynamics);

        // Score de base
        let score = 0.9;

        // Ajustements basés sur les différences
        score -= ratioDifference * 0.6; // Pénalité pour les différences de ratio
        score -= (1 - dynamicsCoherence) * 0.4; // Pénalité pour les incohérences dynamiques

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue la cohérence des dynamiques
     * @param originalDynamics Dynamiques originales
     * @param adaptedDynamics Dynamiques adaptées
     * @returns Score de cohérence des dynamiques (0-1)
     */
    private evaluateDynamicsCoherence(
        originalDynamics: EmotionDynamics,
        adaptedDynamics: EmotionDynamics
    ): number {
        // Calculer la différence relative de durée
        const durationRatio = originalDynamics.duration > 0 ?
            adaptedDynamics.duration / originalDynamics.duration : 1;

        // Pénaliser les changements de durée trop importants
        let score = 1.0;
        if (durationRatio < 0.5 || durationRatio > 2.0) {
            score -= 0.3;
        } else if (durationRatio < 0.7 || durationRatio > 1.5) {
            score -= 0.1;
        }

        // Pénaliser les changements de type de transition
        if (originalDynamics.transition !== adaptedDynamics.transition) {
            score -= 0.2;
        }

        // Pénaliser les modifications importantes dans la séquence
        const sequenceDifference = this.calculateSequenceDifference(
            originalDynamics.sequence,
            adaptedDynamics.sequence
        );

        score -= sequenceDifference * 0.3;

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Calcule la différence entre deux séquences
     * @param originalSequence Séquence originale
     * @param adaptedSequence Séquence adaptée
     * @returns Score de différence (0-1)
     */
    private calculateSequenceDifference(
        originalSequence: string[],
        adaptedSequence: string[]
    ): number {
        if (!originalSequence || !adaptedSequence ||
            originalSequence.length === 0 || adaptedSequence.length === 0) {
            return 0.5; // Différence moyenne par défaut
        }

        // Calculer le nombre d'éléments différents
        const originalSet = new Set(originalSequence);
        const adaptedSet = new Set(adaptedSequence);

        const differentItems = [...originalSet].filter(item => !adaptedSet.has(item)).length +
            [...adaptedSet].filter(item => !originalSet.has(item)).length;

        // Normaliser la différence
        const maxPossibleDifference = originalSet.size + adaptedSet.size;

        return maxPossibleDifference > 0 ?
            differentItems / maxPossibleDifference : 0;
    }

    /**
     * Évalue la fluidité des transitions dans l'émotion adaptée
     * @param emotion État émotionnel adapté
     * @returns Score de fluidité des transitions (0-1)
     */
    private evaluateTransitionSmoothing(emotion: EmotionState): number {
        // Vérifier le type de transition
        let score = 0.7; // Score de base

        if (emotion.dynamics.transition === 'smooth' ||
            emotion.dynamics.transition === 'gradual') {
            score += 0.2; // Bonus pour les transitions douces
        } else if (emotion.dynamics.transition === 'abrupt') {
            score -= 0.2; // Pénalité pour les transitions abruptes
        }

        // Vérifier la cohérence de la séquence
        if (emotion.dynamics.sequence && emotion.dynamics.sequence.length > 1) {
            score += 0.1; // Bonus pour une séquence définie
        }

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue l'authenticité de l'expressivité
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Score d'authenticité de l'expressivité (0-1)
     */
    private evaluateExpressivenessAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): number {
        // Score de base basé sur l'authenticité culturelle
        let score = 0.8;

        // Ajustements basés sur la région culturelle
        if (context.cultural.region === 'france') {
            if (emotion.components.facial.intensity > 0.7) {
                score += 0.1; // Bonus pour l'expressivité faciale en contexte français
            } else if (emotion.components.facial.intensity < 0.5) {
                score -= 0.1; // Pénalité pour le manque d'expressivité faciale
            }
        } else if (context.cultural.region === 'academic') {
            if (emotion.intensity < 0.6) {
                score += 0.1; // Bonus pour la modération en contexte académique
            } else if (emotion.intensity > 0.7) {
                score -= 0.15; // Pénalité pour l'excès d'expressivité
            }
        }

        // Ajustements basés sur le contexte social
        if (context.social.setting === 'intimate' && emotion.intensity > 0.7) {
            score += 0.1; // Bonus pour l'expressivité en contexte intime
        } else if (context.social.setting === 'professional' && emotion.intensity < 0.6) {
            score += 0.1; // Bonus pour la modération en contexte professionnel
        }

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue l'authenticité de la pertinence
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Score d'authenticité de pertinence (0-1)
     */
    private evaluateAppropriatenessAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): number {
        // Score de base
        let score = 0.85;

        // Ajustements basés sur le type narratif
        if (context.narrative.type === 'dramatic') {
            if (['sadness', 'fear', 'anger'].includes(emotion.type)) {
                score += 0.1; // Bonus pour les émotions appropriées
            } else if (['joy'].includes(emotion.type) && emotion.intensity > 0.7) {
                score -= 0.15; // Pénalité pour les émotions inappropriées
            }
        } else if (context.narrative.type === 'comedic') {
            if (['joy', 'surprise'].includes(emotion.type)) {
                score += 0.1; // Bonus pour les émotions appropriées
            } else if (['sadness', 'fear'].includes(emotion.type) && emotion.intensity > 0.6) {
                score -= 0.15; // Pénalité pour les émotions inappropriées
            }
        }

        // Ajustements basés sur le niveau de formalité
        if (context.cultural.formalityLevel > 0.7 && emotion.intensity > 0.7) {
            score -= 0.15; // Pénalité pour l'excès d'expressivité en contexte formel
        } else if (context.cultural.formalityLevel < 0.3 && emotion.intensity < 0.5) {
            score -= 0.1; // Pénalité pour le manque d'expressivité en contexte informel
        }

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue l'authenticité de la cohérence
     * @param emotion État émotionnel adapté
     * @param context Informations contextuelles
     * @returns Score d'authenticité de cohérence (0-1)
     */
    private evaluateCoherenceAuthenticity(
        emotion: EmotionState,
        context: ContextualInformation
    ): number {
        // Score de base
        let score = 0.8;

        // Évaluer la cohérence entre les composantes
        const componentsCoherence = this.evaluateComponentsIntensityCoherence(emotion);

        // Évaluer la cohérence avec le contexte temporel
        const temporalCoherence = this.evaluateTemporalCoherence(emotion, context.temporal);

        // Ajuster le score en fonction des évaluations spécifiques
        score = (score + componentsCoherence + temporalCoherence) / 3;

        return Math.min(1, Math.max(0, score));
    }

    /**
     * Évalue la cohérence d'intensité entre les composantes
     * @param emotion État émotionnel
     * @returns Score de cohérence (0-1)
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

        // Calculer le score basé sur les différences
        const maxDifference = Math.max(facialGesturalDiff, facialGlobalDiff, gesturalGlobalDiff);

        // Une différence de 0.3 ou plus est considérée comme incohérente
        return Math.max(0, 1 - (maxDifference / 0.3));
    }

    /**
     * Évalue la cohérence temporelle
     * @param emotion État émotionnel
     * @param temporal Contexte temporel
     * @returns Score de cohérence (0-1)
     */
    private evaluateTemporalCoherence(
        emotion: EmotionState,
        temporal: ContextualInformation['temporal']
    ): number {
        // Évaluer si la durée de l'émotion est cohérente avec le contexte temporel
        const emotionDuration = emotion.dynamics.duration;
        const contextDuration = temporal.duration;

        // Calculer la différence relative (normalisée)
        const relativeDifference = contextDuration > 0 ?
            Math.abs(emotionDuration - contextDuration) / contextDuration : 0.5;

        // Une différence relative de 0.5 ou plus est considérée comme incohérente
        return Math.max(0, 1 - relativeDifference);
    }

    /**
     * Calcule une moyenne pondérée
     * @param values Tableau d'objets avec valeurs et poids
     * @returns Moyenne pondérée
     */
    private calculateWeightedAverage(values: Array<{ value: number, weight: number }>): number {
        if (values.length === 0) {
            return 0;
        }

        let sum = 0;
        let weightSum = 0;

        for (const { value, weight } of values) {
            sum += value * weight;
            weightSum += weight;
        }

        return weightSum > 0 ? sum / weightSum : 0;
    }
}