// ./src/ai/systems/expressions/emotions/types/config.ts

export interface EmotionInput {
  type: string;
  intensity: number;
  duration: number;
  context: EmotionalContext;
}

export interface LSFInput {
  signs: string[];
  timing: number[];
  context: CulturalContext;
}

export interface EmotionalContext {
  mood: string;
  valence: number;
  arousal: number;
  dominance: number;
}

export interface CulturalContext {
  region: string;
  formalityLevel: number;
  specificRules?: string[];
}

export interface TemporalContext {
  duration: number;
  pace: number;
  transitions: TransitionPoint[];
}

export interface TransitionPoint {
  timestamp: number;
  type: string;
  parameters: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
}

export interface SpatialConfig {
  zones: {
    character: string[];
    emotional: string[];
  };
  transitions: 'fluid' | 'distinct' | 'blended';
}

export interface SystemConfig {
  emotion: EmotionSystemConfig;
  lsf: LSFSystemConfig;
  integration: IntegrationConfig;
}

export interface EmotionSystemConfig {
  components: EmotionalComponentConfig[];
  dynamics: EmotionalDynamicsConfig;
  validation: ValidationConfig;
}

export interface LSFSystemConfig {
  expressions: LSFExpressionConfig;
  synthesis: SynthesisConfig;
  validation: ValidationConfig;
}

export interface IntegrationConfig {
  mapping: MappingConfig;
  synchronization: SyncConfig;
  feedback: FeedbackConfig;
}

export interface EmotionalComponentConfig {
  type: string;
  weight: number;
  constraints: ComponentConstraint[];
}

export interface EmotionalDynamicsConfig {
  transitions: TransitionConfig[];
  timing: TimingConfig;
}

export interface ValidationConfig {
  rules: ValidationRule[];
  thresholds: Record<string, number>;
  handlers: ValidationHandler[];
}

export interface LSFExpressionConfig {
  components: LSFComponentConfig[];
  constraints: ExpressionConstraint[];
}

export interface SynthesisConfig {
  pipeline: SynthesisStage[];
  optimization: OptimizationConfig;
}

export interface MappingConfig {
  rules: MappingRule[];
  fallbacks: FallbackStrategy[];
}

export interface SyncConfig {
  strategy: string;
  parameters: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
}

export interface FeedbackConfig {
  channels: FeedbackChannel[];
  adaptation: AdaptationConfig;
}

export interface ComponentConstraint {
  property: string;
  condition: string;
  value: unknown; // Utilisation de 'unknown' au lieu de 'any'
}

export interface TransitionConfig {
  from: string;
  to: string;
  duration: number;
  easing: string;
}

export interface TimingConfig {
  defaultDuration: number;
  minDuration: number;
  maxDuration: number;
}

export interface ValidationRule {
  id: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  check: (input: unknown) => boolean; // Utilisation de 'unknown' au lieu de 'any'
}

export interface ValidationHandler {
  type: string;
  action: (violation: unknown) => void; // Utilisation de 'unknown' au lieu de 'any'
}

export interface LSFComponentConfig {
  type: string;
  required: boolean;
  constraints: ComponentConstraint[];
}

export interface ExpressionConstraint {
  target: string;
  condition: string;
  value: unknown; // Utilisation de 'unknown' au lieu de 'any'
}

export interface SynthesisStage {
  name: string;
  processor: string;
  config: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
}

export interface OptimizationConfig {
  target: string;
  parameters: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
}

export interface MappingRule {
  source: string;
  target: string;
  transform: (input: unknown) => unknown; // Utilisation de 'unknown' au lieu de 'any'
}

export interface FallbackStrategy {
  condition: string;
  action: string;
}

export interface FeedbackChannel {
  type: string;
  priority: number;
  config: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
}

export interface AdaptationConfig {
  strategy: string;
  parameters: Record<string, unknown>; // Utilisation de 'unknown' au lieu de 'any'
}
