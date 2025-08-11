// src/ai/specialized/spatial/core/interfaces/IProformeRegistry.ts

import { CulturalContext, Proforme } from '../../types';

/**
 * Interface pour le registre de proformes
 * Gère la collection de proformes disponibles et leur contextualisation
 */
export interface IProformeRegistry {
    /**
     * Prépare les proformes appropriées pour un contexte culturel donné
     * @param context Contexte culturel
     */
    prepareForContext(context: CulturalContext): Promise<void>;

    /**
     * Récupère toutes les proformes actives
     * @returns Tableau des proformes actives
     */
    getActiveProformes(): Proforme[];

    /**
     * Récupère une proforme par son identifiant
     * @param id Identifiant de la proforme
     * @returns Proforme trouvée ou undefined
     */
    getProforme(id: string): Proforme | undefined;

    /**
     * Récupère les proformes par concept représenté
     * @param concept Concept représenté
     * @returns Tableau des proformes correspondantes
     */
    getProformesByRepresentation(concept: string): Proforme[];

    /**
     * Ajoute une proforme au registre
     * @param proforme Proforme à ajouter
     * @returns Vrai si la proforme a été ajoutée avec succès
     */
    addProforme(proforme: Proforme): boolean;

    /**
     * Supprime une proforme du registre
     * @param id Identifiant de la proforme à supprimer
     * @returns Vrai si la proforme a été supprimée avec succès
     */
    removeProforme(id: string): boolean;

    /**
     * Réinitialise le registre
     */
    reset(): void;
}