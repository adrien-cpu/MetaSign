// src/ai/specialized/spatial/validation/interfaces/ISpatialValidator.ts

import { SpatialLayout, SpatialStructure } from '../../types';

/**
 * Interface pour la validation des structures spatiales
 */
export interface ISpatialValidator {
    /**
     * Valide une structure spatiale complète
     * @param layout Disposition spatiale à valider
     * @throws SpatialValidationError si la validation échoue
     */
    validateStructure(layout: SpatialLayout): Promise<void>;

    /**
     * Mesure la cohérence d'une structure spatiale
     * @param structure Structure spatiale à évaluer
     * @returns Score de cohérence (0-1)
     */
    measureCoherence(structure: SpatialStructure): Promise<number>;

    /**
     * Valide la cohérence des zones dans une disposition
     * @param layout Disposition spatiale
     * @returns Score de cohérence des zones (0-1)
     */
    validateZoneCoherence(layout: SpatialLayout): Promise<number>;

    /**
     * Valide la cohérence des relations dans une disposition
     * @param layout Disposition spatiale
     * @returns Score de cohérence des relations (0-1)
     */
    validateRelationConsistency(layout: SpatialLayout): Promise<number>;

    /**
     * Valide l'utilisation des proformes dans une disposition
     * @param layout Disposition spatiale
     * @returns Score de validité des proformes (0-1)
     */
    validateProformeUsage(layout: SpatialLayout): Promise<number>;
}