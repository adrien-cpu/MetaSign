/**
 * @class JugeManager
 * @implements IJuge
 * @brief Gestionnaire des juges IA
 * @details Coordonne l'évaluation du réalisme et de l'éthique de l'IA
 */
class JugeManager implements IJuge {
  /** 
   * @brief Vérificateur d'éthique
   * @private 
   */
  private ethicsChecker: EthicsChecker;

  /** 
   * @brief Évaluateur de réalisme
   * @private 
   */
  private realismEvaluator: RealismEvaluator;

  /**
   * @brief Évalue le réalisme de l'état de l'IA
   * @param state État à évaluer
   * @returns Promise<EvaluationResult> Résultat de l'évaluation
   */
  async evaluateRealism(state: AIState): Promise<EvaluationResult> {
    const score = await this.realismEvaluator.evaluate(state);
    if (score < 0.7) {
      await this.reportIssue(state, 'low_realism');
    }
    return { score, issues: [] };
  }

  /**
   * @brief Valide un retour utilisateur
   * @param feedback Retour à valider
   * @returns Promise<ValidationResult> Résultat de la validation
   */
  async validateFeedback(feedback: Feedback): Promise<ValidationResult> {
    const ethicsResult = await this.ethicsChecker.validate(feedback);
    return {
      isValid: ethicsResult.valid,
      suggestions: ethicsResult.suggestions
    };
  }

  /**
   * @brief Vérifie la conformité éthique
   * @param state État de l'IA à vérifier
   * @returns Promise<EthicsResult> Résultat de la vérification
   */
  async checkEthics(state: AIState): Promise<EthicsResult> {
    return this.ethicsChecker.check(state);
  }
}