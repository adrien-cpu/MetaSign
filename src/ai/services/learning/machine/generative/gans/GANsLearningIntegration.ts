// src/ai/learning/integration/gans/GANsLearningIntegration.ts

import {
    GANsGenerationRequest,
    GANsGenerationResult,
    ContentType,
    ContentParameters,
    ContentDifficultyLevel,
    GANsResourceInfo,
    GANsOperationMode,
    LearnerProfile,
    FeedbackData
} from '@ai/learning/types/gans-integration.types';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { ContentAdapter } from './adapters/ContentAdapter';
import { ExampleGenerator } from './adapters/ExampleGenerator';
import { ProgressionPathGenerator } from './adapters/ProgressionPathGenerator';
import { GANsParameterAdapter } from './parameters/GANsParameterAdapter';
import { MultiLevelCache } from '@spatial/cache/MultiLevelCache';

/**
 * Integrates GANs (Generative Adversarial Networks) with the learning system
 * to generate educational content, examples, and personalized learning paths.
 */
export class GANsLearningIntegration {
    private readonly metricsCollector: IMetricsCollector;
    private readonly contentAdapter: ContentAdapter;
    private readonly exampleGenerator: ExampleGenerator;
    private readonly progressionPathGenerator: ProgressionPathGenerator;
    private readonly parameterAdapter: GANsParameterAdapter;
    private readonly resultCache: MultiLevelCache<string, GANsGenerationResult>;
    private currentMode: GANsOperationMode = 'auto';

    constructor(
        metricsCollector: IMetricsCollector,
        contentAdapter: ContentAdapter,
        exampleGenerator: ExampleGenerator,
        progressionPathGenerator: ProgressionPathGenerator,
        parameterAdapter: GANsParameterAdapter
    ) {
        this.metricsCollector = metricsCollector;
        this.contentAdapter = contentAdapter;
        this.exampleGenerator = exampleGenerator;
        this.progressionPathGenerator = progressionPathGenerator;
        this.parameterAdapter = parameterAdapter;

        // Initialize cache for GANs generation results
        this.resultCache = new MultiLevelCache<string, GANsGenerationResult>({
            L1: { maxSize: 50, ttl: 300000 },    // 5 minutes for frequently used content
            L2: { maxSize: 200, ttl: 1800000 },  // 30 minutes for regular content
            L3: { maxSize: 500, ttl: 7200000 }   // 2 hours for rarely accessed content
        });

        // Default to auto mode - will select between local, cloud, and mixed based on resources
        this.currentMode = 'auto';
    }

    /**
     * Generates learning content using GANs based on specified parameters
     * @param request Details about the content to generate
     * @returns Generated content result
     */
    public async generateContent(request: GANsGenerationRequest): Promise<GANsGenerationResult> {
        this.metricsCollector.recordMetric('gans_learning.generation_start', 1);
        const startTime = performance.now();

        try {
            // Check cache first if caching is enabled for this request type
            if (request.enableCaching !== false) {
                const cacheKey = this.generateCacheKey(request);
                const cachedResult = this.resultCache.get(cacheKey);

                if (cachedResult) {
                    this.metricsCollector.recordMetric('gans_learning.cache_hit', 1);
                    return cachedResult;
                }
            }

            // Select appropriate operation mode based on request and available resources
            const operationMode = await this.determineOptimalMode(request);

            // Adapt the request parameters based on the selected mode
            const adaptedParameters = await this.parameterAdapter.adaptParameters(
                request.contentParameters,
                operationMode,
                request.learnerProfile
            );

            // Generate the content based on content type
            let result: GANsGenerationResult;

            switch (request.contentType) {
                case 'educationalExample':
                    result = await this.exampleGenerator.generateExample(
                        adaptedParameters,
                        operationMode,
                        request.learnerProfile
                    );
                    break;

                case 'learningPath':
                    result = await this.progressionPathGenerator.generateProgressionPath(
                        adaptedParameters,
                        operationMode,
                        request.learnerProfile
                    );
                    break;

                case 'practiceExercise':
                case 'visualExplanation':
                case 'conceptDiagram':
                case 'interactiveModule':
                default:
                    // Default to content adapter for other types
                    result = await this.contentAdapter.generateContent(
                        request.contentType,
                        adaptedParameters,
                        operationMode,
                        request.learnerProfile
                    );
                    break;
            }

            // Add metadata to the result
            result.metadata = {
                generationTime: performance.now() - startTime,
                operationMode,
                timestamp: Date.now(),
                requestId: request.requestId || this.generateRequestId()
            };

            // Cache the result if caching is enabled
            if (request.enableCaching !== false) {
                const cacheKey = this.generateCacheKey(request);
                this.resultCache.set(cacheKey, result);
            }

            this.metricsCollector.recordMetric('gans_learning.generation_success', 1);
            this.metricsCollector.recordMetric('gans_learning.generation_time_ms', performance.now() - startTime);

            return result;
        } catch (error) {
            this.metricsCollector.recordMetric('gans_learning.generation_error', 1);

            // Return error result
            return {
                contentType: request.contentType,
                content: null,
                success: false,
                error: {
                    message: error instanceof Error ? error.message : String(error),
                    details: error instanceof Error && error.stack ? error.stack : undefined
                },
                metadata: {
                    generationTime: performance.now() - startTime,
                    operationMode: this.currentMode,
                    timestamp: Date.now(),
                    requestId: request.requestId || this.generateRequestId()
                }
            };
        }
    }

    /**
     * Submits feedback on generated content to improve future generations
     * @param contentId ID of the content being rated
     * @param feedback Feedback data
     */
    public async submitFeedback(contentId: string, feedback: FeedbackData): Promise<void> {
        this.metricsCollector.recordMetric('gans_learning.feedback_received', 1);

        try {
            // Process feedback based on content type
            if (feedback.contentType === 'educationalExample') {
                await this.exampleGenerator.processFeedback(contentId, feedback);
            } else if (feedback.contentType === 'learningPath') {
                await this.progressionPathGenerator.processFeedback(contentId, feedback);
            } else {
                await this.contentAdapter.processFeedback(contentId, feedback);
            }

            this.metricsCollector.recordMetric('gans_learning.feedback_processed', 1);

            // If it's negative feedback, invalidate cache for similar requests
            if (feedback.rating < 3) {
                this.invalidateRelatedCache(feedback.contentType, feedback.contentParameters);
            }
        } catch (error) {
            this.metricsCollector.recordMetric('gans_learning.feedback_error', 1);
            throw error;
        }
    }

    /**
     * Sets the GANs operation mode manually
     * @param mode Operation mode to set
     */
    public setOperationMode(mode: GANsOperationMode): void {
        this.currentMode = mode;
        this.metricsCollector.recordMetric(`gans_learning.mode_set.${mode}`, 1);
    }

    /**
     * Gets information about available resources for GANs
     */
    public async getResourceInfo(): Promise<GANsResourceInfo> {
        // Collect system resource information
        const cpuInfo = await this.collectCpuInfo();
        const memoryInfo = await this.collectMemoryInfo();
        const gpuInfo = await this.collectGpuInfo();

        // Determine recommended mode based on available resources
        const recommendedMode = this.determineRecommendedMode(cpuInfo, memoryInfo, gpuInfo);

        return {
            currentMode: this.currentMode,
            recommendedMode,
            availableResources: {
                cpu: cpuInfo,
                memory: memoryInfo,
                gpu: gpuInfo
            },
            cacheStats: {
                size: this.resultCache.size(),
                hitRate: this.resultCache.getHitRate()
            }
        };
    }

    /**
     * Clears the content generation cache
     */
    public clearCache(): void {
        this.resultCache.clear();
        this.metricsCollector.recordMetric('gans_learning.cache_cleared', 1);
    }

    /**
     * Determines the optimal operation mode based on request requirements and available resources
     */
    private async determineOptimalMode(request: GANsGenerationRequest): Promise<GANsOperationMode> {
        // If mode is specified in the request, use that
        if (request.preferredMode && request.preferredMode !== 'auto') {
            return request.preferredMode;
        }

        // If current mode is not auto, use the current mode
        if (this.currentMode !== 'auto') {
            return this.currentMode;
        }

        // Check resource availability
        const resourceInfo = await this.getResourceInfo();

        // Determine complexity of the request
        const complexity = this.assessRequestComplexity(request);

        // For high complexity requests on limited resources, use cloud
        if (complexity > 0.7 && !resourceInfo.availableResources.gpu.available) {
            return 'cloud';
        }

        // For medium complexity with some resources, use mixed
        if (complexity > 0.4 && resourceInfo.availableResources.cpu.utilization < 0.7) {
            return 'mixed';
        }

        // For low complexity or good resources, use local
        if (complexity < 0.4 || resourceInfo.availableResources.gpu.available) {
            return 'local';
        }

        // Default to mixed mode
        return 'mixed';
    }

    /**
     * Assesses the complexity of a generation request
     */
    private assessRequestComplexity(request: GANsGenerationRequest): number {
        let complexity = 0;

        // Content type complexity factors
        const contentTypeComplexity: Record<ContentType, number> = {
            'educationalExample': 0.4,
            'learningPath': 0.6,
            'practiceExercise': 0.5,
            'visualExplanation': 0.7,
            'conceptDiagram': 0.8,
            'interactiveModule': 0.9
        };

        complexity += contentTypeComplexity[request.contentType] || 0.5;

        // Difficulty level adds complexity
        const difficultyFactor: Record<ContentDifficultyLevel, number> = {
            'beginner': 0.3,
            'intermediate': 0.5,
            'advanced': 0.7,
            'expert': 0.9
        };

        complexity += difficultyFactor[request.contentParameters.difficultyLevel || 'intermediate'] || 0.5;

        // Detail level adds complexity
        if (request.contentParameters.detailLevel) {
            complexity += request.contentParameters.detailLevel / 10; // Assuming 0-10 scale
        }

        // Average and normalize to 0-1
        return Math.min(1, complexity / 2);
    }

    /**
     * Determines recommended operation mode based on system resources
     */
    private determineRecommendedMode(
        cpuInfo: { cores: number; utilization: number },
        memoryInfo: { total: number; available: number; utilization: number },
        gpuInfo: { available: boolean; model?: string; memory?: number }
    ): GANsOperationMode {
        // If AMD Ryzen 9 with Radeon GPU available and not heavily utilized
        if (gpuInfo.available &&
            cpuInfo.cores >= 8 &&
            cpuInfo.utilization < 0.7 &&
            memoryInfo.available > 8192) {
            return 'local';
        }

        // If decent CPU but no dedicated GPU
        if (cpuInfo.cores >= 4 &&
            cpuInfo.utilization < 0.6 &&
            memoryInfo.available > 4096 &&
            !gpuInfo.available) {
            return 'mixed';
        }

        // Limited resources
        return 'cloud';
    }

    /**
     * Generates a cache key for a request
     */
    private generateCacheKey(request: GANsGenerationRequest): string {
        const { contentType, contentParameters, learnerProfile } = request;

        // Extract key parameters for the cache key
        const keyParams = {
            type: contentType,
            topic: contentParameters.topic,
            difficulty: contentParameters.difficultyLevel,
            learnerLevel: learnerProfile?.skillLevel,
            preferences: learnerProfile?.preferences?.slice(0, 3)
        };

        return `gans_${JSON.stringify(keyParams)}`;
    }

    /**
     * Generates a unique request ID
     */
    private generateRequestId(): string {
        return `gans_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Invalidates cache entries related to specific content parameters
     */
    private invalidateRelatedCache(contentType: ContentType, parameters: ContentParameters): void {
        // This is a simplified implementation
        // In a real system, you'd have more sophisticated cache invalidation logic
        this.metricsCollector.recordMetric('gans_learning.cache_invalidation', 1);

        // For now, we'll just clear entries with the same content type and topic
        const keysToInvalidate = this.resultCache.getKeys().filter(key =>
            key.includes(`"type":"${contentType}"`) &&
            key.includes(`"topic":"${parameters.topic}"`)
        );

        keysToInvalidate.forEach(key => this.resultCache.delete(key));
    }

    /**
     * Collects CPU information
     */
    private async collectCpuInfo(): Promise<{ cores: number; utilization: number }> {
        // This would be implemented to get actual CPU information
        // For now, using stub implementation
        return {
            cores: 8, // Assuming an 8-core CPU like Ryzen 9
            utilization: 0.4 // 40% utilization
        };
    }

    /**
     * Collects memory information
     */
    private async collectMemoryInfo(): Promise<{ total: number; available: number; utilization: number }> {
        // This would be implemented to get actual memory information
        // For now, using stub implementation
        return {
            total: 32768, // 32 GB in MB
            available: 18432, // 18 GB available
            utilization: 0.45 // 45% utilization
        };
    }

    /**
     * Collects GPU information
     */
    private async collectGpuInfo(): Promise<{ available: boolean; model?: string; memory?: number }> {
        // This would be implemented to get actual GPU information
        // For now, using stub implementation for AMD Ryzen 9 6900HX with Radeon Graphics
        return {
            available: true,
            model: 'AMD Radeon Graphics',
            memory: 2048 // 2 GB VRAM
        };
    }
}