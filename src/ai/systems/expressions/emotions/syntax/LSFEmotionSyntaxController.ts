// src/ai/systems/expressions/emotions/syntax/LSFEmotionSyntaxController.ts
import {
  EmotionType,
  SystemeControleEthique,
  SystemeExpressions,
  SystemeEmotionnel,
  SyntacticContext,
  ValidationResult,
  ValidationIssue,
  ControlledExpression,
  LSFExpression
} from './types';

import {
  ensureNumericRecord,
  ensureHandshapeProperties,
  toExtendedExpression,
  toBaseExpression,
  deepCopy,
  toEyebrowComponent,
  toMouthComponent,
  toEyeComponent
} from './expressionUtils';

// Types spécifiques pour les paramètres de contrôle
interface EmotionModulationParameters {
  movement_amplitude: { min: number; max: number };
  speed_modification: { min: number; max: number };
  constraints: {
    direction_preservation: string;
    location_accuracy: string;
    timing_adjustment?: string;
    tension_control?: string;
    fluidity_control?: string;
  };
}

interface ExpansionLimit {
  max: number;
  recovery: string;
}

interface TemporalParameters {
  EMOTION_SYNTAX_TIMING: {
    ONSET_PATTERNS: {
      EMOTION_FIRST: {
        lead_time: number[];
        build_up: string;
        syntactic_integration: string;
      };
      SYNTAX_FIRST: {
        establishment: number[];
        emotional_overlay: string;
        coordination: string;
      };
      SIMULTANEOUS: {
        synchronization: string;
        balance: string;
        monitoring: string;
      };
    };
    MAINTENANCE: {
      emotional_stability: {
        variation_limit: number;
        correction_threshold: number;
        adjustment_rate: string;
      };
      syntactic_stability: {
        core_preservation: string;
        adaptation_range: string;
        monitoring: string;
      };
    };
  };
  TRANSITIONS: {
    EMOTION_TO_SYNTAX: {
      fade_emotion: {
        duration: number[];
        pattern: string;
        syntactic_emergence: string;
      };
      syntax_prominence: {
        timing: string;
        clarity: string;
        emotional_residue: string;
      };
    };
    SYNTAX_TO_EMOTION: {
      preserve_meaning: {
        duration: number[];
        syntactic_clarity: string;
        emotional_build: string;
      };
      integration: {
        method: string;
        timing: string;
        balance: string;
      };
    };
  };
}

export class LSFEmotionSyntaxController {
  // Systèmes nécessaires selon le diagramme d'état
  private readonly ethicsSystem: SystemeControleEthique;
  private readonly expressionSystem: SystemeExpressions;
  private readonly emotionalSystem: SystemeEmotionnel;

  private readonly CONTROL_PARAMETERS = {
    // Paramètres de validation éthique
    ETHICS_VALIDATION: {
      ASIMOV_LAWS: {
        PROTECTION_HUMAN: true,
        OBEDIENCE_ORDERS: true,
        AUTO_PROTECTION: true
      },
      REGULATORY_COMPLIANCE: {
        GDPR_COMPLIANCE: true,
        CERTIFICATION: true,
        SECURITY_RULES: true
      }
    },
    // Contrôle fin des modifications syntaxiques
    SYNTACTIC_MODULATION: {
      SUPERVISION: {
        HUMAN_VALIDATION: true,
        EXPERT_VALIDATION: true,
        CONTINUOUS_MONITORING: true
      },
      VERBAL_AGREEMENT: {
        EMOTIONAL_INFLUENCE: {
          INTENSITY: {
            JOY: {
              movement_amplitude: { min: 1.0, max: 1.3 },
              speed_modification: { min: 1.0, max: 1.2 },
              constraints: {
                direction_preservation: 'strict',
                location_accuracy: 'high',
                timing_adjustment: 'flexible'
              }
            },
            ANGER: {
              movement_amplitude: { min: 1.2, max: 1.4 },
              speed_modification: { min: 1.1, max: 1.3 },
              constraints: {
                direction_preservation: 'absolute',
                location_accuracy: 'very_high',
                tension_control: 'required'
              }
            },
            SADNESS: {
              movement_amplitude: { min: 0.8, max: 1.0 },
              speed_modification: { min: 0.7, max: 0.9 },
              constraints: {
                direction_preservation: 'strict',
                location_accuracy: 'high',
                fluidity_control: 'enhanced'
              }
            }
          },
          COORDINATION: {
            agreement_points: {
              emotional_shift: {
                max_deviation: 0.1, // 10% max de déviation
                recovery_required: true,
                timing: 'emotion_first'
              }
            },
            referential_space: {
              emotional_expansion: {
                allowed: true,
                max_factor: 1.2,
                preservation: 'reference_points'
              }
            }
          }
        }
      },

      CLASSIFIER_PREDICATES: {
        EMOTIONAL_ADAPTATION: {
          HANDSHAPE: {
            precision: {
              base_requirement: 0.95, // 95% de précision minimale
              emotional_tolerance: 0.03 // 3% de tolérance pour l'émotion
            },
            tension: {
              joy: { increase: 0.1, control: 'maintained' },
              anger: { increase: 0.2, control: 'strict' },
              sadness: { decrease: 0.1, control: 'fluid' }
            }
          },
          MOVEMENT: {
            trajectory: {
              emotional_influence: {
                amplitude: 'controlled_variation',
                speed: 'emotion_adapted',
                precision: 'maintained'
              },
              constraints: {
                path_integrity: 'preserved',
                semantic_clarity: 'required',
                emotional_expression: 'integrated'
              }
            }
          }
        }
      }
    },

    // Contrôle temporel fin
    TEMPORAL_CONTROL: {
      EMOTION_SYNTAX_TIMING: {
        ONSET_PATTERNS: {
          EMOTION_FIRST: {
            lead_time: [50, 100], // ms
            build_up: 'gradual',
            syntactic_integration: 'smooth'
          },
          SYNTAX_FIRST: {
            establishment: [30, 60], // ms
            emotional_overlay: 'progressive',
            coordination: 'precise'
          },
          SIMULTANEOUS: {
            synchronization: 'exact',
            balance: 'dynamic',
            monitoring: 'continuous'
          }
        },

        MAINTENANCE: {
          emotional_stability: {
            variation_limit: 0.15, // 15% max de variation
            correction_threshold: 0.1,
            adjustment_rate: 'gradual'
          },
          syntactic_stability: {
            core_preservation: 'strict',
            adaptation_range: 'limited',
            monitoring: 'continuous'
          }
        }
      },

      TRANSITIONS: {
        EMOTION_TO_SYNTAX: {
          fade_emotion: {
            duration: [100, 200], // ms
            pattern: 'smooth_decrease',
            syntactic_emergence: 'coordinated'
          },
          syntax_prominence: {
            timing: 'natural',
            clarity: 'enhanced',
            emotional_residue: 'controlled'
          }
        },

        SYNTAX_TO_EMOTION: {
          preserve_meaning: {
            duration: [150, 250], // ms
            syntactic_clarity: 'maintained',
            emotional_build: 'progressive'
          },
          integration: {
            method: 'layered',
            timing: 'controlled',
            balance: 'dynamic'
          }
        }
      }
    },

    // Contrôle spatial fin
    SPATIAL_CONTROL: {
      SIGNING_SPACE: {
        EMOTIONAL_ZONES: {
          expansion_limits: {
            joy: { max: 1.3, recovery: 'required' },
            anger: { max: 1.4, recovery: 'strict' },
            sadness: { max: 0.9, recovery: 'gradual' }
          },
          interaction_rules: {
            grammatical_space: {
              preservation: 'mandatory',
              adaptation: 'controlled',
              recovery: 'monitored'
            },
            emotional_influence: {
              boundary_respect: 'strict',
              modification_patterns: 'defined',
              restoration: 'automatic'
            }
          }
        },

        REFERENCE_MAINTENANCE: {
          emotional_context: {
            stability: {
              core_points: 'absolute',
              secondary_points: 'flexible',
              emotional_shift: 'bounded'
            },
            recovery: {
              timing: 'immediate',
              method: 'progressive',
              verification: 'required'
            }
          }
        }
      }
    }
  };

  /**
   * Constructeur
   * @param ethicsSystem Système de contrôle éthique
   * @param expressionSystem Système d'expressions
   * @param emotionalSystem Système émotionnel
   */
  constructor(
    ethicsSystem: SystemeControleEthique,
    expressionSystem: SystemeExpressions,
    emotionalSystem: SystemeEmotionnel
  ) {
    this.ethicsSystem = ethicsSystem;
    this.expressionSystem = expressionSystem;
    this.emotionalSystem = emotionalSystem;
  }

  /**
   * Adapte une expression selon le contexte émotionnel
   * @param expression Expression à adapter
   * @param intensity Intensité émotionnelle (0-1)
   * @param culturalContext Contexte culturel
   * @returns Expression adaptée
   */
  public async adaptExpression(
    expression: LSFExpression,
    intensity: number = 1.0,
    culturalContext: string[] = []
  ): Promise<LSFExpression> {
    // Convertir en type étendu pour le traitement
    const extendedExpression = toExtendedExpression(expression);

    // Traiter avec le type étendu
    const processedExpression = await this.processEmotionalSyntax(
      extendedExpression,
      intensity,
      culturalContext
    );

    // Reconvertir en type de base pour la sortie
    return toBaseExpression(processedExpression);
  }

  /**
   * Traite la syntaxe émotionnelle d'une expression LSF
   * @param expression Expression LSF à traiter
   * @param intensity Intensité émotionnelle (0.0 à 1.0)
   * @param culturalContext Contextes culturels à prendre en compte
   * @returns Expression LSF adaptée
   */
  public async processEmotionalSyntax(
    expression: LSFExpression,
    intensity: number = 1.0,
    culturalContext: string[] = []
  ): Promise<LSFExpression> {
    // Créer une copie de l'expression pour éviter de modifier l'original
    const adaptedExpression = deepCopy(expression);

    // Adapter l'intensité des composantes selon l'intensité émotionnelle
    if (adaptedExpression.eyebrows) {
      const numericEyebrows = ensureNumericRecord(adaptedExpression.eyebrows);
      const adjustedEyebrows = this.adjustComponentIntensity(
        numericEyebrows,
        intensity
      );
      adaptedExpression.eyebrows = toEyebrowComponent(adjustedEyebrows);
    }

    if (adaptedExpression.mouth) {
      const numericMouth = ensureNumericRecord(adaptedExpression.mouth);
      const adjustedMouth = this.adjustComponentIntensity(
        numericMouth,
        intensity
      );
      adaptedExpression.mouth = toMouthComponent(adjustedMouth);
    }

    if (adaptedExpression.eyes) {
      const numericEyes = ensureNumericRecord(adaptedExpression.eyes);
      const adjustedEyes = this.adjustComponentIntensity(
        numericEyes,
        intensity
      );
      adaptedExpression.eyes = toEyeComponent(adjustedEyes);
    }

    // Appliquer des ajustements culturels si nécessaire
    if (culturalContext.length > 0) {
      this.applyCulturalAdjustments(adaptedExpression, culturalContext);
    }

    return adaptedExpression;
  }

  /**
   * Ajuste l'intensité d'une composante d'expression
   * @param component Composante à ajuster
   * @param intensity Facteur d'intensité
   * @returns Composante ajustée
   */
  private adjustComponentIntensity(
    component: Record<string, number>,
    intensity: number
  ): Record<string, number> {
    const adjustedComponent: Record<string, number> = {};

    // Appliquer le facteur d'intensité à chaque propriété numérique
    for (const [key, value] of Object.entries(component)) {
      if (typeof value === 'number') {
        // Adapter l'intensité tout en évitant des valeurs extrêmes
        adjustedComponent[key] = value * Math.min(Math.max(intensity, 0.5), 1.5);
      }
    }

    return adjustedComponent;
  }

  /**
   * Applique des ajustements culturels à l'expression
   * @param expression Expression à ajuster
   * @param culturalContext Contextes culturels
   */
  private applyCulturalAdjustments(
    expression: LSFExpression,
    culturalContext: string[]
  ): void {
    // Exemple d'ajustements culturels
    // (Dans une implémentation complète, cela serait plus complexe et basé sur des données)

    // Exemple: Ajustement pour la culture française
    if (culturalContext.includes('france')) {
      // Ajustements spécifiques...
    }

    // Exemple: Ajustement pour la culture québécoise
    if (culturalContext.includes('quebec')) {
      // Ajustements spécifiques...
    }

    // Ajouter des métadonnées culturelles
    if (!expression.metadata) {
      expression.metadata = {};
    }

    expression.metadata.culturalContext = culturalContext;
  }

  /**
   * Applique un contrôle détaillé à une expression LSF en y intégrant une émotion
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @param syntacticContext Contexte syntaxique
   * @returns Expression contrôlée
   */
  async applyDetailedControl(
    baseExpression: LSFExpression,
    emotion: EmotionType,
    syntacticContext: SyntacticContext
  ): Promise<ControlledExpression> {
    // Convertir en expression étendue pour le traitement
    const expression = toExtendedExpression(baseExpression);

    // Validation éthique préalable
    await this.ethicsSystem.validate(expression, emotion);

    // Appliquer le contrôle syntaxique
    const syntacticControl = await this.applySyntacticControl(
      expression,
      emotion,
      syntacticContext
    );

    // Appliquer le contrôle temporel
    const temporalControl = await this.applyTemporalControl(
      syntacticControl,
      emotion,
      syntacticContext
    );

    // Appliquer le contrôle spatial
    const spatialControl = await this.applySpatialControl(
      temporalControl,
      emotion,
      syntacticContext
    );

    // Valider le contrôle global (résultat non utilisé directement)
    await this.validateDetailedControl(
      spatialControl,
      emotion,
      syntacticContext
    );

    // Retourner l'expression contrôlée avec les métadonnées
    return {
      expression: spatialControl,
      metadata: {
        syntacticControl: this.measureSyntacticControl(spatialControl),
        temporalControl: this.measureTemporalControl(spatialControl),
        spatialControl: this.measureSpatialControl(spatialControl),
        globalQuality: this.evaluateControlQuality(
          spatialControl,
          emotion,
          syntacticContext
        ),
        ethicsValidation: await this.ethicsSystem.measureCompliance(spatialControl)
      }
    };
  }

  /**
   * Applique un contrôle syntaxique à l'expression
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @param context Contexte syntaxique
   * @returns Expression contrôlée syntaxiquement
   */
  private async applySyntacticControl(
    expression: LSFExpression,
    emotion: EmotionType,
    context: SyntacticContext
  ): Promise<LSFExpression> {
    // Récupération des paramètres de modulation spécifiques à l'émotion
    const emotionParams = this.getEmotionSyntacticParameters(emotion);

    // Copie profonde de l'expression pour éviter toute modification de l'original
    const controlledExpression = deepCopy(expression);

    // S'assurer que handshape a la bonne structure
    controlledExpression.handshape = ensureHandshapeProperties(controlledExpression.handshape);

    // Application des règles de modulation syntaxique selon le contexte
    switch (emotion) {
      case EmotionType.JOY:
        this.applyJoySyntacticModulation(controlledExpression, context);
        break;
      case EmotionType.ANGER:
        this.applyAngerSyntacticModulation(controlledExpression, context);
        break;
      case EmotionType.SADNESS:
        this.applySadnessSyntacticModulation(controlledExpression, context);
        break;
      default:
        this.applyNeutralSyntacticModulation(controlledExpression, context);
    }

    // Application des paramètres d'émotion
    if (emotionParams && controlledExpression.handshape) {
      // Accéder au mouvement selon la structure réelle
      if (controlledExpression.handshape.movement) {
        // Ajustement de l'amplitude du mouvement
        const amplitude = emotionParams.movement_amplitude;
        if (amplitude && typeof controlledExpression.handshape.movement.amplitude === 'number') {
          const currentAmplitude = controlledExpression.handshape.movement.amplitude;
          const adjustedAmplitude = Math.min(
            Math.max(currentAmplitude * amplitude.min, currentAmplitude),
            currentAmplitude * amplitude.max
          );
          controlledExpression.handshape.movement.amplitude = adjustedAmplitude;
        }

        // Ajustement de la vitesse
        const speed = emotionParams.speed_modification;
        if (speed && typeof controlledExpression.handshape.movement.speed === 'number') {
          const currentSpeed = controlledExpression.handshape.movement.speed;
          const adjustedSpeed = Math.min(
            Math.max(currentSpeed * speed.min, currentSpeed),
            currentSpeed * speed.max
          );
          controlledExpression.handshape.movement.speed = adjustedSpeed;
        }
      }
    }

    return controlledExpression;
  }

  /**
   * Applique un contrôle temporel à l'expression
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @param context Contexte syntaxique
   * @returns Expression avec contrôle temporel
   */
  private async applyTemporalControl(
    expression: LSFExpression,
    emotion: EmotionType,
    context: SyntacticContext
  ): Promise<LSFExpression> {
    // Récupération des paramètres temporels spécifiques à l'émotion
    const temporalParams = this.getEmotionTemporalParameters();

    // Copie profonde de l'expression pour éviter toute modification de l'original
    const controlledExpression = deepCopy(expression);

    // Application des règles de timing et de transition
    this.applyTimingControl(controlledExpression, temporalParams, context);
    this.applyTransitionControl(controlledExpression, temporalParams, context);

    // Modifications temporelles spécifiques à l'émotion
    if (controlledExpression.timing) {
      // Utilise les paramètres d'onset selon le type d'émotion
      const onsetPatterns = temporalParams.EMOTION_SYNTAX_TIMING.ONSET_PATTERNS;
      let onsetPattern;

      switch (emotion) {
        case EmotionType.JOY:
        case EmotionType.SURPRISE:
          // Pour les émotions positives/soudaines, utiliser EMOTION_FIRST
          onsetPattern = onsetPatterns.EMOTION_FIRST;
          break;
        case EmotionType.SADNESS:
          // Pour les émotions plus lentes, utiliser SYNTAX_FIRST
          onsetPattern = onsetPatterns.SYNTAX_FIRST;
          break;
        case EmotionType.ANGER:
          // Pour les émotions intenses, utiliser SIMULTANEOUS
          onsetPattern = onsetPatterns.SIMULTANEOUS;
          break;
        default:
          // Par défaut, équilibré
          onsetPattern = onsetPatterns.SIMULTANEOUS;
      }

      // Application du timing d'apparition
      if (typeof controlledExpression.timing.onset !== 'number') {
        controlledExpression.timing.onset = 0;
      }

      // Ajustement selon le pattern
      if (onsetPattern === onsetPatterns.EMOTION_FIRST && typeof controlledExpression.timing.onset === 'number') {
        controlledExpression.timing.onset -= onsetPattern.lead_time[0];
      } else if (onsetPattern === onsetPatterns.SYNTAX_FIRST && typeof controlledExpression.timing.onset === 'number') {
        controlledExpression.timing.onset += onsetPattern.establishment[0];
      }
    }

    return controlledExpression;
  }

  /**
   * Applique un contrôle spatial à l'expression
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @param context Contexte syntaxique
   * @returns Expression avec contrôle spatial
   */
  private async applySpatialControl(
    expression: LSFExpression,
    emotion: EmotionType,
    context: SyntacticContext
  ): Promise<LSFExpression> {
    // Récupération des paramètres spatiaux spécifiques à l'émotion
    const spatialParams = this.getEmotionSpatialParameters(emotion);

    // Copie profonde de l'expression pour éviter toute modification de l'original
    const controlledExpression = deepCopy(expression);

    // S'assurer que location existe avec les coordonnées
    if (!controlledExpression.location) {
      controlledExpression.location = { coordinates: { x: 0, y: 0, z: 0 } };
    } else if (!controlledExpression.location.coordinates) {
      controlledExpression.location.coordinates = { x: 0, y: 0, z: 0 };
    }

    // Application des règles spatiales
    this.applySigningSpaceControl(controlledExpression, spatialParams, context);
    this.applyReferenceMaintenanceControl(controlledExpression, spatialParams, context);

    // Application des expansions spatiales spécifiques à l'émotion
    if (controlledExpression.location &&
      controlledExpression.location.coordinates &&
      spatialParams &&
      'max' in spatialParams) {
      // Calculer le facteur d'expansion
      const expansionFactor = spatialParams.max;
      const coordinates = controlledExpression.location.coordinates;

      // Appliquer l'expansion si les coordonnées existent
      if (emotion === EmotionType.JOY || emotion === EmotionType.ANGER) {
        // Émotions expansives
        coordinates.x *= expansionFactor;
        coordinates.y *= expansionFactor;
        if (coordinates.z !== undefined) {
          coordinates.z *= expansionFactor;
        }
      } else if (emotion === EmotionType.SADNESS) {
        // Émotion plus contractée
        coordinates.x *= expansionFactor; // Plus petit pour la tristesse
        coordinates.y *= expansionFactor;
        if (coordinates.z !== undefined) {
          coordinates.z *= expansionFactor;
        }
      }
    }

    return controlledExpression;
  }

  /**
   * Valide le contrôle détaillé appliqué à l'expression
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @param context Contexte syntaxique
   * @returns Résultat de la validation
   */
  private async validateDetailedControl(
    expression: LSFExpression,
    emotion: EmotionType,
    context: SyntacticContext
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Valider le contrôle syntaxique
    const syntacticValidation = await this.validateSyntacticControl(
      expression,
      context
    );
    issues.push(...syntacticValidation.issues);

    // Valider le contrôle temporel
    const temporalValidation = await this.validateTemporalControl(
      expression,
      emotion
    );
    issues.push(...temporalValidation.issues);

    // Valider le contrôle spatial
    const spatialValidation = await this.validateSpatialControl(
      expression,
      context
    );
    issues.push(...spatialValidation.issues);

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateValidationScore([
        syntacticValidation,
        temporalValidation,
        spatialValidation
      ])
    };
  }

  /**
   * Valide le contrôle syntaxique
   * @param expression Expression LSF
   * @param context Contexte syntaxique
   * @returns Résultat de la validation
   */
  private async validateSyntacticControl(
    expression: LSFExpression,
    context: SyntacticContext
  ): Promise<ValidationResult> {
    // Validation syntaxique basée sur le contexte
    const issues: ValidationIssue[] = [];

    // Vérification de la configuration manuelle
    if (!expression.handshape || Object.keys(expression.handshape).length === 0) {
      issues.push({
        type: 'SYNTACTIC',
        severity: 'ERROR',
        message: 'Configuration manuelle manquante ou incorrecte',
        component: 'handshape'
      });
    }

    // Vérification de la complexité syntaxique par rapport au contexte
    if (context.complexity > 0.8 &&
      (!expression.handshape?.configuration ||
        !('fingerCurvature' in (expression.handshape.configuration || {})))) {
      issues.push({
        type: 'SYNTACTIC',
        severity: 'WARNING',
        message: 'Courbure des doigts non spécifiée pour une expression complexe',
        component: 'handshape.configuration'
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: issues.length === 0 ? 1.0 : 0.7
    };
  }

  /**
   * Valide le contrôle temporel
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @returns Résultat de la validation
   */
  private async validateTemporalControl(
    expression: LSFExpression,
    emotion: EmotionType
  ): Promise<ValidationResult> {
    // Validation temporelle basée sur l'émotion
    const issues: ValidationIssue[] = [];

    // Vérification des informations de timing
    if (!expression.timing || typeof expression.timing.duration !== 'number') {
      issues.push({
        type: 'TEMPORAL',
        severity: 'WARNING',
        message: 'Timing non spécifié pour l\'expression émotionnelle',
        component: 'timing'
      });
    }

    // Vérification de la cohérence temporelle avec l'émotion
    if (expression.timing && typeof expression.timing.duration === 'number') {
      switch (emotion) {
        case EmotionType.JOY:
          // La joie devrait avoir un timing dynamique
          if (expression.timing.duration > 1000) {
            issues.push({
              type: 'TEMPORAL',
              severity: 'WARNING',
              message: 'Durée trop longue pour une expression de joie',
              component: 'timing.duration'
            });
          }
          break;
        case EmotionType.SADNESS:
          // La tristesse devrait avoir un timing plus lent
          if (expression.timing.duration < 500) {
            issues.push({
              type: 'TEMPORAL',
              severity: 'WARNING',
              message: 'Durée trop courte pour une expression de tristesse',
              component: 'timing.duration'
            });
          }
          break;
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: issues.length === 0 ? 1.0 : 0.8
    };
  }

  /**
   * Valide le contrôle spatial
   * @param expression Expression LSF
   * @param context Contexte syntaxique
   * @returns Résultat de la validation
   */
  private async validateSpatialControl(
    expression: LSFExpression,
    context: SyntacticContext
  ): Promise<ValidationResult> {
    // Validation spatiale basée sur le contexte
    const issues: ValidationIssue[] = [];

    // Vérification des coordonnées spatiales
    if (!expression.location || !expression.location.coordinates) {
      issues.push({
        type: 'SPATIAL',
        severity: 'WARNING',
        message: 'Coordonnées spatiales manquantes',
        component: 'location'
      });
    }

    // Vérification de la compatibilité avec le contexte syntaxique
    if (context.structure === 'reference_point' &&
      (!expression.location || !expression.location.reference)) {
      issues.push({
        type: 'SPATIAL',
        severity: 'ERROR',
        message: 'Point de référence manquant dans une structure référentielle',
        component: 'location.reference'
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: issues.length === 0 ? 1.0 : 0.85
    };
  }

  /**
   * Calcule un score de validation à partir de plusieurs résultats
   * @param validations Résultats de validation
   * @returns Score de validation (0-1)
   */
  private calculateValidationScore(validations: ValidationResult[]): number {
    if (validations.length === 0) return 0;

    const totalScore = validations.reduce((sum, validation) => sum + validation.score, 0);
    return totalScore / validations.length;
  }

  /**
   * Mesure la qualité du contrôle syntaxique
   * @param expression Expression LSF
   * @returns Score de qualité (0-1)
   */
  private measureSyntacticControl(expression: LSFExpression): number {
    // Évaluation de la qualité syntaxique
    let score = 0.9; // Score de base

    // Vérification des éléments clés
    if (expression.handshape && expression.handshape.configuration) {
      score += 0.05;
    } else {
      score -= 0.1;
    }

    if (expression.handshape && expression.handshape.movement) {
      score += 0.05;
    } else {
      score -= 0.1;
    }

    // Limiter le score entre 0 et 1
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Mesure la qualité du contrôle temporel
   * @param expression Expression LSF
   * @returns Score de qualité (0-1)
   */
  private measureTemporalControl(expression: LSFExpression): number {
    // Évaluation de la qualité temporelle
    let score = 0.85; // Score de base

    // Vérification des éléments temporels
    if (expression.timing && typeof expression.timing.duration === 'number') {
      score += 0.05;
    } else {
      score -= 0.1;
    }

    if (expression.timing && typeof expression.timing.onset === 'number') {
      score += 0.05;
    }

    if (expression.timing && typeof expression.timing.hold === 'number') {
      score += 0.05;
    }

    // Limiter le score entre 0 et 1
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Mesure la qualité du contrôle spatial
   * @param expression Expression LSF
   * @returns Score de qualité (0-1)
   */
  private measureSpatialControl(expression: LSFExpression): number {
    // Évaluation de la qualité spatiale
    let score = 0.9; // Score de base

    // Vérification des éléments spatiaux
    if (expression.location && expression.location.coordinates) {
      score += 0.05;
    } else {
      score -= 0.15;
    }

    if (expression.location && expression.location.zone) {
      score += 0.05;
    }

    // Limiter le score entre 0 et 1
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Évalue la qualité globale du contrôle
   * @param expression Expression LSF
   * @param emotion Type d'émotion
   * @param context Contexte syntaxique
   * @returns Score de qualité (0-1)
   */
  private evaluateControlQuality(
    expression: LSFExpression,
    emotion: EmotionType,
    context: SyntacticContext
  ): number {
    // Mesure des différentes dimensions
    const syntactic = this.measureSyntacticControl(expression);
    const temporal = this.measureTemporalControl(expression);
    const spatial = this.measureSpatialControl(expression);

    // Ajustement des poids selon le contexte et l'émotion
    let syntacticWeight = 0.3;
    let temporalWeight = 0.3;
    let spatialWeight = 0.4;

    // Ajustement basé sur la complexité du contexte
    if (context.complexity > 0.7) {
      syntacticWeight = 0.4;
      temporalWeight = 0.25;
      spatialWeight = 0.35;
    }

    // Ajustement basé sur l'émotion
    switch (emotion) {
      case EmotionType.JOY:
      case EmotionType.ANGER:
        // Plus d'importance au spatial pour les émotions expressives
        syntacticWeight = 0.25;
        temporalWeight = 0.3;
        spatialWeight = 0.45;
        break;
      case EmotionType.SADNESS:
        // Plus d'importance au temporel pour la tristesse
        syntacticWeight = 0.25;
        temporalWeight = 0.45;
        spatialWeight = 0.3;
        break;
    }

    // Moyenne pondérée
    return (syntactic * syntacticWeight) + (temporal * temporalWeight) + (spatial * spatialWeight);
  }

  /**
   * Récupère les paramètres syntaxiques spécifiques à une émotion
   * @param emotion Type d'émotion
   * @returns Paramètres de modulation
   */
  private getEmotionSyntacticParameters(emotion: EmotionType): EmotionModulationParameters | Record<string, never> {
    const params = this.CONTROL_PARAMETERS.SYNTACTIC_MODULATION.VERBAL_AGREEMENT.EMOTIONAL_INFLUENCE.INTENSITY;
    const emotionUpperCase = emotion.toUpperCase() as keyof typeof params;
    return params[emotionUpperCase] || {};
  }

  /**
   * Récupère les paramètres temporels spécifiques à une émotion
   * @returns Paramètres temporels
   */
  private getEmotionTemporalParameters(): TemporalParameters {
    return this.CONTROL_PARAMETERS.TEMPORAL_CONTROL;
  }

  /**
   * Récupère les paramètres spatiaux spécifiques à une émotion
   * @param emotion Type d'émotion
   * @returns Limites d'expansion
   */
  private getEmotionSpatialParameters(emotion: EmotionType): ExpansionLimit | Record<string, never> {
    const params = this.CONTROL_PARAMETERS.SPATIAL_CONTROL.SIGNING_SPACE.EMOTIONAL_ZONES.expansion_limits;
    const emotionLowerCase = emotion.toLowerCase() as keyof typeof params;
    return params[emotionLowerCase] || {};
  }

  /**
   * Applique la modulation syntaxique pour l'émotion de joie
   * @param expression Expression LSF
   * @param context Contexte syntaxique
   */
  private applyJoySyntacticModulation(expression: LSFExpression, context: SyntacticContext): void {
    // Implémentation pour la joie
    if (!expression.handshape) expression.handshape = {};
    if (!expression.handshape.movement) expression.handshape.movement = {};

    // Augmenter la fluidité et l'amplitude pour la joie
    expression.handshape.movement.fluidity = 0.9;
    expression.handshape.movement.amplitude = 1.2;

    // Ajuster selon la complexité du contexte
    if (context.complexity > 0.7) {
      // Réduire légèrement pour maintenir la clarté syntaxique
      expression.handshape.movement.amplitude = 1.1;
    }
  }

  /**
   * Applique la modulation syntaxique pour l'émotion de colère
   * @param expression Expression LSF
   * @param context Contexte syntaxique
   */
  private applyAngerSyntacticModulation(expression: LSFExpression, context: SyntacticContext): void {
    // Implémentation pour la colère
    if (!expression.handshape) expression.handshape = {};
    if (!expression.handshape.configuration) expression.handshape.configuration = {};
    if (!expression.handshape.movement) expression.handshape.movement = {};

    // Augmenter la tension et la vitesse pour la colère
    expression.handshape.configuration.tension = 0.8;
    expression.handshape.movement.speed = 1.3;

    // Ajuster selon le contexte
    if (context.structure === 'question') {
      // Réduire légèrement la tension pour les questions
      expression.handshape.configuration.tension = 0.7;
    } else if (context.complexity > 0.8) {
      // Réduire la vitesse pour les expressions complexes
      expression.handshape.movement.speed = 1.2;
    }
  }

  /**
   * Applique la modulation syntaxique pour l'émotion de tristesse
   * @param expression Expression LSF
   * @param context Contexte syntaxique
   */
  private applySadnessSyntacticModulation(expression: LSFExpression, context: SyntacticContext): void {
    // Implémentation pour la tristesse
    if (!expression.handshape) expression.handshape = {};
    if (!expression.handshape.configuration) expression.handshape.configuration = {};
    if (!expression.handshape.movement) expression.handshape.movement = {};

    // Réduire la vitesse et la tension pour la tristesse
    expression.handshape.configuration.tension = 0.4;
    expression.handshape.movement.speed = 0.8;
    expression.handshape.movement.fluidity = 0.7;

    // Ajuster selon le contexte
    if (context.structure === 'narrative') {
      // Augmenter légèrement la fluidité pour les récits
      expression.handshape.movement.fluidity = 0.8;
    }
  }

  /**
   * Applique la modulation syntaxique pour les émotions neutres
   * @param expression Expression LSF
   * @param context Contexte syntaxique
   */
  private applyNeutralSyntacticModulation(expression: LSFExpression, context: SyntacticContext): void {
    // Implémentation pour les émotions neutres
    if (!expression.handshape) expression.handshape = {};
    if (!expression.handshape.configuration) expression.handshape.configuration = {};
    if (!expression.handshape.movement) expression.handshape.movement = {};

    // Valeurs équilibrées pour l'expression neutre
    expression.handshape.configuration.tension = 0.5;
    expression.handshape.movement.speed = 1.0;
    expression.handshape.movement.fluidity = 0.6;

    // Ajuster selon la complexité du contexte
    if (context.complexity > 0.7) {
      // Augmenter la précision pour les expressions complexes
      expression.handshape.movement.fluidity = 0.5;
    } else if (context.structure === 'descriptive') {
      // Augmenter la fluidité pour les descriptions
      expression.handshape.movement.fluidity = 0.7;
    }
  }

  /**
   * Applique le contrôle de timing à l'expression
   * @param expression Expression LSF
   * @param temporalParams Paramètres temporels
   * @param context Contexte syntaxique
   */
  private applyTimingControl(
    expression: LSFExpression,
    temporalParams: TemporalParameters,
    context: SyntacticContext
  ): void {
    // Implémentation du contrôle de timing
    if (!expression.timing) expression.timing = {};

    // Définir une durée de base selon la complexité
    const baseDuration = context.complexity > 0.7 ? 800 : 600;
    expression.timing.duration = baseDuration;

    // Appliquer les paramètres de maintenance
    const maintenanceParams = temporalParams.EMOTION_SYNTAX_TIMING.MAINTENANCE;

    // Définir les phases temporelles (onset, hold, release)
    expression.timing.onset = baseDuration * 0.2; // 20% du temps pour l'apparition
    expression.timing.hold = baseDuration * 0.5;  // 50% du temps pour le maintien
    expression.timing.release = baseDuration * 0.3; // 30% du temps pour la disparition

    // Ajustement selon les stabilités syntaxiques
    if (maintenanceParams.syntactic_stability.core_preservation === 'strict') {
      // Augmenter le temps de maintien pour préserver la structure
      expression.timing.hold = baseDuration * 0.6;
      expression.timing.release = baseDuration * 0.2;
    }

    // Ajustement selon le contexte
    if (context.structure === 'question') {
      // Questions avec timing différent
      expression.timing.hold = baseDuration * 0.4;
      expression.timing.release = baseDuration * 0.4;
    }
  }

  /**
   * Applique le contrôle de transition à l'expression
   * @param expression Expression LSF
   * @param temporalParams Paramètres temporels
   * @param context Contexte syntaxique
   */
  private applyTransitionControl(
    expression: LSFExpression,
    temporalParams: TemporalParameters,
    context: SyntacticContext
  ): void {
    // Implémentation du contrôle de transition
    if (!expression.timing) expression.timing = {};

    // Appliquer les paramètres de transition selon le contexte
    if (context.structure === 'sequence') {
      // Pour les séquences, utiliser la transition SYNTAX_TO_EMOTION
      const transitionParams = temporalParams.TRANSITIONS.SYNTAX_TO_EMOTION;

      // Définir un intervalle de transition
      expression.timing.interval = transitionParams.preserve_meaning.duration[0];

      // Appliquer la méthode d'intégration
      if (transitionParams.integration.method === 'layered') {
        // Logique pour la superposition
        expression.timing.repetition = 0; // Pas de répétition dans les transitions superposées
      }
    } else {
      // Par défaut, utiliser EMOTION_TO_SYNTAX
      const transitionParams = temporalParams.TRANSITIONS.EMOTION_TO_SYNTAX;

      // Définir un délai de transition
      expression.timing.interval = transitionParams.fade_emotion.duration[0];
    }
  }

  /**
   * Applique le contrôle de l'espace de signation à l'expression
   * @param expression Expression LSF
   * @param spatialParams Paramètres spatiaux
   * @param context Contexte syntaxique
   */
  private applySigningSpaceControl(
    expression: LSFExpression,
    spatialParams: ExpansionLimit | Record<string, never>,
    context: SyntacticContext
  ): void {
    // S'assurer que location et coordinates existent toujours
    if (!expression.location) {
      expression.location = { coordinates: { x: 0, y: 0 } };
    }
    if (!expression.location.coordinates) {
      expression.location.coordinates = { x: 0, y: 0 };
    }

    // Définir la zone selon le contexte
    if (context.structure === 'descriptive') {
      expression.location.zone = 'descriptive_space';
    } else if (context.structure === 'reference_point') {
      expression.location.zone = 'referential_space';
      expression.location.reference = 'center_point';
    }

    // Appliquer l'expansion spatiale si disponible
    if ('max' in spatialParams) {
      const expansionFactor = spatialParams.max;
      const coordinates = expression.location.coordinates;

      // Ajuster les coordonnées
      coordinates.x *= expansionFactor;
      coordinates.y *= expansionFactor;
      if (coordinates.z !== undefined) {
        coordinates.z *= expansionFactor;
      }

      // Ajouter la méthode de récupération spatiale
      if ('recovery' in spatialParams) {
        expression.location.recovery = spatialParams.recovery;
      }
    }
  }

  /**
   * Applique le contrôle du maintien des références à l'expression
   * @param expression Expression LSF
   * @param spatialParams Paramètres spatiaux
   * @param context Contexte syntaxique
   */
  private applyReferenceMaintenanceControl(
    expression: LSFExpression,
    spatialParams: ExpansionLimit | Record<string, never>,
    context: SyntacticContext
  ): void {
    // S'assurer que location existe
    if (!expression.location) {
      expression.location = { coordinates: { x: 0, y: 0 } };
    }
    if (!expression.location.coordinates) {
      expression.location.coordinates = { x: 0, y: 0 };
    }

    // Assurer le maintien des références spatiales selon le contexte
    if (context.structure === 'reference_point' || context.structure === 'spatial_agreement') {
      // Définir des points de référence
      expression.location.reference_points = {
        primary: { x: 0, y: 0, z: 0 },
        secondary: []
      };

      // Maintenir les références spatiales même avec l'expansion émotionnelle
      if ('max' in spatialParams && expression.location.coordinates && expression.location.reference_points) {
        // Récupérer le point de référence
        const refPoint = expression.location.reference_points.primary;
        const coordinates = expression.location.coordinates;

        // Calculer la distance au point de référence
        const dx = coordinates.x - refPoint.x;
        const dy = coordinates.y - refPoint.y;
        const dz = coordinates.z !== undefined && refPoint.z !== undefined
          ? coordinates.z - refPoint.z
          : 0;

        // Appliquer l'expansion tout en maintenant les relations spatiales
        const expansionFactor = Math.min(spatialParams.max || 1.0, 1.5); // Limiter l'expansion
        coordinates.x = refPoint.x + dx * expansionFactor;
        coordinates.y = refPoint.y + dy * expansionFactor;
        if (coordinates.z !== undefined && refPoint.z !== undefined) {
          coordinates.z = refPoint.z + dz * expansionFactor;
        }
      }
    }
  }
}