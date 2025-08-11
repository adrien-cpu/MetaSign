/**
 * src/ai/api/distributed/aggregation/aggregators/ParameterAggregator.ts
 * 
 * Agrégateur de paramètres de modèle optimisé pour différentes stratégies d'agrégation
 */

import { Logger } from '@api/common/monitoring/LogService';
import { NodeTrainingResult, ModelParameters } from '../../types/DistributedTypes';
import { AggregationStrategy } from '../types/aggregation.types';

/**
 * Responsable de l'agrégation des paramètres de modèle selon différentes stratégies
 */
export class ParameterAggregator {
    private readonly logger: Logger;

    /**
     * Crée un nouvel agrégateur de paramètres
     * 
     * @param logger - Logger pour les messages de journalisation
     */
    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Agrège les paramètres du modèle utilisant différentes stratégies
     * 
     * @param results - Résultats d'entraînement des nœuds
     * @param weights - Poids de contribution des nœuds
     * @param strategy - Stratégie d'agrégation à utiliser
     * @returns Paramètres de modèle agrégés
     */
    public aggregateParameters(
        results: NodeTrainingResult[],
        weights: Map<string, number>,
        strategy: AggregationStrategy
    ): ModelParameters {
        // Initialiser les paramètres à partir de la structure du premier modèle
        const aggregated = this.initializeParameters(results[0]);

        // Appliquer la stratégie pour chaque résultat
        results.forEach(result => {
            const weight = weights.get(result.nodeId) ?? 0;
            if (weight > 0) {
                this.applyWeightedSum(aggregated, result.parameters, weight, strategy);
            }
        });

        return aggregated;
    }

    /**
     * Initialise la structure des paramètres à partir d'un résultat
     */
    private initializeParameters(result: NodeTrainingResult): ModelParameters {
        const hyperparams = result.parameters.hyperparameters
            ? { ...result.parameters.hyperparameters }
            : {};

        return {
            weights: this.initializeZeroWeights(result.parameters.weights),
            biases: this.initializeZeroBiases(result.parameters.biases),
            hyperparameters: hyperparams,
            shape: result.parameters.shape,
            version: result.parameters.version
        };
    }

    /**
     * Initialise les poids avec des zéros tout en préservant la structure
     */
    private initializeZeroWeights(weights: Record<string, number[]>): Record<string, number[]> {
        const result: Record<string, number[]> = {};

        for (const layer in weights) {
            // Utiliser des typed arrays pour de meilleures performances si les tableaux sont grands
            if (weights[layer].length > 1000) {
                result[layer] = new Float32Array(weights[layer].length) as unknown as number[];
            } else {
                result[layer] = new Array(weights[layer].length).fill(0);
            }
        }

        return result;
    }

    /**
     * Initialise les biais avec des zéros tout en préservant la structure
     */
    private initializeZeroBiases(biases: Record<string, number[]>): Record<string, number[]> {
        const result: Record<string, number[]> = {};

        for (const layer in biases) {
            // Utiliser des typed arrays pour de meilleures performances si les tableaux sont grands
            if (biases[layer].length > 1000) {
                result[layer] = new Float32Array(biases[layer].length) as unknown as number[];
            } else {
                result[layer] = new Array(biases[layer].length).fill(0);
            }
        }

        return result;
    }

    /**
     * Applique une somme pondérée aux paramètres du modèle sur place
     */
    private applyWeightedSum(
        baseParameters: ModelParameters,
        newParameters: ModelParameters,
        weight: number,
        strategy: AggregationStrategy
    ): void {
        // Si le poids est zéro, aucune contribution n'est nécessaire
        if (weight === 0) return;

        // Appliquer la somme pondérée aux poids
        for (const layer in newParameters.weights) {
            if (!baseParameters.weights[layer]) continue;

            const targetWeights = baseParameters.weights[layer];
            const sourceWeights = newParameters.weights[layer];

            if (targetWeights.length !== sourceWeights.length) {
                this.logger.warn('Layer size mismatch during aggregation', {
                    layer,
                    baseSize: targetWeights.length,
                    newSize: sourceWeights.length
                });
                continue;
            }

            this.applyAggregationStrategy(targetWeights, sourceWeights, weight, strategy);
        }

        // Appliquer la somme pondérée aux biais
        for (const layer in newParameters.biases) {
            if (!baseParameters.biases[layer]) continue;

            const targetBiases = baseParameters.biases[layer];
            const sourceBiases = newParameters.biases[layer];

            if (targetBiases.length !== sourceBiases.length) {
                this.logger.warn('Bias size mismatch during aggregation', {
                    layer,
                    baseSize: targetBiases.length,
                    newSize: sourceBiases.length
                });
                continue;
            }

            this.applyAggregationStrategy(targetBiases, sourceBiases, weight, strategy);
        }

        // Si des hyperparamètres sont présents, les agréger également
        if (newParameters.hyperparameters && Object.keys(newParameters.hyperparameters).length > 0) {
            if (!baseParameters.hyperparameters) {
                baseParameters.hyperparameters = {};
            }

            // Agréger les hyperparamètres numériques
            for (const key in newParameters.hyperparameters) {
                const value = newParameters.hyperparameters[key];
                if (typeof value === 'number') {
                    if (typeof baseParameters.hyperparameters[key] !== 'number') {
                        baseParameters.hyperparameters[key] = 0;
                    }
                    const baseValue = baseParameters.hyperparameters[key] as number;
                    baseParameters.hyperparameters[key] = baseValue + (value * weight);
                }
            }
        }
    }

    /**
     * Applique la stratégie d'agrégation spécifiée aux tableaux de valeurs
     */
    private applyAggregationStrategy(
        target: number[],
        source: number[],
        weight: number,
        strategy: AggregationStrategy
    ): void {
        switch (strategy) {
            case 'simple_average':
                // Moyenne simple (poids égaux)
                for (let i = 0; i < target.length; i++) {
                    target[i] += source[i] / target.length;
                }
                break;

            case 'consensus_driven':
                // Uniquement les valeurs avec consensus significatif sont prises en compte
                for (let i = 0; i < target.length; i++) {
                    if (weight > 0.5) { // Seuil de consensus
                        target[i] += source[i] * weight;
                    }
                }
                break;

            default:
                // Fallback sur moyenne pondérée standard
                for (let i = 0; i < target.length; i++) {
                    target[i] += source[i] * weight;
                }
        }
    }
};
                
            case 'weighted_average':
            case 'confidence_weighted':
            case 'performance_based':
            case 'trust_based':
// Moyenne pondérée (standard)
for (let i = 0; i < target.length; i++) {
    target[i] += source[i] * weight;
}
break;
                
            case 'federated_average':
// Moyenne fédérée (pondère par rapport à la taille du dataset)
for (let i = 0; i < target.length; i++) {
    target[i] += source[i] * weight;
}
break;
                
            case 'latency_optimized':
// Optimisé pour la latence (vectorisation si disponible)
if (target instanceof Float32Array && source instanceof Float32Array) {
    for (let i = 0; i < target.length; i++) {
        target[i] += source[i] * weight;
    }
} else {
    for (let i = 0; i < target.length; i++) {
        target[i] += source[i] * weight;
    }
}
break