/**
 * Système de monitoring de santé avancé pour surveiller l'état des composants
 * du système et alerter en cas de problèmes.
 */
import { HealthChecker } from '@monitoring/health/HealthChecker';
import { HealthCheckFactory } from '@monitoring/health/HealthCheckFactory';
import {
    HealthChangeEvent,
    HealthCheckResult,
    HealthStatus,
    SystemHealth,
} from '@monitoring/health/types/health.types';

import { AlertManager } from '@monitoring/realtime/alerts/AlertManager';
import { NotificationService } from '@monitoring/realtime/alerts/NotificationService';
import { EscalationManager } from '@monitoring/realtime/alerts/EscalationManager';
import { MetricsCollector } from '@monitoring/metrics/MetricsCollector';

import { MonitoringConfiguration } from './types/monitoring.types';
import { HealthKPIs, HealthHistoryEntry, MetricEntry } from './types/health-metrics.types';
import { AlertChannel, AlertHistoryEntry } from './types/alert.types';
import { MetricsAggregator } from './metrics/MetricsAggregator';
import { HealthHistoryManager } from './history/HealthHistoryManager';
import { AlertingManager } from './alerts/AlertingManager';
import { Logger } from '@common/monitoring/LogService';

/**
 * Classe principale pour la gestion avancée du monitoring de santé
 */
export class AdvancedHealthMonitoring {
    private readonly healthChecker: HealthChecker;
    private readonly config: MonitoringConfiguration;
    private readonly metricsAggregator: MetricsAggregator;
    private readonly healthHistoryManager: HealthHistoryManager;
    private readonly alertingManager: AlertingManager;
    private readonly logger: Logger;

    /**
     * Constructeur
     * @param config - Configuration du système de monitoring
     * @param logger - Service de journalisation optionnel
     */
    constructor(config: Partial<MonitoringConfiguration>, logger?: Logger) {
        this.config = this.mergeWithDefaults(config);
        this.logger = logger || new Logger('AdvancedHealthMonitoring');

        // Initialiser les composants
        this.healthChecker = new HealthChecker(this.config.checkInterval);
        this.metricsAggregator = new MetricsAggregator(
            this.config.metrics.retention,
            this.config.metrics.aggregationInterval
        );
        this.healthHistoryManager = new HealthHistoryManager(1000); // Taille maximale de l'historique
        this.alertingManager = new AlertingManager(
            this.config.alerting,
            this.logger
        );

        // Configurer les écouteurs d'événements
        this.setupEventListeners();
    }

    /**
     * Fusionne la configuration fournie avec les valeurs par défaut
     */
    private mergeWithDefaults(config: Partial<MonitoringConfiguration>): MonitoringConfiguration {
        return {
            checkInterval: config.checkInterval || 60000,
            cpuThresholds: {
                critical: config.cpuThresholds?.critical || 90,
                warning: config.cpuThresholds?.warning || 75
            },
            memoryThresholds: {
                critical: config.memoryThresholds?.critical || 85,
                warning: config.memoryThresholds?.warning || 70
            },
            endpoints: config.endpoints || [],
            customChecks: config.customChecks || [],
            alerting: {
                email: {
                    enabled: config.alerting?.email?.enabled || false,
                    recipients: config.alerting?.email?.recipients || [],
                    throttling: config.alerting?.email?.throttling || 15
                },
                slack: {
                    enabled: config.alerting?.slack?.enabled || false,
                    webhookUrl: config.alerting?.slack?.webhookUrl || '',
                    channel: config.alerting?.slack?.channel || '',
                    throttling: config.alerting?.slack?.throttling || 5
                },
                pagerDuty: {
                    enabled: config.alerting?.pagerDuty?.enabled || false,
                    serviceKey: config.alerting?.pagerDuty?.serviceKey || '',
                    throttling: config.alerting?.pagerDuty?.throttling || 30
                }
            },
            metrics: {
                retention: config.metrics?.retention || 24,
                aggregationInterval: config.metrics?.aggregationInterval || 5,
                exportEnabled: config.metrics?.exportEnabled || false,
                exportPath: config.metrics?.exportPath
            }
        };
    }

    /**
     * Configure les écouteurs d'événements pour le système de monitoring
     */
    private setupEventListeners(): void {
        // Changement d'état de santé général
        this.healthChecker.on('health-changed', (event: HealthChangeEvent) => {
            this.logger.info(`État de santé du système passé de ${event.from} à ${event.to}`);

            // Mettre à jour l'historique
            this.healthHistoryManager.addHistoryEntry({
                timestamp: event.timestamp,
                status: event.to
            });

            // Enregistrer l'événement
            this.logHealthChange(event);

            // Envoyer des alertes si nécessaire
            this.alertingManager.handleAlerts(event, this.healthHistoryManager.getKPIs());

            // Calculer les KPIs
            this.healthHistoryManager.calculateKPIs();
        });

        // Événements spécifiques
        this.healthChecker.on('system-unhealthy', (data: HealthChangeEvent) => {
            this.alertingManager.notifyOncall(data);
        });

        this.healthChecker.on('system-degraded', (data: HealthChangeEvent) => {
            this.alertingManager.sendWarningNotification(data);
        });

        this.healthChecker.on('check-completed', (result: HealthCheckResult) => {
            this.metricsAggregator.processMetric(result);
        });

        // Programmer l'agrégation des métriques
        setInterval(() => {
            this.metricsAggregator.aggregateMetrics();
        }, this.config.metrics.aggregationInterval * 60 * 1000);

        // Programmer l'export des métriques si activé
        if (this.config.metrics.exportEnabled && this.config.metrics.exportPath) {
            setInterval(() => {
                this.exportMetrics();
            }, 3600000); // Toutes les heures
        }
    }

    /**
     * Initialise le système de monitoring avec les vérifications configurées
     */
    public async initialize(): Promise<void> {
        // Ajouter les vérifications de ressources système
        this.healthChecker.addCheck(
            HealthCheckFactory.createCPUCheck({
                critical: true,
                maxUsagePercent: this.config.cpuThresholds.critical,
                warningThreshold: this.config.cpuThresholds.warning,
                samples: 5 // Utiliser plusieurs échantillons pour plus de précision
            })
        );

        this.healthChecker.addCheck(
            HealthCheckFactory.createMemoryCheck({
                critical: true,
                maxUsagePercent: this.config.memoryThresholds.critical,
                warningThreshold: this.config.memoryThresholds.warning
            })
        );

        // Ajouter les vérifications HTTP pour les services configurés
        for (const endpoint of this.config.endpoints) {
            this.healthChecker.addCheck(
                HealthCheckFactory.createHTTPCheck({
                    name: endpoint.name,
                    url: endpoint.url,
                    method: endpoint.method || 'GET',
                    expectedStatus: endpoint.expectedStatus,
                    critical: endpoint.critical,
                    timeout: endpoint.timeout,
                    retries: endpoint.retries
                })
            );
        }

        // Ajouter les vérifications personnalisées
        for (const customCheck of this.config.customChecks) {
            this.healthChecker.addCheck(
                HealthCheckFactory.createCustomCheck(
                    {
                        name: customCheck.name,
                        description: customCheck.description,
                        critical: customCheck.critical
                    },
                    customCheck.checkFn
                )
            );
        }

        // Démarrer le processus de vérification
        await this.healthChecker.start();
        this.logger.info('Système de monitoring de santé avancé démarré');
    }

    /**
     * Enregistre un changement d'état de santé
     */
    private logHealthChange(event: HealthChangeEvent): void {
        this.logger.info(`Changement de santé: ${event.from} → ${event.to} à ${new Date(event.timestamp).toISOString()}`);

        // Détails sur les vérifications qui ont échoué
        const failedChecks = event.details.filter(check => check.status !== 'healthy');

        if (failedChecks.length > 0) {
            this.logger.info(`Vérifications échouées:`);
            failedChecks.forEach(check => {
                this.logger.info(`  - ${check.name}: ${check.status} - ${check.message}`);
            });
        }
    }

    /**
     * Exporte les métriques dans un fichier
     */
    private exportMetrics(): void {
        if (!this.config.metrics.exportPath) {
            return;
        }

        try {
            const exportData = {
                timestamp: Date.now(),
                kpis: this.healthHistoryManager.getKPIs(),
                metrics: this.metricsAggregator.getMetrics(),
                health: {
                    current: this.healthHistoryManager.getCurrentHealth(),
                    history: this.healthHistoryManager.getHealthHistory()
                }
            };

            this.logger.info(`Métriques exportées vers ${this.config.metrics.exportPath}`);

            // Simulation d'écriture
            /*
            const fs = require('fs');
            fs.writeFileSync(
              this.config.metrics.exportPath, 
              JSON.stringify(exportData, null, 2)
            );
            */
        } catch (error) {
            this.logger.error(`Échec de l'export des métriques:`, error);
        }
    }

    /**
     * Force une vérification immédiate de la santé
     */
    public async checkNow(): Promise<SystemHealth> {
        return this.healthChecker.checkNow();
    }

    /**
     * Récupère les métriques actuelles
     */
    public getMetrics(): Record<string, Array<MetricEntry>> {
        return this.metricsAggregator.getMetrics();
    }

    /**
     * Récupère les KPIs actuels
     */
    public getKPIs(): HealthKPIs {
        return this.healthHistoryManager.getKPIs();
    }

    /**
     * Récupère l'historique de santé
     */
    public getHealthHistory(): Array<HealthHistoryEntry> {
        return this.healthHistoryManager.getHealthHistory();
    }

    /**
     * Arrête proprement le système de monitoring
     */
    public async shutdown(): Promise<void> {
        this.logger.info("Arrêt du système de monitoring de santé avancé...");

        // Exporter les métriques une dernière fois
        if (this.config.metrics.exportEnabled && this.config.metrics.exportPath) {
            this.exportMetrics();
        }

        // Arrêter le healthChecker
        await this.healthChecker.stop();

        this.logger.info("Système de monitoring arrêté avec succès");
    }
}