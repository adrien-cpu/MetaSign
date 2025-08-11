/**
 * @file: src/ai/types/base.ts
 * 
 * Types et interfaces de base pour le système IA LSF
 */

/**
 * État global du système
 */
export enum SystemOperationalState {
    /** Système en cours d'initialisation */
    INITIALIZING = 'initializing',
    /** Système opérationnel */
    RUNNING = 'running',
    /** Système en cours d'arrêt */
    SHUTTING_DOWN = 'shutting_down',
    /** Système en mode dégradé */
    DEGRADED = 'degraded',
    /** Système en mode maintenance */
    MAINTENANCE = 'maintenance',
    /** Système en erreur */
    ERROR = 'error'
}

/**
 * État du composant système
 */
export enum SystemComponentStatus {
    /** Composant en initialisation */
    INITIALIZING = 'initializing',
    /** Composant prêt */
    READY = 'ready',
    /** Composant en traitement */
    PROCESSING = 'processing',
    /** Composant dégradé */
    DEGRADED = 'degraded',
    /** Composant en erreur */
    ERROR = 'error',
    /** Composant en arrêt */
    SHUTDOWN = 'shutdown'
}

/**
 * Type de composant système
 */
export enum ComponentType {
    /** Orchestrateur */
    Orchestrator = 'orchestrator',
    /** Router */
    Router = 'router',
    /** IA Core */
    IACore = 'ia_core',
    /** Contrôle éthique */
    Ethics = 'ethics',
    /** Expressions */
    Expressions = 'expressions',
    /** Dialectes */
    Dialects = 'dialects',
    /** Validation */
    Validation = 'validation',
    /** Apprentissage */
    Learning = 'learning',
    /** Monitoring */
    Monitoring = 'monitoring'
}

/**
 * Niveau d'utilisation des ressources
 */
export enum ResourceUtilizationLevel {
    /** Utilisation faible */
    LOW = 'low',
    /** Utilisation modérée */
    MODERATE = 'moderate',
    /** Utilisation élevée */
    HIGH = 'high',
    /** Utilisation critique */
    CRITICAL = 'critical'
}

/**
 * Types d'alertes système
 */
export enum SystemAlertType {
    /** Information */
    INFO = 'info',
    /** Avertissement */
    WARNING = 'warning',
    /** Erreur */
    ERROR = 'error',
    /** Critique */
    CRITICAL = 'critical'
}

/**
 * Types de requêtes supportés par le système
 */
export enum RequestType {
    // Requêtes linguistiques
    LSF_TRANSLATION = 'lsf_translation',
    TEXT_TO_LSF = 'text_to_lsf',
    LSF_TO_TEXT = 'lsf_to_text',

    // Requêtes d'expression
    GENERATE_EXPRESSION = 'generate_expression',
    ANALYZE_EXPRESSION = 'analyze_expression',
    OPTIMIZE_EXPRESSION = 'optimize_expression',

    // Requêtes d'analyse
    CONTEXT_ANALYSIS = 'context_analysis',
    EMOTION_ANALYSIS = 'emotion_analysis',
    CULTURAL_VALIDATION = 'cultural_validation',

    // Requêtes d'apprentissage
    LEARNING_FEEDBACK = 'learning_feedback',
    MODEL_ADAPTATION = 'model_adaptation',

    // Requêtes système
    SYSTEM_STATUS = 'system_status',
    PERFORMANCE_METRICS = 'performance_metrics',
    CACHE_MANAGEMENT = 'cache_management',

    // Requêtes multimodales
    GESTURE_GENERATION = 'gesture_generation',
    FACIAL_SYNC = 'facial_sync',
    AUDIO_ALIGNMENT = 'audio_alignment',
    PROSODY_ANALYSIS = 'prosody_analysis'
}

/**
 * Stratégies de cache
 */
export enum CacheStrategy {
    /** Cache standard */
    Standard = 'standard',
    /** Ne pas mettre en cache */
    NoCache = 'no-cache',
    /** Cache pour une longue durée */
    LongTerm = 'long-term',
    /** Cache pour une courte durée */
    ShortTerm = 'short-term'
}

/**
 * Priorités des requêtes
 */
export enum RequestPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

/**
 * Alerte système
 */
export interface SystemAlert {
    /** Type d'alerte */
    type: SystemAlertType;
    /** Message d'alerte */
    message: string;
    /** Horodatage de l'alerte */
    timestamp: number;
    /** Composant concerné */
    component?: string;
    /** Métadonnées associées */
    metadata?: Record<string, unknown>;
    /** Identifiant de l'alerte */
    id: string;
    /** Alerte acquittée */
    acknowledged: boolean;
    /** Horodatage d'acquittement */
    acknowledgedAt?: number;
    /** Utilisateur ayant acquitté */
    acknowledgedBy?: string;
}

/**
 * Statistiques d'utilisation des ressources
 */
export interface ResourceUtilization {
    /** Utilisation CPU (0-1) */
    cpu: number;
    /** Utilisation mémoire (0-1) */
    memory: number;
    /** Utilisation du cache (0-1) */
    cache: number;
    /** Latence moyenne (ms) */
    latency: number;
    /** Nombre de requêtes par seconde */
    throughput: number;
    /** Niveau d'utilisation global */
    level: ResourceUtilizationLevel;
}

/**
 * Options de traitement d'une requête
 */
export interface ProcessOptions {
    /** Priorité de la requête */
    parallel?: boolean;
    /** Ignorer le cache pour cette requête */
    skipCache?: boolean;

    /** Ignorer la validation éthique pour cette requête */
    skipEthicsValidation?: boolean;

    /** Priorité de la requête */
    priority?: RequestPriority;

    /** Traiter immédiatement sans passer par la file d'attente */
    immediate?: boolean;

    /** Indique que cette requête est un préchargement (pour le cache prédictif) */
    preloading?: boolean;

    /** Options spécifiques au type de requête */
    typeSpecificOptions?: Record<string, unknown>;
}

/**
 * Requête à traiter
 */
export interface ProcessRequest {
    /** Identifiant unique de la requête */
    id: string;

    /** Type de requête */
    type: RequestType;

    /** Données de la requête */
    data: unknown;

    /** Options de traitement */
    options?: ProcessOptions;
}

/**
 * Résultat du traitement d'une requête
 */
export interface ProcessResult<T> {
    /** Identifiant de la requête traitée */
    requestId: string;

    /** Type de requête traitée */
    requestType: RequestType;

    /** Résultat du traitement */
    result: T;

    /** Métadonnées du traitement */
    metadata: {
        /** Durée du traitement en millisecondes */
        processingTime: number;

        /** Horodatage de fin du traitement */
        timestamp: number;

        /** Indique si le résultat provient du cache */
        fromCache: boolean;

        /** Métriques additionnelles spécifiques au type de requête */
        metrics?: Record<string, unknown>;
    };
}

/**
 * Statistiques d'orchestration du système
 */
export interface OrchestrationStats {
    /** Nombre total de requêtes reçues */
    totalRequests: number;

    /** Nombre de requêtes traitées avec succès */
    successfulRequests: number;

    /** Nombre de requêtes ayant échoué */
    failedRequests: number;

    /** Nombre de réponses servies depuis le cache */
    cachedResponses: number;

    /** Temps de réponse moyen en millisecondes */
    avgResponseTime: number;

    /** Distribution des requêtes par type */
    requestTypeDistribution: Map<string, number>;

    /** Nombre de requêtes actuellement en traitement */
    activeRequests: number;
}

/**
 * État du système
 */
export interface SystemState {
    /** État opérationnel */
    operationalState: SystemOperationalState;
    /** Utilisation des ressources */
    resourceUtilization: ResourceUtilization;
    /** Alertes actives */
    activeAlerts: SystemAlert[];
    /** Nombre de tâches en attente */
    pendingTasks: number;
    /** Nombre de tâches en cours */
    runningTasks: number;
    /** Timestamp de démarrage */
    startTime: number;
    /** Uptime en ms */
    uptime: number;
    /** Version du système */
    version: string;
    /** État par composant */
    componentStates: Record<string, {
        /** État opérationnel */
        state: SystemOperationalState;
        /** Santé du composant (0-1) */
        health: number;
        /** Message d'état */
        message?: string;
        /** Dernier accès */
        lastActive: number;
    }>;
    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
    /** État du système IA Core */
    iaCore?: Record<string, unknown>;
    /** État du système de contrôle éthique */
    ethicsSystem?: Record<string, unknown>;
    /** État du routeur multimodal */
    router?: Record<string, unknown>;
    /** État du système de monitoring */
    monitor?: Record<string, unknown>;
    /** État de l'orchestrateur */
    orchestrator?: {
        /** Nombre de requêtes actuellement en traitement */
        activeRequests: number;
        /** Taille des files d'attente par priorité */
        queueSizes: {
            high: number;
            medium: number;
            low: number;
        };
        /** Statistiques d'orchestration */
        stats: OrchestrationStats;
        /** Informations sur le cache */
        cache: {
            /** Taux de succès du cache */
            hitRate: number;
            /** Taille du cache par niveau */
            size: {
                l1: number;
                l2: number;
                predictive: number;
                total: number;
            };
        };
    };
}

/**
 * Type d'erreur système
 */
export enum SystemErrorType {
    /** Erreur de validation */
    VALIDATION = 'validation',
    /** Erreur de configuration */
    CONFIGURATION = 'configuration',
    /** Erreur d'initialisation */
    INITIALIZATION = 'initialization',
    /** Erreur d'exécution */
    RUNTIME = 'runtime',
    /** Erreur de timeout */
    TIMEOUT = 'timeout',
    /** Erreur de ressource */
    RESOURCE = 'resource',
    /** Erreur de dépendance */
    DEPENDENCY = 'dependency',
    /** Erreur de permission */
    PERMISSION = 'permission',
    /** Erreur inconnue */
    UNKNOWN = 'unknown'
}

/**
 * Erreur système typée
 */
export class SystemError extends Error {
    /** Type d'erreur */
    public type: SystemErrorType;
    /** Code d'erreur */
    public code: string;
    /** Composant source de l'erreur */
    public component: string | undefined;
    /** Erreur originale */
    public originalError: Error | undefined;
    /** Horodatage de l'erreur */
    public timestamp: number;
    /** Métadonnées additionnelles */
    public metadata: Record<string, unknown> | undefined;

    /**
     * Crée une nouvelle erreur système
     * @param message Message d'erreur
     * @param type Type d'erreur
     * @param code Code d'erreur
     * @param component Composant source
     * @param originalError Erreur originale
     * @param metadata Métadonnées
     */
    constructor(
        message: string,
        type: SystemErrorType = SystemErrorType.UNKNOWN,
        code: string = 'SYSTEM_ERROR',
        component?: string,
        originalError?: Error,
        metadata?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'SystemError';
        this.type = type;
        this.code = code;
        this.component = component;
        this.originalError = originalError;
        this.timestamp = Date.now();
        this.metadata = metadata;

        // Nécessaire pour TypeScript avec les classes étendant Error
        Object.setPrototypeOf(this, SystemError.prototype);
    }

    /**
     * Convertit l'erreur en objet sérialisable
     */
    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            code: this.code,
            component: this.component,
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message,
                stack: this.originalError.stack
            } : undefined,
            timestamp: this.timestamp,
            metadata: this.metadata,
            stack: this.stack
        };
    }
}

/**
 * Interface de base pour les composants système
 */
export interface ISystemComponent {
    /** Identifiant unique du composant */
    id: string;
    /** Type de composant */
    type: string;
    /** Initialise le composant */
    initialize(): Promise<void>;
    /** Traite des données */
    process<TInput = unknown, TOutput = unknown>(data: TInput): Promise<TOutput>;
    /** Récupère le statut actuel du composant */
    getStatus(): SystemComponentStatus;
    /** Arrête proprement le composant */
    shutdown(): Promise<void>;
}

/**
 * Contexte de requête
 */
export interface RequestContext {
    /** ID de la requête */
    requestId: string;
    /** ID de l'utilisateur */
    userId?: string;
    /** ID de session */
    sessionId?: string;
    /** Priorité */
    priority: RequestPriority;
    /** Horodatage */
    timestamp: number;
    /** Trace parente */
    parentTrace?: string;
    /** Métadonnées */
    metadata?: Record<string, unknown>;
}

/**
 * Résultat de traitement
 */
export interface ProcessingResult<T = unknown> {
    /** Succès du traitement */
    success: boolean;
    /** Données de résultat */
    data?: T;
    /** Message d'erreur */
    error?: string;
    /** Durée de traitement */
    duration: number;
    /** Métadonnées */
    metadata?: Record<string, unknown>;
}

/**
 * Requête d'orchestration
 */
export interface OrchestrationRequest {
    /** ID de la requête */
    id: string;
    /** Type de requête */
    type: string;
    /** Données de la requête */
    payload: unknown;
    /** Priorité */
    priority?: string;
    /** Métadonnées */
    metadata?: Record<string, unknown>;
}

/**
 * Résultat d'orchestration
 */
export interface OrchestrationResult<T = unknown> {
    /** Succès de l'opération */
    success: boolean;
    /** Données de résultat */
    data?: T;
    /** Message d'erreur */
    error?: string;
    /** Métriques */
    metrics: {
        /** Temps d'exécution */
        executionTime: number;
        /** Utilisation du cache */
        cacheUsed: boolean;
        /** Composants utilisés */
        componentsUsed: string[];
        /** Chemin de traitement */
        path: string[];
    };
}

// Nouveaux types pour la gestion des gestes et expressions LSF

/**
 * Type de mouvement dans une séquence gestuelle
 */
export enum MovementType {
    MANUAL = 'manual',
    NON_MANUAL = 'non_manual',
    TRANSITION = 'transition',
    HOLD = 'hold'
}

/**
 * Direction d'un mouvement
 */
export enum MovementDirection {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right',
    FORWARD = 'forward',
    BACKWARD = 'backward',
    CIRCULAR_CW = 'circular_cw',
    CIRCULAR_CCW = 'circular_ccw'
}

/**
 * Représente un mouvement de base dans une séquence gestuelle
 */
export interface Movement {
    /** Identifiant unique du mouvement */
    id: string;

    /** Type de mouvement */
    type: MovementType;

    /** Détails du mouvement selon le type */
    parameters: {
        /** Direction principale du mouvement */
        direction?: MovementDirection;

        /** Amplitude du mouvement (0-1) */
        amplitude?: number;

        /** Vitesse du mouvement (0-1) */
        speed?: number;

        /** Configuration de main pour les mouvements manuels */
        handConfig?: HandConfig;

        /** Paramètres spécifiques au type de mouvement */
        [key: string]: unknown;
    };

    /** Métadonnées du mouvement */
    metadata?: Record<string, unknown>;
}

/**
 * Configuration de main pour les mouvements manuels
 */
export interface HandConfig {
    /** Configuration des doigts */
    fingers: {
        thumb: number;
        index: number;
        middle: number;
        ring: number;
        pinky: number;
    };

    /** Orientation de la paume (0-360 degrés) */
    palmOrientation: number;

    /** Rotation du poignet (0-360 degrés) */
    wristRotation: number;
}

/**
 * Informations de timing pour une séquence
 */
export interface TimingInfo {
    /** Durée totale en millisecondes */
    totalDuration: number;

    /** Timing spécifique pour chaque mouvement (par ID) */
    movementTimings: Record<string, {
        /** Décalage par rapport au début (ms) */
        offset: number;

        /** Durée du mouvement (ms) */
        duration: number;

        /** Courbe d'accélération (easing) */
        easing?: string;
    }>;

    /** Facteur d'échelle global pour ajuster la vitesse */
    speedFactor?: number;
}

/**
 * Type d'expression faciale
 */
export enum ExpressionType {
    EYEBROWS = 'eyebrows',
    EYES = 'eyes',
    MOUTH = 'mouth',
    CHEEKS = 'cheeks',
    HEAD = 'head',
    COMBINED = 'combined'
}

/**
 * Expression faciale individuelle
 */
export interface Expression {
    /** Identifiant de l'expression */
    id: string;

    /** Type d'expression */
    type: ExpressionType;

    /** Intensité de l'expression (0-1) */
    intensity: number;

    /** Paramètres spécifiques au type d'expression */
    parameters: Record<string, number>;

    /** Timing de l'expression */
    timing: {
        /** Décalage par rapport au début (ms) */
        offset: number;

        /** Durée de l'expression (ms) */
        duration: number;

        /** Courbe de transition entrante */
        easeIn?: string;

        /** Courbe de transition sortante */
        easeOut?: string;
    };
}

/**
 * Type de marqueur temporel
 */
export enum MarkerType {
    BEAT = 'beat',
    BOUNDARY = 'boundary',
    EMPHASIS = 'emphasis',
    PAUSE = 'pause',
    SYNC = 'sync'
}

/**
 * Marqueur temporel pour l'alignement
 */
export interface Marker {
    /** Position temporelle du marqueur (ms) */
    position: number;

    /** Type de marqueur */
    type: MarkerType;

    /** Force/importance du marqueur (0-1) */
    weight: number;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Marqueur temporel spécifique
 */
export interface TimeMarker {
    /** Position temporelle du marqueur (ms) */
    time: number;

    /** Type de marqueur */
    type: string;

    /** Valeur associée au marqueur */
    value: number | string;

    /** Durée d'influence du marqueur (ms) */
    duration?: number;
}

/**
 * Donnée métrique pour l'évaluation
 */
export interface MetricData {
    /** Nom de la métrique */
    name: string;

    /** Valeur de la métrique */
    value: number;

    /** Unité de mesure */
    unit?: string;

    /** Score normalisé (0-1) */
    normalizedScore?: number;
}

// Interfaces principales demandées

/**
 * Séquence de gestes LSF
 */
export interface GestureSequence {
    /** Identifiant unique de la séquence */
    id: string;

    /** Mouvements composant la séquence */
    movements: Movement[];

    /** Informations de timing */
    timing: TimingInfo;
}

/**
 * Ensemble d'expressions faciales
 */
export interface FacialExpressions {
    /** Identifiant unique */
    id: string;

    /** Liste des expressions */
    expressions: Expression[];

    /** Intensité globale (0-1) */
    intensity: number; // 0-1 où 1 est l'intensité maximale
    eyebrows?: string;
    eyes?: string;
    mouth?: string;
}

/**
 * Marqueurs temporels pour la synchronisation
 */
export interface TemporalMarkers {
    /** Instant de début (ms) */
    start: number;

    /** Durée totale (ms) */
    duration: number;

    /** Liste des marqueurs */
    markers: Marker[];
}

/**
 * Flux audio pour l'alignement
 */
export interface AudioStream {
    /** Identifiant unique */
    id: string;

    /** Données audio brutes */
    data: Uint8Array;

    /** Taux d'échantillonnage (Hz) */
    sampleRate: number;
}

/**
 * Marqueurs prosodiques pour l'expression
 */
export interface ProsodyMarkers {
    /** Variations de hauteur tonale */
    pitch: number[];

    /** Variations d'intensité */
    intensity: number[];

    /** Variations de durée */
    duration: number[];
}

/**
 * Données temporelles pour la synchronisation
 */
export interface TimingData {
    /** Instant de début (ms) */
    start: number;

    /** Instant de fin (ms) */
    end: number;

    /** Marqueurs temporels */
    markers: TimeMarker[];
}

/**
 * Métadonnées d'alignement pour évaluation
 */
export interface AlignmentMetadata {
    /** Score global d'alignement */
    score: number;

    /** Niveau de confiance (0-1) */
    confidence: number;

    /** Métriques détaillées */
    metrics: MetricData[];
}

/**
 * Interface pour la modalité de Langue des Signes Française (LSF)
 */
export interface LSFModality {
    id: string;
    facial?: FacialExpression;
    manual?: ManualComponent;
    nonManual?: NonManualComponent;
    spatial?: SpatialComponent;
    temporal?: TemporalComponent;
}

/**
 * Expression faciale en LSF
 */
export interface FacialExpression {
    intensity: number; // 0-1 où 1 est l'intensité maximale
    eyebrows?: string;
    eyes?: string;
    mouth?: string;
}

/**
 * Composante manuelle en LSF
 */
export interface ManualComponent {
    handshape: string;
    orientation: string;
    location: string;
    movement: string;
}

/**
 * Composante non-manuelle en LSF
 */
export interface NonManualComponent {
    head?: string;
    shoulders?: string;
    body?: string;
}

/**
 * Composante spatiale en LSF
 */
export interface SpatialComponent {
    position: { x: number; y: number; z: number };
    references: string[];
}

/**
 * Composante temporelle en LSF
 */
export interface TemporalComponent {
    duration: number;
    speed: number;
    rhythm: string;
}