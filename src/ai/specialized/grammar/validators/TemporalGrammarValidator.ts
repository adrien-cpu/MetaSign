// src/ai/specialized/grammar/validators/TemporalGrammarValidator.ts

import {
  GrammaticalStructure,
  ValidationResult,
  ValidationDetails
} from '../types';

import {
  Timeline,
  TimelineSegment,
  TimelineBranch,
  TimelineMarker,
  Sequence,
  Transition,
  ComponentAdapter,
  ElementAdapter,
  GrammarComponent
} from './types/temporal-grammar-types';

// Type pour les détails de validation étendus
interface ExtendedValidationDetails extends ValidationDetails {
  [key: string]: unknown;
}

// Validateurs spécialisés
class TimelineValidator {
  validateCoherence(timeline: Timeline): boolean {
    // Vérification de la cohérence de la timeline
    return timeline.mainLine.length > 0;
  }

  validateReferences(timeline: Timeline): boolean {
    // Vérification des références entre segments et branches
    const mainLineIds = new Set(timeline.mainLine.map(segment => segment.id));

    // Vérifier que toutes les branches référencent des segments de la ligne principale
    for (const branch of timeline.branches) {
      if (!mainLineIds.has(branch.parentId)) {
        return false;
      }
    }

    return true;
  }

  validateMarkers(timeline: Timeline): boolean {
    // Vérification des marqueurs temporels
    // Vérifier que les marqueurs sont dans les limites de la timeline
    const timelineStart = timeline.mainLine[0]?.start ?? 0;
    const timelineEnd = timeline.mainLine[timeline.mainLine.length - 1]?.end ?? 0;

    for (const marker of timeline.markers) {
      if (marker.position < timelineStart || marker.position > timelineEnd) {
        return false;
      }
    }

    return true;
  }
}

class SequenceValidator {
  validateOrder(sequences: Sequence[]): boolean {
    // Vérification de l'ordre des séquences
    if (sequences.length <= 1) {
      return true; // Un seul ou aucun élément est toujours ordonné
    }

    // Vérification de base: les dépendances doivent être cohérentes
    const sequenceIds = new Set(sequences.map(seq => seq.id));

    for (const sequence of sequences) {
      for (const dependencyId of sequence.dependencies) {
        if (!sequenceIds.has(dependencyId)) {
          return false; // Dépendance non trouvée
        }
      }
    }

    return true;
  }

  validateDependencies(sequences: Sequence[]): boolean {
    // Vérification des dépendances entre séquences
    // Détection des cycles de dépendances
    const dependencies: Record<string, string[]> = {};

    // Construire le graphe de dépendances
    for (const sequence of sequences) {
      dependencies[sequence.id] = sequence.dependencies;
    }

    // Fonction récursive pour détecter les cycles
    const visited = new Set<string>();
    const path = new Set<string>();

    function hasCycle(node: string): boolean {
      if (path.has(node)) {
        return true; // Cycle détecté
      }

      if (visited.has(node)) {
        return false; // Déjà visité, pas de cycle
      }

      visited.add(node);
      path.add(node);

      for (const dependency of (dependencies[node] || [])) {
        if (hasCycle(dependency)) {
          return true;
        }
      }

      path.delete(node);
      return false;
    }

    // Vérifier les cycles pour chaque séquence
    for (const sequence of sequences) {
      if (hasCycle(sequence.id)) {
        return false;
      }
    }

    return true;
  }

  validateRhythm(sequences: Sequence[]): boolean {
    // Vérification du rythme entre les séquences
    if (sequences.length <= 1) {
      return true;
    }

    // Vérification des intervalles cohérents
    const timings = sequences.map(seq => seq.timing);
    let previousStart = -1;

    for (const timing of timings) {
      // Vérifier que le début est après le précédent
      if (timing.start < previousStart) {
        return false;
      }

      // Vérifier que la durée est positive
      if (timing.duration <= 0) {
        return false;
      }

      previousStart = timing.start;
    }

    return true;
  }
}

export class TemporalGrammarValidator {
  private readonly SEQUENCE_COHERENCE_THRESHOLD = 0.9;
  private readonly TIMELINE_STABILITY_THRESHOLD = 0.85;
  private readonly timelineValidator: TimelineValidator;
  private readonly sequenceValidator: SequenceValidator;

  constructor() {
    this.timelineValidator = new TimelineValidator();
    this.sequenceValidator = new SequenceValidator();
  }

  async validate(structure: GrammaticalStructure): Promise<ValidationResult> {
    try {
      // Validation de la ligne temporelle
      const timelineValidation = await this.validateTimeline(structure);
      if (!timelineValidation.isValid) {
        return this.buildValidationError('Invalid timeline', timelineValidation);
      }

      // Validation des séquences temporelles
      const sequenceValidation = await this.validateSequences(structure);
      if (!sequenceValidation.isValid) {
        return this.buildValidationError('Invalid temporal sequences', sequenceValidation);
      }

      // Validation des transitions temporelles
      const transitionValidation = await this.validateTransitions(structure);
      if (!transitionValidation.isValid) {
        return this.buildValidationError('Invalid temporal transitions', transitionValidation);
      }

      // Validation des aspects temporels
      const aspectValidation = await this.validateTemporalAspects(structure);
      if (!aspectValidation.isValid) {
        return this.buildValidationError('Invalid temporal aspects', aspectValidation);
      }

      const details = this.createValidationDetails({
        timelineScore: timelineValidation.score,
        sequenceScore: sequenceValidation.score,
        transitionScore: transitionValidation.score,
        aspectScore: aspectValidation.score
      });

      return {
        isValid: true,
        score: this.calculateTemporalScore([
          timelineValidation,
          sequenceValidation,
          transitionValidation,
          aspectValidation
        ]),
        details
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      throw new TemporalGrammarError('Temporal grammar validation failed', errorObj);
    }
  }

  private buildValidationError(message: string, validationResult: ValidationResult): ValidationResult {
    const details = this.createValidationDetails({
      error: message,
      sourceValidation: validationResult.details
    });

    return {
      isValid: false,
      score: validationResult.score,
      details
    };
  }

  private async validateTimeline(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Extraction de la structure temporelle
    const timeline = await this.extractTimeline(structure);

    // Validation de la cohérence temporelle
    const coherence = this.timelineValidator.validateCoherence(timeline);

    // Validation des références temporelles
    const references = this.timelineValidator.validateReferences(timeline);

    // Validation des marqueurs temporels
    const markers = this.timelineValidator.validateMarkers(timeline);

    const isValid = coherence && references && markers;
    const score = this.calculateTimelineScore(coherence, references, markers);

    const details = this.createValidationDetails({
      coherence,
      references,
      markers
    });

    return {
      isValid,
      score,
      details
    };
  }

  private async validateSequences(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Extraction des séquences temporelles
    const sequences = await this.extractSequences(structure);

    // Validation de l'ordre des séquences
    const order = this.sequenceValidator.validateOrder(sequences);

    // Validation des dépendances temporelles
    const dependencies = this.sequenceValidator.validateDependencies(sequences);

    // Validation du rythme
    const rhythm = this.sequenceValidator.validateRhythm(sequences);

    const isValid = order && dependencies && rhythm;
    const score = this.calculateSequenceScore(order, dependencies, rhythm);

    const details = this.createValidationDetails({
      order,
      dependencies,
      rhythm
    });

    return {
      isValid,
      score,
      details
    };
  }

  private async validateTransitions(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Extraction des transitions
    const transitions = await this.extractTransitions(structure);

    // Validation de la fluidité
    const fluidity = this.validateTransitionFluidity(transitions);

    // Validation des points de transition
    const points = this.validateTransitionPoints(transitions);

    // Validation de la durée des transitions
    const duration = this.validateTransitionDurations(transitions);

    const isValid = fluidity && points && duration;
    const score = this.calculateTransitionScore(fluidity, points, duration);

    const details = this.createValidationDetails({
      fluidity,
      points,
      duration
    });

    return {
      isValid,
      score,
      details
    };
  }

  private async validateTemporalAspects(
    structure: GrammaticalStructure
  ): Promise<ValidationResult> {
    // Validation des aspects de durée
    const duration = this.validateDurationAspects(structure);

    // Validation des aspects de fréquence
    const frequency = this.validateFrequencyAspects(structure);

    // Validation des aspects de simultanéité
    const simultaneity = this.validateSimultaneityAspects(structure);

    const isValid = duration && frequency && simultaneity;
    const score = this.calculateAspectScore(duration, frequency, simultaneity);

    const details = this.createValidationDetails({
      duration,
      frequency,
      simultaneity
    });

    return {
      isValid,
      score,
      details
    };
  }

  private calculateTemporalScore(validations: ValidationResult[]): number {
    const weights = {
      timeline: 0.3,
      sequences: 0.3,
      transitions: 0.2,
      aspects: 0.2
    };

    return validations.reduce((total, validation, index) => {
      const weight = Object.values(weights)[index];
      return total + (validation.score * weight);
    }, 0);
  }

  private calculateTimelineScore(coherence: boolean, references: boolean, markers: boolean): number {
    let score = 0;
    if (coherence) score += 0.4;
    if (references) score += 0.4;
    if (markers) score += 0.2;
    return score;
  }

  private calculateSequenceScore(order: boolean, dependencies: boolean, rhythm: boolean): number {
    let score = 0;
    if (order) score += 0.4;
    if (dependencies) score += 0.4;
    if (rhythm) score += 0.2;
    return score;
  }

  private calculateTransitionScore(fluidity: boolean, points: boolean, duration: boolean): number {
    let score = 0;
    if (fluidity) score += 0.4;
    if (points) score += 0.3;
    if (duration) score += 0.3;
    return score;
  }

  private calculateAspectScore(duration: boolean, frequency: boolean, simultaneity: boolean): number {
    let score = 0;
    if (duration) score += 0.4;
    if (frequency) score += 0.3;
    if (simultaneity) score += 0.3;
    return score;
  }

  private async extractTimeline(structure: GrammaticalStructure): Promise<Timeline> {
    // Extraction de la structure temporelle
    return {
      mainLine: await this.extractMainTimeline(structure),
      branches: await this.extractTimelineBranches(structure),
      markers: await this.extractTimelineMarkers(structure)
    };
  }

  private async extractMainTimeline(structure: GrammaticalStructure): Promise<TimelineSegment[]> {
    // Extraction de la ligne temporelle principale en utilisant les adapters
    return structure.components
      .filter(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return adapter.getType() === 'TEMPORAL' && adapter.getRole() === 'MAIN';
      })
      .map(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return {
          id: adapter.getId(),
          start: adapter.getStartTime(),
          end: adapter.getStartTime() + adapter.getDuration(),
          content: {
            type: adapter.getSubtype() || 'DEFAULT',
            value: adapter.getValue(),
            additionalData: adapter.getAdditionalData()
          }
        };
      });
  }

  private async extractTimelineBranches(structure: GrammaticalStructure): Promise<TimelineBranch[]> {
    // Extraction des branches temporelles en utilisant les adapters
    return structure.components
      .filter(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return adapter.getType() === 'TEMPORAL' && adapter.getRole() === 'BRANCH';
      })
      .map(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        const elements = adapter.getElements();
        return {
          id: adapter.getId(),
          parentId: adapter.getParentId(),
          segments: elements.map(el => {
            const elementAdapter = new ElementAdapter(el);
            return {
              id: elementAdapter.getId(),
              start: elementAdapter.getStartTime(),
              end: elementAdapter.getStartTime() + elementAdapter.getDuration(),
              content: {
                type: elementAdapter.getType(),
                value: elementAdapter.getValue(),
                additionalData: elementAdapter.getAdditionalData()
              }
            };
          })
        };
      });
  }

  private async extractTimelineMarkers(structure: GrammaticalStructure): Promise<TimelineMarker[]> {
    // Extraction des marqueurs temporels en utilisant les adapters
    return structure.components
      .filter(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return adapter.isMarker();
      })
      .map(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return {
          id: adapter.getId(),
          position: adapter.getMarkerPosition(),
          type: adapter.getMarkerType()
        };
      });
  }

  private async extractSequences(structure: GrammaticalStructure): Promise<Sequence[]> {
    // Extraction des séquences temporelles en utilisant les adapters
    return structure.components
      .filter(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return adapter.getType() === 'TEMPORAL' && adapter.getRole() === 'SEQUENCE';
      })
      .map(comp => this.buildSequence(comp));
  }

  private buildSequence(component: unknown): Sequence {
    const adapter = new ComponentAdapter(component as GrammarComponent);
    const elements = adapter.getElements();

    return {
      id: adapter.getId(),
      elements: elements.map(el => {
        const elementAdapter = new ElementAdapter(el);
        return {
          type: elementAdapter.getType(),
          value: elementAdapter.getValue(),
          additionalData: elementAdapter.getAdditionalData()
        };
      }),
      timing: {
        start: adapter.getStartTime(),
        duration: adapter.getDuration()
      },
      dependencies: adapter.getDependencies()
    };
  }

  private async extractTransitions(structure: GrammaticalStructure): Promise<Transition[]> {
    // Extraction des transitions en utilisant les adapters
    return structure.components
      .filter(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return adapter.isTransition();
      })
      .map(comp => {
        const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
        return {
          id: adapter.getId(),
          fromId: adapter.getTransitionFromId(),
          toId: adapter.getTransitionToId(),
          duration: adapter.getTransitionDuration(),
          type: adapter.getTransitionType()
        };
      });
  }

  private validateTransitionFluidity(transitions: Transition[]): boolean {
    // Validation de la fluidité des transitions
    // Vérification que toutes les transitions ont une durée positive
    return transitions.every(t => t.duration > 0);
  }

  private validateTransitionPoints(transitions: Transition[]): boolean {
    // Validation des points de transition
    // Vérification que toutes les transitions ont des points source et cible
    return transitions.every(t => t.fromId && t.toId);
  }

  private validateTransitionDurations(transitions: Transition[]): boolean {
    // Validation des durées de transition
    // Vérification que toutes les durées sont cohérentes
    return transitions.every(t => t.duration >= 0 && t.duration < 10000); // Limite arbitraire
  }

  private validateDurationAspects(structure: GrammaticalStructure): boolean {
    // Validation des aspects de durée
    // Vérification de la présence de composants temporels
    return structure.components.some(comp => {
      const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
      return adapter.getType() === 'TEMPORAL';
    });
  }

  private validateFrequencyAspects(structure: GrammaticalStructure): boolean {
    // Validation des aspects de fréquence
    // Vérification de la cohérence des fréquences
    const frequencyComponents = structure.components.filter(comp => {
      const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
      return adapter.getType() === 'TEMPORAL' && adapter.getAspectType() === 'FREQUENCY';
    });

    return frequencyComponents.every(comp => {
      const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
      const frequency = adapter.getFrequency();
      return typeof frequency === 'number' && frequency > 0;
    });
  }

  private validateSimultaneityAspects(structure: GrammaticalStructure): boolean {
    // Validation des aspects de simultanéité
    // Vérification de la cohérence des relations de simultanéité
    const simultaneousComponents = structure.components.filter(comp => {
      const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
      return adapter.getType() === 'TEMPORAL' && adapter.getAspectType() === 'SIMULTANEOUS';
    });

    // Vérifier que les références existent
    const allComponentIds = new Set(structure.components.map(comp => comp.id));

    return simultaneousComponents.every(comp => {
      const adapter = new ComponentAdapter(comp as unknown as GrammarComponent);
      const references = adapter.getReferences();
      return references.every(ref => allComponentIds.has(ref));
    });
  }

  private createValidationDetails(additionalDetails: Record<string, unknown>): ValidationDetails {
    // Création d'un objet ValidationDetails avec timestamp et propriétés additionnelles
    const details: ExtendedValidationDetails = {
      timestamp: Date.now()
    };

    // Ajouter toutes les propriétés additionnelles
    Object.entries(additionalDetails).forEach(([key, value]) => {
      details[key] = value;
    });

    return details;
  }
}

class TemporalGrammarError extends Error {
  constructor(message: string, public context: Error) {
    super(message);
    this.name = 'TemporalGrammarError';
  }
}