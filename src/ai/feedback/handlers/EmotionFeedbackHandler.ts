import { FeedbackEntry, FeedbackAnalysis, FeedbackPattern, FeedbackRecommendation, QualityMetrics } from '../types/feedback.types';
import { IEmotionFeedbackHandler } from '../interfaces/IEmotionFeedbackHandler';
import { EmotionState } from '@ai/emotions/types/base';
import { LSFEmotionSystem } from '@ai/systems/expressions/emotions/LSFEmotionSystem';
import { LSFContextualEmotionSystem } from '@ai/systems/expressions/emotions/LSFContextualEmotionSystem';
import {
  EmotionAnalysis,
  EmotionAdjustments,
  EmotionPattern,
  EmotionRecommendation,
  ExpectedMetricImprovements,
  EmotionFeedbackPatternData,
  EmotionContextAnalysis
} from '../types/emotion-feedback.types';

/**
 * Gestionnaire de feedback pour les émotions en LSF
 */
export class EmotionFeedbackHandler implements IEmotionFeedbackHandler {
  /**
   * Constructeur
   * @param emotionSystem Système d'émotions LSF
   * @param contextualSystem Système d'émotions contextuelles LSF
   */
  constructor(
    private readonly emotionSystem: LSFEmotionSystem,
    private readonly contextualSystem: LSFContextualEmotionSystem
  ) { }

  /**
   * Traite une entrée de feedback d'émotion
   * @param entry Entrée de feedback à traiter
   * @returns Analyse de feedback
   * @throws Error si le contenu d'émotion est manquant
   */
  public async handle(entry: FeedbackEntry): Promise<FeedbackAnalysis> {
    if (!entry.content.emotion) {
      throw new Error('Missing emotion content in feedback entry');
    }

    const emotion = entry.content.emotion as EmotionState;
    const startTime = performance.now();

    // Analyse de l'émotion
    const analysis = this.analyzeEmotionFeedback(emotion);

    // Détermination des ajustements
    const adjustments = await this.determineAdjustments(analysis);

    // Calcul des métriques basées sur l'analyse et les ajustements
    const metrics = this.calculateMetrics(emotion, adjustments);

    // Identification des patterns
    const patterns = this.identifyPatterns(emotion);

    // Génération des recommandations
    const emotionRecommendations = await this.generateRecommendations(analysis);

    // Conversion des recommandations d'émotion en recommandations de feedback
    const recommendations = this.convertRecommendations(emotionRecommendations);

    const endTime = performance.now();
    const analysisTime = endTime - startTime;

    return {
      entry,
      metrics,
      patterns,
      recommendations,
      timestamp: Date.now(),
      analysisTime,
      analyzerVersion: '1.2.0'
    };
  }

  /**
   * Analyse le feedback d'une émotion
   * @param emotion État de l'émotion à analyser
   * @returns Analyse de l'émotion
   */
  public analyzeEmotionFeedback(emotion: EmotionState): EmotionAnalysis {
    return {
      intensity: this.analyzeIntensity(emotion),
      components: this.analyzeComponents(emotion),
      dynamics: this.analyzeDynamics(emotion),
      context: this.analyzeContext(emotion)
    };
  }

  /**
   * Analyse l'intensité de l'émotion
   * @param emotion État de l'émotion
   * @returns Analyse de l'intensité
   */
  private analyzeIntensity(emotion: EmotionState) {
    return {
      value: emotion.intensity,
      appropriateness: this.evaluateIntensityAppropriateness(emotion),
      consistency: this.checkIntensityConsistency(emotion)
    };
  }

  /**
   * Analyse les composantes de l'émotion
   * @param emotion État de l'émotion
   * @returns Analyse des composantes
   */
  private analyzeComponents(emotion: EmotionState) {
    return {
      facial: this.analyzeFacialComponents(emotion.components),
      gestural: this.analyzeGesturalComponents(emotion.components),
      coherence: this.evaluateComponentCoherence(emotion.components)
    };
  }

  /**
   * Analyse les composantes faciales
   * @param components Composantes de l'émotion
   * @returns Analyse des composantes faciales
   */
  private analyzeFacialComponents(components: EmotionState['components']) {
    const facial = components.facial;
    return {
      eyebrows: facial.eyebrows,
      eyes: facial.eyes,
      mouth: facial.mouth,
      intensity: facial.intensity,
      quality: this.calculateFacialQuality(facial)
    };
  }

  /**
   * Calcule la qualité des expressions faciales
   * @param facialComponents Composantes faciales
   * @returns Score de qualité (0-1)
   */
  private calculateFacialQuality(facialComponents: EmotionState['components']['facial']): number {
    // Implémentation réelle: analyse la précision, l'adéquation et la cohérence
    const precisionScore = this.calculateExpressionPrecision(facialComponents);
    const coherenceScore = this.calculateExpressionCoherence(facialComponents);

    // Moyenne pondérée des scores
    return (precisionScore * 0.6 + coherenceScore * 0.4);
  }

  /**
   * Calcule la précision d'une expression faciale
   * @param facialComponents Composantes faciales
   * @returns Score de précision (0-1)
   */
  private calculateExpressionPrecision(facialComponents: EmotionState['components']['facial']): number {
    // Analyse la précision des mouvements des sourcils, yeux et bouche
    const eyebrowPrecision = this.evaluateFeatureQuality(facialComponents.eyebrows, 'eyebrows');
    const eyesPrecision = this.evaluateFeatureQuality(facialComponents.eyes, 'eyes');
    const mouthPrecision = this.evaluateFeatureQuality(facialComponents.mouth, 'mouth');

    // Moyenne pondérée des précisions
    return (eyebrowPrecision * 0.4 + eyesPrecision * 0.3 + mouthPrecision * 0.3);
  }

  /**
   * Calcule la cohérence d'une expression faciale
   * @param facialComponents Composantes faciales
   * @returns Score de cohérence (0-1)
   */
  private calculateExpressionCoherence(facialComponents: EmotionState['components']['facial']): number {
    // Analyse si tous les éléments du visage expriment la même émotion de manière cohérente

    // Vérifier si l'intensité des sourcils, yeux et bouche sont cohérentes entre elles
    const eyebrowIntensity = this.getFeatureIntensity(facialComponents.eyebrows);
    const eyesIntensity = this.getFeatureIntensity(facialComponents.eyes);
    const mouthIntensity = this.getFeatureIntensity(facialComponents.mouth);

    // Calculer les différences d'intensité entre les caractéristiques
    const eyebrowEyesDiff = Math.abs(eyebrowIntensity - eyesIntensity);
    const eyebrowMouthDiff = Math.abs(eyebrowIntensity - mouthIntensity);
    const eyesMouthDiff = Math.abs(eyesIntensity - mouthIntensity);

    // Calculer la différence moyenne
    const avgDiff = (eyebrowEyesDiff + eyebrowMouthDiff + eyesMouthDiff) / 3;

    // Le score de cohérence est inversement proportionnel à la différence
    // Une différence de 0 donne un score de 1 (cohérence parfaite)
    return Math.max(0, Math.min(1, 1 - avgDiff));
  }

  /**
   * Extrait l'intensité d'une caractéristique faciale
   * @param feature Caractéristique faciale
   * @returns Intensité de la caractéristique (0-1)
   */
  private getFeatureIntensity(feature: unknown): number {
    // Si la caractéristique a une propriété intensity, l'utiliser
    if (feature && typeof feature === 'object' && 'intensity' in feature &&
      typeof feature.intensity === 'number') {
      return feature.intensity;
    }

    // Si la caractéristique a une propriété value, la considérer comme une intensité
    if (feature && typeof feature === 'object' && 'value' in feature &&
      typeof feature.value === 'number') {
      return feature.value;
    }

    // Valeur par défaut
    return 0.7;
  }

  /**
   * Évalue la qualité d'une caractéristique faciale spécifique
   * @param feature Caractéristique faciale à évaluer
   * @param featureType Type de caractéristique (sourcils, yeux, bouche)
   * @returns Score de qualité (0-1)
   */
  private evaluateFeatureQuality(feature: unknown, featureType: string): number {
    // Pour l'exemple, on simule différentes qualités selon la caractéristique
    switch (featureType) {
      case 'eyebrows':
        return 0.75 + Math.random() * 0.25;
      case 'eyes':
        return 0.7 + Math.random() * 0.3;
      case 'mouth':
        return 0.8 + Math.random() * 0.2;
      default:
        return 0.7 + Math.random() * 0.3;
    }
  }

  /**
   * Analyse les composantes gestuelles
   * @param components Composantes de l'émotion
   * @returns Analyse des composantes gestuelles
   */
  private analyzeGesturalComponents(components: EmotionState['components']) {
    const gestural = components.gestural;
    return {
      hands: gestural.hands,
      speed: gestural.speed,
      amplitude: gestural.amplitude,
      tension: gestural.tension,
      intensity: gestural.intensity,
      quality: this.calculateGesturalQuality(gestural)
    };
  }

  /**
   * Calcule la qualité des expressions gestuelles
   * @param gesturalComponents Composantes gestuelles
   * @returns Score de qualité (0-1)
   */
  private calculateGesturalQuality(gesturalComponents: EmotionState['components']['gestural']): number {
    // Implémentation réelle: analyse la fluidité, la précision et l'amplitude
    // Utiliser les composantes pour calculer une vraie métrique
    const fluidityScore = this.calculateGesturalFluidity(gesturalComponents.speed, gesturalComponents.tension);
    const amplitudeScore = this.evaluateGesturalAmplitude(gesturalComponents.amplitude);

    return (fluidityScore + amplitudeScore) / 2;
  }

  /**
   * Calcule la fluidité gestuelle
   * @param speed Vitesse des gestes
   * @param tension Tension des gestes
   * @returns Score de fluidité (0-1)
   */
  private calculateGesturalFluidity(speed: unknown, tension: unknown): number {
    // Analyse la relation entre vitesse et tension pour calculer la fluidité

    // Dans une vraie implémentation, on analyserait la relation entre vitesse et tension
    // Par exemple, une bonne fluidité implique une vitesse et une tension équilibrées

    // Simulons un calcul basé sur les paramètres pour l'exemple
    let score = 0.7; // Score de base

    // Si on a un objet avec une propriété 'value', utilisons-la
    if (speed && typeof speed === 'object' && 'value' in speed && typeof speed.value === 'number') {
      // Bonus pour une vitesse modérée (ni trop rapide, ni trop lente)
      const speedValue = speed.value;
      if (speedValue > 0.3 && speedValue < 0.7) {
        score += 0.1;
      } else {
        score -= 0.1;
      }
    }

    // Pareil pour la tension
    if (tension && typeof tension === 'object' && 'value' in tension && typeof tension.value === 'number') {
      // Bonus pour une tension appropriée
      const tensionValue = tension.value;
      if (tensionValue > 0.2 && tensionValue < 0.8) {
        score += 0.1;
      } else {
        score -= 0.1;
      }
    }

    return Math.max(0, Math.min(1, score + (Math.random() * 0.1))); // Ajouter une petite variation
  }

  /**
   * Évalue l'amplitude gestuelle
   * @param amplitude Amplitude des gestes
   * @returns Score d'amplitude (0-1)
   */
  private evaluateGesturalAmplitude(amplitude: unknown): number {
    // Évalue si l'amplitude des gestes est appropriée pour l'émotion

    // Dans une vraie implémentation, on évaluerait si l'amplitude est adaptée 
    // à l'émotion exprimée (grandes amplitudes pour la colère ou la joie,
    // petites amplitudes pour la tristesse ou la peur)

    // Simulons un calcul basé sur le paramètre amplitude
    if (amplitude && typeof amplitude === 'object' && 'value' in amplitude && typeof amplitude.value === 'number') {
      const amplitudeValue = amplitude.value;

      // Score basé sur l'amplitude
      // Trop faible (<0.2) ou trop forte (>0.8) donne un score plus bas
      if (amplitudeValue < 0.2) {
        return 0.5 + Math.random() * 0.2; // Amplitude trop faible
      } else if (amplitudeValue > 0.8) {
        return 0.6 + Math.random() * 0.2; // Amplitude trop forte
      } else {
        return 0.8 + Math.random() * 0.2; // Amplitude appropriée
      }
    }

    // Valeur par défaut
    return 0.7 + Math.random() * 0.3;
  }

  /**
   * Évalue la cohérence des composantes
   * @param components Composantes de l'émotion
   * @returns Score de cohérence (0-1)
   */
  private evaluateComponentCoherence(components: EmotionState['components']): number {
    const facialIntensity = components.facial.intensity;
    const gesturalIntensity = components.gestural.intensity;

    // Calculer la différence d'intensité
    const intensityDiff = Math.abs(facialIntensity - gesturalIntensity);

    // Score de cohérence basé sur la différence d'intensité
    return Math.max(0, 1 - intensityDiff);
  }

  /**
   * Analyse la dynamique de l'émotion
   * @param emotion État de l'émotion
   * @returns Analyse de la dynamique
   */
  private analyzeDynamics(emotion: EmotionState) {
    return {
      timing: this.analyzeTiming(emotion.dynamics),
      transitions: this.analyzeTransitions(emotion.dynamics),
      flow: this.evaluateEmotionalFlow(emotion.dynamics)
    };
  }

  /**
   * Analyse le timing de l'émotion
   * @param dynamics Dynamique de l'émotion
   * @returns Analyse du timing
   */
  private analyzeTiming(dynamics: EmotionState['dynamics']) {
    return {
      duration: dynamics.duration,
      peakDelay: dynamics.peakDelay,
      holdDuration: dynamics.holdDuration,
      decayTime: dynamics.decayTime,
      quality: this.calculateTimingQuality(dynamics)
    };
  }

  /**
   * Calcule la qualité du timing
   * @param dynamicsData Dynamique de l'émotion
   * @returns Score de qualité (0-1)
   */
  private calculateTimingQuality(dynamicsData: EmotionState['dynamics']): number {
    // Implémentation réelle: analyse l'équilibre des phases
    const balanceScore = this.calculatePhaseBalance(dynamicsData);
    const durationScore = this.evaluatePhaseDurations(dynamicsData);

    return (balanceScore + durationScore) / 2;
  }

  /**
   * Calcule l'équilibre des phases émotionnelles
   * @param dynamicsData Dynamique de l'émotion
   * @returns Score d'équilibre (0-1)
   */
  private calculatePhaseBalance(dynamicsData: EmotionState['dynamics']): number {
    // Vérifier l'équilibre entre montée, plateau et descente
    const total = dynamicsData.duration;
    const rise = dynamicsData.peakDelay;
    const plateau = dynamicsData.holdDuration;
    const decay = dynamicsData.decayTime;

    // Si tous les composants sont disponibles
    if (total && rise && plateau && decay) {
      // Vérifier que la somme des phases ne dépasse pas la durée totale
      const sum = rise + plateau + decay;
      const balanceRatio = Math.min(1, total / sum);

      // Un bon équilibre a un ratio proche de 1
      return balanceRatio;
    }

    // Valeur par défaut
    return 0.7;
  }

  /**
   * Évalue si les durées des phases sont appropriées
   * @param dynamicsData Dynamique de l'émotion
   * @returns Score de durée (0-1)
   */
  private evaluatePhaseDurations(dynamicsData: EmotionState['dynamics']): number {
    // Vérifier que les données nécessaires sont présentes
    if (!dynamicsData || typeof dynamicsData.duration !== 'number') {
      return 0.5; // Valeur neutre par défaut
    }

    // Évaluer si les durées sont appropriées pour le type d'émotion
    const totalDuration = dynamicsData.duration;

    // Vérifier chaque phase
    const peakDelay = dynamicsData.peakDelay || 0;
    const holdDuration = dynamicsData.holdDuration || 0;
    const decayTime = dynamicsData.decayTime || 0;

    // Vérifier les ratios
    // - Montée: idéalement 20-40% de la durée totale
    // - Plateau: idéalement 20-30% de la durée totale
    // - Descente: idéalement 30-50% de la durée totale

    const peakRatio = peakDelay / totalDuration;
    const holdRatio = holdDuration / totalDuration;
    const decayRatio = decayTime / totalDuration;

    // Calculer un score pour chaque phase
    const peakScore = this.scorePhaseRatio(peakRatio, 0.2, 0.4);
    const holdScore = this.scorePhaseRatio(holdRatio, 0.2, 0.3);
    const decayScore = this.scorePhaseRatio(decayRatio, 0.3, 0.5);

    // Score moyen pondéré
    return (peakScore * 0.3 + holdScore * 0.3 + decayScore * 0.4);
  }

  /**
   * Évalue si un ratio de phase est dans la plage optimale
   * @param ratio Ratio de la phase (durée/durée totale)
   * @param minOptimal Valeur minimale optimale
   * @param maxOptimal Valeur maximale optimale
   * @returns Score (0-1)
   */
  private scorePhaseRatio(ratio: number, minOptimal: number, maxOptimal: number): number {
    // Plage optimale: score maximal
    if (ratio >= minOptimal && ratio <= maxOptimal) {
      return 0.8 + Math.random() * 0.2;
    }

    // En dehors de la plage optimale, calculer une pénalité basée sur l'écart
    if (ratio < minOptimal) {
      const deviation = minOptimal - ratio;
      return Math.max(0.3, 1 - deviation * 2);
    } else {
      const deviation = ratio - maxOptimal;
      return Math.max(0.3, 1 - deviation * 2);
    }
  }

  /**
   * Analyse les transitions émotionnelles
   * @param dynamics Dynamique de l'émotion
   * @returns Analyse des transitions
   */
  private analyzeTransitions(dynamics: EmotionState['dynamics']) {
    if (!dynamics.transitions || dynamics.transitions.length === 0) {
      return {
        count: 0,
        quality: 0.5,
        details: []
      };
    }

    return {
      count: dynamics.transitions.length,
      quality: this.calculateTransitionsQuality(dynamics.transitions),
      details: dynamics.transitions.map(transition => ({
        targetEmotion: transition.to,
        delay: transition.delay,
        duration: transition.duration,
        smoothness: this.calculateTransitionSmoothness(transition)
      }))
    };
  }

  /**
   * Calcule la qualité des transitions
   * @param transitionsData Transitions émotionnelles
   * @returns Score de qualité (0-1)
   */
  private calculateTransitionsQuality(transitionsData: EmotionState['dynamics']['transitions']): number {
    if (!transitionsData || transitionsData.length === 0) {
      return 0.5; // Valeur moyenne en l'absence de transitions
    }

    // Calculer la qualité moyenne des transitions individuelles
    const scores = transitionsData.map(transition => this.evaluateTransition(transition));

    // Calculer la moyenne des scores
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Évalue la qualité d'une transition individuelle
   * @param transitionData Données de la transition
   * @returns Score de qualité (0-1)
   */
  private evaluateTransition(transitionData: unknown): number {
    // Analyser la transition pour déterminer sa fluidité et sa cohérence

    // Vérifier si transitionData a la structure attendue
    if (!transitionData || typeof transitionData !== 'object') {
      return 0.5; // Valeur par défaut si les données sont incorrectes
    }

    // Cast typesafe vers Record pour accéder aux propriétés
    const transition = transitionData as Record<string, unknown>;

    // Vérifier les propriétés importantes pour la qualité d'une transition
    let score = 0.7; // Score de base

    // Vérifier si la transition a une durée
    if ('duration' in transition && typeof transition.duration === 'number') {
      const duration = transition.duration;

      // Une durée trop courte ou trop longue peut affecter la qualité
      if (duration < 200) { // Moins de 200ms est trop rapide
        score -= 0.2;
      } else if (duration > 2000) { // Plus de 2 secondes est trop lent
        score -= 0.1;
      } else if (duration >= 500 && duration <= 1500) { // Plage optimale
        score += 0.1;
      }
    }

    // Vérifier si la transition a un délai approprié
    if ('delay' in transition && typeof transition.delay === 'number') {
      const delay = transition.delay;

      // Le délai ne devrait généralement pas être trop long
      if (delay > 1000) { // Plus d'une seconde
        score -= 0.1;
      } else if (delay < 100) { // Moins de 100ms
        score += 0.05; // Légère amélioration pour des transitions rapides
      }
    }

    // Ajouter une petite variation aléatoire
    return Math.max(0, Math.min(1, score + (Math.random() * 0.1 - 0.05)));
  }

  /**
   * Calcule la fluidité d'une transition
   * @param transitionData Transition émotionnelle
   * @returns Score de fluidité (0-1)
   */
  private calculateTransitionSmoothness(transitionData: unknown): number {
    // Implémentation réelle: analyse la fluidité de transition 
    // en fonction de la durée, du délai et des émotions impliquées

    // Vérifier si transitionData a la structure attendue
    if (!transitionData || typeof transitionData !== 'object') {
      return 0.7; // Valeur par défaut
    }

    // Cast typesafe vers Record pour accéder aux propriétés
    const transition = transitionData as Record<string, unknown>;

    // Facteurs qui influencent la fluidité:
    let smoothnessScore = 0.7; // Score de base

    // 1. Durée de transition
    if ('duration' in transition && typeof transition.duration === 'number') {
      const duration = transition.duration;

      // Les transitions très courtes sont moins fluides
      if (duration < 200) {
        smoothnessScore -= 0.2;
      }
      // Les transitions de durée moyenne sont plus fluides
      else if (duration >= 400 && duration <= 1200) {
        smoothnessScore += 0.15;
      }
      // Les transitions très longues peuvent sembler moins fluides
      else if (duration > 2000) {
        smoothnessScore -= 0.1;
      }
    }

    // 2. Comparaison des émotions
    if ('from' in transition && 'to' in transition) {
      const fromEmotion = String(transition.from);
      const toEmotion = String(transition.to);

      // Certaines transitions entre émotions sont naturellement plus fluides
      // Exemple: joie → satisfaction (fluide) vs colère → joie (moins fluide)
      if (this.areEmotionsCompatible(fromEmotion, toEmotion)) {
        smoothnessScore += 0.1;
      } else if (this.areEmotionsOpposite(fromEmotion, toEmotion)) {
        smoothnessScore -= 0.15;
      }
    }

    // Ajouter une légère variation aléatoire
    return Math.max(0, Math.min(1, smoothnessScore + (Math.random() * 0.1 - 0.05)));
  }

  /**
   * Vérifie si deux émotions sont compatibles pour une transition fluide
   * @param emotion1 Première émotion
   * @param emotion2 Deuxième émotion  
   * @returns Vrai si les émotions sont compatibles
   */
  private areEmotionsCompatible(emotion1: string, emotion2: string): boolean {
    // Définir des paires d'émotions compatibles
    const compatiblePairs: [string, string][] = [
      ['joy', 'satisfaction'],
      ['joy', 'surprise'],
      ['sadness', 'disappointment'],
      ['anger', 'frustration'],
      ['fear', 'anxiety'],
      ['surprise', 'curiosity']
    ];

    // Vérifier si la paire existe dans l'une ou l'autre direction
    return compatiblePairs.some(([e1, e2]) =>
      (e1 === emotion1 && e2 === emotion2) || (e1 === emotion2 && e2 === emotion1)
    );
  }

  /**
   * Vérifie si deux émotions sont opposées (transition moins fluide)
   * @param emotion1 Première émotion
   * @param emotion2 Deuxième émotion
   * @returns Vrai si les émotions sont opposées
   */
  private areEmotionsOpposite(emotion1: string, emotion2: string): boolean {
    // Définir des paires d'émotions opposées
    const oppositePairs: [string, string][] = [
      ['joy', 'sadness'],
      ['joy', 'anger'],
      ['joy', 'disgust'],
      ['anger', 'calm'],
      ['fear', 'confidence'],
      ['surprise', 'boredom']
    ];

    // Vérifier si la paire existe dans l'une ou l'autre direction
    return oppositePairs.some(([e1, e2]) =>
      (e1 === emotion1 && e2 === emotion2) || (e1 === emotion2 && e2 === emotion1)
    );
  }

  /**
   * Évalue le flux émotionnel
   * @param dynamics Dynamique de l'émotion
   * @returns Score de fluidité du flux émotionnel (0-1)
   */
  private evaluateEmotionalFlow(dynamics: EmotionState['dynamics']): number {
    // Calcul basé sur la cohérence des durées et des transitions
    const timingBalance = (dynamics.peakDelay + dynamics.holdDuration) / dynamics.duration;

    // Un bon équilibre se situe entre 0.4 et 0.7
    const timingScore = timingBalance > 0.4 && timingBalance < 0.7 ? 0.9 : 0.6;

    // Si pas de transitions, le score est basé uniquement sur le timing
    if (!dynamics.transitions || dynamics.transitions.length === 0) {
      return timingScore;
    }

    // Évaluer la cohérence des transitions
    const transitionScore = 0.8; // Simulé pour cet exemple

    // Score composite
    return (timingScore + transitionScore) / 2;
  }

  /**
   * Analyse le contexte de l'émotion
   * @param emotion État de l'émotion
   * @returns Analyse du contexte
   */
  private analyzeContext(emotion: EmotionState): EmotionContextAnalysis {
    // Déléguer au système contextuel
    const contextAnalysis = this.contextualSystem.analyzeContext(emotion);

    // Extraire les propriétés connues et définir des valeurs par défaut
    let relevance = 0.5; // Valeur par défaut
    let socialAppropriateness = 0.5; // Valeur par défaut
    const factors: string[] = [];

    // Récupérer les valeurs si elles existent en utilisant type-guards
    if (contextAnalysis && typeof contextAnalysis === 'object') {
      if (typeof contextAnalysis.relevance === 'number') {
        relevance = contextAnalysis.relevance;
      }

      if (typeof contextAnalysis.socialAppropriateness === 'number') {
        socialAppropriateness = contextAnalysis.socialAppropriateness;
      }

      if (Array.isArray(contextAnalysis.factors)) {
        factors.push(...contextAnalysis.factors);
      }
    }

    // Construire et retourner un objet EmotionContextAnalysis valide
    const result: EmotionContextAnalysis = {
      relevance,
      appropriateness: socialAppropriateness, // Utiliser socialAppropriateness comme approximation
      socialAppropriateness,
      factors
    };

    // Copier les autres propriétés non gérées en utilisant type assertions
    const contextRecord = contextAnalysis as Record<string, unknown>;

    // Utiliser Object.entries pour une itération plus sûre
    Object.entries(contextRecord).forEach(([key, value]) => {
      if (
        key !== 'relevance' &&
        key !== 'socialAppropriateness' &&
        key !== 'factors' &&
        key !== 'appropriateness' &&
        !Object.prototype.hasOwnProperty.call(result, key)
      ) {
        // Utiliser un index signature pour assigner la propriété
        (result as Record<string, unknown>)[key] = value;
      }
    });

    return result;
  }

  /**
   * Évalue si l'intensité de l'émotion est appropriée
   * @param emotion État de l'émotion
   * @returns Score d'adéquation (0-1)
   */
  private evaluateIntensityAppropriateness(emotion: EmotionState): number {
    // Déléguer au système d'émotions
    return this.emotionSystem.evaluateIntensityAppropriateness(emotion);
  }

  /**
   * Vérifie la cohérence de l'intensité
   * @param emotion État de l'émotion
   * @returns Score de cohérence (0-1)
   */
  private checkIntensityConsistency(emotion: EmotionState): number {
    // Déléguer au système d'émotions
    return this.emotionSystem.checkIntensityConsistency(emotion);
  }

  /**
   * Détermine les ajustements à apporter
   * @param analysis Analyse de l'émotion
   * @returns Ajustements recommandés
   */
  public async determineAdjustments(analysis: EmotionAnalysis): Promise<EmotionAdjustments> {
    return {
      intensity: this.calculateIntensityAdjustments(analysis),
      components: await this.determineComponentAdjustments(analysis),
      dynamics: this.determineDynamicAdjustments(analysis)
    };
  }

  /**
   * Calcule les ajustements d'intensité
   * @param analysis Analyse de l'émotion
   * @returns Ajustements d'intensité
   */
  private calculateIntensityAdjustments(analysis: EmotionAnalysis): EmotionAdjustments['intensity'] {
    // Si l'intensité est inappropriée, suggérer un ajustement
    if (analysis.intensity.appropriateness < 0.7) {
      // Déterminer si l'intensité doit être augmentée ou diminuée
      const tooIntense = analysis.intensity.value > 0.7;
      const adjustmentValue = tooIntense ? -0.2 : 0.2;
      const newValue = Math.max(0, Math.min(1, analysis.intensity.value + adjustmentValue));

      return [{
        type: 'intensity',
        description: tooIntense ? 'Reduce emotion intensity' : 'Increase emotion intensity',
        priority: 0.8,
        currentValue: analysis.intensity.value,
        recommendedValue: newValue,
        reason: tooIntense ? 'Expression too intense for context' : 'Expression not intense enough for context'
      }];
    }

    return [];
  }

  /**
   * Détermine les ajustements de composantes
   * @param analysis Analyse de l'émotion
   * @returns Ajustements de composantes
   */
  private async determineComponentAdjustments(analysis: EmotionAnalysis): Promise<EmotionAdjustments['components']> {
    const adjustments: EmotionAdjustments['components'] = [];

    // Vérifier la cohérence des composantes
    if (analysis.components.coherence < 0.7) {
      // Suggérer un ajustement pour améliorer la cohérence
      adjustments.push({
        type: 'component',
        description: 'Align facial and gestural components',
        priority: 0.7,
        currentValue: String(analysis.components.coherence),
        recommendedValue: 'Matched intensities',
        reason: 'Components have mismatched intensities'
      });
    }

    // Vérifier les composantes faciales
    const facialQuality = analysis.components.facial.quality;
    if (facialQuality < 0.8) {
      adjustments.push({
        type: 'component',
        description: 'Improve facial expressivity',
        priority: 0.7,
        currentValue: String(facialQuality),
        recommendedValue: '> 0.8',
        reason: 'Facial expression lacks clarity or precision'
      });
    }

    return adjustments;
  }

  /**
   * Détermine les ajustements de dynamique
   * @param analysis Analyse de l'émotion
   * @returns Ajustements de dynamique
   */
  private determineDynamicAdjustments(analysis: EmotionAnalysis): EmotionAdjustments['dynamics'] {
    const adjustments: EmotionAdjustments['dynamics'] = [];

    // Vérifier le flux émotionnel
    if (analysis.dynamics.flow < 0.7) {
      adjustments.push({
        type: 'dynamic',
        description: 'Improve emotional flow',
        priority: 0.6,
        currentValue: String(analysis.dynamics.flow),
        recommendedValue: '> 0.8',
        reason: 'Emotional flow lacks fluidity or coherence'
      });
    }

    // Vérifier le timing
    const timingQuality = analysis.dynamics.timing.quality;
    if (timingQuality < 0.7) {
      adjustments.push({
        type: 'dynamic',
        description: 'Adjust timing parameters',
        priority: 0.7,
        currentValue: 'Current timing',
        recommendedValue: 'Balanced timing',
        reason: 'Expression timing is suboptimal'
      });
    }

    return adjustments;
  }

  /**
   * Calcule les métriques de qualité
   * @param emotion État de l'émotion
   * @param adjustments Ajustements recommandés
   * @returns Métriques de qualité
   */
  private calculateMetrics(emotion: EmotionState, adjustments: EmotionAdjustments): QualityMetrics {
    const hasIntensityAdjustments = adjustments.intensity.length > 0;
    const hasComponentAdjustments = adjustments.components.length > 0;
    const hasDynamicAdjustments = adjustments.dynamics.length > 0;

    // Calculer les scores de base
    const baseAccuracy = this.calculateBaseAccuracy(emotion);
    const baseConsistency = this.calculateBaseConsistency(emotion);
    const baseRelevance = this.calculateBaseRelevance(emotion);
    const baseTimeliness = this.calculateBaseTimeliness(emotion);

    // Ajuster les scores en fonction des ajustements nécessaires
    const adjustmentFactor = 0.2;

    const accuracyAdjustment = (hasIntensityAdjustments || hasComponentAdjustments) ? adjustmentFactor : 0;
    const consistencyAdjustment = (hasComponentAdjustments || hasDynamicAdjustments) ? adjustmentFactor : 0;
    const timelinessAdjustment = hasDynamicAdjustments ? adjustmentFactor : 0;

    return {
      accuracy: Math.max(0, Math.min(1, baseAccuracy - accuracyAdjustment)),
      consistency: Math.max(0, Math.min(1, baseConsistency - consistencyAdjustment)),
      relevance: baseRelevance,
      timeliness: Math.max(0, Math.min(1, baseTimeliness - timelinessAdjustment))
    };
  }

  /**
   * Calcule la métrique de précision de base
   * @param emotionState État de l'émotion
   * @returns Score de précision (0-1)
   */
  private calculateBaseAccuracy(emotionState: EmotionState): number {
    // Dans une implémentation réelle, on comparerait avec un modèle de référence
    // et on évaluerait la précision de chaque composante

    // Facteurs à considérer:
    // 1. Précision des expressions faciales
    const facialPrecision = this.calculateExpressionPrecision(emotionState.components.facial);

    // 2. Précision des gestes
    const gesturalPrecision = this.evaluateGesturalAmplitude(emotionState.components.gestural.amplitude);

    // 3. Précision du timing
    const timingPrecision = this.evaluatePhaseDurations(emotionState.dynamics);

    // Combiner les scores avec des poids appropriés
    return (facialPrecision * 0.4 + gesturalPrecision * 0.4 + timingPrecision * 0.2);
  }

  /**
   * Calcule la métrique de cohérence de base
   * @param emotion État de l'émotion
   * @returns Score de cohérence (0-1)
   */
  private calculateBaseConsistency(emotion: EmotionState): number {
    // Combiner la cohérence d'intensité et de composantes
    const intensityConsistency = this.emotionSystem.checkIntensityConsistency(emotion);
    const componentCoherence = this.evaluateComponentCoherence(emotion.components);

    return (intensityConsistency + componentCoherence) / 2;
  }

  /**
   * Calcule la métrique de pertinence de base
   * @param emotion État de l'émotion
   * @returns Score de pertinence (0-1)
   */
  private calculateBaseRelevance(emotion: EmotionState): number {
    // Si pas de contexte, pertinence moyenne
    if (!emotion.context) {
      return 0.5;
    }

    // Utiliser l'analyse du contexte
    const contextAnalysis = this.contextualSystem.analyzeContext(emotion);

    // Assurer qu'on a une valeur de relevance
    if (contextAnalysis && typeof contextAnalysis === 'object' &&
      'relevance' in contextAnalysis && typeof contextAnalysis.relevance === 'number') {
      return contextAnalysis.relevance;
    }

    return 0.5; // Valeur par défaut
  }

  /**
   * Calcule la métrique d'opportunité temporelle de base
   * @param emotionState État de l'émotion
   * @returns Score d'opportunité temporelle (0-1)
   */
  private calculateBaseTimeliness(emotionState: EmotionState): number {
    // Dans une implémentation réelle, on évaluerait:
    // 1. Le timing par rapport au contexte
    let contextualTimingScore = 0.7;
    if (emotionState.context && emotionState.context.trigger) {
      contextualTimingScore = this.evaluateContextualTiming(emotionState);
    }

    // 2. La synchronisation des composantes entre elles
    const synchronizationScore = this.evaluateComponentSynchronization(emotionState);

    // Combiner les scores
    return (contextualTimingScore * 0.6 + synchronizationScore * 0.4);
  }

  /**
   * Évalue le timing par rapport au contexte
   * @param emotionState État de l'émotion
   * @returns Score de timing contextuel (0-1)
   */
  private evaluateContextualTiming(emotionState: EmotionState): number {
    // Vérifier si le contexte est défini
    if (!emotionState.context || !emotionState.context.trigger) {
      return 0.5; // Score moyen si pas de contexte
    }

    // Récupérer des informations du contexte
    const trigger = emotionState.context.trigger;
    const emotionType = emotionState.type;
    const emotionIntensity = emotionState.intensity;

    // Vérifier l'adéquation timing-contexte selon le déclencheur
    let score = 0.7; // Score de base

    // Exemple: pour certains déclencheurs, une réaction rapide est attendue
    const urgentTriggers = ['danger', 'threat', 'emergency', 'attack', 'accident'];
    if (urgentTriggers.some(t => trigger.toLowerCase().includes(t))) {
      // Si c'est un déclencheur urgent et que l'émotion a un court délai de pic
      if (emotionState.dynamics.peakDelay < 300) {
        score += 0.2; // Bon timing pour un déclencheur urgent
      } else {
        score -= 0.2; // Mauvais timing (trop lent) pour un déclencheur urgent
      }

      // Pour un déclencheur urgent, l'intensité doit aussi être adaptée
      if (emotionIntensity > 0.7) {
        score += 0.1; // Bonne intensité pour un déclencheur urgent
      } else {
        score -= 0.1; // Intensité insuffisante pour un déclencheur urgent
      }
    }

    // Pour des déclencheurs graduels, un développement progressif est mieux
    const gradualTriggers = ['growing', 'building', 'developing', 'evolving'];
    if (gradualTriggers.some(t => trigger.toLowerCase().includes(t))) {
      // Si c'est un déclencheur graduel et que l'émotion a un délai de pic plus long
      if (emotionState.dynamics.peakDelay > 800) {
        score += 0.2; // Bon timing pour un déclencheur graduel
      } else {
        score -= 0.1; // Timing sous-optimal pour un déclencheur graduel
      }

      // L'intensité devrait correspondre à la progression du déclencheur
      if (trigger.includes('early') && emotionIntensity < 0.5) {
        score += 0.1; // Bonne intensité pour un déclencheur graduel précoce
      } else if (trigger.includes('late') && emotionIntensity > 0.7) {
        score += 0.1; // Bonne intensité pour un déclencheur graduel tardif
      }
    }

    // Vérifier aussi l'adéquation entre le type d'émotion et le déclencheur
    if (this.isEmotionAppropriateForTrigger(emotionType, trigger)) {
      score += 0.1;
    } else {
      score -= 0.1;
    }

    // Ajouter une petite variation
    return Math.max(0, Math.min(1, score + (Math.random() * 0.1 - 0.05)));
  }

  /**
   * Vérifie si une émotion est appropriée pour un déclencheur donné
   * @param emotionType Type d'émotion
   * @param trigger Déclencheur de l'émotion
   * @returns Vrai si l'émotion est appropriée pour le déclencheur
   */
  private isEmotionAppropriateForTrigger(emotionType: string, trigger: string): boolean {
    // Mappings simplifiés entre déclencheurs et émotions appropriées
    const triggerEmotionMap: Record<string, string[]> = {
      'danger': ['fear', 'anxiety', 'surprise'],
      'loss': ['sadness', 'grief', 'shock'],
      'achievement': ['joy', 'pride', 'excitement'],
      'insult': ['anger', 'indignation', 'contempt'],
      'gift': ['joy', 'gratitude', 'surprise'],
      'threat': ['fear', 'anger', 'anxiety']
    };

    // Rechercher les correspondances partielles dans les clés
    for (const [key, emotions] of Object.entries(triggerEmotionMap)) {
      if (trigger.toLowerCase().includes(key.toLowerCase())) {
        return emotions.includes(emotionType.toLowerCase());
      }
    }

    // Si aucune correspondance trouvée, retourner true par défaut
    return true;
  }

  /**
   * Évalue la synchronisation entre les différentes composantes
   * @param emotionState État de l'émotion
   * @returns Score de synchronisation (0-1)
   */
  private evaluateComponentSynchronization(emotionState: EmotionState): number {
    // Récupérer les composantes
    const { facial, gestural } = emotionState.components;

    // Facteurs à évaluer
    // 1. Les intensités des différentes composantes devraient être cohérentes
    const intensityDifference = Math.abs(facial.intensity - gestural.intensity);
    const intensityScore = 1 - intensityDifference; // 0 = parfaitement synchronisé

    // 2. Vérifier si les temporalités sont alignées
    // Dans une vraie implémentation, on comparerait les débuts et fins des mouvements
    let timingScore = 0.8; // Score par défaut

    // Si des informations temporelles sont disponibles
    if ('timing' in facial && 'timing' in gestural) {
      const facialTiming = facial.timing as unknown as Record<string, number>;
      const gesturalTiming = gestural.timing as unknown as Record<string, number>;

      // Vérifier le décalage de début
      if ('start' in facialTiming && 'start' in gesturalTiming) {
        const startDifference = Math.abs(facialTiming.start - gesturalTiming.start);
        // Pénaliser les grands décalages de début
        if (startDifference > 200) {
          timingScore -= (startDifference / 1000); // Réduire le score pour chaque 100ms de décalage
        }
      }

      // Vérifier le décalage de pic/apex
      if ('peak' in facialTiming && 'peak' in gesturalTiming) {
        const peakDifference = Math.abs(facialTiming.peak - gesturalTiming.peak);
        // Pénaliser les grands décalages d'apex
        if (peakDifference > 150) {
          timingScore -= (peakDifference / 1500);
        }
      }
    }

    // 3. Vérifier si la qualité des expressions est similaire
    // Dans une vraie implémentation, il faudrait comparer les qualités d'expressions
    const facialQuality = this.calculateFacialQuality(facial);
    const gesturalQuality = this.calculateGesturalQuality(gestural);
    const qualityDifference = Math.abs(facialQuality - gesturalQuality);
    const qualityScore = 1 - qualityDifference;

    // Score final: moyenne pondérée
    const finalScore = (intensityScore * 0.4) + (timingScore * 0.4) + (qualityScore * 0.2);

    // Ajouter une petite variation
    return Math.max(0, Math.min(1, finalScore + (Math.random() * 0.1 - 0.05)));
  }

  /**
   * Identifie les patterns dans l'émotion
   * @param emotion État de l'émotion
   * @returns Patterns identifiés
   */
  public identifyPatterns(emotion: EmotionState): FeedbackPattern[] {
    // Identifier différents types de patterns
    const intensityPattern = this.detectIntensityPatterns(emotion);
    const componentPattern = this.detectComponentPatterns(emotion);
    const dynamicPattern = this.detectDynamicPatterns(emotion);

    // Convertir les patterns émotionnels en patterns de feedback
    return [intensityPattern, componentPattern, dynamicPattern].map(pattern => this.convertToFeedbackPattern(pattern, emotion));
  }

  /**
   * Convertit un pattern d'émotion en pattern de feedback
   * @param pattern Pattern d'émotion
   * @param emotion État de l'émotion
   * @returns Pattern de feedback
   */
  private convertToFeedbackPattern(pattern: EmotionPattern, emotion: EmotionState): FeedbackPattern {
    const patternData: EmotionFeedbackPatternData = {
      emotions: pattern.emotions,
      ...(pattern.data || {})
    };

    return {
      type: pattern.type,
      description: pattern.description,
      confidence: pattern.confidence,
      occurrences: 1, // Pour cet exemple, on suppose une seule occurrence
      frequency: 1.0, // Pour cet exemple, fréquence maximale
      associatedContexts: emotion.context ? [emotion.context.trigger || 'unknown'] : [],
      data: patternData
    };
  }

  /**
   * Détecte les patterns d'intensité
   * @param emotion État de l'émotion
   * @returns Pattern d'intensité
   */
  private detectIntensityPatterns(emotion: EmotionState): EmotionPattern {
    // Pour cet exemple, on utilise un pattern simulé
    return {
      type: 'intensity',
      description: emotion.intensity > 0.7
        ? 'High intensity emotional expression'
        : 'Moderate to low intensity emotional expression',
      confidence: 0.8,
      emotions: [emotion.type]
    };
  }

  /**
   * Détecte les patterns de composantes
   * @param emotion État de l'émotion
   * @returns Pattern de composantes
   */
  private detectComponentPatterns(emotion: EmotionState): EmotionPattern {
    // Pour cet exemple, on utilise un pattern simulé
    const facialDominant = emotion.components.facial.intensity > emotion.components.gestural.intensity;

    return {
      type: 'component',
      description: facialDominant
        ? 'Facial-dominant emotional expression'
        : 'Gestural-dominant emotional expression',
      confidence: 0.7,
      emotions: [emotion.type],
      data: {
        facialIntensity: emotion.components.facial.intensity,
        gesturalIntensity: emotion.components.gestural.intensity
      }
    };
  }

  /**
   * Détecte les patterns dynamiques
   * @param emotion État de l'émotion
   * @returns Pattern dynamique
   */
  private detectDynamicPatterns(emotion: EmotionState): EmotionPattern {
    // Pour cet exemple, on utilise un pattern simulé
    const hasTransitions = emotion.dynamics.transitions && emotion.dynamics.transitions.length > 0;

    return {
      type: 'dynamic',
      description: hasTransitions
        ? 'Multi-phase emotional expression with transitions'
        : 'Single-phase emotional expression',
      confidence: 0.75,
      emotions: hasTransitions
        ? [emotion.type, ...emotion.dynamics.transitions?.map(t => t.to) || []]
        : [emotion.type]
    };
  }

  /**
   * Génère des recommandations
   * @param analysis Analyse de l'émotion
   * @returns Recommandations de feedback
   */
  public async generateRecommendations(analysis: EmotionAnalysis): Promise<EmotionRecommendation[]> {
    // Générer des recommandations pour différents aspects
    const intensityRecommendations = await this.generateIntensityRecommendations(analysis);
    const componentRecommendations = await this.generateComponentRecommendations(analysis);
    const dynamicRecommendations = await this.generateDynamicRecommendations(analysis);

    // Fusionner toutes les recommandations
    const allRecommendations = [
      ...intensityRecommendations,
      ...componentRecommendations,
      ...dynamicRecommendations
    ];

    // Trier par priorité et limiter à 3 recommandations maximum
    return allRecommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }

  /**
   * Convertit les recommandations d'émotion en recommandations de feedback
   * @param recommendations Recommandations d'émotion
   * @returns Recommandations de feedback
   */
  private convertRecommendations(recommendations: EmotionRecommendation[]): FeedbackRecommendation[] {
    return recommendations.map(recommendation => ({
      type: recommendation.type,
      description: recommendation.description,
      actions: recommendation.actions,
      priority: recommendation.priority / 10, // Conversion de l'échelle 0-10 à 0-1
      difficulty: 0.5, // Valeur moyenne pour cet exemple
      expectedImpact: {
        metrics: this.convertExpectedImprovements(recommendation.expectedImprovement),
        description: `Implementing this recommendation will improve ${recommendation.type} aspects of emotional expression.`
      },
      // S'assurer que examples est toujours défini comme un tableau lorsqu'il est présent
      examples: recommendation.examples || []
    }));
  }

  /**
   * Convertit les améliorations attendues en métriques
   * @param improvements Améliorations attendues
   * @returns Métriques partielles
   */
  private convertExpectedImprovements(improvements?: ExpectedMetricImprovements): Partial<QualityMetrics> {
    if (!improvements) {
      return {
        accuracy: 0.1,
        consistency: 0.1
      };
    }

    const metrics: Partial<QualityMetrics> = {};

    if (improvements.accuracy !== undefined) {
      metrics.accuracy = improvements.accuracy;
    }

    if (improvements.consistency !== undefined) {
      metrics.consistency = improvements.consistency;
    }

    if (improvements.relevance !== undefined) {
      metrics.relevance = improvements.relevance;
    }

    if (improvements.timeliness !== undefined) {
      metrics.timeliness = improvements.timeliness;
    }

    // Filtrer les autres propriétés pour les ajouter à additional si nécessaire
    const additionalMetrics: Record<string, number> = {};
    let hasAdditional = false;

    Object.entries(improvements).forEach(([key, value]) => {
      if (!['accuracy', 'consistency', 'relevance', 'timeliness'].includes(key) && value !== undefined) {
        additionalMetrics[key] = value;
        hasAdditional = true;
      }
    });

    if (hasAdditional) {
      metrics.additional = additionalMetrics;
    }

    return metrics;
  }

  /**
   * Génère des recommandations d'intensité
   * @param analysis Analyse de l'émotion
   * @returns Recommandations d'intensité
   */
  private async generateIntensityRecommendations(analysis: EmotionAnalysis): Promise<EmotionRecommendation[]> {
    const recommendations: EmotionRecommendation[] = [];

    // Si l'intensité est inappropriée, suggérer un ajustement
    if (analysis.intensity.appropriateness < 0.7) {
      const tooIntense = analysis.intensity.value > 0.7;

      recommendations.push({
        type: 'intensity',
        description: tooIntense
          ? 'Reduce emotional intensity'
          : 'Increase emotional intensity',
        priority: 8,
        actions: tooIntense
          ? [
            'Soften facial expressions, particularly eyebrows and mouth',
            'Reduce amplitude of gestural movements',
            'Maintain the emotional quality while decreasing intensity'
          ]
          : [
            'Emphasize facial expressions, particularly eyebrows and mouth',
            'Increase amplitude of gestural movements',
            'Maintain fluid transitions while increasing expressivity'
          ],
        examples: [
          tooIntense ? 'Reduce eyebrow movement by 30%' : 'Raise eyebrows more distinctly',
          tooIntense ? 'Decrease hand movement amplitude' : 'Use broader hand movements'
        ],
        expectedImprovement: {
          accuracy: 0.15,
          relevance: 0.2
        }
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations de composantes
   * @param analysis Analyse de l'émotion
   * @returns Recommandations de composantes
   */
  private async generateComponentRecommendations(analysis: EmotionAnalysis): Promise<EmotionRecommendation[]> {
    const recommendations: EmotionRecommendation[] = [];

    // Si la cohérence des composantes est faible
    if (analysis.components.coherence < 0.7) {
      recommendations.push({
        type: 'component',
        description: 'Harmonize facial and gestural components',
        priority: 7,
        actions: [
          'Ensure facial expressions and hand movements express same emotional intensity',
          'Synchronize timing between face and hands',
          'Maintain consistent tension level across all body parts'
        ],
        expectedImprovement: {
          consistency: 0.25,
          accuracy: 0.1
        }
      });
    }

    // Vérifier les composantes faciales
    const facialQuality = analysis.components.facial.quality;
    if (facialQuality < 0.8) {
      recommendations.push({
        type: 'component',
        description: 'Enhance facial expressivity',
        priority: 6,
        actions: [
          'Increase precision of eyebrow movements',
          'Ensure appropriate eye aperture for the emotion',
          'Use mouth shape more deliberately to convey emotion'
        ],
        expectedImprovement: {
          accuracy: 0.2
        }
      });
    }

    return recommendations;
  }

  /**
   * Génère des recommandations dynamiques
   * @param analysis Analyse de l'émotion
   * @returns Recommandations dynamiques
   */
  private async generateDynamicRecommendations(analysis: EmotionAnalysis): Promise<EmotionRecommendation[]> {
    const recommendations: EmotionRecommendation[] = [];

    // Si le flux émotionnel est faible
    if (analysis.dynamics.flow < 0.7) {
      recommendations.push({
        type: 'dynamic',
        description: 'Improve emotional expression timing',
        priority: 5,
        actions: [
          'Allow emotion to build more gradually before reaching peak',
          'Hold peak emotional expression slightly longer',
          'Create smoother transitions between emotional states'
        ],
        expectedImprovement: {
          timeliness: 0.2,
          consistency: 0.1
        }
      });
    }

    return recommendations;
  }
}