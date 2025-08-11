// src/ai/judges/IJuge.ts
/**
 * @interface IJuge
 * @brief Interface pour les juges IA
 * @details Définit les méthodes requises pour évaluer et valider le comportement de l'IA
 */
interface IJuge {
  /**
   * @brief Évalue le réalisme de l'état de l'IA
   * @param state État actuel de l'IA
   * @returns Promise<EvaluationResult> Résultat de l'évaluation
   */
  evaluateRealism(state: AIState): Promise<EvaluationResult>;

  /**
   * @brief Valide un retour utilisateur
   * @param feedback Retour à valider
   * @returns Promise<ValidationResult> Résultat de la validation
   */
  validateFeedback(feedback: Feedback): Promise<ValidationResult>;

  /**
   * @brief Vérifie la conformité éthique
   * @param state État de l'IA à vérifier
   * @returns Promise<EthicsResult> Résultat de la vérification
   */
  checkEthics(state: AIState): Promise<EthicsResult>;
}