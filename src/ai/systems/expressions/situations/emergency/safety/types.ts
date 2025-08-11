// src/ai/systems/expressions/situations/emergency/safety/types.ts

export interface EvacuationSituation {
    urgency: number;
    type: string;
    location: string;
    affectedArea: string;
}

export interface Environment {
    type: string;
    conditions: {
        lighting: string;
        visibility: string;
        obstacles: string[];
    };
}

export interface Population {
    count: number;
    demographics: {
        mobilityImpaired: number;
        visuallyImpaired: number;
    };
    distribution: {
        areas: Record<string, number>;
    };
}

export interface VisualConstraints {
    minimumSize: number;
    contrastLevel: number;
    viewingDistance: number;
}

export interface AvailableResources {
    personnel: number;
    equipment: string[];
    communicationSystems: string[];
}

export interface ContextualConstraints {
    spatialLimitations: string[];
    timeConstraints: {
        maxDuration: number;
        responseWindow: number;
    };
    environmentalFactors: string[];
}

export interface SignalSpecs {
    intensity: number;
    duration: number;
    repetition: number;
    spacing: number;
}

export interface Adaptation {
    type: string;
    parameters: AdaptationParameters;
    priority: number;
}

export interface EffectivenessMetrics {
    visibility: number;
    comprehension: number;
    responsiveness: number;
}

export interface SelectedSignals {
    primary: SignalDefinition;
    secondary?: SignalDefinition[];
}

export interface AdaptedSignals extends SelectedSignals {
    adaptations: Adaptation[];
}

export interface SignalDefinition {
    type: string;
    components: {
        manual: ManualComponents;
        nonManual: NonManualComponents;
    };
    timing: TimingParameters;
}

interface ManualComponents {
    handshape: string;
    movement: MovementParameters;
    orientation: string;
    location: string;
}

interface NonManualComponents {
    facial: FacialParameters;
    head: HeadParameters;
    body: BodyParameters;
}

interface MovementParameters {
    type: string;
    speed: string;
    repetitions: number;
    amplitude: string;
}

interface FacialParameters {
    eyebrows: string;
    eyes: string;
    mouth: string;
}

interface HeadParameters {
    type: string;
    intensity: string;
    repetition: string;
}

interface BodyParameters {
    stance: string;
    tension: string;
    orientation: string;
}

interface TimingParameters {
    duration: number;
    pauseBetween: number;
    completionMarker: string;
}

export interface ValidationResult {
    isValid: boolean;
    issues?: string[];
    score: number;
}

export interface SignalContext {
    environment: Environment;
    population: Population;
    constraints: VisualConstraints;
    resources: AvailableResources;
}

export interface SignalRequirements {
    urgency: number;
    constraints: ContextualConstraints;
    requirements: SignalSpecs;
}

export interface EvacuationSignal {
    signals: AdaptedSignals;
    metadata: {
        urgency_level: number;
        context_adaptations: Adaptation[];
        effectiveness_metrics: EffectivenessMetrics;
    };
}

export interface AdaptationParameters {
    contrast?: string;
    size?: string;
    speed?: string;
    amplitude?: string;
    emphasis?: string;
    repetition?: string;
    intensity?: string;
    duration?: number;
    timing?: {
        interval?: number;
        pause?: number;
    };
    visibility?: {
        enhancement?: string;
        mode?: string;
    };
}

export interface Adaptation {
    type: string;
    parameters: AdaptationParameters;
    priority: number;
}