//src/ai/validation/interfaces/IValidationStateManager.ts
import {
    ValidationState,
    ValidationStateChange,
    Result,
    PaginationOptions,
    PaginatedResult
} from '../types';

/**
 * Interface pour le gestionnaire d'état des validations
 * Responsable de la gestion des transitions d'état et de l'historique
 */
export interface IValidationStateManager {
    /**
     * Met à jour l'état d'une validation
     * @param validationId ID de la validation
     * @param newState Nouvel état
     * @param reason Raison du changement d'état
     * @param changedBy Entité ayant effectué le changement
     */
    updateState(
        validationId: string,
        newState: ValidationState,
        reason?: string,
        changedBy?: string
    ): Promise<Result<ValidationStateChange>>;

    /**
     * Récupère l'état actuel d'une validation
     * @param validationId ID de la validation
     */
    getCurrentState(validationId: string): Promise<Result<ValidationState>>;

    /**
     * Récupère l'historique des changements d'état d'une validation
     * @param validationId ID de la validation
     * @param options Options de pagination
     */
    getStateHistory(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationStateChange>>>;

    /**
     * Vérifie si une transition d'état est valide
     * @param validationId ID de la validation
     * @param targetState État cible
     */
    canTransitionTo(
        validationId: string,
        targetState: ValidationState
    ): Promise<Result<boolean>>;

    /**
     * Récupère les états possibles à partir de l'état actuel
     * @param validationId ID de la validation
     */
    getPossibleTransitions(
        validationId: string
    ): Promise<Result<ValidationState[]>>;
}