/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/ProformeTransformer.ts
 * @description Transformateur pour les erreurs de proformes (classificateurs) en LSF
 * @author MetaSign
 * @version 1.2.0
 * @since 2024
 * 
 * Ce module gère les transformations des proformes dans les simulations LSF,
 * en appliquant des erreurs telles que des classificateurs inappropriés, confusions ou usages inconsistants.
 * Il hérite de BaseErrorTransformer pour appliquer des transformations spécifiques
 * basées sur les paramètres de classificateurs définis dans le contenu LSF.
 * 
 * Les proformes (ou classificateurs) sont des signes spéciaux en LSF qui représentent
 * des catégories d'objets par leur forme, taille, texture ou mouvement.
 * 
 * @module ProformeTransformer
 * @requires BaseErrorTransformer
 * @requires ClassifierService
 * @requires ErrorTypes
 * @requires LSFContentTypes
 */

import { BaseErrorTransformer } from './BaseErrorTransformer';
import { ClassifierService } from '../services/ClassifierService';
import {
    ErrorCategoryType,
    ErrorTransformationType
} from '../types/ErrorTypes';
import type {
    ErrorCatalogEntry,
    ErrorTransformation
} from '../types/ErrorTypes';
import type {
    LSFClassifiersParameter,
    LSFParameters
} from '../types/LSFContentTypes';

/**
 * Configuration des transformations d'erreur de proformes
 */
interface ProformeTransformationConfig {
    /** Facteur de réduction de précision par défaut */
    readonly defaultAccuracyReduction: number;
    /** Facteurs de réduction par type d'erreur */
    readonly accuracyReductionFactors: Record<string, number>;
}

/**
 * Transformateur pour les erreurs de proformes (classificateurs)
 * Simule des erreurs telles que des classificateurs inappropriés, confusion entre classificateurs, etc.
 * 
 * @class ProformeTransformer
 * @extends BaseErrorTransformer
 */
export class ProformeTransformer extends BaseErrorTransformer {
    /** Configuration des transformations */
    private static readonly TRANSFORMATION_CONFIG: ProformeTransformationConfig = {
        defaultAccuracyReduction: 0.5,
        accuracyReductionFactors: {
            inappropriate: 0.5,
            confusion: 0.4,
            oversimplification: 0.35,
            omission: 0.6,
            inconsistentUsage: 0.45,
            substitution: 0.4,
            intensity: 0.3
        }
    } as const;

    /**
     * Initialise le transformateur pour les erreurs de proformes
     * @param errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.PROFORME, errorCategory);
    }

    /**
     * Applique une transformation spécifique de proforme
     * @param content - Contenu LSF à modifier
     * @param transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const classifiers = this.getTargetParameter(content);
        if (!classifiers) {
            this.logger.warn('Aucun paramètre de classificateurs trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.INAPPROPRIATE_PROFORME:
                this.applyInappropriateProformeTransformation(classifiers, transform);
                break;

            case ErrorTransformationType.PROFORME_CONFUSION:
                this.applyProformeConfusionTransformation(classifiers, transform);
                break;

            case ErrorTransformationType.EXCESSIVE_SIMPLIFICATION:
                this.applyExcessiveSimplificationTransformation(classifiers, transform);
                break;

            case ErrorTransformationType.PROFORME_OMISSION:
                this.applyProformeOmissionTransformation(classifiers, transform);
                break;

            case ErrorTransformationType.INCONSISTENT_USAGE:
                this.applyInconsistentUsageTransformation(classifiers, transform);
                break;

            case ErrorTransformationType.SUBSTITUTION:
                this.applySubstitutionTransformation(classifiers, transform);
                break;

            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(classifiers, transform);
                }
                break;

            default:
                // Fallback: réduit simplement la précision
                this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.defaultAccuracyReduction);
                break;
        }
    }

    /**
     * Applique une transformation de classificateur inapproprié
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyInappropriateProformeTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        classifiers.inappropriate = true;

        // Peut aussi suggérer un classificateur spécifiquement inapproprié
        if (transform.to && ClassifierService.isValidClassifier(transform.to)) {
            this.logger.debug(`Classificateur inapproprié spécifique appliqué: ${transform.to}`);
        } else {
            // Sélectionne un classificateur inapproprié contextuel
            const inappropriateClassifier = ClassifierService.selectInappropriateClassifier();
            this.logger.debug(`Classificateur inapproprié générique appliqué: ${inappropriateClassifier}`);
        }

        this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.inappropriate);
    }

    /**
     * Applique une transformation de confusion entre classificateurs
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyProformeConfusionTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        classifiers.confusion = true;

        // Simule une confusion spécifique si spécifiée
        if (transform.from && transform.to) {
            this.logger.debug(`Confusion spécifique: ${transform.from} confondu avec ${transform.to}`);
        } else {
            // Génère une confusion plausible
            const confusion = ClassifierService.generatePlausibleConfusion();
            this.logger.debug(`Confusion générée: ${confusion.from} → ${confusion.to}`);
        }

        this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.confusion);
    }

    /**
     * Applique une transformation de simplification excessive
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyExcessiveSimplificationTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        classifiers.oversimplified = true;

        // Réduit la spécificité du classificateur
        const simplificationLevel = transform.factor ?? 0.7;
        this.logger.debug(`Simplification excessive appliquée (niveau: ${simplificationLevel})`);

        this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.oversimplification);
    }

    /**
     * Applique une transformation d'omission de classificateur
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyProformeOmissionTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        classifiers.omission = true;

        // L'omission peut être partielle ou complète
        const omissionSeverity = transform.factor ?? 0.8;
        this.logger.debug(`Omission de classificateur appliquée (sévérité: ${omissionSeverity})`);

        this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.omission);
    }

    /**
     * Applique une transformation d'usage inconsistant
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyInconsistentUsageTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        classifiers.inconsistentUsage = true;

        // L'inconsistance peut varier en intensité
        const inconsistencyLevel = transform.factor ?? 0.6;
        this.logger.debug(`Usage inconsistant appliqué (niveau: ${inconsistencyLevel})`);

        this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.inconsistentUsage);
    }

    /**
     * Applique une transformation de substitution de classificateur
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applySubstitutionTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        if (transform.from && transform.to) {
            this.logger.debug(`Substitution de classificateur: ${transform.from} → ${transform.to}`);

            // Vérifie si la substitution est plausible
            const substitutionQuality = ClassifierService.evaluateSubstitutionQuality(transform.from, transform.to);
            const accuracyImpact = ClassifierService.calculateAccuracyImpact(substitutionQuality);

            this.reduceAccuracy(classifiers, accuracyImpact);
        } else {
            // Substitution aléatoire mais plausible
            const randomSubstitution = ClassifierService.generateRandomSubstitution();
            this.logger.debug(`Substitution aléatoire: ${randomSubstitution.from} → ${randomSubstitution.to}`);
            this.reduceAccuracy(classifiers, ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.substitution);
        }
    }

    /**
     * Applique une transformation d'intensité (modificateur de qualité)
     * @param classifiers - Paramètre de classificateurs
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(
        classifiers: LSFClassifiersParameter,
        transform: ErrorTransformation
    ): void {
        if (transform.factor !== undefined) {
            // L'intensité modifie la qualité globale du classificateur
            const baseReduction = ProformeTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.intensity;
            const qualityReduction = (1 - transform.factor) * baseReduction;
            this.reduceAccuracy(classifiers, qualityReduction);

            this.logger.debug(
                `Transformation d'intensité appliquée (facteur: ${transform.factor}, réduction: ${qualityReduction})`
            );
        }
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre de classificateurs
     * @param classifiers - Paramètre de classificateurs
     * @param reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(classifiers: LSFClassifiersParameter, reduction: number): void {
        const originalAccuracy = classifiers.accuracy ?? 1;
        classifiers.accuracy = Math.max(0, originalAccuracy - reduction);

        this.logger.debug(
            `Précision des classificateurs réduite: ${originalAccuracy} → ${classifiers.accuracy}`
        );
    }

    /**
     * Applique la transformation par défaut pour les erreurs de proformes
     * @param content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const classifiers = this.getTargetParameter(content);
        if (!classifiers) {
            this.logger.warn('Aucun paramètre de classificateurs trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(classifiers, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${classifiers.accuracy}`
        );
    }

    /**
     * Obtient le paramètre de classificateurs dans le contenu LSF
     * @param content - Contenu LSF
     * @returns Le paramètre de classificateurs ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFClassifiersParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        return parameters.classifiers;
    }

    /**
     * Obtient des statistiques sur les classificateurs supportés
     * @returns Statistiques des classificateurs
     * @public
     */
    public getClassifierStats() {
        return ClassifierService.getClassifierStats();
    }

    /**
     * Génère un rapport d'analyse de classificateur
     * @param classifiers - Paramètre de classificateurs
     * @returns Rapport d'analyse
     * @public
     */
    public generateClassifierAnalysis(classifiers: LSFClassifiersParameter) {
        return ClassifierService.generateClassifierAnalysis(classifiers);
    }

    /**
     * Suggère un classificateur approprié pour un objet donné
     * @param objectName - Nom de l'objet
     * @param context - Contexte d'usage
     * @returns Suggestion de classificateur
     * @public
     */
    public suggestClassifier(objectName: string, context: string = 'general') {
        return ClassifierService.suggestClassifier(objectName, context);
    }
}