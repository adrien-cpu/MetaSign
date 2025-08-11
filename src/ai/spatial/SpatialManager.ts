// src/ai/spatial/SpatialManager.ts

import {
    ISpatialManager,
    IReferenceTracker,
    ISpatialCoherenceValidator
} from '@spatial/types/interfaces/SpatialInterfaces';
import {
    SpatialMap,
    SpatialReference,
    SpatialConnection,
    SpatialRegion,
    SpatialContext,
    SpatialReferenceType,
    SpatialRelationship,  // Assurez-vous que cet import est bien présent
    SpatialRelationType,
    ReferenceUpdateOptions,
    SpatialReferenceEvent,
    SpatialEventType,
    ReferenceActivationState,
    SpatialVector
} from '@spatial/types/SpatialTypes';

// Interface pour le résultat de validation de cohérence
export interface CoherenceValidationResult {
    isCoherent: boolean;
    issues: string[];
}
import { MultiLevelCache, CacheLevel, EvictionPolicy, PreloadStrategy } from '@spatial/cache';

/**
 * Gestionnaire principal pour l'espace de signation
 * Responsable de la gestion des références spatiales et de leurs relations
 */
export class SpatialManager implements ISpatialManager {
    private maps: Map<string, SpatialMap> = new Map();
    private eventSubscribers: Map<string, Set<(event: SpatialReferenceEvent) => void>> = new Map();
    private cache: MultiLevelCache<SpatialReference | SpatialConnection | SpatialRegion>;

    /**
     * Construit un gestionnaire spatial
     * @param referenceTracker Tracker de références
     * @param coherenceValidator Validateur de cohérence
     */
    constructor(
        private readonly referenceTracker: IReferenceTracker,
        private readonly coherenceValidator: ISpatialCoherenceValidator
    ) {
        // Initialiser le cache multi-niveaux pour les performances
        this.cache = new MultiLevelCache({
            levels: {
                l1: {
                    maxSize: 500,
                    evictionPolicy: EvictionPolicy.LRU,
                    ttl: 60000 // 1 minute
                },
                l2: {
                    maxSize: 2000,
                    evictionPolicy: EvictionPolicy.LFU,
                    ttl: 300000 // 5 minutes
                },
                predictive: {
                    maxSize: 1000,
                    evictionPolicy: EvictionPolicy.ADAPTIVE,
                    ttl: 600000, // 10 minutes
                    preloadStrategy: PreloadStrategy.PATTERN
                }
            },
            metrics: {
                enabled: true,
                detailedStats: true
            }
        });
    }

    /**
     * Crée une nouvelle carte spatiale
     * @param topic Sujet principal de la carte
     * @param sessionId ID de la session
     * @param complexityLevel Niveau de complexité spatiale (1-5)
     * @returns La carte spatiale créée
     */
    public async createSpatialMap(
        topic: string,
        sessionId: string,
        complexityLevel: number = 3
    ): Promise<SpatialMap> {
        const mapId = `spatial_map_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const now = Date.now();

        // Créer le contexte avec toutes les propriétés requises
        const context: SpatialContext = {
            name: topic, // Nom est requis
            topic,
            createdAt: now,
            updatedAt: now,
            sessionId,
            complexityLevel,
            timeReference: {
                startTime: now,
                currentTime: now,
                timeScale: 1.0
            }
        };

        // Créer la nouvelle carte
        const newMap: SpatialMap = {
            id: mapId,
            references: new Map<string, SpatialReference>(),
            connections: [],
            regions: [],
            context,
            metadata: {
                createdAt: now,
                updatedAt: now,
                version: '1.0',
                statistics: {
                    referenceCount: 0,
                    connectionCount: 0,
                    activeReferenceCount: 0,
                    regionCount: 0
                }
            }
        };

        this.maps.set(mapId, newMap);
        return newMap;
    }

    /**
     * Récupère une carte spatiale par ID
     * @param mapId ID de la carte
     * @returns La carte spatiale ou null si non trouvée
     */
    public async getSpatialMap(mapId: string): Promise<SpatialMap | null> {
        return this.maps.get(mapId) || null;
    }

    /**
     * Ajoute une référence à la carte spatiale
     * @param mapId ID de la carte
     * @param referenceData Données de la référence à ajouter
     * @returns La référence ajoutée
     */
    public async addReference(
        mapId: string,
        referenceData: Partial<SpatialReference>
    ): Promise<SpatialReference> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        const now = Date.now();
        const referenceId = `ref_${now}_${Math.random().toString(36).substring(2, 9)}`;

        // Créer la référence avec toutes les propriétés nécessaires
        const newReference: SpatialReference = {
            id: referenceId,
            position: referenceData.position || { x: 0, y: 0, z: 0 },
            type: referenceData.type || SpatialReferenceType.OBJECT,
            createdAt: now,
            updatedAt: now,
            importance: referenceData.importance || 0.5,
            activationState: ReferenceActivationState.ACTIVE,
            persistenceScore: 0.5,
            properties: {}
        };

        // Ajouter les propriétés optionnelles si elles existent
        if (referenceData.orientation) {
            newReference.orientation = referenceData.orientation;
        }

        if (referenceData.size) {
            newReference.size = referenceData.size;
        }

        if (referenceData.context) {
            newReference.context = referenceData.context;
        }

        if (referenceData.properties) {
            newReference.properties = referenceData.properties;
        }

        // Ajouter à la carte
        if (map.references instanceof Map) {
            map.references.set(referenceId, newReference);
        } else {
            map.references[referenceId] = newReference;
        }

        // Mettre à jour les métadonnées
        if (map.metadata && map.metadata.statistics) {
            map.metadata.updatedAt = now;
            map.metadata.statistics.referenceCount += 1;
            map.metadata.statistics.activeReferenceCount += 1;
        }

        map.context.updatedAt = now;

        // Commencer le suivi
        this.referenceTracker.trackReference(newReference);

        // Ajouter au cache
        this.cache.set(`ref_${mapId}_${referenceId}`, newReference, CacheLevel.L1);

        // Émettre un événement
        this.emitEvent(mapId, {
            type: SpatialEventType.REFERENCE_ADDED,
            referenceId,
            timestamp: now,
            data: { reference: newReference }
        });

        return newReference;
    }

    /**
     * Met à jour une référence existante
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     * @param updates Mises à jour à appliquer
     * @param options Options de mise à jour
     * @returns La référence mise à jour
     */
    public async updateReference(
        mapId: string,
        referenceId: string,
        updates: Partial<SpatialReference>,
        options?: ReferenceUpdateOptions
    ): Promise<SpatialReference> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        const reference = map.references instanceof Map
            ? map.references.get(referenceId)
            : map.references[referenceId];

        if (!reference) {
            throw new Error(`Reference with ID ${referenceId} not found in map ${mapId}`);
        }

        const now = Date.now();

        // Créer une copie pour les modifications
        const updatedReference: SpatialReference = {
            ...reference,
            updatedAt: now
        };

        // Appliquer les mises à jour
        if (updates.position) {
            updatedReference.position = updates.position;
        }

        if (updates.orientation) {
            updatedReference.orientation = updates.orientation;
        }

        if (updates.importance !== undefined) {
            updatedReference.importance = updates.importance;
        }

        if (updates.activationState !== undefined) {
            updatedReference.activationState = updates.activationState;
        }

        if (updates.persistenceScore !== undefined) {
            updatedReference.persistenceScore = updates.persistenceScore;
        }

        if (updates.properties) {
            updatedReference.properties = {
                ...updatedReference.properties,
                ...updates.properties
            };
        }

        // Si des options sont spécifiées
        if (options) {
            if (options.reactivate && this.referenceTracker.markReferenceAsUsed) {
                // Marquer comme utilisée
                this.referenceTracker.markReferenceAsUsed(referenceId);
            }

            if (options.updatePosition && updates.position && this.referenceTracker.updateTracking) {
                // Mettre à jour la position dans le tracker
                this.referenceTracker.updateTracking(referenceId, updates.position);
            }

            if (options.enrichContext && updates.context && updatedReference.context) {
                // Fusionner les contextes au lieu de remplacer
                updatedReference.context = {
                    ...updatedReference.context,
                    ...updates.context
                };

                // Fusionner les tags sans doublons si les deux existent
                if (updatedReference.context.tags && updates.context.tags) {
                    updatedReference.context.tags = [...new Set([
                        ...updatedReference.context.tags,
                        ...updates.context.tags
                    ])];
                }
            }

            if (options.recalculateImportance) {
                // Recalculer l'importance basée sur la fraîcheur et les connections
                const connections = this.countConnectionsForReference(mapId, referenceId);
                const recency = Math.min(1, (now - reference.createdAt) / (30 * 24 * 60 * 60 * 1000)); // 30 jours max
                updatedReference.importance = 0.4 + (connections * 0.2) + (recency * 0.4);
            }
        }

        // Mettre à jour la référence dans la carte
        if (map.references instanceof Map) {
            map.references.set(referenceId, updatedReference);
        } else {
            map.references[referenceId] = updatedReference;
        }

        if (map.metadata) {
            map.metadata.updatedAt = now;
        }
        map.context.updatedAt = now;

        // Mettre à jour le cache
        this.cache.set(`ref_${mapId}_${referenceId}`, updatedReference, CacheLevel.L1);

        // Émettre un événement
        this.emitEvent(mapId, {
            type: SpatialEventType.REFERENCE_UPDATED,
            referenceId,
            timestamp: now,
            data: {
                reference: updatedReference,
                previousReference: reference
            }
        });

        return updatedReference;
    }

    /**
     * Supprime une référence de la carte
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     * @returns true si la suppression a réussi
     */
    public async removeReference(mapId: string, referenceId: string): Promise<boolean> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        const hasReference = map.references instanceof Map
            ? map.references.has(referenceId)
            : referenceId in map.references;

        if (!hasReference) {
            return false;
        }

        // Récupérer la référence avant suppression
        const reference = map.references instanceof Map
            ? map.references.get(referenceId)
            : map.references[referenceId];

        // Vérifier qu'elle existe
        if (!reference) {
            return false;
        }

        // Supprimer de la carte
        if (map.references instanceof Map) {
            map.references.delete(referenceId);
        } else {
            delete map.references[referenceId];
        }

        // Mettre à jour les statistiques
        if (map.metadata && map.metadata.statistics) {
            if (reference.activationState === ReferenceActivationState.ACTIVE) {
                map.metadata.statistics.activeReferenceCount -= 1;
            }
            map.metadata.statistics.referenceCount -= 1;
        }

        // Supprimer également toutes les connexions associées
        const initialConnectionCount = map.connections.length;
        map.connections = map.connections.filter(
            conn => conn.sourceId !== referenceId && conn.targetId !== referenceId
        );

        // Mettre à jour le compteur de connexions
        if (map.metadata && map.metadata.statistics) {
            map.metadata.statistics.connectionCount -= (initialConnectionCount - map.connections.length);
        }

        // Mettre à jour les timestamps
        const now = Date.now();
        if (map.metadata) {
            map.metadata.updatedAt = now;
        }
        map.context.updatedAt = now;

        // Arrêter le suivi
        if (this.referenceTracker.stopTracking) {
            this.referenceTracker.stopTracking(referenceId);
        } else {
            this.referenceTracker.removeReference(referenceId);
        }

        // Supprimer du cache
        this.cache.remove(`ref_${mapId}_${referenceId}`);

        // Émettre un événement
        this.emitEvent(mapId, {
            type: SpatialEventType.REFERENCE_REMOVED,
            referenceId,
            timestamp: now,
            data: { reference }
        });

        return true;
    }

    /**
     * Ajoute une connexion entre deux références
     * @param mapId ID de la carte
     * @param sourceId ID de la référence source
     * @param targetId ID de la référence cible
     * @param relationType Type de relation
     * @param bidirectional Si la relation est bidirectionnelle
     * @param strength Force de la relation (0-1)
     * @param properties Propriétés supplémentaires
     * @returns La connexion créée
     */
    public async connectReferences(
        mapId: string,
        sourceId: string,
        targetId: string,
        relationType: SpatialRelationType,
        bidirectional: boolean = false,
        strength: number = 0.7,
        properties?: Record<string, unknown>
    ): Promise<SpatialConnection> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        // Vérifier que les deux références existent
        const hasSourceRef = map.references instanceof Map
            ? map.references.has(sourceId)
            : sourceId in map.references;

        if (!hasSourceRef) {
            throw new Error(`Source reference with ID ${sourceId} not found in map ${mapId}`);
        }

        const hasTargetRef = map.references instanceof Map
            ? map.references.has(targetId)
            : targetId in map.references;

        if (!hasTargetRef) {
            throw new Error(`Target reference with ID ${targetId} not found in map ${mapId}`);
        }

        const now = Date.now();
        const connectionId = `conn_${now}_${Math.random().toString(36).substring(2, 9)}`;

        // Créer la connexion
        const connection: SpatialConnection = {
            id: connectionId,
            sourceId,
            targetId,
            relationship: relationType as unknown as SpatialRelationship,
            strength: Math.max(0, Math.min(1, strength)), // Limiter entre 0 et 1
            bidirectional,
            properties: properties || {} // Garantir que properties n'est jamais undefined
        };

        // Ajouter la connexion à la carte
        map.connections.push(connection);

        if (map.metadata && map.metadata.statistics) {
            map.metadata.statistics.connectionCount += 1;
            map.metadata.updatedAt = now;
        }

        map.context.updatedAt = now;

        // Ajouter au cache
        this.cache.set(`conn_${mapId}_${connectionId}`, connection, CacheLevel.L1);

        // Marquer les références comme récemment utilisées
        if (this.referenceTracker.markReferenceAsUsed) {
            this.referenceTracker.markReferenceAsUsed(sourceId);
            this.referenceTracker.markReferenceAsUsed(targetId);
        }

        // Mettre à jour les timestamps des références
        const sourceRef = map.references instanceof Map
            ? map.references.get(sourceId)
            : map.references[sourceId];

        const targetRef = map.references instanceof Map
            ? map.references.get(targetId)
            : map.references[targetId];

        if (sourceRef) {
            sourceRef.updatedAt = now;
            if (map.references instanceof Map) {
                map.references.set(sourceId, sourceRef);
            } else {
                map.references[sourceId] = sourceRef;
            }
        }

        if (targetRef) {
            targetRef.updatedAt = now;
            if (map.references instanceof Map) {
                map.references.set(targetId, targetRef);
            } else {
                map.references[targetId] = targetRef;
            }
        }

        // Émettre un événement
        this.emitEvent(mapId, {
            type: SpatialEventType.RELATIONSHIP_CREATED,
            referenceId: sourceId, // On utilise la source comme référence principale
            timestamp: now,
            data: {
                connection,
                sourceId,
                targetId
            }
        });

        return connection;
    }

    /**
     * Supprime une connexion entre deux références
     * @param mapId ID de la carte
     * @param connectionId ID de la connexion
     * @returns true si la suppression a réussi
     */
    public async disconnectReferences(mapId: string, connectionId: string): Promise<boolean> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        const connectionIndex = map.connections.findIndex(conn => conn.id === connectionId);
        if (connectionIndex === -1) {
            return false;
        }

        const connection = map.connections[connectionIndex];

        // Supprimer la connexion
        map.connections.splice(connectionIndex, 1);

        if (map.metadata && map.metadata.statistics) {
            map.metadata.statistics.connectionCount -= 1;
        }

        const now = Date.now();
        if (map.metadata) {
            map.metadata.updatedAt = now;
        }
        map.context.updatedAt = now;

        // Supprimer du cache
        this.cache.remove(`conn_${mapId}_${connectionId}`);

        // Émettre un événement
        this.emitEvent(mapId, {
            type: SpatialEventType.RELATIONSHIP_REMOVED,
            referenceId: connection.sourceId,
            timestamp: now,
            data: {
                connection,
                sourceId: connection.sourceId,
                targetId: connection.targetId
            }
        });

        return true;
    }

    /**
     * Ajoute une région spatiale à la carte
     * @param mapId ID de la carte
     * @param region Données de la région à ajouter
     * @returns La région créée
     */
    public async addRegion(mapId: string, region: Partial<SpatialRegion>): Promise<SpatialRegion> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        const now = Date.now();
        const regionId = `region_${now}_${Math.random().toString(36).substring(2, 9)}`;

        // Créer la région avec les propriétés requises
        const newRegion: SpatialRegion = {
            id: regionId,
            name: region.name || 'Unnamed Region',
            position: region.position || region.center || { x: 0, y: 0, z: 0 },
            radius: region.radius || 1.0,
            isActive: region.isActive !== undefined ? region.isActive : true,
            references: region.references || []
        };

        // Ajouter les propriétés optionnelles
        if (region.type) {
            newRegion.type = region.type;
        }

        if (region.semanticWeight !== undefined) {
            newRegion.semanticWeight = region.semanticWeight;
        }

        if (region.dimensions) {
            newRegion.dimensions = region.dimensions;
        }

        if (region.properties) {
            newRegion.properties = region.properties;
        }

        // Ajouter la région à la carte
        map.regions.push(newRegion);

        if (map.metadata && map.metadata.statistics) {
            map.metadata.statistics.regionCount += 1;
        }

        if (map.metadata) {
            map.metadata.updatedAt = now;
        }

        map.context.updatedAt = now;

        // Ajouter au cache
        this.cache.set(`region_${mapId}_${regionId}`, newRegion, CacheLevel.L1);

        return newRegion;
    }

    /**
     * Recherche les références proches d'un point dans l'espace
     * @param mapId ID de la carte
     * @param position Position dans l'espace
     * @param radius Rayon de recherche
     * @param type Type de référence (optionnel)
     * @returns Tableau des références proches
     */
    public async findReferencesNearPosition(
        mapId: string,
        position: SpatialVector,
        radius: number,
        type?: SpatialReferenceType
    ): Promise<SpatialReference[]> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        // Clé de cache pour la recherche
        const cacheKey = `proximity_${mapId}_${position.x}_${position.y}_${position.z}_${radius}_${type || 'all'}`;

        // Vérifier si le résultat est en cache
        const cachedResult = this.cache.get(cacheKey) as SpatialReference[] | undefined;
        if (cachedResult) {
            return cachedResult;
        }

        const result: SpatialReference[] = [];

        // Convertir Map à Array si nécessaire
        const references = map.references instanceof Map ?
            Array.from(map.references.values()) :
            Object.values(map.references);

        // Parcourir toutes les références
        for (const reference of references) {
            // Filtrer par type si spécifié
            if (type && reference.type !== type) {
                continue;
            }

            // Calculer la distance
            const distance = this.calculateDistance(position, reference.position);

            // Ajouter si la distance est inférieure au rayon
            if (distance <= radius) {
                result.push(reference);
            }
        }

        // Trier par distance croissante
        const sortedResult = result.sort((a, b) => {
            const distA = this.calculateDistance(position, a.position);
            const distB = this.calculateDistance(position, b.position);
            return distA - distB;
        });

        // Mettre en cache pour future utilisation
        // Convertir le tableau en élément unique pour satisfaire la signature
        this.cache.set(cacheKey, sortedResult as unknown as (SpatialReference | SpatialConnection | SpatialRegion), CacheLevel.L2);

        return sortedResult;
    }

    /**
     * Récupère les connexions d'une référence
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     * @param relationType Type de relation (optionnel)
     * @returns Tableau des connexions associées à la référence
     */
    public async getConnectionsForReference(
        mapId: string,
        referenceId: string,
        relationType?: SpatialRelationType
    ): Promise<SpatialConnection[]> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        // Clé de cache pour la recherche
        const cacheKey = `connections_${mapId}_${referenceId}_${relationType || 'all'}`;

        // Vérifier si le résultat est en cache
        const cachedResult = this.cache.get(cacheKey) as SpatialConnection[] | undefined;
        if (cachedResult) {
            return cachedResult;
        }

        // Filtrer les connexions
        const connections = map.connections.filter(conn =>
            (conn.sourceId === referenceId || conn.targetId === referenceId) &&
            (!relationType || (conn.relationship as unknown) === (relationType as unknown))
        );

        // Mettre en cache pour future utilisation
        // Convertir le tableau en élément unique pour satisfaire la signature
        this.cache.set(cacheKey, connections as unknown as (SpatialReference | SpatialConnection | SpatialRegion), CacheLevel.L2);

        return connections;
    }

    /**
     * Optimise l'espace de signation pour éviter les conflits
     * @param mapId ID de la carte
     * @returns true si l'optimisation a réussi
     */
    public async optimizeSpatialLayout(mapId: string): Promise<boolean> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        // Convertir Map à Array si nécessaire
        const references = map.references instanceof Map ?
            Array.from(map.references.values()) :
            Object.values(map.references);

        const repulsionFactor = 0.1;
        const minDistance = 0.5;

        // Appliquer une force de répulsion entre les références trop proches
        for (let i = 0; i < references.length; i++) {
            for (let j = i + 1; j < references.length; j++) {
                const refA = references[i];
                const refB = references[j];

                const distance = this.calculateDistance(refA.position, refB.position);

                if (distance < minDistance) {
                    // Calculer le vecteur de répulsion
                    const repulsionVector = {
                        x: refB.position.x - refA.position.x,
                        y: refB.position.y - refA.position.y,
                        z: refB.position.z - refA.position.z
                    };

                    // Normaliser
                    const magnitude = Math.sqrt(
                        repulsionVector.x * repulsionVector.x +
                        repulsionVector.y * repulsionVector.y +
                        repulsionVector.z * repulsionVector.z
                    );

                    if (magnitude > 0) {
                        const factor = (minDistance - distance) * repulsionFactor / magnitude;

                        // Appliquer la répulsion à B (éloigner)
                        refB.position.x += repulsionVector.x * factor;
                        refB.position.y += repulsionVector.y * factor;
                        refB.position.z += repulsionVector.z * factor;

                        // Appliquer la répulsion inverse à A (rapprocher)
                        refA.position.x -= repulsionVector.x * factor;
                        refA.position.y -= repulsionVector.y * factor;
                        refA.position.z -= repulsionVector.z * factor;

                        // Mettre à jour les références
                        if (map.references instanceof Map) {
                            map.references.set(refA.id, refA);
                            map.references.set(refB.id, refB);
                        } else {
                            map.references[refA.id] = refA;
                            map.references[refB.id] = refB;
                        }

                        // Mettre à jour le cache
                        this.cache.set(`ref_${mapId}_${refA.id}`, refA, CacheLevel.L1);
                        this.cache.set(`ref_${mapId}_${refB.id}`, refB, CacheLevel.L1);
                    }
                }
            }
        }

        const now = Date.now();
        if (map.metadata) {
            map.metadata.updatedAt = now;
        }
        map.context.updatedAt = now;

        return true;
    }

    /**
     * S'abonne aux événements d'une carte spatiale
     * @param mapId ID de la carte
     * @param callback Fonction de rappel pour les événements
     * @returns Fonction pour se désabonner
     */
    public subscribeSpatialEvents(
        mapId: string,
        callback: (event: SpatialReferenceEvent) => void
    ): () => void {
        if (!this.eventSubscribers.has(mapId)) {
            this.eventSubscribers.set(mapId, new Set());
        }

        const subscribers = this.eventSubscribers.get(mapId);
        if (subscribers) {
            subscribers.add(callback);
        }

        // Retourner une fonction pour se désabonner
        return () => {
            const subs = this.eventSubscribers.get(mapId);
            if (subs) {
                subs.delete(callback);
                if (subs.size === 0) {
                    this.eventSubscribers.delete(mapId);
                }
            }
        };
    }

    // Ajoutez cette propriété à la classe SpatialManager
    private validationCache = new Map<string, CoherenceValidationResult>();

    /**
     * Vérifie la cohérence de la carte spatiale
     * @param mapId ID de la carte
     * @returns Résultat de la validation de cohérence
     */
    public async validateSpatialCoherence(mapId: string): Promise<CoherenceValidationResult> {
        const map = this.maps.get(mapId);
        if (!map) {
            throw new Error(`Spatial map with ID ${mapId} not found`);
        }

        // Clé de cache pour la validation
        const cacheKey = `coherence_${mapId}_${map.metadata ? map.metadata.updatedAt : 0}`;

        // Vérifier d'abord dans le cache dédié aux validations
        const cachedValidationResult = this.validationCache.get(cacheKey);
        if (cachedValidationResult) {
            return cachedValidationResult;
        }

        // Utiliser le validateur de cohérence
        let result;
        if (this.coherenceValidator.validateAll) {
            result = this.coherenceValidator.validateAll(map);
            // Adapter le résultat au format attendu
            result = {
                isCoherent: result.valid,
                issues: result.issues
            };
        } else {
            const report = this.coherenceValidator.validateSpatialMap(map);
            result = {
                isCoherent: report.isCoherent,
                issues: report.issues.map(issue => issue.message)
            };
        }

        const validationResult: CoherenceValidationResult = {
            isCoherent: result.isCoherent,
            issues: result.issues
        };

        // Mettre en cache pour future utilisation (utiliser le cache dédié)
        this.validationCache.set(cacheKey, validationResult);

        return validationResult;
    }

    /**
     * Récupère des statistiques sur le cache
     * @returns Statistiques du cache
     */
    public getCacheStats(): Record<string, unknown> {
        // Convertir les statistiques de cache en Record<string, unknown>
        const stats = this.cache.getStats();
        return { ...stats } as Record<string, unknown>;
    }

    /**
     * Vide le cache
     */
    public clearCache(): void {
        this.cache.clear();
    }

    // Méthodes privées

    /**
     * Émet un événement aux abonnés
     * @param mapId ID de la carte
     * @param event Événement à émettre
     */
    private emitEvent(mapId: string, event: SpatialReferenceEvent): void {
        const subscribers = this.eventSubscribers.get(mapId);
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in spatial event subscriber:', error);
                }
            });
        }
    }

    /**
     * Calcule la distance entre deux points 3D
     * @param a Premier point
     * @param b Second point
     * @returns Distance entre les deux points
     */
    private calculateDistance(a: SpatialVector, b: SpatialVector): number {
        return Math.sqrt(
            Math.pow(b.x - a.x, 2) +
            Math.pow(b.y - a.y, 2) +
            Math.pow(b.z - a.z, 2)
        );
    }

    /**
     * Compte le nombre de connexions pour une référence
     * @param mapId ID de la carte
     * @param referenceId ID de la référence
     * @returns Nombre de connexions
     */
    private countConnectionsForReference(mapId: string, referenceId: string): number {
        const map = this.maps.get(mapId);
        if (!map) {
            return 0;
        }

        return map.connections.filter(
            conn => conn.sourceId === referenceId || conn.targetId === referenceId
        ).length;
    }
}