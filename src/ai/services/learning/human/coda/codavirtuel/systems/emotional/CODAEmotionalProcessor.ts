/**
 * Processeur émotionnel pour le système CODA
 * @file emotional/CODAEmotionalProcessor.ts
 */

import { EvaluationResult } from '../../exercises';
import { CODALearningState } from '../state/CODAStateManager';
import { CODAResponse } from '../response/CODAResponseGenerator';
import { AIEmotionalSystem } from '../AIEmotionalSystem';

export interface TrainerFeedback {
    readonly evaluation: EvaluationResult;
    readonly additionalComments?: string;
    readonly encouragement?: string;
    readonly corrections?: readonly string[];
    readonly nextSteps?: readonly string[];
    readonly culturalContext?: readonly string[];
}

export class CODAEmotionalProcessor {
    private readonly emotionalSystem: AIEmotionalSystem;

    constructor() {
        this.emotionalSystem = new AIEmotionalSystem();
    }

    public async initialize(): Promise<void> {
        await this.emotionalSystem.setInitialState({
            confidence: 0.6,
            motivation: 0.8,
            engagement: 0.7
        });
    }

    public calculateEmotionalUpdate(response: CODAResponse, currentState: CODALearningState): CODALearningState['emotionalState'] {
        const current = currentState.emotionalState;
        const reactionImpact = response.emotionalReaction.intensity * 0.1;

        let confidenceDelta = 0;
        let motivationDelta = 0;
        let frustrationDelta = 0;
        let engagementDelta = 0;

        switch (response.emotionalReaction.type) {
            case 'excitement':
                confidenceDelta = reactionImpact;
                motivationDelta = reactionImpact;
                engagementDelta = reactionImpact;
                frustrationDelta = -reactionImpact * 0.5;
                break;
            case 'understanding':
                confidenceDelta = reactionImpact * 0.7;
                motivationDelta = reactionImpact * 0.5;
                engagementDelta = reactionImpact * 0.3;
                break;
            case 'confusion':
                frustrationDelta = reactionImpact * 0.3;
                engagementDelta = reactionImpact * 0.2;
                break;
            case 'frustration':
                frustrationDelta = reactionImpact;
                motivationDelta = -reactionImpact * 0.3;
                confidenceDelta = -reactionImpact * 0.2;
                break;
            case 'curiosity':
                engagementDelta = reactionImpact;
                motivationDelta = reactionImpact * 0.5;
                break;
        }

        return {
            confidence: Math.max(0.1, Math.min(1, current.confidence + confidenceDelta)),
            motivation: Math.max(0.1, Math.min(1, current.motivation + motivationDelta)),
            frustration: Math.max(0, Math.min(1, current.frustration + frustrationDelta)),
            engagement: Math.max(0.1, Math.min(1, current.engagement + engagementDelta))
        };
    }

    public async processFeedback(feedback: TrainerFeedback): Promise<void> {
        const emotionalImpact = this.calculateFeedbackEmotionalImpact(feedback);
        await this.emotionalSystem.processFeedback(emotionalImpact);
    }

    public analyzePerformanceAreas(feedback: TrainerFeedback): {
        strongAreas: readonly string[];
        weakAreas: readonly string[];
    } {
        const strongAreas: string[] = [];
        const weakAreas: string[] = [];

        if (feedback.evaluation.correct && feedback.evaluation.score > 0.8) {
            strongAreas.push('current-exercise-type');
        } else if (!feedback.evaluation.correct || feedback.evaluation.score < 0.5) {
            weakAreas.push('current-exercise-type');
        }

        if (feedback.corrections) {
            for (const correction of feedback.corrections) {
                if (correction.includes('grammar')) weakAreas.push('grammar');
                if (correction.includes('expression')) weakAreas.push('facial-expressions');
                if (correction.includes('mouvement')) weakAreas.push('movement-precision');
            }
        }

        return { strongAreas, weakAreas };
    }

    public generateLearningInsights(feedback: TrainerFeedback): readonly string[] {
        const insights: string[] = [];

        if (feedback.evaluation.score > 0.9) {
            insights.push('Excellente maîtrise démontrée');
        } else if (feedback.evaluation.score > 0.7) {
            insights.push('Bonne compréhension avec place pour amélioration');
        } else {
            insights.push('Besoin de pratique supplémentaire dans ce domaine');
        }

        if (feedback.culturalContext && feedback.culturalContext.length > 0) {
            insights.push('Apprentissage culturel enrichi');
        }

        return insights;
    }

    public calculateQuestionUrgency(state: CODALearningState): 'low' | 'medium' | 'high' {
        if (state.emotionalState.frustration > 0.7) return 'high';
        if (state.emotionalState.frustration > 0.5) return 'medium';
        return 'low';
    }

    public getQuestionEmotionalContext(category: 'clarification' | 'cultural' | 'technical' | 'practice'): CODAResponse['emotionalReaction'] {
        const emotionMap = {
            clarification: { type: 'confusion' as const, intensity: 0.6 },
            cultural: { type: 'curiosity' as const, intensity: 0.8 },
            technical: { type: 'confusion' as const, intensity: 0.5 },
            practice: { type: 'excitement' as const, intensity: 0.7 }
        };

        return emotionMap[category];
    }

    private calculateFeedbackEmotionalImpact(feedback: TrainerFeedback): Record<string, number> {
        const impact: Record<string, number> = {};

        if (feedback.evaluation.correct) {
            impact.joy = feedback.evaluation.score;
            impact.confidence = feedback.evaluation.score * 0.8;
            impact.pride = feedback.evaluation.score * 0.6;
        } else {
            impact.disappointment = (1 - feedback.evaluation.score) * 0.7;
            impact.determination = (1 - feedback.evaluation.score) * 0.5;
        }

        if (feedback.encouragement) {
            impact.motivation = 0.3;
            impact.warmth = 0.4;
        }

        return impact;
    }
}