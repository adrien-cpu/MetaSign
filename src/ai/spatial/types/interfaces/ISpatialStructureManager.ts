// src/ai/spatial/types/interfaces/ISpatialStructureManager.ts
import { LSFExpression } from '@/ai/types/lsf';

/**
 * Interface pour les gestionnaires de structure spatiale qui analysent
 * et gèrent les aspects spatiaux des expressions LSF.
 */
export interface ISpatialStructureManager {
    /**
     * Analyse la structure spatiale d'une expression LSF.
     * 
     * @param expression - L'expression LSF à analyser
     * @returns Une analyse de la structure spatiale
     */
    analyze(expression: LSFExpression): Promise<Record<string, unknown>>;

    /**
     * Vérifie la cohérence spatiale d'une expression LSF.
     * 
     * @param expression - L'expression LSF à vérifier
     * @returns Un booléen indiquant si l'expression est spatialement cohérente
     */
    checkCoherence(expression: LSFExpression): Promise<boolean>;

    /**
     * Suggère des améliorations pour la structure spatiale d'une expression LSF.
     * 
     * @param expression - L'expression LSF à améliorer
     * @returns Un tableau de suggestions d'amélioration
     */
    suggestImprovements(expression: LSFExpression): Promise<string[]>;
}