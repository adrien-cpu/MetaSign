//src/ai/performance/cache/interfaces/cache.interfaces.ts
/**
 * Interfaces pour le système de cache à plusieurs niveaux
 * Séparation des interfaces pour faciliter les tests et l'implémentation
 */

/**
 * Types des niveaux de cache
 */
export enum CacheLevel {
    L1 = 'L1',      // Cache de premier niveau (le plus rapide, taille limitée)
    L2 = 'L2',      // Cache de second niveau (plus grand, moins rapide)
    L3 = 'L3',      // Cache de troisième niveau (persistant, lent)
    PREDICTIVE = 'PREDICTIVE' // Cache prédictif basé sur l'apprentissage
}

/**
 * Politiques de remplacement du cache
 */
export enum CacheReplacementPolicy {
    LRU = 'LRU',          // Least Recently Used - éjecte les éléments utilisés le moins récemment
    LFU = 'LFU',          // Least Frequently Used - éjecte les éléments utilisés le moins fréquemment
    FIFO = 'FIFO',        // First In, First Out - éjecte les éléments les plus anciens
    RANDOM = 'RANDOM',    // Aléatoire - éjecte des éléments au hasard
    TLRU = 'TLRU',        // Time-aware LRU - LRU avec conscience du temps de vie
    ADAPTIVE = 'ADAPTIVE' // Adaptatif - combine plusieurs stratégies selon le contexte
}

/**
 * Options pour les opérations de cache
 */
export interface CacheOptions {
    // Durée de vie en millisecondes
    ttl?: number;

    // Priorité de l'élément
    priority?: 'low' | 'medium' | 'high' | 'critical';

    // Tags pour le filtrage et l'invalidation groupée
    tags?: string[];

    // Activer ou désactiver la compression pour cet élément
    compressionEnabled?: boolean;

    // Métadonnées associées à l'élément
    metadata?: Record<string, unknown>;

    // Niveau de cache ciblé (si non défini, utilise tous les niveaux)
    targetLevel?: CacheLevel;
}

/**
 * Règles pour déterminer le niveau de cache approprié
 */
export interface CachePromotionRules {
    // Nombre de hits pour promouvoir du L2 au L1
    hitsToPromoteToL1: number;

    // Ratio d'éléments à précharger par prédiction
    predictiveLoadRatio: number;

    // Seuil de fréquence d'accès pour considérer un élément comme "hot"
    hotItemThreshold: number;

    // Temps minimal entre les promotions (ms)
    promotionCooldown: number;
}

/**
 * Configuration du cache
 */
export interface CacheConfig {
    // Taille maximale du cache L1 en octets
    l1Size: number;

    // Taille maximale du cache L2 en octets
    l2Size: number;

    // Taille maximale du cache L3 en octets (si utilisé)
    l3Size?: number;

    // Taille maximale du cache prédictif en octets
    predictiveCacheSize?: number;

    // Durée de vie par défaut en millisecondes
    defaultTTL: number;

    // Activer le cache prédictif
    enablePredictiveCache?: boolean;

    // Politique de remplacement
    evictionPolicy?: CacheReplacementPolicy;

    // Activer la compression des données
    compressionEnabled?: boolean;

    // Règles de promotion entre niveaux
    promotionRules?: CachePromotionRules;

    // Niveau de cache à utiliser
    level?: CacheLevel;

    // Activer la persistance (pour le cache L3)
    persistenceEnabled?: boolean;

    // Intervalle de nettoyage automatique (ms)
    cleanupInterval?: number;
}

/**
 * Résultat d'une opération de cache
 */
export interface CacheResult<T> {
    // Valeur récupérée
    value: T;

    // Métadonnées associées
    metadata?: Record<string, unknown>;

    // Niveau de cache d'où provient la valeur
    cacheLevel: CacheLevel;

    // Âge de l'élément en millisecondes
    age: number;

    // Temps restant avant expiration en millisecondes
    ttl: number;

    // Nombre d'accès à cet élément
    hits: number;
}

/**
 * Métriques pour le cache
 */
export interface CacheMetrics {
    // Taille actuelle en octets par niveau
    size: {
        L1: number;
        L2: number;
        L3?: number;
        PREDICTIVE?: number;
        total: number;
    };

    // Nombre d'entrées par niveau
    entries: {
        L1: number;
        L2: number;
        L3?: number;
        PREDICTIVE?: number;
        total: number;
    };

    // Statistiques d'accès
    hits: {
        L1: number;
        L2: number;
        L3?: number;
        PREDICTIVE?: number;
        total: number;
    };

    // Statistiques d'échecs
    misses: {
        L1: number;
        L2: number;
        L3?: number;
        PREDICTIVE?: number;
        total: number;
    };

    // Taux de succès global
    hitRate: number;

    // Nombre d'évictions
    evictions: {
        L1: number;
        L2: number;
        L3?: number;
        PREDICTIVE?: number;
        total: number;
    };

    // Temps moyen d'accès en millisecondes
    averageAccessTime: number;

    // Nombre de promotions entre niveaux
    promotions: {
        L2ToL1: number;
        L3ToL2?: number;
        predictiveToL1?: number;
    };

    // Taux de compression moyen (si compression activée)
    compressionRatio?: number;
}

/**
 * Stratégies d'optimisation du cache
 */
export interface CacheOptimizationStrategy {
    // Privilégier la vitesse
    cacheFirst: boolean;

    // Mise en cache agressive
    aggressiveCaching: boolean;

    // Préchargement des données associées
    prefetchRelated: boolean;

    // Niveau de compression (0-9)
    compressionLevel: number;

    // Facteur de priorité de l'éviction
    evictionPriorityFactor: number;
}

/**
 * Interface pour le système de cache
 */
export interface ICache {
    /**
     * Récupère une valeur du cache
     * @param key Clé de l'élément
     * @param options Options de récupération
     * @returns La valeur ou null si non trouvée
     */
    get<T>(key: string, options?: Partial<CacheOptions>): Promise<T | null>;

    /**
     * Stocke une valeur dans le cache
     * @param key Clé de l'élément
     * @param value Valeur à stocker
     * @param options Options de stockage
     * @returns Succès de l'opération
     */
    set<T>(key: string, value: T, options?: Partial<CacheOptions>): Promise<boolean>;

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     * @returns true si la clé existe et n'est pas expirée
     */
    has(key: string): Promise<boolean>;

    /**
     * Supprime une valeur du cache
     * @param key Clé à supprimer
     * @returns true si la valeur existait et a été supprimée
     */
    delete(key: string): Promise<boolean>;

    /**
     * Invalide toutes les entrées avec un tag spécifique
     * @param tag Tag à invalider
     * @returns Nombre d'entrées invalidées
     */
    invalidateByTag(tag: string): Promise<number>;

    /**
     * Vide complètement le cache
     * @returns Nombre d'entrées supprimées
     */
    clear(): Promise<number>;

    /**
     * Récupère les métriques du cache
     * @returns Métriques du cache
     */
    getMetrics(): CacheMetrics;

    /**
     * Nettoie les entrées expirées
     * @param ratio Proportion (0-1) d'entrées à nettoyer
     * @returns Nombre d'entrées nettoyées
     */
    cleanup(ratio?: number): Promise<number>;

    /**
     * Met à jour la stratégie d'optimisation
     * @param strategy Stratégie d'optimisation
     */
    updateStrategy(strategy: Partial<CacheOptimizationStrategy>): void;

    /**
     * Optimise le cache pour un cas d'utilisation spécifique
     * @param target Objectif d'optimisation ('speed', 'memory', 'latency', 'precision', 'balanced')
     */
    optimizeFor(target: 'speed' | 'memory' | 'latency' | 'precision' | 'balanced'): void;

    /**
     * Optimise automatiquement le cache selon les patterns d'usage
     */
    optimize(): Promise<void>;
}

/**
 * Interface pour une entrée de cache
 */
export interface CacheEntry<T> {
    // Valeur stockée
    value: T;

    // Horodatage de création
    timestamp: number;

    // Horodatage d'expiration
    expires: number;

    // Nombre d'accès
    hits: number;

    // Dernier accès
    lastAccessed: number;

    // Taille approximative en octets
    size: number;

    // Priorité de l'élément
    priority: 'low' | 'medium' | 'high' | 'critical';

    // Tags associés
    tags?: string[];

    // Métadonnées
    metadata?: Record<string, unknown>;

    // Donnée compressée ou non
    compressed?: boolean;
}

/**
 * Interface pour le cache prédictif
 */
export interface IPredictiveCache<T> {
    /**
     * Prédit les clés qui seront probablement demandées
     * @param currentKey Clé actuelle
     * @returns Liste des clés prédites
     */
    predictRelatedKeys(currentKey: string): Promise<string[]>;

    /**
     * Enregistre une séquence d'accès pour améliorer les prédictions
     * @param sequence Séquence d'accès aux clés
     */
    recordAccessSequence(sequence: string[]): Promise<void>;

    /**
     * Précharge les données probablement nécessaires
     * @param currentKey Clé actuelle
     */
    prefetchPredicted(currentKey: string): Promise<void>;

    /**
     * Ajoute une association explicite entre des clés
     * @param key Clé principale
     * @param relatedKeys Clés associées
     */
    addRelationship(key: string, relatedKeys: string[]): Promise<void>;

    /**
     * Optimise le modèle prédictif
     */
    optimizeModel(): Promise<void>;
}