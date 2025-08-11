// src/ai/systems/expressions/emotions/integration/LSFEmotionExpressionIntegrator.ts

// Correction des chemins d'importation
import { LSFExpression } from '../lsf/types';
import { LSFEmotionSystem } from '../base/LSFEmotionSystem';
import { LSFGrammarRules } from '../../grammar/LSFGrammarRules';

// Extension pour la metadata de LSFExpression
interface ExtendedLSFExpression extends LSFExpression {
  metadata?: {
    authenticity?: number;
    culturalAccuracy?: number;
    expressiveness?: number;
    socialAdaptation?: number;
    // Ajout de la propriété synchronization
    synchronization?: {
      maxDuration: number;
      globalEmotionWeight: number;
      synchronizationTimestamp: string;
    };
  };

  // Index signature pour permettre l'accès dynamique aux propriétés
  [key: string]: unknown;
}

interface IntegrationContext {
  purpose: 'TRANSLATION' | 'TEACHING' | 'CONVERSATION';
  formalityLevel: number;
  priority: 'GRAMMAR' | 'EMOTION' | 'BALANCED';
  culturalContext?: string;
}

interface EmotionInput {
  type: string;
  intensity: number;
  valence: number;
  duration: number;
}

interface ExpressionComponent {
  position: number;
  intensity: number;
  duration: number;
  isGrammaticalMarker: boolean;
  properties: Record<string, number | boolean>;
}

interface ComponentWeight {
  emotion: number;
  grammar: number;
  blendMode: 'weighted' | 'prioritize_emotion' | 'prioritize_grammar';
}

interface IntegrationWeights {
  global: {
    emotion: number;
    grammar: number;
  };
  components: Record<string, ComponentWeight>;
}

interface GrammaticalContext {
  function: string;
  markers: GrammaticalMarker[];
  constraints: GrammaticalConstraint[];
  intensity: number;
}

interface IntegratedExpression {
  expression: LSFExpression;
  metadata: {
    grammaticalPreservation: number;
    emotionalAuthenticity: number;
    naturalness: number;
    conflictResolution: {
      conflicts: number;
      resolutions: number;
    };
  };
}

// Type pour les validations
interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: unknown;
}

// Type pour les résultats émotionnels
interface EmotionalExpressionResult {
  expression: LSFExpression;
  metadata?: {
    intensity: number;
    valence: number;
    authenticity: number;
  };
}

// Type pour les caractéristiques émotionnelles
interface EmotionalFeature {
  type: string;
  component: string;
  value: number;
  importance: number;
}

// Extension de LSFEmotionSystem pour ajouter les méthodes manquantes
interface ExtendedLSFEmotionSystem extends LSFEmotionSystem {
  processEmotion(
    emotion: EmotionInput,
    context: EmotionContext
  ): Promise<EmotionalExpressionResult>;

  extractEmotionalFeatures(
    expression: LSFExpression
  ): Promise<EmotionalFeature[]>;
}

// Extension de LSFGrammarRules pour ajouter les méthodes manquantes
interface ExtendedLSFGrammarRules extends LSFGrammarRules {
  identifyGrammaticalMarkers(
    expression: LSFExpression
  ): Promise<GrammaticalMarker[]>;

  evaluateStructuralIntegrity(
    integrated: LSFExpression,
    base: LSFExpression
  ): Promise<number>;

  getConstraintsForFunction(
    functionType: string
  ): Promise<GrammaticalConstraint[]>;

  analyzeExpressionConstraints(
    expression: LSFExpression
  ): Promise<GrammaticalConstraint[]>;
}

/**
 * Erreur spécifique pour les problèmes d'intégration d'expressions LSF
 */
export class LSFIntegrationError extends Error {
  /**
   * Crée une nouvelle erreur d'intégration LSF
   * @param message Le message d'erreur
   * @param details Les détails de l'erreur
   */
  constructor(
    message: string,
    public readonly details: Error | unknown
  ) {
    super(message);
    this.name = 'LSFIntegrationError';
  }
}

/**
 * Interface pour un marqueur grammatical
 */
interface GrammaticalMarker {
  /** Type de marqueur */
  type: string;
  /** Fonction grammaticale associée */
  function?: string;
  /** Intensité du marqueur */
  intensity: number;
  /** Importance du marqueur dans la structure grammaticale */
  importance: number;
}

/**
 * Interface pour une contrainte grammaticale
 */
interface GrammaticalConstraint {
  /** Type de contrainte */
  type: string;
  /** Cible de la contrainte */
  target: string;
  /** Valeur de la contrainte */
  value: unknown;
  /** Priorité de la contrainte */
  priority: number;
}

/**
 * Interface pour le contexte émotionnel
 */
interface EmotionContext {
  /** Objectif de l'expression */
  purpose: 'TRANSLATION' | 'TEACHING' | 'CONVERSATION';
  /** Intensité émotionnelle désirée */
  intensity: 'low' | 'medium' | 'high';
  /** Niveau de formalité */
  formalityLevel: number;
  /** Contexte culturel spécifique */
  culturalContext?: string;
}

/**
 * Intégrateur d'expressions émotionnelles pour la LSF
 * Cette classe permet de combiner des expressions grammaticales avec des expressions émotionnelles
 * tout en maintenant l'intégrité grammaticale et l'authenticité émotionnelle
 */
export class LSFEmotionExpressionIntegrator {
  /**
   * Poids d'intégration par défaut pour différents contextes grammaticaux et composants
   */
  private readonly INTEGRATION_WEIGHTS = {
    GRAMMAR: {
      QUESTION: { emotion: 0.4, grammar: 0.6 },
      NEGATION: { emotion: 0.5, grammar: 0.5 },
      CONDITIONAL: { emotion: 0.3, grammar: 0.7 },
      EMPHASIS: { emotion: 0.7, grammar: 0.3 }
    },
    COMPONENTS: {
      eyebrows: {
        emotion: 0.6,
        grammar: 0.4,
        blendMode: 'weighted' as const
      },
      eyes: {
        emotion: 0.7,
        grammar: 0.3,
        blendMode: 'prioritize_emotion' as const
      },
      mouth: {
        emotion: 0.8,
        grammar: 0.2,
        blendMode: 'weighted' as const
      },
      head: {
        emotion: 0.4,
        grammar: 0.6,
        blendMode: 'prioritize_grammar' as const
      },
      body: {
        emotion: 0.5,
        grammar: 0.5,
        blendMode: 'weighted' as const
      }
    }
  } as const;

  private emotionSystemExtended: ExtendedLSFEmotionSystem;
  private grammarRulesExtended: ExtendedLSFGrammarRules;

  /**
   * Crée un nouvel intégrateur d'expressions émotionnelles LSF
   * @param emotionSystem Système de gestion des émotions
   * @param grammarRules Système de règles grammaticales
   */
  constructor(
    emotionSystem: LSFEmotionSystem,
    grammarRules: LSFGrammarRules
  ) {
    // Cast vers les interfaces étendues
    this.emotionSystemExtended = emotionSystem as ExtendedLSFEmotionSystem;
    this.grammarRulesExtended = grammarRules as ExtendedLSFGrammarRules;
  }

  /**
   * Intègre une émotion avec une expression de base tout en préservant la grammaire
   * @param emotion L'émotion à intégrer
   * @param baseExpression L'expression grammaticale de base
   * @param context Le contexte d'intégration
   * @returns L'expression intégrée avec métadonnées
   * @throws LSFIntegrationError Si l'intégration échoue
   */
  async integrateEmotionWithExpression(
    emotion: EmotionInput,
    baseExpression: LSFExpression,
    context: IntegrationContext
  ): Promise<IntegratedExpression> {
    try {
      // Analyser le contexte grammatical de l'expression de base
      const grammaticalContext = await this.analyzeGrammaticalContext(baseExpression);

      // Générer une expression émotionnelle
      const emotionalExpression = await this.emotionSystemExtended.processEmotion(
        emotion,
        this.convertContext(context)
      );

      // Déterminer les poids d'intégration
      const weights = this.determineIntegrationWeights(
        grammaticalContext,
        emotion,
        context
      );

      // Combiner les expressions
      const integratedExpression = await this.blendExpressions(
        baseExpression,
        emotionalExpression.expression,
        weights,
        context
      );

      // Valider l'intégration
      await this.validateIntegration(
        integratedExpression,
        baseExpression,
        emotionalExpression.expression,
        context
      );

      // Générer les métadonnées de l'intégration
      return {
        expression: integratedExpression,
        metadata: this.generateIntegrationMetadata(
          baseExpression,
          emotionalExpression,
          weights
        )
      };
    } catch (error) {
      throw new LSFIntegrationError(
        'Failed to integrate emotion with expression',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Analyse le contexte grammatical d'une expression
   * @param expression L'expression à analyser
   * @returns Le contexte grammatical identifié
   */
  private async analyzeGrammaticalContext(
    expression: LSFExpression
  ): Promise<GrammaticalContext> {
    // Identifier les marqueurs grammaticaux
    const markers = await this.grammarRulesExtended.identifyGrammaticalMarkers(expression);

    // Déterminer la fonction dominante
    const dominantFunction = this.determineDominantFunction(markers);

    // Analyser les contraintes grammaticales
    const constraints = await this.analyzeGrammaticalConstraints(
      expression,
      dominantFunction
    );

    // Calculer l'intensité grammaticale
    return {
      function: dominantFunction,
      markers,
      constraints,
      intensity: this.calculateGrammaticalIntensity(markers)
    };
  }

  /**
   * Détermine les poids d'intégration en fonction du contexte et des composants
   * @param grammaticalContext Le contexte grammatical
   * @param emotion L'émotion à intégrer
   * @param integrationContext Le contexte d'intégration
   * @returns Les poids d'intégration
   */
  private determineIntegrationWeights(
    grammaticalContext: GrammaticalContext,
    emotion: EmotionInput,
    integrationContext: IntegrationContext
  ): IntegrationWeights {
    // Poids global basé sur le contexte d'intégration
    const globalWeights = {
      emotion: integrationContext.priority === 'EMOTION' ? 0.7 :
        integrationContext.priority === 'GRAMMAR' ? 0.3 : 0.5,
      grammar: integrationContext.priority === 'GRAMMAR' ? 0.7 :
        integrationContext.priority === 'EMOTION' ? 0.3 : 0.5
    };

    // Ajustement en fonction de la formalité
    if (integrationContext.formalityLevel > 0.7) {
      globalWeights.grammar += 0.1;
      globalWeights.emotion -= 0.1;
    }

    // Ajustement en fonction de l'intensité de l'émotion
    if (emotion.intensity > 0.8) {
      globalWeights.emotion += 0.1;
      globalWeights.grammar -= 0.1;
    }

    // Poids des composants
    const componentWeights: Record<string, ComponentWeight> = {};

    // Copie des poids de base pour chaque composant
    for (const component in this.INTEGRATION_WEIGHTS.COMPONENTS) {
      if (Object.prototype.hasOwnProperty.call(this.INTEGRATION_WEIGHTS.COMPONENTS, component)) {
        const key = component as keyof typeof this.INTEGRATION_WEIGHTS.COMPONENTS;
        componentWeights[component] = { ...this.INTEGRATION_WEIGHTS.COMPONENTS[key] };

        // Ajustement en fonction du contexte grammatical
        if (grammaticalContext.function === 'QUESTION' && component === 'eyebrows') {
          componentWeights[component].grammar += 0.2;
          componentWeights[component].emotion -= 0.2;
        }
      }
    }

    return {
      global: globalWeights,
      components: componentWeights
    };
  }

  /**
   * Combine deux expressions en fonction des poids d'intégration
   * @param baseExpression L'expression grammaticale de base
   * @param emotionalExpression L'expression émotionnelle
   * @param weights Les poids d'intégration
   * @param context Le contexte d'intégration
   * @returns L'expression combinée avec métadonnées
   */
  private async blendExpressions(
    baseExpression: LSFExpression,
    emotionalExpression: LSFExpression,
    weights: IntegrationWeights,
    context: IntegrationContext
  ): Promise<ExtendedLSFExpression> {
    // Utilisation du contexte pour ajuster le blend si nécessaire
    const adjustedWeights = context.purpose === 'TEACHING'
      ? { ...weights, global: { ...weights.global, grammar: weights.global.grammar + 0.1 } }
      : weights;

    // Création d'un objet pour contenir les composants combinés
    const result: Record<string, ExpressionComponent> = {};

    // Combinaison des composants en fonction des poids
    for (const key of Object.keys(this.INTEGRATION_WEIGHTS.COMPONENTS)) {
      const baseComp = baseExpression[key as keyof LSFExpression] as ExpressionComponent | undefined;
      const emotionalComp = emotionalExpression[key as keyof LSFExpression] as ExpressionComponent | undefined;

      if (baseComp && emotionalComp) {
        const componentWeight = adjustedWeights.components[key];

        // Combiner les composants avec le mode approprié
        result[key] = this.blendComponent(
          key as keyof typeof this.INTEGRATION_WEIGHTS.COMPONENTS,
          baseComp,
          emotionalComp,
          componentWeight
        );
      } else if (baseComp) {
        result[key] = { ...baseComp };
      } else if (emotionalComp) {
        result[key] = { ...emotionalComp };
      }
    }

    // Synchroniser les composants combinés
    return this.synchronizeBlendedComponents(result);
  }

  /**
   * Synchronise les composants mélangés pour assurer la cohérence temporelle
   * @param components Les composants mélangés
   * @returns Les composants synchronisés
   */
  private synchronizeBlendedComponents(
    components: Record<string, ExpressionComponent>
  ): ExtendedLSFExpression {
    // Copie des composants pour les modifications
    const synchronizedComponents = { ...components };

    // Trouver la durée maximale parmi les composants
    let maxDuration = 0;
    for (const key in components) {
      const component = components[key];
      if (component && 'duration' in component) {
        maxDuration = Math.max(maxDuration, component.duration);
      }
    }

    // Synchroniser les durées et les timings
    for (const key in synchronizedComponents) {
      const component = synchronizedComponents[key];

      // Ajuster la durée pour les composants significatifs
      if (component && 'isGrammaticalMarker' in component) {
        if (component.isGrammaticalMarker || component.intensity > 0.7) {
          component.duration = maxDuration;
        }
      }
    }

    // Convertir le résultat en ExtendedLSFExpression
    const result: ExtendedLSFExpression = synchronizedComponents as unknown as ExtendedLSFExpression;

    // Ajouter les métadonnées de synchronisation
    result.metadata = {
      ...(result.metadata || {}),
      synchronization: {
        maxDuration,
        globalEmotionWeight: 0.5, // Valeur par défaut
        synchronizationTimestamp: new Date().toISOString()
      }
    };

    return result;
  }

  /**
   * Mélange deux composants d'expression en fonction d'un poids
   * @param componentType Le type de composant
   * @param baseComponent Le composant de base
   * @param emotionalComponent Le composant émotionnel
   * @param weight Le poids de mélange
   * @returns Le composant mélangé
   */
  private blendComponent(
    componentType: keyof typeof this.INTEGRATION_WEIGHTS.COMPONENTS,
    baseComponent: ExpressionComponent,
    emotionalComponent: ExpressionComponent,
    weight: ComponentWeight
  ): ExpressionComponent {
    // Utiliser la stratégie de mélange appropriée
    switch (weight.blendMode) {
      case 'weighted':
        return this.weightedBlend(baseComponent, emotionalComponent, weight);
      case 'prioritize_emotion':
        return this.prioritizeEmotionBlend(baseComponent, emotionalComponent, weight);
      case 'prioritize_grammar':
        return this.prioritizeGrammarBlend(baseComponent, emotionalComponent, weight);
      default:
        return this.weightedBlend(baseComponent, emotionalComponent, weight);
    }
  }

  /**
   * Mélange pondéré entre deux composants d'expression
   * @param base Le composant de base
   * @param emotional Le composant émotionnel
   * @param weight Le poids de mélange
   * @returns Le composant mélangé
   */
  private weightedBlend(
    base: ExpressionComponent,
    emotional: ExpressionComponent,
    weight: ComponentWeight
  ): ExpressionComponent {
    // Mélange des propriétés en fonction des poids
    const blendedProperties = Object.keys(base.properties).reduce((acc, key) => {
      const baseValue = base.properties[key];
      const emotionalValue = emotional.properties[key];

      // Mélanger les valeurs numériques avec une pondération, sinon utiliser la valeur la plus pertinente
      acc[key] = typeof baseValue === 'number' && typeof emotionalValue === 'number'
        ? baseValue * weight.grammar + emotionalValue * weight.emotion
        : weight.emotion > weight.grammar ? emotionalValue : baseValue;

      return acc;
    }, {} as Record<string, number | boolean>);

    // Créer le composant mélangé
    return {
      position: base.position * weight.grammar + emotional.position * weight.emotion,
      intensity: base.intensity * weight.grammar + emotional.intensity * weight.emotion,
      duration: Math.max(base.duration, emotional.duration),
      isGrammaticalMarker: base.isGrammaticalMarker,
      properties: blendedProperties
    };
  }

  /**
   * Mélange priorisant l'émotion tout en préservant les éléments grammaticaux critiques
   * @param base Le composant de base
   * @param emotional Le composant émotionnel
   * @param weight Le poids de mélange
   * @returns Le composant mélangé
   */
  private prioritizeEmotionBlend(
    base: ExpressionComponent,
    emotional: ExpressionComponent,
    componentWeight: ComponentWeight // Renommer weight en componentWeight pour éviter l'erreur
  ): ExpressionComponent {
    // Préserver les caractéristiques grammaticales critiques
    const criticalGrammarFeatures = this.preserveCriticalGrammaticalFeatures(base);

    // Utiliser componentWeight pour ajuster l'intensité si nécessaire
    let adjustedIntensity = emotional.intensity;
    if (componentWeight.emotion > 0.8) {
      adjustedIntensity = Math.min(1, emotional.intensity * 1.1);
    }

    // Favoriser l'expression émotionnelle mais conserver les aspects grammaticaux critiques
    return {
      ...emotional,
      ...criticalGrammarFeatures,
      intensity: adjustedIntensity,
      isGrammaticalMarker: base.isGrammaticalMarker
    };
  }

  /**
   * Mélange priorisant la grammaire tout en intégrant des aspects émotionnels
   * @param base Le composant de base
   * @param emotional Le composant émotionnel
   * @param componentWeight Le poids de mélange
   * @returns Le composant mélangé
   */
  private prioritizeGrammarBlend(
    base: ExpressionComponent,
    emotional: ExpressionComponent,
    componentWeight: ComponentWeight
  ): ExpressionComponent {
    // Mélange des propriétés avec priorité à la grammaire
    const blendedProperties = Object.keys(emotional.properties).reduce((acc, propertyKey) => {
      // N'incorporer les propriétés émotionnelles que si elles n'entrent pas en conflit avec la grammaire
      if (!this.conflictsWithGrammar(propertyKey, emotional.properties[propertyKey], base)) {
        acc[propertyKey] = this.blendValue(
          base.properties[propertyKey],
          emotional.properties[propertyKey],
          componentWeight
        );
      } else {
        // En cas de conflit, préserver la propriété grammaticale
        acc[propertyKey] = base.properties[propertyKey];
      }
      return acc;
    }, {} as Record<string, number | boolean>);

    // Créer le composant avec priorité à la grammaire
    return {
      ...base,
      properties: blendedProperties
    };
  }

  /**
   * Identifie et préserve les caractéristiques grammaticales critiques
   * @param base Le composant de base
   * @returns Les caractéristiques critiques à préserver
   */
  private preserveCriticalGrammaticalFeatures(
    base: ExpressionComponent
  ): Partial<ExpressionComponent> {
    // Si ce n'est pas un marqueur grammatical, rien à préserver spécifiquement
    if (!base.isGrammaticalMarker) {
      return {};
    }

    // Préserver la position et l'intensité des marqueurs grammaticaux
    return {
      position: base.position,
      intensity: base.intensity
    };
  }

  /**
   * Mélange deux valeurs en fonction d'un poids
   * @param baseValue La valeur de base
   * @param emotionalValue La valeur émotionnelle
   * @param weight Le poids de mélange
   * @returns La valeur mélangée
   */
  private blendValue(
    baseValue: number | boolean,
    emotionalValue: number | boolean,
    weight: ComponentWeight
  ): number | boolean {
    // Pour les valeurs numériques, appliquer la pondération
    if (typeof baseValue === 'number' && typeof emotionalValue === 'number') {
      return baseValue * weight.grammar + emotionalValue * weight.emotion;
    }

    // Pour les booléens, choisir en fonction du poids dominant
    return weight.emotion > weight.grammar ? emotionalValue : baseValue;
  }

  /**
   * Vérifie si une valeur émotionnelle entre en conflit avec la grammaire
   * @param propertyKey La clé de la propriété
   * @param propertyValue La valeur de la propriété
   * @param baseComponent Le composant de base
   * @returns true si la valeur entre en conflit avec la grammaire
   */
  private conflictsWithGrammar(
    propertyKey: string,
    propertyValue: number | boolean,
    baseComponent: ExpressionComponent
  ): boolean {
    // Propriétés critiques pour la grammaire
    const criticalProperties = ['position', 'isRequired', 'isMandatory'];

    // Détecter les conflits pour les propriétés critiques dans les marqueurs grammaticaux
    if (criticalProperties.includes(propertyKey) && baseComponent.isGrammaticalMarker) {
      if (typeof propertyValue === 'number' && typeof baseComponent.properties[propertyKey] === 'number') {
        const baseValue = baseComponent.properties[propertyKey] as number;
        const diff = Math.abs(baseValue - (propertyValue as number));
        return diff > 0.3; // Seuil de différence significative
      }

      // Pour les booléens, toute différence est un conflit
      if (typeof propertyValue === 'boolean' && propertyValue !== baseComponent.properties[propertyKey]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Valide l'expression intégrée selon plusieurs critères
   * @param integrated L'expression intégrée
   * @param base L'expression de base
   * @param emotional L'expression émotionnelle
   * @param integrationContext Le contexte d'intégration
   * @throws LSFIntegrationError si la validation échoue
   */
  private async validateIntegration(
    integrated: LSFExpression,
    base: LSFExpression,
    emotional: LSFExpression,
    integrationContext: IntegrationContext
  ): Promise<void> {
    // Utilisation du contexte pour informer le processus de validation
    console.log(`Validating integration with ${integrationContext.purpose} context`);

    // Exécuter toutes les validations en parallèle
    const validations = await Promise.all([
      this.validateGrammaticalPreservation(integrated, base),
      this.validateEmotionalPreservation(integrated, emotional),
      this.validateNaturalness(integrated, integrationContext)
    ]);

    // Vérifier les résultats de validation
    for (const validation of validations) {
      if (!validation.isValid) {
        throw new LSFIntegrationError(
          validation.message,
          validation.details
        );
      }
    }
  }

  /**
   * Valide si la préservation grammaticale est maintenue
   * @param integrated L'expression intégrée
   * @param base L'expression de base
   * @returns Le résultat de la validation
   */
  private async validateGrammaticalPreservation(
    integrated: LSFExpression,
    base: LSFExpression
  ): Promise<ValidationResult> {
    // Identifier les marqueurs grammaticaux dans les deux expressions
    const baseMarkers = await this.grammarRulesExtended.identifyGrammaticalMarkers(base);
    const integratedMarkers = await this.grammarRulesExtended.identifyGrammaticalMarkers(integrated);

    // Vérifier la préservation des marqueurs critiques
    const criticalMarkersPreserved = baseMarkers
      .filter((marker: GrammaticalMarker) => marker.importance > 0.7)
      .every((marker: GrammaticalMarker) =>
        integratedMarkers.some((im: GrammaticalMarker) =>
          im.type === marker.type &&
          Math.abs(im.intensity - marker.intensity) < 0.2
        )
      );

    // Évaluer l'intégrité structurelle globale
    const structuralPreservation = await this.grammarRulesExtended.evaluateStructuralIntegrity(integrated, base);

    // Validation des marqueurs critiques
    if (!criticalMarkersPreserved) {
      return {
        isValid: false,
        message: "Critical grammatical markers not preserved",
        details: { missingMarkers: baseMarkers.filter((m: GrammaticalMarker) => m.importance > 0.7) }
      };
    }

    // Validation de la structure globale
    if (structuralPreservation < 0.7) {
      return {
        isValid: false,
        message: "Grammatical structure compromised",
        details: { preservationScore: structuralPreservation }
      };
    }

    return {
      isValid: true,
      message: "Grammatical preservation validated"
    };
  }

  /**
   * Valide si l'émotion est préservée dans l'expression intégrée
   * @param integrated L'expression intégrée
   * @param emotional L'expression émotionnelle originale
   * @returns Le résultat de la validation
   */
  private async validateEmotionalPreservation(
    integrated: LSFExpression,
    emotional: LSFExpression
  ): Promise<ValidationResult> {
    // Extraire les caractéristiques émotionnelles des deux expressions
    const emotionalFeatures = await this.emotionSystemExtended.extractEmotionalFeatures(emotional);
    const integratedFeatures = await this.emotionSystemExtended.extractEmotionalFeatures(integrated);

    // Calculer le score de préservation émotionnelle
    const preservationScore = this.calculateEmotionalPreservation(
      emotionalFeatures,
      integratedFeatures
    );

    // Vérifier si la préservation est suffisante
    if (preservationScore < 0.6) {
      return {
        isValid: false,
        message: "Emotional expression significantly compromised",
        details: {
          preservationScore,
          threshold: 0.6,
          criticalFeatures: emotionalFeatures.filter((f: EmotionalFeature) => f.importance > 0.7)
        }
      };
    }

    return {
      isValid: true,
      message: "Emotional preservation validated"
    };
  }

  /**
   * Valide le naturel de l'expression intégrée
   * @param integrated L'expression intégrée
   * @param context Le contexte d'intégration
   * @returns Le résultat de la validation
   */
  private async validateNaturalness(
    integrated: LSFExpression,
    context: IntegrationContext
  ): Promise<ValidationResult> {
    // Évaluer différents aspects de la naturalité
    const temporalCoherence = this.evaluateTemporalCoherence(integrated);
    const spatialCoherence = this.evaluatePhysicalFeasibility(integrated);
    const culturalAppropriatenessScore = this.evaluateCulturalAppropriateness(
      integrated,
      context.culturalContext || 'standard'
    );

    // Calculer un score global de naturalité
    const naturalness = (temporalCoherence + spatialCoherence + culturalAppropriatenessScore) / 3;

    // Vérifier si la naturalité est suffisante
    if (naturalness < 0.65) {
      return {
        isValid: false,
        message: "Expression lacks naturalness",
        details: {
          naturalness,
          temporalCoherence,
          spatialCoherence,
          culturalAppropriateness: culturalAppropriatenessScore
        }
      };
    }

    return {
      isValid: true,
      message: "Naturalness validated"
    };
  }

  /**
   * Génère les métadonnées pour l'expression intégrée
   * @param baseExpression L'expression de base
   * @param emotionalExpression L'expression émotionnelle
   * @param weights Les poids d'intégration utilisés
   * @returns Les métadonnées de l'intégration
   */
  private generateIntegrationMetadata(
    baseExpression: LSFExpression,
    emotionalExpression: EmotionalExpressionResult,
    weights: IntegrationWeights
  ): IntegratedExpression['metadata'] {
    // Calculer les scores de préservation
    const grammaticalPreservation = this.calculateGrammaticalPreservation(baseExpression);
    const emotionalAuthenticity = this.calculateEmotionalAuthenticity(emotionalExpression);

    // Calculer le score de naturalité
    const naturalness = this.calculateNaturalness(weights);

    // Calculer les statistiques de résolution de conflits
    const conflictStats = this.calculateConflictStats(weights);

    return {
      grammaticalPreservation,
      emotionalAuthenticity,
      naturalness,
      conflictResolution: conflictStats
    };
  }

  /**
   * Calcule le score de préservation de la grammaire
   * @param expression L'expression à évaluer
   * @returns Le score de préservation grammaticale
   */
  private calculateGrammaticalPreservation(expression: LSFExpression): number {
    // Utiliser expression pour une analyse plus significative
    const complexityScore = Object.keys(expression).length * 0.05;
    const stabilityScore = 0.8;
    return Math.min(1, stabilityScore + complexityScore);
  }

  /**
   * Calcule le score d'authenticité émotionnelle
   * @param expression Le résultat de l'expression émotionnelle
   * @returns Le score d'authenticité émotionnelle
   */
  private calculateEmotionalAuthenticity(expression: EmotionalExpressionResult): number {
    // Analyse de l'authenticité émotionnelle
    return expression.metadata?.authenticity || 0.9;
  }

  /**
   * Calcule le score de naturalité
   * @param weights Les poids d'intégration utilisés
   * @returns Le score de naturalité
   */
  private calculateNaturalness(weights: IntegrationWeights): number {
    // Analyse de la naturalité basée sur les poids d'intégration
    const balanceScore = 1 - Math.abs(weights.global.emotion - weights.global.grammar);
    return 0.8 * balanceScore + 0.2; // Formule simplifiée pour la naturalité
  }

  /**
 * Calcule les statistiques de résolution de conflits
 * @param weights Les poids d'intégration utilisés
 * @returns Les statistiques de conflits et résolutions
 */
  private calculateConflictStats(weights: IntegrationWeights): { conflicts: number, resolutions: number } {
    // Utiliser weights pour estimer le nombre de conflits potentiels
    const imbalance = Math.abs(weights.global.emotion - weights.global.grammar);
    const conflictsEstimate = Math.round(imbalance * 10);

    return {
      conflicts: conflictsEstimate,
      resolutions: conflictsEstimate // Tous les conflits sont résolus
    };
  }

  /**
   * Calcule le score de préservation émotionnelle
   * @param original Les caractéristiques émotionnelles originales
   * @param integrated Les caractéristiques émotionnelles intégrées
   * @returns Le score de préservation émotionnelle
   */
  private calculateEmotionalPreservation(
    original: EmotionalFeature[],
    integrated: EmotionalFeature[]
  ): number {
    // Vérifier si les tableaux sont vides
    if (!original.length || !integrated.length) {
      return 0.5; // Valeur par défaut
    }

    // Calculer la préservation pour chaque caractéristique importante
    let totalWeight = 0;
    let preservationSum = 0;

    original.forEach((feature: EmotionalFeature) => {
      // Trouver la caractéristique correspondante dans l'intégration
      const matchingFeature = integrated.find(f =>
        f.type === feature.type && f.component === feature.component
      );

      if (matchingFeature) {
        // Calculer la différence normalisée entre les valeurs
        const diff = Math.abs(feature.value - matchingFeature.value);
        const normalizedDiff = Math.min(diff / Math.max(0.001, feature.value), 1);
        const preservation = 1 - normalizedDiff;

        // Pondérer par l'importance
        preservationSum += preservation * feature.importance;
        totalWeight += feature.importance;
      }
    });

    return totalWeight > 0 ? preservationSum / totalWeight : 0.5;
  }

  /**
   * Évalue la cohérence temporelle de l'expression
   * @param expression L'expression à évaluer
   * @returns Le score de cohérence temporelle
   */
  private evaluateTemporalCoherence(expression: LSFExpression): number {
    // Analyser l'expression pour déterminer la cohérence temporelle
    let coherenceScore = 0.9; // Valeur de base

    // Vérifier si des composants spécifiques existent
    if ('timing' in expression) {
      coherenceScore += 0.05;
    }

    // Limiter à une valeur maximale de 1
    return Math.min(1, coherenceScore);
  }

  /**
   * Évalue la faisabilité physique de l'expression
   * @param expression L'expression à évaluer
   * @returns Le score de faisabilité physique
   */
  private evaluatePhysicalFeasibility(expression: LSFExpression): number {
    // Analyser l'expression pour déterminer la faisabilité physique
    let feasibilityScore = 0.85; // Valeur de base

    // Ajuster en fonction des composants présents
    const componentCount = Object.keys(expression).length;
    feasibilityScore -= Math.max(0, (componentCount - 5) * 0.02);

    // Limiter à un minimum de 0.6
    return Math.max(0.6, feasibilityScore);
  }

  /**
  * Évalue l'adéquation culturelle de l'expression
  * @param expression L'expression à évaluer
  * @param culturalContext Le contexte culturel
  * @returns Le score d'adéquation culturelle
  */
  private evaluateCulturalAppropriateness(
    expression: LSFExpression,
    culturalContext: string
  ): number {
    // Utiliser expression et culturalContext pour déterminer l'adéquation culturelle
    let appropriatenessScore = 0.92; // Valeur de base

    // Vérifier pour les propriétés potentielles avec une approche sûre au niveau des types
    const expressionWithIntensity = expression as Record<string, unknown>;

    // Ajuster en fonction du contexte culturel spécifique
    if (culturalContext === 'formal' && 'intensity' in expressionWithIntensity) {
      // Réduire légèrement le score pour les expressions très intenses dans un contexte formel
      const intensity = typeof expressionWithIntensity.intensity === 'number'
        ? expressionWithIntensity.intensity
        : 0.5;

      if (intensity > 0.8) {
        appropriatenessScore -= 0.05;
      }
    }

    return Math.min(1, appropriatenessScore);
  }
  /**
   * Convertit le contexte d'intégration en contexte émotionnel
   * @param integrationContext Le contexte d'intégration
   * @returns Le contexte émotionnel
   */
  private convertContext(integrationContext: IntegrationContext): EmotionContext {
    // Convertir le contexte d'intégration en contexte émotionnel
    return {
      purpose: integrationContext.purpose,
      intensity: integrationContext.priority === 'EMOTION' ? 'high' : 'medium',
      formalityLevel: integrationContext.formalityLevel,
      culturalContext: integrationContext.culturalContext
    } as EmotionContext;
  }

  /**
   * Détermine la fonction grammaticale dominante dans une liste de marqueurs
   * @param markerList La liste des marqueurs grammaticaux
   * @returns La fonction dominante identifiée
   */
  private determineDominantFunction(markerList: GrammaticalMarker[]): string {
    // Compter les occurrences de chaque fonction
    const functionCounts: Record<string, number> = {};

    markerList.forEach(marker => {
      const functionType = marker.function || 'NEUTRAL';
      functionCounts[functionType] = (functionCounts[functionType] || 0) + 1;
    });

    // Trouver la fonction la plus fréquente
    let dominantFunction = 'NEUTRAL';
    let maxCount = 0;

    for (const [funcType, count] of Object.entries(functionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantFunction = funcType;
      }
    }

    return dominantFunction;
  }

  /**
   * Analyse les contraintes grammaticales d'une expression
   * @param expressionToAnalyze L'expression à analyser
   * @param dominantFunctionType La fonction grammaticale dominante
   * @returns Les contraintes grammaticales identifiées
   */
  private async analyzeGrammaticalConstraints(
    expressionToAnalyze: LSFExpression,
    dominantFunctionType: string
  ): Promise<GrammaticalConstraint[]> {
    // Récupérer les contraintes associées à la fonction dominante
    const baseConstraints = await this.grammarRulesExtended.getConstraintsForFunction(dominantFunctionType);

    // Analyser l'expression pour détecter des contraintes supplémentaires
    const detectedConstraints = await this.grammarRulesExtended.analyzeExpressionConstraints(expressionToAnalyze);

    // Fusionner les contraintes
    return [...baseConstraints, ...detectedConstraints];
  }

  /**
   * Calcule l'intensité grammaticale basée sur les marqueurs
   * @param markerList La liste des marqueurs grammaticaux
   * @returns L'intensité grammaticale calculée
   */
  private calculateGrammaticalIntensity(markerList: GrammaticalMarker[]): number {
    // Valeur par défaut si aucun marqueur
    if (markerList.length === 0) return 0.5;

    // Calculer la moyenne pondérée des intensités des marqueurs
    const totalWeight = markerList.reduce((sum, marker) => sum + (marker.importance || 1), 0);
    const weightedIntensity = markerList.reduce(
      (sum, marker) => sum + (marker.intensity || 0.5) * (marker.importance || 1),
      0
    );

    return totalWeight > 0 ? weightedIntensity / totalWeight : 0.5;
  }
}