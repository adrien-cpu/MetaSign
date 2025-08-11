import { AlertMessage, NotificationChannelType, SendResult, NotificationPriority, ChannelStatus, ChannelStatistics } from './types';
import { Logger } from '@common/monitoring/LogService';
import { RetryPolicy } from './policies/RetryPolicy';
import { MessageFormatter } from './formatters/MessageFormatter';
import { ValidationError } from './errors/ValidationError';
import { NotificationError } from './errors/NotificationError';

/**
 * Classe de base abstraite pour tous les canaux de notification
 */
export abstract class NotificationChannel {
    protected readonly logger: Logger;
    protected readonly formatter: MessageFormatter;
    protected readonly retryPolicy: RetryPolicy;
    protected readonly channelId: string;

    /** Statistiques d'utilisation du canal */
    private statistics: ChannelStatistics = {
        totalAttempts: 0,
        successfulSends: 0,
        failedSends: 0,
        lastSendAttempt: null,
        lastSuccessfulSend: null,
        avgSendTime: 0
    };

    /** État actuel du canal */
    private status: ChannelStatus = 'available';

    /** Timestamp de la dernière vérification de disponibilité */
    private lastAvailabilityCheck: number = 0;

    /**
     * Crée une nouvelle instance de canal de notification
     * 
     * @param channelId Identifiant unique du canal
     * @param formatter Formateur de messages
     * @param retryPolicy Stratégie de nouvelle tentative
     */
    constructor(
        channelId: string,
        formatter: MessageFormatter,
        retryPolicy: RetryPolicy
    ) {
        this.channelId = channelId;
        this.formatter = formatter;
        this.retryPolicy = retryPolicy;
        this.logger = new Logger(`NotificationChannel:${this.getChannelType()}:${channelId}`);
    }

    /**
     * Envoie un message d'alerte via ce canal
     * 
     * @param message Le message d'alerte à envoyer
     * @returns Le résultat de l'envoi
     * @throws {ValidationError} Si le message est invalide
     * @throws {NotificationError} Si l'envoi échoue après les tentatives configurées
     */
    async send(message: AlertMessage): Promise<SendResult> {
        try {
            // Validation du message
            this.validateMessage(message);

            // Vérification de la disponibilité
            if (!await this.isAvailable()) {
                throw new NotificationError(
                    `Channel ${this.channelId} is not available`,
                    'CHANNEL_UNAVAILABLE'
                );
            }

            // Mise à jour des statistiques
            this.statistics.totalAttempts++;
            this.statistics.lastSendAttempt = Date.now();

            const start = Date.now();

            // Exécution avec politique de retry
            const result = await this.retryPolicy.execute(() => this.sendInternal(message));

            // Mise à jour des statistiques en cas de succès
            const sendTime = Date.now() - start;
            this.statistics.successfulSends++;
            this.statistics.lastSuccessfulSend = Date.now();

            // Calcul de la moyenne glissante
            this.statistics.avgSendTime = (this.statistics.avgSendTime * (this.statistics.successfulSends - 1) + sendTime) / this.statistics.successfulSends;

            return result;
        } catch (error) {
            // Mise à jour des statistiques en cas d'échec
            this.statistics.failedSends++;

            // Journalisation de l'erreur
            this.logger.error(`Failed to send notification: ${error instanceof Error ? error.message : String(error)}`);

            // Propagation de l'erreur typée si possible
            if (error instanceof ValidationError || error instanceof NotificationError) {
                throw error;
            }

            // Conversion en NotificationError pour les erreurs inconnues
            throw new NotificationError(
                `Failed to send message through ${this.getChannelType()} channel: ${error instanceof Error ? error.message : String(error)}`,
                'SEND_FAILED',
                { originalError: error }
            );
        }
    }

    /**
     * Implémentation interne de l'envoi de message
     * Doit être implémentée par les classes dérivées
     * 
     * @param message Le message à envoyer
     * @returns Le résultat de l'envoi
     */
    protected abstract sendInternal(message: AlertMessage): Promise<SendResult>;

    /**
     * Obtient le type de ce canal de notification
     * 
     * @returns Le type de canal
     */
    abstract getChannelType(): NotificationChannelType;

    /**
     * Vérifie si le canal peut traiter un message
     * 
     * @param message Le message à vérifier
     * @returns Vrai si le message peut être traité
     */
    canHandle(message: AlertMessage): boolean {
        // Par défaut, tous les canaux peuvent traiter tous les messages
        // Les sous-classes peuvent surcharger cette méthode pour ajouter des filtres
        return true;
    }

    /**
     * Obtient l'identifiant unique de ce canal
     * 
     * @returns L'identifiant du canal
     */
    getId(): string {
        return this.channelId;
    }

    /**
     * Détermine si le canal est actuellement disponible
     * La disponibilité est mise en cache pendant 60 secondes par défaut
     * 
     * @param forceCheck Force une nouvelle vérification sans utiliser le cache
     * @returns Vrai si le canal est disponible
     */
    async isAvailable(forceCheck = false): Promise<boolean> {
        const now = Date.now();

        // Utiliser le cache si possible (1 minute par défaut)
        if (!forceCheck && this.lastAvailabilityCheck > 0 && now - this.lastAvailabilityCheck < 60000) {
            return this.status === 'available';
        }

        try {
            // Vérification de disponibilité spécifique à l'implémentation
            const available = await this.checkAvailability();

            // Mise à jour du statut
            this.status = available ? 'available' : 'unavailable';
            this.lastAvailabilityCheck = now;

            return available;
        } catch (error) {
            this.logger.warn(`Failed to check availability: ${error instanceof Error ? error.message : String(error)}`);
            this.status = 'unavailable';
            this.lastAvailabilityCheck = now;
            return false;
        }
    }

    /**
     * Vérifie la disponibilité du canal
     * Peut être surchargée par les sous-classes pour implémenter la vérification spécifique
     * 
     * @returns Vrai si le canal est disponible
     */
    protected async checkAvailability(): Promise<boolean> {
        // Par défaut, supposer que le canal est disponible
        return true;
    }

    /**
     * Effectue une vérification de santé du canal
     * 
     * @returns Statut de santé détaillé avec métriques
     */
    async healthCheck(): Promise<{
        status: ChannelStatus;
        metrics: ChannelStatistics;
        channelType: NotificationChannelType;
        details?: Record<string, unknown>;
    }> {
        const isAvailableNow = await this.isAvailable(true);

        return {
            status: this.status,
            metrics: this.getStatistics(),
            channelType: this.getChannelType(),
            details: await this.getHealthDetails()
        };
    }

    /**
     * Récupère des détails supplémentaires pour la vérification de santé
     * Peut être surchargée par les sous-classes
     * 
     * @returns Détails spécifiques au canal
     */
    protected async getHealthDetails(): Promise<Record<string, unknown>> {
        return {
            lastAvailabilityCheck: this.lastAvailabilityCheck
        };
    }

    /**
     * Valide un message avant envoi
     * 
     * @param message Le message à valider
     * @throws {ValidationError} Si le message est invalide
     */
    protected validateMessage(message: AlertMessage): void {
        if (!message) {
            throw new ValidationError('Message cannot be null or undefined');
        }

        if (!message.title) {
            throw new ValidationError('Message title is required');
        }

        if (!message.body) {
            throw new ValidationError('Message body is required');
        }

        // Validation supplémentaire spécifique au canal
        this.validateMessageForChannel(message);
    }

    /**
     * Validation spécifique au canal
     * Peut être surchargée par les sous-classes
     * 
     * @param message Le message à valider
     * @throws {ValidationError} Si le message est invalide pour ce canal
     */
    protected validateMessageForChannel(message: AlertMessage): void {
        // Implémentation par défaut ne fait rien
    }

    /**
     * Obtient les statistiques d'utilisation du canal
     * 
     * @returns Statistiques d'utilisation du canal
     */
    getStatistics(): ChannelStatistics {
        return { ...this.statistics };
    }

    /**
     * Réinitialise les statistiques du canal
     */
    resetStatistics(): void {
        this.statistics = {
            totalAttempts: 0,
            successfulSends: 0,
            failedSends: 0,
            lastSendAttempt: null,
            lastSuccessfulSend: null,
            avgSendTime: 0
        };
        this.logger.debug(`Statistics reset for channel ${this.channelId}`);
    }

    /**
     * Détermine si un message doit être traité selon sa priorité
     * 
     * @param priority Priorité du message
     * @returns Vrai si le message doit être traité
     */
    shouldProcessPriority(priority: NotificationPriority): boolean {
        // Par défaut, traiter toutes les priorités
        // Les sous-classes peuvent surcharger pour filtrer par priorité
        return true;
    }

    /**
     * Libère les ressources utilisées par le canal
     * Important pour les canaux qui maintiennent des connexions
     */
    async close(): Promise<void> {
        this.logger.debug(`Closing channel ${this.channelId}`);
        // Implémentation de base ne fait rien
        // Doit être surchargée par les classes qui nécessitent un nettoyage
    }

    /**
     * Génère une description textuelle du canal
     * 
     * @returns Description du canal
     */
    toString(): string {
        return `NotificationChannel[type=${this.getChannelType()}, id=${this.channelId}, status=${this.status}]`;
    }
}