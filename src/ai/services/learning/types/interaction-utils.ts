/**
 * Utilitaires pour les interactions utilisateur - Module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/interaction-utils.ts
 * @module ai/services/learning/types
 * @description Fonctions utilitaires pour la manipulation et l'analyse des interactions utilisateur
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

import type { UserInteraction, InteractionStatistics, DeviceInfo } from './interaction';
import { InteractionType } from './base';
import { LEARNING_CONSTANTS } from './constants';

/**
 * Utilitaires spécialisés pour les interactions utilisateur
 * @namespace InteractionUtils
 */
export const InteractionUtils = {
    /**
     * Calcule les statistiques de base pour une liste d'interactions
     * @param interactions Liste des interactions à analyser
     * @returns Statistiques détaillées
     */
    calculateBasicStatistics(interactions: ReadonlyArray<UserInteraction>): InteractionStatistics {
        if (interactions.length === 0) {
            return InteractionUtils.createEmptyStatistics();
        }

        const totalInteractions = interactions.length;
        const totalDuration = interactions.reduce((sum, i) => sum + i.duration, 0);
        const averageDuration = totalDuration / totalInteractions;

        const successfulInteractions = interactions.filter(i => i.details.success);
        const successRate = successfulInteractions.length / totalInteractions;

        const scoresWithValues: number[] = [];
        interactions.forEach(i => {
            if (i.details.score !== undefined && typeof i.details.score === 'number') {
                scoresWithValues.push(i.details.score);
            }
        });
        const averageScore = scoresWithValues.length > 0
            ? scoresWithValues.reduce((sum, score) => sum + score, 0) / scoresWithValues.length
            : undefined;

        const interactionsByType = InteractionUtils.groupByType(interactions);
        const interactionsByActivity = InteractionUtils.groupByActivity(interactions);
        const interactionsByDevice = InteractionUtils.groupByDevice(interactions);
        const dailyInteractions = InteractionUtils.groupByDay(interactions);

        const performanceStats = InteractionUtils.calculatePerformanceStats(interactions);
        const period = InteractionUtils.calculatePeriod(interactions);

        return {
            totalInteractions,
            totalDuration,
            averageDuration,
            successRate,
            averageScore,
            interactionsByType,
            interactionsByActivity,
            interactionsByDevice,
            dailyInteractions,
            performanceStats,
            period
        };
    },

    /**
     * Crée des statistiques vides par défaut
     * @returns Statistiques initialisées à zéro
     */
    createEmptyStatistics(): InteractionStatistics {
        const interactionsByType = {} as Record<InteractionType, number>;
        LEARNING_CONSTANTS.VALID_INTERACTION_TYPES.forEach(type => {
            interactionsByType[type] = 0;
        });

        const interactionsByDevice = {} as Record<DeviceInfo['type'], number>;
        LEARNING_CONSTANTS.SUPPORTED_DEVICE_TYPES.forEach(type => {
            interactionsByDevice[type] = 0;
        });

        const now = new Date();

        return {
            totalInteractions: 0,
            totalDuration: 0,
            averageDuration: 0,
            successRate: 0,
            interactionsByType,
            interactionsByActivity: {},
            interactionsByDevice,
            dailyInteractions: {},
            performanceStats: {
                bestStreak: 0,
                currentStreak: 0,
                totalErrors: 0,
                helpRequests: 0
            },
            period: {
                startDate: now,
                endDate: now
            }
        };
    },

    /**
     * Filtre les interactions par type
     * @param interactions Liste des interactions
     * @param types Types d'interactions à inclure
     * @returns Interactions filtrées
     */
    filterByType(
        interactions: ReadonlyArray<UserInteraction>,
        types: ReadonlyArray<InteractionType>
    ): ReadonlyArray<UserInteraction> {
        return interactions.filter(interaction =>
            types.includes(interaction.interactionType)
        );
    },

    /**
     * Filtre les interactions par plage de dates
     * @param interactions Liste des interactions
     * @param startDate Date de début
     * @param endDate Date de fin
     * @returns Interactions filtrées
     */
    filterByDateRange(
        interactions: ReadonlyArray<UserInteraction>,
        startDate: Date,
        endDate: Date
    ): ReadonlyArray<UserInteraction> {
        return interactions.filter(interaction =>
            interaction.timestamp >= startDate && interaction.timestamp <= endDate
        );
    },

    /**
     * Groupe les interactions par type
     * @param interactions Liste des interactions
     * @returns Comptage par type d'interaction
     */
    groupByType(interactions: ReadonlyArray<UserInteraction>): Record<InteractionType, number> {
        const groups = {} as Record<InteractionType, number>;

        // Initialiser tous les types à 0
        LEARNING_CONSTANTS.VALID_INTERACTION_TYPES.forEach(type => {
            groups[type] = 0;
        });

        // Compter les interactions
        interactions.forEach(interaction => {
            groups[interaction.interactionType] += 1;
        });

        return groups;
    },

    /**
     * Groupe les interactions par activité
     * @param interactions Liste des interactions
     * @returns Comptage par activité
     */
    groupByActivity(interactions: ReadonlyArray<UserInteraction>): Record<string, number> {
        const groups: Record<string, number> = {};

        interactions.forEach(interaction => {
            const activity = interaction.activityId;
            groups[activity] = (groups[activity] || 0) + 1;
        });

        return groups;
    },

    /**
     * Groupe les interactions par type d'appareil
     * @param interactions Liste des interactions
     * @returns Comptage par type d'appareil
     */
    groupByDevice(interactions: ReadonlyArray<UserInteraction>): Record<DeviceInfo['type'], number> {
        const groups = {} as Record<DeviceInfo['type'], number>;

        // Initialiser tous les types d'appareils à 0
        (['desktop', 'tablet', 'mobile', 'tv', 'vr', 'other'] as const).forEach(type => {
            groups[type] = 0;
        });

        // Compter les interactions
        interactions.forEach(interaction => {
            groups[interaction.deviceInfo.type] += 1;
        });

        return groups;
    },

    /**
     * Groupe les interactions par jour
     * @param interactions Liste des interactions
     * @returns Comptage par jour (format YYYY-MM-DD)
     */
    groupByDay(interactions: ReadonlyArray<UserInteraction>): Record<string, number> {
        const groups: Record<string, number> = {};

        interactions.forEach(interaction => {
            const day = interaction.timestamp.toISOString().split('T')[0];
            groups[day] = (groups[day] || 0) + 1;
        });

        return groups;
    },

    /**
     * Calcule les statistiques de performance
     * @param interactions Liste des interactions
     * @returns Statistiques de performance
     */
    calculatePerformanceStats(interactions: ReadonlyArray<UserInteraction>) {
        const errors = interactions.filter(i =>
            i.details.errors && i.details.errors.length > 0
        ).length;

        const helpRequests = interactions.filter(i =>
            i.details.helpUsed === true
        ).length;

        const thinkingTimes: number[] = [];
        interactions.forEach(i => {
            if (i.details.thinkingTime !== undefined && typeof i.details.thinkingTime === 'number') {
                thinkingTimes.push(i.details.thinkingTime);
            }
        });

        const averageThinkingTime = thinkingTimes.length > 0
            ? thinkingTimes.reduce((sum, time) => sum + time, 0) / thinkingTimes.length
            : undefined;

        const { bestStreak, currentStreak } = InteractionUtils.calculateStreaks(interactions);

        return {
            bestStreak,
            currentStreak,
            totalErrors: errors,
            helpRequests,
            averageThinkingTime
        };
    },

    /**
     * Calcule les séries de succès/échecs
     * @param interactions Liste des interactions
     * @returns Meilleures et actuelles séries
     */
    calculateStreaks(interactions: ReadonlyArray<UserInteraction>): { bestStreak: number; currentStreak: number } {
        let bestStreak = 0;
        let currentStreak = 0;

        interactions.forEach(interaction => {
            if (interaction.details.success) {
                currentStreak += 1;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        return { bestStreak, currentStreak };
    },

    /**
     * Calcule la période couverte par les interactions
     * @param interactions Liste des interactions
     * @returns Période de début et fin
     */
    calculatePeriod(interactions: ReadonlyArray<UserInteraction>) {
        const timestamps = interactions.map(i => i.timestamp);
        const startDate = new Date(Math.min(...timestamps.map(t => t.getTime())));
        const endDate = new Date(Math.max(...timestamps.map(t => t.getTime())));

        return { startDate, endDate };
    }
} as const;