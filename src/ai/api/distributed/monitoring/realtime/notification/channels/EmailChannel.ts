import { NotificationChannel } from '../NotificationChannel';
import { EmailClient } from '../clients/EmailClient';
import { RecipientManager } from '../recipients/RecipientManager';
import { MessageFormatter } from '../formatters/MessageFormatter';
import { RetryPolicy } from '../policies/RetryPolicy';
import {
    AlertMessage,
    NotificationChannelType,
    SendResult,
    EmailPriority,
    EmailAttachment,
    AlertSeverity
} from '../types';

/**
 * Configuration du canal d'email
 */
export interface EmailChannelConfig {
    channelId?: string;
    attachSystemInfo?: boolean;
    includeLogsInCritical?: boolean;
    signatureText?: string;
    replyToAddress?: string;
    maxAttachmentSizeBytes?: number;
    throttleConfig?: {
        maxPerMinute: number;
        windowSizeMs: number;
    };
}

/**
 * Canal de notification par email
 */
export class EmailChannel extends NotificationChannel {
    private readonly emailClient: EmailClient;
    private readonly recipientManager: RecipientManager;
    private readonly config: EmailChannelConfig;
    private readonly throttleWindowMessages: number[] = [];
    private readonly metrics = {
        totalSent: 0,
        totalFailed: 0,
        lastSentTimestamp: null as Date | null,
        averageSendTimeMs: 0
    };

    /**
     * Crée une nouvelle instance du canal d'email
     * 
     * @param emailClient Client d'email
     * @param recipientManager Gestionnaire de destinataires
     * @param formatter Formateur de message
     * @param retryPolicy Politique de nouvelle tentative
     * @param config Configuration du canal
     */
    constructor(
        emailClient: EmailClient,
        recipientManager: RecipientManager,
        formatter: MessageFormatter,
        retryPolicy: RetryPolicy,
        config: EmailChannelConfig = {}
    ) {
        super(
            config.channelId || `email-channel-${Date.now()}`,
            formatter,
            retryPolicy
        );

        this.emailClient = emailClient;
        this.recipientManager = recipientManager;
        this.config = {
            attachSystemInfo: true,
            includeLogsInCritical: true,
            maxAttachmentSizeBytes: 10 * 1024 * 1024, // 10 MB
            throttleConfig: {
                maxPerMinute: 60,
                windowSizeMs: 60000
            },
            ...config
        };

        this.logger.info(`EmailChannel initialized with ID: ${this.getId()}`);
    }

    /**
     * Envoie un message d'alerte par email
     * 
     * @param message Message à envoyer
     * @returns Résultat de l'envoi
     */
    async send(message: AlertMessage): Promise<SendResult> {
        const startTime = Date.now();

        try {
            // Vérifier les limites de throttling
            if (this.isThrottled()) {
                throw new Error('Email sending throttled: rate limit exceeded');
            }

            // Obtenir les destinataires pour cette alerte
            const recipients = await this.recipientManager.getRecipients(
                message.severity,
                NotificationChannelType.EMAIL
            );

            if (recipients.length === 0) {
                this.logger.warn(`No recipients found for message ${message.id} with severity ${message.severity}`);
                return {
                    success: false,
                    timestamp: new Date(),
                    errors: [new Error('No recipients found')],
                    recipients: { successful: [], failed: [] }
                };
            }

            // Formater le message pour l'email
            const formattedMessage = this.formatter.formatEmail(message);

            // Préparer les pièces jointes si nécessaire
            const attachments = await this.prepareAttachments(message);

            // Envoyer l'email avec la politique de nouvelle tentative
            const result = await this.retryPolicy.execute(async () => {
                const emailOptions = {
                    to: recipients.map(recipient => recipient.email),
                    subject: formattedMessage.subject,
                    body: formattedMessage.body,
                    isHtml: formattedMessage.isHtml,
                    attachments: [...(formattedMessage.attachments || []), ...attachments],
                    priority: this.mapPriority(message.severity),
                    headers: this.prepareHeaders(message)
                };

                this.logger.debug(
                    `Sending email to ${emailOptions.to.length} recipients for message ${message.id}`
                );

                return await this.emailClient.send(emailOptions);
            });

            // Mettre à jour les métriques
            this.updateMetrics(true, startTime);

            // Ajouter à la fenêtre de throttling
            this.addToThrottleWindow();

            this.logger.info(
                `Email sent successfully for message ${message.id} to ${result.recipients.successful.length} recipients`
            );

            return result;
        } catch (error) {
            // Mettre à jour les métriques
            this.updateMetrics(false, startTime);

            this.logger.error(
                `Failed to send email for message ${message.id}: ${error instanceof Error ? error.message : String(error)}`
            );

            return {
                success: false,
                timestamp: new Date(),
                errors: [error instanceof Error ? error : new Error(String(error))],
                recipients: { successful: [], failed: [] },
                retryCount: 0
            };
        }
    }

    /**
     * Obtient le type de ce canal de notification
     * 
     * @returns Type de canal
     */
    getChannelType(): NotificationChannelType {
        return NotificationChannelType.EMAIL;
    }

    /**
     * Vérifie si le canal peut traiter un message
     * 
     * @param _message Message à vérifier (non utilisé dans l'implémentation de base)
     * @returns Vrai si le message peut être traité
     */
    override canHandle(_message: AlertMessage): boolean {
        // Le canal peut traiter tous les messages sauf si throttled
        return !this.isThrottled();
    }

    /**
     * Permet de vérifier la connexion email
     * 
     * @returns Vrai si le client email est disponible
     */
    override async isAvailable(): Promise<boolean> {
        try {
            return await this.emailClient.testConnection();
        } catch (error) {
            this.logger.error(`Error checking email client availability: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    /**
     * Obtient les métriques du canal
     * 
     * @returns Métriques de performance
     */
    getMetrics(): typeof this.metrics {
        return { ...this.metrics };
    }

    /**
     * Mappe la sévérité d'une alerte à une priorité d'email
     * 
     * @param severity Sévérité de l'alerte
     * @returns Priorité d'email
     */
    private mapPriority(severity: AlertSeverity): EmailPriority {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return EmailPriority.URGENT;
            case AlertSeverity.HIGH:
                return EmailPriority.HIGH;
            case AlertSeverity.MEDIUM:
                return EmailPriority.NORMAL;
            case AlertSeverity.LOW:
                return EmailPriority.LOW;
            default:
                return EmailPriority.NORMAL;
        }
    }

    /**
     * Prépare les pièces jointes pour une alerte
     * 
     * @param alertMessage Message d'alerte
     * @returns Liste des pièces jointes
     */
    private async prepareAttachments(alertMessage: AlertMessage): Promise<EmailAttachment[]> {
        const attachments: EmailAttachment[] = [];

        // Ajouter des informations système si configuré et pour les alertes critiques
        if (this.config.attachSystemInfo &&
            (alertMessage.severity === AlertSeverity.HIGH || alertMessage.severity === AlertSeverity.CRITICAL)) {

            try {
                // Dans une implémentation réelle, nous collecterions des informations système
                // et les ajouterions en pièce jointe
                const systemInfo = JSON.stringify({
                    timestamp: new Date().toISOString(),
                    alert: {
                        id: alertMessage.id,
                        severity: alertMessage.severity,
                        source: alertMessage.source
                    },
                    system: {
                        hostname: 'server-name',
                        environment: process.env.NODE_ENV || 'development',
                        memory: {
                            total: '16GB',
                            used: '8GB'
                        },
                        cpu: {
                            load: '45%',
                            cores: 8
                        }
                    }
                }, null, 2);

                attachments.push({
                    filename: `system-info-${alertMessage.id}.json`,
                    content: systemInfo,
                    contentType: 'application/json'
                });
            } catch (error) {
                this.logger.warn(`Failed to generate system info attachment: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        // Ajouter des logs pour les alertes critiques si configuré
        if (this.config.includeLogsInCritical && alertMessage.severity === AlertSeverity.CRITICAL) {
            try {
                // Dans une implémentation réelle, nous collecterions des logs récents
                const logs = 'timestamp=2023-11-20T14:30:00Z level=info message="System starting"\n' +
                    'timestamp=2023-11-20T14:30:05Z level=info message="Services initialized"\n' +
                    'timestamp=2023-11-20T14:32:10Z level=warning message="Resource usage high"\n' +
                    'timestamp=2023-11-20T14:35:15Z level=error message="Service unavailable"';

                attachments.push({
                    filename: `relevant-logs-${alertMessage.id}.txt`,
                    content: logs,
                    contentType: 'text/plain'
                });
            } catch (error) {
                this.logger.warn(`Failed to generate logs attachment: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        return attachments;
    }

    /**
     * Prépare les en-têtes d'email pour une alerte
     * 
     * @param alertMessage Message d'alerte
     * @returns En-têtes d'email
     */
    private prepareHeaders(alertMessage: AlertMessage): Record<string, string> {
        const headers: Record<string, string> = {
            'X-Alert-ID': alertMessage.id,
            'X-Alert-Severity': AlertSeverity[alertMessage.severity],
            'X-Alert-Source': alertMessage.source
        };

        // Ajouter l'adresse de réponse si configurée
        if (this.config.replyToAddress) {
            headers['Reply-To'] = this.config.replyToAddress;
        }

        // Ajouter la catégorie et les tags s'ils existent
        if (alertMessage.category) {
            headers['X-Alert-Category'] = alertMessage.category;
        }

        if (alertMessage.tags && alertMessage.tags.length > 0) {
            headers['X-Alert-Tags'] = alertMessage.tags.join(', ');
        }

        return headers;
    }

    /**
     * Vérifie si le canal est actuellement throttlé
     * 
     * @returns Vrai si le canal est throttlé
     */
    private isThrottled(): boolean {
        if (!this.config.throttleConfig) {
            return false;
        }

        // Nettoyer la fenêtre de throttling
        this.cleanThrottleWindow();

        // Vérifier si la limite est dépassée
        return this.throttleWindowMessages.length >= this.config.throttleConfig.maxPerMinute;
    }

    /**
     * Nettoie la fenêtre de throttling des messages obsolètes
     */
    private cleanThrottleWindow(): void {
        if (!this.config.throttleConfig) {
            return;
        }

        const now = Date.now();
        const windowSize = this.config.throttleConfig.windowSizeMs;

        // Supprimer les timestamps obsolètes
        while (
            this.throttleWindowMessages.length > 0 &&
            this.throttleWindowMessages[0] < now - windowSize
        ) {
            this.throttleWindowMessages.shift();
        }
    }

    /**
     * Ajoute le timestamp actuel à la fenêtre de throttling
     */
    private addToThrottleWindow(): void {
        if (!this.config.throttleConfig) {
            return;
        }

        this.throttleWindowMessages.push(Date.now());
    }

    /**
     * Met à jour les métriques du canal
     * 
     * @param success Vrai si l'envoi a réussi
     * @param startTime Heure de début de l'envoi
     */
    private updateMetrics(success: boolean, startTime: number): void {
        if (success) {
            this.metrics.totalSent++;
            this.metrics.lastSentTimestamp = new Date();
        } else {
            this.metrics.totalFailed++;
        }

        // Mettre à jour le temps moyen d'envoi
        const sendTime = Date.now() - startTime;
        const totalSent = this.metrics.totalSent;

        if (totalSent === 1) {
            this.metrics.averageSendTimeMs = sendTime;
        } else if (totalSent > 1) {
            // Moyenne mobile
            this.metrics.averageSendTimeMs =
                (this.metrics.averageSendTimeMs * (totalSent - 1) + sendTime) / totalSent;
        }
    }
}