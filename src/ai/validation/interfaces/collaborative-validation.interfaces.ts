// src/ai/validation/interfaces/collaborative-validation.interfaces.ts
import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ConsensusResult,
    ConsensusOptions,
    ExpertProfile,
    ExpertSearchCriteria,
    ThematicClubType,
    ValidationState,
    AdaptedValidationRequest,
    AdaptedFeedback,
    ThematicClub,
    VotingOptions,
    Vote,
    VotingResult,
    ValidationHistoryFilters,
    ValidationRecord,
    Result,
    PaginationOptions,
    PaginatedResult,
    ValidationEventType,
    ValidationStateChange,
    NotificationContext
} from '@ai/validation/types';

/**
 * Interface principale pour la gestion des validations collaboratives
 */
export interface ICollaborationManager {
    /**
     * Initialise le gestionnaire de collaboration
     * @returns Succès de l'initialisation
     */
    initialize(): Promise<Result<void>>;

    /**
     * Soumet une proposition pour validation
     * @param request Requête de validation
     * @returns ID de la validation créée
     */
    submitProposal(request: CollaborativeValidationRequest): Promise<Result<string>>;

    /**
     * Ajoute un feedback à une validation en cours
     * @param validationId Identifiant de la validation
     * @param feedback Feedback à ajouter
     * @returns ID du feedback créé
     */
    addFeedback(validationId: string, feedback: ValidationFeedback): Promise<Result<string>>;

    /**
     * Obtient tous les retours pour une validation avec pagination
     * @param validationId ID de la validation
     * @param options Options de pagination
     */
    getAllFeedback(
        validationId: string,
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ValidationFeedback>>>;

    /**
     * Met à jour l'état d'une validation
     * @param validationId ID de la validation
     * @param state Nouvel état
     * @param reason Motif du changement
     */
    updateValidationState(
        validationId: string,
        state: ValidationState,
        reason?: string
    ): Promise<Result<ValidationStateChange>>;

    /**
     * Obtient l'état actuel d'une validation
     * @param validationId ID de la validation
     */
    getValidationState(validationId: string): Promise<Result<ValidationState>>;

    /**
     * Obtient l'historique des changements d'état d'une validation
     * @param validationId ID de la validation
     */
    getValidationHistory(validationId: string): Promise<Result<ValidationStateChange[]>>;

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
     * S'abonne aux événements de validation
     * @param eventType Type d'événement
     * @param callback Fonction à appeler lors de l'événement
     */
    subscribeToEvents(
        eventType: ValidationEventType | 'all',
        callback: (validationId: string, eventType: ValidationEventType, data: unknown) => void
    ): string;

    /**
     * Se désabonne des événements
     * @param subscriptionId ID d'abonnement
     */
    unsubscribeFromEvents(subscriptionId: string): boolean;

    /**
     * Recherche avancée de validations
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
     * Exécute des opérations groupées dans une transaction
     * @param operations Fonction exécutant plusieurs opérations
     */
    transaction<T>(
        operations: (manager: ICollaborationManager) => Promise<T>
    ): Promise<Result<T>>;

    /**
     * Libère les ressources et arrête le gestionnaire
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    shutdown(force?: boolean): Promise<Result<void>>;

    /**
     * Calcule le consensus pour une validation
     * @param validationId ID de la validation
     * @param options Options pour le calcul du consensus
     */
    calculateConsensus(
        validationId: string,
        options?: ConsensusOptions
    ): Promise<Result<ConsensusResult>>;

    /**
     * Obtient le résultat de consensus pour une validation
     * @param validationId ID de la validation
     */
    getConsensusResult(validationId: string): Promise<Result<ConsensusResult>>;
}

/**
 * Interface pour le calcul de consensus
 */
export interface IConsensusCalculator {
    /**
     * Calcule le consensus à partir des feedbacks
     * @param request Requête de validation
     * @param feedback Liste des feedbacks
     * @param options Options pour le calcul du consensus
     * @returns Résultat du consensus
     */
    calculateConsensus(
        request: AdaptedValidationRequest,
        feedback: AdaptedFeedback[],
        options?: ConsensusOptions
    ): Promise<ConsensusResult>;
}

/**
 * Interface pour la validation par des locuteurs natifs
 */
export interface INativeValidator {
    /**
     * Initialise le validateur natif
     * @returns Succès de l'initialisation
     */
    initialize(): Promise<boolean>;

    /**
     * Soumet une demande de validation par des experts natifs
     * @param request Requête de validation
     * @param experts Liste des experts disponibles
     * @returns Succès de la soumission
     */
    submitForValidation(
        request: AdaptedValidationRequest,
        experts: ExpertProfile[]
    ): Promise<boolean>;

    /**
     * Arrête proprement le validateur
     */
    shutdown(): Promise<boolean>;
}

/**
 * Interface pour la gestion des clubs thématiques
 */
export interface IThematicClubManager {
    /**
     * Initialise les clubs thématiques
     */
    initializeClubs(): Promise<boolean>;

    /**
     * Récupère tous les clubs thématiques
     * @returns Liste des clubs
     */
    getClubs(): Promise<ThematicClub[]>;

    /**
     * Crée un nouveau club thématique
     * @param type Type de club
     * @param name Nom du club
     * @param description Description du club
     * @returns ID du club créé ou succès de l'opération
     */
    createClub(
        type: ThematicClubType,
        name: string,
        description: string
    ): Promise<string | boolean>;

    /**
     * Soumet une validation à un club thématique
     * @param clubType Type de club thématique
     * @param request Requête de validation
     * @returns Succès de la soumission
     */
    submitToClub(
        clubType: ThematicClubType,
        request: CollaborativeValidationRequest
    ): Promise<boolean>;

    /**
     * Ajoute un expert à un club thématique
     * @param clubType Type de club thématique
     * @param expert Profil de l'expert à ajouter
     */
    addExpertToClub(
        clubType: ThematicClubType,
        expert: ExpertProfile
    ): Promise<boolean>;

    /**
     * Obtient les experts d'un club thématique
     * @param clubType Type de club thématique
     */
    getClubExperts(clubType: ThematicClubType): Promise<ExpertProfile[]>;
}

/**
 * Interface pour le mécanisme de vote
 */
export interface IVotingMechanism {
    /**
     * Initialise une session de vote
     * @param validationId Identifiant de la validation
     * @param options Options de vote
     * @returns Identifiant de la session de vote
     */
    initializeVoting(validationId: string, options: VotingOptions): Promise<string>;

    /**
     * Soumet un vote
     * @param votingId Identifiant de la session de vote
     * @param expertId Identifiant de l'expert
     * @param vote Vote soumis
     * @returns Succès de la soumission
     */
    submitVote(votingId: string, expertId: string, vote: Vote): Promise<boolean>;

    /**
     * Calcule le résultat du vote
     * @param votingId Identifiant de la session de vote
     * @returns Résultat du vote
     */
    calculateResult(votingId: string): Promise<VotingResult>;

    /**
     * Vérifie si le seuil de consensus est atteint
     * @param votingId Identifiant de la session de vote
     * @returns true si le consensus est atteint
     */
    hasReachedConsensus(votingId: string): Promise<boolean>;

    /**
     * Enregistre un vote
     * @param validationId ID de la validation
     * @param expertId ID de l'expert
     * @param vote Vote (approuvé ou non)
     * @param confidence Niveau de confiance
     * @returns Succès de l'enregistrement
     */
    registerVote(
        validationId: string,
        expertId: string,
        vote: boolean,
        confidence?: number
    ): Promise<boolean>;
}

/**
 * Interface pour la gestion des experts
 */
export interface IExpertManager {
    /**
     * Enregistre un nouvel expert
     * @param profile Profil de l'expert
     * @returns Identifiant de l'expert
     */
    registerExpert(profile: ExpertProfile): Promise<string>;

    /**
     * Met à jour le profil d'un expert
     * @param expertId Identifiant de l'expert
     * @param updates Mises à jour du profil
     * @returns Succès de la mise à jour
     */
    updateExpert(expertId: string, updates: Partial<ExpertProfile>): Promise<boolean>;

    /**
     * Récupère le profil d'un expert
     * @param expertId Identifiant de l'expert
     * @returns Profil de l'expert
     */
    getExpertProfile(expertId: string): Promise<ExpertProfile | null>;

    /**
     * Recherche des experts selon des critères
     * @param criteria Critères de recherche
     * @returns Liste des experts correspondants
     */
    findExperts(criteria: ExpertSearchCriteria): Promise<ExpertProfile[]>;

    /**
     * Évalue la réputation d'un expert
     * @param expertId Identifiant de l'expert
     * @returns Score de réputation
     */
    evaluateReputation(expertId: string): Promise<number>;
}

/**
 * Interface pour l'historique des validations
 */
export interface IValidationHistory {
    /**
     * Récupère l'historique des validations
     * @param filters Filtres de recherche
     * @returns Liste des validations correspondantes
     */
    getValidationHistory(filters: ValidationHistoryFilters): Promise<ValidationRecord[]>;

    /**
     * Récupère l'historique des validations pour un expert
     * @param expertId Identifiant de l'expert
     * @param filters Filtres de recherche
     * @returns Liste des validations correspondantes
     */
    getExpertValidationHistory(
        expertId: string,
        filters: ValidationHistoryFilters
    ): Promise<ValidationRecord[]>;

    /**
     * Récupère l'historique pour un contenu spécifique
     * @param contentId Identifiant du contenu
     * @returns Liste des validations pour ce contenu
     */
    getContentValidationHistory(contentId: string): Promise<ValidationRecord[]>;

    /**
     * Enregistre une validation dans l'historique
     * @param validation Validation à enregistrer
     * @returns Succès de l'enregistrement
     */
    recordValidation(validation: {
        id: string;
        request: CollaborativeValidationRequest;
        state: ValidationState;
        feedbackCount: number;
        consensusResult?: ConsensusResult;
        createdAt: number;
        completedAt?: number;
    }): Promise<boolean>;

    /**
     * Recherche dans l'historique des validations
     * @param filters Filtres de recherche
     * @param pagination Options de pagination
     * @returns Résultats de la recherche
     */
    searchHistory(
        filters: {
            startDate?: Date;
            endDate?: Date;
            states?: ValidationState[];
            types?: string[];
            keywords?: string[];
            expertId?: string;
        },
        pagination: PaginationOptions
    ): Promise<PaginatedResult<ValidationRecord>>;
}

/**
 * Interface pour le gestionnaire d'événements
 */
export interface IEventManager {
    /**
     * S'abonne à un type d'événement
     * @param eventType Type d'événement ou 'all' pour tous
     * @param callback Fonction de rappel
     */
    subscribe(
        eventType: ValidationEventType | 'all',
        callback: (validationId: string, eventType: ValidationEventType, data: unknown) => void
    ): string;

    /**
     * Se désabonne d'un événement
     * @param subscriptionId ID d'abonnement
     */
    unsubscribe(subscriptionId: string): boolean;

    /**
     * Émet un événement
     * @param eventType Type d'événement
     * @param data Données de l'événement
     */
    emit(eventType: ValidationEventType, data: unknown): void;
}

// Interfaces pour les types de gestionnaires spécifiques
export interface IValidationManager {
    submitProposal(request: CollaborativeValidationRequest): Promise<Result<string>>;
    searchValidations(criteria: unknown, options?: PaginationOptions): Promise<Result<PaginatedResult<CollaborativeValidationRequest>>>;
}

export interface IFeedbackManager {
    addFeedback(validationId: string, feedback: ValidationFeedback): Promise<Result<string>>;
    getAllFeedback(validationId: string, options?: PaginationOptions): Promise<Result<PaginatedResult<ValidationFeedback>>>;
    notifyExperts(expertIds: string[], message: string, context?: NotificationContext): Promise<Result<{ successCount: number; failedIds?: string[] }>>;
}

export interface IConsensusManager {
    calculateConsensus(validationId: string, options?: ConsensusOptions): Promise<Result<ConsensusResult>>;
    getConsensusResult(validationId: string): Promise<Result<ConsensusResult>>;
    isReadyForConsensus(validationId: string): Promise<Result<boolean>>;
}

export interface IValidationStateManager {
    getCurrentState(validationId: string): Promise<Result<ValidationState>>;
    updateState(validationId: string, state: ValidationState, reason?: string, changedBy?: string): Promise<Result<ValidationStateChange>>;
    getStateHistory(validationId: string): Promise<Result<PaginatedResult<ValidationStateChange>>>;
}

export interface IExpertProfileManager {
    registerExpertProfile(profile: ExpertProfile): Promise<Result<string>>;
    getExpertProfile(expertId: string): Promise<Result<ExpertProfile>>;
    getExpertStats(expertId: string): Promise<Result<unknown>>;
    findQualifiedExperts(validationId: string, count?: number): Promise<Result<ExpertProfile[]>>;
}

/**
 * Interface pour le gestionnaire des registres de collaboration
 */
export interface ICollaborationManagerRegistry {
    /**
     * Initialise le registre
     */
    initialize(): Promise<Result<void>>;

    /**
     * Obtient le gestionnaire de validation
     */
    getValidationManager(): IValidationManager;

    /**
     * Obtient le gestionnaire de feedback
     */
    getFeedbackManager(): IFeedbackManager;

    /**
     * Obtient le gestionnaire de consensus
     */
    getConsensusManager(): IConsensusManager;

    /**
     * Obtient le gestionnaire d'états de validation
     */
    getValidationStateManager(): IValidationStateManager;

    /**
     * Obtient le gestionnaire de profils d'experts
     */
    getExpertProfileManager(): IExpertProfileManager;

    /**
     * Exécute des opérations dans une transaction
     * @param operations Fonction d'opérations
     */
    transaction<T>(
        operations: () => Promise<T>
    ): Promise<Result<T>>;

    /**
     * Arrête le registre
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    shutdown(force?: boolean): Promise<Result<void>>;
}