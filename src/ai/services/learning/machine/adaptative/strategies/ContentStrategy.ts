// src/ai/learning/adapters/strategies/ContentStrategy.ts

import { LearningContext, UserProfile, LearningStyle } from '@ai/learning/types';
import { Adaptation } from '@ai/learning/types/AdaptedContent';
import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie d'adaptation qui gère la personnalisation du contenu
 */
export class ContentStrategy extends BaseAdaptationStrategy {
    constructor() {
        super('content');
    }

    /**
     * Cette stratégie est toujours applicable
     */
    isApplicable(_engagement: number, _frustration: number): boolean {
        return true;
    }

    /**
     * Applique la stratégie d'adaptation de contenu
     */
    apply(_context: LearningContext, profile?: UserProfile): Adaptation {
        if (!profile) {
            // Si pas de profil fourni, retourner une adaptation par défaut
            return {
                type: this.type,
                description: "Contenu standard",
                appliedElements: ["content"],
                reason: "Pas de profil utilisateur disponible",
                action: 'personalize',
                intensity: 0.5,
                explanation: "Contenu standard sans personnalisation",
                overridable: true
            };
        }

        // Déterminer le style d'apprentissage
        const learningStyle = this.determineLearningStyle(profile);

        // Les intérêts de l'utilisateur (si disponibles)
        const userInterests = profile.interests ?? [];

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(_context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: `Contenu adapté à votre style d'apprentissage ${learningStyle}`,
            appliedElements: ["content", learningStyle, ...userInterests],
            reason: `Adaptation au style d'apprentissage ${learningStyle}`,
            action: 'personalize',
            intensity,
            explanation: `Le contenu est personnalisé pour correspondre à votre style d'apprentissage ${learningStyle}` +
                (userInterests.length > 0 ? ` et à vos intérêts: ${userInterests.join(', ')}` : ''),
            overridable: true,
            metadata: {
                learningStyle
            }
        };
    }

    /**
     * Calcule l'intensité spécifique pour l'adaptation de contenu
     */
    protected override calculateIntensity(_context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;

        // L'intensité de personnalisation du contenu dépend fortement du niveau d'adaptativité souhaité
        const contextFactor = 1.0 + (adaptivityLevel * 0.4);

        // L'intensité finale
        const finalIntensity = baseIntensity * contextFactor * (0.5 + adaptivityLevel);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine le style d'apprentissage à partir du profil
     */
    private determineLearningStyle(profile: UserProfile): string {
        // D'abord, vérifier dans learningPreferences.preferredLearningStyle
        if (profile.learningPreferences?.preferredLearningStyle) {
            const style = profile.learningPreferences.preferredLearningStyle;
            if (typeof style === 'string') {
                return style;
            }

            if (style === LearningStyle.VISUAL) return "visual";
            if (style === LearningStyle.AUDITORY) return "auditory";
            if (style === LearningStyle.READING_WRITING) return "reading";
            if (style === LearningStyle.KINESTHETIC) return "kinesthetic";
        }

        // Ensuite, vérifier dans preferences.learningStyle
        if (profile.preferences?.learningStyle) {
            return profile.preferences.learningStyle;
        }

        // Valeur par défaut
        return "visual";
    }
}