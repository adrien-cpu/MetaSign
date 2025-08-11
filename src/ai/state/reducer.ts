/**
 * @file reducer.ts
 * @brief Réducteur d'état pour le système IA
 * @details Gère les transitions d'état basées sur les actions
 */

/**
 * @function aiReducer
 * @brief Réduit l'état de l'IA selon l'action
 * @param state État actuel du système
 * @param action Action à traiter
 * @returns AIState Nouvel état après traitement
 */
export function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'LINGUISTIC_TRANSLATION':
      return handleLinguisticTranslation(state, action.payload);
    case 'EMOTION_UPDATE':
      return handleEmotionUpdate(state, action.payload);
    case 'EXPRESSION_CHANGE':
      return handleExpressionChange(state, action.payload);
    default:
      return state;
  }
}

/**
 * @function handleLinguisticTranslation
 * @brief Gère les traductions linguistiques
 * @param state État actuel
 * @param payload Données de traduction
 * @returns AIState Nouvel état
 * @private
 */
function handleLinguisticTranslation(state: AIState, payload: TranslationPayload): AIState {
  return {
    ...state,
    currentState: 'Linguistes',
    translationData: payload
  };
}

/**
 * @function handleEmotionUpdate
 * @brief Met à jour l'état émotionnel
 * @param state État actuel
 * @param payload Nouvelles émotions
 * @returns AIState Nouvel état
 * @private
 */
function handleEmotionUpdate(state: AIState, payload: EmotionPayload): AIState {
  return {
    ...state,
    emotionalState: payload
  };
}

/**
 * @function handleExpressionChange
 * @brief Gère les changements d'expression
 * @param state État actuel
 * @param payload Nouvelle expression
 * @returns AIState Nouvel état
 * @private
 */
function handleExpressionChange(state: AIState, payload: ExpressionPayload): AIState {
  return {
    ...state,
    expressionState: payload
  };
}