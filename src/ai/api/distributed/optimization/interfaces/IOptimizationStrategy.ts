// src/ai/api/distributed/optimization/interfaces/IOptimizationStrategy.ts
import { OptimizationPriority, OptimizationResult, OptimizationStrategyType, ResourceData } from '../types/optimization.types';

export interface IOptimizationStrategy {
    /**
     * Performs resource optimization based on provided data
     * @param data Current resource utilization and metrics
     * @returns Optimization result with actions and metrics
     */
    optimize(data: ResourceData): Promise<OptimizationResult>;

    /**
     * Gets the type of optimization strategy
     * @returns Strategy type
     */
    getStrategyType(): OptimizationStrategyType;

    /**
     * Gets the priority level of this strategy
     * @returns Priority level (1-5)
     */
    getPriority(): OptimizationPriority;
}