// src/ai/api/security/audit/AuditManager.ts
import { Logger } from '@/ai/utils/Logger';
import { EncryptionManager } from '@ai/api/security/core/EncryptionManager';
import { Database, SecurityEvent, AuditOptions } from '@ai/api/security/types/SecurityTypes';

/**
 * Gestionnaire d'audit pour le suivi des événements de sécurité
 * Conforme au composant SystemeSecuriteRenforcee / AuditContinu du diagramme d'état
 */
export class AuditManager {
    private readonly encryptionManager: EncryptionManager;
    private readonly database: Database;
    private readonly options: AuditOptions;
    private readonly logger: Logger;

    /**
     * Constructeur
     * @param encryptionManager Gestionnaire de chiffrement
     * @param database Base de données pour la persistance
     * @param options Options de configuration
     */
    constructor(
        encryptionManager: EncryptionManager,
        database: Database,
        options: AuditOptions
    ) {
        this.encryptionManager = encryptionManager;
        this.database = database;
        this.options = options;
        this.logger = new Logger('AuditManager');

        this.logger.info('AuditManager initialized');
    }

    /**
     * Enregistre un événement de sécurité
     * @param event Événement à enregistrer
     * @returns Identifiant de l'événement enregistré
     */
    public async logEvent(event: SecurityEvent): Promise<string> {
        try {
            const eventWithId = {
                ...event,
                id: this.generateEventId(),
                timestamp: event.timestamp || new Date()
            };

            let detailsToStore = event.details;

            if (this.options.encryptDetails && detailsToStore) {
                detailsToStore = await this.encryptDetails(detailsToStore);
            }

            const eventToStore = {
                ...eventWithId,
                details: detailsToStore
            };

            const id = await this.database.insert('security_events', eventToStore);
            this.logger.debug(`Audit event logged: ${event.type} with ID ${id}`);
            return id;
        } catch (error) {
            this.logger.error('Failed to log audit event', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    /**
     * Chiffre les détails d'un événement
     * @param details Détails à chiffrer
     * @returns Données chiffrées en base64
     * @private
     */
    private async encryptDetails(details: unknown): Promise<string> {
        try {
            const detailsString = JSON.stringify(details);
            const encoder = new TextEncoder();
            // Utiliser as ArrayBuffer pour corriger le problème de typage
            const buffer = Buffer.from(encoder.encode(detailsString)).buffer as ArrayBuffer;

            // On utilise la clé définie dans les options ou une clé par défaut
            const encryptionKey = this.options.encryptionKey || 'default-audit-key';
            const encryptedData = await this.encryptionManager.encrypt(buffer, encryptionKey);

            return Buffer.from(encryptedData.data).toString('base64');
        } catch (error) {
            this.logger.error('Encryption failed', error instanceof Error ? error.message : String(error));
            throw new Error(`Failed to encrypt details: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Déchiffre les détails d'un événement
     * @param encryptedData Données chiffrées en base64
     * @returns Détails déchiffrés
     */
    public async decryptDetails(encryptedData: string): Promise<Record<string, unknown>> {
        try {
            const buffer = Buffer.from(encryptedData, 'base64');

            // On utilise la clé définie dans les options ou une clé par défaut
            const encryptionKey = this.options.encryptionKey || 'default-audit-key';
            const decryptedBuffer = await this.encryptionManager.decrypt(buffer, encryptionKey);

            const decoder = new TextDecoder();
            const decryptedString = decoder.decode(new Uint8Array(decryptedBuffer));

            return JSON.parse(decryptedString) as Record<string, unknown>;
        } catch (error) {
            this.logger.error('Decryption failed', error instanceof Error ? error.message : String(error));
            return { error: 'Decryption failed' };
        }
    }

    /**
     * Génère un identifiant unique pour un événement
     * @returns Identifiant généré
     * @private
     */
    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    /**
     * Récupère des événements selon des critères de filtrage
     * @param filters Critères de filtrage
     * @returns Liste des événements correspondants
     */
    public async getEvents(
        filters: Partial<{
            type: string;
            severity: SecurityEvent['severity'];
            source: string;
            fromDate: Date;
            toDate: Date;
            userId: string;
        }>
    ): Promise<SecurityEvent[]> {
        try {
            // Construction des critères de filtrage pour la base de données
            const dbFilters: Record<string, unknown> = {};

            if (filters.type) {
                dbFilters.type = filters.type;
            }

            if (filters.severity) {
                dbFilters.severity = filters.severity;
            }

            if (filters.source) {
                dbFilters.source = filters.source;
            }

            if (filters.userId) {
                dbFilters.userId = filters.userId;
            }

            // Filtrage par date
            if (filters.fromDate || filters.toDate) {
                const dateFilter: Record<string, unknown> = {};

                if (filters.fromDate) {
                    dateFilter.$gte = filters.fromDate;
                }

                if (filters.toDate) {
                    dateFilter.$lte = filters.toDate;
                }

                dbFilters.timestamp = dateFilter;
            }

            // Récupération des événements depuis la base de données
            const events = await this.database.find<SecurityEvent>('security_events', dbFilters);
            this.logger.debug(`Retrieved ${events.length} events from database`);

            // Déchiffrer les détails si nécessaire
            if (this.options.encryptDetails) {
                return await Promise.all(events.map(async event => {
                    if (typeof event.details === 'string') {
                        try {
                            event.details = await this.decryptDetails(event.details);
                        } catch (error) {
                            this.logger.error(`Failed to decrypt event ${event.id}`, error instanceof Error ? error.message : String(error));
                            event.details = { error: 'Decryption failed' };
                        }
                    }
                    return event;
                }));
            }

            return events;
        } catch (error) {
            this.logger.error('Error retrieving events', error instanceof Error ? error.message : String(error));
            return [];
        }
    }

    /**
     * Supprime les événements plus anciens que la période de rétention
     * @returns Nombre d'événements supprimés
     */
    public async cleanupOldEvents(): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionPeriod);

            const filter = {
                timestamp: { $lt: cutoffDate }
            };

            const deleteCount = await this.database.deleteMany('security_events', filter);
            this.logger.info(`Deleted ${deleteCount} old security events`);

            return deleteCount;
        } catch (error) {
            this.logger.error('Failed to cleanup old events', error instanceof Error ? error.message : String(error));
            return 0;
        }
    }

    /**
     * Compte le nombre total d'événements
     * @returns Nombre total d'événements
     */
    public async countEvents(): Promise<number> {
        try {
            return await this.database.count('security_events', {});
        } catch (error) {
            this.logger.error('Failed to count events', error instanceof Error ? error.message : String(error));
            return 0;
        }
    }

    /**
     * Récupère les statistiques d'événements par type
     * @returns Statistiques par type d'événement
     */
    public async getEventStatistics(): Promise<Record<string, number>> {
        try {
            const eventTypes = await this.database.distinct('security_events', 'type');
            const statistics: Record<string, number> = {};

            for (const type of eventTypes) {
                statistics[type] = await this.database.count('security_events', { type });
            }

            return statistics;
        } catch (error) {
            this.logger.error('Failed to get event statistics', error instanceof Error ? error.message : String(error));
            return {};
        }
    }
}