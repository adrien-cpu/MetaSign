/**
 * @file: src/ai/types/orchestration.types.ts
 * 
 * Types pour les requêtes et résultats d'orchestration du système LSF.
 */

import { ModalityType } from './modality';

/**
 * Priorité des requêtes d'orchestration
 */
export enum OrchestrationPriority {
    /** Priorité faible, peut être traité en arrière-plan */
    LOW = 'low',
    /** Priorité normale (défaut) */
    NORMAL = 'normal',
    /** Priorité haute, traiter rapidement */
    HIGH = 'high',
    /** Urgence, traiter immédiatement, peut interrompre d'autres tâches */
    URGENT = 'urgent'
}

/**
 * Alias pour compatibilité avec du code existant
 * @deprecated Utiliser OrchestrationPriority à la place
 */
export enum TaskPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

/**
 * État d'une requête d'orchestration
 */
export enum OrchestrationRequestState {
    /** Requête créée mais pas encore traitée */
    PENDING = 'pending',
    /** En cours de traitement */
    PROCESSING = 'processing',
    /** Traitement terminé avec succès */
    COMPLETED = 'completed',
    /** Traitement terminé avec erreur */
    FAILED = 'failed',
    /** Requête annulée */
    CANCELLED = 'cancelled',
    /** Requête mise en attente */
    DEFERRED = 'deferred'
}

/**
 * Type d'opération d'orchestration
 */
export enum OrchestrationOperationType {
    /** Analyse d'entrée multimodale */
    MULTIMODAL_ANALYSIS = 'multimodal_analysis',
    /** Génération de LSF */
    LSF_GENERATION = 'lsf_generation',
    /** Traduction de LSF vers texte */
    LSF_TO_TEXT = 'lsf_to_text',
    /** Analyse émotionnelle */
    EMOTION_ANALYSIS = 'emotion_analysis',
    /** Validation linguistique */
    LINGUISTIC_VALIDATION = 'linguistic_validation',
    /** Exécution complète de pipeline */
    FULL_PIPELINE = 'full_pipeline',
    /** Opération personnalisée */
    CUSTOM = 'custom'
}

/**
 * Options de cache pour l'orchestration
 */
export interface OrchestrationCacheOptions {
    /** Activer le cache pour cette requête */
    enabled: boolean;
    /** Durée de validité du cache en millisecondes */
    ttl?: number;
    /** Clé de cache personnalisée */
    customKey?: string;
    /** Stratégie de rafraîchissement du cache */
    refreshStrategy?: 'lazy' | 'eager' | 'never';
}

/**
 * Stratégies de mise en cache
 */
export enum CacheStrategy {
    /** Aucune mise en cache */
    NoCache = 'no_cache',
    /** Mise en cache basée sur LRU (Least Recently Used) */
    LRU = 'lru',
    /** Mise en cache basée sur LFU (Least Frequently Used) */
    LFU = 'lfu',
    /** Stratégie de mise en cache adaptative */
    Adaptive = 'adaptive'
}

/**
 * Métadonnées associées à une requête d'orchestration
 */
export interface OrchestrationMetadata {
    /** ID de l'utilisateur */
    userId?: string;
    /** ID de session */
    sessionId?: string;
    /** Contexte d'application */
    applicationContext?: string;
    /** Type d'utilisateur */
    userType?: 'standard' | 'premium' | 'admin';
    /** Modalité principale de la requête */
    modality?: string;
    /** Indique si la requête doit être traitée en temps réel */
    realtime?: boolean;
    /** Tags pour classification et filtrage */
    tags?: string[];
    /** Données personnalisées */
    customData?: Record<string, unknown>;
    /** Informations de suivi */
    traceInfo?: {
        /** ID de trace */
        traceId: string;
        /** ID de span parent */
        parentSpanId?: string;
        /** Tags de suivi */
        tags?: Record<string, string>;
    };
    /** Indique si le contenu est dynamique (ne doit pas être mis en cache) */
    dynamicContent?: boolean;
}

/**
 * Contraintes pour l'orchestration
 */
export interface OrchestrationConstraints {
    /** Délai d'expiration en millisecondes */
    timeout?: number;
    /** Utilisation maximale de ressources */
    maxResourceUsage?: {
        /** Utilisation maximale CPU (0-1) */
        cpu?: number;
        /** Utilisation maximale mémoire (Mo) */
        memory?: number;
    };
    /** Modalités à utiliser */
    modalityConstraints?: Partial<Record<ModalityType, boolean>>;
    /** Dialecte LSF préféré */
    preferredDialect?: string;
    /** Niveau maximal de complexité (1-5) */
    maxComplexityLevel?: number;
}

/**
 * Contexte de requête
 */
export interface RequestContext {
    userId?: string;
    sessionId?: string;
    timestamp: number;
    locale?: string;
    dialect?: string;
    deviceInfo?: {
        type: string;
        os?: string;
        browser?: string;
    };
}

/**
 * Paramètres spécifiques aux opérations d'orchestration
 */
export interface OrchestrationOperationParams {
    /** Paramètres pour l'analyse multimodale */
    multimodalAnalysis?: {
        /** Types de modalités à analyser */
        modalityTypes?: ModalityType[];
        /** Profondeur d'analyse (1-5) */
        analysisDepth?: number;
        /** Caractéristiques à extraire */
        featuresToExtract?: string[];
    };
    /** Paramètres pour la génération LSF */
    lsfGeneration?: {
        /** Style d'expression */
        expressionStyle?: string;
        /** Intensité émotionnelle (0-1) */
        emotionalIntensity?: number;
        /** Vitesse de signation (0.5-2) */
        signingSpeed?: number;
        /** Dialecte à utiliser */
        dialect?: string;
    };
    /** Paramètres pour l'analyse émotionnelle */
    emotionAnalysis?: {
        /** Seuil de détection (0-1) */
        detectionThreshold?: number;
        /** Catégories d'émotions à analyser */
        emotionCategories?: string[];
        /** Inclure les micro-expressions */
        includeMicroExpressions?: boolean;
    };
    /** Paramètres personnalisés */
    custom?: Record<string, unknown>;
}

/**
 * Format simplifié de requête pour compatibilité
 */
export interface OrchestrationRequestCompat {
    id: string;
    type: string;
    payload: unknown;
    metadata?: Record<string, unknown>;
    priority?: 'high' | 'medium' | 'low';
}

/**
 * Requête d'orchestration complète
 */
export interface OrchestrationRequest {
    /** ID unique de la requête */
    requestId: string;
    /** Type d'opération demandée */
    operationType: OrchestrationOperationType;
    /** Priorité de la requête */
    priority?: OrchestrationPriority;
    /** Données d'entrée pour l'opération */
    input: unknown;
    /** Paramètres spécifiques à l'opération */
    operationParams?: OrchestrationOperationParams;
    /** Contraintes d'exécution */
    constraints?: OrchestrationConstraints;
    /** Options de cache */
    cacheOptions?: OrchestrationCacheOptions;
    /** Métadonnées */
    metadata?: OrchestrationMetadata;
    /** Horodatage de création */
    createdAt: number;
    /** État actuel de la requête */
    state: OrchestrationRequestState;
    /** Fonction de rappel WebSocket (si applicable) */
    callbackChannel?: string;
}

/**
 * Résultat de traitement générique
 */
export interface ProcessingResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: Record<string, unknown>;
    processingTime?: number;
}

/**
 * Niveau de performance du résultat
 */
export enum PerformanceLevel {
    /** Performance excellente */
    EXCELLENT = 'excellent',
    /** Bonne performance */
    GOOD = 'good',
    /** Performance acceptable */
    ACCEPTABLE = 'acceptable',
    /** Performance médiocre */
    POOR = 'poor',
    /** Performance critique */
    CRITICAL = 'critical'
}

/**
 * Métriques de performance pour le résultat
 */
export interface PerformanceMetrics {
    /** Temps total de traitement (ms) */
    totalProcessingTime: number;
    /** Temps de latence (ms) */
    latency: number;
    /** Utilisation CPU (0-1) */
    cpuUsage: number;
    /** Utilisation mémoire (Mo) */
    memoryUsage: number;
    /** Taux d'utilisation du cache (0-1) */
    cacheHitRate?: number;
    /** Niveau de performance global */
    performanceLevel: PerformanceLevel;
    /** Métriques personnalisées */
    customMetrics?: Record<string, number>;
}

/**
 * État de validation du résultat
 */
export interface ValidationState {
    /** Validation réussie */
    isValid: boolean;
    /** Score de qualité (0-1) */
    qualityScore: number;
    /** Problèmes détectés */
    issues?: Array<{
        /** Type de problème */
        type: string;
        /** Sévérité (1-5) */
        severity: number;
        /** Description du problème */
        description: string;
        /** Suggestions de correction */
        suggestions?: string[];
    }>;
    /** Validations effectuées */
    validationsPerformed: string[];
}

/**
 * Format simplifié du résultat pour compatibilité
 */
export interface OrchestrationResultCompat<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metrics?: {
        executionTime: number;
        cacheUsed: boolean;
        componentsUsed: string[];
        path: string[];
    };
}

/**
 * Résultat d'orchestration complet
 */
export interface OrchestrationResult {
    /** ID unique du résultat (généralement le même que requestId) */
    resultId: string;
    /** ID de la requête associée */
    requestId: string;
    /** Type d'opération effectuée */
    operationType: OrchestrationOperationType;
    /** Statut de l'opération */
    status: 'success' | 'partial_success' | 'failure';
    /** Données de résultat */
    data: unknown;
    /** Erreurs rencontrées */
    errors?: Array<{
        /** Code d'erreur */
        code: string;
        /** Message d'erreur */
        message: string;
        /** Détails supplémentaires */
        details?: unknown;
    }>;
    /** État de validation */
    validation?: ValidationState;
    /** Métriques de performance */
    performanceMetrics?: PerformanceMetrics;
    /** Origine du cache (si applicable) */
    fromCache?: boolean;
    /** Horodatage de création du résultat */
    createdAt: number;
    /** Étapes d'exécution (pour débogage) */
    executionSteps?: Array<{
        /** Nom de l'étape */
        name: string;
        /** Durée de l'étape (ms) */
        duration: number;
        /** Statut de l'étape */
        status: 'success' | 'failure';
        /** Détails de l'étape */
        details?: unknown;
    }>;
    /** Métadonnées */
    metadata?: Record<string, unknown>;
}

/**
 * Options pour la création d'une nouvelle requête d'orchestration
 */
export interface CreateOrchestrationRequestOptions {
    /** Type d'opération */
    operationType: OrchestrationOperationType;
    /** Données d'entrée */
    input: unknown;
    /** Priorité de la requête */
    priority?: OrchestrationPriority;
    /** Paramètres spécifiques à l'opération */
    operationParams?: OrchestrationOperationParams;
    /** Contraintes d'exécution */
    constraints?: OrchestrationConstraints;
    /** Options de cache */
    cacheOptions?: OrchestrationCacheOptions;
    /** Métadonnées */
    metadata?: OrchestrationMetadata;
    /** Canal de rappel WebSocket */
    callbackChannel?: string;
}

/**
 * Fonction de création d'une requête d'orchestration
 */
export function createOrchestrationRequest(
    options: CreateOrchestrationRequestOptions
): OrchestrationRequest {
    const requestId = generateRequestId();
    const now = Date.now();

    return {
        requestId,
        operationType: options.operationType,
        priority: options.priority || OrchestrationPriority.NORMAL,
        input: options.input,
        operationParams: options.operationParams,
        constraints: options.constraints,
        cacheOptions: options.cacheOptions,
        metadata: options.metadata,
        createdAt: now,
        state: OrchestrationRequestState.PENDING,
        callbackChannel: options.callbackChannel
    };
}

/**
 * Génère un ID de requête unique
 */
function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Fonction de création d'un résultat d'orchestration
 */
export function createOrchestrationResult(
    request: OrchestrationRequest,
    data: unknown,
    status: 'success' | 'partial_success' | 'failure' = 'success',
    errors?: Array<{ code: string; message: string; details?: unknown }>
): OrchestrationResult {
    return {
        resultId: request.requestId,
        requestId: request.requestId,
        operationType: request.operationType,
        status,
        data,
        errors,
        createdAt: Date.now()
    };
}

/**
 * Convertit une requête au format compatible en requête complète
 */
export function convertToFullRequest(request: OrchestrationRequestCompat): OrchestrationRequest {
    const priority = request.priority === 'high'
        ? OrchestrationPriority.HIGH
        : request.priority === 'low'
            ? OrchestrationPriority.LOW
            : OrchestrationPriority.NORMAL;

    // Déterminer le type d'opération basé sur le type de requête
    let operationType = OrchestrationOperationType.CUSTOM;
    if (request.type.includes('LSF_GENERATION')) {
        operationType = OrchestrationOperationType.LSF_GENERATION;
    } else if (request.type.includes('LSF_TO_TEXT')) {
        operationType = OrchestrationOperationType.LSF_TO_TEXT;
    } else if (request.type.includes('EMOTION')) {
        operationType = OrchestrationOperationType.EMOTION_ANALYSIS;
    }

    return {
        requestId: request.id,
        operationType,
        priority,
        input: request.payload,
        metadata: request.metadata as OrchestrationMetadata,
        createdAt: Date.now(),
        state: OrchestrationRequestState.PENDING
    };
}

/**
 * Convertit un résultat au format simplifié vers le format complet
 */
export function convertToFullResult<T>(
    compatResult: OrchestrationResultCompat<T>,
    request: OrchestrationRequest | OrchestrationRequestCompat
): OrchestrationResult {
    const requestId = 'requestId' in request ? request.requestId : request.id;
    const operationType = 'operationType' in request
        ? request.operationType
        : OrchestrationOperationType.CUSTOM;

    const status = compatResult.success ? 'success' : 'failure';

    return {
        resultId: requestId,
        requestId,
        operationType,
        status,
        data: compatResult.data,
        errors: compatResult.error ? [{
            code: 'ERR_PROCESSING',
            message: compatResult.error
        }] : undefined,
        createdAt: Date.now(),
        executionSteps: compatResult.metrics?.path.map(step => ({
            name: step,
            duration: 0, // Information non disponible dans le format compact
            status: 'success'
        }))
    };
}