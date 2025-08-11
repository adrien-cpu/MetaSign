/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/HandConfigurationTransformer.ts
 * @description Transformateur pour les erreurs de configuration de main en LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce module gère les transformations des configurations de main dans les simulations LSF,
 * en appliquant des erreurs telles que des formes de main incorrectes, imprécises ou confuses.
 * Il hérite de BaseErrorTransformer pour appliquer des transformations spécifiques
 * basées sur les paramètres de configuration de main définis dans le contenu LSF.
 * 
 * Les erreurs simulées incluent :
 * - Substitution de formes de main (ex: poing → main plate)
 * - Réduction de précision gestuelle
 * - Configuration partiellement incorrecte
 * - Confusion entre formes similaires
 * 
 * @module HandConfigurationTransformer
 * @requires BaseErrorTransformer
 * @requires ErrorCatalogEntry
 * @requires ErrorCategoryType
 * @requires ErrorTransformation
 * @requires ErrorTransformationType
 * @requires LSFHandshapeParameter
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
    LSFHandshapeParameter,
    LSFParameters
} from '../types/LSFContentTypes';

/**
 * Mapping des configurations de main LSF communes
 * Utilisé pour les substitutions intelligentes
 */
const HAND_CONFIGURATIONS = {
    // Configurations de base
    basic: ['main_plate', 'poing', 'index', 'ok', 'victoire'] as const,

    // Configurations similaires pouvant être confondues
    confusable: {
        'index': ['majeur', 'auriculaire'],
        'ok': ['pince', 'c'],
        'victoire': ['corne', 'y'],
        'main_plate': ['b', 'four'],
        'poing': ['a', 's']
    } as const,

    // Configurations par niveau de difficulté
    difficulty: {
        beginner: ['main_plate', 'poing', 'index', 'ok'] as const,
        intermediate: ['victoire', 'corne', 'y', 'c', 'pince'] as const,
        advanced: ['w', 'q', 'x', 'z', 'classificateur'] as const
    } as const,

    // Liste complète pour les vérifications
    all: [
        'main_plate', 'poing', 'index', 'ok', 'victoire',
        'majeur', 'auriculaire', 'pince', 'c', 'corne', 'y',
        'b', 'four', 'a', 's', 'w', 'q', 'x', 'z', 'classificateur',
        'indefinie'
    ] as const
} as const;

/**
 * Transformateur pour les erreurs de configuration de main
 * Simule des erreurs telles que des formes de main incorrectes, imprécises ou confuses
 * 
 * @class HandConfigurationTransformer
 * @extends BaseErrorTransformer
 */
export class HandConfigurationTransformer extends BaseErrorTransformer {
    /**
     * Initialise le transformateur pour les erreurs de configuration de main
     * @param {ErrorCatalogEntry} errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.HAND_CONFIGURATION, errorCategory);
    }

    /**
     * Applique une transformation spécifique de configuration de main
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const handshape = this.getTargetParameter(content) as LSFHandshapeParameter | undefined;
        if (!handshape) {
            this.logger.warn('Aucun paramètre de configuration de main trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.SUBSTITUTION:
                this.applySubstitutionTransformation(handshape, transform);
                break;

            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(handshape, transform);
                }
                break;

            case ErrorTransformationType.OMISSION:
                this.applyOmissionTransformation(handshape);
                break;

            default:
                // Si la transformation spécifie une substitution directe
                if (transform.from && transform.to && handshape.type === transform.from) {
                    this.applyDirectSubstitution(handshape, transform.from, transform.to);
                } else {
                    // Fallback: réduit simplement la précision
                    this.reduceAccuracy(handshape, 0.3);
                }
                break;
        }
    }

    /**
     * Applique une transformation de substitution de configuration de main
     * @param {LSFHandshapeParameter} handshape - Paramètre de configuration de main
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applySubstitutionTransformation(handshape: LSFHandshapeParameter, transform: ErrorTransformation): void {
        const originalType = handshape.type;

        if (transform.from && transform.to && handshape.type === transform.from) {
            // Substitution directe spécifiée
            this.applyDirectSubstitution(handshape, transform.from, transform.to);
        } else if (originalType) {
            // Substitution intelligente basée sur la confusion
            const confusableConfig = this.getConfusableConfiguration(originalType);
            if (confusableConfig) {
                this.applyDirectSubstitution(handshape, originalType, confusableConfig);
            } else {
                // Fallback vers une configuration de base
                const fallbackConfig = this.getFallbackConfiguration(originalType);
                this.applyDirectSubstitution(handshape, originalType, fallbackConfig);
            }
        }

        this.reduceAccuracy(handshape, 0.4);
    }

    /**
     * Applique une transformation d'intensité (précision réduite)
     * @param {LSFHandshapeParameter} handshape - Paramètre de configuration de main
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(handshape: LSFHandshapeParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            const reduction = 1 - transform.factor;
            this.reduceAccuracy(handshape, reduction);

            this.logger.debug(
                `Intensité de configuration de main réduite par facteur ${transform.factor}: précision = ${handshape.accuracy}`
            );
        }
    }

    /**
     * Applique une transformation d'omission (configuration manquante)
     * @param {LSFHandshapeParameter} handshape - Paramètre de configuration de main
     * @private
     */
    private applyOmissionTransformation(handshape: LSFHandshapeParameter): void {
        // Marque la configuration comme indéfinie ou neutre
        handshape.type = 'indefinie';
        this.reduceAccuracy(handshape, 0.7);

        this.logger.debug('Configuration de main omise - type défini comme "indefinie"');
    }

    /**
     * Applique une substitution directe de configuration
     * @param {LSFHandshapeParameter} handshape - Paramètre de configuration de main
     * @param {string} from - Configuration source
     * @param {string} to - Configuration cible
     * @private
     */
    private applyDirectSubstitution(handshape: LSFHandshapeParameter, from: string, to: string): void {
        handshape.type = to;
        this.reduceAccuracy(handshape, 0.5);

        this.logger.debug(`Configuration de main transformée: ${from} → ${to}`);
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre de configuration de main
     * @param {LSFHandshapeParameter} handshape - Paramètre de configuration de main
     * @param {number} reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(handshape: LSFHandshapeParameter, reduction: number): void {
        const originalAccuracy = handshape.accuracy || 1;
        handshape.accuracy = Math.max(0, originalAccuracy - reduction);

        this.logger.debug(
            `Précision de configuration de main réduite: ${originalAccuracy} → ${handshape.accuracy}`
        );
    }

    /**
     * Obtient une configuration confusable pour une configuration donnée
     * @param {string} originalType - Type de configuration original
     * @returns {string | undefined} Configuration confusable ou undefined
     * @private
     */
    private getConfusableConfiguration(originalType: string): string | undefined {
        const confusableList = HAND_CONFIGURATIONS.confusable[
            originalType as keyof typeof HAND_CONFIGURATIONS.confusable
        ];

        if (confusableList && confusableList.length > 0) {
            return confusableList[Math.floor(Math.random() * confusableList.length)];
        }

        return undefined;
    }

    /**
     * Obtient une configuration de fallback pour une configuration donnée
     * @param {string} originalType - Type de configuration original
     * @returns {string} Configuration de fallback
     * @private
     */
    private getFallbackConfiguration(originalType: string): string {
        // Évite de retourner la même configuration
        const basicConfigs = (HAND_CONFIGURATIONS.basic as readonly string[])
            .filter(config => config !== originalType);
        return basicConfigs[Math.floor(Math.random() * basicConfigs.length)] || 'main_plate';
    }

    /**
     * Détermine le niveau de difficulté d'une configuration
     * @param {string} configurationType - Type de configuration
     * @returns {string} Niveau de difficulté (beginner, intermediate, advanced)
     * @private
     */
    private getConfigurationDifficulty(configurationType: string): string {
        const { difficulty } = HAND_CONFIGURATIONS;

        if ((difficulty.beginner as readonly string[]).includes(configurationType)) return 'beginner';
        if ((difficulty.intermediate as readonly string[]).includes(configurationType)) return 'intermediate';
        if ((difficulty.advanced as readonly string[]).includes(configurationType)) return 'advanced';

        return 'intermediate'; // Fallback
    }

    /**
     * Vérifie si une configuration de main est valide
     * @param {string} configurationType - Type de configuration à valider
     * @returns {boolean} true si la configuration est valide
     * @private
     */
    private isValidConfiguration(configurationType: string): boolean {
        return (HAND_CONFIGURATIONS.all as readonly string[]).includes(configurationType);
    }

    /**
     * Applique la transformation par défaut pour les erreurs de configuration de main
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const handshape = this.getTargetParameter(content) as LSFHandshapeParameter | undefined;
        if (!handshape) {
            this.logger.warn('Aucun paramètre de configuration de main trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(handshape, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${handshape.accuracy}`
        );
    }

    /**
     * Obtient le paramètre de configuration de main dans le contenu LSF
     * @param {Record<string, unknown>} content - Contenu LSF
     * @returns {LSFHandshapeParameter | undefined} Le paramètre de configuration de main ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFHandshapeParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        return parameters.handshape;
    }

    /**
     * Obtient des statistiques sur les configurations de main supportées
     * @returns {object} Statistiques des configurations
     * @public
     */
    public getConfigurationStats(): {
        totalConfigurations: number;
        byDifficulty: Record<string, number>;
        confusablePairs: number;
    } {
        const { basic, confusable, difficulty } = HAND_CONFIGURATIONS;

        // Créer un Set de toutes les configurations uniques
        const allConfigsSet = new Set([
            ...(basic as readonly string[]),
            ...Object.values(confusable).flat(),
            ...(difficulty.beginner as readonly string[]),
            ...(difficulty.intermediate as readonly string[]),
            ...(difficulty.advanced as readonly string[])
        ]);

        return {
            totalConfigurations: allConfigsSet.size,
            byDifficulty: {
                beginner: difficulty.beginner.length,
                intermediate: difficulty.intermediate.length,
                advanced: difficulty.advanced.length
            },
            confusablePairs: Object.keys(confusable).length
        };
    }
}