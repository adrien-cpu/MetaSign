// src/ai/feedback/validators/GrammaticalValidator.ts

import { FeedbackEntry } from '../types';
import {
  ValidationResult,
  ValidationIssue,
  ValidationIssueType,
  ValidationLocation
} from '../../types/validators';
import { LSFGrammarValidator } from '../../specialized/grammar/LSFGrammarValidator';
import { LSFEmotionSyntaxController } from '../../systems/expressions/emotions/syntax/LSFEmotionSyntaxController';

// Types de données pour les différentes violations
interface RuleViolation {
  impact: number;
  location: string;
  rule: string;
  explanation: string;
}

interface MorphologicalError {
  significance: number;
  element: string;
  description: string;
}

interface MarkerInconsistency {
  importance: number;
  marker: string;
  detail: string;
}

interface EmotionalConflict {
  criticality: number;
  type: string;
  elements: string[];
}

// Interfaces exportées pour les résultats de validation
export interface StructuralValidation {
  score: number;
  violations: RuleViolation[];
}

export interface MorphologyValidation {
  score: number;
  errors: MorphologicalError[];
}

export interface MarkerValidation {
  score: number;
  inconsistencies: MarkerInconsistency[];
}

export interface EmotionalValidation {
  score: number;
  conflicts: EmotionalConflict[];
}

// Définition des méthodes d'interface pour adapter les implémentations
interface GrammarValidatorAdapter {
  validateStructure(content: unknown): Promise<StructuralValidation>;
  validateMorphologicalRules(content: unknown): Promise<MorphologyValidation>;
  validateMarkers(content: unknown): Promise<MarkerValidation>;
}

interface EmotionSyntaxAdapter {
  validateEmotionalGrammar(content: unknown): Promise<EmotionalValidation>;
}

export class GrammaticalValidator {
  private grammarAdapter: GrammarValidatorAdapter;
  private emotionAdapter: EmotionSyntaxAdapter;

  constructor(
    private grammarValidator: LSFGrammarValidator,
    private syntaxSystem: LSFEmotionSyntaxController
  ) {
    // Création d'adaptateurs pour les implémentations externes
    this.grammarAdapter = this.createGrammarAdapter();
    this.emotionAdapter = this.createEmotionAdapter();
  }

  private createGrammarAdapter(): GrammarValidatorAdapter {
    return {
      validateStructure: () => this.fallbackStructureValidation(),
      validateMorphologicalRules: () => this.fallbackMorphologyValidation(),
      validateMarkers: () => this.fallbackMarkerValidation()
    };
  }

  private createEmotionAdapter(): EmotionSyntaxAdapter {
    return {
      validateEmotionalGrammar: () => this.fallbackEmotionalValidation()
    };
  }

  private fallbackStructureValidation(): Promise<StructuralValidation> {
    console.warn('Using fallback structure validation - implementation needed');
    return Promise.resolve({
      score: 0.5,
      violations: []
    });
  }

  private fallbackMorphologyValidation(): Promise<MorphologyValidation> {
    console.warn('Using fallback morphology validation - implementation needed');
    return Promise.resolve({
      score: 0.5,
      errors: []
    });
  }

  private fallbackMarkerValidation(): Promise<MarkerValidation> {
    console.warn('Using fallback marker validation - implementation needed');
    return Promise.resolve({
      score: 0.5,
      inconsistencies: []
    });
  }

  private fallbackEmotionalValidation(): Promise<EmotionalValidation> {
    console.warn('Using fallback emotional validation - implementation needed');
    return Promise.resolve({
      score: 0.5,
      conflicts: []
    });
  }

  async validate(feedback: FeedbackEntry): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.validateSyntacticStructure(feedback),
      this.validateMorphology(feedback),
      this.validateNonManualMarkers(feedback),
      this.validateEmotionalSyntax(feedback)
    ]);

    return this.aggregateValidations(validations);
  }

  private async validateSyntacticStructure(feedback: FeedbackEntry): Promise<ValidationResult> {
    const structureValidation = await this.grammarAdapter.validateStructure(feedback.content);
    return {
      isValid: structureValidation.score >= 0.8,
      issues: this.mapStructuralIssues(structureValidation.violations || []),
      score: structureValidation.score
    };
  }

  private async validateMorphology(feedback: FeedbackEntry): Promise<ValidationResult> {
    const morphologyValidation = await this.grammarAdapter.validateMorphologicalRules(feedback.content);
    return {
      isValid: morphologyValidation.score >= 0.75,
      issues: this.mapMorphologicalIssues(morphologyValidation.errors || []),
      score: morphologyValidation.score
    };
  }

  private async validateNonManualMarkers(feedback: FeedbackEntry): Promise<ValidationResult> {
    const markerValidation = await this.grammarAdapter.validateMarkers(feedback.content);
    return {
      isValid: markerValidation.score >= 0.85,
      issues: this.mapMarkerIssues(markerValidation.inconsistencies || []),
      score: markerValidation.score
    };
  }

  private async validateEmotionalSyntax(feedback: FeedbackEntry): Promise<ValidationResult> {
    const emotionValidation = await this.emotionAdapter.validateEmotionalGrammar(feedback.content);
    return {
      isValid: emotionValidation.score >= 0.7,
      issues: this.mapEmotionalIssues(emotionValidation.conflicts || []),
      score: emotionValidation.score
    };
  }

  private mapStructuralIssues(violations: RuleViolation[]): ValidationIssue[] {
    return violations.map(v => ({
      code: 'SYNTAX_ERROR',
      type: 'grammar' as ValidationIssueType,
      message: this.formatViolationDescription(v),
      severity: this.determineSeverity(v.impact),
      location: this.createLocation(v.location),
      component: 'syntactic_structure'
    }));
  }

  private mapMorphologicalIssues(errors: MorphologicalError[]): ValidationIssue[] {
    return errors.map(e => ({
      code: 'MORPHOLOGY_ERROR',
      type: 'grammar' as ValidationIssueType,
      message: this.formatErrorDescription(e),
      severity: this.determineSeverity(e.significance),
      location: this.createLocation(e.element),
      component: 'morphology'
    }));
  }

  private mapMarkerIssues(inconsistencies: MarkerInconsistency[]): ValidationIssue[] {
    return inconsistencies.map(i => ({
      code: 'MARKER_INCONSISTENCY',
      type: 'grammar' as ValidationIssueType,
      message: this.formatInconsistencyDescription(i),
      severity: this.determineSeverity(i.importance),
      location: this.createLocation(i.marker),
      component: 'non_manual_marker'
    }));
  }

  private mapEmotionalIssues(conflicts: EmotionalConflict[]): ValidationIssue[] {
    return conflicts.map(c => ({
      code: 'EMOTIONAL_CONFLICT',
      type: 'emotion' as ValidationIssueType,
      message: this.formatConflictDescription(c),
      severity: this.determineSeverity(c.criticality),
      location: this.createLocation(c.type),
      component: 'emotional_syntax'
    }));
  }

  private createLocation(path: string): ValidationLocation {
    return {
      property: path
    };
  }

  private determineSeverity(level: number): 'low' | 'medium' | 'high' {
    if (level < 0.3) return 'low';
    if (level < 0.7) return 'medium';
    return 'high';
  }

  private formatViolationDescription(violation: RuleViolation): string {
    return `Syntactic violation at ${violation.location}: ${violation.rule} - ${violation.explanation}`;
  }

  private formatErrorDescription(error: MorphologicalError): string {
    return `Morphological error in ${error.element}: ${error.description}`;
  }

  private formatInconsistencyDescription(inconsistency: MarkerInconsistency): string {
    return `Non-manual marker inconsistency: ${inconsistency.marker} - ${inconsistency.detail}`;
  }

  private formatConflictDescription(conflict: EmotionalConflict): string {
    return `Emotional syntax conflict: ${conflict.type} between ${conflict.elements.join(' and ')}`;
  }

  private aggregateValidations(validations: ValidationResult[]): ValidationResult {
    const allIssues = validations.flatMap(v => v.issues);
    const weightedScore = this.calculateWeightedScore(validations);

    return {
      isValid: validations.every(v => v.isValid),
      issues: this.prioritizeIssues(allIssues),
      score: weightedScore
    };
  }

  private calculateWeightedScore(validations: ValidationResult[]): number {
    const weights = {
      syntactic_structure: 0.35,
      morphology: 0.25,
      non_manual_marker: 0.25,
      emotional_syntax: 0.15
    };

    return validations.reduce((sum, v, i) =>
      sum + v.score * Object.values(weights)[i], 0);
  }

  private prioritizeIssues(issues: ValidationIssue[]): ValidationIssue[] {
    return issues
      .sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity))
      .slice(0, 10);
  }

  private getSeverityWeight(severity: 'low' | 'medium' | 'high'): number {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[severity];
  }
}