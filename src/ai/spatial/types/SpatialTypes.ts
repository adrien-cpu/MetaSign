// src/ai/spatial/types/SpatialTypes.ts

/**
 * Vecteur spatial en 3D pour les positions dans l'espace de signation
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
 * Type de référence spatiale
 */
export enum SpatialReferenceType {
    PERSON = 'person',
    OBJECT = 'object',
    LOCATION = 'location',
    CONCEPT = 'concept',
    TIME = 'time',
    CUSTOM = 'custom',
    ENTITY = 'entity',     // Entité physique (personne, objet)
    TEMPORAL = 'temporal', // Point temporel
    GROUP = 'group'        // Groupe d'entités
}

/**
 * Rôles grammaticaux possibles pour une référence
 */
export enum GrammaticalRole {
    SUBJECT = 'subject',
    OBJECT = 'object',
    RECIPIENT = 'recipient',
    AGENT = 'agent',
    PATIENT = 'patient',
    LOCATION = 'location',
    TIME = 'time',
    MANNER = 'manner',
    OTHER = 'other'
}

/**
 * Zones prédéfinies dans l'espace de signation
 */
export enum SigningZoneType {
    NEUTRAL = 'neutral',      // Zone neutre (centre)
    LEFT = 'left',            // Zone gauche
    RIGHT = 'right',          // Zone droite  
    UPPER = 'upper',          // Zone supérieure
    LOWER = 'lower',          // Zone inférieure
    PROXIMAL = 'proximal',    // Zone proche du corps
    DISTAL = 'distal'         // Zone éloignée du corps
}

/**
 * État d'activation d'une référence
 */
export enum ReferenceActivationState {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending'
}

/**
 * Types d'événements spatiaux
 */
export enum SpatialEventType {
    REFERENCE_ADDED = 'reference_added',
    REFERENCE_REMOVED = 'reference_removed',
    REFERENCE_UPDATED = 'reference_updated',
    REFERENCE_ACTIVATED = 'reference_activated',
    REFERENCE_DEACTIVATED = 'reference_deactivated',
    RELATIONSHIP_CREATED = 'relationship_created',
    RELATIONSHIP_REMOVED = 'relationship_removed',
    MAP_CLEARED = 'map_cleared',
    CONTEXT_CHANGED = 'context_changed',
    ERROR = 'error',
    CREATED = 'created',
    UPDATED = 'updated',
    REMOVED = 'removed',
    LINKED = 'linked',
    UNLINKED = 'unlinked'
}

/**
 * Relation spatiale entre références
 */
export enum SpatialRelationship {
    NEXT_TO = 'next_to',
    ABOVE = 'above',
    BELOW = 'below',
    IN_FRONT_OF = 'in_front_of',
    BEHIND = 'behind',
    INSIDE = 'inside',
    OUTSIDE = 'outside',
    PART_OF = 'part_of',
    CONNECTED_TO = 'connected_to',
    LEFT_OF = 'left_of',
    RIGHT_OF = 'right_of',
    CUSTOM = 'custom'
}

/**
 * Type de relation spatiale avec métadonnées
 */
export interface SpatialRelationType {
    type: SpatialRelationship;
    isBidirectional: boolean;
    intensity?: number; // Niveau d'intensité de la relation (0-1)
    customProperties?: Record<string, unknown>;
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
 * Options de mise à jour d'une référence
 */
export interface ReferenceUpdateOptions {
    position?: SpatialVector;
    orientation?: {
        pitch?: number;
        yaw?: number;
        roll?: number;
    };
    activationState?: ReferenceActivationState;
    importance?: number;
    persistenceScore?: number;
    properties?: Record<string, unknown>;
    reactivate?: boolean;
    updatePosition?: boolean;
    enrichContext?: boolean;
    recalculateImportance?: boolean;
}

/**
 * Région spatiale
 */
export interface SpatialRegion {
    id: string;
    name: string;
    type?: string;
    center?: SpatialVector;
    position?: SpatialVector;
    dimensions?: SpatialVector;
    radius?: number; // Rayon de la région
    isActive?: boolean;
    semanticWeight?: number;
    properties?: Record<string, unknown>;
    references?: string[]; // IDs des références contenues
}

/**
 * Référence spatiale, représentant un élément dans l'espace de signation
 */
export interface SpatialReference {
    id: string;
    type: SpatialReferenceType;
    position: SpatialVector;
    orientation?: Quaternion;
    size?: SpatialVector; // Dimensions x,y,z pour une représentation volumétrique
    createdAt: number; // Timestamp de création
    updatedAt?: number; // Timestamp de dernière mise à jour
    lastUsedAt?: number; // Timestamp de dernière utilisation
    activationState?: ReferenceActivationState;
    importance: number; // Score d'importance (0-1)
    persistenceScore?: number; // Score de persistance temporelle (0-1)
    context?: SpatialReferenceContext; // Contexte associé
    properties?: Record<string, unknown>; // Propriétés supplémentaires
}

/**
 * Données d'événement pour chaque type d'événement spatial
 */
export interface SpatialEventData {
    // Types de données pour les événements de référence
    [SpatialEventType.REFERENCE_ADDED]: {
        reference: SpatialReference;
    };
    [SpatialEventType.REFERENCE_REMOVED]: {
        reference: SpatialReference;
    };
    [SpatialEventType.REFERENCE_UPDATED]: {
        reference: SpatialReference;
        previousReference: SpatialReference;
    };
    [SpatialEventType.REFERENCE_ACTIVATED]: {
        reference: SpatialReference;
    };
    [SpatialEventType.REFERENCE_DEACTIVATED]: {
        reference: SpatialReference;
    };

    // Types de données pour les événements de relation
    [SpatialEventType.RELATIONSHIP_CREATED]: {
        connection: SpatialConnection;
        sourceId: string;
        targetId: string;
    };
    [SpatialEventType.RELATIONSHIP_REMOVED]: {
        connection: SpatialConnection;
        sourceId: string;
        targetId: string;
    };

    // Types de données pour les autres événements
    [SpatialEventType.MAP_CLEARED]: {
        mapId: string;
    };
    [SpatialEventType.CONTEXT_CHANGED]: {
        previousContext: SpatialContext;
        newContext: SpatialContext;
    };
    [SpatialEventType.ERROR]: {
        message: string;
        code?: string;
        details?: Record<string, unknown>;
    };

    // Types génériques pour les événements de base
    [SpatialEventType.CREATED]: Record<string, unknown>;
    [SpatialEventType.UPDATED]: Record<string, unknown>;
    [SpatialEventType.REMOVED]: Record<string, unknown>;
    [SpatialEventType.LINKED]: Record<string, unknown>;
    [SpatialEventType.UNLINKED]: Record<string, unknown>;
}

/**
 * Événement lié à une référence spatiale
 */
export interface SpatialReferenceEvent {
    type: SpatialEventType;
    referenceId: string;
    timestamp: number;
    data?: Record<string, unknown>; // Données spécifiques à l'événement
}

/**
 * Connexion entre deux références spatiales
 */
export interface SpatialConnection {
    id?: string;
    sourceId: string;
    targetId: string;
    relationship?: SpatialRelationship;
    relationType?: string;
    bidirectional?: boolean;
    strength: number; // Force de la connexion (0-1)
    createdAt?: number;
    properties?: Record<string, unknown>;
}

/**
 * Contexte spatial pour la carte
 */
export interface SpatialContext {
    name: string;
    topic?: string;
    createdAt?: number;
    updatedAt?: number;
    sessionId?: string;
    complexityLevel?: number;
    timeReference?: {
        startTime: number;
        currentTime: number;
        timeScale: number; // Facteur d'échelle temporelle
    };
    culturalSettings?: {
        dialectVariation?: string;
        formalityLevel?: number; // Niveau de formalité (0-1)
        contextType?: 'educational' | 'conversational' | 'narrative' | 'technical' | 'custom';
    };
    properties?: Record<string, unknown>;
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
 * Carte spatiale principale, contenant toutes les références et leurs relations
 */
export interface SpatialMap {
    id: string;
    name?: string;
    references: Map<string, SpatialReference> | Record<string, SpatialReference>;
    connections: SpatialConnection[];
    regions: SpatialRegion[];
    context: SpatialContext;
    metadata?: {
        createdAt: number;
        updatedAt: number;
        version: string;
        coherenceScore?: number; // Score de cohérence globale (0-1)
        complexity?: number; // Niveau de complexité (0-1)
        statistics?: {
            referenceCount: number;
            connectionCount: number;
            activeReferenceCount: number;
            regionCount: number;
        };
    };
}

/**
 * Paramètres de recherche spatiale
 */
export interface SpatialQueryParams {
    position?: SpatialVector;
    radius?: number;
    types?: SpatialReferenceType[];
    activationStates?: ReferenceActivationState[];
    minImportance?: number;
    maxReferences?: number;
    sortBy?: 'distance' | 'importance' | 'createdAt' | 'updatedAt';
    sortDirection?: 'asc' | 'desc';
    includeInactive?: boolean;
    customFilter?: (reference: SpatialReference) => boolean;
}

// Types pour le module Specialized Spatial
/**
 * Zones dans le système spécialisé
 */
export interface Zone {
    id: string;
    type: ZoneType;
    center: SpatialVector;
    radius?: number;
    vertices?: SpatialVector[];
    metadata?: Record<string, unknown>;
}

/**
 * Types de zones dans le système spécialisé
 */
export enum ZoneType {
    NEUTRAL = 'neutral',
    REFERENTIAL = 'referential',
    DESCRIPTIVE = 'descriptive',
    EMOTIONAL = 'emotional',
    GRAMMATICAL = 'grammatical'
}

/**
 * Types de relation dans le système spécialisé
 */
export enum RelationshipType {
    CONTAINS = 'contains',
    OVERLAPS = 'overlaps',
    ADJACENT = 'adjacent',
    DISTANT = 'distant',
    DERIVED_FROM = 'derived_from'
}

/**
 * Relation spatiale entre zones dans le système spécialisé
 */
export interface SpatialZoneRelationship {
    sourceZone: string;
    targetZone: string;
    type: RelationshipType;
    intensity: number; // 0-1
}

/**
 * Structure spatiale dans le système spécialisé
 */
export interface SpecializedSpatialStructure {
    zones: Zone[];
    relationships: SpatialZoneRelationship[];
    defaults: {
        defaultZone: string;
        neutralPoint: SpatialVector;
    };
}

/**
 * Modification spatiale pour le système spécialisé
 */
export interface SpatialModification {
    targetZone: string;
    operation: 'expand' | 'contract' | 'move' | 'rotate' | 'distort';
    parameters: SpatialModificationParameters;
}

/**
 * Paramètres de modification spatiale
 */
export interface SpatialModificationParameters {
    factor?: number;
    direction?: SpatialVector;
    angle?: number;
    [key: string]: unknown;
}

/**
 * Contexte spatial spécialisé
 */
export interface SpecializedSpatialContext {
    baseStructure: SpecializedSpatialStructure;
    modifications: SpatialModification[];
    activeZones: string[];
    previousReferences?: {
        zone: string;
        importance: number; // 0-1
        time: number; // timestamp
    }[];
}