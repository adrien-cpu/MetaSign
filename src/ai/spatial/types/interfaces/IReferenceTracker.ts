// src/ai/spatial/types/interfaces/IReferenceTracker.ts

import { Vector3D } from "@/ai/types/geometry";
import { SpatialReference } from "@spatial/types/SpatialTypes";

/**
 * Interface pour le tracker de références spatiales
 */
export interface IReferenceTracker {
    /**
     * Commence à suivre une référence
     * @param reference Référence à suivre
     */
    trackReference(reference: SpatialReference): void;

    /**
     * Met à jour le suivi d'une référence
     * @param referenceId ID de la référence
     * @param newPosition Nouvelle position (optionnel)
     */
    updateTracking(referenceId: string, newPosition?: Vector3D): void;

    /**
     * Arrête le suivi d'une référence
     * @param referenceId ID de la référence
     */
    stopTracking(referenceId: string): void;

    /**
     * Vérifie si une référence est actuellement suivie
     * @param referenceId ID de la référence
     */
    isTracking(referenceId: string): boolean;

    /**
     * Récupère toutes les références suivies
     */
    getAllTrackedReferences(): SpatialReference[];

    /**
     * Récupère les références inactives mais pas expirées
     * @param olderThan Âge minimum en ms (optionnel)
     */
    getInactiveReferences(olderThan?: number): SpatialReference[];

    /**
     * Récupère les références récemment utilisées
     * @param count Nombre de références à récupérer
     */
    getRecentlyUsedReferences(count: number): SpatialReference[];

    /**
     * Marque une référence comme utilisée
     * @param referenceId ID de la référence
     */
    markReferenceAsUsed(referenceId: string): void;
}