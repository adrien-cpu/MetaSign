// src/ai/api/security/protection/ThreatDetector.ts

import { SecurityContext, SecurityEvent, SecurityEventSeverity } from '../types/SecurityTypes';
import { AuditManager } from '../audit/AuditManager';

interface ThreatPattern {
    id: string;
    name: string;
    type: 'behavior' | 'access' | 'anomaly' | 'pattern';
    severity: 'low' | 'medium' | 'high';
    threshold: number;
    timeWindow: number; // en millisecondes
    description: string;
    analyze: (context: SecurityContext, history: SecurityEvent[]) => Promise<boolean>;
}

interface ThreatDetection {
    patternId: string;
    timestamp: number;
    context: SecurityContext;
    severity: 'low' | 'medium' | 'high';
    details: Record<string, unknown>;
}

interface BehaviorProfile {
    userId: string;
    normalPatterns: {
        accessTimes: number[];
        commonIPs: Set<string>;
        avgRequestRate: number;
        commonOperations: Set<string>;
    };
    lastUpdated: number;
}

interface ExtendedAuditManager {
    logSecurityEvent(event: unknown): Promise<void>;
}

export class ThreatDetector {
    private readonly threatPatterns: ThreatPattern[] = [];
    private readonly detectionHistory = new Map<string, ThreatDetection[]>();
    private readonly behaviorProfiles = new Map<string, BehaviorProfile>();
    private readonly eventHistory: SecurityEvent[] = [];
    private readonly EVENT_HISTORY_LIMIT = 1000;
    private readonly PROFILE_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures

    constructor(private readonly auditManager: AuditManager) {
        this.initializeThreatPatterns();
    }

    async analyze(context: SecurityContext): Promise<void> {
        try {
            this.updateEventHistory(context);
            await this.updateBehaviorProfile(context);

            const detectedThreats = await this.detectThreats(context);
            if (detectedThreats.length > 0) {
                await this.handleThreats(context, detectedThreats);
            }
        } catch (error) {
            await this.logError(context, error);
            throw error;
        }
    }

    private initializeThreatPatterns(): void {
        this.threatPatterns.push({
            id: 'rapid-access',
            name: 'Rapid Access Pattern',
            type: 'behavior',
            severity: 'medium',
            threshold: 10,
            timeWindow: 60 * 1000, // 1 minute
            description: 'Détection d\'accès rapides et répétés',
            analyze: async (context, history) => {
                const recentAccess = history.filter(event => {
                    const eventTime = event.timestamp ? 
                        (event.timestamp instanceof Date ? event.timestamp.getTime() : event.timestamp.getTime()) : 0;
                    return event.userId === context.userId &&
                           eventTime > Date.now() - 60 * 1000;
                });
                return recentAccess.length > 10;
            }
        });

        this.threatPatterns.push({
            id: 'location-anomaly',
            name: 'Location Anomaly',
            type: 'anomaly',
            severity: 'high',
            threshold: 1,
            timeWindow: 24 * 60 * 60 * 1000,
            description: 'Détection de changement anormal de localisation',
            analyze: async (context, history) => {
                const profile = this.behaviorProfiles.get(context.userId);
                const ipAddress = (context as any).ipAddress || 'unknown';
                
                // Vérifier si l'IP est dans la liste des IPs connues
                const isKnownIP = profile ? profile.normalPatterns.commonIPs.has(ipAddress) : false;
                
                // Si l'IP n'est pas connue, examiner l'historique pour détecter des patterns suspects
                if (!isKnownIP && history.length > 0) {
                    const recentGeoChanges = history.filter(event => {
                        const eventTime = event.timestamp ? 
                            (event.timestamp instanceof Date ? event.timestamp.getTime() : event.timestamp.getTime()) : 0;
                        return event.userId === context.userId &&
                               eventTime > Date.now() - 24 * 60 * 60 * 1000;
                    });
                    
                    // Anomalie détectée si changement soudain de localisation
                    return recentGeoChanges.length > 0;
                }
                
                return !isKnownIP;
            }
        });

        this.threatPatterns.push({
            id: 'privilege-escalation',
            name: 'Privilege Escalation Attempt',
            type: 'access',
            severity: 'high',
            threshold: 1,
            timeWindow: 5 * 60 * 1000,
            description: 'Détection de tentative d\'escalade de privilèges',
            analyze: async (context, history) => {
                const recentEscalation = history.filter(event => {
                    const eventTime = event.timestamp ? 
                        (event.timestamp instanceof Date ? event.timestamp.getTime() : event.timestamp.getTime()) : 0;
                    return event.userId === context.userId &&
                           event.type === 'permission_change' &&
                           eventTime > Date.now() - 5 * 60 * 1000;
                });
                return recentEscalation.length > 0;
            }
        });

        this.threatPatterns.push({
            id: 'data-exfiltration',
            name: 'Data Exfiltration Pattern',
            type: 'behavior',
            severity: 'high',
            threshold: 5,
            timeWindow: 30 * 60 * 1000, // 30 minutes
            description: 'Détection de patterns d\'exfiltration de données',
            analyze: async (context, history) => {
                const recentDownloads = history.filter(event => {
                    const eventTime = event.timestamp ? 
                        (event.timestamp instanceof Date ? event.timestamp.getTime() : event.timestamp.getTime()) : 0;
                    return event.userId === context.userId &&
                           event.type === 'data_access' &&
                           eventTime > Date.now() - 30 * 60 * 1000;
                });
                return recentDownloads.length > 5;
            }
        });

        this.threatPatterns.push({
            id: 'brute-force',
            name: 'Brute Force Attack',
            type: 'pattern',
            severity: 'medium',
            threshold: 5,
            timeWindow: 5 * 60 * 1000, // 5 minutes
            description: 'Détection d\'attaque par force brute',
            analyze: async (context, history) => {
                const failedAttempts = history.filter(event => {
                    const eventTime = event.timestamp ? 
                        (event.timestamp instanceof Date ? event.timestamp.getTime() : event.timestamp.getTime()) : 0;
                    return event.ip === (context as any).ipAddress &&
                           event.type === 'authentication_failed' &&
                           eventTime > Date.now() - 5 * 60 * 1000;
                });
                return failedAttempts.length >= 5;
            }
        });

        this.threatPatterns.push({
            id: 'session-hijacking',
            name: 'Session Hijacking Attempt',
            type: 'anomaly',
            severity: 'high',
            threshold: 1,
            timeWindow: 10 * 60 * 1000, // 10 minutes
            description: 'Détection de tentative de piratage de session',
            analyze: async (context, history) => {
                const sameUserDifferentIPs = history.filter(event => {
                    const eventTime = event.timestamp ? 
                        (event.timestamp instanceof Date ? event.timestamp.getTime() : event.timestamp.getTime()) : 0;
                    return event.userId === context.userId &&
                           event.ip !== (context as any).ipAddress &&
                           eventTime > Date.now() - 10 * 60 * 1000;
                });
                return sameUserDifferentIPs.length > 0;
            }
        });
    }

    private async detectThreats(context: SecurityContext): Promise<ThreatDetection[]> {
        const detectedThreats: ThreatDetection[] = [];

        for (const pattern of this.threatPatterns) {
            if (await pattern.analyze(context, this.eventHistory)) {
                detectedThreats.push({
                    patternId: pattern.id,
                    timestamp: Date.now(),
                    context,
                    severity: pattern.severity,
                    details: {
                        patternName: pattern.name,
                        patternType: pattern.type,
                        description: pattern.description
                    }
                });
            }
        }

        return detectedThreats;
    }

    private async handleThreats(context: SecurityContext, threats: ThreatDetection[]): Promise<void> {
        for (const threat of threats) {
            await this.logThreat(threat);
            await this.applyMitigations(threat);

            const userThreats = this.detectionHistory.get(context.userId) || [];
            userThreats.push(threat);
            this.detectionHistory.set(context.userId, userThreats);
        }
    }

    private async logThreat(threat: ThreatDetection): Promise<void> {
        const event = {
            type: 'threat_detected',
            severity: this.convertToSecurityEventSeverity(threat.severity),
            timestamp: new Date(threat.timestamp),
            details: {
                threatId: threat.patternId,
                ...threat.details
            },
            source: 'ThreatDetector'
        };

        if ('logSecurityEvent' in this.auditManager) {
            await (this.auditManager as ExtendedAuditManager).logSecurityEvent(event);
        } else {
            console.log('Threat event logged:', event);
        }
    }

    private async applyMitigations(threat: ThreatDetection): Promise<void> {
        switch (threat.severity) {
            case 'high':
                await this.applyHighSeverityMitigation(threat);
                break;
            case 'medium':
                await this.applyMediumSeverityMitigation(threat);
                break;
            case 'low':
                await this.applyLowSeverityMitigation(threat);
                break;
        }
    }

    private async applyHighSeverityMitigation(threat: ThreatDetection): Promise<void> {
        // Mesures de mitigation sévères
        await this.blockUser(threat.context.userId, 'high_threat_detected');
        await this.notifyAdministrators(threat);
        await this.quarantineSession(threat.context);
        
        const mitigationEvent = {
            type: 'mitigation_applied',
            severity: SecurityEventSeverity.ERROR,
            timestamp: new Date(),
            details: {
                threatId: threat.patternId,
                mitigationType: 'high_severity',
                actions: ['user_blocked', 'admin_notified', 'session_quarantined']
            },
            source: 'ThreatDetector'
        };
        
        if ('logSecurityEvent' in this.auditManager) {
            await (this.auditManager as ExtendedAuditManager).logSecurityEvent(mitigationEvent);
        } else {
            console.log('Mitigation event logged:', mitigationEvent);
        }
    }

    private async applyMediumSeverityMitigation(threat: ThreatDetection): Promise<void> {
        // Mesures de mitigation modérées
        await this.requestAdditionalAuthentication(threat.context.userId);
        await this.increaseSurveillance(threat.context.userId);
        await this.limitAccess(threat.context.userId, ['sensitive_operations']);
        
        const mitigationEvent = {
            type: 'mitigation_applied',
            severity: SecurityEventSeverity.WARNING,
            timestamp: new Date(),
            details: {
                threatId: threat.patternId,
                mitigationType: 'medium_severity',
                actions: ['additional_auth_required', 'increased_surveillance', 'access_limited']
            },
            source: 'ThreatDetector'
        };
        
        if ('logSecurityEvent' in this.auditManager) {
            await (this.auditManager as ExtendedAuditManager).logSecurityEvent(mitigationEvent);
        } else {
            console.log('Mitigation event logged:', mitigationEvent);
        }
    }

    private async applyLowSeverityMitigation(threat: ThreatDetection): Promise<void> {
        // Mesures de mitigation légères
        await this.enableEnhancedLogging(threat.context.userId);
        await this.scheduleSecurityReview(threat.context.userId);
        await this.updateRiskScore(threat.context.userId, 'increase');
        
        const mitigationEvent = {
            type: 'mitigation_applied',
            severity: SecurityEventSeverity.INFO,
            timestamp: new Date(),
            details: {
                threatId: threat.patternId,
                mitigationType: 'low_severity',
                actions: ['enhanced_logging', 'security_review_scheduled', 'risk_score_updated']
            },
            source: 'ThreatDetector'
        };
        
        if ('logSecurityEvent' in this.auditManager) {
            await (this.auditManager as ExtendedAuditManager).logSecurityEvent(mitigationEvent);
        } else {
            console.log('Mitigation event logged:', mitigationEvent);
        }
    }

    private updateEventHistory(context: SecurityContext): void {
        const event: SecurityEvent = {
            type: 'access',
            severity: SecurityEventSeverity.INFO,
            timestamp: new Date(),
            details: {},
            source: 'ThreatDetector',
            userId: context.userId,
            ip: (context as any).ipAddress
        };
        this.eventHistory.push(event);

        while (this.eventHistory.length > this.EVENT_HISTORY_LIMIT) {
            this.eventHistory.shift();
        }
    }

    private async updateBehaviorProfile(context: SecurityContext): Promise<void> {
        let profile = this.behaviorProfiles.get(context.userId);
        const now = Date.now();
        const ipAddress = (context as any).ipAddress || 'unknown';
        const operation = context.operation || 'unknown';

        if (!profile || (now - profile.lastUpdated > this.PROFILE_UPDATE_INTERVAL)) {
            profile = {
                userId: context.userId,
                normalPatterns: {
                    accessTimes: [now],
                    commonIPs: new Set<string>([ipAddress]),
                    avgRequestRate: 0,
                    commonOperations: new Set<string>([operation])
                },
                lastUpdated: now
            };
        } else {
            profile.normalPatterns.accessTimes.push(now);
            profile.normalPatterns.commonIPs.add(ipAddress);
            profile.normalPatterns.commonOperations.add(operation);
            // Mettre à jour la moyenne des requêtes
            const recentAccesses = profile.normalPatterns.accessTimes.filter(
                time => time > now - this.PROFILE_UPDATE_INTERVAL
            );
            profile.normalPatterns.avgRequestRate = recentAccesses.length /
                (this.PROFILE_UPDATE_INTERVAL / (60 * 60 * 1000)); // requêtes par heure
        }

        this.behaviorProfiles.set(context.userId, profile);
    }

    private convertToSecurityEventSeverity(severity: 'low' | 'medium' | 'high'): SecurityEventSeverity {
        switch (severity) {
            case 'low':
                return SecurityEventSeverity.INFO;
            case 'medium':
                return SecurityEventSeverity.WARNING;
            case 'high':
                return SecurityEventSeverity.ERROR;
            default:
                return SecurityEventSeverity.INFO;
        }
    }

    private async logError(context: SecurityContext, error: unknown): Promise<void> {
        const event = {
            type: 'threat_detection_error',
            severity: SecurityEventSeverity.ERROR,
            timestamp: new Date(),
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            source: 'ThreatDetector'
        };

        if ('logSecurityEvent' in this.auditManager) {
            await (this.auditManager as ExtendedAuditManager).logSecurityEvent(event);
        } else {
            console.error('AuditManager does not support logSecurityEvent method', event);
        }
    }

    // Méthodes publiques utilitaires
    public getThreatHistory(userId: string): ThreatDetection[] {
        return this.detectionHistory.get(userId) || [];
    }

    public getBehaviorProfile(userId: string): BehaviorProfile | undefined {
        return this.behaviorProfiles.get(userId);
    }

    public addThreatPattern(pattern: ThreatPattern): void {
        this.threatPatterns.push(pattern);
    }

    public removeThreatPattern(patternId: string): void {
        const index = this.threatPatterns.findIndex(p => p.id === patternId);
        if (index !== -1) {
            this.threatPatterns.splice(index, 1);
        }
    }

    // Méthodes d'implémentation des actions de mitigation
    private async blockUser(userId: string, reason: string): Promise<void> {
        console.log(`Blocking user ${userId} for reason: ${reason}`);
        // Implementation réelle: appeler le service d'authentification pour bloquer l'utilisateur
    }

    private async notifyAdministrators(threat: ThreatDetection): Promise<void> {
        console.log(`Notifying administrators about threat: ${threat.patternId}`);
        // Implementation réelle: envoyer notifications aux administrateurs
    }

    private async quarantineSession(context: SecurityContext): Promise<void> {
        console.log(`Quarantining session for user: ${context.userId}`);
        // Implementation réelle: isoler la session utilisateur
    }

    private async requestAdditionalAuthentication(userId: string): Promise<void> {
        console.log(`Requesting additional authentication for user: ${userId}`);
        // Implementation réelle: déclencher MFA ou autre authentification
    }

    private async increaseSurveillance(userId: string): Promise<void> {
        console.log(`Increasing surveillance for user: ${userId}`);
        // Implementation réelle: activer monitoring renforcé
    }

    private async limitAccess(userId: string, restrictions: string[]): Promise<void> {
        console.log(`Limiting access for user: ${userId}, restrictions: ${restrictions.join(', ')}`);
        // Implementation réelle: appliquer restrictions d'accès
    }

    private async enableEnhancedLogging(userId: string): Promise<void> {
        console.log(`Enabling enhanced logging for user: ${userId}`);
        // Implementation réelle: activer logging détaillé
    }

    private async scheduleSecurityReview(userId: string): Promise<void> {
        console.log(`Scheduling security review for user: ${userId}`);
        // Implementation réelle: programmer révision de sécurité
    }

    private async updateRiskScore(userId: string, action: 'increase' | 'decrease'): Promise<void> {
        console.log(`Updating risk score for user: ${userId}, action: ${action}`);
        // Implementation réelle: mettre à jour le score de risque
    }

    // Méthodes d'analyse avancées
    public async analyzeUserBehaviorTrends(userId: string, timeRange: number = 7 * 24 * 60 * 60 * 1000): Promise<{
        anomalyScore: number;
        trendAnalysis: {
            accessPatternChange: number;
            locationVariance: number;
            operationTypeShift: number;
        };
        recommendations: string[];
    }> {
        const userThreats = this.getThreatHistory(userId);
        const profile = this.getBehaviorProfile(userId);
        const now = Date.now();
        
        if (!profile) {
            return {
                anomalyScore: 0,
                trendAnalysis: {
                    accessPatternChange: 0,
                    locationVariance: 0,
                    operationTypeShift: 0
                },
                recommendations: ['Profil utilisateur non trouvé - surveillance recommandée']
            };
        }

        // Calculer le score d'anomalie basé sur l'historique des menaces
        const recentThreats = userThreats.filter(t => t.timestamp > now - timeRange);
        const anomalyScore = Math.min(100, recentThreats.length * 10);

        // Analyser les tendances comportementales
        const recentAccessTimes = profile.normalPatterns.accessTimes.filter(time => time > now - timeRange);
        const accessPatternChange = this.calculateAccessPatternVariance(recentAccessTimes);
        const locationVariance = profile.normalPatterns.commonIPs.size > 5 ? 75 : profile.normalPatterns.commonIPs.size * 15;
        const operationTypeShift = profile.normalPatterns.commonOperations.size > 10 ? 60 : profile.normalPatterns.commonOperations.size * 6;

        // Générer des recommandations
        const recommendations: string[] = [];
        if (anomalyScore > 50) recommendations.push('Surveillance renforcée recommandée');
        if (accessPatternChange > 70) recommendations.push('Modèle d\'accès inhabituel détecté');
        if (locationVariance > 60) recommendations.push('Vérifier la légitimité des nouvelles localisations');
        if (operationTypeShift > 50) recommendations.push('Nouvelles opérations détectées - révision nécessaire');

        return {
            anomalyScore,
            trendAnalysis: {
                accessPatternChange,
                locationVariance,
                operationTypeShift
            },
            recommendations: recommendations.length > 0 ? recommendations : ['Comportement normal - surveillance standard']
        };
    }

    private calculateAccessPatternVariance(accessTimes: number[]): number {
        if (accessTimes.length < 2) return 0;
        
        // Calculer la variance des heures d'accès
        const hours = accessTimes.map(time => new Date(time).getHours());
        const avgHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
        const variance = hours.reduce((sum, hour) => sum + Math.pow(hour - avgHour, 2), 0) / hours.length;
        
        return Math.min(100, variance * 4); // Normaliser sur 100
    }

    public getSystemThreatOverview(): {
        totalThreats: number;
        threatsByType: Record<string, number>;
        threatsBySeverity: Record<string, number>;
        topTargetedUsers: Array<{ userId: string; threatCount: number }>;
        recentTrends: {
            increasing: string[];
            decreasing: string[];
        };
    } {
        const allThreats: ThreatDetection[] = [];
        const userThreatCounts = new Map<string, number>();
        
        // Collecter toutes les menaces
        this.detectionHistory.forEach((threats, userId) => {
            allThreats.push(...threats);
            userThreatCounts.set(userId, threats.length);
        });

        // Analyser par type
        const threatsByType: Record<string, number> = {};
        const threatsBySeverity: Record<string, number> = {};
        
        allThreats.forEach(threat => {
            const patternType = this.threatPatterns.find(p => p.id === threat.patternId)?.type || 'unknown';
            threatsByType[patternType] = (threatsByType[patternType] || 0) + 1;
            threatsBySeverity[threat.severity] = (threatsBySeverity[threat.severity] || 0) + 1;
        });

        // Top utilisateurs ciblés
        const topTargetedUsers = Array.from(userThreatCounts.entries())
            .map(([userId, threatCount]) => ({ userId, threatCount }))
            .sort((a, b) => b.threatCount - a.threatCount)
            .slice(0, 10);

        return {
            totalThreats: allThreats.length,
            threatsByType,
            threatsBySeverity,
            topTargetedUsers,
            recentTrends: {
                increasing: ['behavior', 'anomaly'], // Simulation
                decreasing: ['access'] // Simulation
            }
        };
    }
}