// src/ai/api/multimodal/analysis/EmotionDetector.ts
import { LSFEmotionAnalyzer } from './analyzers/LSFEmotionAnalyzer';
import { VocalEmotionAnalyzer } from './analyzers/VocalEmotionAnalyzer';
import { EmotionFuser } from './fusion/EmotionFuser';
import { SynchronizedModalities, EmotionalState } from './types/modalities';

export class EmotionDetector {
    constructor(
        private readonly lsfEmotionAnalyzer: LSFEmotionAnalyzer,
        private readonly vocalEmotionAnalyzer: VocalEmotionAnalyzer,
        private readonly emotionFuser: EmotionFuser
    ) { }

    async detect(modalities: SynchronizedModalities): Promise<EmotionalState> {
        const [lsfEmotions, vocalEmotions] = await Promise.all([
            this.lsfEmotionAnalyzer.analyze(modalities.lsf),
            this.vocalEmotionAnalyzer.analyze(modalities.vocal)
        ]);

        return this.emotionFuser.fuse(lsfEmotions, vocalEmotions);
    }
}