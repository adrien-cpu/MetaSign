// validators/interfaces/IValidationResult.ts
export interface IValidationResult {
    isValid: boolean;
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
    metadata?: ResultMetadata;
    timestamp: number;
}