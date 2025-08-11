// src/ai/validation/services/validation-processing-service.ts

import { EventEmitter } from 'events';
import { Logger } from '@ai/utils/Logger';
import {
    PendingValidation,
    ValidationState,
    ValidationEventType,
    ConsensusResult,
    ValidationEvent,
    ConsensusOptions
} from '@ai/validation/types';
import { IConsensusCalculator } from '@ai/validation/interfaces/collaborative-validation.interfaces';
import { adaptationService } from '@ai/validation/utils/adaptation-service';

/**
 * Service de traitement des validations
 * Gère le traitement périodique et le calcul du consensus
 */
export class ValidationProcessingService {
    private readonly logger = Logger.getInstance('ValidationProcessingService');
    private intervalId: NodeJS.Timeout | undefined;
    private consensusCalculator: IConsensusCalculator;
    private eventEmitter: EventEmitter;
    private pendingValidations: Map<string, PendingValidation>;
    private validationResults: Map<string, ConsensusResult>;
    private processingInterval = 15 * 60 * 1000; // 15 minutes par défaut

    /**
     * Constructeur
     * @param consensusCalculator Calculateur de consensus
     * @param eventEmitter Émetteur d'événements
     * @param pendingValidations Map des validations en cours
     * @param validationResults Map des résultats de consensus
     * @param processingInterval Intervalle de traitement en ms (optionnel)
     */
    constructor(
        consensusCalculator: IConsensusCalculator,
        eventEmitter: EventEmitter,
        pendingValidations: Map<string, PendingValidation>,
        validationResults: Map<string, ConsensusResult>,
        processingInterval?: number
    ) {
        this.consensusCalculator = consensusCalculator;
        this.eventEmitter = eventEmitter;
        this.pendingValidations = pendingValidations;
        this.validationResults = validationResults;

        if (processingInterval) {
            this.processingInterval = processingInterval;
        }
    }

    /**
     * Démarre le traitement périodique des validations
     * @param isActive Fonction qui indique si le système est actif
     */
    public startPeriodicProcessing(isActive: () => boolean): void {
        this.stopPeriodicProcessing(); // Arrêter tout traitement existant

        this.intervalId = setInterval(() => {
            if (!isActive()) {
                this.stopPeriodicProcessing();
                return;
            }

            this.processExpiringValidations()
                .catch(error => {
                    this.logger.error('Error processing expiring validations', {
                        error: error instanceof Error ? error.message : String(error)
                    });
                });

            this.processReadyForConsensus()
                .catch(error => {
                    this.logger.error('Error processing validations ready for consensus', {
                        error: error instanceof Error ? error.message : String(error)
                    });
                });
        }, this.processingInterval);

        this.logger.debug('Started periodic processing of validations');
    }

    /**
     * Arrête le traitement périodique
     */
    public stopPeriodicProcessing(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this.logger.debug('Stopped periodic processing of validations');
        }
    }

    /**
     * Traite les validations en cours d'expiration
     */
    public async processExpiringValidations(): Promise<void> {
        const now = Date.now();
        let expiredCount = 0;

        for (const [validationId, data] of this.pendingValidations.entries()) {
            // Ignorer les validations déjà terminées
            if (this.isValidationCompleted(data.state)) {
                continue;
            }

            // Vérifier si la validation a expiré
            if (data.request.deadline && now > data.request.deadline) {
                // Mettre à jour l'état
                this.updateValidationState(validationId, ValidationState.EXPIRED);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            this.logger.info(`Processed ${expiredCount} expired validations`);
        }
    }

    /**
     * Traite les validations prêtes pour le calcul du consensus
     */
    public async processReadyForConsensus(): Promise<void> {
        let processedCount = 0;

        for (const [validationId, data] of this.pendingValidations.entries()) {
            // Vérifier si la validation est prête pour le consensus
            const minRequired = data.request.minFeedbackRequired || 3;

            if (data.state === ValidationState.FEEDBACK_COLLECTING &&
                data.feedback.length >= minRequired) {

                // Calculer le consensus
                await this.calculateConsensus(validationId);
                processedCount++;
            }
        }

        if (processedCount > 0) {
            this.logger.info(`Processed consensus for ${processedCount} validations`);
        }
    }

    /**
     * Vérifie si une validation est dans un état terminal
     * @param state État de la validation
     * @returns True si la validation est dans un état terminal
     */
    private isValidationCompleted(state: ValidationState): boolean {
        return state === ValidationState.APPROVED ||
            state === ValidationState.REJECTED ||
            state === ValidationState.INTEGRATED ||
            state === ValidationState.EXPIRED;
    }

    /**
     * Calcule le consensus pour une validation
     * @param validationId Identifiant de la validation
     * @param options Options pour le calcul du consensus (optionnel)
     * @returns Résultat du consensus
     */
    public async calculateConsensus(
        validationId: string,
        options?: ConsensusOptions
    ): Promise<ConsensusResult | null> {
        try {
            const validation = this.pendingValidations.get(validationId);
            if (!validation) {
                throw new Error(`Validation not found: ${validationId}`);
            }

            this.logger.info(`Calculating consensus for validation: ${validationId}`);

            // Mettre à jour l'état
            this.updateValidationState(validationId, ValidationState.CONSENSUS_CALCULATING);

            // Calculer le consensus
            const adaptedRequest = adaptationService.adaptRequest(validation.request);
            const adaptedFeedback = validation.feedback.map(f =>
                adaptationService.adaptFeedback(f, validationId)
            );

            const consensusResult = await this.consensusCalculator.calculateConsensus(
                adaptedRequest,
                adaptedFeedback,
                options
            );

            // Compléter le résultat
            const finalResult = this.finalizeConsensusResult(validationId, consensusResult);

            // Stocker le résultat
            validation.consensusResult = finalResult;
            validation.updatedAt = Date.now();
            this.validationResults.set(validationId, finalResult);

            // Émettre un événement de consensus
            this.emitConsensusReachedEvent(validationId, finalResult);

            // Mettre à jour l'état final selon le résultat
            this.updateStateBasedOnConsensus(validationId, finalResult);

            this.logger.info(`Consensus calculated for validation: ${validationId}`, {
                approved: finalResult.approved,
                consensusLevel: finalResult.consensusLevel,
                expertCount: finalResult.expertCount
            });

            return finalResult;
        } catch (error) {
            this.logger.error('Error calculating consensus', {
                error: error instanceof Error ? error.message : String(error),
                validationId
            });
            return null;
        }
    }

    /**
     * Finalise le résultat du consensus
     * @param validationId Identifiant de la validation
     * @param result Résultat brut du consensus
     * @returns Résultat finalisé
     */
    private finalizeConsensusResult(
        validationId: string,
        result: ConsensusResult
    ): ConsensusResult {
        // Compléter le résultat
        const finalResult: ConsensusResult = {
            ...result,
            validationId: validationId,
            timestamp: typeof result.timestamp === 'object' && result.timestamp instanceof Date
                ? result.timestamp.getTime()
                : result.timestamp
        };

        return finalResult;
    }

    /**
     * Émet un événement de consensus atteint
     * @param validationId Identifiant de la validation
     * @param consensusResult Résultat du consensus
     */
    private emitConsensusReachedEvent(
        validationId: string,
        consensusResult: ConsensusResult
    ): void {
        const event: ValidationEvent = {
            validationId,
            consensusResult,
            timestamp: Date.now()
        };

        this.eventEmitter.emit(ValidationEventType.CONSENSUS_REACHED, event);
    }

    /**
     * Met à jour l'état de la validation en fonction du résultat du consensus
     * @param validationId Identifiant de la validation
     * @param consensusResult Résultat du consensus
     */
    private updateStateBasedOnConsensus(
        validationId: string,
        consensusResult: ConsensusResult
    ): void {
        if (consensusResult.approved) {
            this.updateValidationState(validationId, ValidationState.APPROVED);

            // Émettre un événement de validation complétée
            const event: ValidationEvent = {
                validationId,
                approved: true,
                consensusResult,
                timestamp: Date.now()
            };
            this.eventEmitter.emit(ValidationEventType.VALIDATION_COMPLETED, event);

        } else if (consensusResult.improveProposal) {
            this.updateValidationState(validationId, ValidationState.NEEDS_IMPROVEMENT);

        } else {
            this.updateValidationState(validationId, ValidationState.REJECTED);

            // Émettre un événement de validation complétée
            const event: ValidationEvent = {
                validationId,
                approved: false,
                consensusResult,
                timestamp: Date.now()
            };
            this.eventEmitter.emit(ValidationEventType.VALIDATION_COMPLETED, event);
        }
    }

    /**
     * Met à jour l'état d'une validation
     * @param validationId Identifiant de la validation
     * @param newState Nouvel état
     */
    public updateValidationState(validationId: string, newState: ValidationState): void {
        const validation = this.pendingValidations.get(validationId);
        if (!validation) {
            return;
        }

        const oldState = validation.state;
        validation.state = newState;
        validation.updatedAt = Date.now();

        this.logger.info(`Validation state updated: ${validationId}`, {
            oldState,
            newState
        });

        // Émettre un événement de changement d'état
        const event: ValidationEvent = {
            validationId,
            oldState,
            newState,
            timestamp: Date.now()
        };
        this.eventEmitter.emit(ValidationEventType.STATE_CHANGED, event);
    }
}