//src/ai/system/expressions/cultural/__tests__/utils/core/ValidationStrategy.ts
import {
    TestScenario,
    TestResults,
    CulturalValidation,
    EmergencyValidation,
    CulturalElements,
    EmergencyDetails
} from '../types';

/**
 * Interface de base pour toutes les stratégies de validation
 */
export interface ValidationStrategy<T, R> {
    /**
     * Effectue la validation sur les éléments fournis
     */
    validate(elements: T, results: R): any;
}

/**
 * Stratégie de validation des aspects culturels
 */
export class CulturalValidationStrategy implements ValidationStrategy<CulturalElements, TestResults> {
    validate(culturalElements: CulturalElements, results: TestResults): CulturalValidation {
        const score = results.cultural_integrity;

        return {
            score,
            aspects: {
                authenticity: score * 0.95,
                respect: score * 0.98,
                preservation: score * 0.97
            },
            issues: []
        };
    }
}

/**
 * Stratégie de validation des réponses d'urgence
 */
export class EmergencyValidationStrategy implements ValidationStrategy<EmergencyDetails, TestResults> {
    validate(emergency: EmergencyDetails, results: TestResults): EmergencyValidation {
        const score = results.emergency_response;

        return {
            score,
            aspects: {
                clarity: score * 0.96,
                speed: score * 0.94,
                effectiveness: score * 0.95
            },
            issues: []
        };
    }
}

/**
 * Fabrique de stratégies de validation
 */
export class ValidationStrategyFactory {
    private static instance: ValidationStrategyFactory;
    private strategies: Map<string, ValidationStrategy<any, any>> = new Map();

    private constructor() {
        // Initialiser les stratégies par défaut
        this.registerStrategy('cultural', new CulturalValidationStrategy());
        this.registerStrategy('emergency', new EmergencyValidationStrategy());
    }

    static getInstance(): ValidationStrategyFactory {
        if (!ValidationStrategyFactory.instance) {
            ValidationStrategyFactory.instance = new ValidationStrategyFactory();
        }
        return ValidationStrategyFactory.instance;
    }

    registerStrategy<T, R>(name: string, strategy: ValidationStrategy<T, R>): void {
        this.strategies.set(name, strategy);
    }

    getStrategy<T, R>(name: string): ValidationStrategy<T, R> {
        const strategy = this.strategies.get(name);
        if (!strategy) {
            throw new Error(`Validation strategy '${name}' not registered`);
        }
        return strategy as ValidationStrategy<T, R>;
    }
}