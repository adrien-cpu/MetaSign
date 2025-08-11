// src/ai/specialized/spatial/analyzers/interfaces/IComponentExtractor.ts

import { LSFInput, SpatialComponent, SpatialComponentType } from '../../types';

/**
 * Interface pour les extracteurs de composants spatiaux
 */
export interface IComponentExtractor {
    /**
     * Extrait tous les composants spatiaux d'une entrée LSF
     * @param input Entrée LSF à analyser
     * @returns Tableau de composants spatiaux
     */
    extract(input: LSFInput): Promise<SpatialComponent[]>;

    /**
     * Extrait les composants d'un type spécifique d'une entrée LSF
     * @param input Entrée LSF à analyser
     * @param type Type de composant à extraire
     * @returns Tableau de composants du type spécifié
     */
    extractByType(input: LSFInput, type: SpatialComponentType): Promise<SpatialComponent[]>;
}