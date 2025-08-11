/**
 * Utilitaires de formatage pour les parcours d'apprentissage personnalisés - Version refactorisée
 * 
 * @file src/ai/services/learning/personalization/utils/PathFormatUtils.ts
 * @module ai/services/learning/personalization/utils
 * @description Utilitaires pour le formatage des noms, descriptions et identifiants - Version modulaire
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type { CECRLLevel, StepType } from '../types/LearningPathTypes';
import {
    SKILL_NAME_MAP,
    INVERSE_SKILL_NAME_MAP,
    SKILL_DESCRIPTION_MAP,
    EXERCISE_TYPE_MAP,
    CECRL_LEVEL_DESCRIPTIONS,
    STEP_TYPE_MAP
} from './FormatConstants';
import { FormatHelpers } from './FormatHelpers';

/**
 * Utilitaires de formatage pour les parcours d'apprentissage
 * 
 * @example
 * ```typescript
 * const formattedSkill = PathFormatUtils.formatSkillName('basicVocabulary');
 * const formattedDuration = PathFormatUtils.formatDuration(90);
 * ```
 */
export class PathFormatUtils {
    /**
     * Formate le nom d'une compétence pour l'affichage
     * 
     * @param skillName Nom brut de la compétence
     * @returns Nom formaté pour l'affichage
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatSkillName('basicVocabulary');
     * console.log(formatted); // "Vocabulaire de base"
     * ```
     */
    public static formatSkillName(skillName: string): string {
        return SKILL_NAME_MAP[skillName] || FormatHelpers.formatGenericName(skillName);
    }

    /**
     * Normalise le nom d'une compétence (inverse du formatage)
     * 
     * @param displayName Nom affiché de la compétence
     * @returns Nom normalisé (identifiant)
     * 
     * @example
     * ```typescript
     * const normalized = PathFormatUtils.normalizeSkillName('Vocabulaire de base');
     * console.log(normalized); // "basicVocabulary"
     * ```
     */
    public static normalizeSkillName(displayName: string): string {
        return INVERSE_SKILL_NAME_MAP[displayName] || displayName.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * Formate une description de compétence
     * 
     * @param skillName Nom de la compétence
     * @returns Description formatée
     * 
     * @example
     * ```typescript
     * const description = PathFormatUtils.formatSkillDescription('basicVocabulary');
     * console.log(description); // "utiliser le vocabulaire de base en LSF"
     * ```
     */
    public static formatSkillDescription(skillName: string): string {
        return SKILL_DESCRIPTION_MAP[skillName] ||
            `améliorer vos compétences en ${PathFormatUtils.formatSkillName(skillName)}`;
    }

    /**
     * Formate un titre d'exercice
     * 
     * @param exerciseType Type d'exercice
     * @param skillName Compétence ciblée
     * @returns Titre formaté
     * 
     * @example
     * ```typescript
     * const title = PathFormatUtils.formatExerciseTitle('MultipleChoice', 'basicVocabulary');
     * console.log(title); // "Choix multiples - Vocabulaire de base"
     * ```
     */
    public static formatExerciseTitle(exerciseType: string, skillName: string): string {
        const formattedType = EXERCISE_TYPE_MAP[exerciseType] || FormatHelpers.formatGenericName(exerciseType);
        const formattedSkill = PathFormatUtils.formatSkillName(skillName);

        return `${formattedType} - ${formattedSkill}`;
    }

    /**
     * Formate un nom de niveau CECRL avec description
     * 
     * @param level Niveau CECRL
     * @returns Nom formaté avec description
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatCECRLLevel('A1');
     * console.log(formatted); // "A1 - Découverte - Niveau débutant"
     * ```
     */
    public static formatCECRLLevel(level: CECRLLevel): string {
        const description = CECRL_LEVEL_DESCRIPTIONS[level];
        return description ? `${level} - ${description}` : level;
    }

    /**
     * Formate un type d'étape pour l'affichage
     * 
     * @param stepType Type d'étape
     * @returns Type formaté
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatStepType('assessment');
     * console.log(formatted); // "Évaluation"
     * ```
     */
    public static formatStepType(stepType: StepType): string {
        return STEP_TYPE_MAP[stepType] || FormatHelpers.formatGenericName(stepType);
    }

    /**
     * Formate une durée en minutes en format lisible
     * 
     * @param minutes Durée en minutes
     * @returns Durée formatée
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatDuration(90);
     * console.log(formatted); // "1h 30min"
     * ```
     */
    public static formatDuration(minutes: number): string {
        return FormatHelpers.formatDuration(minutes);
    }

    /**
     * Formate un pourcentage de progression
     * 
     * @param progress Progression (0-1)
     * @param precision Nombre de décimales (par défaut: 1)
     * @returns Pourcentage formaté
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatProgress(0.756);
     * console.log(formatted); // "75,6%"
     * ```
     */
    public static formatProgress(progress: number, precision?: number): string {
        return FormatHelpers.formatProgress(progress, precision);
    }

    /**
     * Formate une difficulté (0-1) en texte descriptif
     * 
     * @param difficulty Niveau de difficulté (0-1)
     * @returns Description textuelle de la difficulté
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatDifficulty(0.7);
     * console.log(formatted); // "Difficile"
     * ```
     */
    public static formatDifficulty(difficulty: number): string {
        return FormatHelpers.formatDifficulty(difficulty);
    }

    /**
     * Formate une liste de compétences en texte lisible
     * 
     * @param skills Liste des compétences
     * @param maxDisplay Nombre maximum de compétences à afficher (par défaut: 3)
     * @returns Texte formaté
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatSkillsList(['basicVocabulary', 'recognition']);
     * console.log(formatted); // "Vocabulaire de base, Reconnaissance des signes"
     * ```
     */
    public static formatSkillsList(skills: readonly string[], maxDisplay?: number): string {
        return FormatHelpers.formatSkillsList(skills, maxDisplay);
    }

    /**
     * Génère un titre de parcours personnalisé
     * 
     * @param currentLevel Niveau actuel
     * @param targetLevel Niveau cible
     * @param focusAreas Domaines de focus (optionnel)
     * @returns Titre personnalisé
     * 
     * @example
     * ```typescript
     * const title = PathFormatUtils.generatePathTitle('A1', 'A2', ['basicVocabulary']);
     * console.log(title); // "Parcours A1 → A2 : Vocabulaire de base"
     * ```
     */
    public static generatePathTitle(
        currentLevel: CECRLLevel,
        targetLevel: CECRLLevel,
        focusAreas?: readonly string[]
    ): string {
        return FormatHelpers.generatePathTitle(currentLevel, targetLevel, focusAreas);
    }

    /**
     * Génère une description de parcours personnalisée
     * 
     * @param currentLevel Niveau actuel
     * @param targetLevel Niveau cible
     * @param focusAreas Domaines de focus (optionnel)
     * @returns Description personnalisée
     * 
     * @example
     * ```typescript
     * const description = PathFormatUtils.generatePathDescription('A1', 'A2');
     * console.log(description); // "Parcours d'apprentissage personnalisé..."
     * ```
     */
    public static generatePathDescription(
        currentLevel: CECRLLevel,
        targetLevel: CECRLLevel,
        focusAreas?: readonly string[]
    ): string {
        return FormatHelpers.generatePathDescription(currentLevel, targetLevel, focusAreas);
    }

    /**
     * Formate un nom générique en nom lisible
     * 
     * @param identifier Identifiant brut
     * @returns Nom formaté
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatGenericName('userProfile');
     * console.log(formatted); // "User Profile"
     * ```
     */
    public static formatGenericName(identifier: string): string {
        return FormatHelpers.formatGenericName(identifier);
    }

    /**
     * Formate une date en texte relatif (il y a X jours, etc.)
     * 
     * @param date Date à formatter
     * @returns Texte relatif
     * 
     * @example
     * ```typescript
     * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
     * const formatted = PathFormatUtils.formatRelativeDate(yesterday);
     * console.log(formatted); // "il y a 1 jour"
     * ```
     */
    public static formatRelativeDate(date: Date): string {
        return FormatHelpers.formatRelativeDate(date);
    }

    /**
     * Valide et normalise un identifiant
     * 
     * @param identifier Identifiant à valider
     * @returns Identifiant normalisé
     * @throws {Error} Si l'identifiant n'est pas valide
     * 
     * @example
     * ```typescript
     * const normalized = PathFormatUtils.validateAndNormalizeId('Mon Identifiant!');
     * console.log(normalized); // "mon-identifiant"
     * ```
     */
    public static validateAndNormalizeId(identifier: string): string {
        return FormatHelpers.validateAndNormalizeId(identifier);
    }

    /**
     * Tronque un texte en préservant les mots complets
     * 
     * @param text Texte à tronquer
     * @param maxLength Longueur maximale
     * @param suffix Suffixe à ajouter (par défaut: "...")
     * @returns Texte tronqué
     * 
     * @example
     * ```typescript
     * const truncated = PathFormatUtils.truncateText('Un texte très long', 10);
     * console.log(truncated); // "Un texte..."
     * ```
     */
    public static truncateText(text: string, maxLength: number, suffix?: string): string {
        return FormatHelpers.truncateText(text, maxLength, suffix);
    }

    /**
     * Formate un nombre avec séparateurs de milliers
     * 
     * @param number Nombre à formater
     * @param locale Locale pour le formatage (par défaut: 'fr-FR')
     * @returns Nombre formaté
     * 
     * @example
     * ```typescript
     * const formatted = PathFormatUtils.formatNumber(1234567);
     * console.log(formatted); // "1 234 567"
     * ```
     */
    public static formatNumber(number: number, locale?: string): string {
        return FormatHelpers.formatNumber(number, locale);
    }

    /**
     * Capitalise la première lettre d'une chaîne
     * 
     * @param text Texte à capitaliser
     * @returns Texte avec première lettre en majuscule
     * 
     * @example
     * ```typescript
     * const capitalized = PathFormatUtils.capitalize('bonjour');
     * console.log(capitalized); // "Bonjour"
     * ```
     */
    public static capitalize(text: string): string {
        return FormatHelpers.capitalize(text);
    }

    /**
     * Convertit un texte en format titre (première lettre de chaque mot en majuscule)
     * 
     * @param text Texte à convertir
     * @returns Texte en format titre
     * 
     * @example
     * ```typescript
     * const title = PathFormatUtils.toTitleCase('bonjour tout le monde');
     * console.log(title); // "Bonjour Tout Le Monde"
     * ```
     */
    public static toTitleCase(text: string): string {
        return FormatHelpers.toTitleCase(text);
    }
}

/**
 * Instance singleton des utilitaires de formatage
 * 
 * @example
 * ```typescript
 * import { formatUtils } from './PathFormatUtils';
 * const formatted = formatUtils.formatSkillName('basicVocabulary');
 * ```
 */
export const formatUtils = PathFormatUtils;