// src/ai/api/rpm/interfaces/IMetricAnalyzer.ts
export interface IMetricAnalyzer {
    analyze(batch: MetricsBatch): Promise<RPMAnalysis>;
    configureAnalysis(config: AnalyzerConfig): void;
    getLastAnalysis(): Promise<RPMAnalysis | null>;
}