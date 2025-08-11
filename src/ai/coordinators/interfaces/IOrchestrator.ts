/**
 * @file: src/ai/coordinators/interfaces/IOrchestrator.ts
 * 
 * Interfaces pour les composants de coordination centrale de l'application LSF
 */

import { CacheOptions, ExtendedCacheStats } from '@ai-types/cache';
import {
    OrchestrationRequest,
    OrchestrationResult,
    TaskPriority
} from '@ai-types/orchestration.types';

/**
 * État du système
 */
export enum SystemState {
    /** Système en initialisation */
    INITIALIZING = 'initializing',
    /** Système prêt et opérationnel */
    READY = 'ready',
    /** Système en cours de traitement */
    PROCESSING = 'processing',
    /** Système en pause */
    PAUSED = 'paused',
    /** Système en erreur */
    ERROR = 'error',
    /** Système en cours d'arrêt */
    SHUTTING_DOWN = 'shutting_down',
    /** Système arrêté */
    SHUTDOWN = 'shutdown'
}

/**
 * Priorité des tâches dans le système
 */
export enum RequestPriority {
    /** Priorité la plus basse */
    LOW = 0,
    /** Priorité normale */
    NORMAL = 1,
    /** Priorité haute */
    HIGH = 2,
    /** Priorité critique - exécutée immédiatement */
    CRITICAL = 3
}

/**
 * Utiliser TaskPriority depuis orchestration.types
 */
export { TaskPriority };

/**
 * État d'exécution d'une tâche
 */
export enum TaskState {
    /** Tâche en attente d'exécution */
    PENDING = 'pending',
    /** Tâche en cours d'exécution */
    RUNNING = 'running',
    /** Tâche terminée avec succès */
    COMPLETED = 'completed',
    /** Tâche échouée */
    FAILED = 'failed',
    /** Tâche annulée */
    CANCELLED = 'cancelled',
    /** Tâche en pause */
    PAUSED = 'paused'
}

/**
 * Types d'événements de flux
 */
export enum FlowEventType {
    /** Événement de début de flux */
    FLOW_START = 'flow-start',
    /** Événement de fin de flux */
    FLOW_END = 'flow-end',
    /** Événement d'étape de flux */
    FLOW_STEP = 'flow-step',
    /** Événement d'erreur de flux */
    FLOW_ERROR = 'flow-error',
    /** Événement de décision de flux */
    FLOW_DECISION = 'flow-decision',
    /** Événement de branchement de flux */
    FLOW_BRANCH = 'flow-branch',
    /** Événement de fusion de flux */
    FLOW_MERGE = 'flow-merge',
    /** Événement de validation éthique */
    ETHICAL_VALIDATION = 'ethical-validation',
    /** Événement de performance */
    PERFORMANCE_METRIC = 'performance-metric',
    /** Événement d'entrée utilisateur */
    USER_INPUT = 'user-input',
    /** Événement de sortie système */
    SYSTEM_OUTPUT = 'system-output',
    /** Événement personnalisé */
    CUSTOM = 'custom'
}

/**
 * Métadonnées de tâche
 */
export interface TaskMetadata {
    /** Identifiant de la tâche */
    taskId: string;
    /** Identifiant du flux auquel la tâche appartient */
    flowId?: string;
    /** Étape du flux à laquelle la tâche appartient */
    flowStep?: string;
    /** Contexte de la tâche */
    context?: Record<string, unknown>;
    /** Identifiant utilisateur associé à la tâche */
    userId?: string;
    /** Horodatage de création */
    createdAt: number;
    /** Étiquettes pour la tâche */
    tags?: string[];
    /** Métadonnées de traçabilité */
    tracing?: {
        /** Identifiant de trace */
        traceId: string;
        /** Identifiant du parent */
        parentId?: string;
        /** Durée d'exécution en ms */
        duration?: number;
    };
}

/**
 * Tâche à exécuter dans le système
 */
export interface Task<T = unknown, R = unknown> {
    /** Identifiant unique de la tâche */
    id: string;
    /** Type de tâche */
    type: string;
    /** Données d'entrée de la tâche */
    input: T;
    /** Résultat de la tâche (uniquement disponible après complétion) */
    result?: R;
    /** État de la tâche */
    state: TaskState;
    /** Priorité de la tâche */
    priority: RequestPriority;
    /** Message d'erreur (uniquement si état FAILED) */
    error?: Error | string;
    /** Méthode d'exécution de la tâche */
    execute?: () => Promise<R>;
    /** Fonction de callback à appeler après complétion */
    onComplete?: (result: R) => void;
    /** Fonction de callback à appeler en cas d'erreur */
    onError?: (error: Error) => void;
    /** Délai maximum d'exécution en ms (0 = pas de délai) */
    timeout?: number;
    /** Nombre de tentatives restantes */
    remainingAttempts?: number;
    /** Métadonnées associées à la tâche */
    metadata: TaskMetadata;
}

/**
 * Événement de flux de travail
 */
export interface FlowEvent {
    /** Type d'événement */
    type: FlowEventType | string;
    /** Identifiant du flux */
    flowId: string;
    /** Étape du flux */
    flowStep?: string;
    /** Données associées à l'événement */
    data?: Record<string, unknown>;
    /** Horodatage de l'événement */
    timestamp: number;
    /** Métadonnées de traçabilité */
    tracing?: {
        /** Identifiant de trace */
        traceId: string;
        /** Identifiant du parent */
        parentId?: string;
    };
}

/**
 * Gestionnaire d'événements de flux
 */
export interface FlowEventHandler {
    /** 
     * Méthode de gestion d'un événement
     * @param event Événement à gérer
     */
    handleEvent(event: FlowEvent): Promise<void>;
}

/**
 * Options de routage pour une requête
 */
export interface RoutingOptions {
    /** Priorité de la requête */
    priority?: RequestPriority;
    /** Délai maximum en ms (0 = pas de délai) */
    timeout?: number;
    /** Nombre de tentatives maximum en cas d'échec */
    maxAttempts?: number;
    /** Contexte additionnel */
    context?: Record<string, unknown>;
    /** Identifiant du flux */
    flowId?: string;
    /** Étape du flux */
    flowStep?: string;
    /** Utiliser le cache (true par défaut) */
    useCache?: boolean;
    /** Clé de cache personnalisée */
    cacheKey?: string;
    /** TTL personnalisé pour le cache en ms */
    cacheTTL?: number;
    /** Métadonnées de traçabilité */
    tracing?: {
        /** Identifiant de trace */
        traceId?: string;
        /** Identifiant parent */
        parentId?: string;
    };
}

/**
 * Résultat d'une opération de routage
 */
export interface RoutingResult<T = unknown> {
    /** Résultat de l'opération */
    result: T;
    /** Succès de l'opération */
    success: boolean;
    /** Message d'erreur en cas d'échec */
    error?: string;
    /** Durée de l'opération en ms */
    duration: number;
    /** Indique si le résultat provient du cache */
    fromCache: boolean;
    /** Métadonnées de l'opération */
    metadata: Record<string, unknown>;
}

/**
 * Statistiques de performance du routeur
 */
export interface RouterStats {
    /** Nombre total de requêtes traitées */
    totalRequests: number;
    /** Nombre de requêtes réussies */
    successfulRequests: number;
    /** Nombre de requêtes échouées */
    failedRequests: number;
    /** Nombre de requêtes en cache */
    cachedRequests: number;
    /** Durée moyenne de traitement en ms */
    averageProcessingTime: number;
    /** Durée moyenne en file d'attente en ms */
    averageQueueTime: number;
    /** Requêtes par seconde */
    requestsPerSecond: number;
    /** Nombre de requêtes en attente */
    pendingRequests: number;
    /** Statistiques par type de requête */
    requestTypeStats: Record<string, {
        /** Nombre de requêtes de ce type */
        count: number;
        /** Durée moyenne de traitement en ms */
        averageTime: number;
        /** Taux de succès */
        successRate: number;
        /** Taux d'utilisation du cache */
        cacheHitRate: number;
    }>;
    /** Timestamp de début des statistiques */
    startTime: number;
    /** Durée d'activité en ms */
    uptime: number;
    /** Taux d'erreur global */
    errorRate?: number;
    /** Nombre total de requêtes traitées */
    totalProcessed?: number;
}

/**
 * Interface pour le routeur multimodal
 */
export interface IMultimodalRouter {
    /**
     * Route une requête vers le composant approprié
     * @param requestType Type de requête
     * @param payload Données de la requête
     * @param options Options de routage
     * @returns Résultat de l'opération
     */
    routeRequest<T, R>(
        requestType: string,
        payload: T,
        options?: RoutingOptions
    ): Promise<RoutingResult<R>>;

    /**
     * Enregistre un gestionnaire pour un type de requête
     * @param requestType Type de requête
     * @param handler Fonction de traitement
     * @param metadata Métadonnées du gestionnaire
     */
    registerHandler<T, R>(
        requestType: string,
        handler: (payload: T, options?: RoutingOptions) => Promise<R>,
        metadata?: Record<string, unknown>
    ): void;

    /**
     * Supprime un gestionnaire pour un type de requête
     * @param requestType Type de requête
     * @returns true si le gestionnaire a été supprimé, false sinon
     */
    unregisterHandler(requestType: string): boolean;

    /**
     * Récupère les statistiques de performance du routeur
     * @returns Statistiques de performance
     */
    getStats(): RouterStats;

    /**
     * Réinitialise les statistiques de performance
     */
    resetStats(): void;
}

/**
 * Interface pour le gestionnaire d'événements
 */
export interface IEventManager {
    /**
     * Émet un événement
     * @param type Type d'événement
     * @param payload Données de l'événement
     */
    emit(type: string, payload: Record<string, unknown>): void;

    /**
     * S'abonne à un type d'événement
     * @param type Type d'événement
     * @param handler Fonction à appeler lors de l'événement
     * @returns Identifiant d'abonnement pour désabonnement ultérieur
     */
    subscribe(type: string, handler: (payload: Record<string, unknown>) => void): string;

    /**
     * Se désabonne d'un événement
     * @param subscriptionId Identifiant d'abonnement
     * @returns true si désabonnement réussi, false sinon
     */
    unsubscribe(subscriptionId: string): boolean;
}

/**
 * Interface pour le gestionnaire de cache
 */
export interface ICacheManager {
    /**
     * Récupère une entrée du cache
     * @param key Clé de cache
     * @returns Valeur en cache ou undefined si non trouvée/expirée
     */
    get<T>(key: string): T | undefined;

    /**
     * Stocke une valeur dans le cache
     * @param key Clé de cache
     * @param value Valeur à mettre en cache
     * @param options Options de mise en cache
     */
    set<T>(key: string, value: T, options?: CacheOptions): void;

    /**
     * Supprime une entrée du cache
     * @param key Clé à supprimer
     * @returns true si supprimée avec succès
     */
    delete(key: string): boolean;

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     * @returns true si la clé existe et n'est pas expirée
     */
    has(key: string): boolean;

    /**
     * Vide complètement le cache
     */
    clear(): void;

    /**
     * Récupère les statistiques du cache
     * @returns Statistiques actuelles
     */
    getStats(): ExtendedCacheStats;

    /**
     * Invalide toutes les entrées avec un tag spécifique
     * @param tag Tag à invalider
     * @returns Nombre d'entrées invalidées
     */
    invalidateByTag(tag: string): number;
}

/**
 * Interface pour le moniteur de performance
 */
export interface IPerformanceMonitor {
    /**
     * Démarre la surveillance des performances
     */
    startMonitoring(): void;

    /**
     * Arrête la surveillance des performances
     */
    stopMonitoring(): void;

    /**
     * Récupère les métriques de performance
     * @returns Métriques actuelles
     */
    getMetrics(): Record<string, number>;

    /**
     * Détecte les goulots d'étranglement dans le système
     * @returns Informations sur les goulots d'étranglement
     */
    detectBottlenecks(): Record<string, unknown>;

    /**
     * Met à jour les métriques de requête
     * @param responseTime Temps de réponse en ms
     * @param success Succès de la requête
     */
    updateRequestMetrics(responseTime: number, success: boolean): void;

    /**
     * Met à jour les métriques de cache
     * @param cacheMetrics Métriques de cache
     */
    updateCacheMetrics(cacheMetrics: Record<string, number>): void;
}

/**
 * État du système
 */
export interface SystemHealth {
    /** État global: healthy, degraded, unhealthy */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** État des composants */
    components: Record<string, ComponentHealth>;
    /** Date de dernière vérification */
    lastChecked: Date;
    /** Temps d'activité en ms */
    uptime: number;
    /** Charge actuelle */
    currentLoad: {
        requestsPerSecond: number;
        activeRequests: number;
        queuedRequests: number;
    };
}

/**
 * État d'un composant
 */
export interface ComponentHealth {
    /** État du composant */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Métriques du composant */
    metrics: Record<string, number>;
    /** Message explicatif */
    message?: string;
}

/**
 * Snapshot de performance
 */
export interface PerformanceSnapshot {
    /** Temps de réponse moyen */
    responseTime: number;
    /** Taux de hit du cache */
    cacheHitRatio: number;
    /** Utilisation CPU */
    cpuLoad: number;
    /** Utilisation mémoire */
    memoryUsage: number;
    /** Utilisateurs actifs */
    activeUsers: number;
    /** Timestamp */
    timestamp: Date;
    /** Détails des performances par type de requête */
    requestTypes: Record<string, {
        count: number;
        averageTime: number;
        errorRate: number;
    }>;
}

/**
 * Interface pour l'orchestrateur central du système
 */
export interface IOrchestrator {
    /**
     * Initialise l'orchestrateur
     * @returns Promesse résolvant quand l'initialisation est terminée
     */
    initialize(): Promise<void>;

    /**
     * Soumet une tâche au système
     * @param task Tâche à soumettre
     * @returns Promesse résolvant à la tâche après exécution
     */
    submitTask<T, R>(task: Task<T, R>): Promise<Task<T, R>>;

    /**
     * Crée et soumet une tâche au système
     * @param type Type de tâche
     * @param input Données d'entrée
     * @param options Options supplémentaires
     * @returns Promesse résolvant au résultat de la tâche
     */
    createTask<T, R>(
        type: string,
        input: T,
        options?: Partial<Omit<Task<T, R>, 'id' | 'type' | 'input' | 'state' | 'metadata'>> & { metadata?: Partial<TaskMetadata> }
    ): Promise<R>;

    /**
     * Publie un événement dans le système
     * @param event Événement à publier
     */
    publishEvent(event: FlowEvent): void;

    /**
     * S'abonne à un type d'événement
     * @param eventType Type d'événement
     * @param handler Gestionnaire d'événement
     * @returns Fonction pour se désabonner
     */
    subscribeToEvent(
        eventType: FlowEventType | string,
        handler: (event: FlowEvent) => Promise<void> | void
    ): () => void;

    /**
     * Récupère l'état actuel du système
     * @returns État du système
     */
    getSystemState(): SystemState;

    /**
     * Récupère le routeur multimodal
     * @returns Routeur multimodal
     */
    getRouter(): IMultimodalRouter;

    /**
    * Traite une requête
    * @param request Requête à traiter
    * @returns Résultat orchestré
    */
    processRequest(request: OrchestrationRequest): Promise<OrchestrationResult>;

    /**
     * Obtient l'état de santé du système
     * @returns État de santé du système
     */
    getSystemHealth(): SystemHealth;

    /**
     * Obtient un instantané des performances
     * @returns Instantané des performances
     */
    getPerformanceSnapshot(): PerformanceSnapshot;

    /**
     * Obtient les variantes linguistiques supportées
     * @returns Liste des variantes supportées
     */
    getSupportedLanguageVariants(): string[];

    /**
     * Arrête proprement l'orchestrateur
     */
    shutdown(): Promise<void>;
}

/**
 * Interface simplifiée pour faciliter la rétrocompatibilité
 * @deprecated Utiliser IOrchestrator à la place
 */
export type ICentralOrchestrator = IOrchestrator;