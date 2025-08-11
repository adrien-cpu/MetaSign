// src/ai/systems/expressions/lsf/LSFGrammarSystem.ts
import { LSFGrammarRules, GrammarRule } from '../grammar/LSFGrammarRules';

// Types et interfaces

/**
 * Interface représentant le contexte grammatical en LSF
 */
export interface LSFGrammaticalContext {
  /** L'intention communicati// Suppression de la référence à v qui n'existe pase */
  intent: string;
  /** Les modificateurs optionnels d'expression */
  modifiers?: ExpressionModifier[];
}

/**
 * Les différents types de modificateurs d'expression
 */
export type ModifierType = 'INTENSITY' | 'EMPHASIS' | 'DURATION';

/**
 * Interface pour un modificateur d'expression
 */
export interface ExpressionModifier {
  /** Type de modificateur */
  type: ModifierType;
  /** Valeur du modificateur */
  value: number;
}

/**
 * Interface pour une propriété des sourcils
 */
export interface EyebrowsProperties {
  /** Intensité du mouvement des sourcils (de -1 à 1) */
  intensity: number;
  /** Propriétés additionnelles spécifiques aux sourcils */
  [key: string]: unknown;
}

/**
 * Interface pour une propriété de la tête
 */
export interface HeadProperties {
  /** Mouvement avant/arrière de la tête (de -1 à 1) */
  forward: number | boolean;
  /** Inclinaison de la tête (de -1 à 1) */
  tilt: number;
  /** Propriétés additionnelles spécifiques à la tête */
  [key: string]: unknown;
}

/**
 * Interface pour une propriété de la bouche
 */
export interface MouthProperties {
  /** Indique si la bouche est fermée */
  closed?: boolean | undefined;
  /** Forme de la bouche (ex: "oval", "round", etc.) */
  shape?: string | undefined;
  /** Intensité du mouvement de la bouche (de -1 à 1) */
  intensity?: number | undefined;
  /** Propriétés additionnelles spécifiques à la bouche */
  [key: string]: unknown;
}

/**
 * Interface pour les propriétés de timing
 */
export interface TimingProperties {
  /** Durée relative de l'expression */
  duration: number;
  /** Type d'accélération/décélération */
  easing: string;
}

/**
 * Interface pour une expression LSF complète
 */
export interface LSFExpression {
  /** Propriétés des sourcils */
  eyebrows: EyebrowsProperties;
  /** Propriétés de la tête */
  head: HeadProperties;
  /** Propriétés de la bouche */
  mouth: MouthProperties;
  /** Propriétés de timing (optionnel) */
  timing?: TimingProperties;
}

/**
 * Interface pour un problème de validation
 */
export interface ValidationIssue {
  /** Composant concerné par le problème */
  component: string;
  /** Message décrivant le problème */
  message: string;
  /** Sévérité du problème */
  severity: 'warning' | 'error';
}

/**
 * Interface pour le résultat d'une validation
 */
export interface ValidationResult {
  /** Indique si la validation est réussie */
  isValid: boolean;
  /** Liste des problèmes rencontrés */
  issues: ValidationIssue[];
}

/**
 * Classe d'erreur spécifique pour les erreurs grammaticales LSF
 */
export class LSFGrammarError extends Error {
  /**
   * Crée une nouvelle instance d'erreur grammaticale LSF
   * @param message Message d'erreur
   * @param context Contexte associé à l'erreur
   */
  constructor(message: string, public context: unknown) {
    super(message);
    this.name = 'LSFGrammarError';
  }
}

/**
 * Système de gestion de la grammaire LSF
 * Gère les règles grammaticales, la validation et la génération d'expressions
 */
export class LSFGrammarSystem {
  /** Gestionnaire des règles grammaticales */
  private grammarRules: LSFGrammarRules;

  /**
   * Initialise un nouveau système de grammaire LSF
   */
  constructor() {
    this.grammarRules = new LSFGrammarRules();
  }

  /**
   * Génère une expression LSF basée sur un contexte grammatical
   * @param grammaticalContext Le contexte grammatical
   * @returns Une expression LSF
   * @throws LSFGrammarError si la génération échoue
   */
  async generateExpressionForGrammar(
    grammaticalContext: LSFGrammaticalContext
  ): Promise<LSFExpression> {
    try {
      // Obtenir la règle de base
      const baseRule = this.grammarRules.getRule(grammaticalContext.intent);

      // Appliquer les modifications contextuelles
      const modifiedExpression = this.applyContextModifiers(
        baseRule,
        grammaticalContext.modifiers
      );

      // Valider l'expression résultante
      await this.validateGrammaticalExpression(modifiedExpression);

      return modifiedExpression;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);

      throw new LSFGrammarError(
        `Failed to generate expression: ${errorMessage}`,
        grammaticalContext
      );
    }
  }

  /**
   * Applique des modificateurs contextuels à une règle grammaticale de base
   * @param baseRule La règle grammaticale de base
   * @param modifiers Les modificateurs à appliquer
   * @returns L'expression LSF modifiée
   */
  private applyContextModifiers(
    baseRule: GrammarRule,
    modifiers?: ExpressionModifier[]
  ): LSFExpression {
    let expression: LSFExpression = {
      eyebrows: { ...baseRule.eyebrowPattern },
      head: { ...baseRule.headMovement },
      mouth: { ...baseRule.mouthPattern }
    };

    if (!modifiers) return expression;

    modifiers.forEach(modifier => {
      switch (modifier.type) {
        case 'INTENSITY':
          expression = this.modifyIntensity(expression, modifier.value);
          break;
        case 'EMPHASIS':
          expression = this.addEmphasis(expression, modifier.value);
          break;
        case 'DURATION':
          expression = this.adjustDuration(expression, modifier.value);
          break;
      }
    });

    return expression;
  }

  /**
   * Modifie l'intensité d'une expression
   * @param expression L'expression à modifier
   * @param intensityFactor Le facteur d'intensité à appliquer
   * @returns L'expression modifiée
   */
  /**
   * Modifie l'intensité d'une expression
   * @param expression L'expression à modifier
   * @param intensityFactor Le facteur d'intensité à appliquer
   * @returns L'expression modifiée
   */
  private modifyIntensity(
    expression: LSFExpression,
    intensityFactor: number
  ): LSFExpression {
    // Convertir forward en nombre si c'est un booléen
    const forwardValue = typeof expression.head.forward === 'boolean'
      ? (expression.head.forward ? 1 : 0)
      : expression.head.forward;

    // Créer un nouvel objet de bouche en manipulant les props de façon sûre
    const newMouth: MouthProperties = { ...expression.mouth };

    // Modifier intensity si elle existe
    if (expression.mouth.intensity !== undefined) {
      newMouth.intensity = Math.min(1, expression.mouth.intensity * intensityFactor);
    }

    return {
      eyebrows: {
        ...expression.eyebrows,
        intensity: Math.min(1, expression.eyebrows.intensity * intensityFactor)
      },
      head: {
        ...expression.head,
        forward: forwardValue * intensityFactor,
        tilt: expression.head.tilt * intensityFactor
      },
      mouth: newMouth
    };
  }

  /**
   * Ajoute de l'emphase à une expression
   * @param expression L'expression à modifier
   * @param emphasisLevel Le niveau d'emphase à appliquer
   * @returns L'expression modifiée
   */
  private addEmphasis(
    expression: LSFExpression,
    emphasisLevel: number
  ): LSFExpression {
    // Convertir forward en nombre si c'est un booléen
    const forwardValue = typeof expression.head.forward === 'boolean'
      ? (expression.head.forward ? 1 : 0)
      : expression.head.forward;

    // Calculer la nouvelle valeur avec l'emphase
    const newForwardValue = Math.min(1, forwardValue * (1 + emphasisLevel * 0.2));

    // Ajouter de l'emphase en accentuant certains aspects de l'expression
    return {
      ...expression,
      head: {
        ...expression.head,
        forward: newForwardValue
      },
      eyebrows: {
        ...expression.eyebrows,
        intensity: Math.min(1, expression.eyebrows.intensity * (1 + emphasisLevel * 0.15))
      }
    };
  }

  /**
   * Ajuste la durée d'une expression
   * @param expression L'expression à modifier
   * @param durationFactor Le facteur de durée à appliquer
   * @returns L'expression modifiée
   */
  private adjustDuration(
    expression: LSFExpression,
    durationFactor: number
  ): LSFExpression {
    return {
      ...expression,
      timing: {
        duration: durationFactor,
        easing: durationFactor < 1 ? 'easeInOut' : 'easeOutElastic'
      }
    };
  }

  /**
   * Valide une expression grammaticale
   * @param expression L'expression à valider
   * @throws LSFGrammarError si l'expression est invalide
   */
  private async validateGrammaticalExpression(
    expression: LSFExpression
  ): Promise<void> {
    const validation = await this.runGrammaticalValidation(expression);
    if (!validation.isValid) {
      throw new LSFGrammarError(
        'Invalid grammatical expression',
        validation.issues
      );
    }
  }

  /**
   * Exécute une validation grammaticale complète sur une expression
   * @param expression L'expression à valider
   * @returns Le résultat de la validation
   */
  private async runGrammaticalValidation(
    expression: LSFExpression
  ): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Vérifier les limites des valeurs
    if (!this.areValuesInRange(expression)) {
      issues.push({
        component: 'values',
        message: 'Expression values out of valid range',
        severity: 'error'
      });
    }

    // Vérifier la cohérence des composants
    if (!this.areComponentsCoherent(expression)) {
      issues.push({
        component: 'coherence',
        message: 'Incoherent expression components',
        severity: 'error'
      });
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Vérifie que toutes les valeurs numériques d'une expression sont dans les limites valides
   * @param expression L'expression à vérifier
   * @returns true si toutes les valeurs sont valides
   */
  private areValuesInRange(expression: LSFExpression): boolean {
    const checkValue = (value: number) => !isNaN(value) && value >= -1 && value <= 1;

    // Conversion de forward au cas où c'est un booléen
    const forwardValue = typeof expression.head.forward === 'boolean'
      ? (expression.head.forward ? 1 : 0)
      : expression.head.forward;

    return (
      checkValue(expression.eyebrows.intensity) &&
      checkValue(forwardValue) &&
      checkValue(expression.head.tilt)
    );
  }

  /**
   * Vérifie la cohérence entre les différents composants d'une expression
   * @param expression L'expression à vérifier
   * @returns true si tous les composants sont cohérents
   */
  private areComponentsCoherent(expression: LSFExpression): boolean {
    // Vérifier les combinaisons impossibles ou incohérentes
    if (expression.mouth.closed && expression.mouth.shape === 'oval') {
      return false;
    }

    // Conversion de forward au cas où c'est un booléen
    const forwardValue = typeof expression.head.forward === 'boolean'
      ? (expression.head.forward ? 1 : 0)
      : expression.head.forward;

    // Vérifier la cohérence tête/sourcils
    if (expression.head.tilt > 0.5 && expression.eyebrows.intensity > 0.8) {
      return false;
    }

    // Vérifier que les valeurs de tête sont cohérentes
    if (forwardValue > 0.8 && expression.head.tilt > 0.8) {
      return false;
    }

    return true;
  }
}