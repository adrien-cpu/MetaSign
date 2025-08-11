// src/ai/specialized/cultural/cache/CulturalCache.ts

/**
 * Configuration du cache culturel
 */
interface CulturalCacheConfig {
    maxSize: number;
    ttl: number; // Time-to-live en millisecondes
}

/**
 * Entrée du cache
 */
interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

/**
 * Cache pour les opérations culturelles
 * Optimise les performances en mémorisant les résultats coûteux
 */
export class CulturalCache<K, V> {
    private cache = new Map<string, CacheEntry<V>>();
    private config: CulturalCacheConfig;

    constructor(config: Partial<CulturalCacheConfig> = {}) {
        this.config = {
            maxSize: config.maxSize || 100,
            ttl: config.ttl || 5 * 60 * 1000 // 5 minutes par défaut
        };
    }

    /**
     * Récupère une valeur du cache
     * @param key Clé
     * @param keyGenerator Fonction génératrice de clé (optionnelle)
     * @returns Valeur si trouvée, undefined sinon
     */
    get(key: K, keyGenerator?: (key: K) => string): V | undefined {
        const cacheKey = keyGenerator ? keyGenerator(key) : JSON.stringify(key);
        const entry = this.cache.get(cacheKey);

        if (!entry) {
            return undefined;
        }

        // Vérifier si l'entrée est expirée
        if (Date.now() - entry.timestamp > this.config.ttl) {
            this.cache.delete(cacheKey);
            return undefined;
        }

        return entry.value;
    }

    /**
     * Met une valeur dans le cache
     * @param key Clé
     * @param value Valeur
     * @param keyGenerator Fonction génératrice de clé (optionnelle)
     * @returns Valeur stockée
     */
    set(key: K, value: V, keyGenerator?: (key: K) => string): V {
        const cacheKey = keyGenerator ? keyGenerator(key) : JSON.stringify(key);

        // Vérifier si le cache a atteint sa taille maximale
        if (this.cache.size >= this.config.maxSize) {
            // Stratégie d'éviction LRU (Least Recently Used)
            const oldestKey = this.findOldestKey();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(cacheKey, {
            value,
            timestamp: Date.now()
        });

        return value;
    }

    /**
     * Trouve la clé la plus ancienne du cache
     * @returns La clé la plus ancienne ou undefined si le cache est vide
     */
    private findOldestKey(): string | undefined {
        let oldestKey: string | undefined;
        let oldestTimestamp = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    /**
     * Invalide une entrée du cache
     * @param key Clé
     * @param keyGenerator Fonction génératrice de clé (optionnelle)
     * @returns true si l'entrée a été supprimée, false sinon
     */
    invalidate(key: K, keyGenerator?: (key: K) => string): boolean {
        const cacheKey = keyGenerator ? keyGenerator(key) : JSON.stringify(key);
        return this.cache.delete(cacheKey);
    }

    /**
     * Vide le cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Valide toutes les entrées du cache et supprime les entrées expirées
     * @returns Nombre d'entrées supprimées
     */
    validate(): number {
        const now = Date.now();
        let removedCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.config.ttl) {
                this.cache.delete(key);
                removedCount++;
            }
        }

        return removedCount;
    }

    /**
     * Récupère ou calcule une valeur
     * @param key Clé
     * @param producer Fonction qui produit la valeur si elle n'est pas dans le cache
     * @param keyGenerator Fonction génératrice de clé (optionnelle)
     * @returns Valeur depuis le cache ou calculée
     */
    async getOrCompute(key: K, producer: () => Promise<V>, keyGenerator?: (key: K) => string): Promise<V> {
        const cachedValue = this.get(key, keyGenerator);
        if (cachedValue !== undefined) {
            return cachedValue;
        }

        const value = await producer();
        return this.set(key, value, keyGenerator);
    }
}