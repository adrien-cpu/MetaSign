/**
 * @file src/ai/api/distributed/monitoring/realtime/MemoryRealtimeMonitor.ts
 * Moniteur temps réel pour les performances mémoire du système
 * Surveille l'utilisation mémoire, détecte les fuites et la fragmentation
 */
import { IRealtimeMonitor } from '../interfaces/IRealtimeMonitor';
import { MetricsBuffer } from '@distributed/monitoring/metrics/MetricsBuffer';
import {
    MemoryMetrics,
    MemoryThresholds,
    MemoryAlertEvent,
    MemoryNormalEvent
} from '@distributed/monitoring/types/memory.types';
import { MemoryLeakDetector } from '@distributed/monitoring/analysis/MemoryLeakDetector';
import {
    MemoryFragmentationAnalyzer,
    FragmentationAnalysisParams
} from '@distributed/monitoring/analysis/MemoryFragmentationAnalyzer';
import {
    MemoryLeakReport,
    FragmentationReport
} from '@distributed/monitoring/types/performance.types';
import { EventEmitter } from 'events';
import { Logger } from '@common/monitoring/LogService';
import * as os from 'os';
import { v4 as uuid } from 'uuid';

/**
 * Interface pour les fuites mémoire détectées
 */
interface MemoryLeak {
    type: string;
    trend?: {
        slope?: number;
        sustainedGrowth?: {
            duration?: number;
            percentage?: number;
        };
    };
    location?: {
        size?: number;
        instances?: number;
        retainedSize?: number;
        growth?: number;
    };
}

/**
 * Configuration pour le moniteur mémoire
 */
export interface MemoryMonitorConfig {
    /** Intervalle d'échantillonnage en ms */
    samplingInterval: number;

    /** Taille du buffer de métriques */
    bufferSize?: number;

    /** Seuils d'alerte pour la mémoire */
    thresholds?: MemoryThresholds;

    /** Activer la détection de fuites mémoire */
    leakDetection?: boolean;

    /** Activer la détection de fragmentation */
    fragmentationDetection?: boolean;

    /** Nombre d'échantillons à analyser pour la détection de fuite */
    leakDetectionSamples?: number;

    /** Intervalle entre les analyses complètes (ms) */
    fullAnalysisInterval?: number;
}

/**
 * Événements émis par le moniteur mémoire
 */
export enum MemoryEvents {
    MEMORY_ALERT = 'memory-alert',
    MEMORY_BACK_TO_NORMAL = 'memory-back-to-normal',
    MEMORY_LEAK_DETECTED = 'memory-leak-detected',
    FRAGMENTATION_DETECTED = 'fragmentation-detected',
    METRICS_UPDATED = 'metrics-updated',
    MONITOR_STARTED = 'monitor-started',
    MONITOR_STOPPED = 'monitor-stopped',
    ERROR = 'error'
}

/**
 * Interface pour les événements de démarrage du moniteur
 */
interface MonitorStartEvent {
    monitorId: string;
    timestamp: number;
    config: MemoryMonitorConfig;
}

/**
 * Interface pour les événements d'arrêt du moniteur
 */
interface MonitorStopEvent {
    monitorId: string;
    timestamp: number;
}

/**
 * Interface pour les événements de fuite mémoire
 */
interface MemoryLeakEvent extends MemoryLeakReport {
    monitorId: string;
}

/**
 * Interface pour les événements de fragmentation
 */
interface FragmentationEvent extends FragmentationReport {
    monitorId: string;
}

/**
 * Interface pour les événements d'erreur
 */
interface ErrorEvent {
    message: string;
    error: unknown;
    timestamp: number;
    monitorId: string;
}

/**
 * Moniteur temps réel pour la mémoire
 */
export class MemoryRealtimeMonitor extends EventEmitter implements IRealtimeMonitor {
    /** Buffer de métriques mémoire */
    private readonly metrics: MetricsBuffer<MemoryMetrics>;

    /** Détecteur de fuites mémoire */
    private readonly leakDetector: MemoryLeakDetector;

    /** Analyseur de fragmentation mémoire */
    private readonly fragmentationAnalyzer: MemoryFragmentationAnalyzer;

    /** Logger */
    private readonly logger: Logger;

    /** ID unique de ce moniteur */
    private readonly monitorId: string;

    /** Configuration du moniteur */
    private config: MemoryMonitorConfig;

    /** Flag indiquant si le moniteur est en cours d'exécution */
    private running: boolean = false;

    /** Timestamp de la dernière analyse complète */
    private lastFullAnalysis: number = 0;

    /** Timer pour l'échantillonnage périodique */
    private samplingTimer: NodeJS.Timeout | undefined;

    /** État d'alerte actuel */
    private inAlertState: boolean = false;

    /**
     * Constructeur
     * @param options Options initiales
     */
    constructor(options: {
        bufferSize?: number;
        logger?: Logger;
    } = {}) {
        super();

        this.monitorId = uuid();
        this.logger = options.logger || new Logger('MemoryRealtimeMonitor');

        // Initialisation des composants
        const bufferSize = options.bufferSize || 100;
        this.metrics = new MetricsBuffer<MemoryMetrics>(bufferSize);
        this.leakDetector = new MemoryLeakDetector();
        this.fragmentationAnalyzer = new MemoryFragmentationAnalyzer();

        // Configuration par défaut
        this.config = {
            samplingInterval: 5000,
            bufferSize: bufferSize,
            leakDetection: true,
            fragmentationDetection: true,
            leakDetectionSamples: 20,
            fullAnalysisInterval: 60000, // 1 minute
            thresholds: {
                warning: 70,
                critical: 85,
                heapWarning: 75,
                heapCritical: 90
            }
        };

        this.logger.info(`Memory realtime monitor initialized with ID: ${this.monitorId}`);
    }

    /**
     * Démarre le moniteur mémoire
     * @param config Configuration optionnelle
     */
    public async start(config?: Partial<MemoryMonitorConfig>): Promise<void> {
        if (this.running) {
            this.logger.warn('Memory monitor already running');
            return;
        }

        // Fusionner la configuration existante avec la nouvelle
        if (config) {
            this.config = {
                ...this.config,
                ...config
            };

            // Fusionner les seuils s'ils existent
            if (config.thresholds && this.config.thresholds) {
                this.config.thresholds = {
                    ...this.config.thresholds,
                    ...config.thresholds
                };
            }
        }

        this.running = true;
        this.logger.info(`Starting memory monitor with sampling interval: ${this.config.samplingInterval}ms`);

        // Émettre l'événement de démarrage
        this.emit(MemoryEvents.MONITOR_STARTED, {
            monitorId: this.monitorId,
            timestamp: Date.now(),
            config: this.config
        } as MonitorStartEvent);

        // Échantillonnage initial immédiat
        try {
            await this.sampleAndProcess();
        } catch (error) {
            this.handleError('Error during initial sampling', error);
        }

        // Démarrer l'échantillonnage périodique
        this.setupPeriodicSampling();
    }

    /**
     * Arrête le moniteur mémoire
     */
    public stop(): void {
        if (!this.running) {
            this.logger.warn('Memory monitor not running');
            return;
        }

        // Arrêt de l'échantillonnage périodique
        if (this.samplingTimer) {
            clearInterval(this.samplingTimer);
            this.samplingTimer = undefined;
        }

        this.running = false;
        this.logger.info('Memory monitor stopped');

        // Émettre l'événement d'arrêt
        this.emit(MemoryEvents.MONITOR_STOPPED, {
            monitorId: this.monitorId,
            timestamp: Date.now()
        } as MonitorStopEvent);
    }

    /**
     * Vérifie si le moniteur est en cours d'exécution
     */
    public isRunning(): boolean {
        return this.running;
    }

    /**
     * Récupère les métriques mémoire actuelles
     */
    public getMetrics(): MetricsBuffer<MemoryMetrics> {
        return this.metrics;
    }

    /**
     * Récupère la dernière métrique mémoire
     */
    public getLatestMetric(): MemoryMetrics | undefined {
        return this.metrics.getLast();
    }

    /**
     * Déclenche manuellement un échantillonnage immédiat
     */
    public async sampleNow(): Promise<MemoryMetrics> {
        return this.sampleAndProcess();
    }

    /**
     * Configure l'échantillonnage périodique
     */
    private setupPeriodicSampling(): void {
        this.samplingTimer = setInterval(async () => {
            if (!this.running) return;

            try {
                await this.sampleAndProcess();
            } catch (error) {
                this.handleError('Error during periodic sampling', error);
            }
        }, this.config.samplingInterval);
    }

    /**
     * Échantillonne et traite les métriques mémoire
     */
    private async sampleAndProcess(): Promise<MemoryMetrics> {
        // Échantillonne les métriques mémoire
        const metrics = await this.sampleMemory();

        // Ajoute les métriques au buffer
        this.metrics.add(metrics);

        // Émet un événement pour les nouvelles métriques
        this.emit(MemoryEvents.METRICS_UPDATED, metrics);

        // Vérifie les seuils d'alerte
        this.checkThresholds(metrics);

        // Détecte les fuites mémoire si activé
        if (this.config.leakDetection) {
            await this.detectLeaks();
        }

        // Vérifie la fragmentation si activé
        if (this.config.fragmentationDetection) {
            await this.checkFragmentation(metrics);
        }

        // Exécute une analyse complète périodiquement
        const now = Date.now();
        if (now - this.lastFullAnalysis > (this.config.fullAnalysisInterval || 60000)) {
            await this.performFullAnalysis();
            this.lastFullAnalysis = now;
        }

        return metrics;
    }

    /**
     * Échantillonne les métriques mémoire actuelles
     */
    private async sampleMemory(): Promise<MemoryMetrics> {
        // Récupère les métriques de mémoire Node.js
        const nodeMemory = process.memoryUsage();

        // Récupère les métriques système
        const systemMemory = {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem()
        };

        // Calcule les pourcentages
        const systemUsagePercent = (systemMemory.used / systemMemory.total) * 100;
        const heapUsagePercent = (nodeMemory.heapUsed / nodeMemory.heapTotal) * 100;

        return {
            timestamp: Date.now(),
            heap: {
                used: nodeMemory.heapUsed,
                total: nodeMemory.heapTotal,
                limit: nodeMemory.heapTotal
            },
            rss: nodeMemory.rss,
            external: nodeMemory.external,
            arrayBuffers: nodeMemory.arrayBuffers,
            system: {
                total: systemMemory.total,
                free: systemMemory.free,
                used: systemMemory.used,
                usagePercent: systemUsagePercent
            },
            process: {
                rss: nodeMemory.rss,
                heapTotal: nodeMemory.heapTotal,
                heapUsed: nodeMemory.heapUsed,
                external: nodeMemory.external,
                arrayBuffers: nodeMemory.arrayBuffers,
                heapUsagePercent: heapUsagePercent
            }
        };
    }

    /**
     * Vérifie si les métriques mémoire dépassent les seuils configurés
     */
    private checkThresholds(metrics: MemoryMetrics): void {
        const thresholds = this.config.thresholds;
        if (!thresholds) return;

        const systemUsage = metrics.system.usagePercent;
        const heapUsage = metrics.process.heapUsagePercent;

        // Vérification des seuils critiques
        if ((thresholds.critical !== undefined && systemUsage >= thresholds.critical) ||
            (thresholds.heapCritical !== undefined && heapUsage >= thresholds.heapCritical)) {
            if (!this.inAlertState) {
                this.logger.warn(
                    `Memory usage critical: System: ${systemUsage.toFixed(2)}%, Heap: ${heapUsage.toFixed(2)}%`
                );

                this.emit(MemoryEvents.MEMORY_ALERT, {
                    level: 'critical',
                    systemUsage,
                    heapUsage,
                    timestamp: metrics.timestamp,
                    metrics
                } as MemoryAlertEvent);

                this.inAlertState = true;
            }
            return;
        }

        // Vérification des seuils d'avertissement
        if ((thresholds.warning !== undefined && systemUsage >= thresholds.warning) ||
            (thresholds.heapWarning !== undefined && heapUsage >= thresholds.heapWarning)) {
            if (!this.inAlertState) {
                this.logger.info(
                    `Memory usage warning: System: ${systemUsage.toFixed(2)}%, Heap: ${heapUsage.toFixed(2)}%`
                );

                this.emit(MemoryEvents.MEMORY_ALERT, {
                    level: 'warning',
                    systemUsage,
                    heapUsage,
                    timestamp: metrics.timestamp,
                    metrics
                } as MemoryAlertEvent);

                this.inAlertState = true;
            }
            return;
        }

        // Retour à la normale
        if (this.inAlertState) {
            this.logger.info(
                `Memory usage returned to normal: System: ${systemUsage.toFixed(2)}%, Heap: ${heapUsage.toFixed(2)}%`
            );

            this.emit(MemoryEvents.MEMORY_BACK_TO_NORMAL, {
                systemUsage,
                heapUsage,
                timestamp: metrics.timestamp,
                metrics
            } as MemoryNormalEvent);

            this.inAlertState = false;
        }
    }

    /**
     * Détecte les fuites mémoire potentielles
     */
    private async detectLeaks(): Promise<void> {
        try {
            // Récupérer les derniers échantillons pour l'analyse
            const samples = this.metrics.getRecent(this.config.leakDetectionSamples || 20);

            // Vérifier qu'il y a suffisamment d'échantillons pour l'analyse
            if (samples.length === 0) {
                this.logger.debug('Not enough samples for leak detection');
                return;
            }

            // Pour l'analyse, nous utilisons la dernière métrique
            const latestMetric = samples[samples.length - 1];

            // Note: Cette implémentation suppose que MemoryLeakDetector.analyze() 
            // prend une seule métrique mais utilise en interne l'historique des métriques
            // Une meilleure approche serait de modifier MemoryLeakDetector pour accepter explicitement un tableau

            // Analyse de la métrique pour détecter des fuites
            const potentialLeak = await this.leakDetector.analyze(latestMetric);

            if (potentialLeak) {
                // Conversion de MemoryLeak en MemoryLeakReport
                const leakReport: MemoryLeakReport = {
                    type: this.mapLeakType(potentialLeak.type),
                    confidence: 0.8, // Valeur par défaut
                    growthRatePerMinute: this.calculateGrowthRate(potentialLeak),
                    detectedAt: Date.now(),
                    samples: samples.length,
                    metrics: this.extractMetricsFromLeak(potentialLeak)
                };

                await this.handleMemoryLeak(leakReport);
            }
        } catch (error) {
            this.handleError('Error during leak detection', error);
        }
    }

    /**
     * Mappe le type de fuite de MemoryLeak vers le type accepté par MemoryLeakReport
     */
    private mapLeakType(leakType: string): 'heap_growth' | 'external_memory' | 'array_buffer' | 'unknown' {
        switch (leakType) {
            case 'MEMORY_LEAK':
                return 'heap_growth';
            case 'array_buffer':
                return 'array_buffer';
            case 'external_memory':
                return 'external_memory';
            default:
                return 'unknown';
        }
    }

    /**
     * Calcule le taux de croissance à partir d'une fuite mémoire
     */
    private calculateGrowthRate(leak: MemoryLeak): number {
        // Convertir le taux de croissance en pourcentage par minute
        if (leak.trend && leak.trend.slope) {
            // Conversion approximative, à adapter selon la structure exacte
            return leak.trend.slope * 60 * 1000 * 100;
        }
        return 5.0; // Valeur par défaut de 5% par minute
    }

    /**
     * Extrait les métriques d'une fuite mémoire
     */
    private extractMetricsFromLeak(leak: MemoryLeak): Record<string, number> {
        const metrics: Record<string, number> = {};

        if (leak.location) {
            metrics.size = leak.location.size || 0;
            metrics.instances = leak.location.instances || 0;
            metrics.retainedSize = leak.location.retainedSize || 0;
            metrics.growth = leak.location.growth || 0;
        }

        if (leak.trend && leak.trend.sustainedGrowth) {
            metrics.duration = leak.trend.sustainedGrowth.duration || 0;
            metrics.percentage = leak.trend.sustainedGrowth.percentage || 0;
        }

        return metrics;
    }

    /**
     * Gère une fuite mémoire détectée
     */
    private async handleMemoryLeak(leakReport: MemoryLeakReport): Promise<void> {
        this.logger.warn(
            `Potential memory leak detected: ${leakReport.type} (Confidence: ${(leakReport.confidence * 100).toFixed(2)}%, Growth Rate: ${leakReport.growthRatePerMinute.toFixed(2)}%/min)`
        );

        // Émettre un événement pour la fuite mémoire
        this.emit(MemoryEvents.MEMORY_LEAK_DETECTED, {
            ...leakReport,
            monitorId: this.monitorId
        } as MemoryLeakEvent);

        // Conseils de récupération selon le type de fuite
        const recommendations = this.getLeakRecommendations(leakReport.type);
        this.logger.info(`Memory leak recommendations: ${recommendations.join(', ')}`);
    }

    /**
     * Récupère des recommandations basées sur le type de fuite mémoire
     */
    private getLeakRecommendations(leakType: string): string[] {
        switch (leakType) {
            case 'heap_growth':
                return [
                    'Check for object accumulation in collections',
                    'Verify event listeners are properly removed',
                    'Look for circular references preventing garbage collection'
                ];
            case 'external_memory':
                return [
                    'Check native module memory usage',
                    'Verify buffer allocations are properly released',
                    'Consider limiting cache sizes for external resources'
                ];
            case 'array_buffer':
                return [
                    'Check for unmanaged ArrayBuffers or TypedArrays',
                    'Verify WebAssembly memory is properly managed',
                    'Consider using buffer pools for frequently allocated buffers'
                ];
            default:
                return [
                    'Profile memory usage with heapdump',
                    'Consider implementing memory limits',
                    'Review recently added code for potential leaks'
                ];
        }
    }

    /**
     * Vérifie la fragmentation de la mémoire
     */
    private async checkFragmentation(metrics: MemoryMetrics): Promise<void> {
        try {
            // Calculer le ratio de fragmentation
            const heapUsed = metrics.process.heapUsed;
            const heapTotal = metrics.process.heapTotal;

            // On obtient un rapport de fragmentation
            const fragReport = await this.fragmentationAnalyzer.analyze({
                heapUsed,
                heapTotal,
                samples: this.metrics.getRecent(10)
            } as FragmentationAnalysisParams);

            if (fragReport.fragmentationDetected) {
                await this.handleFragmentation(fragReport);
            }
        } catch (error) {
            this.handleError('Error during fragmentation check', error);
        }
    }

    /**
     * Gère une fragmentation mémoire détectée
     */
    private async handleFragmentation(report: FragmentationReport): Promise<void> {
        this.logger.warn(
            `Memory fragmentation detected: ${(report.fragmentationRatio * 100).toFixed(2)}% (Severity: ${report.severity})`
        );

        // Émettre un événement pour la fragmentation
        this.emit(MemoryEvents.FRAGMENTATION_DETECTED, {
            ...report,
            monitorId: this.monitorId
        } as FragmentationEvent);

        // Recommandations selon la sévérité
        if (report.severity === 'high') {
            this.logger.info('Consider restarting the process to address high fragmentation');
        }
    }

    /**
     * Exécute une analyse complète de la mémoire
     */
    private async performFullAnalysis(): Promise<void> {
        this.logger.debug('Performing full memory analysis');

        try {
            // Récupérer toutes les métriques
            const allMetrics = this.metrics.getAll();

            // Analyse des tendances
            const trends = {
                systemMemoryTrend: this.calculateTrend(
                    allMetrics.map((m: MemoryMetrics) => ({ timestamp: m.timestamp, value: m.system.usagePercent }))
                ),
                heapMemoryTrend: this.calculateTrend(
                    allMetrics.map((m: MemoryMetrics) => ({ timestamp: m.timestamp, value: m.process.heapUsagePercent }))
                )
            };

            // Statistiques supplémentaires
            const stats = {
                averageSystemUsage: this.calculateAverage(allMetrics.map((m: MemoryMetrics) => m.system.usagePercent)),
                averageHeapUsage: this.calculateAverage(allMetrics.map((m: MemoryMetrics) => m.process.heapUsagePercent)),
                peakSystemUsage: Math.max(...allMetrics.map((m: MemoryMetrics) => m.system.usagePercent)),
                peakHeapUsage: Math.max(...allMetrics.map((m: MemoryMetrics) => m.process.heapUsagePercent)),
                volatility: this.calculateVolatility(allMetrics.map((m: MemoryMetrics) => m.process.heapUsagePercent))
            };

            this.logger.debug(`Memory trends: System ${trends.systemMemoryTrend}, Heap ${trends.heapMemoryTrend}`);

            this.logger.debug(`Memory statistics: Avg System: ${stats.averageSystemUsage.toFixed(2)}%, Avg Heap: ${stats.averageHeapUsage.toFixed(2)}%, Volatility: ${stats.volatility.toFixed(2)}`);

        } catch (error) {
            this.handleError('Error during full analysis', error);
        }
    }

    /**
     * Calcule la tendance d'une série temporelle
     */
    private calculateTrend(data: Array<{ timestamp: number, value: number }>): 'increasing' | 'decreasing' | 'stable' {
        if (data.length < 5) return 'stable'; // Pas assez de données

        // Calculer la pente de la tendance linéaire
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        // Normaliser les timestamps pour éviter des valeurs trop grandes
        const baseTime = data[0].timestamp;

        for (const point of data) {
            const x = (point.timestamp - baseTime) / 1000; // en secondes
            const y = point.value;

            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        // Interpréter la pente
        if (Math.abs(slope) < 0.01) {
            return 'stable';
        } else if (slope > 0) {
            return 'increasing';
        } else {
            return 'decreasing';
        }
    }

    /**
     * Calcule la moyenne d'un tableau de valeurs
     */
    private calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calcule la volatilité (écart-type) d'un tableau de valeurs
     */
    private calculateVolatility(values: number[]): number {
        if (values.length <= 1) return 0;

        const avg = this.calculateAverage(values);
        const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
        const variance = this.calculateAverage(squaredDiffs);

        return Math.sqrt(variance);
    }

    /**
     * Gère les erreurs du moniteur
     */
    private handleError(message: string, error: unknown): void {
        this.logger.error(`${message}: ${error}`);

        this.emit(MemoryEvents.ERROR, {
            message,
            error,
            timestamp: Date.now(),
            monitorId: this.monitorId
        } as ErrorEvent);
    }
}