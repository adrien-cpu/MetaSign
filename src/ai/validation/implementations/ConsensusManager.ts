//src/ai/validation/implementations/ConsensusManager.ts
import {
    ConsensusResult,
    ConsensusOptions,
    Result,
    ValidationEventType,
    ValidationState,
    ValidationFeedback
} from '../types';
import { IConsensusManager } from '../interfaces/IConsensusManager';
import { IEventManager } from '../interfaces/IEventManager';
import { IValidationStateManager } from '../interfaces/IValidationStateManager';
import { BaseManager, BaseManagerConfig } from './BaseManager';
import {
    failure,
    // notFound - gardé en commentaire pour référence future
    success,
    tryCatch,
    ErrorCode
} from '../utils/result-helpers';

/**
 * Configuration pour le ConsensusManager
 */
export interface ConsensusManagerConfig extends BaseManagerConfig {
    /**
     * Configuration par défaut pour le calcul du consensus
     */
    defaultConsensusOptions?: ConsensusOptions;
}

/**
 * Implémentation du gestionnaire de consensus
 */
export class ConsensusManager extends BaseManager implements IConsensusManager {
    private readonly consensusResults = new Map<string, ConsensusResult>();
    private readonly stateManager: IValidationStateManager;
    private readonly managerConfig: Required<ConsensusManagerConfig>;
    private readonly getFeedbackFunc: (validationId: string) => Promise<ValidationFeedback[]>;
    private readonly getMinFeedbackRequired: (validationId: string) => Promise<number>;

    /**
     * Crée une nouvelle instance de ConsensusManager
     * @param eventManager Gestionnaire d'événements
     * @param stateManager Gestionnaire d'états
     * @param getFeedbackFunc Fonction pour récupérer les feedbacks d'une validation
     * @param getMinFeedbackRequired Fonction pour récupérer le nombre minimum de feedbacks requis
     * @param config Configuration optionnelle
     */
    constructor(
        eventManager: IEventManager,
        stateManager: IValidationStateManager,
        getFeedbackFunc: (validationId: string) => Promise<ValidationFeedback[]>,
        getMinFeedbackRequired: (validationId: string) => Promise<number>,
        config: ConsensusManagerConfig = {}
    ) {
        super(eventManager, 'ConsensusManager', config);

        this.stateManager = stateManager;
        this.getFeedbackFunc = getFeedbackFunc;
        this.getMinFeedbackRequired = getMinFeedbackRequired;

        this.managerConfig = {
            ...this.getDefaultConfig(),
            defaultConsensusOptions: config.defaultConsensusOptions || {
                algorithm: 'weighted',
                approvalThreshold: 0.7,
                minParticipants: 3
            }
        };
    }

    /**
     * Obtient la configuration par défaut
     */
    private getDefaultConfig(): Required<ConsensusManagerConfig> {
        return {
            defaultConsensusOptions: {
                algorithm: 'weighted',
                approvalThreshold: 0.7,
                minParticipants: 3
            },
            logLevel: 'info',
            enableLogging: true,
            appId: 'consensus-manager'
        };
    }

    /**
     * Crée un objet Result typé à partir d'un Result<void>
     * @param result Résultat à convertir
     * @returns Résultat typé
     */
    private createTypedResultFromInitCheck<T>(result: Result<void>): Result<T> {
        if (result.success) {
            // Si le check est successful, on ne devrait jamais arriver ici
            throw new Error('Unexpected successful initialization check result');
        }
        // S'assurer que l'erreur n'est jamais undefined
        const error = result.error || {
            code: ErrorCode.OPERATION_FAILED,
            message: 'Unknown initialization error'
        };
        return {
            success: false,
            error
        };
    }

    /**
     * Calcule le consensus pour une validation
     * @param validationId ID de la validation
     * @param options Options pour le calcul du consensus
     */
    async calculateConsensus(
        validationId: string,
        options?: ConsensusOptions
    ): Promise<Result<ConsensusResult>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<ConsensusResult>(initCheck);
        }

        // Vérifier l'état actuel
        const stateResult = await this.stateManager.getCurrentState(validationId);
        if (!stateResult.success) {
            return {
                success: false,
                error: stateResult.error || {
                    code: ErrorCode.OPERATION_FAILED,
                    message: 'Failed to get current state'
                }
            };
        }

        return tryCatch(
            async () => {
                // Récupérer les feedbacks
                const feedbacks = await this.getFeedbackFunc(validationId);

                // Vérifier s'il y a assez de feedbacks
                const minFeedbackRequired = await this.getMinFeedbackRequired(validationId);

                if (feedbacks.length < minFeedbackRequired) {
                    throw new Error(`Not enough feedback to calculate consensus (${feedbacks.length}/${minFeedbackRequired})`);
                }

                // Mettre à jour l'état si nécessaire
                if (!stateResult.data) {
                    await this.stateManager.updateState(
                        validationId,
                        ValidationState.SUBMITTED,
                        'State was undefined, setting to SUBMITTED',
                        'system'
                    );
                }

                const currentState = stateResult.data || ValidationState.SUBMITTED;

                if (currentState !== ValidationState.CONSENSUS_CALCULATING) {
                    await this.stateManager.updateState(
                        validationId,
                        ValidationState.CONSENSUS_CALCULATING,
                        'Starting consensus calculation',
                        'system'
                    );
                }

                // Calculer le consensus
                const mergedOptions = { ...this.managerConfig.defaultConsensusOptions, ...options };
                const consensusResult = this.calculateConsensusInternal(feedbacks, mergedOptions);

                // Stocker le résultat
                this.consensusResults.set(validationId, consensusResult);

                this.logInfo(`Consensus calculated for validation: ${validationId}, approved: ${consensusResult.approved}`);

                // Mettre à jour l'état
                await this.stateManager.updateState(
                    validationId,
                    ValidationState.CONSENSUS_REACHED,
                    `Consensus ${consensusResult.approved ? 'approved' : 'rejected'} with level ${consensusResult.consensusLevel.toFixed(2)}`,
                    'system'
                );

                // Déclencher l'événement
                this.eventManager.trigger(
                    validationId,
                    ValidationEventType.CONSENSUS_REACHED,
                    { result: consensusResult }
                );

                // Si le consensus est fort, passer automatiquement à l'état final
                if (consensusResult.consensusLevel >= 0.8) {
                    const finalState = consensusResult.approved
                        ? ValidationState.APPROVED
                        : ValidationState.REJECTED;

                    await this.stateManager.updateState(
                        validationId,
                        finalState,
                        `Strong consensus (${consensusResult.consensusLevel.toFixed(2)}) led to automatic ${finalState}`,
                        'system'
                    );
                }

                return consensusResult;
            },
            ErrorCode.CONSENSUS_CALCULATION_FAILED,
            'Failed to calculate consensus'
        );
    }

    /**
     * Récupère le résultat de consensus d'une validation
     * @param validationId ID de la validation
     */
    async getConsensusResult(validationId: string): Promise<Result<ConsensusResult>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<ConsensusResult>(initCheck);
        }

        // Vérifier que le consensus a été calculé
        if (!this.consensusResults.has(validationId)) {
            return failure(
                ErrorCode.RESOURCE_NOT_FOUND,
                'Consensus has not been calculated for this validation',
                { validationId }
            );
        }

        const consensusResult = this.consensusResults.get(validationId)!;
        return success(consensusResult);
    }

    /**
     * Vérifie si le nombre minimum de feedbacks est atteint pour calculer un consensus
     * @param validationId ID de la validation
     */
    async isReadyForConsensus(validationId: string): Promise<Result<boolean>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<boolean>(initCheck);
        }

        return tryCatch(
            async () => {
                const feedbacks = await this.getFeedbackFunc(validationId);
                const minFeedbackRequired = await this.getMinFeedbackRequired(validationId);
                return feedbacks.length >= minFeedbackRequired;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to check consensus readiness'
        );
    }

    /**
     * Annule un consensus et permet à nouveau la collecte de feedbacks
     * @param validationId ID de la validation
     * @param reason Raison de l'annulation
     */
    async reopenConsensus(
        validationId: string,
        reason: string
    ): Promise<Result<void>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return initCheck;
        }

        // Vérifier l'état actuel
        const stateResult = await this.stateManager.getCurrentState(validationId);
        if (!stateResult.success) {
            return {
                success: false,
                error: stateResult.error || {
                    code: ErrorCode.OPERATION_FAILED,
                    message: 'Failed to get current state'
                }
            };
        }

        const currentState = stateResult.data;
        const allowedStates = [
            ValidationState.CONSENSUS_REACHED,
            ValidationState.APPROVED,
            ValidationState.REJECTED
        ];

        if (!currentState || !allowedStates.includes(currentState)) {
            return failure(
                ErrorCode.INVALID_STATE,
                `Cannot reopen consensus for validation in state ${currentState || 'undefined'}`,
                { validationId, currentState, allowedStates }
            );
        }

        return tryCatch(
            async () => {
                // Supprimer le résultat de consensus
                this.consensusResults.delete(validationId);

                // Mettre à jour l'état
                await this.stateManager.updateState(
                    validationId,
                    ValidationState.FEEDBACK_COLLECTING,
                    reason,
                    'system'
                );

                // Déclencher l'événement
                this.eventManager.trigger(
                    validationId,
                    ValidationEventType.STATE_CHANGED, // Utilisation d'un type existant
                    {
                        reason,
                        newState: ValidationState.FEEDBACK_COLLECTING
                    }
                );
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to reopen consensus'
        );
    }

    /**
     * Calcule le consensus à partir des feedbacks
     * @param feedbacks Liste des feedbacks
     * @param options Options pour le calcul du consensus
     */
    private calculateConsensusInternal(
        feedbacks: ValidationFeedback[],
        options: ConsensusOptions
    ): ConsensusResult {
        // Implémentation simplifiée du calcul de consensus

        // Compter les approbations et rejets
        const approvalCount = feedbacks.filter(f => f.approved).length;
        const totalCount = feedbacks.length;

        // Calculer le niveau de consensus (ratio d'accord)
        const consensusLevel = totalCount > 0 ? approvalCount / totalCount : 0;

        // Déterminer si le consensus est une approbation ou un rejet
        const approvalThreshold = typeof options.approvalThreshold === 'number'
            ? options.approvalThreshold
            : 0.7;
        const approved = consensusLevel >= approvalThreshold;

        // Calculer les scores des experts (simulé ici)
        const expertScores = feedbacks.map(f => f.score || (f.approved ? 1 : 0));

        // Convertir les suggestions au format attendu par ConsensusResult
        const formattedSuggestions = feedbacks
            .flatMap(f => f.suggestions || [])
            .map(suggestion => {
                // Création d'un objet vide pour respecter la structure avec propriétés optionnelles
                const result: {
                    field: string;
                    currentValue?: string;
                    proposedValue: string;
                    reason?: string;
                    priority?: 'low' | 'medium' | 'high';
                } = {
                    field: suggestion.field,
                    proposedValue: String(suggestion.proposedValue)
                };

                // Ajout conditionnel des propriétés optionnelles
                if (suggestion.currentValue !== undefined) {
                    result.currentValue = String(suggestion.currentValue);
                }

                if (suggestion.reason) {
                    result.reason = suggestion.reason;
                }

                if (suggestion.priority) {
                    result.priority = suggestion.priority;
                }

                return result;
            });

        // Créer le résultat de consensus
        return {
            approved,
            consensusLevel,
            expertCount: totalCount,
            // Nombre d'experts natifs
            nativeExpertCount: feedbacks.filter(f => f.isNativeValidator).length,
            approvalCount,
            rejectionCount: totalCount - approvalCount,
            consensusDate: new Date(),
            algorithm: options.algorithm || 'weighted',
            expertScores: expertScores.length > 0 ? expertScores : [],
            comments: feedbacks.map(f => f.comments).filter(Boolean) as string[],
            suggestions: formattedSuggestions
        };
    }

    /**
     * Implémentation de l'initialisation interne
     */
    protected async initializeInternal(): Promise<void> {
        // Rien de spécial à initialiser
    }

    /**
     * Implémentation de l'arrêt interne
     */
    protected async shutdownInternal(): Promise<void> {
        // Vider la cache
        this.consensusResults.clear();
    }
}