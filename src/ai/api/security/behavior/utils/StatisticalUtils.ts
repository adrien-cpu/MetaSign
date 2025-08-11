// src/ai/api/security/behavior/utils/StatisticalUtils.ts

// Interfaces nécessaires
interface BehaviorEvent {
    userId: string;
    timestamp: number;
    type: string;
    resource?: string;
}

interface BehaviorProfile {
    patterns: {
        temporal: TemporalPattern[];
    };
}

type TemporalPatternType = 'login' | 'activity' | 'session';

interface TemporalPattern {
    type: TemporalPatternType;
    timeRanges: TimeRange[];
    frequency: number;
    consistency: number;
}

interface TimeRange {
    start: number;
    end: number;
    daysOfWeek: number[];
    weight: number;
}

/**
 * Anomalie temporelle détectée dans les événements comportementaux
 */
interface TemporalAnomaly {
    event: BehaviorEvent;
    type: 'temporal_anomaly';
    details: string;
    severity?: 'low' | 'medium' | 'high';
    score?: number;
}

/**
 * Utilitaires statistiques pour l'analyse comportementale
 */
export class StatisticalUtils {
    private behaviorHistory: Map<string, BehaviorEvent[]> = new Map();

    /**
     * Calcule la moyenne d'un tableau de valeurs
     * @param values Tableau de valeurs numériques
     * @returns Moyenne des valeurs ou 0 si le tableau est vide
     */
    public static calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Calcule l'écart-type d'un tableau de valeurs
     * @param values Tableau de valeurs numériques
     * @returns Écart-type ou 0 si le tableau est vide
     */
    public static calculateStandardDeviation(values: number[]): number {
        if (values.length === 0) return 0;
        const avg = this.calculateAverage(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.calculateAverage(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calcule l'écart normalisé (Z-score) d'une valeur par rapport à une distribution
     * @param value Valeur à évaluer
     * @param mean Moyenne de la distribution
     * @param stdDev Écart-type de la distribution
     * @returns Z-score de la valeur
     */
    public static calculateZScore(value: number, mean: number, stdDev: number): number {
        if (stdDev === 0) return 0;
        return (value - mean) / stdDev;
    }

    /**
     * Détecte les anomalies temporelles dans une série d'événements
     * @param events Événements à analyser
     * @param timeRanges Plages horaires normales
     * @returns Tableau d'anomalies détectées
     */
    public detectTemporalAnomalies(
        events: BehaviorEvent[],
        timeRanges: TimeRange[]
    ): TemporalAnomaly[] {
        const anomalies: TemporalAnomaly[] = [];

        if (events.length === 0 || timeRanges.length === 0) {
            return anomalies;
        }

        for (const event of events) {
            const eventDate = new Date(event.timestamp);
            const dayOfWeek = eventDate.getDay();
            const timeOfDay = eventDate.getHours() * 60 + eventDate.getMinutes();

            const isInRange = timeRanges.some(range =>
                range.daysOfWeek.includes(dayOfWeek) &&
                timeOfDay >= range.start &&
                timeOfDay <= range.end
            );

            if (!isInRange) {
                // Calculer la distance à la plage la plus proche pour déterminer la sévérité
                const minDistance = this.calculateMinDistanceToRanges(dayOfWeek, timeOfDay, timeRanges);
                const severity = this.determineSeverity(minDistance);

                anomalies.push({
                    event,
                    type: 'temporal_anomaly',
                    details: `Event occurred outside normal time ranges (day: ${dayOfWeek}, time: ${this.formatTime(timeOfDay)})`,
                    severity,
                    score: this.calculateAnomalyScore(minDistance)
                });
            }
        }

        return anomalies;
    }

    /**
     * Met à jour le profil comportemental avec un nouvel événement
     * @param profile Profil à mettre à jour
     * @param event Nouvel événement
     */
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
        const recentEvents = this.getRecentEvents(event.userId, undefined, 7 * 24 * 60 * 60 * 1000);
        pattern.consistency = this.calculateConsistency(recentEvents, pattern.timeRanges);
    }

    /**
     * Récupère les événements récents pour un utilisateur donné
     * @param userId Identifiant de l'utilisateur
     * @param resource Ressource spécifique (optionnel)
     * @param timeWindow Fenêtre de temps en millisecondes
     * @returns Liste des événements récents
     */
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

    /**
     * Calcule la consistance des événements par rapport aux plages horaires
     * @param events Événements à évaluer
     * @param timeRanges Plages horaires de référence
     * @returns Score de consistance (0-1)
     */
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

    /**
     * Calcule la distance minimale entre un moment et les plages horaires
     * @param dayOfWeek Jour de la semaine (0-6)
     * @param timeOfDay Heure de la journée en minutes
     * @param timeRanges Plages horaires de référence
     * @returns Distance minimale en minutes
     */
    private calculateMinDistanceToRanges(
        dayOfWeek: number,
        timeOfDay: number,
        timeRanges: TimeRange[]
    ): number {
        let minDistance = Number.MAX_VALUE;

        for (const range of timeRanges) {
            // Si le jour ne correspond pas, passer à la plage suivante
            if (!range.daysOfWeek.includes(dayOfWeek)) {
                continue;
            }

            // Calculer la distance à cette plage
            if (timeOfDay < range.start) {
                minDistance = Math.min(minDistance, range.start - timeOfDay);
            } else if (timeOfDay > range.end) {
                minDistance = Math.min(minDistance, timeOfDay - range.end);
            } else {
                // L'heure est dans la plage
                return 0;
            }
        }

        // Si aucune plage ne correspond au jour, trouver la plus proche absolue
        if (minDistance === Number.MAX_VALUE) {
            for (const range of timeRanges) {
                // Distance en jours (en considérant la circularité de la semaine)
                const dayDistance = Math.min(
                    Math.abs(dayOfWeek - Math.min(...range.daysOfWeek)),
                    7 - Math.abs(dayOfWeek - Math.min(...range.daysOfWeek))
                );

                // Distance en minutes (milieu de la plage)
                const rangeMiddle = (range.start + range.end) / 2;
                const timeDistance = Math.min(
                    Math.abs(timeOfDay - rangeMiddle),
                    1440 - Math.abs(timeOfDay - rangeMiddle) // 1440 = 24h * 60min
                );

                // Distance combinée (simpliste: 1 jour = 1440 minutes)
                const totalDistance = dayDistance * 1440 + timeDistance;
                minDistance = Math.min(minDistance, totalDistance);
            }
        }

        return minDistance;
    }

    /**
     * Détermine la sévérité d'une anomalie basée sur la distance
     * @param distance Distance à la plage normale la plus proche (en minutes)
     * @returns Niveau de sévérité
     */
    private determineSeverity(distance: number): 'low' | 'medium' | 'high' {
        if (distance < 60) return 'low'; // Moins d'une heure
        if (distance < 240) return 'medium'; // Moins de 4 heures
        return 'high'; // 4 heures ou plus
    }

    /**
     * Calcule un score d'anomalie normalisé
     * @param distance Distance à la plage normale la plus proche
     * @returns Score entre 0 et 1
     */
    private calculateAnomalyScore(distance: number): number {
        // Normalisation sigmoïde: 0 → 0, 60 → 0.25, 240 → 0.75, 720 → 0.95
        return 1 / (1 + Math.exp(-0.01 * (distance - 240)));
    }

    /**
     * Formate une durée en minutes au format hh:mm
     * @param minutes Minutes à formater
     * @returns Chaîne formatée
     */
    private formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}