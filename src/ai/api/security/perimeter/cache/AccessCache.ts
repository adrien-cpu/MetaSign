// src/ai/api/security/perimeter/cache/AccessCache.ts

import { AccessResult } from '@security/types/perimeter-types';

export class AccessCache {
    private readonly cache = new Map<string, AccessResult>();
    private readonly cacheDuration: number;

    constructor(cacheDuration: number = 5 * 60 * 1000) { // 5 minutes par défaut
        this.cacheDuration = cacheDuration;
    }

    /**
     * Génère une clé de cache pour une requête
     * @param source - Zone source
     * @param target - Zone cible
     * @param userId - ID utilisateur
     * @param operation - Opération
     */
    generateCacheKey(source: string, target: string, userId: string, operation: string): string {
        return `${source}:${target}:${userId}:${operation}`;
    }

    /**
     * Récupère un résultat depuis le cache
     * @param key - Clé de cache
     */
    getCachedResult(key: string): AccessResult | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.auditTrail.timestamp < this.cacheDuration) {
            return cached;
        }
        this.cache.delete(key);
        return null;
    }

    /**
     * Met en cache un résultat
     * @param key - Clé de cache
     * @param result - Résultat à mettre en cache
     */
    cacheResult(key: string, result: AccessResult): void {
        this.cache.set(key, result);
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    cleanupCache(): void {
        const now = Date.now();
        for (const [key, result] of this.cache) {
            if (now - result.auditTrail.timestamp >= this.cacheDuration) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Vide le cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Récupère la taille actuelle du cache
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}