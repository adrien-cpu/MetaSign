/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/strategies/index.ts
 * @description Export centralisé de toutes les stratégies de transformation d'espace syntaxique
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

// Import des types depuis les bons chemins
import type { SpaceTransformationContext } from '../types/SpaceTransformationTypes';
import type { ExtendedLSFSpaceParameter } from '../types/ExtendedLSFTypes';

// Import des stratégies - on importe d'abord puis on exporte
import { ReferenceTransformationStrategy } from './ReferenceTransformationStrategy';
import { ScaleTransformationStrategy } from './ScaleTransformationStrategy';
import { PlacementTransformationStrategy } from './PlacementTransformationStrategy';
import { LocationTransformationStrategy } from './LocationTransformationStrategy';

// Re-export des stratégies
export { ReferenceTransformationStrategy };
export { ScaleTransformationStrategy };
export { PlacementTransformationStrategy };
export { LocationTransformationStrategy };

// Re-export des types pour l'utilisation externe
export type { SpaceTransformationContext, ExtendedLSFSpaceParameter };

/**
 * Interface commune pour toutes les stratégies de transformation d'espace
 */
export interface ISpaceTransformationStrategy {
    apply(space: ExtendedLSFSpaceParameter, context: SpaceTransformationContext): void;
    validate(space: ExtendedLSFSpaceParameter): boolean;
    getImpactScore(): number;
}

/**
 * Types d'énumération pour les stratégies
 */
export enum StrategyType {
    REFERENCE_VIOLATION = 'REFERENCE_VIOLATION',
    REDUCED_SPACE = 'REDUCED_SPACE',
    RANDOM_PLACEMENT = 'RANDOM_PLACEMENT',
    LOCATION_OMISSION = 'LOCATION_OMISSION',
    ZONE_CONFUSION = 'ZONE_CONFUSION'
}

/**
 * Factory helper pour créer des stratégies
 */
export class StrategyFactory {
    /**
     * Crée une stratégie selon le type demandé
     * @param type Type de stratégie à créer
     * @returns Instance de la stratégie ou null si le type n'est pas supporté
     */
    public static createStrategy(type: StrategyType): ISpaceTransformationStrategy | null {
        switch (type) {
            case StrategyType.REFERENCE_VIOLATION:
                return new ReferenceTransformationStrategy();

            case StrategyType.REDUCED_SPACE:
                return new ScaleTransformationStrategy();

            case StrategyType.RANDOM_PLACEMENT:
                return new PlacementTransformationStrategy();

            case StrategyType.LOCATION_OMISSION:
                return new LocationTransformationStrategy();

            case StrategyType.ZONE_CONFUSION:
                // Pour l'instant, on retourne null car ZoneTransformationStrategy n'existe pas encore
                // TODO: Implémenter ZoneTransformationStrategy
                return null;

            default:
                return null;
        }
    }

    /**
     * Obtient la liste des types de stratégies disponibles
     * @returns Liste des types de stratégies
     */
    public static getAvailableStrategyTypes(): StrategyType[] {
        return Object.values(StrategyType);
    }

    /**
     * Vérifie si un type de stratégie est supporté
     * @param type Type à vérifier
     * @returns true si le type est supporté
     */
    public static isStrategyTypeSupported(type: string): type is StrategyType {
        return Object.values(StrategyType).includes(type as StrategyType);
    }

    /**
     * Obtient la liste des stratégies réellement disponibles (excluant celles qui retournent null)
     * @returns Liste des types de stratégies disponibles
     */
    public static getImplementedStrategyTypes(): StrategyType[] {
        return [
            StrategyType.REFERENCE_VIOLATION,
            StrategyType.REDUCED_SPACE,
            StrategyType.RANDOM_PLACEMENT,
            StrategyType.LOCATION_OMISSION
            // ZONE_CONFUSION sera ajouté quand ZoneTransformationStrategy sera implémentée
        ];
    }
}