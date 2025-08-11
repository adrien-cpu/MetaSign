// src/ai/pyramid/types.ts

import { PerformanceMetrics } from '@ai/types/metrics';
import {
    StructuredData,
    ConfigParameters,
    PyramidMetadata,
    ActionResultData
} from '@ai/pyramid/shared-types';

/**
 * Énumération des différents niveaux de la pyramide IA
 * Chaque niveau a une fonction et des responsabilités spécifiques
 * Ordre du sommet (0) vers la base
 */
export enum PyramidLevelType {
    // Niveau d'exploration et d'innovation
    EXPLORER = 'explorer',

    // Collecte et filtre les données brutes
    COLLECTOR = 'collector',

    // Prépare les données pour traitement
    PREPARATOR = 'preparator',

    // Observe et analyse les données
    SPECTATOR = 'spectator',

    // Détecte et gère les anomalies
    ANOMALY_MANAGER = 'anomaly_manager',

    // Analyse les données de manière approfondie
    ANALYST = 'analyst',

    // Offre du tutorat et de l'apprentissage
    MENTOR = 'mentor',

    // Génère de nouvelles données et contenus
    GENERATOR = 'generator',

    // Assure la conformité éthique
    ETHICIST = 'ethicist',

    // Simule et modélise des scénarios
    SIMULATOR = 'simulator',

    // Prédit les évolutions futures
    PREDICTOR = 'predictor',

    // Maintient l'historique et les archives
    HISTORIAN = 'historian',

    // Médie et facilite les interactions
    MEDIATOR = 'mediator'
}

/**
 * Type pour les identifiants des niveaux de la pyramide
 * Permet d'utiliser les niveaux comme clés d'objet
 */
export type PyramidLevelId = string;

/**
 * Direction du flux de données dans la pyramide
 */
export enum PyramidDataFlowDirection {
    // De la base vers le sommet
    UPWARD = 'upward',

    // Du sommet vers la base
    DOWNWARD = 'downward',

    // Dans les deux sens
    BIDIRECTIONAL = 'bidirectional'
}

/**
 * États possibles d'un niveau de la pyramide
 */
export enum PyramidLevelState {
    // Niveau initialisé mais pas encore actif
    INITIALIZED = 'initialized',

    // Niveau actif et fonctionnel
    ACTIVE = 'active',

    // Niveau en cours de traitement
    PROCESSING = 'processing',

    // Niveau en erreur
    ERROR = 'error',

    // Niveau désactivé
    DISABLED = 'disabled'
}

/**
 * Types d'événements de la pyramide
 */
export enum PyramidEventType {
    // Niveau initialisé
    LEVEL_INITIALIZED = 'level_initialized',

    // Niveau activé
    LEVEL_ACTIVATED = 'level_activated',

    // Début de traitement des données
    PROCESSING_STARTED = 'processing_started',

    // Fin de traitement des données
    PROCESSING_COMPLETED = 'processing_completed',

    // Erreur lors du traitement
    PROCESSING_ERROR = 'processing_error',

    // Cache mis à jour
    CACHE_UPDATED = 'cache_updated',

    // Métriques mises à jour
    METRICS_UPDATED = 'metrics_updated'
}

/**
 * Types d'actions que les niveaux de pyramide peuvent effectuer
 */
export enum PyramidActionType {
    PROCESS = 'process',
    GENERATE = 'generate',
    ANALYZE = 'analyze',
    VALIDATE = 'validate',
    OPTIMIZE = 'optimize',
    LEARN = 'learn',
    PREDICT = 'predict',
    ALERT = 'alert'
}

/**
 * Interface pour les données qui circulent entre les niveaux de la pyramide
 */
export interface PyramidData {
    /**
     * Source level that generated this data
     */
    sourceLevel: PyramidLevelType;

    /**
     * Timestamp when data was created
     */
    timestamp: number;

    /**
     * Unique identifier for this data packet
     */
    id: string;

    /**
     * Data payload
     */
    payload: StructuredData;

    /**
     * Processing history (levels this data has passed through)
     */
    processingPath?: PyramidLevelType[];

    /**
     * Metadata for tracking and debugging
     */
    metadata?: PyramidMetadata;

    /**
     * Autres propriétés
     */
    [key: string]: unknown;
}

/**
 * Configuration d'un niveau de la pyramide
 */
export interface PyramidLevelConfig {
    /**
     * Identifiant unique du niveau
     */
    id: PyramidLevelId;

    /**
     * Type de niveau
     */
    type: PyramidLevelType;

    /**
     * Enable or disable this level
     */
    enabled: boolean;

    /**
     * Processing timeout in milliseconds
     */
    timeout?: number;

    /**
     * Maximum memory usage in MB
     */
    maxMemory?: number;

    /**
     * Processing priority (lower is higher priority)
     */
    priority?: number;

    /**
     * Level-specific configuration parameters
     */
    parameters?: ConfigParameters;

    /**
     * Autres propriétés de configuration
     */
    [key: string]: unknown;
}

/**
 * Interface pour les capacités spécifiques d'un niveau
 */
export interface PyramidLevelCapabilities {
    /**
     * Whether this level can process data
     */
    canProcess: boolean;

    /**
     * Whether this level can generate data
     */
    canGenerate: boolean;

    /**
     * Whether this level can analyze data
     */
    canAnalyze: boolean;

    /**
     * Whether this level can validate data
     */
    canValidate: boolean;

    /**
     * Other specific capabilities
     */
    [key: string]: boolean;
}

/**
 * Résultat d'une action effectuée par un niveau de la pyramide
 */
export interface PyramidActionResult {
    /**
     * Success status of the action
     */
    success: boolean;

    /**
     * Type of action performed
     */
    actionType: PyramidActionType;

    /**
     * Level that performed the action
     */
    level: PyramidLevelType;

    /**
     * Result data
     */
    data?: ActionResultData;

    /**
     * Error message if action failed
     */
    error?: string;

    /**
     * Timestamp when action was completed
     */
    timestamp: number;
}

/**
 * Interface pour les méthodes et propriétés communes à tous les niveaux
 */
export interface PyramidLevelBase {
    /**
     * Type de niveau
     */
    readonly type: PyramidLevelType;

    /**
     * État actuel du niveau
     */
    readonly state: PyramidLevelState;

    /**
     * Initialiser le niveau
     */
    initialize(): Promise<void>;

    /**
     * Obtenir les métriques du niveau
     */
    getMetrics(): Record<string, number>;

    /**
     * Vérifier si le niveau peut traiter un type de données spécifique
     */
    canProcess(dataType: string): boolean;
}

/**
 * Interface pour la factory des niveaux de la pyramide
 */
export interface IPyramidLevelFactory {
    /**
     * Create a new pyramid level
     * @param type Type of level to create
     */
    createLevel(type: PyramidLevelType): PyramidLevel;
}

/**
 * Interface pour les configurations système de la pyramide
 */
export interface PyramidSystemConfig {
    /**
     * Verbosité du logging
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';

    /**
     * Activer/désactiver le cache
     */
    cacheEnabled?: boolean;

    /**
     * Configuration du cache
     */
    cacheConfig?: {
        /**
         * Taille maximum du cache
         */
        maxSize?: number;

        /**
         * Durée de vie des entrées cache (ms)
         */
        ttl?: number;
    };

    /**
     * Activer/désactiver le traitement parallèle
     */
    parallelProcessingEnabled?: boolean;

    /**
     * Nombre maximum de traitements parallèles
     */
    maxConcurrency?: number;

    /**
     * Activer/désactiver la validation des données
     */
    validationEnabled?: boolean;

    /**
     * Mode strict de validation
     */
    strictValidation?: boolean;

    /**
     * Niveaux désactivés
     */
    disabledLevels?: PyramidLevelType[];
}

/**
 * Interface pour les opérations de maintien du système
 */
export interface SystemOperations {
    /**
     * Vider le cache
     */
    clearCache(): Promise<void>;

    /**
     * Recharger les niveaux
     */
    reloadLevels(levels?: PyramidLevelType[]): Promise<void>;

    /**
     * Exporter les métriques
     */
    exportMetrics(format?: 'json' | 'prometheus'): string;

    /**
     * Récupérer l'état du système
     */
    getSystemState(): Record<string, unknown>;
}

/**
 * Extension de PerformanceMetrics pour inclure lastUpdated
 */
export interface PyramidPerformanceMetrics extends PerformanceMetrics {
    lastUpdated: number;
}

/**
 * Classe abstraite de base pour tous les niveaux de la pyramide
 */
export abstract class PyramidLevel implements PyramidLevelBase {
    private _type: PyramidLevelType;
    private _name: string;
    private _upperLevel?: PyramidLevel;
    private _lowerLevel?: PyramidLevel;
    private _active: boolean = false;
    private _state: PyramidLevelState = PyramidLevelState.INITIALIZED;
    private _metrics: PyramidPerformanceMetrics = { lastUpdated: Date.now() } as PyramidPerformanceMetrics;

    /**
     * Create a new pyramid level
     * @param type Level type in the pyramid
     * @param name Human-readable name of the level
     */
    constructor(type: PyramidLevelType, name: string) {
        this._type = type;
        this._name = name;
    }

    /**
     * Get the type of this pyramid level
     */
    public get type(): PyramidLevelType {
        return this._type;
    }

    /**
     * Get the name of this pyramid level
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Get the state of this pyramid level
     */
    public get state(): PyramidLevelState {
        return this._state;
    }

    /**
     * Set the state of this pyramid level
     */
    protected setState(state: PyramidLevelState): void {
        this._state = state;
    }

    /**
     * Connect this level to the level above it
     * @param level Upper level to connect to
     */
    public connectUp(level: PyramidLevel): void {
        this._upperLevel = level;
    }

    /**
     * Connect this level to the level below it
     * @param level Lower level to connect to
     */
    public connectDown(level: PyramidLevel): void {
        this._lowerLevel = level;
    }

    /**
     * Get the upper connected level
     */
    public getUpperLevel(): PyramidLevel | undefined {
        return this._upperLevel;
    }

    /**
     * Get the lower connected level
     */
    public getLowerLevel(): PyramidLevel | undefined {
        return this._lowerLevel;
    }

    /**
     * Initialize this pyramid level
     */
    public abstract initialize(): Promise<void>;

    /**
     * Process data at this level
     * @param data Input data to process
     */
    public abstract process(data: StructuredData): Promise<StructuredData>;

    /**
     * Shut down this pyramid level
     */
    public abstract shutdown(): Promise<void>;

    /**
     * Get performance metrics for this level
     */
    public getMetrics(): Record<string, number> {
        // Update metrics before returning
        this.updateMetrics();

        // Convert the complex metrics object to a simple Record<string, number>
        const simpleMetrics: Record<string, number> = {};

        // Add lastUpdated as a metric
        simpleMetrics['lastUpdated'] = this._metrics.lastUpdated;

        // Add other metrics from the complex object
        for (const [key, value] of Object.entries(this._metrics)) {
            if (typeof value === 'number') {
                simpleMetrics[key] = value;
            }
        }

        return simpleMetrics;
    }

    /**
     * Update performance metrics
     */
    protected updateMetrics(): void {
        this._metrics.lastUpdated = Date.now();
        // Concrete implementations should override to add specific metrics
    }

    /**
     * Check if this level is active
     */
    public isActive(): boolean {
        return this._active;
    }

    /**
     * Set the active state of this level
     */
    protected setActive(active: boolean): void {
        this._active = active;
        if (active) {
            this.setState(PyramidLevelState.ACTIVE);
        } else {
            this.setState(PyramidLevelState.INITIALIZED);
        }
    }

    /**
     * Check if this level can process a specific data type
     * @param dataType Type of data to check
     */
    public canProcess(_dataType: string): boolean {
        // Base implementation returns false, concrete classes should evaluate dataType
        // and return true if they can process it
        return false;
    }
}

/**
 * Status du traitement des données
 */
export enum ProcessingStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    PARTIAL = 'partial',
    PENDING = 'pending'
}