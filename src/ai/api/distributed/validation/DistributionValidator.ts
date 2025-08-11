// src/ai/api/distributed/validation/DistributionValidator.ts
export class DistributionValidator implements IValidator<TaskDistribution> {
    async validate(distribution: TaskDistribution): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        await this.validateDistribution(distribution, errors);
        await this.validateRequirements(distribution.requirements, errors);
        await this.checkOptimization(distribution, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            metadata: this.createMetadata(distribution)
        };
    }

    getValidatorType(): string {
        return 'DISTRIBUTION';
    }
}