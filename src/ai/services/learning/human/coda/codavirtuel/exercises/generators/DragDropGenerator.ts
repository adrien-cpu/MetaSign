/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/DragDropGenerator.ts
 * @description Générateur d'exercices de type glisser-déposer
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
import { ExerciseGeneratorUtils } from '../utils/ExerciseGeneratorUtils';
import { ConceptsDataService, type LSFConcept, type LSFConceptDetails } from '../services/ConceptsDataService';

/**
 * Interface pour le contenu spécifique aux exercices glisser-déposer
 */
export interface DragDropExerciseContent {
    readonly items: readonly ExerciseItem[];
    readonly targets: readonly ExerciseTarget[];
    readonly correctPairings: readonly CorrectPairing[];
}

/**
 * Interface pour un élément à glisser
 */
export interface ExerciseItem {
    readonly id: string;
    readonly text: string;
    readonly type: 'text' | 'image' | 'video';
    readonly draggable: boolean;
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface pour une cible de dépôt
 */
export interface ExerciseTarget {
    readonly id: string;
    readonly text: string;
    readonly acceptsItemId: string;
    readonly droppable: boolean;
    readonly position?: { readonly x: number; readonly y: number };
}

/**
 * Interface pour une association correcte
 */
export interface CorrectPairing {
    readonly itemId: string;
    readonly targetId: string;
    readonly feedback?: string;
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
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface étendue pour l'exercice avec propriétés supplémentaires
 */
interface ExtendedExercise extends Exercise<DragDropExerciseContent> {
    readonly conceptId: string;
    readonly difficulty: number;
    readonly instructions: string;
    readonly timeLimit: number;
    readonly hints: readonly string[];
    readonly skillsTargeted: readonly string[];
}

/**
 * Classe spécialisée dans la génération d'exercices de type glisser-déposer
 * 
 * @class DragDropGenerator
 * @extends BaseExerciseGenerator
 * @description Génère des exercices interactifs où l'utilisateur doit associer
 * des éléments en les glissant vers les bonnes cibles
 * 
 * @example
 * ```typescript
 * const generator = new DragDropGenerator();
 * const exercise = await generator.generateExercise({
 *   conceptId: 'basic_greetings',
 *   difficultyLevel: 0.5,
 *   includeHints: true
 * });
 * ```
 */
export class DragDropGenerator extends BaseExerciseGenerator {
    /**
     * Logger pour le générateur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('DragDropGenerator');

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
        'easy': 300,      // 5 minutes
        'medium': 180,    // 3 minutes
        'hard': 120       // 2 minutes
    } as const;

    /**
     * Constructeur du générateur
     * 
     * @constructor
     */
    constructor() {
        super();
        this.conceptsService = ConceptsDataService.getInstance();

        this.logger.info('🎯 DragDropGenerator initialisé', {
            version: DragDropGenerator.GENERATOR_VERSION
        });
    }

    /**
     * Génère un exercice de type glisser-déposer
     * 
     * @method generateExercise
     * @async
     * @param {ExerciseGenerationContext} context - Contexte de génération
     * @returns {Promise<ExtendedExercise>} Exercice généré
     * @public
     */
    public async generateExercise(context: ExerciseGenerationContext): Promise<ExtendedExercise> {
        this.logger.info(`🎯 Génération d'exercice drag-drop pour le concept ${context.conceptId}`);

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

            // Génération des éléments à faire correspondre
            const items = this.generateItems(conceptDetails);
            const targets = this.generateTargets(concept, conceptDetails, items);
            const correctPairings = this.generateCorrectPairings(items, targets);

            // Mélanger les cibles pour plus de difficulté
            const shuffledTargets = this.shuffleElements([...targets]);

            // Génération de base de l'exercice
            let exercise: ExtendedExercise = {
                id: this.generateExerciseId('drag-drop', context.conceptId),
                conceptId: context.conceptId,
                type: 'DragDrop' as SupportedExerciseType,
                difficulty: effectiveDifficulty,
                instructions: 'Faites glisser chaque signe vers sa description correcte',
                content: {
                    items,
                    targets: shuffledTargets,
                    correctPairings
                },
                timeLimit: context.timeLimit ?? this.getDefaultTimeLimit(effectiveDifficulty),
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

            this.logger.info('✅ Exercice drag-drop généré avec succès', {
                exerciseId: exercise.id,
                itemsCount: items.length,
                targetsCount: targets.length,
                difficulty: effectiveDifficulty
            });

            return exercise;

        } catch (error) {
            this.logger.error('❌ Erreur lors de la génération d\'exercice drag-drop', {
                conceptId: context.conceptId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`Échec de la génération d'exercice drag-drop: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Adapte la difficulté d'un exercice de type glisser-déposer
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

        // Pour les débutants, simplifier les descriptions
        if (userSkillLevel < 0.3) {
            content.targets = content.targets.map((target: ExerciseTarget) => ({
                ...target,
                text: ExerciseGeneratorUtils.simplifyText(target.text)
            }));

            // Réduire le nombre d'éléments pour les débutants
            if (content.items.length > 4) {
                content.items = content.items.slice(0, 4);
                content.targets = content.targets.slice(0, 4);
                content.correctPairings = content.correctPairings.slice(0, 4);
            }

            // Augmenter le temps limite
            adaptedExercise.timeLimit = Math.round(adaptedExercise.timeLimit * 1.5);
        }
        // Pour les avancés, rendre les descriptions plus complexes
        else if (userSkillLevel > 0.7) {
            content.targets = content.targets.map((target: ExerciseTarget) => ({
                ...target,
                text: ExerciseGeneratorUtils.makeTextMoreComplex(target.text)
            }));

            // Réduire le temps limite pour les experts
            adaptedExercise.timeLimit = Math.round(adaptedExercise.timeLimit * 0.8);
        }

        adaptedExercise.content = content;
        adaptedExercise.difficulty = this.calculateAdaptedDifficulty(exercise.difficulty, userSkillLevel);

        this.logger.debug('✅ Difficulté adaptée', {
            exerciseId: exercise.id,
            newDifficulty: adaptedExercise.difficulty,
            newTimeLimit: adaptedExercise.timeLimit
        });

        return adaptedExercise;
    }

    /**
     * Génère des indices spécifiques pour les exercices de type glisser-déposer
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

            // Indices spécifiques aux exercices de type glisser-déposer
            const availableHints: readonly string[] = [
                'Commencez par les correspondances dont vous êtes sûr',
                'Cherchez des indices visuels dans les images des signes',
                'Éliminez les combinaisons impossibles',
                `Les descriptions font référence au contexte de ${conceptDetails?.explanation ?? 'ce concept'}`,
                `Ce concept est lié à ${concept?.relatedConcepts.join(', ') ?? 'des concepts associés'}`,
                'Observez attentivement la forme des mains dans les signes',
                'Pensez à la logique et au sens des associations',
                'Utilisez le processus d\'élimination pour les dernières correspondances'
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
                'Commencez par les correspondances dont vous êtes sûr',
                'Cherchez des indices visuels dans les images des signes',
                'Éliminez les combinaisons impossibles',
                'Pensez à la logique et au sens des associations'
            ];

            adaptedExercise.hints = genericHints.slice(0, Math.min(count, genericHints.length));
            return adaptedExercise;
        }
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Génère les éléments à glisser
     * @param conceptDetails Détails du concept contenant les exemples
     * @returns Éléments générés
     * @private
     */
    private generateItems(conceptDetails: LSFConceptDetails): readonly ExerciseItem[] {
        return conceptDetails.examples.map((example: string, index: number) => ({
            id: `item-${index}`,
            text: example,
            type: 'text' as const,
            draggable: true
        }));
    }

    /**
     * Génère les cibles de dépôt
     * @param concept Données du concept
     * @param conceptDetails Détails du concept
     * @param items Éléments source
     * @returns Cibles générées
     * @private
     */
    private generateTargets(
        concept: LSFConcept,
        conceptDetails: LSFConceptDetails,
        items: readonly ExerciseItem[]
    ): readonly ExerciseTarget[] {
        return items.map((item: ExerciseItem, index: number) => ({
            id: `target-${index}`,
            text: this.generateDescriptionForExample(item.text, concept, conceptDetails),
            acceptsItemId: item.id,
            droppable: true
        }));
    }

    /**
     * Génère les associations correctes
     * @param items Éléments source
     * @param targets Cibles
     * @returns Associations correctes
     * @private
     */
    private generateCorrectPairings(
        items: readonly ExerciseItem[],
        targets: readonly ExerciseTarget[]
    ): readonly CorrectPairing[] {
        return targets.map((target: ExerciseTarget) => ({
            itemId: target.acceptsItemId,
            targetId: target.id
        }));
    }

    /**
     * Génère une description pour un exemple
     * @param example Exemple à décrire
     * @param concept Données du concept
     * @param conceptDetails Détails du concept
     * @returns Description générée
     * @private
     */
    private generateDescriptionForExample(
        example: string,
        concept: LSFConcept,
        conceptDetails: LSFConceptDetails
    ): string {
        const description = conceptDetails.explanation || `Description du signe "${concept.text}"`;
        return ExerciseGeneratorUtils.generateDescriptionForExample(example, description);
    }

    /**
     * Mélange un tableau de manière aléatoire
     * @param array Tableau à mélanger
     * @returns Tableau mélangé
     * @private
     */
    private shuffleElements<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Obtient la limite de temps par défaut selon la difficulté
     * @param difficulty Niveau de difficulté
     * @returns Temps limite en secondes
     * @private
     */
    private getDefaultTimeLimit(difficulty: number): number {
        if (difficulty <= 0.3) return DragDropGenerator.DEFAULT_TIME_LIMITS.easy;
        if (difficulty <= 0.7) return DragDropGenerator.DEFAULT_TIME_LIMITS.medium;
        return DragDropGenerator.DEFAULT_TIME_LIMITS.hard;
    }

    /**
     * Calcule le nombre d'indices selon la difficulté
     * @param difficulty Niveau de difficulté
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
        // Adapter la difficulté selon l'écart entre le niveau utilisateur et la difficulté
        const adjustment = (userSkillLevel - originalDifficulty) * 0.3;
        const adaptedDifficulty = originalDifficulty + adjustment;

        // Maintenir dans les limites [0, 1]
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
        const baseDuration = 5; // 5 minutes de base
        const difficultyMultiplier = 1 + (difficulty * 0.5); // +50% max
        return Math.round(baseDuration * difficultyMultiplier);
    }
}