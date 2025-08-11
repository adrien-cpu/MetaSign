/**
 * @file src/ai/services/learning/human/evaluation/analytics/PerformanceAnalyzer.ts
 * @description Analyseur avancé de performances d'apprentissage avec analytics prédictives
 * Fournit une analyse complète des performances utilisateur avec détection de patterns
 * @author MetaSign
 * @version 2.0.0
 * @since 2025-05-29
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { UserPerformanceRepository } from '../repositories/UserPerformanceRepository';
import { DifficultyPredictor } from '../prediction/DifficultyPredictor';
import { EvaluationUtilities } from '../evaluation-utilities';
import {
    Exercise,
    Submission,
    SessionContext,
    SubmissionEvaluationResult,
    AnswerEvaluation,
    LearningGap,
    AnswerValue
} from '../types';

/**
 * Configuration pour l'analyse de performance
 */
interface PerformanceAnalysisConfig {
    /** Seuil pour considérer une réponse comme correcte (0-1) */
    correctnessThreshold: number;
    /** Seuil pour les forces (0-100) */
    strengthThreshold: number;
    /** Seuil pour les faiblesses (0-100) */
    weaknessThreshold: number;
    /** Poids pour les réponses partielles (0-1) */
    partialWeight: number;
    /** Activer l'analyse prédictive */
    enablePredictiveAnalysis: boolean;
}

/**
 * Métriques avancées de performance
 */
interface AdvancedPerformanceMetrics {
    /** Temps moyen par question en secondes */
    averageTimePerQuestion: number;
    /** Taux de confiance moyen (0-1) */
    averageConfidence: number;
    /** Pattern de progression (amélioration/dégradation) */
    progressionPattern: 'improving' | 'stable' | 'declining';
    /** Score de cohérence des réponses (0-1) */
    consistencyScore: number;
    /** Complexité cognitive estimée */
    cognitiveLoad: number;
}

/**
 * Analyse de patterns d'apprentissage
 */
interface LearningPatternAnalysis {
    /** Type de pattern détecté */
    patternType: 'visual' | 'kinesthetic' | 'analytical' | 'mixed';
    /** Force du pattern (0-1) */
    patternStrength: number;
    /** Recommandations d'adaptation */
    adaptationRecommendations: string[];
    /** Zones d'amélioration prioritaires */
    priorityAreas: string[];
}

/**
 * Résultat d'analyse enrichi
 */
interface EnrichedSubmissionResult extends SubmissionEvaluationResult {
    /** Métriques avancées */
    advancedMetrics: AdvancedPerformanceMetrics;
    /** Analyse des patterns d'apprentissage */
    learningPatterns: LearningPatternAnalysis;
    /** Prédictions pour les prochains exercices */
    predictions: {
        successProbability: number;
        recommendedStudyTime: number;
        suggestedTopics: string[];
    };
}

/**
 * @class PerformanceAnalyzer
 * @description Analyseur avancé des performances avec intelligence prédictive et détection de patterns
 */
export class PerformanceAnalyzer {
    private readonly logger = LoggerFactory.getLogger('PerformanceAnalyzer');
    private readonly userPerformanceRepository: UserPerformanceRepository;
    private readonly difficultyPredictor: DifficultyPredictor;
    private readonly analysisConfig: PerformanceAnalysisConfig;

    /**
     * @constructor
     * @param config Configuration personnalisée pour l'analyse
     */
    constructor(config?: Partial<PerformanceAnalysisConfig>) {
        this.userPerformanceRepository = new UserPerformanceRepository();
        this.difficultyPredictor = new DifficultyPredictor(0.7);

        this.analysisConfig = {
            correctnessThreshold: 0.7,
            strengthThreshold: 85,
            weaknessThreshold: 60,
            partialWeight: 0.5,
            enablePredictiveAnalysis: true,
            ...config
        };

        this.logger.info('PerformanceAnalyzer initialized with advanced analytics');
    }

    /**
     * @method processSubmission
     * @async
     * @param {Exercise} exercise - Exercice soumis
     * @param {Submission} submission - Soumission de l'utilisateur
     * @param {SessionContext} sessionContext - Contexte de la session
     * @returns {Promise<EnrichedSubmissionResult>} - Résultat enrichi de l'évaluation
     * @description Traite une soumission avec analyse avancée et prédictions
     */
    public async processSubmission(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): Promise<EnrichedSubmissionResult> {
        this.logger.debug(`Processing submission for exercise ${exercise.id} with advanced analytics`);

        const startTime = Date.now();

        // Analyse de base
        const baseResult = await this.performBaseAnalysis(exercise, submission, sessionContext);

        // Analyses avancées
        const advancedMetrics = await this.calculateAdvancedMetrics(
            exercise,
            submission,
            sessionContext
        );

        const learningPatterns = await this.analyzeLearningPatterns(baseResult);

        // Prédictions si activées
        let predictions = {
            successProbability: 0.5,
            recommendedStudyTime: 30,
            suggestedTopics: [] as string[]
        };

        if (this.analysisConfig.enablePredictiveAnalysis) {
            predictions = await this.generatePredictions(baseResult);
        }

        const processingTime = Date.now() - startTime;
        this.logger.debug(`Advanced analysis completed in ${processingTime}ms`);

        return {
            ...baseResult,
            advancedMetrics,
            learningPatterns,
            predictions
        };
    }

    /**
     * Effectue l'analyse de base de la soumission
     * @param exercise Exercice soumis
     * @param submission Soumission utilisateur
     * @param sessionContext Contexte de session
     * @returns Résultat de l'évaluation de base
     * @private
     */
    private async performBaseAnalysis(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): Promise<SubmissionEvaluationResult> {
        const conceptIds = exercise.concepts ?? [];
        const correctAnswers = exercise.expectedAnswers ?? [];
        const userAnswers = submission.answers ?? [];

        const answerEvaluations: AnswerEvaluation[] = [];
        let totalScore = 0;
        let possiblePoints = 0;

        // Évaluation de chaque réponse
        for (let i = 0; i < correctAnswers.length; i++) {
            const expected = correctAnswers[i];
            const userAnswer = userAnswers[i] ?? { value: null };
            const questionPoints = expected.points ?? 1;

            possiblePoints += questionPoints;

            const evaluation = this.evaluateAnswer(
                expected.id,
                userAnswer.value as AnswerValue,
                expected.answer as AnswerValue,
                expected.answerType,
                questionPoints,
                expected.conceptId
            );

            totalScore += evaluation.score;
            answerEvaluations.push(evaluation);
        }

        const normalizedScore = possiblePoints > 0 ? (totalScore / possiblePoints) * 100 : 0;
        const conceptMastery = this.calculateConceptMastery(conceptIds, answerEvaluations);

        // Sauvegarde des performances
        await this.userPerformanceRepository.recordExercisePerformance(
            sessionContext.userId,
            exercise.id,
            normalizedScore,
            conceptMastery,
            new Date()
        );

        const recommendedDifficulty = await this.difficultyPredictor.predictNextDifficulty(
            sessionContext.userId,
            conceptIds,
            normalizedScore
        );

        const potentialGaps = await this.identifyLearningGaps(conceptMastery);

        return {
            exerciseId: exercise.id,
            userId: sessionContext.userId,
            score: normalizedScore,
            isCorrect: normalizedScore >= (this.analysisConfig.correctnessThreshold * 100),
            answerEvaluations,
            conceptMastery,
            potentialGaps,
            strengths: this.identifyStrengths(conceptMastery),
            weaknesses: this.identifyWeaknesses(conceptMastery),
            recommendedDifficulty,
            submittedAt: new Date()
        };
    }

    /**
     * Évalue une réponse individuelle
     * @param questionId ID de la question
     * @param userAnswer Réponse de l'utilisateur
     * @param expectedAnswer Réponse attendue
     * @param answerType Type de réponse
     * @param maxScore Score maximum
     * @param conceptId ID du concept (optionnel)
     * @returns Évaluation de la réponse
     * @private
     */
    private evaluateAnswer(
        questionId: string,
        userAnswer: AnswerValue,
        expectedAnswer: AnswerValue,
        answerType: string,
        maxScore: number,
        conceptId?: string
    ): AnswerEvaluation {
        let score = 0;
        let feedback = '';

        if (EvaluationUtilities.isAnswerCorrect(userAnswer, expectedAnswer, answerType)) {
            score = maxScore;
            feedback = 'Correct';
        } else if (EvaluationUtilities.isAnswerPartiallyCorrect(userAnswer, expectedAnswer, answerType)) {
            score = maxScore * this.analysisConfig.partialWeight;
            feedback = 'Partiellement correct';
        } else {
            score = 0;
            feedback = 'Incorrect';
        }

        const baseEvaluation = {
            questionId,
            userAnswer,
            expectedAnswer,
            score,
            maxScore,
            feedback,
            correct: score === maxScore
        };

        // Gestion correcte de conceptId optionnel
        return conceptId
            ? { ...baseEvaluation, conceptId }
            : baseEvaluation as AnswerEvaluation;
    }

    /**
     * Calcule la maîtrise des concepts
     * @param conceptIds IDs des concepts
     * @param answerEvaluations Évaluations des réponses
     * @returns Maîtrise par concept
     * @private
     */
    private calculateConceptMastery(
        conceptIds: string[],
        answerEvaluations: AnswerEvaluation[]
    ): Record<string, number> {
        const conceptMastery: Record<string, number> = {};

        for (const conceptId of conceptIds) {
            const relevantEvaluations = answerEvaluations.filter(
                item => 'conceptId' in item && item.conceptId === conceptId
            );

            if (relevantEvaluations.length > 0) {
                const totalScore = relevantEvaluations.reduce((sum, item) => sum + item.score, 0);
                const totalPossible = relevantEvaluations.reduce((sum, item) => sum + item.maxScore, 0);
                conceptMastery[conceptId] = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
            }
        }

        return conceptMastery;
    }

    /**
     * Calcule les métriques avancées de performance
     * @param exercise Exercice
     * @param submission Soumission
     * @param sessionContext Contexte
     * @returns Métriques avancées
     * @private
     */
    private async calculateAdvancedMetrics(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): Promise<AdvancedPerformanceMetrics> {
        const submissionTime = submission.timeSpent ?? 0;
        const questionCount = exercise.expectedAnswers?.length ?? 1;

        // Récupération de l'historique via la méthode existante
        const userPerformance = await this.userPerformanceRepository.getUserPerformance(sessionContext.userId);
        const recentPerformances = userPerformance.performances
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10)
            .map(p => ({ score: p.score, date: p.timestamp }));

        return {
            averageTimePerQuestion: submissionTime / questionCount,
            averageConfidence: this.calculateAverageConfidence(submission),
            progressionPattern: this.analyzeProgressionPattern(recentPerformances),
            consistencyScore: this.calculateConsistencyScore(submission),
            cognitiveLoad: this.estimateCognitiveLoad(exercise, submissionTime)
        };
    }

    /**
     * Calcule la confiance moyenne de l'utilisateur
     * @param submission Soumission
     * @returns Confiance moyenne (0-1)
     * @private
     */
    private calculateAverageConfidence(submission: Submission): number {
        const answers = submission.answers ?? [];

        // Simulation de la confiance basée sur le temps de réponse et d'autres facteurs
        // car la propriété confidence n'existe pas dans le type existant
        const timeSpent = submission.timeSpent ?? 0;
        const avgTimePerAnswer = answers.length > 0 ? timeSpent / answers.length : 0;

        // Modèle simple : confiance inversement proportionnelle au temps excessif
        // Temps normal: 30-60 secondes par réponse = confiance élevée
        // Temps très court < 10s = confiance faible (réponse précipitée)
        // Temps très long > 120s = confiance faible (hésitation)
        let estimatedConfidence = 0.5;

        if (avgTimePerAnswer > 0) {
            if (avgTimePerAnswer >= 30 && avgTimePerAnswer <= 60) {
                estimatedConfidence = 0.8;
            } else if (avgTimePerAnswer < 10) {
                estimatedConfidence = 0.3;
            } else if (avgTimePerAnswer > 120) {
                estimatedConfidence = 0.4;
            } else {
                estimatedConfidence = 0.6;
            }
        }

        return estimatedConfidence;
    }

    /**
     * Analyse le pattern de progression
     * @param performances Performances récentes
     * @returns Pattern de progression
     * @private
     */
    private analyzeProgressionPattern(
        performances: Array<{ score: number; date: Date }>
    ): 'improving' | 'stable' | 'declining' {
        if (performances.length < 3) return 'stable';

        const scores = performances.map(p => p.score);
        const trend = this.calculateTrend(scores);

        if (trend > 0.1) return 'improving';
        if (trend < -0.1) return 'declining';
        return 'stable';
    }

    /**
     * Calcule la tendance d'un ensemble de scores
     * @param scores Scores à analyser
     * @returns Tendance (-1 à 1)
     * @private
     */
    private calculateTrend(scores: number[]): number {
        if (scores.length < 2) return 0;

        const n = scores.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = scores.reduce((sum, score) => sum + score, 0);
        const sumXY = scores.reduce((sum, score, index) => sum + score * index, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return Math.max(-1, Math.min(1, slope / 10)); // Normalisation
    }

    /**
     * Calcule le score de cohérence des réponses
     * @param submission Soumission
     * @returns Score de cohérence (0-1)
     * @private
     */
    private calculateConsistencyScore(submission: Submission): number {
        const answers = submission.answers ?? [];
        if (answers.length < 2) return 1;

        const timeSpent = submission.timeSpent ?? 0;
        const avgTimePerAnswer = timeSpent / answers.length;

        // Estimation de la cohérence basée sur la régularité du temps par réponse
        // et la complexité des réponses
        let consistencyScore = 0.8; // Score de base

        // Analyser la variance du temps si on peut l'estimer
        if (avgTimePerAnswer > 0) {
            // Modèle simple : cohérence élevée si temps moyen stable
            const timeVariance = this.estimateTimeVariance(answers.length, timeSpent);
            const coefficient = timeVariance / avgTimePerAnswer;
            consistencyScore = Math.max(0, 1 - coefficient);
        }

        return Math.min(1, Math.max(0, consistencyScore));
    }

    /**
     * Estime la variance du temps de réponse
     * @param answerCount Nombre de réponses
     * @param totalTime Temps total
     * @returns Variance estimée
     * @private
     */
    private estimateTimeVariance(answerCount: number, totalTime: number): number {
        if (answerCount <= 1) return 0;

        const avgTime = totalTime / answerCount;
        // Simulation d'une variance basée sur la distribution du temps
        // Plus le nombre de réponses est élevé, plus la variance peut être importante
        const estimatedVariance = Math.min(avgTime * 0.3, avgTime * (answerCount / 10));

        return estimatedVariance;
    }

    /**
     * Estime la charge cognitive de l'exercice
     * @param exercise Exercice
     * @param timeSpent Temps passé
     * @returns Charge cognitive estimée (0-1)
     * @private
     */
    private estimateCognitiveLoad(exercise: Exercise, timeSpent: number): number {
        const questionCount = exercise.expectedAnswers?.length ?? 1;
        const complexity = (exercise as Exercise & { difficulty?: number }).difficulty ?? 0.5;
        const timePerQuestion = timeSpent / questionCount;

        // Modèle simple basé sur le temps et la complexité
        const normalizedTime = Math.min(1, timePerQuestion / 120); // 2 minutes par question comme référence
        return (complexity + normalizedTime) / 2;
    }

    /**
     * Analyse les patterns d'apprentissage de l'utilisateur
     * @param result Résultat de base
     * @returns Analyse des patterns
     * @private
     */
    private async analyzeLearningPatterns(
        result: SubmissionEvaluationResult
    ): Promise<LearningPatternAnalysis> {
        // Analyse basée sur les types de questions réussies/échouées
        const answerAnalysisResults = result.answerEvaluations.filter(
            answer => answer.questionId.includes('visual') || answer.questionId.includes('image')
        );
        const analyticalQuestions = result.answerEvaluations.filter(
            answer => answer.questionId.includes('logic') || answer.questionId.includes('analysis')
        );

        const visualSuccess = this.calculateSuccessRate(answerAnalysisResults);
        const analyticalSuccess = this.calculateSuccessRate(analyticalQuestions);

        let patternType: 'visual' | 'kinesthetic' | 'analytical' | 'mixed' = 'mixed';
        let patternStrength = 0.5;

        if (visualSuccess > analyticalSuccess + 0.2) {
            patternType = 'visual';
            patternStrength = Math.min(1, visualSuccess);
        } else if (analyticalSuccess > visualSuccess + 0.2) {
            patternType = 'analytical';
            patternStrength = Math.min(1, analyticalSuccess);
        }

        return {
            patternType,
            patternStrength,
            adaptationRecommendations: this.generateAdaptationRecommendations(patternType, result),
            priorityAreas: this.identifyPriorityAreas(result.conceptMastery)
        };
    }

    /**
     * Calcule le succès rate pour un ensemble d'évaluations
     * @param answerResults Évaluations à analyser
     * @returns Taux de succès (0-1)
     * @private
     */
    private calculateSuccessRate(answerResults: AnswerEvaluation[]): number {
        if (answerResults.length === 0) return 0.5;

        const correctCount = answerResults.filter(result => result.correct).length;
        return correctCount / answerResults.length;
    }

    /**
     * Génère des recommandations d'adaptation
     * @param patternType Type de pattern détecté
     * @param result Résultat d'évaluation
     * @returns Recommandations
     * @private
     */
    private generateAdaptationRecommendations(
        patternType: string,
        result: SubmissionEvaluationResult
    ): string[] {
        const recommendations: string[] = [];

        switch (patternType) {
            case 'visual':
                recommendations.push('Privilégier les exercices avec support visuel');
                recommendations.push('Utiliser des diagrammes et schémas');
                break;
            case 'analytical':
                recommendations.push('Proposer des exercices de logique step-by-step');
                recommendations.push('Fournir des explications détaillées');
                break;
            case 'kinesthetic':
                recommendations.push('Intégrer des exercices pratiques');
                recommendations.push('Utiliser des simulations interactives');
                break;
            default:
                recommendations.push('Varier les types d\'exercices');
                recommendations.push('Adapter selon les préférences exprimées');
        }

        if (result.score < 70) {
            recommendations.push('Revoir les concepts fondamentaux');
            recommendations.push('Proposer des exercices de révision');
        }

        return recommendations;
    }

    /**
     * Identifie les zones d'amélioration prioritaires
     * @param conceptMastery Maîtrise des concepts
     * @returns Zones prioritaires
     * @private
     */
    private identifyPriorityAreas(conceptMastery: Record<string, number>): string[] {
        return Object.entries(conceptMastery)
            .filter(([, score]) => score < this.analysisConfig.weaknessThreshold)
            .sort(([, a], [, b]) => a - b) // Tri par score croissant
            .slice(0, 3) // Top 3 des priorités
            .map(([conceptId]) => conceptId);
    }

    /**
     * Génère des prédictions pour les prochains exercices
     * @param result Résultat de l'évaluation
     * @returns Prédictions
     * @private
     */
    private async generatePredictions(
        result: SubmissionEvaluationResult
    ): Promise<{ successProbability: number; recommendedStudyTime: number; suggestedTopics: string[] }> {
        // Récupération de l'historique via la méthode existante
        const userPerformance = await this.userPerformanceRepository.getUserPerformance(result.userId);
        const recentScores = userPerformance.performances
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5)
            .map(p => p.score);

        const avgScore = recentScores.length > 0
            ? recentScores.reduce((sum: number, score: number) => sum + score, 0) / recentScores.length
            : result.score;

        const successProbability = Math.max(0.1, Math.min(0.9, avgScore / 100));

        // Temps d'étude recommandé basé sur les faiblesses
        const weaknessCount = result.weaknesses.length;
        const recommendedStudyTime = Math.max(15, Math.min(120, 30 + weaknessCount * 15));

        // Sujets suggérés basés sur les faiblesses et la progression
        const suggestedTopics = [
            ...result.weaknesses.slice(0, 2),
            ...this.getRelatedConcepts(result.weaknesses)
        ].slice(0, 5);

        return {
            successProbability,
            recommendedStudyTime,
            suggestedTopics
        };
    }

    /**
     * Obtient des concepts liés aux faiblesses identifiées
     * @param weaknesses Faiblesses identifiées
     * @returns Concepts liés
     * @private
     */
    private getRelatedConcepts(weaknesses: string[]): string[] {
        // Logique simplifiée pour obtenir des concepts liés
        const relatedMap: Record<string, string[]> = {
            'hand-configuration': ['orientation', 'movement'],
            'facial-expression': ['non-manual', 'emotion'],
            'spatial-reference': ['grammar', 'syntax']
        };

        const related: string[] = [];
        for (const weakness of weaknesses) {
            if (relatedMap[weakness]) {
                related.push(...relatedMap[weakness]);
            }
        }

        return [...new Set(related)]; // Suppression des doublons
    }

    /**
     * Identifie les lacunes d'apprentissage potentielles
     * @param conceptMastery Maîtrise des concepts
     * @returns Lacunes identifiées
     * @private
     */
    private async identifyLearningGaps(
        conceptMastery: Record<string, number>
    ): Promise<LearningGap[]> {
        const gaps: LearningGap[] = [];

        for (const [conceptId, score] of Object.entries(conceptMastery)) {
            if (score < this.analysisConfig.weaknessThreshold) {
                const severity = this.calculateGapSeverity(score);

                // Conversion de la sévérité en priorité numérique (1-10, 10 étant la plus haute)
                const priorityMap: Record<string, number> = {
                    'critical': 10,
                    'high': 8,
                    'medium': 5,
                    'low': 2
                };

                // Création de l'objet gap avec les propriétés requises selon l'interface LearningGap
                const gap: LearningGap = {
                    conceptId,
                    conceptName: this.getConceptName(conceptId),
                    score,
                    status: 'identified',
                    priority: priorityMap[severity] ?? 5,
                    weakPrerequisites: this.getWeakPrerequisites(conceptId, score),
                    identifiedAt: new Date(),
                    recommendedResources: this.getRecommendedResources(conceptId, severity)
                };

                gaps.push(gap);
            }
        }

        return gaps;
    }

    /**
     * Obtient le nom lisible d'un concept
     * @param conceptId ID du concept
     * @returns Nom du concept
     * @private
     */
    private getConceptName(conceptId: string): string {
        // Mapping simple des IDs vers des noms lisibles
        const conceptNames: Record<string, string> = {
            'hand-configuration': 'Configuration des mains',
            'facial-expression': 'Expression faciale',
            'spatial-reference': 'Références spatiales',
            'movement': 'Mouvement',
            'orientation': 'Orientation',
            'timing': 'Timing et rythme',
            'grammar': 'Grammaire LSF',
            'syntax': 'Syntaxe',
            'classifiers': 'Classificateurs',
            'non-manual': 'Marqueurs non-manuels'
        };

        return conceptNames[conceptId] ?? conceptId;
    }

    /**
     * Identifie les prérequis faibles pour un concept
     * @param conceptId ID du concept
     * @param score Score actuel
     * @returns Liste des prérequis faibles
     * @private
     */
    private getWeakPrerequisites(conceptId: string, score: number): string[] {
        // Logique simple pour identifier les prérequis selon le concept
        const prerequisitesMap: Record<string, string[]> = {
            'facial-expression': ['basic-signs', 'hand-configuration'],
            'spatial-reference': ['basic-signs', 'hand-configuration', 'movement'],
            'classifiers': ['hand-configuration', 'movement', 'spatial-reference'],
            'grammar': ['basic-signs', 'hand-configuration', 'spatial-reference'],
            'syntax': ['grammar', 'spatial-reference', 'classifiers']
        };

        const prerequisites = prerequisitesMap[conceptId] ?? [];

        // Si le score est très bas, considérer tous les prérequis comme faibles
        if (score < 30) {
            return prerequisites;
        }

        // Sinon, retourner une partie des prérequis
        return prerequisites.slice(0, Math.ceil(prerequisites.length / 2));
    }

    /**
     * Obtient les ressources recommandées pour un concept
     * @param conceptId ID du concept
     * @param severity Sévérité de la lacune
     * @returns Liste des ressources
     * @private
     */
    private getRecommendedResources(conceptId: string, severity: string): string[] {
        const baseResources = [
            `guide-${conceptId}`,
            `exercises-${conceptId}`,
            `video-tutorial-${conceptId}`
        ];

        // Ajouter des ressources spécifiques selon la sévérité
        if (severity === 'critical' || severity === 'high') {
            baseResources.unshift(`fundamentals-${conceptId}`);
            baseResources.push(`remedial-exercises-${conceptId}`);
        }

        if (severity === 'critical') {
            baseResources.push(`one-on-one-support-${conceptId}`);
        }

        return baseResources;
    }

    /**
     * Calcule la sévérité d'une lacune
     * @param score Score du concept
     * @returns Sévérité
     * @private
     */
    private calculateGapSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score < 30) return 'critical';
        if (score < 50) return 'high';
        if (score < this.analysisConfig.weaknessThreshold) return 'medium';
        return 'low';
    }

    /**
     * @method identifyStrengths
     * @private
     * @param {Record<string, number>} conceptMastery - Niveaux de maîtrise des concepts
     * @returns {string[]} - Forces identifiées
     * @description Identifie les forces de l'utilisateur à partir des niveaux de maîtrise des concepts
     */
    private identifyStrengths(conceptMastery: Record<string, number>): string[] {
        return Object.entries(conceptMastery)
            .filter(([, score]) => score >= this.analysisConfig.strengthThreshold)
            .map(([conceptId]) => conceptId);
    }

    /**
     * @method identifyWeaknesses
     * @private
     * @param {Record<string, number>} conceptMastery - Niveaux de maîtrise des concepts
     * @returns {string[]} - Faiblesses identifiées
     * @description Identifie les faiblesses de l'utilisateur à partir des niveaux de maîtrise des concepts
     */
    private identifyWeaknesses(conceptMastery: Record<string, number>): string[] {
        return Object.entries(conceptMastery)
            .filter(([, score]) => score < this.analysisConfig.weaknessThreshold)
            .map(([conceptId]) => conceptId);
    }
}