import { ValidationResult, ValidationParams, ValidationSeverity, SeverityWeights } from '../../../types/validators';

export abstract class BaseValidator {
    protected createIssue(
        type: string,
        severity: ValidationSeverity,
        description: string,
        details?: Record<string, unknown>
    ): ValidationParams {
        return {
            type,
            severity,
            description,
            details
        };
    }

    protected calculateScore(issues: ValidationParams[]): number {
        if (issues.length === 0) return 1.0;

        const weightedSum = issues.reduce((sum, issue) =>
            sum + SeverityWeights[issue.severity], 0);

        return Math.max(0, 1 - weightedSum);
    }

    protected aggregateResults(results: ValidationResult[]): ValidationResult {
        const allIssues = results.flatMap(r => r.issues);
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

        return {
            isValid: results.every(r => r.isValid),
            issues: this.prioritizeIssues(allIssues),
            score: averageScore
        };
    }

    protected prioritizeIssues(issues: ValidationParams[]): ValidationParams[] {
        return issues
            .sort((a, b) => SeverityWeights[b.severity] - SeverityWeights[a.severity])
            .slice(0, 10);
    }

    abstract validate(...args: any[]): Promise<ValidationResult>;
}