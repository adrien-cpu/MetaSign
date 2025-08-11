/**
 * @file src/ai/services/learning/registry/managers/EventManager.ts
 * @description Gestionnaire d'événements pour le registre de services
 * @module EventManager
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère les événements liés au registre de services d'apprentissage.
 */

/**
 * Interface pour les données d'événement
 * @interface EventData
 */
export interface EventData {
    [key: string]: unknown;
}

/**
 * Type des écouteurs d'événements
 */
type EventListener = (event: string, data?: EventData) => void;

/**
 * Gestionnaire d'événements pour le registre de services
 * 
 * @class EventManager
 * @description Gère la publication et l'abonnement aux événements liés
 * au registre de services.
 */
export class EventManager {
    /**
     * Écouteurs d'événements
     * @private
     */
    private listeners: Map<string, EventListener[]>;

    /**
     * Écouteurs génériques (tous les événements)
     * @private
     */
    private globalListeners: EventListener[];

    /**
     * Constructeur du gestionnaire d'événements
     * 
     * @constructor
     */
    constructor() {
        this.listeners = new Map<string, EventListener[]>();
        this.globalListeners = [];
    }

    /**
     * Ajoute un écouteur d'événements
     * 
     * @method addEventListener
     * @param {string} event - Nom de l'événement
     * @param {EventListener} listener - Fonction de rappel
     * @public
     */
    public addEventListener(event: string, listener: EventListener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event)!.push(listener);
    }

    /**
     * Supprime un écouteur d'événements
     * 
     * @method removeEventListener
     * @param {string} event - Nom de l'événement
     * @param {EventListener} listener - Fonction de rappel à supprimer
     * @public
     */
    public removeEventListener(event: string, listener: EventListener): void {
        if (!this.listeners.has(event)) {
            return;
        }

        const listeners = this.listeners.get(event)!;
        const index = listeners.indexOf(listener);

        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Ajoute un écouteur pour tous les événements
     * 
     * @method addGlobalEventListener
     * @param {EventListener} listener - Fonction de rappel
     * @public
     */
    public addGlobalEventListener(listener: EventListener): void {
        this.globalListeners.push(listener);
    }

    /**
     * Supprime un écouteur global
     * 
     * @method removeGlobalEventListener
     * @param {EventListener} listener - Fonction de rappel à supprimer
     * @public
     */
    public removeGlobalEventListener(listener: EventListener): void {
        const index = this.globalListeners.indexOf(listener);

        if (index !== -1) {
            this.globalListeners.splice(index, 1);
        }
    }

    /**
     * Publie un événement
     * 
     * @method publishEvent
     * @param {string} event - Nom de l'événement
     * @param {EventData} [data] - Données associées à l'événement
     * @public
     */
    public publishEvent(event: string, data?: EventData): void {
        // Notifier les écouteurs spécifiques
        if (this.listeners.has(event)) {
            for (const listener of this.listeners.get(event)!) {
                try {
                    listener(event, data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            }
        }

        // Notifier les écouteurs globaux
        for (const listener of this.globalListeners) {
            try {
                listener(event, data);
            } catch (error) {
                console.error(`Error in global event listener for ${event}:`, error);
            }
        }
    }

    /**
     * Supprime tous les écouteurs
     * 
     * @method clearEventListeners
     * @public
     */
    public clearEventListeners(): void {
        this.listeners.clear();
        this.globalListeners = [];
    }

    /**
     * Supprime tous les écouteurs pour un événement
     * 
     * @method clearEventListenersForEvent
     * @param {string} event - Nom de l'événement
     * @public
     */
    public clearEventListenersForEvent(event: string): void {
        this.listeners.delete(event);
    }

    /**
     * Obtient le nombre d'écouteurs pour un événement
     * 
     * @method getEventListenerCount
     * @param {string} event - Nom de l'événement
     * @returns {number} Nombre d'écouteurs
     * @public
     */
    public getEventListenerCount(event: string): number {
        return this.listeners.has(event) ? this.listeners.get(event)!.length : 0;
    }

    /**
     * Obtient le nombre total d'écouteurs
     * 
     * @method getTotalListenerCount
     * @returns {number} Nombre total d'écouteurs
     * @public
     */
    public getTotalListenerCount(): number {
        let count = this.globalListeners.length;

        for (const listeners of this.listeners.values()) {
            count += listeners.length;
        }

        return count;
    }
}