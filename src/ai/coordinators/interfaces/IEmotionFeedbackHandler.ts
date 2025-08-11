//src/ai/coordinators/interfaces/IEmotionFeedbackHandler.ts
import { EmotionFeedback } from '../types/emotion-feedback.types';

export interface IEmotionFeedbackHandler {
    processFeedback(feedback: EmotionFeedback): Promise<boolean>;
    analyzeFeedback(feedback: EmotionFeedback): Promise<Record<string, number>>;
    collectMetrics(): Record<string, unknown>;
}