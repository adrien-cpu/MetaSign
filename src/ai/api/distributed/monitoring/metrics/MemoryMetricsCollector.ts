/**
 * Collecteur de métriques mémoire pour le système de monitoring
 * Collecte des informations détaillées sur l'utilisation de la mémoire
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
 * Classe simple pour gérer un buffer de métriques
 */
class MetricsBuffer<T> {
    private buffer: T[] = [];
    private readonly maxSize: number;

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
    }

    /**
     * Ajoute une métrique au buffer
     * @param metric Métrique à ajouter
     */
    add(metric: T): void {
        this.buffer.push(metric);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    /**
     * Récupère toutes les métriques du buffer
     */
    getAll(): T[] {
        return [...this.buffer];
    }

    /**
     * Récupère les N dernières métriques
     * @param count Nombre de métriques à récupérer
     */
    getLast(count: number): T[] {
        return this.buffer.slice(-Math.min(count, this.buffer.length));
    }

    /**
     * Vide le buffer
     */
    clear(): void {
        this.buffer = [];
    }

    /**
     * Retourne la taille actuelle du buffer
     */
    size(): number {
        return this.buffer.length;
    }
}

/**
 * Informations sur la mémoire physique
 */
export interface PhysicalMemory {
    /** Mémoire totale (en bytes) */
    total: number;
    /** Mémoire libre (en bytes) */
    free: number;
    /** Mémoire utilisée (en bytes) */
    used: number;
    /** Pourcentage d'utilisation (0-100) */
    usagePercentage: number;
    /** Mémoire disponible (incluant le cache/buffer) */
    available?: number;
}

/**
 * Informations sur la mémoire virtuelle (swap)
 */
export interface VirtualMemory {
    /** Taille totale de la mémoire d'échange (en bytes) */
    total: number;
    /** Mémoire d'échange libre (en bytes) */
    free: number;
    /** Mémoire d'échange utilisée (en bytes) */
    used: number;
    /** Pourcentage d'utilisation (0-100) */
    usagePercentage: number;
}

/**
 * Informations sur la fragmentation de la mémoire
 */
export interface MemoryFragmentation {
    /** Nombre de petits blocks de mémoire */
    smallBlocks: number;
    /** Taille moyenne des blocks (en bytes) */
    averageBlockSize: number;
    /** Score de fragmentation (0-100, plus élevé = plus fragmenté) */
    fragmentationScore: number;
}

/**
 * Statistiques sur les pages mémoire
 */
export interface PageStats {
    /** Pages entrées depuis le disque */
    pagesIn: number;
    /** Pages écrites sur le disque */
    pagesOut: number;
    /** Taux de défaut de page */
    pageFaultRate: number;
}

/**
 * Historique d'utilisation de la mémoire
 */
export interface MemoryUsageHistory {
    /** Horodatage de l'échantillon */
    timestamp: number;
    /** Utilisation de la mémoire physique */
    physicalUsage: number;
    /** Utilisation de la mémoire virtuelle */
    virtualUsage: number;
}

/**
 * Métriques complètes de la mémoire
 */
export interface MemoryMetrics {
    /** Utilisation de la mémoire physique */
    physicalMemory: PhysicalMemory;
    /** Utilisation de la mémoire virtuelle */
    virtualMemory: VirtualMemory;
    /** Fragmentation de la mémoire (si disponible) */
    fragmentation?: MemoryFragmentation;
    /** Statistiques des pages mémoire (si disponible) */
    pageStats?: PageStats;
    /** Horodatage de la collecte */
    timestamp: number;
    /** Propriété d'index pour les extensions */
    [key: string]: unknown;
}

/**
 * Options pour le collecteur de métriques mémoire
 */
export interface MemoryMetricsOptions {
    /** Intervalle d'échantillonnage (en ms) */
    sampleInterval?: number;
    /** Taille maximale de l'historique */
    historySize?: number;
    /** Collecter les statistiques de fragmentation */
    collectFragmentation?: boolean;
    /** Collecter les statistiques de pages */
    collectPageStats?: boolean;
}

/**
 * Collecteur de métriques mémoire
 */
export class MemoryMetricsCollector implements IMetricsCollector {
    private readonly logger: Logger;
    private readonly options: MemoryMetricsOptions;
    private readonly historyBuffer: MetricsBuffer<MemoryUsageHistory>;

    /**
     * Constructeur
     * @param options Options du collecteur
     */
    constructor(options: MemoryMetricsOptions = {}) {
        this.options = {
            sampleInterval: options.sampleInterval ?? 5000,
            historySize: options.historySize ?? 60,
            collectFragmentation: options.collectFragmentation ?? false,
            collectPageStats: options.collectPageStats ?? false
        };

        this.logger = new Logger('MemoryMetricsCollector');
        this.historyBuffer = new MetricsBuffer<MemoryUsageHistory>(this.options.historySize);

        this.logger.info(`Memory Metrics Collector initialized with sample interval: ${this.options.sampleInterval}ms`);
    }

    /**
     * Collecte les métriques mémoire
     * @param options Options pour la collecte
     * @returns Métriques mémoire
     */
    public async collectMetrics(options?: MetricOptions): Promise<MemoryMetrics> {
        try {
            const startTime = Date.now();

            // Collecter les métriques de mémoire physique
            const physicalMemory = this.collectPhysicalMemory();

            // Collecter les métriques de mémoire virtuelle
            const virtualMemory = this.collectVirtualMemory();

            // Créer l'objet de métriques
            const metrics: MemoryMetrics = {
                physicalMemory,
                virtualMemory,
                timestamp: Date.now()
            };

            // Collecter les métriques de fragmentation si activées
            if (this.options.collectFragmentation) {
                metrics.fragmentation = this.collectMemoryFragmentation();
            }

            // Collecter les statistiques de pages si activées
            if (this.options.collectPageStats) {
                metrics.pageStats = this.collectPageStats();
            }

            // Mettre à jour l'historique
            this.updateHistory(physicalMemory.usagePercentage, virtualMemory.usagePercentage);

            // Journalisation détaillée si demandée
            if (options?.verbose) {
                this.logger.debug(`Memory metrics collected in ${Date.now() - startTime}ms: ${JSON.stringify(metrics)}`);
            }

            return metrics;
        } catch (error) {
            this.logger.error(`Error collecting memory metrics: ${String(error)}`);
            throw new Error(`Failed to collect memory metrics: ${String(error)}`);
        }
    }

    /**
     * Collecte les métriques de mémoire physique
     * @returns Métriques de mémoire physique
     * @private
     */
    private collectPhysicalMemory(): PhysicalMemory {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const usagePercentage = (usedMem / totalMem) * 100;

        return {
            total: totalMem,
            free: freeMem,
            used: usedMem,
            usagePercentage: usagePercentage,
            available: freeMem // En réalité devrait inclure la mémoire disponible comme les buffers/cache
        };
    }

    /**
     * Collecte les métriques de mémoire virtuelle (swap)
     * @returns Métriques de mémoire virtuelle
     * @private
     */
    private collectVirtualMemory(): VirtualMemory {
        // Dans un environnement Node.js standard, l'accès aux informations de swap est limité
        // Cette implémentation est une simulation, à remplacer par une vraie implémentation
        try {
            // Simulation pour l'exemple (à remplacer par une vraie implémentation)
            const totalSwap = 4 * 1024 * 1024 * 1024; // 4GB simulés
            const usedSwap = Math.floor(Math.random() * totalSwap * 0.5);
            const freeSwap = totalSwap - usedSwap;
            const usagePercentage = (usedSwap / totalSwap) * 100;

            return {
                total: totalSwap,
                free: freeSwap,
                used: usedSwap,
                usagePercentage: usagePercentage
            };
        } catch (error) {
            this.logger.warn(`Failed to collect swap information: ${String(error)}`);

            // Valeurs par défaut en cas d'erreur
            return {
                total: 0,
                free: 0,
                used: 0,
                usagePercentage: 0
            };
        }
    }

    /**
     * Collecte les métriques de fragmentation mémoire
     * @returns Métriques de fragmentation
     * @private
     */
    private collectMemoryFragmentation(): MemoryFragmentation {
        // Cette implémentation est une simulation, à remplacer par une vraie implémentation
        // qui utiliserait des API système spécifiques pour obtenir les vraies métriques
        try {
            // Simulation pour l'exemple (à remplacer par une vraie implémentation)
            const smallBlocks = Math.floor(Math.random() * 1000 + 500);
            const averageBlockSize = Math.floor(Math.random() * 1024 * 10 + 1024);
            const fragmentationScore = Math.random() * 50; // Entre 0 et 50

            return {
                smallBlocks,
                averageBlockSize,
                fragmentationScore
            };
        } catch (error) {
            this.logger.warn(`Failed to collect fragmentation metrics: ${String(error)}`);

            // Valeurs par défaut en cas d'erreur
            return {
                smallBlocks: 0,
                averageBlockSize: 0,
                fragmentationScore: 0
            };
        }
    }

    /**
     * Collecte les statistiques de pages mémoire
     * @returns Statistiques de pages
     * @private
     */
    private collectPageStats(): PageStats {
        // Cette implémentation est une simulation, à remplacer par une vraie implémentation
        // qui utiliserait des API système spécifiques pour obtenir les vraies métriques
        try {
            // Simulation pour l'exemple (à remplacer par une vraie implémentation)
            const pagesIn = Math.floor(Math.random() * 100 + 10);
            const pagesOut = Math.floor(Math.random() * 50 + 5);
            const pageFaultRate = Math.random() * 0.05; // Entre 0 et 0.05 (5%)

            return {
                pagesIn,
                pagesOut,
                pageFaultRate
            };
        } catch (error) {
            this.logger.warn(`Failed to collect page statistics: ${String(error)}`);

            // Valeurs par défaut en cas d'erreur
            return {
                pagesIn: 0,
                pagesOut: 0,
                pageFaultRate: 0
            };
        }
    }

    /**
     * Met à jour l'historique d'utilisation de la mémoire
     * @param physicalUsage Pourcentage d'utilisation de la mémoire physique
     * @param virtualUsage Pourcentage d'utilisation de la mémoire virtuelle
     * @private
     */
    private updateHistory(physicalUsage: number, virtualUsage: number): void {
        const entry: MemoryUsageHistory = {
            timestamp: Date.now(),
            physicalUsage,
            virtualUsage
        };

        this.historyBuffer.add(entry);
    }

    /**
     * Récupère l'historique d'utilisation de la mémoire
     * @param limit Nombre d'entrées à récupérer (défaut: toutes)
     * @returns Historique d'utilisation
     */
    public getUsageHistory(limit?: number): MemoryUsageHistory[] {
        if (limit !== undefined) {
            return this.historyBuffer.getLast(limit);
        }
        return this.historyBuffer.getAll();
    }

    /**
     * Calcule l'utilisation moyenne de la mémoire sur une période
     * @param minutes Période en minutes
     * @returns Utilisation moyenne (physique et virtuelle)
     */
    public getAverageUsage(minutes: number = 5): { physical: number; virtual: number } {
        // Calculer le timestamp minimum pour la période
        const minTimestamp = Date.now() - (minutes * 60 * 1000);

        // Récupérer l'historique applicable
        const history = this.historyBuffer.getAll()
            .filter(entry => entry.timestamp >= minTimestamp);

        if (history.length === 0) {
            return { physical: 0, virtual: 0 };
        }

        // Calculer les moyennes
        const physicalAvg = history.reduce((sum, entry) => sum + entry.physicalUsage, 0) / history.length;
        const virtualAvg = history.reduce((sum, entry) => sum + entry.virtualUsage, 0) / history.length;

        return {
            physical: physicalAvg,
            virtual: virtualAvg
        };
    }

    /**
     * Réinitialise l'historique des métriques mémoire
     */
    public reset(): void {
        this.historyBuffer.clear();
        this.logger.info('Memory metrics history cleared');
    }
}