/**
 * PerformanceEvaluator.ts
 * 
 * Système d'évaluation des performances pour l'intelligence distribuée.
 * Surveille et analyse les métriques de performance des nœuds du réseau.
 */

import { IMetricsCollector } from '@metrics/interfaces/IMetricsCollector';
import { LogService } from '@monitoring/LogService';
import { NodeTrainingResult } from './../consensus/types/ConsensusTypes';
import { BenchmarkResult, NodeMetrics, PerformanceMetrics, ResourceUtilization } from './types/performance.types';

/**
 * Service responsable de l'exécution de tests de performance
 */
export interface IBenchmarkRunner {
    /**
     * Exécute une série de tests de performance sur un résultat d'entraînement
     * @param result Résultat d'entraînement à évaluer
     * @returns Résultats des tests de performance
     */
    run(result: NodeTrainingResult): Promise<BenchmarkResult>;

    /**
     * Exécute un benchmark spécifique
     * @param benchmarkName Nom du benchmark à exécuter
     * @param input Données d'entrée pour le benchmark
     * @returns Résultat du benchmark
     */
    runSpecific(benchmarkName: string, input: string | number | boolean | null | undefined): Promise<BenchmarkResult>;
}

/**
 * Classe qui évalue les performances des nœuds distribués
 */
export class PerformanceEvaluator {
    private readonly metricCollector: IMetricsCollector;
    private readonly benchmarkRunner: IBenchmarkRunner;
    private readonly logger: LogService;

    // Facteurs de pondération pour le score global
    private readonly weights = {
        computeEfficiency: 0.3,
        memoryUsage: 0.2,
        latency: 0.25,
        throughput: 0.25
    };

    /**
     * Crée un nouvel évaluateur de performance
     * @param metricCollector Collecteur de métriques pour récupérer les données
     * @param benchmarkRunner Runner de benchmarks pour les tests de performance
     * @param logger Service de journalisation
     */
    constructor(
        metricCollector: IMetricsCollector,
        benchmarkRunner: IBenchmarkRunner,
        logger = new LogService('PerformanceEvaluator')
    ) {
        this.metricCollector = metricCollector;
        this.benchmarkRunner = benchmarkRunner;
        this.logger = logger;
    }

    /**
     * Évalue les performances d'un nœud basé sur ses résultats d'entraînement
     * @param nodeId Identifiant du nœud
     * @param result Résultat d'entraînement du nœud
     * @returns Métriques de performance évaluées
     */
    async evaluatePerformance(nodeId: string, result: NodeTrainingResult): Promise<PerformanceMetrics> {
        this.logger.info('Starting performance evaluation', { nodeId });

        // Collecter les métriques du nœud
        const metricsTimerId = this.metricCollector.startTimer('collect_node_metrics');
        const metrics = await this.collectNodeMetrics(nodeId);
        this.metricCollector.stopTimer(metricsTimerId);

        // Exécuter les benchmarks
        const benchmarkTimerId = this.metricCollector.startTimer('run_benchmarks');
        const benchmarks = await this.benchmarkRunner.run(result);
        this.metricCollector.stopTimer(benchmarkTimerId);

        // Calculer les métriques de performance
        const computeEfficiency = this.calculateComputeEfficiency(metrics);
        const memoryUsage = this.analyzeMemoryUsage(metrics);
        const latency = this.measureLatency(benchmarks);
        const throughput = this.calculateThroughput(benchmarks);

        // Calculer le score global
        const score = this.computeOverallScore({
            computeEfficiency,
            memoryUsage,
            latency,
            throughput
        });

        const performanceMetrics: PerformanceMetrics = {
            computeEfficiency,
            memoryUsage,
            latency,
            throughput,
            score,
            timestamp: Date.now(),
            nodeId,
            modelVersion: result.modelParameters.version,
            trainingIteration: result.iteration,
            additionalMetrics: {
                cpuUtilization: metrics.resources.cpu.utilization,
                gpuUtilization: metrics.resources.gpu?.utilization ?? 0,
                memoryEfficiency: metrics.resources.memory.efficiency,
                networkLatency: benchmarks.networkLatency,
                processingTime: benchmarks.processingTime,
                predictionAccuracy: result.metrics.accuracy ?? 0
            }
        };

        this.logger.info('Performance evaluation completed', {
            nodeId,
            score: performanceMetrics.score,
            modelVersion: performanceMetrics.modelVersion
        });

        // Tracker les métriques pour l'analyse
        this.metricCollector.trackMetric('performance_score', performanceMetrics.score, {
            nodeId,
            modelVersion: performanceMetrics.modelVersion
        });

        return performanceMetrics;
    }

    /**
 * Collecte les métriques d'un nœud spécifique.
 * @param nodeId Identifiant du nœud.
 * @returns Métriques du nœud.
 */
    private async collectNodeMetrics(nodeId: string): Promise<NodeMetrics> {
        try {
            // Simulation de la collecte des métriques
            const resources: ResourceUtilization = {
                cpu: {
                    cores: 8,
                    frequency: 3.2,
                    utilization: Math.random() * 0.6 + 0.2,
                    temperature: 65 + Math.random() * 15,
                },
                memory: {
                    total: 16384,
                    used: Math.random() * 8192 + 4096,
                    efficiency: Math.random() * 0.5 + 0.4,
                },
                gpu: {
                    model: 'RTX 4070',
                    memory: 8192,
                    utilization: Math.random() * 0.7 + 0.1,
                    temperature: 70 + Math.random() * 10,
                },
                network: {
                    bandwidth: 1000,
                    utilization: Math.random() * 0.4 + 0.1,
                    packetLoss: Math.random() * 0.02,
                },
            };

            const metrics: NodeMetrics = {
                nodeId,
                timestamp: Date.now(),
                uptime: Math.random() * 86400 * 7,
                resources,
                operatingSystem: 'Linux',
                systemLoad: Math.random() * 4 + 1,
                networkConnections: Math.floor(Math.random() * 100) + 10,
                diskUsage: {
                    total: 1024 * 1024,
                    used: Math.random() * 512 * 1024,
                    readSpeed: 500 + Math.random() * 500,
                    writeSpeed: 400 + Math.random() * 400,
                },
            };

            // Transforme 'metrics' en JSON pour éviter l'erreur de typage
            this.logger.info('Node metrics collected', { metrics: JSON.stringify(metrics) });

            return metrics;
        } catch (error) {
            this.logger.error('Failed to collect node metrics', { nodeId, error: JSON.stringify(error) });

            if (error instanceof Error) {
                throw new Error(`Failed to collect metrics for node ${nodeId}: ${error.message}`);
            }

            throw new Error(`Failed to collect metrics for node ${nodeId}: Unknown error`);
        }
    }



    /**
     * Calcule l'efficacité de calcul basée sur les métriques du nœud
     * @param metrics Métriques du nœud
     * @returns Score d'efficacité de calcul (0-1)
     */
    private calculateComputeEfficiency(metrics: NodeMetrics): number {
        const { cpu, gpu, memory } = metrics.resources;

        // Calcul pondéré de l'efficacité de calcul
        const factors = [
            { value: 1 - cpu.utilization, weight: 0.4 }, // Plus d'utilisation CPU = moins efficace
            { value: gpu?.utilization ?? 0, weight: 0.4 }, // Plus d'utilisation GPU = plus efficace (cas optimal)
            { value: memory.efficiency, weight: 0.2 } // Efficacité mémoire directe
        ];

        const efficiency = this.weightedAverage(factors);

        this.logger.debug('Compute efficiency calculated', {
            efficiency,
            cpuUtilization: cpu.utilization,
            gpuUtilization: gpu?.utilization,
            memoryEfficiency: memory.efficiency
        });

        return efficiency;
    }

    /**
     * Analyse l'utilisation de la mémoire
     * @param metrics Métriques du nœud
     * @returns Score d'utilisation de la mémoire (0-1, plus bas = meilleur)
     */
    private analyzeMemoryUsage(metrics: NodeMetrics): number {
        const { memory } = metrics.resources;

        // Calcul du ratio d'utilisation de la mémoire
        const memoryUsageRatio = memory.used / memory.total;

        // Normalisation: 0.8+ est mauvais (score élevé), <0.4 est bon (score bas)
        let memoryScore: number;

        if (memoryUsageRatio >= 0.8) {
            memoryScore = 1.0; // Utilisation critique
        } else if (memoryUsageRatio <= 0.4) {
            memoryScore = 0.2; // Utilisation optimale
        } else {
            // Interpolation linéaire entre 0.4 et 0.8
            memoryScore = 0.2 + (memoryUsageRatio - 0.4) * 2;
        }

        this.logger.debug('Memory usage analyzed', {
            memoryScore,
            memoryUsageRatio,
            memoryUsedMB: Math.round(memory.used)
        });

        return memoryScore;
    }

    /**
     * Mesure la latence à partir des résultats de benchmark
     * @param benchmarks Résultats des benchmarks
     * @returns Score de latence (0-1, plus bas = meilleur)
     */
    private measureLatency(benchmarks: BenchmarkResult): number {
        // Combinaison de la latence réseau et du temps de traitement
        const totalLatency = benchmarks.networkLatency + benchmarks.processingTime;

        // Normalisation: >500ms est mauvais (score élevé), <50ms est bon (score bas)
        let latencyScore: number;

        if (totalLatency >= 500) {
            latencyScore = 1.0; // Latence critique
        } else if (totalLatency <= 50) {
            latencyScore = 0.1; // Latence excellente
        } else {
            // Interpolation logarithmique pour pénaliser davantage les latences élevées
            latencyScore = 0.1 + 0.9 * Math.log10(totalLatency / 50) / Math.log10(500 / 50);
        }

        this.logger.debug('Latency measured', {
            latencyScore,
            totalLatencyMs: totalLatency,
            networkLatencyMs: benchmarks.networkLatency,
            processingTimeMs: benchmarks.processingTime
        });

        return latencyScore;
    }

    /**
     * Calcule le débit basé sur les résultats de benchmark
     * @param benchmarks Résultats des benchmarks
     * @returns Score de débit (0-1, plus haut = meilleur)
     */
    private calculateThroughput(benchmarks: BenchmarkResult): number {
        // Calculer le débit en requêtes par seconde
        const requestsPerSecond = benchmarks.requestsHandled / (benchmarks.testDuration / 1000);

        // Normalisation: <10 req/s est mauvais (score bas), >100 req/s est bon (score élevé)
        let throughputScore: number;

        if (requestsPerSecond <= 10) {
            throughputScore = 0.1; // Débit critique
        } else if (requestsPerSecond >= 100) {
            throughputScore = 1.0; // Débit excellent
        } else {
            // Interpolation logarithmique pour récompenser davantage les débits élevés
            throughputScore = 0.1 + 0.9 * Math.log10(requestsPerSecond / 10) / Math.log10(100 / 10);
        }

        this.logger.debug('Throughput calculated', {
            throughputScore,
            requestsPerSecond,
            totalRequests: benchmarks.requestsHandled,
            testDurationMs: benchmarks.testDuration
        });

        return throughputScore;
    }

    /**
     * Calcule le score global de performance
     * @param metrics Métriques de performance individuelles
     * @returns Score global (0-1)
     */
    private computeOverallScore(metrics: {
        computeEfficiency: number;
        memoryUsage: number;
        latency: number;
        throughput: number;
    }): number {
        // Pour le score global:
        // - computeEfficiency: plus haut = meilleur
        // - memoryUsage: plus bas = meilleur
        // - latency: plus bas = meilleur
        // - throughput: plus haut = meilleur

        const scoreFactors = [
            { value: metrics.computeEfficiency, weight: this.weights.computeEfficiency },
            { value: 1 - metrics.memoryUsage, weight: this.weights.memoryUsage }, // Inverser car plus bas = meilleur
            { value: 1 - metrics.latency, weight: this.weights.latency }, // Inverser car plus bas = meilleur
            { value: metrics.throughput, weight: this.weights.throughput }
        ];

        const overallScore = this.weightedAverage(scoreFactors);

        this.logger.debug('Overall performance score computed', {
            overallScore,
            computeEfficiency: metrics.computeEfficiency,
            memoryUsage: metrics.memoryUsage,
            latency: metrics.latency,
            throughput: metrics.throughput
        });

        return overallScore;
    }

    /**
         * Calcule une moyenne pondérée de facteurs
         * @param factors Tableau de {value, weight} pour le calcul
         * @returns Moyenne pondérée
         */
    private weightedAverage(factors: Array<{ value: number; weight: number }>): number {
        if (factors.length === 0) {
            return 0;
        }

        let totalValue = 0;
        let totalWeight = 0;

        for (const factor of factors) {
            totalValue += factor.value * factor.weight;
            totalWeight += factor.weight;
        }

        // Éviter la division par zéro
        if (totalWeight === 0) {
            return 0;
        }

        // Normaliser le résultat entre 0 et 1
        return Math.max(0, Math.min(1, totalValue / totalWeight));
    }

    /**
     * Compare les performances de deux nœuds
     * @param nodeId1 Premier nœud à comparer
     * @param nodeId2 Second nœud à comparer
     * @param results Map de résultats d'entraînement indexés par nodeId
     * @returns Rapport de comparaison
     */
    async compareNodes(
        nodeId1: string,
        nodeId2: string,
        results: Map<string, NodeTrainingResult>
    ): Promise<{
        winner: string | null;
        scoreDifference: number;
        comparisonDetails: Record<string, number>;
    }> {
        this.logger.info('Starting node comparison', { nodeId1, nodeId2 });

        // Vérifier si les résultats sont disponibles
        const result1 = results.get(nodeId1);
        const result2 = results.get(nodeId2);

        if (!result1 || !result2) {
            throw new Error(`Missing training results for comparison: ${!result1 ? nodeId1 : nodeId2}`);
        }

        // Évaluer les performances des deux nœuds
        const metrics1 = await this.evaluatePerformance(nodeId1, result1);
        const metrics2 = await this.evaluatePerformance(nodeId2, result2);

        // Comparer les scores globaux
        const scoreDifference = metrics1.score - metrics2.score;
        const winner = scoreDifference > 0 ? nodeId1 : (scoreDifference < 0 ? nodeId2 : null);

        // Détails de la comparaison
        const comparisonDetails = {
            computeEfficiencyDiff: metrics1.computeEfficiency - metrics2.computeEfficiency,
            memoryUsageDiff: metrics2.memoryUsage - metrics1.memoryUsage, // Inversé: plus bas = meilleur
            latencyDiff: metrics2.latency - metrics1.latency, // Inversé: plus bas = meilleur
            throughputDiff: metrics1.throughput - metrics2.throughput,
            overallScoreDiff: scoreDifference
        };

        this.logger.info('Node comparison completed', {
            nodeId1,
            nodeId2,
            winner: winner || 'tie',
            scoreDifference
        });

        return {
            winner,
            scoreDifference: Math.abs(scoreDifference),
            comparisonDetails
        };
    }

    /**
     * Évalue la scalabilité du système distribué
     * @param nodeResults Résultats d'entraînement de tous les nœuds
     * @returns Métriques de scalabilité
     */
    async evaluateScalability(
        nodeResults: NodeTrainingResult[]
    ): Promise<{
        scalabilityScore: number;
        linearityScore: number;
        efficiencyWithNodeCount: Record<number, number>;
        bottlenecks: string[];
        recommendations: string[];
    }> {
        this.logger.info('Evaluating system scalability', {
            nodeCount: nodeResults.length
        });

        // Grouper les nœuds par taille de cluster
        const clusterSizes = new Map<number, NodeTrainingResult[]>();

        for (const result of nodeResults) {
            // Utiliser l'information sur le nombre de nœuds dans le cluster de chaque résultat
            // Si cette information n'est pas disponible, on peut la simuler
            const clusterSize = result.config?.clusterSize as number || 1;

            if (!clusterSizes.has(clusterSize)) {
                clusterSizes.set(clusterSize, []);
            }

            clusterSizes.get(clusterSize)?.push(result);
        }

        // Évaluer l'efficacité pour chaque taille de cluster
        const efficiencyWithNodeCount: Record<number, number> = {};
        const performanceWithNodeCount: Record<number, number> = {};
        const bottlenecks: string[] = [];

        // Trier les tailles de clusters
        const sortedSizes = Array.from(clusterSizes.keys()).sort((a, b) => a - b);

        // Mesurer la performance pour chaque taille de cluster
        for (const size of sortedSizes) {
            const results = clusterSizes.get(size) || [];
            const averagePerf = await this.calculateAveragePerformance(results);

            performanceWithNodeCount[size] = averagePerf;

            // Calculer l'efficacité (performance / taille)
            // Dans un système parfaitement scalable, ça devrait rester constant
            efficiencyWithNodeCount[size] = averagePerf / size;

            // Détecter les chutes d'efficacité
            if (size > 1 && sortedSizes.includes(size - 1)) {
                const prevEfficiency = efficiencyWithNodeCount[size - 1];
                const currentEfficiency = efficiencyWithNodeCount[size];

                // Considérer une chute de 15% comme un goulot d'étranglement
                if (currentEfficiency < prevEfficiency * 0.85) {
                    bottlenecks.push(`Significant efficiency drop at ${size} nodes (${(prevEfficiency - currentEfficiency) * 100 / prevEfficiency}% decrease)`);
                }
            }
        }

        // Calculer le score de linéarité (régression linéaire sur les performances)
        const linearityScore = this.calculateLinearityScore(performanceWithNodeCount);

        // Calculer le score de scalabilité global
        // Combiner l'efficacité et la linéarité
        const scalabilityScore = (linearityScore + this.calculateEfficiencyStability(efficiencyWithNodeCount)) / 2;

        // Générer des recommandations
        const recommendations = this.generateScalabilityRecommendations(
            efficiencyWithNodeCount,
            linearityScore,
            bottlenecks
        );

        this.logger.info('Scalability evaluation completed', {
            scalabilityScore,
            linearityScore,
            bottlenecksFound: bottlenecks.length
        });

        return {
            scalabilityScore,
            linearityScore,
            efficiencyWithNodeCount,
            bottlenecks,
            recommendations
        };
    }

    /**
     * Calcule la performance moyenne pour un ensemble de résultats d'entraînement
     */
    private async calculateAveragePerformance(results: NodeTrainingResult[]): Promise<number> {
        if (results.length === 0) {
            return 0;
        }

        let totalPerformance = 0;

        for (const result of results) {
            const metrics = await this.evaluatePerformance(result.nodeId, result);
            totalPerformance += metrics.score;
        }

        return totalPerformance / results.length;
    }

    /**
     * Calcule un score de linéarité pour la scalabilité
     */
    private calculateLinearityScore(performanceBySize: Record<number, number>): number {
        // Extraire les points (taille, performance)
        const sizes = Object.keys(performanceBySize).map(Number);

        if (sizes.length < 2) {
            return 1; // Pas assez de points pour évaluer
        }

        // Calculer la pente attendue (performance / nœud)
        const baseSize = sizes[0];
        const basePerformance = performanceBySize[baseSize];
        const expectedSlope = basePerformance / baseSize;

        // Calculer l'écart par rapport à la linéarité parfaite
        let totalDeviationRatio = 0;

        for (const size of sizes) {
            if (size === baseSize) continue;

            const expected = expectedSlope * size;
            const actual = performanceBySize[size];
            const deviationRatio = Math.min(actual / expected, expected / actual);

            totalDeviationRatio += deviationRatio;
        }

        // Calculer le score moyen (0-1)
        return totalDeviationRatio / (sizes.length - 1);
    }

    /**
     * Calcule la stabilité de l'efficacité
     */
    private calculateEfficiencyStability(efficiencyBySize: Record<number, number>): number {
        const efficiencies = Object.values(efficiencyBySize);

        if (efficiencies.length < 2) {
            return 1; // Pas assez de points pour évaluer
        }

        // Calculer la moyenne des efficacités
        const mean = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;

        // Calculer l'écart type
        const variance = efficiencies.reduce((sum, eff) => sum + Math.pow(eff - mean, 2), 0) / efficiencies.length;
        const stdDev = Math.sqrt(variance);

        // Calculer le coefficient de variation (écart-type / moyenne)
        const cv = stdDev / mean;

        // Convertir en score (0-1) où 0 = instable, 1 = parfaitement stable
        return Math.max(0, 1 - cv * 2);
    }

    /**
     * Génère des recommandations d'optimisation basées sur l'analyse de scalabilité
     */
    private generateScalabilityRecommendations(
        efficiencyBySize: Record<number, number>,
        linearityScore: number,
        bottlenecks: string[]
    ): string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur la linéarité
        if (linearityScore < 0.7) {
            recommendations.push('Improve system linearity by optimizing resource distribution among nodes');
            recommendations.push('Investigate potential resource contention when adding more nodes');
        }

        // Recommandations basées sur les goulots d'étranglement
        if (bottlenecks.length > 0) {
            recommendations.push('Address identified bottlenecks to improve scalability');

            // Taille optimale de cluster
            const sizes = Object.keys(efficiencyBySize).map(Number);
            let optimalSize = sizes[0];
            let bestEfficiency = efficiencyBySize[optimalSize];

            for (const size of sizes) {
                if (efficiencyBySize[size] > bestEfficiency) {
                    bestEfficiency = efficiencyBySize[size];
                    optimalSize = size;
                }
            }

            recommendations.push(`Consider ${optimalSize} nodes as the optimal cluster size for efficiency`);
        }

        // Recommandations générales
        if (Object.keys(efficiencyBySize).length >= 3) {
            const largestSize = Math.max(...Object.keys(efficiencyBySize).map(Number));
            const largestEfficiency = efficiencyBySize[largestSize];
            const smallestSize = Math.min(...Object.keys(efficiencyBySize).map(Number));
            const smallestEfficiency = efficiencyBySize[smallestSize];

            if (largestEfficiency < smallestEfficiency * 0.7) {
                recommendations.push('System shows diminishing returns with larger clusters; focus on node-level optimization');
            } else if (largestEfficiency > smallestEfficiency * 0.9) {
                recommendations.push('System scales well; consider adding more nodes for additional performance');
            }
        }

        return recommendations;
    }
}