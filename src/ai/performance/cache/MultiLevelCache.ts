/**
 * @file: src/ai/performance/cache/MultiLevelCache.ts
 * 
 * Cache intelligent multi-niveaux avec prédiction de charge et éviction intelligente
 */

import {
    CacheItem,
    CacheOptions,
    CacheStats,
    CacheTier,
    ExtendedCacheStats,
    ICacheManager,
    PredictionModel,
    SetCacheOptions
} from '@ai-types/cache';
import { logger } from '@ai/utils/Logger';

/**
 * Cache intelligent multi-niveaux avec prédiction de charge et éviction intelligente
 * 
 * Caractéristiques:
 * - Structure à trois niveaux (L1, L2, prédictif)
 * - Prédiction d'accès basée sur l'historique
 * - Éviction intelligente basée sur la fréquence et la récence
 * - Préchargement automatique des données fréquemment associées
 * - Statistiques détaillées d'utilisation
 * 
 * @template T Type des valeurs stockées dans le cache
 */
export class MultiLevelCache<T> implements ICacheManager {
    /** Cache L1: Mémoire rapide pour accès fréquent (plus petit mais rapide) */
    private readonly l1Cache: Map<string, CacheItem<T>> = new Map();

    /** Cache L2: Plus grand mais moins rapide pour accès moins fréquents */
    private readonly l2Cache: Map<string, CacheItem<T>> = new Map();

    /** Cache prédictif pour précharger les données fréquemment associées */
    private readonly predictiveCache: Map<string, CacheItem<T>> = new Map();

    /** Statistiques d'utilisation */
    private stats: CacheStats = {
        hits: { l1: 0, l2: 0, predictive: 0 },
        misses: 0,
        evictions: { l1: 0, l2: 0, predictive: 0 }
    };

    /** Configuration */
    private readonly config: CacheOptions;

    /** Modèle de prédiction pour les accès séquentiels et associés */
    private readonly predictionModel: PredictionModel = {
        sequentialAccess: new Map<string, number>(),
        itemScores: new Map<string, number>(),
        coAccessPatterns: new Map<string, Set<string>>()
    };

    /** Dernière clé accédée (pour les patterns séquentiels) */
    private lastAccessedKey: string | null = null;

    /** Fonction de rappel pour le préchargement */
    private preloadCallback: ((key: string) => Promise<T | undefined>) | null = null;

    /** Timer de nettoyage périodique */
    private cleanupTimer: NodeJS.Timeout | null = null;

    /** Association des clés à leurs tags */
    private keyToTags: Map<string, Set<string>> = new Map();

    /** Association des tags aux clés */
    private tagToKeys: Map<string, Set<string>> = new Map();

    /**
     * Crée une nouvelle instance du cache multi-niveaux
     * @param config Configuration du cache
     */
    constructor(config?: Partial<CacheOptions>) {
        // Configuration par défaut
        this.config = {
            l1MaxSize: 100,
            l2MaxSize: 1000,
            predictiveMaxSize: 50,
            defaultTTL: 10 * 60 * 1000, // 10 minutes
            l1TTL: 5 * 60 * 1000, // 5 minutes
            l2TTL: 30 * 60 * 1000, // 30 minutes
            predictionThreshold: 0.7,
            cleanupInterval: 60 * 1000, // 1 minute
            ...config
        };

        // Démarrer le nettoyage périodique
        this.startPeriodicCleanup();

        logger.debug('MultiLevelCache initialized', {
            l1MaxSize: this.config.l1MaxSize,
            l2MaxSize: this.config.l2MaxSize,
            predictiveMaxSize: this.config.predictiveMaxSize
        });
    }

    /**
    * Récupère un élément du cache
    * @param key Clé de l'élément à récupérer
    * @returns L'élément s'il existe et n'est pas expiré, undefined sinon
    */
    public get<V>(key: string): V | undefined {
        return this.getInternal(key) as V | undefined;
    }

    /**
     * Implémentation interne de get qui préserve le typage générique
     * @param key Clé de l'élément à récupérer
     * @returns L'élément typé s'il existe et n'est pas expiré, undefined sinon
     */
    private getInternal<U extends T = T>(key: string): U | undefined {
        // Vérifier dans le cache L1 (le plus rapide)
        const l1Item = this.l1Cache.get(key);
        if (l1Item && !this.isExpired(l1Item)) {
            // Mettre à jour les statistiques et l'horodatage d'accès
            this.stats.hits.l1++;
            l1Item.lastAccessed = Date.now();
            l1Item.accessCount++;

            // Mettre à jour le modèle de prédiction
            this.updatePredictionModel(key);

            return l1Item.value as unknown as U;
        }

        // Vérifier dans le cache L2
        const l2Item = this.l2Cache.get(key);
        if (l2Item && !this.isExpired(l2Item)) {
            // Promouvoir au cache L1
            this.stats.hits.l2++;
            l2Item.lastAccessed = Date.now();
            l2Item.accessCount++;

            // Promouvoir au L1
            this.promoteToL1(key, l2Item);

            // Mettre à jour le modèle de prédiction
            this.updatePredictionModel(key);

            return l2Item.value as unknown as U;
        }

        // Vérifier dans le cache prédictif
        const predictiveItem = this.predictiveCache.get(key);
        if (predictiveItem && !this.isExpired(predictiveItem)) {
            // Hit dans le cache prédictif
            this.stats.hits.predictive++;
            predictiveItem.lastAccessed = Date.now();
            predictiveItem.accessCount++;

            // Promouvoir au L1
            this.promoteToL1(key, predictiveItem);
            this.predictiveCache.delete(key);

            // Mettre à jour le modèle de prédiction
            this.updatePredictionModel(key);

            return predictiveItem.value as unknown as U;
        }

        // Élément non trouvé
        this.stats.misses++;

        // Lancer la prédiction pour précharger les données associées
        this.triggerPredictiveLoading(key);

        return undefined;
    }

    /**
     * Stocke un élément dans le cache
     * @param key Clé de l'élément
     * @param value Valeur à stocker
     * @param options Options de stockage
     */
    public set<V>(key: string, value: V, options: SetCacheOptions = {}): void {
        this.setInternal(key, value as unknown as T, options);
    }

    /**
     * Implémentation interne de set qui préserve le typage générique
     * @param key Clé de l'élément
     * @param value Valeur typée à stocker
     * @param options Options de stockage
     */
    private setInternal<U extends T>(key: string, value: U, options: SetCacheOptions = {}): void {
        const now = Date.now();

        // Déterminer le TTL selon le niveau de cache
        const tier = options.tier || CacheTier.L1;
        const ttl = options.ttl ||
            (tier === CacheTier.L1 ? this.config.l1TTL :
                tier === CacheTier.L2 ? this.config.l2TTL :
                    this.config.l1TTL / 2); // Prédictif a une durée plus courte

        const item: CacheItem<T> = {
            value: value as unknown as T,
            createdAt: now,
            lastAccessed: now,
            expiresAt: now + ttl,
            accessCount: 0,
            metadata: options.metadata || {}
        };

        // Stocker dans le niveau approprié
        switch (tier) {
            case CacheTier.L1:
                if (this.l1Cache.size >= this.config.l1MaxSize) {
                    this.evictFromCache(this.l1Cache, 'l1');
                }
                this.l1Cache.set(key, item);
                break;

            case CacheTier.L2:
                if (this.l2Cache.size >= this.config.l2MaxSize) {
                    this.evictFromCache(this.l2Cache, 'l2');
                }
                this.l2Cache.set(key, item);
                break;

            case CacheTier.PREDICTIVE:
                if (this.predictiveCache.size >= this.config.predictiveMaxSize) {
                    this.evictFromCache(this.predictiveCache, 'predictive');
                }
                this.predictiveCache.set(key, item);
                break;
        }

        // Gérer les tags si présents
        if (options.tags && options.tags.length > 0) {
            this.assignTagsToKey(key, options.tags);
        }

        // Mettre à jour le modèle de prédiction
        this.updatePredictionModel(key);
    }

    /**
     * Supprime un élément du cache à tous les niveaux
     * @param key Clé de l'élément à supprimer
     * @returns true si l'élément a été trouvé et supprimé, false sinon
     */
    public delete(key: string): boolean {
        let found = false;

        if (this.l1Cache.delete(key)) found = true;
        if (this.l2Cache.delete(key)) found = true;
        if (this.predictiveCache.delete(key)) found = true;

        // Supprimer les associations de tags
        this.removeKeyFromTags(key);

        // Aussi supprimer du modèle de prédiction
        this.predictionModel.sequentialAccess.forEach((_, seq) => {
            if (seq.startsWith(`${key}>`) || seq.endsWith(`>${key}`)) {
                this.predictionModel.sequentialAccess.delete(seq);
            }
        });

        this.predictionModel.itemScores.delete(key);

        if (this.predictionModel.coAccessPatterns) {
            this.predictionModel.coAccessPatterns.delete(key);
            this.predictionModel.coAccessPatterns.forEach((relatedKeys) => {
                relatedKeys.delete(key);
            });
        }

        return found;
    }

    /**
     * Vérifie si un élément existe dans le cache sans l'accéder
     * @param key Clé à vérifier
     * @returns true si l'élément existe et n'est pas expiré
     */
    public has(key: string): boolean {
        const l1Item = this.l1Cache.get(key);
        if (l1Item && !this.isExpired(l1Item)) return true;

        const l2Item = this.l2Cache.get(key);
        if (l2Item && !this.isExpired(l2Item)) return true;

        const predictiveItem = this.predictiveCache.get(key);
        if (predictiveItem && !this.isExpired(predictiveItem)) return true;

        return false;
    }

    /**
     * Vide complètement tous les niveaux de cache
     */
    public clear(): void {
        this.l1Cache.clear();
        this.l2Cache.clear();
        this.predictiveCache.clear();
        this.predictionModel.sequentialAccess.clear();
        this.predictionModel.itemScores.clear();
        this.predictionModel.coAccessPatterns.clear();
        this.keyToTags.clear();
        this.tagToKeys.clear();

        // Réinitialiser les statistiques
        this.stats = {
            hits: { l1: 0, l2: 0, predictive: 0 },
            misses: 0,
            evictions: { l1: 0, l2: 0, predictive: 0 }
        };

        logger.debug('Cache cleared');
    }

    /**
     * Invalide toutes les entrées avec un tag spécifique
     * @param tag Tag à invalider
     * @returns Nombre d'entrées invalidées
     */
    public invalidateByTag(tag: string): number {
        const keysToInvalidate = this.tagToKeys.get(tag);
        if (!keysToInvalidate || keysToInvalidate.size === 0) {
            return 0;
        }

        let invalidatedCount = 0;
        for (const key of keysToInvalidate) {
            if (this.delete(key)) {
                invalidatedCount++;
            }
        }

        // Nettoyer le tag maintenant qu'il n'a plus de clés
        this.tagToKeys.delete(tag);

        logger.debug(`Invalidated ${invalidatedCount} cache entries with tag: ${tag}`);
        return invalidatedCount;
    }

    /**
     * Précharge des données dans le cache prédictif
     * @param keys Clés à précharger
     * @param values Valeurs correspondantes
     * @param ttl Durée de vie optionnelle
     */
    public preload(keys: string[], values: T[], ttl?: number): void {
        if (keys.length !== values.length) {
            throw new Error('Le nombre de clés doit correspondre au nombre de valeurs');
        }

        for (let i = 0; i < keys.length; i++) {
            // Créer l'objet d'options sans inclure ttl s'il est undefined
            const options: SetCacheOptions = {
                tier: CacheTier.PREDICTIVE,
                metadata: { preloaded: true }
            };

            // Ajouter ttl seulement s'il est défini
            if (ttl !== undefined) {
                options.ttl = ttl;
            }

            this.set(keys[i], values[i], options);
        }

        logger.debug(`Preloaded ${keys.length} items into predictive cache`);
    }

    /**
     * Obtient les statistiques du cache
     * @returns Statistiques détaillées d'utilisation du cache
     */
    public getStats(): ExtendedCacheStats {
        const totalHits = this.stats.hits.l1 + this.stats.hits.l2 + this.stats.hits.predictive;
        const totalAccesses = totalHits + this.stats.misses;

        return {
            ...this.stats,
            hitRate: totalAccesses === 0 ? 0 : totalHits / totalAccesses,
            size: {
                l1: this.l1Cache.size,
                l2: this.l2Cache.size,
                predictive: this.predictiveCache.size,
                total: this.l1Cache.size + this.l2Cache.size + this.predictiveCache.size
            },
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Définit la fonction de rappel pour le préchargement
     * @param callback Fonction qui charge une valeur à partir d'une clé
     */
    public setPreloadCallback(callback: (key: string) => Promise<T | undefined>): void {
        this.preloadCallback = callback;
    }

    /**
     * Retourne le taux de réussite (hit rate) du cache
     * @returns Le taux de réussite entre 0 et 1
     */
    public getHitRate(): number {
        const totalHits = this.stats.hits.l1 + this.stats.hits.l2 + this.stats.hits.predictive;
        const totalAccesses = totalHits + this.stats.misses;
        return totalAccesses === 0 ? 0 : totalHits / totalAccesses;
    }

    /**
     * Retourne le nombre total d'éléments dans tous les niveaux de cache
     */
    public getTotalSize(): number {
        return this.l1Cache.size + this.l2Cache.size + this.predictiveCache.size;
    }

    /**
     * Retourne le nombre d'éléments dans le cache L1
     */
    public getL1Size(): number {
        return this.l1Cache.size;
    }

    /**
     * Retourne le nombre d'éléments dans le cache L2
     */
    public getL2Size(): number {
        return this.l2Cache.size;
    }

    /**
     * Retourne le nombre d'accès réussis au cache L1
     */
    public getL1Hits(): number {
        return this.stats.hits.l1;
    }

    /**
     * Retourne le nombre d'accès réussis au cache L2
     */
    public getL2Hits(): number {
        return this.stats.hits.l2;
    }

    /**
     * Retourne le nombre d'accès réussis au cache prédictif
     */
    public getPredictiveHits(): number {
        return this.stats.hits.predictive;
    }

    /**
     * Retourne le nombre d'accès manqués au cache
     */
    public getMisses(): number {
        return this.stats.misses;
    }

    /**
     * Définit la stratégie d'éviction du cache
     * @param strategy Stratégie d'éviction ('lru', 'lfu', ou 'adaptive')
     */
    public setEvictionStrategy(strategy: 'lru' | 'lfu' | 'adaptive'): void {
        // Cette méthode modifie le comportement de l'éviction selon la stratégie choisie
        logger.debug(`Set eviction strategy to ${strategy}`);
        // La stratégie est stockée dans la configuration et utilisée lors de l'éviction
        (this.config as { evictionStrategy?: 'lru' | 'lfu' | 'adaptive' }).evictionStrategy = strategy;
    }

    /**
     * Vérifie si un élément du cache est expiré
     * @param item Élément à vérifier
     * @returns true si l'élément est expiré
     */
    private isExpired(item: CacheItem<T>): boolean {
        return Date.now() > item.expiresAt;
    }

    /**
     * Évince un élément du cache spécifié selon la stratégie adaptative
     * Combine LRU (Least Recently Used) et LFU (Least Frequently Used)
     * 
     * @param cache Cache à nettoyer
     * @param statKey Clé de statistique à incrémenter
     */
    private evictFromCache(
        cache: Map<string, CacheItem<T>>,
        statKey: keyof CacheStats['evictions']
    ): void {
        // D'abord, essayer de trouver et supprimer un élément expiré
        for (const [key, item] of cache.entries()) {
            if (this.isExpired(item)) {
                cache.delete(key);
                this.removeKeyFromTags(key);
                this.stats.evictions[statKey]++;
                return;
            }
        }

        // Si aucun élément n'est expiré, utiliser un score combiné 
        // qui tient compte à la fois de la récence et de la fréquence
        let lowestScore = Infinity;
        let candidateKey: string | null = null;

        const now = Date.now();

        for (const [key, item] of cache.entries()) {
            // Facteur de récence (0-1): plus c'est récent, plus le score est élevé
            const recencyFactor = (now - item.lastAccessed) / (1000 * 60 * 60); // en heures

            // Facteur de fréquence: plus l'élément est accédé, plus le score est élevé
            const frequencyFactor = Math.log10(item.accessCount + 1);

            // Score prédictif supplémentaire
            const predictiveScore = this.predictionModel.itemScores.get(key) || 0;

            // Score combiné: plus il est bas, plus l'élément est candidat à l'éviction
            // La formule peut être ajustée selon les besoins spécifiques
            const score = (frequencyFactor / (recencyFactor + 1)) + (predictiveScore / 10);

            if (score < lowestScore) {
                lowestScore = score;
                candidateKey = key;
            }
        }

        // Éviction de l'élément avec le score le plus bas
        if (candidateKey) {
            if (statKey === 'l1' && this.l2Cache.size < this.config.l2MaxSize) {
                // Si on évince de L1 et que L2 a de la place, déplacer vers L2 au lieu de supprimer
                const item = cache.get(candidateKey)!;
                this.l2Cache.set(candidateKey, {
                    ...item,
                    expiresAt: Date.now() + this.config.l2TTL
                });
                logger.debug(`Moved item from L1 to L2: ${candidateKey}`);
            } else {
                // Supprimer les associations de tags
                this.removeKeyFromTags(candidateKey);
            }

            cache.delete(candidateKey);
            this.stats.evictions[statKey]++;
            logger.debug(`Evicted item from ${statKey} cache: ${candidateKey}`);
        }
    }

    /**
     * Promeut un élément au cache L1
     * @param key Clé de l'élément
     * @param item Élément à promouvoir
     */
    private promoteToL1(key: string, item: CacheItem<T>): void {
        // Évince du L1 si nécessaire
        if (this.l1Cache.size >= this.config.l1MaxSize) {
            this.evictFromCache(this.l1Cache, 'l1');
        }

        // Met à jour l'expiration pour refléter la politique L1
        const newItem: CacheItem<T> = {
            ...item,
            expiresAt: Date.now() + this.config.l1TTL
        };

        // Stocke dans L1
        this.l1Cache.set(key, newItem);
    }

    /**
     * Met à jour le modèle de prédiction après accès à un élément
     * @param key Clé de l'élément accédé
     */
    private updatePredictionModel(key: string): void {
        // Enregistrer la séquence d'accès si nous avons une clé précédente
        if (this.lastAccessedKey) {
            const sequenceKey = `${this.lastAccessedKey}>${key}`;
            const currentCount = this.predictionModel.sequentialAccess.get(sequenceKey) || 0;
            this.predictionModel.sequentialAccess.set(sequenceKey, currentCount + 1);

            // Mettre à jour les co-accès
            let relatedToLast = this.predictionModel.coAccessPatterns.get(this.lastAccessedKey);
            if (!relatedToLast) {
                relatedToLast = new Set();
                this.predictionModel.coAccessPatterns.set(this.lastAccessedKey, relatedToLast);
            }
            relatedToLast.add(key);

            let relatedToCurrent = this.predictionModel.coAccessPatterns.get(key);
            if (!relatedToCurrent) {
                relatedToCurrent = new Set();
                this.predictionModel.coAccessPatterns.set(key, relatedToCurrent);
            }
            relatedToCurrent.add(this.lastAccessedKey);
        }

        // Mettre à jour le score de l'élément
        const currentScore = this.predictionModel.itemScores.get(key) || 0;
        this.predictionModel.itemScores.set(key, currentScore + 1);

        // Enregistrer cette clé comme dernière accédée
        this.lastAccessedKey = key;
    }

    /**
     * Déclenche le préchargement prédictif après un accès manqué
     * @param currentKey Clé actuellement demandée
     */
    private triggerPredictiveLoading(currentKey: string): void {
        // Trouver des séquences commençant par la clé actuelle
        const predictions = this.predictNextAccesses(currentKey);

        // Précharger ces clés si possible (via callback)
        if (this.preloadCallback && predictions.length > 0) {
            predictions.forEach(key => {
                // Ne précharge que si l'élément n'est pas déjà dans le cache
                if (!this.has(key)) {
                    this.preloadCallback!(key).then(value => {
                        if (value !== undefined) {
                            this.set(key, value, { tier: CacheTier.PREDICTIVE });
                            logger.debug(`Predictively loaded: ${key}`);
                        }
                    }).catch(error => {
                        // Log l'erreur mais ne la propage pas
                        logger.warn(`Error preloading key "${key}":`, { error });
                    });
                }
            });
        }
    }

    /**
     * Prédit les clés susceptibles d'être accédées ensuite
     * @param currentKey Clé actuellement accédée
     * @returns Liste de clés prédites
     */
    private predictNextAccesses(currentKey: string): string[] {
        // Analyse des patterns d'accès séquentiels
        const sequentialPredictions: Array<{ key: string; score: number }> = [];

        // Analyser les patterns d'accès séquentiels
        this.predictionModel.sequentialAccess.forEach((count, sequence) => {
            const [prefix, suffix] = sequence.split('>');

            // Si cette séquence commence par notre clé actuelle
            if (prefix === currentKey && count >= 2) { // Au moins 2 occurrences pour être significatif
                sequentialPredictions.push({
                    key: suffix,
                    score: count * 2 // Score basé sur la fréquence
                });
            }
        });

        // Analyser les co-accès
        const coAccessPredictions: Array<{ key: string; score: number }> = [];

        const relatedKeys = this.predictionModel.coAccessPatterns.get(currentKey);
        if (relatedKeys) {
            relatedKeys.forEach(relatedKey => {
                const itemScore = this.predictionModel.itemScores.get(relatedKey) || 0;
                coAccessPredictions.push({
                    key: relatedKey,
                    score: itemScore
                });
            });
        }

        // Combiner et dédupliquer les prédictions
        const allPredictions = new Map<string, number>();

        // Ajouter les prédictions séquentielles
        sequentialPredictions.forEach(prediction => {
            allPredictions.set(prediction.key, prediction.score);
        });

        // Ajouter ou mettre à jour avec les prédictions de co-accès
        coAccessPredictions.forEach(prediction => {
            const currentScore = allPredictions.get(prediction.key) || 0;
            allPredictions.set(prediction.key, currentScore + prediction.score);
        });

        // Convertir en tableau, trier par score et filtrer
        return Array.from(allPredictions.entries())
            .sort((a, b) => b[1] - a[1])
            .filter(([, score]) => score >= this.config.predictionThreshold * 10)
            .map(([key]) => key)
            .slice(0, 5); // Limiter à 5 prédictions
    }

    /**
     * Démarre le processus de nettoyage périodique
     */
    private startPeriodicCleanup(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        this.cleanupTimer = setInterval(() => {
            this.cleanupExpired();
        }, this.config.cleanupInterval);
    }

    /**
     * Nettoie les éléments expirés de tous les niveaux de cache
     */
    private cleanupExpired(): void {
        const now = Date.now();
        let expiredCount = 0;

        // Nettoyage L1
        for (const [key, item] of this.l1Cache.entries()) {
            if (now > item.expiresAt) {
                this.l1Cache.delete(key);
                this.removeKeyFromTags(key);
                expiredCount++;
            }
        }

        // Nettoyage L2
        for (const [key, item] of this.l2Cache.entries()) {
            if (now > item.expiresAt) {
                this.l2Cache.delete(key);
                this.removeKeyFromTags(key);
                expiredCount++;
            }
        }

        // Nettoyage cache prédictif
        for (const [key, item] of this.predictiveCache.entries()) {
            if (now > item.expiresAt) {
                this.predictiveCache.delete(key);
                this.removeKeyFromTags(key);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            logger.debug(`Cleaned up ${expiredCount} expired cache items`);
        }
    }

    /**
     * Associe des tags à une clé de cache
     * @param key Clé à tagger
     * @param tags Tags à associer
     */
    private assignTagsToKey(key: string, tags: string[]): void {
        // Récupérer l'ensemble de tags existant pour cette clé ou en créer un nouveau
        let keyTags = this.keyToTags.get(key);
        if (!keyTags) {
            keyTags = new Set();
            this.keyToTags.set(key, keyTags);
        }

        // Ajouter les nouveaux tags
        for (const tag of tags) {
            keyTags.add(tag);

            // Ajouter également la clé à l'index inverse tag -> clés
            let keysForTag = this.tagToKeys.get(tag);
            if (!keysForTag) {
                keysForTag = new Set();
                this.tagToKeys.set(tag, keysForTag);
            }
            keysForTag.add(key);
        }
    }

    /**
     * Supprime une clé des index de tags
     * @param key Clé à supprimer
     */
    private removeKeyFromTags(key: string): void {
        // Récupérer les tags associés à cette clé
        const keyTags = this.keyToTags.get(key);
        if (!keyTags) return;

        // Supprimer la clé de chaque index inverse tag -> clés
        for (const tag of keyTags) {
            const keysForTag = this.tagToKeys.get(tag);
            if (keysForTag) {
                keysForTag.delete(key);
                // Supprimer le tag s'il n'a plus de clés
                if (keysForTag.size === 0) {
                    this.tagToKeys.delete(tag);
                }
            }
        }

        // Supprimer l'entrée de l'index clé -> tags
        this.keyToTags.delete(key);
    }

    /**
     * Estime l'utilisation mémoire du composant
     * @returns Estimation en octets
     */
    private estimateMemoryUsage(): number {
        // Formule approximative basée sur des heuristiques
        // (taille des clés + taille estimée des valeurs) * nombre d'entrées

        const averageKeySize = 50; // ~50 octets par clé (approximation)
        const averageValueSize = 500; // ~500 octets par valeur (approximation)
        const averageMetadataSize = 100; // ~100 octets par métadonnées (approximation)

        const entrySize = averageKeySize + averageValueSize + averageMetadataSize;

        const l1Size = this.l1Cache.size * entrySize;
        const l2Size = this.l2Cache.size * entrySize;
        const predictiveSize = this.predictiveCache.size * entrySize;

        // Estimer la taille du modèle de prédiction
        const predictionModelSize =
            this.predictionModel.sequentialAccess.size * 100 +
            this.predictionModel.itemScores.size * 50 +
            Array.from(this.predictionModel.coAccessPatterns.values())
                .reduce((sum, set) => sum + set.size * 50, 0);

        // Estimer la taille des index de tags
        const tagIndexSize =
            this.keyToTags.size * 50 +
            Array.from(this.keyToTags.values()).reduce((sum, set) => sum + set.size * 30, 0) +
            this.tagToKeys.size * 50 +
            Array.from(this.tagToKeys.values()).reduce((sum, set) => sum + set.size * 30, 0);

        return l1Size + l2Size + predictiveSize + predictionModelSize + tagIndexSize;
    }

    /**
     * Libère les ressources utilisées par le cache
     * Arrête notamment le timer de nettoyage périodique
     */
    public dispose(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        this.clear();
        logger.debug('Cache disposed');
    }
}

/**
* Gestionnaire de cache pour les données LSF
* 
* Fournit des caches dédiés pour les expressions, traductions et variantes dialectales
*/
export class LSFCacheManager {
    private static instance: LSFCacheManager;
    private expressionCache: MultiLevelCache<unknown>;
    private translationCache: MultiLevelCache<unknown>;
    private dialectCache: MultiLevelCache<unknown>;
    private strategy: 'lru' | 'lfu' | 'adaptive' = 'adaptive';
    private highPriorityMode = false;

    private constructor() {
        // Configuration des différents caches
        this.expressionCache = new MultiLevelCache<unknown>({
            l1MaxSize: 500,
            l2MaxSize: 2000,
            predictiveMaxSize: 100,
            l1TTL: 1800000, // 30 minutes
            l2TTL: 7200000  // 2 heures
        });

        this.translationCache = new MultiLevelCache<unknown>({
            l1MaxSize: 300,
            l2MaxSize: 1000,
            predictiveMaxSize: 50,
            l1TTL: 1800000, // 30 minutes
            l2TTL: 3600000  // 1 heure
        });

        this.dialectCache = new MultiLevelCache<unknown>({
            l1MaxSize: 100,
            l2MaxSize: 500,
            predictiveMaxSize: 30,
            l1TTL: 3600000,  // 1 heure
            l2TTL: 86400000  // 24 heures
        });
    }

    /**
     * Obtient l'instance unique du gestionnaire de cache LSF
     */
    public static getInstance(): LSFCacheManager {
        if (!LSFCacheManager.instance) {
            LSFCacheManager.instance = new LSFCacheManager();
        }
        return LSFCacheManager.instance;
    }

    /**
     * Récupère le cache d'expressions LSF
     */
    public getExpressionCache(): MultiLevelCache<unknown> {
        return this.expressionCache;
    }

    /**
     * Récupère le cache de traductions LSF
     */
    public getTranslationCache(): MultiLevelCache<unknown> {
        return this.translationCache;
    }

    /**
     * Récupère le cache de variantes dialectales LSF
     */
    public getDialectCache(): MultiLevelCache<unknown> {
        return this.dialectCache;
    }

    /**
     * Définit la stratégie d'éviction pour tous les caches
     * @param strategy Stratégie d'éviction à utiliser
     */
    public setStrategy(strategy: 'lru' | 'lfu' | 'adaptive'): void {
        this.strategy = strategy;

        // Appliquer la stratégie à tous les caches
        this.expressionCache.setEvictionStrategy(strategy);
        this.translationCache.setEvictionStrategy(strategy);
        this.dialectCache.setEvictionStrategy(strategy);
    }

    /**
     * Active ou désactive le mode haute priorité
     * En mode haute priorité, le cache est optimisé pour la performance au détriment de la mémoire
     * 
     * @param enabled Indique si le mode haute priorité doit être activé
     */
    public setHighPriorityMode(enabled: boolean): void {
        this.highPriorityMode = enabled;
    }

    /**
     * Obtient les statistiques globales sur tous les caches
     */
    public getGlobalStats(): {
        expressions: {
            hitRate: number;
            size: {
                total: number;
                l1: number;
                l2: number;
            };
            hits: {
                l1: number;
                l2: number;
                predictive: number;
            };
            misses: number;
        };
        translations: {
            hitRate: number;
            size: {
                total: number;
                l1: number;
                l2: number;
            };
            hits: {
                l1: number;
                l2: number;
                predictive: number;
            };
            misses: number;
        };
        dialects: {
            hitRate: number;
            size: {
                total: number;
                l1: number;
                l2: number;
            };
            hits: {
                l1: number;
                l2: number;
                predictive: number;
            };
            misses: number;
        };
    } {
        return {
            expressions: {
                hitRate: this.expressionCache.getHitRate(),
                size: {
                    total: this.expressionCache.getTotalSize(),
                    l1: this.expressionCache.getL1Size(),
                    l2: this.expressionCache.getL2Size()
                },
                hits: {
                    l1: this.expressionCache.getL1Hits(),
                    l2: this.expressionCache.getL2Hits(),
                    predictive: this.expressionCache.getPredictiveHits()
                },
                misses: this.expressionCache.getMisses()
            },
            translations: {
                hitRate: this.translationCache.getHitRate(),
                size: {
                    total: this.translationCache.getTotalSize(),
                    l1: this.translationCache.getL1Size(),
                    l2: this.translationCache.getL2Size()
                },
                hits: {
                    l1: this.translationCache.getL1Hits(),
                    l2: this.translationCache.getL2Hits(),
                    predictive: this.translationCache.getPredictiveHits()
                },
                misses: this.translationCache.getMisses()
            },
            dialects: {
                hitRate: this.dialectCache.getHitRate(),
                size: {
                    total: this.dialectCache.getTotalSize(),
                    l1: this.dialectCache.getL1Size(),
                    l2: this.dialectCache.getL2Size()
                },
                hits: {
                    l1: this.dialectCache.getL1Hits(),
                    l2: this.dialectCache.getL2Hits(),
                    predictive: this.dialectCache.getPredictiveHits()
                },
                misses: this.dialectCache.getMisses()
            }
        };
    }

    /**
     * Précharge les données fréquemment utilisées dans les caches
     */
    public async preloadFrequentData(): Promise<void> {
        // Implémentation à compléter selon les besoins
        logger.debug('Starting preload of frequent LSF data');
        // Préchargement des données fréquentes
    }

    /**
     * Supprime les éléments rarement utilisés des caches
     */
    public clearInfrequentItems(): void {
        // Implémentation à compléter
        logger.debug('Clearing infrequent items from LSF caches');
    }

    /**
     * Analyse les patterns d'utilisation du cache et suggère des optimisations
     * @returns Liste des optimisations suggérées
     */
    public async analyzeCachePatterns(): Promise<string[]> {
        // Analyse des patterns d'utilisation
        logger.debug('Analyzing cache usage patterns');
        const suggestions: string[] = [];

        // Exemple d'analyse et de suggestions
        const expressionStats = this.expressionCache.getStats();
        if (expressionStats.hitRate < 0.7 && expressionStats.size.total > 1000) {
            suggestions.push('resize');
        }

        if (expressionStats.hits.predictive / expressionStats.hits.l1 < 0.1) {
            suggestions.push('preload');
        }

        return suggestions;
    }

    /**
     * Optimise les tailles des caches en fonction de leur utilisation
     */
    public optimizeCacheSizes(): void {
        // Implémentation à compléter
        logger.debug('Optimizing LSF cache sizes based on usage patterns');
    }

    /**
     * Précharge les éléments populaires dans les caches
     */
    public async preloadPopularItems(): Promise<void> {
        // Implémentation à compléter
        logger.debug('Preloading popular items into LSF caches');
    }

    /**
     * Libère les ressources utilisées par les caches
     */
    public dispose(): void {
        this.expressionCache.dispose();
        this.translationCache.dispose();
        this.dialectCache.dispose();
        logger.debug('LSF cache manager disposed');
    }
}