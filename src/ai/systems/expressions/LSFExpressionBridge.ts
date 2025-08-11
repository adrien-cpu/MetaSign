// src/ai/systems/expressions/LSFExpressionBridge.ts
import { LSFExpression } from './types';
import { ExpressionSystem } from './ExpressionSystem';

/**
 * Interface de liaison entre le système d'expressions et l'avatar
 */
export interface ILSFExpressionBridge {
  /**
   * Applique une composante faciale
   */
  applyFacialComponent(componentType: string, value: Record<string, number>): void;

  /**
   * Applique une composante corporelle
   */
  applyBodyComponent(body: LSFExpression['body']): void;

  /**
   * Applique une composante manuelle
   */
  applyHandComponent(handshape: LSFExpression['handshape']): void;

  /**
   * Synchronise toutes les composantes
   */
  synchronizeComponents(): void;
}

/**
 * Types pour les expressions faciales
 */
export interface FacialExpression {
  eyebrows: { raised?: number; inner?: number; outer?: number };
  mouth: { smiling?: number; open?: number; round?: number; tightened?: number };
  eyes: { openness?: number; squint?: number; widen?: number };
}

/**
 * Contexte LSF
 */
export interface LSFContext {
  expressions?: Array<{
    eyebrows: Record<string, number>;
    mouth: Record<string, number>;
    eyes: Record<string, number>;
    duration?: number;
  }>;
  grammaticalMarkers?: Record<string, unknown>;
  spatialReferences?: Record<string, unknown>;
}

// Interface pour ExpressionSystem pour éviter les erreurs de type
interface IExpressionSystem {
  applyExpression(params: {
    expression: FacialExpression;
    priority: number;
    duration: number;
  }): void;

  applyBodyPosture(params: {
    posture: Record<string, unknown>;
    movement: Record<string, unknown>;
    priority: number;
    duration: number;
  }): void;

  applyHandShape(params: {
    shape: Record<string, unknown>;
    priority: number;
    duration: number;
  }): void;
}

/**
 * Pont entre le système d'expressions faciales et le système LSF
 * Permet de synchroniser les expressions entre les deux systèmes
 */
export class LSFExpressionBridge implements ILSFExpressionBridge {
  private expressionSystem: IExpressionSystem;
  private currentContext: LSFContext | null = null;
  private defaultExpression: FacialExpression;

  constructor(expressionSystem?: ExpressionSystem) {
    this.expressionSystem = (expressionSystem || new ExpressionSystem()) as unknown as IExpressionSystem;
    this.defaultExpression = this.createNeutralExpression();
  }

  /**
   * Obtient le contexte LSF actuel
   */
  public getCurrentContext(): LSFContext | null {
    return this.currentContext;
  }

  /**
   * Met à jour le contexte LSF
   * @param context Nouveau contexte LSF
   */
  public updateContext(context: LSFContext): void {
    this.currentContext = context;
  }

  /**
   * Applique une composante faciale
   * @param componentType Type de composante faciale
   * @param value Valeurs de la composante
   */
  public applyFacialComponent(componentType: string, value: Record<string, number>): void {
    // Implémentation de l'application d'une composante faciale
    const expression: Partial<FacialExpression> = {};

    switch (componentType) {
      case 'eyebrows':
        expression.eyebrows = value;
        break;
      case 'mouth':
        expression.mouth = value;
        break;
      case 'eyes':
        expression.eyes = value;
        break;
    }

    this.expressionSystem.applyExpression({
      expression: this.mergeWithDefaultExpression(expression as FacialExpression),
      priority: 1,
      duration: 500 // Durée par défaut
    });
  }

  /**
   * Applique une composante corporelle
   * @param body Composante corporelle
   */
  public applyBodyComponent(body: LSFExpression['body']): void {
    // Implémentation de l'application d'une composante corporelle
    if (!body) return;

    this.expressionSystem.applyBodyPosture({
      posture: body.posture || {},
      movement: body.movement || {},
      priority: 1,
      duration: 500
    });
  }

  /**
   * Applique une composante manuelle
   * @param handshape Configuration des mains
   */
  public applyHandComponent(handshape: LSFExpression['handshape']): void {
    // Implémentation de l'application d'une composante manuelle
    if (!handshape) return;

    this.expressionSystem.applyHandShape({
      shape: handshape,
      priority: 1,
      duration: 500
    });
  }

  /**
   * Synchronise toutes les composantes
   */
  public synchronizeComponents(): void {
    if (!this.currentContext || !this.currentContext.expressions) {
      return;
    }

    // Synchronisation des expressions LSF vers le système d'expressions faciales
    for (const expr of this.currentContext.expressions) {
      const facialExpression: FacialExpression = {
        eyebrows: expr.eyebrows,
        mouth: expr.mouth,
        eyes: expr.eyes
      };

      this.expressionSystem.applyExpression({
        expression: facialExpression,
        priority: 2,
        duration: expr.duration || 0
      });
    }
  }

  /**
   * Applique une expression faciale au système LSF
   * @param expression Expression faciale à appliquer
   */
  public applyFacialExpression(expression: FacialExpression): void {
    // Conversion de l'expression faciale en format adapté au système LSF
    const lsfCompatibleExpression = this.convertToLSFFormat(expression);

    // Application de l'expression via le système d'expressions
    this.expressionSystem.applyExpression(lsfCompatibleExpression);
  }

  /**
   * Applique une expression neutre
   */
  public applyNeutralExpression(): void {
    this.applyFacialExpression(this.defaultExpression);
  }

  /**
   * Convertit une expression faciale en format compatible LSF
   * @param expression Expression faciale à convertir
   */
  private convertToLSFFormat(expression: FacialExpression): {
    expression: FacialExpression;
    priority: number;
    duration: number;
    timestamp?: number;
    source?: string;
  } {
    // Implémentation de la conversion selon le format attendu par le système LSF
    return {
      expression,
      timestamp: Date.now(),
      source: 'facial_expression_system',
      priority: 1,
      duration: 500
    };
  }

  /**
   * Crée une expression faciale neutre
   */
  private createNeutralExpression(): FacialExpression {
    return {
      eyebrows: { raised: 0, inner: 0, outer: 0 },
      mouth: { smiling: 0, open: 0, round: 0, tightened: 0 },
      eyes: { openness: 0.5, squint: 0, widen: 0 }
    };
  }

  /**
   * Fusionne une expression avec l'expression par défaut
   */
  private mergeWithDefaultExpression(expression: Partial<FacialExpression>): FacialExpression {
    return {
      eyebrows: { ...this.defaultExpression.eyebrows, ...expression.eyebrows },
      mouth: { ...this.defaultExpression.mouth, ...expression.mouth },
      eyes: { ...this.defaultExpression.eyes, ...expression.eyes }
    };
  }
}