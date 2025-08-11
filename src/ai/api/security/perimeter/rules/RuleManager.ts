// src/ai/api/security/perimeter/rules/RuleManager.ts

import {
    AccessRule,
    AccessCondition,
    AccessRequest,
    AccessResult,
    PerimeterError
} from '@security/types/perimeter-types';
import { SecurityAuditor } from '@security/types/SecurityTypes';

export class RuleManager {
    constructor(
        private readonly securityAuditor: SecurityAuditor
    ) { }

    /**
     * Ajoute une règle d'accès à une zone
     * @param zoneRules - Les règles de la zone
     * @param rule - La règle à ajouter
     * @param zoneId - L'identifiant de la zone
     */
    async addAccessRule(zoneRules: AccessRule[], rule: AccessRule, zoneId: string): Promise<void> {
        // Valider la règle
        await this.validateAccessRule(rule);

        // Ajouter la règle
        zoneRules.push(rule);

        // Trier les règles par priorité (les plus hautes d'abord)
        zoneRules.sort((a, b) => b.priority - a.priority);

        // Auditer l'ajout de règle
        await this.auditRuleChange('add', zoneId, rule);
    }

    /**
     * Valide une règle d'accès
     * @param rule - La règle à valider
     */
    async validateAccessRule(rule: AccessRule): Promise<void> {
        // Vérifier les paramètres obligatoires
        if (!rule.id || !rule.type || !rule.conditions || !rule.action) {
            throw new PerimeterError(
                'Invalid rule configuration: missing required parameters',
                'INVALID_RULE_CONFIG'
            );
        }

        // Vérifier les conditions
        for (const condition of rule.conditions) {
            if (!condition.evaluate) {
                throw new PerimeterError(
                    `Invalid condition in rule ${rule.id}: missing evaluate function`,
                    'INVALID_CONDITION'
                );
            }
        }

        // Vérifier l'expiration
        if (rule.expiresAt && rule.expiresAt < Date.now()) {
            throw new PerimeterError(
                `Rule ${rule.id} is already expired`,
                'RULE_EXPIRED'
            );
        }
    }

    /**
     * Vérifie les conflits entre règles
     * @param rules - Les règles à vérifier
     */
    async validateRuleConflicts(rules: AccessRule[]): Promise<void> {
        for (let i = 0; i < rules.length; i++) {
            for (let j = i + 1; j < rules.length; j++) {
                if (await this.rulesConflict(rules[i], rules[j])) {
                    throw new PerimeterError(
                        `Rule conflict detected between ${rules[i].id} and ${rules[j].id}`,
                        'RULE_CONFLICT'
                    );
                }
            }
        }
    }

    /**
     * Vérifie si deux règles sont en conflit
     * @param rule1 - Première règle
     * @param rule2 - Deuxième règle
     */
    async rulesConflict(rule1: AccessRule, rule2: AccessRule): Promise<boolean> {
        if (rule1.priority === rule2.priority &&
            rule1.type !== rule2.type &&
            this.conditionsOverlap(rule1.conditions, rule2.conditions)) {
            return true;
        }
        return false;
    }

    /**
     * Vérifie si des conditions se chevauchent
     * @param conditions1 - Premier ensemble de conditions
     * @param conditions2 - Deuxième ensemble de conditions
     */
    private conditionsOverlap(
        conditions1: AccessCondition[],
        conditions2: AccessCondition[]
    ): boolean {
        // Analyse simple de chevauchement: si un type de condition similaire est présent
        // dans les deux ensembles, considérer qu'il y a un risque de chevauchement
        const types1 = new Set(conditions1.map(c => c.type));
        const types2 = new Set(conditions2.map(c => c.type));

        // Vérifier si des types se chevauchent
        for (const type of types1) {
            if (types2.has(type)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Applique les règles d'une zone à une requête d'accès
     * @param rules - Les règles à appliquer
     * @param request - La requête d'accès
     */
    async applyZoneRules(
        rules: AccessRule[],
        request: AccessRequest
    ): Promise<AccessResult> {
        const auditTrail = {
            rules: [] as string[],
            decisions: [] as string[],
            timestamp: Date.now()
        };

        for (const rule of rules) {
            // Vérifier si la règle est applicable
            if (await this.shouldApplyRule(rule)) {
                auditTrail.rules.push(rule.id);

                const decision = await this.evaluateRule(rule, request);
                auditTrail.decisions.push(decision.reason || '');

                if (decision.allowed === false) {
                    return {
                        ...decision,
                        auditTrail
                    };
                }
            }
        }

        return {
            allowed: true,
            reason: 'No blocking rules found',
            auditTrail
        };
    }

    /**
     * Vérifie si une règle doit être appliquée
     * @param rule - La règle à vérifier
     */
    private async shouldApplyRule(rule: AccessRule): Promise<boolean> {
        // Vérifier l'expiration
        if (rule.expiresAt && rule.expiresAt < Date.now()) {
            return false;
        }

        // Vérifier les restrictions temporelles
        if (!this.isWithinTimeRestrictions(rule.timeRestrictions)) {
            return false;
        }

        return true;
    }

    /**
     * Évalue une règle pour une requête d'accès
     * @param rule - La règle à évaluer
     * @param request - La requête d'accès
     */
    async evaluateRule(
        rule: AccessRule,
        request: AccessRequest
    ): Promise<AccessResult> {
        // Évaluer toutes les conditions
        for (const condition of rule.conditions) {
            try {
                const conditionMet = await condition.evaluate(request.context);
                if (!conditionMet) {
                    return this.createAccessResult(
                        false,
                        `Condition not met: ${condition.type}`
                    );
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return this.createAccessResult(
                    false,
                    `Condition evaluation failed: ${errorMessage}`
                );
            }
        }

        // Appliquer l'action selon son type
        switch (rule.action.type) {
            case 'permit':
                return this.createAccessResult(true, 'Access permitted');

            case 'deny':
                return this.createAccessResult(false, 'Access denied');

            case 'challenge':
                return this.handleChallenge(rule.action.parameters);

            case 'quarantine':
                return this.handleQuarantine(rule.action.parameters);

            default:
                return this.createAccessResult(false, 'Unknown action type');
        }
    }

    /**
     * Vérifie si on est dans les restrictions temporelles
     * @param restrictions - Les restrictions temporelles
     */
    isWithinTimeRestrictions(
        restrictions?: TimeRestriction[]
    ): boolean {
        if (!restrictions || restrictions.length === 0) {
            return true;
        }

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        return restrictions.some(restriction => {
            // Vérifier explicitement que les propriétés ont le type attendu
            if (!Array.isArray(restriction.daysOfWeek) ||
                typeof restriction.startTime !== 'string' ||
                typeof restriction.endTime !== 'string') {
                return false;
            }

            return restriction.daysOfWeek.includes(currentDay) &&
                currentTime >= restriction.startTime &&
                currentTime <= restriction.endTime;
        });
    }

    /**
     * Gère l'action de challenge
     * @param parameters - Les paramètres du challenge
     */
    private handleChallenge(parameters: unknown): AccessResult {
        return {
            allowed: false,
            reason: 'Additional authentication required',
            conditions: typeof parameters === 'object' ? parameters : {},
            auditTrail: {
                rules: ['challenge'],
                decisions: ['pending_challenge'],
                timestamp: Date.now()
            }
        };
    }

    /**
     * Gère l'action de quarantaine
     * @param parameters - Les paramètres de la quarantaine
     */
    private handleQuarantine(parameters: unknown): AccessResult {
        return {
            allowed: false,
            reason: 'Resource quarantined',
            conditions: typeof parameters === 'object' ? parameters : {},
            auditTrail: {
                rules: ['quarantine'],
                decisions: ['resource_quarantined'],
                timestamp: Date.now()
            }
        };
    }

    /**
     * Crée un résultat d'accès
     * @param allowed - Si l'accès est autorisé
     * @param reason - La raison de la décision
     * @param extra - Données supplémentaires
     */
    createAccessResult(
        allowed: boolean,
        reason: string,
        extra?: Partial<AccessResult>
    ): AccessResult {
        return {
            allowed,
            reason,
            auditTrail: {
                rules: [],
                decisions: [reason],
                timestamp: Date.now()
            },
            ...extra
        };
    }

    /**
     * Audite un changement de règle
     * @param action - L'action effectuée
     * @param zoneId - L'identifiant de la zone
     * @param rule - La règle modifiée
     */
    private async auditRuleChange(
        action: string,
        zoneId: string,
        rule: AccessRule
    ): Promise<void> {
        await this.securityAuditor.logSecurityEvent({
            type: 'rule_configuration',
            severity: 'HIGH',
            timestamp: new Date(),
            details: {
                action,
                zoneId,
                ruleId: rule.id,
                ruleType: rule.type,
                priority: rule.priority
            },
            source: 'RuleManager',
            context: {
                userId: 'system',
                roles: ['admin'],
                permissions: ['rules:write'],
                operation: 'rule_update',
                resource: rule.id,
                deviceType: 'system',
                deviceSecurityLevel: 10,
                ipAddress: '127.0.0.1',
                allowed: true,
                reason: `Rule ${action}: ${rule.id}`,
                sourceZone: 'system',
                targetZone: zoneId
            }
        });
    }
}