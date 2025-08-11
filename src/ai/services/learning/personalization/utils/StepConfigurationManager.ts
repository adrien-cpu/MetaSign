/**
 * Gestionnaire de configuration pour les étapes d'apprentissage personnalisées
 * 
 * @file src/ai/services/learning/personalization/utils/StepConfigurationManager.ts
 * @module ai/services/learning/personalization/utils
 * @description Gestionnaire pour la configuration et la calibration des étapes d'apprentissage
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    StepType,
    CECRLLevel,
    PathGenerationMode,
    LearningPathStep,
    StepStatus
} from '../types/LearningPathTypes';
import { LEARNING_PATH_CONSTANTS } from '../types/LearningPathTypes';
import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { Logger } from '@/ai/utils/Logger';

/**
 * Configuration de base pour un type d'étape
 */
interface BaseStepConfig {
    readonly type: StepType;
    readonly defaultDifficulty: number;
    readonly estimatedDuration: number;
    readonly maxInstances: number;
    readonly prerequisites: readonly string[];
    readonly weight: number;
}

/**
 * Répartition des types d'étapes selon le mode de génération
 */
interface StepDistributionByMode {
    readonly lesson: number;
    readonly exercise: number;
    readonly practice: number;
    readonly assessment: number;
    readonly revision: number;
}

/**
 * Configuration adaptée selon le niveau CECRL
 */
interface CECRLLevelConfig {
    readonly difficultyMultiplier: number;
    readonly durationMultiplier: number;
    readonly complexityFactor: number;
    readonly assessmentFrequency: number;
    readonly revisionFrequency: number;
}

/**
 * Paramètres de configuration pour la génération d'étapes
 */
export interface StepConfigurationParams {
    readonly profile: UserReverseProfile;
    readonly targetLevel: CECRLLevel;
    readonly mode: PathGenerationMode;
    readonly intensity: number;
    readonly focusAreas: readonly string[];
    readonly totalPathDuration: number;
}

/**
 * Configuration complète pour une étape
 */
export interface ConfiguredStepTemplate {
    readonly type: StepType;
    readonly title: string;
    readonly description: string;
    readonly difficulty: number;
    readonly estimatedDuration: number;
    readonly priority: number;
    readonly targetSkills: readonly string[];
    readonly prerequisites: readonly string[];
    readonly status: StepStatus;
    readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Configurations de base par type d'étape
 */
const BASE_STEP_CONFIGS: Readonly<Record<StepType, BaseStepConfig>> = {
    lesson: {
        type: 'lesson',
        defaultDifficulty: 0.3,
        estimatedDuration: 20,
        maxInstances: 8,
        prerequisites: [],
        weight: 1.2
    },
    exercise: {
        type: 'exercise',
        defaultDifficulty: 0.5,
        estimatedDuration: 15,
        maxInstances: 15,
        prerequisites: [],
        weight: 1.0
    },
    practice: {
        type: 'practice',
        defaultDifficulty: 0.6,
        estimatedDuration: 25,
        maxInstances: 10,
        prerequisites: [],
        weight: 1.1
    },
    assessment: {
        type: 'assessment',
        defaultDifficulty: 0.7,
        estimatedDuration: 30,
        maxInstances: 4,
        prerequisites: [],
        weight: 1.5
    },
    revision: {
        type: 'revision',
        defaultDifficulty: 0.4,
        estimatedDuration: 10,
        maxInstances: 6,
        prerequisites: [],
        weight: 0.8
    }
} as const;

/**
 * Distribution des étapes par mode de génération
 */
const STEP_DISTRIBUTION_BY_MODE: Readonly<Record<PathGenerationMode, StepDistributionByMode>> = {
    theory_focused: {
        lesson: 0.4,
        exercise: 0.3,
        practice: 0.15,
        assessment: 0.1,
        revision: 0.05
    },
    practice_focused: {
        lesson: 0.2,
        exercise: 0.25,
        practice: 0.35,
        assessment: 0.15,
        revision: 0.05
    },
    assessment_focused: {
        lesson: 0.25,
        exercise: 0.3,
        practice: 0.2,
        assessment: 0.2,
        revision: 0.05
    },
    balanced: {
        lesson: 0.3,
        exercise: 0.3,
        practice: 0.25,
        assessment: 0.1,
        revision: 0.05
    },
    accelerated: {
        lesson: 0.2,
        exercise: 0.35,
        practice: 0.3,
        assessment: 0.1,
        revision: 0.05
    }
} as const;

/**
 * Configuration par niveau CECRL
 */
const CECRL_LEVEL_CONFIGS: Readonly<Record<CECRLLevel, CECRLLevelConfig>> = {
    A1: {
        difficultyMultiplier: 0.7,
        durationMultiplier: 1.2,
        complexityFactor: 0.5,
        assessmentFrequency: 0.08,
        revisionFrequency: 0.15
    },
    A2: {
        difficultyMultiplier: 0.8,
        durationMultiplier: 1.1,
        complexityFactor: 0.6,
        assessmentFrequency: 0.1,
        revisionFrequency: 0.12
    },
    B1: {
        difficultyMultiplier: 1.0,
        durationMultiplier: 1.0,
        complexityFactor: 0.7,
        assessmentFrequency: 0.12,
        revisionFrequency: 0.1
    },
    B2: {
        difficultyMultiplier: 1.1,
        durationMultiplier: 0.9,
        complexityFactor: 0.8,
        assessmentFrequency: 0.15,
        revisionFrequency: 0.08
    },
    C1: {
        difficultyMultiplier: 1.3,
        durationMultiplier: 0.85,
        complexityFactor: 0.9,
        assessmentFrequency: 0.18,
        revisionFrequency: 0.05
    },
    C2: {
        difficultyMultiplier: 1.5,
        durationMultiplier: 0.8,
        complexityFactor: 1.0,
        assessmentFrequency: 0.2,
        revisionFrequency: 0.05
    }
} as const;

/**
 * Gestionnaire de configuration pour les étapes d'apprentissage
 */
export class StepConfigurationManager {
    private readonly logger = Logger.getInstance('StepConfigurationManager');

    /**
     * Constructeur du gestionnaire de configuration
     * 
     * @example
     * ```typescript
     * const configManager = new StepConfigurationManager();
     * ```
     */
    constructor() {
        this.logger.debug('StepConfigurationManager initialisé');
    }

    /**
     * Calcule la distribution optimale des étapes selon les paramètres
     * 
     * @param params Paramètres de configuration
     * @param totalStepsTarget Nombre total d'étapes cible
     * @returns Distribution des étapes par type
     * 
     * @example
     * ```typescript
     * const distribution = configManager.calculateStepDistribution(params, 30);
     * console.log(`${distribution.lesson} leçons, ${distribution.exercise} exercices`);
     * ```
     */
    public calculateStepDistribution(
        params: StepConfigurationParams,
        totalStepsTarget: number
    ): Readonly<Record<StepType, number>> {
        this.logger.debug('Calcul de la distribution des étapes', {
            mode: params.mode,
            targetLevel: params.targetLevel,
            totalStepsTarget
        });

        const baseDistribution = STEP_DISTRIBUTION_BY_MODE[params.mode];
        const levelConfig = CECRL_LEVEL_CONFIGS[params.targetLevel];

        // Ajuster selon l'intensité
        const intensityFactor = params.intensity / LEARNING_PATH_CONSTANTS.DEFAULT_INTENSITY;

        // Ajuster selon les préférences du profil
        const adjustedDistribution = this.adjustDistributionForProfile(
            baseDistribution,
            params.profile,
            levelConfig,
            intensityFactor
        );

        // Calculer le nombre réel d'étapes par type
        const distribution: Record<StepType, number> = {
            lesson: Math.round(totalStepsTarget * adjustedDistribution.lesson),
            exercise: Math.round(totalStepsTarget * adjustedDistribution.exercise),
            practice: Math.round(totalStepsTarget * adjustedDistribution.practice),
            assessment: Math.round(totalStepsTarget * adjustedDistribution.assessment),
            revision: Math.round(totalStepsTarget * adjustedDistribution.revision)
        };

        // Assurer que le total correspond exactement
        const actualTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (actualTotal !== totalStepsTarget) {
            this.adjustTotalStepsCount(distribution, totalStepsTarget, actualTotal);
        }

        this.logger.debug('Distribution calculée', distribution);

        return distribution;
    }

    /**
     * Génère une configuration pour un type d'étape spécifique
     * 
     * @param stepType Type d'étape
     * @param params Paramètres de configuration
     * @param skillFocus Compétences ciblées
     * @param stepIndex Index de l'étape dans la séquence
     * @returns Configuration de l'étape
     * 
     * @example
     * ```typescript
     * const config = configManager.generateStepConfiguration('exercise', params, ['vocabulary'], 5);
     * console.log(`Difficulté: ${config.difficulty}, Durée: ${config.estimatedDuration}min`);
     * ```
     */
    public generateStepConfiguration(
        stepType: StepType,
        params: StepConfigurationParams,
        skillFocus: readonly string[],
        stepIndex: number
    ): ConfiguredStepTemplate {
        this.logger.debug('Génération de configuration d\'étape', {
            stepType,
            targetLevel: params.targetLevel,
            skillFocus: skillFocus.length,
            stepIndex
        });

        const baseConfig = BASE_STEP_CONFIGS[stepType];
        const levelConfig = CECRL_LEVEL_CONFIGS[params.targetLevel];

        // Calculer la difficulté adaptée
        const difficulty = this.calculateAdaptedDifficulty(
            baseConfig.defaultDifficulty,
            levelConfig,
            params,
            stepIndex
        );

        // Calculer la durée adaptée
        const estimatedDuration = this.calculateAdaptedDuration(
            baseConfig.estimatedDuration,
            levelConfig,
            params,
            difficulty
        );

        // Calculer la priorité
        const priority = this.calculateStepPriority(stepType, skillFocus, params);

        // Générer l'identifiant unique
        const stepId = this.generateStepId(stepType, stepIndex, skillFocus);

        // Créer la configuration complète
        const configuration: ConfiguredStepTemplate = {
            type: stepType,
            title: this.generateStepTitle(stepType, skillFocus, stepIndex),
            description: this.generateStepDescription(stepType, skillFocus, params.targetLevel),
            difficulty: Math.max(0, Math.min(1, difficulty)),
            estimatedDuration: Math.max(5, Math.round(estimatedDuration)),
            priority,
            targetSkills: Array.from(skillFocus),
            prerequisites: this.calculatePrerequisites(stepType, stepIndex, skillFocus),
            status: stepIndex === 0 ? 'available' : 'pending',
            metadata: {
                generatedAt: new Date().toISOString(),
                basedOnProfile: params.profile.currentLevel,
                targetLevel: params.targetLevel,
                focusAreas: params.focusAreas,
                stepIndex,
                levelConfig: levelConfig.complexityFactor
            }
        };

        this.logger.debug('Configuration d\'étape générée', {
            stepId,
            type: stepType,
            difficulty: Math.round(difficulty * 100) / 100,
            duration: estimatedDuration,
            priority
        });

        return configuration;
    }

    /**
     * Valide une configuration d'étape
     * 
     * @param config Configuration à valider
     * @returns True si la configuration est valide
     * @throws {Error} Si la configuration n'est pas valide
     * 
     * @example
     * ```typescript
     * const isValid = configManager.validateStepConfiguration(config);
     * console.log(`Configuration valide: ${isValid}`);
     * ```
     */
    public validateStepConfiguration(config: ConfiguredStepTemplate): boolean {
        // Validation des valeurs
        if (config.difficulty < 0 || config.difficulty > 1) {
            throw new Error(`Difficulté invalide: ${config.difficulty} (doit être entre 0 et 1)`);
        }

        if (config.estimatedDuration < 1) {
            throw new Error(`Durée invalide: ${config.estimatedDuration} (doit être > 0)`);
        }

        if (config.priority < 1 || config.priority > 10) {
            throw new Error(`Priorité invalide: ${config.priority} (doit être entre 1 et 10)`);
        }

        if (!config.title || config.title.trim().length === 0) {
            throw new Error('Titre d\'étape requis');
        }

        if (!config.description || config.description.trim().length === 0) {
            throw new Error('Description d\'étape requise');
        }

        if (config.targetSkills.length === 0) {
            throw new Error('Au moins une compétence cible requise');
        }

        return true;
    }

    /**
     * Ajuste la distribution selon le profil utilisateur
     * 
     * @param baseDistribution Distribution de base
     * @param profile Profil utilisateur
     * @param levelConfig Configuration du niveau
     * @param intensityFactor Facteur d'intensité
     * @returns Distribution ajustée
     * @private
     */
    private adjustDistributionForProfile(
        baseDistribution: StepDistributionByMode,
        profile: UserReverseProfile,
        levelConfig: CECRLLevelConfig,
        intensityFactor: number
    ): StepDistributionByMode {
        // Ajustements basés sur les préférences du profil
        let adjustedDistribution = { ...baseDistribution };

        // Ajuster selon les préférences d'exercices
        if (profile.exercisePreferences?.preferredTypes) {
            const preferredTypes = profile.exercisePreferences.preferredTypes;

            if (preferredTypes.includes('practice')) {
                adjustedDistribution = {
                    ...adjustedDistribution,
                    practice: Math.min(0.4, adjustedDistribution.practice * 1.2),
                    exercise: adjustedDistribution.exercise * 0.9
                };
            }

            if (preferredTypes.includes('assessment')) {
                adjustedDistribution = {
                    ...adjustedDistribution,
                    assessment: Math.min(0.25, adjustedDistribution.assessment * 1.3)
                };
            }
        }

        // Ajuster selon l'intensité
        if (intensityFactor > 1.2) {
            // Intensité élevée : plus d'exercices et de pratique
            adjustedDistribution = {
                ...adjustedDistribution,
                exercise: Math.min(0.4, adjustedDistribution.exercise * 1.1),
                practice: Math.min(0.35, adjustedDistribution.practice * 1.1),
                lesson: adjustedDistribution.lesson * 0.9
            };
        }

        // Normaliser pour que la somme soit 1
        const total = Object.values(adjustedDistribution).reduce((sum, value) => sum + value, 0);

        return {
            lesson: adjustedDistribution.lesson / total,
            exercise: adjustedDistribution.exercise / total,
            practice: adjustedDistribution.practice / total,
            assessment: adjustedDistribution.assessment / total,
            revision: adjustedDistribution.revision / total
        };
    }

    /**
     * Ajuste le nombre total d'étapes pour correspondre exactement à la cible
     * 
     * @param distribution Distribution à ajuster (mutable)
     * @param target Nombre cible
     * @param actual Nombre actuel
     * @private
     */
    private adjustTotalStepsCount(
        distribution: Record<StepType, number>,
        target: number,
        actual: number
    ): void {
        const difference = target - actual;

        if (difference > 0) {
            // Ajouter des étapes (priorité : exercise > practice > lesson)
            for (let i = 0; i < difference; i++) {
                if (i % 3 === 0) distribution.exercise++;
                else if (i % 3 === 1) distribution.practice++;
                else distribution.lesson++;
            }
        } else if (difference < 0) {
            // Retirer des étapes (priorité inverse : revision > lesson > exercise)
            const toRemove = Math.abs(difference);
            for (let i = 0; i < toRemove; i++) {
                if (distribution.revision > 0) distribution.revision--;
                else if (distribution.lesson > 1) distribution.lesson--;
                else if (distribution.exercise > 1) distribution.exercise--;
                else if (distribution.practice > 1) distribution.practice--;
            }
        }
    }

    /**
     * Calcule la difficulté adaptée pour une étape
     * 
     * @param baseDifficulty Difficulté de base
     * @param levelConfig Configuration du niveau
     * @param params Paramètres
     * @param stepIndex Index de l'étape
     * @returns Difficulté calculée
     * @private
     */
    private calculateAdaptedDifficulty(
        baseDifficulty: number,
        levelConfig: CECRLLevelConfig,
        params: StepConfigurationParams,
        stepIndex: number
    ): number {
        let difficulty = baseDifficulty * levelConfig.difficultyMultiplier;

        // Progression de difficulté dans le parcours
        const progressionFactor = 1 + (stepIndex * 0.02); // +2% par étape
        difficulty *= progressionFactor;

        // Ajustement selon l'intensité
        const intensityAdjustment = 0.8 + (params.intensity * 0.1);
        difficulty *= intensityAdjustment;

        // Ajustement selon les préférences du profil
        if (params.profile.exercisePreferences?.difficultyPreference) {
            const prefMultiplier = 0.7 + (params.profile.exercisePreferences.difficultyPreference * 0.6);
            difficulty *= prefMultiplier;
        }

        return difficulty;
    }

    /**
     * Calcule la durée adaptée pour une étape
     * 
     * @param baseDuration Durée de base
     * @param levelConfig Configuration du niveau
     * @param params Paramètres
     * @param difficulty Difficulté calculée
     * @returns Durée calculée
     * @private
     */
    private calculateAdaptedDuration(
        baseDuration: number,
        levelConfig: CECRLLevelConfig,
        params: StepConfigurationParams,
        difficulty: number
    ): number {
        let duration = baseDuration * levelConfig.durationMultiplier;

        // Ajustement selon l'intensité (intensité élevée = durée plus courte)
        const intensityFactor = 1.2 - (params.intensity * 0.05);
        duration *= intensityFactor;

        // Ajustement selon la difficulté (plus difficile = plus long)
        const difficultyFactor = 0.8 + (difficulty * 0.4);
        duration *= difficultyFactor;

        return duration;
    }

    /**
     * Calcule la priorité d'une étape
     * 
     * @param stepType Type d'étape
     * @param skillFocus Compétences ciblées
     * @param params Paramètres
     * @returns Priorité calculée (1-10)
     * @private
     */
    private calculateStepPriority(
        stepType: StepType,
        skillFocus: readonly string[],
        params: StepConfigurationParams
    ): number {
        let priority = BASE_STEP_CONFIGS[stepType].weight * 5; // Base 1-7.5

        // Priorité plus élevée pour les domaines de focus
        const focusBonus = skillFocus.some(skill => params.focusAreas.includes(skill)) ? 2 : 0;
        priority += focusBonus;

        // Priorité plus élevée pour les faiblesses identifiées
        const weaknessBonus = skillFocus.some(skill =>
            params.profile.weaknessAreas?.includes(skill)
        ) ? 3 : 0;
        priority += weaknessBonus;

        return Math.max(1, Math.min(10, Math.round(priority)));
    }

    /**
     * Génère un identifiant unique pour une étape
     * 
     * @param stepType Type d'étape
     * @param stepIndex Index de l'étape
     * @param skillFocus Compétences ciblées
     * @returns Identifiant unique
     * @private
     */
    private generateStepId(
        stepType: StepType,
        stepIndex: number,
        skillFocus: readonly string[]
    ): string {
        const skillPrefix = skillFocus.length > 0 ? skillFocus[0].substring(0, 3) : 'gen';
        const timestamp = Date.now().toString(36);
        return `${stepType}-${skillPrefix}-${stepIndex.toString().padStart(3, '0')}-${timestamp}`;
    }

    /**
     * Génère un titre pour une étape
     * 
     * @param stepType Type d'étape
     * @param skillFocus Compétences ciblées
     * @param stepIndex Index de l'étape
     * @returns Titre généré
     * @private
     */
    private generateStepTitle(
        stepType: StepType,
        skillFocus: readonly string[],
        stepIndex: number
    ): string {
        const typeNames: Record<StepType, string> = {
            lesson: 'Leçon',
            exercise: 'Exercice',
            practice: 'Pratique',
            assessment: 'Évaluation',
            revision: 'Révision'
        };

        const skillText = skillFocus.length > 0 ? ` - ${skillFocus[0]}` : '';
        return `${typeNames[stepType]} ${stepIndex + 1}${skillText}`;
    }

    /**
     * Génère une description pour une étape
     * 
     * @param stepType Type d'étape
     * @param skillFocus Compétences ciblées
     * @param targetLevel Niveau cible
     * @returns Description générée
     * @private
     */
    private generateStepDescription(
        stepType: StepType,
        skillFocus: readonly string[],
        targetLevel: CECRLLevel
    ): string {
        const typeDescriptions: Record<StepType, string> = {
            lesson: 'Apprentissage théorique des concepts',
            exercise: 'Mise en pratique des connaissances',
            practice: 'Application dans des situations réelles',
            assessment: 'Évaluation des compétences acquises',
            revision: 'Révision et renforcement des acquis'
        };

        const baseDescription = typeDescriptions[stepType];
        const skillText = skillFocus.length > 0 ? ` en ${skillFocus.join(', ')}` : '';
        const levelText = ` (niveau ${targetLevel})`;

        return `${baseDescription}${skillText}${levelText}.`;
    }

    /**
     * Calcule les prérequis pour une étape
     * 
     * @param stepType Type d'étape
     * @param stepIndex Index de l'étape
     * @param skillFocus Compétences ciblées
     * @returns Liste des prérequis
     * @private
     */
    private calculatePrerequisites(
        stepType: StepType,
        stepIndex: number,
        skillFocus: readonly string[]
    ): readonly string[] {
        // Les évaluations nécessitent généralement des prérequis
        if (stepType === 'assessment' && stepIndex > 0) {
            return [`step-${stepIndex - 1}`]; // Dépend de l'étape précédente
        }

        // Les révisions dépendent des leçons correspondantes
        if (stepType === 'revision' && stepIndex > 2) {
            return [`step-${stepIndex - 3}`, `step-${stepIndex - 2}`]; // Dépend des 2-3 étapes précédentes
        }

        // Pas de prérequis pour les premières étapes
        if (stepIndex < 2) {
            return [];
        }

        // Prérequis général : l'étape précédente pour les compétences complexes
        const complexSkills = ['grammar', 'syntax', 'pragmatics'];
        const hasComplexSkill = skillFocus.some(skill =>
            complexSkills.some(complex => skill.toLowerCase().includes(complex))
        );

        if (hasComplexSkill) {
            return [`step-${stepIndex - 1}`];
        }

        return [];
    }
}