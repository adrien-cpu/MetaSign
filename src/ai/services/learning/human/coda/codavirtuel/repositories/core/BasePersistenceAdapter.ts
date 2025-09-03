/**
 * @file src/ai/services/learning/human/coda/codavirtuel/repositories/core/BasePersistenceAdapter.ts
 * @description Interface de base pour les adaptateurs de persistance CODA
 * 
 * Fonctionnalités :
 * - 🗄️ Interface abstraite pour différents types de stockage
 * - 📊 Support pour SQLite, PostgreSQL, fichiers JSON
 * - 🔄 Migration automatique des données
 * - ✨ Transactions et rollback
 * - 🚀 Performance optimisée avec cache intelligent
 * 
 * @module repositories/core
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Persistence
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Configuration générique pour les adaptateurs de persistance
 */
export interface PersistenceConfig {
    readonly type: 'sqlite' | 'postgresql' | 'json' | 'memory';
    readonly connectionString?: string;
    readonly filePath?: string;
    readonly enableCache?: boolean;
    readonly cacheSize?: number;
    readonly enableTransactions?: boolean;
    readonly autoMigrate?: boolean;
}

/**
 * Interface pour les opérations CRUD de base
 */
export interface CRUDOperations<T> {
    create(id: string, data: T): Promise<void>;
    read(id: string): Promise<T | null>;
    update(id: string, data: Partial<T>): Promise<void>;
    delete(id: string): Promise<void>;
    list(filters?: Record<string, unknown>): Promise<T[]>;
    count(filters?: Record<string, unknown>): Promise<number>;
}

/**
 * Interface pour les transactions
 */
export interface Transaction {
    readonly id: string;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}

/**
 * Classe abstraite de base pour tous les adaptateurs de persistance
 */
export abstract class BasePersistenceAdapter<T> implements CRUDOperations<T> {
    protected readonly logger = LoggerFactory.getLogger(`${this.constructor.name}`);
    protected readonly cache = new Map<string, T>();
    protected readonly config: Required<PersistenceConfig>;

    constructor(config: PersistenceConfig) {
        this.config = {
            type: config.type,
            connectionString: config.connectionString || '',
            filePath: config.filePath || '',
            enableCache: config.enableCache ?? true,
            cacheSize: config.cacheSize ?? 1000,
            enableTransactions: config.enableTransactions ?? true,
            autoMigrate: config.autoMigrate ?? true
        };

        this.logger.info('🗄️ Adaptateur de persistance initialisé', {
            type: this.config.type,
            cacheEnabled: this.config.enableCache,
            transactionsEnabled: this.config.enableTransactions
        });
    }

    // ==================== OPÉRATIONS CRUD ABSTRAITES ====================

    abstract create(id: string, data: T): Promise<void>;
    abstract read(id: string): Promise<T | null>;
    abstract update(id: string, data: Partial<T>): Promise<void>;
    abstract delete(id: string): Promise<void>;
    abstract list(filters?: Record<string, unknown>): Promise<T[]>;
    abstract count(filters?: Record<string, unknown>): Promise<number>;

    // ==================== GESTION TRANSACTIONS ====================

    abstract beginTransaction(): Promise<Transaction>;

    // ==================== GESTION CACHE ====================

    protected getCached(id: string): T | null {
        if (!this.config.enableCache) return null;
        return this.cache.get(id) || null;
    }

    protected setCached(id: string, data: T): void {
        if (!this.config.enableCache) return;
        
        // Éviter la croissance excessive du cache
        if (this.cache.size >= this.config.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }
        
        this.cache.set(id, structuredClone(data));
    }

    protected removeCached(id: string): void {
        if (!this.config.enableCache) return;
        this.cache.delete(id);
    }

    protected clearCache(): void {
        this.cache.clear();
        this.logger.debug('🧹 Cache vidé');
    }

    // ==================== UTILITAIRES ====================

    /**
     * Initialise l'adaptateur (connexion DB, création tables, etc.)
     */
    public abstract initialize(): Promise<void>;

    /**
     * Ferme proprement les connexions et libère les ressources
     */
    public abstract destroy(): Promise<void>;

    /**
     * Vérifie si l'adaptateur est connecté et opérationnel
     */
    public abstract isHealthy(): Promise<boolean>;

    /**
     * Effectue une migration des données si nécessaire
     */
    public abstract migrate(): Promise<void>;

    /**
     * Sauvegarde les données (backup)
     */
    public abstract backup(filePath: string): Promise<void>;

    /**
     * Restaure les données depuis un backup
     */
    public abstract restore(filePath: string): Promise<void>;

    /**
     * Obtient les statistiques de l'adaptateur
     */
    public getStats(): {
        cacheSize: number;
        cacheHitRate: number;
        totalOperations: number;
        type: string;
    } {
        return {
            cacheSize: this.cache.size,
            cacheHitRate: 0, // À implémenter dans les sous-classes
            totalOperations: 0, // À implémenter dans les sous-classes
            type: this.config.type
        };
    }

    /**
     * Valide les données avant persistance
     */
    protected validateData(data: unknown): boolean {
        if (!data) return false;
        if (typeof data !== 'object') return false;
        return true;
    }

    /**
     * Sérialise les données pour le stockage
     */
    protected serialize(data: T): string {
        try {
            return JSON.stringify(data, null, 0);
        } catch (error) {
            this.logger.error('❌ Erreur sérialisation', { error });
            throw new Error(`Erreur sérialisation des données: ${error}`);
        }
    }

    /**
     * Désérialise les données depuis le stockage
     */
    protected deserialize(serializedData: string): T {
        try {
            return JSON.parse(serializedData) as T;
        } catch (error) {
            this.logger.error('❌ Erreur désérialisation', { error });
            throw new Error(`Erreur désérialisation des données: ${error}`);
        }
    }

    /**
     * Génère un identifiant unique si nécessaire
     */
    protected generateId(): string {
        return `coda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Factory pour créer des adaptateurs de persistance
 */
export class PersistenceAdapterFactory {
    private static readonly logger = LoggerFactory.getLogger('PersistenceAdapterFactory');

    /**
     * Crée un adaptateur de persistance selon la configuration
     */
    static async createAdapter<T>(config: PersistenceConfig): Promise<BasePersistenceAdapter<T>> {
        this.logger.info('🏭 Création adaptateur persistance', { type: config.type });

        switch (config.type) {
            case 'json':
                const { JsonPersistenceAdapter } = await import('./JsonPersistenceAdapter');
                return new JsonPersistenceAdapter<T>(config);
                
            case 'sqlite':
                const { SqlitePersistenceAdapter } = await import('./SqlitePersistenceAdapter');
                return new SqlitePersistenceAdapter<T>(config);
                
            case 'memory':
                const { MemoryPersistenceAdapter } = await import('./MemoryPersistenceAdapter');
                return new MemoryPersistenceAdapter<T>(config);
                
            case 'postgresql':
                // Pour une implémentation future
                throw new Error('PostgreSQL adapter pas encore implémenté');
                
            default:
                throw new Error(`Type d'adaptateur non supporté: ${config.type}`);
        }
    }
}