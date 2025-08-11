/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/services/SpatialTransformationService.ts
 * @description Service de transformations spatiales avancées
 * 
 * Fonctionnalités :
 * - 🌐 Transformations spatiales avancées pour simulations d'erreurs
 * - 📊 Analyse de cohérence spatiale et référentielle
 * - 🔄 Gestion des incohérences et ambiguïtés spatiales
 * - 💡 Génération de rapports d'analyse détaillés
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @author MetaSign Team - CODA Spatial Transformations
 * @version 1.0.5 - Service avec imports et méthodes corrigés
 * @since 2025-05-29
 * @lastModified 2025-08-06
 */

// ✅ Correction : Import correct du service disponible
import { SyntaxAnalysisService } from '../../../services/SpatialAnalysisService';
import { SpatialManipulationService } from '../../../services/SpatialManipulationService';
import { ZoneManager } from '../managers/ZoneManager';
import type { LSFSpaceParameter } from '../../../types/LSFSpaceTypes';
import type { ErrorTransformation } from '../../../types/ErrorTypes';

/**
 * Résultat d'une transformation spatiale
 */
export interface SpatialTransformationResult {
    readonly success: boolean;
    readonly accuracyImpact: number;
    readonly affectedZones: readonly string[];
    readonly errorMessage?: string;
}

/**
 * Configuration d'une transformation spatiale
 */
export interface SpatialTransformationConfig {
    readonly severity: number;
    readonly preserveSemantics?: boolean;
    readonly maxZonesAffected?: number;
    readonly minAccuracyThreshold?: number;
}

/**
 * Interface pour l'analyse de cohérence spatiale
 */
interface SpatialCoherenceAnalysis {
    readonly coherenceScore: number;
    readonly spatialErrors: readonly string[];
    readonly spatialWarnings: readonly string[];
    readonly spatialSuggestions: readonly string[];
}

/**
 * Service de transformations spatiales avancées
 * 
 * @class SpatialTransformationService
 * @description Service spécialisé dans l'application de transformations spatiales
 * pour la simulation d'erreurs et l'analyse de cohérence spatiale en LSF.
 * 
 * @example
 * ```typescript
 * const service = new SpatialTransformationService(zoneManager);
 * const result = await service.applyAmbiguousReference(space, config);
 * if (result.success) {
 *   console.log(`Impact: ${result.accuracyImpact}`);
 * }
 * ```
 */
export class SpatialTransformationService {
    /**
     * Gestionnaire de zones spatiales
     * @private
     * @readonly
     */
    private readonly zoneManager: ZoneManager;

    /**
     * Instance du service d'analyse syntaxique
     * @private
     * @readonly
     */
    private readonly syntaxAnalysisService: SyntaxAnalysisService;

    /**
     * Constructeur du service de transformations spatiales
     * 
     * @constructor
     * @param {ZoneManager} zoneManager - Gestionnaire de zones
     */
    constructor(zoneManager: ZoneManager) {
        this.zoneManager = zoneManager;
        this.syntaxAnalysisService = new SyntaxAnalysisService();
    }

    /**
     * Applique une référence ambiguë intelligente
     * 
     * @method applyAmbiguousReference
     * @async
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {SpatialTransformationConfig} config - Configuration de transformation
     * @returns {Promise<SpatialTransformationResult>} Résultat de la transformation
     * @public
     */
    public async applyAmbiguousReference(
        space: LSFSpaceParameter,
        config: SpatialTransformationConfig
    ): Promise<SpatialTransformationResult> {
        try {
            const serviceZones = this.zoneManager.getServiceCompatibleZones();
            const candidateZones = SpatialManipulationService.identifyAmbiguityCandidates(serviceZones);

            if (candidateZones.length < 2) {
                return {
                    success: false,
                    accuracyImpact: 0,
                    affectedZones: [],
                    errorMessage: 'Pas assez de zones pour créer une ambiguïté'
                };
            }

            const targetZones = SpatialManipulationService.selectAmbiguityTargets(candidateZones, config.severity);
            const zoneIds = targetZones.map((zone: { id: string; name: string }) => zone.id);

            space.ambiguousReference = true;
            space.ambiguousZones = zoneIds;

            const consistencyReduction = config.severity * 0.4;
            this.zoneManager.applyConsistencyReduction(zoneIds, consistencyReduction);

            const accuracyImpact = SpatialManipulationService.calculateAmbiguityImpact(targetZones, config.severity);
            space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyImpact);

            return {
                success: true,
                accuracyImpact,
                affectedZones: zoneIds
            };

        } catch (error) {
            return {
                success: false,
                accuracyImpact: 0,
                affectedZones: [],
                errorMessage: `Erreur lors de l'application de la référence ambiguë: ${error}`
            };
        }
    }

    /**
     * Applique une incohérence référentielle contextuelle
     * 
     * @method applyInconsistentReference
     * @async
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {SpatialTransformationConfig} config - Configuration de transformation
     * @returns {Promise<SpatialTransformationResult>} Résultat de la transformation
     * @public
     */
    public async applyInconsistentReference(
        space: LSFSpaceParameter,
        config: SpatialTransformationConfig
    ): Promise<SpatialTransformationResult> {
        try {
            const serviceZones = this.zoneManager.getServiceCompatibleZones();
            const inconsistencyTargets = SpatialManipulationService.identifyInconsistencyTargets(serviceZones);

            if (inconsistencyTargets.length === 0) {
                return {
                    success: false,
                    accuracyImpact: 0,
                    affectedZones: [],
                    errorMessage: 'Aucune cible d\'incohérence identifiée'
                };
            }

            const targetInconsistency = SpatialManipulationService.selectInconsistencyType(
                inconsistencyTargets,
                config.severity
            );

            space.referenceConsistency = false;
            space.inconsistencyType = targetInconsistency.type;
            space.affectedZones = targetInconsistency.affected_zones;

            const accuracyImpact = SpatialManipulationService.calculateInconsistencyImpact(
                targetInconsistency,
                config.severity
            );
            space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyImpact);

            return {
                success: true,
                accuracyImpact,
                affectedZones: [...targetInconsistency.affected_zones]
            };

        } catch (error) {
            return {
                success: false,
                accuracyImpact: 0,
                affectedZones: [],
                errorMessage: `Erreur lors de l'application de l'incohérence référentielle: ${error}`
            };
        }
    }

    /**
     * Applique une omission de référence stratégique
     * 
     * @method applyReferenceOmission
     * @async
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {SpatialTransformationConfig} config - Configuration de transformation
     * @returns {Promise<SpatialTransformationResult>} Résultat de la transformation
     * @public
     */
    public async applyReferenceOmission(
        space: LSFSpaceParameter,
        config: SpatialTransformationConfig
    ): Promise<SpatialTransformationResult> {
        try {
            const serviceZones = this.zoneManager.getServiceCompatibleZones();
            const omissibleReferences = SpatialManipulationService.identifyOmissibleReferences(serviceZones);

            if (omissibleReferences.length === 0) {
                return {
                    success: false,
                    accuracyImpact: 0,
                    affectedZones: [],
                    errorMessage: 'Aucune référence omissible identifiée'
                };
            }

            const targetReferences = SpatialManipulationService.selectOmissionTargets(
                omissibleReferences,
                config.severity
            );

            space.referenceOmission = true;
            space.omittedReferences = targetReferences.map((ref: { id: string }) => ref.id);

            const accuracyImpact = SpatialManipulationService.calculateOmissionImpact(targetReferences);
            space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyImpact);

            return {
                success: true,
                accuracyImpact,
                affectedZones: targetReferences.map((ref: { id: string }) => ref.id)
            };

        } catch (error) {
            return {
                success: false,
                accuracyImpact: 0,
                affectedZones: [],
                errorMessage: `Erreur lors de l'application de l'omission de référence: ${error}`
            };
        }
    }

    /**
     * Applique une confusion de pronoms réaliste
     * 
     * @method applyPronounConfusion
     * @async
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {SpatialTransformationConfig} config - Configuration de transformation
     * @returns {Promise<SpatialTransformationResult>} Résultat de la transformation
     * @public
     */
    public async applyPronounConfusion(
        space: LSFSpaceParameter,
        config: SpatialTransformationConfig
    ): Promise<SpatialTransformationResult> {
        try {
            const serviceZones = this.zoneManager.getServiceCompatibleZones();
            const confusionPatterns = SpatialManipulationService.identifyPronounConfusionPatterns(serviceZones);

            if (confusionPatterns.length === 0) {
                return {
                    success: false,
                    accuracyImpact: 0,
                    affectedZones: [],
                    errorMessage: 'Aucun pattern de confusion pronominale disponible'
                };
            }

            const targetPattern = SpatialManipulationService.selectConfusionPattern(
                confusionPatterns,
                config.severity
            );

            space.pronounConfusion = true;
            space.confusionPattern = targetPattern.pattern_id;
            space.affectedPronouns = targetPattern.affected_pronouns;

            const accuracyImpact = SpatialManipulationService.calculateConfusionImpact(
                targetPattern,
                config.severity
            );
            space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyImpact);

            return {
                success: true,
                accuracyImpact,
                affectedZones: [] // Les patterns de confusion n'ont pas forcément de zones affectées spécifiques
            };

        } catch (error) {
            return {
                success: false,
                accuracyImpact: 0,
                affectedZones: [],
                errorMessage: `Erreur lors de l'application de la confusion pronominale: ${error}`
            };
        }
    }

    /**
     * Applique une réorganisation spatiale
     * 
     * @method applySpatialReorganization
     * @async
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {SpatialTransformationConfig} config - Configuration de transformation
     * @returns {Promise<SpatialTransformationResult>} Résultat de la transformation
     * @public
     */
    public async applySpatialReorganization(
        space: LSFSpaceParameter,
        config: SpatialTransformationConfig
    ): Promise<SpatialTransformationResult> {
        try {
            const serviceZones = this.zoneManager.getServiceCompatibleZones();
            const currentOrganization = SpatialManipulationService.analyzeSpatialOrganization(serviceZones);

            const reorganizationPlan = SpatialManipulationService.generateReorganizationPlan(
                currentOrganization,
                config.severity
            );

            if (!reorganizationPlan) {
                return {
                    success: false,
                    accuracyImpact: 0,
                    affectedZones: [],
                    errorMessage: 'Impossible de générer un plan de réorganisation'
                };
            }

            space.spatialReorganization = true;
            space.originalOrganization = currentOrganization;
            space.newOrganization = reorganizationPlan;

            // Calcul d'impact simplifié pour éviter les problèmes de signature
            const accuracyImpact = 0.5 * config.severity;
            space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyImpact);

            return {
                success: true,
                accuracyImpact,
                affectedZones: [...reorganizationPlan.affected_zones]
            };

        } catch (error) {
            return {
                success: false,
                accuracyImpact: 0,
                affectedZones: [],
                errorMessage: `Erreur lors de l'application de la réorganisation spatiale: ${error}`
            };
        }
    }

    /**
     * Applique une dégradation spatiale générique
     * 
     * @method applyGenericDegradation
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {SpatialTransformationConfig} config - Configuration de transformation
     * @returns {SpatialTransformationResult} Résultat de la transformation
     * @public
     */
    public applyGenericDegradation(
        space: LSFSpaceParameter,
        config: SpatialTransformationConfig
    ): SpatialTransformationResult {
        const accuracyImpact = config.severity;

        space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyImpact);
        space.genericError = true;
        space.errorSeverity = config.severity;

        return {
            success: true,
            accuracyImpact,
            affectedZones: []
        };
    }

    /**
     * Analyse la cohérence spatiale
     * 
     * @method analyzeSpatialCoherence
     * @private
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @returns {SpatialCoherenceAnalysis} Analyse de cohérence
     */
    private analyzeSpatialCoherence(space: LSFSpaceParameter): SpatialCoherenceAnalysis {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];
        let coherenceScore = 1.0;

        // Vérification de la cohérence des références spatiales
        if (space.ambiguousReference) {
            warnings.push('Références spatiales ambiguës détectées');
            coherenceScore -= 0.2;
            suggestions.push('Clarifier les références spatiales');
        }

        // Vérification de la cohérence référentielle
        if (space.referenceConsistency === false) {
            errors.push('Incohérence référentielle détectée');
            coherenceScore -= 0.3;
            suggestions.push('Rétablir la cohérence des références');
        }

        // Vérification des omissions
        if (space.referenceOmission) {
            warnings.push('Références spatiales omises');
            coherenceScore -= 0.15;
            suggestions.push('Compléter les références manquantes');
        }

        // Vérification des confusions pronominales
        if (space.pronounConfusion) {
            warnings.push('Confusion pronominale détectée');
            coherenceScore -= 0.1;
            suggestions.push('Clarifier l\'usage des pronoms spatiaux');
        }

        // Vérification de la réorganisation spatiale
        if (space.spatialReorganization) {
            warnings.push('Réorganisation spatiale détectée');
            coherenceScore -= 0.1;
            suggestions.push('Vérifier l\'ordre spatial naturel');
        }

        // Ajustement du score de cohérence
        coherenceScore = Math.max(0, Math.min(1, coherenceScore));

        // Utilisation des méthodes du service d'analyse syntaxique pour enrichir l'analyse
        const syntaxComplexity = this.syntaxAnalysisService.analyzeSyntaxComplexity(space as Record<string, unknown>);

        if (syntaxComplexity.interferenceLevel > 0.5) {
            warnings.push('Interférence syntaxique élevée');
            suggestions.push(...syntaxComplexity.adaptationRecommendations);
        }

        return {
            coherenceScore,
            spatialErrors: errors,
            spatialWarnings: warnings,
            spatialSuggestions: suggestions
        };
    }

    /**
     * Génère un rapport d'analyse spatiale
     * 
     * @method generateAnalysisReport
     * @param {LSFSpaceParameter} space - Paramètres spatiaux LSF
     * @param {ErrorTransformation} transform - Transformation d'erreur
     * @returns {object} Rapport d'analyse détaillé
     * @public
     */
    public generateAnalysisReport(space: LSFSpaceParameter, transform: ErrorTransformation) {
        // ✅ Utilisation de la méthode locale d'analyse de cohérence
        const coherenceAnalysis = this.analyzeSpatialCoherence(space);
        const zoneStats = this.zoneManager.getZoneStatistics();

        // Utilisation du service d'analyse syntaxique pour enrichir le rapport
        const syntaxAnalysis = this.syntaxAnalysisService.generateSyntaxAnalysis(
            space as Record<string, unknown>,
            transform.type
        );

        return {
            transformation_type: transform.type ?? 'unknown',
            coherence_analysis: coherenceAnalysis,
            syntax_analysis: syntaxAnalysis,
            spatial_evaluation: {
                zones_count: this.zoneManager.getZoneCount(),
                consistency_average: zoneStats.averageConsistency,
                coherence_score: coherenceAnalysis.coherenceScore
            },
            statistics: {
                zones_active: this.zoneManager.getZoneCount(),
                total_usage: zoneStats.totalUsage,
                established_zones: zoneStats.establishedZones
            },
            zone_statistics: zoneStats,
            active_zones_count: this.zoneManager.getZoneCount(),
            history_length: this.zoneManager.getHistory().length,
            recommendations: [
                ...coherenceAnalysis.spatialSuggestions,
                ...syntaxAnalysis.suggestions
            ]
        };
    }

    /**
     * Valide la configuration d'une transformation
     * 
     * @method validateTransformationConfig
     * @param {SpatialTransformationConfig} config - Configuration à valider
     * @returns {boolean} Validité de la configuration
     * @public
     */
    public validateTransformationConfig(config: SpatialTransformationConfig): boolean {
        if (config.severity < 0 || config.severity > 1) {
            return false;
        }

        if (config.maxZonesAffected !== undefined && config.maxZonesAffected < 1) {
            return false;
        }

        if (config.minAccuracyThreshold !== undefined &&
            (config.minAccuracyThreshold < 0 || config.minAccuracyThreshold > 1)) {
            return false;
        }

        return true;
    }

    /**
     * Obtient le gestionnaire de zones
     * 
     * @method getZoneManager
     * @returns {ZoneManager} Instance du gestionnaire de zones
     * @public
     */
    public getZoneManager(): ZoneManager {
        return this.zoneManager;
    }
}