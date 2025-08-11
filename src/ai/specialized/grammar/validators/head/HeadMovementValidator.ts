// src/ai/specialized/grammar/validators/head/HeadMovementValidator.ts

import { ValidationResult, GrammaticalContext } from '../../types';

export class HeadMovementValidator {
  private readonly NOD_PRECISION_THRESHOLD = 0.9;
  private readonly ROTATION_PRECISION_THRESHOLD = 0.85;
  private readonly TILT_PRECISION_THRESHOLD = 0.9;

  async validateNods(
    movements: HeadMovement[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation de l'amplitude des hochements
      const amplitudeValidation = await this.validateNodAmplitude(movements);
      if (!amplitudeValidation.isValid) {
        return this.buildValidationError('Invalid nod amplitude', amplitudeValidation);
      }

      // Validation du rythme des hochements
      const rhythmValidation = await this.validateNodRhythm(movements);
      if (!rhythmValidation.isValid) {
        return this.buildValidationError('Invalid nod rhythm', rhythmValidation);
      }

      // Validation de la fonction grammaticale
      if (context) {
        const functionValidation = await this.validateNodFunction(movements, context);
        if (!functionValidation.isValid) {
          return this.buildValidationError('Invalid nod grammatical function', functionValidation);
        }
      }

      return {
        isValid: true,
        score: this.calculateNodScore([
          amplitudeValidation,
          rhythmValidation,
          functionValidation
        ]),
        details: this.compileNodDetails([
          amplitudeValidation,
          rhythmValidation,
          functionValidation
        ])
      };
    } catch (error) {
      throw new HeadMovementError('Head nod validation failed', error);
    }
  }

  async validateRotations(
    movements: HeadMovement[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation de l'angle de rotation
      const angleValidation = await this.validateRotationAngle(movements);
      if (!angleValidation.isValid) {
        return this.buildValidationError('Invalid rotation angle', angleValidation);
      }

      // Validation de la vitesse de rotation
      const speedValidation = await this.validateRotationSpeed(movements);
      if (!speedValidation.isValid) {
        return this.buildValidationError('Invalid rotation speed', speedValidation);
      }

      // Validation de la séquence de rotation
      const sequenceValidation = await this.validateRotationSequence(movements);
      if (!sequenceValidation.isValid) {
        return this.buildValidationError('Invalid rotation sequence', sequenceValidation);
      }

      return {
        isValid: true,
        score: this.calculateRotationScore([
          angleValidation,
          speedValidation,
          sequenceValidation
        ]),
        details: this.compileRotationDetails([
          angleValidation,
          speedValidation,
          sequenceValidation
        ])
      };
    } catch (error) {
      throw new HeadMovementError('Head rotation validation failed', error);
    }
  }

  async validateTilts(
    movements: HeadMovement[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation de l'angle d'inclinaison
      const angleValidation = await this.validateTiltAngle(movements);
      if (!angleValidation.isValid) {
        return this.buildValidationError('Invalid tilt angle', angleValidation);
      }

      // Validation de la durée d'inclinaison
      const durationValidation = await this.validateTiltDuration(movements);
      if (!durationValidation.isValid) {
        return this.buildValidationError('Invalid tilt duration', durationValidation);
      }

      // Validation du rôle grammatical
      const roleValidation = await this.validateTiltRole(movements, context);
      if (!roleValidation.isValid) {
        return this.buildValidationError('Invalid tilt grammatical role', roleValidation);
      }

      return {
        isValid: true,
        score: this.calculateTiltScore([
          angleValidation,
          durationValidation,
          roleValidation
        ]),
        details: this.compileTiltDetails([
          angleValidation,
          durationValidation,
          roleValidation
        ])
      };
    } catch (error) {
      throw new HeadMovementError('Head tilt validation failed', error);
    }
  }

  private async validateNodAmplitude(
    movements: HeadMovement[]
  ): Promise<ValidationResult> {
    // Vérification de l'amplitude des hochements selon les règles LSF
    const amplitudes = movements.map(m => this.extractNodAmplitude(m));
    const rules = await this.getNodAmplitudeRules();
    
    return this.validateAgainstAmplitudeRules(amplitudes, rules);
  }

  private async validateNodFunction(
    movements: HeadMovement[],
    context: GrammaticalContext
  ): Promise<ValidationResult> {
    // Vérification de la fonction grammaticale des hochements
    const functions = await this.extractNodFunctions(movements);
    const rules = await this.getGrammaticalFunctionRules(context);
    
    return this.validateAgainstFunctionRules(functions, rules);
  }

  private async validateRotationSequence(
    movements: HeadMovement[]
  ): Promise<ValidationResult> {
    // Vérification de la séquence de rotation
    const sequence = this.extractRotationSequence(movements);
    const rules = await this.getRotationSequenceRules();

    return this.validateAgainstSequenceRules(sequence, rules);
  }

  private async validateTiltRole(
    movements: HeadMovement[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    // Vérification du rôle grammatical des inclinaisons
    const roles = await this.extractTiltRoles(movements);
    const rules = context 
      ? await this.getContextualTiltRules(context)
      : await this.getDefaultTiltRules();

    return this.validateAgainstRoleRules(roles, rules);
  }

  private calculateNodScore(validations: ValidationResult[]): number {
    const weights = { amplitude: 0.4, rhythm: 0.3, function: 0.3 };
    return this.calculateWeightedScore(validations, weights);
  }
}

class HeadMovementError extends Error {
  constructor(message: string, public context: any) {
    super(message);
    this.name = 'HeadMovementError';
  }
}

interface HeadMovement {
  type: 'NOD' | 'ROTATION' | 'TILT';
  properties: MovementProperties;
  timing: MovementTiming;
  function?: GrammaticalFunction;
}

interface MovementProperties {
  amplitude: number;
  speed: number;
  direction: MovementDirection;
  repetitions?: number;
}

interface MovementTiming {
  start: number;
  duration: number;
  transitionIn: number;
  transitionOut: number;
}

interface MovementDirection {
  primary: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  angle?: number;
  axis?: 'X' | 'Y' | 'Z';
}

interface GrammaticalFunction {
  type: 'AFFIRMATION' | 'NEGATION' | 'QUESTION' | 'CONDITION' | 'EMPHASIS';
  strength: number;
  scope: 'LOCAL' | 'GLOBAL';
}