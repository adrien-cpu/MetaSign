// src/ai/spatial/types/interfaces/SpatialInterfaces.ts

import {
    SpatialReference,
    SpatialVector,
    SpatialMap,
    SpatialReferenceType,
    SpatialRelationship,
    SpatialConnection,
    SpatialRegion,
    SpatialRelationType,
    ReferenceUpdateOptions,
    SpatialReferenceEvent,
    Vector3D
} from '../SpatialTypes';

/**
 * Interface pour le tracker de références spatiales
 * Responsable du suivi des références dans l'espace de signation LSF
 */
export interface IReferenceTracker {
    /**
     * Ajoute ou met à jour une référence spatiale
     * @param reference La référence à ajouter/mettre à jour
     * @returns L'identifiant de la référence
     */
    trackReference(reference: SpatialReference): string;

    /**
     * Récupère une référence par son identifiant
     * @param referenceId L'identifiant de la référence
     * @returns La référence spatiale ou undefined si non trouvée
     */
    getReference(referenceId: string): SpatialReference | undefined;

    /**
     * Active une référence spatiale
     * @param referenceId L'identifiant de la référence
     * @returns true si l'activation a réussi, false sinon
     */
    activateReference(referenceId: string): boolean;

    /**
     * Désactive une référence spatiale
     * @param referenceId L'identifiant de la référence
     * @returns true si la désactivation a réussi, false sinon
     */
    deactivateReference(referenceId: string): boolean;

    /**
     * Teste si une référence est active
     * @param referenceId L'identifiant de la référence
     * @returns true si la référence est active, false sinon
     */
    isReferenceActive(referenceId: string): boolean;

    /**
     * Supprime une référence
     * @param referenceId L'identifiant de la référence
     * @returns true si la suppression a réussi, false sinon
     */
    removeReference(referenceId: string): boolean;

    /**
     * Récupère toutes les références actives
     * @returns Un tableau des références actives
     */
    getActiveReferences(): SpatialReference[];

    /**
     * Récupère toutes les références
     * @returns Un tableau de toutes les références
     */
    getAllReferences(): SpatialReference[];

    /**
     * Recherche des références par type
     * @param type Le type de référence recherché
     * @returns Un tableau des références correspondantes
     */
    findReferencesByType(type: SpatialReferenceType): SpatialReference[];

    /**
     * Recherche des références par position
     * @param position La position approximative
     * @param threshold La distance maximale pour considérer une correspondance
     * @returns Un tableau des références correspondantes
     */
    findReferencesByPosition(position: SpatialVector, threshold: number): SpatialReference[];

    /**
     * Met à jour la position d'une référence
     * @param referenceId L'identifiant de la référence
     * @param newPosition La nouvelle position
     * @returns true si la mise à jour a réussi, false sinon
     */
    updateReferencePosition(referenceId: string, newPosition: SpatialVector): boolean;

    /**
     * Crée une relation entre deux références
     * @param sourceId L'identifiant de la référence source
     * @param targetId L'identifiant de la référence cible
     * @param relationship Le type de relation
     * @returns true si la création a réussi, false sinon
     */
    createRelationship(sourceId: string, targetId: string, relationship: SpatialRelationship): boolean;

    /**
     * Supprime une relation entre deux références
     * @param sourceId L'identifiant de la référence source
     * @param targetId L'identifiant de la référence cible
     * @returns true si la suppression a réussi, false sinon
     */
    removeRelationship(sourceId: string, targetId: string): boolean;

    /**
     * Récupère les relations d'une référence
     * @param referenceId L'identifiant de la référence
     * @returns Un tableau des relations
     */
    getRelationships(referenceId: string): Array<{
        targetId: string;
        relationship: SpatialRelationship;
    }>;

    /**
     * Marque une référence comme utilisée récemment
     * @param referenceId Identifiant de la référence
     * @returns True si l'opération a réussi
     */
    markReferenceAsUsed?(referenceId: string): boolean;

    /**
     * Met à jour le suivi d'une référence
     * @param referenceId Identifiant de la référence
     * @param position Nouvelle position
     * @returns True si l'opération a réussi
     */
    updateTracking?(referenceId: string, position: SpatialVector): boolean;

    /**
     * Arrête le suivi d'une référence
     * @param referenceId Identifiant de la référence
     * @returns True si l'opération a réussi
     */
    stopTracking?(referenceId: string): boolean;

    /**
     * Réinitialise le tracker
     */
    reset(): void;
}

/**
 * Interface pour le validateur de cohérence spatiale
 * Responsable de vérifier la cohérence des structures spatiales en LSF
 */
export interface ISpatialCoherenceValidator {
    /**
     * Valide la cohérence d'une carte spatiale
     * @param map La carte spatiale à valider
     * @returns Un rapport de cohérence
     */
    validateSpatialMap(map: SpatialMap): SpatialCoherenceReport;

    /**
     * Valide la cohérence entre deux références
     * @param reference1 La première référence
     * @param reference2 La seconde référence
     * @returns true si les références sont cohérentes, false sinon
     */
    validateReferencesCoherence(reference1: SpatialReference, reference2: SpatialReference): boolean;

    /**
     * Vérifie si une nouvelle référence peut être ajoutée de manière cohérente
     * @param map La carte spatiale existante
     * @param newReference La nouvelle référence à ajouter
     * @returns Un objet indiquant si l'ajout est cohérent et les éventuels problèmes
     */
    validateReferenceAddition(map: SpatialMap, newReference: SpatialReference): {
        isValid: boolean;
        issues: string[];
        suggestions?: SpatialVector[];
    };

    /**
     * Vérifie la cohérence des relations dans une carte spatiale
     * @param map La carte spatiale à valider
     * @returns Un objet indiquant si les relations sont cohérentes et les éventuels problèmes
     */
    validateRelationships(map: SpatialMap): {
        isValid: boolean;
        issues: string[];
    };

    /**
     * Suggère des corrections pour rendre une carte spatiale cohérente
     * @param map La carte spatiale à corriger
     * @returns Une version corrigée de la carte spatiale
     */
    suggestCoherenceCorrections(map: SpatialMap): SpatialMap;

    /**
     * Valide tous les aspects d'une carte spatiale
     * @param map La carte spatiale à valider
     * @returns Un résultat de validation
     */
    validateAll?(map: SpatialMap): {
        valid: boolean;
        issues: string[];
    };
}

/**
 * Rapport de cohérence spatiale
 */
export interface SpatialCoherenceReport {
    isCoherent: boolean;
    score: number; // Score de cohérence entre 0 et 1
    issues: SpatialCoherenceIssue[];
    recommendations: string[];
}

/**
 * Problème de cohérence spatiale
 */
export interface SpatialCoherenceIssue {
    type: 'overlap' | 'distance' | 'visibility' | 'relationship' | 'other';
    severity: 'warning' | 'error';
    message: string;
    references: string[]; // IDs des références concernées
    details?: Record<string, unknown>;
}

/**
 * Interface pour le constructeur de références
 */
export interface IReferenceBuilder {
    /**
     * Crée une nouvelle référence de type personne
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns La référence créée
     */
    createPersonReference(position: SpatialVector, properties?: Record<string, unknown>): SpatialReference;

    /**
     * Crée une nouvelle référence de type objet
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns La référence créée
     */
    createObjectReference(position: SpatialVector, properties?: Record<string, unknown>): SpatialReference;

    /**
     * Crée une nouvelle référence de type lieu
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns La référence créée
     */
    createLocationReference(position: SpatialVector, properties?: Record<string, unknown>): SpatialReference;

    /**
     * Crée une nouvelle référence de type concept
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns La référence créée
     */
    createConceptReference(position: SpatialVector, properties?: Record<string, unknown>): SpatialReference;

    /**
     * Crée une nouvelle référence de type temps
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns La référence créée
     */
    createTimeReference(position: SpatialVector, properties?: Record<string, unknown>): SpatialReference;

    /**
     * Crée une nouvelle référence personnalisée
     * @param type Type de référence
     * @param position Position dans l'espace
     * @param properties Propriétés supplémentaires
     * @returns La référence créée
     */
    createCustomReference(type: SpatialReferenceType, position: SpatialVector, properties?: Record<string, unknown>): SpatialReference;
}

/**
 * Interface pour le gestionnaire de structure spatiale
 */
export interface ISpatialStructureManager {
    /**
     * Génère une structure spatiale complète
     * @param context Contexte culturel
     * @returns Une structure spatiale générée
     */
    generateSpatialStructure(context: unknown): Promise<unknown>;

    /**
     * Analyse une structure spatiale
     * @param input Entrée LSF à analyser
     * @returns Analyse de la structure spatiale
     */
    analyzeSpatialStructure(input: unknown): Promise<unknown>;

    /**
     * Valide la cohérence d'une structure spatiale
     * @param structure Structure spatiale à valider
     * @returns Résultat de la validation
     */
    validateSpatialStructure(structure: unknown): Promise<unknown>;
}

/**
 * Interface pour le gestionnaire d'espace spatial
 */
export interface ISpatialManager {
    /**
     * Crée une nouvelle carte spatiale
     * @param topic Sujet principal de la carte
     * @param sessionId ID de la session
     * @param complexityLevel Niveau de complexité spatiale (1-5)
     */
    createSpatialMap(topic: string, sessionId: string, complexityLevel?: number): Promise<SpatialMap>;

    /**
     * Récupère une carte spatiale par ID
     * @param mapId ID de la carte
     */
    getSpatialMap(mapId: string): Promise<SpatialMap | null>;

    /**
     * Ajoute une référence à la carte spatiale
     * @param mapId ID de la carte
     * @param reference Référence à ajouter
     */
    addReference(mapId: string, reference: Partial<SpatialReference>): Promise<SpatialReference>;

    /**
     * Met à jour une référence existante
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     * @param updates Mises à jour à appliquer
     * @param options Options de mise à jour
     */
    updateReference(
        mapId: string,
        referenceId: string,
        updates: Partial<SpatialReference>,
        options?: ReferenceUpdateOptions
    ): Promise<SpatialReference>;

    /**
     * Supprime une référence de la carte
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     */
    removeReference(mapId: string, referenceId: string): Promise<boolean>;

    /**
     * Ajoute une connexion entre deux références
     * @param mapId ID de la carte
     * @param sourceId ID de la référence source
     * @param targetId ID de la référence cible
     * @param relationType Type de relation
     * @param bidirectional Si la relation est bidirectionnelle
     * @param strength Force de la relation (0-1)
     * @param properties Propriétés supplémentaires
     */
    connectReferences(
        mapId: string,
        sourceId: string,
        targetId: string,
        relationType: SpatialRelationType,
        bidirectional?: boolean,
        strength?: number,
        properties?: Record<string, unknown>
    ): Promise<SpatialConnection>;

    /**
     * Supprime une connexion entre deux références
     * @param mapId ID de la carte
     * @param connectionId ID de la connexion
     */
    disconnectReferences(mapId: string, connectionId: string): Promise<boolean>;

    /**
     * Ajoute une région spatiale à la carte
     * @param mapId ID de la carte
     * @param region Région à ajouter
     */
    addRegion(mapId: string, region: Partial<SpatialRegion>): Promise<SpatialRegion>;

    /**
     * Recherche les références proches d'un point dans l'espace
     * @param mapId ID de la carte
     * @param position Position dans l'espace
     * @param radius Rayon de recherche
     * @param type Type de référence (optionnel)
     */
    findReferencesNearPosition(
        mapId: string,
        position: Vector3D,
        radius: number,
        type?: SpatialReferenceType
    ): Promise<SpatialReference[]>;

    /**
     * Récupère les connexions d'une référence
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     * @param relationType Type de relation (optionnel)
     */
    getConnectionsForReference(
        mapId: string,
        referenceId: string,
        relationType?: SpatialRelationType
    ): Promise<SpatialConnection[]>;

    /**
     * Optimise l'espace de signation pour éviter les conflits
     * @param mapId ID de la carte
     */
    optimizeSpatialLayout(mapId: string): Promise<boolean>;

    /**
     * S'abonne aux événements d'une carte spatiale
     * @param mapId ID de la carte
     * @param callback Fonction de rappel pour les événements
     */
    subscribeSpatialEvents(
        mapId: string,
        callback: (event: SpatialReferenceEvent) => void
    ): () => void;

    /**
     * Vérifie la cohérence de la carte spatiale
     * @param mapId ID de la carte
     */
    validateSpatialCoherence(mapId: string): Promise<{
        isCoherent: boolean;
        issues: string[];
    }>;
}