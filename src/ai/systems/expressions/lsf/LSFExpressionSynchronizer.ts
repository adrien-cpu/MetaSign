// src/ai/systems/expressions/lsf/LSFExpressionSynchronizer.ts
import { ExpressionAnimator } from '../animation/ExpressionAnimator';
import { LSFGrammarSystem } from './LSFGrammarSystem';
import { LSFtoRPMMapper } from './LSFExpressionBridge';

// Ajout des interfaces et types nécessaires
interface LSFGrammaticalContext {
  type: GrammaticalType;
  modifiers: GrammaticalModifier[];
  emphasis?: EmphasisLevel;
  timing?: TimingConstraints;
}

type GrammaticalType = 'QUESTION' | 'CONDITION' | 'NEGATION' | 'EMPHASIS' | 'STATEMENT';
type GrammaticalModifier = 'HOLD' | 'QUICK' | 'SMOOTH' | 'SHARP';
type EmphasisLevel = 'LIGHT' | 'MEDIUM' | 'STRONG';

interface TimingConstraints {
  minDuration?: number;
  maxDuration?: number;
  preferredDuration?: number;
  mustSync?: boolean;
}

interface ExpressionTiming {
  type: GrammaticalType;
  modifiers?: GrammaticalModifier[];
  duration?: number;
  constraints?: TimingConstraints;
}

interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  priority: number;
  constraints?: {
    minSpeed?: number;
    maxSpeed?: number;
    smoothness?: number;
  };
}

type EasingFunction =
  'easeOutQuad' |
  'easeInOutQuad' |
  'easeInOutCubic' |
  'easeOutElastic' |
  'linear';

interface SyncContext {
  error: Error;
  timing?: ExpressionTiming;
  lastSuccess?: Date;
  attempts: number;
}

// Modification de la classe d'erreur
class LSFSyncError extends Error {
  constructor(
    message: string,
    public readonly context: SyncContext
  ) {
    super(message);
    this.name = 'LSFSyncError';
  }
}

// Constantes typées
const BASE_DURATIONS: Record<GrammaticalType, number> = {
  QUESTION: 600,
  CONDITION: 800,
  NEGATION: 400,
  EMPHASIS: 300,
  STATEMENT: 500
};

const EXPRESSION_PRIORITIES: Record<GrammaticalType, number> = {
  NEGATION: 5,
  QUESTION: 4,
  CONDITION: 3,
  EMPHASIS: 2,
  STATEMENT: 1
};

export class LSFExpressionSynchronizer {
  constructor(
    private grammarSystem: LSFGrammarSystem,
    private expressionAnimator: ExpressionAnimator,
    private expressionMapper: LSFtoRPMMapper
  ) { }

  async synchronizeExpression(
    grammaticalContext: LSFGrammaticalContext,
    timing: ExpressionTiming
  ): Promise<void> {
    try {
      // Générer l'expression LSF selon le contexte grammatical
      const lsfExpression = await this.grammarSystem.generateExpressionForGrammar(
        grammaticalContext
      );

      // Convertir l'expression LSF en morphs RPM
      const rpmMorphs = this.expressionMapper.mapToRPM(lsfExpression);

      // Appliquer les paramètres de timing
      const animationConfig = this.generateAnimationConfig(timing);

      // Animer l'expression
      await this.expressionAnimator.animateExpression(
        rpmMorphs,
        animationConfig.duration
      );

    } catch (error) {
      console.error('Expression synchronization error:', error);
      throw new LSFSyncError('Failed to synchronize expression', { error });
    }
  }

  private generateAnimationConfig(timing: ExpressionTiming): AnimationConfig {
    return {
      duration: this.calculateDuration(timing),
      easing: this.determineEasing(timing.type),
      priority: this.calculatePriority(timing.type),
      constraints: this.getAnimationConstraints(timing)
    };
  }

  private calculateDuration(timing: ExpressionTiming): number {
    let duration = BASE_DURATIONS[timing.type] || 500;

    if (timing.modifiers?.includes('HOLD')) {
      duration *= 1.5;
    }
    if (timing.modifiers?.includes('QUICK')) {
      duration *= 0.7;
    }

    // Respecter les contraintes de timing si définies
    if (timing.constraints) {
      if (timing.constraints.minDuration) {
        duration = Math.max(duration, timing.constraints.minDuration);
      }
      if (timing.constraints.maxDuration) {
        duration = Math.min(duration, timing.constraints.maxDuration);
      }
    }

    return duration;
  }

  private determineEasing(type: GrammaticalType): EasingFunction {
    const easingMap: Record<GrammaticalType, EasingFunction> = {
      QUESTION: 'easeOutQuad',
      CONDITION: 'easeInOutQuad',
      NEGATION: 'easeInOutCubic',
      EMPHASIS: 'easeOutElastic',
      STATEMENT: 'easeInOutCubic'
    };

    return easingMap[type] || 'easeInOutCubic';
  }

  private calculatePriority(type: GrammaticalType): number {
    return EXPRESSION_PRIORITIES[type] || 1;
  }

  private getAnimationConstraints(timing: ExpressionTiming): AnimationConfig['constraints'] {
    return {
      minSpeed: timing.modifiers?.includes('QUICK') ? 1.5 : 1,
      maxSpeed: timing.modifiers?.includes('SMOOTH') ? 2 : 3,
      smoothness: timing.modifiers?.includes('SHARP') ? 0.5 : 1
    };
  }
}