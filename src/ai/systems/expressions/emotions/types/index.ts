//src/ai/systems/expressions/emotions/types/index.ts
// Re-export explicite des types pour éviter les ambiguïtés
export type {
  // Types de base
  EmotionState,
  EmotionalComponents,
  EmotionalDynamics,
  BaseEmotion,
  EmotionMapping
} from './base';

export type {
  LSFExpression,
  ManualComponent,
  NonManualComponent,
  SpatialComponent,
  TemporalComponent,
  FacialMarkers,
  HeadMovements,
  BodyPosture,
  LSFConfiguration
} from './lsf';

export type {
  ContextualEmotion,
  ContextualAdaptation,
  EmotionalContext,
  AdaptationCondition
} from './contextual';

export type {
  EmotionInput,
  LSFInput,
  CulturalContext,
  TemporalContext,
  SpatialConfig,
  SystemConfig,
  EmotionSystemConfig,
  LSFSystemConfig,
  ValidationConfig,
  ValidationRule as ConfigValidationRule
} from './config';

export type {
  EmotionSyntax,
  SyntaxRule,
  SyntaxStructure,
  SyntaxConstraint,
  SyntaxCondition,
  SyntaxAction,
  SyntaxValidationResult,
  ValidationRule as SyntaxValidationRule
} from './syntax';