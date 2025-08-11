// src/ai/validation/interfaces/ICollaborationManager.ts

import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ValidationState,
    Result,
    NotificationContext,
    PaginationOptions,
    PaginatedResult,
    ValidationStateChange,
    ValidationEventCallback,
    ValidationEventType
} from '../types';

/**
 * Interface pour le gestionnaire de collaboration
 * Responsable de coordonner les interactions entre experts
 */
export interface ICollaborationManager {
    /**
     * Initialise le gestionnaire de collaboration
     * @returns Résultat de l'initialisation avec erreurs détaillées si échec
     */
    initialize(): Promise<Result<void>>;

    /**
     * Soumet une proposition pour validation
     * @param request Requête de validation
     * @returns Résultat contenant l'ID de validation créé
     */
    submitProposal(request: CollaborativeValidationRequest): Promise<Result<string>>;

    /**
     * Ajoute un retour d'expert
     * @param validationId ID de la validation
     * @param feedback Retour d'expert
     * @returns Résultat de l'opération avec ID du feedback
     */
    addFeedback(validationId: string, feedback: ValidationFeedback): Promise<Result<string>>;

    /**
     * Obtient tous les retours pour une validation avec pagination
     * @param validationId ID de la validation
     * @param options Options de pagination
     * @returns Liste paginée des retours d'experts
     */
    getAllFeedback(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationFeedback>>>;

    /**
     * Met à jour l'état d'une validation avec une raison et traçabilité
     * @param validationId ID de la validation
     * @param state Nouvel état
     * @param reason Motif du changement
     * @returns Résultat de la mise à jour
     */
    updateValidationState(
        validationId: string,
        state: ValidationState,
        reason?: string
    ): Promise<Result<ValidationStateChange>>;

    /**
     * Obtient l'état actuel d'une validation
     * @param validationId ID de la validation
     * @returns État actuel de la validation
     */
    getValidationState(validationId: string): Promise<Result<ValidationState>>;

    /**
     * Obtient l'historique des changements d'état d'une validation
     * @param validationId ID de la validation
     * @returns Historique des changements d'état
     */
    getValidationHistory(validationId: string): Promise<Result<ValidationStateChange[]>>;

    /**
     * Notifie les experts d'une action requise avec contexte enrichi
     * @param expertIds Liste des IDs d'experts à notifier
     * @param message Message de notification
     * @param context Contexte structuré de la notification
     * @returns Résultat de la notification avec détails des échecs
     */
    notifyExperts(
        expertIds: string[],
        message: string,
        context?: NotificationContext
    ): Promise<Result<{
        successCount: number;
        failedIds?: string[];
    }>>;

    /**
     * S'abonne aux événements de validation
     * @param eventType Type d'événement
     * @param callback Fonction appelée lors de l'événement
     * @returns ID d'abonnement pour pouvoir se désabonner
     */
    subscribeToEvents(
        eventType: ValidationEventType | 'all',
        callback: ValidationEventCallback
    ): string;

    /**
     * Désabonnement des événements
     * @param subscriptionId ID d'abonnement obtenu lors de l'abonnement
     * @returns Succès du désabonnement
     */
    unsubscribeFromEvents(subscriptionId: string): boolean;

    /**
     * Recherche avancée de validations
     * @param criteria Critères de recherche
     * @param options Options de pagination
     * @returns Résultats de recherche paginés
     */
    searchValidations(
        criteria: {
            states?: ValidationState[];
            expertIds?: string[];
            dateRange?: { start?: Date; end?: Date };
            keywords?: string[];
            metadata?: Record<string, unknown>;
        },
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<CollaborativeValidationRequest>>>;

    /**
     * Exécute des opérations groupées dans une transaction logique
     * @param operations Fonction exécutant plusieurs opérations
     * @returns Résultat global de la transaction
     */
    transaction<T>(
        operations: (manager: ICollaborationManager) => Promise<T>
    ): Promise<Result<T>>;

    /**
     * Libère les ressources et arrête le gestionnaire
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    shutdown(force?: boolean): Promise<Result<void>>;
}