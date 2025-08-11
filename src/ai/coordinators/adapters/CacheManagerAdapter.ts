// src/ai/coordinators/adapters/CacheManagerAdapter.ts

import { EnhancedCacheManager } from '../../managers/EnhancedCacheManager';

/**
 * Interface du CacheManager attendu par le système d'expressions
 */
export interface ExpressionCacheManager {
    cache: Map<string, unknown>;
    maxSize: number;
    defaultTTL: number;
    stats: {
        hits: number;
        misses: number;
    };
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    clear(): void;
    getStats(): unknown;
}

/**
 * Adaptateur qui convertit notre EnhancedCacheManager interne
 * vers l'interface attendue par le système d'expressions
 */
export class CacheManagerAdapter implements ExpressionCacheManager {
    // Propriétés requises par l'interface ExpressionCacheManager
    public cache: Map<string, unknown> = new Map();
    public maxSize: number = 0;
    public defaultTTL: number = 0;
    public stats = {
        hits: 0,
        misses: 0
    };

    /**
     * Constructeur
     * @param cacheManager L'instance de notre EnhancedCacheManager interne à adapter
     */
    constructor(private cacheManager: EnhancedCacheManager) {
        // Initialiser les propriétés avec les valeurs du cacheManager si disponibles
        this.maxSize = cacheManager.getMaxSize?.() || 0;
        this.defaultTTL = cacheManager.getDefaultTTL?.() || 0;

        // Initialiser les stats si disponibles
        const stats = cacheManager.getStats?.();
        if (stats) {
            this.stats.hits = stats.hits || 0;
            this.stats.misses = stats.misses || 0;
        }
    }

    /**
     * Récupère une valeur du cache
     * @param key Clé à récupérer
     */
    public get(key: string): unknown {
        if (typeof this.cacheManager.get === 'function') {
            return this.cacheManager.get(key);
        }
        return null;
    }

    /**
     * Définit une valeur dans le cache
     * @param key Clé à définir
     * @param value Valeur à stocker
     */
    public set(key: string, value: unknown): void {
        if (typeof this.cacheManager.set === 'function') {
            this.cacheManager.set(key, value);
        }
    }

    /**
     * Vide le cache
     */
    public clear(): void {
        if (typeof this.cacheManager.clear === 'function') {
            this.cacheManager.clear();
        }
    }

    /**
     * Récupère les statistiques du cache
     */
    public getStats(): unknown {
        if (typeof this.cacheManager.getStats === 'function') {
            return this.cacheManager.getStats();
        }
        return this.stats;
    }
}