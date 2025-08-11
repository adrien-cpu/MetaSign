/**
 * src/ai/api/distributed/fusion/interfaces/IFusionManager.ts
 * Interface pour le gestionnaire de fusion
 */
import {
    FusionStrategy,
    FusionOptions,
    EnhancedProcessingResult,
    EnhancedDistributedResult
} from '../types/fusion.types';

/**
 * Interface définissant les fonctionnalités du gestionnaire de fusion
 */
export interface IFusionManager {
    /**
     * Fusionne les résultats distribués en un résultat unique
     * @param results - Résultats à fusionner
     * @param options - Options de fusion
     * @returns Résultat fusionné
     */
    fuseResults(
        results: EnhancedProcessingResult[],
        options?: FusionOptions
    ): Promise<EnhancedDistributedResult>;

    /**
     * Enregistre une stratégie de fusion personnalisée
     * @param name - Nom de la stratégie
     * @param strategy - Fonction de stratégie de fusion
     */
    registerStrategy(name: string, strategy: FusionStrategy): void;

    /**
     * Obtient une stratégie de fusion par son nom
     * @param name - Nom de la stratégie
     * @returns Stratégie de fusion
     */
    getStrategy(name: string): FusionStrategy;
}