// src/ai/systems/expressions/situations/educational/special_needs/tracking/DetailedProgressTracker.ts

import {
  Learner,
  TrackingPeriod,
  ProgressReport,
  LinguisticProgress,
  CognitiveProgress,
  AdaptationEffectiveness,
  ManualProgress,
  NonManualProgress,
  IntegrationMetrics,
  SpatialProgress,
  LinguisticProcessingProgress,
  OverallProgress,
  ProgressRecommendations,
  LearningRecord
} from './types';

export class DetailedProgressTracker {
  private readonly TRACKING_PARAMETERS = {
    THRESHOLDS: {
      MANUAL: { MIN: 0.6, TARGET: 0.9 },
      NON_MANUAL: { MIN: 0.5, TARGET: 0.8 },
      INTEGRATION: { MIN: 0.7, TARGET: 0.95 }
    },
    WEIGHTS: {
      LINGUISTIC: 0.4,
      COGNITIVE: 0.3,
      ADAPTATION: 0.3
    },
    PLATEAU: {
      MIN_SAMPLES: 3,
      VARIANCE_THRESHOLD: 0.02
    }
  };

  async trackProgress(
    learner: Learner,
    period: TrackingPeriod = { duration: 'MONTH' }
  ): Promise<ProgressReport> {
    const filteredHistory = this.filterHistoryByPeriod(learner.learning_history, period);
    const periodData = { ...period, filteredHistory };

    const [linguisticProgress, cognitiveProgress, adaptationEffectiveness] = await Promise.all([
      this.assessLinguisticProgress(learner, periodData),
      this.assessCognitiveProgress(learner, periodData),
      this.analyzeAdaptationEffectiveness(learner, periodData)
    ]);

    const recommendations = this.generateProgressRecommendations([
      linguisticProgress,
      cognitiveProgress,
      adaptationEffectiveness
    ]);

    return {
      linguistic: linguisticProgress,
      cognitive: cognitiveProgress,
      adaptations: adaptationEffectiveness,
      overall: this.calculateOverallProgress([linguisticProgress, cognitiveProgress, adaptationEffectiveness]),
      recommendations
    };
  }

  private filterHistoryByPeriod(history: LearningRecord[], period: TrackingPeriod): LearningRecord[] {
    const endDate = period.endDate || new Date();
    const startDate = period.startDate || new Date(endDate.getTime() - this.getPeriodDuration(period.duration));

    return history.filter(record => {
      const recordDate = new Date(record.day * 24 * 60 * 60 * 1000);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  private getPeriodDuration(duration: string): number {
    const DURATIONS = {
      'DAY': 24 * 60 * 60 * 1000,
      'WEEK': 7 * 24 * 60 * 60 * 1000,
      'MONTH': 30 * 24 * 60 * 60 * 1000,
      'YEAR': 365 * 24 * 60 * 60 * 1000
    };
    return DURATIONS[duration as keyof typeof DURATIONS] || DURATIONS.MONTH;
  }

  private async assessLinguisticProgress(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<LinguisticProgress> {
    const [manual, nonManual] = await Promise.all([
      this.evaluateManualComponents(learner, periodData),
      this.evaluateNonManualFeatures(learner, periodData)
    ]);

    return {
      manual,
      nonManual,
      integration: await this.evaluateComponentIntegration(manual, nonManual)
    };
  }

  private async assessCognitiveProgress(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<CognitiveProgress> {
    const [spatial, linguistic] = await Promise.all([
      this.evaluateSpatialProcessing(learner, periodData),
      this.evaluateLinguisticProcessing(learner, periodData)
    ]);

    return {
      spatial,
      linguistic,
      integration: await this.evaluateCognitiveIntegration(spatial, linguistic)
    };
  }

  private async evaluateManualComponents(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<ManualProgress> {
    const accuracyTrend = periodData.filteredHistory.map(record => record.performance.accuracy);
    const threshold = this.TRACKING_PARAMETERS.THRESHOLDS.MANUAL;

    return {
      accuracy_trend: accuracyTrend,
      handshape_mastery: this.calculateMastery(accuracyTrend, threshold),
      movement_control: this.calculateControl(accuracyTrend, threshold)
    };
  }

  private async evaluateNonManualFeatures(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<NonManualProgress> {
    const baselineNaturalness = learner.baseline.non_manual_features.naturalness;
    const threshold = this.TRACKING_PARAMETERS.THRESHOLDS.NON_MANUAL;
    const fluencyTrend = periodData.filteredHistory.map(record => record.performance.fluency);

    return {
      naturalness_trend: fluencyTrend.map(fluency =>
        Math.min(baselineNaturalness + fluency * 0.2, 1)
      ),
      facial_accuracy: this.calculateMastery([baselineNaturalness], threshold),
      body_coordination: this.calculateControl(fluencyTrend, threshold)
    };
  }

  private async evaluateComponentIntegration(
    manual: ManualProgress,
    nonManual: NonManualProgress
  ): Promise<IntegrationMetrics> {
    const overallScore = (
      manual.handshape_mastery * this.TRACKING_PARAMETERS.WEIGHTS.LINGUISTIC +
      nonManual.facial_accuracy * this.TRACKING_PARAMETERS.WEIGHTS.COGNITIVE
    ) / (this.TRACKING_PARAMETERS.WEIGHTS.LINGUISTIC + this.TRACKING_PARAMETERS.WEIGHTS.COGNITIVE);

    return {
      overall_score: Math.max(0, Math.min(1, overallScore)),
      synchronization: (manual.movement_control + nonManual.body_coordination) / 2,
      fluidity: (
        this.calculateStability(manual.accuracy_trend) * 0.6 +
        this.calculateStability(nonManual.naturalness_trend) * 0.4
      )
    };
  }

  private async evaluateSpatialProcessing(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<SpatialProgress> {
    const accuracyTrend = periodData.filteredHistory.map(record => record.performance.accuracy);
    const baseline = learner.baseline.manual_skills.accuracy;
    const threshold = this.TRACKING_PARAMETERS.THRESHOLDS.MANUAL;

    return {
      reference_management: this.calculateMastery(accuracyTrend, threshold),
      memory_integration: this.calculateStability(accuracyTrend),
      overall: (this.calculateMastery([baseline], threshold) + this.calculateStability(accuracyTrend)) / 2
    };
  }

  private async evaluateLinguisticProcessing(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<LinguisticProcessingProgress> {
    const fluencyTrend = periodData.filteredHistory.map(record => record.performance.fluency);
    const baseline = learner.baseline.non_manual_features.precision;
    const threshold = this.TRACKING_PARAMETERS.THRESHOLDS.NON_MANUAL;

    return {
      grammar_comprehension: this.calculateMastery(fluencyTrend, threshold),
      metalinguistic_awareness: this.calculateStability(fluencyTrend),
      overall: (this.calculateMastery([baseline], threshold) + this.calculateStability(fluencyTrend)) / 2
    };
  }

  private async evaluateCognitiveIntegration(
    spatial: SpatialProgress,
    linguistic: LinguisticProcessingProgress
  ): Promise<IntegrationMetrics> {
    const weights = this.TRACKING_PARAMETERS.WEIGHTS;
    const overallScore = (
      spatial.overall * weights.COGNITIVE +
      linguistic.overall * weights.LINGUISTIC
    ) / (weights.COGNITIVE + weights.LINGUISTIC);

    return {
      overall_score: Math.max(0, Math.min(1, overallScore)),
      synchronization: Math.min(spatial.reference_management, linguistic.grammar_comprehension),
      fluidity: (spatial.memory_integration + linguistic.metalinguistic_awareness) / 2
    };
  }

  private async analyzeAdaptationEffectiveness(
    learner: Learner,
    periodData: TrackingPeriod & { filteredHistory: LearningRecord[] }
  ): Promise<AdaptationEffectiveness> {
    const recentRecords = periodData.filteredHistory.slice(-5);
    const accuracyTrend = recentRecords.map(record => record.performance.accuracy);
    const fluencyTrend = recentRecords.map(record => record.performance.fluency);

    const utilization = this.calculateStability(accuracyTrend);
    const impact = this.calculateControl(fluencyTrend, this.TRACKING_PARAMETERS.THRESHOLDS.INTEGRATION);

    return {
      support_utilization: utilization,
      outcome_impact: impact,
      overall: (utilization + impact) / 2
    };
  }

  private calculateOverallProgress(
    progress: [LinguisticProgress, CognitiveProgress, AdaptationEffectiveness]
  ): OverallProgress {
    const [linguistic, cognitive, adaptation] = progress;
    const weights = this.TRACKING_PARAMETERS.WEIGHTS;

    return {
      linguistic_score: linguistic.integration.overall_score,
      cognitive_score: cognitive.integration.overall_score,
      adaptation_score: adaptation.overall,
      total_score: (
        linguistic.integration.overall_score * weights.LINGUISTIC +
        cognitive.integration.overall_score * weights.COGNITIVE +
        adaptation.overall * weights.ADAPTATION
      ) / (weights.LINGUISTIC + weights.COGNITIVE + weights.ADAPTATION)
    };
  }

  private calculateMastery(trend: number[], threshold: { MIN: number; TARGET: number }): number {
    const current = trend[trend.length - 1] || 0;
    return Math.max(0, Math.min(1, (current - threshold.MIN) / (threshold.TARGET - threshold.MIN)));
  }

  private calculateControl(trend: number[], threshold: { MIN: number; TARGET: number }): number {
    const stability = this.calculateStability(trend);
    return Math.max(0, Math.min(1, stability * this.calculateMastery(trend, threshold)));
  }

  private calculateStability(trend: number[]): number {
    if (trend.length < 2) return 1;
    const variations = trend.slice(1).map((val, i) => Math.abs(val - trend[i]));
    return Math.max(0, Math.min(1, 1 - Math.max(...variations)));
  }

  private generateProgressRecommendations(
    progress: [LinguisticProgress, CognitiveProgress, AdaptationEffectiveness]
  ): ProgressRecommendations {
    const [linguistic, cognitive, adaptation] = progress;
    const recommendations: ProgressRecommendations = {
      linguistic: [],
      cognitive: [],
      adaptation: [],
      general: []
    };

    if (this.detectPlateau(linguistic.manual.accuracy_trend)) {
      recommendations.linguistic.push('increase handshape accuracy practice');
    }

    if (cognitive.spatial.overall < this.TRACKING_PARAMETERS.THRESHOLDS.INTEGRATION.MIN) {
      recommendations.cognitive.push('focus on spatial references');
    }

    if (adaptation.support_utilization < this.TRACKING_PARAMETERS.THRESHOLDS.MANUAL.MIN) {
      recommendations.adaptation.push('refine support methods');
    }

    const overallScore = (linguistic.integration.overall_score + cognitive.integration.overall_score + adaptation.overall) / 3;
    if (overallScore > this.TRACKING_PARAMETERS.THRESHOLDS.INTEGRATION.MIN) {
      recommendations.general.push('maintain current progress rate');
    } else {
      recommendations.general.push('data shows need for more intensive intervention');
    }

    return recommendations;
  }

  private detectPlateau(trend: number[]): boolean {
    if (trend.length < this.TRACKING_PARAMETERS.PLATEAU.MIN_SAMPLES) return false;

    const recentValues = trend.slice(-this.TRACKING_PARAMETERS.PLATEAU.MIN_SAMPLES);
    const variance = this.calculateVariance(recentValues);

    return variance < this.TRACKING_PARAMETERS.PLATEAU.VARIANCE_THRESHOLD;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
}