/**
 * Canal de notification par SMS pour les alertes critiques
 */
import { NotificationChannel } from '../NotificationChannel';
import { AlertMessage, AlertSeverity, NotificationChannelType } from '../../types/notification.types';
import { SMSClient, SMSMessage } from '../../clients/SMSClient';
import { ContactManager } from '../../contacts/ContactManager';
import { MessageFormatter } from '../../formatters/MessageFormatter';
import { RetryPolicy } from '@distributed/common/retry/RetryPolicy';
import { Logger } from '@common/monitoring/LogService';

/**
 * Configuration spécifique au canal SMS
 */
export interface SMSChannelConfig {
    /** Niveau de sévérité minimum pour l'envoi d'un SMS */
    minimumSeverity: AlertSeverity;
    /** Nombre maximum de caractères par SMS */
    maxMessageLength: number;
    /** Préfixe ajouté aux messages d'alerte */
    messagePrefix?: string;
    /** Suffixe ajouté aux messages d'alerte */
    messageSuffix?: string;
    /** Activer les SMS uniquement pendant les heures de travail */
    workHoursOnly?: boolean;
    /** Compression du texte pour les messages longs */
    enableCompression?: boolean;
}

/**
 * Canal de notification par SMS pour les alertes système
 */
export class SMSChannel extends NotificationChannel {
    private readonly smsClient: SMSClient;
    private readonly contactManager: ContactManager;
    private readonly formatter: MessageFormatter;
    private readonly retryPolicy: RetryPolicy;
    private readonly config: SMSChannelConfig;
    private readonly logger: Logger;

    /**
     * Crée une nouvelle instance du canal SMS
     * @param smsClient Client pour l'envoi de SMS
     * @param contactManager Gestionnaire des contacts d'urgence
     * @param formatter Formateur de messages
     * @param retryPolicy Politique de réessai
     * @param config Configuration du canal SMS
     */
    constructor(
        smsClient: SMSClient,
        contactManager: ContactManager,
        formatter: MessageFormatter,
        retryPolicy: RetryPolicy,
        config: SMSChannelConfig
    ) {
        super();
        this.smsClient = smsClient;
        this.contactManager = contactManager;
        this.formatter = formatter;
        this.retryPolicy = retryPolicy;
        this.config = config;
        this.logger = new Logger('SMSChannel');
    }

    /**
     * Envoie un message d'alerte via SMS aux contacts d'urgence
     * @param message Message d'alerte à envoyer
     */
    public async send(message: AlertMessage): Promise<void> {
        if (!this.shouldSendSMS(message.severity)) {
            this.logger.debug(`SMS non envoyé: sévérité ${message.severity} inférieure au seuil ${this.config.minimumSeverity}`);
            return;
        }

        if (this.config.workHoursOnly && !this.isDuringWorkHours()) {
            this.logger.info('SMS non envoyé: en dehors des heures de travail');
            return;
        }

        try {
            const contacts = await this.contactManager.getEmergencyContacts();

            if (contacts.length === 0) {
                this.logger.warn('Aucun contact d\'urgence trouvé pour l\'envoi du SMS');
                return;
            }

            const formattedMessage = this.formatMessage(message);

            this.logger.info(`Envoi de SMS à ${contacts.length} contacts pour l'alerte: ${message.title}`);

            await this.retryPolicy.execute(async () => {
                await Promise.all(contacts.map(contact => {
                    if (!this.isValidPhoneNumber(contact.phone)) {
                        this.logger.warn(`Numéro de téléphone invalide ignoré: ${contact.phone}`);
                        return Promise.resolve();
                    }

                    return this.smsClient.send({
                        to: contact.phone,
                        message: formattedMessage,
                        urgent: message.severity >= AlertSeverity.HIGH
                    });
                }).filter(Boolean));
            });

            await this.logNotificationSent(message, contacts.length);
        } catch (error) {
            this.logger.error(`Échec de l'envoi de SMS: ${error}`, {
                messageTitle: message.title,
                severity: message.severity
            });
            throw error;
        }
    }

    /**
     * Vérifie si la sévérité de l'alerte justifie l'envoi d'un SMS
     * @param severity Niveau de sévérité de l'alerte
     * @returns true si un SMS doit être envoyé
     */
    private shouldSendSMS(severity: AlertSeverity): boolean {
        return severity >= this.config.minimumSeverity;
    }

    /**
     * Vérifie si l'heure actuelle est pendant les heures de travail (8h-18h, Lun-Ven)
     * @returns true si nous sommes pendant les heures de travail
     */
    private isDuringWorkHours(): boolean {
        const now = new Date();
        const hours = now.getHours();
        const day = now.getDay();

        // Vérifier si nous sommes entre 8h et 18h et du lundi au vendredi (1-5)
        return hours >= 8 && hours < 18 && day >= 1 && day <= 5;
    }

    /**
     * Formate un message d'alerte pour l'envoi par SMS
     * @param message Message d'alerte à formater
     * @returns Message formaté
     */
    private formatMessage(message: AlertMessage): string {
        let formattedMessage = this.formatter.formatSMS(message);

        // Ajouter préfixe et suffixe si configurés
        if (this.config.messagePrefix) {
            formattedMessage = `${this.config.messagePrefix} ${formattedMessage}`;
        }

        if (this.config.messageSuffix) {
            formattedMessage = `${formattedMessage} ${this.config.messageSuffix}`;
        }

        // Tronquer si nécessaire
        if (formattedMessage.length > this.config.maxMessageLength) {
            if (this.config.enableCompression) {
                formattedMessage = this.compressMessage(formattedMessage, this.config.maxMessageLength);
            } else {
                formattedMessage = formattedMessage.substring(0, this.config.maxMessageLength - 3) + '...';
            }
        }

        return formattedMessage;
    }

    /**
     * Compresse un message pour qu'il tienne dans la limite de caractères
     * @param message Message à compresser
     * @param maxLength Longueur maximale
     * @returns Message compressé
     */
    private compressMessage(message: string, maxLength: number): string {
        // Remplacer certains mots par des abréviations
        const abbreviations: Record<string, string> = {
            'error': 'err',
            'warning': 'warn',
            'information': 'info',
            'database': 'DB',
            'system': 'sys',
            'application': 'app',
            'server': 'srv',
            'configuration': 'config',
            'authentication': 'auth',
            'authorization': 'authz'
        };

        let compressed = message;

        for (const [word, abbrev] of Object.entries(abbreviations)) {
            compressed = compressed.replace(new RegExp(`\\b${word}\\b`, 'gi'), abbrev);
        }

        // Si toujours trop long, tronquer
        if (compressed.length > maxLength) {
            compressed = compressed.substring(0, maxLength - 3) + '...';
        }

        return compressed;
    }

    /**
     * Vérifie si un numéro de téléphone est valide
     * @param phone Numéro de téléphone à vérifier
     * @returns true si le numéro est valide
     */
    private isValidPhoneNumber(phone: string): boolean {
        // Format international: +XX XXXXX ou format national: 0X XX XX XX XX
        return /^(\+\d{1,3}\s?\d{4,}|\d{10,})$/.test(phone.replace(/[\s\-]/g, ''));
    }

    /**
     * Enregistre l'envoi de la notification
     * @param message Message envoyé
     * @param recipientCount Nombre de destinataires
     */
    private async logNotificationSent(message: AlertMessage, recipientCount: number): Promise<void> {
        try {
            // Ici, on pourrait enregistrer l'envoi dans une base de données ou un système de logs
            this.logger.info(`SMS envoyé avec succès à ${recipientCount} contacts: ${message.title}`, {
                severity: message.severity,
                timestamp: new Date().toISOString(),
                recipientCount,
                messageId: message.id
            });
        } catch (error) {
            this.logger.warn(`Erreur lors de l'enregistrement de l'envoi du SMS: ${error}`);
        }
    }

    /**
     * Récupère le type de canal de notification
     * @returns Type de canal SMS
     */
    public getChannelType(): NotificationChannelType {
        return 'SMS';
    }
}