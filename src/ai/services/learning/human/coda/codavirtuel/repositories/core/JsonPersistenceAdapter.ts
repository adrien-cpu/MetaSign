/**
 * @file src/ai/services/learning/human/coda/codavirtuel/repositories/core/JsonPersistenceAdapter.ts
 * @description Adaptateur de persistance JSON pour le système CODA
 * 
 * Fonctionnalités :
 * - 📁 Stockage dans des fichiers JSON
 * - 🔄 Synchronisation automatique avec le disque
 * - 💾 Sauvegarde atomique (évite corruption)
 * - 🚀 Cache intelligent en mémoire
 * - 🔒 Gestion de la concurrence avec verrouillage
 * 
 * @module repositories/core
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA JSON Persistence
 */

import { promises as fs } from 'fs';
import { dirname } from 'path';
import { BasePersistenceAdapter, type PersistenceConfig, type Transaction } from './BasePersistenceAdapter';

/**
 * Structure des données JSON stockées
 */
interface JsonStorageData<T> {
    readonly version: string;
    readonly timestamp: string;
    readonly count: number;
    readonly data: Record<string, T>;
    readonly metadata: {
        readonly created: string;
        readonly lastModified: string;
        readonly totalOperations: number;
    };
}

/**
 * Transaction JSON simple
 */
class JsonTransaction implements Transaction {
    public readonly id: string;
    private committed = false;
    private rolledBack = false;

    constructor(
        id: string,
        private readonly adapter: JsonPersistenceAdapter<unknown>
    ) {
        this.id = id;
    }

    async commit(): Promise<void> {
        if (this.committed || this.rolledBack) {
            throw new Error('Transaction déjà finalisée');
        }
        await this.adapter.saveToFile();
        this.committed = true;
    }

    async rollback(): Promise<void> {
        if (this.committed || this.rolledBack) {
            throw new Error('Transaction déjà finalisée');
        }
        await this.adapter.loadFromFile();
        this.rolledBack = true;
    }
}

/**
 * Adaptateur de persistance JSON
 */
export class JsonPersistenceAdapter<T> extends BasePersistenceAdapter<T> {
    private readonly filePath: string;
    private data = new Map<string, T>();
    private totalOperations = 0;
    private cacheHits = 0;
    private isLoading = false;
    private isSaving = false;
    private readonly lockQueue: Array<() => void> = [];

    constructor(config: PersistenceConfig) {
        super(config);
        
        if (!config.filePath) {
            throw new Error('filePath requis pour JsonPersistenceAdapter');
        }
        
        this.filePath = config.filePath;
        this.logger.debug('📁 Adaptateur JSON initialisé', { filePath: this.filePath });
    }

    // ==================== INITIALISATION ====================

    public async initialize(): Promise<void> {
        try {
            // Créer le répertoire parent si nécessaire
            await fs.mkdir(dirname(this.filePath), { recursive: true });
            
            // Charger les données existantes
            await this.loadFromFile();
            
            this.logger.info('✅ Adaptateur JSON initialisé', {
                filePath: this.filePath,
                recordsLoaded: this.data.size
            });
        } catch (error) {
            this.logger.error('❌ Erreur initialisation adaptateur JSON', { error });
            throw error;
        }
    }

    public async destroy(): Promise<void> {
        // Sauvegarder avant fermeture
        if (!this.isSaving) {
            await this.saveToFile();
        }
        
        // Nettoyer les ressources
        this.data.clear();
        this.clearCache();
        this.lockQueue.length = 0;
        
        this.logger.info('🧹 Adaptateur JSON fermé proprement');
    }

    public async isHealthy(): Promise<boolean> {
        try {
            // Vérifier l'accès au fichier
            await fs.access(dirname(this.filePath), fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }

    // ==================== OPÉRATIONS CRUD ====================

    public async create(id: string, data: T): Promise<void> {
        await this.withLock(async () => {
            if (this.data.has(id)) {
                throw new Error(`Enregistrement déjà existant: ${id}`);
            }
            
            if (!this.validateData(data)) {
                throw new Error('Données invalides');
            }
            
            this.data.set(id, structuredClone(data));
            this.setCached(id, data);
            this.totalOperations++;
            
            await this.saveToFile();
            
            this.logger.debug('✨ Enregistrement créé', { id });
        });
    }

    public async read(id: string): Promise<T | null> {
        // Vérifier le cache d'abord
        const cached = this.getCached(id);
        if (cached) {
            this.cacheHits++;
            return cached;
        }
        
        // Chercher dans les données
        const data = this.data.get(id) || null;
        if (data) {
            this.setCached(id, data);
        }
        
        this.totalOperations++;
        return data;
    }

    public async update(id: string, partialData: Partial<T>): Promise<void> {
        await this.withLock(async () => {
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
            
            await this.saveToFile();
            
            this.logger.debug('🔄 Enregistrement mis à jour', { id });
        });
    }

    public async delete(id: string): Promise<void> {
        await this.withLock(async () => {
            if (!this.data.has(id)) {
                throw new Error(`Enregistrement non trouvé: ${id}`);
            }
            
            this.data.delete(id);
            this.removeCached(id);
            this.totalOperations++;
            
            await this.saveToFile();
            
            this.logger.debug('🗑️ Enregistrement supprimé', { id });
        });
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
        return new JsonTransaction(transactionId, this);
    }

    // ==================== GESTION FICHIERS ====================

    public async loadFromFile(): Promise<void> {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            const fileExists = await fs.access(this.filePath).then(() => true).catch(() => false);
            
            if (!fileExists) {
                this.logger.info('📁 Fichier JSON non existant, création nouveau', { filePath: this.filePath });
                this.data.clear();
                return;
            }
            
            const content = await fs.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(content) as JsonStorageData<T>;
            
            // Validation de la structure
            if (!parsed.data || typeof parsed.data !== 'object') {
                throw new Error('Structure de fichier JSON invalide');
            }
            
            // Charger les données
            this.data.clear();
            Object.entries(parsed.data).forEach(([key, value]) => {
                this.data.set(key, value);
            });
            
            this.totalOperations = parsed.metadata?.totalOperations || 0;
            
            this.logger.debug('📖 Données chargées depuis JSON', {
                recordsCount: this.data.size,
                version: parsed.version
            });
            
        } catch (error) {
            this.logger.error('❌ Erreur chargement fichier JSON', { error });
            // Créer une nouvelle structure vide en cas d'erreur
            this.data.clear();
        } finally {
            this.isLoading = false;
        }
    }

    public async saveToFile(): Promise<void> {
        if (this.isSaving) return;
        
        this.isSaving = true;
        try {
            const now = new Date().toISOString();
            
            const jsonData: JsonStorageData<T> = {
                version: '1.0.0',
                timestamp: now,
                count: this.data.size,
                data: Object.fromEntries(this.data.entries()),
                metadata: {
                    created: now,
                    lastModified: now,
                    totalOperations: this.totalOperations
                }
            };
            
            // Sauvegarde atomique avec fichier temporaire
            const tempFilePath = `${this.filePath}.tmp`;
            await fs.writeFile(tempFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
            await fs.rename(tempFilePath, this.filePath);
            
            this.logger.debug('💾 Données sauvegardées en JSON', {
                recordsCount: this.data.size,
                filePath: this.filePath
            });
            
        } catch (error) {
            this.logger.error('❌ Erreur sauvegarde fichier JSON', { error });
            throw error;
        } finally {
            this.isSaving = false;
        }
    }

    // ==================== UTILITAIRES ====================

    public async migrate(): Promise<void> {
        // Pour JSON, pas de migration nécessaire pour l'instant
        this.logger.debug('🔄 Migration JSON - aucune action requise');
    }

    public async backup(backupPath: string): Promise<void> {
        await fs.mkdir(dirname(backupPath), { recursive: true });
        await fs.copyFile(this.filePath, backupPath);
        this.logger.info('📦 Backup créé', { source: this.filePath, backup: backupPath });
    }

    public async restore(backupPath: string): Promise<void> {
        await fs.copyFile(backupPath, this.filePath);
        await this.loadFromFile();
        this.logger.info('♻️ Backup restauré', { backup: backupPath, target: this.filePath });
    }

    public getStats() {
        const baseStats = super.getStats();
        return {
            ...baseStats,
            cacheHitRate: this.totalOperations > 0 ? this.cacheHits / this.totalOperations : 0,
            totalOperations: this.totalOperations,
            dataSize: this.data.size
        };
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Exécute une opération avec verrouillage pour éviter la concurrence
     */
    private async withLock<R>(operation: () => Promise<R>): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            this.lockQueue.push(async () => {
                try {
                    const result = await operation();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    // Traiter la prochaine opération en queue
                    this.processNextInQueue();
                }
            });
            
            // Si c'est la première opération, l'exécuter immédiatement
            if (this.lockQueue.length === 1) {
                this.processNextInQueue();
            }
        });
    }

    private processNextInQueue(): void {
        const nextOperation = this.lockQueue.shift();
        if (nextOperation) {
            setImmediate(nextOperation);
        }
    }
}