// src/ai/utils/Cache.ts
export class LRUCache<K, V> {
    private readonly capacity: number;
    private readonly cache = new Map<K, V>();

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    public get(key: K): V | undefined {
        if (!this.cache.has(key)) return undefined;

        // Rafraîchir l'élément en le déplaçant à la fin
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);

        return value;
    }

    public set(key: K, value: V): void {
        // Si la clé existe déjà, la supprimer d'abord
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Si le cache est plein, supprimer l'élément le plus ancien
        else if (this.cache.size >= this.capacity) {
            const iter = this.cache.keys().next();
            if (!iter.done) {
                this.cache.delete(iter.value);
            }
        }

        // Ajouter le nouvel élément
        this.cache.set(key, value);
    }

    public has(key: K): boolean {
        return this.cache.has(key);
    }

    public remove(key: K): void {
        this.cache.delete(key);
    }

    public removeByPrefix(prefix: string): void {
        // Créer un tableau temporaire pour stocker les clés à supprimer
        const keysToRemove: K[] = [];

        // Collecter toutes les clés correspondantes
        for (const key of this.cache.keys()) {
            // Vérifier si la clé est une chaîne et commence par le préfixe
            if (typeof key === 'string' && key.startsWith(prefix)) {
                keysToRemove.push(key as K);
            }
        }

        // Supprimer les clés
        for (const key of keysToRemove) {
            this.cache.delete(key);
        }
    }

    public clear(): void {
        this.cache.clear();
    }

    public get size(): number {
        return this.cache.size;
    }
}