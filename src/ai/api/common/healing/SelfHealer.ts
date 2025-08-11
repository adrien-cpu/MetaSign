/**
 * src/ai/api/common/healing/SelfHealer.ts
 * @file SelfHealer.ts
 * @description
 * Classe SelfHealer pour la guérison des anomalies détectées
 * Utilisée pour la guérison des anomalies détectées dans les systèmes distribués
 * Centralisation de la logique de guérison des anomalies
 * dans les systèmes distribués
 */
import { Anomaly } from '../detection/types/AnomalyTypes';
import { IAnomalyDetector } from '../detection/interfaces/IAnomalyDetector';
import {
    HealingStrategy,
    HealingResult,
    HealingPlan,
    HealingMetrics,
    AnomalyType,
    HealingAction,
    ImpactAnalysis
} from './types/HealingTypes';

export class SelfHealer {
    private readonly anomalyDetector: IAnomalyDetector;
    private healingStrategies: Map<AnomalyType, HealingStrategy>;
    private metrics: HealingMetrics;

    constructor(anomalyDetector: IAnomalyDetector) {
        this.anomalyDetector = anomalyDetector;
        this.healingStrategies = new Map();
        this.metrics = this.initializeMetrics();
    }

    private initializeMetrics(): HealingMetrics {
        return {
            totalAttempts: 0,
            successfulHeals: 0,
            failedHeals: 0,
            averageHealingTime: 0,
            resourceUtilization: 0,
            errorRates: {}
        };
    }

    async heal(anomalies: Anomaly[]): Promise<HealingResult[]> {
        try {
            const prioritizedAnomalies = this.prioritizeAnomalies(anomalies);
            const healingPlan = await this.createHealingPlan(prioritizedAnomalies);
            return await this.executeHealingPlan(healingPlan);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error during healing process';
            throw new Error(`Healing process failed: ${errorMessage}`);
        }
    }

    private prioritizeAnomalies(anomalies: Anomaly[]): Anomaly[] {
        return [...anomalies].sort((a1, a2) => {
            const severityScore = this.getSeverityScore(a2.severity) - this.getSeverityScore(a1.severity);
            if (severityScore !== 0) return severityScore;

            const timeScore = a2.timestamp - a1.timestamp;
            return timeScore;
        });
    }

    private getSeverityScore(severity: 'low' | 'medium' | 'high'): number {
        const scores = { low: 1, medium: 2, high: 3 } as const;
        return scores[severity];
    }

    private async executeHealingPlan(plan: HealingPlan): Promise<HealingResult[]> {
        const results: HealingResult[] = [];
        const startTime = Date.now();

        for (const anomaly of plan.anomalies) {
            const strategy = this.determineStrategy(anomaly);
            if (!strategy) continue;

            try {
                const success = await strategy.action(anomaly);
                results.push(this.createHealingResult(anomaly, strategy, success));
            } catch (error) {
                if (strategy.rollback) {
                    await strategy.rollback();
                }
                results.push(this.createErrorResult(anomaly, strategy, error));
            }
        }

        this.updateMetrics(results, Date.now() - startTime);
        return results;
    }

    async createHealingPlan(anomalies: Anomaly[]): Promise<HealingPlan> {
        const strategies = anomalies.map(anomaly => {
            const action = this.determineAction(anomaly);
            const impact = this.assessImpact(anomaly, action);
            return this.createStrategy(anomaly, action, impact);
        });

        return {
            id: `heal-${Date.now()}`,
            anomalies,
            strategies,
            priority: this.calculatePlanPriority(anomalies),
            estimatedImpact: this.assessImpact(anomalies[0], strategies[0]),
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }

    private createStrategy(anomaly: Anomaly, action: HealingAction, impact: ImpactAnalysis): HealingStrategy {
        const type = this.determineAnomalyType(anomaly);
        return {
            name: `${type}HealingStrategy`,
            type,
            priority: action.priority,
            conditions: (a: Anomaly) => this.determineAnomalyType(a) === type,
            action: async () => {
                // Implémenter la logique d'action spécifique
                return true;
            },
            rollback: async () => {
                // Implémenter la logique de rollback
            },
            impact
        };
    }

    private determineStrategy(anomaly: Anomaly): HealingStrategy | undefined {
        const type = this.determineAnomalyType(anomaly);
        return this.healingStrategies.get(type);
    }

    private determineAction(anomaly: Anomaly): HealingAction {
        const type = this.determineAnomalyType(anomaly);
        return {
            type: `heal${this.capitalizeFirstLetter(type)}`,
            params: this.getActionParams(anomaly),
            priority: this.getActionPriority(anomaly),
            timeout: 30000,
            retry: { count: 3, delay: 1000 }
        };
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private determineAnomalyType(anomaly: Anomaly): AnomalyType {
        // Logique de détermination du type d'anomalie basée sur les métriques et le contexte
        if (anomaly.metricName.includes('memory')) return 'memory';
        if (anomaly.metricName.includes('cpu')) return 'performance';
        if (anomaly.metricName.includes('network')) return 'network';
        if (anomaly.metricName.includes('security')) return 'security';
        if (anomaly.metricName.includes('resource')) return 'resource';
        return 'system';
    }

    private calculatePlanPriority(anomalies: Anomaly[]): number {
        return anomalies.reduce((priority, anomaly) => {
            const severityScore = this.getSeverityScore(anomaly.severity);
            const timeScore = (Date.now() - anomaly.timestamp) / 1000;
            return priority + (severityScore * (1 + 1 / timeScore));
        }, 0) / anomalies.length;
    }

    private assessImpact(anomaly: Anomaly, strategy: HealingStrategy | HealingAction): ImpactAnalysis {
        return {
            severity: anomaly.severity,
            affectedComponents: [anomaly.metricName],
            recommendations: [`Apply ${strategy.type} healing action`]
        };
    }

    private getActionParams(anomaly: Anomaly): Record<string, unknown> {
        return {
            metric: anomaly.metricName,
            threshold: anomaly.value,
            timestamp: anomaly.timestamp
        };
    }

    private getActionPriority(anomaly: Anomaly): number {
        return this.getSeverityScore(anomaly.severity);
    }

    private createHealingResult(
        anomaly: Anomaly,
        strategy: HealingStrategy,
        success: boolean
    ): HealingResult {
        return {
            success,
            anomaly,
            strategy,
            timestamp: Date.now(),
            actions: [`Applied ${strategy.name}`],
            metrics: {
                duration: 0,
                resourceUsage: 0,
                effectiveness: success ? 1 : 0
            }
        };
    }

    private createErrorResult(
        anomaly: Anomaly,
        strategy: HealingStrategy,
        error: unknown
    ): HealingResult {
        return {
            success: false,
            anomaly,
            strategy,
            timestamp: Date.now(),
            actions: [`Failed to apply ${strategy.name}`],
            metrics: {
                duration: 0,
                resourceUsage: 0,
                effectiveness: 0
            },
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }

    private updateMetrics(results: HealingResult[], duration: number): void {
        const successful = results.filter(r => r.success).length;
        const total = results.length;

        this.metrics = {
            ...this.metrics,
            totalAttempts: this.metrics.totalAttempts + total,
            successfulHeals: this.metrics.successfulHeals + successful,
            failedHeals: this.metrics.failedHeals + (total - successful),
            averageHealingTime: (this.metrics.averageHealingTime + duration) / 2,
            lastHealingTime: Date.now()
        };
    }

    public getMetrics(): HealingMetrics {
        return { ...this.metrics };
    }
}