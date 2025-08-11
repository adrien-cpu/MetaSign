// src/ai/spatial/reference/ReferenceTracker.ts

import { IReferenceTracker } from '../types/interfaces/SpatialInterfaces';
import {
    SpatialReference,
    SpatialVector,
    SpatialReferenceType,
    ReferenceActivationState,
    SpatialRelationship
} from '../types/SpatialTypes';
import { Observable } from '../../utils/Observable';

/**
 * Type d'événement du tracker de références
 */
export interface TrackerEvent {
    type: 'add' | 'update' | 'activate' | 'deactivate' | 'remove' | 'relationship_add' | 'relationship_remove';
    referenceId: string;
    relatedId?: string; // ID de la référence associée (pour les relations)
    timestamp: number;
}

/**
 * Classe qui assure le suivi des références spatiales
 * Implémente l'interface IReferenceTracker et permet d'observer les changements
 */
export class ReferenceTracker extends Observable<TrackerEvent> implements IReferenceTracker {
    // Stockage des références indexées par ID
    private references: Map<string, SpatialReference> = new Map();

    // Stockage des relations entre références
    private relationships: Map<string, Array<{ targetId: string; relationship: SpatialRelationship }>> = new Map();

    // Cache d'index pour les recherches performantes
    private typeIndex: Map<SpatialReferenceType, Set<string>> = new Map();
    private spatialIndex: Map<string, SpatialVector> = new Map();

    /**
     * Construit un tracker de références
     */
    constructor() {
        super();
        this.initializeIndices();
    }

    /**
     * Initialise les index pour les différents types de référence
     */
    private initializeIndices(): void {
        // Initialiser l'index de type
        for (const type of Object.values(SpatialReferenceType)) {
            this.typeIndex.set(type, new Set<string>());
        }
    }

    /**
     * Met à jour les index après l'ajout ou la modification d'une référence
     * @param reference Référence ajoutée ou modifiée
     */
    private updateIndices(reference: SpatialReference): void {
        // Mettre à jour l'index de type
        const typeSet = this.typeIndex.get(reference.type);
        if (typeSet) {
            typeSet.add(reference.id);
        }

        // Mettre à jour l'index spatial
        this.spatialIndex.set(reference.id, reference.position);
    }

    /**
     * Supprime une référence des index
     * @param referenceId ID de la référence à supprimer
     */
    private removeFromIndices(referenceId: string): void {
        const reference = this.references.get(referenceId);

        if (reference) {
            // Supprimer de l'index de type
            const typeSet = this.typeIndex.get(reference.type);
            if (typeSet) {
                typeSet.delete(referenceId);
            }

            // Supprimer de l'index spatial
            this.spatialIndex.delete(referenceId);
        }
    }

    /**
     * Ajoute ou met à jour une référence spatiale
     * @param reference La référence à ajouter ou mettre à jour
     * @returns L'ID de la référence
     */
    public trackReference(reference: SpatialReference): string {
        const exists = this.references.has(reference.id);

        // Stocker la référence
        this.references.set(reference.id, { ...reference, updatedAt: Date.now() });

        // Mettre à jour les index
        this.updateIndices(reference);

        // Notifier les observateurs
        this.notify({
            type: exists ? 'update' : 'add',
            referenceId: reference.id,
            timestamp: Date.now()
        });

        return reference.id;
    }

    /**
     * Récupère une référence par son ID
     * @param referenceId L'ID de la référence
     * @returns La référence ou undefined si non trouvée
     */
    public getReference(referenceId: string): SpatialReference | undefined {
        return this.references.get(referenceId);
    }

    /**
     * Active une référence
     * @param referenceId L'ID de la référence
     * @returns true si l'activation a réussi
     */
    public activateReference(referenceId: string): boolean {
        const reference = this.references.get(referenceId);

        if (reference && reference.activationState !== ReferenceActivationState.ACTIVE) {
            reference.activationState = ReferenceActivationState.ACTIVE;
            reference.updatedAt = Date.now();

            // Notifier les observateurs
            this.notify({
                type: 'activate',
                referenceId,
                timestamp: Date.now()
            });

            return true;
        }

        return false;
    }

    /**
     * Désactive une référence
     * @param referenceId L'ID de la référence
     * @returns true si la désactivation a réussi
     */
    public deactivateReference(referenceId: string): boolean {
        const reference = this.references.get(referenceId);

        if (reference && reference.activationState === ReferenceActivationState.ACTIVE) {
            reference.activationState = ReferenceActivationState.INACTIVE;
            reference.updatedAt = Date.now();

            // Notifier les observateurs
            this.notify({
                type: 'deactivate',
                referenceId,
                timestamp: Date.now()
            });

            return true;
        }

        return false;
    }

    /**
     * Teste si une référence est active
     * @param referenceId L'ID de la référence
     * @returns true si la référence est active
     */
    public isReferenceActive(referenceId: string): boolean {
        const reference = this.references.get(referenceId);
        return reference?.activationState === ReferenceActivationState.ACTIVE;
    }

    /**
     * Supprime une référence
     * @param referenceId L'ID de la référence
     * @returns true si la suppression a réussi
     */
    public removeReference(referenceId: string): boolean {
        if (this.references.has(referenceId)) {
            // Supprimer des index
            this.removeFromIndices(referenceId);

            // Supprimer les relations associées
            this.relationships.delete(referenceId);

            // Nettoyer les relations où cette référence était une cible
            for (const [sourceId, relations] of this.relationships.entries()) {
                const newRelations = relations.filter(rel => rel.targetId !== referenceId);
                if (newRelations.length !== relations.length) {
                    this.relationships.set(sourceId, newRelations);
                }
            }

            // Supprimer la référence
            this.references.delete(referenceId);

            // Notifier les observateurs
            this.notify({
                type: 'remove',
                referenceId,
                timestamp: Date.now()
            });

            return true;
        }

        return false;
    }

    /**
     * Récupère toutes les références actives
     * @returns Un tableau des références actives
     */
    public getActiveReferences(): SpatialReference[] {
        return Array.from(this.references.values())
            .filter(ref => ref.activationState === ReferenceActivationState.ACTIVE);
    }

    /**
     * Récupère toutes les références
     * @returns Un tableau de toutes les références
     */
    public getAllReferences(): SpatialReference[] {
        return Array.from(this.references.values());
    }

    /**
     * Recherche des références par type
     * @param type Le type de référence recherché
     * @returns Un tableau des références correspondantes
     */
    public findReferencesByType(type: SpatialReferenceType): SpatialReference[] {
        const ids = this.typeIndex.get(type);

        if (!ids) {
            return [];
        }

        return Array.from(ids)
            .map(id => this.references.get(id))
            .filter((ref): ref is SpatialReference => ref !== undefined);
    }

    /**
     * Calcule la distance euclidienne entre deux points
     */
    private calculateDistance(p1: SpatialVector, p2: SpatialVector): number {
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
    }

    /**
     * Recherche des références par position
     * @param position La position approximative
     * @param threshold La distance maximale pour considérer une correspondance
     * @returns Un tableau des références correspondantes
     */
    public findReferencesByPosition(position: SpatialVector, threshold: number): SpatialReference[] {
        return Array.from(this.references.values())
            .filter(ref => this.calculateDistance(ref.position, position) <= threshold);
    }

    /**
     * Met à jour la position d'une référence
     * @param referenceId L'ID de la référence
     * @param newPosition La nouvelle position
     * @returns true si la mise à jour a réussi
     */
    public updateReferencePosition(referenceId: string, newPosition: SpatialVector): boolean {
        const reference = this.references.get(referenceId);

        if (reference) {
            // Mettre à jour la position
            reference.position = newPosition;
            reference.updatedAt = Date.now();

            // Mettre à jour l'index spatial
            this.spatialIndex.set(referenceId, newPosition);

            // Notifier les observateurs (type 'update')
            this.notify({
                type: 'update',
                referenceId,
                timestamp: Date.now()
            });

            return true;
        }

        return false;
    }

    /**
     * Crée une relation entre deux références
     * @param sourceId L'ID de la référence source
     * @param targetId L'ID de la référence cible
     * @param relationship Le type de relation
     * @returns true si la création a réussi
     */
    public createRelationship(sourceId: string, targetId: string, relationship: SpatialRelationship): boolean {
        // Vérifier que les deux références existent
        if (!this.references.has(sourceId) || !this.references.has(targetId)) {
            return false;
        }

        // Récupérer ou initialiser la liste des relations pour cette source
        let relations = this.relationships.get(sourceId);
        if (!relations) {
            relations = [];
            this.relationships.set(sourceId, relations);
        }

        // Vérifier si la relation existe déjà
        const existingIndex = relations.findIndex(rel => rel.targetId === targetId && rel.relationship === relationship);

        if (existingIndex >= 0) {
            return true; // La relation existe déjà
        }

        // Ajouter la nouvelle relation
        relations.push({ targetId, relationship });

        // Notifier les observateurs
        this.notify({
            type: 'relationship_add',
            referenceId: sourceId,
            relatedId: targetId,
            timestamp: Date.now()
        });

        return true;
    }

    /**
     * Supprime une relation entre deux références
     * @param sourceId L'ID de la référence source
     * @param targetId L'ID de la référence cible
     * @returns true si la suppression a réussi
     */
    public removeRelationship(sourceId: string, targetId: string): boolean {
        const relations = this.relationships.get(sourceId);

        if (!relations) {
            return false;
        }

        const initialLength = relations.length;
        const newRelations = relations.filter(rel => rel.targetId !== targetId);

        if (newRelations.length !== initialLength) {
            this.relationships.set(sourceId, newRelations);

            // Notifier les observateurs
            this.notify({
                type: 'relationship_remove',
                referenceId: sourceId,
                relatedId: targetId,
                timestamp: Date.now()
            });

            return true;
        }

        return false;
    }

    /**
     * Récupère les relations d'une référence
     * @param referenceId L'ID de la référence
     * @returns Un tableau des relations
     */
    public getRelationships(referenceId: string): Array<{
        targetId: string;
        relationship: SpatialRelationship;
    }> {
        return this.relationships.get(referenceId) || [];
    }

    /**
     * Réinitialise le tracker
     */
    public reset(): void {
        this.references.clear();
        this.relationships.clear();
        this.spatialIndex.clear();

        // Réinitialiser les index
        this.initializeIndices();
    }
}