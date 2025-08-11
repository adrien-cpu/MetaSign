/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/MovementTransformer.ts
 * @description Transformateur pour les erreurs de mouvement en LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce module gère les transformations des mouvements dans les simulations LSF,
 * en appliquant des erreurs telles que des amplitudes, directions, répétitions ou dynamiques incorrectes.
 * Il hérite de BaseErrorTransformer pour appliquer des transformations spécifiques
 * basées sur les paramètres de mouvement définis dans le contenu LSF.
 * 
 * Les erreurs simulées incluent :
 * - Modification d'amplitude (trop fort/faible)
 * - Erreurs de direction et trajectoire
 * - Répétitions incorrectes ou manquantes
 * - Problèmes de vitesse et accélération
 * - Dysfonctionnements de synchronisation
 * - Perturbations de fluidité gestuelle
 * 
 * @module MovementTransformer
 * @requires BaseErrorTransformer
 * @requires ErrorCatalogEntry
 * @requires ErrorCategoryType
 * @requires ErrorTransformation
 * @requires ErrorTransformationType
 * @requires LSFMovementParameter
 * @requires LSFDirectionParameter
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
    LSFMovementParameter,
    LSFParameters
} from '../types/LSFContentTypes';

/**
 * Système de cinématique et dynamique LSF
 * Définit les caractéristiques des mouvements en langue des signes
 */
const LSF_MOVEMENT_SYSTEM = {
    // Types de mouvements fondamentaux
    movementTypes: {
        linear: {
            name: 'lineaire',
            characteristics: ['straight', 'direct', 'unidirectional'],
            commonErrors: ['deviation', 'curvature', 'hesitation']
        },
        circular: {
            name: 'circulaire',
            characteristics: ['rotation', 'arc', 'orbital'],
            commonErrors: ['incomplete_circle', 'irregular_radius', 'wrong_direction']
        },
        oscillating: {
            name: 'oscillant',
            characteristics: ['back_forth', 'pendulum', 'vibration'],
            commonErrors: ['irregular_frequency', 'amplitude_decay', 'asymmetry']
        },
        complex: {
            name: 'complexe',
            characteristics: ['combined', 'sequential', 'coordinated'],
            commonErrors: ['timing_mismatch', 'incomplete_sequence', 'coordination_loss']
        }
    },

    // Directions cardinales et leurs variations
    directions: {
        cardinal: {
            up: { degrees: 0, vector: [0, 1, 0] },
            down: { degrees: 180, vector: [0, -1, 0] },
            left: { degrees: 270, vector: [-1, 0, 0] },
            right: { degrees: 90, vector: [1, 0, 0] },
            forward: { degrees: 0, vector: [0, 0, 1] },
            backward: { degrees: 180, vector: [0, 0, -1] }
        },
        diagonal: {
            up_left: { degrees: 315, vector: [-0.707, 0.707, 0] },
            up_right: { degrees: 45, vector: [0.707, 0.707, 0] },
            down_left: { degrees: 225, vector: [-0.707, -0.707, 0] },
            down_right: { degrees: 135, vector: [0.707, -0.707, 0] }
        }
    },

    // Paramètres dynamiques du mouvement
    dynamics: {
        amplitude: {
            micro: { range: [0.01, 0.05], description: 'Mouvement très fin' },
            small: { range: [0.05, 0.15], description: 'Petit mouvement' },
            medium: { range: [0.15, 0.35], description: 'Mouvement moyen' },
            large: { range: [0.35, 0.65], description: 'Grand mouvement' },
            macro: { range: [0.65, 1.0], description: 'Mouvement maximal' }
        },
        speed: {
            very_slow: { multiplier: 0.3, description: 'Très lent' },
            slow: { multiplier: 0.6, description: 'Lent' },
            normal: { multiplier: 1.0, description: 'Normal' },
            fast: { multiplier: 1.5, description: 'Rapide' },
            very_fast: { multiplier: 2.5, description: 'Très rapide' }
        },
        fluidity: {
            jerky: { smoothness: 0.2, description: 'Saccadé' },
            hesitant: { smoothness: 0.4, description: 'Hésitant' },
            smooth: { smoothness: 0.8, description: 'Fluide' },
            flowing: { smoothness: 1.0, description: 'Coulant' }
        }
    },

    // Erreurs communes par type de mouvement
    commonErrors: {
        amplitude: ['overshooting', 'undershooting', 'inconsistent_size'],
        direction: ['angle_deviation', 'wrong_plane', 'trajectory_drift'],
        repetition: ['missed_repetitions', 'extra_repetitions', 'irregular_timing'],
        speed: ['too_fast', 'too_slow', 'inconsistent_pace'],
        coordination: ['hand_mismatch', 'timing_offset', 'incomplete_movement']
    },

    // Niveaux de difficulté pour les mouvements
    difficulty: {
        beginner: ['linear', 'simple_arc', 'single_direction'],
        intermediate: ['circular', 'diagonal', 'repeated_patterns'],
        advanced: ['complex_trajectory', 'multi_directional', 'coordinated_sequences']
    }
};

/**
 * Transformateur pour les erreurs de mouvement
 * Simule des erreurs telles que des amplitudes, directions, répétitions ou dynamiques incorrectes
 * 
 * @class MovementTransformer
 * @extends BaseErrorTransformer
 */
export class MovementTransformer extends BaseErrorTransformer {
    /**
     * Initialise le transformateur pour les erreurs de mouvement
     * @param {ErrorCatalogEntry} errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.MOVEMENT, errorCategory);
    }

    /**
     * Applique une transformation spécifique de mouvement
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const movement = this.getTargetParameter(content) as LSFMovementParameter | undefined;
        if (!movement) {
            this.logger.warn('Aucun paramètre de mouvement trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.AMPLITUDE:
                if (transform.factor !== undefined) {
                    this.applyAmplitudeTransformation(movement, transform);
                }
                break;

            case ErrorTransformationType.DIRECTION:
                if (transform.degrees !== undefined || transform.rotation) {
                    this.applyDirectionTransformation(movement, transform);
                }
                break;

            case ErrorTransformationType.REPETITION:
                if (transform.factor !== undefined) {
                    this.applyRepetitionTransformation(movement, transform);
                }
                break;

            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(movement, transform);
                }
                break;

            case ErrorTransformationType.OMISSION:
                this.applyOmissionTransformation(movement);
                break;

            case ErrorTransformationType.FLUIDITY:
                if (transform.factor !== undefined) {
                    this.applyFluidityTransformation(movement, transform);
                }
                break;

            case ErrorTransformationType.ACCELERATION:
                if (transform.factor !== undefined) {
                    this.applyAccelerationTransformation(movement, transform);
                }
                break;

            case ErrorTransformationType.DECELERATION:
                if (transform.factor !== undefined) {
                    this.applyDecelerationTransformation(movement, transform);
                }
                break;

            default:
                // Fallback: réduit simplement la précision
                this.reduceAccuracy(movement, 0.3);
                break;
        }
    }

    /**
     * Applique une transformation d'amplitude au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyAmplitudeTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        const originalAmplitude = movement.amplitude;
        const originalDistance = movement.distance;

        if (movement.amplitude !== undefined && transform.factor !== undefined) {
            movement.amplitude = Math.max(0, Math.min(1, movement.amplitude * transform.factor));
            this.logger.debug(
                `Amplitude modifiée: ${originalAmplitude} → ${movement.amplitude} (facteur: ${transform.factor})`
            );
        }

        // Modifie également la distance si elle existe
        if (movement.distance !== undefined && transform.factor !== undefined) {
            movement.distance = Math.max(0, movement.distance * transform.factor);
            this.logger.debug(
                `Distance modifiée: ${originalDistance} → ${movement.distance} (facteur: ${transform.factor})`
            );
        }

        this.reduceAccuracy(movement, 0.3);
    }

    /**
     * Applique une transformation de direction au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyDirectionTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        if (!movement.direction) {
            movement.direction = { deviation: 0 };
        }

        let deviationToAdd = 0;

        if (transform.degrees !== undefined) {
            deviationToAdd = transform.degrees;
        } else if (transform.rotation) {
            // Convertit les rotations nommées en degrés
            const rotationMap: Record<string, number> = {
                'slight_left': -15,
                'slight_right': 15,
                'left': -45,
                'right': 45,
                'sharp_left': -90,
                'sharp_right': 90,
                'reverse': 180
            };
            deviationToAdd = rotationMap[transform.rotation] || 0;
        }

        if (deviationToAdd !== 0) {
            const originalDeviation = movement.direction.deviation || 0;
            movement.direction.deviation = originalDeviation + deviationToAdd;

            // Normalise l'angle entre -180 et 180
            while (movement.direction.deviation > 180) movement.direction.deviation -= 360;
            while (movement.direction.deviation <= -180) movement.direction.deviation += 360;

            this.logger.debug(
                `Déviation de direction: ${originalDeviation}° → ${movement.direction.deviation}° (ajout: ${deviationToAdd}°)`
            );
        }

        this.reduceAccuracy(movement, 0.35);
    }

    /**
     * Applique une transformation de répétition au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyRepetitionTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        if (movement.repetitions !== undefined && transform.factor !== undefined) {
            const originalRepetitions = movement.repetitions;

            // Modifie le nombre de répétitions avec validation
            const newRepetitions = Math.round(movement.repetitions * transform.factor);
            movement.repetitions = Math.max(0, Math.min(10, newRepetitions)); // Limite entre 0 et 10

            this.logger.debug(
                `Répétitions modifiées: ${originalRepetitions} → ${movement.repetitions} (facteur: ${transform.factor})`
            );
        }

        this.reduceAccuracy(movement, 0.25);
    }

    /**
     * Applique une transformation d'intensité au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // Affecte l'amplitude proportionnellement à l'intensité
            if (movement.amplitude !== undefined) {
                const originalAmplitude = movement.amplitude;
                movement.amplitude = Math.max(0, Math.min(1, movement.amplitude * transform.factor));

                this.logger.debug(
                    `Intensité modifiée - Amplitude: ${originalAmplitude} → ${movement.amplitude}`
                );
            }

            // Affecte aussi la distance si présente
            if (movement.distance !== undefined) {
                movement.distance *= transform.factor;
            }

            this.reduceAccuracy(movement, (1 - transform.factor) * 0.5);
        }
    }

    /**
     * Applique une transformation d'omission au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @private
     */
    private applyOmissionTransformation(movement: LSFMovementParameter): void {
        // Réduit drastiquement l'amplitude pour simuler un mouvement absent
        movement.amplitude = (movement.amplitude || 1) * 0.1;
        movement.distance = (movement.distance || 1) * 0.1;

        this.reduceAccuracy(movement, 0.8);

        this.logger.debug('Mouvement omis - amplitude et distance réduites drastiquement');
    }

    /**
     * Applique une transformation de fluidité au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyFluidityTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // Simule une perte de fluidité en introduisant des irrégularités
            const fluidityLoss = 1 - transform.factor;

            // Peut affecter la direction avec des micro-déviations
            if (movement.direction) {
                const microDeviation = (Math.random() - 0.5) * fluidityLoss * 10;
                movement.direction.deviation = (movement.direction.deviation || 0) + microDeviation;
            }

            this.reduceAccuracy(movement, fluidityLoss * 0.4);

            this.logger.debug(
                `Fluidité réduite par facteur ${transform.factor} - Perte de fluidité: ${fluidityLoss}`
            );
        }
    }

    /**
     * Applique une transformation d'accélération au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyAccelerationTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // Simule une accélération incorrecte
            // Peut affecter l'amplitude et la précision
            if (movement.amplitude !== undefined) {
                // Une accélération trop forte peut dépasser l'amplitude prévue
                const amplificationFactor = 1 + (transform.factor - 1) * 0.5;
                movement.amplitude = Math.min(1, movement.amplitude * amplificationFactor);
            }

            this.reduceAccuracy(movement, Math.abs(transform.factor - 1) * 0.3);

            this.logger.debug(`Accélération appliquée avec facteur ${transform.factor}`);
        }
    }

    /**
     * Applique une transformation de décélération au mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyDecelerationTransformation(movement: LSFMovementParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // Simule une décélération incorrecte
            // Peut rendre le mouvement incomplet
            if (movement.amplitude !== undefined) {
                // Une décélération trop forte peut réduire l'amplitude finale
                const reductionFactor = transform.factor;
                movement.amplitude *= reductionFactor;
            }

            if (movement.distance !== undefined) {
                movement.distance *= transform.factor;
            }

            this.reduceAccuracy(movement, (1 - transform.factor) * 0.4);

            this.logger.debug(`Décélération appliquée avec facteur ${transform.factor}`);
        }
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre de mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @param {number} reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(movement: LSFMovementParameter, reduction: number): void {
        const originalAccuracy = movement.accuracy || 1;
        movement.accuracy = Math.max(0, originalAccuracy - reduction);

        this.logger.debug(
            `Précision de mouvement réduite: ${originalAccuracy} → ${movement.accuracy}`
        );
    }

    /**
     * Analyse la complexité d'un mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @returns {string} Niveau de complexité (simple, moderate, complex)
     * @private
     */
    private analyzeMovementComplexity(movement: LSFMovementParameter): string {
        let complexityScore = 0;

        // Facteurs de complexité
        if (movement.repetitions && movement.repetitions > 1) complexityScore += 1;
        if (movement.direction && movement.direction.deviation !== 0) complexityScore += 1;
        if (movement.amplitude && movement.amplitude > 0.7) complexityScore += 1;
        if (movement.distance && movement.distance > 0.5) complexityScore += 1;

        if (complexityScore <= 1) return 'simple';
        if (complexityScore <= 2) return 'moderate';
        return 'complex';
    }

    /**
     * Vérifie si un mouvement est physiquement réalisable
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @returns {boolean} true si le mouvement est réalisable
     * @private
     */
    private isMovementFeasible(movement: LSFMovementParameter): boolean {
        // Vérifications de faisabilité
        if (movement.amplitude !== undefined && (movement.amplitude < 0 || movement.amplitude > 1)) {
            return false;
        }

        if (movement.distance !== undefined && movement.distance < 0) {
            return false;
        }

        if (movement.repetitions !== undefined && (movement.repetitions < 0 || movement.repetitions > 20)) {
            return false;
        }

        return true;
    }

    /**
     * Applique la transformation par défaut pour les erreurs de mouvement
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const movement = this.getTargetParameter(content) as LSFMovementParameter | undefined;
        if (!movement) {
            this.logger.warn('Aucun paramètre de mouvement trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(movement, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${movement.accuracy}`
        );
    }

    /**
     * Obtient le paramètre de mouvement dans le contenu LSF
     * @param {Record<string, unknown>} content - Contenu LSF
     * @returns {LSFMovementParameter | undefined} Le paramètre de mouvement ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFMovementParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        return parameters.movement;
    }

    /**
     * Obtient des statistiques sur les types de mouvements supportés
     * @returns {object} Statistiques des mouvements
     * @public
     */
    public getMovementStats(): {
        movementTypes: number;
        directions: number;
        amplitudeLevels: number;
        speedLevels: number;
        commonErrors: number;
    } {
        const { movementTypes, directions, dynamics, commonErrors } = LSF_MOVEMENT_SYSTEM;

        return {
            movementTypes: Object.keys(movementTypes).length,
            directions: Object.keys(directions.cardinal).length + Object.keys(directions.diagonal).length,
            amplitudeLevels: Object.keys(dynamics.amplitude).length,
            speedLevels: Object.keys(dynamics.speed).length,
            commonErrors: Object.values(commonErrors).flat().length
        };
    }

    /**
     * Calcule la magnitude vectorielle d'un mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @returns {number} Magnitude du mouvement
     * @public
     */
    public calculateMovementMagnitude(movement: LSFMovementParameter): number {
        let magnitude = 0;

        if (movement.amplitude !== undefined) {
            magnitude += movement.amplitude * movement.amplitude;
        }

        if (movement.distance !== undefined) {
            magnitude += movement.distance * movement.distance;
        }

        return Math.sqrt(magnitude);
    }

    /**
     * Génère un rapport d'analyse de mouvement
     * @param {LSFMovementParameter} movement - Paramètre de mouvement
     * @returns {object} Rapport d'analyse
     * @public
     */
    public generateMovementAnalysis(movement: LSFMovementParameter): {
        complexity: string;
        feasible: boolean;
        magnitude: number;
        accuracy: number;
        issues: string[];
    } {
        const issues: string[] = [];

        if (!this.isMovementFeasible(movement)) {
            issues.push('Mouvement non réalisable');
        }

        if (movement.accuracy !== undefined && movement.accuracy < 0.5) {
            issues.push('Précision insuffisante');
        }

        if (movement.direction && Math.abs(movement.direction.deviation || 0) > 45) {
            issues.push('Déviation directionnelle importante');
        }

        return {
            complexity: this.analyzeMovementComplexity(movement),
            feasible: this.isMovementFeasible(movement),
            magnitude: this.calculateMovementMagnitude(movement),
            accuracy: movement.accuracy || 1,
            issues
        };
    }
}