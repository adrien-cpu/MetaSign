// src/ai/api/distributed/validation/FederatedValidator.ts
export class FederatedValidator {
    private readonly metricsValidator: MetricsValidator;
    private readonly modelValidator: ModelValidator;
    private readonly securityValidator: SecurityValidator;

    async validate(model: AggregatedModel): Promise<ValidationResult> {
        const [metrics, modelVal, security] = await Promise.all([
            this.metricsValidator.validate(model),
            this.modelValidator.validate(model),
            this.securityValidator.validate(model)
        ]);

        return {
            isValid: metrics.isValid && modelVal.isValid && security.isValid,
            results: { metrics, model: modelVal, security },
            recommendations: this.mergeRecommendations([
                metrics.recommendations,
                modelVal.recommendations,
                security.recommendations
            ])
        };
    }
}