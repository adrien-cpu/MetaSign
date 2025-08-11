// src/ai/observers/Feedback.ts
/**
 * @class FeedbackObserver
 * @implements IAObserver
 * @brief Observateur des retours utilisateurs
 * @details Collecte et analyse les retours sur l'état de l'IA
 */
class FeedbackObserver implements IAObserver {
  /**
   * @brief Met à jour l'état selon les retours
   * @param state État actuel de l'IA
   * @returns Promise<void>
   */
  async update(state: AIState): Promise<void> {
    await this.collectFeedback(state);
    await this.sendToJuges(state);
  }
}

/**
 * @class StateManager
 * @brief Gestionnaire d'état de l'IA
 * @details Gère les observateurs et les notifications d'état
 */
class StateManager {
  /** 
   * @brief Liste des observateurs enregistrés
   * @private
   */
  private observers: Set<IAObserver> = new Set();

  /**
   * @brief Enregistre un nouvel observateur
   * @param observer Observateur à ajouter
   */
  registerObserver(observer: IAObserver): void {
    this.observers.add(observer);
  }

  /**
   * @brief Notifie tous les observateurs
   * @returns Promise<void>
   * @private
   */
  private async notifyObservers(): Promise<void> {
    await Promise.all(
      Array.from(this.observers).map(observer => 
        observer.update(this.currentState)
      )
    );
  }
}