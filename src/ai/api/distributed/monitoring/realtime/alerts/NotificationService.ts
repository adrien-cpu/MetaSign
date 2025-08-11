import { ProcessedAlert, AlertSeverity } from './types';
import { Logger } from '@ai/utils/Logger';

/**
 * Service de notification pour les alertes
 * 
 * Gère l'envoi des notifications pour les alertes traitées via divers canaux
 * (email, SMS, Slack, tableau de bord, etc.)
 */
export class NotificationService {
    private readonly logger = new Logger('NotificationService');

    /**
     * Envoie une notification pour une alerte traitée
     * 
     * @param alert L'alerte traitée à notifier
     */
    public async notify(alert: ProcessedAlert): Promise<void> {
        this.logger.debug(`Sending notification for alert: ${alert.id}`);

        // Sélectionner les canaux de notification appropriés en fonction
        // de la sévérité et du type d'alerte
        const channels = this.selectNotificationChannels(alert);

        // Formater le message de notification
        const message = this.formatAlertMessage(alert);

        // Envoyer la notification sur tous les canaux sélectionnés
        const promises = channels.map(channel => this.sendToChannel(channel, message, alert));

        await Promise.all(promises);

        this.logger.debug(`Notification sent for alert: ${alert.id} to ${channels.length} channels`);
    }

    /**
     * Sélectionne les canaux de notification appropriés pour une alerte
     * 
     * @param alert L'alerte pour laquelle sélectionner les canaux
     * @returns Liste des canaux de notification à utiliser
     */
    private selectNotificationChannels(alert: ProcessedAlert): string[] {
        const channels: string[] = ['dashboard'];

        // Ajouter des canaux supplémentaires selon la sévérité
        if (alert.severity >= AlertSeverity.MEDIUM) {
            channels.push('email');
        }

        if (alert.severity >= AlertSeverity.HIGH) {
            channels.push('slack');
        }

        if (alert.severity >= AlertSeverity.CRITICAL) {
            channels.push('sms');
        }

        return channels;
    }

    /**
     * Formate un message de notification pour une alerte
     * 
     * @param alert L'alerte à formater
     * @returns Le message formaté
     */
    private formatAlertMessage(alert: ProcessedAlert): string {
        const severityText = AlertSeverity[alert.severity];
        const timestamp = new Date(alert.timestamp).toLocaleString();

        return `[${severityText}] Alert from ${alert.source} at ${timestamp}: ${alert.message}`;
    }

    /**
     * Envoie une notification à un canal spécifique
     * 
     * @param channel Le canal de notification
     * @param message Le message à envoyer
     * @param alert L'alerte complète (pour des informations supplémentaires)
     */
    private async sendToChannel(channel: string, message: string, alert: ProcessedAlert): Promise<void> {
        this.logger.debug(`Sending to channel ${channel}: ${message}`);

        // Dans une implémentation réelle, cette méthode enverrait la notification
        // au service approprié (API d'email, webhook Slack, etc.)
        switch (channel) {
            case 'email':
                // await this.emailService.send({...});
                this.logger.debug(`Would send email with severity ${AlertSeverity[alert.severity]}`);
                break;
            case 'sms':
                // await this.smsService.send({...});
                this.logger.debug(`Would send SMS for alert from ${alert.source}`);
                break;
            case 'slack':
                // await this.slackService.postMessage({...});
                this.logger.debug(`Would post to Slack about alert #${alert.id}`);
                break;
            case 'dashboard':
                // await this.dashboardService.updateAlert({...});
                this.logger.debug(`Would update dashboard with alert details`);
                break;
            default:
                this.logger.warn(`Unknown notification channel: ${channel}`);
        }

        // Simuler un délai pour l'envoi
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}