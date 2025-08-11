/**
 * Adaptateur pour l'envoi d'alertes par email
 */
import { AlertAdapter, AlertMessage, AlertOptions } from '../../types/alert.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Classe responsable de l'envoi d'alertes par email
 */
export class EmailAlertAdapter implements AlertAdapter {
    private readonly logger: Logger;

    // Historique des alertes envoyées pour gérer le throttling
    private readonly alertHistory: Map<string, number> = new Map();

    /**
     * Constructeur
     * @param logger Service de journalisation
     */
    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Envoie une alerte par email
     * @param message Message d'alerte à envoyer
     * @param options Options de configuration
     */
    public async sendAlert(message: AlertMessage, options: AlertOptions): Promise<void> {
        const recipients = options.config.recipients as string[];

        if (!recipients || recipients.length === 0) {
            throw new Error('Aucun destinataire spécifié pour l\'alerte email');
        }

        this.logger.info(`Envoi d'email d'alerte à ${recipients.join(', ')}`);
        this.logger.info(`Sujet: ${message.title}`);
        this.logger.info(`Corps: ${message.body}`);

        // Simulation d'envoi d'email
        // Dans une implémentation réelle, on utiliserait un service d'email comme nodemailer

        /* Exemple avec nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
                user: 'user@example.com',
                pass: 'password'
            }
        });
        
        await transporter.sendMail({
            from: 'monitoring@example.com',
            to: recipients.join(', '),
            subject: message.title,
            text: message.body,
            html: `<h1>${message.title}</h1><p>${message.body}</p>`
        });
        */

        // Simuler une latence réseau pour l'envoi d'email
        await new Promise(resolve => setTimeout(resolve, 200));

        this.logger.info('Alerte email envoyée avec succès');
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
            this.logger.debug(`Alerte email throttled pour la clé ${key} (dernier envoi il y a ${Math.round((now - lastAlertTime) / 1000)}s)`);
            return false;
        }

        // Mettre à jour le dernier temps d'alerte
        this.alertHistory.set(key, now);
        return true;
    }
}