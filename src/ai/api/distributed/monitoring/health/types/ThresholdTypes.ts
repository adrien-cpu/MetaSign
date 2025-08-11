// src/ai/api/distributed/monitoring/health/types/ThresholdTypes.ts

/**
 * Types d'opérations de seuil
 */
export enum ThresholdOperator {
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    EQUAL = '==',
    NOT_EQUAL = '!=',
    BETWEEN = 'between',
    NOT_BETWEEN = 'not_between',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains'
}

/**
 * Types de seuils
 */
export enum ThresholdType {
    MEMORY = 'memory',
    CPU = 'cpu',
    DISK = 'disk',
    NETWORK_LATENCY = 'network_latency',
    API_RESPONSE_TIME = 'api_response_time',
    ERROR_RATE = 'error_rate',
    THROUGHPUT = 'throughput',
    // Nouveaux types de seuils pour LSF
    LSF_RESOURCES = 'lsf_resources',
    LSF_PROCESSING_TIME = 'lsf_processing_time',
    LSF_GESTURE_ACCURACY = 'lsf_gesture_accuracy',
    LSF_AV_SYNC = 'lsf_av_sync',
    LSF_TRANSLATION_QUALITY = 'lsf_translation_quality',
    CUSTOM = 'custom'
}

/**
 * Niveau de sévérité pour les seuils
 */
export enum ThresholdSeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical',
    FATAL = 'fatal'
}

/**
 * Configuration d'un seuil
 */
export interface ThresholdConfig {
    type: ThresholdType;
    name: string;
    operator: ThresholdOperator;
    value: number | number[] | string | string[];
    severity: ThresholdSeverity;
    enabled: boolean;
    description?: string;
    unit?: string;
    component?: string;
    customCheck?: (value: unknown) => boolean;
}

/**
 * Résultat de l'évaluation d'un seuil
 */
export interface ThresholdEvaluation {
    thresholdConfig: ThresholdConfig;
    actualValue: number | string | unknown;
    exceeded: boolean;
    severity: ThresholdSeverity;
    timestamp: number;
    message: string;
}

/**
 * Configuration des seuils pour la mémoire
 */
export interface MemoryThresholdConfig {
    warningThresholdPercent: number;
    criticalThresholdPercent: number;
    warningThresholdBytes?: number;
    criticalThresholdBytes?: number;
    heapWarningThresholdPercent?: number;
    heapCriticalThresholdPercent?: number;
    // Nouveaux seuils pour les ressources LSF
    lsfResourcesWarningThresholdPercent?: number;
    lsfResourcesCriticalThresholdPercent?: number;
    lsfResourcesWarningThresholdBytes?: number;
    lsfResourcesCriticalThresholdBytes?: number;
    checkInterval?: number;
    enabled: boolean;
}

/**
 * Configuration des seuils pour le CPU
 */
export interface CPUThresholdConfig {
    warningThresholdPercent: number;
    criticalThresholdPercent: number;
    averageOverTimeSeconds?: number;
    checkInterval?: number;
    enabled: boolean;
}

/**
 * Configuration des seuils pour les API
 */
export interface APIThresholdConfig {
    responseTimeWarningMs: number;
    responseTimeCriticalMs: number;
    errorRateWarningPercent?: number;
    errorRateCriticalPercent?: number;
    timeoutMs?: number;
    checkInterval?: number;
    enabled: boolean;
    endpoints?: string[];
}

/**
 * Configuration des seuils pour les ressources LSF
 */
export interface LSFResourceThresholdConfig {
    // Seuils de temps de traitement gestuel
    gestureProcessingWarningMs: number;
    gestureProcessingCriticalMs: number;

    // Seuils d'utilisation mémoire pour les ressources LSF
    memoryWarningThresholdPercent: number;
    memoryCriticalThresholdPercent: number;

    // Seuils pour les erreurs de traduction
    translationErrorWarningRate?: number;
    translationErrorCriticalRate?: number;

    // Seuils pour la synchronisation audio-visuelle
    avSyncWarningMs?: number;
    avSyncCriticalMs?: number;

    // Seuils pour la précision des gestes
    gestureAccuracyWarningPercent?: number;
    gestureAccuracyCriticalPercent?: number;

    // Seuils pour la fluidité des mouvements
    movementFluidityWarningScore?: number;
    movementFluidityCriticalScore?: number;

    // Temps maximum d'alignement multimodal
    multimodalAlignmentWarningMs?: number;
    multimodalAlignmentCriticalMs?: number;

    // Configuration générale
    checkInterval?: number;
    enabled: boolean;
    components?: string[]; // Composants LSF spécifiques à surveiller
}

/**
 * Configuration des seuils pour la qualité d'expression LSF
 */
export interface LSFExpressionQualityConfig {
    // Scores de qualité d'expression
    expressionQualityWarningScore: number;
    expressionQualityCriticalScore: number;

    // Seuils pour la cohérence culturelle
    culturalConsistencyWarningScore?: number;
    culturalConsistencyCriticalScore?: number;

    // Seuils pour la cohérence grammaticale
    grammaticalConsistencyWarningScore?: number;
    grammaticalConsistencyCriticalScore?: number;

    // Seuils pour la cohérence spatiale
    spatialCoherenceWarningScore?: number;
    spatialCoherenceCriticalScore?: number;

    // Configuration générale
    checkInterval?: number;
    enabled: boolean;
    evaluationMetrics?: string[]; // Métriques à évaluer
}

/**
 * Interface pour les évaluateurs de seuils
 */
export interface IThresholdEvaluator {
    /**
     * Évalue si une valeur dépasse un seuil
     */
    evaluate(value: unknown, threshold: ThresholdConfig): ThresholdEvaluation;

    /**
     * Évalue tous les seuils pour une catégorie donnée
     */
    evaluateCategory(categoryValues: Record<string, unknown>, thresholds: ThresholdConfig[]): ThresholdEvaluation[];

    /**
     * Formate un message pour un seuil dépassé
     */
    formatMessage(threshold: ThresholdConfig, actualValue: unknown, exceeded: boolean): string;
}

/**
 * Gestionnaire de seuils
 */
export interface IThresholdManager {
    /**
     * Ajoute un seuil
     */
    addThreshold(threshold: ThresholdConfig): void;

    /**
     * Supprime un seuil
     */
    removeThreshold(type: ThresholdType, name: string): boolean;

    /**
     * Active ou désactive un seuil
     */
    enableThreshold(type: ThresholdType, name: string, enabled: boolean): boolean;

    /**
     * Récupère tous les seuils
     */
    getAllThresholds(): ThresholdConfig[];

    /**
     * Récupère les seuils d'un type spécifique
     */
    getThresholdsByType(type: ThresholdType): ThresholdConfig[];

    /**
     * Récupère un seuil spécifique
     */
    getThreshold(type: ThresholdType, name: string): ThresholdConfig | null;

    /**
     * Évalue un seuil
     */
    evaluateValue(value: unknown, type: ThresholdType, name: string): ThresholdEvaluation | null;

    /**
     * Évalue tous les seuils d'un type spécifique
     */
    evaluateCategory(categoryValues: Record<string, unknown>, type: ThresholdType): ThresholdEvaluation[];

    /**
     * Évalue spécifiquement les seuils LSF
     */
    evaluateLSFResources(metrics: Record<string, unknown>): ThresholdEvaluation[];
}

/**
 * Types de métriques spécifiques aux flux LSF
 */
export enum LSFMetricType {
    GESTURE_PROCESSING_TIME = 'gesture_processing_time',
    MEMORY_USAGE = 'memory_usage',
    GESTURE_ACCURACY = 'gesture_accuracy',
    TRANSLATION_ERROR_RATE = 'translation_error_rate',
    AV_SYNCHRONIZATION = 'av_synchronization',
    CULTURAL_CONSISTENCY = 'cultural_consistency',
    GRAMMATICAL_CONSISTENCY = 'grammatical_consistency',
    SPATIAL_COHERENCE = 'spatial_coherence',
    MOVEMENT_FLUIDITY = 'movement_fluidity',
    FACIAL_EXPRESSION_QUALITY = 'facial_expression_quality',
    MULTIMODAL_ALIGNMENT = 'multimodal_alignment',
    USER_COMPREHENSION = 'user_comprehension'
}

/**
 * Résultat de surveillance des ressources LSF
 */
export interface LSFHealthCheckResult {
    metricsTimestamp: number;
    overallStatus: ThresholdSeverity;
    metrics: Record<LSFMetricType, {
        value: number;
        status: ThresholdSeverity;
        thresholdExceeded: boolean;
        message?: string;
    }>;
    recommendations: string[];
}