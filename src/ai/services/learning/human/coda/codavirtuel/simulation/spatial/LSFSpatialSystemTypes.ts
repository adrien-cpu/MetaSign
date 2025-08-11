/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/spatial/LSFSpatialSystemTypes.ts
 * @description Types fallback pour LSFSpatialSystem
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

/**
 * Système spatial LSF avec niveaux de complexité
 */
export const LSF_SPATIAL_SYSTEM = {
    complexity_levels: {
        simple: {
            zones_max: 2,
            description: 'Niveau débutant avec zones basiques'
        },
        moderate: {
            zones_max: 4,
            description: 'Niveau intermédiaire avec zones multiples'
        },
        complex: {
            zones_max: 6,
            description: 'Niveau avancé avec zones complexes'
        },
        expert: {
            zones_max: 10,
            description: 'Niveau expert avec zones très complexes'
        }
    },

    default_zones: {
        center: { x: 0, y: 0, z: 0 },
        dominant_side: { x: 20, y: 0, z: 0 },
        non_dominant_side: { x: -20, y: 0, z: 0 },
        upper: { x: 0, y: 20, z: 0 },
        lower: { x: 0, y: -20, z: 0 },
        peripheral: { x: 30, y: 30, z: 0 }
    }
};