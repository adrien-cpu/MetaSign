// src/ai/learning/realtime/analyzers/CognitiveLoadEstimator.ts

// Types définis localement pour éviter les dépendances manquantes
export interface EngagementSignals {
    timestamp: number;
    responseTime: number;
    errorRate: number;
    pauseDuration: number;
    revisitFrequency: number;
    complexityLevel: number;
    multiTaskingIndicators: number;
    consistencyVariance: number;
    activityType: string;
    contentId: string;
}

export interface CognitiveLoadFactor {
    factorName: string;
    value: number;
    weight: number;
    contribution: number;
    description: string;
}

export interface CognitiveLoadEstimate {
    level: number;
    factors: CognitiveLoadFactor[];
    confidence: number;
    timestamp: number;
    recommendations?: string[];
}

// Interface minimaliste pour le collecteur de métriques
interface IMetricsCollector {
    recordMetric(name: string, value: number): void;
}

/**
 * Estimates the cognitive load of a learner based on real-time engagement signals.
 * Cognitive load represents the mental effort being used in working memory.
 */
export class CognitiveLoadEstimator {
    private readonly metricsCollector: IMetricsCollector;
    private readonly factorWeights: Map<string, number>;

    constructor(metricsCollector: IMetricsCollector) {
        this.metricsCollector = metricsCollector;

        // Initialize factor weights for cognitive load calculation
        this.factorWeights = new Map<string, number>([
            ['responseTime', 0.25],        // Response time to prompts
            ['errorRate', 0.2],            // Rate of errors made
            ['pauseDuration', 0.15],       // Duration of pauses when responding
            ['revisitFrequency', 0.1],     // Frequency of revisiting content
            ['complexityLevel', 0.15],     // Complexity level of current content
            ['multiTaskingIndicators', 0.1], // Indicators of multitasking
            ['consistencyVariance', 0.05]  // Variance in response consistency
        ]);
    }

    /**
     * Estimates cognitive load based on engagement signals and context
     */
    public estimateCognitiveLoad(
        signals: EngagementSignals[],
        contextData?: Record<string, unknown>
    ): CognitiveLoadEstimate {
        this.metricsCollector.recordMetric('cognitive_load.estimation_start', 1);
        const startTime = performance.now();

        try {
            if (signals.length === 0) {
                return { 
                    level: 0.5, 
                    factors: [],
                    confidence: 0.1,
                    timestamp: Date.now()
                };
            }

            // Extract cognitive load factors from signals
            const factors: CognitiveLoadFactor[] = [];
            let totalLoadLevel = 0;
            let totalWeight = 0;

            // Analyze each factor
            for (const [factorName, weight] of this.factorWeights.entries()) {
                const factorContribution = this.analyzeFactor(factorName, signals, contextData);
                
                if (factorContribution !== null) {
                    factors.push({
                        factorName,
                        value: factorContribution.value,
                        weight,
                        contribution: factorContribution.value * weight,
                        description: factorContribution.description
                    });

                    totalLoadLevel += factorContribution.value * weight;
                    totalWeight += weight;
                }
            }

            // Normalize the load level
            const normalizedLevel = totalWeight > 0 ? totalLoadLevel / totalWeight : 0.5;
            const confidence = this.calculateConfidence(factors, signals.length);

            // Generate recommendations based on load level
            const recommendations = this.generateRecommendations(normalizedLevel, factors);

            const result: CognitiveLoadEstimate = {
                level: Math.max(0, Math.min(1, normalizedLevel)),
                factors,
                confidence,
                timestamp: Date.now(),
                recommendations
            };

            const duration = performance.now() - startTime;
            this.metricsCollector.recordMetric('cognitive_load.estimation_duration', duration);
            this.metricsCollector.recordMetric('cognitive_load.estimated_level', result.level);

            return result;
        } catch (error) {
            this.metricsCollector.recordMetric('cognitive_load.estimation_error', 1);
            throw error;
        }
    }

    /**
     * Analyzes a specific cognitive load factor
     */
    private analyzeFactor(
        factorName: string,
        signals: EngagementSignals[],
        contextData?: Record<string, unknown>
    ): { value: number; description: string } | null {
        if (signals.length === 0) return null;

        switch (factorName) {
            case 'responseTime':
                return this.analyzeResponseTime(signals);
            case 'errorRate':
                return this.analyzeErrorRate(signals);
            case 'pauseDuration':
                return this.analyzePauseDuration(signals);
            case 'revisitFrequency':
                return this.analyzeRevisitFrequency(signals);
            case 'complexityLevel':
                return this.analyzeComplexityLevel(signals, contextData);
            case 'multiTaskingIndicators':
                return this.analyzeMultiTasking(signals);
            case 'consistencyVariance':
                return this.analyzeConsistency(signals);
            default:
                return null;
        }
    }

    /**
     * Analyzes response time patterns
     */
    private analyzeResponseTime(signals: EngagementSignals[]): { value: number; description: string } {
        const avgResponseTime = signals.reduce((sum, s) => sum + s.responseTime, 0) / signals.length;
        
        // Normalize response time (assuming 0-10 seconds range)
        const normalizedTime = Math.min(1, avgResponseTime / 10000); // 10 seconds = high load
        
        return {
            value: normalizedTime,
            description: `Average response time: ${avgResponseTime.toFixed(0)}ms`
        };
    }

    /**
     * Analyzes error rate patterns
     */
    private analyzeErrorRate(signals: EngagementSignals[]): { value: number; description: string } {
        const avgErrorRate = signals.reduce((sum, s) => sum + s.errorRate, 0) / signals.length;
        
        return {
            value: Math.min(1, avgErrorRate),
            description: `Error rate: ${(avgErrorRate * 100).toFixed(1)}%`
        };
    }

    /**
     * Analyzes pause duration patterns
     */
    private analyzePauseDuration(signals: EngagementSignals[]): { value: number; description: string } {
        const avgPauseDuration = signals.reduce((sum, s) => sum + s.pauseDuration, 0) / signals.length;
        
        // Normalize pause duration (assuming 0-5 seconds range)
        const normalizedPause = Math.min(1, avgPauseDuration / 5000);
        
        return {
            value: normalizedPause,
            description: `Average pause duration: ${avgPauseDuration.toFixed(0)}ms`
        };
    }

    /**
     * Analyzes content revisit patterns
     */
    private analyzeRevisitFrequency(signals: EngagementSignals[]): { value: number; description: string } {
        const avgRevisitFreq = signals.reduce((sum, s) => sum + s.revisitFrequency, 0) / signals.length;
        
        return {
            value: Math.min(1, avgRevisitFreq / 5), // Normalize to 0-1 range
            description: `Revisit frequency: ${avgRevisitFreq.toFixed(1)} times`
        };
    }

    /**
     * Analyzes complexity level impact
     */
    private analyzeComplexityLevel(
        signals: EngagementSignals[],
        contextData?: Record<string, unknown>
    ): { value: number; description: string } {
        const avgComplexity = signals.reduce((sum, s) => sum + s.complexityLevel, 0) / signals.length;
        
        // Consider context data if available
        let adjustedComplexity = avgComplexity;
        if (contextData?.difficultyMultiplier) {
            adjustedComplexity *= contextData.difficultyMultiplier as number;
        }
        
        return {
            value: Math.min(1, adjustedComplexity / 5), // Normalize assuming 0-5 scale
            description: `Content complexity level: ${avgComplexity.toFixed(1)}/5`
        };
    }

    /**
     * Analyzes multitasking indicators
     */
    private analyzeMultiTasking(signals: EngagementSignals[]): { value: number; description: string } {
        const avgMultiTasking = signals.reduce((sum, s) => sum + s.multiTaskingIndicators, 0) / signals.length;
        
        return {
            value: Math.min(1, avgMultiTasking),
            description: `Multitasking level: ${(avgMultiTasking * 100).toFixed(0)}%`
        };
    }

    /**
     * Analyzes response consistency
     */
    private analyzeConsistency(signals: EngagementSignals[]): { value: number; description: string } {
        const avgVariance = signals.reduce((sum, s) => sum + s.consistencyVariance, 0) / signals.length;
        
        return {
            value: Math.min(1, avgVariance),
            description: `Response variance: ${(avgVariance * 100).toFixed(1)}%`
        };
    }

    /**
     * Calculates confidence level for the estimate
     */
    private calculateConfidence(factors: CognitiveLoadFactor[], sampleSize: number): number {
        // Base confidence on number of factors analyzed and sample size
        const factorCoverage = factors.length / this.factorWeights.size;
        const sampleConfidence = Math.min(1, sampleSize / 10); // Max confidence at 10+ samples
        
        return (factorCoverage + sampleConfidence) / 2;
    }

    /**
     * Generates recommendations based on cognitive load level
     */
    private generateRecommendations(level: number, factors: CognitiveLoadFactor[]): string[] {
        const recommendations: string[] = [];
        
        if (level > 0.8) {
            recommendations.push('Consider reducing content complexity');
            recommendations.push('Provide additional scaffolding and support');
            recommendations.push('Break down tasks into smaller chunks');
        } else if (level > 0.6) {
            recommendations.push('Monitor learner closely for signs of overload');
            recommendations.push('Provide periodic breaks or easier content');
        } else if (level < 0.3) {
            recommendations.push('Consider increasing content complexity');
            recommendations.push('Introduce additional challenges');
        }

        // Factor-specific recommendations
        const highFactors = factors.filter(f => f.contribution > 0.15);
        for (const factor of highFactors) {
            switch (factor.factorName) {
                case 'responseTime':
                    recommendations.push('Provide time management strategies');
                    break;
                case 'errorRate':
                    recommendations.push('Review foundational concepts');
                    break;
                case 'pauseDuration':
                    recommendations.push('Encourage active engagement techniques');
                    break;
            }
        }

        return recommendations;
    }

    /**
     * Updates factor weights based on learning outcomes
     */
    public updateFactorWeights(factorName: string, newWeight: number): void {
        if (this.factorWeights.has(factorName) && newWeight >= 0 && newWeight <= 1) {
            this.factorWeights.set(factorName, newWeight);
            this.metricsCollector.recordMetric('cognitive_load.weight_updated', 1);
        }
    }

    /**
     * Gets current factor weights
     */
    public getFactorWeights(): Map<string, number> {
        return new Map(this.factorWeights);
    }
}