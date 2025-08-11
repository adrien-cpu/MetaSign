/**
 * Stratégie de génération de contenu pour les exercices à choix multiples - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/content/strategies/MultipleChoiceStrategy.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/content/strategies
 * @description Génère du contenu spécialisé pour les exercices de type choix multiple
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import { CECRLLevel } from '../../types/ExerciseGeneratorTypes';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Type pour la difficulté des exercices
 */
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Interface pour le contenu d'exercice
 */
export interface ExerciseContent {
    readonly type: string;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Interface pour les réponses d'exercices
 */
export interface ExerciseResponse {
    readonly [key: string]: unknown;
}

/**
 * Interface pour la génération de concepts
 */
export interface ConceptGenerator {
    generateConceptsToTest(theme: string, excludedConcepts: readonly string[], count: number): string[];
    getStats?(): Record<string, unknown>;
    destroy?(): void;
}

/**
 * Interface pour le contenu d'exercice à choix multiples
 */
export interface MultipleChoiceContent extends ExerciseContent {
    readonly type: 'multiple-choice';
    readonly question: string;
    readonly options: readonly string[];
    readonly correctIndex: number;
    readonly instructions?: string;
}

/**
 * Interface commune pour toutes les stratégies
 */
export interface IContentGeneratorStrategy {
    generate(
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty,
        conceptGenerator: ConceptGenerator
    ): ExerciseContent;

    generateExpectedResponse(content: ExerciseContent): ExerciseResponse;

    validateResponse(
        content: ExerciseContent,
        expectedResponse: ExerciseResponse,
        studentResponse: ExerciseResponse
    ): number;

    readonly name?: string;
    readonly version?: string;

    getStats?(): StrategyMetrics;
}

/**
 * Interface pour les métriques de stratégie
 */
export interface StrategyMetrics {
    readonly totalGenerations: number;
    readonly totalValidations: number;
    readonly averageGenerationTime: number;
    readonly averageValidationTime: number;
    readonly successRate: number;
    readonly errorRate: number;
    readonly lastUsed: Date | null;
    readonly createdAt: Date;
}

/**
 * Configuration spécifique pour la stratégie Multiple Choice
 */
export interface MultipleChoiceConfig {
    readonly numberOfChoices?: number;
    readonly includeDistractors?: boolean;
    readonly randomizeOrder?: boolean;
    readonly includeNoneOption?: boolean;
    readonly enableMetrics?: boolean;
    readonly name?: string;
    readonly version?: string;
}

/**
 * Classe pour gérer les métriques modifiables en interne
 */
class MetricsManager {
    private _totalGenerations = 0;
    private _totalValidations = 0;
    private _averageGenerationTime = 0;
    private _averageValidationTime = 0;
    private _successRate = 0;
    private _errorRate = 0;
    private _lastUsed: Date | null = null;
    private readonly _createdAt = new Date();

    public incrementGenerations(): void {
        this._totalGenerations++;
        this._lastUsed = new Date();
    }

    public incrementValidations(): void {
        this._totalValidations++;
        this._lastUsed = new Date();
    }

    public updateGenerationTime(duration: number): void {
        this._averageGenerationTime =
            (this._averageGenerationTime * (this._totalGenerations - 1) + duration) /
            this._totalGenerations;
    }

    public updateSuccessRate(success: boolean): void {
        if (success) {
            this._successRate =
                (this._successRate * (this._totalGenerations - 1) + 1) /
                this._totalGenerations;
        } else {
            this._errorRate =
                (this._errorRate * (this._totalGenerations - 1) + 1) /
                this._totalGenerations;
        }
    }

    public getMetrics(): StrategyMetrics {
        return {
            totalGenerations: this._totalGenerations,
            totalValidations: this._totalValidations,
            averageGenerationTime: this._averageGenerationTime,
            averageValidationTime: this._averageValidationTime,
            successRate: this._successRate,
            errorRate: this._errorRate,
            lastUsed: this._lastUsed,
            createdAt: this._createdAt
        };
    }
}

/**
 * Stratégie pour générer du contenu de type choix multiple
 * Optimisée pour les exercices LSF avec adaptation au niveau CECRL
 */
export class MultipleChoiceStrategy implements IContentGeneratorStrategy {
    private readonly logger = LoggerFactory.getLogger('MultipleChoiceStrategy');
    private readonly metrics: MetricsManager;
    private readonly config: Required<MultipleChoiceConfig>;

    public readonly name = 'MultipleChoiceStrategy';
    public readonly version = '3.0.0';

    /**
     * Initialise la stratégie avec la configuration fournie
     */
    constructor(config: MultipleChoiceConfig = {}) {
        this.config = this.mergeWithDefaults(config);
        this.metrics = new MetricsManager();

        this.logger.debug('MultipleChoiceStrategy initialized', {
            config: this.config
        });
    }

    /**
     * Génère le contenu d'un exercice à choix multiples
     */
    public generate(
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty,
        conceptGenerator: ConceptGenerator
    ): ExerciseContent {
        const startTime = performance.now();

        try {
            this.logger.debug('Generating multiple choice content', { theme, level, difficulty });

            // Adapter le nombre de choix selon la difficulté et le niveau
            const numberOfChoices = this.calculateNumberOfChoices(level, difficulty);

            // Générer les concepts appropriés
            const concepts = conceptGenerator.generateConceptsToTest(theme, [], numberOfChoices);

            if (concepts.length === 0) {
                throw new Error(`No concepts generated for theme: ${theme}`);
            }

            // Sélectionner l'index correct
            const correctIndex = Math.floor(Math.random() * concepts.length);

            // Construire les options
            const options = this.buildOptions(concepts, correctIndex, level);

            // Générer la question adaptée au niveau
            const question = this.generateQuestion(theme, level);

            // Construire le contenu final
            const content: MultipleChoiceContent = {
                type: 'multiple-choice',
                question,
                options,
                correctIndex,
                instructions: this.generateInstructions(level),
                metadata: {
                    theme,
                    level,
                    difficulty,
                    generatedAt: new Date(),
                    strategy: this.name,
                    version: this.version
                }
            };

            // Mettre à jour les métriques
            if (this.config.enableMetrics) {
                this.metrics.incrementGenerations();
                this.metrics.updateGenerationTime(performance.now() - startTime);
                this.metrics.updateSuccessRate(true);
            }

            this.logger.debug('Multiple choice content generated successfully', {
                theme,
                optionsCount: options.length,
                correctIndex
            });

            return content;

        } catch (error) {
            if (this.config.enableMetrics) {
                this.metrics.incrementGenerations();
                this.metrics.updateGenerationTime(performance.now() - startTime);
                this.metrics.updateSuccessRate(false);
            }

            this.logger.error('Failed to generate multiple choice content', {
                theme,
                level,
                difficulty,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Génère la réponse attendue pour un exercice à choix multiples
     */
    public generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
        if (content.type !== 'multiple-choice') {
            throw new Error(`Invalid content type: ${content.type}. Expected: multiple-choice`);
        }

        const multipleChoiceContent = content as MultipleChoiceContent;

        if (typeof multipleChoiceContent.correctIndex !== 'number' ||
            multipleChoiceContent.correctIndex < 0) {
            throw new Error('Invalid correctIndex in multiple choice content');
        }

        return {
            correctAnswer: multipleChoiceContent.correctIndex,
            expectedType: 'multiple-choice',
            confidence: 1.0
        };
    }

    /**
     * Valide une réponse d'apprenant pour un exercice à choix multiples
     */
    public validateResponse(
        content: ExerciseContent,
        expectedResponse: ExerciseResponse,
        studentResponse: ExerciseResponse
    ): number {
        const startTime = performance.now();

        try {
            if (content.type !== 'multiple-choice') {
                return 0;
            }

            // Vérifier la présence des propriétés requises
            const hasExpectedAnswer = 'correctAnswer' in expectedResponse &&
                typeof expectedResponse.correctAnswer === 'number';

            const hasStudentAnswer = 'selectedIndex' in studentResponse &&
                typeof studentResponse.selectedIndex === 'number';

            if (!hasExpectedAnswer || !hasStudentAnswer) {
                this.logger.warn('Invalid response format', {
                    hasExpectedAnswer,
                    hasStudentAnswer
                });
                return 0;
            }

            // Comparer les réponses
            const isCorrect = expectedResponse.correctAnswer === studentResponse.selectedIndex;
            const score = isCorrect ? 1 : 0;

            if (this.config.enableMetrics) {
                this.metrics.incrementValidations();
            }

            this.logger.debug('Response validated', {
                expected: expectedResponse.correctAnswer,
                student: studentResponse.selectedIndex,
                score,
                validationTime: performance.now() - startTime
            });

            return score;

        } catch (error) {
            this.logger.error('Validation failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return 0;
        }
    }

    /**
     * Retourne les statistiques d'utilisation de la stratégie
     */
    public getStats(): StrategyMetrics {
        return this.metrics.getMetrics();
    }

    /**
     * Calcule le nombre de choix selon le niveau et la difficulté
     */
    private calculateNumberOfChoices(level: CECRLLevel, difficulty: ExerciseDifficulty): number {
        let baseChoices = this.config.numberOfChoices;

        // Adapter selon le niveau CECRL
        if (level === 'A1' || level === 'A2') {
            baseChoices = Math.max(3, baseChoices - 1);
        } else if (level === 'C1' || level === 'C2') {
            baseChoices = Math.min(6, baseChoices + 1);
        }

        // Adapter selon la difficulté
        if (difficulty === 'easy') {
            baseChoices = Math.max(3, baseChoices - 1);
        } else if (difficulty === 'hard') {
            baseChoices = Math.min(6, baseChoices + 1);
        }

        return baseChoices;
    }

    /**
     * Construit les options avec des distracteurs appropriés
     */
    private buildOptions(
        concepts: string[],
        correctIndex: number,
        level: CECRLLevel
    ): readonly string[] {
        const options: string[] = [...concepts];

        if (this.config.includeDistractors && level !== 'A1') {
            // Ajouter des distracteurs intelligents pour les niveaux avancés
            options.push('Aucune des réponses ci-dessus');
        }

        return Object.freeze(options);
    }

    /**
     * Génère une question adaptée au niveau
     */
    private generateQuestion(theme: string, level: CECRLLevel): string {
        const levelPrefix = level.substring(0, 1);
        const questionTemplates = {
            'A': `Quel signe correspond à "${theme}" ?`,
            'B': `Quelle est la signification du signe présenté pour "${theme}" ?`,
            'C': `Dans le contexte "${theme}", quel signe exprime le mieux l'idée présentée ?`
        };

        return questionTemplates[levelPrefix as keyof typeof questionTemplates] ||
            questionTemplates['A'];
    }

    /**
     * Génère les instructions selon le niveau
     */
    private generateInstructions(level: CECRLLevel): string {
        const baseInstructions = 'Sélectionnez la réponse qui correspond à la signification du signe.';

        if (level === 'A1' || level === 'A2') {
            return `${baseInstructions} Prenez votre temps pour observer la vidéo.`;
        }

        return baseInstructions;
    }

    /**
     * Fusionne la configuration fournie avec les valeurs par défaut
     */
    private mergeWithDefaults(config: MultipleChoiceConfig): Required<MultipleChoiceConfig> {
        return {
            name: config.name ?? this.name,
            version: config.version ?? this.version,
            enableMetrics: config.enableMetrics ?? true,
            numberOfChoices: config.numberOfChoices ?? 4,
            includeDistractors: config.includeDistractors ?? true,
            randomizeOrder: config.randomizeOrder ?? true,
            includeNoneOption: config.includeNoneOption ?? false
        };
    }
}

/**
 * Factory function pour créer une stratégie Multiple Choice
 */
export function createMultipleChoiceStrategy(
    config?: MultipleChoiceConfig
): MultipleChoiceStrategy {
    return new MultipleChoiceStrategy(config);
}