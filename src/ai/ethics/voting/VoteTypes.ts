/**
 * @enum VoteType
 * @brief Types de votes possibles
 * @details Définit les différentes catégories de votes dans le système éthique
 */
enum VoteType {
  /** @brief Vote sur la pertinence culturelle */
  CULTURAL_APPROPRIATENESS = 'CULTURAL',
  
  /** @brief Vote sur l'accessibilité */
  ACCESSIBILITY = 'ACCESSIBILITY',
  
  /** @brief Vote sur les droits humains */
  HUMAN_RIGHTS = 'HUMAN_RIGHTS',
  
  /** @brief Vote sur la confidentialité */
  PRIVACY = 'PRIVACY',
  
  /** @brief Vote sur l'aspect technique */
  TECHNICAL = 'TECHNICAL'
}

/**
 * @interface VoteDetails
 * @brief Détails d'un vote
 * @details Structure contenant les informations détaillées d'un type de vote
 */
interface VoteDetails {
  /** 
   * @brief Type de vote
   * @see VoteType 
   */
  type: VoteType;

  /** 
   * @brief Niveau de priorité du vote
   * @details Plus la valeur est élevée, plus le vote est prioritaire
   */
  priority: number;

  /** 
   * @brief Liste des exigences
   * @details Critères à remplir pour ce type de vote
   */
  requirements: string[];
}

export { VoteType, VoteDetails };