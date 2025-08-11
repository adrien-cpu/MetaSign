// src/ai/systems/expressions/cultural/LSFCulturalRules.ts
export class LSFCulturalRules {
  // Règles détaillées pour les expressions émotionnelles en LSF
  private readonly EMOTIONAL_EXPRESSION_RULES = {
    // Intensités émotionnelles selon le contexte
    INTENSITY_MODULATION: {
      FORMAL: {
        maxIntensity: 0.7,
        preferredRange: [0.3, 0.6],
        transitionSpeed: 'moderate',
        requiresModeration: true
      },
      CASUAL: {
        maxIntensity: 0.9,
        preferredRange: [0.4, 0.8],
        transitionSpeed: 'natural',
        requiresModeration: false
      },
      INTIMATE: {
        maxIntensity: 1.0,
        preferredRange: [0.5, 1.0],
        transitionSpeed: 'expressive',
        requiresModeration: false
      }
    },

    // Expressions spécifiques des émotions
    EMOTION_SPECIFICS: {
      JOY: {
        PRIMARY_MARKERS: {
          eyes: {
            squint: [0.3, 0.5],
            aperture: 'narrowed',
            wrinkles: 'pronounced'
          },
          mouth: {
            corners: 'upward',
            tension: 'moderate',
            teeth: 'may_show'
          },
          cheeks: {
            raise: 'pronounced',
            tension: 'high'
          },
          eyebrows: {
            outer: 'slightly_raised',
            inner: 'neutral'
          }
        },
        INTENSITY_MARKERS: {
          LOW: {
            mouth: 'slight_smile',
            eyes: 'minimal_squint',
            duration: 'sustained'
          },
          MEDIUM: {
            mouth: 'clear_smile',
            eyes: 'moderate_squint',
            duration: 'dynamic'
          },
          HIGH: {
            mouth: 'broad_smile',
            eyes: 'pronounced_squint',
            duration: 'expressive'
          }
        }
      },

      SADNESS: {
        PRIMARY_MARKERS: {
          eyes: {
            aperture: 'slightly_narrowed',
            gaze: 'downward',
            tension: 'low'
          },
          mouth: {
            corners: 'downward',
            tension: 'low',
            movement: 'minimal'
          },
          eyebrows: {
            inner: 'raised_and_drawn',
            outer: 'slightly_lowered'
          },
          head: {
            tilt: 'slight_down',
            movement: 'slow'
          }
        },
        INTENSITY_MARKERS: {
          LOW: {
            eyes: 'slight_downward',
            mouth: 'subtle_downturn',
            movement: 'controlled'
          },
          MEDIUM: {
            eyes: 'clear_downward',
            mouth: 'marked_downturn',
            movement: 'deliberate'
          },
          HIGH: {
            eyes: 'strong_downward',
            mouth: 'pronounced_downturn',
            movement: 'heavy'
          }
        }
      },

      ANGER: {
        PRIMARY_MARKERS: {
          eyebrows: {
            position: 'lowered',
            tension: 'high',
            inner: 'drawn_together'
          },
          eyes: {
            aperture: 'narrowed',
            gaze: 'intense_direct',
            tension: 'very_high'
          },
          mouth: {
            tension: 'very_high',
            corners: 'neutral_to_down',
            movement: 'controlled'
          },
          head: {
            position: 'forward',
            movement: 'sharp'
          }
        },
        INTENSITY_MARKERS: {
          LOW: {
            tension: 'contained',
            movement: 'controlled',
            gaze: 'firm'
          },
          MEDIUM: {
            tension: 'evident',
            movement: 'emphatic',
            gaze: 'intense'
          },
          HIGH: {
            tension: 'extreme',
            movement: 'forceful',
            gaze: 'piercing'
          }
        }
      }
    },

    // Règles de combinaison émotions-expressions grammaticales
    EMOTION_GRAMMAR_FUSION: {
      QUESTION_YES_NO: {
        JOY: {
          sequence: ['eyebrows_up', 'joy_expression'],
          timing: { gap: 100 }, // ms
          dominance: 'grammar'
        },
        SADNESS: {
          sequence: ['eyebrows_up', 'sadness_partial'],
          timing: { gap: 150 },
          dominance: 'emotion'
        },
        ANGER: {
          sequence: ['eyebrows_up', 'anger_contained'],
          timing: { gap: 200 },
          dominance: 'balanced'
        }
      },
      NEGATION: {
        JOY: {
          sequence: ['head_shake', 'joy_maintained'],
          timing: { overlap: 0.8 },
          dominance: 'balanced'
        },
        SADNESS: {
          sequence: ['head_shake', 'sadness_enhanced'],
          timing: { overlap: 1.0 },
          dominance: 'emotion'
        },
        ANGER: {
          sequence: ['head_shake_emphatic', 'anger_integrated'],
          timing: { overlap: 0.9 },
          dominance: 'emotion'
        }
      }
    },

    // Règles de transition émotionnelle
    EMOTION_TRANSITIONS: {
      JOY_TO_SADNESS: {
        sequence: ['release_smile', 'pause', 'lower_corners'],
        timing: [200, 100, 300], // ms
        required_elements: ['eye_change', 'brow_shift']
      },
      SADNESS_TO_ANGER: {
        sequence: ['tense_face', 'brow_lower', 'intensify_gaze'],
        timing: [150, 200, 250],
        required_elements: ['head_shift', 'eye_narrow']
      },
      ANGER_TO_JOY: {
        sequence: ['release_tension', 'lift_corners', 'soften_gaze'],
        timing: [250, 200, 200],
        required_elements: ['brow_release', 'cheek_rise']
      }
    },

    // Règles de maintien émotionnel
    EMOTION_MAINTENANCE: {
      SUSTAINED_EMOTIONS: {
        minimum_duration: 800, // ms
        intensity_variation: 0.2,
        required_consistency: ['gaze', 'facial_tension']
      },
      PULSED_EMOTIONS: {
        pulse_duration: 300,
        rest_duration: 200,
        intensity_drop: 0.3
      }
    },

    // Variations culturelles régionales
    REGIONAL_VARIATIONS: {
      PARIS: {
        expression_speed: 1.0,
        intensity_bias: 'moderate',
        preferred_transitions: 'smooth'
      },
      TOULOUSE: {
        expression_speed: 1.2,
        intensity_bias: 'enhanced',
        preferred_transitions: 'dynamic'
      },
      MARSEILLE: {
        expression_speed: 1.1,
        intensity_bias: 'expressive',
        preferred_transitions: 'emphatic'
      }
    }
  };

  // Validation des règles émotionnelles
  async validateEmotionalExpression(
    expression: LSFExpression,
    emotionType: string,
    context: EmotionalContext
  ): Promise<ValidationResult> {
    // Vérifier le respect des règles d'intensité
    const intensityValidation = this.validateIntensity(
      expression,
      context.formality,
      emotionType
    );

    // Vérifier les marqueurs primaires de l'émotion
    const markerValidation = this.validateEmotionMarkers(
      expression,
      emotionType
    );

    // Vérifier les transitions émotionnelles
    const transitionValidation = this.validateEmotionTransitions(
      expression,
      emotionType,
      context
    );

    // Agréger les résultats
    return {
      isValid: intensityValidation.isValid && 
               markerValidation.isValid && 
               transitionValidation.isValid,
      issues: [
        ...intensityValidation.issues,
        ...markerValidation.issues,
        ...transitionValidation.issues
      ],
      metadata: {
        intensityScore: intensityValidation.score,
        markerScore: markerValidation.score,
        transitionScore: transitionValidation.score,
        overallScore: this.calculateOverallScore([
          intensityValidation,
          markerValidation,
          transitionValidation
        ])
      }
    };
  }

  // Validation d'une transition émotionnelle
  async validateEmotionalTransition(
    fromEmotion: string,
    toEmotion: string,
    transition: EmotionalTransition
  ): Promise<TransitionValidation> {
    const transitionKey = `${fromEmotion}_TO_${toEmotion}`;
    const rules = this.EMOTIONAL_EXPRESSION_RULES.EMOTION_TRANSITIONS[transitionKey];

    if (!rules) {
      return {
        isValid: false,
        issues: [{
          type: 'UNKNOWN_TRANSITION',
          severity: 'HIGH',
          message: `No defined rules for transition ${transitionKey}`
        }]
      };
    }

    const sequenceValidation = this.validateTransitionSequence(
      transition,
      rules
    );

    const timingValidation = this.validateTransitionTiming(
      transition,
      rules
    );

    const elementsValidation = this.validateRequiredElements(
      transition,
      rules
    );

    return {
      isValid: sequenceValidation.isValid && 
               timingValidation.isValid && 
               elementsValidation.isValid,
      issues: [
        ...sequenceValidation.issues,
        ...timingValidation.issues,
        ...elementsValidation.issues
      ],
      metadata: {
        sequenceScore: sequenceValidation.score,
        timingScore: timingValidation.score,
        elementsScore: elementsValidation.score
      }
    };
  }
}

// Types
interface EmotionalContext {
  formality: 'FORMAL' | 'CASUAL' | 'INTIMATE';
  intensity: number;
  culturalBackground?: string;
  region?: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  metadata?: {
    [key: string]: number;
  };
}

interface EmotionalTransition {
  sequence: string[];
  timing: number[];
  elements: string[];
}

interface TransitionValidation extends ValidationResult {
  metadata: {
    sequenceScore: number;
    timingScore: number;
    elementsScore: number;
  };
}