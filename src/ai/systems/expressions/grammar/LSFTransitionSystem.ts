// src/ai/systems/expressions/grammar/LSFTransitionSystem.ts
import { LSFGrammarRules } from './LSFGrammarRules';
import {
  LSFExpression,
  EyebrowsPosition,
  HeadPosition,
  MouthConfiguration,
  Position3D,
  ExpressionComponentProperties
} from '../lsf/types';
import {
  TransitionRule,
  TransitionRuleSet,
  TransitionContext,
  TransitionStep,
  TransitionSequence,
  TransitionType,
  LSFExpressionType
} from './types/transition-types';

/**
 * Système de gestion des transitions entre expressions grammaticales en LSF
 * Responsable de calculer les étapes intermédiaires pour des transitions fluides
 */
export class LSFTransitionSystem {
  private readonly TRANSITION_RULES: TransitionRuleSet = {
    // Transition entre questions
    [TransitionType.QUESTION_TO_QUESTION]: {
      minDuration: 300,
      requiresReset: false,
      blendFactor: 0.7
    },
    // Transition vers la négation
    [TransitionType.TO_NEGATION]: {
      minDuration: 400,
      requiresReset: true,
      blendFactor: 0.5
    },
    // Transition d'emphase
    [TransitionType.TO_EMPHASIS]: {
      minDuration: 200,
      requiresReset: false,
      blendFactor: 0.8
    },
    // Transition vers condition
    [TransitionType.TO_CONDITION]: {
      minDuration: 350,
      requiresReset: true,
      blendFactor: 0.6
    },
    // Règle par défaut
    [TransitionType.DEFAULT]: {
      minDuration: 250,
      requiresReset: false,
      blendFactor: 0.6
    }
  };

  constructor(private grammarRules: LSFGrammarRules) { }

  /**
   * Calcule une séquence de transition entre deux expressions
   * @param fromExpression Expression de départ
   * @param toExpression Expression cible
   * @param context Contexte influençant la transition
   * @returns Séquence de transition complète
   */
  public async calculateTransition(
    fromExpression: LSFExpression,
    toExpression: LSFExpression,
    context: TransitionContext
  ): Promise<TransitionSequence> {
    const transitionType = this.determineTransitionType(
      fromExpression,
      toExpression
    );

    const rule = this.TRANSITION_RULES[transitionType] || this.getDefaultRule();

    return {
      steps: await this.generateTransitionSteps(
        fromExpression,
        toExpression,
        rule,
        context
      ),
      duration: this.calculateTransitionDuration(rule, context),
      metadata: {
        type: transitionType,
        requiresReset: rule.requiresReset,
        importance: context.importance || 'normal'
      }
    };
  }

  /**
   * Retourne la règle de transition par défaut
   * @returns Règle de transition par défaut
   */
  private getDefaultRule(): TransitionRule {
    return this.TRANSITION_RULES[TransitionType.DEFAULT];
  }

  /**
   * Calcule la durée totale d'une transition en fonction de la règle et du contexte
   * @param rule Règle de transition
   * @param context Contexte de la transition
   * @returns Durée en millisecondes
   */
  private calculateTransitionDuration(rule: TransitionRule, context: TransitionContext): number {
    const baseDuration = rule.minDuration;

    // Ajustement en fonction de la vitesse
    const speedFactor = {
      'slow': 1.5,
      'normal': 1.0,
      'fast': 0.7
    }[context.speed || 'normal'];

    // Ajustement en fonction de l'importance
    const importanceFactor = {
      'low': 0.9,
      'normal': 1.0,
      'high': 1.2
    }[context.importance || 'normal'];

    return Math.max(rule.minDuration, baseDuration * speedFactor * importanceFactor);
  }

  /**
   * Détermine le type de transition entre deux expressions
   * @param from Expression de départ
   * @param to Expression cible
   * @returns Type de transition
   */
  private determineTransitionType(
    from: LSFExpression,
    to: LSFExpression
  ): string {
    if (this.isQuestionType(from) && this.isQuestionType(to)) {
      return TransitionType.QUESTION_TO_QUESTION;
    }
    if (this.isNegationType(to)) {
      return TransitionType.TO_NEGATION;
    }
    if (this.isEmphasisType(to)) {
      return TransitionType.TO_EMPHASIS;
    }
    if (this.isConditionType(to)) {
      return TransitionType.TO_CONDITION;
    }
    return TransitionType.DEFAULT;
  }

  /**
   * Vérifie si une expression est de type question
   * @param expression Expression à vérifier
   * @returns true si c'est une question
   */
  private isQuestionType(expression: LSFExpression): boolean {
    return expression.expressionType === LSFExpressionType.QUESTION;
  }

  /**
   * Vérifie si une expression est de type négation
   * @param expression Expression à vérifier
   * @returns true si c'est une négation
   */
  private isNegationType(expression: LSFExpression): boolean {
    return expression.expressionType === LSFExpressionType.NEGATION;
  }

  /**
   * Vérifie si une expression est de type emphase
   * @param expression Expression à vérifier
   * @returns true si c'est une emphase
   */
  private isEmphasisType(expression: LSFExpression): boolean {
    return expression.expressionType === LSFExpressionType.EMPHASIS;
  }

  /**
   * Vérifie si une expression est de type condition
   * @param expression Expression à vérifier
   * @returns true si c'est une condition
   */
  private isConditionType(expression: LSFExpression): boolean {
    return expression.expressionType === LSFExpressionType.CONDITION;
  }

  /**
   * Génère les étapes de transition entre deux expressions
   * @param from Expression de départ
   * @param to Expression cible
   * @param rule Règle de transition à appliquer
   * @param context Contexte de la transition
   * @returns Liste des étapes de transition
   */
  private async generateTransitionSteps(
    from: LSFExpression,
    to: LSFExpression,
    rule: TransitionRule,
    context: TransitionContext
  ): Promise<TransitionStep[]> {
    const steps: TransitionStep[] = [];

    if (rule.requiresReset) {
      // Ajouter une étape de reset si nécessaire
      steps.push(await this.createResetStep());
    }

    // Calculer les étapes intermédiaires
    const intermediateSteps = await this.calculateIntermediateSteps(
      from,
      to,
      rule.blendFactor,
      context
    );
    steps.push(...intermediateSteps);

    return this.optimizeTransitionSteps(steps, context);
  }

  /**
   * Crée une étape de réinitialisation (position neutre)
   * @returns Étape de transition vers position neutre
   */
  private async createResetStep(): Promise<TransitionStep> {
    // Créer une expression neutre
    const neutralExpression: LSFExpression = {
      eyebrows: { raised: 0, furrowed: 0, asymmetry: 0, intensity: 0 },
      head: {
        rotation: { x: 0, y: 0, z: 0 },
        tilt: 0,
        nod: 0,
        intensity: 0
      },
      mouth: {
        openness: 0,
        spread: 0,
        roundness: 0,
        tensed: false,
        intensity: 0
      },
      // Définir un type d'expression explicite pour la position neutre
      expressionType: LSFExpressionType.DEFAULT
    };

    return {
      expression: neutralExpression,
      duration: 150, // Durée courte pour le reset
      easing: 'easeOut'
    };
  }

  /**
   * Calcule les étapes intermédiaires entre deux expressions
   * @param from Expression de départ
   * @param to Expression cible
   * @param blendFactor Facteur de mélange
   * @param context Contexte de la transition
   * @returns Liste des étapes intermédiaires
   */
  private async calculateIntermediateSteps(
    from: LSFExpression,
    to: LSFExpression,
    blendFactor: number,
    context: TransitionContext
  ): Promise<TransitionStep[]> {
    const steps: TransitionStep[] = [];

    // Ajuster le nombre d'étapes en fonction de la vitesse
    let numSteps = 3; // Nombre d'étapes par défaut
    if (context.speed === 'fast') {
      numSteps = 2;
    } else if (context.speed === 'slow' || context.importance === 'high') {
      numSteps = 4;
    }

    for (let i = 1; i <= numSteps; i++) {
      const progress = i / (numSteps + 1);
      const intermediateExpression = this.interpolateExpressions(
        from,
        to,
        progress,
        blendFactor
      );

      steps.push({
        expression: intermediateExpression,
        duration: this.calculateStepDuration(progress, context),
        easing: this.determineStepEasing(progress, context)
      });
    }

    return steps;
  }

  /**
   * Calcule la durée d'une étape individuelle
   * @param progress Progression relative dans la séquence
   * @param context Contexte de la transition
   * @returns Durée en millisecondes
   */
  private calculateStepDuration(progress: number, context: TransitionContext): number {
    // Distribution non linéaire des durées pour plus de naturel
    const baseDuration = 150;
    let factor = 1.0;

    // Les étapes du milieu sont plus rapides
    if (progress > 0.25 && progress < 0.75) {
      factor = 0.8;
    }

    // Ajustement selon la vitesse
    if (context.speed === 'fast') {
      factor *= 0.7;
    } else if (context.speed === 'slow') {
      factor *= 1.4;
    }

    return Math.round(baseDuration * factor);
  }

  /**
   * Détermine la fonction d'easing pour une étape
   * @param progress Progression relative dans la séquence
   * @param context Contexte de la transition
   * @returns Nom de la fonction d'easing
   */
  private determineStepEasing(progress: number, context: TransitionContext): string {
    // Première étape: accélération
    if (progress < 0.3) {
      return 'easeIn';
    }

    // Étapes du milieu: linéaire ou fluide selon l'importance
    if (progress < 0.7) {
      return context.importance === 'high' ? 'easeInOut' : 'linear';
    }

    // Dernières étapes: décélération
    return 'easeOut';
  }

  /**
   * Interpole entre deux expressions pour créer une expression intermédiaire
   * @param from Expression de départ
   * @param to Expression cible
   * @param progress Progression (0-1)
   * @param blendFactor Facteur de mélange
   * @returns Expression intermédiaire
   */
  private interpolateExpressions(
    from: LSFExpression,
    to: LSFExpression,
    progress: number,
    blendFactor: number
  ): LSFExpression {
    // Créer une expression avec les composants interpolés
    const result: LSFExpression = {
      eyebrows: this.interpolateEyebrows(
        from.eyebrows,
        to.eyebrows,
        progress,
        blendFactor
      ),
      head: this.interpolateHead(
        from.head,
        to.head,
        progress,
        blendFactor
      ),
      mouth: this.interpolateMouth(
        from.mouth,
        to.mouth,
        progress,
        blendFactor
      ),
      // Définir un type d'expression par défaut pour satisfaire exactOptionalPropertyTypes
      expressionType: LSFExpressionType.DEFAULT
    };

    // Préserver le type d'expression selon la progression
    // Avec gestion appropriée des undefined pour satisfaire exactOptionalPropertyTypes
    if (progress < 0.5 && from.expressionType !== undefined) {
      result.expressionType = from.expressionType;
    } else if (to.expressionType !== undefined) {
      result.expressionType = to.expressionType;
    }

    // Interpoler les propriétés optionnelles si présentes dans les deux expressions
    if (from.eyes && to.eyes) {
      result.eyes = this.interpolateGenericComponent(from.eyes, to.eyes, progress, blendFactor);
    }

    // Interpoler les métadonnées
    if (from.metadata || to.metadata) {
      result.metadata = {};

      // Durée
      if (from.metadata?.duration !== undefined && to.metadata?.duration !== undefined) {
        result.metadata.duration = from.metadata.duration +
          (to.metadata.duration - from.metadata.duration) * progress;
      }

      // Intensité
      if (from.metadata?.intensity !== undefined && to.metadata?.intensity !== undefined) {
        result.metadata.intensity = from.metadata.intensity +
          (to.metadata.intensity - from.metadata.intensity) * progress;
      }

      // Priorité
      if (from.metadata?.priority !== undefined && to.metadata?.priority !== undefined) {
        result.metadata.priority = from.metadata.priority +
          (to.metadata.priority - from.metadata.priority) * progress;
      }

      // Contexte culturel
      if (from.metadata?.cultural && to.metadata?.cultural) {
        result.metadata.cultural = progress < 0.5 ?
          from.metadata.cultural : to.metadata.cultural;
      }
    }

    return result;
  }

  /**
   * Interpole spécifiquement entre les positions des sourcils
   * @param from Position de départ
   * @param to Position cible
   * @param progress Progression (0-1)
   * @param blendFactor Facteur de mélange
   * @returns Position intermédiaire des sourcils
   */
  private interpolateEyebrows(
    from: EyebrowsPosition,
    to: EyebrowsPosition,
    progress: number,
    blendFactor: number
  ): EyebrowsPosition {
    const result: EyebrowsPosition = {};

    // Interpoler chaque propriété
    if (from.raised !== undefined && to.raised !== undefined) {
      result.raised = from.raised + (to.raised - from.raised) * (progress * blendFactor);
    }

    if (from.furrowed !== undefined && to.furrowed !== undefined) {
      result.furrowed = from.furrowed + (to.furrowed - from.furrowed) * (progress * blendFactor);
    }

    if (from.asymmetry !== undefined && to.asymmetry !== undefined) {
      result.asymmetry = from.asymmetry + (to.asymmetry - from.asymmetry) * (progress * blendFactor);
    }

    if (from.intensity !== undefined && to.intensity !== undefined) {
      result.intensity = from.intensity + (to.intensity - from.intensity) * (progress * blendFactor);
    }

    return result;
  }

  /**
   * Interpole spécifiquement entre les positions de la tête
   * @param from Position de départ
   * @param to Position cible
   * @param progress Progression (0-1)
   * @param blendFactor Facteur de mélange
   * @returns Position intermédiaire de la tête
   */
  private interpolateHead(
    from: HeadPosition,
    to: HeadPosition,
    progress: number,
    blendFactor: number
  ): HeadPosition {
    const result: HeadPosition = {};

    // Interpoler la rotation 3D si disponible
    if (from.rotation && to.rotation) {
      result.rotation = {
        x: from.rotation.x + (to.rotation.x - from.rotation.x) * (progress * blendFactor),
        y: from.rotation.y + (to.rotation.y - from.rotation.y) * (progress * blendFactor),
        z: from.rotation.z + (to.rotation.z - from.rotation.z) * (progress * blendFactor)
      };
    }

    // Interpoler les autres propriétés numériques
    if (from.tilt !== undefined && to.tilt !== undefined) {
      result.tilt = from.tilt + (to.tilt - from.tilt) * (progress * blendFactor);
    }

    if (from.nod !== undefined && to.nod !== undefined) {
      result.nod = from.nod + (to.nod - from.nod) * (progress * blendFactor);
    }

    if (from.intensity !== undefined && to.intensity !== undefined) {
      result.intensity = from.intensity + (to.intensity - from.intensity) * (progress * blendFactor);
    }

    return result;
  }

  /**
   * Interpole spécifiquement entre les configurations de la bouche
   * @param from Configuration de départ
   * @param to Configuration cible
   * @param progress Progression (0-1)
   * @param blendFactor Facteur de mélange
   * @returns Configuration intermédiaire de la bouche
   */
  private interpolateMouth(
    from: MouthConfiguration,
    to: MouthConfiguration,
    progress: number,
    blendFactor: number
  ): MouthConfiguration {
    const result: MouthConfiguration = {};

    // Interpoler les propriétés numériques
    if (from.openness !== undefined && to.openness !== undefined) {
      result.openness = from.openness + (to.openness - from.openness) * (progress * blendFactor);
    }

    if (from.spread !== undefined && to.spread !== undefined) {
      result.spread = from.spread + (to.spread - from.spread) * (progress * blendFactor);
    }

    if (from.roundness !== undefined && to.roundness !== undefined) {
      result.roundness = from.roundness + (to.roundness - from.roundness) * (progress * blendFactor);
    }

    if (from.intensity !== undefined && to.intensity !== undefined) {
      result.intensity = from.intensity + (to.intensity - from.intensity) * (progress * blendFactor);
    }

    // Gérer spécifiquement la propriété booléenne
    if (from.tensed !== undefined && to.tensed !== undefined) {
      // Basculer à mi-chemin
      result.tensed = progress < 0.5 ? from.tensed : to.tensed;
    }

    return result;
  }

  /**
   * Interpole entre deux composants génériques d'expression
   * @param from Composant de départ
   * @param to Composant cible
   * @param progress Progression (0-1)
   * @param blendFactor Facteur de mélange
   * @returns Composant intermédiaire
   */
  private interpolateGenericComponent(
    from: ExpressionComponentProperties,
    to: ExpressionComponentProperties,
    progress: number,
    blendFactor: number
  ): ExpressionComponentProperties {
    const result: ExpressionComponentProperties = {};
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);

    for (const key of allKeys) {
      // Valeurs numériques - interpolation linéaire
      if (typeof from[key] === 'number' && typeof to[key] === 'number') {
        result[key] = from[key] as number +
          ((to[key] as number) - (from[key] as number)) *
          (progress * blendFactor);
      }
      // Position 3D - interpolation par composant
      else if (
        this.isPosition3D(from[key]) &&
        this.isPosition3D(to[key])
      ) {
        const fromPos = from[key] as Position3D;
        const toPos = to[key] as Position3D;

        result[key] = {
          x: fromPos.x + (toPos.x - fromPos.x) * (progress * blendFactor),
          y: fromPos.y + (toPos.y - fromPos.y) * (progress * blendFactor),
          z: fromPos.z + (toPos.z - fromPos.z) * (progress * blendFactor)
        };
      }
      // Booléens - basculement à mi-chemin
      else if (typeof from[key] === 'boolean' && typeof to[key] === 'boolean') {
        result[key] = progress < 0.5 ? from[key] : to[key];
      }
      // Objets imbriqués - récursion
      else if (
        typeof from[key] === 'object' &&
        from[key] !== null &&
        typeof to[key] === 'object' &&
        to[key] !== null
      ) {
        result[key] = this.interpolateGenericComponent(
          from[key] as ExpressionComponentProperties,
          to[key] as ExpressionComponentProperties,
          progress,
          blendFactor
        );
      }
      // Autres types ou valeurs mixtes - basculement à mi-chemin
      else {
        result[key] = progress < 0.5 ? from[key] : to[key];
      }
    }

    return result;
  }

  /**
   * Vérifie si un objet est une Position3D
   * @param value Valeur à vérifier
   * @returns true si c'est une Position3D
   */
  private isPosition3D(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const pos = value as Partial<Position3D>;
    return (
      typeof pos.x === 'number' &&
      typeof pos.y === 'number' &&
      typeof pos.z === 'number'
    );
  }

  /**
   * Optimise une séquence de transitions en fonction du contexte
   * @param steps Étapes de transition
   * @param context Contexte de la transition
   * @returns Étapes optimisées
   */
  private optimizeTransitionSteps(
    steps: TransitionStep[],
    context: TransitionContext
  ): TransitionStep[] {
    if (context.speed === 'fast') {
      // Réduire le nombre d'étapes pour une transition rapide
      return this.simplifyTransition(steps);
    }

    if (context.importance === 'high') {
      // Ajouter plus de précision pour les transitions importantes
      return this.enhanceTransition(steps);
    }

    return steps;
  }

  /**
   * Simplifie une séquence de transition (moins d'étapes)
   * @param steps Étapes de transition originales
   * @returns Étapes simplifiées
   */
  private simplifyTransition(steps: TransitionStep[]): TransitionStep[] {
    // Garder uniquement les étapes les plus significatives
    return steps.filter((_, index) => index % 2 === 0);
  }

  /**
   * Améliore une séquence de transition (plus de fluidité)
   * @param steps Étapes de transition originales
   * @returns Étapes améliorées
   */
  private enhanceTransition(steps: TransitionStep[]): TransitionStep[] {
    // Ajouter des micro-ajustements pour plus de fluidité
    return steps.reduce((enhanced, step, index) => {
      enhanced.push(step);

      // Ne pas ajouter de micro-ajustement après la dernière étape
      if (index < steps.length - 1) {
        enhanced.push(this.createMicroAdjustment(step));
      }

      return enhanced;
    }, [] as TransitionStep[]);
  }

  /**
   * Crée un micro-ajustement après une étape
   * @param step Étape de base
   * @returns Étape de micro-ajustement
   */
  private createMicroAdjustment(step: TransitionStep): TransitionStep {
    return {
      ...step,
      duration: Math.round(step.duration * 0.3),
      easing: 'easeInOut'
    };
  }
}