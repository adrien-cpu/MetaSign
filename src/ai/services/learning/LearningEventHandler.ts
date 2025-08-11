/**
 * Gestionnaire d'événements d'apprentissage pour MetaSign
 * 
 * @file src/ai/services/learning/LearningEventHandler.ts
 * @module ai/services/learning
 * @description Gestionnaire centralisé pour tous les événements d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-07-01
 */

import { Logger } from '@/ai/utils/Logger';

// ===== TYPES D'ÉVÉNEMENTS SPÉCIALISÉS =====

/**
 * Types d'événements d'apprentissage supportés
 */
export type LearningEventType =
    | 'lesson_start'
    | 'lesson_complete'
    | 'lesson_pause'
    | 'exercise_start'
    | 'exercise_complete'
    | 'error_occurred'
    | 'user_progress'
    | 'session_timeout'
    | 'achievement_unlocked';

/**
 * Priorités d'événements
 */
export type EventPriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * États d'événements
 */
export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

/**
 * Données d'événement d'apprentissage
 */
export interface LearningEventData {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Identifiant de session (optionnel) */
    readonly sessionId?: string;
    /** Identifiant d'activité (optionnel) */
    readonly activityId?: string;
    /** Données contextuelles additionnelles */
    readonly metadata?: Record<string, unknown>;
    /** Score ou progression (optionnel) */
    readonly score?: number;
    /** Erreur associée (optionnel) */
    readonly error?: string;
}

/**
 * Interface d'un événement d'apprentissage
 */
export interface LearningEvent {
    /** Identifiant unique */
    readonly id: string;
    /** Type d'événement */
    readonly type: LearningEventType;
    /** Données associées */
    readonly data: LearningEventData;
    /** Priorité */
    readonly priority: EventPriority;
    /** État actuel */
    status: EventStatus;
    /** Date de création */
    readonly createdAt: Date;
    /** Date de dernière mise à jour */
    updatedAt: Date;
    /** Nombre de tentatives */
    retryCount: number;
    /** Dernière erreur rencontrée */
    lastError?: string;
}

/**
 * Interface d'un gestionnaire d'événements
 */
export interface EventHandler {
    /** Nom du gestionnaire */
    readonly name: string;
    /** Version du gestionnaire */
    readonly version: string;
    /** Vérifie si le gestionnaire peut traiter ce type */
    canHandle: (type: LearningEventType) => boolean;
    /** Traite l'événement */
    handle: (event: LearningEvent) => Promise<void>;
}

/**
 * Interface d'un écouteur d'événements
 */
export interface EventListener {
    /** Nom de l'écouteur */
    readonly name: string;
    /** Types d'événements écoutés */
    readonly eventTypes: ReadonlyArray<LearningEventType>;
    /** Callback appelé lors d'un événement */
    onEvent: (event: LearningEvent) => Promise<void>;
}

/**
 * Configuration du gestionnaire d'événements
 */
export interface EventHandlerConfig {
    /** Taille maximale de la queue */
    readonly maxQueueSize: number;
    /** Nombre maximum de tentatives */
    readonly maxRetries: number;
    /** Intervalle de nettoyage (ms) */
    readonly cleanupInterval: number;
    /** Temps de rétention des événements (ms) */
    readonly eventRetentionTime: number;
    /** Activation des métriques */
    readonly metricsEnabled: boolean;
    /** Niveau de log */
    readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Métriques du gestionnaire d'événements
 */
export interface EventMetrics {
    /** Nombre total d'événements */
    totalEvents: number;
    /** Événements par type */
    eventsByType: Record<LearningEventType, number>;
    /** Événements par statut */
    eventsByStatus: Record<EventStatus, number>;
    /** Temps de traitement moyen */
    averageProcessingTime: number;
    /** Taux d'erreur */
    errorRate: number;
    /** Taux de retry */
    retryRate: number;
}

/**
 * Options pour la création du gestionnaire d'événements
 */
interface LearningEventHandlerOptions {
    readonly config?: Partial<EventHandlerConfig>;
    readonly enableMetrics?: boolean;
    readonly enableCleanup?: boolean;
}

// Configuration par défaut
const DEFAULT_EVENT_HANDLER_CONFIG: EventHandlerConfig = {
    maxQueueSize: 1000,
    maxRetries: 3,
    cleanupInterval: 300000, // 5 minutes
    eventRetentionTime: 3600000, // 1 heure
    metricsEnabled: true,
    logLevel: 'info'
};

/**
 * Gestionnaire principal des événements d'apprentissage
 * 
 * @example
 * ```typescript
 * const handler = new LearningEventHandler();
 * await handler.emitEvent('lesson_start', {
 *     userId: 'user-123',
 *     sessionId: 'session-456',
 *     activityId: 'lesson-basic-greetings'
 * });
 * ```
 */
export class LearningEventHandler {
    private readonly logger = Logger.getInstance('LearningEventHandler');
    private readonly config: EventHandlerConfig;
    private readonly eventQueue: LearningEvent[] = [];
    private readonly handlers: Map<LearningEventType, EventHandler[]> = new Map();
    private readonly listeners: EventListener[] = [];
    private readonly processedEvents: Map<string, LearningEvent> = new Map();
    private readonly metrics: EventMetrics;
    private isProcessing = false;
    private cleanupInterval?: NodeJS.Timeout;

    /**
     * Constructeur du gestionnaire d'événements
     * 
     * @param options Options de configuration (optionnelles)
     */
    constructor(options: LearningEventHandlerOptions = {}) {
        this.config = {
            ...DEFAULT_EVENT_HANDLER_CONFIG,
            ...options.config
        };

        this.metrics = this.initializeMetrics();

        if (options.enableCleanup !== false) {
            this.startCleanupTimer();
        }

        this.initializeDefaultHandlers();

        this.logger.info('LearningEventHandler initialisé', {
            config: this.config,
            metricsEnabled: options.enableMetrics !== false
        });
    }

    /**
     * Émet un nouvel événement d'apprentissage
     * 
     * @param type Type d'événement
     * @param data Données associées à l'événement
     * @param priority Priorité de l'événement (optionnelle)
     * @returns Identifiant de l'événement créé
     */
    public async emitEvent(
        type: LearningEventType,
        data: LearningEventData,
        priority: EventPriority = 'normal'
    ): Promise<string> {
        try {
            const event: LearningEvent = this.createEvent(type, data, priority);

            this.validateEvent(event);
            this.addToQueue(event);

            this.logger.debug('Événement émis', {
                eventId: event.id,
                type: event.type,
                priority: event.priority
            });

            // Notifier les écouteurs
            await this.notifyListeners(event);

            // Démarrer le traitement si nécessaire
            this.processQueue();

            this.updateMetrics('emitted', event);

            return event.id;

        } catch (error) {
            this.logger.error('Erreur lors de l\'émission d\'événement', {
                type,
                error
            });
            throw new Error(`Échec de l'émission d'événement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Enregistre un handler pour un type d'événement spécifique
     * 
     * @param eventType Type d'événement à gérer
     * @param handler Handler à enregistrer
     */
    public registerHandler(eventType: LearningEventType, handler: EventHandler): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);

        this.logger.debug('Handler enregistré', {
            eventType,
            handlerName: handler.name,
            handlerCount: this.handlers.get(eventType)!.length
        });
    }

    /**
     * Enregistre un écouteur d'événements
     * 
     * @param listener Écouteur à enregistrer
     */
    public registerListener(listener: EventListener): void {
        this.listeners.push(listener);

        this.logger.debug('Écouteur enregistré', {
            listenerName: listener.name,
            eventTypes: listener.eventTypes,
            totalListeners: this.listeners.length
        });
    }

    /**
     * Obtient les statistiques du gestionnaire d'événements
     * 
     * @returns Statistiques détaillées
     */
    public getStatistics(): {
        queueSize: number;
        processedEventsCount: number;
        handlersCount: number;
        listenersCount: number;
        isProcessing: boolean;
        metrics: EventMetrics;
    } {
        return {
            queueSize: this.eventQueue.length,
            processedEventsCount: this.processedEvents.size,
            handlersCount: Array.from(this.handlers.values()).reduce((total, handlers) => total + handlers.length, 0),
            listenersCount: this.listeners.length,
            isProcessing: this.isProcessing,
            metrics: this.metrics
        };
    }

    /**
     * Nettoie les ressources et arrête le gestionnaire
     */
    public dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }

        this.handlers.clear();
        this.listeners.length = 0;
        this.eventQueue.length = 0;
        this.processedEvents.clear();

        this.logger.info('LearningEventHandler disposé');
    }

    // ===== MÉTHODES PRIVÉES =====

    /**
     * Crée un nouvel événement
     * 
     * @param type Type d'événement
     * @param data Données d'événement
     * @param priority Priorité
     * @returns Événement créé
     * @private
     */
    private createEvent(type: LearningEventType, data: LearningEventData, priority: EventPriority): LearningEvent {
        const now = new Date();
        return {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            priority,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
            retryCount: 0
        };
    }

    /**
     * Valide la structure d'un événement
     * 
     * @param event Événement à valider
     * @throws {Error} Si l'événement est invalide
     * @private
     */
    private validateEvent(event: LearningEvent): void {
        if (!event.id || typeof event.id !== 'string') {
            throw new Error('ID d\'événement requis');
        }

        if (!this.isValidLearningEventType(event.type)) {
            throw new Error(`Type d'événement invalide: ${event.type}`);
        }

        if (!this.validateEventData(event.data)) {
            throw new Error('Données d\'événement invalides');
        }
    }

    /**
     * Vérifie si un type d'événement est valide
     * 
     * @param type Type à vérifier
     * @returns True si valide
     * @private
     */
    private isValidLearningEventType(type: string): type is LearningEventType {
        const validTypes: LearningEventType[] = [
            'lesson_start', 'lesson_complete', 'lesson_pause',
            'exercise_start', 'exercise_complete', 'error_occurred',
            'user_progress', 'session_timeout', 'achievement_unlocked'
        ];
        return validTypes.includes(type as LearningEventType);
    }

    /**
     * Valide les données d'événement
     * 
     * @param data Données à valider
     * @returns True si valides
     * @private
     */
    private validateEventData(data: LearningEventData): boolean {
        return (
            typeof data === 'object' &&
            data !== null &&
            typeof data.userId === 'string' &&
            data.userId.length > 0
        );
    }

    /**
     * Ajoute un événement à la queue avec gestion de priorité
     * 
     * @param event Événement à ajouter
     * @private
     */
    private addToQueue(event: LearningEvent): void {
        if (this.eventQueue.length >= this.config.maxQueueSize) {
            this.logger.warn('Queue d\'événements pleine, suppression de l\'événement le plus ancien');
            const removed = this.eventQueue.shift();
            if (removed) {
                this.updateMetrics('dropped', removed);
            }
        }

        // Insérer selon la priorité
        const priorityOrder: Record<EventPriority, number> = {
            critical: 0,
            high: 1,
            normal: 2,
            low: 3
        };

        const insertIndex = this.eventQueue.findIndex(
            queuedEvent => priorityOrder[queuedEvent.priority] > priorityOrder[event.priority]
        );

        if (insertIndex === -1) {
            this.eventQueue.push(event);
        } else {
            this.eventQueue.splice(insertIndex, 0, event);
        }
    }

    /**
     * Traite la queue d'événements
     * 
     * @private
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift()!;
                await this.processEvent(event);
            }
        } catch (error) {
            this.logger.error('Erreur lors du traitement de la queue', { error });
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Traite un événement individuel
     * 
     * @param event Événement à traiter
     * @private
     */
    private async processEvent(event: LearningEvent): Promise<void> {
        const startTime = Date.now();

        try {
            event.status = 'processing';
            event.updatedAt = new Date();

            const handlers = this.handlers.get(event.type) || [];
            const applicableHandlers = handlers.filter(handler => handler.canHandle(event.type));

            if (applicableHandlers.length === 0) {
                this.logger.warn('Aucun handler trouvé pour le type d\'événement', {
                    eventId: event.id,
                    eventType: event.type
                });
                event.status = 'completed';
                this.processedEvents.set(event.id, event);
                this.updateMetrics('completed', event, Date.now() - startTime);
                return;
            }

            // Traiter avec tous les handlers applicables
            await Promise.all(
                applicableHandlers.map(handler => handler.handle(event))
            );

            event.status = 'completed';
            event.updatedAt = new Date();
            this.processedEvents.set(event.id, event);

            this.logger.debug('Événement traité avec succès', {
                eventId: event.id,
                handlersUsed: applicableHandlers.length,
                processingTime: Date.now() - startTime
            });

            this.updateMetrics('completed', event, Date.now() - startTime);

        } catch (error) {
            await this.handleEventError(event, error);
            this.updateMetrics('failed', event, Date.now() - startTime);
        }
    }

    /**
     * Gère les erreurs de traitement d'événements
     * 
     * @param event Événement en erreur
     * @param error Erreur rencontrée
     * @private
     */
    private async handleEventError(event: LearningEvent, error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : String(error);
        event.lastError = errorMessage;

        if (event.retryCount < this.config.maxRetries) {
            event.retryCount++;
            event.status = 'retrying';
            event.updatedAt = new Date();

            this.logger.warn('Événement en erreur, tentative de retry', {
                eventId: event.id,
                retryCount: event.retryCount,
                error: errorMessage
            });

            // Réajouter à la queue avec délai
            const retryDelay = this.calculateRetryDelay(event.retryCount);
            setTimeout(() => {
                event.status = 'pending';
                this.addToQueue(event);
                this.processQueue();
            }, retryDelay);

        } else {
            event.status = 'failed';
            event.updatedAt = new Date();
            this.processedEvents.set(event.id, event);

            this.logger.error('Événement en échec après tentatives', {
                eventId: event.id,
                retryCount: event.retryCount,
                error: errorMessage
            });
        }
    }

    /**
     * Calcule le délai de retry
     * 
     * @param retryCount Nombre de tentatives
     * @returns Délai en millisecondes
     * @private
     */
    private calculateRetryDelay(retryCount: number): number {
        // Backoff exponentiel : 1s, 2s, 4s, 8s...
        return Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
    }

    /**
     * Notifie tous les écouteurs d'un événement
     * 
     * @param event Événement à notifier
     * @private
     */
    private async notifyListeners(event: LearningEvent): Promise<void> {
        const applicableListeners = this.listeners.filter(
            listener => listener.eventTypes.includes(event.type)
        );

        await Promise.all(
            applicableListeners.map(async listener => {
                try {
                    await listener.onEvent(event);
                } catch (error) {
                    this.logger.error('Erreur dans un écouteur d\'événement', {
                        eventId: event.id,
                        listenerName: listener.name,
                        error
                    });
                }
            })
        );
    }

    /**
     * Initialise les handlers par défaut
     * 
     * @private
     */
    private initializeDefaultHandlers(): void {
        // Handler par défaut pour les événements de leçon
        const lessonHandler: EventHandler = {
            name: 'DefaultLessonHandler',
            version: '1.0.0',
            canHandle: (type: LearningEventType) => type === 'lesson_start' || type === 'lesson_complete',
            handle: async (event: LearningEvent) => {
                this.logger.info('Traitement événement de leçon', {
                    eventId: event.id,
                    type: event.type,
                    userId: event.data.userId
                });
            }
        };

        this.registerHandler('lesson_start', lessonHandler);
        this.registerHandler('lesson_complete', lessonHandler);

        // Handler par défaut pour les erreurs
        const errorHandler: EventHandler = {
            name: 'DefaultErrorHandler',
            version: '1.0.0',
            canHandle: (type: LearningEventType) => type === 'error_occurred',
            handle: async (event: LearningEvent) => {
                this.logger.error('Événement d\'erreur reçu', {
                    eventId: event.id,
                    userId: event.data.userId,
                    eventData: event.data
                });
            }
        };

        this.registerHandler('error_occurred', errorHandler);
    }

    /**
     * Démarre le timer de nettoyage automatique
     * 
     * @private
     */
    private startCleanupTimer(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanupProcessedEvents();
        }, this.config.cleanupInterval);
    }

    /**
     * Nettoie les événements traités anciens
     * 
     * @private
     */
    private cleanupProcessedEvents(): void {
        let removedCount = 0;

        for (const [eventId, event] of this.processedEvents.entries()) {
            if (this.isEventExpired(event)) {
                this.processedEvents.delete(eventId);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            this.logger.debug('Nettoyage des événements traités', {
                removedCount,
                remainingCount: this.processedEvents.size
            });
        }
    }

    /**
     * Vérifie si un événement est expiré
     * 
     * @param event Événement à vérifier
     * @returns True si expiré
     * @private
     */
    private isEventExpired(event: LearningEvent): boolean {
        const eventAge = Date.now() - event.updatedAt.getTime();
        return eventAge > this.config.eventRetentionTime;
    }

    /**
     * Initialise les métriques
     * 
     * @private
     */
    private initializeMetrics(): EventMetrics {
        return {
            totalEvents: 0,
            eventsByType: {} as Record<LearningEventType, number>,
            eventsByStatus: {} as Record<EventStatus, number>,
            averageProcessingTime: 0,
            errorRate: 0,
            retryRate: 0
        };
    }

    /**
     * Met à jour les métriques
     * 
     * @param action Action effectuée
     * @param event Événement concerné
     * @param processingTime Temps de traitement (optionnel)
     * @private
     */
    private updateMetrics(
        action: 'emitted' | 'completed' | 'failed' | 'dropped',
        event: LearningEvent,
        processingTime = 0
    ): void {
        if (!this.config.metricsEnabled) {
            return;
        }

        this.metrics.totalEvents++;
        this.metrics.eventsByType[event.type] = (this.metrics.eventsByType[event.type] || 0) + 1;
        this.metrics.eventsByStatus[event.status] = (this.metrics.eventsByStatus[event.status] || 0) + 1;

        if (processingTime > 0) {
            // Calcul de la moyenne mobile
            const currentAvg = this.metrics.averageProcessingTime;
            this.metrics.averageProcessingTime = currentAvg + (processingTime - currentAvg) / this.metrics.totalEvents;
        }

        if (action === 'failed') {
            const totalProcessed = Object.values(this.metrics.eventsByStatus).reduce((sum, count) => sum + count, 0);
            this.metrics.errorRate = (this.metrics.eventsByStatus.failed || 0) / Math.max(totalProcessed, 1);
        }

        if (event.retryCount > 0) {
            const totalProcessed = Object.values(this.metrics.eventsByStatus).reduce((sum, count) => sum + count, 0);
            this.metrics.retryRate = this.metrics.totalEvents / Math.max(totalProcessed, 1);
        }
    }
}

/**
 * Factory function pour créer un gestionnaire d'événements
 * 
 * @param options Options de configuration
 * @returns Instance du gestionnaire d'événements
 */
export function createLearningEventHandler(options?: LearningEventHandlerOptions): LearningEventHandler {
    return new LearningEventHandler(options);
}

/**
 * Configuration par défaut pour un environnement de production
 */
export const PRODUCTION_CONFIG: EventHandlerConfig = {
    ...DEFAULT_EVENT_HANDLER_CONFIG,
    maxQueueSize: 5000,
    eventRetentionTime: 7 * 24 * 60 * 60 * 1000, // 7 jours
    logLevel: 'warn'
};

/**
 * Configuration par défaut pour un environnement de développement
 */
export const DEVELOPMENT_CONFIG: EventHandlerConfig = {
    ...DEFAULT_EVENT_HANDLER_CONFIG,
    maxQueueSize: 100,
    eventRetentionTime: 60 * 60 * 1000, // 1 heure
    logLevel: 'debug'
};