// src/ai/specialized/spatial/analyzers/__tests__/ComponentExtractor.test.ts

import { ComponentExtractor } from '../ComponentExtractor';
import { LSFInput, LSFInputType, SpatialComponentType } from '../../types';

describe('ComponentExtractor', () => {
    let extractor: ComponentExtractor;
    let mockInput: LSFInput;

    beforeEach(() => {
        extractor = new ComponentExtractor();
        mockInput = {
            type: LSFInputType.TEXT_CONVERSION,
            data: "Test input data",
            culturalContext: {
                region: 'france',
                formalityLevel: 0.5
            }
        };
    });

    test('should extract all components from LSF input', async () => {
        const result = await extractor.extract(mockInput);

        // Vérifications de base
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Vérifier qu'il y a des composants de différents types
        const types = new Set(result.map(comp => comp.type));
        expect(types.size).toBeGreaterThan(0);
    });

    test('should extract components by specific type', async () => {
        const locations = await extractor.extractByType(mockInput, SpatialComponentType.LOCATION);

        // Vérifications pour les locations
        expect(locations).toBeDefined();
        expect(Array.isArray(locations)).toBe(true);

        // Tous les composants doivent être du type demandé
        expect(locations.every(loc => loc.type === SpatialComponentType.LOCATION)).toBe(true);

        // Test pour un autre type
        const movements = await extractor.extractByType(mockInput, SpatialComponentType.MOVEMENT);
        expect(movements.every(mov => mov.type === SpatialComponentType.MOVEMENT)).toBe(true);
    });

    test('should extract locations with correct properties', async () => {
        const locations = await extractor.extractByType(mockInput, SpatialComponentType.LOCATION);

        // Vérifier que les locations ont les propriétés attendues
        expect(locations.length).toBeGreaterThan(0);

        const location = locations[0];
        expect(location).toHaveProperty('id');
        expect(location).toHaveProperty('position');
        expect(location).toHaveProperty('properties');
        expect(location.position).toHaveProperty('x');
        expect(location.position).toHaveProperty('y');
        expect(location.position).toHaveProperty('z');
    });

    test('should extract movements with direction properties', async () => {
        const movements = await extractor.extractByType(mockInput, SpatialComponentType.MOVEMENT);

        // Vérifier que les mouvements ont les propriétés de direction
        expect(movements.length).toBeGreaterThan(0);

        const movement = movements[0];
        expect(movement.properties).toHaveProperty('direction');
        expect(movement.properties).toHaveProperty('amplitude');
        expect(movement.properties).toHaveProperty('speed');
    });

    test('should extract proformes with handshape properties', async () => {
        const proformes = await extractor.extractByType(mockInput, SpatialComponentType.PROFORME);

        // Vérifier que les proformes ont les propriétés de forme de main
        expect(proformes.length).toBeGreaterThan(0);

        const proforme = proformes[0];
        expect(proforme.properties).toHaveProperty('handshape');
        expect(proforme.properties).toHaveProperty('represents');
    });
});