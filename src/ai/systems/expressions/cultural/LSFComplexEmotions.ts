// src/ai/systems/expressions/cultural/LSFComplexEmotions.ts

import {
  LSFExpression,
  EmotionalContext,
  ValidationResult,
  ValidationIssue,
  ComplexValidationResult,
  MicroExpression,
  EmotionalIntegration,
  ComplexEmotionRules,
  EmotionKey,
  MixedEmotionKey,
  MicroExpressionRules
} from '@ai-types/lsf-complex-emotions.types';

/**
 * Classe qui gère les émotions complexes en LSF
 * Fournit des mécanismes pour valider et analyser des expressions émotionnelles complexes
 */
export class LSFComplexEmotions {
  // Règles pour les émotions complexes
  private readonly COMPLEX_EMOTION_RULES: ComplexEmotionRules = {
    // Émotions complexes additionnelles
    EMOTIONS: {
      SURPRISE: {
        PRIMARY_MARKERS: {
          eyebrows: {
            position: 'high_raised',
            inner: 'lifted',
            outer: 'arched',
            tension: 'sudden',
            duration: { min: 200, max: 600 } // ms
          },
          eyes: {
            aperture: 'wide_open',
            focus: 'fixed',
            blinking: 'rapid_initial',
            tension: 'high'
          },
          mouth: {
            shape: 'oval',
            tension: 'moderate',
            jaw: 'dropped',
            corners: 'neutral'
          },
          head: {
            movement: 'quick_back',
            recovery: 'gradual',
            alignment: 'slightly_back'
          }
        },
        VARIATIONS: {
          POSITIVE_SURPRISE: {
            eyes: 'sparkle',
            mouth: 'smile_emerges',
            transition: 'quick_to_joy'
          },
          NEGATIVE_SURPRISE: {
            eyes: 'widen_concern',
            mouth: 'tension_increase',
            transition: 'quick_to_fear'
          },
          NEUTRAL_SURPRISE: {
            recovery: 'complete',
            duration: 'standard'
          }
        }
      },

      FEAR: {
        PRIMARY_MARKERS: {
          eyebrows: {
            position: 'raised_tense',
            inner: 'drawn_up',
            outer: 'raised_flat',
            tension: 'sustained'
          },
          eyes: {
            aperture: 'widened',
            focus: 'scanning',
            whites: 'visible_above',
            blink_rate: 'increased'
          },
          mouth: {
            tension: 'high',
            shape: 'horizontal_stretch',
            corners: 'slightly_down',
            lips: 'pressed'
          },
          head: {
            position: 'pulled_back',
            movement: 'restricted',
            protection: 'active'
          }
        },
        VARIATIONS: {
          IMMEDIATE_THREAT: {
            movement: 'freeze',
            breathing: 'shallow',
            tension: 'extreme'
          },
          ANTICIPATED_THREAT: {
            scanning: 'active',
            preparation: 'ready',
            tension: 'building'
          },
          RESIDUAL_FEAR: {
            alertness: 'heightened',
            recovery: 'gradual',
            tension: 'waves'
          }
        }
      },

      DISGUST: {
        PRIMARY_MARKERS: {
          nose: {
            wrinkle: 'pronounced',
            flare: 'slight',
            tension: 'focused'
          },
          mouth: {
            corners: 'down_pulled',
            upper_lip: 'raised',
            lower_lip: 'pushed',
            tension: 'asymmetric'
          },
          cheeks: {
            raise: 'pronounced',
            tension: 'bunched',
            side: 'dominant_side'
          },
          head: {
            turn: 'away_slight',
            tilt: 'back_slight',
            distance: 'increased'
          }
        },
        VARIATIONS: {
          PHYSICAL_DISGUST: {
            bodily_response: 'strong',
            duration: 'brief_intense'
          },
          MORAL_DISGUST: {
            expression: 'controlled',
            duration: 'sustained'
          },
          SOCIAL_DISGUST: {
            distancing: 'marked',
            gaze: 'avoidant'
          }
        }
      }
    },

    // Micro-expressions spécifiques à la LSF
    MICRO_EXPRESSIONS: {
      // Marqueurs grammaticaux subtils
      GRAMMATICAL: {
        TOPIC_MARKING: {
          eyebrow_flash: {
            duration: [60, 120], // ms
            intensity: 'subtle_to_moderate',
            synchronization: 'pre_sign'
          },
          eye_widening: {
            duration: [80, 150],
            intensity: 'minimal',
            timing: 'with_eyebrows'
          }
        },
        ROLE_SHIFT: {
          gaze_break: {
            duration: [40, 100],
            intensity: 'clear_but_brief',
            direction: 'character_dependent'
          },
          head_tilt: {
            duration: [100, 200],
            range: 'minimal_to_moderate',
            return: 'smooth'
          }
        }
      },

      // Marqueurs de modalité
      MODALITY: {
        CERTAINTY: {
          eye_squint: {
            duration: [150, 300],
            intensity: 'moderate',
            synchronization: 'with_sign'
          },
          head_nod: {
            duration: [100, 200],
            range: 'minimal',
            repetition: 'single'
          }
        },
        DOUBT: {
          mouth_corner: {
            duration: [120, 250],
            movement: 'slight_asymmetric',
            side: 'dominant_hand'
          },
          eyebrow_raise: {
            duration: [100, 180],
            side: 'single',
            intensity: 'subtle'
          }
        }
      },

      // Marqueurs de feedback
      FEEDBACK: {
        COMPREHENSION: {
          eye_contact: {
            duration: [300, 500],
            quality: 'engaged',
            break_pattern: 'smooth'
          },
          head_tilt: {
            duration: [200, 400],
            angle: 'minimal',
            direction: 'towards_signer'
          }
        },
        CONFUSION: {
          brow_furrow: {
            duration: [150, 300],
            intensity: 'subtle_building',
            release: 'gradual'
          },
          eye_movement: {
            pattern: 'brief_search',
            duration: [200, 400],
            return: 'to_signer'
          }
        }
      }
    },

    // Émotions mixtes et transitions complexes
    MIXED_EMOTIONS: {
      JOY_SADNESS: {
        // Nostalgie, mélancolie heureuse
        COMPONENTS: {
          primary: 'JOY',
          secondary: 'SADNESS',
          balance: 0.6, // 60% joie, 40% tristesse
          integration: 'layered'
        },
        EXPRESSION: {
          eyes: {
            brightness: 'warm',
            moisture: 'slight',
            focus: 'soft_distant'
          },
          mouth: {
            smile: 'gentle',
            corners: 'slightly_lifted',
            tension: 'minimal'
          },
          timing: {
            development: 'gradual',
            maintenance: 'sustained',
            dissolution: 'slow'
          }
        }
      },

      ANGER_FEAR: {
        // Frustration, colère défensive
        COMPONENTS: {
          primary: 'ANGER',
          secondary: 'FEAR',
          balance: 0.7,
          integration: 'alternating'
        },
        EXPRESSION: {
          eyebrows: {
            inner: 'down_tense',
            outer: 'raised_guard'
          },
          eyes: {
            gaze: 'intense_scanning',
            aperture: 'widened_threat'
          },
          body: {
            tension: 'high_protective',
            movement: 'restricted_ready'
          }
        }
      },

      SURPRISE_DISGUST: {
        // Choc moral, répulsion inattendue
        COMPONENTS: {
          primary: 'SURPRISE',
          secondary: 'DISGUST',
          balance: 0.5,
          integration: 'sequential'
        },
        EXPRESSION: {
          sequence: [
            {
              type: 'SURPRISE',
              duration: 300,
              intensity: 'high'
            },
            {
              type: 'TRANSITION',
              duration: 150,
              characteristics: 'rapid_shift'
            },
            {
              type: 'DISGUST',
              duration: 600,
              intensity: 'building'
            }
          ]
        }
      }
    }
  };

  /**
   * Valide une expression émotionnelle complexe
   * @param expression L'expression LSF à valider
   * @param emotionType Le type d'émotion complexe
   * @param context Le contexte émotionnel et culturel
   * @returns Un résultat détaillé de validation
   */
  async validateComplexExpression(
    expression: LSFExpression,
    emotionType: string,
    context: EmotionalContext
  ): Promise<ComplexValidationResult> {
    const validations = await Promise.all([
      this.validatePrimaryEmotion(expression, emotionType),
      this.validateMicroExpressions(expression),
      this.validateEmotionalMixture(expression, emotionType),
      this.validateCulturalAuthenticity(expression, context)
    ]);

    return this.aggregateValidationResults(validations);
  }

  /**
   * Valide l'émotion primaire dans une expression complexe
   * @param expression L'expression LSF à valider
   * @param emotionType Le type d'émotion
   * @returns Résultat de validation pour l'émotion primaire
   */
  private async validatePrimaryEmotion(
    expression: LSFExpression,
    emotionType: string
  ): Promise<ValidationResult> {
    // Si c'est une émotion mixte, extraire la primaire
    const primaryEmotion = emotionType.includes('_')
      ? emotionType.split('_')[0]
      : emotionType;

    // Vérifier si l'émotion est supportée
    if (!(primaryEmotion in this.COMPLEX_EMOTION_RULES.EMOTIONS)) {
      return {
        isValid: false,
        issues: [{
          type: 'UNSUPPORTED_EMOTION',
          severity: 'CRITICAL',
          message: `Émotion "${primaryEmotion}" non supportée`
        }],
        score: 0
      };
    }

    const primaryEmotionKey = primaryEmotion as EmotionKey;
    const emotionRules = this.COMPLEX_EMOTION_RULES.EMOTIONS[primaryEmotionKey];

    // Vérifier les marqueurs primaires
    const issues: ValidationIssue[] = [];
    const markers = emotionRules.PRIMARY_MARKERS;
    let markerScore = 1.0;

    // Vérifier les sourcils si présents
    if ('eyebrows' in markers && expression.facialComponents?.eyebrows) {
      const eyebrowMatch = this.compareFacialComponent(
        expression.facialComponents.eyebrows,
        markers.eyebrows as Record<string, unknown>
      );
      if (eyebrowMatch < 0.7) {
        markerScore *= eyebrowMatch;
        issues.push({
          type: 'EYEBROW_MISMATCH',
          severity: 'MEDIUM',
          message: 'Les sourcils ne correspondent pas à l\'émotion primaire'
        });
      }
    }

    // Vérifier d'autres composants si nécessaire
    // ...

    return {
      isValid: markerScore >= 0.75,
      issues,
      score: markerScore
    };
  }

  /**
   * Compare un composant facial à un marqueur de référence
   * @param component Le composant facial de l'expression
   * @param marker Le marqueur de référence
   * @returns Un score de correspondance entre 0 et 1
   */
  private compareFacialComponent(
    component: Record<string, unknown>,
    marker: Record<string, unknown>
  ): number {
    // Compter les propriétés correspondantes
    let matches = 0;
    let total = 0;

    // Pour chaque propriété dans le marqueur de référence
    for (const [key, value] of Object.entries(marker)) {
      if (key in component && component[key] === value) {
        matches++;
      }
      total++;
    }

    return total === 0 ? 1.0 : matches / total;
  }

  /**
   * Valide les micro-expressions dans une expression LSF
   * @param expression L'expression LSF à valider
   * @returns Résultat de validation pour les micro-expressions
   */
  private async validateMicroExpressions(
    expression: LSFExpression
  ): Promise<ValidationResult> {
    const microExpressions = await this.detectMicroExpressions(expression);
    const issues: ValidationIssue[] = [];

    // Vérifier chaque type de micro-expression
    for (const micro of microExpressions) {
      const validationResult = await this.validateMicroExpression(
        micro,
        this.COMPLEX_EMOTION_RULES.MICRO_EXPRESSIONS
      );

      if (!validationResult.isValid) {
        issues.push(...validationResult.issues);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateMicroExpressionScore(microExpressions, issues)
    };
  }

  /**
   * Détecte les micro-expressions présentes dans une expression LSF
   * @param expression L'expression LSF à analyser
   * @returns Liste des micro-expressions détectées
   */
  private async detectMicroExpressions(
    expression: LSFExpression
  ): Promise<MicroExpression[]> {
    // Implémentation réelle: analyserait l'expression pour détecter les micro-expressions
    // En attendant la vraie implémentation, on retourne un exemple de micro-expression

    // Utiliser les données réelles d'expression pour la détection
    const hasEyebrowMovement = Boolean(expression.facialComponents?.eyebrows);
    const hasEyeMovement = Boolean(expression.facialComponents?.eyes);

    const microExpressions: MicroExpression[] = [];

    if (hasEyebrowMovement && hasEyeMovement) {
      microExpressions.push({
        type: 'GRAMMATICAL.TOPIC_MARKING',
        duration: 90,
        intensity: 0.7,
        timing: {
          start: 100,
          end: 190
        },
        components: {
          eyebrow_flash: true,
          eye_widening: true
        }
      });
    }

    return microExpressions;
  }

  /**
   * Valide une micro-expression spécifique
   * @param micro La micro-expression à valider
   * @param rules Les règles de validation
   * @returns Résultat de validation pour la micro-expression
   */
  private async validateMicroExpression(
    micro: MicroExpression,
    rules: MicroExpressionRules
  ): Promise<ValidationResult> {
    // Implémentation réelle: validerait une micro-expression spécifique
    // en la comparant aux règles établies

    const issues: ValidationIssue[] = [];
    let score = 0.9; // Score par défaut

    // Vérifier le type de micro-expression
    const microType = micro.type.split('.');
    if (microType.length !== 2 ||
      !(microType[0] in rules) ||
      !(microType[1] in (rules as unknown as Record<string, Record<string, unknown>>)[microType[0]])) {
      issues.push({
        type: 'UNKNOWN_MICRO_EXPRESSION',
        severity: 'MEDIUM',
        message: `Type de micro-expression inconnu: ${micro.type}`
      });
      score -= 0.3;
    }

    // Vérifier la durée
    if (micro.duration < 40 || micro.duration > 500) {
      issues.push({
        type: 'DURATION_OUT_OF_RANGE',
        severity: 'LOW',
        message: 'Durée de micro-expression hors plage normale'
      });
      score -= 0.1;
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  /**
   * Calcule un score pour les micro-expressions
   * @param microExpressions Les micro-expressions détectées
   * @param issues Les problèmes identifiés
   * @returns Un score entre 0 et 1
   */
  private calculateMicroExpressionScore(
    microExpressions: MicroExpression[],
    issues: ValidationIssue[]
  ): number {
    if (microExpressions.length === 0) return 0.5;
    if (issues.length === 0) return 1.0;

    // Calculer un score basé sur le ratio des problèmes par rapport aux expressions
    return Math.max(0.1, 1 - (issues.length / (microExpressions.length * 2)));
  }

  /**
   * Valide un mélange émotionnel
   * @param expression L'expression LSF à valider
   * @param emotionType Le type d'émotion mixte
   * @returns Résultat de validation pour le mélange émotionnel
   */
  private async validateEmotionalMixture(
    expression: LSFExpression,
    emotionType: string
  ): Promise<ValidationResult> {
    if (!emotionType.includes('_')) {
      return { isValid: true, issues: [], score: 1 };
    }

    // Récupérer les composantes de l'émotion mixte
    const emotionParts = emotionType.split('_');
    const primaryEmotion = emotionParts[0];
    const secondaryEmotion = emotionParts[1];
    const issues: ValidationIssue[] = [];

    // Vérifier si le type d'émotion mixte est supporté
    if (!(emotionType in this.COMPLEX_EMOTION_RULES.MIXED_EMOTIONS)) {
      return {
        isValid: false,
        issues: [{
          type: 'UNSUPPORTED_MIXED_EMOTION',
          severity: 'HIGH',
          message: `Le mélange émotionnel "${primaryEmotion}-${secondaryEmotion}" n'est pas supporté`
        }],
        score: 0
      };
    }

    // Récupérer les règles pour cette émotion mixte
    const mixtureKey = emotionType as MixedEmotionKey;
    const mixtureRules = this.COMPLEX_EMOTION_RULES.MIXED_EMOTIONS[mixtureKey];

    // Vérifier l'équilibre des émotions
    const balance = await this.analyzeEmotionalBalance(expression);
    if (Math.abs(balance - mixtureRules.COMPONENTS.balance) > 0.2) {
      issues.push({
        type: 'EMOTIONAL_BALANCE',
        severity: 'MEDIUM',
        message: 'L\'équilibre émotionnel ne correspond pas aux attentes culturelles',
        details: { expected: mixtureRules.COMPONENTS.balance, actual: balance }
      });
    }

    // Vérifier l'intégration des émotions
    const integration = await this.analyzeEmotionalIntegration(expression);
    if (integration.type !== mixtureRules.COMPONENTS.integration) {
      issues.push({
        type: 'EMOTIONAL_INTEGRATION',
        severity: 'HIGH',
        message: 'Le modèle d\'intégration émotionnelle est culturellement inapproprié',
        details: {
          expected: mixtureRules.COMPONENTS.integration,
          actual: integration.type
        }
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateMixtureScore(issues)
    };
  }

  /**
   * Analyse l'équilibre entre les émotions dans une expression
   * @param expression L'expression LSF à analyser
   * @returns Une valeur entre 0 et 1 représentant la proportion de l'émotion primaire
   */
  private async analyzeEmotionalBalance(
    expression: LSFExpression
  ): Promise<number> {
    // Implémentation réelle: analyserait les composantes de l'expression pour 
    // déterminer l'équilibre entre émotions primaires et secondaires

    // Utiliser les données réelles pour l'analyse
    // Note: intensity n'est pas dans l'interface, nous créons une analyse basée sur d'autres propriétés
    const hasStrongPrimaryMarkers = Boolean(expression.emotion);

    // Estimation simple basée sur ce qui est disponible
    if (expression.intensity) {
      return expression.intensity * 0.9; // Simplification
    }

    // Valeur par défaut si pas assez d'information
    return hasStrongPrimaryMarkers ? 0.65 : 0.5;
  }

  /**
   * Analyse l'intégration des émotions
   * @param expression L'expression LSF à analyser
   * @returns Information sur le type d'intégration émotionnelle
   */
  private async analyzeEmotionalIntegration(
    expression: LSFExpression
  ): Promise<EmotionalIntegration> {
    // Implémentation réelle: déterminerait le type d'intégration des émotions
    // (séquentielle, alternée, superposée, etc.)

    // Analyser les données temporelles pour déterminer le type d'intégration
    const hasSequentialPattern = Boolean(expression.timing?.sequence && expression.timing.sequence.length > 0);
    const hasMultipleTransitions = Boolean(expression.timing?.sequence &&
      expression.timing.sequence.filter(s => s.type === 'TRANSITION').length > 0);

    let integrationType: 'layered' | 'alternating' | 'sequential' | 'blended' | 'conflicting';
    let quality = 0.8;

    if (hasSequentialPattern && hasMultipleTransitions) {
      integrationType = 'sequential';
    } else if (hasSequentialPattern) {
      integrationType = 'blended';
    } else if (expression.intensity && expression.intensity > 0.8) {
      integrationType = 'layered';
    } else {
      // Par défaut, si pas assez d'informations
      integrationType = 'alternating';
      quality = 0.6; // Moins de confiance
    }

    return {
      type: integrationType,
      quality
    };
  }

  /**
   * Calcule un score pour un mélange émotionnel
   * @param issues Les problèmes identifiés
   * @returns Un score entre 0 et 1
   */
  private calculateMixtureScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) return 1.0;

    // Calculer un score basé sur le nombre et la sévérité des problèmes
    let penaltyPoints = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'LOW': penaltyPoints += 0.1; break;
        case 'MEDIUM': penaltyPoints += 0.2; break;
        case 'HIGH': penaltyPoints += 0.3; break;
        case 'CRITICAL': penaltyPoints += 0.5; break;
      }
    }

    return Math.max(0, Math.min(1, 1 - penaltyPoints));
  }

  /**
   * Valide l'authenticité culturelle d'une expression
   * @param expression L'expression LSF à valider
   * @param context Le contexte culturel
   * @returns Résultat de validation pour l'authenticité culturelle
   */
  private async validateCulturalAuthenticity(
    expression: LSFExpression,
    context: EmotionalContext
  ): Promise<ValidationResult> {
    // Implémentation réelle: validerait l'expression en fonction du contexte culturel

    const issues: ValidationIssue[] = [];
    let score = 0.9; // Score par défaut

    // Vérifier la correspondance culturelle
    if (context.culturalBackground && expression.culturalContext) {
      const contextMatch = context.culturalBackground === expression.culturalContext;

      if (!contextMatch) {
        issues.push({
          type: 'CULTURAL_MISMATCH',
          severity: 'MEDIUM',
          message: 'Expression culturellement inappropriée dans ce contexte',
          details: {
            expected: context.culturalBackground,
            actual: expression.culturalContext
          }
        });
        score -= 0.2;
      }
    }

    // Vérifier les spécificités régionales si applicable
    if (context.region && expression.culturalContext) {
      const variantMatch = context.region.includes(expression.culturalContext);

      if (!variantMatch) {
        issues.push({
          type: 'REGIONAL_VARIANT_MISMATCH',
          severity: 'LOW',
          message: 'Variante régionale potentiellement inappropriée'
        });
        score -= 0.1;
      }
    }

    return {
      isValid: score >= 0.7,
      issues,
      score
    };
  }

  /**
   * Agrège les résultats de validation en un résultat unique
   * @param validations Les différentes validations à agréger
   * @returns Un résultat de validation agrégé
   */
  private aggregateValidationResults(
    validations: ValidationResult[]
  ): ComplexValidationResult {
    // Extraire les scores individuels
    const primaryEmotionScore = validations[0].score;
    const microExpressionsScore = validations[1].score;
    const emotionalMixtureScore = validations[2].score;
    const culturalAuthenticityScore = validations[3].score;

    // Agréger les issues
    const allIssues: ValidationIssue[] = [];
    for (const validation of validations) {
      allIssues.push(...validation.issues);
    }

    // Calculer un score global pondéré
    const globalScore = (
      (primaryEmotionScore * 0.3) +
      (microExpressionsScore * 0.25) +
      (emotionalMixtureScore * 0.25) +
      (culturalAuthenticityScore * 0.2)
    );

    // Déterminer la validité globale
    const isValid = globalScore >= 0.75 && !allIssues.some(i => i.severity === 'CRITICAL');

    return {
      isValid,
      score: globalScore,
      issues: allIssues,
      components: {
        primaryEmotionScore,
        microExpressionsScore,
        emotionalMixtureScore,
        culturalAuthenticityScore
      },
      details: {
        microExpressions: this.extractMicroExpressionsFromValidations(),
        emotionalBalance: this.extractEmotionalBalanceFromIssues(allIssues),
        integrationPattern: this.extractIntegrationPatternFromIssues(allIssues)
      }
    };
  }

  /**
   * Extrait les micro-expressions des résultats de validation
   * @returns Liste des micro-expressions
   */
  private extractMicroExpressionsFromValidations(): MicroExpression[] {
    // Dans une implémentation réelle, cela extrairait les micro-expressions
    // des données de validation
    return [];
  }

  /**
   * Extrait l'équilibre émotionnel des problèmes de validation
   * @param issues Les problèmes identifiés
   * @returns Valeur d'équilibre émotionnel
   */
  private extractEmotionalBalanceFromIssues(
    issues: ValidationIssue[]
  ): number | undefined {
    // Dans une implémentation réelle, cela extrairait l'équilibre émotionnel
    // des données de validation

    // Vérifier si nous avons des détails dans les issues
    const balanceIssue = issues.find(issue => issue.type === 'EMOTIONAL_BALANCE');

    if (balanceIssue && balanceIssue.details && 'actual' in balanceIssue.details) {
      return balanceIssue.details.actual as number;
    }

    // Valeur standard si pas d'information précise
    return undefined;
  }

  /**
   * Extrait le modèle d'intégration des problèmes de validation
   * @param issues Les problèmes identifiés
   * @returns Type d'intégration émotionnelle
   */
  private extractIntegrationPatternFromIssues(
    issues: ValidationIssue[]
  ): string | undefined {
    // Dans une implémentation réelle, cela extrairait le modèle d'intégration
    // des données de validation

    // Vérifier si nous avons des détails dans les issues
    const integrationIssue = issues.find(issue => issue.type === 'EMOTIONAL_INTEGRATION');

    if (integrationIssue && integrationIssue.details && 'actual' in integrationIssue.details) {
      return integrationIssue.details.actual as string;
    }

    // Valeur standard si pas d'information précise
    return undefined;
  }
}