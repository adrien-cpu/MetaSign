/**
 * src/ai/api/integration/services/notification.service.ts
 * Service spécialisé pour la gestion des notifications
 */
import {
    NotificationConfig
} from '@api/common/types';
import {
    SystemNotification
} from '@api/common/types/system-integration.types';
import { LogService } from '@api/common/monitoring/LogService';

export class NotificationService {
    private readonly logger = new LogService('NotificationService');

    /**
     * Crée une nouvelle instance du service de notification
     * @param notificationConfig Configuration des notifications
     */
    constructor(private readonly notificationConfig: NotificationConfig) {
        this.logger.debug('Notification service initialized', {
            channels: notificationConfig.channels?.length || 0
        });
    }

    /**
     * Notifie les administrateurs d'un événement système
     * @param notification Notification à envoyer
     * @returns Promesse résolue après l'envoi de la notification
     */
    public async notifyAdministrators(notification: SystemNotification): Promise<void> {
        this.logger.info(`Sending notification: ${notification.type}`, {
            message: notification.message,
            severity: notification.severity
        });

        try {
            // Vérifier si des canaux de notification sont configurés
            if (this.notificationConfig.channels && this.notificationConfig.channels.length > 0) {
                // Utiliser les canaux configurés
                for (const channel of this.notificationConfig.channels) {
                    // Logique d'envoi spécifique au canal
                    if (channel.active) {
                        this.logger.debug(`Sending via channel: ${channel.type}`, {
                            target: channel.destination
                        });
                        // Simulation d'envoi
                        await this.simulateSend(channel.type, notification);
                    }
                }
            } else {
                // Canal par défaut : console
                console.log(`[NOTIFICATION] ${notification.type}: ${notification.message} (${notification.severity})`);
            }
        } catch (error) {
            this.logger.error('Failed to send notification', { error });
            // Fallback vers console en cas d'erreur
            console.log(`[NOTIFICATION-FALLBACK] ${notification.type}: ${notification.message} (${notification.severity})`);
        }
    }

    /**
     * Simule l'envoi d'une notification via un canal spécifique
     * Méthode privée utilitaire pour la démonstration
     * @param channelType Type de canal
     * @param notification Notification à envoyer
     * @returns Promesse résolue après l'envoi simulé
     * @private
     */
    private async simulateSend(channelType: string, notification: SystemNotification): Promise<void> {
        // Simulation d'envoi avec délai de 50ms
        await new Promise(resolve => setTimeout(resolve, 50));

        // Log de simulation
        this.logger.debug(`Notification sent via ${channelType}`, {
            message: notification.message.substring(0, 50) + (notification.message.length > 50 ? '...' : '')
        });
    }
}