// federated/ModelAggregator.ts
export class ModelAggregator {
    private readonly aggregationStrategies: Map<string, AggregationStrategy>;
    private secureAggregation: SecureAggregation;

    async aggregate(models: FederatedModel[]): Promise<GlobalModel> {
        const weightedModels = await this.weightModels(models);
        return this.secureAggregation.aggregateSecurely(weightedModels);
    }

    private async weightModels(models: FederatedModel[]): Promise<WeightedModel[]> {
        return models.map(model => ({
            ...model,
            weight: this.calculateModelWeight(model)
        }));
    }
}