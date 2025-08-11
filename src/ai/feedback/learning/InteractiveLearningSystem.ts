// src/ai/feedback/learning/InteractiveLearningSystem.ts
export class InteractiveLearningSystem {
    private readonly database: FeedbackDatabase;
    private readonly metricsCollector: MetricsCollector;
    private readonly learningPathManager: PersonalizedLearningPath;

    async handleLearningFeedback(feedback: LearningFeedback): Promise<void> {
        await this.database.store(feedback);
        
        const metrics = await this.metricsCollector.collect(feedback);
        await this.updateLearningPath(feedback, metrics);
    }

    private async updateLearningPath(
        feedback: LearningFeedback, 
        metrics: FeedbackMetrics
    ): Promise<void> {
        await this.learningPathManager.adjustPath(feedback.userId, {
            feedback,
            metrics,
            timestamp: Date.now()
        });
    }
}