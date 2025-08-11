// src/ai/types/temporal.ts
import type { ValidationIssue } from './validators';

export type TransitionType = 'increasing' | 'decreasing' | 'constant';
export type SyncType = 'sequence' | 'transition' | 'simultaneity';
export type PatternType = 'sequence' | 'repetition' | 'alternation';
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface LSFExpression {
    [key: string]: Record<string, number>;
}

export interface TemporalTransition {
    sourceComponent: string;
    targetComponent: string;
    startTime: number;
    endTime: number;
    duration: number;
    type: TransitionType;
    easing: EasingType;
}

export interface RhythmPattern {
    patternType: PatternType;
    durations: number[];
    interval: number;
    intensity: number;
}

export interface SynchronizationPoint {
    involvedComponents: string[];
    timestamp: number;
    type: SyncType;
}

export interface TemporalMetadata {
    totalDuration: number;
    transitions: TemporalTransition[];
    syncPoints: SynchronizationPoint[];
    rhythmPatterns?: RhythmPattern[];
}

export interface TemporalContext {
    startTime: number;
    duration: number;
    constraints: TemporalConstraints;
    requirements: TemporalRequirements;
}

export interface TemporalConstraints {
    timing: {
        min: number;
        max: number;
        optimal: number;
    };
    transition: {
        minDuration: number;
        maxDuration: number;
        maxGap: number;
    };
    allowedTypes: TransitionType[];
}

export interface TemporalRequirements {
    minSyncPointCount: number;
    maxConcurrentTransitions: number;
    requiredPatternTypes: PatternType[];
    minDurationPerComponent: number;
}

export interface TransitionValidation {
    valid: boolean;
    issue?: ValidationIssue;
}