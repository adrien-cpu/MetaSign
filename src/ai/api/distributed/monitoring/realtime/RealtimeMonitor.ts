/**
 * Système de monitoring en temps réel pour les ressources système
 * Coordonne plusieurs moniteurs spécialisés pour CPU, mémoire et réseau
 */
import { EventEmitter } from 'events';
import { CPURealtimeMonitor } from './CPURealtimeMonitor';
import { MemoryRealtimeMonitor } from './MemoryRealtimeMonitor';
import { NetworkRealtimeMonitor } from './NetworkRealtimeMonitor';
import { MetricsProcessor } from '../metrics/MetricsProcessor';
import { Logger } from '@common/monitoring/LogService';
import {
    MonitoringConfig,
    CPUMetrics,
    MemoryMetrics,
    NetworkMetrics,
    MonitoringStatus,
    AggregatedMetrics,
    ResourceAlert,
    MonitoringEvents
} from '../types/monitoring.types';

/**
 * Gestionnaire de monitoring en temps réel pour les ressources système
 */
export class RealtimeMonitor extends EventEmitter {
    private readonly cpuMonitor: CPURealtimeMonitor;
    private readonly memoryMonitor: MemoryRealtimeMonitor;
    private readonly networkMonitor: NetworkRealtimeMonitor;
    private readonly metricsProcessor: MetricsProcessor;
    private readonly logger: Logger;

    private config: MonitoringConfig | null = null;
    private status: MonitoringStatus = 'stopped';
    private aggregationInterval?: NodeJS.Timeout;
    private lastAggregatedMetrics: AggregatedMetrics | null = null;

    /**
     * Crée une nouvelle instance de RealtimeMonitor
     */
    constructor() {
        super();
        this.cpuMonitor = new CPURealtimeMonitor();
        this.memoryMonitor = new MemoryRealtimeMonitor();
        this.networkMonitor = new NetworkRealtimeMonitor();
        this.metricsProcessor = new MetricsProcessor();
        this.logger = new Logger('RealtimeMonitor');

        // Configurer les gestionnaires d'événements pour les sous-moniteurs
        this.setupEventHandlers();
    }

    /**
     * Configure les gestionnaires d'événements pour les sous-moniteurs
     * @private
     */
    private setupEventHandlers(): void {
        // Gestionnaire d'événements pour les métriques CPU
        this.cpuMonitor.on('metrics', (metrics: CPUMetrics) => {
            this.metricsProcessor.processCPUMetrics(metrics);
            this.emit(MonitoringEvents.CPU_METRICS, metrics);
        });

        this.cpuMonitor.on('alert', (alert: ResourceAlert) => {
            this.logger.warn(`CPU Alert: ${alert.message}`, alert.details);
            this.emit(MonitoringEvents.ALERT, { ...alert, resource: 'cpu' });
        });

        // Gestionnaire d'événements pour les métriques mémoire
        this.memoryMonitor.on('metrics', (metrics: MemoryMetrics) => {
            this.metricsProcessor.processMemoryMetrics(metrics);
            this.emit(MonitoringEvents.MEMORY_METRICS, metrics);
        });

        this.memoryMonitor.on('alert', (alert: ResourceAlert) => {
            this.logger.warn(`Memory Alert: ${alert.message}`, alert.details);
            this.emit(MonitoringEvents.ALERT, { ...alert, resource: 'memory' });
        });

        // Gestionnaire d'événements pour les métriques réseau
        this.networkMonitor.on('metrics', (metrics: NetworkMetrics) => {
            this.metricsProcessor.processNetworkMetrics(metrics);
            this.emit(MonitoringEvents.NETWORK_METRICS, metrics);
        });

        this.networkMonitor.on('alert', (alert: ResourceAlert) => {
            this.logger.warn(`Network Alert: ${alert.message}`, alert.details);
            this.emit(MonitoringEvents.ALERT, { ...alert, resource: 'network' });
        });

        // Gestionnaire d'erreurs pour tous les moniteurs
        [this.cpuMonitor, this.memoryMonitor, this.networkMonitor].forEach(monitor => {
            monitor.on('error', (error: Error) => {
                this.logger.error(`Monitoring error: ${error.message}`, error);
                this.emit(MonitoringEvents.ERROR, error);
            });
        });
    }

    /**
     * Démarre le monitoring des ressources
     * @param config Configuration du monitoring
     * @returns Promise qui se résout quand tous les moniteurs sont démarrés
     */
    public async startMonitoring(config: MonitoringConfig): Promise<void> {
        if (this.status === 'running') {
            this.logger.warn('Monitoring already running, stopping first');
            await this.stopMonitoring();
        }

        try {
            this.validateConfig(config);
            this.config = this.mergeWithDefaults(config);
            this.status = 'starting';
            this.logger.info('Starting resource monitoring', { config: this.config });

            // Démarrer les moniteurs individuels
            const startPromises = [];

            if (this.config.cpu.enabled) {
                startPromises.push(this.cpuMonitor.start(this.config.cpu));
            }

            if (this.config.memory.enabled) {
                startPromises.push(this.memoryMonitor.start(this.config.memory));
            }

            if (this.config.network.enabled) {
                startPromises.push(this.networkMonitor.start(this.config.network));
            }

            await Promise.all(startPromises);

            // Configurer l'agrégation périodique des métriques
            if (this.config.aggregationInterval && this.config.aggregationInterval > 0) {
                this.setupMetricsAggregation(this.config.aggregationInterval);
            }

            this.status = 'running';
            this.logger.info('All monitors started successfully');
            this.emit(MonitoringEvents.STARTED, { timestamp: Date.now() });
        } catch (error) {
            this.status = 'error';
            this.logger.error(`Failed to start monitoring: ${error instanceof Error ? error.message : String(error)}`);
            this.emit(MonitoringEvents.ERROR, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * Arrête le monitoring des ressources
     * @returns Promise qui se résout quand tous les moniteurs sont arrêtés
     */
    public async stopMonitoring(): Promise<void> {
        if (this.status !== 'running' && this.status !== 'error') {
            this.logger.warn(`Cannot stop monitoring: not running (current status: ${this.status})`);
            return;
        }

        try {
            this.status = 'stopping';
            this.logger.info('Stopping resource monitoring');

            // Arrêter l'agrégation des métriques
            if (this.aggregationInterval) {
                clearInterval(this.aggregationInterval);
                this.aggregationInterval = undefined;
            }

            // Arrêter les moniteurs individuels
            await Promise.all([
                this.cpuMonitor.stop(),
                this.memoryMonitor.stop(),
                this.networkMonitor.stop()
            ]);

            this.status = 'stopped';
            this.logger.info('All monitors stopped successfully');
            this.emit(MonitoringEvents.STOPPED, { timestamp: Date.now() });
        } catch (error) {
            this.status = 'error';
            this.logger.error(`Failed to stop monitoring: ${error instanceof Error ? error.message : String(error)}`);
            this.emit(MonitoringEvents.ERROR, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * Met à jour la configuration du monitoring en cours d'exécution
     * @param newConfig Nouvelle configuration 
     */
    public async updateConfig(newConfig: Partial<MonitoringConfig>): Promise<void> {
        if (!this.config) {
            throw new Error('Cannot update config: monitoring not initialized');
        }

        const wasRunning = this.status === 'running';
        if (wasRunning) {
            await this.stopMonitoring();
        }

        // Fusionner la configuration existante avec la nouvelle
        const updatedConfig = {
            ...this.config,
            ...newConfig,
            cpu: { ...this.config.cpu, ...(newConfig.cpu || {}) },
            memory: { ...this.config.memory, ...(newConfig.memory || {}) },
            network: { ...this.config.network, ...(newConfig.network || {}) },
        };

        if (wasRunning) {
            await this.startMonitoring(updatedConfig);
        } else {
            this.config = updatedConfig;
        }

        this.logger.info('Monitoring configuration updated', { config: this.config });
        this.emit(MonitoringEvents.CONFIG_UPDATED, { timestamp: Date.now(), config: this.config });
    }

    /**
     * Récupère les dernières métriques agrégées
     * @returns Métriques agrégées ou null si non disponibles
     */
    public getAggregatedMetrics(): AggregatedMetrics | null {
        return this.lastAggregatedMetrics;
    }

    /**
     * Récupère les dernières métriques CPU
     * @returns Métriques CPU ou null si non disponibles
     */
    public getLatestCPUMetrics(): CPUMetrics | null {
        return this.cpuMonitor.getLatestMetrics();
    }

    /**
     * Récupère les dernières métriques Mémoire
     * @returns Métriques Mémoire ou null si non disponibles
     */
    public getLatestMemoryMetrics(): MemoryMetrics | null {
        return this.memoryMonitor.getLatestMetrics();
    }

    /**
     * Récupère les dernières métriques Réseau
     * @returns Métriques Réseau ou null si non disponibles
     */
    public getLatestNetworkMetrics(): NetworkMetrics | null {
        return this.networkMonitor.getLatestMetrics();
    }

    /**
     * Récupère l'état actuel du monitoring
     * @returns État actuel
     */
    public getStatus(): MonitoringStatus {
        return this.status;
    }

    /**
     * Récupère la configuration actuelle du monitoring
     * @returns Configuration actuelle ou null si non initialisée
     */
    public getConfig(): MonitoringConfig | null {
        return this.config;
    }

    /**
     * Configure l'agrégation périodique des métriques
     * @param interval Intervalle d'agrégation en ms
     * @private
     */
    private setupMetricsAggregation(interval: number): void {
        if (this.aggregationInterval) {
            clearInterval(this.aggregationInterval);
        }

        this.aggregationInterval = setInterval(() => {
            try {
                const cpuMetrics = this.cpuMonitor.getLatestMetrics();
                const memoryMetrics = this.memoryMonitor.getLatestMetrics();
                const networkMetrics = this.networkMonitor.getLatestMetrics();

                // Ne pas agréger si certaines métriques ne sont pas disponibles
                if (!cpuMetrics || !memoryMetrics || !networkMetrics) {
                    return;
                }

                // Agréger les métriques
                this.lastAggregatedMetrics = {
                    timestamp: Date.now(),
                    cpu: cpuMetrics,
                    memory: memoryMetrics,
                    network: networkMetrics,
                    system: {
                        uptime: process.uptime(),
                        hostname: require('os').hostname(),
                        load: require('os').loadavg()
                    }
                };

                this.emit(MonitoringEvents.AGGREGATED_METRICS, this.lastAggregatedMetrics);

            } catch (error) {
                this.logger.error(`Error aggregating metrics: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, interval);
    }

    /**
     * Valide la configuration fournie
     * @param config Configuration à valider
     * @throws Error si la configuration est invalide
     * @private
     */
    private validateConfig(config: MonitoringConfig): void {
        if (!config) {
            throw new Error('Config is required');
        }

        if (!config.cpu || !config.memory || !config.network) {
            throw new Error('Config must include cpu, memory, and network sections');
        }

        // Vérifier qu'au moins un moniteur est activé
        if (!config.cpu.enabled && !config.memory.enabled && !config.network.enabled) {
            throw new Error('At least one monitor must be enabled');
        }

        // Vérifier les intervalles
        if (config.interval !== undefined && (typeof config.interval !== 'number' || config.interval <= 0)) {
            throw new Error('Interval must be a positive number');
        }

        // Autres validations spécifiques pourraient être ajoutées ici
    }

    /**
     * Fusionne la configuration fournie avec les valeurs par défaut
     * @param config Configuration utilisateur
     * @returns Configuration fusionnée avec les valeurs par défaut
     * @private
     */
    private mergeWithDefaults(config: MonitoringConfig): MonitoringConfig {
        return {
            interval: config.interval || 5000, // 5s par défaut
            aggregationInterval: config.aggregationInterval || 60000, // 1min par défaut
            enableLogging: config.enableLogging !== undefined ? config.enableLogging : true,

            cpu: {
                enabled: config.cpu.enabled,
                interval: config.cpu.interval || config.interval || 5000,
                thresholds: {
                    warning: config.cpu.thresholds?.warning ?? 70,
                    critical: config.cpu.thresholds?.critical ?? 90
                }
            },

            memory: {
                enabled: config.memory.enabled,
                interval: config.memory.interval || config.interval || 5000,
                thresholds: {
                    warning: config.memory.thresholds?.warning ?? 75,
                    critical: config.memory.thresholds?.critical ?? 90
                }
            },

            network: {
                enabled: config.network.enabled,
                interval: config.network.interval || config.interval || 5000,
                interfaces: config.network.interfaces || [],
                thresholds: {
                    bandwidth: {
                        warning: config.network.thresholds?.bandwidth?.warning ?? 70,
                        critical: config.network.thresholds?.bandwidth?.critical ?? 90
                    },
                    latency: {
                        warning: config.network.thresholds?.latency?.warning ?? 100,
                        critical: config.network.thresholds?.latency?.critical ?? 500
                    }
                }
            }
        };
    }

    /**
     * Force une collecte immédiate de métriques
     * @returns Promesse qui se résout avec les métriques agrégées
     */
    public async collectMetricsNow(): Promise<AggregatedMetrics> {
        try {
            const [cpuMetrics, memoryMetrics, networkMetrics] = await Promise.all([
                this.cpuMonitor.collectMetrics(),
                this.memoryMonitor.collectMetrics(),
                this.networkMonitor.collectMetrics()
            ]);

            this.lastAggregatedMetrics = {
                timestamp: Date.now(),
                cpu: cpuMetrics,
                memory: memoryMetrics,
                network: networkMetrics,
                system: {
                    uptime: process.uptime(),
                    hostname: require('os').hostname(),
                    load: require('os').loadavg()
                }
            };

            this.emit(MonitoringEvents.AGGREGATED_METRICS, this.lastAggregatedMetrics);
            return this.lastAggregatedMetrics;
        } catch (error) {
            this.logger.error(`Error collecting metrics: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}