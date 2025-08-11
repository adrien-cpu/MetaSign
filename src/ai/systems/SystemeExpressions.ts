// src/ai/systems/SystemeExpressions.ts
import { ExpressionAnimator } from './expressions/animation/ExpressionAnimator';
import { LSFPatternAnalyzer } from './expressions/analysis/LSFPatternAnalyzer';
import { LSFEmotionSyntaxController } from './expressions/emotions/syntax/LSFEmotionSyntaxController';
import { LSFExpressionBridge } from './expressions/LSFExpressionBridge';
import { ExpressionValidator } from './expressions/validation/ExpressionValidator';
import { PerformanceMonitor } from './expressions/animation/PerformanceMonitor';
import { CacheManager } from '@api/core/middleware/CacheManager';
import { MetricsCollector } from '@api/common/metrics/MetricsCollector';
import {
  ExpressionComponentValues,
  ExpressionOptions,
  ExpressionResult,
  LSFExpression,
  ValidationIssue,
  ValidationResult
} from './expressions/types';
import { EXPRESSION_RULES } from './expressions/validation/ValidationRules';
import { Logger } from '@ai/utils/Logger';

// Importer explicitement la déclaration étendue pour LSFEmotionSyntaxController
import './expressions/emotions/syntax/LSFEmotionSyntaxController.d';

/**
 * Système de gestion des expressions selon le diagramme d'état
 * Implémente le composant SystemeExpressions du diagramme
 */
export class SystemeExpressions {
  private readonly logger = Logger.getInstance('SystemeExpressions');
  private readonly expressionAnimator: ExpressionAnimator;
  private readonly patternAnalyzer: LSFPatternAnalyzer;
  private readonly emotionSyntaxController: LSFEmotionSyntaxController;
  private readonly expressionBridge: LSFExpressionBridge;
  private readonly validator: ExpressionValidator;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly cacheManager: CacheManager;
  private readonly metricsCollector: MetricsCollector;
  private readonly rules = EXPRESSION_RULES;

  /**
   * Crée une nouvelle instance du système d'expressions
   */
  constructor(
    expressionAnimator: ExpressionAnimator,
    patternAnalyzer: LSFPatternAnalyzer,
    emotionSyntaxController: LSFEmotionSyntaxController,
    expressionBridge: LSFExpressionBridge,
    validator: ExpressionValidator,
    performanceMonitor: PerformanceMonitor,
    cacheManager: CacheManager,
    metricsCollector: MetricsCollector
  ) {
    this.expressionAnimator = expressionAnimator;
    this.patternAnalyzer = patternAnalyzer;
    this.emotionSyntaxController = emotionSyntaxController;
    this.expressionBridge = expressionBridge;
    this.validator = validator;
    this.performanceMonitor = performanceMonitor;
    this.cacheManager = cacheManager;
    this.metricsCollector = metricsCollector;
  }

  /**
   * Applique une expression LSF
   * @param expression Expression à appliquer
   * @param options Options d'application
   * @returns Résultat de l'application
   */
  async applyExpression(expression: LSFExpression, options?: ExpressionOptions): Promise<ExpressionResult> {
    const startTime = Date.now();
    this.performanceMonitor.startTracking('applyExpression');

    try {
      // Générer un ID unique pour cette expression
      const expressionId = this.generateExpressionId(expression);

      // Vérifier le cache si pas d'options spécifiques
      if (!options && this.cacheManager) {
        const cacheResult = await this.tryGetFromCache(expressionId);
        if (cacheResult) {
          return cacheResult;
        }
      }

      // Valider l'expression
      this.performanceMonitor.startTracking('validateExpression');
      const validation = await this.validateExpression(expression);
      this.performanceMonitor.stopTracking('validateExpression');

      if (!validation.isValid) {
        return this.createErrorResult(expressionId, validation.issues, startTime);
      }

      // Adapter l'expression selon le contexte émotionnel
      this.performanceMonitor.startTracking('adaptExpression');
      const adaptedExpression = await this.emotionSyntaxController.adaptExpression(
        expression,
        options?.emotionalIntensity || 1.0,
        options?.culturalContext || []
      );
      this.performanceMonitor.stopTracking('adaptExpression');

      // Préparer l'animation
      this.performanceMonitor.startTracking('prepareAnimation');
      const preparationEnd = Date.now();

      // Application des composantes
      await this.applyExpressionComponents(adaptedExpression);

      // Synchroniser les composantes
      this.performanceMonitor.startTracking('synchronizeComponents');
      this.synchronizeComponents();
      this.performanceMonitor.stopTracking('synchronizeComponents');

      // Créer l'animation
      this.performanceMonitor.startTracking('createAnimation');
      const animationDuration = options?.duration || adaptedExpression.duration || 1000;
      const transitionTime = options?.transitionTime || 150;

      await this.expressionAnimator.createAnimation(
        adaptedExpression,
        animationDuration,
        transitionTime,
        options?.priority || 'normal'
      );
      this.performanceMonitor.stopTracking('createAnimation');

      const renderEnd = Date.now();

      // Créer le résultat
      const result = this.createSuccessResult(
        expressionId,
        startTime,
        animationDuration,
        preparationEnd,
        renderEnd
      );

      // Mettre en cache si c'est une expression standard
      if (!options && this.cacheManager) {
        await this.cacheResult(expressionId, result);
      }

      // Collecter des métriques
      this.recordPerformanceMetrics(preparationEnd, renderEnd, startTime);

      return result;
    } catch (error) {
      return this.handleExpressionError(error, startTime);
    } finally {
      this.performanceMonitor.stopTracking('applyExpression');
    }
  }

  /**
   * Valide une expression LSF selon les règles d'expression
   * @param expression Expression à valider
   * @returns Résultat de la validation
   */
  async validateExpression(expression: LSFExpression): Promise<ValidationResult> {
    return this.validator.validate(expression);
  }

  /**
   * Applique toutes les composantes d'une expression
   * @param expression Expression à appliquer
   */
  private async applyExpressionComponents(expression: LSFExpression): Promise<void> {
    this.performanceMonitor.startTracking('applyComponents');

    // Appliquer les composantes faciales avec vérification de type
    if (expression.eyebrows) {
      const eyebrowValues = this.ensureExpressionComponentValues(expression.eyebrows);
      this.applyFacialComponent('eyebrows', eyebrowValues);
    }

    if (expression.mouth) {
      const mouthValues = this.ensureExpressionComponentValues(expression.mouth);
      this.applyFacialComponent('mouth', mouthValues);
    }

    if (expression.eyes) {
      const eyeValues = this.ensureExpressionComponentValues(expression.eyes);
      this.applyFacialComponent('eyes', eyeValues);
    }

    // Appliquer les composantes corporelles
    if (expression.body) {
      this.applyBodyComponent(expression.body);
    }

    // Appliquer les composantes manuelles
    if (expression.handshape) {
      this.applyHandComponent(expression.handshape);
    }

    this.performanceMonitor.stopTracking('applyComponents');
  }

  /**
   * Génère un identifiant unique pour une expression
   * @param expression Expression à identifier
   * @returns Identifiant unique
   */
  private generateExpressionId(expression: LSFExpression): string {
    // Créer une représentation simplifiée de l'expression
    const simplifiedExpression = {
      type: expression.type,
      value: expression.value,
      duration: expression.duration
    };

    // Générer un hash à partir de cette représentation
    const expressionStr = JSON.stringify(simplifiedExpression);
    let hash = 0;

    for (let i = 0; i < expressionStr.length; i++) {
      const char = expressionStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Conversion en entier 32 bits
    }

    return `expr_${hash}_${Date.now()}`;
  }

  /**
   * Tente de récupérer un résultat du cache
   * @param expressionId Identifiant de l'expression
   * @returns Résultat mis en cache ou null
   */
  private async tryGetFromCache(expressionId: string): Promise<ExpressionResult | null> {
    const cacheKey = `expr_${expressionId}`;
    const cachedResult = await this.cacheManager.get<ExpressionResult>(cacheKey);

    if (cachedResult) {
      this.metricsCollector.incrementCounter('expression_cache_hit');
      return {
        ...cachedResult,
        timing: {
          start: Date.now(),
          duration: cachedResult.timing?.duration || 0,
          end: Date.now() + (cachedResult.timing?.duration || 0)
        }
      };
    }

    return null;
  }

  /**
   * Enregistre un résultat dans le cache
   * @param expressionId Identifiant de l'expression
   * @param result Résultat à mettre en cache
   */
  private async cacheResult(expressionId: string, result: ExpressionResult): Promise<void> {
    const cacheKey = `expr_${expressionId}`;
    await this.cacheManager.set(cacheKey, result, { ttl: 3600000 }); // 1 heure
  }

  /**
   * Garantit que l'objet passé est conforme au type ExpressionComponentValues
   * @param obj Objet à vérifier/convertir
   * @returns Objet validé de type ExpressionComponentValues
   */
  private ensureExpressionComponentValues(obj: Record<string, unknown>): ExpressionComponentValues {
    const result: ExpressionComponentValues = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number') {
        result[key] = value;
      } else {
        this.logger.warn(`Non-numeric value for component key '${key}' - ignoring`);
      }
    }

    return result;
  }

  /**
   * Applique une composante faciale de l'expression
   * @param componentType Type de composante faciale
   * @param value Valeurs de la composante
   */
  private applyFacialComponent(componentType: string, value: ExpressionComponentValues): void {
    this.expressionBridge.applyFacialComponent(componentType, value);
  }

  /**
   * Applique une composante corporelle de l'expression
   * @param body Valeurs de la composante corporelle
   */
  private applyBodyComponent(body: LSFExpression['body']): void {
    this.expressionBridge.applyBodyComponent(body);
  }

  /**
   * Applique une composante manuelle de l'expression
   * @param handshape Configuration des mains
   */
  private applyHandComponent(handshape: LSFExpression['handshape']): void {
    this.expressionBridge.applyHandComponent(handshape);
  }

  /**
   * Synchronise toutes les composantes après leur application
   */
  private synchronizeComponents(): void {
    this.expressionBridge.synchronizeComponents();
  }

  /**
   * Crée un résultat d'erreur
   * @param expressionId Identifiant de l'expression
   * @param issues Problèmes rencontrés
   * @param startTime Heure de début du traitement
   * @returns Résultat d'erreur
   */
  private createErrorResult(
    expressionId: string,
    issues: ValidationIssue[] = [],
    startTime: number
  ): ExpressionResult {
    const endTime = Date.now();
    return {
      success: false,
      expressionId,
      issues,
      timing: {
        start: startTime,
        duration: 0,
        end: endTime
      },
      performance: {
        preparationTimeMs: endTime - startTime,
        renderTimeMs: 0,
        totalTimeMs: endTime - startTime
      }
    };
  }

  /**
   * Crée un résultat de succès
   * @param expressionId Identifiant de l'expression
   * @param startTime Heure de début
   * @param duration Durée de l'animation
   * @param preparationEnd Heure de fin de préparation
   * @param renderEnd Heure de fin de rendu
   * @returns Résultat de succès
   */
  private createSuccessResult(
    expressionId: string,
    startTime: number,
    duration: number,
    preparationEnd: number,
    renderEnd: number
  ): ExpressionResult {
    return {
      success: true,
      expressionId,
      timing: {
        start: startTime,
        duration,
        end: startTime + duration
      },
      performance: {
        preparationTimeMs: preparationEnd - startTime,
        renderTimeMs: renderEnd - preparationEnd,
        totalTimeMs: renderEnd - startTime
      }
    };
  }

  /**
   * Enregistre les métriques de performance
   * @param preparationEnd Heure de fin de préparation
   * @param renderEnd Heure de fin de rendu
   * @param startTime Heure de début
   */
  private recordPerformanceMetrics(
    preparationEnd: number,
    renderEnd: number,
    startTime: number
  ): void {
    this.metricsCollector.recordTiming('expression_preparation_time', preparationEnd - startTime);
    this.metricsCollector.recordTiming('expression_render_time', renderEnd - preparationEnd);
    this.metricsCollector.recordTiming('expression_total_time', renderEnd - startTime);
    this.metricsCollector.incrementCounter('expressions_processed');
  }

  /**
   * Gère les erreurs lors de l'application d'une expression
   * @param error Erreur rencontrée
   * @param startTime Heure de début
   * @returns Résultat d'erreur
   */
  private handleExpressionError(error: unknown, startTime: number): ExpressionResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during expression application';
    this.logger.error('Error applying expression:', { error: errorMessage });

    return {
      success: false,
      issues: [{
        type: 'SYNTACTIC',
        severity: 'ERROR',
        message: errorMessage,
        component: 'SystemeExpressions'
      }],
      timing: {
        start: startTime,
        duration: Date.now() - startTime,
        end: Date.now()
      },
      performance: {
        preparationTimeMs: Date.now() - startTime,
        renderTimeMs: 0,
        totalTimeMs: Date.now() - startTime
      }
    };
  }

  /**
   * Récupère les métriques de performance du système d'expressions
   * @returns Métriques de performance
   */
  public getPerformanceMetrics(): Record<string, number> {
    return {
      ...this.performanceMonitor.getMetrics(),
      cacheSize: this.cacheManager ? this.cacheManager.getStats().size : 0,
      cacheHitRate: this.cacheManager ? this.cacheManager.getStats().hitRate : 0,
      expressionsProcessed: this.metricsCollector.getCounter('expressions_processed') || 0,
      averagePreparationTime: this.metricsCollector.getAverageTiming('expression_preparation_time') || 0,
      averageRenderTime: this.metricsCollector.getAverageTiming('expression_render_time') || 0,
      averageTotalTime: this.metricsCollector.getAverageTiming('expression_total_time') || 0
    };
  }
}