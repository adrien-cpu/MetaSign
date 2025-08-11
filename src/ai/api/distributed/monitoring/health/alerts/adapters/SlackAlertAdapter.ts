/**
 * Adaptateur pour l'envoi d'alertes via Slack
 * @file src/ai/api/distributed/monitoring/health/alerts/adapters/SlackAlertAdapter.ts
 */
import {
    AlertAdapter,
    AlertMessage,
    AlertOptions,
    SlackConfig,
    SlackPayload,
    SlackAttachment
} from '../../types/alert.types';
import { Logger } from '@api/common/monitoring/LogService';

/**
 * Classe responsable de l'envoi d'alertes via Slack
 */
export class SlackAlertAdapter implements AlertAdapter {
    private readonly logger: Logger;

    // Historique des alertes envoyées pour gérer le throttling
    private readonly alertHistory: Map<string, number> = new Map();

    /**
     * Constructeur
     * @param logger Service de journalisation
     */
    constructor(logger: Logger = new Logger('SlackAlertAdapter')) {
        this.logger = logger;
    }

    /**
     * Envoie une alerte via Slack
     * @param message Message d'alerte à envoyer
     * @param options Options de configuration
     */
    public async sendAlert(message: AlertMessage, options: AlertOptions): Promise<void> {
        const slackConfig = options.config as SlackConfig;
        const webhookUrl = slackConfig.webhookUrl;
        const channel = slackConfig.channel;

        if (!webhookUrl) {
            throw new Error('URL de webhook Slack non spécifiée');
        }

        this.logger.info(`Envoi d'alerte Slack au canal ${channel}`);

        // Déterminer la couleur en fonction de la sévérité
        const color = message.severity === 'critical' ? 'danger' :
            (message.severity === 'warning' ? 'warning' : 'good');

        // Construire le payload Slack
        const payload: SlackPayload = {
            channel,
            attachments: [
                {
                    color,
                    title: message.title,
                    text: message.body,
                    fields: this.buildFields(message),
                    footer: "Système de Monitoring Avancé",
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        };

        // Ajouter des attachements supplémentaires si présents dans les détails
        if (message.details?.attachments) {
            const attachments = message.details.attachments as SlackAttachment[];
            for (const attachment of attachments) {
                payload.attachments.push({
                    color,
                    title: attachment.title,
                    text: attachment.text,
                    fields: [
                        {
                            title: "Statut",
                            value: attachment.status || "",
                            short: true
                        },
                        {
                            title: "Timestamp",
                            value: typeof attachment.timestamp === 'string'
                                ? attachment.timestamp
                                : new Date(attachment.timestamp).toISOString(),
                            short: true
                        }
                    ],
                    footer: "Système de Monitoring Avancé",
                    ts: Math.floor(Date.now() / 1000)
                });
            }
        }

        this.logger.debug(`Payload Slack préparé: ${JSON.stringify(payload)}`);

        // Simuler l'envoi à Slack
        // Dans une implémentation réelle, on utiliserait fetch ou axios
        try {
            const response = await this.sendToSlack(webhookUrl, payload);
            this.logger.info('Alerte Slack envoyée avec succès', { responseStatus: response });
        } catch (error) {
            this.logger.error('Échec de l\'envoi de l\'alerte Slack', error);
            throw error;
        }
    }

    /**
     * Construit les champs pour l'attachement Slack
     * @param message Message d'alerte
     * @returns Tableau de champs formatés pour Slack
     */
    private buildFields(message: AlertMessage): Array<{ title: string; value: string; short?: boolean }> {
        const fields = [
            {
                title: "Sévérité",
                value: message.severity,
                short: true
            },
            {
                title: "Timestamp",
                value: new Date().toISOString(),
                short: true
            }
        ];

        // Ajouter les KPIs s'ils sont disponibles
        if (message.details?.kpis) {
            const kpis = message.details.kpis;
            Object.entries(kpis).forEach(([key, value]) => {
                fields.push({
                    title: key.charAt(0).toUpperCase() + key.slice(1),
                    value: String(value),
                    short: true
                });
            });
        }

        return fields;
    }

    /**
     * Envoie un payload à Slack (simulé)
     * @param url URL du webhook Slack
     * @param data Données à envoyer
     * @returns Code de statut simulé
     */
    private async sendToSlack(url: string, data: SlackPayload): Promise<number> {
        // Simuler une latence réseau
        await new Promise(resolve => setTimeout(resolve, 150));

        // Log pour utiliser les variables et éviter les erreurs de variables non utilisées
        this.logger.debug(`Sending to ${url}`, { payload: data });

        // Simuler une réponse réussie
        // Dans une vraie implémentation, ce serait:
        /*
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.status;
        */

        return 200;
    }

    /**
     * Vérifie si une alerte peut être envoyée maintenant (gestion du throttling)
     * @param key Clé unique pour le type d'alerte
     * @param throttlingMinutes Temps minimum entre alertes en minutes
     * @returns True si une alerte peut être envoyée maintenant
     */
    public canSendAlert(key: string, throttlingMinutes: number): boolean {
        const now = Date.now();
        const lastAlertTime = this.alertHistory.get(key) || 0;
        const throttlingMs = throttlingMinutes * 60 * 1000;

        if (now - lastAlertTime < throttlingMs) {
            this.logger.debug(`Alerte Slack throttled pour la clé ${key} (dernier envoi il y a ${Math.round((now - lastAlertTime) / 1000)}s)`);
            return false;
        }

        // Mettre à jour le dernier temps d'alerte
        this.alertHistory.set(key, now);
        return true;
    }
}