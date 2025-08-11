// src/ai/specialized/spatial/generators/interfaces/ILayoutGenerator.ts

import {
    ReferenceZone,
    SpatialLayout,
    CulturalContext,
    SpatialElement,
    SpatialRelation
} from '../../types';

/**
 * Interface pour le générateur de disposition spatiale
 * Responsable de la création et de l'optimisation des dispositions spatiales
 */
export interface ILayoutGenerator {
    /**
     * Génère une disposition spatiale à partir des zones de référence
     * @param zones Zones de référence
     * @param context Contexte culturel (optionnel, pour des adaptations spécifiques)
     * @returns Disposition spatiale générée
     */
    generateLayout(zones: ReferenceZone[], context?: CulturalContext): Promise<SpatialLayout>;

    /**
     * Place des éléments dans les zones de la disposition
     * @param layout Disposition spatiale
     * @returns Disposition avec les éléments placés
     */
    placeElements(layout: SpatialLayout): Promise<SpatialLayout>;

    /**
     * Crée des relations entre les éléments placés
     * @param layout Disposition spatiale avec éléments
     * @returns Disposition avec relations créées
     */
    createRelations(layout: SpatialLayout): Promise<SpatialLayout>;

    /**
     * Optimise la disposition des éléments
     * @param layout Disposition à optimiser
     * @returns Disposition optimisée
     */
    optimizeElementPositions(layout: SpatialLayout): Promise<SpatialLayout>;

    /**
     * Valide la disposition générée
     * @param layout Disposition à valider
     * @returns Vrai si la disposition est valide
     */
    validateLayout(layout: SpatialLayout): Promise<boolean>;
}