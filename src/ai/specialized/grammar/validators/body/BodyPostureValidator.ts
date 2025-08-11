// src/ai/specialized/grammar/validators/body/BodyPostureValidator.ts

import {
  ValidationResult,
  ValidationDetails,
  GrammaticalContext
} from '../../types';

import {
  TrunkPosture,
  ShoulderPosture,
  WeightShift,
  InclinationData,
  RotationData,
  RoleTransfer,
  ShoulderMovement,
  SymmetryPattern,
  GrammaticalFunction,
  PostureTiming,
  InclinationRule,
  RotationRule,
  RoleTransferRule,
  ElevationRule,
  MovementRule,
  SymmetryRule,
  AmplitudeRule,
  TimingRule,
  FunctionRule,
  BodyPostureError
} from '../../types/body-posture.types';

import { IBodyPostureValidator } from '../interfaces/IBodyPostureValidator';

/**
 * Validateur de postures corporelles pour la LSF
 * Analyse la conformité des mouvements du tronc, des épaules et des transferts de poids
 * selon les règles grammaticales de la LSF
 */
export class BodyPostureValidator implements IBodyPostureValidator {
  // Seuils de précision pour différentes parties du corps
  private readonly TRUNK_PRECISION_THRESHOLD = 0.85;
  private readonly SHOULDER_PRECISION_THRESHOLD = 0.9;
  private readonly WEIGHT_SHIFT_THRESHOLD = 0.9;

  /**
   * Crée un objet ValidationDetails avec timestamp
   * @param details Détails de validation partiels
   * @returns Détails de validation complets avec timestamp
   */
  private createValidationDetails(details: Partial<ValidationDetails>): ValidationDetails {
    return {
      ...details,
      timestamp: Date.now()
    };
  }

  /**
   * Valide la posture du tronc selon les règles LSF
   * @param posture Tableau de postures du tronc à valider
   * @param context Contexte grammatical optionnel
   * @returns Résultat de validation
   */
  public async validateTrunk(
    posture: TrunkPosture[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation de l'inclinaison du tronc
      const inclinationValidation = await this.validateTrunkInclination(posture);
      if (!inclinationValidation.isValid) {
        return this.createValidationError('Invalid trunk inclination', inclinationValidation);
      }

      // Validation de la rotation du tronc
      const rotationValidation = await this.validateTrunkRotation(posture);
      if (!rotationValidation.isValid) {
        return this.createValidationError('Invalid trunk rotation', rotationValidation);
      }

      // Validation des transferts personnels
      let roleValidation: ValidationResult = { isValid: true, score: 1.0, details: this.createValidationDetails({}) };
      if (context) {
        roleValidation = await this.validateTrunkRole(posture, context);
        if (!roleValidation.isValid) {
          return this.createValidationError('Invalid trunk role transfer', roleValidation);
        }
      }

      return {
        isValid: true,
        score: this.calculateTrunkScore([
          inclinationValidation,
          rotationValidation,
          roleValidation
        ]),
        details: this.compileTrunkDetails([
          inclinationValidation,
          rotationValidation,
          roleValidation
        ])
      };
    } catch (error) {
      throw new BodyPostureError('Trunk validation failed', error);
    }
  }

  /**
   * Valide les postures des épaules selon les règles LSF
   * @param posture Tableau de postures d'épaules à valider
   * @returns Résultat de validation
   */
  public async validateShoulders(
    posture: ShoulderPosture[]
  ): Promise<ValidationResult> {
    try {
      // Validation de l'élévation des épaules
      const elevationValidation = await this.validateShoulderElevation(posture);
      if (!elevationValidation.isValid) {
        return this.createValidationError('Invalid shoulder elevation', elevationValidation);
      }

      // Validation des mouvements des épaules
      const movementValidation = await this.validateShoulderMovement(posture);
      if (!movementValidation.isValid) {
        return this.createValidationError('Invalid shoulder movement', movementValidation);
      }

      // Validation de la symétrie
      const symmetryValidation = await this.validateShoulderSymmetry(posture);
      if (!symmetryValidation.isValid) {
        return this.createValidationError('Invalid shoulder symmetry', symmetryValidation);
      }

      return {
        isValid: true,
        score: this.calculateShoulderScore([
          elevationValidation,
          movementValidation,
          symmetryValidation
        ]),
        details: this.compileShoulderDetails([
          elevationValidation,
          movementValidation,
          symmetryValidation
        ])
      };
    } catch (error) {
      throw new BodyPostureError('Shoulder validation failed', error);
    }
  }

  /**
   * Valide les transferts de poids selon les règles LSF
   * @param shifts Tableau de transferts de poids à valider
   * @param context Contexte grammatical optionnel
   * @returns Résultat de validation
   */
  public async validateWeightShifts(
    shifts: WeightShift[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    try {
      // Validation de l'amplitude des transferts
      const amplitudeValidation = await this.validateShiftAmplitude(shifts);
      if (!amplitudeValidation.isValid) {
        return this.createValidationError('Invalid weight shift amplitude', amplitudeValidation);
      }

      // Validation du timing des transferts
      const timingValidation = await this.validateShiftTiming(shifts);
      if (!timingValidation.isValid) {
        return this.createValidationError('Invalid weight shift timing', timingValidation);
      }

      // Validation de la fonction grammaticale
      const functionValidation = await this.validateShiftFunction(shifts, context);
      if (!functionValidation.isValid) {
        return this.createValidationError('Invalid weight shift function', functionValidation);
      }

      return {
        isValid: true,
        score: this.calculateShiftScore([
          amplitudeValidation,
          timingValidation,
          functionValidation
        ]),
        details: this.compileShiftDetails([
          amplitudeValidation,
          timingValidation,
          functionValidation
        ])
      };
    } catch (error) {
      throw new BodyPostureError('Weight shift validation failed', error);
    }
  }

  /**
   * Crée un objet d'erreur de validation standardisé
   * @param message Message d'erreur
   * @param validation Résultat de validation d'origine
   * @returns Résultat de validation avec erreur
   */
  private createValidationError(message: string, validation: ValidationResult): ValidationResult {
    return {
      isValid: false,
      score: validation.score * 0.5, // Réduction du score
      details: this.createValidationDetails({
        message,
        errorDetails: validation.details
      })
    };
  }

  /**
   * Valide l'inclinaison du tronc
   * @param posture Tableau de postures du tronc
   * @returns Résultat de validation
   */
  private async validateTrunkInclination(
    posture: TrunkPosture[]
  ): Promise<ValidationResult> {
    // Vérification de l'inclinaison selon les règles LSF
    const inclinations = posture.map(p => this.extractInclination(p));
    const rules = await this.getInclinationRules();

    return this.validateAgainstInclinationRules(inclinations, rules);
  }

  /**
   * Valide la rotation du tronc
   * @param posture Tableau de postures du tronc
   * @returns Résultat de validation
   */
  private async validateTrunkRotation(
    posture: TrunkPosture[]
  ): Promise<ValidationResult> {
    // Vérification de la rotation selon les règles LSF
    const rotations = posture.map(p => p.rotation);
    const rules = await this.getRotationRules();

    return this.validateAgainstRotationRules(rotations, rules);
  }

  /**
   * Valide le transfert de rôle dans la posture du tronc
   * @param posture Tableau de postures du tronc
   * @param context Contexte grammatical
   * @returns Résultat de validation
   */
  private async validateTrunkRole(
    posture: TrunkPosture[],
    context: GrammaticalContext
  ): Promise<ValidationResult> {
    // Vérification des transferts personnels
    const roles = await this.extractTrunkRoles(posture);
    const rules = await this.getRoleTransferRules(context);

    return this.validateAgainstRoleRules(roles, rules);
  }

  /**
   * Valide l'élévation des épaules
   * @param posture Tableau de postures d'épaules
   * @returns Résultat de validation
   */
  private async validateShoulderElevation(
    posture: ShoulderPosture[]
  ): Promise<ValidationResult> {
    // Implémentation de la validation de l'élévation des épaules
    const elevations = posture.map(p => p.elevation);
    const rules = await this.getElevationRules();

    return this.validateAgainstElevationRules(elevations, rules);
  }

  /**
   * Valide les mouvements des épaules
   * @param posture Tableau de postures d'épaules
   * @returns Résultat de validation
   */
  private async validateShoulderMovement(
    posture: ShoulderPosture[]
  ): Promise<ValidationResult> {
    // Implémentation de la validation des mouvements des épaules
    const movements = posture.map(p => p.movement);
    const rules = await this.getMovementRules();

    return this.validateAgainstMovementRules(movements, rules);
  }

  /**
   * Valide la symétrie des épaules
   * @param posture Tableau de postures d'épaules
   * @returns Résultat de validation
   */
  private async validateShoulderSymmetry(
    posture: ShoulderPosture[]
  ): Promise<ValidationResult> {
    // Vérification de la symétrie des mouvements
    const symmetryPatterns = this.extractSymmetryPatterns(posture);
    const rules = await this.getSymmetryRules();

    return this.validateAgainstSymmetryRules(symmetryPatterns, rules);
  }

  /**
   * Valide l'amplitude des transferts de poids
   * @param shifts Tableau de transferts de poids
   * @returns Résultat de validation
   */
  private async validateShiftAmplitude(
    shifts: WeightShift[]
  ): Promise<ValidationResult> {
    // Implémentation de la validation de l'amplitude des transferts
    const amplitudes = shifts.map(s => s.amplitude);
    const rules = await this.getAmplitudeRules();

    return this.validateAgainstAmplitudeRules(amplitudes, rules);
  }

  /**
   * Valide le timing des transferts de poids
   * @param shifts Tableau de transferts de poids
   * @returns Résultat de validation
   */
  private async validateShiftTiming(
    shifts: WeightShift[]
  ): Promise<ValidationResult> {
    // Implémentation de la validation du timing des transferts
    const timings = shifts.map(s => s.timing);
    const rules = await this.getTimingRules();

    return this.validateAgainstTimingRules(timings, rules);
  }

  /**
   * Valide la fonction grammaticale des transferts de poids
   * @param shifts Tableau de transferts de poids
   * @param context Contexte grammatical optionnel
   * @returns Résultat de validation
   */
  private async validateShiftFunction(
    shifts: WeightShift[],
    context?: GrammaticalContext
  ): Promise<ValidationResult> {
    // Vérification de la fonction grammaticale des transferts de poids
    const functions = await this.extractShiftFunctions(shifts);
    const rules = context
      ? await this.getContextualShiftRules()
      : await this.getDefaultShiftRules();

    return this.validateAgainstFunctionRules(functions, rules);
  }

  /**
   * Extrait les données d'inclinaison d'une posture
   * @param posture Posture du tronc
   * @returns Données d'inclinaison
   */
  private extractInclination(posture: TrunkPosture): InclinationData {
    return posture.inclination;
  }

  /**
   * Extrait les transferts de rôle d'un ensemble de postures
   * @param posture Tableau de postures du tronc
   * @returns Tableau de transferts de rôle
   */
  private async extractTrunkRoles(posture: TrunkPosture[]): Promise<RoleTransfer[]> {
    return posture.filter(p => p.role).map(p => p.role as RoleTransfer);
  }

  /**
   * Extrait les motifs de symétrie des postures d'épaules
   * @param posture Tableau de postures d'épaules
   * @returns Tableau de motifs de symétrie
   */
  private extractSymmetryPatterns(posture: ShoulderPosture[]): SymmetryPattern[] {
    // Regrouper les mouvements par timing et extraire les patterns de symétrie
    const patterns: SymmetryPattern[] = [];

    // Grouper par moment de début pour identifier les mouvements simultanés
    const timeGroups = new Map<number, ShoulderPosture[]>();

    for (const p of posture) {
      const timeKey = p.timing.start;
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)?.push(p);
    }

    // Analyser chaque groupe pour la symétrie
    for (const [time, poses] of timeGroups.entries()) {
      if (poses.length > 1) {
        // Vérifier si les mouvements sont symétriques
        const leftMoves = poses.filter(p => p.side === 'LEFT');
        const rightMoves = poses.filter(p => p.side === 'RIGHT');
        const bothMoves = poses.filter(p => p.side === 'BOTH');

        patterns.push({
          time,
          isSymmetric: this.checkSymmetry(leftMoves, rightMoves, bothMoves),
          leftCount: leftMoves.length,
          rightCount: rightMoves.length,
          bothCount: bothMoves.length
        });
      }
    }

    return patterns;
  }

  /**
   * Vérifie la symétrie entre les mouvements gauches et droits
   * @param leftMoves Mouvements d'épaules gauches
   * @param rightMoves Mouvements d'épaules droites
   * @param bothMoves Mouvements d'épaules des deux côtés
   * @returns Vrai si les mouvements sont symétriques
   */
  private checkSymmetry(
    leftMoves: ShoulderPosture[],
    rightMoves: ShoulderPosture[],
    bothMoves: ShoulderPosture[]
  ): boolean {
    // Logique pour déterminer si les mouvements sont symétriques
    if (bothMoves.length > 0) return true;
    if (leftMoves.length !== rightMoves.length) return false;

    // Vérifier que les mouvements correspondent mais sont opposés
    for (let i = 0; i < leftMoves.length; i++) {
      const leftMove = leftMoves[i].movement;
      const rightMove = rightMoves[i]?.movement;

      if (!rightMove || !this.areMovementsSymmetric(leftMove, rightMove)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Vérifie si deux mouvements d'épaules sont symétriques
   * @param leftMove Mouvement d'épaule gauche
   * @param rightMove Mouvement d'épaule droite
   * @returns Vrai si les mouvements sont symétriques
   */
  private areMovementsSymmetric(leftMove: ShoulderMovement, rightMove: ShoulderMovement): boolean {
    // Vérifier si deux mouvements sont symétriques
    if (leftMove.type !== rightMove.type) return false;
    if (Math.abs(leftMove.amplitude - rightMove.amplitude) > 0.1) return false;
    if (Math.abs(leftMove.speed - rightMove.speed) > 0.1) return false;

    return true;
  }

  /**
   * Extrait les fonctions grammaticales des transferts de poids
   * @param shifts Tableau de transferts de poids
   * @returns Tableau de fonctions grammaticales
   */
  private async extractShiftFunctions(shifts: WeightShift[]): Promise<GrammaticalFunction[]> {
    return shifts
      .filter(s => s.function)
      .map(s => s.function as GrammaticalFunction);
  }

  /**
   * Récupère les règles d'inclinaison du tronc
   * @returns Tableau de règles d'inclinaison
   */
  private async getInclinationRules(): Promise<InclinationRule[]> {
    // Dans une implémentation réelle, ces règles pourraient être chargées depuis une base de données
    return [
      {
        direction: 'FORWARD',
        minAngle: 5,
        maxAngle: 45,
        minIntensity: 0.2,
        maxIntensity: 1.0
      },
      {
        direction: 'BACKWARD',
        minAngle: 5,
        maxAngle: 30,
        minIntensity: 0.2,
        maxIntensity: 0.8
      },
      {
        direction: 'LEFT',
        minAngle: 5,
        maxAngle: 30,
        minIntensity: 0.2,
        maxIntensity: 0.9
      },
      {
        direction: 'RIGHT',
        minAngle: 5,
        maxAngle: 30,
        minIntensity: 0.2,
        maxIntensity: 0.9
      }
    ];
  }

  /**
   * Récupère les règles de rotation du tronc
   * @returns Tableau de règles de rotation
   */
  private async getRotationRules(): Promise<RotationRule[]> {
    return [
      {
        axis: 'VERTICAL',
        minAngle: 0,
        maxAngle: 90,
        minSpeed: 0.1,
        maxSpeed: 1.0
      },
      {
        axis: 'HORIZONTAL',
        minAngle: 0,
        maxAngle: 45,
        minSpeed: 0.1,
        maxSpeed: 0.8
      }
    ];
  }

  /**
   * Récupère les règles de transfert de rôle
   * @param _context Contexte grammatical (non utilisé actuellement)
   * @returns Tableau de règles de transfert de rôle
   */
  private async getRoleTransferRules(_context: GrammaticalContext): Promise<RoleTransferRule[]> {
    // Les règles peuvent dépendre du contexte grammatical
    return [
      {
        type: 'CHARACTER',
        minIntensity: 0.3,
        maxIntensity: 1.0,
        allowedPerspectives: ['INTERNAL', 'EXTERNAL']
      },
      {
        type: 'NARRATOR',
        minIntensity: 0.1,
        maxIntensity: 0.7,
        allowedPerspectives: ['EXTERNAL']
      },
      {
        type: 'OBSERVER',
        minIntensity: 0.2,
        maxIntensity: 0.9,
        allowedPerspectives: ['EXTERNAL']
      }
    ];
  }

  /**
   * Récupère les règles d'élévation des épaules
   * @returns Tableau de règles d'élévation
   */
  private async getElevationRules(): Promise<ElevationRule[]> {
    return [
      {
        minElevation: 0,
        maxElevation: 1.0,
        context: 'NEUTRAL'
      },
      {
        minElevation: 0.3,
        maxElevation: 0.8,
        context: 'EMPHASIS'
      },
      {
        minElevation: 0.5,
        maxElevation: 1.0,
        context: 'QUESTION'
      }
    ];
  }

  /**
   * Récupère les règles de mouvement des épaules
   * @returns Tableau de règles de mouvement
   */
  private async getMovementRules(): Promise<MovementRule[]> {
    return [
      {
        type: 'RAISE',
        minAmplitude: 0.1,
        maxAmplitude: 1.0,
        minSpeed: 0.2,
        maxSpeed: 1.0
      },
      {
        type: 'LOWER',
        minAmplitude: 0.1,
        maxAmplitude: 1.0,
        minSpeed: 0.2,
        maxSpeed: 0.8
      },
      {
        type: 'FORWARD',
        minAmplitude: 0.1,
        maxAmplitude: 0.7,
        minSpeed: 0.2,
        maxSpeed: 0.9
      },
      {
        type: 'BACKWARD',
        minAmplitude: 0.1,
        maxAmplitude: 0.7,
        minSpeed: 0.2,
        maxSpeed: 0.9
      }
    ];
  }

  /**
   * Récupère les règles de symétrie des épaules
   * @returns Tableau de règles de symétrie
   */
  private async getSymmetryRules(): Promise<SymmetryRule[]> {
    return [
      {
        context: 'STATEMENT',
        requireSymmetry: false
      },
      {
        context: 'EMPHASIS',
        requireSymmetry: true
      },
      {
        context: 'QUESTION',
        requireSymmetry: true
      }
    ];
  }

  /**
   * Récupère les règles d'amplitude des transferts de poids
   * @returns Tableau de règles d'amplitude
   */
  private async getAmplitudeRules(): Promise<AmplitudeRule[]> {
    return [
      {
        direction: 'LEFT',
        minAmplitude: 0.1,
        maxAmplitude: 0.8
      },
      {
        direction: 'RIGHT',
        minAmplitude: 0.1,
        maxAmplitude: 0.8
      },
      {
        direction: 'FORWARD',
        minAmplitude: 0.1,
        maxAmplitude: 0.7
      },
      {
        direction: 'BACKWARD',
        minAmplitude: 0.1,
        maxAmplitude: 0.6
      }
    ];
  }

  /**
   * Récupère les règles de timing des transferts de poids
   * @returns Tableau de règles de timing
   */
  private async getTimingRules(): Promise<TimingRule[]> {
    return [
      {
        minDuration: 200,
        maxDuration: 1500,
        minTransitionIn: 50,
        maxTransitionIn: 300,
        minTransitionOut: 50,
        maxTransitionOut: 300
      }
    ];
  }

  /**
    * Récupère les règles de fonction grammaticale contextuelle
    * @returns Tableau de règles de fonction
    */
  private async getContextualShiftRules(): Promise<FunctionRule[]> {
    // Règles spécifiques au contexte
    return [
      {
        type: 'EMPHASIS',
        minStrength: 0.5,
        maxStrength: 1.0,
        allowedScopes: ['LOCAL', 'GLOBAL']
      },
      {
        type: 'CONTRAST',
        minStrength: 0.3,
        maxStrength: 0.9,
        allowedScopes: ['LOCAL']
      },
      {
        type: 'TOPIC_SHIFT',
        minStrength: 0.4,
        maxStrength: 1.0,
        allowedScopes: ['GLOBAL']
      }
    ];
  }

  /**
   * Récupère les règles de fonction grammaticale par défaut
   * @returns Tableau de règles de fonction
   */
  private async getDefaultShiftRules(): Promise<FunctionRule[]> {
    // Règles par défaut
    return [
      {
        type: 'NEUTRAL',
        minStrength: 0.1,
        maxStrength: 0.5,
        allowedScopes: ['LOCAL', 'GLOBAL']
      },
      {
        type: 'EMPHASIS',
        minStrength: 0.3,
        maxStrength: 0.8,
        allowedScopes: ['LOCAL']
      }
    ];
  }

  /**
   * Valide les inclinaisons selon les règles
   * @param inclinations Tableau d'inclinaisons
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstInclinationRules(
    inclinations: InclinationData[],
    rules: InclinationRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    for (const incl of inclinations) {
      const rule = rules.find(r => r.direction === incl.direction);
      if (!rule) {
        isValid = false;
        issues.push(`Invalid inclination direction: ${incl.direction}`);
        continue;
      }

      if (incl.angle < rule.minAngle || incl.angle > rule.maxAngle) {
        isValid = false;
        issues.push(`Inclination angle out of range: ${incl.angle}° (allowed: ${rule.minAngle}°-${rule.maxAngle}°)`);
      }

      if (incl.intensity < rule.minIntensity || incl.intensity > rule.maxIntensity) {
        isValid = false;
        issues.push(`Inclination intensity out of range: ${incl.intensity} (allowed: ${rule.minIntensity}-${rule.maxIntensity})`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.5,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les rotations selon les règles
   * @param rotations Tableau de rotations
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstRotationRules(
    rotations: RotationData[],
    rules: RotationRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    for (const rot of rotations) {
      const rule = rules.find(r => r.axis === rot.axis);
      if (!rule) {
        isValid = false;
        issues.push(`Invalid rotation axis: ${rot.axis}`);
        continue;
      }

      if (rot.angle < rule.minAngle || rot.angle > rule.maxAngle) {
        isValid = false;
        issues.push(`Rotation angle out of range: ${rot.angle}° (allowed: ${rule.minAngle}°-${rule.maxAngle}°)`);
      }

      if (rot.speed < rule.minSpeed || rot.speed > rule.maxSpeed) {
        isValid = false;
        issues.push(`Rotation speed out of range: ${rot.speed} (allowed: ${rule.minSpeed}-${rule.maxSpeed})`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.6,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les transferts de rôle selon les règles
   * @param roles Tableau de transferts de rôle
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstRoleRules(
    roles: RoleTransfer[],
    rules: RoleTransferRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    for (const role of roles) {
      const rule = rules.find(r => r.type === role.type);
      if (!rule) {
        isValid = false;
        issues.push(`Invalid role type: ${role.type}`);
        continue;
      }

      if (role.intensity < rule.minIntensity || role.intensity > rule.maxIntensity) {
        isValid = false;
        issues.push(`Role intensity out of range: ${role.intensity} (allowed: ${rule.minIntensity}-${rule.maxIntensity})`);
      }

      if (!rule.allowedPerspectives.includes(role.perspective)) {
        isValid = false;
        issues.push(`Invalid perspective for role type ${role.type}: ${role.perspective}`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.7,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
     * Valide les élévations selon les règles
     * @param elevations Tableau d'élévations
     * @param rules Règles de validation
     * @returns Résultat de validation
     */
  private validateAgainstElevationRules(
    elevations: number[],
    rules: ElevationRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    for (const elev of elevations) {
      // Vérifier que l'élévation est dans au moins une plage valide
      const validRules = rules.filter(r =>
        elev >= r.minElevation && elev <= r.maxElevation
      );

      if (validRules.length === 0) {
        isValid = false;
        issues.push(`Elevation out of any valid range: ${elev}`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.6,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les mouvements selon les règles
   * @param movements Tableau de mouvements
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstMovementRules(
    movements: ShoulderMovement[],
    rules: MovementRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    for (const move of movements) {
      const rule = rules.find(r => r.type === move.type);
      if (!rule) {
        isValid = false;
        issues.push(`Invalid movement type: ${move.type}`);
        continue;
      }

      if (move.amplitude < rule.minAmplitude || move.amplitude > rule.maxAmplitude) {
        isValid = false;
        issues.push(`Movement amplitude out of range: ${move.amplitude} (allowed: ${rule.minAmplitude}-${rule.maxAmplitude})`);
      }

      if (move.speed < rule.minSpeed || move.speed > rule.maxSpeed) {
        isValid = false;
        issues.push(`Movement speed out of range: ${move.speed} (allowed: ${rule.minSpeed}-${rule.maxSpeed})`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.7,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les motifs de symétrie selon les règles
   * @param patterns Tableau de motifs de symétrie
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstSymmetryRules(
    patterns: SymmetryPattern[],
    rules: SymmetryRule[]
  ): ValidationResult {
    // Pour simplifier, nous considérons que la symétrie est toujours requise
    let isValid = true;
    const issues: string[] = [];

    // Utilisation des règles pour déterminer si la symétrie est requise
    const requireSymmetry = rules.some(rule => rule.requireSymmetry);

    if (requireSymmetry) {
      for (const pattern of patterns) {
        if (!pattern.isSymmetric) {
          isValid = false;
          issues.push(`Asymmetric shoulder movement detected at time ${pattern.time}ms`);
        }
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.8,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les amplitudes selon les règles
   * @param amplitudes Tableau d'amplitudes
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstAmplitudeRules(
    amplitudes: number[],
    rules: AmplitudeRule[]
  ): ValidationResult {
    // Pour simplifier, nous considérons que toutes les amplitudes doivent être dans une plage globale
    let isValid = true;
    const issues: string[] = [];

    const minAmplitude = Math.min(...rules.map(r => r.minAmplitude));
    const maxAmplitude = Math.max(...rules.map(r => r.maxAmplitude));

    for (const amp of amplitudes) {
      if (amp < minAmplitude || amp > maxAmplitude) {
        isValid = false;
        issues.push(`Amplitude out of range: ${amp} (allowed: ${minAmplitude}-${maxAmplitude})`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.7,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les timings selon les règles
   * @param timings Tableau de timings
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstTimingRules(
    timings: PostureTiming[],
    rules: TimingRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    // Nous supposons qu'il n'y a qu'une règle de timing pour simplifier
    const rule = rules[0];

    for (const timing of timings) {
      if (timing.duration < rule.minDuration || timing.duration > rule.maxDuration) {
        isValid = false;
        issues.push(`Duration out of range: ${timing.duration}ms (allowed: ${rule.minDuration}-${rule.maxDuration}ms)`);
      }

      if (timing.transitionIn < rule.minTransitionIn || timing.transitionIn > rule.maxTransitionIn) {
        isValid = false;
        issues.push(`Transition in time out of range: ${timing.transitionIn}ms (allowed: ${rule.minTransitionIn}-${rule.maxTransitionIn}ms)`);
      }

      if (timing.transitionOut < rule.minTransitionOut || timing.transitionOut > rule.maxTransitionOut) {
        isValid = false;
        issues.push(`Transition out time out of range: ${timing.transitionOut}ms (allowed: ${rule.minTransitionOut}-${rule.maxTransitionOut}ms)`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.6,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Valide les fonctions grammaticales selon les règles
   * @param functions Tableau de fonctions grammaticales
   * @param rules Règles de validation
   * @returns Résultat de validation
   */
  private validateAgainstFunctionRules(
    functions: GrammaticalFunction[],
    rules: FunctionRule[]
  ): ValidationResult {
    let isValid = true;
    const issues: string[] = [];

    for (const func of functions) {
      const rule = rules.find(r => r.type === func.type);
      if (!rule) {
        isValid = false;
        issues.push(`Invalid function type: ${func.type}`);
        continue;
      }

      if (func.strength < rule.minStrength || func.strength > rule.maxStrength) {
        isValid = false;
        issues.push(`Function strength out of range: ${func.strength} (allowed: ${rule.minStrength}-${rule.maxStrength})`);
      }

      if (!rule.allowedScopes.includes(func.scope)) {
        isValid = false;
        issues.push(`Invalid scope for function type ${func.type}: ${func.scope}`);
      }
    }

    return {
      isValid,
      score: isValid ? 1.0 : 0.7,
      details: this.createValidationDetails({ issues })
    };
  }

  /**
   * Calcule le score global pour le tronc
   * @param validations Tableau de résultats de validation
   * @returns Score global
   */
  private calculateTrunkScore(validations: ValidationResult[]): number {
    // Calculer une moyenne pondérée des scores
    const weights = [0.5, 0.3, 0.2]; // Inclinaison, rotation, rôle

    let totalScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < validations.length; i++) {
      if (validations[i]) {
        totalScore += validations[i].score * weights[i];
        totalWeight += weights[i];
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calcule le score global pour les épaules
   * @param validations Tableau de résultats de validation
   * @returns Score global
   */
  private calculateShoulderScore(validations: ValidationResult[]): number {
    // Calculer une moyenne pondérée des scores
    const weights = [0.4, 0.4, 0.2]; // Élévation, mouvement, symétrie

    let totalScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < validations.length; i++) {
      if (validations[i]) {
        totalScore += validations[i].score * weights[i];
        totalWeight += weights[i];
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calcule le score global pour les transferts de poids
   * @param validations Tableau de résultats de validation
   * @returns Score global
   */
  private calculateShiftScore(validations: ValidationResult[]): number {
    // Calculer une moyenne pondérée des scores
    const weights = [0.3, 0.3, 0.4]; // Amplitude, timing, fonction

    let totalScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < validations.length; i++) {
      if (validations[i]) {
        totalScore += validations[i].score * weights[i];
        totalWeight += weights[i];
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Compile les détails de validation du tronc
   * @param validations Tableau de résultats de validation
   * @returns Détails compilés
   */
  private compileTrunkDetails(validations: ValidationResult[]): ValidationDetails {
    return this.createValidationDetails({
      inclinationIssues: validations[0]?.details.issues || [],
      rotationIssues: validations[1]?.details.issues || [],
      roleIssues: validations[2]?.details.issues || []
    });
  }

  /**
   * Compile les détails de validation des épaules
   * @param validations Tableau de résultats de validation
   * @returns Détails compilés
   */
  private compileShoulderDetails(validations: ValidationResult[]): ValidationDetails {
    return this.createValidationDetails({
      elevationIssues: validations[0]?.details.issues || [],
      movementIssues: validations[1]?.details.issues || [],
      symmetryIssues: validations[2]?.details.issues || []
    });
  }

  /**
   * Compile les détails de validation des transferts de poids
   * @param validations Tableau de résultats de validation
   * @returns Détails compilés
   */
  private compileShiftDetails(validations: ValidationResult[]): ValidationDetails {
    return this.createValidationDetails({
      amplitudeIssues: validations[0]?.details.issues || [],
      timingIssues: validations[1]?.details.issues || [],
      functionIssues: validations[2]?.details.issues || []
    });
  }
}