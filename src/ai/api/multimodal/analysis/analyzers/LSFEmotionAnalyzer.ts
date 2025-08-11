// src/ai/api/multimodal/analysis/analyzers/LSFEmotionAnalyzer.ts
export class LSFEmotionAnalyzer {
    constructor(
        private readonly gestureAnalyzer: GestureAnalyzer,
        private readonly facialAnalyzer: FacialAnalyzer
    ) { }

    async analyze(input: LSFModality): Promise<EmotionalState> {
        const [gestureEmotions, facialEmotions] = await Promise.all([
            this.gestureAnalyzer.analyzeEmotions(input.gestures),
            this.facialAnalyzer.analyzeEmotions(input.facial)
        ]);

        return this.combineEmotionalStates(gestureEmotions, facialEmotions);
    }

    private combineEmotionalStates(
        gestureEmotions: EmotionalState,
        facialEmotions: EmotionalState
    ): EmotionalState {
        // Logique de combinaison des émotions en donnant priorité aux expressions faciales
        return {
            primary: this.selectPrimaryEmotion(gestureEmotions, facialEmotions),
            secondary: this.selectSecondaryEmotion(gestureEmotions, facialEmotions),
            intensity: this.calculateCombinedIntensity(gestureEmotions, facialEmotions),
            confidence: this.calculateCombinedConfidence(gestureEmotions, facialEmotions),
            timestamp: Date.now()
        };
    }

    private selectPrimaryEmotion(gestureEmotions: EmotionalState, facialEmotions: EmotionalState): Emotion {
        return facialEmotions.confidence > gestureEmotions.confidence
            ? facialEmotions.primary
            : gestureEmotions.primary;
    }

    private selectSecondaryEmotion(gestureEmotions: EmotionalState, facialEmotions: EmotionalState): Emotion | undefined {
        // Logique de sélection de l'émotion secondaire
        return facialEmotions.secondary || gestureEmotions.secondary;
    }

    private calculateCombinedIntensity(gestureEmotions: EmotionalState, facialEmotions: EmotionalState): number {
        return (gestureEmotions.intensity * 0.4 + facialEmotions.intensity * 0.6);
    }

    private calculateCombinedConfidence(gestureEmotions: EmotionalState, facialEmotions: EmotionalState): number {
        return (gestureEmotions.confidence * 0.4 + facialEmotions.confidence * 0.6);
    }
}
