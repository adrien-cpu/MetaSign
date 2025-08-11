/**
 * src/ai/api/distributed/monitoring/optimization/LoadAnalyzer.ts
 * Classe d'analyse de charge pour le système distribué
 */
import { Logger } from '@/ai/api/common/monitoring/LogService';
import {
    LoadAnalysis,
    LoadTrend,
    NodeLoad,
    Hotspot,
    Node,
    ResourceType
} from './types';
import { NodeManager } from './NodeManager';

/**
 * Configuration des seuils pour les points chauds
 */
interface HotspotThresholds {
    cpu: number;
    memory: number;
    network: number;
}

/**
 * Configuration des poids pour le calcul de la charge système
 */
interface LoadWeights {
    cpu: number;
    memory: number;
    network: number;
}

/**
 * Analyse la charge du système distribué
 */
export class LoadAnalyzer {
    private readonly logger: Logger;
    private readonly nodeManager: NodeManager;
    private readonly hotspotThresholds: HotspotThresholds;
    private readonly loadWeights: LoadWeights;

    /**
     * Crée une nouvelle instance de l'analyseur de charge
     * @param nodeManager Gestionnaire de nœuds à utiliser pour l'analyse
     */
    constructor(
        nodeManager: NodeManager,
        hotspotThresholds?: Partial<HotspotThresholds>,
        loadWeights?: Partial<LoadWeights>
    ) {
        this.logger = new Logger('LoadAnalyzer');
        this.nodeManager = nodeManager;

        // Configuration par défaut des seuils pour les points chauds
        this.hotspotThresholds = {
            cpu: 0.85,
            memory: 0.9,
            network: 0.8,
            ...hotspotThresholds
        };

        // Configuration par défaut des poids pour le calcul de la charge
        this.loadWeights = {
            cpu: 0.6,
            memory: 0.3,
            network: 0.1,
            ...loadWeights
        };
    }

    /**
     * Analyse la charge actuelle de tous les nœuds du système
     * @returns Analyse détaillée de la charge du système
     */
    public async analyzeLoad(): Promise<LoadAnalysis> {
        this.logger.debug('Analyzing system load...');

        // Récupérer tous les nœuds en ligne
        const nodes = await this.nodeManager.getNodesByStatus('online');

        if (nodes.length === 0) {
            this.logger.warn('No online nodes found for load analysis');
            return this.createEmptyLoadAnalysis();
        }

        // Dans une implémentation réelle, on collecterait des métriques
        // de tous les nœuds et on calculerait les statistiques

        // Collection des charges par nœud
        const nodeLoads = this.collectNodeLoads(nodes);

        // Détection des points chauds
        const hotspots = this.detectHotspots(nodeLoads);

        // Calcul de la charge système globale et du déséquilibre
        const systemLoad = this.calculateSystemLoad(nodeLoads);
        const imbalance = this.calculateImbalance(nodeLoads);

        // Génération de recommandations basées sur l'analyse
        const recommendations = this.generateRecommendations(
            systemLoad,
            imbalance,
            nodeLoads,
            hotspots
        );

        this.logger.info(`System load analysis completed: ${systemLoad.toFixed(2)} load, ${imbalance.toFixed(2)} imbalance, ${hotspots.length} hotspots`);

        return {
            systemLoad,
            nodeLoads,
            hotspots,
            imbalance,
            recommendations
        };
    }

    /**
     * Prédit l'évolution de la charge pour une période donnée
     * @param timeFrameMinutes Horizon temporel en minutes
     * @returns Tendance prédite pour la charge
     */
    public async predictLoadTrend(timeFrameMinutes: number): Promise<LoadTrend> {
        this.logger.debug(`Predicting load trend for next ${timeFrameMinutes} minutes`);

        // Récupérer l'analyse de charge actuelle
        const currentLoad = await this.analyzeLoad();

        // Dans une implémentation réelle, on utiliserait des algorithmes de prédiction
        // basés sur l'historique de charge et des modèles de tendance

        // Simulation simple : prédiction d'augmentation si charge actuelle > 0.6
        const predictedSystemLoad = Math.min(
            currentLoad.systemLoad * (1 + (Math.random() * 0.2)),
            1.0
        );

        const topNodeLoad = Math.min(
            this.findMaxNodeLoad(currentLoad.nodeLoads) * (1 + (Math.random() * 0.15)),
            1.0
        );

        // Détermination de la tendance
        const trend = this.determineTrend(currentLoad.systemLoad, predictedSystemLoad);

        // Calcul de la confiance (plus élevée pour des horizons courts)
        const confidence = Math.max(0.4, 1.0 - (timeFrameMinutes / 120));

        this.logger.info(`Load trend prediction: ${trend} over next ${timeFrameMinutes} minutes (${confidence.toFixed(2)} confidence)`);

        return {
            predicted: {
                systemLoad: predictedSystemLoad,
                topNodeLoad: topNodeLoad
            },
            confidence,
            trend,
            timeFrame: timeFrameMinutes
        };
    }

    /**
     * Crée une analyse de charge vide en cas d'absence de nœuds
     * @returns Analyse de charge par défaut
     */
    private createEmptyLoadAnalysis(): LoadAnalysis {
        return {
            systemLoad: 0,
            nodeLoads: [],
            hotspots: [],
            imbalance: 0,
            recommendations: ['Add nodes to the system']
        };
    }

    /**
     * Collecte les informations de charge pour chaque nœud
     * @param nodes Liste des nœuds à analyser
     * @returns Charges des nœuds
     */
    private collectNodeLoads(nodes: Node[]): NodeLoad[] {
        return nodes.map(node => {
            // Simulation de métriques pour l'exemple
            // Dans une implémentation réelle, ces données viendraient de métriques système
            const cpuLoad = Math.random() * 0.8 + 0.1; // 10-90%
            const memoryLoad = Math.random() * 0.7 + 0.2; // 20-90%
            const networkLoad = Math.random() * 0.6 + 0.1; // 10-70%

            return {
                nodeId: node.id,
                cpuLoad,
                memoryLoad,
                networkLoad
            };
        });
    }

    /**
     * Détecte les points chauds dans le système
     * @param nodeLoads Charges des nœuds
     * @returns Liste des points chauds détectés
     */
    private detectHotspots(nodeLoads: NodeLoad[]): Hotspot[] {
        const hotspots: Hotspot[] = [];

        for (const node of nodeLoads) {
            if (node.cpuLoad > this.hotspotThresholds.cpu) {
                hotspots.push({
                    nodeId: node.nodeId,
                    resourceType: 'cpu' as ResourceType,
                    severity: node.cpuLoad
                });
            }

            if (node.memoryLoad > this.hotspotThresholds.memory) {
                hotspots.push({
                    nodeId: node.nodeId,
                    resourceType: 'memory' as ResourceType,
                    severity: node.memoryLoad
                });
            }

            if (node.networkLoad > this.hotspotThresholds.network) {
                hotspots.push({
                    nodeId: node.nodeId,
                    resourceType: 'network' as ResourceType,
                    severity: node.networkLoad
                });
            }
        }

        return hotspots;
    }

    /**
     * Calcule la charge globale du système
     * @param nodeLoads Charges des nœuds
     * @returns Charge système globale (0-1)
     */
    private calculateSystemLoad(nodeLoads: NodeLoad[]): number {
        if (nodeLoads.length === 0) return 0;

        // Calcul de la moyenne pondérée
        let totalLoad = 0;

        for (const node of nodeLoads) {
            const nodeLoad = (
                node.cpuLoad * this.loadWeights.cpu +
                node.memoryLoad * this.loadWeights.memory +
                node.networkLoad * this.loadWeights.network
            );

            totalLoad += nodeLoad;
        }

        return totalLoad / nodeLoads.length;
    }

    /**
     * Calcule le niveau de déséquilibre entre les nœuds
     * @param nodeLoads Charges des nœuds
     * @returns Niveau de déséquilibre (0-1)
     */
    private calculateImbalance(nodeLoads: NodeLoad[]): number {
        if (nodeLoads.length <= 1) return 0;

        // Calcul des charges min et max pour chaque type
        let minCpu = 1, maxCpu = 0;
        let minMemory = 1, maxMemory = 0;

        for (const node of nodeLoads) {
            minCpu = Math.min(minCpu, node.cpuLoad);
            maxCpu = Math.max(maxCpu, node.cpuLoad);

            minMemory = Math.min(minMemory, node.memoryLoad);
            maxMemory = Math.max(maxMemory, node.memoryLoad);
        }

        // Calcul des écarts
        const cpuImbalance = maxCpu - minCpu;
        const memoryImbalance = maxMemory - minMemory;

        // Moyenne pondérée des déséquilibres
        return (cpuImbalance * 0.7) + (memoryImbalance * 0.3);
    }

    /**
     * Trouve la charge maximale parmi tous les nœuds
     * @param nodeLoads Charges des nœuds
     * @returns Charge maximale trouvée
     */
    private findMaxNodeLoad(nodeLoads: NodeLoad[]): number {
        if (nodeLoads.length === 0) return 0;

        let maxLoad = 0;

        for (const node of nodeLoads) {
            // On prend le maximum des différentes métriques
            const nodeMaxLoad = Math.max(
                node.cpuLoad,
                node.memoryLoad,
                node.networkLoad
            );

            maxLoad = Math.max(maxLoad, nodeMaxLoad);
        }

        return maxLoad;
    }

    /**
     * Détermine la tendance d'évolution entre deux valeurs
     * @param current Valeur actuelle
     * @param predicted Valeur prédite
     * @returns Direction de la tendance
     */
    private determineTrend(current: number, predicted: number): 'increasing' | 'decreasing' | 'stable' {
        const difference = predicted - current;

        if (Math.abs(difference) < 0.05) {
            return 'stable';
        }

        return difference > 0 ? 'increasing' : 'decreasing';
    }

    /**
     * Génère des recommandations basées sur l'analyse de charge
     * @param systemLoad Charge système globale
     * @param imbalance Niveau de déséquilibre
     * @param nodeLoads Charges des nœuds
     * @param hotspots Points chauds détectés
     * @returns Liste de recommandations
     */
    private generateRecommendations(
        systemLoad: number,
        imbalance: number,
        nodeLoads: NodeLoad[],
        hotspots: Hotspot[]
    ): string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur la charge système
        if (systemLoad > 0.8) {
            recommendations.push('Consider scaling out the system by adding more nodes');
        } else if (systemLoad < 0.3 && nodeLoads.length > 1) {
            recommendations.push('Consider scaling in to reduce unused resources');
        }

        // Recommandations basées sur le déséquilibre
        if (imbalance > 0.3) {
            recommendations.push('Rebalance workloads to improve resource utilization');
        }

        // Recommandations basées sur les points chauds
        if (hotspots.length > 0) {
            // Identifier les nœuds les moins chargés
            const sortedNodes = [...nodeLoads].sort((a, b) => a.cpuLoad - b.cpuLoad);
            const underutilizedNodes = sortedNodes
                .filter(node => node.cpuLoad < 0.4)
                .map(node => node.nodeId);

            for (const hotspot of hotspots) {
                if (underutilizedNodes.length > 0) {
                    recommendations.push(
                        `Migrate workloads from ${hotspot.nodeId} (${hotspot.resourceType}) to ${underutilizedNodes[0]}`
                    );
                } else {
                    recommendations.push(
                        `Scale up ${hotspot.resourceType} resources on ${hotspot.nodeId}`
                    );
                }
            }
        }

        return recommendations;
    }
}