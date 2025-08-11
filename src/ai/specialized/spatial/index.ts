// src/ai/specialized/spatial/index.ts

// Export des types
export * from './types';

// Export des interfaces principales
export { ISigningSpace } from './core/interfaces/ISigningSpace';
export { IProformeRegistry } from './core/interfaces/IProformeRegistry';
export { IReferenceZoneGenerator } from './generators/interfaces/IReferenceZoneGenerator';
export { ILayoutGenerator } from './generators/interfaces/ILayoutGenerator';
export { ISpatialValidator } from './validation/interfaces/ISpatialValidator';
export { IComponentExtractor } from './analyzers/interfaces/IComponentExtractor';

// Export des classes principales
export { SpatialStructureManager } from './SpatialStructureManager';
export { SigningSpace } from './core/SigningSpace';
export { ProformeRegistry } from './core/ProformeRegistry';
export { ReferenceZoneGenerator } from './generators/ReferenceZoneGenerator';
export { LayoutGenerator } from './generators/LayoutGenerator';
export { SpatialValidator } from './validation/SpatialValidator';
export { SpatialAnalyzer } from './analyzers/SpatialAnalyzer';
export { ComponentExtractor } from './analyzers/ComponentExtractor';

// Export des erreurs
export { SpatialStructureError, SpatialLayoutError, SpatialValidationError } from './types';

/**
 * Crée un SpatialStructureManager avec toutes ses dépendances par défaut
 * @returns SpatialStructureManager configuré et prêt à être utilisé
 */
export function createSpatialStructureManager(): SpatialStructureManager {
    return new SpatialStructureManager();
}