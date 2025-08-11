import { ProcessedAlert, AlertSeverity } from './types';
import { Logger } from '@ai/utils/Logger';

/**
 * Interface pour un destinataire d'escalade
 */
interface EscalationTarget {
    id: string;
    name: string;
    email: string;
    phone?: string;
    priority: number;
    availableChannels: string[];
}

/**
 * Gestionnaire d'escalade des alertes critiques
 * 
 * Responsable de l'escalade des alertes critiques vers les personnes 
 * ou équipes appropriées selon des politiques configurables.
 */
export class EscalationManager {
    private readonly logger = new Logger('EscalationManager');
    private readonly escalationTargets: Map<string, EscalationTarget[]>;
    private readonly escalationLevels: number[];

    /**
     * Crée une nouvelle instance du gestionnaire d'escalade
     */
    constructor() {
        this.escalationTargets = new Map();
        this.escalationLevels = [5, 15, 30, 60]; // Minutes avant escalade au niveau suivant

        // Initialisation des cibles d'escalade par défaut (dans une application réelle,
        // cela serait chargé depuis une configuration ou une base de données)
        this.initDefaultEscalationTargets();

        this.logger.info('EscalationManager initialized');
    }

    /**
     * Initialise les cibles d'escalade par défaut
     */
    private initDefaultEscalationTargets(): void {
        // Exemple de configuration pour différents types d'alertes

        // Cibles pour les alertes de performance
        this.escalationTargets.set('performance', [
            {
                id: 'perf-team',
                name: 'Performance Team',
                email: 'performance@example.com',
                priority: 1,
                availableChannels: ['email', 'slack']
            },
            {
                id: 'system-admin',
                name: 'System Administrator',
                email: 'sysadmin@example.com',
                phone: '+1234567890',
                priority: 2,
                availableChannels: ['email', 'slack', 'sms']
            }
        ]);

        // Cibles pour les alertes de sécurité
        this.escalationTargets.set('security', [
            {
                id: 'security-team',
                name: 'Security Team',
                email: 'security@example.com',
                phone: '+1234567891',
                priority: 1,
                availableChannels: ['email', 'slack', 'sms']
            },
            {
                id: 'ciso',
                name: 'Chief Information Security Officer',
                email: 'ciso@example.com',
                phone: '+1234567892',
                priority: 2,
                availableChannels: ['email', 'slack', 'sms']
            }
        ]);

        // Configuration par défaut pour les autres types d'alertes
        const defaultTargets = [
            {
                id: 'support-team',
                name: 'Support Team',
                email: 'support@example.com',
                priority: 1,
                availableChannels: ['email', 'slack']
            },
            {
                id: 'on-call',
                name: 'On-Call Engineer',
                email: 'oncall@example.com',
                phone: '+1234567899',
                priority: 2,
                availableChannels: ['email', 'slack', 'sms']
            }
        ];

        // Appliquer la configuration par défaut aux autres types
        this.escalationTargets.set('resource', [...defaultTargets]);
        this.escalationTargets.set('availability', [...defaultTargets]);
        this.escalationTargets.set('error', [...defaultTargets]);
        this.escalationTargets.set('system', [...defaultTargets]);
    }

    /**
     * Escalade une alerte aux personnes ou équipes responsables
     * 
     * @param alert L'alerte à escalader
     */
    public async escalate(alert: ProcessedAlert): Promise<void> {
        this.logger.info(`Escalating alert: ${alert.id} (${AlertSeverity[alert.severity]})`);

        // Déterminer les destinataires de l'escalade
        const targets = this.getEscalationTargets(alert);

        if (targets.length === 0) {
            this.logger.warn(`No escalation targets found for alert type: ${alert.type}`);
            return;
        }

        // Créer un incident pour cette alerte
        const incidentId = await this.createIncident(alert);

        // Notifier les destinataires
        await this.notifyEscalationTargets(targets, alert, incidentId);

        // Planifier une escalade au niveau suivant si nécessaire
        if (alert.severity >= AlertSeverity.CRITICAL) {
            await this.scheduleNextLevelEscalation(alert, incidentId, 0);
        }

        this.logger.info(`Alert ${alert.id} escalated to ${targets.length} targets, incident: ${incidentId}`);
    }

    /**
     * Obtient les cibles d'escalade pour une alerte
     * 
     * @param alert L'alerte pour laquelle obtenir les cibles
     * @returns Liste des cibles d'escalade
     */
    private getEscalationTargets(alert: ProcessedAlert): EscalationTarget[] {
        // Récupérer les cibles pour ce type d'alerte, ou utiliser les cibles par défaut
        const targets = this.escalationTargets.get(alert.type) ||
            this.escalationTargets.get('system') || [];

        // Filtrer et trier les cibles en fonction de la sévérité
        return targets
            .filter(target => {
                // Pour les alertes critiques, inclure toutes les cibles
                if (alert.severity >= AlertSeverity.CRITICAL) {
                    return true;
                }

                // Pour les alertes de haute sévérité, inclure les cibles de priorité 1 et 2
                if (alert.severity >= AlertSeverity.HIGH) {
                    return target.priority <= 2;
                }

                // Pour les autres alertes, n'inclure que les cibles de priorité 1
                return target.priority === 1;
            })
            .sort((a, b) => a.priority - b.priority);
    }

    /**
     * Crée un incident pour une alerte
     * 
     * @param alert L'alerte pour laquelle créer un incident
     * @returns L'identifiant de l'incident créé
     */
    private async createIncident(alert: ProcessedAlert): Promise<string> {
        // Dans une implémentation réelle, cette méthode créerait un incident
        // dans un système de gestion des incidents (par exemple, PagerDuty, ServiceNow)

        const incidentId = `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        this.logger.debug(`Created incident ${incidentId} for alert ${alert.id}`);

        // Simuler un délai pour la création de l'incident
        await new Promise(resolve => setTimeout(resolve, 20));

        return incidentId;
    }

    /**
     * Notifie les cibles d'escalade pour une alerte
     * 
     * @param targets Les cibles à notifier
     * @param alert L'alerte concernée
     * @param incidentId L'identifiant de l'incident associé
     */
    private async notifyEscalationTargets(
        targets: EscalationTarget[],
        alert: ProcessedAlert,
        incidentId: string
    ): Promise<void> {
        const promises = targets.map(target => this.notifyTarget(target, alert, incidentId));

        await Promise.all(promises);
    }

    /**
     * Notifie une cible spécifique pour une alerte
     * 
     * @param target La cible à notifier
     * @param alert L'alerte concernée
     * @param incidentId L'identifiant de l'incident associé
     */
    private async notifyTarget(
        target: EscalationTarget,
        alert: ProcessedAlert,
        incidentId: string
    ): Promise<void> {
        this.logger.debug(`Notifying ${target.name} about incident ${incidentId}`);

        // Déterminer les canaux à utiliser en fonction de la sévérité
        const channels = this.selectNotificationChannels(target, alert);

        // Préparer le message d'escalade
        const message = this.formatEscalationMessage(alert, incidentId);

        // Envoyer les notifications sur tous les canaux sélectionnés
        for (const channel of channels) {
            await this.sendEscalationNotification(channel, target, message);
        }
    }

    /**
     * Sélectionne les canaux de notification pour une cible et une alerte
     * 
     * @param target La cible pour laquelle sélectionner les canaux
     * @param alert L'alerte concernée
     * @returns Liste des canaux à utiliser
     */
    private selectNotificationChannels(target: EscalationTarget, alert: ProcessedAlert): string[] {
        const availableChannels = target.availableChannels;

        // Pour les alertes critiques, utiliser tous les canaux disponibles
        if (alert.severity >= AlertSeverity.CRITICAL) {
            return [...availableChannels];
        }

        // Pour les alertes à haute sévérité, privilégier les canaux immédiats
        if (alert.severity >= AlertSeverity.HIGH) {
            return availableChannels.filter(c => ['slack', 'sms'].includes(c));
        }

        // Pour les autres alertes, utiliser uniquement l'email
        return availableChannels.filter(c => c === 'email');
    }

    /**
     * Formate un message d'escalade pour une alerte
     * 
     * @param alert L'alerte pour laquelle formater le message
     * @param incidentId L'identifiant de l'incident associé
     * @returns Le message formaté
     */
    private formatEscalationMessage(alert: ProcessedAlert, incidentId: string): string {
        const severityText = AlertSeverity[alert.severity];
        const timestamp = new Date(alert.timestamp).toLocaleString();

        return `[ESCALATION] [${severityText}] Incident ${incidentId} created for alert from ${alert.source} at ${timestamp}: ${alert.message}`;
    }

    /**
     * Envoie une notification d'escalade sur un canal spécifique
     * 
     * @param channel Le canal à utiliser
     * @param target La cible de la notification
     * @param message Le message à envoyer
     */
    private async sendEscalationNotification(
        channel: string,
        target: EscalationTarget,
        message: string
    ): Promise<void> {
        this.logger.debug(`Sending escalation notification to ${target.name} via ${channel}: ${message}`);

        // Dans une implémentation réelle, cette méthode enverrait la notification
        // au service approprié en fonction du canal
        switch (channel) {
            case 'email':
                // await this.emailService.sendUrgent({ to: target.email, subject: "URGENT: ...", ... });
                break;
            case 'sms':
                if (target.phone) {
                    // await this.smsService.send({ to: target.phone, message: message });
                }
                break;
            case 'slack':
                // await this.slackService.sendDirectMessage({ userId: target.id, message: message });
                break;
            default:
                this.logger.warn(`Unknown escalation channel: ${channel}`);
        }

        // Simuler un délai pour l'envoi
        await new Promise(resolve => setTimeout(resolve, 15));
    }

    /**
     * Planifie une escalade au niveau suivant si nécessaire
     * 
     * @param alert L'alerte concernée
     * @param incidentId L'identifiant de l'incident associé
     * @param currentLevel Le niveau d'escalade actuel
     */
    private async scheduleNextLevelEscalation(
        alert: ProcessedAlert,
        incidentId: string,
        currentLevel: number
    ): Promise<void> {
        // Vérifier si nous avons atteint le niveau d'escalade maximal
        if (currentLevel >= this.escalationLevels.length - 1) {
            this.logger.warn(`Maximum escalation level reached for incident ${incidentId}`);
            return;
        }

        const nextLevel = currentLevel + 1;
        const delayMinutes = this.escalationLevels[currentLevel];

        this.logger.debug(`Scheduling next level (${nextLevel}) escalation for incident ${incidentId} in ${delayMinutes} minutes`);

        // Dans une implémentation réelle, vous utiliseriez un système de planification
        // ou une file d'attente de messages avec délai (comme SQS avec délai ou un job scheduler)

        // Simuler la planification avec setTimeout (uniquement à des fins de démonstration)
        setTimeout(() => {
            this.executeNextLevelEscalation(alert, incidentId, nextLevel)
                .catch(err => this.logger.error(`Error in next level escalation: ${err}`));
        }, delayMinutes * 60 * 1000);
    }

    /**
     * Exécute une escalade au niveau suivant
     * 
     * @param alert L'alerte concernée
     * @param incidentId L'identifiant de l'incident associé
     * @param level Le niveau d'escalade à exécuter
     */
    private async executeNextLevelEscalation(
        alert: ProcessedAlert,
        incidentId: string,
        level: number
    ): Promise<void> {
        this.logger.info(`Executing level ${level} escalation for incident ${incidentId}`);

        // Dans une implémentation réelle, cette méthode vérifierait d'abord si l'incident
        // est toujours actif et nécessite une escalade

        // Obtenir les cibles pour ce niveau d'escalade
        const targets = this.getEscalationTargetsForLevel(alert, level);

        if (targets.length === 0) {
            this.logger.warn(`No escalation targets for level ${level} found`);
            return;
        }

        // Message d'escalade de niveau supérieur
        const message = `${this.formatEscalationMessage(alert, incidentId)} [ESCALATION LEVEL ${level}]`;

        // Notifier les cibles de ce niveau
        const promises = targets.map(target => {
            const channels = target.availableChannels;
            return Promise.all(
                channels.map(channel =>
                    this.sendEscalationNotification(channel, target, message)
                )
            );
        });

        await Promise.all(promises);

        // Planifier le niveau suivant si nécessaire
        await this.scheduleNextLevelEscalation(alert, incidentId, level);
    }

    /**
     * Obtient les cibles d'escalade pour un niveau spécifique
     * 
     * @param alert L'alerte concernée
     * @param level Le niveau d'escalade
     * @returns Liste des cibles pour ce niveau
     */
    private getEscalationTargetsForLevel(alert: ProcessedAlert, level: number): EscalationTarget[] {
        // Récupérer toutes les cibles pour ce type d'alerte
        const allTargets = this.escalationTargets.get(alert.type) ||
            this.escalationTargets.get('system') || [];

        // Pour le niveau 1, récupérer les cibles de priorité 2
        if (level === 1) {
            return allTargets.filter(target => target.priority === 2);
        }

        // Pour le niveau 2, récupérer les cibles de priorité 3
        if (level === 2) {
            return allTargets.filter(target => target.priority === 3);
        }

        // Pour les niveaux supérieurs, impliquer la direction
        return allTargets.filter(target => target.priority >= 4);
    }
}