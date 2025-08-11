// src/ai/systems/expressions/validation/ExpressionValidator.ts
import { LSFExpression, ValidationResult, ValidationIssue } from '../types';

/**
 * Interface pour les patterns d'expression
 */
export interface ExpressionPattern {
  eyebrows: {
    position: number;
    tension: number;
  };
  eyes: {
    openness: number;
  };
  mouth: {
    tension: number;
  };
}

/**
 * Interface du validateur d'expressions LSF
 */
export interface IExpressionValidator {
  /**
   * Valide une expression LSF
   */
  validate(expression: LSFExpression): Promise<ValidationResult>;
}

/**
 * Implémentation du validateur d'expressions
 */
export class ExpressionValidator implements IExpressionValidator {
  /**
   * Valide un pattern d'expression
   */
  validatePattern(pattern: ExpressionPattern): ValidationResult {
    return {
      isValid: this.checkRanges(pattern) && this.checkCoherence(pattern),
      issues: this.collectIssues(pattern),
      score: this.calculateScore(pattern)
    };
  }

  /**
   * Valide une expression LSF complète
   */
  async validate(expression: LSFExpression): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let isValid = true;

    // Valider les composantes faciales
    if (expression.eyebrows) {
      // Correction du cast avec vérification de type
      const eyebrowsData = this.ensureNumberRecord(expression.eyebrows);
      const eyebrowsValid = this.validateEyebrows(eyebrowsData);
      if (!eyebrowsValid.isValid) {
        isValid = false;
        issues.push({
          type: 'SYNTACTIC',
          severity: 'ERROR',
          message: 'Invalid eyebrows configuration',
          component: 'eyebrows'
        });
      }
    }

    if (expression.mouth) {
      // Correction du cast avec vérification de type
      const mouthData = this.ensureNumberRecord(expression.mouth);
      const mouthValid = this.validateMouth(mouthData);
      if (!mouthValid.isValid) {
        isValid = false;
        issues.push({
          type: 'SYNTACTIC',
          severity: 'ERROR',
          message: 'Invalid mouth configuration',
          component: 'mouth'
        });
      }
    }

    if (expression.eyes) {
      // Correction du cast avec vérification de type
      const eyesData = this.ensureNumberRecord(expression.eyes);
      const eyesValid = this.validateEyes(eyesData);
      if (!eyesValid.isValid) {
        isValid = false;
        issues.push({
          type: 'SYNTACTIC',
          severity: 'ERROR',
          message: 'Invalid eyes configuration',
          component: 'eyes'
        });
      }
    }

    // Valider les composantes corporelles
    if (expression.body) {
      const bodyValid = this.validateBody(expression.body);
      if (!bodyValid.isValid) {
        isValid = false;
        issues.push({
          type: 'SYNTACTIC',
          severity: 'ERROR',
          message: 'Invalid body configuration',
          component: 'body'
        });
      }
    }

    // Valider le timing
    // Correction: Vérifier si timing est défini avant de l'utiliser
    if (expression.timing && !this.validateTiming(expression.timing)) {
      isValid = false;
      issues.push({
        type: 'TEMPORAL',
        severity: 'ERROR',
        message: 'Invalid timing configuration',
        component: 'timing'
      });
    }

    return {
      isValid,
      issues,
      score: isValid ? 1.0 : 0.5
    };
  }

  /**
   * Convertit un Record<string, unknown> en Record<string, number> avec sécurité
   */
  private ensureNumberRecord(data: Record<string, unknown>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        result[key] = value;
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        result[key] = Number(value);
      } else {
        result[key] = 0; // Valeur par défaut
      }
    }
    return result;
  }

  /**
   * Vérifie que les valeurs sont dans les plages acceptables
   */
  private checkRanges(pattern: ExpressionPattern): boolean {
    return (
      this.isInRange(pattern.eyebrows.position, -1, 1) &&
      this.isInRange(pattern.eyebrows.tension, 0, 1) &&
      this.isInRange(pattern.eyes.openness, 0, 2) &&
      this.isInRange(pattern.mouth.tension, 0, 1)
    );
  }

  /**
   * Vérifie la cohérence du pattern
   */
  private checkCoherence(pattern: ExpressionPattern): boolean {
    // Vérifier la cohérence LSF
    const isEyebrowsValid = this.validateEyebrowsForLSF(pattern.eyebrows);
    const isEyesValid = this.validateEyesForLSF(pattern.eyes);
    const isMouthValid = this.validateMouthForLSF(pattern.mouth);

    return isEyebrowsValid && isEyesValid && isMouthValid;
  }

  /**
   * Vérifie qu'une valeur est dans une plage
   */
  private isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Collecte les problèmes pour un pattern
   */
  private collectIssues(pattern: ExpressionPattern): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!this.isInRange(pattern.eyebrows.position, -1, 1)) {
      issues.push({
        type: 'SYNTACTIC',
        severity: 'ERROR',
        message: 'Eyebrows position out of range [-1,1]',
        component: 'eyebrows'
      });
    }

    if (!this.isInRange(pattern.eyebrows.tension, 0, 1)) {
      issues.push({
        type: 'SYNTACTIC',
        severity: 'ERROR',
        message: 'Eyebrows tension out of range [0,1]',
        component: 'eyebrows'
      });
    }

    if (!this.isInRange(pattern.eyes.openness, 0, 2)) {
      issues.push({
        type: 'SYNTACTIC',
        severity: 'ERROR',
        message: 'Eyes openness out of range [0,2]',
        component: 'eyes'
      });
    }

    if (!this.isInRange(pattern.mouth.tension, 0, 1)) {
      issues.push({
        type: 'SYNTACTIC',
        severity: 'ERROR',
        message: 'Mouth tension out of range [0,1]',
        component: 'mouth'
      });
    }

    return issues;
  }

  /**
   * Calcule un score de qualité pour le pattern
   */
  private calculateScore(pattern: ExpressionPattern): number {
    // Si les plages ne sont pas respectées, score minimum
    if (!this.checkRanges(pattern)) {
      return 0.1;
    }

    // Si la cohérence n'est pas respectée, score intermédiaire
    if (!this.checkCoherence(pattern)) {
      return 0.5;
    }

    // Calcul d'un score basé sur la naturalité des valeurs
    const eyebrowsScore = this.getNaturalnessScore(pattern.eyebrows.position, pattern.eyebrows.tension);
    const eyesScore = this.getNaturalnessScore(pattern.eyes.openness / 2, 0.5); // Normaliser à [0,1]
    const mouthScore = this.getNaturalnessScore(pattern.mouth.tension, 0.5);

    // Moyenne pondérée des scores
    return (eyebrowsScore * 0.3 + eyesScore * 0.3 + mouthScore * 0.4);
  }

  /**
   * Calcule un score de naturalité
   */
  private getNaturalnessScore(value: number, idealValue: number): number {
    // Plus la valeur est proche de l'idéal, meilleur est le score
    return 1 - Math.min(1, Math.abs(value - idealValue) * 2);
  }

  /**
   * Valide les sourcils pour LSF
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateEyebrowsForLSF(_eyebrows: ExpressionPattern['eyebrows']): boolean {
    // Implémentation simplifiée - idéalement plus complexe selon les règles LSF
    return true;
  }

  /**
   * Valide les yeux pour LSF
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateEyesForLSF(_eyes: ExpressionPattern['eyes']): boolean {
    // Implémentation simplifiée - idéalement plus complexe selon les règles LSF
    return true;
  }

  /**
   * Valide la bouche pour LSF
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateMouthForLSF(_mouth: ExpressionPattern['mouth']): boolean {
    // Implémentation simplifiée - idéalement plus complexe selon les règles LSF
    return true;
  }

  /**
   * Valide les sourcils
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateEyebrows(_eyebrows: Record<string, number>): { isValid: boolean } {
    // Implémentation simplifiée
    return { isValid: true };
  }

  /**
   * Valide la bouche
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateMouth(_mouth: Record<string, number>): { isValid: boolean } {
    // Implémentation simplifiée
    return { isValid: true };
  }

  /**
   * Valide les yeux
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateEyes(_eyes: Record<string, number>): { isValid: boolean } {
    // Implémentation simplifiée
    return { isValid: true };
  }

  /**
   * Valide le corps
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateBody(_body: LSFExpression['body']): { isValid: boolean } {
    // Implémentation simplifiée
    return { isValid: true };
  }

  /**
   * Valide le timing
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private validateTiming(_timing: Record<string, unknown>): boolean {
    // Implémentation simplifiée
    return true;
  }
}