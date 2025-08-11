/**
 * @file: src/ai/types/modality.ts
 * 
 * Types pour la gestion des modalités dans le système LSF.
 */

/**
 * Types de modalités supportés
 */
export enum ModalityType {
    /** Modalité textuelle */
    TEXT = 'text',
    /** Modalité vidéo */
    VIDEO = 'video',
    /** Modalité audio */
    AUDIO = 'audio',
    /** Modalité image */
    IMAGE = 'image',
    /** Modalité mixte (plusieurs types combinés) */
    MIXED = 'mixed'
}

/**
 * Types de requêtes pour le routeur
 */
export enum RequestType {
    // Types de requêtes pour l'IA Core
    CONTEXT_ANALYSIS = 'context_analysis',
    EMOTION_ANALYSIS = 'emotion_analysis',
    SYSTEM_STATUS = 'system_status',
    PERFORMANCE_METRICS = 'performance_metrics',
    CACHE_MANAGEMENT = 'cache_management',

    // Types de requêtes linguistiques
    LSF_TRANSLATION = 'lsf_translation',
    TEXT_TO_LSF = 'text_to_lsf',
    LSF_TO_TEXT = 'lsf_to_text',
    CULTURAL_VALIDATION = 'cultural_validation',

    // Types de requêtes d'expression
    GENERATE_EXPRESSION = 'generate_expression',
    ANALYZE_EXPRESSION = 'analyze_expression',
    OPTIMIZE_EXPRESSION = 'optimize_expression',
    GESTURE_GENERATION = 'gesture_generation',
    FACIAL_SYNC = 'facial_sync',

    // Types de requêtes multimodales avancées
    AUDIO_ALIGNMENT = 'audio_alignment',
    PROSODY_ANALYSIS = 'prosody_analysis',

    // Types de requêtes d'apprentissage
    LEARNING_MODULE = 'learning_module',
    LEARNING_PROGRESS = 'learning_progress',
    BADGE_ACHIEVEMENT = 'badge_achievement',
    LEARNING_RECOMMENDATION = 'learning_recommendation',

    // Types de requêtes d'urgence
    EMERGENCY = 'emergency',
    CRITICAL = 'critical',

    // Types de requêtes système
    BACKGROUND = 'background',
    MAINTENANCE = 'maintenance'
}

/**
 * Niveaux de priorité des requêtes
 */
export enum PriorityLevel {
    /** Priorité haute */
    HIGH = 'high',
    /** Priorité moyenne */
    MEDIUM = 'medium',
    /** Priorité basse */
    LOW = 'low'
}
/**
 * Données de modalité spécifiques par type
 */
export type ModalityDataType =
    | { type: 'expression'; value: Record<string, number> }
    | { type: 'gesture'; sequence: string[] }
    | { type: 'position'; coordinates: { x: number; y: number; z: number } }
    | { type: 'timing'; duration: number; tempo: number }
    | { type: 'emotion'; name: string; intensity: number }
    | { type: 'custom'; value: Record<string, unknown> };

/**
 * Résultat d'analyse de modalité
 */
export interface ModalityResult {
    type: string;
    data: ModalityDataType;
    confidence: number;
}

/**
 * Informations de timing pour une modalité
 */
export interface TimingInfo {
    start: number;
    end: number;
    duration: number;
}

/**
 * Métadonnées de fusion de modalités
 */
export interface FusionMetadata {
    confidence: number;
    sources: string[];
    metrics: Record<string, number>;
}

/**
 * Configuration de modalité
 */
export interface ModalityConfig {
    type: string;
    parameters: Record<string, unknown>;
}

/**
 * Requête de traitement
 */
export interface ProcessRequest<T = unknown> {
    /** Identifiant de la requête */
    id: string;
    /** Type de la requête */
    type: RequestType;
    /** Données à traiter */
    data: T;
    /** Métadonnées de la requête */
    metadata?: {
        /** Identifiant de l'utilisateur */
        userId?: string;
        /** Type de l'utilisateur */
        userType?: 'admin' | 'premium' | 'standard';
        /** Modalité de la requête */
        modality?: ModalityType;
        /** Priorité de la requête */
        priority?: PriorityLevel;
        /** Contexte de la requête */
        context?: Record<string, unknown>;
        /** ID de traçage */
        traceId?: string;
        /** Requête en temps réel */
        realtime?: boolean;
        /** Contenu dynamique */
        dynamicContent?: boolean;
        /** Dialecte préféré */
        preferredDialect?: string;
    };
}

/**
 * Résultat de traitement
 */
export interface ProcessResult<T = unknown> {
    /** Identifiant de la requête */
    requestId: string;
    /** Succès du traitement */
    success: boolean;
    /** Données résultantes */
    data: T;
    /** Message d'erreur si échec */
    error?: string;
    /** Durée du traitement en ms */
    processingTime?: number;
    /** Métriques additionnelles */
    metrics?: Record<string, unknown>;
}

/**
 * Pipeline de traitement
 */
export interface ProcessingPipeline {
    /** Identifiant du pipeline */
    id: string;
    /** Étapes du pipeline */
    steps: Array<{
        /** Nom de l'étape */
        name: string;
        /** Composant associé à l'étape */
        component: string;
    }>;
    /** Types de requêtes applicables */
    applicableTypes: RequestType[];
}

/**
 * Stratégies de mise en cache
 */
export enum CacheStrategy {
    /** Pas de mise en cache */
    NoCache = 'no_cache',
    /** Cache avec expiration basée sur le temps */
    TimeExpiration = 'time_expiration',
    /** Cache avec invalidation manuelle uniquement */
    Manual = 'manual',
    /** Cache adaptatif (selon l'usage) */
    Adaptive = 'adaptive'
}

/**
 * Modalité avec données intégrées
 */
export interface ModalityWithData<T = unknown> {
    /** Type de modalité */
    type: ModalityType;
    /** Données de la modalité */
    data: T;
    /** Métadonnées spécifiques à la modalité */
    metadata?: Record<string, unknown>;
}

/**
 * Requête multimodale
 */
export interface MultimodalRequest {
    /** Identifiant de la requête */
    id: string;
    /** Type de requête */
    type: RequestType;
    /** Modalités disponibles */
    modalities: ModalityWithData[];
    /** Contexte de la requête */
    context?: Record<string, unknown>;
    /** Préférences utilisateur */
    preferences?: Record<string, unknown>;
}