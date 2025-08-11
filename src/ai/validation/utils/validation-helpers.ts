// src/ai/validation/utils/validation-helpers.ts
import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ValidationContent,
    ValidationState,
    ExpertiseLevel
} from '../types';
import { ErrorCode, failure, Result } from './result-helpers';

/**
 * Interface pour les validateurs de données
 */
export interface DataValidator<T> {
    validate(data: T): Result<T>;
}

/**
 * Validateur pour les requêtes de validation collaborative
 */
export class ValidationRequestValidator implements DataValidator<CollaborativeValidationRequest> {
    validate(request: CollaborativeValidationRequest): Result<CollaborativeValidationRequest> {
        // Vérifier les champs requis
        if (!request.type) {
            return failure(
                ErrorCode.MISSING_REQUIRED_FIELD,
                'Validation type is required',
                { field: 'type' }
            );
        }

        if (!request.content) {
            return failure(
                ErrorCode.MISSING_REQUIRED_FIELD,
                'Validation content is required',
                { field: 'content' }
            );
        }

        if (!request.requester) {
            return failure(
                ErrorCode.MISSING_REQUIRED_FIELD,
                'Requester ID is required',
                { field: 'requester' }
            );
        }

        // Valider le contenu selon son type
        const contentResult = this.validateContent(request.content);
        if (!contentResult.success) {
            // Utiliser la fonction failure pour garantir le bon type d'erreur
            if (contentResult.error) {
                return failure(
                    contentResult.error.code,
                    contentResult.error.message,
                    contentResult.error.details as Record<string, unknown>
                );
            } else {
                // Dans le cas improbable où error est undefined mais success est false
                return failure(
                    ErrorCode.VALIDATION_ERROR,
                    'Content validation failed with an unknown error'
                );
            }
        }

        // Valider la date limite si présente
        if (request.deadline && isNaN(request.deadline)) {
            return failure(
                ErrorCode.INVALID_DATA,
                'Deadline must be a valid timestamp',
                { field: 'deadline', value: request.deadline }
            );
        }

        if (request.dueDate && !(request.dueDate instanceof Date) && isNaN(new Date(request.dueDate).getTime())) {
            return failure(
                ErrorCode.INVALID_DATA,
                'Due date must be a valid date',
                { field: 'dueDate', value: request.dueDate }
            );
        }

        // Valider le nombre minimum de feedbacks
        if (request.minFeedbackRequired !== undefined &&
            (request.minFeedbackRequired < 1 || !Number.isInteger(request.minFeedbackRequired))) {
            return failure(
                ErrorCode.INVALID_DATA,
                'Minimum feedback required must be a positive integer',
                { field: 'minFeedbackRequired', value: request.minFeedbackRequired }
            );
        }

        return { success: true, data: request };
    }

    /**
     * Valide le contenu selon son type
     */
    private validateContent(content: ValidationContent): Result<ValidationContent> {
        switch (content.type) {
            case 'sign':
                if (!content.signId) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Sign ID is required for sign content',
                        { field: 'signId' }
                    );
                }

                if (!content.parameters) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Parameters are required for sign content',
                        { field: 'parameters' }
                    );
                }

                if (!content.parameters.handshape ||
                    !content.parameters.location ||
                    !content.parameters.movement ||
                    !content.parameters.orientation) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'All sign parameters (handshape, location, movement, orientation) are required',
                        {
                            missingParameters: Object.entries(content.parameters)
                                .filter(([, value]) => !value)
                                .map(([key]) => key)
                        }
                    );
                }
                break;

            case 'translation':
                if (!content.sourceText) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Source text is required for translation content',
                        { field: 'sourceText' }
                    );
                }

                if (!content.targetSign) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Target sign is required for translation content',
                        { field: 'targetSign' }
                    );
                }
                break;

            case 'expression':
                if (!content.name) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Name is required for expression content',
                        { field: 'name' }
                    );
                }

                if (!content.components || content.components.length === 0) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Components are required for expression content',
                        { field: 'components' }
                    );
                }

                if (content.intensity === undefined || content.intensity < 0 || content.intensity > 10) {
                    return failure(
                        ErrorCode.INVALID_DATA,
                        'Intensity must be a number between 0 and 10',
                        { field: 'intensity', value: content.intensity }
                    );
                }
                break;

            case 'document':
                if (!content.title) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Title is required for document content',
                        { field: 'title' }
                    );
                }

                if (!content.content) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Content is required for document content',
                        { field: 'content' }
                    );
                }

                if (!content.language) {
                    return failure(
                        ErrorCode.MISSING_REQUIRED_FIELD,
                        'Language is required for document content',
                        { field: 'language' }
                    );
                }

                if (!content.format || !['text', 'html', 'markdown', 'pdf'].includes(content.format)) {
                    return failure(
                        ErrorCode.INVALID_DATA,
                        'Format must be one of: text, html, markdown, pdf',
                        { field: 'format', value: content.format }
                    );
                }
                break;

            default:
                // Remplacer any par un type union plus précis
                return failure(
                    ErrorCode.INVALID_DATA,
                    `Unknown content type: ${(content as Record<string, unknown>).type}`,
                    { field: 'type', value: (content as Record<string, unknown>).type }
                );
        }

        return { success: true, data: content };
    }
}

/**
 * Validateur pour les feedbacks
 */
export class ValidationFeedbackValidator implements DataValidator<ValidationFeedback> {
    validate(feedback: ValidationFeedback): Result<ValidationFeedback> {
        // Vérifier les champs requis
        if (!feedback.expertId) {
            return failure(
                ErrorCode.MISSING_REQUIRED_FIELD,
                'Expert ID is required',
                { field: 'expertId' }
            );
        }

        if (feedback.approved === undefined) {
            return failure(
                ErrorCode.MISSING_REQUIRED_FIELD,
                'Approval status is required',
                { field: 'approved' }
            );
        }

        if (feedback.isNativeValidator === undefined) {
            return failure(
                ErrorCode.MISSING_REQUIRED_FIELD,
                'Native validator status is required',
                { field: 'isNativeValidator' }
            );
        }

        // Valider le niveau d'expertise si présent
        if (feedback.expertiseLevel !== undefined &&
            !Object.values(ExpertiseLevel).includes(feedback.expertiseLevel)) {
            return failure(
                ErrorCode.INVALID_DATA,
                'Invalid expertise level',
                {
                    field: 'expertiseLevel',
                    value: feedback.expertiseLevel,
                    validValues: Object.values(ExpertiseLevel)
                }
            );
        }

        // Valider le score si présent
        if (feedback.score !== undefined && (
            !Number.isFinite(feedback.score) ||
            feedback.score < 0 ||
            feedback.score > 10)) {
            return failure(
                ErrorCode.INVALID_DATA,
                'Score must be a number between 0 and 10',
                { field: 'score', value: feedback.score }
            );
        }

        // Valider le niveau de confiance si présent
        if (feedback.confidence !== undefined && (
            !Number.isFinite(feedback.confidence) ||
            feedback.confidence < 0 ||
            feedback.confidence > 1)) {
            return failure(
                ErrorCode.INVALID_DATA,
                'Confidence must be a number between 0 and 1',
                { field: 'confidence', value: feedback.confidence }
            );
        }

        return { success: true, data: feedback };
    }
}

/**
 * Validateur pour les transitions d'état
 */
export class StateTransitionValidator {
    // Définir les transitions d'état valides
    private static validTransitions: Record<ValidationState, ValidationState[]> = {
        [ValidationState.UNKNOWN]: [
            ValidationState.SUBMITTED
        ],
        [ValidationState.SUBMITTED]: [
            ValidationState.PENDING,
            ValidationState.IN_REVIEW,
            ValidationState.CANCELLED
        ],
        [ValidationState.PENDING]: [
            ValidationState.IN_REVIEW,
            ValidationState.CANCELLED,
            ValidationState.EXPIRED
        ],
        [ValidationState.IN_REVIEW]: [
            ValidationState.FEEDBACK_COLLECTING,
            ValidationState.CANCELLED,
            ValidationState.NEEDS_IMPROVEMENT,
            ValidationState.APPROVED,
            ValidationState.REJECTED
        ],
        [ValidationState.FEEDBACK_COLLECTING]: [
            ValidationState.CONSENSUS_CALCULATING,
            ValidationState.NEEDS_IMPROVEMENT,
            ValidationState.CANCELLED
        ],
        [ValidationState.CONSENSUS_CALCULATING]: [
            ValidationState.CONSENSUS_REACHED,
            ValidationState.NEEDS_IMPROVEMENT,
            ValidationState.CANCELLED
        ],
        [ValidationState.CONSENSUS_REACHED]: [
            ValidationState.APPROVED,
            ValidationState.REJECTED,
            ValidationState.NEEDS_IMPROVEMENT
        ],
        [ValidationState.NEEDS_IMPROVEMENT]: [
            ValidationState.SUBMITTED,
            ValidationState.CANCELLED
        ],
        [ValidationState.APPROVED]: [
            ValidationState.INTEGRATED
        ],
        [ValidationState.REJECTED]: [
            ValidationState.SUBMITTED,
            ValidationState.CANCELLED
        ],
        [ValidationState.INTEGRATED]: [],
        [ValidationState.CANCELLED]: [],
        [ValidationState.EXPIRED]: [
            ValidationState.SUBMITTED
        ]
    };

    /**
     * Valide une transition d'état
     * @param currentState État actuel
     * @param newState Nouvel état
     * @returns Résultat de la validation
     */
    static validateTransition(currentState: ValidationState, newState: ValidationState): Result<ValidationState> {
        // Si l'état ne change pas, c'est valide
        if (currentState === newState) {
            return { success: true, data: newState };
        }

        // Vérifier si la transition est valide
        const validNextStates = this.validTransitions[currentState] || [];

        if (!validNextStates.includes(newState)) {
            return failure(
                ErrorCode.STATE_TRANSITION_DENIED,
                `Cannot transition from ${currentState} to ${newState}`,
                {
                    currentState,
                    newState,
                    validTransitions: validNextStates
                }
            );
        }

        return { success: true, data: newState };
    }
}

/**
 * Factory pour créer différents validateurs
 */
export class ValidatorFactory {
    static createValidator<T>(type: string): DataValidator<T> {
        switch (type) {
            case 'validationRequest':
                return new ValidationRequestValidator() as unknown as DataValidator<T>;
            case 'feedback':
                return new ValidationFeedbackValidator() as unknown as DataValidator<T>;
            default:
                throw new Error(`Unknown validator type: ${type}`);
        }
    }
}