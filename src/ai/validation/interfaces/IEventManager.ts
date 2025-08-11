//src/ai/validation/interfaces/IEventManager.ts
import { ValidationEventType } from '../types';

/**
 * Interface pour le gestionnaire d'événements
 * Responsable de la gestion des événements et des abonnements
 */
export interface IEventManager {
    /**
     * Déclenche un événement
     * @param validationId ID de la validation concernée
     * @param eventType Type d'événement
     * @param data Données associées à l'événement
     */
    trigger(
        validationId: string,
        eventType: ValidationEventType,
        data: unknown
    ): void;

    /**
     * S'abonne à un type d'événement
     * @param eventType Type d'événement ou 'all' pour tous les événements
     * @param callback Fonction à appeler lors de l'événement
     * @returns ID d'abonnement
     */
    subscribe(
        eventType: ValidationEventType | 'all',
        callback: (validationId: string, eventType: ValidationEventType, data: unknown) => void
    ): string;

    /**
     * Se désabonne d'un événement
     * @param subscriptionId ID d'abonnement
     * @returns Succès du désabonnement
     */
    unsubscribe(subscriptionId: string): boolean;

    /**
     * Nettoie tous les abonnements
     */
    clearSubscriptions(): void;

    /**
     * Obtient le nombre d'abonnements actifs
     */
    getSubscriptionCount(): number;
}

/**
 * Configuration pour le gestionnaire d'événements
 */
export interface EventManagerConfig {
    /**
     * Active la journalisation des événements
     */
    enableLogging: boolean;

    /**
     * Niveau de détail de la journalisation
     */
    logLevel: 'error' | 'warn' | 'info' | 'debug';
}