// src/ai/feedback/evaluation/MetricsCollector.ts
export class MetricsCollector {
    private readonly advancedMetrics: LSFAdvancedMetrics;

    async collect(feedback: FeedbackData): Promise<FeedbackMetrics> {
        return {
            basic: this.collectBasicMetrics(feedback),
            advanced: await this.advancedMetrics.analyze(feedback),
            timing: this.collectTimingMetrics(feedback)
        };
    }

    private collectBasicMetrics(feedback: FeedbackData): BasicMetrics {
        return {
            accuracy: this.calculateAccuracy(feedback),
            completeness: this.calculateCompleteness(feedback),
            relevance: this.calculateRelevance(feedback)
        };
    }
}// src/ai/feedback/evaluation/MetricsCollector.ts
export class MetricsCollector {
    private readonly advancedMetrics: LSFAdvancedMetrics;

    async collect(feedback: FeedbackData): Promise<FeedbackMetrics> {
        return {
            basic: this.collectBasicMetrics(feedback),
            advanced: await this.advancedMetrics.analyze(feedback),
            timing: this.collectTimingMetrics(feedback)
        };
    }

    private collectBasicMetrics(feedback: FeedbackData): BasicMetrics {
        return {
            accuracy: this.calculateAccuracy(feedback),
            completeness: this.calculateCompleteness(feedback),
            relevance: this.calculateRelevance(feedback)
        };
    }
}

// Types communs
interface FeedbackData {
    id: string;
    type: FeedbackType;
    content: any;
    timestamp: number;
    source: FeedbackSource;
    metadata: FeedbackMetadata;
}

interface FeedbackMetrics {
    basic: BasicMetrics;
    advanced: AdvancedMetrics;
    timing: TimingMetrics;
}

interface BasicMetrics {
    accuracy: number;
    completeness: number;
    relevance: number;
}

// Énumérations
enum FeedbackType {
    USER_CORRECTION = 'USER_CORRECTION',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    LEARNING_PROGRESS = 'LEARNING_PROGRESS',
    EMERGENCY = 'EMERGENCY'
}

enum FeedbackSource {
    LSF = 'LSF',
    VOCAL = 'VOCAL',
    MULTIMODAL = 'MULTIMODAL'
}