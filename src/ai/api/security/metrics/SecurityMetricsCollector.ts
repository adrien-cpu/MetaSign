// src/ai/api/security/metrics/SecurityMetricsCollector.ts

export interface MetricsConfig {
    enabled: boolean;
    storageRetentionDays: number;
    aggregationInterval: number;
    alertingThresholds: Record<string, number>;
}

export interface SecurityMetric {
    name: string;
    value: number;
    timestamp: Date;
    dimensions?: Record<string, string>;
    metadata?: Record<string, unknown>;
}

export interface RecoveryMetric {
    timestamp: Date;
    planId: string;
    step: string;
    status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

/**
 * Collecteur de métriques de sécurité pour la surveillance et l'analyse
 */
export class SecurityMetricsCollector {
    private metrics: SecurityMetric[] = [];
    private readonly config: MetricsConfig;
    private aggregationTimeout?: NodeJS.Timeout;

    constructor(config?: Partial<MetricsConfig>) {
        // Configuration par défaut
        this.config = {
            enabled: true,
            storageRetentionDays: 90,
            aggregationInterval: 60000, // 1 minute
            alertingThresholds: {
                authFailures: 5,
                suspiciousActivities: 3,
                backupFailures: 1,
                recoveryErrors: 0
            },
            ...config
        };

        this.startAggregation();
    }

    /**
     * Enregistre une métrique de sécurité
     * @param metric La métrique à enregistrer
     */
    recordMetric(metric: Omit<SecurityMetric, 'timestamp'>): void {
        if (!this.config.enabled) return;

        const fullMetric: SecurityMetric = {
            ...metric,
            timestamp: new Date()
        };

        this.metrics.push(fullMetric);

        // Vérifier les seuils d'alerte
        this.checkAlertThresholds(fullMetric);
    }

    /**
     * Enregistre une métrique d'authentification
     * @param success Indique si l'authentification a réussi
     * @param details Détails supplémentaires
     */
    recordAuthMetric(
        success: boolean,
        details?: { userId?: string; ipAddress?: string; method?: string }
    ): void {
        this.recordMetric({
            name: success ? 'auth.success' : 'auth.failure',
            value: 1,
            dimensions: {
                userId: details?.userId || 'unknown',
                ipAddress: details?.ipAddress || 'unknown',
                method: details?.method || 'unknown'
            }
        });
    }

    /**
     * Enregistre une métrique d'accès aux données
     * @param resource La ressource accédée
     * @param operation Le type d'opération
     * @param details Détails supplémentaires
     */
    recordDataAccessMetric(
        resource: string,
        operation: 'read' | 'write' | 'delete',
        details?: { userId?: string; successful?: boolean }
    ): void {
        this.recordMetric({
            name: 'data.access',
            value: 1,
            dimensions: {
                resource,
                operation,
                userId: details?.userId || 'unknown',
                successful: String(details?.successful !== false)
            }
        });
    }

    /**
     * Enregistre une métrique de sauvegarde
     * @param success Indique si la sauvegarde a réussi
     * @param details Détails supplémentaires
     */
    recordBackupMetric(
        success: boolean,
        details?: { configId?: string; size?: number; duration?: number }
    ): void {
        this.recordMetric({
            name: success ? 'backup.success' : 'backup.failure',
            value: 1,
            dimensions: {
                configId: details?.configId || 'unknown',
                size: details?.size?.toString() || 'unknown',
                duration: details?.duration?.toString() || 'unknown'
            }
        });
    }

    /**
     * Enregistre une métrique de récupération
     * @param metric Informations sur la métrique de récupération
     */
    recordRecoveryMetric(metric: RecoveryMetric): void {
        this.recordMetric({
            name: `recovery.${metric.status.toLowerCase()}`,
            value: 1,
            dimensions: {
                planId: metric.planId,
                step: metric.step,
                status: metric.status
            },
            metadata: {
                timestamp: metric.timestamp
            }
        });
    }

    /**
     * Récupère des métriques filtrées
     * @param filter Critères de filtrage 
     * @returns Métriques correspondantes
     */
    getMetrics(filter?: {
        name?: string;
        startTime?: Date;
        endTime?: Date;
        dimensions?: Record<string, string>;
    }): SecurityMetric[] {
        if (!filter) return [...this.metrics];

        return this.metrics.filter(metric => {
            // Filtre par nom
            if (filter.name && metric.name !== filter.name) {
                return false;
            }

            // Filtre par plage de temps
            if (filter.startTime && metric.timestamp < filter.startTime) {
                return false;
            }
            if (filter.endTime && metric.timestamp > filter.endTime) {
                return false;
            }

            // Filtre par dimensions
            if (filter.dimensions) {
                for (const [key, value] of Object.entries(filter.dimensions)) {
                    if (metric.dimensions?.[key] !== value) {
                        return false;
                    }
                }
            }

            return true;
        });
    }

    /**
     * Récupère des statistiques agrégées pour une métrique
     * @param name Nom de la métrique
     * @param timespan Période en minutes (par défaut 60)
     * @returns Statistiques agrégées
     */
    getAggregatedStats(
        name: string,
        timespan: number = 60
    ): {
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
    } {
        const cutoffTime = new Date(Date.now() - timespan * 60 * 1000);
        const relevantMetrics = this.getMetrics({
            name,
            startTime: cutoffTime
        });

        if (relevantMetrics.length === 0) {
            return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
        }

        const values = relevantMetrics.map(m => m.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
            count: relevantMetrics.length,
            sum,
            avg: sum / relevantMetrics.length,
            min,
            max
        };
    }

    /**
     * Démarre l'agrégation périodique des métriques
     */
    private startAggregation(): void {
        if (!this.config.enabled || this.aggregationTimeout) return;

        this.aggregationTimeout = setInterval(() => {
            this.aggregateMetrics();
            this.pruneOldMetrics();
        }, this.config.aggregationInterval);
    }

    /**
     * Arrête l'agrégation périodique des métriques
     */
    stopAggregation(): void {
        if (this.aggregationTimeout) {
            clearInterval(this.aggregationTimeout);
            this.aggregationTimeout = undefined;
        }
    }

    /**
     * Agrège les métriques pour réduire le volume de données stockées
     */
    private aggregateMetrics(): void {
        // Implémenter la logique d'agrégation
        // Par exemple, regrouper les métriques similaires sur des intervalles de temps
        console.log(`Aggregating ${this.metrics.length} metrics...`);
    }

    /**
     * Supprime les métriques plus anciennes que la période de rétention
     */
    private pruneOldMetrics(): void {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.storageRetentionDays);

        const initialCount = this.metrics.length;
        this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffDate);

        const prunedCount = initialCount - this.metrics.length;
        if (prunedCount > 0) {
            console.log(`Pruned ${prunedCount} old metrics`);
        }
    }

    /**
     * Vérifie si une métrique dépasse un seuil d'alerte
     * @param metric La métrique à vérifier
     */
    private checkAlertThresholds(metric: SecurityMetric): void {
        if (metric.name === 'auth.failure') {
            const threshold = this.config.alertingThresholds.authFailures;
            if (threshold !== undefined) {
                const stats = this.getAggregatedStats('auth.failure', 5); // 5 minutes
                if (stats.count >= threshold) {
                    this.triggerAlert('auth_failure_threshold', {
                        count: stats.count,
                        threshold,
                        timespan: 5
                    });
                }
            }
        }

        // Vérifications similaires pour d'autres métriques
    }

    /**
     * Déclenche une alerte en cas de dépassement de seuil
     * @param alertType Type d'alerte
     * @param data Données associées à l'alerte
     */
    private triggerAlert(alertType: string, data: Record<string, unknown>): void {
        console.warn(`SECURITY ALERT [${alertType}]:`, data);
        // Dans une implémentation réelle, envoyer à un système d'alerte externe
    }
}