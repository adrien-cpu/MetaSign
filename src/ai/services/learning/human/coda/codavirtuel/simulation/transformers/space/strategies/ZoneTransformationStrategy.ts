/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/strategies/ZoneTransformationStrategy.ts
 * @description Stratégie de transformation pour les confusions de zones spatiales
 * @author MetaSign
 * @version 1.0.1
 * @since 2025-05-29
 * @updated 2025-05-29
 */

import {
    SpaceTransformationContext,
    SpatialZoneType,
    DegradationLevel
} from '../types/SpaceTransformationTypes';
import { ExtendedLSFSpaceParameter } from '../types/ExtendedLSFTypes';

/**
 * Interface pour les stratégies de transformation d'espace syntaxique
 */
interface ISyntacticSpaceTransformationStrategy {
    apply(space: ExtendedLSFSpaceParameter, context: SpaceTransformationContext): Promise<void>;
    validate(space: ExtendedLSFSpaceParameter): boolean;
    getImpactScore(): number;
}

/**
 * Stratégie de transformation pour les confusions de zones spatiales
 * 
 * Cette stratégie simule les erreurs typiques de confusion entre
 * différentes zones de l'espace de signation en LSF
 */
export class ZoneTransformationStrategy implements ISyntacticSpaceTransformationStrategy {
    private readonly name: string = 'ZoneTransformationStrategy';
    private impactScore: number = 0;
    private readonly confusionProbabilities: Map<SpatialZoneType, SpatialZoneType[]>;

    constructor() {
        this.confusionProbabilities = this.initializeConfusionMatrix();
    }

    /**
     * Initialise la matrice de confusion entre zones spatiales
     * @returns Map des confusions possibles par zone
     * @private
     */
    private initializeConfusionMatrix(): Map<SpatialZoneType, SpatialZoneType[]> {
        const matrix = new Map<SpatialZoneType, SpatialZoneType[]>();

        // Confusions typiques observées chez les apprenants LSF
        matrix.set(SpatialZoneType.DOMINANT_SIDE, [
            SpatialZoneType.CENTER,
            SpatialZoneType.NON_DOMINANT_SIDE
        ]);

        matrix.set(SpatialZoneType.NON_DOMINANT_SIDE, [
            SpatialZoneType.CENTER,
            SpatialZoneType.DOMINANT_SIDE
        ]);

        matrix.set(SpatialZoneType.CENTER, [
            SpatialZoneType.NEUTRAL,
            SpatialZoneType.DOMINANT_SIDE,
            SpatialZoneType.NON_DOMINANT_SIDE
        ]);

        matrix.set(SpatialZoneType.UPPER, [
            SpatialZoneType.CENTER,
            SpatialZoneType.NEUTRAL
        ]);

        matrix.set(SpatialZoneType.LOWER, [
            SpatialZoneType.CENTER,
            SpatialZoneType.NEUTRAL
        ]);

        matrix.set(SpatialZoneType.PERIPHERAL, [
            SpatialZoneType.DOMINANT_SIDE,
            SpatialZoneType.NON_DOMINANT_SIDE
        ]);

        return matrix;
    }

    /**
     * Applique la transformation de confusion de zones
     * @param space Paramètre d'espace à transformer
     * @param context Contexte de transformation
     */
    public async apply(
        space: ExtendedLSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        if (!this.validate(space)) {
            throw new Error('Paramètre d\'espace invalide pour la transformation de zone');
        }

        const degradationLevel = this.calculateDegradationLevel(context.severity);

        // Application de la confusion de zone
        space.zoneConfusion = true;

        // Simulation de l'erreur selon le niveau de dégradation
        await this.applyZoneConfusion(space, degradationLevel, context);

        // Calcul de l'impact sur la précision
        const accuracyReduction = this.calculateAccuracyReduction(degradationLevel, context);
        space.accuracy = Math.max(0, (space.accuracy || 1) - accuracyReduction);

        // Mise à jour du score d'impact
        this.impactScore = this.calculateImpactScore(accuracyReduction, degradationLevel);
    }

    /**
     * Applique la confusion de zone selon le niveau de dégradation
     * @param space Paramètre d'espace
     * @param level Niveau de dégradation
     * @param context Contexte de transformation
     * @private
     */
    private async applyZoneConfusion(
        space: ExtendedLSFSpaceParameter,
        level: DegradationLevel,
        context: SpaceTransformationContext
    ): Promise<void> {
        switch (level) {
            case DegradationLevel.MINIMAL:
                await this.applyMinimalConfusion(space, context);
                break;
            case DegradationLevel.MODERATE:
                await this.applyModerateConfusion(space, context);
                break;
            case DegradationLevel.SEVERE:
                await this.applySevereConfusion(space, context);
                break;
            case DegradationLevel.CRITICAL:
                await this.applyCriticalConfusion(space, context);
                break;
        }
    }

    /**
     * Applique une confusion minimale
     * @param space Paramètre d'espace
     * @param context Contexte de transformation
     * @private
     */
    private async applyMinimalConfusion(
        space: ExtendedLSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        // Légère imprécision dans le placement
        if (space.zones && space.zones.length > 0) {
            const currentZone = space.zones[0];
            const possibleConfusions = this.confusionProbabilities.get(currentZone);

            // Utilisation du contexte pour adapter la probabilité de confusion
            const confusionProbability = context.preserveSemantics ? 0.2 : 0.3;

            if (possibleConfusions && possibleConfusions.length > 0 && Math.random() < confusionProbability) {
                const confusedZone = possibleConfusions[Math.floor(Math.random() * possibleConfusions.length)];
                space.zones = [confusedZone];
                space.confusionDetails = {
                    original: currentZone,
                    confused: confusedZone,
                    level: DegradationLevel.MINIMAL,
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    /**
     * Applique une confusion modérée
     * @param space Paramètre d'espace
     * @param context Contexte de transformation
     * @private
     */
    private async applyModerateConfusion(
        space: ExtendedLSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        // Confusion plus prononcée avec impact sur la cohérence
        space.referenceConsistency = false;

        if (space.zones) {
            // Mélange des zones avec intensité basée sur le contexte
            const shuffleIntensity = context.preserveSemantics ? 0.5 : 0.8;
            const shuffledZones = [...space.zones].sort(() => Math.random() - shuffleIntensity);
            space.zones = shuffledZones.slice(0, Math.max(1, Math.floor(shuffledZones.length / 2)));
        }

        // Ajout d'incohérences spatiales avec adaptation contextuelle
        if (space.scale !== undefined) {
            const scaleReduction = context.linguisticContext.spatialComplexity
                ? 0.6 + (context.linguisticContext.spatialComplexity as number) * 0.1
                : 0.7;
            space.scale *= (scaleReduction + Math.random() * 0.2);
        }
    }

    /**
     * Applique une confusion sévère
     * @param space Paramètre d'espace
     * @param context Contexte de transformation
     * @private
     */
    private async applySevereConfusion(
        space: ExtendedLSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        // Confusion majeure avec placement aléatoire
        space.randomPlacement = true;
        space.referenceConsistency = false;

        // Remplacement complet des zones par des zones inappropriées
        if (space.zones && space.zones.length > 0) {
            const allZones = Object.values(SpatialZoneType);
            const originalZones = [...space.zones];

            // Adaptation basée sur la préservation sémantique
            const replacementIntensity = context.preserveSemantics ? 1 : 2;

            space.zones = allZones
                .filter(zone => !originalZones.includes(zone))
                .slice(0, Math.min(replacementIntensity, originalZones.length))
                .sort(() => Math.random() - 0.5);

            // Ajout de métadonnées contextuelles
            space.metadata = {
                ...space.metadata,
                contextType: context.linguisticContext.type || 'unknown',
                preserveSemantics: context.preserveSemantics,
                severity: context.severity,
                transformationType: 'severe-confusion'
            };
        }

        // Forte réduction de l'échelle
        if (space.scale !== undefined) {
            space.scale *= 0.4;
        }
    }

    /**
     * Applique une confusion critique
     * @param space Paramètre d'espace
     * @param context Contexte de transformation
     * @private
     */
    private async applyCriticalConfusion(
        space: ExtendedLSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        // Confusion totale avec omission de localisation
        space.locationOmission = true;
        space.randomPlacement = true;
        space.referenceConsistency = false;

        // Suppression des informations spatiales
        space.zones = [];

        // Échelle minimale avec adaptation contextuelle
        space.scale = context.preserveSemantics ? 0.2 : 0.1;

        // Ajout de métadonnées d'erreur critique avec informations contextuelles
        space.criticalError = {
            type: 'TOTAL_SPATIAL_BREAKDOWN',
            timestamp: new Date().toISOString(),
            severity: 'CRITICAL',
            description: 'Complete spatial reference breakdown with total zone confusion',
            metadata: {
                semanticPreservation: context.preserveSemantics,
                linguisticComplexity: context.linguisticContext.spatialComplexity || 0,
                transformationTrigger: context.linguisticContext.type || 'unknown',
                originalAccuracy: context.originalAccuracy,
                degradationFactor: context.severity
            }
        };
    }

    /**
     * Calcule le niveau de dégradation basé sur la sévérité
     * @param severity Sévérité de la transformation (0-1)
     * @returns Niveau de dégradation correspondant
     * @private
     */
    private calculateDegradationLevel(severity: number): DegradationLevel {
        if (severity <= 0.25) return DegradationLevel.MINIMAL;
        if (severity <= 0.5) return DegradationLevel.MODERATE;
        if (severity <= 0.75) return DegradationLevel.SEVERE;
        return DegradationLevel.CRITICAL;
    }

    /**
     * Calcule la réduction de précision selon le niveau de dégradation
     * @param level Niveau de dégradation
     * @param context Contexte de transformation
     * @returns Facteur de réduction de précision
     * @private
     */
    private calculateAccuracyReduction(
        level: DegradationLevel,
        context: SpaceTransformationContext
    ): number {
        const baseReduction = {
            [DegradationLevel.MINIMAL]: 0.15,
            [DegradationLevel.MODERATE]: 0.35,
            [DegradationLevel.SEVERE]: 0.55,
            [DegradationLevel.CRITICAL]: 0.8
        };

        let reduction = baseReduction[level];

        // Ajustement basé sur la préservation sémantique
        if (context.preserveSemantics) {
            reduction *= 0.8; // Réduction moins agressive
        }

        // Ajustement basé sur le contexte linguistique
        if (context.linguisticContext.spatialComplexity) {
            const complexity = context.linguisticContext.spatialComplexity as number;
            reduction *= (1 + complexity * 0.2);
        }

        return Math.min(0.9, reduction); // Maximum 90% de réduction
    }

    /**
     * Calcule le score d'impact de la transformation
     * @param accuracyReduction Réduction de précision appliquée
     * @param level Niveau de dégradation
     * @returns Score d'impact (0-1)
     * @private
     */
    private calculateImpactScore(
        accuracyReduction: number,
        level: DegradationLevel
    ): number {
        const levelWeights = {
            [DegradationLevel.MINIMAL]: 0.2,
            [DegradationLevel.MODERATE]: 0.4,
            [DegradationLevel.SEVERE]: 0.7,
            [DegradationLevel.CRITICAL]: 1.0
        };

        return Math.min(1, accuracyReduction + levelWeights[level]);
    }

    /**
     * Valide que l'espace peut être transformé
     * @param space Paramètre d'espace à valider
     * @returns true si la transformation est possible
     */
    public validate(space: ExtendedLSFSpaceParameter): boolean {
        if (!space || typeof space !== 'object') {
            return false;
        }

        // Vérifications de base
        if (space.accuracy !== undefined && (space.accuracy < 0 || space.accuracy > 1)) {
            return false;
        }

        if (space.scale !== undefined && space.scale <= 0) {
            return false;
        }

        // L'espace ne doit pas déjà avoir une confusion critique
        if (space.criticalError) {
            return false;
        }

        return true;
    }

    /**
     * Retourne le score d'impact de la dernière transformation
     * @returns Score d'impact (0-1)
     */
    public getImpactScore(): number {
        return this.impactScore;
    }

    /**
     * Retourne le nom de la stratégie
     * @returns Nom de la stratégie
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Réinitialise l'état de la stratégie
     */
    public reset(): void {
        this.impactScore = 0;
    }
}