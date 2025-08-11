// src/ai/api/distributed/optimization/OptimizationStrategyFactory.ts
import { OptimizationStrategyType } from './types/optimization.types';
import { IOptimizationStrategy } from './interfaces/IOptimizationStrategy';
import { ResourceBalancingStrategy } from './strategies/ResourceBalancingStrategy';

/**
 * Factory for creating optimization strategy instances
 */
export class OptimizationStrategyFactory {
    /**
     * Registry of available optimization strategy implementations
     */
    private static strategies: Map<OptimizationStrategyType, new () => IOptimizationStrategy> = new Map([
        [OptimizationStrategyType.RESOURCE_BALANCING, ResourceBalancingStrategy]
        // Add other strategies as they are implemented
    ]);

    /**
     * Creates a strategy instance based on strategy type
     * @param strategyType Type of optimization strategy to create
     * @returns Strategy instance
     */
    public static createStrategy(strategyType: OptimizationStrategyType): IOptimizationStrategy {
        const StrategyClass = this.strategies.get(strategyType);

        if (!StrategyClass) {
            throw new Error(`Optimization strategy type '${strategyType}' is not implemented`);
        }

        return new StrategyClass();
    }

    /**
     * Registers a new strategy implementation
     * @param strategyType Type of strategy
     * @param strategyClass Strategy class constructor
     */
    public static registerStrategy(
        strategyType: OptimizationStrategyType,
        strategyClass: new () => IOptimizationStrategy
    ): void {
        this.strategies.set(strategyType, strategyClass);
    }

    /**
     * Gets all available strategy types
     * @returns Array of available strategy types
     */
    public static getAvailableStrategies(): OptimizationStrategyType[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Creates all available optimization strategies
     * @returns Map of strategy type to strategy instance
     */
    public static createAllStrategies(): Map<OptimizationStrategyType, IOptimizationStrategy> {
        const instances = new Map<OptimizationStrategyType, IOptimizationStrategy>();

        this.strategies.forEach((StrategyClass, strategyType) => {
            instances.set(strategyType, new StrategyClass());
        });

        return instances;
    }
}