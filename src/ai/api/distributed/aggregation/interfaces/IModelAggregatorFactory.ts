/**
 * src/ai/api/distributed/aggregation/interfaces/IModelAggregatorFactory.ts
 * Interface pour la factory d'agrégateur de modèles
 */
import { ModelAggregator } from '../ModelAggregator';
import { OptimizedModelAggregator } from '../OptimizedModelAggregator';
import { ModelAggregatorConfig } from '../ModelAggregatorFactory';

/**
 * Interface définissant la factory pour les agrégateurs de modèles
 */
export interface IModelAggregatorFactory {
    /**
     * Crée un agrégateur de modèle en fonction de la configuration
     * 
     * @param config - Configuration de l'agrégateur
     * @returns Agrégateur de modèle standard ou optimisé
     */
    createAggregator(config: ModelAggregatorConfig): ModelAggregator | OptimizedModelAggregator;

    /**
     * Crée un agrégateur de modèle par défaut avec les paramètres recommandés
     * 
     * @returns Agrégateur de modèle avec configuration par défaut
     */
    createDefaultAggregator(): ModelAggregator | OptimizedModelAggregator;

    /**
     * Crée un agrégateur de modèle léger pour les environnements contraints
     * 
     * @returns Agrégateur de modèle standard léger
     */
    createLightweightAggregator(): ModelAggregator;
}