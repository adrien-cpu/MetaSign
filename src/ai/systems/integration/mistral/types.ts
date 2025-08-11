// src/ai/systems/integration/mistral/types.ts

/**
 * Options pour l'intégration avec Mistral
 */
export interface MistralProcessingOptions {
    /**
     * Active l'élagage (pruning) des paramètres non essentiels
     */
    enablePruning?: boolean;

    /**
     * Facteur d'élagage (0-1) où 1 est le plus agressif
     */
    pruningFactor?: number;

    /**
     * Active la quantification des valeurs
     */
    enableQuantization?: boolean;

    /**
     * Niveau de quantification ('low', 'medium', 'high')
     */
    quantizationLevel?: 'low' | 'medium' | 'high';

    /**
     * Active l'attention sparse pour se concentrer sur les composants importants
     */
    enableSparseAttention?: boolean;

    /**
     * Facteur d'attention sparse (0-1) où 1 est le plus concentré
     */
    sparseAttentionFactor?: number;

    /**
     * Active le cache des résultats
     */
    enableCache?: boolean;

    /**
     * Durée de vie du cache en millisecondes
     */
    cacheTTL?: number;
}

/**
 * Configuration pour les opérations Mistral avec contraintes de ressources
 */
export interface MistralResourceConfig {
    /**
     * Maximum de mémoire allouée (en Mo)
     */
    maxMemory?: number;

    /**
     * Budget CPU (0-1) où 1 est l'utilisation maximale
     */
    cpuBudget?: number;

    /**
     * Priorité des requêtes (1-10) où 10 est la plus haute
     */
    priority?: number;

    /**
     * Délai maximum de traitement (en ms)
     */
    timeout?: number;
}

/**
 * Extension du contexte de transition pour Mistral
 */
export interface MistralTransitionContext {
    /**
     * Niveau de quantification pour cette transition
     */
    quantizationLevel?: 'low' | 'medium' | 'high';

    /**
     * Configuration des ressources pour cette transition
     */
    resources?: MistralResourceConfig;

    /**
     * Seuil de qualité minimal (0-1)
     */
    qualityThreshold?: number;
}

/**
 * Types d'optimisation Mistral
 */
export enum MistralOptimizationType {
    PRUNING = 'pruning',
    QUANTIZATION = 'quantization',
    SPARSE_ATTENTION = 'sparse_attention',
    KNOWLEDGE_DISTILLATION = 'knowledge_distillation',
    PARAMETER_SHARING = 'parameter_sharing'
}

/**
 * Métriques de performance pour Mistral
 */
export interface MistralPerformanceMetrics {
    /**
     * Durée de traitement en ms
     */
    processingTime: number;

    /**
     * Taux de compression (ratio original/optimisé)
     */
    compressionRatio?: number;

    /**
     * Empreinte mémoire en Mo
     */
    memoryFootprint?: number;

    /**
     * Qualité estimée (0-1) par rapport à l'original
     */
    qualityScore?: number;

    /**
     * Taux de cache (hits/total)
     */
    cacheHitRate?: number;
}

/**
 * Résultat d'optimisation Mistral
 */
export interface MistralOptimizationResult<T> {
    /**
     * Données optimisées
     */
    data: T;

    /**
     * Métriques de performance
     */
    metrics: MistralPerformanceMetrics;

    /**
     * Optimisations appliquées
     */
    appliedOptimizations: MistralOptimizationType[];

    /**
     * Paramètres utilisés
     */
    parameters: Record<string, unknown>;
}