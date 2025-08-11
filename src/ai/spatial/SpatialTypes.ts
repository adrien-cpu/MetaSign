// src/ai/spatial/types/SpatialTypes.ts

/**
 * Vecteur 3D représentant une position dans l'espace
 */
export interface SpatialVector {
    x: number;
    y: number;
    z: number;
}

/**
 * Alias pour Vector3D pour compatibilité
 */
export type Vector3D = SpatialVector;

/**
 * Quaternion représentant une orientation dans l'espace
 */
export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * Types de référence spatiale
 */
export enum SpatialReferenceType {
    ENTITY = 'ENTITY',        // Entité physique (personne, objet)
    LOCATION = 'LOCATION',    // Lieu 
    CONCEPT = 'CONCEPT',      // Concept abstrait
    TEMPORAL = 'TEMPORAL',    // Point temporel
    GROUP = 'GROUP'           // Groupe d'entités
}

/**
 * Rôles grammaticaux possibles pour une référence
 */
export enum GrammaticalRole {
    SUBJECT = 'SUBJECT',
    OBJECT = 'OBJECT',
    RECIPIENT = 'RECIPIENT',
    AGENT = 'AGENT',
    PATIENT = 'PATIENT',
    LOCATION = 'LOCATION',
    TIME = 'TIME',
    MANNER = 'MANNER',
    OTHER = 'OTHER'
}

/**
 * Zones prédéfinies dans l'espace de signation
 */
export enum SigningZoneType {
    NEUTRAL = 'NEUTRAL',      // Zone neutre (centre)
    LEFT = 'LEFT',            // Zone gauche
    RIGHT = 'RIGHT',          // Zone droite  
    UPPER = 'UPPER',          // Zone supérieure
    LOWER = 'LOWER',          // Zone inférieure
    PROXIMAL = 'PROXIMAL',    // Zone proche du corps
    DISTAL = 'DISTAL'         // Zone éloignée du corps
}

/**
 * Contexte associé à une référence spatiale
 */
export interface SpatialReferenceContext {
    label: string;
    tags: string[];
    grammaticalRole?: GrammaticalRole;
    relatedEntities?: string[];
    properties?: Record<string, unknown>;
}

/**
 * Référence spatiale complète
 */
export interface SpatialReference {
    id: string;
    type: SpatialReferenceType;
    position: SpatialVector;
    orientation?: Quaternion;
    importance: number;
    createdAt: number;
    lastUsedAt: number;
    context: SpatialReferenceContext;
}

/**
 * Interface pour la référence dans l'espace de signation
 * (pour compatibilité avec le code existant)
 */
export interface SigningSpaceReference {
    referentId: string;
    referentType: string;
    position: SpatialVector;
    createdAt: number;
    lastUsed: number;
    strength: number;
    metadata?: Record<string, unknown>;
}

/**
 * État complet de l'espace de signation
 */
export interface SigningSpaceState {
    references: SpatialReference[];
    activeReferences: string[];
    currentFocus?: string;
    lastUpdated: number;
}

/**
 * Relation entre références spatiales
 */
export interface SpatialRelation {
    sourceId: string;
    targetId: string;
    type: string;
    strength: number;
    metadata?: Record<string, unknown>;
}

/**
 * Exporte toutes les types pour création d'un barrel file
 */
export * from './SpatialTypes';