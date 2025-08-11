// src/ai/api/security/protection/ThreatDetector.ts

import { SecurityContext, SecurityEvent } from '../types/SecurityTypes';
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
    details: Record<string, any>;
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
                const recentAccess = history.filter(event =>
                    event.context.userId === context.userId &&
                    event.timestamp > Date.now() - 60 * 1000
                );
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
                return profile ? !profile.normalPatterns.commonIPs.has(context.ipAddress) : false;
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
                const recentEscalation = history.filter(event =>
                    event.context.userId === context.userId &&
                    event.type === 'permission_change' &&
                    event.timestamp > Date.now() - 5 * 60 * 1000
                );
                return recentEscalation.length > 0;
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
        const event: SecurityEvent = {
            type: 'threat_detected',
            severity: threat.severity,
            timestamp: threat.timestamp,
            details: {
                threatId: threat.patternId,
                ...threat.details
            },
            source: 'ThreatDetector',
            context: threat.context
        };

        await this.auditManager.logSecurityEvent(event);
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
        // Implémenter des mesures de mitigation sévères
        // Par exemple : bloquer l'accès, notifier les administrateurs, etc.
    }

    private async applyMediumSeverityMitigation(threat: ThreatDetection): Promise<void> {
        // Implémenter des mesures de mitigation modérées
        // Par exemple : demander une authentification supplémentaire
    }

    private async applyLowSeverityMitigation(threat: ThreatDetection): Promise<void> {
        // Implémenter des mesures de mitigation légères
        // Par exemple : surveiller plus étroitement l'activité
    }

    private updateEventHistory(context: SecurityContext): void {
        this.eventHistory.push({
            type: 'access',
            severity: 'low',
            timestamp: Date.now(),
            details: {},
            source: 'ThreatDetector',
            context
        });

        while (this.eventHistory.length > this.EVENT_HISTORY_LIMIT) {
            this.eventHistory.shift();
        }
    }

    private async updateBehaviorProfile(context: SecurityContext): Promise<void> {
        let profile = this.behaviorProfiles.get(context.userId);
        const now = Date.now();

        if (!profile || (now - profile.lastUpdated > this.PROFILE_UPDATE_INTERVAL)) {
            profile = {
                userId: context.userId,
                normalPatterns: {
                    accessTimes: [now],
                    commonIPs: new Set([context.ipAddress]),
                    avgRequestRate: 0,
                    commonOperations: new Set()
                },
                lastUpdated: now
            };
        } else {
            profile.normalPatterns.accessTimes.push(now);
            profile.normalPatterns.commonIPs.add(context.ipAddress);
            // Mettre à jour la moyenne des requêtes
            const recentAccesses = profile.normalPatterns.accessTimes.filter(
                time => time > now - this.PROFILE_UPDATE_INTERVAL
            );
            profile.normalPatterns.avgRequestRate = recentAccesses.length /
                (this.PROFILE_UPDATE_INTERVAL / (60 * 60 * 1000)); // requêtes par heure
        }

        this.behaviorProfiles.set(context.userId, profile);
    }

    private async logError(context: SecurityContext, error: unknown): Promise<void> {
        const event: SecurityEvent = {
            type: 'threat_detection_error',
            severity: 'high',
            timestamp: Date.now(),
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            source: 'ThreatDetector',
            context
        };

        await this.auditManager.logSecurityEvent(event);
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
}