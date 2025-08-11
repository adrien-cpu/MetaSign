// src/ai/api/distributed/optimization/strategies/ResourceBalancingStrategy.ts
import {
    BottleneckType,
    Bottleneck,
    BottleneckMetrics,
    ImpactAssessment,
    OptimizationAction,
    OptimizationActionType,
    OptimizationMetrics,
    OptimizationPriority,
    OptimizationResult,
    OptimizationStrategyType,
    ResourceAllocation,
    ResourceData,
    ResourceMetrics,
    ResourceType
} from '../types/optimization.types';
import { IOptimizationStrategy } from '../interfaces/IOptimizationStrategy';

/**
 * Strategy for optimizing resource allocation and balancing across distributed systems
 */
export class ResourceBalancingStrategy implements IOptimizationStrategy {
    /**
     * Priority of the balancing strategy (1-5)
     */
    private readonly priority: OptimizationPriority = 3;

    /**
     * Implements optimization strategy interface method
     * @param data Current resource utilization and metrics
     * @returns Optimization result with actions and metrics
     */
    public async optimize(data: ResourceData): Promise<OptimizationResult> {
        const currentAllocation = await this.analyzeResourceAllocation(data);
        const balancedAllocation = this.calculateBalancedAllocation(currentAllocation, data);

        const optimizations = this.generateBalancingActions(currentAllocation, balancedAllocation);
        const metrics = this.calculateBalancingMetrics(balancedAllocation, currentAllocation);

        return {
            optimizations,
            metrics,
            suggestedAllocation: balancedAllocation,
            warnings: this.generateWarnings(data, balancedAllocation),
            timestamp: Date.now()
        };
    }

    /**
     * Returns the type of this strategy
     */
    public getStrategyType(): OptimizationStrategyType {
        return OptimizationStrategyType.RESOURCE_BALANCING;
    }

    /**
     * Returns the priority of this strategy
     */
    public getPriority(): OptimizationPriority {
        return this.priority;
    }

    /**
     * Analyzes current resource allocation based on input data
     * @param data Resource metrics data
     * @returns Current resource allocation
     */
    private async analyzeResourceAllocation(data: ResourceData): Promise<ResourceAllocation> {
        const allocations: Record<ResourceType, number> = {} as Record<ResourceType, number>;
        const distribution: Record<string, number> = {};

        // Calculate current allocation based on metrics
        Object.entries(data.resources).forEach(([resourceType, metrics]) => {
            allocations[resourceType as ResourceType] = metrics.total - metrics.available;
            distribution[resourceType] = ((metrics.total - metrics.available) / metrics.total) * 100;
        });

        // Calculate additional allocation metrics
        const totalAllocated = Object.values(allocations).reduce((sum, value) => sum + value, 0);
        const estimatedCapacity = this.calculateEstimatedCapacity(data);
        const reservedCapacity = estimatedCapacity * 0.1; // Reserve 10% by default

        return {
            allocations,
            distribution,
            estimatedCapacity,
            reservedCapacity,
            timestamp: data.timestamp
        };
    }

    /**
     * Calculates the estimated capacity based on resource data
     * @param data Resource data
     * @returns Estimated system capacity
     */
    private calculateEstimatedCapacity(data: ResourceData): number {
        // Calculate weighted capacity based on the limiting resource
        const weights: Record<ResourceType, number> = {
            'cpu': 0.4,
            'memory': 0.3,
            'network': 0.15,
            'storage': 0.1,
            'gpu': 0.05
        };

        let capacityScore = 0;

        Object.entries(data.resources).forEach(([resourceType, metrics]) => {
            const resourceWeight = weights[resourceType as ResourceType] || 0.1;
            const resourceCapacity = (metrics.available / metrics.total) * 100;
            capacityScore += resourceCapacity * resourceWeight;
        });

        return Math.max(0, Math.min(100, capacityScore));
    }

    /**
     * Calculates a balanced resource allocation to optimize efficiency
     * @param currentAllocation Current resource allocation
     * @param data Current resource data
     * @returns Optimized resource allocation
     */
    private calculateBalancedAllocation(
        currentAllocation: ResourceAllocation,
        data: ResourceData
    ): ResourceAllocation {
        const usage = this.calculateResourceUsage(currentAllocation, data);
        const distribution = this.optimizeDistribution(usage, data);
        return this.validateAllocation(distribution, data);
    }

    /**
     * Calculates resource usage patterns from current allocation
     * @param allocation Current resource allocation
     * @param data Resource data
     * @returns Resource usage analysis
     */
    private calculateResourceUsage(
        allocation: ResourceAllocation,
        data: ResourceData
    ): Record<ResourceType, number> {
        const usage: Record<ResourceType, number> = {} as Record<ResourceType, number>;

        Object.entries(data.resources).forEach(([resourceType, metrics]) => {
            usage[resourceType as ResourceType] =
                (allocation.allocations[resourceType as ResourceType] / metrics.total) * 100;
        });

        return usage;
    }

    /**
     * Optimizes the distribution of resources based on usage patterns
     * @param usage Current resource usage
     * @param data Resource data
     * @returns Optimized resource allocation
     */
    private optimizeDistribution(
        usage: Record<ResourceType, number>,
        data: ResourceData
    ): ResourceAllocation {
        const newAllocation: ResourceAllocation = {
            allocations: {} as Record<ResourceType, number>,
            distribution: {},
            estimatedCapacity: 0,
            reservedCapacity: 0,
            timestamp: Date.now()
        };

        // Find bottlenecks
        const bottlenecks = this.identifyBottlenecks(usage, data);

        // Calculate new distribution to resolve bottlenecks
        Object.entries(data.resources).forEach(([resourceType, metrics]) => {
            const typedResourceType = resourceType as ResourceType;
            const isBottleneck = bottlenecks.some(b => b.type === resourceType);

            // Reduce allocation for non-bottlenecked resources if they're over-allocated
            if (!isBottleneck && usage[typedResourceType] > 70) {
                // Reduce to 70% if currently higher
                newAllocation.allocations[typedResourceType] =
                    (metrics.total * 0.7);
            }
            // Increase allocation for bottlenecked resources
            else if (isBottleneck) {
                // Find bottleneck severity
                const bottleneck = bottlenecks.find(b => b.type === resourceType);
                let allocationRatio = 0.9; // Default to 90% allocation

                if (bottleneck && bottleneck.severity > 80) {
                    allocationRatio = 0.95; // Increase to 95% for severe bottlenecks
                }

                newAllocation.allocations[typedResourceType] =
                    (metrics.total * allocationRatio);
            }
            // Maintain current allocation if within acceptable range
            else {
                newAllocation.allocations[typedResourceType] =
                    allocation.allocations[typedResourceType];
            }

            // Calculate new distribution percentage
            newAllocation.distribution[resourceType] =
                (newAllocation.allocations[typedResourceType] / metrics.total) * 100;
        });

        // Calculate estimated capacity with new allocation
        newAllocation.estimatedCapacity = this.calculateEstimatedCapacityFromAllocation(newAllocation, data);

        // Reserve capacity for spikes - more if highly variable workload
        const variabilityFactor = this.calculateWorkloadVariability(data);
        newAllocation.reservedCapacity = newAllocation.estimatedCapacity *
            (0.1 + (variabilityFactor * 0.1)); // 10-20% based on variability

        return newAllocation;
    }

    /**
     * Calculates workload variability factor (0-1)
     * @param data Resource data
     * @returns Variability factor
     */
    private calculateWorkloadVariability(data: ResourceData): number {
        // Simple implementation - could be more sophisticated with historical data
        let variabilitySum = 0;
        let resourceCount = 0;

        Object.values(data.resources).forEach(metrics => {
            if (metrics.peakLoad > 0 && metrics.averageLoad > 0) {
                const variability = (metrics.peakLoad - metrics.averageLoad) / metrics.peakLoad;
                variabilitySum += variability;
                resourceCount++;
            }
        });

        return resourceCount > 0 ?
            Math.min(1, Math.max(0, variabilitySum / resourceCount)) : 0.5;
    }

    /**
     * Calculates estimated capacity from allocation
     * @param allocation Resource allocation
     * @param data Resource data
     * @returns Estimated capacity score
     */
    private calculateEstimatedCapacityFromAllocation(
        allocation: ResourceAllocation,
        data: ResourceData
    ): number {
        // Calculate weighted capacity based on allocation
        const weights: Record<ResourceType, number> = {
            'cpu': 0.4,
            'memory': 0.3,
            'network': 0.15,
            'storage': 0.1,
            'gpu': 0.05
        };

        let capacityScore = 0;

        Object.entries(data.resources).forEach(([resourceType, metrics]) => {
            const typedResourceType = resourceType as ResourceType;
            const resourceWeight = weights[typedResourceType] || 0.1;
            const allocatedAmount = allocation.allocations[typedResourceType] || 0;
            const resourceCapacity = (1 - (allocatedAmount / metrics.total)) * 100;
            capacityScore += resourceCapacity * resourceWeight;
        });

        return Math.max(0, Math.min(100, capacityScore));
    }

    /**
     * Identifies bottlenecks in resource usage
     * @param usage Resource usage percentages
     * @param data Resource data
     * @returns Array of bottlenecks
     */
    private identifyBottlenecks(
        usage: Record<ResourceType, number>,
        data: ResourceData
    ): Bottleneck[] {
        const bottlenecks: Bottleneck[] = [];

        Object.entries(usage).forEach(([resourceType, usagePercentage]) => {
            const typedResourceType = resourceType as ResourceType;
            const metrics = data.resources[typedResourceType];

            // Define bottleneck thresholds
            const highUsageThreshold = 85;
            const criticalUsageThreshold = 95;

            if (usagePercentage >= highUsageThreshold) {
                const severity = usagePercentage >= criticalUsageThreshold ?
                    100 :
                    ((usagePercentage - highUsageThreshold) /
                        (criticalUsageThreshold - highUsageThreshold)) * 80 + 20;

                const bottleneckMetrics: BottleneckMetrics = {
                    currentValue: usagePercentage,
                    threshold: highUsageThreshold,
                    duration: 0, // Would need historical data
                    frequency: 0 // Would need historical data
                };

                // Impact assessment based on resource type and severity
                const impact = this.calculateResourceImpact(
                    typedResourceType,
                    severity,
                    metrics
                );

                bottlenecks.push({
                    type: resourceType as BottleneckType,
                    severity,
                    metrics: bottleneckMetrics,
                    impact,
                    recommendations: this.generateRecommendations(typedResourceType, severity)
                });
            }
        });

        return bottlenecks;
    }

    /**
     * Calculates impact of resource bottleneck
     * @param resourceType Type of resource
     * @param severity Severity of bottleneck
     * @param metrics Resource metrics
     * @returns Impact assessment
     */
    private calculateResourceImpact(
        resourceType: ResourceType,
        severity: number,
        metrics: ResourceMetrics
    ): ImpactAssessment {
        // Define impact weights by resource type
        const impactWeights: Record<ResourceType, {
            performance: number;
            userExperience: number;
            reliability: number;
            cost: number;
        }> = {
            'cpu': { performance: 0.9, userExperience: 0.7, reliability: 0.5, cost: 0.3 },
            'memory': { performance: 0.7, userExperience: 0.5, reliability: 0.8, cost: 0.4 },
            'network': { performance: 0.6, userExperience: 0.9, reliability: 0.4, cost: 0.2 },
            'storage': { performance: 0.4, userExperience: 0.3, reliability: 0.7, cost: 0.5 },
            'gpu': { performance: 0.8, userExperience: 0.6, reliability: 0.3, cost: 0.7 }
        };

        const weights = impactWeights[resourceType] ||
            { performance: 0.5, userExperience: 0.5, reliability: 0.5, cost: 0.5 };

        // Calculate impact based on severity and weights
        const impactFactor = severity / 100;

        return {
            systemPerformance: Math.min(100, weights.performance * impactFactor * 100),
            userExperience: Math.min(100, weights.userExperience * impactFactor * 100),
            reliability: Math.min(100, weights.reliability * impactFactor * 100),
            cost: Math.min(100, weights.cost * impactFactor * 100)
        };
    }

    /**
     * Generates recommendations for bottleneck mitigation
     * @param resourceType Type of resource
     * @param severity Severity of bottleneck
     * @returns Array of recommendation strings
     */
    private generateRecommendations(
        resourceType: ResourceType,
        severity: number
    ): string[] {
        const recommendations: string[] = [];

        // Generic recommendations based on resource type
        switch (resourceType) {
            case 'cpu':
                recommendations.push('Consider scaling CPU resources horizontally');
                if (severity > 80) {
                    recommendations.push('Optimize compute-intensive operations');
                    recommendations.push('Implement request throttling during peak loads');
                }
                break;
            case 'memory':
                recommendations.push('Analyze memory usage patterns for optimization');
                if (severity > 80) {
                    recommendations.push('Check for memory leaks in long-running processes');
                    recommendations.push('Consider implementing data compression');
                }
                break;
            case 'network':
                recommendations.push('Implement request batching to reduce network overhead');
                if (severity > 80) {
                    recommendations.push('Consider CDN for static content delivery');
                    recommendations.push('Optimize payload size in API responses');
                }
                break;
            case 'storage':
                recommendations.push('Review data retention policies');
                if (severity > 80) {
                    recommendations.push('Implement tiered storage strategy');
                    recommendations.push('Optimize database queries and indexes');
                }
                break;
            case 'gpu':
                recommendations.push('Prioritize GPU workloads based on business impact');
                if (severity > 80) {
                    recommendations.push('Consider model quantization to reduce GPU memory usage');
                    recommendations.push('Implement batch processing for inference tasks');
                }
                break;
        }

        // Add general recommendations for any resource type
        if (severity > 90) {
            recommendations.push('Urgent: Consider immediate vertical scaling');
            recommendations.push('Implement circuit breaker to prevent system failure');
        }

        return recommendations;
    }

    /**
     * Validates resource allocation to ensure it meets constraints
     * @param allocation Proposed resource allocation
     * @param data Resource data
     * @returns Validated and potentially adjusted allocation
     */
    private validateAllocation(
        allocation: ResourceAllocation,
        data: ResourceData
    ): ResourceAllocation {
        const validatedAllocation = { ...allocation };

        // Ensure allocations don't exceed total resources
        Object.entries(allocation.allocations).forEach(([resourceType, amount]) => {
            const typedResourceType = resourceType as ResourceType;
            const totalResource = data.resources[typedResourceType]?.total || 0;

            if (amount > totalResource) {
                // Cap at total available
                validatedAllocation.allocations[typedResourceType] = totalResource;
                validatedAllocation.distribution[resourceType] = 100;
            }
        });

        // Ensure minimum allocation for critical resources
        Object.entries(data.resources).forEach(([resourceType, metrics]) => {
            const typedResourceType = resourceType as ResourceType;
            const minAllocation = metrics.total * 0.1; // Minimum 10% allocation

            if (!validatedAllocation.allocations[typedResourceType] ||
                validatedAllocation.allocations[typedResourceType] < minAllocation) {
                validatedAllocation.allocations[typedResourceType] = minAllocation;
                validatedAllocation.distribution[resourceType] = 10;
            }
        });

        return validatedAllocation;
    }

    /**
     * Generates optimization actions based on allocation differences
     * @param currentAllocation Current resource allocation
     * @param newAllocation Proposed resource allocation
     * @returns Array of optimization actions
     */
    private generateBalancingActions(
        currentAllocation: ResourceAllocation,
        newAllocation: ResourceAllocation
    ): OptimizationAction[] {
        const actions: OptimizationAction[] = [];

        // Compare allocations and create actions for significant changes
        Object.entries(newAllocation.allocations).forEach(([resourceType, newAmount]) => {
            const typedResourceType = resourceType as ResourceType;
            const currentAmount = currentAllocation.allocations[typedResourceType] || 0;
            const difference = newAmount - currentAmount;
            const percentChange = currentAmount > 0 ?
                (Math.abs(difference) / currentAmount) * 100 : 100;

            // Only generate actions for significant changes (>5%)
            if (percentChange >= 5) {
                const actionType = difference > 0 ?
                    OptimizationActionType.SCALE_UP :
                    OptimizationActionType.SCALE_DOWN;

                // Determine priority based on percentage change
                let priority: OptimizationPriority = 3;
                if (percentChange > 50) priority = 5;
                else if (percentChange > 25) priority = 4;
                else if (percentChange < 10) priority = 2;

                // Calculate impact based on resource type and change magnitude
                const impactMultiplier = percentChange / 100;
                const impact: ImpactAssessment = {
                    systemPerformance: Math.min(100, 50 * impactMultiplier),
                    userExperience: Math.min(100, 40 * impactMultiplier),
                    reliability: Math.min(100, 60 * impactMultiplier),
                    cost: actionType === OptimizationActionType.SCALE_UP ?
                        Math.min(100, 70 * impactMultiplier) :
                        -Math.min(100, 70 * impactMultiplier) // Cost savings for scale down
                };

                actions.push({
                    type: actionType,
                    target: typedResourceType,
                    amount: Math.abs(difference),
                    priority,
                    estimatedImpact: impact
                });
            }
        });

        // Add resource redistribution actions if needed
        if (this.needsRedistribution(currentAllocation, newAllocation)) {
            actions.push({
                type: OptimizationActionType.REDISTRIBUTE,
                target: 'all',
                amount: 0, // Will be determined by the executor
                priority: 2,
                estimatedImpact: {
                    systemPerformance: 30,
                    userExperience: 20,
                    reliability: 35,
                    cost: 15
                }
            });
        }

        return actions;
    }

    /**
     * Determines if resource redistribution is needed
     * @param currentAllocation Current resource allocation
     * @param newAllocation Proposed resource allocation
     * @returns True if redistribution is needed
     */
    private needsRedistribution(
        currentAllocation: ResourceAllocation,
        newAllocation: ResourceAllocation
    ): boolean {
        // Check for imbalance in resource distribution
        const currentImbalance = this.calculateImbalance(currentAllocation);
        const newImbalance = this.calculateImbalance(newAllocation);

        // Redistribution if new allocation improves balance by at least 10%
        return (currentImbalance - newImbalance) >= 10;
    }

    /**
     * Calculates imbalance score for allocation
     * @param allocation Resource allocation
     * @returns Imbalance score (0-100, lower is better)
     */
    private calculateImbalance(allocation: ResourceAllocation): number {
        const distributions = Object.values(allocation.distribution);
        if (distributions.length <= 1) return 0;

        // Calculate standard deviation of distribution
        const average = distributions.reduce((sum, val) => sum + val, 0) / distributions.length;
        const squaredDiffs = distributions.map(val => Math.pow(val - average, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / distributions.length;
        const stdDev = Math.sqrt(variance);

        // Normalize to 0-100 scale (0 = perfectly balanced)
        return Math.min(100, stdDev * 2);
    }

    /**
     * Calculates optimization metrics based on allocations
     * @param newAllocation Proposed resource allocation
     * @param currentAllocation Current resource allocation
     * @returns Optimization metrics
     */
    private calculateBalancingMetrics(
        newAllocation: ResourceAllocation,
        currentAllocation: ResourceAllocation
    ): OptimizationMetrics {
        // Calculate resource efficiency improvement
        const currentEfficiency = this.calculateResourceEfficiency(currentAllocation);
        const newEfficiency = this.calculateResourceEfficiency(newAllocation);
        const efficiencyImprovement = newEfficiency - currentEfficiency;

        // Calculate resource balance improvement
        const currentBalance = 100 - this.calculateImbalance(currentAllocation);
        const newBalance = 100 - this.calculateImbalance(newAllocation);

        // Estimate latency reduction (simplified)
        const estimatedLatencyReduction = efficiencyImprovement > 0 ?
            Math.min(200, efficiencyImprovement * 5) : 0;

        // Calculate cost savings (simplified)
        const costSavings = this.estimateCostSavings(currentAllocation, newAllocation);

        return {
            improvementPercentage: Math.max(0, efficiencyImprovement),
            resourceEfficiency: newEfficiency,
            estimatedLatencyReduction,
            estimatedCostSavings: costSavings,
            consistencyScore: 85, // Placeholder - would need historical data
            balanceScore: newBalance,
            sustainability: this.calculateSustainabilityScore(newAllocation)
        };
    }

    /**
     * Calculates overall resource efficiency score
     * @param allocation Resource allocation
     * @returns Efficiency score (0-100)
     */
    private calculateResourceEfficiency(allocation: ResourceAllocation): number {
        // Calculate average utilization
        const distributions = Object.values(allocation.distribution);
        if (distributions.length === 0) return 0;

        const avgUtilization = distributions.reduce((sum, val) => sum + val, 0) / distributions.length;

        // Ideal utilization range is 60-80%
        // Lower score for under or over utilization
        let efficiencyScore: number;

        if (avgUtilization < 60) {
            // Under-utilization: linear scale from 0-60%
            efficiencyScore = (avgUtilization / 60) * 80;
        } else if (avgUtilization <= 80) {
            // Optimal range: 80-100 score
            efficiencyScore = 80 + ((avgUtilization - 60) / 20) * 20;
        } else {
            // Over-utilization: decreasing score from 80% to 100%
            efficiencyScore = 100 - ((avgUtilization - 80) / 20) * 80;
        }

        return Math.max(0, Math.min(100, efficiencyScore));
    }

    /**
     * Estimates cost savings from optimization
     * @param currentAllocation Current resource allocation
     * @param newAllocation New resource allocation
     * @returns Estimated cost savings
     */
    private estimateCostSavings(
        currentAllocation: ResourceAllocation,
        newAllocation: ResourceAllocation
    ): number {
        // Simplified cost model - assumes linear cost based on resource allocation
        const resourceCosts: Record<ResourceType, number> = {
            'cpu': 1.0,
            'memory': 0.5,
            'network': 0.3,
            'storage': 0.2,
            'gpu': 3.0
        };

        let currentCost = 0;
        let newCost = 0;

        Object.entries(currentAllocation.allocations).forEach(([resourceType, amount]) => {
            const typedResourceType = resourceType as ResourceType;
            const unitCost = resourceCosts[typedResourceType] || 1.0;
            currentCost += amount * unitCost;
        });

        Object.entries(newAllocation.allocations).forEach(([resourceType, amount]) => {
            const typedResourceType = resourceType as ResourceType;
            const unitCost = resourceCosts[typedResourceType] || 1.0;
            newCost += amount * unitCost;
        });

        // Calculate savings (positive value indicates savings)
        return Math.max(0, currentCost - newCost);
    }

    /**
     * Calculates sustainability score for resource allocation
     * @param allocation Resource allocation
     * @returns Sustainability score (0-100)
     */
    private calculateSustainabilityScore(allocation: ResourceAllocation): number {
        // Calculate resource utilization efficiency
        const distributions = Object.values(allocation.distribution);
        if (distributions.length === 0) return 0;

        const avgUtilization = distributions.reduce((sum, val) => sum + val, 0) / distributions.length;

        // Resource efficiency contributes to sustainability
        // Optimal utilization is around 80% (neither wasteful nor overutilized)
        const utilizationScore = 100 - Math.abs(avgUtilization - 80) * 1.25;

        // Consider resource distribution (more balanced is generally more sustainable)
        const balanceScore = 100 - this.calculateImbalance(allocation);

        // Final sustainability score is weighted average
        return Math.max(0, Math.min(100, utilizationScore * 0.7 + balanceScore * 0.3));
    }

    /**
     * Generates warning messages based on allocation
     * @param data Resource data
     * @param allocation Proposed resource allocation
     * @returns Array of warning messages
     */
    private generateWarnings(
        data: ResourceData,
        allocation: ResourceAllocation
    ): string[] {
        const warnings: string[] = [];

        // Check for high resource utilization
        Object.entries(allocation.distribution).forEach(([resourceType, percentage]) => {
            if (percentage > 90) {
                warnings.push(`Warning: ${resourceType} resource is allocated at ${percentage.toFixed(1)}%, which may impact system stability.`);
            }
        });

        // Check for low reserved capacity
        if (allocation.reservedCapacity < 10) {
            warnings.push('Warning: Low reserved capacity may lead to performance issues during traffic spikes.');
        }

        // Check for imbalance
        const imbalance = this.calculateImbalance(allocation);
        if (imbalance > 30) {
            warnings.push('Warning: Resource allocation remains significantly imbalanced.');
        }

        // Check for high load relative to capacity
        if (data.currentLoad > allocation.estimatedCapacity * 0.9) {
            warnings.push('Warning: Current load is approaching estimated capacity.');
        }

        return warnings;
    }
}