/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/FacialExpressionTransformer.ts
 * @description Transformateur pour les erreurs d'expressions faciales en LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce module gère les transformations d'expressions faciales dans les simulations LSF,
 * en appliquant des erreurs telles que des expressions manquantes, incorrectes ou désynchronisées.
 * Il hérite de BaseErrorTransformer pour appliquer des transformations spécifiques
 * basées sur les paramètres d'expression faciale définis dans le contenu LSF.
 * 
 * @module FacialExpressionTransformer
 * @requires BaseErrorTransformer
 * @requires ErrorCatalogEntry
 * @requires ErrorCategoryType
 * @requires ErrorTransformation
 * @requires ErrorTransformationType
 * @requires LSFFacialParameter
 * @requires LSFNonManualParameter
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
    LSFFacialParameter,
    LSFNonManualParameter,
    LSFParameters
} from '../types/LSFContentTypes';

/**
 * Transformateur pour les erreurs d'expressions faciales
 * Simule des erreurs telles que des expressions manquantes, incorrectes ou désynchronisées
 * 
 * @class FacialExpressionTransformer
 * @extends BaseErrorTransformer
 */
export class FacialExpressionTransformer extends BaseErrorTransformer {
    /**
     * Initialise le transformateur pour les erreurs d'expressions faciales
     * @param {ErrorCatalogEntry} errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.FACIAL_EXPRESSION, errorCategory);
    }

    /**
     * Applique une transformation spécifique d'expression faciale
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const facial = this.getTargetParameter(content) as LSFFacialParameter | undefined;
        if (!facial) {
            this.logger.warn('Aucun paramètre d\'expression faciale trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(facial, transform);
                }
                break;

            case ErrorTransformationType.OMISSION:
                this.applyOmissionTransformation(facial);
                break;

            case ErrorTransformationType.SUBSTITUTION:
                this.applySubstitutionTransformation(facial);
                break;

            case ErrorTransformationType.DESYNCHRONIZATION:
                if (transform.offset !== undefined) {
                    this.applyDesynchronizationTransformation(facial, transform);
                }
                break;

            default:
                // Si la transformation spécifie une substitution directe
                if (transform.from && transform.to && facial.expression === transform.from) {
                    facial.expression = transform.to;
                    this.logger.debug(`Expression faciale transformée: ${transform.from} → ${transform.to}`);
                } else {
                    // Fallback: réduit simplement la précision
                    this.reduceAccuracy(facial, 0.35);
                }
                break;
        }
    }

    /**
     * Applique une transformation d'intensité à l'expression faciale
     * @param {LSFFacialParameter} facial - Paramètre d'expression faciale
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(facial: LSFFacialParameter, transform: ErrorTransformation): void {
        if (facial.intensity !== undefined && transform.factor !== undefined) {
            const originalIntensity = facial.intensity;
            facial.intensity = Math.max(0, Math.min(1, facial.intensity * transform.factor));
            this.logger.debug(
                `Intensité d'expression faciale modifiée: ${originalIntensity} → ${facial.intensity} (facteur: ${transform.factor})`
            );
        }

        this.reduceAccuracy(facial, 0.35);
    }

    /**
     * Applique une transformation d'omission à l'expression faciale
     * @param {LSFFacialParameter} facial - Paramètre d'expression faciale
     * @private
     */
    private applyOmissionTransformation(facial: LSFFacialParameter): void {
        facial.active = false;
        this.logger.debug('Expression faciale désactivée (omission)');
        this.reduceAccuracy(facial, 0.5);
    }

    /**
     * Applique une transformation de substitution à l'expression faciale
     * @param {LSFFacialParameter} facial - Paramètre d'expression faciale
     * @private
     */
    private applySubstitutionTransformation(facial: LSFFacialParameter): void {
        const originalExpression = facial.expression;

        // Remplace par une expression neutre ou incorrecte
        if (facial.expression && facial.expression !== 'neutre') {
            facial.expression = 'neutre';
            this.logger.debug(`Expression faciale substituée: ${originalExpression} → neutre`);
        } else if (facial.expression === 'neutre') {
            // Si déjà neutre, peut introduire une expression inappropriée
            const inappropriateExpressions = ['surprise', 'confusion', 'interrogation'];
            const randomExpression = inappropriateExpressions[
                Math.floor(Math.random() * inappropriateExpressions.length)
            ];
            facial.expression = randomExpression;
            this.logger.debug(`Expression faciale substituée: neutre → ${randomExpression}`);
        }

        this.reduceAccuracy(facial, 0.35);
    }

    /**
     * Applique une transformation de désynchronisation à l'expression faciale
     * @param {LSFFacialParameter} facial - Paramètre d'expression faciale
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @private
     */
    private applyDesynchronizationTransformation(facial: LSFFacialParameter, transform: ErrorTransformation): void {
        if (!facial.timing) {
            facial.timing = { offset: 0 };
        }

        if (transform.offset !== undefined) {
            const originalOffset = facial.timing.offset || 0;
            facial.timing.offset = originalOffset + transform.offset;
            this.logger.debug(
                `Désynchronisation d'expression faciale: offset ${originalOffset} → ${facial.timing.offset}`
            );
        }

        this.reduceAccuracy(facial, 0.35);
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre facial
     * @param {LSFFacialParameter} facial - Paramètre d'expression faciale
     * @param {number} reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(facial: LSFFacialParameter, reduction: number): void {
        const originalAccuracy = facial.accuracy || 1;
        facial.accuracy = Math.max(0, originalAccuracy - reduction);
        this.logger.debug(`Précision d'expression faciale réduite: ${originalAccuracy} → ${facial.accuracy}`);
    }

    /**
     * Applique la transformation par défaut pour les erreurs d'expressions faciales
     * @param {Record<string, unknown>} content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const facial = this.getTargetParameter(content) as LSFFacialParameter | undefined;
        if (!facial) {
            this.logger.warn('Aucun paramètre d\'expression faciale trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(facial, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${facial.accuracy}`
        );
    }

    /**
     * Obtient le paramètre d'expression faciale dans le contenu LSF
     * @param {Record<string, unknown>} content - Contenu LSF
     * @returns {LSFFacialParameter | undefined} Le paramètre d'expression faciale ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFFacialParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        const nonManual = parameters.nonManual as LSFNonManualParameter | undefined;
        if (!nonManual) {
            return undefined;
        }

        return nonManual.facial;
    }

    /**
     * Vérifie si une expression faciale est valide
     * @param {string} expression - Expression à valider
     * @returns {boolean} true si l'expression est valide
     * @private
     */
    private isValidExpression(expression: string): boolean {
        const validExpressions = [
            'neutre', 'joie', 'tristesse', 'colere', 'surprise',
            'degout', 'peur', 'interrogation', 'negation', 'affirmation',
            'doute', 'concentration', 'fatigue', 'ennui', 'enthousiasme'
        ];
        return validExpressions.includes(expression.toLowerCase());
    }

    /**
     * Obtient une expression alternative pour la substitution
     * @param {string} currentExpression - Expression actuelle
     * @returns {string} Expression alternative
     * @private
     */
    private getAlternativeExpression(currentExpression: string): string {
        const alternatives: Record<string, string[]> = {
            'joie': ['neutre', 'surprise'],
            'tristesse': ['neutre', 'fatigue'],
            'colere': ['neutre', 'concentration'],
            'surprise': ['neutre', 'interrogation'],
            'interrogation': ['neutre', 'doute'],
            'affirmation': ['neutre', 'negation'],
            'negation': ['neutre', 'affirmation']
        };

        const alternativesList = alternatives[currentExpression.toLowerCase()] || ['neutre'];
        return alternativesList[Math.floor(Math.random() * alternativesList.length)];
    }
}