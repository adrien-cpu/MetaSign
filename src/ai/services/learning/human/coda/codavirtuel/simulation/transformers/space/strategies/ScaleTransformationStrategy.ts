/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/strategies/ScaleTransformationStrategy.ts
 * @description Stratégie de transformation pour la réduction d'espace de signation en LSF
 * Simule les erreurs de contrainte d'espace et de réduction de la zone de signation
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import { ExtendedLSFSpaceParameter } from '../types/ExtendedLSFTypes';
import { SpaceTransformationContext } from '../types/SpaceTransformationTypes';
import { Logger } from '@/ai/utils/Logger';

/**
 * Types de réduction d'espace
 */
enum SpaceReductionType {
    UNIFORM = 'UNIFORM',               // Réduction uniforme
    HORIZONTAL = 'HORIZONTAL',         // Réduction horizontale
    VERTICAL = 'VERTICAL',             // Réduction verticale
    PERIPHERAL = 'PERIPHERAL',         // Réduction périphérique
    ADAPTIVE = 'ADAPTIVE'              // Réduction adaptative
}

/**
 * Niveaux de contrainte d'espace
 */
enum SpaceConstraintLevel {
    MINIMAL = 'MINIMAL',     // Contrainte minimale
    MODERATE = 'MODERATE',   // Contrainte modérée
    SEVERE = 'SEVERE',       // Contrainte sévère
    EXTREME = 'EXTREME'      // Contrainte extrême
}

/**
 * Configuration de réduction d'échelle
 */
interface ScaleReductionConfig {
    /** Type de réduction à appliquer */
    reductionType: SpaceReductionType;

    /** Niveau de contrainte */
    constraintLevel: SpaceConstraintLevel;

    /** Facteur de réduction minimale */
    minReductionFactor: number;

    /** Facteur de réduction maximale */
    maxReductionFactor: number;

    /** Impact sur la précision */
    accuracyImpact: number;

    /** Compensation possible */
    compensationPossible: boolean;
}

/**
 * Résultat de la transformation d'échelle
 */
interface ScaleTransformationResult {
    /** Échelle finale appliquée */
    finalScale: number;

    /** Type de réduction effectuée */
    appliedReduction: SpaceReductionType;

    /** Compensation appliquée */
    compensationApplied: boolean;

    /** Impact sur la qualité */
    qualityImpact: number;
}

/**
 * Stratégie de transformation pour la réduction d'espace de signation
 * 
 * Cette stratégie simule les contraintes d'espace typiques rencontrées
 * par les apprenants, comme la réduction de la zone de signation due
 * à l'inhibition, à l'espace limité, ou aux habitudes gestuelles.
 */
export class ScaleTransformationStrategy {
    private readonly logger: Logger;
    private impactScore: number = 0;
    private readonly reductionConfigs: ReadonlyMap<SpaceConstraintLevel, ScaleReductionConfig>;

    /**
     * Initialise la stratégie de transformation d'échelle
     */
    constructor() {
        this.logger = new Logger('ScaleTransformationStrategy');
        this.reductionConfigs = this.initializeReductionConfigs();
    }

    /**
     * Initialise les configurations de réduction par niveau
     * @returns Map des configurations indexées par niveau de contrainte
     * @private
     */
    private initializeReductionConfigs(): ReadonlyMap<SpaceConstraintLevel, ScaleReductionConfig> {
        return new Map([
            [SpaceConstraintLevel.MINIMAL, {
                reductionType: SpaceReductionType.ADAPTIVE,
                constraintLevel: SpaceConstraintLevel.MINIMAL,
                minReductionFactor: 0.85,
                maxReductionFactor: 0.95,
                accuracyImpact: 0.05,
                compensationPossible: true
            }],
            [SpaceConstraintLevel.MODERATE, {
                reductionType: SpaceReductionType.UNIFORM,
                constraintLevel: SpaceConstraintLevel.MODERATE,
                minReductionFactor: 0.65,
                maxReductionFactor: 0.85,
                accuracyImpact: 0.15,
                compensationPossible: true
            }],
            [SpaceConstraintLevel.SEVERE, {
                reductionType: SpaceReductionType.PERIPHERAL,
                constraintLevel: SpaceConstraintLevel.SEVERE,
                minReductionFactor: 0.40,
                maxReductionFactor: 0.65,
                accuracyImpact: 0.30,
                compensationPossible: false
            }],
            [SpaceConstraintLevel.EXTREME, {
                reductionType: SpaceReductionType.HORIZONTAL,
                constraintLevel: SpaceConstraintLevel.EXTREME,
                minReductionFactor: 0.20,
                maxReductionFactor: 0.40,
                accuracyImpact: 0.50,
                compensationPossible: false
            }]
        ]);
    }

    /**
     * Applique la transformation de réduction d'échelle
     * @param space Paramètre d'espace étendu à modifier
     * @param context Contexte de transformation
     */
    public apply(space: ExtendedLSFSpaceParameter, context: SpaceTransformationContext): void {
        if (!this.validate(space)) {
            this.logger.warn('Paramètre d\'espace invalide pour la transformation d\'échelle');
            return;
        }

        try {
            const constraintLevel = this.determineConstraintLevel(context.severity);
            const config = this.reductionConfigs.get(constraintLevel);

            if (!config) {
                this.logger.error(`Configuration de réduction non trouvée pour le niveau ${constraintLevel}`);
                return;
            }

            const result = this.applyScaleReduction(space, config, context);
            this.calculateImpactScore(result, context);

            this.logger.debug(
                `Réduction d'échelle ${result.appliedReduction} appliquée. ` +
                `Échelle finale: ${result.finalScale}, Impact: ${this.impactScore}`
            );

        } catch (error) {
            this.logger.error('Erreur lors de l\'application de la transformation d\'échelle:', error);
            this.impactScore = 0;
        }
    }

    /**
     * Détermine le niveau de contrainte basé sur la sévérité
     * @param severity Sévérité du contexte (0-1)
     * @returns Niveau de contrainte approprié
     * @private
     */
    private determineConstraintLevel(severity: number): SpaceConstraintLevel {
        if (severity >= 0.8) return SpaceConstraintLevel.EXTREME;
        if (severity >= 0.6) return SpaceConstraintLevel.SEVERE;
        if (severity >= 0.3) return SpaceConstraintLevel.MODERATE;
        return SpaceConstraintLevel.MINIMAL;
    }

    /**
     * Applique la réduction d'échelle selon la configuration
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de réduction
     * @param context Contexte de transformation
     * @returns Résultat de la transformation
     * @private
     */
    private applyScaleReduction(
        space: ExtendedLSFSpaceParameter,
        config: ScaleReductionConfig,
        context: SpaceTransformationContext
    ): ScaleTransformationResult {
        const currentScale = space.scale ?? 1;
        const reductionFactor = this.calculateReductionFactor(config, context);
        const newScale = Math.max(0.1, currentScale * reductionFactor);

        // Applique la nouvelle échelle
        space.scale = newScale;

        // Applique les effets spécifiques du type de réduction
        const compensationApplied = this.applyReductionTypeEffects(space, config, context);

        // Affecte la précision
        const accuracyReduction = config.accuracyImpact * (1 - reductionFactor);
        space.accuracy = Math.max(0, (space.accuracy ?? 1) - accuracyReduction);

        // Ajoute les métadonnées
        this.addScaleMetadata(space, config, newScale);

        return {
            finalScale: newScale,
            appliedReduction: config.reductionType,
            compensationApplied,
            qualityImpact: accuracyReduction
        };
    }

    /**
     * Calcule le facteur de réduction à appliquer
     * @param config Configuration de réduction
     * @param context Contexte de transformation
     * @returns Facteur de réduction entre minReductionFactor et maxReductionFactor
     * @private
     */
    private calculateReductionFactor(config: ScaleReductionConfig, context: SpaceTransformationContext): number {
        const range = config.maxReductionFactor - config.minReductionFactor;
        const severityInfluence = 1 - context.severity; // Plus la sévérité est haute, plus la réduction est forte
        const factorAdjustment = context.factor ?? 1;

        return config.minReductionFactor + (range * severityInfluence * factorAdjustment);
    }

    /**
     * Applique les effets spécifiques selon le type de réduction
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de réduction
     * @param context Contexte de transformation
     * @returns true si une compensation a été appliquée
     * @private
     */
    private applyReductionTypeEffects(
        space: ExtendedLSFSpaceParameter,
        config: ScaleReductionConfig,
        context: SpaceTransformationContext
    ): boolean {
        switch (config.reductionType) {
            case SpaceReductionType.UNIFORM:
                return this.applyUniformReduction(space, config);

            case SpaceReductionType.HORIZONTAL:
                return this.applyHorizontalReduction(space);

            case SpaceReductionType.VERTICAL:
                return this.applyVerticalReduction(space, config);

            case SpaceReductionType.PERIPHERAL:
                return this.applyPeripheralReduction(space);

            case SpaceReductionType.ADAPTIVE:
                return this.applyAdaptiveReduction(space, config, context);

            default:
                this.logger.warn(`Type de réduction non géré: ${config.reductionType}`);
                return false;
        }
    }

    /**
     * Applique une réduction uniforme
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de réduction
     * @returns true si compensation appliquée
     * @private
     */
    private applyUniformReduction(space: ExtendedLSFSpaceParameter, config: ScaleReductionConfig): boolean {
        // Réduction uniforme dans toutes les directions
        // Peut causer une légère confusion de zones
        if (config.constraintLevel !== SpaceConstraintLevel.MINIMAL) {
            space.zoneConfusion = true;
        }

        return config.compensationPossible;
    }

    /**
     * Applique une réduction horizontale
     * @param space Paramètre d'espace à modifier
     * @returns true si compensation appliquée
     * @private
     */
    private applyHorizontalReduction(space: ExtendedLSFSpaceParameter): boolean {
        // Réduction principalement horizontale - affecte les références latérales
        space.zoneConfusion = true;
        space.referenceConsistency = false;

        return false; // Difficile de compenser une réduction horizontale
    }

    /**
     * Applique une réduction verticale
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de réduction
     * @returns true si compensation appliquée
     * @private
     */
    private applyVerticalReduction(space: ExtendedLSFSpaceParameter, config: ScaleReductionConfig): boolean {
        // Réduction principalement verticale - affecte moins les références
        if (config.constraintLevel === SpaceConstraintLevel.EXTREME) {
            space.locationOmission = true;
        }

        return config.compensationPossible;
    }

    /**
     * Applique une réduction périphérique
     * @param space Paramètre d'espace à modifier
     * @returns true si compensation appliquée
     * @private
     */
    private applyPeripheralReduction(space: ExtendedLSFSpaceParameter): boolean {
        // Perte des zones périphériques - concentration au centre
        space.zoneConfusion = true;
        space.randomPlacement = true; // Tendance à ramener vers le centre

        return false; // Difficile de compenser la perte de périphérie
    }

    /**
     * Applique une réduction adaptative
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de réduction
     * @param context Contexte de transformation
     * @returns true si compensation appliquée
     * @private
     */
    private applyAdaptiveReduction(
        space: ExtendedLSFSpaceParameter,
        config: ScaleReductionConfig,
        context: SpaceTransformationContext
    ): boolean {
        // Réduction intelligente qui essaie de préserver la sémantique
        if (context.preserveSemantics) {
            // Évite les effets les plus dommageables
            return true;
        } else {
            // Réduction plus agressive si la sémantique n'est pas prioritaire
            space.zoneConfusion = true;
            return false;
        }
    }

    /**
     * Ajoute les métadonnées de transformation d'échelle
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de réduction
     * @param finalScale Échelle finale appliquée
     * @private
     */
    private addScaleMetadata(
        space: ExtendedLSFSpaceParameter,
        config: ScaleReductionConfig,
        finalScale: number
    ): void {
        if (!space.metadata) {
            space.metadata = {};
        }

        space.metadata.scaleTransformation = {
            reductionType: config.reductionType,
            constraintLevel: config.constraintLevel,
            originalScale: space.scale,
            finalScale,
            timestamp: new Date().toISOString(),
            impactScore: this.impactScore
        };
    }

    /**
     * Calcule le score d'impact de la transformation
     * @param result Résultat de la transformation
     * @param context Contexte de transformation
     * @private
     */
    private calculateImpactScore(result: ScaleTransformationResult, context: SpaceTransformationContext): void {
        const scaleImpact = 1 - result.finalScale; // Plus l'échelle est réduite, plus l'impact est fort
        const qualityImpact = result.qualityImpact;
        const compensationBonus = result.compensationApplied ? 0.2 : 0;

        this.impactScore = Math.min(1, Math.max(0, (scaleImpact + qualityImpact - compensationBonus) * context.severity));
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

        // Vérifie que l'échelle actuelle est valide et modifiable
        const hasValidScale = space.scale === undefined ||
            (typeof space.scale === 'number' && space.scale > 0.1);

        const hasValidAccuracy = typeof space.accuracy === 'number' &&
            space.accuracy >= 0 && space.accuracy <= 1;

        return hasValidScale && hasValidAccuracy;
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