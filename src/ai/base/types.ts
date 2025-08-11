//src/ai/base/types.ts
//  * En-tête X-Frame-Options
/**
 * @interface IAState
 * @brief État d'une intelligence artificielle
 * @details Représente l'état actuel d'une IA dans le système
 */
export interface IAState {
  /** 
   * @brief Identifiant unique de l'IA 
   */
  id: string;

  /** 
   * @brief État actuel de l'IA
   * @details Peut être:
   * - idle: En attente
   * - active: En cours de traitement
   * - error: En état d'erreur
   */
  status: 'idle' | 'active' | 'error';

  /** 
   * @brief Type d'IA
   * @see IAType
   */
  type: IAType;
}

/**
 * @typedef {string} IAType
 * @brief Types d'IA disponibles
 * @details Définit les différents types d'IA:
 * - linguiste: IA spécialisée dans le traitement du langage
 * - avatar: IA dédiée à la gestion des avatars
 * - emotion: IA pour l'analyse des émotions
 */
export type IAType = 'linguiste' | 'avatar' | 'emotion';