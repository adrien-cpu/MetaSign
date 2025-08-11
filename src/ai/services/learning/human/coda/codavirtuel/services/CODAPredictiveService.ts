/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/CODAPredictiveService.ts
 * @description Service d'insights prédictifs pour le système CODA v4.0.0
 * 
 * Fonctionnalités révolutionnaires :
 * - 🔮 Prédictions de progression avancées
 * - 📊 Calculs de probabilités de réussite
 * - 🎯 Identification des zones de focus optimales
 * - ⏰ Estimation de fréquences de sessions
 * - 🌍 Analyse des besoins d'adaptation culturelle
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @module services
 * @version 4.0.0 - Service prédictif CODA
 * @since 2025
 * @author MetaSign Team - CODA Predictive
 * @lastModified 2025-07-29
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    ComprehensiveAIStatus,
    TeachingSession,
    CECRLLevel
} from '../types/index';

/**
 * Interface pour les insights prédictifs
 */
export interface PredictiveInsights {
    readonly nextLevelProbability: number;
    readonly riskOfPlateau: number;
    readonly optimalSessionFrequency: number;
    readonly recommendedFocusAreas: readonly string[];
    readonly culturalAdaptationNeeds: readonly string[];
}

/**
 * Interface pour l'analyse de niveau suivant
 */
export interface NextLevelAnalysis {
    readonly currentLevel: string;
    readonly nextLevel: string;
    readonly probability: number;
    readonly estimatedTimeWeeks: number;
    readonly requiredSessions: number;
    readonly confidenceLevel: number;
    readonly blockers: readonly string[];
    readonly accelerators: readonly string[];
}

/**
 * Interface pour les recommandations d'adaptation
 */
export interface AdaptationRecommendations {
    readonly cultural: readonly string[];
    readonly pedagogical: readonly string[];
    readonly technical: readonly string[];
    readonly emotional: readonly string[];
    readonly priority: 'high' | 'medium' | 'low';
}

/**
 * Interface pour l'analyse de risque de plateau
 */
export interface PlateauRiskAnalysis {
    readonly riskLevel: number;
    readonly indicators: readonly string[];
    readonly mitigationStrategies: readonly string[];
    readonly earlyWarningSignals: readonly string[];
    readonly recoveryTimeEstimate: number;
}

/**
 * Service d'insights prédictifs pour le système CODA
 * 
 * @class CODAPredictiveService
 * @description Service spécialisé dans la génération d'insights prédictifs,
 * l'analyse de progression future et les recommandations d'optimisation.
 * 
 * @example
 * ```typescript
 * const predictiveService = new CODAPredictiveService();
 * 
 * // Générer insights prédictifs
 * const insights = await predictiveService.generatePredictiveInsights(
 *   mentorId, aiStudent, sessions
 * );
 * 
 * // Analyser niveau suivant
 * const nextLevel = predictiveService.analyzeNextLevelProgression(aiStudent, sessions);
 * 
 * // Évaluer risque de plateau
 * const plateauRisk = predictiveService.analyzePlateauRisk(sessions);
 * ```
 */
export class CODAPredictiveService {
    /**
     * Logger pour le service prédictif
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('CODAPredictiveService');

    /**
     * Configurations des niveaux CECRL
     * @private
     * @readonly
     */
    private readonly cecrlLevels: readonly CECRLLevel[] = [
        'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    ] as const;

    /**
     * Seuils pour les calculs prédictifs
     * @private
     * @readonly
     */
    private readonly thresholds = {
        highProbability: 0.8,
        mediumProbability: 0.6,
        lowProbability: 0.4,
        plateauRisk: 0.7,
        minSessionsForPrediction: 3
    } as const;

    /**
     * Constructeur du service prédictif
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🔮 CODAPredictiveService initialisé');
    }

    /**
     * Génère des insights prédictifs complets
     * 
     * @method generatePredictiveInsights
     * @async
     * @param {string} mentorId - Identifiant du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @returns {Promise<PredictiveInsights>} Insights prédictifs
     * @public
     */
    public async generatePredictiveInsights(
        mentorId: string,
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): Promise<PredictiveInsights> {
        try {
            this.logger.info('🔮 Génération insights prédictifs', {
                mentorId,
                aiStudentLevel: aiStudent.currentLevel,
                aiStudentName: aiStudent.name,
                sessionsCount: sessions.length
            });

            if (sessions.length < this.thresholds.minSessionsForPrediction) {
                this.logger.warn('⚠️ Nombre de sessions insuffisant pour prédictions fiables', {
                    available: sessions.length,
                    required: this.thresholds.minSessionsForPrediction
                });
                return this.createDefaultPredictiveInsights();
            }

            // Analyser la progression historique
            const progressionTrend = this.analyzeProgressionTrend(sessions);
            const comprehensionPattern = this.analyzeComprehensionPatterns(sessions);

            // Calculer probabilités et prédictions
            const nextLevelProbability = this.calculateNextLevelProbability(
                aiStudent, progressionTrend, comprehensionPattern
            );

            const riskOfPlateau = this.calculatePlateauRisk(sessions);

            const optimalSessionFrequency = this.calculateOptimalSessionFrequency(
                aiStudent, sessions
            );

            // Identifier zones de focus recommandées
            const recommendedFocusAreas = this.identifyRecommendedFocusAreas(
                aiStudent, sessions
            );

            // Analyser besoins d'adaptation culturelle
            const culturalAdaptationNeeds = this.identifyCulturalAdaptationNeeds(
                aiStudent, sessions
            );

            const insights: PredictiveInsights = {
                nextLevelProbability,
                riskOfPlateau,
                optimalSessionFrequency,
                recommendedFocusAreas,
                culturalAdaptationNeeds
            };

            this.logger.info('✨ Insights prédictifs générés', {
                mentorId,
                nextLevelProb: nextLevelProbability.toFixed(2),
                plateauRisk: riskOfPlateau.toFixed(2),
                optimalFrequency: optimalSessionFrequency,
                focusAreasCount: recommendedFocusAreas.length
            });

            return insights;
        } catch (error) {
            this.logger.error('❌ Erreur génération insights prédictifs', { mentorId, error });
            return this.createDefaultPredictiveInsights();
        }
    }

    /**
     * Analyse la progression vers le niveau suivant
     * 
     * @method analyzeNextLevelProgression
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @returns {NextLevelAnalysis} Analyse du niveau suivant
     * @public
     */
    public analyzeNextLevelProgression(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): NextLevelAnalysis {
        try {
            this.logger.info('📊 Analyse progression niveau suivant', {
                currentLevel: aiStudent.currentLevel,
                progress: aiStudent.progress
            });

            const currentLevelIndex = this.cecrlLevels.indexOf(aiStudent.currentLevel);
            const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < this.cecrlLevels.length - 1
                ? this.cecrlLevels[currentLevelIndex + 1]
                : 'C2+';

            const probability = this.calculateDetailedNextLevelProbability(aiStudent, sessions);
            const estimatedTimeWeeks = this.estimateTimeToNextLevel(aiStudent, sessions);
            const requiredSessions = this.calculateRequiredSessions(aiStudent, estimatedTimeWeeks);
            const confidenceLevel = this.calculateConfidenceLevel(sessions);

            const blockers = this.identifyProgressionBlockers(aiStudent, sessions);
            const accelerators = this.identifyProgressionAccelerators(aiStudent, sessions);

            const analysis: NextLevelAnalysis = {
                currentLevel: aiStudent.currentLevel,
                nextLevel,
                probability,
                estimatedTimeWeeks,
                requiredSessions,
                confidenceLevel,
                blockers,
                accelerators
            };

            this.logger.info('✅ Analyse niveau suivant terminée', {
                nextLevel,
                probability: probability.toFixed(2),
                timeEstimate: estimatedTimeWeeks,
                confidence: confidenceLevel.toFixed(2)
            });

            return analysis;
        } catch (error) {
            this.logger.error('❌ Erreur analyse niveau suivant', { error });
            return this.createDefaultNextLevelAnalysis(aiStudent);
        }
    }

    /**
     * Analyse le risque de plateau détaillé
     * 
     * @method analyzePlateauRisk
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @returns {PlateauRiskAnalysis} Analyse détaillée du risque
     * @public
     */
    public analyzePlateauRisk(sessions: readonly TeachingSession[]): PlateauRiskAnalysis {
        try {
            this.logger.info('⚠️ Analyse risque de plateau', {
                sessionsCount: sessions.length
            });

            const riskLevel = this.calculateDetailedPlateauRisk(sessions);
            const indicators = this.identifyPlateauIndicators(sessions);
            const mitigationStrategies = this.generateMitigationStrategies(riskLevel, indicators);
            const earlyWarningSignals = this.identifyEarlyWarningSignals(sessions);
            const recoveryTimeEstimate = this.estimateRecoveryTime(riskLevel);

            const analysis: PlateauRiskAnalysis = {
                riskLevel,
                indicators,
                mitigationStrategies,
                earlyWarningSignals,
                recoveryTimeEstimate
            };

            this.logger.info('✅ Analyse plateau terminée', {
                riskLevel: riskLevel.toFixed(2),
                indicatorsCount: indicators.length,
                strategiesCount: mitigationStrategies.length
            });

            return analysis;
        } catch (error) {
            this.logger.error('❌ Erreur analyse plateau', { error });
            return this.createDefaultPlateauAnalysis();
        }
    }

    /**
     * Génère des recommandations d'adaptation
     * 
     * @method generateAdaptationRecommendations
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @returns {AdaptationRecommendations} Recommandations d'adaptation
     * @public
     */
    public generateAdaptationRecommendations(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): AdaptationRecommendations {
        try {
            this.logger.info('🎯 Génération recommandations adaptation', {
                aiStudentName: aiStudent.name,
                culturalContext: aiStudent.culturalContext
            });

            const cultural = this.generateCulturalRecommendations(aiStudent, sessions);
            const pedagogical = this.generatePedagogicalRecommendations(aiStudent, sessions);
            const technical = this.generateTechnicalRecommendations(aiStudent, sessions);
            const emotional = this.generateEmotionalRecommendations(aiStudent, sessions);
            const priority = this.determinePriority(cultural, pedagogical, technical, emotional);

            const recommendations: AdaptationRecommendations = {
                cultural,
                pedagogical,
                technical,
                emotional,
                priority
            };

            this.logger.info('✅ Recommandations adaptation générées', {
                culturalCount: cultural.length,
                pedagogicalCount: pedagogical.length,
                technicalCount: technical.length,
                emotionalCount: emotional.length,
                priority
            });

            return recommendations;
        } catch (error) {
            this.logger.error('❌ Erreur génération recommandations', { error });
            return this.createDefaultAdaptationRecommendations();
        }
    }

    // ==================== MÉTHODES PRIVÉES DE CALCUL ====================

    private analyzeProgressionTrend(sessions: readonly TeachingSession[]): 'improving' | 'stable' | 'declining' {
        if (sessions.length < 2) return 'stable';

        const recent = sessions.slice(-3);
        const older = sessions.slice(-6, -3);

        const recentAvg = recent.reduce((sum, s) => sum + s.metrics.successScore, 0) / recent.length;
        const olderAvg = older.length > 0
            ? older.reduce((sum, s) => sum + s.metrics.successScore, 0) / older.length
            : recentAvg;

        if (recentAvg > olderAvg + 0.1) return 'improving';
        if (recentAvg < olderAvg - 0.1) return 'declining';
        return 'stable';
    }

    private analyzeComprehensionPatterns(sessions: readonly TeachingSession[]): Record<string, number> {
        const comprehensionScores = sessions.map(s => s.aiReactions.comprehension);
        const average = comprehensionScores.reduce((sum, score) => sum + score, 0) / comprehensionScores.length;
        const variance = this.calculateVariance(comprehensionScores);

        return { average, variance, trend: 0.1 };
    }

    private calculateVariance(values: readonly number[]): number {
        if (values.length === 0) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    private calculateNextLevelProbability(
        aiStudent: ComprehensiveAIStatus,
        trend: string,
        pattern: Record<string, number>
    ): number {
        const baseProb = Math.min(1, aiStudent.progress + 0.3);
        const trendBonus = trend === 'improving' ? 0.2 : trend === 'declining' ? -0.1 : 0;
        const patternBonus = pattern.average > 0.7 ? 0.1 : 0;

        return Math.max(0, Math.min(1, baseProb + trendBonus + patternBonus));
    }

    private calculatePlateauRisk(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 3) return 0.3;

        const recentScores = sessions.slice(-5).map(s => s.metrics.successScore);
        const variance = this.calculateVariance(recentScores);
        const trend = this.analyzeProgressionTrend(sessions);

        if (variance < 0.05 && trend === 'stable') return 0.8;
        if (trend === 'declining') return 0.9;
        return Math.min(variance * 2, 0.6);
    }

    private calculateOptimalSessionFrequency(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): number {
        // Base sur le niveau et la performance récente
        const levelMultiplier = aiStudent.currentLevel === 'A1' ? 1.2 :
            aiStudent.currentLevel === 'A2' ? 1.0 : 0.8;

        const recentPerformance = sessions.length > 0
            ? sessions.slice(-3).reduce((sum, s) => sum + s.metrics.successScore, 0) / Math.min(3, sessions.length)
            : 0.5;

        const performanceMultiplier = recentPerformance > 0.8 ? 0.9 :
            recentPerformance < 0.5 ? 1.3 : 1.0;

        const baseFrequency = 3; // sessions par semaine
        return Math.max(2, Math.min(5, Math.round(baseFrequency * levelMultiplier * performanceMultiplier)));
    }

    private identifyRecommendedFocusAreas(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        // Combiner faiblesses connues avec analyse des sessions
        const areas = [...aiStudent.weaknesses];

        // Ajouter des areas basées sur les performances récentes
        if (sessions.length > 0) {
            const avgComprehension = sessions.slice(-3)
                .reduce((sum, s) => sum + s.aiReactions.comprehension, 0) / Math.min(3, sessions.length);

            if (avgComprehension < 0.6) {
                areas.push('comprehension_reinforcement');
            }

            // Analyser les concepts à revoir
            const conceptsToReview = sessions
                .flatMap(s => s.metrics.conceptsToReview)
                .filter((concept, index, arr) => arr.indexOf(concept) === index)
                .slice(0, 2);

            areas.push(...conceptsToReview);
        }

        return areas.slice(0, 3); // Limiter à 3 zones principales
    }

    private identifyCulturalAdaptationNeeds(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const needs: string[] = [];

        // Basé sur le contexte culturel de l'IA
        if (typeof aiStudent.culturalContext === 'string' && aiStudent.culturalContext.includes('international')) {
            needs.push('cultural_localization', 'regional_variants');
        }

        // Ajouter besoins basés sur les sessions - analyser l'efficacité des méthodes
        if (sessions.length > 0) {
            const avgEffectiveness = sessions.reduce((sum, s) => sum + s.metrics.teachingEffectiveness, 0) / sessions.length;

            if (avgEffectiveness < 0.7) {
                needs.push('cultural_immersion');
            }

            // Analyser les difficultés récurrentes
            const commonErrors = sessions
                .flatMap(s => s.aiReactions.errors)
                .filter(error => error.toLowerCase().includes('cultural') || error.toLowerCase().includes('context'));

            if (commonErrors.length > 0) {
                needs.push('cultural_context_training');
            }
        }

        return needs;
    }

    // Méthodes pour analyse détaillée du niveau suivant
    private calculateDetailedNextLevelProbability(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): number {
        const baseProb = this.calculateNextLevelProbability(
            aiStudent,
            this.analyzeProgressionTrend(sessions),
            this.analyzeComprehensionPatterns(sessions)
        );

        // Ajustements basés sur la consistance
        const consistencyBonus = this.calculateConsistencyBonus(sessions);

        return Math.max(0, Math.min(1, baseProb + consistencyBonus));
    }

    private calculateConsistencyBonus(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 3) return 0;

        const scores = sessions.slice(-5).map(s => s.metrics.successScore);
        const variance = this.calculateVariance(scores);

        return variance < 0.1 ? 0.1 : variance > 0.3 ? -0.1 : 0;
    }

    private estimateTimeToNextLevel(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): number {
        const progressRemaining = 1 - aiStudent.progress;
        const avgProgressPerSession = sessions.length > 0
            ? sessions.slice(-5).reduce((sum, s) => sum + s.metrics.successScore, 0) / Math.min(5, sessions.length) * 0.1
            : 0.05;

        const sessionsNeeded = Math.ceil(progressRemaining / Math.max(avgProgressPerSession, 0.01));
        const weeklyFrequency = this.calculateOptimalSessionFrequency(aiStudent, sessions);

        return Math.ceil(sessionsNeeded / weeklyFrequency);
    }

    private calculateRequiredSessions(aiStudent: ComprehensiveAIStatus, estimatedWeeks: number): number {
        const weeklyFrequency = aiStudent.currentLevel === 'A1' ? 4 :
            aiStudent.currentLevel === 'A2' ? 3 : 2;
        return Math.max(10, estimatedWeeks * weeklyFrequency);
    }

    private calculateConfidenceLevel(sessions: readonly TeachingSession[]): number {
        const sessionFactor = Math.min(1, sessions.length / 10);
        const consistencyFactor = sessions.length > 0 ?
            1 - this.calculateVariance(sessions.map(s => s.metrics.successScore)) : 0.5;

        return (sessionFactor + consistencyFactor) / 2;
    }

    private identifyProgressionBlockers(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const blockers = [...aiStudent.weaknesses.slice(0, 2)];

        // Ajouter blockers basés sur l'analyse des sessions
        if (sessions.length > 0) {
            const avgParticipation = sessions.reduce((sum, s) => sum + s.metrics.participationRate, 0) / sessions.length;
            if (avgParticipation < 0.6) {
                blockers.push('low_engagement');
            }

            const strugglingMoments = sessions.reduce((sum, s) => sum + s.aiReactions.strugglingMoments.length, 0);
            if (strugglingMoments > sessions.length * 2) {
                blockers.push('frequent_confusion');
            }
        }

        return blockers;
    }

    private identifyProgressionAccelerators(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const accelerators = [...aiStudent.strengths.slice(0, 2)];

        // Ajouter accelerators basés sur l'analyse des sessions
        if (sessions.length > 0) {
            const avgComprehension = sessions.reduce((sum, s) => sum + s.aiReactions.comprehension, 0) / sessions.length;
            if (avgComprehension > 0.8) {
                accelerators.push('high_comprehension');
            }

            const avgQuestions = sessions.reduce((sum, s) => sum + s.aiReactions.questions.length, 0) / sessions.length;
            if (avgQuestions > 3) {
                accelerators.push('active_questioning');
            }
        }

        return accelerators;
    }

    // Méthodes pour recommandations d'adaptation
    private generateCulturalRecommendations(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const recommendations: string[] = ['Intégrer variations régionales'];

        // Analyser le contexte culturel
        if (aiStudent.culturalContext && typeof aiStudent.culturalContext === 'object') {
            recommendations.push('Personnalisation culturelle avancée');
        }

        // Analyser les besoins basés sur les sessions
        if (sessions.length > 0) {
            const culturalChallenges = sessions.some(s =>
                s.aiReactions.errors.some(error => error.toLowerCase().includes('cultural'))
            );

            if (culturalChallenges) {
                recommendations.push('Formation contexte culturel renforcée');
            }
        }

        return recommendations;
    }

    private generatePedagogicalRecommendations(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const recommendations: string[] = ['Adapter rythme d\'apprentissage'];

        // Analyser les patterns d'apprentissage
        if (sessions.length > 0) {
            const avgDuration = sessions.reduce((sum, s) => sum + s.metrics.actualDuration, 0) / sessions.length;

            if (avgDuration < 20) {
                recommendations.push('Prolonger durée des sessions');
            } else if (avgDuration > 45) {
                recommendations.push('Segmenter sessions en modules courts');
            }

            const avgInterventions = sessions.reduce((sum, s) => sum + s.metrics.teacherInterventions, 0) / sessions.length;
            if (avgInterventions > 10) {
                recommendations.push('Réduire interruptions pédagogiques');
            }
        }

        return recommendations;
    }

    private generateTechnicalRecommendations(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const recommendations: string[] = ['Optimiser interface utilisateur'];

        // Analyser les besoins techniques basés sur les sessions
        if (sessions.length > 0) {
            const avgParticipation = sessions.reduce((sum, s) => sum + s.metrics.participationRate, 0) / sessions.length;

            if (avgParticipation < 0.7) {
                recommendations.push('Améliorer interactivité système');
            }

            // Analyser l'émotion de l'IA pour détecter des problèmes techniques
            const frustrationSessions = sessions.filter(s => s.aiReactions.emotion === 'frustrated').length;
            if (frustrationSessions > sessions.length * 0.3) {
                recommendations.push('Optimiser réactivité système');
            }
        }

        return recommendations;
    }

    private generateEmotionalRecommendations(
        aiStudent: ComprehensiveAIStatus,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const recommendations: string[] = ['Renforcer encouragements'];

        // Analyser l'état émotionnel à travers les sessions
        if (sessions.length > 0) {
            const emotionalStates = sessions.map(s => s.aiReactions.emotion);
            const negativeEmotions = emotionalStates.filter(emotion =>
                ['frustrated', 'confused', 'discouraged'].includes(emotion)
            ).length;

            if (negativeEmotions > sessions.length * 0.4) {
                recommendations.push('Stratégies de gestion émotionnelle');
                recommendations.push('Pause et récupération motivationnelle');
            }

            const avgEngagement = sessions.reduce((sum, s) => {
                const latestEngagement = s.aiReactions.engagementEvolution[s.aiReactions.engagementEvolution.length - 1];
                return sum + (latestEngagement || 0.5);
            }, 0) / sessions.length;

            if (avgEngagement < 0.6) {
                recommendations.push('Techniques de motivation personnalisées');
            }
        }

        return recommendations;
    }

    private determinePriority(
        cultural: readonly string[],
        pedagogical: readonly string[],
        technical: readonly string[],
        emotional: readonly string[]
    ): 'high' | 'medium' | 'low' {
        const totalRecommendations = cultural.length + pedagogical.length + technical.length + emotional.length;

        // Prioriser selon le type de recommandations
        if (emotional.length > 2 || technical.length > 2) return 'high';
        if (totalRecommendations > 6) return 'high';
        if (totalRecommendations > 3) return 'medium';

        return 'low';
    }

    // Méthodes pour analyse détaillée du plateau
    private calculateDetailedPlateauRisk(sessions: readonly TeachingSession[]): number {
        return this.calculatePlateauRisk(sessions);
    }

    private identifyPlateauIndicators(sessions: readonly TeachingSession[]): readonly string[] {
        const indicators: string[] = [];

        if (this.analyzeProgressionTrend(sessions) === 'stable') {
            indicators.push('Progression stagnante');
        }

        const recentVariance = this.calculateVariance(
            sessions.slice(-3).map(s => s.metrics.successScore)
        );
        if (recentVariance < 0.05) {
            indicators.push('Faible variabilité des scores');
        }

        // Analyser la répétition des erreurs
        if (sessions.length > 2) {
            const errorPatterns = sessions.slice(-3).map(s => s.aiReactions.errors.join(','));
            const uniqueErrorPatterns = [...new Set(errorPatterns)];

            if (errorPatterns.length - uniqueErrorPatterns.length > 1) {
                indicators.push('Répétition des erreurs');
            }
        }

        return indicators;
    }

    private generateMitigationStrategies(riskLevel: number, indicators: readonly string[]): readonly string[] {
        const strategies: string[] = [];

        if (riskLevel > 0.7) {
            strategies.push('Introduire nouveaux défis', 'Modifier approche pédagogique');
        }

        if (indicators.includes('Progression stagnante')) {
            strategies.push('Réviser objectifs d\'apprentissage');
        }

        if (indicators.includes('Répétition des erreurs')) {
            strategies.push('Analyse approfondie des erreurs récurrentes');
        }

        if (indicators.includes('Faible variabilité des scores')) {
            strategies.push('Diversifier types d\'exercices');
        }

        return strategies;
    }

    private identifyEarlyWarningSignals(sessions: readonly TeachingSession[]): readonly string[] {
        const signals: string[] = [];

        if (sessions.length > 0) {
            // Analyser l'évolution de l'engagement
            const recentSessions = sessions.slice(-3);
            const avgEngagement = recentSessions.reduce((sum, s) => {
                const latestEngagement = s.aiReactions.engagementEvolution[s.aiReactions.engagementEvolution.length - 1];
                return sum + (latestEngagement || 0.5);
            }, 0) / recentSessions.length;

            if (avgEngagement < 0.5) {
                signals.push('Diminution engagement');
            }

            // Analyser la fréquence des questions
            const avgQuestions = recentSessions.reduce((sum, s) => sum + s.aiReactions.questions.length, 0) / recentSessions.length;
            if (avgQuestions < 1) {
                signals.push('Réduction curiosité');
            }
        }

        return signals;
    }

    private estimateRecoveryTime(riskLevel: number): number {
        return riskLevel > 0.8 ? 4 : riskLevel > 0.6 ? 2 : 1; // semaines
    }

    // ==================== MÉTHODES DE CRÉATION PAR DÉFAUT ====================

    private createDefaultPredictiveInsights(): PredictiveInsights {
        return {
            nextLevelProbability: 0.6,
            riskOfPlateau: 0.3,
            optimalSessionFrequency: 3,
            recommendedFocusAreas: ['basic_concepts'],
            culturalAdaptationNeeds: ['cultural_basics']
        };
    }

    private createDefaultNextLevelAnalysis(aiStudent: ComprehensiveAIStatus): NextLevelAnalysis {
        return {
            currentLevel: aiStudent.currentLevel,
            nextLevel: 'A2',
            probability: 0.6,
            estimatedTimeWeeks: 8,
            requiredSessions: 24,
            confidenceLevel: 0.5,
            blockers: [],
            accelerators: []
        };
    }

    private createDefaultPlateauAnalysis(): PlateauRiskAnalysis {
        return {
            riskLevel: 0.3,
            indicators: [],
            mitigationStrategies: [],
            earlyWarningSignals: [],
            recoveryTimeEstimate: 2
        };
    }

    private createDefaultAdaptationRecommendations(): AdaptationRecommendations {
        return {
            cultural: [],
            pedagogical: [],
            technical: [],
            emotional: [],
            priority: 'medium'
        };
    }
}