// src/ai/feedback/learning/PersonalizedLearningPath.ts
export class PersonalizedLearningPath {
    private readonly pathOptimizer: PathOptimizer;
    private readonly database: FeedbackDatabase;

    async adjustPath(
        userId: string, 
        adjustment: PathAdjustment
    ): Promise<UpdatedPath> {
        const currentPath = await this.getCurrentPath(userId);
        const optimizedPath = await this.pathOptimizer.optimize(
            currentPath,
            adjustment
        );

        await this.database.updatePath(userId, optimizedPath);
        return optimizedPath;
    }
}
