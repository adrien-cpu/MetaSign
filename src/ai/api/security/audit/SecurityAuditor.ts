// src/ai/api/security/audit/SecurityAuditor.ts

import { SecurityContext, SecurityEvent } from '../types/SecurityTypes';
import { EncryptionManager } from '../core/EncryptionManager';

export interface AuditRecord {
    id: string;
    timestamp: number;
    eventType: string;
    actor: {
        userId: string;
        roles: string[];
        ipAddress: string;
    };
    action: {
        type: string;
        target: string;
        details: Record<string, unknown>;
    };
    context: SecurityContext;
    metadata: {
        sequence: number;
        previousHash: string;
        hash: string;
        signature?: string;
    };
}

export interface AuditChain {
    records: AuditRecord[];
    lastHash: string;
    lastSequence: number;
}

export interface AuditQuery {
    startTime?: number;
    endTime?: number;
    eventTypes?: string[];
    actorIds?: string[];
    actionTypes?: string[];
    targets?: string[];
}

export interface AuditSummary {
    totalRecords: number;
    timeRange: {
        start: number;
        end: number;
    };
    eventTypeDistribution: Map<string, number>;
    actorDistribution: Map<string, number>;
    actionTypeDistribution: Map<string, number>;
    targetDistribution: Map<string, number>;
}

export class SecurityAuditor {
    private readonly auditChains = new Map<string, AuditChain>();
    private readonly pendingRecords: AuditRecord[] = [];
    private readonly BATCH_SIZE = 100;
    private readonly BATCH_INTERVAL = 5000; // 5 secondes

    constructor(
        private readonly encryptionManager: EncryptionManager
    ) {
        this.initializeAuditChains();
        this.startBatchProcessing();
    }

    async logSecurityEvent(event: SecurityEvent): Promise<void> {
        try {
            const auditRecord = await this.createAuditRecord(event);
            this.pendingRecords.push(auditRecord);

            // Si nous atteignons la taille du batch, traiter immédiatement
            if (this.pendingRecords.length >= this.BATCH_SIZE) {
                await this.processPendingRecords();
            }
        } catch (error) {
            console.error('Failed to log security event:', error);
            throw new Error('Audit logging failed');
        }
    }

    async queryAuditLogs(query: AuditQuery): Promise<AuditRecord[]> {
        try {
            // Assurer que les enregistrements en attente sont traités
            await this.processPendingRecords();

            // Récupérer tous les enregistrements pertinents
            const allRecords = await this.getAllAuditRecords();

            // Appliquer les filtres
            return allRecords.filter(record => {
                if (query.startTime && record.timestamp < query.startTime) return false;
                if (query.endTime && record.timestamp > query.endTime) return false;
                if (query.eventTypes && !query.eventTypes.includes(record.eventType)) return false;
                if (query.actorIds && !query.actorIds.includes(record.actor.userId)) return false;
                if (query.actionTypes && !query.actionTypes.includes(record.action.type)) return false;
                if (query.targets && !query.targets.includes(record.action.target)) return false;
                return true;
            });
        } catch (error) {
            console.error('Failed to query audit logs:', error);
            throw new Error('Audit query failed');
        }
    }

    async generateAuditSummary(timeRange: { start: number; end: number }): Promise<AuditSummary> {
        const records = await this.queryAuditLogs({
            startTime: timeRange.start,
            endTime: timeRange.end
        });

        const summary: AuditSummary = {
            totalRecords: records.length,
            timeRange: {
                start: timeRange.start,
                end: timeRange.end
            },
            eventTypeDistribution: new Map<string, number>(),
            actorDistribution: new Map<string, number>(),
            actionTypeDistribution: new Map<string, number>(),
            targetDistribution: new Map<string, number>()
        };

        // Calculer les distributions
        records.forEach(record => {
            this.incrementMapCounter(summary.eventTypeDistribution, record.eventType);
            this.incrementMapCounter(summary.actorDistribution, record.actor.userId);
            this.incrementMapCounter(summary.actionTypeDistribution, record.action.type);
            this.incrementMapCounter(summary.targetDistribution, record.action.target);
        });

        return summary;
    }

    async verifyAuditChain(chainId: string): Promise<boolean> {
        const chain = this.auditChains.get(chainId);
        if (!chain) return false;

        let previousHash = '';
        for (const record of chain.records) {
            // Vérifier la séquence
            if (record.metadata.previousHash !== previousHash) {
                return false;
            }

            // Vérifier le hash
            const calculatedHash = await this.calculateRecordHash(record);
            if (calculatedHash !== record.metadata.hash) {
                return false;
            }

            // Vérifier la signature
            if (record.metadata.signature) {
                const isValidSignature = await this.verifySignature(record.metadata.hash, record.metadata.signature);
                if (!isValidSignature) {
                    return false;
                }
            }

            previousHash = record.metadata.hash;
        }

        return true;
    }

    private async createAuditRecord(event: SecurityEvent): Promise<AuditRecord> {
        const chainId = this.getChainIdForEvent(event);
        const chain = this.auditChains.get(chainId) || this.createNewChain();

        // Extraction sécurisée des données de l'événement
        const userId = this.extractUserIdFromEvent(event);
        const roles = this.extractRolesFromEvent(event);
        const ipAddress = this.extractIpAddressFromEvent(event);

        const record: AuditRecord = {
            id: this.generateRecordId(),
            timestamp: Date.now(),
            eventType: event.type,
            actor: {
                userId,
                roles,
                ipAddress
            },
            action: {
                type: event.type,
                target: event.source,
                details: event.details as Record<string, unknown>
            },
            context: {
                userId,
                roles,
                permissions: this.derivePermissionsFromRoles(roles)
            },
            metadata: {
                sequence: chain.lastSequence + 1,
                previousHash: chain.lastHash,
                hash: '',
                signature: undefined
            }
        };

        // Calculer le hash
        record.metadata.hash = await this.calculateRecordHash(record);

        // Signer l'enregistrement
        record.metadata.signature = await this.signRecord(record.metadata.hash);

        return record;
    }

    private async processPendingRecords(): Promise<void> {
        if (this.pendingRecords.length === 0) return;

        const recordsToProcess = [...this.pendingRecords];
        this.pendingRecords.length = 0;

        for (const record of recordsToProcess) {
            const chainId = this.getChainIdForEvent({
                type: record.eventType,
                severity: 'LOW',
                timestamp: new Date(record.timestamp),
                details: { userId: record.context.userId, roles: record.context.roles },
                source: record.action.target
            });

            const chain = this.auditChains.get(chainId);
            if (chain) {
                chain.records.push(record);
                chain.lastHash = record.metadata.hash;
                chain.lastSequence = record.metadata.sequence;

                // Persister l'enregistrement
                await this.persistAuditRecord(chainId, record);
            }
        }
    }

    private async getAllAuditRecords(): Promise<AuditRecord[]> {
        // Combiner tous les enregistrements de toutes les chaînes
        const allRecords: AuditRecord[] = [];
        for (const chain of this.auditChains.values()) {
            allRecords.push(...chain.records);
        }
        return allRecords.sort((a, b) => a.timestamp - b.timestamp);
    }

    private async calculateRecordHash(record: AuditRecord): Promise<string> {
        // Créer un nouvel objet sans la propriété metadata
        const recordWithoutMetadata = {
            id: record.id,
            timestamp: record.timestamp,
            eventType: record.eventType,
            actor: record.actor,
            action: record.action,
            context: record.context
        };

        const recordString = JSON.stringify(recordWithoutMetadata);
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(recordString));
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    private async signRecord(hash: string): Promise<string> {
        // Implémenter avec l'encryptionManager
        // Simuler une signature pour l'instant
        return `signature-${hash.substring(0, 10)}`;
    }

    private async verifySignature(hash: string, signature: string): Promise<boolean> {
        // Implémenter avec l'encryptionManager
        // Simuler une vérification pour l'instant
        return signature === `signature-${hash.substring(0, 10)}`;
    }

    private async persistAuditRecord(chainId: string, record: AuditRecord): Promise<void> {
        // Implémenter la persistance sécurisée des enregistrements d'audit
        // Pour l'instant, cette méthode est un stub
        console.log(`Persisting audit record ${record.id} to chain ${chainId}`);
    }

    private getChainIdForEvent(event: SecurityEvent): string {
        // Déterminer la chaîne appropriée en fonction du type d'événement
        switch (event.type) {
            case 'AUTH_SUCCESS':
            case 'AUTH_FAILURE':
            case 'LOGOUT':
                return 'auth-chain';
            case 'DATA_ACCESS':
            case 'DATA_MODIFICATION':
                return 'data-chain';
            case 'ADMIN_ACTION':
                return 'admin-chain';
            case 'SYSTEM_ERROR':
            case 'SYSTEM_WARNING':
                return 'system-chain';
            default:
                return 'default-chain';
        }
    }

    private createNewChain(): AuditChain {
        return {
            records: [],
            lastHash: '',
            lastSequence: 0
        };
    }

    private generateRecordId(): string {
        return `audit_${Date.now()}_${crypto.randomUUID()}`;
    }

    private incrementMapCounter(map: Map<string, number>, key: string): void {
        map.set(key, (map.get(key) || 0) + 1);
    }

    private initializeAuditChains(): void {
        // Initialiser les chaînes par défaut
        this.auditChains.set('default-chain', this.createNewChain());
        this.auditChains.set('auth-chain', this.createNewChain());
        this.auditChains.set('data-chain', this.createNewChain());
        this.auditChains.set('admin-chain', this.createNewChain());
        this.auditChains.set('system-chain', this.createNewChain());
    }

    private startBatchProcessing(): void {
        setInterval(async () => {
            try {
                await this.processPendingRecords();
            } catch (error) {
                console.error('Error in batch processing:', error);
            }
        }, this.BATCH_INTERVAL);
    }

    // Méthodes d'extraction sécurisée des données d'événement
    private extractUserIdFromEvent(event: SecurityEvent): string {
        if (typeof event.details === 'object' && event.details !== null && 'userId' in event.details) {
            return String(event.details.userId);
        }
        return 'unknown';
    }

    private extractRolesFromEvent(event: SecurityEvent): string[] {
        if (typeof event.details === 'object' && event.details !== null && 'roles' in event.details) {
            return Array.isArray(event.details.roles) ? event.details.roles.map(String) : [];
        }
        return [];
    }

    private extractIpAddressFromEvent(event: SecurityEvent): string {
        if (typeof event.details === 'object' && event.details !== null && 'ipAddress' in event.details) {
            return String(event.details.ipAddress);
        }
        return 'unknown';
    }

    private derivePermissionsFromRoles(roles: string[]): string[] {
        // Mapper les rôles aux permissions
        const permissionsMap: Record<string, string[]> = {
            'admin': ['READ', 'WRITE', 'DELETE', 'EXECUTE', 'MANAGE_USERS'],
            'user': ['READ', 'WRITE'],
            'viewer': ['READ'],
            'editor': ['READ', 'WRITE']
        };

        // Agréger toutes les permissions basées sur les rôles
        const permissions = new Set<string>();

        roles.forEach(role => {
            const rolePermissions = permissionsMap[role] || [];
            rolePermissions.forEach(perm => permissions.add(perm));
        });

        // Si aucun rôle défini, attribuer un accès minimal en lecture seule
        if (permissions.size === 0) {
            permissions.add('READ');
        }

        return Array.from(permissions);
    }

    // Méthodes publiques utilitaires
    public getChainStatus(chainId: string): {
        recordCount: number;
        lastSequence: number;
        lastUpdate: number;
    } | null {
        const chain = this.auditChains.get(chainId);
        if (!chain) return null;

        return {
            recordCount: chain.records.length,
            lastSequence: chain.lastSequence,
            lastUpdate: chain.records[chain.records.length - 1]?.timestamp || 0
        };
    }

    public async exportAuditLogs(
        query: AuditQuery,
        format: 'json' | 'csv' = 'json'
    ): Promise<string> {
        const records = await this.queryAuditLogs(query);

        if (format === 'csv') {
            // Convertir en CSV
            const headers = ['id', 'timestamp', 'eventType', 'userId', 'actionType', 'target'];
            const rows = records.map(record => [
                record.id,
                record.timestamp,
                record.eventType,
                record.actor.userId,
                record.action.type,
                record.action.target
            ]);
            return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        }

        return JSON.stringify(records, null, 2);
    }

    /**
     * Vérifie l'intégrité de toutes les chaînes d'audit
     */
    public async verifyAllChains(): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();

        for (const chainId of this.auditChains.keys()) {
            results.set(chainId, await this.verifyAuditChain(chainId));
        }

        return results;
    }

    /**
     * Récupère les statistiques globales sur l'audit
     */
    public async getAuditStatistics(): Promise<{
        totalRecords: number;
        chainStats: Map<string, {
            recordCount: number;
            lastSequence: number;
            lastUpdate: number;
        }>;
        eventTypeDistribution: Map<string, number>;
    }> {
        const allRecords = await this.getAllAuditRecords();
        const chainStats = new Map<string, {
            recordCount: number;
            lastSequence: number;
            lastUpdate: number;
        }>();
        const eventTypeDistribution = new Map<string, number>();

        // Collecter les statistiques par chaîne
        for (const [chainId, chain] of this.auditChains.entries()) {
            chainStats.set(chainId, {
                recordCount: chain.records.length,
                lastSequence: chain.lastSequence,
                lastUpdate: chain.records[chain.records.length - 1]?.timestamp || 0
            });
        }

        // Calculer la distribution des types d'événements
        allRecords.forEach(record => {
            this.incrementMapCounter(eventTypeDistribution, record.eventType);
        });

        return {
            totalRecords: allRecords.length,
            chainStats,
            eventTypeDistribution
        };
    }
}