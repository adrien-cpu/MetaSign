/**
 * Gestionnaire d'état central pour le système LSF
 * Stocke et gère l'état global de l'application
 */
export class StateManager {
  /**
   * État global du système
   */
  private state: Record<string, unknown> = {};

  /**
   * Abonnés aux changements d'état
   */
  private subscribers: Map<string, (state: unknown) => void> = new Map();

  /**
   * Historique des états pour le débogage et la récupération
   */
  private stateHistory: Array<{
    timestamp: number;
    path: string;
    oldValue: unknown;
    newValue: unknown;
  }> = [];

  /**
   * Profondeur maximale de l'historique
   */
  private readonly maxHistoryDepth = 100;

  /**
   * Récupère une valeur de l'état
   * @param path Chemin de la valeur (ex: "user.preferences.theme")
   * @param defaultValue Valeur par défaut si le chemin n'existe pas
   * @returns Valeur à ce chemin ou valeur par défaut
   */
  public getState<T>(path: string, defaultValue?: T): T {
    const parts = path.split('.');
    let current: Record<string, unknown> | unknown = this.state;

    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue as T;
      }

      current = (current as Record<string, unknown>)[part];
    }

    return (current === undefined ? defaultValue : current) as T;
  }

  /**
   * Met à jour une valeur dans l'état
   * @param path Chemin de la valeur à mettre à jour
   * @param value Nouvelle valeur
   * @param silent Si true, n'émet pas d'événement de changement
   */
  public setState(path: string, value: unknown, silent = false): void {
    const parts = path.split('.');
    const lastPart = parts.pop();

    if (!lastPart) {
      throw new Error('Invalid state path: ' + path);
    }

    let current = this.state;

    // Crée les objets intermédiaires si nécessaire
    for (const part of parts) {
      if (!(part in current) || current[part] === null || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    // Sauvegarde l'ancienne valeur pour l'historique
    const oldValue = current[lastPart];

    // Met à jour la valeur
    current[lastPart] = value;

    // Ajoute à l'historique
    this.stateHistory.push({
      timestamp: Date.now(),
      path,
      oldValue,
      newValue: value
    });

    // Limite la taille de l'historique
    if (this.stateHistory.length > this.maxHistoryDepth) {
      this.stateHistory.shift();
    }

    // Notifie les abonnés
    if (!silent) {
      this.notifySubscribers(path, value);
    }
  }

  /**
   * Met à jour plusieurs valeurs d'état à la fois
   * @param updates Paires de chemins et valeurs à mettre à jour
   * @param silent Si true, n'émet pas d'événements de changement
   */
  public updateState(updates: Record<string, unknown>, silent = false): void {
    for (const [path, value] of Object.entries(updates)) {
      this.setState(path, value, true); // Silencieux pour éviter les notifications multiples
    }

    // Une seule notification à la fin pour optimiser les performances
    if (!silent) {
      this.notifySubscribers('*', this.state);
    }
  }

  /**
   * S'abonne aux changements d'état à un chemin spécifique
   * @param path Chemin à surveiller
   * @param callback Fonction appelée lors des changements
   * @returns ID d'abonnement pour se désabonner
   */
  public subscribe(path: string, callback: (state: unknown) => void): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.subscribers.set(`${path}:${id}`, callback);
    return id;
  }

  /**
   * Se désabonne des changements d'état
   * @param id ID d'abonnement retourné par subscribe
   * @returns true si désabonné avec succès, false sinon
   */
  public unsubscribe(id: string): boolean {
    // Recherche l'abonnement par ID
    for (const key of this.subscribers.keys()) {
      if (key.endsWith(`:${id}`)) {
        return this.subscribers.delete(key);
      }
    }
    return false;
  }

  /**
   * Récupère une copie de l'état complet
   * @returns Copie de l'état
   */
  public getFullState(): Record<string, unknown> {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Récupère l'historique des changements d'état
   * @param limit Nombre maximum d'entrées à retourner
   * @returns Historique des changements
   */
  public getStateHistory(limit?: number): Array<{
    timestamp: number;
    path: string;
    oldValue: unknown;
    newValue: unknown;
  }> {
    const history = [...this.stateHistory];
    if (limit && limit > 0) {
      return history.slice(-limit);
    }
    return history;
  }

  /**
   * Restaure l'état à un point précédent dans l'historique
   * @param steps Nombre d'étapes à remonter dans l'historique
   * @returns true si restauré avec succès, false sinon
   */
  public rollbackState(steps: number): boolean {
    if (steps <= 0 || steps > this.stateHistory.length) {
      return false;
    }

    // Applique les changements dans l'ordre inverse
    for (let i = 0; i < steps; i++) {
      const change = this.stateHistory[this.stateHistory.length - 1 - i];
      this.setState(change.path, change.oldValue, true);
    }

    // Supprime les entrées d'historique utilisées
    this.stateHistory.splice(this.stateHistory.length - steps, steps);

    // Notifie de tous les changements
    this.notifySubscribers('*', this.state);

    return true;
  }

  /**
   * Notifie les abonnés des changements d'état
   * @param path Chemin qui a changé
   * @param value Nouvelle valeur
   */
  private notifySubscribers(path: string, value: unknown): void {
    // Notifie les abonnés exacts
    for (const [subPath, callback] of this.subscribers.entries()) {
      const actualPath = subPath.split(':')[0];

      // Notifie si c'est un abonnement global ou si le chemin correspond
      if (actualPath === '*' || path === actualPath || path.startsWith(`${actualPath}.`)) {
        // Pour les abonnements spécifiques, passe la partie pertinente de l'état
        if (actualPath !== '*' && actualPath !== path) {
          callback(this.getState(actualPath));
        } else {
          callback(value);
        }
      }
    }
  }
}