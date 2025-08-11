//src/ai/validation/services/EventManager.ts
import { ValidationEventType, ValidationEventCallback } from '../types';

/**
 * Interface pour la configuration du gestionnaire d'événements
 */
export interface EventManagerConfig {
    /**
     * Nombre maximum d'abonnements autorisés
     */
    maxSubscriptions?: number;

    /**
     * Activer la journalisation des événements
     */
    enableLogging?: boolean;

    /**
     * Niveau de détail de la journalisation
     */
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Gestionnaire d'événements pour le système de validation
 * Responsable de la gestion des abonnements et du déclenchement des événements
 */
export class EventManager {
    private subscriptions = new Map<string, {
        eventType: ValidationEventType | 'all';
        callback: ValidationEventCallback;
    }>();

    private readonly config: Required<EventManagerConfig>;

    /**
     * Crée une nouvelle instance du gestionnaire d'événements
     * @param config Configuration du gestionnaire
     */
    constructor(config: EventManagerConfig = {}) {
        this.config = {
            maxSubscriptions: config.maxSubscriptions || 1000,
            enableLogging: config.enableLogging || false,
            logLevel: config.logLevel || 'error'
        };
    }

    /**
     * S'abonne à un type d'événement spécifique
     * @param eventType Type d'événement auquel s'abonner
     * @param callback Fonction à appeler lors du déclenchement de l'événement
     * @returns Identifiant d'abonnement unique
     */
    subscribe(eventType: ValidationEventType | 'all', callback: ValidationEventCallback): string {
        // Vérifier si le nombre maximum d'abonnements est atteint
        if (this.subscriptions.size >= this.config.maxSubscriptions) {
            this.logWarn(`Maximum number of subscriptions (${this.config.maxSubscriptions}) reached. Cannot add more.`);
            throw new Error(`Maximum number of subscriptions (${this.config.maxSubscriptions}) reached`);
        }

        // Générer un identifiant unique pour l'abonnement
        const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Enregistrer l'abonnement
        this.subscriptions.set(subscriptionId, { eventType, callback });

        this.logInfo(`New subscription created: ${subscriptionId} for event type: ${eventType}`);

        return subscriptionId;
    }

    /**
     * Se désabonne d'un événement
     * @param subscriptionId Identifiant d'abonnement à supprimer
     * @returns true si l'abonnement a été trouvé et supprimé, false sinon
     */
    unsubscribe(subscriptionId: string): boolean {
        const exists = this.subscriptions.has(subscriptionId);

        if (exists) {
            this.subscriptions.delete(subscriptionId);
            this.logInfo(`Subscription removed: ${subscriptionId}`);
        } else {
            this.logWarn(`Attempted to unsubscribe non-existent subscription: ${subscriptionId}`);
        }

        return exists;
    }

    /**
     * Déclenche un événement pour tous les abonnés concernés
     * @param validationId Identifiant de la validation concernée
     * @param eventType Type d'événement déclenché
     * @param data Données associées à l'événement
     */
    trigger(validationId: string, eventType: ValidationEventType, data: unknown): void {
        this.logDebug(`Triggering event: ${eventType} for validation: ${validationId}`);

        let callbackCount = 0;
        let errorCount = 0;

        // Appeler tous les callbacks concernés
        this.subscriptions.forEach((subscription, subscriptionId) => {
            if (subscription.eventType === 'all' || subscription.eventType === eventType) {
                try {
                    subscription.callback(validationId, eventType, data);
                    callbackCount++;
                } catch (error) {
                    errorCount++;
                    this.logError(
                        `Error in event callback for subscription ${subscriptionId}: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }
        });

        this.logInfo(`Event ${eventType} triggered: ${callbackCount} callbacks executed, ${errorCount} errors`);
    }

    /**
     * Supprime tous les abonnements
     */
    clear(): void {
        const count = this.subscriptions.size;
        this.subscriptions.clear();
        this.logInfo(`Cleared all ${count} subscriptions`);
    }

    /**
     * Retourne le nombre d'abonnements actifs
     */
    get subscriptionCount(): number {
        return this.subscriptions.size;
    }

    /**
     * Retourne les abonnements pour un type d'événement spécifique
     * @param eventType Type d'événement à filtrer
     * @returns Nombre d'abonnements pour ce type d'événement
     */
    getSubscriptionCountByType(eventType: ValidationEventType | 'all'): number {
        let count = 0;

        this.subscriptions.forEach((subscription) => {
            if (subscription.eventType === eventType || subscription.eventType === 'all') {
                count++;
            }
        });

        return count;
    }

    // Méthodes de journalisation privées
    private logError(message: string): void {
        if (this.config.enableLogging && ['error'].includes(this.config.logLevel)) {
            console.error(`[EventManager] ERROR: ${message}`);
        }
    }

    private logWarn(message: string): void {
        if (this.config.enableLogging && ['error', 'warn'].includes(this.config.logLevel)) {
            console.warn(`[EventManager] WARN: ${message}`);
        }
    }

    private logInfo(message: string): void {
        if (this.config.enableLogging && ['error', 'warn', 'info'].includes(this.config.logLevel)) {
            console.info(`[EventManager] INFO: ${message}`);
        }
    }

    private logDebug(message: string): void {
        if (this.config.enableLogging && ['error', 'warn', 'info', 'debug'].includes(this.config.logLevel)) {
            console.debug(`[EventManager] DEBUG: ${message}`);
        }
    }
}

// Singleton pour un accès global
let globalEventManager: EventManager | null = null;

/**
 * Obtient l'instance globale du gestionnaire d'événements
 * @param config Configuration optionnelle (utilisée uniquement lors de la première initialisation)
 * @returns Instance du gestionnaire d'événements
 */
export function getEventManager(config?: EventManagerConfig): EventManager {
    if (!globalEventManager) {
        globalEventManager = new EventManager(config);
    }
    return globalEventManager;
}

/**
 * Réinitialise l'instance globale du gestionnaire d'événements
 * Utile principalement pour les tests
 */
export function resetEventManager(): void {
    if (globalEventManager) {
        globalEventManager.clear();
        globalEventManager = null;
    }
}