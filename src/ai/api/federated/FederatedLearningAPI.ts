// src/ai/api/federated/FederatedLearningAPI.ts
import { ValidationService } from '../common/validation/ValidationService';
import { MetricsCollector } from '../common/metrics/MetricsCollector';

export class FederatedLearningAPI {
    private modelAggregator: ModelAggregator;
    private privacyGuard: PrivacyGuard;
    private validationService: ValidationService;
    private securityService: SecurityService;

    async initiateLearning(nodes: FederatedNode[]): Promise<void> {
        await this.securityService.validateNodes(nodes);
        const trainingConfigs = await this.prepareTrainingSession(nodes);
        
        const modelUpdates = await Promise.all(nodes.map(node => 
            this.trainNode(node, trainingConfigs[node.id])
        ));

        await this.aggregateAndValidate(modelUpdates);
    }

    private async trainNode(node: FederatedNode, config: TrainingConfig): Promise<ModelUpdate> {
        const trainingResult = await node.train(config);
        await this.privacyGuard.validateUpdate(trainingResult);
        return trainingResult;
    }

    private async aggregateAndValidate(updates: ModelUpdate[]): Promise<void> {
        const aggregatedModel = await this.modelAggregator.aggregate(updates);
        await this.validationService.validateModel(aggregatedModel);
        await this.privacyGuard.finalizePrivacy(aggregatedModel);
    }
}