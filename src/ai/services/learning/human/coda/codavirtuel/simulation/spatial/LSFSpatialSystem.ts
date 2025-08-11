/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/spatial/LSFSpatialSystem.ts
 * @description Système spatial révolutionnaire pour la LSF
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce module définit le système complet de zones référentielles en LSF,
 * incluant les zones canoniques, règles de cohérence et patterns d'erreurs.
 * 
 * @module LSFSpatialSystem
 */

/**
 * Coordonnées 3D d'une zone spatiale
 */
export interface SpatialCoordinates {
    readonly x: readonly [number, number];
    readonly y: readonly [number, number];
    readonly z: readonly [number, number];
}

/**
 * Zone canonique du système spatial LSF
 */
export interface CanonicalZone {
    readonly id: string;
    readonly name: string;
    readonly coordinates: SpatialCoordinates;
    readonly semanticRole: 'subject' | 'object' | 'temporal' | 'modal' | 'discourse';
    readonly typical_usage: readonly string[];
    readonly cognitive_load: number;
}

/**
 * Règle de cohérence spatiale
 */
export interface CoherenceRule {
    readonly rule: string;
    readonly violation_severity: 'low' | 'medium' | 'high' | 'critical';
    readonly impact_score: number;
}

/**
 * Pattern d'erreur spatiale
 */
export interface SpatialErrorPattern {
    readonly description: string;
    readonly frequency: number;
    readonly detection_difficulty: 'easy' | 'medium' | 'high';
    readonly pedagogical_value: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Niveau de complexité spatiale
 */
export interface ComplexityLevel {
    readonly zones_max: number;
    readonly references_max: number;
    readonly cognitive_load_threshold: number;
    readonly description: string;
}

/**
 * Configuration complète du système spatial LSF
 */
export interface LSFSpatialSystemConfig {
    readonly canonical_zones: Record<string, CanonicalZone>;
    readonly coherence_rules: Record<string, CoherenceRule>;
    readonly error_patterns: Record<string, SpatialErrorPattern>;
    readonly complexity_levels: Record<string, ComplexityLevel>;
}

/**
 * Système avancé de zones référentielles LSF
 * Basé sur la recherche linguistique contemporaine en LSF
 */
export const LSF_SPATIAL_SYSTEM: LSFSpatialSystemConfig = {
    // Zones référentielles canoniques
    canonical_zones: {
        neutral: {
            id: 'neutral',
            name: 'Zone neutre',
            coordinates: { x: [-10, 10], y: [-10, 10], z: [0, 20] },
            semanticRole: 'discourse',
            typical_usage: ['introduction', 'conclusion', 'généralités'],
            cognitive_load: 0.1
        },
        right_referential: {
            id: 'right_ref',
            name: 'Zone référentielle droite',
            coordinates: { x: [15, 40], y: [-10, 30], z: [0, 40] },
            semanticRole: 'subject',
            typical_usage: ['première_personne', 'sujet_principal', 'agent'],
            cognitive_load: 0.3
        },
        left_referential: {
            id: 'left_ref',
            name: 'Zone référentielle gauche',
            coordinates: { x: [-40, -15], y: [-10, 30], z: [0, 40] },
            semanticRole: 'object',
            typical_usage: ['troisième_personne', 'objet', 'patient'],
            cognitive_load: 0.3
        },
        upper_temporal: {
            id: 'upper_temp',
            name: 'Zone temporelle supérieure',
            coordinates: { x: [-20, 20], y: [25, 50], z: [20, 60] },
            semanticRole: 'temporal',
            typical_usage: ['futur', 'hypothétique', 'abstrait'],
            cognitive_load: 0.5
        },
        lower_temporal: {
            id: 'lower_temp',
            name: 'Zone temporelle inférieure',
            coordinates: { x: [-20, 20], y: [-30, -10], z: [-10, 20] },
            semanticRole: 'temporal',
            typical_usage: ['passé', 'accompli', 'concret'],
            cognitive_load: 0.4
        },
        modal_space: {
            id: 'modal',
            name: 'Espace modal',
            coordinates: { x: [-60, 60], y: [-20, 40], z: [40, 80] },
            semanticRole: 'modal',
            typical_usage: ['possibilité', 'nécessité', 'volonté'],
            cognitive_load: 0.7
        }
    },

    // Règles de cohérence spatiale
    coherence_rules: {
        zone_consistency: {
            rule: 'Une fois établie, une zone doit maintenir sa fonction référentielle',
            violation_severity: 'high',
            impact_score: 0.8
        },
        referential_continuity: {
            rule: 'Les références anaphoriques doivent pointer vers les zones établies',
            violation_severity: 'critical',
            impact_score: 0.9
        },
        semantic_consistency: {
            rule: 'Le rôle sémantique des zones doit rester cohérent',
            violation_severity: 'medium',
            impact_score: 0.6
        },
        spatial_economy: {
            rule: 'Éviter la multiplication inutile des zones référentielles',
            violation_severity: 'low',
            impact_score: 0.3
        },
        accessibility_principle: {
            rule: 'Les zones doivent rester dans l\'espace de signation accessible',
            violation_severity: 'high',
            impact_score: 0.7
        }
    },

    // Patterns d'erreurs typiques
    error_patterns: {
        zone_drift: {
            description: 'Dérive progressive de la position d\'une zone',
            frequency: 0.4,
            detection_difficulty: 'medium',
            pedagogical_value: 'high'
        },
        reference_ambiguity: {
            description: 'Ambiguïté sur la zone de référence visée',
            frequency: 0.6,
            detection_difficulty: 'high',
            pedagogical_value: 'critical'
        },
        pronoun_mismatch: {
            description: 'Incohérence entre pronom et zone référentielle',
            frequency: 0.3,
            detection_difficulty: 'easy',
            pedagogical_value: 'medium'
        },
        spatial_overflow: {
            description: 'Utilisation d\'espace au-delà des limites naturelles',
            frequency: 0.2,
            detection_difficulty: 'easy',
            pedagogical_value: 'low'
        },
        semantic_violation: {
            description: 'Violation des rôles sémantiques des zones',
            frequency: 0.5,
            detection_difficulty: 'medium',
            pedagogical_value: 'high'
        }
    },

    // Niveaux de complexité spatiale
    complexity_levels: {
        simple: {
            zones_max: 2,
            references_max: 3,
            cognitive_load_threshold: 0.3,
            description: 'Références simples, zones bien distinctes'
        },
        moderate: {
            zones_max: 3,
            references_max: 5,
            cognitive_load_threshold: 0.5,
            description: 'Références multiples avec maintien de cohérence'
        },
        complex: {
            zones_max: 4,
            references_max: 8,
            cognitive_load_threshold: 0.7,
            description: 'Système référentiel élaboré avec nuances'
        },
        expert: {
            zones_max: 6,
            references_max: 12,
            cognitive_load_threshold: 0.9,
            description: 'Maîtrise complète de l\'espace référentiel'
        }
    }
} as const;