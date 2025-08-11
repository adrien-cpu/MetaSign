/**
 * Générateur d'exercices à choix multiples pour l'apprentissage de la LSF
 * 
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/MultipleChoiceGenerator.ts
 * @description Générateur d'exercices QCM avec support complet des types readonly et validation stricte
 * @version 2.0.0
 * @author MetaSign AI Learning Team
 * @since 2025-05-26
 * @lastModified 2025-05-27
 */

import { BaseExerciseGenerator } from './BaseExerciseGenerator';
import { ExerciseGenerator } from '../ExerciseGenerator.interface';
import { ConceptsDataService, LSFConcept, ConceptSearchCriteria } from '../services/ConceptsDataService';

/**
 * Type union pour les niveaux CECRL valides
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Interface représentant une option de choix multiple
 */
export interface MultipleChoiceOption {
    /** Identifiant unique de l'option */
    readonly id: string;
    /** Texte de l'option */
    readonly text: string;
    /** URL de l'image illustrant l'option (optionnel) */
    readonly imageUrl?: string;
    /** URL de la vidéo illustrant l'option (optionnel) */
    readonly videoUrl?: string;
    /** Indique si cette option est la réponse correcte */
    readonly isCorrect: boolean;
}

/**
 * Interface représentant un exercice à choix multiples
 */
export interface MultipleChoiceExercise {
    /** Identifiant unique de l'exercice */
    readonly id: string;
    /** Question posée */
    readonly question: string;
    /** URL de l'image illustrant la question (optionnel) */
    readonly questionImageUrl?: string;
    /** URL de la vidéo illustrant la question (optionnel) */
    readonly questionVideoUrl?: string;
    /** Options de réponse */
    readonly options: readonly MultipleChoiceOption[];
    /** Explication de la réponse correcte (optionnel) */
    readonly explanation?: string;
    /** Difficulté de l'exercice (0-1) */
    readonly difficulty: number;
    /** Compétences évaluées */
    readonly skills: readonly string[];
    /** Niveau CECRL */
    readonly level: CECRLLevel;
    /** Mots-clés associés à l'exercice */
    readonly tags: readonly string[];
}

/**
 * Interface représentant les paramètres de génération d'un exercice à choix multiples
 */
export interface MultipleChoiceGeneratorParams {
    /** Niveau CECRL */
    readonly level: CECRLLevel;
    /** Difficulté de l'exercice (0-1) */
    readonly difficulty: number;
    /** Domaines de compétence sur lesquels se concentrer (optionnel) */
    readonly focusAreas?: readonly string[];
    /** Identifiant de l'utilisateur (optionnel) */
    readonly userId?: string;
    /** Identifiants des concepts à utiliser (optionnel) */
    readonly conceptIds?: readonly string[];
    /** Type de question (optionnel) */
    readonly questionType?: 'text' | 'video' | 'image';
    /** Type de réponse (optionnel) */
    readonly answerType?: 'text' | 'video' | 'image';
    /** Nombre d'options de réponse (optionnel) */
    readonly optionCount?: number;
}

/**
 * Interface représentant le résultat d'évaluation d'un exercice à choix multiples
 */
export interface MultipleChoiceEvaluationResult {
    /** Indique si la réponse est correcte */
    readonly correct: boolean;
    /** Score obtenu (0-1) */
    readonly score: number;
    /** Identifiant de l'option correcte */
    readonly correctOptionId: string;
    /** Explication de la réponse correcte (optionnel) */
    readonly explanation?: string;
    /** Détails du score par domaine de compétence */
    readonly details: Readonly<Record<string, number>>;
}

/**
 * Interface pour les paramètres validés avec valeurs par défaut
 */
interface ValidatedParams {
    readonly level: CECRLLevel;
    readonly difficulty: number;
    readonly focusAreas: readonly string[];
    readonly userId: string;
    readonly conceptIds: readonly string[];
    readonly questionType: 'text' | 'video' | 'image';
    readonly answerType: 'text' | 'video' | 'image';
    readonly optionCount: number;
}

/**
 * Générateur d'exercices à choix multiples pour l'apprentissage de la LSF
 */
export class MultipleChoiceGenerator extends BaseExerciseGenerator implements ExerciseGenerator<
    MultipleChoiceExercise,
    MultipleChoiceGeneratorParams,
    string,
    MultipleChoiceEvaluationResult
> {
    private readonly conceptsService: ConceptsDataService;

    /**
     * Constructeur du générateur d'exercices à choix multiples
     * @param conceptsService Service de données pour les concepts LSF
     */
    constructor(conceptsService: ConceptsDataService) {
        super();
        this.conceptsService = conceptsService;
    }

    /**
     * Génère un exercice à choix multiples
     * @param params Paramètres de génération
     * @returns Exercice généré
     */
    public async generate(params: MultipleChoiceGeneratorParams): Promise<MultipleChoiceExercise> {
        // Valider et définir les paramètres par défaut
        const validatedParams = this.validateAndDefaultParams(params);

        // Déterminer les concepts à utiliser pour l'exercice
        const concepts = await this.determineConcepts(validatedParams);

        // S'assurer qu'au moins un concept a été trouvé
        if (concepts.length === 0) {
            throw new Error(`No concepts found for level ${validatedParams.level} and difficulty ${validatedParams.difficulty}`);
        }

        // Sélectionner un concept cible pour la question
        const targetConcept = this.selectTargetConcept(concepts);

        // Sélectionner les concepts pour les distracteurs (mauvaises réponses)
        const distractorConcepts = await this.selectDistractorConcepts(
            targetConcept,
            validatedParams.optionCount - 1,
            validatedParams.level
        );

        // Générer les options de réponse
        const options = this.generateOptions(targetConcept, distractorConcepts, validatedParams.answerType);

        // Générer la question
        const questionData = this.generateQuestion(targetConcept, validatedParams.questionType);

        // Générer l'explication
        const explanation = await this.generateExplanation(targetConcept);

        // Construire et retourner l'exercice
        return {
            id: this.generateExerciseId(),
            question: questionData.question,
            questionImageUrl: questionData.imageUrl,
            questionVideoUrl: questionData.videoUrl,
            options,
            explanation,
            difficulty: validatedParams.difficulty,
            skills: this.determineSkills(validatedParams),
            level: validatedParams.level,
            tags: [...targetConcept.categories, ...this.getExerciseTags(validatedParams)]
        };
    }

    /**
     * Évalue la réponse de l'utilisateur à un exercice à choix multiples
     * @param exercise Exercice
     * @param response Réponse de l'utilisateur (ID de l'option choisie)
     * @returns Résultat de l'évaluation
     */
    public evaluate(exercise: MultipleChoiceExercise, response: string): MultipleChoiceEvaluationResult {
        // Trouver l'option correcte
        const correctOption = exercise.options.find(option => option.isCorrect);

        if (!correctOption) {
            throw new Error(`No correct option found for exercise ${exercise.id}`);
        }

        // Trouver l'option choisie par l'utilisateur
        const selectedOption = exercise.options.find(option => option.id === response);

        // Si l'option choisie n'existe pas, c'est une erreur
        if (!selectedOption) {
            return {
                correct: false,
                score: 0,
                correctOptionId: correctOption.id,
                explanation: exercise.explanation,
                details: this.generateSkillDetails(exercise.skills, 0)
            };
        }

        // Vérifier si la réponse est correcte
        const isCorrect = selectedOption.isCorrect;

        // Calculer le score
        const score = isCorrect ? 1 : 0;

        // Générer les détails par compétence
        const details = this.generateSkillDetails(exercise.skills, score);

        return {
            correct: isCorrect,
            score,
            correctOptionId: correctOption.id,
            explanation: exercise.explanation,
            details
        };
    }

    /**
     * Valide et définit les valeurs par défaut pour les paramètres
     * @param params Paramètres bruts
     * @returns Paramètres validés avec valeurs par défaut
     * @private
     */
    private validateAndDefaultParams(params: MultipleChoiceGeneratorParams): ValidatedParams {
        return {
            level: params.level,
            difficulty: Math.max(0, Math.min(1, params.difficulty)),
            focusAreas: params.focusAreas ?? [],
            userId: params.userId ?? '',
            conceptIds: params.conceptIds ?? [],
            questionType: params.questionType ?? 'text',
            answerType: params.answerType ?? 'text',
            optionCount: Math.max(2, Math.min(10, params.optionCount ?? 4))
        };
    }

    /**
     * Détermine les concepts à utiliser pour l'exercice
     * @param params Paramètres validés
     * @returns Liste de concepts LSF
     * @private
     */
    private async determineConcepts(params: ValidatedParams): Promise<readonly LSFConcept[]> {
        // Si des concepts spécifiques sont demandés, les utiliser
        if (params.conceptIds.length > 0) {
            return await this.conceptsService.getConceptsByIds(params.conceptIds);
        }

        // Sinon, rechercher des concepts adaptés au niveau et aux domaines de focus
        const searchCriteria: ConceptSearchCriteria = {
            level: params.level,
            categories: params.focusAreas.length > 0 ? params.focusAreas : undefined,
            maxDifficulty: params.difficulty
        };

        return await this.conceptsService.searchConcepts(searchCriteria);
    }

    /**
     * Sélectionne un concept cible pour la question
     * @param concepts Liste de concepts disponibles
     * @returns Concept sélectionné
     * @private
     */
    private selectTargetConcept(concepts: readonly LSFConcept[]): LSFConcept {
        // Sélectionner aléatoirement un concept
        const index = Math.floor(Math.random() * concepts.length);
        return concepts[index];
    }

    /**
     * Sélectionne des concepts pour les distracteurs (mauvaises réponses)
     * @param targetConcept Concept cible
     * @param count Nombre de distracteurs à sélectionner
     * @param level Niveau de l'exercice
     * @returns Liste de concepts distracteurs
     * @private
     */
    private async selectDistractorConcepts(
        targetConcept: LSFConcept,
        count: number,
        level: CECRLLevel
    ): Promise<readonly LSFConcept[]> {
        // D'abord, essayer de sélectionner des concepts liés mais différents
        let distractors: LSFConcept[] = [];

        if (targetConcept.relatedConcepts.length > 0) {
            const relatedConcepts = await this.conceptsService.getConceptsByIds(
                targetConcept.relatedConcepts
            );

            // Filtrer pour s'assurer qu'ils sont différents du concept cible
            const filteredRelated = [...relatedConcepts].filter(
                concept => concept.id !== targetConcept.id
            );

            // Prendre jusqu'à count/2 concepts liés
            distractors = filteredRelated.slice(0, Math.floor(count / 2));
        }

        // Compléter avec des concepts du même niveau mais de catégories différentes
        if (distractors.length < count) {
            const remainingCount = count - distractors.length;

            const searchCriteria: ConceptSearchCriteria = {
                level,
                excludeIds: [targetConcept.id, ...distractors.map(d => d.id)],
                limit: remainingCount * 2 // Demander plus pour avoir de la marge
            };

            const additionalConcepts = await this.conceptsService.searchConcepts(searchCriteria);

            // Mélanger les résultats pour diversité
            const shuffled = this.shuffleArray([...additionalConcepts]);

            // Prendre le nombre nécessaire
            distractors = [...distractors, ...shuffled.slice(0, remainingCount)];
        }

        return distractors;
    }

    /**
     * Génère les options de réponse pour l'exercice
     * @param targetConcept Concept cible (réponse correcte)
     * @param distractorConcepts Concepts distracteurs (mauvaises réponses)
     * @param answerType Type de réponse (texte, vidéo, image)
     * @returns Liste d'options de réponse
     * @private
     */
    private generateOptions(
        targetConcept: LSFConcept,
        distractorConcepts: readonly LSFConcept[],
        answerType: 'text' | 'video' | 'image'
    ): readonly MultipleChoiceOption[] {
        // Créer l'option correcte avec toutes ses propriétés
        const correctOption: MultipleChoiceOption = {
            id: this.generateOptionId(),
            text: targetConcept.text,
            isCorrect: true,
            ...(answerType === 'video' && targetConcept.videoUrl && { videoUrl: targetConcept.videoUrl }),
            ...(answerType === 'image' && targetConcept.imageUrl && { imageUrl: targetConcept.imageUrl })
        };

        // Créer les options incorrectes
        const incorrectOptions: MultipleChoiceOption[] = [...distractorConcepts].map(concept => ({
            id: this.generateOptionId(),
            text: concept.text,
            isCorrect: false,
            ...(answerType === 'video' && concept.videoUrl && { videoUrl: concept.videoUrl }),
            ...(answerType === 'image' && concept.imageUrl && { imageUrl: concept.imageUrl })
        }));

        // Combiner et mélanger les options
        const allOptions = [correctOption, ...incorrectOptions];
        return this.simpleShuffleArray(allOptions);
    }

    /**
     * Méthode de mélange simple si shuffleArray de la classe parent n'est pas disponible
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

    /**
     * Génère la question pour l'exercice
     * @param concept Concept cible
     * @param questionType Type de question (texte, vidéo, image)
     * @returns Données de la question
     * @private
     */
    private generateQuestion(
        concept: LSFConcept,
        questionType: 'text' | 'video' | 'image'
    ): { question: string; imageUrl?: string; videoUrl?: string } {
        // Question par défaut
        let question = 'Quelle est la signification de ce signe ?';
        let imageUrl: string | undefined;
        let videoUrl: string | undefined;

        // Adapter selon le type de question
        if (questionType === 'text') {
            question = `Comment signe-t-on "${concept.text}" en LSF ?`;
        } else if (questionType === 'video' && concept.videoUrl) {
            videoUrl = concept.videoUrl;
        } else if (questionType === 'image' && concept.imageUrl) {
            imageUrl = concept.imageUrl;
        }

        return { question, imageUrl, videoUrl };
    }

    /**
     * Génère une explication pour la réponse correcte
     * @param concept Concept cible
     * @returns Explication
     * @private
     */
    private async generateExplanation(concept: LSFConcept): Promise<string> {
        // Récupérer des informations supplémentaires sur le concept
        const conceptDetails = await this.conceptsService.getConceptDetails(concept.id);

        if (conceptDetails?.explanation) {
            return conceptDetails.explanation;
        }

        // Explication par défaut si aucune information supplémentaire n'est disponible
        return `Le signe pour "${concept.text}" est important dans le vocabulaire de base de la LSF. Pratiquez-le régulièrement pour le mémoriser.`;
    }

    /**
     * Détermine les compétences évaluées par l'exercice
     * @param params Paramètres validés
     * @returns Liste de compétences
     * @private
     */
    private determineSkills(params: ValidatedParams): readonly string[] {
        const levelSkillsMap: Record<CECRLLevel, readonly string[]> = {
            'A1': ['basicVocabulary', 'recognition'],
            'A2': ['basicVocabulary', 'recognition', 'simpleExpressions'],
            'B1': ['intermediateVocabulary', 'recognition', 'contextualUnderstanding'],
            'B2': ['advancedVocabulary', 'subtleties', 'expressionVariety'],
            'C1': ['complexExpressions', 'culturalSubtleties', 'idiomaticUsage'],
            'C2': ['nativelikeFluency', 'culturalMastery', 'subtleExpressions']
        };

        // Commencer avec les compétences de base du niveau
        const skills = [...(levelSkillsMap[params.level] || ['basicVocabulary'])];

        // Ajouter les domaines de focus s'ils sont fournis
        if (params.focusAreas.length > 0) {
            skills.push(...params.focusAreas);
        }

        // Éliminer les doublons et retourner comme readonly
        return [...new Set(skills)];
    }

    /**
     * Génère les détails de score par compétence
     * @param skills Liste de compétences
     * @param baseScore Score de base
     * @returns Map des scores par compétence
     * @private
     */
    private generateSkillDetails(skills: readonly string[], baseScore: number): Readonly<Record<string, number>> {
        const details: Record<string, number> = {};

        // Attribuer le même score à toutes les compétences
        for (const skill of skills) {
            details[skill] = baseScore;
        }

        return details;
    }

    /**
     * Génère des tags pour l'exercice
     * @param params Paramètres validés
     * @returns Liste de tags
     * @private
     */
    private getExerciseTags(params: ValidatedParams): readonly string[] {
        const tags: string[] = ['multiple-choice', params.level];

        tags.push(`question-${params.questionType}`);
        tags.push(`answer-${params.answerType}`);

        return tags;
    }

    /**
     * Génère un ID unique pour l'exercice
     * @returns ID d'exercice
     * @private
     */
    private generateExerciseId(): string {
        return `mc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    /**
     * Génère un ID unique pour une option
     * @returns ID d'option
     * @private
     */
    private generateOptionId(): string {
        return `opt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
}