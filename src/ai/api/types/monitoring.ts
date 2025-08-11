// src/ai/api/types/monitoring.ts

/**
 * Type sécurisé pour les paramètres d'action d'alerte
 * Définit les types de valeurs acceptables pour les paramètres
 */
export type AlertActionParameterValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | Record<string, unknown>
  | Date;

/**
 * Configuration pour la surveillance du système
 */
export interface MonitoringConfig {
  /** Indique si la surveillance est activée */
  enabled: boolean;
  /** Intervalle de collecte des métriques (en millisecondes) */
  interval: number;
  /** Liste des métriques à collecter */
  metrics: string[];
  /** Configurations des alertes */
  alerts: AlertConfig[];
}

/**
 * Configuration pour une alerte
 */
export interface AlertConfig {
  /** Nom unique de l'alerte */
  name: string;
  /** Condition de déclenchement de l'alerte */
  condition: AlertCondition;
  /** Actions à exécuter lorsque l'alerte est déclenchée */
  actions: AlertAction[];
  /** Période de refroidissement entre deux alertes (en millisecondes) */
  cooldown: number;
}

/**
 * Condition de déclenchement d'une alerte
 */
export interface AlertCondition {
  /** Métrique à surveiller */
  metric: string;
  /** Opérateur de comparaison */
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  /** Valeur seuil pour la comparaison */
  threshold: number;
  /** Durée pendant laquelle la condition doit être vérifiée (en millisecondes) */
  duration?: number;
}

/**
 * Action à exécuter lors du déclenchement d'une alerte
 */
export interface AlertAction {
  /** Type d'action (email, sms, webhook, etc.) */
  type: string;
  /** Cible de l'action (adresse email, numéro de téléphone, URL, etc.) */
  target: string;
  /** Paramètres spécifiques à l'action */
  parameters: Record<string, AlertActionParameterValue>;
}

/**
 * Résultat d'une vérification de santé
 */
export interface HealthCheck {
  /** Nom du composant vérifié */
  component: string;
  /** Statut de santé du composant */
  status: HealthStatus;
  /** Détails de la vérification */
  details: HealthDetails;
  /** Horodatage de la vérification */
  timestamp: number;
}

/**
 * Détails d'une vérification de santé
 */
export interface HealthDetails {
  /** Métriques collectées */
  metrics: Record<string, number>;
  /** Statut des dépendances */
  dependencies: Record<string, HealthStatus>;
  /** Message optionnel */
  message?: string;
}

/**
 * Statut de santé d'un composant
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';