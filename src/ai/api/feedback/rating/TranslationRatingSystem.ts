// src/ai/api/feedback/rating/TranslationRatingSystem.ts
export class TranslationRatingSystem {
    private readonly criteriaEvaluator: CriteriaEvaluator;
    private readonly feedbackAggregator: FeedbackAggregator;
    private readonly qualityAnalyzer: QualityAnalyzer;

    async rateTranslation(translationId: string, ratings: RatingCriteria[]): Promise<RatingResult> {
        const evaluation = await this.criteriaEvaluator.evaluate(ratings);
        await this.feedbackAggregator.aggregate({
            translationId,
            ratings: evaluation,
            timestamp: Date.now()
        });

        const qualityImpact = await this.qualityAnalyzer.analyzeImpact(evaluation);
        return {
            overallScore: this.calculateOverallScore(evaluation),
            criteriaScores: evaluation,
            qualityMetrics: qualityImpact,
            recommendations: this.generateRecommendations(evaluation)
        };
    }

    private calculateOverallScore(evaluation: CriteriaEvaluation[]): number {
        return evaluation.reduce((score, criterion) => 
            score + criterion.score * criterion.weight, 0
        ) / evaluation.reduce((total, criterion) => 
            total + criterion.weight, 0
        );
    }
}

