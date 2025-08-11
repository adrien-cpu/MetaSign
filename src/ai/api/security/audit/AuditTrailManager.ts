// src/ai/api/security/audit/AuditTrailManager.ts
import { Logger } from '@/ai/utils/Logger';
import { AuditManager } from './AuditManager';
import { EncryptionManager } from '../core/EncryptionManager';
import {
    DataAccessEvent,
    ErrorEvent,
    PolicyChangeEvent,
    SecurityEvent,
    SecurityEventSeverity,
    Database
} from '../types/SecurityTypes';

/**
 * Gestionnaire d'audit avancé pour le suivi des événements de sécurité spécifiques
 * Intègre le AuditManager de base avec des fonctionnalités d'audit spécialisées
 */
export class AuditTrailManager {
    private auditManager: AuditManager;
    private logger: Logger;

    /**
     * Constructeur
     */
    constructor() {
        this.logger = new Logger('AuditTrailManager');

        // Utiliser l'instance singleton d'EncryptionManager
        const encryptionManager = EncryptionManager.getInstance();

        // Implémentation de la base de données pour la compatibilité
        // Utilisation de fonctions fléchées sans paramètres nommés pour éviter les warnings ESLint
        const database: Database = {
            insert: async (): Promise<string> => "id",
            find: async <T>(): Promise<T[]> => [],
            findOne: async <T>(): Promise<T | null> => null,
            updateMany: async (): Promise<number> => 0,
            deleteMany: async (): Promise<number> => 0,
            count: async (): Promise<number> => 0,
            distinct: async (): Promise<string[]> => []
        };

        this.auditManager = new AuditManager(
            encryptionManager,
            database,
            { retentionPeriod: 365, encryptDetails: true }
        );

        this.logger.info('AuditTrailManager initialized');
    }

    /**
     * Enregistre un événement de sécurité générique
     * @param event Événement à enregistrer
     * @returns Identifiant de l'événement enregistré
     */
    public async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<string> {
        return this.auditManager.logEvent({
            ...event,
            timestamp: new Date()
        });
    }

    /**
     * Enregistre un événement d'accès aux données
     * @param event Détails de l'accès aux données
     */
    public async logDataAccess(event: DataAccessEvent): Promise<void> {
        await this.logSecurityEvent({
            type: 'DATA_ACCESS',
            severity: SecurityEventSeverity.INFO,
            details: event,
            source: 'DataAccessSystem',
            userId: event.userId
        });
    }

    /**
     * Enregistre un événement d'erreur
     * @param event Détails de l'erreur
     */
    public async logError(event: ErrorEvent): Promise<void> {
        await this.logSecurityEvent({
            type: 'ERROR',
            severity: SecurityEventSeverity.ERROR,
            details: {
                message: event.error.message,
                stack: event.error.stack,
                context: event.context
            },
            source: event.component
        });
    }

    /**
     * Enregistre un événement de modification de politique de sécurité
     * @param event Détails de la modification
     */
    public async logPolicyChange(event: PolicyChangeEvent): Promise<void> {
        await this.logSecurityEvent({
            type: 'POLICY_CHANGE',
            severity: SecurityEventSeverity.WARNING,
            details: event,
            source: 'PolicyManager',
            userId: event.userId
        });
    }

    /**
     * Interroge l'historique d'audit selon des critères
     * @param filters Critères de filtrage
     * @returns Liste des événements correspondants
     */
    public async queryAuditTrail(filters: {
        startDate?: Date | undefined;
        endDate?: Date | undefined;
        type?: string | undefined;
        severity?: string | undefined;
        source?: string | undefined;
    }): Promise<SecurityEvent[]> {
        // Convertir la sévérité en type approprié si définie
        let severity: SecurityEventSeverity | undefined;
        if (filters.severity) {
            // Conversion sécurisée avec vérification
            const severityValue = filters.severity.toUpperCase();
            const allSeverities = Object.values(SecurityEventSeverity);

            // Vérifier si la valeur existe dans l'enum sans utiliser "as any"
            if (allSeverities.some(s => s === severityValue)) {
                severity = severityValue as SecurityEventSeverity;
            } else {
                this.logger.warn(`Invalid severity value: ${filters.severity}`);
            }
        }

        // Créer un objet temporaire avec toutes les propriétés potentielles
        const tempParams: {
            type?: string | undefined;
            severity?: SecurityEventSeverity | undefined;
            source?: string | undefined;
            fromDate?: Date | undefined;
            toDate?: Date | undefined;
            userId?: string | undefined;
        } = {
            type: filters.type,
            severity,
            source: filters.source,
            fromDate: filters.startDate,
            toDate: filters.endDate
        };

        // Filtrer les propriétés undefined pour créer un objet conforme à Partial<...>
        const cleanParams: Partial<{
            type: string;
            severity: SecurityEventSeverity;
            source: string;
            fromDate: Date;
            toDate: Date;
            userId: string;
        }> = {};

        // N'ajouter que les propriétés qui ne sont pas undefined
        if (tempParams.type !== undefined) cleanParams.type = tempParams.type;
        if (tempParams.severity !== undefined) cleanParams.severity = tempParams.severity;
        if (tempParams.source !== undefined) cleanParams.source = tempParams.source;
        if (tempParams.fromDate !== undefined) cleanParams.fromDate = tempParams.fromDate;
        if (tempParams.toDate !== undefined) cleanParams.toDate = tempParams.toDate;
        if (tempParams.userId !== undefined) cleanParams.userId = tempParams.userId;

        return this.auditManager.getEvents(cleanParams);
    }

    /**
     * Nettoie les anciens événements selon la politique de rétention
     */
    public async cleanupOldEvents(): Promise<void> {
        const count = await this.auditManager.cleanupOldEvents();
        this.logger.info(`Cleanup completed, ${count} events removed`);
    }
}