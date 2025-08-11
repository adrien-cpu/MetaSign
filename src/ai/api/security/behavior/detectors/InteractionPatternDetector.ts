// src/ai/api/security/behavior/detectors/InteractionPatternDetector.ts
import { BehaviorEvent, BehaviorProfile, BehaviorAnomaly } from '../types';
import { PatternDetectorBase } from './PatternDetectorBase';
import { AnomalyFactory } from '../AnomalyFactory';

export class InteractionPatternDetector extends PatternDetectorBase {
    private readonly behaviorHistory: Map<string, BehaviorEvent[]>;

    constructor(behaviorHistory: Map<string, BehaviorEvent[]>) {
        super();
        this.behaviorHistory = behaviorHistory;
    }

    public async detectAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        if (profile.learningPhase) {
            return [];
        }

        const anomalies: BehaviorAnomaly[] = [];

        const interactionPattern = profile.patterns.interaction.find(p =>
            p.type === event.type
        );

        if (interactionPattern && event.context.target !== undefined) {
            const target = event.context.target as string;

            if (!interactionPattern.commonTargets.includes(target)) {
                anomalies.push(
                    AnomalyFactory.createUnusualInteractionAnomaly(
                        event,
                        interactionPattern.commonTargets,
                        target
                    )
                );
            }
        }

        return anomalies;
    }

    public async updateProfile(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void> {
        let pattern = profile.patterns.interaction.find(p => p.type === event.type);
        if (!pattern) {
            pattern = {
                type: event.type,
                frequency: 0,
                commonTargets: [],
                successRate: 1
            };
            profile.patterns.interaction.push(pattern);
        }

        if (event.context.target !== undefined) {
            const target = event.context.target as string;

            // Mettre à jour les cibles communes
            if (!pattern.commonTargets.includes(target)) {
                pattern.commonTargets.push(target);
                if (pattern.commonTargets.length > 10) {
                    // Garder uniquement les 10 cibles les plus fréquentes
                    const targetCounts = new Map<string, number>();
                    const recentEvents = this.getRecentEventsForUser(event.userId);

                    recentEvents.forEach(e => {
                        const t = e.context.target as string;
                        if (t) {
                            targetCounts.set(t, (targetCounts.get(t) || 0) + 1);
                        }
                    });

                    pattern.commonTargets = Array.from(targetCounts.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([target]) => target);
                }
            }
        }

        // Mettre à jour la fréquence et le taux de succès
        const recentEvents = this.getRecentEventsForUser(event.userId, undefined, 24 * 60 * 60 * 1000);
        pattern.frequency = recentEvents.length;

        const successfulEvents = recentEvents.filter(e => e.result === 'success');
        pattern.successRate = successfulEvents.length / recentEvents.length;
    }

    /**
     * Version spécifique pour récupérer les événements récents d'un utilisateur
     * Utilise l'historique interne de la classe
     */
    private getRecentEventsForUser(
        userId: string,
        resource?: string,
        timeWindow: number = 60 * 60 * 1000 // 1 heure par défaut
    ): BehaviorEvent[] {
        return this.getRecentEvents(this.behaviorHistory, userId, resource, timeWindow);
    }
}