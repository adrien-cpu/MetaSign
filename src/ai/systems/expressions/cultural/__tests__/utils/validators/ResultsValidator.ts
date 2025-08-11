//src/ai/system/expressions/cultural/__tests__/utils/validators/ResultsValidator.ts
import {
    TestScenario,
    TestResults,
    ValidationReport,
    CulturalValidation,
    EmergencyValidation,
    ValidationScore,
    ImprovementSuggestion
} from '../types';
import { ValidationStrategyFactory } from '../core/ValidationStrategy';

/**
 * Validateur de résultats de test
 */
export class ResultsValidator {
    private readonly strategyFactory: ValidationStrategyFactory;

    constructor() {
        this.strategyFactory = ValidationStrategyFactory.getInstance();
    }

    /**
     * Valide les résultats de test par rapport au scénario
     */
    validate(scenario: TestScenario, results: TestResults): ValidationReport {
        // Utiliser les stratégies spécifiques pour chaque aspect
        const culturalStrategy = this.strategyFactory.getStrategy<typeof scenario.culturalElements, typeof results>('cultural');
        const emergencyStrategy = this.strategyFactory.getStrategy<typeof scenario.emergency, typeof results>('emergency');

        const culturalValidation = culturalStrategy.validate(scenario.culturalElements, results);
        const emergencyValidation = emergencyStrategy.validate(scenario.emergency, results);

        const overallValidation = this.calculateOverallValidation([
            culturalValidation,
            emergencyValidation
        ]);

        return {
            overall: overallValidation,
            details: {
                cultural: culturalValidation,
                emergency: emergencyValidation
            },
            improvements: this.generateImprovementSuggestions(
                culturalValidation,
                emergencyValidation
            )
        };
    }

    /**
     * Calcule la validation globale à partir de validations individuelles
     */
    private calculateOverallValidation(validations: (CulturalValidation | EmergencyValidation)[]): ValidationScore {
        const totalScore = validations.reduce((sum, v) => sum + v.score, 0) / validations.length;

        return {
            score: totalScore,
            passed: totalScore >= 0.85,
            threshold: 0.85
        };
    }

    /**
     * Génère des suggestions d'amélioration basées sur les validations
     */
    private generateImprovementSuggestions(
        culturalValidation: CulturalValidation,
        emergencyValidation: EmergencyValidation
    ): ImprovementSuggestion[] {
        const suggestions: ImprovementSuggestion[] = [];

        if (culturalValidation.score < 0.9) {
            suggestions.push({
                area: 'cultural_authenticity',
                description: 'Améliorer l\'authenticité culturelle des expressions',
                priority: 'MEDIUM',
                impact: 0.15
            });
        }

        if (emergencyValidation.score < 0.9) {
            suggestions.push({
                area: 'emergency_clarity',
                description: 'Améliorer la clarté des messages d\'urgence',
                priority: 'HIGH',
                impact: 0.2
            });
        }

        return suggestions;
    }
}