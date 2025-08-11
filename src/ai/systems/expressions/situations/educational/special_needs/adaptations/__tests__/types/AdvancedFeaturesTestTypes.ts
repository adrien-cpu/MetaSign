// src/ai/system/expressions/situations/educational/special_needs/adaptations/__tests__/types/AdvancedFeaturesTestTypes.ts

// Enums et types de base
export type FeatureType = 'PREDICTIVE' | 'INTELLIGENT_ASSISTANCE' | 'COLLABORATION' | 'BALANCED';
export type FatigueLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type InterventionType = 'PREVENTIVE' | 'MITIGATING' | 'CRITICAL';
export type InterventionAction = 'BREAK' | 'MODALITY_SWITCH' | 'SESSION_RESTRUCTURE';
export type PatternType = 'FATIGUE' | 'ATTENTION' | 'LEARNING_SPEED';
export type PatternSeverity = 'LOW' | 'MODERATE' | 'HIGH';
export type PatternTiming = 'EARLY_SESSION' | 'MID_SESSION' | 'LATE_SESSION';
export type FluctuationType = 'RHYTHMIC' | 'IRREGULAR' | 'PROGRESSIVE';
export type SpeedPattern = 'CONSTANT' | 'VARIABLE' | 'DECREASING';
export type PhaseType = 'RECOVERY' | 'OPTIMIZED' | 'ADAPTIVE';
export type PhaseTiming = 'AFTER_HIGH_INTENSITY' | 'ADAPTIVE';
export type PreventiveMeasure = 'BREAK_SCHEDULING' | 'CONTENT_ADAPTATION' | 'MODALITY_VARIATION' | 'ENVIRONMENTAL_OPTIMIZATION' | 'COGNITIVE_SUPPORT';
export type Recommendation = 'ADAPTIVE_PACING' | 'STRATEGIC_BREAKS' | 'CONTENT_RESTRUCTURING' | string;
export type StabilityStatus = 'MAINTAINED' | 'IMPROVED' | 'DEGRADED';
export type Responsiveness = 'HIGH' | 'MEDIUM' | 'LOW';
export type SupportLevel = 'ADAPTIVE' | 'FIXED';
export type AssistanceStrategy = 'STEP_BY_STEP' | 'HOLISTIC';
export type AccessibilityLevel = 'UNIVERSAL' | 'TARGETED' | 'SPECIALIZED';

// Pour résoudre les problèmes d'importation
export interface EnvironmentalOptimizations {
    lighting: string;
    noise: string;
    spatial: string;
}

// Ajout pour correspondre à l'autre fichier
export interface EnvironmentalOptimization {
    type: string;
    adjustments: string[];
    expectedBenefit: string;
}

export interface LearnerAccommodations {
    visual: string;
    attention: string;
    cognitive: string;
}

// Ajout pour correspondre à l'autre fichier
export interface LearnerAccommodation {
    type: string;
    description: string;
    implementationDetails: string[];
}

export interface CognitiveSupport {
    memory_aids?: boolean;
    processing_scaffolds?: boolean;
    attention_guides?: boolean;
    // Ajouté pour le DynamicAdaptationSystem
    type?: string;
    techniques?: string[];
    resources?: string[];
}

export interface PatternInfo {
    id: string;
    name: string;
    description: string;
    confidence: number;
}

export interface PeerRoles {
    facilitators: string[];
    resource_sharers: string[];
    support_providers: string[];
}

export interface PeerRole {
    role: string;
    responsibilities: string[];
    supportLevel: string;
}

export interface MaterialsInfo {
    adapted_content: boolean;
    multi_modal_resources: boolean;
    peer_created_content: boolean;
}

export interface SharedMaterial {
    id: string;
    type: string;
    format: string;
    accessibilityFeatures: string[];
}

export interface LearningPhase {
    id: string;
    name: string;
    duration: number;
    objectives: string[];
}

// Interfaces de base pour les sessions
export interface LearningSession {
    id: string;
    studentId: string;
    startTime: number;
    duration: number;
    content: {
        topic: string;
        difficulty: number;
        format: string;
    };
    progress: {
        completedSections: string[];
        score: number;
        pace: number;
    };
    environment: {
        setting: string;
        distractions: number;
        support: string[];
    };
    specialNeeds?: {
        type: string[];
        accommodations: string[];
        preferences: Record<string, unknown>;
    };
}

export interface DynamicSession extends LearningSession {
    realTimeData: {
        attention: number[];
        fatigue: number[];
        comprehension: number[];
        engagement: number[];
        timestamps: number[];
    };
    adaptations: {
        applied: string[];
        effective: string[];
        rejected: string[];
    };
}

// Interfaces pour les options
export interface PredictionOptions {
    prediction_focus: string;
    time_horizon?: number;
    confidence_threshold?: number;
    adaptation_types?: string[];
}

export interface DynamicAdaptationOptions {
    optimization_priority?: string;
    support_level?: SupportLevel;
    responsiveness?: Responsiveness;
    adaptation_strength?: number;
}

// Interfaces pour les résultats et données
export interface FatigueAlert {
    time?: number;
    level: FatigueLevel;
    confidence?: number;
    description?: string;
    timestamp?: string;
}

export interface InterventionPoint {
    time?: number;
    type: InterventionType;
    action?: InterventionAction;
    description?: string;
    priority?: string;
    timestamp?: string;
}

export interface Pattern {
    type?: PatternType;
    severity?: PatternSeverity;
    timing?: PatternTiming;
    fluctuation?: FluctuationType;
    triggers?: string[];
    pattern?: SpeedPattern;
    factors?: string[];
    id?: string;
    name?: string;
    description?: string;
    confidence?: number;
}

export interface PhaseInfo {
    type: PhaseType;
    timing: PhaseTiming;
}

export interface PeerMatch {
    pair: string[];
    complementarity: number;
}

// Interfaces composées pour les résultats complexes
export interface FatiguePrediction {
    fatigue_alerts?: FatigueAlert[];
    intervention_points?: InterventionPoint[];
    patterns?: Pattern[];
    recommendations?: Recommendation[];
    nextPhase?: PhaseInfo | LearningPhase;
    accuracy?: number;
    reliability?: number;
    confidence?: number;
}

// Remplacé l'interface vide par un type pour éviter l'erreur
// "An interface declaring no members is equivalent to its supertype"
export type PredictionData = FatiguePrediction & {
    // Propriétés supplémentaires peuvent être ajoutées ici à l'avenir
    predictionSource?: 'REALTIME' | 'HISTORICAL' | 'COMBINED';
};

export interface AssistanceMeasures {
    preventive_measures: PreventiveMeasure[];
    cognitive_support: CognitiveSupport;
}

// Remplacé l'interface vide par un type pour éviter l'erreur
// "An interface declaring no members is equivalent to its supertype"
export type AssistanceData = AssistanceMeasures & {
    // Propriétés supplémentaires peuvent être ajoutées ici à l'avenir
    assistanceMode?: 'PROACTIVE' | 'REACTIVE' | 'MIXED';
};

export interface ContextAnalysisResult {
    environmental: EnvironmentalOptimizations;
    learner: LearnerAccommodations;
}

export interface PeerSupportStructure {
    matches: PeerMatch[];
    roles: PeerRoles;
}

export interface ResourceAllocation {
    materials: MaterialsInfo;
}

// Interface principale pour les résultats des fonctionnalités avancées
export interface AdvancedFeaturesResult {
    predictions: FatiguePrediction;
    assistance: {
        preventive_measures: PreventiveMeasure[];
        effectiveness: {
            overall: number;
            environmental?: number;
            learning?: number;
        };
        responsiveness?: Responsiveness;
    };
    patterns?: {
        identified: Pattern[];
    };
    recommendations?: Recommendation[];
    confidence?: number;
    contextAwareness?: {
        environmental: {
            optimizations: EnvironmentalOptimizations | EnvironmentalOptimization;
        };
        learner: {
            accommodations: LearnerAccommodations | LearnerAccommodation;
            cognitive_support?: CognitiveSupport;
        };
    };
    assistanceDelivery?: {
        timing: string;
        strategy: AssistanceStrategy;
    };
    effectiveness?: {
        environmental?: number;
        learning?: number;
        participation?: number;
        skill_exchange?: number;
    };
    peerSupport?: {
        matches: PeerMatch[];
        roles: PeerRoles | PeerRole;
    };
    resources?: {
        shared_materials: MaterialsInfo | SharedMaterial;
        accessibility: AccessibilityLevel;
    };
    collaboration: {
        success_rate: number;
    };
    integration: {
        harmony_score: number;
        stability: StabilityStatus;
    };
}