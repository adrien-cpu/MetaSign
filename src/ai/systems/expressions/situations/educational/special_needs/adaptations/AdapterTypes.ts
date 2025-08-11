// Importation uniquement des types nécessaires d'autres fichiers
import {
    AdaptationSuggestionResult,
    AdvancedFeaturesResult,
    ContextAnalysisResult
} from './types';

/**
 * Énumérations pour les types d'adaptations
 */
export enum PreventiveMeasure {
    FATIGUE_PREVENTION = 'FATIGUE_PREVENTION',
    SENSORY_OVERLOAD_PREVENTION = 'SENSORY_OVERLOAD_PREVENTION',
    DISTRACTION_MINIMIZATION = 'DISTRACTION_MINIMIZATION',
    COGNITIVE_LOAD_MANAGEMENT = 'COGNITIVE_LOAD_MANAGEMENT',
    STRESS_REDUCTION = 'STRESS_REDUCTION'
}

/**
 * Types d'optimisations environnementales
 */
export enum EnvironmentalOptimizationType {
    LIGHTING = 'LIGHTING',
    ACOUSTICS = 'ACOUSTICS',
    SPATIAL_ARRANGEMENT = 'SPATIAL_ARRANGEMENT',
    VISUAL_CLARITY = 'VISUAL_CLARITY',
    DISTRACTION_CONTROL = 'DISTRACTION_CONTROL'
}

/**
 * Types d'accommodations pour les apprenants
 */
export enum LearnerAccommodationType {
    VISUAL = 'VISUAL',
    AUDITORY = 'AUDITORY',
    COGNITIVE = 'COGNITIVE',
    MOTOR = 'MOTOR',
    ATTENTIONAL = 'ATTENTIONAL',
    LINGUISTIC = 'LINGUISTIC',
    SOCIAL = 'SOCIAL',
    EMOTIONAL = 'EMOTIONAL'
}

/**
 * Types de fonctionnalités
 */
export enum FeatureType {
    PREDICTION = 'PREDICTION',
    ADAPTATION = 'ADAPTATION',
    ANALYSIS = 'ANALYSIS',
    OPTIMIZATION = 'OPTIMIZATION',
    COLLABORATION = 'COLLABORATION'
}

/**
 * Rôles des pairs dans l'apprentissage collaboratif
 */
export enum PeerRoles {
    MENTOR = 'MENTOR',
    COLEARNER = 'COLEARNER',
    FACILITATOR = 'FACILITATOR',
    OBSERVER = 'OBSERVER',
    RESOURCES_MANAGER = 'RESOURCES_MANAGER'
}

/**
 * Types pour les sessions d'apprentissage
 */
export interface LearningSession {
    id: string;
    learner: {
        id: string;
        profile: Record<string, unknown>;
    };
    duration: number;
    objectives: string[];
    environment: Record<string, unknown>;
    resources: string[];
    adaptations?: string[];
}

/**
 * Sessions dynamiques avec adaptations en temps réel
 */
export interface DynamicSession extends LearningSession {
    realTimeAdaptations: boolean;
    adaptationHistory: Array<{
        timestamp: number;
        adaptationType: string;
        effectiveness?: number;
    }>;
    currentState: {
        attentionLevel: number;
        fatigueLevel: number;
        engagementLevel: number;
        [key: string]: unknown;
    };
}

/**
 * Options de configuration de base pour tous les adaptateurs
 */
export interface BaseOptions {
    /** Type de fonctionnalité de l'adaptateur */
    feature_type: 'PREDICTIVE' | 'INTELLIGENT_ASSISTANCE' | 'COLLABORATION' | 'INTEGRATED' | 'BALANCED';
}

/**
 * Options pour l'adaptateur prédictif
 */
export interface PredictionOptions extends BaseOptions {
    /** Type de fonctionnalité - toujours PREDICTIVE */
    feature_type: 'PREDICTIVE';
    /** Focus de la prédiction */
    prediction_focus: 'FATIGUE_MANAGEMENT' | 'PERFORMANCE_OPTIMIZATION' | 'LEARNING_EFFICIENCY';
    /** Horizon temporel de la prédiction */
    horizon?: 'short' | 'medium' | 'long';
    /** Seuil de confiance pour les prédictions */
    confidenceThreshold?: number;
    /** Inclure les probabilités dans les résultats */
    includeProbabilities?: boolean;
    /** Types de prédictions à inclure */
    predictionTypes?: string[];
}

/**
 * Options pour l'adaptateur d'adaptation dynamique
 */
export interface DynamicAdaptationOptions extends BaseOptions {
    /** Type de fonctionnalité - toujours INTELLIGENT_ASSISTANCE */
    feature_type: 'INTELLIGENT_ASSISTANCE';
    /** Priorité d'optimisation */
    optimization_priority: 'LEARNING_EFFICIENCY' | 'COGNITIVE_SUPPORT' | 'ENVIRONMENTAL';
    /** Niveau de support */
    support_level: 'LOW' | 'MODERATE' | 'HIGH' | 'ADAPTIVE';
    /** Activer les mises à jour en temps réel */
    realTimeUpdates?: boolean;
    /** Fréquence d'adaptation */
    adaptationFrequency?: number;
    /** Niveau de sensibilité */
    sensitivityLevel?: number;
    /** Domaines prioritaires */
    prioritizeAreas?: string[];
}

/**
 * Options pour l'adaptateur de collaboration
 */
export interface CollaborationOptions extends BaseOptions {
    /** Type de fonctionnalité - toujours COLLABORATION */
    feature_type: 'COLLABORATION';
    /** Critères de correspondance */
    matching_criteria: 'COMPLEMENTARY_SKILLS' | 'SIMILAR_LEVEL' | 'DIVERSE_BACKGROUNDS';
    /** Focus de la collaboration */
    focus: string;
    /** Activer le support par les pairs */
    enablePeerSupport?: boolean;
    /** Préférence de taille de groupe */
    groupSizePreference?: number;
    /** Stratégie d'assignation des rôles */
    roleAssignmentStrategy?: 'random' | 'skill-based' | 'preference-based';
    /** Intensité de la collaboration */
    collaborationIntensity?: 'low' | 'medium' | 'high';
}

/**
 * Options pour l'adaptateur intégré
 */
export interface IntegratedOptions extends BaseOptions {
    /** Type de fonctionnalité - toujours INTEGRATED */
    feature_type: 'INTEGRATED';
    /** Niveau d'intégration */
    integration_level: 'MINIMAL' | 'PARTIAL' | 'FULL';
    /** Focus de la prédiction */
    prediction_focus: 'FATIGUE_MANAGEMENT' | 'PERFORMANCE_OPTIMIZATION' | 'LEARNING_EFFICIENCY';
    /** Priorité d'optimisation */
    optimization_priority: 'LEARNING_EFFICIENCY' | 'COGNITIVE_SUPPORT' | 'ENVIRONMENTAL';
    /** Configuration de prédiction */
    prediction?: Partial<PredictionOptions>;
    /** Configuration d'adaptation dynamique */
    dynamicAdaptation?: Partial<DynamicAdaptationOptions>;
    /** Configuration de collaboration */
    collaboration?: Partial<CollaborationOptions>;
    /** Paramètres personnalisés */
    customParameters?: Record<string, unknown>;
}

/**
 * Interface pour les informations de l'étudiant
 */
export interface Student {
    /** Historique de fatigue de l'étudiant */
    fatigue_history: Array<{
        timestamp: number;
        level: number;
    }>;
    // Autres propriétés possibles de l'étudiant
}

/**
 * Interface pour les informations de l'apprenant
 */
export interface Learner {
    // Propriétés de l'apprenant
    id: string;
    skill_level: number;
    learning_style?: string;
    preferences?: Record<string, unknown>;
}

/**
 * Interface pour les informations d'environnement
 */
export interface Environment {
    // Propriétés d'environnement
    noise_level?: number;
    lighting?: number;
    distractions?: number;
    type?: 'CLASSROOM' | 'HOME' | 'OUTDOORS' | 'OTHER';
}

/**
 * Interface pour les informations de tâche
 */
export interface Task {
    // Propriétés de tâche
    id: string;
    complexity: number;
    duration: number;
    type: string;
    resources?: string[];
}

/**
 * Interface pour la composition de groupe
 */
export interface GroupComposition {
    // Propriétés de composition de groupe
    members: Array<{
        id: string;
        role?: string;
        skill_level?: number;
    }>;
    size: number;
    diversity_index?: number;
}

/**
 * Interface pour les données de session
 */
export interface SessionData {
    /** Durée de la session */
    duration: number;
    /** Intensité de la session */
    intensity: number;
    /** Défis de la session */
    challenges: string[];
    /** Informations sur l'étudiant */
    student?: Student;
    /** Informations sur l'apprenant */
    learner?: Learner;
    /** Informations sur l'environnement */
    environment?: Environment;
    /** Informations sur la tâche */
    task?: Task;
    /** Composition du groupe */
    group_composition?: GroupComposition;
    // Autres propriétés possibles de la session
    [key: string]: unknown;
}

/**
 * Données d'assistance pour les apprenants
 */
export interface AssistanceData {
    learnerProfile: Record<string, unknown>;
    assistanceHistory: Array<{
        type: string;
        timestamp: number;
        duration: number;
        outcome: string;
    }>;
    currentNeeds: string[];
    priorityLevel: 'low' | 'medium' | 'high';
}

/**
 * Mesures d'assistance adaptées
 */
export interface AdaptedAssistanceMeasures {
    primaryMeasures: string[];
    secondaryMeasures: string[];
    implementationDetails: Record<string, unknown>;
    expectedOutcomes: string[];
    fallbackOptions: string[];
}

/**
 * Données de prédiction adaptées
 */
export interface AdaptedPredictionData {
    predictionType: string;
    confidence: number;
    timePeriod: {
        start: number;
        end: number;
    };
    predictedValues: Record<string, number>;
    influencingFactors: string[];
}

/**
 * Résultat d'analyse de contexte adapté
 */
export interface AdaptedContextAnalysisResult extends Omit<ContextAnalysisResult, 'id'> {
    adaptationRelevance: number;
    prioritizedNeeds: string[];
    environmentalFactors: Record<string, unknown>;
    temporalConsiderations: {
        timeOfDay: string;
        duration: number;
        frequency: string;
    };
}

/**
 * Optimisations environnementales adaptées
 */
export interface AdaptedEnvironmentalOptimizations {
    optimizationType: EnvironmentalOptimizationType;
    settings: Record<string, unknown>;
    implementationPriority: number;
    compatibilityInfo: {
        compatibleWith: string[];
        incompatibleWith: string[];
    };
    setupInstructions: string;
}

/**
 * Accommodations adaptées aux apprenants
 */
export interface AdaptedLearnerAccommodations {
    accommodationType: LearnerAccommodationType;
    customizations: Record<string, unknown>;
    applicabilityScore: number;
    progressiveImplementation: {
        initialLevel: number;
        targetLevel: number;
        incrementSteps: number;
    };
}

/**
 * Correspondance entre pairs adaptée
 */
export interface AdaptedPeerMatch {
    mainLearnerId: string;
    supportLearnerId: string;
    matchStrength: number;
    complementarySkills: string[];
    suggestedActivities: string[];
}

/**
 * Structure de support par les pairs adaptée
 */
export interface AdaptedPeerSupportStructure {
    supportType: string;
    participants: string[];
    roles: Record<string, PeerRoles>;
    duration: number;
    expectedOutcomes: string[];
    evaluationCriteria: string[];
}

/**
 * Allocation de ressources adaptée
 */
export interface AdaptedResourceAllocation {
    resourceTypes: string[];
    allocationStrategy: string;
    priorityMapping: Record<string, number>;
    adaptiveReallocation: boolean;
    constraintHandling: string;
}

/**
 * Prédiction de fatigue
 */
export interface FatiguePrediction {
    predictedLevel: number;
    confidence: number;
    timeToFatigue: number;
    recommendedBreakTime: number;
    preventiveMeasures: PreventiveMeasure[];
}

/**
 * Adapte le résultat des fonctionnalités avancées pour la compatibilité avec les systèmes existants
 * @param result Résultat original des fonctionnalités avancées
 * @returns Résultat adapté
 */
export function adaptAdvancedFeaturesResult(
    result: AdvancedFeaturesResult
): Record<string, unknown> {
    return {
        success: result.success,
        message: result.message,
        timestamp: result.timestamp,
        data: {
            ...result.data,
            effectiveness: result.effectiveness,
            predictions: {
                scores: result.predictions.scores,
                interventionPoints: result.predictions.intervention_points
            },
            recommendations: result.recommendations.map(r => ({
                id: r.id,
                type: r.type,
                description: r.description,
                priority: r.priority
            }))
        }
    };
}

/**
 * Crée un modèle adapté à partir des suggestions d'adaptation
 * @param suggestion Suggestion d'adaptation
 * @returns Modèle adapté
 */
export function createAdaptedPattern(
    suggestion: AdaptationSuggestionResult
): Record<string, unknown> {
    return {
        id: suggestion.id,
        type: suggestion.adaptationType,
        priority: suggestion.priority,
        rationale: suggestion.rationale,
        parameters: suggestion.parameters,
        compatibilityScore: suggestion.compatibilityScore,
        benefits: suggestion.expectedBenefits
    };
}