// src/ai/learning/adapters/strategies/PaceStrategy.ts

import { LearningContext, UserProfile } from '@ai/learning/types';
import { Adaptation, AdaptationAction } from '@ai/learning/types/AdaptedContent';
import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie d'adaptation qui gère les ajustements de rythme
 */
export class PaceStrategy extends BaseAdaptationStrategy {
    private readonly EXHAUSTION_THRESHOLD = 0.6;
    private readonly ENGAGEMENT_HIGH_THRESHOLD = 0.7;
    private readonly ENGAGEMENT_LOW_THRESHOLD = 0.4;

    constructor() {
        super('pace');
    }

    /**
     * Détermine si cette stratégie est applicable dans le contexte actuel
     */
    isApplicable(engagement: number, _frustration: number): boolean {
        // Applicable si engagement trop faible ou très élevé
        return engagement < this.ENGAGEMENT_LOW_THRESHOLD ||
            engagement > this.ENGAGEMENT_HIGH_THRESHOLD;
    }

    /**
     * Applique la stratégie d'adaptation du rythme
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation {
        const engagementLevel = context.currentEngagement ?? 0.5;
        const exhaustionLevel = context.exhaustionIndicators ?? 0;

        // Déterminer l'action d'adaptation
        const action = this.determineAction(engagementLevel, exhaustionLevel);

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: this.getDescription(action),
            appliedElements: ["pace", "timing"],
            reason: this.getReason(action, engagementLevel, exhaustionLevel),
            action,
            intensity,
            explanation: this.getDescription(action),
            overridable: true
        };
    }

    /**
     * Calcule l'intensité spécifique pour l'adaptation de rythme
     */
    protected override calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;

        const engagement = context.currentEngagement ?? 0.5;
        const exhaustion = context.exhaustionIndicators ?? 0;

        const contextFactor = 1.0 + (engagement * 0.3) - (exhaustion * 0.7);

        // L'intensité finale est modulée par le niveau d'adaptativité souhaité
        const finalIntensity = baseIntensity * contextFactor * (0.5 + adaptivityLevel);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine l'action de rythme appropriée
     */
    private determineAction(engagementLevel: number, exhaustionLevel: number): AdaptationAction {
        // Ralentir si signes de fatigue
        if (exhaustionLevel > this.EXHAUSTION_THRESHOLD) {
            return 'decrease';
        }

        // Accélérer si engagement élevé et pas de fatigue
        if (engagementLevel > this.ENGAGEMENT_HIGH_THRESHOLD && exhaustionLevel < this.EXHAUSTION_THRESHOLD / 2) {
            return 'increase';
        }

        // Maintenir le rythme par défaut
        return 'maintain';
    }

    /**
     * Génère une description adaptée à l'action
     */
    private getDescription(action: AdaptationAction): string {
        switch (action) {
            case 'increase':
                return "Accélération légère du rythme basée sur votre bon niveau d'engagement";
            case 'decrease':
                return "Ralentissement du rythme pour éviter la fatigue cognitive";
            case 'maintain':
            default:
                return "Maintien du rythme d'apprentissage actuel";
        }
    }

    /**
     * Génère une raison adaptée à l'action
     */
    private getReason(action: AdaptationAction, _engagement: number, exhaustion: number): string {
        switch (action) {
            case 'increase':
                return "Haut niveau d'engagement détecté";
            case 'decrease':
                return exhaustion > this.EXHAUSTION_THRESHOLD
                    ? "Signes de fatigue détectés"
                    : "Optimisation du rythme d'apprentissage";
            case 'maintain':
            default:
                return "Rythme actuel approprié";
        }
    }
}