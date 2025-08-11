// src/ai/api/multimodal/analysis/analyzers/VocalEmotionAnalyzer.ts
export class VocalEmotionAnalyzer {
    constructor(
        private readonly prosodyAnalyzer: ProsodyAnalyzer,
        private readonly audioAnalyzer: AudioAnalyzer
    ) { }

    async analyze(input: VocalModality): Promise<EmotionalState> {
        const [prosodyEmotions, audioEmotions] = await Promise.all([
            this.prosodyAnalyzer.analyzeEmotions(input.prosody),
            this.audioAnalyzer.analyzeEmotions(input.audio)
        ]);

        return this.combineEmotionalStates(prosodyEmotions, audioEmotions);
    }

    private combineEmotionalStates(
        prosodyEmotions: EmotionalState,
        audioEmotions: EmotionalState
    ): EmotionalState {
        return {
            primary: this.selectPrimaryEmotion(prosodyEmotions, audioEmotions),
            secondary: this.selectSecondaryEmotion(prosodyEmotions, audioEmotions),
            intensity: this.calculateCombinedIntensity(prosodyEmotions, audioEmotions),
            confidence: this.calculateCombinedConfidence(prosodyEmotions, audioEmotions),
            timestamp: Date.now()
        };
    }

    private selectPrimaryEmotion(prosodyEmotions: EmotionalState, audioEmotions: EmotionalState): Emotion {
        return prosodyEmotions.confidence > audioEmotions.confidence
            ? prosodyEmotions.primary
            : audioEmotions.primary;
    }

    private selectSecondaryEmotion(prosodyEmotions: EmotionalState, audioEmotions: EmotionalState): Emotion | undefined {
        return prosodyEmotions.secondary || audioEmotions.secondary;
    }

    private calculateCombinedIntensity(prosodyEmotions: EmotionalState, audioEmotions: EmotionalState): number {
        return (prosodyEmotions.intensity * 0.7 + audioEmotions.intensity * 0.3);
    }

    private calculateCombinedConfidence(prosodyEmotions: EmotionalState, audioEmotions: EmotionalState): number {
        return (prosodyEmotions.confidence * 0.7 + audioEmotions.confidence * 0.3);
    }
}