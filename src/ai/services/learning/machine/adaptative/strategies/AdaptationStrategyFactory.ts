// src/ai/learning/adapters/strategies/AdaptationStrategyFactory.ts

import { IAdaptationStrategy } from './AdaptationStrategy';
import { DifficultyStrategy } from './DifficultyStrategy';
import { PaceStrategy } from './PaceStrategy';
import { AssistanceStrategy } from './AssistanceStrategy';
import { ContentStrategy } from './ContentStrategy';

/**
 * Factory pour la création de stratégies d'adaptation
 */
export class AdaptationStrategyFactory {
    /**
     * Crée et retourne toutes les stratégies d'adaptation disponibles
     */
    public static createDefaultStrategies(): Map<string, IAdaptationStrategy> {
        const strategies = new Map<string, IAdaptationStrategy>();

        // Créer les stratégies standard
        strategies.set('difficulty', new DifficultyStrategy());
        strategies.set('pace', new PaceStrategy());
        strategies.set('assistance', new AssistanceStrategy());
        strategies.set('content', new ContentStrategy());

        return strategies;
    }

    /**
     * Crée et retourne une stratégie d'adaptation spécifique
     * 
     * @param type Type de stratégie à créer
     * @returns Stratégie d'adaptation ou undefined si non prise en charge
     */
    public static createStrategy(type: string): IAdaptationStrategy | undefined {
        switch (type) {
            case 'difficulty':
                return new DifficultyStrategy();
            case 'pace':
                return new PaceStrategy();
            case 'assistance':
                return new AssistanceStrategy();
            case 'content':
                return new ContentStrategy();
            default:
                return undefined;
        }
    }
}