/**
 * src/ai/api/distributed/monitoring/interfaces/IPerformanceMonitor.ts
 * Interface pour le moniteur de performance
 */

/**
 * Interface définissant les fonctionnalités d'un moniteur de performance
 * pour surveiller et enregistrer les métriques de performance
 * dans un environnement distribué
 */
export interface IPerformanceMonitor {
    /**
     * Enregistre une métrique de performance
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param tags - Tags associés à la métrique (optionnel)
     */
    recordPerformance(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Enregistre un message de journal lié à la performance
     * 
     * @param message - Message à journaliser
     * @param level - Niveau de log (info, warn, error, debug)
     */
    logPerformance(message: string, level?: 'info' | 'warn' | 'error' | 'debug'): void;

    /**
     * Démarre le suivi d'une opération
     * 
     * @param operationName - Nom de l'opération
     * @returns ID pour identifier l'opération
     */
    startOperation(operationName: string): string;

    /**
     * Termine le suivi d'une opération et enregistre sa durée
     * 
     * @param operationId - ID de l'opération (retourné par startOperation)
     * @param success - Indique si l'opération a réussi
     * @param additionalData - Données additionnelles à enregistrer
     * @returns Durée de l'opération en millisecondes
     */
    endOperation(
        operationId: string,
        success: boolean,
        additionalData?: Record<string, unknown>
    ): number;

    /**
     * Vérifie si la performance est dans les limites acceptables
     * 
     * @param metricName - Nom de la métrique à vérifier
     * @param thresholdName - Nom du seuil à vérifier
     * @returns True si la performance est acceptable, false sinon
     */
    isPerformanceAcceptable(metricName: string, thresholdName: string): boolean;

    /**
     * Récupère les statistiques de performance pour une métrique
     * 
     * @param metricName - Nom de la métrique
     * @param timeWindowMs - Fenêtre de temps en ms (optionnel)
     * @returns Statistiques (min, max, avg, p95, etc.)
     */
    getPerformanceStats(
        metricName: string,
        timeWindowMs?: number
    ): Promise<Record<string, number>>;
}