// src/ai/systems/expressions/ExpressionSystem.ts
import { FacialExpression } from './types';

interface ExpressionOptions {
  expression: FacialExpression;
  priority?: number;
  duration?: number;
  id?: string;
}

/**
 * Système de base pour la gestion des expressions
 * Utilisé comme système sous-jacent par le FacialExpressionSystem
 */
export class ExpressionSystem {
  private activeExpressions: Map<string, ExpressionOptions>;
  private listeners: Array<(expression: FacialExpression) => void>;

  constructor() {
    this.activeExpressions = new Map();
    this.listeners = [];
  }

  /**
   * Applique une nouvelle expression
   * @param options Options de l'expression
   */
  public applyExpression(options: ExpressionOptions): string {
    const id = options.id || this.generateExpressionId();

    // Stocker l'expression avec ses options
    this.activeExpressions.set(id, {
      ...options,
      id
    });

    // Si l'expression a une durée limitée, programmer sa suppression
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        this.removeExpression(id);
      }, options.duration);
    }

    // Notifier les écouteurs
    this.notifyListeners();

    return id;
  }

  /**
   * Supprime une expression par son ID
   * @param id ID de l'expression à supprimer
   */
  public removeExpression(id: string): boolean {
    const removed = this.activeExpressions.delete(id);

    if (removed) {
      this.notifyListeners();
    }

    return removed;
  }

  /**
   * Obtient l'expression finale basée sur les priorités
   */
  public getFinalExpression(): FacialExpression {
    if (this.activeExpressions.size === 0) {
      return {};
    }

    // Créer une carte de priorités pour chaque composant
    const componentPriorities: Record<string, number> = {};
    const finalExpression: Record<string, unknown> = {};

    // Parcourir toutes les expressions actives
    for (const [, { expression, priority = 1 }] of this.activeExpressions.entries()) {
      // Pour chaque composant de l'expression
      for (const component in expression) {
        if (Object.prototype.hasOwnProperty.call(expression, component)) {
          const values = expression[component as keyof FacialExpression];

          // Si le composant existe et a une priorité plus élevée
          if (values && (!(component in componentPriorities) || priority > componentPriorities[component])) {
            finalExpression[component] = values;
            componentPriorities[component] = priority;
          }
        }
      }
    }

    return finalExpression as FacialExpression;
  }

  /**
   * Réinitialise toutes les expressions
   */
  public resetExpressions(): void {
    this.activeExpressions.clear();
    this.notifyListeners();
  }

  /**
   * Ajoute un écouteur pour les changements d'expressions
   * @param listener Fonction de callback appelée quand l'expression change
   */
  public addExpressionListener(listener: (expression: FacialExpression) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Supprime un écouteur
   * @param listener Fonction de callback à supprimer
   */
  public removeExpressionListener(listener: (expression: FacialExpression) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifie tous les écouteurs avec l'expression finale
   */
  private notifyListeners(): void {
    const finalExpression = this.getFinalExpression();
    for (const listener of this.listeners) {
      listener(finalExpression);
    }
  }

  /**
   * Génère un ID unique pour une expression
   */
  private generateExpressionId(): string {
    return `expr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}