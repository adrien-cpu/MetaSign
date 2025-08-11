/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/VideoResponseGenerator.ts
 * @description Générateur d'exercices de type réponse vidéo
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
 * Interface pour le contenu spécifique aux exercices de réponse vidéo
 */
export interface VideoResponseExerciseContent {
    readonly phraseToSign: string;
    readonly referenceVideoUrl: string;
    readonly evaluationCriteria: readonly string[];
    readonly maxRecordingDuration: number;
    readonly minRecordingDuration: number;
    readonly showReferenceVideo: boolean;
    readonly showSlowMotionOption?: boolean;
    readonly timeLimited?: boolean;
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
interface ExtendedExercise extends Exercise<VideoResponseExerciseContent> {
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
 * Classe spécialisée dans la génération d'exercices de type réponse vidéo
 * 
 * @class VideoResponseGenerator
 * @extends BaseExerciseGenerator
 * @description Génère des exercices où l'utilisateur doit s'enregistrer en train de signer
 * et être évalué automatiquement sur ses performances LSF
 * 
 * @example
 * ```typescript
 * const generator = new VideoResponseGenerator();
 * const exercise = await generator.generateExercise({
 *   conceptId: 'greetings',
 *   difficultyLevel: 0.5,
 *   includeHints: true
 * });
 * ```
 */
export class VideoResponseGenerator extends BaseExerciseGenerator {
    /**
     * Logger pour le générateur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('VideoResponseGenerator');

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
    private static readonly DEFAULT_TIME_LIMITS: Record<DifficultyLevel, number> = {
        'beginner': 900,  // 15 minutes
        'easy': 720,      // 12 minutes
        'medium': 600,    // 10 minutes
        'hard': 480,      // 8 minutes
        'expert': 360     // 6 minutes
    } as const;

    /**
     * Durées maximales d'enregistrement selon la difficulté
     * @private
     * @static
     * @readonly
     */
    private static readonly MAX_RECORDING_DURATIONS: Record<DifficultyLevel, number> = {
        'beginner': 60,   // 1 minute
        'easy': 45,       // 45 secondes
        'medium': 30,     // 30 secondes
        'hard': 20,       // 20 secondes
        'expert': 15      // 15 secondes
    } as const;

    /**
     * Durées minimales d'enregistrement selon la difficulté
     * @private
     * @static
     * @readonly
     */
    private static readonly MIN_RECORDING_DURATIONS: Record<DifficultyLevel, number> = {
        'beginner': 5,    // 5 secondes
        'easy': 5,        // 5 secondes
        'medium': 3,      // 3 secondes
        'hard': 2,        // 2 secondes
        'expert': 1       // 1 seconde
    } as const;

    /**
     * Constructeur du générateur
     * 
     * @constructor
     */
    constructor() {
        super();
        this.conceptsService = ConceptsDataService.getInstance();

        this.logger.info('🎯 VideoResponseGenerator initialisé', {
            version: VideoResponseGenerator.GENERATOR_VERSION
        });
    }

    /**
     * Génère un exercice de type réponse vidéo
     * 
     * @method generateExercise
     * @async
     * @param {ExerciseGenerationContext} context - Contexte de génération
     * @returns {Promise<ExtendedExercise>} Exercice généré
     * @public
     */
    public async generateExercise(context: ExerciseGenerationContext): Promise<ExtendedExercise> {
        this.logger.info(`🎯 Génération d'exercice video-response pour le concept ${context.conceptId}`);

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
            const phraseToSign = this.selectPhraseToSign(concept, conceptDetails);

            // Génération de base de l'exercice
            let exercise: ExtendedExercise = {
                id: this.generateExerciseId('video-response', context.conceptId),
                conceptId: context.conceptId,
                type: 'VideoResponse' as SupportedExerciseType,
                difficulty: effectiveDifficulty,
                instructions: 'Enregistrez-vous en signant la phrase suivante en LSF',
                content: {
                    phraseToSign,
                    referenceVideoUrl: this.getReferenceVideoUrl(context.conceptId, phraseToSign),
                    evaluationCriteria: this.getEvaluationCriteria(difficultyLevel),
                    maxRecordingDuration: this.getMaxRecordingDuration(difficultyLevel),
                    minRecordingDuration: this.getMinRecordingDuration(difficultyLevel),
                    showReferenceVideo: true
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

            this.logger.info('✅ Exercice video-response généré avec succès', {
                exerciseId: exercise.id,
                difficulty: effectiveDifficulty,
                phraseToSign: phraseToSign,
                maxDuration: exercise.content.maxRecordingDuration
            });

            return exercise;

        } catch (error) {
            this.logger.error('❌ Erreur lors de la génération d\'exercice video-response', {
                conceptId: context.conceptId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`Échec de la génération d'exercice video-response: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Adapte la difficulté d'un exercice de type réponse vidéo
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

        // Pour les débutants
        if (userSkillLevel < 0.3) {
            // Simplifier les critères d'évaluation
            const simplifiedCriteria = content.evaluationCriteria.filter(criterion =>
                criterion.includes('configuration') ||
                criterion.includes('mouvement')
            );
            content.evaluationCriteria = simplifiedCriteria;

            // Toujours montrer la vidéo de référence
            content.showReferenceVideo = true;

            // Option pour voir la vidéo en ralenti
            content.showSlowMotionOption = true;

            // Augmenter les durées d'enregistrement
            content.maxRecordingDuration = Math.round(content.maxRecordingDuration * 1.5);

            // Augmenter le temps limite
            adaptedExercise.timeLimit = Math.round(adaptedExercise.timeLimit * 1.5);
        }
        // Pour les avancés
        else if (userSkillLevel > 0.7) {
            // Critères d'évaluation plus stricts
            const additionalCriteria = [
                'fluidité du mouvement',
                'synchronisation des composantes non-manuelles',
                'respect du rythme et des transitions'
            ];
            content.evaluationCriteria = [...content.evaluationCriteria, ...additionalCriteria];

            // Ne pas montrer la vidéo de référence (plus difficile)
            content.showReferenceVideo = false;

            // Ajouter des contraintes de temps
            content.timeLimited = true;

            // Réduire les durées d'enregistrement
            content.maxRecordingDuration = Math.round(content.maxRecordingDuration * 0.8);

            // Réduire le temps limite pour les experts
            adaptedExercise.timeLimit = Math.round(adaptedExercise.timeLimit * 0.8);
        }

        adaptedExercise.content = content;
        adaptedExercise.difficulty = this.calculateAdaptedDifficulty(exercise.difficulty, userSkillLevel);

        this.logger.debug('✅ Difficulté adaptée', {
            exerciseId: exercise.id,
            newDifficulty: adaptedExercise.difficulty,
            newTimeLimit: adaptedExercise.timeLimit,
            showReferenceVideo: content.showReferenceVideo,
            criteriaCount: content.evaluationCriteria.length
        });

        return adaptedExercise;
    }

    /**
     * Génère des indices spécifiques pour les exercices de type réponse vidéo
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

            // Indices spécifiques aux exercices de type réponse vidéo
            const availableHints: readonly string[] = [
                'Pratiquez le signe plusieurs fois avant l\'enregistrement',
                'Faites attention à votre expression faciale',
                'Le rythme du signe est aussi important que sa forme',
                'Positionnez-vous bien face à la caméra',
                'Assurez-vous d\'être dans un environnement bien éclairé',
                'Prenez le temps de décomposer le mouvement avant de l\'exécuter en entier',
                `Ce concept est lié à ${concept?.relatedConcepts.join(', ') || 'des concepts associés'}`,
                'Maintenez une posture droite et détendue',
                'Utilisez l\'espace de signation de manière appropriée'
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
                'Pratiquez le signe plusieurs fois avant l\'enregistrement',
                'Faites attention à votre expression faciale',
                'Le rythme du signe est aussi important que sa forme',
                'Positionnez-vous bien face à la caméra'
            ];

            adaptedExercise.hints = genericHints.slice(0, Math.min(count, genericHints.length));
            return adaptedExercise;
        }
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Sélectionne une phrase ou expression à signer
     * @param concept Données du concept
     * @param conceptDetails Détails du concept
     * @returns Phrase à signer
     * @private
     */
    private selectPhraseToSign(concept: LSFConcept, conceptDetails: LSFConceptDetails): string {
        // Si le concept a des exemples, en sélectionner un aléatoirement
        if (conceptDetails.examples.length > 0) {
            const randomIndex = Math.floor(Math.random() * conceptDetails.examples.length);
            return conceptDetails.examples[randomIndex];
        }

        // Sinon, générer une phrase basée sur le nom du concept
        return `Montrez le signe pour "${concept.text}" en LSF`;
    }

    /**
     * Obtient l'URL de la vidéo de référence
     * @param conceptId Identifiant du concept
     * @param phrase Phrase à signer
     * @returns URL de la vidéo de référence
     * @private
     */
    private getReferenceVideoUrl(conceptId: string, phrase: string): string {
        // Normalisation du nom de la phrase pour l'URL
        const normalizedPhrase = phrase
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_');

        return `/assets/references/${conceptId}/${normalizedPhrase}.mp4`;
    }

    /**
     * Obtient les critères d'évaluation selon la difficulté
     * @param difficultyLevel Niveau de difficulté
     * @returns Liste des critères d'évaluation
     * @private
     */
    private getEvaluationCriteria(difficultyLevel: DifficultyLevel): readonly string[] {
        // Critères de base présents pour tous les niveaux
        const baseCriteria = [
            'configuration des mains',
            'mouvement'
        ];

        // Critères additionnels selon la difficulté
        const additionalCriteria: Record<DifficultyLevel, readonly string[]> = {
            beginner: [],
            easy: ['expression faciale'],
            medium: ['expression faciale', 'rythme'],
            hard: ['expression faciale', 'rythme', 'utilisation de l\'espace'],
            expert: ['expression faciale', 'rythme', 'utilisation de l\'espace', 'fluidité des transitions']
        };

        return [...baseCriteria, ...additionalCriteria[difficultyLevel]];
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
        return VideoResponseGenerator.DEFAULT_TIME_LIMITS[difficultyLevel];
    }

    /**
     * Obtient la durée maximale d'enregistrement selon la difficulté
     * @param difficultyLevel Niveau de difficulté
     * @returns Durée maximale en secondes
     * @private
     */
    private getMaxRecordingDuration(difficultyLevel: DifficultyLevel): number {
        return VideoResponseGenerator.MAX_RECORDING_DURATIONS[difficultyLevel];
    }

    /**
     * Obtient la durée minimale d'enregistrement selon la difficulté
     * @param difficultyLevel Niveau de difficulté
     * @returns Durée minimale en secondes
     * @private
     */
    private getMinRecordingDuration(difficultyLevel: DifficultyLevel): number {
        return VideoResponseGenerator.MIN_RECORDING_DURATIONS[difficultyLevel];
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
        const baseDuration = 10; // 10 minutes de base pour un exercice vidéo
        const difficultyMultiplier = 1 + (difficulty * 0.5);
        return Math.round(baseDuration * difficultyMultiplier);
    }
}