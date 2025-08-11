/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/SyntacticSpaceValidator.ts
 * @description Validateur pour les paramètres d'espace syntaxique en LSF
 * @author MetaSign
 * @version 1.0.1
 * @since 2025-05-29
 * @updated 2025-05-29
 */

import {
    ISpatialValidator,
    SpatialZoneType
} from './types/SpaceTransformationTypes';
import {
    ExtendedLSFSpaceParameter,
    LSFTypeConverter,
    isExtendedLSFSpaceParameter
} from './types/ExtendedLSFTypes';

/**
 * Validateur pour les paramètres d'espace syntaxique
 * 
 * Cette classe valide la cohérence et la validité des paramètres
 * d'espace syntaxique selon les règles linguistiques de la LSF
 */
export class SyntacticSpaceValidator implements ISpatialValidator {
    private readonly minAccuracy: number = 0;
    private readonly maxAccuracy: number = 1;
    private readonly minScale: number = 0.1;
    private readonly maxScale: number = 2.0;

    /**
     * Valide un paramètre d'espace LSF
     * @param space Paramètre d'espace à valider
     * @returns true si l'espace est valide, false sinon
     */
    public isValidSpace(space: ExtendedLSFSpaceParameter | Record<string, unknown>): boolean {
        if (!space || typeof space !== 'object') {
            return false;
        }

        // Conversion en paramètre étendu si nécessaire
        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space as Record<string, unknown>);

        return this.validateBasicProperties(extendedSpace) &&
            this.validateSpatialCoherence(extendedSpace) &&
            this.validateSpatialReferences(extendedSpace) &&
            this.validateLinguisticConstraints(extendedSpace);
    }

    /**
     * Valide les propriétés de base de l'espace
     * @param space Paramètre d'espace étendu
     * @returns true si les propriétés de base sont valides
     * @private
     */
    private validateBasicProperties(space: ExtendedLSFSpaceParameter): boolean {
        // Validation de la précision
        if (space.accuracy !== undefined) {
            if (typeof space.accuracy !== 'number' ||
                space.accuracy < this.minAccuracy ||
                space.accuracy > this.maxAccuracy) {
                return false;
            }
        }

        // Validation de l'échelle
        if (space.scale !== undefined) {
            if (typeof space.scale !== 'number' ||
                space.scale < this.minScale ||
                space.scale > this.maxScale) {
                return false;
            }
        }

        // Validation des propriétés booléennes
        const booleanProperties = [
            'zoneConfusion',
            'referenceConsistency',
            'randomPlacement',
            'locationOmission',
            'ambiguousReference',
            'referenceOmission',
            'pronounConfusion',
            'spatialReorganization'
        ] as const;

        for (const prop of booleanProperties) {
            if (space[prop] !== undefined && typeof space[prop] !== 'boolean') {
                return false;
            }
        }

        return true;
    }

    /**
     * Valide la cohérence spatiale
     * @param space Paramètre d'espace étendu
     * @returns true si la cohérence spatiale est maintenue
     */
    public validateSpatialCoherence(space: Record<string, unknown>): boolean {
        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space);

        // Vérification de la cohérence entre les propriétés
        if (extendedSpace.zoneConfusion && extendedSpace.referenceConsistency) {
            // La confusion de zone est incompatible avec la consistance des références
            return false;
        }

        if (extendedSpace.randomPlacement && extendedSpace.locationOmission) {
            // Le placement aléatoire et l'omission de localisation sont redondants
            return false;
        }

        // Vérification des confusions pronominales avec consistance des références
        if (extendedSpace.pronounConfusion && extendedSpace.referenceConsistency) {
            // La confusion pronominale implique une inconsistance des références
            return false;
        }

        // Vérification de la cohérence de l'échelle avec l'exactitude
        if (extendedSpace.scale !== undefined && extendedSpace.accuracy !== undefined) {
            // Une échelle très réduite devrait correspondre à une précision réduite
            if (extendedSpace.scale < 0.5 && extendedSpace.accuracy > 0.8) {
                return false;
            }
        }

        return true;
    }

    /**
     * Valide les références spatiales
     * @param space Paramètre d'espace
     * @returns true si les références spatiales sont cohérentes
     */
    public validateSpatialReferences(space: Record<string, unknown>): boolean {
        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space);

        // Si la consistance des références est désactivée,
        // certaines propriétés spatiales perdent leur sens
        if (extendedSpace.referenceConsistency === false) {
            // Dans ce cas, la précision ne peut pas être maximale
            if (extendedSpace.accuracy !== undefined && extendedSpace.accuracy > 0.7) {
                return false;
            }
        }

        // Si il y a omission de références, la consistance ne peut pas être maintenue
        if (extendedSpace.referenceOmission && extendedSpace.referenceConsistency) {
            return false;
        }

        // Validation des zones spatiales si présentes
        if (extendedSpace.zones && extendedSpace.zones.length > 0) {
            return this.validateSpatialZones(extendedSpace.zones);
        }

        return true;
    }

    /**
     * Valide les contraintes linguistiques
     * @param space Paramètre d'espace
     * @returns true si les contraintes linguistiques sont respectées
     */
    public validateLinguisticConstraints(space: Record<string, unknown>): boolean {
        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space);

        // Contraintes de la grammaire spatiale LSF
        if (extendedSpace.zoneConfusion && extendedSpace.accuracy !== undefined) {
            // La confusion de zone implique une réduction significative de précision
            if (extendedSpace.accuracy > 0.6) {
                return false;
            }
        }

        // Contraintes de placement
        if (extendedSpace.randomPlacement && extendedSpace.accuracy !== undefined) {
            // Le placement aléatoire est incompatible avec une haute précision
            if (extendedSpace.accuracy > 0.5) {
                return false;
            }
        }

        // Contraintes d'omission
        if (extendedSpace.locationOmission && extendedSpace.accuracy !== undefined) {
            // L'omission de localisation réduit nécessairement la précision
            if (extendedSpace.accuracy > 0.55) {
                return false;
            }
        }

        // Contraintes de réorganisation spatiale
        if (extendedSpace.spatialReorganization && extendedSpace.accuracy !== undefined) {
            // La réorganisation spatiale implique une réduction de précision
            if (extendedSpace.accuracy > 0.65) {
                return false;
            }
        }

        // Contraintes des références ambiguës
        if (extendedSpace.ambiguousReference && extendedSpace.accuracy !== undefined) {
            // Les références ambiguës réduisent la précision
            if (extendedSpace.accuracy > 0.7) {
                return false;
            }
        }

        return true;
    }

    /**
     * Valide les zones spatiales
     * @param zones Zones spatiales à valider
     * @returns true si les zones sont valides
     * @private
     */
    private validateSpatialZones(zones: SpatialZoneType[]): boolean {
        if (!Array.isArray(zones)) {
            return false;
        }

        const validZoneTypes = Object.values(SpatialZoneType);

        for (const zone of zones) {
            if (typeof zone !== 'string' || !validZoneTypes.includes(zone)) {
                return false;
            }
        }

        // Vérification qu'il n'y a pas de zones contradictoires
        const hasCenter = zones.includes(SpatialZoneType.CENTER);
        const hasPeripheral = zones.includes(SpatialZoneType.PERIPHERAL);

        if (hasCenter && hasPeripheral) {
            return false; // Centre et périphérie sont mutuellement exclusifs
        }

        // Vérification de la cohérence entre zones dominantes et non-dominantes
        const hasDominant = zones.includes(SpatialZoneType.DOMINANT_SIDE);
        const hasNonDominant = zones.includes(SpatialZoneType.NON_DOMINANT_SIDE);

        if (hasDominant && hasNonDominant && zones.length === 2) {
            // Acceptable : utilisation bilatérale
            return true;
        }

        return true;
    }

    /**
     * Valide la compatibilité entre deux espaces syntaxiques
     * @param space1 Premier espace
     * @param space2 Second espace
     * @returns true si les espaces sont compatibles
     */
    public validateCompatibility(
        space1: ExtendedLSFSpaceParameter | Record<string, unknown>,
        space2: ExtendedLSFSpaceParameter | Record<string, unknown>
    ): boolean {
        if (!this.isValidSpace(space1) || !this.isValidSpace(space2)) {
            return false;
        }

        const extended1 = isExtendedLSFSpaceParameter(space1)
            ? space1
            : LSFTypeConverter.toExtended(space1 as Record<string, unknown>);

        const extended2 = isExtendedLSFSpaceParameter(space2)
            ? space2
            : LSFTypeConverter.toExtended(space2 as Record<string, unknown>);

        // Vérification de la cohérence des références
        if (extended1.referenceConsistency !== extended2.referenceConsistency) {
            return false;
        }

        // Vérification de la cohérence des échelles
        if (extended1.scale !== undefined && extended2.scale !== undefined) {
            const scaleDifference = Math.abs(extended1.scale - extended2.scale);
            if (scaleDifference > 0.5) {
                return false; // Différence d'échelle trop importante
            }
        }

        // Vérification de la cohérence des zones
        if (extended1.zones && extended2.zones) {
            const zones1Set = new Set(extended1.zones);
            const zones2Set = new Set(extended2.zones);

            // Au moins une zone en commun pour la compatibilité
            const intersection = [...zones1Set].filter(zone => zones2Set.has(zone));
            if (intersection.length === 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtient les erreurs de validation pour un espace donné
     * @param space Paramètre d'espace à valider
     * @returns Liste des erreurs de validation
     */
    public getValidationErrors(space: ExtendedLSFSpaceParameter | Record<string, unknown>): string[] {
        const errors: string[] = [];

        if (!space || typeof space !== 'object') {
            errors.push('Paramètre d\'espace invalide ou manquant');
            return errors;
        }

        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space as Record<string, unknown>);

        // Validation des propriétés numériques
        if (extendedSpace.accuracy !== undefined) {
            if (typeof extendedSpace.accuracy !== 'number') {
                errors.push('La précision doit être un nombre');
            } else if (extendedSpace.accuracy < this.minAccuracy || extendedSpace.accuracy > this.maxAccuracy) {
                errors.push(`La précision doit être entre ${this.minAccuracy} et ${this.maxAccuracy}`);
            }
        }

        if (extendedSpace.scale !== undefined) {
            if (typeof extendedSpace.scale !== 'number') {
                errors.push('L\'échelle doit être un nombre');
            } else if (extendedSpace.scale < this.minScale || extendedSpace.scale > this.maxScale) {
                errors.push(`L\'échelle doit être entre ${this.minScale} et ${this.maxScale}`);
            }
        }

        // Validation des zones
        if (extendedSpace.zones && !this.validateSpatialZones(extendedSpace.zones)) {
            errors.push('Zones spatiales invalides ou contradictoires');
        }

        // Validation de la cohérence
        if (!this.validateSpatialCoherence(extendedSpace)) {
            errors.push('Incohérence dans les propriétés spatiales');
        }

        if (!this.validateSpatialReferences(extendedSpace)) {
            errors.push('Incohérence dans les références spatiales');
        }

        if (!this.validateLinguisticConstraints(extendedSpace)) {
            errors.push('Violation des contraintes linguistiques LSF');
        }

        return errors;
    }

    /**
     * Vérifie si un espace contient des erreurs critiques
     * @param space Paramètre d'espace à vérifier
     * @returns true si l'espace contient des erreurs critiques
     */
    public hasCriticalErrors(space: ExtendedLSFSpaceParameter | Record<string, unknown>): boolean {
        if (!space || typeof space !== 'object') {
            return true;
        }

        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space as Record<string, unknown>);

        // Vérification des erreurs critiques
        if (extendedSpace.criticalError) {
            return true;
        }

        // Précision trop faible
        if (extendedSpace.accuracy !== undefined && extendedSpace.accuracy < 0.1) {
            return true;
        }

        // Échelle invalide
        if (extendedSpace.scale !== undefined && extendedSpace.scale <= 0) {
            return true;
        }

        // Omission totale de localisation avec autres propriétés incohérentes
        if (extendedSpace.locationOmission &&
            extendedSpace.randomPlacement &&
            extendedSpace.referenceOmission) {
            return true;
        }

        return false;
    }

    /**
     * Calcule un score de qualité pour l'espace syntaxique
     * @param space Paramètre d'espace à évaluer
     * @returns Score de qualité entre 0 et 1
     */
    public calculateQualityScore(space: ExtendedLSFSpaceParameter | Record<string, unknown>): number {
        if (!this.isValidSpace(space)) {
            return 0;
        }

        const extendedSpace = isExtendedLSFSpaceParameter(space)
            ? space
            : LSFTypeConverter.toExtended(space as Record<string, unknown>);

        let score = 1.0;

        // Réduction basée sur la précision
        if (extendedSpace.accuracy !== undefined) {
            score *= extendedSpace.accuracy;
        }

        // Réduction basée sur les problèmes spatiaux
        if (extendedSpace.zoneConfusion) score *= 0.8;
        if (extendedSpace.randomPlacement) score *= 0.7;
        if (extendedSpace.locationOmission) score *= 0.6;
        if (!extendedSpace.referenceConsistency) score *= 0.75;
        if (extendedSpace.pronounConfusion) score *= 0.85;
        if (extendedSpace.ambiguousReference) score *= 0.9;

        // Bonus pour la cohérence globale
        if (this.validateSpatialCoherence(extendedSpace) &&
            this.validateSpatialReferences(extendedSpace) &&
            this.validateLinguisticConstraints(extendedSpace)) {
            score *= 1.1;
        }

        return Math.min(1.0, Math.max(0.0, score));
    }
}