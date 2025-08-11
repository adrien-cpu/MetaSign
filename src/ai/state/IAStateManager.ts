/**
 * @class IAStateManager
 * @brief Gestionnaire d'état de l'IA
 * @details Gère l'état global et les transitions du système d'IA
 */
export class IAStateManager {
  /** 
   * @brief État actuel de l'IA
   * @private
   */
  private state: AIState;

  /**
   * @brief Constructeur
   * @details Initialise l'état par défaut du système
   */
  constructor() {
    this.state = {
      currentState: 'Linguistes',
      context: {},
      history: []
    };
  }

  /**
   * @brief Dispatch une action
   * @param action Action à traiter
   * @details Met à jour l'état et enregistre la transition
   */
  dispatch(action: AIAction) {
    const newState = aiReducer(this.state, action);
    this.logTransition(this.state.currentState, newState.currentState, action.type);
    this.state = newState;
  }

  /**
   * @brief Enregistre une transition d'état
   * @param from État de départ
   * @param to État d'arrivée
   * @param trigger Action déclenchant la transition
   * @private
   */
  private logTransition(from: string, to: string, trigger: string) {
    this.state.history.push({
      from,
      to,
      timestamp: new Date(),
      trigger
    });
  }
}