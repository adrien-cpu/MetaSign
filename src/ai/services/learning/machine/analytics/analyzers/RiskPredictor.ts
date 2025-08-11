// src/ai/learning/analytics/analyzers/RiskPredictor.ts

import { LearningMetrics, TimeSeriesData, RiskPrediction, RiskType, RiskLevel } from '@ai/learning/types/analytics.types';
import { StatisticalUtils } from '../utils/StatisticalUtils';
import { TimeSeriesUtils } from '../utils/TimeSeriesUtils';
import { CorrelationUtils } from '../utils/CorrelationUtils';
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';

/**
 * RiskPredictor analyzes learning patterns to identify potential risks
 * and challenges that might impact a learner's progress.
 */
export class RiskPredictor {
    private readonly metricsCollector: IMetricsCollector;
    private readonly riskThresholds: Map<RiskType, number>;

    constructor(metricsCollector: IMetricsCollector) {
        this.metricsCollector = metricsCollector;

        // Initialize risk thresholds - these could be configurable
        this.riskThresholds = new Map<RiskType, number>([
            ['completion_risk', 0.6],
            ['engagement_drop', 0.5],
            ['comprehension_issue', 0.65],
            ['skill_gap', 0.7],
            ['pace_mismatch', 0.55],
            ['conceptual_confusion', 0.6]
        ]);
    }

    /**
     * Predicts risks based on learning metrics and time series data
     */
    public async predictRisks(
        metrics: LearningMetrics[],
        timeSeriesData: TimeSeriesData
    ): Promise<RiskPrediction[]> {
        this.metricsCollector.recordMetric('risk_predictor.prediction_start', 1);
        const startTime = performance.now();

        try {
            // Process different risk types in parallel for performance
            const [
                completionRisks,
                engagementRisks,
                comprehensionRisks,
                skillGapRisks,
                paceMismatchRisks,
                conceptualConfusionRisks
            ] = await Promise.all([
                this.detectCompletionRisks(metrics, timeSeriesData),
                this.detectEngagementRisks(metrics, timeSeriesData),
                this.detectComprehensionIssues(metrics, timeSeriesData),
                this.detectSkillGaps(metrics),
                this.detectPaceMismatches(metrics, timeSeriesData),
                this.detectConceptualConfusion(metrics)
            ]);

            // Combine all risk predictions
            const allRisks = [
                ...completionRisks,
                ...engagementRisks,
                ...comprehensionRisks,
                ...skillGapRisks,
                ...paceMismatchRisks,
                ...conceptualConfusionRisks
            ];

            // De-duplicate risks if necessary
            const uniqueRisks = this.deduplicateRisks(allRisks);

            // Sort risks by probability (highest first)
            const sortedRisks = uniqueRisks.sort((a, b) => b.probability - a.probability);

            this.metricsCollector.recordMetric('risk_predictor.prediction_success', 1);
            this.metricsCollector.recordMetric('risk_predictor.prediction_time_ms', performance.now() - startTime);

            return sortedRisks;
        } catch (error) {
            this.metricsCollector.recordMetric('risk_predictor.prediction_error', 1);
            throw error;
        }
    }

    /**
     * Detects risks related to course completion
     */
    private async detectCompletionRisks(
        metrics: LearningMetrics[],
        timeSeriesData: TimeSeriesData
    ): Promise<RiskPrediction[]> {
        const risks: RiskPrediction[] = [];

        // Calculate completion rate trend
        const completionRates = metrics
            .filter(m => m.completionRate !== undefined)
            .map(m => ({ timestamp: m.timestamp || 0, value: m.completionRate! }))
            .sort((a, b) => a.timestamp - b.timestamp);

        if (completionRates.length < 2) {
            return risks; // Not enough data
        }

        // Analyze completion trend
        const trend = TimeSeriesUtils.calculateTrend(completionRates);

        // If trend is negative and below threshold, it's a risk
        if (trend < -0.1) {
            const expectedCompletion = this.projectedCompletion(completionRates, trend);

            // Calculate the probability based on trend severity
            const probability = Math.min(0.5 - trend, 0.95); // Convert trend to probability

            if (probability > this.riskThresholds.get('completion_risk')!) {
                risks.push({
                    type: 'completion_risk',
                    probability,
                    level: this.getRiskLevel(probability),
                    description: 'Learner may not complete the course at the current pace',
                    affectedAreas: ['course_completion'],
                    projectedValues: { completionRate: expectedCompletion },
                    mitigationStrategies: [
                        'Adjust course timeline',
                        'Provide additional support resources',
                        'Break content into smaller modules'
                    ],
                    dataPoints: completionRates.length
                });
            }
        }

        return risks;
    }

    /**
     * Detects risks related to declining engagement
     */
    private async detectEngagementRisks(
        metrics: LearningMetrics[],
        timeSeriesData: TimeSeriesData
    ): Promise<RiskPrediction[]> {
        const risks: RiskPrediction[] = [];

        // Extract engagement metrics
        const engagementMetrics = metrics
            .filter(m => m.engagementScore !== undefined)
            .map(m => ({ timestamp: m.timestamp || 0, value: m.engagementScore! }))
            .sort((a, b) => a.timestamp - b.timestamp);

        if (engagementMetrics.length < 3) {
            return risks; // Not enough data
        }

        // Calculate moving average to smooth out noise
        const movingAvg = TimeSeriesUtils.calculateMovingAverage(engagementMetrics, 3);

        // Calculate trend of the moving average
        const trend = TimeSeriesUtils.calculateTrend(movingAvg);

        // Detect sudden drops in engagement
        const recentDrops = TimeSeriesUtils.detectSuddenDrops(engagementMetrics, 0.2, 3);

        // If trend is negative or there are recent drops, create risk prediction
        if (trend < -0.05 || recentDrops.length > 0) {
            const probability = recentDrops.length > 0 ? 0.8 : Math.min(0.5 - trend * 2, 0.9);

            if (probability > this.riskThresholds.get('engagement_drop')!) {
                risks.push({
                    type: 'engagement_drop',
                    probability,
                    level: this.getRiskLevel(probability),
                    description: recentDrops.length > 0
                        ? 'Sudden drop in learner engagement detected'
                        : 'Gradual decline in learner engagement',
                    affectedAreas: ['motivation', 'participation', 'attention'],
                    projectedValues: { engagementScore: engagementMetrics[engagementMetrics.length - 1].value + (trend * 5) },
                    mitigationStrategies: [
                        'Introduce interactive elements',
                        'Provide personalized feedback',
                        'Adjust difficulty level',
                        'Implement gamification elements'
                    ],
                    dataPoints: engagementMetrics.length
                });
            }
        }

        return risks;
    }

    /**
     * Detects risks related to comprehension issues
     */
    private async detectComprehensionIssues(
        metrics: LearningMetrics[],
        timeSeriesData: TimeSeriesData
    ): Promise<RiskPrediction[]> {
        const risks: RiskPrediction[] = [];

        // Extract quiz scores, error rates, etc.
        const quizScores = metrics
            .filter(m => m.quizScore !== undefined)
            .map(m => ({ timestamp: m.timestamp || 0, value: m.quizScore! }))
            .sort((a, b) => a.timestamp - b.timestamp);

        if (quizScores.length < 2) {
            return risks; // Not enough data
        }

        // Calculate average quiz score and recent trend
        const avgScore = StatisticalUtils.calculateMean(quizScores.map(q => q.value));
        const recentScores = quizScores.slice(-3);
        const recentAvg = recentScores.length >= 2
            ? StatisticalUtils.calculateMean(recentScores.map(q => q.value))
            : avgScore;

        // Check for comprehension issues
        if (recentAvg < 0.7 || (avgScore - recentAvg > 0.1)) {
            const probability = 1 - recentAvg;

            if (probability > this.riskThresholds.get('comprehension_issue')!) {
                risks.push({
                    type: 'comprehension_issue',
                    probability,
                    level: this.getRiskLevel(probability),
                    description: 'Learner may be struggling with course concepts',
                    affectedAreas: ['knowledge_acquisition', 'concept_mastery'],
                    projectedValues: { quizScore: recentAvg },
                    mitigationStrategies: [
                        'Provide supplementary materials',
                        'Offer concept clarification sessions',
                        'Simplify difficult concepts',
                        'Provide alternative explanations',
                        'Introduce visual learning aids'
                    ],
                    dataPoints: quizScores.length
                });
            }
        }

        return risks;
    }

    /**
     * Detects risks related to significant skill gaps
     */
    private async detectSkillGaps(metrics: LearningMetrics[]): Promise<RiskPrediction[]> {
        const risks: RiskPrediction[] = [];

        // Extract skill assessment data
        const skillAssessments = metrics
            .filter(m => m.skillAssessments && Object.keys(m.skillAssessments).length > 0)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (skillAssessments.length === 0) {
            return risks; // No skill assessment data
        }

        // Get most recent skill assessment
        const latestAssessment = skillAssessments[0].skillAssessments || {};

        // Identify skills with low scores
        const lowSkills = Object.entries(latestAssessment)
            .filter(([_, score]) => score < 0.6)
            .map(([skill, score]) => ({ skill, score }));

        if (lowSkills.length === 0) {
            return risks; // No low-scoring skills
        }

        // Calculate overall skill gap severity
        const gapSeverity = lowSkills.reduce((sum, skill) => sum + (0.6 - skill.score), 0) / lowSkills.length;
        const probability = Math.min(gapSeverity * 1.5, 0.95);

        if (probability > this.riskThresholds.get('skill_gap')!) {
            risks.push({
                type: 'skill_gap',
                probability,
                level: this.getRiskLevel(probability),
                description: `Significant gaps in ${lowSkills.length} key skills`,
                affectedAreas: lowSkills.map(s => s.skill),
                projectedValues: { averageSkillScore: 1 - gapSeverity },
                mitigationStrategies: [
                    'Targeted skill development exercises',
                    'Prerequisite refresher modules',
                    'One-on-one coaching sessions',
                    'Custom practice activities'
                ],
                dataPoints: skillAssessments.length
            });
        }

        return risks;
    }

    /**
     * Detects risks related to pace mismatches (too fast or too slow)
     */
    private async detectPaceMismatches(
        metrics: LearningMetrics[],
        timeSeriesData: TimeSeriesData
    ): Promise<RiskPrediction[]> {
        const risks: RiskPrediction[] = [];

        // Extract completion rate and time spent
        const progressData = metrics
            .filter(m => m.moduleProgress !== undefined && m.timeSpent !== undefined)
            .map(m => ({
                timestamp: m.timestamp || 0,
                progress: m.moduleProgress!,
                timeSpent: m.timeSpent!
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

        if (progressData.length < 3) {
            return risks; // Not enough data
        }

        // Calculate time per progress unit (higher values = slower pace)
        const paceData = progressData.map((item, index, array) => {
            if (index === 0) return null;
            const prevItem = array[index - 1];
            const progressDelta = item.progress - prevItem.progress;
            const timeDelta = item.timeSpent - prevItem.timeSpent;
            return progressDelta > 0 ? timeDelta / progressDelta : null;
        }).filter(item => item !== null) as number[];

        if (paceData.length < 2) {
            return risks; // Not enough pace data
        }

        // Calculate average pace and recent pace
        const avgPace = StatisticalUtils.calculateMean(paceData);
        const recentPace = StatisticalUtils.calculateMean(paceData.slice(-2));

        // Calculate pace mismatch
        const paceDifference = Math.abs(recentPace / avgPace - 1);

        if (paceDifference > 0.3) {
            // Determine if pace is too fast or too slow
            const isTooSlow = recentPace > avgPace;

            const probability = Math.min(paceDifference, 0.9);

            if (probability > this.riskThresholds.get('pace_mismatch')!) {
                risks.push({
                    type: 'pace_mismatch',
                    probability,
                    level: this.getRiskLevel(probability),
                    description: isTooSlow
                        ? 'Learner is progressing slower than optimal pace'
                        : 'Learner is progressing faster than may be effective for retention',
                    affectedAreas: ['learning_efficiency', 'content_absorption', 'time_management'],
                    projectedValues: {
                        estimatedCompletion: isTooSlow
                            ? 'delayed'
                            : 'ahead_of_schedule'
                    },
                    mitigationStrategies: isTooSlow
                        ? [
                            'Adjust content complexity',
                            'Provide learning path guidance',
                            'Offer time management strategies',
                            'Simplify initial modules'
                        ]
                        : [
                            'Suggest deeper exploration activities',
                            'Provide enrichment content',
                            'Encourage reflection exercises',
                            'Recommend peer teaching opportunities'
                        ],
                    dataPoints: paceData.length
                });
            }
        }

        return risks;
    }

    /**
     * Detects risks related to conceptual confusion between related topics
     */
    private async detectConceptualConfusion(metrics: LearningMetrics[]): Promise<RiskPrediction[]> {
        const risks: RiskPrediction[] = [];

        // Extract concept-specific performance data
        const conceptData = metrics
            .filter(m => m.conceptPerformance && Object.keys(m.conceptPerformance).length > 0)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (conceptData.length === 0) {
            return risks; // No concept performance data
        }

        // Get latest concept performance
        const latestConcepts = conceptData[0].conceptPerformance || {};

        // Identify related concepts with significantly different performance scores
        const confusedConcepts: Array<{ concept1: string, concept2: string, difference: number }> = [];

        // Get concept pairs that should be related (this would be a predefined mapping in a real system)
        const relatedConcepts = this.getRelatedConceptPairs(Object.keys(latestConcepts));

        // Check for significant performance differences between related concepts
        for (const [concept1, concept2] of relatedConcepts) {
            if (latestConcepts[concept1] !== undefined && latestConcepts[concept2] !== undefined) {
                const difference = Math.abs(latestConcepts[concept1] - latestConcepts[concept2]);

                if (difference > 0.3) {
                    confusedConcepts.push({
                        concept1,
                        concept2,
                        difference
                    });
                }
            }
        }

        if (confusedConcepts.length > 0) {
            // Calculate average performance difference
            const avgDifference = confusedConcepts.reduce((sum, item) => sum + item.difference, 0) / confusedConcepts.length;

            // Calculate probability based on difference severity and number of confused concept pairs
            const probability = Math.min(avgDifference * confusedConcepts.length * 0.1, 0.9);

            if (probability > this.riskThresholds.get('conceptual_confusion')!) {
                risks.push({
                    type: 'conceptual_confusion',
                    probability,
                    level: this.getRiskLevel(probability),
                    description: `Potential confusion between ${confusedConcepts.length} related concept pairs`,
                    affectedAreas: confusedConcepts.flatMap(c => [c.concept1, c.concept2]),
                    projectedValues: { conceptualClarityScore: 1 - avgDifference },
                    mitigationStrategies: [
                        'Provide explicit comparison between related concepts',
                        'Create concept relationship maps',
                        'Offer targeted exercises on concept differentiation',
                        'Review foundational understanding'
                    ],
                    dataPoints: conceptData.length
                });
            }
        }

        return risks;
    }

    /**
     * Helper method to generate pairs of concepts that are related
     * In a real implementation, this would use a knowledge graph or predefined relationships
     */
    private getRelatedConceptPairs(concepts: string[]): Array<[string, string]> {
        // This is a placeholder - in reality, there would be a proper mapping of related concepts
        const pairs: Array<[string, string]> = [];

        // Simulate some concept relationships
        const relationMapping: Record<string, string[]> = {
            'inheritance': ['polymorphism', 'classes', 'objects'],
            'polymorphism': ['inheritance', 'interfaces'],
            'variables': ['constants', 'data_types'],
            'loops': ['iteration', 'recursion'],
            'addition': ['subtraction', 'arithmetic'],
            'multiplication': ['division', 'arithmetic']
        };

        // Create pairs based on the mapping
        for (const concept of concepts) {
            const related = relationMapping[concept];
            if (related) {
                for (const relatedConcept of related) {
                    if (concepts.includes(relatedConcept)) {
                        pairs.push([concept, relatedConcept]);
                    }
                }
            }
        }

        return pairs;
    }

    /**
     * Projects the completion rate based on current trend
     */
    private projectedCompletion(
        completionRates: Array<{ timestamp: number, value: number }>,
        trend: number
    ): number {
        const latestValue = completionRates[completionRates.length - 1].value;
        // Project 10 time units into the future
        return Math.max(0, Math.min(1, latestValue + (trend * 10)));
    }

    /**
     * Deduplicate risks by combining similar predictions
     */
    private deduplicateRisks(risks: RiskPrediction[]): RiskPrediction[] {
        const uniqueRisks = new Map<string, RiskPrediction>();

        for (const risk of risks) {
            const key = risk.type;

            if (!uniqueRisks.has(key) || uniqueRisks.get(key)!.probability < risk.probability) {
                uniqueRisks.set(key, risk);
            }
        }

        return Array.from(uniqueRisks.values());
    }

    /**
     * Determines risk level based on probability
     */
    private getRiskLevel(probability: number): RiskLevel {
        if (probability >= 0.8) return 'high';
        if (probability >= 0.5) return 'medium';
        return 'low';
    }
}