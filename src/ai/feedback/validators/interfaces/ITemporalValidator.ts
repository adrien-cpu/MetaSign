import { FeedbackEntry, ValidationResult } from '../../types';
import { TemporalConfig } from '../../../emotions/types/config';

export interface ITemporalValidator {
  validateTiming(feedback: FeedbackEntry, config: TemporalConfig): Promise<ValidationResult>;
  validateTransitions(feedback: FeedbackEntry, config: TemporalConfig): Promise<ValidationResult>;
  validateRhythm(feedback: FeedbackEntry, config: TemporalConfig): Promise<ValidationResult>;
  validateDuration(feedback: FeedbackEntry, config: TemporalConfig): Promise<ValidationResult>;
}

export interface TemporalValidationContext {
  timingRules: TimingRule[];
  transitionRules: TransitionRule[];
  rhythmPatterns: RhythmPattern[];
  durationLimits: DurationLimits;
}

export interface TimingRule {
  id: string;
  type: TimingType;
  parameters: TimingParameters;
  constraints: TimingConstraint[];
}

export interface TimingParameters {
  minInterval: number;
  maxInterval: number;
  preferredPace: number;
  allowedVariance: number;
}

export interface TimingConstraint {
  type: 'sequence' | 'synchronization' | 'offset';
  target: string;
  value: number;
  tolerance: number;
}

export interface TransitionRule {
  id: string;
  fromState: string;
  toState: string;
  duration: {
    min: number;
    max: number;
    preferred: number;
  };
  curve: TransitionCurve;
}

export interface TransitionCurve {
  type: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  controlPoints?: number[];
}

export interface RhythmPattern {
  id: string;
  sequence: number[];
  tempo: {
    min: number;
    max: number;
    preferred: number;
  };
  emphasis: {
    positions: number[];
    intensity: number;
  };
}

export interface DurationLimits {
  minimum: number;
  maximum: number;
  optimal: number;
  tolerances: {
    short: number;
    medium: number;
    long: number;
  };
}

export type TimingType = 'onset' | 'offset' | 'interval' | 'duration';

export interface TemporalValidationResult extends ValidationResult {
  timingScore: number;
  transitionScore: number;
  rhythmScore: number;
  durationScore: number;
  details: {
    timingDeviations: TemporalDeviation[];
    transitionIssues: TemporalDeviation[];
    rhythmIrregularities: TemporalDeviation[];
    durationAnomalies: TemporalDeviation[];
  };
}

export interface TemporalDeviation {
  type: string;
  location: number;
  expected: number;
  actual: number;
  delta: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
}