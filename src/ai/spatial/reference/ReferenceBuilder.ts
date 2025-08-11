// src/ai/spatial/reference/ReferenceBuilder.ts

import { IReferenceBuilder } from '../types/interfaces/SpatialInterfaces';
import {
    SpatialReference,
    SpatialReferenceType,
    SpatialVector,
    ReferenceActivationState
} from '../types/SpatialTypes';

/**
 * Classe responsable de la création des références spatiales
 * Implémente l'interface IReferenceBuilder
 */
export class ReferenceBuilder implements IReferenceBuilder {
    /**
     * Génère un ID unique pour une référence
     * @param type Type de référence
     * @returns ID unique
     */
    private generateReferenceId(type: SpatialReferenceType): string {
        return `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Crée une référence de base avec les paramètres par défaut
     * @param type Type de référence
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale
     */
    private createBaseReference(
        type: SpatialReferenceType,
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        const now = Date.now();

        return {
            id: this.generateReferenceId(type),
            type,
            position,
            createdAt: now,
            updatedAt: now,
            activationState: ReferenceActivationState.ACTIVE,
            importance: 0.5, // Importance moyenne par défaut
            persistenceScore: 0.5, // Persistance moyenne par défaut
            properties
        };
    }

    /**
     * Crée une référence de type personne
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale de type personne
     */
    public createPersonReference(
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        // Propriétés spécifiques aux personnes
        const personProperties = {
            ...properties,
            entityType: 'person',
            defaultSize: { x: 0.5, y: 1.8, z: 0.3 } // Taille moyenne d'une personne
        };

        return this.createBaseReference(SpatialReferenceType.PERSON, position, personProperties);
    }

    /**
     * Crée une référence de type objet
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale de type objet
     */
    public createObjectReference(
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        // Propriétés spécifiques aux objets
        const objectProperties = {
            ...properties,
            entityType: 'object',
            defaultSize: { x: 0.3, y: 0.3, z: 0.3 } // Taille moyenne d'un objet
        };

        return this.createBaseReference(SpatialReferenceType.OBJECT, position, objectProperties);
    }

    /**
     * Crée une référence de type lieu
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale de type lieu
     */
    public createLocationReference(
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        // Propriétés spécifiques aux lieux
        const locationProperties = {
            ...properties,
            entityType: 'location',
            defaultSize: { x: 1.0, y: 1.0, z: 1.0 } // Taille moyenne d'un lieu
        };

        return this.createBaseReference(SpatialReferenceType.LOCATION, position, locationProperties);
    }

    /**
     * Crée une référence de type concept
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale de type concept
     */
    public createConceptReference(
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        // Propriétés spécifiques aux concepts
        const conceptProperties = {
            ...properties,
            entityType: 'concept',
            defaultSize: { x: 0.4, y: 0.4, z: 0.4 } // Taille moyenne d'un concept
        };

        return this.createBaseReference(SpatialReferenceType.CONCEPT, position, conceptProperties);
    }

    /**
     * Crée une référence de type temps
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale de type temps
     */
    public createTimeReference(
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        // Propriétés spécifiques au temps
        const timeProperties = {
            ...properties,
            entityType: 'time',
            defaultSize: { x: 0.3, y: 0.3, z: 0.3 } // Taille moyenne d'une référence temporelle
        };

        return this.createBaseReference(SpatialReferenceType.TIME, position, timeProperties);
    }

    /**
     * Crée une référence personnalisée
     * @param type Type de référence
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns Référence spatiale personnalisée
     */
    public createCustomReference(
        type: SpatialReferenceType,
        position: SpatialVector,
        properties: Record<string, unknown> = {}
    ): SpatialReference {
        // Pour les références personnalisées, utiliser directement le type fourni
        return this.createBaseReference(type, position, properties);
    }
}