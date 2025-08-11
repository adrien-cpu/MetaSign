/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/hints/ExerciseHintsService.ts
 * @description Service de gestion des indices pour les exercices
 * Génère des indices adaptés au type d'exercice et au niveau de l'apprenant
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.2
 * @since 2025
 * @lastModified 2025-07-22
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    CECRLLevel,
    SupportedExerciseType
} from '../types/ExerciseGeneratorTypes';

/**
 * Type pour les niveaux de difficulté d'exercice
 */
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Interface pour les réponses d'exercices
 */
export interface ExerciseResponse {
    readonly correctAnswer?: unknown;
    readonly expectedValue?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface pour les générateurs d'indices spécifiques par type d'exercice
 */
interface IHintGenerator {
    /**
     * Génère des indices spécifiques à un type d'exercice
     * @param level - Niveau CECRL de l'apprenant
     * @param expectedResponse - Réponse attendue à l'exercice (optionnel)
     * @returns Liste d'indices contextuels
     */
    generateSpecificHints(level: CECRLLevel, expectedResponse?: ExerciseResponse): readonly string[];
}

/**
 * Configuration pour le service d'indices
 */
interface HintsServiceConfig {
    readonly enableLevelAdaptation?: boolean;
    readonly maxHintsPerExercise?: number;
    readonly enableContextualHints?: boolean;
}

/**
 * Service responsable de la génération d'indices contextuels et pédagogiques
 * pour aider les apprenants dans leurs exercices de LSF
 * 
 * @class ExerciseHintsService
 * @description Fournit des indices adaptatifs selon le type d'exercice, le niveau CECRL
 * et la difficulté pour optimiser l'apprentissage de la LSF
 * 
 * @example
 * ```typescript
 * const hintsService = new ExerciseHintsService();
 * const hints = hintsService.generateHints(
 *   'MultipleChoice',
 *   'A1',
 *   'easy',
 *   { correctAnswer: 2 }
 * );
 * ```
 */
export class ExerciseHintsService {
    /**
     * Logger pour le service
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('ExerciseHintsService');

    /**
     * Générateurs d'indices spécialisés par type d'exercice
     * @private
     * @readonly
     */
    private readonly hintGenerators = new Map<SupportedExerciseType, IHintGenerator>();

    /**
     * Configuration du service
     * @private
     * @readonly
     */
    private readonly config: Required<HintsServiceConfig>;

    /**
     * Version du service
     * @private
     * @static
     * @readonly
     */
    private static readonly SERVICE_VERSION = '3.0.2';

    /**
     * Initialise le service de gestion des indices
     * 
     * @constructor
     * @param {HintsServiceConfig} config - Configuration optionnelle du service
     */
    constructor(config: HintsServiceConfig = {}) {
        this.config = {
            enableLevelAdaptation: config.enableLevelAdaptation ?? true,
            maxHintsPerExercise: config.maxHintsPerExercise ?? 5,
            enableContextualHints: config.enableContextualHints ?? true
        };

        this.registerDefaultHintGenerators();

        this.logger.info('🎯 ExerciseHintsService initialisé', {
            version: ExerciseHintsService.SERVICE_VERSION,
            config: this.config
        });
    }

    /**
     * Génère des indices pour un exercice
     * 
     * @method generateHints
     * @param {SupportedExerciseType} type - Type d'exercice
     * @param {CECRLLevel} level - Niveau CECRL de l'apprenant
     * @param {ExerciseDifficulty} difficulty - Difficulté de l'exercice
     * @param {ExerciseResponse} expectedResponse - Réponse attendue
     * @returns {readonly string[]} Liste d'indices
     * @public
     */
    public generateHints(
        type: SupportedExerciseType,
        level: CECRLLevel,
        difficulty: ExerciseDifficulty,
        expectedResponse: ExerciseResponse = {}
    ): readonly string[] {
        this.logger.debug('💡 Génération d\'indices', {
            type,
            level,
            difficulty,
            hasExpectedResponse: Object.keys(expectedResponse).length > 0
        });

        try {
            // Nombre d'indices selon la difficulté
            const hintsCount = this.determineHintsCount(difficulty, level);

            if (hintsCount === 0) {
                this.logger.debug('Aucun indice généré pour ce niveau de difficulté');
                return [];
            }

            // Indices spécifiques au type d'exercice
            const availableHints = this.getHintsByExerciseType(type, level, expectedResponse);

            // Sélectionner aléatoirement des indices
            const selectedHints = this.selectRandomHints(availableHints, hintsCount);

            this.logger.debug('✅ Indices générés avec succès', {
                type,
                level,
                difficulty,
                selectedCount: selectedHints.length,
                availableCount: availableHints.length
            });

            return selectedHints;

        } catch (error) {
            this.logger.error('❌ Erreur lors de la génération d\'indices', {
                type,
                level,
                difficulty,
                error: error instanceof Error ? error.message : String(error)
            });

            // Fallback avec indices génériques
            return this.getFallbackHints();
        }
    }

    /**
     * Enregistre un générateur d'indices personnalisé pour un type d'exercice
     * 
     * @method registerHintGenerator
     * @param {SupportedExerciseType} type - Type d'exercice
     * @param {IHintGenerator} generator - Générateur d'indices spécifique
     * @public
     */
    public registerHintGenerator(type: SupportedExerciseType, generator: IHintGenerator): void {
        this.hintGenerators.set(type, generator);
        this.logger.debug('🔧 Générateur d\'indices enregistré', { type });
    }

    /**
     * Obtient les statistiques du service
     * 
     * @method getServiceStats
     * @returns {object} Statistiques du service
     * @public
     */
    public getServiceStats(): {
        readonly version: string;
        readonly registeredGenerators: number;
        readonly supportedTypes: readonly SupportedExerciseType[];
        readonly config: Required<HintsServiceConfig>;
    } {
        return {
            version: ExerciseHintsService.SERVICE_VERSION,
            registeredGenerators: this.hintGenerators.size,
            supportedTypes: Array.from(this.hintGenerators.keys()),
            config: this.config
        };
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Détermine le nombre d'indices à fournir selon la difficulté et le niveau
     * @param difficulty - Difficulté de l'exercice
     * @param level - Niveau CECRL de l'apprenant
     * @returns Nombre d'indices à générer
     * @private
     */
    private determineHintsCount(difficulty: ExerciseDifficulty, level: CECRLLevel): number {
        // Nombre de base d'indices selon la difficulté
        const baseCount: Record<ExerciseDifficulty, number> = {
            'easy': 3,
            'medium': 2,
            'hard': 1
        };

        if (!this.config.enableLevelAdaptation) {
            return Math.min(baseCount[difficulty] || 1, this.config.maxHintsPerExercise);
        }

        // Facteur d'ajustement selon le niveau CECRL
        const levelFactor: Record<CECRLLevel, number> = {
            'A1': 1.5,  // 50% d'indices supplémentaires
            'A2': 1.2,  // 20% d'indices supplémentaires
            'B1': 1.0,  // standard
            'B2': 0.8,  // 20% moins d'indices
            'C1': 0.6,  // 40% moins d'indices
            'C2': 0.4   // 60% moins d'indices
        };

        // Calcul ajusté
        const adjustedCount = Math.round((baseCount[difficulty] || 1) * (levelFactor[level] || 1.0));
        const finalCount = Math.max(0, Math.min(adjustedCount, this.config.maxHintsPerExercise));

        this.logger.debug('📊 Calcul du nombre d\'indices', {
            difficulty,
            level,
            baseCount: baseCount[difficulty],
            levelFactor: levelFactor[level],
            adjustedCount,
            finalCount
        });

        return finalCount;
    }

    /**
     * Obtient les indices disponibles par type d'exercice
     * @param type - Type d'exercice
     * @param level - Niveau CECRL de l'apprenant
     * @param expectedResponse - Réponse attendue pour contextualiser les indices
     * @returns Liste d'indices disponibles
     * @private
     */
    private getHintsByExerciseType(
        type: SupportedExerciseType,
        level: CECRLLevel,
        expectedResponse: ExerciseResponse
    ): readonly string[] {
        // Vérifier si un générateur d'indices spécifique est disponible
        const specificGenerator = this.hintGenerators.get(type);
        if (specificGenerator) {
            try {
                const specificHints = specificGenerator.generateSpecificHints(level, expectedResponse);
                if (specificHints.length > 0) {
                    this.logger.debug('📋 Utilisation du générateur spécifique', { type, hintsCount: specificHints.length });
                    return specificHints;
                }
            } catch (error) {
                this.logger.warn('⚠️ Erreur dans le générateur spécifique, utilisation des indices génériques', {
                    type,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // Indices génériques selon le type d'exercice
        const genericHints = this.getGenericHints(type);

        // Indices spécifiques au niveau si activés
        const levelSpecificHints = this.config.enableLevelAdaptation
            ? this.getLevelSpecificHints(level)
            : [];

        // Combiner les indices
        const combinedHints = [...genericHints, ...levelSpecificHints];

        this.logger.debug('📋 Combinaison d\'indices', {
            type,
            level,
            genericCount: genericHints.length,
            levelSpecificCount: levelSpecificHints.length,
            totalCount: combinedHints.length
        });

        return combinedHints;
    }

    /**
     * Sélectionne aléatoirement des indices parmi les disponibles
     * @param availableHints - Indices disponibles
     * @param count - Nombre d'indices à sélectionner
     * @returns Indices sélectionnés
     * @private
     */
    private selectRandomHints(availableHints: readonly string[], count: number): readonly string[] {
        if (availableHints.length === 0) {
            return [];
        }

        const selectedHints: string[] = [];
        const availableHintsCopy = [...availableHints];

        for (let i = 0; i < count && availableHintsCopy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableHintsCopy.length);
            selectedHints.push(availableHintsCopy[randomIndex]);
            availableHintsCopy.splice(randomIndex, 1);
        }

        return selectedHints;
    }

    /**
     * Obtient des indices génériques pour chaque type d'exercice
     * @param type - Type d'exercice
     * @returns Liste d'indices génériques
     * @private
     */
    private getGenericHints(type: SupportedExerciseType): readonly string[] {
        // Indices génériques par type d'exercice
        const genericHintsByType: Partial<Record<SupportedExerciseType, readonly string[]>> = {
            'MultipleChoice': [
                'Concentrez-vous sur les mots clés de chaque option',
                'Éliminez d\'abord les options clairement incorrectes',
                'Recherchez la cohérence avec le contexte',
                'Vérifiez les nuances grammaticales dans les options',
                'Observez les indices visuels dans la question'
            ],
            'DragDrop': [
                'Identifiez d\'abord les éléments de début et de fin',
                'Recherchez des indices chronologiques ou logiques',
                'Organisez par ordre de complexité ou d\'importance',
                'Regroupez les éléments qui partagent des caractéristiques',
                'Visualisez l\'espace de signation pour organiser votre réponse'
            ],
            'FillBlank': [
                'Analysez le contexte autour de chaque espace',
                'Vérifiez la concordance grammaticale',
                'Considérez le sens global du texte',
                'Pensez aux expressions idiomatiques de la LSF',
                'Rappelez-vous des structures spécifiques au niveau demandé'
            ],
            'TextEntry': [
                'Structurez votre réponse avec une introduction et une conclusion',
                'Utilisez un vocabulaire précis et varié',
                'Appuyez votre réponse sur des exemples concrets',
                'Adaptez votre style au contexte demandé',
                'Pensez aux marqueurs culturels appropriés'
            ],
            'VideoResponse': [
                'Préparez mentalement votre discours avant d\'enregistrer',
                'Utilisez l\'espace de signation de manière cohérente',
                'Adaptez votre expression faciale au contenu',
                'Variez les configurations manuelles selon le contexte',
                'Utilisez les transferts personnels et situationnels quand approprié'
            ],
            'SigningPractice': [
                'Observez attentivement la formation des signes',
                'Pratiquez les mouvements lentement puis accélérez',
                'Vérifiez votre position des mains et des doigts',
                'Synchronisez vos expressions faciales avec les signes',
                'Utilisez l\'espace de signation de manière appropriée'
            ]
        };

        return genericHintsByType[type] || this.getFallbackHints();
    }

    /**
     * Obtient des indices spécifiques au niveau CECRL
     * @param level - Niveau CECRL de l'apprenant
     * @returns Liste d'indices adaptés au niveau
     * @private
     */
    private getLevelSpecificHints(level: CECRLLevel): readonly string[] {
        const levelSpecificHints: Record<CECRLLevel, readonly string[]> = {
            'A1': [
                'Concentrez-vous sur le vocabulaire de base',
                'Utilisez des structures simples',
                'Gardez vos expressions visuelles claires'
            ],
            'A2': [
                'Pensez aux expressions courantes',
                'Liez vos idées simplement',
                'Utilisez l\'espace de signation de façon basique'
            ],
            'B1': [
                'Exprimez votre opinion avec des structures appropriées',
                'Diversifiez votre vocabulaire',
                'Utilisez des transferts simples'
            ],
            'B2': [
                'Nuancez votre expression',
                'Utilisez des structures complexes',
                'Intégrez des expressions idiomatiques'
            ],
            'C1': [
                'Argumentez avec précision',
                'Utilisez des métaphores visuelles',
                'Maîtrisez les aspects culturels de la LSF'
            ],
            'C2': [
                'Adaptez votre registre de langue',
                'Utilisez des formes d\'expression créatives',
                'Intégrez subtilement des références culturelles'
            ]
        };

        return levelSpecificHints[level] || [];
    }

    /**
     * Obtient des indices de fallback en cas d'erreur
     * @returns Indices génériques de base
     * @private
     */
    private getFallbackHints(): readonly string[] {
        return [
            'Lisez attentivement les instructions',
            'Prenez votre temps pour comprendre la question',
            'Relisez votre réponse avant de la soumettre',
            'Utilisez votre connaissance du contexte LSF'
        ];
    }

    /**
     * Enregistre les générateurs d'indices par défaut
     * @private
     */
    private registerDefaultHintGenerators(): void {
        // Générateur pour exercices à choix multiples
        this.registerHintGenerator('MultipleChoice', {
            generateSpecificHints: (level: CECRLLevel, expectedResponse?: ExerciseResponse): readonly string[] => {
                const specificHints: string[] = [];

                // Adaptation selon le niveau
                if (level === 'A1' || level === 'A2') {
                    specificHints.push('Recherchez les mots clés familiers dans chaque option');
                } else if (level === 'B1' || level === 'B2') {
                    specificHints.push('Analysez les subtilités grammaticales entre les options');
                } else {
                    specificHints.push('Évaluez les nuances culturelles et idiomatiques des options');
                }

                // Indice contextuel basé sur la réponse attendue (si fournie)
                if (this.config.enableContextualHints && expectedResponse?.correctAnswer !== undefined) {
                    const correctAnswer = expectedResponse.correctAnswer as number;
                    if (typeof correctAnswer === 'number') {
                        if (correctAnswer === 0) {
                            specificHints.push('Parfois, la première impression est la bonne');
                        } else if (correctAnswer >= 3) {
                            specificHints.push('N\'écartez pas trop vite les dernières options');
                        } else {
                            specificHints.push('La réponse n\'est pas toujours aux extrémités');
                        }
                    }
                }

                return specificHints;
            }
        });

        // Générateur pour exercices de glisser-déposer
        this.registerHintGenerator('DragDrop', {
            generateSpecificHints: (level: CECRLLevel): readonly string[] => {
                const specificHints: string[] = [];

                if (level === 'A1' || level === 'A2') {
                    specificHints.push('Commencez par les associations les plus évidentes');
                } else {
                    specificHints.push('Analysez les relations logiques entre les éléments');
                }

                specificHints.push('Utilisez le processus d\'élimination pour les dernières associations');

                return specificHints;
            }
        });

        this.logger.info('🔧 Générateurs d\'indices par défaut enregistrés', {
            count: this.hintGenerators.size
        });
    }
}