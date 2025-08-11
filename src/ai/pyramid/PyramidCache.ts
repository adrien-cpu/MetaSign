import { Logger } from '@ai/utils/Logger';
import { createHash } from 'crypto';
import { PyramidData, ProcessingResult, ProcessingOptions } from './interfaces/IPyramidDataFlow';
import { PyramidLevelType } from './types';

/**
 * Stratégie de cache pour la pyramide
 */
export enum CacheStrategy {
    LRU = 'lru', // Least Recently Used
    LFU = 'lfu', // Least Frequently Used
    FIFO = 'fifo', // First In First Out 
    ADAPTIVE = 'adaptive' // Adaptatif basé sur les patterns d'utilisation
}

/**
 * Configuration du cache
 */
export interface PyramidCacheOptions {
    // Taille maximale du cache (nombre d'entrées)
    maxSize: number;

    // Temps de vie des entrées en ms (0 = pas d'expiration)
    ttl: number;

    // Stratégie d'éviction
    strategy: CacheStrategy;

    // Seuil de pré-chargement (% d'accès pour considérer un préchargement)
    preloadThreshold: number;

    // Activer les métriques détaillées
    detailedMetrics: boolean;
}

/**
 * Entrée du cache
 */
interface CacheEntry<T extends PyramidData> {
    // Données mises en cache
    result: ProcessingResult<T>;

    // Timestamp de création
    createdAt: number;

    // Timestamp du dernier accès
    lastAccessed: number;

    // Nombre d'accès
    accessCount: number;

    // Options de traitement originales
    options?: ProcessingOptions;
}

/**
 * Métriques du cache
 */
export interface CacheMetrics {
    // Nombre total d'accès
    totalAccess: number;

    // Nombre de hits (succès)
    hits: number;

    // Nombre de miss (échecs)
    misses: number;

    // Taux de succès (hits/totalAccess)
    hitRate: number;

    // Temps moyen gagné par hit (ms)
    averageTimeSaved: number;

    // Nombre d'évictions
    evictions: number;

    // Utilisation actuelle du cache (%)
    utilization: number;

    // Métriques par niveau
    byLevel: Record<PyramidLevelType, {
        hits: number;
        misses: number;
        hitRate: number;
    }>;

    // Métriques par direction
    byDirection: {
        upward: {
            hits: number;
            misses: number;
            hitRate: number;
        };
        downward: {
            hits: number;
            misses: number;
            hitRate: number;
        };
    };
}

/**
 * Système de cache intelligent pour la pyramide IA
 * Utilise différentes stratégies pour optimiser le stockage et la récupération des résultats
 */
export class PyramidCache {
    private cache: Map<string, CacheEntry<PyramidData>> = new Map();
    private options: PyramidCacheOptions;
    private logger: Logger;
    private metrics: CacheMetrics;
    private preloadPatterns: Map<string, number> = new Map();

    /**
     * Crée une nouvelle instance du cache
     * @param options Options de configuration du cache
     */
    constructor(options?: Partial<PyramidCacheOptions>) {
        this.options = {
            maxSize: options?.maxSize || 1000,
            ttl: options?.ttl || 300000, // 5 minutes par défaut
            strategy: options?.strategy || CacheStrategy.LRU,
            preloadThreshold: options?.preloadThreshold || 0.7, // 70% par défaut
            detailedMetrics: options?.detailedMetrics || false
        };

        this.logger = new Logger('PyramidCache');

        // Initialiser les métriques avec des valeurs par défaut
        const initialLevelMetrics = Object.values(PyramidLevelType).reduce<
            Record<PyramidLevelType, { hits: number; misses: number; hitRate: number }>
        >((acc, level) => {
            acc[level] = { hits: 0, misses: 0, hitRate: 0 };
            return acc;
        }, {} as Record<PyramidLevelType, { hits: number; misses: number; hitRate: number }>);

        this.metrics = {
            totalAccess: 0,
            hits: 0,
            misses: 0,
            hitRate: 0,
            averageTimeSaved: 0,
            evictions: 0,
            utilization: 0,
            byLevel: initialLevelMetrics,
            byDirection: {
                upward: { hits: 0, misses: 0, hitRate: 0 },
                downward: { hits: 0, misses: 0, hitRate: 0 }
            }
        };

        this.logger.info('Pyramid cache initialized', { options: this.options });

        // Configuration du nettoyage périodique du cache si TTL > 0
        if (this.options.ttl > 0) {
            setInterval(() => this.cleanExpiredEntries(), Math.min(this.options.ttl / 2, 60000));
        }
    }

    /**
     * Génère une clé de cache basée sur les données, le niveau et la direction
     * @param data Données à traiter
     * @param level Niveau de la pyramide
     * @param direction Direction (montante ou descendante)
     * @param options Options de traitement
     * @returns Clé de cache unique
     */
    private generateCacheKey<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        options?: ProcessingOptions
    ): string {
        // Exclure les options spécifiques qui ne devraient pas affecter la clé
        const relevantOptions = options ? {
            ...options,
            // Exclure les options qui ne devraient pas affecter le résultat
            priority: undefined,
            timeout: undefined
        } : undefined;

        // Créer un objet contenant tous les éléments à hacher
        const keyObject = {
            data,
            level,
            direction,
            options: relevantOptions
        };

        // Créer un hash SHA-256 de la représentation JSON de l'objet
        return createHash('sha256')
            .update(JSON.stringify(keyObject))
            .digest('hex');
    }

    /**
     * Récupère un résultat du cache
     * @param data Données à traiter
     * @param level Niveau de la pyramide
     * @param direction Direction (montante ou descendante)
     * @param options Options de traitement
     * @returns Résultat en cache ou null si non trouvé
     */
    public get<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        options?: ProcessingOptions
    ): ProcessingResult<T> | null {
        // Si l'option forceReprocess est activée, ne pas utiliser le cache
        if (options?.forceReprocess) {
            this.updateMetrics(level, direction, false);
            return null;
        }

        const key = this.generateCacheKey(data, level, direction, options);
        const entry = this.cache.get(key);

        const now = Date.now();

        // Vérifier si l'entrée existe et n'est pas expirée
        if (entry && (this.options.ttl === 0 || now - entry.createdAt < this.options.ttl)) {
            // Mettre à jour les métriques d'accès
            entry.lastAccessed = now;
            entry.accessCount++;

            // Mettre à jour les métriques globales
            this.updateMetrics(level, direction, true);

            // Enregistrer le pattern pour préchargement
            this.updateAccessPattern(key);

            // Retourner une copie profonde pour éviter les modifications accidentelles
            return JSON.parse(JSON.stringify(entry.result)) as ProcessingResult<T>;
        }

        // Entrée non trouvée ou expirée
        this.updateMetrics(level, direction, false);
        return null;
    }

    /**
  * Stocke un résultat dans le cache
  * @param data Données traitées
  * @param level Niveau de la pyramide
  * @param direction Direction (montante ou descendante)
  * @param result Résultat à mettre en cache
  * @param options Options de traitement
  */
    public set<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        result: ProcessingResult<T>,
        options?: ProcessingOptions
    ): void {
        // Ne pas mettre en cache les résultats en erreur
        if (result.status === 'error') {
            return;
        }

        const key = this.generateCacheKey(data, level, direction, options);
        const now = Date.now();

        // Vérifier si le cache est plein avant d'ajouter une nouvelle entrée
        if (!this.cache.has(key) && this.cache.size >= this.options.maxSize) {
            this.evictEntry();
        }

        // Définir l'interface pour l'entrée de cache
        interface CacheEntry<T> {
            result: T;
            createdAt: number;
            lastAccessed: number;
            accessCount: number;
            options?: ProcessingOptions; // Propriété optionnelle avec ?
        }

        // Créer l'entrée de cache
        const entry: CacheEntry<ProcessingResult<T>> = {
            result: result,
            createdAt: now,
            lastAccessed: now,
            accessCount: 1
        };

        // Ajouter les options si elles sont définies
        if (options) {
            entry.options = options;
        }

        // Stocker l'entrée
        this.cache.set(key, entry);

        // Mettre à jour l'utilisation du cache
        this.metrics.utilization = this.cache.size / this.options.maxSize;

        this.logger.debug('Cached result', { level, direction, key });
    }

    /**
     * Met à jour les métriques suite à une tentative d'accès au cache
     * @param level Niveau concerné
     * @param direction Direction (montante ou descendante)
     * @param isHit Indique si l'accès est un succès
     */
    private updateMetrics(
        level: PyramidLevelType,
        direction: 'up' | 'down',
        isHit: boolean
    ): void {
        this.metrics.totalAccess++;

        if (isHit) {
            this.metrics.hits++;
            this.metrics.byLevel[level].hits++;
            this.metrics.byDirection[direction === 'up' ? 'upward' : 'downward'].hits++;
        } else {
            this.metrics.misses++;
            this.metrics.byLevel[level].misses++;
            this.metrics.byDirection[direction === 'up' ? 'upward' : 'downward'].misses++;
        }

        // Mettre à jour les taux de succès
        this.metrics.hitRate = this.metrics.hits / this.metrics.totalAccess;

        // Mettre à jour le taux par niveau
        Object.values(PyramidLevelType).forEach(lvl => {
            const levelMetrics = this.metrics.byLevel[lvl];
            levelMetrics.hitRate = levelMetrics.hits / (levelMetrics.hits + levelMetrics.misses || 1);
        });

        // Mettre à jour le taux par direction
        ['upward', 'downward'].forEach(dir => {
            const dirMetrics = this.metrics.byDirection[dir as 'upward' | 'downward'];
            dirMetrics.hitRate = dirMetrics.hits / (dirMetrics.hits + dirMetrics.misses || 1);
        });
    }

    /**
     * Supprime une entrée du cache selon la stratégie configurée
     */
    private evictEntry(): void {
        if (this.cache.size === 0) return;

        let keyToRemove: string | null = null;

        switch (this.options.strategy) {
            case CacheStrategy.LRU:
                // Supprimer l'entrée la moins récemment utilisée
                keyToRemove = this.findLeastRecentlyUsedKey();
                break;

            case CacheStrategy.LFU:
                // Supprimer l'entrée la moins fréquemment utilisée
                keyToRemove = this.findLeastFrequentlyUsedKey();
                break;

            case CacheStrategy.FIFO:
                // Supprimer la première entrée insérée
                keyToRemove = this.findOldestKey();
                break;

            case CacheStrategy.ADAPTIVE:
                // Stratégie adaptative qui choisit entre LRU et LFU selon les patterns
                if (Math.random() > this.metrics.hitRate) {
                    keyToRemove = this.findLeastRecentlyUsedKey();
                } else {
                    keyToRemove = this.findLeastFrequentlyUsedKey();
                }
                break;
        }

        if (keyToRemove) {
            this.cache.delete(keyToRemove);
            this.metrics.evictions++;
            this.logger.debug('Evicted cache entry', { strategy: this.options.strategy });
        }
    }

    /**
     * Trouve la clé de l'entrée la moins récemment utilisée
     */
    private findLeastRecentlyUsedKey(): string | null {
        let oldestAccess = Infinity;
        let oldestKey: string | null = null;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestAccess) {
                oldestAccess = entry.lastAccessed;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    /**
     * Trouve la clé de l'entrée la moins fréquemment utilisée
     */
    private findLeastFrequentlyUsedKey(): string | null {
        let lowestCount = Infinity;
        let leastUsedKey: string | null = null;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessCount < lowestCount) {
                lowestCount = entry.accessCount;
                leastUsedKey = key;
            }
        }

        return leastUsedKey;
    }

    /**
     * Trouve la clé de l'entrée la plus ancienne
     */
    private findOldestKey(): string | null {
        let oldestTime = Infinity;
        let oldestKey: string | null = null;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    private cleanExpiredEntries(): void {
        const now = Date.now();
        let expiredCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.createdAt > this.options.ttl) {
                this.cache.delete(key);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            this.logger.debug(`Cleaned ${expiredCount} expired cache entries`);
            this.metrics.utilization = this.cache.size / this.options.maxSize;
        }
    }

    /**
     * Met à jour les patterns d'accès pour le préchargement prédictif
     * @param key Clé de cache accédée
     */
    private updateAccessPattern(key: string): void {
        const count = (this.preloadPatterns.get(key) || 0) + 1;
        this.preloadPatterns.set(key, count);

        // Nettoyer périodiquement les patterns pour éviter une croissance infinie
        if (this.preloadPatterns.size > this.options.maxSize * 2) {
            this.prunePreloadPatterns();
        }
    }

    /**
     * Réduit la taille de la table des patterns de préchargement
     */
    private prunePreloadPatterns(): void {
        // Trier les patterns par nombre d'accès
        const sortedPatterns = [...this.preloadPatterns.entries()]
            .sort((a, b) => b[1] - a[1]);

        // Garder seulement les plus fréquents
        const keepCount = Math.floor(this.options.maxSize * 1.5);

        this.preloadPatterns = new Map(sortedPatterns.slice(0, keepCount));

        this.logger.debug(`Pruned preload patterns to ${this.preloadPatterns.size} entries`);
    }

    /**
     * Précharge les données associées à une entrée fréquemment accédée
     * @param data Données à traiter
     * @param level Niveau actuel
     * @param direction Direction actuelle
     * @param options Options de traitement
     */
    public preloadRelatedData<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        options?: ProcessingOptions
    ): void {
        // Cette méthode serait appelée par le système principal pour précharger des données
        // liées aux requêtes fréquentes.

        // Exemple simplifié : noter que ce préchargement est souhaitable
        const key = this.generateCacheKey(data, level, direction, options);
        const accessCount = this.preloadPatterns.get(key) || 0;

        if (accessCount > this.metrics.totalAccess * this.options.preloadThreshold) {
            this.logger.debug('Preload candidate identified', { level, direction, accessCount });
            // Le préchargement réel serait lancé par le système principal
        }
    }

    /**
     * Obtient les métriques du cache
     * @returns Métriques actuelles du cache
     */
    public getMetrics(): CacheMetrics {
        return { ...this.metrics }; // Retourner une copie
    }

    /**
     * Vide complètement le cache
     */
    public clear(): void {
        this.cache.clear();
        this.preloadPatterns.clear();

        // Réinitialiser les métriques
        Object.values(PyramidLevelType).forEach(level => {
            this.metrics.byLevel[level] = { hits: 0, misses: 0, hitRate: 0 };
        });

        this.metrics.byDirection.upward = { hits: 0, misses: 0, hitRate: 0 };
        this.metrics.byDirection.downward = { hits: 0, misses: 0, hitRate: 0 };

        this.metrics.totalAccess = 0;
        this.metrics.hits = 0;
        this.metrics.misses = 0;
        this.metrics.hitRate = 0;
        this.metrics.averageTimeSaved = 0;
        this.metrics.evictions = 0;
        this.metrics.utilization = 0;

        this.logger.info('Cache cleared');
    }

    /**
     * Invalide une partie spécifique du cache
     * @param level Niveau à invalider (optionnel)
     * @param direction Direction à invalider (optionnel)
     */
    public invalidate(level?: PyramidLevelType, direction?: 'up' | 'down'): void {
        if (!level && !direction) {
            this.clear();
            return;
        }

        let invalidatedCount = 0;

        // Parcourir toutes les entrées et supprimer celles qui correspondent
        for (const [key] of this.cache.entries()) {
            const keyParts = key.split(':');
            // Utilisation d'un typage explicite pour éviter les erreurs de type d'index
            if (keyParts.length >= 3) {
                const entryLevel = keyParts[1] as string;
                const entryDirection = keyParts[2] as string;

                if ((!level || entryLevel === level) && (!direction || entryDirection === direction)) {
                    this.cache.delete(key);
                    invalidatedCount++;
                }
            }
        }

        this.metrics.utilization = this.cache.size / this.options.maxSize;
        this.logger.info(`Invalidated ${invalidatedCount} cache entries`, { level, direction });
    }
}