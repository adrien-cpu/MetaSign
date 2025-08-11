// src/ai/api/core/middleware/CacheManager.ts
import { IAPIContext, APIRequest, NextFunction, IMiddleware, ResponseBody, APIResponse } from '@ai/api/core/types';
import { CacheLevel, CacheReplacementPolicy, CacheConfig } from '@ai/coordinators/types';
import crypto from 'crypto';

// Type pour les entrées en cache
interface CachedResponse<T = APIResponse<ResponseBody>> {
    response: T;
    timestamp: number;
    expires: number;
    hits: number;
    lastAccessed: number;
    size: number;
    priority: 'high' | 'medium' | 'low';
}

/**
 * Options pour la mise en cache d'une réponse
 */
export interface CacheOptions {
    ttl?: number | undefined;
    priority?: 'high' | 'medium' | 'low' | undefined;
    tags?: string[] | undefined;
    compressionEnabled?: boolean | undefined;
}

/**
 * Interface pour les stats du cache
 */
export interface CacheStats {
    size: number;
    entries: number;
    hits: number;
    misses: number;
    hitRate: number;
    missRate: number;
    evictions: number;
    totalRequests: number;
    averageAccessTime: number;
    memoryUsage: number;
}

/**
 * Gestionnaire de cache amélioré avec stratégies optimisées
 * S'intègre au composant SystemeAutoOptimisation du diagramme d'état
 */
export class CacheManager implements IMiddleware {
    private cache: Map<string, CachedResponse<APIResponse<ResponseBody>>> = new Map();
    private maxSize: number;
    private defaultTTL: number;
    private stats: CacheStats;
    private replacementPolicy: CacheReplacementPolicy;
    private compressionEnabled: boolean;
    private level: CacheLevel;
    private tagIndex: Map<string, Set<string>> = new Map();
    private accessTimings: number[] = [];

    /**
     * Crée une nouvelle instance du gestionnaire de cache
     * @param config Configuration du cache
     */
    constructor(config: CacheConfig) {
        this.maxSize = config.maxSize || 100 * 1024 * 1024; // 100 MB par défaut
        this.defaultTTL = config.defaultTTL || 3600000; // 1 heure par défaut
        this.replacementPolicy = config.replacementPolicy || CacheReplacementPolicy.LRU;
        this.compressionEnabled = config.compressionEnabled || false;
        this.level = config.level || CacheLevel.L1;

        this.stats = {
            size: 0,
            entries: 0,
            hits: 0,
            misses: 0,
            hitRate: 0,
            missRate: 0,
            evictions: 0,
            totalRequests: 0,
            averageAccessTime: 0,
            memoryUsage: 0
        };
    }

    /**
     * Traite une requête et vérifie le cache
     * @param context Contexte de la requête
     * @param next Fonction de middleware suivante
     */
    async process(context: IAPIContext, next: NextFunction): Promise<void> {
        const startTime = Date.now();
        this.stats.totalRequests++;

        // Vérifier si le contexte spécifie de ne pas utiliser le cache
        if (context.request.noCache) {
            await next();
            return;
        }

        const cacheKey = this.generateCacheKey(context.request);
        const cachedResponse = this.cache.get(cacheKey);

        if (cachedResponse && !this.isExpired(cachedResponse)) {
            // Cache hit
            const accessTime = Date.now() - startTime;
            this.accessTimings.push(accessTime);
            this.updateAccessStats(accessTime);

            cachedResponse.hits++;
            cachedResponse.lastAccessed = Date.now();

            // Assigner la réponse mise en cache au contexte
            context.response = cachedResponse.response;
            context.fromCache = true;

            this.stats.hits++;
            this.updateHitRates();

            return;
        }

        // Cache miss
        this.stats.misses++;
        this.updateHitRates();

        // Continuer le traitement
        await next();

        // Mettre en cache la réponse si approprié
        if (context.response && !context.doNotCache) {
            const cacheOptions: CacheOptions = {};

            if (context.cacheTTL !== undefined) {
                cacheOptions.ttl = context.cacheTTL;
            }

            if (context.cachePriority !== undefined) {
                cacheOptions.priority = context.cachePriority;
            }

            if (context.cacheTags !== undefined) {
                cacheOptions.tags = context.cacheTags;
            }

            this.cacheResponse(cacheKey, context.response, cacheOptions);
        }
    }

    /**
     * Récupère une entrée du cache
     * @param key Clé de cache
     * @returns Valeur en cache ou null si non trouvée/expirée
     */
    get<T = APIResponse<ResponseBody>>(key: string): T | null {
        const startTime = Date.now();
        const cachedItem = this.cache.get(key);

        if (!cachedItem) {
            this.stats.misses++;
            this.updateHitRates();
            return null;
        }

        if (this.isExpired(cachedItem)) {
            this.cache.delete(key);
            this.stats.entries--;
            this.stats.size -= cachedItem.size;

            this.stats.misses++;
            this.updateHitRates();
            return null;
        }

        // Mettre à jour les statistiques
        cachedItem.hits++;
        cachedItem.lastAccessed = Date.now();

        this.stats.hits++;
        this.updateHitRates();

        const accessTime = Date.now() - startTime;
        this.updateAccessStats(accessTime);

        return cachedItem.response as unknown as T;
    }

    /**
     * Stocke une valeur dans le cache
     * @param key Clé de cache
     * @param value Valeur à mettre en cache
     * @param options Options de mise en cache
     * @returns true si stockée avec succès
     */
    set<T extends APIResponse<ResponseBody>>(key: string, value: T, options: CacheOptions = {}): boolean {
        const serialized = this.serialize(value);
        const size = this.calculateSize(serialized);

        // Vérifier si l'élément est trop gros pour le cache
        if (size > this.maxSize * 0.1) {
            console.warn(`Cache item too large: ${key} (${size} bytes)`);
            return false;
        }

        // Vérifier si le cache a besoin d'être nettoyé
        if (this.stats.size + size > this.maxSize) {
            this.evict(size);
        }

        const ttl = options.ttl || this.defaultTTL;
        const expires = Date.now() + ttl;
        const priority = options.priority || 'medium';

        // Créer l'entrée de cache
        const cachedItem: CachedResponse<T> = {
            response: value,
            timestamp: Date.now(),
            expires,
            hits: 0,
            lastAccessed: Date.now(),
            size,
            priority
        };

        // Ajouter au cache
        this.cache.set(key, cachedItem as CachedResponse<APIResponse<ResponseBody>>);

        // Mettre à jour les statistiques
        this.stats.entries++;
        this.stats.size += size;

        // Indexer par tags si spécifiés
        if (options.tags) {
            for (const tag of options.tags) {
                if (!this.tagIndex.has(tag)) {
                    this.tagIndex.set(tag, new Set());
                }
                const tagSet = this.tagIndex.get(tag);
                if (tagSet) {
                    tagSet.add(key);
                }
            }
        }

        return true;
    }

    /**
     * Supprime une entrée du cache
     * @param key Clé à supprimer
     * @returns true si supprimée avec succès
     */
    delete(key: string): boolean {
        const cachedItem = this.cache.get(key);

        if (!cachedItem) {
            return false;
        }

        // Mettre à jour les statistiques
        this.stats.entries--;
        this.stats.size -= cachedItem.size;

        // Supprimer des indexes de tags
        for (const [tag, keys] of this.tagIndex.entries()) {
            if (keys.has(key)) {
                keys.delete(key);
                if (keys.size === 0) {
                    this.tagIndex.delete(tag);
                }
            }
        }

        return this.cache.delete(key);
    }

    /**
     * Invalide toutes les entrées avec un tag spécifique
     * @param tag Tag à invalider
     * @returns Nombre d'entrées invalidées
     */
    invalidateByTag(tag: string): number {
        const keys = this.tagIndex.get(tag);

        if (!keys || keys.size === 0) {
            return 0;
        }

        let count = 0;
        for (const key of keys) {
            if (this.delete(key)) {
                count++;
            }
        }

        this.tagIndex.delete(tag);
        return count;
    }

    /**
     * Vide complètement le cache
     */
    clear(): void {
        this.cache.clear();
        this.tagIndex.clear();
        this.stats.entries = 0;
        this.stats.size = 0;
        this.stats.evictions = 0;
    }

    /**
     * Récupère les statistiques du cache
     * @returns Statistiques actuelles
     */
    getStats(): CacheStats {
        return { ...this.stats };
    }

    /**
     * Vérifie si une entrée en cache est expirée
     * @param cachedItem Entrée à vérifier
     * @returns true si l'entrée est expirée
     */
    private isExpired<T>(cachedItem: CachedResponse<T>): boolean {
        return Date.now() > cachedItem.expires;
    }

    /**
 * Génère une clé de cache pour une requête
 * @param request Requête API
 * @returns Clé de cache
 */
    private generateCacheKey(request: APIRequest): string {
        // Extraire les éléments pertinents de la requête
        const relevantParts = {
            path: request.path,
            method: request.method,
            params: request.params,
            query: request.query,
            // Exclure les éléments sensibles comme les headers d'authentification
            headers: this.filterSensitiveHeaders(request.headers || {})
        };

        return crypto
            .createHash('sha256')
            .update(JSON.stringify(relevantParts))
            .digest('hex');
    }


    /**
     * Filtre les en-têtes sensibles
     * @param headers En-têtes HTTP
     * @returns En-têtes filtrés
     */
    private filterSensitiveHeaders(headers: Record<string, string>): Record<string, string> {
        const filtered: Record<string, string> = {};
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

        for (const [key, value] of Object.entries(headers)) {
            if (!sensitiveHeaders.includes(key.toLowerCase())) {
                filtered[key] = value;
            }
        }

        return filtered;
    }

    /**
     * Met en cache une réponse API
     * @param key Clé de cache
     * @param response Réponse à mettre en cache
     * @param options Options de mise en cache
     */
    private cacheResponse(key: string, response: APIResponse<ResponseBody>, options: CacheOptions = {}): void {
        this.set(key, response, options);
    }

    /**
     * Sérialise une valeur pour le cache
     * @param value Valeur à sérialiser
     * @returns Valeur sérialisée
     */
    private serialize(value: unknown): string {
        return JSON.stringify(value);
    }

    /**
     * Calcule la taille approximative en octets d'une valeur sérialisée
     * @param serialized Valeur sérialisée
     * @returns Taille en octets
     */
    private calculateSize(serialized: string): number {
        // Approximation: 2 octets par caractère en UTF-16
        return serialized.length * 2;
    }

    /**
     * Évince des entrées du cache pour libérer de l'espace
     * @param requiredSpace Espace requis en octets
     */
    private evict(requiredSpace: number): void {
        if (this.cache.size === 0) {
            return;
        }

        let evictedSpace = 0;
        const entries = Array.from(this.cache.entries());

        // Appliquer la stratégie d'éviction appropriée
        switch (this.replacementPolicy) {
            case CacheReplacementPolicy.LRU:
                // Least Recently Used
                entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
                break;

            case CacheReplacementPolicy.LFU:
                // Least Frequently Used
                entries.sort(([, a], [, b]) => a.hits - b.hits);
                break;

            case CacheReplacementPolicy.FIFO:
                // First In, First Out
                entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
                break;

            case CacheReplacementPolicy.RANDOM:
                // Aléatoire - ne nécessite pas de tri car nous allons mélanger
                for (let i = entries.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [entries[i], entries[j]] = [entries[j], entries[i]];
                }
                break;
        }

        // Ne pas éviction les entrées prioritaires sauf si nécessaire
        const priorityOrder: Record<string, number> = { 'low': 0, 'medium': 1, 'high': 2 };
        entries.sort(([, a], [, b]) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        // Éviction des entrées jusqu'à ce que suffisamment d'espace soit libéré
        for (const [key, entry] of entries) {
            if (evictedSpace >= requiredSpace) {
                break;
            }

            this.cache.delete(key);
            evictedSpace += entry.size;
            this.stats.evictions++;
            this.stats.size -= entry.size;
            this.stats.entries--;

            // Supprimer des index de tags
            for (const keys of this.tagIndex.values()) {
                keys.delete(key);
            }
        }

        // Nettoyer les tags vides
        for (const [tag, keys] of this.tagIndex.entries()) {
            if (keys.size === 0) {
                this.tagIndex.delete(tag);
            }
        }
    }

    /**
     * Met à jour les taux de succès et d'échec
     */
    private updateHitRates(): void {
        const total = this.stats.hits + this.stats.misses;
        if (total > 0) {
            this.stats.hitRate = (this.stats.hits / total) * 100;
            this.stats.missRate = (this.stats.misses / total) * 100;
        }
    }

    /**
     * Met à jour les statistiques d'accès
     * @param accessTime Temps d'accès en ms
     */
    private updateAccessStats(accessTime: number): void {
        // Limiter le tableau des temps d'accès à 1000 entrées
        if (this.accessTimings.length > 1000) {
            this.accessTimings.shift();
        }

        this.accessTimings.push(accessTime);

        // Recalculer la moyenne
        const sum = this.accessTimings.reduce((acc, time) => acc + time, 0);
        this.stats.averageAccessTime = sum / this.accessTimings.length;
    }
}