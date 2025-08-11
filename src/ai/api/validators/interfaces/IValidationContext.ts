// validators/interfaces/IValidationContext.ts
export interface IValidationContext {
    type: string;
    data: any;
    metadata: ValidationMetadata;
    constraints?: ValidationConstraints;
}