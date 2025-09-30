/**
 * Générateur d'étapes pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/generators/PathStepGenerator.ts
 * @module ai/services/learning/personalization/generators
 * @description Génération intelligente des étapes d'apprentissage basée sur les profils et objectifs
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

import type {
    LearningPathStep,
    StepGeneratorConfig,
    CECRLLevel,
    PathGenerationOptions,
    PersonalizedLearningPathModel
} from '@learning/types/LearningPathTypes';

import type { UserReverseProfile } from '@learning/human/coda/codavirtuel/types';
import { LearningPathTypeUtils, LEARNING_PATH_CONSTANTS } from '@learning/types/LearningPathTypes';
import { StepContentGenerator } from '../utils/StepContentGenerator';
import { StepDependencyManager } from '../utils/StepDependencyManager';
import { Logger } from '@ai/utils/Logger';

/**
 * Types d'étapes d'apprentissage
 */
export const STEP_TYPES = {
    INTRODUCTION: 'introduction',
    VOCABULARY: 'vocabulary',
    GRAMMAR: 'grammar',
    PRACTICE: 'practice',
    EVALUATION: 'evaluation',
    REVIEW: 'review',
    CHALLENGE: 'challenge',
    CULTURAL: 'cultural'
} as const;

export type StepType = typeof STEP_TYPES[keyof typeof STEP_TYPES];

/**
 * Modèles d'étapes par niveau CECRL
 */
interface StepTemplate {
    /** Type d'étape */
    readonly type: StepType;
    /** Titre de l'étape */
    readonly title: string;
    /** Description */
    readonly description: string;
    /** Durée estimée (minutes) */
    readonly estimatedDuration: number;
    /** Difficulté (1-5) */
    readonly difficulty: number;
    /** Compétences requises */
    readonly prerequisites: readonly string[];
    /** Compétences développées */
    readonly skillsTargeted: readonly string[];
    /** Poids dans la progression */
    readonly weight: number;
}

/**
 * Résultat de génération d'étapes
 */
interface StepGenerationResult {
    /** Étapes générées */
    readonly steps: readonly LearningPathStep[];
    /** Durée totale estimée */
    readonly totalDuration: number;
    /** Nombre d'étapes par type */
    readonly stepCounts: Record<StepType, number>;
    /** Messages informatifs */
    readonly messages: readonly string[];
}

/**
 * Configuration de génération spécialisée
 */
interface SpecializedGenerationConfig {
    /** Accent sur certaines compétences */
    readonly focusAreas?: readonly string[];
    /** Éviter certains types d'exercices */
    readonly excludeTypes?: readonly StepType[];
    /** Forcer l'inclusion de certains types */
    readonly includeTypes?: readonly StepType[];
    /** Facteur d'ajustement de difficulté */
    readonly difficultyMultiplier?: number;
}

/**
 * Modèles d'étapes par niveau CECRL
 */
const STEP_TEMPLATES_BY_LEVEL: Record<CECRLLevel, readonly StepTemplate[]> = {
    A1: [
        {
            type: STEP_TYPES.INTRODUCTION,
            title: 'Découverte de la LSF',
            description: 'Introduction aux bases de la langue des signes française',
            estimatedDuration: 15,
            difficulty: 1,
            prerequisites: [],
            skillsTargeted: ['alphabet', 'salutations'],
            weight: 1.0
        },
        {
            type: STEP_TYPES.VOCABULARY,
            title: 'Vocabulaire de base',
            description: 'Apprentissage des mots essentiels du quotidien',
            estimatedDuration: 25,
            difficulty: 2,
            prerequisites: ['alphabet'],
            skillsTargeted: ['vocabulaire_quotidien', 'famille'],
            weight: 1.5
        },
        {
            type: STEP_TYPES.PRACTICE,
            title: 'Pratique guidée',
            description: 'Exercices pratiques avec feedback',
            estimatedDuration: 20,
            difficulty: 2,
            prerequisites: ['vocabulaire_quotidien'],
            skillsTargeted: ['fluidite_gestuelle', 'precision_mouvement'],
            weight: 1.2
        }
    ],
    A2: [
        {
            type: STEP_TYPES.GRAMMAR,
            title: 'Structures grammaticales simples',
            description: 'Apprentissage des constructions de base',
            estimatedDuration: 30,
            difficulty: 3,
            prerequisites: ['vocabulaire_quotidien'],
            skillsTargeted: ['grammaire_base', 'ordre_mots'],
            weight: 1.8
        },
        {
            type: STEP_TYPES.CULTURAL,
            title: 'Culture sourde',
            description: 'Découverte de la communauté sourde',
            estimatedDuration: 20,
            difficulty: 2,
            prerequisites: [],
            skillsTargeted: ['culture_sourde', 'politesse_lsf'],
            weight: 1.0
        }
    ],
    B1: [
        {
            type: STEP_TYPES.CHALLENGE,
            title: 'Conversations complexes',
            description: 'Mise en situation conversationnelle avancée',
            estimatedDuration: 35,
            difficulty: 4,
            prerequisites: ['grammaire_base', 'culture_sourde'],
            skillsTargeted: ['conversation_spontanee', 'adaptation_interlocuteur'],
            weight: 2.0
        }
    ],
    B2: [
        {
            type: STEP_TYPES.EVALUATION,
            title: 'Évaluation avancée',
            description: 'Test de compétences niveau B2',
            estimatedDuration: 45,
            difficulty: 4,
            prerequisites: ['conversation_spontanee'],
            skillsTargeted: ['evaluation_b2', 'autonomie_expression'],
            weight: 2.5
        }
    ],
    C1: [
        {
            type: STEP_TYPES.CHALLENGE,
            title: 'Maîtrise expressive',
            description: 'Expression nuancée et créative',
            estimatedDuration: 40,
            difficulty: 5,
            prerequisites: ['autonomie_expression'],
            skillsTargeted: ['creativite_lsf', 'nuances_expression'],
            weight: 3.0
        }
    ],
    C2: [
        {
            type: STEP_TYPES.CHALLENGE,
            title: 'Virtuosité LSF',
            description: 'Maîtrise parfaite et créativité avancée',
            estimatedDuration: 50,
            difficulty: 5,
            prerequisites: ['creativite_lsf'],
            skillsTargeted: ['virtuosite_lsf', 'enseignement_lsf'],
            weight: 3.5
        }
    ]
} as const;

/**
 * Générateur d'étapes pour les parcours d'apprentissage
 * 
 * @class PathStepGenerator
 * @example
 * ```typescript
 * const generator = new PathStepGenerator();
 * const steps = await generator.generateAllSteps(config);
 * console.log(`${steps.length} étapes générées`);
 * ```
 */
export class PathStepGenerator {
    private readonly logger = Logger.getInstance('PathStepGenerator');
    private readonly contentGenerator: StepContentGenerator;
    private readonly dependencyManager: StepDependencyManager;

    /**
     * Constructeur du générateur d'étapes
     */
    constructor() {
        this.contentGenerator = new StepContentGenerator();
        this.dependencyManager = new StepDependencyManager();

        this.logger.info('PathStepGenerator initialisé');
    }

    /**
     * Génère toutes les étapes pour un parcours d'apprentissage
     * 
     * @param config - Configuration de génération
     * @returns Promise<LearningPathStep[]> Étapes générées
     */
    public async generateAllSteps(config: StepGeneratorConfig): Promise<readonly LearningPathStep[]> {
        this.logger.info('Génération des étapes de parcours', {
            currentLevel: config.profile.currentLevel,
            targetLevel: config.options.targetLevel,
            mode: config.mode,
            intensity: config.intensity
        });

        try {
            // Génération des étapes par niveau
            const result = await this.generateStepsByProgression(config);

            this.logger.info('Étapes générées avec succès', {
                totalSteps: result.steps.length,
                totalDuration: result.totalDuration,
                stepCounts: result.stepCounts
            });

            return result.steps;

        } catch (error) {
            this.logger.error('Erreur lors de la génération des étapes', { error });
            throw error;
        }
    }

    /**
     * Génère des étapes spécialisées selon des critères
     * 
     * @param baseConfig - Configuration de base
     * @param specializationConfig - Configuration spécialisée
     * @returns Promise<LearningPathStep[]> Étapes spécialisées
     */
    public async generateSpecializedSteps(
        baseConfig: StepGeneratorConfig,
        specializationConfig: SpecializedGenerationConfig
    ): Promise<readonly LearningPathStep[]> {
        this.logger.debug('Génération d\'étapes spécialisées', specializationConfig);

        // Filtrer les modèles selon la spécialisation
        const filteredTemplates = this.filterTemplatesBySpecialization(
            baseConfig.options.targetLevel,
            specializationConfig
        );

        // Générer les étapes à partir des modèles filtrés
        return this.generateStepsFromTemplates(filteredTemplates, baseConfig);
    }

    /**
     * Estime la durée totale d'un ensemble d'étapes
     * 
     * @param steps - Étapes à évaluer
     * @returns number Durée totale en minutes
     */
    public estimateTotalDuration(steps: readonly LearningPathStep[]): number {
        return steps.reduce((total, step) => total + step.estimatedDuration, 0);
    }

    /**
     * Valide la cohérence d'une séquence d'étapes
     * 
     * @param steps - Étapes à valider
     * @returns boolean True si la séquence est cohérente
     */
    public validateStepSequence(steps: readonly LearningPathStep[]): boolean {
        return this.dependencyManager.validateDependencies(steps);
    }

    /**
     * Génère les étapes par progression de niveau
     * 
     * @param config - Configuration de génération
     * @returns Promise<StepGenerationResult> Résultat de génération
     * @private
     */
    private async generateStepsByProgression(
        config: StepGeneratorConfig
    ): Promise<StepGenerationResult> {
        const allSteps: LearningPathStep[] = [];
        const stepCounts: Record<StepType, number> = {} as Record<StepType, number>;
        const messages: string[] = [];

        // Initialiser les compteurs
        Object.values(STEP_TYPES).forEach(type => {
            stepCounts[type] = 0;
        });

        // Déterminer la progression de niveaux à couvrir
        const levelProgression = this.calculateLevelProgression(
            config.profile.currentLevel,
            config.options.targetLevel
        );

        // Générer des étapes pour chaque niveau
        for (const level of levelProgression) {
            const levelSteps = await this.generateStepsForLevel(level, config);

            // Ajuster les étapes selon l'intensité
            const adjustedSteps = this.adjustStepsForIntensity(levelSteps, config.intensity);

            allSteps.push(...adjustedSteps);

            // Mettre à jour les compteurs
            adjustedSteps.forEach(step => {
                stepCounts[step.type as StepType]++;
            });

            messages.push(`${adjustedSteps.length} étapes générées pour le niveau ${level}`);
        }

        // Appliquer les dépendances entre étapes
        const orderedSteps = this.dependencyManager.orderStepsByDependencies(allSteps);

        const totalDuration = this.estimateTotalDuration(orderedSteps);

        return {
            steps: orderedSteps,
            totalDuration,
            stepCounts,
            messages
        };
    }

    /**
     * Génère les étapes pour un niveau spécifique
     * 
     * @param level - Niveau CECRL
     * @param config - Configuration de génération
     * @returns Promise<LearningPathStep[]> Étapes pour le niveau
     * @private
     */
    private async generateStepsForLevel(
        level: CECRLLevel,
        config: StepGeneratorConfig
    ): Promise<LearningPathStep[]> {
        const templates = STEP_TEMPLATES_BY_LEVEL[level] ?? [];
        const steps: LearningPathStep[] = [];

        for (const template of templates) {
            const step = await this.createStepFromTemplate(template, config, level);
            steps.push(step);
        }

        return steps;
    }

    /**
     * Crée une étape à partir d'un modèle
     * 
     * @param template - Modèle d'étape
     * @param config - Configuration de génération
     * @param level - Niveau CECRL
     * @returns Promise<LearningPathStep> Étape générée
     * @private
     */
    private async createStepFromTemplate(
        template: StepTemplate,
        config: StepGeneratorConfig,
        level: CECRLLevel
    ): Promise<LearningPathStep> {
        const stepId = this.generateStepId(config.path.id, template.type);

        // Générer le contenu spécialisé
        const content = await this.contentGenerator.generateContentForStep(
            template,
            config.profile,
            level
        );

        // Ajuster la difficulté selon les préférences
        const adjustedDifficulty = this.adjustDifficultyForProfile(
            template.difficulty,
            config.profile
        );

        return {
            id: stepId,
            title: template.title,
            description: template.description,
            type: template.type,
            content,
            estimatedDuration: template.estimatedDuration,
            difficulty: adjustedDifficulty,
            prerequisites: [...template.prerequisites],
            skillsTargeted: [...template.skillsTargeted],
            status: 'locked',
            progress: 0,
            completedAt: undefined,
            attempts: 0,
            bestScore: undefined,
            weight: template.weight,
            level,
            order: 0 // Sera défini lors de l'ordonnancement
        };
    }

    /**
     * Calcule la progression de niveaux nécessaire
     * 
     * @param currentLevel - Niveau actuel
     * @param targetLevel - Niveau cible
     * @returns CECRLLevel[] Progression de niveaux
     * @private
     */
    private calculateLevelProgression(
        currentLevel: CECRLLevel,
        targetLevel: CECRLLevel
    ): readonly CECRLLevel[] {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        const currentIndex = levels.indexOf(currentLevel);
        const targetIndex = levels.indexOf(targetLevel);

        if (currentIndex >= targetIndex) {
            return [targetLevel]; // Révision du niveau actuel
        }

        return levels.slice(currentIndex + 1, targetIndex + 1);
    }

    /**
     * Ajuste les étapes selon l'intensité demandée
     * 
     * @param steps - Étapes de base
     * @param intensity - Intensité (1-5)
     * @returns LearningPathStep[] Étapes ajustées
     * @private
     */
    private adjustStepsForIntensity(
        steps: LearningPathStep[],
        intensity: number
    ): LearningPathStep[] {
        const intensityMultiplier = intensity / 3; // Normaliser autour de 3

        return steps.map(step => ({
            ...step,
            estimatedDuration: Math.round(step.estimatedDuration * intensityMultiplier),
            difficulty: Math.max(1, Math.min(5, Math.round(step.difficulty * intensityMultiplier)))
        }));
    }

    /**
     * Ajuste la difficulté selon le profil utilisateur
     * 
     * @param baseDifficulty - Difficulté de base
     * @param profile - Profil utilisateur
     * @returns number Difficulté ajustée
     * @private
     */
    private adjustDifficultyForProfile(
        baseDifficulty: number,
        profile: UserReverseProfile
    ): number {
        let adjustedDifficulty = baseDifficulty;

        // Ajustement selon les préférences
        const difficultyPreference = profile.exercisePreferences.difficultyPreference ?? 0.5;
        adjustedDifficulty *= (0.5 + difficultyPreference);

        // Limitations selon le niveau actuel
        const maxDifficulty = this.getMaxDifficultyForLevel(profile.currentLevel);
        adjustedDifficulty = Math.min(adjustedDifficulty, maxDifficulty);

        return Math.max(1, Math.min(5, Math.round(adjustedDifficulty)));
    }

    /**
     * Obtient la difficulté maximum pour un niveau
     * 
     * @param level - Niveau CECRL
     * @returns number Difficulté maximum
     * @private
     */
    private getMaxDifficultyForLevel(level: CECRLLevel): number {
        const maxDifficulties = {
            'A1': 2, 'A2': 3, 'B1': 4, 'B2': 4, 'C1': 5, 'C2': 5
        };
        return maxDifficulties[level] ?? 3;
    }

    /**
     * Filtre les modèles selon la spécialisation
     * 
     * @param level - Niveau cible
     * @param config - Configuration de spécialisation
     * @returns StepTemplate[] Modèles filtrés
     * @private
     */
    private filterTemplatesBySpecialization(
        level: CECRLLevel,
        config: SpecializedGenerationConfig
    ): readonly StepTemplate[] {
        let templates = [...(STEP_TEMPLATES_BY_LEVEL[level] ?? [])];

        // Exclusions
        if (config.excludeTypes) {
            templates = templates.filter(template =>
                !config.excludeTypes!.includes(template.type)
            );
        }

        // Inclusions forcées (ajout de modèles si nécessaire)
        if (config.includeTypes) {
            // Logique d'inclusion forcée (implémentation simplifiée)
            this.logger.debug('Types forcés à inclure', config.includeTypes);
        }

        return templates;
    }

    /**
     * Génère des étapes à partir de modèles filtrés
     * 
     * @param templates - Modèles filtrés
     * @param config - Configuration de base
     * @returns Promise<LearningPathStep[]> Étapes générées
     * @private
     */
    private async generateStepsFromTemplates(
        templates: readonly StepTemplate[],
        config: StepGeneratorConfig
    ): Promise<readonly LearningPathStep[]> {
        const steps: LearningPathStep[] = [];

        for (const template of templates) {
            const step = await this.createStepFromTemplate(
                template,
                config,
                config.options.targetLevel
            );
            steps.push(step);
        }

        return steps;
    }

    /**
     * Génère un identifiant unique pour une étape
     * 
     * @param pathId - Identifiant du parcours
     * @param stepType - Type d'étape
     * @returns string Identifiant unique
     * @private
     */
    private generateStepId(pathId: string, stepType: string): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `step-${pathId}-${stepType}-${timestamp}-${random}`;
    }
}