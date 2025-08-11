// validators/interfaces/IValidator.ts
export interface IValidator {
    validate(context: IValidationContext): Promise<IValidationResult>;
    getValidatorType(): string;
}