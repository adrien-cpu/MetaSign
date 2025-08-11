import { AlertMessage, EmailFormat, AlertSeverity, EmailAttachment } from '../types';
import { Logger } from '@ai/utils/Logger';

/**
 * Configuration du formateur de messages
 */
export interface MessageFormatterConfig {
    emailTemplates?: {
        html?: string;
        text?: string;
    };
    templates?: Record<string, string>;
    maxBodyLength?: number;
    includeMetadata?: boolean;
    defaultLocale?: string;
}

/**
 * Formateur de messages pour différents canaux de notification
 */
export class MessageFormatter {
    private readonly logger = new Logger('MessageFormatter');
    private readonly config: MessageFormatterConfig;

    /**
     * Crée une nouvelle instance du formateur de messages
     * 
     * @param config Configuration du formateur
     */
    constructor(config: MessageFormatterConfig = {}) {
        this.config = {
            maxBodyLength: 10000,
            includeMetadata: true,
            defaultLocale: 'en',
            ...config
        };

        this.logger.debug('MessageFormatter initialized');
    }

    /**
     * Formatte un message pour l'email
     * 
     * @param message Message à formater
     * @returns Format email
     */
    formatEmail(message: AlertMessage): EmailFormat {
        this.logger.debug(`Formatting email for alert ${message.id}`);

        // Sujet de l'email
        const subject = this.formatEmailSubject(message);

        // Corps en HTML si un template est disponible
        const htmlBody = this.config.emailTemplates?.html
            ? this.applyTemplate(this.config.emailTemplates.html, message)
            : this.generateDefaultHtmlBody(message);

        // Générer les pièces jointes, ou un tableau vide si aucune n'est générée
        const attachments = this.generateAttachments();

        // NOTE: On pourrait aussi générer un corps en texte brut via
        // this.generateDefaultTextBody(message) ou via un template

        return {
            subject,
            body: htmlBody, // Préférer HTML par défaut
            isHtml: true,
            attachments
        };
    }

    /**
     * Formatte le texte pour SMS
     * 
     * @param message Message à formater
     * @returns Message SMS formaté
     */
    formatSms(message: AlertMessage): string {
        // Créer un message court pour SMS
        const severity = this.getSeverityText(message.severity);
        const smsText = `[${severity}] ${message.title} - ${message.summary}`;

        // Limiter la longueur pour SMS
        return this.truncateText(smsText, 160);
    }

    /**
     * Formatte le message pour Slack
     * 
     * @param message Message à formater
     * @returns Message Slack formaté (JSON)
     */
    formatSlack(message: AlertMessage): Record<string, unknown> {
        // Créer une structure de message Slack
        const severity = this.getSeverityText(message.severity);
        const color = this.getSeverityColor(message.severity);

        return {
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `[${severity}] ${message.title}`
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message.body
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `*Source:* ${message.source} | *Time:* ${message.timestamp.toISOString()}`
                        }
                    ]
                }
            ],
            attachments: [
                {
                    color,
                    fields: this.getMetadataFields(message)
                }
            ]
        };
    }

    /**
     * Génère le sujet de l'email
     * 
     * @param message Message source
     * @returns Sujet de l'email
     */
    private formatEmailSubject(message: AlertMessage): string {
        const severity = this.getSeverityText(message.severity);
        const prefix = message.urgency ? 'URGENT: ' : '';

        return `${prefix}[${severity}] ${message.title}`;
    }

    /**
     * Génère un corps d'email HTML par défaut
     * 
     * @param message Message source
     * @returns Corps HTML
     */
    private generateDefaultHtmlBody(message: AlertMessage): string {
        const severity = this.getSeverityText(message.severity);
        const color = this.getSeverityColor(message.severity);
        const timestamp = message.timestamp.toLocaleString(this.config.defaultLocale);

        let html = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .alert-header { background-color: ${color}; color: white; padding: 10px; border-radius: 5px 5px 0 0; }
                    .alert-body { padding: 15px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
                    .metadata { margin-top: 20px; font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
                    .footer { margin-top: 30px; font-size: 0.8em; color: #999; }
                </style>
            </head>
            <body>
                <div class="alert-header">
                    <h2>${severity}: ${message.title}</h2>
                </div>
                <div class="alert-body">
                    <p>${message.body.replace(/\n/g, '<br/>')}</p>
                    
                    <div class="metadata">
                        <p><strong>Alert ID:</strong> ${message.id}</p>
                        <p><strong>Source:</strong> ${message.source}</p>
                        <p><strong>Time:</strong> ${timestamp}</p>
                        ${message.category ? `<p><strong>Category:</strong> ${message.category}</p>` : ''}
                        ${message.tags?.length ? `<p><strong>Tags:</strong> ${message.tags.join(', ')}</p>` : ''}
                    </div>
        `;

        // Ajouter les métadonnées si configuré
        if (this.config.includeMetadata && Object.keys(message.metadata).length > 0) {
            html += `
                    <div class="metadata">
                        <h3>Additional Information</h3>
                        <ul>
            `;

            for (const [key, value] of Object.entries(message.metadata)) {
                html += `<li><strong>${this.formatKey(key)}:</strong> ${this.formatValue(value)}</li>`;
            }

            html += `
                        </ul>
                    </div>
            `;
        }

        html += `
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Applique un template au message
     * 
     * @param template Template à utiliser
     * @param message Message à formater
     * @returns Template appliqué
     */
    private applyTemplate(template: string, message: AlertMessage): string {
        let result = template;

        // Remplacer les variables de base
        result = result.replace(/\{\{id\}\}/g, message.id);
        result = result.replace(/\{\{title\}\}/g, message.title);
        result = result.replace(/\{\{body\}\}/g, message.body);
        result = result.replace(/\{\{summary\}\}/g, message.summary);
        result = result.replace(/\{\{severity\}\}/g, this.getSeverityText(message.severity));
        result = result.replace(/\{\{source\}\}/g, message.source);
        result = result.replace(/\{\{timestamp\}\}/g, message.timestamp.toISOString());
        result = result.replace(/\{\{date\}\}/g, message.timestamp.toLocaleDateString(this.config.defaultLocale));
        result = result.replace(/\{\{time\}\}/g, message.timestamp.toLocaleTimeString(this.config.defaultLocale));

        // Remplacer les variables optionnelles
        if (message.category) {
            result = result.replace(/\{\{category\}\}/g, message.category);
        }

        if (message.tags) {
            result = result.replace(/\{\{tags\}\}/g, message.tags.join(', '));
        }

        // Remplacer les variables de métadonnées
        for (const [key, value] of Object.entries(message.metadata)) {
            result = result.replace(
                new RegExp(`\\{\\{metadata\\.${key}\\}\\}`, 'g'),
                this.formatValue(value)
            );
        }

        return result;
    }

    /**
     * Génère les pièces jointes pour l'email si nécessaire
     * 
     * @returns Pièces jointes éventuelles ou un tableau vide
     */
    private generateAttachments(): EmailAttachment[] {
        // Dans une implémentation réelle, nous pourrions générer des pièces jointes
        // comme des rapports détaillés ou des visualisations de données
        return [];
    }

    /**
     * Obtient les champs de métadonnées formatés pour Slack
     * 
     * @param message Message source
     * @returns Champs formatés
     */
    private getMetadataFields(message: AlertMessage): Array<{ title: string, value: string, short: boolean }> {
        const fields: Array<{ title: string, value: string, short: boolean }> = [];

        fields.push({ title: 'Alert ID', value: message.id, short: true });

        if (message.category) {
            fields.push({ title: 'Category', value: message.category, short: true });
        }

        if (message.tags?.length) {
            fields.push({ title: 'Tags', value: message.tags.join(', '), short: true });
        }

        // Ajouter les métadonnées si configuré
        if (this.config.includeMetadata) {
            for (const [key, value] of Object.entries(message.metadata)) {
                fields.push({
                    title: this.formatKey(key),
                    value: this.formatValue(value),
                    short: true
                });
            }
        }

        return fields;
    }

    /**
     * Obtient le texte correspondant à une sévérité
     * 
     * @param severity Sévérité
     * @returns Texte formaté
     */
    private getSeverityText(severity: AlertSeverity): string {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return 'CRITICAL';
            case AlertSeverity.HIGH:
                return 'HIGH';
            case AlertSeverity.MEDIUM:
                return 'MEDIUM';
            case AlertSeverity.LOW:
                return 'LOW';
            default:
                return 'INFO';
        }
    }

    /**
     * Obtient la couleur correspondant à une sévérité
     * 
     * @param severity Sévérité
     * @returns Code couleur
     */
    private getSeverityColor(severity: AlertSeverity): string {
        switch (severity) {
            case AlertSeverity.CRITICAL:
                return '#FF0000'; // Rouge vif
            case AlertSeverity.HIGH:
                return '#FF6600'; // Orange
            case AlertSeverity.MEDIUM:
                return '#FFCC00'; // Jaune
            case AlertSeverity.LOW:
                return '#00CC00'; // Vert
            default:
                return '#3366CC'; // Bleu
        }
    }

    /**
     * Formatte une clé de métadonnées
     * 
     * @param key Clé à formater
     * @returns Clé formatée
     */
    private formatKey(key: string): string {
        // Convertir camelCase ou snake_case en format lisible
        return key
            .replace(/([A-Z])/g, ' $1') // Ajouter un espace avant les majuscules
            .replace(/_/g, ' ') // Remplacer les underscores par des espaces
            .replace(/^\w/, c => c.toUpperCase()); // Première lettre en majuscule
    }

    /**
     * Formatte une valeur de métadonnées
     * 
     * @param value Valeur à formater
     * @returns Valeur formatée
     */
    private formatValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch {
                // Ignorer l'erreur et utiliser String() comme fallback
                return String(value);
            }
        }

        return String(value);
    }

    /**
     * Tronque un texte à une longueur maximale
     * 
     * @param text Texte à tronquer
     * @param maxLength Longueur maximale
     * @returns Texte tronqué
     */
    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }

        return text.substring(0, maxLength - 3) + '...';
    }
}