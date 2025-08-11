/**
 * Évoluteur d'IA-élève Tamagotchi pour l'évaluateur CODA - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/AIStudentEvolver.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Fait évoluer l'IA-élève Tamagotchi avec personnalité et progression
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2025
 * @lastModified 2025-01-15
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    TeachingSession,
    AIStudentStatus,
    SkillAnalysisResult
} from '../types/CODAEvaluatorTypes';

/**
 * Utilitaires intégrés pour éviter les dépendances externes
 */
const EvolutionUtils = {
    /**
     * Calcule la moyenne d'un tableau de nombres
     * @param values Valeurs à moyenner
     * @returns Moyenne
     */
    calculateAverage: (values: readonly number[]): number => {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    },

    /**
     * Calcule la variabilité (écart-type normalisé)
     * @param values Valeurs à analyser
     * @returns Variabilité (0-1)
     */
    calculateVariability: (values: readonly number[]): number => {
        if (values.length < 2) return 0;
        const avg = EvolutionUtils.calculateAverage(values);
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        return Math.sqrt(variance);
    },

    /**
     * Génère un nom d'IA-élève unique
     * @param mentorId Identifiant du mentor
     * @returns Nom généré
     */
    generateAIStudentName: (mentorId: string): string => {
        const names = ['Alex', 'Charlie', 'Sam', 'Riley', 'Jordan', 'Casey', 'Taylor', 'Morgan'];
        const hash = mentorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return names[hash % names.length] || 'Alex';
    },

    /**
     * Calcule le niveau CECRL basé sur les métriques
     * @param comprehension Compréhension moyenne
     * @param sessionCount Nombre de sessions
     * @param totalTime Temps total d'apprentissage
     * @returns Niveau CECRL
     */
    calculateCECRLLevel: (comprehension: number, sessionCount: number, totalTime: number): string => {
        const experience = Math.min(1, (sessionCount * 0.1) + (totalTime / 3600)); // Facteur d'expérience
        const adjustedComprehension = comprehension * (0.7 + experience * 0.3);

        if (adjustedComprehension >= 0.9) return 'B2';
        if (adjustedComprehension >= 0.75) return 'B1';
        if (adjustedComprehension >= 0.6) return 'A2';
        return 'A1';
    }
} as const;

/**
 * Évoluteur d'IA-élève Tamagotchi - Version refactorisée
 * Responsable de la simulation et de l'évolution de l'IA-élève avec logique intégrée
 */
export class AIStudentEvolver {
    private readonly logger = LoggerFactory.getLogger('AIStudentEvolver');

    /**
     * Fait évoluer l'IA-élève Tamagotchi avec personnalité
     * @param mentorId Identifiant du mentor
     * @param sessions Sessions d'enseignement
     * @returns IA-élève évoluée
     */
    public async evolveAIStudent(
        mentorId: string,
        sessions: readonly TeachingSession[]
    ): Promise<AIStudentStatus> {
        const name = EvolutionUtils.generateAIStudentName(mentorId);

        if (sessions.length === 0) {
            return this.createInitialAIStudent(name);
        }

        // Calculs de base
        const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
        const avgComprehension = EvolutionUtils.calculateAverage(comprehensionValues);
        const totalLearningTime = sessions.reduce((sum, s) => sum + s.content.duration, 0);

        // Évolution du niveau et analyse
        const currentLevel = EvolutionUtils.calculateCECRLLevel(avgComprehension, sessions.length, totalLearningTime);
        const { strengths, weaknesses } = this.analyzeAISkills(sessions);
        const mood = this.determineAIMood(sessions);
        const motivation = Math.max(0.2, Math.min(1, avgComprehension + 0.2));
        const progress = this.calculateLevelProgress(avgComprehension, currentLevel);

        const aiStudent: AIStudentStatus = {
            name,
            currentLevel,
            mood,
            progress,
            weaknesses,
            strengths,
            lastLearned: sessions[sessions.length - 1]?.content.topic,
            needsHelp: weaknesses[0],
            motivation,
            totalLearningTime
        };

        this.logger.debug('IA-élève évoluée', {
            name, currentLevel, mood, progress,
            weaknessesCount: weaknesses.length,
            strengthsCount: strengths.length
        });

        return aiStudent;
    }

    /**
     * Estime le temps nécessaire pour atteindre le niveau suivant
     * @param sessions Sessions d'analyse
     * @returns Temps estimé en minutes
     */
    public estimateTimeToNextLevel(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 120;

        const recentSessions = sessions.slice(-5);
        const improvementValues = recentSessions.map(s => s.results.improvement);
        const avgImprovement = EvolutionUtils.calculateAverage(improvementValues);
        const sessionsNeeded = 0.5 / Math.max(0.01, avgImprovement);

        const durations = sessions.map(s => s.content.duration);
        const avgSessionDuration = EvolutionUtils.calculateAverage(durations);

        return Math.round(sessionsNeeded * avgSessionDuration);
    }

    /**
     * Génère des adaptations pour l'humeur de l'IA
     * @param mood Humeur actuelle
     * @returns Adaptations recommandées
     */
    public generateAdaptationsForMood(mood: AIStudentStatus['mood']): readonly string[] {
        const adaptations: Record<AIStudentStatus['mood'], readonly string[]> = {
            happy: ['Maintenir l\'engagement', 'Introduire de nouveaux défis'],
            excited: ['Canaliser l\'énergie', 'Exercices dynamiques'],
            frustrated: ['Rassurer', 'Simplifier', 'Encourager'],
            confused: ['Clarifier', 'Réexpliquer', 'Exemples visuels'],
            neutral: ['Stimuler l\'intérêt', 'Varier les approches']
        };

        return adaptations[mood] || adaptations.neutral;
    }

    /**
     * Obtient des statistiques sur l'évolution de l'IA-élève
     * @param sessions Sessions d'analyse
     * @returns Statistiques d'évolution
     */
    public getEvolutionStats(sessions: readonly TeachingSession[]): {
        readonly totalSessions: number;
        readonly averageComprehension: number;
        readonly improvementTrend: number;
        readonly consistencyScore: number;
        readonly timeSpent: number;
    } {
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                averageComprehension: 0,
                improvementTrend: 0,
                consistencyScore: 0,
                timeSpent: 0
            };
        }

        const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
        const averageComprehension = EvolutionUtils.calculateAverage(comprehensionValues);
        const improvementTrend = this.calculateImprovementTrend(sessions);
        const variability = EvolutionUtils.calculateVariability(comprehensionValues);
        const consistencyScore = Math.max(0, 1 - variability);
        const timeSpent = sessions.reduce((sum, s) => sum + s.content.duration, 0);

        return {
            totalSessions: sessions.length,
            averageComprehension,
            improvementTrend,
            consistencyScore,
            timeSpent
        };
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Crée une IA-élève initiale
     * @param name Nom de l'IA-élève
     * @returns IA-élève initiale
     * @private
     */
    private createInitialAIStudent(name: string): AIStudentStatus {
        return {
            name,
            currentLevel: 'A1',
            mood: 'excited',
            progress: 0,
            weaknesses: ['basic_signs', 'comprehension'],
            strengths: [],
            motivation: 0.8,
            totalLearningTime: 0
        };
    }

    /**
     * Analyse les compétences de l'IA basées sur les sessions
     * @param sessions Sessions à analyser
     * @returns Analyse des forces et faiblesses
     * @private
     */
    private analyzeAISkills(sessions: readonly TeachingSession[]): SkillAnalysisResult {
        const topicPerformance: Record<string, number[]> = {};

        // Agréger les performances par sujet
        sessions.forEach(session => {
            const topic = session.content.topic;
            if (!topicPerformance[topic]) {
                topicPerformance[topic] = [];
            }
            topicPerformance[topic].push(session.aiReactions.comprehension);
        });

        // Calculer les moyennes et analyser
        const topicAverages = Object.entries(topicPerformance).map(([topic, scores]) => ({
            topic,
            average: EvolutionUtils.calculateAverage(scores)
        }));

        topicAverages.sort((a, b) => b.average - a.average);

        const strengths = topicAverages.filter(({ average }) => average >= 0.7).map(({ topic }) => topic);
        const weaknesses = topicAverages.filter(({ average }) => average < 0.5).map(({ topic }) => topic);

        // Ajouter faiblesse par défaut si nécessaire
        if (weaknesses.length === 0) {
            weaknesses.push('basic_signs');
        }

        return { strengths, weaknesses };
    }

    /**
     * Détermine l'humeur de l'IA basée sur les sessions récentes
     * @param sessions Sessions à analyser
     * @returns Humeur de l'IA
     * @private
     */
    private determineAIMood(sessions: readonly TeachingSession[]): AIStudentStatus['mood'] {
        if (sessions.length === 0) return 'excited';

        const recentSessions = sessions.slice(-2);
        const avgComprehension = EvolutionUtils.calculateAverage(
            recentSessions.map(s => s.aiReactions.comprehension)
        );
        const avgSatisfaction = EvolutionUtils.calculateAverage(
            recentSessions.map(s => s.results.aiSatisfaction)
        );
        const recentErrors = recentSessions.reduce((sum, s) => sum + s.aiReactions.errors.length, 0);

        if (avgComprehension >= 0.8 && avgSatisfaction >= 0.8) return 'happy';
        if (avgComprehension >= 0.6 && recentErrors === 0) return 'excited';
        if (avgComprehension < 0.4 || recentErrors > 3) return 'frustrated';
        if (avgComprehension < 0.6) return 'confused';

        return 'neutral';
    }

    /**
     * Calcule la progression dans le niveau actuel
     * @param comprehension Compréhension moyenne
     * @param level Niveau CECRL actuel
     * @returns Progression (0-1)
     * @private
     */
    private calculateLevelProgress(comprehension: number, level: string): number {
        const thresholds: Record<string, { min: number; max: number }> = {
            'A1': { min: 0, max: 0.6 },
            'A2': { min: 0.6, max: 0.75 },
            'B1': { min: 0.75, max: 0.9 },
            'B2': { min: 0.9, max: 1.0 }
        };

        const threshold = thresholds[level] || thresholds['A1'];
        const range = threshold.max - threshold.min;
        const progress = (comprehension - threshold.min) / range;

        return Math.max(0, Math.min(1, progress));
    }

    /**
     * Calcule la tendance d'amélioration
     * @param sessions Sessions à analyser
     * @returns Tendance d'amélioration (-1 à 1)
     * @private
     */
    private calculateImprovementTrend(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 3) return 0;

        const midPoint = Math.ceil(sessions.length / 2);
        const firstHalf = sessions.slice(0, midPoint);
        const secondHalf = sessions.slice(midPoint);

        const firstAvg = EvolutionUtils.calculateAverage(
            firstHalf.map(s => s.aiReactions.comprehension)
        );
        const secondAvg = EvolutionUtils.calculateAverage(
            secondHalf.map(s => s.aiReactions.comprehension)
        );

        return Math.max(-1, Math.min(1, (secondAvg - firstAvg) * 2));
    }
}