import { ValidationResult } from './validation';

export interface EmotionalAnalysis {
  intensity: number;
  valence: number;
  arousal: number;
  dominance: number;
  confidence: number;
}

export interface CulturalValidationResult extends ValidationResult {
  regionalScore: number;
  formalityScore: number;
  specificityScore: number;
  adaptationScore: number;
}

export interface SpatialAnalysis {
  coherenceScore: number;
  validationResults: ValidationResult[];
  zoneUsage: Map<string, number>;
  transitions: TransitionAnalysis[];
}

export interface TemporalAnalysis {
  duration: number;
  paceScore: number;
  transitionScores: number[];
  rhythmScore: number;
}

export interface TransitionAnalysis {
  fromZone: string;
  toZone: string;
  duration: number;
  smoothness: number;
}