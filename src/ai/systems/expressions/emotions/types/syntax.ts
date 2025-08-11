import type { LSFExpression } from './lsf';

export interface EmotionSyntax {
  rules: SyntaxRule[];
  structure: SyntaxStructure;
  constraints: SyntaxConstraint[];
}

export interface SyntaxRule {
  id: string;
  type: SyntaxRuleType;
  priority: number;
  conditions: SyntaxCondition[];
  actions: SyntaxAction[];
}

export interface SyntaxStructure {
  base: StructureComponent;
  modifiers: StructureComponent[];
  ordering: OrderingRule[];
}

export interface SyntaxConstraint {
  type: ConstraintType;
  target: string;
  parameters: Record<string, unknown>; // Specify a different type
  validation: ValidationRule[];
}

export interface SyntaxCondition {
  type: 'emotional' | 'contextual' | 'temporal' | 'spatial';
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: unknown; // Specify a different type
  parameters?: Record<string, unknown>; // Specify a different type
}

export interface SyntaxAction {
  type: ActionType;
  target: string;
  parameters: Record<string, unknown>; // Specify a different type
}

export interface StructureComponent {
  id: string;
  type: ComponentType;
  required: boolean;
  position: number;
  elements: LSFExpression[];
}

export interface OrderingRule {
  before: string[];
  after: string[];
  concurrent?: string[];
}

export interface ValidationRule {
  property: string;
  condition: string;
  value: unknown; // Specify a different type
  severity: 'error' | 'warning' | 'info';
}

export type SyntaxRuleType =
  | 'sequence'
  | 'modification'
  | 'combination'
  | 'transformation';

export type ConstraintType =
  | 'temporal'
  | 'spatial'
  | 'emotional'
  | 'coordination';

export type ActionType =
  | 'add'
  | 'remove'
  | 'modify'
  | 'reorder';

export type ComponentType =
  | 'core'
  | 'modifier'
  | 'intensifier'
  | 'connector';

export interface SyntaxValidationResult {
  isValid: boolean;
  score: number;
  violations: SyntaxViolation[];
  suggestions: SyntaxSuggestion[];
}

export interface SyntaxViolation {
  rule: string;
  component: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: number;
}

export interface SyntaxSuggestion {
  type: string;
  description: string;
  changes: SyntaxAction[];
  priority: number;
}
