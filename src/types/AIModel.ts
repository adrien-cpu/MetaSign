export type AIModelType = 'LSF' | 'NLP' | 'VISION' | 'MULTIMODAL';

export interface AIModel {
    id: string;
    name: string;
    version: string;
    type: AIModelType;
    status: 'training' | 'deployed' | 'stopped' | 'error';
    lastUpdated: string;
    accuracy: number;
    lastTraining: string;
    nextTraining: string;
    parameters: Record<string, unknown>;
    metrics: {
        accuracy: number;
        loss: number;
        validationAccuracy: number;
        validationLoss: number;
    };
    config: {
        batchSize: number;
        learningRate: number;
        epochs: number;
        optimizer: string;
    };
    performance: {
        inferenceTime: number;
        throughput: number;
        memoryUsage: number;
        gpuUtilization: number;
    };
    training: {
        currentEpoch: number;
        totalEpochs: number;
        startTime: string;
        estimatedCompletion: string;
        progress: number;
    };
    gpuUsage: number;
    memoryUsage: number;
    specializations: string[];
    dependencies: {
        name: string;
        version: string;
        required: boolean;
    }[];
}