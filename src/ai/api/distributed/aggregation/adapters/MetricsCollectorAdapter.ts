/**
 * src/ai/api/distributed/aggregation/adapters/MetricsCollectorAdapter.ts
 * 
 * Adaptateur pour les collecteurs de métriques
 * Convertit IMetricsCollector et IPerformanceMonitor en une interface unifiée
 */
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import { IPerformanceMonitor } from '@api/distributed/monitoring/interfaces/IPerformanceMonitor';

/**
 * Type pour les charges utiles d'événements métriques
 */
export type MetricEventPayload = Record<string, string>;

/**
 * Interface étendue pour la collecte de métriques
 */
export interface IExtendedMetricsCollector {
    /**
     * Enregistre une valeur métrique
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Enregistre un événement métrique
     */
    trackEvent(name: string, properties?: MetricEventPayload): void;

    /**
     * Enregistre une métrique comme un événement avec une valeur
     */
    trackMetric(name: string, value: number, properties?: Record<string, string>): void;

    /**
     * Démarre un timer pour mesurer une opération
     */
    startTimer?(name: string): string;

    /**
     * Arrête un timer et enregistre la durée
     */
    stopTimer?(timerId: string, properties?: Record<string, string>): number;

    /**
     * Incrémente un compteur
     */
    incrementCounter?(name: string, incrementBy?: number): void;

    /**
     * Enregistre une valeur avec des tags
     */
    recordValue?(name: string, value: number, tags?: Record<string, string>): void;
}

/**
 * Adaptateur qui combine IMetricsCollector et IPerformanceMonitor
 * pour fournir l'interface IExtendedMetricsCollector requise
 */
export class MetricsCollectorAdapter implements IExtendedMetricsCollector {
    private readonly metricsCollector: IMetricsCollector;
    private readonly performanceMonitor: IPerformanceMonitor;
    private timers: Map<string, number>;

    /**
     * Constructeur
     * 
     * @param metricsCollector - Collecteur de métriques de base
     * @param performanceMonitor - Moniteur de performance
     */
    constructor(
        metricsCollector: IMetricsCollector,
        performanceMonitor: IPerformanceMonitor
    ) {
        this.metricsCollector = metricsCollector;
        this.performanceMonitor = performanceMonitor;
        this.timers = new Map<string, number>();
    }

    /**
     * Enregistre une valeur métrique
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param tags - Tags associés à la métrique (optionnel)
     */
    public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
        // Utilise le collecteur de métriques de base s'il existe
        if (this.metricsCollector.recordMetric) {
            this.metricsCollector.recordMetric(name, value, tags);
        } else {
            // Fallback sur une implémentation basique
            this.performanceMonitor.recordPerformance(name, value);
        }
    }

    /**
     * Enregistre un événement métrique
     * 
     * @param name - Nom de l'événement
     * @param properties - Propriétés associées à l'événement (optionnel)
     */
    public trackEvent(name: string, properties?: MetricEventPayload): void {
        if (this.metricsCollector.trackEvent) {
            // Conversion de sécurité: les propriétés sont déjà de type MetricEventPayload
            this.metricsCollector.trackEvent(name, properties);
        } else {
            // Enregistrement simple au format JSON
            const propertiesStr = properties ? JSON.stringify(properties) : '';
            this.performanceMonitor.recordPerformance(`event_${name}`, 1);
            if (propertiesStr) {
                this.performanceMonitor.logPerformance(`Event: ${name} - ${propertiesStr}`);
            }
        }
    }

    /**
     * Enregistre une métrique comme un événement avec une valeur
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param properties - Propriétés associées à la métrique (optionnel)
     */
    public trackMetric(name: string, value: number, properties?: Record<string, string>): void {
        if (this.metricsCollector.trackMetric) {
            this.metricsCollector.trackMetric(name, value, properties);
        } else {
            this.performanceMonitor.recordPerformance(name, value);

            // Journalisation avec propriétés si présentes
            if (properties) {
                this.performanceMonitor.logPerformance(
                    `Metric: ${name} = ${value} with ${JSON.stringify(properties)}`
                );
            }
        }
    }

    /**
     * Démarre un timer pour mesurer une opération
     * 
     * @param name - Nom du timer
     * @returns Identifiant du timer (pour stopTimer)
     */
    public startTimer(name: string): string {
        const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.timers.set(timerId, Date.now());
        return timerId;
    }

    /**
     * Arrête un timer et enregistre la durée
     * 
     * @param timerId - Identifiant du timer (retourné par startTimer)
     * @param properties - Propriétés associées au timer (optionnel)
     * @returns Durée en millisecondes
     */
    public stopTimer(timerId: string, properties?: Record<string, string>): number {
        const startTime = this.timers.get(timerId);
        if (!startTime) {
            throw new Error(`Timer with ID '${timerId}' does not exist`);
        }

        const duration = Date.now() - startTime;
        this.timers.delete(timerId);

        // Extraire le nom de base du timer depuis l'ID
        const baseName = timerId.split('_')[0];

        // Enregistrer la métrique de durée
        this.recordMetric(`duration_${baseName}`, duration);

        // Journalisation avec propriétés si présentes
        if (properties) {
            this.performanceMonitor.logPerformance(
                `Timer ${baseName}: ${duration}ms with ${JSON.stringify(properties)}`
            );
        }

        return duration;
    }

    /**
     * Incrémente un compteur
     * 
     * @param name - Nom du compteur
     * @param incrementBy - Valeur d'incrémentation (défaut: 1)
     */
    public incrementCounter(name: string, incrementBy = 1): void {
        this.recordMetric(`counter_${name}`, incrementBy);
    }

    /**
     * Enregistre une valeur avec des tags
     * 
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param tags - Tags associés à la métrique
     */
    public recordValue(name: string, value: number, tags?: Record<string, string>): void {
        this.recordMetric(name, value, tags);
    }
}