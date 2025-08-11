// src/ai/systems/expressions/emotions/integration/LSFConflictResolver.ts

/**
 * Interface pour un point de conflit entre expression grammaticale et émotionnelle
 */
export interface ConflictPoint {
  /** Composant concerné par le conflit */
  component: string;
  /** Valeur grammaticale */
  grammaticalValue: number | boolean;
  /** Valeur émotionnelle */
  emotionalValue: number | boolean;
  /** Degré de conflit (0-1) */
  conflictDegree: number;
  /** Impact sur la compréhension (0-1) */
  comprehensionImpact: number;
}

/**
 * Interface pour les données de conflit
 */
export interface ConflictData {
  /** Composant grammatical */
  grammaticalComponent: ConflictComponent;
  /** Composant émotionnel */
  emotionalComponent: ConflictComponent;
  /** Type de conflit */
  type: string;
  /** Sévérité du conflit (0-1) */
  severity: number;
}

/**
 * Interface pour un composant d'expression sujet à conflit
 */
export interface ConflictComponent {
  /** Type de composant */
  type: string;
  /** Position */
  position: number;
  /** Intensité */
  intensity: number;
  /** Est un marqueur grammatical */
  isGrammaticalMarker?: boolean | undefined;
  /** Propriétés du composant */
  properties: Record<string, number | boolean>;
}

/**
 * Interface pour le contexte d'un conflit
 */
export interface ConflictContext {
  /** Type grammatical (QUESTIONS, NEGATION, etc.) */
  grammaticalType: keyof ConflictRulesType;
  /** Composant concerné (EYEBROWS, GAZE, etc.) */
  component: string;
  /** Type d'émotion (JOY, SADNESS, etc.) */
  emotionType: string;
  /** Priorité optionnelle */
  priority?: 'GRAMMAR' | 'EMOTION' | 'BALANCED';
}

/**
 * Interface pour l'analyse d'un conflit
 */
export interface ConflictAnalysis {
  /** Sévérité du conflit (0-1) */
  severity: number;
  /** Points de conflit spécifiques */
  points: ConflictPoint[];
  /** Impact sur la compréhension (0-1) */
  comprehensionImpact: number;
  /** Capacité de résolution (0-1) */
  resolvability: number;
}

/**
 * Types de stratégies de résolution
 */
export type ResolutionStrategyType =
  'PRIORITIZE_GRAMMAR' | 'PRIORITIZE_EMOTION' | 'WEIGHTED_BLEND' |
  'MUTUAL_REINFORCEMENT' | 'TEMPORAL_ALTERNATION' | 'COMPONENT_SPLIT';

/**
 * Interface pour une stratégie de résolution
 */
export interface ResolutionStrategy {
  /** Type de stratégie */
  type: ResolutionStrategyType;
  /** Propriétés spécifiques à la stratégie */
  [key: string]: unknown;
}

/**
 * Interface pour une stratégie avec priorité à la grammaire
 */
export interface GrammarPriorityStrategy extends ResolutionStrategy {
  type: 'PRIORITIZE_GRAMMAR';
  /** Ratio de mélange */
  blendRatio: number;
  /** Transitions à appliquer */
  transitions: TransitionParameters;
}

/**
 * Interface pour une stratégie avec priorité à l'émotion
 */
export interface EmotionPriorityStrategy extends ResolutionStrategy {
  type: 'PRIORITIZE_EMOTION';
  /** Ratio de mélange */
  blendRatio: number;
  /** Adaptations à appliquer */
  adaptations: AdaptationParameters;
}

/**
 * Interface pour une stratégie de mélange pondéré
 */
export interface WeightedBlendStrategy extends ResolutionStrategy {
  type: 'WEIGHTED_BLEND';
  /** Poids de mélange */
  weights: BlendWeights;
  /** Facteurs de lissage */
  smoothing: SmoothingFactors;
}

/**
 * Interface pour une stratégie de renforcement mutuel
 */
export interface MutualReinforcementStrategy extends ResolutionStrategy {
  type: 'MUTUAL_REINFORCEMENT';
  /** Facteur d'amplification */
  amplification: number;
  /** Paramètres de synchronisation */
  synchronization: SynchronizationParameters;
}

/**
 * Interface pour une stratégie d'alternance temporelle
 */
export interface TemporalAlternationStrategy extends ResolutionStrategy {
  type: 'TEMPORAL_ALTERNATION';
  /** Séquence d'alternance */
  sequence: AlternationSequence;
  /** Timing d'alternance */
  timing: AlternationTiming;
}

/**
 * Interface pour une stratégie de séparation des composants
 */
export interface ComponentSplitStrategy extends ResolutionStrategy {
  type: 'COMPONENT_SPLIT';
  /** Distribution des composants */
  distribution: ComponentDistribution;
  /** Coordination des composants */
  coordination: ComponentCoordination;
}

/**
 * Interface pour une résolution de conflit
 */
export interface ConflictResolution {
  /** Composant résolu */
  resolvedComponent: ConflictComponent;
  /** Métadonnées de résolution */
  metadata: {
    /** Stratégie appliquée */
    strategy: ResolutionStrategy;
    /** Efficacité de la résolution (0-1) */
    effectiveness: number;
    /** Niveau de compréhensibilité (0-1) */
    comprehensibility: number;
    /** Degré de naturalité (0-1) */
    naturalness: number;
  };
}

/**
 * Interface pour les scores de validation
 */
export interface ValidationScores {
  /** Score de préservation grammaticale (0-1) */
  grammaticalityScore: number;
  /** Score d'expressivité émotionnelle (0-1) */
  emotionalityScore: number;
  /** Score de naturalité (0-1) */
  naturalnessScore: number;
  /** Score de cohérence culturelle (0-1) */
  culturalScore: number;
}

/**
 * Interface pour les paramètres de transition
 */
export interface TransitionParameters {
  /** Durée de transition */
  duration: number;
  /** Type d'easing */
  easing: string;
  /** Points de contrôle */
  controlPoints: number[];
}

/**
 * Interface pour les paramètres d'adaptation
 */
export interface AdaptationParameters {
  /** Facteur d'intensité */
  intensityFactor: number;
  /** Déplacement spatial */
  spatialOffset: number;
  /** Caractéristiques préservées */
  preservedFeatures: string[];
}

/**
 * Interface pour les poids de mélange
 */
export interface BlendWeights {
  /** Poids grammatical */
  grammar: number;
  /** Poids émotionnel */
  emotion: number;
  /** Distribution par composant */
  components: Record<string, { grammar: number; emotion: number }>;
}

/**
 * Interface pour les facteurs de lissage
 */
export interface SmoothingFactors {
  /** Facteur temporel */
  temporal: number;
  /** Facteur spatial */
  spatial: number;
  /** Facteur d'intensité */
  intensity: number;
}

/**
 * Interface pour les paramètres de synchronisation
 */
export interface SynchronizationParameters {
  /** Offset temporel */
  temporalOffset: number;
  /** Mode de synchronisation */
  mode: 'parallel' | 'sequential' | 'adaptive';
  /** Points de synchronisation */
  syncPoints: number[];
}

/**
 * Interface pour une séquence d'alternance
 */
export interface AlternationSequence {
  /** Ordre des phases */
  order: ('grammar' | 'emotion')[];
  /** Poids par phase */
  weights: number[];
  /** Nombre de cycles */
  cycles: number;
}

/**
 * Interface pour le timing d'alternance
 */
export interface AlternationTiming {
  /** Durée totale */
  totalDuration: number;
  /** Durée par phase */
  phaseDurations: number[];
  /** Type d'easing */
  easingType: string;
}

/**
 * Interface pour la distribution des composants
 */
export interface ComponentDistribution {
  /** Attributions grammaticales */
  grammaticalAssignments: string[];
  /** Attributions émotionnelles */
  emotionalAssignments: string[];
  /** Force de la séparation */
  separationStrength: number;
}

/**
 * Interface pour la coordination des composants
 */
export interface ComponentCoordination {
  /** Mode de coordination */
  mode: 'synchronous' | 'asynchronous' | 'cascading';
  /** Délais entre composants */
  delays: Record<string, number>;
  /** Durée de la coordination */
  duration: number;
}

/**
 * Type pour les règles de conflit
 */
export type ConflictRulesType = {
  [grammaticalType: string]: {
    [component: string]: {
      [emotionType: string]: {
        priority: string;
        blend_ratio: number;
      };
    };
  };
};

/**
 * Erreur spécifique pour les échecs de résolution de conflit
 */
export class ConflictResolutionError extends Error {
  /**
   * Crée une nouvelle erreur de résolution de conflit
   * @param message Le message d'erreur
   * @param validationScores Les scores de validation ayant échoué
   */
  constructor(
    message: string,
    public readonly validationScores: ValidationScores
  ) {
    super(message);
    this.name = 'ConflictResolutionError';
  }
}

/**
 * Système de résolution des conflits entre expressions grammaticales et émotionnelles en LSF
 */
export class LSFConflictResolver {
  /**
   * Règles de priorité pour les conflits connus
   */
  private readonly CONFLICT_RULES: ConflictRulesType = {
    QUESTIONS: {
      // Conflits sourcils/émotions dans les questions
      EYEBROWS: {
        JOY: { priority: 'GRAMMAR', blend_ratio: 0.7 },
        SADNESS: { priority: 'BLEND', blend_ratio: 0.5 },
        ANGER: { priority: 'EMOTION', blend_ratio: 0.8 },
        SURPRISE: { priority: 'REINFORCE', blend_ratio: 1.0 },
        FEAR: { priority: 'EMOTION', blend_ratio: 0.9 }
      },
      // Conflits regard/émotions dans les questions
      GAZE: {
        JOY: { priority: 'GRAMMAR', blend_ratio: 0.6 },
        SADNESS: { priority: 'EMOTION', blend_ratio: 0.7 },
        ANGER: { priority: 'SPLIT', blend_ratio: 0.5 },
        SURPRISE: { priority: 'REINFORCE', blend_ratio: 1.0 },
        FEAR: { priority: 'ALTERNATE', blend_ratio: 0.5 }
      }
    },
    NEGATION: {
      // Conflits tête/émotions dans la négation
      HEAD: {
        JOY: { priority: 'GRAMMAR', blend_ratio: 0.8 },
        SADNESS: { priority: 'REINFORCE', blend_ratio: 1.0 },
        ANGER: { priority: 'EMOTION', blend_ratio: 0.7 },
        SURPRISE: { priority: 'GRAMMAR', blend_ratio: 0.9 },
        FEAR: { priority: 'BLEND', blend_ratio: 0.6 }
      },
      // Conflits expression faciale/émotions dans la négation
      FACE: {
        JOY: { priority: 'ALTERNATE', blend_ratio: 0.5 },
        SADNESS: { priority: 'REINFORCE', blend_ratio: 1.0 },
        ANGER: { priority: 'EMOTION', blend_ratio: 0.8 },
        SURPRISE: { priority: 'GRAMMAR', blend_ratio: 0.7 },
        FEAR: { priority: 'BLEND', blend_ratio: 0.6 }
      }
    }
  };

  /**
   * Applique une stratégie de résolution à un conflit
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyResolutionStrategy(
    conflictData: ConflictData,
    strategy: ResolutionStrategy,
    context: ConflictContext
  ): Promise<ConflictResolution> {
    switch (strategy.type) {
      case 'PRIORITIZE_GRAMMAR':
        return await this.applyGrammarPriority(
          conflictData,
          strategy as GrammarPriorityStrategy,
          context
        );

      case 'PRIORITIZE_EMOTION':
        return await this.applyEmotionPriority(
          conflictData,
          strategy as EmotionPriorityStrategy,
          context
        );

      case 'WEIGHTED_BLEND':
        return await this.applyWeightedBlend(
          conflictData,
          strategy as WeightedBlendStrategy,
          context
        );

      case 'MUTUAL_REINFORCEMENT':
        return await this.applyMutualReinforcement(
          conflictData,
          strategy as MutualReinforcementStrategy,
          context
        );

      case 'TEMPORAL_ALTERNATION':
        return await this.applyTemporalAlternation(
          conflictData,
          strategy as TemporalAlternationStrategy,
          context
        );

      case 'COMPONENT_SPLIT':
        return await this.applyComponentSplit(
          conflictData,
          strategy as ComponentSplitStrategy,
          context
        );

      default:
        throw new Error(`Unknown strategy type: ${strategy.type}`);
    }
  }

  /**
   * Résout un conflit entre expressions grammaticales et émotionnelles
   * @param conflictData Les données du conflit
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  async resolveConflicts(
    conflictData: ConflictData,
    context: ConflictContext
  ): Promise<ConflictResolution> {
    // Analyser le conflit
    const analysis = await this.analyzeConflict(conflictData);

    // Déterminer la stratégie de résolution
    const strategy = this.determineResolutionStrategy(analysis, context);

    // Appliquer la résolution
    const resolution = await this.applyResolutionStrategy(
      conflictData,
      strategy,
      context
    );

    // Valider la résolution
    await this.validateResolution(resolution, conflictData);

    return resolution;
  }

  /**
   * Analyse un conflit pour déterminer sa gravité et son impact
   * @param conflictData Les données du conflit
   * @returns L'analyse du conflit
   */
  private async analyzeConflict(
    conflictData: ConflictData
  ): Promise<ConflictAnalysis> {
    const { grammaticalComponent, emotionalComponent, type } = conflictData;

    // Déterminer la sévérité du conflit
    const severity = this.calculateConflictSeverity(
      grammaticalComponent,
      emotionalComponent
    );

    // Identifier les points de conflit spécifiques
    const conflictPoints = this.identifyConflictPoints(
      grammaticalComponent,
      emotionalComponent
    );

    // Évaluer l'impact sur la compréhension
    const comprehensionImpact = await this.evaluateComprehensionImpact(
      conflictPoints,
      type
    );

    return {
      severity,
      points: conflictPoints,
      comprehensionImpact,
      resolvability: this.assessResolvability(severity, comprehensionImpact)
    };
  }

  /**
   * Calcule la sévérité d'un conflit entre deux composants
   * @param grammaticalComponent Le composant grammatical
   * @param emotionalComponent Le composant émotionnel
   * @returns La sévérité du conflit (0-1)
   */
  private calculateConflictSeverity(
    grammaticalComponent: ConflictComponent,
    emotionalComponent: ConflictComponent
  ): number {
    let severitySum = 0;
    let factors = 0;

    // Comparer les intensités
    const intensityDiff = Math.abs(grammaticalComponent.intensity - emotionalComponent.intensity);
    severitySum += intensityDiff;
    factors++;

    // Comparer les positions
    const positionDiff = Math.abs(grammaticalComponent.position - emotionalComponent.position);
    severitySum += positionDiff;
    factors++;

    // Comparer les propriétés communes
    const commonProperties = Object.keys(grammaticalComponent.properties)
      .filter(key => key in emotionalComponent.properties);

    for (const key of commonProperties) {
      const gramValue = grammaticalComponent.properties[key];
      const emoValue = emotionalComponent.properties[key];

      if (typeof gramValue === 'number' && typeof emoValue === 'number') {
        severitySum += Math.abs(gramValue - emoValue);
        factors++;
      } else if (gramValue !== emoValue) {
        severitySum += 1; // Différence maximale pour les valeurs non numériques différentes
        factors++;
      }
    }

    // Calculer la sévérité moyenne et normaliser entre 0 et 1
    const avgSeverity = factors > 0 ? severitySum / factors : 0;
    return Math.min(1, avgSeverity);
  }

  /**
   * Identifie les points de conflit spécifiques entre deux composants
   * @param grammaticalComponent Le composant grammatical
   * @param emotionalComponent Le composant émotionnel
   * @returns Les points de conflit identifiés
   */
  private identifyConflictPoints(
    grammaticalComponent: ConflictComponent,
    emotionalComponent: ConflictComponent
  ): ConflictPoint[] {
    const conflictPoints: ConflictPoint[] = [];

    // Vérifier les propriétés communes
    const allProperties = new Set([
      ...Object.keys(grammaticalComponent.properties),
      ...Object.keys(emotionalComponent.properties)
    ]);

    for (const prop of allProperties) {
      const gramValue = grammaticalComponent.properties[prop];
      const emoValue = emotionalComponent.properties[prop];

      // S'il y a une différence significative, c'est un point de conflit
      if (
        (typeof gramValue === 'number' &&
          typeof emoValue === 'number' &&
          Math.abs(gramValue - emoValue) > 0.2) ||
        (gramValue !== emoValue &&
          (gramValue !== undefined && emoValue !== undefined))
      ) {
        const conflictDegree = typeof gramValue === 'number' && typeof emoValue === 'number'
          ? Math.min(1, Math.abs(gramValue - emoValue))
          : 1;

        conflictPoints.push({
          component: prop,
          grammaticalValue: gramValue,
          emotionalValue: emoValue,
          conflictDegree,
          comprehensionImpact: this.estimateComprehensionImpact(prop, conflictDegree)
        });
      }
    }

    // Ajouter les conflits de position et d'intensité si significatifs
    if (Math.abs(grammaticalComponent.position - emotionalComponent.position) > 0.2) {
      const positionConflict = Math.min(1, Math.abs(
        grammaticalComponent.position - emotionalComponent.position
      ));

      conflictPoints.push({
        component: 'position',
        grammaticalValue: grammaticalComponent.position,
        emotionalValue: emotionalComponent.position,
        conflictDegree: positionConflict,
        comprehensionImpact: this.estimateComprehensionImpact('position', positionConflict)
      });
    }

    if (Math.abs(grammaticalComponent.intensity - emotionalComponent.intensity) > 0.2) {
      const intensityConflict = Math.min(1, Math.abs(
        grammaticalComponent.intensity - emotionalComponent.intensity
      ));

      conflictPoints.push({
        component: 'intensity',
        grammaticalValue: grammaticalComponent.intensity,
        emotionalValue: emotionalComponent.intensity,
        conflictDegree: intensityConflict,
        comprehensionImpact: this.estimateComprehensionImpact('intensity', intensityConflict)
      });
    }

    return conflictPoints;
  }

  /**
   * Estime l'impact sur la compréhension d'un conflit sur un composant spécifique
   * @param component Le composant concerné
   * @param conflictDegree Le degré de conflit
   * @returns L'impact estimé sur la compréhension (0-1)
   */
  private estimateComprehensionImpact(component: string, conflictDegree: number): number {
    // Définir l'importance de chaque composant pour la compréhension
    const componentImportance: Record<string, number> = {
      position: 0.8,
      intensity: 0.6,
      eyebrows: 0.9,
      gaze: 0.7,
      head: 0.8,
      hands: 0.9,
      mouth: 0.7,
      posture: 0.5
    };

    // Importance par défaut pour les composants non listés
    const defaultImportance = 0.5;

    // Calculer l'impact en fonction de l'importance du composant et du degré de conflit
    const importance = componentImportance[component] || defaultImportance;
    return importance * conflictDegree;
  }

  /**
   * Évalue l'impact global sur la compréhension d'une série de points de conflit
   * @param conflictPoints Les points de conflit
   * @param type Le type de conflit
   * @returns L'impact global sur la compréhension (0-1)
   */
  private async evaluateComprehensionImpact(
    conflictPoints: ConflictPoint[],
    type: string
  ): Promise<number> {
    if (conflictPoints.length === 0) {
      return 0;
    }

    // Facteurs d'ajustement selon le type de conflit
    const typeFactors: Record<string, number> = {
      QUESTION: 1.2,      // Les conflits dans les questions ont un impact plus important
      NEGATION: 1.3,      // Les conflits dans les négations ont un impact très important
      CONDITIONAL: 1.1,   // Impact modéré pour les conditionnels
      EMPHASIS: 0.9,      // Impact légèrement réduit pour l'emphase
      DEFAULT: 1.0        // Facteur par défaut
    };

    // Calculer l'impact moyen pondéré par l'importance des composants
    let weightedSum = 0;
    let weightSum = 0;

    for (const point of conflictPoints) {
      weightedSum += point.comprehensionImpact;
      weightSum += 1;
    }

    // Impact moyen
    const baseImpact = weightSum > 0 ? weightedSum / weightSum : 0;

    // Appliquer le facteur d'ajustement selon le type
    const factor = typeFactors[type] || typeFactors.DEFAULT;

    return Math.min(1, baseImpact * factor);
  }

  /**
   * Évalue la capacité à résoudre un conflit
   * @param severity La sévérité du conflit
   * @param comprehensionImpact L'impact sur la compréhension
   * @returns Score de résolvabilité (0-1)
   */
  private assessResolvability(severity: number, comprehensionImpact: number): number {
    // Les conflits très sévères avec un fort impact sont plus difficiles à résoudre
    const difficultyFactor = severity * 0.7 + comprehensionImpact * 0.3;

    // Inversion pour obtenir la résolvabilité (plus la difficulté est élevée, moins c'est résolvable)
    return Math.max(0, 1 - (difficultyFactor * 0.8));
  }

  /**
   * Détermine la stratégie de résolution appropriée
   * @param analysis L'analyse du conflit
   * @param context Le contexte du conflit
   * @returns La stratégie de résolution
   */
  private determineResolutionStrategy(
    analysis: ConflictAnalysis,
    context: ConflictContext
  ): ResolutionStrategy {
    // Vérifier si nous avons une règle spécifique pour ce type de conflit
    const grammaticalType = context.grammaticalType;
    const component = context.component;
    const emotionType = context.emotionType;

    // Accéder aux règles de conflit de manière sécurisée
    const componentRules = this.CONFLICT_RULES[grammaticalType]?.[component];
    const rule = componentRules?.[emotionType];

    if (!rule) {
      return this.generateDefaultStrategy(analysis, context);
    }

    switch (rule.priority) {
      case 'GRAMMAR':
        return {
          type: 'PRIORITIZE_GRAMMAR',
          blendRatio: rule.blend_ratio,
          transitions: this.calculateTransitions(analysis, rule)
        } as GrammarPriorityStrategy;

      case 'EMOTION':
        return {
          type: 'PRIORITIZE_EMOTION',
          blendRatio: rule.blend_ratio,
          adaptations: this.calculateAdaptations(analysis, rule)
        } as EmotionPriorityStrategy;

      case 'BLEND':
        return {
          type: 'WEIGHTED_BLEND',
          weights: this.calculateBlendWeights(analysis, rule),
          smoothing: this.determineSmoothingFactors(analysis)
        } as WeightedBlendStrategy;

      case 'REINFORCE':
        return {
          type: 'MUTUAL_REINFORCEMENT',
          amplification: this.calculateAmplification(analysis, rule),
          synchronization: this.determineSynchronization(analysis)
        } as MutualReinforcementStrategy;

      case 'ALTERNATE':
        return {
          type: 'TEMPORAL_ALTERNATION',
          sequence: this.designAlternationSequence(analysis, rule),
          timing: this.calculateAlternationTiming(analysis)
        } as TemporalAlternationStrategy;

      case 'SPLIT':
        return {
          type: 'COMPONENT_SPLIT',
          distribution: this.calculateComponentDistribution(analysis, rule),
          coordination: this.determineComponentCoordination(analysis)
        } as ComponentSplitStrategy;

      default:
        return this.generateDefaultStrategy(analysis, context);
    }
  }

  /**
   * Génère une stratégie de résolution par défaut
   * @param analysis L'analyse du conflit
   * @param context Le contexte du conflit
   * @returns Une stratégie de résolution par défaut
   */
  private generateDefaultStrategy(
    analysis: ConflictAnalysis,
    context: ConflictContext
  ): ResolutionStrategy {
    // Si une priorité est spécifiée dans le contexte, l'utiliser
    if (context.priority) {
      switch (context.priority) {
        case 'GRAMMAR':
          return {
            type: 'PRIORITIZE_GRAMMAR',
            blendRatio: 0.8,
            transitions: this.calculateTransitions(analysis, { blend_ratio: 0.8 })
          } as GrammarPriorityStrategy;

        case 'EMOTION':
          return {
            type: 'PRIORITIZE_EMOTION',
            blendRatio: 0.8,
            adaptations: this.calculateAdaptations(analysis, { blend_ratio: 0.8 })
          } as EmotionPriorityStrategy;

        case 'BALANCED':
          return {
            type: 'WEIGHTED_BLEND',
            weights: {
              grammar: 0.5,
              emotion: 0.5,
              components: {}
            },
            smoothing: this.determineSmoothingFactors(analysis)
          } as WeightedBlendStrategy;
      }
    }

    // Stratégie basée sur la résolvabilité et l'impact sur la compréhension
    if (analysis.comprehensionImpact > 0.7) {
      // Priorité à la grammaire pour les conflits à fort impact sur la compréhension
      return {
        type: 'PRIORITIZE_GRAMMAR',
        blendRatio: 0.7,
        transitions: this.calculateTransitions(analysis, { blend_ratio: 0.7 })
      } as GrammarPriorityStrategy;
    } else if (analysis.resolvability < 0.4) {
      // Séparation des composants pour les conflits difficiles à résoudre
      return {
        type: 'COMPONENT_SPLIT',
        distribution: this.calculateComponentDistribution(analysis, { blend_ratio: 0.5 }),
        coordination: this.determineComponentCoordination(analysis)
      } as ComponentSplitStrategy;
    } else {
      // Mélange pondéré pour les cas standards
      return {
        type: 'WEIGHTED_BLEND',
        weights: {
          grammar: 0.6,
          emotion: 0.4,
          components: {}
        },
        smoothing: this.determineSmoothingFactors(analysis)
      } as WeightedBlendStrategy;
    }
  }

  /**
   * Calcule les paramètres de transition pour une stratégie de priorité grammaticale
   * @param analysis L'analyse du conflit
   * @param rule La règle de conflit
   * @returns Les paramètres de transition
   */
  private calculateTransitions(
    analysis: ConflictAnalysis,
    rule: { blend_ratio: number }
  ): TransitionParameters {
    // Durée basée sur la sévérité du conflit
    const duration = 0.3 + (analysis.severity * 0.4);

    // Type d'easing basé sur le ratio de mélange
    const easing = rule.blend_ratio > 0.7 ? 'easeOutCubic' : 'easeInOutQuad';

    // Points de contrôle pour la courbe de transition
    const controlPoints = [0, 0.3, 0.7, 1];

    return {
      duration,
      easing,
      controlPoints
    };
  }

  /**
   * Calcule les paramètres d'adaptation pour une stratégie de priorité émotionnelle
   * @param analysis L'analyse du conflit
   * @param rule La règle de conflit
   * @returns Les paramètres d'adaptation
   */
  private calculateAdaptations(
    analysis: ConflictAnalysis,
    rule: { blend_ratio: number }
  ): AdaptationParameters {
    // Facteur d'intensité basé sur le ratio de mélange
    const intensityFactor = rule.blend_ratio;

    // Offset spatial pour éviter les interférences
    const spatialOffset = 0.1 + (0.2 * (1 - analysis.resolvability));

    // Caractéristiques grammaticales à préserver
    const preservedFeatures = analysis.points
      .filter(point => point.comprehensionImpact > 0.6)
      .map(point => point.component);

    return {
      intensityFactor,
      spatialOffset,
      preservedFeatures
    };
  }

  /**
     * Calcule les poids de mélange pour une stratégie de mélange pondéré
     * @param analysis L'analyse du conflit
     * @param rule La règle de conflit
     * @returns Les poids de mélange
     */
  private calculateBlendWeights(
    analysis: ConflictAnalysis,
    rule: { blend_ratio: number }
  ): BlendWeights {
    // Poids globaux basés sur le ratio de mélange
    const grammarWeight = rule.blend_ratio;
    const emotionWeight = 1 - grammarWeight;

    // Distribution des poids par composant
    const componentWeights: Record<string, { grammar: number; emotion: number }> = {};

    // Ajuster les poids par composant en fonction de l'impact sur la compréhension
    for (const point of analysis.points) {
      // Plus l'impact sur la compréhension est élevé, plus on favorise la grammaire
      const adjustedGrammarWeight = grammarWeight * (1 + (point.comprehensionImpact * 0.5));
      const normalizedGrammarWeight = Math.min(1, adjustedGrammarWeight);
      const normalizedEmotionWeight = 1 - normalizedGrammarWeight;

      componentWeights[point.component] = {
        grammar: normalizedGrammarWeight,
        emotion: normalizedEmotionWeight
      };
    }

    return {
      grammar: grammarWeight,
      emotion: emotionWeight,
      components: componentWeights
    };
  }

  /**
   * Détermine les facteurs de lissage pour une stratégie de mélange pondéré
   * @param analysis L'analyse du conflit
   * @returns Les facteurs de lissage
   */
  private determineSmoothingFactors(analysis: ConflictAnalysis): SmoothingFactors {
    // Lissage temporel plus important pour les conflits sévères
    const temporal = 0.3 + (analysis.severity * 0.4);

    // Lissage spatial plus important pour les conflits avec un impact élevé
    const spatial = 0.2 + (analysis.comprehensionImpact * 0.5);

    // Lissage d'intensité inversement proportionnel à la résolvabilité
    const intensity = 0.4 + ((1 - analysis.resolvability) * 0.3);

    return {
      temporal,
      spatial,
      intensity
    };
  }

  /**
   * Calcule le facteur d'amplification pour une stratégie de renforcement mutuel
   * @param analysis L'analyse du conflit
   * @param rule La règle de conflit
   * @returns Le facteur d'amplification
   */
  private calculateAmplification(
    analysis: ConflictAnalysis,
    rule: { blend_ratio: number }
  ): number {
    // L'amplification est basée sur le ratio de mélange et la résolvabilité
    return rule.blend_ratio * (0.8 + (analysis.resolvability * 0.4));
  }

  /**
   * Détermine les paramètres de synchronisation pour une stratégie de renforcement mutuel
   * @param analysis L'analyse du conflit
   * @returns Les paramètres de synchronisation
   */
  private determineSynchronization(analysis: ConflictAnalysis): SynchronizationParameters {
    // Offset temporel basé sur la sévérité
    const temporalOffset = 0.05 + (analysis.severity * 0.1);

    // Mode de synchronisation basé sur la résolvabilité
    let mode: 'parallel' | 'sequential' | 'adaptive';
    if (analysis.resolvability > 0.7) {
      mode = 'parallel';
    } else if (analysis.resolvability < 0.4) {
      mode = 'sequential';
    } else {
      mode = 'adaptive';
    }

    // Points de synchronisation distribués uniformément
    const syncPoints = [0, 0.25, 0.5, 0.75, 1];

    return {
      temporalOffset,
      mode,
      syncPoints
    };
  }

  /**
   * Conçoit une séquence d'alternance pour une stratégie d'alternance temporelle
   * @param analysis L'analyse du conflit
   * @param rule La règle de conflit
   * @returns La séquence d'alternance
   */
  private designAlternationSequence(
    analysis: ConflictAnalysis,
    rule: { blend_ratio: number }
  ): AlternationSequence {
    // Ordre des phases basé sur l'impact sur la compréhension
    let order: ('grammar' | 'emotion')[];
    if (analysis.comprehensionImpact > 0.6) {
      // Commencer par la grammaire pour les conflits avec un impact élevé
      order = ['grammar', 'emotion', 'grammar'];
    } else {
      // Commencer par l'émotion pour les autres cas
      order = ['emotion', 'grammar', 'emotion'];
    }

    // Poids des phases basés sur le ratio de mélange
    const weights = [
      rule.blend_ratio,
      1 - rule.blend_ratio,
      rule.blend_ratio
    ];

    // Nombre de cycles basé sur la résolvabilité (plus de cycles pour les conflits difficiles)
    const cycles = Math.ceil(2 + ((1 - analysis.resolvability) * 2));

    return {
      order,
      weights,
      cycles
    };
  }

  /**
   * Calcule le timing d'alternance pour une stratégie d'alternance temporelle
   * @param analysis L'analyse du conflit
   * @returns Le timing d'alternance
   */
  private calculateAlternationTiming(analysis: ConflictAnalysis): AlternationTiming {
    // Durée totale basée sur la sévérité
    const totalDuration = 0.8 + (analysis.severity * 0.4);

    // Durées des phases - plus longues pour la grammaire si impact élevé
    let phaseDurations: number[];
    if (analysis.comprehensionImpact > 0.6) {
      phaseDurations = [0.4, 0.3, 0.3]; // Plus de temps pour la grammaire
    } else {
      phaseDurations = [0.3, 0.4, 0.3]; // Plus de temps pour l'émotion
    }

    // Type d'easing basé sur la résolvabilité
    const easingType = analysis.resolvability > 0.6 ? 'easeInOutQuad' : 'easeInOutCubic';

    return {
      totalDuration,
      phaseDurations,
      easingType
    };
  }

  /**
   * Calcule la distribution des composants pour une stratégie de séparation
   * @param analysis L'analyse du conflit
   * @param rule La règle de conflit
   * @returns La distribution des composants
   */
  private calculateComponentDistribution(
    analysis: ConflictAnalysis,
    rule: { blend_ratio: number }
  ): ComponentDistribution {
    // Trier les points de conflit par impact sur la compréhension
    const sortedPoints = [...analysis.points].sort(
      (a, b) => b.comprehensionImpact - a.comprehensionImpact
    );

    // Attribuer les composants critiques à la grammaire
    const grammaticalAssignments = sortedPoints
      .filter(point => point.comprehensionImpact > 0.6)
      .map(point => point.component);

    // Attribuer les composants restants à l'émotion
    const emotionalAssignments = sortedPoints
      .filter(point => point.comprehensionImpact <= 0.6)
      .map(point => point.component);

    // Force de la séparation basée sur le ratio de mélange
    const separationStrength = rule.blend_ratio;

    return {
      grammaticalAssignments,
      emotionalAssignments,
      separationStrength
    };
  }

  /**
   * Détermine la coordination des composants pour une stratégie de séparation
   * @param analysis L'analyse du conflit
   * @returns La coordination des composants
   */
  private determineComponentCoordination(analysis: ConflictAnalysis): ComponentCoordination {
    // Mode de coordination basé sur la résolvabilité
    let mode: 'synchronous' | 'asynchronous' | 'cascading';
    if (analysis.resolvability > 0.7) {
      mode = 'synchronous';
    } else if (analysis.resolvability < 0.4) {
      mode = 'asynchronous';
    } else {
      mode = 'cascading';
    }

    // Délais entre composants basés sur la sévérité
    const baseDelay = 0.05 + (analysis.severity * 0.1);
    const delays: Record<string, number> = {};

    analysis.points.forEach((point, index) => {
      delays[point.component] = baseDelay * index;
    });

    // Durée totale de la coordination
    const duration = 0.5 + (analysis.severity * 0.5);

    return {
      mode,
      delays,
      duration
    };
  }

  /**
   * Applique une stratégie de priorité grammaticale
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyGrammarPriority(
    conflictData: ConflictData,
    strategy: GrammarPriorityStrategy,
    _context: ConflictContext // Préfixé avec _ pour indiquer qu'il est intentionnellement non utilisé
  ): Promise<ConflictResolution> {
    const { grammaticalComponent, emotionalComponent } = conflictData;
    const { blendRatio, transitions } = strategy;

    // Utiliser transitions pour éviter l'avertissement de variable non utilisée
    console.log(`Applying transitions with duration: ${transitions.duration} and easing: ${transitions.easing}`);

    // Créer une copie du composant grammatical
    const resolvedComponent = { ...grammaticalComponent };

    // Incorporer certains aspects du composant émotionnel
    for (const prop in emotionalComponent.properties) {
      if (
        prop in resolvedComponent.properties &&
        typeof resolvedComponent.properties[prop] === 'number' &&
        typeof emotionalComponent.properties[prop] === 'number'
      ) {
        // Mélange pondéré pour les propriétés numériques
        resolvedComponent.properties[prop] = (
          (resolvedComponent.properties[prop] as number) * blendRatio +
          (emotionalComponent.properties[prop] as number) * (1 - blendRatio)
        );
      }
    }

    // Ajuster l'intensité en incorporant partiellement l'intensité émotionnelle
    resolvedComponent.intensity =
      grammaticalComponent.intensity * blendRatio +
      emotionalComponent.intensity * (1 - blendRatio);

    return {
      resolvedComponent,
      metadata: {
        strategy,
        effectiveness: 0.8 + (0.2 * (1 - conflictData.severity)),
        comprehensibility: 0.9,  // Bonne compréhensibilité avec priorité à la grammaire
        naturalness: 0.7 + (0.2 * (1 - blendRatio))  // La naturalité diminue avec un ratio élevé
      }
    };
  }

  /**
   * Applique une stratégie de priorité émotionnelle
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyEmotionPriority(
    conflictData: ConflictData,
    strategy: EmotionPriorityStrategy,
    _context: ConflictContext // Préfixé avec _ pour indiquer qu'il est intentionnellement non utilisé
  ): Promise<ConflictResolution> {
    const { grammaticalComponent, emotionalComponent } = conflictData;
    const { blendRatio, adaptations } = strategy;

    // Utiliser blendRatio pour éviter l'avertissement de variable non utilisée
    console.log(`Using emotion blend ratio: ${blendRatio}`);

    // Créer une copie du composant émotionnel
    const resolvedComponent = { ...emotionalComponent };

    // Préserver certaines caractéristiques grammaticales critiques
    for (const feature of adaptations.preservedFeatures) {
      if (feature in grammaticalComponent.properties) {
        resolvedComponent.properties[feature] = grammaticalComponent.properties[feature];
      }
    }

    // Ajuster l'intensité émotionnelle
    resolvedComponent.intensity = emotionalComponent.intensity * adaptations.intensityFactor;

    // Appliquer l'offset spatial si nécessaire
    if (adaptations.spatialOffset > 0) {
      resolvedComponent.position +=
        (emotionalComponent.position > grammaticalComponent.position ? 1 : -1) *
        adaptations.spatialOffset;
    }

    return {
      resolvedComponent,
      metadata: {
        strategy,
        effectiveness: 0.75 + (0.2 * (1 - conflictData.severity)),
        comprehensibility: 0.7 + (0.2 * adaptations.preservedFeatures.length / 3),  // Dépend des caractéristiques préservées
        naturalness: 0.8  // Bonne naturalité avec priorité à l'émotion
      }
    };
  }

  /**
   * Applique une stratégie de mélange pondéré
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyWeightedBlend(
    conflictData: ConflictData,
    strategy: WeightedBlendStrategy,
    _context: ConflictContext // Préfixé avec _ pour indiquer qu'il est intentionnellement non utilisé
  ): Promise<ConflictResolution> {
    const { grammaticalComponent, emotionalComponent } = conflictData;
    const { weights, smoothing } = strategy;

    // Créer un nouveau composant pour le résultat
    const resolvedComponent: ConflictComponent = {
      type: grammaticalComponent.type,
      position: 0,
      intensity: 0,
      isGrammaticalMarker: grammaticalComponent.isGrammaticalMarker || false, // Valeur par défaut
      properties: {}
    };
    // Mélanger les positions avec lissage spatial
    resolvedComponent.position =
      grammaticalComponent.position * weights.grammar +
      emotionalComponent.position * weights.emotion +
      smoothing.spatial * (grammaticalComponent.position > emotionalComponent.position ? -1 : 1);

    // Mélanger les intensités avec lissage d'intensité
    resolvedComponent.intensity =
      grammaticalComponent.intensity * weights.grammar +
      emotionalComponent.intensity * weights.emotion +
      smoothing.intensity * 0.1;  // Léger boost d'intensité

    // Mélanger les propriétés
    const allProperties = new Set([
      ...Object.keys(grammaticalComponent.properties),
      ...Object.keys(emotionalComponent.properties)
    ]);

    for (const prop of allProperties) {
      // Récupérer les poids spécifiques au composant ou utiliser les poids globaux
      const componentWeight = weights.components[prop] || {
        grammar: weights.grammar,
        emotion: weights.emotion
      };

      const gramValue = grammaticalComponent.properties[prop];
      const emoValue = emotionalComponent.properties[prop];

      if (gramValue !== undefined && emoValue !== undefined) {
        if (typeof gramValue === 'number' && typeof emoValue === 'number') {
          // Mélange pondéré des valeurs numériques
          resolvedComponent.properties[prop] =
            gramValue * componentWeight.grammar +
            emoValue * componentWeight.emotion;
        } else {
          // Pour les booléens et autres types, choisir selon le poids dominant
          resolvedComponent.properties[prop] =
            componentWeight.grammar >= componentWeight.emotion ? gramValue : emoValue;
        }
      } else if (gramValue !== undefined) {
        resolvedComponent.properties[prop] = gramValue;
      } else if (emoValue !== undefined) {
        resolvedComponent.properties[prop] = emoValue;
      }
    }

    return {
      resolvedComponent,
      metadata: {
        strategy,
        effectiveness: 0.7 + (0.2 * (1 - conflictData.severity)),
        comprehensibility: 0.7 + (0.2 * weights.grammar),  // Meilleure compréhension avec plus de grammaire
        naturalness: 0.8 + (0.1 * (1 - Math.abs(weights.grammar - 0.5) * 2))  // Maximale à un mélange équilibré
      }
    };
  }

  /**
   * Applique une stratégie de renforcement mutuel
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyMutualReinforcement(
    conflictData: ConflictData,
    strategy: MutualReinforcementStrategy,
    _context: ConflictContext
  ): Promise<ConflictResolution> {
    const { grammaticalComponent, emotionalComponent } = conflictData;
    const { amplification, synchronization } = strategy;

    // Créer un nouveau composant pour le résultat
    const resolvedComponent: ConflictComponent = {
      type: grammaticalComponent.type,
      position: 0,
      intensity: 0,
      isGrammaticalMarker: grammaticalComponent.isGrammaticalMarker,
      properties: {}
    };

    // Calculer une position moyenne mais légèrement décalée
    resolvedComponent.position =
      (grammaticalComponent.position + emotionalComponent.position) / 2 +
      synchronization.temporalOffset;

    // Amplifier l'intensité pour le renforcement mutuel
    resolvedComponent.intensity =
      Math.min(1, Math.max(
        grammaticalComponent.intensity,
        emotionalComponent.intensity
      ) * amplification);

    // Mélanger et amplifier les propriétés compatibles
    const allProperties = new Set([
      ...Object.keys(grammaticalComponent.properties),
      ...Object.keys(emotionalComponent.properties)
    ]);

    for (const prop of allProperties) {
      const gramValue = grammaticalComponent.properties[prop];
      const emoValue = emotionalComponent.properties[prop];

      if (gramValue !== undefined && emoValue !== undefined) {
        if (typeof gramValue === 'number' && typeof emoValue === 'number') {
          // Amplifier la valeur la plus forte
          resolvedComponent.properties[prop] =
            Math.min(1, Math.max(gramValue, emoValue) * amplification);
        } else if (gramValue === emoValue) {
          // Si les valeurs sont identiques, les préserver
          resolvedComponent.properties[prop] = gramValue;
        } else {
          // Pour les valeurs contradictoires, privilégier la valeur grammaticale
          resolvedComponent.properties[prop] = gramValue;
        }
      } else if (gramValue !== undefined) {
        resolvedComponent.properties[prop] = gramValue;
      } else if (emoValue !== undefined) {
        resolvedComponent.properties[prop] = emoValue;
      }
    }

    return {
      resolvedComponent,
      metadata: {
        strategy,
        effectiveness: 0.8 + (0.15 * amplification),
        comprehensibility: 0.7 + (0.1 * amplification),
        naturalness: 0.6 + (0.2 * amplification)  // Le renforcement peut affecter la naturalité
      }
    };
  }

  /**
   * Applique une stratégie d'alternance temporelle
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyTemporalAlternation(
    conflictData: ConflictData,
    strategy: TemporalAlternationStrategy,
    _context: ConflictContext // Préfixé avec _ pour indiquer qu'il est intentionnellement non utilisé
  ): Promise<ConflictResolution> {
    const { grammaticalComponent, emotionalComponent } = conflictData;
    const { sequence, timing } = strategy;

    // Utiliser timing pour éviter l'avertissement de variable non utilisée
    console.log(`Alternation timing: total duration ${timing.totalDuration}, easing ${timing.easingType}`);

    // Pour l'alternance temporelle, nous simulons la position finale
    // dans une phase d'alternance spécifique

    // Déterminer la phase d'alternance (simulée au milieu de la séquence)
    const phaseIndex = 1 % sequence.order.length;
    const currentPhase = sequence.order[phaseIndex];
    const currentWeight = sequence.weights[phaseIndex];

    // Créer un nouveau composant pour le résultat
    const resolvedComponent: ConflictComponent = {
      type: grammaticalComponent.type,
      position: 0,
      intensity: 0,
      isGrammaticalMarker: grammaticalComponent.isGrammaticalMarker,
      properties: {}
    };

    // Définir la position et l'intensité en fonction de la phase actuelle
    if (currentPhase === 'grammar') {
      resolvedComponent.position = grammaticalComponent.position;
      resolvedComponent.intensity = grammaticalComponent.intensity * currentWeight;
      resolvedComponent.properties = { ...grammaticalComponent.properties };
    } else {
      resolvedComponent.position = emotionalComponent.position;
      resolvedComponent.intensity = emotionalComponent.intensity * currentWeight;
      resolvedComponent.properties = { ...emotionalComponent.properties };
    }

    // Ajouter des métadonnées d'alternance pour l'animation
    return {
      resolvedComponent,
      metadata: {
        strategy,
        effectiveness: 0.6 + (0.3 * (1 - conflictData.severity)),
        comprehensibility: 0.6,  // L'alternance peut réduire la compréhensibilité
        naturalness: 0.7  // L'alternance peut sembler naturelle si bien exécutée
      }
    };
  }

  /**
   * Applique une stratégie de séparation des composants
   * @param conflictData Les données du conflit
   * @param strategy La stratégie de résolution
   * @param context Le contexte du conflit
   * @returns La résolution du conflit
   */
  private async applyComponentSplit(
    conflictData: ConflictData,
    strategy: ComponentSplitStrategy,
    _context: ConflictContext // Préfixé avec _ pour indiquer qu'il est intentionnellement non utilisé
  ): Promise<ConflictResolution> {
    const { grammaticalComponent, emotionalComponent } = conflictData;
    const { distribution, coordination } = strategy;

    // Utiliser coordination pour éviter l'avertissement de variable non utilisée
    console.log(`Using component coordination: mode ${coordination.mode}, duration ${coordination.duration}`);

    // Créer un nouveau composant pour le résultat
    const resolvedComponent: ConflictComponent = {
      type: grammaticalComponent.type,
      position: grammaticalComponent.position,  // Conserver la position grammaticale
      intensity: grammaticalComponent.intensity,  // Conserver l'intensité grammaticale
      isGrammaticalMarker: grammaticalComponent.isGrammaticalMarker,
      properties: {}
    };

    // Répartir les propriétés selon la distribution
    for (const prop in grammaticalComponent.properties) {
      if (distribution.grammaticalAssignments.includes(prop)) {
        // Propriété assignée à la grammaire
        resolvedComponent.properties[prop] = grammaticalComponent.properties[prop];
      } else if (distribution.emotionalAssignments.includes(prop)) {
        // Propriété assignée à l'émotion
        resolvedComponent.properties[prop] = emotionalComponent.properties[prop];
      } else {
        // Propriétés non assignées sont par défaut grammaticales
        resolvedComponent.properties[prop] = grammaticalComponent.properties[prop];
      }
    }

    // Ajouter les propriétés émotionnelles manquantes
    for (const prop in emotionalComponent.properties) {
      if (!(prop in resolvedComponent.properties) && distribution.emotionalAssignments.includes(prop)) {
        resolvedComponent.properties[prop] = emotionalComponent.properties[prop];
      }
    }

    return {
      resolvedComponent,
      metadata: {
        strategy,
        effectiveness: 0.7 - (0.2 * conflictData.severity),
        comprehensibility: 0.8 - (0.1 * distribution.emotionalAssignments.length /
          (distribution.grammaticalAssignments.length + distribution.emotionalAssignments.length)),
        naturalness: 0.6  // La séparation peut affecter la naturalité
      }
    };
  }

  /**
   * Valide la résolution d'un conflit
   * @param resolution La résolution du conflit
   * @param originalConflict Les données du conflit original
   * @throws ConflictResolutionError si la validation échoue
   */
  private async validateResolution(
    resolution: ConflictResolution,
    originalConflict: ConflictData
  ): Promise<void> {
    // Vérifier la préservation grammaticale
    const grammaticalityScore = await this.checkGrammaticalPreservation(
      resolution,
      originalConflict
    );

    // Vérifier l'expressivité émotionnelle
    const emotionalityScore = await this.checkEmotionalExpressivity(
      resolution,
      originalConflict
    );

    // Vérifier la naturalité
    const naturalnessScore = await this.checkNaturalness(resolution);

    // Vérifier la cohérence culturelle
    const culturalScore = await this.checkCulturalConsistency(resolution);

    const validationScores: ValidationScores = {
      grammaticalityScore,
      emotionalityScore,
      naturalnessScore,
      culturalScore
    };

    if (!this.isResolutionValid(validationScores)) {
      throw new ConflictResolutionError(
        'Resolution validation failed',
        validationScores
      );
    }
  }

  /**
   * Vérifie la préservation grammaticale d'une résolution
   * @param resolution La résolution du conflit
   * @param originalConflict Les données du conflit original
   * @returns Score de préservation grammaticale (0-1)
   */
  private async checkGrammaticalPreservation(
    resolution: ConflictResolution,
    originalConflict: ConflictData
  ): Promise<number> {
    const { resolvedComponent } = resolution;
    const { grammaticalComponent } = originalConflict;

    // Vérifier la préservation des propriétés grammaticales essentielles
    let matchingProps = 0;
    let totalProps = 0;

    for (const prop in grammaticalComponent.properties) {
      totalProps++;
      const origValue = grammaticalComponent.properties[prop];
      const resolvedValue = resolvedComponent.properties[prop];

      if (resolvedValue !== undefined) {
        if (typeof origValue === 'number' && typeof resolvedValue === 'number') {
          // Pour les valeurs numériques, calculer la similitude
          const similarity = 1 - Math.min(1, Math.abs(origValue - resolvedValue));
          matchingProps += similarity;
        } else if (origValue === resolvedValue) {
          // Pour les autres types, vérifier l'égalité
          matchingProps += 1;
        }
      }
    }

    // Calculer le score de préservation grammaticale
    const propPreservation = totalProps > 0 ? matchingProps / totalProps : 1;

    // Vérifier également la préservation de la position et de l'intensité
    const positionPreservation = 1 - Math.min(1, Math.abs(
      resolvedComponent.position - grammaticalComponent.position
    ));

    const intensityPreservation = 1 - Math.min(1, Math.abs(
      resolvedComponent.intensity - grammaticalComponent.intensity
    ));

    // Score global pondéré
    return 0.5 * propPreservation + 0.3 * positionPreservation + 0.2 * intensityPreservation;
  }

  /**
   * Vérifie l'expressivité émotionnelle d'une résolution
   * @param resolution La résolution du conflit
   * @param originalConflict Les données du conflit original
   * @returns Score d'expressivité émotionnelle (0-1)
   */
  private async checkEmotionalExpressivity(
    resolution: ConflictResolution,
    originalConflict: ConflictData
  ): Promise<number> {
    const { resolvedComponent } = resolution;
    const { emotionalComponent } = originalConflict;

    // Vérifier la préservation des propriétés émotionnelles essentielles
    let matchingProps = 0;
    let totalProps = 0;

    for (const prop in emotionalComponent.properties) {
      totalProps++;
      const origValue = emotionalComponent.properties[prop];
      const resolvedValue = resolvedComponent.properties[prop];

      if (resolvedValue !== undefined) {
        if (typeof origValue === 'number' && typeof resolvedValue === 'number') {
          // Pour les valeurs numériques, calculer la similitude
          const similarity = 1 - Math.min(1, Math.abs(origValue - resolvedValue));
          matchingProps += similarity;
        } else if (origValue === resolvedValue) {
          // Pour les autres types, vérifier l'égalité
          matchingProps += 1;
        }
      }
    }

    // Calculer le score de préservation émotionnelle
    const propPreservation = totalProps > 0 ? matchingProps / totalProps : 1;

    // Vérifier également la préservation de l'intensité émotionnelle
    const intensityPreservation = 1 - Math.min(1, Math.abs(
      resolvedComponent.intensity - emotionalComponent.intensity
    ));

    // Score global pondéré
    return 0.6 * propPreservation + 0.4 * intensityPreservation;
  }

  /**
     * Vérifie la naturalité d'une résolution
     * @param resolution La résolution du conflit
     * @returns Score de naturalité (0-1)
     */
  private async checkNaturalness(resolution: ConflictResolution): Promise<number> {
    // Vérifier la cohérence interne des propriétés
    const { resolvedComponent } = resolution;

    // Vérifier les combinaisons incohérentes connues
    let inconsistencies = 0;

    // Exemple : vérification de combinaisons incohérentes
    if (
      typeof resolvedComponent.properties['eyebrows_raised'] === 'boolean' &&
      resolvedComponent.properties['eyebrows_raised'] === true &&
      typeof resolvedComponent.properties['eyebrows_furrowed'] === 'boolean' &&
      resolvedComponent.properties['eyebrows_furrowed'] === true
    ) {
      // Combinaison sourcils levés + sourcils froncés est incohérente
      inconsistencies++;
    }

    if (
      typeof resolvedComponent.properties['mouth_open'] === 'boolean' &&
      resolvedComponent.properties['mouth_open'] === true &&
      typeof resolvedComponent.properties['lips_pressed'] === 'boolean' &&
      resolvedComponent.properties['lips_pressed'] === true
    ) {
      // Combinaison bouche ouverte + lèvres pressées est incohérente
      inconsistencies++;
    }

    // Vérifier les combinaisons inhabituelles d'intensité
    if (
      resolvedComponent.intensity > 0.8 &&
      typeof resolvedComponent.properties['tension'] === 'number' &&
      resolvedComponent.properties['tension'] < 0.3
    ) {
      // Haute intensité avec faible tension est inhabituel
      inconsistencies++;
    }

    // Pénaliser le score en fonction du nombre d'incohérences
    const baseScore = 0.9;
    const penalty = Math.min(0.5, inconsistencies * 0.15);

    return Math.max(0.3, baseScore - penalty);
  }

  /**
   * Vérifie la cohérence culturelle d'une résolution
   * @param resolution La résolution du conflit
   * @returns Score de cohérence culturelle (0-1)
   */
  private async checkCulturalConsistency(
    resolution: ConflictResolution // Utiliser resolution dans la fonction
  ): Promise<number> {
    // Utiliser resolution pour éviter l'avertissement de variable non utilisée
    console.log(`Checking cultural consistency for resolution with strategy: ${resolution.metadata.strategy.type}`);

    // Appliquer un score de base élevé
    const baseScore = 0.85;

    // Pour l'instant, nous ne pénalisons pas le score
    // Une implémentation plus complète vérifierait des règles culturelles spécifiques

    return baseScore;
  }


  /**
   * Vérifie si une résolution est valide selon les scores de validation
   * @param scores Les scores de validation
   * @returns true si la résolution est valide
   */
  private isResolutionValid(scores: ValidationScores): boolean {
    // Définir les seuils de validation pour chaque score
    const thresholds = {
      grammaticalityScore: 0.6,  // Au moins 60% de préservation grammaticale
      emotionalityScore: 0.5,    // Au moins 50% d'expressivité émotionnelle
      naturalnessScore: 0.5,     // Au moins 50% de naturalité
      culturalScore: 0.7         // Au moins 70% de cohérence culturelle
    };

    // Vérifier chaque score par rapport à son seuil
    return (
      scores.grammaticalityScore >= thresholds.grammaticalityScore &&
      scores.emotionalityScore >= thresholds.emotionalityScore &&
      scores.naturalnessScore >= thresholds.naturalnessScore &&
      scores.culturalScore >= thresholds.culturalScore
    );
  }
}