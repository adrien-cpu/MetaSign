// src/ai/specialized/spatial/validation/SpatialValidator.ts

import { ISpatialValidator } from './interfaces/ISpatialValidator';
import {
    SpatialLayout,
    SpatialStructure,
    SpatialValidationError
} from '../types';

/**
 * Service de validation des structures spatiales
 * Responsable de la vérification de cohérence et de validité
 */
export class SpatialValidator implements ISpatialValidator {
    /** Seuil minimum de cohérence acceptable */
    private readonly COHERENCE_THRESHOLD = 0.85;

    /**
     * Constructeur
     */
    constructor() { }

    /**
     * Valide une structure spatiale complète
     * @param layout Disposition spatiale à valider
     * @throws SpatialValidationError si la validation échoue
     */
    public async validateStructure(layout: SpatialLayout): Promise<void> {
        // Exécution des validations
        const validationResults = {
            zoneCoherence: await this.validateZoneCoherence(layout),
            relationConsistency: await this.validateRelationConsistency(layout),
            proformeValidity: await this.validateProformeUsage(layout)
        };

        // Vérification des seuils
        if (!this.meetsValidationThresholds(validationResults)) {
            throw new SpatialValidationError('Spatial structure validation failed', validationResults);
        }
    }

    /**
     * Mesure la cohérence d'une structure spatiale
     * @param structure Structure spatiale à évaluer
     * @returns Score de cohérence (0-1)
     */
    public async measureCoherence(structure: SpatialStructure): Promise<number> {
        const coherenceFactors = {
            spatialConsistency: await this.measureSpatialConsistency(structure),
            referenceStability: await this.measureReferenceStability(structure),
            proformeUsage: await this.evaluateProformeUsage(structure)
        };

        return this.calculateOverallCoherence(coherenceFactors);
    }

    /**
     * Valide la cohérence des zones dans une disposition
     * @param layout Disposition spatiale
     * @returns Score de cohérence des zones (0-1)
     */
    public async validateZoneCoherence(layout: SpatialLayout): Promise<number> {
        // Vérification de la cohérence des zones
        // - Distribution spatiale appropriée
        // - Chevauchements minimaux
        // - Utilisation efficace de l'espace

        const zones = layout.getZones();

        // Vérifications basiques
        if (zones.length === 0) {
            return 0;
        }

        // Pénalité pour les chevauchements
        let overlapPenalty = 0;

        // Pour chaque paire de zones, vérifier le chevauchement
        for (let i = 0; i < zones.length; i++) {
            for (let j = i + 1; j < zones.length; j++) {
                // Dans une implémentation réelle, calcul précis du chevauchement
                // Pour cet exemple, pénalité simplifiée basée sur la distance entre les centres

                const zone1 = zones[i];
                const zone2 = zones[j];

                const distance = Math.sqrt(
                    Math.pow(zone1.area.center.x - zone2.area.center.x, 2) +
                    Math.pow(zone1.area.center.y - zone2.area.center.y, 2) +
                    Math.pow(zone1.area.center.z - zone2.area.center.z, 2)
                );

                // Distance minimale pour éviter un chevauchement
                const minSeparation =
                    (zone1.area.dimensions.width + zone2.area.dimensions.width) / 2 +
                    (zone1.area.dimensions.height + zone2.area.dimensions.height) / 2 +
                    (zone1.area.dimensions.depth + zone2.area.dimensions.depth) / 2;

                // Normalisation pour obtenir une pénalité entre 0 et 1
                if (distance < minSeparation) {
                    overlapPenalty += 0.1 * (1 - distance / minSeparation);
                }
            }
        }

        // Évaluation de la couverture de l'espace
        // Note: il s'agit d'une heuristique simplifiée, une implémentation réelle
        // utiliserait une analyse plus sophistiquée
        const spaceCoverage = Math.min(1, zones.length / 5);

        // Score final
        return Math.max(0, Math.min(1, 0.7 - overlapPenalty + 0.3 * spaceCoverage));
    }

    /**
     * Valide la cohérence des relations dans une disposition
     * @param layout Disposition spatiale
     * @returns Score de cohérence des relations (0-1)
     */
    public async validateRelationConsistency(layout: SpatialLayout): Promise<number> {
        // Vérification de la cohérence des relations
        // - Relations appropriées entre éléments
        // - Pas de relations contradictoires
        // - Relations nécessaires présentes

        const relations = layout.getRelations();
        const elements = layout.elements;

        // Initialisation du score
        let consistencyScore = 1;

        // Si pas de relations, score minimum
        if (relations.length === 0) {
            return 0.5; // Score moyen par défaut
        }

        // Vérifier la validité des références d'éléments
        for (const relation of relations) {
            // Pénalité pour chaque relation qui référence un élément inexistant
            if (!elements.has(relation.sourceId) || !elements.has(relation.targetId)) {
                consistencyScore -= 0.2;
            }
        }

        // Vérification des relations contradictoires
        // Pour chaque paire (sourceId, targetId), il ne devrait pas y avoir
        // des relations contradictoires

        const relationPairs = new Map<string, Set<string>>();

        for (const relation of relations) {
            const pairKey = `${relation.sourceId}-${relation.targetId}`;

            if (!relationPairs.has(pairKey)) {
                relationPairs.set(pairKey, new Set());
            }

            relationPairs.get(pairKey)!.add(relation.type);
        }

        // Pénalité pour chaque paire ayant trop de types de relations différents
        for (const types of relationPairs.values()) {
            if (types.size > 2) {
                consistencyScore -= 0.1 * (types.size - 2);
            }
        }

        return Math.max(0, Math.min(1, consistencyScore));
    }

    /**
     * Valide l'utilisation des proformes dans une disposition
     * @param layout Disposition spatiale
     * @returns Score de validité des proformes (0-1)
     */
    public async validateProformeUsage(layout: SpatialLayout): Promise<number> {
        // Dans une implémentation réelle, validation complexe des proformes
        // - Proformes appropriées pour le contexte
        // - Utilisation cohérente
        // - Positionnement correct

        // Pour cet exemple, retour d'un score basique
        return 0.9;
    }

    /**
     * Mesure la cohérence spatiale d'une structure
     * @param structure Structure spatiale
     * @returns Score de cohérence spatiale (0-1)
     */
    private async measureSpatialConsistency(structure: SpatialStructure): Promise<number> {
        // Mesure de la cohérence spatiale
        // - Distribution appropriée des éléments
        // - Respect des contraintes spatiales
        // - Absence de chevauchements inappropriés

        // Pour cet exemple, retour d'un score simulé
        return 0.92;
    }

    /**
     * Mesure la stabilité des références dans une structure
     * @param structure Structure spatiale
     * @returns Score de stabilité (0-1)
     */
    private async measureReferenceStability(structure: SpatialStructure): Promise<number> {
        // Mesure de la stabilité des références
        // - Cohérence des références spatiales
        // - Stabilité temporelle des références
        // - Résolution des ambiguïtés

        // Pour cet exemple, retour d'un score simulé
        return 0.88;
    }

    /**
     * Évalue l'utilisation des proformes dans une structure
     * @param structure Structure spatiale
     * @returns Score d'évaluation (0-1)
     */
    private async evaluateProformeUsage(structure: SpatialStructure): Promise<number> {
        // Évaluation de l'utilisation des proformes
        // - Pertinence des proformes choisies
        // - Cohérence d'utilisation
        // - Adéquation au contexte culturel

        // Pour cet exemple, retour d'un score simulé
        return 0.85;
    }

    /**
     * Calcule un score de cohérence global à partir des facteurs individuels
     * @param factors Facteurs de cohérence
     * @returns Score de cohérence global (0-1)
     */
    private calculateOverallCoherence(factors: Record<string, number>): number {
        // Calcul d'un score global pondéré
        const weights = {
            spatialConsistency: 0.4,
            referenceStability: 0.3,
            proformeUsage: 0.3
        };

        let overallScore = 0;
        let totalWeight = 0;

        for (const [factor, score] of Object.entries(factors)) {
            const weight = weights[factor as keyof typeof weights] || 0;
            overallScore += score * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? overallScore / totalWeight : 0;
    }

    /**
     * Vérifie si les résultats de validation atteignent les seuils requis
     * @param results Résultats de validation
     * @returns Vrai si tous les seuils sont atteints
     */
    private meetsValidationThresholds(results: Record<string, number>): boolean {
        // Vérification que tous les scores dépassent le seuil
        for (const score of Object.values(results)) {
            if (score < this.COHERENCE_THRESHOLD) {
                return false;
            }
        }

        return true;
    }
}