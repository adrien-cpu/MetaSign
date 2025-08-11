// src/api/security/fraud/FraudDetectionSystem.ts
import { SecurityEventMonitor } from '../monitoring/SecurityEventMonitor';
import { SecurityMetricsCollector } from '../metrics/SecurityMetricsCollector';
import { SecurityEventSeverity } from '../types/SecurityTypes';
import { AuditTrailManager } from '../audit/AuditTrailManager';

// Définition des interfaces manquantes
export enum RiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface BehaviorData {
    userId?: string;
    timestamp: number;
    failedAttempts: number;
    requestsPerMinute: number;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: unknown;
}

export interface FraudAlert {
    level: RiskLevel;
    description: string;
    timestamp: Date;
    data: BehaviorData;
}

export interface FraudDetectionMetrics {
    timestamp: Date;
    riskScore: number;
    alerts: FraudAlert[];
}

export interface BehaviorPattern {
    id: string;
    riskWeight: number;
    matches: (behavior: BehaviorData) => Promise<boolean>;
    thresholds?: Record<string, number>;
}

export class FraudDetectionSystem {
    private eventMonitor: SecurityEventMonitor;
    private metricsCollector: SecurityMetricsCollector;
    private behaviorPatterns: Map<string, BehaviorPattern>;
    private auditManager: AuditTrailManager;

    constructor() {
        this.eventMonitor = new SecurityEventMonitor();
        this.metricsCollector = new SecurityMetricsCollector();
        this.behaviorPatterns = new Map();
        this.auditManager = new AuditTrailManager();
        this.initializePatterns();
    }

    private initializePatterns(): void {
        this.behaviorPatterns.set('multiple_failed_auth', {
            id: 'multiple_failed_auth',
            riskWeight: 0.4,
            matches: async (behavior: BehaviorData) => behavior.failedAttempts > 3
        });

        this.behaviorPatterns.set('unusual_time_access', {
            id: 'unusual_time_access',
            riskWeight: 0.3,
            matches: async (behavior: BehaviorData) => {
                const hour = new Date(behavior.timestamp).getHours();
                return hour < 6 || hour > 22;
            }
        });

        this.behaviorPatterns.set('rapid_sequence', {
            id: 'rapid_sequence',
            riskWeight: 0.5,
            matches: async (behavior: BehaviorData) => {
                return behavior.requestsPerMinute > 100;
            }
        });
    }

    public async detectAnomalies(userBehavior: BehaviorData): Promise<FraudAlert[]> {
        const alerts: FraudAlert[] = [];
        const riskScore = await this.calculateRiskScore(userBehavior);

        if (riskScore > 0.7) {
            const alert: FraudAlert = {
                level: RiskLevel.HIGH,
                description: 'Comportement potentiellement frauduleux détecté',
                timestamp: new Date(),
                data: userBehavior
            };
            alerts.push(alert);

            await this.auditManager.logSecurityEvent({
                type: 'FRAUD_DETECTION',
                severity: this.mapRiskLevelToSeverity(RiskLevel.HIGH),
                details: alert,
                source: 'FraudDetectionSystem'
            });
        }

        // Enregistrement des métriques (méthode modifiée pour fonctionner avec l'interface existante)
        this.recordFraudDetection({
            timestamp: new Date(),
            riskScore,
            alerts
        });

        return alerts;
    }

    /**
     * Enregistre les métriques de détection de fraude
     * (En l'absence de la méthode correspondante dans SecurityMetricsCollector)
     */
    private recordFraudDetection(metrics: FraudDetectionMetrics): void {
        // Implémentation temporaire - à adapter selon l'interface réelle
        console.log('Fraud detection metrics:', metrics);

        // Si SecurityMetricsCollector a une méthode générique pour enregistrer des métriques
        // Exemple: this.metricsCollector.recordMetric('fraud_detection', metrics);
    }

    /**
     * Convertit un niveau de risque en sévérité d'événement de sécurité
     */
    private mapRiskLevelToSeverity(level: RiskLevel): SecurityEventSeverity {
        switch (level) {
            case RiskLevel.LOW:
                return SecurityEventSeverity.INFO;
            case RiskLevel.MEDIUM:
                return SecurityEventSeverity.WARNING;
            case RiskLevel.HIGH:
                return SecurityEventSeverity.ERROR;
            case RiskLevel.CRITICAL:
                return SecurityEventSeverity.CRITICAL;
            default:
                return SecurityEventSeverity.INFO;
        }
    }

    private async calculateRiskScore(behavior: BehaviorData): Promise<number> {
        let score = 0;
        const matchResults = await Promise.all(
            Array.from(this.behaviorPatterns.values()).map(async pattern => {
                const matches = await pattern.matches(behavior);
                return matches ? pattern.riskWeight : 0;
            })
        );

        score = matchResults.reduce((acc: number, weight: number) => acc + weight, 0);
        return Math.min(score, 1);
    }
}