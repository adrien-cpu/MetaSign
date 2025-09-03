/**
 * @file src/ai/services/learning/human/coda/codavirtuel/repositories/core/MemoryPersistenceAdapter.ts
 * @description Adaptateur de persistance en mémoire pour tests et développement
 * 
 * Fonctionnalités :
 * - 🧠 Stockage entièrement en mémoire
 * - 🚀 Performance maximale (pas d'I/O)
 * - 🧪 Idéal pour tests unitaires
 * - 🔄 Transactions simulées
 * - 📊 Métriques de performance détaillées
 * 
 * @module repositories/core
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Memory Persistence
 */

import { BasePersistenceAdapter, type PersistenceConfig, type Transaction } from './BasePersistenceAdapter';

/**
 * Transaction mémoire simulée
 */
class MemoryTransaction implements Transaction {
    public readonly id: string;
    private committed = false;
    private rolledBack = false;
    private readonly snapshot: Map<string, unknown>;

    constructor(
        id: string,
        private readonly adapter: MemoryPersistenceAdapter<unknown>
    ) {
        this.id = id;
        // Créer un snapshot des données actuelles
        this.snapshot = new Map(adapter.getData());
    }

    async commit(): Promise<void> {
        if (this.committed || this.rolledBack) {
            throw new Error('Transaction déjà finalisée');
        }
        this.committed = true;
        // En mémoire, pas d'action spécifique nécessaire
    }

    async rollback(): Promise<void> {
        if (this.committed || this.rolledBack) {
            throw new Error('Transaction déjà finalisée');
        }
        // Restaurer le snapshot
        this.adapter.restoreSnapshot(this.snapshot);
        this.rolledBack = true;
    }
}

/**
 * Adaptateur de persistance en mémoire
 */
export class MemoryPersistenceAdapter<T> extends BasePersistenceAdapter<T> {
    private data = new Map<string, T>();
    private totalOperations = 0;
    private cacheHits = 0;
    private readonly metrics = {
        creates: 0,
        reads: 0,
        updates: 0,
        deletes: 0,
        startTime: Date.now()
    };

    constructor(config: PersistenceConfig) {
        super(config);
        this.logger.debug('🧠 Adaptateur mémoire initialisé');
    }

    // ==================== INITIALISATION ====================

    public async initialize(): Promise<void> {
        this.logger.info('✅ Adaptateur mémoire initialisé (aucune action requise)');
    }

    public async destroy(): Promise<void> {
        this.data.clear();
        this.clearCache();
        this.logger.info('🧹 Adaptateur mémoire fermé', {
            totalOperations: this.totalOperations,
            uptime: Date.now() - this.metrics.startTime
        });
    }

    public async isHealthy(): Promise<boolean> {
        return true; // Toujours sain en mémoire
    }

    // ==================== OPÉRATIONS CRUD ====================

    public async create(id: string, data: T): Promise<void> {
        if (this.data.has(id)) {
            throw new Error(`Enregistrement déjà existant: ${id}`);
        }
        
        if (!this.validateData(data)) {
            throw new Error('Données invalides');
        }
        
        this.data.set(id, structuredClone(data));
        this.setCached(id, data);
        this.totalOperations++;
        this.metrics.creates++;
        
        this.logger.debug('✨ Enregistrement créé en mémoire', { id });
    }

    public async read(id: string): Promise<T | null> {
        // Vérifier le cache d'abord
        const cached = this.getCached(id);
        if (cached) {
            this.cacheHits++;
            this.metrics.reads++;
            return cached;
        }
        
        // Chercher dans les données
        const data = this.data.get(id) || null;
        if (data) {
            this.setCached(id, data);
        }
        
        this.totalOperations++;
        this.metrics.reads++;
        return data;
    }

    public async update(id: string, partialData: Partial<T>): Promise<void> {
        const existing = this.data.get(id);
        if (!existing) {
            throw new Error(`Enregistrement non trouvé: ${id}`);
        }
        
        // Fusion des données
        const updated = { ...existing, ...partialData } as T;
        
        if (!this.validateData(updated)) {
            throw new Error('Données mises à jour invalides');
        }
        
        this.data.set(id, updated);
        this.setCached(id, updated);
        this.totalOperations++;
        this.metrics.updates++;
        
        this.logger.debug('🔄 Enregistrement mis à jour en mémoire', { id });
    }

    public async delete(id: string): Promise<void> {
        if (!this.data.has(id)) {
            throw new Error(`Enregistrement non trouvé: ${id}`);
        }
        
        this.data.delete(id);
        this.removeCached(id);
        this.totalOperations++;
        this.metrics.deletes++;
        
        this.logger.debug('🗑️ Enregistrement supprimé de la mémoire', { id });
    }

    public async list(filters?: Record<string, unknown>): Promise<T[]> {
        const results = Array.from(this.data.values());
        
        if (!filters || Object.keys(filters).length === 0) {
            return results;
        }
        
        // Filtrage simple par propriétés
        return results.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                const itemValue = (item as Record<string, unknown>)[key];
                return itemValue === value;
            });
        });
    }

    public async count(filters?: Record<string, unknown>): Promise<number> {
        const filtered = await this.list(filters);
        return filtered.length;
    }

    // ==================== TRANSACTIONS ====================

    public async beginTransaction(): Promise<Transaction> {
        const transactionId = this.generateId();
        return new MemoryTransaction(transactionId, this);
    }

    // ==================== UTILITAIRES ====================

    public async migrate(): Promise<void> {
        this.logger.debug('🔄 Migration mémoire - aucune action requise');
    }

    public async backup(backupPath: string): Promise<void> {
        // Sérialiser les données et les écrire dans un fichier
        const { promises: fs } = await import('fs');
        const { dirname } = await import('path');
        
        await fs.mkdir(dirname(backupPath), { recursive: true });
        
        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            data: Object.fromEntries(this.data.entries()),
            metrics: this.metrics,
            totalOperations: this.totalOperations
        };
        
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
        this.logger.info('📦 Backup mémoire créé', { backupPath, recordsCount: this.data.size });
    }

    public async restore(backupPath: string): Promise<void> {
        const { promises: fs } = await import('fs');
        
        const content = await fs.readFile(backupPath, 'utf-8');
        const backupData = JSON.parse(content) as {
            data: Record<string, unknown>;
            metrics?: Record<string, unknown>;
            totalOperations?: number;
        };
        
        // Restaurer les données
        this.data.clear();
        Object.entries(backupData.data).forEach(([key, value]) => {
            this.data.set(key, value as T);
        });
        
        // Restaurer les métriques si disponibles
        if (backupData.metrics) {
            Object.assign(this.metrics, backupData.metrics);
        }
        
        this.totalOperations = backupData.totalOperations || 0;
        
        this.logger.info('♻️ Backup mémoire restauré', { backupPath, recordsCount: this.data.size });
    }

    public getStats() {
        const baseStats = super.getStats();
        const uptime = Date.now() - this.metrics.startTime;
        
        return {
            ...baseStats,
            cacheHitRate: this.totalOperations > 0 ? this.cacheHits / this.totalOperations : 0,
            totalOperations: this.totalOperations,
            dataSize: this.data.size,
            operationBreakdown: {
                creates: this.metrics.creates,
                reads: this.metrics.reads,
                updates: this.metrics.updates,
                deletes: this.metrics.deletes
            },
            performance: {
                uptime,
                operationsPerSecond: uptime > 0 ? (this.totalOperations / uptime) * 1000 : 0,
                averageResponseTime: 0 // En mémoire, quasi-instantané
            }
        };
    }

    // ==================== MÉTHODES INTERNES ====================

    /**
     * Accès direct aux données (pour tests et transactions)
     */
    public getData(): Map<string, T> {
        return this.data;
    }

    /**
     * Restaure un snapshot des données (pour rollback de transactions)
     */
    public restoreSnapshot(snapshot: Map<string, T>): void {
        this.data.clear();
        this.data = new Map(snapshot);
        this.clearCache();
        this.logger.debug('🔄 Snapshot restauré', { recordsCount: this.data.size });
    }

    /**
     * Clone les données actuelles (utile pour les tests)
     */
    public cloneData(): Map<string, T> {
        return new Map(this.data);
    }

    /**
     * Injecte des données directement (utile pour les tests)
     */
    public injectData(data: Map<string, T>): void {
        this.data = new Map(data);
        this.clearCache();
        this.logger.debug('💉 Données injectées', { recordsCount: this.data.size });
    }

    /**
     * Obtient des métriques détaillées de performance
     */
    public getDetailedMetrics() {
        return {
            ...this.getStats(),
            memoryUsage: {
                dataSize: this.data.size,
                cacheSize: this.cache.size,
                estimatedMemoryKB: Math.round((JSON.stringify(Object.fromEntries(this.data.entries())).length + 
                                               JSON.stringify(Object.fromEntries(this.cache.entries())).length) / 1024)
            }
        };
    }
}