/**
 * Processeur de métriques en temps réel
 * Collecte, analyse et traite les métriques pour détecter des anomalies
 */
import { EventEmitter } from 'events';
import { Logger } from '@common/monitoring/LogService';

/**
 * Configuration des seuils pour déclencher des alertes
 */
export interface ThresholdConfig {
    /** Valeur minimale autorisée */
    minValue: number;
    /** Valeur maximale autorisée */
    maxValue: number;
    /** Sévérité de l'alerte en cas de dépassement */
    severity: 'info' | 'warning' | 'critical';
    /** Conditions personnalisées d'évaluation */
    evaluator?: (metric: RealtimeMetric) => boolean;
}

/**
 * Métrique en temps réel
 */
export interface RealtimeMetric {
    /** Nom de la métrique */
    name: string;
    /** Valeur mesurée */
    value: number;
    /** Horodatage de la mesure */
    timestamp: number;
    /** Tags associés à la métrique */
    tags?: Map<string, string>;
}

/**
 * Événement de dépassement de seuil
 */
export interface ThresholdExceededEvent {
    /** Métrique qui a dépassé son seuil */
    metric: RealtimeMetric;
    /** Configuration du seuil dépassé */
    threshold: ThresholdConfig;
    /** Horodatage de la détection */
    detectedAt: number;
}

/**
 * Options de configuration du processeur de métriques
 */
export interface RealtimeMetricProcessorOptions {
    /** Taille de la fenêtre de collecte en ms (défaut: 60000 ms) */
    windowSize?: number;
    /** Intervalle entre chaque traitement en ms (défaut: 1000 ms) */
    processingInterval?: number;
    /** Configuration des seuils par nom de métrique */
    thresholds?: Map<string, ThresholdConfig>;
    /** Nombre maximum de métriques en mémoire (défaut: 10000) */
    maxBufferSize?: number;
    /** Activer le démarrage automatique (défaut: false) */
    autoStart?: boolean;
}

/**
 * Processeur de métriques en temps réel
 */
export class RealtimeMetricProcessor extends EventEmitter {
    /** Configuration des seuils par nom de métrique */
    private readonly thresholds: Map<string, ThresholdConfig>;

    /** Taille de la fenêtre de collecte en ms */
    private readonly windowSize: number;

    /** Intervalle entre chaque traitement en ms */
    private readonly processingInterval: number;

    /** Nombre maximum de métriques en mémoire */
    private readonly maxBufferSize: number;

    /** Tampon des métriques récentes */
    private readonly metricBuffer: RealtimeMetric[] = [];

    /** ID de l'intervalle de traitement */
    private intervalId?: NodeJS.Timeout;

    /** Indique si le processeur est en cours d'exécution */
    private isRunning: boolean = false;

    /** Logger pour les opérations du processeur */
    private readonly logger: Logger;

    /**
     * Crée une nouvelle instance du processeur de métriques
     * @param options - Options de configuration
     */
    constructor(options: RealtimeMetricProcessorOptions = {}) {
        super();

        this.windowSize = options.windowSize ?? 60_000; // 1 minute par défaut
        this.processingInterval = options.processingInterval ?? 1_000; // 1 seconde par défaut
        this.thresholds = options.thresholds ?? new Map<string, ThresholdConfig>();
        this.maxBufferSize = options.maxBufferSize ?? 10_000;

        this.logger = new Logger('RealtimeMetricProcessor');

        // S'assurer que les événements sont correctement traités
        super.setMaxListeners(20);

        // Auto-démarrage si configuré
        if (options.autoStart) {
            setTimeout(() => this.start(), 0);
        }
    }

    /**
     * Démarre le traitement des métriques en temps réel
     */
    public async start(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('RealtimeMetricProcessor already running');
            return;
        }

        this.isRunning = true;
        this.logger.info('Starting RealtimeMetricProcessor');

        this.intervalId = setInterval(async () => {
            try {
                const metrics = await this.collectMetrics();
                await this.processMetrics(metrics);
                this.purgeOldMetrics();
            } catch (error) {
                this.logger.error('Error during metrics processing:', error);
                this.emit('processing-error', { error, timestamp: Date.now() });
            }
        }, this.processingInterval);
    }

    /**
     * Arrête le traitement des métriques
     */
    public stop(): void {
        if (!this.isRunning || !this.intervalId) {
            this.logger.warn('RealtimeMetricProcessor not running');
            return;
        }

        clearInterval(this.intervalId);
        this.isRunning = false;
        this.intervalId = undefined;

        this.logger.info('RealtimeMetricProcessor stopped');
    }

    /**
     * Ajoute une métrique au tampon de traitement
     * @param metric - Métrique à ajouter
     */
    public addMetric(metric: RealtimeMetric): void {
        this.metricBuffer.push(metric);

        // Vérifier immédiatement si le seuil est dépassé
        if (this.isThresholdExceeded(metric)) {
            const config = this.thresholds.get(metric.name);
            if (config) {
                this.emitThresholdExceeded(metric, config);
            }
        }

        // Limiter la taille du tampon
        if (this.metricBuffer.length > this.maxBufferSize) {
            this.metricBuffer.shift(); // Supprimer la plus ancienne métrique
        }
    }

    /**
     * Ajoute plusieurs métriques au tampon de traitement
     * @param metrics - Métriques à ajouter
     */
    public addMetrics(metrics: RealtimeMetric[]): void {
        metrics.forEach(metric => this.addMetric(metric));
    }

    /**
     * Définit un seuil pour une métrique
     * @param metricName - Nom de la métrique
     * @param config - Configuration du seuil
     */
    public setThreshold(metricName: string, config: ThresholdConfig): void {
        this.thresholds.set(metricName, config);
        this.logger.debug(`Set threshold for metric: ${metricName}`);
    }

    /**
     * Récupère les métriques récentes dans la fenêtre de temps spécifiée
     * @param windowMs - Taille de la fenêtre en ms (par défaut: valeur de this.windowSize)
     */
    public getRecentMetrics(windowMs: number = this.windowSize): RealtimeMetric[] {
        const cutoff = Date.now() - windowMs;
        return this.metricBuffer.filter(metric => metric.timestamp >= cutoff);
    }

    /**
     * Collecte les métriques à traiter
     */
    private async collectMetrics(): Promise<RealtimeMetric[]> {
        // Dans une implémentation réelle, cette méthode pourrait :
        // - Récupérer des métriques depuis des sources externes
        // - Interroger des API de monitoring
        // - Lire des fichiers de logs
        return this.getRecentMetrics();
    }

    /**
     * Traite les métriques collectées
     */
    private async processMetrics(metrics: RealtimeMetric[]): Promise<void> {
        for (const metric of metrics) {
            if (this.isThresholdExceeded(metric)) {
                const config = this.thresholds.get(metric.name);
                if (config) {
                    this.emitThresholdExceeded(metric, config);
                }
            }
            await this.storeMetric(metric);
        }

        this.emit('metrics-processed', {
            count: metrics.length,
            timestamp: Date.now()
        });
    }

    /**
     * Vérifie si une métrique dépasse son seuil configuré
     */
    private isThresholdExceeded(metric: RealtimeMetric): boolean {
        const config = this.thresholds.get(metric.name);
        if (!config) return false;

        // Si un évaluateur personnalisé est défini, l'utiliser
        if (config.evaluator) {
            return config.evaluator(metric);
        }

        // Sinon, vérifier les seuils min et max
        return metric.value > config.maxValue || metric.value < config.minValue;
    }

    /**
     * Émet un événement de dépassement de seuil
     */
    private emitThresholdExceeded(metric: RealtimeMetric, threshold: ThresholdConfig): void {
        const event: ThresholdExceededEvent = {
            metric,
            threshold,
            detectedAt: Date.now()
        };

        this.emit('threshold-exceeded', event);

        // Émettre également un événement spécifique à la sévérité
        this.emit(`threshold-exceeded-${threshold.severity}`, event);

        this.logger.warn(
            `Threshold exceeded for metric ${metric.name}: ${metric.value} (min: ${threshold.minValue}, max: ${threshold.maxValue}, severity: ${threshold.severity})`
        );
    }

    /**
     * Stocke une métrique traitée
     */
    private async storeMetric(metric: RealtimeMetric): Promise<void> {
        // Dans une implémentation réelle, cette méthode pourrait :
        // - Enregistrer la métrique dans une base de données
        // - Écrire dans un fichier de log
        // - Envoyer à un service de monitoring externe
    }

    /**
     * Purge les métriques anciennes du tampon
     */
    private purgeOldMetrics(): void {
        const cutoff = Date.now() - this.windowSize;
        const initialLength = this.metricBuffer.length;

        // Conserver uniquement les métriques dans la fenêtre de temps
        const newBuffer = this.metricBuffer.filter(metric => metric.timestamp >= cutoff);

        const purgedCount = initialLength - newBuffer.length;
        if (purgedCount > 0) {
            this.metricBuffer.splice(0, this.metricBuffer.length, ...newBuffer);
            this.logger.debug(`Purged ${purgedCount} old metrics from buffer`);
        }
    }
}