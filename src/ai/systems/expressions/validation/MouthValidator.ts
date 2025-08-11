// src/ai/systems/expressions/validation/MouthValidator.ts

type MouthShape = 'neutral' | 'smile' | 'frown' | 'open' | 'closed' | 'slightly_open' | 'pursed';

interface MouthConfig {
  shape: MouthShape;
  tension: number;
  grammaticalContext?: 'question_yn' | 'negation' | 'affirmation';
}

interface MouthRule {
  allowedShapes: MouthShape[];
  maxTension?: number;
  minTension?: number;
  contextRules?: Record<string, MouthShape[]>;
}

interface ValidationIssue {
  component: 'mouth';
  message: string;
  severity: 'warning' | 'error';
}

interface LSFGrammaticalRules {
  question_yn: MouthShape[];
  negation: MouthShape[];
  affirmation: MouthShape[];
}

export class MouthValidator {
  private readonly DEFAULT_TENSION_RANGE = {
    min: 0,
    max: 1
  };

  private readonly LSF_RULES: LSFGrammaticalRules = {
    question_yn: ['neutral', 'slightly_open'],
    negation: ['frown'],
    affirmation: ['neutral', 'smile']
  };

  validateMouth(rule: MouthRule, pattern: MouthConfig): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validation de la forme
    if (!rule.allowedShapes.includes(pattern.shape)) {
      issues.push({
        component: 'mouth',
        message: `Forme non autorisée: ${pattern.shape}`,
        severity: 'error'
      });
    }

    // Validation de la tension
    const minTension = rule.minTension ?? this.DEFAULT_TENSION_RANGE.min;
    const maxTension = rule.maxTension ?? this.DEFAULT_TENSION_RANGE.max;

    if (pattern.tension < minTension || pattern.tension > maxTension) {
      issues.push({
        component: 'mouth',
        message: `Tension invalide: ${pattern.tension}. Doit être entre ${minTension} et ${maxTension}`,
        severity: 'error'
      });
    }

    // Ajout des validations de contexte grammatical
    return [...issues, ...this.validateGrammaticalContext(pattern)];
  }

  private validateGrammaticalContext(pattern: MouthConfig): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (pattern.grammaticalContext) {
      const allowedShapes = this.LSF_RULES[pattern.grammaticalContext];
      if (!allowedShapes.includes(pattern.shape)) {
        issues.push({
          component: 'mouth',
          message: `Forme ${pattern.shape} non valide pour le contexte grammatical ${pattern.grammaticalContext}`,
          severity: 'error'
        });
      }
    }

    return issues;
  }
}