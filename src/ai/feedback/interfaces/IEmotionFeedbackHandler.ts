import { FeedbackEntry, FeedbackAnalysis, FeedbackPattern } from '../types/feedback.types';
import { EmotionState } from '@ai/emotions/types/base';
import { EmotionAnalysis, EmotionAdjustments, EmotionRecommendation } from '../types/emotion-feedback.types';

/**
 * Interface pour un gestionnaire de feedback d'émotions
 */
export interface IEmotionFeedbackHandler {
    /**
     * Traite une entrée de feedback d'émotion
     */
    handle(entry: FeedbackEntry): Promise<FeedbackAnalysis>;

    /**
     * Analyse le feedback d'une émotion
     */
    analyzeEmotionFeedback(emotion: EmotionState): EmotionAnalysis;

    /**
     * Détermine les ajustements à apporter
     */
    determineAdjustments(analysis: EmotionAnalysis): Promise<EmotionAdjustments>;

    /**
     * Identifie les patterns dans l'émotion et les convertit en patterns de feedback
     */
    identifyPatterns(emotion: EmotionState): FeedbackPattern[];

    /**
     * Génère des recommandations d'amélioration
     */
    generateRecommendations(analysis: EmotionAnalysis): Promise<EmotionRecommendation[]>;
}