/**
 * @file src/ai/services/learning/metrics/utils/MetricsUpdateHelpers.ts
 * @description Helpers pour la mise à jour des métriques d'apprentissage
 * @module MetricsUpdateHelpers
 * @requires @/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/calculators/MetricsCalculator
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { DetailedUserMetricsProfile } from '../types/DetailedMetricsTypes';
import { MetricsCalculator } from '../calculators/MetricsCalculator';

/**
 * Interface locale pour le profil d'apprentissage inversé
 */
interface UserReverseProfile {
    currentLevel: number;
    strengthAreas: string[];
    weaknessAreas: string[];
    progressHistory: Array<{
        scores: Record<string, number>;
        timestamp: Date;
    }>;
}

/**
 * Classe utilitaire pour les mises à jour de métriques
 * @class MetricsUpdateHelpers
 * @description Centralise les méthodes de mise à jour des profils de métriques
 */
export class MetricsUpdateHelpers {
    private readonly calculator: MetricsCalculator;

    /**
     * Constructeur
     * @constructor
     */
    constructor() {
        this.calculator = new MetricsCalculator();
    }

    /**
     * Met à jour l'historique des niveaux
     * @param {DetailedUserMetricsProfile} profile - Profil de métriques
     * @param {UserReverseProfile} reverseProfile - Profil d'apprentissage
     * @public
     */
    public updateLevelHistory(
        profile: DetailedUserMetricsProfile,
        reverseProfile: UserReverseProfile
    ): void {
        const lastEntry = profile.progression.levelHistory.length > 0
            ? profile.progression.levelHistory[profile.progression.levelHistory.length - 1]
            : null;

        if (!lastEntry || lastEntry.level !== reverseProfile.currentLevel.toString()) {
            const now = new Date();
            const duration = lastEntry
                ? Math.floor((now.getTime() - lastEntry.achievedAt.getTime()) / (1000 * 60 * 60 * 24))
                : undefined;

            profile.progression.levelHistory.push({
                level: reverseProfile.currentLevel.toString(),
                achievedAt: now,
                duration
            });
        }
    }

    /**
     * Synchronise la progression avec le profil inversé
     * @param {DetailedUserMetricsProfile} profile - Profil de métriques
     * @param {UserReverseProfile} reverseProfile - Profil d'apprentissage inversé
     * @public
     */
    public syncProgressionWithReverseProfile(
        profile: DetailedUserMetricsProfile,
        reverseProfile: UserReverseProfile
    ): void {
        // Mettre à jour la progression
        profile.progression.currentLevel = reverseProfile.currentLevel.toString();

        // Gérer l'historique des niveaux
        this.updateLevelHistory(profile, reverseProfile);

        // Calculer la vitesse de progression
        profile.progression.progressionSpeed = this.calculator.calculateProgressionSpeed(
            profile.progression.levelHistory
        );

        // Mettre à jour la progression dans le niveau
        const lastProgress = reverseProfile.progressHistory.length > 0
            ? reverseProfile.progressHistory[reverseProfile.progressHistory.length - 1]
            : null;

        if (lastProgress) {
            profile.progression.progressInCurrentLevel = this.calculator.estimateLevelProgress(
                lastProgress.scores
            );

            // Mettre à jour la progression par domaine
            profile.progression.skillAreaProgress = { ...lastProgress.scores };
        }
    }

    /**
     * Synchronise les compétences avec le profil inversé
     * @param {DetailedUserMetricsProfile} profile - Profil de métriques
     * @param {UserReverseProfile} reverseProfile - Profil d'apprentissage inversé
     * @public
     */
    public syncMasteryWithReverseProfile(
        profile: DetailedUserMetricsProfile,
        reverseProfile: UserReverseProfile
    ): void {
        // Synchroniser forces et faiblesses
        profile.mastery.masteredSkills = [...reverseProfile.strengthAreas];
        profile.mastery.weaknessSkills = [...reverseProfile.weaknessAreas];
        profile.mastery.masteredSkillsCount = reverseProfile.strengthAreas.length;
    }

    /**
     * Met à jour les métriques d'engagement de session
     * @param {DetailedUserMetricsProfile} profile - Profil de métriques
     * @param {number} sessionDuration - Durée de la session en minutes
     * @param {number} exercisesCompleted - Nombre d'exercices complétés
     * @public
     */
    public updateSessionEngagement(
        profile: DetailedUserMetricsProfile,
        sessionDuration: number,
        exercisesCompleted: number
    ): void {
        const { engagement } = profile;

        engagement.averageSessionDuration = this.calculator.updateRollingAverage(
            engagement.averageSessionDuration,
            sessionDuration,
            10
        );

        engagement.exercisesPerSession = this.calculator.updateRollingAverage(
            engagement.exercisesPerSession,
            exercisesCompleted,
            10
        );

        engagement.totalLearningTime += sessionDuration;
    }

    /**
     * Calcule la fréquence d'utilisation
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<number>} Fréquence estimée
     * @public
     * @async
     */
    public async calculateUsageFrequency(userId: string): Promise<number> {
        // Simuler un calcul basé sur l'userId
        const userIdHash = this.hashUserId(userId);
        
        // Utiliser le hash pour générer une fréquence simulée (entre 1 et 7)
        const baseFrequency = (userIdHash % 7) + 1;
        
        // Ajouter une variation temporelle basée sur la date actuelle
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const temporalVariation = Math.sin(dayOfYear / 365 * Math.PI * 2) * 2;
        
        return Math.max(1, Math.round(baseFrequency + temporalVariation));
    }

    /**
     * Calcule un hash simple pour un userId
     * @private
     */
    private hashUserId(userId: string): number {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en 32-bit integer
        }
        return Math.abs(hash);
    }
}