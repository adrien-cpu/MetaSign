import { FeedbackEntry, ValidationResult } from '../types';
import { CulturalValidator } from './CulturalValidator';
import { GrammaticalValidator } from './GrammaticalValidator';
import { TemporalValidator } from './TemporalValidator';
import { SpatialValidator } from './SpatialValidator';

export class FeedbackValidator {
  constructor(
    private culturalValidator: CulturalValidator,
    private grammaticalValidator: GrammaticalValidator,
    private temporalValidator: TemporalValidator,
    private spatialValidator: SpatialValidator
  ) {}

  async validate(feedback: FeedbackEntry): Promise<ValidationResult> {
    const results = await Promise.all([
      this.culturalValidator.validate(feedback),
      this.grammaticalValidator.validate(feedback),
      this.temporalValidator.validate(feedback),
      this.spatialValidator.validate(feedback)
    ]);

    return this.mergeResults(results);
  }

  private mergeResults(results: ValidationResult[]): ValidationResult {
    const mergedIssues = results.flatMap(r => r.issues);
    const lowestScore = Math.min(...results.map(r => r.score));

    return {
      isValid: mergedIssues.length === 0,
      issues: mergedIssues,
      score: lowestScore
    };
  }
}