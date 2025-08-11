// src/ai/specialized/spatial/generators/interfaces/IReferenceZoneGenerator.ts

import { CulturalContext, ReferenceZone, ReferenceZoneType } from '../../types';

/**
 * Interface pour le générateur de zones de référence
 */
export interface IReferenceZoneGenerator {
    /**
     * Génère toutes les zones de référence pour un contexte culturel donné
     * @param context Contexte culturel
     * @returns Tableau des zones de référence générées
     */
    generateZones(context: CulturalContext): Promise<ReferenceZone[]>;

    /**
     * Génère des zones de référence d'un type spécifique
     * @param context Contexte culturel
     * @param type Type de zone à générer
     * @returns Tableau des zones de référence du type spécifié
     */
    generateZonesByType(context: CulturalContext, type: ReferenceZoneType): Promise<ReferenceZone[]>;

    /**
     * Optimise la disposition des zones pour éviter les chevauchements et utiliser l'espace efficacement
     * @param zones Zones à optimiser
     * @returns Zones optimisées
     */
    optimizeZoneLayout(zones: ReferenceZone[]): Promise<ReferenceZone[]>;
}