// src/ai/api/security/protection/PolicyEnforcer.ts

import { SecurityContext, SecurityPolicy, PolicyRule, PolicyParameters } from '../types/SecurityTypes';

/**
 * Définition d'une restriction d'accès
 */
interface AccessRestriction {
    resourceType: string;
    level: 'read' | 'write' | 'admin' | 'none';
    duration: number | undefined; // durée en secondes, explicitement number | undefined
    reason: string;
}

/**
 * Configuration de monitoring
 */
interface MonitoringConfig {
    level: 'normal' | 'enhanced' | 'strict';
    metrics: string[];
    samplingRate: number;
    alertThreshold: number;
}

/**
 * Classe responsable de l'application des politiques de sécurité
 */
export class PolicyEnforcer {
    private readonly activeRestrictions = new Map<string, AccessRestriction>();
    private readonly monitoringConfigs = new Map<string, MonitoringConfig>();

    /**
     * Applique une politique de sécurité au contexte donné
     * @param context Le contexte de sécurité de l'utilisateur
     * @param policy La politique à appliquer
     */
    async enforcePolicy(context: SecurityContext, policy: SecurityPolicy): Promise<void> {
        const isApplicable = await this.isPolicyApplicable(context, policy);
        if (!isApplicable) {
            return;
        }

        for (const rule of policy.rules) {
            await this.enforceRule(context, rule);
        }
    }

    /**
     * Vérifie si une politique est applicable au contexte
     * @param context Le contexte de sécurité
     * @param policy La politique à vérifier
     * @returns Vrai si la politique est applicable
     */
    private async isPolicyApplicable(context: SecurityContext, policy: SecurityPolicy): Promise<boolean> {
        // Vérifier si la politique s'applique au contexte actuel
        const hasRequiredRoles = policy.rules.every((rule: PolicyRule) => {
            const requiredRoles = rule.parameters.requiredRoles;
            return requiredRoles && requiredRoles.length > 0 ?
                requiredRoles.some(role => context.roles?.includes(role) ?? false) :
                true;
        });

        const hasRequiredPermissions = policy.rules.every((rule: PolicyRule) => {
            const requiredPermissions = rule.parameters.requiredPermissions;
            return requiredPermissions && requiredPermissions.length > 0 ?
                requiredPermissions.some(perm => context.permissions?.includes(perm) ?? false) :
                true;
        });

        const isInTimeWindow = policy.rules.every((rule: PolicyRule) => {
            const { startTime, endTime } = rule.parameters;
            if (!startTime || !endTime) return true;

            const now = Date.now();
            return now >= startTime && now <= endTime;
        });

        return hasRequiredRoles && hasRequiredPermissions && isInTimeWindow;
    }

    /**
     * Applique une règle de politique
     * @param context Le contexte de sécurité
     * @param rule La règle à appliquer
     */
    private async enforceRule(context: SecurityContext, rule: PolicyRule): Promise<void> {
        try {
            switch (rule.action) {
                case 'restrict_access':
                    await this.restrictAccess(context, rule.parameters);
                    break;
                case 'increase_monitoring':
                    await this.increaseMonitoring(context, rule.parameters);
                    break;
                case 'enforce_encryption':
                    await this.enforceEncryption(context, rule.parameters);
                    break;
                case 'require_authentication':
                    await this.requireAuthentication(context, rule.parameters);
                    break;
                default:
                    throw new Error(`Unknown policy rule action: ${rule.action}`);
            }
        } catch (error: unknown) {
            console.error(`Error enforcing rule ${rule.id}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Policy enforcement failed: ${errorMessage}`);
        }
    }

    /**
     * Applique une restriction d'accès
     * @param context Le contexte de sécurité
     * @param parameters Les paramètres de la règle
     */
    private async restrictAccess(context: SecurityContext, parameters: PolicyParameters): Promise<void> {
        const restriction: AccessRestriction = {
            resourceType: parameters.resourceType ?? '',
            level: parameters.level ?? 'none',
            duration: parameters.duration,
            reason: parameters.reason ?? 'Policy enforcement'
        };

        // Valider les paramètres
        if (!['read', 'write', 'admin', 'none'].includes(restriction.level)) {
            throw new Error(`Invalid restriction level: ${restriction.level}`);
        }

        // S'assurer que l'ID utilisateur existe
        if (!context.userId) {
            throw new Error('User ID is required for access restriction');
        }

        // Appliquer la restriction
        this.activeRestrictions.set(context.userId, restriction);

        // Si une durée est spécifiée, planifier la levée de la restriction
        if (restriction.duration) {
            setTimeout(() => {
                if (context.userId) {
                    this.activeRestrictions.delete(context.userId);
                }
            }, restriction.duration * 1000);
        }
    }

    /**
     * Augmente le niveau de monitoring
     * @param context Le contexte de sécurité
     * @param parameters Les paramètres de la règle
     */
    private async increaseMonitoring(context: SecurityContext, parameters: PolicyParameters): Promise<void> {
        const config: MonitoringConfig = {
            level: parameters.level as 'normal' | 'enhanced' | 'strict' ?? 'enhanced',
            metrics: parameters.metrics ?? ['access', 'operations', 'errors'],
            samplingRate: parameters.samplingRate ?? 1.0,
            alertThreshold: parameters.alertThreshold ?? 0.8
        };

        // Valider la configuration
        if (!['normal', 'enhanced', 'strict'].includes(config.level)) {
            throw new Error(`Invalid monitoring level: ${config.level}`);
        }

        if (config.samplingRate < 0 || config.samplingRate > 1) {
            throw new Error(`Invalid sampling rate: ${config.samplingRate}`);
        }

        // S'assurer que l'ID utilisateur existe
        if (!context.userId) {
            throw new Error('User ID is required for monitoring configuration');
        }

        // Appliquer la configuration de monitoring
        this.monitoringConfigs.set(context.userId, config);
    }

    /**
     * Vérifie le niveau de chiffrement
     * @param context Le contexte de sécurité
     * @param parameters Les paramètres de la règle
     */
    private async enforceEncryption(context: SecurityContext, parameters: PolicyParameters): Promise<void> {
        const requiredLevel = parameters.encryptionLevel ?? 'high';

        // Vérifier si le niveau de chiffrement est défini et conforme
        if (!context.encryptionLevel) {
            throw new Error(`Encryption level not defined. Required: ${requiredLevel}`);
        }

        if (context.encryptionLevel !== requiredLevel) {
            throw new Error(
                `Insufficient encryption level. Required: ${requiredLevel}, ` +
                `Current: ${context.encryptionLevel}`
            );
        }
    }

    /**
     * Exige un niveau d'authentification
     * @param context Le contexte de sécurité
     * @param parameters Les paramètres de la règle
     */
    private async requireAuthentication(context: SecurityContext, parameters: PolicyParameters): Promise<void> {
        const requiredFactors = parameters.requiredFactors ?? 1;
        const currentFactors = this.countAuthenticationFactors(context);

        if (currentFactors < requiredFactors) {
            throw new Error(
                `Insufficient authentication factors. Required: ${requiredFactors}, ` +
                `Current: ${currentFactors}`
            );
        }
    }

    /**
     * Compte le nombre de facteurs d'authentification
     * @param context Le contexte de sécurité
     * @returns Nombre de facteurs
     */
    private countAuthenticationFactors(context: SecurityContext): number {
        let factors = 0;

        // Exemple de comptage des facteurs d'authentification
        if (context.sessionId) factors++; // Présence d'une session
        if (context.roles && context.roles.length > 0) factors++; // Rôles assignés
        if (context.encryptionLevel === 'military') factors++; // Niveau d'encryption élevé

        return factors;
    }

    /**
     * Récupère les restrictions actives pour un utilisateur
     * @param userId ID de l'utilisateur
     * @returns Restriction d'accès ou undefined
     */
    public getActiveRestriction(userId: string): AccessRestriction | undefined {
        return this.activeRestrictions.get(userId);
    }

    /**
     * Récupère la configuration de monitoring pour un utilisateur
     * @param userId ID de l'utilisateur
     * @returns Configuration de monitoring ou undefined
     */
    public getMonitoringConfig(userId: string): MonitoringConfig | undefined {
        return this.monitoringConfigs.get(userId);
    }

    /**
     * Supprime toutes les restrictions pour un utilisateur
     * @param userId ID de l'utilisateur
     */
    public clearRestrictions(userId: string): void {
        this.activeRestrictions.delete(userId);
        this.monitoringConfigs.delete(userId);
    }
}