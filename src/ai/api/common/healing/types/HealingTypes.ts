/**
 * src/ai/api/common/healing/types/HealingTypes.ts
 * @file HealingTypes.ts
 * @description
 * Types et interfaces pour la guérison des anomalies
 * Utilisés pour la guérison des anomalies détectées dans les systèmes distribués
 * Centralisation des types pour la guérison des anomalies
 * dans les systèmes distribués
 * Utilisés pour la guérison des anomalies détectées dans les systèmes distribués
 * et pour l'analyse des tendances
 */
import { Anomaly } from '../../detection/types/AnomalyTypes';

// Définition locale de ImpactAnalysis puisqu'elle n'est pas exportée par UnifiedTypes
export interface ImpactAnalysis {
    severity: 'low' | 'medium' | 'high';
    affectedComponents: string[];
    recommendations: string[];
}

export type AnomalyType = 'performance' | 'memory' | 'network' | 'security' | 'resource' | 'system';

export interface HealingStrategy {
    name: string;
    type: AnomalyType;
    priority: number;
    conditions: (anomaly: Anomaly) => boolean;
    action: (anomaly: Anomaly) => Promise<boolean>;
    rollback?: () => Promise<void>;
    impact: ImpactAnalysis;
}

export interface HealingResult {
    success: boolean;
    anomaly: Anomaly;
    strategy: HealingStrategy;
    timestamp: number;
    actions: string[];
    metrics: {
        duration: number;
        resourceUsage: number;
        effectiveness: number;
    };
    error?: string;
}

export interface HealingPlan {
    id: string;
    anomalies: Anomaly[];
    strategies: HealingStrategy[];
    priority: number;
    estimatedImpact: ImpactAnalysis;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    createdAt: number;
    updatedAt: number;
    metrics?: {
        successRate: number;
        averageExecutionTime: number;
        resourceUtilization: number;
    };
}

export interface HealingAction {
    type: string;
    params: Record<string, unknown>;
    priority: number;
    prerequisites?: string[];
    rollbackSteps?: string[];
    timeout: number;
    retry: {
        count: number;
        delay: number;
    };
}

export interface HealingMetrics {
    totalAttempts: number;
    successfulHeals: number;
    failedHeals: number;
    averageHealingTime: number;
    resourceUtilization: number;
    lastHealingTime?: number;
    errorRates: Record<string, number>;
}