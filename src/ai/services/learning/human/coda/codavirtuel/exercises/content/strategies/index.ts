/**
 * Point d'entrée centralisé pour les stratégies - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/content/strategies/index.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/content/strategies
 * @description Exports centralisés pour toutes les stratégies et interfaces
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import { CECRLLevel } from '../../types/ExerciseGeneratorTypes';

// ===== TYPES LOCAUX =====

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
}

/**
 * Interface commune pour toutes les stratégies de génération de contenu
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
}

// ===== REGISTRY =====
export { ContentGeneratorRegistry } from './ContentGeneratorRegistry';

// ===== FACTORY FUNCTIONS =====

/**
 * Crée une stratégie pour les exercices de type glisser-déposer
 */
export function createDragDropStrategy(): IContentGeneratorStrategy {
    return {
        name: 'DragDropStrategy',
        version: '3.0.0',

        generate(theme: string, level: CECRLLevel, difficulty: ExerciseDifficulty, conceptGenerator: ConceptGenerator): ExerciseContent {
            const itemCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
            const concepts = conceptGenerator.generateConceptsToTest(theme, [], itemCount);
            const correctOrder: number[] = Array.from({ length: concepts.length }, (_, i) => i);

            return {
                type: 'drag-drop',
                metadata: {
                    instruction: `Placez les éléments dans le bon ordre pour "${theme}" (niveau ${level})`,
                    items: concepts,
                    correctOrder,
                    theme,
                    level,
                    difficulty,
                    generatedAt: new Date()
                }
            };
        },

        generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
            if (content.type !== 'drag-drop') {
                throw new Error(`Invalid content type: ${content.type}`);
            }

            const correctOrder = content.metadata?.correctOrder as number[] || [];
            return { order: [...correctOrder] };
        },

        validateResponse(content: ExerciseContent, expectedResponse: ExerciseResponse, studentResponse: ExerciseResponse): number {
            if (content.type !== 'drag-drop') return 0;

            const hasValidResponses = 'order' in expectedResponse &&
                Array.isArray(expectedResponse.order) &&
                'order' in studentResponse &&
                Array.isArray(studentResponse.order);

            if (!hasValidResponses) return 0;

            const expected = expectedResponse.order as number[];
            const provided = studentResponse.order as number[];

            if (expected.length !== provided.length || expected.length === 0) {
                return 0;
            }

            let correctCount = 0;
            for (let i = 0; i < expected.length; i++) {
                if (expected[i] === provided[i]) {
                    correctCount++;
                }
            }

            return correctCount / expected.length;
        }
    };
}

/**
 * Crée une stratégie pour les exercices de type texte à trous
 */
export function createFillBlankStrategy(): IContentGeneratorStrategy {
    return {
        name: 'FillBlankStrategy',
        version: '3.0.0',

        generate(theme: string, level: CECRLLevel, difficulty: ExerciseDifficulty, conceptGenerator: ConceptGenerator): ExerciseContent {
            const blankCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
            const concepts = conceptGenerator.generateConceptsToTest(theme, [], blankCount);
            const blanksMarker = concepts.map(() => '___').join(', ');

            return {
                type: 'fill-blank',
                metadata: {
                    text: `Complétez le texte sur le thème ${theme} (niveau ${level}) avec les mots appropriés: ${blanksMarker}`,
                    blanks: concepts,
                    options: [concepts],
                    theme,
                    level,
                    difficulty,
                    generatedAt: new Date()
                }
            };
        },

        generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
            if (content.type !== 'fill-blank') {
                throw new Error(`Invalid content type: ${content.type}`);
            }

            const blanks = content.metadata?.blanks as string[] || [];
            return { filledBlanks: [...blanks] };
        },

        validateResponse(content: ExerciseContent, expectedResponse: ExerciseResponse, studentResponse: ExerciseResponse): number {
            if (content.type !== 'fill-blank') return 0;

            const hasValidResponses = 'filledBlanks' in expectedResponse &&
                Array.isArray(expectedResponse.filledBlanks) &&
                'filledBlanks' in studentResponse &&
                Array.isArray(studentResponse.filledBlanks);

            if (!hasValidResponses) return 0;

            const expected = expectedResponse.filledBlanks as string[];
            const provided = studentResponse.filledBlanks as string[];

            if (expected.length === 0 || provided.length === 0 || expected.length !== provided.length) {
                return 0;
            }

            let correctCount = 0;
            for (let i = 0; i < expected.length; i++) {
                if (expected[i].toLowerCase() === provided[i].toLowerCase()) {
                    correctCount++;
                }
            }

            return correctCount / expected.length;
        }
    };
}

/**
 * Crée une stratégie pour les exercices de saisie de texte
 */
export function createTextEntryStrategy(): IContentGeneratorStrategy {
    return {
        name: 'TextEntryStrategy',
        version: '3.0.0',

        generate(theme: string, level: CECRLLevel, difficulty: ExerciseDifficulty, conceptGenerator: ConceptGenerator): ExerciseContent {
            const minLength = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;
            const maxLength = minLength * 5;
            const keywords = conceptGenerator.generateConceptsToTest(theme, [], 3);

            return {
                type: 'text-entry',
                metadata: {
                    prompt: `Pour un apprenant de niveau ${level}, décrivez en quelques phrases ce que vous savez sur "${theme}".`,
                    sampleAnswer: `Voici une réponse type concernant "${theme}"... (utilisez les mots-clés: ${keywords.join(', ')})`,
                    minLength,
                    maxLength,
                    theme,
                    level,
                    difficulty,
                    generatedAt: new Date()
                }
            };
        },

        generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
            if (content.type !== 'text-entry') {
                throw new Error(`Invalid content type: ${content.type}`);
            }

            const sampleAnswer = content.metadata?.sampleAnswer as string || '';
            const keywordsMatch = sampleAnswer.match(/mots-clés: (.*?)\)/);

            if (keywordsMatch && keywordsMatch[1]) {
                const keywords = keywordsMatch[1].split(',').map((k: string) => k.trim());
                return { keywords };
            }

            return { keywords: ['concept1', 'concept2', 'concept3'] };
        },

        validateResponse(content: ExerciseContent, expectedResponse: ExerciseResponse, studentResponse: ExerciseResponse): number {
            if (content.type !== 'text-entry') return 0;

            const minLength = content.metadata?.minLength as number || 0;
            const hasValidResponses = 'keywords' in expectedResponse &&
                Array.isArray(expectedResponse.keywords) &&
                (expectedResponse.keywords as string[]).length > 0 &&
                'text' in studentResponse &&
                typeof studentResponse.text === 'string';

            if (!hasValidResponses) return 0;

            const keywords = expectedResponse.keywords as string[];
            const text = (studentResponse.text as string).toLowerCase();

            if (text.length < minLength) {
                return 0;
            }

            let keywordCount = 0;
            for (const keyword of keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    keywordCount++;
                }
            }

            return Math.min(1, keywordCount / keywords.length);
        }
    };
}

/**
 * Crée une stratégie pour les exercices de réponse en vidéo
 */
export function createVideoResponseStrategy(): IContentGeneratorStrategy {
    return {
        name: 'VideoResponseStrategy',
        version: '3.0.0',

        generate(theme: string, level: CECRLLevel, difficulty: ExerciseDifficulty, conceptGenerator: ConceptGenerator): ExerciseContent {
            const minDuration = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
            const maxDuration = minDuration * 2;
            const conceptsToInclude = conceptGenerator.generateConceptsToTest(theme, [], 3);

            return {
                type: 'video-response',
                metadata: {
                    prompt: `Niveau ${level}: Enregistrez une vidéo en LSF concernant le thème "${theme}" 
                        (difficulté: ${difficulty}, durée: ${minDuration}-${maxDuration} secondes)
                        Incluez les concepts suivants: ${conceptsToInclude.join(', ')}`,
                    demoVideo: null,
                    evaluationCriteria: [
                        {
                            id: 'clarity',
                            name: 'Clarté',
                            description: 'Les signes sont clairs et précis.',
                            weight: 0.4
                        },
                        {
                            id: 'grammar',
                            name: 'Grammaire LSF',
                            description: 'La structure grammaticale LSF est respectée.',
                            weight: 0.4
                        },
                        {
                            id: 'fluidity',
                            name: 'Fluidité',
                            description: 'Les transitions entre les signes sont fluides.',
                            weight: 0.2
                        }
                    ],
                    minDuration,
                    maxDuration,
                    theme,
                    level,
                    difficulty,
                    generatedAt: new Date()
                }
            };
        },

        generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
            if (content.type !== 'video-response') {
                throw new Error(`Invalid content type: ${content.type}`);
            }

            const evaluationCriteria = content.metadata?.evaluationCriteria as Array<{ id: string }> || [];
            const criteriaScores = evaluationCriteria.map((criterion) => ({
                id: criterion.id,
                score: 0
            }));

            return { criteriaScores };
        },

        validateResponse(content: ExerciseContent, expectedResponse: ExerciseResponse, studentResponse: ExerciseResponse): number {
            if (content.type !== 'video-response') return 0;

            const evaluationCriteria = content.metadata?.evaluationCriteria as Array<{ id: string, weight: number }> || [];
            const hasValidResponses = 'videoUrl' in studentResponse &&
                typeof studentResponse.videoUrl === 'string' &&
                'criteriaScores' in studentResponse &&
                Array.isArray(studentResponse.criteriaScores) &&
                (studentResponse.criteriaScores as unknown[]).length > 0;

            if (!hasValidResponses) return 0;

            let totalScore = 0;
            let totalWeight = 0;

            for (const criteriaScore of studentResponse.criteriaScores as Array<{ id: string, score: number }>) {
                const criterion = evaluationCriteria.find(c => c.id === criteriaScore.id);
                if (criterion && typeof criteriaScore.score === 'number') {
                    totalScore += criteriaScore.score * criterion.weight;
                    totalWeight += criterion.weight;
                }
            }

            return totalWeight > 0 ? totalScore / totalWeight : 0;
        }
    };
}

/**
 * Crée une stratégie pour les exercices à choix multiples
 */
export function createMultipleChoiceStrategy(): IContentGeneratorStrategy {
    return {
        name: 'MultipleChoiceStrategy',
        version: '3.0.0',

        generate(theme: string, level: CECRLLevel, difficulty: ExerciseDifficulty, conceptGenerator: ConceptGenerator): ExerciseContent {
            const numberOfChoices = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
            const concepts = conceptGenerator.generateConceptsToTest(theme, [], numberOfChoices);
            const correctIndex = Math.floor(Math.random() * concepts.length);

            return {
                type: 'multiple-choice',
                metadata: {
                    question: `Quelle est la signification du signe présenté pour "${theme}" (niveau ${level}) ?`,
                    options: concepts,
                    correctIndex,
                    instructions: 'Sélectionnez la réponse qui correspond à la signification du signe.',
                    theme,
                    level,
                    difficulty,
                    generatedAt: new Date()
                }
            };
        },

        generateExpectedResponse(content: ExerciseContent): ExerciseResponse {
            if (content.type !== 'multiple-choice') {
                throw new Error(`Invalid content type: ${content.type}`);
            }

            const correctIndex = content.metadata?.correctIndex as number || 0;
            return { correctAnswer: correctIndex };
        },

        validateResponse(content: ExerciseContent, expectedResponse: ExerciseResponse, studentResponse: ExerciseResponse): number {
            if (content.type !== 'multiple-choice') return 0;

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
    };
}

/**
 * Configuration par défaut pour toutes les stratégies
 */
export const DEFAULT_STRATEGY_CONFIG = {
    enableMetrics: true,
    enableCaching: false,
    cacheSize: 100,
    cacheTTL: 300000, // 5 minutes
    customParameters: {}
};

/**
 * Crée toutes les stratégies par défaut
 */
export function createAllDefaultStrategies(): Map<string, IContentGeneratorStrategy> {
    const strategies = new Map<string, IContentGeneratorStrategy>();

    strategies.set('MultipleChoice', createMultipleChoiceStrategy());
    strategies.set('DragDrop', createDragDropStrategy());
    strategies.set('FillBlank', createFillBlankStrategy());
    strategies.set('TextEntry', createTextEntryStrategy());
    strategies.set('VideoResponse', createVideoResponseStrategy());

    return strategies;
}