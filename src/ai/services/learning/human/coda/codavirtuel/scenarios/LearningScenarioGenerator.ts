/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/LearningScenarioGenerator.ts
 * @description Générateur de scénarios d'apprentissage pour le système CODA virtuel
 * @author MetaSign
 * @version 1.5.0 - Version entièrement corrigée avec tous les types
 * @since 2024
 * @lastModified 2025-07-27
 */

import { Logger } from '@/ai/utils/Logger';
import { ThemeCatalogService } from './catalog/ThemeCatalogService';

// ✅ Import du service corrigé avec interface publique
import { ExerciseGeneratorService } from '../exercises/ExerciseGeneratorService';

// ✅ Import des types depuis les fichiers appropriés
import { ErrorCategory as ExerciseErrorCategory } from './exercises/types/ExerciseTypes';
import { ExerciseType as ScenarioExerciseType, ExerciseDifficulty } from './types/DifficultyTypes';

// ✅ Import des types d'exercices spécifiques aux scénarios  
import type {
    Exercise as ScenarioExercise,
    ExerciseContent,
    ExerciseResponse
} from './exercises/types/ExerciseTypes';

// ================== DÉFINITIONS LOCALES DES TYPES MANQUANTS ==================

/**
 * Niveaux du Cadre Européen Commun de Référence pour les Langues (unifiés)
 */
export enum CECRLLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2'
}

/**
 * Énumération des types de scénarios d'apprentissage
 */
export enum ScenarioType {
    CONVERSATION = 'conversation',
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    CULTURAL = 'cultural',
    PRACTICAL = 'practical',
    ASSESSMENT = 'assessment',
    ACADEMIC = 'academic',
    PROFESSIONAL = 'professional',
    EMERGENCY = 'emergency',
    STORYTELLING = 'storytelling'
}

/**
 * Énumération des types d'exercices
 */
export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple-choice',
    MULTIPLE_CHOICE_KEBAB = 'multiple-choice-kebab',
    DRAG_DROP = 'drag-drop',
    DRAG_DROP_KEBAB = 'drag-drop-kebab',
    FILL_BLANK = 'fill-blank',
    FILL_BLANK_KEBAB = 'fill-blank-kebab',
    TEXT_ENTRY = 'text-entry',
    TEXT_ENTRY_KEBAB = 'text-entry-kebab',
    VIDEO_RESPONSE = 'video-response',
    VIDEO_RESPONSE_KEBAB = 'video-response-kebab',
    MATCHING = 'matching',
    REORDERING = 'ordering'
}

/**
 * Interface pour les préférences utilisateur
 */
export interface UserPreferences {
    readonly preferredThemes?: readonly string[];
    readonly preferredDifficulty?: ExerciseDifficulty;
    readonly preferredExerciseTypes?: readonly ExerciseType[];
    readonly learningGoals?: readonly string[];
}

/**
 * Interface pour les paramètres de génération d'exercices
 */
export interface ExerciseGenerationParams {
    readonly type: string;
    readonly level: CECRLLevel;
    readonly difficulty: number;
    readonly focusAreas: readonly string[];
    readonly userId: string;
    readonly typeSpecificParams?: Record<string, unknown>;
}

/**
 * Interface pour les paramètres de génération de scénarios
 */
export interface ScenarioGenerationParams {
    readonly type: ScenarioType;
    readonly level: CECRLLevel;
    readonly specificTheme?: string;
    readonly masteredConcepts?: readonly string[];
    readonly userPreferences?: UserPreferences;
}

/**
 * Interface pour un thème d'apprentissage (locale, évite le conflit)
 */
export interface LearningThemeLocal {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly level: CECRLLevel;
    readonly difficulty: ExerciseDifficulty;
    readonly estimatedDuration: number;
    readonly associatedConcepts?: readonly string[];
    readonly prerequisites?: readonly string[];
    readonly tags?: readonly string[];
    readonly isActive?: boolean;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

/**
 * Interface pour un thème d'apprentissage (compatible avec ThemeCatalogService)
 */
export interface LearningTheme {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly associatedConcepts?: readonly string[];
}

/**
 * Interface pour la proficiency de l'avatar
 */
export interface AvatarProficiency {
    readonly level: CECRLLevel;
    readonly errorRate: number;
    readonly errorTypes: readonly string[];
}

/**
 * Interface pour un exercice du système core
 */
export interface Exercise {
    readonly id: string;
    readonly title: string;
    readonly type: string;
    readonly difficulty: ExerciseDifficulty;
    readonly content: unknown;
    readonly description?: string;
    readonly instructions?: string;
    readonly estimatedTime?: number;
    readonly timeLimit?: number;
    readonly hints?: readonly string[];
    readonly hint?: string;
    readonly maxPoints?: number;
    readonly testedConcepts?: readonly string[];
    readonly skillsFocus?: Partial<Record<string, number>>;
    readonly primarySkill?: string;
    readonly expectedResponse?: unknown;
    readonly targetLevel?: CECRLLevel;
}

/**
 * Interface pour un scénario d'apprentissage complet
 */
export interface LearningScenario {
    readonly id: string;
    readonly title: string;
    readonly type: ScenarioType;
    readonly level: CECRLLevel;
    readonly theme: LearningThemeLocal; // ✅ Utilise LearningThemeLocal
    readonly introduction: string;
    readonly exercises: readonly Exercise[];
    readonly totalPoints: number;
    readonly estimatedDuration: number;
    readonly coveredConcepts: readonly string[];
    readonly avatarProficiency: AvatarProficiency;
}

/**
 * Interface pour la structure attendue par convertToScenarioExercise
 */
interface ExerciseGeneratorResponse {
    readonly id: string;
    readonly type: string;
    readonly content: unknown;
    readonly metadata: {
        readonly level: CECRLLevel; // ✅ Utilise le CECRLLevel local
        readonly difficulty: number;
        readonly estimatedDuration: number;
        readonly createdAt: Date;
        readonly version: string;
        readonly tags: readonly string[];
        readonly targetSkills: readonly string[];
        readonly prerequisites: readonly string[];
    };
}

/**
 * Service responsable de la génération de scénarios d'apprentissage
 * adaptés au niveau et aux préférences de l'utilisateur
 */
export class LearningScenarioGenerator {
    private readonly logger: Logger;
    private readonly themeCatalog: ThemeCatalogService;
    private readonly exerciseGenerator: ExerciseGeneratorService;

    /**
     * Initialise le générateur de scénarios
     * @param themeCatalog Service de catalogue de thèmes
     * @param exerciseGenerator Service de génération d'exercices
     */
    constructor(
        themeCatalog: ThemeCatalogService,
        exerciseGenerator: ExerciseGeneratorService
    ) {
        this.logger = new Logger('LearningScenarioGenerator');
        this.themeCatalog = themeCatalog;
        this.exerciseGenerator = exerciseGenerator;

        this.logger.info('LearningScenarioGenerator initialisé');
    }

    /**
     * Génère un scénario d'apprentissage complet
     * @param params Paramètres de génération
     * @returns Promise<LearningScenario> Scénario généré
     */
    public async generateScenario(params: ScenarioGenerationParams): Promise<LearningScenario> {
        try {
            // 1. Sélection d'un thème approprié
            const rawTheme = await this.selectTheme(params);
            const theme = this.convertToLocalTheme(rawTheme); // ✅ Conversion vers LearningThemeLocal

            // 2. Génération d'une introduction adaptée au niveau
            const introduction = this.generateIntroduction(params.type, theme, params.level);

            // 3. Génération des exercices adaptés
            const exerciseTypeParam = params.type === ScenarioType.ASSESSMENT
                ? undefined
                : this.getPreferredExerciseType(params);

            // Génération multiple d'exercices
            const exerciseCount = this.determineExerciseCount(params.type, params.level);
            const scenarioExercises: ScenarioExercise[] = [];

            for (let i = 0; i < exerciseCount; i++) {
                try {
                    // ✅ Adaptation des paramètres au format attendu par ExerciseGeneratorService
                    const exerciseParams: ExerciseGenerationParams = {
                        type: this.mapCoreExerciseTypeToString(exerciseTypeParam || ExerciseType.MULTIPLE_CHOICE),
                        level: params.level,
                        difficulty: this.calculateDifficultyFromLevel(params.level),
                        focusAreas: params.masteredConcepts || [],
                        userId: `scenario_user_${Date.now()}`,
                        typeSpecificParams: {
                            theme: theme.id,
                            masteredConcepts: params.masteredConcepts || []
                        }
                    };

                    // ✅ Utilisation correcte du service de génération d'exercices
                    const generatedExercise = await this.exerciseGenerator.generateExercise(exerciseParams);

                    if (generatedExercise) {
                        // ✅ Adaptation des types pour la conversion avec conversion CECRLLevel
                        const adaptedExercise: ExerciseGeneratorResponse = {
                            id: generatedExercise.id,
                            type: generatedExercise.type,
                            content: generatedExercise.content,
                            metadata: {
                                level: this.convertToCECRLLevel(generatedExercise.level), // ✅ Conversion explicite
                                difficulty: generatedExercise.difficulty,
                                estimatedDuration: generatedExercise.metadata.estimatedDuration,
                                createdAt: generatedExercise.metadata.createdAt,
                                version: generatedExercise.metadata.version,
                                tags: generatedExercise.metadata.tags,
                                targetSkills: generatedExercise.metadata.targetSkills,
                                prerequisites: generatedExercise.metadata.prerequisites
                            }
                        };

                        // Conversion de l'exercice généré vers le format ScenarioExercise
                        const scenarioExercise = this.convertToScenarioExercise(adaptedExercise, theme);
                        scenarioExercises.push(scenarioExercise);
                    }
                } catch (error) {
                    this.logger.warn(`Échec de génération d'exercice ${i + 1}/${exerciseCount}: ${error instanceof Error ? error.message : String(error)}`);
                    // Continue avec les autres exercices même si un échec se produit
                }
            }

            // Conversion des exercices du format scenario au format core
            const exercises = this.mapExercisesToCore(scenarioExercises);

            // 4. Calcul des points et de la durée estimée avec vérification des propriétés
            const totalPoints = exercises.reduce((sum: number, ex: Exercise) => sum + (ex.maxPoints ?? 10), 0);
            const estimatedDuration = Math.ceil(
                exercises.reduce((sum: number, ex: Exercise) => sum + (ex.estimatedTime ?? 60), 0) / 60
            ); // En minutes

            // 5. Extraction des concepts couverts
            const coveredConcepts = this.extractCoveredConcepts(exercises, theme);

            // 6. Création du scénario complet
            const scenario: LearningScenario = {
                id: `scenario_${params.level}_${params.type.toLowerCase()}_${Date.now()}`,
                title: this.generateTitle(params.type, theme, params.level),
                type: params.type,
                level: params.level,
                theme,
                introduction,
                exercises,
                totalPoints,
                estimatedDuration,
                coveredConcepts,
                avatarProficiency: {
                    level: params.level,
                    errorRate: 0, // Sera défini par le simulateur d'erreurs
                    errorTypes: [] // Sera défini par le simulateur d'erreurs
                }
            };

            this.logger.info(`Scénario généré: ${scenario.title} (${exercises.length} exercices)`);

            return scenario;
        } catch (error) {
            this.logger.error(`Erreur lors de la génération du scénario: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Échec de génération du scénario: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * ✅ Convertit un type d'exercice ExerciseType vers string
     * @param exerciseType Type d'exercice du système principal
     * @returns Type d'exercice sous forme de string
     * @private
     */
    private mapCoreExerciseTypeToString(exerciseType: ExerciseType): string {
        switch (exerciseType) {
            case ExerciseType.MULTIPLE_CHOICE:
            case ExerciseType.MULTIPLE_CHOICE_KEBAB:
                return 'multiple_choice';
            case ExerciseType.DRAG_DROP:
            case ExerciseType.DRAG_DROP_KEBAB:
                return 'drag_drop';
            case ExerciseType.FILL_BLANK:
            case ExerciseType.FILL_BLANK_KEBAB:
                return 'fill_blank';
            case ExerciseType.TEXT_ENTRY:
            case ExerciseType.TEXT_ENTRY_KEBAB:
                return 'text_entry';
            case ExerciseType.VIDEO_RESPONSE:
            case ExerciseType.VIDEO_RESPONSE_KEBAB:
                return 'video_response';
            case ExerciseType.MATCHING:
                return 'matching';
            case ExerciseType.REORDERING:
                return 'ordering';
            default:
                return 'multiple_choice'; // Fallback par défaut
        }
    }

    /**
     * Calcule un niveau de difficulté numérique à partir du niveau CECRL
     * @param level Niveau CECRL
     * @returns Difficulté entre 0 et 1
     * @private
     */
    private calculateDifficultyFromLevel(level: CECRLLevel): number {
        switch (level) {
            case CECRLLevel.A1:
                return 0.1;
            case CECRLLevel.A2:
                return 0.3;
            case CECRLLevel.B1:
                return 0.5;
            case CECRLLevel.B2:
                return 0.7;
            case CECRLLevel.C1:
                return 0.85;
            case CECRLLevel.C2:
                return 0.95;
            default:
                return 0.5;
        }
    }

    /**
     * ✅ Convertit un exercice généré par ExerciseGeneratorService vers le format ScenarioExercise
     * @param generatedExercise Exercice généré
     * @param theme Thème du scénario (local)
     * @returns Exercice au format ScenarioExercise
     * @private
     */
    private convertToScenarioExercise(
        generatedExercise: ExerciseGeneratorResponse,
        theme: LearningThemeLocal // ✅ Utilise LearningThemeLocal
    ): ScenarioExercise {
        // Mapping des types supportés vers les types scenario
        const typeMapping: Record<string, ScenarioExerciseType> = {
            'multiple_choice': 'multiple-choice',
            'drag_drop': 'drag-drop',
            'fill_blank': 'fill-blank',
            'text_entry': 'text-entry',
            'video_response': 'video-response',
            'matching': 'matching',
            'ordering': 'ordering'
        };

        const scenarioType = typeMapping[generatedExercise.type] || 'multiple-choice';

        // Mapping de la difficulté numérique vers ExerciseDifficulty
        const difficultyValue = generatedExercise.metadata.difficulty;
        const scenarioDifficulty: ExerciseDifficulty =
            difficultyValue <= 0.33 ? 'easy' :
                difficultyValue <= 0.66 ? 'medium' : 'hard';

        return {
            id: generatedExercise.id,
            title: `Exercice ${scenarioType}`,
            instructions: `Instructions pour l'exercice de type ${scenarioType}`,
            type: scenarioType,
            content: generatedExercise.content as ExerciseContent,
            difficulty: scenarioDifficulty,
            expectedResponse: this.generateExpectedResponse(scenarioType),
            hints: [`Indice pour l'exercice ${generatedExercise.id}`],
            timeLimit: generatedExercise.metadata.estimatedDuration,
            skillsFocus: this.generateSkillsFocus(theme),
            successFeedback: 'Excellent travail !',
            failureFeedback: 'Essayez encore, vous y êtes presque !',
            targetLevel: generatedExercise.metadata.level
        };
    }

    /**
     * ✅ Génère une réponse attendue basique selon le type d'exercice
     * @param exerciseType Type d'exercice
     * @returns Réponse attendue
     * @private
     */
    private generateExpectedResponse(exerciseType: ScenarioExerciseType): ExerciseResponse {
        switch (exerciseType) {
            case 'multiple-choice':
                return { selectedIndex: 0 };
            case 'drag-drop':
            case 'ordering':
                return { order: [0, 1, 2] };
            case 'fill-blank':
                return { filledBlanks: ['réponse1', 'réponse2'] };
            case 'text-entry':
                return { text: 'Réponse exemple' };
            case 'video-response':
                return { videoUrl: '', criteriaScores: [] };
            case 'matching':
                return { matches: [[0, 0], [1, 1]] };
            case 'correction':
                return { corrections: [] };
            default:
                return { selectedIndex: 0 };
        }
    }

    /**
     * ✅ Génère les compétences ciblées basées sur le thème
     * @param theme Thème du scénario (local)
     * @returns Compétences ciblées
     * @private
     */
    private generateSkillsFocus(theme: LearningThemeLocal): ExerciseErrorCategory[] {
        // Génère des compétences basées sur le thème et ses concepts associés
        const baseSkills: ExerciseErrorCategory[] = [
            ExerciseErrorCategory.VOCABULARY,
            ExerciseErrorCategory.GRAMMAR,
            ExerciseErrorCategory.EXPRESSION
        ];

        // Ajouter des compétences spécifiques basées sur le thème
        if (theme.associatedConcepts?.includes('spatial')) {
            baseSkills.push(ExerciseErrorCategory.SPATIAL);
        }

        return baseSkills;
    }

    /**
     * Convertit un tableau d'exercices du format scenario au format core
     * @param scenarioExercises Exercices au format scenario
     * @returns Exercices au format core
     * @private
     */
    private mapExercisesToCore(scenarioExercises: ScenarioExercise[]): Exercise[] {
        return scenarioExercises.map(ex => {
            // Construction de l'exercice au format core
            const coreExercise: Exercise = {
                id: ex.id,
                title: ex.title,
                type: ex.type,
                difficulty: ex.difficulty,
                content: ex.content,

                // Propriétés optionnelles
                description: ex.instructions || '',
                instructions: ex.instructions,
                estimatedTime: ex.timeLimit || 60,
                timeLimit: ex.timeLimit,
                hints: ex.hints,
                hint: ex.hints && ex.hints.length > 0 ? ex.hints[0] : undefined,
                maxPoints: 10, // Valeur par défaut
                testedConcepts: this.extractTestedConcepts(ex),
                skillsFocus: this.convertSkillsFocus(ex.skillsFocus),
                primarySkill: this.determinePrimarySkill(ex),
                expectedResponse: ex.expectedResponse,
                targetLevel: ex.targetLevel
            };

            return coreExercise;
        });
    }

    /**
     * Convertit les skillsFocus du format scenario vers le format unifié
     * @param skillsFocus Compétences ciblées du format scenario
     * @returns Compétences au format unifié
     * @private
     */
    private convertSkillsFocus(
        skillsFocus: ScenarioExercise['skillsFocus']
    ): Partial<Record<string, number>> | undefined {
        if (Array.isArray(skillsFocus)) {
            // Convertit un tableau en objet avec poids égal
            const result: Record<string, number> = {};
            skillsFocus.forEach((skill: string) => {
                result[skill] = 1;
            });
            return result;
        }

        if (skillsFocus && typeof skillsFocus === 'object') {
            // Retourne l'objet tel quel
            return skillsFocus as Partial<Record<string, number>>;
        }

        return undefined;
    }

    /**
     * Extrait les concepts testés à partir d'un exercice de scénario
     * @param exercise Exercice au format scenario
     * @returns Liste des concepts testés
     * @private
     */
    private extractTestedConcepts(exercise: ScenarioExercise): string[] {
        if (Array.isArray(exercise.skillsFocus)) {
            return exercise.skillsFocus;
        }

        if (exercise.skillsFocus && typeof exercise.skillsFocus === 'object') {
            return Object.keys(exercise.skillsFocus);
        }

        return [];
    }

    /**
     * Détermine la compétence principale testée par l'exercice
     * @param exercise Exercice au format scenario
     * @returns Compétence principale
     * @private
     */
    private determinePrimarySkill(exercise: ScenarioExercise): string {
        if (Array.isArray(exercise.skillsFocus) && exercise.skillsFocus.length > 0) {
            return exercise.skillsFocus[0];
        }

        if (exercise.skillsFocus && typeof exercise.skillsFocus === 'object') {
            const entries = Object.entries(exercise.skillsFocus);
            if (entries.length > 0) {
                entries.sort((a, b) => (b[1] as number) - (a[1] as number));
                return entries[0][0];
            }
        }

        return 'general';
    }

    /**
     * Sélectionne un thème approprié pour le scénario
     * @param params Paramètres de génération
     * @returns Promise<LearningTheme> Thème sélectionné
     * @private
     */
    private async selectTheme(params: ScenarioGenerationParams): Promise<LearningTheme> {
        try {
            if (params.specificTheme) {
                const specificTheme = await this.themeCatalog.getThemeById(params.specificTheme);
                if (specificTheme) {
                    return specificTheme;
                }
                this.logger.warn(`Thème spécifique non trouvé: ${params.specificTheme}, sélection alternative`);
            }

            const themes = await this.themeCatalog.getThemes(params.level);
            if (themes.length === 0) {
                throw new Error(`Aucun thème disponible pour le niveau ${params.level}`);
            }

            let filteredThemes = themes;

            // ✅ Vérification de nullité pour userPreferences
            if (params.userPreferences?.preferredThemes && params.userPreferences.preferredThemes.length > 0) {
                const preferredThemes = themes.filter(theme =>
                    params.userPreferences?.preferredThemes?.includes(theme.id)
                );

                if (preferredThemes.length > 0) {
                    filteredThemes = preferredThemes;
                }
            }

            return filteredThemes[Math.floor(Math.random() * filteredThemes.length)];
        } catch (error) {
            this.logger.error(`Erreur lors de la sélection du thème: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Échec de sélection du thème: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Génère une introduction adaptée pour le scénario
     * @param type Type de scénario
     * @param theme Thème du scénario (local)
     * @param level Niveau CECRL
     * @returns Texte d'introduction
     * @private
     */
    private generateIntroduction(type: ScenarioType, theme: LearningThemeLocal, level: CECRLLevel): string {
        const introPrefixMap: Partial<Record<ScenarioType, string>> = {
            [ScenarioType.CONVERSATION]: "Dans ce scénario de conversation, vous allez pratiquer",
            [ScenarioType.VOCABULARY]: "Découvrez et pratiquez le vocabulaire lié à",
            [ScenarioType.GRAMMAR]: "Dans cette leçon de grammaire, vous allez explorer",
            [ScenarioType.CULTURAL]: "Plongez dans l'aspect culturel de",
            [ScenarioType.PRACTICAL]: "Mettez en pratique vos compétences dans",
            [ScenarioType.ASSESSMENT]: "Évaluez vos connaissances sur",
            [ScenarioType.ACADEMIC]: "Explorez les aspects académiques de",
            [ScenarioType.PROFESSIONAL]: "Développez vos compétences professionnelles dans",
            [ScenarioType.EMERGENCY]: "Apprenez à communiquer efficacement dans des situations d'urgence liées à",
            [ScenarioType.STORYTELLING]: "Développez vos compétences narratives à travers"
        };

        const introPrefix = introPrefixMap[type] || "Explorez";

        if (level === CECRLLevel.A1 || level === CECRLLevel.A2) {
            return `${introPrefix} ${theme.name.toLowerCase()}. ${theme.description} À travers ces exercices simples, vous apprendrez les signes de base et comment les utiliser dans des situations courantes.`;
        }

        if (level === CECRLLevel.B1 || level === CECRLLevel.B2) {
            return `${introPrefix} ${theme.name.toLowerCase()} de manière plus approfondie. ${theme.description} Ces exercices vous aideront à développer votre fluidité et votre précision dans l'utilisation de l'espace de signation et des expressions faciales.`;
        }

        return `${introPrefix} ${theme.name.toLowerCase()} avec une complexité adaptée à votre niveau. ${theme.description} Ces exercices avancés vous aideront à maîtriser les nuances culturelles, les variations dialectales et les subtilités grammaticales de la LSF dans ce domaine.`;
    }

    /**
     * Génère un titre pour le scénario
     * @param type Type de scénario
     * @param theme Thème du scénario (local)
     * @param level Niveau CECRL
     * @returns Titre du scénario
     * @private
     */
    private generateTitle(type: ScenarioType, theme: LearningThemeLocal, level: CECRLLevel): string {
        const typeLabelMap: Partial<Record<ScenarioType, string>> = {
            [ScenarioType.CONVERSATION]: "Conversation",
            [ScenarioType.VOCABULARY]: "Vocabulaire",
            [ScenarioType.GRAMMAR]: "Grammaire",
            [ScenarioType.CULTURAL]: "Culture",
            [ScenarioType.PRACTICAL]: "Pratique",
            [ScenarioType.ASSESSMENT]: "Évaluation",
            [ScenarioType.ACADEMIC]: "Académique",
            [ScenarioType.PROFESSIONAL]: "Professionnel",
            [ScenarioType.EMERGENCY]: "Urgence",
            [ScenarioType.STORYTELLING]: "Narration"
        };

        const typeLabel = typeLabelMap[type] || "Général";
        return `${typeLabel} : ${theme.name} (Niveau ${level})`;
    }

    /**
     * Détermine le nombre d'exercices adapté au type de scénario et au niveau
     * @param type Type de scénario
     * @param level Niveau CECRL
     * @returns Nombre d'exercices
     * @private
     */
    private determineExerciseCount(type: ScenarioType, level: CECRLLevel): number {
        const baseCountMap: Partial<Record<ScenarioType, number>> = {
            [ScenarioType.CONVERSATION]: 4,
            [ScenarioType.VOCABULARY]: 6,
            [ScenarioType.GRAMMAR]: 5,
            [ScenarioType.CULTURAL]: 4,
            [ScenarioType.PRACTICAL]: 5,
            [ScenarioType.ASSESSMENT]: 8,
            [ScenarioType.ACADEMIC]: 6,
            [ScenarioType.PROFESSIONAL]: 7,
            [ScenarioType.EMERGENCY]: 5,
            [ScenarioType.STORYTELLING]: 4
        };

        const baseCount = baseCountMap[type] || 5;

        // ✅ Constantes plutôt que les valeurs d'enum
        const levelMultiplierMap = {
            'A1': 0.8,
            'A2': 0.9,
            'B1': 1.0,
            'B2': 1.1,
            'C1': 1.2,
            'C2': 1.3
        } as const;

        const levelMultiplier = levelMultiplierMap[level] || 1.0;
        return Math.round(baseCount * levelMultiplier);
    }

    /**
     * Détermine le type d'exercice préféré basé sur les paramètres
     * @param params Paramètres de génération
     * @returns Type d'exercice ou undefined si pas de préférence
     * @private
     */
    private getPreferredExerciseType(params: ScenarioGenerationParams): ExerciseType | undefined {
        switch (params.type) {
            case ScenarioType.VOCABULARY:
                return ExerciseType.MATCHING;
            case ScenarioType.GRAMMAR:
                return ExerciseType.REORDERING;
            case ScenarioType.CONVERSATION:
            case ScenarioType.STORYTELLING:
                return ExerciseType.VIDEO_RESPONSE;
            case ScenarioType.EMERGENCY:
                return ExerciseType.MULTIPLE_CHOICE;
            case ScenarioType.PROFESSIONAL:
                return ExerciseType.TEXT_ENTRY;
            case ScenarioType.ACADEMIC:
                return ExerciseType.FILL_BLANK;
            default:
                return undefined;
        }
    }

    /**
     * Extrait la liste des concepts couverts dans le scénario
     * @param exercises Liste des exercices
     * @param theme Thème du scénario (local)
     * @returns Liste des concepts couverts
     * @private
     */
    private extractCoveredConcepts(exercises: Exercise[], theme: LearningThemeLocal): string[] {
        const themeConceptsArray = theme.associatedConcepts || [];
        const concepts = new Set<string>(themeConceptsArray);

        exercises.forEach((exercise: Exercise) => {
            if (exercise.testedConcepts && Array.isArray(exercise.testedConcepts)) {
                exercise.testedConcepts.forEach((concept: string) => concepts.add(concept));
            }
        });

        return Array.from(concepts);
    }

    // ================== MÉTHODES UTILITAIRES PRIVÉES ==================

    /**
     * Convertit une chaîne vers CECRLLevel local
     * @param level Niveau sous forme de chaîne
     * @returns Niveau CECRLLevel local
     * @private
     */
    private convertToCECRLLevel(level: string | unknown): CECRLLevel {
        if (typeof level === 'string') {
            switch (level) {
                case 'A1': return CECRLLevel.A1;
                case 'A2': return CECRLLevel.A2;
                case 'B1': return CECRLLevel.B1;
                case 'B2': return CECRLLevel.B2;
                case 'C1': return CECRLLevel.C1;
                case 'C2': return CECRLLevel.C2;
                default: return CECRLLevel.B1; // Valeur par défaut
            }
        }
        return CECRLLevel.B1; // Valeur par défaut
    }

    /**
     * Convertit un LearningTheme vers LearningThemeLocal avec valeurs par défaut
     * @param theme Thème source
     * @returns Thème avec toutes les propriétés
     * @private
     */
    private convertToLocalTheme(theme: LearningTheme): LearningThemeLocal {
        return {
            id: theme.id,
            name: theme.name,
            description: theme.description,
            category: 'general', // Valeur par défaut
            level: CECRLLevel.B1, // Valeur par défaut
            difficulty: 'medium' as ExerciseDifficulty, // Valeur par défaut
            estimatedDuration: 300, // 5 minutes par défaut
            associatedConcepts: theme.associatedConcepts || []
        };
    }
}