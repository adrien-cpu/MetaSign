// src/ai/api/distributed/aggregation/ModelAggregator.ts
import { Logger } from '@api/common/monitoring/LogService';
import { WeightCalculator } from './weights/WeightCalculator';
import { ConsensusManager } from '../consensus/ConsensusManager';
import {
    NodeTrainingResult as DistributedNodeTrainingResult,
    AggregatedModel,
    ModelParameters,
    AggregatedModelMetadata,
    ConsensusResult
} from '../types/DistributedTypes';
import { IPerformanceMonitor } from '@ai/managers/interfaces/IPerformanceMonitor';

// Import actual types from consensus module
import {
    NodeTrainingResult as ConsensusNodeTrainingResult,
    ConsensusInfo,
    ModelParameters as ConsensusModelParameters
} from '../consensus/types/ConsensusTypes';

/**
 * Extended performance monitor interface with operation tracking
 */
interface IExtendedPerformanceMonitor extends IPerformanceMonitor {
    startOperation(operationName: string): void;
    endOperation(operationName: string): void;
}

/**
 * Aggregates models from distributed training nodes using weighted federation
 */
export class ModelAggregator {
    private readonly logger: Logger;
    private readonly weightCalculator: WeightCalculator;
    private readonly consensusManager: ConsensusManager;
    private readonly performanceMonitor: IPerformanceMonitor | undefined;

    /**
     * Creates a new model aggregator
     * @param weightCalculator Weight calculator for node contributions
     * @param consensusManager Consensus manager for result validation
     * @param performanceMonitor Optional performance monitor for tracking aggregation metrics
     */
    constructor(
        weightCalculator: WeightCalculator,
        consensusManager: ConsensusManager,
        performanceMonitor?: IPerformanceMonitor
    ) {
        this.logger = new Logger('ModelAggregator');
        this.weightCalculator = weightCalculator;
        this.consensusManager = consensusManager;
        this.performanceMonitor = performanceMonitor;
    }

    /**
     * Aggregates models from multiple nodes
     * @param results Training results from nodes
     * @returns Aggregated model
     */
    async aggregate(results: DistributedNodeTrainingResult[]): Promise<AggregatedModel> {
        if (!results || results.length === 0) {
            throw new Error('Cannot aggregate empty results');
        }

        this.logger.debug('Starting model aggregation', { nodeCount: results.length });

        // Safely track performance if the monitor has the capabilities
        const extendedMonitor = this.performanceMonitor as IExtendedPerformanceMonitor | undefined;
        const monitorPerformance = extendedMonitor && typeof extendedMonitor.startOperation === 'function';

        if (monitorPerformance) {
            extendedMonitor.startOperation('model-aggregation');
        }

        try {
            const weights = await this.weightCalculator.calculateWeights(results);

            // Adapter les données pour le ConsensusManager
            const consensusResults = this.adaptResultsForConsensus(results);
            const consensusInfo = await this.consensusManager.achieveConsensus(consensusResults);

            // Convertir le résultat du consensus au format attendu
            const consensus = this.convertToConsensusResult(consensusInfo);

            const parameters = this.aggregateParameters(results, weights);
            const metadata = this.aggregateMetadata(results, weights);

            this.logger.debug('Model aggregation completed', {
                consensusAchieved: consensus.achieved,
                contributingNodes: results.length
            });

            return {
                parameters,
                metadata,
                consensus
            };
        } finally {
            // Safely end performance tracking if applicable
            if (monitorPerformance && typeof extendedMonitor?.endOperation === 'function') {
                extendedMonitor.endOperation('model-aggregation');
            }
        }
    }

    /**
     * Adapts training results to the format expected by ConsensusManager
     * @param results Original training results
     * @returns Adapted results for consensus
     */
    private adaptResultsForConsensus(results: DistributedNodeTrainingResult[]): ConsensusNodeTrainingResult[] {
        return results.map(result => {
            // Adapter le modèle pour le consensus
            const modelParameters: ConsensusModelParameters = {
                version: result.parameters.version,
                weights: result.parameters.weights as Record<string, number[]>,
                hash: result.parameters.version // Utiliser version comme hash par défaut
            };

            // Créer des métriques avec le champ loss requis
            const metrics = {
                loss: result.loss,
                accuracy: result.accuracy,
                // Ajouter d'autres métriques du résultat original
                ...(result.metrics || {})
            };

            return {
                nodeId: result.nodeId,
                taskId: `task-${result.nodeId}-${Date.now()}`,
                iteration: 1,
                modelParameters,
                metrics,
                timestamp: result.timestamp,
                // Utiliser un objet vide au lieu de undefined pour config
                config: {},
                systemInfo: {
                    dataSize: result.samplesProcessed
                }
            };
        });
    }

    /**
     * Converts consensus info to the expected ConsensusResult format
     * @param consensusInfo Raw consensus information
     * @returns Formatted consensus result
     */
    private convertToConsensusResult(consensusInfo: ConsensusInfo): ConsensusResult {
        // Create result with required fields
        const result: ConsensusResult = {
            achieved: consensusInfo.achieved,
            confidence: consensusInfo.agreement?.confidence || 0.0,
            participantCount: consensusInfo.participants || 0,
            consensusMethod: consensusInfo.agreement?.aggregationMethod || 'weighted_voting'
        };

        // Add optional fields only if they have values
        if (consensusInfo.agreement?.agreementCount) {
            // Create empty voting results object as fallback
            result.votingResults = {};
        }

        if (consensusInfo.metadata?.reason) {
            result.decisionReason = String(consensusInfo.metadata.reason);
        }

        if (Array.isArray(consensusInfo.metadata?.outliers)) {
            result.outliers = consensusInfo.metadata.outliers as string[];
        }

        return result;
    }

    /**
     * Aggregates model parameters using weighted averaging
     * @param results Training results from nodes
     * @param weights Node contribution weights
     * @returns Aggregated model parameters
     */
    private aggregateParameters(
        results: DistributedNodeTrainingResult[],
        weights: Map<string, number>
    ): ModelParameters {
        // Initialize parameters from first model's structure
        const aggregated = this.initializeParameters(results[0]);

        // Apply weighted sum for each result
        return results.reduce((acc, result) => {
            const weight = weights.get(result.nodeId) || 0;
            return this.weightedSum(acc, result.parameters, weight);
        }, aggregated);
    }

    /**
     * Aggregates metadata from all contributing models
     * @param results Training results from nodes
     * @param weights Node contribution weights
     * @returns Aggregated model metadata
     */
    private aggregateMetadata(
        results: DistributedNodeTrainingResult[],
        weights: Map<string, number>
    ): AggregatedModelMetadata {
        // Extract contributing nodes (those with weight > 0)
        const contributors = Array.from(weights.entries())
            .filter(([, weight]) => weight > 0)
            .map(([nodeId]) => nodeId);

        // Calculate average accuracy and loss
        const accuracySum = results.reduce((sum, result) => sum + result.accuracy, 0);
        const lossSum = results.reduce((sum, result) => sum + result.loss, 0);
        const avgAccuracy = accuracySum / results.length;
        const avgLoss = lossSum / results.length;

        // Calculate dataset statistics
        const totalSamples = results.reduce((sum, result) => sum + result.samplesProcessed, 0);
        const avgSamplesPerNode = totalSamples / results.length;

        return {
            timestamp: Date.now(),
            version: this.generateVersion(results),
            contributors,
            aggregationMethod: 'weighted_average',
            performanceEstimate: {
                accuracy: avgAccuracy,
                loss: avgLoss,
                convergence: this.estimateConvergence(results)
            },
            datasetInfo: {
                totalSamples,
                avgSamplesPerNode,
                distributionMetrics: this.calculateDistributionMetrics(results)
            }
        };
    }

    /**
     * Creates weighted sum of model parameters
     * @param baseParameters Base parameters
     * @param newParameters Parameters to add
     * @param weight Weight for new parameters
     * @returns Updated parameters
     */
    private weightedSum(
        baseParameters: ModelParameters,
        newParameters: ModelParameters,
        weight: number
    ): ModelParameters {
        // If weight is zero, no contribution needed
        if (weight === 0) return baseParameters;

        // Deep copy of base parameters
        const result = JSON.parse(JSON.stringify(baseParameters)) as ModelParameters;

        // Apply weighted sum to weights
        for (const layer in newParameters.weights) {
            if (!result.weights[layer]) continue;

            const targetWeights = result.weights[layer];
            const sourceWeights = newParameters.weights[layer];

            if (targetWeights.length !== sourceWeights.length) {
                this.logger.warn('Layer size mismatch during aggregation', {
                    layer,
                    baseSize: targetWeights.length,
                    newSize: sourceWeights.length
                });
                continue;
            }

            for (let i = 0; i < targetWeights.length; i++) {
                targetWeights[i] += sourceWeights[i] * weight;
            }
        }

        // Apply weighted sum to biases
        for (const layer in newParameters.biases) {
            if (!result.biases[layer]) continue;

            const targetBiases = result.biases[layer];
            const sourceBiases = newParameters.biases[layer];

            if (targetBiases.length !== sourceBiases.length) {
                this.logger.warn('Bias size mismatch during aggregation', {
                    layer,
                    baseSize: targetBiases.length,
                    newSize: sourceBiases.length
                });
                continue;
            }

            for (let i = 0; i < targetBiases.length; i++) {
                targetBiases[i] += sourceBiases[i] * weight;
            }
        }

        return result;
    }

    /**
     * Initializes parameters structure from result
     * @param result First training result
     * @returns Empty initialized parameters
     */
    private initializeParameters(result: DistributedNodeTrainingResult): ModelParameters {
        // In a real implementation, this would extract the model structure
        // from the first result and initialize parameters with zeros

        // Fix: Ensure hyperparameters is never undefined
        const hyperparams = result.parameters.hyperparameters
            ? { ...result.parameters.hyperparameters }
            : {};  // Empty object instead of undefined

        return {
            weights: this.initializeZeroWeights(result.parameters.weights),
            biases: this.initializeZeroBiases(result.parameters.biases),
            hyperparameters: hyperparams,
            shape: result.parameters.shape,
            version: result.parameters.version
        };
    }

    /**
     * Initializes weights with zeros while preserving structure
     * @param weights Source weights structure
     * @returns Zero-initialized weights
     */
    private initializeZeroWeights(weights: Record<string, number[]>): Record<string, number[]> {
        const result: Record<string, number[]> = {};

        for (const layer in weights) {
            result[layer] = new Array(weights[layer].length).fill(0);
        }

        return result;
    }

    /**
     * Initializes biases with zeros while preserving structure
     * @param biases Source biases structure
     * @returns Zero-initialized biases
     */
    private initializeZeroBiases(biases: Record<string, number[]>): Record<string, number[]> {
        const result: Record<string, number[]> = {};

        for (const layer in biases) {
            result[layer] = new Array(biases[layer].length).fill(0);
        }

        return result;
    }

    /**
     * Generates version string for aggregated model
     * @param results Training results
     * @returns Version string
     */
    private generateVersion(results: DistributedNodeTrainingResult[]): string {
        // Take base version from first model
        const baseVersion = results[0].modelVersion;

        // Add timestamp and node count
        return `${baseVersion}-agg-${results.length}-${Date.now()}`;
    }

    /**
     * Estimates model convergence based on loss values
     * @param results Training results
     * @returns Convergence estimate (0-1)
     */
    private estimateConvergence(results: DistributedNodeTrainingResult[]): number {
        // Simple convergence estimation based on average loss
        // Lower loss means higher convergence
        const avgLoss = results.reduce((sum, result) => sum + result.loss, 0) / results.length;

        // Map loss to a 0-1 scale where 0 is high loss and 1 is low loss
        // Assuming typical loss values range from 0 to 5
        return Math.max(0, Math.min(1, 1 - (avgLoss / 5)));
    }

    /**
     * Calculates distribution metrics for training data
     * @param results Training results
     * @returns Distribution metrics
     */
    private calculateDistributionMetrics(results: DistributedNodeTrainingResult[]): Record<string, number> {
        // Calculate Gini coefficient for data distribution
        const gini = this.calculateGiniCoefficient(results.map(r => r.samplesProcessed));

        // Calculate coefficient of variation
        const sampleCounts = results.map(r => r.samplesProcessed);
        const mean = sampleCounts.reduce((sum, count) => sum + count, 0) / sampleCounts.length;
        const variance = sampleCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / sampleCounts.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;

        return {
            giniCoefficient: gini,
            coefficientOfVariation: cv,
            minSamples: Math.min(...sampleCounts),
            maxSamples: Math.max(...sampleCounts),
            avgSamples: mean
        };
    }

    /**
     * Calculates Gini coefficient for distribution analysis
     * @param values Array of values
     * @returns Gini coefficient (0-1)
     */
    private calculateGiniCoefficient(values: number[]): number {
        // Sort values
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;

        if (n === 0 || sorted.every(v => v === 0)) return 0;

        // Calculate Gini coefficient
        let sumNumerator = 0;
        for (let i = 0; i < n; i++) {
            sumNumerator += sorted[i] * (i + 1);
        }

        const sumValues = sorted.reduce((sum, val) => sum + val, 0);
        return (2 * sumNumerator) / (n * sumValues) - (n + 1) / n;
    }
}