/**
 * src/ai/api/distributed/aggregation/interfaces/IExtendedMetricsCollector.ts
 * 
 * Interface étendue pour la collecte de métriques, combinant les fonctionnalités
 * standards des collecteurs de métriques et des moniteurs de performance.
 */

/**
 * Charge utile d'événement métrique avec valeurs de type string uniquement
 */
export type MetricEventPayload = Record<string, string>;

/**
 * Interface étendue pour la collecte de métriques
 */
export interface IExtendedMetricsCollector {
    /**
     * Enregistre une valeur métrique
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param tags - Tags associés à la métrique (optionnel)
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Enregistre un événement métrique
     * 
     * @param name - Nom de l'événement
     * @param properties - Propriétés associées à l'événement (optionnel)
     */
    trackEvent(name: string, properties?: MetricEventPayload): void;

    /**
     * Enregistre une métrique comme un événement avec une valeur
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param properties - Propriétés associées à la métrique (optionnel)
     */
    trackMetric(name: string, value: number, properties?: Record<string, string>): void;

    /**
     * Démarre un timer pour mesurer une opération
     * 
     * @param name - Nom du timer
     * @returns Identifiant du timer (pour stopTimer)
     */
    startTimer?(name: string): string;

    /**
     * Arrête un timer et enregistre la durée
     * 
     * @param timerId - Identifiant du timer (retourné par startTimer)
     * @param properties - Propriétés associées au timer (optionnel)
     * @returns Durée en millisecondes
     */
    stopTimer?(timerId: string, properties?: Record<string, string>): number;

    /**
     * Incrémente un compteur
     * 
     * @param name - Nom du compteur
     * @param incrementBy - Valeur d'incrémentation (défaut: 1)
     */
    incrementCounter?(name: string, incrementBy?: number): void;

    /**
     * Enregistre une valeur avec des tags
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param tags - Tags associés à la métrique
     */
    recordValue?(name: string, value: number, tags?: Record<string, string>): void;
}