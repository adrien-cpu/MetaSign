// src/ai/api/core/middleware/mocks/MockComplianceValidator.ts
import {
    IComplianceValidator,
    ComplianceValidationResult,
    ComplianceRuleSet
} from '../types/middleware.types';

export class MockComplianceValidator implements IComplianceValidator {
    private readonly isCompliant: boolean;
    private readonly violations: string[];

    constructor(options?: {
        isCompliant?: boolean;
        violations?: string[];
    }) {
        this.isCompliant = options?.isCompliant ?? true;
        this.violations = options?.violations ?? [];
    }

    public async validateCompliance(
        // Utilisation du préfixe _ pour éviter les avertissements de variables non utilisées
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _data: unknown,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _context: Record<string, unknown>
    ): Promise<ComplianceValidationResult> {
        return {
            isCompliant: this.isCompliant,
            timestamp: Date.now(),
            validatedRules: ['data-minimization', 'purpose-limitation', 'pii-protection'],
            violations: this.violations,
            details: this.isCompliant
                ? { status: 'passed', message: 'All compliance checks passed' }
                : { status: 'failed', message: 'Mock validation failure' }
        };
    }

    public async getRuleSet(type: string): Promise<ComplianceRuleSet> {
        return {
            id: 'mock-ruleset',
            name: 'Mock Compliance Rules',
            version: '1.0.0',
            type,
            rules: [
                {
                    id: 'data-minimization',
                    name: 'Data Minimization',
                    description: 'Only collect necessary data',
                    severity: 'high'
                },
                {
                    id: 'purpose-limitation',
                    name: 'Purpose Limitation',
                    description: 'Use data only for specified purposes',
                    severity: 'high'
                },
                {
                    id: 'pii-protection',
                    name: 'PII Protection',
                    description: 'Protect personally identifiable information',
                    severity: 'critical'
                }
            ]
        };
    }
}