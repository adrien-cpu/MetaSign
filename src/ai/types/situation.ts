// src/ai/types/situation.ts

export interface EnvironmentCondition {
    value: string | number | boolean;
    unit?: string;
    threshold?: number;
    range?: [number, number];
}

export interface SituationContext {
    environment: string;
    participants: string[];
    interaction: InteractionState;
    context: ContextualData;
    metadata: Record<string, unknown>;
}

export interface EnvironmentInfo {
    type: string;
    conditions: Record<string, EnvironmentCondition>;
    constraints: string[];
}

export interface ParticipantAttribute {
    value: string | number | boolean;
    category?: string;
    priority?: number;
    lastUpdate?: Date;
}

export interface ParticipantInfo {
    id: string;
    role: string;
    state: string;
    attributes: Record<string, ParticipantAttribute>;
}

export interface InteractionState {
    type: string;
    status: string;
    participants: string[];
    progress: number;
}

export interface ContextAttribute {
    value: string | number | boolean;
    timestamp?: number;
    confidence?: number;
    source?: string;
}

export interface ContextualData {
    timestamp: number;
    location: string;
    attributes: Record<string, ContextAttribute>;
}

export interface SituationParameters {
    duration: number;
    intensity: number;
    context: Record<string, unknown>;
}

export interface SituationMetrics {
    success: number;
    performance: number;
    feedback: Record<string, unknown>;
}

export interface Situation {
    context: SituationContext;
    parameters: SituationParameters;
    metrics: SituationMetrics;
}