/**
 * @file IMetricsCollector.ts
 * @description
 * Interface pour les composants de collecte de métriques  
 * Utilisée pour suivre les performances du système et les événements
 * Centralise la logique de collecte des métriques
 * dans les systèmes distribués
 */

/**
 * Type de charge utile pour les événements de métriques
 */
export type MetricEventPayload = Record<string, string>;

/**
 * Interface pour les composants de collecte de métriques
 */
export interface IMetricsCollector {
    /**
     * Suivre un événement nommé avec des propriétés optionnelles
     * 
     * @param eventName Nom de l'événement à suivre
     * @param properties Propriétés optionnelles associées à l'événement
     */
    trackEvent(eventName: string, properties?: MetricEventPayload): void;

    /**
     * Suivre une valeur de métrique
     * 
     * @param metricName Nom de la métrique
     * @param value Valeur à enregistrer
     * @param tags Étiquettes optionnelles pour la catégorisation
     */
    trackMetric(metricName: string, value: number, tags?: Record<string, string>): void;

    /**
     * Démarrer le chronométrage d'une opération
     * 
     * @param operationName Nom de l'opération à chronométrer
     * @returns Identifiant unique pour l'opération chronométrée
     */
    startTimer(operationName: string): string;

    /**
     * Arrêter le chronométrage d'une opération et enregistrer la durée
     * 
     * @param timerId Identifiant du chronomètre retourné par startTimer
     * @param tags Étiquettes optionnelles à inclure avec les données de chronométrage
     */
    stopTimer(timerId: string, tags?: Record<string, string>): void;

    /**
     * Enregistre une métrique avec une valeur
     * Cette méthode est utilisée pour la compatibilité avec d'autres systèmes
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur de la métrique
     * @param tags - Tags optionnels pour la métrique
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}