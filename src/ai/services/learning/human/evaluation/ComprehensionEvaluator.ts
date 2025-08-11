/**
 * Évaluateur de compréhension pour le service d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/human/evaluation/ComprehensionEvaluator.ts
 * @description Évaluateur de compréhension pour le service d'apprentissage
 * Analyse les performances des utilisateurs, évalue leur niveau de compréhension,
 * identifie les lacunes d'apprentissage et génère des recommandations.
 * @version 1.2.0
 * @author MetaSign Learning Module
 * @since 1.0.0
 */

"use strict";

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { EventBus } from '@/ai/services/learning/shared/events/EventBus';
import { ConceptRelationshipGraph } from '@/ai/services/learning/human/evaluation/graphs/ConceptRelationshipGraph';
import { PerformanceAnalyzer } from '@/ai/services/learning/human/evaluation/analytics/PerformanceAnalyzer';
import { KnowledgeGapDetector } from '@/ai/services/learning/human/evaluation/detection/KnowledgeGapDetector';
import { DifficultyPredictor } from '@/ai/services/learning/human/evaluation/prediction/DifficultyPredictor';
import { UserPerformanceRepository } from '@/ai/services/learning/human/evaluation/repositories/UserPerformanceRepository';
import { ConceptRepository } from '@/ai/services/learning/human/coda/codavirtuel/evaluators/repositories/ConceptRepository';
import { LearningPathRecommender } from '@/ai/services/learning/human/evaluation/recommendation/LearningPathRecommender';
import { UserComprehensionState } from '@/ai/services/learning/human/evaluation/models/UserComprehensionState';
import { EvaluationUtilities } from '@/ai/services/learning/human/evaluation/evaluation-utilities';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';
import {
    ComprehensionEvaluationResult,
    ConceptEvaluation,
    ComprehensionLevel,
    SubmissionEvaluationResult,
    LearningGap,
    EvaluationConfig,
    Exercise,
    Submission,
    SessionContext
} from '@/ai/services/learning/human/evaluation/types';

/**
 * @interface ComprehensionEvaluatorMetrics
 * @description Métriques pour l'évaluateur de compréhension
 */
interface ComprehensionEvaluatorMetrics {
    readonly totalEvaluations: number;
    readonly averageProcessingTime: number;
    readonly successRate: number;
    readonly lastEvaluationDate: Date;
}

/**
 * @interface Concept
 * @description Interface pour un concept d'apprentissage
 */
interface Concept {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly category?: string;
    readonly difficulty?: string;
}

/**
 * @class ComprehensionEvaluator
 * @description Évalue la compréhension des utilisateurs, identifie les lacunes et fournit des recommandations
 * pour améliorer l'apprentissage basé sur les performances passées.
 */
export class ComprehensionEvaluator {
    private readonly logger = LoggerFactory.getLogger('ComprehensionEvaluator');
    private readonly eventBus: EventBus;
    private readonly config: EvaluationConfig;
    private readonly metricsCollector: MetricsCollector;

    // Composants spécialisés
    private readonly conceptGraph: ConceptRelationshipGraph;
    private readonly performanceAnalyzer: PerformanceAnalyzer;
    private readonly gapDetector: KnowledgeGapDetector;
    private readonly difficultyPredictor: DifficultyPredictor;
    private readonly userPerformanceRepository: UserPerformanceRepository;
    private readonly conceptRepository: ConceptRepository;
    private readonly pathRecommender: LearningPathRecommender;

    // Métriques internes
    private metrics: ComprehensionEvaluatorMetrics;

    /**
     * @constructor
     * @param {EvaluationConfig} config - Configuration de l'évaluation
     * @param {MetricsCollector} [metricsCollector] - Collecteur de métriques optionnel
     */
    constructor(config: EvaluationConfig, metricsCollector?: MetricsCollector) {
        this.logger.info('Initializing ComprehensionEvaluator...');
        this.config = Object.freeze({ ...config });
        this.eventBus = EventBus.getInstance();
        this.metricsCollector = metricsCollector ?? new MetricsCollector();

        // Initialisation des métriques
        this.metrics = {
            totalEvaluations: 0,
            averageProcessingTime: 0,
            successRate: 100,
            lastEvaluationDate: new Date()
        };

        // Initialisation des composants
        this.conceptGraph = new ConceptRelationshipGraph();
        this.performanceAnalyzer = new PerformanceAnalyzer();
        this.gapDetector = new KnowledgeGapDetector(
            this.conceptGraph,
            this.metricsCollector,
            {
                masteryThreshold: config.masteryThreshold,
                enableDetailedMetrics: true
            }
        );
        this.difficultyPredictor = new DifficultyPredictor(config.confidenceThreshold);
        this.userPerformanceRepository = new UserPerformanceRepository();
        this.conceptRepository = new ConceptRepository();
        this.pathRecommender = new LearningPathRecommender(this.conceptGraph);

        this.validateConfiguration();
        this.logger.info('ComprehensionEvaluator initialized successfully');
    }

    /**
     * @method evaluateUserComprehension
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} [courseId] - Identifiant du cours (optionnel)
     * @returns {Promise<ComprehensionEvaluationResult>} - Résultat de l'évaluation de compréhension
     * @description Évalue la compréhension globale d'un utilisateur sur l'ensemble des concepts ou pour un cours spécifique
     */
    public async evaluateUserComprehension(
        userId: string,
        courseId?: string
    ): Promise<ComprehensionEvaluationResult> {
        const startTime = Date.now();
        this.validateUserId(userId);

        this.logger.info(`Evaluating comprehension for user ${userId}${courseId ? ` in course ${courseId}` : ''}`);

        try {
            // Récupération des performances de l'utilisateur
            const userPerformance = await this.userPerformanceRepository.getUserPerformance(userId, courseId);

            // Récupération des concepts à évaluer
            const concepts = await this.getConceptsForEvaluation(courseId);

            // Construction du modèle de l'état de compréhension de l'utilisateur
            const comprehensionState = new UserComprehensionState(userId, userPerformance);

            // Évaluation de chaque concept
            const conceptEvaluations: ConceptEvaluation[] = [];

            for (const concept of concepts) {
                const evaluation = this.evaluateConcept(concept.id, comprehensionState);
                conceptEvaluations.push(evaluation);
            }

            // Calcul du score global de compréhension
            const globalScore = EvaluationUtilities.calculateGlobalComprehensionScore(conceptEvaluations);

            // Détermination du niveau global de compréhension
            const comprehensionLevel = EvaluationUtilities.determineComprehensionLevel(globalScore);

            // Identification des forces et faiblesses
            const strengths = this.identifyStrengths(conceptEvaluations);
            const weaknesses = this.identifyWeaknesses(conceptEvaluations);

            // Détection des lacunes dans les dépendances de concepts
            const gapResult = await this.gapDetector.detectKnowledgeGaps(userId, conceptEvaluations);
            const gaps = [...gapResult.gaps];

            // Génération des recommandations
            const recommendations = await this.pathRecommender.generateRecommendations(userId, gaps, conceptEvaluations);

            // Construction du résultat final avec une gestion correcte des types optionnels
            const result: ComprehensionEvaluationResult = {
                userId,
                courseId: courseId ?? '',
                globalScore,
                comprehensionLevel,
                evaluationDate: new Date(),
                conceptEvaluations,
                strengths,
                weaknesses,
                gaps,
                recommendations,
                confidence: EvaluationUtilities.calculateResultConfidence(conceptEvaluations)
            };

            // Mise à jour des métriques
            this.updateMetrics(startTime, true);

            // Notification de l'évaluation complétée
            this.publishEvaluationEvent(result);

            return result;
        } catch (error) {
            this.updateMetrics(startTime, false);
            this.logger.error(`Error evaluating user comprehension: ${this.getErrorMessage(error)}`);
            throw new Error(`Failed to evaluate user comprehension: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * @method evaluateSubmission
     * @async
     * @param {Exercise} exercise - Exercice soumis
     * @param {Submission} submission - Soumission de l'utilisateur
     * @param {SessionContext} sessionContext - Contexte de la session
     * @returns {Promise<SubmissionEvaluationResult>} - Résultat de l'évaluation
     * @description Évalue la soumission d'un utilisateur pour un exercice spécifique
     */
    public async evaluateSubmission(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): Promise<SubmissionEvaluationResult> {
        this.validateSubmissionInputs(exercise, submission, sessionContext);

        this.logger.debug(`Evaluating submission for exercise ${exercise.id}`);

        try {
            const result = await this.processSubmission(exercise, submission, sessionContext);

            // Notification de l'évaluation complétée
            this.eventBus.publish('learning.submission.evaluated', {
                exerciseId: exercise.id,
                userId: sessionContext.userId,
                score: result.score,
                isCorrect: result.isCorrect
            });

            return result;
        } catch (error) {
            this.logger.error(`Error evaluating submission: ${this.getErrorMessage(error)}`);
            throw new Error(`Failed to evaluate submission: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * @method identifyLearningGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<LearningGap[]>} - Lacunes d'apprentissage identifiées
     * @description Identifie les lacunes d'apprentissage d'un utilisateur
     */
    public async identifyLearningGaps(userId: string): Promise<LearningGap[]> {
        this.validateUserId(userId);

        this.logger.info(`Identifying learning gaps for user ${userId}`);

        try {
            // Évaluation complète de la compréhension
            const comprehensionResult = await this.evaluateUserComprehension(userId);

            // Retour des lacunes identifiées
            return comprehensionResult.gaps;
        } catch (error) {
            this.logger.error(`Error identifying learning gaps: ${this.getErrorMessage(error)}`);
            throw new Error(`Failed to identify learning gaps: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * @method recommendDifficultyLevel
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} conceptId - Identifiant du concept
     * @returns {Promise<string>} - Niveau de difficulté recommandé
     * @description Recommande un niveau de difficulté pour un concept spécifique
     */
    public async recommendDifficultyLevel(userId: string, conceptId: string): Promise<string> {
        this.validateUserId(userId);
        this.validateConceptId(conceptId);

        this.logger.debug(`Recommending difficulty level for user ${userId}, concept ${conceptId}`);

        try {
            // Récupération des performances de l'utilisateur sur ce concept
            const performances = await this.userPerformanceRepository.getConceptPerformance(userId, conceptId);

            // Utilisation du prédicteur de difficulté
            return await this.difficultyPredictor.predictConceptDifficulty(userId, conceptId, performances);
        } catch (error) {
            this.logger.error(`Error recommending difficulty level: ${this.getErrorMessage(error)}`);
            // En cas d'erreur, retourner une difficulté moyenne
            return 'medium';
        }
    }

    /**
     * @method getMetrics
     * @returns {ComprehensionEvaluatorMetrics} - Métriques actuelles
     * @description Retourne les métriques de performance de l'évaluateur
     */
    public getMetrics(): ComprehensionEvaluatorMetrics {
        return { ...this.metrics };
    }

    /**
     * @method getServiceInfo
     * @returns {{name: string, version: string, features: string[]}} - Informations sur le service
     * @description Retourne les informations du service pour le registre
     */
    public getServiceInfo(): { name: string; version: string; features: string[] } {
        return {
            name: 'ComprehensionEvaluator',
            version: '1.2.0',
            features: [
                'user_comprehension_evaluation',
                'submission_evaluation',
                'learning_gap_identification',
                'difficulty_recommendation',
                'performance_tracking',
                'concept_analysis'
            ]
        };
    }

    // Méthodes privées

    /**
     * @method getConceptsForEvaluation
     * @private
     * @async
     * @param {string} [courseId] - Identifiant du cours optionnel
     * @returns {Promise<Concept[]>} - Concepts à évaluer
     * @description Récupère les concepts à évaluer selon le contexte
     */
    private async getConceptsForEvaluation(courseId?: string): Promise<Concept[]> {
        if (courseId) {
            // Simulation de getCourseConceptMap - à remplacer par l'implémentation réelle
            const allConcepts = await this.conceptRepository.getAllConcepts();
            // Filtrer les concepts par cours (logique à adapter selon l'implémentation réelle)
            return allConcepts.filter(concept =>
                concept.category === courseId || concept.id.includes(courseId)
            );
        } else {
            return await this.conceptRepository.getAllConcepts();
        }
    }

    /**
     * @method identifyStrengths
     * @private
     * @param {ConceptEvaluation[]} conceptEvaluations - Évaluations de concepts
     * @returns {string[]} - Forces identifiées
     * @description Identifie les forces de l'utilisateur
     */
    private identifyStrengths(conceptEvaluations: ConceptEvaluation[]): string[] {
        return conceptEvaluations
            .filter(evaluation =>
                evaluation.level === ComprehensionLevel.MASTERY ||
                evaluation.level === ComprehensionLevel.HIGH
            )
            .map(evaluation => evaluation.conceptId)
            .slice(0, 5);
    }

    /**
     * @method identifyWeaknesses
     * @private
     * @param {ConceptEvaluation[]} conceptEvaluations - Évaluations de concepts
     * @returns {string[]} - Faiblesses identifiées
     * @description Identifie les faiblesses de l'utilisateur
     */
    private identifyWeaknesses(conceptEvaluations: ConceptEvaluation[]): string[] {
        return conceptEvaluations
            .filter(evaluation =>
                evaluation.level === ComprehensionLevel.LOW ||
                evaluation.level === ComprehensionLevel.VERY_LOW
            )
            .map(evaluation => evaluation.conceptId)
            .slice(0, 5);
    }

    /**
     * @method evaluateConcept
     * @private
     * @param {string} conceptId - Identifiant du concept
     * @param {UserComprehensionState} state - État de compréhension de l'utilisateur
     * @returns {ConceptEvaluation} - Évaluation du concept
     * @description Évalue la compréhension d'un utilisateur pour un concept spécifique
     */
    private evaluateConcept(conceptId: string, state: UserComprehensionState): ConceptEvaluation {
        // Récupération des performances liées à ce concept
        const conceptPerformances = state.getConceptPerformances(conceptId);

        // Pas de données de performance disponibles
        if (conceptPerformances.length === 0) {
            return {
                conceptId,
                score: 0,
                level: ComprehensionLevel.UNKNOWN,
                confidence: 0,
                lastPracticed: null,
                practiceCount: 0,
                trend: 'stable',
                predictedForgettingRate: 1.0
            };
        }

        // Calcul du score moyen, pondéré par la récence
        const { weightedScore, confidence, trend, lastPracticed, forgettingRate } =
            this.calculateConceptMetrics(conceptPerformances);

        // Détermination du niveau de compréhension
        const level = EvaluationUtilities.determineComprehensionLevel(weightedScore);

        return {
            conceptId,
            score: weightedScore,
            level,
            confidence,
            lastPracticed,
            practiceCount: conceptPerformances.length,
            trend,
            predictedForgettingRate: forgettingRate
        };
    }

    /**
     * @method calculateConceptMetrics
     * @private
     * @param {Array} conceptPerformances - Performances du concept
     * @returns {object} - Métriques calculées
     * @description Calcule les métriques pour un concept
     */
    private calculateConceptMetrics(conceptPerformances: Array<{ score: number; timestamp: Date }>) {
        let weightedSum = 0;
        let totalWeight = 0;

        const now = new Date();
        const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

        // Trier par date croissante
        const sortedPerformances = [...conceptPerformances].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Calcul du score moyenné avec plus de poids pour les performances récentes
        for (let i = 0; i < sortedPerformances.length; i++) {
            const performance = sortedPerformances[i];
            const ageMs = now.getTime() - performance.timestamp.getTime();
            const recencyWeight = Math.max(0, 1 - (ageMs / oneMonthMs));
            const positionWeight = (i + 1) / sortedPerformances.length;

            const weight = this.calculateWeight(recencyWeight, positionWeight);
            weightedSum += performance.score * weight;
            totalWeight += weight;
        }

        const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Calcul du taux d'oubli prévu
        const lastPracticed = sortedPerformances[sortedPerformances.length - 1].timestamp;
        const daysSinceLastPractice = (now.getTime() - lastPracticed.getTime()) / (24 * 60 * 60 * 1000);

        const baseRetentionRate = Math.min(weightedScore / 100, 0.9);
        const forgettingRate = this.calculateForgettingRate(baseRetentionRate, daysSinceLastPractice);

        // Détermination de la tendance
        const trend = this.determineTrend(sortedPerformances);

        // Calcul de la confiance
        const confidenceBase = Math.min(0.8, (sortedPerformances.length / 10));
        const recencyFactor = Math.max(0, 1 - (daysSinceLastPractice / 60));
        const confidence = confidenceBase * recencyFactor;

        return {
            weightedScore,
            confidence,
            trend,
            lastPracticed,
            forgettingRate
        };
    }

    /**
     * @method calculateWeight
     * @private
     * @param {number} recencyWeight - Poids basé sur la récence (0-1)
     * @param {number} positionWeight - Poids basé sur la position (0-1)
     * @returns {number} - Poids combiné
     * @description Calcule le poids combiné pour l'évaluation des performances
     */
    private calculateWeight(recencyWeight: number, positionWeight: number): number {
        return (recencyWeight * 0.7) + (positionWeight * 0.3);
    }

    /**
     * @method calculateForgettingRate
     * @private
     * @param {number} baseRetentionRate - Taux de rétention de base (0-1)
     * @param {number} daysSinceLastPractice - Jours écoulés depuis la dernière pratique
     * @returns {number} - Taux d'oubli prévu
     * @description Calcule le taux d'oubli basé sur la courbe d'Ebbinghaus
     */
    private calculateForgettingRate(baseRetentionRate: number, daysSinceLastPractice: number): number {
        return 1 - (baseRetentionRate * Math.exp(-0.1 * daysSinceLastPractice));
    }

    /**
     * @method determineTrend
     * @private
     * @param {Array} sortedPerformances - Performances triées
     * @returns {'improving' | 'declining' | 'stable'} - Tendance identifiée
     * @description Détermine la tendance d'apprentissage
     */
    private determineTrend(sortedPerformances: Array<{ score: number; timestamp: Date }>): 'improving' | 'declining' | 'stable' {
        if (sortedPerformances.length < 3) {
            return 'stable';
        }

        const recentScores = sortedPerformances.slice(-3).map(p => p.score);
        const averageRecentScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const earlierScores = sortedPerformances.slice(0, -3).map(p => p.score);
        const averageEarlierScore = earlierScores.length > 0
            ? earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length
            : averageRecentScore;

        if (averageRecentScore > averageEarlierScore + 10) {
            return 'improving';
        } else if (averageRecentScore < averageEarlierScore - 10) {
            return 'declining';
        }
        return 'stable';
    }

    /**
     * @method processSubmission
     * @private
     * @async
     * @param {Exercise} exercise - Exercice soumis
     * @param {Submission} submission - Soumission de l'utilisateur
     * @param {SessionContext} sessionContext - Contexte de la session
     * @returns {Promise<SubmissionEvaluationResult>} - Résultat de l'évaluation
     * @description Traite une soumission d'exercice et calcule le résultat détaillé
     */
    private async processSubmission(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): Promise<SubmissionEvaluationResult> {
        return await this.performanceAnalyzer.processSubmission(exercise, submission, sessionContext);
    }

    /**
     * @method updateMetrics
     * @private
     * @param {number} startTime - Temps de début
     * @param {boolean} success - Indicateur de succès
     * @description Met à jour les métriques internes
     */
    private updateMetrics(startTime: number, success: boolean): void {
        const processingTime = Date.now() - startTime;

        this.metrics = {
            totalEvaluations: this.metrics.totalEvaluations + 1,
            averageProcessingTime: (this.metrics.averageProcessingTime + processingTime) / 2,
            successRate: success
                ? ((this.metrics.successRate * (this.metrics.totalEvaluations - 1)) + 100) / this.metrics.totalEvaluations
                : ((this.metrics.successRate * (this.metrics.totalEvaluations - 1)) + 0) / this.metrics.totalEvaluations,
            lastEvaluationDate: new Date()
        };
    }

    /**
     * @method publishEvaluationEvent
     * @private
     * @param {ComprehensionEvaluationResult} result - Résultat d'évaluation
     * @description Publie l'événement d'évaluation
     */
    private publishEvaluationEvent(result: ComprehensionEvaluationResult): void {
        this.eventBus.publish('learning.comprehension.evaluated', {
            userId: result.userId,
            courseId: result.courseId,
            globalScore: result.globalScore,
            comprehensionLevel: result.comprehensionLevel,
            strengths: result.strengths.length,
            weaknesses: result.weaknesses.length,
            gaps: result.gaps.length
        });
    }

    /**
     * @method validateConfiguration
     * @private
     * @throws {Error} Si la configuration est invalide
     * @description Valide la configuration de l'évaluateur
     */
    private validateConfiguration(): void {
        if (!this.config || typeof this.config !== 'object') {
            throw new Error('Configuration is required and must be an object');
        }

        if (typeof this.config.confidenceThreshold !== 'number' ||
            this.config.confidenceThreshold < 0 ||
            this.config.confidenceThreshold > 1) {
            throw new Error('confidenceThreshold must be a number between 0 and 1');
        }

        if (typeof this.config.masteryThreshold !== 'number' ||
            this.config.masteryThreshold < 0 ||
            this.config.masteryThreshold > 100) {
            throw new Error('masteryThreshold must be a number between 0 and 100');
        }
    }

    /**
     * @method validateUserId
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @throws {Error} Si l'userId est invalide
     * @description Valide l'identifiant utilisateur
     */
    private validateUserId(userId: string): void {
        if (!userId?.trim()) {
            throw new Error('userId is required and cannot be empty');
        }
    }

    /**
     * @method validateConceptId
     * @private
     * @param {string} conceptId - Identifiant de concept
     * @throws {Error} Si le conceptId est invalide
     * @description Valide l'identifiant de concept
     */
    private validateConceptId(conceptId: string): void {
        if (!conceptId?.trim()) {
            throw new Error('conceptId is required and cannot be empty');
        }
    }

    /**
     * @method validateSubmissionInputs
     * @private
     * @param {Exercise} exercise - Exercice
     * @param {Submission} submission - Soumission
     * @param {SessionContext} sessionContext - Contexte de session
     * @throws {Error} Si les entrées sont invalides
     * @description Valide les entrées pour l'évaluation de soumission
     */
    private validateSubmissionInputs(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): void {
        if (!exercise || typeof exercise !== 'object') {
            throw new Error('exercise is required and must be an object');
        }

        if (!submission || typeof submission !== 'object') {
            throw new Error('submission is required and must be an object');
        }

        if (!sessionContext || typeof sessionContext !== 'object') {
            throw new Error('sessionContext is required and must be an object');
        }
    }

    /**
     * @method getErrorMessage
     * @private
     * @param {unknown} error - Erreur
     * @returns {string} - Message d'erreur
     * @description Extrait le message d'erreur de manière sécurisée
     */
    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Unknown error';
    }
}