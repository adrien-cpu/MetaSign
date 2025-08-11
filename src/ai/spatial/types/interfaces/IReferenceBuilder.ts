// src/ai/spatial/types/interfaces/IReferenceBuilder.ts

// Utiliser des imports absolus avec les alias de chemins
import { Vector3D } from "@/ai/types/geometry";
import {
    SpatialReference,
    SpatialReferenceType,
    SigningZoneType,
    SpatialVector,
    GrammaticalRole
} from "../SpatialTypes"; // Chemin relatif pour éviter les problèmes avec les alias

/**
 * Interface pour le constructeur de références spatiales
 */
export interface IReferenceBuilder {
    /**
     * Initialise une nouvelle référence
     * @param type Type de la référence
     * @param label Label ou nom de la référence
     */
    initialize(type: SpatialReferenceType, label: string): IReferenceBuilder;

    /**
     * Positionne la référence dans l'espace
     * @param position Position dans l'espace 3D
     */
    withPosition(position: Vector3D): IReferenceBuilder;

    /**
     * Ajoute des tags à la référence
     * @param tags Tags à ajouter
     */
    withTags(tags: string[]): IReferenceBuilder;

    /**
     * Définit le rôle grammatical de la référence
     * @param role Rôle grammatical
     */
    withGrammaticalRole(role: GrammaticalRole): IReferenceBuilder;

    /**
     * Lie cette référence à d'autres entités
     * @param entityIds IDs des entités liées
     */
    withRelatedEntities(entityIds: string[]): IReferenceBuilder;

    /**
     * Définit l'importance de la référence
     * @param importance Valeur d'importance (0-1)
     */
    withImportance(importance: number): IReferenceBuilder;

    /**
     * Ajoute des propriétés personnalisées
     * @param properties Propriétés à ajouter
     */
    withProperties(properties: Record<string, unknown>): IReferenceBuilder;

    /**
     * Ajoute une orientation à la référence
     * @param orientation Quaternion d'orientation
     */
    withOrientation(orientation: { x: number; y: number; z: number; w: number }): IReferenceBuilder;

    /**
     * Crée une référence basée sur un type de zone prédéfini
     * @param zoneType Type de zone dans l'espace de signation
     */
    withZoneType(zoneType: SigningZoneType): IReferenceBuilder;

    /**
     * Crée une référence relative à une référence existante
     * @param baseReference Référence de base
     * @param relativePosition Position relative par rapport à la référence de base
     */
    relativeTo(baseReference: SpatialReference, relativePosition: SpatialVector): IReferenceBuilder;

    /**
     * Configurer la référence comme représentant un groupe d'entités
     * @param memberIds IDs des membres du groupe
     */
    asGroup(memberIds: string[]): IReferenceBuilder;

    /**
     * Clone une référence existante avec des modifications optionnelles
     * @param sourceReference Référence source à cloner
     * @param options Options de modification (facteur d'importance, décalage de position)
     */
    fromExisting(
        sourceReference: SpatialReference,
        options?: {
            strengthFactor?: number;
            positionOffset?: SpatialVector;
        }
    ): IReferenceBuilder;

    /**
     * Construit la référence finale
     */
    build(): SpatialReference;
}