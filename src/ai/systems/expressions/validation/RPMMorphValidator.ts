// src/ai/systems/expressions/validation/RPMMorphValidator.ts

interface RPMMorphTargets {
    [key: string]: number;
}

interface ValidationResult {
    isValid: boolean;
    issues?: string[];
}

export class RPMMorphValidator {
    private readonly VALID_RANGE = {
        min: 0,
        max: 1
    };

    async validate(morphTargets: RPMMorphTargets): Promise<ValidationResult> {
        const issues: string[] = [];

        // Vérifie si l'objet morphTargets existe et n'est pas vide
        if (!morphTargets || Object.keys(morphTargets).length === 0) {
            issues.push('Morph targets cannot be empty');
            return { isValid: false, issues };
        }

        // Vérifie chaque valeur de morph
        for (const [morphName, value] of Object.entries(morphTargets)) {
            // Vérifie le type de la valeur
            if (typeof value !== 'number') {
                issues.push(`Invalid type for morph ${morphName}: expected number, got ${typeof value}`);
                continue;
            }

            // Vérifie la plage de valeurs
            if (value < this.VALID_RANGE.min || value > this.VALID_RANGE.max) {
                issues.push(`Value out of range for morph ${morphName}: must be between ${this.VALID_RANGE.min} and ${this.VALID_RANGE.max}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues: issues.length > 0 ? issues : undefined
        };
    }
}