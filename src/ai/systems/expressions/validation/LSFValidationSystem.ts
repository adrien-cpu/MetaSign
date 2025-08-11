// src/ai/systems/expressions/validation/LSFValidationSystem.ts
import { LSFExpression } from '../../../types';

export class LSFValidationSystem {
    private readonly REQUIRED_COMPONENTS = ['eyebrows', 'eyes', 'mouth'] as const;
    private readonly VALID_RANGE = { min: 0, max: 1 };

    async validate(expression: unknown): Promise<{ isValid: boolean; issues: string[] }> {
        const issues: string[] = [];

        // Vérification du type
        if (!this.isLSFExpression(expression)) {
            return {
                isValid: false,
                issues: ['Expression invalide : format incorrect']
            };
        }

        // Vérification des composants requis
        for (const component of this.REQUIRED_COMPONENTS) {
            if (!(component in expression)) {
                issues.push(`Composant manquant : ${component}`);
                continue;
            }

            const componentValues = expression[component];
            if (typeof componentValues !== 'object' || componentValues === null) {
                issues.push(`Type invalide pour le composant ${component}`);
                continue;
            }

            // Vérification des valeurs
            for (const [key, value] of Object.entries(componentValues)) {
                if (typeof value !== 'number') {
                    issues.push(`Valeur invalide pour ${component}.${key} : doit être un nombre`);
                    continue;
                }

                if (value < this.VALID_RANGE.min || value > this.VALID_RANGE.max) {
                    issues.push(
                        `Valeur hors limites pour ${component}.${key} : doit être entre ${this.VALID_RANGE.min} et ${this.VALID_RANGE.max}`
                    );
                }
            }
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    private isLSFExpression(value: unknown): value is LSFExpression {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        for (const component of Object.values(value)) {
            if (typeof component !== 'object' || component === null) {
                return false;
            }

            for (const val of Object.values(component)) {
                if (typeof val !== 'number') {
                    return false;
                }
            }
        }

        return true;
    }
}