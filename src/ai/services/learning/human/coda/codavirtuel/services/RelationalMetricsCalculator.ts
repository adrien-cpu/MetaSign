/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/RelationalMetricsCalculator.ts
 * @description Calculateur spécialisé pour les métriques relationnelles CODA
 * 
 * Responsabilités :
 * - 🤝 Calcul de l'efficacité communicationnelle
 * - ❤️ Évaluation du niveau d'empathie
 * - ⚡ Mesure de la vitesse d'adaptation
 * - 💬 Analyse de la qualité du feedback
 * - 🏗️ Évaluation de la construction de confiance
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @module services
 * @version 4.0.0 - Calculateur de métriques relationnelles CODA
 * @since 2025
 * @author MetaSign Team - CODA Relational Metrics Calculator
 * @lastModified 2025-07-27
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    MentorProfile,
    TeachingSession,
    RelationalPerformanceMetrics
} from '../types/CompatibilityTypes';

/**
 * Calculateur de métriques relationnelles pour le système CODA
 * 
 * @class RelationalMetricsCalculator
 * @description Service spécialisé dans le calcul des métriques de performance
 * relationnelle entre mentors et IA-élèves, avec analyse de l'évolution temporelle.
 * 
 * @example
 * ```typescript
 * const calculator = new RelationalMetricsCalculator();
 * 
 * const metrics = calculator.calculateMetrics(mentorProfile, sessions);
 * console.log(`Communication: ${metrics.communicationEffectiveness}`);
 * ```
 */
export class RelationalMetricsCalculator {
    /**
     * Logger pour le calculateur de métriques relationnelles
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('RelationalMetricsCalculator');

    /**
     * Seuils pour l'évaluation des métriques relationnelles
     * @private
     * @readonly
     */
    private readonly metricThresholds = {
        excellent: 0.9,
        good: 0.75,
        adequate: 0.6,
        needsImprovement: 0.45
    } as const;

    /**
     * Pondérations pour les différents facteurs de calcul
     * @private
     * @readonly
     */
    private readonly weights = {
        recentSessions: 0.6,    // Sessions récentes plus importantes
        overallTrend: 0.4,      // Tendance générale
        personalityFactor: 0.2, // Impact de la personnalité
        experienceFactor: 0.15  // Impact de l'expérience
    } as const;

    /**
     * Constructeur du calculateur de métriques relationnelles
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('📊 RelationalMetricsCalculator initialisé');
    }

    /**
     * Calcule toutes les métriques relationnelles
     * 
     * @method calculateMetrics
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @returns {RelationalPerformanceMetrics} Métriques relationnelles complètes
     * @public
     */
    public calculateMetrics(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): RelationalPerformanceMetrics {
        try {
            this.logger.info('📊 Calcul métriques relationnelles', {
                mentorId: mentorProfile.id,
                sessionsCount: sessions.length
            });

            const communicationEffectiveness = this.calculateCommunicationEffectiveness(sessions);
            const empathyLevel = this.calculateEmpathyLevel(mentorProfile, sessions);
            const adaptationSpeed = this.calculateAdaptationSpeed(mentorProfile, sessions);
            const feedbackQuality = this.calculateFeedbackQuality(sessions);
            const motivationImpact = this.calculateMotivationImpact(sessions);
            const conflictResolution = this.calculateConflictResolution(mentorProfile, sessions);
            const trustBuilding = this.calculateTrustBuilding(sessions);

            const metrics: RelationalPerformanceMetrics = {
                communicationEffectiveness,
                empathyLevel,
                adaptationSpeed,
                feedbackQuality,
                motivationImpact,
                conflictResolution,
                trustBuilding
            };

            this.logger.info('✅ Métriques relationnelles calculées', {
                mentorId: mentorProfile.id,
                avgScore: this.calculateAverageScore(metrics).toFixed(2),
                topMetric: this.identifyTopMetric(metrics)
            });

            return metrics;

        } catch (error) {
            this.logger.error('❌ Erreur calcul métriques relationnelles', {
                mentorId: mentorProfile.id,
                error
            });
            return this.createDefaultMetrics();
        }
    }

    // ==================== CALCULS SPÉCIALISÉS DES MÉTRIQUES ====================

    /**
     * Calcule l'efficacité de la communication
     */
    private calculateCommunicationEffectiveness(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0.7;

        const recentSessions = this.getRecentSessions(sessions, 5);

        // Communication basée sur le taux de participation et la compréhension
        const participationScores = recentSessions.map(s => s.metrics.participationRate);
        const comprehensionScores = recentSessions.map(s => s.metrics.comprehensionScore);

        const avgParticipation = this.calculateAverage(participationScores);
        const avgComprehension = this.calculateAverage(comprehensionScores);

        // La communication est efficace si participation ET compréhension sont élevées
        const baseScore = (avgParticipation * 0.6 + avgComprehension * 0.4);

        // Bonus pour amélioration progressive
        const improvementBonus = this.calculateImprovementBonus(participationScores);

        return Math.min(1, baseScore + improvementBonus);
    }

    /**
     * Calcule le niveau d'empathie
     */
    private calculateEmpathyLevel(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): number {
        let empathyScore = 0.7; // Score de base

        // Bonus basé sur la personnalité
        const personalityBonus = this.getPersonalityEmpathyBonus(mentorProfile.personality);
        empathyScore += personalityBonus;

        // Bonus basé sur l'adaptabilité
        empathyScore += mentorProfile.adaptabilityScore * 0.2;

        // Analyse des sessions pour détecter l'empathie en action
        if (sessions.length > 0) {
            const empathyFromSessions = this.extractEmpathyFromSessions(sessions);
            empathyScore = empathyScore * 0.7 + empathyFromSessions * 0.3;
        }

        return Math.min(1, empathyScore);
    }

    /**
     * Calcule la vitesse d'adaptation
     */
    private calculateAdaptationSpeed(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): number {
        let adaptationSpeed = mentorProfile.adaptabilityScore;

        if (sessions.length > 2) {
            // Analyser l'amélioration de l'efficacité au fil des sessions
            const effectivenessProgression = this.calculateEffectivenessProgression(sessions);

            // Plus l'amélioration est rapide, meilleure est l'adaptation
            const adaptationBonus = Math.min(0.2, effectivenessProgression * 2);
            adaptationSpeed += adaptationBonus;

            // Analyser la variabilité des métriques (adaptation = moins de variabilité)
            const consistencyBonus = this.calculateConsistencyBonus(sessions);
            adaptationSpeed += consistencyBonus;
        }

        return Math.min(1, adaptationSpeed);
    }

    /**
     * Calcule la qualité du feedback
     */
    private calculateFeedbackQuality(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0.7;

        const recentSessions = this.getRecentSessions(sessions, 6);

        // Qualité du feedback mesurée par l'impact sur la progression
        const progressRates = recentSessions.map(s => s.metrics.progressRate);
        const teachingEffectiveness = recentSessions.map(s => s.metrics.teachingEffectiveness);

        const avgProgress = this.calculateAverage(progressRates);
        const avgEffectiveness = this.calculateAverage(teachingEffectiveness);

        // Feedback de qualité = progression + efficacité élevées
        const baseQuality = (avgProgress * 0.6 + avgEffectiveness * 0.4);

        // Bonus pour constance dans la qualité
        const consistencyBonus = this.calculateFeedbackConsistency(recentSessions);

        return Math.min(1, baseQuality + consistencyBonus);
    }

    /**
     * Calcule l'impact motivationnel
     */
    private calculateMotivationImpact(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0.7;

        const engagementLevels = sessions.map(s => s.metrics.engagementLevel);

        // Analyser la tendance d'engagement au fil du temps
        const engagementTrend = this.calculateTrend(engagementLevels);
        const currentEngagement = this.calculateAverage(
            this.getRecentSessions(sessions, 3).map(s => s.metrics.engagementLevel)
        );

        // Impact motivationnel = engagement actuel + tendance positive
        let motivationImpact = currentEngagement * 0.7;

        if (engagementTrend > 0) {
            motivationImpact += Math.min(0.3, engagementTrend * 2);
        }

        return Math.min(1, motivationImpact);
    }

    /**
     * Calcule la capacité de résolution de conflits
     */
    private calculateConflictResolution(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): number {
        // Base sur l'expérience et l'adaptabilité
        const experienceScore = Math.min(1, mentorProfile.experience / 5);
        const adaptabilityScore = mentorProfile.adaptabilityScore;

        let conflictResolution = (experienceScore * 0.6 + adaptabilityScore * 0.4);

        // Analyser les sessions pour détecter la gestion de difficultés
        if (sessions.length > 0) {
            const difficultyHandling = this.assessDifficultyHandling(sessions);
            conflictResolution = conflictResolution * 0.8 + difficultyHandling * 0.2;
        }

        return Math.min(1, conflictResolution);
    }

    /**
     * Calcule la construction de confiance
     */
    private calculateTrustBuilding(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 2) return 0.7;

        // Analyser l'évolution de l'engagement et de la participation
        const sessionCount = Math.min(10, sessions.length);
        const recentSessions = sessions.slice(-sessionCount);

        const engagementEvolution = this.calculateEvolutionScore(
            recentSessions.map(s => s.metrics.engagementLevel)
        );

        const participationEvolution = this.calculateEvolutionScore(
            recentSessions.map(s => s.metrics.participationRate)
        );

        // Confiance = amélioration progressive de l'engagement et participation
        const trustScore = (engagementEvolution * 0.6 + participationEvolution * 0.4);

        // Bonus pour stabilité (confiance = prévisibilité)
        const stabilityBonus = this.calculateStabilityBonus(recentSessions);

        return Math.min(1, trustScore + stabilityBonus);
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Obtient les sessions les plus récentes
     */
    private getRecentSessions(sessions: readonly TeachingSession[], count: number): readonly TeachingSession[] {
        return sessions.slice(-count);
    }

    /**
     * Calcule la moyenne d'un tableau de nombres
     */
    private calculateAverage(values: readonly number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calcule le bonus d'amélioration progressive
     */
    private calculateImprovementBonus(scores: readonly number[]): number {
        if (scores.length < 3) return 0;

        const recentAvg = this.calculateAverage(scores.slice(-2));
        const earlyAvg = this.calculateAverage(scores.slice(0, 2));

        const improvement = recentAvg - earlyAvg;
        return Math.max(0, Math.min(0.1, improvement));
    }

    /**
     * Obtient le bonus d'empathie basé sur la personnalité
     */
    private getPersonalityEmpathyBonus(personality: string): number {
        const empathyBonuses: Record<string, number> = {
            empathetic: 0.2,
            social: 0.15,
            adaptive: 0.1,
            supportive: 0.15,
            flexible: 0.1
        };

        return empathyBonuses[personality] || 0;
    }

    /**
     * Extrait l'empathie des données de sessions
     */
    private extractEmpathyFromSessions(sessions: readonly TeachingSession[]): number {
        // L'empathie se reflète dans l'engagement soutenu et la progression
        const recentSessions = this.getRecentSessions(sessions, 4);

        const engagementConsistency = this.calculateConsistency(
            recentSessions.map(s => s.metrics.engagementLevel)
        );

        const progressSupport = this.calculateAverage(
            recentSessions.map(s => s.metrics.progressRate)
        );

        return (engagementConsistency * 0.4 + progressSupport * 0.6);
    }

    /**
     * Calcule la progression de l'efficacité
     */
    private calculateEffectivenessProgression(sessions: readonly TeachingSession[]): number {
        const effectiveness = sessions.map(s => s.metrics.teachingEffectiveness);
        return this.calculateTrend(effectiveness);
    }

    /**
     * Calcule un bonus de consistance
     */
    private calculateConsistencyBonus(sessions: readonly TeachingSession[]): number {
        const effectiveness = sessions.map(s => s.metrics.teachingEffectiveness);
        const consistency = this.calculateConsistency(effectiveness);
        return Math.min(0.1, consistency * 0.2);
    }

    /**
     * Calcule la consistance du feedback
     */
    private calculateFeedbackConsistency(sessions: readonly TeachingSession[]): number {
        const progressRates = sessions.map(s => s.metrics.progressRate);
        const consistency = this.calculateConsistency(progressRates);
        return Math.min(0.15, consistency * 0.3);
    }

    /**
     * Calcule la tendance d'une série de valeurs
     */
    private calculateTrend(values: readonly number[]): number {
        if (values.length < 2) return 0;

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);

        return secondAvg - firstAvg;
    }

    /**
     * Évalue la gestion des difficultés
     */
    private assessDifficultyHandling(sessions: readonly TeachingSession[]): number {
        // Identifier les sessions difficiles (bas scores) et voir comment elles sont gérées
        const lowScoreSessions = sessions.filter(s =>
            s.metrics.teachingEffectiveness < 0.6 || s.metrics.engagementLevel < 0.6
        );

        if (lowScoreSessions.length === 0) return 0.8; // Pas de difficultés = bon score par défaut

        // Analyser si les sessions suivantes montrent une amélioration
        let recoveryScore = 0;
        lowScoreSessions.forEach(lowSession => {
            const sessionIndex = sessions.indexOf(lowSession);
            if (sessionIndex < sessions.length - 1) {
                const nextSession = sessions[sessionIndex + 1];
                if (nextSession.metrics.teachingEffectiveness > lowSession.metrics.teachingEffectiveness) {
                    recoveryScore += 0.2;
                }
            }
        });

        return Math.min(1, 0.5 + recoveryScore);
    }

    /**
     * Calcule un score d'évolution
     */
    private calculateEvolutionScore(values: readonly number[]): number {
        if (values.length < 3) return 0.7;

        const trend = this.calculateTrend(values);
        const currentLevel = this.calculateAverage(values.slice(-3));

        // Évolution positive = niveau actuel élevé + tendance positive
        return Math.min(1, currentLevel + Math.max(0, trend));
    }

    /**
     * Calcule un bonus de stabilité
     */
    private calculateStabilityBonus(sessions: readonly TeachingSession[]): number {
        const engagementStability = this.calculateConsistency(
            sessions.map(s => s.metrics.engagementLevel)
        );

        return Math.min(0.1, engagementStability * 0.2);
    }

    /**
     * Calcule la consistance d'une série de valeurs
     */
    private calculateConsistency(values: readonly number[]): number {
        if (values.length < 2) return 0.5;

        const mean = this.calculateAverage(values);
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);

        // Consistance = 1 - écart-type normalisé
        return Math.max(0, 1 - standardDeviation);
    }

    /**
     * Calcule le score moyen de toutes les métriques
     */
    private calculateAverageScore(metrics: RelationalPerformanceMetrics): number {
        const values = Object.values(metrics);
        return this.calculateAverage(values);
    }

    /**
     * Identifie la métrique la plus forte
     */
    private identifyTopMetric(metrics: RelationalPerformanceMetrics): string {
        const entries = Object.entries(metrics);
        const topEntry = entries.reduce((max, current) =>
            current[1] > max[1] ? current : max
        );
        return topEntry[0];
    }

    /**
     * Crée des métriques par défaut en cas d'erreur
     */
    private createDefaultMetrics(): RelationalPerformanceMetrics {
        return {
            communicationEffectiveness: 0.7,
            empathyLevel: 0.7,
            adaptationSpeed: 0.7,
            feedbackQuality: 0.7,
            motivationImpact: 0.7,
            conflictResolution: 0.7,
            trustBuilding: 0.7
        };
    }
}