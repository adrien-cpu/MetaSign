/**
 * @class RPMStateManager
 * @brief Manages the state of RPM avatars, including synchronization and state updates.
 */

// Définition des interfaces manquantes
/**
 * Interface for RPM avatar state
 */
interface RPMAvatarState {
  morphTargets: RPMMorphTargets;
  lastUpdate: number;
  isInSync: boolean;
}

/**
 * Interface for morph targets
 */
interface RPMMorphTargets {
  [key: string]: number;
}

/**
 * Interface for LSF state
 */
interface LSFState {
  type: 'neutre' | 'interrogatif' | 'affirmatif' | 'negatif';
  intensity: number;
  duration: number;
}

/**
 * Interface for transition parameters
 */
interface TransitionParameters {
  duration: number;
  steps: Array<Partial<RPMMorphTargets>>;
  easing: string;
}

/**
 * @class RPMStateManager
 * @brief Manages both RPM avatar state and LSF state transitions
 */
export class RPMStateManager {
  /**
   * @brief The current state of the RPM avatar.
   */
  private currentState: RPMAvatarState = {
    morphTargets: {},
    lastUpdate: 0,
    isInSync: true
  };

  /**
   * @brief The current LSF state.
   */
  private currentLSFState: LSFState = {
    type: 'neutre',
    intensity: 0,
    duration: 0
  };

  /**
   * @brief The rules for valid transitions between LSF states.
   */
  private transitionRules: Map<string, string[]> = new Map();

  constructor() {
    this.initializeTransitionRules();
  }

  /**
   * @brief Initialize the transition rules between different LSF states
   */
  private initializeTransitionRules(): void {
    this.transitionRules.set('neutre', ['interrogatif', 'affirmatif', 'negatif']);
    this.transitionRules.set('interrogatif', ['neutre', 'affirmatif']);
    this.transitionRules.set('affirmatif', ['neutre', 'interrogatif']);
    this.transitionRules.set('negatif', ['neutre']);
  }

  /**
   * @brief Synchronizes the current state with new morph targets.
   * @param newMorphTargets The new morph targets to synchronize with.
   * @return A promise that resolves when the state is synchronized.
   */
  async synchronizeState(newMorphTargets: RPMMorphTargets): Promise<void> {
    const stateDiff = this.calculateStateDiff(newMorphTargets);

    if (Object.keys(stateDiff).length > 0) {
      await this.applyStateUpdate(stateDiff);
    }
  }

  /**
   * @brief Calculates the difference between the current state and new morph targets.
   * @param newMorphTargets The new morph targets to compare against.
   * @return A partial object representing the differences in morph targets.
   */
  private calculateStateDiff(newMorphTargets: RPMMorphTargets): Partial<RPMMorphTargets> {
    // Créer un objet vide pour stocker les différences
    const result: Partial<RPMMorphTargets> = {};

    // Obtenir toutes les clés de newMorphTargets
    const keys = Object.keys(newMorphTargets);

    // Parcourir chaque clé
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      // Obtenir la nouvelle valeur
      const newValue = Number(newMorphTargets[key]);

      // Obtenir la valeur actuelle ou utiliser 0 si elle n'existe pas
      let currentValue = 0;
      if (key in this.currentState.morphTargets) {
        currentValue = Number(this.currentState.morphTargets[key]);
      }

      // Comparer et ajouter à result si différent
      if (newValue !== currentValue) {
        result[key] = newValue;
      }
    }

    return result;
  }

  /**
   * @brief Applies the state update based on the calculated differences.
   * @param diff The differences in morph targets to apply.
   * @return A promise that resolves when the state update is applied.
   */
  private async applyStateUpdate(diff: Partial<RPMMorphTargets>): Promise<void> {
    // Obtenir toutes les clés de diff
    const keys = Object.keys(diff);

    // Appliquer chaque différence à l'état actuel
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = diff[key];

      // Vérifier que value n'est pas undefined avant de l'assigner
      if (value !== undefined) {
        this.currentState.morphTargets[key] = value;
      }
    }

    // Update timestamp
    this.currentState.lastUpdate = Date.now();
    this.currentState.isInSync = true;
  }

  /**
   * @brief Transitions to a new LSF state.
   * @param newState The new LSF state to transition to.
   * @return A promise that resolves to a boolean indicating success.
   */
  async transitionToLSFState(newState: LSFState): Promise<boolean> {
    if (!this.isValidTransition(this.currentLSFState.type, newState.type)) {
      throw new Error('Invalid LSF state transition');
    }

    const success = await this.executeLSFTransition(newState);
    if (success) {
      this.currentLSFState = newState;
    }
    return success;
  }

  /**
   * @brief Checks if a transition between states is valid.
   * @param currentType The current LSF state type.
   * @param newType The new LSF state type.
   * @return A boolean indicating if the transition is valid.
   */
  private isValidTransition(currentType: LSFState['type'], newType: LSFState['type']): boolean {
    const allowedTransitions = this.transitionRules.get(currentType);
    return allowedTransitions?.includes(newType) || false;
  }

  /**
   * @brief Executes the transition to a new LSF state.
   * @param newState The new LSF state to transition to.
   * @return A promise that resolves to a boolean indicating success.
   */
  private async executeLSFTransition(newState: LSFState): Promise<boolean> {
    try {
      // Calcul des paramètres de transition
      const transitionParams = this.calculateTransitionParameters(
        this.currentLSFState,
        newState
      );

      // Exécution de la transition
      await this.applyTransitionParameters(transitionParams);
      return true;
    } catch (error) {
      console.error('LSF transition failed:', error);
      return false;
    }
  }

  /**
   * @brief Calculates parameters for state transition.
   * @param currentState The current LSF state.
   * @param targetState The target LSF state.
   * @return Parameters for the transition.
   */
  private calculateTransitionParameters(
    currentState: LSFState,
    targetState: LSFState
  ): TransitionParameters {
    return {
      duration: this.calculateOptimalDuration(currentState, targetState),
      steps: this.generateTransitionSteps(currentState, targetState),
      easing: this.determineEasingFunction(currentState, targetState)
    };
  }

  /**
   * @brief Applies transition parameters to execute the transition.
   * @param params The transition parameters to apply.
   * @return A promise that resolves when the transition is applied.
   */
  private async applyTransitionParameters(params: TransitionParameters): Promise<void> {
    // Implementation for applying transition parameters
    // For now, just a simple console log
    console.log(`Applying transition with ${params.steps.length} steps over ${params.duration}ms using ${params.easing} easing`);

    // Here you would implement the actual transition logic, e.g.:
    // - Apply each step in sequence
    // - Use the easing function
    // - Respect the duration

    // Example implementation:
    for (const step of params.steps) {
      await this.applyStateUpdate(step);
      // Wait for appropriate time between steps
      await new Promise(resolve => setTimeout(resolve, params.duration / params.steps.length));
    }
  }

  /**
   * @brief Calculates the optimal duration for a transition.
   * @param currentState The current LSF state.
   * @param targetState The target LSF state.
   * @return The optimal duration in milliseconds.
   */
  private calculateOptimalDuration(currentState: LSFState, targetState: LSFState): number {
    // Implementation for calculating optimal duration
    // For now, just a simple calculation based on intensity difference
    const intensityDiff = Math.abs(targetState.intensity - currentState.intensity);
    const baseDuration = 300; // Base duration in ms

    return baseDuration + (intensityDiff * 100);
  }

  /**
   * @brief Generates the steps for a transition.
   * @param currentState The current LSF state.
   * @param targetState The target LSF state.
   * @return An array of steps as partial morph targets.
   */
  private generateTransitionSteps(currentState: LSFState, targetState: LSFState): Array<Partial<RPMMorphTargets>> {
    // Implementation for generating transition steps
    // For now, just generate a simple set of steps
    const numSteps = 5;
    const steps: Array<Partial<RPMMorphTargets>> = [];

    for (let i = 1; i <= numSteps; i++) {
      const progress = i / numSteps;

      // Generate morphs based on progress between states
      const morphs: Partial<RPMMorphTargets> = {};

      // Example: generate some morphs based on the state types
      if (currentState.type === 'neutre' && targetState.type === 'interrogatif') {
        morphs['eyebrow_raise'] = progress * targetState.intensity;
        morphs['head_tilt'] = progress * targetState.intensity * 0.5;
      }

      steps.push(morphs);
    }

    return steps;
  }

  /**
   * @brief Determines the easing function for a transition.
   * @param currentState The current LSF state.
   * @param targetState The target LSF state.
   * @return The name of the easing function.
   */
  private determineEasingFunction(currentState: LSFState, targetState: LSFState): string {
    // Implementation for determining easing function
    // Choose based on state types and intensity changes

    // Default to 'linear'
    let easing = 'linear';

    // Higher intensity changes use 'easeInOutQuad' for smoother transitions
    if (Math.abs(targetState.intensity - currentState.intensity) > 0.5) {
      easing = 'easeInOutQuad';
    }

    // Specific transitions may use specific easings
    if (currentState.type === 'neutre' && targetState.type === 'interrogatif') {
      easing = 'easeOutQuad';
    } else if (currentState.type === 'neutre' && targetState.type === 'negatif') {
      easing = 'easeInOutBack';
    }

    return easing;
  }
}