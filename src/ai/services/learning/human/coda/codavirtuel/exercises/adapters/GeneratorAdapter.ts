/**
 * Adaptateur pour intégrer les générateurs existants avec l'interface commune
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/adapters/GeneratorAdapter.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/adapters
 * @description Adapte les générateurs legacy vers l'interface commune du système
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0 - Corrigé pour TypeScript strict
 * @since 2024
 * @lastModified 2025-07-21
 */

import {
    ExerciseGeneratorInterface,
    LegacyGeneratorInterface,
    ExerciseGenerationParams,
    EvaluationResult,
    GeneratorAdapterConfig,
    ExerciseTypeUtils
} from '../types/ExerciseGeneratorTypes';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Adaptateur pour intégrer les générateurs existants avec l'interface commune
 * Utilise des génériques pour une meilleure sécurité de type
 */
export class GeneratorAdapter<TExercise = unknown, TResponse = unknown>
    implements ExerciseGeneratorInterface<TExercise, TResponse> {

    private readonly logger = LoggerFactory.getLogger('GeneratorAdapter');
    private readonly generator: LegacyGeneratorInterface;
    private readonly paramAdapter?: (params: ExerciseGenerationParams) => unknown;
    private readonly resultAdapter?: (result: unknown) => EvaluationResult;

    /**
     * Constructeur de l'adaptateur
     * @param generator Générateur legacy à adapter
     * @param config Configuration de l'adaptateur (optionnelle)
     */
    constructor(
        generator: LegacyGeneratorInterface,
        config?: Omit<GeneratorAdapterConfig, 'type' | 'generator'>
    ) {
        this.generator = generator;
        this.paramAdapter = config?.paramAdapter;
        this.resultAdapter = config?.resultAdapter;

        this.logger.debug('GeneratorAdapter initialized', {
            hasParamAdapter: Boolean(this.paramAdapter),
            hasResultAdapter: Boolean(this.resultAdapter)
        });
    }

    /**
     * Génère un exercice en adaptant les paramètres
     * @param params Paramètres de génération standardisés
     * @returns Exercice généré
     * @throws {Error} Si la génération échoue
     */
    public async generate(params: ExerciseGenerationParams): Promise<TExercise> {
        this.logger.debug('Generating exercise via adapter', {
            type: params.type,
            level: params.level,
            difficulty: params.difficulty
        });

        try {
            // Valider les paramètres d'entrée
            this.validateGenerationParams(params);

            // Adapter les paramètres selon le générateur spécifique
            const adaptedParams = this.paramAdapter
                ? this.paramAdapter(params)
                : this.defaultParamAdapter(params);

            // Appeler le générateur legacy
            const result = await this.generator.generate(adaptedParams);

            // Valider le résultat
            this.validateGeneratedResult(result);

            this.logger.debug('Exercise generated successfully via adapter', {
                type: params.type,
                hasContent: Boolean(result)
            });

            return result as TExercise;
        } catch (error) {
            this.logger.error('Failed to generate exercise via adapter', {
                type: params.type,
                level: params.level,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    /**
     * Évalue une réponse en adaptant le résultat
     * @param exercise Exercice à évaluer
     * @param response Réponse de l'utilisateur
     * @returns Résultat d'évaluation standardisé
     * @throws {Error} Si l'évaluation échoue
     */
    public evaluate(exercise: TExercise, response: TResponse): EvaluationResult {
        this.logger.debug('Evaluating response via adapter', {
            hasExercise: Boolean(exercise),
            hasResponse: Boolean(response)
        });

        try {
            // Valider les paramètres d'entrée
            this.validateEvaluationParams(exercise, response);

            // Appeler le générateur legacy pour évaluation
            const result = this.generator.evaluate(exercise, response);

            // Adapter le résultat vers l'interface standardisée
            const adaptedResult = this.resultAdapter
                ? this.resultAdapter(result)
                : this.defaultResultAdapter(result);

            // Valider le résultat adapté
            this.validateEvaluationResult(adaptedResult);

            this.logger.debug('Response evaluated successfully via adapter', {
                correct: adaptedResult.correct,
                score: adaptedResult.score
            });

            return adaptedResult;
        } catch (error) {
            this.logger.error('Failed to evaluate response via adapter', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    /**
     * Adaptateur de paramètres par défaut
     * @param params Paramètres génériques
     * @returns Paramètres adaptés
     * @private
     */
    private defaultParamAdapter(params: ExerciseGenerationParams): unknown {
        return {
            level: params.level,
            difficulty: params.difficulty,
            focusAreas: params.focusAreas ? [...params.focusAreas] : undefined,
            userId: params.userId,
            ...params.typeSpecificParams
        };
    }

    /**
     * Adaptateur de résultat par défaut
     * @param result Résultat spécifique du générateur
     * @returns Résultat adapté vers l'interface commune
     * @private
     */
    private defaultResultAdapter(result: unknown): EvaluationResult {
        if (this.isValidEvaluationResult(result)) {
            return {
                correct: Boolean(result.correct),
                score: ExerciseTypeUtils.normalizeScore(result.score),
                explanation: result.explanation ? String(result.explanation) : undefined,
                details: this.extractDetails(result),
                feedback: this.extractFeedback(result)
            };
        }

        // Fallback pour résultats non structurés
        this.logger.warn('Invalid evaluation result, using fallback', { result });
        return {
            correct: false,
            score: 0,
            explanation: 'Résultat d\'évaluation non valide'
        };
    }

    /**
     * Valide les paramètres de génération
     * @param params Paramètres à valider
     * @throws {Error} Si les paramètres sont invalides
     * @private
     */
    private validateGenerationParams(params: ExerciseGenerationParams): void {
        if (!ExerciseTypeUtils.validateGenerationParams(params)) {
            throw new Error(`Invalid generation parameters: ${JSON.stringify(params)}`);
        }
    }

    /**
     * Valide le résultat généré
     * @param result Résultat à valider
     * @throws {Error} Si le résultat est invalide
     * @private
     */
    private validateGeneratedResult(result: unknown): void {
        if (!result || typeof result !== 'object') {
            throw new Error('Generated exercise must be an object');
        }

        if (!ExerciseTypeUtils.hasValidId(result)) {
            throw new Error('Generated exercise must have a valid id property');
        }
    }

    /**
     * Valide les paramètres d'évaluation
     * @param exercise Exercice à valider
     * @param response Réponse à valider
     * @throws {Error} Si les paramètres sont invalides
     * @private
     */
    private validateEvaluationParams(exercise: TExercise, response: TResponse): void {
        if (!exercise) {
            throw new Error('Exercise is required for evaluation');
        }

        if (response === undefined || response === null) {
            throw new Error('Response is required for evaluation');
        }
    }

    /**
     * Valide le résultat d'évaluation
     * @param result Résultat à valider
     * @throws {Error} Si le résultat est invalide
     * @private
     */
    private validateEvaluationResult(result: EvaluationResult): void {
        if (typeof result.correct !== 'boolean') {
            throw new Error('Evaluation result must have a boolean correct property');
        }

        if (typeof result.score !== 'number' || isNaN(result.score)) {
            throw new Error('Evaluation result must have a valid numeric score');
        }

        if (result.score < 0 || result.score > 1) {
            throw new Error('Evaluation score must be between 0 and 1');
        }
    }

    /**
     * Vérifie si un résultat d'évaluation est valide
     * @param result Résultat à vérifier
     * @returns True si le résultat est valide
     * @private
     */
    private isValidEvaluationResult(result: unknown): result is Record<string, unknown> {
        return ExerciseTypeUtils.isValidEvaluationResult(result);
    }

    /**
     * Extrait les détails du résultat d'évaluation
     * @param result Résultat brut
     * @returns Détails extraits
     * @private
     */
    private extractDetails(result: Record<string, unknown>): Readonly<Record<string, unknown>> | undefined {
        if (result.details && typeof result.details === 'object' && result.details !== null) {
            return result.details as Readonly<Record<string, unknown>>;
        }
        return undefined;
    }

    /**
     * Extrait le feedback du résultat d'évaluation
     * @param result Résultat brut
     * @returns Feedback extrait
     * @private
     */
    private extractFeedback(result: Record<string, unknown>): EvaluationResult['feedback'] {
        if (result.feedback && typeof result.feedback === 'object' && result.feedback !== null) {
            const feedback = result.feedback as Record<string, unknown>;

            return {
                strengths: this.extractStringArray(feedback.strengths),
                areasForImprovement: this.extractStringArray(feedback.areasForImprovement),
                nextSteps: this.extractStringArray(feedback.nextSteps)
            };
        }
        return undefined;
    }

    /**
     * Extrait un tableau de chaînes de caractères
     * @param value Valeur à extraire
     * @returns Tableau de chaînes ou tableau vide
     * @private
     */
    private extractStringArray(value: unknown): readonly string[] {
        if (Array.isArray(value)) {
            // ✅ CORRECTION : Filtrer et typer explicitement pour éviter les erreurs TypeScript
            const stringItems: string[] = [];

            for (const item of value) {
                if (typeof item === 'string') {
                    const trimmedItem = item.trim();
                    if (trimmedItem.length > 0) {
                        stringItems.push(trimmedItem);
                    }
                }
            }

            return stringItems;
        }
        return [];
    }
}

/**
 * Factory pour créer des adaptateurs configurés
 */
export class GeneratorAdapterFactory {
    private static readonly logger = LoggerFactory.getLogger('GeneratorAdapterFactory');

    /**
     * Crée un adaptateur pour un générateur spécifique
     * @param config Configuration de l'adaptateur
     * @returns Adaptateur configuré
     */
    public static createAdapter<TExercise = unknown, TResponse = unknown>(
        config: GeneratorAdapterConfig
    ): GeneratorAdapter<TExercise, TResponse> {
        this.logger.debug('Creating generator adapter', {
            type: config.type,
            hasParamAdapter: Boolean(config.paramAdapter),
            hasResultAdapter: Boolean(config.resultAdapter)
        });

        return new GeneratorAdapter<TExercise, TResponse>(
            config.generator,
            {
                paramAdapter: config.paramAdapter,
                resultAdapter: config.resultAdapter
            }
        );
    }

    /**
     * Crée un adaptateur simple sans configuration avancée
     * @param generator Générateur legacy
     * @returns Adaptateur simple
     */
    public static createSimpleAdapter<TExercise = unknown, TResponse = unknown>(
        generator: LegacyGeneratorInterface
    ): GeneratorAdapter<TExercise, TResponse> {
        this.logger.debug('Creating simple generator adapter');
        return new GeneratorAdapter<TExercise, TResponse>(generator);
    }
}