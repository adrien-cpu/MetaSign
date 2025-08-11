/**
 * Exemple d'utilisation du service d'évaluation intégré au registre MetaSign
 * 
 * @file src/ai/services/learning/human/evaluation/examples/EvaluationServiceExample.ts
 * @description Exemple complet d'utilisation du service d'évaluation intégré au registre
 * Démontre l'enregistrement, l'utilisation et la gestion des services d'évaluation
 * @version 1.2.0
 * @author MetaSign Learning Module
 * @since 1.0.0
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { EvaluationServiceRegistration } from '@/ai/services/learning/human/evaluation/integration/EvaluationServiceRegistration';
import { ComprehensionEvaluator } from '../ComprehensionEvaluator';
import {
    ComprehensionEvaluationResult,
    Exercise,
    Submission,
    SessionContext,
    LearningGap,
    SubmissionEvaluationResult
} from '../types';

/**
 * @interface EvaluationConfig
 * @description Configuration pour le service d'évaluation
 */
interface EvaluationConfig {
    readonly confidenceThreshold: number;
    readonly masteryThreshold: number;
    readonly maxRecommendations: number;
}

/**
 * @interface ExampleExecutionResult
 * @description Résultat de l'exécution de l'exemple
 */
interface ExampleExecutionResult {
    readonly success: boolean;
    readonly serviceId?: string;
    readonly evaluationResult?: ComprehensionEvaluationResult;
    readonly submissionResult?: SubmissionEvaluationResult;
    readonly gaps?: ReadonlyArray<LearningGap>;
    readonly executionTime: number;
    readonly errors: ReadonlyArray<string>;
}

/**
 * @interface ExampleConfig
 * @description Configuration pour l'exemple d'évaluation
 */
interface ExampleConfig {
    readonly userId?: string;
    readonly courseId?: string;
    readonly enableDetailedLogging?: boolean;
    readonly includeSubmissionExample?: boolean;
    readonly includeGapAnalysis?: boolean;
    readonly evaluationConfig?: {
        readonly confidenceThreshold?: number;
        readonly masteryThreshold?: number;
        readonly maxRecommendations?: number;
    };
}

/**
 * @class EvaluationServiceExampleRunner
 * @description Classe pour exécuter des exemples d'utilisation du service d'évaluation
 */
export class EvaluationServiceExampleRunner {
    private readonly logger = LoggerFactory.getLogger('EvaluationServiceExample');
    private readonly config: Required<ExampleConfig>;
    private registry?: LearningServiceRegistry;
    private evaluationRegistration?: EvaluationServiceRegistration;

    /**
     * @constructor
     * @param {ExampleConfig} [config] - Configuration de l'exemple
     */
    constructor(config: ExampleConfig = {}) {
        this.config = Object.freeze({
            userId: config.userId ?? 'demo_user_123',
            courseId: config.courseId ?? 'course_lsf_intermediate',
            enableDetailedLogging: config.enableDetailedLogging ?? true,
            includeSubmissionExample: config.includeSubmissionExample ?? true,
            includeGapAnalysis: config.includeGapAnalysis ?? true,
            evaluationConfig: {
                confidenceThreshold: config.evaluationConfig?.confidenceThreshold ?? 0.7,
                masteryThreshold: config.evaluationConfig?.masteryThreshold ?? 80,
                maxRecommendations: config.evaluationConfig?.maxRecommendations ?? 5
            }
        });
    }

    /**
     * @method runExample
     * @async
     * @returns {Promise<ExampleExecutionResult>} - Résultat de l'exécution
     * @description Exécute l'exemple complet du service d'évaluation
     */
    public async runExample(): Promise<ExampleExecutionResult> {
        const startTime = Date.now();
        const errors: string[] = [];

        this.logger.info('🚀 Starting comprehensive evaluation service example...');

        try {
            // 1. Initialisation et enregistrement du service
            const serviceId = await this.initializeService();
            this.logStep('Service initialization', 'completed', { serviceId });

            // 2. Récupération et validation du service
            const evaluatorService = await this.getAndValidateService(serviceId);
            this.logStep('Service retrieval', 'completed');

            // 3. Évaluation de la compréhension utilisateur
            const evaluationResult = await this.runComprehensionEvaluation(evaluatorService);
            this.logStep('Comprehension evaluation', 'completed', {
                globalScore: evaluationResult.globalScore,
                comprehensionLevel: evaluationResult.comprehensionLevel
            });

            // 4. Évaluation de soumission (optionnel)
            let submissionResult: SubmissionEvaluationResult | undefined;
            if (this.config.includeSubmissionExample) {
                submissionResult = await this.runSubmissionEvaluation(evaluatorService);
                this.logStep('Submission evaluation', 'completed', {
                    score: submissionResult.score,
                    isCorrect: submissionResult.isCorrect
                });
            }

            // 5. Analyse des lacunes (optionnel)
            let gaps: ReadonlyArray<LearningGap> | undefined;
            if (this.config.includeGapAnalysis) {
                gaps = await this.runGapAnalysis(evaluatorService);
                this.logStep('Gap analysis', 'completed', { gapsCount: gaps.length });
            }

            // 6. Nettoyage et désenregistrement
            await this.cleanup();
            this.logStep('Service cleanup', 'completed');

            const executionTime = Date.now() - startTime;
            this.logger.info(`✅ Example execution completed successfully in ${executionTime}ms`);

            return {
                success: true,
                serviceId,
                evaluationResult,
                submissionResult,
                gaps,
                executionTime,
                errors: Object.freeze([])
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            errors.push(errorMessage);
            this.logger.error(`❌ Example execution failed: ${errorMessage}`, { error });

            // Tentative de nettoyage en cas d'erreur
            try {
                await this.cleanup();
            } catch (cleanupError) {
                this.logger.warn('Failed to cleanup after error', { cleanupError });
            }

            return {
                success: false,
                executionTime: Date.now() - startTime,
                errors: Object.freeze(errors)
            };
        }
    }

    /**
     * @method initializeService
     * @async
     * @private
     * @returns {Promise<string>} - ID du service enregistré
     * @description Initialise et enregistre le service d'évaluation
     */
    private async initializeService(): Promise<string> {
        this.registry = LearningServiceRegistry.getInstance();

        if (!this.registry) {
            throw new Error('Failed to get LearningServiceRegistry instance');
        }

        this.evaluationRegistration = new EvaluationServiceRegistration(this.registry);

        // Construction d'une configuration complète avec des valeurs par défaut
        const completeConfig: EvaluationConfig = {
            confidenceThreshold: this.config.evaluationConfig.confidenceThreshold ?? 0.7,
            masteryThreshold: this.config.evaluationConfig.masteryThreshold ?? 80,
            maxRecommendations: this.config.evaluationConfig.maxRecommendations ?? 5
        };

        const serviceId = await this.evaluationRegistration.registerEvaluationService(completeConfig);

        if (!serviceId) {
            throw new Error('Failed to register evaluation service');
        }

        return serviceId;
    }

    /**
     * @method getAndValidateService
     * @async
     * @private
     * @param {string} serviceId - ID du service
     * @returns {Promise<ComprehensionEvaluator>} - Service d'évaluation
     * @description Récupère et valide le service d'évaluation
     */
    private async getAndValidateService(serviceId: string): Promise<ComprehensionEvaluator> {
        if (!this.registry) {
            throw new Error('Registry not initialized');
        }

        const evaluatorService = await this.registry.getService(serviceId) as ComprehensionEvaluator;

        if (!evaluatorService) {
            throw new Error(`Failed to retrieve evaluation service with ID: ${serviceId}`);
        }

        // Validation que le service implémente les méthodes attendues
        const requiredMethods = ['evaluateUserComprehension', 'evaluateSubmission', 'identifyLearningGaps'];
        for (const method of requiredMethods) {
            if (typeof (evaluatorService as unknown as Record<string, unknown>)[method] !== 'function') {
                throw new Error(`Service does not implement required method: ${method}`);
            }
        }

        return evaluatorService;
    }

    /**
     * @method runComprehensionEvaluation
     * @async
     * @private
     * @param {ComprehensionEvaluator} evaluatorService - Service d'évaluation
     * @returns {Promise<ComprehensionEvaluationResult>} - Résultat de l'évaluation
     * @description Exécute l'évaluation de compréhension utilisateur
     */
    private async runComprehensionEvaluation(
        evaluatorService: ComprehensionEvaluator
    ): Promise<ComprehensionEvaluationResult> {
        this.logger.info(`📊 Evaluating comprehension for user ${this.config.userId} in course ${this.config.courseId}...`);

        const evaluationResult = await evaluatorService.evaluateUserComprehension(
            this.config.userId,
            this.config.courseId
        );

        this.validateEvaluationResult(evaluationResult);

        // Affichage détaillé des résultats
        if (this.config.enableDetailedLogging) {
            this.logEvaluationDetails(evaluationResult);
        }

        return evaluationResult;
    }

    /**
     * @method runSubmissionEvaluation
     * @async
     * @private
     * @param {ComprehensionEvaluator} evaluatorService - Service d'évaluation
     * @returns {Promise<SubmissionEvaluationResult>} - Résultat de l'évaluation de soumission
     * @description Exécute l'évaluation d'une soumission d'exercice
     */
    private async runSubmissionEvaluation(
        evaluatorService: ComprehensionEvaluator
    ): Promise<SubmissionEvaluationResult> {
        const mockExercise = this.createMockExercise();
        const mockSubmission = this.createMockSubmission();
        const sessionContext = this.createSessionContext();

        this.logger.info('📝 Evaluating mock submission...');

        const submissionResult = await evaluatorService.evaluateSubmission(
            mockExercise,
            mockSubmission,
            sessionContext
        );

        this.validateSubmissionResult(submissionResult);

        if (this.config.enableDetailedLogging) {
            this.logSubmissionDetails(submissionResult);
        }

        return submissionResult;
    }

    /**
     * @method runGapAnalysis
     * @async
     * @private
     * @param {ComprehensionEvaluator} evaluatorService - Service d'évaluation
     * @returns {Promise<ReadonlyArray<LearningGap>>} - Lacunes identifiées
     * @description Exécute l'analyse des lacunes d'apprentissage
     */
    private async runGapAnalysis(
        evaluatorService: ComprehensionEvaluator
    ): Promise<ReadonlyArray<LearningGap>> {
        this.logger.info('🔍 Identifying learning gaps...');

        const gaps = await evaluatorService.identifyLearningGaps(this.config.userId);

        if (this.config.enableDetailedLogging && gaps.length > 0) {
            this.logGapAnalysisDetails(gaps);
        }

        return Object.freeze([...gaps]);
    }

    /**
     * @method cleanup
     * @async
     * @private
     * @description Nettoie les ressources et désenregistre le service
     */
    private async cleanup(): Promise<void> {
        if (this.evaluationRegistration) {
            const unregistered = await this.evaluationRegistration.unregisterService();
            this.logger.info(`🧹 Service cleanup completed: ${unregistered ? 'success' : 'partial'}`);
        }
    }

    /**
     * @method createMockExercise
     * @private
     * @returns {Exercise} - Exercice de démonstration
     * @description Crée un exercice de démonstration pour l'exemple
     */
    private createMockExercise(): Exercise {
        return {
            id: 'exercise_demo_123',
            type: 'multiple_choice',
            difficulty: 'intermediate',
            concepts: ['concept_classifiers', 'concept_verb_agreement', 'concept_spatial_reference'],
            expectedAnswers: [
                {
                    id: 'q1_classifiers',
                    conceptId: 'concept_classifiers',
                    answer: 'b',
                    answerType: 'multiple_choice',
                    points: 2
                },
                {
                    id: 'q2_verb_agreement',
                    conceptId: 'concept_verb_agreement',
                    answer: ['a', 'c'],
                    answerType: 'multiple_choice',
                    points: 3
                },
                {
                    id: 'q3_spatial_reference',
                    conceptId: 'concept_spatial_reference',
                    answer: 'spatial_front_left',
                    answerType: 'spatial_selection',
                    points: 4
                }
            ]
        };
    }

    /**
     * @method createMockSubmission
     * @private
     * @returns {Submission} - Soumission de démonstration
     * @description Crée une soumission de démonstration pour l'exemple
     */
    private createMockSubmission(): Submission {
        return {
            id: 'submission_demo_456',
            exerciseId: 'exercise_demo_123',
            userId: this.config.userId,
            submittedAt: new Date(),
            answers: [
                {
                    questionId: 'q1_classifiers',
                    value: 'b' // Réponse correcte
                },
                {
                    questionId: 'q2_verb_agreement',
                    value: ['a', 'd'] // Partiellement correcte
                },
                {
                    questionId: 'q3_spatial_reference',
                    value: 'spatial_front_right' // Réponse incorrecte
                }
            ],
            timeSpent: 180 // 3 minutes
        };
    }

    /**
     * @method createSessionContext
     * @private
     * @returns {SessionContext} - Contexte de session pour la démonstration
     * @description Crée un contexte de session pour l'exemple
     */
    private createSessionContext(): SessionContext {
        return {
            userId: this.config.userId,
            sessionId: `session_${Date.now()}`,
            courseId: this.config.courseId,
            deviceInfo: {
                type: 'desktop',
                browser: 'chrome',
                os: 'linux'
            }
        };
    }

    /**
     * @method validateEvaluationResult
     * @private
     * @param {ComprehensionEvaluationResult} result - Résultat à valider
     * @throws {Error} Si le résultat est invalide
     * @description Valide le résultat d'évaluation de compréhension
     */
    private validateEvaluationResult(result: ComprehensionEvaluationResult): void {
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid evaluation result: result is null or not an object');
        }

        if (typeof result.globalScore !== 'number' || result.globalScore < 0 || result.globalScore > 100) {
            throw new Error('Invalid evaluation result: globalScore must be between 0 and 100');
        }

        if (!result.comprehensionLevel || typeof result.comprehensionLevel !== 'string') {
            throw new Error('Invalid evaluation result: comprehensionLevel is required');
        }

        if (!Array.isArray(result.strengths) || !Array.isArray(result.weaknesses)) {
            throw new Error('Invalid evaluation result: strengths and weaknesses must be arrays');
        }
    }

    /**
     * @method validateSubmissionResult
     * @private
     * @param {SubmissionEvaluationResult} result - Résultat à valider
     * @throws {Error} Si le résultat est invalide
     * @description Valide le résultat d'évaluation de soumission
     */
    private validateSubmissionResult(result: SubmissionEvaluationResult): void {
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid submission result: result is null or not an object');
        }

        if (typeof result.score !== 'number' || result.score < 0) {
            throw new Error('Invalid submission result: score must be a non-negative number');
        }

        if (typeof result.isCorrect !== 'boolean') {
            throw new Error('Invalid submission result: isCorrect must be a boolean');
        }
    }

    /**
     * @method logEvaluationDetails
     * @private
     * @param {ComprehensionEvaluationResult} result - Résultat d'évaluation
     * @description Log les détails de l'évaluation de compréhension
     */
    private logEvaluationDetails(result: ComprehensionEvaluationResult): void {
        this.logger.info('📈 Evaluation Results Details:', {
            globalScore: result.globalScore,
            comprehensionLevel: result.comprehensionLevel,
            strengthsCount: result.strengths.length,
            weaknessesCount: result.weaknesses.length,
            gapsCount: result.gaps.length,
            recommendationsCount: result.recommendations.length
        });

        if (result.strengths.length > 0) {
            this.logger.info(`💪 Strengths: ${result.strengths.join(', ')}`);
        }

        if (result.weaknesses.length > 0) {
            this.logger.info(`⚠️ Weaknesses: ${result.weaknesses.join(', ')}`);
        }
    }

    /**
     * @method logSubmissionDetails
     * @private
     * @param {SubmissionEvaluationResult} result - Résultat de soumission
     * @description Log les détails de l'évaluation de soumission
     */
    private logSubmissionDetails(result: SubmissionEvaluationResult): void {
        this.logger.info('📝 Submission Results Details:', {
            score: result.score,
            isCorrect: result.isCorrect,
            recommendedDifficulty: result.recommendedDifficulty
        });
    }

    /**
     * @method logGapAnalysisDetails
     * @private
     * @param {ReadonlyArray<LearningGap>} gaps - Lacunes identifiées
     * @description Log les détails de l'analyse des lacunes
     */
    private logGapAnalysisDetails(gaps: ReadonlyArray<LearningGap>): void {
        this.logger.info(`🔍 Gap Analysis Details: ${gaps.length} gaps identified`);

        gaps.forEach((gap, index) => {
            // Vérification de l'existence de la propriété severity avant utilisation
            const severity = 'severity' in gap ? (gap as LearningGap & { severity: number }).severity : 'unknown';
            this.logger.info(`Gap ${index + 1}: ${gap.conceptId} (Priority: ${gap.priority}, Severity: ${severity})`);
        });
    }

    /**
     * @method logStep
     * @private
     * @param {string} step - Nom de l'étape
     * @param {string} status - Statut de l'étape
     * @param {Record<string, unknown>} [details] - Détails additionnels
     * @description Log une étape de l'exécution
     */
    private logStep(step: string, status: string, details?: Record<string, unknown>): void {
        const message = `${step}: ${status}`;
        if (this.config.enableDetailedLogging && details) {
            this.logger.info(message, details);
        } else {
            this.logger.info(message);
        }
    }
}

/**
 * @function evaluationServiceExample
 * @async
 * @param {ExampleConfig} [config] - Configuration de l'exemple
 * @returns {Promise<ExampleExecutionResult>} - Résultat de l'exécution
 * @description Fonction principale pour exécuter l'exemple du service d'évaluation
 */
export async function evaluationServiceExample(config?: ExampleConfig): Promise<ExampleExecutionResult> {
    const runner = new EvaluationServiceExampleRunner(config);
    return runner.runExample();
}

/**
 * @function runQuickExample
 * @async
 * @returns {Promise<void>} - Promise de l'exécution
 * @description Exécute un exemple rapide avec configuration par défaut
 */
export async function runQuickExample(): Promise<void> {
    try {
        const result = await evaluationServiceExample({
            enableDetailedLogging: true,
            includeSubmissionExample: true,
            includeGapAnalysis: true
        });

        if (result.success) {
            console.log(`✅ Quick example completed successfully in ${result.executionTime}ms`);
        } else {
            console.error(`❌ Quick example failed: ${result.errors.join(', ')}`);
        }
    } catch (error) {
        console.error('🚨 Unhandled error in quick example:', error);
    }
}

/**
 * @function runCustomExample
 * @async
 * @param {string} userId - ID utilisateur personnalisé
 * @param {string} courseId - ID cours personnalisé
 * @returns {Promise<ExampleExecutionResult>} - Résultat de l'exécution
 * @description Exécute un exemple avec des paramètres personnalisés
 */
export async function runCustomExample(userId: string, courseId: string): Promise<ExampleExecutionResult> {
    if (!userId?.trim()) {
        throw new Error('userId is required and cannot be empty');
    }

    if (!courseId?.trim()) {
        throw new Error('courseId is required and cannot be empty');
    }

    return evaluationServiceExample({
        userId,
        courseId,
        enableDetailedLogging: true,
        evaluationConfig: {
            confidenceThreshold: 0.8,
            masteryThreshold: 85,
            maxRecommendations: 8
        }
    });
}

// Exécution par défaut si le module est exécuté directement
if (require.main === module) {
    runQuickExample().catch(error => {
        console.error('🚨 Fatal error in evaluation service example:', error);
        process.exit(1);
    });
}