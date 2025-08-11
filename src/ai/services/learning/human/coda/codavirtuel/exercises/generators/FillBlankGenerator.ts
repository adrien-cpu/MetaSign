/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/FillBlankGenerator.ts
 * @description Générateur d'exercices de type texte à trous pour l'apprentissage de la LSF
 * @version 2.1.0
 * @author MetaSign AI Learning Team
 * @since 2025-05-26
 * @lastModified 2025-05-27
 */

import { BaseExerciseGenerator } from './BaseExerciseGenerator';
import { BaseExerciseParams, BaseEvaluationResult } from '../ExerciseGenerator.interface';
import { ConceptsDataService, LSFConcept, ConceptSearchCriteria } from '../services/ConceptsDataService';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Type union pour les niveaux CECRL valides
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Interface pour une option de réponse dans un exercice à trous
 */
interface FillBlankOption {
    readonly id: string;
    readonly text: string;
    readonly isCorrect: boolean;
    readonly conceptId?: string;
}

/**
 * Interface pour un blanc à compléter
 */
interface BlankItem {
    readonly id: string;
    readonly position: number;
    readonly correctAnswer: string;
    readonly acceptableAnswers: readonly string[];
    readonly hint?: string;
}

/**
 * Interface pour le contenu d'un exercice à trous
 */
interface FillBlankContent {
    readonly text: string;
    readonly blanks: readonly BlankItem[];
    readonly options: readonly FillBlankOption[];
    readonly instructions: string;
}

/**
 * Interface pour un exercice de type texte à trous
 */
export interface FillBlankExercise {
    readonly id: string;
    readonly question: string;
    readonly content: FillBlankContent;
    readonly difficulty: number;
    readonly skills: readonly string[];
    readonly level: CECRLLevel;
    readonly tags: readonly string[];
    readonly explanation?: string;
    readonly timeLimit?: number;
}

/**
 * Interface pour les paramètres de génération d'exercices à trous
 * Étend les paramètres de base avec des spécificités aux exercices à trous
 */
export interface FillBlankGeneratorParams extends Omit<BaseExerciseParams, 'focusAreas'> {
    readonly level: CECRLLevel;
    readonly difficulty: number;
    readonly focusAreas?: readonly string[];
    readonly userId?: string;
    readonly conceptIds?: readonly string[];
    readonly blankCount?: number;
    readonly optionCount?: number;
    readonly includeImages?: boolean;
    readonly includeVideos?: boolean;
}

/**
 * Interface pour le résultat d'évaluation d'un exercice à trous
 * Étend le résultat de base avec des spécificités aux exercices à trous
 */
export interface FillBlankEvaluationResult extends BaseEvaluationResult {
    readonly feedback: readonly string[];
    readonly correctAnswers: Readonly<Record<string, string>>;
}

/**
 * Interface pour les paramètres validés avec valeurs par défaut
 */
interface ValidatedFillBlankParams {
    readonly level: CECRLLevel;
    readonly difficulty: number;
    readonly focusAreas: readonly string[];
    readonly userId: string;
    readonly conceptIds: readonly string[];
    readonly blankCount: number;
    readonly optionCount: number;
    readonly includeImages: boolean;
    readonly includeVideos: boolean;
}

/**
 * Générateur d'exercices de type texte à trous pour l'apprentissage de la LSF
 */
export class FillBlankGenerator extends BaseExerciseGenerator {
    private readonly conceptsService: ConceptsDataService;
    private readonly logger: ReturnType<typeof LoggerFactory.getLogger>;

    /**
     * Constructeur du générateur d'exercices à trous
     * @param conceptsService Service de données pour les concepts LSF
     */
    constructor(conceptsService: ConceptsDataService) {
        super();
        this.conceptsService = conceptsService;
        this.logger = LoggerFactory.getLogger('FillBlankGenerator');
    }

    /**
     * Génère un exercice de type texte à trous
     * @param params Paramètres de génération
     * @returns Exercice à trous généré
     */
    public async generate(params: FillBlankGeneratorParams): Promise<FillBlankExercise> {
        this.logger.info(`Generating fill-blank exercise for level ${params.level}`);

        // Valider et définir les paramètres par défaut
        const validatedParams = this.validateAndDefaultParams(params);

        // Obtenir les concepts pour l'exercice
        const concepts = await this.getConcepts(validatedParams);

        if (concepts.length === 0) {
            throw new Error(`No concepts found for level ${validatedParams.level}`);
        }

        // Sélectionner les concepts à utiliser pour les blancs
        const selectedConcepts = this.selectConceptsForBlanks(concepts, validatedParams.blankCount);

        // Générer le texte avec les blancs
        const textWithBlanks = await this.generateTextWithBlanks(selectedConcepts, validatedParams);

        // Générer les options de réponse
        const options = await this.generateOptions(selectedConcepts, concepts, validatedParams);

        // Construire l'exercice
        const exercise: FillBlankExercise = {
            id: this.generateExerciseId('fill-blank'),
            question: this.generateQuestion(),
            content: {
                text: textWithBlanks.text,
                blanks: textWithBlanks.blanks,
                options,
                instructions: 'Complétez le texte en choisissant les mots appropriés pour chaque blanc.'
            },
            difficulty: validatedParams.difficulty,
            skills: this.determineSkills(validatedParams),
            level: validatedParams.level,
            tags: this.generateTags(validatedParams),
            explanation: await this.generateExplanation(selectedConcepts),
            timeLimit: this.calculateTimeLimit(validatedParams)
        };

        this.logger.debug(`Generated fill-blank exercise with ${textWithBlanks.blanks.length} blanks`);
        return exercise;
    }

    /**
     * Évalue la réponse de l'utilisateur pour un exercice à trous
     * @param exercise Exercice à évaluer
     * @param responses Réponses de l'utilisateur (ID du blanc -> ID de l'option choisie)
     * @returns Résultat de l'évaluation
     */
    public evaluate(exercise: FillBlankExercise, responses: Record<string, string>): FillBlankEvaluationResult {
        let totalScore = 0;
        const feedback: string[] = [];
        const correctAnswers: Record<string, string> = {};

        // Évaluer chaque blanc
        for (const blank of exercise.content.blanks) {
            const userResponse = responses[blank.id];
            const isCorrect = blank.acceptableAnswers.includes(userResponse) || userResponse === blank.correctAnswer;

            correctAnswers[blank.id] = blank.correctAnswer;

            if (isCorrect) {
                totalScore += 1;
                feedback.push(`Correct pour le blanc ${blank.position + 1}`);
            } else {
                feedback.push(`Incorrect pour le blanc ${blank.position + 1}. La bonne réponse était: ${blank.correctAnswer}`);
            }
        }

        // Calculer le score global
        const globalScore = exercise.content.blanks.length > 0 ? totalScore / exercise.content.blanks.length : 0;

        // Convertir readonly array en array mutable pour la méthode héritée
        const skillsArray = [...exercise.skills];

        // Utiliser la méthode héritée pour distribuer le score aux compétences
        const skillDetails = this.distributeScoreToSkills(skillsArray, globalScore, 0.1);

        // Utiliser la méthode héritée pour générer le résultat de base
        const baseResult = this.generateBaseResult(
            globalScore === 1,
            globalScore,
            exercise.difficulty,
            exercise.explanation,
            skillDetails
        );

        return {
            ...baseResult,
            feedback,
            correctAnswers
        };
    }

    /**
     * Valide et définit les valeurs par défaut pour les paramètres
     * @param params Paramètres bruts
     * @returns Paramètres validés avec valeurs par défaut
     * @private
     */
    private validateAndDefaultParams(params: FillBlankGeneratorParams): ValidatedFillBlankParams {
        return {
            level: params.level,
            difficulty: this.validateDifficulty(params.difficulty),
            focusAreas: params.focusAreas ?? [],
            userId: params.userId ?? '',
            conceptIds: params.conceptIds ?? [],
            blankCount: Math.max(1, Math.min(5, params.blankCount ?? 3)),
            optionCount: Math.max(4, Math.min(8, params.optionCount ?? 6)),
            includeImages: params.includeImages ?? false,
            includeVideos: params.includeVideos ?? false
        };
    }

    /**
     * Obtient les concepts nécessaires pour l'exercice
     * @param params Paramètres validés
     * @returns Liste de concepts LSF
     * @private
     */
    private async getConcepts(params: ValidatedFillBlankParams): Promise<readonly LSFConcept[]> {
        if (params.conceptIds.length > 0) {
            return await this.conceptsService.getConceptsByIds(params.conceptIds);
        }

        const searchCriteria: ConceptSearchCriteria = {
            level: params.level,
            categories: params.focusAreas.length > 0 ? params.focusAreas : undefined,
            maxDifficulty: params.difficulty
        };

        return await this.conceptsService.searchConcepts(searchCriteria);
    }

    /**
     * Sélectionne les concepts à utiliser pour les blancs
     * @param concepts Concepts disponibles
     * @param blankCount Nombre de blancs souhaités
     * @returns Concepts sélectionnés
     * @private
     */
    private selectConceptsForBlanks(concepts: readonly LSFConcept[], blankCount: number): readonly LSFConcept[] {
        // Convertir readonly en tableau mutable pour getRandomElements
        const conceptsArray = [...concepts];
        return this.getRandomElements(conceptsArray, Math.min(blankCount, concepts.length), true);
    }

    /**
     * Génère un texte avec des blancs à partir des concepts sélectionnés
     * @param concepts Concepts à utiliser
     * @param params Paramètres de génération
     * @returns Texte avec blancs et métadonnées
     * @private
     */
    private async generateTextWithBlanks(
        concepts: readonly LSFConcept[],
        params: ValidatedFillBlankParams
    ): Promise<{ text: string; blanks: readonly BlankItem[] }> {
        // Templates de phrases selon le niveau
        const templates = this.getTemplatesForLevel(params.level);

        // Sélectionner un template approprié en utilisant la méthode héritée
        const template = this.getRandomElement(templates);

        let text = template;
        const blanks: BlankItem[] = [];

        // Remplacer les concepts par des blancs
        concepts.forEach((concept, index) => {
            const blankId = `blank-${index + 1}`;
            const blankMarker = `[${blankId.toUpperCase()}]`;

            // Remplacer le premier placeholder par le blank
            text = text.replace('[CONCEPT]', blankMarker);

            blanks.push({
                id: blankId,
                position: index,
                correctAnswer: concept.text,
                acceptableAnswers: this.generateAcceptableAnswers(concept),
                hint: `Ce signe fait partie de la catégorie: ${concept.categories.join(', ')}`
            });
        });

        return { text, blanks };
    }

    /**
     * Génère les options de réponse pour l'exercice
     * @param selectedConcepts Concepts utilisés pour les blancs
     * @param allConcepts Tous les concepts disponibles
     * @param params Paramètres de génération
     * @returns Options de réponse
     * @private
     */
    private async generateOptions(
        selectedConcepts: readonly LSFConcept[],
        allConcepts: readonly LSFConcept[],
        params: ValidatedFillBlankParams
    ): Promise<readonly FillBlankOption[]> {
        const options: FillBlankOption[] = [];

        // Ajouter les bonnes réponses
        selectedConcepts.forEach((concept, index) => {
            options.push({
                id: `option-correct-${index}`,
                text: concept.text,
                isCorrect: true,
                conceptId: concept.id
            });
        });

        // Ajouter des distracteurs
        const distractors = [...allConcepts].filter(concept =>
            !selectedConcepts.find(selected => selected.id === concept.id)
        );

        const distractorCount = params.optionCount - selectedConcepts.length;
        const selectedDistractors = this.getRandomElements(distractors, distractorCount, true);

        selectedDistractors.forEach((concept, index) => {
            options.push({
                id: `option-distractor-${index}`,
                text: concept.text,
                isCorrect: false,
                conceptId: concept.id
            });
        });

        return this.simpleShuffleArray(options);
    }

    /**
     * Génère des réponses acceptables pour un concept
     * @param concept Concept LSF
     * @returns Liste de réponses acceptables
     * @private
     */
    private generateAcceptableAnswers(concept: LSFConcept): readonly string[] {
        const acceptable = [concept.text];

        // Ajouter des variantes basées sur les catégories
        if (concept.categories.includes('politesse')) {
            // Ajouter des formes de politesse équivalentes si approprié
            if (concept.text.toLowerCase().includes('merci')) {
                acceptable.push('Merci beaucoup');
            }
        }

        return acceptable;
    }

    /**
     * Obtient les templates de phrases selon le niveau
     * @param level Niveau CECRL
     * @returns Templates de phrases
     * @private
     */
    private getTemplatesForLevel(level: CECRLLevel): string[] {
        const templates: Record<CECRLLevel, string[]> = {
            'A1': [
                'Pour dire [CONCEPT] en LSF, on utilise [CONCEPT] avec [CONCEPT].',
                'Le signe pour [CONCEPT] se fait en [CONCEPT] avec la [CONCEPT].',
                'En LSF, [CONCEPT] s\'exprime par [CONCEPT] et [CONCEPT].'
            ],
            'A2': [
                'Dans une conversation LSF, [CONCEPT] est souvent accompagné de [CONCEPT] pour montrer [CONCEPT].',
                'L\'expression [CONCEPT] en LSF nécessite [CONCEPT] et une [CONCEPT] appropriée.',
                'Pour communiquer [CONCEPT], il faut maîtriser [CONCEPT] et [CONCEPT].'
            ],
            'B1': [
                'L\'utilisation de [CONCEPT] en LSF dépend du contexte et de [CONCEPT] pour transmettre [CONCEPT].',
                'La nuance entre [CONCEPT] et [CONCEPT] s\'exprime par [CONCEPT] différents.',
                'En LSF avancée, [CONCEPT] peut être modifié par [CONCEPT] selon [CONCEPT].'
            ],
            'B2': [
                'L\'analyse de [CONCEPT] en contexte LSF révèle que [CONCEPT] influence [CONCEPT].',
                'La maîtrise de [CONCEPT] permet d\'articuler [CONCEPT] avec [CONCEPT].',
                'Dans la communication LSF sophistiquée, [CONCEPT] s\'adapte à [CONCEPT] selon [CONCEPT].'
            ],
            'C1': [
                'L\'expertise en LSF démontre que [CONCEPT] transcende [CONCEPT] pour révéler [CONCEPT].',
                'La subtilité de [CONCEPT] se manifeste par [CONCEPT] dans [CONCEPT].',
                'L\'analyse approfondie de [CONCEPT] révèle les nuances de [CONCEPT] et [CONCEPT].'
            ],
            'C2': [
                'La maîtrise native de [CONCEPT] illustre comment [CONCEPT] s\'intègre naturellement avec [CONCEPT].',
                'L\'intuition linguistique LSF révèle que [CONCEPT] anticipe [CONCEPT] dans [CONCEPT].',
                'La fluidité experte en LSF démontre l\'harmonie entre [CONCEPT], [CONCEPT] et [CONCEPT].'
            ]
        };

        return templates[level];
    }

    /**
     * Génère une question appropriée pour l'exercice
     * @returns Question de l'exercice
     * @private
     */
    private generateQuestion(): string {
        const questions = [
            'Complétez le texte suivant en choisissant les termes appropriés en LSF.',
            'Remplissez les blancs avec les signes corrects.',
            'Choisissez les mots manquants pour compléter ce texte sur la LSF.',
            'Complétez cette explication sur la LSF avec les concepts appropriés.',
            'Finalisez ce texte en sélectionnant les signes qui conviennent.'
        ];

        return this.getRandomElement(questions);
    }

    /**
     * Détermine les compétences évaluées par l'exercice
     * @param params Paramètres validés
     * @returns Liste de compétences
     * @private
     */
    private determineSkills(params: ValidatedFillBlankParams): readonly string[] {
        const levelSkills: Record<CECRLLevel, readonly string[]> = {
            'A1': ['vocabulary', 'comprehension', 'basicStructures'],
            'A2': ['vocabulary', 'comprehension', 'basicStructures', 'contextualUsage'],
            'B1': ['vocabulary', 'comprehension', 'complexStructures', 'contextualUsage'],
            'B2': ['advancedVocabulary', 'deepComprehension', 'complexStructures', 'nuancedUsage'],
            'C1': ['expertVocabulary', 'criticalComprehension', 'advancedStructures', 'culturalNuances'],
            'C2': ['nativeVocabulary', 'intuitiveComprehension', 'masterStructures', 'culturalMastery']
        };

        const skills = [...levelSkills[params.level]];

        if (params.focusAreas.length > 0) {
            skills.push(...params.focusAreas);
        }

        return [...new Set(skills)];
    }

    /**
     * Génère les tags pour l'exercice
     * @param params Paramètres validés
     * @returns Liste de tags
     * @private
     */
    private generateTags(params: ValidatedFillBlankParams): readonly string[] {
        const tags = ['fill-blank', params.level, 'text-completion'];

        if (params.includeImages) tags.push('with-images');
        if (params.includeVideos) tags.push('with-videos');
        if (params.focusAreas.length > 0) tags.push(...params.focusAreas);

        return tags;
    }

    /**
     * Génère une explication pour l'exercice
     * @param concepts Concepts utilisés
     * @returns Explication de l'exercice
     * @private
     */
    private async generateExplanation(concepts: readonly LSFConcept[]): Promise<string> {
        const conceptNames = concepts.map(c => c.text).join(', ');
        return `Ce texte à trous vous permet de pratiquer l'usage des signes : ${conceptNames}. ` +
            'Chaque concept a sa place spécifique selon le contexte et la structure de la phrase en LSF.';
    }

    /**
     * Génère un ID unique pour l'exercice
     * @param type Type d'exercice
     * @returns ID unique
     * @private
     */
    private generateExerciseId(type: string): string {
        return this.generateId(type);
    }

    /**
     * Calcule la limite de temps pour l'exercice
     * @param params Paramètres validés
     * @returns Limite de temps en secondes
     * @private
     */
    private calculateTimeLimit(params: ValidatedFillBlankParams): number {
        const baseTime = 60; // 1 minute de base
        const perBlank = 30; // 30 secondes par blanc
        const difficultyMultiplier = 1 + (1 - params.difficulty) * 0.5; // Plus facile = plus de temps

        return Math.round((baseTime + params.blankCount * perBlank) * difficultyMultiplier);
    }

    /**
     * Méthode de mélange simple pour les tableaux
     * @param array Tableau à mélanger
     * @returns Nouveau tableau mélangé
     * @private
     */
    private simpleShuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}