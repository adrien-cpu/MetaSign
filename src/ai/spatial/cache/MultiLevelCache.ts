// src/ai/spatial/cache/MultiLevelCache.ts

import { Observable } from '../../utils/Observable';

/**
 * Types de cache supportés
 */
export enum CacheLevel {
    L1 = 'l1', // Cache rapide pour accès très fréquents (mémoire)
    L2 = 'l2', // Cache secondaire pour accès moyennement fréquents
    PREDICTIVE = 'predictive' // Cache prédictif pour préchargement
}

/**
 * Politique d'éviction de cache
 */
export enum EvictionPolicy {
    LRU = 'lru', // Least Recently Used
    LFU = 'lfu', // Least Frequently Used
    FIFO = 'fifo', // First In First Out
    ADAPTIVE = 'adaptive' // Adaptatif basé sur plusieurs facteurs
}

/**
 * Stratégie de préchargement
 */
export enum PreloadStrategy {
    NONE = 'none',
    ADJACENT = 'adjacent', // Précharger les éléments adjacents
    PATTERN = 'pattern', // Précharger basé sur des patterns d'utilisation
    HYBRID = 'hybrid' // Combinaison de stratégies
}

/**
 * Configuration du cache
 */
export interface CacheConfig {
    levels: {
        [CacheLevel.L1]?: {
            maxSize: number;
            evictionPolicy: EvictionPolicy;
            ttl?: number; // Time-to-live en millisecondes
        };
        [CacheLevel.L2]?: {
            maxSize: number;
            evictionPolicy: EvictionPolicy;
            ttl?: number;
        };
        [CacheLevel.PREDICTIVE]?: {
            maxSize: number;
            evictionPolicy: EvictionPolicy;
            ttl?: number;
            preloadStrategy: PreloadStrategy;
        };
    };
    defaultTTL?: number; // TTL par défaut pour tous les niveaux
    metrics?: {
        enabled: boolean;
        detailedStats?: boolean;
    };
}

/**
 * Métadonnées d'un élément en cache
 */
interface CacheItemMetadata {
    key: string;
    timestamp: number; // Timestamp d'ajout ou de dernier accès
    lastAccessed: number; // Timestamp du dernier accès
    accessCount: number; // Nombre d'accès
    size: number; // Taille estimée en octets
    level: CacheLevel; // Niveau de cache actuel
    expiresAt?: number; // Timestamp d'expiration
}

/**
 * Élément en cache avec ses métadonnées
 */
interface CacheItem<T> {
    data: T;
    metadata: CacheItemMetadata;
}

/**
 * Événement de cache
 */
export interface CacheEvent {
    type: 'hit' | 'miss' | 'add' | 'evict' | 'expire' | 'preload';
    key: string;
    level: CacheLevel;
    timestamp: number;
    details?: Record<string, unknown>;
}

/**
 * Statistiques du cache
 */
export interface CacheStats {
    hits: {
        [CacheLevel.L1]: number;
        [CacheLevel.L2]: number;
        [CacheLevel.PREDICTIVE]: number;
        total: number;
    };
    misses: number;
    evictions: {
        [CacheLevel.L1]: number;
        [CacheLevel.L2]: number;
        [CacheLevel.PREDICTIVE]: number;
        total: number;
    };
    currentSize: {
        [CacheLevel.L1]: number;
        [CacheLevel.L2]: number;
        [CacheLevel.PREDICTIVE]: number;
        total: number;
    };
    itemCount: {
        [CacheLevel.L1]: number;
        [CacheLevel.L2]: number;
        [CacheLevel.PREDICTIVE]: number;
        total: number;
    };
    hitRatio: number;
    averageAccessTime: number;
    preloadCount: number;
    preloadHitRatio: number;
}

/**
 * Classe de cache multi-niveaux avec préchargement prédictif
 * Optimisée pour les performances avec trois niveaux de cache
 */
export class MultiLevelCache<T> extends Observable<CacheEvent> {
    private caches: {
        [key in CacheLevel]?: Map<string, CacheItem<T>>;
    } = {};

    private config: CacheConfig;
    private stats: CacheStats;
    private accessPatterns: Map<string, Set<string>> = new Map();
    private accessTimes: Map<string, number[]> = new Map();

    /**
     * Construit un cache multi-niveaux
     * @param config Configuration du cache
     */
    constructor(config: CacheConfig) {
        super();

        // Configuration par défaut si non spécifiée
        this.config = this.mergeWithDefaultConfig(config);

        // Initialiser les niveaux de cache
        for (const level of Object.values(CacheLevel)) {
            if (this.config.levels[level]) {
                this.caches[level] = new Map<string, CacheItem<T>>();
            }
        }

        // Initialiser les statistiques
        this.stats = this.createEmptyStats();

        // Démarrer le nettoyage périodique
        this.startPeriodicCleanup();
    }

    /**
     * Fusionne la configuration fournie avec la configuration par défaut
     */
    private mergeWithDefaultConfig(config: Partial<CacheConfig>): CacheConfig {
        const defaultConfig: CacheConfig = {
            levels: {
                [CacheLevel.L1]: {
                    maxSize: 100,
                    evictionPolicy: EvictionPolicy.LRU,
                    ttl: 60000 // 1 minute
                },
                [CacheLevel.L2]: {
                    maxSize: 500,
                    evictionPolicy: EvictionPolicy.LFU,
                    ttl: 300000 // 5 minutes
                },
                [CacheLevel.PREDICTIVE]: {
                    maxSize: 200,
                    evictionPolicy: EvictionPolicy.ADAPTIVE,
                    ttl: 600000, // 10 minutes
                    preloadStrategy: PreloadStrategy.PATTERN
                }
            },
            defaultTTL: 300000, // 5 minutes
            metrics: {
                enabled: true,
                detailedStats: false
            }
        };

        return {
            levels: {
                ...defaultConfig.levels,
                ...config.levels
            },
            defaultTTL: config.defaultTTL ?? defaultConfig.defaultTTL,
            metrics: {
                ...defaultConfig.metrics,
                ...config.metrics
            }
        };
    }

    /**
     * Crée les statistiques initiales vides
     */
    private createEmptyStats(): CacheStats {
        return {
            hits: {
                [CacheLevel.L1]: 0,
                [CacheLevel.L2]: 0,
                [CacheLevel.PREDICTIVE]: 0,
                total: 0
            },
            misses: 0,
            evictions: {
                [CacheLevel.L1]: 0,
                [CacheLevel.L2]: 0,
                [CacheLevel.PREDICTIVE]: 0,
                total: 0
            },
            currentSize: {
                [CacheLevel.L1]: 0,
                [CacheLevel.L2]: 0,
                [CacheLevel.PREDICTIVE]: 0,
                total: 0
            },
            itemCount: {
                [CacheLevel.L1]: 0,
                [CacheLevel.L2]: 0,
                [CacheLevel.PREDICTIVE]: 0,
                total: 0
            },
            hitRatio: 0,
            averageAccessTime: 0,
            preloadCount: 0,
            preloadHitRatio: 0
        };
    }

    /**
     * Démarre le processus de nettoyage périodique
     */
    private startPeriodicCleanup(): void {
        // Nettoyer les éléments expirés toutes les minutes
        setInterval(() => {
            this.removeExpiredItems();
        }, 60000);
    }

    /**
     * Supprime les éléments expirés de tous les niveaux de cache
     */
    private removeExpiredItems(): void {
        const now = Date.now();

        for (const level of Object.values(CacheLevel)) {
            const cache = this.caches[level];

            if (!cache) continue;

            for (const [key, item] of cache.entries()) {
                if (item.metadata.expiresAt && item.metadata.expiresAt < now) {
                    cache.delete(key);

                    // Mettre à jour les statistiques
                    this.stats.currentSize[level] -= item.metadata.size;
                    this.stats.itemCount[level]--;
                    this.stats.evictions[level]++;
                    this.stats.evictions.total++;

                    // Notifier les observateurs
                    this.notify({
                        type: 'expire',
                        key,
                        level,
                        timestamp: now
                    });
                }
            }
        }

        // Recalculer les statistiques totales
        this.recalculateTotalStats();
    }

    /**
     * Recalcule les statistiques totales
     */
    private recalculateTotalStats(): void {
        this.stats.currentSize.total = 0;
        this.stats.itemCount.total = 0;

        for (const level of Object.values(CacheLevel)) {
            this.stats.currentSize.total += this.stats.currentSize[level] || 0;
            this.stats.itemCount.total += this.stats.itemCount[level] || 0;
        }

        // Calculer le ratio de hits
        const totalRequests = this.stats.hits.total + this.stats.misses;
        this.stats.hitRatio = totalRequests > 0 ? this.stats.hits.total / totalRequests : 0;

        // Calculer le ratio de hit pour le préchargement
        this.stats.preloadHitRatio = this.stats.preloadCount > 0 ?
            this.stats.hits[CacheLevel.PREDICTIVE] / this.stats.preloadCount : 0;
    }

    /**
     * Ajoute un élément au cache
     * @param key Clé de l'élément
     * @param value Valeur à mettre en cache
     * @param level Niveau de cache où ajouter l'élément
     * @param ttl Durée de vie en milliseconds (optionnel)
     * @param size Taille estimée de l'élément (optionnel)
     * @returns true si l'ajout a réussi
     */
    public set(
        key: string,
        value: T,
        level: CacheLevel = CacheLevel.L1,
        ttl?: number,
        size: number = 1
    ): boolean {
        const cache = this.caches[level];

        if (!cache) {
            return false;
        }

        const now = Date.now();
        const config = this.config.levels[level];

        // Calculer l'expiration
        const expiresAt = ttl ? now + ttl :
            config?.ttl ? now + config.ttl :
                this.config.defaultTTL ? now + this.config.defaultTTL : undefined;

        // Créer l'élément de cache
        const cacheItem: CacheItem<T> = {
            data: value,
            metadata: {
                key,
                timestamp: now,
                lastAccessed: now,
                accessCount: 0,
                size,
                level,
                expiresAt
            }
        };

        // Vérifier si nous devons évacuer des éléments avant d'ajouter
        if (config && (cache.size >= config.maxSize || this.stats.currentSize[level] + size > config.maxSize)) {
            this.evictItems(level, 1, size);
        }

        // Ajouter l'élément au cache
        cache.set(key, cacheItem);

        // Mettre à jour les statistiques
        this.stats.currentSize[level] += size;
        this.stats.itemCount[level]++;
        this.recalculateTotalStats();

        // Notifier les observateurs
        this.notify({
            type: 'add',
            key,
            level,
            timestamp: now
        });

        // Précharger les éléments associés si dans le niveau L1
        if (level === CacheLevel.L1 && this.caches[CacheLevel.PREDICTIVE]) {
            this.preloadRelatedItems(key);
        }

        return true;
    }

    /**
     * Récupère un élément du cache
     * @param key Clé de l'élément
     * @returns L'élément s'il existe, undefined sinon
     */
    public get(key: string): T | undefined {
        const startTime = performance.now();
        let result: T | undefined;
        let hitLevel: CacheLevel | undefined;

        // Chercher d'abord dans le cache L1 (le plus rapide)
        if (this.caches[CacheLevel.L1]) {
            const item = this.caches[CacheLevel.L1].get(key);

            if (item && (!item.metadata.expiresAt || item.metadata.expiresAt > Date.now())) {
                result = item.data;
                hitLevel = CacheLevel.L1;
                this.updateItemMetadata(item);
            }
        }

        // Si pas trouvé dans L1, chercher dans L2
        if (!result && this.caches[CacheLevel.L2]) {
            const item = this.caches[CacheLevel.L2].get(key);

            if (item && (!item.metadata.expiresAt || item.metadata.expiresAt > Date.now())) {
                result = item.data;
                hitLevel = CacheLevel.L2;
                this.updateItemMetadata(item);

                // Promouvoir l'élément au cache L1
                this.set(key, item.data, CacheLevel.L1, undefined, item.metadata.size);
            }
        }

        // Si toujours pas trouvé, chercher dans le cache prédictif
        if (!result && this.caches[CacheLevel.PREDICTIVE]) {
            const item = this.caches[CacheLevel.PREDICTIVE].get(key);

            if (item && (!item.metadata.expiresAt || item.metadata.expiresAt > Date.now())) {
                result = item.data;
                hitLevel = CacheLevel.PREDICTIVE;
                this.updateItemMetadata(item);

                // Promouvoir l'élément au cache L1
                this.set(key, item.data, CacheLevel.L1, undefined, item.metadata.size);
            }
        }

        // Mettre à jour les statistiques
        const endTime = performance.now();
        const accessTime = endTime - startTime;

        if (hitLevel) {
            // Hit
            this.stats.hits[hitLevel]++;
            this.stats.hits.total++;

            // Mettre à jour le temps d'accès moyen
            this.stats.averageAccessTime =
                (this.stats.averageAccessTime * (this.stats.hits.total - 1) + accessTime) /
                this.stats.hits.total;

            // Notifier du hit
            this.notify({
                type: 'hit',
                key,
                level: hitLevel,
                timestamp: Date.now(),
                details: { accessTime }
            });

            // Mettre à jour les patterns d'accès
            this.updateAccessPattern(key);
        } else {
            // Miss
            this.stats.misses++;

            // Recalculer le ratio de hits
            this.recalculateTotalStats();

            // Notifier du miss
            this.notify({
                type: 'miss',
                key,
                level: CacheLevel.L1, // Level par défaut
                timestamp: Date.now()
            });
        }

        return result;
    }

    /**
     * Met à jour les métadonnées d'un élément après un accès
     */
    private updateItemMetadata(item: CacheItem<T>): void {
        const now = Date.now();
        item.metadata.lastAccessed = now;
        item.metadata.accessCount++;
    }

    /**
     * Met à jour le pattern d'accès pour le préchargement
     */
    private updateAccessPattern(key: string): void {
        // Récupérer la dernière séquence d'accès (5 dernières clés)
        const accessSequence = Array.from(this.accessTimes.keys()).sort(
            (a, b) => this.getLastAccessTime(b) - this.getLastAccessTime(a)
        ).slice(0, 5);

        // Si la séquence est vide, simplement ajouter la clé
        if (accessSequence.length === 0) {
            this.accessTimes.set(key, [Date.now()]);
            return;
        }

        // Mettre à jour le temps d'accès pour cette clé
        const times = this.accessTimes.get(key) || [];
        times.push(Date.now());
        // Garder seulement les 10 derniers accès
        if (times.length > 10) {
            times.shift();
        }
        this.accessTimes.set(key, times);

        // Créer ou mettre à jour le pattern d'accès
        const lastKey = accessSequence[0];
        if (lastKey !== key) {
            const pattern = this.accessPatterns.get(lastKey) || new Set<string>();
            pattern.add(key);
            this.accessPatterns.set(lastKey, pattern);
        }
    }

    /**
     * Récupère le dernier temps d'accès pour une clé
     */
    private getLastAccessTime(key: string): number {
        const times = this.accessTimes.get(key);
        if (!times || times.length === 0) {
            return 0;
        }
        return times[times.length - 1];
    }

    /**
     * Précharge les éléments associés à une clé
     */
    private preloadRelatedItems(key: string): void {
        const predictiveCache = this.caches[CacheLevel.PREDICTIVE];
        if (!predictiveCache) {
            return;
        }

        const strategy = this.config.levels[CacheLevel.PREDICTIVE]?.preloadStrategy || PreloadStrategy.NONE;
        if (strategy === PreloadStrategy.NONE) {
            return;
        }

        // Récupérer les éléments associés selon la stratégie
        const relatedKeys: string[] = [];

        if (strategy === PreloadStrategy.PATTERN || strategy === PreloadStrategy.HYBRID) {
            // Utiliser les patterns d'accès
            const pattern = this.accessPatterns.get(key);
            if (pattern) {
                relatedKeys.push(...Array.from(pattern));
            }
        }

        // Si des clés ont été trouvées, les précharger
        for (const relatedKey of relatedKeys) {
            // Ne précharger que si pas déjà dans un cache
            if (!this.caches[CacheLevel.L1]?.has(relatedKey) &&
                !this.caches[CacheLevel.L2]?.has(relatedKey) &&
                !predictiveCache.has(relatedKey)) {

                // Le préchargement serait généralement asynchrone
                // Ici, on simule simplement l'incrémentation du compteur
                this.stats.preloadCount++;

                // Notification fictive pour la démonstration
                this.notify({
                    type: 'preload',
                    key: relatedKey,
                    level: CacheLevel.PREDICTIVE,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Évacue un certain nombre d'éléments d'un niveau de cache selon la politique d'éviction
     * @param level Niveau de cache
     * @param count Nombre d'éléments à évacuer
     * @param requiredSize Taille requise à libérer
     */
    private evictItems(level: CacheLevel, count: number, requiredSize: number): void {
        const cache = this.caches[level];
        if (!cache || cache.size === 0) {
            return;
        }

        const policy = this.config.levels[level]?.evictionPolicy || EvictionPolicy.LRU;
        const now = Date.now();
        let itemsToEvict: string[] = [];

        // Sélectionner les éléments à évacuer selon la politique
        switch (policy) {
            case EvictionPolicy.LRU: {
                // Least Recently Used
                const sortedItems = Array.from(cache.entries()).sort(
                    (a, b) => a[1].metadata.lastAccessed - b[1].metadata.lastAccessed
                );
                itemsToEvict = sortedItems.slice(0, count).map(item => item[0]);
                break;
            }

            case EvictionPolicy.LFU: {
                // Least Frequently Used
                const sortedItems = Array.from(cache.entries()).sort(
                    (a, b) => a[1].metadata.accessCount - b[1].metadata.accessCount
                );
                itemsToEvict = sortedItems.slice(0, count).map(item => item[0]);
                break;
            }

            case EvictionPolicy.FIFO: {
                // First In First Out
                const sortedItems = Array.from(cache.entries()).sort(
                    (a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp
                );
                itemsToEvict = sortedItems.slice(0, count).map(item => item[0]);
                break;
            }

            case EvictionPolicy.ADAPTIVE: {
                // Combinaison de plusieurs facteurs
                const sortedItems = Array.from(cache.entries()).sort((a, b) => {
                    const itemA = a[1];
                    const itemB = b[1];

                    // Score basé sur le temps écoulé depuis le dernier accès, le nombre d'accès et la taille
                    const ageFactorA = (now - itemA.metadata.lastAccessed) / 60000; // Minutes
                    const ageFactorB = (now - itemB.metadata.lastAccessed) / 60000;

                    const frequencyFactorA = 1 / (itemA.metadata.accessCount + 1);
                    const frequencyFactorB = 1 / (itemB.metadata.accessCount + 1);

                    const sizeFactorA = itemA.metadata.size;
                    const sizeFactorB = itemB.metadata.size;

                    // Score combiné (plus élevé = plus susceptible d'être évacué)
                    const scoreA = ageFactorA * 0.5 + frequencyFactorA * 0.3 + sizeFactorA * 0.2;
                    const scoreB = ageFactorB * 0.5 + frequencyFactorB * 0.3 + sizeFactorB * 0.2;

                    return scoreB - scoreA;
                });

                itemsToEvict = sortedItems.slice(0, count).map(item => item[0]);
                break;
            }
        }

        // Évacuer les éléments sélectionnés
        let sizeFreed = 0;
        for (const key of itemsToEvict) {
            const item = cache.get(key);
            if (item) {
                sizeFreed += item.metadata.size;
                cache.delete(key);

                // Mettre à jour les statistiques
                this.stats.currentSize[level] -= item.metadata.size;
                this.stats.itemCount[level]--;
                this.stats.evictions[level]++;
                this.stats.evictions.total++;

                // Notifier les observateurs
                this.notify({
                    type: 'evict',
                    key,
                    level,
                    timestamp: now
                });

                // Si nous avons libéré assez d'espace, arrêter
                if (sizeFreed >= requiredSize) {
                    break;
                }
            }
        }

        // Recalculer les statistiques totales
        this.recalculateTotalStats();
    }

    /**
     * Supprime un élément du cache à tous les niveaux
     * @param key Clé de l'élément à supprimer
     * @returns true si au moins un élément a été supprimé
     */
    public remove(key: string): boolean {
        let removed = false;

        for (const level of Object.values(CacheLevel)) {
            const cache = this.caches[level];

            if (cache) {
                const item = cache.get(key);

                if (item) {
                    cache.delete(key);

                    // Mettre à jour les statistiques
                    this.stats.currentSize[level] -= item.metadata.size;
                    this.stats.itemCount[level]--;

                    removed = true;
                }
            }
        }

        if (removed) {
            // Recalculer les statistiques totales
            this.recalculateTotalStats();
        }

        return removed;
    }

    /**
     * Vérifie si un élément existe dans le cache (à n'importe quel niveau)
     * @param key Clé de l'élément
     * @param checkExpiration Vérifier aussi l'expiration
     * @returns true si l'élément existe
     */
    public has(key: string, checkExpiration = true): boolean {
        for (const level of Object.values(CacheLevel)) {
            const cache = this.caches[level];

            if (cache) {
                const item = cache.get(key);

                if (item) {
                    if (checkExpiration && item.metadata.expiresAt && item.metadata.expiresAt < Date.now()) {
                        continue;
                    }
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Effacer tout le cache à tous les niveaux
     */
    public clear(): void {
        for (const level of Object.values(CacheLevel)) {
            const cache = this.caches[level];

            if (cache) {
                cache.clear();

                // Réinitialiser les statistiques pour ce niveau
                this.stats.currentSize[level] = 0;
                this.stats.itemCount[level] = 0;
            }
        }

        // Réinitialiser les statistiques totales
        this.recalculateTotalStats();

        // Réinitialiser les patterns d'accès
        this.accessPatterns.clear();
        this.accessTimes.clear();
    }

    /**
     * Récupère les statistiques actuelles du cache
     * @returns Statistiques du cache
     */
    public getStats(): CacheStats {
        return { ...this.stats };
    }
}