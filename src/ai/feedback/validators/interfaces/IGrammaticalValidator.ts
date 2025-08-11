import { FeedbackEntry } from '../../types';
import { ValidationResult } from '../../../types/validators';
import { LSFExpression } from '../../../systems/expressions/emotions/lsf/types';

export interface IGrammaticalValidator {
  /**
   * Valide la structure grammaticale complète
   */
  validate(feedback: FeedbackEntry): Promise<ValidationResult>;

  /**
   * Valide la structure syntaxique
   */
  validateSyntacticStructure(feedback: FeedbackEntry): Promise<ValidationResult>;

  /**
   * Valide la morphologie
   */
  validateMorphology(feedback: FeedbackEntry): Promise<ValidationResult>;

  /**
   * Valide les marqueurs non-manuels
   */
  validateNonManualMarkers(feedback: FeedbackEntry): Promise<ValidationResult>;

  /**
   * Valide la syntaxe émotionnelle
   */
  validateEmotionalSyntax(feedback: FeedbackEntry): Promise<ValidationResult>;
}

export interface GrammaticalContext {
  rules: GrammaticalRule[];
  constraints: GrammaticalConstraint[];
}

export interface GrammaticalRule {
  type: string;
  pattern: unknown;
  severity: 'low' | 'medium' | 'high';
}

export interface GrammaticalConstraint {
  type: string;
  value: unknown;
  mandatory: boolean;
}

export interface GrammaticalIssue {
  type: string;
  location: string;
  expected: unknown;
  actual: unknown;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface GrammaticalViolation {
  ruleId: string;
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedFix?: string;
}

export interface GrammaticalValidationResult extends ValidationResult {
  structureScore: number;
  morphologyScore: number;
  markersScore: number;
  emotionalScore: number;
  syntaxScore: number;
  nonManualScore: number;
  details: {
    structuralIssues: GrammaticalIssue[];
    morphologicalIssues: GrammaticalIssue[];
    markerIssues: GrammaticalIssue[];
    emotionalIssues: GrammaticalIssue[];
    // Nouvelles propriétés pour unifier les deux définitions
    syntaxViolations: GrammaticalViolation[];
    morphologyErrors: GrammaticalViolation[];
    markerInconsistencies: GrammaticalViolation[];
    emotionalConflicts: GrammaticalViolation[];
  };
}

export interface LSFGrammaticalValidator {
  validateSyntacticStructure(expression: LSFExpression): Promise<ValidationResult>;
  validateMorphology(expression: LSFExpression): Promise<ValidationResult>;
  validateNonManualMarkers(expression: LSFExpression): Promise<ValidationResult>;
  validateEmotionalSyntax(expression: LSFExpression): Promise<ValidationResult>;
}

export interface GrammaticalValidationContext {
  syntaxRules: SyntaxRule[];
  morphologyRules: MorphologyRule[];
  nonManualRules: NonManualRule[];
  emotionalRules: EmotionalSyntaxRule[];
}

export interface SyntaxRule {
  id: string;
  pattern: string;
  constraints: SyntaxConstraint[];
  priority: number;
}

export interface SyntaxConstraint {
  type: 'order' | 'agreement' | 'dependency';
  parameters: Record<string, unknown>;
}

export interface MorphologyRule {
  id: string;
  category: 'handshape' | 'movement' | 'location' | 'orientation';
  transformations: MorphologicalTransformation[];
}

export interface MorphologicalTransformation {
  condition: string;
  changes: {
    feature: string;
    value: unknown;
  }[];
}

export interface NonManualRule {
  id: string;
  component: 'facial' | 'head' | 'body';
  markers: NonManualMarker[];
  combinations: MarkerCombination[];
}

export interface NonManualMarker {
  name: string;
  features: string[];
  intensity: number;
  duration: number;
}

export interface MarkerCombination {
  markers: string[];
  compatibility: boolean;
  constraints?: Record<string, unknown>;
}

export interface EmotionalSyntaxRule {
  id: string;
  emotionType: string;
  requiredMarkers: string[];
  prohibitedMarkers: string[];
  intensityMapping: Record<string, number>;
}