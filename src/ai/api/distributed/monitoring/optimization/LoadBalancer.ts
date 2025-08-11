/**
 * src/ai/api/distributed/monitoring/optimization/LoadBalancer.ts
 * Équilibreur de charge pour optimiser la distribution des charges de travail
 */
import { Logger } from '@/ai/api/common/monitoring/LogService';
import {
    BalancingPlan,
    BalancingResult,
    LoadAnalysis,
    Migration,
    ScalingAction,
    SystemPerformanceMetrics
} from './types';
import { NodeManager } from './NodeManager';
import { LoadAnalyzer } from './LoadAnalyzer';

/**
 * Équilibreur de charge pour optimiser la distribution des charges de travail
 * dans un environnement distribué
 */
export class LoadBalancer {
    private readonly nodeManager: NodeManager;
    private readonly loadAnalyzer: LoadAnalyzer;
    private readonly logger: Logger;
    private balancingInProgress = false;

    /**
     * Crée un nouvel équilibreur de charge
     */
    constructor() {
        this.nodeManager = new NodeManager();
        this.loadAnalyzer = new LoadAnalyzer(this.nodeManager);
        this.logger = new Logger('LoadBalancer');
    }

    /**
     * Équilibre la charge à travers les nœuds
     * @returns Résultat de l'opération d'équilibrage
     */
    public async balance(): Promise<BalancingResult> {
        if (this.balancingInProgress) {
            this.logger.warn('Balancing operation already in progress, please wait');
            return {
                success: false,
                error: 'Balancing operation already in progress',
                migrations: [],
                scalingActions: [],
                metrics: {
                    beforeBalance: null,
                    afterBalance: null,
                    improvement: 0
                }
            };
        }

        this.balancingInProgress = true;
        this.logger.info('Starting load balancing operation');

        try {
            // Collecte des métriques avant équilibrage
            const beforeMetrics = await this.collectPerformanceMetrics();

            // Analyse de la charge actuelle
            const currentLoad = await this.loadAnalyzer.analyzeLoad();
            this.logger.debug('Current load analysis', {
                systemLoad: currentLoad.systemLoad,
                nodeCount: currentLoad.nodeLoads.length,
                imbalance: currentLoad.imbalance
            });

            // Création du plan d'équilibrage
            const balancingPlan = this.createBalancingPlan(currentLoad);
            this.logger.info(`Created balancing plan with priority ${balancingPlan.priority}`, {
                migrationCount: balancingPlan.migrations.length,
                scalingCount: balancingPlan.scaling.length
            });

            // Si le plan est vide, aucune action n'est nécessaire
            if (balancingPlan.migrations.length === 0 && balancingPlan.scaling.length === 0) {
                this.logger.info('No balancing actions required, system is optimized');
                this.balancingInProgress = false;
                return {
                    success: true,
                    migrations: [],
                    scalingActions: [],
                    metrics: {
                        beforeBalance: beforeMetrics,
                        afterBalance: beforeMetrics,
                        improvement: 0
                    }
                };
            }

            // Exécution du plan
            const result = await this.executeBalancing(balancingPlan, beforeMetrics);

            this.logger.info(`Balancing operation completed with success=${result.success}`, {
                migrationsExecuted: result.migrations.length,
                scalingActionsExecuted: result.scalingActions.length,
                improvement: result.metrics.improvement
            });

            return result;
        } catch (error) {
            this.logger.error('Load balancing failed', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                migrations: [],
                scalingActions: [],
                metrics: {
                    beforeBalance: null,
                    afterBalance: null,
                    improvement: 0
                }
            };
        } finally {
            this.balancingInProgress = false;
        }
    }

    /**
     * Crée un plan d'équilibrage basé sur l'analyse de charge
     * @param load Analyse de charge du système
     * @returns Plan d'équilibrage
     */
    private createBalancingPlan(load: LoadAnalysis): BalancingPlan {
        this.logger.debug('Creating balancing plan', { imbalance: load.imbalance });

        return {
            migrations: this.planMigrations(load),
            scaling: this.planScaling(load),
            priority: this.calculatePriority(load)
        };
    }

    /**
     * Exécute le plan d'équilibrage 
     * @param plan Plan d'équilibrage à exécuter
     * @param beforeMetrics Métriques avant équilibrage
     * @returns Résultat de l'opération d'équilibrage
     */
    private async executeBalancing(
        plan: BalancingPlan,
        beforeMetrics: SystemPerformanceMetrics
    ): Promise<BalancingResult> {
        this.logger.info(`Executing balancing plan with ${plan.migrations.length} migrations and ${plan.scaling.length} scaling actions`);

        // Vérifier l'état des nœuds avant d'exécuter les migrations
        const nodes = await this.nodeManager.getNodes();
        this.logger.debug(`Executing on ${nodes.length} available nodes`);

        // Exécuter les migrations
        const migrationsExecuted: Migration[] = [];
        for (const migration of plan.migrations) {
            try {
                // Vérifier que les nœuds source et cible existent
                const sourceNode = await this.nodeManager.getNode(migration.sourceNodeId);
                const targetNode = await this.nodeManager.getNode(migration.targetNodeId);

                if (!sourceNode || !targetNode) {
                    this.logger.warn(`Cannot execute migration: ${migration.workloadId} - Source or target node not found`);
                    continue;
                }

                if (sourceNode.status !== 'online' || targetNode.status !== 'online') {
                    this.logger.warn(`Cannot execute migration: ${migration.workloadId} - Source or target node not online`);
                    continue;
                }

                // Dans un système réel, nous exécuterions la migration ici
                this.logger.debug(`Executing migration: ${migration.workloadId} from ${migration.sourceNodeId} to ${migration.targetNodeId}`);

                // Simulation de migration réussie
                migrationsExecuted.push(migration);
            } catch (error) {
                this.logger.error(`Migration failed: ${migration.workloadId}`, error);
            }
        }

        // Exécuter les actions de scaling
        const scalingActionsExecuted: ScalingAction[] = [];
        for (const action of plan.scaling) {
            try {
                // Vérifier l'existence du nœud pour les actions de scaling vertical
                if (action.nodeId && action.actionType !== 'scaleOut') {
                    const node = await this.nodeManager.getNode(action.nodeId);
                    if (!node) {
                        this.logger.warn(`Cannot execute scaling action: ${action.actionType} - Node ${action.nodeId} not found`);
                        continue;
                    }
                }

                // Dans un système réel, nous exécuterions l'action de scaling ici
                this.logger.debug(`Executing scaling action: ${action.actionType} for ${action.nodeId || 'new node'}`);

                // Simulation d'action de scaling réussie
                scalingActionsExecuted.push(action);
            } catch (error) {
                this.logger.error(`Scaling action failed: ${action.actionType} for ${action.nodeId}`, error);
            }
        }

        // Collecte des métriques après équilibrage
        // Dans un système réel, il faudrait attendre que les changements prennent effet
        await new Promise(resolve => setTimeout(resolve, 2000));

        const afterMetrics = await this.collectPerformanceMetrics();

        // Calcul de l'amélioration
        const improvement = this.calculateImprovement(beforeMetrics, afterMetrics);

        return {
            success: true,
            migrations: migrationsExecuted,
            scalingActions: scalingActionsExecuted,
            metrics: {
                beforeBalance: beforeMetrics,
                afterBalance: afterMetrics,
                improvement
            }
        };
    }

    /**
     * Planifie les migrations de charges de travail
     * @param load Analyse de charge du système
     * @returns Migrations planifiées
     */
    private planMigrations(load: LoadAnalysis): Migration[] {
        const migrations: Migration[] = [];

        // Identifier les nœuds surchargés
        const overloadedNodes = load.nodeLoads
            .filter(node => node.cpuLoad > 0.8 || node.memoryLoad > 0.8)
            .map(node => node.nodeId);

        // Identifier les nœuds sous-utilisés
        const underutilizedNodes = load.nodeLoads
            .filter(node => node.cpuLoad < 0.3 && node.memoryLoad < 0.5)
            .map(node => node.nodeId);

        // Si nous avons des nœuds surchargés et sous-utilisés, planifier des migrations
        if (overloadedNodes.length > 0 && underutilizedNodes.length > 0) {
            // Simuler des migrations
            for (let i = 0; i < Math.min(overloadedNodes.length, 3); i++) {
                const sourceNodeId = overloadedNodes[i % overloadedNodes.length];
                const targetNodeId = underutilizedNodes[i % underutilizedNodes.length];

                migrations.push({
                    workloadId: `workload-${i + 1}`,
                    sourceNodeId,
                    targetNodeId,
                    priority: i === 0 ? 'high' : 'medium',
                    estimatedDowntime: Math.floor(Math.random() * 30) + 5 // 5-35 seconds
                });
            }
        }

        return migrations;
    }

    /**
     * Planifie les actions de scaling (ajout/suppression de nœuds)
     * @param load Analyse de charge du système
     * @returns Actions de scaling planifiées
     */
    private planScaling(load: LoadAnalysis): ScalingAction[] {
        const actions: ScalingAction[] = [];

        // Si la charge système est élevée, prévoir l'ajout de nœuds
        if (load.systemLoad > 0.8) {
            actions.push({
                actionType: 'scaleOut',
                nodeId: null, // Pas de nœud spécifique pour scale out
                priority: 'high',
                reason: 'High system load',
                resourceType: 'node',
                delta: 1 // Ajouter 1 nœud
            });
        }

        // Si nous avons un nœud avec une charge CPU élevée, scale up
        const highCpuNode = load.nodeLoads.find(node => node.cpuLoad > 0.9);
        if (highCpuNode) {
            actions.push({
                actionType: 'scaleUp',
                nodeId: highCpuNode.nodeId,
                priority: 'medium',
                reason: 'High CPU load',
                resourceType: 'cpu',
                delta: 2 // Ajouter 2 vCPUs
            });
        }

        // Gestion des points chauds spécifiques
        for (const hotspot of load.hotspots) {
            if (hotspot.resourceType === 'memory' && hotspot.severity > 0.85) {
                actions.push({
                    actionType: 'scaleUp',
                    nodeId: hotspot.nodeId,
                    priority: 'high',
                    reason: `Critical memory pressure (${(hotspot.severity * 100).toFixed(0)}%)`,
                    resourceType: 'memory',
                    delta: 4 // Ajouter 4 GB par exemple
                });
            }
        }

        // Si la charge système est faible, prévoir la suppression de nœuds
        if (load.systemLoad < 0.3 && load.nodeLoads.length > 2) {
            const underutilizedNodes = load.nodeLoads
                .filter(node => node.cpuLoad < 0.2 && node.memoryLoad < 0.3)
                .map(node => node.nodeId);

            if (underutilizedNodes.length > 0) {
                actions.push({
                    actionType: 'scaleIn',
                    nodeId: underutilizedNodes[0],
                    priority: 'low',
                    reason: 'Node underutilized',
                    resourceType: 'node',
                    delta: -1 // Supprimer 1 nœud
                });
            }
        }

        return actions;
    }

    /**
     * Calcule la priorité du plan d'équilibrage
     * @param load Analyse de charge du système
     * @returns Priorité (0-100)
     */
    private calculatePriority(load: LoadAnalysis): number {
        // Priorité basée sur le déséquilibre et la présence de points chauds
        let priority = load.imbalance * 100; // Base sur le déséquilibre (0-100)

        // Augmenter la priorité si des points chauds sont détectés
        if (load.hotspots.length > 0) {
            const maxSeverity = Math.max(...load.hotspots.map(h => h.severity));
            priority += maxSeverity * 50; // +0 à +50 selon la sévérité
        }

        // Augmenter la priorité si la charge système est très élevée
        if (load.systemLoad > 0.9) {
            priority += 30; // +30 pour charge système élevée
        }

        // Plafonner à 100
        return Math.min(Math.round(priority), 100);
    }

    /**
     * Collecte les métriques de performance actuelles
     * @returns Métriques de performance
     */
    private async collectPerformanceMetrics(): Promise<SystemPerformanceMetrics> {
        // Dans un système réel, nous collecterions des métriques réelles des nœuds
        // et calculerions des agrégats système

        // Simulation de métriques
        const nodes = await this.nodeManager.getNodes();
        const onlineNodesCount = nodes.filter(n => n.status === 'online').length;

        // Facteur basé sur le nombre de nœuds pour simuler une amélioration
        // avec plus de nœuds (dans une certaine limite)
        const scaleFactor = Math.min(1, onlineNodesCount * 0.1);

        return {
            avgCpuLoad: Math.random() * 0.5 + 0.3 - (scaleFactor * 0.1), // 30-80%, réduit avec plus de nœuds
            avgMemoryLoad: Math.random() * 0.4 + 0.3 - (scaleFactor * 0.1), // 30-70%, réduit avec plus de nœuds
            avgNetworkLoad: Math.random() * 0.3 + 0.2, // 20-50%
            responseTime: Math.random() * 150 + 50 - (scaleFactor * 50), // 50-200ms, réduit avec plus de nœuds
            throughput: Math.floor((Math.random() * 5000 + 1000) * (1 + scaleFactor)), // 1000-6000 req/s, augmente avec plus de nœuds
            errorRate: Math.random() * 0.02 * (1 - scaleFactor) // 0-2%, réduit avec plus de nœuds
        };
    }

    /**
     * Calcule l'amélioration de performance après équilibrage
     * @param before Métriques avant équilibrage
     * @param after Métriques après équilibrage
     * @returns Pourcentage d'amélioration
     */
    private calculateImprovement(before: SystemPerformanceMetrics | null, after: SystemPerformanceMetrics | null): number {
        if (!before || !after) return 0;

        // Facteurs d'importance pour chaque métrique
        const weights = {
            cpuLoad: 0.3,
            memoryLoad: 0.2,
            networkLoad: 0.1,
            responseTime: 0.25,
            throughput: 0.1,
            errorRate: 0.05
        };

        // Calculer les améliorations individuelles (en pourcentage)
        const cpuImprovement = Math.max(0, (before.avgCpuLoad - after.avgCpuLoad) / Math.max(0.01, before.avgCpuLoad));
        const memoryImprovement = Math.max(0, (before.avgMemoryLoad - after.avgMemoryLoad) / Math.max(0.01, before.avgMemoryLoad));
        const networkImprovement = Math.max(0, (before.avgNetworkLoad - after.avgNetworkLoad) / Math.max(0.01, before.avgNetworkLoad));
        const responseTimeImprovement = Math.max(0, (before.responseTime - after.responseTime) / Math.max(1, before.responseTime));
        const throughputImprovement = Math.max(0, (after.throughput - before.throughput) / Math.max(1, before.throughput));
        const errorRateImprovement = Math.max(0, (before.errorRate - after.errorRate) / Math.max(0.001, before.errorRate));

        // Calculer l'amélioration pondérée
        const weightedImprovement =
            cpuImprovement * weights.cpuLoad +
            memoryImprovement * weights.memoryLoad +
            networkImprovement * weights.networkLoad +
            responseTimeImprovement * weights.responseTime +
            throughputImprovement * weights.throughput +
            errorRateImprovement * weights.errorRate;

        // Convertir en pourcentage
        return Math.round(weightedImprovement * 100);
    }

    /**
     * Obtient le gestionnaire de nœuds interne
     * @returns Le gestionnaire de nœuds
     */
    public getNodeManager(): NodeManager {
        return this.nodeManager;
    }

    /**
     * Obtient l'analyseur de charge interne
     * @returns L'analyseur de charge
     */
    public getLoadAnalyzer(): LoadAnalyzer {
        return this.loadAnalyzer;
    }
}