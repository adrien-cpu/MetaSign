/**
 * src/ai/api/common/validation/utils/RuleAdapter.ts
 * @file RuleAdapter.ts
 * @description
 * Fournit un adaptateur pour convertir entre des règles de validation génériques et des règles spécifiques
 * à la Langue des Signes Française (LSF), notamment les règles syntaxiques, sémantiques et culturelles.
 */

import {
    ValidationContext,
    ValidationResult
} from '../types/ValidationTypes';
import {
    LSFExpression,
    LSFSyntaxRule,
    LSFSemanticRule,
    LSFCulturalRule,
    LSFSyntaxRuleType,
    BaseValidationRule
} from '../types/LSFTypes';

/**
 * Types de règles de validation.
 */
export type ValidationRuleType = 'syntax' | 'semantic' | 'cultural' | 'security';

/**
 * Interface pour une règle de validation générique.
 */
export interface ValidationRule extends Omit<BaseValidationRule, 'errorMessage'> {
    /**
     * Type de la règle de validation.
     */
    type: ValidationRuleType;

    /**
     * Vérifie si la règle est applicable à un ensemble de données donné.
     * 
     * @param data Données à valider.
     * @returns `true` si la règle est applicable, sinon `false`.
     */
    isApplicable: (data: unknown) => boolean;

    /**
     * Valide un ensemble de données dans un contexte donné.
     * 
     * @param data Données à valider.
     * @param context Contexte de validation.
     * @returns Un résultat de validation sous forme de promesse.
     */
    validate: (data: unknown, context: ValidationContext) => Promise<ValidationResult>;

    /**
     * Nom de la règle (facultatif).
     */
    name?: string;
}

/**
 * Classe utilitaire pour convertir entre des règles génériques et des règles spécifiques à la LSF.
 */
export class RuleAdapter {
    /**
     * Convertit une règle générique en une règle spécifique à la LSF.
     * 
     * @param rule Règle générique à convertir.
     * @returns Une règle LSF spécifique (syntaxique, sémantique ou culturelle) ou `null` si incompatible.
     */
    static toSpecificRule(rule: ValidationRule): LSFSyntaxRule | LSFSemanticRule | LSFCulturalRule | null {
        switch (rule.type) {
            case 'syntax':
                return RuleAdapter.createSyntaxRule(rule);
            case 'semantic':
                return RuleAdapter.createSemanticRule(rule);
            case 'cultural':
                return RuleAdapter.createCulturalRule(rule);
            default:
                return null;
        }
    }

    /**
     * Crée une règle syntaxique LSF à partir d'une règle générique.
     * 
     * @param rule Règle générique.
     * @returns Une règle syntaxique LSF.
     */
    private static createSyntaxRule(rule: ValidationRule): LSFSyntaxRule {
        return {
            id: rule.id,
            description: rule.description,
            severity: rule.severity,
            errorMessage: rule.name || rule.description,
            isEnabled: rule.isEnabled || false,
            type: 'sequence' as LSFSyntaxRuleType, // Type par défaut
            conditions: [() => {
                // Implémentation par défaut simple
                return true;
            }]
        };
    }

    /**
     * Crée une règle sémantique LSF à partir d'une règle générique.
     * 
     * @param rule Règle générique.
     * @returns Une règle sémantique LSF.
     */
    private static createSemanticRule(rule: ValidationRule): LSFSemanticRule {
        return {
            id: rule.id,
            description: rule.description,
            severity: rule.severity,
            errorMessage: rule.name || rule.description,
            isEnabled: rule.isEnabled || false,
            context: ['general'], // Contexte par défaut
            validate: () => {
                // Implémentation par défaut
                return true;
            }
        };
    }

    /**
     * Crée une règle culturelle LSF à partir d'une règle générique.
     * 
     * @param rule Règle générique.
     * @returns Une règle culturelle LSF.
     */
    private static createCulturalRule(rule: ValidationRule): LSFCulturalRule {
        return {
            id: rule.id,
            description: rule.description,
            severity: rule.severity,
            errorMessage: rule.name || rule.description,
            isEnabled: rule.isEnabled || false,
            region: ['default'],
            context: ['general'],
            validate: () => {
                // Implémentation par défaut
                return true;
            }
        };
    }

    /**
     * Convertit une règle LSF spécifique en une règle générique.
     * 
     * @param specificRule Règle LSF spécifique à convertir.
     * @param type Type de la règle générique.
     * @returns Une règle générique.
     */
    static toGenericRule(
        specificRule: LSFSyntaxRule | LSFSemanticRule | LSFCulturalRule,
        type: ValidationRuleType
    ): ValidationRule {
        return {
            id: specificRule.id,
            description: specificRule.description,
            severity: specificRule.severity,
            type: type,
            isEnabled: specificRule.isEnabled,
            isApplicable: () => true,
            validate: async (data: unknown, context: ValidationContext): Promise<ValidationResult> => {
                // Implémentation basique - serait plus complexe en pratique
                if (type === 'syntax' && 'conditions' in specificRule) {
                    const expression = data as LSFExpression;
                    const isValid = specificRule.conditions.every(condition =>
                        condition(expression)
                    );
                    return {
                        success: isValid,
                        isValid,
                        errors: [],
                        metadata: {
                            validatedAt: Date.now(),
                            duration: 0,
                            validator: 'RuleAdapter',
                            version: '1.0.0',
                            configuration: { rules: { syntax: 1, semantic: 0, cultural: 0 } },
                            context: {
                                environment: context.environment || 'default'
                            }
                        }
                    };
                }
                // Par défaut, nous retournons simplement valide
                return {
                    success: true,
                    isValid: true,
                    errors: [],
                    metadata: {
                        validatedAt: Date.now(),
                        duration: 0,
                        validator: 'RuleAdapter',
                        version: '1.0.0',
                        configuration: { rules: { syntax: 0, semantic: 0, cultural: 0 } },
                        context: {
                            environment: context.environment || 'default'
                        }
                    }
                };
            }
        };
    }
}