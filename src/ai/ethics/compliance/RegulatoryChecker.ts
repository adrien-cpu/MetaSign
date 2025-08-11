// compliance/RegulatoryChecker.ts
import {
    EthicsContext,
    EthicsResult,
    EthicsDecision,
    EthicsPriority,
    ComplianceRequirement
} from '../types';

export class RegulatoryChecker {
    private requirements: Map<string, ComplianceRequirement>;
    private complianceCache: Map<string, { timestamp: number; result: boolean }>;
    private readonly CACHE_DURATION = 3600000; // 1 heure

    constructor() {
        this.requirements = new Map();
        this.complianceCache = new Map();
        this.initializeRequirements();
    }

    private initializeRequirements(): void {
        // Exigences de base
        this.addRequirement({
            id: 'DATA_PRIVACY',
            type: 'gdpr',
            description: 'Ensure data privacy requirements are met',
            validator: async (context: EthicsContext) => this.validateDataPrivacy(context),
            evidence: async (context: EthicsContext) => this.collectPrivacyEvidence(context)
        });

        this.addRequirement({
            id: 'SAFETY_STANDARDS',
            type: 'safety',
            description: 'Verify compliance with safety standards',
            validator: async (context: EthicsContext) => this.validateSafetyStandards(context),
            evidence: async (context: EthicsContext) => this.collectSafetyEvidence(context)
        });

        this.addRequirement({
            id: 'TECHNICAL_STANDARDS',
            type: 'technical',
            description: 'Ensure technical standards compliance',
            validator: async (context: EthicsContext) => this.validateTechnicalStandards(context),
            evidence: async (context: EthicsContext) => this.collectTechnicalEvidence(context)
        });
    }

    addRequirement(requirement: ComplianceRequirement): void {
        if (this.requirements.has(requirement.id)) {
            throw new Error(`Requirement ${requirement.id} already exists`);
        }
        this.requirements.set(requirement.id, requirement);
    }

    async checkCompliance(context: EthicsContext): Promise<EthicsResult> {
        const startTime = Date.now();
        const violations = [];
        const evidence = new Map<string, Record<string, unknown>>();

        for (const [id, requirement] of this.requirements) {
            try {
                const cacheKey = this.generateCacheKey(id, context);
                const cachedResult = this.getCachedResult(cacheKey);

                let isCompliant: boolean;
                if (cachedResult !== undefined) {
                    isCompliant = cachedResult;
                } else {
                    isCompliant = await requirement.validator(context);
                    this.cacheResult(cacheKey, isCompliant);
                }

                if (!isCompliant) {
                    violations.push({
                        ruleId: id,
                        message: `Non-compliance with ${requirement.description}`,
                        priority: EthicsPriority.HIGH,
                        details: await requirement.evidence(context)
                    });
                } else {
                    evidence.set(id, await requirement.evidence(context));
                }
            } catch (error) {
                violations.push({
                    ruleId: id,
                    message: `Error checking compliance: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    priority: EthicsPriority.CRITICAL
                });
            }
        }

        return {
            decision: violations.length > 0 ? EthicsDecision.NEEDS_REVIEW : EthicsDecision.APPROVED,
            timestamp: Date.now(),
            context,
            violations,
            recommendations: this.generateRecommendations(violations),
            metadata: {
                validatedBy: ['RegulatoryChecker'],
                auditId: this.generateAuditId(),
                processingTime: Date.now() - startTime
            }
        };
    }

    private async validateDataPrivacy(context: EthicsContext): Promise<boolean> {
        // Vérification de la conformité RGPD
        const hasPersonalData = this.containsPersonalData(context);
        if (hasPersonalData) {
            return (
                this.hasValidConsent(context) &&
                this.hasDataMinimization(context) &&
                this.hasSecureProcessing(context)
            );
        }
        return true;
    }

    private async validateSafetyStandards(context: EthicsContext): Promise<boolean> {
        // Vérification des normes de sécurité
        return (
            context.environment.safety.securityLevel >= 3 &&
            this.hasSafetyProtocols(context)
        );
    }

    private async validateTechnicalStandards(context: EthicsContext): Promise<boolean> {
        // Vérification des normes techniques
        return this.meetsAccessibilityStandards(context) &&
               this.meetsPerformanceStandards(context);
    }

    private containsPersonalData(context: EthicsContext): boolean {
        const personalDataTypes = ['name', 'email', 'address', 'phone', 'id'];
        return personalDataTypes.some(type => 
            JSON.stringify(context).toLowerCase().includes(type)
        );
    }

    private hasValidConsent(context: EthicsContext): boolean {
        return context.metadata?.hasConsent === true;
    }

    private hasDataMinimization(context: EthicsContext): boolean {
        return context.metadata?.minimizedData === true;
    }

    private hasSecureProcessing(context: EthicsContext): boolean {
        return context.environment.safety.securityLevel >= 4;
    }

    private hasSafetyProtocols(context: EthicsContext): boolean {
        return context.metadata?.safetyProtocols === true;
    }

    private meetsAccessibilityStandards(context: EthicsContext): boolean {
        return context.metadata?.accessibilityCompliant === true;
    }

    private meetsPerformanceStandards(context: EthicsContext): boolean {
        return context.metadata?.performanceCompliant === true;
    }

    private async collectPrivacyEvidence(context: EthicsContext): Promise<Record<string, unknown>> {
        return {
            hasPersonalData: this.containsPersonalData(context),
            consentStatus: this.hasValidConsent(context),
            dataMinimization: this.hasDataMinimization(context),
            secureProcessing: this.hasSecureProcessing(context),
            timestamp: Date.now()
        };
    }

    private async collectSafetyEvidence(context: EthicsContext): Promise<Record<string, unknown>> {
        return {
            securityLevel: context.environment.safety.securityLevel,
            safetyProtocols: this.hasSafetyProtocols(context),
            timestamp: Date.now()
        };
    }

    private async collectTechnicalEvidence(context: EthicsContext): Promise<Record<string, unknown>> {
        return {
            accessibility: this.meetsAccessibilityStandards(context),
            performance: this.meetsPerformanceStandards(context),
            timestamp: Date.now()
        };
    }

    private generateCacheKey(requirementId: string, context: EthicsContext): string {
        return `${requirementId}-${context.action.type}-${context.action.target}`;
    }

    private getCachedResult(key: string): boolean | undefined {
        const cached = this.complianceCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.result;
        }
        return undefined;
    }

    private cacheResult(key: string, result: boolean): void {
        this.complianceCache.set(key, {
            timestamp: Date.now(),
            result
        });
    }

    private generateRecommendations(violations: Array<{ message: string }>): string[] {
        return violations.map(v => `Address compliance issue: ${v.message}`);
    }

    private generateAuditId(): string {
        return `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    clearCache(): void {
        this.complianceCache.clear();
    }
}