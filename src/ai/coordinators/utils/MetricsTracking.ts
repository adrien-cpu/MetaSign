/**
 * @file: src/ai/coordinators/utils/MetricsTracking.ts
 * 
 * Utilitaire amélioré pour suivre les métriques de performance du système.
 * Intègre les fonctionnalités existantes et de nouvelles capacités avancées.
 * Permet de mesurer les temps d'exécution, collecter des statistiques
 * et analyser les tendances de performance.
 */

import { logger } from '../../utils/Logger';

/**
 * Structure d'un timer
 */
interface Timer {
    /** Nom du timer */
    name: string;
    /** Timestamp de début */
    startTime: number;
    /** Timestamp de fin (si terminé) */
    endTime?: number | undefined;
    /** Tags associés au timer */
    tags?: Record<string, string> | undefined;
}

/**
 * Structure d'une métrique
 */
interface Metric {
    /** Nom de la métrique */
    name: string;
    /** Valeur de la métrique */
    value: number;
    /** Type de métrique */
    type: 'counter' | 'gauge' | 'histogram';
    /** Timestamp de collecte */
    timestamp: number;
    /** Tags associés */
    tags?: Record<string, string> | undefined;
}

/**
 * Structure pour stocker les métriques de base
 */
interface BaseMetrics {
    /** Temps de traitement par type de requête */
    processingTime: Map<string, number[]>;
    /** Utilisation mémoire par type de requête */
    memoryUsage: Map<string, number[]>;
    /** Nombre de requêtes par type */
    requestCount: Map<string, number>;
    /** Hits de cache par type de requête */
    cacheHits?: Map<string, number>;
    /** Erreurs par type de requête */
    errors?: Map<string, number>;
}

/**
 * Options pour le suivi des métriques
 */
export interface MetricsTrackingOptions {
    /** Préfixe à ajouter aux noms des métriques */
    prefix?: string;
    /** Capacité maximale pour l'historique des métriques */
    historyCapacity?: number;
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** Envoyer les métriques au système de monitoring unifié */
    sendToMonitoring?: boolean;
    /** Conserver les métriques en mémoire */
    keepHistory?: boolean;
    /** Percentiles à calculer pour les statistiques */
    percentiles?: number[];
}

/**
 * Utilitaire avancé pour le suivi des métriques de performance
 */
export class MetricsTracking {
    private readonly prefix: string;
    private readonly timers: Map<string, Timer> = new Map();
    private readonly metrics: Map<string, Metric[]> = new Map();
    private readonly baseMetrics: BaseMetrics = {
        processingTime: new Map<string, number[]>(),
        memoryUsage: new Map<string, number[]>(),
        requestCount: new Map<string, number>(),
        cacheHits: new Map<string, number>(),
        errors: new Map<string, number>()
    };
    private readonly historyCapacity: number;
    private readonly sendToMonitoring: boolean;
    private readonly keepHistory: boolean;
    private readonly percentiles: number[];

    /**
     * Crée une nouvelle instance de suivi des métriques
     * @param prefix Préfixe pour les noms des métriques
     * @param options Options supplémentaires
     */
    constructor(prefix: string = '', options: MetricsTrackingOptions = {}) {
        this.prefix = prefix ? `${prefix}.` : '';
        this.historyCapacity = options.historyCapacity || 1000;
        this.sendToMonitoring = options.sendToMonitoring !== false;
        this.keepHistory = options.keepHistory !== false;
        this.percentiles = options.percentiles || [50, 90, 95, 99];

        logger.debug(`MetricsTracking créé avec préfixe '${this.prefix}'`, {
            historyCapacity: this.historyCapacity,
            percentiles: this.percentiles
        });
    }

    /**
     * Démarre un timer pour mesurer un temps d'exécution
     * @param name Nom du timer
     * @param tags Tags associés (optionnels)
     * @returns Le nom complet du timer (avec préfixe)
     */
    public startTimer(name: string, tags?: Record<string, string>): string {
        const fullName = this.getFullName(name);

        this.timers.set(fullName, {
            name: fullName,
            startTime: performance.now(),
            tags
        });

        logger.debug(`Timer démarré: ${fullName}`);
        return fullName;
    }

    /**
     * Arrête un timer et enregistre le temps d'exécution
     * @param name Nom du timer
     * @returns Durée d'exécution en ms
     */
    public stopTimer(name: string): number {
        const fullName = this.getFullName(name);
        const timer = this.timers.get(fullName);

        if (!timer) {
            logger.warn(`Tentative d'arrêt d'un timer inexistant: ${fullName}`);
            return 0;
        }

        timer.endTime = performance.now();
        const duration = timer.endTime - timer.startTime;

        // Enregistrer comme métrique
        this.recordMetric(fullName, duration, 'gauge', timer.tags);

        logger.debug(`Timer arrêté: ${fullName}, durée: ${duration.toFixed(2)}ms`);
        return duration;
    }

    /**
     * Enregistre une métrique
     * @param name Nom de la métrique
     * @param value Valeur de la métrique
     * @param type Type de la métrique
     * @param tags Tags associés (optionnels)
     */
    public recordMetric(
        name: string,
        value: number,
        type: 'counter' | 'gauge' | 'histogram' = 'gauge',
        tags?: Record<string, string>
    ): void {
        const fullName = this.getFullName(name);

        // Créer l'entrée de métrique
        const metric: Metric = {
            name: fullName,
            value,
            type,
            timestamp: Date.now(),
            tags
        };

        // Stocker dans l'historique si demandé
        if (this.keepHistory) {
            if (!this.metrics.has(fullName)) {
                this.metrics.set(fullName, []);
            }

            const metricHistory = this.metrics.get(fullName)!;
            metricHistory.push(metric);

            // Limiter la taille de l'historique
            if (metricHistory.length > this.historyCapacity) {
                metricHistory.shift();
            }
        }

        // Déterminer le type de métrique pour les métriques de base
        if (fullName.includes('processingTime')) {
            const requestType = this.extractRequestType(fullName, tags);
            this.trackMetric(this.baseMetrics, requestType, 'processingTime', value);
        } else if (fullName.includes('memoryUsage')) {
            const requestType = this.extractRequestType(fullName, tags);
            this.trackMetric(this.baseMetrics, requestType, 'memoryUsage', value);
        } else if (fullName.includes('request')) {
            const requestType = this.extractRequestType(fullName, tags);
            this.trackMetric(this.baseMetrics, requestType, 'requestCount', value);
        } else if (fullName.includes('cache') && fullName.includes('hit')) {
            const requestType = this.extractRequestType(fullName, tags);
            this.trackCacheHit(requestType, value);
        } else if (fullName.includes('error')) {
            const requestType = this.extractRequestType(fullName, tags);
            this.trackError(requestType, value);
        }

        // Envoyer au système de monitoring si demandé
        if (this.sendToMonitoring) {
            // Utiliser la méthode import de façon asynchrone
            (async () => {
                try {
                    // Import dynamique pour éviter les dépendances circulaires
                    const monitoringModule = await import('../../monitoring/MonitoringUnifie');
                    const monitoringSystem = monitoringModule.getMonitoringSystem();
                    monitoringSystem.recordMetric(fullName, value, type, tags);
                } catch (error) {
                    logger.debug('Impossible d\'envoyer la métrique au système de monitoring', {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            })();
        }
    }

    /**
     * Extrait le type de requête d'une métrique
     * @param metricName Nom de la métrique
     * @param tags Tags associés
     * @returns Type de requête ou 'unknown'
     */
    private extractRequestType(metricName: string, tags?: Record<string, string>): string {
        // D'abord vérifier les tags
        if (tags && 'requestType' in tags) {
            return tags['requestType'];
        }

        // Ensuite vérifier le nom de la métrique
        const parts = metricName.split('.');
        for (const part of parts) {
            if (part.includes('request_') || part.includes('type_')) {
                const segments = part.split('_');
                if (segments.length > 1) {
                    return segments[1];
                }
            }
        }

        // Valeur par défaut
        return 'unknown';
    }
    /**
     * Méthode pour suivre les métriques de performance
     * @param metrics Objet contenant les métriques
     * @param requestType Type de requête
     * @param metricType Type de métrique
     * @param value Valeur à enregistrer
     */
    public trackMetric(
        metrics: BaseMetrics,
        requestType: string,
        metricType: string,
        value: number
    ): void {
        switch (metricType) {
            case 'processingTime': {
                const currentTimes = metrics.processingTime.get(requestType) || [];
                currentTimes.push(value);
                // Garder uniquement les dernières mesures selon la capacité
                if (currentTimes.length > this.historyCapacity) currentTimes.shift();
                metrics.processingTime.set(requestType, currentTimes);
                break;
            }
            case 'memoryUsage': {
                const currentUsage = metrics.memoryUsage.get(requestType) || [];
                currentUsage.push(value);
                if (currentUsage.length > this.historyCapacity) currentUsage.shift();
                metrics.memoryUsage.set(requestType, currentUsage);
                break;
            }
            case 'requestCount': {
                const count = metrics.requestCount.get(requestType) || 0;
                metrics.requestCount.set(requestType, count + value);
                break;
            }
        }
    }

    /**
     * Suit les hits de cache
     * @param requestType Type de requête
     * @param value Valeur à ajouter
     */
    private trackCacheHit(requestType: string, value: number): void {
        if (!this.baseMetrics.cacheHits) {
            this.baseMetrics.cacheHits = new Map<string, number>();
        }

        const current = this.baseMetrics.cacheHits.get(requestType) || 0;
        this.baseMetrics.cacheHits.set(requestType, current + value);
    }

    /**
     * Suit les erreurs
     * @param requestType Type de requête
     * @param value Valeur à ajouter
     */
    private trackError(requestType: string, value: number): void {
        if (!this.baseMetrics.errors) {
            this.baseMetrics.errors = new Map<string, number>();
        }

        const current = this.baseMetrics.errors.get(requestType) || 0;
        this.baseMetrics.errors.set(requestType, current + value);
    }

    /**
     * Obtient la valeur actuelle d'une métrique
     * @param name Nom de la métrique
     * @returns Dernière valeur de la métrique ou undefined si non trouvée
     */
    public getMetricValue(name: string): number | undefined {
        const fullName = this.getFullName(name);
        const metricHistory = this.metrics.get(fullName);

        if (!metricHistory || metricHistory.length === 0) {
            return undefined;
        }

        return metricHistory[metricHistory.length - 1].value;
    }

    /**
     * Obtient l'historique complet d'une métrique
     * @param name Nom de la métrique
     * @returns Historique de la métrique ou undefined si non trouvée
     */
    public getMetricHistory(name: string): Metric[] | undefined {
        const fullName = this.getFullName(name);
        return this.metrics.get(fullName);
    }

    /**
     * Calcule le temps d'exécution moyen pour une métrique
     * @param name Préfixe du nom des timers à inclure
     * @returns Temps moyen en ms ou 0 si aucune donnée
     */
    public getAverageTime(name: string): number {
        // D'abord essayer avec les métriques avancées
        const prefix = this.getFullName(name);
        let total = 0;
        let count = 0;

        // Parcourir toutes les métriques qui commencent par le préfixe
        for (const [metricName, history] of this.metrics.entries()) {
            if (metricName.startsWith(prefix) && history.length > 0) {
                // Calculer la moyenne pour cette métrique
                const metricSum = history.reduce((sum, metric) => sum + metric.value, 0);
                const metricAvg = metricSum / history.length;

                total += metricAvg;
                count++;
            }
        }

        if (count > 0) {
            return total / count;
        }

        // Si aucune métrique avancée, essayer avec les métriques de base
        const processingTimes = this.baseMetrics.processingTime.get(name);
        if (processingTimes && processingTimes.length > 0) {
            return this.calculateAverage(processingTimes);
        }

        return 0;
    }

    /**
     * Calcule des statistiques sur une métrique
     * @param name Nom de la métrique
     * @returns Statistiques ou undefined si non trouvée
     */
    public getMetricStats(name: string): {
        min: number;
        max: number;
        avg: number;
        count: number;
        percentiles: Record<string, number>;
    } | undefined {
        // D'abord essayer avec les métriques avancées
        const fullName = this.getFullName(name);
        const metricHistory = this.metrics.get(fullName);

        if (metricHistory && metricHistory.length > 0) {
            const values = metricHistory.map(m => m.value);
            return this.calculateStats(values);
        }

        // Ensuite essayer avec les métriques de base
        const processingTimes = this.baseMetrics.processingTime.get(name);
        if (processingTimes && processingTimes.length > 0) {
            return this.calculateStats(processingTimes);
        }

        return undefined;
    }

    /**
     * Calcule des statistiques sur un tableau de valeurs
     * @param values Tableau de valeurs
     * @returns Statistiques calculées
     */
    private calculateStats(values: number[]): {
        min: number;
        max: number;
        avg: number;
        count: number;
        percentiles: Record<string, number>;
    } {
        values.sort((a, b) => a - b);

        const min = values[0];
        const max = values[values.length - 1];
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;

        // Calcul des percentiles configurés
        const percentiles = this.calculatePercentiles(values, this.percentiles);

        return {
            min,
            max,
            avg,
            count: values.length,
            percentiles
        };
    }

    /**
     * Obtient des statistiques sur tous les timers
     * @returns Map des statistiques par timer
     */
    public getAllTimerStats(): Map<string, {
        avg: number;
        min: number;
        max: number;
        count: number;
        percentiles: Record<string, number>;
    }> {
        const stats = new Map<string, {
            avg: number;
            min: number;
            max: number;
            count: number;
            percentiles: Record<string, number>;
        }>();

        // Récupérer tous les noms de métriques qui sont des timers
        const timerNames = new Set<string>();

        for (const [name] of this.timers) {
            timerNames.add(name);
        }

        // Calculer les statistiques pour chaque timer
        for (const name of timerNames) {
            const timerStats = this.getMetricStats(name);
            if (timerStats) {
                stats.set(name, timerStats);
            }
        }

        return stats;
    }

    /**
     * Calcule la moyenne d'un tableau de valeurs
     * @param values Tableau de valeurs
     * @returns Moyenne des valeurs
     */
    public calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    }

    /**
     * Calcule les percentiles d'un tableau de valeurs
     * @param values Tableau de valeurs
     * @param percentiles Tableau des percentiles à calculer (ex: [50, 95, 99])
     * @returns Objet avec les percentiles calculés
     */
    public calculatePercentiles(values: number[], percentiles: number[]): Record<string, number> {
        if (values.length === 0) {
            return percentiles.reduce((acc, p) => {
                acc[`p${p}`] = 0;
                return acc;
            }, {} as Record<string, number>);
        }

        const sortedValues = [...values].sort((a, b) => a - b);
        return percentiles.reduce((acc, p) => {
            const index = Math.ceil((p / 100) * sortedValues.length) - 1;
            acc[`p${p}`] = sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
            return acc;
        }, {} as Record<string, number>);
    }

    /**
     * Détecte les tendances dans les métriques
     * @param name Nom de la métrique
     * @param windowSizeMs Taille de la fenêtre d'analyse en ms
     * @returns Tendance en % de variation (positif = hausse, négatif = baisse)
     */
    public detectTrend(name: string, windowSizeMs: number = 300000): number {
        const fullName = this.getFullName(name);
        const metricHistory = this.metrics.get(fullName);

        if (!metricHistory || metricHistory.length < 5) {
            return 0; // Pas assez de données
        }

        const now = Date.now();
        const cutoffTime = now - windowSizeMs;

        // Séparer l'historique en deux parties
        const recentMetrics = metricHistory.filter(m => m.timestamp >= cutoffTime);
        const olderMetrics = metricHistory.filter(m => m.timestamp < cutoffTime);

        if (recentMetrics.length < 2 || olderMetrics.length < 2) {
            return 0; // Pas assez de données pour comparer
        }

        // Calculer les moyennes
        const recentAvg = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
        const olderAvg = olderMetrics.reduce((sum, m) => sum + m.value, 0) / olderMetrics.length;

        // Calculer la variation en pourcentage
        if (olderAvg === 0) return 0;
        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    /**
     * Génère le nom complet d'une métrique (avec préfixe)
     * @param name Nom de base
     * @returns Nom complet
     */
    private getFullName(name: string): string {
        return `${this.prefix}${name}`;
    }

    /**
     * Obtient le taux de hit du cache pour un type de requête
     * @param requestType Type de requête
     * @returns Taux de hit du cache (0-1) ou 0 si aucune donnée
     */
    public getCacheHitRate(requestType: string): number {
        if (!this.baseMetrics.cacheHits || !this.baseMetrics.requestCount) {
            return 0;
        }

        const hits = this.baseMetrics.cacheHits.get(requestType) || 0;
        const total = this.baseMetrics.requestCount.get(requestType) || 0;

        if (total === 0) {
            return 0;
        }

        return hits / total;
    }

    /**
     * Obtient le taux d'erreur pour un type de requête
     * @param requestType Type de requête
     * @returns Taux d'erreur (0-1) ou 0 si aucune donnée
     */
    public getErrorRate(requestType: string): number {
        if (!this.baseMetrics.errors || !this.baseMetrics.requestCount) {
            return 0;
        }

        const errors = this.baseMetrics.errors.get(requestType) || 0;
        const total = this.baseMetrics.requestCount.get(requestType) || 0;

        if (total === 0) {
            return 0;
        }

        return errors / total;
    }

    /**
     * Obtient un résumé des métriques pour tous les types de requêtes
     * @returns Résumé des métriques
     */
    public getMetricsSummary(): Record<string, {
        requestCount: number;
        avgProcessingTime: number;
        p95ProcessingTime: number;
        errorRate: number;
        cacheHitRate: number;
    }> {
        type MetricSummary = {
            requestCount: number;
            avgProcessingTime: number;
            p95ProcessingTime: number;
            errorRate: number;
            cacheHitRate: number;
        };
        const summary: Record<string, MetricSummary> = {};

        // Collecter tous les types de requêtes connus
        const requestTypes = new Set<string>();
        for (const type of this.baseMetrics.requestCount.keys()) {
            requestTypes.add(type);
        }

        // Créer un résumé pour chaque type de requête
        for (const type of requestTypes) {
            const processingTimes = this.baseMetrics.processingTime.get(type) || [];
            const requestCount = this.baseMetrics.requestCount.get(type) || 0;

            let avgProcessingTime = 0;
            let p95ProcessingTime = 0;

            if (processingTimes.length > 0) {
                avgProcessingTime = this.calculateAverage(processingTimes);
                const percentiles = this.calculatePercentiles(processingTimes, [95]);
                p95ProcessingTime = percentiles.p95;
            }

            summary[type] = {
                requestCount,
                avgProcessingTime,
                p95ProcessingTime,
                errorRate: this.getErrorRate(type),
                cacheHitRate: this.getCacheHitRate(type)
            };
        }

        return summary;
    }

    /**
     * Obtient les types de requêtes pour lesquels on a collecté des métriques
     * @returns Liste des types de requêtes
     */
    public getTrackedRequestTypes(): string[] {
        return [...this.baseMetrics.requestCount.keys()];
    }

    /**
     * Réinitialise toutes les métriques
     */
    public reset(): void {
        this.timers.clear();
        this.metrics.clear();
        this.baseMetrics.processingTime.clear();
        this.baseMetrics.memoryUsage.clear();
        this.baseMetrics.requestCount.clear();

        if (this.baseMetrics.cacheHits) {
            this.baseMetrics.cacheHits.clear();
        }

        if (this.baseMetrics.errors) {
            this.baseMetrics.errors.clear();
        }

        logger.debug('Métriques réinitialisées');
    }
}