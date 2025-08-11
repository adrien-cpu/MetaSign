/**
 * Exemple avancé d'utilisation du système de monitoring de santé
 * avec intégration à d'autres systèmes et configurations avancées
 */
import { HealthChecker } from './HealthChecker';
import { HealthCheckFactory } from './HealthCheckFactory';
import {
    HealthChangeEvent,
    HealthCheckResult,
    HealthStatus,
    SystemHealth,
    ThresholdConfig
} from '../health/types/health.types';

// Configuration globale du système de monitoring
interface MonitoringConfiguration {
    /** Intervalle entre les vérifications en ms */
    checkInterval: number;

    /** Seuils CPU */
    cpuThresholds: {
        critical: number;
        warning: number;
    };

    /** Seuils mémoire */
    memoryThresholds: {
        critical: number;
        warning: number;
    };

    /** Endpoints à surveiller */
    endpoints: Array<{
        name: string;
        url: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
        expectedStatus: number[];
        critical: boolean;
        timeout?: number;
        retries?: number;
    }>;

    /** Vérifications spéciales */
    customChecks: Array<{
        name: string;
        description: string;
        critical: boolean;
        checkFn: () => Promise<{ status: SystemHealth; message: string; details?: Record<string, unknown> }>;
    }>;

    /** Configuration des alertes */
    alerting: {
        email?: {
            enabled: boolean;
            recipients: string[];
            throttling: number; // Minutes entre deux alertes
        };
        slack?: {
            enabled: boolean;
            webhookUrl: string;
            channel: string;
            throttling: number; // Minutes entre deux alertes
        };
        pagerDuty?: {
            enabled: boolean;
            serviceKey: string;
            throttling: number; // Minutes entre deux alertes
        }
    };

    /** Configuration de persistance des métriques */
    metrics: {
        retention: number; // Heures de rétention
        aggregationInterval: number; // Minutes entre chaque agrégation
        exportEnabled: boolean;
        exportPath?: string;
    };
}

/**
 * Classe avancée pour la gestion du monitoring de santé
 */
class AdvancedHealthMonitoring {
    private readonly healthChecker: HealthChecker;
    private readonly config: MonitoringConfiguration;

    // Garde la trace des alertes envoyées pour éviter les alertes en cascade
    private alertHistory: Map<string, number> = new Map();

    // Historique des états de santé
    private healthHistory: Array<{ timestamp: number; status: SystemHealth; }> = [];

    // Indicateurs de performance clés calculés
    private kpis: {
        uptime: number;
        mtbf: number; // Mean Time Between Failures
        mttr: number; // Mean Time To Recovery
        lastFailure: number | null;
        failureCount: number;
    } = {
            uptime: 100,
            mtbf: 0,
            mttr: 0,
            lastFailure: null,
            failureCount: 0
        };

    // Métriques agrégées
    private aggregatedMetrics: Map<string, Array<{ timestamp: number; value: number; }>> = new Map();

    /**
     * Constructeur
     * @param config - Configuration du système de monitoring
     */
    constructor(config: MonitoringConfiguration) {
        this.config = this.mergeWithDefaults(config);
        this.healthChecker = new HealthChecker(this.config.checkInterval);

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
            console.log(`État de santé du système passé de ${event.from} à ${event.to}`);

            // Mettre à jour l'historique
            this.updateHealthHistory(event);

            // Enregistrer l'événement
            this.logHealthChange(event);

            // Envoyer des alertes si nécessaire
            this.handleAlerts(event);

            // Calculer les KPIs
            this.calculateKPIs();
        });

        // Événements spécifiques
        this.healthChecker.on('system-unhealthy', (data: HealthChangeEvent) => {
            this.notifyOncall(data);
        });

        this.healthChecker.on('system-degraded', (data: HealthChangeEvent) => {
            this.sendWarningNotification(data);
        });

        this.healthChecker.on('check-completed', (result: HealthCheckResult) => {
            this.processMetric(result);
        });

        // Programmer l'agrégation des métriques
        setInterval(() => {
            this.aggregateMetrics();
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
        console.log('Système de monitoring de santé avancé démarré');
    }

    /**
     * Mettre à jour l'historique de santé
     */
    private updateHealthHistory(event: HealthChangeEvent): void {
        this.healthHistory.push({
            timestamp: event.timestamp,
            status: event.to
        });

        // Limiter la taille de l'historique
        const maxHistorySize = 1000;
        if (this.healthHistory.length > maxHistorySize) {
            this.healthHistory = this.healthHistory.slice(-maxHistorySize);
        }
    }

    /**
     * Calculer les indicateurs de performance clés
     */
    private calculateKPIs(): void {
        if (this.healthHistory.length < 2) {
            return; // Pas assez de données pour calculer
        }

        const now = Date.now();
        const historyLengthMs = now - this.healthHistory[0].timestamp;

        // Calculer le temps total en état unhealthy
        let unhealthyTimeMs = 0;
        let lastTransition = this.healthHistory[0].timestamp;
        let lastStatus = this.healthHistory[0].status;

        for (let i = 1; i < this.healthHistory.length; i++) {
            const entry = this.healthHistory[i];

            if (lastStatus === 'unhealthy') {
                unhealthyTimeMs += entry.timestamp - lastTransition;

                // Si on passe de unhealthy à autre chose, c'est une récupération
                if (entry.status !== 'unhealthy' && this.kpis.lastFailure !== null) {
                    const recoveryTime = entry.timestamp - this.kpis.lastFailure;
                    this.kpis.mttr = (this.kpis.mttr * (this.kpis.failureCount - 1) + recoveryTime) / this.kpis.failureCount;
                }
            }

            // Si on passe à unhealthy, c'est une nouvelle panne
            if (entry.status === 'unhealthy' && lastStatus !== 'unhealthy') {
                this.kpis.failureCount++;
                this.kpis.lastFailure = entry.timestamp;

                // Calculer le MTBF si ce n'est pas la première panne
                if (this.kpis.failureCount > 1) {
                    const timeSinceLastFailure = entry.timestamp - (this.healthHistory[i - 1].timestamp);
                    this.kpis.mtbf = (this.kpis.mtbf * (this.kpis.failureCount - 2) + timeSinceLastFailure) / (this.kpis.failureCount - 1);
                }
            }

            lastTransition = entry.timestamp;
            lastStatus = entry.status;
        }

        // Ajouter le temps jusqu'à maintenant si l'état actuel est unhealthy
        if (lastStatus === 'unhealthy') {
            unhealthyTimeMs += now - lastTransition;
        }

        // Calculer le uptime
        this.kpis.uptime = 100 - (unhealthyTimeMs / historyLengthMs * 100);
    }

    /**
     * Traite une métrique provenant d'une vérification de santé
     */
    private processMetric(result: HealthCheckResult): void {
        // Créer une entrée pour chaque métrique si elle n'existe pas déjà
        const metricName = `health_check.${result.name}`;
        if (!this.aggregatedMetrics.has(metricName)) {
            this.aggregatedMetrics.set(metricName, []);
        }

        // Ajouter les données de base (status comme valeur numérique)
        const statusValue = result.status === 'healthy' ? 2 : (result.status === 'degraded' ? 1 : 0);
        const timestamp = typeof result.timestamp === 'string'
            ? new Date(result.timestamp).getTime()
            : result.timestamp;

        const metrics = this.aggregatedMetrics.get(metricName)!;
        metrics.push({
            timestamp,
            value: statusValue
        });

        // Limiter la taille des métriques selon la rétention configurée
        const retentionMs = this.config.metrics.retention * 3600 * 1000;
        const oldestAllowed = Date.now() - retentionMs;

        const filteredMetrics = metrics.filter(m => m.timestamp >= oldestAllowed);
        this.aggregatedMetrics.set(metricName, filteredMetrics);

        // Traiter les métriques spécifiques contenues dans les détails
        if (result.details) {
            for (const [key, value] of Object.entries(result.details)) {
                if (typeof value === 'number') {
                    const detailMetricName = `${metricName}.${key}`;

                    if (!this.aggregatedMetrics.has(detailMetricName)) {
                        this.aggregatedMetrics.set(detailMetricName, []);
                    }

                    const detailMetrics = this.aggregatedMetrics.get(detailMetricName)!;
                    detailMetrics.push({
                        timestamp,
                        value
                    });

                    // Appliquer également la rétention
                    const filteredDetailMetrics = detailMetrics.filter(m => m.timestamp >= oldestAllowed);
                    this.aggregatedMetrics.set(detailMetricName, filteredDetailMetrics);
                }
            }
        }
    }

    /**
     * Agrège les métriques pour réduire leur volume
     */
    private aggregateMetrics(): void {
        const now = Date.now();
        const aggregationWindowMs = this.config.metrics.aggregationInterval * 60 * 1000;

        // Pour chaque type de métrique
        for (const [metricName, metrics] of this.aggregatedMetrics.entries()) {
            if (metrics.length <= 1) {
                continue; // Pas besoin d'agréger
            }

            const aggregatedData: Array<{ timestamp: number; value: number; }> = [];
            let currentBucket: Array<{ timestamp: number; value: number; }> = [];
            let currentBucketTimestamp = 0;

            // Grouper par fenêtre de temps
            for (const metric of metrics) {
                const bucketTimestamp = Math.floor(metric.timestamp / aggregationWindowMs) * aggregationWindowMs;

                if (bucketTimestamp !== currentBucketTimestamp && currentBucket.length > 0) {
                    // Calculer la moyenne pour le bucket actuel
                    const sum = currentBucket.reduce((acc, m) => acc + m.value, 0);
                    const avg = sum / currentBucket.length;

                    aggregatedData.push({
                        timestamp: currentBucketTimestamp,
                        value: avg
                    });

                    currentBucket = [];
                }

                currentBucketTimestamp = bucketTimestamp;
                currentBucket.push(metric);
            }

            // Traiter le dernier bucket
            if (currentBucket.length > 0) {
                const sum = currentBucket.reduce((acc, m) => acc + m.value, 0);
                const avg = sum / currentBucket.length;

                aggregatedData.push({
                    timestamp: currentBucketTimestamp,
                    value: avg
                });
            }

            // Remplacer les données originales par les données agrégées
            this.aggregatedMetrics.set(metricName, aggregatedData);
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
                kpis: this.kpis,
                metrics: Object.fromEntries(this.aggregatedMetrics),
                health: {
                    current: this.healthHistory.length > 0 ? this.healthHistory[this.healthHistory.length - 1].status : 'unknown',
                    history: this.healthHistory
                }
            };

            // Dans une implémentation réelle:
            // - Utiliser fs.writeFile pour écrire dans un fichier
            // - Ou envoyer à un système de stockage externe (ElasticSearch, InfluxDB, etc.)
            console.log(`[EXPORT] Métriques exportées vers ${this.config.metrics.exportPath}`);

            // Simulation d'écriture
            /*
            const fs = require('fs');
            fs.writeFileSync(
              this.config.metrics.exportPath, 
              JSON.stringify(exportData, null, 2)
            );
            */
        } catch (error) {
            console.error(`[ERROR] Échec de l'export des métriques:`, error);
        }
    }

    /**
     * Vérifie si une alerte peut être envoyée (gestion du throttling)
     */
    private canSendAlert(channel: string): boolean {
        const now = Date.now();
        const lastAlertTime = this.alertHistory.get(channel) || 0;

        let throttlingMinutes = 5; // Par défaut

        // Récupérer le temps de throttling configuré
        if (channel.startsWith('email') && this.config.alerting.email?.enabled) {
            throttlingMinutes = this.config.alerting.email.throttling;
        } else if (channel.startsWith('slack') && this.config.alerting.slack?.enabled) {
            throttlingMinutes = this.config.alerting.slack.throttling;
        } else if (channel.startsWith('pagerduty') && this.config.alerting.pagerDuty?.enabled) {
            throttlingMinutes = this.config.alerting.pagerDuty.throttling;
        }

        const throttlingMs = throttlingMinutes * 60 * 1000;

        if (now - lastAlertTime < throttlingMs) {
            return false;
        }

        // Mettre à jour le dernier temps d'alerte
        this.alertHistory.set(channel, now);
        return true;
    }

    /**
     * Traitement des alertes selon la configuration
     */
    private handleAlerts(event: HealthChangeEvent): void {
        // Gérer les alertes email
        if (this.config.alerting.email?.enabled &&
            this.config.alerting.email.recipients.length > 0 &&
            event.to === 'unhealthy') {

            if (this.canSendAlert('email.unhealthy')) {
                this.sendEmailAlert(event);
            }
        }

        // Gérer les alertes Slack
        if (this.config.alerting.slack?.enabled &&
            this.config.alerting.slack.webhookUrl &&
            (event.to === 'unhealthy' || event.to === 'degraded')) {

            const alertKey = `slack.${event.to}`;
            if (this.canSendAlert(alertKey)) {
                this.sendSlackAlert(event);
            }
        }

        // Gérer les alertes PagerDuty (uniquement pour unhealthy)
        if (this.config.alerting.pagerDuty?.enabled &&
            this.config.alerting.pagerDuty.serviceKey &&
            event.to === 'unhealthy') {

            if (this.canSendAlert('pagerduty.unhealthy')) {
                this.sendPagerDutyAlert(event);
            }
        }
    }

    /**
     * Enregistre un changement d'état de santé
     */
    private logHealthChange(event: HealthChangeEvent): void {
        console.log(`[LOG] Changement de santé: ${event.from} → ${event.to} à ${new Date(event.timestamp).toISOString()}`);

        // Détails sur les vérifications qui ont échoué
        const failedChecks = event.details.filter(check => check.status !== 'healthy');

        if (failedChecks.length > 0) {
            console.log(`[LOG] Vérifications échouées:`);
            failedChecks.forEach(check => {
                console.log(`  - ${check.name}: ${check.status} - ${check.message}`);
            });
        }

        // Dans une vraie implémentation:
        // - Enregistrer dans une base de données
        // - Envoyer à un service de logging centralisé (ELK, Graylog, etc.)
        // - Enregistrer dans un fichier structuré
    }

    /**
     * Envoie une alerte par email
     */
    private sendEmailAlert(event: HealthChangeEvent): void {
        console.log(`[EMAIL] Envoi d'alerte par email à ${this.config.alerting.email?.recipients.join(', ')}`);
        console.log(`[EMAIL] Sujet: ALERTE - Système en état critique`);

        // Construire le corps du message
        let body = `L'état du système est passé de ${event.from} à ${event.to} à ${new Date(event.timestamp).toISOString()}.\n\n`;

        const failedChecks = event.details.filter(check => check.status !== 'healthy');
        if (failedChecks.length > 0) {
            body += "Vérifications échouées:\n";
            failedChecks.forEach(check => {
                body += `  - ${check.name}: ${check.status} - ${check.message}\n`;
            });
        }

        body += `\nKPIs du système:\n`;
        body += `  - Uptime: ${this.kpis.uptime.toFixed(2)}%\n`;
        body += `  - MTBF: ${(this.kpis.mtbf / (3600 * 1000)).toFixed(2)} heures\n`;
        body += `  - MTTR: ${(this.kpis.mttr / (60 * 1000)).toFixed(2)} minutes\n`;

        console.log(`[EMAIL] Corps: ${body}`);

        // Dans une vraie implémentation:
        // - Utiliser nodemailer ou un service d'email API pour envoyer l'email
        // - Inclure plus de détails, formatage HTML, etc.
    }

    /**
     * Envoie une alerte Slack
     */
    private sendSlackAlert(event: HealthChangeEvent): void {
        if (!this.config.alerting.slack) return;

        console.log(`[SLACK] Envoi d'alerte Slack à ${this.config.alerting.slack.channel}`);

        // Déterminer la couleur selon l'état
        const color = event.to === 'unhealthy' ? 'danger' : (event.to === 'degraded' ? 'warning' : 'good');

        // Construire le message Slack
        const failedChecks = event.details.filter(check => check.status !== 'healthy');

        const message = {
            channel: this.config.alerting.slack.channel,
            attachments: [
                {
                    color,
                    title: `Alerte de santé: ${event.to.toUpperCase()}`,
                    text: `L'état du système est passé de ${event.from} à ${event.to}`,
                    fields: [
                        {
                            title: "Timestamp",
                            value: new Date(event.timestamp).toISOString(),
                            short: true
                        },
                        {
                            title: "Uptime",
                            value: `${this.kpis.uptime.toFixed(2)}%`,
                            short: true
                        }
                    ],
                    footer: "Système de Monitoring Avancé"
                }
            ]
        };

        // Ajouter un attachment pour chaque vérification échouée
        if (failedChecks.length > 0) {
            failedChecks.forEach(check => {
                message.attachments.push({
                    color,
                    title: `Échec: ${check.name}`,
                    text: check.message,
                    fields: [
                        {
                            title: "Statut",
                            value: check.status,
                            short: true
                        },
                        {
                            title: "Timestamp",
                            value: typeof check.timestamp === 'string'
                                ? check.timestamp
                                : new Date(check.timestamp).toISOString(),
                            short: true
                        }
                    ]
                });
            });
        }

        console.log(`[SLACK] Message préparé pour webhook ${this.config.alerting.slack.webhookUrl}`);

        // Dans une vraie implémentation:
        // - Utiliser axios ou node-fetch pour envoyer la requête HTTP à l'API Slack
        // - Gérer les réponses et erreurs
    }

    /**
     * Envoie une alerte PagerDuty
     */
    private sendPagerDutyAlert(event: HealthChangeEvent): void {
        if (!this.config.alerting.pagerDuty) return;

        console.log(`[PAGERDUTY] Déclenchement d'une alerte d'incident PagerDuty`);

        // Identifier les vérifications échouées
        const failedChecks = event.details.filter(check => check.status === 'unhealthy');

        // Créer un incident unique
        const incidentKey = `health_incident_${Date.now()}`;

        // Construire le payload
        const payload = {
            service_key: this.config.alerting.pagerDuty.serviceKey,
            event_type: "trigger",
            incident_key: incidentKey,
            description: `Système en état UNHEALTHY - ${failedChecks.length} vérifications critiques échouées`,
            client: "Système de Monitoring Avancé",
            client_url: "https://monitoring.example.com/dashboard", // URL vers votre dashboard
            details: {
                failedChecks: failedChecks.map(check => ({
                    name: check.name,
                    message: check.message,
                    timestamp: check.timestamp
                })),
                kpis: this.kpis
            }
        };

        console.log(`[PAGERDUTY] Payload préparé pour incident ${incidentKey}`);

        // Dans une vraie implémentation:
        // - Utiliser l'API PagerDuty pour déclencher l'incident
        // - Gérer l'état des incidents (aussi les résoudre automatiquement une fois réparés)
    }

    /**
     * Notifie l'équipe d'astreinte
     */
    private notifyOncall(event: HealthChangeEvent): void {
        console.log(`[ONCALL] Notification à l'équipe d'astreinte concernant un état malsain`);

        // Cette méthode pourrait être utilisée pour des actions spécifiques:
        // - Appels téléphoniques automatisés
        // - SMS d'urgence
        // - Activation de procédures d'escalade spécifiques
    }

    /**
     * Envoie une notification d'avertissement
     */
    private sendWarningNotification(event: HealthChangeEvent): void {
        console.log(`[WARNING] Système dégradé! Vérifier les composants affectés`);

        // Cette méthode pourrait être utilisée pour des notifications moins urgentes:
        // - Emails à l'équipe de support
        // - Messages dans un canal Slack dédié aux avertissements
        // - Mise à jour d'un dashboard
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
    public getMetrics(): Record<string, Array<{ timestamp: number; value: number; }>> {
        return Object.fromEntries(this.aggregatedMetrics);
    }

    /**
     * Récupère les KPIs actuels
     */
    public getKPIs(): typeof this.kpis {
        return { ...this.kpis };
    }

    /**
     * Récupère l'historique de santé
     */
    public getHealthHistory(): typeof this.healthHistory {
        return [...this.healthHistory];
    }

    /**
     * Arrête proprement le système de monitoring
     */
    public async shutdown(): Promise<void> {
        console.log("Arrêt du système de monitoring de santé avancé...");

        // Exporter les métriques une dernière fois
        if (this.config.metrics.exportEnabled && this.config.metrics.exportPath) {
            this.exportMetrics();
        }

        // Arrêter le healthChecker
        await this.healthChecker.stop();

        console.log("Système de monitoring arrêté avec succès");
    }
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
    try {
        // Configuration avancée
        const monitoringConfig: MonitoringConfiguration = {
            checkInterval: 30000, // 30 secondes

            // Seuils CPU
            cpuThresholds: {
                critical: 90,
                warning: 75
            },

            // Seuils mémoire
            memoryThresholds: {
                critical: 85,
                warning: 70
            },

            // Points d'extrémité à surveiller
            endpoints: [
                {
                    name: 'api-gateway',
                    url: 'https://api.example.com/health',
                    method: 'GET',
                    expectedStatus: [200],
                    critical: true,
                    timeout: 5000,
                    retries: 2
                },
                {
                    name: 'database-service',
                    url: 'https://db.example.com/health',
                    method: 'GET',
                    expectedStatus: [200, 203],
                    critical: true,
                    timeout: 3000,
                    retries: 3
                },
                {
                    name: 'auth-service',
                    url: 'https://auth.example.com/health',
                    method: 'GET',
                    expectedStatus: [200],
                    critical: true,
                    timeout: 3000
                },
                {
                    name: 'analytics-service',
                    url: 'https://analytics.example.com/health',
                    method: 'GET',
                    expectedStatus: [200],
                    critical: false, // Service non critique
                    timeout: 10000
                }
            ],

            // Vérifications personnalisées
            customChecks: [
                {
                    name: 'business-logic',
                    description: 'Vérifie la logique métier critique',
                    critical: true,
                    checkFn: async () => {
                        // Simuler une vérification de logique métier
                        const isHealthy = Math.random() > 0.1; // 90% de chance d'être en bonne santé

                        return {
                            status: isHealthy ? 'healthy' : 'unhealthy',
                            message: isHealthy
                                ? 'La logique métier fonctionne correctement'
                                : 'Problèmes détectés dans la logique métier',
                            details: {
                                lastVerified: Date.now(),
                                responseTime: Math.random() * 500 + 50 // 50-550ms
                            }
                        };
                    }
                },
                {
                    name: 'data-integrity',
                    description: 'Vérifie l\'intégrité des données',
                    critical: false,
                    checkFn: async () => {
                        // Simuler une vérification d'intégrité des données
                        const integrity = Math.random();
                        let status: SystemHealth = 'healthy';
                        let message = '';

                        if (integrity < 0.05) {
                            status = 'unhealthy';
                            message = 'Corruption de données détectée';
                        } else if (integrity < 0.15) {
                            status = 'degraded';
                            message = 'Incohérences mineures détectées';
                        } else {
                            message = 'Intégrité des données vérifiée avec succès';
                        }

                        return {
                            status,
                            message,
                            details: {
                                integrityScore: integrity * 100,
                                recordsChecked: Math.floor(Math.random() * 10000 + 1000)
                            }
                        };
                    }
                }
            ],

            // Configuration des alertes
            alerting: {
                email: {
                    enabled: true,
                    recipients: ['sysadmin@example.com', 'oncall@example.com'],
                    throttling: 15 // 15 minutes entre les alertes
                },
                slack: {
                    enabled: true,
                    webhookUrl: 'https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
                    channel: '#system-alerts',
                    throttling: 5 // 5 minutes entre les alertes
                },
                pagerDuty: {
                    enabled: true,
                    serviceKey: 'a1b2c3d4e5f6g7h8i9j0',
                    throttling: 30 // 30 minutes entre les alertes
                }
            },

            // Configuration des métriques
            metrics: {
                retention: 24, // 24 heures
                aggregationInterval: 5, // 5 minutes
                exportEnabled: true,
                exportPath: './health_metrics.json'
            }
        };

        // Créer et initialiser le moniteur avancé
        const monitor = new AdvancedHealthMonitoring(monitoringConfig);
        await monitor.initialize();

        console.log("Système de monitoring démarré. Appuyez sur Ctrl+C pour quitter.");

        // Forcer une vérification après 10 secondes et afficher des statistiques
        setTimeout(async () => {
            await monitor.checkNow();

            console.log("\n--- Statistiques de monitoring ---");

            const kpis = monitor.getKPIs();
            console.log(`Uptime: ${kpis.uptime.toFixed(2)}%`);
            console.log(`MTBF: ${(kpis.mtbf / (3600 * 1000)).toFixed(2)} heures`);
            console.log(`MTTR: ${(kpis.mttr / (60 * 1000)).toFixed(2)} minutes`);
            console.log(`Nombre de pannes: ${kpis.failureCount}`);

            console.log("\n--- Dernières métriques ---");
            const metrics = monitor.getMetrics();

            for (const [metricName, metricValues] of Object.entries(metrics)) {
                if (metricValues.length > 0) {
                    const lastMetric = metricValues[metricValues.length - 1];
                    console.log(`${metricName}: ${lastMetric.value.toFixed(2)} (${new Date(lastMetric.timestamp).toISOString()})`);
                }
            }

            console.log("\nSurveillance en cours...");
        }, 10000);

        // Gérer l'arrêt propre
        process.on('SIGINT', async () => {
            console.log("\nArrêt en cours...");
            await monitor.shutdown();
            process.exit(0);
        });

    } catch (error) {
        console.error("Erreur lors de l'initialisation du monitoring:", error);
        process.exit(1);
    }
}

// Exécuter le programme si ce fichier est exécuté directement
if (require.main === module) {
    main().catch(console.error);
}

// Exporter les classes et fonctions utiles
export { AdvancedHealthMonitoring, MonitoringConfiguration };