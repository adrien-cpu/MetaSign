/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/types/ExtendedLSFTypes.ts
 * @description Types étendus pour les paramètres LSF avec support complet des transformations d'espace syntaxique
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import { LSFSpaceParameter } from '../../../types/LSFContentTypes';
import { SpatialZoneType, DegradationLevel } from './SpaceTransformationTypes';

/**
 * Détails de confusion entre zones
 */
export interface ZoneConfusionDetails {
    /** Zone originale */
    original: SpatialZoneType;

    /** Zone confondue */
    confused: SpatialZoneType;

    /** Niveau de dégradation */
    level: DegradationLevel;

    /** Timestamp de la confusion */
    timestamp?: string;
}

/**
 * Erreur critique dans l'espace syntaxique
 */
export interface SpatialCriticalError {
    /** Type d'erreur critique */
    type: string;

    /** Timestamp de l'erreur */
    timestamp: string;

    /** Sévérité de l'erreur */
    severity: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'MINIMAL';

    /** Description de l'erreur */
    description?: string;

    /** Données additionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Paramètre d'espace LSF étendu avec support complet des transformations
 * 
 * Cette interface étend les paramètres d'espace LSF de base pour supporter
 * toutes les fonctionnalités avancées de transformation et simulation d'erreurs
 */
export interface ExtendedLSFSpaceParameter extends LSFSpaceParameter {
    /** Zones spatiales actives */
    zones?: SpatialZoneType[];

    /** Détails de confusion si applicable */
    confusionDetails?: ZoneConfusionDetails;

    /** Erreur critique si applicable */
    criticalError?: SpatialCriticalError;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;

    /** Signature d'index pour la compatibilité avec Record<string, unknown> */
    [key: string]: unknown;
}

/**
 * Factory pour créer des paramètres d'espace étendus
 */
export class ExtendedLSFSpaceParameterFactory {
    /**
     * Crée un paramètre d'espace par défaut
     * @returns Paramètre d'espace avec valeurs par défaut
     */
    public static createDefault(): ExtendedLSFSpaceParameter {
        return {
            accuracy: 1.0,
            scale: 1.0,
            zoneConfusion: false,
            referenceConsistency: true,
            randomPlacement: false,
            locationOmission: false,
            zones: [],
            metadata: {}
        };
    }

    /**
     * Crée un paramètre d'espace depuis un paramètre LSF de base
     * @param baseParameter Paramètre de base
     * @returns Paramètre étendu
     */
    public static fromBase(baseParameter: LSFSpaceParameter | Record<string, unknown>): ExtendedLSFSpaceParameter {
        const base = baseParameter as LSFSpaceParameter;
        return {
            ...this.createDefault(),
            ...base
        };
    }

    /**
     * Valide qu'un objet peut être utilisé comme paramètre d'espace étendu
     * @param obj Objet à valider
     * @returns True si l'objet est valide
     */
    public static isValidExtendedParameter(obj: unknown): obj is ExtendedLSFSpaceParameter {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        const param = obj as Record<string, unknown>;

        // Validation des propriétés numériques
        if (param.accuracy !== undefined &&
            (typeof param.accuracy !== 'number' || param.accuracy < 0 || param.accuracy > 1)) {
            return false;
        }

        if (param.scale !== undefined &&
            (typeof param.scale !== 'number' || param.scale <= 0)) {
            return false;
        }

        // Validation des propriétés booléennes
        const booleanProps = ['zoneConfusion', 'referenceConsistency', 'randomPlacement', 'locationOmission'];
        for (const prop of booleanProps) {
            if (param[prop] !== undefined && typeof param[prop] !== 'boolean') {
                return false;
            }
        }

        // Validation des zones
        if (param.zones !== undefined) {
            if (!Array.isArray(param.zones)) {
                return false;
            }

            const validZoneTypes = Object.values(SpatialZoneType);
            for (const zone of param.zones) {
                if (!validZoneTypes.includes(zone as SpatialZoneType)) {
                    return false;
                }
            }
        }

        return true;
    }
}

/**
 * Utilitaires pour la conversion de types
 */
export class LSFTypeConverter {
    /**
     * Convertit un paramètre LSF de base en paramètre étendu
     * @param baseParam Paramètre de base
     * @returns Paramètre étendu
     */
    public static toExtended(baseParam: LSFSpaceParameter | Record<string, unknown>): ExtendedLSFSpaceParameter {
        const param = baseParam as Record<string, unknown>;

        // Assure la compatibilité avec exactOptionalPropertyTypes: true
        const extended: ExtendedLSFSpaceParameter = {
            ...ExtendedLSFSpaceParameterFactory.createDefault()
        };

        // Copie sélective des propriétés valides
        if (typeof param.accuracy === 'number') {
            extended.accuracy = param.accuracy;
        }

        if (typeof param.scale === 'number') {
            extended.scale = param.scale;
        }

        if (typeof param.zoneConfusion === 'boolean') {
            extended.zoneConfusion = param.zoneConfusion;
        }

        if (typeof param.referenceConsistency === 'boolean') {
            extended.referenceConsistency = param.referenceConsistency;
        }

        if (typeof param.randomPlacement === 'boolean') {
            extended.randomPlacement = param.randomPlacement;
        }

        if (typeof param.locationOmission === 'boolean') {
            extended.locationOmission = param.locationOmission;
        }

        if (Array.isArray(param.zones)) {
            extended.zones = param.zones as SpatialZoneType[];
        }

        // Copie des métadonnées
        if (param.metadata && typeof param.metadata === 'object') {
            extended.metadata = param.metadata as Record<string, unknown>;
        }

        return extended;
    }

    /**
     * Vérifie si un objet a les propriétés d'un paramètre d'espace LSF
     * @param obj Objet à vérifier
     * @returns True si l'objet ressemble à un paramètre d'espace
     */
    public static isSpaceParameter(obj: unknown): boolean {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        const param = obj as Record<string, unknown>;

        // Vérifie la présence d'au moins une propriété d'espace
        const spaceProperties = [
            'accuracy', 'scale', 'zoneConfusion', 'referenceConsistency',
            'randomPlacement', 'locationOmission', 'zones'
        ];

        return spaceProperties.some(prop => prop in param);
    }
}

/**
 * Type guard pour les paramètres d'espace étendus
 * @param obj Objet à vérifier
 * @returns True si l'objet est un paramètre d'espace étendu
 */
export function isExtendedLSFSpaceParameter(obj: unknown): obj is ExtendedLSFSpaceParameter {
    return ExtendedLSFSpaceParameterFactory.isValidExtendedParameter(obj);
}

/**
 * Type alias pour la rétrocompatibilité
 */
export type LSFSpaceParameterExtended = ExtendedLSFSpaceParameter;