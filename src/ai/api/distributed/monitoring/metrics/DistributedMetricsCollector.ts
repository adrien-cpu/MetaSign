/**
 * Collecteur de métriques distribué pour surveiller plusieurs nœuds dans un système distribué
 */
import { Logger } from '@common/monitoring/LogService';

/**
 * Interface pour la métrique
 */
export interface Metric {
    /** Nom de la métrique */
    name: string;
    /** Valeur de la métrique */
    value: number;
    /** Horodatage de la métrique */
    timestamp: number;
    /** Tags associés à la métrique */
    tags?: Record<string, string>;
}

/**
 * Classe simple de collecte de métriques
 */
export class MetricsCollector {
    /**
     * Collecte les métriques courantes
     */
    public async collectMetrics(): Promise<Metric[]> {
        // Implémentation factice pour démonstration
        return [];
    }

    /**
     * Ajoute une métrique spécifique
     * @param _metric Métrique à ajouter
     */
    public addMetric(_metric: Metric): void {
        // Implémentation factice pour démonstration
    }
}

/**
 * Interface définissant la structure des métriques d'un nœud
 */
export interface NodeMetrics {
    /** Identifiant unique du nœud */
    nodeId: string;
    /** Horodatage de la collecte des métriques */
    timestamp: number;
    /** Nom ou adresse du nœud */
    nodeName: string;
    /** Type du nœud (e.g., 'worker', 'primary', 'cache') */
    nodeType: string;
    /** Métriques brutes collectées */
    metrics: Metric[];
    /** État de santé du nœud (healthy, degraded, unhealthy) */
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    /** Indique si le nœud est actuellement connecté */
    isConnected: boolean;
    /** Métriques traitées (ajoutées par le processeur) */
    processed?: ProcessedMetrics;
    /** Tendances (ajoutées par le processeur) */
    trends?: MetricTrends;
}

/**
 * Interface définissant les métriques traitées
 */
export interface ProcessedMetrics {
    /** Charge CPU moyenne (%) */
    cpuLoad: number;
    /** Utilisation mémoire (%) */
    memoryUsage: number;
    /** Latence moyenne (ms) */
    avgLatency: number;
    /** Nombre de requêtes par seconde */
    requestRate: number;
    /** Taux d'erreur (%) */
    errorRate: number;
    /** Durée de fonctionnement en secondes */
    uptime: number;
    /** Taux d'utilisation du disque (%) */
    diskUsage: number;
    /** Taux d'utilisation du réseau (Mbps) */
    networkUsage: number;
    /** Métriques supplémentaires spécifiques au type de nœud */
    [key: string]: number | string | boolean;
}

/**
 * Interface définissant les tendances des métriques
 */
export interface MetricTrends {
    /** Tendance d'utilisation CPU (%) */
    cpuTrend: number;
    /** Tendance d'utilisation mémoire (%) */
    memoryTrend: number;
    /** Tendance de latence (ms) */
    latencyTrend: number;
    /** Tendance du taux de requêtes */
    requestRateTrend: number;
    /** Tendance du taux d'erreur (%) */
    errorRateTrend: number;
    /** Tendances supplémentaires spécifiques au type de nœud */
    [key: string]: number;
}

/**
 * Interface définissant les options de configuration pour la collecte de métriques
 */
export interface MetricsCollectionOptions {
    /** Intervalle d'agrégation en millisecondes */
    aggregationWindow: number;
    /** Nombre maximal d'échantillons à conserver par métrique */
    maxSamplesPerMetric: number;
    /** Intervalle de collecte automatique en millisecondes (0 = désactivé) */
    autoCollectInterval: number;
    /** Indique si les métriques doivent être traitées automatiquement */
    autoProcessMetrics: boolean;
    /** Tags à ajouter à toutes les métriques */
    globalTags: Record<string, string>;
}

/**
 * Classe représentant un moniteur de nœud individuel
 */
export class NodeMonitor {
    private readonly collector: MetricsCollector;
    private readonly logger: Logger;
    private lastCollectedMetrics: NodeMetrics | null = null;
    private historicalMetrics: Map<string, Metric[]> = new Map();
    private readonly maxSamplesPerMetric: number;

    /**
     * Crée une instance de NodeMonitor
     * @param nodeId Identifiant unique du nœud
     * @param nodeName Nom ou adresse du nœud
     * @param nodeType Type du nœud
     * @param options Options de configuration
     */
    constructor(
        public readonly nodeId: string,
        public readonly nodeName: string,
        public readonly nodeType: string,
        options: MetricsCollectionOptions
    ) {
        this.collector = new MetricsCollector();
        this.logger = new Logger(`NodeMonitor:${nodeId}`);
        this.maxSamplesPerMetric = options.maxSamplesPerMetric;
    }

    /**
     * Collecte les métriques du nœud
     */
    public async collectMetrics(): Promise<NodeMetrics> {
        try {
            const metrics = await this.collector.collectMetrics();

            // Stocker les métriques dans l'historique
            metrics.forEach(metric => {
                const key = metric.name;
                if (!this.historicalMetrics.has(key)) {
                    this.historicalMetrics.set(key, []);
                }

                const metricHistory = this.historicalMetrics.get(key)!;
                metricHistory.push(metric);

                // Limiter le nombre d'échantillons
                if (metricHistory.length > this.maxSamplesPerMetric) {
                    metricHistory.shift();
                }
            });

            // Déterminer l'état de santé du nœud
            const healthStatus = this.determineHealthStatus(metrics);

            const nodeMetrics: NodeMetrics = {
                nodeId: this.nodeId,
                nodeName: this.nodeName,
                nodeType: this.nodeType,
                timestamp: Date.now(),
                metrics,
                healthStatus,
                isConnected: true
            };

            this.lastCollectedMetrics = nodeMetrics;
            return nodeMetrics;
        } catch (error) {
            this.logger.error(`Error collecting metrics for node ${this.nodeId}: ${error}`);

            // En cas d'erreur, retourner le dernier état connu avec isConnected=false
            // ou un état par défaut si aucun état précédent n'est disponible
            if (this.lastCollectedMetrics) {
                return {
                    ...this.lastCollectedMetrics,
                    timestamp: Date.now(),
                    healthStatus: 'unhealthy',
                    isConnected: false
                };
            }

            return {
                nodeId: this.nodeId,
                nodeName: this.nodeName,
                nodeType: this.nodeType,
                timestamp: Date.now(),
                metrics: [],
                healthStatus: 'unhealthy',
                isConnected: false
            };
        }
    }

    /**
     * Détermine l'état de santé du nœud en fonction des métriques
     * @param metrics Métriques collectées
     */
    private determineHealthStatus(metrics: Metric[]): 'healthy' | 'degraded' | 'unhealthy' {
        // Recherche de métriques critiques
        const cpuMetric = metrics.find(m => m.name === 'cpu.usage');
        const memoryMetric = metrics.find(m => m.name === 'memory.usage');
        const errorRateMetric = metrics.find(m => m.name === 'error.rate');

        // Seuils de santé
        const cpuThreshold = { warning: 75, critical: 90 };
        const memoryThreshold = { warning: 80, critical: 95 };
        const errorRateThreshold = { warning: 5, critical: 15 };

        // Vérification des seuils critiques
        if (
            (cpuMetric && cpuMetric.value > cpuThreshold.critical) ||
            (memoryMetric && memoryMetric.value > memoryThreshold.critical) ||
            (errorRateMetric && errorRateMetric.value > errorRateThreshold.critical)
        ) {
            return 'unhealthy';
        }

        // Vérification des seuils d'avertissement
        if (
            (cpuMetric && cpuMetric.value > cpuThreshold.warning) ||
            (memoryMetric && memoryMetric.value > memoryThreshold.warning) ||
            (errorRateMetric && errorRateMetric.value > errorRateThreshold.warning)
        ) {
            return 'degraded';
        }

        return 'healthy';
    }

    /**
     * Récupère les métriques historiques d'une métrique spécifique
     * @param metricName Nom de la métrique
     */
    public getMetricHistory(metricName: string): Metric[] {
        return this.historicalMetrics.get(metricName) || [];
    }

    /**
     * Ajoute une métrique spécifique
     * @param metric Métrique à ajouter
     */
    public addMetric(metric: Metric): void {
        this.collector.addMetric(metric);
    }

    /**
     * Supprime toutes les métriques historiques
     */
    public clearHistory(): void {
        this.historicalMetrics.clear();
    }
}

/**
 * Collecteur de métriques distribué pour surveiller plusieurs nœuds
 */
export class DistributedMetricsCollector {
    private nodes: Map<string, NodeMonitor> = new Map();
    private readonly options: MetricsCollectionOptions;
    private readonly logger: Logger;
    private collectInterval: NodeJS.Timeout | undefined;
    private readonly metricHistory: Map<string, NodeMetrics[]> = new Map();
    private readonly maxHistorySize = 100; // Nombre maximal d'entrées d'historique par nœud

    /**
     * Crée une instance de DistributedMetricsCollector
     * @param options Options de configuration
     */
    constructor(options?: Partial<MetricsCollectionOptions>) {
        this.options = {
            aggregationWindow: options?.aggregationWindow ?? 5000, // 5 secondes
            maxSamplesPerMetric: options?.maxSamplesPerMetric ?? 100,
            autoCollectInterval: options?.autoCollectInterval ?? 0, // Désactivé par défaut
            autoProcessMetrics: options?.autoProcessMetrics ?? true,
            globalTags: options?.globalTags ?? {}
        };

        this.logger = new Logger('DistributedMetricsCollector');

        // Démarrer la collecte automatique si configurée
        if (this.options.autoCollectInterval > 0) {
            this.startAutoCollection();
        }
    }

    /**
     * Démarre la collecte automatique des métriques
     */
    public startAutoCollection(): void {
        if (this.collectInterval) {
            this.stopAutoCollection();
        }

        this.collectInterval = setInterval(async () => {
            try {
                await this.collect();
            } catch (error) {
                this.logger.error(`Error during automatic metrics collection: ${error}`);
            }
        }, this.options.autoCollectInterval);

        this.logger.info(`Started automatic metrics collection every ${this.options.autoCollectInterval}ms`);
    }

    /**
     * Arrête la collecte automatique des métriques
     */
    public stopAutoCollection(): void {
        if (this.collectInterval) {
            clearInterval(this.collectInterval);
            this.collectInterval = undefined;
            this.logger.info('Stopped automatic metrics collection');
        }
    }

    /**
     * Ajoute un nœud à surveiller
     * @param nodeId Identifiant unique du nœud
     * @param nodeName Nom ou adresse du nœud
     * @param nodeType Type du nœud
     */
    public addNode(nodeId: string, nodeName: string, nodeType: string): void {
        if (this.nodes.has(nodeId)) {
            this.logger.warn(`Node with ID ${nodeId} already exists, replacing it`);
        }

        const node = new NodeMonitor(nodeId, nodeName, nodeType, this.options);
        this.nodes.set(nodeId, node);
        this.metricHistory.set(nodeId, []);

        this.logger.info(`Added node ${nodeName} (${nodeId}) of type ${nodeType}`);
    }

    /**
     * Supprime un nœud
     * @param nodeId Identifiant du nœud à supprimer
     */
    public removeNode(nodeId: string): boolean {
        const exists = this.nodes.has(nodeId);
        if (exists) {
            this.nodes.delete(nodeId);
            this.metricHistory.delete(nodeId);
            this.logger.info(`Removed node ${nodeId}`);
        } else {
            this.logger.warn(`Cannot remove node ${nodeId}: not found`);
        }

        return exists;
    }

    /**
     * Récupère un nœud par son identifiant
     * @param nodeId Identifiant du nœud
     */
    public getNode(nodeId: string): NodeMonitor | undefined {
        return this.nodes.get(nodeId);
    }

    /**
     * Collecte les métriques de tous les nœuds
     */
    public async collect(): Promise<NodeMetrics[]> {
        this.logger.debug(`Collecting metrics from ${this.nodes.size} nodes`);

        try {
            const nodeMetrics = await Promise.all(
                Array.from(this.nodes.values()).map(node => node.collectMetrics())
            );

            // Stocker les métriques dans l'historique
            nodeMetrics.forEach(metrics => {
                const history = this.metricHistory.get(metrics.nodeId);
                if (history) {
                    history.push(metrics);

                    // Limiter la taille de l'historique
                    if (history.length > this.maxHistorySize) {
                        history.shift();
                    }
                }
            });

            // Traiter les métriques si configuré
            if (this.options.autoProcessMetrics) {
                return this.processMetrics(nodeMetrics);
            }

            return nodeMetrics;
        } catch (error) {
            this.logger.error(`Error collecting metrics: ${error}`);
            throw error;
        }
    }

    /**
     * Traite les métriques collectées pour ajouter des informations supplémentaires
     * @param metrics Métriques collectées
     */
    private processMetrics(metrics: NodeMetrics[]): NodeMetrics[] {
        return metrics.map(metric => ({
            ...metric,
            processed: this.processNodeMetric(metric),
            trends: this.calculateTrends(metric)
        }));
    }

    /**
     * Traite les métriques d'un nœud pour calculer des valeurs dérivées
     * @param nodeMetric Métriques du nœud
     */
    private processNodeMetric(nodeMetric: NodeMetrics): ProcessedMetrics {
        const metrics = nodeMetric.metrics;

        // Extraction des métriques courantes
        const cpuMetric = metrics.find(m => m.name === 'cpu.usage')?.value || 0;
        const memoryMetric = metrics.find(m => m.name === 'memory.usage')?.value || 0;
        const latencyMetrics = metrics.filter(m => m.name.includes('latency'));
        const requestMetrics = metrics.filter(m => m.name.includes('request'));
        const errorMetrics = metrics.filter(m => m.name.includes('error'));
        const uptimeMetric = metrics.find(m => m.name === 'uptime')?.value || 0;
        const diskMetric = metrics.find(m => m.name === 'disk.usage')?.value || 0;
        const networkMetric = metrics.find(m => m.name === 'network.bandwidth')?.value || 0;

        // Calcul des métriques agrégées
        const avgLatency = latencyMetrics.length > 0
            ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
            : 0;

        const requestRate = requestMetrics.length > 0
            ? requestMetrics.reduce((sum, m) => sum + m.value, 0)
            : 0;

        const errorRate = errorMetrics.length > 0
            ? errorMetrics.reduce((sum, m) => sum + m.value, 0)
            : 0;

        // Création de l'objet de métriques traitées
        const processed: ProcessedMetrics = {
            cpuLoad: cpuMetric,
            memoryUsage: memoryMetric,
            avgLatency,
            requestRate,
            errorRate,
            uptime: uptimeMetric,
            diskUsage: diskMetric,
            networkUsage: networkMetric
        };

        // Ajouter d'autres métriques spécifiques au type de nœud
        metrics.forEach(m => {
            if (!processed[m.name] &&
                !['cpu.usage', 'memory.usage', 'uptime', 'disk.usage', 'network.bandwidth'].includes(m.name) &&
                !m.name.includes('latency') &&
                !m.name.includes('request') &&
                !m.name.includes('error')) {
                processed[m.name] = m.value;
            }
        });

        return processed;
    }

    /**
     * Calcule les tendances des métriques en comparant avec les données historiques
     * @param nodeMetric Métriques du nœud
     */
    private calculateTrends(nodeMetric: NodeMetrics): MetricTrends {
        const history = this.metricHistory.get(nodeMetric.nodeId);

        // Si nous n'avons pas assez d'historique, retourner des tendances nulles
        if (!history || history.length < 2) {
            return {
                cpuTrend: 0,
                memoryTrend: 0,
                latencyTrend: 0,
                requestRateTrend: 0,
                errorRateTrend: 0
            };
        }

        // Récupérer les métriques traitées précédentes
        const previousMetrics = history[history.length - 2].processed;

        // Si les métriques précédentes ne sont pas disponibles, retourner des tendances nulles
        if (!previousMetrics || !nodeMetric.processed) {
            return {
                cpuTrend: 0,
                memoryTrend: 0,
                latencyTrend: 0,
                requestRateTrend: 0,
                errorRateTrend: 0
            };
        }

        // Calculer les tendances (différence en pourcentage)
        const cpuTrend = this.calculateTrendPercentage(
            nodeMetric.processed.cpuLoad,
            previousMetrics.cpuLoad
        );

        const memoryTrend = this.calculateTrendPercentage(
            nodeMetric.processed.memoryUsage,
            previousMetrics.memoryUsage
        );

        const latencyTrend = this.calculateTrendPercentage(
            nodeMetric.processed.avgLatency,
            previousMetrics.avgLatency
        );

        const requestRateTrend = this.calculateTrendPercentage(
            nodeMetric.processed.requestRate,
            previousMetrics.requestRate
        );

        const errorRateTrend = this.calculateTrendPercentage(
            nodeMetric.processed.errorRate,
            previousMetrics.errorRate
        );

        return {
            cpuTrend,
            memoryTrend,
            latencyTrend,
            requestRateTrend,
            errorRateTrend
        };
    }

    /**
     * Calcule le pourcentage de changement entre deux valeurs
     * @param current Valeur actuelle
     * @param previous Valeur précédente
     */
    private calculateTrendPercentage(current: number, previous: number): number {
        if (previous === 0) {
            return current === 0 ? 0 : 100; // Si previous est 0, retourner 100% d'augmentation ou 0 si current est aussi 0
        }

        return ((current - previous) / previous) * 100;
    }

    /**
     * Récupère l'historique des métriques d'un nœud spécifique
     * @param nodeId Identifiant du nœud
     */
    public getNodeHistory(nodeId: string): NodeMetrics[] {
        return this.metricHistory.get(nodeId) || [];
    }

    /**
     * Récupère des statistiques agrégées pour tous les nœuds
     */
    public getAggregatedStatistics(): Record<string, unknown> {
        const allMetrics = Array.from(this.metricHistory.values())
            .flatMap(history => history.length > 0 ? [history[history.length - 1]] : [])
            .filter(metrics => metrics.processed);

        if (allMetrics.length === 0) {
            return {
                nodeCount: 0,
                healthStatus: {
                    healthy: 0,
                    degraded: 0,
                    unhealthy: 0
                }
            };
        }

        // Statistiques de santé
        const healthCounts = {
            healthy: allMetrics.filter(m => m.healthStatus === 'healthy').length,
            degraded: allMetrics.filter(m => m.healthStatus === 'degraded').length,
            unhealthy: allMetrics.filter(m => m.healthStatus === 'unhealthy').length
        };

        // Moyennes
        const avgCpuUsage = allMetrics.reduce((sum, m) => sum + (m.processed?.cpuLoad || 0), 0) / allMetrics.length;
        const avgMemoryUsage = allMetrics.reduce((sum, m) => sum + (m.processed?.memoryUsage || 0), 0) / allMetrics.length;
        const avgLatency = allMetrics.reduce((sum, m) => sum + (m.processed?.avgLatency || 0), 0) / allMetrics.length;
        const totalRequestRate = allMetrics.reduce((sum, m) => sum + (m.processed?.requestRate || 0), 0);
        const avgErrorRate = allMetrics.reduce((sum, m) => sum + (m.processed?.errorRate || 0), 0) / allMetrics.length;

        return {
            timestamp: Date.now(),
            nodeCount: allMetrics.length,
            healthStatus: healthCounts,
            performance: {
                avgCpuUsage,
                avgMemoryUsage,
                avgLatency,
                totalRequestRate,
                avgErrorRate
            },
            nodeTypes: this.countNodeTypes()
        };
    }

    /**
     * Compte le nombre de nœuds par type
     */
    private countNodeTypes(): Record<string, number> {
        const counts: Record<string, number> = {};

        for (const node of this.nodes.values()) {
            counts[node.nodeType] = (counts[node.nodeType] || 0) + 1;
        }

        return counts;
    }

    /**
     * Réinitialise toutes les données collectées
     */
    public reset(): void {
        this.nodes.forEach(node => node.clearHistory());
        this.metricHistory.clear();
        this.nodes.clear();
        this.logger.info('Reset metrics collector, all nodes and history cleared');
    }
}