/**
 * src/ai/api/distributed/aggregation/metrics/MetricsRecorder.ts
 * 
 * Enregistreur de métriques pour suivre les performances du processus d'agrégation.
 */

/**
 * Interface pour le collecteur de métriques étendu
 */
interface IExtendedMetricsCollector {
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}

/**
 * Enregistreur de métriques pour le processus d'agrégation
 * 
 * Cette classe encapsule toutes les opérations d'enregistrement de métriques
 * pour suivre les performances du processus d'agrégation.
 */
export class MetricsRecorder {
    private readonly metricsCollector?: IExtendedMetricsCollector;

    /**
     * Crée un nouvel enregistreur de métriques
     * 
     * @param metricsCollector - Collecteur de métriques optionnel
     */
    constructor(metricsCollector?: IExtendedMetricsCollector) {
        this.metricsCollector = metricsCollector;
    }

    /**
     * Enregistre une métrique si le collecteur est disponible
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur de la métrique
     * @param tags - Tags optionnels pour la métrique
     */
    public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
        if (this.metricsCollector) {
            this.metricsCollector.recordMetric(name, value, tags);
        }
    }

    /**
     * Enregistre un succès de cache (cache hit)
     * 
     * @param startTime - Temps de début pour calculer la durée
     * @param tags - Tags optionnels pour la métrique
     */
    public recordCacheHit(startTime: number, tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.cache_hit', 1, tags);
        this.recordMetric('model_aggregation.duration_ms', Date.now() - startTime, tags);
    }

    /**
     * Enregistre un échec de cache (cache miss)
     * 
     * @param tags - Tags optionnels pour la métrique
     */
    public recordCacheMiss(tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.cache_miss', 1, tags);
    }

    /**
     * Enregistre le temps de calcul des poids
     * 
     * @param durationMs - Durée du calcul en millisecondes
     * @param tags - Tags optionnels pour la métrique
     */
    public recordWeightCalculation(durationMs: number, tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.weight_calculation_ms', durationMs, tags);
    }

    /**
     * Enregistre le temps de calcul du consensus
     * 
     * @param durationMs - Durée du calcul en millisecondes
     * @param tags - Tags optionnels pour la métrique
     */
    public recordConsensusTime(durationMs: number, tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.consensus_ms', durationMs, tags);
    }

    /**
     * Enregistre un stockage dans le cache
     * 
     * @param tags - Tags optionnels pour la métrique
     */
    public recordCacheStore(tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.cache_store', 1, tags);
    }

    /**
     * Enregistre une erreur d'agrégation
     * 
     * @param tags - Tags optionnels pour la métrique
     */
    public recordError(tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.error', 1, tags);
    }

    /**
     * Enregistre la fin d'une agrégation complète
     * 
     * @param startTime - Temps de début pour calculer la durée
     * @param tags - Tags optionnels pour la métrique
     */
    public recordAggregationComplete(startTime: number, tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.duration_ms', Date.now() - startTime, tags);
    }

    /**
     * Enregistre un effacement du cache
     * 
     * @param cacheSize - Taille du cache avant effacement
     * @param tags - Tags optionnels pour la métrique
     */
    public recordCacheClear(cacheSize: number, tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.cache_clear', cacheSize, tags);
    }

    /**
     * Enregistre un préchargement du cache
     * 
     * @param loadedCount - Nombre d'entrées chargées
     * @param tags - Tags optionnels pour la métrique
     */
    public recordCachePreload(loadedCount: number, tags?: Record<string, string>): void {
        this.recordMetric('model_aggregation.cache_preload', loadedCount, tags);
    }
}