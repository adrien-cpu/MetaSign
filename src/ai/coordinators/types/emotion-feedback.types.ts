//src/ai/coordinators/types/emotion-feedback.types.ts
export interface EmotionFeedback {
    sessionId: string;
    timestamp: number;
    emotionType: string;
    intensity: number;
    duration?: number;
    context?: string;
}

export type EmotionFeedbackType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';