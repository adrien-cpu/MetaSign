// src/ai/validation/ValidationCollaborative.ts

import { EventEmitter } from 'events';
import { BaseAI } from '@ai/base/BaseAI';
import { SystemState } from '@ai/coordinators/types';
import { Logger } from '@ai/utils/Logger';

import {
    ICollaborationManager,
    IConsensusCalculator,
    INativeValidator,
    IThematicClubManager,
    IVotingMechanism,
    IExpertManager,
    IValidationHistory
} from '@ai/validation/interfaces/collaborative-validation.interfaces';

import {
    ValidationState,
    ValidationEventType,
    ThematicClubType,
    ExpertiseLevel,
    CollaborativeValidationRequest,
    ValidationFeedback,
    ConsensusResult,
    ExpertProfile,
    ValidationCollaborativeOptions,
    ExpertSearchCriteria,
    PendingValidation,
    ValidationStatus,
    ValidationSummary,
    ValidationEvent
} from '@ai/validation/types';

import { adaptationService } from '@ai/validation/utils/adaptation-service';
import { ThematicClubService } from '@ai/validation/services/thematic-club-service';
import { ValidationProcessingService } from '@ai/validation/services/validation-processing-service';
import { ExpertService } from '@ai/validation/services/expert-service';

/**
 * Système de validation collaborative
 * Implémente le mécanisme de consensus et de validation par la communauté
 * conformément aux diagrammes d'état et à l'architecture du système LSF
 */
export class ValidationCollaborative extends BaseAI {
    private readonly logger = Logger.getInstance('ValidationCollaborative');

    // Composants principaux du système
    private collaborationManager: ICollaborationManager;
    private consensusCalculator: IConsensusCalculator;
    private nativeValidator: INativeValidator;
    private eventEmitter: EventEmitter;

    // Services spécialisés
    private thematicClubService: ThematicClubService;
    private validationProcessingService: ValidationProcessingService;
    private expertService: ExpertService;

    // Composants optionnels
    private thematicClubManager?: IThematicClubManager;
    private votingMechanism?: IVotingMechanism;
    private expertManager?: IExpertManager;
    private validationHistory?: IValidationHistory;

    // Options de configuration
    private options: Required<ValidationCollaborativeOptions>;

    // État interne
    private systemState: SystemState = SystemState.UNKNOWN;
    private isInitialized = false;

    // Stockage des validations
    private pendingValidations = new Map<string, PendingValidation>();

    // Cache des résultats de consensus
    private validationResults = new Map<string, ConsensusResult>();

    /**
     * Crée une nouvelle instance du système de validation collaborative
     * @param collaborationManager Gestionnaire de collaboration
     * @param consensusCalculator Calculateur de consensus
     * @param nativeValidator Validateur natif
     * @param options Options de configuration
     */
    constructor(
        collaborationManager: ICollaborationManager,
        consensusCalculator: IConsensusCalculator,
        nativeValidator: INativeValidator,
        options: ValidationCollaborativeOptions = {}
    ) {
        super();

        this.collaborationManager = collaborationManager;
        this.consensusCalculator = consensusCalculator;
        this.nativeValidator = nativeValidator;
        this.eventEmitter = new EventEmitter();

        // Configurer les options avec des valeurs par défaut
        this.options = this.initializeOptions(options);

        // Initialiser les services spécialisés
        this.thematicClubService = new ThematicClubService(this.thematicClubManager);
        this.validationProcessingService = new ValidationProcessingService(
            this.consensusCalculator,
            this.eventEmitter,
            this.pendingValidations,
            this.validationResults
        );
        this.expertService = new ExpertService(this.thematicClubService, this.expertManager);
    }

    /**
     * Initialise les options avec des valeurs par défaut
     * @param options Options de configuration
     * @returns Options complétées avec des valeurs par défaut
     */
    private initializeOptions(options: ValidationCollaborativeOptions): Required<ValidationCollaborativeOptions> {
        const defaultExpertWeights: Record<ExpertiseLevel, number> = {
            [ExpertiseLevel.NOVICE]: 0.5,
            [ExpertiseLevel.INTERMEDIAIRE]: 0.8,
            [ExpertiseLevel.AVANCE]: 1.0,
            [ExpertiseLevel.EXPERT]: 1.2,
            [ExpertiseLevel.NATIF]: 1.5,
            [ExpertiseLevel.FORMATEUR]: 1.3,
            [ExpertiseLevel.CHERCHEUR]: 1.4
        };

        return {
            defaultTimeout: options.defaultTimeout || 7 * 24 * 60 * 60 * 1000, // 1 semaine
            defaultMinFeedbacks: options.defaultMinFeedbacks || 3,
            defaultConsensusThreshold: options.defaultConsensusThreshold || 0.7,
            enableCrossValidation: options.enableCrossValidation !== false,
            enableConsensusCalculation: options.enableConsensusCalculation !== false,
            expertiseLevelWeights: options.expertiseLevelWeights || defaultExpertWeights,
            nativeValidatorBonus: options.nativeValidatorBonus || 0.2,
            enableThematicClubs: options.enableThematicClubs || false,
            consensusOptions: options.consensusOptions || {
                algorithm: 'weighted',
                approvalThreshold: 0.7,
                expertWeights: defaultExpertWeights,
                nativeValidatorBonus: 0.2,
                minParticipants: 3
            }
        };
    }

    /**
     * Implémentation de l'initialisation interne requise par BaseAI
     */
    protected async internalInitialize(): Promise<void> {
        try {
            this.logger.info('Initializing ValidationCollaborative system');
            this.systemState = SystemState.INITIALIZING;

            // Initialiser les composants principaux
            const collabInitResult = await this.collaborationManager.initialize();
            if (!collabInitResult) {
                throw new Error('Failed to initialize collaboration manager');
            }

            const nativeValidatorResult = await this.nativeValidator.initialize();
            if (!nativeValidatorResult) {
                throw new Error('Failed to initialize native validator');
            }

            // Initialiser les clubs thématiques si activés
            if (this.options.enableThematicClubs && this.thematicClubManager) {
                this.logger.info('Initializing ThematicClubManager');
                await this.thematicClubService.setupThematicClubs();
            }

            // Configuration réussie
            this.isInitialized = true;
            this.systemState = SystemState.ACTIVE;
            this.logger.info('ValidationCollaborative system initialized successfully');

            // Démarrer le traitement périodique
            this.validationProcessingService.startPeriodicProcessing(
                () => this.systemState === SystemState.ACTIVE
            );
        } catch (error) {
            this.logger.error('Failed to initialize ValidationCollaborative system', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.systemState = SystemState.ERROR;
            throw new Error('Failed to initialize ValidationCollaborative system');
        }
    }

    /**
     * Implémentation de l'arrêt interne requis par BaseAI
     */
    protected async internalShutdown(): Promise<void> {
        try {
            this.logger.info('Shutting down ValidationCollaborative system');

            // Mettre à jour l'état du système
            this.systemState = SystemState.INACTIVE;

            // Arrêter le traitement périodique
            this.validationProcessingService.stopPeriodicProcessing();

            // Supprimer tous les écouteurs d'événements
            this.eventEmitter.removeAllListeners();

            // Arrêter les composants
            await this.collaborationManager.shutdown();
            await this.nativeValidator.shutdown();

            this.isInitialized = false;

            this.logger.info('ValidationCollaborative system shut down successfully');
        } catch (error) {
            this.logger.error('Error shutting down ValidationCollaborative system', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * @inheritdoc
     */
    public override async initialize(): Promise<void> {
        await this.internalInitialize();
    }

    /**
     * Arrête proprement le système de validation collaborative
     */
    public override async shutdown(): Promise<void> {
        await this.internalShutdown();
    }

    /**
     * Récupère le statut d'une validation
     * @param validationId Identifiant de la validation
     * @returns État de la validation
     */
    public getValidationStatus(validationId: string): ValidationStatus | null {
        const validation = this.pendingValidations.get(validationId);
        if (!validation) {
            return null;
        }

        const result: ValidationStatus = {
            state: validation.state,
            feedbackCount: validation.feedback.length,
            deadline: validation.request.deadline!
        };

        if (validation.consensusResult) {
            result.consensusResult = validation.consensusResult;
        }

        return result;
    }

    /**
     * Récupère les validations en cours
     * @param state État optionnel pour filtrer
     * @returns Liste des validations correspondantes
     */
    public getPendingValidations(state?: ValidationState): ValidationSummary[] {
        const result: ValidationSummary[] = [];

        for (const [validationId, validation] of this.pendingValidations.entries()) {
            // Filtrer par état si spécifié
            if (state && validation.state !== state) {
                continue;
            }

            result.push({
                validationId,
                type: validation.request.type,
                state: validation.state,
                feedbackCount: validation.feedback.length,
                deadline: validation.request.deadline!,
                createdAt: validation.createdAt
            });
        }

        return result;
    }

    /**
     * Récupère les détails d'une validation
     * @param validationId Identifiant de la validation
     * @returns Détails de la validation ou null si non trouvée
     */
    public getValidationDetails(validationId: string): PendingValidation | null {
        return this.pendingValidations.get(validationId) || null;
    }

    /**
     * Récupère le résultat du consensus pour une validation
     * @param validationId ID de la validation
     * @returns Résultat du consensus ou null si non disponible
     */
    public getConsensusResult(validationId: string): ConsensusResult | null {
        // Vérifier d'abord dans le cache des résultats
        if (this.validationResults.has(validationId)) {
            return this.validationResults.get(validationId) || null;
        }

        // Sinon, vérifier dans les validations actives
        const validation = this.pendingValidations.get(validationId);
        return validation?.consensusResult || null;
    }

    /**
     * Marque une validation comme intégrée
     * @param validationId Identifiant de la validation
     * @returns Succès de l'opération
     */
    public markAsIntegrated(validationId: string): boolean {
        const validation = this.pendingValidations.get(validationId);
        if (!validation) {
            return false;
        }

        // Vérifier que la validation a été approuvée
        if (validation.state !== ValidationState.APPROVED &&
            validation.state !== ValidationState.NEEDS_IMPROVEMENT) {
            return false;
        }

        // Mettre à jour l'état
        this.validationProcessingService.updateValidationState(validationId, ValidationState.INTEGRATED);

        // Émettre un événement d'intégration
        const event: ValidationEvent = {
            validationId,
            timestamp: Date.now()
        };
        this.eventEmitter.emit(ValidationEventType.IMPROVEMENT_INTEGRATED, event);

        this.logger.info(`Validation marked as integrated: ${validationId}`);

        return true;
    }

    /**
     * Ajoute un expert à un club thématique
     * @param clubType Type de club thématique
     * @param expert Profil de l'expert à ajouter
     * @returns Succès de l'ajout
     */
    public addExpertToClub(clubType: ThematicClubType, expert: ExpertProfile): boolean {
        const success = this.thematicClubService.addExpertToClub(clubType, expert);

        if (success) {
            // Émettre un événement
            const event: ValidationEvent = {
                validationId: 'system', // Pas lié à une validation spécifique
                clubType,
                expertId: expert.id,
                timestamp: Date.now()
            };
            this.eventEmitter.emit(ValidationEventType.EXPERT_ADDED, event);
        }

        return success;
    }

    /**
     * Obtient la liste des experts d'un club thématique
     * @param clubType Type de club thématique
     * @returns Ensemble des profils d'experts ou ensemble vide si le club n'existe pas
     */
    public getThematicClubExperts(clubType: ThematicClubType): Set<ExpertProfile> {
        return this.thematicClubService.getThematicClubExperts(clubType);
    }

    /**
     * Vérifie si une validation a atteint un consensus
     * @param validationId ID de la validation
     * @returns True si un consensus a été atteint
     */
    public hasReachedConsensus(validationId: string): boolean {
        const validation = this.pendingValidations.get(validationId);
        return Boolean(validation?.consensusResult);
    }

    /**
     * Configure les composants optionnels
     * @param components Composants optionnels
     */
    public setOptionalComponents(components: {
        thematicClubManager?: IThematicClubManager;
        votingMechanism?: IVotingMechanism;
        expertManager?: IExpertManager;
        validationHistory?: IValidationHistory;
    }): void {
        if (components.thematicClubManager) {
            this.thematicClubManager = components.thematicClubManager;
            this.thematicClubService.setThematicClubManager(components.thematicClubManager);
        }

        if (components.votingMechanism) {
            this.votingMechanism = components.votingMechanism;
        }

        if (components.expertManager) {
            this.expertManager = components.expertManager;
            this.expertService.setExpertManager(components.expertManager);
        }

        if (components.validationHistory) {
            this.validationHistory = components.validationHistory;
        }

        this.logger.info('Optional components configured');
    }

    /**
     * Recherche des experts selon des critères
     * @param criteria Critères de recherche
     * @returns Promise avec les experts correspondants
     */
    public async findExperts(criteria: ExpertSearchCriteria): Promise<ExpertProfile[]> {
        return this.expertService.findExperts(criteria);
    }

    /**
     * Obtient l'état actuel du système
     */
    public getState(): SystemState {
        return this.systemState;
    }

    /**
     * Enregistre un écouteur d'événements
     * @param event Nom de l'événement
     * @param listener Fonction de rappel
     */
    public on(event: string, listener: (event: ValidationEvent) => void): this {
        this.eventEmitter.on(event, listener);
        return this;
    }

    /**
     * Supprime un écouteur d'événements
     * @param event Nom de l'événement
     * @param listener Fonction de rappel
     */
    public off(event: string, listener: (event: ValidationEvent) => void): this {
        this.eventEmitter.off(event, listener);
        return this;
    }

    /**
     * Génère un ID unique pour une validation
     * @returns ID de validation unique
     */
    private generateValidationId(): string {
        return `val_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    /**
     * Soumet une requête pour validation
     * @param request Requête de validation
     * @returns Identifiant de la validation
     */
    public async submitForValidation(request: CollaborativeValidationRequest): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('ValidationCollaborative system not initialized');
        }

        try {
            this.logger.info('Submitting validation request', {
                type: request.type,
                requester: request.requester
            });

            // Préparer la requête avec les valeurs par défaut
            const preparedRequest = this.prepareValidationRequest(request);

            // Soumettre la proposition
            const adaptedRequest = adaptationService.adaptRequest(preparedRequest);
            const success = await this.collaborationManager.submitProposal(adaptedRequest);

            if (!success) {
                throw new Error('Failed to submit proposal to collaboration manager');
            }

            // Enregistrer la validation en cours
            this.pendingValidations.set(preparedRequest.id!, {
                request: preparedRequest,
                state: ValidationState.PENDING,
                feedback: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            // Soumettre pour validation par des locuteurs natifs si nécessaire
            await this.submitForNativeValidationIfNeeded(preparedRequest);

            // Soumettre aux clubs thématiques appropriés si activés
            if (this.options.enableThematicClubs && this.thematicClubManager) {
                await this.thematicClubService.submitToRelevantClubs(preparedRequest);
            }

            // Émettre un événement de soumission
            const event: ValidationEvent = {
                validationId: preparedRequest.id!,
                request: preparedRequest,
                timestamp: Date.now()
            };
            this.eventEmitter.emit(ValidationEventType.SUBMISSION, event);

            // Mettre à jour l'état
            this.validationProcessingService.updateValidationState(
                preparedRequest.id!,
                ValidationState.FEEDBACK_COLLECTING
            );

            this.logger.info(`Validation request submitted: ${preparedRequest.id}`);

            return preparedRequest.id!;
        } catch (error) {
            this.logger.error('Error submitting validation request', {
                error: error instanceof Error ? error.message : String(error),
                request
            });
            throw error;
        }
    }

    /**
     * Prépare une requête de validation en appliquant les valeurs par défaut
     * @param request Requête de validation
     * @returns Requête préparée
     */
    private prepareValidationRequest(
        request: CollaborativeValidationRequest
    ): CollaborativeValidationRequest {
        const preparedRequest = { ...request };

        // Générer un ID si non fourni
        if (!preparedRequest.id) {
            preparedRequest.id = this.generateValidationId();
        }

        // Appliquer les valeurs par défaut
        if (!preparedRequest.deadline) {
            preparedRequest.deadline = Date.now() + this.options.defaultTimeout;
        }

        if (!preparedRequest.minFeedbackRequired) {
            preparedRequest.minFeedbackRequired = this.options.defaultMinFeedbacks;
        }

        return preparedRequest;
    }

    /**
     * Soumet pour validation par des locuteurs natifs si nécessaire
     * @param request Requête de validation
     */
    private async submitForNativeValidationIfNeeded(
        request: CollaborativeValidationRequest
    ): Promise<void> {
        if (request.requiresNativeValidation) {
            this.logger.info(`Submitting for native validation: ${request.id}`);
            const clubType = this.thematicClubService.getAppropriateClub(request.type);
            const experts = this.thematicClubService.getExpertsForClubType(clubType);

            await this.nativeValidator.submitForValidation(
                adaptationService.adaptRequest(request),
                adaptationService.adaptExpertProfiles(experts)
            );
        }
    }

    /**
     * Ajoute un feedback à une validation en cours
     * @param validationId Identifiant de la validation
     * @param feedback Feedback à ajouter
     * @returns Succès de l'ajout
     */
    public async addFeedback(validationId: string, feedback: ValidationFeedback): Promise<boolean> {
        if (!this.isInitialized) {
            throw new Error('ValidationCollaborative system not initialized');
        }

        try {
            // Vérifier si la validation existe
            const validation = this.pendingValidations.get(validationId);
            if (!validation) {
                throw new Error(`Validation not found: ${validationId}`);
            }

            // Vérifier l'état de la validation
            if (validation.state !== ValidationState.PENDING &&
                validation.state !== ValidationState.FEEDBACK_COLLECTING) {
                throw new Error(`Cannot add feedback to validation in state: ${validation.state}`);
            }

            // Préparer le feedback
            const preparedFeedback = this.prepareFeedback(feedback, validationId);

            // Ajouter le feedback au gestionnaire de collaboration
            const adaptedFeedback = adaptationService.adaptFeedback(preparedFeedback, validationId);
            const success = await this.collaborationManager.addFeedback(validationId, adaptedFeedback);

            if (!success) {
                throw new Error('Failed to add feedback to collaboration manager');
            }

            // Ajouter le feedback localement
            validation.feedback.push(preparedFeedback);
            validation.updatedAt = Date.now();

            this.logger.info(`Feedback added to validation: ${validationId}`, {
                expertId: preparedFeedback.expertId,
                approved: preparedFeedback.approved
            });

            // Émettre un événement de feedback
            const event: ValidationEvent = {
                validationId,
                feedback: preparedFeedback,
                timestamp: Date.now()
            };
            this.eventEmitter.emit(ValidationEventType.FEEDBACK_ADDED, event);

            // Vérifier si le nombre minimum de feedbacks est atteint
            this.checkFeedbackThreshold(validation, validationId);

            return true;
        } catch (error) {
            this.logger.error('Error adding feedback', {
                error: error instanceof Error ? error.message : String(error),
                validationId,
                expertId: feedback.expertId
            });
            return false;
        }
    }

    /**
     * Prépare un feedback en ajoutant les valeurs manquantes
     * @param feedback Feedback original
     * @param validationId ID de la validation
     * @returns Feedback préparé
     */
    private prepareFeedback(
        feedback: ValidationFeedback,
        validationId: string
    ): ValidationFeedback {
        const preparedFeedback = { ...feedback };

        // Ajouter un ID au feedback s'il n'en a pas
        if (!preparedFeedback.id) {
            preparedFeedback.id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        }

        // S'assurer que l'ID de validation est présent
        preparedFeedback.validationId = validationId;

        // Convertir la date en timestamp si nécessaire
        if (preparedFeedback.timestamp && typeof preparedFeedback.timestamp === 'object') {
            const timestamp = preparedFeedback.timestamp as unknown as Date;
            if (timestamp instanceof Date) {
                preparedFeedback.timestamp = timestamp.getTime();
            }
        } else if (!preparedFeedback.timestamp) {
            preparedFeedback.timestamp = Date.now();
        }

        return preparedFeedback;
    }

    /**
     * Vérifie si le seuil de feedbacks est atteint
     * @param validation Validation
     * @param validationId ID de la validation
     */
    private checkFeedbackThreshold(
        validation: PendingValidation,
        validationId: string
    ): void {
        const minRequired = validation.request.minFeedbackRequired!;
        if (validation.feedback.length >= minRequired) {
            this.logger.info(`Minimum feedback threshold reached for validation: ${validationId}`);

            // Calculer le consensus si le seuil est atteint
            if (this.options.enableConsensusCalculation) {
                this.validationProcessingService.calculateConsensus(validationId)
                    .catch(error => {
                        this.logger.error('Error calculating consensus', {
                            error: error instanceof Error ? error.message : String(error),
                            validationId
                        });
                    });
            }
        }
    }
}