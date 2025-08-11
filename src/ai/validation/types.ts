// src/ai/validation/types.ts

/**
 * Ce fichier centralise tous les exports de types pour le système de validation collaborative.
 */

// États et énumérations principales
export enum ValidationState {
    UNKNOWN = 'unknown',
    SUBMITTED = 'submitted',
    PENDING = 'pending',
    IN_REVIEW = 'in_review',
    FEEDBACK_COLLECTING = 'feedback_collecting',
    CONSENSUS_CALCULATING = 'consensus_calculating',
    CONSENSUS_REACHED = 'consensus_reached',
    NEEDS_IMPROVEMENT = 'needs_improvement',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    INTEGRATED = 'integrated',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired'
}

export enum ValidationEventType {
    SUBMISSION = 'validation:submitted',
    FEEDBACK_ADDED = 'validation:feedback_added',
    EXPERT_ADDED = 'validation:expert_added',
    STATE_CHANGED = 'validation:state_changed',
    CONSENSUS_REACHED = 'validation:consensus_reached',
    VALIDATION_COMPLETED = 'validation:completed',
    IMPROVEMENT_INTEGRATED = 'validation:improvement_integrated'
}

export enum ThematicClubType {
    HISTOIRE_LSF = 'histoire_lsf',
    ETYMOLOGIE = 'etymologie',
    PRATIQUES_CULTURELLES = 'pratiques_culturelles',
    INNOVATIONS_LINGUISTIQUES = 'innovations_linguistiques',
    REGISTRES_SPECIALISES = 'registres_specialises',
    ASPECTS_INTERNATIONAUX = 'aspects_internationaux'
}

export enum ExpertiseLevel {
    NOVICE = 'novice',
    INTERMEDIAIRE = 'intermediaire',
    AVANCE = 'avance',
    EXPERT = 'expert',
    NATIF = 'natif',
    FORMATEUR = 'formateur',
    CHERCHEUR = 'chercheur'
}

export enum ErrorCode {
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_DATA = 'INVALID_DATA',
    STATE_TRANSITION_DENIED = 'STATE_TRANSITION_DENIED',
    OPERATION_FAILED = 'OPERATION_FAILED',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    INVALID_STATE = 'INVALID_STATE',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    VALIDATION_FAILED = 'VALIDATION_FAILED'
}

// Types pour les contenus à valider
export type ValidationContent =
    | SignContent
    | TranslationContent
    | ExpressionContent
    | DocumentContent;

export interface SignContent {
    type: 'sign';
    signId: string;
    video?: string;
    parameters: {
        handshape: string;
        location: string;
        movement: string;
        orientation: string;
        expression?: string;
    };
    variants?: string[];
}

export interface TranslationContent {
    type: 'translation';
    sourceText: string;
    targetSign: string;
    context?: string;
    alternativeTranslations?: string[];
}

export interface ExpressionContent {
    type: 'expression';
    name: string;
    video?: string;
    intensity: number;
    components: string[];
    usageContext: string[];
}

export interface DocumentContent {
    type: 'document';
    title: string;
    content: string;
    language: string;
    format: 'text' | 'html' | 'markdown' | 'pdf';
}

// Types pour le contexte et les métadonnées
export interface ValidationContext {
    region?: string;
    dialect?: string;
    audience?: string;
    domain?: string;
    purpose?: string;
    formality?: 'formal' | 'informal' | 'neutral';
    culturalNotes?: string[];
    [key: string]: unknown;
}

export interface RequestMetadata {
    source: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags: string[];
    previousVersions?: string[];
    relatedRequests?: string[];
    [key: string]: unknown;
}

// Types pour le processus de validation
export interface CollaborativeValidationRequest {
    /**
     * Identifiant unique de la validation
     */
    id?: string;

    /**
     * Type de contenu à valider
     */
    type: string;

    /**
     * Contenu à valider
     */
    content: ValidationContent;

    /**
     * Identifiant du demandeur
     */
    requester: string;

    /**
     * Contexte pour la validation
     */
    context?: ValidationContext;

    /**
     * Date de soumission
     */
    submissionDate?: Date;

    /**
     * Date limite pour la validation (timestamp)
     */
    deadline?: number;

    /**
     * Date limite pour la validation (date)
     */
    dueDate?: Date;

    /**
     * Nombre minimum de feedbacks requis
     */
    minFeedbackRequired?: number;

    /**
     * Nécessite une validation par des locuteurs natifs
     */
    requiresNativeValidation?: boolean;

    /**
     * Métadonnées additionnelles sur la requête
     */
    metadata?: RequestMetadata;
}

export interface ImprovementProposal {
    field: string;
    currentValue: string | number | boolean;
    proposedValue: string | number | boolean;
    reason: string;
    priority: 'low' | 'medium' | 'high';
}

export interface ValidationFeedback {
    id?: string;
    expertId: string;
    validationId?: string;
    expertiseLevel?: ExpertiseLevel;
    isNativeValidator: boolean;
    approved: boolean;
    comments?: string;
    score?: number;
    confidence?: number;
    suggestions?: ImprovementProposal[];
    timestamp: number | Date;
}

// Types pour le consensus
export interface ConsensusImprovement {
    field: string;
    proposedValue: string | number | boolean;
    confidence: number;
    supportPercentage: number;
    implementationDifficulty: 'easy' | 'medium' | 'complex';
}

export interface ConsensusOptions {
    algorithm?: 'majority' | 'weighted' | 'delphi' | 'supermajority';
    approvalThreshold?: number;
    expertWeights?: Record<ExpertiseLevel, number>;
    nativeValidatorBonus?: number;
    minParticipants?: number;
}

/**
 * Résultat d'un calcul de consensus
 */
export interface ConsensusResult {
    /**
     * Indique si le consensus a approuvé la validation
     */
    approved: boolean;

    /**
     * Niveau de consensus (de 0 à 1)
     */
    consensusLevel: number;

    /**
     * Nombre d'experts ayant participé
     */
    expertCount: number;

    /**
     * Nombre d'experts natifs ayant participé
     */
    nativeExpertCount: number;

    /**
     * Nombre d'approbations
     */
    approvalCount: number;

    /**
     * Nombre de rejets
     */
    rejectionCount: number;

    /**
     * Date du calcul du consensus
     */
    consensusDate: Date;

    /**
     * Algorithme utilisé pour le calcul
     */
    algorithm: string;

    /**
     * Scores attribués par les experts (si disponibles)
     */
    expertScores?: number[];

    /**
     * Commentaires des experts
     */
    comments: string[];

    /**
     * Suggestions d'amélioration
     */
    suggestions: Array<{
        field: string;
        currentValue?: string;
        proposedValue: string;
        reason?: string;
        priority?: 'low' | 'medium' | 'high';
    }>;
}

// Types pour les experts
export interface ExpertMetadata {
    certifications?: string[];
    publications?: string[];
    languages?: string[];
    additionalTraining?: string[];
    specialProjects?: string[];
    [key: string]: unknown;
}

export interface ExpertProfile {
    id: string;
    name: string;
    expertiseLevel: ExpertiseLevel;
    isNative: boolean;
    domains?: string[];
    specialties?: string[];
    experience?: number;
    affiliation?: string;
    reliabilityScore?: number;
    metadata?: ExpertMetadata | Record<string, unknown>;
}

export interface ExpertStats {
    expertId: string;
    totalValidations: number;
    approvedCount: number;
    rejectionCount: number;
    approvalRate: number;
    consensusAlignment: number;
    averageScore: number;
    averageResponseTime: number;
    lastActivity: Date;
    domains: string[];
}

export interface ExpertSearchCriteria {
    minExpertiseLevel?: ExpertiseLevel;
    requireNative?: boolean;
    specialties?: string[];
    minExperience?: number;
    affiliation?: string;
    limit?: number;
}

// Types pour les clubs thématiques
export interface ClubMember {
    expertId: string;
    role: string;
    joinedAt: Date;
    stats?: {
        totalValidations: number;
        consensusAlignment: number;
    };
}

export interface ThematicClub {
    id: string;
    type: ThematicClubType;
    name: string;
    description: string;
    members?: ClubMember[];
    memberCount?: number;
    createdAt?: Date;
    stats?: {
        totalValidations: number;
        pendingValidations: number;
        completedValidations: number;
        consensusRate: number;
    };
}

// Types pour le vote
export interface Vote {
    approved: boolean;
    score: number;
    reason?: string;
    improvements?: ImprovementProposal[];
}

export interface VotingOptions {
    duration: number;
    consensusThreshold: number;
    minVotesRequired: number;
    expertiseLevelWeights: Record<ExpertiseLevel, number>;
    nativeValidatorBonus: number;
}

export interface VotingResult {
    votingId: string;
    validationId: string;
    totalVotes: number;
    approvalVotes: number;
    rejectionVotes: number;
    approvalRate: number;
    averageScore: number;
    consensusReached: boolean;
    consensusLevel: number;
    aggregatedImprovements: Record<string, ConsensusImprovement>;
}

// Types pour l'historique
export interface ValidationHistoryFilters {
    states?: ValidationState[];
    contentType?: string;
    startDate?: Date;
    endDate?: Date;
    requester?: string;
    limit?: number;
    offset?: number;
}

export interface ValidationRecord {
    validationId: string;
    contentType: string;
    contentSummary: string;
    requester: string;
    state: ValidationState;
    submittedAt: Date;
    completedAt?: Date;
    result?: {
        approved: boolean;
        consensusLevel: number;
        expertCount: number;
    };
    stateHistory: {
        state: ValidationState;
        timestamp: Date;
        reason?: string;
    }[];
}

export interface ValidationStateChange {
    validationId: string;
    previousState: ValidationState;
    newState: ValidationState;
    changedBy: string;
    changedAt: Date;
    reason?: string;
}

// Types pour la gestion des validations
export interface ValidationCollaborativeOptions {
    defaultTimeout?: number;
    defaultMinFeedbacks?: number;
    defaultConsensusThreshold?: number;
    enableCrossValidation?: boolean;
    enableConsensusCalculation?: boolean;
    expertiseLevelWeights?: Record<ExpertiseLevel, number>;
    nativeValidatorBonus?: number;
    enableThematicClubs?: boolean;
    consensusOptions?: ConsensusOptions;
}

export interface PendingValidation {
    request: CollaborativeValidationRequest;
    state: ValidationState;
    feedback: ValidationFeedback[];
    consensusResult?: ConsensusResult;
    createdAt: number;
    updatedAt: number;
}

export interface ValidationStatus {
    state: ValidationState;
    feedbackCount: number;
    consensusResult?: ConsensusResult;
    deadline: number;
}

export interface ValidationSummary {
    validationId: string;
    type: string;
    state: ValidationState;
    feedbackCount: number;
    deadline: number;
    createdAt: number;
}

// Types pour les résultats et erreurs
export interface Result<T> {
    success: boolean;
    data?: T;
    error?: ValidationError;
}

export interface ValidationError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Types pour les notifications
export interface NotificationContext {
    validationId?: string;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: Date;
    actionRequired?: boolean;
    category?: 'feedback' | 'state_change' | 'deadline' | 'assignment' | 'other';
    metadata?: Record<string, unknown>;
}

// Types pour la pagination
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageCount: number;
}

// Types pour les événements
export interface ValidationEvent {
    validationId: string;
    timestamp: number;
    [key: string]: unknown;
}

export type ValidationEventCallback = (
    validationId: string,
    eventType: ValidationEventType,
    data: unknown
) => void;

// Types adaptés pour la communication avec les interfaces
export type AdaptedValidationRequest = CollaborativeValidationRequest & {
    id: string;
    requiresNativeValidation: boolean;
};

export type AdaptedFeedback = ValidationFeedback & {
    id: string;
    validationId: string;
};

export type AdaptedExpertProfile = ExpertProfile & {
    specialties: string[];
    domains: string[];
};

// Réexportation des sous-modules existants
export * from './types/events';
export * from './types/history';
export * from './types/notification';
export * from './types/pagination';
export * from './types/result';

// Ajoutez cette interface au fichier types.ts

/**
 * Statistiques globales du système de validation
 */
export interface ValidationStats {
    /**
     * Indique si les statistiques sont implémentées
     */
    implemented: boolean;

    /**
     * Nombre total de validations dans le système
     */
    totalValidations: number;

    /**
     * Nombre de validations en attente
     */
    pendingValidations: number;

    /**
     * Nombre de validations terminées
     */
    completedValidations: number;

    /**
     * Temps moyen de complétion (en ms)
     */
    averageCompletionTime: number;

    /**
     * Niveau moyen de consensus
     */
    averageConsensusLevel: number;

    /**
     * Nombre d'experts enregistrés
     */
    expertCount: number;

    /**
     * Répartition des validations par état
     */
    validationsByState: Record<ValidationState, number>;
}