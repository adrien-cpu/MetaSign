// src/ai/systems/expressions/FacialExpressionSystem.ts
import { LSFExpressionBridge } from './LSFExpressionBridge';
import {
  FacialExpression,
  EmotionConfig,
  ExpressionResult
} from './types';

// Définir un type pour les valeurs des composants faciaux
type FacialComponentValues = Record<string, number>;

/**
 * Système de gestion des expressions faciales pour l'avatar
 * Permet de synchroniser les expressions faciales avec les émotions et le langage des signes
 */
export class FacialExpressionSystem {
  private bridge: LSFExpressionBridge;
  private activeExpressions: Map<string, FacialExpression>;
  private expressionPriorities: Map<string, number>;

  constructor(bridge?: LSFExpressionBridge) {
    this.bridge = bridge || new LSFExpressionBridge();
    this.activeExpressions = new Map();
    this.expressionPriorities = new Map();
  }

  /**
   * Applique une expression faciale
   * @param expression L'expression faciale à appliquer
   * @param priority Priorité de l'expression (plus la valeur est élevée, plus la priorité est haute)
   * @param duration Durée de l'expression en millisecondes (0 = permanente)
   */
  public applyExpression(
    expression: FacialExpression,
    priority: number = 1,
    duration: number = 0
  ): ExpressionResult {
    const id = this.generateExpressionId();

    // Stocker l'expression et sa priorité
    this.activeExpressions.set(id, expression);
    this.expressionPriorities.set(id, priority);

    // Si l'expression a une durée limitée, programmer sa suppression
    if (duration > 0) {
      setTimeout(() => {
        this.removeExpression(id);
      }, duration);
    }

    // Recalculer l'expression finale basée sur les priorités
    this.updateFinalExpression();

    return {
      id,
      success: true,
      message: `Expression appliquée avec l'ID: ${id}`
    };
  }

  /**
   * Supprime une expression faciale par son ID
   * @param expressionId L'ID de l'expression à supprimer
   */
  public removeExpression(expressionId: string): boolean {
    const removed = this.activeExpressions.delete(expressionId);
    this.expressionPriorities.delete(expressionId);

    if (removed) {
      this.updateFinalExpression();
    }

    return removed;
  }

  /**
   * Applique une émotion qui se traduira par une expression faciale
   * @param emotion Configuration de l'émotion à appliquer
   */
  public applyEmotion(emotion: EmotionConfig): ExpressionResult {
    // Convertir l'émotion en expression faciale
    const expression = this.convertEmotionToExpression(emotion);

    // Appliquer l'expression avec la priorité et la durée spécifiées
    return this.applyExpression(
      expression,
      emotion.priority || 2,
      emotion.duration || 3000
    );
  }

  /**
   * Recherche les expressions faciales qui correspondent à un critère donné
   * @param filter Fonction de filtrage
   */
  public findExpressions(
    filter: (expr: FacialExpression) => boolean
  ): FacialExpression[] {
    const results: FacialExpression[] = [];

    for (const expression of this.activeExpressions.values()) {
      if (filter(expression)) {
        results.push(expression);
      }
    }

    return results;
  }

  /**
   * Synchronise les expressions faciales avec le système LSF
   */
  public synchronizeWithLSF(): void {
    const lsfContext = this.bridge.getCurrentContext();

    // Si le contexte LSF contient des informations d'expression, les intégrer
    if (lsfContext && lsfContext.expressions) {
      for (const expr of lsfContext.expressions) {
        this.applyExpression({
          eyebrows: expr.eyebrows,
          mouth: expr.mouth,
          eyes: expr.eyes
        }, 3, expr.duration || 0);
      }
    }
  }

  /**
   * Réinitialise toutes les expressions faciales
   */
  public resetExpressions(): void {
    this.activeExpressions.clear();
    this.expressionPriorities.clear();
    this.updateFinalExpression();
  }

  /**
   * Génère un ID unique pour une expression
   */
  private generateExpressionId(): string {
    return `expr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Convertit une configuration d'émotion en expression faciale
   */
  private convertEmotionToExpression(emotion: EmotionConfig): FacialExpression {
    // Mapper les émotions aux expressions faciales
    const expressions: Record<string, FacialExpression> = {
      'joy': {
        eyebrows: { raised: 0.5, inner: 0.3 },
        mouth: { smiling: 0.8, open: 0.3 },
        eyes: { openness: 0.6 }
      },
      'sadness': {
        eyebrows: { raised: 0.1, inner: 0.8 },
        mouth: { smiling: 0, open: 0.1, corners: -0.7 },
        eyes: { openness: 0.4 }
      },
      'anger': {
        eyebrows: { lowered: 0.8, inner: 0.2 },
        mouth: { tightened: 0.7, open: 0.2 },
        eyes: { openness: 0.7, squint: 0.6 }
      },
      'surprise': {
        eyebrows: { raised: 0.9, inner: 0.5 },
        mouth: { open: 0.8, round: 0.7 },
        eyes: { openness: 0.9 }
      },
      'fear': {
        eyebrows: { raised: 0.7, inner: 0.7 },
        mouth: { open: 0.4, tightened: 0.5 },
        eyes: { openness: 0.8, widen: 0.7 }
      },
      'neutral': {
        eyebrows: { raised: 0, inner: 0 },
        mouth: { open: 0, smiling: 0 },
        eyes: { openness: 0.5 }
      }
    };

    // Récupérer l'expression de base
    const baseExpression = expressions[emotion.type] || expressions['neutral'];

    // Ajuster l'intensité si nécessaire
    if (emotion.intensity !== undefined && emotion.intensity !== 1) {
      return this.adjustExpressionIntensity(baseExpression, emotion.intensity);
    }

    return baseExpression;
  }

  /**
   * Ajuste l'intensité d'une expression faciale
   */
  private adjustExpressionIntensity(
    expression: FacialExpression,
    intensity: number
  ): FacialExpression {
    const result: FacialExpression = {
      eyebrows: {},
      mouth: {},
      eyes: {}
    };

    // Ajuster chaque composant de l'expression
    for (const component in expression) {
      if (Object.prototype.hasOwnProperty.call(expression, component)) {
        const values = expression[component as keyof FacialExpression];

        if (values && typeof values === 'object') {
          const adjustedValues: FacialComponentValues = {};

          for (const prop in values) {
            if (Object.prototype.hasOwnProperty.call(values, prop)) {
              const value = values[prop as keyof typeof values];
              if (typeof value === 'number') {
                adjustedValues[prop] = value * intensity;
              }
            }
          }

          // Utiliser le type approprié au lieu de 'any'
          result[component as keyof FacialExpression] = adjustedValues as FacialComponentValues;
        }
      }
    }

    return result;
  }

  /**
   * Adapte une expression faciale pour garantir la compatibilité avec le LSFExpressionBridge
   */
  private adaptExpressionForBridge(expression: FacialExpression): import('./LSFExpressionBridge').FacialExpression {
    // S'assurer que tous les composants requis sont définis
    return {
      ...expression,
      eyebrows: expression.eyebrows || {},
      mouth: expression.mouth || {},
      eyes: expression.eyes || {}
    } as import('./LSFExpressionBridge').FacialExpression;
  }

  /**
   * Met à jour l'expression faciale finale en fonction des priorités
   */
  private updateFinalExpression(): void {
    if (this.activeExpressions.size === 0) {
      // Pas d'expressions actives, réinitialiser
      this.bridge.applyNeutralExpression();
      return;
    }

    // Trouver l'expression de priorité la plus élevée pour chaque composant
    const finalExpression: FacialExpression = {
      eyebrows: {},
      mouth: {},
      eyes: {}
    };

    const componentPriorities: Record<string, number> = {
      eyebrows: 0,
      mouth: 0,
      eyes: 0
    };

    // Parcourir toutes les expressions actives
    for (const [id, expression] of this.activeExpressions.entries()) {
      const priority = this.expressionPriorities.get(id) || 1;

      // Pour chaque composant facial
      for (const component in expression) {
        if (Object.prototype.hasOwnProperty.call(expression, component)) {
          const key = component as keyof FacialExpression;
          const values = expression[key];

          // Si le composant existe et a une priorité plus élevée
          if (values && priority > (componentPriorities[component as string] || 0)) {
            finalExpression[key] = values;
            componentPriorities[component as string] = priority;
          }
        }
      }
    }

    // Appliquer l'expression finale via le bridge LSF, en utilisant l'adaptateur
    this.bridge.applyFacialExpression(this.adaptExpressionForBridge(finalExpression));
  }
}