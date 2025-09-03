/**
 * Analyseur spécialisé des compétences de mentorat
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/MentorSkillsAnalyzer.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Module spécialisé dans l'analyse approfondie des compétences de mentorat
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-07-22
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    TeachingSession,
    MentorEvaluation
} from '../types/CODAEvaluatorTypes';
import type { EvaluationContext } from '../CECRLCODAEvaluator';

/**
 * Configuration de l'analyseur de compétences
 */
export interface MentorAnalyzerConfig {
    readonly analysisDepth?: 'surface' | 'detailed' | 'comprehensive';
    readonly culturalSensitivity?: boolean;
    readonly enableDetailedMetrics?: boolean;
}

/**
 * Métriques de session pour l'analyse
 */
interface SessionMetrics {
    readonly comprehensionRate: number;
    readonly engagementLevel: number;
    readonly errorRecoveryRate: number;
    readonly adaptationSpeed: number;
    readonly culturalSensitivity: number;
}

/**
 * Compétences de mentorat évaluées
 */
interface MentorCompetencies {
    readonly explanation: number;
    readonly patience: number;
    readonly adaptation: number;
    readonly encouragement: number;
    readonly culturalSensitivity: number;
}

/**
 * Analyseur spécialisé des compétences de mentorat
 * 
 * @class MentorSkillsAnalyzer
 * @description Module dédié à l'évaluation détaillée des compétences pédagogiques
 * 
 * @example
 * ```typescript
 * const analyzer = new MentorSkillsAnalyzer({
 *   analysisDepth: 'comprehensive',
 *   culturalSensitivity: true
 * });
 * 
 * const evaluation = await analyzer.evaluateMentorSkills(sessions, context);
 * console.log('Score global:', evaluation.overallScore);
 * ```
 */
export class MentorSkillsAnalyzer {
    /**
     * Logger pour l'analyseur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('MentorSkillsAnalyzer');

    /**
     * Configuration de l'analyseur
     * @private
     * @readonly
     */
    private readonly config: Required<MentorAnalyzerConfig>;

    /**
     * Version de l'analyseur
     * @private
     * @static
     * @readonly
     */
    private static readonly ANALYZER_VERSION = '3.0.1';

    /**
     * Configuration par défaut
     * @private
     * @static
     * @readonly
     */
    private static readonly DEFAULT_CONFIG: Required<MentorAnalyzerConfig> = {
        analysisDepth: 'comprehensive',
        culturalSensitivity: true,
        enableDetailedMetrics: true
    } as const;

    /**
     * Poids des compétences pour le calcul du score global
     * @private
     * @static
     * @readonly
     */
    private static readonly COMPETENCY_WEIGHTS = {
        explanation: 0.25,
        patience: 0.2,
        adaptation: 0.25,
        encouragement: 0.15,
        culturalSensitivity: 0.15
    } as const;

    /**
     * Constructeur de l'analyseur
     * 
     * @constructor
     * @param {Partial<MentorAnalyzerConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<MentorAnalyzerConfig>) {
        this.config = {
            ...MentorSkillsAnalyzer.DEFAULT_CONFIG,
            ...config
        };

        this.logger.info('📊 MentorSkillsAnalyzer initialisé', {
            version: MentorSkillsAnalyzer.ANALYZER_VERSION,
            depth: this.config.analysisDepth,
            culturalSensitivity: this.config.culturalSensitivity
        });
    }

    /**
     * Évalue les compétences de mentorat
     * 
     * @method evaluateMentorSkills
     * @async
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @param {EvaluationContext} context - Contexte d'évaluation
     * @returns {Promise<MentorEvaluation>} Évaluation complète
     * @public
     */
    public async evaluateMentorSkills(
        sessions: readonly TeachingSession[],
        context: EvaluationContext
    ): Promise<MentorEvaluation> {
        this.logger.debug('🔍 Analyse des compétences mentor', {
            mentorId: context.mentorId,
            sessions: sessions.length,
            depth: this.config.analysisDepth
        });

        // Calculer les métriques de session
        const sessionMetrics = sessions.map(session => this.calculateSessionMetrics(session));

        // Évaluer les compétences individuelles
        const competencies = this.evaluateIndividualCompetencies(sessions, sessionMetrics, context);

        // Calculer le score global
        const overallScore = this.calculateOverallScore(competencies);

        // Générer conseils d'amélioration
        const improvements = this.generateImprovementTips(competencies, sessionMetrics);

        // Identifier les domaines de force
        const strengths = this.identifyStrengthAreas(competencies);

        // Générer recommandations
        const recommendations = this.generateRecommendations(competencies, context);

        const evaluation: MentorEvaluation = {
            overallScore,
            teachingLevel: this.determineTeachingLevel(overallScore),
            competencies,
            strengths,
            improvements,
            recommendations
        };

        this.logger.info('✅ Évaluation mentor terminée', {
            mentorId: context.mentorId,
            overallScore: overallScore.toFixed(2),
            teachingLevel: evaluation.teachingLevel,
            strengths: strengths.length,
            improvements: improvements.length
        });

        return evaluation;
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Calcule les métriques d'une session
     * @param session Session à analyser
     * @returns Métriques calculées
     * @private
     */
    private calculateSessionMetrics(session: TeachingSession): SessionMetrics {
        const comprehensionRate = session.aiReactions?.comprehension || 0.5;

        // Calculer le niveau d'engagement basé sur la satisfaction
        const engagementLevel = session.results?.aiSatisfaction || 0.5;

        // Calculer le taux de récupération d'erreurs
        const errors = session.aiReactions?.errors || [];
        const concepts = session.content?.concepts || [];
        const errorRecoveryRate = concepts.length > 0
            ? Math.max(0, 1 - (errors.length / concepts.length))
            : 1.0;

        // Calculer la vitesse d'adaptation basée sur l'amélioration
        const adaptationSpeed = session.results?.improvement || 0.5;

        // Calculer la sensibilité culturelle
        const culturalSensitivity = this.calculateCulturalSensitivity(session);

        return {
            comprehensionRate,
            engagementLevel,
            errorRecoveryRate,
            adaptationSpeed,
            culturalSensitivity
        };
    }

    /**
     * Évalue les compétences individuelles
     * @param sessions Sessions d'enseignement
     * @param metrics Métriques calculées
     * @param context Contexte d'évaluation
     * @returns Compétences évaluées
     * @private
     */
    private evaluateIndividualCompetencies(
        sessions: readonly TeachingSession[],
        metrics: readonly SessionMetrics[],
        context: EvaluationContext
    ): MentorCompetencies {
        return {
            explanation: this.evaluateExplanationSkill(sessions, metrics),
            patience: this.evaluatePatienceSkill(sessions, metrics),
            adaptation: this.evaluateAdaptationSkill(sessions, metrics),
            encouragement: this.evaluateEncouragementSkill(sessions, metrics),
            culturalSensitivity: this.evaluateCulturalSensitivity(sessions, metrics, context)
        };
    }

    /**
     * Évalue la compétence d'explication
     * @param sessions Sessions d'enseignement
     * @param metrics Métriques calculées
     * @returns Score de compétence (0-1)
     * @private
     */
    private evaluateExplanationSkill(
        sessions: readonly TeachingSession[],
        metrics: readonly SessionMetrics[]
    ): number {
        if (sessions.length === 0) return 0.5;

        // Analyser la clarté des explications basée sur la compréhension
        const comprehensionScores = metrics.map(m => m.comprehensionRate);
        const averageComprehension = comprehensionScores.length > 0 
            ? comprehensionScores.reduce((sum: number, score: number) => sum + score, 0) / comprehensionScores.length
            : 0.5;

        // Analyser la progression dans les sessions
        const progressionFactor = this.calculateProgressionFactor(comprehensionScores);

        // Facteur de consistance
        const consistencyFactor = this.calculateConsistencyFactor(comprehensionScores);

        // Analyser le nombre de questions (moins de questions = meilleures explications)
        const totalQuestions = sessions.reduce((sum, session) => sum + (session.aiReactions?.questions?.length || 0), 0);
        const questionsFactor = sessions.length > 0
            ? Math.max(0, 1 - (totalQuestions / (sessions.length * 3))) // Max 3 questions par session
            : 0.5;

        // Score final combiné
        const finalScore = (averageComprehension * 0.4) + (progressionFactor * 0.2) + (consistencyFactor * 0.2) + (questionsFactor * 0.2);

        return Math.max(0, Math.min(1, finalScore));
    }

    /**
     * Évalue la compétence de patience
     * @param sessions Sessions d'enseignement
     * @param metrics Métriques calculées
     * @returns Score de compétence (0-1)
     * @private
     */
    private evaluatePatienceSkill(
        sessions: readonly TeachingSession[],
        metrics: readonly SessionMetrics[]
    ): number {
        if (sessions.length === 0) return 0.5;

        // Analyser la gestion de la frustration
        const frustrationScores = sessions.map(s => s.aiReactions?.frustrationSigns || 0);
        const averageFrustration = frustrationScores.length > 0 
            ? frustrationScores.reduce((sum: number, score: number) => sum + score, 0) / frustrationScores.length
            : 0;
        const frustrationHandling = Math.max(0, 1 - averageFrustration); // Moins de frustration = plus de patience

        // Analyser le taux d'acceptation des corrections
        const correctionRates = sessions.map(s => s.aiReactions?.correctionsAccepted || 0.5);
        const averageAcceptance = correctionRates.length > 0
            ? correctionRates.reduce((sum: number, rate: number) => sum + rate, 0) / correctionRates.length
            : 0.5;

        // Analyser la consistance de l'engagement
        const engagementConsistency = this.calculateEngagementConsistency(metrics);

        // Analyser la durée des sessions (patience = sessions adaptées aux besoins)
        const sessionDurations = sessions.map(s => s.content?.duration || 0);
        const durationVariability = this.calculateVariability(sessionDurations);
        const adaptiveDurationScore = Math.max(0, 1 - durationVariability / 30); // Normaliser

        // Score final
        const patienceScore = (frustrationHandling * 0.3) + (averageAcceptance * 0.3) + (engagementConsistency * 0.2) + (adaptiveDurationScore * 0.2);

        return Math.max(0, Math.min(1, patienceScore));
    }

    /**
     * Évalue la compétence d'adaptation
     * @param sessions Sessions d'enseignement
     * @param metrics Métriques calculées
     * @returns Score de compétence (0-1)
     * @private
     */
    private evaluateAdaptationSkill(
        sessions: readonly TeachingSession[],
        metrics: readonly SessionMetrics[]
    ): number {
        if (sessions.length === 0) return 0.5;

        // Analyser la vitesse d'adaptation aux besoins de l'AI
        const adaptationSpeeds = metrics.map(m => m.adaptationSpeed);
        const averageAdaptationSpeed = adaptationSpeeds.length > 0
            ? adaptationSpeeds.reduce((sum: number, speed: number) => sum + speed, 0) / adaptationSpeeds.length
            : 0.5;

        // Analyser la variété des méthodes d'enseignement
        const teachingMethods = new Set(sessions.map(s => s.content?.teachingMethod || 'default'));
        const methodVariety = Math.min(1, teachingMethods.size / 3); // Max 3 méthodes différentes

        // Analyser l'adaptation du contenu selon les réactions
        const contentAdaptation = this.analyzeContentAdaptation(sessions);

        return (averageAdaptationSpeed * 0.5) + (methodVariety * 0.3) + (contentAdaptation * 0.2);
    }

    /**
     * Évalue la compétence d'encouragement
     * @param sessions Sessions d'enseignement
     * @param metrics Métriques calculées - utilisées pour analyser l'efficacité des encouragements
     * @returns Score de compétence (0-1)
     * @private
     */
    private evaluateEncouragementSkill(
        sessions: readonly TeachingSession[],
        metrics: readonly SessionMetrics[]
    ): number {
        if (sessions.length === 0) return 0.5;

        // Analyser l'évolution de la satisfaction de l'IA
        const satisfactionScores = sessions.map(s => s.results?.aiSatisfaction || 0.5);
        const averageSatisfaction = satisfactionScores.length > 0
            ? satisfactionScores.reduce((sum: number, score: number) => sum + score, 0) / satisfactionScores.length
            : 0.5;

        // Analyser l'amélioration progressive
        const improvementScores = sessions.map(s => s.results?.improvement || 0);
        const averageImprovement = improvementScores.length > 0
            ? improvementScores.reduce((sum: number, score: number) => sum + score, 0) / improvementScores.length
            : 0;

        // Analyser la progression de la satisfaction
        let satisfactionGrowth = 0;
        if (satisfactionScores.length > 1) {
            const firstHalf = satisfactionScores.slice(0, Math.ceil(satisfactionScores.length / 2));
            const secondHalf = satisfactionScores.slice(Math.ceil(satisfactionScores.length / 2));

            const firstAvg = firstHalf.length > 0 
                ? firstHalf.reduce((sum: number, score: number) => sum + score, 0) / firstHalf.length
                : 0.5;
            const secondAvg = secondHalf.length > 0
                ? secondHalf.reduce((sum: number, score: number) => sum + score, 0) / secondHalf.length
                : 0.5;

            satisfactionGrowth = Math.max(0, secondAvg - firstAvg);
        }

        // Analyser les objectifs atteints
        const objectivesScores = sessions.map(s => s.results?.objectivesAchieved || 0.5);
        const averageObjectives = objectivesScores.length > 0
            ? objectivesScores.reduce((sum: number, score: number) => sum + score, 0) / objectivesScores.length
            : 0.5;

        // ✅ CORRECTION: Utiliser les métriques pour analyser l'efficacité des encouragements
        // Analyser la corrélation entre engagement et encouragement
        const engagementScores = metrics.map(m => m.engagementLevel);
        const averageEngagement = engagementScores.length > 0
            ? engagementScores.reduce((sum: number, score: number) => sum + score, 0) / engagementScores.length
            : 0.5;

        // Analyser la progression de l'engagement (signe d'encouragement efficace)
        const engagementProgression = this.calculateProgressionFactor(engagementScores);

        // Analyser la corrélation entre taux de récupération d'erreurs et encouragement
        const errorRecoveryScores = metrics.map(m => m.errorRecoveryRate);
        const averageErrorRecovery = errorRecoveryScores.length > 0
            ? errorRecoveryScores.reduce((sum: number, score: number) => sum + score, 0) / errorRecoveryScores.length
            : 1.0;

        // Score final d'encouragement enrichi avec les métriques
        const encouragementScore = (
            averageSatisfaction * 0.25 +
            averageImprovement * 0.2 +
            satisfactionGrowth * 0.2 +
            averageObjectives * 0.15 +
            averageEngagement * 0.1 +        // ✅ Nouveau: niveau d'engagement
            engagementProgression * 0.05 +   // ✅ Nouveau: progression engagement
            averageErrorRecovery * 0.05      // ✅ Nouveau: récupération d'erreurs
        );

        return Math.max(0, Math.min(1, encouragementScore));
    }

    /**
     * Évalue la sensibilité culturelle
     * @param sessions Sessions d'enseignement
     * @param metrics Métriques calculées
     * @param context Contexte d'évaluation
     * @returns Score de compétence (0-1)
     * @private
     */
    private evaluateCulturalSensitivity(
        sessions: readonly TeachingSession[],
        metrics: readonly SessionMetrics[],
        context: EvaluationContext
    ): number {
        if (!this.config.culturalSensitivity) return 0.7; // Score par défaut

        // Analyser l'adaptation au contexte culturel
        const culturalAdaptationScore = metrics.length > 0
            ? metrics.map(m => m.culturalSensitivity)
                .reduce((sum: number, score: number) => sum + score, 0) / metrics.length
            : 0.5;

        // Analyser l'utilisation d'éléments culturels appropriés
        const culturalElementsUsed = this.analyzeCulturalElementsUsage(sessions);

        // Analyser la sensibilité aux nuances culturelles
        const culturalNuanceScore = this.analyzeCulturalNuances(sessions, context);

        return (culturalAdaptationScore * 0.4) + (culturalElementsUsed * 0.3) + (culturalNuanceScore * 0.3);
    }

    /**
     * Calcule le score global
     * @param competencies Compétences évaluées
     * @returns Score global (0-1)
     * @private
     */
    private calculateOverallScore(competencies: MentorCompetencies): number {
        const weights = MentorSkillsAnalyzer.COMPETENCY_WEIGHTS;

        return (
            competencies.explanation * weights.explanation +
            competencies.patience * weights.patience +
            competencies.adaptation * weights.adaptation +
            competencies.encouragement * weights.encouragement +
            competencies.culturalSensitivity * weights.culturalSensitivity
        );
    }

    /**
     * Détermine le niveau d'enseignement
     * @param score Score global
     * @returns Niveau d'enseignement
     * @private
     */
    private determineTeachingLevel(score: number): MentorEvaluation['teachingLevel'] {
        if (score >= 0.85) return 'expert';
        if (score >= 0.7) return 'proficient';
        if (score >= 0.5) return 'developing';
        return 'novice';
    }

    // ================== MÉTHODES UTILITAIRES ==================

    /**
     * Calcule la sensibilité culturelle d'une session
     * @param session Session à analyser
     * @returns Score de sensibilité culturelle
     * @private
     */
    private calculateCulturalSensitivity(session: TeachingSession): number {
        // Analyser les concepts culturels présents
        const concepts = session.content?.concepts || [];
        const culturalConcepts = concepts.filter(concept =>
            concept.includes('culture') ||
            concept.includes('histoire') ||
            concept.includes('communauté')
        );

        // Score basé sur la présence d'éléments culturels
        const culturalPresence = Math.min(1, culturalConcepts.length / 3);

        // Score basé sur l'appropriateness (simulation)
        const appropriatenessScore = 0.7;

        return (culturalPresence * 0.6) + (appropriatenessScore * 0.4);
    }

    /**
     * Calcule le facteur de progression
     * @param scores Scores à analyser
     * @returns Facteur de progression (0-1)
     * @private
     */
    private calculateProgressionFactor(scores: readonly number[]): number {
        if (scores.length < 2) return 0.5;

        const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
        const secondHalf = scores.slice(Math.ceil(scores.length / 2));

        const firstAvg = firstHalf.length > 0 
            ? firstHalf.reduce((sum: number, score: number) => sum + score, 0) / firstHalf.length
            : 0;
        const secondAvg = secondHalf.length > 0
            ? secondHalf.reduce((sum: number, score: number) => sum + score, 0) / secondHalf.length
            : 0;

        const improvement = secondAvg - firstAvg;
        return Math.max(0, Math.min(1, (improvement + 0.5) / 1)); // Normaliser entre 0-1
    }

    /**
     * Calcule le facteur de consistance
     * @param scores Scores à analyser
     * @returns Facteur de consistance (0-1)
     * @private
     */
    private calculateConsistencyFactor(scores: readonly number[]): number {
        if (scores.length < 2) return 1;

        const mean = scores.length > 0 
            ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
            : 0;
        const variance = scores.length > 0
            ? scores.reduce((sum: number, score: number) => sum + Math.pow(score - mean, 2), 0) / scores.length
            : 0;
        const standardDeviation = Math.sqrt(variance);

        // Plus la déviation est faible, plus la consistance est élevée
        return Math.max(0, 1 - (standardDeviation * 2));
    }

    /**
     * Calcule la consistance de l'engagement
     * @param metrics Métriques à analyser
     * @returns Consistance de l'engagement (0-1)
     * @private
     */
    private calculateEngagementConsistency(metrics: readonly SessionMetrics[]): number {
        const engagementLevels = metrics.map(m => m.engagementLevel);
        return this.calculateConsistencyFactor(engagementLevels);
    }

    /**
     * Calcule la variabilité d'un ensemble de valeurs
     * @param values Valeurs à analyser
     * @returns Variabilité (écart-type)
     * @private
     */
    private calculateVariability(values: readonly number[]): number {
        if (values.length < 2) return 0;

        const mean = values.length > 0
            ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length
            : 0;
        const variance = values.length > 0
            ? values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length
            : 0;

        return Math.sqrt(variance);
    }

    /**
     * Analyse l'adaptation du contenu
     * @param sessions Sessions à analyser
     * @returns Score d'adaptation du contenu (0-1)
     * @private
     */
    private analyzeContentAdaptation(sessions: readonly TeachingSession[]): number {
        // Analyser si le contenu s'adapte aux réactions de l'IA
        if (sessions.length < 2) return 0.7;

        // Analyser la progression de la complexité
        const complexityProgression = this.analyzeComplexityProgression(sessions);

        // Analyser l'adaptation aux erreurs
        const errorAdaptation = this.analyzeErrorAdaptation(sessions);

        return (complexityProgression * 0.6) + (errorAdaptation * 0.4);
    }

    /**
     * Analyse la progression de complexité
     * @param sessions Sessions à analyser
     * @returns Score de progression (0-1)
     * @private
     */
    private analyzeComplexityProgression(sessions: readonly TeachingSession[]): number {
        // Analyser l'évolution du nombre de concepts
        const conceptCounts = sessions.map(s => s.content?.concepts?.length || 0);

        if (conceptCounts.length < 2) return 0.7;

        // Vérifier une progression logique
        let appropriateProgression = 0;
        for (let i = 1; i < conceptCounts.length; i++) {
            const diff = conceptCounts[i] - conceptCounts[i - 1];
            if (diff >= -1 && diff <= 2) { // Progression raisonnable
                appropriateProgression++;
            }
        }

        return appropriateProgression / (conceptCounts.length - 1);
    }

    /**
     * Analyse l'adaptation aux erreurs
     * @param sessions Sessions à analyser
     * @returns Score d'adaptation (0-1)
     * @private
     */
    private analyzeErrorAdaptation(sessions: readonly TeachingSession[]): number {
        // Analyser si les sessions suivantes s'adaptent aux erreurs précédentes
        let adaptationScore = 0;
        let comparisons = 0;

        for (let i = 1; i < sessions.length; i++) {
            const prevErrors = sessions[i - 1].aiReactions?.errors?.length || 0;
            const currentErrors = sessions[i].aiReactions?.errors?.length || 0;

            // Si beaucoup d'erreurs précédentes, on s'attend à moins d'erreurs actuelles
            if (prevErrors > 2 && currentErrors <= prevErrors) {
                adaptationScore++;
            } else if (prevErrors <= 2) {
                adaptationScore += 0.8; // Maintien d'un bon niveau
            }
            comparisons++;
        }

        return comparisons > 0 ? adaptationScore / comparisons : 0.7;
    }

    /**
     * Analyse l'usage d'éléments culturels
     * @param sessions Sessions à analyser
     * @returns Score d'usage culturel (0-1)
     * @private
     */
    private analyzeCulturalElementsUsage(sessions: readonly TeachingSession[]): number {
        const totalConcepts = sessions.flatMap(s => s.content?.concepts || []);
        const culturalConcepts = totalConcepts.filter(concept =>
            concept.includes('culture') ||
            concept.includes('histoire') ||
            concept.includes('communauté') ||
            concept.includes('tradition')
        );

        return totalConcepts.length > 0
            ? Math.min(1, culturalConcepts.length / totalConcepts.length * 5) // Amplifier le score
            : 0;
    }

    /**
     * Analyse les nuances culturelles
     * @param sessions Sessions à analyser
     * @param context Contexte d'évaluation
     * @returns Score de nuances culturelles (0-1)
     * @private
     */
    private analyzeCulturalNuances(
        sessions: readonly TeachingSession[],
        context: EvaluationContext
    ): number {
        // Analyser la prise en compte du contexte culturel spécifique
        const contextualAdaptation = context.culturalContext !== 'general' ? 0.8 : 0.5;

        // Analyser la diversité culturelle abordée
        const culturalTopics = sessions.flatMap(s => s.content?.concepts || [])
            .filter(concept => concept.includes('culture'));
        const diversityScore = Math.min(1, culturalTopics.length / 5);

        return (contextualAdaptation * 0.6) + (diversityScore * 0.4);
    }

    /**
     * Génère des conseils d'amélioration
     * @param competencies Compétences évaluées
     * @param sessionMetrics Métriques de session
     * @returns Conseils d'amélioration
     * @private
     */
    private generateImprovementTips(
        competencies: MentorCompetencies,
        sessionMetrics: readonly SessionMetrics[]
    ): readonly string[] {
        const tips: string[] = [];

        if (competencies.explanation < 0.6) {
            tips.push("Améliorer la clarté des explications avec plus d'exemples visuels");
        }
        if (competencies.patience < 0.6) {
            tips.push("Développer la patience pédagogique - accordez plus de temps à l'IA-élève");
        }
        if (competencies.adaptation < 0.6) {
            tips.push("Varier davantage les méthodes d'enseignement selon les réactions");
        }
        if (competencies.encouragement < 0.6) {
            tips.push("Renforcer les encouragements positifs et célébrer les progrès");
        }
        if (competencies.culturalSensitivity < 0.6) {
            tips.push("Approfondir la connaissance de la culture sourde et l'intégrer davantage");
        }

        // Conseils basés sur les métriques
        const avgEngagement = sessionMetrics.length > 0
            ? sessionMetrics.reduce((sum: number, m: SessionMetrics) => sum + m.engagementLevel, 0) / sessionMetrics.length
            : 0.5;
        if (avgEngagement < 0.6) {
            tips.push("Améliorer l'engagement en variant les activités et en rendant les leçons plus interactives");
        }

        return tips;
    }

    /**
     * Identifie les domaines de force
     * @param competencies Compétences évaluées
     * @returns Domaines de force
     * @private
     */
    private identifyStrengthAreas(competencies: MentorCompetencies): readonly string[] {
        const strengths: string[] = [];

        if (competencies.explanation > 0.75) strengths.push("Excellence dans la clarté des explications");
        if (competencies.patience > 0.75) strengths.push("Patience pédagogique remarquable");
        if (competencies.adaptation > 0.75) strengths.push("Grande adaptabilité aux besoins de l'apprenant");
        if (competencies.encouragement > 0.75) strengths.push("Capacité exceptionnelle à encourager et motiver");
        if (competencies.culturalSensitivity > 0.75) strengths.push("Excellente sensibilité culturelle");

        return strengths;
    }

    /**
     * Génère des recommandations
     * @param competencies Compétences évaluées
     * @param context Contexte d'évaluation
     * @returns Recommandations
     * @private
     */
    private generateRecommendations(
        competencies: MentorCompetencies,
        context: EvaluationContext
    ): readonly string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur l'expérience
        if (context.mentorExperience === 'novice') {
            recommendations.push("Suivre une formation complémentaire en pédagogie LSF");
            recommendations.push("Pratiquer avec un mentor expérimenté");
        } else if (context.mentorExperience === 'expert') {
            recommendations.push("Considérer devenir formateur pour d'autres mentors");
            recommendations.push("Développer de nouvelles méthodes pédagogiques innovantes");
        }

        // Recommandations basées sur les compétences les plus faibles
        const lowestSkill = Object.entries(competencies)
            .reduce((lowest, [skill, score]) => score < lowest.score ? { skill, score } : lowest,
                { skill: '', score: 1 });

        if (lowestSkill.score < 0.7) {
            switch (lowestSkill.skill) {
                case 'explanation':
                    recommendations.push("Se concentrer sur l'amélioration des techniques d'explication");
                    break;
                case 'patience':
                    recommendations.push("Pratiquer des techniques de gestion du stress et de patience");
                    break;
                case 'adaptation':
                    recommendations.push("Explorer différentes méthodes d'enseignement et d'adaptation");
                    break;
                case 'encouragement':
                    recommendations.push("Développer des compétences en motivation et encouragement");
                    break;
                case 'culturalSensitivity':
                    recommendations.push("Approfondir la connaissance de la culture et communauté sourde");
                    break;
            }
        }

        return recommendations;
    }
}