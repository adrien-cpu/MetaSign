// src/ai/learning/analytics/analyzers/RiskPredictor.ts

// Types définis localement en attendant la création des modules dédiés
export type RiskType = 'completion_risk' | 'engagement_drop' | 'comprehension_issue' | 'skill_gap' | 'pace_mismatch' | 'conceptual_confusion';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface LearningMetrics {
  accuracy: number;
  completionTime: number;
  completionRate: number;
  engagementLevel: number;
  engagementScore: number;
  comprehensionScore: number;
  quizScore: number;
  skillAssessment: { [key: string]: { score: number } };
  skillAssessments: { [key: string]: { score: number } };
  moduleProgress: number;
  timeSpent: number;
  conceptPerformance: { [key: string]: number };
  timestamp: number;
}

export interface TimeSeriesData {
  values: number[];
  timestamps: number[];
}

export interface RiskPrediction {
  type: RiskType;
  level: RiskLevel;
  confidence: number;
  probability: number;
  description: string;
  suggestedActions: string[];
  affectedAreas?: string[];
}

// Interface minimaliste pour le collecteur de métriques
interface IMetricsCollector {
  recordMetric(name: string, value: number): void;
}

// Utilitaires statistiques simplifiés
class StatisticalUtils {
  static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }
}

// Utilitaires pour les séries temporelles
class TimeSeriesUtils {
  static detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    const first = values[0];
    const last = values[values.length - 1];
    const threshold = 0.1;
    if (first === 0) return 'stable';
    const change = (last - first) / first;
    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    if (first === 0) return 0;
    return (last - first) / first;
  }

  static calculateMovingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(avg);
    }
    return result;
  }

  static detectSuddenDrops(values: number[], threshold: number = 0.3): boolean[] {
    const drops: boolean[] = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] === 0) {
        drops.push(false);
        continue;
      }
      const change = (values[i] - values[i-1]) / values[i-1];
      drops.push(change < -threshold);
    }
    return drops;
  }
}

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
            // Analyze different risk types
            const allRisks: RiskPrediction[] = [
                ...this.analyzeCompletionRisk(metrics, timeSeriesData),
                ...this.analyzeEngagementDrop(metrics, timeSeriesData),
                ...this.analyzeComprehensionIssues(metrics, timeSeriesData),
                ...this.analyzeSkillGaps(metrics, timeSeriesData),
                ...this.analyzePaceMismatch(metrics, timeSeriesData),
                ...this.analyzeConceptualConfusion(metrics, timeSeriesData)
            ];

            // Filter risks above threshold and sort by severity
            const significantRisks = allRisks
                .filter(risk => risk.probability >= (this.riskThresholds.get(risk.type) || 0.5))
                .sort((a, b) => b.probability - a.probability);

            const endTime = performance.now();
            this.metricsCollector.recordMetric('risk_predictor.prediction_duration', endTime - startTime);
            this.metricsCollector.recordMetric('risk_predictor.risks_detected', significantRisks.length);

            return significantRisks;
        } catch (error) {
            this.metricsCollector.recordMetric('risk_predictor.prediction_error', 1);
            throw error;
        }
    }

    private analyzeCompletionRisk(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];
        
        const recentMetrics = metrics.slice(-5);
        const avgCompletionRate = StatisticalUtils.calculateMean(
            recentMetrics.map(m => m.completionRate)
        );
        
        // Analyser la tendance des données temporelles
        const trend = TimeSeriesUtils.detectTrend(timeSeriesData.values);
        const trendMultiplier = trend === 'decreasing' ? 1.2 : trend === 'increasing' ? 0.8 : 1;

        if (avgCompletionRate < 0.7) {
            const probability = Math.min(1, (1 - avgCompletionRate) * trendMultiplier);
            const level: RiskLevel = probability > 0.8 ? 'critical' : 
                                   probability > 0.6 ? 'high' : 
                                   probability > 0.4 ? 'medium' : 'low';

            risks.push({
                type: 'completion_risk',
                level,
                confidence: 0.75,
                probability,
                description: `Low completion rate detected (${(avgCompletionRate * 100).toFixed(1)}%)`,
                suggestedActions: [
                    'Break down complex tasks into smaller chunks',
                    'Provide additional scaffolding and support',
                    'Review learning pace and adjust difficulty'
                ],
                affectedAreas: ['task_completion', 'progress_tracking']
            });
        }

        return risks;
    }

    private analyzeEngagementDrop(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];
        
        const recentMetrics = metrics.slice(-5);
        const engagementScores = recentMetrics.map(m => m.engagementScore);
        const metricsTrend = TimeSeriesUtils.detectTrend(engagementScores);
        const timeSeriesTrend = TimeSeriesUtils.detectTrend(timeSeriesData.values);
        
        // Combiner les tendances des métriques et des données temporelles
        const combinedTrend = metricsTrend === 'decreasing' || timeSeriesTrend === 'decreasing' ? 'decreasing' : 'stable';

        if (combinedTrend === 'decreasing') {
            const avgEngagement = StatisticalUtils.calculateMean(engagementScores);
            const probability = 1 - avgEngagement;
            
            risks.push({
                type: 'engagement_drop',
                level: probability > 0.6 ? 'high' : 'medium',
                confidence: 0.7,
                probability,
                description: 'Decreasing engagement trend detected',
                suggestedActions: [
                    'Introduce more interactive content',
                    'Provide immediate feedback',
                    'Adjust content to learner preferences'
                ],
                affectedAreas: ['motivation', 'participation']
            });
        }

        return risks;
    }

    private analyzeComprehensionIssues(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];
        
        const recentMetrics = metrics.slice(-5);
        const avgComprehension = StatisticalUtils.calculateMean(
            recentMetrics.map(m => m.comprehensionScore)
        );

        if (avgComprehension < 0.6) {
            // Détecter les chutes soudaines dans les données temporelles
            const suddenDrops = TimeSeriesUtils.detectSuddenDrops(timeSeriesData.values, 0.2);
            const hasRecentDrop = suddenDrops.slice(-3).some(drop => drop);
            const dropMultiplier = hasRecentDrop ? 1.3 : 1;
            
            const probability = Math.min(1, (1 - avgComprehension) * dropMultiplier);
            
            risks.push({
                type: 'comprehension_issue',
                level: probability > 0.7 ? 'critical' : 'high',
                confidence: 0.8,
                probability,
                description: `Low comprehension scores (${(avgComprehension * 100).toFixed(1)}%)`,
                suggestedActions: [
                    'Provide additional explanations',
                    'Use alternative teaching methods',
                    'Schedule one-on-one support sessions'
                ],
                affectedAreas: ['understanding', 'knowledge_retention']
            });
        }

        return risks;
    }

    private analyzeSkillGaps(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];
        
        if (metrics.length === 0) return risks;
        
        const latestMetrics = metrics[metrics.length - 1];
        const skillAssessments = latestMetrics.skillAssessments || {};
        
        const lowSkills = Object.entries(skillAssessments)
            .filter(([, skill]) => skill.score < 0.5)
            .map(([skillName]) => skillName);

        if (lowSkills.length > 0) {
            const totalSkills = Object.keys(skillAssessments).length;
            
            // Analyser la stabilité des performances via les données temporelles
            const movingAvg = TimeSeriesUtils.calculateMovingAverage(timeSeriesData.values, 3);
            const isUnstable = movingAvg.length > 0 && StatisticalUtils.calculateStandardDeviation(movingAvg) > 0.15;
            const instabilityMultiplier = isUnstable ? 1.15 : 1;
            
            const probability = Math.min(1, (lowSkills.length / Math.max(totalSkills, 1)) * instabilityMultiplier);
            
            risks.push({
                type: 'skill_gap',
                level: probability > 0.6 ? 'high' : 'medium',
                confidence: 0.75,
                probability,
                description: `Skill gaps identified in ${lowSkills.length} areas`,
                suggestedActions: [
                    'Focus on foundational skills',
                    'Provide targeted practice exercises',
                    'Create personalized skill development plan'
                ],
                affectedAreas: lowSkills
            });
        }

        return risks;
    }

    private analyzePaceMismatch(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];
        
        const recentMetrics = metrics.slice(-5);
        const timeSpentValues = recentMetrics.map(m => m.timeSpent);
        const progressValues = recentMetrics.map(m => m.moduleProgress);
        
        const avgTimeSpent = StatisticalUtils.calculateMean(timeSpentValues);
        const avgProgress = StatisticalUtils.calculateMean(progressValues);
        
        // Analyser le rythme via les données temporelles
        const timeSeriesTrend = TimeSeriesUtils.calculateTrend(timeSeriesData.values);
        const paceIssue = Math.abs(timeSeriesTrend) < 0.05; // Trend très faible = problème de rythme
        
        // High time spent but low progress indicates pace issues
        if (avgTimeSpent > 0.8 && avgProgress < 0.4) {
            const baseProbability = (avgTimeSpent - avgProgress) / 2;
            const probability = paceIssue ? Math.min(1, baseProbability * 1.25) : baseProbability;
            
            risks.push({
                type: 'pace_mismatch',
                level: probability > 0.5 ? 'high' : 'medium',
                confidence: 0.65,
                probability,
                description: 'High time investment but low progress rate',
                suggestedActions: [
                    'Adjust content difficulty',
                    'Provide additional learning resources',
                    'Review learning objectives and expectations'
                ],
                affectedAreas: ['time_management', 'progress_rate']
            });
        }

        return risks;
    }

    private analyzeConceptualConfusion(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];
        
        if (metrics.length === 0) return risks;
        
        const latestMetrics = metrics[metrics.length - 1];
        const conceptPerformance = latestMetrics.conceptPerformance || {};
        
        const confusedConcepts = Object.entries(conceptPerformance)
            .filter(([, score]) => score < 0.5)
            .map(([concept]) => concept);

        if (confusedConcepts.length > 0) {
            const totalConcepts = Object.keys(conceptPerformance).length;
            
            // Analyser la volatilité des performances
            const volatility = StatisticalUtils.calculateStandardDeviation(timeSeriesData.values);
            const isVolatile = volatility > 0.2;
            const volatilityMultiplier = isVolatile ? 1.2 : 1;
            
            const probability = Math.min(1, (confusedConcepts.length / Math.max(totalConcepts, 1)) * volatilityMultiplier);
            
            risks.push({
                type: 'conceptual_confusion',
                level: probability > 0.5 ? 'high' : 'medium',
                confidence: 0.7,
                probability,
                description: `Conceptual confusion in ${confusedConcepts.length} areas`,
                suggestedActions: [
                    'Clarify fundamental concepts',
                    'Use visual aids and examples',
                    'Provide conceptual practice exercises'
                ],
                affectedAreas: confusedConcepts
            });
        }

        return risks;
    }
}