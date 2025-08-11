// src/ai/spatial/types/index.ts

// Export des types de base
export * from './SpatialTypes';

// Export des interfaces principales
// Utilisation d'une réexportation explicite pour éviter les ambiguïtés
import type {
    ISpatialManager,
    ISpatialStructureManager,
    SpatialCoherenceReport,
    SpatialCoherenceIssue
} from './interfaces/SpatialInterfaces';

export type {
    ISpatialManager,
    ISpatialStructureManager,
    SpatialCoherenceReport,
    SpatialCoherenceIssue
};

// Export explicite des interfaces spécifiques depuis leurs fichiers propres
// au lieu de les réexporter via SpatialInterfaces
export type { IReferenceBuilder } from './interfaces/IReferenceBuilder';
export type { IReferenceTracker } from './interfaces/IReferenceTracker';
export type { ISpatialCoherenceValidator } from './interfaces/ISpatialCoherenceValidator';