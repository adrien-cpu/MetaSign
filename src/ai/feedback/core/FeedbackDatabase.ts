// src/ai/feedback/core/FeedbackDatabase.ts
export class FeedbackDatabase {
    async store(feedback: FeedbackData): Promise<void> {
        // Stockage existant...
    }

    async query(criteria: QueryCriteria): Promise<FeedbackData[]> {
        // Requête existante...
    }
}