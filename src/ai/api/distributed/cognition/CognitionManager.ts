/**
 * CognitionManager.ts
 * 
 * Manages distributed cognitive tasks across the intelligence network,
 * handling task analysis, distribution, and supervision requirements.
 * Part of the IntelligenceDistribuée subsystem as defined in the state diagrams.
 */

import { ValidationService } from '@api/common/validation/ValidationService';
import {
    DistributedTask,
    TaskDistribution,
    TaskPriority,
    TaskComplexity
} from '@api/distributed/types/DistributedTypes';
import { SupervisionLevel } from '@ai/ethics/types';
import { IHumanSupervisor } from './interfaces/IHumanSupervisor';
import { ResourceEstimation, TaskAnalysis } from './types/CognitionTypes';
import { LogService } from '@api/common/monitoring/LogService';
import { CognitionErrorTypes } from './types/CognitionErrorTypes';

/**
 * Manages the distribution and execution of cognitive tasks across the distributed
 * intelligence network, ensuring appropriate supervision and resource allocation.
 */
export class CognitionManager {
    private readonly validators: ValidationService;
    private readonly supervisors: Map<string, IHumanSupervisor>;
    private readonly logger: LogService;

    /**
     * Creates a new cognition manager
     * @param validators Validation service to validate task distributions
     * @param logger Logging service for monitoring and debugging
     * @param initialSupervisors Initial set of human supervisors
     */
    constructor(
        validators: ValidationService,
        logger: LogService,
        initialSupervisors: IHumanSupervisor[] = []
    ) {
        this.validators = validators;
        this.logger = logger;
        this.supervisors = new Map<string, IHumanSupervisor>();

        // Initialize supervisors map
        initialSupervisors.forEach(supervisor => {
            this.supervisors.set(supervisor.id, supervisor);
        });
    }

    /**
     * Distributes a cognitive task across the distributed intelligence network
     * @param task The task to distribute
     * @returns A validated task distribution plan
     */
    public async distributeTask(task: DistributedTask): Promise<TaskDistribution> {
        try {
            this.logger.info('Starting task distribution', { taskId: task.id });

            const analysis = await this.analyzeTask(task);
            const validationResult = await this.validators.validate('DISTRIBUTION', analysis);

            // Check if validation was successful
            if (!validationResult.success || !validationResult.data) {
                const errors = validationResult.errors?.map(e => e.message).join(', ') || 'Unknown validation error';
                this.logger.error('Task distribution validation failed', { taskId: task.id, errors });
                throw new Error(CognitionErrorTypes.VALIDATION_FAILED + ': ' + errors);
            }

            // Create a task distribution from the validation result
            // This assumes that validators.validate returns a ValidationResult with TaskDistribution in the data property
            let initialDistribution: TaskDistribution;

            if (this.isTaskDistribution(validationResult.data)) {
                // The validator returned a complete TaskDistribution
                initialDistribution = validationResult.data;
            } else {
                // Create a basic distribution and merge any valid data from the validation result
                initialDistribution = {
                    id: `dist-${task.id}-${Date.now()}`,
                    task: task,
                    nodes: [],
                    assignments: [],
                    metadata: {
                        createdAt: new Date().toISOString(),
                        validatorId: validationResult.metadata?.validator
                    }
                };

                // Merge valid properties from validation result if it's an object
                if (validationResult.data && typeof validationResult.data === 'object' && validationResult.data !== null) {
                    const data = validationResult.data as Record<string, unknown>;

                    if (Array.isArray(data.nodes)) {
                        initialDistribution.nodes = data.nodes;
                    }

                    if (Array.isArray(data.assignments)) {
                        initialDistribution.assignments = data.assignments;
                    }

                    if (data.dataLocations && Array.isArray(data.dataLocations)) {
                        initialDistribution.dataLocations = data.dataLocations as Array<{
                            dataId: string;
                            nodeId: string;
                            [key: string]: unknown;
                        }>;
                    }

                    if (data.taskDependencies && Array.isArray(data.taskDependencies)) {
                        initialDistribution.taskDependencies = data.taskDependencies as Array<{
                            sourceTaskId: string;
                            targetTaskId: string;
                            [key: string]: unknown;
                        }>;
                    }
                }
            }

            // Optimize the distribution
            const optimizedDistribution = this.optimizeDistribution(initialDistribution);

            this.logger.info('Task distribution completed', {
                taskId: task.id,
                nodeCount: optimizedDistribution.nodes?.length || 0,
                assignmentCount: optimizedDistribution.assignments?.length || 0
            });

            return optimizedDistribution;
        } catch (error) {
            this.logger.error('Task distribution failed', {
                taskId: task.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    /**
        * Type guard to check if an object is a TaskDistribution
        * @param obj Object to check
        * @returns Whether the object is a TaskDistribution
        */
    private isTaskDistribution(obj: unknown): obj is TaskDistribution {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        const candidate = obj as Partial<TaskDistribution>;
        return typeof candidate.id === 'string' &&
            typeof candidate.task === 'object' &&
            candidate.task !== null;
    }

    /**
     * Analyzes a task to determine optimal distribution strategy
     * @param task The task to analyze
     * @returns Analysis results including parallelization and supervision requirements
     */
    public async analyzeTask(task: DistributedTask): Promise<TaskAnalysis> {
        this.logger.debug('Analyzing task', { taskId: task.id });

        const parallelize = this.canParallelize(task);
        const supervision = await this.determineSupervisorLevel(task);
        const resourceEstimation = this.estimateResources(task);

        return {
            task,
            parallelize,
            supervision,
            resourceEstimation
        };
    }

    /**
     * Determines if a task can be parallelized
     * @param task The task to evaluate
     * @returns Whether the task can be parallelized
     */
    private canParallelize(task: DistributedTask): boolean {
        // Tasks marked as sequential cannot be parallelized
        if (task.executionMode === 'sequential') {
            return false;
        }

        // Check task complexity - simple tasks don't benefit from parallelization
        if (task.complexity === TaskComplexity.SIMPLE) {
            return false;
        }

        // Check dependencies - tasks with many dependencies are harder to parallelize effectively
        if (task.dependencies && task.dependencies.length > 5) {
            return false;
        }

        // Check if the task is explicitly marked as parallelizable
        if (task.parallelizable === false) {
            return false;
        }

        return true;
    }

    /**
     * Estimates the computing resources required for a task
     * @param task The task to evaluate
     * @returns Resource estimation including CPU, memory, and time requirements
     */
    private estimateResources(task: DistributedTask): ResourceEstimation {
        // Base estimations
        let cpu = 1;
        let memory = 256; // MB
        let duration = 100; // ms

        // Adjust by task complexity
        switch (task.complexity) {
            case TaskComplexity.COMPLEX:
                cpu *= 2;
                memory *= 2;
                duration *= 3;
                break;
            case TaskComplexity.VERY_COMPLEX:
                cpu *= 4;
                memory *= 4;
                duration *= 6;
                break;
            case TaskComplexity.EXTREME:
                cpu *= 8;
                memory *= 8;
                duration *= 10;
                break;
        }

        // Adjust by task priority
        if (task.priority === TaskPriority.HIGH) {
            cpu = Math.min(cpu * 1.5, 16); // Cap at 16 cores
        } else if (task.priority === TaskPriority.CRITICAL) {
            cpu = Math.min(cpu * 2, 32); // Cap at 32 cores
            memory *= 1.5;
        }

        // Apply task size factor if available
        if (task.size) {
            // Logarithmic scaling to prevent overallocation for large tasks
            const sizeFactor = Math.log10(Math.max(10, task.size)) / 2;
            cpu *= sizeFactor;
            memory *= sizeFactor;
            duration *= sizeFactor;
        }

        return {
            cpu: Math.ceil(cpu),
            memory: Math.ceil(memory),
            estimatedDuration: Math.ceil(duration)
        };
    }

    /**
     * Determines the required level of human supervision for a task
     * @param task The task to evaluate
     * @returns The required supervision level
     */
    private async determineSupervisorLevel(task: DistributedTask): Promise<SupervisionLevel> {
        // High-risk tasks always require full supervision
        if (task.riskLevel && task.riskLevel > 0.8) {
            return SupervisionLevel.FULL;
        }

        // Critical tasks require at least partial supervision
        if (task.priority === TaskPriority.CRITICAL) {
            return SupervisionLevel.PARTIAL;
        }

        // Check if task type requires ethical validation
        if (task.requiresEthicalValidation) {
            return SupervisionLevel.ETHIC_REVIEW;
        }

        // Check for tasks that impact user-facing components
        if (task.impactsUserExperience) {
            return SupervisionLevel.MINIMAL;
        }

        // Default to automated supervision for low-risk tasks
        return SupervisionLevel.AUTOMATED;
    }

    /**
     * Optimizes the distribution of a task
     * @param distribution The initial task distribution
     * @returns An optimized task distribution
     */
    private optimizeDistribution(distribution: TaskDistribution): TaskDistribution {
        // Create a deep copy to avoid modifying the original
        const optimized: TaskDistribution = JSON.parse(JSON.stringify(distribution));

        try {
            // Apply optimization strategies
            this.balanceLoad(optimized);
            this.optimizeDataLocality(optimized);
            this.minimizeCommunication(optimized);

            return optimized;
        } catch (error) {
            this.logger.warn('Distribution optimization failed, using original distribution', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return distribution; // Return original if optimization fails
        }
    }

    /**
     * Balances the computational load across available nodes
     * @param distribution The task distribution to optimize
     */
    private balanceLoad(distribution: TaskDistribution): void {
        if (!distribution.nodes || !distribution.assignments ||
            distribution.nodes.length === 0 || distribution.assignments.length === 0) {
            return;
        }

        // Calculate current load per node
        const nodeLoads = new Map<string, number>();

        distribution.nodes.forEach((node) => {
            nodeLoads.set(node.id, 0);
        });

        distribution.assignments.forEach((assignment) => {
            const currentLoad = nodeLoads.get(assignment.nodeId) || 0;
            nodeLoads.set(assignment.nodeId, currentLoad + assignment.estimatedLoad);
        });

        // Find overloaded and underloaded nodes
        const avgLoad = Array.from(nodeLoads.values()).reduce((sum, load) => sum + load, 0) / nodeLoads.size;
        const overloadThreshold = avgLoad * 1.3; // 30% above average

        const overloadedNodes = Array.from(nodeLoads.entries())
            .filter(([, load]) => load > overloadThreshold)
            .map(([nodeId]) => nodeId);

        if (overloadedNodes.length === 0) {
            return; // No overloaded nodes, no rebalancing needed
        }

        // Rebalancing logic would go here
        // Implementation would depend on specific task requirements and node capabilities
    }

    /**
     * Optimizes data locality to minimize data transfer
     * @param distribution The task distribution to optimize
     */
    private optimizeDataLocality(distribution: TaskDistribution): void {
        if (!distribution.assignments || !distribution.dataLocations) {
            return;
        }

        // For each task, calculate data transfer costs to each node
        // and potentially reassign to minimize total data transfer
        // Implementation depends on the specific data location mapping
    }

    /**
     * Minimizes communication overhead between distributed tasks
     * @param distribution The task distribution to optimize
     */
    private minimizeCommunication(distribution: TaskDistribution): void {
        if (!distribution.assignments || !distribution.taskDependencies) {
            return;
        }

        // Build a dependency graph
        // Group highly-connected tasks on the same node when possible
        // Implementation depends on the specific dependency graph structure
    }

    /**
     * Adds a human supervisor to the system
     * @param supervisor The supervisor to add
     */
    public addSupervisor(supervisor: IHumanSupervisor): void {
        if (!supervisor.id) {
            throw new Error(CognitionErrorTypes.INVALID_SUPERVISOR);
        }

        this.supervisors.set(supervisor.id, supervisor);
        this.logger.info('Supervisor added', { supervisorId: supervisor.id });
    }

    /**
     * Removes a human supervisor from the system
     * @param supervisorId The ID of the supervisor to remove
     * @returns Whether the supervisor was successfully removed
     */
    public removeSupervisor(supervisorId: string): boolean {
        const result = this.supervisors.delete(supervisorId);
        if (result) {
            this.logger.info('Supervisor removed', { supervisorId });
        } else {
            this.logger.warn('Supervisor not found', { supervisorId });
        }
        return result;
    }

    /**
     * Gets all available supervisors
     * @returns A list of available supervisors
     */
    public getAvailableSupervisors(): IHumanSupervisor[] {
        return Array.from(this.supervisors.values())
            .filter(supervisor => supervisor.availability);
    }

    /**
     * Finds a supervisor with specific expertise
     * @param expertiseRequired The expertise areas required
     * @returns The most suitable supervisor or undefined if none found
     */
    public findSupervisorWithExpertise(expertiseRequired: string[]): IHumanSupervisor | undefined {
        // Filter available supervisors
        const availableSupervisors = this.getAvailableSupervisors();

        // Score each supervisor by how many required expertise areas they match
        const scoredSupervisors = availableSupervisors.map(supervisor => {
            const matchCount = expertiseRequired.filter(req =>
                supervisor.expertise.includes(req)
            ).length;

            return { supervisor, matchCount };
        });

        // Sort by match count (descending) and return the best match if any
        scoredSupervisors.sort((a, b) => b.matchCount - a.matchCount);

        return scoredSupervisors.length > 0 && scoredSupervisors[0].matchCount > 0
            ? scoredSupervisors[0].supervisor
            : undefined;
    }
}