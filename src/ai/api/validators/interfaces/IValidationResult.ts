// validators/interfaces/IValidationResult.ts
import { ValidationError, ValidationWarning, ValidationMetadata } from '../../common/validation/types/ValidationTypes';

export interface IValidationResult {
    success: boolean;
    isValid: boolean;
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
    metadata?: ValidationMetadata;
    timestamp: number;
}