// src/ai/learning/integration/finetuning/FineTuningLearningIntegration.ts

import {
    FineTuningRequest,
    FineTuningResult,
    ModelType,
    TrainingParameters,
    ModelEvaluationResult,
    FineTuningOperationMode,
    LearnerProfile,
    ModelMetadata,
    ModelOptimizationOptions,
    ModelDeploymentOptions
} from '@ai/learning/types/finetuning.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { ModelRegistry } from './management/ModelRegistry';
import { TrainingManager } from './management/TrainingManager';
import { PerformanceMonitor } from './management/PerformanceMonitor';
import { OverfittingDetector } from './analysis/OverfittingDetector';
import { PerformanceAnalyzer } from './analysis/PerformanceAnalyzer';
import { PatternAnalyzer } from './analysis/PatternAnalyzer';
import { MultiLevelCache } from '@spatial/cache/MultiLevelCache';
import { Logger } from '@ai/utils/Logger';

// Ajout des interfaces nécessaires
interface HardwareInfo {
    cpu: {
        cores: number;
        utilization: number;
    };
    memory: {
        total: number;
        available: number;)
        utilization: number;
    };
    gpu?: {
        available: boolean;
        model?: string;
        memory?: number;
    };
    thermals: {
        cpuTemperature?: number;
        gpuTemperature?: number;
    };
}

interface ModelInfo {
    modelId: string;
    baseModelType: ModelType;
    purpose: string;
    metrics: ModelMetrics;
    createdAt: string;
    status: ModelStatus;
    performanceMetrics: PerformanceMetrics;
}

interface ModelMetrics {
    accuracy: number;
    f1Score: number;
    loss: number;
    trainingTime: number;
}

interface PerformanceMetrics {
    inferenceTime: number;
    memoryUsage: number;
    throughput: number;
}

interface ModelListFilters {
    purpose?: string;
    targetDomain?: string;
    modelType?: ModelType;
    minAccuracy?: number;
    status?: ModelStatus;
    createdAfter?: Date;
    tags?: string[];
}

type ModelStatus = 'training' | 'deployed' | 'failed' | 'archived';

/**
 * Integrates fine-tuning capabilities with the learning system to create
 * specialized models for personalized learning experiences.
 */
export class FineTuningLearningIntegration {
    private readonly metricsCollector: IMetricsCollector;
    private readonly modelRegistry: ModelRegistry;
    private readonly trainingManager: TrainingManager;
    private readonly performanceMonitor: PerformanceMonitor;
    private readonly overfittingDetector: OverfittingDetector;
    private readonly performanceAnalyzer: PerformanceAnalyzer;
    private readonly patternAnalyzer: PatternAnalyzer;
    private readonly logger: Logger;
    private readonly resultCache: MultiLevelCache<string, FineTuningResult>;
    private currentMode: FineTuningOperationMode = 'auto';

    constructor(
        metricsCollector: IMetricsCollector,
        modelRegistry: ModelRegistry,
        trainingManager: TrainingManager,
        performanceMonitor: PerformanceMonitor,
        overfittingDetector: OverfittingDetector,
        performanceAnalyzer: PerformanceAnalyzer,
        patternAnalyzer: PatternAnalyzer,
        logger: Logger
    ) {
        this.metricsCollector = metricsCollector;
        this.modelRegistry = modelRegistry;
        this.trainingManager = trainingManager;
        this.performanceMonitor = performanceMonitor;
        this.overfittingDetector = overfittingDetector;
        this.performanceAnalyzer = performanceAnalyzer;
        this.patternAnalyzer = patternAnalyzer;
        this.logger = logger;

        // Initialize cache for fine-tuning results
        this.resultCache = new MultiLevelCache<string, FineTuningResult>({
            L1: { maxSize: 20, ttl: 300000 },    // 5 minutes for hot models
            L2: { maxSize: 50, ttl: 1800000 },   // 30 minutes for warm models
            L3: { maxSize: 100, ttl: 7200000 }   // 2 hours for cold models
        });
    }

    /**
     * Fine-tunes a model for specific learning scenarios
     * @param request Details about the fine-tuning job
     * @returns Results of the fine-tuning process
     */
    public async fineTuneModel(request: FineTuningRequest): Promise<FineTuningResult> {
        this.metricsCollector.recordMetric('fine_tuning.start', 1);
        const startTime = performance.now();

        try {
            // Log detailed information for debugging
            this.logger.info('Fine-tuning request received', {
                modelType: request.modelType,
                datasetSize: request.trainingData?.length || 0,
                purpose: request.purpose
            });

            // Check cache first if enabled
            if (request.enableCaching !== false) {
                const cacheKey = this.generateCacheKey(request);
                const cachedResult = this.resultCache.get(cacheKey);

                if (cachedResult) {
                    this.metricsCollector.recordMetric('fine_tuning.cache_hit', 1);
                    this.logger.debug('Fine-tuning cache hit', { modelId: cachedResult.modelId });
                    return cachedResult;
                }
            }

            // Determine optimal operation mode
            const operationMode = await this.determineOptimalMode(request);

            // Check if a similar model already exists in the registry
            const existingModel = await this.modelRegistry.findSimilarModel(
                request.modelType,
                request.purpose,
                request.targetDomain,
                request.learnerProfile
            );

            if (existingModel && !request.forceRetrain) {
                this.metricsCollector.recordMetric('fine_tuning.existing_model_used', 1);
                this.logger.info('Using existing fine-tuned model', { modelId: existingModel.modelId });

                // Update usage statistics for the existing model
                await this.modelRegistry.recordModelUsage(existingModel.modelId);

                // Return the existing model information
                const result: FineTuningResult = {
                    modelId: existingModel.modelId,
                    originalModelType: existingModel.baseModelType,
                    purpose: existingModel.purpose,
                    success: true,
                    metrics: existingModel.metrics,
                    metadata: {
                        createdAt: existingModel.createdAt,
                        lastUsed: new Date().toISOString(),
                        operationMode: operationMode,
                        existingModel: true,
                        processingTime: performance.now() - startTime
                    }
                };

                // Cache the result
                if (request.enableCaching !== false) {
                    const cacheKey = this.generateCacheKey(request);
                    this.resultCache.set(cacheKey, result);
                }

                return result;
            }

            // Validate and preprocess training data
            const processedData = this.preprocessTrainingData(request.trainingData || [], request.modelType);

            // Configure fine-tuning parameters
            const trainingParams = this.configureTrainingParameters(
                request.trainingParameters || {},
                request.modelType,
                processedData.length,
                operationMode
            );

            // Execute fine-tuning operation
            this.logger.info('Starting fine-tuning process', {
                modelType: request.modelType,
                operationMode,
                dataSize: processedData.length
            });

            const trainedModelInfo = await this.trainingManager.trainModel(
                request.modelType,
                processedData,
                trainingParams,
                operationMode,
                request.validationData || []
            );

            // Evaluate the fine-tuned model
            const evaluationResult = await this.evaluateModel(
                trainedModelInfo.modelId,
                request.evaluationData || [],
                request.modelType
            );

            // Check for overfitting
            const overfittingAnalysis = await this.overfittingDetector.detectOverfitting(
                trainedModelInfo.trainingMetrics,
                evaluationResult
            );

            // Optimize the model if needed
            let optimizedModelInfo = trainedModelInfo;
            if (overfittingAnalysis.isOverfitting || request.optimizationOptions) {
                const optimizationOptions: ModelOptimizationOptions = {
                    ...request.optimizationOptions,
                    addressOverfitting: overfittingAnalysis.isOverfitting,
                    pruningThreshold: overfittingAnalysis.recommendedPruningThreshold,
                    quantization: request.optimizationOptions?.quantization || operationMode === 'local'
                };

                this.logger.info('Optimizing fine-tuned model', {
                    modelId: trainedModelInfo.modelId,
                    isOverfitting: overfittingAnalysis.isOverfitting,
                    optimizationOptions
                });

                optimizedModelInfo = await this.trainingManager.optimizeModel(
                    trainedModelInfo.modelId,
                    optimizationOptions
                );
            }

            // Register the model in the registry
            const modelMetadata: ModelMetadata = {
                baseModelType: request.modelType,
                purpose: request.purpose,
                targetDomain: request.targetDomain,
                learnerProfileTarget: request.learnerProfile,
                createdAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                trainingDatasetSize: processedData.length,
                operationMode: operationMode,
                optimized: optimizedModelInfo.modelId !== trainedModelInfo.modelId,
                tags: request.tags || []
            };

            await this.modelRegistry.registerModel(
                optimizedModelInfo.modelId,
                modelMetadata,
                evaluationResult,
                optimizedModelInfo.modelSize
            );

            // Handle model deployment if requested
            if (request.deployment) {
                await this.deployModel(optimizedModelInfo.modelId, request.deployment);
            }

            // Prepare result
            const result: FineTuningResult = {
                modelId: optimizedModelInfo.modelId,
                originalModelType: request.modelType,
                purpose: request.purpose,
                success: true,
                metrics: {
                    ...evaluationResult.metrics,
                    trainingLoss: optimizedModelInfo.trainingMetrics.finalLoss,
                    validationLoss: optimizedModelInfo.trainingMetrics.validationLoss,
                    trainingSamples: processedData.length,
                    validationSamples: request.validationData?.length || 0,
                    evaluationSamples: request.evaluationData?.length || 0,
                    modelSize: optimizedModelInfo.modelSize,
                    originalModelSize: trainedModelInfo.modelSize,
                    reductionRatio: trainedModelInfo.modelSize > 0
                        ? 1 - (optimizedModelInfo.modelSize / trainedModelInfo.modelSize)
                        : 0
                },
                warnings: overfittingAnalysis.isOverfitting
                    ? [{ type: 'overfitting', message: 'Model showed signs of overfitting and was optimized' }]
                    : [],
                metadata: {
                    createdAt: modelMetadata.createdAt,
                    lastUsed: modelMetadata.lastUsed,
                    operationMode: operationMode,
                    existingModel: false,
                    processingTime: performance.now() - startTime,
                    optimized: modelMetadata.optimized
                }
            };

            // Cache the result
            if (request.enableCaching !== false) {
                const cacheKey = this.generateCacheKey(request);
                this.resultCache.set(cacheKey, result);
            }

            this.metricsCollector.recordMetric('fine_tuning.success', 1);
            this.metricsCollector.recordMetric('fine_tuning.processing_time_ms', performance.now() - startTime);

            return result;
        } catch (error) {
            this.metricsCollector.recordMetric('fine_tuning.error', 1);
            this.logger.error('Fine-tuning failed', { error: error instanceof Error ? error.message : String(error) });

            // Return error result
            return {
                modelId: '',
                originalModelType: request.modelType,
                purpose: request.purpose,
                success: false,
                error: {
                    message: error instanceof Error ? error.message : String(error),
                    details: error instanceof Error && error.stack ? error.stack : undefined
                },
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastUsed: new Date().toISOString(),
                    operationMode: this.currentMode,
                    existingModel: false,
                    processingTime: performance.now() - startTime
                }
            };
        }
    }

    /**
     * Evaluates a fine-tuned model using provided evaluation data
     * @param modelId Identifier of the model to evaluate
     * @param evaluationData Data to use for evaluation
     * @param modelType Type of the base model
     */
    private async evaluateModel(
        modelId: string,
        evaluationData: Array<Record<string, unknown>>,
        modelType: ModelType
    ): Promise<ModelEvaluationResult> {
        this.metricsCollector.recordMetric('fine_tuning.evaluation_start', 1);
        this.logger.info('Starting model evaluation', { modelId, dataSize: evaluationData.length });

        try {
            // Perform model evaluation
            const evaluationResult = await this.performanceAnalyzer.evaluateModel(
                modelId,
                evaluationData,
                modelType
            );

            // Log detailed metrics for monitoring
            this.logger.info('Model evaluation completed', {
                modelId,
                accuracy: evaluationResult.metrics.accuracy,
                f1Score: evaluationResult.metrics.f1Score
            });

            this.metricsCollector.recordMetric('fine_tuning.evaluation_success', 1);
            return evaluationResult;
        } catch (error) {
            this.metricsCollector.recordMetric('fine_tuning.evaluation_error', 1);
            this.logger.error('Model evaluation failed', {
                modelId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Return a minimal result with error information
            return {
                modelId,
                success: false,
                metrics: {},
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Deploys a fine-tuned model for inference
     * @param modelId Identifier of the model to deploy
     * @param options Deployment options
     */
    private async deployModel(modelId: string, options: ModelDeploymentOptions): Promise<void> {
        this.metricsCollector.recordMetric('fine_tuning.deployment_start', 1);
        this.logger.info('Starting model deployment', { modelId, environment: options.environment });

        try {
            // Implement deployment logic based on options
            switch (options.environment) {
                case 'local':
                    // Deploy to local runtime
                    await this.trainingManager.deployModelLocally(modelId, options);
                    break;

                case 'cloud':
                    // Deploy to cloud service
                    await this.trainingManager.deployModelToCloud(modelId, options);
                    break;

                case 'edge':
                    // Deploy to edge devices
                    await this.trainingManager.deployModelToEdge(modelId, options);
                    break;

                default:
                    throw new Error(`Unsupported deployment environment: ${options.environment}`);
            }

            // Update model status in registry
            await this.modelRegistry.updateModelStatus(modelId, 'deployed', {
                deploymentEnvironment: options.environment,
                deploymentTimestamp: new Date().toISOString(),
                deploymentConfig: options
            });

            this.metricsCollector.recordMetric('fine_tuning.deployment_success', 1);
            this.logger.info('Model deployment completed', { modelId, environment: options.environment });
        } catch (error) {
            this.metricsCollector.recordMetric('fine_tuning.deployment_error', 1);
            this.logger.error('Model deployment failed', {
                modelId,
                environment: options.environment,
                error: error instanceof Error ? error.message : String(error)
            });

            throw error;
        }
    }

    /**
     * Determines the optimal mode for fine-tuning based on request and hardware capabilities
     */
    private async determineOptimalMode(request: FineTuningRequest): Promise<FineTuningOperationMode> {
        // If preferred mode is specified, use it
        if (request.preferredMode && request.preferredMode !== 'auto') {
            return request.preferredMode;
        }

        // If mode is not auto, use the currently set mode
        if (this.currentMode !== 'auto') {
            return this.currentMode;
        }

        // Analyze dataset size
        const datasetSize = (request.trainingData?.length || 0) + (request.validationData?.length || 0);

        // Check hardware capabilities
        const hardwareInfo = await this.collectHardwareInfo();

        // For tiny datasets and available AMD Ryzen resources, use local mode
        if (datasetSize < 500 &&
            hardwareInfo.cpu.cores >= 6 &&
            hardwareInfo.cpu.utilization < 0.7 &&
            hardwareInfo.memory.available > 8192) {
            return 'local';
        }

        // For medium datasets or limited AMD Ryzen resources, use hybrid mode
        if (datasetSize < 5000 &&
            hardwareInfo.cpu.cores >= 4 &&
            hardwareInfo.cpu.utilization < 0.8 &&
            hardwareInfo.memory.available > 4096) {
            return 'hybrid';
        }

        // For large datasets or limited resources, use cloud mode
        return 'cloud';
    }

    /**
     * Collects hardware information for decision making
     */
    private async collectHardwareInfo(): Promise<HardwareInfo> {
        // This would be implemented to get actual hardware information
        // For now, using a stub implementation for AMD Ryzen 9 6900HX
        return {
            cpu: {
                cores: 8, // 8 cores for Ryzen 9 6900HX
                utilization: 0.4 // 40% utilization
            },
            memory: {
                total: 32768, // 32 GB in MB
                available: 18432, // 18 GB available
                utilization: 0.45 // 45% utilization
            },
            gpu: {
                available: true,
                model: 'AMD Radeon Graphics',
                memory: 2048 // 2 GB VRAM
            },
            thermals: {
                cpuTemperature: 65, // 65°C
                gpuTemperature: 70  // 70°C
            }
        };
    }

    /**
     * Preprocesses and validates training data
     */
    private preprocessTrainingData(
        data: Array<Record<string, unknown>>,
        modelType: ModelType
    ): Array<Record<string, unknown>> {
        this.logger.debug('Preprocessing training data', { dataSize: data.length, modelType });

        if (data.length === 0) {
            throw new Error('Empty training dataset provided');
        }

        // Apply preprocessing based on model type
        let processedData: any[] = [];

        switch (modelType) {
            case 'text-classification':
                processedData = this.preprocessTextClassificationData(data);
                break;

            case 'text-generation':
                processedData = this.preprocessTextGenerationData(data);
                break;

            case 'image-classification':
                processedData = this.preprocessImageClassificationData(data);
                break;

            case 'multimodal':
                processedData = this.preprocessMultimodalData(data);
                break;

            default:
                throw new Error(`Unsupported model type: ${modelType}`);
        }

        this.logger.debug('Training data preprocessing completed', {
            originalSize: data.length,
            processedSize: processedData.length
        });

        return processedData;
    }

    /**
     * Configures training parameters based on model type and available resources
     */
    private configureTrainingParameters(
        userParams: TrainingParameters,
        modelType: ModelType,
        datasetSize: number,
        operationMode: FineTuningOperationMode
    ): TrainingParameters {
        // Start with default parameters
        const defaultParams: TrainingParameters = {
            epochs: 3,
            batchSize: 16,
            learningRate: 2e-5,
            evaluationStrategy: 'epoch',
            warmupSteps: 500,
            weightDecay: 0.01
        };

        // Adjust based on model type
        let modelSpecificParams: Partial<TrainingParameters> = {};

        switch (modelType) {
            case 'text-classification':
                modelSpecificParams = {
                    batchSize: 32,
                    epochs: datasetSize < 1000 ? 5 : 3
                };
                break;

            case 'text-generation':
                modelSpecificParams = {
                    batchSize: 8,
                    learningRate: 5e-5,
                    epochs: datasetSize < 500 ? 4 : 2
                };
                break;

            case 'image-classification':
                modelSpecificParams = {
                    batchSize: 16,
                    epochs: 10,
                    learningRate: 1e-4
                };
                break;

            case 'multimodal':
                modelSpecificParams = {
                    batchSize: 4,
                    epochs: 2,
                    learningRate: 1e-5
                };
                break;
        }

        // Adjust based on operation mode
        let modeSpecificParams: Partial<TrainingParameters> = {};

        switch (operationMode) {
            case 'local':
                // Conservative settings for local mode on AMD Ryzen
                modeSpecificParams = {
                    batchSize: Math.min(modelSpecificParams.batchSize || defaultParams.batchSize, 8),
                    fp16: true, // Use mixed precision for efficiency
                    gradientAccumulationSteps: 2, // Accumulate gradients to simulate larger batch size
                    cpuThreads: 6 // Use 6 of the 8 cores in Ryzen 9
                };
                break;

            case 'hybrid':
                modeSpecificParams = {
                    fp16: true,
                    offloadOptimizer: true, // Offload optimizer states to CPU
                    gradientCheckpointing: true // Save memory at the cost of computation
                };
                break;

            case 'cloud':
                // Cloud can handle larger batches and more aggressive training
                modeSpecificParams = {
                    batchSize: (modelSpecificParams.batchSize || defaultParams.batchSize) * 2,
                    fp16: true
                };
                break;
        }

        // Combine parameters with precedence: user > mode > model specific > default
        return {
            ...defaultParams,
            ...modelSpecificParams,
            ...modeSpecificParams,
            ...userParams
        };
    }

    /**
     * Preprocesses data for text classification models
     */
    private preprocessTextClassificationData(
        data: Array<Record<string, unknown>>
    ): Array<{
        text: string;
        label: string;
    }> {
        // Validate and normalize text classification data
        return data.filter(item =>
            typeof item.text === 'string' &&
            item.text.length > 0 &&
            typeof item.label !== 'undefined'
        ).map(item => ({
            text: (item.text as string).trim(),
            label: String(item.label)
        }));
    }

    /**
     * Preprocesses data for text generation models
     */
    private preprocessTextGenerationData(
        data: Array<Record<string, unknown>>
    ): Array<{
        input: string;
        output: string;
        prompt_template: string | null;
    }> {
        // Validate and normalize text generation data
        return data.filter(item =>
            typeof item.input === 'string' &&
            item.input.length > 0 &&
            typeof item.output === 'string' &&
            item.output.length > 0
        ).map(item => ({
            input: (item.input as string).trim(),
            output: (item.output as string).trim(),
            prompt_template: item.prompt_template || null
        }));
    }

    /**
     * Preprocesses data for image classification models
     */
    private preprocessImageClassificationData(data: any[]): any[] {
        // Validate and normalize image classification data
        return data.filter(item =>
            item.image &&
            typeof item.label !== 'undefined'
        ).map(item => ({
            image: item.image,
            label: String(item.label),
            metadata: item.metadata || {}
        }));
    }

    /**
     * Preprocesses data for multimodal models
     */
    private preprocessMultimodalData(data: any[]): any[] {
        // Validate and normalize multimodal data
        return data.filter(item =>
            (typeof item.text === 'string' || item.image) &&
            typeof item.label !== 'undefined'
        ).map(item => ({
            text: typeof item.text === 'string' ? item.text.trim() : null,
            image: item.image || null,
            label: String(item.label),
            metadata: item.metadata || {}
        }));
    }

    /**
     * Generates a cache key for a fine-tuning request
     */
    private generateCacheKey(request: FineTuningRequest): string {
        // Extract key parameters for the cache key
        const keyParams = {
            modelType: request.modelType,
            purpose: request.purpose,
            targetDomain: request.targetDomain,
            learnerLevel: request.learnerProfile?.skillLevel || 'any',
            dataHash: this.hashTrainingData(request.trainingData || [])
        };

        return `finetuning_${JSON.stringify(keyParams)}`;
    }

    /**
     * Generates a simple hash for training data to use in cache keys
     */
    private hashTrainingData(data: any[]): string {
        if (data.length === 0) {
            return 'empty';
        }

        // Simple hash based on data length and a sample of records
        const sampleSize = Math.min(5, data.length);
        const samples = [];

        for (let i = 0; i < sampleSize; i++) {
            const index = Math.floor(i * (data.length / sampleSize));
            const sample = data[index];
            samples.push(sample);
        }

        // Generate a deterministic string representation of the samples
        const sampleString = JSON.stringify(samples)
            .replace(/\s+/g, '')
            .substring(0, 100);

        return `${data.length}_${sampleString.length}_${this.simpleHash(sampleString)}`;
    }

    /**
     * Computes a simple hash of a string
     */
    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Sets the fine-tuning operation mode manually
     * @param mode Operation mode to set
     */
    public setOperationMode(mode: FineTuningOperationMode): void {
        this.currentMode = mode;
        this.metricsCollector.recordMetric(`fine_tuning.mode_set.${mode}`, 1);
        this.logger.info(`Fine-tuning operation mode set to ${mode}`);
    }

    /**
     * Gets information about a specific fine-tuned model
     * @param modelId Identifier of the model
     */
    public async getModelInfo(modelId: string): Promise<ModelInfo> {
        this.metricsCollector.recordMetric('fine_tuning.get_model_info', 1);

        try {
            // Retrieve model information from registry
            const modelInfo = await this.modelRegistry.getModelInfo(modelId);

            if (!modelInfo) {
                throw new Error(`Model not found: ${modelId}`);
            }

            // Get additional performance metrics
            const performanceMetrics = await this.performanceMonitor.getModelMetrics(modelId);

            // Combine information
            return {
                ...modelInfo,
                performanceMetrics
            };
        } catch (error) {
            this.metricsCollector.recordMetric('fine_tuning.get_model_info_error', 1);
            this.logger.error('Failed to get model info', {
                modelId,
                error: error instanceof Error ? error.message : String(error)
            });

            throw error;
        }
    }

    /**
     * Lists available fine-tuned models with filtering options
     * @param filters Optional filtering criteria
     */
    public async listModels(filters?: ModelListFilters): Promise<ModelInfo[]> {
        this.metricsCollector.recordMetric('fine_tuning.list_models', 1);

        try {
            // Get filtered models from registry
            const models = await this.modelRegistry.listModels(filters);

            this.logger.info('Retrieved model list', { count: models.length, filters });
            return models;
        } catch (error) {
            this.metricsCollector.recordMetric('fine_tuning.list_models_error', 1);
            this.logger.error('Failed to list models', {
                filters,
                error: error instanceof Error ? error.message : String(error)
            });

            throw error;
        }
    }

    /**
     * Deletes a fine-tuned model
     * @param modelId Identifier of the model to delete
     */
    public async deleteModel(modelId: string): Promise<boolean> {
        this.metricsCollector.recordMetric('fine_tuning.delete_model', 1);

        try {
            // Delete the model from the registry and storage
            const deleted = await this.modelRegistry.deleteModel(modelId);

            if (deleted) {
                // Clear any cache entries for this model
                this.clearModelFromCache(modelId);
                this.logger.info('Model deleted successfully', { modelId });
            } else {
                this.logger.warn('Model not found for deletion', { modelId });
            }

            return deleted;
        } catch (error) {
            this.metricsCollector.recordMetric('fine_tuning.delete_model_error', 1);
            this.logger.error('Failed to delete model', {
                modelId,
                error: error instanceof Error ? error.message : String(error)
            });

            throw error;
        }
    }

    /**
     * Clears a specific model from the cache
     */
    private clearModelFromCache(modelId: string): void {
        // Find cache keys containing this model ID
        const keysToRemove = this.resultCache.getKeys().filter(key =>
            key.includes(modelId)
        );

        // Remove matching keys
        keysToRemove.forEach(key => this.resultCache.delete(key));

        this.logger.debug('Cleared model from cache', {
            modelId,
            entriesRemoved: keysToRemove.length
        });
    }

    /**
     * Clears the entire fine-tuning cache
     */
    public clearCache(): void {
        this.resultCache.clear();
        this.metricsCollector.recordMetric('fine_tuning.cache_cleared', 1);
        this.logger.info('Fine-tuning cache cleared');
    }
}