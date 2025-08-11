//src/ai/validation/interfaces/IFeedbackManager.ts
import {
    ValidationFeedback,
    PaginationOptions,
    PaginatedResult,
    Result,
    NotificationContext
} from '../types';

/**
 * Interface pour le gestionnaire de feedback des validations
 * Responsable de la gestion des retours d'experts
 */
export interface IFeedbackManager {
    /**
     * Ajoute un feedback d'expert à une validation
     * @param validationId ID de la validation
     * @param feedback Feedback de l'expert
     */
    addFeedback(validationId: string, feedback: ValidationFeedback): Promise<Result<string>>;

    /**
     * Obtient tous les feedbacks pour une validation
     * @param validationId ID de la validation
     * @param options Options de pagination
     */
    getAllFeedback(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationFeedback>>>;

    /**
     * Notifie les experts d'une action requise
     * @param expertIds Liste des IDs d'experts à notifier
     * @param message Message de notification
     * @param context Contexte de la notification
     */
    notifyExperts(
        expertIds: string[],
        message: string,
        context?: NotificationContext
    ): Promise<Result<{ successCount: number; failedIds?: string[] }>>;

    /**
     * Obtient un feedback spécifique
     * @param feedbackId ID du feedback
     */
    getFeedback(feedbackId: string): Promise<Result<ValidationFeedback>>;

    /**
     * Met à jour un feedback existant
     * @param feedbackId ID du feedback
     * @param updates Mises à jour à appliquer
     */
    updateFeedback(
        feedbackId: string,
        updates: Partial<ValidationFeedback>
    ): Promise<Result<ValidationFeedback>>;
}