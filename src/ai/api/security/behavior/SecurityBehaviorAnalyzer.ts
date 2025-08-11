// src/ai/api/security/behavior/SecurityBehaviorAnalyzer.ts
import { SecurityContext, SecuritySeverity } from '../types/SecurityTypes';
import { SecurityAuditor } from '../audit/SecurityAuditor';
import { IBehaviorAnalyzer } from './interfaces';
import {
    BehaviorProfile,
    BehaviorEvent,
    BehaviorAnomaly,
    BehaviorAnalysis
} from './types';
import { TemporalPatternDetector } from './detectors/TemporalPatternDetector';
import { AccessPatternDetector } from './detectors/AccessPatternDetector';
import { ResourcePatternDetector } from './detectors/ResourcePatternDetector';
import { InteractionPatternDetector } from './detectors/InteractionPatternDetector';

export class SecurityBehaviorAnalyzer implements IBehaviorAnalyzer {
    private readonly profiles = new Map<string, BehaviorProfile>();
    private readonly behaviorHistory = new Map<string, BehaviorEvent[]>();
    private readonly anomalies = new Map<string, BehaviorAnomaly[]>();
    private readonly detectors: Array<TemporalPatternDetector |
        AccessPatternDetector |
        ResourcePatternDetector |
        InteractionPatternDetector>;

    private readonly LEARNING_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 jours
    private readonly HISTORY_RETENTION = 90 * 24 * 60 * 60 * 1000; // 90 jours
    private readonly UPDATE_INTERVAL = 60 * 60 * 1000; // 1 heure

    constructor(
        private readonly securityAuditor: SecurityAuditor
    ) {
        // Initialiser les détecteurs
        this.detectors = [
            new TemporalPatternDetector(this.behaviorHistory),
            new AccessPatternDetector(this.behaviorHistory),
            new ResourcePatternDetector(this.behaviorHistory),
            new InteractionPatternDetector(this.behaviorHistory)
        ];

        this.startProfileUpdates();
    }

    async analyzeBehavior(
        event: BehaviorEvent,
        context: SecurityContext
    ): Promise<BehaviorAnalysis> {
        try {
            // Obtenir ou créer le profil de l'utilisateur
            const profile = await this.getOrCreateProfile(event.userId);

            // Mettre à jour l'historique
            await this.updateBehaviorHistory(event);

            // Collecter les anomalies de tous les détecteurs
            const anomalies: BehaviorAnomaly[] = [];
            for (const detector of this.detectors) {
                const detectedAnomalies = await detector.detectAnomalies(event, profile);
                anomalies.push(...detectedAnomalies);
            }

            // Stocker les anomalies détectées
            this.storeAnomalies(event.userId, anomalies);

            // Mettre à jour le profil si nécessaire
            if (profile.learningPhase || anomalies.length === 0) {
                for (const detector of this.detectors) {
                    await detector.updateProfile(profile, event);
                }
            }

            // Créer l'analyse
            const analysis: BehaviorAnalysis = {
                userId: event.userId,
                timestamp: Date.now(),
                riskScore: await this.calculateRiskScore(profile, anomalies),
                anomalies,
                recommendations: await this.generateRecommendations(anomalies),
                confidence: await this.calculateConfidence(profile)
            };

            // Auditer l'analyse
            await this.auditBehaviorAnalysis(context, analysis);

            return analysis;

        } catch (error) {
            throw new Error(`Behavior analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async getOrCreateProfile(userId: string): Promise<BehaviorProfile> {
        let profile = this.profiles.get(userId);

        if (!profile) {
            profile = {
                userId,
                createdAt: Date.now(),
                lastUpdated: Date.now(),
                patterns: {
                    temporal: [],
                    access: [],
                    resource: [],
                    interaction: []
                },
                riskScore: 0,
                anomalyThreshold: 0.8,
                learningPhase: true
            };
            this.profiles.set(userId, profile);
        }

        return profile;
    }

    private async updateBehaviorHistory(event: BehaviorEvent): Promise<void> {
        let history = this.behaviorHistory.get(event.userId) || [];
        history.push(event);

        // Nettoyer l'historique ancien
        const cutoff = Date.now() - this.HISTORY_RETENTION;
        history = history.filter(e => e.timestamp > cutoff);

        this.behaviorHistory.set(event.userId, history);
    }

    private storeAnomalies(userId: string, newAnomalies: BehaviorAnomaly[]): void {
        if (newAnomalies.length === 0) return;

        const existingAnomalies = this.anomalies.get(userId) || [];
        this.anomalies.set(userId, [...existingAnomalies, ...newAnomalies]);
    }

    private async calculateRiskScore(
        profile: BehaviorProfile,
        anomalies: BehaviorAnomaly[]
    ): Promise<number> {
        let riskScore = 0;

        // Points de risque basés sur les anomalies
        for (const anomaly of anomalies) {
            switch (anomaly.severity) {
                case 'high':
                    riskScore += 30 * anomaly.confidence;
                    break;
                case 'medium':
                    riskScore += 15 * anomaly.confidence;
                    break;
                case 'low':
                    riskScore += 5 * anomaly.confidence;
                    break;
            }
        }

        // Facteurs de risque basés sur le profil
        for (const pattern of profile.patterns.access) {
            if (pattern.successRate < 0.8) {
                riskScore += 10 * (1 - pattern.successRate);
            }
        }

        // Normaliser le score entre 0 et 100
        return Math.min(100, Math.max(0, riskScore));
    }

    private async calculateConfidence(profile: BehaviorProfile): Promise<number> {
        if (profile.learningPhase) {
            const progress = (Date.now() - profile.createdAt) / this.LEARNING_PERIOD;
            return Math.min(0.5, progress);
        }

        // Calculer la confiance basée sur la consistance des patterns
        let totalConsistency = 0;
        let patternCount = 0;

        profile.patterns.temporal.forEach(pattern => {
            totalConsistency += pattern.consistency;
            patternCount++;
        });

        profile.patterns.access.forEach(pattern => {
            totalConsistency += pattern.successRate;
            patternCount++;
        });

        profile.patterns.interaction.forEach(pattern => {
            totalConsistency += pattern.successRate;
            patternCount++;
        });

        return patternCount > 0 ? totalConsistency / patternCount : 0.5;
    }

    private async generateRecommendations(
        anomalies: BehaviorAnomaly[]
    ): Promise<string[]> {
        const recommendations = new Set<string>();

        for (const anomaly of anomalies) {
            switch (anomaly.type) {
                case 'temporal_anomaly':
                    recommendations.add('Review and adjust access hours if needed');
                    break;
                case 'access_frequency_anomaly':
                    recommendations.add('Investigate unusual access frequency');
                    break;
                case 'unusual_operation_anomaly':
                    recommendations.add('Verify authorization for new operations');
                    break;
                case 'resource_usage_anomaly':
                    recommendations.add('Monitor resource usage patterns');
                    break;
                case 'unusual_interaction_anomaly':
                    recommendations.add('Review interaction patterns with new targets');
                    break;
            }
        }

        return Array.from(recommendations);
    }

    private async auditBehaviorAnalysis(
        context: SecurityContext,
        analysis: BehaviorAnalysis
    ): Promise<void> {
        const severity: SecuritySeverity = analysis.riskScore > 70 ? 'HIGH' :
            analysis.riskScore > 40 ? 'MEDIUM' : 'LOW';

        await this.securityAuditor.logSecurityEvent({
            type: 'behavior_analysis',
            severity,
            timestamp: new Date(Date.now()),
            details: {
                userId: analysis.userId,
                riskScore: analysis.riskScore,
                anomalyCount: analysis.anomalies.length,
                confidence: analysis.confidence
            },
            source: 'SecurityBehaviorAnalyzer'
        });
    }

    private startProfileUpdates(): void {
        setInterval(async () => {
            try {
                for (const profile of this.profiles.values()) {
                    if (!profile.learningPhase &&
                        Date.now() - profile.lastUpdated > this.UPDATE_INTERVAL) {
                        const recentEvents = this.getRecentEvents(
                            profile.userId,
                            undefined,
                            this.UPDATE_INTERVAL
                        );

                        for (const event of recentEvents) {
                            for (const detector of this.detectors) {
                                await detector.updateProfile(profile, event);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error updating profiles:', error);
            }
        }, this.UPDATE_INTERVAL);
    }

    private getRecentEvents(
        userId: string,
        resource?: string,
        timeWindow: number = 60 * 60 * 1000 // 1 heure par défaut
    ): BehaviorEvent[] {
        const history = this.behaviorHistory.get(userId) || [];
        const cutoff = Date.now() - timeWindow;

        return history.filter(event =>
            event.timestamp > cutoff &&
            (!resource || event.resource === resource)
        );
    }

    // Méthodes publiques utilitaires
    public async getUserProfile(userId: string): Promise<BehaviorProfile | undefined> {
        return this.profiles.get(userId);
    }

    public async getUserAnomalies(
        userId: string,
        timeWindow?: number
    ): Promise<BehaviorAnomaly[]> {
        const cutoff = timeWindow ? Date.now() - timeWindow : 0;
        return (this.anomalies.get(userId) || [])
            .filter(anomaly => anomaly.timestamp > cutoff);
    }

    public async getHighRiskUsers(): Promise<Array<{
        userId: string;
        riskScore: number;
        anomalyCount: number;
    }>> {
        return Array.from(this.profiles.values())
            .filter(profile => profile.riskScore > 70)
            .map(profile => ({
                userId: profile.userId,
                riskScore: profile.riskScore,
                anomalyCount: (this.anomalies.get(profile.userId) || []).length
            }))
            .sort((a, b) => b.riskScore - a.riskScore);
    }

    public async cleanup(): Promise<void> {
        // Nettoyer les anciens événements
        const cutoff = Date.now() - this.HISTORY_RETENTION;
        for (const [userId, events] of this.behaviorHistory) {
            const filteredEvents = events.filter(e => e.timestamp > cutoff);
            if (filteredEvents.length === 0) {
                this.behaviorHistory.delete(userId);
            } else {
                this.behaviorHistory.set(userId, filteredEvents);
            }
        }

        // Nettoyer les anciennes anomalies
        for (const [userId, anomalies] of this.anomalies) {
            const filteredAnomalies = anomalies.filter(a => a.timestamp > cutoff);
            if (filteredAnomalies.length === 0) {
                this.anomalies.delete(userId);
            } else {
                this.anomalies.set(userId, filteredAnomalies);
            }
        }
    }
}