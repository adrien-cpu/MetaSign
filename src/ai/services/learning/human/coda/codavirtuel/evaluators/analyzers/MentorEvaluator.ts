/**
 * Évaluateur des compétences de mentorat CODA - Version refactorisée et corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/MentorEvaluator.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Évalue les compétences pédagogiques du mentor CODA avec IA révolutionnaire
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-15
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { MentorCompetencyAnalyzer } from './MentorCompetencyAnalyzer';
import { MentorRecommendationEngine } from './MentorRecommendationEngine';
import type {
    TeachingSession,
    MentorEvaluation,
    EmotionalConfig,
    StrengthsImprovementsResult
} from '../types/CODAEvaluatorTypes';
import type { EmotionalContext } from './EmotionalAnalyzer';

/**
 * Interface pour les options d'évaluation du mentor
 */
export interface MentorEvaluationOptions {
    /** Inclure l'analyse des tendances */
    readonly includeTrends?: boolean;
    /** Niveau de détail des recommandations */
    readonly detailLevel?: 'basic' | 'detailed' | 'comprehensive';
    /** Activer l'analyse prédictive */
    readonly enablePredictive?: boolean;
}

/**
 * Interface pour les métriques d'évaluation du mentor
 */
export interface MentorEvaluationMetrics {
    /** Temps d'évaluation en millisecondes */
    readonly evaluationTime: number;
    /** Nombre de sessions analysées */
    readonly sessionsAnalyzed: number;
    /** Score de confiance de l'évaluation (0-1) */
    readonly confidenceScore: number;
    /** Version de l'algorithme d'évaluation */
    readonly algorithmVersion: string;
}

/**
 * Évaluateur principal des compétences de mentorat
 * Responsable de l'orchestration de l'évaluation des compétences pédagogiques du mentor
 * 
 * @example
 * ```typescript
 * const evaluator = new MentorEvaluator(emotionalConfig);
 * const evaluation = evaluator.evaluateMentorSkills(sessions, emotionalContext);
 * 
 * // Avec options avancées
 * const options = { includeTrends: true, detailLevel: 'comprehensive' };
 * const detailedEvaluation = evaluator.evaluateWithOptions(sessions, emotionalContext, options);
 * ```
 */
export class MentorEvaluator {
    private readonly logger = LoggerFactory.getLogger('MentorEvaluator');
    private readonly emotionalConfig: EmotionalConfig;
    private readonly competencyAnalyzer: MentorCompetencyAnalyzer;
    private readonly recommendationEngine: MentorRecommendationEngine;

    /** Version actuelle de l'algorithme d'évaluation */
    private static readonly ALGORITHM_VERSION = '3.0.1';

    /**
     * Constructeur de l'évaluateur de mentors
     * @param emotionalConfig Configuration émotionnelle pour l'évaluation
     */
    constructor(emotionalConfig: EmotionalConfig) {
        this.emotionalConfig = emotionalConfig;
        this.competencyAnalyzer = new MentorCompetencyAnalyzer(emotionalConfig);
        this.recommendationEngine = new MentorRecommendationEngine();

        this.logger.debug('MentorEvaluator initialisé', {
            culturalSensitivityWeight: emotionalConfig.culturalSensitivityWeight,
            algorithmVersion: MentorEvaluator.ALGORITHM_VERSION
        });
    }

    /**
     * Évalue les compétences de mentorat avec IA émotionnelle
     * @param sessions Sessions d'enseignement à évaluer
     * @param emotionalContext Contexte émotionnel actuel
     * @returns Évaluation complète du mentor
     * 
     * @example
     * ```typescript
     * const evaluation = evaluator.evaluateMentorSkills(sessions, {
     *   detectedEmotion: 'confident',
     *   intensity: 0.8,
     *   contributingFactors: ['Excellente compréhension'],
     *   adaptationRecommendations: ['Continuer sur cette voie']
     * });
     * ```
     */
    public evaluateMentorSkills(
        sessions: readonly TeachingSession[],
        emotionalContext: EmotionalContext
    ): MentorEvaluation {
        const startTime = Date.now();

        this.logger.debug('Début de l\'évaluation des compétences mentor', {
            sessionsCount: sessions.length,
            emotion: emotionalContext.detectedEmotion,
            intensity: emotionalContext.intensity
        });

        if (sessions.length === 0) {
            this.logger.warn('Aucune session fournie, retour de l\'évaluation par défaut');
            return this.createDefaultEvaluation();
        }

        try {
            // Analyse des compétences via le module spécialisé
            const competencies = this.competencyAnalyzer.analyzeAllCompetencies(
                sessions,
                emotionalContext
            );

            // Calcul du score global pondéré
            const overallScore = this.calculateOverallScore(competencies);

            // Détermination du niveau d'enseignement
            const teachingLevel = this.determineTeachingLevel(overallScore);

            // Identification des forces et améliorations
            const { strengths, improvements } = this.identifyStrengthsAndImprovements(competencies);

            // Génération des recommandations personnalisées
            const recommendations = this.recommendationEngine.generateRecommendations(
                competencies,
                emotionalContext,
                teachingLevel
            );

            const evaluation: MentorEvaluation = {
                overallScore,
                teachingLevel,
                competencies,
                strengths,
                improvements,
                recommendations
            };

            const evaluationTime = Date.now() - startTime;

            this.logger.info('Évaluation mentor complétée avec succès', {
                overallScore: parseFloat(overallScore.toFixed(3)),
                teachingLevel,
                strengthsCount: strengths.length,
                improvementsCount: improvements.length,
                recommendationsCount: recommendations.length,
                evaluationTime: `${evaluationTime}ms`
            });

            return evaluation;

        } catch (error) {
            this.logger.error('Erreur lors de l\'évaluation du mentor', {
                error: error instanceof Error ? error.message : 'Erreur inconnue',
                sessionsCount: sessions.length,
                emotionalState: emotionalContext.detectedEmotion
            });
            return this.createErrorFallbackEvaluation();
        }
    }

    /**
     * Évalue les compétences avec options avancées
     * @param sessions Sessions d'enseignement à évaluer
     * @param emotionalContext Contexte émotionnel actuel
     * @param options Options d'évaluation avancées
     * @returns Évaluation complète avec métriques
     */
    public evaluateWithOptions(
        sessions: readonly TeachingSession[],
        emotionalContext: EmotionalContext,
        options: MentorEvaluationOptions = {}
    ): { evaluation: MentorEvaluation; metrics: MentorEvaluationMetrics } {
        const startTime = Date.now();

        this.logger.debug('Évaluation avec options avancées', {
            includeTrends: options.includeTrends,
            detailLevel: options.detailLevel,
            enablePredictive: options.enablePredictive
        });

        const evaluation = this.evaluateMentorSkills(sessions, emotionalContext);
        const evaluationTime = Date.now() - startTime;

        // Calcul du score de confiance basé sur le nombre de sessions et la cohérence
        const confidenceScore = this.calculateConfidenceScore(sessions, evaluation);

        const metrics: MentorEvaluationMetrics = {
            evaluationTime,
            sessionsAnalyzed: sessions.length,
            confidenceScore,
            algorithmVersion: MentorEvaluator.ALGORITHM_VERSION
        };

        return { evaluation, metrics };
    }

    /**
     * Obtient la compétence la plus faible du mentor
     * @param competencies Compétences évaluées du mentor
     * @returns Nom de la compétence la plus faible ou null si aucune compétence
     * 
     * @example
     * ```typescript
     * const weakest = evaluator.getWeakestMentorCompetency(evaluation.competencies);
     * if (weakest) {
     *   console.log(`Compétence à améliorer: ${weakest}`);
     *   const tips = evaluator.getMentorImprovementTips(weakest);
     * }
     * ```
     */
    public getWeakestMentorCompetency(
        competencies: MentorEvaluation['competencies']
    ): string | null {
        const entries = Object.entries(competencies);

        if (entries.length === 0) {
            this.logger.warn('Aucune compétence fournie pour l\'analyse');
            return null;
        }

        entries.sort((a, b) => a[1] - b[1]);
        const weakest = entries[0][0];

        this.logger.debug('Compétence la plus faible identifiée', {
            skill: weakest,
            score: parseFloat(entries[0][1].toFixed(3)),
            gap: parseFloat((entries[entries.length - 1][1] - entries[0][1]).toFixed(3))
        });

        return weakest;
    }

    /**
     * Génère des conseils d'amélioration pour une compétence spécifique
     * @param skill Nom de la compétence à améliorer
     * @returns Liste des conseils d'amélioration
     * 
     * @example
     * ```typescript
     * const tips = evaluator.getMentorImprovementTips('patience');
     * tips.forEach(tip => console.log(`💡 ${tip}`));
     * ```
     */
    public getMentorImprovementTips(skill: string): readonly string[] {
        const tips = this.recommendationEngine.getImprovementTips(skill);

        this.logger.debug('Conseils d\'amélioration générés', {
            skill,
            tipsCount: tips.length
        });

        return tips;
    }

    /**
     * Génère des exercices de pratique pour une compétence spécifique
     * @param skill Nom de la compétence à pratiquer
     * @returns Liste des exercices recommandés
     * 
     * @example
     * ```typescript
     * const exercises = evaluator.getMentorPracticeExercises('adaptation');
     * exercises.forEach(exercise => console.log(`🏃 ${exercise}`));
     * ```
     */
    public getMentorPracticeExercises(skill: string): readonly string[] {
        const exercises = this.recommendationEngine.getPracticeExercises(skill);

        this.logger.debug('Exercices de pratique générés', {
            skill,
            exercisesCount: exercises.length
        });

        return exercises;
    }

    /**
     * Calcule un score de performance global basé sur l'évolution
     * @param sessions Sessions à analyser
     * @returns Score d'évolution global (0-1)
     */
    public calculateProgressionScore(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 3) {
            this.logger.debug('Pas assez de sessions pour calculer la progression');
            return 0.5; // Score neutre
        }

        const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
        const satisfactionValues = sessions.map(s => s.results.aiSatisfaction);

        const comprehensionTrend = this.calculateTrend(comprehensionValues);
        const satisfactionTrend = this.calculateTrend(satisfactionValues);

        const progressionScore = (comprehensionTrend + satisfactionTrend) / 2;

        this.logger.debug('Score de progression calculé', {
            comprehensionTrend: parseFloat(comprehensionTrend.toFixed(3)),
            satisfactionTrend: parseFloat(satisfactionTrend.toFixed(3)),
            progressionScore: parseFloat(progressionScore.toFixed(3))
        });

        return Math.max(0, Math.min(1, progressionScore));
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Calcule le score de confiance de l'évaluation
     * @param sessions Sessions analysées
     * @param evaluation Évaluation produite
     * @returns Score de confiance (0-1)
     * @private
     */
    private calculateConfidenceScore(
        sessions: readonly TeachingSession[],
        evaluation: MentorEvaluation
    ): number {
        // Base de confiance selon le nombre de sessions
        const baseConfidence = Math.min(1, sessions.length / 10);

        // Bonus pour la cohérence des scores
        const competencyValues = Object.values(evaluation.competencies);
        const variance = this.calculateVariance(competencyValues);
        const coherenceBonus = Math.max(0, 0.2 - variance);

        // Bonus pour la présence de forces et améliorations identifiées
        const analysisBonus = (evaluation.strengths.length + evaluation.improvements.length) * 0.05;

        const finalConfidence = Math.min(1, baseConfidence + coherenceBonus + analysisBonus);

        this.logger.debug('Score de confiance calculé', {
            baseConfidence: parseFloat(baseConfidence.toFixed(3)),
            coherenceBonus: parseFloat(coherenceBonus.toFixed(3)),
            analysisBonus: parseFloat(analysisBonus.toFixed(3)),
            finalConfidence: parseFloat(finalConfidence.toFixed(3))
        });

        return finalConfidence;
    }

    /**
     * Calcule la tendance d'une série de valeurs
     * @param values Valeurs à analyser
     * @returns Tendance normalisée
     * @private
     */
    private calculateTrend(values: readonly number[]): number {
        if (values.length < 2) return 0.5;

        const midPoint = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, midPoint);
        const secondHalf = values.slice(midPoint);

        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

        const improvement = secondAvg - firstAvg;
        return Math.max(0, Math.min(1, improvement + 0.5));
    }

    /**
     * Calcule la variance d'un ensemble de valeurs
     * @param values Valeurs à analyser
     * @returns Variance
     * @private
     */
    private calculateVariance(values: readonly number[]): number {
        if (values.length === 0) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
        return squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Crée une évaluation par défaut pour les nouveaux mentors
     * @returns Évaluation par défaut avec scores de débutant
     * @private
     */
    private createDefaultEvaluation(): MentorEvaluation {
        this.logger.debug('Création de l\'évaluation par défaut');

        return {
            overallScore: 0.3,
            teachingLevel: 'novice',
            competencies: {
                explanation: 0.3,
                patience: 0.5,
                adaptation: 0.2,
                encouragement: 0.4,
                culturalSensitivity: 0.3
            },
            strengths: [],
            improvements: ['Commencer à pratiquer l\'enseignement'],
            recommendations: [
                'Débuter par des concepts simples',
                'Observer attentivement les réactions de l\'IA-élève',
                'Prendre son temps pour les explications'
            ]
        };
    }

    /**
     * Crée une évaluation de fallback en cas d'erreur
     * @returns Évaluation de sécurité
     * @private
     */
    private createErrorFallbackEvaluation(): MentorEvaluation {
        this.logger.debug('Création de l\'évaluation de fallback');

        return {
            overallScore: 0.1,
            teachingLevel: 'novice',
            competencies: {
                explanation: 0.1,
                patience: 0.1,
                adaptation: 0.1,
                encouragement: 0.1,
                culturalSensitivity: 0.1
            },
            strengths: [],
            improvements: ['Réessayer l\'évaluation'],
            recommendations: ['Contacter le support technique']
        };
    }

    /**
     * Calcule le score global pondéré basé sur les compétences
     * @param competencies Toutes les compétences évaluées
     * @returns Score global entre 0 et 1
     * @private
     */
    private calculateOverallScore(
        competencies: MentorEvaluation['competencies']
    ): number {
        const weights = {
            explanation: 0.25,
            patience: 0.2,
            adaptation: 0.2,
            encouragement: 0.15,
            culturalSensitivity: this.emotionalConfig.culturalSensitivityWeight
        };

        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

        if (totalWeight === 0) {
            this.logger.warn('Poids total des compétences est zéro');
            return 0;
        }

        const weightedScore = (
            competencies.explanation * weights.explanation +
            competencies.patience * weights.patience +
            competencies.adaptation * weights.adaptation +
            competencies.encouragement * weights.encouragement +
            competencies.culturalSensitivity * weights.culturalSensitivity
        ) / totalWeight;

        const normalizedScore = Math.max(0, Math.min(1, weightedScore));

        this.logger.debug('Score global calculé', {
            weightedScore: parseFloat(weightedScore.toFixed(3)),
            normalizedScore: parseFloat(normalizedScore.toFixed(3)),
            weights
        });

        return normalizedScore;
    }

    /**
     * Détermine le niveau d'enseignement basé sur le score global
     * @param score Score global entre 0 et 1
     * @returns Niveau d'enseignement correspondant
     * @private
     */
    private determineTeachingLevel(score: number): MentorEvaluation['teachingLevel'] {
        if (score >= 0.85) return 'expert';
        if (score >= 0.7) return 'proficient';
        if (score >= 0.5) return 'developing';
        return 'novice';
    }

    /**
     * Identifie les forces et les domaines d'amélioration du mentor
     * @param competencies Compétences évaluées
     * @returns Objet contenant les forces et améliorations
     * @private
     */
    private identifyStrengthsAndImprovements(
        competencies: MentorEvaluation['competencies']
    ): StrengthsImprovementsResult {
        const entries = Object.entries(competencies);
        entries.sort((a, b) => b[1] - a[1]);

        const strengthThreshold = 0.7;
        const improvementThreshold = 0.6;

        const strengths = entries
            .filter(([, score]) => score >= strengthThreshold)
            .map(([skill]) => skill);

        const improvements = entries
            .filter(([, score]) => score < improvementThreshold)
            .map(([skill]) => skill);

        this.logger.debug('Forces et améliorations identifiées', {
            strengths: strengths.length,
            improvements: improvements.length,
            strengthThreshold,
            improvementThreshold,
            topSkill: entries[0] ? entries[0][0] : 'aucune',
            topScore: entries[0] ? parseFloat(entries[0][1].toFixed(3)) : 0
        });

        return { strengths, improvements };
    }
}