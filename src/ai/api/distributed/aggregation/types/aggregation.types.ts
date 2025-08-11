/**
 * src/ai/api/distributed/aggregation/types/aggregation.types.ts
 * Types pour le système d'agrégation de modèles
 */

import { NodeTrainingResult, AggregatedModel, ConsensusResult } from '../../types/DistributedTypes';

/**
 * Interface pour le collecteur de métriques étendu avec la méthode recordMetric
 */
export interface IExtendedMetricsCollector {
    /**
     * Enregistre une métrique avec des tags optionnels
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param tags Tags optionnels pour la métrique
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}

/**
 * Stratégies d'agrégation de modèles
 */
export type AggregationStrategy =
    | 'simple_average'     // Moyenne simple de tous les modèles
    | 'weighted_average'   // Moyenne pondérée selon différents critères
    | 'confidence_weighted'// Pondération basée sur les niveaux de confiance
    | 'federated_average'  // Agrégation fédérée pour l'apprentissage fédéré
    | 'performance_based'  // Pondération basée sur les métriques de performance
    | 'trust_based'        // Pondération basée sur la fiabilité des nœuds
    | 'latency_optimized'  // Optimisée pour minimiser la latence
    | 'consensus_driven';  // Pilotée par le consensus des participants

/**
 * État d'agrégation de modèle
 */
export enum AggregationState {
    INITIALIZING = 'initializing',
    COLLECTING = 'collecting',
    PROCESSING = 'processing',
    VALIDATING = 'validating',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

/**
 * Résultat du processus d'agrégation
 */
export interface AggregationResult<T = AggregatedModel> {
    /**
     * État final de l'agrégation
     */
    state: AggregationState;

    /**
     * Données agrégées (si successful)
     */
    data?: T;

    /**
     * Nombre de modèles agrégés
     */
    modelsCount: number;

    /**
     * Stratégie utilisée pour l'agrégation
     */
    strategy: AggregationStrategy;

    /**
     * Niveau de confiance dans le résultat
     */
    confidence: number;

    /**
     * Temps d'exécution en millisecondes
     */
    executionTimeMs: number;

    /**
     * Erreur rencontrée si l'agrégation a échoué
     */
    error?: string;

    /**
     * Métriques de performance supplémentaires
     */
    metrics?: Record<string, number>;
}

/**
 * Options pour le processus d'agrégation
 */
export interface AggregationOptions {
    /**
     * Stratégie d'agrégation à utiliser
     */
    strategy: AggregationStrategy;

    /**
     * Nombre minimal de modèles requis
     */
    minModelsRequired?: number;

    /**
     * Niveau de confiance minimal requis
     */
    minConfidenceRequired?: number;

    /**
     * Timeout pour le processus d'agrégation (ms)
     */
    timeoutMs?: number;

    /**
     * Poids prédéfinis pour les modèles (par ID de nœud)
     */
    predefinedWeights?: Record<string, number>;

    /**
     * Tags pour le suivi des métriques
     */
    metricsTags?: Record<string, string>;

    /**
     * Activer la journalisation détaillée
     */
    detailedLogging?: boolean;
}

/**
 * Métadonnées pour le résultat d'agrégation
 */
export interface AggregationMetadata {
    /**
     * Horodatage du début de l'agrégation
     */
    startTimestamp: number;

    /**
     * Horodatage de fin de l'agrégation
     */
    endTimestamp: number;

    /**
     * IDs des nœuds contribuant à l'agrégation
     */
    contributingNodeIds: string[];

    /**
     * Poids attribués à chaque nœud
     */
    nodeWeights: Record<string, number>;

    /**
     * Scores de performance par nœud
     */
    nodePerformanceScores?: Record<string, number>;

    /**
     * Méthode d'agrégation utilisée
     */
    aggregationMethod: string;

    /**
     * Version du processus d'agrégation
     */
    version: string;
}

/**
 * Métriques de distribution pour les données d'entraînement
 */
export interface DistributionMetrics {
    /** Coefficient de Gini (mesure d'inégalité) */
    giniCoefficient: number;
    /** Coefficient de variation (écart-type relatif) */
    coefficientOfVariation: number;
    /** Nombre minimal d'échantillons par nœud */
    minSamples: number;
    /** Nombre maximal d'échantillons par nœud */
    maxSamples: number;
    /** Nombre moyen d'échantillons par nœud */
    avgSamples: number;
}

/**
 * Configuration de l'agrégateur de modèles optimisé
 */
export interface AggregatorConfig {
    /** Temps d'expiration du cache en millisecondes */
    cacheExpiryMs?: number;
    /** Nombre maximal d'entrées dans le cache avant éviction */
    maxCacheEntries?: number;
    /** Activer les logs détaillés */
    enableDetailedLogs?: boolean;
    /** Stratégie d'agrégation par défaut */
    defaultStrategy?: AggregationStrategy;
}

// Re-export les types nécessaires pour faciliter l'importation
export { NodeTrainingResult, AggregatedModel, ConsensusResult };