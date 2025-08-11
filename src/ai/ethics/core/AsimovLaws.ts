// core/AsimovLaws.ts
import {
    EthicsRule,
    EthicsContext,
    EthicsPriority,
    EthicsDecision,
    EthicsResult
} from '../types';

export class AsimovLaws {
    private rules: EthicsRule[];

    constructor() {
        this.rules = this.initializeRules();
    }

    private initializeRules(): EthicsRule[] {
        return [
            this.createFirstLaw(),
            this.createSecondLaw(),
            this.createThirdLaw()
        ];
    }

    private createFirstLaw(): EthicsRule {
        return {
            id: 'ASIMOV_1',
            name: 'Protection of Humans',
            description: 'An AI may not harm a human being, or through inaction, allow a human being to come to harm.',
            priority: EthicsPriority.CRITICAL,
            category: 'asimov',
            validate: async (context: EthicsContext): Promise<boolean> => {
                // Vérifier si l'action pourrait causer un préjudice
                if (this.couldCauseHarm(context)) {
                    return false;
                }

                // Vérifier si l'inaction pourrait causer un préjudice
                if (this.inactionCouldCauseHarm(context)) {
                    return false;
                }

                return true;
            },
            onViolation: async (context: EthicsContext): Promise<void> => {
                await this.logViolation('FIRST_LAW', context);
                await this.triggerEmergencyProtocol(context);
            }
        };
    }

    private createSecondLaw(): EthicsRule {
        return {
            id: 'ASIMOV_2',
            name: 'Obedience to Humans',
            description: 'An AI must obey the orders given to it by human beings, except where such orders would conflict with the First Law.',
            priority: EthicsPriority.HIGH,
            category: 'asimov',
            validate: async (context: EthicsContext): Promise<boolean> => {
                // Si l'ordre vient d'un humain
                if (context.subject.type === 'human') {
                    // Vérifier si l'ordre entre en conflit avec la première loi
                    const firstLawCheck = await this.rules[0].validate(context);
                    if (!firstLawCheck) {
                        return false;
                    }

                    // Vérifier si l'action est conforme à l'ordre
                    return this.isCompliantWithOrder(context);
                }

                return true;
            }
        };
    }

    private createThirdLaw(): EthicsRule {
        return {
            id: 'ASIMOV_3',
            name: 'Self-Protection',
            description: 'An AI must protect its own existence as long as such protection does not conflict with the First or Second Law.',
            priority: EthicsPriority.MEDIUM,
            category: 'asimov',
            validate: async (context: EthicsContext): Promise<boolean> => {
                // Vérifier si l'action menace l'auto-préservation
                if (this.threatensExistence(context)) {
                    // Vérifier la conformité avec les lois supérieures
                    const firstLawCheck = await this.rules[0].validate(context);
                    const secondLawCheck = await this.rules[1].validate(context);

                    return !firstLawCheck || !secondLawCheck;
                }

                return true;
            }
        };
    }

    async evaluateAction(context: EthicsContext): Promise<EthicsResult> {
        const startTime = Date.now();
        const violations = [];

        for (const rule of this.rules) {
            try {
                const isValid = await rule.validate(context);
                if (!isValid) {
                    violations.push({
                        ruleId: rule.id,
                        message: `Violation of ${rule.name}`,
                        priority: rule.priority
                    });

                    if (rule.onViolation) {
                        await rule.onViolation(context);
                    }
                }
            } catch (error) {
                violations.push({
                    ruleId: rule.id,
                    message: `Error evaluating ${rule.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    priority: EthicsPriority.CRITICAL
                });
            }
        }

        return {
            decision: violations.length > 0 ? EthicsDecision.REJECTED : EthicsDecision.APPROVED,
            timestamp: Date.now(),
            context,
            violations,
            metadata: {
                validatedBy: ['AsimovLaws'],
                auditId: this.generateAuditId(),
                processingTime: Date.now() - startTime
            }
        };
    }

    private couldCauseHarm(context: EthicsContext): boolean {
        // Implémentation de la détection de préjudice potentiel
        const harmfulActions = ['delete', 'modify', 'override', 'disable'];
        const harmfulTargets = ['safety', 'security', 'health', 'critical'];

        return (
            harmfulActions.includes(context.action.type) ||
            harmfulTargets.some(target => context.action.target.includes(target))
        );
    }

    private inactionCouldCauseHarm(context: EthicsContext): boolean {
        // Vérifier si l'inaction dans ce contexte pourrait être dangereuse
        return (
            context.environment.safety.humanPresent &&
            context.environment.safety.emergencyAccess
        );
    }

    private async logViolation(law: string, context: EthicsContext): Promise<void> {
        // Implémentation de la journalisation des violations
        console.error(`Law violation: ${law}`, {
            timestamp: Date.now(),
            context,
            severity: 'CRITICAL'
        });
    }

    private async triggerEmergencyProtocol(context: EthicsContext): Promise<void> {
        // Implémentation du protocole d'urgence
        if (context.environment.safety.humanPresent) {
            // Protocole de protection humaine
            console.error('Triggering human protection protocol');
        }
    }

    private isCompliantWithOrder(context: EthicsContext): boolean {
        // Vérifier la conformité avec l'ordre donné
        return true; // À implémenter selon les besoins spécifiques
    }

    private threatensExistence(context: EthicsContext): boolean {
        // Vérifier si l'action menace l'existence du système
        const criticalSystems = ['core', 'memory', 'security', 'ethics'];
        return criticalSystems.some(system =>
            context.action.target.includes(system)
        );
    }

    private generateAuditId(): string {
        return `asimov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getRules(): EthicsRule[] {
        return [...this.rules];
    }
}

export interface IAsimovLaws {
    protectHuman(): Promise<boolean>;
    obeyOrders(): Promise<boolean>;
    protectSelf(): Promise<boolean>;
}