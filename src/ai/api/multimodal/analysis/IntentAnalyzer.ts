// src/ai/api/multimodal/analysis/IntentAnalyzer.ts
export class IntentAnalyzer {
    private readonly intentRecognizer: IntentRecognizer;
    private readonly contextEnricher: IntentContextEnricher;
    
    async analyze(modalities: SynchronizedModalities): Promise<IntentData> {
        const baseIntent = await this.intentRecognizer.recognize({
            lsf: this.extractLSFIntentFeatures(modalities.lsf),
            vocal: this.extractVocalIntentFeatures(modalities.vocal)
        });

        return this.contextEnricher.enrich(baseIntent, {
            emotional: await this.getEmotionalContext(modalities),
            situational: await this.getSituationalContext(modalities)
        });
    }
}