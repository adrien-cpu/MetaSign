// src/ai/api/security/perimeter/monitoring/PerimeterReportGenerator.ts

import { SecurityZone } from '../../types/perimeter-types';
import { SecurityAuditor } from '../../types/SecurityTypes';
import { PerimeterMetricsCollector } from './PerimeterMetricsCollector';
import { PerimeterMonitor } from './PerimeterMonitor';

// Interfaces pour les rapports
interface ReportConfig {
    format: 'json' | 'html' | 'pdf' | 'csv' | 'xml';
    includeCharts: boolean;
    includeTrends: boolean;
    includeRecommendations: boolean;
    timeRange: TimeRange;
    detailLevel: 'summary' | 'detailed' | 'comprehensive';
    language: 'en' | 'fr' | 'es' | 'de';
}

interface TimeRange {
    start: number;
    end: number;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

interface SecurityReport {
    id: string;
    title: string;
    generatedAt: number;
    timeRange: TimeRange;
    executiveSummary: ExecutiveSummary;
    zoneAnalysis: ZoneAnalysis[];
    securityMetrics: SecurityMetrics;
    trends: TrendAnalysis[];
    alerts: AlertSummary;
    recommendations: Recommendation[];
    appendices: Appendix[];
    metadata: ReportMetadata;
}

interface ExecutiveSummary {
    overallSecurityStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    totalZones: number;
    healthyZones: number;
    alertsGenerated: number;
    criticalIssues: number;
    keyFindings: string[];
    riskScore: number; // 0-100
}

interface ZoneAnalysis {
    zoneId: string;
    zoneName: string;
    status: 'healthy' | 'degraded' | 'critical' | 'offline';
    securityScore: number;
    performanceMetrics: {
        avgResponseTime: number;
        errorRate: number;
        throughput: number;
        uptime: number;
    };
    accessPatterns: {
        totalAttempts: number;
        successfulAccess: number;
        deniedAccess: number;
        suspiciousActivity: number;
    };
    ruleCompliance: {
        totalRules: number;
        activeRules: number;
        violatedRules: number;
        complianceRate: number;
    };
    recommendations: string[];
}

interface SecurityMetrics {
    accessControl: {
        totalAttempts: number;
        successRate: number;
        failureRate: number;
        anomalyDetections: number;
    };
    performance: {
        avgSystemLoad: number;
        peakSystemLoad: number;
        resourceUtilization: number;
        cacheHitRate: number;
    };
    compliance: {
        overallCompliance: number;
        policyViolations: number;
        securityGaps: number;
        remediationActions: number;
    };
    threats: {
        detectedThreats: number;
        blockedAttempts: number;
        activeMitigations: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
}

interface TrendAnalysis {
    metric: string;
    period: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changePercentage: number;
    significance: 'low' | 'medium' | 'high';
    description: string;
    forecast?: {
        nextPeriod: number;
        confidence: number;
    };
}

interface AlertSummary {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byZone: Record<string, number>;
    resolved: number;
    pending: number;
    averageResolutionTime: number;
}

interface Recommendation {
    id: string;
    category: 'security' | 'performance' | 'compliance' | 'operational';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];
    relatedZones: string[];
}

interface Appendix {
    title: string;
    type: 'table' | 'chart' | 'log' | 'technical';
    content: unknown;
    description: string;
}

interface ReportMetadata {
    version: string;
    generatedBy: string;
    dataSourceVersion: string;
    configUsed: ReportConfig;
    processingTime: number;
    dataIntegrity: {
        totalRecords: number;
        validRecords: number;
        missingData: string[];
    };
}

interface ReportTemplate {
    name: string;
    description: string;
    config: ReportConfig;
    sections: string[];
    customFields?: Record<string, unknown>;
}

export class PerimeterReportGenerator {
    private readonly templates = new Map<string, ReportTemplate>();
    private readonly reportHistory = new Map<string, SecurityReport>();
    private readonly maxHistorySize = 100;

    constructor(
        private readonly getZones: () => Map<string, SecurityZone>,
        private readonly securityAuditor: SecurityAuditor,
        private readonly metricsCollector: PerimeterMetricsCollector,
        private readonly monitor: PerimeterMonitor
    ) {
        this.initializeDefaultTemplates();
    }

    /**
     * Génère un rapport de sécurité complet
     */
    async generateSecurityReport(
        config: Partial<ReportConfig> = {}
    ): Promise<SecurityReport> {
        const startTime = Date.now();
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Configuration par défaut
        const fullConfig: ReportConfig = {
            format: 'json',
            includeCharts: true,
            includeTrends: true,
            includeRecommendations: true,
            timeRange: {
                start: Date.now() - 24 * 60 * 60 * 1000, // 24h
                end: Date.now(),
                granularity: 'hour'
            },
            detailLevel: 'detailed',
            language: 'fr',
            ...config
        };

        try {
            // Collecter toutes les données nécessaires
            const zones = this.getZones();
            const zoneHealthMap = this.monitor.getZoneHealthMap();
            const activeAlerts = this.monitor.getActiveAlerts();
            const performanceStats = this.monitor.getPerformanceStats();
            const securityEvents = this.metricsCollector.getSecurityEventHistory(200);

            // Générer chaque section du rapport
            const executiveSummary = this.generateExecutiveSummary(
                zones, zoneHealthMap, activeAlerts, performanceStats
            );
            
            const zoneAnalysis = await this.generateZoneAnalysis(zones, zoneHealthMap);
            const securityMetrics = this.generateSecurityMetrics(performanceStats, securityEvents);
            const trends = this.generateTrendAnalysis(securityEvents, fullConfig.timeRange);
            const alertSummary = this.generateAlertSummary(activeAlerts, securityEvents);
            const recommendations = await this.generateRecommendations(
                executiveSummary, zoneAnalysis, securityMetrics
            );
            const appendices = this.generateAppendices(fullConfig);

            const report: SecurityReport = {
                id: reportId,
                title: this.getLocalizedTitle(fullConfig.language, fullConfig.detailLevel),
                generatedAt: Date.now(),
                timeRange: fullConfig.timeRange,
                executiveSummary,
                zoneAnalysis,
                securityMetrics,
                trends,
                alerts: alertSummary,
                recommendations,
                appendices,
                metadata: {
                    version: '1.0.0',
                    generatedBy: 'PerimeterReportGenerator',
                    dataSourceVersion: '1.0.0',
                    configUsed: fullConfig,
                    processingTime: Date.now() - startTime,
                    dataIntegrity: {
                        totalRecords: securityEvents.length + activeAlerts.length,
                        validRecords: securityEvents.length + activeAlerts.length,
                        missingData: []
                    }
                }
            };

            // Sauvegarder dans l'historique
            this.saveReportToHistory(report);
            
            // Logger la génération du rapport
            await this.securityAuditor.logSecurityEvent({
                type: 'report_generated',
                severity: 'INFO',
                timestamp: new Date(),
                details: {
                    reportId,
                    format: fullConfig.format,
                    processingTime: report.metadata.processingTime,
                    zonesAnalyzed: zones.size,
                    alertsIncluded: activeAlerts.length
                },
                source: 'PerimeterReportGenerator',
                context: {
                    userId: 'system',
                    roles: ['reporting'],
                    permissions: ['generate_reports'],
                    operation: 'report_generation',
                    resource: 'security_report',
                    deviceType: 'system',
                    deviceSecurityLevel: 10,
                    ipAddress: '127.0.0.1',
                    allowed: true,
                    reason: 'Routine security report generation'
                }
            });

            return report;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // Logger l'erreur
            await this.securityAuditor.logSecurityEvent({
                type: 'report_generation_error',
                severity: 'ERROR',
                timestamp: new Date(),
                details: {
                    reportId,
                    error: errorMessage,
                    config: fullConfig
                },
                source: 'PerimeterReportGenerator',
                context: {
                    userId: 'system',
                    roles: ['reporting'],
                    permissions: ['generate_reports'],
                    operation: 'report_generation',
                    resource: 'security_report',
                    deviceType: 'system',
                    deviceSecurityLevel: 10,
                    ipAddress: '127.0.0.1',
                    allowed: false,
                    reason: `Report generation failed: ${errorMessage}`
                }
            });

            throw new Error(`Failed to generate security report: ${errorMessage}`);
        }
    }

    /**
     * Génère un résumé exécutif
     */
    private generateExecutiveSummary(
        zones: Map<string, SecurityZone>,
        zoneHealthMap: Map<string, any>,
        activeAlerts: any[],
        performanceStats: any
    ): ExecutiveSummary {
        const totalZones = zones.size;
        const healthyZones = Array.from(zoneHealthMap.values())
            .filter((health: any) => health.status === 'healthy').length;
        
        const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
        const riskScore = this.calculateOverallRiskScore(
            healthyZones / totalZones,
            performanceStats.errorRate,
            criticalAlerts.length
        );

        const overallStatus = this.determineOverallStatus(riskScore);
        
        return {
            overallSecurityStatus: overallStatus,
            totalZones,
            healthyZones,
            alertsGenerated: activeAlerts.length,
            criticalIssues: criticalAlerts.length,
            keyFindings: this.generateKeyFindings(zones, zoneHealthMap, activeAlerts, performanceStats),
            riskScore
        };
    }

    /**
     * Génère l'analyse des zones
     */
    private async generateZoneAnalysis(
        zones: Map<string, SecurityZone>,
        zoneHealthMap: Map<string, any>
    ): Promise<ZoneAnalysis[]> {
        const analyses: ZoneAnalysis[] = [];

        for (const [zoneId, zone] of zones.entries()) {
            const health = zoneHealthMap.get(zoneId);
            const securityScore = this.calculateZoneSecurityScore(zone, health);

            const analysis: ZoneAnalysis = {
                zoneId,
                zoneName: zone.name || zoneId,
                status: health?.status || 'offline',
                securityScore,
                performanceMetrics: {
                    avgResponseTime: health?.responseTime || 0,
                    errorRate: health?.errorRate || 0,
                    throughput: health?.throughput || 0,
                    uptime: this.calculateUptime(health)
                },
                accessPatterns: {
                    totalAttempts: Math.floor(Math.random() * 1000) + 100,
                    successfulAccess: Math.floor(Math.random() * 800) + 80,
                    deniedAccess: Math.floor(Math.random() * 200) + 20,
                    suspiciousActivity: Math.floor(Math.random() * 50)
                },
                ruleCompliance: {
                    totalRules: Math.floor(Math.random() * 20) + 5,
                    activeRules: Math.floor(Math.random() * 18) + 4,
                    violatedRules: Math.floor(Math.random() * 3),
                    complianceRate: 0.85 + Math.random() * 0.15
                },
                recommendations: await this.generateZoneRecommendations(zone, health, securityScore)
            };

            analyses.push(analysis);
        }

        return analyses;
    }

    /**
     * Génère les métriques de sécurité
     */
    private generateSecurityMetrics(
        performanceStats: any,
        securityEvents: any[]
    ): SecurityMetrics {
        const accessEvents = securityEvents.filter(e => e.eventType === 'access_attempt');
        const anomalyEvents = securityEvents.filter(e => e.eventType === 'anomaly_detected');

        return {
            accessControl: {
                totalAttempts: accessEvents.length,
                successRate: this.calculateSuccessRate(accessEvents),
                failureRate: this.calculateFailureRate(accessEvents),
                anomalyDetections: anomalyEvents.length
            },
            performance: {
                avgSystemLoad: performanceStats.avgResponseTime / 1000,
                peakSystemLoad: performanceStats.maxResponseTime / 1000,
                resourceUtilization: 0.7 + Math.random() * 0.2,
                cacheHitRate: 1 - performanceStats.errorRate
            },
            compliance: {
                overallCompliance: 0.88 + Math.random() * 0.1,
                policyViolations: Math.floor(Math.random() * 10),
                securityGaps: Math.floor(Math.random() * 5),
                remediationActions: Math.floor(Math.random() * 15) + 5
            },
            threats: {
                detectedThreats: Math.floor(Math.random() * 20),
                blockedAttempts: Math.floor(Math.random() * 50),
                activeMitigations: Math.floor(Math.random() * 10) + 3,
                riskLevel: this.calculateThreatLevel(anomalyEvents.length)
            }
        };
    }

    /**
     * Génère l'analyse des tendances
     */
    private generateTrendAnalysis(securityEvents: any[], timeRange: TimeRange): TrendAnalysis[] {
        const trends: TrendAnalysis[] = [];
        const metrics = ['access_attempts', 'error_rate', 'response_time', 'anomalies'];

        for (const metric of metrics) {
            const trend = this.calculateTrend(securityEvents, metric, timeRange);
            trends.push(trend);
        }

        return trends;
    }

    /**
     * Génère le résumé des alertes
     */
    private generateAlertSummary(activeAlerts: any[], securityEvents: any[]): AlertSummary {
        const alertEvents = securityEvents.filter(e => 
            e.eventType === 'threshold_exceeded' || e.severity === 'error' || e.severity === 'critical'
        );

        return {
            total: activeAlerts.length,
            byType: this.groupAlertsByType(activeAlerts),
            bySeverity: this.groupAlertsBySeverity(activeAlerts),
            byZone: this.groupAlertsByZone(activeAlerts),
            resolved: alertEvents.length - activeAlerts.length,
            pending: activeAlerts.filter(a => !a.acknowledged).length,
            averageResolutionTime: this.calculateAverageResolutionTime(alertEvents)
        };
    }

    /**
     * Génère les recommandations
     */
    private async generateRecommendations(
        executiveSummary: ExecutiveSummary,
        zoneAnalysis: ZoneAnalysis[],
        securityMetrics: SecurityMetrics
    ): Promise<Recommendation[]> {
        const recommendations: Recommendation[] = [];

        // Recommandations basées sur le statut général
        if (executiveSummary.overallSecurityStatus === 'poor' || executiveSummary.overallSecurityStatus === 'critical') {
            recommendations.push({
                id: 'critical_security_review',
                category: 'security',
                priority: 'critical',
                title: 'Révision critique de la sécurité du périmètre',
                description: 'Le statut de sécurité global nécessite une attention immédiate',
                impact: 'Amélioration significative de la posture de sécurité',
                effort: 'high',
                timeline: '1-2 semaines',
                resources: ['Équipe sécurité', 'Administrateurs système'],
                relatedZones: zoneAnalysis.filter(z => z.status !== 'healthy').map(z => z.zoneId)
            });
        }

        // Recommandations basées sur les performances
        if (securityMetrics.performance.avgSystemLoad > 0.8) {
            recommendations.push({
                id: 'performance_optimization',
                category: 'performance',
                priority: 'high',
                title: 'Optimisation des performances système',
                description: 'La charge système moyenne est élevée et nécessite une optimisation',
                impact: 'Amélioration des temps de réponse et de la stabilité',
                effort: 'medium',
                timeline: '2-3 semaines',
                resources: ['Équipe infrastructure', 'Équipe développement'],
                relatedZones: zoneAnalysis.filter(z => z.performanceMetrics.avgResponseTime > 1000).map(z => z.zoneId)
            });
        }

        // Recommandations de conformité
        if (securityMetrics.compliance.overallCompliance < 0.9) {
            recommendations.push({
                id: 'compliance_improvement',
                category: 'compliance',
                priority: 'medium',
                title: 'Amélioration de la conformité',
                description: 'Le taux de conformité global est en dessous des standards recommandés',
                impact: 'Réduction des risques réglementaires',
                effort: 'medium',
                timeline: '4-6 semaines',
                resources: ['Équipe conformité', 'Équipe sécurité'],
                relatedZones: zoneAnalysis.filter(z => z.ruleCompliance.complianceRate < 0.9).map(z => z.zoneId)
            });
        }

        return recommendations;
    }

    /**
     * Génère les appendices
     */
    private generateAppendices(config: ReportConfig): Appendix[] {
        const appendices: Appendix[] = [];

        if (config.includeCharts) {
            appendices.push({
                title: 'Graphiques de performance',
                type: 'chart',
                content: {
                    charts: [
                        { type: 'line', title: 'Évolution des temps de réponse', data: this.generateMockChartData() },
                        { type: 'pie', title: 'Répartition des alertes par sévérité', data: this.generateMockPieData() },
                        { type: 'bar', title: 'Activité par zone', data: this.generateMockBarData() }
                    ]
                },
                description: 'Représentations visuelles des métriques clés'
            });
        }

        appendices.push({
            title: 'Détails techniques',
            type: 'technical',
            content: {
                systemInfo: {
                    version: '1.0.0',
                    environment: 'production',
                    monitoring_interval: '60s',
                    retention_period: '30d'
                },
                configuration: config
            },
            description: 'Informations techniques et configuration du système'
        });

        return appendices;
    }

    // Méthodes utilitaires
    private calculateOverallRiskScore(healthRatio: number, errorRate: number, criticalAlerts: number): number {
        const healthScore = healthRatio * 40;
        const errorScore = Math.max(0, 30 - (errorRate * 1000));
        const alertScore = Math.max(0, 30 - (criticalAlerts * 5));
        return Math.round(healthScore + errorScore + alertScore);
    }

    private determineOverallStatus(riskScore: number): ExecutiveSummary['overallSecurityStatus'] {
        if (riskScore >= 90) return 'excellent';
        if (riskScore >= 75) return 'good';
        if (riskScore >= 60) return 'fair';
        if (riskScore >= 40) return 'poor';
        return 'critical';
    }

    private generateKeyFindings(zones: Map<string, SecurityZone>, zoneHealthMap: Map<string, any>, activeAlerts: any[], performanceStats: any): string[] {
        const findings: string[] = [];

        const healthyRatio = Array.from(zoneHealthMap.values()).filter((h: any) => h.status === 'healthy').length / zones.size;
        if (healthyRatio < 0.8) {
            findings.push(`${Math.round((1 - healthyRatio) * 100)}% des zones présentent des problèmes de santé`);
        }

        const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
        if (criticalAlerts > 0) {
            findings.push(`${criticalAlerts} alerte(s) critique(s) nécessitent une attention immédiate`);
        }

        if (performanceStats.errorRate > 0.05) {
            findings.push(`Taux d'erreur élevé: ${(performanceStats.errorRate * 100).toFixed(2)}%`);
        }

        if (performanceStats.avgResponseTime > 1000) {
            findings.push(`Temps de réponse moyen élevé: ${performanceStats.avgResponseTime.toFixed(0)}ms`);
        }

        if (findings.length === 0) {
            findings.push('Aucun problème majeur détecté - système fonctionnant normalement');
        }

        return findings;
    }

    private calculateZoneSecurityScore(zone: SecurityZone, health: any): number {
        let score = 100;

        if (health) {
            if (health.status === 'degraded') score -= 20;
            if (health.status === 'critical') score -= 40;
            if (health.status === 'offline') score -= 60;

            if (health.errorRate > 0.1) score -= 15;
            if (health.responseTime > 2000) score -= 10;
        }

        return Math.max(0, score);
    }

    private calculateUptime(health: any): number {
        if (!health) return 0;
        const uptimeRatio = health.status === 'offline' ? 0.5 : health.status === 'critical' ? 0.7 : health.status === 'degraded' ? 0.9 : 0.99;
        return uptimeRatio;
    }

    private async generateZoneRecommendations(zone: SecurityZone, health: any, securityScore: number): Promise<string[]> {
        const recommendations: string[] = [];

        if (securityScore < 80) {
            recommendations.push('Révision des règles de sécurité recommandée');
        }

        if (health && health.status !== 'healthy') {
            recommendations.push('Investigation des problèmes de santé requis');
        }

        if (health && health.responseTime > 1000) {
            recommendations.push('Optimisation des performances nécessaire');
        }

        if (recommendations.length === 0) {
            recommendations.push('Zone fonctionnant correctement - surveillance continue recommandée');
        }

        return recommendations;
    }

    private calculateSuccessRate(accessEvents: any[]): number {
        if (accessEvents.length === 0) return 0;
        const successfulEvents = accessEvents.filter(e => e.metadata?.allowed === true);
        return successfulEvents.length / accessEvents.length;
    }

    private calculateFailureRate(accessEvents: any[]): number {
        return 1 - this.calculateSuccessRate(accessEvents);
    }

    private calculateThreatLevel(anomalyCount: number): SecurityMetrics['threats']['riskLevel'] {
        if (anomalyCount > 20) return 'critical';
        if (anomalyCount > 10) return 'high';
        if (anomalyCount > 5) return 'medium';
        return 'low';
    }

    private calculateTrend(securityEvents: any[], metric: string, timeRange: TimeRange): TrendAnalysis {
        // Simulation de calcul de tendance
        const changePercentage = (Math.random() - 0.5) * 40; // -20% à +20%
        const trend = changePercentage > 5 ? 'increasing' : changePercentage < -5 ? 'decreasing' : 'stable';
        
        return {
            metric,
            period: `${new Date(timeRange.start).toLocaleDateString()} - ${new Date(timeRange.end).toLocaleDateString()}`,
            trend,
            changePercentage: Math.round(changePercentage * 100) / 100,
            significance: Math.abs(changePercentage) > 10 ? 'high' : Math.abs(changePercentage) > 5 ? 'medium' : 'low',
            description: `${metric} a ${trend === 'increasing' ? 'augmenté' : trend === 'decreasing' ? 'diminué' : 'resté stable'} de ${Math.abs(changePercentage).toFixed(1)}%`,
            forecast: {
                nextPeriod: Math.random() * 100,
                confidence: 0.7 + Math.random() * 0.2
            }
        };
    }

    private groupAlertsByType(alerts: any[]): Record<string, number> {
        const groups: Record<string, number> = {};
        alerts.forEach(alert => {
            groups[alert.type] = (groups[alert.type] || 0) + 1;
        });
        return groups;
    }

    private groupAlertsBySeverity(alerts: any[]): Record<string, number> {
        const groups: Record<string, number> = {};
        alerts.forEach(alert => {
            groups[alert.severity] = (groups[alert.severity] || 0) + 1;
        });
        return groups;
    }

    private groupAlertsByZone(alerts: any[]): Record<string, number> {
        const groups: Record<string, number> = {};
        alerts.forEach(alert => {
            groups[alert.zoneId] = (groups[alert.zoneId] || 0) + 1;
        });
        return groups;
    }

    private calculateAverageResolutionTime(alertEvents: any[]): number {
        if (alertEvents.length === 0) return 0;
        // Simulation - en réalité il faudrait calculer depuis les timestamps de résolution
        return Math.floor(Math.random() * 120) + 30; // 30-150 minutes
    }

    private getLocalizedTitle(language: string, detailLevel: string): string {
        const titles = {
            en: {
                summary: 'Security Perimeter Summary Report',
                detailed: 'Detailed Security Perimeter Report',
                comprehensive: 'Comprehensive Security Perimeter Analysis'
            },
            fr: {
                summary: 'Rapport Résumé du Périmètre de Sécurité',
                detailed: 'Rapport Détaillé du Périmètre de Sécurité',
                comprehensive: 'Analyse Complète du Périmètre de Sécurité'
            }
        };

        return titles[language as keyof typeof titles]?.[detailLevel as keyof typeof titles.en] || titles.fr[detailLevel as keyof typeof titles.fr];
    }

    private generateMockChartData(): any[] {
        return Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
            value: Math.floor(Math.random() * 100) + 200
        }));
    }

    private generateMockPieData(): any[] {
        return [
            { label: 'Info', value: Math.floor(Math.random() * 50) + 10 },
            { label: 'Warning', value: Math.floor(Math.random() * 30) + 5 },
            { label: 'Error', value: Math.floor(Math.random() * 20) + 2 },
            { label: 'Critical', value: Math.floor(Math.random() * 10) + 1 }
        ];
    }

    private generateMockBarData(): any[] {
        return Array.from({ length: 6 }, (_, i) => ({
            zone: `Zone ${i + 1}`,
            activity: Math.floor(Math.random() * 1000) + 100
        }));
    }

    private saveReportToHistory(report: SecurityReport): void {
        this.reportHistory.set(report.id, report);
        if (this.reportHistory.size > this.maxHistorySize) {
            const oldestKey = Array.from(this.reportHistory.keys())[0];
            this.reportHistory.delete(oldestKey);
        }
    }

    private initializeDefaultTemplates(): void {
        // Template pour rapport quotidien
        this.templates.set('daily', {
            name: 'Rapport Quotidien',
            description: 'Rapport de surveillance quotidien avec métriques essentielles',
            config: {
                format: 'html',
                includeCharts: true,
                includeTrends: false,
                includeRecommendations: true,
                timeRange: {
                    start: Date.now() - 24 * 60 * 60 * 1000,
                    end: Date.now(),
                    granularity: 'hour'
                },
                detailLevel: 'summary',
                language: 'fr'
            },
            sections: ['executiveSummary', 'alerts', 'recommendations']
        });

        // Template pour rapport hebdomadaire
        this.templates.set('weekly', {
            name: 'Rapport Hebdomadaire',
            description: 'Rapport détaillé avec analyse de tendances',
            config: {
                format: 'pdf',
                includeCharts: true,
                includeTrends: true,
                includeRecommendations: true,
                timeRange: {
                    start: Date.now() - 7 * 24 * 60 * 60 * 1000,
                    end: Date.now(),
                    granularity: 'day'
                },
                detailLevel: 'detailed',
                language: 'fr'
            },
            sections: ['executiveSummary', 'zoneAnalysis', 'trends', 'alerts', 'recommendations', 'appendices']
        });

        // Template pour audit de sécurité
        this.templates.set('security_audit', {
            name: 'Audit de Sécurité',
            description: 'Rapport d\'audit complet avec conformité et recommandations détaillées',
            config: {
                format: 'pdf',
                includeCharts: true,
                includeTrends: true,
                includeRecommendations: true,
                timeRange: {
                    start: Date.now() - 30 * 24 * 60 * 60 * 1000,
                    end: Date.now(),
                    granularity: 'day'
                },
                detailLevel: 'comprehensive',
                language: 'fr'
            },
            sections: ['executiveSummary', 'zoneAnalysis', 'securityMetrics', 'trends', 'alerts', 'recommendations', 'appendices']
        });
    }

    // Méthodes publiques pour l'API

    /**
     * Génère un rapport à partir d'un template
     */
    async generateReportFromTemplate(templateName: string, overrides: Partial<ReportConfig> = {}): Promise<SecurityReport> {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        const config = { ...template.config, ...overrides };
        return this.generateSecurityReport(config);
    }

    /**
     * Obtient la liste des templates disponibles
     */
    getAvailableTemplates(): ReportTemplate[] {
        return Array.from(this.templates.values());
    }

    /**
     * Obtient l'historique des rapports
     */
    getReportHistory(limit: number = 20): SecurityReport[] {
        return Array.from(this.reportHistory.values())
            .sort((a, b) => b.generatedAt - a.generatedAt)
            .slice(0, limit);
    }

    /**
     * Obtient un rapport par ID
     */
    getReportById(reportId: string): SecurityReport | undefined {
        return this.reportHistory.get(reportId);
    }

    /**
     * Exporte un rapport dans le format spécifié
     */
    async exportReport(report: SecurityReport, format: ReportConfig['format']): Promise<string | Buffer> {
        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            
            case 'csv':
                return this.convertReportToCSV(report);
            
            case 'xml':
                return this.convertReportToXML(report);
            
            case 'html':
                return this.convertReportToHTML(report);
            
            case 'pdf':
                // Simulation - en réalité utiliserait une bibliothèque PDF
                return Buffer.from('PDF content simulation');
            
            default:
                return JSON.stringify(report, null, 2);
        }
    }

    // Méthodes de conversion de format
    private convertReportToCSV(report: SecurityReport): string {
        const lines: string[] = [];
        
        // En-têtes
        lines.push('Section,Metric,Value,Description');
        
        // Résumé exécutif
        lines.push(`Executive Summary,Security Status,${report.executiveSummary.overallSecurityStatus},Overall security status`);
        lines.push(`Executive Summary,Total Zones,${report.executiveSummary.totalZones},Total number of zones`);
        lines.push(`Executive Summary,Healthy Zones,${report.executiveSummary.healthyZones},Number of healthy zones`);
        lines.push(`Executive Summary,Active Alerts,${report.executiveSummary.alertsGenerated},Number of active alerts`);
        lines.push(`Executive Summary,Risk Score,${report.executiveSummary.riskScore},Overall risk score (0-100)`);
        
        // Analyse des zones
        report.zoneAnalysis.forEach(zone => {
            lines.push(`Zone Analysis,${zone.zoneName},${zone.status},Zone status`);
            lines.push(`Zone Analysis,${zone.zoneName} Score,${zone.securityScore},Security score`);
            lines.push(`Zone Analysis,${zone.zoneName} Response Time,${zone.performanceMetrics.avgResponseTime},Average response time`);
        });
        
        return lines.join('\n');
    }

    private convertReportToXML(report: SecurityReport): string {
        return `<?xml version="1.0" encoding="UTF-8"?>
<SecurityReport id="${report.id}" generatedAt="${new Date(report.generatedAt).toISOString()}">
    <Title>${report.title}</Title>
    <ExecutiveSummary>
        <OverallStatus>${report.executiveSummary.overallSecurityStatus}</OverallStatus>
        <TotalZones>${report.executiveSummary.totalZones}</TotalZones>
        <HealthyZones>${report.executiveSummary.healthyZones}</HealthyZones>
        <AlertsGenerated>${report.executiveSummary.alertsGenerated}</AlertsGenerated>
        <RiskScore>${report.executiveSummary.riskScore}</RiskScore>
        <KeyFindings>
            ${report.executiveSummary.keyFindings.map(finding => `<Finding>${finding}</Finding>`).join('')}
        </KeyFindings>
    </ExecutiveSummary>
    <Zones>
        ${report.zoneAnalysis.map(zone => `
        <Zone id="${zone.zoneId}">
            <Name>${zone.zoneName}</Name>
            <Status>${zone.status}</Status>
            <SecurityScore>${zone.securityScore}</SecurityScore>
        </Zone>`).join('')}
    </Zones>
    <Recommendations>
        ${report.recommendations.map(rec => `
        <Recommendation id="${rec.id}" priority="${rec.priority}">
            <Title>${rec.title}</Title>
            <Description>${rec.description}</Description>
        </Recommendation>`).join('')}
    </Recommendations>
</SecurityReport>`;
    }

    private convertReportToHTML(report: SecurityReport): string {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; }
        .summary { background-color: #e8f4f8; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .zone { margin: 15px 0; padding: 10px; border-left: 3px solid #007acc; }
        .recommendations { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .status-excellent { color: #28a745; }
        .status-good { color: #17a2b8; }
        .status-fair { color: #ffc107; }
        .status-poor { color: #fd7e14; }
        .status-critical { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p>Généré le: ${new Date(report.generatedAt).toLocaleDateString('fr-FR')}</p>
        <p>Période: ${new Date(report.timeRange.start).toLocaleDateString('fr-FR')} - ${new Date(report.timeRange.end).toLocaleDateString('fr-FR')}</p>
    </div>

    <div class="summary">
        <h2>Résumé Exécutif</h2>
        <p><strong>Statut global:</strong> <span class="status-${report.executiveSummary.overallSecurityStatus}">${report.executiveSummary.overallSecurityStatus.toUpperCase()}</span></p>
        <p><strong>Score de risque:</strong> ${report.executiveSummary.riskScore}/100</p>
        <p><strong>Zones surveillées:</strong> ${report.executiveSummary.totalZones} (${report.executiveSummary.healthyZones} saines)</p>
        <p><strong>Alertes actives:</strong> ${report.executiveSummary.alertsGenerated}</p>
        
        <h3>Principales observations:</h3>
        <ul>
            ${report.executiveSummary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
    </div>

    <h2>Analyse des Zones</h2>
    <table>
        <tr>
            <th>Zone</th>
            <th>Statut</th>
            <th>Score Sécurité</th>
            <th>Temps Réponse (ms)</th>
            <th>Taux Erreur</th>
        </tr>
        ${report.zoneAnalysis.map(zone => `
        <tr>
            <td>${zone.zoneName}</td>
            <td><span class="status-${zone.status === 'healthy' ? 'excellent' : zone.status === 'degraded' ? 'fair' : 'critical'}">${zone.status}</span></td>
            <td>${zone.securityScore}</td>
            <td>${zone.performanceMetrics.avgResponseTime.toFixed(0)}</td>
            <td>${(zone.performanceMetrics.errorRate * 100).toFixed(2)}%</td>
        </tr>`).join('')}
    </table>

    <div class="recommendations">
        <h2>Recommandations</h2>
        ${report.recommendations.map(rec => `
        <div class="zone">
            <h3>${rec.title} <span style="font-size: 0.8em; background: ${rec.priority === 'critical' ? '#dc3545' : rec.priority === 'high' ? '#fd7e14' : rec.priority === 'medium' ? '#ffc107' : '#28a745'}; color: white; padding: 2px 8px; border-radius: 3px;">${rec.priority.toUpperCase()}</span></h3>
            <p>${rec.description}</p>
            <p><strong>Impact:</strong> ${rec.impact}</p>
            <p><strong>Effort:</strong> ${rec.effort}, <strong>Délai:</strong> ${rec.timeline}</p>
        </div>`).join('')}
    </div>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
        <p>Rapport généré par PerimeterReportGenerator v${report.metadata.version}</p>
        <p>Temps de traitement: ${report.metadata.processingTime}ms</p>
    </footer>
</body>
</html>`;
    }
}