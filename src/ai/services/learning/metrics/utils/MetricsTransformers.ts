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
        // Créer un profil de base avec les propriétés définies dans l'interface
        const baseProfile: UserMetricsProfile = {
            userId: detailedProfile.userId,
            createdAt: detailedProfile.createdAt,
            updatedAt: detailedProfile.lastUpdated,
            standardMetrics: {},
            customMetrics: detailedProfile.customMetrics ? { ...detailedProfile.customMetrics } : {}
        };

        // Ajouter les métriques standards extraites du profil détaillé
        if (baseProfile.standardMetrics) {
            baseProfile.standardMetrics['currentLevel'] = {
                id: 'currentLevel',
                name: 'Niveau Actuel',
                value: detailedProfile.progression.currentLevel,
                updatedAt: detailedProfile.lastUpdated
            };

            baseProfile.standardMetrics['progressInLevel'] = {
                id: 'progressInLevel', 
                name: 'Progression dans le Niveau',
                value: detailedProfile.progression.progressInCurrentLevel,
                updatedAt: detailedProfile.lastUpdated
            };

            baseProfile.standardMetrics['masteredSkillsCount'] = {
                id: 'masteredSkillsCount',
                name: 'Nombre de Compétences Maîtrisées',
                value: detailedProfile.mastery.masteredSkillsCount,
                updatedAt: detailedProfile.lastUpdated
            };
        }

        return baseProfile;
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

        // Types d'erreurs - utiliser une interface étendue
        const extendedResult = result as ExerciseResult & {
            errors?: Array<{ type: string }>;
            timeSpent?: number;
            attempts?: number;
            timestamp?: Date;
            metadata?: Record<string, unknown>;
        };
        
        const errorTypes = extendedResult.errors?.map((error: { type: string }) => error.type) || [];

        // Créer le résultat étendu
        return {
            exerciseId: result.exerciseId,
            exerciseType,
            score: result.score,
            timeSpent: extendedResult.timeSpent || 0,
            skills,
            skillScores: result.skillScores || {},
            attempts: extendedResult.attempts || 1,
            errorTypes,
            timestamp: extendedResult.timestamp || new Date(),
            metadata: extendedResult.metadata || {}
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
        let current: unknown = profile;

        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }

            // Type guard pour vérifier si current est un objet
            if (typeof current === 'object' && current !== null) {
                current = (current as Record<string, unknown>)[part];
            } else {
                return undefined;
            }
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
            // Estimer le temps basé sur la progression et le score de performance
            const performanceScore = profile.performance.successRate || 0.5;
            const progressionFactor = performanceScore * 2; // Plus de performance = progression plus rapide
            const baseDays = 30; // Jours de base pour un niveau
            
            return Math.ceil(baseDays * (1 - progressInLevel) / Math.max(0.1, progressionFactor));
        }

        // Calculer la durée moyenne par niveau
        const totalDuration = history.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const averageDuration = totalDuration / (history.length - 1);

        // Ajuster l'estimation basée sur la performance
        const performanceScore = profile.performance.successRate || 0.5;
        const adjustmentFactor = Math.max(0.5, Math.min(2.0, 1 / performanceScore)); // Entre 0.5x et 2x

        // Estimer le temps restant avec ajustement
        return Math.ceil(averageDuration * (1 - progressInLevel) * adjustmentFactor);
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

        // Calculer la moyenne simple et la normaliser
        const sum = skillLevels.reduce((total, level) => total + level, 0);
        const average = sum / skillLevels.length;
        
        // Normaliser entre 0 et 1
        return Math.max(0, Math.min(1, average));
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

        // Utiliser le calculateur pour une moyenne exponentielle mobile
        const factors = [frequencyFactor, durationFactor, streakFactor, completionFactor];
        const weights = [0.3, 0.2, 0.3, 0.2];
        
        let weightedScore = 0;
        for (let i = 0; i < factors.length; i++) {
            const smoothedFactor = this.calculator.calculateExponentialMovingAverage(
                factors[i],
                factors[i],
                0.3
            );
            weightedScore += smoothedFactor * weights[i];
        }

        // Normaliser sur 100
        return Math.round(weightedScore * 100);
    }
}