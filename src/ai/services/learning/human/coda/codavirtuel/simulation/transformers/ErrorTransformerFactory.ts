/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/ErrorTransformerFactory.ts
 * @description Fabrique de transformateurs d'erreurs pour la simulation LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * Cette fabrique centralise la création des transformateurs d'erreurs
 * pour les différents types d'erreurs dans la simulation LSF.
 * Elle permet de récupérer facilement un transformateur spécifique
 * en fonction du type d'erreur, simplifiant ainsi la logique du simulateur principal.
 * @module ErrorTransformerFactory
 * @requires Logger
 * @requires ERROR_CATALOG
 * @requires BaseErrorTransformer
 * @requires HandConfigurationTransformer
 * @requires LocationTransformer
 * @requires MovementTransformer
 * @requires OrientationTransformer
 * @requires FacialExpressionTransformer
 * @requires RhythmTransformer
 * @requires SyntacticSpaceTransformer
 * @requires SignOrderTransformer
 * @requires SpatialReferenceTransformer
 * @requires ProformeTransformer        
 */

import { Logger } from '@/ai/utils/Logger';
import { ERROR_CATALOG } from '../catalogs/ErrorCatalog';
import { BaseErrorTransformer } from './BaseErrorTransformer';
import { ErrorCategoryType } from '../types/ErrorTypes';
import {
    HandConfigurationTransformer,
    LocationTransformer,
    MovementTransformer,
    OrientationTransformer,
    FacialExpressionTransformer,
    RhythmTransformer,
    SyntacticSpaceTransformer,
    SignOrderTransformer,
    SpatialReferenceTransformer,
    ProformeTransformer
} from './index';

/**
 * Fabrique responsable de la création des transformateurs d'erreurs appropriés
 * Centralise la logique de création pour simplifier le simulateur principal
 */
export class ErrorTransformerFactory {
    private logger: Logger;
    private transformers: Map<string, BaseErrorTransformer>;

    /**
     * Initialise la fabrique de transformateurs d'erreurs
     */
    constructor() {
        this.logger = new Logger('ErrorTransformerFactory');
        this.transformers = new Map<string, BaseErrorTransformer>();
        this.initializeTransformers();
    }

    /**
     * Obtient un transformateur d'erreurs pour un type d'erreur spécifique
     * @param errorType Type d'erreur
     * @returns Transformateur d'erreurs correspondant ou undefined si non trouvé
     */
    public getTransformer(errorType: string): BaseErrorTransformer | undefined {
        return this.transformers.get(errorType);
    }

    /**
     * Obtient un transformateur d'erreurs typé pour un type d'erreur spécifique
     * @param errorType Type d'erreur
     * @returns Transformateur d'erreurs correspondant ou undefined si non trouvé
     */
    public getTypedTransformer(errorType: ErrorCategoryType): BaseErrorTransformer | undefined {
        return this.transformers.get(errorType);
    }

    /**
     * Vérifie si un transformateur existe pour un type d'erreur donné
     * @param errorType Type d'erreur
     * @returns true si un transformateur existe, false sinon
     */
    public hasTransformer(errorType: string): boolean {
        return this.transformers.has(errorType);
    }

    /**
     * Vérifie si un transformateur existe pour un type d'erreur typé donné
     * @param errorType Type d'erreur
     * @returns true si un transformateur existe, false sinon
     */
    public hasTypedTransformer(errorType: ErrorCategoryType): boolean {
        return this.transformers.has(errorType);
    }

    /**
     * Obtient tous les transformateurs disponibles
     * @returns Tableau de tous les transformateurs d'erreurs
     */
    public getAllTransformers(): BaseErrorTransformer[] {
        return Array.from(this.transformers.values());
    }

    /**
     * Obtient tous les types d'erreurs supportés
     * @returns Tableau de tous les types d'erreurs supportés
     */
    public getSupportedErrorTypes(): string[] {
        return Array.from(this.transformers.keys());
    }

    /**
     * Obtient le nombre de transformateurs initialisés
     * @returns Nombre de transformateurs disponibles
     */
    public getTransformerCount(): number {
        return this.transformers.size;
    }

    /**
     * Réinitialise tous les transformateurs
     * Utile pour les tests ou la reconfiguration
     */
    public reset(): void {
        this.transformers.clear();
        this.initializeTransformers();
        this.logger.info('Transformateurs d\'erreurs réinitialisés');
    }

    /**
     * Ajoute un transformateur personnalisé
     * @param errorType Type d'erreur
     * @param transformer Transformateur à ajouter
     */
    public addCustomTransformer(errorType: string, transformer: BaseErrorTransformer): void {
        this.transformers.set(errorType, transformer);
        this.logger.info(`Transformateur personnalisé ajouté pour le type: ${errorType}`);
    }

    /**
     * Supprime un transformateur
     * @param errorType Type d'erreur
     * @returns true si le transformateur a été supprimé, false s'il n'existait pas
     */
    public removeTransformer(errorType: string): boolean {
        const removed = this.transformers.delete(errorType);
        if (removed) {
            this.logger.info(`Transformateur supprimé pour le type: ${errorType}`);
        }
        return removed;
    }

    /**
     * Initialise les transformateurs d'erreurs disponibles
     * @private
     */
    private initializeTransformers(): void {
        try {
            // Crée un transformateur pour chaque type d'erreur dans le catalogue
            this.transformers.set(
                ErrorCategoryType.HAND_CONFIGURATION,
                new HandConfigurationTransformer(ERROR_CATALOG[ErrorCategoryType.HAND_CONFIGURATION])
            );

            this.transformers.set(
                ErrorCategoryType.LOCATION,
                new LocationTransformer(ERROR_CATALOG[ErrorCategoryType.LOCATION])
            );

            this.transformers.set(
                ErrorCategoryType.MOVEMENT,
                new MovementTransformer(ERROR_CATALOG[ErrorCategoryType.MOVEMENT])
            );

            this.transformers.set(
                ErrorCategoryType.ORIENTATION,
                new OrientationTransformer(ERROR_CATALOG[ErrorCategoryType.ORIENTATION])
            );

            this.transformers.set(
                ErrorCategoryType.FACIAL_EXPRESSION,
                new FacialExpressionTransformer(ERROR_CATALOG[ErrorCategoryType.FACIAL_EXPRESSION])
            );

            this.transformers.set(
                ErrorCategoryType.RHYTHM,
                new RhythmTransformer(ERROR_CATALOG[ErrorCategoryType.RHYTHM])
            );

            this.transformers.set(
                ErrorCategoryType.SYNTACTIC_SPACE,
                new SyntacticSpaceTransformer(ERROR_CATALOG[ErrorCategoryType.SYNTACTIC_SPACE])
            );

            this.transformers.set(
                ErrorCategoryType.SIGN_ORDER,
                new SignOrderTransformer(ERROR_CATALOG[ErrorCategoryType.SIGN_ORDER])
            );

            this.transformers.set(
                ErrorCategoryType.SPATIAL_REFERENCE,
                new SpatialReferenceTransformer(ERROR_CATALOG[ErrorCategoryType.SPATIAL_REFERENCE])
            );

            this.transformers.set(
                ErrorCategoryType.PROFORME,
                new ProformeTransformer(ERROR_CATALOG[ErrorCategoryType.PROFORME])
            );

            this.logger.info(`Transformateurs d'erreurs initialisés: ${this.transformers.size} types d'erreurs pris en charge`);
        } catch (error) {
            this.logger.error(`Erreur lors de l'initialisation des transformateurs: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Erreur d'initialisation des transformateurs: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}