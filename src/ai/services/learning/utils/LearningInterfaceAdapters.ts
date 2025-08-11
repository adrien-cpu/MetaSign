/**
 * @file src/ai/services/learning/utils/LearningInterfaceAdapters.ts
 * @description Adaptateurs d'interfaces pour le module d'apprentissage
 * 
 * Fonctionnalités :
 * - 🔄 Conversion entre formats de données d'apprentissage
 * - 🎯 Compatible exactOptionalPropertyTypes: true
 * - 📊 Support multi-format pour intégration legacy
 * - 🌟 Adaptateurs intelligents avec validation
 * 
 * @module utils
 * @version 1.0.0 - Adaptateurs révolutionnaires
 * @since 2025
 * @author MetaSign Team - Learning Adapters
 * @lastModified 2025-07-05
 */

import { LearningContext, LearningPreferences, LearningStyle } from '@/ai/services/learning/types/learning-interfaces';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Types de l'ancien système (pour illustration)
 */
interface LegacyUser {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly preferences?: {
        readonly preferredContentTypes: readonly string[];
        readonly preferredPace: 'slow' | 'moderate' | 'fast';
        readonly preferredFeedbackFrequency: 'low' | 'medium' | 'high';
    };
    readonly skillLevels?: Readonly<Record<string, number>>;
    readonly knownConcepts?: readonly string[];
    readonly academicProfile?: {
        readonly educationLevel?: string;
        readonly studyField?: string;
        readonly languages?: readonly string[];
    };
}

/**
 * Type de profil utilisateur interne
 * Utilisé par le système actuel, contrairement à UserProfile qui est l'interface externe
 */
interface InternalUserProfile {
    readonly userId: string;
    readonly skillLevels?: Readonly<Record<string, number>>;
    readonly knownConcepts?: readonly string[];
    readonly weakConcepts?: readonly string[];
    readonly interests?: readonly string[];
    readonly metadata?: Readonly<Record<string, unknown>>;
    readonly preferences?: {
        readonly learningStyle?: string;
        readonly pacePreference?: string;
        readonly adaptivityLevel?: number;
        readonly assistanceLevel?: number;
        readonly controlPreference?: string;
        readonly prefersFeedback?: boolean;
        readonly preferredContentTypes?: readonly string[];
    };
}

/**
 * Interface pour contexte d'apprentissage externe
 */
interface ExternalLearningContext {
    readonly userId?: string;
    readonly lastActivity?: string | Date;
    readonly metrics?: {
        readonly totalTime?: number;
        readonly sessions?: number;
        readonly completion?: number;
        readonly score?: number;
        readonly interaction?: number;
        readonly errorRate?: number;
    };
    readonly tags?: readonly string[];
    readonly engagement?: string | number;
    readonly frustration?: string | number;
    readonly situationalFactors?: Readonly<Record<string, unknown>>;
    readonly [key: string]: unknown;
}

/**
 * Singleton pour la journalisation
 */
const logger = LoggerFactory.getLogger('LearningInterfaceAdapters');

/**
 * Convertit un format de contexte d'apprentissage externe en format interne
 * 
 * @method convertExternalContext
 * @param {ExternalLearningContext} externalContext - Contexte d'apprentissage externe
 * @returns {LearningContext} Contexte d'apprentissage interne
 * @public
 */
export function convertExternalContext(externalContext: ExternalLearningContext): LearningContext {
    // Validation de base
    if (!externalContext || typeof externalContext !== 'object') {
        logger.warn('Invalid external context received');
        return { userId: 'unknown' };
    }

    // Copier les propriétés de base
    const internalContext: LearningContext = {
        userId: externalContext.userId || 'unknown',
        timestamp: new Date(),
    };

    // Mapper les propriétés spécifiques si elles existent
    if (externalContext.lastActivity) {
        const lastActivity = typeof externalContext.lastActivity === 'string'
            ? new Date(externalContext.lastActivity)
            : externalContext.lastActivity;
        internalContext.lastActivityTime = lastActivity;
    }

    if (externalContext.metrics) {
        // Mapper les métriques
        const metrics = externalContext.metrics;

        if (typeof metrics.totalTime === 'number') {
            internalContext.totalTimeSpent = metrics.totalTime;
        }

        if (typeof metrics.sessions === 'number') {
            internalContext.sessionCount = metrics.sessions;
        }

        if (typeof metrics.completion === 'number') {
            internalContext.completionRate = metrics.completion;
        }

        if (typeof metrics.score === 'number') {
            internalContext.averageScore = metrics.score;
        }

        if (typeof metrics.interaction === 'number') {
            internalContext.interactionRate = metrics.interaction;
        }

        if (typeof metrics.errorRate === 'number') {
            internalContext.errorRate = metrics.errorRate;
        }
    }

    // Copier les tags de contenu s'ils existent
    if (Array.isArray(externalContext.tags)) {
        internalContext.contentTags = [...externalContext.tags];
    }

    // Ajouter des informations sur l'engagement et la frustration si disponibles
    if (externalContext.engagement !== undefined) {
        const engagement = typeof externalContext.engagement === 'string'
            ? parseFloat(externalContext.engagement)
            : Number(externalContext.engagement);

        if (!isNaN(engagement)) {
            internalContext.currentEngagement = engagement;
        }
    }

    if (externalContext.frustration !== undefined) {
        const frustration = typeof externalContext.frustration === 'string'
            ? parseFloat(externalContext.frustration)
            : Number(externalContext.frustration);

        if (!isNaN(frustration)) {
            internalContext.currentFrustration = frustration;
        }
    }

    // Ajouter des facteurs situationnels si fournis
    if (externalContext.situationalFactors && typeof externalContext.situationalFactors === 'object') {
        internalContext.situationalFactors = { ...externalContext.situationalFactors };
    }

    return internalContext;
}

/**
 * Convertit un ancien format de profil utilisateur vers le nouveau format
 * 
 * @method convertLegacyUserToProfile
 * @param {LegacyUser} legacyUser - Profil utilisateur au format ancien
 * @returns {InternalUserProfile} Profil utilisateur au format nouveau
 * @public
 */
export function convertLegacyUserToProfile(legacyUser: LegacyUser): InternalUserProfile {
    // Validation de base
    if (!legacyUser || !legacyUser.id) {
        logger.warn('Invalid legacy user data received');
        return { userId: 'unknown' };
    }

    // Créer le profil avec toutes les propriétés d'un coup pour respecter readonly
    const convertedProfile: InternalUserProfile = {
        userId: legacyUser.id,

        // Convertir les niveaux de compétence si présents
        skillLevels: legacyUser.skillLevels ? { ...legacyUser.skillLevels } : undefined,

        // Ajouter les concepts connus si présents
        knownConcepts: legacyUser.knownConcepts ? [...legacyUser.knownConcepts] : undefined,

        // Convertir les préférences si présentes
        preferences: legacyUser.preferences ? {
            // Déterminer le style d'apprentissage à partir des types de contenu préférés
            learningStyle: determinePreferredLearningStyle(legacyUser.preferences.preferredContentTypes),

            // Mapper directement le rythme préféré
            pacePreference: legacyUser.preferences.preferredPace,

            // Convertir la fréquence de feedback en niveau d'assistance (approximativement)
            assistanceLevel: convertFeedbackFrequencyToAssistanceLevel(legacyUser.preferences.preferredFeedbackFrequency),

            // Définir des valeurs par défaut pour les autres propriétés
            adaptivityLevel: 0.7,  // Valeur par défaut modérée
            controlPreference: 'medium',  // Valeur par défaut modérée
            prefersFeedback: true,  // Valeur par défaut positive

            // Copier les types de contenu préférés
            preferredContentTypes: [...legacyUser.preferences.preferredContentTypes]
        } : undefined
    };

    // Logger la conversion
    logger.debug(`Converted legacy user ${legacyUser.id} to internal profile`);

    return convertedProfile;
}

/**
 * Détermine le style d'apprentissage préféré à partir des types de contenu préférés
 * 
 * @method determinePreferredLearningStyle
 * @param {readonly string[]} contentTypes - Types de contenu préférés
 * @returns {string} Style d'apprentissage déterminé
 * @private
 */
function determinePreferredLearningStyle(contentTypes: readonly string[]): string {
    if (!contentTypes || contentTypes.length === 0) {
        return 'multimodal';
    }

    const typePreferences = {
        visual: 0,
        auditory: 0,
        reading: 0,
        kinesthetic: 0
    };

    // Incrémenter les compteurs en fonction des types de contenu
    contentTypes.forEach(type => {
        const lowerType = type.toLowerCase();

        if (lowerType.includes('video') || lowerType.includes('image')) {
            typePreferences.visual++;
        } else if (lowerType.includes('audio')) {
            typePreferences.auditory++;
        } else if (lowerType.includes('text') || lowerType.includes('article')) {
            typePreferences.reading++;
        } else if (lowerType.includes('interactive') || lowerType.includes('exercise')) {
            typePreferences.kinesthetic++;
        }
    });

    // Trouver le style avec le score le plus élevé
    let maxStyle = 'multimodal';
    let maxScore = 0;

    Object.entries(typePreferences).forEach(([style, score]) => {
        if (score > maxScore) {
            maxScore = score;
            maxStyle = style;
        }
    });

    // Si aucun style ne se démarque ou si tous les scores sont égaux, retourner multimodal
    return maxScore > 0 ? maxStyle : 'multimodal';
}

/**
 * Convertit la fréquence de feedback en niveau d'assistance
 * 
 * @method convertFeedbackFrequencyToAssistanceLevel
 * @param {('low' | 'medium' | 'high')} frequency - Fréquence de feedback préférée
 * @returns {number} Niveau d'assistance (0-1)
 * @private
 */
function convertFeedbackFrequencyToAssistanceLevel(frequency: 'low' | 'medium' | 'high'): number {
    switch (frequency) {
        case 'low':
            return 0.3;
        case 'medium':
            return 0.6;
        case 'high':
            return 0.9;
        default:
            return 0.5;
    }
}

/**
 * Convertit une chaîne de style d'apprentissage en enum LearningStyle
 * 
 * @method stringToLearningStyle
 * @param {string} styleString - Chaîne représentant le style d'apprentissage
 * @returns {LearningStyle} Valeur de l'enum LearningStyle
 * @public
 */
export function stringToLearningStyle(styleString: string): LearningStyle {
    const normalizedStyle = styleString.toLowerCase().trim();

    // Mapping complet des styles d'apprentissage
    const mappings: Record<string, LearningStyle> = {
        'visual': LearningStyle.VISUAL,
        'auditory': LearningStyle.AUDITORY,
        'reading': LearningStyle.READING_WRITING,
        'reading_writing': LearningStyle.READING_WRITING,
        'kinesthetic': LearningStyle.KINESTHETIC,
        'multimodal': LearningStyle.VISUAL // Fallback par défaut
    };

    // Vérifier si le style existe dans l'enum
    const result = mappings[normalizedStyle];

    if (result !== undefined) {
        return result;
    }

    // Fallback par défaut si aucune correspondance
    logger.warn(`Unknown learning style: ${styleString}, defaulting to VISUAL`);
    return LearningStyle.VISUAL;
}

/**
 * Convertit un style d'apprentissage de l'enum vers une chaîne
 * 
 * @method learningStyleToString
 * @param {LearningStyle} style - Valeur de l'enum LearningStyle
 * @returns {string} Chaîne représentant le style
 * @public
 */
export function learningStyleToString(style: LearningStyle): string {
    const mappings: Record<LearningStyle, string> = {
        [LearningStyle.VISUAL]: 'visual',
        [LearningStyle.AUDITORY]: 'auditory',
        [LearningStyle.READING_WRITING]: 'reading',
        [LearningStyle.KINESTHETIC]: 'kinesthetic'
    };

    const result = mappings[style];

    if (result !== undefined) {
        return result;
    }

    // Fallback par défaut
    logger.warn(`Unknown learning style enum value: ${style}, defaulting to 'visual'`);
    return 'visual';
}

/**
 * Convertit un profil interne en préférences d'apprentissage
 * 
 * @method extractLearningPreferences
 * @param {InternalUserProfile} profile - Profil utilisateur interne
 * @returns {LearningPreferences} Préférences d'apprentissage formatées
 * @public
 */
export function extractLearningPreferences(profile: InternalUserProfile): LearningPreferences {
    // Valeurs par défaut avec types stricts
    const defaultPreferences: LearningPreferences = {
        learningStyle: 'visual',
        pacePreference: 'moderate',
        adaptivityLevel: 0.5,
        assistanceLevel: 0.5,
        controlPreference: 'medium',
        prefersFeedback: true
    };

    // Si aucune préférence n'est définie, retourner les valeurs par défaut
    if (!profile.preferences) {
        return defaultPreferences;
    }

    // Validation et extraction des préférences avec types sécurisés
    const prefs = profile.preferences;

    // Validation du style d'apprentissage
    const learningStyle = validateLearningStyleString(prefs.learningStyle)
        ? prefs.learningStyle as LearningPreferences['learningStyle']
        : defaultPreferences.learningStyle;

    // Validation de la préférence de rythme
    const pacePreference = validatePacePreference(prefs.pacePreference)
        ? prefs.pacePreference as LearningPreferences['pacePreference']
        : defaultPreferences.pacePreference;

    // Validation de la préférence de contrôle
    const controlPreference = validateControlPreference(prefs.controlPreference)
        ? prefs.controlPreference as LearningPreferences['controlPreference']
        : defaultPreferences.controlPreference;

    // Validation des niveaux numériques
    const adaptivityLevel = validateNumericLevel(prefs.adaptivityLevel)
        ? prefs.adaptivityLevel
        : defaultPreferences.adaptivityLevel;

    const assistanceLevel = validateNumericLevel(prefs.assistanceLevel)
        ? prefs.assistanceLevel
        : defaultPreferences.assistanceLevel;

    // Extraire les préférences avec validation
    return {
        learningStyle,
        pacePreference,
        adaptivityLevel,
        assistanceLevel,
        controlPreference,
        prefersFeedback: typeof prefs.prefersFeedback === 'boolean'
            ? prefs.prefersFeedback
            : defaultPreferences.prefersFeedback,

        // Propriétés optionnelles
        preferredContentTypes: Array.isArray(prefs.preferredContentTypes)
            ? [...prefs.preferredContentTypes]
            : undefined,
        requiresStructure: true  // Valeur par défaut
    };
}

/**
 * Valide si une chaîne représente un style d'apprentissage valide
 * 
 * @method validateLearningStyleString
 * @param {unknown} value - Valeur à valider
 * @returns {boolean} True si valide
 * @private
 */
function validateLearningStyleString(value: unknown): value is string {
    if (typeof value !== 'string') return false;

    const validStyles = ['visual', 'auditory', 'reading', 'kinesthetic', 'multimodal'];
    return validStyles.includes(value.toLowerCase());
}

/**
 * Valide si une chaîne représente une préférence de rythme valide
 * 
 * @method validatePacePreference
 * @param {unknown} value - Valeur à valider
 * @returns {boolean} True si valide
 * @private
 */
function validatePacePreference(value: unknown): value is string {
    if (typeof value !== 'string') return false;

    const validPaces = ['slow', 'moderate', 'fast'];
    return validPaces.includes(value.toLowerCase());
}

/**
 * Valide si une chaîne représente une préférence de contrôle valide
 * 
 * @method validateControlPreference
 * @param {unknown} value - Valeur à valider
 * @returns {boolean} True si valide
 * @private
 */
function validateControlPreference(value: unknown): value is string {
    if (typeof value !== 'string') return false;

    const validControls = ['low', 'medium', 'high'];
    return validControls.includes(value.toLowerCase());
}

/**
 * Valide si une valeur représente un niveau numérique valide (0-1)
 * 
 * @method validateNumericLevel
 * @param {unknown} value - Valeur à valider
 * @returns {boolean} True si valide
 * @private
 */
function validateNumericLevel(value: unknown): value is number {
    if (typeof value !== 'number') return false;

    return value >= 0 && value <= 1 && !isNaN(value) && isFinite(value);
}

/**
 * Utilitaires pour la conversion de types
 */
export const LearningAdapterUtils = {
    /**
     * Convertit de manière sécurisée un objet externe en contexte d'apprentissage
     */
    safeConvertContext(context: unknown): LearningContext {
        if (!context || typeof context !== 'object') {
            return { userId: 'unknown' };
        }

        return convertExternalContext(context as ExternalLearningContext);
    },

    /**
     * Vérifie si un objet ressemble à un ancien profil utilisateur
     */
    isLegacyUserFormat(obj: unknown): obj is LegacyUser {
        return typeof obj === 'object' &&
            obj !== null &&
            'id' in obj &&
            typeof (obj as Record<string, unknown>).id === 'string';
    },

    /**
     * Valide les préférences d'apprentissage
     */
    validatePreferences(prefs: unknown): prefs is LearningPreferences {
        if (!prefs || typeof prefs !== 'object') return false;

        const p = prefs as Record<string, unknown>;

        return typeof p.learningStyle === 'string' &&
            typeof p.pacePreference === 'string' &&
            typeof p.adaptivityLevel === 'number' &&
            typeof p.assistanceLevel === 'number' &&
            typeof p.controlPreference === 'string' &&
            typeof p.prefersFeedback === 'boolean';
    }
} as const;