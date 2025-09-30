/**
 * Service de validation pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/validation/PathValidationService.ts
 * @module ai/services/learning/personalization/validation
 * @description Service de validation des paramètres et contraintes des parcours d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

import type { PathGenerationOptions, CECRLLevel } from '@learning/types/LearningPathTypes';
import type { UserReverseProfile } from '@learning/human/coda/codavirtuel/types';
import { LearningPathTypeUtils } from '@learning/types/LearningPathTypes';
import { Logger } from '@ai/utils/Logger';

/**
 * Erreur de validation de parcours
 * 
 * @class PathValidationError
 * @extends Error
 */
export class PathValidationError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly field?: string
    ) {
        super(message);
        this.name = 'PathValidationError';
        Object.setPrototypeOf(this, PathValidationError.prototype);
    }
}

/**
 * Codes d'erreur de validation
 */
export const VALIDATION_ERROR_CODES = {
    INVALID_USER_ID: 'INVALID_USER_ID',
    INVALID_PROFILE: 'INVALID_PROFILE',
    INVALID_CURRENT_LEVEL: 'INVALID_CURRENT_LEVEL',
    INVALID_TARGET_LEVEL: 'INVALID_TARGET_LEVEL',
    INVALID_GENERATION_MODE: 'INVALID_GENERATION_MODE',
    INVALID_INTENSITY: 'INVALID_INTENSITY',
    INVALID_DURATION: 'INVALID_DURATION',
    INCOMPATIBLE_LEVELS: 'INCOMPATIBLE_LEVELS'
} as const;

/**
 * Résultat de validation
 * 
 * @interface ValidationResult
 */
interface ValidationResult {
    /** Validation réussie */
    readonly isValid: boolean;
    /** Liste des erreurs */
    readonly errors: readonly PathValidationError[];
    /** Avertissements non bloquants */
    readonly warnings: readonly string[];
}

/**
 * Service de validation pour les parcours d'apprentissage
 * 
 * @class PathValidationService
 * @example
 * ```typescript
 * const validator = new PathValidationService();
 * validator.validateGenerationParams(userId, profile, options);
 * ```
 */
export class PathValidationService {
    private readonly logger = Logger.getInstance('PathValidationService');

    /**
     * Valide les paramètres de génération d'un parcours
     * 
     * @param userId - Identifiant utilisateur
     * @param profile - Profil utilisateur
     * @param options - Options de génération
     * @throws {PathValidationError} Si les paramètres ne sont pas valides
     */
    public validateGenerationParams(
        userId: string,
        profile: UserReverseProfile,
        options: PathGenerationOptions
    ): void {
        const result = this.validateGenerationParamsDetailed(userId, profile, options);

        if (!result.isValid) {
            const firstError = result.errors[0];
            throw firstError;
        }

        // Log des avertissements
        if (result.warnings.length > 0) {
            this.logger.warn('Avertissements de validation', {
                userId,
                warnings: result.warnings
            });
        }
    }

    /**
     * Valide les paramètres de génération avec résultat détaillé
     * 
     * @param userId - Identifiant utilisateur
     * @param profile - Profil utilisateur
     * @param options - Options de génération
     * @returns ValidationResult Résultat détaillé de la validation
     */
    public validateGenerationParamsDetailed(
        userId: string,
        profile: UserReverseProfile,
        options: PathGenerationOptions
    ): ValidationResult {
        const errors: PathValidationError[] = [];
        const warnings: string[] = [];

        // Validation de l'ID utilisateur
        const userIdErrors = this.validateUserId(userId);
        errors.push(...userIdErrors);

        // Validation du profil utilisateur
        const profileErrors = this.validateUserProfile(profile);
        errors.push(...profileErrors);

        // Validation des options
        const optionsErrors = this.validateGenerationOptions(options);
        errors.push(...optionsErrors);

        // Validation de la cohérence entre profil et options
        if (errors.length === 0) {
            const consistencyResult = this.validateConsistency(profile, options);
            errors.push(...consistencyResult.errors);
            warnings.push(...consistencyResult.warnings);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Valide un identifiant utilisateur
     * 
     * @param userId - Identifiant à valider
     * @returns PathValidationError[] Liste des erreurs
     * @private
     */
    private validateUserId(userId: string): PathValidationError[] {
        const errors: PathValidationError[] = [];

        if (!userId) {
            errors.push(new PathValidationError(
                'ID utilisateur requis',
                VALIDATION_ERROR_CODES.INVALID_USER_ID,
                'userId'
            ));
        } else if (typeof userId !== 'string') {
            errors.push(new PathValidationError(
                'ID utilisateur doit être une chaîne de caractères',
                VALIDATION_ERROR_CODES.INVALID_USER_ID,
                'userId'
            ));
        } else if (userId.trim().length === 0) {
            errors.push(new PathValidationError(
                'ID utilisateur ne peut pas être vide',
                VALIDATION_ERROR_CODES.INVALID_USER_ID,
                'userId'
            ));
        }

        return errors;
    }

    /**
     * Valide un profil utilisateur
     * 
     * @param profile - Profil à valider
     * @returns PathValidationError[] Liste des erreurs
     * @private
     */
    private validateUserProfile(profile: UserReverseProfile): PathValidationError[] {
        const errors: PathValidationError[] = [];

        if (!profile) {
            errors.push(new PathValidationError(
                'Profil utilisateur requis',
                VALIDATION_ERROR_CODES.INVALID_PROFILE,
                'profile'
            ));
            return errors;
        }

        // Validation du niveau actuel
        if (!profile.currentLevel) {
            errors.push(new PathValidationError(
                'Niveau actuel requis dans le profil',
                VALIDATION_ERROR_CODES.INVALID_CURRENT_LEVEL,
                'profile.currentLevel'
            ));
        } else if (!LearningPathTypeUtils.isValidCECRLLevel(profile.currentLevel)) {
            errors.push(new PathValidationError(
                `Niveau actuel invalide: ${profile.currentLevel}`,
                VALIDATION_ERROR_CODES.INVALID_CURRENT_LEVEL,
                'profile.currentLevel'
            ));
        }

        return errors;
    }

    /**
     * Valide les options de génération
     * 
     * @param options - Options à valider
     * @returns PathValidationError[] Liste des erreurs
     * @private
     */
    private validateGenerationOptions(options: PathGenerationOptions): PathValidationError[] {
        const errors: PathValidationError[] = [];

        // Validation du niveau cible
        if (!LearningPathTypeUtils.isValidCECRLLevel(options.targetLevel)) {
            errors.push(new PathValidationError(
                `Niveau cible invalide: ${options.targetLevel}`,
                VALIDATION_ERROR_CODES.INVALID_TARGET_LEVEL,
                'options.targetLevel'
            ));
        }

        // Validation du mode de génération
        if (options.mode && !LearningPathTypeUtils.isValidGenerationMode(options.mode)) {
            errors.push(new PathValidationError(
                `Mode de génération invalide: ${options.mode}`,
                VALIDATION_ERROR_CODES.INVALID_GENERATION_MODE,
                'options.mode'
            ));
        }

        // Validation de l'intensité
        if (options.intensity !== undefined) {
            if (typeof options.intensity !== 'number' ||
                options.intensity < 1 ||
                options.intensity > 5 ||
                !Number.isInteger(options.intensity)) {
                errors.push(new PathValidationError(
                    'L\'intensité doit être un entier entre 1 et 5',
                    VALIDATION_ERROR_CODES.INVALID_INTENSITY,
                    'options.intensity'
                ));
            }
        }

        // Validation de la durée cible
        if (options.targetDuration !== undefined) {
            if (typeof options.targetDuration !== 'number' ||
                options.targetDuration <= 0) {
                errors.push(new PathValidationError(
                    'La durée cible doit être un nombre positif',
                    VALIDATION_ERROR_CODES.INVALID_DURATION,
                    'options.targetDuration'
                ));
            }
        }

        return errors;
    }

    /**
     * Valide la cohérence entre le profil et les options
     * 
     * @param profile - Profil utilisateur
     * @param options - Options de génération
     * @returns object Résultat avec erreurs et avertissements
     * @private
     */
    private validateConsistency(
        profile: UserReverseProfile,
        options: PathGenerationOptions
    ): { errors: PathValidationError[]; warnings: string[] } {
        const errors: PathValidationError[] = [];
        const warnings: string[] = [];

        // Vérifier que le niveau cible est supérieur au niveau actuel
        const currentLevel = LearningPathTypeUtils.normalizeCECRLLevel(profile.currentLevel);
        const targetLevel = LearningPathTypeUtils.normalizeCECRLLevel(options.targetLevel);

        if (this.compareCECRLLevels(currentLevel, targetLevel) >= 0) {
            errors.push(new PathValidationError(
                `Le niveau cible (${targetLevel}) doit être supérieur au niveau actuel (${currentLevel})`,
                VALIDATION_ERROR_CODES.INCOMPATIBLE_LEVELS,
                'options.targetLevel'
            ));
        }

        // Avertissements pour des sauts de niveau importants
        const levelGap = this.calculateLevelGap(currentLevel, targetLevel);
        if (levelGap > 2) {
            warnings.push(`Grand saut de niveau détecté (${currentLevel} → ${targetLevel}). Considérez un parcours progressif.`);
        }

        // Vérification des zones de focus vs faiblesses connues
        if (options.focusAreas && profile.weaknessAreas) {
            const commonAreas = options.focusAreas.filter(area =>
                profile.weaknessAreas?.includes(area)
            );

            if (commonAreas.length === 0) {
                warnings.push('Aucune zone de focus ne correspond aux faiblesses identifiées du profil.');
            }
        }

        return { errors, warnings };
    }

    /**
     * Compare deux niveaux CECRL
     * 
     * @param level1 - Premier niveau
     * @param level2 - Deuxième niveau
     * @returns number -1 si level1 < level2, 0 si égaux, 1 si level1 > level2
     * @private
     */
    private compareCECRLLevels(level1: CECRLLevel, level2: CECRLLevel): number {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index1 = levels.indexOf(level1);
        const index2 = levels.indexOf(level2);

        return Math.sign(index1 - index2);
    }

    /**
     * Calcule l'écart entre deux niveaux CECRL
     * 
     * @param currentLevel - Niveau actuel
     * @param targetLevel - Niveau cible
     * @returns number Nombre de niveaux d'écart
     * @private
     */
    private calculateLevelGap(currentLevel: CECRLLevel, targetLevel: CECRLLevel): number {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(currentLevel);
        const targetIndex = levels.indexOf(targetLevel);

        return Math.abs(targetIndex - currentIndex);
    }
}