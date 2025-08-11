import {
    ValidationRequest,
    Validation,
    ValidationResults,
    ValidatorType
} from '../types/validation-types';

export interface ICollaborativeValidationSystem {
    createValidationRequest(
        contentId: string,
        contentType: string,
        content: unknown,
        criteria: string[]
    ): ValidationRequest;

    submitValidation(
        requestId: string,
        validatorId: string,
        validatorType: ValidatorType,
        criteria: string,
        score: number,
        feedback: string
    ): Validation;

    getValidationResults(requestId: string): ValidationResults;
}
