// src/ai/learning/adapters/strategies/AssistanceStrategy.ts

import { LearningContext, UserProfile } from '@ai/learning/types';
import { Adaptation } from '@ai/learning/types/AdaptedContent';
import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie d'adaptation qui gère les niveaux d'assistance
 */
export class AssistanceStrategy extends BaseAdaptationStrategy {
    private readonly FRUSTRATION_THRESHOLD = 0.5;
    private readonly ERROR_RATE_THRESHOLD = 0.4;

    constructor() {
        super('assistance');
    }

    /**
     * Détermine si cette stratégie est applicable dans le contexte actuel
     */
    isApplicable(_engagement: number, frustration: number): boolean {
        return frustration > this.FRUSTRATION_THRESHOLD;
    }

    /**
     * Applique la stratégie d'adaptation d'assistance
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation {
        const frustrationLevel = context.currentFrustration ?? 0;
        const errorRate = context.errorRate ?? 0;

        // Déterminer si on doit fournir une assistance proactive
        const needsProactiveAssistance = frustrationLevel > this.FRUSTRATION_THRESHOLD || errorRate > this.ERROR_RATE_THRESHOLD;

        // Déterminer les éléments appliqués
        const appliedElements = needsProactiveAssistance
            ? ["assistance", errorRate > this.ERROR_RATE_THRESHOLD ? "examples" : "guidance"]
            : ["minimal_assistance"];

        // Déterminer la raison
        const reason = this.determineReason(frustrationLevel, errorRate);

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: needsProactiveAssistance
                ? "Aide supplémentaire proposée pour faciliter votre progression"
                : "Aide minimale disponible si nécessaire",
            appliedElements,
            reason,
            action: 'provide',
            intensity,
            explanation: needsProactiveAssistance
                ? "Une assistance adaptée est proposée pour vous aider à surmonter les difficultés détectées"
                : "Une assistance de base est disponible sur demande",
            overridable: true
        };
    }

    /**
     * Calcule l'intensité spécifique pour l'adaptation d'assistance
     */
    protected override calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;
        const assistanceLevel = profile?.preferences?.assistanceLevel ?? 0.5;

        const errorRate = context.errorRate ?? 0;
        const frustration = context.currentFrustration ?? 0;

        // L'intensité augmente avec le taux d'erreur et la frustration
        const contextFactor = 1.0 + (errorRate * 0.8) + (frustration * 0.5);

        // L'intensité finale est modulée par le niveau d'adaptativité et d'assistance souhaités
        const finalIntensity = baseIntensity * contextFactor * (0.3 + assistanceLevel * 0.7) * (0.5 + adaptivityLevel * 0.5);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine la raison appropriée
     */
    private determineReason(frustrationLevel: number, errorRate: number): string {
        if (frustrationLevel > this.FRUSTRATION_THRESHOLD) {
            return "Signes de frustration détectés";
        }

        if (errorRate > this.ERROR_RATE_THRESHOLD) {
            return "Taux d'erreur élevé";
        }

        return "Niveau d'assistance standard";
    }
}