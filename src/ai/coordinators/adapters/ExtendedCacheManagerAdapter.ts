//src/ai/coordinators/adapters/ExtendedCacheManagerAdapter.ts
import { CacheManagerAdapter } from './CacheManagerAdapter';
import { EnhancedCacheManager } from '../managers/EnhancedCacheManager';
import { CacheLevel, CacheReplacementPolicy } from '../types';

/**
 * Interface du CacheManager attendu par le système d'expressions
 */
export interface CacheManager {
    level: CacheLevel;
    replacementPolicy: CacheReplacementPolicy;
    compressionEnabled: boolean;
    tagIndex: Map<string, string[]>;
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, options?: { ttl?: number; tags?: string[] }): void;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    getStats(): Record<string, unknown>;
    getByTag(tag: string): string[];
    deleteByTag(tag: string): number;
    gc(): number;
    setCompressionEnabled(enabled: boolean): void;
    defragment(): void;
    updateReplacementPolicy(policy: CacheReplacementPolicy): void;
    lockKey(key: string): void;
    unlockKey(key: string): void;
    isKeyLocked(key: string): boolean;
    // Autres méthodes requises par le système...
}

/**
 * Adaptateur étendu pour le gestionnaire de cache qui implémente
 * toutes les méthodes requises par l'interface CacheManager
 */
export class ExtendedCacheManagerAdapter extends CacheManagerAdapter implements CacheManager {
    // Propriétés requises par l'interface CacheManager
    public level: CacheLevel = CacheLevel.L1;
    public replacementPolicy: CacheReplacementPolicy = CacheReplacementPolicy.LRU;
    public compressionEnabled: boolean = false;
    public tagIndex: Map<string, string[]> = new Map();

    /**
     * Constructeur
     * @param internalManager Gestionnaire de cache interne à adapter
     */
    constructor(private internalManager: EnhancedCacheManager) {
        super(internalManager);

        // Initialiser les propriétés à partir du manager interne
        this.level = internalManager.getConfig().level;
        this.replacementPolicy = internalManager.getConfig().replacementPolicy;
        this.compressionEnabled = internalManager.getConfig().compressionEnabled;
    }

    /**
     * Récupère un élément du cache par tag
     * @param tag Tag recherché
     * @returns Liste des clés associées au tag
     */
    public getByTag(tag: string): string[] {
        return this.tagIndex.get(tag) || [];
    }

    /**
     * Supprime tous les éléments associés à un tag
     * @param tag Tag des éléments à supprimer
     * @returns Nombre d'éléments supprimés
     */
    public deleteByTag(tag: string): number {
        const keys = this.getByTag(tag);
        let count = 0;

        keys.forEach(key => {
            if (this.delete(key)) {
                count++;
            }
        });

        return count;
    }

    /**
     * Exécute le ramasse-miettes sur le cache
     * @returns Nombre d'éléments supprimés
     */
    public gc(): number {
        // Simuler un ramasse-miettes qui ne fait rien
        return 0;
    }

    /**
     * Active ou désactive la compression
     * @param enabled État de la compression
     */
    public setCompressionEnabled(enabled: boolean): void {
        this.compressionEnabled = enabled;
    }

    /**
     * Défragmente le cache
     */
    public defragment(): void {
        // Implémentation vide pour simuler une défragmentation
    }

    /**
     * Met à jour la politique de remplacement du cache
     * @param policy Nouvelle politique
     */
    public updateReplacementPolicy(policy: CacheReplacementPolicy): void {
        this.replacementPolicy = policy;
    }

    /**
     * Verrouille une clé dans le cache
     * @param key Clé à verrouiller
     */
    public lockKey(key: string): void {
        // Implémentation vide pour simulation
    }

    /**
     * Déverrouille une clé dans le cache
     * @param key Clé à déverrouiller
     */
    public unlockKey(key: string): void {
        // Implémentation vide pour simulation
    }

    /**
     * Vérifie si une clé est verrouillée
     * @param key Clé à vérifier
     * @returns true si la clé est verrouillée
     */
    public isKeyLocked(key: string): boolean {
        return false; // Simuler qu'aucune clé n'est verrouillée
    }
}