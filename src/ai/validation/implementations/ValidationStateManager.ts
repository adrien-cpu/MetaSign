// src/ai/validation/implementations/ValidationStateManager.ts
import {
    ValidationState,
    ValidationStateChange,
    Result,
    PaginationOptions,
    PaginatedResult,
    ValidationEventType
} from '@ai/validation/types';
import { IValidationStateManager } from '@ai/validation/interfaces/IValidationStateManager';
import { IEventManager } from '@ai/validation/interfaces/IEventManager';
import { BaseManager, BaseManagerConfig } from './BaseManager';
import {
    failure,
    notFound,
    success,
    tryCatch,
    ErrorCode
} from '@ai/validation/utils/result-helpers';
import {
    StateTransitionValidator
} from '@ai/validation/utils/validation-helpers';
import {
    normalizePaginationOptions
} from '@ai/validation/utils/pagination-helpers';

/**
 * Configuration pour le ValidationStateManager
 */
export interface ValidationStateManagerConfig extends BaseManagerConfig {
    /**
     * Activer la validation des transitions d'état
     */
    enforceValidTransitions?: boolean;
}

/**
 * Implémentation du gestionnaire d'état des validations
 */
export class ValidationStateManager extends BaseManager implements IValidationStateManager {
    private readonly stateMap = new Map<string, ValidationState>();
    private readonly stateHistory = new Map<string, ValidationStateChange[]>();
    protected readonly stateManagerConfig: {
        enforceValidTransitions: boolean;
    };

    /**
     * Crée une nouvelle instance de ValidationStateManager
     * @param eventManager Gestionnaire d'événements
     * @param config Configuration optionnelle
     */
    constructor(
        eventManager: IEventManager,
        config: ValidationStateManagerConfig = {}
    ) {
        super(eventManager, 'ValidationStateManager', config);
        this.stateManagerConfig = {
            enforceValidTransitions: config.enforceValidTransitions !== false // Par défaut, activer la validation
        };
    }

    /**
     * Met à jour l'état d'une validation
     * @param validationId ID de la validation
     * @param newState Nouvel état
     * @param reason Raison du changement d'état
     * @param changedBy Entité ayant effectué le changement
     */
    async updateState(
        validationId: string,
        newState: ValidationState,
        reason?: string,
        changedBy = 'system'
    ): Promise<Result<ValidationStateChange>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Validation state manager not initialized',
                initCheck.error?.details
            );
        }

        // Récupérer l'état actuel
        const currentState = this.stateMap.get(validationId) || ValidationState.UNKNOWN;

        // Valider la transition si nécessaire
        if (this.stateManagerConfig.enforceValidTransitions && currentState !== ValidationState.UNKNOWN) {
            const transitionResult = StateTransitionValidator.validateTransition(currentState, newState);
            if (!transitionResult.success) {
                return failure(
                    ErrorCode.INVALID_STATE,
                    `Invalid state transition from ${currentState} to ${newState}`,
                    transitionResult.error?.details
                );
            }
        }

        return tryCatch(
            async () => {
                // Si l'état ne change pas, renvoyer un succès sans rien faire
                if (currentState === newState) {
                    const unchangedStateChange: ValidationStateChange = {
                        validationId,
                        previousState: currentState,
                        newState,
                        changedBy,
                        changedAt: new Date(),
                        reason: reason || 'State unchanged'
                    };
                    return unchangedStateChange;
                }

                // Mettre à jour l'état
                this.stateMap.set(validationId, newState);

                // Créer un enregistrement de changement d'état
                const stateChange: ValidationStateChange = {
                    validationId,
                    previousState: currentState,
                    newState,
                    changedBy,
                    changedAt: new Date(),
                    reason: reason || 'State updated'
                };

                // Ajouter le changement à l'historique
                if (!this.stateHistory.has(validationId)) {
                    this.stateHistory.set(validationId, []);
                }

                const history = this.stateHistory.get(validationId);
                if (history) {
                    history.push(stateChange);
                }

                this.logInfo(`Validation state updated: ${validationId} from ${currentState} to ${newState}`);

                // Déclencher l'événement de changement d'état
                this.eventManager.trigger(
                    validationId,
                    ValidationEventType.STATE_CHANGED,
                    { stateChange }
                );

                return stateChange;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to update validation state'
        );
    }

    /**
     * Récupère l'état actuel d'une validation
     * @param validationId ID de la validation
     */
    async getCurrentState(validationId: string): Promise<Result<ValidationState>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Validation state manager not initialized',
                initCheck.error?.details
            );
        }

        // Si l'état n'existe pas, renvoyer une erreur
        if (!this.stateMap.has(validationId)) {
            return notFound('validation', validationId);
        }

        const state = this.stateMap.get(validationId);
        if (state === undefined) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Inconsistent state: validation exists but state is undefined'
            );
        }

        return success(state);
    }

    /**
     * Récupère l'historique des changements d'état d'une validation
     * @param validationId ID de la validation
     * @param options Options de pagination
     */
    async getStateHistory(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationStateChange>>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Validation state manager not initialized',
                initCheck.error?.details
            );
        }

        // Si l'historique n'existe pas, renvoyer une erreur
        if (!this.stateHistory.has(validationId)) {
            return notFound('validation', validationId);
        }

        return tryCatch(
            async () => {
                const history = this.stateHistory.get(validationId) || [];

                // Normaliser les options de pagination
                const normalizedOptions = normalizePaginationOptions(options);

                // Implémenter la pagination manuellement pour éviter les problèmes de type
                const totalItems = history.length;
                const page = normalizedOptions.page || 1;
                const pageLimit = normalizedOptions.limit || 10;
                const totalPages = Math.ceil(totalItems / pageLimit);
                const startIndex = (page - 1) * pageLimit;
                const endIndex = Math.min(startIndex + pageLimit, totalItems);
                const items = history.slice(startIndex, endIndex);

                const result: PaginatedResult<ValidationStateChange> = {
                    items,
                    page,
                    total: totalItems,
                    pageCount: totalPages
                };

                return result;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to retrieve state history'
        );
    }

    /**
     * Vérifie si une transition d'état est valide
     * @param validationId ID de la validation
     * @param targetState État cible
     */
    async canTransitionTo(
        validationId: string,
        targetState: ValidationState
    ): Promise<Result<boolean>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Validation state manager not initialized',
                initCheck.error?.details
            );
        }

        // Récupérer l'état actuel
        const stateResult = await this.getCurrentState(validationId);
        if (!stateResult.success) {
            return failure(
                ErrorCode.RESOURCE_NOT_FOUND,
                `Validation not found: ${validationId}`,
                stateResult.error?.details
            );
        }

        // Garantir que currentState est défini
        if (stateResult.data === undefined) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Inconsistent state: validation exists but state is undefined'
            );
        }

        const currentState = stateResult.data;

        return tryCatch(
            async () => {
                // Utiliser le validateur de transitions
                const validationResult = StateTransitionValidator.validateTransition(
                    currentState,
                    targetState
                );
                return validationResult.success;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to check transition validity'
        );
    }

    /**
     * Récupère les états possibles à partir de l'état actuel
     * @param validationId ID de la validation
     */
    async getPossibleTransitions(
        validationId: string
    ): Promise<Result<ValidationState[]>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Validation state manager not initialized',
                initCheck.error?.details
            );
        }

        // Récupérer l'état actuel
        const stateResult = await this.getCurrentState(validationId);
        if (!stateResult.success) {
            return failure(
                ErrorCode.RESOURCE_NOT_FOUND,
                `Validation not found: ${validationId}`,
                stateResult.error?.details
            );
        }

        // Garantir que currentState est défini
        if (stateResult.data === undefined) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Inconsistent state: validation exists but state is undefined'
            );
        }

        const currentState = stateResult.data;

        return tryCatch(
            async () => {
                // Récupérer tous les états possibles
                const allStates = Object.values(ValidationState);

                // Filtrer pour obtenir uniquement les transitions valides
                const possibleStates = allStates.filter(state => {
                    // Ignorer l'état actuel
                    if (state === currentState) return false;

                    // Vérifier si la transition est valide
                    const validationResult = StateTransitionValidator.validateTransition(
                        currentState,
                        state
                    );

                    return validationResult.success;
                });

                return possibleStates;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to retrieve possible transitions'
        );
    }

    /**
     * Implémentation de l'initialisation interne
     */
    protected async initializeInternal(): Promise<void> {
        // Rien de spécial à initialiser
        this.logInfo('ValidationStateManager initialized');
    }

    /**
     * Implémentation de l'arrêt interne
     */
    protected async shutdownInternal(): Promise<void> {
        // Vider les caches
        this.stateMap.clear();
        this.stateHistory.clear();
        this.logInfo('ValidationStateManager shutdown completed');
    }
}