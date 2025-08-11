// src/ai/api/distributed/DistributedIntelligenceManager.ts
import { Logger } from '@api/common/monitoring/LogService';
import {
    DistributionConfig,
    NodeHealthStatus,
    NodeTrainingResult,
    AggregatedModel,
    OptimizationStrategy
} from './types/DistributedTypes';
import { ConsensusManager } from './consensus/ConsensusManager';
import { FusionManager } from './fusion/FusionManager';
import { CognitionManager } from './cognition/CognitionManager';
import { GlobalOptimizer } from './optimization/GlobalOptimizer';
import { ModelAggregatorFactory } from './aggregation/ModelAggregatorFactory';
import { WeightCalculator } from './aggregation/weights/WeightCalculator';

// Import interfaces
import { IPerformanceMonitor } from '@ai/managers/interfaces/IPerformanceMonitor';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { IDistributedHealthChecker } from './monitoring/health/interfaces/IDistributedHealthChecker';
import { IDistributedMonitor } from './monitoring/interfaces/IDistributedMonitor';
import { IDistributionValidator } from './validation/interfaces/IDistributionValidator';
import { ISecuritySystem, SecurityAccessRequest } from '@api/security/interfaces/ISecuritySystem';

// Imported from correct validation interfaces
import { ICollaborativeValidationSystem } from '@ai/feedback/observation/collaborative/interfaces/validation-interfaces';

/**
 * Interface for metrics collector adapter to avoid using any
 */
interface IMetricsSource {
    collectMetric?: (name: string, value: number) => void;
    recordMetric?: (name: string, value: number, type?: string) => void;
    pushMetric?: (name: string, value: number) => void;
    [key: string]: unknown;
}

/**
 * Adapter for different metrics collection systems
 */
class MetricsCollectorAdapter implements IMetricsCollector {
    private readonly metricsSource: IMetricsSource;

    constructor(metricsSource: IMetricsSource) {
        this.metricsSource = metricsSource;
    }

    recordMetric(name: string, value: number, type?: string): void {
        // Try to use the native method if available
        if (typeof this.metricsSource.recordMetric === 'function') {
            this.metricsSource.recordMetric(name, value, type);
            return;
        }

        // Fall back to other available methods
        if (typeof this.metricsSource.collectMetric === 'function') {
            this.metricsSource.collectMetric(name, value);
            return;
        }

        if (typeof this.metricsSource.pushMetric === 'function') {
            this.metricsSource.pushMetric(name, value);
            return;
        }

        // Log the inability to record metrics
        console.warn(`No suitable method found to record metric: ${name}`);
    }
}

/**
 * Manager for distributed intelligence processing
 * Integrates with SecurityMiddleware and ValidationCollaborative components
 */
export class DistributedIntelligenceManager {
    private readonly logger: Logger;
    private readonly performanceMonitor: IPerformanceMonitor;
    private readonly metricsCollector: IMetricsCollector;
    private readonly consensusManager: ConsensusManager;
    private readonly fusionManager: FusionManager;
    private readonly cognitionManager: CognitionManager;
    private readonly globalOptimizer: GlobalOptimizer;
    private readonly modelAggregatorFactory: ModelAggregatorFactory;
    private readonly distributionValidator: IDistributionValidator;
    private readonly healthChecker: IDistributedHealthChecker;
    private readonly monitor: IDistributedMonitor;
    private readonly securitySystem: ISecuritySystem;
    private readonly validationSystem: ICollaborativeValidationSystem;

    private config: DistributionConfig;
    private nodesHealth: Map<string, NodeHealthStatus> = new Map();

    /**
     * Creates the distributed intelligence manager
     */
    constructor(
        config: DistributionConfig,
        performanceMonitor: IPerformanceMonitor,
        metricsCollector: IMetricsSource, // Using IMetricsSource instead of any
        consensusManager: ConsensusManager,
        fusionManager: FusionManager,
        cognitionManager: CognitionManager,
        globalOptimizer: GlobalOptimizer,
        weightCalculator: WeightCalculator,
        distributionValidator: IDistributionValidator,
        healthChecker: IDistributedHealthChecker,
        monitor: IDistributedMonitor,
        securitySystem: ISecuritySystem,
        validationSystem: ICollaborativeValidationSystem
    ) {
        this.logger = new Logger('DistributedIntelligenceManager');
        this.config = config;
        this.performanceMonitor = performanceMonitor;

        // Create an adapter for metrics collector if needed
        this.metricsCollector = this.createMetricsAdapter(metricsCollector);

        this.consensusManager = consensusManager;
        this.fusionManager = fusionManager;
        this.cognitionManager = cognitionManager;
        this.globalOptimizer = globalOptimizer;
        this.modelAggregatorFactory = new ModelAggregatorFactory(
            weightCalculator,
            consensusManager,
            performanceMonitor,
            this.metricsCollector
        );
        this.distributionValidator = distributionValidator;
        this.healthChecker = healthChecker;
        this.monitor = monitor;
        this.securitySystem = securitySystem;
        this.validationSystem = validationSystem;
    }

    /**
     * Create an appropriate metrics adapter based on the type provided
     */
    private createMetricsAdapter(metrics: IMetricsSource): IMetricsCollector {
        // Check if it already implements IMetricsCollector
        if (typeof metrics.recordMetric === 'function') {
            return metrics as IMetricsCollector;
        }

        // Create an adapter
        return new MetricsCollectorAdapter(metrics);
    }

    /**
     * Initializes the manager and registers with monitoring systems
     */
    public async initialize(): Promise<void> {
        this.logger.info('Initializing distributed intelligence manager', {
            config: this.config
        });

        // Start health monitoring
        await this.healthChecker.initialize();

        // Register with security system
        await this.securitySystem.registerComponent('distributed_intelligence', {
            accessLevel: 'restricted',
            component: this,
            operations: ['aggregate', 'distribute', 'optimize'],
            auditLevel: 'high'
        });

        // Set up monitoring
        this.monitor.addHealthCheckCallback(this.performHealthCheck.bind(this));
        this.monitor.startMonitoring();

        this.logger.info('Distributed intelligence manager initialized');
    }

    /**
     * Aggregates model results from distributed nodes
     */
    async aggregateResults(
        results: NodeTrainingResult[],
        strategy: OptimizationStrategy = OptimizationStrategy.WEIGHTED_AVERAGING
    ): Promise<AggregatedModel> {
        // Start performance tracking
        const startTime = Date.now();

        try {
            this.logger.info('Starting model aggregation', {
                nodeCount: results.length,
                strategy
            });

            // Security validation through middleware
            await this.validateSecurity(results);

            // Check node health
            await this.validateNodesHealth(results);

            // Validate distribution
            await this.distributionValidator.validateDistribution(results);

            // Create appropriate aggregator
            const aggregator = this.modelAggregatorFactory.createDefaultAggregator();

            // Perform aggregation
            const aggregatedModel = await aggregator.aggregate(results);

            // Apply global optimization if configured
            if (this.config.strategy !== OptimizationStrategy.WEIGHTED_AVERAGING) {
                await this.globalOptimizer.optimize(aggregatedModel);
            }

            // Create the validation request using the collaborative system
            const validationRequestId = this.validationSystem.createValidationRequest(
                aggregatedModel.metadata.version,
                'model_validation',
                {
                    accuracy: aggregatedModel.metadata.performanceEstimate.accuracy,
                    loss: aggregatedModel.metadata.performanceEstimate.loss,
                    contributors: aggregatedModel.metadata.contributors.length
                },
                ['accuracy', 'performance', 'reliability']
            );

            this.logger.info('Model aggregation completed and validation requested', {
                modelVersion: aggregatedModel.metadata.version,
                accuracy: aggregatedModel.metadata.performanceEstimate.accuracy,
                validationRequestId
            });

            return aggregatedModel;
        } catch (error) {
            this.logger.error('Model aggregation failed', { error });
            throw error;
        } finally {
            // Calculate execution time
            const duration = Date.now() - startTime;

            // Record performance metrics
            this.metricsCollector.recordMetric(
                'distributed.aggregation.duration',
                duration,
                'histogram'
            );
        }
    }

    /**
     * Validates security constraints through security middleware
     */
    private async validateSecurity(results: NodeTrainingResult[]): Promise<void> {
        // Check if all nodes are authorized
        const nodeIds = results.map(r => r.nodeId);

        const request: SecurityAccessRequest = {
            source: { zone: 'distributed', endpoint: 'model_aggregation' },
            target: { zone: 'internal', resource: 'model_aggregation' },
            context: {
                operation: 'aggregate',
                nodeIds
            },
            operation: 'process'
        };

        const securityCheck = await this.securitySystem.validateAccess(request);

        if (!securityCheck.allowed) {
            throw new Error(`Security validation failed: ${securityCheck.reason}`);
        }
    }

    /**
     * Validates health status of participating nodes
     */
    private async validateNodesHealth(results: NodeTrainingResult[]): Promise<void> {
        const nodeIds = results.map(r => r.nodeId);
        const healthStatuses = await this.healthChecker.checkNodesHealth(nodeIds);

        // Update health map
        for (const status of healthStatuses) {
            this.nodesHealth.set(status.nodeId, status);
        }

        // Check if any node is unhealthy
        const unhealthyNodes = healthStatuses.filter(s => !s.isAlive);
        if (unhealthyNodes.length > 0) {
            throw new Error(`Unhealthy nodes detected: ${unhealthyNodes.map(n => n.nodeId).join(', ')}`);
        }
    }

    /**
     * Performs periodic health check for monitoring
     */
    private async performHealthCheck(): Promise<boolean> {
        try {
            // Basic self-check
            const isHealthy = this.consensusManager !== undefined &&
                this.fusionManager !== undefined &&
                this.modelAggregatorFactory !== undefined;

            return isHealthy;
        } catch (error) {
            this.logger.error('Health check failed', { error });
            return false;
        }
    }

    /**
     * Updates configuration
     */
    updateConfig(config: Partial<DistributionConfig>): void {
        this.config = { ...this.config, ...config };
        this.logger.info('Configuration updated', { config: this.config });
    }

    /**
     * Gracefully shuts down the manager
     */
    async shutdown(): Promise<void> {
        this.logger.info('Shutting down distributed intelligence manager');

        // Stop monitoring
        await this.monitor.stopMonitoring();

        // Unregister from security system
        await this.securitySystem.unregisterComponent('distributed_intelligence');

        this.logger.info('Distributed intelligence manager shutdown complete');
    }
}