/**
 * Gestion et agrégation des métriques de monitoring
 */
import { HealthCheckResult } from '@monitoring/health/types/health.types';
import { MetricEntry, MetricsStore } from '../types/health-metrics.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Classe responsable de la gestion et de l'agrégation des métriques
 */
export class MetricsAggregator {
    private readonly aggregatedMetrics: MetricsStore = new Map();
    private readonly retentionHours: number;
    private readonly aggregationIntervalMinutes: number;
    private readonly logger = new Logger('MetricsAggregator');

    /**
     * Constructeur
     * @param retentionHours Durée de rétention des métriques en heures
     * @param aggregationIntervalMinutes Intervalle d'agrégation en minutes
     */
    constructor(
        retentionHours: number,
        aggregationIntervalMinutes: number
    ) {
        this.retentionHours = retentionHours;
        this.aggregationIntervalMinutes = aggregationIntervalMinutes;
    }

    /**
     * Traite une métrique provenant d'une vérification de santé
     * @param result Résultat de la vérification de santé
     */
    public processMetric(result: HealthCheckResult): void {
        // Créer une entrée pour chaque métrique si elle n'existe pas déjà
        const metricName = `health_check.${result.name}`;
        if (!this.aggregatedMetrics.has(metricName)) {
            this.aggregatedMetrics.set(metricName, []);
        }

        // Ajouter les données de base (status comme valeur numérique)
        const statusValue = result.status === 'healthy' ? 2 : (result.status === 'degraded' ? 1 : 0);
        const timestamp = typeof result.timestamp === 'string'
            ? new Date(result.timestamp).getTime()
            : result.timestamp;

        const metrics = this.aggregatedMetrics.get(metricName)!;
        metrics.push({
            timestamp,
            value: statusValue
        });

        // Appliquer la rétention
        this.applyRetentionPolicy(metricName);

        // Traiter les métriques spécifiques contenues dans les détails
        if (result.details) {
            this.processDetailMetrics(metricName, result.details, timestamp);
        }
    }

    /**
     * Traite les métriques détaillées
     * @param baseMetricName Nom de la métrique de base
     * @param details Détails contenant des métriques supplémentaires
     * @param timestamp Horodatage de la mesure
     */
    private processDetailMetrics(
        baseMetricName: string,
        details: Record<string, unknown>,
        timestamp: number
    ): void {
        for (const [key, value] of Object.entries(details)) {
            if (typeof value === 'number') {
                const detailMetricName = `${baseMetricName}.${key}`;

                if (!this.aggregatedMetrics.has(detailMetricName)) {
                    this.aggregatedMetrics.set(detailMetricName, []);
                }

                const detailMetrics = this.aggregatedMetrics.get(detailMetricName)!;
                detailMetrics.push({
                    timestamp,
                    value
                });

                // Appliquer également la rétention
                this.applyRetentionPolicy(detailMetricName);
            }
        }
    }

    /**
     * Applique la politique de rétention à une métrique spécifique
     * @param metricName Nom de la métrique
     */
    private applyRetentionPolicy(metricName: string): void {
        const retentionMs = this.retentionHours * 3600 * 1000;
        const oldestAllowed = Date.now() - retentionMs;

        const metrics = this.aggregatedMetrics.get(metricName);
        if (!metrics) return;

        const filteredMetrics = metrics.filter(m => m.timestamp >= oldestAllowed);
        this.aggregatedMetrics.set(metricName, filteredMetrics);
    }

    /**
     * Agrège les métriques pour réduire leur volume
     */
    public aggregateMetrics(): void {
        const now = Date.now();
        const aggregationWindowMs = this.aggregationIntervalMinutes * 60 * 1000;

        // Pour chaque type de métrique
        for (const [metricName, metrics] of this.aggregatedMetrics.entries()) {
            if (metrics.length <= 1) {
                continue; // Pas besoin d'agréger
            }

            const aggregatedData: Array<MetricEntry> = [];
            const buckets = new Map<number, Array<MetricEntry>>();

            // Grouper par fenêtre de temps
            for (const metric of metrics) {
                const bucketTimestamp = Math.floor(metric.timestamp / aggregationWindowMs) * aggregationWindowMs;

                if (!buckets.has(bucketTimestamp)) {
                    buckets.set(bucketTimestamp, []);
                }

                buckets.get(bucketTimestamp)?.push(metric);
            }

            // Calculer la moyenne pour chaque bucket
            for (const [bucketTimestamp, bucketMetrics] of buckets.entries()) {
                if (bucketMetrics.length === 0) continue;

                const sum = bucketMetrics.reduce((acc, m) => acc + m.value, 0);
                const avg = sum / bucketMetrics.length;

                aggregatedData.push({
                    timestamp: bucketTimestamp,
                    value: avg
                });
            }

            // Remplacer les données originales par les données agrégées
            this.aggregatedMetrics.set(metricName, aggregatedData);
        }

        this.logger.debug(`Agrégation de métriques terminée: ${this.aggregatedMetrics.size} métriques traitées`);
    }

    /**
     * Récupère les métriques agrégées
     * @returns Métriques agrégées par nom
     */
    public getMetrics(): Record<string, Array<MetricEntry>> {
        return Object.fromEntries(this.aggregatedMetrics);
    }

    /**
     * Récupère une métrique spécifique
     * @param metricName Nom de la métrique à récupérer
     * @returns Tableau de points de la métrique, ou undefined si non trouvée
     */
    public getMetric(metricName: string): Array<MetricEntry> | undefined {
        return this.aggregatedMetrics.get(metricName);
    }

    /**
     * Efface toutes les métriques
     */
    public clearAllMetrics(): void {
        this.aggregatedMetrics.clear();
        this.logger.info('Toutes les métriques ont été effacées');
    }
}