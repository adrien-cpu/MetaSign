// src/ai/api/security/behavior/detectors/TemporalPatternDetector.ts
import { BehaviorEvent, BehaviorProfile, BehaviorAnomaly, TemporalPatternType, TimeRange } from '../types';
import { PatternDetectorBase } from './PatternDetectorBase';
import { AnomalyFactory } from '../AnomalyFactory';

export class TemporalPatternDetector extends PatternDetectorBase {
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
        const now = new Date(event.timestamp);
        const dayOfWeek = now.getDay();
        const timeOfDay = now.getHours() * 60 + now.getMinutes();

        for (const pattern of profile.patterns.temporal) {
            if (pattern.type === event.type as TemporalPatternType) {
                const isInNormalRange = pattern.timeRanges.some(range => {
                    return range.daysOfWeek.includes(dayOfWeek) &&
                        timeOfDay >= range.start &&
                        timeOfDay <= range.end;
                });

                if (!isInNormalRange) {
                    anomalies.push(
                        AnomalyFactory.createTemporalAnomaly(
                            event,
                            pattern.consistency,
                            timeOfDay
                        )
                    );
                }
            }
        }

        return anomalies;
    }

    public async updateProfile(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void> {
        const now = new Date(event.timestamp);
        const dayOfWeek = now.getDay();
        const timeOfDay = now.getHours() * 60 + now.getMinutes();

        let pattern = profile.patterns.temporal.find(p => p.type === event.type as TemporalPatternType);

        if (!pattern) {
            // Vérifier que le type est bien un type valide pour TemporalPattern
            if (!['login', 'activity', 'session'].includes(event.type)) {
                return; // Type non supporté, ignorer
            }

            pattern = {
                type: event.type as TemporalPatternType,
                timeRanges: [],
                frequency: 0,
                consistency: 0
            };
            profile.patterns.temporal.push(pattern);
        }

        // Mettre à jour ou créer une plage horaire
        const existingRange = pattern.timeRanges.find(range =>
            range.daysOfWeek.includes(dayOfWeek) &&
            Math.abs(timeOfDay - (range.start + range.end) / 2) < 60
        );

        if (existingRange) {
            // Ajuster la plage existante
            existingRange.start = Math.min(existingRange.start, timeOfDay);
            existingRange.end = Math.max(existingRange.end, timeOfDay);
            existingRange.weight += 1;
        } else {
            // Créer une nouvelle plage
            pattern.timeRanges.push({
                start: timeOfDay - 30,
                end: timeOfDay + 30,
                daysOfWeek: [dayOfWeek],
                weight: 1
            });
        }

        // Mettre à jour la consistance
        const recentEvents = this.getRecentEventsForUser(event.userId, undefined, 7 * 24 * 60 * 60 * 1000);
        pattern.consistency = this.calculateConsistency(recentEvents, pattern.timeRanges);
    }

    /**
     * Version spécifique pour récupérer les événements récents d'un utilisateur
     * Utilise l'historique interne de la classe
     */
    private getRecentEventsForUser(
        userId: string,
        resource?: string,
        timeWindow: number = 60 * 60 * 1000
    ): BehaviorEvent[] {
        return this.getRecentEvents(this.behaviorHistory, userId, resource, timeWindow);
    }

    private calculateConsistency(
        events: BehaviorEvent[],
        timeRanges: TimeRange[]
    ): number {
        if (events.length === 0 || timeRanges.length === 0) {
            return 0;
        }

        let inRangeCount = 0;
        for (const event of events) {
            const eventDate = new Date(event.timestamp);
            const dayOfWeek = eventDate.getDay();
            const timeOfDay = eventDate.getHours() * 60 + eventDate.getMinutes();

            const isInRange = timeRanges.some(range =>
                range.daysOfWeek.includes(dayOfWeek) &&
                timeOfDay >= range.start &&
                timeOfDay <= range.end
            );

            if (isInRange) {
                inRangeCount++;
            }
        }

        return inRangeCount / events.length;
    }
}