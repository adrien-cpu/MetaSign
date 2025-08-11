import { ValidationResult, ValidationSeverity } from '../../types/validation';
import { LSFExpression } from '../../../systems/expressions/emotions/types';
import { Position3D, Zone } from '../interfaces/ISpatialValidator';
import { SeverityWeights, ValidationParams } from '../types';

export abstract class AbstractZoneValidator {
  protected createIssue(
    type: string,
    severity: ValidationSeverity,
    description: string,
    location?: Position3D
  ): ValidationParams {
    return {
      type,
      severity,
      description,
      location
    };
  }

  protected calculateScore(issues: ValidationParams[]): number {
    if (issues.length === 0) return 1.0;
    return Math.max(0, 1 - issues.reduce((sum, issue) => 
      sum + SeverityWeights[issue.severity], 0));
  }

  protected isWithinBoundaries(position: Position3D, boundaries: Zone): boolean {
    return (
      position.x >= boundaries.min.x && position.x <= boundaries.max.x &&
      position.y >= boundaries.min.y && position.y <= boundaries.max.y &&
      position.z >= boundaries.min.z && position.z <= boundaries.max.z
    );
  }

  protected aggregateResults(results: ValidationResult[]): ValidationResult {
    const allIssues = results.flatMap(r => r.issues);
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      isValid: results.every(r => r.isValid),
      issues: allIssues,
      score: averageScore
    };
  }
}