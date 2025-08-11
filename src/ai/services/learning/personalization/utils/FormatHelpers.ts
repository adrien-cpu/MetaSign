/**
 * Méthodes utilitaires de formatage pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/utils/FormatHelpers.ts
 * @module ai/services/learning/personalization/utils
 * @description Méthodes utilitaires complémentaires pour le formatage
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type { CECRLLevel } from '../types/LearningPathTypes';
import {
    SKILL_NAME_MAP,
    DIFFICULTY_LEVELS,
    DATE_FORMATS,
    VALIDATION_PATTERNS,
    DISPLAY_LIMITS,
    FORMAT_SYMBOLS
} from './FormatConstants';

/**
 * Classe utilitaire pour les méthodes de formatage complémentaires
 */
export class FormatHelpers {
    /**
     * Formate un nom générique en nom lisible
     * 
     * @param identifier Identifiant brut
     * @returns Nom formaté
     * 
     * @example
     * ```typescript
     * const formatted = FormatHelpers.formatGenericName('userProfile');
     * console.log(formatted); // "User Profile"
     * ```
     */
    public static formatGenericName(identifier: string): string {
        return identifier
            // Ajouter des espaces avant les majuscules
            .replace(VALIDATION_PATTERNS.CAMEL_CASE_SPACES, ' $1')
            // Première lettre en majuscule
            .replace(/^./, str => str.toUpperCase())
            // Remplacer les underscores et tirets par des espaces
            .replace(/[_-]/g, ' ')
            // Nettoyer les espaces multiples
            .replace(VALIDATION_PATTERNS.MULTIPLE_SPACES, ' ')
            .trim();
    }

    /**
     * Formate une durée en minutes en format lisible
     * 
     * @param minutes Durée en minutes
     * @returns Durée formatée
     * 
     * @example
     * ```typescript
     * const formatted = FormatHelpers.formatDuration(90);
     * console.log(formatted); // "1h 30min"
     * ```
     */
    public static formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${remainingMinutes}min`;
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
     * const formatted = FormatHelpers.formatProgress(0.756);
     * console.log(formatted); // "75,6%"
     * ```
     */
    public static formatProgress(progress: number, precision: number = DISPLAY_LIMITS.PROGRESS_PRECISION): string {
        const percentage = (progress * 100).toFixed(precision);
        return `${percentage.replace('.', ',')}${FORMAT_SYMBOLS.PERCENT}`;
    }

    /**
     * Formate une difficulté (0-1) en texte descriptif
     * 
     * @param difficulty Niveau de difficulté (0-1)
     * @returns Description textuelle de la difficulté
     * 
     * @example
     * ```typescript
     * const formatted = FormatHelpers.formatDifficulty(0.7);
     * console.log(formatted); // "Difficile"
     * ```
     */
    public static formatDifficulty(difficulty: number): string {
        const level = DIFFICULTY_LEVELS.find(level =>
            difficulty >= level.min && difficulty <= level.max
        );
        return level?.label || 'Inconnu';
    }

    /**
     * Formate une liste de compétences en texte lisible
     * 
     * @param skills Liste des compétences
     * @param maxDisplay Nombre maximum de compétences à afficher
     * @returns Texte formaté
     * 
     * @example
     * ```typescript
     * const formatted = FormatHelpers.formatSkillsList(['basicVocabulary', 'recognition']);
     * console.log(formatted); // "Vocabulaire de base, Reconnaissance des signes"
     * ```
     */
    public static formatSkillsList(
        skills: readonly string[],
        maxDisplay: number = DISPLAY_LIMITS.MAX_SKILLS_DISPLAY
    ): string {
        if (skills.length === 0) {
            return 'Aucune compétence spécifiée';
        }

        const formattedSkills = skills.slice(0, maxDisplay).map(skill =>
            SKILL_NAME_MAP[skill] || FormatHelpers.formatGenericName(skill)
        );

        let result = formattedSkills.join(FORMAT_SYMBOLS.LIST_SEPARATOR);

        if (skills.length > maxDisplay) {
            const remaining = skills.length - maxDisplay;
            result += ` et ${remaining} autre${remaining > 1 ? 's' : ''}`;
        }

        return result;
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
     * const title = FormatHelpers.generatePathTitle('A1', 'A2', ['basicVocabulary']);
     * console.log(title); // "Parcours A1 → A2 : Vocabulaire de base"
     * ```
     */
    public static generatePathTitle(
        currentLevel: CECRLLevel,
        targetLevel: CECRLLevel,
        focusAreas?: readonly string[]
    ): string {
        const baseName = `Parcours ${currentLevel} ${FORMAT_SYMBOLS.ARROW} ${targetLevel}`;

        if (!focusAreas || focusAreas.length === 0) {
            return baseName;
        }

        const focusText = FormatHelpers.formatSkillsList(focusAreas, 2);
        const result = `${baseName}${FORMAT_SYMBOLS.SEPARATOR}${focusText}`;

        // Tronquer si trop long
        if (result.length > DISPLAY_LIMITS.MAX_TITLE_LENGTH) {
            return `${result.substring(0, DISPLAY_LIMITS.MAX_TITLE_LENGTH - 3)}${FORMAT_SYMBOLS.ELLIPSIS}`;
        }

        return result;
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
     * const description = FormatHelpers.generatePathDescription('A1', 'A2');
     * console.log(description); // "Parcours d'apprentissage personnalisé..."
     * ```
     */
    public static generatePathDescription(
        currentLevel: CECRLLevel,
        targetLevel: CECRLLevel,
        focusAreas?: readonly string[]
    ): string {
        let description = `Parcours d'apprentissage personnalisé pour progresser du niveau ${currentLevel} au niveau ${targetLevel} en LSF.`;

        if (focusAreas && focusAreas.length > 0) {
            const focusText = FormatHelpers.formatSkillsList(focusAreas);
            description += ` Focus particulier sur${FORMAT_SYMBOLS.SEPARATOR}${focusText}.`;
        }

        // Tronquer si trop long
        if (description.length > DISPLAY_LIMITS.MAX_DESCRIPTION_LENGTH) {
            return `${description.substring(0, DISPLAY_LIMITS.MAX_DESCRIPTION_LENGTH - 3)}${FORMAT_SYMBOLS.ELLIPSIS}`;
        }

        return description;
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
     * const formatted = FormatHelpers.formatRelativeDate(yesterday);
     * console.log(formatted); // "il y a 1 jour"
     * ```
     */
    public static formatRelativeDate(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // Gérer les dates futures
        if (diffMs < 0) {
            return FormatHelpers.formatFutureDate(Math.abs(diffMs));
        }

        // Traitement des dates passées
        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.MINUTE) {
            return 'à l\'instant';
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.HOUR) {
            const minutes = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.MINUTE);
            return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.DAY) {
            const hours = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.HOUR);
            return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        }

        if (diffMs < 2 * DATE_FORMATS.RELATIVE_UNITS.DAY) {
            return 'hier';
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.WEEK) {
            const days = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.DAY);
            return `il y a ${days} jours`;
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.MONTH) {
            const weeks = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.WEEK);
            return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.YEAR) {
            const months = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.MONTH);
            return `il y a ${months} mois`;
        }

        const years = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.YEAR);
        return `il y a ${years} an${years > 1 ? 's' : ''}`;
    }

    /**
     * Formate une date future en texte relatif
     * 
     * @param diffMs Différence en millisecondes (positive)
     * @returns Texte relatif pour le futur
     * @private
     */
    private static formatFutureDate(diffMs: number): string {
        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.HOUR) {
            const minutes = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.MINUTE);
            return `dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.DAY) {
            const hours = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.HOUR);
            return `dans ${hours} heure${hours > 1 ? 's' : ''}`;
        }

        if (diffMs < 2 * DATE_FORMATS.RELATIVE_UNITS.DAY) {
            return 'demain';
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.WEEK) {
            const days = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.DAY);
            return `dans ${days} jours`;
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.MONTH) {
            const weeks = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.WEEK);
            return `dans ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        }

        if (diffMs < DATE_FORMATS.RELATIVE_UNITS.YEAR) {
            const months = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.MONTH);
            return `dans ${months} mois`;
        }

        const years = Math.floor(diffMs / DATE_FORMATS.RELATIVE_UNITS.YEAR);
        return `dans ${years} an${years > 1 ? 's' : ''}`;
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
     * const normalized = FormatHelpers.validateAndNormalizeId('Mon Identifiant!');
     * console.log(normalized); // "mon-identifiant"
     * ```
     */
    public static validateAndNormalizeId(identifier: string): string {
        if (!identifier || typeof identifier !== 'string') {
            throw new Error('L\'identifiant doit être une chaîne non vide');
        }

        const normalized = identifier
            .toLowerCase()
            .replace(VALIDATION_PATTERNS.ID_CLEANUP, '') // Supprimer les caractères spéciaux
            .replace(VALIDATION_PATTERNS.SPACES_TO_DASHES, '-') // Remplacer les espaces par des tirets
            .replace(VALIDATION_PATTERNS.MULTIPLE_DASHES, '-') // Normaliser les tirets multiples
            .replace(VALIDATION_PATTERNS.LEADING_TRAILING_DASHES, ''); // Supprimer les tirets en début/fin

        if (!normalized) {
            throw new Error('L\'identifiant ne contient aucun caractère valide');
        }

        return normalized;
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
     * const truncated = FormatHelpers.truncateText('Un texte très long', 10);
     * console.log(truncated); // "Un texte..."
     * ```
     */
    public static truncateText(
        text: string,
        maxLength: number,
        suffix: string = FORMAT_SYMBOLS.ELLIPSIS
    ): string {
        if (text.length <= maxLength) {
            return text;
        }

        const truncateLength = maxLength - suffix.length;
        const truncated = text.substring(0, truncateLength);

        // Trouver le dernier espace pour ne pas couper un mot
        const lastSpace = truncated.lastIndexOf(' ');

        if (lastSpace > 0 && lastSpace > truncateLength * 0.8) {
            return truncated.substring(0, lastSpace) + suffix;
        }

        return truncated + suffix;
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
     * const formatted = FormatHelpers.formatNumber(1234567);
     * console.log(formatted); // "1 234 567"
     * ```
     */
    public static formatNumber(number: number, locale: string = 'fr-FR'): string {
        return new Intl.NumberFormat(locale).format(number);
    }

    /**
     * Capitalise la première lettre d'une chaîne
     * 
     * @param text Texte à capitaliser
     * @returns Texte avec première lettre en majuscule
     * 
     * @example
     * ```typescript
     * const capitalized = FormatHelpers.capitalize('bonjour');
     * console.log(capitalized); // "Bonjour"
     * ```
     */
    public static capitalize(text: string): string {
        if (!text) return text;
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    /**
     * Convertit un texte en format titre (première lettre de chaque mot en majuscule)
     * 
     * @param text Texte à convertir
     * @returns Texte en format titre
     * 
     * @example
     * ```typescript
     * const title = FormatHelpers.toTitleCase('bonjour tout le monde');
     * console.log(title); // "Bonjour Tout Le Monde"
     * ```
     */
    public static toTitleCase(text: string): string {
        return text.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
}