//src/ai/systems/expressions/emotions/contextual/types/contextual.types.ts
import { EmotionalComponents, EmotionalDynamics } from '@ai/systems/expressions/emotions/types/base';
import { CulturalContext } from '@ai/specialized/spatial/types';

// Types pour les contextes
export interface SocialContext {
    setting: 'professional' | 'academic' | 'social' | 'intimate';
    participants: {
        authority?: boolean;
        intimacy?: number;
        familiarity?: number;
        hierarchyLevel?: number;
        count?: number;
    };
    purpose: 'informative' | 'persuasive' | 'expressive' | 'social';
    environment?: {
        noiseLevel?: number;
        distractionLevel?: number;
        constraints?: string[];
        technology?: Record<string, number>;
    };
}

export interface NarrativeContext {
    type: string;
    plot?: string[];
    themes?: string[];
    settings?: string[];
    tone?: string;
    emotionalArcs?: {
        name: string;
        start: number;
        peak: number;
        end: number;
        intensity: number;
    }[];
    characters?: {
        id: string;
        emotionalState: string;
        intensity: number;
        relation: string;
    }[];
}

export interface TemporalContext {
    duration?: number;
    tempo?: string;
    transitions?: {
        name: string;
        timing: number;
        intensity: number;
    }[];
    rhythms?: {
        name: string;
        pattern: string;
        speed: number;
    }[];
}

export interface ContextualInformation {
    social: SocialContext;
    narrative: NarrativeContext;
    cultural: CulturalContext;
    temporal: TemporalContext;
}

// Types pour les émotions
export interface EmotionState {
    type: string;
    intensity: number;
    components: EmotionalComponents;
    dynamics: EmotionalDynamics;
    metadata?: Record<string, unknown>;
}

export interface AdaptedEmotion {
    emotion: EmotionState;
    metadata: {
        contextualRelevance: number;
        adaptationQuality: number;
        culturalAuthenticity: number;
    };
}

// Types pour les adaptations
export interface ExpressionAdjustments {
    facial: Record<string, unknown>;
    gestural: Record<string, unknown>;
    postural: Record<string, unknown>;
}

export interface TemporalModifications {
    duration: Record<string, unknown>;
    transitions: Record<string, unknown>;
    rhythm: Record<string, unknown>;
}

export interface AdaptationPlan {
    intensityModulation: number;
    expressionAdjustments: ExpressionAdjustments;
    temporalModifications: TemporalModifications;
}

// Types pour la validation
export interface ValidationIssue {
    code: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    details: Record<string, unknown>;
}

export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    score: number;
}

// Types pour les scores
export interface AdaptationScores {
    intensityPreservation: number;
    componentCoherence: number;
    dynamicSmoothing: number;
}

export interface AuthenticityScores {
    culturalAlignment: number;
    expressionAuthenticity: number;
    contextualFit: number;
}

export interface CoherenceScores {
    spatialCoherence: number;
    temporalCoherence: number;
    expressionCoherence: number;
}

// Types pour les analyseurs
export interface RelationshipDynamics {
    intimacy: number;
    familiarity: number;
    hierarchyLevel: number;
    groupSize: number;
}

export interface EnvironmentalFactors {
    noiseLevel: number;
    distractionLevel: number;
    physicalConstraints: string[];
    technologicalFactors: Record<string, number>;
}

export interface SocialAnalysis {
    formalityLevel: number;
    relationshipDynamics: RelationshipDynamics;
    environmentalFactors: EnvironmentalFactors;
}

export interface StoryElements {
    plotPoints: string[];
    themes: string[];
    settings: string[];
    tone: string;
}

export interface EmotionalArc {
    name: string;
    startPoint: number;
    peakPoint: number;
    endPoint: number;
    intensity: number;
}

export interface CharacterDynamics {
    characterId: string;
    emotionalState: string;
    intensity: number;
    relationToNarrator: string;
}

export interface NarrativeAnalysis {
    storyElements: StoryElements;
    emotionalArcs: EmotionalArc[];
    characterDynamics: CharacterDynamics[];
}

export interface CulturalAnalysis {
    culturalNorms: string[];
    traditionalElements: Record<string, number>;
    modernAdaptations: Record<string, number>;
}

export interface TimingPattern {
    name: string;
    duration: number;
    tempo: string;
}

export interface TransitionPoint {
    name: string;
    timing: number;
    intensity: number;
}

export interface RhythmicStructure {
    name: string;
    pattern: string;
    speed: number;
}

export interface TemporalAnalysis {
    timingPatterns: TimingPattern[];
    transitionPoints: TransitionPoint[];
    rhythmicStructures: RhythmicStructure[];
}

export interface ContextAnalysis {
    socialFactors: SocialAnalysis;
    narrativeElements: NarrativeAnalysis;
    culturalConsiderations: CulturalAnalysis;
    temporalPatterns: TemporalAnalysis;
}