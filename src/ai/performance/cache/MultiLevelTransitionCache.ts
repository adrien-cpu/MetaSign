// src/ai/performance/cache/MultiLevelTransitionCache.ts
import { LSFExpression } from '@ai/systems/expressions/lsf/types';
import { TransitionContext, TransitionSequence } from '@ai/systems/expressions/grammar/types/transition-types';
import { PerformanceMonitoringSystem } from '@ai/performance/PerformanceMonitoringSystem';

/**
 * Structure d'un élément en cache
 */
interface CacheItem<T> {
    data: T;
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    expiresAt: number;
    size: number;
}

/**
 * Niveau de cache
 */
enum CacheLevel {
    L1 = 'L1', // Rapide, petite taille
    L2 = 'L2', // Moyen, taille moyenne
    L3 = 'L3'  // Lent, grande taille
}

/**
 * Statistiques d'un cache
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    itemCount: number;
    hitRate: number;
    evictions: number;
    avgAccessTime: number;
}

/**
 * Options de configuration du cache multi-niveaux
 */
interface MultiLevelCacheOptions {
    maxSizeL1: number;  // Taille max du L1 en octets
    maxSizeL2: number;  // Taille max du L2 en octets
    maxSizeL3: number;  // Taille max du L3 en octets
    ttlL1: number;      // Durée de vie des éléments en L1 (ms)
    ttlL2: number;      // Durée de vie des éléments en L2 (ms)
    ttlL3: number;      // Durée de vie des éléments en L3 (ms)
    promotionThreshold: number; // Nombre d'accès avant promotion L2->L1
    compressionThreshold: number; // Taille à partir de laquelle compresser (octets)
}

/**
 * Cache multi-niveaux optimisé pour les transitions LSF
 * Implémente une stratégie de cache hiérarchique avec promotion/rétrogradation
 * et compression intelligente
 */
export class MultiLevelTransitionCache {
    private readonly cacheL1: Map<string, CacheItem<TransitionSequence>>;
    private readonly cacheL2: Map<string, CacheItem<TransitionSequence>>;
    private readonly cacheL3: Map<string, CacheItem<TransitionSequence>>;

    private readonly options: MultiLevelCacheOptions;
    private readonly performanceMonitor: PerformanceMonitoringSystem;

    private currentSizeL1: number;
    private currentSizeL2: number;
    private currentSizeL3: number;

    private stats: {
        hitsL1: number;
        hitsL2: number;
        hitsL3: number;
        misses: number;
        evictionsL1: number;
        evictionsL2: number;
        evictionsL3: number;
        accessTimes: number[];
    };

    constructor(options?: Partial<MultiLevelCacheOptions>) {
        this.cacheL1 = new Map();
        this.cacheL2 = new Map();
        this.cacheL3 = new Map();

        // Valeurs par défaut
        this.options = {
            maxSizeL1: 10 * 1024 * 1024,  // 10 Mo
            maxSizeL2: 50 * 1024 * 1024,  // 50 Mo
            maxSizeL3: 200 * 1024 * 1024, // 200 Mo
            ttlL1: 5 * 60 * 1000,         // 5 minutes
            ttlL2: 30 * 60 * 1000,        // 30 minutes
            ttlL3: 2 * 60 * 60 * 1000,    // 2 heures
            promotionThreshold: 3,        // Promouvoir après 3 accès
            compressionThreshold: 10 * 1024, // Compresser au-delà de 10 Ko
            ...options
        };

        this.currentSizeL1 = 0;
        this.currentSizeL2 = 0;
        this.currentSizeL3 = 0;

        this.stats = {
            hitsL1: 0,
            hitsL2: 0,
            hitsL3: 0,
            misses: 0,
            evictionsL1: 0,
            evictionsL2: 0,
            evictionsL3: 0,
            accessTimes: []
        };

        this.performanceMonitor = PerformanceMonitoringSystem.getInstance();

        // Démarrer le nettoyage périodique
        this.startPeriodicCleanup();
    }

    /**
     * Récupère une séquence de transition du cache
     * @param from Expression de départ
     * @param to Expression cible
     * @param context Contexte de la transition
     * @returns Séquence de transition si trouvée, sinon undefined
     */
    public get(
        from: LSFExpression,
        to: LSFExpression,
        context: TransitionContext
    ): TransitionSequence | undefined {
        const startTime = performance.now();
        const key = this.generateCacheKey(from, to, context);

        // Vérifier dans L1 (le plus rapide)
        const itemL1 = this.cacheL1.get(key);
        if (itemL1 && !this.isExpired(itemL1)) {
            this.stats.hitsL1++;
            itemL1.lastAccessed = Date.now();
            itemL1.accessCount++;

            const duration = performance.now() - startTime;
            this.stats.accessTimes.push(duration);
            this.trackMetrics('hit', 'L1', duration);

            return itemL1.data;
        }

        // Vérifier dans L2
        const itemL2 = this.cacheL2.get(key);
        if (itemL2 && !this.isExpired(itemL2)) {
            this.stats.hitsL2++;
            itemL2.lastAccessed = Date.now();
            itemL2.accessCount++;

            // Promouvoir à L1 si accédé fréquemment
            if (itemL2.accessCount >= this.options.promotionThreshold) {
                this.promote(key, itemL2, CacheLevel.L1);
            }

            const duration = performance.now() - startTime;
            this.stats.accessTimes.push(duration);
            this.trackMetrics('hit', 'L2', duration);

            return itemL2.data;
        }

        // Vérifier dans L3
        const itemL3 = this.cacheL3.get(key);
        if (itemL3 && !this.isExpired(itemL3)) {
            this.stats.hitsL3++;
            itemL3.lastAccessed = Date.now();
            itemL3.accessCount++;

            // Promouvoir à L2 si accédé fréquemment
            if (itemL3.accessCount >= this.options.promotionThreshold) {
                this.promote(key, itemL3, CacheLevel.L2);
            }

            const duration = performance.now() - startTime;
            this.stats.accessTimes.push(duration);
            this.trackMetrics('hit', 'L3', duration);

            return itemL3.data;
        }

        // Cache miss
        this.stats.misses++;
        const duration = performance.now() - startTime;
        this.trackMetrics('miss', 'none', duration);

        return undefined;
    }

    /**
     * Stocke une séquence de transition dans le cache
     * @param from Expression de départ
     * @param to Expression cible
     * @param context Contexte de la transition
     * @param sequence Séquence de transition à stocker
     * @param level Niveau de cache initial (par défaut L2)
     */
    public set(
        from: LSFExpression,
        to: LSFExpression,
        context: TransitionContext,
        sequence: TransitionSequence,
        level: CacheLevel = CacheLevel.L2
    ): void {
        const startTime = performance.now();
        const key = this.generateCacheKey(from, to, context);

        // Estimer la taille de l'élément
        const sequenceSize = this.estimateSize(sequence);

        // Créer l'élément de cache
        const now = Date.now();
        let ttl: number;

        switch (level) {
            case CacheLevel.L1:
                ttl = this.options.ttlL1;
                break;
            case CacheLevel.L2:
                ttl = this.options.ttlL2;
                break;
            case CacheLevel.L3:
                ttl = this.options.ttlL3;
                break;
        }

        const cacheItem: CacheItem<TransitionSequence> = {
            data: sequence,
            createdAt: now,
            lastAccessed: now,
            accessCount: 0,
            expiresAt: now + ttl,
            size: sequenceSize
        };

        // Stocker au niveau approprié
        switch (level) {
            case CacheLevel.L1:
                this.setInL1(key, cacheItem);
                break;
            case CacheLevel.L2:
                this.setInL2(key, cacheItem);
                break;
            case CacheLevel.L3:
                this.setInL3(key, cacheItem);
                break;
        }

        const duration = performance.now() - startTime;
        this.trackMetrics('set', level, duration, sequenceSize);
    }

    /**
     * Supprime un élément du cache
     * @param from Expression de départ
     * @param to Expression cible
     * @param context Contexte de la transition
     * @returns true si supprimé, false si non trouvé
     */
    public delete(
        from: LSFExpression,
        to: LSFExpression,
        context: TransitionContext
    ): boolean {
        const key = this.generateCacheKey(from, to, context);
        let found = false;

        // Vérifier dans L1
        if (this.cacheL1.has(key)) {
            const item = this.cacheL1.get(key)!;
            this.currentSizeL1 -= item.size;
            this.cacheL1.delete(key);
            found = true;
        }

        // Vérifier dans L2
        if (this.cacheL2.has(key)) {
            const item = this.cacheL2.get(key)!;
            this.currentSizeL2 -= item.size;
            this.cacheL2.delete(key);
            found = true;
        }

        // Vérifier dans L3
        if (this.cacheL3.has(key)) {
            const item = this.cacheL3.get(key)!;
            this.currentSizeL3 -= item.size;
            this.cacheL3.delete(key);
            found = true;
        }

        return found;
    }

    /**
     * Efface tous les caches
     */
    public clear(): void {
        this.cacheL1.clear();
        this.cacheL2.clear();
        this.cacheL3.clear();

        this.currentSizeL1 = 0;
        this.currentSizeL2 = 0;
        this.currentSizeL3 = 0;

        // Réinitialiser les statistiques
        this.stats = {
            hitsL1: 0,
            hitsL2: 0,
            hitsL3: 0,
            misses: 0,
            evictionsL1: 0,
            evictionsL2: 0,
            evictionsL3: 0,
            accessTimes: []
        };

        this.trackMetrics('clear', 'all', 0);
    }

    /**
     * Obtient les statistiques du cache
     * @returns Statistiques pour chaque niveau de cache
     */
    public getStats(): Record<string, CacheStats> {
        const totalHits = this.stats.hitsL1 + this.stats.hitsL2 + this.stats.hitsL3;
        const totalRequests = totalHits + this.stats.misses;
        const avgAccessTime = this.stats.accessTimes.length > 0
            ? this.stats.accessTimes.reduce((sum, time) => sum + time, 0) / this.stats.accessTimes.length
            : 0;

        return {
            L1: {
                hits: this.stats.hitsL1,
                misses: totalRequests - this.stats.hitsL1,
                size: this.currentSizeL1,
                itemCount: this.cacheL1.size,
                hitRate: totalRequests > 0 ? this.stats.hitsL1 / totalRequests : 0,
                evictions: this.stats.evictionsL1,
                avgAccessTime
            },
            L2: {
                hits: this.stats.hitsL2,
                misses: totalRequests - this.stats.hitsL2,
                size: this.currentSizeL2,
                itemCount: this.cacheL2.size,
                hitRate: totalRequests > 0 ? this.stats.hitsL2 / totalRequests : 0,
                evictions: this.stats.evictionsL2,
                avgAccessTime
            },
            L3: {
                hits: this.stats.hitsL3,
                misses: totalRequests - this.stats.hitsL3,
                size: this.currentSizeL3,
                itemCount: this.cacheL3.size,
                hitRate: totalRequests > 0 ? this.stats.hitsL3 / totalRequests : 0,
                evictions: this.stats.evictionsL3,
                avgAccessTime
            },
            overall: {
                hits: totalHits,
                misses: this.stats.misses,
                size: this.currentSizeL1 + this.currentSizeL2 + this.currentSizeL3,
                itemCount: this.cacheL1.size + this.cacheL2.size + this.cacheL3.size,
                hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
                evictions: this.stats.evictionsL1 + this.stats.evictionsL2 + this.stats.evictionsL3,
                avgAccessTime
            }
        };
    }

    /**
     * Stocke un élément dans le cache L1
     * @param key Clé de cache
     * @param item Élément à stocker
     */
    private setInL1(key: string, item: CacheItem<TransitionSequence>): void {
        // Libérer de l'espace si nécessaire
        while (this.currentSizeL1 + item.size > this.options.maxSizeL1 && this.cacheL1.size > 0) {
            this.evict(CacheLevel.L1);
        }

        // Stocker dans L1
        this.cacheL1.set(key, item);
        this.currentSizeL1 += item.size;
    }

    /**
     * Stocke un élément dans le cache L2
     * @param key Clé de cache
     * @param item Élément à stocker
     */
    private setInL2(key: string, item: CacheItem<TransitionSequence>): void {
        // Libérer de l'espace si nécessaire
        while (this.currentSizeL2 + item.size > this.options.maxSizeL2 && this.cacheL2.size > 0) {
            this.evict(CacheLevel.L2);
        }

        // Stocker dans L2
        this.cacheL2.set(key, item);
        this.currentSizeL2 += item.size;
    }

    /**
     * Stocke un élément dans le cache L3
     * @param key Clé de cache
     * @param item Élément à stocker
     */
    private setInL3(key: string, item: CacheItem<TransitionSequence>): void {
        // Libérer de l'espace si nécessaire
        while (this.currentSizeL3 + item.size > this.options.maxSizeL3 && this.cacheL3.size > 0) {
            this.evict(CacheLevel.L3);
        }

        // Stocker dans L3
        this.cacheL3.set(key, item);
        this.currentSizeL3 += item.size;
    }

    /**
     * Évince un élément du niveau de cache spécifié
     * @param level Niveau de cache
     */
    private evict(level: CacheLevel): void {
        let cache: Map<string, CacheItem<TransitionSequence>>;

        switch (level) {
            case CacheLevel.L1:
                cache = this.cacheL1;
                this.stats.evictionsL1++;
                break;
            case CacheLevel.L2:
                cache = this.cacheL2;
                this.stats.evictionsL2++;
                break;
            case CacheLevel.L3:
                cache = this.cacheL3;
                this.stats.evictionsL3++;
                break;
        }

        if (cache.size === 0) return;

        // Trouver l'élément à évincer (LRU - le moins récemment utilisé)
        let oldestKey: string | null = null;
        let oldestItem: CacheItem<TransitionSequence> | null = null;
        let oldestAccessTime = Date.now();

        for (const [key, item] of cache.entries()) {
            if (item.lastAccessed < oldestAccessTime) {
                oldestAccessTime = item.lastAccessed;
                oldestKey = key;
                oldestItem = item;
            }
        }

        if (oldestKey && oldestItem) {
            // Supprimer l'élément du niveau actuel
            cache.delete(oldestKey);

            // Mettre à jour le compteur de taille
            switch (level) {
                case CacheLevel.L1:
                    this.currentSizeL1 -= oldestItem.size;
                    // Rétrograder au L2 si encore pertinent
                    if (!this.isExpired(oldestItem) && oldestItem.accessCount > 1) {
                        this.setInL2(oldestKey, {
                            ...oldestItem,
                            expiresAt: Date.now() + this.options.ttlL2
                        });
                    }
                    break;
                case CacheLevel.L2:
                    this.currentSizeL2 -= oldestItem.size;
                    // Rétrograder au L3 si encore pertinent
                    if (!this.isExpired(oldestItem) && oldestItem.accessCount > 0) {
                        this.setInL3(oldestKey, {
                            ...oldestItem,
                            expiresAt: Date.now() + this.options.ttlL3
                        });
                    }
                    break;
                case CacheLevel.L3:
                    this.currentSizeL3 -= oldestItem.size;
                    break;
            }
        }
    }

    /**
     * Promeut un élément vers un niveau de cache supérieur
     * @param key Clé de l'élément
     * @param item Élément à promouvoir
     * @param targetLevel Niveau de cache cible
     */
    private promote(
        key: string,
        item: CacheItem<TransitionSequence>,
        targetLevel: CacheLevel
    ): void {
        switch (targetLevel) {
            case CacheLevel.L1:
                // Supprimer de L2 et ajouter à L1
                this.cacheL2.delete(key);
                this.currentSizeL2 -= item.size;

                this.setInL1(key, {
                    ...item,
                    expiresAt: Date.now() + this.options.ttlL1
                });
                break;

            case CacheLevel.L2:
                // Supprimer de L3 et ajouter à L2
                this.cacheL3.delete(key);
                this.currentSizeL3 -= item.size;

                this.setInL2(key, {
                    ...item,
                    expiresAt: Date.now() + this.options.ttlL2
                });
                break;
        }

        this.trackMetrics('promote', targetLevel, 0, item.size);
    }

    /**
     * Vérifie si un élément du cache est expiré
     * @param item Élément à vérifier
     * @returns true si expiré
     */
    private isExpired(item: CacheItem<TransitionSequence>): boolean {
        return Date.now() > item.expiresAt;
    }

    /**
     * Estime la taille en mémoire d'une séquence de transition
     * @param sequence Séquence à évaluer
     * @returns Taille estimée en octets
     */
    private estimateSize(sequence: TransitionSequence): number {
        // Estimations de base pour les différentes parties
        const metadataSize = JSON.stringify(sequence.metadata).length * 2; // ~2 octets par caractère
        const stepsSize = sequence.steps.reduce((total, step) => {
            const expressionSize = JSON.stringify(step.expression).length * 2;
            const stepMetadataSize = 20; // ~20 octets pour durée et easing
            return total + expressionSize + stepMetadataSize;
        }, 0);

        // Base overhead + metadata + steps + autres propriétés
        return 100 + metadataSize + stepsSize + 8; // 8 octets pour duration
    }

    /**
     * Génère une clé de cache pour une combinaison d'expressions et contexte
     * @param from Expression de départ
     * @param to Expression cible
     * @param context Contexte de la transition
     * @returns Clé de cache
     */
    private generateCacheKey(
        from: LSFExpression,
        to: LSFExpression,
        context: TransitionContext
    ): string {
        // Simplifier les expressions pour la clé (garder expressionType et réduire la précision des valeurs)
        const simpleFrom = this.simplifyExpressionForKey(from);
        const simpleTo = this.simplifyExpressionForKey(to);

        // Simplifier le contexte (garder uniquement les propriétés importantes)
        const simpleContext = {
            speed: context.speed,
            importance: context.importance,
            environment: context.environment
        };

        return `${JSON.stringify(simpleFrom)}_${JSON.stringify(simpleTo)}_${JSON.stringify(simpleContext)}`;
    }

    /**
     * Simplifie une expression pour l'utiliser comme clé de cache
     * @param expression Expression à simplifier
     * @returns Version simplifiée de l'expression
     */
    private simplifyExpressionForKey(expression: LSFExpression): Record<string, unknown> {
        return {
            type: expression.expressionType,
            eyebrows: this.simplifyComponentForKey(expression.eyebrows),
            head: this.simplifyComponentForKey(expression.head),
            mouth: this.simplifyComponentForKey(expression.mouth)
        };
    }

    /**
     * Simplifie un composant d'expression pour la clé de cache
     * @param component Composant à simplifier
     * @returns Version simplifiée du composant
     */
    private simplifyComponentForKey(component: Record<string, unknown>): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(component)) {
            if (typeof value === 'number') {
                // Arrondir les nombres à 1 décimale
                result[key] = Math.round(value * 10) / 10;
            } else if (typeof value === 'object' && value !== null) {
                // Récursion pour les objets imbriqués
                result[key] = this.simplifyComponentForKey(value as Record<string, unknown>);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Démarre le nettoyage périodique du cache
     */
    private startPeriodicCleanup(): void {
        // Nettoyer tous les caches toutes les 5 minutes
        setInterval(() => {
            this.cleanupExpired();
        }, 5 * 60 * 1000);
    }

    /**
     * Nettoie les éléments expirés de tous les niveaux de cache
     */
    private cleanupExpired(): void {
        const now = Date.now();
        let removedCount = 0;

        // Nettoyer L1
        for (const [key, item] of this.cacheL1.entries()) {
            if (now > item.expiresAt) {
                this.cacheL1.delete(key);
                this.currentSizeL1 -= item.size;
                removedCount++;
            }
        }

        // Nettoyer L2
        for (const [key, item] of this.cacheL2.entries()) {
            if (now > item.expiresAt) {
                this.cacheL2.delete(key);
                this.currentSizeL2 -= item.size;
                removedCount++;
            }
        }

        // Nettoyer L3
        for (const [key, item] of this.cacheL3.entries()) {
            if (now > item.expiresAt) {
                this.cacheL3.delete(key);
                this.currentSizeL3 -= item.size;
                removedCount++;
            }
        }

        if (removedCount > 0) {
            this.trackMetrics('cleanup', 'all', 0, 0, removedCount);
        }
    }

    /**
     * Enregistre des métriques de performance
     * @param operation Type d'opération
     * @param level Niveau de cache
     * @param duration Durée de l'opération
     * @param size Taille des données (optionnel)
     * @param count Nombre d'éléments (optionnel)
     */
    private trackMetrics(
        operation: string,
        level: string,
        duration: number,
        size: number = 0,
        count: number = 1
    ): void {
        this.performanceMonitor.recordMetric(
            'cache.transition',
            operation,
            duration,
            {
                level,
                size,
                count
            }
        );
    }
}