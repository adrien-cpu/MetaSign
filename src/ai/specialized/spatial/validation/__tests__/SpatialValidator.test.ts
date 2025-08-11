// src/ai/specialized/spatial/validation/__tests__/SpatialValidator.test.ts

import { SpatialValidator } from '../SpatialValidator';
// Importons les types nécessaires du module
import {
    SpatialRelation,
    SpatialRelationType,
    CulturalContext,
    Proforme,
    SpatialStructure,
    SpatialComponent,
    SpatialComponentType,
    SpatialZone,
    Point3D
} from '../../types';

// Définir uniquement les interfaces locales qui n'existent pas dans le module importé
interface ReferenceZone {
    id: string;
    name: string;
    type: ReferenceZoneType;
    area: {
        center: Point3D;
        dimensions: { width: number; height: number; depth: number };
    };
    significance: number;
    priority: number;
    metadata: Record<string, unknown>;
}

interface SpatialElement {
    id: string;
    type: string;
    position: Point3D;
    properties: Record<string, unknown>;
}

interface SpatialLayout {
    zones: ReferenceZone[];
    elements: Map<string, SpatialElement>;
    relations: SpatialRelation[];
    getZones: () => ReferenceZone[];
    getRelations: () => SpatialRelation[];
}

// Enum pour ReferenceZoneType
enum ReferenceZoneType {
    NEUTRAL = 'neutral',
    TIMELINE = 'timeline'
}

describe('SpatialValidator', () => {
    let validator: SpatialValidator;
    let mockLayout: SpatialLayout;
    let mockStructure: SpatialStructure;
    let mockContext: CulturalContext;

    beforeEach(() => {
        validator = new SpatialValidator();

        // Créer un mock de zones de référence
        const mockZones: ReferenceZone[] = [
            {
                id: 'zone1',
                name: 'Test Zone 1',
                type: ReferenceZoneType.NEUTRAL,
                area: {
                    center: { x: -0.5, y: 0, z: 0 },
                    dimensions: { width: 0.5, height: 0.5, depth: 0.5 }
                },
                significance: 0.8,
                priority: 1,
                metadata: {}
            },
            {
                id: 'zone2',
                name: 'Test Zone 2',
                type: ReferenceZoneType.TIMELINE,
                area: {
                    center: { x: 0.5, y: 0, z: 0 },
                    dimensions: { width: 0.5, height: 0.5, depth: 0.5 }
                },
                significance: 0.7,
                priority: 2,
                metadata: {}
            }
        ];

        // Convertir ReferenceZone en SpatialZone pour SpatialStructure
        const spatialZones: SpatialZone[] = mockZones.map(zone => ({
            id: zone.id,
            name: zone.name,
            type: zone.type === ReferenceZoneType.NEUTRAL ? "standard" : "reference",
            position: zone.area.center,
            size: zone.area.dimensions,
            components: []
        }));

        // Créer un mock d'éléments spatiaux
        const mockElements = new Map<string, SpatialElement>();
        mockElements.set('element1', {
            id: 'element1',
            type: 'entity',
            position: { x: -0.4, y: 0, z: 0 },
            properties: { name: 'Test Element 1' }
        });
        mockElements.set('element2', {
            id: 'element2',
            type: 'landmark',
            position: { x: 0.4, y: 0, z: 0 },
            properties: { name: 'Test Element 2' }
        });

        // Créer un mock de composants conformes à SpatialComponent
        const mockComponents: SpatialComponent[] = [
            {
                id: 'component1',
                type: SpatialComponentType.EXPRESSION,
                properties: { test: 'value' }
            }
        ];

        // Créer un mock de relations spatiales
        const mockRelations: SpatialRelation[] = [
            {
                id: 'relation1',
                type: Object.values(SpatialRelationType)[0],
                sourceId: 'element1',
                targetId: 'element2',
                strength: 0.7,
                properties: { distance: 0.8 }
            }
        ];

        // Créer un mock de layout
        mockLayout = {
            zones: mockZones,
            elements: mockElements,
            relations: mockRelations,
            getZones: jest.fn().mockReturnValue(mockZones),
            getRelations: jest.fn().mockReturnValue(mockRelations)
        };

        // Créer un mock de contexte culturel
        mockContext = {
            region: 'france',
            formalityLevel: 0.5
        };

        // Créer un mock de proformes
        const mockProformes: Proforme[] = [];

        // Créer un mock de structure spatiale en utilisant le type importé
        // Nous utilisons une conversion en deux étapes pour contourner en toute sécurité les vérifications de type
        mockStructure = {
            id: 'structure1',
            layout: mockLayout,
            zones: spatialZones as unknown as SpatialZone[],
            relations: mockRelations,
            proformes: mockProformes,
            components: mockComponents,
            metadata: {
                culturalContext: mockContext,
                coherenceScore: 0.85,
                complexityScore: 0.5,
                optimizationLevel: 0.7,
                createdAt: Date.now(),
                statistics: {
                    zoneCount: mockZones.length,
                    proformeCount: 0,
                    componentCount: mockComponents.length,
                    relationCount: mockRelations.length
                }
            }
        } as unknown as SpatialStructure;
    });

    test('should validate a correct spatial structure', async () => {
        // Si la structure est valide, la validation ne devrait pas lever d'exception
        await expect(validator.validateStructure(mockLayout)).resolves.not.toThrow();
    });

    test('should throw for invalid spatial structure', async () => {
        // Modifier le mock pour avoir une structure invalide (zones sans relation cohérente)
        const invalidLayout: SpatialLayout = {
            ...mockLayout,
            relations: [],
            getRelations: jest.fn().mockReturnValue([])
        };

        // La validation devrait maintenant échouer
        await expect(validator.validateStructure(invalidLayout)).rejects.toThrow();
    });

    test('should measure coherence of spatial structure', async () => {
        const coherenceScore = await validator.measureCoherence(mockStructure);

        // Vérifier que le score est dans la plage valide
        expect(coherenceScore).toBeGreaterThanOrEqual(0);
        expect(coherenceScore).toBeLessThanOrEqual(1);

        // Le score devrait être élevé pour une structure valide
        expect(coherenceScore).toBeGreaterThan(0.8);
    });

    test('should validate zone coherence', async () => {
        const zoneCoherenceScore = await validator.validateZoneCoherence(mockLayout);

        // Vérifier que le score est dans la plage valide
        expect(zoneCoherenceScore).toBeGreaterThanOrEqual(0);
        expect(zoneCoherenceScore).toBeLessThanOrEqual(1);
    });

    test('should penalize overlapping zones', async () => {
        // Créer un layout avec des zones qui se chevauchent
        const overlappingZones: ReferenceZone[] = [
            {
                id: 'overlapping1',
                name: 'Overlapping Zone 1',
                type: ReferenceZoneType.NEUTRAL,
                area: {
                    center: { x: 0, y: 0, z: 0 },
                    dimensions: { width: 1, height: 1, depth: 1 }
                },
                significance: 0.8,
                priority: 1,
                metadata: {}
            },
            {
                id: 'overlapping2',
                name: 'Overlapping Zone 2',
                type: ReferenceZoneType.NEUTRAL,
                area: {
                    center: { x: 0.2, y: 0.2, z: 0.2 },
                    dimensions: { width: 1, height: 1, depth: 1 }
                },
                significance: 0.7,
                priority: 2,
                metadata: {}
            }
        ];

        const overlappingLayout: SpatialLayout = {
            ...mockLayout,
            zones: overlappingZones,
            getZones: jest.fn().mockReturnValue(overlappingZones)
        };

        const goodLayout = mockLayout;

        // Comparer les scores
        const overlappingScore = await validator.validateZoneCoherence(overlappingLayout);
        const goodScore = await validator.validateZoneCoherence(goodLayout);

        // Le score pour des zones qui se chevauchent devrait être inférieur
        expect(overlappingScore).toBeLessThan(goodScore);
    });

    test('should validate relation consistency', async () => {
        const relationScore = await validator.validateRelationConsistency(mockLayout);

        // Vérifier que le score est dans la plage valide
        expect(relationScore).toBeGreaterThanOrEqual(0);
        expect(relationScore).toBeLessThanOrEqual(1);
    });

    test('should penalize invalid relations', async () => {
        // Créer un layout avec des relations invalides (références à des éléments inexistants)
        const invalidRelations: SpatialRelation[] = [
            {
                id: 'invalid1',
                type: Object.values(SpatialRelationType)[0],
                sourceId: 'nonexistent1',
                targetId: 'nonexistent2',
                strength: 0.7,
                properties: {}
            }
        ];

        const invalidLayout: SpatialLayout = {
            ...mockLayout,
            relations: invalidRelations,
            getRelations: jest.fn().mockReturnValue(invalidRelations)
        };

        const goodLayout = mockLayout;

        // Comparer les scores
        const invalidScore = await validator.validateRelationConsistency(invalidLayout);
        const goodScore = await validator.validateRelationConsistency(goodLayout);

        // Le score pour des relations invalides devrait être inférieur
        expect(invalidScore).toBeLessThan(goodScore);
    });

    test('should validate proforme usage', async () => {
        const proformeScore = await validator.validateProformeUsage(mockLayout);

        // Vérifier que le score est dans la plage valide
        expect(proformeScore).toBeGreaterThanOrEqual(0);
        expect(proformeScore).toBeLessThanOrEqual(1);
    });
});