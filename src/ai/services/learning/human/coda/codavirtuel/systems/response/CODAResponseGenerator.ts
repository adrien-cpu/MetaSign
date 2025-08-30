/**
 * Générateur de réponses pour le système CODA
 * @file response/CODAResponseGenerator.ts
 */

import { Exercise, CECRLLevel, SupportedExerciseType } from '../../exercises';
import { CODASystemConfig } from '../config/CODAConfigManager';
import { CODALearningState } from '../state/CODAStateManager';
import { ErrorSimulator } from '../../simulation/ErrorSimulator';

export interface CODAResponse {
    readonly answer: unknown;
    readonly confidence: number;
    readonly processingTime: number;
    readonly questionAsked?: string;
    readonly emotionalReaction: {
        readonly type: 'confusion' | 'understanding' | 'excitement' | 'frustration' | 'curiosity';
        readonly intensity: number;
    };
    readonly metadata: {
        readonly responseId: string;
        readonly timestamp: Date;
        readonly simulatedErrors?: readonly string[];
        readonly learningInsights?: readonly string[];
    };
}

export class CODAResponseGenerator {
    private readonly errorSimulator: ErrorSimulator;
    private responseCounter = 0;

    constructor() {
        this.errorSimulator = new ErrorSimulator();
    }

    public async generateResponse(
        exercise: Exercise,
        config: Required<CODASystemConfig>,
        state: CODALearningState
    ): Promise<CODAResponse> {
        this.responseCounter++;
        const responseId = `coda_response_${this.responseCounter}_${Date.now()}`;

        const processingTime = this.calculateProcessingTime(exercise, config);
        await this.simulateProcessingDelay(processingTime);

        const answer = await this.simulateExerciseAnswer(exercise, config, state);
        const confidence = this.calculateResponseConfidence(exercise, state);
        const emotionalReaction = this.generateEmotionalReaction(confidence);
        const questionAsked = this.shouldAskQuestion(config) ? await this.generateFollowUpQuestion() : undefined;

        return {
            answer,
            confidence,
            processingTime,
            questionAsked,
            emotionalReaction,
            metadata: {
                responseId,
                timestamp: new Date(),
                simulatedErrors: this.getSimulatedErrors(exercise, config),
                learningInsights: this.generateResponseInsights(exercise, confidence)
            }
        };
    }

    private calculateProcessingTime(exercise: Exercise, config: Required<CODASystemConfig>): number {
        const baseTime = config.interaction.responseLatency;
        const complexityFactor = this.calculateExerciseComplexity(exercise);
        const personalityFactor = config.personality.patienceLevel;

        return Math.round(baseTime * complexityFactor * (2 - personalityFactor));
    }

    private calculateExerciseComplexity(exercise: Exercise): number {
        const typeComplexity = this.getTypeComplexity(exercise.type);
        const difficultyFactor = exercise.metadata?.difficulty ?? 0.5;

        return 0.5 + (typeComplexity * 0.3) + (difficultyFactor * 0.2);
    }

    private getTypeComplexity(type: SupportedExerciseType): number {
        const complexityMap: Record<SupportedExerciseType, number> = {
            'MultipleChoice': 0.3,
            'DragDrop': 0.4,
            'FillBlank': 0.5,
            'TextEntry': 0.6,
            'SigningPractice': 0.8,
            'VideoResponse': 1.0
        };
        return complexityMap[type];
    }

    private async simulateProcessingDelay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async simulateExerciseAnswer(
        exercise: Exercise,
        config: Required<CODASystemConfig>,
        state: CODALearningState
    ): Promise<unknown> {
        const skillLevel = this.calculateCurrentSkillLevel(state);
        const errorRate = config.simulation.errorSimulationRate * (1 - skillLevel);

        return this.errorSimulator.generateHumanLikeResponse(exercise, errorRate);
    }

    private calculateResponseConfidence(exercise: Exercise, state: CODALearningState): number {
        const baseConfidence = state.emotionalState.confidence;
        const skillAlignment = this.calculateSkillAlignment(exercise, state);
        const recentPerformanceBoost = this.getRecentPerformanceBoost(state);

        return Math.max(0.1, Math.min(0.95, baseConfidence * skillAlignment + recentPerformanceBoost));
    }

    private calculateSkillAlignment(exercise: Exercise, state: CODALearningState): number {
        const level = exercise.metadata?.level ?? state.currentLevel;
        const currentLevelIndex = this.getLevelIndex(state.currentLevel);
        const exerciseLevelIndex = this.getLevelIndex(level);

        const levelDifference = Math.abs(currentLevelIndex - exerciseLevelIndex);
        return Math.max(0.3, 1 - (levelDifference * 0.2));
    }

    private getLevelIndex(level: CECRLLevel): number {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return levels.indexOf(level);
    }

    private getRecentPerformanceBoost(state: CODALearningState): number {
        const recentAvg = state.recentPerformance
            .slice(-3)
            .reduce((sum, score) => sum + score, 0) / 3;
        return (recentAvg - 0.5) * 0.2;
    }

    private generateEmotionalReaction(confidence: number): CODAResponse['emotionalReaction'] {
        let type: CODAResponse['emotionalReaction']['type'];
        let intensity: number;

        if (confidence > 0.8) {
            type = Math.random() > 0.7 ? 'excitement' : 'understanding';
            intensity = 0.7 + (confidence - 0.8) * 1.5;
        } else if (confidence > 0.6) {
            type = 'understanding';
            intensity = 0.4 + (confidence - 0.6) * 1.5;
        } else if (confidence > 0.4) {
            type = Math.random() > 0.5 ? 'confusion' : 'curiosity';
            intensity = 0.5 + (0.6 - confidence) * 1.25;
        } else {
            type = 'frustration';
            intensity = 0.6 + (0.4 - confidence) * 1.5;
        }

        return {
            type,
            intensity: Math.min(1, Math.max(0.1, intensity))
        };
    }

    private shouldAskQuestion(config: Required<CODASystemConfig>): boolean {
        return Math.random() < config.interaction.questionFrequency;
    }

    private async generateFollowUpQuestion(): Promise<string> {
        const questionTemplates = [
            "Est-ce que ce signe a des variantes régionales ?",
            "Comment utilise-t-on ce signe dans une phrase complète ?",
            "Y a-t-il un contexte culturel spécial pour ce concept ?",
            "Puis-je voir d'autres exemples similaires ?",
            "Comment distinguer ce signe de signes similaires ?"
        ];

        const randomIndex = Math.floor(Math.random() * questionTemplates.length);
        return questionTemplates[randomIndex] ?? questionTemplates[0]!;
    }

    private getSimulatedErrors(exercise: Exercise, config: Required<CODASystemConfig>): readonly string[] {
        if (Math.random() > config.simulation.errorSimulationRate) {
            return [];
        }

        const possibleErrors = [
            'slight-hand-shape-confusion',
            'movement-precision-issue',
            'spatial-reference-unclear',
            'timing-rhythm-variation'
        ];

        const errorCount = Math.floor(Math.random() * 2) + 1;
        return possibleErrors.slice(0, errorCount);
    }

    private generateResponseInsights(exercise: Exercise, confidence: number): readonly string[] {
        const insights: string[] = [];

        if (confidence < 0.5) {
            insights.push('needs-more-practice-in-this-area');
        }

        if (exercise.type === 'SigningPractice' && confidence > 0.8) {
            insights.push('showing-good-motor-skills-development');
        }

        return insights;
    }

    private calculateCurrentSkillLevel(state: CODALearningState): number {
        const levelWeight = this.getLevelIndex(state.currentLevel) / 5;
        const performanceWeight = state.recentPerformance
            .reduce((sum, score) => sum + score, 0) / state.recentPerformance.length;
        const confidenceWeight = state.emotionalState.confidence;

        return (levelWeight * 0.4 + performanceWeight * 0.4 + confidenceWeight * 0.2);
    }
}