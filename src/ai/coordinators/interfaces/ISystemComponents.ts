//src/ai/coordinations/interfaces/ISystemComponents
import { RequestType } from '../types';

/**
 * Types de composants du système
 */
export enum SystemComponentType {
    CORE = 'core',
    ETHICS = 'ethics',
    LINGUISTIC = 'linguistic',
    EXPRESSION = 'expression',
    LEARNING = 'learning',
    SPATIAL = 'spatial',
    EMOTIONAL = 'emotional',
    SECURITY = 'security',
    MONITORING = 'monitoring',
    VALIDATION = 'validation',
    AVATAR = 'avatar',
    INTEGRATION = 'integration',
    ORCHESTRATOR = 'orchestrator',
    ROUTER = 'router'
}

/**
 * État d'un composant
 */
export enum SystemComponentStatus {
    INITIALIZING = 'initializing',
    READY = 'ready',
    PROCESSING = 'processing',
    DEGRADED = 'degraded',
    ERROR = 'error',
    SHUTDOWN = 'shutdown'
}

/**
 * Métriques de performance d'un composant
 */
export interface ComponentMetrics {
    /** Temps de réponse moyen (ms) */
    averageResponseTime: number;
    /** Taux d'erreur (pourcentage) */
    errorRate: number;
    /** Nombre d'appels total */
    callCount: number;
    /** Utilisation mémoire (Mo) */
    memoryUsage?: number;
    /** Métriques spécifiques au composant */
    custom?: Record<string, number>;
}

/**
 * Capacités d'un composant
 */
export interface ComponentCapabilities {
    /** Types de données en entrée supportés */
    inputTypes: string[];
    /** Types de données en sortie supportés */
    outputTypes: string[];
    /** Fonctionnalités supportées */
    features: string[];
    /** Si le composant peut traiter plusieurs requêtes en parallèle */
    parallelProcessing: boolean;
    /** Limite de requêtes par seconde */
    rateLimit?: number;
}

/**
 * Interface de base pour tous les composants du système
 */
export interface ISystemComponents {
    /**
     * Identifiant unique du composant
     */
    readonly id: string;

    /**
     * Type du composant
     */
    readonly type: SystemComponentType;

    /**
     * Version du composant
     */
    readonly version: string;

    /**
     * Initialise le composant
     * @param config Configuration initiale
     * @returns Promise résolu quand l'initialisation est terminée
     */
    initialize(config?: unknown): Promise<void>;

    /**
     * Traite des données
     * @param data Données à traiter
     * @returns Données traitées
     */
    process<TInput = unknown, TOutput = unknown>(data: TInput): Promise<TOutput>;

    /**
     * Récupère l'état actuel du composant
     * @returns État du composant
     */
    getStatus(): SystemComponentStatus;

    /**
     * Récupère les métriques de performance du composant
     * @returns Métriques du composant
     */
    getMetrics(): ComponentMetrics;

    /**
     * Récupère les capacités du composant
     * @returns Capacités du composant
     */
    getCapabilities(): ComponentCapabilities;

    /**
     * Arrête proprement le composant
     */
    shutdown(): Promise<void>;
}

/**
 * Interface pour les composants avec validation
 */
export interface IValidationComponent extends ISystemComponents {
    /**
     * Valide des données
     * @param data Données à valider
     * @returns Résultat de validation
     */
    validate<T>(data: T): Promise<ValidationResult>;
}

/**
 * Résultat d'une validation
 */
export interface ValidationResult {
    /** Si la validation a réussi */
    valid: boolean;
    /** Raison de l'échec si applicable */
    reason?: string;
    /** Détails des erreurs de validation */
    errors?: ValidationError[];
    /** Score de confiance (0-1) */
    confidence?: number;
}

/**
 * Erreur de validation détaillée
 */
export interface ValidationError {
    /** Code d'erreur */
    code: string;
    /** Message d'erreur */
    message: string;
    /** Chemin de la propriété en erreur */
    path?: string;
    /** Sévérité de l'erreur */
    severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Interface pour les composants d'apprentissage
 */
export interface ILearningComponent extends ISystemComponents {
    /**
     * Apprend à partir de données
     * @param data Données d'apprentissage
     * @returns Résultat de l'apprentissage
     */
    learn<T>(data: T): Promise<LearningResult>;
}

/**
 * Résultat d'un apprentissage
 */
export interface LearningResult {
    /** Si l'apprentissage a réussi */
    success: boolean;
    /** Message d'information */
    message?: string;
    /** Métriques d'apprentissage */
    metrics?: {
        /** Durée de l'apprentissage en ms */
        duration: number;
        /** Amélioration estimée */
        improvement?: number;
        /** Items traités */
        itemsProcessed: number;
    };
}

/**
 * Interface pour un gestionnaire d'événements
 */
export interface EventManager {
    /**
     * Émet un événement
     * @param eventName Nom de l'événement
     * @param data Données de l'événement
     */
    emit(eventName: string, data?: unknown): void;

    /**
     * Enregistre un gestionnaire d'événement
     * @param eventName Nom de l'événement
     * @param handler Gestionnaire d'événement
     */
    on(eventName: string, handler: (data?: unknown) => void): void;

    /**
     * Supprime un gestionnaire d'événement
     * @param eventName Nom de l'événement
     * @param handler Gestionnaire d'événement
     */
    off(eventName: string, handler: (data?: unknown) => void): void;

    /**
     * Enregistre un gestionnaire d'événement pour une seule occurrence
     * @param eventName Nom de l'événement
     * @param handler Gestionnaire d'événement
     */
    once(eventName: string, handler: (data?: unknown) => void): void;
}

/**
 * Interface pour un gestionnaire de performances
 */
export interface PerformanceMonitor {
    /**
     * Démarre la surveillance des performances d'un composant
     * @param componentId Identifiant du composant
     */
    startMonitoring(componentId: string): void;

    /**
     * Arrête la surveillance des performances d'un composant
     * @param componentId Identifiant du composant
     */
    stopMonitoring(componentId: string): void;

    /**
     * Obtient les métriques de performance d'un composant
     * @param componentId Identifiant du composant
     * @returns Métriques de performance
     */
    getComponentMetrics(componentId: string): Record<string, number>;

    /**
     * Définit un seuil d'alerte pour une métrique
     * @param metricName Nom de la métrique
     * @param threshold Valeur seuil
     * @param severity Sévérité de l'alerte
     */
    setThreshold(metricName: string, threshold: number, severity: string): void;

    /**
     * Enregistre l'exécution d'un composant
     * @param componentId Identifiant du composant
     * @param executionTime Temps d'exécution en ms
     */
    recordComponentExecution(componentId: string, executionTime: number): void;

    /**
     * Récupère toutes les métriques
     * @returns Toutes les métriques
     */
    getMetrics(): Record<string, unknown>;
}

/**
 * Interface pour un gestionnaire de cache
 */
export interface ICacheManager {
    /**
     * Récupère une valeur du cache
     * @param key Clé de la valeur à récupérer
     * @returns Valeur associée à la clé, ou undefined si la clé n'existe pas
     */
    get<T>(key: string): T | undefined;

    /**
     * Stocke une valeur dans le cache
     * @param key Clé sous laquelle stocker la valeur
     * @param value Valeur à stocker
     * @param ttl Durée de vie en ms (optionnel)
     */
    set<T>(key: string, value: T, ttl?: number): void;

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     */
    has(key: string): boolean;

    /**
     * Supprime une valeur du cache
     * @param key Clé de la valeur à supprimer
     */
    delete(key: string): boolean;

    /**
     * Vide le cache
     */
    clear(): void;

    /**
     * Récupère les statistiques du cache
     * @returns Statistiques du cache
     */
    getStatistics(): {
        size: number;
        hits: number;
        misses: number;
        [key: string]: number;
    };
}

/**
 * Interface pour un gestionnaire de cache amélioré
 */
export interface EnhancedCacheManager extends ICacheManager {
    /**
     * Précharge des valeurs dans le cache
     * @param entries Entrées à précharger
     */
    preload<T>(entries: Array<{ key: string, value: T, ttl?: number }>): Promise<void>;

    /**
     * Obtient des statistiques avancées sur le cache
     */
    getAdvancedStats(): Promise<Record<string, unknown>>;

    /**
     * Configure le cache
     * @param options Options de configuration
     */
    configure(options: {
        maxSize?: number;
        defaultTTL?: number;
        cleanupInterval?: number;
    }): void;
}

/**
 * Interface pour un système de contrôle éthique
 */
export interface ISystemeControleEthique extends ISystemComponents {
    /**
     * Valide une requête
     * @param request Requête à valider
     * @returns Résultat de la validation
     */
    validateRequest(request: unknown): Promise<EthicsValidationResult>;
}

/**
 * Résultat de validation éthique
 */
export interface EthicsValidationResult {
    /** Si la validation a réussi */
    valid: boolean;
    /** Raison de l'échec si applicable */
    reason?: string;
    /** Détails des erreurs de validation */
    details?: Record<string, unknown>;
    /** Recommandations pour corriger les problèmes */
    recommendedChanges?: string[];
    /** Sévérité des problèmes */
    severity?: 'info' | 'warning' | 'critical';
}

/**
 * Interface pour l'animateur d'expressions
 */
export interface ExpressionAnimator {
    /**
     * Anime une séquence d'expressions
     * @param expressions Expressions à animer
     * @param timing Informations de timing
     * @returns Séquence animée
     */
    animate(expressions: unknown[], timing: unknown): Promise<unknown>;

    /**
     * Obtient l'état actuel de l'animation
     */
    getAnimationState(): Record<string, unknown>;
}

/**
 * Interface pour l'analyseur de patterns LSF
 */
export interface LSFPatternAnalyzer {
    /**
     * Analyse un pattern LSF
     * @param pattern Pattern à analyser
     * @returns Résultat d'analyse
     */
    analyzePattern(pattern: unknown): Promise<unknown>;
}

/**
 * Interface pour le contrôleur de syntaxe des émotions LSF
 */
export interface LSFEmotionSyntaxController {
    /**
     * Contrôle la syntaxe des émotions LSF
     * @param emotions Émotions à contrôler
     * @returns Résultat du contrôle
     */
    controlSyntax(emotions: unknown): Promise<unknown>;
}

/**
 * Interface pour le contexte d'une requête
 */
export interface RequestContext {
    /**
     * Identifiant de la requête
     */
    id: string;

    /**
     * Type de requête
     */
    type: RequestType;

    /**
     * Données de la requête
     */
    data: unknown;

    /**
     * Timestamp de réception
     */
    receivedAt: number;

    /**
     * Timestamp de début de traitement
     */
    processingStartedAt?: number;

    /**
     * Timestamp de fin de traitement
     */
    processingEndedAt?: number;

    /**
     * Priorité de la requête
     */
    priority: number;

    /**
     * État de la requête
     */
    state: 'pending' | 'processing' | 'completed' | 'failed';

    /**
     * Résultat du traitement
     */
    result?: unknown;

    /**
     * Erreur lors du traitement
     */
    error?: Error;

    /**
     * Métadonnées additionnelles
     */
    metadata?: Record<string, unknown>;

    /**
     * Si la requête nécessite une traduction
     */
    requiresTranslation?: boolean;

    /**
     * Si la requête nécessite des expressions
     */
    requiresExpressions?: boolean;

    /**
     * Locale de la requête
     */
    locale?: string;

    /**
     * Texte à traiter
     */
    text?: string;

    /**
     * ID de l'utilisateur
     */
    userId?: string;
}