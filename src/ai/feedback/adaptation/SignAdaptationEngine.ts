// src/ai/feedback/adaptation/SignAdaptationEngine.ts
export class SignAdaptationEngine {
    private readonly contextAdapter: ContextAdapter;
    private readonly styleAdapter: StyleAdapter;
    private readonly temporalAdapter: TemporalAdapter;

    async adaptSign(sign: LSFSign, context: SignContext): Promise<AdaptedSign> {
        const contextualAdaptations = await this.contextAdapter.adapt(sign, context);
        const styleAdaptations = await this.styleAdapter.adapt(sign, context.style);
        const temporalAdaptations = await this.temporalAdapter.adapt(sign, context.timing);

        return {
            original: sign,
            adaptations: this.mergeAdaptations([
                contextualAdaptations,
                styleAdaptations,
                temporalAdaptations
            ]),
            confidence: this.calculateAdaptationConfidence({
                contextual: contextualAdaptations,
                style: styleAdaptations,
                temporal: temporalAdaptations
            })
        };
    }
}