// src/ai/api/multimodal/analysis/ContextAnalyzer.ts

import {
    SynchronizedModalities,
    EmotionalState,
    IntentData,
    SituationContext,
    FusionContext
} from './types';

export class ContextAnalyzer {
    private readonly emotionDetector: EmotionDetector;
    private readonly intentAnalyzer: IntentAnalyzer;
    private readonly situationalAnalyzer: SituationalAnalyzer;
    private readonly ethicsController: SystemeControleEthique;
    private readonly emergencySystem: SystemeArretUrgence;

    constructor(
        emotionDetector: EmotionDetector,
        intentAnalyzer: IntentAnalyzer,
        situationalAnalyzer: SituationalAnalyzer,
        ethicsController: SystemeControleEthique,
        emergencySystem: SystemeArretUrgence
    ) {
        this.emotionDetector = emotionDetector;
        this.intentAnalyzer = intentAnalyzer;
        this.situationalAnalyzer = situationalAnalyzer;
        this.ethicsController = ethicsController;
        this.emergencySystem = emergencySystem;
    }

    async analyze(modalities: SynchronizedModalities): Promise<FusionContext> {
        // Vérification éthique préalable
        await this.ethicsController.validateAnalysis(modalities);

        const [emotions, intent, situation] = await Promise.all([
            this.emotionDetector.detect(modalities),
            this.intentAnalyzer.analyze(modalities),
            this.situationalAnalyzer.analyze(modalities)
        ]);

        // Ajout de la vérification d'urgence
        await this.emergencySystem.checkForCriticalSituations({
            emotions,
            intent,
            situation
        });

        return {
            emotional: emotions,
            intentional: intent,
            situational: situation,
            confidence: await this.calculateContextConfidence({
                emotions,
                intent,
                situation
            })
        };
    }

    private async calculateContextConfidence(data: {
        emotions: EmotionalState;
        intent: IntentData;
        situation: SituationContext;
    }): Promise<number> {
        const weights = {
            emotional: 0.4,
            intentional: 0.3,
            situational: 0.3
        };

        return (
            data.emotions.confidence * weights.emotional +
            data.intent.confidence * weights.intentional +
            data.situation.urgency * weights.situational
        );
    }
}

interface EmotionDetector {
    detect(modalities: SynchronizedModalities): Promise<EmotionalState>;
}

interface IntentAnalyzer {
    analyze(modalities: SynchronizedModalities): Promise<IntentData>;
}

interface SituationalAnalyzer {
    analyze(modalities: SynchronizedModalities): Promise<SituationContext>;
}

interface SystemeControleEthique {
    validateAnalysis(modalities: SynchronizedModalities): Promise<void>;
}

interface SystemeArretUrgence {
    checkForCriticalSituations(context: {
        emotions: EmotionalState;
        intent: IntentData;
        situation: SituationContext;
    }): Promise<void>;
}