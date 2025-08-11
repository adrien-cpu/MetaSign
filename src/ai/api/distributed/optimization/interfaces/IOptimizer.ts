// src/ai/api/distributed/optimization/interfaces/IOptimizer.ts

import {
    OptimizationInput,
    OptimizationResult,
    OptimizationMetrics
} from '../types';

/**
 * Interface pour les optimiseurs de performance
 */
export interface IOptimizer {
    /**
     * Optimise les données d'entrée
     * @param data Données à optimiser
     * @returns Données optimisées et métriques de performance
     */
    optimize(data: OptimizationInput): Promise<OptimizationResult>;

    /**
     * Retourne le type d'optimiseur
     * @returns Type de l'optimiseur
     */
    getOptimizerType(): string;
}