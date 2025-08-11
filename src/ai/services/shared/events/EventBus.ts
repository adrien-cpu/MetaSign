/**
 * @file src/ai/services/shared/events/EventBus.ts
 * @description Bus d'événements centralisé pour la communication entre services
 * @module EventBus
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module fournit un bus d'événements centralisé pour faciliter la communication
 * entre les différents services de l'application de manière découplée.
 */

/**
 * Interface pour les données d'événement
 * @interface EventPayload
 */
export interface EventPayload {
    [key: string]: unknown;
}

/**
 * Type de callback pour les événements
 */
export type EventCallback = (data: EventPayload) => void;

/**
 * Structure pour l'entrée d'historique d'événement
 * @interface EventHistoryEntry
 */
export interface EventHistoryEntry {
    /**
     * Nom de l'événement
     */
    event: string;

    /**
     * Données de l'événement
     */
    data: EventPayload;

    /**
     * Horodatage
     */
    timestamp: Date;
}

/**
 * Bus d'événements centralisé
 * 
 * @class EventBus
 * @description Permet la communication entre services via un modèle pub/sub
 * 
 * @example
 * ```typescript
 * // Obtenir l'instance
 * const eventBus = EventBus.getInstance();
 * 
 * // S'abonner à un événement
 * const unsubscribe = eventBus.subscribe('user.created', (data) => {
 *   console.log('User created:', data);
 * });
 * 
 * // Publier un événement
 * eventBus.publish('user.created', { id: '123', name: 'John' });
 * 
 * // Se désabonner
 * unsubscribe();
 * ```
 */
export class EventBus {
    /**
     * Instance unique (singleton)
     * @private
     * @static
     */
    private static instance?: EventBus;

    /**
     * Abonnements aux événements
     * @private
     */
    private subscriptions: Map<string, Set<EventCallback>>;

    /**
     * Abonnements génériques (tous les événements)
     * @private
     */
    private globalSubscriptions: Set<EventCallback>;

    /**
     * Historique des événements
     * @private
     */
    private eventHistory: EventHistoryEntry[];

    /**
     * Taille maximale de l'historique
     * @private
     * @readonly
     */
    private readonly maxHistorySize: number;

    /**
     * Mode debug
     * @private
     */
    private debugMode: boolean;

    /**
     * Constructeur du bus d'événements
     * 
     * @constructor
     * @private
     * @param {number} [maxHistorySize=100] - Taille maximale de l'historique
     */
    private constructor(maxHistorySize = 100) {
        this.subscriptions = new Map<string, Set<EventCallback>>();
        this.globalSubscriptions = new Set<EventCallback>();
        this.eventHistory = [];
        this.maxHistorySize = maxHistorySize;
        this.debugMode = false;
    }

    /**
     * Obtient l'instance unique du bus d'événements (singleton)
     * 
     * @method getInstance
     * @static
     * @returns {EventBus} Instance unique du bus d'événements
     * @public
     */
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * S'abonne à un événement
     * 
     * @method subscribe
     * @param {string} event - Nom de l'événement
     * @param {EventCallback} callback - Fonction de rappel
     * @returns {Function} Fonction de désabonnement
     * @public
     */
    public subscribe(event: string, callback: EventCallback): () => void {
        // Créer l'ensemble de callbacks si nécessaire
        if (!this.subscriptions.has(event)) {
            this.subscriptions.set(event, new Set<EventCallback>());
        }

        // Ajouter le callback
        const callbacks = this.subscriptions.get(event)!;
        callbacks.add(callback);

        // Retourner la fonction de désabonnement
        return () => {
            callbacks.delete(callback);

            // Supprimer l'ensemble s'il est vide
            if (callbacks.size === 0) {
                this.subscriptions.delete(event);
            }
        };
    }

    /**
     * S'abonne à tous les événements
     * 
     * @method subscribeToAll
     * @param {EventCallback} callback - Fonction de rappel
     * @returns {Function} Fonction de désabonnement
     * @public
     */
    public subscribeToAll(callback: EventCallback): () => void {
        // Ajouter le callback global
        this.globalSubscriptions.add(callback);

        // Retourner la fonction de désabonnement
        return () => {
            this.globalSubscriptions.delete(callback);
        };
    }

    /**
     * Publie un événement
     * 
     * @method publish
     * @param {string} event - Nom de l'événement
     * @param {EventPayload} [data={}] - Données associées à l'événement
     * @public
     */
    public publish(event: string, data: EventPayload = {}): void {
        // Ajouter à l'historique
        this.addToHistory(event, data);

        // Notifier les abonnés spécifiques
        if (this.subscriptions.has(event)) {
            const callbacks = this.subscriptions.get(event)!;
            for (const callback of callbacks) {
                try {
                    callback(data);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`Error in event callback for ${event}: ${errorMessage}`);
                }
            }
        }

        // Notifier les abonnés globaux
        for (const callback of this.globalSubscriptions) {
            try {
                callback({ event, data });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error in global event callback for ${event}: ${errorMessage}`);
            }
        }

        // Afficher en mode debug
        if (this.debugMode) {
            console.log(`[EventBus] Event '${event}' published:`, data);
        }
    }

    /**
     * Ajoute un événement à l'historique
     * 
     * @method addToHistory
     * @param {string} event - Nom de l'événement
     * @param {EventPayload} data - Données associées à l'événement
     * @private
     */
    private addToHistory(event: string, data: EventPayload): void {
        // Ajouter l'événement à l'historique
        this.eventHistory.push({
            event,
            data,
            timestamp: new Date()
        });

        // Limiter la taille de l'historique
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Obtient l'historique des événements
     * 
     * @method getHistory
     * @returns {EventHistoryEntry[]} Historique des événements
     * @public
     */
    public getHistory(): EventHistoryEntry[] {
        return [...this.eventHistory];
    }

    /**
     * Vide l'historique des événements
     * 
     * @method clearHistory
     * @public
     */
    public clearHistory(): void {
        this.eventHistory = [];
    }

    /**
     * Vide tous les abonnements
     * 
     * @method clearSubscriptions
     * @public
     */
    public clearSubscriptions(): void {
        this.subscriptions.clear();
        this.globalSubscriptions.clear();
    }

    /**
     * Obtient le nombre d'abonnés pour un événement
     * 
     * @method getSubscriberCount
     * @param {string} event - Nom de l'événement
     * @returns {number} Nombre d'abonnés
     * @public
     */
    public getSubscriberCount(event: string): number {
        return this.subscriptions.has(event) ? this.subscriptions.get(event)!.size : 0;
    }

    /**
     * Obtient le nombre total d'abonnés
     * 
     * @method getTotalSubscriberCount
     * @returns {number} Nombre total d'abonnés
     * @public
     */
    public getTotalSubscriberCount(): number {
        let count = this.globalSubscriptions.size;

        for (const callbacks of this.subscriptions.values()) {
            count += callbacks.size;
        }

        return count;
    }

    /**
     * Active ou désactive le mode debug
     * 
     * @method setDebugMode
     * @param {boolean} enabled - Mode debug activé
     * @public
     */
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * Vérifie si un événement a des abonnés
     * 
     * @method hasSubscribers
     * @param {string} event - Nom de l'événement
     * @returns {boolean} Vrai si l'événement a des abonnés
     * @public
     */
    public hasSubscribers(event: string): boolean {
        return this.subscriptions.has(event) && this.subscriptions.get(event)!.size > 0;
    }
}