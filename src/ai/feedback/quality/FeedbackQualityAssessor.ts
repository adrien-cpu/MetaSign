import { FeedbackData } from '../types/index';

export class FeedbackQualityAssessor {
    async assess(feedback: FeedbackData): Promise<number> {
        const qualityMetrics = await Promise.all([
            this.assessCompleteness(feedback),
            this.assessRelevance(feedback),
            this.assessTimeliness(feedback),
            this.assessClarity(feedback)
        ]);

        return this.calculateQualityScore(qualityMetrics);
    }

    private async assessCompleteness(feedback: FeedbackData): Promise<number> {
        const requiredFields = [
            'emotion',
            'expression',
            'input',
            'context'
        ];

        const completeness = requiredFields.reduce((score, field) => {
            return score + (feedback[field] ? 1 : 0);
        }, 0) / requiredFields.length;

        return completeness;
    }

    private async assessRelevance(feedback: FeedbackData): Promise<number> {
        // Évalue la pertinence du feedback par rapport au contexte
        const contextRelevance = this.evaluateContextRelevance(feedback);
        const contentRelevance = this.evaluateContentRelevance(feedback);

        return (contextRelevance + contentRelevance) / 2;
    }

    private async assessTimeliness(feedback: FeedbackData): Promise<number> {
        const currentTime = Date.now();
        const feedbackTime = feedback.context.timestamp || currentTime;

        // Calcul de la fraîcheur du feedback (diminue avec le temps)
        const timeDifference = currentTime - feedbackTime;
        const maxAcceptableDelay = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

        return Math.max(0, 1 - (timeDifference / maxAcceptableDelay));
    }

    private async assessClarity(feedback: FeedbackData): Promise<number> {
        // Évalue la clarté et la précision du feedback
        const expressionClarity = this.evaluateExpressionClarity(feedback);
        const contextClarity = this.evaluateContextClarity(feedback);

        return (expressionClarity + contextClarity) / 2;
    }

    private evaluateContextRelevance(feedback: FeedbackData): number {
        // Implémentation réelle de l'évaluation de la pertinence du contexte
        if (!feedback.context) {
            return 0.5;
        }

        // Analyse des éléments contextuels pertinents
        let relevanceScore = 0.7; // Score de base

        if (feedback.context.userProfile) {
            relevanceScore += 0.1;
        }

        if (feedback.context.environment) {
            relevanceScore += 0.05;
        }

        return Math.min(relevanceScore, 1.0);
    }

    private evaluateContentRelevance(feedback: FeedbackData): number {
        // Implémentation réelle de l'évaluation de la pertinence du contenu
        if (!feedback.expression && !feedback.emotion) {
            return 0.4; // Feedback peu pertinent sans ces informations
        }

        let relevanceScore = 0.6; // Score de base

        if (feedback.expression && feedback.expression.details) {
            relevanceScore += 0.15;
        }

        if (feedback.emotion && feedback.emotion.details) {
            relevanceScore += 0.15;
        }

        if (feedback.input && feedback.input.text) {
            relevanceScore += 0.1;
        }

        return Math.min(relevanceScore, 1.0);
    }

    private evaluateExpressionClarity(feedback: FeedbackData): number {
        // Implémentation réelle de l'évaluation de la clarté de l'expression
        if (!feedback.expression) {
            return 0.5;
        }

        let clarityScore = feedback.expression.clarity || 0.6;

        // Ajuster le score en fonction d'autres facteurs
        if (feedback.expression.details && feedback.expression.details.length > 20) {
            clarityScore = Math.min(clarityScore + 0.1, 1.0);
        }

        if (feedback.expression.accuracy && feedback.expression.accuracy > 0.8) {
            clarityScore = Math.min(clarityScore + 0.05, 1.0);
        }

        return clarityScore;
    }

    private evaluateContextClarity(feedback: FeedbackData): number {
        // Implémentation réelle de l'évaluation de la clarté du contexte
        if (!feedback.context) {
            return 0.5;
        }

        let clarityScore = 0.7; // Score de base

        if (feedback.context.sessionId) {
            clarityScore += 0.1;
        }

        if (feedback.context.userProfile && feedback.context.userProfile.expertiseLevel) {
            clarityScore += 0.1;
        }

        if (feedback.context.environment) {
            clarityScore += 0.1;
        }

        return Math.min(clarityScore, 1.0);
    }

    private calculateQualityScore(metrics: number[]): number {
        const weights = [0.3, 0.3, 0.2, 0.2]; // Poids pour chaque métrique
        return metrics.reduce((score, metric, index) => {
            return score + (metric * weights[index]);
        }, 0);
    }
}