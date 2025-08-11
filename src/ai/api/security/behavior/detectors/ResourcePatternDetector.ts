// src/ai/api/security/behavior/detectors/ResourcePatternDetector.ts
import { BehaviorEvent, BehaviorProfile, BehaviorAnomaly } from '../types';
import { PatternDetectorBase } from './PatternDetectorBase';
import { AnomalyFactory } from '../AnomalyFactory';
import { StatisticalUtils } from '../utils/StatisticalUtils';

export class ResourcePatternDetector extends PatternDetectorBase {
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

        const resourcePattern = profile.patterns.resource.find(p =>
            p.type === event.type
        );

        if (resourcePattern && event.context.usage !== undefined) {
            const usage = event.context.usage as number;
            const [min, max] = resourcePattern.normalRange;

            if (usage < min || usage > max) {
                anomalies.push(
                    AnomalyFactory.createResourceUsageAnomaly(
                        event,
                        min,
                        max,
                        usage
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
        let pattern = profile.patterns.resource.find(p => p.type === event.type);
        if (!pattern) {
            pattern = {
                type: event.type,
                averageUsage: 0,
                peakUsage: 0,
                normalRange: [0, 0]
            };
            profile.patterns.resource.push(pattern);
        }

        if (event.context.usage !== undefined) {
            // Nous vérifions simplement si la valeur existe, sans l'assigner à une variable

            // Mettre à jour l'utilisation moyenne
            const recentEvents = this.getRecentEvents(event.userId, undefined, 24 * 60 * 60 * 1000);
            const usages = recentEvents
                .filter(e => e.context.usage !== undefined)
                .map(e => e.context.usage as number);

            if (usages.length > 0) {
                pattern.averageUsage = StatisticalUtils.calculateAverage(usages);
                pattern.peakUsage = Math.max(...usages);

                // Calculer l'écart-type pour la plage normale
                const stdDev = StatisticalUtils.calculateStandardDeviation(usages);
                pattern.normalRange = [
                    Math.max(0, pattern.averageUsage - 2 * stdDev),
                    pattern.averageUsage + 2 * stdDev
                ];
            }
        }
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
}