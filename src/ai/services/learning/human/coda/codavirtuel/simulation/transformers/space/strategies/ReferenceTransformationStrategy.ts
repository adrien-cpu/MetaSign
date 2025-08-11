/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/strategies/ReferenceTransformationStrategy.ts
 * @description Stratégie de transformation pour les violations de références spatiales en LSF
 * Simule les erreurs de cohérence et de consistance des références spatiales
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import { ExtendedLSFSpaceParameter } from '../types/ExtendedLSFTypes';
import { SpaceTransformationContext } from '../types/SpaceTransformationTypes';
import { Logger } from '@/ai/utils/Logger';

/**
 * Niveaux de violation de référence
 */
enum ReferenceViolationLevel {
    MINOR = 'MINOR',           // Violation mineure
    MODERATE = 'MODERATE',     // Violation modérée  
    SEVERE = 'SEVERE',         // Violation sévère
    CRITICAL = 'CRITICAL'      // Violation critique
}

/**
 * Types de violations de référence spatiale
 */
enum ReferenceViolationType {
    INCONSISTENT_REFERENCE = 'INCONSISTENT_REFERENCE',     // Référence incohérente
    BROKEN_ANAPHORA = 'BROKEN_ANAPHORA',                   // Anaphore brisée
    SPATIAL_DRIFT = 'SPATIAL_DRIFT',                       // Dérive spatiale
    REFERENCE_AMBIGUITY = 'REFERENCE_AMBIGUITY'            // Ambiguïté référentielle
}

/**
 * Configuration de la violation de référence
 */
interface ReferenceViolationConfig {
    /** Type de violation à appliquer */
    violationType: ReferenceViolationType;

    /** Niveau de sévérité */
    severityLevel: ReferenceViolationLevel;

    /** Facteur d'impact sur la consistance */
    consistencyImpact: number;

    /** Facteur d'impact sur la précision */
    accuracyImpact: number;
}

/**
 * Stratégie de transformation pour les violations de références spatiales
 * 
 * Cette stratégie simule les erreurs typiques dans l'utilisation et le maintien
 * des références spatiales en LSF, affectant la cohérence du discours spatial.
 */
export class ReferenceTransformationStrategy {
    private readonly logger: Logger;
    private impactScore: number = 0;
    private readonly violationConfigs: ReadonlyMap<ReferenceViolationLevel, ReferenceViolationConfig>;

    /**
     * Initialise la stratégie de transformation des références
     */
    constructor() {
        this.logger = new Logger('ReferenceTransformationStrategy');
        this.violationConfigs = this.initializeViolationConfigs();
    }

    /**
     * Initialise les configurations de violation par niveau
     * @returns Map des configurations indexées par niveau
     * @private
     */
    private initializeViolationConfigs(): ReadonlyMap<ReferenceViolationLevel, ReferenceViolationConfig> {
        return new Map([
            [ReferenceViolationLevel.MINOR, {
                violationType: ReferenceViolationType.SPATIAL_DRIFT,
                severityLevel: ReferenceViolationLevel.MINOR,
                consistencyImpact: 0.15,
                accuracyImpact: 0.05
            }],
            [ReferenceViolationLevel.MODERATE, {
                violationType: ReferenceViolationType.REFERENCE_AMBIGUITY,
                severityLevel: ReferenceViolationLevel.MODERATE,
                consistencyImpact: 0.35,
                accuracyImpact: 0.15
            }],
            [ReferenceViolationLevel.SEVERE, {
                violationType: ReferenceViolationType.BROKEN_ANAPHORA,
                severityLevel: ReferenceViolationLevel.SEVERE,
                consistencyImpact: 0.60,
                accuracyImpact: 0.30
            }],
            [ReferenceViolationLevel.CRITICAL, {
                violationType: ReferenceViolationType.INCONSISTENT_REFERENCE,
                severityLevel: ReferenceViolationLevel.CRITICAL,
                consistencyImpact: 0.85,
                accuracyImpact: 0.50
            }]
        ]);
    }

    /**
     * Applique la transformation de violation de référence
     * @param space Paramètre d'espace étendu à modifier
     * @param context Contexte de transformation
     */
    public apply(space: ExtendedLSFSpaceParameter, context: SpaceTransformationContext): void {
        if (!this.validate(space)) {
            this.logger.warn('Paramètre d\'espace invalide pour la transformation de référence');
            return;
        }

        try {
            const violationLevel = this.determineViolationLevel(context.severity);
            const config = this.violationConfigs.get(violationLevel);

            if (!config) {
                this.logger.error(`Configuration de violation non trouvée pour le niveau ${violationLevel}`);
                return;
            }

            this.applyReferenceViolation(space, config, context);
            this.calculateImpactScore(config, context);

            this.logger.debug(
                `Violation de référence ${config.violationType} appliquée avec un impact de ${this.impactScore}`
            );

        } catch (error) {
            this.logger.error('Erreur lors de l\'application de la transformation de référence:', error);
            this.impactScore = 0;
        }
    }

    /**
     * Détermine le niveau de violation basé sur la sévérité du contexte
     * @param severity Sévérité du contexte (0-1)
     * @returns Niveau de violation approprié
     * @private
     */
    private determineViolationLevel(severity: number): ReferenceViolationLevel {
        if (severity >= 0.8) return ReferenceViolationLevel.CRITICAL;
        if (severity >= 0.6) return ReferenceViolationLevel.SEVERE;
        if (severity >= 0.3) return ReferenceViolationLevel.MODERATE;
        return ReferenceViolationLevel.MINOR;
    }

    /**
     * Applique la violation de référence selon la configuration
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @param context Contexte de transformation
     * @private
     */
    private applyReferenceViolation(
        space: ExtendedLSFSpaceParameter,
        config: ReferenceViolationConfig,
        context: SpaceTransformationContext
    ): void {
        // Affecte la consistance des références
        space.referenceConsistency = false;

        // Calcule l'impact sur la précision
        const accuracyReduction = config.accuracyImpact * (context.factor ?? 1);
        const currentAccuracy = space.accuracy ?? 1;
        space.accuracy = Math.max(0, currentAccuracy - accuracyReduction);

        // Applique les effets spécifiques selon le type de violation
        this.applySpecificViolationEffects(space, config, context);

        // Ajoute les métadonnées de violation
        this.addViolationMetadata(space, config);
    }

    /**
     * Applique les effets spécifiques selon le type de violation
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @param context Contexte de transformation
     * @private
     */
    private applySpecificViolationEffects(
        space: ExtendedLSFSpaceParameter,
        config: ReferenceViolationConfig,
        context: SpaceTransformationContext
    ): void {
        switch (config.violationType) {
            case ReferenceViolationType.INCONSISTENT_REFERENCE:
                this.applyInconsistentReference(space, config);
                break;

            case ReferenceViolationType.BROKEN_ANAPHORA:
                this.applyBrokenAnaphora(space, config);
                break;

            case ReferenceViolationType.SPATIAL_DRIFT:
                this.applySpatialDrift(space, config, context);
                break;

            case ReferenceViolationType.REFERENCE_AMBIGUITY:
                this.applyReferenceAmbiguity(space, config);
                break;

            default:
                this.logger.warn(`Type de violation non géré: ${config.violationType}`);
        }
    }

    /**
     * Applique une référence incohérente
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @private
     */
    private applyInconsistentReference(space: ExtendedLSFSpaceParameter, config: ReferenceViolationConfig): void {
        // Force la confusion des zones
        space.zoneConfusion = true;

        // Réduit la consistance de façon critique
        const scaleReduction = config.consistencyImpact;
        space.scale = Math.max(0.1, (space.scale ?? 1) - scaleReduction);
    }

    /**
     * Applique une anaphore brisée
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @private
     */
    private applyBrokenAnaphora(space: ExtendedLSFSpaceParameter, config: ReferenceViolationConfig): void {
        // Cause une omission de localisation
        space.locationOmission = true;

        // Affecte la précision spatiale
        const precisionLoss = config.consistencyImpact * 0.8;
        space.accuracy = Math.max(0, (space.accuracy ?? 1) - precisionLoss);
    }

    /**
     * Applique une dérive spatiale
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @param context Contexte de transformation
     * @private
     */
    private applySpatialDrift(
        space: ExtendedLSFSpaceParameter,
        config: ReferenceViolationConfig,
        context: SpaceTransformationContext
    ): void {
        // Introduit un placement légèrement aléatoire
        space.randomPlacement = true;

        // Réduit progressivement la précision
        const driftFactor = config.accuracyImpact * (context.factor ?? 1);
        space.accuracy = Math.max(0.2, (space.accuracy ?? 1) - driftFactor);
    }

    /**
     * Applique une ambiguïté référentielle
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @private
     */
    private applyReferenceAmbiguity(space: ExtendedLSFSpaceParameter, config: ReferenceViolationConfig): void {
        // Crée une confusion entre zones
        space.zoneConfusion = true;

        // Réduit l'échelle pour créer de l'ambiguïté
        const ambiguityFactor = config.consistencyImpact * 0.6;
        space.scale = Math.max(0.3, (space.scale ?? 1) - ambiguityFactor);
    }

    /**
     * Ajoute les métadonnées de violation à l'espace
     * @param space Paramètre d'espace à modifier
     * @param config Configuration de violation
     * @private
     */
    private addViolationMetadata(space: ExtendedLSFSpaceParameter, config: ReferenceViolationConfig): void {
        if (!space.metadata) {
            space.metadata = {};
        }

        space.metadata.referenceViolation = {
            type: config.violationType,
            level: config.severityLevel,
            timestamp: new Date().toISOString(),
            impactScore: this.impactScore
        };
    }

    /**
     * Calcule le score d'impact de la transformation
     * @param config Configuration de violation
     * @param context Contexte de transformation
     * @private
     */
    private calculateImpactScore(config: ReferenceViolationConfig, context: SpaceTransformationContext): void {
        const baseImpact = config.consistencyImpact + config.accuracyImpact;
        const contextMultiplier = context.severity * (context.factor ?? 1);
        this.impactScore = Math.min(1, baseImpact * contextMultiplier);
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

        // Vérifie que les propriétés requises sont présentes et valides
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