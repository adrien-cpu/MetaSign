// src/ai/learning/adapters/strategies/AdaptationStrategySelector.ts

import { IAdaptationStrategy } from './AdaptationStrategy';

/**
 * Service responsable de la sélection des stratégies d'adaptation appropriées
 */
export class AdaptationStrategySelector {
    private readonly ENGAGEMENT_LOW_THRESHOLD = 0.4;
    private readonly ENGAGEMENT_HIGH_THRESHOLD = 0.7;
    private readonly FRUSTRATION_CONCERN_THRESHOLD = 0.5;

    /**
     * Détermine les stratégies d'adaptation applicables en fonction des prédictions
     * 
     * @param strategies Toutes les stratégies disponibles
     * @param engagement Niveau d'engagement prédit
     * @param frustration Niveau de frustration prédit
     * @returns Stratégies applicables
     */
    public selectStrategies(
        strategies: Map<string, IAdaptationStrategy>,
        engagement: number,
        frustration: number
    ): IAdaptationStrategy[] {
        // Filtrer les stratégies applicables selon les prédictions
        const applicableStrategies: IAdaptationStrategy[] = [];

        for (const strategy of strategies.values()) {
            if (this.isDefaultStrategy(strategy) || strategy.isApplicable(engagement, frustration)) {
                applicableStrategies.push(strategy);
            }
        }

        // S'assurer qu'au moins une stratégie est sélectionnée
        if (applicableStrategies.length === 0 && strategies.size > 0) {
            // Prendre la première stratégie disponible comme fallback
            const fallbackStrategy = strategies.values().next().value;
            if (fallbackStrategy) {
                applicableStrategies.push(fallbackStrategy);
            }
        }

        return applicableStrategies;
    }

    /**
     * Détermine les types d'adaptation nécessaires basés sur les prédictions
     * Version alternative si les stratégies ne sont pas disponibles directement
     * 
     * @param engagement Niveau d'engagement prédit
     * @param frustration Niveau de frustration prédit
     * @returns Types de stratégies d'adaptation
     */
    public selectStrategyTypes(
        engagement: number,
        frustration: number
    ): string[] {
        const strategyTypes: string[] = [];

        // Toujours considérer l'adaptation de contenu pour la personnalisation
        strategyTypes.push('content');

        // Adaptation de la difficulté basée sur l'engagement et la frustration
        if (
            engagement < this.ENGAGEMENT_LOW_THRESHOLD ||
            frustration > this.FRUSTRATION_CONCERN_THRESHOLD
        ) {
            strategyTypes.push('difficulty');
        }

        // Adaptation du rythme si engagement faible ou très élevé
        if (
            engagement < this.ENGAGEMENT_LOW_THRESHOLD ||
            engagement > this.ENGAGEMENT_HIGH_THRESHOLD
        ) {
            strategyTypes.push('pace');
        }

        // Assistance si frustration élevée
        if (frustration > this.FRUSTRATION_CONCERN_THRESHOLD) {
            strategyTypes.push('assistance');
        }

        // Déduplications et retour des types uniques
        return [...new Set(strategyTypes)];
    }

    /**
     * Détermine si une stratégie est considérée comme par défaut (toujours applicable)
     * 
     * @param strategy Stratégie à vérifier
     * @returns Vrai si c'est une stratégie par défaut
     */
    private isDefaultStrategy(strategy: IAdaptationStrategy): boolean {
        // Les stratégies de contenu sont toujours considérées comme applicables
        return strategy.type === 'content';
    }
}