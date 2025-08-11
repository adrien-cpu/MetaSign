// src/ai/api/multimodal/analysis/fusion/EmotionFuser.ts
export class EmotionFuser {
    async fuse(lsfEmotions: EmotionalState, vocalEmotions: EmotionalState): Promise<EmotionalState> {
        return {
            primary: this.selectPrimaryEmotion(lsfEmotions, vocalEmotions),
            secondary: this.selectSecondaryEmotion(lsfEmotions, vocalEmotions),
            intensity: this.calculateFusedIntensity(lsfEmotions, vocalEmotions),
            confidence: this.calculateFusedConfidence(lsfEmotions, vocalEmotions),
            timestamp: Date.now()
        };
    }

    private selectPrimaryEmotion(lsfEmotions: EmotionalState, vocalEmotions: EmotionalState): Emotion {
        // Priorité à l'émotion avec la plus grande confiance
        return lsfEmotions.confidence > vocalEmotions.confidence
            ? lsfEmotions.primary
            : vocalEmotions.primary;
    }

    private selectSecondaryEmotion(lsfEmotions: EmotionalState, vocalEmotions: EmotionalState): Emotion | undefined {
        // Sélectionne l'émotion secondaire la plus pertinente
        const candidates = [
            lsfEmotions.secondary,
            vocalEmotions.secondary,
            lsfEmotions.confidence < vocalEmotions.confidence ? lsfEmotions.primary : vocalEmotions.primary
        ].filter(e => e !== undefined);

        return candidates.length > 0 ? candidates[0] : undefined;
    }

    private calculateFusedIntensity(lsfEmotions: EmotionalState, vocalEmotions: EmotionalState): number {
        // Moyenne pondérée des intensités
        const weights = this.calculateModalityWeights(lsfEmotions, vocalEmotions);
        return lsfEmotions.intensity * weights.lsf + vocalEmotions.intensity * weights.vocal;
    }

    private calculateFusedConfidence(lsfEmotions: EmotionalState, vocalEmotions: EmotionalState): number {
        // Moyenne pondérée des confiances
        const weights = this.calculateModalityWeights(lsfEmotions, vocalEmotions);
        return lsfEmotions.confidence * weights.lsf + vocalEmotions.confidence * weights.vocal;
    }

    private calculateModalityWeights(lsfEmotions: EmotionalState, vocalEmotions: EmotionalState): { lsf: number; vocal: number } {
        const totalConfidence = lsfEmotions.confidence + vocalEmotions.confidence;
        return {
            lsf: lsfEmotions.confidence / totalConfidence,
            vocal: vocalEmotions.confidence / totalConfidence
        };
    }
}