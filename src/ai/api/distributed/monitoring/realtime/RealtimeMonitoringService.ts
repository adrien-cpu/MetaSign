/**
 * Service pour la surveillance en temps réel des métriques et de la santé du système
 */
import { EventEmitter } from 'events';
import { RealtimeMetricProcessor } from './RealtimeMetricProcessor';
import { AlertManager } from '@distributed/monitoring/realtime/alerts/AlertManager';
import { HealthChecker, HealthEvents } from './HealthChecker';
import { RealtimeMetric } from '@distributed/monitoring/types/metric.types';
import { Alert, AlertPriority, AlertSource, AlertType } from '@distributed/monitoring/types/alert.types';
import { HealthChangeEvent } from '@distributed/monitoring/types/health.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Les événements émis par le service de monitoring en temps réel
 */
export enum MonitoringEvents {
    MONITORING_STARTED = 'monitoring-started',
    MONITORING_STOPPED = 'monitoring-stopped',
    ALERT_TRIGGERED = 'alert-triggered',
    ERROR = 'error'
}

/**
 * Options pour le service de monitoring en temps réel
 */
export interface RealtimeMonitoringOptions {
    /** Interval de vérification des métriques (ms) */
    checkInterval?: number;
    /** Activer la journalisation détaillée */
    verboseLogging?: boolean;
    /** Auto-démarrage du service */
    autoStart?: boolean;
}

/**
 * Service responsable de la surveillance en temps réel des métriques et de la santé du système
 */
export class RealtimeMonitoringService extends EventEmitter {
    private readonly metricProcessor: RealtimeMetricProcessor;
    private readonly alertManager: AlertManager;
    private readonly healthChecker: HealthChecker;
    private readonly logger: Logger;
    private isRunning: boolean = false;
    private readonly options: RealtimeMonitoringOptions;

    /**
     * Crée une nouvelle instance du service de monitoring en temps réel
     * @param metricProcessor Processeur de métriques en temps réel
     * @param alertManager Gestionnaire d'alertes
     * @param healthChecker Vérificateur de santé
     * @param options Options de configuration
     */
    constructor(
        metricProcessor: RealtimeMetricProcessor,
        alertManager: AlertManager,
        healthChecker: HealthChecker,
        options: RealtimeMonitoringOptions = {}
    ) {
        super();
        this.metricProcessor = metricProcessor;
        this.alertManager = alertManager;
        this.healthChecker = healthChecker;
        this.options = options;
        this.logger = new Logger('RealtimeMonitoringService');

        // Configuration des événements internes
        super.setMaxListeners(20);

        // Auto-démarrage si configuré
        if (options.autoStart) {
            setTimeout(() => this.startMonitoring(), 0);
        }
    }

    /**
     * Démarre le service de monitoring en temps réel
     * @returns Promise résolue quand le monitoring est démarré
     */
    public async startMonitoring(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('Monitoring is already running, ignoring start request');
            return;
        }

        this.logger.info('Starting realtime monitoring services...');

        try {
            // Démarrer les composants de monitoring
            await Promise.all([
                this.metricProcessor.start(),
                this.healthChecker.start()
            ]);

            // Configurer les gestionnaires d'alertes
            this.setupAlertHandlers();

            this.isRunning = true;
            this.emit(MonitoringEvents.MONITORING_STARTED, { timestamp: Date.now() });
            this.logger.info('Realtime monitoring started successfully');
        } catch (error) {
            this.logger.error('Failed to start monitoring: %s', error);
            this.emit(MonitoringEvents.ERROR, {
                error,
                timestamp: Date.now(),
                message: 'Failed to start monitoring'
            });
            throw error;
        }
    }

    /**
     * Arrête le service de monitoring en temps réel
     * @returns Promise résolue quand le monitoring est arrêté
     */
    public async stopMonitoring(): Promise<void> {
        if (!this.isRunning) {
            this.logger.warn('Monitoring is not running, ignoring stop request');
            return;
        }

        this.logger.info('Stopping realtime monitoring services...');

        try {
            // Arrêter le processeur de métriques en temps réel
            await this.metricProcessor.stop();

            // Arrêter le vérificateur de santé
            this.healthChecker.stop();

            // Supprimer les gestionnaires d'événements
            this.cleanupEventHandlers();

            this.isRunning = false;
            this.emit(MonitoringEvents.MONITORING_STOPPED, { timestamp: Date.now() });
            this.logger.info('Realtime monitoring stopped successfully');
        } catch (error) {
            this.logger.error('Error stopping monitoring: %s', error);
            this.emit(MonitoringEvents.ERROR, {
                error,
                timestamp: Date.now(),
                message: 'Failed to stop monitoring'
            });
            throw error;
        }
    }

    /**
     * Configure les gestionnaires d'alertes
     * @private
     */
    private setupAlertHandlers(): void {
        this.metricProcessor.on('threshold-exceeded', this.handleThresholdAlert.bind(this));
        this.healthChecker.on(HealthEvents.HEALTH_CHANGED, this.handleHealthAlert.bind(this));
        this.healthChecker.on(HealthEvents.SYSTEM_UNHEALTHY, this.handleUnhealthySystem.bind(this));
        this.metricProcessor.on('error', this.handleProcessorError.bind(this));
        this.healthChecker.on(HealthEvents.ERROR, this.handleHealthCheckerError.bind(this));

        this.logger.debug('Alert handlers setup completed');
    }

    /**
     * Nettoie les gestionnaires d'événements
     * @private
     */
    private cleanupEventHandlers(): void {
        this.metricProcessor.removeAllListeners('threshold-exceeded');
        this.healthChecker.removeAllListeners(HealthEvents.HEALTH_CHANGED);
        this.healthChecker.removeAllListeners(HealthEvents.SYSTEM_UNHEALTHY);
        this.metricProcessor.removeAllListeners('error');
        this.healthChecker.removeAllListeners(HealthEvents.ERROR);

        this.logger.debug('Event handlers cleanup completed');
    }

    /**
     * Gère une alerte de dépassement de seuil
     * @param metric Métrique qui a déclenché l'alerte
     * @private
     */
    private async handleThresholdAlert(metric: RealtimeMetric): Promise<void> {
        this.logger.info('Threshold exceeded for metric: %s = %d', metric.name, metric.value);

        try {
            const alert = this.createThresholdAlert(metric);
            await this.alertManager.handleAlert(alert);

            // Émettre l'événement d'alerte pour les abonnés externes
            this.emit(MonitoringEvents.ALERT_TRIGGERED, {
                source: 'metric',
                metric,
                alert,
                timestamp: Date.now()
            });
        } catch (error) {
            this.logger.error('Failed to handle threshold alert: %s', error);
            this.emit(MonitoringEvents.ERROR, {
                error,
                timestamp: Date.now(),
                message: 'Failed to handle threshold alert',
                metric
            });
        }
    }

    /**
     * Gère une alerte de changement d'état de santé
     * @param event Événement de changement d'état de santé
     * @private
     */
    private async handleHealthAlert(event: HealthChangeEvent): Promise<void> {
        this.logger.info('Health state changed from %s to %s', event.from, event.to);

        try {
            const alert = this.createHealthAlert(event);
            await this.alertManager.handleAlert(alert);

            // Émettre l'événement d'alerte pour les abonnés externes
            this.emit(MonitoringEvents.ALERT_TRIGGERED, {
                source: 'health',
                event,
                alert,
                timestamp: Date.now()
            });
        } catch (error) {
            this.logger.error('Failed to handle health alert: %s', error);
            this.emit(MonitoringEvents.ERROR, {
                error,
                timestamp: Date.now(),
                message: 'Failed to handle health alert',
                event
            });
        }
    }

    /**
     * Gère un système passant à l'état "unhealthy"
     * @param event Événement de changement d'état de santé
     * @private
     */
    private async handleUnhealthySystem(event: HealthChangeEvent): Promise<void> {
        this.logger.warn('System is now UNHEALTHY, triggering high priority alert');

        try {
            const alert = this.createHealthAlert(event);
            // Augmenter la priorité pour un système malsain
            alert.priority = AlertPriority.HIGH;
            await this.alertManager.handleAlert(alert);
        } catch (error) {
            this.logger.error('Failed to handle unhealthy system alert: %s', error);
            this.emit(MonitoringEvents.ERROR, {
                error,
                timestamp: Date.now(),
                message: 'Failed to handle unhealthy system alert',
                event
            });
        }
    }

    /**
     * Gère une erreur du processeur de métriques
     * @param error Erreur
     * @private
     */
    private handleProcessorError(error: unknown): void {
        this.logger.error('Metric processor error: %s', error);
        this.emit(MonitoringEvents.ERROR, {
            error,
            timestamp: Date.now(),
            message: 'Metric processor error'
        });
    }

    /**
     * Gère une erreur du vérificateur de santé
     * @param error Erreur
     * @private
     */
    private handleHealthCheckerError(error: unknown): void {
        this.logger.error('Health checker error: %s', error);
        this.emit(MonitoringEvents.ERROR, {
            error,
            timestamp: Date.now(),
            message: 'Health checker error'
        });
    }

    /**
     * Crée une alerte de dépassement de seuil
     * @param metric Métrique qui a déclenché l'alerte
     * @returns Alerte créée
     * @private
     */
    private createThresholdAlert(metric: RealtimeMetric): Alert {
        return {
            id: `metric-${metric.name}-${Date.now()}`,
            type: AlertType.THRESHOLD,
            source: AlertSource.METRIC,
            priority: this.determineMetricPriority(metric),
            title: `Metric threshold exceeded: ${metric.name}`,
            message: `The metric ${metric.name} has exceeded its threshold with value ${metric.value}`,
            timestamp: Date.now(),
            data: {
                metric,
                thresholds: metric.thresholds
            }
        };
    }

    /**
     * Crée une alerte de changement d'état de santé
     * @param event Événement de changement d'état de santé
     * @returns Alerte créée
     * @private
     */
    private createHealthAlert(event: HealthChangeEvent): Alert {
        const priority = event.to === 'unhealthy' ?
            AlertPriority.HIGH :
            (event.to === 'degraded' ? AlertPriority.MEDIUM : AlertPriority.LOW);

        // Extraire les vérifications qui ont échoué
        const failedChecks = event.details.filter(check => check.status !== 'healthy');

        let message = `System health changed from ${event.from} to ${event.to}`;
        if (failedChecks.length > 0) {
            message += `. Failed checks: ${failedChecks.map(c => c.name).join(', ')}`;
        }

        return {
            id: `health-${event.to}-${Date.now()}`,
            type: AlertType.HEALTH,
            source: AlertSource.HEALTH,
            priority,
            title: `System health is now ${event.to.toUpperCase()}`,
            message,
            timestamp: event.timestamp,
            data: {
                event,
                failedChecks
            }
        };
    }

    /**
     * Détermine la priorité d'une alerte de métrique
     * @param metric Métrique
     * @returns Priorité de l'alerte
     * @private
     */
    private determineMetricPriority(metric: RealtimeMetric): AlertPriority {
        // Si les seuils critiques sont définis et dépassés
        if (metric.thresholds?.critical != null) {
            if (
                (metric.thresholds.criticalDirection === 'above' && metric.value > metric.thresholds.critical) ||
                (metric.thresholds.criticalDirection === 'below' && metric.value < metric.thresholds.critical)
            ) {
                return AlertPriority.HIGH;
            }
        }

        // Si les seuils d'avertissement sont définis et dépassés
        if (metric.thresholds?.warning != null) {
            if (
                (metric.thresholds.warningDirection === 'above' && metric.value > metric.thresholds.warning) ||
                (metric.thresholds.warningDirection === 'below' && metric.value < metric.thresholds.warning)
            ) {
                return AlertPriority.MEDIUM;
            }
        }

        // Par défaut, priorité basse
        return AlertPriority.LOW;
    }

    /**
     * Vérifie si le service de monitoring est en cours d'exécution
     * @returns true si le monitoring est en cours, false sinon
     */
    public isMonitoringRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Force une vérification immédiate de la santé du système
     * @returns Promise résolue avec l'état de santé actuel
     */
    public async checkHealthNow(): Promise<string> {
        if (!this.isRunning) {
            throw new Error('Monitoring is not running');
        }

        return this.healthChecker.checkNow();
    }

    /**
     * Récupère l'état de santé actuel du système
     * @returns État de santé actuel
     */
    public getCurrentHealth(): string {
        return this.healthChecker.getCurrentHealth();
    }
}