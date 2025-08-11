//src/ai/validation/interfaces/IValidationManager.ts
import {
    CollaborativeValidationRequest,
    PaginationOptions,
    PaginatedResult,
    Result,
    ValidationState
} from '../types';

/**
 * Interface pour le gestionnaire de base des validations
 * Responsable de la gestion du cycle de vie des validations
 */
export interface IValidationManager {
    /**
     * Soumet une nouvelle proposition pour validation
     * @param request Requête de validation collaborative
     */
    submitProposal(request: CollaborativeValidationRequest): Promise<Result<string>>;

    /**
     * Obtient l'état actuel d'une validation
     * @param validationId ID de la validation
     */
    getValidationState(validationId: string): Promise<Result<ValidationState>>;

    /**
     * Met à jour l'état d'une validation
     * @param validationId ID de la validation
     * @param state Nouvel état
     * @param reason Raison du changement d'état
     */
    updateValidationState(
        validationId: string,
        state: ValidationState,
        reason?: string
    ): Promise<Result<void>>;

    /**
     * Recherche de validations selon des critères
     * @param criteria Critères de recherche
     * @param options Options de pagination
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
     * Obtient les détails d'une validation
     * @param validationId ID de la validation
     */
    getValidationDetails(validationId: string): Promise<Result<CollaborativeValidationRequest>>;
}