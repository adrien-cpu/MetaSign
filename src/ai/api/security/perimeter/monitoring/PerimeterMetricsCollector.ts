// src/ai/api/security/perimeter/monitoring/PerimeterMetricsCollector.ts

import { MetricsCollector } from '../../../common/metrics/MetricsCollector';
import { SystemMetrics, MetricData } from '../../../common/metrics/types/MetricTypes';

// Interface pour les configurations du périmètre de sécurité
interface SecurityPerimeterConfig {
    zoneId: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    rules: string[];
    maxAttempts: number;
}

// Interface pour les événements de sécurité
interface SecurityEvent {
    eventType: 'access_attempt' | 'rule_violation' | 'anomaly_detected' | 'threshold_exceeded';
    severity: 'info' | 'warning' | 'error' | 'critical';
    source: string;
    timestamp: number;
    metadata: Record<string, unknown>;
}

// Interface pour les statistiques de performance
interface PerformanceStats {
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    throughput: number;
    errorRate: number;
}

export class PerimeterMetricsCollector {
    private readonly performanceBuffer: number[] = [];
    private readonly eventHistory: SecurityEvent[] = [];
    private readonly maxHistorySize = 1000;

    constructor(
        private readonly metricsCollector: MetricsCollector
    ) {}

    /**
     * Enregistre une tentative d'accès au périmètre de sécurité
     */
    recordAccessAttempt(zoneId: string, allowed: boolean, userAgent?: string, ip?: string): void {
        // Métrique de base
        const metricName = `security_perimeter_access_attempts_${zoneId}_${allowed ? 'allowed' : 'denied'}_${this.categorizeIP(ip)}`;
        this.metricsCollector.incrementCounter(metricName);

        // Enregistrer l'événement de sécurité
        const securityEvent: SecurityEvent = {
            eventType: 'access_attempt',
            severity: allowed ? 'info' : 'warning',
            source: `zone_${zoneId}`,
            timestamp: Date.now(),
            metadata: { userAgent, ip, allowed }
        };

        this.recordSecurityEvent(securityEvent);

        // Créer une métrique système détaillée
        const systemMetric: SystemMetrics = {
            timestamp: Date.now(),
            name: 'perimeter_access_detailed',
            value: allowed ? 1 : 0,
            unit: 'boolean',
            tags: { 
                zone_id: zoneId, 
                outcome: allowed ? 'success' : 'failure',
                ip_category: this.categorizeIP(ip)
            },
            source: `perimeter_zone_${zoneId}`,
            type: 'counter'
        };

        this.recordSystemMetric(systemMetric);
    }

    /**
     * Enregistre l'évaluation d'une règle de sécurité
     */
    recordRuleEvaluation(ruleId: string, matched: boolean, processingTimeMs?: number): void {
        const evaluationMetricName = `security_perimeter_rule_evaluations_${ruleId}_${matched ? 'matched' : 'unmatched'}_${this.categorizePerformance(processingTimeMs)}`;
        this.metricsCollector.incrementCounter(evaluationMetricName);

        if (processingTimeMs) {
            this.recordProcessingTime('rule_evaluation', processingTimeMs);
        }

        // Enregistrer les violations de règles
        if (matched) {
            const violationEvent: SecurityEvent = {
                eventType: 'rule_violation',
                severity: 'error',
                source: `rule_${ruleId}`,
                timestamp: Date.now(),
                metadata: { ruleId, processingTimeMs }
            };

            this.recordSecurityEvent(violationEvent);
        }
    }

    /**
     * Enregistre le temps de traitement pour différentes opérations
     */
    recordProcessingTime(operation: string, durationMs: number): void {
        const timingMetricName = `security_perimeter_processing_time_${operation}_${this.getPerformanceTier(durationMs)}_${this.categorizeOperation(operation)}`;
        this.metricsCollector.recordTiming(timingMetricName, durationMs);

        // Maintenir un buffer pour les statistiques de performance
        this.performanceBuffer.push(durationMs);
        if (this.performanceBuffer.length > 100) {
            this.performanceBuffer.shift(); // Garder seulement les 100 dernières mesures
        }

        // Créer une métrique détaillée avec charge système
        const systemLoad = this.calculateSystemLoad();
        const metricData: MetricData = {
            min: durationMs,
            max: durationMs,
            avg: durationMs,
            sum: durationMs,
            count: 1,
            lastUpdate: Date.now(),
            p90: durationMs * (1 + systemLoad * 0.1) // Ajuster p90 selon la charge
        };

        this.recordMetricData(`processing_time_detailed_load_${systemLoad.toFixed(2)}`, metricData);
    }

    /**
     * Enregistre le taux de succès du cache
     */
    recordCacheHitRate(hitRate: number, cacheType: string = 'default'): void {
        const cacheMetricName = `security_perimeter_cache_hit_rate_${cacheType}_${this.getCacheEfficiencyLevel(hitRate)}`;
        this.metricsCollector.recordTiming(cacheMetricName, hitRate * 100); // Convertir en pourcentage

        // Alerte si le taux de succès est trop bas
        if (hitRate < 0.5) {
            const anomalyEvent: SecurityEvent = {
                eventType: 'anomaly_detected',
                severity: 'warning',
                source: `cache_${cacheType}`,
                timestamp: Date.now(),
                metadata: { hitRate, threshold: 0.5 }
            };

            this.recordSecurityEvent(anomalyEvent);
        }
    }

    /**
     * Enregistre des anomalies détectées dans le périmètre
     */
    recordAnomalyDetection(anomalyType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: Record<string, unknown>): void {
        const anomalyMetricName = `security_perimeter_anomalies_${anomalyType}_${severity}_automated`;
        this.metricsCollector.incrementCounter(anomalyMetricName);

        const anomalyEvent: SecurityEvent = {
            eventType: 'anomaly_detected',
            severity: severity === 'low' ? 'info' : severity === 'medium' ? 'warning' : 'error',
            source: `anomaly_detector_${anomalyType}`,
            timestamp: Date.now(),
            metadata: { anomalyType, ...details }
        };

        this.recordSecurityEvent(anomalyEvent);
    }

    /**
     * Enregistre les seuils dépassés
     */
    recordThresholdExceeded(metricName: string, currentValue: number, threshold: number, config: SecurityPerimeterConfig): void {
        const thresholdMetricName = `security_perimeter_threshold_exceeded_${metricName}_${config.zoneId}_${config.level}`;
        this.metricsCollector.incrementCounter(thresholdMetricName);

        const thresholdEvent: SecurityEvent = {
            eventType: 'threshold_exceeded',
            severity: config.level === 'critical' ? 'critical' : 'warning',
            source: `threshold_monitor_${metricName}`,
            timestamp: Date.now(),
            metadata: { metricName, currentValue, threshold, config }
        };

        this.recordSecurityEvent(thresholdEvent);
    }

    /**
     * Obtient les statistiques de performance actuelles
     */
    getPerformanceStats(): PerformanceStats {
        if (this.performanceBuffer.length === 0) {
            return {
                avgResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: 0,
                throughput: 0,
                errorRate: 0
            };
        }

        const sum = this.performanceBuffer.reduce((a, b) => a + b, 0);
        return {
            avgResponseTime: sum / this.performanceBuffer.length,
            maxResponseTime: Math.max(...this.performanceBuffer),
            minResponseTime: Math.min(...this.performanceBuffer),
            throughput: this.performanceBuffer.length / 60, // par minute
            errorRate: this.calculateErrorRate()
        };
    }

    /**
     * Obtient l'historique des événements de sécurité
     */
    getSecurityEventHistory(limit: number = 50): SecurityEvent[] {
        return this.eventHistory
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    // Méthodes utilitaires privées
    private recordSecurityEvent(event: SecurityEvent): void {
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    private recordSystemMetric(metric: SystemMetrics): void {
        // Utiliser SystemMetrics pour enregistrer des métriques détaillées
        console.log(`Recording system metric: ${metric.name} = ${metric.value} (${metric.type})`);
        // Dans une vraie implémentation, ceci serait transmis au système de métriques
    }

    private recordMetricData(name: string, data: MetricData): void {
        // Utiliser MetricData pour des données enrichies
        console.log(`Recording metric data: ${name}`, data);
        // Dans une vraie implémentation, ceci serait stocké pour l'analyse
    }

    private categorizeIP(ip?: string): string {
        if (!ip) return 'unknown';
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            return 'internal';
        }
        return 'external';
    }

    private categorizePerformance(timeMs?: number): string {
        if (!timeMs) return 'unknown';
        if (timeMs < 100) return 'fast';
        if (timeMs < 500) return 'normal';
        if (timeMs < 1000) return 'slow';
        return 'very_slow';
    }

    private categorizeOperation(operation: string): string {
        if (operation.includes('rule')) return 'rule_processing';
        if (operation.includes('cache')) return 'cache_operation';
        if (operation.includes('auth')) return 'authentication';
        return 'general';
    }

    private getPerformanceTier(durationMs: number): string {
        if (durationMs < 50) return 'tier_1_excellent';
        if (durationMs < 200) return 'tier_2_good';
        if (durationMs < 500) return 'tier_3_acceptable';
        return 'tier_4_poor';
    }

    private getCacheEfficiencyLevel(hitRate: number): string {
        if (hitRate >= 0.9) return 'excellent';
        if (hitRate >= 0.7) return 'good';
        if (hitRate >= 0.5) return 'acceptable';
        return 'poor';
    }

    private calculateSystemLoad(): number {
        // Simulation de la charge système basée sur les performances récentes
        if (this.performanceBuffer.length === 0) return 0;
        const avgTime = this.performanceBuffer.reduce((a, b) => a + b, 0) / this.performanceBuffer.length;
        return Math.min(1, avgTime / 1000); // Normaliser entre 0 et 1
    }

    private calculateErrorRate(): number {
        // Simulation du taux d'erreur basé sur les événements récents
        const recentEvents = this.eventHistory.slice(-100);
        const errorEvents = recentEvents.filter(e => e.severity === 'error' || e.severity === 'critical');
        return recentEvents.length > 0 ? errorEvents.length / recentEvents.length : 0;
    }
}