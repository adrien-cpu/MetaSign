/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/BaseErrorTransformer.ts
 * @description Transformateur de base pour l'application d'erreurs LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 */

import { Logger } from '@/ai/utils/Logger';
import {
    AppliedError,
    ErrorCategoryType,
    ErrorTransformation,
    ErrorCatalogEntry
} from '../types/ErrorTypes';
import { LSFContent } from '../types/LSFContentTypes';

/**
 * Classe de base abstraite pour les transformateurs d'erreurs
 * Fournit les méthodes communes pour tous les transformateurs d'erreurs spécifiques
 */
export abstract class BaseErrorTransformer {
    protected logger: Logger;
    protected errorCategory: ErrorCatalogEntry;
    protected errorType: ErrorCategoryType;

    /**
     * Initialise le transformateur d'erreurs
     * @param errorType Type d'erreur géré par ce transformateur
     * @param errorCategory Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorType: ErrorCategoryType, errorCategory: ErrorCatalogEntry) {
        this.errorType = errorType;
        this.errorCategory = errorCategory;
        this.logger = new Logger(`${this.constructor.name}`);
    }

    /**
     * Applique une transformation d'erreur au contenu LSF
     * @param content Contenu LSF à modifier
     * @param transform Transformation spécifique à appliquer
     * @returns Contenu modifié avec l'erreur appliquée
     */
    public applyTransformation(content: LSFContent, transform: ErrorTransformation): LSFContent {
        try {
            // Si le contenu est une chaîne, on ne peut pas le modifier
            if (typeof content === 'string') {
                return content;
            }

            // Clone le contenu pour éviter de modifier l'original
            const modifiedContent = { ...content };

            // Ajoute une trace de l'erreur appliquée (pour le débogage)
            this.addAppliedErrorTrace(modifiedContent, transform);

            // Applique la transformation spécifique (implémentée par les sous-classes)
            this.applySpecificTransformation(modifiedContent, transform);

            return modifiedContent;
        } catch (error) {
            this.logger.error(`Erreur lors de l'application de la transformation: ${error instanceof Error ? error.message : String(error)}`);
            return content;
        }
    }

    /**
     * Applique la transformation par défaut pour ce type d'erreur
     * @param content Contenu LSF à modifier
     * @returns Contenu modifié avec l'erreur par défaut appliquée
     */
    public applyDefaultTransformation(content: LSFContent): LSFContent {
        try {
            // Si le contenu est une chaîne, on ne peut pas le modifier
            if (typeof content === 'string') {
                return content;
            }

            // Clone le contenu pour éviter de modifier l'original
            const modifiedContent = { ...content };

            // Ajoute une trace de l'erreur appliquée (pour le débogage)
            this.addDefaultErrorTrace(modifiedContent);

            // Applique la transformation par défaut (implémentée par les sous-classes)
            this.applySpecificDefaultTransformation(modifiedContent);

            return modifiedContent;
        } catch (error) {
            this.logger.error(`Erreur lors de l'application de la transformation par défaut: ${error instanceof Error ? error.message : String(error)}`);
            return content;
        }
    }

    /**
     * Vérifie si le contenu peut être traité par ce transformateur
     * @param content Contenu LSF à vérifier
     * @returns true si le contenu peut être traité, false sinon
     */
    public canTransform(content: LSFContent): boolean {
        // Si le contenu est une chaîne, on ne peut pas le transformer
        if (typeof content === 'string') {
            return false;
        }

        // Implémentation par défaut - peut être surchargée par les sous-classes
        return this.getTargetParameter(content) !== undefined;
    }

    /**
     * Obtient les transformations disponibles pour ce type d'erreur
     * @returns Liste des transformations disponibles
     */
    public getAvailableTransformations(): ErrorTransformation[] {
        return this.errorCategory.transformations;
    }

    /**
     * Sélectionne une transformation aléatoire selon les probabilités
     * @returns Transformation sélectionnée ou undefined si aucune n'est disponible
     */
    public selectRandomTransformation(): ErrorTransformation | undefined {
        const transformations = this.getAvailableTransformations();

        if (transformations.length === 0) {
            return undefined;
        }

        // Calcule la somme des probabilités
        const totalProbability = transformations.reduce((sum, transform) => sum + transform.probability, 0);

        if (totalProbability === 0) {
            return undefined;
        }

        // Sélectionne aléatoirement selon les probabilités
        const random = Math.random() * totalProbability;
        let currentSum = 0;

        for (const transformation of transformations) {
            currentSum += transformation.probability;
            if (random <= currentSum) {
                return transformation;
            }
        }

        // Fallback - retourne la dernière transformation
        return transformations[transformations.length - 1];
    }

    /**
     * Méthode abstraite pour appliquer une transformation spécifique
     * Doit être implémentée par chaque sous-classe
     * @param content Contenu LSF à modifier (déjà vérifié comme n'étant pas une chaîne)
     * @param transform Transformation à appliquer
     */
    protected abstract applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void;

    /**
     * Méthode abstraite pour appliquer la transformation par défaut
     * Doit être implémentée par chaque sous-classe
     * @param content Contenu LSF à modifier (déjà vérifié comme n'étant pas une chaîne)
     */
    protected abstract applySpecificDefaultTransformation(content: Record<string, unknown>): void;

    /**
     * Méthode abstraite pour obtenir le paramètre cible sur lequel appliquer la transformation
     * @param content Contenu LSF (déjà vérifié comme n'étant pas une chaîne)
     * @returns Le paramètre cible ou undefined s'il n'existe pas
     */
    protected abstract getTargetParameter(content: Record<string, unknown>): unknown | undefined;

    /**
     * Applique une valeur avec validation
     * @param content Contenu à modifier
     * @param key Clé du paramètre à modifier
     * @param value Nouvelle valeur
     * @param validator Fonction de validation optionnelle
     * @protected
     */
    protected applyValueWithValidation(
        content: Record<string, unknown>,
        key: string,
        value: unknown,
        validator?: (value: unknown) => boolean
    ): void {
        if (validator && !validator(value)) {
            this.logger.warn(`Valeur ${value} invalide pour la clé ${key}, transformation ignorée`);
            return;
        }

        content[key] = value;
    }

    /**
     * Applique un facteur multiplicatif à une valeur numérique
     * @param content Contenu à modifier
     * @param key Clé du paramètre numérique
     * @param factor Facteur multiplicatif
     * @protected
     */
    protected applyNumericFactor(content: Record<string, unknown>, key: string, factor: number): void {
        const currentValue = content[key];

        if (typeof currentValue === 'number') {
            content[key] = currentValue * factor;
        } else {
            this.logger.warn(`Impossible d'appliquer le facteur ${factor} à la valeur non-numérique ${currentValue} pour la clé ${key}`);
        }
    }

    /**
     * Applique un offset à une valeur numérique
     * @param content Contenu à modifier
     * @param key Clé du paramètre numérique
     * @param offset Offset à ajouter
     * @protected
     */
    protected applyNumericOffset(content: Record<string, unknown>, key: string, offset: number): void {
        const currentValue = content[key];

        if (typeof currentValue === 'number') {
            content[key] = currentValue + offset;
        } else {
            this.logger.warn(`Impossible d'appliquer l'offset ${offset} à la valeur non-numérique ${currentValue} pour la clé ${key}`);
        }
    }

    /**
     * Ajoute une trace de l'erreur appliquée au contenu (pour le débogage)
     * @param content Contenu LSF (déjà vérifié comme n'étant pas une chaîne)
     * @param transform Transformation appliquée
     * @private
     */
    private addAppliedErrorTrace(content: Record<string, unknown>, transform: ErrorTransformation): void {
        if (!content.appliedErrors) {
            content.appliedErrors = [];
        }

        const appliedErrors = content.appliedErrors as AppliedError[];
        const appliedError: AppliedError = {
            type: this.errorType,
            transformation: transform,
            timestamp: new Date().toISOString()
        };

        appliedErrors.push(appliedError);
    }

    /**
     * Ajoute une trace de l'erreur par défaut appliquée au contenu (pour le débogage)
     * @param content Contenu LSF (déjà vérifié comme n'étant pas une chaîne)
     * @private
     */
    private addDefaultErrorTrace(content: Record<string, unknown>): void {
        if (!content.appliedErrors) {
            content.appliedErrors = [];
        }

        const appliedErrors = content.appliedErrors as AppliedError[];
        const appliedError: AppliedError = {
            type: this.errorType,
            transformation: 'default',
            severity: this.errorCategory.defaultTransformation.severity,
            description: this.errorCategory.defaultTransformation.description,
            timestamp: new Date().toISOString()
        };

        appliedErrors.push(appliedError);
    }
}