/**
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/CECRLLevelEvaluator.ts
 * @description Évaluateur de niveau CECRL révolutionnaire pour l'apprentissage de la LSF
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎯 Évaluation CECRL intelligente (A1→C2) adaptée à la LSF
 * - 📊 Analyse multi-compétences LSF spécialisées
 * - 🧠 Recommandations personnalisées et prédictives
 * - 📈 Progression adaptative avec seuils dynamiques
 * - 🌟 Intégration complète avec l'écosystème MetaSign
 * 
 * @module CECRLLevelEvaluator
 * @version 2.1.0
 * @since 2025
 * @author MetaSign Team - CECRL Revolutionary Edition
 * @lastModified 2025-07-20
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    LevelEvaluation,
    CECRLLevel
} from '../types/index';

// ===== TYPES SPÉCIALISÉS POUR L'ÉVALUATEUR CECRL =====

/**
 * Prédiction d'apprentissage pour une compétence spécifique
 */
interface LearningPrediction {
    /** Domaine d'apprentissage concerné */
    readonly area: string;
    /** Niveau de difficulté prévu */
    readonly difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    /** Temps estimé en minutes */
    readonly timeEstimate: number;
    /** Niveau de confiance dans la prédiction (0-1) */
    readonly confidence: number;
    /** Recommandations spécifiques */
    readonly recommendations: readonly string[];
    /** Obstacles potentiels identifiés */
    readonly potentialObstacles: readonly string[];
    /** Stratégies d'adaptation suggérées */
    readonly adaptationStrategies: readonly string[];
}

/**
 * Résultat d'exercice avec métadonnées enrichies
 */
interface ExerciseResult {
    /** Score de l'exercice (0-1) */
    readonly score: number;
    /** Type d'exercice réalisé */
    readonly type?: string;
    /** Compétences LSF ciblées */
    readonly targetedSkills?: readonly string[];
    /** Temps passé sur l'exercice (en secondes) */
    readonly timeSpent?: number;
    /** Nombre de tentatives */
    readonly attempts?: number;
    /** Date de réalisation */
    readonly timestamp?: Date;
    /** Erreurs commises pendant l'exercice */
    readonly errors?: readonly string[];
    /** Feedback reçu */
    readonly feedback?: string;
}

/**
 * Domaine de compétence LSF spécialisé
 */
interface LSFCompetencyArea {
    /** Identifiant de la compétence */
    readonly id: string;
    /** Nom de la compétence */
    readonly name: string;
    /** Description */
    readonly description: string;
    /** Poids dans l'évaluation globale */
    readonly weight: number;
    /** Compétences liées */
    readonly relatedSkills: readonly string[];
}

/**
 * Description détaillée d'un niveau CECRL
 */
interface CECRLLevelDescription {
    /** Identifiant du niveau */
    readonly id: CECRLLevel;
    /** Nom complet du niveau */
    readonly name: string;
    /** Description des compétences à ce niveau */
    readonly description: string;
    /** Compétences LSF attendues pour ce niveau */
    readonly expectedSkills: readonly string[];
    /** Score minimum pour valider ce niveau (0-1) */
    readonly minimumScore: number;
    /** Score recommandé pour passer au niveau suivant (0-1) */
    readonly recommendedProgressionScore: number;
    /** Durée recommandée à ce niveau (en heures) */
    readonly recommendedDuration: number;
    /** Indicateurs de maîtrise spécifiques */
    readonly masteryIndicators: readonly string[];
}

/**
 * Analyse détaillée d'une compétence spécifique
 */
interface CompetencyAnalysis {
    /** Score dans cette compétence (0-1) */
    readonly score: number;
    /** Niveau dans cette compétence */
    readonly level: CECRLLevel;
    /** Progression dans cette compétence (0-1) */
    readonly progress: number;
    /** Points forts identifiés */
    readonly strengths: readonly string[];
    /** Points faibles identifiés */
    readonly weaknesses: readonly string[];
    /** Recommandations spécifiques */
    readonly recommendations: readonly string[];
}

/**
 * Résultat d'évaluation détaillé avec analyses approfondies
 */
interface DetailedEvaluationResult extends LevelEvaluation {
    /** Analyse détaillée par compétence LSF */
    readonly competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>;
    /** Prédictions d'apprentissage */
    readonly predictions: readonly LearningPrediction[];
    /** Recommandations spécifiques */
    readonly recommendations: readonly string[];
    /** Temps estimé pour progression */
    readonly estimatedProgressionTime: number;
    /** Confiance dans l'évaluation (0-1) */
    readonly evaluationConfidence: number;
}

/**
 * Évaluateur de niveau CECRL révolutionnaire pour la LSF
 * 
 * @class CECRLLevelEvaluator
 * @description Système d'évaluation intelligent qui adapte l'évaluation CECRL 
 * aux spécificités de la Langue des Signes Française
 * 
 * @example
 * ```typescript
 * const evaluator = new CECRLLevelEvaluator();
 * 
 * const evaluation = await evaluator.evaluateUserLevel('user123', exerciseHistory);
 * const analysis = await evaluator.analyzeCompetencies(exerciseHistory);
 * const predictions = await evaluator.generateProgressionPredictions('user123', 'A2');
 * ```
 */
export class CECRLLevelEvaluator {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('CECRLLevelEvaluator_v2');

    /**
     * Compétences LSF spécialisées
     * @private
     * @readonly
     */
    private readonly lsfCompetencies: readonly LSFCompetencyArea[] = [
        {
            id: 'grammar_lsf',
            name: 'Grammaire LSF',
            description: 'Maîtrise des structures grammaticales spécifiques à la LSF',
            weight: 0.3,
            relatedSkills: ['spatial_grammar', 'classifiers', 'temporal_markers']
        },
        {
            id: 'vocabulary_lsf',
            name: 'Vocabulaire LSF',
            description: 'Étendue et précision du vocabulaire en signes',
            weight: 0.25,
            relatedSkills: ['basic_signs', 'specialized_vocabulary', 'regional_variants']
        },
        {
            id: 'expression_lsf',
            name: 'Expression LSF',
            description: 'Capacité à s\'exprimer clairement et naturellement',
            weight: 0.25,
            relatedSkills: ['fluency', 'narrative_skills', 'emotional_expression']
        },
        {
            id: 'comprehension_lsf',
            name: 'Compréhension LSF',
            description: 'Capacité à comprendre la LSF dans divers contextes',
            weight: 0.2,
            relatedSkills: ['sign_recognition', 'context_understanding', 'rapid_comprehension']
        }
    ] as const;

    /**
     * Description des niveaux CECRL adaptés à la LSF
     * @private
     * @readonly
     */
    private readonly levels: readonly CECRLLevelDescription[] = [
        {
            id: 'A1',
            name: 'Niveau Introductif LSF',
            description: 'Peut comprendre et utiliser des expressions familières et quotidiennes ainsi que des énoncés simples en LSF. Peut se présenter ou présenter quelqu\'un et poser des questions sur des détails personnels.',
            expectedSkills: ['basic_vocabulary', 'simple_greetings', 'basic_questions', 'sign_recognition'],
            minimumScore: 0.3,
            recommendedProgressionScore: 0.7,
            recommendedDuration: 40,
            masteryIndicators: ['Maîtrise des signes de base', 'Communication simple', 'Compréhension des phrases courtes']
        },
        {
            id: 'A2',
            name: 'Niveau Intermédiaire LSF',
            description: 'Peut communiquer lors de tâches simples et habituelles. Peut décrire avec des moyens simples son environnement et évoquer des sujets qui correspondent à des besoins immédiats.',
            expectedSkills: ['extended_vocabulary', 'simple_expressions', 'daily_life_communication', 'short_narrative'],
            minimumScore: 0.4,
            recommendedProgressionScore: 0.75,
            recommendedDuration: 60,
            masteryIndicators: ['Communication quotidienne fluide', 'Descriptions simples', 'Compréhension de conversations courtes']
        },
        {
            id: 'B1',
            name: 'Niveau Seuil LSF',
            description: 'Peut comprendre les points essentiels d\'un discours signé en LSF sur des sujets familiers. Peut raconter un événement, une expérience et exposer brièvement ses raisons ou explications pour un projet ou une idée.',
            expectedSkills: ['complex_vocabulary', 'expression_variety', 'narrative_skills', 'topic_explanation'],
            minimumScore: 0.5,
            recommendedProgressionScore: 0.8,
            recommendedDuration: 80,
            masteryIndicators: ['Narration d\'événements', 'Expression d\'opinions', 'Compréhension de sujets familiers']
        },
        {
            id: 'B2',
            name: 'Niveau Avancé LSF',
            description: 'Peut comprendre le contenu essentiel de discours signés complexes sur des sujets concrets ou abstraits. Peut communiquer avec un degré de spontanéité et d\'aisance tel qu\'une conversation avec un locuteur natif soit possible sans tension.',
            expectedSkills: ['advanced_vocabulary', 'subtleties', 'fluent_conversation', 'abstract_topics'],
            minimumScore: 0.6,
            recommendedProgressionScore: 0.85,
            recommendedDuration: 100,
            masteryIndicators: ['Conversations spontanées', 'Sujets abstraits', 'Nuances culturelles']
        },
        {
            id: 'C1',
            name: 'Niveau Autonome LSF',
            description: 'Peut comprendre des discours signés longs et exigeants en LSF. Peut s\'exprimer spontanément et couramment sans rechercher ses signes de façon apparente. Peut utiliser la langue de façon efficace pour des relations sociales ou académiques/professionnelles.',
            expectedSkills: ['complex_expressions', 'cultural_subtleties', 'idiomatic_usage', 'social_pragmatics'],
            minimumScore: 0.7,
            recommendedProgressionScore: 0.9,
            recommendedDuration: 120,
            masteryIndicators: ['Expression spontanée', 'Subtilités culturelles', 'Usage académique/professionnel']
        },
        {
            id: 'C2',
            name: 'Niveau Maîtrise LSF',
            description: 'Peut comprendre sans effort pratiquement tout ce qui est signé. Peut reconstituer faits et arguments de diverses sources et en présenter une synthèse cohérente en LSF. Peut s\'exprimer spontanément, très couramment et de façon précise.',
            expectedSkills: ['native_like_fluency', 'cultural_mastery', 'subtle_expressions', 'meta_linguistic_awareness'],
            minimumScore: 0.8,
            recommendedProgressionScore: 1.0,
            recommendedDuration: 150,
            masteryIndicators: ['Maîtrise quasi-native', 'Synthèse complexe', 'Créativité linguistique']
        }
    ] as const;

    /**
     * Constructeur de l'évaluateur CECRL
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🎯 CECRLLevelEvaluator 2.1 initialisé', {
            levelsCount: this.levels.length,
            competenciesCount: this.lsfCompetencies.length
        });
    }

    // ==================== MÉTHODES PUBLIQUES PRINCIPALES ====================

    /**
     * Évalue le niveau CECRL d'un utilisateur avec analyse détaillée
     * 
     * @method evaluateUserLevel
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {readonly ExerciseResult[]} exerciseHistory - Historique des exercices
     * @returns {Promise<DetailedEvaluationResult>} Évaluation détaillée
     * @public
     */
    public async evaluateUserLevel(
        userId: string,
        exerciseHistory: readonly ExerciseResult[]
    ): Promise<DetailedEvaluationResult> {
        try {
            this.logger.info('🔍 Début évaluation CECRL utilisateur', {
                userId,
                exercisesCount: exerciseHistory.length
            });

            // Vérification des données d'entrée
            if (exerciseHistory.length === 0) {
                return this.createEmptyDetailedEvaluation(userId, 'A1');
            }

            // Analyse par compétence LSF
            const competencyAnalysis = await this.analyzeCompetencies(exerciseHistory);

            // Détermination du niveau global
            const overallLevel = this.determineOverallLevel(competencyAnalysis);

            // Calcul de la progression dans le niveau actuel
            const progressInCurrentLevel = this.calculateProgressInLevel(overallLevel, competencyAnalysis);

            // Génération des prédictions d'apprentissage
            const predictions = await this.generateProgressionPredictions(
                userId,
                overallLevel,
                competencyAnalysis
            );

            // Génération des recommandations
            const recommendations = this.generateRecommendations(competencyAnalysis, overallLevel);

            // Estimation du temps de progression
            const estimatedProgressionTime = this.estimateProgressionTime(
                overallLevel,
                competencyAnalysis
            );

            // Calcul de la confiance dans l'évaluation
            const evaluationConfidence = this.calculateEvaluationConfidence(exerciseHistory);

            // Détermination du niveau recommandé
            const recommendedLevel = this.determineRecommendedLevel(
                overallLevel,
                competencyAnalysis,
                progressInCurrentLevel
            );

            const result: DetailedEvaluationResult = {
                currentLevel: overallLevel,
                recommendedLevel,
                levelChangeRecommended: overallLevel !== recommendedLevel,
                progressInCurrentLevel,
                scores: this.extractScoresFromAnalysis(competencyAnalysis),
                explanation: this.generateExplanation(overallLevel, recommendedLevel, competencyAnalysis),
                strengthAreas: this.identifyStrengthAreas(competencyAnalysis),
                weaknessAreas: this.identifyWeaknessAreas(competencyAnalysis),
                competencyAnalysis,
                predictions,
                recommendations,
                estimatedProgressionTime,
                evaluationConfidence
            };

            this.logger.info('✅ Évaluation CECRL terminée', {
                userId,
                currentLevel: overallLevel,
                recommendedLevel,
                confidence: evaluationConfidence
            });

            return result;
        } catch (error) {
            this.logger.error('❌ Erreur lors de l\'évaluation CECRL', { userId, error });
            throw new Error(`Impossible d'évaluer le niveau CECRL pour l'utilisateur ${userId}`);
        }
    }

    /**
     * Analyse les compétences LSF spécifiques
     * 
     * @method analyzeCompetencies
     * @async
     * @param {readonly ExerciseResult[]} exerciseHistory - Historique des exercices
     * @returns {Promise<Readonly<Record<string, CompetencyAnalysis>>>} Analyse par compétence
     * @public
     */
    public async analyzeCompetencies(
        exerciseHistory: readonly ExerciseResult[]
    ): Promise<Readonly<Record<string, CompetencyAnalysis>>> {
        const analysis: Record<string, CompetencyAnalysis> = {};

        for (const competency of this.lsfCompetencies) {
            // Filtrer les exercices relatifs à cette compétence
            const relevantExercises = this.filterExercisesByCompetency(
                exerciseHistory,
                competency
            );

            // Analyser cette compétence spécifique
            analysis[competency.id] = await this.analyzeSpecificCompetency(
                competency,
                relevantExercises
            );
        }

        return analysis as Readonly<Record<string, CompetencyAnalysis>>;
    }

    /**
     * Génère des prédictions de progression personnalisées
     * 
     * @method generateProgressionPredictions
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {CECRLLevel} currentLevel - Niveau actuel
     * @param {Readonly<Record<string, CompetencyAnalysis>>} competencyAnalysis - Analyse des compétences
     * @returns {Promise<readonly LearningPrediction[]>} Prédictions d'apprentissage
     * @public
     */
    public async generateProgressionPredictions(
        userId: string,
        currentLevel: CECRLLevel,
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): Promise<readonly LearningPrediction[]> {
        const predictions: LearningPrediction[] = [];

        // Prédiction pour chaque compétence faible
        for (const [competencyId, analysis] of Object.entries(competencyAnalysis)) {
            if (analysis.score < 0.6) { // Compétence à améliorer
                const competency = this.lsfCompetencies.find(c => c.id === competencyId);
                if (competency) {
                    predictions.push({
                        area: competency.name,
                        difficulty: this.determineDifficultyForCompetency(analysis.score),
                        timeEstimate: this.estimateTimeForCompetency(competency, analysis),
                        confidence: this.calculatePredictionConfidence(analysis),
                        recommendations: analysis.recommendations,
                        potentialObstacles: this.identifyPotentialObstacles(competency, analysis),
                        adaptationStrategies: this.suggestAdaptationStrategies(competency, analysis)
                    });
                }
            }
        }

        // Prédiction de progression générale
        const overallProgress = this.calculateOverallProgress(competencyAnalysis);
        if (overallProgress < 0.8) {
            predictions.push({
                area: 'Progression générale CECRL',
                difficulty: currentLevel === 'A1' ? 'medium' : 'hard',
                timeEstimate: this.estimateOverallProgressionTime(currentLevel, overallProgress),
                confidence: 0.8,
                recommendations: [
                    'Pratique régulière dans les domaines faibles',
                    'Immersion culturelle LSF',
                    'Interaction avec la communauté sourde'
                ],
                potentialObstacles: ['Plateau d\'apprentissage', 'Motivation fluctuante'],
                adaptationStrategies: ['Diversification des exercices', 'Gamification', 'Apprentissage social']
            });
        }

        return predictions;
    }

    // ==================== MÉTHODES COMPATIBILITÉ LEGACY ====================

    /**
     * Évalue le niveau linguistique (méthode de compatibilité)
     * 
     * @method evaluateLevel
     * @param {CECRLLevel} currentLevel - Niveau actuel
     * @param {readonly ExerciseResult[]} exerciseHistory - Historique des exercices
     * @returns {LevelEvaluation} Résultat de l'évaluation
     * @public
     */
    public evaluateLevel(
        currentLevel: CECRLLevel,
        exerciseHistory: readonly ExerciseResult[]
    ): LevelEvaluation {
        if (exerciseHistory.length === 0) {
            return this.createEmptyEvaluation(currentLevel);
        }

        // Calcul simplifié pour compatibilité
        const skillScores = this.calculateBasicSkillScores(exerciseHistory);
        const progress = this.estimateProgressInLevel(currentLevel, exerciseHistory);

        let recommendedLevel = currentLevel;
        let explanation = '';

        if (this.shouldProgressToNextLevel(currentLevel, exerciseHistory)) {
            recommendedLevel = this.getNextLevel(currentLevel);
            explanation = `Excellent progrès au niveau ${currentLevel}. Progression vers ${recommendedLevel} recommandée.`;
        } else if (this.shouldRegressToPreviousLevel(currentLevel, exerciseHistory)) {
            recommendedLevel = this.getPreviousLevel(currentLevel);
            explanation = `Difficultés au niveau ${currentLevel}. Retour au niveau ${recommendedLevel} recommandé.`;
        } else {
            explanation = `Niveau ${currentLevel} approprié. Continuer le travail sur les points faibles.`;
        }

        return {
            currentLevel,
            recommendedLevel,
            levelChangeRecommended: currentLevel !== recommendedLevel,
            progressInCurrentLevel: progress,
            scores: skillScores,
            explanation,
            strengthAreas: this.identifyBasicStrengths(skillScores),
            weaknessAreas: this.identifyBasicWeaknesses(skillScores)
        };
    }

    /**
     * Estime la progression dans le niveau actuel
     * 
     * @method estimateProgressInLevel
     * @param {CECRLLevel} currentLevel - Niveau actuel
     * @param {readonly ExerciseResult[]} exerciseHistory - Historique des exercices
     * @returns {number} Progression estimée (0-1)
     * @public
     */
    public estimateProgressInLevel(
        currentLevel: CECRLLevel,
        exerciseHistory: readonly ExerciseResult[]
    ): number {
        const levelInfo = this.getLevelDescription(currentLevel);
        if (!levelInfo || exerciseHistory.length === 0) {
            return 0;
        }

        const recentHistory = this.getRecentHistory(exerciseHistory, 25);
        const averageScore = this.calculateAverageScore(recentHistory);

        const relativeProgress = (averageScore - levelInfo.minimumScore) /
            (levelInfo.recommendedProgressionScore - levelInfo.minimumScore);

        return Math.max(0, Math.min(1, relativeProgress));
    }

    /**
     * Détermine si une progression vers le niveau supérieur est recommandée
     * 
     * @method shouldProgressToNextLevel
     * @param {CECRLLevel} currentLevel - Niveau actuel
     * @param {readonly ExerciseResult[]} exerciseHistory - Historique des exercices
     * @returns {boolean} True si progression recommandée
     * @public
     */
    public shouldProgressToNextLevel(
        currentLevel: CECRLLevel,
        exerciseHistory: readonly ExerciseResult[]
    ): boolean {
        if (currentLevel === 'C2' || exerciseHistory.length < 10) {
            return false;
        }

        const levelInfo = this.getLevelDescription(currentLevel);
        if (!levelInfo) return false;

        const recentHistory = this.getRecentHistory(exerciseHistory, 50);
        const averageScore = this.calculateAverageScore(recentHistory);

        return averageScore >= levelInfo.recommendedProgressionScore;
    }

    /**
     * Détermine si une régression vers le niveau inférieur est recommandée
     * 
     * @method shouldRegressToPreviousLevel
     * @param {CECRLLevel} currentLevel - Niveau actuel
     * @param {readonly ExerciseResult[]} exerciseHistory - Historique des exercices
     * @returns {boolean} True si régression recommandée
     * @public
     */
    public shouldRegressToPreviousLevel(
        currentLevel: CECRLLevel,
        exerciseHistory: readonly ExerciseResult[]
    ): boolean {
        if (currentLevel === 'A1' || exerciseHistory.length < 15) {
            return false;
        }

        const levelInfo = this.getLevelDescription(currentLevel);
        if (!levelInfo) return false;

        const recentHistory = this.getRecentHistory(exerciseHistory, 50);
        const averageScore = this.calculateAverageScore(recentHistory);

        return averageScore < levelInfo.minimumScore;
    }

    // ==================== MÉTHODES PRIVÉES AVANCÉES ====================

    /**
     * Détermine le niveau global basé sur l'analyse des compétences
     */
    private determineOverallLevel(
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): CECRLLevel {
        const weightedScores: Record<string, number> = {};

        for (const [competencyId, analysis] of Object.entries(competencyAnalysis)) {
            const competency = this.lsfCompetencies.find(c => c.id === competencyId);
            if (competency) {
                weightedScores[analysis.level] = (weightedScores[analysis.level] || 0) +
                    (analysis.score * competency.weight);
            }
        }

        // Retourner le niveau avec le score pondéré le plus élevé
        const bestLevel = Object.entries(weightedScores).reduce((a, b) =>
            weightedScores[a[0]] > weightedScores[b[0]] ? a : b
        )[0];

        return (bestLevel as CECRLLevel) || 'A1';
    }

    /**
     * Calcule la progression dans le niveau actuel
     */
    private calculateProgressInLevel(
        level: CECRLLevel,
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): number {
        const analyses = Object.values(competencyAnalysis);
        if (analyses.length === 0) return 0;

        const averageProgress = analyses.reduce((sum, analysis) =>
            sum + analysis.progress, 0) / analyses.length;

        return Math.max(0, Math.min(1, averageProgress));
    }

    /**
     * Filtre les exercices par compétence
     */
    private filterExercisesByCompetency(
        exerciseHistory: readonly ExerciseResult[],
        competency: LSFCompetencyArea
    ): readonly ExerciseResult[] {
        return exerciseHistory.filter(exercise => {
            if (!exercise.targetedSkills) return true; // Inclure tous si pas de ciblage spécifique

            return exercise.targetedSkills.some(skill =>
                competency.relatedSkills.includes(skill)
            );
        });
    }

    /**
     * Analyse une compétence spécifique
     */
    private async analyzeSpecificCompetency(
        competency: LSFCompetencyArea,
        exercises: readonly ExerciseResult[]
    ): Promise<CompetencyAnalysis> {
        if (exercises.length === 0) {
            return {
                score: 0,
                level: 'A1',
                progress: 0,
                strengths: [],
                weaknesses: [competency.name],
                recommendations: [`Commencer la pratique en ${competency.name}`]
            };
        }

        const score = this.calculateAverageScore(exercises);
        const level = this.determineLevelFromScore(score);
        const progress = this.calculateProgressFromScore(score, level);

        return {
            score,
            level,
            progress,
            strengths: score > 0.7 ? [competency.name] : [],
            weaknesses: score < 0.5 ? [competency.name] : [],
            recommendations: this.generateCompetencyRecommendations(competency, score)
        };
    }

    /**
     * Détermine le niveau à partir d'un score
     */
    private determineLevelFromScore(score: number): CECRLLevel {
        // Parcourir les niveaux du plus élevé au plus bas
        const reversedLevels = [...this.levels].reverse();
        for (const level of reversedLevels) {
            if (score >= level.minimumScore) {
                return level.id;
            }
        }
        return 'A1';
    }

    /**
     * Calcule la progression à partir d'un score et niveau
     */
    private calculateProgressFromScore(score: number, level: CECRLLevel): number {
        const levelInfo = this.getLevelDescription(level);
        if (!levelInfo) return 0;

        const relativeProgress = (score - levelInfo.minimumScore) /
            (levelInfo.recommendedProgressionScore - levelInfo.minimumScore);

        return Math.max(0, Math.min(1, relativeProgress));
    }

    // ==================== MÉTHODES UTILITAIRES PRIVÉES ====================

    /**
     * Récupère la description d'un niveau CECRL
     */
    private getLevelDescription(levelId: CECRLLevel): CECRLLevelDescription | undefined {
        return this.levels.find(level => level.id === levelId);
    }

    /**
     * Obtient le niveau suivant
     */
    private getNextLevel(currentLevel: CECRLLevel): CECRLLevel {
        const levelOrder: readonly CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levelOrder.indexOf(currentLevel);

        if (currentIndex < 0 || currentIndex >= levelOrder.length - 1) {
            return currentLevel;
        }

        return levelOrder[currentIndex + 1];
    }

    /**
     * Obtient le niveau précédent
     */
    private getPreviousLevel(currentLevel: CECRLLevel): CECRLLevel {
        const levelOrder: readonly CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levelOrder.indexOf(currentLevel);

        if (currentIndex <= 0) {
            return currentLevel;
        }

        return levelOrder[currentIndex - 1];
    }

    /**
     * Calcule le score moyen des exercices
     */
    private calculateAverageScore(exerciseHistory: readonly ExerciseResult[]): number {
        if (exerciseHistory.length === 0) return 0;

        const totalScore = exerciseHistory.reduce((sum, result) => sum + result.score, 0);
        return totalScore / exerciseHistory.length;
    }

    /**
     * Récupère l'historique récent
     */
    private getRecentHistory(
        exerciseHistory: readonly ExerciseResult[],
        maxCount: number
    ): readonly ExerciseResult[] {
        if (!exerciseHistory || exerciseHistory.length === 0) return [];
        return exerciseHistory.slice(-maxCount);
    }

    /**
     * Crée une évaluation vide
     */
    private createEmptyEvaluation(level: CECRLLevel): LevelEvaluation {
        return {
            currentLevel: level,
            recommendedLevel: level,
            levelChangeRecommended: false,
            progressInCurrentLevel: 0,
            scores: {},
            explanation: "Données insuffisantes pour une évaluation complète.",
            strengthAreas: [],
            weaknessAreas: []
        };
    }

    /**
     * Crée une évaluation détaillée vide
     */
    private createEmptyDetailedEvaluation(userId: string, level: CECRLLevel): DetailedEvaluationResult {
        return {
            currentLevel: level,
            recommendedLevel: level,
            levelChangeRecommended: false,
            progressInCurrentLevel: 0,
            scores: {},
            explanation: "Données insuffisantes pour une évaluation complète. Commencez par quelques exercices pour obtenir une évaluation personnalisée.",
            strengthAreas: [],
            weaknessAreas: [],
            competencyAnalysis: {},
            predictions: [],
            recommendations: [
                'Commencer par des exercices de niveau A1',
                'Pratiquer régulièrement pour obtenir une évaluation précise',
                'Explorer différents types d\'exercices LSF'
            ],
            estimatedProgressionTime: 0,
            evaluationConfidence: 0
        };
    }

    /**
     * Calcule les scores de base par compétence
     */
    private calculateBasicSkillScores(
        exerciseHistory: readonly ExerciseResult[]
    ): Readonly<Record<string, number>> {
        const skillScores: Record<string, number> = {};
        const skillCounts: Record<string, number> = {};

        // Grouper par type d'exercice ou utiliser 'general' par défaut
        exerciseHistory.forEach(result => {
            const skillKey = result.type || 'general';

            if (!skillScores[skillKey]) {
                skillScores[skillKey] = 0;
                skillCounts[skillKey] = 0;
            }

            skillScores[skillKey] += result.score;
            skillCounts[skillKey] += 1;
        });

        // Calculer les moyennes
        Object.keys(skillScores).forEach(skill => {
            if (skillCounts[skill] > 0) {
                skillScores[skill] /= skillCounts[skill];
            }
        });

        return skillScores;
    }

    /**
     * Identifie les forces de base
     */
    private identifyBasicStrengths(skillScores: Readonly<Record<string, number>>): readonly string[] {
        return Object.entries(skillScores)
            .filter(([, score]) => score >= 0.75)
            .map(([skill]) => skill);
    }

    /**
     * Identifie les faiblesses de base
     */
    private identifyBasicWeaknesses(skillScores: Readonly<Record<string, number>>): readonly string[] {
        return Object.entries(skillScores)
            .filter(([, score]) => score < 0.5)
            .map(([skill]) => skill);
    }

    /**
     * Génère des recommandations pour une compétence
     */
    private generateCompetencyRecommendations(
        competency: LSFCompetencyArea,
        score: number
    ): readonly string[] {
        const recommendations: string[] = [];

        if (score < 0.3) {
            recommendations.push(`Commencer par les bases en ${competency.name}`);
            recommendations.push('Pratiquer quotidiennement avec des exercices simples');
        } else if (score < 0.6) {
            recommendations.push(`Renforcer les acquis en ${competency.name}`);
            recommendations.push('Diversifier les types d\'exercices');
        } else if (score < 0.8) {
            recommendations.push(`Perfectionnement en ${competency.name}`);
            recommendations.push('Exercices de niveau avancé');
        } else {
            recommendations.push(`Maintenir l'excellence en ${competency.name}`);
            recommendations.push('Servir de modèle pour d\'autres apprenants');
        }

        return recommendations;
    }

    /**
     * Détermine la difficulté pour une compétence
     */
    private determineDifficultyForCompetency(score: number): LearningPrediction['difficulty'] {
        if (score < 0.3) return 'easy';
        if (score < 0.6) return 'medium';
        if (score < 0.8) return 'hard';
        return 'expert';
    }

    /**
     * Estime le temps nécessaire pour une compétence
     */
    private estimateTimeForCompetency(
        competency: LSFCompetencyArea,
        analysis: CompetencyAnalysis
    ): number {
        const baseTime = 30; // minutes de base
        const difficultyMultiplier = (1 - analysis.score) * 2; // Plus le score est bas, plus c'est long
        const competencyMultiplier = competency.weight; // Compétences importantes prennent plus de temps

        return Math.round(baseTime * difficultyMultiplier * competencyMultiplier);
    }

    /**
     * Calcule la confiance dans une prédiction
     */
    private calculatePredictionConfidence(analysis: CompetencyAnalysis): number {
        // Plus le score est proche des extrêmes, plus la confiance est élevée
        const scoreConfidence = analysis.score < 0.2 || analysis.score > 0.8 ? 0.9 : 0.7;
        return Math.min(1, scoreConfidence + analysis.progress * 0.1);
    }

    /**
     * Identifie les obstacles potentiels
     */
    private identifyPotentialObstacles(
        competency: LSFCompetencyArea,
        analysis: CompetencyAnalysis
    ): readonly string[] {
        const obstacles: string[] = [];

        if (analysis.score < 0.3) {
            obstacles.push('Bases insuffisantes');
            obstacles.push('Besoin de motivation supplémentaire');
        }

        if (competency.id === 'grammar_lsf') {
            obstacles.push('Complexité des structures spatiales');
            obstacles.push('Différences avec la grammaire française');
        }

        if (competency.id === 'expression_lsf') {
            obstacles.push('Manque de confiance en soi');
            obstacles.push('Peur du jugement');
        }

        return obstacles;
    }

    /**
     * Suggère des stratégies d'adaptation
     */
    private suggestAdaptationStrategies(
        competency: LSFCompetencyArea,
        analysis: CompetencyAnalysis
    ): readonly string[] {
        const strategies: string[] = [];

        if (analysis.score < 0.5) {
            strategies.push('Apprentissage progressif par étapes');
            strategies.push('Répétition espacée');
            strategies.push('Feedback positif régulier');
        }

        if (competency.id === 'grammar_lsf') {
            strategies.push('Visualisation 3D des structures');
            strategies.push('Exercices pratiques spatiaux');
        }

        if (competency.id === 'vocabulary_lsf') {
            strategies.push('Associations visuelles');
            strategies.push('Cartes mentales LSF');
        }

        return strategies;
    }

    /**
     * Calcule la progression globale
     */
    private calculateOverallProgress(
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): number {
        const analyses = Object.values(competencyAnalysis);
        if (analyses.length === 0) return 0;

        return analyses.reduce((sum, analysis) => sum + analysis.progress, 0) / analyses.length;
    }

    /**
     * Estime le temps de progression global
     */
    private estimateOverallProgressionTime(currentLevel: CECRLLevel, overallProgress: number): number {
        const levelInfo = this.getLevelDescription(currentLevel);
        if (!levelInfo) return 60;

        const remainingProgress = 1 - overallProgress;
        const estimatedHours = levelInfo.recommendedDuration * remainingProgress;

        return Math.round(estimatedHours * 60); // Convertir en minutes
    }

    /**
     * Génère des recommandations générales
     */
    private generateRecommendations(
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>,
        currentLevel: CECRLLevel
    ): readonly string[] {
        const recommendations: string[] = [];
        const weakCompetencies = Object.entries(competencyAnalysis)
            .filter(([, analysis]) => analysis.score < 0.6)
            .map(([id]) => this.lsfCompetencies.find(c => c.id === id)?.name)
            .filter(Boolean) as string[];

        if (weakCompetencies.length > 0) {
            recommendations.push(`Concentrer les efforts sur : ${weakCompetencies.join(', ')}`);
        }

        recommendations.push('Pratiquer régulièrement avec des exercices variés');
        recommendations.push('Interagir avec la communauté sourde pour l\'immersion culturelle');

        if (currentLevel === 'A1' || currentLevel === 'A2') {
            recommendations.push('Construire un vocabulaire de base solide');
        } else {
            recommendations.push('Développer la fluidité et les nuances expressives');
        }

        return recommendations;
    }

    /**
     * Estime le temps de progression
     */
    private estimateProgressionTime(
        currentLevel: CECRLLevel,
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): number {
        const levelInfo = this.getLevelDescription(currentLevel);
        if (!levelInfo) return 60;

        const overallProgress = this.calculateOverallProgress(competencyAnalysis);
        const remainingTime = levelInfo.recommendedDuration * (1 - overallProgress);

        return Math.round(remainingTime * 60); // Convertir en minutes
    }

    /**
     * Calcule la confiance dans l'évaluation
     */
    private calculateEvaluationConfidence(exerciseHistory: readonly ExerciseResult[]): number {
        if (exerciseHistory.length === 0) return 0;
        if (exerciseHistory.length < 5) return 0.3;
        if (exerciseHistory.length < 10) return 0.6;
        if (exerciseHistory.length < 20) return 0.8;
        return 0.95;
    }

    /**
     * Détermine le niveau recommandé
     */
    private determineRecommendedLevel(
        currentLevel: CECRLLevel,
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>,
        progressInCurrentLevel: number
    ): CECRLLevel {
        const overallScore = this.calculateOverallProgress(competencyAnalysis);

        // Progression recommandée si score élevé dans toutes les compétences
        if (overallScore > 0.8 && progressInCurrentLevel > 0.8) {
            return this.getNextLevel(currentLevel);
        }

        // Régression recommandée si score très faible
        if (overallScore < 0.3) {
            return this.getPreviousLevel(currentLevel);
        }

        return currentLevel;
    }

    /**
     * Extrait les scores de l'analyse
     */
    private extractScoresFromAnalysis(
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): Readonly<Record<string, number>> {
        const scores: Record<string, number> = {};

        for (const [competencyId, analysis] of Object.entries(competencyAnalysis)) {
            const competency = this.lsfCompetencies.find(c => c.id === competencyId);
            if (competency) {
                scores[competency.name] = analysis.score;
            }
        }

        return scores;
    }

    /**
     * Génère une explication détaillée
     */
    private generateExplanation(
        currentLevel: CECRLLevel,
        recommendedLevel: CECRLLevel,
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): string {
        const overallScore = this.calculateOverallProgress(competencyAnalysis);

        let explanation = `Évaluation CECRL LSF - Niveau actuel : ${currentLevel}. `;

        if (currentLevel !== recommendedLevel) {
            explanation += `Niveau recommandé : ${recommendedLevel}. `;
        }

        explanation += `Score global : ${Math.round(overallScore * 100)}%. `;

        const weakAreas = this.identifyWeaknessAreas(competencyAnalysis);
        if (weakAreas.length > 0) {
            explanation += `Domaines à améliorer : ${weakAreas.join(', ')}. `;
        }

        const strongAreas = this.identifyStrengthAreas(competencyAnalysis);
        if (strongAreas.length > 0) {
            explanation += `Points forts : ${strongAreas.join(', ')}.`;
        }

        return explanation;
    }

    /**
     * Identifie les domaines de force
     */
    private identifyStrengthAreas(
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): readonly string[] {
        return Object.entries(competencyAnalysis)
            .filter(([, analysis]) => analysis.score >= 0.75)
            .map(([id]) => this.lsfCompetencies.find(c => c.id === id)?.name)
            .filter(Boolean) as string[];
    }

    /**
     * Identifie les domaines de faiblesse
     */
    private identifyWeaknessAreas(
        competencyAnalysis: Readonly<Record<string, CompetencyAnalysis>>
    ): readonly string[] {
        return Object.entries(competencyAnalysis)
            .filter(([, analysis]) => analysis.score < 0.5)
            .map(([id]) => this.lsfCompetencies.find(c => c.id === id)?.name)
            .filter(Boolean) as string[];
    }
}