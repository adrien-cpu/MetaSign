/**
 * Types et interfaces pour le système d'optimisation
 * @file src/ai/api/distributed/monitoring/optimization/types/optimization.types.ts
 */

/**
 * Stratégies d'éviction pour le cache
 */
export enum CacheEvictionStrategy {
    /** Least Recently Used - Supprime les entrées les moins récemment utilisées */
    LRU = "lru",

    /** Least Frequently Used - Supprime les entrées les moins fréquemment utilisées */
    LFU = "lfu",

    /** First In First Out - Supprime les entrées les plus anciennes */
    FIFO = "fifo",

    /** Supprime les entrées les plus volumineuses */
    SIZE = "size",

    /** Stratégie adaptative qui combine plusieurs algorithmes */
    ADAPTIVE = "adaptive"
}

/**
 * Métriques pour le monitoring du cache
 */
export interface CacheMetrics {
    /** Horodatage de la métrique */
    timestamp: number;

    /** Nombre d'accès réussis au cache */
    hits?: number;

    /** Nombre d'accès manqués au cache */
    misses?: number;

    /** Nombre d'écritures au cache */
    sets?: number;

    /** Nombre d'évictions du cache */
    evictions?: number;

    /** Taille totale du cache */
    totalSize?: number;

    /** Taux de remplissage (0-1) */
    fillRate?: number;

    /** Temps d'accès moyen (ms) */
    accessTime?: number;

    /** Âge moyen des entrées (ms) */
    averageAge?: number;

    /** Distribution des âges par plage */
    ageDistribution?: Record<string, number>;

    /** Nombre d'accès par clé */
    keyAccess?: Record<string, number>;

    /** Taille des clés (bytes) */
    keySize?: Record<string, number>;

    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
}

/**
 * Analyse complète du cache
 */
export interface CacheAnalysis {
    /** Taux de succès (hits/total) */
    hitRate: number;

    /** Taux d'éviction (evictions/operations) */
    evictionRate: number;

    /** Liste des clés fréquemment accédées */
    hotKeys: string[];

    /** Liste des clés rarement accédées */
    coldKeys: string[];

    /** Temps moyen d'accès (ms) */
    averageAccessTime: number;

    /** Taille totale du cache (nombre d'entrées) */
    totalSize: number;

    /** Distribution des âges (pourcentage par plage) */
    ageDistribution: Record<string, number>;

    /** Distribution des tailles (pourcentage par plage) */
    keySizeDistribution: Record<string, number>;

    /** Métriques brutes utilisées pour l'analyse */
    rawMetrics: CacheMetrics[];

    /** Impact estimé sur les performances */
    performanceImpact: {
        /** Impact sur la latence */
        latency: number;

        /** Impact sur l'utilisation mémoire */
        memory: number;

        /** Impact sur le débit */
        throughput: number;
    };
}

/**
 * Résultat de l'optimisation du cache
 */
export interface CacheOptimizationResult {
    /** Si l'optimisation a été appliquée */
    optimizationApplied: boolean;

    /** Stratégie d'éviction recommandée */
    recommendedStrategy: CacheEvictionStrategy;

    /** Taille recommandée pour le cache */
    recommendedSize: number;

    /** Clés à précharger */
    preloadKeys: string[];

    /** Clés à évincer */
    evictKeys: string[];

    /** Amélioration attendue du taux de hit (0-1) */
    expectedHitRateImprovement: number;

    /** Recommandations textuelles */
    recommendations: string[];
}

/**
 * Configuration pour l'optimiseur de cache
 */
export interface CacheOptimizerConfig {
    /** Seuil de taux de hit en dessous duquel optimiser */
    hitRateThreshold: number;

    /** Seuil de taux d'éviction au-dessus duquel optimiser */
    evictionRateThreshold: number;

    /** Fenêtre d'analyse en ms */
    analysisWindow: number;

    /** Intervalle entre optimisations en ms */
    optimizationInterval: number;

    /** Activer l'auto-optimisation */
    autoOptimize: boolean;

    /** Limite de taille maximum pour le cache */
    maxCacheSize?: number;
}

/**
 * Stratégie d'optimisation du cache
 */
export interface CacheOptimizationStrategy {
    /** Type de stratégie */
    type: CacheEvictionStrategy;

    /** Applique la stratégie d'optimisation */
    apply(): Promise<void>;

    /** Obtient la configuration actuelle */
    getConfig(): Record<string, unknown>;

    /** Met à jour la configuration */
    updateConfig(config: Record<string, unknown>): void;
}

/**
 * Événement d'optimisation du cache
 */
export interface CacheOptimizationEvent {
    /** Horodatage de l'événement */
    timestamp: number;

    /** Type d'événement */
    type: 'analysis' | 'optimization' | 'reconfiguration';

    /** Avant l'optimisation */
    before?: {
        hitRate: number;
        evictionRate: number;
        strategy: CacheEvictionStrategy;
        size: number;
    };

    /** Après l'optimisation */
    after?: {
        hitRate: number;
        evictionRate: number;
        strategy: CacheEvictionStrategy;
        size: number;
    };

    /** Durée de l'optimisation (ms) */
    duration?: number;

    /** Modifications effectuées */
    changes?: string[];
}

/**
 * Type des ressources pour l'optimisation
 */
export type ResourceType = 'cpu' | 'memory' | 'network' | 'storage' | 'gpu';

/**
 * Priorité d'optimisation (1: faible, 5: élevée)
 */
export type OptimizationPriority = 1 | 2 | 3 | 4 | 5;

/**
 * Types de goulets d'étranglement
 */
export enum BottleneckType {
    CPU = 'cpu',
    MEMORY = 'memory',
    NETWORK = 'network',
    STORAGE = 'storage',
    GPU = 'gpu',
    GENERAL = 'general'
}

/**
 * Types d'actions d'optimisation
 */
export enum OptimizationActionType {
    SCALE_UP = 'scale_up',
    SCALE_DOWN = 'scale_down',
    REDISTRIBUTE = 'redistribute',
    MIGRATE = 'migrate',
    CACHE = 'cache',
    COMPRESS = 'compress'
}

/**
 * Types de stratégies d'optimisation
 */
export enum OptimizationStrategyType {
    RESOURCE_BALANCING = 'resource_balancing',
    LATENCY_OPTIMIZATION = 'latency_optimization',
    THROUGHPUT_OPTIMIZATION = 'throughput_optimization',
    PARAMETER_PRUNING = 'parameter_pruning',
    MODEL_COMPRESSION = 'model_compression',
    KNOWLEDGE_DISTILLATION = 'knowledge_distillation'
}

/**
 * Métriques de ressources
 */
export interface ResourceMetrics {
    /** Utilisation en pourcentage (0-100) */
    utilization: number;

    /** Ressources disponibles (valeur absolue) */
    available: number;

    /** Total des ressources (valeur absolue) */
    total: number;

    /** Charge moyenne dans le temps */
    averageLoad: number;

    /** Charge maximale */
    peakLoad: number;

    /** Goulets d'étranglement identifiés */
    bottlenecks: Bottleneck[];
}

/**
 * Données sur les ressources
 */
export interface ResourceData {
    /** Métriques par type de ressource */
    resources: Record<ResourceType, ResourceMetrics>;

    /** Horodatage */
    timestamp: number;

    /** Identifiant du système */
    systemId: string;

    /** Charge globale actuelle */
    currentLoad: number;

    /** Taux de requêtes par seconde */
    requestRate: number;

    /** Données contextuelles supplémentaires */
    contextData?: Record<string, unknown>;
}

/**
 * Allocation de ressources
 */
export interface ResourceAllocation {
    /** Allocations par type de ressource (valeurs absolues) */
    allocations: Record<ResourceType, number>;

    /** Distribution en pourcentage par composant */
    distribution: Record<string, number>;

    /** Capacité estimée après allocation */
    estimatedCapacity: number;

    /** Capacité réservée pour les pics */
    reservedCapacity: number;

    /** Horodatage */
    timestamp: number;
}

/**
 * Métriques de goulet d'étranglement
 */
export interface BottleneckMetrics {
    /** Valeur actuelle */
    currentValue: number;

    /** Seuil de déclenchement */
    threshold: number;

    /** Durée du problème (ms) */
    duration: number;

    /** Fréquence (occurrences par minute) */
    frequency: number;
}

/**
 * Évaluation d'impact
 */
export interface ImpactAssessment {
    /** Impact sur les performances (0-100) */
    systemPerformance: number;

    /** Impact sur l'expérience utilisateur (0-100) */
    userExperience: number;

    /** Impact sur la fiabilité (0-100) */
    reliability: number;

    /** Impact financier */
    cost: number;
}

/**
 * Goulet d'étranglement
 */
export interface Bottleneck {
    /** Type de goulet d'étranglement */
    type: BottleneckType;

    /** Sévérité (0-100) */
    severity: number;

    /** Métriques associées */
    metrics: BottleneckMetrics;

    /** Évaluation d'impact */
    impact: ImpactAssessment;

    /** Recommandations */
    recommendations?: string[];
}

/**
 * Action d'optimisation
 */
export interface OptimizationAction {
    /** Type d'action */
    type: OptimizationActionType;

    /** Cible de l'action (ressource ou composant) */
    target: ResourceType | string;

    /** Quantité (valeur absolue ou pourcentage) */
    amount: number;

    /** Priorité de l'action */
    priority: OptimizationPriority;

    /** Impact estimé */
    estimatedImpact: ImpactAssessment;

    /** Contraintes additionnelles */
    constraints?: Record<string, unknown>;
}

/**
 * Métriques d'optimisation
 */
export interface OptimizationMetrics {
    /** Pourcentage d'amélioration */
    improvementPercentage: number;

    /** Efficacité des ressources */
    resourceEfficiency: number;

    /** Réduction estimée de la latence (ms) */
    estimatedLatencyReduction: number;

    /** Économies de coûts estimées */
    estimatedCostSavings: number;

    /** Score de cohérence (0-100) */
    consistencyScore: number;

    /** Score d'équilibre (0-100) */
    balanceScore: number;

    /** Score de durabilité (0-100) */
    sustainability: number;
}

/**
 * Résultat d'optimisation
 */
export interface OptimizationResult {
    /** Actions d'optimisation */
    optimizations: OptimizationAction[];

    /** Métriques d'optimisation */
    metrics: OptimizationMetrics;

    /** Allocation de ressources suggérée */
    suggestedAllocation?: ResourceAllocation;

    /** Avertissements */
    warnings?: string[];

    /** Horodatage */
    timestamp: number;
}

/**
 * Optimisation de latence
 */
export interface LatencyOptimization {
    /** Type d'optimisation */
    type: string;

    /** Impact (0-100) */
    impact: number;

    /** Actions d'optimisation */
    actions: OptimizationAction[];

    /** Amélioration estimée */
    estimatedImprovement: number;
}