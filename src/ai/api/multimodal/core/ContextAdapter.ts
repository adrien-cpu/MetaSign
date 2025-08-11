// multimodal/core/ContextAdapter.ts
import { EmotionAnalyzer } from '../analyzers/EmotionAnalyzer';
import { ContextRepository } from '../repositories/ContextRepository';
import { ModalityContext, EmotionalContext, SituationalContext } from '../types';

export class ContextAdapter {
    private emotionAnalyzer: EmotionAnalyzer;
    private contextRepository: ContextRepository;
    private readonly contextValidityDuration: number = 5000; // ms

    constructor(
        emotionAnalyzer: EmotionAnalyzer,
        contextRepository: ContextRepository
    ) {
        this.emotionAnalyzer = emotionAnalyzer;
        this.contextRepository = contextRepository;
    }

    async adapt(modalities: SynchronizedModality[]): Promise<ContextualizedModality[]> {
        const context = await this.analyzeContext(modalities);
        return this.applyContextualAdaptation(modalities, context);
    }

    private async analyzeContext(modalities: SynchronizedModality[]): Promise<ModalityContext> {
        const emotionalContext = await this.emotionAnalyzer.analyze(modalities);
        const situationalContext = await this.extractSituationalContext(modalities);
        const historicalContext = await this.contextRepository.getRecentContext(
            this.contextValidityDuration
        );

        return {
            emotional: this.mergeEmotionalContexts(emotionalContext, historicalContext?.emotional),
            situational: this.mergeSituationalContexts(situationalContext, historicalContext?.situational),
            timestamp: Date.now(),
            confidence: this.calculateContextConfidence(emotionalContext, situationalContext)
        };
    }

    private async applyContextualAdaptation(
        modalities: SynchronizedModality[],
        context: ModalityContext
    ): Promise<ContextualizedModality[]> {
        return modalities.map(modality => ({
            ...modality,
            adaptations: this.computeAdaptations(modality, context),
            contextualScore: this.calculateContextualScore(modality, context),
            metadata: {
                ...modality.metadata,
                appliedContext: context
            }
        }));
    }

    private mergeEmotionalContexts(
        current: EmotionalContext,
        historical?: EmotionalContext
    ): EmotionalContext {
        if (!historical) return current;

        return {
            primaryEmotion: this.weightedEmotionMerge(
                current.primaryEmotion,
                historical.primaryEmotion,
                0.7
            ),
            intensity: this.weightedAverage(
                current.intensity,
                historical.intensity,
                0.7
            ),
            valence: this.weightedAverage(
                current.valence,
                historical.valence,
                0.7
            ),
            confidence: Math.min(current.confidence, historical.confidence)
        };
    }

    private mergeSituationalContexts(
        current: SituationalContext,
        historical?: SituationalContext
    ): SituationalContext {
        if (!historical) return current;

        return {
            environment: this.selectMostRelevant(
                current.environment,
                historical.environment
            ),
            participants: this.mergeParticipants(
                current.participants,
                historical.participants
            ),
            intent: this.mergeIntents(current.intent, historical.intent),
            confidence: Math.min(current.confidence, historical.confidence)
        };
    }

    private calculateContextConfidence(
        emotional: EmotionalContext,
        situational: SituationalContext
    ): number {
        const weights = {
            emotional: 0.6,
            situational: 0.4
        };

        return (
            emotional.confidence * weights.emotional +
            situational.confidence * weights.situational
        );
    }

    private computeAdaptations(
        modality: SynchronizedModality,
        context: ModalityContext
    ): ModalityAdaptation[] {
        const adaptations: ModalityAdaptation[] = [];

        if (this.requiresEmotionalAdaptation(modality, context.emotional)) {
            adaptations.push(this.createEmotionalAdaptation(modality, context.emotional));
        }

        if (this.requiresSituationalAdaptation(modality, context.situational)) {
            adaptations.push(this.createSituationalAdaptation(modality, context.situational));
        }

        return adaptations;
    }
}
