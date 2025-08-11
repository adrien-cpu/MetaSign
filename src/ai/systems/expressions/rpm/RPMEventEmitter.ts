/**
 * RPMEventEmitter - Un émetteur d'événements personnalisé pour le système RPM
 * Permet la communication entre les composants du système par le biais d'événements
 */
export class RPMEventEmitter {
  /** Stockage des écouteurs d'événements */
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

  /**
   * Ajoute un écouteur pour un événement spécifique
   * @param eventName Nom de l'événement
   * @param listener Fonction à appeler lorsque l'événement est émis
   */
  public on(eventName: string, listener: (data: unknown) => void): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(listener);
  }

  /**
   * Supprime un écouteur d'un événement spécifique
   * @param eventName Nom de l'événement
   * @param listener Fonction à supprimer
   * @returns true si l'écouteur a été trouvé et supprimé, false sinon
   */
  public off(eventName: string, listener: (data: unknown) => void): boolean {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) {
      return false;
    }

    const index = eventListeners.indexOf(listener);
    if (index === -1) {
      return false;
    }

    eventListeners.splice(index, 1);
    if (eventListeners.length === 0) {
      this.listeners.delete(eventName);
    }
    return true;
  }

  /**
   * Émet un événement avec des données
   * @param eventName Nom de l'événement à émettre
   * @param data Données à passer aux écouteurs
   */
  protected emit(eventName: string, data: unknown): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      }
    }
  }

  /**
   * Supprime tous les écouteurs d'un événement spécifique
   * @param eventName Nom de l'événement
   */
  public removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Émet un événement avec des données une seule fois, puis supprime tous les écouteurs
   * @param eventName Nom de l'événement à émettre
   * @param data Données à passer aux écouteurs
   */
  protected emitOnce(eventName: string, data: unknown): void {
    this.emit(eventName, data);
    this.removeAllListeners(eventName);
  }
}