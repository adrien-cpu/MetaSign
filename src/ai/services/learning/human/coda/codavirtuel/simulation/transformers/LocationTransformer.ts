/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/LocationTransformer.ts
 * @description Transformateur pour les erreurs d'emplacement en LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce module gère les transformations des emplacements dans les simulations LSF,
 * en appliquant des erreurs telles que des emplacements incorrects, imprécis ou déplacés.
 * Il hérite de BaseErrorTransformer pour appliquer des transformations spécifiques
 * basées sur les paramètres d'emplacement définis dans le contenu LSF.
 * 
 * Les erreurs simulées incluent :
 * - Substitution d'emplacements (ex: visage → poitrine)
 * - Perturbation de coordonnées spatiales
 * - Déplacement vers des zones incorrectes
 * - Imprécision de positionnement
 * - Confusion entre emplacements proches
 * 
 * @module LocationTransformer
 * @requires BaseErrorTransformer
 * @requires ErrorCatalogEntry
 * @requires ErrorCategoryType
 * @requires ErrorTransformation
 * @requires ErrorTransformationType
 * @requires LSFLocationParameter
 * @requires LSFParameters
 */

import { BaseErrorTransformer } from './BaseErrorTransformer';
import {
    ErrorCatalogEntry,
    ErrorCategoryType,
    ErrorTransformation,
    ErrorTransformationType
} from '../types/ErrorTypes';
import {
    LSFLocationParameter,
    LSFParameters
} from '../types/LSFContentTypes';

/**
 * Système de coordonnées et zones LSF
 * Définit l'espace de signation standardisé
 */
const LSF_LOCATION_SYSTEM = {
    // Zones principales du corps
    zones: {
        head: {
            name: 'tete',
            subzones: ['front', 'tempe', 'joue', 'menton', 'oreille'],
            coordinates: { x: 0, y: 1.8, z: 0 },
            bounds: { width: 0.4, height: 0.3, depth: 0.2 }
        },
        face: {
            name: 'visage',
            subzones: ['oeil', 'nez', 'bouche', 'levre'],
            coordinates: { x: 0, y: 1.7, z: 0.1 },
            bounds: { width: 0.25, height: 0.2, depth: 0.15 }
        },
        neck: {
            name: 'cou',
            subzones: ['gorge', 'nuque'],
            coordinates: { x: 0, y: 1.5, z: 0 },
            bounds: { width: 0.2, height: 0.15, depth: 0.15 }
        },
        chest: {
            name: 'poitrine',
            subzones: ['haut_poitrine', 'coeur', 'sternum'],
            coordinates: { x: 0, y: 1.2, z: 0 },
            bounds: { width: 0.4, height: 0.3, depth: 0.2 }
        },
        abdomen: {
            name: 'ventre',
            subzones: ['estomac', 'nombril'],
            coordinates: { x: 0, y: 0.9, z: 0 },
            bounds: { width: 0.35, height: 0.25, depth: 0.2 }
        },
        neutral: {
            name: 'espace_neutre',
            subzones: ['devant_corps', 'cote_droit', 'cote_gauche'],
            coordinates: { x: 0, y: 1.0, z: 0.3 },
            bounds: { width: 0.8, height: 0.6, depth: 0.4 }
        }
    },

    // Emplacements confusables (erreurs fréquentes)
    confusable: {
        'visage': ['tete', 'cou', 'front'],
        'poitrine': ['coeur', 'ventre', 'sternum'],
        'tete': ['visage', 'front', 'tempe'],
        'cou': ['gorge', 'poitrine', 'menton'],
        'ventre': ['poitrine', 'estomac', 'nombril'],
        'espace_neutre': ['devant_corps', 'cote_droit', 'cote_gauche']
    },

    // Niveaux de difficulté par précision requise
    difficulty: {
        beginner: ['poitrine', 'visage', 'tete', 'espace_neutre'],
        intermediate: ['cou', 'ventre', 'front', 'joue'],
        advanced: ['tempe', 'levre', 'sternum', 'nuque', 'oreille']
    }
};

/**
 * Transformateur pour les erreurs d'emplacement
 * Simule des erreurs telles que des emplacements incorrects, imprécis ou déplacés
 * 
 * @class LocationTransformer
 * @extends BaseErrorTransformer
 */
export class LocationTransformer extends BaseErrorTransformer {
    /**
     * Initialise le transformateur pour les erreurs d'emplacement
     * @param {ErrorCatalogEntry} errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.LOCATION, errorCategory);
    }

    /**
     * Applique une transformation spécifique d'emplacement
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const location = this.getTargetParameter(content) as LSFLocationParameter | undefined;
        if (!location) {
            this.logger.warn('Aucun paramètre d\'emplacement trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.SUBSTITUTION:
                this.applySubstitutionTransformation(location, transform);
                break;

            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(location, transform);
                }
                break;

            case ErrorTransformationType.OMISSION:
                this.applyOmissionTransformation(location);
                break;

            case ErrorTransformationType.DIRECTION:
                if (transform.rotation || transform.degrees) {
                    this.applyDirectionTransformation(location, transform);
                }
                break;

            default:
                // Si la transformation spécifie une substitution directe
                if (transform.from && transform.to && location.type === transform.from) {
                    this.applyDirectSubstitution(location, transform.from, transform.to);
                } else if (location.position && Array.isArray(location.position)) {
                    // Perturbe légèrement les coordonnées
                    this.perturbPosition(location, 0.1);
                } else {
                    // Fallback: réduit simplement la précision
                    this.reduceAccuracy(location, 0.25);
                }
                break;
        }
    }

    /**
     * Applique une transformation de substitution d'emplacement
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applySubstitutionTransformation(location: LSFLocationParameter, transform: ErrorTransformation): void {
        const originalType = location.type;

        if (transform.from && transform.to && location.type === transform.from) {
            // Substitution directe spécifiée
            this.applyDirectSubstitution(location, transform.from, transform.to);
        } else if (originalType) {
            // Substitution intelligente basée sur la confusion
            const confusableLocation = this.getConfusableLocation(originalType);
            if (confusableLocation) {
                this.applyDirectSubstitution(location, originalType, confusableLocation);
                // Ajuste aussi les coordonnées si disponibles
                this.adjustCoordinatesForLocation(location, confusableLocation);
            } else {
                // Fallback vers un emplacement de base
                const fallbackLocation = this.getFallbackLocation(originalType);
                this.applyDirectSubstitution(location, originalType, fallbackLocation);
                this.adjustCoordinatesForLocation(location, fallbackLocation);
            }
        }

        this.reduceAccuracy(location, 0.4);
    }

    /**
     * Applique une transformation d'intensité (perturbation de position)
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(location: LSFLocationParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // Le facteur détermine l'intensité de la perturbation
            const perturbationIntensity = (1 - transform.factor) * 0.3;

            if (location.position && Array.isArray(location.position)) {
                this.perturbPosition(location, perturbationIntensity);
            }

            this.reduceAccuracy(location, perturbationIntensity);

            this.logger.debug(
                `Intensité d'emplacement réduite par facteur ${transform.factor}: perturbation = ${perturbationIntensity}`
            );
        }
    }

    /**
     * Applique une transformation d'omission (emplacement manquant)
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @private
     */
    private applyOmissionTransformation(location: LSFLocationParameter): void {
        // Marque l'emplacement comme indéfini ou neutre
        location.type = 'indefini';
        location.position = undefined;
        this.reduceAccuracy(location, 0.8);

        this.logger.debug('Emplacement omis - type défini comme "indefini"');
    }

    /**
     * Applique une transformation de direction (déplacement spatial)
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyDirectionTransformation(location: LSFLocationParameter, transform: ErrorTransformation): void {
        if (location.position && Array.isArray(location.position)) {
            let rotationDegrees = 0;

            if (transform.degrees !== undefined) {
                rotationDegrees = transform.degrees;
            } else if (transform.rotation) {
                // Convertir les rotations nommées en degrés
                const rotationMap: Record<string, number> = {
                    'gauche': -30,
                    'droite': 30,
                    'haut': 15,
                    'bas': -15,
                    'arriere': 45,
                    'avant': -45
                };
                rotationDegrees = rotationMap[transform.rotation] || 0;
            }

            if (rotationDegrees !== 0) {
                this.rotatePosition(location, rotationDegrees);
                this.reduceAccuracy(location, 0.3);

                this.logger.debug(
                    `Emplacement déplacé par rotation de ${rotationDegrees}° (${transform.rotation || 'custom'})`
                );
            }
        }
    }

    /**
     * Applique une substitution directe d'emplacement
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {string} from - Emplacement source
     * @param {string} to - Emplacement cible
     * @private
     */
    private applyDirectSubstitution(location: LSFLocationParameter, from: string, to: string): void {
        location.type = to;
        this.reduceAccuracy(location, 0.6);

        this.logger.debug(`Emplacement transformé: ${from} → ${to}`);
    }

    /**
     * Perturbe la position d'un emplacement
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {number} intensity - Intensité de la perturbation (0-1)
     * @private
     */
    private perturbPosition(location: LSFLocationParameter, intensity: number): void {
        if (location.position && Array.isArray(location.position)) {
            const originalPosition = [...location.position];

            location.position = location.position.map((coord: number) => {
                const offset = (Math.random() - 0.5) * intensity * 2;
                return coord + offset;
            });

            this.logger.debug(
                `Position perturbée - Original: [${originalPosition.join(', ')}] → Nouveau: [${location.position.join(', ')}]`
            );
        }
    }

    /**
     * Effectue une rotation de la position
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {number} degrees - Degrés de rotation
     * @private
     */
    private rotatePosition(location: LSFLocationParameter, degrees: number): void {
        if (location.position && Array.isArray(location.position) && location.position.length >= 2) {
            const [x, y, z = 0] = location.position;
            const radians = (degrees * Math.PI) / 180;

            // Rotation simple autour de l'axe Z (plan horizontal)
            const newX = x * Math.cos(radians) - y * Math.sin(radians);
            const newY = x * Math.sin(radians) + y * Math.cos(radians);

            location.position = [
                Number(newX.toFixed(3)),
                Number(newY.toFixed(3)),
                z
            ];

            this.logger.debug(`Position rotée de ${degrees}°: [${x}, ${y}, ${z}] → [${newX.toFixed(3)}, ${newY.toFixed(3)}, ${z}]`);
        }
    }

    /**
     * Ajuste les coordonnées pour correspondre à un nouvel emplacement
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {string} newLocationType - Nouveau type d'emplacement
     * @private
     */
    private adjustCoordinatesForLocation(location: LSFLocationParameter, newLocationType: string): void {
        const zoneInfo = Object.values(LSF_LOCATION_SYSTEM.zones)
            .find(zone => zone.name === newLocationType || zone.subzones.includes(newLocationType));

        if (zoneInfo && (!location.position || location.position.length === 0)) {
            // Assigne des coordonnées approximatives pour la nouvelle zone
            const { coordinates, bounds } = zoneInfo;
            location.position = [
                coordinates.x + (Math.random() - 0.5) * bounds.width * 0.5,
                coordinates.y + (Math.random() - 0.5) * bounds.height * 0.5,
                coordinates.z + (Math.random() - 0.5) * bounds.depth * 0.5
            ];

            this.logger.debug(`Coordonnées ajustées pour "${newLocationType}": [${location.position.join(', ')}]`);
        }
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre d'emplacement
     * @param {LSFLocationParameter} location - Paramètre d'emplacement
     * @param {number} reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(location: LSFLocationParameter, reduction: number): void {
        const originalAccuracy = location.accuracy || 1;
        location.accuracy = Math.max(0, originalAccuracy - reduction);

        this.logger.debug(
            `Précision d'emplacement réduite: ${originalAccuracy} → ${location.accuracy}`
        );
    }

    /**
     * Obtient un emplacement confusable pour un emplacement donné
     * @param {string} originalType - Type d'emplacement original
     * @returns {string | undefined} Emplacement confusable ou undefined
     * @private
     */
    private getConfusableLocation(originalType: string): string | undefined {
        const confusableList = LSF_LOCATION_SYSTEM.confusable[
            originalType as keyof typeof LSF_LOCATION_SYSTEM.confusable
        ];

        if (confusableList && confusableList.length > 0) {
            return confusableList[Math.floor(Math.random() * confusableList.length)];
        }

        return undefined;
    }

    /**
     * Obtient un emplacement de fallback pour un emplacement donné
     * @param {string} originalType - Type d'emplacement original
     * @returns {string} Emplacement de fallback
     * @private
     */
    private getFallbackLocation(originalType: string): string {
        // Évite de retourner le même emplacement
        const availableLocations = LSF_LOCATION_SYSTEM.difficulty.beginner.filter(loc => loc !== originalType);

        if (availableLocations.length > 0) {
            return availableLocations[Math.floor(Math.random() * availableLocations.length)];
        }

        // Fallback de sécurité
        return 'espace_neutre';
    }

    /**
     * Détermine le niveau de difficulté d'un emplacement
     * @param {string} locationType - Type d'emplacement
     * @returns {string} Niveau de difficulté (beginner, intermediate, advanced)
     * @private
     */
    private getLocationDifficulty(locationType: string): string {
        const { difficulty } = LSF_LOCATION_SYSTEM;

        if (difficulty.beginner.includes(locationType)) return 'beginner';
        if (difficulty.intermediate.includes(locationType)) return 'intermediate';
        if (difficulty.advanced.includes(locationType)) return 'advanced';

        return 'intermediate'; // Fallback
    }

    /**
     * Vérifie si un emplacement est valide
     * @param {string} locationType - Type d'emplacement à valider
     * @returns {boolean} true si l'emplacement est valide
     * @private
     */
    private isValidLocation(locationType: string): boolean {
        const allLocations = [
            ...Object.values(LSF_LOCATION_SYSTEM.zones).map(zone => zone.name),
            ...Object.values(LSF_LOCATION_SYSTEM.zones).flatMap(zone => zone.subzones),
            'indefini'
        ];

        return allLocations.includes(locationType);
    }

    /**
     * Applique la transformation par défaut pour les erreurs d'emplacement
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const location = this.getTargetParameter(content) as LSFLocationParameter | undefined;
        if (!location) {
            this.logger.warn('Aucun paramètre d\'emplacement trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(location, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${location.accuracy}`
        );
    }

    /**
     * Obtient le paramètre d'emplacement dans le contenu LSF
     * @param {Record<string, unknown>} content - Contenu LSF
     * @returns {LSFLocationParameter | undefined} Le paramètre d'emplacement ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFLocationParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        return parameters.location;
    }

    /**
     * Obtient des statistiques sur les emplacements supportés
     * @returns {object} Statistiques des emplacements
     * @public
     */
    public getLocationStats(): {
        totalLocations: number;
        zones: number;
        subzones: number;
        byDifficulty: Record<string, number>;
        confusablePairs: number;
    } {
        const { zones, difficulty, confusable } = LSF_LOCATION_SYSTEM;

        const totalSubzones = Object.values(zones).reduce((sum, zone) => sum + zone.subzones.length, 0);

        return {
            totalLocations: Object.keys(zones).length + totalSubzones,
            zones: Object.keys(zones).length,
            subzones: totalSubzones,
            byDifficulty: {
                beginner: difficulty.beginner.length,
                intermediate: difficulty.intermediate.length,
                advanced: difficulty.advanced.length
            },
            confusablePairs: Object.keys(confusable).length
        };
    }

    /**
     * Calcule la distance spatiale entre deux positions
     * @param {number[]} pos1 - Première position [x, y, z]
     * @param {number[]} pos2 - Seconde position [x, y, z]
     * @returns {number} Distance euclidienne
     * @public
     */
    public calculateSpatialDistance(pos1: number[], pos2: number[]): number {
        if (!pos1 || !pos2 || pos1.length < 2 || pos2.length < 2) {
            return Infinity;
        }

        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = (pos1[2] || 0) - (pos2[2] || 0);

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}