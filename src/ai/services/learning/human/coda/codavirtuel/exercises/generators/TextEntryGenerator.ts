/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/TextEntryGenerator.ts
 * @description Générateur d'exercices de type réponse textuelle
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.2
 * @since 2025
 * @lastModified 2025-07-22
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    Exercise,
    CECRLLevel,
    SupportedExerciseType
} from '../types/ExerciseGeneratorTypes';
import { BaseExerciseGenerator } from './BaseExerciseGenerator';
import { ConceptsDataService, type LSFConcept, type LSFConceptDetails } from '../services/ConceptsDataService';

/**
 * Interface pour le contenu spécifique aux exercices de saisie de texte
 */
export interface TextEntryExerciseContent {
    readonly videoUrl: string;
    readonly questionText: string;
    readonly acceptableAnswers: readonly string[];
    readonly showVisualHint?: boolean;
    readonly requireDetailedAnswer?: boolean;
    readonly answerSimilarityThreshold: number;
}

/**
 * Interface pour le contexte de génération d'exercices
 */
interface ExerciseGenerationContext {
    readonly conceptId: string;
    readonly difficultyLevel?: number;
    readonly currentSkillLevel?: number;
    readonly timeLimit?: number;
    readonly includeHints?: boolean;
    readonly userId?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface étendue pour l'exercice avec propriétés supplémentaires
 */
interface ExtendedExercise extends Exercise<TextEntryExerciseContent> {
    readonly conceptId: string;
    readonly difficulty: number;
    readonly instructions: string;
    readonly timeLimit: number;
    readonly hints: readonly string[];
    readonly skillsTargeted: readonly string[];
}

/**
 * Type pour les niveaux de difficulté
 */
type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Classe spécialisée dans la génération d'exercices de type réponse textuelle
 * 
 * @class TextEntryGenerator
 * @extends BaseExerciseGenerator
 * @description Génère des exercices où l'utilisateur doit saisir une réponse textuelle
 * 
 * @example
 * ```typescript
 * const generator = new TextEntryGenerator();
 * const exercise = await generator.generateExercise({
 *   conceptId: 'greetings',
 *   difficultyLevel: 0.5,
 *   includeHints: true
 * });
 * ```
 */
export class TextEntryGenerator extends BaseExerciseGenerator {
    /**
     * Logger pour le générateur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('TextEntryGenerator');

    /**
     * Service de gestion des concepts
     * @private
     * @readonly
     */
    private readonly conceptsService: ConceptsDataService;

    /**
     * Version du générateur
     * @private
     * @static
     * @readonly
     */
    private static readonly GENERATOR_VERSION = '3.0.2';

    /**
     * Limites de temps par défaut selon la difficulté
     * @private
     * @static
     * @readonly
     */
    private static readonly DEFAULT_TIME_LIMITS: Record<string, number> = {
        'beginner': 600,  // 10 minutes
        'easy': 480,      // 8 minutes
        'medium': 360,    // 6 minutes
        'hard': 240,      // 4 minutes
        'expert': 180     // 3 minutes
    } as const;

    /**
     * Constructeur du générateur
     * 
     * @constructor
     */
    constructor() {
        super();
        this.conceptsService = ConceptsDataService.getInstance();

        this.logger.info('🎯 TextEntryGenerator initialisé', {
            version: TextEntryGenerator.GENERATOR_VERSION
        });
    }

    /**
     * Génère un exercice de type réponse textuelle
     * 
     * @method generateExercise
     * @async
     * @param {ExerciseGenerationContext} context - Contexte de génération
     * @returns {Promise<ExtendedExercise>} Exercice généré
     * @public
     */
    public async generateExercise(context: ExerciseGenerationContext): Promise<ExtendedExercise> {
        this.logger.info(`🎯 Génération d'exercice text-entry pour le concept ${context.conceptId}`);

        try {
            // Récupérer les données du concept
            const concept = await this.conceptsService.getConceptData(context.conceptId);
            if (!concept) {
                throw new Error(`Concept ${context.conceptId} non trouvé`);
            }

            // Récupérer les détails du concept pour les exemples
            const conceptDetails = await this.conceptsService.getConceptDetails(context.conceptId);
            if (!conceptDetails) {
                throw new Error(`Détails du concept ${context.conceptId} non trouvés`);
            }

            const effectiveDifficulty = context.difficultyLevel ?? concept.difficulty;
            const difficultyLevel = this.mapDifficultyToLevel(effectiveDifficulty);
            const randomExample = await this.conceptsService.getRandomExample(context.conceptId);
            const example = randomExample || conceptDetails.examples[0] || concept.text;

            // Génération de base de l'exercice
            let exercise: ExtendedExercise = {
                id: this.generateExerciseId('text-entry', context.conceptId),
                conceptId: context.conceptId,
                type: 'TextEntry' as SupportedExerciseType,
                difficulty: effectiveDifficulty,
                instructions: 'Décrivez la signification du signe présenté dans la vidéo',
                content: {
                    videoUrl: concept.videoUrl || `/assets/signs/${context.conceptId}/${example}.mp4`,
                    questionText: this.generateQuestionForConcept(concept, conceptDetails, difficultyLevel, example),
                    acceptableAnswers: this.generateAcceptableAnswers(concept, conceptDetails, example),
                    answerSimilarityThreshold: 0.7
                },
                timeLimit: context.timeLimit ?? this.getDefaultTimeLimit(difficultyLevel),
                hints: [],
                skillsTargeted: [concept.categories[0] || 'général', ...concept.relatedConcepts.slice(0, 2)],
                metadata: {
                    createdAt: new Date(),
                    level: this.mapDifficultyToCECRL(effectiveDifficulty),
                    difficulty: effectiveDifficulty,
                    estimatedDuration: this.estimateExerciseDuration(effectiveDifficulty)
                }
            };

            // Adaptation de la difficulté si nécessaire
            if (context.currentSkillLevel !== undefined) {
                exercise = this.adaptExerciseDifficulty(exercise, context.currentSkillLevel);
            }

            // Génération d'indices si demandé
            if (context.includeHints) {
                exercise = await this.generateHints(exercise, this.getHintCountForDifficulty(effectiveDifficulty));
            }

            this.logger.info('✅ Exercice text-entry généré avec succès', {
                exerciseId: exercise.id,
                difficulty: effectiveDifficulty,
                answersCount: exercise.content.acceptableAnswers.length
            });

            return exercise;

        } catch (error) {
            this.logger.error('❌ Erreur lors de la génération d\'exercice text-entry', {
                conceptId: context.conceptId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`Échec de la génération d'exercice text-entry: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Adapte la difficulté d'un exercice de type réponse textuelle
     * 
     * @method adaptExerciseDifficulty
     * @param {ExtendedExercise} exercise - Exercice à adapter
     * @param {number} userSkillLevel - Niveau de compétence de l'utilisateur (0-1)
     * @returns {ExtendedExercise} Exercice adapté
     * @public
     */
    public adaptExerciseDifficulty(
        exercise: ExtendedExercise,
        userSkillLevel: number
    ): ExtendedExercise {
        this.logger.debug('🔧 Adaptation de la difficulté', {
            exerciseId: exercise.id,
            userSkillLevel,
            originalDifficulty: exercise.difficulty
        });

        const adaptedExercise = { ...exercise };
        const content = { ...adaptedExercise.content };

        // Pour les débutants, augmenter le seuil de similarité (plus permissif)
        if (userSkillLevel < 0.3) {
            content.answerSimilarityThreshold = 0.6; // Plus permissif
            content.showVisualHint = true;

            // Augmenter le temps limite
            adaptedExercise.timeLimit = Math.round(adaptedExercise.timeLimit * 1.5);
        }
        // Pour les avancés, réduire le seuil de similarité (plus strict)
        else if (userSkillLevel > 0.7) {
            content.answerSimilarityThreshold = 0.8; // Plus strict
            content.showVisualHint = false;
            content.requireDetailedAnswer = true;

            // Réduire le temps limite pour les experts
            adaptedExercise.timeLimit = Math.round(adaptedExercise.timeLimit * 0.8);
        }

        adaptedExercise.content = content;
        adaptedExercise.difficulty = this.calculateAdaptedDifficulty(exercise.difficulty, userSkillLevel);

        this.logger.debug('✅ Difficulté adaptée', {
            exerciseId: exercise.id,
            newDifficulty: adaptedExercise.difficulty,
            newTimeLimit: adaptedExercise.timeLimit,
            similarityThreshold: content.answerSimilarityThreshold
        });

        return adaptedExercise;
    }

    /**
     * Génère des indices spécifiques pour les exercices de type réponse textuelle
     * 
     * @method generateHints
     * @param {ExtendedExercise} exercise - Exercice pour lequel générer des indices
     * @param {number} count - Nombre d'indices à générer
     * @returns {Promise<ExtendedExercise>} Exercice avec indices ajoutés
     * @public
     */
    public async generateHints(exercise: ExtendedExercise, count: number): Promise<ExtendedExercise> {
        this.logger.debug('💡 Génération d\'indices', {
            exerciseId: exercise.id,
            requestedCount: count
        });

        const adaptedExercise = { ...exercise };

        try {
            const concept = await this.conceptsService.getConceptData(exercise.conceptId);
            const conceptDetails = await this.conceptsService.getConceptDetails(exercise.conceptId);

            // Indices spécifiques aux exercices de type réponse textuelle
            const availableHints: readonly string[] = [
                'Observez attentivement la configuration des mains',
                'Le mouvement du signe peut indiquer sa signification',
                'Pensez aux expressions faciales qui accompagnent le signe',
                'Certains signes sont iconiques et représentent visuellement leur concept',
                `Ce signe appartient à la catégorie "${concept?.categories[0] || 'non spécifiée'}"`,
                `Ce concept est lié à ${concept?.relatedConcepts.join(', ') || 'des concepts associés'}`,
                `Contexte d'utilisation : ${conceptDetails?.contexts.join(', ') || 'contextes variés'}`,
                'Analysez l\'espace de signation utilisé pour ce signe'
            ];

            // Limiter au nombre demandé et ajouter à l'exercice
            adaptedExercise.hints = availableHints.slice(0, Math.min(count, availableHints.length));

            this.logger.debug('✅ Indices générés', {
                exerciseId: exercise.id,
                hintsCount: adaptedExercise.hints.length
            });

            return adaptedExercise;
        } catch (error) {
            this.logger.warn('⚠️ Erreur lors de la génération d\'indices, utilisation d\'indices par défaut', {
                exerciseId: exercise.id,
                error: error instanceof Error ? error.message : String(error)
            });

            // Fallback avec des indices génériques
            const genericHints = [
                'Observez attentivement la configuration des mains',
                'Le mouvement du signe peut indiquer sa signification',
                'Pensez aux expressions faciales qui accompagnent le signe',
                'Certains signes sont iconiques et représentent visuellement leur concept'
            ];

            adaptedExercise.hints = genericHints.slice(0, Math.min(count, genericHints.length));
            return adaptedExercise;
        }
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Génère une question pour un concept
     * @param concept Données du concept
     * @param conceptDetails Détails du concept
     * @param difficultyLevel Niveau de difficulté
     * @param currentExample Exemple utilisé dans l'exercice
     * @returns Question générée
     * @private
     */
    private generateQuestionForConcept(
        concept: LSFConcept,
        conceptDetails: LSFConceptDetails,
        difficultyLevel: DifficultyLevel,
        currentExample: string
    ): string {
        // Questions par niveau de difficulté
        const questions: Record<DifficultyLevel, readonly string[]> = {
            beginner: [
                'Que signifie ce signe en LSF?',
                'Comment traduiriez-vous ce signe en français?',
                'Quel mot ou expression représente ce signe?'
            ],
            easy: [
                `Quelle est la signification de ce signe dans le contexte de ${concept.text}?`,
                'Comment interpréteriez-vous ce signe en français?',
                `Que représente ce signe ("${currentExample}") dans une conversation courante?`
            ],
            medium: [
                `Décrivez la signification de ce signe et son utilisation dans le contexte de ${concept.text}`,
                'Expliquez ce que ce signe exprime et dans quel contexte il est utilisé',
                `Quelle est la signification précise de ce signe ("${currentExample}") dans le cadre de ${concept.categories[0] || 'cette catégorie'}?`
            ],
            hard: [
                'Donnez une explication détaillée de ce signe, incluant sa signification et son contexte d\'utilisation',
                `Décrivez précisément ce que ce signe ("${currentExample}") exprime et comment il est utilisé dans différents contextes`,
                'Analysez la signification de ce signe et expliquez les nuances qu\'il peut avoir selon le contexte'
            ],
            expert: [
                'Fournissez une analyse approfondie de ce signe, incluant sa signification, son étymologie et ses usages contextuels',
                `Décrivez en détail la signification de ce signe ("${currentExample}"), ses variations régionales possibles et son utilisation dans des contextes formels et informels`,
                'Analysez ce signe en termes de paramètres formationnels, de signification et d\'usage sociolinguistique'
            ]
        };

        // Sélection d'une question aléatoire selon le niveau de difficulté
        const questionSet = questions[difficultyLevel];
        return questionSet[Math.floor(Math.random() * questionSet.length)];
    }

    /**
     * Génère les réponses acceptables pour un exercice
     * @param concept Données du concept
     * @param conceptDetails Détails du concept
     * @param example Exemple utilisé dans l'exercice
     * @returns Liste des réponses acceptables
     * @private
     */
    private generateAcceptableAnswers(
        concept: LSFConcept,
        conceptDetails: LSFConceptDetails,
        example: string
    ): readonly string[] {
        // Commencer par l'exemple lui-même et le texte du concept
        const answers = new Set([example, concept.text]);

        // Ajouter des synonymes du concept
        if (conceptDetails.synonyms.length > 0) {
            conceptDetails.synonyms.forEach(synonym => answers.add(synonym));
        }

        // Ajouter des variations avec des formulations différentes
        answers.add(`Le signe pour ${example}`);
        answers.add(`${example.charAt(0).toUpperCase() + example.slice(1)}`);
        answers.add(`Un signe qui signifie ${example}`);
        answers.add(`${example} en LSF`);
        answers.add(concept.text.toLowerCase());
        answers.add(concept.text.charAt(0).toUpperCase() + concept.text.slice(1));

        // Ajouter des variations des exemples disponibles
        conceptDetails.examples.forEach(ex => {
            if (ex !== example) {
                answers.add(ex);
                answers.add(ex.toLowerCase());
            }
        });

        return Array.from(answers);
    }

    /**
     * Mappe une difficulté numérique vers un niveau de difficulté textuel
     * @param difficulty Difficulté numérique (0-1)
     * @returns Niveau de difficulté correspondant
     * @private
     */
    private mapDifficultyToLevel(difficulty: number): DifficultyLevel {
        if (difficulty <= 0.2) return 'beginner';
        if (difficulty <= 0.4) return 'easy';
        if (difficulty <= 0.6) return 'medium';
        if (difficulty <= 0.8) return 'hard';
        return 'expert';
    }

    /**
     * Obtient la limite de temps par défaut selon le niveau de difficulté
     * @param difficultyLevel Niveau de difficulté
     * @returns Temps limite en secondes
     * @private
     */
    private getDefaultTimeLimit(difficultyLevel: DifficultyLevel): number {
        return TextEntryGenerator.DEFAULT_TIME_LIMITS[difficultyLevel];
    }

    /**
     * Calcule le nombre d'indices selon la difficulté
     * @param difficulty Niveau de difficulté numérique
     * @returns Nombre d'indices
     * @private
     */
    private getHintCountForDifficulty(difficulty: number): number {
        if (difficulty <= 0.3) return 4; // Plus d'indices pour les débutants
        if (difficulty <= 0.7) return 2; // Indices modérés
        return 1; // Minimal pour les experts
    }

    /**
     * Génère un ID unique pour l'exercice
     * @param type Type d'exercice
     * @param conceptId ID du concept
     * @returns ID généré
     * @private
     */
    private generateExerciseId(type: string, conceptId: string): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `exercise-${type}-${timestamp}-${conceptId}-${random}`;
    }

    /**
     * Calcule la difficulté adaptée selon le niveau utilisateur
     * @param originalDifficulty Difficulté originale
     * @param userSkillLevel Niveau de compétence utilisateur
     * @returns Difficulté adaptée
     * @private
     */
    private calculateAdaptedDifficulty(originalDifficulty: number, userSkillLevel: number): number {
        const adjustment = (userSkillLevel - originalDifficulty) * 0.3;
        const adaptedDifficulty = originalDifficulty + adjustment;
        return Math.max(0, Math.min(1, adaptedDifficulty));
    }

    /**
     * Mappe une difficulté numérique vers un niveau CECRL
     * @param difficulty Difficulté numérique (0-1)
     * @returns Niveau CECRL correspondant
     * @private
     */
    private mapDifficultyToCECRL(difficulty: number): CECRLLevel {
        if (difficulty <= 0.16) return 'A1';
        if (difficulty <= 0.33) return 'A2';
        if (difficulty <= 0.50) return 'B1';
        if (difficulty <= 0.66) return 'B2';
        if (difficulty <= 0.83) return 'C1';
        return 'C2';
    }

    /**
     * Estime la durée d'un exercice en fonction de sa difficulté
     * @param difficulty Niveau de difficulté (0-1)
     * @returns Durée estimée en minutes
     * @private
     */
    private estimateExerciseDuration(difficulty: number): number {
        const baseDuration = 8; // 8 minutes de base pour un exercice de saisie
        const difficultyMultiplier = 1 + (difficulty * 0.5);
        return Math.round(baseDuration * difficultyMultiplier);
    }
}