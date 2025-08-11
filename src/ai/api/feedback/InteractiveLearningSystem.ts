// src/ai/api/feedback/InteractiveLearningSystem.ts
export class InteractiveLearningSystem {
    private readonly timelineManager: TimelineManager;
    private readonly glossaryManager: GlossaryManager;
    private readonly learningAdapter: LearningAdapter;
    private readonly feedbackCollector: FeedbackCollector;
    private readonly communicationManager: CommunicationManager;

    async handleTimelineCorrection(correction: SignCorrection): Promise<void> {
        const timelineSelection = await this.timelineManager.selectSigns(correction.timeRange);
        
        if (correction.saveForLater) {
            await this.timelineManager.saveToUserInterface(timelineSelection);
        } else {
            await this.glossaryManager.addToCommonGlossary({
                signs: timelineSelection,
                correction: correction.correctedSigns,
                metadata: this.createCorrectionMetadata(correction)
            });
        }
    }

    async handleConversationalLearning(input: LearningInput): Promise<LearningResponse> {
        const learningMethod = this.detectLearningMethod(input);
        const adaptedInput = await this.learningAdapter.adapt(input, learningMethod);
        
        return {
            learned: await this.applyLearning(adaptedInput),
            confirmation: await this.generateConfirmation(learningMethod),
            nextSteps: this.suggestNextSteps(learningMethod)
        };
    }

    async handleUnknownSign(sign: string): Promise<CommunicationStrategy[]> {
        await this.communicationManager.notifyUnknownSign(sign);
        return this.communicationManager.generateAlternatives({
            type: 'UNKNOWN_SIGN',
            context: { sign },
            availableMethods: ['REFORMULATION', 'EXAMPLES', 'MIME', 'SUBTITLES']
        });
    }
}