/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/strategies/LocationTransformationStrategy.ts
 * @description Stratégie de transformation pour l'omission d'informations de localisation en LSF
 * Simule les erreurs d'omission et d'imprécision dans les informations spatiales
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import { ExtendedLSFSpaceParameter } from '../types/ExtendedLSFTypes';
import { SpaceTransformationContext, SpatialZoneType } from '../types/SpaceTransformationTypes';
import { Logger } from '@/ai/utils/Logger';

/**
 * Types d'omission de localisation
 */
enum LocationOmissionType {
    PARTIAL = 'PARTIAL',               // Omission partielle
    SELECTIVE = 'SELECTIVE',           // Omission sélective
    SYSTEMATIC = 'SYSTEMATIC',         // Omission systématique
    RANDOM = 'RANDOM',                 // Omission aléatoire
    PROGRESSIVE = 'PROGRESSIVE'        // Omission progressive
}

/**
 * Niveaux de perte d'information
 */
enum InformationLossLevel {
    MINIMAL = 'MINIMAL',       // Perte minimale
    MODERATE = 'MODERATE',     // Perte modérée
    SUBSTANTIAL = 'SUBSTANTIAL', // Perte substantielle
    CRITICAL = 'CRITICAL'      // Perte critique
}

/**
 * Types d'informations spatiales
 */
enum SpatialInformationType {
    POSITION = 'POSITION',             // Information de position
    ORIENTATION = 'ORIENTATION',       // Information d'orientation
    DISTANCE = 'DISTANCE',             // Information de distance
    REFERENCE = 'REFERENCE',           // Information de référence
    CONTEXT = 'CONTEXT'                // Information de contexte
}

/**
 * Configuration d'omission de localisation
 */
interface LocationOmissionConfig {
    /** Type d'omission à appliquer */
    omissionType: LocationOmissionType;

    /** Niveau de perte d'information */
    lossLevel: InformationLossLevel;

    /** Types d'informations affectées */
    affectedInformationTypes: SpatialInformationType[];

    /** Zones spatiales particulièrement affectées */
    vulnerableZones: SpatialZoneType[];

    /** Probabilité d'omission (0-1) */
    omissionProbability: number;

    /** Impact sur la compréhension */
    comprehensionImpact: number;

    /** Possibilité de récupération */
    recoverable: boolean;
}

/**
 * Résultat de l'omission de localisation
 */
interface LocationOmissionResult {
    /** Types d'informations omises */
    omittedInformationTypes: SpatialInformationType[];

    /** Zones affectées par l'omission */
    affectedZones: SpatialZoneType[];

    /** Score de perte d'information */
    informationLossScore: number;

    /** Niveau de récupération possible */
    recoveryPotential: number;

    /** Impact final sur la précision */
    finalAccuracyImpact: number;
}

/**
 * Stratégie de transformation pour l'omission d'informations de localisation
 * 
 * Cette stratégie simule les erreurs d'omission typiques des apprenants
 * qui perdent ou négligent des informations spatiales cruciales,
 * affectant la clarté et la précision du discours en LSF.
 */
export class LocationTransformationStrategy {
    private readonly logger: Logger;
    private impactScore: number = 0;
    private readonly omissionConfigs: ReadonlyMap<InformationLossLevel, LocationOmissionConfig>;

    /**
     * Initialise la stratégie de transformation de localisation
     */
    constructor() {
        this.logger = new Logger('LocationTransformationStrategy');
        this.omissionConfigs = this.initializeOmissionConfigs();
    }

    /**
     * Initialise les configurations d'omission par niveau
     * @returns Map des configurations indexées par niveau de perte
     * @private
     */
    private initializeOmissionConfigs(): ReadonlyMap<InformationLossLevel, LocationOmissionConfig> {
        return new Map([
            [InformationLossLevel.MINIMAL, {
                omissionType: LocationOmissionType.PARTIAL,
                lossLevel: InformationLossLevel.MINIMAL,
                affectedInformationTypes: [SpatialInformationType.CONTEXT],
                vulnerableZones: [SpatialZoneType.PERIPHERAL],
                omissionProbability: 0.20,
                comprehensionImpact: 0.10,
                recoverable: true
            }],
            [InformationLossLevel.MODERATE, {
                omissionType: LocationOmissionType.SELECTIVE,
                lossLevel: InformationLossLevel.MODERATE,
                affectedInformationTypes: [
                    SpatialInformationType.DISTANCE,
                    SpatialInformationType.ORIENTATION
                ],
                vulnerableZones: [
                    SpatialZoneType.DOMINANT_SIDE,
                    SpatialZoneType.NON_DOMINANT_SIDE
                ],
                omissionProbability: 0.40,
                comprehensionImpact: 0.25,
                recoverable: true
            }],
            [InformationLossLevel.SUBSTANTIAL, {
                omissionType: LocationOmissionType.SYSTEMATIC,
                lossLevel: InformationLossLevel.SUBSTANTIAL,
                affectedInformationTypes: [
                    SpatialInformationType.POSITION,
                    SpatialInformationType.REFERENCE,
                    SpatialInformationType.DISTANCE
                ],
                vulnerableZones: [
                    SpatialZoneType.UPPER,
                    SpatialZoneType.LOWER,
                    SpatialZoneType.CENTER
                ],
                omissionProbability: 0.65,
                comprehensionImpact: 0.50,
                recoverable: false
            }],
            [InformationLossLevel.CRITICAL, {
                omissionType: LocationOmissionType.PROGRESSIVE,
                lossLevel: InformationLossLevel.CRITICAL,
                affectedInformationTypes: Object.values(SpatialInformationType),
                vulnerableZones: Object.values(SpatialZoneType),
                omissionProbability: 0.85,
                comprehensionImpact: 0.75,
                recoverable: false
            }]
        ]);
    }

    /**
     * Applique la transformation d'omission de localisation
     * @param space Paramètre d'espace étendu à modifier
     * @param context Contexte de transformation
     */
    public apply(space: ExtendedLSFSpaceParameter, context: SpaceTransformationContext): void {
        if (!this.validate(space)) {
            this.logger.warn('Paramètre d\'espace invalide pour la transformation de localisation');
            return;
        }

        try {
            const lossLevel = this.determineLossLevel(context.severity);
            const config = this.omissionConfigs.get(lossLevel);

            if (!config) {
                this.logger.error(`Configuration d'omission non trouvée pour le niveau ${lossLevel}`);
                return;
            }

            const result = this.applyLocationOmission(space, config, context);
            this.calculateImpactScore(result, context);

            this.logger.debug(
                `Omission de localisation ${config.omissionType} appliquée. ` +
                `Types omis: ${result.omittedInformationTypes.length}, Impact: ${this.impactScore}`
            );

        } catch (error) {
            this.logger.error('Erreur lors de l\'application de la transformation de localisation:', error);
            this.impactScore = 0;
        }
    }

    /**
     * Détermine le niveau de perte basé sur la sévérité
     * @param severity Sévérité du contexte (0-1)
     * @returns Niveau de perte approprié
     * @private
     */
    private determineLossLevel(severity: number): InformationLossLevel {
        if (severity >= 0.8) return InformationLossLevel.CRITICAL;
        if (severity >= 0.6) return InformationLossLevel.SUBSTANTIAL;
        if (severity >= 0.3) return InformationLossLevel.MODERATE;
        return InformationLossLevel.MINIMAL;
    }

    /**
     * Applique l'omission de localisation selon la configuration
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @param context Contexte de transformation
     * @returns Résultat de l'omission
     * @private
     */
    private applyLocationOmission(
        space: ExtendedLSFSpaceParameter,
        config: LocationOmissionConfig,
        context: SpaceTransformationContext
    ): LocationOmissionResult {
        // Active l'omission de localisation
        space.locationOmission = true;

        // Détermine les informations à omettre
        const omittedTypes = this.selectInformationToOmit(config, context);

        // Applique les effets spécifiques de l'omission
        const affectedZones = this.applyOmissionEffects(space, config, omittedTypes);

        // Calcule la perte d'information
        const informationLossScore = this.calculateInformationLoss(omittedTypes, config);

        // Évalue le potentiel de récupération
        const recoveryPotential = this.assessRecoveryPotential(config, informationLossScore);

        // Applique l'impact sur la précision
        const accuracyImpact = this.applyAccuracyImpact(space, config, informationLossScore);

        // Ajoute les métadonnées
        this.addOmissionMetadata(space, config, omittedTypes);

        return {
            omittedInformationTypes: omittedTypes,
            affectedZones,
            informationLossScore,
            recoveryPotential,
            finalAccuracyImpact: accuracyImpact
        };
    }

    /**
     * Sélectionne les types d'informations à omettre
     * @param config Configuration d'omission
     * @param context Contexte de transformation
     * @returns Types d'informations à omettre
     * @private
     */
    private selectInformationToOmit(
        config: LocationOmissionConfig,
        context: SpaceTransformationContext
    ): SpatialInformationType[] {
        const omitted: SpatialInformationType[] = [];
        const effectiveProbability = config.omissionProbability * context.severity;

        for (const infoType of config.affectedInformationTypes) {
            if (Math.random() < effectiveProbability) {
                omitted.push(infoType);
            }
        }

        // Garantit qu'au moins un type est omis si la sévérité est élevée
        if (omitted.length === 0 && context.severity > 0.5) {
            omitted.push(config.affectedInformationTypes[0]);
        }

        return omitted;
    }

    /**
     * Applique les effets spécifiques de l'omission
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @param omittedTypes Types d'informations omises
     * @returns Zones affectées
     * @private
     */
    private applyOmissionEffects(
        space: ExtendedLSFSpaceParameter,
        config: LocationOmissionConfig,
        omittedTypes: SpatialInformationType[]
    ): SpatialZoneType[] {
        const affectedZones: SpatialZoneType[] = [];

        for (const infoType of omittedTypes) {
            const zones = this.applySpecificOmissionEffect(space, infoType, config);
            affectedZones.push(...zones);
        }

        // Supprime les doublons
        return [...new Set(affectedZones)];
    }

    /**
     * Applique l'effet spécifique pour un type d'information omise
     * @param space Paramètre d'espace à modifier
     * @param infoType Type d'information omise
     * @param config Configuration d'omission
     * @returns Zones affectées
     * @private
     */
    private applySpecificOmissionEffect(
        space: ExtendedLSFSpaceParameter,
        infoType: SpatialInformationType,
        config: LocationOmissionConfig
    ): SpatialZoneType[] {
        switch (infoType) {
            case SpatialInformationType.POSITION:
                return this.applyPositionOmission(space);

            case SpatialInformationType.ORIENTATION:
                return this.applyOrientationOmission(space);

            case SpatialInformationType.DISTANCE:
                return this.applyDistanceOmission(space, config);

            case SpatialInformationType.REFERENCE:
                return this.applyReferenceOmission(space, config);

            case SpatialInformationType.CONTEXT:
                return this.applyContextOmission(space, config);

            default:
                this.logger.warn(`Type d'information non géré: ${infoType}`);
                return [];
        }
    }

    /**
     * Applique l'omission de position
     * @param space Paramètre d'espace à modifier
     * @returns Zones affectées
     * @private
     */
    private applyPositionOmission(space: ExtendedLSFSpaceParameter): SpatialZoneType[] {
        space.zoneConfusion = true;
        space.randomPlacement = true;
        return [SpatialZoneType.CENTER, SpatialZoneType.PERIPHERAL];
    }

    /**
     * Applique l'omission d'orientation
     * @param space Paramètre d'espace à modifier
     * @returns Zones affectées
     * @private
     */
    private applyOrientationOmission(space: ExtendedLSFSpaceParameter): SpatialZoneType[] {
        space.referenceConsistency = false;
        return [SpatialZoneType.DOMINANT_SIDE, SpatialZoneType.NON_DOMINANT_SIDE];
    }

    /**
     * Applique l'omission de distance
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @returns Zones affectées
     * @private
     */
    private applyDistanceOmission(space: ExtendedLSFSpaceParameter, config: LocationOmissionConfig): SpatialZoneType[] {
        const scaleReduction = config.comprehensionImpact * 0.3;
        space.scale = Math.max(0.3, (space.scale ?? 1) - scaleReduction);
        return [SpatialZoneType.UPPER, SpatialZoneType.LOWER];
    }

    /**
     * Applique l'omission de référence
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @returns Zones affectées
     * @private
     */
    private applyReferenceOmission(space: ExtendedLSFSpaceParameter, config: LocationOmissionConfig): SpatialZoneType[] {
        space.referenceConsistency = false;
        space.zoneConfusion = true;
        return config.vulnerableZones;
    }

    /**
     * Applique l'omission de contexte
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @returns Zones affectées
     * @private
     */
    private applyContextOmission(space: ExtendedLSFSpaceParameter, config: LocationOmissionConfig): SpatialZoneType[] {
        // Impact plus subtil sur le contexte général
        const contextualImpact = config.comprehensionImpact * 0.2;
        space.accuracy = Math.max(0, (space.accuracy ?? 1) - contextualImpact);
        return [SpatialZoneType.PERIPHERAL];
    }

    /**
     * Calcule le score de perte d'information
     * @param omittedTypes Types d'informations omises
     * @param config Configuration d'omission
     * @returns Score de perte (0-1)
     * @private
     */
    private calculateInformationLoss(
        omittedTypes: SpatialInformationType[],
        config: LocationOmissionConfig
    ): number {
        const totalTypes = config.affectedInformationTypes.length;
        const omittedCount = omittedTypes.length;
        const lossRatio = omittedCount / totalTypes;

        return Math.min(1, lossRatio * config.comprehensionImpact);
    }

    /**
     * Évalue le potentiel de récupération
     * @param config Configuration d'omission
     * @param lossScore Score de perte
     * @returns Potentiel de récupération (0-1)
     * @private
     */
    private assessRecoveryPotential(config: LocationOmissionConfig, lossScore: number): number {
        if (!config.recoverable) {
            return 0;
        }

        return Math.max(0, 1 - lossScore * 1.5);
    }

    /**
     * Applique l'impact sur la précision
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @param lossScore Score de perte
     * @returns Impact appliqué
     * @private
     */
    private applyAccuracyImpact(
        space: ExtendedLSFSpaceParameter,
        config: LocationOmissionConfig,
        lossScore: number
    ): number {
        const accuracyReduction = lossScore * config.comprehensionImpact;
        const currentAccuracy = space.accuracy ?? 1;
        space.accuracy = Math.max(0, currentAccuracy - accuracyReduction);

        return accuracyReduction;
    }

    /**
     * Ajoute les métadonnées d'omission
     * @param space Paramètre d'espace à modifier
     * @param config Configuration d'omission
     * @param omittedTypes Types omis
     * @private
     */
    private addOmissionMetadata(
        space: ExtendedLSFSpaceParameter,
        config: LocationOmissionConfig,
        omittedTypes: SpatialInformationType[]
    ): void {
        if (!space.metadata) {
            space.metadata = {};
        }

        space.metadata.locationOmission = {
            omissionType: config.omissionType,
            lossLevel: config.lossLevel,
            omittedInformationTypes: omittedTypes,
            vulnerableZones: config.vulnerableZones,
            timestamp: new Date().toISOString(),
            impactScore: this.impactScore
        };
    }

    /**
     * Calcule le score d'impact de la transformation
     * @param result Résultat de l'omission
     * @param context Contexte de transformation
     * @private
     */
    private calculateImpactScore(result: LocationOmissionResult, context: SpaceTransformationContext): void {
        const informationImpact = result.informationLossScore;
        const zoneImpact = result.affectedZones.length / Object.values(SpatialZoneType).length;
        const recoveryBonus = result.recoveryPotential * 0.2;
        const accuracyImpact = result.finalAccuracyImpact;

        this.impactScore = Math.min(1, Math.max(0,
            (informationImpact + zoneImpact + accuracyImpact - recoveryBonus) * context.severity
        ));
    }

    /**
     * Valide que le paramètre d'espace peut être transformé
     * @param space Paramètre d'espace à valider
     * @returns true si le paramètre est valide pour la transformation
     */
    public validate(space: ExtendedLSFSpaceParameter): boolean {
        if (!space) {
            return false;
        }

        // Vérifie les propriétés de base
        const hasValidAccuracy = typeof space.accuracy === 'number' &&
            space.accuracy >= 0 && space.accuracy <= 1;

        const hasValidScale = space.scale === undefined ||
            (typeof space.scale === 'number' && space.scale > 0);

        return hasValidAccuracy && hasValidScale;
    }

    /**
     * Obtient le score d'impact de la dernière transformation
     * @returns Score d'impact entre 0 et 1
     */
    public getImpactScore(): number {
        return this.impactScore;
    }

    /**
     * Réinitialise le score d'impact
     */
    public resetImpactScore(): void {
        this.impactScore = 0;
    }
}