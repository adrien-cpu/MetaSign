//src/ai/coordinators/interfaces/ICacheManager.ts
import { CacheLevel } from "../types";

/**
 * Options pour les opérations de cache
 */
export interface CacheOptions {
    ttl?: number;
    level?: CacheLevel;
    tags?: string[];
}

/**
 * Statistiques du cache
 */
export interface CacheStats {
    size: number;
    entries: number;
    hits: number;
    misses: number;
    hitRatio: number;
    evictions: number;
    avgAccessTime: number;
    memoryUsage: number;
    uptime: number;
    lastCleanupTime: number;
}

/**
 * Interface du gestionnaire de cache
 */
export interface ICacheManager {
    /**
     * Récupère un élément du cache
     * @param key Clé de l'élément
     * @returns Valeur ou null si non trouvée
     */
    get<T>(key: string): T | null;

    /**
     * Ajoute ou met à jour un élément dans le cache
     * @param key Clé de l'élément
     * @param value Valeur à stocker
     * @param options Options de cache (TTL, niveau, tags)
     * @returns true si l'opération a réussi
     */
    set<T>(key: string, value: T, options?: CacheOptions): boolean;

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     * @returns true si la clé existe
     */
    has(key: string): boolean;

    /**
     * Supprime un élément du cache
     * @param key Clé de l'élément à supprimer
     * @returns true si l'élément a été supprimé
     */
    delete(key: string): boolean;

    /**
     * Vide le cache
     */
    clear(): void;

    /**
     * Récupère les statistiques du cache
     */
    getStats(): Record<string, number>;

    /**
     * Invalide les entrées de cache par tag
     * @param tag Tag à invalider
     * @returns Nombre d'entrées invalidées
     */
    invalidateByTag(tag: string): number;
}