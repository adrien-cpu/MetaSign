// src/ai/api/feedback/criteria/CriteriaEvaluator.ts

import {
    CriteriaType,
    RatingCriteria,
    CriteriaEvaluation,
    CriteriaValidator,
    WeightCalculator
} from './types';

export class CriteriaEvaluator {
    private readonly criteriaValidators: Map<CriteriaType, CriteriaValidator>;
    private readonly weightCalculator: WeightCalculator;

    constructor(
        validators: Map<CriteriaType, CriteriaValidator>,
        weightCalculator: WeightCalculator
    ) {
        this.criteriaValidators = validators;
        this.weightCalculator = weightCalculator;
    }

    async evaluate(ratings: RatingCriteria[]): Promise<CriteriaEvaluation[]> {
        return Promise.all(ratings.map(async rating => ({
            type: rating.type,
            score: await this.validateCriterion(rating),
            weight: this.weightCalculator.calculate(rating.type),
            feedback: await this.generateFeedback(rating)
        })));
    }

    private async validateCriterion(rating: RatingCriteria): Promise<number> {
        const validator = this.criteriaValidators.get(rating.type);
        if (!validator) {
            throw new Error(`No validator found for criteria type: ${rating.type}`);
        }
        return validator.validate(rating.value);
    }

    private async generateFeedback(rating: RatingCriteria): Promise<string> {
        // Implémentation basique - à améliorer selon les besoins
        if (rating.value >= 0.8) {
            return "Excellent performance";
        } else if (rating.value >= 0.6) {
            return "Good performance with room for improvement";
        } else {
            return "Needs significant improvement";
        }
    }
}