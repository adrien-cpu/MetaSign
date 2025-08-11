/**
 * Moniteur réseau en temps réel
 * Surveille les performances et la connectivité réseau
 * @file src/ai/api/distributed/monitoring/realtime/NetworkRealtimeMonitor.ts
 */
import { EventEmitter } from 'events';
import { Logger } from '@common/monitoring/LogService';
import { MetricsBuffer } from '@distributed/monitoring/metrics/MetricsBuffer';

/**
 * Interface pour les moniteurs temps réel
 */
interface IRealtimeMonitor {
    start(config: unknown): Promise<void>;
    stop(): void;
    isRunning?(): boolean;
}

/**
 * Types pour les métriques réseau
 */
interface LatencyData {
    internal: number;
    external: number;
    serviceEndpoints: Map<string, number>;
}

interface ThroughputData {
    inbound: number;
    outbound: number;
    totalTransferred: number;
}

interface ConnectionStats {
    active: number;
    failed: number;
    new: number;
    closed: number;
    byType: Map<string, number>;
}

interface NetworkMetrics {
    timestamp: number;
    latency: LatencyData;
    packetLoss: number;
    throughput: ThroughputData;
    connections: ConnectionStats;
    servicesAvailable: Map<string, boolean>;
    isConnected: boolean;
    value?: number; // Requis par l'interface RealtimeMetric
    name?: string; // Requis par l'interface RealtimeMetric
    tags?: Map<string, string>; // Requis par l'interface RealtimeMetric
}

/**
 * Types de configuration
 */
interface NetworkThresholds {
    maxLatency: number;
    maxPacketLoss: number;
    minBandwidth: number;
    maxThroughput: number;
    connectionTimeout: number;
}

interface NetworkMonitorConfig {
    samplingInterval: number;
    thresholds?: NetworkThresholds;
    maxTrackedConnections?: number;
    connectionTrackingWindow?: number;
    serviceThresholds?: Record<string, Partial<NetworkThresholds>>;
    connectionLimits?: Record<string, number>;
}

/**
 * Type d'alerte réseau
 */
enum NetworkAlertType {
    HIGH_LATENCY = 'high-latency',
    PACKET_LOSS = 'packet-loss',
    BANDWIDTH_EXCEEDED = 'bandwidth-exceeded',
    CONNECTION_LOST = 'connection-lost'
}

/**
 * Classe de suivi des connexions
 */
class ConnectionTracker {
    private connections: ConnectionStats;
    private history: ConnectionStats[] = [];
    private maxHistory = 1000;
    private timeWindow = 3600000; // 1 heure par défaut

    constructor(options?: { maxConnections?: number; trackingWindow?: number }) {
        this.maxHistory = options?.maxConnections || 1000;
        this.timeWindow = options?.trackingWindow || 3600000;

        // Initialiser les statistiques de connexion
        this.connections = {
            active: 0,
            failed: 0,
            new: 0,
            closed: 0,
            byType: new Map()
        };
    }

    /**
     * Trace les connexions
     */
    public trackConnections(connections: ConnectionStats): void {
        this.history.push({ ...connections });

        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        this.connections = connections;
    }

    /**
     * Renvoie le taux d'échec des connexions
     */
    public getFailureRate(): number {
        const total = this.history.reduce((sum, stats) => sum + stats.new, 0);
        const failed = this.history.reduce((sum, stats) => sum + stats.failed, 0);

        if (total === 0) {
            return 0;
        }

        return failed / total;
    }
}

/**
 * Événements émis par NetworkRealtimeMonitor
 */
export enum NetworkMonitorEvents {
    HIGH_LATENCY = 'high-latency',
    PACKET_LOSS = 'packet-loss',
    BANDWIDTH_EXCEEDED = 'bandwidth-exceeded',
    CONNECTION_LOST = 'connection-lost',
    CONNECTION_RESTORED = 'connection-restored',
    THRESHOLD_BREACH = 'threshold-breach',
    METRICS_UPDATED = 'metrics-updated'
}

/**
 * Moniteur réseau en temps réel qui surveille les performances et la connectivité
 */
export class NetworkRealtimeMonitor extends EventEmitter implements IRealtimeMonitor {
    /**
     * Tampon pour stocker les métriques réseau
     */
    private readonly metrics: MetricsBuffer<NetworkMetrics>;

    /**
     * Traqueur de connexions réseau
     */
    private connectionTracker: ConnectionTracker;

    /**
     * Seuils d'alerte pour les métriques réseau
     */
    private thresholds: NetworkThresholds;

    /**
     * Flag indiquant si le moniteur est en cours d'exécution
     */
    private running: boolean = false;

    /**
     * Référence à l'intervalle de surveillance
     */
    private monitoringLoop?: NodeJS.Timeout | null;

    /**
     * Statut de la connexion précédente
     */
    private previousConnectionStatus: boolean = true;

    /**
     * Logger pour les opérations de monitoring réseau
     */
    private readonly logger: Logger;

    /**
     * Configuration de base du moniteur
     */
    private config?: NetworkMonitorConfig;

    /**
     * Crée une nouvelle instance de NetworkRealtimeMonitor
     * @param bufferSize Taille du tampon de métriques
     */
    constructor(bufferSize: number = 100) {
        super();
        this.metrics = new MetricsBuffer<NetworkMetrics>(bufferSize);
        this.connectionTracker = new ConnectionTracker();
        this.logger = new Logger('NetworkRealtimeMonitor');

        // Thresholds par défaut, seront remplacés lors du démarrage
        this.thresholds = {
            maxLatency: 200,          // ms
            maxPacketLoss: 5,         // %
            minBandwidth: 1000000,    // 1 Mbps
            maxThroughput: 100000000, // 100 Mbps
            connectionTimeout: 5000   // ms
        };

        // Configuration des écouteurs d'événements
        this.setMaxListeners(20);
    }

    /**
     * Démarre le moniteur réseau
     * @param config Configuration du moniteur
     */
    public async start(config: NetworkMonitorConfig): Promise<void> {
        if (this.running) {
            this.logger.warn('NetworkRealtimeMonitor already running, ignoring start request');
            return;
        }

        this.config = config;
        this.running = true;
        this.thresholds = config.thresholds || this.thresholds;

        this.logger.info('Starting NetworkRealtimeMonitor with sampling interval: %dms',
            config.samplingInterval);

        // Initialiser le tracker de connexions
        this.connectionTracker = new ConnectionTracker({
            maxConnections: config.maxTrackedConnections || 1000,
            trackingWindow: config.connectionTrackingWindow || 3600000 // 1 heure par défaut
        });

        // Démarrer le monitoring asynchrone
        this.monitoringLoop = setInterval(async () => {
            try {
                await this.performMonitoring();
            } catch (error) {
                this.logger.error('Error during network monitoring: %s', error);
                this.emit('error', error);
            }
        }, config.samplingInterval);

        // Exécuter une première mesure immédiatement
        await this.performMonitoring();

        this.logger.info('NetworkRealtimeMonitor started successfully');
    }

    /**
     * Indique si le moniteur est en cours d'exécution
     */
    public isRunning(): boolean {
        return this.running;
    }

    /**
     * Arrête le moniteur réseau
     */
    public stop(): void {
        if (!this.running) {
            this.logger.warn('NetworkRealtimeMonitor not running, ignoring stop request');
            return;
        }

        if (this.monitoringLoop) {
            clearInterval(this.monitoringLoop);
            this.monitoringLoop = null;
        }

        this.running = false;
        this.logger.info('NetworkRealtimeMonitor stopped');
    }

    /**
     * Effectue une itération de monitoring réseau
     */
    private async performMonitoring(): Promise<void> {
        // Échantillonner les métriques réseau
        const networkMetrics = await this.sampleNetwork();

        // Ajouter les métriques au tampon
        this.metrics.add({
            ...networkMetrics,
            name: 'network', // Requis pour MetricsBuffer
            value: networkMetrics.latency.external // Utiliser latence externe comme valeur principale
        });

        // Émettre l'événement de mise à jour des métriques
        this.emit(NetworkMonitorEvents.METRICS_UPDATED, networkMetrics);

        // Analyser les métriques
        await this.trackConnections(networkMetrics);
        await this.analyzeLatency(networkMetrics);
        await this.analyzePacketLoss(networkMetrics);
        await this.analyzeThroughput(networkMetrics);
        await this.checkConnectivity(networkMetrics);
    }

    /**
     * Échantillonne les métriques réseau actuelles
     * @returns Métriques réseau
     */
    private async sampleNetwork(): Promise<NetworkMetrics> {
        try {
            // Ici, vous intégreriez votre logique réelle de collecte de métriques réseau
            // Par exemple, en utilisant des API système ou des bibliothèques comme 'network'

            // Cette implémentation est simulée
            const now = Date.now();

            // Simuler des valeurs de latence
            const latency: LatencyData = {
                internal: Math.random() * 10,                // 0-10ms pour interne
                external: Math.random() * 250,               // 0-250ms pour externe
                serviceEndpoints: new Map([
                    ['api-gateway', Math.random() * 100],    // 0-100ms
                    ['database', Math.random() * 50],        // 0-50ms
                    ['auth-service', Math.random() * 80]     // 0-80ms
                ])
            };

            // Simuler les données de perte de paquets
            const packetLoss = Math.random() * 10;           // 0-10%

            // Simuler les données de débit
            const throughput: ThroughputData = {
                inbound: Math.random() * 100000000,          // 0-100 Mbps
                outbound: Math.random() * 50000000,          // 0-50 Mbps
                totalTransferred: Math.random() * 1000000000 // 0-1 GB
            };

            // Simuler les statistiques de connexion
            const connections: ConnectionStats = {
                active: Math.floor(Math.random() * 1000),         // 0-1000 connexions
                failed: Math.floor(Math.random() * 50),           // 0-50 échecs
                new: Math.floor(Math.random() * 100),             // 0-100 nouvelles
                closed: Math.floor(Math.random() * 100),          // 0-100 fermées
                byType: new Map([
                    ['http', Math.floor(Math.random() * 500)],    // 0-500 HTTP
                    ['websocket', Math.floor(Math.random() * 200)], // 0-200 WebSocket
                    ['database', Math.floor(Math.random() * 300)]  // 0-300 DB
                ])
            };

            // Simuler la disponibilité des services
            const servicesAvailable = new Map<string, boolean>([
                ['api-gateway', Math.random() > 0.05],  // 5% de chance d'être indisponible
                ['database', Math.random() > 0.02],     // 2% de chance d'être indisponible
                ['auth-service', Math.random() > 0.03]  // 3% de chance d'être indisponible
            ]);

            return {
                timestamp: now,
                latency,
                packetLoss,
                throughput,
                connections,
                servicesAvailable,
                isConnected: Math.random() > 0.01  // 1% de chance d'être déconnecté
            };
        } catch (error) {
            this.logger.error('Failed to sample network metrics: %s', error);
            throw error;
        }
    }

    /**
     * Analyse les métriques de latence et déclenche des événements si nécessaire
     * @param metrics Métriques réseau
     */
    private async analyzeLatency(metrics: NetworkMetrics): Promise<void> {
        const { latency } = metrics;

        // Vérifier la latence externe
        if (latency.external > this.thresholds.maxLatency) {
            await this.handleHighLatency(latency);
            this.emitThresholdBreach('latency', latency.external, this.thresholds.maxLatency);
        }

        // Vérifier la latence des endpoints de service
        for (const [service, serviceLatency] of latency.serviceEndpoints.entries()) {
            const serviceThreshold = this.config?.serviceThresholds?.[service]?.maxLatency
                || this.thresholds.maxLatency;

            if (serviceLatency > serviceThreshold) {
                this.logger.warn('High latency detected for service %s: %dms (threshold: %dms)',
                    service, serviceLatency, serviceThreshold);

                this.emit(NetworkMonitorEvents.HIGH_LATENCY, {
                    service,
                    latency: serviceLatency,
                    threshold: serviceThreshold,
                    timestamp: metrics.timestamp
                });

                this.emitThresholdBreach('service-latency', serviceLatency, serviceThreshold, service);
            }
        }
    }

    /**
     * Analyse les métriques de perte de paquets et déclenche des événements si nécessaire
     * @param metrics Métriques réseau
     */
    private async analyzePacketLoss(metrics: NetworkMetrics): Promise<void> {
        if (metrics.packetLoss > this.thresholds.maxPacketLoss) {
            this.logger.warn('High packet loss detected: %.2f%% (threshold: %.2f%%)',
                metrics.packetLoss, this.thresholds.maxPacketLoss);

            this.emit(NetworkMonitorEvents.PACKET_LOSS, {
                packetLoss: metrics.packetLoss,
                threshold: this.thresholds.maxPacketLoss,
                timestamp: metrics.timestamp
            });

            this.emitThresholdBreach('packet-loss', metrics.packetLoss, this.thresholds.maxPacketLoss);
        }
    }

    /**
     * Analyse les métriques de débit et déclenche des événements si nécessaire
     * @param metrics Métriques réseau
     */
    private async analyzeThroughput(metrics: NetworkMetrics): Promise<void> {
        const { throughput } = metrics;

        // Vérifier le débit entrant minimum
        if (throughput.inbound < this.thresholds.minBandwidth) {
            this.logger.warn('Low inbound bandwidth detected: %.2f bps (threshold: %.2f bps)',
                throughput.inbound, this.thresholds.minBandwidth);

            this.emitThresholdBreach('min-bandwidth', throughput.inbound, this.thresholds.minBandwidth);
        }

        // Vérifier le débit sortant maximum
        if (throughput.outbound > this.thresholds.maxThroughput) {
            this.logger.warn('High outbound throughput detected: %.2f bps (threshold: %.2f bps)',
                throughput.outbound, this.thresholds.maxThroughput);

            this.emit(NetworkMonitorEvents.BANDWIDTH_EXCEEDED, {
                throughput: throughput.outbound,
                threshold: this.thresholds.maxThroughput,
                timestamp: metrics.timestamp
            });

            this.emitThresholdBreach('max-throughput', throughput.outbound, this.thresholds.maxThroughput);
        }
    }

    /**
     * Vérifie la connectivité réseau et déclenche des événements si nécessaire
     * @param metrics Métriques réseau
     */
    private async checkConnectivity(metrics: NetworkMetrics): Promise<void> {
        if (!metrics.isConnected && this.previousConnectionStatus) {
            // La connexion a été perdue
            this.logger.error('Network connection lost');

            this.emit(NetworkMonitorEvents.CONNECTION_LOST, {
                timestamp: metrics.timestamp,
                servicesAvailable: metrics.servicesAvailable
            });
        } else if (metrics.isConnected && !this.previousConnectionStatus) {
            // La connexion a été rétablie
            this.logger.info('Network connection restored');

            this.emit(NetworkMonitorEvents.CONNECTION_RESTORED, {
                timestamp: metrics.timestamp,
                downtime: this.calculateDowntime(),
                servicesAvailable: metrics.servicesAvailable
            });
        }

        // Mettre à jour le statut précédent
        this.previousConnectionStatus = metrics.isConnected;
    }

    /**
     * Calcule la durée d'indisponibilité du réseau
     * @returns Durée d'indisponibilité en ms
     */
    private calculateDowntime(): number {
        const recentMetrics = this.getRecentMetrics();

        if (recentMetrics.length < 2) {
            return 0;
        }

        // Trouver le dernier point où la connexion était établie
        for (let i = 1; i < recentMetrics.length; i++) {
            if (recentMetrics[i].isConnected) {
                return recentMetrics[0].timestamp - recentMetrics[i].timestamp;
            }
        }

        // Si aucun point n'a été trouvé, utiliser l'ensemble de la fenêtre
        return recentMetrics[0].timestamp - recentMetrics[recentMetrics.length - 1].timestamp;
    }

    /**
     * Émet un événement de dépassement de seuil
     * @param metricType Type de métrique
     * @param value Valeur actuelle
     * @param threshold Seuil
     * @param service Service optionnel
     */
    private emitThresholdBreach(
        metricType: string,
        value: number,
        threshold: number,
        service?: string
    ): void {
        this.emit(NetworkMonitorEvents.THRESHOLD_BREACH, {
            metricType,
            value,
            threshold,
            service,
            timestamp: Date.now(),
            percentageExceeded: ((value - threshold) / threshold) * 100
        });
    }

    /**
     * Suit les connexions réseau
     * @param metrics Métriques réseau
     */
    private async trackConnections(metrics: NetworkMetrics): Promise<void> {
        this.connectionTracker.trackConnections(metrics.connections);

        // Analyser les tendances de connexion
        if (this.connectionTracker.getFailureRate() > 0.2) { // 20% de taux d'échec
            this.logger.warn('High connection failure rate: %.2f%%',
                this.connectionTracker.getFailureRate() * 100);
        }

        // Vérifier les connexions par type
        for (const [type, count] of metrics.connections.byType.entries()) {
            const maxConnections = this.config?.connectionLimits?.[type];

            if (maxConnections && count > maxConnections) {
                this.logger.warn('Connection limit exceeded for type %s: %d (limit: %d)',
                    type, count, maxConnections);
            }
        }
    }

    /**
     * Gère la détection d'une latence élevée
     * @param latency Données de latence
     */
    private async handleHighLatency(latency: LatencyData): Promise<void> {
        this.logger.warn('High external latency detected: %.2fms (threshold: %.2fms)',
            latency.external, this.thresholds.maxLatency);

        // Émettre l'événement de latence élevée
        this.emit(NetworkMonitorEvents.HIGH_LATENCY, {
            latency: latency.external,
            threshold: this.thresholds.maxLatency,
            timestamp: Date.now(),
            alertType: NetworkAlertType.HIGH_LATENCY
        });

        // Analyser les tendances
        const recentMetrics = this.getRecentMetrics();
        const highLatencyCount = recentMetrics.filter(
            m => m.latency.external > this.thresholds.maxLatency
        ).length;

        if (highLatencyCount >= 3 && recentMetrics.length >= 5) {
            // Latence élevée persistante
            this.logger.error('Persistent high latency detected over the last %d samples',
                highLatencyCount);

            // Des actions supplémentaires pourraient être prises ici
            // Comme l'envoi d'une alerte à un système de notification
        }
    }

    /**
     * Récupère les métriques réseau récentes
     * @param count Nombre de métriques à récupérer (facultatif)
     * @returns Métriques récentes
     */
    public getRecentMetrics(count?: number): NetworkMetrics[] {
        if (count !== undefined) {
            return this.metrics.getRecent(count);
        }
        // Récupérer toutes les métriques si aucun compte n'est spécifié
        return this.metrics.getAll();
    }

    /**
     * Récupère les métriques moyennes sur une période donnée
     * @param timeWindowMs Fenêtre de temps en ms
     * @returns Métriques moyennes ou null si aucune donnée
     */
    public getAverageMetrics(timeWindowMs: number): NetworkMetrics | null {
        const metrics = this.metrics.getInTimeWindow(timeWindowMs);

        if (metrics.length === 0) {
            return null;
        }

        // Calculer la moyenne de chaque métrique
        const avgLatencyInternal = metrics.reduce((sum: number, m: NetworkMetrics) => sum + m.latency.internal, 0) / metrics.length;
        const avgLatencyExternal = metrics.reduce((sum: number, m: NetworkMetrics) => sum + m.latency.external, 0) / metrics.length;
        const avgPacketLoss = metrics.reduce((sum: number, m: NetworkMetrics) => sum + m.packetLoss, 0) / metrics.length;
        const avgThroughputIn = metrics.reduce((sum: number, m: NetworkMetrics) => sum + m.throughput.inbound, 0) / metrics.length;
        const avgThroughputOut = metrics.reduce((sum: number, m: NetworkMetrics) => sum + m.throughput.outbound, 0) / metrics.length;

        // Créer une carte des latences moyennes de service
        const serviceLatencies = new Map<string, number>();

        // Collecter tous les services uniques
        const allServices = new Set<string>();
        metrics.forEach((m: NetworkMetrics) => {
            m.latency.serviceEndpoints.forEach((_, service: string) => {
                allServices.add(service);
            });
        });

        // Calculer la latence moyenne pour chaque service
        allServices.forEach(service => {
            let sum = 0;
            let count = 0;

            metrics.forEach((m: NetworkMetrics) => {
                const latency = m.latency.serviceEndpoints.get(service);
                if (latency !== undefined) {
                    sum += latency;
                    count++;
                }
            });

            if (count > 0) {
                serviceLatencies.set(service, sum / count);
            }
        });

        return {
            timestamp: Date.now(),
            latency: {
                internal: avgLatencyInternal,
                external: avgLatencyExternal,
                serviceEndpoints: serviceLatencies
            },
            packetLoss: avgPacketLoss,
            throughput: {
                inbound: avgThroughputIn,
                outbound: avgThroughputOut,
                totalTransferred: 0 // Non pertinent pour la moyenne
            },
            connections: {
                active: 0, // Non pertinent pour la moyenne
                failed: 0,
                new: 0,
                closed: 0,
                byType: new Map()
            },
            servicesAvailable: new Map(),
            isConnected: metrics.every(m => m.isConnected),
            name: 'network.average',
            value: avgLatencyExternal // Utiliser la latence externe moyenne comme valeur
        };
    }

    /**
     * Définit les seuils d'alerte réseau
     * @param thresholds Nouveaux seuils
     */
    public setThresholds(thresholds: Partial<NetworkThresholds>): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
        this.logger.info('Network thresholds updated', this.thresholds);
    }
}