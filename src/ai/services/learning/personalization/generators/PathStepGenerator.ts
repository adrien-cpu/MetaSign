/**
 * Générateur d'étapes pour les parcours d'apprentissage personnalisés - Version refactorisée
 * 
 * @file src/ai/services/learning/personalization/generators/PathStepGenerator.ts
 * @module ai/services/learning/personalization/generators
 * @description Générateur spécialisé pour la création d'étapes d'apprentissage LSF - Version modulaire
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    StepGeneratorConfig,
    LearningPathStep,
    StepType,
    PathGenerationMode,
    CECRLLevel
} from '../types/LearningPathTypes';
import { LEARNING_PATH_CONSTANTS } from '../types/LearningPathTypes';
import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';

import {
    StepConfigurationManager,
    type ConfiguredStepTemplate
} from '../utils/StepConfigurationManager';
import {
    StepContentGenerator,
    type GeneratedStepContent,
    type ContentGenerationContext
} from '../utils/StepContentGenerator';
import {
    StepDependencyManager,
    type DependencyGraph
} from '../utils/StepDependencyManager';
import { Logger } from '@/ai/utils/Logger';

/**
 * Résultat de la génération d'étapes
 */
interface StepGenerationResult {
    readonly steps: readonly LearningPathStep[];
    readonly dependencyGraph: DependencyGraph;
    readonly totalEstimatedDuration: number;
    readonly metadata: StepGenerationMetadata;
}

/**
 * Métadonnées de génération
 */
interface StepGenerationMetadata {
    readonly generatedAt: Date;
    readonly generatorVersion: string;
    readonly profile: UserReverseProfile;
    readonly config: StepGeneratorConfig;
    readonly stepCounts: Readonly<Record<StepType, number>>;
    readonly averageDifficulty: number;
}

/**
 * Configuration du générateur d'étapes
 */
interface GeneratorConfig {
    readonly enableAdvancedContent: boolean;
    readonly includeCulturalContext: boolean;
    readonly adaptToLearningStyle: boolean;
    readonly generateDependencies: boolean;
    readonly optimizeForParallelism: boolean;
}

/**
 * Configuration par défaut
 */
const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
    enableAdvancedContent: true,
    includeCulturalContext: true,
    adaptToLearningStyle: true,
    generateDependencies: true,
    optimizeForParallelism: false
} as const;

/**
 * Générateur d'étapes pour les parcours d'apprentissage personnalisés
 * 
 * @example
 * ```typescript
 * const generator = new PathStepGenerator({
 *     enableAdvancedContent: true,
 *     includeCulturalContext: true
 * });
 * ```
 */
export class PathStepGenerator {
    private readonly logger = Logger.getInstance('PathStepGenerator');
    private readonly config: GeneratorConfig;
    private readonly configurationManager: StepConfigurationManager;
    private readonly contentGenerator: StepContentGenerator;
    private readonly dependencyManager: StepDependencyManager;

    /**
     * Constructeur du générateur d'étapes
     * 
     * @param config Configuration du générateur (optionnelle)
     * @param configurationManager Gestionnaire de configuration (optionnel)
     * @param contentGenerator Générateur de contenu (optionnel)
     * @param dependencyManager Gestionnaire de dépendances (optionnel)
     * 
     * @example
     * ```typescript
     * const generator = new PathStepGenerator({
     *     enableAdvancedContent: true,
     *     generateDependencies: true
     * });
     * ```
     */
    constructor(
        config?: Partial<GeneratorConfig>,
        configurationManager?: StepConfigurationManager,
        contentGenerator?: StepContentGenerator,
        dependencyManager?: StepDependencyManager
    ) {
        this.config = { ...DEFAULT_GENERATOR_CONFIG, ...config };
        this.configurationManager = configurationManager || new StepConfigurationManager();
        this.contentGenerator = contentGenerator || new StepContentGenerator();
        this.dependencyManager = dependencyManager || new StepDependencyManager({
            parallelismLevel: this.config.optimizeForParallelism ? 'high' : 'medium',
            adaptToProfile: this.config.adaptToLearningStyle
        });

        this.logger.info('PathStepGenerator initialisé', this.config);
    }

    /**
     * Génère toutes les étapes pour un parcours d'apprentissage
     * 
     * @param generatorConfig Configuration de génération
     * @returns Liste des étapes générées
     * 
     * @example
     * ```typescript
     * const steps = await generator.generateAllSteps(config);
     * console.log(`${steps.length} étapes générées`);
     * ```
     */
    public async generateAllSteps(generatorConfig: StepGeneratorConfig): Promise<readonly LearningPathStep[]> {
        this.logger.info('Génération de toutes les étapes', {
            targetLevel: generatorConfig.options.targetLevel,
            mode: generatorConfig.mode,
            intensity: generatorConfig.intensity
        });

        try {
            const result = await this.generateStepsWithMetadata(generatorConfig);
            return result.steps;

        } catch (error) {
            this.logger.error('Erreur lors de la génération des étapes', {
                targetLevel: generatorConfig.options.targetLevel,
                error
            });
            throw new Error(`Génération des étapes échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Génère les étapes avec métadonnées complètes
     * 
     * @param generatorConfig Configuration de génération
     * @returns Résultat complet de génération
     * 
     * @example
     * ```typescript
     * const result = await generator.generateStepsWithMetadata(config);
     * console.log(`Durée totale: ${result.totalEstimatedDuration}h`);
     * ```
     */
    public async generateStepsWithMetadata(generatorConfig: StepGeneratorConfig): Promise<StepGenerationResult> {
        const startTime = Date.now();

        this.logger.debug('Début de génération avec métadonnées', generatorConfig);

        try {
            // 1. Calculer le nombre d'étapes par type
            const totalStepsTarget = this.calculateTotalStepsTarget(generatorConfig);
            const stepDistribution = this.configurationManager.calculateStepDistribution(
                this.createConfigurationParams(generatorConfig),
                totalStepsTarget
            );

            // 2. Générer les étapes par type
            const allSteps: LearningPathStep[] = [];
            let stepIndex = 0;

            for (const [stepType, count] of Object.entries(stepDistribution)) {
                const stepsForType = await this.generateStepsOfType(
                    stepType as StepType,
                    count,
                    generatorConfig,
                    stepIndex
                );
                allSteps.push(...stepsForType);
                stepIndex += stepsForType.length;
            }

            // 3. Générer le graphe de dépendances si activé
            const dependencyGraph = this.config.generateDependencies
                ? this.dependencyManager.generateDependencyGraph(
                    allSteps,
                    generatorConfig.path.id,
                    generatorConfig.profile
                )
                : this.createEmptyDependencyGraph(generatorConfig.path.id);

            // 4. Calculer les métriques
            const totalEstimatedDuration = this.calculateTotalDuration(allSteps);
            const metadata = this.generateMetadata(generatorConfig, allSteps, stepDistribution);

            const result: StepGenerationResult = {
                steps: allSteps,
                dependencyGraph,
                totalEstimatedDuration,
                metadata
            };

            this.logger.info('Génération terminée avec succès', {
                stepsCount: allSteps.length,
                totalDuration: totalEstimatedDuration,
                generationTime: Date.now() - startTime
            });

            return result;

        } catch (error) {
            this.logger.error('Erreur lors de la génération avec métadonnées', error);
            throw error;
        }
    }

    /**
     * Génère des étapes d'un type spécifique
     * 
     * @param stepType Type d'étape à générer
     * @param count Nombre d'étapes à générer
     * @param generatorConfig Configuration de génération
     * @param startIndex Index de départ
     * @returns Étapes générées
     * 
     * @example
     * ```typescript
     * const exercises = await generator.generateStepsOfType('exercise', 5, config, 0);
     * ```
     */
    public async generateStepsOfType(
        stepType: StepType,
        count: number,
        generatorConfig: StepGeneratorConfig,
        startIndex: number = 0
    ): Promise<readonly LearningPathStep[]> {
        this.logger.debug('Génération d\'étapes par type', {
            stepType,
            count,
            startIndex
        });

        const steps: LearningPathStep[] = [];

        for (let i = 0; i < count; i++) {
            const stepIndex = startIndex + i;
            const step = await this.generateSingleStep(stepType, generatorConfig, stepIndex);
            steps.push(step);
        }

        this.logger.debug('Étapes par type générées', {
            stepType,
            generated: steps.length
        });

        return steps;
    }

    /**
     * Génère une étape individuelle
     * 
     * @param stepType Type d'étape
     * @param generatorConfig Configuration
     * @param stepIndex Index de l'étape
     * @returns Étape générée
     * @private
     */
    private async generateSingleStep(
        stepType: StepType,
        generatorConfig: StepGeneratorConfig,
        stepIndex: number
    ): Promise<LearningPathStep> {
        // Sélectionner les compétences pour cette étape
        const targetSkills = this.selectTargetSkills(stepType, generatorConfig, stepIndex);

        // Générer la configuration de l'étape
        const stepConfiguration = this.configurationManager.generateStepConfiguration(
            stepType,
            this.createConfigurationParams(generatorConfig),
            targetSkills,
            stepIndex
        );

        // Générer le contenu si activé
        let generatedContent: GeneratedStepContent | undefined;
        if (this.config.enableAdvancedContent) {
            const contentContext = this.createContentGenerationContext(
                stepConfiguration,
                generatorConfig
            );
            generatedContent = this.contentGenerator.generateStepContent(contentContext);
        }

        // Créer l'étape finale
        return this.createLearningPathStep(
            stepConfiguration,
            generatedContent,
            stepIndex
        );
    }

    /**
     * Sélectionne les compétences cibles pour une étape
     * 
     * @param stepType Type d'étape
     * @param generatorConfig Configuration
     * @param stepIndex Index de l'étape
     * @returns Compétences sélectionnées
     * @private
     */
    private selectTargetSkills(
        stepType: StepType,
        generatorConfig: StepGeneratorConfig,
        stepIndex: number
    ): readonly string[] {
        const focusAreas = generatorConfig.options.focusAreas || [];
        const availableSkills = focusAreas.length > 0
            ? focusAreas
            : this.getDefaultSkillsForLevel(generatorConfig.options.targetLevel);

        // Sélectionner 1-3 compétences selon le type d'étape
        const maxSkills = stepType === 'assessment' ? 3 : stepType === 'lesson' ? 1 : 2;
        const skillsCount = Math.min(maxSkills, availableSkills.length);

        // Rotation des compétences selon l'index
        const startIndex = stepIndex % availableSkills.length;
        const selectedSkills: string[] = [];

        for (let i = 0; i < skillsCount; i++) {
            const skillIndex = (startIndex + i) % availableSkills.length;
            selectedSkills.push(availableSkills[skillIndex]);
        }

        return selectedSkills;
    }

    /**
     * Crée les paramètres de configuration
     * 
     * @param generatorConfig Configuration du générateur
     * @returns Paramètres de configuration
     * @private
     */
    private createConfigurationParams(generatorConfig: StepGeneratorConfig): Parameters<StepConfigurationManager['calculateStepDistribution']>[0] {
        return {
            profile: generatorConfig.profile,
            targetLevel: generatorConfig.options.targetLevel,
            mode: generatorConfig.mode,
            intensity: generatorConfig.intensity,
            focusAreas: generatorConfig.options.focusAreas || [],
            totalPathDuration: this.calculateTotalPathDuration(generatorConfig)
        };
    }

    /**
     * Crée le contexte de génération de contenu
     * 
     * @param stepConfig Configuration de l'étape
     * @param generatorConfig Configuration du générateur
     * @returns Contexte de génération
     * @private
     */
    private createContentGenerationContext(
        stepConfig: ConfiguredStepTemplate,
        generatorConfig: StepGeneratorConfig
    ): ContentGenerationContext {
        return {
            profile: generatorConfig.profile,
            targetLevel: generatorConfig.options.targetLevel,
            currentLevel: generatorConfig.profile.currentLevel,
            stepType: stepConfig.type,
            targetSkills: stepConfig.targetSkills,
            difficulty: stepConfig.difficulty,
            culturalContext: this.config.includeCulturalContext ? 'french' : 'international',
            learningStyle: this.determineLearningStyle(generatorConfig.profile)
        };
    }

    /**
     * Crée une étape d'apprentissage complète
     * 
     * @param stepConfig Configuration de l'étape
     * @param content Contenu généré (optionnel)
     * @param stepIndex Index de l'étape
     * @returns Étape d'apprentissage
     * @private
     */
    private createLearningPathStep(
        stepConfig: ConfiguredStepTemplate,
        content: GeneratedStepContent | undefined,
        stepIndex: number
    ): LearningPathStep {
        const stepId = `step-${stepIndex.toString().padStart(3, '0')}-${Date.now().toString(36)}`;

        return {
            id: stepId,
            type: stepConfig.type,
            title: content?.title || stepConfig.title,
            description: content?.description || stepConfig.description,
            estimatedDuration: stepConfig.estimatedDuration,
            difficulty: stepConfig.difficulty,
            targetSkills: stepConfig.targetSkills,
            prerequisites: stepConfig.prerequisites,
            priority: stepConfig.priority,
            status: stepConfig.status,
            metadata: {
                ...stepConfig.metadata,
                contentGenerated: !!content,
                hasAdvancedMaterials: content?.materials.length || 0,
                culturalNotesCount: content?.culturalNotes.length || 0,
                adaptiveHintsCount: content?.adaptiveHints.length || 0
            }
        };
    }

    /**
     * Calcule le nombre total d'étapes cible
     * 
     * @param generatorConfig Configuration
     * @returns Nombre d'étapes cible
     * @private
     */
    private calculateTotalStepsTarget(generatorConfig: StepGeneratorConfig): number {
        const baseStepsForLevel = LEARNING_PATH_CONSTANTS.BASE_STEPS_BY_LEVEL[generatorConfig.options.targetLevel] || 20;
        const intensityMultiplier = 0.8 + (generatorConfig.intensity * 0.1); // 0.8 à 1.3

        return Math.round(baseStepsForLevel * intensityMultiplier);
    }

    /**
     * Obtient les compétences par défaut pour un niveau
     * 
     * @param level Niveau CECRL
     * @returns Compétences par défaut
     * @private
     */
    private getDefaultSkillsForLevel(level: CECRLLevel): readonly string[] {
        const skillsByLevel: Record<CECRLLevel, readonly string[]> = {
            A1: ['basicVocabulary', 'recognition', 'simpleGreetings'],
            A2: ['extendedVocabulary', 'simpleConversation', 'facialExpressions'],
            B1: ['basicGrammar', 'contextualRecognition', 'dailyLifeCommunication'],
            B2: ['spatialGrammar', 'complexConversation', 'culturalBasics'],
            C1: ['complexGrammar', 'fluentCommunication', 'culturalNuances'],
            C2: ['linguisticAwareness', 'interpreting', 'subtleExpressions']
        };

        return skillsByLevel[level] || skillsByLevel.A1;
    }

    /**
     * Détermine le style d'apprentissage
     * 
     * @param profile Profil utilisateur
     * @returns Style d'apprentissage
     * @private
     */
    private determineLearningStyle(profile: UserReverseProfile): 'visual' | 'kinesthetic' | 'mixed' {
        // Logique simple basée sur les préférences du profil
        if (profile.exercisePreferences?.preferredTypes?.includes('VideoResponse')) {
            return 'kinesthetic';
        }
        if (profile.exercisePreferences?.preferredTypes?.includes('MultipleChoice')) {
            return 'visual';
        }
        return 'mixed';
    }

    /**
     * Calcule la durée totale du parcours
     * 
     * @param generatorConfig Configuration
     * @returns Durée en jours
     * @private
     */
    private calculateTotalPathDuration(generatorConfig: StepGeneratorConfig): number {
        return generatorConfig.options.targetDuration ||
            LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS[generatorConfig.options.targetLevel] ||
            30;
    }

    /**
     * Calcule la durée totale des étapes
     * 
     * @param steps Liste des étapes
     * @returns Durée totale en heures
     * @private
     */
    private calculateTotalDuration(steps: readonly LearningPathStep[]): number {
        return steps.reduce((total, step) => total + step.estimatedDuration, 0) / 60; // Convertir en heures
    }

    /**
     * Génère les métadonnées de génération
     * 
     * @param generatorConfig Configuration
     * @param steps Étapes générées
     * @param stepCounts Compteurs par type
     * @returns Métadonnées
     * @private
     */
    private generateMetadata(
        generatorConfig: StepGeneratorConfig,
        steps: readonly LearningPathStep[],
        stepCounts: Readonly<Record<StepType, number>>
    ): StepGenerationMetadata {
        const difficulties = steps.map(step => step.difficulty);
        const averageDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;

        return {
            generatedAt: new Date(),
            generatorVersion: '3.0.0',
            profile: generatorConfig.profile,
            config: generatorConfig,
            stepCounts,
            averageDifficulty: Math.round(averageDifficulty * 100) / 100
        };
    }

    /**
     * Crée un graphe de dépendances vide
     * 
     * @param pathId Identifiant du parcours
     * @returns Graphe vide
     * @private
     */
    private createEmptyDependencyGraph(pathId: string): DependencyGraph {
        return {
            pathId,
            dependencies: [],
            criticalPath: [],
            parallelGroups: [],
            totalEstimatedDuration: 0
        };
    }
}