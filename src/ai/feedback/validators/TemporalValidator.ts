import { FeedbackEntry } from '../types';
import { ValidationResult, ValidationSeverity } from '../types/validation';
import { TemporalContext } from '../../systems/expressions/emotions/types';
import { LSFTemporalExpressions } from '../../systems/expressions/temporal/LSFTemporalExpressions';
import { SeverityWeights, ValidationParams } from './types';

interface TemporalTransition {
  startTime: number;
  endTime: number;
  type: string;
  elements: string[];
}

interface RhythmPattern {
  duration: number;
  beats: number[];
  intensity: number;
}

interface SynchronizationPoint {
  timestamp: number;
  elements: string[];
  type: string;
}

export class TemporalValidator {
  constructor(private temporalExpressions: LSFTemporalExpressions) { }

  async validate(feedback: FeedbackEntry, config: TemporalContext): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.validateDuration(feedback, config),
      this.validateTransitions(feedback, config),
      this.validateRhythm(feedback, config),
      this.validateSynchronization(feedback, config)
    ]);

    return this.aggregateResults(validations);
  }

  private async validateDuration(
    feedback: FeedbackEntry,
    config: TemporalContext
  ): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const durations = this.extractDurations(feedback);

    for (const duration of durations) {
      if (!this.isValidDuration(duration, config)) {
        issues.push({
          type: 'duration',
          severity: 'high',
          description: `Invalid duration: ${duration}ms`
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateScore(issues)
    };
  }

  private async validateTransitions(
    feedback: FeedbackEntry,
    config: TemporalContext
  ): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const transitions = this.extractTransitions(feedback);

    for (const transition of transitions) {
      const validationResults = this.validateTransition(transition, config);
      issues.push(...validationResults);
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateScore(issues)
    };
  }

  private async validateRhythm(
    feedback: FeedbackEntry,
    config: TemporalContext
  ): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const rhythms = this.extractRhythms(feedback);

    for (const rhythm of rhythms) {
      if (!this.isValidRhythm(rhythm, config)) {
        issues.push({
          type: 'rhythm',
          severity: 'medium',
          description: 'Invalid rhythm pattern detected'
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateScore(issues)
    };
  }

  private async validateSynchronization(
    feedback: FeedbackEntry,
    config: TemporalContext
  ): Promise<ValidationResult> {
    const issues: ValidationParams[] = [];
    const syncPoints = this.extractSyncPoints(feedback);

    for (const point of syncPoints) {
      if (!this.isValidSyncPoint(point, config)) {
        issues.push({
          type: 'synchronization',
          severity: 'high',
          description: 'Invalid synchronization point'
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateScore(issues)
    };
  }

  private calculateScore(issues: ValidationParams[]): number {
    if (issues.length === 0) return 1.0;

    return Math.max(0, 1 - issues.reduce((sum, issue) =>
      sum + SeverityWeights[issue.severity], 0));
  }

  private extractDurations(feedback: FeedbackEntry): number[] {
    // Logique d'extraction des durées
    return this.temporalExpressions.extractDurations(feedback.content);
  }

  private extractTransitions(feedback: FeedbackEntry): TemporalTransition[] {
    // Logique d'extraction des transitions
    return this.temporalExpressions.extractTransitions(feedback.content);
  }

  private extractRhythms(feedback: FeedbackEntry): RhythmPattern[] {
    // Logique d'extraction des rythmes
    return this.temporalExpressions.extractRhythms(feedback.content);
  }

  private extractSyncPoints(feedback: FeedbackEntry): SynchronizationPoint[] {
    // Logique d'extraction des points de synchronisation
    return this.temporalExpressions.extractSyncPoints(feedback.content);
  }

  private isValidDuration(duration: number, config: TemporalContext): boolean {
    const { minDuration, maxDuration } = config.durationConstraints;
    return duration >= minDuration && duration <= maxDuration;
  }

  private validateTransition(
    transition: TemporalTransition,
    config: TemporalContext
  ): ValidationParams[] {
    const issues: ValidationParams[] = [];

    // Vérification de la durée de transition
    const transitionDuration = transition.endTime - transition.startTime;
    if (!this.isValidTransitionDuration(transitionDuration, config)) {
      issues.push({
        type: 'transition_duration',
        severity: 'medium',
        description: `Invalid transition duration: ${transitionDuration}ms`
      });
    }

    // Vérification du type de transition
    if (!config.allowedTransitionTypes.includes(transition.type)) {
      issues.push({
        type: 'transition_type',
        severity: 'high',
        description: `Invalid transition type: ${transition.type}`
      });
    }

    return issues;
  }

  private isValidTransitionDuration(duration: number, config: TemporalContext): boolean {
    const { minTransitionDuration, maxTransitionDuration } = config.transitionConstraints;
    return duration >= minTransitionDuration && duration <= maxTransitionDuration;
  }

  private isValidRhythm(rhythm: RhythmPattern, config: TemporalContext): boolean {
    // Vérification de la validité du rythme
    return (
      rhythm.duration >= config.rhythmConstraints.minDuration &&
      rhythm.duration <= config.rhythmConstraints.maxDuration &&
      rhythm.intensity >= 0 &&
      rhythm.intensity <= 1 &&
      this.validateRhythmPattern(rhythm.beats, config)
    );
  }

  private validateRhythmPattern(beats: number[], config: TemporalContext): boolean {
    // Validation du pattern rythmique
    return beats.every(beat =>
      beat >= config.rhythmConstraints.minBeatDuration &&
      beat <= config.rhythmConstraints.maxBeatDuration
    );
  }

  private isValidSyncPoint(point: SynchronizationPoint, config: TemporalContext): boolean {
    // Vérification de la validité du point de synchronisation
    return (
      point.timestamp >= 0 &&
      point.elements.length > 0 &&
      config.allowedSyncTypes.includes(point.type)
    );
  }

  private aggregateResults(results: ValidationResult[]): ValidationResult {
    const allIssues = results.flatMap(r => r.issues);
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      isValid: results.every(r => r.isValid),
      issues: this.prioritizeIssues(allIssues),
      score: averageScore
    };
  }

  private prioritizeIssues(issues: ValidationParams[]): ValidationParams[] {
    return issues
      .sort((a, b) => SeverityWeights[b.severity] - SeverityWeights[a.severity])
      .slice(0, 10); // Garder les 10 problèmes les plus importants
  }
}