// src/ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-types.ts

/**
 * Énumération des stratégies d'adaptation possibles
 */
export enum AdaptationStrategy {
    VISUAL_SIMPLIFICATION = 'VISUAL_SIMPLIFICATION',
    SPATIAL_OPTIMIZATION = 'SPATIAL_OPTIMIZATION',
    TEMPORAL_ADJUSTMENT = 'TEMPORAL_ADJUSTMENT',
    COMPLEXITY_REDUCTION = 'COMPLEXITY_REDUCTION',
    CONTEXT_ENHANCEMENT = 'CONTEXT_ENHANCEMENT',
    BREAK_SCHEDULING = 'BREAK_SCHEDULING'
}

/**
 * Énumération des types d'adaptation possibles
 */
export enum AdaptationType {
    VISUAL_SIMPLIFICATION = 'VISUAL_SIMPLIFICATION',
    SPATIAL_OPTIMIZATION = 'SPATIAL_OPTIMIZATION',
    TEMPORAL_ADJUSTMENT = 'TEMPORAL_ADJUSTMENT',
    COMPLEXITY_REDUCTION = 'COMPLEXITY_REDUCTION',
    CONTEXT_ENHANCEMENT = 'CONTEXT_ENHANCEMENT',
    BREAK_SCHEDULING = 'BREAK_SCHEDULING'
}

/**
 * Énumération des types de fonctionnalités d'adaptation
 */
export enum AdaptationFeatureType {
    STATIC = 'STATIC',
    DYNAMIC = 'DYNAMIC',
    INTERACTIVE = 'INTERACTIVE',
    PREDICTIVE = 'PREDICTIVE'
}

/**
 * Énumération des fonctionnalités avancées
 */
export enum AdvancedFeatureType {
    CONTINUOUS_LEARNING = 'CONTINUOUS_LEARNING',
    AUTOMATIC_OPTIMIZATION = 'AUTOMATIC_OPTIMIZATION',
    VOICE_COMMANDS = 'VOICE_COMMANDS',
    ADAPTIVE_UI = 'ADAPTIVE_UI',
    PREDICTIVE_SUGGESTIONS = 'PREDICTIVE_SUGGESTIONS'
}

/**
 * Niveaux de journalisation supportés
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * Configuration d'une adaptation
 */
export interface AdaptationConfig {
    type: AdaptationType;
    intensity: number;
    parameters: { [key: string]: unknown };
    enabled: boolean;
}

/**
 * Structure de métriques d'évaluation
 */
export interface AdaptationMetrics {
    intensity: number;
    usageFrequency: number;
    userSatisfaction: number;
}

/**
 * Résultat d'évaluation d'une adaptation
 */
export interface AdaptationEvaluationResult {
    adaptationId: string;
    effectivenessScore: number;
    metrics: AdaptationMetrics;
    observations: string[];
    recommendations: string[];
}

/**
 * Recommandation d'adaptation
 */
export interface AdaptationRecommendation {
    type: string;
    priority: number;
    parameters?: { [key: string]: unknown };
    id: string;
}

/**
 * Résultat d'analyse des besoins
 */
export interface AnalysisResult {
    adaptationType: AdaptationType;
    priority: number;
    parameters: { [key: string]: unknown };
    id?: string;
}

/**
 * Interface pour une alerte de fatigue
 */
export interface FatigueAlert {
    /** Niveau de fatigue (LOW, MEDIUM, HIGH) */
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    /** Timestamp de détection */
    timestamp: number;
    /** Score de confiance (0-1) */
    confidence: number;
    /** Détails supplémentaires */
    details?: string;
}

/**
 * Interface pour le support cognitif
 */
export interface CognitiveSupport {
    /** Aides mémorielles */
    memory_aids: boolean;
    /** Échafaudages pour le traitement d'information */
    processing_scaffolds: boolean;
    /** Guides d'attention */
    attention_guides: boolean;
    /** Adaptations de complexité */
    complexity_adaptations?: boolean;
}

/**
 * Interface pour le résultat des fonctionnalités avancées
 */
export interface AdvancedFeaturesResult {
    /** Prédictions système */
    predictions?: {
        /** Points d'intervention */
        intervention_points: Array<{
            /** Type d'intervention */
            type: string;
            /** Timestamp prévu */
            timestamp: number;
            /** Priorité de l'intervention */
            priority: number;
        }>;
        /** Alertes de fatigue */
        fatigue_alerts: FatigueAlert[];
    };
    /** Conscience contextuelle */
    contextAwareness?: {
        /** Données apprenant */
        learner: {
            /** Support cognitif */
            cognitive_support?: CognitiveSupport;
            /** Accommodations */
            accommodations?: {
                /** Liste des accommodations */
                accommodations: string[];
            };
        };
        /** Données environnementales */
        environmental: {
            /** Optimisations */
            optimizations?: {
                /** Liste des optimisations */
                optimizations: string[];
            };
        };
    };
    /** Support par les pairs */
    peerSupport?: {
        /** Correspondances entre pairs */
        matches?: Array<{
            /** ID pair */
            peer_id: string;
            /** Score de correspondance */
            match_score: number;
        }>;
    };
    /** Ressources */
    resources?: {
        /** Matériaux partagés */
        shared_materials?: {
            /** Ressources multimodales */
            multi_modal_resources?: boolean;
            /** Contenu adapté */
            adapted_content?: boolean;
        };
    };
    /** Intégration */
    integration?: {
        /** Score d'harmonie */
        harmony_score?: number;
    };
    /** Assistance */
    assistance?: {
        /** Efficacité */
        effectiveness?: {
            /** Score global */
            overall?: number;
        };
    };
}

/**
 * Type pour un enregistrement générique
 * Note: Utiliser un type personnalisé CustomRecord pour éviter les conflits avec Record de TypeScript
 */
export type CustomRecord<T = unknown> = {
    [key: string]: T;
};

/**
 * Énumérations supplémentaires pour les types d'adaptation
 */
export enum PredictionFocusType {
    FATIGUE = 'FATIGUE',
    ATTENTION = 'ATTENTION',
    COMPREHENSION = 'COMPREHENSION',
    ENGAGEMENT = 'ENGAGEMENT',
    RETENTION = 'RETENTION'
}

export enum AdaptationIntensity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum FatigueLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum PerformanceLevel {
    POOR = 'POOR',
    AVERAGE = 'AVERAGE',
    GOOD = 'GOOD',
    EXCELLENT = 'EXCELLENT'
}

export enum OptimizationPriority {
    ACCESSIBILITY = 'ACCESSIBILITY',
    LEARNING_EFFICIENCY = 'LEARNING_EFFICIENCY',
    ENGAGEMENT = 'ENGAGEMENT',
    FATIGUE_REDUCTION = 'FATIGUE_REDUCTION'
}

export enum SupportLevel {
    MINIMAL = 'MINIMAL',
    MODERATE = 'MODERATE',
    EXTENSIVE = 'EXTENSIVE'
}

export enum MatchingCriteria {
    LEARNING_STYLE = 'LEARNING_STYLE',
    DOMAIN_KNOWLEDGE = 'DOMAIN_KNOWLEDGE',
    SKILL_LEVEL = 'SKILL_LEVEL',
    COMMUNICATION_STYLE = 'COMMUNICATION_STYLE'
}

export enum IntegrationLevel {
    STANDALONE = 'STANDALONE',
    PARTIAL = 'PARTIAL',
    FULL = 'FULL'
}

export enum FocusType {
    COGNITIVE = 'COGNITIVE',
    EMOTIONAL = 'EMOTIONAL',
    BEHAVIORAL = 'BEHAVIORAL',
    SOCIAL = 'SOCIAL',
    PHYSICAL = 'PHYSICAL'
}

export enum PriorityType {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

/**
 * Interface pour le support par les pairs
 */
export interface PeerSupport {
    /** Correspondances entre pairs */
    matches?: Array<{
        /** ID pair */
        peer_id: string;
        /** Score de correspondance */
        match_score: number;
    }>;
}