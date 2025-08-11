// src/ai/systems/expressions/situations/emergency/safety/EvacuationSignalSystem.ts

import {
  EvacuationSituation,
  SignalContext,
  EvacuationSignal,
  SignalRequirements,
  SelectedSignals,
  AdaptedSignals,
  ValidationResult,
  Adaptation,
  EffectivenessMetrics,
  ContextualConstraints,
  SignalSpecs,
  SignalDefinition
} from './types';

import { SystemeSecuriteRenforcee } from './security.types';

interface SystemeControleEthique {
  validateSignal: (signal: SignalDefinition) => Promise<void>;
  validateAdaptation: (adaptation: Adaptation) => Promise<void>;
  getValidationStatus: () => Promise<boolean>;
}

export class EvacuationSignalSystem {
  private readonly EVACUATION_SIGNALS = {
    ALARM_SIGNALS: {
      IMMEDIATE_DANGER: {
        PRIMARY_PATTERN: {
          type: 'immediate_danger',
          components: {
            manual: {
              handshape: 'OPEN_SPREAD',
              movement: {
                type: 'WIDE_HORIZONTAL',
                speed: 'VERY_FAST',
                repetitions: 3,
                amplitude: 'MAXIMUM'
              },
              orientation: 'PALM_FRONT',
              location: 'HIGH_VISIBLE'
            },
            nonManual: {
              facial: {
                eyebrows: 'RAISED_MAXIMUM',
                eyes: 'WIDE_INTENSE',
                mouth: 'OPEN_TENSE'
              },
              head: {
                type: 'FORWARD_THRUST',
                intensity: 'STRONG',
                repetition: 'SINGLE'
              },
              body: {
                stance: 'ALERT_UPRIGHT',
                tension: 'HIGH',
                orientation: 'FRONT'
              }
            }
          },
          timing: {
            duration: 1500,
            pauseBetween: 300,
            completionMarker: 'HOLD_FINAL'
          }
        }
      },
      EVACUATION_COMMANDS: {
        DIRECTIONAL: {
          type: 'directional_command',
          components: {
            manual: {
              handshape: 'POINTING',
              movement: {
                type: 'CLEAR_LINE',
                speed: 'MODERATE',
                repetitions: 2,
                amplitude: 'FULL'
              },
              orientation: 'PATH_ALIGNED',
              location: 'SPACE_CENTERED'
            },
            nonManual: {
              facial: {
                eyebrows: 'RAISED',
                eyes: 'WIDE',
                mouth: 'NEUTRAL'
              },
              head: {
                type: 'PATH_FOLLOWING',
                intensity: 'MEDIUM',
                repetition: 'CONTINUOUS'
              },
              body: {
                stance: 'UPRIGHT',
                tension: 'MEDIUM',
                orientation: 'PATH_ALIGNED'
              }
            }
          },
          timing: {
            duration: 2000,
            pauseBetween: 500,
            completionMarker: 'SMOOTH_END'
          }
        }
      }
    }
  };

  constructor(
    private readonly ethicsSystem: SystemeControleEthique,
    private readonly securitySystem: SystemeSecuriteRenforcee
  ) { }

  async generateEvacuationSignal(
    situation: EvacuationSituation,
    context: SignalContext
  ): Promise<EvacuationSignal> {
    // Validation éthique et sécurité
    const securityStatus = await this.securitySystem.getSecurityStatus();
    if (securityStatus.level < 2) {
      throw new Error('Security level insufficient for evacuation signal generation');
    }

    const analysis = await this.analyzeSignalRequirements(situation, context);
    const selectedSignals = await this.selectAppropriateSignals(analysis, context);
    const adaptedSignals = await this.adaptSignalsToContext(selectedSignals, context);

    // Validation des signaux
    await this.validateSignals(adaptedSignals, context);

    return {
      signals: adaptedSignals,
      metadata: {
        urgency_level: situation.urgency,
        context_adaptations: adaptedSignals.adaptations,
        effectiveness_metrics: await this.calculateEffectiveness(adaptedSignals)
      }
    };
  }

  private async analyzeSignalRequirements(
    situation: EvacuationSituation,
    context: SignalContext
  ): Promise<SignalRequirements> {
    const urgencyLevel = await this.determineUrgencyLevel(situation);
    const contextualConstraints = await this.evaluateContextualConstraints(context);

    return {
      urgency: urgencyLevel,
      constraints: contextualConstraints,
      requirements: await this.deriveSignalSpecs(urgencyLevel, contextualConstraints)
    };
  }

  private async selectAppropriateSignals(
    analysis: SignalRequirements,
    context: SignalContext
  ): Promise<SelectedSignals> {
    const primarySignal = this.getPrimarySignal(analysis.urgency);
    await this.ethicsSystem.validateSignal(primarySignal);

    const secondarySignals = await this.getSecondarySignals(context);

    return {
      primary: primarySignal,
      secondary: secondarySignals
    };
  }

  private getPrimarySignal(urgencyLevel: number): SignalDefinition {
    if (urgencyLevel >= 8) {
      return this.EVACUATION_SIGNALS.ALARM_SIGNALS.IMMEDIATE_DANGER.PRIMARY_PATTERN;
    } else {
      return this.EVACUATION_SIGNALS.ALARM_SIGNALS.EVACUATION_COMMANDS.DIRECTIONAL;
    }
  }

  private async getSecondarySignals(context: SignalContext): Promise<SignalDefinition[]> {
    const signals: SignalDefinition[] = [];

    if (context.population.demographics.mobilityImpaired > 0) {
      const mobilitySignal = this.EVACUATION_SIGNALS.ALARM_SIGNALS.EVACUATION_COMMANDS.DIRECTIONAL;
      await this.ethicsSystem.validateSignal(mobilitySignal);
      signals.push(mobilitySignal);
    }

    return signals;
  }

  private async adaptSignalsToContext(
    signals: SelectedSignals,
    context: SignalContext
  ): Promise<AdaptedSignals> {
    const adaptations = await this.generateAdaptations(signals, context);
    return {
      ...signals,
      adaptations
    };
  }

  private async generateAdaptations(signals: SelectedSignals, context: SignalContext): Promise<Adaptation[]> {
    const adaptations: Adaptation[] = [];

    // Adaptations basées sur les conditions environnementales
    if (context.environment.conditions.visibility === 'low') {
      const adaptation: Adaptation = {
        type: 'visibility_enhancement',
        parameters: {
          contrast: 'maximum',
          size: 'increased'
        },
        priority: 1
      };
      await this.ethicsSystem.validateAdaptation(adaptation);
      adaptations.push(adaptation);
    }

    // Adaptations basées sur le signal primaire
    if (signals.primary.type === 'immediate_danger') {
      const adaptation: Adaptation = {
        type: 'intensity_enhancement',
        parameters: {
          intensity: 'maximum',
          repetition: 'increased'
        },
        priority: 2
      };
      await this.ethicsSystem.validateAdaptation(adaptation);
      adaptations.push(adaptation);
    }

    return adaptations;
  }

  private async validateSignals(
    signals: AdaptedSignals,
    context: SignalContext
  ): Promise<ValidationResult> {
    const validationIssues: string[] = [];
    let validationScore = 100;

    if (!await this.ethicsSystem.getValidationStatus()) {
      validationIssues.push('Ethics validation failed');
      validationScore -= 50;
    }

    if (signals.adaptations.length === 0 && context.constraints.minimumSize > 0) {
      validationIssues.push('No adaptations applied despite constraints');
      validationScore -= 15;
    }

    return {
      isValid: validationIssues.length === 0,
      issues: validationIssues,
      score: validationScore
    };
  }

  private async calculateEffectiveness(signals: AdaptedSignals): Promise<EffectivenessMetrics> {
    return {
      visibility: this.calculateVisibilityScore(signals),
      comprehension: this.calculateComprehensionScore(signals),
      responsiveness: this.calculateResponsivenessScore(signals)
    };
  }

  private calculateVisibilityScore(signals: AdaptedSignals): number {
    const baseScore = 0.8;
    const visibilityBonus = signals.adaptations.some(a => a.type === 'visibility_enhancement') ? 0.15 : 0;
    return Math.min(baseScore + visibilityBonus, 1);
  }

  private calculateComprehensionScore(signals: AdaptedSignals): number {
    const baseScore = 0.85;
    const adaptationPenalty = signals.adaptations.length > 2 ? 0.1 : 0;
    return Math.max(baseScore - adaptationPenalty, 0);
  }

  private calculateResponsivenessScore(signals: AdaptedSignals): number {
    const baseScore = 0.9;

    // Augmenter la réactivité si des adaptations d'intensité sont appliquées
    const intensityBonus = signals.adaptations.some(a => a.type === 'intensity_enhancement') ? 0.05 : 0;

    // Diminuer légèrement la réactivité si trop d'adaptations sont présentes (surcharge cognitive)
    const adaptationPenalty = signals.adaptations.length > 3 ? 0.1 : 0;

    // Bonus pour les signaux directionnels qui sont généralement plus faciles à suivre
    const directionalBonus = signals.primary.type === 'directional_command' ? 0.05 : 0;

    // Calculer le score final avec les ajustements
    return Math.min(Math.max(baseScore + intensityBonus + directionalBonus - adaptationPenalty, 0.5), 1.0);
  }

  private async determineUrgencyLevel(situation: EvacuationSituation): Promise<number> {
    return situation.urgency;
  }

  private async evaluateContextualConstraints(context: SignalContext): Promise<ContextualConstraints> {
    return {
      spatialLimitations: this.deriveSpatialLimitations(context),
      timeConstraints: {
        maxDuration: context.constraints.minimumSize * 1000,
        responseWindow: 30000
      },
      environmentalFactors: [context.environment.type]
    };
  }

  private deriveSpatialLimitations(context: SignalContext): string[] {
    const limitations: string[] = [];

    if (context.environment.conditions.obstacles.length > 0) {
      limitations.push('restricted_movement_space');
    }

    if (context.environment.conditions.visibility === 'low') {
      limitations.push('reduced_visibility_zone');
    }

    return limitations;
  }

  private async deriveSignalSpecs(
    urgencyLevel: number,
    constraints: ContextualConstraints
  ): Promise<SignalSpecs> {
    return {
      intensity: Math.min(urgencyLevel * 10, 100),
      duration: constraints.timeConstraints.maxDuration,
      repetition: Math.ceil(urgencyLevel / 2),
      spacing: 1000
    };
  }
}