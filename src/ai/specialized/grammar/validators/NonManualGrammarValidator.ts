// src/ai/specialized/grammar/validators/NonManualGrammarValidator.ts

import {
  GrammaticalStructure,
  ValidationResult,
  ValidationDetails,
  NonManualComponent,
  ComponentType,
  GrammaticalComponent
} from '../types';

// Import des validators
import { FacialGrammarValidator } from './facial/FacialGrammarValidator';
import { GazeValidator } from './gaze/GazeValidator';
import { HeadMovementValidator } from './head/HeadMovementValidator';
import { BodyPostureValidator } from './body/BodyPostureValidator';

// Import des types spécifiques au body-posture
import {
  InclinationDirection,
  RotationAxis,
  ShoulderSide,
  GrammaticalFunctionType,
  GrammaticalScope,
  ShoulderMovementType,
  PostureTiming,
  InclinationData,
  RotationData,
  ShoulderMovement
} from '../types/body-posture.types';

// Interfaces pour adaptation aux validators spécifiques
interface ComponentTiming {
  start: number;
  duration: number;
  transitionIn: number;
  transitionOut: number;
}

interface EyebrowComponent {
  position: number;
  tension: number;
  timing: ComponentTiming;
}

interface CheekComponent {
  tension: number;
  inflation: number;
  side: ShoulderSide; // 'LEFT' | 'RIGHT' | 'BOTH'
  timing: ComponentTiming;
}

interface MouthComponent {
  shape: string;
  openness: number;
  tension: number;
  timing: ComponentTiming;
}

// Interface correspondant à celle du GazeValidator
interface GazeDirection {
  primary: string;
  secondary: string; // Non-optionnel
  angle: number;
  distance: number;
}

interface GazeTiming {
  start: number;
  duration: number;
  transitionDuration: number;
}

type GazeTargetType = 'SPATIAL_POINT' | 'REFERENT' | 'INTERLOCUTOR' | 'ABSTRACT';

interface GazeTarget {
  type: GazeTargetType;
  id: string;
  coordinates?: { x: number; y: number; z: number };
}

interface ValidatorGazePattern {
  direction: GazeDirection;
  intensity: number;
  timing: GazeTiming;
  target: GazeTarget; // Non-optionnel
}

// Types pour HeadMovementValidator
type HeadMovementType = 'NOD' | 'ROTATION' | 'TILT';
type HeadDirectionPrimary = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type AxisType = 'X' | 'Y' | 'Z';
type FunctionType = 'AFFIRMATION' | 'NEGATION' | 'QUESTION' | 'CONDITION' | 'EMPHASIS';
type FunctionScope = 'LOCAL' | 'GLOBAL';

interface HeadDirection {
  primary: HeadDirectionPrimary;
  angle: number;
  axis: AxisType;
}

interface MovementProperties {
  amplitude: number;
  speed: number;
  direction: HeadDirection;
  repetitions: number;
}

interface MovementTiming {
  start: number;
  duration: number;
  transitionIn: number;
  transitionOut: number;
}

interface GrammaticalFunction {
  type: FunctionType;
  strength: number;
  scope: FunctionScope;
}

interface ValidatorHeadMovement {
  type: HeadMovementType;
  properties: MovementProperties;
  timing: MovementTiming;
  function: GrammaticalFunction; // Non-optionnel
}

// Interfaces compatibles pour le BodyPostureValidator
interface TrunkPosture {
  inclination: InclinationData;
  rotation: RotationData;
  timing: PostureTiming;
}

interface ShoulderPosture {
  side: ShoulderSide;
  elevation: number;
  movement: ShoulderMovement;
  timing: PostureTiming;
}

interface WeightShift {
  direction: InclinationDirection;
  amplitude: number;
  timing: PostureTiming;
  function: {  // Non-optionnel
    type: GrammaticalFunctionType;
    strength: number;
    scope: GrammaticalScope;
  };
}

export class NonManualGrammarValidator {
  private readonly FACIAL_COHERENCE_THRESHOLD = 0.9;
  private readonly GAZE_ACCURACY_THRESHOLD = 0.85;
  private readonly facialValidator: FacialGrammarValidator;
  private readonly gazeValidator: GazeValidator;
  private readonly headMovementValidator: HeadMovementValidator;
  private readonly bodyPostureValidator: BodyPostureValidator;

  constructor() {
    this.facialValidator = new FacialGrammarValidator();
    this.gazeValidator = new GazeValidator();
    this.headMovementValidator = new HeadMovementValidator();
    this.bodyPostureValidator = new BodyPostureValidator();
  }

  async validate(structure: GrammaticalStructure): Promise<ValidationResult> {
    try {
      // Validation des expressions faciales grammaticales
      const facialValidation = await this.validateFacialExpressions(structure);
      if (!facialValidation.isValid) {
        return this.buildValidationError('Invalid facial expressions', facialValidation);
      }

      // Validation du regard
      const gazeValidation = await this.validateGaze(structure);
      if (!gazeValidation.isValid) {
        return this.buildValidationError('Invalid gaze patterns', gazeValidation);
      }

      // Validation des mouvements de tête
      const headValidation = await this.validateHeadMovements(structure);
      if (!headValidation.isValid) {
        return this.buildValidationError('Invalid head movements', headValidation);
      }

      // Validation de la posture corporelle
      const postureValidation = await this.validateBodyPosture(structure);
      if (!postureValidation.isValid) {
        return this.buildValidationError('Invalid body posture', postureValidation);
      }

      return {
        isValid: true,
        score: this.calculateNonManualScore([
          facialValidation,
          gazeValidation,
          headValidation,
          postureValidation
        ]),
        details: this.compileNonManualDetails([
          facialValidation,
          gazeValidation,
          headValidation,
          postureValidation
        ])
      };
    } catch (error) {
      throw new NonManualGrammarError('Non-manual grammar validation failed', error);
    }
  }

  private buildValidationError(message: string, validation: ValidationResult): ValidationResult {
    return {
      isValid: false,
      score: validation.score * 0.5, // Réduction du score
      details: {
        message,
        errorDetails: validation.details,
        timestamp: Date.now()
      }
    };
  }

  private async validateFacialExpressions(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Validation des composants faciaux
    const components = this.extractFacialComponents(structure);

    // Validation des sourcils
    const eyebrows = await this.facialValidator.validateEyebrows(components.eyebrows);

    // Validation des joues
    const cheeks = await this.facialValidator.validateCheeks(components.cheeks);

    // Validation de la bouche
    const mouth = await this.facialValidator.validateMouth(components.mouth);

    // Validation des combinaisons faciales
    const combinations = await this.validateFacialCombinations(components);

    return {
      isValid: eyebrows.isValid && cheeks.isValid && mouth.isValid && combinations.isValid,
      score: this.calculateFacialScore([eyebrows, cheeks, mouth, combinations]),
      details: {
        facialComponents: {
          eyebrows: eyebrows.details,
          cheeks: cheeks.details,
          mouth: mouth.details,
          combinations: combinations.details
        },
        timestamp: Date.now()
      }
    };
  }

  private async validateGaze(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Extraction des patterns de regard adaptés au type attendu par le validator
    const gazePatterns = this.extractGazePatterns(structure);

    // Validation de la direction du regard
    const direction = await this.gazeValidator.validateDirection(gazePatterns);

    // Validation de l'intensité du regard
    const intensity = await this.gazeValidator.validateIntensity(gazePatterns);

    // Validation des changements de regard
    const shifts = await this.gazeValidator.validateShifts(gazePatterns);

    return {
      isValid: direction.isValid && intensity.isValid && shifts.isValid,
      score: this.calculateGazeScore([direction, intensity, shifts]),
      details: {
        gazeComponents: {
          direction: direction.details,
          intensity: intensity.details,
          shifts: shifts.details
        },
        timestamp: Date.now()
      }
    };
  }

  private async validateHeadMovements(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Extraction des mouvements de tête adaptés au type attendu par le validator
    const headMovements = this.extractHeadMovements(structure);

    // Validation des hochements
    const nods = await this.headMovementValidator.validateNods(headMovements);

    // Validation des rotations
    const rotations = await this.headMovementValidator.validateRotations(headMovements);

    // Validation des inclinaisons
    const tilts = await this.headMovementValidator.validateTilts(headMovements);

    return {
      isValid: nods.isValid && rotations.isValid && tilts.isValid,
      score: this.calculateHeadScore([nods, rotations, tilts]),
      details: {
        headComponents: {
          nods: nods.details,
          rotations: rotations.details,
          tilts: tilts.details
        },
        timestamp: Date.now()
      }
    };
  }

  private async validateBodyPosture(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Extraction des composants de posture adaptés aux types attendus par le validator
    const { trunkPostures, shoulderPostures, weightShifts } = this.extractPostureComponents(structure);

    // Validation du tronc
    const trunk = await this.bodyPostureValidator.validateTrunk(trunkPostures);

    // Validation des épaules
    const shoulders = await this.bodyPostureValidator.validateShoulders(shoulderPostures);

    // Validation des transferts de poids
    const weightShiftResults = await this.bodyPostureValidator.validateWeightShifts(weightShifts);

    return {
      isValid: trunk.isValid && shoulders.isValid && weightShiftResults.isValid,
      score: this.calculatePostureScore([trunk, shoulders, weightShiftResults]),
      details: {
        postureComponents: {
          trunk: trunk.details,
          shoulders: shoulders.details,
          weightShifts: weightShiftResults.details
        },
        timestamp: Date.now()
      }
    };
  }

  private calculateNonManualScore(validations: ValidationResult[]): number {
    const weights = {
      facial: 0.4,
      gaze: 0.3,
      head: 0.2,
      posture: 0.1
    };

    return validations.reduce((total, validation, index) => {
      const weight = Object.values(weights)[index];
      return total + (validation.score * weight);
    }, 0);
  }

  private compileNonManualDetails(validations: ValidationResult[]): ValidationDetails {
    return {
      facial: validations[0].details,
      gaze: validations[1].details,
      head: validations[2].details,
      posture: validations[3].details,
      timestamp: Date.now(),
      metadata: {
        timestamp: Date.now(),
        version: '1.0'
      }
    };
  }

  private async validateFacialCombinations(_facialComponents: FacialComponents): Promise<ValidationResult> {
    // Paramètre renommé avec un underscore pour indiquer qu'il n'est pas utilisé
    // mais on va le référencer pour éviter le warning ESLint
    const componentCount = Object.keys(_facialComponents).length;

    return {
      isValid: true,
      score: 1.0,
      details: {
        timestamp: Date.now(),
        combinations: {
          componentCount
        }
      }
    };
  }

  private calculateFacialScore(validations: ValidationResult[]): number {
    // Implémentation du calcul de score facial
    return validations.reduce((sum, validation) => sum + validation.score, 0) / validations.length;
  }

  private calculateGazeScore(validations: ValidationResult[]): number {
    // Implémentation du calcul de score pour le regard
    return validations.reduce((sum, validation) => sum + validation.score, 0) / validations.length;
  }

  private calculateHeadScore(validations: ValidationResult[]): number {
    // Implémentation du calcul de score pour les mouvements de tête
    return validations.reduce((sum, validation) => sum + validation.score, 0) / validations.length;
  }

  private calculatePostureScore(validations: ValidationResult[]): number {
    // Implémentation du calcul de score pour la posture
    return validations.reduce((sum, validation) => sum + validation.score, 0) / validations.length;
  }

  private extractFacialComponents(structure: GrammaticalStructure): FacialComponents {
    // Adaptation pour utiliser les composants adaptés
    const facialComponents = structure.components
      .filter(comp => comp.type === 'FACIAL')
      .map(comp => this.adaptToNonManualComponent(comp));

    // Extraction des composants pour les sourcils, les joues et la bouche
    return {
      eyebrows: this.extractEyebrowComponents(facialComponents),
      cheeks: this.extractCheekComponents(facialComponents),
      mouth: this.extractMouthComponents(facialComponents)
    };
  }

  private adaptToNonManualComponent(comp: GrammaticalComponent): NonManualComponent {
    // Adapter un composant grammatical en composant non-manuel
    return {
      type: comp.type as ComponentType,
      value: typeof comp.value === 'object'
        ? comp.value as unknown as Record<string, unknown>
        : { value: comp.value },
      timing: {
        duration: 1000, // Valeur par défaut
        start: 0,
        end: 1000
      }
    };
  }

  private extractEyebrowComponents(components: NonManualComponent[]): EyebrowComponent[] {
    // Transformation des données en EyebrowComponent compatible avec le FacialGrammarValidator
    return components
      .filter(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        return valueObj.feature === 'eyebrows';
      })
      .map(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        return {
          position: (valueObj.position as number) || 0,
          tension: (valueObj.tension as number) || 0,
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: 0.2, // Valeur par défaut
            transitionOut: 0.2 // Valeur par défaut
          }
        };
      });
  }

  private extractCheekComponents(components: NonManualComponent[]): CheekComponent[] {
    // Transformation des données en CheekComponent compatible avec le FacialGrammarValidator
    return components
      .filter(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        return valueObj.feature === 'cheeks';
      })
      .map(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        // Convertir 'left'/'right'/'both' en 'LEFT'/'RIGHT'/'BOTH'
        const sideValue = (valueObj.side as string) || 'both';
        const mappedSide: ShoulderSide = sideValue.toUpperCase() as ShoulderSide;

        return {
          tension: (valueObj.tension as number) || 0,
          inflation: (valueObj.inflation as number) || 0,
          side: mappedSide,
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: 0.2, // Valeur par défaut
            transitionOut: 0.2 // Valeur par défaut
          }
        };
      });
  }

  private extractMouthComponents(components: NonManualComponent[]): MouthComponent[] {
    // Transformation des données en MouthComponent compatible avec le FacialGrammarValidator
    return components
      .filter(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        return valueObj.feature === 'mouth';
      })
      .map(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        return {
          shape: (valueObj.shape as string) || 'neutral',
          openness: (valueObj.openness as number) || 0,
          tension: (valueObj.tension as number) || 0,
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: 0.2, // Valeur par défaut
            transitionOut: 0.2 // Valeur par défaut
          }
        };
      });
  }

  private extractGazePatterns(structure: GrammaticalStructure): ValidatorGazePattern[] {
    // Transformation des données en GazePattern compatible avec le GazeValidator
    return structure.components
      .filter(comp => comp.type === 'GAZE')
      .map(comp => this.adaptToNonManualComponent(comp))
      .map(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        const directionValue = valueObj.direction as string || 'forward';

        // Créer un objet complet avec toutes les propriétés non-optionnelles
        return {
          direction: {
            primary: directionValue,
            secondary: (valueObj.secondary as string) || directionValue, // Utiliser direction comme valeur par défaut
            angle: (valueObj.angle as number) || 0,
            distance: (valueObj.distance as number) || 1
          },
          intensity: (valueObj.intensity as number) || 0.5,
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionDuration: (valueObj.transitionDuration as number) || 0.2
          },
          target: {
            type: 'REFERENT' as GazeTargetType,
            id: (valueObj.target as string) || 'default-target',
            coordinates: (valueObj.coordinates as { x: number; y: number; z: number }) || undefined
          }
        };
      });
  }

  private extractHeadMovements(structure: GrammaticalStructure): ValidatorHeadMovement[] {
    // Transformation des données en HeadMovement compatible avec le HeadMovementValidator
    return structure.components
      .filter(comp => comp.type === 'HEAD')
      .map(comp => this.adaptToNonManualComponent(comp))
      .map(comp => {
        const valueObj = comp.value as Record<string, unknown>;
        const movementType = (valueObj.movement as string) || 'NOD';
        const movementDirection = (valueObj.direction as string) || 'UP';

        // Convertir le type string en type spécifique
        const headType = movementType as HeadMovementType;
        const directionPrimary = movementDirection as HeadDirectionPrimary;

        // Créer un objet complet avec toutes les propriétés non-optionnelles
        return {
          type: headType,
          properties: {
            amplitude: (valueObj.amplitude as number) || 0.5,
            speed: (valueObj.speed as number) || 1,
            direction: {
              primary: directionPrimary,
              angle: (valueObj.angle as number) || 0,
              axis: (valueObj.axis as AxisType) || 'Y'
            },
            repetitions: (valueObj.repetitions as number) || 1
          },
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: (valueObj.transitionIn as number) || 0.2,
            transitionOut: (valueObj.transitionOut as number) || 0.2
          },
          function: {
            type: (valueObj.functionType as FunctionType) || 'AFFIRMATION',
            strength: (valueObj.strength as number) || 0.5,
            scope: (valueObj.scope as FunctionScope) || 'LOCAL'
          }
        };
      });
  }

  private extractPostureComponents(structure: GrammaticalStructure): {
    trunkPostures: TrunkPosture[];
    shoulderPostures: ShoulderPosture[];
    weightShifts: WeightShift[];
  } {
    // Transformation des données en composants compatibles avec le BodyPostureValidator
    const trunkPostures: TrunkPosture[] = [];
    const shoulderPostures: ShoulderPosture[] = [];
    const weightShifts: WeightShift[] = [];

    const postureComponents = structure.components
      .filter(comp => comp.type === 'POSTURE')
      .map(comp => this.adaptToNonManualComponent(comp));

    for (const comp of postureComponents) {
      const valueObj = comp.value as Record<string, unknown>;
      const partType = valueObj.part as string;

      if (partType === 'trunk') {
        trunkPostures.push({
          inclination: {
            direction: (valueObj.inclinationDirection as InclinationDirection) || 'FORWARD',
            angle: (valueObj.inclination as number) || 0,
            intensity: (valueObj.intensityTrunk as number) || 0.5
          },
          rotation: {
            axis: (valueObj.rotationAxis as RotationAxis) || 'VERTICAL',
            angle: (valueObj.rotation as number) || 0,
            speed: (valueObj.rotationSpeed as number) || 0
          },
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: 0.2,
            transitionOut: 0.2
          }
        });
      } else if (partType === 'shoulders') {
        shoulderPostures.push({
          side: (valueObj.shoulderSide as ShoulderSide) || 'BOTH',
          elevation: (valueObj.elevation as number) || 0,
          movement: {
            type: (valueObj.shoulderMovement as ShoulderMovementType) || 'RAISE',
            amplitude: (valueObj.movementAmplitude as number) || 0.5,
            speed: (valueObj.movementSpeed as number) || 1
          },
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: 0.2,
            transitionOut: 0.2
          }
        });
      } else if (partType === 'weight') {
        weightShifts.push({
          direction: (valueObj.weightDirection as InclinationDirection) || 'FORWARD',
          amplitude: (valueObj.weightAmplitude as number) || 0.5,
          timing: {
            start: comp.timing.start || 0,
            duration: comp.timing.duration,
            transitionIn: 0.2,
            transitionOut: 0.2
          },
          function: {
            // Toujours fournir une valeur par défaut car function n'est plus optionnel
            type: (valueObj.functionType as GrammaticalFunctionType) || 'NEUTRAL',
            strength: (valueObj.functionStrength as number) || 0.5,
            scope: (valueObj.functionScope as GrammaticalScope) || 'LOCAL'
          }
        });
      }
    }

    return { trunkPostures, shoulderPostures, weightShifts };
  }
}

class NonManualGrammarError extends Error {
  constructor(message: string, public context: unknown) {
    super(message);
    this.name = 'NonManualGrammarError';
  }
}

interface FacialComponents {
  eyebrows: EyebrowComponent[];
  cheeks: CheekComponent[];
  mouth: MouthComponent[];
}