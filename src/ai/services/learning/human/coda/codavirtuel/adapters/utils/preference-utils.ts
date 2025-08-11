/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/utils/preference-utils.ts
 * @description Utilitaires pour le traitement et la conversion des préférences d'apprentissage
 */

// Types de base de l'application
// Note: Ces types devraient être importés correctement dans une implementation réelle
import {
    LearningPreferences,
    SourceLearningPreferences,
    LearningStyle
} from '../types';

/**
 * Convertit un objet en SourceLearningPreferences sécurisé
 * 
 * @param preferences Objet de préférences à convertir
 * @returns Préférences d'apprentissage source normalisées
 */
export function convertToSourceLearningPreferences(preferences: unknown): SourceLearningPreferences {
    // Créer un objet de base vide qui satisfait l'interface
    const result: SourceLearningPreferences = {};

    // Si ce n'est pas un objet, retourner un objet vide
    if (!preferences || typeof preferences !== 'object') {
        return result;
    }

    // Convertir les propriétés de l'objet source en propriétés de SourceLearningPreferences
    const prefsObj = preferences as Record<string, unknown>;

    // Copier les propriétés pertinentes
    if ('learningStyle' in prefsObj) result.learningStyle = prefsObj.learningStyle as string | LearningStyle;
    if ('preferredLearningStyle' in prefsObj) result.preferredLearningStyle = prefsObj.preferredLearningStyle as string | LearningStyle;
    if ('pacePreference' in prefsObj) result.pacePreference = prefsObj.pacePreference as string | number;
    if ('preferredPace' in prefsObj) result.preferredPace = prefsObj.preferredPace as string | number;
    if ('adaptivityLevel' in prefsObj) result.adaptivityLevel = prefsObj.adaptivityLevel as number;
    if ('assistanceLevel' in prefsObj) result.assistanceLevel = prefsObj.assistanceLevel as number;
    if ('controlPreference' in prefsObj) result.controlPreference = prefsObj.controlPreference as string;
    if ('prefersFeedback' in prefsObj) result.prefersFeedback = Boolean(prefsObj.prefersFeedback);
    if ('requiresStructure' in prefsObj) result.requiresStructure = Boolean(prefsObj.requiresStructure);

    if ('preferredContentTypes' in prefsObj && Array.isArray(prefsObj.preferredContentTypes)) {
        result.preferredContentTypes = prefsObj.preferredContentTypes as string[];
    }

    if ('preferredTimeOfDay' in prefsObj && Array.isArray(prefsObj.preferredTimeOfDay)) {
        result.preferredTimeOfDay = prefsObj.preferredTimeOfDay as string[];
    }

    return result;
}

/**
 * Mappe un style d'apprentissage à un format compatible
 * 
 * @param style Style d'apprentissage à mapper
 * @returns Style d'apprentissage normalisé
 */
export function mapLearningStyle(style: string | LearningStyle | unknown): 'visual' | 'interactive' | 'theoretical' {
    if (!style) return 'interactive';

    const styleStr = String(style).toLowerCase();

    switch (styleStr) {
        case 'visual':
            return 'visual';
        case 'auditory':
        case 'kinesthetic':
        case 'reading':
        case 'reading_writing':
        case 'interactive':
            return 'interactive';
        case 'theoretical':
            return 'theoretical';
        default:
            return 'interactive';
    }
}

/**
 * Mappe une préférence de rythme à un format compatible
 * 
 * @param pace Préférence de rythme à mapper
 * @returns Préférence de rythme normalisée
 */
export function mapPacePreference(pace: string | number | unknown): 'slow' | 'moderate' | 'fast' {
    if (!pace) return 'moderate';

    // Si c'est déjà une chaîne de caractères
    if (typeof pace === 'string') {
        const paceStr = pace.toLowerCase();
        if (paceStr === 'slow' || paceStr === 'moderate' || paceStr === 'fast') {
            return paceStr as 'slow' | 'moderate' | 'fast';
        }
    }

    // Si c'est un nombre, convertir en catégorie
    if (typeof pace === 'number') {
        if (pace < 0.33) return 'slow';
        if (pace < 0.66) return 'moderate';
        return 'fast';
    }

    return 'moderate';
}

/**
 * Mappe une préférence de contrôle à un format compatible
 * 
 * @param control Préférence de contrôle à mapper
 * @returns Préférence de contrôle normalisée
 */
export function mapControlPreference(control: string | unknown): 'low' | 'medium' | 'high' {
    if (!control) return 'medium';

    const controlStr = String(control).toLowerCase();

    switch (controlStr) {
        case 'low':
            return 'low';
        case 'high':
            return 'high';
        default:
            return 'medium';
    }
}

/**
 * Convertit les préférences d'apprentissage du format source au format cible
 * pour satisfaire les contraintes de typage strict
 * 
 * @param sourcePrefs Préférences d'apprentissage source
 * @returns Préférences d'apprentissage normalisées
 */
export function convertLearningPreferences(sourcePrefs: SourceLearningPreferences): LearningPreferences {
    // Créer un nouvel objet conforme à LearningPreferences
    const targetPrefs: LearningPreferences = {
        learningStyle: mapLearningStyle(
            sourcePrefs.learningStyle || sourcePrefs.preferredLearningStyle
        ),
        pacePreference: mapPacePreference(
            sourcePrefs.pacePreference || sourcePrefs.preferredPace
        ),
        adaptivityLevel: typeof sourcePrefs.adaptivityLevel === 'number' ? sourcePrefs.adaptivityLevel : 0.5,
        assistanceLevel: typeof sourcePrefs.assistanceLevel === 'number' ? sourcePrefs.assistanceLevel : 0.5,
        controlPreference: mapControlPreference(
            sourcePrefs.controlPreference
        ),
        prefersFeedback: Boolean(sourcePrefs.prefersFeedback)
    };

    // Ajouter les propriétés optionnelles seulement si elles sont présentes dans la source
    if (sourcePrefs.requiresStructure !== undefined) {
        targetPrefs.requiresStructure = Boolean(sourcePrefs.requiresStructure);
    }

    if (Array.isArray(sourcePrefs.preferredContentTypes)) {
        targetPrefs.preferredContentTypes = sourcePrefs.preferredContentTypes;
    }

    if (Array.isArray(sourcePrefs.preferredTimeOfDay)) {
        targetPrefs.preferredTimeOfDay = sourcePrefs.preferredTimeOfDay;
    }

    return targetPrefs;
}

/**
 * Convertit les préférences d'apprentissage en Record<string, unknown>
 * pour satisfaire les contraintes de typage strict
 * 
 * @param sourcePrefs Préférences d'apprentissage source
 * @returns Préférences d'apprentissage au format Record
 */
export function convertLearningPreferencesToRecord(sourcePrefs: SourceLearningPreferences): Record<string, unknown> {
    // D'abord, créer les préférences typées
    const typedPrefs = convertLearningPreferences(sourcePrefs);

    // Ensuite les convertir en Record<string, unknown>
    const recordPrefs: Record<string, unknown> = {};

    // Copier chaque propriété manuellement
    recordPrefs.learningStyle = typedPrefs.learningStyle;
    recordPrefs.pacePreference = typedPrefs.pacePreference;
    recordPrefs.adaptivityLevel = typedPrefs.adaptivityLevel;
    recordPrefs.assistanceLevel = typedPrefs.assistanceLevel;
    recordPrefs.controlPreference = typedPrefs.controlPreference;
    recordPrefs.prefersFeedback = typedPrefs.prefersFeedback;

    // Copier les propriétés optionnelles si elles existent
    if (typedPrefs.requiresStructure !== undefined) {
        recordPrefs.requiresStructure = typedPrefs.requiresStructure;
    }
    if (typedPrefs.preferredContentTypes) {
        recordPrefs.preferredContentTypes = typedPrefs.preferredContentTypes;
    }
    if (typedPrefs.preferredTimeOfDay) {
        recordPrefs.preferredTimeOfDay = typedPrefs.preferredTimeOfDay;
    }

    return recordPrefs;
}