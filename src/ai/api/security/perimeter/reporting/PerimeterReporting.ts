// src/ai/api/security/perimeter/reporting/PerimeterReporting.ts

import { SecurityZone, AccessResult } from '@security/types/perimeter-types';

interface ReportCriteria {
    startTime: Date;
    endTime: Date;
    zones?: string[];
    outcomes?: ('allowed' | 'denied')[];
    users?: string[];
}

interface AccessSummary {
    totalRequests: number;
    allowed: number;
    denied: number;
    byZone: Record<string, { attempts: number, allowed: number, denied: number }>;
    byUser: Record<string, { attempts: number, allowed: number, denied: number }>;
    topRulesDenied: Array<{ ruleId: string, count: number }>;
    topResourcesAccessed: Array<{ resource: string, count: number }>;
}

/**
 * Système de génération de rapports pour le périmètre de sécurité
 */
export class PerimeterReporting {
    constructor(
        private readonly getAccessLogs: (criteria: ReportCriteria) => Promise<{
            request: { source: { zone: string }, target: { resource: string }, context: { userId: string } },
            result: AccessResult
        }[]>,
        private readonly getZones: () => Promise<SecurityZone[]>
    ) { }

    /**
     * Génère un rapport de sécurité basé sur les critères fournis
     */
    async generateSecurityReport(criteria: ReportCriteria): Promise<AccessSummary> {
        // Récupérer les logs d'accès selon les critères
        const logs = await this.getAccessLogs(criteria);

        // Initialiser le résumé
        const summary: AccessSummary = {
            totalRequests: logs.length,
            allowed: 0,
            denied: 0,
            byZone: {},
            byUser: {},
            topRulesDenied: [],
            topResourcesAccessed: []
        };

        // Peupler les statistiques
        for (const log of logs) {
            const { request, result } = log;
            const zoneId = request.source.zone;
            const userId = request.context.userId || 'anonymous';
            const resource = request.target.resource;

            // Compteurs globaux
            if (result.allowed) {
                summary.allowed++;
            } else {
                summary.denied++;
            }

            // Compteurs par zone
            if (!summary.byZone[zoneId]) {
                summary.byZone[zoneId] = { attempts: 0, allowed: 0, denied: 0 };
            }
            summary.byZone[zoneId].attempts++;
            if (result.allowed) {
                summary.byZone[zoneId].allowed++;
            } else {
                summary.byZone[zoneId].denied++;
            }

            // Compteurs par utilisateur
            if (!summary.byUser[userId]) {
                summary.byUser[userId] = { attempts: 0, allowed: 0, denied: 0 };
            }
            summary.byUser[userId].attempts++;
            if (result.allowed) {
                summary.byUser[userId].allowed++;
            } else {
                summary.byUser[userId].denied++;
            }

            // Collecter les ressources accédées et les règles déclenchées
            if (result.allowed) {
                this.incrementCountMap(resource, topResourcesMap);
            } else if (result.auditTrail && result.auditTrail.rules.length > 0) {
                for (const ruleId of result.auditTrail.rules) {
                    this.incrementCountMap(ruleId, topRulesDeniedMap);
                }
            }
        }

        // Convertir les maps en tableaux triés
        const topResourcesMap = new Map<string, number>();
        const topRulesDeniedMap = new Map<string, number>();

        summary.topResourcesAccessed = this.mapToSortedArray(topResourcesMap, 'resource');
        summary.topRulesDenied = this.mapToSortedArray(topRulesDeniedMap, 'ruleId');

        return summary;
    }

    /**
     * Génère un profil de sécurité pour une zone spécifique
     */
    async generateZoneSecurityProfile(zoneId: string): Promise<{
        zone: SecurityZone;
        accessStats: {
            daily: { date: string, allowed: number, denied: number }[];
            totalAttempts: number;
            successRate: number;
        };
        rules: {
            total: number;
            byType: Record<string, number>;
            mostTriggered: Array<{ ruleId: string, count: number }>;
        };
        threats: {
            anomaliesDetected: number;
            severityDistribution: Record<string, number>;
            commonThreats: Array<{ type: string, count: number }>;
        };
    }> {
        // Implémenter la génération de profil détaillé pour une zone
        const zone = (await this.getZones()).find(z => z.id === zoneId);
        if (!zone) {
            throw new Error(`Zone not found: ${zoneId}`);
        }

        // Cette implémentation serait complétée avec des données réelles

        return {
            zone,
            accessStats: {
                daily: [],  // Seraient peuplées avec des données réelles
                totalAttempts: 0,
                successRate: 0
            },
            rules: {
                total: zone.rules.length,
                byType: {},
                mostTriggered: []
            },
            threats: {
                anomaliesDetected: 0,
                severityDistribution: {},
                commonThreats: []
            }
        };
    }

    /**
     * Génère un rapport d'intelligence sur les menaces
     */
    async generateThreatIntelligenceReport(): Promise<{
        period: { start: Date, end: Date };
        summary: {
            totalThreats: number;
            criticalThreats: number;
            newThreats: number;
            resolvedThreats: number;
        };
        topThreats: Array<{
            type: string;
            severity: string;
            occurrences: number;
            affectedZones: string[];
        }>;
        trendAnalysis: {
            trend: 'increasing' | 'decreasing' | 'stable';
            percentageChange: number;
            forecast: string;
        };
    }> {
        // Implémenter la génération de rapport d'intelligence
        // Cette implémentation serait complétée avec des données réelles

        return {
            period: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours en arrière
                end: new Date()
            },
            summary: {
                totalThreats: 0,
                criticalThreats: 0,
                newThreats: 0,
                resolvedThreats: 0
            },
            topThreats: [],
            trendAnalysis: {
                trend: 'stable',
                percentageChange: 0,
                forecast: 'No significant changes expected'
            }
        };
    }

    /**
     * Incrémente un compteur dans une Map
     */
    private incrementCountMap(key: string, map: Map<string, number>): void {
        map.set(key, (map.get(key) || 0) + 1);
    }

    /**
     * Convertit une Map en tableau trié
     */
    private mapToSortedArray(map: Map<string, number>, keyName: string): Array<{ [key: string]: string | number }> {
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)  // Top 10
            .map(([key, count]) => ({ [keyName]: key, count }));
    }
}