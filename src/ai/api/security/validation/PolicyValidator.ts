// src/ai/api/security/validation/PolicyValidator.ts

import { SecurityContext } from '../types/SecurityTypes';

// Définition de SecurityPolicy qui manque dans SecurityTypes.ts
export interface SecurityPolicy {
    id: string;
    name: string;
    version: string;
    description?: string;
    rules: string[]; // IDs des règles associées
    scope?: string[];
    metadata?: Record<string, unknown>;
}

// Extension de SecurityContext pour ajouter encryptionLevel
interface ExtendedSecurityContext extends SecurityContext {
    encryptionLevel?: string;
}

interface PolicyRule {
    id: string;
    name: string;
    description: string;
    priority: number;
    condition: (context: ExtendedSecurityContext) => Promise<boolean>;
    effect: 'allow' | 'deny';
    errorMessage?: string;
}

interface PolicyValidationResult {
    isValid: boolean;
    failedRules: PolicyViolation[];
    timestamp: number;
    context: {
        policy: string;
        validatedRules: number;
        executionTime: number;
    };
}

interface PolicyViolation {
    ruleId: string;
    ruleName: string;
    description: string;
    errorMessage: string;
    context: Record<string, unknown>;
}

interface ValidationContext {
    timestamp: number;
    environment: string;
    requestId: string;
    metadata: Record<string, unknown>;
}

export class PolicyValidator {
    private readonly rules = new Map<string, PolicyRule>();
    private readonly ruleCache = new Map<string, PolicyValidationResult>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    constructor(private readonly defaultRules: PolicyRule[] = []) {
        this.initializeDefaultRules();
    }

    async validatePolicy(
        context: ExtendedSecurityContext,
        policy: SecurityPolicy,
        validationContext?: Partial<ValidationContext>
    ): Promise<PolicyValidationResult> {
        const startTime = performance.now();
        const failedRules: PolicyViolation[] = [];
        let validatedRules = 0;

        try {
            // Vérifier le cache
            const cacheKey = this.generateCacheKey(context, policy);
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }

            // Appliquer les règles par ordre de priorité
            const orderedRules = this.getOrderedRules();
            for (const rule of orderedRules) {
                validatedRules++;

                try {
                    const isValid = await rule.condition(context);
                    if (!isValid && rule.effect === 'deny') {
                        failedRules.push({
                            ruleId: rule.id,
                            ruleName: rule.name,
                            description: rule.description,
                            errorMessage: rule.errorMessage || 'Policy validation failed',
                            context: {
                                timestamp: Date.now(),
                                policyId: policy.id,
                                ...validationContext
                            }
                        });
                    }
                } catch (error) {
                    failedRules.push({
                        ruleId: rule.id,
                        ruleName: rule.name,
                        description: rule.description,
                        errorMessage: error instanceof Error ? error.message : 'Rule evaluation failed',
                        context: {
                            error: true,
                            timestamp: Date.now(),
                            policyId: policy.id,
                            ...validationContext
                        }
                    });
                }
            }

            const result: PolicyValidationResult = {
                isValid: failedRules.length === 0,
                failedRules,
                timestamp: Date.now(),
                context: {
                    policy: policy.id,
                    validatedRules,
                    executionTime: performance.now() - startTime
                }
            };

            // Mettre en cache le résultat
            this.cacheResult(cacheKey, result);

            return result;

        } catch (error) {
            return {
                isValid: false,
                failedRules: [{
                    ruleId: 'validation-error',
                    ruleName: 'Validation System Error',
                    description: 'An error occurred during policy validation',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    context: {
                        timestamp: Date.now(),
                        policyId: policy.id,
                        ...validationContext
                    }
                }],
                timestamp: Date.now(),
                context: {
                    policy: policy.id,
                    validatedRules,
                    executionTime: performance.now() - startTime
                }
            };
        }
    }

    private initializeDefaultRules(): void {
        // Ajouter les règles par défaut
        this.defaultRules.forEach(rule => this.addRule(rule));

        // Règle : Vérification du niveau d'encryption
        this.addRule({
            id: 'encryption-level',
            name: 'Encryption Level Check',
            description: 'Vérifier le niveau de chiffrement requis',
            priority: 1000,
            condition: async (context): Promise<boolean> => {
                return Boolean(context.encryptionLevel && ['high', 'military'].includes(context.encryptionLevel));
            },
            effect: 'deny',
            errorMessage: 'Insufficient encryption level'
        });

        // Règle : Vérification des permissions
        this.addRule({
            id: 'required-permissions',
            name: 'Required Permissions Check',
            description: 'Vérifier les permissions minimales requises',
            priority: 900,
            condition: async (context): Promise<boolean> => {
                const requiredPermissions = ['read', 'execute'];
                // Assurons-nous que permissions existe
                if (!context.permissions) {
                    return false;
                }
                // Utiliser Boolean() pour garantir un retour boolean
                return Boolean(requiredPermissions.every(perm =>
                    context.permissions.includes(perm)
                ));
            },
            effect: 'deny',
            errorMessage: 'Missing required permissions'
        });

        // Règle : Vérification des rôles
        this.addRule({
            id: 'role-validation',
            name: 'Role Validation',
            description: 'Vérifier les rôles requis',
            priority: 800,
            condition: async (context): Promise<boolean> => {
                if (!context.roles || context.roles.length === 0) {
                    return false;
                }
                return Boolean(context.roles.some(role =>
                    ['admin', 'security-officer', 'system'].includes(role)
                ));
            },
            effect: 'deny',
            errorMessage: 'Invalid role for operation'
        });
    }

    private getOrderedRules(): PolicyRule[] {
        return Array.from(this.rules.values())
            .sort((a, b) => b.priority - a.priority);
    }

    private generateCacheKey(context: SecurityContext, policy: SecurityPolicy): string {
        return `${context.userId}:${policy.id}:${context.sessionId || ''}`;
    }

    private getCachedResult(key: string): PolicyValidationResult | null {
        const cached = this.ruleCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached;
        }
        this.ruleCache.delete(key);
        return null;
    }

    private cacheResult(key: string, result: PolicyValidationResult): void {
        this.ruleCache.set(key, result);
    }

    // Méthodes publiques utilitaires
    public addRule(rule: PolicyRule): void {
        this.rules.set(rule.id, rule);
    }

    public removeRule(ruleId: string): void {
        this.rules.delete(ruleId);
    }

    public getRules(): PolicyRule[] {
        return Array.from(this.rules.values());
    }

    public clearCache(): void {
        this.ruleCache.clear();
    }

    public updateRule(ruleId: string, updates: Partial<PolicyRule>): void {
        const existingRule = this.rules.get(ruleId);
        if (existingRule) {
            this.rules.set(ruleId, { ...existingRule, ...updates });
            this.clearCache(); // Invalider le cache après la mise à jour
        }
    }
}