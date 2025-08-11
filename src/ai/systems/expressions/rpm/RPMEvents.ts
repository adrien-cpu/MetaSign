// src/ai/systems/expressions/rpm/RPMEvents.ts
/**
 * @enum RPMEvent
 * @brief Types d'événements RPM
 * @details Définit les différents types d'événements pouvant être émis par le système RPM
 */
enum RPMEvent {
  /** @brief Changement d'état du système RPM */
  STATE_CHANGE = 'state_change',

  /** @brief Erreur de synchronisation avec le serveur RPM */
  SYNC_ERROR = 'sync_error',

  /** @brief Avertissement de latence élevée */
  LATENCY_WARNING = 'latency_warning',

  /** @brief Perte de connexion avec le serveur RPM */
  CONNECTION_LOST = 'connection_lost',

  /** @brief Mise à jour des morphTargets */
  MORPH_UPDATE = 'morph_update',

  /** @brief Changement dans l'animation faciale */
  FACE_UPDATE = 'face_update'
}

/**
 * @interface StateChangeData
 * @brief Données pour l'événement de changement d'état
 */
interface StateChangeData {
  previousState: RPMState;
  currentState: RPMState;
  changedAt: number;
}

/**
 * @interface SyncErrorData
 * @brief Données pour l'événement d'erreur de synchronisation
 */
interface SyncErrorData {
  code: number;
  message: string;
  retryCount: number;
  lastSuccessfulSync?: number;
}

/**
 * @interface LatencyWarningData
 * @brief Données pour l'événement d'avertissement de latence
 */
interface LatencyWarningData {
  currentLatency: number;
  averageLatency: number;
  threshold: number;
  samples: number[];
}

/**
 * @interface ConnectionLostData
 * @brief Données pour l'événement de perte de connexion
 */
interface ConnectionLostData {
  lastConnected: number;
  attemptCount: number;
  reason: string;
}

/**
 * @interface MorphUpdateData
 * @brief Données pour l'événement de mise à jour des morphs
 */
interface MorphUpdateData {
  previous: Partial<RPMMorphTargets>;
  current: Partial<RPMMorphTargets>;
  duration: number;
}

/**
 * @interface FaceUpdateData
 * @brief Données pour l'événement de mise à jour faciale
 */
interface FaceUpdateData {
  expression: LSFExpression;
  timing: ExpressionTiming;
}

/**
 * @type EventDataMap
 * @brief Mapping entre les types d'événements et leurs données
 */
type EventDataMap = {
  [RPMEvent.STATE_CHANGE]: StateChangeData;
  [RPMEvent.SYNC_ERROR]: SyncErrorData;
  [RPMEvent.LATENCY_WARNING]: LatencyWarningData;
  [RPMEvent.CONNECTION_LOST]: ConnectionLostData;
  [RPMEvent.MORPH_UPDATE]: MorphUpdateData;
  [RPMEvent.FACE_UPDATE]: FaceUpdateData;
}

/**
 * @interface RPMEventPayload<T extends RPMEvent>
 * @brief Structure générique des données d'événements
 * @details Définit le format des données pour chaque type d'événement
 */
interface RPMEventPayload<T extends RPMEvent> {
  /** @brief Horodatage de l'événement */
  timestamp: number;

  /** @brief Type d'événement */
  type: T;

  /** @brief Données spécifiques à l'événement */
  data: EventDataMap[T];
}

// Export des types et interfaces
export {
  RPMEvent,
  RPMEventPayload,
  EventDataMap,
  StateChangeData,
  SyncErrorData,
  LatencyWarningData,
  ConnectionLostData,
  MorphUpdateData,
  FaceUpdateData
};