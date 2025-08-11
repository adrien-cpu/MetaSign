//src/ai/validation/implementations/FeedbackManager.ts
import {
    ValidationFeedback,
    PaginationOptions,
    PaginatedResult,
    Result,
    NotificationContext,
    ValidationEventType,
    ValidationState
} from '../types';
import { IFeedbackManager } from '../interfaces/IFeedbackManager';
import { IEventManager } from '../interfaces/IEventManager';
import { IValidationStateManager } from '../interfaces/IValidationStateManager';
import { BaseManager, BaseManagerConfig } from './BaseManager';
import {
    notFound,
    invalidState,
    success,
    tryCatch,
    failure,
    notInitialized,
    ErrorCode
} from '../utils/result-helpers';
import {
    ValidationFeedbackValidator
} from '../utils/validation-helpers';
import {
    normalizePaginationOptions
} from '../utils/pagination-helpers';

/**
 * Configuration pour le FeedbackManager
 */
export interface FeedbackManagerConfig extends BaseManagerConfig {
    /**
     * Nombre minimum de feedbacks requis pour déclencher une transition d'état
     */
    minFeedbackForTransition?: number;
}

/**
 * Implémentation du gestionnaire de feedback
 */
export class FeedbackManager extends BaseManager implements IFeedbackManager {
    private readonly feedbackMap = new Map<string, ValidationFeedback[]>();
    private readonly feedbackById = new Map<string, ValidationFeedback>();
    private readonly validationMap = new Map<string, string[]>(); // Map validationId -> feedbackIds
    private readonly feedbackValidator: ValidationFeedbackValidator;
    private readonly stateManager: IValidationStateManager;
    protected readonly managerConfig: Required<Pick<FeedbackManagerConfig, 'minFeedbackForTransition'>>;

    /**
     * Crée une nouvelle instance de FeedbackManager
     * @param eventManager Gestionnaire d'événements
     * @param stateManager Gestionnaire d'états
     * @param config Configuration optionnelle
     */
    constructor(
        eventManager: IEventManager,
        stateManager: IValidationStateManager,
        config: FeedbackManagerConfig = {}
    ) {
        super(eventManager, 'FeedbackManager', config);

        this.stateManager = stateManager;
        this.feedbackValidator = new ValidationFeedbackValidator();

        this.managerConfig = {
            minFeedbackForTransition: config.minFeedbackForTransition || 3
        };
    }

    /**
     * Ajoute un feedback d'expert à une validation
     * @param validationId ID de la validation
     * @param feedback Feedback de l'expert
     */
    async addFeedback(validationId: string, feedback: ValidationFeedback): Promise<Result<string>> {
        const initCheck = this.checkInitialized();
        if (initCheck) {
            return notInitialized<string>('FeedbackManager');
        }

        // Vérifier que l'état actuel permet l'ajout de feedback
        const stateResult = await this.stateManager.getCurrentState(validationId);
        if (!stateResult.success) {
            return failure<string>(
                stateResult.error?.code || ErrorCode.INVALID_STATE,
                stateResult.error?.message || `Failed to get state for validation ${validationId}`,
                stateResult.error?.details
            );
        }

        const currentState = stateResult.data;
        if (!currentState) {
            return failure<string>(
                ErrorCode.INVALID_STATE,
                `Invalid state for validation ${validationId}`,
                { validationId }
            );
        }

        const allowedStates = [
            ValidationState.SUBMITTED,
            ValidationState.PENDING,
            ValidationState.IN_REVIEW,
            ValidationState.FEEDBACK_COLLECTING
        ];

        if (!allowedStates.includes(currentState)) {
            return invalidState(
                'validation',
                validationId,
                currentState.toString(),
                allowedStates.map(s => s.toString())
            );
        }

        // Valider le feedback
        const validationResult = this.feedbackValidator.validate(feedback);
        if (!validationResult.success) {
            return failure<string>(
                validationResult.error?.code || ErrorCode.INVALID_DATA,
                validationResult.error?.message || 'Invalid feedback data',
                validationResult.error?.details
            );
        }

        return tryCatch(
            async () => {
                // Générer un ID unique pour le feedback
                const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                // Enrichir le feedback avec des métadonnées
                const enrichedFeedback: ValidationFeedback = {
                    ...feedback,
                    id: feedbackId,
                    validationId,
                    timestamp: feedback.timestamp || new Date()
                };

                // Stocker le feedback
                if (!this.feedbackMap.has(validationId)) {
                    this.feedbackMap.set(validationId, []);
                    this.validationMap.set(validationId, []);
                }

                const feedbacks = this.feedbackMap.get(validationId);
                if (feedbacks) {
                    feedbacks.push(enrichedFeedback);
                }

                this.feedbackById.set(feedbackId, enrichedFeedback);

                const feedbackIds = this.validationMap.get(validationId);
                if (feedbackIds) {
                    feedbackIds.push(feedbackId);
                }

                // Déclencher l'événement de feedback ajouté
                this.eventManager.trigger(
                    validationId,
                    ValidationEventType.FEEDBACK_ADDED,
                    { feedback: enrichedFeedback }
                );

                this.logInfo(`Feedback added: ${feedbackId} for validation: ${validationId}`);

                // Gérer les transitions d'état
                await this.handleStateTransitions(validationId);

                return feedbackId;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to add feedback'
        );
    }

    /**
     * Obtient tous les feedbacks pour une validation
     * @param validationId ID de la validation
     * @param options Options de pagination
     */
    async getAllFeedback(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationFeedback>>> {
        const initCheck = this.checkInitialized();
        if (initCheck) {
            return notInitialized<PaginatedResult<ValidationFeedback>>('FeedbackManager');
        }

        return tryCatch(
            async () => {
                // Récupérer tous les feedbacks pour cette validation
                const feedbacks = this.feedbackMap.get(validationId) || [];

                // Normaliser les options de pagination
                const normalizedOptions = normalizePaginationOptions(options);

                // Appliquer la pagination manuellement
                const totalItems = feedbacks.length;
                const page = normalizedOptions.page || 1;
                const limit = normalizedOptions.limit || 10;
                const totalPages = Math.ceil(totalItems / limit);
                const startIndex = (page - 1) * limit;
                const endIndex = Math.min(startIndex + limit, totalItems);
                const items = feedbacks.slice(startIndex, endIndex);

                return {
                    items,
                    page,
                    total: totalItems,
                    pageCount: totalPages
                };
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to retrieve feedback'
        );
    }

    /**
     * Notifie les experts d'une action requise
     * @param expertIds Liste des IDs d'experts à notifier
     * @param message Message de notification
     * @param context Contexte de la notification
     */
    async notifyExperts(
        expertIds: string[],
        message: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context?: NotificationContext
    ): Promise<Result<{ successCount: number; failedIds?: string[] }>> {
        const initCheck = this.checkInitialized();
        if (initCheck) {
            return notInitialized<{ successCount: number; failedIds?: string[] }>('FeedbackManager');
        }

        return tryCatch<{ successCount: number; failedIds?: string[] }>(
            async () => {
                // Dans une implémentation réelle, cette méthode enverrait des notifications
                // par email, push, etc.

                this.logInfo(`Notifying ${expertIds.length} experts: ${message}`);

                // Simulation : 90% de succès, 10% d'échec aléatoire
                const successfulIds: string[] = [];
                const failedIds: string[] = [];

                for (const expertId of expertIds) {
                    if (Math.random() > 0.1) {
                        successfulIds.push(expertId);
                    } else {
                        failedIds.push(expertId);
                        this.logWarn(`Failed to notify expert: ${expertId}`);
                    }
                }

                // Retourne un objet correctement typé
                return {
                    successCount: successfulIds.length,
                    ...(failedIds.length > 0 ? { failedIds } : {})
                };
            },
            ErrorCode.NOTIFICATION_FAILED,
            'Failed to notify experts'
        );
    }

    /**
     * Obtient un feedback spécifique
     * @param feedbackId ID du feedback
     */
    async getFeedback(feedbackId: string): Promise<Result<ValidationFeedback>> {
        const initCheck = this.checkInitialized();
        if (initCheck) {
            return notInitialized<ValidationFeedback>('FeedbackManager');
        }

        // Vérifier que le feedback existe
        if (!this.feedbackById.has(feedbackId)) {
            return notFound<ValidationFeedback>('feedback', feedbackId);
        }

        const feedback = this.feedbackById.get(feedbackId);
        if (!feedback) {
            return notFound<ValidationFeedback>('feedback', feedbackId);
        }

        return success(feedback);
    }

    /**
     * Met à jour un feedback existant
     * @param feedbackId ID du feedback
     * @param updates Mises à jour à appliquer
     */
    async updateFeedback(
        feedbackId: string,
        updates: Partial<ValidationFeedback>
    ): Promise<Result<ValidationFeedback>> {
        const initCheck = this.checkInitialized();
        if (initCheck) {
            return notInitialized<ValidationFeedback>('FeedbackManager');
        }

        // Vérifier que le feedback existe
        if (!this.feedbackById.has(feedbackId)) {
            return notFound<ValidationFeedback>('feedback', feedbackId);
        }

        const existingFeedback = this.feedbackById.get(feedbackId);
        if (!existingFeedback) {
            return notFound<ValidationFeedback>('feedback', feedbackId);
        }

        return tryCatch(
            async () => {
                // Récupérer l'ID de validation existant
                const existingValidationId = existingFeedback.validationId;

                // Appliquer les mises à jour
                const updatedFeedback: ValidationFeedback = {
                    ...existingFeedback,
                    ...updates,
                    id: existingFeedback.id || feedbackId, // Préserver l'ID original
                    validationId: existingValidationId || '', // Garantir que ce n'est jamais undefined
                    expertId: existingFeedback.expertId, // Préserver l'ID de l'expert
                    isNativeValidator: existingFeedback.isNativeValidator, // Préserver le statut de validateur natif
                    approved: updates.approved !== undefined ? updates.approved : existingFeedback.approved,
                    timestamp: new Date() // Mettre à jour le timestamp
                };

                // Valider le feedback mis à jour
                const validationResult = this.feedbackValidator.validate(updatedFeedback);
                if (!validationResult.success) {
                    throw new Error(`Invalid updated feedback: ${validationResult.error?.message}`);
                }

                // Mettre à jour dans les maps
                this.feedbackById.set(feedbackId, updatedFeedback);

                // Mettre à jour dans la liste des feedbacks
                if (existingValidationId) {
                    const feedbacks = this.feedbackMap.get(existingValidationId) || [];
                    const index = feedbacks.findIndex(f => f.id === feedbackId);

                    if (index !== -1) {
                        feedbacks[index] = updatedFeedback;
                        this.feedbackMap.set(existingValidationId, feedbacks);
                    }

                    this.logInfo(`Feedback updated: ${feedbackId}`);

                    // Déclencher l'événement de feedback mis à jour
                    this.eventManager.trigger(
                        existingValidationId,
                        ValidationEventType.FEEDBACK_ADDED, // Utiliser FEEDBACK_ADDED car FEEDBACK_UPDATED n'existe pas
                        { feedback: updatedFeedback }
                    );
                }

                return updatedFeedback;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to update feedback'
        );
    }

    /**
     * Gère les transitions d'état basées sur les feedbacks reçus
     * @param validationId ID de la validation
     */
    private async handleStateTransitions(validationId: string): Promise<void> {
        // Récupérer l'état actuel
        const stateResult = await this.stateManager.getCurrentState(validationId);
        if (!stateResult.success) {
            this.logError(`Failed to get current state for validation ${validationId}`, {
                error: stateResult.error
            });
            return;
        }

        const currentState = stateResult.data;
        if (!currentState) {
            this.logError(`Current state is undefined for validation ${validationId}`, {
                error: {
                    code: ErrorCode.INVALID_STATE,
                    message: `Invalid state for validation ${validationId}`
                }
            });
            return;
        }

        const feedbacks = this.feedbackMap.get(validationId) || [];

        // Si nous sommes à l'état SUBMITTED et que c'est le premier feedback, passer à IN_REVIEW
        if (currentState === ValidationState.SUBMITTED && feedbacks.length === 1) {
            await this.stateManager.updateState(
                validationId,
                ValidationState.IN_REVIEW,
                'First feedback received',
                'system'
            );
            return;
        }

        // Si nous avons atteint le nombre minimum de feedbacks et que nous ne sommes pas déjà en FEEDBACK_COLLECTING
        if (feedbacks.length >= this.managerConfig.minFeedbackForTransition &&
            currentState !== ValidationState.FEEDBACK_COLLECTING) {
            await this.stateManager.updateState(
                validationId,
                ValidationState.FEEDBACK_COLLECTING,
                'Minimum number of feedbacks reached',
                'system'
            );

            // Déclencher l'événement de feedback suffisant pour le calcul du consensus
            this.eventManager.trigger(
                validationId,
                ValidationEventType.VALIDATION_COMPLETED, // Utiliser un événement existant
                {
                    feedbackCount: feedbacks.length,
                    minRequired: this.managerConfig.minFeedbackForTransition
                }
            );
        }
    }

    /**
     * Implémentation de l'initialisation interne
     */
    protected async initializeInternal(): Promise<void> {
        // Vérifier que le stateManager est disponible
        if (!this.stateManager) {
            throw new Error('State manager is not available');
        }

        this.logInfo('Feedback manager initialized');
    }

    /**
     * Implémentation de l'arrêt interne
     * @param _force Forcer l'arrêt même si des opérations sont en cours
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async shutdownInternal(_force?: boolean): Promise<void> {
        // Rien de spécial à faire, juste vider les maps
        this.feedbackMap.clear();
        this.feedbackById.clear();
        this.validationMap.clear();
    }
}