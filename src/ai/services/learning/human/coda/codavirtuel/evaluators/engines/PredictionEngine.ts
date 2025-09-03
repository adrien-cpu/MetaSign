/**
 * Moteur de prédictions d'apprentissage avec IA prédictive
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/engines/PredictionEngine.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/engines
 * @description Moteur spécialisé dans la génération de prédictions d'apprentissage intelligentes
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-07-22
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { TeachingSession, MentorEvaluation } from '../types/CODAEvaluatorTypes';
import type { EvaluationContext } from '../CECRLCODAEvaluator';

/**
 * Niveaux CECRL supportés
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Configuration du moteur de prédictions
 */
export interface PredictionEngineConfig {
    readonly enabled?: boolean;
    readonly aiLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    readonly predictionHorizon?: number; // en jours
    readonly confidenceThreshold?: number;
    readonly enableRiskAnalysis?: boolean;
}

/**
 * Interface pour les prédictions de progression
 */
export interface ProgressPredictions {
    readonly nextMilestone: MilestonePrediction;
    readonly levelProgression: LevelProgressionPrediction;
    readonly riskFactors: readonly RiskFactor[];
    readonly opportunities: readonly OpportunityPrediction[];
}

/**
 * Interface pour la prédiction de jalon
 */
export interface MilestonePrediction {
    readonly skill: string;
    readonly estimatedDate: Date;
    readonly confidence: number;
    readonly requiredSessions?: number;
    readonly prerequisites?: readonly string[];
}

/**
 * Interface pour la prédiction de progression de niveau
 */
export interface LevelProgressionPrediction {
    readonly currentLevel: CECRLLevel;
    readonly nextLevel: CECRLLevel;
    readonly estimatedTimeToNext: number; // en jours
    readonly requiredSessions: number;
    readonly progressionRate: number;
    readonly confidence: number;
}

/**
 * Interface pour les facteurs de risque
 */
export interface RiskFactor {
    readonly factor: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly probability: number;
    readonly impact: string;
    readonly mitigation: string;
}

/**
 * Interface pour les prédictions d'opportunité
 */
export interface OpportunityPrediction {
    readonly area: string;
    readonly potential: number;
    readonly timeframe: number; // en jours
    readonly recommendation: string;
    readonly benefits: readonly string[];
}

/**
 * Interface pour les tendances d'apprentissage
 */
interface LearningTrend {
    readonly direction: 'improving' | 'stable' | 'declining';
    readonly strength: number;
    readonly consistency: number;
    readonly reliability: number;
}

/**
 * Moteur de prédictions d'apprentissage avec IA prédictive
 * 
 * @class PredictionEngine
 * @description Module spécialisé dans la génération de prédictions intelligentes
 * sur l'évolution de l'apprentissage et les opportunités futures
 * 
 * @example
 * ```typescript
 * const engine = new PredictionEngine({
 *   enabled: true,
 *   aiLevel: 'advanced',
 *   predictionHorizon: 90
 * });
 * 
 * const predictions = await engine.generateProgressPredictions(sessions, context, mentorEval);
 * console.log('Prochain jalon:', predictions.nextMilestone.skill);
 * ```
 */
export class PredictionEngine {
    /**
     * Logger pour le moteur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('PredictionEngine');

    /**
     * Configuration du moteur
     * @private
     * @readonly
     */
    private readonly config: Required<PredictionEngineConfig>;

    /**
     * Version du moteur
     * @private
     * @static
     * @readonly
     */
    private static readonly ENGINE_VERSION = '3.0.1';

    /**
     * Configuration par défaut
     * @private
     * @static
     * @readonly
     */
    private static readonly DEFAULT_CONFIG: Required<PredictionEngineConfig> = {
        enabled: true,
        aiLevel: 'advanced',
        predictionHorizon: 60, // 60 jours par défaut
        confidenceThreshold: 0.6,
        enableRiskAnalysis: true
    } as const;

    /**
     * Mapping des niveaux CECRL
     * @private
     * @static
     * @readonly
     */
    private static readonly CECRL_PROGRESSION: Record<CECRLLevel, CECRLLevel> = {
        'A1': 'A2',
        'A2': 'B1',
        'B1': 'B2',
        'B2': 'C1',
        'C1': 'C2',
        'C2': 'C2' // Niveau maximum
    } as const;

    /**
     * Durées estimées par niveau (en jours)
     * @private
     * @static
     * @readonly
     */
    private static readonly LEVEL_DURATIONS: Record<CECRLLevel, number> = {
        'A1': 45,
        'A2': 60,
        'B1': 75,
        'B2': 90,
        'C1': 120,
        'C2': 150
    } as const;

    /**
     * Constructeur du moteur de prédictions
     * 
     * @constructor
     * @param {Partial<PredictionEngineConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<PredictionEngineConfig>) {
        this.config = {
            ...PredictionEngine.DEFAULT_CONFIG,
            ...config
        };

        this.logger.info('🔮 PredictionEngine initialisé', {
            version: PredictionEngine.ENGINE_VERSION,
            enabled: this.config.enabled,
            aiLevel: this.config.aiLevel,
            horizon: this.config.predictionHorizon
        });
    }

    /**
     * Génère les prédictions de progression d'apprentissage
     * 
     * @method generateProgressPredictions
     * @async
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @param {EvaluationContext} context - Contexte d'évaluation
     * @param {MentorEvaluation} mentorEval - Évaluation du mentor
     * @returns {Promise<ProgressPredictions>} Prédictions de progression
     * @public
     */
    public async generateProgressPredictions(
        sessions: readonly TeachingSession[],
        context: EvaluationContext,
        mentorEval: MentorEvaluation
    ): Promise<ProgressPredictions> {
        if (!this.config.enabled) {
            this.logger.debug('🚫 Génération de prédictions désactivée');
            return this.createDefaultPredictions(context);
        }

        this.logger.debug('🔍 Génération de prédictions', {
            sessions: sessions.length,
            mentorId: context.mentorId,
            currentLevel: context.aiStudentLevel,
            mentorScore: mentorEval?.overallScore?.toFixed(2) || 'N/A'
        });

        // Analyser les tendances d'apprentissage
        const learningTrend = this.analyzeLearningTrend(sessions);

        // Prédire le prochain jalon
        const nextMilestone = this.predictNextMilestone(sessions, context, mentorEval, learningTrend);

        // Prédire la progression de niveau
        const levelProgression = this.predictLevelProgression(sessions, context, mentorEval, learningTrend);

        // Identifier les facteurs de risque
        const riskFactors = this.config.enableRiskAnalysis
            ? this.identifyRiskFactors(sessions, context, mentorEval, learningTrend)
            : [];

        // Identifier les opportunités
        const opportunities = this.identifyOpportunities(sessions, context, mentorEval, learningTrend);

        const predictions: ProgressPredictions = {
            nextMilestone,
            levelProgression,
            riskFactors,
            opportunities
        };

        this.logger.info('✅ Prédictions générées', {
            nextMilestoneSkill: nextMilestone.skill,
            nextLevel: levelProgression.nextLevel,
            riskFactors: riskFactors.length,
            opportunities: opportunities.length,
            avgConfidence: this.calculateAverageConfidence(predictions)
        });

        return predictions;
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Analyse les tendances d'apprentissage
     * @param sessions Sessions d'enseignement
     * @returns Tendance d'apprentissage analysée
     * @private
     */
    private analyzeLearningTrend(sessions: readonly TeachingSession[]): LearningTrend {
        if (sessions.length < 3) {
            return {
                direction: 'stable',
                strength: 0.5,
                consistency: 0.5,
                reliability: 0.3
            };
        }

        // Analyser l'évolution de la compréhension
        const comprehensionScores = sessions.map(s => s.aiReactions?.comprehension || 0.5);
        const comprehensionTrend = this.calculateTrendDirection(comprehensionScores);

        // Analyser l'évolution de l'amélioration
        const improvementScores = sessions.map(s => s.results?.improvement || 0.5);
        const improvementTrend = this.calculateTrendDirection(improvementScores);

        // Analyser l'évolution de la satisfaction
        const satisfactionScores = sessions.map(s => s.results?.aiSatisfaction || 0.5);
        const satisfactionTrend = this.calculateTrendDirection(satisfactionScores);

        // Combiner les tendances
        const combinedTrend = (comprehensionTrend + improvementTrend + satisfactionTrend) / 3;

        // Déterminer la direction
        let direction: LearningTrend['direction'];
        if (combinedTrend > 0.1) {
            direction = 'improving';
        } else if (combinedTrend < -0.1) {
            direction = 'declining';
        } else {
            direction = 'stable';
        }

        // Calculer la force de la tendance
        const strength = Math.abs(combinedTrend);

        // Calculer la consistance
        const consistency = this.calculateTrendConsistency([
            comprehensionTrend, improvementTrend, satisfactionTrend
        ]);

        // Calculer la fiabilité basée sur le nombre de sessions
        const reliability = Math.min(1, sessions.length / 10);

        return {
            direction,
            strength,
            consistency,
            reliability
        };
    }

    /**
     * Prédit le prochain jalon d'apprentissage
     * @param sessions Sessions d'enseignement
     * @param context Contexte d'évaluation
     * @param mentorEval Évaluation du mentor
     * @param trend Tendance d'apprentissage
     * @returns Prédiction de jalon
     * @private
     */
    private predictNextMilestone(
        sessions: readonly TeachingSession[],
        context: EvaluationContext,
        mentorEval: MentorEvaluation,
        trend: LearningTrend
    ): MilestonePrediction {
        // Déterminer le prochain skill à acquérir
        const nextSkill = this.determineNextSkill(sessions, context);

        // Estimer le temps nécessaire
        const baseTimeEstimate = this.getSkillTimeEstimate(nextSkill, context.aiStudentLevel);
        const adjustedTimeEstimate = this.adjustTimeEstimateForTrend(baseTimeEstimate, trend, mentorEval);

        // Calculer la confiance
        const confidence = this.calculateMilestoneConfidence(sessions, mentorEval, trend);

        // Estimer les sessions requises
        const requiredSessions = Math.ceil(adjustedTimeEstimate / (context.averageSessionDuration / 60 / 24)); // Convertir en jours

        // Identifier les prérequis
        const prerequisites = this.identifyPrerequisites(nextSkill);

        return {
            skill: nextSkill,
            estimatedDate: new Date(Date.now() + adjustedTimeEstimate * 24 * 60 * 60 * 1000),
            confidence,
            requiredSessions,
            prerequisites
        };
    }

    /**
     * Prédit la progression de niveau CECRL
     * @param sessions Sessions d'enseignement
     * @param context Contexte d'évaluation
     * @param mentorEval Évaluation du mentor
     * @param trend Tendance d'apprentissage
     * @returns Prédiction de progression de niveau
     * @private
     */
    private predictLevelProgression(
        sessions: readonly TeachingSession[],
        context: EvaluationContext,
        mentorEval: MentorEvaluation,
        trend: LearningTrend
    ): LevelProgressionPrediction {
        const currentLevel = context.aiStudentLevel as CECRLLevel;
        const nextLevel = PredictionEngine.CECRL_PROGRESSION[currentLevel];

        // Estimer le temps de base pour le niveau suivant
        const baseDuration = PredictionEngine.LEVEL_DURATIONS[nextLevel];

        // Ajuster selon les performances du mentor et la tendance
        const mentorAdjustment = ((mentorEval?.overallScore || 0.5) - 0.5) * 0.3; // -15% à +15%
        const trendAdjustment = this.calculateTrendAdjustment(trend);

        const adjustedDuration = baseDuration * (1 - mentorAdjustment - trendAdjustment);
        const estimatedTimeToNext = Math.max(15, Math.round(adjustedDuration)); // Minimum 15 jours

        // Calculer le taux de progression
        const progressionRate = this.calculateProgressionRate(sessions, trend);

        // Estimer les sessions requises
        const sessionsPerWeek = 7 / (context.averageSessionDuration / 60 / 24); // Sessions par semaine
        const requiredSessions = Math.ceil((estimatedTimeToNext / 7) * sessionsPerWeek);

        // Calculer la confiance
        const confidence = this.calculateLevelProgressionConfidence(sessions, mentorEval, trend);

        return {
            currentLevel,
            nextLevel,
            estimatedTimeToNext,
            requiredSessions,
            progressionRate,
            confidence
        };
    }

    /**
     * Identifie les facteurs de risque
     * @param sessions Sessions d'enseignement
     * @param context Contexte d'évaluation
     * @param mentorEval Évaluation du mentor
     * @param trend Tendance d'apprentissage
     * @returns Facteurs de risque identifiés
     * @private
     */
    private identifyRiskFactors(
        sessions: readonly TeachingSession[],
        context: EvaluationContext,
        mentorEval: MentorEvaluation,
        trend: LearningTrend
    ): readonly RiskFactor[] {
        const risks: RiskFactor[] = [];

        // Risque basé sur la tendance déclinante
        if (trend.direction === 'declining' && trend.strength > 0.3) {
            risks.push({
                factor: 'declining_performance',
                severity: trend.strength > 0.6 ? 'high' : 'medium',
                probability: trend.reliability,
                impact: 'Ralentissement de la progression d\'apprentissage',
                mitigation: 'Adapter l\'approche pédagogique et renforcer la motivation'
            });
        }

        // Risque basé sur la patience du mentor
        if (mentorEval.competencies.patience < 0.5) {
            risks.push({
                factor: 'mentor_patience_low',
                severity: mentorEval.competencies.patience < 0.3 ? 'high' : 'medium',
                probability: 0.8,
                impact: 'Frustration et abandon potentiel de l\'apprentissage',
                mitigation: 'Formation en gestion de patience et techniques de relaxation'
            });
        }

        // Risque basé sur l'adaptation
        if (mentorEval.competencies.adaptation < 0.4) {
            risks.push({
                factor: 'poor_adaptation',
                severity: 'medium',
                probability: 0.7,
                impact: 'Inadéquation entre l\'enseignement et les besoins',
                mitigation: 'Développer la flexibilité pédagogique et l\'observation'
            });
        }

        // Risque basé sur la fréquence des sessions
        const avgSessionInterval = this.calculateAverageSessionInterval(sessions);
        if (avgSessionInterval > 7) { // Plus de 7 jours entre sessions
            risks.push({
                factor: 'low_session_frequency',
                severity: avgSessionInterval > 14 ? 'high' : 'medium',
                probability: 0.6,
                impact: 'Perte de continuité et ralentissement des progrès',
                mitigation: 'Augmenter la fréquence des sessions d\'apprentissage'
            });
        }

        // Risque basé sur l'engagement
        const avgEngagement = this.calculateAverageEngagement(sessions);
        if (avgEngagement < 0.4) {
            risks.push({
                factor: 'low_engagement',
                severity: avgEngagement < 0.3 ? 'critical' : 'high',
                probability: 0.9,
                impact: 'Démotivation et arrêt de l\'apprentissage',
                mitigation: 'Revoir la stratégie d\'engagement et varier les activités'
            });
        }

        return risks;
    }

    /**
     * Identifie les opportunités d'apprentissage
     * @param sessions Sessions d'enseignement
     * @param context Contexte d'évaluation
     * @param mentorEval Évaluation du mentor
     * @param trend Tendance d'apprentissage
     * @returns Opportunités identifiées
     * @private
     */
    private identifyOpportunities(
        sessions: readonly TeachingSession[],
        context: EvaluationContext,
        mentorEval: MentorEvaluation,
        trend: LearningTrend
    ): readonly OpportunityPrediction[] {
        const opportunities: OpportunityPrediction[] = [];

        // Opportunité basée sur l'excellence culturelle
        if (mentorEval.competencies.culturalSensitivity > 0.8) {
            opportunities.push({
                area: 'cultural_mentorship',
                potential: mentorEval.competencies.culturalSensitivity,
                timeframe: 30,
                recommendation: 'Devenir spécialiste en mentorat culturel sourd',
                benefits: [
                    'Expertise reconnue en culture sourde',
                    'Opportunités de formation d\'autres mentors',
                    'Impact positif sur la communauté'
                ]
            });
        }

        // Opportunité basée sur les excellentes capacités d'explication
        if (mentorEval.competencies.explanation > 0.85) {
            opportunities.push({
                area: 'advanced_pedagogy',
                potential: mentorEval.competencies.explanation,
                timeframe: 45,
                recommendation: 'Explorer des techniques pédagogiques avancées',
                benefits: [
                    'Amélioration de l\'efficacité d\'enseignement',
                    'Capacité à gérer des cas complexes',
                    'Leadership pédagogique'
                ]
            });
        }

        // Opportunité basée sur la tendance positive
        if (trend.direction === 'improving' && trend.strength > 0.5) {
            opportunities.push({
                area: 'accelerated_learning',
                potential: trend.strength * trend.reliability,
                timeframe: 21,
                recommendation: 'Capitaliser sur la dynamique positive actuelle',
                benefits: [
                    'Progression plus rapide que prévu',
                    'Atteinte anticipée des objectifs',
                    'Motivation renforcée'
                ]
            });
        }

        // Opportunité basée sur l'expérience du mentor
        if (context.mentorExperience === 'expert' && mentorEval.overallScore > 0.9) {
            opportunities.push({
                area: 'mentor_training',
                potential: 0.95,
                timeframe: 60,
                recommendation: 'Devenir formateur pour nouveaux mentors',
                benefits: [
                    'Transmission d\'expertise',
                    'Impact multiplicateur',
                    'Reconnaissance professionnelle'
                ]
            });
        }

        // Opportunité d'apprentissage immersif
        if (mentorEval.overallScore > 0.7 && trend.direction !== 'declining') {
            opportunities.push({
                area: 'immersive_learning',
                potential: 0.8,
                timeframe: 14,
                recommendation: 'Intégrer des expériences d\'apprentissage immersives',
                benefits: [
                    'Apprentissage plus authentique',
                    'Amélioration de la fluidité',
                    'Connexion avec la communauté'
                ]
            });
        }

        return opportunities;
    }

    // ================== MÉTHODES UTILITAIRES ==================

    /**
     * Calcule la direction d'une tendance
     * @param values Valeurs à analyser
     * @returns Direction de tendance (-1 à 1)
     * @private
     */
    private calculateTrendDirection(values: readonly number[]): number {
        if (values.length < 2) return 0;

        const midPoint = Math.ceil(values.length / 2);
        const firstHalf = values.slice(0, midPoint);
        const secondHalf = values.slice(midPoint);

        const firstAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length;

        return Math.max(-1, Math.min(1, (secondAvg - firstAvg) * 2));
    }

    /**
     * Calcule la consistance d'une tendance
     * @param trends Tendances à analyser
     * @returns Consistance (0-1)
     * @private
     */
    private calculateTrendConsistency(trends: readonly number[]): number {
        if (trends.length < 2) return 1;

        const mean = trends.reduce((sum: number, trend: number) => sum + trend, 0) / trends.length;
        const variance = trends.reduce((sum: number, trend: number) => sum + Math.pow(trend - mean, 2), 0) / trends.length;

        // Plus la variance est faible, plus la consistance est élevée
        return Math.max(0, 1 - variance);
    }

    /**
     * Détermine le prochain skill à acquérir
     * @param sessions Sessions d'enseignement
     * @param context Contexte d'évaluation
     * @returns Prochain skill
     * @private
     */
    private determineNextSkill(sessions: readonly TeachingSession[], context: EvaluationContext): string {
        // Analyser les concepts déjà abordés
        const coveredConcepts = new Set(sessions.flatMap(s => s.content?.concepts || []));

        // Skills par niveau CECRL
        const skillsByLevel: Record<CECRLLevel, readonly string[]> = {
            'A1': ['basic_greetings', 'simple_signs', 'basic_grammar'],
            'A2': ['complex_sentences', 'time_expressions', 'past_tense'],
            'B1': ['storytelling', 'abstract_concepts', 'cultural_references'],
            'B2': ['advanced_grammar', 'nuanced_expressions', 'debate_skills'],
            'C1': ['professional_communication', 'literary_analysis', 'regional_variations'],
            'C2': ['expert_fluency', 'cultural_mastery', 'teaching_skills']
        };

        const levelSkills = skillsByLevel[context.aiStudentLevel as CECRLLevel];

        // Trouver le premier skill non encore maîtrisé
        const nextSkill = levelSkills.find(skill => !coveredConcepts.has(skill));

        return nextSkill || 'advanced_conversation';
    }

    /**
     * Obtient l'estimation de temps pour un skill selon le niveau CECRL
     * @param skill Skill à apprendre
     * @param level Niveau CECRL actuel - utilisé pour ajuster la difficulté
     * @returns Temps estimé en jours
     * @private
     */
    private getSkillTimeEstimate(skill: string, level: CECRLLevel): number {
        // Temps de base par type de skill
        const skillTimes: Record<string, number> = {
            'basic_greetings': 7,
            'simple_signs': 14,
            'basic_grammar': 21,
            'complex_sentences': 28,
            'storytelling': 35,
            'advanced_grammar': 42,
            'professional_communication': 60,
            'expert_fluency': 90
        };

        // ✅ CORRECTION: Utiliser le niveau CECRL pour ajuster la difficulté
        // Facteurs de difficulté par niveau CECRL
        const levelDifficultyFactors: Record<CECRLLevel, number> = {
            'A1': 1.0,    // Niveau de base - temps standard
            'A2': 1.1,    // 10% plus de temps (concepts plus complexes)
            'B1': 1.25,   // 25% plus de temps (abstraction croissante)
            'B2': 1.4,    // 40% plus de temps (nuances et subtilités)
            'C1': 1.6,    // 60% plus de temps (maîtrise approfondie)
            'C2': 1.8     // 80% plus de temps (expertise et perfection)
        };

        // ✅ NOUVEAU: Ajustement selon la progression dans le niveau
        // Plus on avance dans un niveau, plus les concepts deviennent complexes
        const levelProgressionFactor = this.calculateLevelProgressionFactor(skill, level);

        // ✅ NOUVEAU: Ajustement selon la compatibilité skill-niveau
        const skillLevelCompatibility = this.calculateSkillLevelCompatibility(skill, level);

        const baseTime = skillTimes[skill] || 30;
        const levelFactor = levelDifficultyFactors[level];

        // Calcul final avec tous les ajustements
        const adjustedTime = baseTime * levelFactor * levelProgressionFactor * skillLevelCompatibility;

        return Math.max(3, Math.round(adjustedTime)); // Minimum 3 jours
    }

    /**
     * ✅ NOUVELLE MÉTHODE: Calcule le facteur de progression dans le niveau
     * @param skill Skill à analyser
     * @param level Niveau CECRL actuel
     * @returns Facteur de progression (0.8-1.5)
     * @private
     */
    private calculateLevelProgressionFactor(skill: string, level: CECRLLevel): number {
        // Skills de début de niveau vs skills avancés du niveau
        const earlyLevelSkills: Record<CECRLLevel, readonly string[]> = {
            'A1': ['basic_greetings', 'simple_signs'],
            'A2': ['complex_sentences', 'time_expressions'],
            'B1': ['storytelling', 'abstract_concepts'],
            'B2': ['advanced_grammar', 'nuanced_expressions'],
            'C1': ['professional_communication', 'literary_analysis'],
            'C2': ['expert_fluency', 'cultural_mastery']
        };

        const isEarlySkill = earlyLevelSkills[level]?.includes(skill);

        // Skills de début de niveau : plus facile (facteur 0.8)
        // Skills avancés du niveau : plus difficile (facteur 1.3)
        return isEarlySkill ? 0.8 : 1.3;
    }

    /**
     * ✅ NOUVELLE MÉTHODE: Calcule la compatibilité entre le skill et le niveau
     * @param skill Skill à analyser  
     * @param level Niveau CECRL actuel
     * @returns Facteur de compatibilité (0.7-1.4)
     * @private
     */
    private calculateSkillLevelCompatibility(skill: string, level: CECRLLevel): number {
        // Mapping des skills vers leurs niveaux optimaux
        const skillOptimalLevels: Record<string, CECRLLevel> = {
            'basic_greetings': 'A1',
            'simple_signs': 'A1',
            'basic_grammar': 'A2',
            'complex_sentences': 'A2',
            'time_expressions': 'A2',
            'storytelling': 'B1',
            'abstract_concepts': 'B1',
            'cultural_references': 'B1',
            'advanced_grammar': 'B2',
            'nuanced_expressions': 'B2',
            'debate_skills': 'B2',
            'professional_communication': 'C1',
            'literary_analysis': 'C1',
            'regional_variations': 'C1',
            'expert_fluency': 'C2',
            'cultural_mastery': 'C2',
            'teaching_skills': 'C2'
        };

        const optimalLevel = skillOptimalLevels[skill];
        if (!optimalLevel) return 1.0; // Skill inconnu, facteur neutre

        // Calculer la distance entre niveau actuel et niveau optimal
        const levelOrder: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levelOrder.indexOf(level);
        const optimalIndex = levelOrder.indexOf(optimalLevel);
        const distance = Math.abs(currentIndex - optimalIndex);

        // Facteurs selon la distance :
        // Distance 0 (niveau optimal) : facteur 1.0
        // Distance 1 : facteur 1.1 (un peu plus difficile)
        // Distance 2+ : facteur 1.4 (beaucoup plus difficile)
        switch (distance) {
            case 0: return 1.0;  // Niveau optimal
            case 1: return 1.1;  // Niveau adjacent
            case 2: return 1.25; // Niveau éloigné
            default: return 1.4; // Niveau très éloigné
        }
    }

    /**
     * Ajuste l'estimation de temps selon la tendance
     * @param baseTime Temps de base
     * @param trend Tendance d'apprentissage
     * @param mentorEval Évaluation du mentor
     * @returns Temps ajusté
     * @private
     */
    private adjustTimeEstimateForTrend(
        baseTime: number,
        trend: LearningTrend,
        mentorEval: MentorEvaluation
    ): number {
        // Ajustement basé sur la tendance
        let trendAdjustment = 0;
        if (trend.direction === 'improving') {
            trendAdjustment = -trend.strength * 0.3; // Réduction jusqu'à 30%
        } else if (trend.direction === 'declining') {
            trendAdjustment = trend.strength * 0.5; // Augmentation jusqu'à 50%
        }

        // Ajustement basé sur les compétences du mentor
        const mentorAdjustment = ((mentorEval?.overallScore || 0.5) - 0.5) * 0.4; // -20% à +20%

        const adjustmentFactor = 1 + trendAdjustment - mentorAdjustment;
        return Math.max(3, Math.round(baseTime * adjustmentFactor)); // Minimum 3 jours
    }

    /**
     * Calcule la confiance pour une prédiction de jalon
     * @param sessions Sessions d'enseignement
     * @param mentorEval Évaluation du mentor
     * @param trend Tendance d'apprentissage
     * @returns Confiance (0-1)
     * @private
     */
    private calculateMilestoneConfidence(
        sessions: readonly TeachingSession[],
        mentorEval: MentorEvaluation,
        trend: LearningTrend
    ): number {
        // Confiance de base basée sur le nombre de sessions
        const baseConfidence = Math.min(0.9, sessions.length / 10);

        // Ajustement basé sur la performance du mentor
        const mentorAdjustment = ((mentorEval?.overallScore || 0.5) - 0.5) * 0.3;

        // Ajustement basé sur la fiabilité de la tendance
        const trendAdjustment = trend.reliability * trend.consistency * 0.2;

        return Math.max(0.3, Math.min(0.95, baseConfidence + mentorAdjustment + trendAdjustment));
    }

    /**
     * Identifie les prérequis pour un skill
     * @param skill Skill cible
     * @returns Prérequis identifiés
     * @private
     */
    private identifyPrerequisites(skill: string): readonly string[] {
        // Prérequis par skill
        const prerequisites: Record<string, readonly string[]> = {
            'complex_sentences': ['basic_grammar', 'simple_signs'],
            'storytelling': ['complex_sentences', 'time_expressions'],
            'advanced_grammar': ['storytelling', 'cultural_references'],
            'professional_communication': ['advanced_grammar', 'nuanced_expressions']
        };

        return prerequisites[skill] || [];
    }

    /**
     * Calcule l'ajustement de tendance
     * @param trend Tendance d'apprentissage
     * @returns Ajustement (0-1)
     * @private
     */
    private calculateTrendAdjustment(trend: LearningTrend): number {
        if (trend.direction === 'improving') {
            return trend.strength * trend.reliability * 0.25; // Réduction jusqu'à 25%
        } else if (trend.direction === 'declining') {
            return -trend.strength * trend.reliability * 0.15; // Augmentation jusqu'à 15%
        }
        return 0;
    }

    /**
     * Calcule le taux de progression
     * @param sessions Sessions d'enseignement
     * @param trend Tendance d'apprentissage
     * @returns Taux de progression (0-1)
     * @private
     */
    private calculateProgressionRate(sessions: readonly TeachingSession[], trend: LearningTrend): number {
        if (sessions.length === 0) return 0.5;

        // Calculer le taux de base basé sur les améliorations
        const improvements = sessions.map(s => s.results?.improvement || 0);
        const avgImprovement = improvements.reduce((sum: number, imp: number) => sum + imp, 0) / improvements.length;

        // Ajuster selon la tendance
        const trendBonus = trend.direction === 'improving' ? trend.strength * 0.2 : 0;

        return Math.max(0.1, Math.min(1, avgImprovement + trendBonus));
    }

    /**
     * Calcule la confiance pour la progression de niveau
     * @param sessions Sessions d'enseignement
     * @param mentorEval Évaluation du mentor
     * @param trend Tendance d'apprentissage
     * @returns Confiance (0-1)
     * @private
     */
    private calculateLevelProgressionConfidence(
        sessions: readonly TeachingSession[],
        mentorEval: MentorEvaluation,
        trend: LearningTrend
    ): number {
        // Même logique que pour les jalons mais plus conservative
        const milestoneConfidence = this.calculateMilestoneConfidence(sessions, mentorEval, trend);
        return Math.max(0.2, milestoneConfidence * 0.8); // 20% plus conservative
    }

    /**
     * Calcule l'intervalle moyen entre sessions
     * @param sessions Sessions d'enseignement
     * @returns Intervalle moyen en jours
     * @private
     */
    private calculateAverageSessionInterval(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 2) return 7; // Défaut: 1 semaine

        const sortedSessions = [...sessions].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        let totalInterval = 0;
        for (let i = 1; i < sortedSessions.length; i++) {
            const interval = new Date(sortedSessions[i].timestamp).getTime() -
                new Date(sortedSessions[i - 1].timestamp).getTime();
            totalInterval += interval / (24 * 60 * 60 * 1000); // Convertir en jours
        }

        return totalInterval / (sortedSessions.length - 1);
    }

    /**
     * Calcule l'engagement moyen
     * @param sessions Sessions d'enseignement
     * @returns Engagement moyen (0-1)
     * @private
     */
    private calculateAverageEngagement(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0.5;

        // Utiliser la satisfaction comme proxy pour l'engagement
        const engagementScores = sessions.map(s => s.results?.aiSatisfaction || 0.5);

        return engagementScores.reduce((sum: number, eng: number) => sum + eng, 0) / engagementScores.length;
    }

    /**
     * Calcule la confiance moyenne des prédictions
     * @param predictions Prédictions à analyser
     * @returns Confiance moyenne (0-1)
     * @private
     */
    private calculateAverageConfidence(predictions: ProgressPredictions): number {
        const confidences = [
            predictions.nextMilestone.confidence,
            predictions.levelProgression.confidence
        ];

        return confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length;
    }

    /**
     * Crée des prédictions par défaut
     * @param context Contexte d'évaluation
     * @returns Prédictions par défaut
     * @private
     */
    private createDefaultPredictions(context: EvaluationContext): ProgressPredictions {
        this.logger.debug('📋 Création de prédictions par défaut');

        const currentLevel = context.aiStudentLevel as CECRLLevel;

        return {
            nextMilestone: {
                skill: 'basic_conversation',
                estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                confidence: 0.7
            },
            levelProgression: {
                currentLevel,
                nextLevel: PredictionEngine.CECRL_PROGRESSION[currentLevel],
                estimatedTimeToNext: PredictionEngine.LEVEL_DURATIONS[currentLevel],
                requiredSessions: 15,
                progressionRate: 0.6,
                confidence: 0.6
            },
            riskFactors: [],
            opportunities: []
        };
    }
}