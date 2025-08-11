// src/ai/specialized/grammar/validators/gaze/GazeValidator.ts

import { ValidationResult, GrammaticalContext } from '../../types';

export class GazeValidator {
  private readonly DIRECTION_PRECISION_THRESHOLD = 0.9;
  private readonly INTENSITY_PRECISION_THRESHOLD = 0.85;
  private readonly SHIFT_TIMING_THRESHOLD = 0.95;

  async validateDirection(
    patterns: GazePattern[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation de la direction primaire
      const primaryDirection = await this.validatePrimaryDirection(patterns);
      if (!primaryDirection.isValid) {
        return this.buildValidationError('Invalid primary gaze direction', primaryDirection);
      }

      // Validation des changements de direction
      const directionChanges = await this.validateDirectionChanges(patterns);
      if (!directionChanges.isValid) {
        return this.buildValidationError('Invalid gaze direction changes', directionChanges);
      }

      // Validation de la cohérence spatiale
      const spatialCoherence = await this.validateSpatialCoherence(patterns);
      if (!spatialCoherence.isValid) {
        return this.buildValidationError('Invalid gaze spatial coherence', spatialCoherence);
      }

      // Validation du contexte grammatical
      if (context) {
        const contextualDirection = await this.validateDirectionContext(patterns, context);
        if (!contextualDirection.isValid) {
          return this.buildValidationError('Invalid gaze direction context', contextualDirection);
        }
      }

      return {
        isValid: true,
        score: this.calculateDirectionScore([
          primaryDirection,
          directionChanges,
          spatialCoherence
        ]),
        details: this.compileDirectionDetails([
          primaryDirection,
          directionChanges,
          spatialCoherence
        ])
      };
    } catch (error) {
      throw new GazeValidationError('Gaze direction validation failed', error);
    }
  }

  async validateIntensity(
    patterns: GazePattern[]
  ): Promise<ValidationResult> {
    try {
      // Validation du niveau d'intensité
      const intensityLevel = await this.validateIntensityLevel(patterns);
      if (!intensityLevel.isValid) {
        return this.buildValidationError('Invalid gaze intensity level', intensityLevel);
      }

      // Validation des variations d'intensité
      const intensityVariation = await this.validateIntensityVariation(patterns);
      if (!intensityVariation.isValid) {
        return this.buildValidationError('Invalid gaze intensity variation', intensityVariation);
      }

      // Validation de la durée d'intensité
      const intensityDuration = await this.validateIntensityDuration(patterns);
      if (!intensityDuration.isValid) {
        return this.buildValidationError('Invalid gaze intensity duration', intensityDuration);
      }

      return {
        isValid: true,
        score: this.calculateIntensityScore([
          intensityLevel,
          intensityVariation,
          intensityDuration
        ]),
        details: this.compileIntensityDetails([
          intensityLevel,
          intensityVariation,
          intensityDuration
        ])
      };
    } catch (error) {
      throw new GazeValidationError('Gaze intensity validation failed', error);
    }
  }

  async validateShifts(
    patterns: GazePattern[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation du timing des changements
      const shiftTiming = await this.validateShiftTiming(patterns);
      if (!shiftTiming.isValid) {
        return this.buildValidationError('Invalid gaze shift timing', shiftTiming);
      }

      // Validation de la fluidité des transitions
      const shiftFluidity = await this.validateShiftFluidity(patterns);
      if (!shiftFluidity.isValid) {
        return this.buildValidationError('Invalid gaze shift fluidity', shiftFluidity);
      }

      // Validation de la motivation grammaticale
      const shiftMotivation = await this.validateShiftMotivation(patterns, context);
      if (!shiftMotivation.isValid) {
        return this.buildValidationError('Invalid gaze shift motivation', shiftMotivation);
      }

      return {
        isValid: true,
        score: this.calculateShiftScore([
          shiftTiming,
          shiftFluidity,
          shiftMotivation
        ]),
        details: this.compileShiftDetails([
          shiftTiming,
          shiftFluidity,
          shiftMotivation
        ])
      };
    } catch (error) {
      throw new GazeValidationError('Gaze shift validation failed', error);
    }
  }

  private async validatePrimaryDirection(
    patterns: GazePattern[]
  ): Promise<ValidationResult> {
    // Vérification des directions principales selon les règles LSF
    const primaryDirections = await this.extractPrimaryDirections(patterns);
    const directionRules = await this.getDirectionRules();
    
    return this.validateAgainstDirectionRules(primaryDirections, directionRules);
  }

  private async validateSpatialCoherence(
    patterns: GazePattern[]
  ): Promise<ValidationResult> {
    // Vérification de la cohérence avec l'espace de signation
    return {
      isValid: await this.checkSpatialAlignment(patterns) &&
               await this.checkReferenceConsistency(patterns),
      score: await this.calculateSpatialScore(patterns),
      details: await this.compileSpatialDetails(patterns)
    };
  }

  private async validateIntensityLevel(
    patterns: GazePattern[]
  ): Promise<ValidationResult> {
    // Vérification des niveaux d'intensité selon le contexte
    const intensityRules = await this.getIntensityRules();
    
    return this.validateAgainstIntensityRules(patterns, intensityRules);
  }

  private async validateShiftTiming(
    patterns: GazePattern[]
  ): Promise<ValidationResult> {
    // Vérification du timing des changements de regard
    const shifts = await this.extractGazeShifts(patterns);
    const timingRules = await this.getShiftTimingRules();

    return this.validateAgainstTimingRules(shifts, timingRules);
  }
}

class GazeValidationError extends Error {
  constructor(message: string, public context: any) {
    super(message);
    this.name = 'GazeValidationError';
  }
}

interface GazePattern {
  direction: GazeDirection;
  intensity: number;
  timing: GazeTiming;
  target?: GazeTarget;
}

interface GazeDirection {
  primary: string;
  secondary?: string;
  angle: number;
  distance: number;
}

interface GazeTiming {
  start: number;
  duration: number;
  transitionDuration?: number;
}

interface GazeTarget {
  type: 'SPATIAL_POINT' | 'REFERENT' | 'INTERLOCUTOR' | 'ABSTRACT';
  id: string;
  coordinates?: Point3D;
}

interface GazeShift {
  from: GazePattern;
  to: GazePattern;
  duration: number;
  motivation: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}