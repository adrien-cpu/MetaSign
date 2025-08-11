/**
 * src/ai/api/distributed/aggregation/cache/CacheManager.ts
 * 
 * Gestionnaire de cache générique avec expiration et taille maximale
 */

/**
 * Gestionnaire de cache générique avec stratégie d'éviction
 * basée sur le temps et la taille maximale.
 */
export class CacheManager<K, V> {
    private readonly cache: Map<K, { value: V; timestamp: number }>;
    private readonly cacheExpiryMs: number;
    private readonly maxCacheEntries: number;

    /**
     * Crée un nouveau gestionnaire de cache
     * 
     * @param cacheExpiryMs - Durée de validité des entrées en ms
     * @param maxCacheEntries - Nombre maximal d'entrées dans le cache
     */
    constructor(cacheExpiryMs: number, maxCacheEntries: number) {
        this.cache = new Map<K, { value: V; timestamp: number }>();
        this.cacheExpiryMs = cacheExpiryMs;
        this.maxCacheEntries = maxCacheEntries;
    }

    /**
     * Récupère une valeur du cache si elle existe et n'est pas expirée
     * 
     * @param key - Clé à rechercher
     * @returns Valeur associée ou undefined si absente ou expirée
     */
    public get(key: K): V | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        // Vérifier si l'entrée a expiré
        const cacheAge = Date.now() - entry.timestamp;
        if (cacheAge > this.cacheExpiryMs) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    /**
     * Ajoute ou met à jour une valeur dans le cache
     * 
     * @param key - Clé à définir
     * @param value - Valeur à stocker
     */
    public set(key: K, value: V): void {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });

        this.performEvictionIfNeeded();
    }

    /**
     * Supprime une entrée du cache
     * 
     * @param key - Clé à supprimer
     * @returns True si l'entrée existait et a été supprimée
     */
    public delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * Vérifie si une clé existe dans le cache (sans considération d'expiration)
     * 
     * @param key - Clé à vérifier
     * @returns True si la clé existe
     */
    public has(key: K): boolean {
        return this.cache.has(key);
    }

    /**
     * Vide complètement le cache
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Retourne le nombre d'entrées dans le cache
     */
    public size(): number {
        return this.cache.size;
    }

    /**
     * Retourne des statistiques sur le cache
     */
    public getStats(): Record<string, number> {
        return {
            cacheSize: this.size(),
            cacheMaxSize: this.maxCacheEntries,
            cacheExpiryMs: this.cacheExpiryMs
        };
    }

    /**
     * Effectue l'éviction des entrées les plus anciennes si nécessaire
     */
    private performEvictionIfNeeded(): void {
        if (this.cache.size <= this.maxCacheEntries) {
            return;
        }

        // Trouver et supprimer les entrées les plus anciennes
        const entriesToEvict = this.cache.size - this.maxCacheEntries;

        if (entriesToEvict > 0) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            // Supprimer les entrées les plus anciennes
            for (let i = 0; i < entriesToEvict; i++) {
                if (entries[i]) {
                    this.cache.delete(entries[i][0]);
                }
            }
        }
    }
}