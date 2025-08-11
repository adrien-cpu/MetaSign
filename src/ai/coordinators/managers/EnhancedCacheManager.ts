import { CacheManager } from '../cache/CacheManager';
import { ICacheManager } from '../interfaces/IOrchestrator';
import { CacheConfig, CacheLevel } from '../types';

// Définir une interface compatible pour les statistiques de cache
// Assurez-vous d'inclure toutes les propriétés obligatoires de l'interface CacheStats originale
interface CacheStatsInterface {
    size: number;
    entries: number;
    hits: number;
    misses: number;
    hitRate: number;
    missRate: number;
    totalRequests: number;
    averageAccessTime: number;
    memoryUsage: number;
    evictions: number; // Ajouté cette propriété manquante
    [key: string]: number; // Signature d'index pour permettre l'accès dynamique aux propriétés
}

// Créer un type pour les statistiques brutes, qui peuvent avoir une structure variée
type RawCacheStats = Record<string, unknown>;

// Définir les interfaces manquantes si elles ne sont pas disponibles
interface CacheOptions {
    ttl?: number;
    level?: CacheLevel;
    tags?: string[];
}

export class EnhancedCacheManager implements ICacheManager {
    private cacheManager: CacheManager;

    constructor(config: CacheConfig) {
        this.cacheManager = new CacheManager(config);
    }

    public get<T>(key: string): T | null {
        const result = this.cacheManager.get<T>(key);
        return result === undefined ? null : result;
    }

    public set<T>(key: string, value: T, options?: CacheOptions): boolean {
        if (options) {
            this.cacheManager.set(key, value, options.ttl, options.level);
        } else {
            this.cacheManager.set(key, value);
        }
        return true;
    }

    public invalidateByTag(tag: string): number {
        console.log(`Invalidating cache entries with tag: ${tag}`);
        return 0;
    }

    public has(key: string): boolean {
        return this.cacheManager.has(key);
    }

    public delete(key: string): boolean {
        return this.cacheManager.delete(key);
    }

    public clear(): void {
        this.cacheManager.clear();
    }

    public getStats(): CacheStatsInterface {
        const rawStats = this.cacheManager.getStats() as RawCacheStats;

        // Créer un nouvel objet qui contient toutes les propriétés attendues
        const stats: CacheStatsInterface = {
            size: 0,
            entries: 0,
            hits: 0,
            misses: 0,
            hitRate: 0,
            missRate: 0,
            totalRequests: 0,
            averageAccessTime: 0,
            memoryUsage: 0,
            evictions: 0 // Initialiser la propriété evictions
        };

        // Copier les propriétés depuis rawStats de manière typée
        if (typeof rawStats === 'object' && rawStats !== null) {
            // Liste des propriétés que nous voulons copier
            const propertyKeys = [
                'size', 'entries', 'hits', 'misses',
                'averageAccessTime', 'memoryUsage', 'evictions'
            ];

            // Copier uniquement les propriétés numériques connues
            propertyKeys.forEach(key => {
                if (key in rawStats && typeof rawStats[key] === 'number') {
                    stats[key] = rawStats[key] as number;
                }
            });
        }

        // Calculer les statistiques dérivées
        stats.totalRequests = stats.hits + stats.misses;

        if (stats.totalRequests > 0) {
            stats.hitRate = stats.hits / stats.totalRequests;
            stats.missRate = stats.misses / stats.totalRequests;
        }

        return stats;
    }
}