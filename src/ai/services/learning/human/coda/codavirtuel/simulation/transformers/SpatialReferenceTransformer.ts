/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/SpatialReferenceTransformer.ts
 * @description Transformateur refactorisé pour les erreurs de références spatiales en LSF
 * @author MetaSign
 * @version 3.0.1
 * @since 2024
 * @lastModified 2025-08-06
 * 
 * Version refactorisée selon les principes du guide de refactorisation.
 * Architecture modulaire avec séparation claire des responsabilités.
 * Correction des types pour compatibilité avec readonly arrays.
 */

import { BaseErrorTransformer } from './BaseErrorTransformer';
import { ZoneManager } from './space/managers/ZoneManager';
import {
    SpatialTransformationService,
    SpatialTransformationConfig,
    SpatialTransformationResult
} from './space/services/SpatialTransformationService';
import {
    ErrorCategoryType,
    ErrorTransformationType
} from '../types/ErrorTypes';
import type {
    ErrorCatalogEntry,
    ErrorTransformation
} from '../types/ErrorTypes';
import type { LSFParameters } from '../types/LSFContentTypes';
import type { LSFSpaceParameter } from '../types/LSFSpaceTypes';

// Interface locale pour les zones (évite les problèmes de chemins)
interface LocalLSFReferentialZone {
    id: string;
    name: string;
    coordinates: [number, number];
    semanticRole: string;
    established: boolean;
    consistency: number;
    usage_frequency: number;
}

/**
 * Configuration des transformations spatiales
 */
interface SpatialTransformationSettings {
    readonly defaultAccuracyReduction: number;
    readonly accuracyReductionFactors: Record<string, number>;
}

/**
 * Transformateur refactorisé pour les erreurs de références spatiales
 * 
 * @class SpatialReferenceTransformer
 * @extends BaseErrorTransformer
 * @description Gère les transformations d'erreurs liées aux références spatiales en LSF
 */
export class SpatialReferenceTransformer extends BaseErrorTransformer {
    private readonly zoneManager: ZoneManager;
    private readonly transformationService: SpatialTransformationService;

    private static readonly TRANSFORMATION_SETTINGS: SpatialTransformationSettings = {
        defaultAccuracyReduction: 0.45,
        accuracyReductionFactors: {
            ambiguousReference: 0.4,
            inconsistentReference: 0.5,
            referenceOmission: 0.3,
            pronounConfusion: 0.35,
            spatialReorganization: 0.6
        }
    } as const;

    /**
     * Constructeur du transformateur de références spatiales
     * @param {ErrorCatalogEntry} errorCategory - Catégorie d'erreur avec ses transformations
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.SPATIAL_REFERENCE, errorCategory);
        this.zoneManager = new ZoneManager();
        this.transformationService = new SpatialTransformationService(this.zoneManager);
    }

    /**
     * Applique une transformation spécifique au contenu
     * @param {Record<string, unknown>} content - Contenu à transformer
     * @param {ErrorTransformation} transform - Transformation à appliquer
     * @protected
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const space = this.getTargetParameter(content);
        if (!space) {
            this.logger.warn('Aucun paramètre spatial trouvé dans le contenu');
            return;
        }

        const config = this.createTransformationConfig(transform);

        if (!this.transformationService.validateTransformationConfig(config)) {
            this.logger.error('Configuration de transformation invalide', config);
            return;
        }

        this.applyTransformationByType(space, transform, config, content);
    }

    /**
     * Applique une transformation selon son type
     * @param {LSFSpaceParameter} space - Paramètres spatiaux
     * @param {ErrorTransformation} transform - Transformation
     * @param {SpatialTransformationConfig} config - Configuration
     * @param {Record<string, unknown>} content - Contenu
     * @private
     */
    private async applyTransformationByType(
        space: LSFSpaceParameter,
        transform: ErrorTransformation,
        config: SpatialTransformationConfig,
        content: Record<string, unknown>
    ): Promise<void> {
        let result: SpatialTransformationResult;

        try {
            switch (transform.type) {
                case ErrorTransformationType.AMBIGUOUS_REFERENCE:
                    result = await this.transformationService.applyAmbiguousReference(space, config);
                    break;
                case ErrorTransformationType.INCONSISTENT_REFERENCE:
                    result = await this.transformationService.applyInconsistentReference(space, config);
                    break;
                case ErrorTransformationType.REFERENCE_OMISSION:
                    result = await this.transformationService.applyReferenceOmission(space, config);
                    break;
                case ErrorTransformationType.PRONOUN_CONFUSION:
                    result = await this.transformationService.applyPronounConfusion(space, config);
                    break;
                case ErrorTransformationType.SPATIAL_REORGANIZATION:
                    result = await this.transformationService.applySpatialReorganization(space, config);
                    break;
                default:
                    result = this.transformationService.applyGenericDegradation(space, config);
                    break;
            }

            this.logTransformationResult(transform.type ?? 'unknown', result);
            const spatialReport = this.transformationService.generateAnalysisReport(space, transform);
            content.spatialAnalysis = spatialReport;

        } catch (error) {
            this.logger.error(`Erreur lors de la transformation spatiale ${transform.type}:`, error);
        }
    }

    /**
     * Crée une configuration de transformation à partir d'une transformation
     * @param {ErrorTransformation} transform - Transformation source
     * @returns {SpatialTransformationConfig} Configuration créée
     * @private
     */
    private createTransformationConfig(transform: ErrorTransformation): SpatialTransformationConfig {
        const severity = transform.factor ?? 0.5;

        return {
            severity,
            preserveSemantics: false, // Valeur par défaut
            maxZonesAffected: 5, // Valeur par défaut
            minAccuracyThreshold: 0.1
        };
    }

    /**
     * Enregistre le résultat d'une transformation dans les logs
     * ✅ Correction : Accepte maintenant readonly string[] pour affectedZones
     * 
     * @param {string} transformationType - Type de transformation
     * @param {SpatialTransformationResult} result - Résultat de la transformation
     * @private
     */
    private logTransformationResult(transformationType: string, result: SpatialTransformationResult): void {
        if (result.success) {
            this.logger.debug(
                `Transformation ${transformationType} réussie - Impact: ${result.accuracyImpact}, Zones affectées: ${result.affectedZones.length}`
            );
        } else {
            this.logger.warn(
                `Transformation ${transformationType} échouée: ${result.errorMessage}`
            );
        }
    }

    /**
     * Applique la transformation par défaut
     * @param {Record<string, unknown>} content - Contenu à transformer
     * @protected
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const space = this.getTargetParameter(content);
        if (!space) {
            this.logger.warn('Aucun paramètre spatial trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        const config: SpatialTransformationConfig = {
            severity,
            preserveSemantics: false,
            maxZonesAffected: 3,
            minAccuracyThreshold: 0.1
        };

        const result = this.transformationService.applyGenericDegradation(space, config);
        this.logger.debug(`Transformation spatiale par défaut appliquée - Impact: ${result.accuracyImpact}`);
    }

    /**
     * Obtient le paramètre cible du contenu
     * @param {Record<string, unknown>} content - Contenu source
     * @returns {LSFSpaceParameter | undefined} Paramètre spatial ou undefined
     * @protected
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFSpaceParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }
        return parameters.space;
    }

    // === API publique ===

    /**
     * Obtient les statistiques spatiales
     * @returns Statistiques des zones
     * @public
     */
    public getSpatialStatistics() {
        return this.zoneManager.getZoneStatistics();
    }

    /**
     * Génère une évaluation spatiale
     * @param {LSFSpaceParameter} space - Paramètres spatiaux
     * @returns Rapport d'évaluation
     * @public
     */
    public generateSpatialEvaluation(space: LSFSpaceParameter) {
        const mockTransform: ErrorTransformation = {
            type: ErrorTransformationType.AMBIGUOUS_REFERENCE,
            factor: 0.5,
            probability: 1.0 // Propriété requise
        };
        return this.transformationService.generateAnalysisReport(space, mockTransform);
    }

    /**
     * Obtient l'historique spatial
     * @returns Historique des zones
     * @public
     */
    public getSpatialHistory() {
        return this.zoneManager.getHistory();
    }

    /**
     * Réinitialise toutes les zones actives
     * @public
     */
    public resetActiveZones(): void {
        this.zoneManager.resetAllZones();
        this.logger.debug('Zones actives réinitialisées');
    }

    /**
     * Ajoute une zone personnalisée
     * @param {LocalLSFReferentialZone} zone - Zone à ajouter
     * @returns {boolean} Succès de l'ajout
     * @public
     */
    public addCustomZone(zone: LocalLSFReferentialZone): boolean {
        const success = this.zoneManager.addCustomZone(zone);
        if (success) {
            this.logger.debug(`Zone personnalisée ajoutée: ${zone.name}`);
        } else {
            this.logger.warn(`Échec de l'ajout de la zone: ${zone.name}`);
        }
        return success;
    }

    /**
     * Supprime une zone
     * @param {string} zoneId - Identifiant de la zone
     * @returns {boolean} Succès de la suppression
     * @public
     */
    public removeZone(zoneId: string): boolean {
        const success = this.zoneManager.removeZone(zoneId);
        if (success) {
            this.logger.debug(`Zone supprimée: ${zoneId}`);
        }
        return success;
    }

    /**
     * Obtient une zone spécifique
     * @param {string} zoneId - Identifiant de la zone
     * @returns {LocalLSFReferentialZone | undefined} Zone ou undefined
     * @public
     */
    public getZone(zoneId: string): LocalLSFReferentialZone | undefined {
        return this.zoneManager.getZone(zoneId);
    }

    /**
     * Obtient toutes les zones
     * @returns {readonly LocalLSFReferentialZone[]} Liste des zones
     * @public
     */
    public getAllZones(): readonly LocalLSFReferentialZone[] {
        return this.zoneManager.getAllZones();
    }

    /**
     * Filtre les zones selon des critères
     * @param {object} criteria - Critères de filtrage
     * @returns {LocalLSFReferentialZone[]} Zones filtrées
     * @public
     */
    public filterZones(criteria: {
        established?: boolean;
        minConsistency?: number;
        minUsage?: number;
        semanticRole?: string;
    }): LocalLSFReferentialZone[] {
        return this.zoneManager.filterZones(criteria);
    }

    /**
     * Obtient le nombre de zones actives
     * @returns {number} Nombre de zones
     * @public
     */
    public getActiveZoneCount(): number {
        return this.zoneManager.getZoneCount();
    }
}