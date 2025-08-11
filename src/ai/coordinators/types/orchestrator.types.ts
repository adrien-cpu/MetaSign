//src/ai/coordinators/types/orchestrator.types.ts

/**
 * Interface pour les erreurs d'orchestration
 * Fournit un typage fort pour les erreurs
 */
export class OrchestratorError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly component?: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'OrchestratorError';
    }
}

/**
 * @file: src/ai/coordinators/types/orchestrator.types.ts
 * 
 * Types pour le SystemeOrchestrateurCentral
 * Séparation des interfaces et types pour améliorer la maintenabilité
 */

import { RequestType, TaskPriority, SystemState } from '@ai/coordinators/types';

/**
 * Interface pour une requête LSF
 */
export interface LSFRequest {
    type: RequestType;
    modality: string;
    data: unknown;
    userId: string;
    sessionId: string;
    timestamp: number;
    priority: TaskPriority;
    noCache?: boolean;
    context?: Record<string, unknown>;
}

/**
 * Interface pour une alerte système
 */
export interface Alert {
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
    timestamp: number;
    context?: Record<string, unknown>;
}

/**
 * Interface pour un résultat de traitement amélioré
 */
export interface EnhancedProcessResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    metrics?: {
        processingTime?: number;
        pipeline?: string;
        [key: string]: unknown;
    };
}

/**
 * Interface pour un résultat d'orchestration
 */
export interface OrchestrationResult<T> {
    success: boolean;
    data: T;
    error?: string;
    errorCode?: string;
    metrics: {
        executionTime: number;
        cacheUsed: boolean;
        componentsUsed: string[];
        path: string[];
        timestamp?: number;
        orchestrationMode?: OrchestrationMode;
        [key: string]: unknown;
    };
}

/**
 * Interface pour un résultat de validation
 */
export interface ValidationResult {
    isValid: boolean;
    reason?: string;
}

/**
 * Interface pour la configuration du cache d'orchestration
 */
export interface OrchestratorCacheConfig {
    enabled: boolean;
    l1Size: number;
    l2Size: number;
    enablePredictiveCache: boolean;
    defaultTTL: number;
}

/**
 * Interface pour les options d'orchestration
 */
export interface OrchestratorOptions {
    cacheEnabled?: boolean;
    monitoringLevel?: 'basic' | 'advanced' | 'detailed';
    initialMode?: OrchestrationMode;
    maxPendingRequests?: number;
    autoRecover?: boolean;
    preloadModels?: boolean;
    ethicsLevel?: 'standard' | 'enhanced' | 'strict';
}

/**
 * Modes d'orchestration disponibles
 */
export enum OrchestrationMode {
    STANDARD = 'standard',
    HIGH_PERFORMANCE = 'high_performance',
    HIGH_ACCURACY = 'high_accuracy',
    LOW_LATENCY = 'low_latency',
    BALANCED = 'balanced'
}

/**
 * Interface pour l'état du système orchestrateur
 */
export interface OrchestratorState {
    status: SystemState;
    uptime: number;
    components: Record<string, string>;
    pendingRequests: number;
    alerts: number;
    systemLoad: {
        cpu: number;
        memory: number;
        network: number;
    };
}

/**
 * Interface de requête à valider par le système d'éthique
 */
export interface EthicsValidationRequest {
    type: RequestType;
    data: unknown;
    user: {
        id: string;
    };
    context: {
        timestamp: number;
        sessionId: string;
    };
}

/**
 * Interface pour les dialectes supportés
 */
export interface DialectInfo {
    supportedVariants: string[];
    defaultVariant: string;
    variantsDescription: Record<string, string>;
}

/**
 * Interface pour les statistiques de performance
 */
export interface PerformanceStats {
    system: Record<string, number>;
    cache: Record<string, number>;
    components: Record<string, Record<string, number>>;
    monitoring: Record<string, number>;
}

/**
 * Interface pour les métadonnées de cache
 */
export interface CacheMetadata {
    requestType: RequestType;
    timestamp: number;
}

/**
 * Interface pour les options de cache
 */
export interface CacheOptions {
    ttl?: number;
    metadata?: CacheMetadata;
}

/**
 * Interface pour les événements d'optimisation
 */
export interface OptimizationEvent {
    timestamp: number;
    resourceType: string;
    metricName: string;
    currentValue: number;
    optimizationReason: string;
}