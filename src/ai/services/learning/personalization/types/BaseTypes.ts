/**
 * Types de base pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/types/BaseTypes.ts
 * @module ai/services/learning/personalization/types
 * @description Types TypeScript de base pour la gestion des parcours d'apprentissage
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

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

/**
 * Niveaux de difficulté normalisés (0 = très facile, 1 = très difficile)
 */
export type DifficultyLevel = number; // 0-1

/**
 * Priorités pour le tri et l'organisation des étapes
 */
export type StepPriority = number; // Entier positif, plus élevé = plus prioritaire

/**
 * Durées en minutes pour les estimations temporelles
 */
export type DurationMinutes = number; // Entier positif

/**
 * Type pour les identifiants uniques du système
 */
export type UniqueId = string;

/**
 * Type pour les titres et noms dans le système
 */
export type DisplayName = string;

/**
 * Type pour les descriptions et textes explicatifs
 */
export type Description = string;

/**
 * Type pour les métadonnées flexibles
 */
export type Metadata = Readonly<Record<string, unknown>>;

/**
 * Type pour les paramètres de configuration flexibles
 */
export type ConfigParams = Readonly<Record<string, unknown>>;

/**
 * Garde de type pour vérifier si une valeur est un niveau CECRL valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un niveau CECRL valide
 * 
 * @example
 * ```typescript
 * if (isCECRLLevel('A1')) {
 *     console.log('Niveau valide');
 * }
 * ```
 */
export function isCECRLLevel(value: unknown): value is CECRLLevel {
    return typeof value === 'string' &&
        ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un type d'étape valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un type d'étape valide
 * 
 * @example
 * ```typescript
 * if (isStepType('lesson')) {
 *     console.log('Type d\'étape valide');
 * }
 * ```
 */
export function isStepType(value: unknown): value is StepType {
    return typeof value === 'string' &&
        ['exercise', 'lesson', 'assessment', 'revision', 'practice'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un statut d'étape valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un statut d'étape valide
 * 
 * @example
 * ```typescript
 * if (isStepStatus('available')) {
 *     console.log('Statut valide');
 * }
 * ```
 */
export function isStepStatus(value: unknown): value is StepStatus {
    return typeof value === 'string' &&
        ['pending', 'available', 'completed', 'locked'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un style d'apprentissage valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un style d'apprentissage valide
 * 
 * @example
 * ```typescript
 * if (isLearningStyle('mixed')) {
 *     console.log('Style d\'apprentissage valide');
 * }
 * ```
 */
export function isLearningStyle(value: unknown): value is LearningStyle {
    return typeof value === 'string' &&
        ['inductive', 'deductive', 'mixed'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un mode de génération valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un mode de génération valide
 * 
 * @example
 * ```typescript
 * if (isPathGenerationMode('balanced')) {
 *     console.log('Mode de génération valide');
 * }
 * ```
 */
export function isPathGenerationMode(value: unknown): value is PathGenerationMode {
    return typeof value === 'string' &&
        ['balanced', 'mastery', 'comprehensive', 'fast-track'].includes(value);
}

/**
 * Garde de type pour vérifier si une valeur est un niveau d'intensité valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un niveau d'intensité valide
 * 
 * @example
 * ```typescript
 * if (isIntensityLevel(3)) {
 *     console.log('Niveau d\'intensité valide');
 * }
 * ```
 */
export function isIntensityLevel(value: unknown): value is IntensityLevel {
    return typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= 5;
}

/**
 * Garde de type pour vérifier si une valeur est un type de compétence LSF valide
 * 
 * @param value Valeur à vérifier
 * @returns True si la valeur est un type de compétence LSF valide
 * 
 * @example
 * ```typescript
 * if (isLSFSkillType('basicVocabulary')) {
 *     console.log('Type de compétence LSF valide');
 * }
 * ```
 */
export function isLSFSkillType(value: unknown): value is LSFSkillType {
    return typeof value === 'string' &&
        [
            'basicVocabulary', 'advancedVocabulary', 'fingerSpelling',
            'grammaticalStructures', 'spatialExpression', 'facialExpressions',
            'culturalContext', 'conversationSkills', 'comprehension', 'expression'
        ].includes(value);
}

/**
 * Normalise et valide un niveau de difficulté
 * 
 * @param difficulty Niveau de difficulté à normaliser
 * @returns Niveau de difficulté normalisé entre 0 et 1
 * 
 * @example
 * ```typescript
 * const normalized = normalizeDifficulty(1.5); // Returns 1
 * const normalized2 = normalizeDifficulty(-0.5); // Returns 0
 * ```
 */
export function normalizeDifficulty(difficulty: number): DifficultyLevel {
    if (typeof difficulty !== 'number' || isNaN(difficulty)) {
        return 0.5; // Valeur par défaut
    }
    return Math.max(0, Math.min(1, difficulty));
}

/**
 * Normalise et valide une durée en minutes
 * 
 * @param duration Durée à normaliser
 * @returns Durée normalisée (minimum 1 minute)
 * 
 * @example
 * ```typescript
 * const normalized = normalizeDuration(-5); // Returns 1
 * const normalized2 = normalizeDuration(30.7); // Returns 30
 * ```
 */
export function normalizeDuration(duration: number): DurationMinutes {
    if (typeof duration !== 'number' || isNaN(duration) || duration < 1) {
        return 1; // Minimum 1 minute
    }
    return Math.floor(duration);
}

/**
 * Normalise et valide une priorité d'étape
 * 
 * @param priority Priorité à normaliser
 * @returns Priorité normalisée (minimum 0)
 * 
 * @example
 * ```typescript
 * const normalized = normalizePriority(-5); // Returns 0
 * const normalized2 = normalizePriority(3.7); // Returns 3
 * ```
 */
export function normalizePriority(priority: number): StepPriority {
    if (typeof priority !== 'number' || isNaN(priority) || priority < 0) {
        return 0; // Minimum 0
    }
    return Math.floor(priority);
}