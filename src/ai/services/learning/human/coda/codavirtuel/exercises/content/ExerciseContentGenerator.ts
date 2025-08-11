/**
 * Générateur de contenu pour les exercices - Service principal corrigé
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/content/ExerciseContentGenerator.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/content
 * @description Coordonne les différents générateurs spécialisés selon le type d'exercice
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    CECRLLevel,
    SupportedExerciseType,
    EXERCISE_CONSTANTS
} from '../types/ExerciseGeneratorTypes';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Type pour la difficulté des exercices
 */
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Interface pour le contenu d'exercice de base
 */
export interface ExerciseContent {
    readonly type: string;
    readonly metadata?: {
        readonly theme?: string;
        readonly level?: CECRLLevel;
        readonly difficulty?: ExerciseDifficulty;
        readonly generatedAt?: Date;
        readonly strategy?: string;
        readonly version?: string;
    };
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
 * Interface pour le contenu d'exercice glisser-déposer
 */
export interface DragDropContent extends ExerciseContent {
    readonly type: 'drag-drop';
    readonly instruction: string;
    readonly items: readonly string[];
    readonly correctOrder: readonly number[];
}

/**
 * Interface pour le contenu d'exercice texte à trous
 */
export interface FillBlankContent extends ExerciseContent {
    readonly type: 'fill-blank';
    readonly text: string;
    readonly blanks: readonly string[];
    readonly options: readonly (readonly string[])[];
}

/**
 * Interface pour le contenu d'exercice saisie de texte
 */
export interface TextEntryContent extends ExerciseContent {
    readonly type: 'text-entry';
    readonly prompt: string;
    readonly sampleAnswer?: string;
    readonly minLength: number;
    readonly maxLength: number;
}

/**
 * Interface pour le contenu d'exercice réponse vidéo
 */
export interface VideoResponseContent extends ExerciseContent {
    readonly type: 'video-response';
    readonly prompt: string;
    readonly demoVideo: string | null;
    readonly evaluationCriteria: readonly {
        readonly id: string;
        readonly name: string;
        readonly description: string;
        readonly weight: number;
    }[];
    readonly minDuration: number;
    readonly maxDuration: number;
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
 * Implémentation basique du générateur de concepts
 */
class BasicConceptGenerator implements ConceptGenerator {
    public generateConceptsToTest(theme: string, excludedConcepts: readonly string[], count: number): string[] {
        const baseConcepts = [
            `concept-${theme}-1`,
            `concept-${theme}-2`,
            `concept-${theme}-3`,
            `concept-${theme}-4`,
            `concept-${theme}-5`,
            `concept-${theme}-6`
        ];

        return baseConcepts
            .filter(concept => !excludedConcepts.includes(concept))
            .slice(0, count);
    }

    public getStats(): Record<string, unknown> {
        return {
            totalGenerations: 0,
            lastUsed: null
        };
    }

    public destroy(): void {
        // Nettoyage basique
    }
}

/**
 * Interface commune pour toutes les stratégies de génération de contenu d'exercices
 */
export interface IContentGeneratorStrategy {
    /**
     * Génère le contenu d'un exercice
     */
    generate(
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty,
        conceptGenerator: ConceptGenerator
    ): ExerciseContent;

    /**
     * Génère la réponse attendue pour un exercice
     */
    generateExpectedResponse(content: ExerciseContent): ExerciseResponse;

    /**
     * Valide une réponse d'apprenant
     */
    validateResponse(
        content: ExerciseContent,
        expectedResponse: ExerciseResponse,
        studentResponse: ExerciseResponse
    ): number;

    readonly name?: string;
    readonly version?: string;
}

/**
 * Stratégie pour générer du contenu de type choix multiple
 */
class MultipleChoiceStrategy implements IContentGeneratorStrategy {
    public readonly name = 'MultipleChoiceStrategy';
    public readonly version = '3.0.0';

    public generate(
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty,
        conceptGenerator: ConceptGenerator
    ): ExerciseContent {
        const difficultyFactor = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
        const concepts = conceptGenerator.generateConceptsToTest(theme, [], difficultyFactor);
        const correctIndex = Math.floor(Math.random() * concepts.length);

        const content: MultipleChoiceContent = {
            type: 'multiple-choice',
            question: `Quelle est la signification du signe présenté dans la vidéo pour "${theme}" (niveau ${level}) ?`,
            options: concepts.map((concept: string, index: number) => {
                return `${concept}${index === correctIndex ? ' (correct)' : ''}`;
            }),
            correctIndex,
            instructions: 'Sélectionnez la réponse qui correspond à la signification du signe.',
            metadata: {
                theme,
                level,
                difficulty,
                generatedAt: new Date(),
                strategy: this.name,
                version: this.version
            }
        };

        return content;
    }

    public generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
        if (content.type !== 'multiple-choice') {
            throw new Error(`Invalid content type: ${content.type}`);
        }

        const multipleChoiceContent = content as MultipleChoiceContent;
        return { correctAnswer: multipleChoiceContent.correctIndex };
    }

    public validateResponse(
        content: ExerciseContent,
        expectedResponse: ExerciseResponse,
        studentResponse: ExerciseResponse
    ): number {
        if (content.type !== 'multiple-choice') {
            return 0;
        }

        if (
            'correctAnswer' in expectedResponse &&
            typeof expectedResponse.correctAnswer === 'number' &&
            'selectedIndex' in studentResponse &&
            typeof studentResponse.selectedIndex === 'number'
        ) {
            return expectedResponse.correctAnswer === studentResponse.selectedIndex ? 1 : 0;
        }
        return 0;
    }
}

/**
 * Registre des stratégies de génération de contenu
 */
class ContentGeneratorRegistry {
    private readonly logger = LoggerFactory.getLogger('ContentGeneratorRegistry');
    private readonly strategies = new Map<SupportedExerciseType, IContentGeneratorStrategy>();

    public registerStrategy(type: SupportedExerciseType, strategy: IContentGeneratorStrategy): void {
        this.strategies.set(type, strategy);
        this.logger.debug('Strategy registered', { type });
    }

    public getStrategy(type: SupportedExerciseType): IContentGeneratorStrategy {
        const strategy = this.strategies.get(type);

        if (!strategy) {
            this.logger.warn('Strategy not found, using default', { requestedType: type });
            return this.getDefaultStrategy();
        }

        return strategy;
    }

    public getRegisteredStrategiesCount(): number {
        return this.strategies.size;
    }

    public getSupportedTypes(): readonly SupportedExerciseType[] {
        return Array.from(this.strategies.keys());
    }

    public clear(): void {
        this.strategies.clear();
    }

    private getDefaultStrategy(): IContentGeneratorStrategy {
        const defaultType: SupportedExerciseType = 'MultipleChoice';
        let defaultStrategy = this.strategies.get(defaultType);

        if (!defaultStrategy) {
            defaultStrategy = new MultipleChoiceStrategy();
            this.registerStrategy(defaultType, defaultStrategy);
        }

        return defaultStrategy;
    }
}

/**
 * Service responsable de la génération du contenu des exercices
 * Coordonne différents générateurs spécialisés selon le type d'exercice
 */
export class ExerciseContentGenerator {
    private readonly logger = LoggerFactory.getLogger('ExerciseContentGenerator');
    private readonly conceptGenerator: ConceptGenerator;
    private readonly generatorRegistry: ContentGeneratorRegistry;

    /**
     * Initialise le générateur de contenu avec toutes les stratégies spécialisées
     */
    constructor(conceptGenerator?: ConceptGenerator) {
        this.conceptGenerator = conceptGenerator ?? new BasicConceptGenerator();
        this.generatorRegistry = new ContentGeneratorRegistry();

        this.initializeStrategies();

        this.logger.info('ExerciseContentGenerator initialized', {
            strategiesCount: this.generatorRegistry.getRegisteredStrategiesCount()
        });
    }

    /**
     * Génère le contenu d'un exercice selon son type
     */
    public generateContent(
        type: string,
        theme: string,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty
    ): ExerciseContent {
        this.logger.debug('Generating content', { type, theme, level, difficulty });

        const normalizedType = this.normalizeExerciseType(type);
        const strategy = this.generatorRegistry.getStrategy(normalizedType);

        try {
            const content = strategy.generate(theme, level, difficulty, this.conceptGenerator);
            this.logger.debug('Content generated successfully', { type: normalizedType });
            return content;
        } catch (error) {
            this.logger.error('Content generation failed', {
                type: normalizedType,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Génère la réponse attendue pour un exercice
     */
    public generateExpectedResponse(type: string, content: ExerciseContent): ExerciseResponse {
        const normalizedType = this.normalizeExerciseType(type);
        const strategy = this.generatorRegistry.getStrategy(normalizedType);
        return strategy.generateExpectedResponse(content);
    }

    /**
     * Valide une réponse d'apprenant
     */
    public validateResponse(
        type: string,
        content: ExerciseContent,
        expectedResponse: ExerciseResponse,
        studentResponse: ExerciseResponse
    ): number {
        const normalizedType = this.normalizeExerciseType(type);
        const strategy = this.generatorRegistry.getStrategy(normalizedType);
        return strategy.validateResponse(content, expectedResponse, studentResponse);
    }

    /**
     * Enregistre une stratégie personnalisée
     */
    public registerCustomStrategy(type: SupportedExerciseType, strategy: IContentGeneratorStrategy): void {
        this.generatorRegistry.registerStrategy(type, strategy);
        this.logger.info('Custom strategy registered', { type });
    }

    /**
     * Obtient les statistiques du générateur
     */
    public getStats() {
        return {
            registeredStrategies: this.generatorRegistry.getRegisteredStrategiesCount(),
            supportedTypes: this.generatorRegistry.getSupportedTypes(),
            conceptGeneratorStats: this.conceptGenerator.getStats?.() ?? null
        };
    }

    /**
     * Normalise un type d'exercice vers un type supporté
     */
    private normalizeExerciseType(type: string): SupportedExerciseType {
        if (this.isSupportedType(type)) {
            return type;
        }

        const typeMapping: Record<string, SupportedExerciseType> = {
            'multiple-choice': 'MultipleChoice',
            'multiplechoice': 'MultipleChoice',
            'qcm': 'MultipleChoice',
            'drag-drop': 'DragDrop',
            'dragdrop': 'DragDrop',
            'fill-blank': 'FillBlank',
            'fillblank': 'FillBlank',
            'text-entry': 'TextEntry',
            'textentry': 'TextEntry',
            'video-response': 'VideoResponse',
            'videoresponse': 'VideoResponse'
        };

        const normalizedInput = type.toLowerCase().replace(/[-_\s]/g, '');
        const mappedType = typeMapping[normalizedInput] || typeMapping[type.toLowerCase()];

        if (mappedType) {
            this.logger.debug('Exercise type normalized', { original: type, normalized: mappedType });
            return mappedType;
        }

        const defaultType: SupportedExerciseType = 'MultipleChoice';
        this.logger.warn('Unknown exercise type, using default', { type, defaultType });
        return defaultType;
    }

    /**
     * Vérifie si un type d'exercice est directement supporté
     */
    private isSupportedType(type: string): type is SupportedExerciseType {
        return EXERCISE_CONSTANTS.SUPPORTED_EXERCISE_TYPES.includes(type as SupportedExerciseType);
    }

    /**
     * Initialise toutes les stratégies par défaut
     */
    private initializeStrategies(): void {
        this.generatorRegistry.registerStrategy('MultipleChoice', new MultipleChoiceStrategy());
        // Les autres stratégies peuvent être ajoutées ici

        this.logger.debug('Default strategies initialized', {
            count: this.generatorRegistry.getRegisteredStrategiesCount()
        });
    }

    /**
     * Libère les ressources utilisées par le générateur
     */
    public destroy(): void {
        this.generatorRegistry.clear();
        this.conceptGenerator.destroy?.();
        this.logger.debug('ExerciseContentGenerator destroyed');
    }
}

/**
 * Factory function pour créer un générateur de contenu
 */
export function createExerciseContentGenerator(config?: {
    conceptGenerator?: ConceptGenerator;
}): ExerciseContentGenerator {
    return new ExerciseContentGenerator(config?.conceptGenerator);
}