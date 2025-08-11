// src/ai/learning/adapters/strategies/DifficultyStrategy.ts

import { LearningContext, UserProfile } from '@ai/learning/types';
import { Adaptation, AdaptationAction } from '@ai/learning/types/AdaptedContent';
import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie d'adaptation qui gère les ajustements de difficulté
 */
export class DifficultyStrategy extends BaseAdaptationStrategy {
    private readonly FRUSTRATION_THRESHOLD = 0.6;
    private readonly PERFORMANCE_IMPROVEMENT_THRESHOLD = 0.2;
    private readonly PERFORMANCE_DECLINE_THRESHOLD = -0.1;
    private readonly ENGAGEMENT_LOW_THRESHOLD = 0.4;

    constructor() {
        super('difficulty');
    }

    /**
     * Détermine si cette stratégie est applicable dans le contexte actuel
     */
    isApplicable(engagement: number, frustration: number): boolean {
        return engagement < this.ENGAGEMENT_LOW_THRESHOLD || frustration > this.FRUSTRATION_THRESHOLD;
    }

    /**
     * Applique la stratégie d'adaptation de difficulté
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation {
        // Déterminer si on doit augmenter ou diminuer la difficulté
        const performanceTrend = context.performanceTrend ?? 0;
        const frustrationLevel = context.currentFrustration ?? 0;

        // Déterminer l'action d'adaptation
        const action = this.determineAction(performanceTrend, frustrationLevel);

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: this.getDescription(action),
            appliedElements: ["difficulty", "challenge_level"],
            reason: this.getReason(action, performanceTrend, frustrationLevel),
            action,
            intensity,
            explanation: this.getDescription(action),
            overridable: true
        };
    }

    /**
     * Calcule l'intensité spécifique pour l'adaptation de difficulté
     */
    protected override calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;

        const performanceTrend = context.performanceTrend ?? 0;
        const frustration = context.currentFrustration ?? 0;

        const contextFactor = 1.0 + (performanceTrend * 0.5) - (frustration * 0.5);

        // L'intensité finale est modulée par le niveau d'adaptativité souhaité
        const finalIntensity = baseIntensity * contextFactor * (0.5 + adaptivityLevel);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine l'action de difficulté appropriée
     */
    private determineAction(performanceTrend: number, frustrationLevel: number): AdaptationAction {
        // Si bonnes performances et frustration faible, augmenter la difficulté
        if (performanceTrend > this.PERFORMANCE_IMPROVEMENT_THRESHOLD &&
            frustrationLevel < this.FRUSTRATION_THRESHOLD / 2) {
            return 'increase';
        }

        // Si performances faibles ou frustration élevée, diminuer la difficulté
        if (performanceTrend < this.PERFORMANCE_DECLINE_THRESHOLD ||
            frustrationLevel > this.FRUSTRATION_THRESHOLD) {
            return 'decrease';
        }

        // Maintenir la difficulté actuelle par défaut
        return 'maintain';
    }

    /**
     * Génère une description adaptée à l'action
     */
    private getDescription(action: AdaptationAction): string {
        switch (action) {
            case 'increase':
                return "Augmentation légère de la difficulté basée sur vos bonnes performances";
            case 'decrease':
                return "Réduction de la difficulté pour vous aider à progresser plus confortablement";
            case 'maintain':
            default:
                return "Maintien du niveau de difficulté actuel";
        }
    }

    /**
     * Génère une raison adaptée à l'action
     */
    private getReason(action: AdaptationAction, _performance: number, frustration: number): string {
        switch (action) {
            case 'increase':
                return "Bon niveau de performance détecté";
            case 'decrease':
                return frustration > this.FRUSTRATION_THRESHOLD
                    ? "Signes de frustration détectés"
                    : "Difficultés d'apprentissage détectées";
            case 'maintain':
            default:
                return "Niveau actuel approprié";
        }
    }
}