/**
 * Collecteur de métriques CPU pour le système de monitoring
 * Collecte des informations détaillées sur l'utilisation du CPU
 */
import * as os from 'os';

/**
 * Logger simplifié
 */
class Logger {
    constructor(private readonly name: string) { }

    info(message: string, ...args: unknown[]): void {
        console.info(`[${this.name}] INFO: ${message}`, ...args);
    }

    debug(message: string, ...args: unknown[]): void {
        console.debug(`[${this.name}] DEBUG: ${message}`, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        console.warn(`[${this.name}] WARN: ${message}`, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(`[${this.name}] ERROR: ${message}`, ...args);
    }
}

/**
 * Interface pour le collecteur de métriques
 */
export interface IMetricsCollector {
    collectMetrics(options?: MetricOptions): Promise<unknown>;
    reset(): void;
}

/**
 * Options pour la collecte des métriques
 */
export interface MetricOptions {
    /** Mode verbose pour plus de logs */
    verbose?: boolean;
    /** Tags additionnels à ajouter aux métriques */
    tags?: Record<string, string>;
    /** Identifiant du nœud */
    nodeId?: string;
}

/**
 * Structure des statistiques CPU par cœur
 */
export interface CPUStats {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
}

/**
 * Structure d'un échantillon CPU
 */
export interface CPUSample {
    timestamp: number;
    cores: number;
    frequency?: number | undefined;
    temperature?: number | undefined;
    stats: CPUStats[];
}

/**
 * Structure de l'utilisation CPU (totale et par cœur)
 */
export interface CPUUsage {
    total: number;
    perCore: number[];
}

/**
 * Structure des métriques CPU complètes
 */
export interface CPUMetrics {
    usage: CPUUsage;
    cores: number;
    frequency?: number;
    temperature?: number;
    loadAverage: number[];
    [key: string]: unknown;
}

/**
 * Structure des options du collecteur de métriques CPU
 */
export interface CPUMetricsOptions {
    samplingInterval?: number;
    temperatureSensor?: boolean;
    collectFrequency?: boolean;
    maxSamples?: number;
}

/**
 * Classe responsable de la collecte des métriques CPU
 */
export class CPUMetricsCollector implements IMetricsCollector {
    private readonly logger: Logger;
    private readonly samplingInterval: number;
    private readonly collectFrequency: boolean;
    private readonly temperatureSensor: boolean;
    private lastSample?: CPUSample | undefined;
    private samplesHistory: CPUSample[] = [];
    private readonly maxSamples: number;

    /**
     * Constructeur
     * @param options Options de configuration du collecteur
     */
    constructor(options: CPUMetricsOptions = {}) {
        this.samplingInterval = options.samplingInterval ?? 1000;
        this.collectFrequency = options.collectFrequency ?? false;
        this.temperatureSensor = options.temperatureSensor ?? false;
        this.maxSamples = options.maxSamples ?? 60;
        this.logger = new Logger('CPUMetricsCollector');

        this.logger.info(`CPU Metrics Collector initialized with sampling interval: ${this.samplingInterval}ms`);
    }

    /**
     * Collecte les métriques CPU actuelles
     * @param options Options pour la collecte
     * @returns Métriques CPU
     */
    public async collectMetrics(options?: MetricOptions): Promise<CPUMetrics> {
        try {
            const currentSample = await this.sampleCPU();
            let usage: CPUUsage;

            if (this.lastSample) {
                usage = this.calculateUsage(currentSample, this.lastSample);
            } else {
                // Si c'est le premier échantillon, pas de calcul possible
                usage = { total: 0, perCore: Array(currentSample.cores).fill(0) };
                this.logger.debug('First CPU sample collected, waiting for next sample to calculate usage');
            }

            // Mise à jour de l'historique
            this.samplesHistory.push(currentSample);
            if (this.samplesHistory.length > this.maxSamples) {
                this.samplesHistory.shift();
            }

            // Mise à jour du dernier échantillon
            this.lastSample = currentSample;

            const metricsResult: CPUMetrics = {
                usage,
                cores: currentSample.cores,
                loadAverage: await this.getLoadAverage()
            };

            // Ajouter les données optionnelles si disponibles
            if (this.collectFrequency && currentSample.frequency !== undefined) {
                metricsResult.frequency = currentSample.frequency;
            }

            if (this.temperatureSensor && currentSample.temperature !== undefined) {
                metricsResult.temperature = currentSample.temperature;
            }

            // Journalisation détaillée si demandée
            if (options?.verbose) {
                this.logger.debug(`CPU metrics collected: ${JSON.stringify(metricsResult)}`);
            }

            return metricsResult;
        } catch (error) {
            this.logger.error(`Error collecting CPU metrics: ${String(error)}`);
            throw new Error(`Failed to collect CPU metrics: ${error}`);
        }
    }

    /**
     * Récupère la moyenne d'utilisation CPU sur les derniers échantillons
     * @param samples Nombre d'échantillons à considérer (défaut: tous)
     * @returns Utilisation CPU moyenne en pourcentage
     */
    public getAverageUsage(samples?: number): number {
        const sampleCount = samples || this.samplesHistory.length;
        if (sampleCount <= 1 || this.samplesHistory.length <= 1) {
            return this.lastSample ? 0 : 0;
        }

        const recentSamples = this.samplesHistory.slice(-sampleCount);
        let totalUsage = 0;
        let validSamples = 0;

        for (let i = 1; i < recentSamples.length; i++) {
            const current = recentSamples[i];
            const previous = recentSamples[i - 1];
            const usage = this.calculateUsage(current, previous);
            totalUsage += usage.total;
            validSamples++;
        }

        return validSamples > 0 ? totalUsage / validSamples : 0;
    }

    /**
     * Échantillonne l'état actuel du CPU
     * @returns Échantillon CPU
     * @private
     */
    private async sampleCPU(): Promise<CPUSample> {
        try {
            const cpuInfo = await this.getCPUInfo();
            const stats = this.getCPUStats();

            return {
                timestamp: Date.now(),
                cores: cpuInfo.cores,
                frequency: cpuInfo.frequency,
                temperature: cpuInfo.temperature,
                stats
            };
        } catch (error) {
            this.logger.error(`Failed to sample CPU: ${String(error)}`);
            throw new Error(`CPU sampling failed: ${error}`);
        }
    }

    /**
     * Récupère les informations de base du CPU
     * @returns Information CPU (nombre de cœurs, fréquence et température)
     * @private
     */
    private async getCPUInfo(): Promise<{ cores: number; frequency?: number | undefined; temperature?: number | undefined }> {
        const cores = os.cpus().length;
        let frequency: number | undefined;
        let temperature: number | undefined;

        // Collecte optionnelle de la fréquence
        if (this.collectFrequency) {
            try {
                // En Node.js standard, la fréquence est disponible dans os.cpus()
                frequency = os.cpus()[0].speed;
            } catch (error) {
                this.logger.warn(`Failed to collect CPU frequency: ${String(error)}`);
            }
        }

        // Collecte optionnelle de la température
        // Nécessite généralement des modules externes ou des accès système
        if (this.temperatureSensor) {
            try {
                // Simulation pour l'exemple - à remplacer par une vraie implémentation
                // Ex: temperature = await this.readTemperatureSensor();
                temperature = Math.random() * 20 + 40; // Simulation entre 40°C et 60°C
            } catch (error) {
                this.logger.warn(`Failed to collect CPU temperature: ${String(error)}`);
            }
        }

        return { cores, frequency, temperature };
    }

    /**
     * Récupère les statistiques détaillées du CPU pour chaque cœur
     * @returns Tableau de statistiques par cœur
     * @private
     */
    private getCPUStats(): CPUStats[] {
        return os.cpus().map(cpu => ({
            user: cpu.times.user,
            nice: cpu.times.nice,
            sys: cpu.times.sys,
            idle: cpu.times.idle,
            irq: cpu.times.irq
        }));
    }

    /**
     * Calcule l'utilisation CPU entre deux échantillons
     * @param current Échantillon actuel
     * @param previous Échantillon précédent
     * @returns Utilisation CPU totale et par cœur en pourcentage
     * @private
     */
    private calculateUsage(current: CPUSample, previous: CPUSample): CPUUsage {
        if (!previous) {
            return {
                total: 0,
                perCore: Array(current.cores).fill(0)
            };
        }

        const timeDiff = current.timestamp - previous.timestamp;

        return {
            total: this.calculateTotalUsage(current.stats, previous.stats, timeDiff),
            perCore: this.calculatePerCoreUsage(current.stats, previous.stats, timeDiff)
        };
    }

    /**
     * Calcule l'utilisation totale du CPU
     * @param currentStats Statistiques CPU actuelles
     * @param previousStats Statistiques CPU précédentes
     * @param timeDiff Différence de temps entre les échantillons (ms)
     * @returns Utilisation CPU totale en pourcentage
     * @private
     */
    private calculateTotalUsage(currentStats: CPUStats[], previousStats: CPUStats[], timeDiff: number): number {
        if (!previousStats || previousStats.length === 0 || timeDiff <= 0) {
            return 0;
        }

        let totalIdle = 0;
        let totalUsed = 0;

        for (let i = 0; i < currentStats.length; i++) {
            if (i >= previousStats.length) break;

            const current = currentStats[i];
            const previous = previousStats[i];

            // Calculer les différences pour chaque type de temps
            const idleDiff = current.idle - previous.idle;
            const userDiff = current.user - previous.user;
            const niceDiff = current.nice - previous.nice;
            const sysDiff = current.sys - previous.sys;
            const irqDiff = current.irq - previous.irq;

            // Total de temps utilisé (non-idle)
            const usedDiff = userDiff + niceDiff + sysDiff + irqDiff;

            // Additionner à nos totaux
            totalIdle += idleDiff;
            totalUsed += usedDiff;
        }

        // Calculer le temps total (idle + utilisé)
        const totalTime = totalIdle + totalUsed;

        // Éviter la division par zéro
        if (totalTime === 0) {
            return 0;
        }

        // Calculer l'utilisation en pourcentage
        return (totalUsed / totalTime) * 100;
    }

    /**
     * Calcule l'utilisation CPU par cœur
     * @param currentStats Statistiques CPU actuelles
     * @param previousStats Statistiques CPU précédentes
     * @param timeDiff Différence de temps entre les échantillons (ms)
     * @returns Tableau d'utilisation CPU par cœur en pourcentage
     * @private
     */
    private calculatePerCoreUsage(currentStats: CPUStats[], previousStats: CPUStats[], timeDiff: number): number[] {
        if (!previousStats || previousStats.length === 0 || timeDiff <= 0) {
            return Array(currentStats.length).fill(0);
        }

        return currentStats.map((current, index) => {
            if (index >= previousStats.length) return 0;

            const previous = previousStats[index];

            // Calculer les différences pour chaque type de temps
            const idleDiff = current.idle - previous.idle;
            const userDiff = current.user - previous.user;
            const niceDiff = current.nice - previous.nice;
            const sysDiff = current.sys - previous.sys;
            const irqDiff = current.irq - previous.irq;

            // Total de temps utilisé (non-idle) et total
            const usedDiff = userDiff + niceDiff + sysDiff + irqDiff;
            const totalDiff = idleDiff + usedDiff;

            // Éviter la division par zéro
            if (totalDiff === 0) {
                return 0;
            }

            // Calculer l'utilisation en pourcentage pour ce cœur
            return (usedDiff / totalDiff) * 100;
        });
    }

    /**
     * Récupère la charge moyenne du système
     * @returns Tableau contenant la charge moyenne sur 1, 5 et 15 minutes
     * @private
     */
    private async getLoadAverage(): Promise<number[]> {
        try {
            // os.loadavg() renvoie [1min, 5min, 15min]
            return os.loadavg();
        } catch (error) {
            this.logger.error(`Failed to get load average: ${String(error)}`);
            return [0, 0, 0]; // Retourner une valeur par défaut en cas d'erreur
        }
    }

    /**
     * Réinitialise l'historique des échantillons et l'état du collecteur
     */
    public reset(): void {
        this.lastSample = undefined;
        this.samplesHistory = [];
        this.logger.info('CPU Metrics Collector reset completed');
    }
}