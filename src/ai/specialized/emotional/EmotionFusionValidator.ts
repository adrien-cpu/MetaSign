// src/ai/specialized/emotional/EmotionFusionValidator.ts
import { IValidator } from '../../api/common/validation/interfaces/IValidator';
import { ValidationService } from '../../api/common/validation/ValidationService';
import { SystemeControleEthique } from '../../ethics/core/EthicsCore';
import { ValidationResult, ValidationContext } from '../../api/common/validation/types/ValidationTypes';
import { EmotionalState } from '../../types/base';

export class EmotionFusionValidator implements IValidator {
    constructor(
        private readonly validationService: ValidationService,
        private readonly ethicsSystem: SystemeControleEthique
    ) { }

    async validate(
        input: { lsf: EmotionalState; vocal: EmotionalState },
        context: ValidationContext
    ): Promise<ValidationResult> {
        // Validation de la cohérence entre les émotions LSF et vocales
        const coherenceValidation = await this.validateEmotionalCoherence(input);

        // Vérification éthique de la fusion
        const ethicsValidation = await this.ethicsSystem.validateEmotionFusion(input);

        // Validation de l'intensité combinée
        const intensityValidation = this.validateCombinedIntensity(input);

        // Combiner les résultats
        return this.validationService.combineResults([
            coherenceValidation,
            ethicsValidation,
            intensityValidation
        ]);
    }

    private async validateEmotionalCoherence(
        input: { lsf: EmotionalState; vocal: EmotionalState }
    ): Promise<ValidationResult> {
        const issues = [];

        // Vérifier la compatibilité des émotions
        if (!this.areEmotionsCompatible(input.lsf, input.vocal)) {
            issues.push({
                type: 'emotion_compatibility',
                severity: 'error',
                message: 'Émotions LSF et vocales incompatibles'
            });
        }

        return {
            isValid: issues.length === 0,
            issues,
            score: this.calculateCoherenceScore(issues)
        };
    }

    private validateCombinedIntensity(
        input: { lsf: EmotionalState; vocal: EmotionalState }
    ): ValidationResult {
        const issues = [];
        const combinedIntensity = this.calculateCombinedIntensity(input);

        if (combinedIntensity > 1.0) {
            issues.push({
                type: 'intensity',
                severity: 'warning',
                message: 'Intensité émotionnelle combinée trop élevée'
            });
        }

        return {
            isValid: issues.length === 0,
            issues,
            score: this.calculateIntensityScore(issues)
        };
    }

    private areEmotionsCompatible(lsf: EmotionalState, vocal: EmotionalState): boolean {
        // Implémentation de la vérification de compatibilité
        return true; // À implémenter
    }

    private calculateCombinedIntensity(
        input: { lsf: EmotionalState; vocal: EmotionalState }
    ): number {
        // Implémentation du calcul d'intensité combinée
        return 0.5; // À implémenter
    }

    private calculateCoherenceScore(issues: any[]): number {
        // Même logique que les autres validateurs
        const baseScore = 1.0;
        const penaltyPerError = 0.2;
        const penaltyPerWarning = 0.1;

        const errors = issues.filter(i => i.severity === 'error').length;
        const warnings = issues.filter(i => i.severity === 'warning').length;

        return Math.max(0, baseScore - (errors * penaltyPerError + warnings * penaltyPerWarning));
    }

    private calculateIntensityScore(issues: any[]): number {
        // Même logique que calculateCoherenceScore
        return this.calculateCoherenceScore(issues);
    }
}