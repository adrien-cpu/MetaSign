//src/ai/types/model-integration.ts

/**
 * Types et interfaces pour le système d'intégration de modèles
 */

/**
 * Configuration du modèle
 */
export interface ModelConfig {
    /** Version du modèle à utiliser */
    modelVersion: string;

    /** Niveau de quantification appliqué */
    quantizationLevel: 'none' | 'float16' | 'int8' | 'int4';

    /** Niveau d'élagage (pruning) appliqué */
    pruningLevel: 'none' | 'low' | 'medium' | 'high';

    /** Utilisation de l'attention sparse */
    useSparseAttention: boolean;

    /** Longueur maximale de séquence */
    maxSequenceLength: number;

    /** Température par défaut pour la génération */
    temperatureDefault: number;

    /** Top-p (nucleus sampling) pour la génération */
    topP: number;

    /** Stratégie de répartition de charge */
    loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'weighted';

    /** Activation du cache */
    cacheEnabled: boolean;

    /** Taille du cache (en octets) */
    cacheSize: number;

    /** Filtrage éthique activé */
    ethicalFiltering: boolean;

    /** Traitement par lots activé */
    batchProcessing: boolean;
}

/**
 * Demande d'optimisation du modèle
 */
export interface ModelOptimizationRequest {
    /** Configuration d'élagage (pruning) */
    pruning?: PruningConfig;

    /** Configuration de quantification */
    quantization?: QuantizationConfig;

    /** Configuration d'attention sparse */
    sparseAttention?: SparseAttentionConfig;

    /** Commentaire décrivant l'optimisation */
    comment?: string;

    /** ID de l'utilisateur demandant l'optimisation */
    requestedBy?: string;
}

/**
 * Configuration d'élagage (pruning)
 */
export interface PruningConfig {
    /** Méthode d'élagage à utiliser */
    method: 'magnitude' | 'structured' | 'dynamic' | 'movement';

    /** Niveau de sparsité cible (0-1, où 1 = 100% d'élagage) */
    targetSparsity: number;

    /** Élagage progressif (par étapes) */
    gradual?: boolean;

    /** Nombre d'époques d'entraînement post-élagage */
    retrainEpochs?: number;

    /** Paramètres spécifiques à la méthode d'élagage */
    methodParams?: Record<string, unknown>;
}

/**
 * Configuration de quantification
 */
export interface QuantizationConfig {
    /** Précision cible */
    precision: 'float16' | 'int8' | 'int4';

    /** Quantification tenant compte de l'entraînement */
    quantizationAware: boolean;

    /** Calibration sur un ensemble de données spécifique */
    calibrationDataset?: string;

    /** Paramètres spécifiques à la quantification */
    params?: Record<string, unknown>;
}

/**
 * Configuration d'attention sparse
 */
export interface SparseAttentionConfig {
    /** Motif d'attention sparse */
    pattern: 'block' | 'strided' | 'fixed' | 'learned';

    /** Niveau de sparsité (0-1, où 1 = 100% de sparsité) */
    sparsityLevel: number;

    /** Taille de bloc (pour pattern 'block') */
    blockSize?: number;

    /** Pas (stride) à utiliser (pour pattern 'strided') */
    stride?: number;

    /** Paramètres supplémentaires pour le motif */
    patternParams?: Record<string, unknown>;
}

/**
 * Résultat d'optimisation du modèle
 */
export interface ModelOptimizationResult {
    /** Succès de l'optimisation */
    success: boolean;

    /** Message d'erreur en cas d'échec */
    error?: string;

    /** Étapes d'optimisation effectuées */
    optimizationSteps: Array<{
        /** Nom de l'étape */
        step: string;

        /** Résultat de l'étape */
        result: string;

        /** Métriques associées à l'étape */
        metrics?: Record<string, number>;
    }>;

    /** Métriques de performance après optimisation */
    performanceMetrics: ModelPerformanceMetrics;

    /** Gains d'optimisation (pourcentages) */
    optimizationGains: {
        /** Réduction de latence */
        latencyReduction: number;

        /** Augmentation du débit */
        throughputIncrease: number;

        /** Réduction de mémoire */
        memoryReduction: number;
    } | null;

    /** Temps total d'optimisation (en ms) */
    optimizationTime: number;

    /** Configuration mise à jour */
    updatedConfig: ModelConfig;
}

/**
 * Métriques de performance du modèle
 */
export interface ModelPerformanceMetrics {
    /** Latence moyenne (ms) */
    averageLatency: number;

    /** Débit (requêtes par seconde) */
    throughput: number;

    /** Utilisation mémoire (octets) */
    memoryUsage: number;

    /** Utilisation GPU (pourcentage) */
    gpuUtilization: number;

    /** Taux d'erreur */
    errorRate: number;

    /** Vitesse de traitement des tokens (tokens par seconde) */
    tokenProcessingSpeed: number;

    /** Gain de la dernière optimisation */
    lastOptimizationGain: number;

    /** Taux de hit du cache */
    cacheHitRate: number;

    /** Dernière mise à jour des métriques */
    lastUpdated: number;
}

/**
 * Types d'opérations d'optimisation
 */
export enum OptimizationOperationType {
    PRUNING = 'pruning',
    QUANTIZATION = 'quantization',
    SPARSE_ATTENTION = 'sparse_attention',
    CACHING = 'caching',
    BATCHING = 'batching'
}

/**
 * Types de modèles supportés
 */
export enum SupportedModelType {
    MISTRAL_SMALL = 'mistral-small',
    MISTRAL_MEDIUM = 'mistral-medium',
    MISTRAL_LARGE = 'mistral-large',
    LLAMA_3_8B = 'llama-3-8b',
    LLAMA_3_70B = 'llama-3-70b',
    MIXTRAL_8X7B = 'mixtral-8x7b'
}

/**
 * Paramètres de traduction texte vers LSF
 */
export interface TextToLSFTranslationParams {
    /** Texte à traduire */
    text: string;

    /** Variante dialectale à utiliser */
    variant?: string;

    /** Intensité émotionnelle (0-1) */
    emotionalIntensity?: number;

    /** Niveau de formalité (0-1) */
    formalityLevel?: number;

    /** Facteur de vitesse (1 = normal) */
    speedFactor?: number;

    /** Contexte culturel */
    culturalContext?: Record<string, unknown>;

    /** Préférences personnalisées */
    preferences?: Record<string, unknown>;
}

/**
 * Résultat de traduction texte vers LSF
 */
export interface TextToLSFTranslationResult {
    /** Séquence LSF générée */
    lsfSequence: unknown[];

    /** Métadonnées de la traduction */
    metadata: {
        /** Temps de traitement (ms) */
        processingTime: number;

        /** Version du modèle utilisée */
        modelVersion: string;

        /** Nombre de tokens */
        tokenCount: number;

        /** Horodatage de la traduction */
        timestamp: number;

        /** Autres métadonnées */
        [key: string]: unknown;
    };
}