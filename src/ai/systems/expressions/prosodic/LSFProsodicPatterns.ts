import {
  ProsodicIntensity,
  ProsodicPattern,
  ProsodicTiming,
  ProsodicFeature
} from '@ai-types/lsf';
import { SpatialVector } from '@spatial/types';

/**
 * Représente les modèles prosodiques en Langue des Signes Française
 * Cette classe fournit des méthodes pour gérer les aspects prosodiques
 * comme le rythme, l'intensité et les transitions entre les signes
 */
export class LSFProsodicPatterns {
  private patterns: Map<string, ProsodicPattern>;
  private featuredPatterns: ProsodicFeature[];

  constructor() {
    this.patterns = new Map<string, ProsodicPattern>();
    this.featuredPatterns = [];
    this.initializeDefaultPatterns();
  }

  /**
   * Initialise les modèles prosodiques par défaut
   * @private
   */
  private initializeDefaultPatterns(): void {
    // Modèle standard
    this.addPattern('standard', {
      id: 'standard',
      name: 'Standard',
      intensity: ProsodicIntensity.MEDIUM,
      timing: ProsodicTiming.REGULAR,
      transitionModifier: 1.0,
      spatialAmplitude: { x: 1.0, y: 1.0, z: 1.0 }
    });

    // Modèle accentué
    this.addPattern('emphatic', {
      id: 'emphatic',
      name: 'Emphatique',
      intensity: ProsodicIntensity.HIGH,
      timing: ProsodicTiming.SLOWER,
      transitionModifier: 1.2,
      spatialAmplitude: { x: 1.3, y: 1.3, z: 1.3 }
    });

    // Modèle discret
    this.addPattern('subtle', {
      id: 'subtle',
      name: 'Subtil',
      intensity: ProsodicIntensity.LOW,
      timing: ProsodicTiming.FASTER,
      transitionModifier: 0.8,
      spatialAmplitude: { x: 0.7, y: 0.7, z: 0.7 }
    });

    // Modèle interrogatif
    this.addPattern('question', {
      id: 'question',
      name: 'Interrogatif',
      intensity: ProsodicIntensity.MEDIUM,
      timing: ProsodicTiming.VARIABLE,
      transitionModifier: 1.1,
      spatialAmplitude: { x: 1.0, y: 1.2, z: 1.0 },
      facialExpression: 'raised_eyebrows'
    });

    // Mettre les modèles principaux en favoris par défaut
    this.featuredPatterns = [
      {
        id: 'standard-feature',
        patternId: 'standard',
        title: 'Standard',
        description: 'Modèle prosodique standard pour la communication quotidienne',
        isFavorite: true
      },
      {
        id: 'emphatic-feature',
        patternId: 'emphatic',
        title: 'Emphatique',
        description: 'Accentue les signes pour souligner l\'importance',
        isFavorite: true
      },
      {
        id: 'question-feature',
        patternId: 'question',
        title: 'Interrogatif',
        description: 'Modèle adapté aux questions et aux expressions interrogatives',
        isFavorite: true
      }
    ];
  }

  /**
   * Ajoute un nouveau modèle prosodique
   * @param id Identifiant unique du modèle
   * @param pattern Définition du modèle prosodique
   */
  public addPattern(id: string, pattern: ProsodicPattern): void {
    this.patterns.set(id, pattern);
  }

  /**
   * Récupère un modèle prosodique par son ID
   * @param id Identifiant du modèle
   * @returns Le modèle prosodique ou undefined si non trouvé
   */
  public getPattern(id: string): ProsodicPattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * Récupère tous les modèles prosodiques
   * @returns Map de tous les modèles prosodiques
   */
  public getAllPatterns(): Map<string, ProsodicPattern> {
    return this.patterns;
  }

  /**
   * Récupère les modèles prosodiques mis en avant
   * @returns Liste des modèles prosodiques favoris
   */
  public getFeaturedPatterns(): ProsodicFeature[] {
    return this.featuredPatterns;
  }

  /**
   * Met à jour les modèles prosodiques mis en avant
   * @param features Nouvelle liste des modèles prosodiques favoris
   */
  public updateFeaturedPatterns(features: ProsodicFeature[]): void {
    this.featuredPatterns = features;
  }

  /**
   * Applique un modificateur prosodique à un vecteur spatial
   * @param vector Vecteur spatial original
   * @param patternId ID du modèle prosodique à appliquer
   * @returns Vecteur spatial modifié
   */
  public applyProsodicModifier(vector: SpatialVector, patternId: string): SpatialVector {
    const pattern = this.getPattern(patternId);

    if (!pattern) {
      return vector; // Retourne le vecteur non modifié si le pattern n'existe pas
    }

    const { spatialAmplitude } = pattern;

    return {
      x: vector.x * spatialAmplitude.x,
      y: vector.y * spatialAmplitude.y,
      z: vector.z * spatialAmplitude.z
    };
  }

  /**
   * Calcule le timing (durée) d'un mouvement en fonction du modèle prosodique
   * @param baseTime Temps de base en millisecondes
   * @param patternId ID du modèle prosodique
   * @returns Temps modifié en millisecondes
   */
  public calculateTiming(baseTime: number, patternId: string): number {
    const pattern = this.getPattern(patternId);

    if (!pattern) {
      return baseTime; // Retourne le temps de base si le pattern n'existe pas
    }

    let timingModifier = 1.0;

    switch (pattern.timing) {
      case ProsodicTiming.FASTER:
        timingModifier = 0.8;
        break;
      case ProsodicTiming.SLOWER:
        timingModifier = 1.3;
        break;
      case ProsodicTiming.VARIABLE:
        // Pour les timings variables, on pourrait implémenter une logique plus complexe
        timingModifier = 1.0 + (Math.sin(Date.now() / 1000) * 0.2);
        break;
      case ProsodicTiming.REGULAR:
      default:
        timingModifier = 1.0;
    }

    return baseTime * timingModifier * pattern.transitionModifier;
  }
}

export default LSFProsodicPatterns;