/**
 * @interface Vote
 * @brief Structure d'un vote individuel
 * @details Définit le format standard d'un vote dans le système
 */
interface Vote {
  /** @brief Identifiant du membre votant */
  memberId: string;
  
  /** @brief Décision du vote */
  decision: 'approve' | 'reject' | 'abstain';
  
  /** @brief Poids du vote */
  weight: number;
  
  /** @brief Commentaires justificatifs */
  comments: string;
}

/**
 * @class VotingSystem
 * @brief Système de vote éthique
 * @details Gère la collecte et l'analyse des votes du comité
 */
class VotingSystem {
  /**
   * @brief Collecte les votes des membres
   * @param context Contexte de la décision
   * @returns Promise<Vote[]> Liste des votes collectés
   */
  async collectVotes(context: Context): Promise<Vote[]> {
    const votes = await Promise.all(
      this.members.map(member => member.validateDecision(context))
    );
    return this.calculateWeightedResult(votes);
  }

  /**
   * @brief Calcule le résultat pondéré des votes
   * @param votes Liste des votes à analyser
   * @returns VotingResult Résultat final du vote
   * @private
   */
  private calculateWeightedResult(votes: Vote[]): VotingResult {
    const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const approvalScore = votes.reduce((score, vote) => {
      return vote.decision === 'approve' ? score + vote.weight : score;
    }, 0) / totalWeight;

    return {
      approved: approvalScore > 0.66,
      score: approvalScore,
      votes
    };
  }
}