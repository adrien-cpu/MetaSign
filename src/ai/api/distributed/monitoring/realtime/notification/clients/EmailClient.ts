import { EmailSendOptions, SendResult } from '../types';
import { Logger } from '@ai/utils/Logger';

/**
 * Configuration du client email
 */
export interface EmailClientConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
    replyTo?: string;
    connectionTimeout?: number;
    rateLimits?: {
        maxPerMinute: number;
        maxPerHour: number;
    };
}

/**
 * Client pour l'envoi d'emails
 */
export class EmailClient {
    private readonly logger = new Logger('EmailClient');
    private readonly config: EmailClientConfig;
    private readonly stats = {
        sentEmails: 0,
        failedEmails: 0,
        lastSent: null as Date | null,
        bytesTransferred: 0
    };

    /**
     * Crée une nouvelle instance du client email
     * 
     * @param config Configuration du client
     */
    constructor(config: EmailClientConfig) {
        this.config = config;
        this.logger.info(`Email client initialized with server ${config.host}:${config.port}`);
    }

    /**
     * Envoie un email
     * 
     * @param options Options d'envoi
     * @returns Résultat de l'envoi
     */
    async send(options: EmailSendOptions): Promise<SendResult> {
        this.logger.debug(`Sending email to ${this.formatRecipients(options.to)} with subject "${options.subject}"`);

        try {
            // Dans une implémentation réelle, nous utiliserions ici une bibliothèque comme nodemailer
            // pour envoyer l'email. Pour la démo, nous simulons l'envoi.

            // Simulation d'un délai réseau
            await new Promise(resolve => setTimeout(resolve, 50));

            // Mise à jour des statistiques
            this.stats.sentEmails++;
            this.stats.lastSent = new Date();
            this.stats.bytesTransferred += options.body.length;

            if (options.attachments) {
                for (const attachment of options.attachments) {
                    this.stats.bytesTransferred += typeof attachment.content === 'string'
                        ? attachment.content.length
                        : attachment.content.length;
                }
            }

            // Création d'un ID de message fictif
            const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${this.config.host}>`;

            this.logger.debug(`Email sent successfully, message ID: ${messageId}`);

            // Détermination des destinataires
            const recipients = this.getAllRecipients(options);

            return {
                success: true,
                messageId,
                timestamp: new Date(),
                recipients: {
                    successful: recipients,
                    failed: []
                },
                metadata: {
                    priority: options.priority,
                    isHtml: options.isHtml || false,
                    attachmentCount: options.attachments?.length || 0
                }
            };
        } catch (error) {
            this.logger.error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);

            this.stats.failedEmails++;

            return {
                success: false,
                timestamp: new Date(),
                errors: [error instanceof Error ? error : new Error(String(error))],
                recipients: {
                    successful: [],
                    failed: this.getAllRecipients(options)
                }
            };
        }
    }

    /**
     * Vérifie la connexion au serveur email
     * 
     * @returns Vrai si la connexion est établie
     */
    async testConnection(): Promise<boolean> {
        try {
            this.logger.debug(`Testing connection to ${this.config.host}:${this.config.port}`);

            // Simulation d'un test de connexion
            await new Promise(resolve => setTimeout(resolve, 30));

            this.logger.debug('Connection test successful');
            return true;
        } catch (error) {
            this.logger.error(`Connection test failed: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    /**
     * Obtient les statistiques d'envoi
     * 
     * @returns Statistiques d'envoi
     */
    getStats(): typeof this.stats {
        return { ...this.stats };
    }

    /**
     * Formate une liste de destinataires en chaîne
     * 
     * @param recipients Liste de destinataires
     * @returns Chaîne formatée
     */
    private formatRecipients(recipients: string | string[]): string {
        if (typeof recipients === 'string') {
            return recipients;
        }

        if (recipients.length <= 2) {
            return recipients.join(', ');
        }

        return `${recipients.slice(0, 2).join(', ')} and ${recipients.length - 2} more`;
    }

    /**
     * Obtient tous les destinataires d'un envoi
     * 
     * @param options Options d'envoi
     * @returns Liste de tous les destinataires
     */
    private getAllRecipients(options: EmailSendOptions): string[] {
        const recipients: string[] = [];

        // Ajouter les destinataires principaux
        if (typeof options.to === 'string') {
            recipients.push(options.to);
        } else {
            recipients.push(...options.to);
        }

        // Ajouter les destinataires en copie
        if (options.cc) {
            if (typeof options.cc === 'string') {
                recipients.push(options.cc);
            } else {
                recipients.push(...options.cc);
            }
        }

        // Ajouter les destinataires en copie cachée
        if (options.bcc) {
            if (typeof options.bcc === 'string') {
                recipients.push(options.bcc);
            } else {
                recipients.push(...options.bcc);
            }
        }

        return recipients;
    }
}