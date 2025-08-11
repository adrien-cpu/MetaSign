// src/ai/validation/implementations/ValidationManager.ts
import {
    CollaborativeValidationRequest,
    PaginationOptions,
    PaginatedResult,
    Result,
    ValidationState,
    ValidationEventType,
} from '@ai/validation/types';
import { IValidationManager } from '@ai/validation/interfaces/IValidationManager';
import { IValidationStateManager } from '@ai/validation/interfaces/IValidationStateManager';
import { IEventManager } from '@ai/validation/interfaces/IEventManager';
import { BaseManager, BaseManagerConfig } from './BaseManager';
import {
    notFound,
    success,
    failure,
    tryCatch,
    notInitialized,
    ErrorCode
} from '@ai/validation/utils/result-helpers';
import {
    ValidationRequestValidator
} from '@ai/validation/utils/validation-helpers';
import {
    normalizePaginationOptions
} from '@ai/validation/utils/pagination-helpers';

/**
 * Configuration pour le ValidationManager
 */
export interface ValidationManagerConfig extends BaseManagerConfig {
    /**
     * Nombre minimum de feedbacks requis par défaut
     */
    defaultMinFeedbackRequired?: number;
}

/**
 * Implémentation du gestionnaire de validations
 */
export class ValidationManager extends BaseManager implements IValidationManager {
    private readonly validations = new Map<string, CollaborativeValidationRequest>();
    private readonly requestValidator: ValidationRequestValidator;
    private readonly stateManager: IValidationStateManager;
    protected readonly managerConfig: {
        defaultMinFeedbackRequired: number;
    };

    /**
     * Crée une nouvelle instance de ValidationManager
     * @param eventManager Gestionnaire d'événements
     * @param stateManager Gestionnaire d'états
     * @param config Configuration optionnelle
     */
    constructor(
        eventManager: IEventManager,
        stateManager: IValidationStateManager,
        config: ValidationManagerConfig = {}
    ) {
        super(eventManager, 'ValidationManager', config);

        this.stateManager = stateManager;
        this.requestValidator = new ValidationRequestValidator();

        this.managerConfig = {
            defaultMinFeedbackRequired: config.defaultMinFeedbackRequired || 3
        };
    }

    /**
     * Soumet une proposition pour validation
     * @param request Requête de validation
     */
    async submitProposal(request: CollaborativeValidationRequest): Promise<Result<string>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return notInitialized<string>('ValidationManager');
        }

        // Valider la requête
        const validationResult = this.requestValidator.validate(request);
        if (!validationResult.success) {
            return failure<string>(
                ErrorCode.VALIDATION_ERROR,
                'Invalid validation request',
                { details: validationResult.error?.details }
            );
        }

        return tryCatch(
            async () => {
                // Générer un ID unique pour la validation
                const validationId = `validation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                // Enrichir la requête avec des métadonnées
                const enrichedRequest: CollaborativeValidationRequest = {
                    ...request,
                    id: validationId,
                    submissionDate: new Date(),
                    minFeedbackRequired: request.minFeedbackRequired || this.managerConfig.defaultMinFeedbackRequired
                };

                // Stocker la requête
                this.validations.set(validationId, enrichedRequest);

                // Initialiser l'état à SUBMITTED
                const stateResult = await this.stateManager.updateState(
                    validationId,
                    ValidationState.SUBMITTED,
                    'Initial submission',
                    'system'
                );

                if (!stateResult.success) {
                    this.logError(`Failed to set initial state for validation ${validationId}`, {
                        error: stateResult.error
                    });
                }

                // Déclencher l'événement de soumission
                this.eventManager.trigger(
                    validationId,
                    ValidationEventType.SUBMISSION,
                    enrichedRequest
                );

                this.logInfo(`Validation proposal submitted: ${validationId}`);

                return validationId;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to submit validation proposal'
        );
    }

    /**
     * Obtient l'état actuel d'une validation
     * @param validationId ID de la validation
     */
    async getValidationState(validationId: string): Promise<Result<ValidationState>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return notInitialized<ValidationState>('ValidationManager');
        }

        // Vérifier que la validation existe
        if (!this.validations.has(validationId)) {
            return notFound('validation', validationId);
        }

        return this.stateManager.getCurrentState(validationId);
    }

    /**
     * Met à jour l'état d'une validation
     * @param validationId ID de la validation
     * @param state Nouvel état
     * @param reason Raison du changement d'état
     */
    async updateValidationState(
        validationId: string,
        state: ValidationState,
        reason?: string
    ): Promise<Result<void>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return notInitialized<void>('ValidationManager');
        }

        // Vérifier que la validation existe
        if (!this.validations.has(validationId)) {
            return notFound('validation', validationId);
        }

        const result = await this.stateManager.updateState(
            validationId,
            state,
            reason,
            'system'
        );

        if (!result.success) {
            return failure<void>(
                result.error?.code || ErrorCode.OPERATION_FAILED,
                result.error?.message || 'Failed to update validation state',
                result.error?.details
            );
        }

        return success(undefined);
    }

    /**
     * Recherche de validations selon des critères
     * @param criteria Critères de recherche
     * @param options Options de pagination
     */
    async searchValidations(
        criteria: {
            states?: ValidationState[];
            expertIds?: string[];
            dateRange?: { start?: Date; end?: Date };
            keywords?: string[];
            metadata?: Record<string, unknown>;
        },
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<CollaborativeValidationRequest>>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return notInitialized<PaginatedResult<CollaborativeValidationRequest>>('ValidationManager');
        }

        return tryCatch(
            async () => {
                // Collect validations that match criteria
                const filteredIds: string[] = [];
                const filteredValidations: CollaborativeValidationRequest[] = [];

                // First get all validation IDs
                for (const [id, validation] of this.validations.entries()) {
                    let matches = true;

                    // Filtrage par état
                    if (criteria.states && criteria.states.length > 0) {
                        const stateResult = await this.stateManager.getCurrentState(id);
                        if (!stateResult.success || !stateResult.data) {
                            matches = false;
                        } else if (!criteria.states.includes(stateResult.data)) {
                            matches = false;
                        }
                    }

                    // Autres filtres (expertIds, dateRange, keywords, metadata)
                    // Implémentation simplifiée pour la démonstration

                    if (matches) {
                        filteredIds.push(id);
                        filteredValidations.push(validation);
                    }
                }

                // Normaliser les options de pagination
                const normalizedOptions = normalizePaginationOptions(options);

                // Appliquer la pagination manuellement
                const totalItems = filteredValidations.length;
                const page = normalizedOptions.page || 1;
                const limit = normalizedOptions.limit || 10;
                const totalPages = Math.ceil(totalItems / limit);
                const startIndex = (page - 1) * limit;
                const endIndex = Math.min(startIndex + limit, totalItems);
                const items = filteredValidations.slice(startIndex, endIndex);

                const result: PaginatedResult<CollaborativeValidationRequest> = {
                    items,
                    page,
                    total: totalItems,
                    pageCount: totalPages
                };

                this.logInfo(`Search returned ${result.items.length} results (total: ${result.total})`);

                return result;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to search validations'
        );
    }

    /**
     * Obtient les détails d'une validation
     * @param validationId ID de la validation
     */
    async getValidationDetails(validationId: string): Promise<Result<CollaborativeValidationRequest>> {
        const initCheck = this.checkInitialized();
        if (initCheck && !initCheck.success) {
            return notInitialized<CollaborativeValidationRequest>('ValidationManager');
        }

        // Vérifier que la validation existe
        if (!this.validations.has(validationId)) {
            return notFound('validation', validationId);
        }

        const validation = this.validations.get(validationId);
        if (!validation) {
            return notFound('validation', validationId);
        }

        return success(validation);
    }

    /**
     * Implémentation de l'initialisation interne
     */
    protected async initializeInternal(): Promise<void> {
        // ValidationStateManager n'a pas de méthodes initialize/shutdown, il hérite de BaseManager
        // Nous n'avons pas besoin d'initialiser le state manager car ça sera fait par le parent
        this.logInfo('Validation manager initialized');
    }

    /**
     * Implémentation de l'arrêt interne
     * @param _force Indique si l'arrêt doit être forcé (même s'il y a des opérations en cours)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async shutdownInternal(_force?: boolean): Promise<void> {
        // ValidationStateManager n'a pas de méthodes initialize/shutdown explicites
        // Vider le cache
        this.validations.clear();
        this.logInfo('Validation manager shutdown completed');
    }
}