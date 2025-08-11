// src/ai/systems/expressions/analysis/LSFPatternValidator.ts
export class LSFPatternValidator {
  private readonly VALIDATION_RULES = {
    REPETITION: {
      naturalness: {
        minSpeed: 0.3,
        maxSpeed: 0.8,
        rhythmVariation: 0.2
      },
      quality: {
        minSimilarity: 0.85,
        maxDeviation: 0.15
      },
      cultural: {
        emphasisRequired: new Set(['INTENSITY', 'NEGATION', 'QUANTITY']),
        contextDependent: new Set(['QUESTION', 'CONDITION'])
      }
    },
    ALTERNATION: {
      symmetry: {
        minBalance: 0.9,
        maxAsymmetry: 0.1
      },
      timing: {
        minRegularity: 0.8,
        maxPauseDuration: 0.3
      }
    },
    CIRCULAR: {
      geometry: {
        minCircularity: 0.85,
        maxEccentricity: 0.2
      },
      fluidity: {
        minSmoothness: 0.9,
        maxAngularity: 0.15
      }
    }
  };

  async validatePattern(
    pattern: DetectedPattern,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    
    // Validation de base du pattern
    const baseValidation = await this.validateBasePattern(pattern);
    issues.push(...baseValidation.issues);

    // Validation spécifique selon le type
    switch (pattern.type) {
      case 'REPETITION':
        const repValidation = await this.validateRepetition(pattern, context);
        issues.push(...repValidation);
        break;
      case 'ALTERNATION':
        const altValidation = await this.validateAlternation(pattern, context);
        issues.push(...altValidation);
        break;
      case 'CIRCULAR':
        const circValidation = await this.validateCircularMotion(pattern, context);
        issues.push(...circValidation);
        break;
    }

    // Validation culturelle
    const culturalIssues = await this.validateCulturalContext(pattern, context);
    issues.push(...culturalIssues);

    return {
      isValid: issues.length === 0,
      issues,
      confidence: this.calculateValidationConfidence(issues),
      suggestions: this.generateSuggestions(issues)
    };
  }

  private async validateRepetition(
    pattern: DetectedPattern,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const rules = this.VALIDATION_RULES.REPETITION;

    // Vérifier la naturalité du rythme
    const speed = this.calculatePatternSpeed(pattern);
    if (speed < rules.naturalness.minSpeed || speed > rules.naturalness.maxSpeed) {
      issues.push({
        type: 'RHYTHM_ERROR',
        severity: 'high',
        message: 'Repetition speed outside natural range',
        details: { speed, expected: `${rules.naturalness.minSpeed}-${rules.naturalness.maxSpeed}` }
      });
    }

    // Vérifier la régularité des répétitions
    const rhythmVariation = this.calculateRhythmVariation(pattern);
    if (rhythmVariation > rules.naturalness.rhythmVariation) {
      issues.push({
        type: 'IRREGULARITY',
        severity: 'medium',
        message: 'Irregular rhythm in repetition',
        details: { variation: rhythmVariation }
      });
    }

    // Vérifier si l'emphase est appropriée au contexte
    if (rules.cultural.emphasisRequired.has(context.intent)) {
      const hasEmphasis = this.checkEmphasisPresence(pattern);
      if (!hasEmphasis) {
        issues.push({
          type: 'MISSING_EMPHASIS',
          severity: 'high',
          message: `Emphasis required for ${context.intent} context`,
          details: { intent: context.intent }
        });
      }
    }

    return issues;
  }

  private async validateAlternation(
    pattern: DetectedPattern,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const rules = this.VALIDATION_RULES.ALTERNATION;

    // Vérifier la symétrie des mouvements
    const symmetryScore = this.calculateSymmetry(pattern);
    if (symmetryScore < rules.symmetry.minBalance) {
      issues.push({
        type: 'ASYMMETRY_ERROR',
        severity: 'high',
        message: 'Alternating movements lack symmetry',
        details: { symmetry: symmetryScore }
      });
    }

    // Vérifier la régularité temporelle
    const timing = this.analyzeAlternationTiming(pattern);
    if (timing.regularity < rules.timing.minRegularity) {
      issues.push({
        type: 'TIMING_ERROR',
        severity: 'medium',
        message: 'Irregular timing in alternation',
        details: timing
      });
    }

    return issues;
  }

  private async validateCircularMotion(
    pattern: DetectedPattern,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const rules = this.VALIDATION_RULES.CIRCULAR;

    // Vérifier la géométrie du mouvement
    const geometry = this.analyzeCircularGeometry(pattern);
    if (geometry.circularity < rules.geometry.minCircularity) {
      issues.push({
        type: 'GEOMETRY_ERROR',
        severity: 'high',
        message: 'Motion not sufficiently circular',
        details: geometry
      });
    }

    // Vérifier la fluidité du mouvement
    const fluidity = this.analyzeMotionFluidity(pattern);
    if (fluidity < rules.fluidity.minSmoothness) {
      issues.push({
        type: 'FLUIDITY_ERROR',
        severity: 'medium',
        message: 'Circular motion lacks fluidity',
        details: { fluidity }
      });
    }

    return issues;
  }

  private async validateCulturalContext(
    pattern: DetectedPattern,
    context: ValidationContext
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Vérifier si le pattern est culturellement approprié
    if (!this.isPatternCulturallyAppropriate(pattern, context)) {
      issues.push({
        type: 'CULTURAL_MISMATCH',
        severity: 'critical',
        message: 'Pattern inappropriate for cultural context',
        details: { context }
      });
    }

    // Vérifier la conformité aux conventions LSF
    const conventionIssues = await this.checkLSFConventions(pattern);
    issues.push(...conventionIssues);

    return issues;
  }

  private calculateValidationConfidence(issues: ValidationIssue[]): number {
    // Calcul pondéré basé sur la sévérité des problèmes
    const weights = {
      critical: 1.0,
      high: 0.7,
      medium: 0.4,
      low: 0.2
    };

    const totalImpact = issues.reduce((sum, issue) => 
      sum + weights[issue.severity], 0);
    
    return Math.max(0, 1 - (totalImpact / issues.length));
  }
}

interface ValidationContext {
  intent: string;
  environment: string;
  culturalContext: string;
  regionalVariant?: string;
}

interface ValidationIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details?: any;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  confidence: number;
  suggestions: string[];
}