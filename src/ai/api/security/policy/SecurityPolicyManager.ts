// src/api/security/policy/SecurityPolicyManager.ts

// src/api/security/policy/SecurityPolicyManager.ts
import {
    SecurityPolicy,
    SecurityRule,
    SecurityContext,
    SecurityConfigurationManager,
    AuditTrailManager,
} from '../interfaces/SecurityInterfaces';

export class SecurityPolicyManager {
    private configManager: SecurityConfigurationManager;
    private auditManager: AuditTrailManager;
    private policies: Map<string, SecurityPolicy>;

    constructor(
        configManager: SecurityConfigurationManager,
        auditManager: AuditTrailManager
    ) {
        this.configManager = configManager;
        this.auditManager = auditManager;
        this.policies = new Map();
        this.loadPolicies();
    }

    private async loadPolicies(): Promise<void> {
        try {
            const storedPolicies = await this.configManager.loadPolicies();
            storedPolicies.forEach(policy => this.policies.set(policy.id, policy));
        } catch (error) {
            console.error("Erreur lors du chargement des politiques:", error);
        }
    }

    public async createPolicy(policy: Omit<SecurityPolicy, 'version' | 'lastUpdated'>): Promise<string> {
        const newPolicy: SecurityPolicy = {
            ...policy,
            version: 1,
            lastUpdated: new Date()
        };

        this.policies.set(newPolicy.id, newPolicy);
        await this.savePolicies();

        await this.auditManager.logPolicyChange({
            eventType: 'CREATE',
            policyId: newPolicy.id,
            timestamp: new Date()
        });

        return newPolicy.id;
    }

    // ... autres méthodes restent identiques mais utilisent les interfaces importées
    public async updatePolicy(id: string, updates: Partial<SecurityPolicy>): Promise<void> {
        const policy = this.policies.get(id);
        if (!policy) {
            throw new Error('Politique non trouvée');
        }

        const updatedPolicy: SecurityPolicy = {
            ...policy,
            ...updates,
            version: policy.version + 1,
            lastUpdated: new Date()
        };

        this.policies.set(id, updatedPolicy);
        await this.savePolicies();

        await this.auditManager.logPolicyChange({
            eventType: 'UPDATE', // Utiliser eventType au lieu de action
            policyId: id,
            timestamp: new Date()
        });
    }

    public async deletePolicy(id: string): Promise<void> {
        if (!this.policies.delete(id)) {
            throw new Error('Politique non trouvée');
        }

        await this.savePolicies();

        await this.auditManager.logPolicyChange({
            eventType: 'DELETE', // Utiliser eventType au lieu de action
            policyId: id,
            timestamp: new Date()
        });
    }

    public async evaluatePolicy(id: string, context: SecurityContext): Promise<boolean> {
        const policy = this.policies.get(id);
        if (!policy || !policy.enabled) {
            return false;
        }

        const sortedRules = [...policy.rules].sort((a, b) => b.priority - a.priority);

        for (const rule of sortedRules) {
            if (await this.evaluateRule(rule, context)) {
                return true;
            }
        }

        return false;
    }

    private async evaluateRule(rule: SecurityRule, context: SecurityContext): Promise<boolean> {
        try {
            const conditionFn = new Function('context', `return ${rule.condition}`);
            return conditionFn(context);
        } catch (error) {
            await this.auditManager.logError({
                component: 'PolicyManager',
                error: error as Error,
                context: { rule, context }
            });
            return false;
        }
    }

    private async savePolicies(): Promise<void> {
        await this.configManager.savePolicies(
            Array.from(this.policies.values())
        );
    }
}

