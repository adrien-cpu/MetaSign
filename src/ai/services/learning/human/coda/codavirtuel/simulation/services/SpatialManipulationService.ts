/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/SpatialManipulationService.ts
 * @description Service de manipulation et transformation spatiale LSF
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce service fournit des utilitaires pour manipuler les espaces référentiels,
 * appliquer des transformations et gérer les erreurs spatiales.
 * 
 * @module SpatialManipulationService
 * @requires LSFSpatialSystem
 */

// Types fallback pour éviter les erreurs de modules manquants
interface LSFReferentialZone {
    id: string;
    name: string;
    established: boolean;
    usage_frequency: number;
    consistency: number;
    semanticRole: string;
    coordinates: {
        x: [number, number];
        y: [number, number];
        z: [number, number];
    };
}

const LSF_SPATIAL_SYSTEM = {
    complexity_levels: {
        simple: { zones_max: 2 },
        moderate: { zones_max: 4 },
        complex: { zones_max: 6 },
        expert: { zones_max: 10 }
    }
};

/**
 * Interface pour les cibles d'incohérence
 */
export interface InconsistencyTarget {
    readonly type: string;
    readonly description: string;
    readonly affected_zones: readonly string[];
    readonly severity: number;
}

/**
 * Interface pour les références omissibles
 */
export interface OmissibleReference {
    readonly id: string;
    readonly description: string;
    readonly importance: number;
    readonly zone_id: string;
}

/**
 * Interface pour les patterns de confusion pronominale
 */
export interface PronounConfusionPattern {
    readonly pattern_id: string;
    readonly description: string;
    readonly affected_pronouns: readonly string[];
    readonly confusion_type: string;
    readonly severity: number;
}

/**
 * Interface pour l'organisation spatiale
 */
export interface SpatialOrganization {
    readonly type: string;
    readonly zones: readonly string[];
    readonly coherence_score: number;
    readonly complexity_level: string;
}

/**
 * Interface pour le plan de réorganisation
 */
export interface ReorganizationPlan {
    readonly type: string;
    readonly affected_zones: readonly string[];
    readonly changes: readonly {
        readonly zone_id: string;
        readonly old_position: { x: number; y: number; z: number };
        readonly new_position: { x: number; y: number; z: number };
    }[];
    readonly expected_impact: number;
}

/**
 * Service de manipulation spatiale LSF
 * Fournit des utilitaires pour transformer et manipuler les espaces référentiels
 */
export class SpatialManipulationService {
    /**
     * Identifie les candidats pour l'ambiguïté
     * @param activeZones - Zones actives
     * @returns Zones candidates
     */
    public static identifyAmbiguityCandidates(activeZones: Map<string, LSFReferentialZone>): readonly LSFReferentialZone[] {
        const candidates: LSFReferentialZone[] = [];

        activeZones.forEach(zone => {
            // Les zones établies avec usage fréquent sont de bons candidats
            if (zone.established && zone.usage_frequency > 0.3 && zone.consistency > 0.7) {
                candidates.push(zone);
            }
        });

        return candidates;
    }

    /**
     * Sélectionne les cibles pour l'ambiguïté
     * @param candidates - Zones candidates
     * @param severity - Sévérité de la transformation
     * @returns Zones sélectionnées
     */
    public static selectAmbiguityTargets(candidates: readonly LSFReferentialZone[], severity: number): readonly LSFReferentialZone[] {
        // Plus la sévérité est élevée, plus on inclut de zones
        const targetCount = Math.min(candidates.length, Math.ceil(2 + severity * 2));

        // Priorise les zones avec des rôles sémantiques similaires
        const sortedCandidates = [...candidates].sort((a, b) => {
            // Priorité aux zones de même rôle sémantique
            if (a.semanticRole === b.semanticRole) {
                return b.usage_frequency - a.usage_frequency;
            }
            return a.semanticRole.localeCompare(b.semanticRole);
        });

        return sortedCandidates.slice(0, targetCount);
    }

    /**
     * Calcule l'impact de l'ambiguïté
     * @param zones - Zones ambiguës
     * @param severity - Sévérité
     * @returns Impact sur la précision
     */
    public static calculateAmbiguityImpact(zones: readonly LSFReferentialZone[], severity: number): number {
        // Impact de base selon le nombre de zones
        let impact = 0.2 + (zones.length - 2) * 0.1;

        // Bonus d'impact pour les zones de même rôle sémantique
        const semanticRoles = new Set(zones.map(z => z.semanticRole));
        if (semanticRoles.size === 1) {
            impact += 0.2; // Ambiguïté plus problématique
        }

        // Modulation par la sévérité
        impact *= (0.5 + severity * 0.5);

        return Math.min(0.8, impact);
    }

    /**
     * Identifie les cibles d'incohérence
     * @param activeZones - Zones actives
     * @returns Cibles d'incohérence
     */
    public static identifyInconsistencyTargets(activeZones: Map<string, LSFReferentialZone>): readonly InconsistencyTarget[] {
        const targets: InconsistencyTarget[] = [];

        // Incohérence de rôle sémantique
        const semanticInconsistencies = this.findSemanticInconsistencies(activeZones);
        targets.push(...semanticInconsistencies);

        // Incohérence de position
        const positionalInconsistencies = this.findPositionalInconsistencies(activeZones);
        targets.push(...positionalInconsistencies);

        // Incohérence temporelle
        const temporalInconsistencies = this.findTemporalInconsistencies(activeZones);
        targets.push(...temporalInconsistencies);

        return targets;
    }

    /**
     * Sélectionne le type d'incohérence
     * @param targets - Cibles disponibles
     * @param severity - Sévérité
     * @returns Incohérence sélectionnée
     */
    public static selectInconsistencyType(targets: readonly InconsistencyTarget[], severity: number): InconsistencyTarget {
        // Filtre selon la sévérité
        const appropriateTargets = targets.filter(target =>
            target.severity <= severity + 0.2 && target.severity >= severity - 0.2
        );

        if (appropriateTargets.length === 0) {
            return targets[0]; // Fallback
        }

        // Sélection aléatoire pondérée
        const randomIndex = Math.floor(Math.random() * appropriateTargets.length);
        return appropriateTargets[randomIndex];
    }

    /**
     * Calcule l'impact de l'incohérence
     * @param inconsistency - Type d'incohérence
     * @param severity - Sévérité
     * @returns Impact sur la précision
     */
    public static calculateInconsistencyImpact(inconsistency: InconsistencyTarget, severity: number): number {
        const baseImpact = inconsistency.severity;
        const zoneImpact = inconsistency.affected_zones.length * 0.1;

        return Math.min(0.9, (baseImpact + zoneImpact) * severity);
    }

    /**
     * Identifie les références omissibles
     * @param activeZones - Zones actives
     * @returns Références omissibles
     */
    public static identifyOmissibleReferences(activeZones: Map<string, LSFReferentialZone>): readonly OmissibleReference[] {
        const omissible: OmissibleReference[] = [];

        activeZones.forEach((zone, zoneId) => {
            // Les zones peu utilisées sont candidates à l'omission
            if (zone.usage_frequency < 0.5 && zone.consistency > 0.5) {
                omissible.push({
                    id: `ref_${zoneId}`,
                    description: `Référence à ${zone.name}`,
                    importance: zone.usage_frequency,
                    zone_id: zoneId
                });
            }

            // Références redondantes
            if (zone.usage_frequency > 0.8) {
                omissible.push({
                    id: `redundant_${zoneId}`,
                    description: `Référence redondante à ${zone.name}`,
                    importance: 0.3,
                    zone_id: zoneId
                });
            }
        });

        return omissible;
    }

    /**
     * Sélectionne les cibles d'omission
     * @param references - Références omissibles
     * @param severity - Sévérité
     * @returns Références à omettre
     */
    public static selectOmissionTargets(references: readonly OmissibleReference[], severity: number): readonly OmissibleReference[] {
        const targetCount = Math.ceil(references.length * severity);

        // Tri par importance croissante (moins important = plus susceptible d'être omis)
        const sortedReferences = [...references].sort((a, b) => a.importance - b.importance);

        return sortedReferences.slice(0, targetCount);
    }

    /**
     * Calcule l'impact de l'omission
     * @param references - Références omises
     * @returns Impact sur la précision
     */
    public static calculateOmissionImpact(references: readonly OmissibleReference[]): number {
        const totalImportance = references.reduce((sum, ref) => sum + ref.importance, 0);
        const averageImportance = references.length > 0 ? totalImportance / references.length : 0;

        return Math.min(0.7, averageImportance + references.length * 0.1);
    }

    /**
     * Identifie les patterns de confusion pronominale
     * @param activeZones - Zones actives
     * @returns Patterns de confusion
     */
    public static identifyPronounConfusionPatterns(activeZones: Map<string, LSFReferentialZone>): readonly PronounConfusionPattern[] {
        const patterns: PronounConfusionPattern[] = [];

        // Pattern de confusion sujet/objet
        const subjectZones = Array.from(activeZones.values()).filter(z => z.semanticRole === 'subject');
        const objectZones = Array.from(activeZones.values()).filter(z => z.semanticRole === 'object');

        if (subjectZones.length > 0 && objectZones.length > 0) {
            patterns.push({
                pattern_id: 'subject_object_confusion',
                description: 'Confusion entre pronoms sujet et objet',
                affected_pronouns: ['il/elle', 'lui/elle'],
                confusion_type: 'role_reversal',
                severity: 0.6
            });
        }

        // Pattern de confusion temporelle
        const temporalZones = Array.from(activeZones.values()).filter(z => z.semanticRole === 'temporal');
        if (temporalZones.length > 1) {
            patterns.push({
                pattern_id: 'temporal_confusion',
                description: 'Confusion entre références temporelles',
                affected_pronouns: ['maintenant', 'alors', 'après'],
                confusion_type: 'temporal_mismatch',
                severity: 0.4
            });
        }

        // Pattern de confusion par proximité spatiale
        const proximityPairs = this.findProximityPairs(activeZones);
        if (proximityPairs.length > 0) {
            patterns.push({
                pattern_id: 'proximity_confusion',
                description: 'Confusion due à la proximité spatiale',
                affected_pronouns: ['celui-ci', 'celui-là'],
                confusion_type: 'spatial_proximity',
                severity: 0.5
            });
        }

        return patterns;
    }

    /**
     * Sélectionne un pattern de confusion
     * @param patterns - Patterns disponibles
     * @param severity - Sévérité
     * @returns Pattern sélectionné
     */
    public static selectConfusionPattern(patterns: readonly PronounConfusionPattern[], severity: number): PronounConfusionPattern {
        // Filtre par sévérité appropriée
        const appropriatePatterns = patterns.filter(pattern =>
            Math.abs(pattern.severity - severity) < 0.3
        );

        if (appropriatePatterns.length === 0) {
            return patterns[0]; // Fallback
        }

        const randomIndex = Math.floor(Math.random() * appropriatePatterns.length);
        return appropriatePatterns[randomIndex];
    }

    /**
     * Calcule l'impact de la confusion
     * @param pattern - Pattern de confusion
     * @param severity - Sévérité
     * @returns Impact sur la précision
     */
    public static calculateConfusionImpact(pattern: PronounConfusionPattern, severity: number): number {
        const baseImpact = pattern.severity;
        const pronounImpact = pattern.affected_pronouns.length * 0.05;

        return Math.min(0.8, (baseImpact + pronounImpact) * severity);
    }

    /**
     * Analyse l'organisation spatiale actuelle
     * @param activeZones - Zones actives
     * @returns Organisation actuelle
     */
    public static analyzeSpatialOrganization(activeZones: Map<string, LSFReferentialZone>): SpatialOrganization {
        const zones = Array.from(activeZones.keys());
        const establishedZones = Array.from(activeZones.values()).filter(z => z.established);

        // Calcul du score de cohérence
        const coherence_score = establishedZones.length > 0 ?
            establishedZones.reduce((sum, zone) => sum + zone.consistency, 0) / establishedZones.length : 1;

        // Détermination du niveau de complexité
        const complexity_level = this.determineComplexityLevel(activeZones);

        return {
            type: 'current_organization',
            zones,
            coherence_score,
            complexity_level
        };
    }

    /**
     * Génère un plan de réorganisation
     * @param currentOrg - Organisation actuelle
     * @param severity - Sévérité
     * @returns Plan de réorganisation
     */
    public static generateReorganizationPlan(currentOrg: SpatialOrganization, severity: number): ReorganizationPlan | null {
        if (currentOrg.zones.length < 2) {
            return null; // Pas assez de zones pour réorganiser
        }

        const affected_zones = this.selectReorganizationTargets(currentOrg.zones, severity);
        const changes = this.generatePositionChanges(affected_zones, severity);

        return {
            type: severity > 0.7 ? 'major_reorganization' : 'minor_reorganization',
            affected_zones,
            changes,
            expected_impact: severity * 0.6
        };
    }

    /**
     * Applique une réorganisation aux zones
     * @param plan - Plan de réorganisation
     * @param activeZones - Zones actives
     */
    public static applyReorganizationToZones(plan: ReorganizationPlan, activeZones: Map<string, LSFReferentialZone>): void {
        plan.changes.forEach(change => {
            const zone = activeZones.get(change.zone_id);
            if (zone) {
                // Mise à jour des coordonnées (simplifiée)
                zone.consistency = Math.max(0.1, zone.consistency - 0.2);
            }
        });
    }

    /**
     * Calcule l'impact de la réorganisation
     * @param plan - Plan de réorganisation
     * @returns Impact sur la précision
     */
    public static calculateReorganizationImpact(plan: ReorganizationPlan): number {
        const baseImpact = plan.expected_impact;
        const zoneImpact = plan.affected_zones.length * 0.1;
        const changeImpact = plan.changes.length * 0.05;

        return Math.min(0.8, baseImpact + zoneImpact + changeImpact);
    }

    // Méthodes utilitaires privées

    /**
     * Trouve les incohérences sémantiques
     * @param activeZones - Zones actives
     * @returns Incohérences sémantiques
     * @private
     */
    private static findSemanticInconsistencies(activeZones: Map<string, LSFReferentialZone>): readonly InconsistencyTarget[] {
        const inconsistencies: InconsistencyTarget[] = [];

        const subjectZones = Array.from(activeZones.values()).filter(z => z.semanticRole === 'subject');
        const objectZones = Array.from(activeZones.values()).filter(z => z.semanticRole === 'object');

        if (subjectZones.length > 1) {
            inconsistencies.push({
                type: 'multiple_subjects',
                description: 'Multiples zones sujets établies simultanément',
                affected_zones: subjectZones.map(z => z.id),
                severity: 0.7
            });
        }

        if (objectZones.length > 2) {
            inconsistencies.push({
                type: 'excessive_objects',
                description: 'Trop de zones objets pour la complexité du discours',
                affected_zones: objectZones.slice(2).map(z => z.id),
                severity: 0.5
            });
        }

        return inconsistencies;
    }

    /**
     * Trouve les incohérences positionnelles
     * @param activeZones - Zones actives
     * @returns Incohérences positionnelles
     * @private
     */
    private static findPositionalInconsistencies(activeZones: Map<string, LSFReferentialZone>): readonly InconsistencyTarget[] {
        const inconsistencies: InconsistencyTarget[] = [];

        // Vérifie les chevauchements de zones
        const establishedZones = Array.from(activeZones.values()).filter(z => z.established);

        for (let i = 0; i < establishedZones.length; i++) {
            for (let j = i + 1; j < establishedZones.length; j++) {
                if (this.zonesOverlap(establishedZones[i], establishedZones[j])) {
                    inconsistencies.push({
                        type: 'zone_overlap',
                        description: `Chevauchement entre ${establishedZones[i].name} et ${establishedZones[j].name}`,
                        affected_zones: [establishedZones[i].id, establishedZones[j].id],
                        severity: 0.6
                    });
                }
            }
        }

        return inconsistencies;
    }

    /**
     * Trouve les incohérences temporelles
     * @param activeZones - Zones actives
     * @returns Incohérences temporelles
     * @private
     */
    private static findTemporalInconsistencies(activeZones: Map<string, LSFReferentialZone>): readonly InconsistencyTarget[] {
        const inconsistencies: InconsistencyTarget[] = [];

        const temporalZones = Array.from(activeZones.values()).filter(z => z.semanticRole === 'temporal');

        if (temporalZones.length > 3) {
            inconsistencies.push({
                type: 'temporal_overload',
                description: 'Trop de références temporelles simultanées',
                affected_zones: temporalZones.slice(3).map(z => z.id),
                severity: 0.4
            });
        }

        return inconsistencies;
    }

    /**
     * Vérifie si deux zones se chevauchent
     * @param zone1 - Première zone
     * @param zone2 - Deuxième zone
     * @returns True si chevauchement
     * @private
     */
    private static zonesOverlap(zone1: LSFReferentialZone, zone2: LSFReferentialZone): boolean {
        const coord1 = zone1.coordinates;
        const coord2 = zone2.coordinates;

        const xOverlap = coord1.x[1] >= coord2.x[0] && coord1.x[0] <= coord2.x[1];
        const yOverlap = coord1.y[1] >= coord2.y[0] && coord1.y[0] <= coord2.y[1];
        const zOverlap = coord1.z[1] >= coord2.z[0] && coord1.z[0] <= coord2.z[1];

        return xOverlap && yOverlap && zOverlap;
    }

    /**
     * Trouve les paires de zones proches
     * @param activeZones - Zones actives
     * @returns Paires proches
     * @private
     */
    private static findProximityPairs(activeZones: Map<string, LSFReferentialZone>): readonly [LSFReferentialZone, LSFReferentialZone][] {
        const pairs: [LSFReferentialZone, LSFReferentialZone][] = [];
        const zones = Array.from(activeZones.values());

        for (let i = 0; i < zones.length; i++) {
            for (let j = i + 1; j < zones.length; j++) {
                const distance = this.calculateZoneDistance(zones[i], zones[j]);
                if (distance < 30) { // Seuil de proximité
                    pairs.push([zones[i], zones[j]]);
                }
            }
        }

        return pairs;
    }

    /**
     * Calcule la distance entre deux zones
     * @param zone1 - Première zone
     * @param zone2 - Deuxième zone
     * @returns Distance
     * @private
     */
    private static calculateZoneDistance(zone1: LSFReferentialZone, zone2: LSFReferentialZone): number {
        const center1 = {
            x: (zone1.coordinates.x[0] + zone1.coordinates.x[1]) / 2,
            y: (zone1.coordinates.y[0] + zone1.coordinates.y[1]) / 2,
            z: (zone1.coordinates.z[0] + zone1.coordinates.z[1]) / 2
        };

        const center2 = {
            x: (zone2.coordinates.x[0] + zone2.coordinates.x[1]) / 2,
            y: (zone2.coordinates.y[0] + zone2.coordinates.y[1]) / 2,
            z: (zone2.coordinates.z[0] + zone2.coordinates.z[1]) / 2
        };

        return Math.sqrt(
            Math.pow(center2.x - center1.x, 2) +
            Math.pow(center2.y - center1.y, 2) +
            Math.pow(center2.z - center1.z, 2)
        );
    }

    /**
     * Détermine le niveau de complexité
     * @param activeZones - Zones actives
     * @returns Niveau de complexité
     * @private
     */
    private static determineComplexityLevel(activeZones: Map<string, LSFReferentialZone>): string {
        const zoneCount = activeZones.size;
        const { complexity_levels } = LSF_SPATIAL_SYSTEM;

        if (zoneCount <= complexity_levels.simple.zones_max) return 'simple';
        if (zoneCount <= complexity_levels.moderate.zones_max) return 'moderate';
        if (zoneCount <= complexity_levels.complex.zones_max) return 'complex';
        return 'expert';
    }

    /**
     * Sélectionne les cibles de réorganisation
     * @param zones - Zones disponibles
     * @param severity - Sévérité
     * @returns Zones cibles
     * @private
     */
    private static selectReorganizationTargets(zones: readonly string[], severity: number): readonly string[] {
        const targetCount = Math.ceil(zones.length * severity);
        return zones.slice(0, targetCount);
    }

    /**
     * Génère les changements de position
     * @param zones - Zones à modifier
     * @param severity - Sévérité (influence l'amplitude des changements)
     * @returns Changements de position
     * @private
     */
    private static generatePositionChanges(zones: readonly string[], severity: number): readonly {
        readonly zone_id: string;
        readonly old_position: { x: number; y: number; z: number };
        readonly new_position: { x: number; y: number; z: number };
    }[] {
        return zones.map(zone_id => ({
            zone_id,
            old_position: { x: 0, y: 0, z: 0 }, // Position simplifiée
            new_position: {
                x: Math.random() * 40 * severity - 20 * severity,
                y: Math.random() * 40 * severity - 20 * severity,
                z: Math.random() * 40 * severity
            }
        }));
    }
}