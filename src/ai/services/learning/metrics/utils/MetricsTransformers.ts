/**
 * @file src/ai/services/learning/metrics/utils/MetricsTransformers.ts
 * @description Transformateurs pour les métriques d'apprentissage
 * @module MetricsTransformers
 * @requires @/ai/services/learning/human/coda/codavirtuel/repositories/UserReverseApprenticeshipRepository
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/calculators/MetricsCalculator
 * @requires @/ai/services/learning/metrics/processors/PerformanceMetricsProcessor
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module fournit des fonctions pour transformer les données entre différents
 * formats de métriques utilisés dans le système d'apprentissage.
 */

import { ExerciseResult } from '../../human/coda/codavirtuel/repositories/UserReverseApprenticeshipRepository';
import { UserMetricsProfile, LearningMetric } from '../interfaces/MetricsInterfaces';
import { DetailedUserMetricsProfile } from '../types/DetailedMetricsTypes';
import { MetricsCalculator } from '../calculators/MetricsCalculator';
import { ExtendedExerciseResult } from '../processors/PerformanceMetricsProcessor';

/**
 * Classe utilitaire pour transformer les données de métriques
 * 
 * @class MetricsTransformers
 * @description Fournit des méthodes pour transformer les données entre
 * différents formats de métriques
 */
export class MetricsTransformers {
    /**
     * Calculateur de métriques
     * @private
     * @readonly
     */
    private readonly calculator: MetricsCalculator;

    /**
     * Constructeur des transformateurs
     * 
     * @constructor
     */
    constructor() {
        this.calculator = new MetricsCalculator();
    }

    /**
     * Transforme un profil détaillé en profil de base
     * 
     * @method transformToBaseProfile
     * @param {DetailedUserMetricsProfile} detailedProfile - Profil détaillé
     * @returns {UserMetricsProfile} Profil de base
     * @public
     */
    public transformToBaseProfile(detailedProfile: DetailedUserMetricsProfile): UserMetricsProfile {
        // Extraire les principales métriques pour le profil de base
        return {
            userId: detailedProfile.userId,
            createdAt: detailedProfile.createdAt,
            lastUpdated: detailedProfile.lastUpdated,

            // Métriques de base
            currentLevel: detailedProfile.progression.currentLevel,
            progressInLevel: detailedProfile.progression.progressInCurrentLevel,
            masteredSkillsCount: detailedProfile.mastery.masteredSkillsCount,
            successRate: detailedProfile.performance.successRate,
            totalExercisesCompleted: detailedProfile.performance.totalExercisesCompleted,
            averageSessionDuration: detailedProfile.engagement.averageSessionDuration,
            weaknessAreas: [...detailedProfile.mastery.weaknessSkills],
            strengthAreas: [...detailedProfile.mastery.masteredSkills],

            // Métriques personnalisées (si présentes)
            customMetrics: detailedProfile.customMetrics ? { ...detailedProfile.customMetrics } : {}
        };
    }

    /**
     * Transforme un résultat d'exercice en résultat étendu
     * 
     * @method transformExerciseResult
     * @param {ExerciseResult} result - Résultat d'exercice
     * @returns {ExtendedExerciseResult} Résultat étendu
     * @public
     */
    public transformExerciseResult(result: ExerciseResult): ExtendedExerciseResult {
        // Extraire les compétences et scores
        const skills: string[] = Object.keys(result.skillScores || {});

        // Déterminer le type d'exercice
        const exerciseType = result.exerciseType || this.inferExerciseType(result);

        // Types d'erreurs
        const errorTypes = result.errors?.map(error => error.type) || [];

        // Créer le résultat étendu
        return {
            exerciseId: result.exerciseId,
            exerciseType,
            score: result.score,
            timeSpent: result.timeSpent || 0,
            skills,
            skillScores: result.skillScores || {},
            attempts: result.attempts || 1,
            errorTypes,
            timestamp: result.timestamp || new Date(),
            metadata: result.metadata || {}
        };
    }

    /**
     * Infère le type d'exercice à partir du résultat
     * 
     * @method inferExerciseType
     * @param {ExerciseResult} result - Résultat d'exercice
     * @returns {string} Type d'exercice
     * @private
     */
    private inferExerciseType(result: ExerciseResult): string {
        // Essayer d'identifier le type d'exercice à partir de l'ID
        const id = result.exerciseId.toLowerCase();

        if (id.includes('quiz') || id.includes('qcm') || id.includes('choice')) {
            return 'multiple_choice';
        }

        if (id.includes('drag') || id.includes('drop')) {
            return 'drag_drop';
        }

        if (id.includes('fill') || id.includes('blank')) {
            return 'fill_blank';
        }

        if (id.includes('video') || id.includes('response')) {
            return 'video_response';
        }

        if (id.includes('sign') || id.includes('practice')) {
            return 'signing_practice';
        }

        // Type par défaut
        return 'unknown';
    }

    /**
     * Extrait une métrique d'un profil détaillé
     * 
     * @method extractMetricFromProfile
     * @param {string} metricId - Identifiant de la métrique
     * @param {DetailedUserMetricsProfile} profile - Profil détaillé
     * @returns {LearningMetric | undefined} Métrique extraite ou undefined
     * @public
     */
    public extractMetricFromProfile(
        metricId: string,
        profile: DetailedUserMetricsProfile
    ): LearningMetric | undefined {
        // Vérifier d'abord dans les métriques personnalisées
        if (profile.customMetrics && profile.customMetrics[metricId]) {
            return profile.customMetrics[metricId];
        }

        // Vérifier dans les métriques standards
        if (profile.standardMetrics && profile.standardMetrics[metricId]) {
            return profile.standardMetrics[metricId];
        }

        // Essayer d'extraire à partir des propriétés du profil
        const value = this.extractMetricValue(profile, metricId);

        if (value !== undefined) {
            // Créer une métrique à la volée
            return {
                id: metricId,
                name: this.formatMetricName(metricId),
                value,
                updatedAt: profile.lastUpdated
            };
        }

        return undefined;
    }

    /**
     * Extrait la valeur d'une métrique d'un profil
     * 
     * @method extractMetricValue
     * @param {DetailedUserMetricsProfile} profile - Profil détaillé
     * @param {string} path - Chemin de la métrique
     * @returns {unknown} Valeur de la métrique
     * @private
     */
    private extractMetricValue(profile: DetailedUserMetricsProfile, path: string): unknown {
        const parts = path.split('.');
        let current: any = profile;

        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }

            current = current[part];
        }

        return current;
    }

    /**
     * Formate le nom d'une métrique à partir de son ID
     * 
     * @method formatMetricName
     * @param {string} metricId - Identifiant de la métrique
     * @returns {string} Nom formaté
     * @private
     */
    private formatMetricName(metricId: string): string {
        // Remplacer les points par des espaces
        const words = metricId.split('.');

        // Mettre en majuscule la première lettre de chaque mot
        const formattedWords = words.map(word => {
            // Séparer les mots en camelCase
            const camelCaseWords = word.replace(/([A-Z])/g, ' $1');

            // Mettre en majuscule la première lettre
            return camelCaseWords.charAt(0).toUpperCase() + camelCaseWords.slice(1);
        });

        return formattedWords.join(' - ');
    }

    /**
     * Enrichit un profil détaillé avec des métriques calculées
     * 
     * @method enrichWithCalculatedMetrics
     * @param {DetailedUserMetricsProfile} profile - Profil détaillé
     * @returns {DetailedUserMetricsProfile} Profil enrichi
     * @public
     */
    public enrichWithCalculatedMetrics(profile: DetailedUserMetricsProfile): DetailedUserMetricsProfile {
        // Créer une copie du profil
        const enrichedProfile = { ...profile };

        // Initialiser les métriques standards si nécessaire
        if (!enrichedProfile.standardMetrics) {
            enrichedProfile.standardMetrics = {};
        }

        // Ajouter des métriques calculées

        // Progression
        enrichedProfile.standardMetrics['estimatedTimeToNextLevel'] = {
            id: 'estimatedTimeToNextLevel',
            name: 'Temps estimé jusqu\'au prochain niveau',
            value: this.calculateEstimatedTimeToNextLevel(profile),
            updatedAt: new Date()
        };

        // Performance
        enrichedProfile.standardMetrics['performanceTrend'] = {
            id: 'performanceTrend',
            name: 'Tendance de performance',
            value: profile.performance.performanceTrend,
            updatedAt: new Date()
        };

        // Maîtrise
        enrichedProfile.standardMetrics['overallMasteryLevel'] = {
            id: 'overallMasteryLevel',
            name: 'Niveau de maîtrise global',
            value: this.calculateOverallMasteryLevel(profile),
            updatedAt: new Date()
        };

        // Engagement
        enrichedProfile.standardMetrics['engagementScore'] = {
            id: 'engagementScore',
            name: 'Score d\'engagement',
            value: this.calculateEngagementScore(profile),
            updatedAt: new Date()
        };

        return enrichedProfile;
    }

    /**
     * Calcule le temps estimé jusqu'au prochain niveau
     * 
     * @method calculateEstimatedTimeToNextLevel
     * @param {DetailedUserMetricsProfile} profile - Profil détaillé
     * @returns {number} Temps estimé en jours
     * @private
     */
    private calculateEstimatedTimeToNextLevel(profile: DetailedUserMetricsProfile): number {
        // Si la progression est déjà élevée, le temps restant est court
        const progressInLevel = profile.progression.progressInCurrentLevel;

        if (progressInLevel > 0.9) {
            return 1; // Environ 1 jour
        }

        // Utiliser l'historique des niveaux pour estimer la vitesse de progression
        const history = profile.progression.levelHistory;

        if (history.length < 2) {
            // Par défaut, estimer 30 jours pour un niveau
            return Math.ceil(30 * (1 - progressInLevel));
        }

        // Calculer la durée moyenne par niveau
        const totalDuration = history.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const averageDuration = totalDuration / (history.length - 1);

        // Estimer le temps restant
        return Math.ceil(averageDuration * (1 - progressInLevel));
    }

    /**
     * Calcule le niveau de maîtrise global
     * 
     * @method calculateOverallMasteryLevel
     * @param {DetailedUserMetricsProfile} profile - Profil détaillé
     * @returns {number} Niveau de maîtrise (0-1)
     * @private
     */
    private calculateOverallMasteryLevel(profile: DetailedUserMetricsProfile): number {
        const skillLevels = Object.values(profile.mastery.skillMasteryLevels);

        if (skillLevels.length === 0) {
            return 0;
        }

        // Calculer la moyenne
        const sum = skillLevels.reduce((total, level) => total + level, 0);
        return sum / skillLevels.length;
    }

    /**
     * Calcule un score d'engagement
     * 
     * @method calculateEngagementScore
     * @param {DetailedUserMetricsProfile} profile - Profil détaillé
     * @returns {number} Score d'engagement (0-100)
     * @private
     */
    private calculateEngagementScore(profile: DetailedUserMetricsProfile): number {
        const { engagement } = profile;

        // Facteurs d'engagement
        const frequencyFactor = Math.min(1, engagement.usageFrequency / 7); // Normalisé à 1 session par jour
        const durationFactor = Math.min(1, engagement.averageSessionDuration / 60); // Normalisé à 1 heure
        const streakFactor = Math.min(1, engagement.streakDays / 14); // Normalisé à 2 semaines
        const completionFactor = engagement.sessionCompletionRate;

        // Pondération des facteurs
        const weightedScore = (
            frequencyFactor * 0.3 +
            durationFactor * 0.2 +
            streakFactor * 0.3 +
            completionFactor * 0.2
        );

        // Normaliser sur 100
        return Math.round(weightedScore * 100);
    }
}