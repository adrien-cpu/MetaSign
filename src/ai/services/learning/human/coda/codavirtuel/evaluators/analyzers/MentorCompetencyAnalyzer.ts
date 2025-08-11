/**
 * Analyseur des compétences de mentorat CODA - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/MentorCompetencyAnalyzer.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Analyse les compétences spécifiques du mentor CODA avec IA révolutionnaire
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-15
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    TeachingSession,
    EmotionalConfig,
    MentorEvaluation
} from '../types/CODAEvaluatorTypes';
import type { EmotionalContext } from './EmotionalAnalyzer';

/**
 * Interface pour les résultats détaillés d'analyse des compétences
 */
export interface CompetencyAnalysisDetails {
    readonly score: number;
    readonly factors: readonly string[];
    readonly recommendations: readonly string[];
    readonly trend: 'improving' | 'declining' | 'stable';
}

/**
 * Interface pour les métriques de performance d'une compétence
 */
export interface CompetencyMetrics {
    readonly currentScore: number;
    readonly previousScore: number;
    readonly improvementRate: number;
    readonly consistencyIndex: number;
}

/**
 * Analyseur spécialisé pour les compétences de mentorat
 * Responsable de l'évaluation détaillée de chaque compétence pédagogique
 * 
 * @example
 * ```typescript
 * const analyzer = new MentorCompetencyAnalyzer(config);
 * const competencies = analyzer.analyzeAllCompetencies(sessions, context);
 * const details = analyzer.getCompetencyDetails(sessions, 'explanation');
 * ```
 */
export class MentorCompetencyAnalyzer {
    private readonly logger = LoggerFactory.getLogger('MentorCompetencyAnalyzer');
    private readonly emotionalConfig: EmotionalConfig;

    /**
     * Constructeur de l'analyseur de compétences
     * @param emotionalConfig Configuration émotionnelle pour l'analyse
     */
    constructor(emotionalConfig: EmotionalConfig) {
        this.emotionalConfig = emotionalConfig;
    }

    /**
     * Analyse toutes les compétences du mentor avec IA avancée
     * @param sessions Sessions d'enseignement à analyser
     * @param emotionalContext Contexte émotionnel
     * @returns Compétences analysées avec scores
     */
    public analyzeAllCompetencies(
        sessions: readonly TeachingSession[],
        emotionalContext: EmotionalContext
    ): MentorEvaluation['competencies'] {
        this.logger.debug('Début de l\'analyse des compétences', {
            sessionsCount: sessions.length,
            emotion: emotionalContext.detectedEmotion,
            intensity: emotionalContext.intensity
        });

        if (sessions.length === 0) {
            this.logger.warn('Aucune session pour l\'analyse des compétences');
            return this.getDefaultCompetencies();
        }

        const competencies = {
            explanation: this.evaluateExplanationSkill(sessions),
            patience: this.evaluatePatienceSkill(sessions, emotionalContext),
            adaptation: this.evaluateAdaptationSkill(sessions),
            encouragement: this.evaluateEncouragementSkill(sessions),
            culturalSensitivity: this.evaluateCulturalSensitivity(sessions)
        };

        this.logger.info('Analyse des compétences terminée', {
            explanation: parseFloat(competencies.explanation.toFixed(3)),
            patience: parseFloat(competencies.patience.toFixed(3)),
            adaptation: parseFloat(competencies.adaptation.toFixed(3)),
            encouragement: parseFloat(competencies.encouragement.toFixed(3)),
            culturalSensitivity: parseFloat(competencies.culturalSensitivity.toFixed(3)),
            overallAverage: parseFloat(this.calculateCompetenciesAverage(competencies).toFixed(3))
        });

        return competencies;
    }

    /**
     * Obtient les détails d'analyse pour une compétence spécifique
     * @param sessions Sessions à analyser
     * @param competencyType Type de compétence à analyser
     * @returns Détails complets de l'analyse
     */
    public getCompetencyDetails(
        sessions: readonly TeachingSession[],
        competencyType: keyof MentorEvaluation['competencies']
    ): CompetencyAnalysisDetails {
        let score: number;
        let factors: string[] = [];
        let recommendations: string[] = [];

        switch (competencyType) {
            case 'explanation':
                score = this.evaluateExplanationSkill(sessions);
                factors = this.getExplanationFactors(sessions);
                recommendations = this.getExplanationRecommendations(score);
                break;
            case 'patience':
                score = this.evaluatePatienceSkill(sessions, {
                    detectedEmotion: 'neutral',
                    intensity: 0.5,
                    contributingFactors: [],
                    adaptationRecommendations: []
                });
                factors = this.getPatienceFactors(sessions);
                recommendations = this.getPatienceRecommendations(score);
                break;
            case 'adaptation':
                score = this.evaluateAdaptationSkill(sessions);
                factors = this.getAdaptationFactors(sessions);
                recommendations = this.getAdaptationRecommendations(score);
                break;
            case 'encouragement':
                score = this.evaluateEncouragementSkill(sessions);
                factors = this.getEncouragementFactors(sessions);
                recommendations = this.getEncouragementRecommendations(score);
                break;
            case 'culturalSensitivity':
                score = this.evaluateCulturalSensitivity(sessions);
                factors = this.getCulturalSensitivityFactors(sessions);
                recommendations = this.getCulturalSensitivityRecommendations(score);
                break;
            default:
                score = 0.5;
                factors = ['Compétence non reconnue'];
                recommendations = ['Vérifier le type de compétence demandé'];
        }

        const trend = this.calculateCompetencyTrend(sessions, competencyType);

        return {
            score,
            factors,
            recommendations,
            trend
        };
    }

    /**
     * Évalue la compétence d'explication du mentor
     * @param sessions Sessions à analyser
     * @returns Score d'explication (0-1)
     */
    public evaluateExplanationSkill(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0;

        const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
        const avgComprehension = this.calculateAverage(comprehensionValues);

        const questionCounts = sessions.map(s => s.aiReactions.questions.length);
        const avgQuestions = this.calculateAverage(questionCounts);

        // Moins de questions = meilleures explications
        const maxQuestionPenalty = 0.3;
        const questionNormalizationFactor = 0.1;
        const questionPenalty = Math.min(maxQuestionPenalty, avgQuestions * questionNormalizationFactor);

        const score = Math.max(0, avgComprehension - questionPenalty);

        this.logger.debug('Compétence d\'explication évaluée', {
            avgComprehension: parseFloat(avgComprehension.toFixed(3)),
            avgQuestions: parseFloat(avgQuestions.toFixed(3)),
            questionPenalty: parseFloat(questionPenalty.toFixed(3)),
            finalScore: parseFloat(score.toFixed(3))
        });

        return score;
    }

    /**
     * Évalue la patience du mentor avec prise en compte émotionnelle
     * @param sessions Sessions à analyser
     * @param emotionalContext Contexte émotionnel
     * @returns Score de patience (0-1)
     */
    public evaluatePatienceSkill(
        sessions: readonly TeachingSession[],
        emotionalContext: EmotionalContext
    ): number {
        if (sessions.length === 0) return 0;

        const frustrationValues = sessions.map(s => s.aiReactions.frustrationSigns);
        const avgFrustration = this.calculateAverage(frustrationValues);

        const maxFrustrationValue = 10;
        let patienceScore = 1 - (avgFrustration / maxFrustrationValue);

        // Bonus pour bonne gestion émotionnelle
        const emotionalBonusThreshold = 0.5;
        const emotionalBonus = 0.2;

        if (emotionalContext.detectedEmotion === 'frustrated' &&
            emotionalContext.intensity < emotionalBonusThreshold) {
            patienceScore += emotionalBonus;
            this.logger.debug('Bonus de patience accordé pour gestion émotionnelle');
        }

        const normalizedScore = Math.max(0, Math.min(1, patienceScore));

        this.logger.debug('Compétence de patience évaluée', {
            avgFrustration: parseFloat(avgFrustration.toFixed(3)),
            baseScore: parseFloat((1 - avgFrustration / maxFrustrationValue).toFixed(3)),
            bonusApplied: emotionalContext.detectedEmotion === 'frustrated',
            finalScore: parseFloat(normalizedScore.toFixed(3))
        });

        return normalizedScore;
    }

    /**
     * Évalue la capacité d'adaptation du mentor
     * @param sessions Sessions à analyser
     * @returns Score d'adaptation (0-1)
     */
    public evaluateAdaptationSkill(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 2) {
            this.logger.debug('Pas assez de sessions pour évaluer l\'adaptation');
            return 0.5; // Score neutre par défaut
        }

        const methodDiversity = this.calculateMethodDiversity(sessions);
        const performanceImprovement = this.calculatePerformanceImprovement(sessions);

        const methodWeight = 0.4;
        const performanceWeight = 0.6;
        const adaptationScore = (methodDiversity * methodWeight + performanceImprovement * performanceWeight);

        this.logger.debug('Compétence d\'adaptation évaluée', {
            methodDiversity: parseFloat(methodDiversity.toFixed(3)),
            performanceImprovement: parseFloat(performanceImprovement.toFixed(3)),
            finalScore: parseFloat(adaptationScore.toFixed(3))
        });

        return adaptationScore;
    }

    /**
     * Évalue la capacité d'encouragement du mentor
     * @param sessions Sessions à analyser
     * @returns Score d'encouragement (0-1)
     */
    public evaluateEncouragementSkill(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0;

        const satisfactionValues = sessions.map(s => s.results.aiSatisfaction);
        const avgSatisfaction = this.calculateAverage(satisfactionValues);

        const improvementCounts = sessions.map(s => s.results.improvement > 0 ? 1 : 0);
        const avgMotivation = this.calculateAverage(improvementCounts);

        const satisfactionWeight = 0.6;
        const motivationWeight = 0.4;
        const encouragementScore = (avgSatisfaction * satisfactionWeight + avgMotivation * motivationWeight);

        this.logger.debug('Compétence d\'encouragement évaluée', {
            avgSatisfaction: parseFloat(avgSatisfaction.toFixed(3)),
            avgMotivation: parseFloat(avgMotivation.toFixed(3)),
            finalScore: parseFloat(encouragementScore.toFixed(3))
        });

        return encouragementScore;
    }

    /**
     * Évalue la sensibilité culturelle du mentor
     * @param sessions Sessions à analyser
     * @returns Score de sensibilité culturelle (0-1)
     */
    public evaluateCulturalSensitivity(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0;

        // Analyse des indicateurs culturels dans les sessions
        const culturalIndicators = sessions.reduce((sum, session) => {
            let sessionScore = 0;

            // Bonus pour méthodes d'enseignement culturellement adaptées
            if (session.content.teachingMethod.includes('cultural')) {
                sessionScore += 0.3;
            }

            // Bonus pour inclusion de concepts sociaux/culturels
            if (session.content.concepts.some(concept => concept.includes('social'))) {
                sessionScore += 0.2;
            }

            // Bonus pour références à la communauté sourde
            if (session.content.concepts.some(concept =>
                concept.includes('deaf') || concept.includes('sourd'))) {
                sessionScore += 0.25;
            }

            return sum + Math.min(1, sessionScore); // Maximum 1 par session
        }, 0);

        const culturalScore = Math.min(1, culturalIndicators / sessions.length);

        this.logger.debug('Sensibilité culturelle évaluée', {
            totalIndicators: culturalIndicators,
            sessionsCount: sessions.length,
            finalScore: parseFloat(culturalScore.toFixed(3))
        });

        return culturalScore;
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Calcule la moyenne des compétences
     * @param competencies Compétences à moyenner
     * @returns Moyenne des compétences
     * @private
     */
    private calculateCompetenciesAverage(competencies: MentorEvaluation['competencies']): number {
        const values = Object.values(competencies);
        return this.calculateAverage(values);
    }

    /**
     * Calcule la tendance d'une compétence
     * @param sessions Sessions à analyser
     * @param competencyType Type de compétence
     * @returns Tendance de la compétence
     * @private
     */
    private calculateCompetencyTrend(
        sessions: readonly TeachingSession[],
        competencyType: keyof MentorEvaluation['competencies']
    ): 'improving' | 'declining' | 'stable' {
        if (sessions.length < 4) return 'stable';

        const midPoint = Math.floor(sessions.length / 2);
        const firstHalf = sessions.slice(0, midPoint);
        const secondHalf = sessions.slice(midPoint);

        // Utilisation d'un contexte émotionnel neutre pour le calcul de tendance
        const neutralContext: EmotionalContext = {
            detectedEmotion: 'neutral',
            intensity: 0.5,
            contributingFactors: [],
            adaptationRecommendations: []
        };

        let firstScore: number;
        let secondScore: number;

        switch (competencyType) {
            case 'explanation':
                firstScore = this.evaluateExplanationSkill(firstHalf);
                secondScore = this.evaluateExplanationSkill(secondHalf);
                break;
            case 'patience':
                firstScore = this.evaluatePatienceSkill(firstHalf, neutralContext);
                secondScore = this.evaluatePatienceSkill(secondHalf, neutralContext);
                break;
            case 'adaptation':
                firstScore = this.evaluateAdaptationSkill(firstHalf);
                secondScore = this.evaluateAdaptationSkill(secondHalf);
                break;
            case 'encouragement':
                firstScore = this.evaluateEncouragementSkill(firstHalf);
                secondScore = this.evaluateEncouragementSkill(secondHalf);
                break;
            case 'culturalSensitivity':
                firstScore = this.evaluateCulturalSensitivity(firstHalf);
                secondScore = this.evaluateCulturalSensitivity(secondHalf);
                break;
            default:
                return 'stable';
        }

        const improvement = secondScore - firstScore;
        const threshold = 0.1;

        if (improvement > threshold) return 'improving';
        if (improvement < -threshold) return 'declining';
        return 'stable';
    }

    /**
     * Méthodes pour obtenir les facteurs explicatifs de chaque compétence
     */
    private getExplanationFactors(sessions: readonly TeachingSession[]): string[] {
        const factors: string[] = [];
        const avgComprehension = this.calculateAverage(sessions.map(s => s.aiReactions.comprehension));
        const avgQuestions = this.calculateAverage(sessions.map(s => s.aiReactions.questions.length));

        if (avgComprehension > 0.8) factors.push('Excellente compréhension moyenne');
        if (avgQuestions < 2) factors.push('Peu de questions de clarification');
        if (avgQuestions > 5) factors.push('Nombreuses questions nécessaires');

        return factors;
    }

    private getPatienceFactors(sessions: readonly TeachingSession[]): string[] {
        const factors: string[] = [];
        const avgFrustration = this.calculateAverage(sessions.map(s => s.aiReactions.frustrationSigns));

        if (avgFrustration < 3) factors.push('Faible niveau de frustration détecté');
        if (avgFrustration > 7) factors.push('Frustration élevée persistante');

        return factors;
    }

    private getAdaptationFactors(sessions: readonly TeachingSession[]): string[] {
        const factors: string[] = [];
        const methodDiversity = this.calculateMethodDiversity(sessions);

        if (methodDiversity > 0.7) factors.push('Grande diversité des méthodes');
        if (methodDiversity < 0.3) factors.push('Méthodes d\'enseignement répétitives');

        return factors;
    }

    private getEncouragementFactors(sessions: readonly TeachingSession[]): string[] {
        const factors: string[] = [];
        const avgSatisfaction = this.calculateAverage(sessions.map(s => s.results.aiSatisfaction));

        if (avgSatisfaction > 0.8) factors.push('Très haute satisfaction de l\'apprenant');
        if (avgSatisfaction < 0.4) factors.push('Satisfaction faible persistante');

        return factors;
    }

    private getCulturalSensitivityFactors(sessions: readonly TeachingSession[]): string[] {
        const factors: string[] = [];
        const culturalReferences = sessions.filter(s =>
            s.content.concepts.some(c => c.includes('deaf') || c.includes('sourd'))
        ).length;

        if (culturalReferences > 0) factors.push('Références à la culture sourde présentes');
        if (culturalReferences === 0) factors.push('Manque de références culturelles');

        return factors;
    }

    /**
     * Méthodes pour obtenir les recommandations de chaque compétence
     */
    private getExplanationRecommendations(score: number): string[] {
        const recommendations: string[] = [];

        if (score < 0.5) {
            recommendations.push('Simplifier le vocabulaire utilisé');
            recommendations.push('Utiliser plus d\'exemples concrets');
        }
        if (score < 0.7) {
            recommendations.push('Vérifier la compréhension plus fréquemment');
        }

        return recommendations;
    }

    private getPatienceRecommendations(score: number): string[] {
        const recommendations: string[] = [];

        if (score < 0.6) {
            recommendations.push('Prendre des pauses plus fréquentes');
            recommendations.push('Adopter un rythme plus lent');
        }

        return recommendations;
    }

    private getAdaptationRecommendations(score: number): string[] {
        const recommendations: string[] = [];

        if (score < 0.5) {
            recommendations.push('Varier les méthodes d\'enseignement');
            recommendations.push('Adapter le contenu selon les réactions');
        }

        return recommendations;
    }

    private getEncouragementRecommendations(score: number): string[] {
        const recommendations: string[] = [];

        if (score < 0.6) {
            recommendations.push('Augmenter les encouragements positifs');
            recommendations.push('Célébrer les petites victoires');
        }

        return recommendations;
    }

    private getCulturalSensitivityRecommendations(score: number): string[] {
        const recommendations: string[] = [];

        if (score < 0.4) {
            recommendations.push('Intégrer plus de références culturelles sourdes');
            recommendations.push('Se former à la culture sourde');
        }

        return recommendations;
    }

    /**
     * Calcule la diversité des méthodes d'enseignement
     * @param sessions Sessions à analyser
     * @returns Diversité normalisée (0-1)
     * @private
     */
    private calculateMethodDiversity(sessions: readonly TeachingSession[]): number {
        const methods = new Set(sessions.map(s => s.content.teachingMethod));
        const maxPossibleMethods = Math.min(sessions.length, 5); // Limite réaliste

        const diversity = methods.size / maxPossibleMethods;
        return Math.min(1, diversity);
    }

    /**
     * Calcule l'amélioration des performances entre sessions
     * @param sessions Sessions à analyser
     * @returns Amélioration normalisée (0-1)
     * @private
     */
    private calculatePerformanceImprovement(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 2) return 0.5;

        const midPoint = Math.ceil(sessions.length / 2);
        const firstHalf = sessions.slice(0, midPoint);
        const secondHalf = sessions.slice(midPoint);

        const firstAvg = this.calculateAverage(
            firstHalf.map(s => s.aiReactions.comprehension)
        );
        const secondAvg = this.calculateAverage(
            secondHalf.map(s => s.aiReactions.comprehension)
        );

        const improvement = secondAvg - firstAvg;
        const normalizedImprovement = Math.max(0, Math.min(1, improvement + 0.5));

        this.logger.debug('Amélioration des performances calculée', {
            firstHalfAvg: parseFloat(firstAvg.toFixed(3)),
            secondHalfAvg: parseFloat(secondAvg.toFixed(3)),
            rawImprovement: parseFloat(improvement.toFixed(3)),
            normalizedImprovement: parseFloat(normalizedImprovement.toFixed(3))
        });

        return normalizedImprovement;
    }

    /**
     * Calcule la moyenne d'un tableau de nombres
     * @param values Valeurs à moyenner
     * @returns Moyenne ou 0 si tableau vide
     * @private
     */
    private calculateAverage(values: readonly number[]): number {
        if (values.length === 0) {
            this.logger.debug('Calcul de moyenne sur tableau vide');
            return 0;
        }

        const sum = values.reduce((accumulator, value) => accumulator + value, 0);
        return sum / values.length;
    }

    /**
     * Retourne des compétences par défaut pour les nouveaux mentors
     * @returns Compétences par défaut
     * @private
     */
    private getDefaultCompetencies(): MentorEvaluation['competencies'] {
        return {
            explanation: 0.3,
            patience: 0.5,
            adaptation: 0.2,
            encouragement: 0.4,
            culturalSensitivity: 0.3
        };
    }
}