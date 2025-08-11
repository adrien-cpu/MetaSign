// src/ai/feedback/analysis/SignAnalyzer.ts
export class SignAnalyzer {
    private readonly expressionAnalyzer: ExpressionAnalyzer;
    private readonly gestureRecognizer: GestureRecognizer;
    private readonly spatialAnalyzer: SpatialAnalyzer;

    async analyzeSign(sign: LSFSign): Promise<SignAnalysis> {
        const [expressions, gestures, spatial] = await Promise.all([
            this.expressionAnalyzer.analyze(sign.expressions),
            this.gestureRecognizer.recognize(sign.gestures),
            this.spatialAnalyzer.analyze(sign.spatialElements)
        ]);

        return {
            accuracy: this.calculateAccuracy({ expressions, gestures, spatial }),
            variants: await this.identifyVariants(sign),
            improvements: this.suggestImprovements({ expressions, gestures, spatial }),
            contextMatch: await this.evaluateContextMatch(sign)
        };
    }

    private async identifyVariants(sign: LSFSign): Promise<SignVariant[]> {
        const regionalVariants = await this.findRegionalVariants(sign);
        const contextualVariants = await this.findContextualVariants(sign);
        return this.mergeVariants(regionalVariants, contextualVariants);
    }
}