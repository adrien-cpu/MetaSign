/**
 * @file: src/ai/types/cache.ts
 * 
 * Types et interfaces pour le système de cache
 */

/**
 * Niveaux de cache disponibles
 */
export enum CacheTier {
    /** Cache L1: rapide mais petite capacité, pour accès fréquents */
    L1 = 'L1',
    /** Cache L2: plus grande capacité mais moins rapide, pour accès moins fréquents */
    L2 = 'L2',
    /** Cache prédictif: pour préchargement des données probablement nécessaires */
    PREDICTIVE = 'PREDICTIVE'
}

/**
 * Stratégies de cache
 */
export enum CacheStrategy {
    /** Cache standard */
    Standard = 'standard',
    /** Ne pas mettre en cache */
    NoCache = 'no-cache',
    /** Cache pour une longue durée */
    LongTerm = 'long-term',
    /** Cache pour une courte durée */
    ShortTerm = 'short-term'
}

/**
 * Configuration du cache multi-niveaux
 */
export interface CacheOptions {
    /** Nombre maximal d'éléments dans le cache L1 */
    l1MaxSize: number;
    /** Nombre maximal d'éléments dans le cache L2 */
    l2MaxSize: number;
    /** Nombre maximal d'éléments dans le cache prédictif */
    predictiveMaxSize: number;
    /** Durée de vie par défaut (ms) pour les éléments sans TTL spécifié */
    defaultTTL: number;
    /** Durée de vie (ms) des éléments dans le cache L1 */
    l1TTL: number;
    /** Durée de vie (ms) des éléments dans le cache L2 */
    l2TTL: number;
    /** Seuil de prédiction pour inclure un élément dans le cache prédictif */
    predictionThreshold: number;
    /** Intervalle (ms) entre les nettoyages d'éléments expirés */
    cleanupInterval: number;
    /** Tags associés à cet élément pour l'invalidation groupée */
    tags?: string[];
}

/**
 * Élément stocké dans le cache
 */
export interface CacheItem<T> {
    /** Valeur stockée */
    value: T;
    /** Timestamp de création de l'élément */
    createdAt: number;
    /** Timestamp du dernier accès à l'élément */
    lastAccessed: number;
    /** Timestamp d'expiration de l'élément */
    expiresAt: number;
    /** Nombre d'accès à l'élément */
    accessCount: number;
    /** Métadonnées additionnelles */
    metadata: Record<string, unknown>;
}

/**
 * Statistiques d'utilisation du cache
 */
export interface CacheStats {
    /** Statistiques des hits (succès) */
    hits: {
        /** Nombre de hits dans le cache L1 */
        l1: number;
        /** Nombre de hits dans le cache L2 */
        l2: number;
        /** Nombre de hits dans le cache prédictif */
        predictive: number;
    };
    /** Nombre de misses (échecs) */
    misses: number;
    /** Statistiques des évictions */
    evictions: {
        /** Nombre d'évictions du cache L1 */
        l1: number;
        /** Nombre d'évictions du cache L2 */
        l2: number;
        /** Nombre d'évictions du cache prédictif */
        predictive: number;
    };
}

/**
 * Options pour l'ajout d'un élément au cache
 */
export interface SetCacheOptions {
    /** Durée de vie en cache (ms) - remplace la valeur par défaut */
    ttl?: number;
    /** Niveau de cache cible */
    tier?: CacheTier;
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
    /** Tags associés à cet élément pour l'invalidation groupée */
    tags?: string[];
}

/**
 * Modèle pour la prédiction d'accès
 */
export interface PredictionModel {
    /** Patterns d'accès séquentiels (clé_précédente>clé_suivante → fréquence) */
    sequentialAccess: Map<string, number>;
    /** Scores d'importance des items */
    itemScores: Map<string, number>;
    /** Clés co-accédées */
    coAccessPatterns: Map<string, Set<string>>;
}

/**
 * Statistiques étendues du cache
 */
export interface ExtendedCacheStats extends CacheStats {
    /** Taux de succès global */
    hitRate: number;
    /** Taille actuelle par niveau */
    size: {
        l1: number;
        l2: number;
        predictive: number;
        total: number;
    };
    /** Estimation de la mémoire utilisée (octets) */
    memoryUsage: number;
}

/**
 * Gestionnaire de cache
 */
export interface ICacheManager {
    /** Récupère un élément du cache */
    get<T>(key: string): T | undefined;
    /** Stocke un élément dans le cache */
    set<T>(key: string, value: T, options?: SetCacheOptions): void;
    /** Supprime un élément du cache */
    delete(key: string): boolean;
    /** Vérifie si un élément existe dans le cache */
    has(key: string): boolean;
    /** Vide le cache */
    clear(): void;
    /** Récupère les statistiques du cache */
    getStats(): ExtendedCacheStats;
    /** Invalide toutes les entrées avec un tag spécifique */
    invalidateByTag(tag: string): number;
}

/**
 * Interface pour le gestionnaire de cache LSF
 */
export interface ILSFCacheManager {
    /** Récupère le cache d'expressions */
    getExpressionCache(): ICacheManager;
    /** Récupère le cache de traductions */
    getTranslationCache(): ICacheManager;
    /** Récupère le cache de dialectes */
    getDialectCache(): ICacheManager;
    /** Récupère les statistiques globales */
    getGlobalStats(): Record<string, ExtendedCacheStats>;
    /** Précharge les données fréquentes */
    preloadFrequentData(): Promise<void>;
    /** Vide tous les caches */
    clearAllCaches(): void;
}

/**
 * Type des expressions LSF pour le cache
 */
export interface LSFExpressionData {
    id: string;
    type: string;
    components: Array<{
        id: string;
        type: string;
        parameters: Record<string, unknown>;
        timing: number;
        position?: { x: number; y: number; z: number };
    }>;
    metadata: {
        source: string;
        context?: string;
        emotionalIntent?: string;
        culturalVariant?: string;
        createdAt: number;
    };
}

/**
 * Type des traductions LSF pour le cache
 */
export interface LSFTranslationData {
    sourceText: string;
    sourceLang: string;
    targetExpression: LSFExpressionData;
    confidence: number;
    alternatives?: LSFExpressionData[];
    metadata: {
        translationTime: number;
        modelVersion: string;
        dialectVariant?: string;
        contextualHints?: string[];
        createdAt: number;
    };
}

/**
 * Type des données dialectales LSF pour le cache
 */
export interface LSFDialectData {
    id: string;
    name: string;
    region: string;
    expressions: Record<string, {
        standardId: string;
        variantId: string;
        differences: Array<{
            componentId: string;
            parameterChanges: Record<string, unknown>;
            positionChanges?: { x?: number; y?: number; z?: number };
            timingChanges?: number;
        }>;
    }>;
    metadata: {
        source: string;
        validatedBy: string[];
        lastUpdated: number;
        confidence: number;
    };
}