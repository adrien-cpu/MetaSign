// src/ai/systems/expressions/animation/ExpressionAnimator.ts
import { RPMClient } from '../rpm/RPMAPIClient';
import {
  RPMMorphTargets,
  MorphTargetsManager
} from '../rpm/RPMMorphTargets';
import { RPMError } from '../rpm/RPMErrorHandling';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Interpolator } from './Interpolator';
import {
  LSFExpression,
  ExpressionOptions,
  ExpressionResult,
  ValidationIssue
} from '../types';

/**
 * Interface du contrôleur d'animation pour les expressions LSF
 */
export interface IExpressionAnimator {
  /**
   * Crée une animation à partir d'une expression
   * @param expression Expression LSF à animer
   * @param options Options d'animation
   * @returns Résultat de l'animation
   */
  createAnimation(
    expression: LSFExpression,
    options?: ExpressionOptions
  ): Promise<ExpressionResult>;
}

/**
 * Implémentation du contrôleur d'animation pour les expressions LSF
 * Responsable de la conversion des expressions LSF en animations faciales
 * et de leur application fluide sur l'avatar.
 */
export class ExpressionAnimator implements IExpressionAnimator {
  private readonly FPS = 60;
  private readonly FRAME_TIME = 1000 / this.FPS;
  private isRunning = false;
  private lastFrameTime = 0;

  private currentExpression: RPMMorphTargets;
  private targetExpression: RPMMorphTargets;
  private transitionDuration = 0;
  private transitionStartTime = 0;
  private priorityQueue: Array<{
    expression: RPMMorphTargets;
    duration: number;
    priority: 'high' | 'normal' | 'low';
    id?: string | undefined;
  }> = [];

  /**
   * Constructeur
   * @param rpmClient Client RPM pour l'interaction avec l'avatar
   * @param interpolator Service d'interpolation pour les transitions fluides
   * @param performanceMonitor Moniteur de performance pour les métriques d'animation
   */
  constructor(
    private rpmClient: RPMClient,
    private interpolator: Interpolator,
    private performanceMonitor: PerformanceMonitor
  ) {
    this.lastFrameTime = performance.now();
    this.currentExpression = new MorphTargetsManager();
    this.targetExpression = new MorphTargetsManager();
  }

  /**
   * Crée une animation à partir d'une expression LSF
   * @param expression Expression LSF à animer
   * @param options Options d'animation
   * @returns Résultat de l'animation
   */
  async createAnimation(
    expression: LSFExpression,
    options: ExpressionOptions = {}
  ): Promise<ExpressionResult> {
    const startTime = performance.now();

    try {
      // Extraire les options ou utiliser les valeurs par défaut
      const duration = options.duration || 1000;
      const transitionTime = options.transitionTime || 300;
      const priority = options.priority || 'normal';

      // Convertir l'expression LSF en cibles morph RPM
      const morphTargets = this.convertExpressionToMorphTargets(expression, options);

      // Ajouter à la file d'attente avec priorité
      const queueItem = {
        expression: morphTargets,
        duration,
        priority,
        id: expression.id
      };

      this.priorityQueue.push(queueItem);

      // Trier la file par priorité
      this.priorityQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Si animation de haute priorité ou file vide, commencer immédiatement
      if (priority === 'high' || (this.priorityQueue.length === 1 && !this.isRunning)) {
        const item = this.priorityQueue.shift();
        if (item) {
          await this.animateExpression(item.expression, duration, transitionTime);
        }
      }

      const endTime = performance.now();

      // Préparer le résultat
      return {
        success: true,
        // Utiliser une chaîne vide ou un ID généré si expression.id est undefined
        id: expression.id || '',
        message: "Animation successfully queued",
        timing: {
          start: startTime,
          duration: duration,
          end: startTime + duration
        },
        performance: {
          preparationTimeMs: endTime - startTime,
          renderTimeMs: 0, // Sera mis à jour après le rendu effectif
          totalTimeMs: endTime - startTime
        }
      };
    } catch (error) {
      const endTime = performance.now();

      const issues: ValidationIssue[] = [{
        type: 'TECHNICAL',
        severity: 'ERROR',
        message: error instanceof Error ? error.message : "Animation failed"
      }];

      // En cas d'erreur, retourner un résultat d'échec
      return {
        success: false,
        id: expression.id || '',
        message: error instanceof Error ? error.message : "Animation failed",
        performance: {
          preparationTimeMs: endTime - startTime,
          renderTimeMs: 0,
          totalTimeMs: endTime - startTime
        },
        issues
      };
    }
  }

  /**
   * Convertit une expression LSF en cibles morph pour RPM
   * @param expression Expression LSF à convertir
   * @param options Options supplémentaires pour la conversion
   * @returns Cibles morph pour l'animation
   */
  private convertExpressionToMorphTargets(
    expression: LSFExpression,
    options: ExpressionOptions = {}
  ): RPMMorphTargets {
    const morphTargets = new MorphTargetsManager();

    // Facteur d'intensité globale
    const globalIntensity = options.emotionalIntensity ||
      (expression.emotionalContext?.intensity || 1.0);

    // Traiter les sourcils
    if (expression.eyebrows) {
      for (const [key, value] of Object.entries(expression.eyebrows)) {
        if (typeof value === 'number') {
          if (key === 'raised') {
            morphTargets.browInnerUp = value * globalIntensity;
            morphTargets.browOuterUpLeft = value * 0.8 * globalIntensity;
            morphTargets.browOuterUpRight = value * 0.8 * globalIntensity;
          } else if (key === 'lowered') {
            morphTargets.setTarget('browDownLeft', value * globalIntensity);
            morphTargets.setTarget('browDownRight', value * globalIntensity);
          } else if (key === 'oneRaised') {
            morphTargets.browOuterUpLeft = value * globalIntensity;
          } else {
            // Pour les autres clés personnalisées
            morphTargets.setTarget(`brow${key.charAt(0).toUpperCase() + key.slice(1)}`,
              value * globalIntensity);
          }
        }
      }
    }

    // Traiter les yeux
    if (expression.eyes) {
      for (const [key, value] of Object.entries(expression.eyes)) {
        if (typeof value === 'number') {
          if (key === 'squint') {
            morphTargets.eyeSquintLeft = value * globalIntensity;
            morphTargets.eyeSquintRight = value * globalIntensity;
          } else if (key === 'blink') {
            morphTargets.eyeBlinkLeft = value * globalIntensity;
            morphTargets.eyeBlinkRight = value * globalIntensity;
          } else if (key === 'wide') {
            morphTargets.setTarget('eyeWideLeft', value * globalIntensity);
            morphTargets.setTarget('eyeWideRight', value * globalIntensity);
          } else {
            // Pour les autres clés personnalisées
            morphTargets.setTarget(`eye${key.charAt(0).toUpperCase() + key.slice(1)}`,
              value * globalIntensity);
          }
        }
      }
    }

    // Traiter la bouche
    if (expression.mouth) {
      for (const [key, value] of Object.entries(expression.mouth)) {
        if (typeof value === 'number') {
          if (key === 'smile') {
            morphTargets.mouthSmile = value * globalIntensity;
          } else if (key === 'frown') {
            morphTargets.mouthFrown = value * globalIntensity;
          } else if (key === 'open') {
            morphTargets.jawOpen = value * globalIntensity;
            morphTargets.setTarget('mouthOpen', value * globalIntensity);
          } else if (key === 'purse' || key === 'pucker') {
            morphTargets.setTarget('mouthPucker', value * globalIntensity);
          } else {
            // Pour les autres clés personnalisées
            morphTargets.setTarget(`mouth${key.charAt(0).toUpperCase() + key.slice(1)}`,
              value * globalIntensity);
          }
        }
      }
    }

    // Traiter le contexte émotionnel
    if (expression.emotionalContext) {
      const { emotion, intensity } = expression.emotionalContext;

      switch (emotion.toLowerCase()) {
        case 'happy':
        case 'joy':
          morphTargets.mouthSmile = intensity * globalIntensity;
          morphTargets.setTarget('eyeWideLeft', intensity * 0.5 * globalIntensity);
          morphTargets.setTarget('eyeWideRight', intensity * 0.5 * globalIntensity);
          break;

        case 'sad':
        case 'sadness':
          morphTargets.mouthFrown = intensity * globalIntensity;
          morphTargets.browInnerUp = intensity * 0.7 * globalIntensity;
          break;

        case 'angry':
        case 'anger':
          morphTargets.setTarget('browDownLeft', intensity * globalIntensity);
          morphTargets.setTarget('browDownRight', intensity * globalIntensity);
          morphTargets.setTarget('noseSneer', intensity * 0.7 * globalIntensity);
          break;

        case 'surprised':
        case 'surprise':
          morphTargets.setTarget('eyeWideLeft', intensity * globalIntensity);
          morphTargets.setTarget('eyeWideRight', intensity * globalIntensity);
          morphTargets.browInnerUp = intensity * globalIntensity;
          morphTargets.browOuterUpLeft = intensity * globalIntensity;
          morphTargets.browOuterUpRight = intensity * globalIntensity;
          morphTargets.jawOpen = intensity * 0.7 * globalIntensity;
          break;

        case 'disgust':
          morphTargets.setTarget('noseSneer', intensity * globalIntensity);
          morphTargets.setTarget('mouthFunnel', intensity * 0.5 * globalIntensity);
          break;

        case 'fear':
          morphTargets.setTarget('eyeWideLeft', intensity * globalIntensity);
          morphTargets.setTarget('eyeWideRight', intensity * globalIntensity);
          morphTargets.browInnerUp = intensity * 0.8 * globalIntensity;
          morphTargets.browOuterUpLeft = intensity * 0.6 * globalIntensity;
          morphTargets.browOuterUpRight = intensity * 0.6 * globalIntensity;
          break;
      }
    }

    return morphTargets;
  }

  /**
   * Démarre l'animation
   */
  async startAnimation(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animationLoop();
  }

  /**
   * Arrête l'animation et réinitialise l'expression
   */
  async stopAnimation(): Promise<void> {
    this.isRunning = false;
    await this.resetExpression();
  }

  /**
   * Anime une expression avec une durée et un temps de transition spécifiés
   * @param targetExpression Expression cible
   * @param duration Durée totale de l'animation
   * @param transitionTime Temps de transition
   */
  async animateExpression(
    targetExpression: RPMMorphTargets,
    duration: number,
    transitionTime: number = 300
  ): Promise<void> {
    this.targetExpression = targetExpression;
    this.currentExpression = this.getCurrentExpression();
    this.transitionDuration = transitionTime;
    this.transitionStartTime = performance.now();

    if (!this.isRunning) {
      await this.startAnimation();
    }

    // Attendre que la transition soit terminée
    await new Promise(resolve => setTimeout(resolve, transitionTime));

    // Maintenir l'expression pendant la durée spécifiée
    await new Promise(resolve => setTimeout(resolve, duration - transitionTime));

    // Passer à l'animation suivante dans la file d'attente s'il y en a une
    const nextItem = this.priorityQueue.shift();
    if (nextItem) {
      await this.animateExpression(nextItem.expression, nextItem.duration);
    }
  }

  /**
   * Boucle d'animation principale
   */
  private async animationLoop(): Promise<void> {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime >= this.FRAME_TIME) {
      const frameStart = performance.now();

      try {
        await this.processFrame(currentTime);
        const frameDuration = performance.now() - frameStart;
        this.performanceMonitor.trackFrameTime(frameDuration);
      } catch (error) {
        await this.handleAnimationError(error);
      }

      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame(() => this.animationLoop());
  }

  /**
   * Traite une frame d'animation
   * @param currentTime Temps actuel
   */
  private async processFrame(currentTime: number): Promise<void> {
    const interpolatedExpression = this.interpolateExpression(currentTime);
    if (interpolatedExpression) {
      await this.applyExpression(interpolatedExpression);
    }
  }

  /**
   * Interpole entre l'expression actuelle et l'expression cible
   * @param currentTime Temps actuel
   * @returns Expression interpolée ou null si pas de transition en cours
   */
  private interpolateExpression(currentTime: number): RPMMorphTargets | null {
    if (!this.transitionDuration) return null;

    const progress = (currentTime - this.transitionStartTime) / this.transitionDuration;
    if (progress >= 1) {
      return this.targetExpression;
    }

    return this.interpolator.interpolateExpressions(
      this.currentExpression,
      this.targetExpression,
      progress
    );
  }

  /**
   * Applique une expression à l'avatar
   * @param expression Expression à appliquer
   */
  private async applyExpression(expression: RPMMorphTargets): Promise<void> {
    const optimizedExpression = this.optimizeExpression(expression);
    // Mise à jour avec la méthode appropriée
    try {
      // Conversion nécessaire car MorphTargetsManager n'est pas directement compatible
      // avec le type attendu par sendMorphTargets
      const morphData = this.convertToRawMorphTargets(optimizedExpression);
      await this.rpmClient.sendMorphTargets('current', morphData);
    } catch (error) {
      throw new RPMError('Failed to apply expression', error);
    }
  }

  /**
   * Convertit un MorphTargetsManager en dictionnaire simple pour l'API
   */
  private convertToRawMorphTargets(morphTargets: RPMMorphTargets): Record<string, number> {
    const result: Record<string, number> = {};

    // Extraire les propriétés connues
    const propertiesToExtract = [
      'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
      'eyeSquintLeft', 'eyeSquintRight', 'eyeBlinkLeft', 'eyeBlinkRight',
      'mouthSmile', 'mouthFrown', 'jawOpen'
    ];

    // Copier les propriétés connues
    for (const prop of propertiesToExtract) {
      const value = (morphTargets as Record<string, number | undefined>)[prop];
      if (typeof value === 'number') {
        result[prop] = value;
      }
    }

    // Si l'objet morphTargets a un map targets, extraire aussi ces valeurs
    if (morphTargets.targets) {
      for (const [key, value] of morphTargets.targets.entries()) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Optimise une expression en éliminant les valeurs insignifiantes
   * @param expression Expression à optimiser
   * @returns Expression optimisée
   */
  private optimizeExpression(expression: RPMMorphTargets): RPMMorphTargets {
    const optimized = new MorphTargetsManager();

    // Traiter les propriétés connues
    const propertiesToCheck = [
      'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
      'eyeSquintLeft', 'eyeSquintRight', 'eyeBlinkLeft', 'eyeBlinkRight',
      'mouthSmile', 'mouthFrown', 'jawOpen'
    ];

    // Copier uniquement les valeurs significatives
    for (const prop of propertiesToCheck) {
      const value = (expression as Record<string, number | undefined>)[prop];
      if (typeof value === 'number' && Math.abs(value) > 0.001) {
        // Utiliser la méthode setTarget pour éviter les erreurs de typage
        optimized.setTarget(prop, Math.round(value * 1000) / 1000);
      }
    }

    // Si l'expression a un map de cibles, traiter également ces valeurs
    if (expression.targets && typeof expression.getTarget === 'function') {
      for (const [key, value] of expression.targets.entries()) {
        if (Math.abs(value) > 0.001 && !propertiesToCheck.includes(key)) {
          optimized.setTarget(key, Math.round(value * 1000) / 1000);
        }
      }
    }

    return optimized;
  }

  /**
   * Gère les erreurs d'animation
   * @param error Erreur rencontrée
   */
  private async handleAnimationError(error: unknown): Promise<void> {
    console.error('Animation error:', error);

    if (error instanceof RPMError) {
      try {
        // Réessayer de communiquer avec le système RPM
        await this.rpmClient.getAvatarStatus('current');
      } catch (retryError) {
        console.error('Failed to recover from RPM error:', retryError);
      }
    }

    // Toujours propager l'erreur pour la gestion au niveau supérieur
    throw error;
  }

  /**
   * Réinitialise l'expression à l'état neutre
   */
  private async resetExpression(): Promise<void> {
    const neutralExpression = new MorphTargetsManager();
    await this.applyExpression(neutralExpression);
  }

  /**
   * Obtient une copie de l'expression actuelle
   * @returns Copie de l'expression actuelle
   */
  private getCurrentExpression(): RPMMorphTargets {
    const current = new MorphTargetsManager();

    // Utiliser setTarget pour chaque propriété pour éviter les erreurs de typage
    const propertiesToCopy = [
      'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
      'eyeSquintLeft', 'eyeSquintRight', 'eyeBlinkLeft', 'eyeBlinkRight',
      'mouthSmile', 'mouthFrown', 'jawOpen'
    ];

    for (const prop of propertiesToCopy) {
      const value = (this.currentExpression as Record<string, number | undefined>)[prop];
      if (typeof value === 'number') {
        current.setTarget(prop, value);
      }
    }

    // Copier les cibles personnalisées si disponibles
    if (this.currentExpression.targets && this.currentExpression.getTarget) {
      for (const [key, value] of this.currentExpression.targets.entries()) {
        current.setTarget(key, value);
      }
    }

    return current;
  }
}