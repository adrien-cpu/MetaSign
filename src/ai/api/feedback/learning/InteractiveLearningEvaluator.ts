// src/ai/api/feedback/learning/InteractiveLearningEvaluator.ts
export class InteractiveLearningEvaluator {
    private readonly successAnalyzer: SuccessAnalyzer;
    private readonly comprehensionTester: ComprehensionTester;

    async evaluateLearningSession(session: LearningSession): Promise<LearningEvaluation> {
        const success = await this.successAnalyzer.analyze(session);
        const comprehension = await this.comprehensionTester.test(session);

        return {
            success,
            comprehension,
            improvements: this.identifyImprovements(session),
            nextSteps: this.planNextSteps(success, comprehension)
        };
    }

    private identifyImprovements(session: LearningSession): Improvement[] {
        return this.analyzeInteractions(session.interactions)
            .filter(interaction => interaction.needsImprovement)
            .map(interaction => ({
                type: interaction.type,
                currentLevel: interaction.level,
                suggestedImprovement: this.suggestImprovement(interaction)
            }));
    }
}