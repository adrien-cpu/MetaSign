// src/ai/learning/adapters/realtime/EngagementMonitor.ts

import { EngagementMetrics, UserInteraction } from '../../types';
import { Logger } from '@ai/utils/Logger';

/**
 * Interface pour les patterns d'utilisation détectés
 */
interface UsagePatterns {
    regularBreaks: boolean;
    consistentTimes: boolean;
    preferredContentTypes: string[];
}

/**
 * Moniteur d'engagement responsable d'analyser l'engagement des utilisateurs
 * en se basant sur leurs interactions avec le système
 */
export class EngagementMonitor {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger('EngagementMonitor');
    }

    /**
     * Analyse l'engagement d'un utilisateur à partir de ses interactions
     */
    public analyze(userId: string, interactions: UserInteraction[]): EngagementMetrics {
        this.logger.info(`Analyzing engagement for user ${userId}`);

        // Analyser l'attention
        const attentionScore = this.calculateAttentionScore(interactions);

        // Analyser la fréquence d'interaction
        const interactionFrequency = this.calculateInteractionFrequency(interactions);

        // Analyser le taux de complétion
        const completionRate = this.calculateCompletionRate(interactions);

        // Calculer le temps moyen par activité
        const averageTimePerActivity = this.calculateAverageTimePerActivity(interactions);

        // Compter les vues répétées de contenu
        const repeatedContentViews = this.countRepeatedContentViews(interactions);

        // Détecter des patterns d'utilisation
        const patternDetection = this.detectPatterns(interactions);

        // Construire les métriques d'engagement
        return {
            userId,
            timestamp: new Date(),
            attentionScore,
            interactionFrequency,
            completionRate,
            averageTimePerActivity,
            repeatedContentViews,
            patternDetection
        };
    }

    /**
     * Calcule le score d'attention basé sur les interactions
     */
    private calculateAttentionScore(interactions: UserInteraction[]): number {
        if (interactions.length === 0) {
            return 50; // Score par défaut
        }

        // Facteurs d'attention
        const attentionFactors = {
            regularInteraction: 0,      // Interaction régulière
            completionRate: 0,          // Taux de complétion des activités
            timeEngagement: 0,          // Temps passé sur les activités
            interactionQuality: 0       // Qualité des interactions
        };

        // Compter les activités complétées
        const completedActivities = interactions.filter(
            i => i.interactionType === 'complete' || i.interactionType.includes('completion')
        ).length;

        // Nombre total d'activités uniques
        const uniqueActivities = new Set(interactions.map(i => i.activityId)).size;

        // Calculer le taux de complétion
        attentionFactors.completionRate = uniqueActivities > 0
            ? (completedActivities / uniqueActivities) * 100
            : 0;

        // Calculer le temps moyen d'engagement
        const activitiesWithDuration = interactions.filter(i => i.duration !== undefined);

        if (activitiesWithDuration.length > 0) {
            const totalDuration = activitiesWithDuration.reduce((sum, i) => sum + (i.duration || 0), 0);
            const averageDuration = totalDuration / activitiesWithDuration.length;

            // Transformer en score (0-100)
            // Si durée moyenne > 5 minutes, score max
            // Si durée moyenne < 30 secondes, score min
            attentionFactors.timeEngagement = Math.min(100, Math.max(0,
                ((averageDuration / 1000) - 30) / 270 * 100)
            );
        }

        // Analyser la régularité des interactions
        if (interactions.length > 1) {
            const timestamps = interactions.map(i => i.timestamp.getTime()).sort();
            const timeDiffs = [];

            for (let i = 1; i < timestamps.length; i++) {
                timeDiffs.push(timestamps[i] - timestamps[i - 1]);
            }

            // Calculer l'écart-type des différences de temps (normalisé)
            const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
            const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / timeDiffs.length;
            const stdDev = Math.sqrt(variance);

            // Coefficient de variation (écart-type / moyenne)
            const cv = stdDev / avgDiff;

            // Transformer en score (0-100)
            // CV faible = interactions plus régulières = meilleur score
            // CV élevé = interactions irrégulières = score plus faible
            attentionFactors.regularInteraction = Math.min(100, Math.max(0, 100 - cv * 50));
        }

        // Évaluer la qualité des interactions
        const successfulInteractions = interactions.filter(
            i => i.details && i.details.success === true
        ).length;

        attentionFactors.interactionQuality = interactions.length > 0
            ? (successfulInteractions / interactions.length) * 100
            : 50;

        // Calculer le score global d'attention (pondéré)
        const attentionScore =
            attentionFactors.regularInteraction * 0.2 +
            attentionFactors.completionRate * 0.3 +
            attentionFactors.timeEngagement * 0.3 +
            attentionFactors.interactionQuality * 0.2;

        return Math.round(attentionScore);
    }

    /**
     * Calcule la fréquence d'interaction
     */
    private calculateInteractionFrequency(interactions: UserInteraction[]): number {
        if (interactions.length <= 1) {
            return 0;
        }

        // Trier les interactions par horodatage
        const sortedInteractions = [...interactions].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Calculer la durée totale des interactions (en minutes)
        const startTime = sortedInteractions[0].timestamp.getTime();
        const endTime = sortedInteractions[sortedInteractions.length - 1].timestamp.getTime();
        const durationMinutes = (endTime - startTime) / (1000 * 60);

        // Si la durée est trop courte, retourner une valeur par défaut
        if (durationMinutes < 0.1) {
            return interactions.length * 10; // Valeur arbitraire élevée
        }

        // Calculer la fréquence (interactions par minute)
        return (interactions.length - 1) / durationMinutes;
    }

    /**
     * Calcule le taux de complétion des activités
     */
    private calculateCompletionRate(interactions: UserInteraction[]): number {
        // Identifier les activités uniques
        const uniqueActivities = new Set(interactions.map(i => i.activityId));

        // Compter les activités complétées
        const completedActivities = new Set(
            interactions
                .filter(i => i.interactionType === 'complete' || i.interactionType.includes('completion'))
                .map(i => i.activityId)
        );

        // Calculer le taux de complétion
        return uniqueActivities.size > 0
            ? (completedActivities.size / uniqueActivities.size) * 100
            : 0;
    }

    /**
     * Calcule le temps moyen par activité
     */
    private calculateAverageTimePerActivity(interactions: UserInteraction[]): number {
        // Filtrer les interactions avec durée
        const interactionsWithDuration = interactions.filter(i => i.duration !== undefined);

        if (interactionsWithDuration.length === 0) {
            return 0;
        }

        // Calculer la durée totale
        const totalDuration = interactionsWithDuration.reduce(
            (sum, interaction) => sum + (interaction.duration || 0),
            0
        );

        // Calculer la moyenne (en secondes)
        return totalDuration / interactionsWithDuration.length / 1000;
    }

    /**
     * Compte les vues répétées de contenu
     */
    private countRepeatedContentViews(interactions: UserInteraction[]): number {
        // Compter les occurrences de chaque activité
        const activityCounts: Record<string, number> = {};

        for (const interaction of interactions) {
            activityCounts[interaction.activityId] = (activityCounts[interaction.activityId] || 0) + 1;
        }

        // Compter les activités vues plus d'une fois
        let repeatedViews = 0;

        for (const count of Object.values(activityCounts)) {
            if (count > 1) {
                repeatedViews += count - 1;
            }
        }

        return repeatedViews;
    }

    /**
     * Détecte des patterns d'utilisation
     */
    private detectPatterns(interactions: UserInteraction[]): UsagePatterns {
        // Valeurs par défaut
        const patterns: UsagePatterns = {
            regularBreaks: false,
            consistentTimes: false,
            preferredContentTypes: []
        };

        // Si pas assez d'interactions, retourner les valeurs par défaut
        if (interactions.length < 5) {
            return patterns;
        }

        // Analyser les pauses régulières
        const sortedInteractions = [...interactions].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        const timeDiffs = [];
        for (let i = 1; i < sortedInteractions.length; i++) {
            timeDiffs.push(sortedInteractions[i].timestamp.getTime() - sortedInteractions[i - 1].timestamp.getTime());
        }

        // Calculer l'écart-type des différences de temps
        const avgDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
        const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / timeDiffs.length;
        const stdDev = Math.sqrt(variance);

        // Coefficient de variation (écart-type / moyenne)
        const cv = stdDev / avgDiff;

        // CV faible = temps plus réguliers
        patterns.regularBreaks = cv < 0.5;

        // Vérifier la cohérence des heures d'utilisation
        const hours = sortedInteractions.map(i => i.timestamp.getHours());
        const hourCounts: Record<number, number> = {};

        for (const hour of hours) {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }

        // Trouver l'heure la plus fréquente
        let maxCount = 0;
        for (const count of Object.values(hourCounts)) {
            if (count > maxCount) {
                maxCount = count;
            }
        }

        // Si plus de 70% des interactions se produisent à la même heure
        patterns.consistentTimes = maxCount > interactions.length * 0.7;

        // Identifier les types de contenu préférés
        const contentTypeCounts: Record<string, number> = {};

        for (const interaction of interactions) {
            // Extraire le type de contenu de l'ID d'activité (par exemple "lesson_1" -> "lesson")
            const contentType = interaction.activityId.split('_')[0];

            if (contentType) {
                contentTypeCounts[contentType] = (contentTypeCounts[contentType] || 0) + 1;
            }
        }

        // Trier par popularité et prendre les 3 premiers
        patterns.preferredContentTypes = Object.entries(contentTypeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => type);

        return patterns;
    }
}