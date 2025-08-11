/**
 * @file src/ai/services/learning/human/evaluation/processing/SubmissionProcessor.ts
 * @description Processeur de soumissions d'exercices pour l'évaluation des réponses
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { UserPerformanceRepository } from '@/ai/services/learning/human/evaluation/repositories/UserPerformanceRepository';
import { ConceptRepository } from '@/ai/services/learning/human/coda/codavirtuel/evaluators/repositories/ConceptRepository';
import { DifficultyPredictor } from '@/ai/services/learning/human/evaluation/prediction/DifficultyPredictor';
import { AnswerComparisonService } from '@/ai/services/learning/human/evaluation/processing/AnswerComparisonService';
import { LearningGapService } from '@/ai/services/learning/human/evaluation/processing/LearningGapService';
import {
    Exercise,
    Submission,
    SessionContext,
    SubmissionEvaluationResult,
    AnswerValue,
    AnswerEvaluation
} from '@/ai/services/learning/human/evaluation/types';

/**
 * @class SubmissionProcessor
 * @description Classe responsable du traitement et de l'évaluation des soumissions d'exercices
 */
export class SubmissionProcessor {
    private readonly logger = LoggerFactory.getLogger('SubmissionProcessor');
    private readonly userPerformanceRepository: UserPerformanceRepository;
    private readonly conceptRepository: ConceptRepository;
    private readonly difficultyPredictor: DifficultyPredictor;
    private readonly answerComparisonService: AnswerComparisonService;
    private readonly learningGapService: LearningGapService;

    /**
     * @constructor
     * @param {number} confidenceThreshold - Seuil de confiance pour l'évaluation
     */
    constructor(private readonly confidenceThreshold: number) {
        this.userPerformanceRepository = new UserPerformanceRepository();
        this.conceptRepository = new ConceptRepository();
        this.difficultyPredictor = new DifficultyPredictor(this.confidenceThreshold);
        this.answerComparisonService = new AnswerComparisonService();
        this.learningGapService = new LearningGapService(
            this.conceptRepository,
            this.userPerformanceRepository
        );
    }

    /**
     * @method processSubmission
     * @async
     * @param {Exercise} exercise - Exercice soumis
     * @param {Submission} submission - Soumission de l'utilisateur
     * @param {SessionContext} sessionContext - Contexte de la session
     * @returns {Promise<SubmissionEvaluationResult>} - Résultat de l'évaluation
     * @description Traite une soumission d'exercice et calcule le résultat détaillé
     */
    public async processSubmission(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): Promise<SubmissionEvaluationResult> {
        try {
            this.logger.debug(`Processing submission for exercise ${exercise.id} by user ${sessionContext.userId}`);

            // Validation des données d'entrée
            this.validateInputs(exercise, submission, sessionContext);

            // Extraction des concepts impliqués dans l'exercice
            const conceptIds = exercise.concepts || [];

            // Évaluation des réponses et calcul des scores
            const { answerEvaluations, totalScore, possiblePoints } =
                this.evaluateAnswers(exercise, submission);

            // Calcul du score normalisé sur 100
            const normalizedScore = possiblePoints > 0
                ? (totalScore / possiblePoints) * 100
                : 0;

            // Analyse de maîtrise des concepts
            const conceptMastery = this.calculateConceptMastery(conceptIds, answerEvaluations);

            // Sauvegarde des performances dans le référentiel
            await this.savePerformance(
                sessionContext.userId,
                exercise.id,
                normalizedScore,
                conceptMastery
            );

            // Détection des lacunes de connaissance
            const potentialGaps = await this.learningGapService.identifyPotentialGaps(
                sessionContext.userId,
                conceptIds,
                conceptMastery
            );

            // Détermination du niveau de difficulté recommandé
            const recommendedDifficulty = await this.difficultyPredictor.predictNextDifficulty(
                sessionContext.userId,
                conceptIds,
                normalizedScore
            );

            // Identification des forces et faiblesses
            const strengths = this.identifyStrengths(conceptMastery);
            const weaknesses = this.identifyWeaknesses(conceptMastery);

            // Construction du résultat final
            return {
                exerciseId: exercise.id,
                userId: sessionContext.userId,
                score: normalizedScore,
                isCorrect: normalizedScore >= 70,
                answerEvaluations,
                conceptMastery,
                potentialGaps,
                strengths,
                weaknesses,
                recommendedDifficulty,
                submittedAt: new Date()
            };
        } catch (error) {
            this.logger.error(`Error processing submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new Error(`Failed to process submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * @method validateInputs
     * @private
     * @param {Exercise} exercise - Exercice soumis
     * @param {Submission} submission - Soumission de l'utilisateur
     * @param {SessionContext} sessionContext - Contexte de la session
     * @throws {Error} Si les entrées sont invalides
     * @description Valide les données d'entrée pour le traitement
     */
    private validateInputs(
        exercise: Exercise,
        submission: Submission,
        sessionContext: SessionContext
    ): void {
        if (!exercise || !exercise.id) {
            throw new Error('Invalid exercise: Missing exercise or exercise ID');
        }

        if (!submission || !submission.id) {
            throw new Error('Invalid submission: Missing submission or submission ID');
        }

        if (!sessionContext || !sessionContext.userId) {
            throw new Error('Invalid session context: Missing context or user ID');
        }

        if (!exercise.expectedAnswers || exercise.expectedAnswers.length === 0) {
            this.logger.warn(`Exercise ${exercise.id} has no expected answers`);
        }
    }

    /**
     * @method evaluateAnswers
     * @private
     * @param {Exercise} exercise - Exercice à évaluer
     * @param {Submission} submission - Soumission de l'utilisateur
     * @returns {Object} Contenant answerEvaluations, totalScore et possiblePoints
     * @description Évalue les réponses de l'utilisateur par rapport aux réponses attendues
     */
    private evaluateAnswers(
        exercise: Exercise,
        submission: Submission
    ): {
        answerEvaluations: AnswerEvaluation[];
        totalScore: number;
        possiblePoints: number;
    } {
        // Récupération des réponses correctes et des réponses de l'utilisateur
        const correctAnswers = exercise.expectedAnswers || [];
        const userAnswers = submission.answers || [];

        // Tableau des évaluations de réponses
        const answerEvaluations: AnswerEvaluation[] = [];

        // Scores initiaux
        let totalScore = 0;
        let possiblePoints = 0;

        // Évaluation de chaque réponse
        for (let i = 0; i < correctAnswers.length; i++) {
            const expected = correctAnswers[i];
            // Sécurisation pour éviter les erreurs si userAnswers[i] est undefined
            const userAnswer = userAnswers.find(a => a.questionId === expected.id) || {
                questionId: expected.id,
                value: undefined
            };

            // Points disponibles pour cette question
            const questionPoints = expected.points || 1;
            possiblePoints += questionPoints;

            // Comparaison avec la réponse attendue
            let answerScore = 0;
            let feedback = '';

            try {
                const isCorrect = this.answerComparisonService.compareAnswers(
                    userAnswer.value,
                    expected.answer,
                    expected.answerType
                );

                const isPartiallyCorrect = this.answerComparisonService.compareAnswersPartially(
                    userAnswer.value,
                    expected.answer,
                    expected.answerType
                );

                if (isCorrect) {
                    // Réponse exacte
                    answerScore = questionPoints;
                    feedback = 'Correct';
                } else if (isPartiallyCorrect) {
                    // Réponse partiellement correcte
                    answerScore = questionPoints * 0.5;
                    feedback = 'Partiellement correct';
                } else {
                    // Réponse incorrecte
                    answerScore = 0;
                    feedback = 'Incorrect';
                }
            } catch (error) {
                // En cas d'erreur lors de l'évaluation, considérer comme incorrect
                this.logger.warn(`Error evaluating answer for question ${expected.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                answerScore = 0;
                feedback = 'Erreur d\'évaluation';
            }

            // Ajout au score total
            totalScore += answerScore;

            // S'assurer que conceptId est toujours défini
            const conceptId = expected.conceptId || 'general'; // Utiliser une valeur par défaut

            // Enregistrement de l'évaluation
            answerEvaluations.push({
                questionId: expected.id,
                conceptId,
                userAnswer: userAnswer.value as AnswerValue,
                expectedAnswer: expected.answer as AnswerValue,
                score: answerScore,
                maxScore: questionPoints,
                feedback,
                correct: answerScore === questionPoints
            });
        }

        return { answerEvaluations, totalScore, possiblePoints };
    }

    /**
     * @method calculateConceptMastery
     * @private
     * @param {string[]} conceptIds - Liste des concepts à évaluer
     * @param {AnswerEvaluation[]} answerEvaluations - Évaluations des réponses
     * @returns {Record<string, number>} - Niveaux de maîtrise par concept
     * @description Calcule le niveau de maîtrise pour chaque concept
     */
    private calculateConceptMastery(
        conceptIds: string[],
        answerEvaluations: AnswerEvaluation[]
    ): Record<string, number> {
        const conceptMastery: Record<string, number> = {};

        for (const conceptId of conceptIds) {
            // Filtrer les évaluations de réponses liées à ce concept
            const relevantEvaluations = answerEvaluations.filter(evalItem => evalItem.conceptId === conceptId);

            if (relevantEvaluations.length > 0) {
                // Calcul du score de maîtrise pour ce concept
                const totalMaxScore = relevantEvaluations.reduce((sum, evalItem) => sum + evalItem.maxScore, 0);

                // Éviter la division par zéro
                if (totalMaxScore > 0) {
                    const conceptScore = relevantEvaluations.reduce((sum, evalItem) => sum + evalItem.score, 0) / totalMaxScore;
                    conceptMastery[conceptId] = conceptScore * 100;
                } else {
                    conceptMastery[conceptId] = 0;
                    this.logger.warn(`No max score found for concept ${conceptId}`);
                }
            } else {
                // Aucune évaluation pour ce concept
                conceptMastery[conceptId] = 0;
            }
        }

        return conceptMastery;
    }

    /**
     * @method savePerformance
     * @private
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} exerciseId - Identifiant de l'exercice
     * @param {number} score - Score normalisé
     * @param {Record<string, number>} conceptMastery - Niveaux de maîtrise des concepts
     * @returns {Promise<void>}
     * @description Sauvegarde les performances dans le référentiel
     */
    private async savePerformance(
        userId: string,
        exerciseId: string,
        score: number,
        conceptMastery: Record<string, number>
    ): Promise<void> {
        try {
            await this.userPerformanceRepository.recordExercisePerformance(
                userId,
                exerciseId,
                score,
                conceptMastery,
                new Date()
            );
        } catch (error) {
            this.logger.error(`Error saving performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Ne pas bloquer le processus si la sauvegarde échoue
        }
    }

    /**
     * @method identifyStrengths
     * @private
     * @param {Record<string, number>} conceptMastery - Niveaux de maîtrise des concepts
     * @returns {string[]} - Forces identifiées
     * @description Identifie les forces de l'utilisateur à partir des niveaux de maîtrise des concepts
     */
    private identifyStrengths(conceptMastery: Record<string, number>): string[] {
        // Seuil pour considérer un concept comme une force
        const strengthThreshold = 85;

        // Filtrer les concepts avec un score élevé
        return Object.entries(conceptMastery)
            .filter(([, score]) => score >= strengthThreshold)
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
        // Seuil pour considérer un concept comme une faiblesse
        const weaknessThreshold = 60;

        // Filtrer les concepts avec un score faible
        return Object.entries(conceptMastery)
            .filter(([, score]) => score < weaknessThreshold)
            .map(([conceptId]) => conceptId);
    }
}