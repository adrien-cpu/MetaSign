/**
 * Interface de base pour tous les composants IA du système LSF
 * Définit le contrat minimum que tous les systèmes IA doivent implémenter
 */

import { SystemState } from "@ai/coordinators/types";

export abstract class BaseAI {
  /**
   * État actuel du système
   */
  protected state: SystemState = SystemState.UNKNOWN;

  /**
   * Statistiques de performance
   */
  protected stats: Record<string, number> = {};

  /**
   * Initialise le composant IA
   * @returns Promise qui se résout lorsque l'initialisation est terminée
   */
  public async initialize(): Promise<void> {
    this.state = SystemState.INITIALIZING;

    try {
      await this.internalInitialize();
      this.state = SystemState.ACTIVE;
    } catch (error) {
      this.state = SystemState.ERROR;
      throw error;
    }
  }

  /**
   * Méthode d'initialisation interne à implémenter par les sous-classes
   */
  protected abstract internalInitialize(): Promise<void>;

  /**
   * Arrête le composant IA
   */
  public async shutdown(): Promise<void> {
    try {
      await this.internalShutdown();
      this.state = SystemState.INACTIVE;
    } catch (error) {
      this.state = SystemState.ERROR;
      throw error;
    }
  }

  /**
   * Méthode d'arrêt interne à implémenter par les sous-classes
   */
  protected abstract internalShutdown(): Promise<void>;

  /**
   * Récupère l'état actuel du composant
   */
  public getState(): SystemState {
    return this.state;
  }

  /**
   * Récupère les métriques de performance du composant
   */
  public getPerformanceMetrics(): Record<string, number> {
    return { ...this.stats };
  }

  /**
   * Capture les statistiques de performance actuelles
   * @param name Nom de la statistique
   * @param value Valeur de la statistique
   */
  protected updateStat(name: string, value: number): void {
    this.stats[name] = value;
  }

  /**
   * Vérifie si le composant est actif
   */
  public isActive(): boolean {
    return this.state === SystemState.ACTIVE;
  }

  /**
   * Vérifie si le composant peut traiter une demande spécifique
   * @param _requestType Type de demande
   * @param _payload Données de la demande
   */
  public canHandle(_requestType: string, _payload: Record<string, unknown>): boolean {
    return false;
  }
}