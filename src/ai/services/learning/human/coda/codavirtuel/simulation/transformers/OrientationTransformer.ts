/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/OrientationTransformer.ts
 * @description Transformateur pour les erreurs d'orientation en LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce module gère les transformations des orientations dans les simulations LSF,
 * en appliquant des erreurs telles que des orientations de paume, de doigts ou de poignet incorrectes.
 * Il hérite de BaseErrorTransformer pour appliquer des transformations spécifiques
 * basées sur les paramètres d'orientation définis dans le contenu LSF.
 * 
 * Les erreurs simulées incluent :
 * - Rotations incorrectes sur les axes X, Y, Z
 * - Orientations de paume inappropriées
 * - Erreurs d'angles de poignet
 * - Désalignements directionnels
 * - Confusions entre orientations similaires
 * - Problèmes de symétrie bilatérale
 * 
 * @module OrientationTransformer
 * @requires BaseErrorTransformer
 * @requires ErrorCatalogEntry
 * @requires ErrorCategoryType
 * @requires ErrorTransformation
 * @requires ErrorTransformationType
 * @requires LSFOrientationParameter
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
    LSFOrientationParameter,
    LSFParameters
} from '../types/LSFContentTypes';

/**
 * Système d'orientation 3D pour la LSF
 * Définit les orientations standard et leurs variations
 */
const LSF_ORIENTATION_SYSTEM = {
    // Orientations standard de la paume
    palmOrientations: {
        down: {
            description: 'Paume vers le bas',
            angles: { x: 0, y: 0, z: 0 },
            commonMistakes: ['up', 'forward', 'backward']
        },
        up: {
            description: 'Paume vers le haut',
            angles: { x: 180, y: 0, z: 0 },
            commonMistakes: ['down', 'left', 'right']
        },
        forward: {
            description: 'Paume vers l\'avant',
            angles: { x: 90, y: 0, z: 0 },
            commonMistakes: ['backward', 'down', 'diagonal_up']
        },
        backward: {
            description: 'Paume vers l\'arrière',
            angles: { x: -90, y: 0, z: 0 },
            commonMistakes: ['forward', 'up', 'diagonal_down']
        },
        left: {
            description: 'Paume vers la gauche',
            angles: { x: 0, y: 0, z: 90 },
            commonMistakes: ['right', 'up', 'down']
        },
        right: {
            description: 'Paume vers la droite',
            angles: { x: 0, y: 0, z: -90 },
            commonMistakes: ['left', 'forward', 'backward']
        },
        diagonal_up: {
            description: 'Paume diagonale vers le haut',
            angles: { x: 45, y: 0, z: 45 },
            commonMistakes: ['up', 'forward', 'diagonal_down']
        },
        diagonal_down: {
            description: 'Paume diagonale vers le bas',
            angles: { x: -45, y: 0, z: -45 },
            commonMistakes: ['down', 'backward', 'diagonal_up']
        }
    },

    // Axes de rotation avec leurs caractéristiques
    rotationAxes: {
        x: {
            name: 'Axe X (pitch)',
            description: 'Rotation avant/arrière de la main',
            range: [-180, 180],
            neutralPosition: 0,
            commonErrors: ['over_rotation', 'under_rotation', 'opposite_direction']
        },
        y: {
            name: 'Axe Y (yaw)',
            description: 'Rotation gauche/droite de la main',
            range: [-180, 180],
            neutralPosition: 0,
            commonErrors: ['lateral_drift', 'overcorrection', 'asymmetry']
        },
        z: {
            name: 'Axe Z (roll)',
            description: 'Rotation de roulis de la main',
            range: [-180, 180],
            neutralPosition: 0,
            commonErrors: ['wrist_twist', 'palm_flip', 'instability']
        }
    },

    // Orientations confusables par niveau de similarité
    confusableOrientations: {
        high_similarity: {
            'up': ['diagonal_up'],
            'down': ['diagonal_down'],
            'forward': ['diagonal_up'],
            'backward': ['diagonal_down']
        },
        medium_similarity: {
            'left': ['right'],
            'up': ['forward'],
            'down': ['backward']
        },
        low_similarity: {
            'up': ['down'],
            'forward': ['backward'],
            'left': ['right']
        }
    },

    // Zones de tolérance angulaire
    toleranceZones: {
        precise: { threshold: 5, description: 'Orientation très précise' },
        acceptable: { threshold: 15, description: 'Orientation acceptable' },
        approximate: { threshold: 30, description: 'Orientation approximative' },
        incorrect: { threshold: 90, description: 'Orientation incorrecte' }
    },

    // Niveaux de difficulté pour les orientations
    difficulty: {
        beginner: ['up', 'down', 'forward', 'backward'],
        intermediate: ['left', 'right', 'diagonal_up', 'diagonal_down'],
        advanced: ['complex_rotation', 'multi_axis', 'dynamic_orientation']
    }
};

/**
 * Transformateur pour les erreurs d'orientation
 * Simule des erreurs telles que des orientations de paume, de doigts ou de poignet incorrectes
 * 
 * @class OrientationTransformer
 * @extends BaseErrorTransformer
 */
export class OrientationTransformer extends BaseErrorTransformer {
    /**
     * Initialise le transformateur pour les erreurs d'orientation
     * @param {ErrorCatalogEntry} errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.ORIENTATION, errorCategory);
    }

    /**
     * Applique une transformation spécifique d'orientation
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const orientation = this.getTargetParameter(content) as LSFOrientationParameter | undefined;
        if (!orientation) {
            this.logger.warn('Aucun paramètre d\'orientation trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.SUBSTITUTION:
                this.applySubstitutionTransformation(orientation, transform);
                break;

            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(orientation, transform);
                }
                break;

            case ErrorTransformationType.OMISSION:
                this.applyOmissionTransformation(orientation);
                break;

            case ErrorTransformationType.DIRECTION:
                if (transform.rotation && transform.degrees !== undefined) {
                    this.applyRotationTransformation(orientation, transform);
                }
                break;

            default:
                // Si la transformation spécifie une substitution directe
                if (transform.from && transform.to && orientation.type === transform.from) {
                    this.applyDirectSubstitution(orientation, transform.from, transform.to);
                } else if (transform.rotation && transform.degrees !== undefined) {
                    // Si c'est une rotation spécifique
                    this.applyRotationTransformation(orientation, transform);
                } else {
                    // Fallback: réduit simplement la précision
                    this.reduceAccuracy(orientation, 0.2);
                }
                break;
        }
    }

    /**
     * Applique une transformation de substitution d'orientation
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applySubstitutionTransformation(orientation: LSFOrientationParameter, transform: ErrorTransformation): void {
        const originalType = orientation.type;

        if (transform.from && transform.to && orientation.type === transform.from) {
            // Substitution directe spécifiée
            this.applyDirectSubstitution(orientation, transform.from, transform.to);
        } else if (originalType) {
            // Substitution intelligente basée sur la confusion
            const confusableOrientation = this.getConfusableOrientation(originalType);
            if (confusableOrientation) {
                this.applyDirectSubstitution(orientation, originalType, confusableOrientation);
                // Met à jour aussi les angles si possible
                this.updateAnglesForOrientation(orientation, confusableOrientation);
            } else {
                // Fallback vers une orientation de base
                const fallbackOrientation = this.getFallbackOrientation(originalType);
                this.applyDirectSubstitution(orientation, originalType, fallbackOrientation);
                this.updateAnglesForOrientation(orientation, fallbackOrientation);
            }
        }

        this.reduceAccuracy(orientation, 0.4);
    }

    /**
     * Applique une transformation d'intensité (perturbation angulaire)
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(orientation: LSFOrientationParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // Assure la présence des angles
            if (!orientation.angles) {
                orientation.angles = { x: 0, y: 0, z: 0 };
            }

            // Applique une perturbation proportionnelle à l'intensité
            const perturbationIntensity = (1 - transform.factor) * 30; // Max 30° de perturbation

            ['x', 'y', 'z'].forEach(axis => {
                const currentAngle = orientation.angles![axis as keyof typeof orientation.angles] || 0;
                const perturbation = (Math.random() - 0.5) * perturbationIntensity * 2;
                const newAngle = this.normalizeAngle(currentAngle + perturbation);

                orientation.angles![axis as keyof typeof orientation.angles] = newAngle;
            });

            this.reduceAccuracy(orientation, (1 - transform.factor) * 0.5);

            this.logger.debug(
                `Intensité d'orientation réduite par facteur ${transform.factor}: perturbation = ±${perturbationIntensity}°`
            );
        }
    }

    /**
     * Applique une transformation d'omission (orientation indéfinie)
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @private
     */
    private applyOmissionTransformation(orientation: LSFOrientationParameter): void {
        // Marque l'orientation comme indéfinie
        orientation.type = 'indefinie';
        orientation.angles = undefined;
        this.reduceAccuracy(orientation, 0.9);

        this.logger.debug('Orientation omise - type défini comme "indefinie"');
    }

    /**
     * Applique une transformation de rotation à l'orientation
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyRotationTransformation(orientation: LSFOrientationParameter, transform: ErrorTransformation): void {
        // Assure la présence des angles
        if (!orientation.angles) {
            orientation.angles = { x: 0, y: 0, z: 0 };
        }

        if (transform.rotation && transform.degrees !== undefined) {
            const axis = transform.rotation;
            const rotationAmount = transform.degrees;

            // Modifie l'angle selon l'axe spécifié
            if (axis === 'x' || axis === 'y' || axis === 'z') {
                const currentAngle = orientation.angles[axis] || 0;
                const newAngle = this.normalizeAngle(currentAngle + rotationAmount);
                orientation.angles[axis] = newAngle;

                this.logger.debug(
                    `Rotation appliquée sur l'axe ${axis}: ${currentAngle}° → ${newAngle}° (rotation: ${rotationAmount}°)`
                );
            } else {
                // Rotation nommée (ex: 'clockwise', 'counter_clockwise')
                const rotationMap: Record<string, { axis: keyof typeof orientation.angles, degrees: number }> = {
                    'clockwise': { axis: 'z', degrees: 45 },
                    'counter_clockwise': { axis: 'z', degrees: -45 },
                    'tilt_forward': { axis: 'x', degrees: 30 },
                    'tilt_backward': { axis: 'x', degrees: -30 },
                    'turn_left': { axis: 'y', degrees: -30 },
                    'turn_right': { axis: 'y', degrees: 30 }
                };

                const rotation = rotationMap[axis];
                if (rotation) {
                    const currentAngle = orientation.angles[rotation.axis] || 0;
                    const newAngle = this.normalizeAngle(currentAngle + rotation.degrees);
                    orientation.angles[rotation.axis] = newAngle;

                    this.logger.debug(
                        `Rotation nommée "${axis}" appliquée sur l'axe ${rotation.axis}: ${currentAngle}° → ${newAngle}°`
                    );
                }
            }
        }

        this.reduceAccuracy(orientation, 0.3);
    }

    /**
     * Applique une substitution directe d'orientation
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @param {string} from - Orientation source
     * @param {string} to - Orientation cible
     * @private
     */
    private applyDirectSubstitution(orientation: LSFOrientationParameter, from: string, to: string): void {
        orientation.type = to;
        this.reduceAccuracy(orientation, 0.5);

        this.logger.debug(`Orientation transformée: ${from} → ${to}`);
    }

    /**
     * Met à jour les angles pour correspondre à une orientation donnée
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @param {string} orientationType - Type d'orientation
     * @private
     */
    private updateAnglesForOrientation(orientation: LSFOrientationParameter, orientationType: string): void {
        const palmOrientation = LSF_ORIENTATION_SYSTEM.palmOrientations[
            orientationType as keyof typeof LSF_ORIENTATION_SYSTEM.palmOrientations
        ];

        if (palmOrientation) {
            orientation.angles = { ...palmOrientation.angles };
            this.logger.debug(`Angles mis à jour pour "${orientationType}": [${palmOrientation.angles.x}, ${palmOrientation.angles.y}, ${palmOrientation.angles.z}]`);
        }
    }

    /**
     * Normalise un angle entre -180 et 180 degrés
     * @param {number} angle - Angle à normaliser
     * @returns {number} Angle normalisé
     * @private
     */
    private normalizeAngle(angle: number): number {
        let normalized = angle % 360;
        if (normalized > 180) normalized -= 360;
        if (normalized <= -180) normalized += 360;
        return Math.round(normalized * 100) / 100; // Arrondit à 2 décimales
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre d'orientation
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @param {number} reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(orientation: LSFOrientationParameter, reduction: number): void {
        const originalAccuracy = orientation.accuracy || 1;
        orientation.accuracy = Math.max(0, originalAccuracy - reduction);

        this.logger.debug(
            `Précision d'orientation réduite: ${originalAccuracy} → ${orientation.accuracy}`
        );
    }

    /**
     * Obtient une orientation confusable pour une orientation donnée
     * @param {string} originalType - Type d'orientation original
     * @returns {string | undefined} Orientation confusable ou undefined
     * @private
     */
    private getConfusableOrientation(originalType: string): string | undefined {
        const { confusableOrientations } = LSF_ORIENTATION_SYSTEM;

        // Cherche d'abord dans les confusions à haute similarité
        for (const similarity of ['high_similarity', 'medium_similarity', 'low_similarity'] as const) {
            const confusableList = confusableOrientations[similarity][
                originalType as keyof typeof confusableOrientations[typeof similarity]
            ];

            if (confusableList && confusableList.length > 0) {
                return confusableList[Math.floor(Math.random() * confusableList.length)];
            }
        }

        return undefined;
    }

    /**
     * Obtient une orientation de fallback pour une orientation donnée
     * @param {string} originalType - Type d'orientation original
     * @returns {string} Orientation de fallback
     * @private
     */
    private getFallbackOrientation(originalType: string): string {
        // Évite de retourner la même orientation
        const beginnerOrientations = ['up', 'down', 'forward', 'backward']
            .filter(orientation => orientation !== originalType);

        return beginnerOrientations[Math.floor(Math.random() * beginnerOrientations.length)] || 'up';
    }

    /**
     * Calcule la distance angulaire entre deux orientations
     * @param {LSFOrientationParameter} orientation1 - Première orientation
     * @param {LSFOrientationParameter} orientation2 - Seconde orientation
     * @returns {number} Distance angulaire totale en degrés
     * @private
     */
    private calculateAngularDistance(orientation1: LSFOrientationParameter, orientation2: LSFOrientationParameter): number {
        if (!orientation1.angles || !orientation2.angles) {
            return Infinity;
        }

        const dx = Math.abs(this.normalizeAngle(orientation1.angles.x! - orientation2.angles.x!));
        const dy = Math.abs(this.normalizeAngle(orientation1.angles.y! - orientation2.angles.y!));
        const dz = Math.abs(this.normalizeAngle(orientation1.angles.z! - orientation2.angles.z!));

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Détermine le niveau de difficulté d'une orientation
     * @param {string} orientationType - Type d'orientation
     * @returns {string} Niveau de difficulté (beginner, intermediate, advanced)
     * @private
     */
    private getOrientationDifficulty(orientationType: string): string {
        const { difficulty } = LSF_ORIENTATION_SYSTEM;

        if (difficulty.beginner.includes(orientationType)) return 'beginner';
        if (difficulty.intermediate.includes(orientationType)) return 'intermediate';
        if (difficulty.advanced.includes(orientationType)) return 'advanced';

        return 'intermediate'; // Fallback
    }

    /**
     * Vérifie si une orientation est dans une zone de tolérance acceptable
     * @param {LSFOrientationParameter} orientation - Orientation à vérifier
     * @param {LSFOrientationParameter} reference - Orientation de référence
     * @returns {string} Zone de tolérance (precise, acceptable, approximate, incorrect)
     * @private
     */
    private evaluateOrientationTolerance(orientation: LSFOrientationParameter, reference: LSFOrientationParameter): string {
        const distance = this.calculateAngularDistance(orientation, reference);
        const { toleranceZones } = LSF_ORIENTATION_SYSTEM;

        if (distance <= toleranceZones.precise.threshold) return 'precise';
        if (distance <= toleranceZones.acceptable.threshold) return 'acceptable';
        if (distance <= toleranceZones.approximate.threshold) return 'approximate';
        return 'incorrect';
    }

    /**
     * Applique la transformation par défaut pour les erreurs d'orientation
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const orientation = this.getTargetParameter(content) as LSFOrientationParameter | undefined;
        if (!orientation) {
            this.logger.warn('Aucun paramètre d\'orientation trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(orientation, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${orientation.accuracy}`
        );
    }

    /**
     * Obtient le paramètre d'orientation dans le contenu LSF
     * @param {Record<string, unknown>} content - Contenu LSF
     * @returns {LSFOrientationParameter | undefined} Le paramètre d'orientation ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFOrientationParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        return parameters.orientation;
    }

    /**
     * Obtient des statistiques sur les orientations supportées
     * @returns {object} Statistiques des orientations
     * @public
     */
    public getOrientationStats(): {
        palmOrientations: number;
        rotationAxes: number;
        confusablePairs: number;
        toleranceZones: number;
        difficultyLevels: Record<string, number>;
    } {
        const { palmOrientations, rotationAxes, confusableOrientations, toleranceZones, difficulty } = LSF_ORIENTATION_SYSTEM;

        const totalConfusablePairs = Object.values(confusableOrientations).reduce(
            (sum, level) => sum + Object.keys(level).length, 0
        );

        return {
            palmOrientations: Object.keys(palmOrientations).length,
            rotationAxes: Object.keys(rotationAxes).length,
            confusablePairs: totalConfusablePairs,
            toleranceZones: Object.keys(toleranceZones).length,
            difficultyLevels: {
                beginner: difficulty.beginner.length,
                intermediate: difficulty.intermediate.length,
                advanced: difficulty.advanced.length
            }
        };
    }

    /**
     * Génère un rapport d'analyse d'orientation
     * @param {LSFOrientationParameter} orientation - Paramètre d'orientation
     * @returns {object} Rapport d'analyse
     * @public
     */
    public generateOrientationAnalysis(orientation: LSFOrientationParameter): {
        type: string;
        difficulty: string;
        accuracy: number;
        angles: { x: number; y: number; z: number } | undefined;
        issues: string[];
        recommendations: string[];
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (orientation.accuracy !== undefined && orientation.accuracy < 0.5) {
            issues.push('Précision insuffisante');
            recommendations.push('Améliorer la stabilité de l\'orientation');
        }

        if (orientation.angles) {
            const { x, y, z } = orientation.angles;
            if (Math.abs(x || 0) > 90 || Math.abs(y || 0) > 90 || Math.abs(z || 0) > 90) {
                issues.push('Angles extremes détectés');
                recommendations.push('Vérifier la faisabilité biomécanique');
            }
        }

        if (orientation.type === 'indefinie') {
            issues.push('Orientation non définie');
            recommendations.push('Clarifier l\'orientation cible');
        }

        // Conversion sûre des angles avec valeurs par défaut
        const safeAngles = orientation.angles ? {
            x: orientation.angles.x ?? 0,
            y: orientation.angles.y ?? 0,
            z: orientation.angles.z ?? 0
        } : undefined;

        return {
            type: orientation.type || 'unknown',
            difficulty: orientation.type ? this.getOrientationDifficulty(orientation.type) : 'unknown',
            accuracy: orientation.accuracy || 0,
            angles: safeAngles,
            issues,
            recommendations
        };
    }
}