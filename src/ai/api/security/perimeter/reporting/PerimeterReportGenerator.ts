// src/ai/api/security/perimeter/reporting/PerimeterReportGenerator.ts

import { SecurityZone, AccessResult } from '../../types/perimeter-types';

// Interface étendue pour les rapports avec plus de détails
interface ExtendedAccessResult extends AccessResult {
    timestamp?: number;
    sourceIP?: string;
    userAgent?: string;
    ruleDeniedBy?: string;
    zoneId?: string;
    userId?: string;
    resource?: string;
}

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

export class PerimeterReportGenerator {
    constructor(
        private readonly getAccessLogs: (criteria: ReportCriteria) => Promise<ExtendedAccessResult[]>,
        private readonly getZones: () => Promise<SecurityZone[]>
    ) { }

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

        // Calculer les statistiques
        const ruleCounts: Record<string, number> = {};
        const resourceCounts: Record<string, number> = {};
        
        logs.forEach(log => {
            // Compter par zone
            const zoneId = log.zoneId || 'unknown';
            if (!summary.byZone[zoneId]) {
                summary.byZone[zoneId] = { attempts: 0, allowed: 0, denied: 0 };
            }
            summary.byZone[zoneId].attempts++;
            
            if (log.allowed) {
                summary.allowed++;
                summary.byZone[zoneId].allowed++;
            } else {
                summary.denied++;
                summary.byZone[zoneId].denied++;
            }
            
            // Compter par utilisateur
            const userId = log.userId || 'unknown';
            if (!summary.byUser[userId]) {
                summary.byUser[userId] = { attempts: 0, allowed: 0, denied: 0 };
            }
            summary.byUser[userId].attempts++;
            
            if (log.allowed) {
                summary.byUser[userId].allowed++;
            } else {
                summary.byUser[userId].denied++;
            }
            
            // Compter les règles qui ont refusé l'accès
            if (!log.allowed && log.ruleDeniedBy) {
                ruleCounts[log.ruleDeniedBy] = (ruleCounts[log.ruleDeniedBy] || 0) + 1;
            }
            
            // Compter les ressources accédées
            if (log.resource) {
                resourceCounts[log.resource] = (resourceCounts[log.resource] || 0) + 1;
            }
        });
        
        // Trier les règles les plus fréquemment utilisées pour bloquer
        summary.topRulesDenied = Object.entries(ruleCounts)
            .map(([ruleId, count]) => ({ ruleId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
            
        // Trier les ressources les plus accédées
        summary.topResourcesAccessed = Object.entries(resourceCounts)
            .map(([resource, count]) => ({ resource, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return summary;
    }

    async generateZoneSecurityProfile(zoneId: string): Promise<{
        zoneId: string;
        zoneName: string;
        securityLevel: number;
        accessPatterns: {
            dailyAttempts: number;
            successRate: number;
            peakHours: string[];
        };
        threats: {
            suspiciousAttempts: number;
            blockedIPs: string[];
            anomalies: number;
        };
        recommendations: string[];
    }> {
        // Récupérer les zones pour trouver les détails de la zone
        const zones = await this.getZones();
        const zone = zones.find(z => z.id === zoneId);
        
        if (!zone) {
            throw new Error(`Zone with ID ${zoneId} not found`);
        }

        // Récupérer les logs pour cette zone spécifique
        const zoneCriteria: ReportCriteria = {
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
            endTime: new Date(),
            zones: [zoneId]
        };
        
        const zoneLogs = await this.getAccessLogs(zoneCriteria);
        
        // Calculer les métriques de sécurité pour cette zone
        const allowedAttempts = zoneLogs.filter(log => log.allowed).length;
        const totalAttempts = zoneLogs.length;
        const successRate = totalAttempts > 0 ? allowedAttempts / totalAttempts : 0;
        
        // Analyser les patterns temporels
        const hourlyActivity = this.analyzeHourlyActivity(zoneLogs);
        const peakHours = this.identifyPeakHours(hourlyActivity);
        
        // Détecter les menaces
        const suspiciousAttempts = this.detectSuspiciousActivity(zoneLogs);
        const blockedIPs = this.identifyBlockedIPs(zoneLogs);
        
        // Calculer le niveau de sécurité (0-100)
        const securityLevel = this.calculateSecurityLevel(successRate, suspiciousAttempts.length, zone);
        
        return {
            zoneId,
            zoneName: zone.name || `Zone ${zoneId}`,
            securityLevel,
            accessPatterns: {
                dailyAttempts: Math.round(totalAttempts / 7),
                successRate,
                peakHours
            },
            threats: {
                suspiciousAttempts: suspiciousAttempts.length,
                blockedIPs,
                anomalies: this.detectAnomalies(zoneLogs).length
            },
            recommendations: this.generateZoneRecommendations(securityLevel, successRate, suspiciousAttempts.length)
        };
    }

    async generateThreatIntelligenceReport(): Promise<{
        summary: {
            totalThreats: number;
            activeMitigations: number;
            riskLevel: 'low' | 'medium' | 'high' | 'critical';
        };
        topThreats: Array<{
            type: string;
            count: number;
            severity: string;
            trend: 'increasing' | 'decreasing' | 'stable';
        }>;
        attackVectors: Array<{
            vector: string;
            attempts: number;
            successRate: number;
        }>;
        recommendations: string[];
    }> {
        // Récupérer tous les logs récents pour l'analyse des menaces
        const criteria: ReportCriteria = {
            startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
            endTime: new Date()
        };
        
        const allLogs = await this.getAccessLogs(criteria);
        const deniedLogs = allLogs.filter(log => !log.allowed);
        
        // Analyser les types de menaces
        const threatTypes = this.analyzeThreatTypes(deniedLogs);
        const attackVectors = this.analyzeAttackVectors(deniedLogs);
        
        // Calculer le niveau de risque global
        const riskLevel = this.calculateGlobalRiskLevel(deniedLogs, allLogs);
        
        return {
            summary: {
                totalThreats: deniedLogs.length,
                activeMitigations: this.countActiveMitigations(deniedLogs),
                riskLevel
            },
            topThreats: threatTypes.slice(0, 10),
            attackVectors: attackVectors.slice(0, 5),
            recommendations: this.generateThreatRecommendations(riskLevel, threatTypes)
        };
    }

    // Méthodes utilitaires privées
    private analyzeHourlyActivity(logs: ExtendedAccessResult[]): Record<number, number> {
        const hourlyCount: Record<number, number> = {};
        
        for (let hour = 0; hour < 24; hour++) {
            hourlyCount[hour] = 0;
        }
        
        logs.forEach(log => {
            const timestamp = log.timestamp || Date.now();
            const hour = new Date(timestamp).getHours();
            hourlyCount[hour]++;
        });
        
        return hourlyCount;
    }
    
    private identifyPeakHours(hourlyActivity: Record<number, number>): string[] {
        const maxActivity = Math.max(...Object.values(hourlyActivity));
        const threshold = maxActivity * 0.8; // 80% du pic
        
        return Object.entries(hourlyActivity)
            .filter(([, count]) => count >= threshold)
            .map(([hour]) => `${hour}:00-${hour}:59`)
            .slice(0, 3);
    }
    
    private detectSuspiciousActivity(logs: ExtendedAccessResult[]): ExtendedAccessResult[] {
        // Détecter les activités suspectes (ex: trop de tentatives échouées rapidement)
        const suspiciousLogs: ExtendedAccessResult[] = [];
        const ipAttempts: Record<string, ExtendedAccessResult[]> = {};
        
        // Grouper par IP
        logs.forEach(log => {
            const ip = log.sourceIP || 'unknown';
            if (!ipAttempts[ip]) ipAttempts[ip] = [];
            ipAttempts[ip].push(log);
        });
        
        // Identifier les IPs avec trop de tentatives échouées
        Object.entries(ipAttempts).forEach(([ip, attempts]) => {
            const deniedAttempts = attempts.filter(a => !a.allowed);
            if (deniedAttempts.length > 10) { // Seuil de suspicion
                console.log(`Suspicious activity detected from IP: ${ip} (${deniedAttempts.length} denied attempts)`);
                suspiciousLogs.push(...deniedAttempts);
            }
        });
        
        return suspiciousLogs;
    }
    
    private identifyBlockedIPs(logs: ExtendedAccessResult[]): string[] {
        const deniedLogs = logs.filter(log => !log.allowed);
        const ipCounts: Record<string, number> = {};
        
        deniedLogs.forEach(log => {
            const ip = log.sourceIP || 'unknown';
            ipCounts[ip] = (ipCounts[ip] || 0) + 1;
        });
        
        // Retourner les IPs avec plus de 5 tentatives bloquées
        return Object.entries(ipCounts)
            .filter(([, count]) => count > 5)
            .map(([ip]) => ip)
            .slice(0, 10);
    }
    
    private detectAnomalies(logs: ExtendedAccessResult[]): ExtendedAccessResult[] {
        // Détecter les anomalies temporelles (accès à des heures inhabituelles)
        return logs.filter(log => {
            const timestamp = log.timestamp || Date.now();
            const hour = new Date(timestamp).getHours();
            return hour < 6 || hour > 22; // Accès en dehors des heures normales
        });
    }
    
    private calculateSecurityLevel(successRate: number, suspiciousCount: number, zone: SecurityZone): number {
        let score = 100;
        
        // Pénalité pour taux d'échec élevé
        score -= (1 - successRate) * 30;
        
        // Pénalité pour activités suspectes
        score -= Math.min(suspiciousCount * 2, 30);
        
        // Bonus pour zone sécurisée (simulation basée sur l'ID)
        if (zone.id.includes('secure') || zone.id.includes('admin')) {
            score += 10;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    private generateZoneRecommendations(securityLevel: number, successRate: number, suspiciousCount: number): string[] {
        const recommendations: string[] = [];
        
        if (securityLevel < 70) {
            recommendations.push('Révision urgente des règles de sécurité de cette zone');
        }
        
        if (successRate < 0.8) {
            recommendations.push('Analyser les causes des échecs d\'accès fréquents');
        }
        
        if (suspiciousCount > 10) {
            recommendations.push('Mise en place de filtrage IP renforcé');
            recommendations.push('Activation du monitoring en temps réel');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Zone sécurisée - maintenir la surveillance courante');
        }
        
        return recommendations;
    }
    
    private analyzeThreatTypes(deniedLogs: ExtendedAccessResult[]): Array<{
        type: string;
        count: number;
        severity: string;
        trend: 'increasing' | 'decreasing' | 'stable';
    }> {
        const threatCounts: Record<string, number> = {};
        
        deniedLogs.forEach(log => {
            const threatType = this.classifyThreat(log);
            threatCounts[threatType] = (threatCounts[threatType] || 0) + 1;
        });
        
        return Object.entries(threatCounts)
            .map(([type, count]) => ({
                type,
                count,
                severity: count > 50 ? 'high' : count > 20 ? 'medium' : 'low',
                trend: 'stable' as const // Simulation - en réalité comparerait avec période précédente
            }))
            .sort((a, b) => b.count - a.count);
    }
    
    private classifyThreat(log: ExtendedAccessResult): string {
        // Classification simple basée sur les propriétés du log
        if (log.sourceIP && this.isKnownMaliciousIP(log.sourceIP)) {
            return 'Malicious IP';
        }
        if (log.userAgent && log.userAgent.includes('bot')) {
            return 'Automated Bot';
        }
        if (log.ruleDeniedBy && log.ruleDeniedBy.includes('rate')) {
            return 'Rate Limiting';
        }
        return 'Access Violation';
    }
    
    private isKnownMaliciousIP(ip: string): boolean {
        // Simulation - en réalité consulterait une base de données de réputation
        const suspiciousPatterns = ['192.168.', '10.0.0.', '172.16.'];
        return !suspiciousPatterns.some(pattern => ip.startsWith(pattern));
    }
    
    private analyzeAttackVectors(deniedLogs: ExtendedAccessResult[]): Array<{
        vector: string;
        attempts: number;
        successRate: number;
    }> {
        const vectors: Record<string, { attempts: number; successes: number }> = {};
        
        deniedLogs.forEach(log => {
            const vector = log.ruleDeniedBy || 'Unknown';
            if (!vectors[vector]) vectors[vector] = { attempts: 0, successes: 0 };
            vectors[vector].attempts++;
        });
        
        return Object.entries(vectors)
            .map(([vector, stats]) => ({
                vector,
                attempts: stats.attempts,
                successRate: stats.attempts > 0 ? stats.successes / stats.attempts : 0
            }))
            .sort((a, b) => b.attempts - a.attempts);
    }
    
    private calculateGlobalRiskLevel(deniedLogs: ExtendedAccessResult[], allLogs: ExtendedAccessResult[]): 'low' | 'medium' | 'high' | 'critical' {
        const denialRate = allLogs.length > 0 ? deniedLogs.length / allLogs.length : 0;
        
        if (denialRate > 0.5) return 'critical';
        if (denialRate > 0.3) return 'high';
        if (denialRate > 0.1) return 'medium';
        return 'low';
    }
    
    private countActiveMitigations(deniedLogs: ExtendedAccessResult[]): number {
        // Compter les différents types de règles qui ont bloqué des accès
        const uniqueRules = new Set(deniedLogs.map(log => log.ruleDeniedBy).filter(Boolean));
        return uniqueRules.size;
    }
    
    private generateThreatRecommendations(riskLevel: string, threatTypes: Array<{ type: string; count: number }>): string[] {
        const recommendations: string[] = [];
        
        if (riskLevel === 'critical' || riskLevel === 'high') {
            recommendations.push('Activation immédiate du mode de sécurité renforcé');
            recommendations.push('Audit complet des règles de sécurité');
        }
        
        const topThreat = threatTypes[0];
        if (topThreat && topThreat.count > 100) {
            recommendations.push(`Renforcement spécifique contre: ${topThreat.type}`);
        }
        
        if (threatTypes.length > 10) {
            recommendations.push('Mise en place de filtrage adaptatif par IA');
        }
        
        recommendations.push('Révision mensuelle des patterns de menaces');
        
        return recommendations;
    }
}