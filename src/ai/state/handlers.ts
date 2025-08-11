/**
 * @namespace stateHandlers
 * @brief Gestionnaires d'états du système
 * @details Collection de fonctions pour gérer les transitions d'états
 */
export const stateHandlers = {
  /**
   * @brief Initialise une traduction
   * @param state État actuel
   * @param payload Données de traduction
   * @returns AIState Nouvel état
   */
  INIT_TRANSLATION: (state: AIState, payload: TranslationPayload): AIState => {
    return {
      ...state,
      currentState: 'Linguistes',
      context: {
        input: payload.text,
        sourceLanguage: payload.sourceLanguage,
        targetLanguage: payload.targetLanguage
      }
    };
  },

  /**
   * @brief Traite une entrée LSF
   * @param state État actuel
   * @param payload Données LSF
   * @returns AIState Nouvel état
   */
  PROCESS_LSF: (state: AIState, payload: LSFPayload): AIState => {
    const nextState = stateTransitions[state.currentState]
      .find(s => payload.targetType === 'deaf' ? s === 'AvatarSourd' : s === 'AvatarEntendant');

    return {
      ...state,
      currentState: nextState,
      context: {
        ...state.context,
        lsfData: payload.lsfData
      }
    };
  },

  /**
   * @brief Met à jour l'état émotionnel
   * @param state État actuel
   * @param payload Données émotionnelles
   * @returns AIState Nouvel état
   */
  UPDATE_EMOTION: (state: AIState, payload: EmotionPayload): AIState => {
    return {
      ...state,
      emotionalState: payload.emotion
    };
  },

  /**
   * @brief Met à jour les expressions
   * @param state État actuel
   * @param payload Données d'expressions
   * @returns AIState Nouvel état
   */
  UPDATE_EXPRESSION: (state: AIState, payload: ExpressionPayload): AIState => {
    return {
      ...state,
      currentState: 'SystemeExpressions',
      context: {
        ...state.context,
        expressions: payload.expressions
      }
    };
  }
};