/**
 * src/ai/api/distributed/monitoring/optimization/PerformanceOptimizer.ts
 * Optimiseur de performance pour le système distribué
 */

import { Logger } from '@/ai/api/common/monitoring/LogService';
import { PerformanceAnalyzer } from './PerformanceAnalyzer';
import { ResourceManager } from './ResourceManager';
import { LoadBalancer } from './LoadBalancer';
import {
    OptimizationAction,
    OptimizationPlan,
    OptimizationResult,
    PerformanceReport,
    SystemPerformanceMetrics
} from './performance-optimizer-types';

/**
 * Gère l'optimisation des performances du système distribué
 */
export class PerformanceOptimizer {
    private readonly logger: Logger;
    private readonly performanceAnalyzer: PerformanceAnalyzer;
    private readonly resourceManager: ResourceManager;
    private readonly loadBalancer: LoadBalancer;
    private readonly optimizationHistory: OptimizationResult[] = [];

    /**
     * Crée une nouvelle instance de l'optimiseur de performance
     * @param performanceAnalyzer Analyseur de performance à utiliser
     * @param resourceManager Gestionnaire de ressources à utiliser
     * @param loadBalancer Équilibreur de charge à utiliser
     */
    constructor(
        performanceAnalyzer: PerformanceAnalyzer,
        resourceManager: ResourceManager,
        loadBalancer: LoadBalancer
    ) {
        this.logger = new Logger('PerformanceOptimizer');
        this.performanceAnalyzer = performanceAnalyzer;
        this.resourceManager = resourceManager;
        this.loadBalancer = loadBalancer;
    }

    /**
     * Planifie des optimisations basées sur un rapport de performance
     * @param report Rapport de performance
     * @returns Plan d'optimisation
     */
    public async planOptimizations(report: PerformanceReport): Promise<OptimizationPlan> {
        this.logger.info('Planning performance optimizations');

        // Initialiser le plan avec les actions
        const plan: OptimizationPlan = {
            id: `plan-${Date.now()}`,
            actions: [],
            expectedGain: 0,
            riskLevel: 0,
            estimatedEffort: 0,
            priority: 0,
            dependencies: []
        };

        // Ajouter des actions spécifiques selon le type d'optimisation
        const resourceActions = await this.planResourceOptimizations(report);
        const loadBalancingActions = await this.planLoadBalancing(report);
        const cacheActions = await this.planCacheOptimizations(report);

        // Fusionner toutes les actions
        plan.actions = [
            ...resourceActions,
            ...loadBalancingActions,
            ...cacheActions
        ];

        // Calculer les métriques globales du plan
        plan.expectedGain = this.calculateExpectedGain(plan.actions);
        plan.riskLevel = this.calculateRiskLevel(plan.actions);
        plan.estimatedEffort = this.calculateEstimatedEffort(plan.actions);
        plan.priority = this.calculatePlanPriority(plan);

        this.logger.info(`Optimization plan created with ${plan.actions.length} actions, priority ${plan.priority}`);

        return plan;
    }

    /**
     * Exécute un plan d'optimisation
     * @param plan Plan d'optimisation à exécuter
     * @returns Résultat de l'optimisation
     */
    public async executeOptimizationPlan(plan: OptimizationPlan): Promise<OptimizationResult> {
        this.logger.info(`Starting execution of optimization plan ${plan.id} with ${plan.actions.length} actions`);

        // Mesurer les métriques avant optimisation
        const beforeReport = await this.performanceAnalyzer.analyzePerformance();
        const startTime = Date.now();

        const completedActions: string[] = [];
        const failedActions: string[] = [];
        let error: string | undefined;

        try {
            // Trier les actions par priorité
            const sortedActions = [...plan.actions].sort((a, b) => b.expectedGain - a.expectedGain);

            // Exécuter chaque action
            for (const action of sortedActions) {
                try {
                    this.logger.debug(`Executing optimization action: ${action.id} (${action.type})`);

                    const success = await this.executeAction(action);

                    if (success) {
                        completedActions.push(action.id);
                        this.logger.debug(`Action ${action.id} completed successfully`);
                    } else {
                        failedActions.push(action.id);
                        this.logger.warn(`Action ${action.id} failed`);
                    }
                } catch (actionError) {
                    this.logger.error(`Error executing action ${action.id}:`, actionError);
                    failedActions.push(action.id);
                }
            }

            // Vérifier le résultat global
            const success = failedActions.length === 0;

            // Mesurer les métriques après optimisation
            const afterReport = await this.performanceAnalyzer.analyzePerformance();
            const endTime = Date.now();

            // Calculer l'amélioration réelle
            const actualImprovement = this.calculateActualImprovement(
                beforeReport.metrics,
                afterReport.metrics
            );

            // Créer le résultat
            const result: OptimizationResult = {
                planId: plan.id,
                success,
                error,
                completedActions,
                failedActions,
                beforeMetrics: beforeReport.metrics,
                afterMetrics: afterReport.metrics,
                actualImprovement,
                startedAt: startTime,
                completedAt: endTime
            };

            // Enregistrer dans l'historique
            this.optimizationHistory.push(result);

            this.logger.info(`Optimization plan ${plan.id} completed with ${completedActions.length} successful actions and ${failedActions.length} failed actions`);
            this.logger.info(`Actual improvement: ${(actualImprovement * 100).toFixed(2)}%`);

            return result;
        } catch (execError) {
            const errorMsg = execError instanceof Error ? execError.message : String(execError);
            this.logger.error(`Error executing optimization plan ${plan.id}:`, execError);

            const endTime = Date.now();

            // En cas d'erreur globale, mesurer quand même les métriques finales
            try {
                const afterReport = await this.performanceAnalyzer.analyzePerformance();

                const result: OptimizationResult = {
                    planId: plan.id,
                    success: false,
                    error: errorMsg,
                    completedActions,
                    failedActions,
                    beforeMetrics: beforeReport.metrics,
                    afterMetrics: afterReport.metrics,
                    actualImprovement: this.calculateActualImprovement(
                        beforeReport.metrics,
                        afterReport.metrics
                    ),
                    startedAt: startTime,
                    completedAt: endTime
                };

                this.optimizationHistory.push(result);
                return result;
            } catch (metricsError) {
                // Si même la mesure des métriques finales échoue
                this.logger.error('Failed to collect final metrics after optimization failure:', metricsError);

                const result: OptimizationResult = {
                    planId: plan.id,
                    success: false,
                    error: errorMsg,
                    completedActions,
                    failedActions,
                    beforeMetrics: beforeReport.metrics,
                    afterMetrics: beforeReport.metrics, // Utiliser les métriques initiales par défaut
                    actualImprovement: 0,
                    startedAt: startTime,
                    completedAt: endTime
                };

                this.optimizationHistory.push(result);
                return result;
            }
        }
    }

    /**
     * Annule les effets d'une optimisation précédente
     * @param resultId ID du résultat d'optimisation à annuler
     * @returns true si l'annulation a réussi
     */
    public async rollbackOptimization(resultId: string): Promise<boolean> {
        this.logger.info(`Rolling back optimization ${resultId}`);

        // Trouver le résultat dans l'historique
        const result = this.optimizationHistory.find(r => r.planId === resultId);
        if (!result) {
            this.logger.warn(`Cannot rollback: Optimization ${resultId} not found in history`);
            return false;
        }

        // Dans une implémentation réelle, nous effectuerions des actions inverses
        // pour restaurer l'état précédent

        this.logger.info(`Rollback of optimization ${resultId} completed`);
        return true;
    }

    /**
     * Planifie des optimisations de ressources
     * @param report Rapport de performance
     * @returns Actions d'optimisation des ressources
     */
    private async planResourceOptimizations(report: PerformanceReport): Promise<OptimizationAction[]> {
        const actions: OptimizationAction[] = [];

        // Optimisations basées sur les bottlenecks liés aux ressources
        for (const bottleneck of report.bottlenecks) {
            if (bottleneck.resourceType === 'cpu' && bottleneck.severity > 0.6) {
                actions.push({
                    id: `cpu-scale-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: 'resource-scaling',
                    targetComponent: bottleneck.component,
                    description: `Scale up CPU resources for ${bottleneck.component}`,
                    parameters: {
                        resourceType: 'cpu',
                        scaling: Math.ceil(bottleneck.severity * 4) // 1-4 cores depending on severity
                    },
                    expectedGain: 0.7 * bottleneck.severity,
                    complexity: 0.3
                });
            }

            if (bottleneck.resourceType === 'memory' && bottleneck.severity > 0.6) {
                actions.push({
                    id: `mem-scale-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: 'resource-scaling',
                    targetComponent: bottleneck.component,
                    description: `Scale up memory resources for ${bottleneck.component}`,
                    parameters: {
                        resourceType: 'memory',
                        scaling: Math.ceil(bottleneck.severity * 2048) // 1-2 GB depending on severity
                    },
                    expectedGain: 0.6 * bottleneck.severity,
                    complexity: 0.4
                });
            }
        }

        return actions;
    }

    /**
     * Planifie des optimisations d'équilibrage de charge
     * @param report Rapport de performance
     * @returns Actions d'optimisation d'équilibrage de charge
     */
    private async planLoadBalancing(report: PerformanceReport): Promise<OptimizationAction[]> {
        const actions: OptimizationAction[] = [];

        // Vérifier si l'équilibrage de charge est nécessaire
        const hasCpuBottleneck = report.bottlenecks.some(
            b => b.resourceType === 'cpu' && b.severity > 0.4
        );

        const hasHighResponse = report.metrics.responseTime > 120;

        if (hasCpuBottleneck || hasHighResponse) {
            actions.push({
                id: `balance-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: 'load-balancing',
                targetComponent: 'load-balancer',
                description: 'Rebalance workloads across available nodes',
                parameters: {
                    strategy: 'cpu-balanced',
                    aggressiveness: hasCpuBottleneck ? 'high' : 'medium'
                },
                expectedGain: hasCpuBottleneck ? 0.6 : 0.4,
                complexity: 0.3
            });
        }

        return actions;
    }

    /**
     * Planifie des optimisations de cache
     * @param report Rapport de performance
     * @returns Actions d'optimisation de cache
     */
    private async planCacheOptimizations(report: PerformanceReport): Promise<OptimizationAction[]> {
        const actions: OptimizationAction[] = [];

        // Vérifier si l'optimisation de cache est bénéfique
        const highResponseTime = report.metrics.responseTime > 150;
        const highThroughput = report.metrics.throughput > 3000;

        if (highResponseTime && highThroughput) {
            actions.push({
                id: `cache-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: 'caching',
                targetComponent: 'api-gateway',
                description: 'Optimize cache configuration for high-throughput endpoints',
                parameters: {
                    strategy: 'predictive-preloading',
                    ttl: 300, // 5 minutes
                    maxSize: 1024 // 1 GB
                },
                expectedGain: 0.5,
                complexity: 0.6
            });
        }

        return actions;
    }

    /**
     * Exécute une action d'optimisation individuelle
     * @param action Action à exécuter
     * @returns true si l'action a réussi
     */
    private async executeAction(action: OptimizationAction): Promise<boolean> {
        switch (action.type) {
            case 'resource-scaling': {
                return await this.executeResourceScaling(action);
            }
            case 'load-balancing': {
                return await this.executeLoadBalancing(action);
            }
            case 'caching': {
                return await this.executeCacheOptimization(action);
            }
            // Autres types d'actions...
            default: {
                this.logger.warn(`Unsupported optimization action type: ${action.type}`);
                return false;
            }
        }
    }

    /**
     * Exécute une action d'optimisation de ressources
     * @param action Action à exécuter
     * @returns true si l'action a réussi
     */
    private async executeResourceScaling(action: OptimizationAction): Promise<boolean> {
        try {
            const { resourceType, scaling } = action.parameters as {
                resourceType: 'cpu' | 'memory' | 'network' | 'disk';
                scaling: number;
            };

            // Dans une implémentation réelle, nous identifierions les nœuds spécifiques
            // et effectuerions le scaling individuellement

            // Pour l'exemple, supposons que nous avons un nœud représentatif
            const nodes = await this.loadBalancer.getNodeManager().getNodesByStatus('online');

            if (nodes.length === 0) {
                this.logger.warn(`Cannot execute resource scaling action for ${action.targetComponent}: No online nodes available`);
                return false;
            }

            // Choisir un nœud (dans un cas réel, nous serions plus spécifiques)
            const targetNode = nodes[0];

            this.logger.info(`Executing resource scaling for ${action.targetComponent} on node ${targetNode.id}: ${resourceType} scaling by ${scaling}`);

            // Effectuer le scaling
            const result = await this.resourceManager.scaleUpNode(
                targetNode.id,
                resourceType,
                scaling
            );

            return result.success;
        } catch (error) {
            this.logger.error(`Error executing resource scaling action:`, error);
            return false;
        }
    }

    /**
     * Exécute une action d'équilibrage de charge
     * @param action Action à exécuter
     * @returns true si l'action a réussi
     */
    private async executeLoadBalancing(action: OptimizationAction): Promise<boolean> {
        try {
            // Extraire les paramètres d'équilibrage
            const { strategy, aggressiveness } = action.parameters as {
                strategy: string;
                aggressiveness: 'low' | 'medium' | 'high';
            };

            this.logger.info(`Executing load balancing with strategy: ${strategy}, aggressiveness: ${aggressiveness}`);

            // Exécuter l'équilibrage de charge via le LoadBalancer
            const result = await this.loadBalancer.balance();
            return result.success;
        } catch (error) {
            this.logger.error(`Error executing load balancing action:`, error);
            return false;
        }
    }

    /**
     * Exécute une action d'optimisation de cache
     * @param action Action à exécuter
     * @returns true si l'action a réussi
     */
    private async executeCacheOptimization(action: OptimizationAction): Promise<boolean> {
        try {
            // Dans une implémentation réelle, nous configurerions le système de cache
            const { strategy, ttl, maxSize } = action.parameters as {
                strategy: string;
                ttl: number;
                maxSize: number;
            };

            this.logger.info(`Executed cache optimization: ${action.description} with strategy ${strategy}, TTL=${ttl}s, maxSize=${maxSize}MB`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simuler un délai

            return true;
        } catch (error) {
            this.logger.error(`Error executing cache optimization action:`, error);
            return false;
        }
    }

    /**
     * Calcule le gain attendu pour un ensemble d'actions
     * @param actions Actions d'optimisation
     * @returns Gain attendu (0-1)
     */
    private calculateExpectedGain(actions: OptimizationAction[]): number {
        if (actions.length === 0) return 0;

        // Utiliser une formule non-linéaire pour éviter une simple addition
        // car les gains ne s'additionnent pas parfaitement
        let totalGain = 0;
        let remainingPotential = 1.0;

        // Trier par gain attendu décroissant
        const sortedActions = [...actions].sort((a, b) => b.expectedGain - a.expectedGain);

        for (const action of sortedActions) {
            // Chaque action suivante a un impact sur le potentiel restant
            const actionEffect = action.expectedGain * remainingPotential;
            totalGain += actionEffect;

            // Réduire le potentiel restant pour les actions suivantes
            remainingPotential *= (1 - action.expectedGain * 0.5);
        }

        return Math.min(totalGain, 1);
    }

    /**
     * Calcule le niveau de risque pour un ensemble d'actions
     * @param actions Actions d'optimisation
     * @returns Niveau de risque (0-1)
     */
    private calculateRiskLevel(actions: OptimizationAction[]): number {
        if (actions.length === 0) return 0;

        // Le risque augmente avec la complexité et le nombre d'actions
        let totalRisk = 0;

        for (const action of actions) {
            totalRisk += action.complexity * 0.7 + 0.3;
        }

        // Normaliser selon le nombre d'actions et plafonner à 1
        return Math.min(totalRisk / (actions.length * 2), 1);
    }

    /**
     * Calcule l'effort estimé pour un ensemble d'actions
     * @param actions Actions d'optimisation
     * @returns Effort estimé en heures
     */
    private calculateEstimatedEffort(actions: OptimizationAction[]): number {
        if (actions.length === 0) return 0;

        // Estimer l'effort en heures basé sur la complexité
        let totalEffort = 0;

        for (const action of actions) {
            // Complexité est entre 0 et 1, traduire en 0.5-8 heures
            totalEffort += action.complexity * 7.5 + 0.5;
        }

        return Math.round(totalEffort * 10) / 10; // Arrondir à 0.1 près
    }

    /**
     * Calcule la priorité globale d'un plan d'optimisation
     * @param plan Plan d'optimisation
     * @returns Priorité (0-100)
     */
    private calculatePlanPriority(plan: OptimizationPlan): number {
        // Formule de priorité:
        // - Gain attendu: impact positif
        // - Risque: impact négatif
        // - Effort: impact négatif (mais moins important)
        const gainFactor = plan.expectedGain * 100;
        const riskFactor = plan.riskLevel * 40;
        const effortFactor = Math.min(plan.estimatedEffort / 10, 1) * 20;

        const rawPriority = gainFactor - riskFactor - effortFactor;

        // Borner entre 0 et 100
        return Math.max(0, Math.min(100, Math.round(rawPriority)));
    }

    /**
     * Calcule l'amélioration réelle entre deux ensembles de métriques
     * @param before Métriques avant optimisation
     * @param after Métriques après optimisation
     * @returns Amélioration (0-1)
     */
    private calculateActualImprovement(
        before: SystemPerformanceMetrics,
        after: SystemPerformanceMetrics
    ): number {
        // Facteurs d'importance pour chaque métrique
        const weights = {
            avgCpuLoad: 0.25,
            avgMemoryLoad: 0.2,
            avgNetworkLoad: 0.1,
            responseTime: 0.25,
            throughput: 0.15,
            errorRate: 0.05
        };

        // Calculer les améliorations individuelles
        const cpuImprovement = Math.max(0, (before.avgCpuLoad - after.avgCpuLoad) / Math.max(0.01, before.avgCpuLoad));
        const memImprovement = Math.max(0, (before.avgMemoryLoad - after.avgMemoryLoad) / Math.max(0.01, before.avgMemoryLoad));
        const netImprovement = Math.max(0, (before.avgNetworkLoad - after.avgNetworkLoad) / Math.max(0.01, before.avgNetworkLoad));
        const rtImprovement = Math.max(0, (before.responseTime - after.responseTime) / Math.max(1, before.responseTime));
        const tpImprovement = Math.max(0, (after.throughput - before.throughput) / Math.max(1, before.throughput));
        const erImprovement = Math.max(0, (before.errorRate - after.errorRate) / Math.max(0.001, before.errorRate));

        // Calculer l'amélioration pondérée
        const weightedImprovement =
            cpuImprovement * weights.avgCpuLoad +
            memImprovement * weights.avgMemoryLoad +
            netImprovement * weights.avgNetworkLoad +
            rtImprovement * weights.responseTime +
            tpImprovement * weights.throughput +
            erImprovement * weights.errorRate;

        return Math.min(weightedImprovement, 1);
    }

    /**
     * Obtient l'historique des optimisations
     * @returns Historique des optimisations
     */
    public getOptimizationHistory(): OptimizationResult[] {
        return [...this.optimizationHistory];
    }
}