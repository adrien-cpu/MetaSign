/**
 *
 * @file src/ai-types/index.ts
 * Types centralisés pour le système IA LSF
    * @description
    * Ce fichier contient les types et énumérations utilisés dans le système IA LSF.
    * Il est divisé en plusieurs sections pour une meilleure organisation.
    * @version 1.0
    * @example
    * import { ComponentType, ErrorSeverity, SystemComponentStatus } from './ai-types';
    * const component: ISystemComponent = {
    *     id: 'component1',
    *     type: ComponentType.Orchestrator,
    *     version: '1.0.0',
    *     getStatus: () => SystemComponentStatus.READY,
    *     process: async (data) => {
    *         // Traitement des données
    *         return { success: true, data: {} };
    *     }
    * };
    * const status = component.getStatus();
    * console.log(`Component status: ${status}`);
    * @remarks
    * - Les types et énumérations sont utilisés pour définir les composants du système,
    *   les niveaux de gravité des erreurs, les statuts des composants, les priorités des tâches,
    *   les types de modalités, les types de requêtes, et les stratégies de cache.
    * - Les interfaces définissent la structure des requêtes et des résultats de traitement.
    * - Les interfaces d'orchestration et de routage multimodal sont également incluses.
    * - Les étapes de traitement et les pipelines de traitement sont définis pour la gestion des flux de données.
    * - Les commentaires et les exemples sont fournis pour illustrer l'utilisation des types et des interfaces.
    * @license MIT
 */

// Énumérations de base
export enum ComponentType {
    Orchestrator = 'ORCHESTRATOR',
    Router = 'ROUTER',
    IACore = 'IA_CORE',
    Ethics = 'ETHICS',
    Expressions = 'EXPRESSIONS',
    Linguist = 'LINGUIST',
    Validator = 'VALIDATOR',
    Learning = 'LEARNING',
    Monitoring = 'MONITORING',
    Cache = 'CACHE',
    Security = 'SECURITY',
    Multimodal = 'MULTIMODAL'
}

export enum ErrorSeverity {
    Debug = 'DEBUG',
    Info = 'INFO',
    Warning = 'WARNING',
    Error = 'ERROR',
    Critical = 'CRITICAL'
}

export enum SystemComponentStatus {
    INITIALIZING = 'initializing',
    READY = 'ready',
    PROCESSING = 'processing',
    ERROR = 'error',
    SHUTDOWN = 'shutdown'
}

export enum TaskPriority {
    CRITICAL = 'critical',
    HIGH = 'high',
    NORMAL = 'normal',
    LOW = 'low',
    BACKGROUND = 'background'
}

export enum PriorityLevel {
    high = 'high',
    medium = 'medium',
    low = 'low'
}

export enum ModalityType {
    text = 'text',
    video = 'video',
    audio = 'audio',
    image = 'image',
    mixed = 'mixed'
}

export enum RequestType {
    TEXT_TO_LSF = 'TEXT_TO_LSF',
    LSF_TO_TEXT = 'LSF_TO_TEXT',
    LSF_TRANSLATION = 'LSF_TRANSLATION',
    ANALYZE_EXPRESSION = 'ANALYZE_EXPRESSION',
    GENERATE_EXPRESSION = 'GENERATE_EXPRESSION',
    OPTIMIZE_EXPRESSION = 'OPTIMIZE_EXPRESSION',
    EMOTION_ANALYSIS = 'EMOTION_ANALYSIS',
    CONTEXT_ANALYSIS = 'CONTEXT_ANALYSIS',
    LEARNING_MODULE = 'LEARNING_MODULE',
    LEARNING_PROGRESS = 'LEARNING_PROGRESS',
    LEARNING_RECOMMENDATION = 'LEARNING_RECOMMENDATION',
    BADGE_ACHIEVEMENT = 'BADGE_ACHIEVEMENT',
    CULTURAL_VALIDATION = 'CULTURAL_VALIDATION',
    SYSTEM_STATUS = 'SYSTEM_STATUS',
    PERFORMANCE_METRICS = 'PERFORMANCE_METRICS',
    CACHE_MANAGEMENT = 'CACHE_MANAGEMENT',
    FACIAL_SYNC = 'FACIAL_SYNC',
    GESTURE_GENERATION = 'GESTURE_GENERATION',
    AUDIO_ALIGNMENT = 'AUDIO_ALIGNMENT',
    PROSODY_ANALYSIS = 'PROSODY_ANALYSIS'
}

export enum CacheStrategy {
    Standard = 'standard',
    LongTerm = 'long_term',
    ShortTerm = 'short_term',
    NoCache = 'no_cache'
}

// Interfaces pour les composants du système
export interface ISystemComponent {
    id: string;
    type: ComponentType;
    version: string;
    getStatus(): SystemComponentStatus;
    process<TInput = unknown, TOutput = unknown>(data: TInput): Promise<TOutput>;
}

// Interfaces de requête et réponse
export interface RequestContext {
    requestId: string;
    type: string;
    input: unknown;
    parameters?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
    timestamp?: number;
    priority?: TaskPriority;
    cacheable?: boolean;
    metadata?: Record<string, unknown>;
    traceId?: string;
}

export interface ProcessingResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    processingTime?: number;
    metadata?: Record<string, unknown>;
}

// Orchestration - Interfaces pour OrchestrateurCentral
export interface OrchestrationRequest {
    id: string;
    type: string;
    payload: unknown;
    priority?: 'high' | 'medium' | 'low';
    metadata?: Record<string, unknown>;
}

export interface OrchestrationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metrics?: {
        executionTime: number;
        cacheUsed: boolean;
        componentsUsed?: string[];
        path?: string[];
        [key: string]: unknown;
    };
}

// Interfaces pour le routage multimodal
export interface ProcessRequest {
    id: string;
    type: RequestType;
    data: unknown;
    metadata?: Record<string, unknown>;
}

export interface ProcessResult<T = unknown> {
    requestId: string;
    success: boolean;
    data?: T;
    error?: string;
    processingTime?: number;
}

// Pipeline de traitement
export interface ProcessingStep {
    name: string;
    component: string;
    parameters?: Record<string, unknown>;
    optional?: boolean;
}

export interface ProcessingPipeline {
    id: string;
    steps: ProcessingStep[];
    applicableTypes: RequestType[];
    metadata?: Record<string, unknown>;
}

