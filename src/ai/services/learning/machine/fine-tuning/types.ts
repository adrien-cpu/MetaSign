// src/ai/learning/fine-tuning/types.ts

/**
 * Configuration du système de fine-tuning
 */
export interface FineTuningConfig {
    /** Chemin de stockage local pour les modèles et datasets */
    storagePath: string;
    /** Limite de mémoire pour le traitement (en MB) */
    memoryLimit: number;
    /** Configuration de l'optimisation */
    optimizationSettings: OptimizationSettings;
    /** Quota de stockage maximal (en MB) */
    storageQuota: number;
    /** Types de modèles supportés */
    supportedModelTypes: ModelType[];
    /** Stratégie de validation par défaut */
    defaultValidationStrategy: ValidationStrategy;
    /** Activation du mode debug */
    debugMode: boolean;
}

/**
 * Stratégies d'optimisation pour les modèles fine-tunés
 */
export interface OptimizationSettings {
    /** Niveau de quantization par défaut */
    quantizationLevel: QuantizationLevel;
    /** Format de compression */
    compressionFormat: CompressionFormat;
    /** Stratégie d'élagage */
    pruningStrategy: PruningStrategy;
    /** Algorithmes de distillation supportés */
    supportedDistillationAlgorithms: DistillationAlgorithm[];
    /** Optimisation ONNX activée */
    enableONNXOptimization: boolean;
    /** Optimisations spécifiques au hardware */
    hardwareOptimizations: HardwareOptimization[];
    /** Taille cible du modèle post-optimisation (en MB, 0 = pas de limite) */
    targetModelSize: number;
}

/**
 * Type de modèle pour le fine-tuning
 */
export type ModelType = 'transformer' | 'lstm' | 'gru' | 'rnn' | 'cnn' | 'hybrid';

/**
 * Échantillon d'entraînement pour le fine-tuning
 */
export interface TrainingSample {
    /** Identifiant unique */
    id: string;
    /** Données d'entrée */
    input: unknown;
    /** Sortie attendue */
    expectedOutput: unknown;
    /** Poids de l'échantillon dans l'entraînement */
    weight?: number;
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
    /** Tags de catégorisation */
    tags?: string[];
}

/**
 * Dataset complet pour le fine-tuning
 */
export interface TrainingDataset {
    /** Identifiant unique du dataset */
    id: string;
    /** Description du dataset */
    description: string;
    /** Date de création */
    createdAt: string;
    /** Échantillons d'entraînement */
    samples: TrainingSample[];
    /** Échantillons de validation */
    validationSamples: TrainingSample[];
    /** Score de validation du dataset */
    validationScore: number;
    /** Résumé statistique du dataset */
    summary: DatasetSummary;
    /** Version du schéma de données */
    schemaVersion: string;
}

/**
 * Résumé statistique d'un dataset
 */
export interface DatasetSummary {
    /** Nombre total d'échantillons */
    totalSamples: number;
    /** Distribution des tags */
    tagDistribution: Record<string, number>;
    /** Métriques de qualité */
    qualityMetrics: Record<string, number>;
    /** Score de diversité */
    diversityScore: number;
    /** Biais détectés */
    detectedBiases: DetectedBias[];
}

/**
 * Biais détecté dans un dataset
 */
export interface DetectedBias {
    /** Type de biais */
    biasType: string;
    /** Sévérité (0-1) */
    severity: number;
    /** Tags affectés */
    affectedTags: string[];
    /** Description du biais */
    description: string;
}

/**
 * Options pour l'exécution d'un fine-tuning
 */
export interface FineTuningOptions {
    /** Type de modèle */
    modelType: ModelType;
    /** Nombre d'itérations (epochs) */
    iterations: number;
    /** Taux d'apprentissage */
    learningRate: number;
    /** Taille du batch */
    batchSize: number;
    /** Activer l'élagage du modèle */
    applyPruning: boolean;
    /** Seuil d'élagage (0-1) */
    pruningThreshold?: number;
    /** Activer la quantization */
    applyQuantization: boolean;
    /** Activer la validation collaborative */
    enableCollaborativeValidation: boolean;
    /** Taux de dropout (0-1) */
    dropoutRate: number;
    /** Seed aléatoire pour reproductibilité */
    randomSeed?: number;
    /** Seuil d'arrêt anticipé (early stopping) */
    earlyStoppingThreshold?: number;
    /** Patience pour arrêt anticipé */
    earlyStoppingPatience?: number;
    /** Stratégie de sélection de modèle */
    modelSelectionStrategy: ModelSelectionStrategy;
    /** Optimisations spécifiques */
    optimizationFlags: OptimizationFlag[];
}

/**
 * Résultat d'un fine-tuning
 */
export interface FineTuningResult {
    /** Identifiant du modèle créé */
    modelId: string;
    /** Identifiant du modèle optimisé (si applicable) */
    optimizedModelId?: string;
    /** Date de création */
    createdAt: string;
    /** Métriques d'entraînement */
    metrics: {
        /** Pertes finales */
        finalLoss: number;
        /** Historique des pertes */
        lossHistory: number[];
        /** Précision sur validation */
        validationAccuracy: number;
        /** Durée d'entraînement (ms) */
        trainingDuration: number;
    };
    /** Métriques du modèle optimisé */
    optimizedMetrics?: ValidationMetrics;
    /** Changements apportés au modèle */
    changes: ModelChange[];
    /** Statut de validation */
    validationStatus?: string;
    /** Feedback de validation */
    validationFeedback?: string[];
}

/**
 * Métriques de validation
 */
export interface ValidationMetrics {
    /** Précision (0-1) */
    accuracy: number;
    /** Rappel (0-1) */
    recall: number;
    /** Précision (precision) (0-1) */
    precision: number;
    /** Score F1 (0-1) */
    f1Score: number;
    /** Perte (loss) */
    loss: number;
    /** Efficacité mémoire */
    memoryEfficiency: number;
    /** Latence d'inférence (ms) */
    inferenceLatency: number;
    /** Taille du modèle (MB) */
    modelSize: number;
}

/**
 * Changement appliqué au modèle pendant le fine-tuning
 */
export interface ModelChange {
    /** Type de changement */
    changeType: 'weight_update' | 'architecture_change' | 'pruning' | 'quantization';
    /** Description du changement */
    description: string;
    /** Impact sur les performances */
    performanceImpact: number;
    /** Couches affectées */
    affectedLayers?: string[];
}

/**
 * Progrès du fine-tuning pour callbacks
 */
export interface FineTuningProgress {
    /** Pourcentage de complétion (0-100) */
    percentage: number;
    /** Numéro d'itération courante */
    currentIteration: number;
    /** Nombre total d'itérations */
    totalIterations: number;
    /** Perte courante */
    currentLoss: number;
    /** Timestamp */
    timestamp: number;
    /** Estimation du temps restant (ms) */
    estimatedTimeRemaining?: number;
}

/**
 * Énumérations pour les options de fine-tuning
 */
export type QuantizationLevel = 'none' | 'int8' | 'int4' | 'float16' | 'dynamic';
export type CompressionFormat = 'none' | 'gzip' | 'zstd' | 'lz4';
export type PruningStrategy = 'magnitude' | 'structured' | 'l1_norm' | 'threshold';
export type DistillationAlgorithm = 'vanilla' | 'progressive' | 'attention';
export type HardwareOptimization = 'cpu' | 'cuda' | 'tensorrt' | 'openvino' | 'coreml';
export type ValidationStrategy = 'k_fold' | 'hold_out' | 'leave_one_out' | 'time_series';
export type ModelSelectionStrategy = 'best_validation' | 'lowest_loss' | 'best_f1' | 'balanced';
export type OptimizationFlag = 'mixed_precision' | 'gradient_checkpointing' | 'kernel_fusion' | 'memory_efficient_attention';