// src/ai/systems/expressions/situations/educational/special_needs/adaptations/types/intervention.types.ts

import {
    AdvancedFeatureType,
    PredictionFocusType,
    AdaptationIntensity,
    FatigueLevel,
    PerformanceLevel,
    OptimizationPriority,
    SupportLevel,
    MatchingCriteria,
    IntegrationLevel,
    FocusType,
    PriorityType,
    CustomRecord,
    PeerSupport
} from './adaptation-types';

/**
 * Types d'intervention possibles
 */
export enum InterventionType {
    PREDICTIVE = 'PREDICTIVE',
    REACTIVE = 'REACTIVE',
    PREVENTIVE = 'PREVENTIVE',
    MITIGATING = 'MITIGATING',
    REMEDIAL = 'REMEDIAL'
}

/**
 * Stratégies d'adaptation possible
 */
export enum AdaptationStrategy {
    // Stratégies de rythme et tempo
    BREAK_SCHEDULING = 'BREAK_SCHEDULING',
    ADAPTIVE_PACING = 'ADAPTIVE_PACING',
    STRATEGIC_BREAKS = 'STRATEGIC_BREAKS',

    // Stratégies de contenu
    CONTENT_RESTRUCTURING = 'CONTENT_RESTRUCTURING',
    CONTENT_ADAPTATION = 'CONTENT_ADAPTATION',
    SIMPLIFIED_CONTENT = 'SIMPLIFIED_CONTENT',
    MODALITY_SWITCH = 'MODALITY_SWITCH',

    // Stratégies collaboratives
    PEER_SUPPORT = 'PEER_SUPPORT',
    COLLABORATIVE_LEARNING = 'COLLABORATIVE_LEARNING',
    PEER_COLLABORATION = 'PEER_COLLABORATION',
    ROLE_ROTATION = 'ROLE_ROTATION',
    GUIDED_DISCUSSION = 'GUIDED_DISCUSSION',

    // Stratégies cognitives
    COGNITIVE_SUPPORT = 'COGNITIVE_SUPPORT',
    COGNITIVE_SCAFFOLDING = 'COGNITIVE_SCAFFOLDING',

    // Stratégies environnementales
    ENVIRONMENTAL_OPTIMIZATION = 'ENVIRONMENTAL_OPTIMIZATION',

    // Stratégies de présentation
    MULTI_MODAL_PRESENTATION = 'MULTI_MODAL_PRESENTATION',
    PERSONALIZED_PACING = 'PERSONALIZED_PACING'
}

/**
 * Structure d'un point d'intervention
 */
export interface InterventionPoint {
    /** Type d'intervention */
    type: InterventionType | string;
    /** Timestamp prévu */
    timestamp: number;
    /** Priorité de l'intervention */
    priority: number;
    /** Données contextuelles */
    context?: unknown;
    /** Confiance dans la prédiction (0-1) */
    confidence?: number;
    /** Stratégie recommandée */
    strategy?: AdaptationStrategy;
}

/**
 * Scores de prédiction pour l'adaptation
 */
export interface PredictionScores {
    engagement: number;
    comprehension: number;
    retention: number;
    attention: number;
    fatigue: number;
}

/**
 * Métriques d'adaptation
 */
export interface AdaptationMetrics {
    processingTime: number;
    [key: string]: number;
}

/**
 * Recommandation d'adaptation
 */
export interface AdaptationRecommendation {
    id: string;
    type: string;
    content: string;
    priority: number;
    description: string;
    rationale: string;
}

/**
 * Interface de support par les pairs avec accès indexé
 * Étend l'interface PeerSupport des résultats de fonctionnalités avancées
 * pour permettre l'accès indexé aux propriétés
 */
export interface IndexablePeerSupport extends PeerSupport {
    /** Permettre l'accès indexé */
    [key: string]: unknown;
}

/**
 * Type pour les interventions adaptatives
 */
export type AdaptiveIntervention = {
    /** Type d'intervention */
    type: 'COGNITIVE' | 'EMOTIONAL' | 'BEHAVIORAL' | 'ENVIRONMENTAL';
    /** Niveau d'intensité */
    intensity: number;
    /** Durée suggérée (en ms) */
    duration?: number;
    /** Données spécifiques au type */
    specifics?: { [key: string]: unknown };
};

/**
 * Interface pour les données d'intervention
 */
export interface InterventionData {
    /** Points d'intervention */
    points: InterventionPoint[];
    /** Interventions adaptatives */
    adaptiveInterventions: AdaptiveIntervention[];
    /** Métadonnées */
    metadata?: { [key: string]: unknown };
}

/**
 * Interface pour les interventions d'adaptation
 */
export interface InterventionBase {
    /** Type d'intervention */
    type: InterventionType;
    /** Horodatage de l'intervention */
    timestamp: number;
    /** Niveau de confiance */
    confidence: number;
    /** Stratégie d'intervention */
    strategy: AdaptationStrategy;
    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

/**
 * Interface pour les interventions prédictives
 */
export interface PredictiveIntervention extends InterventionBase {
    /** Type d'intervention toujours prédictif */
    type: InterventionType.PREDICTIVE;
    /** Temps d'intervention prédit */
    predictedTime: number;
    /** Indicateurs de prédiction */
    indicators: string[];
}

/**
 * Interface pour les interventions réactives
 */
export interface ReactiveIntervention extends InterventionBase {
    /** Type d'intervention toujours réactif */
    type: InterventionType.REACTIVE;
    /** Déclencheur de l'intervention */
    trigger: string;
    /** Niveau de sévérité */
    severity: number;
}

/**
 * Interface pour les interventions préventives
 */
export interface PreventiveIntervention extends InterventionBase {
    /** Type d'intervention toujours préventif */
    type: InterventionType.PREVENTIVE;
    /** Risque adressé */
    risk: string;
    /** Probabilité du risque */
    probability: number;
}

/**
 * Types de résultats additionnels
 */
export interface AdaptationSuggestionResult {
    suggestions: AdaptationRecommendation[];
    urgency: number;
    relevance: number;
    contextFactors: string[];
}

export interface EffectivenessEvaluationResult {
    overallScore: number;
    breakdown: { [key: string]: number };
    improvementAreas: string[];
    successMetrics: { [key: string]: number };
}

export interface StrategyRefinementResult {
    refinedStrategies: AdaptationStrategy[];
    projectedImprovement: number;
    justification: string;
    implementation: { [key: string]: unknown };
}

export type {
    CustomRecord as Record,
    AdvancedFeatureType,
    PredictionFocusType,
    AdaptationIntensity,
    FatigueLevel,
    PerformanceLevel,
    OptimizationPriority,
    SupportLevel,
    MatchingCriteria,
    IntegrationLevel,
    FocusType,
    PriorityType
};