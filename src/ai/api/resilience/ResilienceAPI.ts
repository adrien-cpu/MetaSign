// src/ai/api/resilience/ResilienceAPI.ts

import { AnomalyDetector } from '../common/detection/AnomalyDetector';
import * as AnomalyType from '../common/detection/types/AnomalyTypes';
import { SelfHealer } from './core/SelfHealer';
import { ResourceManager } from './managers/ResourceManager';
import { StateManager } from './managers/StateManager';
import { MonitoringService } from './services/MonitoringService';
import {
    SystemHealth,
    SystemMetrics,
    Anomaly,
    HealingPlan,
    SystemStatus
} from './types/ResilienceTypes';

// Interfaces pour typer correctement les objets
interface ResourceMetrics {
    cpuLoad?: number;
    memoryUsage?: number;
    diskUsage?: number;
    [key: string]: unknown; // Utilisation de unknown au lieu de any
}

interface HealthMetrics {
    availability?: number;
    errorCount?: number;
    [key: string]: unknown; // Utilisation de unknown au lieu de any
}

interface PerformanceMetrics {
    responseTime?: number;
    throughput?: number;
    utilization?: number;
}

export class ResilienceAPI {
    constructor(
        private readonly anomalyDetector: AnomalyDetector,
        private readonly selfHealer: SelfHealer,
        private readonly resourceManager: ResourceManager,
        private readonly stateManager: StateManager,
        private readonly monitoringService: MonitoringService
    ) { }

    async monitorSystem(): Promise<SystemHealth> {
        const metrics = await this.monitoringService.collectMetrics();
        // Conversion des métriques au format attendu par l'AnomalyDetector
        const anomalyMetrics = this.convertToAnomalyMetrics(metrics);
        const anomalies = await this.anomalyDetector.detectAnomalies(anomalyMetrics);

        if (anomalies.length > 0) {
            await this.handleAnomalies(anomalies);
        }

        return {
            status: this.determineSystemStatus(metrics, anomalies),
            metrics,
            anomalies,
            recommendations: await this.generateRecommendations(metrics, anomalies)
        };
    }

    /**
     * Convertit les métriques du système au format attendu par l'AnomalyDetector
     * @param metrics Métriques du système au format ResilienceTypes.SystemMetrics
     * @returns Métriques au format AnomalyTypes.SystemMetrics
     */
    private convertToAnomalyMetrics(metrics: SystemMetrics): AnomalyType.SystemMetrics {
        // Extraire les données des métriques avec des valeurs par défaut
        const resources = metrics.resources && typeof metrics.resources === 'object'
            ? metrics.resources as ResourceMetrics
            : {} as ResourceMetrics;

        const healthMetrics = metrics.health && typeof metrics.health === 'object'
            ? metrics.health as HealthMetrics
            : {} as HealthMetrics;

        const performance = metrics.performance && typeof metrics.performance === 'object'
            ? metrics.performance as PerformanceMetrics
            : {} as PerformanceMetrics;

        // Créer un objet intermédiaire sans le typer
        const metricsData = {
            value: 0,
            metricName: 'system_health',
            timestamp: Date.now(),
            performance: {
                responseTime: performance.responseTime ?? 0,
                throughput: performance.throughput ?? 0,
                utilization: performance.utilization ?? 0
            },
            resourceUsage: {
                cpu: resources.cpuLoad ?? 0,
                memory: resources.memoryUsage ?? 0,
                disk: resources.diskUsage ?? 0
            },
            availability: healthMetrics.availability ?? 100
        };

        // Utiliser une conversion explicite en unknown puis en AnomalyType.SystemMetrics
        return metricsData as unknown as AnomalyType.SystemMetrics;
    }
    
    private async handleAnomalies(anomalies: Anomaly[]): Promise<void> {
        const healingPlan = await this.selfHealer.createHealingPlan(anomalies);
        await this.stateManager.backupState();

        try {
            await this.executeHealingPlan(healingPlan);
        } catch (error) {
            await this.stateManager.rollback();
            throw error;
        }
    }

    private async executeHealingPlan(plan: HealingPlan): Promise<void> {
        for (const action of plan.actions) {
            await this.resourceManager.executeAction(action);
        }
    }

    private determineSystemStatus(metrics: SystemMetrics, anomalies: Anomaly[]): SystemStatus {
        if (anomalies.some(a => a.severity === 'high')) {
            return 'critical';
        }
        if (anomalies.some(a => a.severity === 'medium') || this.hasHighMetrics(metrics)) {
            return 'degraded';
        }
        return 'healthy';
    }

    private hasHighMetrics(metrics: SystemMetrics): boolean {
        // Vérifier si les propriétés existent et sont des objets avant d'y accéder
        const resources = metrics.resources && typeof metrics.resources === 'object'
            ? metrics.resources as ResourceMetrics
            : {} as ResourceMetrics;

        const health = metrics.health && typeof metrics.health === 'object'
            ? metrics.health as HealthMetrics
            : {} as HealthMetrics;

        const cpuLoad = resources.cpuLoad ?? 0;
        const memoryUsage = resources.memoryUsage ?? 0;
        const errorCount = health.errorCount ?? 0;

        return (
            cpuLoad > 90 ||
            memoryUsage > 90 ||
            errorCount > 5
        );
    }

    private async generateRecommendations(
        metrics: SystemMetrics,
        anomalies: Anomaly[]
    ): Promise<Array<{
        action: string;
        priority: number;
        impact: string;
    }>> {
        return anomalies.map(anomaly => ({
            action: `Address ${anomaly.type} issue: ${anomaly.details}`,
            priority: this.getPriorityFromSeverity(anomaly.severity),
            impact: `Affects ${anomaly.metrics.name} with deviation of ${anomaly.metrics.deviation}`
        }));
    }

    private getPriorityFromSeverity(severity: 'low' | 'medium' | 'high'): number {
        const priorities = {
            low: 1,
            medium: 2,
            high: 3
        };
        return priorities[severity];
    }
}