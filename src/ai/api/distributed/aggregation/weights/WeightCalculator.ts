// src/ai/api/distributed/aggregation/weights/WeightCalculator.ts
import { Logger } from '@api/common/monitoring/LogService';
import {
    NodeTrainingResult,
    PerformanceMetrics,
    ReliabilityScore,
    DataQualityMetrics
} from '../../types/DistributedTypes';

/**
 * Evaluates performance metrics of distributed nodes
 */
class PerformanceEvaluator {
    /**
     * Evaluates performance of multiple nodes
     * @param results Training results from nodes
     * @returns Map of performance metrics by node ID
     */
    async evaluate(results: NodeTrainingResult[]): Promise<Map<string, PerformanceMetrics>> {
        const metrics = new Map<string, PerformanceMetrics>();

        for (const result of results) {
            // Calculate various performance metrics
            const accuracy = result.accuracy;
            const latency = result.trainingDuration / result.samplesProcessed;
            const throughput = result.samplesProcessed / result.trainingDuration;

            // Consider convergence speed based on loss and training progress
            const convergenceSpeed = 1.0 - Math.min(1.0, Math.max(0.0, result.loss));

            // Calculate resource efficiency based on metadata if available
            const resourceEfficiency = result.metadata?.hardwareInfo
                ? this.calculateResourceEfficiency(result)
                : 0.8; // Default value if hardware info is not available

            // Calculate overall performance score
            const score = (
                accuracy * 0.4 +
                (1.0 - Math.min(latency / 100.0, 1.0)) * 0.2 +
                throughput * 0.2 +
                convergenceSpeed * 0.1 +
                resourceEfficiency * 0.1
            );

            metrics.set(result.nodeId, {
                score,
                accuracy,
                latency,
                throughput,
                convergenceSpeed,
                resourceEfficiency
            });
        }

        return metrics;
    }

    /**
     * Calculates resource efficiency based on hardware utilization
     * @param result Training result with hardware information
     * @returns Resource efficiency score (0-1)
     */
    private calculateResourceEfficiency(result: NodeTrainingResult): number {
        if (!result.metadata?.hardwareInfo) {
            return 0.8;
        }

        const { cpuCores, memory, gpuModel } = result.metadata.hardwareInfo;
        const hasGpu = !!gpuModel;

        // Calculate expected resources needed for this training task
        const expectedCores = Math.ceil(result.datasetSize / 10000);
        const expectedMemory = Math.ceil(result.datasetSize * 0.001);

        // Calculate efficiency ratio
        const coreEfficiency = Math.min(expectedCores / cpuCores, 1.0);
        const memoryEfficiency = Math.min(expectedMemory / memory, 1.0);

        // Consider GPU utilization if available
        const gpuBonus = hasGpu ? 0.2 : 0.0;

        return Math.min(
            (coreEfficiency * 0.4 + memoryEfficiency * 0.4 + gpuBonus),
            1.0
        );
    }
}

/**
 * Assesses reliability of distributed nodes
 */
class ReliabilityAssessor {
    /**
     * Assesses reliability of multiple nodes
     * @param results Training results from nodes
     * @returns Map of reliability scores by node ID
     */
    async assess(results: NodeTrainingResult[]): Promise<Map<string, ReliabilityScore>> {
        const scores = new Map<string, ReliabilityScore>();

        // In a real implementation, this would use historical data
        // For now, we'll generate sample reliability metrics
        for (const result of results) {
            // Sample metrics (in a real implementation, these would be retrieved from monitoring systems)
            const uptime = 0.95 + Math.random() * 0.05; // 95-100% uptime
            const consistency = 0.85 + Math.random() * 0.15; // 85-100% consistency
            const errorRate = Math.random() * 0.05; // 0-5% error rate
            const failureHistory = Math.random() * 0.1; // 0-10% failure history
            const recoveryTime = Math.random() * 0.2; // Fast to moderate recovery time
            const trustScore = 0.8 + Math.random() * 0.2; // 80-100% trust

            // Calculate overall reliability score
            const score = (
                uptime * 0.2 +
                consistency * 0.2 +
                (1.0 - errorRate) * 0.2 +
                (1.0 - failureHistory) * 0.15 +
                (1.0 - recoveryTime) * 0.1 +
                trustScore * 0.15
            );

            scores.set(result.nodeId, {
                score,
                uptime,
                consistency,
                errorRate,
                failureHistory,
                recoveryTime,
                trustScore
            });
        }

        return scores;
    }
}

/**
 * Analyzes data quality from distributed nodes
 */
class DataQualityAnalyzer {
    /**
     * Analyzes data quality from multiple nodes
     * @param results Training results from nodes
     * @returns Map of data quality metrics by node ID
     */
    async analyze(results: NodeTrainingResult[]): Promise<Map<string, DataQualityMetrics>> {
        const metrics = new Map<string, DataQualityMetrics>();

        for (const result of results) {
            // In a real implementation, this would analyze data samples
            // For now, we'll infer quality from available metrics

            // Estimate completeness based on dataset size vs. expected
            const avgDatasetSize = results.reduce((acc, r) => acc + r.datasetSize, 0) / results.length;
            const completeness = Math.min(result.datasetSize / avgDatasetSize, 1.0);

            // Use accuracy as a proxy for data accuracy
            const accuracy = result.accuracy;

            // Generate placeholder metrics based on result properties
            // In a real implementation, these would be calculated from data analysis
            const consistency = 0.7 + Math.random() * 0.3;
            const uniqueness = 0.8 + Math.random() * 0.2;
            const distribution = 0.75 + Math.random() * 0.25;
            const diversity = 0.8 + Math.random() * 0.2;
            const balance = 0.7 + Math.random() * 0.3;
            const biasScore = 0.7 + Math.random() * 0.3;

            // Calculate overall data quality score
            const score = (
                completeness * 0.15 +
                accuracy * 0.2 +
                consistency * 0.1 +
                uniqueness * 0.1 +
                distribution * 0.15 +
                diversity * 0.1 +
                balance * 0.1 +
                biasScore * 0.1
            );

            metrics.set(result.nodeId, {
                score,
                completeness,
                accuracy,
                consistency,
                uniqueness,
                distribution,
                diversity,
                balance,
                biasScore
            });
        }

        return metrics;
    }
}

/**
 * Calculates aggregation weights for federated learning nodes
 */
export class WeightCalculator {
    private readonly logger: Logger;
    private readonly performanceEvaluator: PerformanceEvaluator;
    private readonly reliabilityAssessor: ReliabilityAssessor;
    private readonly dataQualityAnalyzer: DataQualityAnalyzer;

    // Weight factors for different components
    private readonly weights = {
        performance: 0.5,  // Performance has highest priority
        reliability: 0.3,  // Reliability is important but secondary
        quality: 0.2       // Data quality is also considered
    };

    /**
     * Creates a new weight calculator
     */
    constructor() {
        this.logger = new Logger('WeightCalculator');
        this.performanceEvaluator = new PerformanceEvaluator();
        this.reliabilityAssessor = new ReliabilityAssessor();
        this.dataQualityAnalyzer = new DataQualityAnalyzer();
    }

    /**
     * Calculates weights for federated learning nodes
     * @param results Training results from nodes
     * @returns Map of weight by node ID
     */
    async calculateWeights(results: NodeTrainingResult[]): Promise<Map<string, number>> {
        this.logger.debug('Calculating weights for federated learning', {
            nodeCount: results.length
        });

        const weights = new Map<string, number>();

        const [performance, reliability, quality] = await Promise.all([
            this.evaluatePerformance(results),
            this.assessReliability(results),
            this.analyzeDataQuality(results)
        ]);

        for (const result of results) {
            const weight = this.computeWeight(
                performance.get(result.nodeId) as PerformanceMetrics,
                reliability.get(result.nodeId) as ReliabilityScore,
                quality.get(result.nodeId) as DataQualityMetrics
            );
            weights.set(result.nodeId, weight);

            this.logger.debug(`Calculated weight for node ${result.nodeId}`, {
                weight,
                performanceScore: performance.get(result.nodeId)?.score,
                reliabilityScore: reliability.get(result.nodeId)?.score,
                qualityScore: quality.get(result.nodeId)?.score
            });
        }

        return this.normalizeWeights(weights);
    }

    /**
     * Evaluates performance of nodes
     * @param results Training results from nodes
     * @returns Map of performance metrics by node ID
     */
    private async evaluatePerformance(results: NodeTrainingResult[]): Promise<Map<string, PerformanceMetrics>> {
        return this.performanceEvaluator.evaluate(results);
    }

    /**
     * Assesses reliability of nodes
     * @param results Training results from nodes
     * @returns Map of reliability scores by node ID
     */
    private async assessReliability(results: NodeTrainingResult[]): Promise<Map<string, ReliabilityScore>> {
        return this.reliabilityAssessor.assess(results);
    }

    /**
     * Analyzes data quality from nodes
     * @param results Training results from nodes
     * @returns Map of data quality metrics by node ID
     */
    private async analyzeDataQuality(results: NodeTrainingResult[]): Promise<Map<string, DataQualityMetrics>> {
        return this.dataQualityAnalyzer.analyze(results);
    }

    /**
     * Computes weight for a single node based on metrics
     * @param performance Performance metrics
     * @param reliability Reliability score
     * @param quality Data quality metrics
     * @returns Calculated weight
     */
    private computeWeight(
        performance: PerformanceMetrics,
        reliability: ReliabilityScore,
        quality: DataQualityMetrics
    ): number {
        return (
            performance.score * this.weights.performance +
            reliability.score * this.weights.reliability +
            quality.score * this.weights.quality
        ) / (this.weights.performance + this.weights.reliability + this.weights.quality);
    }

    /**
     * Normalizes weights to ensure they sum to 1.0
     * @param weights Map of raw weights
     * @returns Map of normalized weights
     */
    private normalizeWeights(weights: Map<string, number>): Map<string, number> {
        const normalizedWeights = new Map<string, number>();
        const sum = Array.from(weights.values()).reduce((acc, val) => acc + val, 0);

        if (sum === 0) {
            // If all weights are zero, assign equal weights
            const equalWeight = 1.0 / weights.size;
            for (const nodeId of weights.keys()) {
                normalizedWeights.set(nodeId, equalWeight);
            }
        } else {
            // Normalize weights by dividing by sum
            for (const [nodeId, weight] of weights.entries()) {
                normalizedWeights.set(nodeId, weight / sum);
            }
        }

        return normalizedWeights;
    }
}