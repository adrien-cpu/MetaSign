/**
 * Système de validation centralisé pour le module d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/types/validation.ts
 * @module ai/services/learning/types
 * @description Validation robuste et centralisée avec gestion d'erreurs détaillée
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-06-28
 */

import type { InteractionType, LearningLevel, LearningDifficulty } from './base';
import { LEARNING_CONSTANTS } from './constants';

/**
 * Résultat d'une validation
 * @interface ValidationResult
 */
export interface ValidationResult {
    /** Indique si la validation a réussi */
    readonly isValid: boolean;
    /** Liste des erreurs détectées */
    readonly errors: ReadonlyArray<string>;
    /** Liste des avertissements */
    readonly warnings: ReadonlyArray<string>;
    /** Niveau de sévérité globale */
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    /** Temps de validation en millisecondes */
    readonly validationTime: number;
}

/**
 * Options de validation personnalisables
 * @interface ValidationOptions
 */
export interface ValidationOptions {
    /** Mode strict (échoue sur les avertissements) */
    readonly strict?: boolean;
    /** Inclure les avertissements dans le résultat */
    readonly includeWarnings?: boolean;
    /** Valider les contraintes temporelles */
    readonly validateTiming?: boolean;
    /** Limite de temps pour la validation */
    readonly timeoutMs?: number;
}

/**
 * Contexte de validation pour des validations avancées
 * @interface ValidationContext
 */
export interface ValidationContext {
    /** Identifiant de l'utilisateur dans le contexte */
    readonly userId?: string;
    /** Session actuelle */
    readonly sessionId?: string;
    /** Environnement de validation */
    readonly environment: 'development' | 'test' | 'production';
    /** Métadonnées supplémentaires */
    readonly metadata?: Record<string, unknown>;
}

/**
 * Type de validation supporté
 * @type ValidationType
 */
export type ValidationType =
    | 'UserInteraction'
    | 'InteractionFilter'
    | 'InteractionServiceConfig'
    | 'InteractionType'
    | 'LearningLevel'
    | 'LearningDifficulty';

/**
 * Validateurs centralisés pour tous les types du module d'apprentissage
 * @namespace SystemValidator
 */
export const SystemValidator = {
    /**
     * Valide un objet selon son type
     * @param obj Objet à valider
     * @param type Type de validation à appliquer
     * @param options Options de validation
     * @returns Résultat de validation détaillé
     */
    validateByType(
        obj: unknown,
        type: ValidationType,
        options: ValidationOptions = {}
    ): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            switch (type) {
                case 'UserInteraction':
                    return this.validateUserInteraction(obj, options);
                case 'InteractionFilter':
                    return this.validateInteractionFilter(obj);
                case 'InteractionServiceConfig':
                    return this.validateServiceConfig(obj);
                case 'InteractionType':
                    return this.validateInteractionType(obj);
                case 'LearningLevel':
                    return this.validateLearningLevel(obj);
                case 'LearningDifficulty':
                    return this.validateLearningDifficulty(obj);
                default:
                    errors.push(`Type de validation non supporté: ${type}`);
            }
        } catch (error) {
            errors.push(`Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }

        const validationTime = performance.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            severity: errors.length > 0 ? 'high' : 'low',
            validationTime
        };
    },

    /**
     * Valide une interaction utilisateur
     * @param interaction Interaction à valider
     * @param options Options de validation
     * @returns Résultat de validation
     */
    validateUserInteraction(
        interaction: unknown,
        options: ValidationOptions = {}
    ): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!interaction || typeof interaction !== 'object') {
            errors.push('L\'interaction doit être un objet');
            return this.createResult(false, errors, warnings, 'critical', startTime);
        }

        const obj = interaction as Record<string, unknown>;

        // Validation des champs obligatoires
        if (!obj.userId || typeof obj.userId !== 'string') {
            errors.push('userId est requis et doit être une chaîne');
        } else if (!/^[a-zA-Z0-9_-]{1,50}$/.test(obj.userId)) {
            errors.push('userId doit respecter le format: 1-50 caractères alphanumériques, _ ou -');
        }

        if (!obj.timestamp || !(obj.timestamp instanceof Date)) {
            errors.push('timestamp est requis et doit être une Date');
        } else {
            if (options.validateTiming && obj.timestamp > new Date()) {
                errors.push('timestamp ne peut pas être dans le futur');
            }
            if (obj.timestamp < new Date('2020-01-01')) {
                warnings.push('timestamp semble très ancien');
            }
        }

        if (!obj.activityId || typeof obj.activityId !== 'string') {
            errors.push('activityId est requis et doit être une chaîne');
        }

        if (!this.isValidInteractionType(obj.interactionType)) {
            errors.push(`interactionType invalide: ${obj.interactionType}`);
        }

        if (typeof obj.duration !== 'number') {
            errors.push('duration est requis et doit être un nombre');
        } else {
            if (obj.duration < 0) {
                errors.push('duration ne peut pas être négative');
            }
            if (obj.duration < LEARNING_CONSTANTS.SYSTEM_LIMITS.MIN_INTERACTION_DURATION) {
                warnings.push('duration très courte (possiblement suspecte)');
            }
            if (obj.duration > LEARNING_CONSTANTS.SYSTEM_LIMITS.MAX_SESSION_DURATION) {
                errors.push('duration dépasse la limite maximale');
            }
        }

        // Validation des détails
        if (!obj.details || typeof obj.details !== 'object') {
            errors.push('details est requis et doit être un objet');
        }

        // Validation des informations d'appareil
        if (!obj.deviceInfo || typeof obj.deviceInfo !== 'object') {
            errors.push('deviceInfo est requis et doit être un objet');
        }

        const severity = this.calculateSeverity(errors, warnings);
        const isValid = errors.length === 0 && (!options.strict || warnings.length === 0);

        return this.createResult(isValid, errors, warnings, severity, startTime);
    },

    /**
     * Valide un filtre d'interaction
     * @param filter Filtre à valider
     * @returns Résultat de validation
     */
    validateInteractionFilter(filter: unknown): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!filter || typeof filter !== 'object') {
            errors.push('Le filtre doit être un objet');
            return this.createResult(false, errors, warnings, 'critical', startTime);
        }

        const obj = filter as Record<string, unknown>;

        if (!obj.userId || typeof obj.userId !== 'string') {
            errors.push('userId est requis dans le filtre');
        }

        if (obj.limit && (typeof obj.limit !== 'number' || obj.limit <= 0)) {
            errors.push('limit doit être un nombre positif');
        }

        if (obj.startDate && !(obj.startDate instanceof Date)) {
            errors.push('startDate doit être une Date valide');
        }

        if (obj.endDate && !(obj.endDate instanceof Date)) {
            errors.push('endDate doit être une Date valide');
        }

        if (obj.startDate && obj.endDate && obj.startDate > obj.endDate) {
            errors.push('startDate doit être antérieure à endDate');
        }

        const severity = this.calculateSeverity(errors, warnings);
        const isValid = errors.length === 0;

        return this.createResult(isValid, errors, warnings, severity, startTime);
    },

    /**
     * Valide une configuration de service
     * @param config Configuration à valider
     * @returns Résultat de validation
     */
    validateServiceConfig(config: unknown): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!config || typeof config !== 'object') {
            errors.push('La configuration doit être un objet');
            return this.createResult(false, errors, warnings, 'critical', startTime);
        }

        const obj = config as Record<string, unknown>;

        if (obj.maxCacheSize && (typeof obj.maxCacheSize !== 'number' || obj.maxCacheSize <= 0)) {
            errors.push('maxCacheSize doit être un nombre positif');
        }

        if (obj.retentionTime && (typeof obj.retentionTime !== 'number' || obj.retentionTime <= 0)) {
            errors.push('retentionTime doit être un nombre positif');
        }

        if (obj.performanceThreshold && (typeof obj.performanceThreshold !== 'number' || obj.performanceThreshold <= 0)) {
            errors.push('performanceThreshold doit être un nombre positif');
        }

        const severity = this.calculateSeverity(errors, warnings);
        const isValid = errors.length === 0;

        return this.createResult(isValid, errors, warnings, severity, startTime);
    },

    /**
     * Valide un type d'interaction
     * @param type Type à valider
     * @returns Résultat de validation
     */
    validateInteractionType(type: unknown): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!this.isValidInteractionType(type)) {
            errors.push(`Type d'interaction invalide: ${type}`);
        }

        const severity = this.calculateSeverity(errors, warnings);
        const isValid = errors.length === 0;

        return this.createResult(isValid, errors, warnings, severity, startTime);
    },

    /**
     * Valide un niveau d'apprentissage
     * @param level Niveau à valider
     * @returns Résultat de validation
     */
    validateLearningLevel(level: unknown): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!this.isValidLearningLevel(level)) {
            errors.push(`Niveau d'apprentissage invalide: ${level}`);
        }

        const severity = this.calculateSeverity(errors, warnings);
        const isValid = errors.length === 0;

        return this.createResult(isValid, errors, warnings, severity, startTime);
    },

    /**
     * Valide une difficulté d'apprentissage
     * @param difficulty Difficulté à valider
     * @returns Résultat de validation
     */
    validateLearningDifficulty(difficulty: unknown): ValidationResult {
        const startTime = performance.now();
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!this.isValidLearningDifficulty(difficulty)) {
            errors.push(`Difficulté d'apprentissage invalide: ${difficulty}`);
        }

        const severity = this.calculateSeverity(errors, warnings);
        const isValid = errors.length === 0;

        return this.createResult(isValid, errors, warnings, severity, startTime);
    },

    // ===== MÉTHODES UTILITAIRES PRIVÉES =====

    /**
     * Vérifie si un type d'interaction est valide
     */
    isValidInteractionType(type: unknown): type is InteractionType {
        return typeof type === 'string' &&
            LEARNING_CONSTANTS.VALID_INTERACTION_TYPES.includes(type as InteractionType);
    },

    /**
     * Vérifie si un niveau d'apprentissage est valide
     */
    isValidLearningLevel(level: unknown): level is LearningLevel {
        return typeof level === 'string' &&
            LEARNING_CONSTANTS.VALID_CECRL_LEVELS.includes(level as LearningLevel);
    },

    /**
     * Vérifie si une difficulté d'apprentissage est valide
     */
    isValidLearningDifficulty(difficulty: unknown): difficulty is LearningDifficulty {
        return typeof difficulty === 'string' &&
            LEARNING_CONSTANTS.VALID_DIFFICULTIES.includes(difficulty as LearningDifficulty);
    },

    /**
     * Calcule la sévérité basée sur les erreurs et avertissements
     */
    calculateSeverity(errors: string[], warnings: string[]): ValidationResult['severity'] {
        if (errors.length > 5) return 'critical';
        if (errors.length > 0) return 'high';
        if (warnings.length > 3) return 'medium';
        return 'low';
    },

    /**
     * Crée un résultat de validation
     */
    createResult(
        isValid: boolean,
        errors: string[],
        warnings: string[],
        severity: ValidationResult['severity'],
        startTime: number
    ): ValidationResult {
        return {
            isValid,
            errors,
            warnings,
            severity,
            validationTime: performance.now() - startTime
        };
    }
} as const;