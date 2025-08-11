// src/ai/state/actions.ts

/**
 * @enum AIActionType
 * @brief Types d'actions disponibles
 * @details Liste les différentes actions possibles dans le système
 */
export enum AIActionType {
  /** @brief Initialise une traduction */
  INIT_TRANSLATION = 'INIT_TRANSLATION',
  /** @brief Traite une entrée LSF */
  PROCESS_LSF = 'PROCESS_LSF',
  /** @brief Met à jour l'état émotionnel */
  UPDATE_EMOTION = 'UPDATE_EMOTION',
  /** @brief Met à jour l'expression */
  UPDATE_EXPRESSION = 'UPDATE_EXPRESSION',
  /** @brief Gère une erreur */
  HANDLE_ERROR = 'HANDLE_ERROR'
}

/**
 * @interface TranslationPayload
 * @brief Charge utile pour l'initialisation de la traduction
 */
export interface TranslationPayload {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * @interface LSFProcessPayload
 * @brief Charge utile pour le traitement LSF
 */
export interface LSFProcessPayload {
  signData: Record<string, unknown>;
  context?: string;
}

/**
 * @interface EmotionUpdatePayload
 * @brief Charge utile pour la mise à jour émotionnelle
 */
export interface EmotionUpdatePayload {
  emotion: string;
  intensity: number;
  context?: string;
}

/**
 * @interface ExpressionUpdatePayload
 * @brief Charge utile pour la mise à jour d'expression
 */
export interface ExpressionUpdatePayload {
  expressionType: string;
  details: Record<string, unknown>;
}

/**
 * @interface ErrorHandlingPayload
 * @brief Charge utile pour la gestion des erreurs
 */
export interface ErrorHandlingPayload {
  errorCode: string;
  errorMessage: string;
  context?: Record<string, unknown>;
}

/**
 * @interface AIAction
 * @brief Action pouvant être effectuée par l'IA
 * @details Définit la structure des actions du système
 */
export type AIAction = 
  | { type: AIActionType.INIT_TRANSLATION, payload: TranslationPayload }
  | { type: AIActionType.PROCESS_LSF, payload: LSFProcessPayload }
  | { type: AIActionType.UPDATE_EMOTION, payload: EmotionUpdatePayload }
  | { type: AIActionType.UPDATE_EXPRESSION, payload: ExpressionUpdatePayload }
  | { type: AIActionType.HANDLE_ERROR, payload: ErrorHandlingPayload };

/**
 * @brief Transitions d'état possibles
 * @details Définit les transitions autorisées entre les différents états du système
 */
export const stateTransitions = {
  /** @brief Transitions depuis l'état Linguistes */
  Linguistes: ['AvatarSourd', 'AvatarEntendant', 'Emotionnelles'],
  /** @brief Transitions depuis l'état AvatarSourd */
  AvatarSourd: ['SystemeExpressions'],
  /** @brief Transitions depuis l'état AvatarEntendant */
  AvatarEntendant: ['SystemeExpressions'],
  /** @brief Transitions depuis l'état SystemeExpressions */
  SystemeExpressions: ['Simulatrices', 'Spectatrices']
} as const;