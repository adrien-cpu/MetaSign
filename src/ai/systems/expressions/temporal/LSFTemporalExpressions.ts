// src/ai/systems/expressions/temporal/LSFTemporalExpressions.ts
import {
  TemporalTransition,
  RhythmPattern,
  SynchronizationPoint,
  TemporalContext,
  TemporalRequirements,
  TemporalMetadata,
  TransitionType,
  TransitionValidation,
  ComponentValue
} from './types';

// Define the extended LSFExpression type with index signature
interface ExtendedLSFExpression {
  [key: string]: ComponentValue;
}

interface TransitionLimits {
  minDuration: number;
  maxDuration: number;
  maxGap: number;
}

interface TemporalConstraints {
  transitionLimits: TransitionLimits;
  allowedTransitionTypes: TransitionType[];
}

export class LSFTemporalExpressions {
  private readonly temporalConstraints: TemporalConstraints = {
    transitionLimits: {
      minDuration: 100,
      maxDuration: 1000,
      maxGap: 500
    },
    allowedTransitionTypes: ['constant', 'increasing', 'decreasing']
  };

  private readonly requirements: TemporalRequirements = {
    minSyncPointCount: 2,
    maxConcurrentTransitions: 3,
    requiredPatternTypes: ['sequence', 'repetition'],
    minDurationPerComponent: 100
  };

  constructor(private context: TemporalContext) { }

  private calculateComponentDuration(component: ComponentValue): number {
    if (!component) return 0;
    return component.intensity * 1000;
  }

  private determineTransitionType(
    current: ComponentValue,
    next: ComponentValue
  ): TransitionType {
    if (current.intensity === next.intensity) return 'constant';
    return current.intensity < next.intensity ? 'increasing' : 'decreasing';
  }

  public async extractDurations(expression: ExtendedLSFExpression): Promise<number[]> {
    const durations: number[] = [];
    for (const componentId in expression) {
      if (expression.hasOwnProperty(componentId)) {
        const value = expression[componentId];
        const duration = this.calculateComponentDuration(value);
        if (duration > 0) {
          durations.push(duration);
        }
      }
    }
    return durations;
  }

  public async extractTransitions(expression: ExtendedLSFExpression): Promise<TemporalTransition[]> {
    const transitions: TemporalTransition[] = [];
    const components = Object.keys(expression);

    for (let i = 0; i < components.length - 1; i++) {
      const currentComponent = components[i];
      const nextComponent = components[i + 1];

      const currentValue = expression[currentComponent];
      const nextValue = expression[nextComponent];

      const startTime = Date.now();
      const duration = Math.abs(currentValue.intensity - nextValue.intensity) * 1000;
      const type = this.determineTransitionType(currentValue, nextValue);

      transitions.push({
        sourceComponent: currentComponent,
        targetComponent: nextComponent,
        startTime,
        endTime: startTime + duration,
        duration,
        type
      });
    }

    return transitions;
  }

  public async extractRhythms(expression: ExtendedLSFExpression): Promise<RhythmPattern[]> {
    const durations = await this.extractDurations(expression);
    const patterns: RhythmPattern[] = [];

    if (durations.length >= 2) {
      const intervals = durations.slice(1).map((d, i) => d - durations[i]);
      const averageInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

      patterns.push({
        patternType: 'sequence',
        durations,
        interval: averageInterval
      });
    }

    return patterns;
  }

  public async extractSyncPoints(expression: ExtendedLSFExpression): Promise<SynchronizationPoint[]> {
    const transitions = await this.extractTransitions(expression);
    const syncPoints: SynchronizationPoint[] = [];

    for (const transition of transitions) {
      syncPoints.push({
        involvedComponents: [transition.sourceComponent, transition.targetComponent],
        timestamp: this.calculateSyncTimestamp(transition),
        syncType: 'transition'
      });
    }

    return syncPoints;
  }

  private calculateSyncTimestamp(transition: TemporalTransition): number {
    return transition.startTime + (transition.duration / 2);
  }

  public async generateTemporalMetadata(expression: ExtendedLSFExpression): Promise<TemporalMetadata> {
    const transitions = await this.extractTransitions(expression);
    const syncPoints = await this.extractSyncPoints(expression);
    const durations = await this.extractDurations(expression);

    return {
      transitions,
      synchronizationPoints: syncPoints,
      totalDuration: durations.reduce((sum, d) => sum + d, 0)
    };
  }

  private validateTransitionDuration(duration: number): boolean {
    const { minDuration, maxDuration } = this.temporalConstraints.transitionLimits;
    return duration >= minDuration && duration <= maxDuration;
  }

  private validateTransition(transition: TemporalTransition): TransitionValidation {
    return {
      valid: this.temporalConstraints.allowedTransitionTypes.includes(transition.type) &&
        this.validateTransitionDuration(transition.duration)
    };
  }
}