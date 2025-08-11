/**
 * Adaptateur pour l'envoi d'alertes via PagerDuty
 */
import { AlertAdapter, AlertMessage, AlertOptions } from '../../types/alert.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Classe responsable de l'envoi d'alertes via PagerDuty
 */
export class PagerDutyAlertAdapter implements AlertAdapter {
    private readonly logger: Logger;

    // Historique des alertes envoyées pour gérer le throttling
    private readonly alertHistory: Map<string, number> = new Map();

    // Suivi des incidents actifs pour permettre leur résolution ultérieure
    private readonly activeIncidents: Map<string, string> = new Map();

    /**
     * Constructeur
     * @param logger Service de journalisation
     */
    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Envoie une alerte via PagerDuty
     * @param message Message d'alerte à envoyer
     * @param options Options de configuration
     */
    public async sendAlert(message: AlertMessage, options: AlertOptions): Promise<void> {
        const serviceKey = options.config.serviceKey as string;

        if (!serviceKey) {
            throw new Error('Clé de service PagerDuty non spécifiée');
        }

        this.logger.info(`Déclenchement d'une alerte d'incident PagerDuty`);

        // Récupérer l'ID d'incident ou en générer un nouveau
        const incidentKey =
            message.details?.incidentKey as string ||
            `health_incident_${Date.now()}`;

        // Construire le payload
        const payload = {
            routing_key: serviceKey,
            event_action: "trigger",
            dedup_key: incidentKey,
            payload: {
                summary: message.title,
                source: "Système de Monitoring Avancé",
                severity: this.mapSeverity(message.severity),
                custom_details: message.details || {}
            }
        };

        this.logger.debug(`Payload PagerDuty préparé: ${JSON.stringify(payload)}`);

        // Simuler l'envoi à PagerDuty
        // Dans une implémentation réelle, on utiliserait fetch ou axios

        /* Exemple avec fetch
        const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
            throw new Error(`Échec de l'envoi à PagerDuty: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        */

        // Stocker l'incident comme actif pour résolution future
        this.activeIncidents.set(incidentKey, message.title);

        // Simuler une latence réseau
        await new Promise(resolve => setTimeout(resolve, 200));

        this.logger.info(`Alerte PagerDuty envoyée avec succès (Incident: ${incidentKey})`);
    }

    /**
     * Résout un incident PagerDuty existant
     * @param incidentKey Clé de l'incident à résoudre
     * @param serviceKey Clé de service PagerDuty
     * @param resolution Description de la résolution
     */
    public async resolveIncident(
        incidentKey: string,
        serviceKey: string,
        resolution: string
    ): Promise<void> {
        if (!this.activeIncidents.has(incidentKey)) {
            this.logger.warn(`Tentative de résolution d'un incident inconnu: ${incidentKey}`);
            return;
        }

        this.logger.info(`Résolution de l'incident PagerDuty: ${incidentKey}`);

        // Construire le payload de résolution
        const payload = {
            routing_key: serviceKey,
            event_action: "resolve",
            dedup_key: incidentKey,
            payload: {
                summary: `Résolution: ${this.activeIncidents.get(incidentKey)}`,
                source: "Système de Monitoring Avancé",
                custom_details: {
                    resolution,
                    resolved_at: new Date().toISOString()
                }
            }
        };

        // Logger le payload préparé, ce qui justifie sa création
        this.logger.debug(`Payload de résolution PagerDuty: ${JSON.stringify(payload)}`);

        // Simuler l'envoi à PagerDuty
        // Dans une implémentation réelle, on utiliserait fetch ou axios:
        /*
        const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
            throw new Error(`Échec de la résolution PagerDuty: ${response.status} ${response.statusText}`);
        }
        */

        // Retirer l'incident actif
        this.activeIncidents.delete(incidentKey);

        // Simuler une latence réseau
        await new Promise(resolve => setTimeout(resolve, 200));

        this.logger.info(`Incident PagerDuty ${incidentKey} résolu avec succès`);
    }

    /**
     * Mappe la sévérité interne à la sévérité PagerDuty
     * @param severity Sévérité interne
     * @returns Sévérité au format PagerDuty
     */
    private mapSeverity(severity: string): string {
        switch (severity) {
            case 'critical':
                return 'critical';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'error';
        }
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
            this.logger.debug(`Alerte PagerDuty throttled pour la clé ${key} (dernier envoi il y a ${Math.round((now - lastAlertTime) / 1000)}s)`);
            return false;
        }

        // Mettre à jour le dernier temps d'alerte
        this.alertHistory.set(key, now);
        return true;
    }

    /**
     * Récupère la liste des incidents actifs
     */
    public getActiveIncidents(): Map<string, string> {
        return new Map(this.activeIncidents);
    }
}