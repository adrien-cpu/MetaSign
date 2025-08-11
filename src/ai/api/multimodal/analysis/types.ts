// src/ai/api/multimodal/analysis/types.ts

// Contextes de Fusion
export interface FusionContext {
    emotional: EmotionalState;
    intentional: IntentData;
    situational: SituationContext;
    confidence: number;
}

// États et Données de Base
export interface EmotionalState {
    primary: string;
    intensity: number;
    valence: number;
    confidence: number;
}

export interface IntentData {
    type: string;
    confidence: number;
    context: Record<string, unknown>;
}

// Environnement et Contexte
export interface EnvironmentInfo {
    type: string;
    conditions: EnvironmentConditions;
    constraints: EnvironmentConstraints;
}

interface EnvironmentConditions {
    lighting: string;
    noise: string;
    space: string;
    distractions: string[];
}

interface EnvironmentConstraints {
    maxDistance: number;
    minLighting: number;
    maxNoiseLevel: number;
}

// Participants et Préférences
export interface ParticipantInfo {
    id: string;
    role: string;
    state: ParticipantState;
    preferences: UserPreferences;
}

interface ParticipantState {
    attention: number;
    engagement: number;
    understanding: number;
}

interface UserPreferences {
    signLanguage: string;
    communicationStyle: string;
    adaptations: string[];
}

// Interaction et Contexte
export interface InteractionState {
    phase: string;
    progress: number;
    efficiency: number;
    issues: string[];
}

export interface ContextualData {
    priority: number;
    complexity: number;
    timeConstraints: TimeConstraints;
    requirements: string[];
}

interface TimeConstraints {
    maxDuration: number;
    responseWindow: number;
    processingTime: number;
}

// Situation et Synchronisation
export interface SituationContext {
    environment: EnvironmentInfo;
    participants: ParticipantInfo[];
    interaction: InteractionState;
    context: ContextualData;
    urgency: number;
}

export interface SynchronizedModalities {
    lsf: LSFModality;
    vocal: VocalModality;
    synchronizationScore: number;
    alignmentMetadata: AlignmentMetadata;
}

// Modalités LSF
export interface LSFModality {
    gestures: GestureSequence;
    facial: FacialExpressions;
    temporal: TemporalMarkers;
    content?: Record<string, unknown>;
    timing?: TimingData;
}

export interface GestureSequence {
    movements: Movement[];
    intensity: number;
    duration: number;
}

export type Movement = {
    type: string;
    duration: number;
    intensity: number;
    direction: string;
}

export interface FacialExpressions {
    expressions: string[];
    intensity: number;
    timing: number[];
}

export interface TemporalMarkers {
    markers: string[];
    positions: number[];
}

// Modalités Vocales
export interface VocalModality {
    speech: AudioStream;
    prosody: ProsodyMarkers;
    timing: TimingData;
    content?: Record<string, unknown>;
}

export interface AudioStream {
    data: Float32Array;
    sampleRate: number;
    duration: number;
}

export interface ProsodyMarkers {
    pitch: number[];
    intensity: number[];
    rhythm: number[];
}

// Timing et Alignement
export interface TimingData {
    start: number;
    end: number;
    markers: Record<string, number>;
}

export interface AlignmentMetadata {
    offset: number;
    confidence: number;
    synchronizationPoints: number[];
}