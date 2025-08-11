import { Logger } from '@ai/utils/Logger';
import {
    PerformanceDataPoint,
    PerformanceMetrics,
    SystemResource,
    AlertListener,
    ResourceStats,
    SystemHealthInfo,
    MetricsExport,
    MetricsImportOptions
} from '@ai/types/metrics';

/**
 * Système de monitoring des performances avec capacités d'analyse
 * 
 * Cette classe utilise le pattern Singleton pour garantir une instance unique
 * et fournit des fonctionnalités pour la collecte, l'analyse et le monitoring
 * des métriques de performance.
 */
export class PerformanceMonitoringSystem {
    private static instance: PerformanceMonitoringSystem;
    private logger = new Logger('PerformanceMonitoringSystem');

    // Stockage des métriques
    private metricsHistory: Map<string, PerformanceDataPoint[]>;

    // Utilisation des ressources système
    private resourceUsage: Map<SystemResource, number[]>;

    // Seuils d'alerte pour les métriques
    private thresholds: Map<string, number>;

    // Écouteurs d'alertes par catégorie
    private alertListeners: Map<string, AlertListener[]>;

    // Timestamps des dernières mesures
    private lastMeasurementTimestamp: Map<string, number>;

    /**
     * Constructeur privé (Singleton)
     */
    private constructor() {
        this.metricsHistory = new Map();
        this.resourceUsage = new Map();
        this.thresholds = new Map();
        this.alertListeners = new Map();
        this.lastMeasurementTimestamp = new Map();

        // Initialiser les ressources système suivies
        this.resourceUsage.set('cpu', []);
        this.resourceUsage.set('memory', []);
        this.resourceUsage.set('network', []);
        this.resourceUsage.set('storage', []);

        // Définir des seuils par défaut
        this.thresholds.set('cpu', 80); // 80% d'utilisation CPU
        this.thresholds.set('memory', 85); // 85% d'utilisation mémoire
        this.thresholds.set('responseTime', 500); // 500ms de temps de réponse

        this.logger.info('Performance Monitoring System initialized');
    }

    /**
     * Obtient l'instance unique du système de monitoring
     */
    public static getInstance(): PerformanceMonitoringSystem {
        if (!PerformanceMonitoringSystem.instance) {
            PerformanceMonitoringSystem.instance = new PerformanceMonitoringSystem();
        }
        return PerformanceMonitoringSystem.instance;
    }

    /**
     * Enregistre une métrique de performance
     * @param category Catégorie de la métrique
     * @param name Nom de la métrique
     * @param value Valeur mesurée
     * @param tags Tags additionnels
     */
    public recordMetric(
        category: string,
        name: string,
        value: number,
        tags: Record<string, unknown> = {}
    ): void {
        const metricKey = `${category}.${name}`;
        const timestamp = Date.now();

        // Enregistrer le timestamp de la dernière mesure
        this.lastMeasurementTimestamp.set(metricKey, timestamp);

        // Convertir les tags en chaînes
        const stringTags: Record<string, string> = {};
        for (const [key, val] of Object.entries(tags)) {
            stringTags[key] = String(val);
        }

        // Créer le point de données
        const dataPoint: PerformanceDataPoint = {
            timestamp,
            value,
            tags: stringTags
        };

        // Ajouter à l'historique
        if (!this.metricsHistory.has(metricKey)) {
            this.metricsHistory.set(metricKey, []);
            this.logger.debug(`Created new metric series: ${metricKey}`);
        }

        const history = this.metricsHistory.get(metricKey)!;
        history.push(dataPoint);

        // Limiter la taille de l'historique
        if (history.length > 1000) {
            history.shift();
        }

        // Vérifier les seuils
        this.checkThresholds(metricKey, value);

        this.logger.debug(`Recorded metric: ${metricKey}=${value}`, { tags: stringTags });
    }

    /**
     * Enregistre l'utilisation d'une ressource système
     * @param resource Type de ressource
     * @param value Valeur d'utilisation
     */
    public recordResourceUsage(resource: SystemResource, value: number): void {
        if (!this.resourceUsage.has(resource)) {
            this.resourceUsage.set(resource, []);
            this.logger.debug(`Created new resource usage tracker: ${resource}`);
        }

        const history = this.resourceUsage.get(resource)!;
        history.push(value);

        // Limiter la taille de l'historique
        if (history.length > 1000) {
            history.shift();
        }

        // Vérifier les seuils
        this.checkThresholds(resource, value);

        this.logger.debug(`Recorded resource usage: ${resource}=${value}`);

        // Également enregistrer comme métrique standard pour cohérence
        this.recordMetric('resource', resource, value);
    }

    /**
     * Définit un seuil d'alerte pour une métrique
     * @param metricKey Clé de la métrique
     * @param threshold Valeur seuil
     */
    public setThreshold(metricKey: string, threshold: number): void {
        this.thresholds.set(metricKey, threshold);
        this.logger.info(`Set threshold for ${metricKey}: ${threshold}`);
    }

    /**
     * Ajoute un écouteur pour les alertes de dépassement de seuil
     * @param category Catégorie d'alertes à écouter
     * @param listener Fonction de callback
     */
    public addAlertListener(
        category: string,
        listener: AlertListener
    ): void {
        if (!this.alertListeners.has(category)) {
            this.alertListeners.set(category, []);
        }

        this.alertListeners.get(category)!.push(listener);
        this.logger.info(`Added alert listener for category: ${category}`);
    }

    /**
     * Supprime un écouteur d'alerte
     * @param category Catégorie d'alertes
     * @param listener Fonction de callback à supprimer
     * @returns true si l'écouteur a été trouvé et supprimé
     */
    public removeAlertListener(category: string, listener: AlertListener): boolean {
        if (!this.alertListeners.has(category)) {
            return false;
        }

        const listeners = this.alertListeners.get(category)!;
        const initialCount = listeners.length;

        // Filtrer l'écouteur spécifique (par référence)
        const filteredListeners = listeners.filter(l => l !== listener);
        this.alertListeners.set(category, filteredListeners);

        const removed = filteredListeners.length < initialCount;
        if (removed) {
            this.logger.info(`Removed alert listener from category: ${category}`);
        }

        return removed;
    }

    /**
     * Vérifie si une métrique dépasse son seuil
     * @param metricKey Clé de la métrique
     * @param value Valeur actuelle
     */
    private checkThresholds(metricKey: string, value: number): void {
        if (this.thresholds.has(metricKey)) {
            const threshold = this.thresholds.get(metricKey)!;

            if (value > threshold) {
                // Déclencher les alertes
                this.triggerAlerts(metricKey, value, threshold);
            }
        }
    }

    /**
     * Déclenche les alertes pour une métrique
     * @param metricKey Clé de la métrique
     * @param value Valeur mesurée
     * @param threshold Seuil dépassé
     */
    private triggerAlerts(metricKey: string, value: number, threshold: number): void {
        const now = Date.now();

        // Vérifier la dernière alerte pour cette métrique
        const lastAlertTime = this.lastMeasurementTimestamp.get(`alert.${metricKey}`) || 0;
        const alertCooldown = 5 * 60 * 1000; // 5 minutes

        // Si une alerte a été envoyée récemment, ne pas la répéter
        if (now - lastAlertTime < alertCooldown) {
            return;
        }

        // Marquer le moment de cette alerte
        this.lastMeasurementTimestamp.set(`alert.${metricKey}`, now);

        // Alertes générales
        if (this.alertListeners.has('all')) {
            this.alertListeners.get('all')!.forEach(listener => {
                listener(metricKey, value, threshold);
            });
        }

        // Alertes spécifiques à la métrique
        if (this.alertListeners.has(metricKey)) {
            this.alertListeners.get(metricKey)!.forEach(listener => {
                listener(metricKey, value, threshold);
            });
        }

        this.logger.warn(`Threshold exceeded: ${metricKey}=${value} (threshold: ${threshold})`);
    }

    /**
     * Obtient les métriques de performance
     * @param category Catégorie de métriques à récupérer
     * @param timeRange Plage de temps en millisecondes (par défaut: dernières 24h)
     */
    public getMetrics(category?: string, timeRange = 24 * 60 * 60 * 1000): PerformanceMetrics {
        const now = Date.now();
        const startTime = now - timeRange;

        // Créer l'objet de base des métriques
        const metrics: PerformanceMetrics = {
            timeRange: {
                start: startTime,
                end: now
            },
            metrics: {},
            timestamp: now,
            systems: {}
        };

        // Extraire les ID de système et initialiser les entrées pour chaque système
        const systemIds = new Set<string>();
        this.metricsHistory.forEach((_, key) => {
            const systemId = key.split('.')[0];
            systemIds.add(systemId);
        });

        // Créer une entrée pour chaque système avec les valeurs par défaut requises
        systemIds.forEach(systemId => {
            metrics.systems[systemId] = {
                processingTime: 0,
                requestsProcessed: 0,
                errors: 0,
                successRate: 100, // 100% par défaut
                cpuUsage: 0,
                memoryUsage: 0,
                cacheSize: 0,
                cacheHitRate: 0
            };
        });

        // Filtrer par catégorie si spécifiée
        this.metricsHistory.forEach((dataPoints, key) => {
            if (!category || key.startsWith(category)) {
                // Filtrer par plage de temps
                const filteredPoints = dataPoints.filter(point => point.timestamp >= startTime);

                if (filteredPoints.length > 0) {
                    // Calculer des statistiques
                    const values = filteredPoints.map(point => point.value);
                    const sum = values.reduce((acc, val) => acc + val, 0);
                    const avg = sum / values.length;
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const latestValue = values[values.length - 1];

                    const metricData = {
                        count: filteredPoints.length,
                        min,
                        max,
                        avg,
                        latest: latestValue,
                        dataPoints: filteredPoints
                    };

                    // Ajouter à la collection générale de métriques
                    metrics.metrics[key] = metricData;

                    // Mettre à jour les métriques spécifiques du système si applicable
                    const systemId = key.split('.')[0];
                    const metricType = key.split('.')[1]; // Ex: "responseTime", "cpu", etc.

                    if (metrics.systems[systemId]) {
                        // Mettre à jour les propriétés spécifiques du système en fonction du type de métrique
                        if (metricType === 'responseTime') {
                            metrics.systems[systemId].processingTime = avg;
                        } else if (metricType === 'cpu') {
                            metrics.systems[systemId].cpuUsage = latestValue;
                        } else if (metricType === 'memory') {
                            metrics.systems[systemId].memoryUsage = latestValue;
                        } else if (metricType === 'requests') {
                            metrics.systems[systemId].requestsProcessed = sum;
                        } else if (metricType === 'errors') {
                            metrics.systems[systemId].errors = sum;
                        } else if (metricType === 'cacheSize') {
                            metrics.systems[systemId].cacheSize = latestValue;
                        } else if (metricType === 'cacheHitRate') {
                            metrics.systems[systemId].cacheHitRate = latestValue;
                        } else if (metricType === 'successRate') {
                            metrics.systems[systemId].successRate = latestValue;
                        }

                        // Pour les métriques personnalisées, nous pouvons les ajouter comme propriétés dynamiques
                        // tant qu'elles sont de type number
                        if (!['responseTime', 'cpu', 'memory', 'requests', 'errors',
                            'cacheSize', 'cacheHitRate', 'successRate'].includes(metricType)) {
                            (metrics.systems[systemId] as Record<string, number>)[metricType] = latestValue;
                        }
                    }
                }
            }
        });

        return metrics;
    }

    /**
     * Obtient l'utilisation des ressources système
     * @param resource Type de ressource spécifique (optionnel)
     */
    public getResourceUsage(resource?: SystemResource): Record<string, ResourceStats> {
        const result: Record<string, ResourceStats> = {};

        if (resource) {
            // Récupérer une ressource spécifique
            if (this.resourceUsage.has(resource)) {
                const values = this.resourceUsage.get(resource)!;
                result[resource] = this.calculateResourceStats(values);
            }
        } else {
            // Récupérer toutes les ressources
            this.resourceUsage.forEach((values, res) => {
                result[res] = this.calculateResourceStats(values);
            });
        }

        return result;
    }

    /**
     * Calcule des statistiques pour une ressource
     * @param values Valeurs d'utilisation de la ressource
     */
    private calculateResourceStats(values: number[]): ResourceStats {
        if (values.length === 0) {
            return {
                min: 0,
                max: 0,
                avg: 0,
                latest: 0
            };
        }

        const sum = values.reduce((acc, val) => acc + val, 0);

        return {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: sum / values.length,
            latest: values[values.length - 1]
        };
    }

    /**
     * Obtient les statistiques de santé du système de métriques
     */
    public getSystemHealth(): SystemHealthInfo {
        const metricsCount = this.metricsHistory.size;
        let totalDataPoints = 0;

        this.metricsHistory.forEach(points => {
            totalDataPoints += points.length;
        });

        const now = Date.now();
        const activeMetrics = Array.from(this.lastMeasurementTimestamp.entries())
            .filter(([, timestamp]) => now - timestamp < 60 * 60 * 1000) // Métriques avec des données dans la dernière heure
            .map(([key]) => key);

        // Trouver le timestamp d'activité le plus récent
        let lastActivityTimestamp = 0;
        this.lastMeasurementTimestamp.forEach(timestamp => {
            if (timestamp > lastActivityTimestamp) {
                lastActivityTimestamp = timestamp;
            }
        });

        return {
            metricsCount,
            totalDataPoints,
            activeMetricsCount: activeMetrics.length,
            activeMetrics,
            resourcesTracked: Array.from(this.resourceUsage.keys()),
            thresholdsCount: this.thresholds.size,
            lastActivityTimestamp
        };
    }

    /**
     * Supprime les anciennes métriques pour économiser de la mémoire
     * @param olderThan Age minimum des métriques à supprimer (en ms)
     * @returns Nombre de points de données supprimés
     */
    public pruneOldMetrics(olderThan = 30 * 24 * 60 * 60 * 1000): number {
        const cutoffTime = Date.now() - olderThan;
        let totalPrunedPoints = 0;

        this.metricsHistory.forEach((points, key) => {
            const originalCount = points.length;
            const newPoints = points.filter(point => point.timestamp >= cutoffTime);
            this.metricsHistory.set(key, newPoints);

            const prunedCount = originalCount - newPoints.length;
            totalPrunedPoints += prunedCount;
        });

        this.logger.info(`Pruned ${totalPrunedPoints} old metric data points`);
        return totalPrunedPoints;
    }

    /**
     * Exporte toutes les métriques vers un format sérialisable
     * @returns Objet contenant toutes les métriques
     */
    public exportAllMetrics(): MetricsExport {
        const metrics: Record<string, PerformanceDataPoint[]> = {};
        this.metricsHistory.forEach((points, key) => {
            metrics[key] = [...points];
        });

        const resources: Record<string, number[]> = {};
        this.resourceUsage.forEach((values, key) => {
            resources[key] = [...values];
        });

        return {
            metadata: {
                exportTime: Date.now(),
                metricsCount: this.metricsHistory.size,
                resourcesCount: this.resourceUsage.size
            },
            metrics,
            resources
        };
    }

    /**
     * Importe des métriques à partir d'un export
     * @param data Données exportées
     * @param overwrite Si true, remplace les métriques existantes
     * @returns Nombre de points de données importés
     */
    public importMetrics(
        data: MetricsImportOptions,
        overwrite = false
    ): number {
        let importedCount = 0;

        // Importer les métriques
        if (data.metrics) {
            for (const [key, points] of Object.entries(data.metrics)) {
                if (overwrite || !this.metricsHistory.has(key)) {
                    this.metricsHistory.set(key, [...points]);
                    importedCount += points.length;
                } else {
                    // Fusionner avec les métriques existantes
                    const existing = this.metricsHistory.get(key)!;
                    this.metricsHistory.set(key, [...existing, ...points]);
                    importedCount += points.length;
                }
            }
        }

        // Importer les ressources
        if (data.resources) {
            for (const [key, values] of Object.entries(data.resources)) {
                if (this.isValidResourceType(key)) {
                    const resourceKey = key as SystemResource;

                    if (overwrite || !this.resourceUsage.has(resourceKey)) {
                        this.resourceUsage.set(resourceKey, [...values]);
                        importedCount += values.length;
                    } else {
                        // Fusionner avec les valeurs existantes
                        const existing = this.resourceUsage.get(resourceKey)!;
                        this.resourceUsage.set(resourceKey, [...existing, ...values]);
                        importedCount += values.length;
                    }
                }
            }
        }

        this.logger.info(`Imported ${importedCount} data points`);
        return importedCount;
    }

    /**
     * Vérifie si une chaîne est un type de ressource valide
     */
    private isValidResourceType(key: string): key is SystemResource {
        return ['cpu', 'memory', 'network', 'storage'].includes(key);
    }

    /**
     * Réinitialise toutes les métriques
     */
    public resetAllMetrics(): void {
        this.metricsHistory.clear();

        // Réinitialiser les ressources mais conserver les clés
        this.resourceUsage.forEach((_, key) => {
            this.resourceUsage.set(key, []);
        });

        this.lastMeasurementTimestamp.clear();

        this.logger.warn('All metrics have been reset');
    }
}

export default PerformanceMonitoringSystem;