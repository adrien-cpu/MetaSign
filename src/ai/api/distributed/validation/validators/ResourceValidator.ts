// src/ai/api/distributed/validation/validators/ResourceValidator.ts
export class ResourceValidator implements IValidator<ResourceRequirements> {
    async validate(requirements: ResourceRequirements): Promise<ValidationResult> {
        const errors = [];
        const warnings = [];

        await this.validateCPURequirements(requirements.cpu, errors);
        await this.validateMemoryRequirements(requirements.memory, errors);
        await this.validateNetworkRequirements(requirements.network, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            metadata: { timestamp: Date.now() }
        };
    }

    private async validateCPURequirements(cpu: CPURequirements, errors: ValidationError[]): Promise<void> {
        if (cpu.cores > this.getMaxAvailableCores()) {
            errors.push({
                code: 'RESOURCE_CPU_EXCEEDED',
                message: `Required cores (${cpu.cores}) exceeds available cores`
            });
        }
    }
}