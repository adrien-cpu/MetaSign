/**
 * Type pour représenter la structure des transitions d'état autorisées
 */
type StateTransitions = Record<string, string[]>;

/**
 * Interface pour le contexte de transition d'état
 */
interface StateTransitionContext {
  lsfData?: unknown;
  emotion?: unknown;
  expressions?: unknown;
  [key: string]: unknown;
}

/**
 * Définition des transitions d'état autorisées
 */
const stateTransitions: StateTransitions = {
  'ValidationInitiale': ['SystemeControleEthique'],
  'SystemeControleEthique': ['Linguistes'],
  'Linguistes': ['AvatarSourd', 'AvatarEntendant', 'Emotionnelles'],
  // Ajoutez ici d'autres transitions selon votre diagramme d'état
};

/**
 * @class StateValidator
 * @brief Validateur des transitions d'état
 * @details Vérifie la validité des transitions entre les différents états du système
 */
class StateValidator {
  /**
   * @brief Valide une transition d'état
   * @param from État de départ
   * @param to État d'arrivée
   * @param context Contexte de la transition
   * @returns boolean True si la transition est valide
   */
  validateTransition(from: string, to: string, context: StateTransitionContext): boolean {
    // Vérifie si la transition est permise
    if (!stateTransitions[from]?.includes(to)) return false;

    // Vérifie les préconditions
    return this.checkPreconditions(from, to, context);
  }

  /**
   * @brief Vérifie les préconditions d'une transition
   * @param from État de départ
   * @param to État d'arrivée
   * @param context Contexte à valider
   * @returns boolean True si les préconditions sont remplies
   * @private
   */
  private checkPreconditions(from: string, to: string, context: StateTransitionContext): boolean {
    switch (to) {
      case 'AvatarSourd':
        return !!context.lsfData;
      case 'SystemeExpressions':
        return !!context.emotion && !!context.expressions;
      default:
        return true;
    }
  }
}

// Exporter la classe
export { StateValidator };

// Exporter les types avec la syntaxe "export type" pour isolatedModules
export type { StateTransitionContext, StateTransitions };