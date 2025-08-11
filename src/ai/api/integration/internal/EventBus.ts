/**
 * @file src/ai/api/integration/internal/EventBus.ts
 * @description Bus d'événements pour la communication asynchrone entre composants
 */

import { Logger } from '../../../../utils/Logger';

/**
 * Type pour les gestionnaires d'événements
 */
type EventHandler = (data: any) => void;

/**
 * Interface d'un événement
 */
interface EventMessage {
    type: string;
    data: any;
    timestamp: number;
    id: string;
}

/**
 * Bus d'événements permettant la communication asynchrone entre composants
 */
export class EventBus {
    private static instance: EventBus;
    private readonly logger: Logger;
    private readonly handlers: Map<string, Set<EventHandler>>;
    private readonly history: EventMessage[];
    private readonly maxHistorySize: number;

    /**
     * Constructeur privé pour le singleton
     */
    constructor() {
        this.logger = new Logger('EventBus');
        this.handlers = new Map<string, Set<EventHandler>>();
        this.history = [];
        this.maxHistorySize = 100; // Garde les 100 derniers événements

        this.logger.info('EventBus initialized');
    }

    /**
     * Obtient l'instance unique du bus d'événements
     * @returns Instance du bus d'événements
     */
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * Enregistre un gestionnaire pour un type d'événement
     * @param eventType - Type d'événement
     * @param handler - Fonction de gestion
     */
    public on(eventType: string, handler: EventHandler): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set<EventHandler>());
        }

        this.handlers.get(eventType)!.add(handler);
        this.logger.debug(`Handler registered for event type: ${eventType}`);
    }

    /**
     * Désenregistre un gestionnaire pour un type d'événement
     * @param eventType - Type d'événement
     * @param handler - Fonction de gestion
     */
    public off(eventType: string, handler: EventHandler): void {
        if (!this.handlers.has(eventType)) {
            return;
        }

        const handlers = this.handlers.get(eventType)!;
        handlers.delete(handler);

        if (handlers.size === 0) {
            this.handlers.delete(eventType);
        }

        this.logger.debug(`Handler unregistered for event type: ${eventType}`);
    }

    /**
     * Émet un événement
     * @param eventType - Type d'événement
     * @param data - Données associées à l'événement
     */
    public emit(eventType: string, data: any): void {
        // Créer le message d'événement
        const event: EventMessage = {
            type: eventType,
            data,
            timestamp: Date.now(),
            id: this.generateEventId()
        };

        // Ajouter à l'historique
        this.addToHistory(event);

        // Notifier les gestionnaires
        if (this.handlers.has(eventType)) {
            const handlers = this.handlers.get(eventType)!;

            for (const handler of handlers) {
                try {
                    // Exécuter de manière asynchrone
                    setTimeout(() => {
                        try {
                            handler(data);
                        } catch (error) {
                            this.logger.error(`Error in handler for event ${eventType}: ${error}`);
                        }
                    }, 0);
                } catch (error) {
                    this.logger.error(`Error scheduling handler for event ${eventType}: ${error}`);
                }
            }

            this.logger.debug(`Event ${eventType} emitted to ${handlers.size} handlers`);
        } else {
            this.logger.debug(`Event ${eventType} emitted but no handlers registered`);
        }
    }

    /**
     * Émet un événement et attend que tous les gestionnaires aient terminé
     * @param eventType - Type d'événement
     * @param data - Données associées à l'événement
     * @returns Promise résolue lorsque tous les gestionnaires ont terminé
     */
    public async emitAsync(eventType: string, data: any): Promise<void> {
        // Créer le message d'événement
        const event: EventMessage = {
            type: eventType,
            data,
            timestamp: Date.now(),
            id: this.generateEventId()
        };

        // Ajouter à l'historique
        this.addToHistory(event);

        // Notifier les gestionnaires
        if (this.handlers.has(eventType)) {
            const handlers = Array.from(this.handlers.get(eventType)!);

            // Exécuter tous les gestionnaires en parallèle
            const promises = handlers.map(handler =>
                new Promise<void>(resolve => {
                    try {
                        const result = handler(data);

                        // Si le gestionnaire retourne une promesse, l'attendre
                        if (result instanceof Promise) {
                            result.then(() => resolve()).catch(error => {
                                this.logger.error(`Error in async handler for event ${eventType}: ${error}`);
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    } catch (error) {
                        this.logger.error(`Error in handler for event ${eventType}: ${error}`);
                        resolve();
                    }
                })
            );

            // Attendre que tous les gestionnaires aient terminé
            await Promise.all(promises);

            this.logger.debug(`Async event ${eventType} completed by ${handlers.length} handlers`);
        } else {
            this.logger.debug(`Async event ${eventType} emitted but no handlers registered`);
        }
    }

    /**
     * Émet un événement une seule fois puis supprime tous les gestionnaires
     * @param eventType - Type d'événement
     * @param data - Données associées à l'événement
     */
    public once(eventType: string, handler: EventHandler): void {
        // Créer un wrapper qui se supprime après exécution
        const onceHandler = (data: any) => {
            // Supprimer le gestionnaire
            this.off(eventType, onceHandler);

            // Appeler le gestionnaire original
            handler(data);
        };

        // Enregistrer le wrapper
        this.on(eventType, onceHandler);
        this.logger.debug(`One-time handler registered for event type: ${eventType}`);
    }

    /**
     * Obtient l'historique des événements
     * @param eventType - Type d'événement (optionnel)
     * @param limit - Nombre maximum d'événements à retourner
     * @returns Liste des événements
     */
    public getHistory(eventType?: string, limit?: number): EventMessage[] {
        let events = this.history;

        // Filtrer par type d'événement si spécifié
        if (eventType) {
            events = events.filter(event => event.type === eventType);
        }

        // Limiter le nombre d'événements si spécifié
        if (limit && limit > 0) {
            events = events.slice(-limit);
        }

        return [...events]; // Copie pour éviter les modifications externes
    }

    /**
     * Supprime tous les gestionnaires d'événements
     */
    public clearAllHandlers(): void {
        this.handlers.clear();
        this.logger.info('All event handlers cleared');
    }

    /**
     * Supprime tous les gestionnaires pour un type d'événement
     * @param eventType - Type d'événement
     */
    public clearHandlersForEvent(eventType: string): void {
        this.handlers.delete(eventType);
        this.logger.info(`Handlers for event type ${eventType} cleared`);
    }

    /**
     * Ajoute un événement à l'historique
     * @param event - Événement à ajouter
     */
    private addToHistory(event: EventMessage): void {
        this.history.push(event);

        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Génère un identifiant unique pour un événement
     * @returns Identifiant unique
     */
    private generateEventId(): string {
        return Math.random().toString(36).