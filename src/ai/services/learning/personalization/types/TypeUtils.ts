/**
 * Utilitaires de validation et manipulation des types pour les parcours d'apprentissage
 * 
 * @file src/ai/services/learning/personalization/types/TypeUtils.ts
 * @module ai/services/learning/personalization/types
 * @description Fonctions utilitaires pour la validation et manipulation des types LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ===== TYPES DE BASE (Autonomes) =====

/**
 * Niveaux CECRL supportés pour l'apprentissage de la LSF
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Types d'étapes disponibles dans un parcours d'apprentissage
 */
export type StepType = 'exercise' | 'lesson' | 'assessment' | 'revision' | 'practice';

/**
 * Statuts possibles d'une étape dans le parcours
 */
export type StepStatus = 'pending' | 'available' | 'completed' | 'locked';

/**
 * Styles d'apprentissage supportés pour l'adaptation pédagogique
 */
export type LearningStyle = 'inductive' | 'deductive' | 'mixed';

/**
 * Modes de génération de parcours d'apprentissage
 */
export type PathGenerationMode = 'balanced' | 'mastery' | 'comprehensive' | 'fast-track';

/**
 * Niveaux d'intensité pour l'apprentissage (1 = très léger, 5 = très intensif)
 */
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Types de compétences LSF ciblées par les parcours
 */
export type LSFSkillType =
    | 'basicVocabulary'
    | 'advancedVocabulary'
    | 'fingerSpelling'
    | 'grammaticalStructures'
    | 'spatialExpression'
    | 'facialExpressions'
    | 'culturalContext'
    | 'conversationSkills'
    | 'comprehension'
    | 'expression';

// ===== CONSTANTES LOCALES =====

/**
 * Constantes de validation pour les types
 */
const VALIDATION_CONSTANTS = {
    VALID_CECRL_LEVELS: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const,
    VALID_STEP_TYPES: ['exercise', 'lesson', 'assessment', 'revision', 'practice'] as const,
    VALID_STEP_STATUSES: ['pending', 'available', 'completed', 'locked'] as const,
    VALID_LEARNING_STYLES: ['inductive', 'deductive', 'mixed'] as const,
    VALID_GENERATION_MODES: ['balanced', 'mastery', 'comprehensive', 'fast-track'] as const,
    VALID_LSF_SKILLS: [
        'basicVocabulary', 'advancedVocabulary', 'fingerSpelling',
        'grammaticalStructures', 'spatialExpression', 'facialExpressions',
        'culturalContext', 'conversationSkills', 'comprehension', 'expression'
    ] as const,
    DEFAULT_LEVEL_DURATIONS: {
        A1: 30, A2: 45, B1: 60, B2: 75, C1: 90, C2: 90
    } as const,
    MIN_PROGRESS_THRESHOLD: 0.8,
    DEFAULT_INTENSITY: 3,
    DEFAULT_SESSION_DURATION: 30
} as const;

/**
 * Mappings pour l'affichage des types
 */
const DISPLAY_MAPPINGS = {
    CECRL_LEVEL_NAMES: {
        A1: 'Découverte', A2: 'Survie', B1: 'Seuil',
        B2: 'Avancé', C1: 'Autonome', C2: 'Maîtrise'
    } as const,
    STEP_TYPE_NAMES: {
        lesson: 'Leçon', exercise: 'Exercice', practice: 'Pratique',
        assessment: 'Évaluation', revision: 'Révision'
    } as const,
    LSF_SKILL_NAMES: {
        basicVocabulary: 'Vocabulaire de base',
        advancedVocabulary: 'Vocabulaire avancé',
        fingerSpelling: 'Dactylologie',
        grammaticalStructures: 'Structures grammaticales',
        spatialExpression: 'Expression spatiale',
        facialExpressions: 'Expressions faciales',
        culturalContext: 'Contexte culturel',
        conversationSkills: 'Compétences conversationnelles',
        comprehension: 'Compréhension',
        expression: 'Expression'
    } as const
} as const;

// ===== INTERFACES MINIMALES =====

/**
 * Options de génération de parcours (version simplifiée)
 */
interface PathGenerationOptions {
    readonly targetLevel: CECRLLevel;
    readonly targetDuration?: number;
    readonly intensity?: IntensityLevel;
    readonly focusAreas?: readonly LSFSkillType[];
    readonly preferredExerciseTypes?: readonly string[];
    readonly mode?: PathGenerationMode;
    readonly additionalParams?: Readonly<Record<string, unknown>>;
    readonly forceRegeneration?: boolean;
    readonly includeRevisions?: boolean;
    readonly includeAssessments?: boolean;
    readonly maxSteps?: number;
}

/**
 * Configuration de répartition des étapes
 */
interface StepDistributionConfig {
    readonly lesson: number;
    readonly exercise: number;
    readonly practice: number;
    readonly assessment: number;
    readonly revision: number;
}

// ===== UTILITAIRES PRINCIPAUX =====

/**
 * Utilitaires centralisés pour la gestion des types des parcours d'apprentissage
 */
export const LearningPathTypeUtils = {
    /**
     * Vérifie si un niveau CECRL est valide
     * 
     * @param level Niveau à vérifier
     * @returns True si le niveau est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.isValidCECRLLevel('A1'); // true
     * const isInvalid = LearningPathTypeUtils.isValidCECRLLevel('X1'); // false
     * ```
     */
    isValidCECRLLevel: (level: string): level is CECRLLevel => {
        return VALIDATION_CONSTANTS.VALID_CECRL_LEVELS.includes(level as CECRLLevel);
    },

    /**
     * Vérifie si un type d'étape est valide
     * 
     * @param type Type d'étape à vérifier
     * @returns True si le type est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.isValidStepType('lesson'); // true
     * const isInvalid = LearningPathTypeUtils.isValidStepType('invalid'); // false
     * ```
     */
    isValidStepType: (type: string): type is StepType => {
        return VALIDATION_CONSTANTS.VALID_STEP_TYPES.includes(type as StepType);
    },

    /**
     * Vérifie si un statut d'étape est valide
     * 
     * @param status Statut à vérifier
     * @returns True si le statut est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.isValidStepStatus('available'); // true
     * ```
     */
    isValidStepStatus: (status: string): status is StepStatus => {
        return VALIDATION_CONSTANTS.VALID_STEP_STATUSES.includes(status as StepStatus);
    },

    /**
     * Vérifie si un style d'apprentissage est valide
     * 
     * @param style Style d'apprentissage à vérifier
     * @returns True si le style est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.isValidLearningStyle('mixed'); // true
     * ```
     */
    isValidLearningStyle: (style: string): style is LearningStyle => {
        return VALIDATION_CONSTANTS.VALID_LEARNING_STYLES.includes(style as LearningStyle);
    },

    /**
     * Vérifie si un mode de génération est valide
     * 
     * @param mode Mode de génération à vérifier
     * @returns True si le mode est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.isValidGenerationMode('balanced'); // true
     * ```
     */
    isValidGenerationMode: (mode: string): mode is PathGenerationMode => {
        return VALIDATION_CONSTANTS.VALID_GENERATION_MODES.includes(mode as PathGenerationMode);
    },

    /**
     * Vérifie si une compétence LSF est valide
     * 
     * @param skill Compétence LSF à vérifier
     * @returns True si la compétence est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.isValidLSFSkill('basicVocabulary'); // true
     * ```
     */
    isValidLSFSkill: (skill: string): skill is LSFSkillType => {
        return VALIDATION_CONSTANTS.VALID_LSF_SKILLS.includes(skill as LSFSkillType);
    },

    /**
     * Normalise un niveau CECRL en garantissant sa validité
     * 
     * @param level Niveau à normaliser
     * @returns Niveau CECRL valide (A1 par défaut si invalide)
     * 
     * @example
     * ```typescript
     * const normalized = LearningPathTypeUtils.normalizeCECRLLevel('a1'); // 'A1'
     * const defaulted = LearningPathTypeUtils.normalizeCECRLLevel('invalid'); // 'A1'
     * ```
     */
    normalizeCECRLLevel: (level: string): CECRLLevel => {
        const normalizedLevel = level.toUpperCase();
        return LearningPathTypeUtils.isValidCECRLLevel(normalizedLevel)
            ? normalizedLevel
            : 'A1';
    },

    /**
     * Obtient le niveau CECRL suivant dans la progression
     * 
     * @param currentLevel Niveau actuel
     * @returns Niveau suivant ou niveau actuel si déjà au maximum
     * 
     * @example
     * ```typescript
     * const next = LearningPathTypeUtils.getNextCECRLLevel('A1'); // 'A2'
     * const max = LearningPathTypeUtils.getNextCECRLLevel('C2'); // 'C2'
     * ```
     */
    getNextCECRLLevel: (currentLevel: CECRLLevel): CECRLLevel => {
        const levels = VALIDATION_CONSTANTS.VALID_CECRL_LEVELS;
        const currentIndex = levels.indexOf(currentLevel);

        if (currentIndex === -1 || currentIndex === levels.length - 1) {
            return currentLevel;
        }

        return levels[currentIndex + 1];
    },

    /**
     * Obtient le niveau CECRL précédent dans la progression
     * 
     * @param currentLevel Niveau actuel
     * @returns Niveau précédent ou niveau actuel si déjà au minimum
     * 
     * @example
     * ```typescript
     * const prev = LearningPathTypeUtils.getPreviousCECRLLevel('A2'); // 'A1'
     * const min = LearningPathTypeUtils.getPreviousCECRLLevel('A1'); // 'A1'
     * ```
     */
    getPreviousCECRLLevel: (currentLevel: CECRLLevel): CECRLLevel => {
        const levels = VALIDATION_CONSTANTS.VALID_CECRL_LEVELS;
        const currentIndex = levels.indexOf(currentLevel);

        if (currentIndex <= 0) {
            return currentLevel;
        }

        return levels[currentIndex - 1];
    },

    /**
     * Obtient la durée par défaut pour un niveau CECRL
     * 
     * @param level Niveau CECRL
     * @returns Durée en jours
     * 
     * @example
     * ```typescript
     * const duration = LearningPathTypeUtils.getDefaultDurationForLevel('A1'); // 30
     * ```
     */
    getDefaultDurationForLevel: (level: CECRLLevel): number => {
        return VALIDATION_CONSTANTS.DEFAULT_LEVEL_DURATIONS[level];
    },

    /**
     * Calcule la distance entre deux niveaux CECRL
     * 
     * @param fromLevel Niveau de départ
     * @param toLevel Niveau d'arrivée
     * @returns Distance (nombre de niveaux)
     * 
     * @example
     * ```typescript
     * const distance = LearningPathTypeUtils.calculateLevelDistance('A1', 'B1'); // 2
     * ```
     */
    calculateLevelDistance: (fromLevel: CECRLLevel, toLevel: CECRLLevel): number => {
        const levels = VALIDATION_CONSTANTS.VALID_CECRL_LEVELS;
        const fromIndex = levels.indexOf(fromLevel);
        const toIndex = levels.indexOf(toLevel);
        return Math.abs(toIndex - fromIndex);
    },

    /**
     * Formate un nom de compétence LSF pour l'affichage
     * 
     * @param skill Compétence LSF
     * @returns Nom formaté pour l'affichage
     * 
     * @example
     * ```typescript
     * const formatted = LearningPathTypeUtils.formatSkillName('basicVocabulary');
     * console.log(formatted); // 'Vocabulaire de base'
     * ```
     */
    formatSkillName: (skill: LSFSkillType): string => {
        return DISPLAY_MAPPINGS.LSF_SKILL_NAMES[skill];
    },

    /**
     * Formate un niveau CECRL pour l'affichage
     * 
     * @param level Niveau CECRL
     * @returns Nom formaté pour l'affichage
     * 
     * @example
     * ```typescript
     * const formatted = LearningPathTypeUtils.formatCECRLLevel('A1');
     * console.log(formatted); // 'A1 - Découverte'
     * ```
     */
    formatCECRLLevel: (level: CECRLLevel): string => {
        return `${level} - ${DISPLAY_MAPPINGS.CECRL_LEVEL_NAMES[level]}`;
    },

    /**
     * Formate un type d'étape pour l'affichage
     * 
     * @param type Type d'étape
     * @returns Nom formaté pour l'affichage
     * 
     * @example
     * ```typescript
     * const formatted = LearningPathTypeUtils.formatStepType('lesson');
     * console.log(formatted); // 'Leçon'
     * ```
     */
    formatStepType: (type: StepType): string => {
        return DISPLAY_MAPPINGS.STEP_TYPE_NAMES[type];
    },

    /**
     * Valide et normalise les options de génération de parcours
     * 
     * @param options Options à valider
     * @returns Options normalisées et validées
     * 
     * @example
     * ```typescript
     * const normalized = LearningPathTypeUtils.normalizePathOptions({
     *     targetLevel: 'a1',
     *     intensity: 6
     * });
     * console.log(normalized.targetLevel); // 'A1'
     * console.log(normalized.intensity); // 5
     * ```
     */
    normalizePathOptions: (options: Partial<PathGenerationOptions>): PathGenerationOptions => {
        // Validation et normalisation avec valeurs par défaut sûres
        const targetLevel = options.targetLevel ?
            LearningPathTypeUtils.normalizeCECRLLevel(options.targetLevel) : 'A1';

        const mode = options.mode && LearningPathTypeUtils.isValidGenerationMode(options.mode) ?
            options.mode : 'balanced';

        const intensity = options.intensity &&
            typeof options.intensity === 'number' &&
            options.intensity >= 1 &&
            options.intensity <= 5 ?
            options.intensity as IntensityLevel :
            VALIDATION_CONSTANTS.DEFAULT_INTENSITY as IntensityLevel;

        const targetDuration = options.targetDuration &&
            typeof options.targetDuration === 'number' &&
            options.targetDuration > 0 ?
            Math.floor(options.targetDuration) :
            undefined;

        const focusAreas = options.focusAreas?.filter(skill =>
            typeof skill === 'string' && LearningPathTypeUtils.isValidLSFSkill(skill)
        ) as LSFSkillType[] || undefined;

        return {
            targetLevel,
            mode,
            intensity,
            targetDuration,
            focusAreas,
            preferredExerciseTypes: options.preferredExerciseTypes || undefined,
            additionalParams: options.additionalParams || undefined,
            forceRegeneration: options.forceRegeneration || undefined,
            includeRevisions: options.includeRevisions || undefined,
            includeAssessments: options.includeAssessments || undefined,
            maxSteps: options.maxSteps &&
                typeof options.maxSteps === 'number' &&
                options.maxSteps > 0 ?
                Math.floor(options.maxSteps) :
                undefined
        };
    },

    /**
     * Valide une configuration de répartition d'étapes
     * 
     * @param distribution Configuration de répartition
     * @returns True si la configuration est valide
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.validateStepDistribution({
     *     lesson: 0.3,
     *     exercise: 0.4,
     *     practice: 0.1,
     *     assessment: 0.1,
     *     revision: 0.1
     * }); // true
     * ```
     */
    validateStepDistribution: (distribution: StepDistributionConfig): boolean => {
        try {
            const total = distribution.lesson + distribution.exercise + distribution.practice +
                distribution.assessment + distribution.revision;

            // Vérifier que la somme est proche de 1 (tolérance de 0.01)
            const isValidTotal = Math.abs(total - 1) < 0.01;

            // Vérifier que toutes les valeurs sont positives ou nulles
            const areValidValues = Object.values(distribution).every(value =>
                typeof value === 'number' && value >= 0 && value <= 1
            );

            return isValidTotal && areValidValues;
        } catch {
            return false;
        }
    },

    /**
     * Génère un identifiant unique pour un parcours
     * 
     * @param userId Identifiant de l'utilisateur
     * @param prefix Préfixe optionnel
     * @returns Identifiant unique
     * 
     * @example
     * ```typescript
     * const id = LearningPathTypeUtils.generatePathId('user-123', 'custom');
     * console.log(id); // 'custom-user-123-1640995200000-abcd'
     * ```
     */
    generatePathId: (userId: string, prefix?: string): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 6);
        const parts = [prefix, userId, timestamp.toString(), random].filter(Boolean);
        return parts.join('-');
    },

    /**
     * Estime la durée d'un parcours basé sur le niveau et l'intensité
     * 
     * @param fromLevel Niveau de départ
     * @param toLevel Niveau cible
     * @param intensity Intensité d'apprentissage
     * @returns Durée estimée en jours
     * 
     * @example
     * ```typescript
     * const duration = LearningPathTypeUtils.estimatePathDuration('A1', 'A2', 3);
     * console.log(duration); // 45
     * ```
     */
    estimatePathDuration: (fromLevel: CECRLLevel, toLevel: CECRLLevel, intensity: IntensityLevel): number => {
        const baseDuration = LearningPathTypeUtils.getDefaultDurationForLevel(toLevel);
        const distance = LearningPathTypeUtils.calculateLevelDistance(fromLevel, toLevel);

        // Ajustement selon l'intensité (plus l'intensité est élevée, plus c'est rapide)
        const intensityFactor = 1 - ((intensity - 1) * 0.15); // 0.4 to 1.0

        // Ajustement selon la distance entre niveaux
        const distanceFactor = distance === 0 ? 0.5 : Math.min(distance, 3);

        return Math.ceil(baseDuration * intensityFactor * distanceFactor);
    },

    /**
     * Validation rapide des options de parcours
     * 
     * @param options Options à valider
     * @returns True si les options sont valides
     * 
     * @example
     * ```typescript
     * const isValid = LearningPathTypeUtils.quickValidatePathOptions({
     *     targetLevel: 'A1',
     *     intensity: 3
     * }); // true
     * ```
     */
    quickValidatePathOptions: (options: Partial<PathGenerationOptions>): boolean => {
        try {
            if (options.targetLevel && !LearningPathTypeUtils.isValidCECRLLevel(options.targetLevel)) {
                return false;
            }

            if (options.intensity !== undefined &&
                (typeof options.intensity !== 'number' || options.intensity < 1 || options.intensity > 5)) {
                return false;
            }

            if (options.mode && !LearningPathTypeUtils.isValidGenerationMode(options.mode)) {
                return false;
            }

            if (options.targetDuration !== undefined &&
                (typeof options.targetDuration !== 'number' || options.targetDuration <= 0 || options.targetDuration > 365)) {
                return false;
            }

            if (options.focusAreas && !options.focusAreas.every(skill =>
                typeof skill === 'string' && LearningPathTypeUtils.isValidLSFSkill(skill)
            )) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
} as const;

/**
 * Fonctions utilitaires pour la normalisation des valeurs
 */
export const NormalizationUtils = {
    /**
     * Normalise et valide un niveau de difficulté
     * 
     * @param difficulty Niveau de difficulté à normaliser
     * @returns Niveau de difficulté normalisé entre 0 et 1
     * 
     * @example
     * ```typescript
     * const normalized = NormalizationUtils.normalizeDifficulty(1.5); // Returns 1
     * const normalized2 = NormalizationUtils.normalizeDifficulty(-0.5); // Returns 0
     * ```
     */
    normalizeDifficulty: (difficulty: number): number => {
        if (typeof difficulty !== 'number' || isNaN(difficulty)) {
            return 0.5; // Valeur par défaut
        }
        return Math.max(0, Math.min(1, difficulty));
    },

    /**
     * Normalise et valide une durée en minutes
     * 
     * @param duration Durée à normaliser
     * @returns Durée normalisée (minimum 1 minute)
     * 
     * @example
     * ```typescript
     * const normalized = NormalizationUtils.normalizeDuration(-5); // Returns 1
     * const normalized2 = NormalizationUtils.normalizeDuration(30.7); // Returns 30
     * ```
     */
    normalizeDuration: (duration: number): number => {
        if (typeof duration !== 'number' || isNaN(duration) || duration < 1) {
            return 1; // Minimum 1 minute
        }
        return Math.floor(duration);
    },

    /**
     * Normalise et valide une priorité d'étape
     * 
     * @param priority Priorité à normaliser
     * @returns Priorité normalisée (minimum 0)
     * 
     * @example
     * ```typescript
     * const normalized = NormalizationUtils.normalizePriority(-5); // Returns 0
     * const normalized2 = NormalizationUtils.normalizePriority(3.7); // Returns 3
     * ```
     */
    normalizePriority: (priority: number): number => {
        if (typeof priority !== 'number' || isNaN(priority) || priority < 0) {
            return 0; // Minimum 0
        }
        return Math.floor(priority);
    }
} as const;

// ===== EXPORTS PRINCIPAUX =====

/**
 * Validation rapide des options de parcours (export direct pour facilité d'usage)
 */
export const quickValidatePathOptions = LearningPathTypeUtils.quickValidatePathOptions;

/**
 * Estimation rapide de la durée d'un parcours (export direct pour facilité d'usage)
 */
export const estimatePathDuration = LearningPathTypeUtils.estimatePathDuration;

/**
 * Génération rapide d'un identifiant unique (export direct pour facilité d'usage)
 */
export const generateUniquePathId = LearningPathTypeUtils.generatePathId;

/**
 * Formatage rapide d'un nom de compétence LSF (export direct pour facilité d'usage)
 */
export const formatSkillName = LearningPathTypeUtils.formatSkillName;

/**
 * Normalisation rapide des options de parcours (export direct pour facilité d'usage)
 */
export const normalizePathOptions = LearningPathTypeUtils.normalizePathOptions;