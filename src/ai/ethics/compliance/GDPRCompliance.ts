// compliance/GDPRCompliance.ts
import {
    EthicsContext,
    EthicsResult,
    EthicsDecision,
    EthicsPriority,
    ComplianceRequirement
} from '../types';

interface GDPRRequirement extends ComplianceRequirement {
    dataCategories: string[];
    processingBasis: string[];
    retentionPeriod?: number;
}

export class GDPRCompliance {
    private requirements: Map<string, GDPRRequirement>;

    constructor() {
        this.requirements = new Map();
        this.initializeRequirements();
    }

    private initializeRequirements(): void {
        this.addRequirement({
            id: 'GDPR_CONSENT',
            type: 'gdpr',
            description: 'Verify explicit user consent',
            dataCategories: ['personal', 'behavioral'],
            processingBasis: ['consent'],
            validator: async (context) => this.validateConsent(context),
            evidence: async (context) => this.collectConsentEvidence(context)
        });

        this.addRequirement({
            id: 'GDPR_MINIMIZATION',
            type: 'gdpr',
            description: 'Ensure data minimization',
            dataCategories: ['all'],
            processingBasis: ['legitimate_interest', 'legal_obligation'],
            validator: async (context) => this.validateMinimization(context),
            evidence: async (context) => this.collectMinimizationEvidence(context)
        });

        this.addRequirement({
            id: 'GDPR_RETENTION',
            type: 'gdpr',
            description: 'Verify data retention compliance',
            dataCategories: ['personal', 'behavioral', 'technical'],
            processingBasis: ['all'],
            retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 jours
            validator: async (context) => this.validateRetention(context),
            evidence: async (context) => this.collectRetentionEvidence(context)
        });
    }

    private addRequirement(requirement: GDPRRequirement): void {
        this.requirements.set(requirement.id, requirement);
    }

    async evaluateCompliance(context: EthicsContext): Promise<EthicsResult> {
        const startTime = Date.now();
        const violations = [];
        const evidence = new Map<string, Record<string, unknown>>();

        for (const [id, requirement] of this.requirements) {
            try {
                const isCompliant = await requirement.validator(context);
                if (!isCompliant) {
                    violations.push({
                        ruleId: id,
                        message: `GDPR violation: ${requirement.description}`,
                        priority: EthicsPriority.HIGH,
                        details: await requirement.evidence(context)
                    });
                } else {
                    evidence.set(id, await requirement.evidence(context));
                }
            } catch (error) {
                violations.push({
                    ruleId: id,
                    message: `Error in GDPR check: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    priority: EthicsPriority.CRITICAL
                });
            }
        }

        return {
            decision: this.determineDecision(violations),
            timestamp: Date.now(),
            context,
            violations,
            recommendations: this.generateRecommendations(violations),
            metadata: {
                validatedBy: ['GDPRCompliance'],
                auditId: this.generateAuditId(),
                processingTime: Date.now() - startTime
            }
        };
    }

    private async validateConsent(context: EthicsContext): Promise<boolean> {
        const consentMetadata = context.metadata?.consent as { 
            given: boolean;
            timestamp: number;
            scope: string[];
        } | undefined;

        if (!consentMetadata) {
            return false;
        }

        return (
            consentMetadata.given &&
            this.isConsentValid(consentMetadata) &&
            this.isConsentScope(consentMetadata, context)
        );
    }

    private async validateMinimization(context: EthicsContext): Promise<boolean> {
        const requiredFields = this.getRequiredFields(context.action.type);
        const providedFields = Object.keys(context.action.parameters);

        return (
            providedFields.every(field => requiredFields.includes(field)) &&
            providedFields.length <= requiredFields.length
        );
    }

    private async validateRetention(context: EthicsContext): Promise<boolean> {
        const retentionMetadata = context.metadata?.retention as {
            createdAt: number;
            expiresAt: number;
        } | undefined;

        if (!retentionMetadata) {
            return false;
        }

        const requirement = this.requirements.get('GDPR_RETENTION');
        const maxRetention = requirement?.retentionPeriod || Infinity;

        return (
            retentionMetadata.expiresAt - retentionMetadata.createdAt <= maxRetention &&
            retentionMetadata.expiresAt > Date.now()
        );
    }

    private isConsentValid(consent: { timestamp: number }): boolean {
        const MAX_CONSENT_AGE = 365 * 24 * 60 * 60 * 1000; // 1 an
        return Date.now() - consent.timestamp <= MAX_CONSENT_AGE;
    }

    private isConsentScope(
        consent: { scope: string[] },
        context: EthicsContext
    ): boolean {
        const requiredScope = this.getRequiredScope(context.action.type);
        return requiredScope.every(scope => consent.scope.includes(scope));
    }

    private getRequiredFields(actionType: string): string[] {
        const fieldMap: Record<string, string[]> = {
            'profile': ['id', 'preferences'],
            'analyze': ['data', 'parameters'],
            'store': ['data', 'retention']
        };
        return fieldMap[actionType] || [];
    }

    private getRequiredScope(actionType: string): string[] {
        const scopeMap: Record<string, string[]> = {
            'profile': ['profile_read', 'profile_write'],
            'analyze': ['data_analysis'],
            'store': ['data_storage']
        };
        return scopeMap[actionType] || [];
    }

    private async collectConsentEvidence(context: EthicsContext): Promise<Record<string, unknown>> {
        const consentMetadata = context.metadata?.consent;
        return {
            consentDetails: consentMetadata,
            validationTimestamp: Date.now(),
            requirements: this.requirements.get('GDPR_CONSENT')
        };
    }

    private async collectMinimizationEvidence(context: EthicsContext): Promise<Record<string, unknown>> {
        return {
            providedFields: Object.keys(context.action.parameters),
            requiredFields: this.getRequiredFields(context.action.type),
            validationTimestamp: Date.now()
        };
    }

    private async collectRetentionEvidence(context: EthicsContext): Promise<Record<string, unknown>> {
        return {
            retentionPolicy: context.metadata?.retention,
            maxRetention: this.requirements.get('GDPR_RETENTION')?.retentionPeriod,
            validationTimestamp: Date.now()
        };
    }

    private determineDecision(violations: Array<{ priority: EthicsPriority }>): EthicsDecision {
        if (violations.length === 0) {
            return EthicsDecision.APPROVED;
        }

        if (violations.some(v => v.priority === EthicsPriority.CRITICAL)) {
            return EthicsDecision.REJECTED;
        }

        return EthicsDecision.NEEDS_REVIEW;
    }

    private generateRecommendations(violations: Array<{ message: string }>): string[] {
        return violations.map(v => `GDPR Compliance Action Required: ${v.message}`);
    }

    private generateAuditId(): string {
        return `gdpr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}