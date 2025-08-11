// src/ai/spatial/index.ts

// Importer explicitement les types depuis SpatialTypes
import type {
    SpatialMap,
    SpatialReference,
    SpatialConnection,
    SpatialRegion,
    SpatialContext,
    SpatialReferenceType,
    SpatialRelationType,
    ReferenceUpdateOptions,
    SpatialReferenceEvent,
    SpatialEventType,
    ReferenceActivationState,
    SpatialVector
} from './types/SpatialTypes';

// Importer les interfaces depuis le bon chemin
import type {
    ISpatialManager,
    IReferenceTracker,
    IReferenceBuilder,
    ISpatialCoherenceValidator,
    SpatialCoherenceReport,
    SpatialCoherenceIssue,
    ISpatialStructureManager
} from './types/interfaces/SpatialInterfaces';

// Import de CoherenceValidationResult depuis SpatialManager
import type { CoherenceValidationResult } from './SpatialManager';

// Exporter le gestionnaire spatial principal
export * from './SpatialManager';

// Exporter le système de cache
export * from './cache';

// Exporter le module de référence
export * from './reference';

// Exporter les validateurs
export * from './validation/SpatialCoherenceValidator';

// Réexporter tous les types explicitement avec "export type"
export type {
    SpatialMap,
    SpatialReference,
    SpatialConnection,
    SpatialRegion,
    SpatialContext,
    SpatialReferenceType,
    SpatialRelationType,
    ReferenceUpdateOptions,
    SpatialReferenceEvent,
    SpatialEventType,
    ReferenceActivationState,
    SpatialVector,
    ISpatialManager,
    IReferenceTracker,
    IReferenceBuilder,
    ISpatialCoherenceValidator,
    SpatialCoherenceReport,
    SpatialCoherenceIssue,
    ISpatialStructureManager,
    CoherenceValidationResult
};