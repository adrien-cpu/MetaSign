// src/ai/api/resilience/core/ResourceOptimizer.ts

import { SystemMetrics } from '../types/ResilienceTypes';
import {
    OptimizationStrategy,
    Bottleneck,
    PerformanceMonitor
} from '../types/OptimizationTypes';

export class ResourceOptimizer {
    private optimizationStrategies: Map<string, OptimizationStrategy>;
    private performanceMonitor: PerformanceMonitor;

    constructor(performanceMonitor: PerformanceMonitor) {
        this.optimizationStrategies = new Map();
        this.performanceMonitor = performanceMonitor;
    }

    async optimize(metrics: SystemMetrics): Promise<void> {
        const bottlenecks = await this.identifyBottlenecks(metrics);
        const optimizations = await this.planOptimizations(bottlenecks);
        await this.applyOptimizations(optimizations);
    }

    private async identifyBottlenecks(metrics: SystemMetrics): Promise<Bottleneck[]> {
        const analysis = await this.performanceMonitor.analyzePerformance(metrics);
        return analysis.bottlenecks;
    }

    private async planOptimizations(bottlenecks: Bottleneck[]): Promise<OptimizationStrategy[]> {
        const currentMetrics = await this.performanceMonitor.getCurrentMetrics();
        const strategies: OptimizationStrategy[] = [];

        for (const bottleneck of bottlenecks) {
            const strategy = this.selectOptimizationStrategy(bottleneck, currentMetrics);
            if (strategy) {
                strategies.push(strategy);
            }
        }

        return this.prioritizeStrategies(strategies);
    }

    private async applyOptimizations(strategies: OptimizationStrategy[]): Promise<void> {
        for (const strategy of strategies) {
            const currentMetrics = await this.performanceMonitor.getCurrentMetrics();

            try {
                const success = await strategy.apply(currentMetrics);
                if (!success) {
                    await strategy.rollback();
                }
            } catch (error) {
                await strategy.rollback();
                throw error;
            }
        }
    }

    private selectOptimizationStrategy(
        bottleneck: Bottleneck,
        metrics: SystemMetrics
    ): OptimizationStrategy | null {
        // Sélectionner la meilleure stratégie pour ce bottleneck
        const applicableStrategies = Array.from(this.optimizationStrategies.values())
            .filter(strategy => this.isStrategyApplicable(strategy, bottleneck, metrics));

        return applicableStrategies.length > 0
            ? applicableStrategies[0]
            : null;
    }

    private isStrategyApplicable(
        strategy: OptimizationStrategy,
        bottleneck: Bottleneck,
        _metrics: SystemMetrics  // Préfixé avec un underscore
    ): boolean {
        // Vérifier si la stratégie est applicable au bottleneck
        return strategy.priority >= bottleneck.severity;
    }

    private prioritizeStrategies(strategies: OptimizationStrategy[]): OptimizationStrategy[] {
        // Trier les stratégies par priorité
        return strategies.sort((a, b) => b.priority - a.priority);
    }

    // Méthodes pour la gestion des stratégies
    registerStrategy(strategy: OptimizationStrategy): void {
        this.optimizationStrategies.set(strategy.name, strategy);
    }

    unregisterStrategy(name: string): void {
        this.optimizationStrategies.delete(name);
    }

    getStrategy(name: string): OptimizationStrategy | undefined {
        return this.optimizationStrategies.get(name);
    }
}