// src/ai/api/feedback/learning/LearningAdapter.ts
export class LearningAdapter {
    private readonly methodDetector: LearningMethodDetector;
    private readonly inputProcessors: Map<LearningMethod, InputProcessor>;

    async adapt(input: LearningInput, method: LearningMethod): Promise<AdaptedLearning> {
        const processor = this.inputProcessors.get(method);
        return processor.process({
            input,
            method,
            context: await this.gatherContext(input)
        });
    }

    private detectLearningMethod(input: LearningInput): LearningMethod {
        return this.methodDetector.detect({
            content: input.content,
            metadata: input.metadata,
            userInteraction: input.interaction
        });
    }
}