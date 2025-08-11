/**
 * Moniteur en temps réel pour les métriques CPU
 * Surveille l'utilisation du processeur et génère des alertes si nécessaire
 */
import { cpus, loadavg } from 'os';
import { EventEmitter } from 'events';
import { Logger } from '@common/monitoring/LogService';

/**
 * Interface pour les moniteurs temps réel
 */
export interface IRealtimeMonitor {
    /** Démarre le moniteur */
    start(config?: Record<string, unknown>): Promise<void>;
    /** Arrête le moniteur */
    stop(): void;
}

/**
 * Classe pour stocker un tampon circulaire de métriques
 */
export class MetricsBuffer<T> {
    private buffer: T[] = [];
    private readonly maxSize: number;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    /**
     * Ajoute une métrique au tampon
     */
    public add(metric: T): void {
        this.buffer.push(metric);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    /**
     * Récupère toutes les métriques du tampon
     */
    public getAll(): T[] {
        return [...this.buffer];
    }

    /**
     * Récupère la métrique la plus récente
     */
    public getLatest(): T | undefined {
        return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : undefined;
    }

    /**
     * Vide le tampon
     */
    public clear(): void {
        this.buffer = [];
    }

    /**
     * Retourne le nombre de métriques dans le tampon
     */
    public size(): number {
        return this.buffer.length;
    }
}

/**
 * Gestionnaire d'alertes pour le système de monitoring
 */
export interface AlertManager {
    /**
     * Envoie une alerte
     */
    sendAlert(alert: {
        title: string;
        message: string;
        severity: string;
        source: string;
        timestamp: number;
        details?: Record<string, unknown>;
    }): Promise<void>;
}

/**
 * Interface pour les métriques de CPU
 */
export interface CPUMetrics {
    /** Horodatage de la collecte des métriques */
    timestamp: number;
    /** Utilisation du CPU */
    usage: {
        /** Utilisation moyenne totale (pourcentage) */
        total: number;
        /** Utilisation par cœur (pourcentage) */
        perCore: number[];
        /** Temps système (pourcentage) */
        system: number;
        /** Temps utilisateur (pourcentage) */
        user: number;
        /** Temps d'inactivité (pourcentage) */
        idle: number;
    };
    /** Charge moyenne du système */
    loadAverage: {
        /** Charge moyenne sur 1 minute */
        oneMinute: number;
        /** Charge moyenne sur 5 minutes */
        fiveMinutes: number;
        /** Charge moyenne sur 15 minutes */
        fifteenMinutes: number;
    };
    /** Métriques supplémentaires et spécifiques */
    details?: Record<string, unknown>;
}

/**
 * Configuration du moniteur CPU
 */
export interface CPUMonitorConfig {
    /** Intervalle d'échantillonnage en ms (défaut: 1000) */
    samplingInterval: number;
    /** Seuil d'alerte pour une utilisation élevée du CPU (défaut: 90) */
    highUsageThreshold: number;
    /** Durée minimale de l'utilisation élevée pour déclencher une alerte (ms) */
    highUsageDurationThreshold: number;
    /** Nombre d'échantillons CPU à conserver (défaut: 100) */
    bufferSize: number;
    /** Activer les alertes (défaut: true) */
    enableAlerts: boolean;
    /** Activer la journalisation avancée (défaut: false) */
    verboseLogging: boolean;
    /** Pour permettre l'indexation par chaîne (pour Record<string, unknown>) */
    [key: string]: unknown;
}

/**
 * Événements émis par le moniteur CPU
 */
export enum CPUMonitorEvents {
    /** Utilisation élevée détectée */
    HIGH_USAGE = 'high-usage',
    /** Utilisation normale restaurée après une utilisation élevée */
    NORMAL_USAGE = 'normal-usage',
    /** Détection d'un pic d'utilisation */
    USAGE_SPIKE = 'usage-spike',
    /** Nouvelles métriques collectées */
    METRICS_COLLECTED = 'metrics-collected',
    /** Erreur survenue pendant la surveillance */
    ERROR = 'error'
}

/**
 * Moniteur en temps réel pour les métriques CPU
 */
export class CPURealtimeMonitor extends EventEmitter implements IRealtimeMonitor {
    /** Tampon pour stocker les métriques CPU récentes */
    private readonly metrics: MetricsBuffer<CPUMetrics>;

    /** Indique si le moniteur est en cours d'exécution */
    private isRunning = false;

    /** Configuration du moniteur */
    private config: CPUMonitorConfig;

    /** Logger pour les messages du moniteur */
    private readonly logger: Logger;

    /** Gestionnaire d'alertes */
    private readonly alertManager?: AlertManager | undefined;

    /** Indique si une alerte d'utilisation élevée est active */
    private highUsageAlertActive = false;

    /** Timestamp du début d'une utilisation élevée */
    private highUsageStartTime = 0;

    /** Métriques précédentes pour détecter les tendances */
    private previousMetrics?: CPUMetrics | undefined;

    /** ID d'intervalle pour la méthode de surveillance */
    private monitorInterval?: NodeJS.Timeout | undefined;

    /**
     * Crée une nouvelle instance du moniteur CPU en temps réel
     * @param config Configuration du moniteur (optionnel)
     * @param alertManager Gestionnaire d'alertes (optionnel)
     */
    constructor(config?: Partial<CPUMonitorConfig>, alertManager?: AlertManager) {
        super();

        // Configurer avec des valeurs par défaut
        this.config = {
            samplingInterval: config?.samplingInterval ?? 1000,
            highUsageThreshold: config?.highUsageThreshold ?? 90,
            highUsageDurationThreshold: config?.highUsageDurationThreshold ?? 5000,
            bufferSize: config?.bufferSize ?? 100,
            enableAlerts: config?.enableAlerts ?? true,
            verboseLogging: config?.verboseLogging ?? false
        };

        // Initialiser le tampon de métriques
        this.metrics = new MetricsBuffer<CPUMetrics>(this.config.bufferSize);

        // Initialiser le logger
        this.logger = new Logger('CPURealtimeMonitor');

        // Configurer le gestionnaire d'alertes
        this.alertManager = alertManager;

        // Configurer le nombre maximum d'écouteurs d'événements
        this.setMaxListeners(20);

        this.logger.info('CPU Realtime Monitor initialized with sampling interval:', { interval: this.config.samplingInterval });
    }

    /**
     * Démarre la surveillance du CPU
     * @param customConfig Configuration personnalisée (écrase la configuration existante)
     */
    public async start(customConfig?: Partial<CPUMonitorConfig>): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('CPU monitor is already running, ignoring start request');
            return;
        }

        // Mettre à jour la configuration si une configuration personnalisée est fournie
        if (customConfig) {
            this.config = { ...this.config, ...customConfig };
            this.logger.info('Updated configuration:', { config: this.config });
        }

        this.isRunning = true;
        this.logger.info('Starting CPU monitoring with sampling interval:', { interval: this.config.samplingInterval });

        try {
            // Première collecte immédiate
            const initialMetrics = await this.sampleCPU();
            await this.processMetrics(initialMetrics);

            // Configurer la boucle de surveillance
            this.monitorInterval = setInterval(async () => {
                try {
                    if (!this.isRunning) {
                        this.stopMonitoring();
                        return;
                    }

                    const metrics = await this.sampleCPU();
                    await this.processMetrics(metrics);
                } catch (error) {
                    this.handleError('Error during CPU sampling', error);
                }
            }, this.config.samplingInterval);

            // Assurer que l'intervalle ne bloque pas la fin du processus
            if (this.monitorInterval.unref) {
                this.monitorInterval.unref();
            }

            this.logger.info('CPU monitoring started successfully');
        } catch (error) {
            this.isRunning = false;
            this.handleError('Failed to start CPU monitoring', error);
            throw error;
        }
    }

    /**
     * Arrête la surveillance du CPU
     */
    public stop(): void {
        if (!this.isRunning) {
            this.logger.warn('CPU monitor is not running, ignoring stop request');
            return;
        }

        this.stopMonitoring();
        this.logger.info('CPU monitoring stopped');
    }

    /**
     * Arrête la surveillance en nettoyant les ressources
     */
    private stopMonitoring(): void {
        this.isRunning = false;

        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = undefined;
        }

        // Réinitialiser l'état d'alerte
        this.highUsageAlertActive = false;
        this.highUsageStartTime = 0;
    }

    /**
     * Échantillonne les métriques CPU actuelles
     * @returns Métriques CPU
     */
    private async sampleCPU(): Promise<CPUMetrics> {
        // Obtenir les informations CPU
        const cpuInfo = cpus();
        const loadAverages = loadavg();

        // Calculer l'utilisation du CPU
        let totalUser = 0;
        let totalSystem = 0;
        let totalIdle = 0;
        let totalTicks = 0;

        const perCoreUsage: number[] = [];

        for (const cpu of cpuInfo) {
            const { user, nice, sys, idle, irq } = cpu.times;

            // Total des ticks pour ce cœur
            const total = user + nice + sys + idle + irq;

            // Usage par cœur (% non idle)
            const coreTicks = user + nice + sys + irq;
            const coreUsage = Math.round((coreTicks / total) * 100);
            perCoreUsage.push(coreUsage);

            // Accumuler pour le total
            totalUser += user;
            totalSystem += sys;
            totalIdle += idle;
            totalTicks += total;
        }

        // Calculer les pourcentages globaux
        const userPercent = Math.round((totalUser / totalTicks) * 100);
        const systemPercent = Math.round((totalSystem / totalTicks) * 100);
        const idlePercent = Math.round((totalIdle / totalTicks) * 100);
        const totalPercent = Math.round(((totalTicks - totalIdle) / totalTicks) * 100);

        // Assembler et retourner les métriques
        const metrics: CPUMetrics = {
            timestamp: Date.now(),
            usage: {
                total: totalPercent,
                perCore: perCoreUsage,
                user: userPercent,
                system: systemPercent,
                idle: idlePercent
            },
            loadAverage: {
                oneMinute: loadAverages[0],
                fiveMinutes: loadAverages[1],
                fifteenMinutes: loadAverages[2]
            },
            details: {
                cores: cpuInfo.length,
                model: cpuInfo[0].model,
                speed: cpuInfo[0].speed
            }
        };

        if (this.config.verboseLogging) {
            this.logger.debug('CPU Metrics:', { metrics });
        }

        return metrics;
    }

    /**
     * Traite les métriques collectées
     * @param metrics Métriques CPU
     */
    private async processMetrics(metrics: CPUMetrics): Promise<void> {
        // Ajouter les métriques au tampon
        this.metrics.add(metrics);

        // Émettre un événement pour les nouvelles métriques
        this.emit(CPUMonitorEvents.METRICS_COLLECTED, metrics);

        // Vérifier les seuils
        await this.checkThresholds(metrics);

        // Mettre à jour les tendances
        await this.updateTrends(metrics);

        // Stocker pour comparaison future
        this.previousMetrics = metrics;
    }

    /**
     * Vérifie si les métriques dépassent les seuils configurés
     * @param metrics Métriques CPU à vérifier
     */
    private async checkThresholds(metrics: CPUMetrics): Promise<void> {
        const { highUsageThreshold, highUsageDurationThreshold } = this.config;
        const now = Date.now();

        // Vérifier l'utilisation élevée du CPU
        if (metrics.usage.total >= highUsageThreshold) {
            // Si c'est le début d'une période d'utilisation élevée
            if (!this.highUsageAlertActive) {
                this.highUsageStartTime = now;
                this.logger.warn(`High CPU usage detected: ${metrics.usage.total}% (threshold: ${highUsageThreshold}%)`);
            } else if (!this.highUsageAlertActive && (now - this.highUsageStartTime) >= highUsageDurationThreshold) {
                // Si l'utilisation élevée persiste assez longtemps, déclencher une alerte
                await this.handleHighCPUUsage(metrics);
                this.highUsageAlertActive = true;
            }
        } else if (this.highUsageAlertActive && metrics.usage.total < highUsageThreshold) {
            // Réinitialiser l'état d'alerte si l'utilisation est revenue à la normale
            this.highUsageAlertActive = false;
            this.highUsageStartTime = 0;
            this.logger.info(`CPU usage returned to normal: ${metrics.usage.total}%`);

            // Émettre un événement pour l'utilisation normale restaurée
            this.emit(CPUMonitorEvents.NORMAL_USAGE, {
                timestamp: now,
                usage: metrics.usage.total,
                duration: now - this.highUsageStartTime
            });
        }

        // Vérifier la charge moyenne
        if (metrics.loadAverage.oneMinute > cpus().length) {
            this.logger.warn(`High load average: ${metrics.loadAverage.oneMinute} (cores: ${cpus().length})`);
        }
    }

    /**
     * Gère une utilisation élevée du CPU
     * @param metrics Métriques CPU avec utilisation élevée
     */
    private async handleHighCPUUsage(metrics: CPUMetrics): Promise<void> {
        const duration = Date.now() - this.highUsageStartTime;

        this.logger.error(`Sustained high CPU usage: ${metrics.usage.total}% for ${duration}ms`);

        // Collecter des informations supplémentaires pour le diagnostic
        const topCores = this.findMostUtilizedCores(metrics);
        const recentTrend = this.getRecentTrend();

        // Événement pour utilisation élevée du CPU
        const alertData = {
            timestamp: Date.now(),
            usage: metrics.usage.total,
            duration,
            threshold: this.config.highUsageThreshold,
            loadAverage: metrics.loadAverage,
            topCores,
            trend: recentTrend
        };

        // Émettre un événement pour l'utilisation élevée
        this.emit(CPUMonitorEvents.HIGH_USAGE, alertData);

        // Envoyer une alerte si configuré
        if (this.config.enableAlerts && this.alertManager) {
            await this.alertManager.sendAlert({
                title: 'High CPU Usage Alert',
                message: `CPU usage at ${metrics.usage.total}% exceeds threshold of ${this.config.highUsageThreshold}%`,
                severity: 'warning',
                source: 'CPURealtimeMonitor',
                timestamp: Date.now(),
                details: alertData
            });
        }
    }

    /**
     * Met à jour les tendances basées sur les nouvelles métriques
     * @param metrics Métriques CPU actuelles
     */
    private async updateTrends(metrics: CPUMetrics): Promise<void> {
        if (!this.previousMetrics) return;

        const timeDiff = metrics.timestamp - this.previousMetrics.timestamp;
        const usageDiff = metrics.usage.total - this.previousMetrics.usage.total;

        // Détecter les pics d'utilisation (augmentation de plus de 20% en peu de temps)
        if (usageDiff > 20 && timeDiff < 5000) {
            this.logger.warn(`CPU usage spike detected: +${usageDiff}% in ${timeDiff}ms`);

            // Émettre un événement pour le pic d'utilisation
            this.emit(CPUMonitorEvents.USAGE_SPIKE, {
                timestamp: metrics.timestamp,
                previousUsage: this.previousMetrics.usage.total,
                currentUsage: metrics.usage.total,
                increase: usageDiff,
                timeSpan: timeDiff
            });
        }

        // Analyser les tendances à long terme avec le tampon de métriques
        if (this.metrics.size() > 10) {
            const trend = this.calculateTrend();

            if (this.config.verboseLogging && trend) {
                this.logger.debug(`CPU usage trend: ${trend.direction} by ${trend.magnitude.toFixed(2)}% over last ${trend.samples} samples`);
            }
        }
    }

    /**
     * Identifie les cœurs les plus utilisés
     * @param metrics Métriques CPU
     * @returns Liste des cœurs les plus utilisés avec leur utilisation
     */
    private findMostUtilizedCores(metrics: CPUMetrics): Array<{ core: number; usage: number }> {
        return metrics.usage.perCore
            .map((usage, index) => ({ core: index, usage }))
            .sort((a, b) => b.usage - a.usage)
            .slice(0, 3); // Top 3 des cœurs les plus utilisés
    }

    /**
     * Calcule la tendance d'utilisation CPU sur les dernières métriques
     */
    private calculateTrend(): { direction: 'increasing' | 'decreasing' | 'stable'; magnitude: number; samples: number } | null {
        if (this.metrics.size() < 5) return null;

        const recentMetrics = this.metrics.getAll().slice(-10);
        const firstUsage = recentMetrics[0].usage.total;
        const lastUsage = recentMetrics[recentMetrics.length - 1].usage.total;
        const diff = lastUsage - firstUsage;

        let direction: 'increasing' | 'decreasing' | 'stable';

        if (Math.abs(diff) < 5) {
            direction = 'stable';
        } else {
            direction = diff > 0 ? 'increasing' : 'decreasing';
        }

        return {
            direction,
            magnitude: Math.abs(diff),
            samples: recentMetrics.length
        };
    }

    /**
     * Obtient la tendance récente de l'utilisation CPU
     */
    private getRecentTrend(): { direction: string; values: number[] } {
        const recentMetrics = this.metrics.getAll().slice(-5);
        const values = recentMetrics.map((m: CPUMetrics) => m.usage.total);

        if (values.length < 2) {
            return { direction: 'unknown', values };
        }

        // Calculer la direction globale
        const first = values[0];
        const last = values[values.length - 1];
        const diff = last - first;

        let direction: string;
        if (Math.abs(diff) < 5) {
            direction = 'stable';
        } else {
            direction = diff > 0 ? 'increasing' : 'decreasing';
        }

        return { direction, values };
    }

    /**
     * Gère une erreur survenue pendant la surveillance
     * @param message Message d'erreur
     * @param error Erreur d'origine
     */
    private handleError(message: string, error: unknown): void {
        this.logger.error(`${message}: ${error}`);

        // Émettre un événement pour l'erreur
        this.emit(CPUMonitorEvents.ERROR, {
            message,
            error,
            timestamp: Date.now()
        });
    }

    /**
     * Récupère les métriques CPU les plus récentes
     */
    public getLatestMetrics(): CPUMetrics | null {
        return this.metrics.getLatest() || null;
    }

    /**
     * Récupère toutes les métriques CPU stockées
     */
    public getAllMetrics(): CPUMetrics[] {
        return this.metrics.getAll();
    }

    /**
     * Récupère les statistiques d'utilisation CPU
     */
    public getUsageStatistics(): {
        average: number;
        min: number;
        max: number;
        current: number;
        samples: number;
    } {
        const metrics = this.metrics.getAll();

        if (metrics.length === 0) {
            return {
                average: 0,
                min: 0,
                max: 0,
                current: 0,
                samples: 0
            };
        }

        const usages = metrics.map((m: CPUMetrics) => m.usage.total);
        const sum = usages.reduce((a: number, b: number) => a + b, 0);

        return {
            average: sum / usages.length,
            min: Math.min(...usages),
            max: Math.max(...usages),
            current: metrics[metrics.length - 1].usage.total,
            samples: metrics.length
        };
    }

    /**
     * Réinitialise les métriques collectées
     */
    public resetMetrics(): void {
        this.metrics.clear();
        this.previousMetrics = undefined;
        this.highUsageAlertActive = false;
        this.highUsageStartTime = 0;
        this.logger.info('CPU metrics reset');
    }
}