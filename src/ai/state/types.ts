// src/ai/state/types.ts
/**
 * @interface StateContext
 * @brief Contexte d'état du système
 * @details Structure de données pour le contexte d'état
 */
interface StateContext {
  /** 
   * @brief Identifiant du contexte
   */
  id?: string;

  /** 
   * @brief Métadonnées du contexte
   */
  metadata?: Record<string, unknown>;

  /** 
   * @brief Données spécifiques à l'état
   */
  data?: Record<string, unknown>;

  /** 
   * @brief Paramètres de configuration
   */
  config?: Record<string, unknown>;
}

/**
 * @interface AIState
 * @brief État global du système d'IA
 * @details Représente l'état complet du système à un instant T
 */
interface AIState {
  /** 
   * @brief État actuel du système
   * @details Identifie l'état dans lequel se trouve l'IA
   */
  currentState: string;

  /** 
   * @brief Contexte de l'état
   * @details Données supplémentaires liées à l'état actuel
   */
  context: StateContext;

  /** 
   * @brief Historique des transitions
   * @details Liste chronologique des changements d'état
   */
  history: StateTransition[];
}

/**
 * @interface StateTransition
 * @brief Transition entre deux états
 * @details Représente un changement d'état du système
 */
interface StateTransition {
  /** 
   * @brief État de départ
   * @details État avant la transition
   */
  from: string;

  /** 
   * @brief État d'arrivée
   * @details État après la transition
   */
  to: string;

  /** 
   * @brief Horodatage
   * @details Date et heure de la transition
   */
  timestamp: Date;

  /** 
   * @brief Déclencheur
   * @details Action ayant provoqué la transition
   */
  trigger: string;
}

// Utiliser 'export type' pour les réexportations de type avec isolatedModules activé
export type { AIState, StateTransition, StateContext };