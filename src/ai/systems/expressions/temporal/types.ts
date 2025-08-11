// src/ai/systems/expressions/temporal/types.ts
export interface ComponentValue {
    intensity: number;
}

export interface TemporalTransition {
    sourceComponent: string;
    targetComponent: string;
    startTime: number;
    endTime: number;
    duration: number;
    type: TransitionType;
}

export type TransitionType = 'constant' | 'increasing' | 'decreasing';

export interface RhythmPattern {
    patternType: 'sequence' | 'repetition';
    durations: number[];
    interval: number;
}

export interface SynchronizationPoint {
    involvedComponents: string[];
    timestamp: number;
    syncType: 'transition' | 'simultaneity' | 'sequence';
}

export interface TemporalContext {
    currentTime: number;
    timeScale: number;
    referencePoint?: number;
}

export interface TemporalRequirements {
    minSyncPointCount: number;
    maxConcurrentTransitions: number;
    requiredPatternTypes: Array<'sequence' | 'repetition'>;
    minDurationPerComponent: number;
}

export interface TemporalMetadata {
    transitions: TemporalTransition[];
    synchronizationPoints: SynchronizationPoint[];
    totalDuration: number;
}

export interface TransitionValidation {
    valid: boolean;
}