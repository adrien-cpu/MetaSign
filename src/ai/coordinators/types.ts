/**
 * @file: src/ai/coordinators/types.ts
 * 
 * Types et interfaces consolidés pour le système d'orchestration.
 * Ce fichier regroupe toutes les définitions de types nécessaires aux
 * systèmes d'orchestration et de coordination.
 */

// Importation des types LSF depuis le module approprié
import type {
  EyebrowsPosition,
  EyesPosition,
  EyeDirection,
  MouthPosition,
  CheeksPosition,
  HeadPosition,
  HeadMovementType,
  HandPosition,
  HandConfiguration,
  HandOrientation,
  Orientation3D,
  Location3D,
  Movement,
  MovementPath,
  MovementPathType,
  ContactPoint,
  ContactType,
  ContactLocation,
  SpatialReference,
  SpatialReferenceType,
  TemporalMarker,
  TemporalMarkerType,
  NonManualElement,
  NonManualElementType,
  GrammaticalFunction
} from '@ai-types/lsf';

/**
 * =======================================================
 * ÉNUMÉRATIONS DU SYSTÈME D'ORCHESTRATION
 * =======================================================
 */

/**
 * Énumération des types de composants du système
 */
export enum ComponentType {
  Orchestrator = 'orchestrator',
  IACore = 'iacore',
  Expressions = 'expressions',
  Linguistes = 'linguistes',
  VariantesDiatopiques = 'variantes-diatopiques',
  ControleEthique = 'controle-ethique',
  Router = 'router',
  Monitor = 'monitor',
  Cache = 'cache'
}

/**
 * Priorité des tâches pour l'orchestrateur
 */
export enum TaskPriority {
  CRITICAL = 0,   // Urgence absolue, priorité maximale
  HIGH = 1,       // Haute priorité
  NORMAL = 2,     // Priorité normale
  LOW = 3,        // Basse priorité
  BACKGROUND = 4  // Tâche d'arrière-plan
}

/**
 * Stratégies de mise en cache
 */
export enum CacheStrategy {
  Default = 'default',
  LongTerm = 'long-term',
  ShortTerm = 'short-term',
  NoCache = 'no-cache'
}

/**
 * Types d'événements du système
 */
export enum EventType {
  // Événements du cycle de vie
  SYSTEM_INIT = 'SYSTEM_INIT',
  SYSTEM_READY = 'SYSTEM_READY',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
  MODULE_REGISTERED = 'MODULE_REGISTERED',
  MODULE_UNREGISTERED = 'MODULE_UNREGISTERED',

  // Événements de requêtes
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
  REQUEST_VALIDATED = 'REQUEST_VALIDATED',
  REQUEST_PROCESSED = 'REQUEST_PROCESSED',
  REQUEST_COMPLETED = 'REQUEST_COMPLETED',
  REQUEST_FAILED = 'REQUEST_FAILED',

  // Événements de performance
  PERFORMANCE_WARNING = 'PERFORMANCE_WARNING',
  PERFORMANCE_CRITICAL = 'PERFORMANCE_CRITICAL',
  CACHE_PURGED = 'CACHE_PURGED',

  // Événements LSF spécifiques
  LSF_EXPRESSION_GENERATED = 'LSF_EXPRESSION_GENERATED',
  LSF_EXPRESSION_VALIDATED = 'LSF_EXPRESSION_VALIDATED',
  LSF_DIALECT_DETECTED = 'LSF_DIALECT_DETECTED',
  LSF_SPATIAL_REFERENCE_CREATED = 'LSF_SPATIAL_REFERENCE_CREATED',

  // Événements de sécurité
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  AUTHENTICATION_SUCCESS = 'AUTHENTICATION_SUCCESS',
  AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE',

  // Événements d'erreur
  ERROR_HANDLED = 'ERROR_HANDLED',
  RECOVERY_ATTEMPT = 'RECOVERY_ATTEMPT',
  RECOVERY_SUCCESS = 'RECOVERY_SUCCESS',
  RECOVERY_FAILURE = 'RECOVERY_FAILURE'
}

/**
 * Types de systèmes disponibles
 */
export enum SystemType {
  IA_CORE = 'ia_core',
  ETHICS = 'ethics',
  EXPRESSIONS = 'expressions',
  LINGUISTES = 'linguistes',
  MONITORING = 'monitoring',
  VALIDATION = 'validation',
  ORCHESTRATION = 'orchestration',
  ROUTER = 'router',
  CACHE = 'cache',
  EMOTIONS = 'emotions',
  SECURITY = 'security',
  VARIANTES_DIATOPIQUES = 'variantes_diatopiques'
}

/**
 * Niveaux de priorité du système pour la résolution des conflits
 */
export enum SystemPriority {
  HIGHEST = 10,
  HIGH = 8,
  NORMAL = 5,
  LOW = 3,
  LOWEST = 1,
  CRITICAL = 0 // Pour compatibilité avec l'ancien code
}

/**
 * États possibles d'un système
 */
export enum SystemState {
  INITIALIZING = 'INITIALIZING', // Système en cours d'initialisation
  READY = 'READY',               // Système prêt
  PROCESSING = 'PROCESSING',     // Système en cours de traitement
  ERROR = 'ERROR',               // Système en erreur
  SHUTDOWN = 'SHUTDOWN',         // Système arrêté
  MAINTENANCE = 'MAINTENANCE',   // Système en maintenance
  BUSY = 'BUSY',                 // Système occupé
  UNKNOWN = 'UNKNOWN',           // État inconnu
  REGISTERED = 'REGISTERED',     // Système enregistré
  ACTIVE = 'ACTIVE',             // Système actif
  INACTIVE = 'INACTIVE',         // Système inactif
  RUNNING = 'RUNNING'            // Système opérationnel (pour compatibilité)
}

/**
 * Niveaux de cache disponibles
 */
export enum CacheLevel {
  NONE = 'none',
  L1 = 'l1',
  L2 = 'l2',
  L3 = 'l3',
  DISTRIBUTED = 'distributed',
  PREDICTIVE = 'PREDICTIVE'      // Cache prédictif (préchargement intelligent)
}

/**
 * Politiques de remplacement du cache
 */
export enum CacheReplacementPolicy {
  /** Least Recently Used - supprime les éléments utilisés le moins récemment */
  LRU = 'lru',
  /** Least Frequently Used - supprime les éléments utilisés le moins fréquemment */
  LFU = 'lfu',
  /** First In, First Out - supprime les éléments les plus anciens */
  FIFO = 'fifo',
  /** Supprime les éléments aléatoirement */
  RANDOM = 'random',
  /** Basé sur des poids */
  WEIGHTED = 'weighted',
  /** Stratégie adaptive basée sur plusieurs facteurs */
  ADAPTIVE = 'adaptive'
}

/**
 * Sévérité d'erreur
 */
export enum ErrorSeverity {
  Fatal = 'fatal',
  Error = 'error',
  Warning = 'warning',
  Info = 'info'
}

/**
 * Types de requêtes supportés par le système
 */
export enum RequestType {
  TRANSLATION = 'TRANSLATION',           // Traduction de texte vers LSF et vice-versa
  EXPRESSION = 'EXPRESSION',             // Génération d'expressions LSF
  ANALYSIS = 'ANALYSIS',                 // Analyse linguistique
  VALIDATION = 'VALIDATION',             // Validation de contenu
  FEEDBACK = 'FEEDBACK',                 // Retour utilisateur
  CULTURAL_VALIDATION = 'CULTURAL_VALIDATION', // Validation culturelle
  GRAMMAR_CHECK = 'GRAMMAR_CHECK',       // Vérification grammaticale
  ETHICAL_VALIDATION = 'ETHICAL_VALIDATION', // Validation éthique
  REFERENCE_TRACKING = 'REFERENCE_TRACKING', // Suivi des références spatiales
  SPATIAL_VALIDATION = 'SPATIAL_VALIDATION', // Validation spatiale
  EMOTION_ANALYSIS = 'EMOTION_ANALYSIS', // Analyse émotionnelle
  EXPRESSION_GENERATION = 'EXPRESSION_GENERATION' // Génération d'expressions
}

/**
 * Modes d'orchestration disponibles
 */
export enum OrchestrationMode {
  STANDARD = 'standard',
  HIGH_PERFORMANCE = 'high_performance',
  HIGH_ACCURACY = 'high_accuracy',
  LOW_LATENCY = 'low_latency',
  BALANCED = 'balanced'
}

/**
 * =======================================================
 * INTERFACES DU SYSTÈME DE CACHE
 * =======================================================
 */

/**
 * Configuration du cache
 */
export interface CacheConfig {
  /** Niveau de cache */
  level: CacheLevel;
  /** Taille maximale en octets */
  maxSize: number;
  /** Durée de vie par défaut (ms) */
  defaultTTL: number;
  /** Politique de remplacement */
  replacementPolicy: CacheReplacementPolicy;
  /** Activer la compression */
  compressionEnabled: boolean;
  /** Activer la persistance */
  persistenceEnabled: boolean;
  /** Activer les prédictions */
  predictionEnabled: boolean;
}

/**
 * État du gestionnaire de cache
 */
export interface CacheState {
  level: CacheLevel;
  used: number; // en octets
  total: number; // en octets
  items: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  lastCleanup: number; // timestamp
}

/**
 * Interface pour les gestionnaires de cache
 */
export interface ICacheManager {
  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): Promise<T | undefined>;

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Supprime une valeur du cache
   */
  delete(key: string): Promise<boolean>;

  /**
   * Vide le cache
   */
  clear(): Promise<void>;

  /**
   * Obtient l'état actuel du cache
   */
  getState(): Promise<CacheState>;
}

/**
 * Interface pour les métadonnées de cache
 */
export interface CacheMetadata {
  requestType: RequestType;
  timestamp: number;
}

/**
 * Options pour le cache
 */
export interface CacheOptions {
  ttl?: number;
  metadata?: CacheMetadata;
}

/**
 * =======================================================
 * INTERFACES DE GESTION D'ÉVÉNEMENTS
 * =======================================================
 */

/**
 * Configuration du gestionnaire d'événements
 */
export interface EventManagerConfig {
  /**
   * Taille maximale de la file d'attente d'événements
   */
  maxQueueSize: number;

  /**
   * Délai maximal avant traitement forcé (ms)
   */
  maxDelay: number;

  /**
   * Mode de traitement asynchrone
   */
  asyncProcessing: boolean;

  /**
   * Nombre maximal de tentatives pour les événements échoués
   */
  maxRetries: number;
}

/**
 * Interface pour les gestionnaires d'événements
 */
export interface IEventManager {
  /**
   * Émet un événement
   */
  emit(eventName: string, data: unknown): void;

  /**
   * Souscrit à un événement
   */
  on(eventName: string, handler: (data: unknown) => void): void;

  /**
   * Se désinscrit d'un événement
   */
  off(eventName: string, handler: (data: unknown) => void): void;

  /**
   * Souscrit à un événement pour une seule occurrence
   */
  once(eventName: string, handler: (data: unknown) => void): void;

  /**
   * Obtient l'état actuel du gestionnaire d'événements
   */
  getState(): Record<string, unknown>;
}

/**
 * =======================================================
 * INTERFACES DE MONITORING DE PERFORMANCE
 * =======================================================
 */

/**
 * Configuration du moniteur de performance
 */
export interface PerformanceMonitorConfig {
  /**
   * Intervalle d'échantillonnage (ms)
   */
  samplingInterval: number;

  /**
   * Seuil CPU pour les alertes (%)
   */
  cpuThreshold: number;

  /**
   * Seuil mémoire pour les alertes (%)
   */
  memoryThreshold: number;

  /**
   * Taille maximale de l'historique par métrique
   */
  maxHistorySize: number;
}

/**
 * Interface pour les moniteurs de performance
 */
export interface IPerformanceMonitor {
  /**
   * Démarre le monitoring
   */
  start(): void;

  /**
   * Arrête le monitoring
   */
  stop(): void;

  /**
   * Récupère les métriques actuelles
   */
  getCurrentMetrics(): Record<string, number>;

  /**
   * Récupère l'historique des métriques
   */
  getMetricsHistory(metric: string, limit?: number): Array<{
    timestamp: number;
    value: number;
  }>;

  /**
   * Définit un seuil d'alerte pour une métrique
   */
  setThreshold(metric: string, value: number): void;
}

/**
 * Interface minimale des métriques
 */
export interface MetricValue {
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * =======================================================
 * INTERFACES DE GESTION DES REQUÊTES
 * =======================================================
 */

/**
 * Interface pour le contexte de requête
 */
export interface RequestContext {
  id: string;
  userId?: string;
  sessionId?: string;
  text: string;
  locale?: string;
  requiresExpressions: boolean;
  requiresTranslation: boolean;
  timestamp: number;
  priority?: TaskPriority;
  cacheStrategy?: CacheStrategy;
  metadata?: Record<string, unknown>;
}

/**
 * Interface pour le résultat de traitement
 */
export interface ProcessingResult {
  requestId: string;
  timestamp: number;
  processingTimeMs: number;
  translatedText?: string;
  expressionData?: ExpressionData;
  dialectVariations?: DialectVariation[];
  cacheStrategy: CacheStrategy;
  error?: ErrorInfo;
  metadata?: Record<string, unknown>;
}

/**
 * Interface de base pour les résultats de requêtes
 */
export interface RequestResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Interface pour une requête LSF
 */
export interface LSFRequest {
  type: RequestType;
  modality: string;
  data: unknown;
  userId: string;
  sessionId: string;
  timestamp: number;
  priority: TaskPriority;
  noCache?: boolean;
  context?: Record<string, unknown>;
}

/**
 * Interface pour un résultat d'orchestration
 */
export interface OrchestrationResult<T> {
  success: boolean;
  data: T;
  error?: string;
  errorCode?: string;
  metrics: {
    executionTime: number;
    cacheUsed: boolean;
    componentsUsed: string[];
    path: string[];
    timestamp?: number;
    orchestrationMode?: OrchestrationMode;
    [key: string]: unknown;
  };
}

/**
 * Interface pour un résultat de validation
 */
export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * =======================================================
 * INTERFACES D'EXPRESSIONS ET GESTES LSF
 * =======================================================
 */

/**
 * Données d'expression pour le rendu LSF
 */
export interface ExpressionData {
  facialExpressions: FacialExpressionFrame[];
  gestures: GestureFrame[];
  spatialReferences: SpatialReference[];
  temporalMarkers: TemporalMarker[];
  nonManualElements: NonManualElement[];
}

/**
 * Cadre d'expression faciale
 */
export interface FacialExpressionFrame {
  timestamp: number;
  duration: number;
  eyebrows?: EyebrowsPosition;
  eyes?: EyesPosition;
  mouth?: MouthPosition;
  cheeks?: CheeksPosition;
  head?: HeadPosition;
  intensity: number;
}

/**
 * Cadre de geste
 */
export interface GestureFrame {
  timestamp: number;
  duration: number;
  leftHand?: HandPosition;
  rightHand?: HandPosition;
  movement?: Movement;
  contactPoint?: ContactPoint;
  intensity: number;
}

/**
 * Variation dialectale
 */
export interface DialectVariation {
  region: string;
  expressionChanges: {
    originalId: string;
    replacementId: string;
    confidence: number; // 0.0 à 1.0
    validatedByNative: boolean;
  }[];
  culturalNotes?: string;
}

/**
 * Interface pour les dialectes supportés
 */
export interface DialectInfo {
  supportedVariants: string[];
  defaultVariant: string;
  variantsDescription: Record<string, string>;
}

/**
 * =======================================================
 * INTERFACES DE GESTION DES ERREURS
 * =======================================================
 */

/**
 * Informations d'erreur
 */
export interface ErrorInfo {
  code: string;
  message: string;
  component: ComponentType;
  severity: ErrorSeverity;
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Interface pour une alerte système
 */
export interface Alert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * =======================================================
 * CONFIGURATION DE L'ORCHESTRATEUR
 * =======================================================
 */

/**
 * Configuration de l'orchestrateur
 */
export interface OrchestratorConfig {
  id: string;
  version: string;
  maxConcurrentRequests: number;
  defaultRequestTimeout: number;
  enablePerformanceMonitoring: boolean;
  monitoringInterval: number;
  cacheConfig: CacheConfig;
  modules: Record<string, boolean>; // Activation/désactivation des modules
  defaultRequestPriority: TaskPriority;
  logLevel: string;
}

/**
 * Interface pour les options d'orchestration
 */
export interface OrchestratorOptions {
  cacheEnabled?: boolean;
  monitoringLevel?: 'basic' | 'advanced' | 'detailed';
  initialMode?: OrchestrationMode;
  maxPendingRequests?: number;
  autoRecover?: boolean;
  preloadModels?: boolean;
  ethicsLevel?: 'standard' | 'enhanced' | 'strict';
}

/**
 * Interface pour l'état du système orchestrateur
 */
export interface OrchestratorState {
  status: SystemState;
  uptime: number;
  components: Record<string, string>;
  pendingRequests: number;
  alerts: number;
  systemLoad: {
    cpu: number;
    memory: number;
    network: number;
  };
}

/**
 * Interface pour les statistiques de performance
 */
export interface PerformanceStats {
  system: Record<string, number>;
  cache: Record<string, number>;
  components: Record<string, Record<string, number>>;
  monitoring: Record<string, number>;
}

/**
 * Interface pour les événements d'optimisation
 */
export interface OptimizationEvent {
  timestamp: number;
  resourceType: string;
  metricName: string;
  currentValue: number;
  optimizationReason: string;
}

/**
 * =======================================================
 * RÉ-EXPORTATION DES TYPES LSF
 * =======================================================
 */

// Ré-exportation des types LSF
export type {
  // Composants faciaux
  EyebrowsPosition,
  EyesPosition,
  EyeDirection,
  MouthPosition,
  CheeksPosition,
  HeadPosition,
  HeadMovementType,

  // Composants manuels
  HandPosition,
  HandConfiguration,
  HandOrientation,

  // Composants spatiaux
  Orientation3D,
  Location3D,

  // Mouvement
  Movement,
  MovementPath,
  MovementPathType,

  // Contact
  ContactPoint,
  ContactType,
  ContactLocation,

  // Références et marqueurs
  SpatialReference,
  SpatialReferenceType,
  TemporalMarker,
  TemporalMarkerType,

  // Éléments non-manuels
  NonManualElement,
  NonManualElementType,

  // Fonctions grammaticales
  GrammaticalFunction
};