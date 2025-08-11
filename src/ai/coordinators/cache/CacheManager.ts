//src/ai/coordinators/cache/CacheManager.ts

import {
    CacheConfig,
    CacheLevel,
    CacheReplacementPolicy
} from '../types';
import { ICacheManager } from '../interfaces/IOrchestrator';

/**
 * Structure d'une entrée de cache
 */
interface CacheEntry<T> {
    key: string;
    value: T;
    level: CacheLevel;
    expiresAt: number | null;
    lastAccessed: number;
    accessCount: number;
    size: number;
}

/**
 * Gestionnaire de cache multi-niveaux pour l'orchestrateur central
 * Implémente une stratégie de cache à plusieurs niveaux avec différentes politiques de remplacement
 */
export class CacheManager implements ICacheManager {
    private readonly cache: Map<string, CacheEntry<unknown>> = new Map();
    private readonly config: CacheConfig;
    private stats: {
        hits: number;
        misses: number;
        sets: number;
        deletes: number;
        evictions: number;
        size: number;
    };
    private cleanupTimer: NodeJS.Timeout | null = null;

    /**
     * Crée une nouvelle instance de CacheManager
     * @param config Configuration du cache
     */
    constructor(config: CacheConfig) {
        this.config = config;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            size: 0
        };

        // Démarrer le nettoyage périodique
        this.startCleanup();
    }

    /**
     * Récupère un élément du cache
     * @param key Clé de l'élément
     * @returns Valeur de l'élément ou undefined si non trouvé ou expiré
     */
    public get<T>(key: string): T | undefined {
        const entry = this.cache.get(key);

        // Si l'entrée n'existe pas ou est expirée
        if (!entry || (entry.expiresAt !== null && entry.expiresAt < Date.now())) {
            if (entry) {
                // Supprimer l'entrée expirée
                this.delete(key);
            }
            this.stats.misses++;
            return undefined;
        }

        // Mettre à jour les statistiques d'accès
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        this.stats.hits++;

        return entry.value as T;
    }

    /**
     * Ajoute ou met à jour un élément dans le cache
     * @param key Clé de l'élément
     * @param value Valeur à stocker
     * @param ttl Durée de vie en millisecondes (optionnel)
     * @param level Niveau de cache (optionnel)
     */
    public set<T>(key: string, value: T, ttl?: number, level?: CacheLevel): void {
        // Estimer la taille de la valeur
        const size = this.estimateSize(value);

        // Vérifier si le cache a atteint sa taille maximale
        if (this.stats.size + size > this.config.maxSize) {
            this.evict(size);
        }

        // Préparer l'entrée de cache
        const expiresAt = ttl !== undefined ? Date.now() + ttl : (this.config.defaultTTL > 0 ? Date.now() + this.config.defaultTTL : null);
        const cacheLevel = level || CacheLevel.L1;

        const entry: CacheEntry<unknown> = {
            key,
            value,
            level: cacheLevel,
            expiresAt,
            lastAccessed: Date.now(),
            accessCount: 0,
            size
        };

        // Ajouter ou mettre à jour l'entrée
        const existingEntry = this.cache.get(key);
        if (existingEntry) {
            this.stats.size -= existingEntry.size;
        }

        this.cache.set(key, entry);
        this.stats.size += size;
        this.stats.sets++;
    }

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     * @returns true si la clé existe et n'est pas expirée, false sinon
     */
    public has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        // Vérifier si l'entrée est expirée
        if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Supprime un élément du cache
     * @param key Clé de l'élément à supprimer
     * @returns true si l'élément a été supprimé, false s'il n'existait pas
     */
    public delete(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        this.stats.size -= entry.size;
        this.stats.deletes++;
        return this.cache.delete(key);
    }

    /**
     * Vide le cache
     */
    public clear(): void {
        this.cache.clear();
        this.stats.size = 0;
    }

    /**
     * Récupère les statistiques du cache
     * @returns Statistiques du cache
     */
    public getStats(): Record<string, number> {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? this.stats.hits / total : 0;
        const missRate = total > 0 ? this.stats.misses / total : 0;

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            evictions: this.stats.evictions,
            size: this.stats.size,
            entryCount: this.cache.size,
            hitRate,
            missRate,
            utilization: this.config.maxSize > 0 ? this.stats.size / this.config.maxSize : 0
        };
    }

    /**
     * Définit un préchargeur de cache
     * @param preloader Fonction de préchargement
     */
    public setPrefetcher(preloader: (keys: string[]) => Promise<void>): void {
        // Implémenter la logique de préchargement prédictif
        if (this.config.predictionEnabled) {
            // Collecter les clés fréquemment accédées
            const frequentKeys = this.getFrequentlyAccessedKeys();

            // Précharger les clés
            preloader(frequentKeys).catch(error => {
                console.error('Error during cache prefetching:', error);
            });
        }
    }

    /**
     * Précharge des éléments de manière prédictive
     * @param pattern Modèle de clé à précharger
     */
    public prefetch(pattern: string): void {
        // Implémenter une logique de préchargement basée sur des patterns
        if (!this.config.predictionEnabled) {
            return;
        }

        // Rechercher des clés correspondant au pattern
        const matchingKeys = Array.from(this.cache.keys()).filter(key => key.startsWith(pattern));

        // Récupérer ces clés pour mettre à jour leurs statistiques d'accès
        matchingKeys.forEach(key => this.get(key));
    }

    /**
     * Arrête le gestionnaire de cache et ses timers
     */
    public shutdown(): void {
        // Arrêter le nettoyage périodique
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    /**
     * Démarre le nettoyage périodique du cache
     */
    private startCleanup(): void {
        // Nettoyer le cache toutes les minutes
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 60000);
    }

    /**
     * Nettoie le cache en supprimant les entrées expirées
     */
    private cleanup(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt !== null && entry.expiresAt < now) {
                this.delete(key);
            }
        }
    }

    /**
     * Expulse des éléments du cache pour libérer de l'espace
     * @param requiredSpace Espace requis en octets
     */
    private evict(requiredSpace: number): void {
        // Si le cache est vide, on ne peut rien expulser
        if (this.cache.size === 0) {
            return;
        }

        // Préparer les entrées pour l'expulsion
        const entries = Array.from(this.cache.values());
        let freedSpace = 0;

        // Trier selon la politique de remplacement
        switch (this.config.replacementPolicy) {
            case CacheReplacementPolicy.LRU:
                // Least Recently Used
                entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
                break;

            case CacheReplacementPolicy.LFU:
                // Least Frequently Used
                entries.sort((a, b) => a.accessCount - b.accessCount);
                break;

            case CacheReplacementPolicy.FIFO:
                // First In First Out (déjà trié par ordre d'insertion)
                break;

            case CacheReplacementPolicy.ADAPTIVE:
                // Stratégie adaptative basée sur la fréquence et la récence
                entries.sort((a, b) => {
                    const recencyA = (Date.now() - a.lastAccessed) / 1000; // en secondes
                    const recencyB = (Date.now() - b.lastAccessed) / 1000;

                    // Combiner fréquence et récence
                    const scoreA = a.accessCount / Math.max(1, recencyA);
                    const scoreB = b.accessCount / Math.max(1, recencyB);

                    return scoreA - scoreB;
                });
                break;
        }

        // Expulser des entrées jusqu'à libérer assez d'espace
        let evictedCount = 0;

        for (const entry of entries) {
            this.delete(entry.key);
            freedSpace += entry.size;
            evictedCount++;

            if (freedSpace >= requiredSpace) {
                break;
            }

            // Si on a expulsé plus de 25% du cache, arrêter
            if (evictedCount > this.cache.size * 0.25) {
                break;
            }
        }

        this.stats.evictions += evictedCount;
    }

    /**
     * Estime la taille d'une valeur en mémoire
     * @param value Valeur à estimer
     * @returns Taille estimée en octets
     */
    private estimateSize(value: unknown): number {
        if (value === null || value === undefined) {
            return 8;
        }

        if (typeof value === 'boolean' || typeof value === 'number') {
            return 8;
        }

        if (typeof value === 'string') {
            return value.length * 2 + 8;
        }

        if (Array.isArray(value)) {
            return value.reduce((size, item) => size + this.estimateSize(item), 16);
        }

        if (typeof value === 'object') {
            let size = 16; // Base object overhead

            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    size += key.length * 2 + 8; // Key size
                    // @ts-expect-error Accès indexé à un objet
                    size += this.estimateSize(value[key]); // Value size
                }
            }

            return size;
        }

        return 8; // Fallback
    }

    /**
     * Récupère les clés fréquemment accédées
     * @returns Liste des clés fréquemment accédées
     */
    private getFrequentlyAccessedKeys(): string[] {
        const entries = Array.from(this.cache.values());

        // Trier par fréquence d'accès
        entries.sort((a, b) => b.accessCount - a.accessCount);

        // Retourner les 10% les plus fréquemment accédées
        const count = Math.max(1, Math.floor(entries.length * 0.1));
        return entries.slice(0, count).map(entry => entry.key);
    }
}