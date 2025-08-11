// src/ai/api/multimodal/quality/MultimodalValidator.ts

import {
    ValidationRule,
    QualityMetricCalculator,
    CoherenceChecker,
    SystemeControleEthique,
    SupervisionHumaineRenforcee,
    ValidationContext,
    ValidationResult,
    QualityMetrics,
    CoherenceResult,
    ValidationIssue,
    ValidationReport
} from './types';

export class MultimodalValidator {
    constructor(
        private readonly validationRules: ValidationRule[],
        private readonly qualityMetrics: QualityMetricCalculator,
        private readonly coherenceChecker: CoherenceChecker,
        private readonly ethicsValidator: SystemeControleEthique,
        private readonly supervisionSystem: SupervisionHumaineRenforcee
    ) { }

    async validate(
        output: any,
        context: ValidationContext
    ): Promise<ValidationResult> {
        // Validation éthique et supervision
        await this.ethicsValidator.validateOutput(output);
        await this.supervisionSystem.reviewOutput(output);

        // Validation parallèle des différents aspects
        const [rules, metrics, coherence] = await Promise.all([
            this.validateRules(output),
            this.qualityMetrics.calculateMetrics(output),
            this.coherenceChecker.checkCoherence(output)
        ]);

        // Construction du résultat final
        const issues = await this.collectIssues(rules, metrics, coherence);
        const score = await this.calculateQualityScore(metrics, coherence);
        const isValid = this.isOutputValid(rules, metrics, coherence, context);

        return {
            isValid,
            issues,
            score
        };
    }

    private async validateRules(output: any): Promise<boolean[]> {
        return Promise.all(
            this.validationRules.map(rule => rule.check(output))
        );
    }

    private async collectIssues(
        ruleResults: boolean[],
        metrics: QualityMetrics,
        coherence: CoherenceResult
    ): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Ajout des problèmes de règles
        this.validationRules.forEach((rule, index) => {
            if (!ruleResults[index]) {
                issues.push({
                    type: 'rule_violation',
                    message: `Validation rule ${rule.id} failed`,
                    severity: rule.severity
                });
            }
        });

        // Ajout des problèmes de cohérence
        coherence.issues.forEach(issue => {
            issues.push({
                type: 'coherence_issue',
                message: issue,
                severity: 'warning'
            });
        });

        return issues;
    }

    private async calculateQualityScore(
        metrics: QualityMetrics,
        coherence: CoherenceResult
    ): Promise<number> {
        const qualityWeight = 0.6;
        const coherenceWeight = 0.4;

        return (
            metrics.overallQuality * qualityWeight +
            coherence.score * coherenceWeight
        );
    }

    private isOutputValid(
        ruleResults: boolean[],
        metrics: QualityMetrics,
        coherence: CoherenceResult,
        context: ValidationContext
    ): boolean {
        // Vérification des règles critiques
        const hasErrorRules = this.validationRules
            .filter((rule, index) => !ruleResults[index] && rule.severity === 'error')
            .length > 0;

        if (hasErrorRules) return false;

        // Vérification des seuils de qualité et cohérence
        return (
            metrics.overallQuality >= context.constraints.minQuality &&
            coherence.score >= context.constraints.minCoherence
        );
    }
}