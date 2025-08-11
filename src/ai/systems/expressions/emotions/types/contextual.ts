//src/ai/systems/expressions/emotions/types/contextual.ts
import type { EmotionalComponents } from './base';

export interface ContextualEmotion {
  base: EmotionalComponents;
  context: EmotionalContext;
  adaptations: ContextualAdaptation[];
}

export interface EmotionalContext {
  mood: string;
  valence: number;
  arousal: number;
  dominance: number;
  intensity: number;
  duration: number;
}

export interface ContextualAdaptation {
  type: AdaptationType;
  parameters: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
  priority: number;
  conditions: AdaptationCondition[];
}

export interface AdaptationCondition {
  type: 'mood' | 'valence' | 'arousal' | 'dominance' | 'custom';
  operator: 'equals' | 'greater' | 'less' | 'between';
  value: number | [number, number];
  threshold?: number;
}

export type AdaptationType =
  | 'intensity'
  | 'duration'
  | 'facial'
  | 'gestural'
  | 'temporal'
  | 'spatial';

export interface ContextualValidation {
  isValid: boolean;
  score: number;
  adaptations: ValidationResult[];
}

export interface ValidationResult {
  type: string;
  success: boolean;
  score: number;
  details?: string;
}
