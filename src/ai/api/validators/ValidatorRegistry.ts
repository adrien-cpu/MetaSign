// ValidatorRegistry.ts
export class ValidatorRegistry {
    private validators: Map<string, IValidator>;

    registerValidator(type: string, validator: IValidator): void {
        this.validators.set(type, validator);
    }

    getValidator(type: string): IValidator {
        return this.validators.get(type);
    }
}