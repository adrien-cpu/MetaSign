// src/ai/systems/expressions/emotions/syntax/index.ts

// Export non-type items from types.ts
export { EmotionType } from './types';

// Export classes from implementation files
export * from './LSFEmotionSyntaxSystem';
export * from './LSFEmotionSyntaxController';

// Export types with "export type" syntax for isolatedModules compatibility
export type {
  LSFExpression,
  SystemeControleEthique,
  SystemeExpressions,
  SystemeEmotionnel,
  SyntacticContext,
  ValidationResult,
  ValidationIssue,
  ControlledExpression,
  CustomEyebrowComponent,
  CustomMouthComponent,
  CustomEyeComponent,
  Coordinates,
  SpatialReference,
  HandshapeConfiguration,
  HandshapeMovement,
  Handshape,
  Location,
  Timing,
  Metadata,
  EmotionSyntaxParameters,
  EmotionEmphasis,
  EmotionSyntaxResult,
  EmotionSyntaxElement,
  SyntacticConstraint
} from './types';

// Define and export additional interfaces needed
export type SyntaxRule = {
  id: string;
  name: string;
  conditions: SyntaxCondition[];
  actions: SyntaxAction[];
  priority: number;
};

export type SyntaxCondition = {
  type: string;
  target: string;
  operator: string;
  value: unknown;
};

export type SyntaxAction = {
  type: string;
  target: string;
  operation: string;
  value: unknown;
};

export type EmotionSyntaxMetadata = {
  ruleIds: string[];
  modifications: Record<string, unknown>;
  originalValues: Record<string, unknown>;
};

export type SyntaxControlResult = {
  success: boolean;
  modifiedExpression?: unknown;
  metadata?: EmotionSyntaxMetadata;
  issues?: string[];
};

export type SyntaxComponent = {
  id: string;
  type: string;
  role: GrammaticalRole;
  position?: SyntacticPosition;
};

// Export enums directly (they don't need "export type")
export enum GrammaticalRole {
  SUBJECT = 'subject',
  OBJECT = 'object',
  VERB = 'verb',
  MODIFIER = 'modifier',
  CONNECTOR = 'connector'
}

export enum SyntacticPosition {
  INITIAL = 'initial',
  MEDIAL = 'medial',
  FINAL = 'final'
}

export enum ScopeType {
  LOCAL = 'local',
  GLOBAL = 'global',
  CONTEXTUAL = 'contextual'
}