/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/LSFTypesAugmentation.ts
 * @description Augmentation des types LSF pour la compatibilité avec exactOptionalPropertyTypes
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import { LSFSpaceParameter } from './LSFContentTypes';

/**
 * Type augmenté pour LSFSpaceParameter avec signature d'index
 * Résout les problèmes de compatibilité avec Record<string, unknown>
 */
export interface LSFSpaceParameterWithIndex extends LSFSpaceParameter {
    /** Signature d'index pour la compatibilité avec Record<string, unknown> */
    [key: string]: unknown;
}

/**
 * Type guard pour vérifier si un objet est un LSFSpaceParameter valide
 * @param obj Objet à vérifier
 * @returns true si l'objet est un LSFSpaceParameter valide
 */
export function isLSFSpaceParameter(obj: unknown): obj is LSFSpaceParameter {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const param = obj as Record<string, unknown>;

    // Vérifie que les propriétés numériques sont valides
    if (param.accuracy !== undefined &&
        (typeof param.accuracy !== 'number' || param.accuracy < 0 || param.accuracy > 1)) {
        return false;
    }

    if (param.scale !== undefined &&
        (typeof param.scale !== 'number' || param.scale <= 0)) {
        return false;
    }

    // Vérifie que les propriétés booléennes sont valides
    const booleanProps = [
        'zoneConfusion', 'referenceConsistency', 'randomPlacement',
        'locationOmission', 'ambiguousReference', 'referenceOmission',
        'pronounConfusion', 'spatialReorganization'
    ];

    for (const prop of booleanProps) {
        if (param[prop] !== undefined && typeof param[prop] !== 'boolean') {
            return false;
        }
    }

    return true;
}

/**
 * Convertit un LSFSpaceParameter en LSFSpaceParameterWithIndex
 * @param space Paramètre d'espace à convertir
 * @returns Paramètre d'espace avec signature d'index
 */
export function toLSFSpaceParameterWithIndex(space: LSFSpaceParameter): LSFSpaceParameterWithIndex {
    // Crée une copie avec toutes les propriétés explicites
    const result: LSFSpaceParameterWithIndex = {
        ...space
    };

    // Ajoute les propriétés optionnelles si elles ne sont pas définies
    if (result.accuracy === undefined) {
        result.accuracy = 1;
    }

    if (result.scale === undefined) {
        result.scale = 1;
    }

    // Assure que les propriétés booléennes sont définies
    const booleanDefaults = {
        zoneConfusion: false,
        referenceConsistency: true,
        randomPlacement: false,
        locationOmission: false,
        ambiguousReference: false,
        referenceOmission: false,
        pronounConfusion: false,
        spatialReorganization: false
    };

    for (const [key, defaultValue] of Object.entries(booleanDefaults)) {
        if (result[key] === undefined) {
            result[key] = defaultValue;
        }
    }

    return result;
}

/**
 * Utilitaires pour la conversion de types LSF
 */
export class LSFTypeUtils {
    /**
     * Nettoie un objet en supprimant les propriétés undefined
     * Compatible avec exactOptionalPropertyTypes: true
     * @param obj Objet à nettoyer
     * @returns Objet nettoyé
     */
    public static cleanObject<T extends Record<string, unknown>>(obj: T): T {
        const cleaned = {} as T;

        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                (cleaned as Record<string, unknown>)[key] = value;
            }
        }

        return cleaned;
    }

    /**
     * Fusionne deux objets en respectant exactOptionalPropertyTypes
     * @param target Objet cible
     * @param source Objet source
     * @returns Objet fusionné
     */
    public static mergeObjects<T extends Record<string, unknown>>(
        target: T,
        source: Partial<T>
    ): T {
        const result = { ...target };

        for (const [key, value] of Object.entries(source)) {
            if (value !== undefined) {
                (result as Record<string, unknown>)[key] = value;
            }
        }

        return result;
    }

    /**
     * Valide qu'un objet respecte les contraintes de type
     * @param obj Objet à valider
     * @param validator Fonction de validation
     * @returns true si l'objet est valide
     */
    public static validateObject<T>(
        obj: unknown,
        validator: (obj: unknown) => obj is T
    ): obj is T {
        return validator(obj);
    }
}

/**
 * Type helper pour les transformations sûres
 */
export type SafeTransform<T, U> = T extends Record<string, unknown>
    ? U extends Record<string, unknown>
    ? U
    : never
    : never;

/**
 * Interface pour les objets transformables
 */
export interface Transformable {
    /** Signature d'index requise pour les transformations */
    [key: string]: unknown;
}

/**
 * Type guard pour les objets transformables
 * @param obj Objet à vérifier
 * @returns true si l'objet est transformable
 */
export function isTransformable(obj: unknown): obj is Transformable {
    return obj !== null && typeof obj === 'object';
}