//src/ai/coordinators/types/feedback.types.ts
export interface FeedbackItem {
    id: string;
    timestamp: number;
    type: string;
    score: number;
    details?: string;
}

export interface FeedbackResponse {
    success: boolean;
    items?: FeedbackItem[];
    error?: string;
}