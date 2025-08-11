// src/ai/systems/expressions/validation/ExpressionSynchronizer.ts

interface ValidationIssue {
  component: 'timing' | 'coordination' | 'movement';
  message: string;
  severity: 'warning' | 'error';
}

interface ExpressionPattern {
  eyebrows: {
    position: number;
    tension?: number;
  };
  eyes: {
    openness: number;
    direction?: string;
  };
  mouth: {
    shape: string;
    tension?: number;
  };
  timing?: {
    duration: number;
    delay?: number;
  };
}

export class ExpressionSynchronizer {
  private readonly TIMING_THRESHOLD = 0.2; // 200ms
  private readonly COORDINATION_THRESHOLD = 0.15; // 150ms

  synchronizeComponents(pattern: ExpressionPattern): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Synchronisation temporelle
    const timingIssues = this.checkTiming(pattern);
    if (timingIssues) {
      issues.push(timingIssues);
    }

    // Coordination des mouvements
    const coordinationIssues = this.checkMovementCoordination(pattern);
    if (coordinationIssues) {
      issues.push(coordinationIssues);
    }

    return issues;
  }

  private checkTiming(pattern: ExpressionPattern): ValidationIssue | null {
    // Vérifier que les changements sont synchronisés
    const movements = [
      { name: 'sourcils', active: pattern.eyebrows.position !== 0 },
      { name: 'yeux', active: pattern.eyes.openness !== 1 },
      { name: 'bouche', active: pattern.mouth.shape !== 'neutral' }
    ];

    const activeMovements = movements.filter(m => m.active);

    if (activeMovements.length > 1) {
      const hasTiming = pattern.timing && pattern.timing.duration > 0;
      if (!hasTiming) {
        return {
          component: 'timing',
          message: `Désynchronisation des composants: ${activeMovements.map(m => m.name).join(', ')}`,
          severity: 'error'
        };
      }

      if (!this.validateTimingSequence(activeMovements.length, pattern.timing?.duration || 0)) {
        return {
          component: 'timing',
          message: 'Durée de synchronisation invalide',
          severity: 'error'
        };
      }
    }

    return null;
  }

  private checkMovementCoordination(pattern: ExpressionPattern): ValidationIssue | null {
    // Valider la cohérence des mouvements
    const conflictingMovements = this.detectConflictingMovements(pattern);
    if (conflictingMovements.length > 0) {
      return {
        component: 'coordination',
        message: `Mouvements conflictuels détectés: ${conflictingMovements.join(', ')}`,
        severity: 'error'
      };
    }

    return null;
  }

  private validateTimingSequence(componentCount: number, duration: number): boolean {
    // Vérifier que la durée est suffisante pour le nombre de composants
    const minimumDuration = (componentCount - 1) * this.TIMING_THRESHOLD;
    return duration >= minimumDuration;
  }

  private detectConflictingMovements(pattern: ExpressionPattern): string[] {
    const conflicts: string[] = [];

    // Exemple de règle : sourcils levés + yeux fermés est incohérent
    if (pattern.eyebrows.position > 0.7 && pattern.eyes.openness < 0.3) {
      conflicts.push('sourcils levés avec yeux fermés');
    }

    // Exemple de règle : bouche souriante avec sourcils froncés
    if (pattern.mouth.shape === 'smile' && pattern.eyebrows.position < -0.5) {
      conflicts.push('sourire avec sourcils froncés');
    }

    return conflicts;
  }
}