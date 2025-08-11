import {
    SpatialVector,
    SigningSpaceReference,
    SigningZoneType,
    SpatialRelation,
    SpatialTransformation
} from '@spatial/types';
import { ReferenceBuilder } from '@spatial/reference/ReferenceBuilder';
import { ReferenceTracker } from '@spatial/reference/ReferenceTracker';
import { SpatialCoherenceValidator } from '@spatial/validation/SpatialCoherenceValidator';
import { Logger } from '@/ai/utils/Logger';
import { ISystemComponents, SystemComponentType, SystemComponentStatus, ComponentMetrics, ComponentCapabilities } from '@/ai/coordinators/interfaces/ISystemComponents';

/**
 * Interface pour les options de configuration du gestionnaire d'espace
 */
export interface SpatialManagerConfig {
    /** Nombre maximum de références actives simultanément */
    maxActiveReferences?: number;
    /** Facteur de décroissance des références (0-1) */
    referenceDecayFactor?: number;
    /** Force par défaut des références nouvellement créées (0-1) */
    defaultReferenceStrength?: number;
    /** Taille maximale du cache */
    cacheSize?: number;
    /** Durée de vie des éléments en cache (ms) */
    cacheTTL?: number;
    /** Active la validation stricte des cohérences spatiales */
    strictValidation?: boolean;
}

/**
 * Interface pour les entrées du cache spatial
 */
interface SpatialCacheEntry<T> {
    /** Données mises en cache */
    data: T;
    /** Timestamp de création */
    createdAt: number;
    /** Timestamp d'expiration */
    expiresAt: number;
    /** Nombre d'accès */
    hits: number;
}

/**
 * Type d'événement de l'espace spatial
 */
export enum SpatialEventType {
    REFERENCE_CREATED = 'reference_created',
    REFERENCE_UPDATED = 'reference_updated',
    REFERENCE_EXPIRED = 'reference_expired',
    REFERENCE_USED = 'reference_used',
    ZONE_CONFLICT = 'zone_conflict',
    COHERENCE_ERROR = 'coherence_error'
}

/**
 * Résultat d'une opération spatiale
 */
export interface SpatialOperationResult<T = unknown> {
    /** Succès de l'opération */
    success: boolean;
    /** Données résultantes si succès */
    data?: T;
    /** Message d'erreur si échec */
    error?: string;
    /** Avertissements (même en cas de succès) */
    warnings?: string[];
}

/**
 * Statistiques de performance du gestionnaire spatial
 */
export interface SpatialManagerStats {
    /** Nombre de références actives */
    activeReferences: number;
    /** Nombre total de références créées */
    totalReferencesCreated: number;
    /** Nombre total de références transformées */
    totalReferencesTransformed: number;
    /** Taille du cache */
    cacheSize: number;
    /** Ratio d'utilisation du cache (hits/total) */
    cacheHitRatio: number;
    /** Utilisation mémoire estimée (en octets) */
    estimatedMemoryUsage: number;
    /** Nombre de validations de cohérence effectuées */
    coherenceValidations: number;
    /** Taux de succès des validations de cohérence */
    coherenceSuccessRate: number;
}

/**
 * Gestionnaire de l'espace spatial pour la LSF
 * 
 * Cette classe est responsable de la gestion de l'espace de signation,
 * des références spatiales, et de la cohérence spatiale des signes.
 */
export class GestionEspaceSpatial implements ISystemComponents {
    public readonly id = 'gestionEspaceSpatial';
    public readonly type = SystemComponentType.SPATIAL;
    public readonly version = '2.1.0';

    private static instance: GestionEspaceSpatial;
    private logger: Logger;
    private status: SystemComponentStatus = SystemComponentStatus.INITIALIZING;

    // Composants de gestion des références
    private referenceBuilder: ReferenceBuilder;
    private referenceTracker: ReferenceTracker;
    private coherenceValidator: SpatialCoherenceValidator;

    // Espace de signation actuel
    private activeReferences: Map<string, SigningSpaceReference>;
    private activeZones: Map<SigningZoneType, Array<SigningSpaceReference>>;
    private spatialRelations: Map<string, SpatialRelation[]>;

    // Systèmes de cache
    private referenceCache: Map<string, SpatialCacheEntry<SigningSpaceReference>>;
    private validationCache: Map<string, SpatialCacheEntry<boolean>>;

    // Métriques et événements
    private metrics = {
        referencesCreated: 0,
        referencesUpdated: 0,
        referencesTransformed: 0,
        validationRequests: 0,
        validationSuccesses: 0,
        relationshipsCreated: 0,
        cacheHits: 0,
        cacheMisses: 0,
        processingTime: 0,
        errorCount: 0,
        requestCount: 0
    };

    // Événements
    private eventListeners: Map<SpatialEventType, Array<(data: unknown) => void>> = new Map();

    // Configuration
    private config: Required<SpatialManagerConfig>;

    // Options par défaut
    private static readonly DEFAULT_CONFIG: Required<SpatialManagerConfig> = {
        maxActiveReferences: 12,
        referenceDecayFactor: 0.9,
        defaultReferenceStrength: 1.0,
        cacheSize: 500,
        cacheTTL: 60000, // 1 minute
        strictValidation: true
    };

    /**
     * Constructeur privé pour implémentation en singleton
     */
    private constructor(config: SpatialManagerConfig = {}) {
        this.config = { ...GestionEspaceSpatial.DEFAULT_CONFIG, ...config };
        this.logger = new Logger('GestionEspaceSpatial');

        this.referenceBuilder = new ReferenceBuilder();
        this.referenceTracker = new ReferenceTracker();
        this.coherenceValidator = new SpatialCoherenceValidator();

        this.activeReferences = new Map();
        this.activeZones = new Map();
        this.spatialRelations = new Map();
        this.referenceCache = new Map();
        this.validationCache = new Map();

        // Initialiser les zones
        Object.values(SigningZoneType).forEach(zone => {
            this.activeZones.set(zone, []);
        });

        // Démarrage du nettoyage périodique du cache
        setInterval(() => this.cleanupCache(), Math.floor(this.config.cacheTTL / 2));

        // Démarrage de la décroissance périodique des références
        setInterval(() => this.applyReferenceDecay(), 60000); // Toutes les minutes

        this.status = SystemComponentStatus.READY;
        this.logger.info('GestionEspaceSpatial initialized');
    }

    /**
     * Obtenir l'instance unique du gestionnaire d'espace spatial (Singleton)
     */
    public static getInstance(config?: SpatialManagerConfig): GestionEspaceSpatial {
        if (!GestionEspaceSpatial.instance) {
            GestionEspaceSpatial.instance = new GestionEspaceSpatial(config);
        } else if (config) {
            GestionEspaceSpatial.instance.configure(config);
        }
        return GestionEspaceSpatial.instance;
    }

    /**
     * Initialise le composant selon l'interface ISystemComponents
     * @param config Configuration initiale
     */
    public async initialize(config?: SpatialManagerConfig): Promise<void> {
        this.status = SystemComponentStatus.INITIALIZING;

        if (config) {
            this.configure(config);
        }

        try {
            // Initialisation des sous-composants
            await Promise.all([
                this.referenceTracker.initialize?.(),
                this.coherenceValidator.initialize?.()
            ]);

            this.status = SystemComponentStatus.READY;
            this.logger.info('GestionEspaceSpatial initialized successfully');
        } catch (error) {
            this.status = SystemComponentStatus.ERROR;
            this.logger.error('Failed to initialize GestionEspaceSpatial', error);
            throw error;
        }
    }

    /**
     * Configure les paramètres du gestionnaire
     * @param params Paramètres de configuration
     */
    public configure(params: SpatialManagerConfig): void {
        if (params.maxActiveReferences !== undefined) {
            this.config.maxActiveReferences = params.maxActiveReferences;
        }

        if (params.referenceDecayFactor !== undefined) {
            this.config.referenceDecayFactor = Math.max(0, Math.min(1, params.referenceDecayFactor));
        }

        if (params.defaultReferenceStrength !== undefined) {
            this.config.defaultReferenceStrength = Math.max(0, Math.min(1, params.defaultReferenceStrength));
        }

        if (params.cacheSize !== undefined) {
            this.config.cacheSize = params.cacheSize;
        }

        if (params.cacheTTL !== undefined) {
            this.config.cacheTTL = params.cacheTTL;
        }

        if (params.strictValidation !== undefined) {
            this.config.strictValidation = params.strictValidation;
        }

        this.logger.info('Spatial manager configured', {
            maxActiveReferences: this.config.maxActiveReferences,
            referenceDecayFactor: this.config.referenceDecayFactor,
            defaultReferenceStrength: this.config.defaultReferenceStrength,
            cacheSize: this.config.cacheSize,
            cacheTTL: this.config.cacheTTL,
            strictValidation: this.config.strictValidation
        });
    }

    /**
     * Traite les données selon l'interface ISystemComponents
     * @param data Données à traiter
     * @returns Résultat du traitement
     */
    public async process<TInput = unknown, TOutput = unknown>(data: TInput): Promise<TOutput> {
        const startTime = performance.now();
        this.status = SystemComponentStatus.PROCESSING;
        this.metrics.requestCount++;

        try {
            // Vérification du type de données
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid input data: expected object');
            }

            // Détection du type d'opération
            const request = data as Record<string, unknown>;
            let result: unknown;

            switch (request.operation as string) {
                case 'createReference':
                    result = this.createReference(
                        request.referentId as string,
                        request.referentType as string,
                        request.position as SpatialVector,
                        request.options as { initialStrength?: number; zoneType?: SigningZoneType }
                    );
                    break;

                case 'useReference':
                    result = this.useReference(
                        request.referentId as string,
                        request.strengthDelta as number
                    );
                    break;

                case 'transformReference':
                    result = this.transformReference(
                        request.referentId as string,
                        request.transformation as SpatialTransformation
                    );
                    break;

                case 'establishRelation':
                    result = this.establishRelation(
                        request.sourceId as string,
                        request.targetId as string,
                        request.relationType as string
                    );
                    break;

                case 'validateSpatialCoherence':
                    result = await this.validateSpatialCoherence(
                        request.signSequence as Array<{
                            id: string;
                            references?: string[];
                            positions?: SpatialVector[];
                        }>
                    );
                    break;

                case 'getReferencesInZone':
                    result = this.getReferencesInZone(
                        request.zoneType as SigningZoneType,
                        request.filter as ((ref: SigningSpaceReference) => boolean)
                    );
                    break;

                case 'getAllReferences':
                    result = this.getAllReferences();
                    break;

                case 'resetSigningSpace':
                    this.resetSigningSpace();
                    result = { success: true };
                    break;

                default:
                    throw new Error(`Unknown operation: ${request.operation}`);
            }

            // Mise à jour des métriques
            const processingTime = performance.now() - startTime;
            this.metrics.processingTime += processingTime;

            this.status = SystemComponentStatus.READY;
            return result as TOutput;
        } catch (error) {
            this.metrics.errorCount++;
            this.status = SystemComponentStatus.ERROR;

            this.logger.error('Error processing spatial data', error);

            // Retour à l'état prêt après une erreur
            setTimeout(() => {
                this.status = SystemComponentStatus.READY;
            }, 100);

            throw error;
        }
    }

    /**
     * Crée une nouvelle référence dans l'espace de signation
     * @param referentId ID du référent
     * @param referentType Type du référent
     * @param position Position dans l'espace
     * @param options Options additionnelles
     */
    public createReference(
        referentId: string,
        referentType: string,
        position: SpatialVector,
        options: {
            initialStrength?: number;
            zoneType?: SigningZoneType;
        } = {}
    ): SigningSpaceReference {
        this.metrics.referencesCreated++;

        // Vérifier si l'espace est déjà à sa capacité maximale
        if (this.activeReferences.size >= this.config.maxActiveReferences) {
            this.cleanupOldReferences();
        }

        // Déterminer la zone automatiquement si non spécifiée
        const zoneType = options.zoneType || this.determineZoneType(position);

        // Créer la référence
        const reference: SigningSpaceReference = {
            referentId,
            referentType,
            position,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            strength: options.initialStrength || this.config.defaultReferenceStrength
        };

        // Ajouter aux références actives
        this.activeReferences.set(referentId, reference);

        // Ajouter à la zone appropriée
        const zoneReferences = this.activeZones.get(zoneType) || [];
        zoneReferences.push(reference);
        this.activeZones.set(zoneType, zoneReferences);

        // Notifier le référence tracker
        this.referenceTracker.registerReference(reference);

        // Mettre en cache
        this.cacheReference(referentId, reference);

        // Émettre l'événement
        this.emitEvent(SpatialEventType.REFERENCE_CREATED, reference);

        this.logger.info('Spatial reference created', {
            referentId,
            referentType,
            zoneType
        });

        return reference;
    }

    /**
     * Détermine automatiquement le type de zone pour une position
     * @param position Position dans l'espace de signation
     */
    private determineZoneType(position: SpatialVector): SigningZoneType {
        // Logique simplifiée pour déterminer la zone en fonction des coordonnées

        // Déterminer si la position est proche ou loin du corps
        const isProximal = Math.abs(position.z) < 0.3;

        if (position.y > 0.3) {
            return SigningZoneType.UPPER;
        } else if (position.y < -0.3) {
            return SigningZoneType.LOWER;
        } else if (position.x > 0.3) {
            return SigningZoneType.RIGHT;
        } else if (position.x < -0.3) {
            return SigningZoneType.LEFT;
        } else if (isProximal) {
            return SigningZoneType.PROXIMAL;
        } else {
            return SigningZoneType.DISTAL;
        }
    }

    /**
     * Supprime les références les plus anciennes ou les plus faibles
     */
    private cleanupOldReferences(): void {
        // Collecte des références avec leurs scores
        const referenceScores: Array<{ id: string; score: number }> = [];

        this.activeReferences.forEach((reference, id) => {
            // Le score combine la force et l'ancienneté de la référence
            const ageScore = (Date.now() - reference.lastUsed) / 1000 / 60; // Minutes depuis la dernière utilisation
            const score = reference.strength - (ageScore * 0.01); // Diminuer le score avec le temps

            referenceScores.push({ id, score });
        });

        // Trier par score croissant (les plus faibles d'abord)
        referenceScores.sort((a, b) => a.score - b.score);

        // Nombre de références à supprimer
        const removeCount = Math.max(1, Math.ceil(this.activeReferences.size * 0.2)); // Au moins 1, max 20%

        // Supprimer les références avec les scores les plus bas
        for (let i = 0; i < removeCount && i < referenceScores.length; i++) {
            const { id } = referenceScores[i];
            const reference = this.activeReferences.get(id);

            if (reference) {
                this.removeReference(id);
                this.logger.info('Spatial reference removed due to cleanup', { referentId: id });
            }
        }
    }

    /**
     * Utilise une référence existante, mettant à jour son timestamp et sa force
     * @param referentId ID du référent
     * @param strengthDelta Changement de force (optionnel)
     */
    public useReference(referentId: string, strengthDelta: number = 0): SigningSpaceReference | null {
        // Vérifier le cache d'abord
        const cachedReference = this.getCachedReference(referentId);
        if (cachedReference) {
            // Mettre à jour directement dans le cache
            cachedReference.lastUsed = Date.now();
            cachedReference.strength = Math.max(0, Math.min(1, cachedReference.strength + strengthDelta));

            // Mettre à jour aussi dans la mémoire principale
            this.activeReferences.set(referentId, cachedReference);

            // Notifier le référence tracker
            this.referenceTracker.updateReference(cachedReference);

            // Émettre l'événement
            this.emitEvent(SpatialEventType.REFERENCE_USED, cachedReference);

            return cachedReference;
        }

        // Si pas dans le cache, chercher dans les références actives
        const reference = this.activeReferences.get(referentId);

        if (!reference) {
            return null;
        }

        // Mettre à jour le timestamp et la force
        reference.lastUsed = Date.now();
        reference.strength = Math.max(0, Math.min(1, reference.strength + strengthDelta));

        // Notifier le référence tracker
        this.referenceTracker.updateReference(reference);

        // Mettre à jour le cache
        this.cacheReference(referentId, reference);

        // Émettre l'événement
        this.emitEvent(SpatialEventType.REFERENCE_USED, reference);

        return reference;
    }

    /**
     * Supprime une référence existante
     * @param referentId ID du référent à supprimer
     * @returns Succès de l'opération
     */
    public removeReference(referentId: string): boolean {
        const reference = this.activeReferences.get(referentId);

        if (!reference) {
            return false;
        }

        // Supprimer de la liste des références actives
        this.activeReferences.delete(referentId);

        // Supprimer des zones
        for (const [zoneType, references] of this.activeZones.entries()) {
            const filteredReferences = references.filter(ref => ref.referentId !== referentId);
            this.activeZones.set(zoneType, filteredReferences);
        }

        // Supprimer les relations
        this.spatialRelations.delete(referentId);

        // Supprimer du cache
        this.referenceCache.delete(referentId);

        // Notifier le référence tracker
        this.referenceTracker.unregisterReference(reference);

        // Émettre l'événement
        this.emitEvent(SpatialEventType.REFERENCE_EXPIRED, { referentId });

        return true;
    }

    /**
     * Recherche des références dans une zone spécifique
     * @param zoneType Type de zone
     * @param filter Filtre optionnel pour les références
     */
    public getReferencesInZone(
        zoneType: SigningZoneType,
        filter?: (ref: SigningSpaceReference) => boolean
    ): SigningSpaceReference[] {
        const zoneReferences = this.activeZones.get(zoneType) || [];

        if (!filter) {
            return [...zoneReferences];
        }

        return zoneReferences.filter(filter);
    }

    /**
     * Établit une relation spatiale entre deux références
     * @param sourceId ID de la référence source
     * @param targetId ID de la référence cible
     * @param relationType Type de relation
     */
    public establishRelation(
        sourceId: string,
        targetId: string,
        relationType: string
    ): SpatialRelation | null {
        this.metrics.relationshipsCreated++;

        const sourceRef = this.activeReferences.get(sourceId);
        const targetRef = this.activeReferences.get(targetId);

        if (!sourceRef || !targetRef) {
            return null;
        }

        // Calculer le vecteur entre la source et la cible
        const vector: SpatialVector = {
            x: targetRef.position.x - sourceRef.position.x,
            y: targetRef.position.y - sourceRef.position.y,
            z: targetRef.position.z - sourceRef.position.z
        };

        // Créer la relation
        const relation: SpatialRelation = {
            sourceId,
            targetId,
            relationType,
            strength: Math.min(sourceRef.strength, targetRef.strength),
            vector
        };

        // Ajouter aux relations pour chaque référent
        const sourceRelations = this.spatialRelations.get(sourceId) || [];
        sourceRelations.push(relation);
        this.spatialRelations.set(sourceId, sourceRelations);

        const targetRelations = this.spatialRelations.get(targetId) || [];
        targetRelations.push(relation);
        this.spatialRelations.set(targetId, targetRelations);

        this.logger.info('Spatial relation established', {
            sourceId,
            targetId,
            relationType
        });

        return relation;
    }

    /**
     * Vérifie la cohérence spatiale d'une séquence de signes
     * @param signSequence Séquence de signes à vérifier
     */
    public async validateSpatialCoherence(
        signSequence: Array<{
            id: string;
            references?: string[];
            positions?: SpatialVector[];
        }>
    ): Promise<{
        isCoherent: boolean;
        issues: Array<{
            signId: string;
            issueType: string;
            description: string;
            severity: 'low' | 'medium' | 'high';
        }>;
    }> {
        this.metrics.validationRequests++;

        // Vérifier le cache pour cette séquence spécifique
        const cacheKey = this.generateValidationCacheKey(signSequence);
        const cachedResult = this.getCachedValidation(cacheKey);

        if (cachedResult !== null) {
            this.metrics.cacheHits++;

            if (cachedResult) {
                this.metrics.validationSuccesses++;
                return {
                    isCoherent: true,
                    issues: []
                };
            } else {
                // Si nous avons un résultat négatif en cache, nous devons
                // quand même faire la validation complète pour obtenir les problèmes
                this.metrics.cacheMisses++;
            }
        } else {
            this.metrics.cacheMisses++;
        }

        try {
            const validationResult = await this.coherenceValidator.validateSequence(
                signSequence,
                {
                    activeReferences: Array.from(this.activeReferences.values()),
                    spatialRelations: this.getAllRelations()
                }
            );

            this.logger.info('Spatial coherence validation completed', {
                isCoherent: validationResult.isCoherent,
                issueCount: validationResult.issues.length
            });

            // Mettre en cache le résultat
            this.cacheValidation(cacheKey, validationResult.isCoherent);

            // Mettre à jour les métriques
            if (validationResult.isCoherent) {
                this.metrics.validationSuccesses++;
            }

            return validationResult;
        } catch (error) {
            this.logger.error('Error during spatial coherence validation', { error });

            // Émettre l'événement d'erreur
            this.emitEvent(SpatialEventType.COHERENCE_ERROR, {
                error,
                signSequence
            });

            return {
                isCoherent: false,
                issues: [{
                    signId: 'validation_system',
                    issueType: 'system_error',
                    description: error instanceof Error ? error.message : String(error),
                    severity: 'high'
                }]
            };
        }
    }

    /**
     * Maintient la cohérence des références en diminuant progressivement leur force
     */
    public applyReferenceDecay(): void {
        this.activeReferences.forEach((reference, id) => {
            // Calculer le temps écoulé depuis la dernière utilisation (en minutes)
            const minutesSinceLastUse = (Date.now() - reference.lastUsed) / (1000 * 60);

            // Appliquer la décroissance exponentielle
            const decayFactor = Math.pow(this.config.referenceDecayFactor, minutesSinceLastUse);
            const newStrength = reference.strength * decayFactor;

            // Mettre à jour la force
            reference.strength = newStrength;

            // Si la force tombe en dessous d'un seuil, considérer la suppression
            if (newStrength < 0.1) {
                // Marquer pour suppression potentielle
                this.logger.debug('Reference marked for potential removal due to decay', {
                    referentId: id,
                    strength: newStrength
                });
            }
        });
    }

    /**
     * Applique une transformation à une référence existante
     * @param referentId ID du référent
     * @param transformation Transformation à appliquer
     */
    public transformReference(
        referentId: string,
        transformation: SpatialTransformation
    ): SigningSpaceReference | null {
        this.metrics.referencesTransformed++;

        const reference = this.activeReferences.get(referentId);

        if (!reference) {
            return null;
        }

        // Copier la position actuelle
        const newPosition: SpatialVector = { ...reference.position };

        // Appliquer la translation si présente
        if (transformation.translation) {
            newPosition.x += transformation.translation.x;
            newPosition.y += transformation.translation.y;
            newPosition.z += transformation.translation.z;
        }

        // Appliquer l'échelle si présente
        if (transformation.scale) {
            newPosition.x *= transformation.scale.x;
            newPosition.y *= transformation.scale.y;
            newPosition.z *= transformation.scale.z;
        }

        // Appliquer la rotation si présente (simplifié)
        if (transformation.rotation) {
            // Note: Une implémentation complète de rotation 3D nécessiterait
            // des matrices de rotation ou des quaternions

            // Exemple simplifié pour la rotation autour de l'axe Y
            if (transformation.rotation.y !== 0) {
                const angleRad = (transformation.rotation.y * Math.PI) / 180;
                const cosAngle = Math.cos(angleRad);
                const sinAngle = Math.sin(angleRad);

                const oldX = newPosition.x;
                const oldZ = newPosition.z;

                newPosition.x = oldX * cosAngle - oldZ * sinAngle;
                newPosition.z = oldX * sinAngle + oldZ * cosAngle;
            }
        }

        // Mettre à jour la position
        reference.position = newPosition;

        // Mettre à jour le timestamp
        reference.lastUsed = Date.now();

        // Déterminer la nouvelle zone
        const newZoneType = this.determineZoneType(newPosition);

        // Mettre à jour les zones si nécessaire
        for (const [zoneType, references] of this.activeZones.entries()) {
            if (zoneType === newZoneType) {
                // Ajouter à la nouvelle zone si pas déjà présent
                if (!references.some(ref => ref.referentId === referentId)) {
                    references.push(reference);
                }
            } else {
                // Retirer des autres zones
                const filteredReferences = references.filter(ref => ref.referentId !== referentId);
                this.activeZones.set(zoneType, filteredReferences);
            }
        }

        // Notifier le référence tracker
        this.referenceTracker.updateReference(reference);

        // Mettre à jour le cache
        this.cacheReference(referentId, reference);

        // Émettre l'événement
        this.emitEvent(SpatialEventType.REFERENCE_UPDATED, reference);

        this.logger.info('Spatial reference transformed', {
            referentId,
            newZoneType
        });

        return reference;
    }

    /**
     * Réinitialise l'espace de signation
     */
    public resetSigningSpace(): void {
        this.activeReferences.clear();

        // Réinitialiser les zones
        Object.values(SigningZoneType).forEach(zone => {
            this.activeZones.set(zone, []);
        });

        this.spatialRelations.clear();

        // Nettoyer les caches
        this.referenceCache.clear();
        this.validationCache.clear();

        // Notifier le référence tracker
        this.referenceTracker.resetTracking();

        this.logger.info('Signing space reset');
    }

    /**
     * Obtient toutes les références actives
     */
    public getAllReferences(): SigningSpaceReference[] {
        return Array.from(this.activeReferences.values());
    }

    /**
     * Obtient toutes les relations spatiales
     */
    public getAllRelations(): SpatialRelation[] {
        return Array.from(this.spatialRelations.values()).flat();
    }

    /**
     * Obtient l'occupation des zones
     */
    public getZoneOccupation(): Record<string, number> {
        const result: Record<string, number> = {};

        for (const [zoneType, references] of this.activeZones.entries()) {
            result[zoneType] = references.length;
        }

        return result;
    }

    /**
     * Récupère l'état actuel du composant
     * @returns État du composant
     */
    public getStatus(): SystemComponentStatus {
        return this.status;
    }

    /**
     * Récupère les métriques de performance du composant
     * @returns Métriques du composant
     */
    public getMetrics(): ComponentMetrics {
        // Calculer le ratio d'utilisation du cache
        const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
        const cacheHitRatio = totalCacheRequests > 0
            ? this.metrics.cacheHits / totalCacheRequests
            : 0;

        // Calculer le taux d'erreur
        const errorRate = this.metrics.requestCount > 0
            ? (this.metrics.errorCount / this.metrics.requestCount) * 100
            : 0;

        // Calculer le temps de réponse moyen
        const averageResponseTime = this.metrics.requestCount > 0
            ? this.metrics.processingTime / this.metrics.requestCount
            : 0;

        return {
            averageResponseTime,
            errorRate,
            callCount: this.metrics.requestCount,
            memoryUsage: this.estimateMemoryUsage() / (1024 * 1024), // En Mo
            custom: {
                referencesCreated: this.metrics.referencesCreated,
                referencesTransformed: this.metrics.referencesTransformed,
                cacheHitRatio,
                validationRequestCount: this.metrics.validationRequests,
                coherenceSuccessRate: this.metrics.validationRequests > 0
                    ? (this.metrics.validationSuccesses / this.metrics.validationRequests) * 100
                    : 100,
                activeReferences: this.activeReferences.size
            }
        };
    }

    /**
     * Récupère les capacités du composant
     * @returns Capacités du composant
     */
    public getCapabilities(): ComponentCapabilities {
        return {
            inputTypes: ['spatialRequest', 'spatialReference', 'coherenceValidation'],
            outputTypes: ['spatialReference', 'spatialRelation', 'validationResult'],
            features: [
                'referenceTracking',
                'spatialCoherenceValidation',
                'zoneManagement',
                'referenceDecay',
                'spatialTransformation'
            ],
            parallelProcessing: true,
            rateLimit: 1000 // 1000 opérations par seconde
        };
    }

    /**
     * Estime l'utilisation mémoire du composant
     * @returns Taille estimée en octets
     * @private
     */
    private estimateMemoryUsage(): number {
        // Estimation pour les références actives
        const activeReferencesSize = this.activeReferences.size * 250; // ~250 octets par référence

        // Estimation pour les zones
        let zonesSize = 0;
        for (const [, references] of this.activeZones.entries()) {
            zonesSize += references.length * 20; // ~20 octets par référence dans les zones (pointeurs)
        }

        // Estimation pour les relations
        let relationsSize = 0;
        for (const [, relations] of this.spatialRelations.entries()) {
            relationsSize += relations.length * 120; // ~120 octets par relation
        }

        // Estimation pour les caches
        const referencesCacheSize = this.referenceCache.size * 300; // ~300 octets par entrée
        const validationCacheSize = this.validationCache.size * 100; // ~100 octets par entrée

        return activeReferencesSize + zonesSize + relationsSize + referencesCacheSize + validationCacheSize;
    }

    /**
     * Obtient des statistiques détaillées sur le fonctionnement du composant
     * @returns Statistiques
     */
    public getStatistics(): SpatialManagerStats {
        const totalCacheLookups = this.metrics.cacheHits + this.metrics.cacheMisses;
        const cacheHitRatio = totalCacheLookups > 0 ? this.metrics.cacheHits / totalCacheLookups : 0;

        return {
            activeReferences: this.activeReferences.size,
            totalReferencesCreated: this.metrics.referencesCreated,
            totalReferencesTransformed: this.metrics.referencesTransformed,
            cacheSize: this.referenceCache.size + this.validationCache.size,
            cacheHitRatio,
            estimatedMemoryUsage: this.estimateMemoryUsage(),
            coherenceValidations: this.metrics.validationRequests,
            coherenceSuccessRate: this.metrics.validationRequests > 0
                ? (this.metrics.validationSuccesses / this.metrics.validationRequests) * 100
                : 100
        };
    }

    /**
     * S'abonne à un événement spatial
     * @param eventType Type d'événement
     * @param listener Fonction d'écoute
     * @returns Fonction pour se désabonner
     */
    public on(eventType: SpatialEventType, listener: (data: unknown) => void): () => void {
        const listeners = this.eventListeners.get(eventType) || [];
        listeners.push(listener);
        this.eventListeners.set(eventType, listeners);

        return () => {
            const updatedListeners = this.eventListeners.get(eventType) || [];
            const index = updatedListeners.indexOf(listener);
            if (index !== -1) {
                updatedListeners.splice(index, 1);
                this.eventListeners.set(eventType, updatedListeners);
            }
        };
    }

    /**
     * Émet un événement aux écouteurs enregistrés
     * @param eventType Type d'événement
     * @param data Données de l'événement
     * @private
     */
    private emitEvent(eventType: SpatialEventType, data: unknown): void {
        const listeners = this.eventListeners.get(eventType) || [];

        for (const listener of listeners) {
            try {
                listener(data);
            } catch (error) {
                this.logger.error(`Error in event listener for ${eventType}`, error);
            }
        }
    }

    /**
     * Met une référence en cache
     * @param referentId ID de la référence
     * @param reference Référence à mettre en cache
     * @private
     */
    private cacheReference(referentId: string, reference: SigningSpaceReference): void {
        const entry: SpatialCacheEntry<SigningSpaceReference> = {
            data: { ...reference }, // Copie pour éviter les références partagées
            createdAt: Date.now(),
            expiresAt: Date.now() + this.config.cacheTTL,
            hits: 1
        };

        this.referenceCache.set(referentId, entry);

        // Si le cache est trop grand, nettoyage
        if (this.referenceCache.size > this.config.cacheSize) {
            this.cleanupCache();
        }
    }

    /**
     * Récupère une référence du cache
     * @param referentId ID de la référence
     * @returns Référence ou null si non trouvée/expirée
     * @private
     */
    private getCachedReference(referentId: string): SigningSpaceReference | null {
        const entry = this.referenceCache.get(referentId);

        if (!entry) {
            return null;
        }

        // Vérifier si l'entrée est expirée
        if (Date.now() > entry.expiresAt) {
            this.referenceCache.delete(referentId);
            return null;
        }

        // Mise à jour des statistiques
        entry.hits++;
        this.metrics.cacheHits++;

        return entry.data;
    }

    /**
     * Met un résultat de validation en cache
     * @param key Clé de cache
     * @param isCoherent Résultat de la validation
     * @private
     */
    private cacheValidation(key: string, isCoherent: boolean): void {
        const entry: SpatialCacheEntry<boolean> = {
            data: isCoherent,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.config.cacheTTL,
            hits: 1
        };

        this.validationCache.set(key, entry);

        // Si le cache est trop grand, nettoyage
        if (this.validationCache.size > this.config.cacheSize) {
            this.cleanupCache();
        }
    }

    /**
     * Récupère un résultat de validation du cache
     * @param key Clé de cache
     * @returns Résultat ou null si non trouvé/expiré
     * @private
     */
    private getCachedValidation(key: string): boolean | null {
        const entry = this.validationCache.get(key);

        if (!entry) {
            return null;
        }

        // Vérifier si l'entrée est expirée
        if (Date.now() > entry.expiresAt) {
            this.validationCache.delete(key);
            return null;
        }

        // Mise à jour des statistiques
        entry.hits++;

        return entry.data;
    }

    /**
     * Nettoie les éléments expirés des caches
     * @private
     */
    private cleanupCache(): void {
        const now = Date.now();

        // Nettoyer le cache des références
        for (const [key, entry] of this.referenceCache.entries()) {
            if (now > entry.expiresAt) {
                this.referenceCache.delete(key);
            }
        }

        // Nettoyer le cache des validations
        for (const [key, entry] of this.validationCache.entries()) {
            if (now > entry.expiresAt) {
                this.validationCache.delete(key);
            }
        }

        // Si les caches sont encore trop grands, supprimer les entrées les moins utilisées
        if (this.referenceCache.size > this.config.cacheSize * 0.8) {
            const entries = Array.from(this.referenceCache.entries())
                .sort((a, b) => a[1].hits - b[1].hits);

            // Supprimer les 20% les moins utilisés
            const toRemove = Math.floor(entries.length * 0.2);
            for (let i = 0; i < toRemove; i++) {
                this.referenceCache.delete(entries[i][0]);
            }
        }

        if (this.validationCache.size > this.config.cacheSize * 0.8) {
            const entries = Array.from(this.validationCache.entries())
                .sort((a, b) => a[1].hits - b[1].hits);

            // Supprimer les 20% les moins utilisés
            const toRemove = Math.floor(entries.length * 0.2);
            for (let i = 0; i < toRemove; i++) {
                this.validationCache.delete(entries[i][0]);
            }
        }
    }

    /**
     * Génère une clé de cache pour une validation de cohérence
     * @param signSequence Séquence de signes à valider
     * @returns Clé de cache
     * @private
     */
    private generateValidationCacheKey(signSequence: Array<{
        id: string;
        references?: string[];
        positions?: SpatialVector[];
    }>): string {
        // Extraire les propriétés pertinentes pour la clé de cache
        const simplified = signSequence.map(sign => ({
            id: sign.id,
            refs: sign.references || [],
            pos: sign.positions ? sign.positions.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`) : []
        }));

        return JSON.stringify(simplified);
    }

    /**
     * Arrête proprement le composant
     */
    public async shutdown(): Promise<void> {
        this.status = SystemComponentStatus.SHUTDOWN;

        try {
            // Nettoyage des ressources
            this.eventListeners.clear();
            this.referenceCache.clear();
            this.validationCache.clear();

            // Si le référence tracker a une méthode de shutdown, l'appeler
            if (typeof this.referenceTracker.shutdown === 'function') {
                await this.referenceTracker.shutdown();
            }

            this.logger.info('GestionEspaceSpatial shut down successfully');
        } catch (error) {
            this.logger.error('Error during GestionEspaceSpatial shutdown', error);
        }
    }
}

export default GestionEspaceSpatial;