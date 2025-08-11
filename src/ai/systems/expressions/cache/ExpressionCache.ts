// src/ai/systems/expressions/cache/ExpressionCache.ts
import { ExpressionResult } from '@ai-types/expressions';

/**
 * Interface de configuration pour les entrées de cache
 */
interface CacheOptions {
    /** Durée de vie en ms */
    ttl?: number;

    /** Priorité de l'entrée (plus élevée = moins susceptible d'être évincée) */
    priority?: number;
}

/**
 * Interface pour une entrée dans le cache
 */
interface CacheEntry<T> {
    /** Donnée mise en cache */
    data: T;

    /** Timestamp de création */
    created: number;

    /** Timestamp d'expiration */
    expires: number;

    /** Timestamp du dernier accès */
    lastAccessed: number;

    /** Nombre d'accès */
    accessCount: number;

    /** Priorité de l'entrée */
    priority: number;
}

/**
 * Cache optimisé pour les expressions LSF
 */
export class ExpressionCache {
    /** Durée de vie par défaut (30 minutes) */
    private readonly DEFAULT_TTL = 30 * 60 * 1000;

    /** Taille maximale du cache en nombre d'entrées */
    private readonly MAX_ENTRIES = 1000;

    /** Cache interne */
    private cache: Map<string, CacheEntry<ExpressionResult>>;

    /** Statistiques du cache */
    private stats: {
        hits: number;
        misses: number;
        evictions: number;
    };

    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };

        // Lancer le nettoyage périodique
        this.startPeriodicCleanup();
    }

    /**
     * Récupère une entrée du cache
     * @param key Clé de l'entrée
     * @returns Données mises en cache ou undefined si non trouvée/expirée
     */
    public get(key: string): ExpressionResult | undefined {
        const entry = this.cache.get(key);

        // Vérifier si l'entrée existe et n'est pas expirée
        if (entry && entry.expires > Date.now()) {
            // Mettre à jour les statistiques d'accès
            entry.lastAccessed = Date.now();
            entry.accessCount++;
            this.stats.hits++;

            return entry.data;
        }

        // Si l'entrée est expirée, la supprimer
        if (entry) {
            this.cache.delete(key);
        }

        this.stats.misses++;
        return undefined;
    }

    /**
     * Stocke une entrée dans le cache
     * @param key Clé de l'entrée
     * @param data Données à mettre en cache
     * @param options Options de mise en cache
     */
    public set(key: string, data: ExpressionResult, options: CacheOptions = {}): void {
        // Vérifier si le cache a atteint sa capacité maximale
        if (this.cache.size >= this.MAX_ENTRIES && !this.cache.has(key)) {
            this.evictLeastValuable();
        }

        const now = Date.now();
        const ttl = options.ttl || this.DEFAULT_TTL;

        this.cache.set(key, {
            data,
            created: now,
            expires: now + ttl,
            lastAccessed: now,
            accessCount: 0,
            priority: options.priority || 1
        });
    }

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     * @returns true si la clé existe et n'est pas expirée
     */
    public has(key: string): boolean {
        const entry = this.cache.get(key);
        return !!entry && entry.expires > Date.now();
    }

    /**
     * Supprime une entrée du cache
     * @param key Clé à supprimer
     * @returns true si une entrée a été supprimée
     */
    public delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Vide entièrement le cache
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Récupère des statistiques sur le cache
     */
    public getStats(): {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
        evictions: number;
    } {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

        return {
            size: this.cache.size,
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate,
            evictions: this.stats.evictions
        };
    }

    /**
     * Démarre un nettoyage périodique du cache
     */
    private startPeriodicCleanup(): void {
        // Nettoyer le cache toutes les 5 minutes
        setInterval(() => {
            this.cleanupExpired();
        }, 5 * 60 * 1000);
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    private cleanupExpired(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expires <= now) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Évince l'entrée la moins précieuse du cache
     */
    private evictLeastValuable(): void {
        let leastValuableKey: string | null = null;
        let leastValue = Number.MAX_VALUE;
        const now = Date.now();

        // Calculer la valeur de chaque entrée en fonction de plusieurs facteurs
        for (const [key, entry] of this.cache.entries()) {
            // Entrées expirées ont la valeur minimale
            if (entry.expires <= now) {
                leastValuableKey = key;
                break;
            }

            // Formule de valeur: priorité * accessCount / (maintenant - lastAccessed)
            const recency = Math.max(1, now - entry.lastAccessed);
            const value = (entry.priority * (entry.accessCount + 1)) / (recency / 1000);

            if (value < leastValue) {
                leastValue = value;
                leastValuableKey = key;
            }
        }

        // Supprimer l'entrée la moins précieuse
        if (leastValuableKey) {
            this.cache.delete(leastValuableKey);
            this.stats.evictions++;
        }
    }
}