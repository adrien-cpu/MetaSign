/**
 * Gestion des alertes du système de monitoring
 */
import { HealthChangeEvent, HealthCheckResult } from '@distributed/monitoring/health/types/health.types';
import { AlertChannel, AlertHistoryEntry, AlertMessage } from '../types/alert.types';
import { HealthKPIs } from '../types/health-metrics.types';
import { AlertingConfiguration } from '../types/monitoring.types';
import { Logger } from '@common/monitoring/LogService';
import { EmailAlertAdapter } from './adapters/EmailAlertAdapter';
import { SlackAlertAdapter } from './adapters/SlackAlertAdapter';
import { PagerDutyAlertAdapter } from './adapters/PagerDutyAlertAdapter';

/**
 * Classe responsable de la gestion des alertes
 */
export class AlertingManager {
    private readonly logger: Logger;
    private readonly config: AlertingConfiguration;

    // Adaptateurs spécifiques pour chaque canal d'alerte
    private readonly emailAdapter: EmailAlertAdapter;
    private readonly slackAdapter: SlackAlertAdapter;
    private readonly pagerDutyAdapter: PagerDutyAlertAdapter;

    // Historique des alertes envoyées
    private alertHistory: Array<AlertHistoryEntry> = [];

    /**
     * Constructeur
     * @param config Configuration des alertes
     * @param logger Service de journalisation
     */
    constructor(config: AlertingConfiguration, logger: Logger) {
        this.config = config;
        this.logger = logger;

        // Initialiser les adaptateurs
        this.emailAdapter = new EmailAlertAdapter(logger);
        this.slackAdapter = new SlackAlertAdapter(logger);
        this.pagerDutyAdapter = new PagerDutyAlertAdapter(logger);
    }

    /**
     * Traitement des alertes selon la configuration
     * @param event Événement de changement d'état
     * @param kpis KPIs actuels du système
     */
    public async handleAlerts(event: HealthChangeEvent, kpis: HealthKPIs): Promise<void> {
        // Gérer les alertes email
        if (this.config.email?.enabled &&
            this.config.email.recipients.length > 0 &&
            event.to === 'unhealthy') {

            const key = `${AlertChannel.EMAIL}.unhealthy`;
            if (this.emailAdapter.canSendAlert(key, this.config.email.throttling)) {
                await this.sendEmailAlert(event, kpis);
                this.trackAlert(AlertChannel.EMAIL, 'critical', `Système en état critique (${event.to})`);
            }
        }

        // Gérer les alertes Slack
        if (this.config.slack?.enabled &&
            this.config.slack.webhookUrl &&
            (event.to === 'unhealthy' || event.to === 'degraded')) {

            const severity = event.to === 'unhealthy' ? 'critical' : 'warning';
            const key = `${AlertChannel.SLACK}.${event.to}`;
            if (this.slackAdapter.canSendAlert(key, this.config.slack.throttling)) {
                await this.sendSlackAlert(event, kpis);
                this.trackAlert(AlertChannel.SLACK, severity, `Alerte système: ${event.to}`);
            }
        }

        // Gérer les alertes PagerDuty (uniquement pour unhealthy)
        if (this.config.pagerDuty?.enabled &&
            this.config.pagerDuty.serviceKey &&
            event.to === 'unhealthy') {

            const key = `${AlertChannel.PAGER_DUTY}.unhealthy`;
            if (this.pagerDutyAdapter.canSendAlert(key, this.config.pagerDuty.throttling)) {
                await this.sendPagerDutyAlert(event, kpis);
                this.trackAlert(AlertChannel.PAGER_DUTY, 'critical', `Incident système: ${event.to}`);
            }
        }
    }

    /**
     * Suivi des alertes envoyées
     * @param channel Canal d'alerte utilisé
     * @param severity Sévérité de l'alerte
     * @param message Message d'alerte
     */
    private trackAlert(channel: AlertChannel, severity: 'critical' | 'warning' | 'info', message: string): void {
        this.alertHistory.push({
            channel,
            timestamp: Date.now(),
            severity,
            message
        });

        // Limiter la taille de l'historique
        const maxHistorySize = 100;
        if (this.alertHistory.length > maxHistorySize) {
            this.alertHistory = this.alertHistory.slice(-maxHistorySize);
        }
    }

    /**
     * Envoie une alerte par email
     * @param event Événement de changement d'état
     * @param kpis KPIs actuels du système
     */
    private async sendEmailAlert(event: HealthChangeEvent, kpis: HealthKPIs): Promise<void> {
        if (!this.config.email?.recipients.length) return;

        this.logger.info(`Envoi d'alerte par email à ${this.config.email.recipients.join(', ')}`);

        // Construire le corps du message
        let body = `L'état du système est passé de ${event.from} à ${event.to} à ${new Date(event.timestamp).toISOString()}.\n\n`;

        const failedChecks = event.details.filter((check: HealthCheckResult) => check.status !== 'healthy');
        if (failedChecks.length > 0) {
            body += "Vérifications échouées:\n";
            failedChecks.forEach((check: HealthCheckResult) => {
                body += `  - ${check.name}: ${check.status} - ${check.message}\n`;
            });
        }

        body += `\nKPIs du système:\n`;
        body += `  - Uptime: ${kpis.uptime.toFixed(2)}%\n`;
        body += `  - MTBF: ${(kpis.mtbf / (3600 * 1000)).toFixed(2)} heures\n`;
        body += `  - MTTR: ${(kpis.mttr / (60 * 1000)).toFixed(2)} minutes\n`;

        const message: AlertMessage = {
            title: `ALERTE - Système en état critique`,
            body,
            severity: 'critical',
            details: {
                failedChecks,
                kpis
            }
        };

        // Utiliser l'adaptateur email pour envoyer l'alerte
        try {
            await this.emailAdapter.sendAlert(message, {
                enabled: true,
                throttling: this.config.email.throttling,
                config: {
                    recipients: this.config.email.recipients
                }
            });
        } catch (error) {
            this.logger.error(`Échec de l'envoi d'alerte par email`, error);
        }
    }

    /**
     * Envoie une alerte Slack
     * @param event Événement de changement d'état
     * @param kpis KPIs actuels du système
     */
    private async sendSlackAlert(event: HealthChangeEvent, kpis: HealthKPIs): Promise<void> {
        if (!this.config.slack?.webhookUrl) return;

        this.logger.info(`Envoi d'alerte Slack à ${this.config.slack.channel}`);

        // Déterminer la couleur selon l'état
        const severity = event.to === 'unhealthy' ? 'critical' : 'warning';
        const color = severity === 'critical' ? 'danger' : 'warning';

        // Extraire les vérifications qui ont échoué
        const failedChecks = event.details.filter((check: HealthCheckResult) => check.status !== 'healthy');

        // Construire les données de message Slack
        const details = {
            channel: this.config.slack.channel,
            color,
            attachments: failedChecks.map((check: HealthCheckResult) => ({
                title: `Échec: ${check.name}`,
                text: check.message,
                status: check.status,
                timestamp: check.timestamp
            })),
            kpis: {
                uptime: kpis.uptime.toFixed(2) + '%',
                mtbf: (kpis.mtbf / (3600 * 1000)).toFixed(2) + 'h',
                mttr: (kpis.mttr / (60 * 1000)).toFixed(2) + 'min'
            }
        };

        const message: AlertMessage = {
            title: `Alerte de santé: ${event.to.toUpperCase()}`,
            body: `L'état du système est passé de ${event.from} à ${event.to}`,
            severity: severity as 'critical' | 'warning',
            details
        };

        // Utiliser l'adaptateur Slack pour envoyer l'alerte
        try {
            await this.slackAdapter.sendAlert(message, {
                enabled: true,
                throttling: this.config.slack.throttling,
                config: {
                    webhookUrl: this.config.slack.webhookUrl,
                    channel: this.config.slack.channel
                }
            });
        } catch (error) {
            this.logger.error(`Échec de l'envoi d'alerte Slack`, error);
        }
    }

    /**
     * Envoie une alerte PagerDuty
     * @param event Événement de changement d'état
     * @param kpis KPIs actuels du système
     */
    private async sendPagerDutyAlert(event: HealthChangeEvent, kpis: HealthKPIs): Promise<void> {
        if (!this.config.pagerDuty?.serviceKey) return;

        this.logger.info(`Déclenchement d'une alerte d'incident PagerDuty`);

        // Identifier les vérifications échouées
        const failedChecks = event.details.filter((check: HealthCheckResult) => check.status === 'unhealthy');

        // Créer un incident unique
        const incidentKey = `health_incident_${Date.now()}`;

        const message: AlertMessage = {
            title: `Système en état UNHEALTHY - ${failedChecks.length} vérifications critiques échouées`,
            body: `État du système passé de ${event.from} à ${event.to}`,
            severity: 'critical',
            details: {
                incidentKey,
                failedChecks: failedChecks.map((check: HealthCheckResult) => ({
                    name: check.name,
                    message: check.message,
                    timestamp: check.timestamp
                })),
                kpis
            }
        };

        // Utiliser l'adaptateur PagerDuty pour envoyer l'alerte
        try {
            await this.pagerDutyAdapter.sendAlert(message, {
                enabled: true,
                throttling: this.config.pagerDuty.throttling,
                config: {
                    serviceKey: this.config.pagerDuty.serviceKey
                }
            });
        } catch (error) {
            this.logger.error(`Échec de l'envoi d'alerte PagerDuty`, error);
        }
    }

    /**
     * Notifie l'équipe d'astreinte
     * @param _event Événement de changement d'état
     */
    public notifyOncall(_event: HealthChangeEvent): void {
        this.logger.info(`Notification à l'équipe d'astreinte concernant un état malsain`);

        // Cette méthode pourrait être étendue pour des actions spécifiques:
        // - Appels téléphoniques automatisés
        // - SMS d'urgence
        // - Activation de procédures d'escalade spécifiques
    }

    /**
     * Envoie une notification d'avertissement
     * @param _event Événement de changement d'état
     */
    public sendWarningNotification(_event: HealthChangeEvent): void {
        this.logger.info(`Système dégradé! Vérifier les composants affectés`);

        // Cette méthode pourrait être étendue pour des notifications moins urgentes:
        // - Emails à l'équipe de support
        // - Messages dans un canal Slack dédié aux avertissements
        // - Mise à jour d'un dashboard
    }

    /**
     * Récupère l'historique des alertes
     */
    public getAlertHistory(): Array<AlertHistoryEntry> {
        return [...this.alertHistory];
    }
}