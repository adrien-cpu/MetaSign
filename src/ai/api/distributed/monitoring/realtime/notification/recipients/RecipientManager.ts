import { Recipient, NotificationChannelType } from '../types';
import { AlertSeverity } from '../../alerts/types';
import { Logger } from '@ai/utils/Logger';

/**
 * Configuration du gestionnaire de destinataires
 */
export interface RecipientManagerConfig {
    defaultRecipients?: Recipient[];
    cacheEnabled?: boolean;
    cacheTtlSeconds?: number;
    fallbackRecipient?: Recipient;
    maxRecipientsPerAlert?: number;
}

/**
 * Gestionnaire des destinataires de notifications
 */
export class RecipientManager {
    private readonly logger = new Logger('RecipientManager');
    private readonly config: RecipientManagerConfig;
    private readonly recipients: Map<string, Recipient> = new Map();
    private readonly recipientGroups: Map<string, string[]> = new Map();
    private readonly cache: Map<string, { recipients: Recipient[], expiry: number }> = new Map();

    /**
     * Crée une nouvelle instance du gestionnaire de destinataires
     * 
     * @param config Configuration du gestionnaire
     */
    constructor(config: RecipientManagerConfig = {}) {
        this.config = {
            cacheEnabled: true,
            cacheTtlSeconds: 300, // 5 minutes
            maxRecipientsPerAlert: 20,
            ...config
        };

        // Initialisation avec les destinataires par défaut
        if (config.defaultRecipients) {
            for (const recipient of config.defaultRecipients) {
                this.addRecipient(recipient);
            }
        }

        this.logger.info(`RecipientManager initialized with ${this.recipients.size} default recipients`);
    }

    /**
     * Ajoute un destinataire
     * 
     * @param recipient Le destinataire à ajouter
     * @returns Le destinataire ajouté
     */
    addRecipient(recipient: Recipient): Recipient {
        this.recipients.set(recipient.id, recipient);

        // Ajouter aux groupes si spécifiés
        if (recipient.groups && recipient.groups.length > 0) {
            for (const group of recipient.groups) {
                const groupMembers = this.recipientGroups.get(group) || [];
                if (!groupMembers.includes(recipient.id)) {
                    groupMembers.push(recipient.id);
                    this.recipientGroups.set(group, groupMembers);
                }
            }
        }

        this.invalidateCache();
        this.logger.debug(`Added recipient: ${recipient.name} (${recipient.id})`);

        return recipient;
    }

    /**
     * Supprime un destinataire
     * 
     * @param recipientId L'ID du destinataire à supprimer
     * @returns Vrai si le destinataire a été supprimé
     */
    removeRecipient(recipientId: string): boolean {
        const recipient = this.recipients.get(recipientId);

        if (!recipient) {
            return false;
        }

        this.recipients.delete(recipientId);

        // Supprimer des groupes
        if (recipient.groups && recipient.groups.length > 0) {
            for (const group of recipient.groups) {
                const groupMembers = this.recipientGroups.get(group) || [];
                const updatedMembers = groupMembers.filter(id => id !== recipientId);

                if (updatedMembers.length > 0) {
                    this.recipientGroups.set(group, updatedMembers);
                } else {
                    this.recipientGroups.delete(group);
                }
            }
        }

        this.invalidateCache();
        this.logger.debug(`Removed recipient: ${recipientId}`);

        return true;
    }

    /**
     * Obtient les destinataires correspondant à une sévérité donnée
     * 
     * @param severity Sévérité de l'alerte
     * @param channelType Type de canal (optionnel)
     * @returns Liste des destinataires
     */
    async getRecipients(
        severity: AlertSeverity,
        channelType?: NotificationChannelType
    ): Promise<Recipient[]> {
        // Vérifier le cache si activé
        const cacheKey = `${severity}_${channelType || 'all'}`;

        if (this.config.cacheEnabled) {
            const cached = this.cache.get(cacheKey);
            if (cached && cached.expiry > Date.now()) {
                this.logger.debug(`Using cached recipients for ${cacheKey}`);
                return cached.recipients;
            }
        }

        // Filtrer les destinataires en fonction de la sévérité et du canal
        const filteredRecipients = Array.from(this.recipients.values()).filter(recipient => {
            // Vérifier la sévérité
            if (!recipient.preferences.severity.includes(severity)) {
                return false;
            }

            // Vérifier le canal si spécifié
            if (channelType && !recipient.preferences.channels.includes(channelType)) {
                return false;
            }

            // Vérifier les planifications si présentes
            if (channelType &&
                recipient.preferences.schedules &&
                recipient.preferences.schedules.length > 0) {

                const now = new Date();
                const schedules = recipient.preferences.schedules.filter(
                    s => s.channelType === channelType
                );

                // Si des planifications sont définies pour ce canal, vérifier si l'une d'elles est active
                if (schedules.length > 0) {
                    const isScheduleActive = schedules.some(schedule => {
                        const day = now.getDay(); // 0 = dimanche, 1 = lundi, etc.
                        if (!schedule.daysOfWeek.includes(day)) {
                            return false;
                        }

                        const currentTime = now.getHours() * 60 + now.getMinutes();
                        const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
                        const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);

                        const startTime = startHours * 60 + startMinutes;
                        const endTime = endHours * 60 + endMinutes;

                        return currentTime >= startTime && currentTime <= endTime;
                    });

                    if (!isScheduleActive) {
                        return false;
                    }
                }
            }

            return true;
        });

        // Limiter le nombre de destinataires si nécessaire
        let result = filteredRecipients;
        if (this.config.maxRecipientsPerAlert &&
            result.length > this.config.maxRecipientsPerAlert) {

            result = result.slice(0, this.config.maxRecipientsPerAlert);
            this.logger.warn(
                `Truncated recipient list from ${filteredRecipients.length} to ${result.length} due to limit`
            );
        }

        // Ajouter le destinataire de secours si aucun n'est trouvé et qu'il est configuré
        if (result.length === 0 && this.config.fallbackRecipient) {
            result = [this.config.fallbackRecipient];
            this.logger.warn(`No recipients found, using fallback recipient: ${this.config.fallbackRecipient.id}`);
        }

        // Mettre en cache les résultats
        if (this.config.cacheEnabled) {
            const expiry = Date.now() + (this.config.cacheTtlSeconds || 300) * 1000;
            this.cache.set(cacheKey, { recipients: result, expiry });
        }

        this.logger.debug(`Found ${result.length} recipients for severity ${severity}${channelType ? ` and channel ${channelType}` : ''
            }`);

        return result;
    }

    /**
     * Obtient un destinataire par son ID
     * 
     * @param recipientId ID du destinataire
     * @returns Le destinataire ou undefined s'il n'existe pas
     */
    getRecipient(recipientId: string): Recipient | undefined {
        return this.recipients.get(recipientId);
    }

    /**
     * Obtient tous les destinataires d'un groupe
     * 
     * @param groupName Nom du groupe
     * @returns Liste des destinataires du groupe
     */
    getRecipientsByGroup(groupName: string): Recipient[] {
        const memberIds = this.recipientGroups.get(groupName) || [];
        return memberIds
            .map(id => this.recipients.get(id))
            .filter((recipient): recipient is Recipient => recipient !== undefined);
    }

    /**
     * Obtient tous les destinataires avec un tag spécifique
     * 
     * @param tag Tag à rechercher
     * @returns Liste des destinataires avec le tag
     */
    getRecipientsByTag(tag: string): Recipient[] {
        return Array.from(this.recipients.values())
            .filter(recipient => recipient.tags?.includes(tag));
    }

    /**
     * Invalide le cache
     */
    private invalidateCache(): void {
        this.cache.clear();
        this.logger.debug('Recipient cache invalidated');
    }
}