// src/ai/specialized/spatial/generators/__tests__/LayoutGenerator.test.ts

import { LayoutGenerator } from '../LayoutGenerator';
import { SigningSpace } from '../../core/SigningSpace';
import { ProformeRegistry } from '../../core/ProformeRegistry';
import {
    ReferenceZone,
    ReferenceZoneType,
    SpatialLayoutError
} from '../../types';

// Mocks pour les dépendances
jest.mock('../../core/SigningSpace');
jest.mock('../../core/ProformeRegistry');

describe('LayoutGenerator', () => {
    let layoutGenerator: LayoutGenerator;
    let mockSigningSpace: jest.Mocked<SigningSpace>;
    let mockProformeRegistry: jest.Mocked<ProformeRegistry>;
    let testZones: ReferenceZone[];

    beforeEach(() => {
        // Créer des mocks pour les dépendances
        mockSigningSpace = new SigningSpace() as jest.Mocked<SigningSpace>;
        mockProformeRegistry = new ProformeRegistry() as jest.Mocked<ProformeRegistry>;

        // Créer le générateur de layout avec les mocks
        layoutGenerator = new LayoutGenerator(mockSigningSpace, mockProformeRegistry);

        // Préparer des zones de test
        testZones = [
            {
                id: 'actant-left',
                name: 'Actant gauche',
                type: ReferenceZoneType.ACTANT,
                area: {
                    center: { x: -0.7, y: 0, z: 0.3 },
                    dimensions: { width: 0.4, height: 0.4, depth: 0.4 }
                },
                significance: 0.8,
                priority: 2,
                metadata: {
                    defaultRole: 'subject'
                }
            },
            {
                id: 'timeline-main',
                name: 'Ligne temporelle principale',
                type: ReferenceZoneType.TIMELINE,
                area: {
                    center: { x: 0, y: 0, z: 0.5 },
                    dimensions: { width: 1.5, height: 0.2, depth: 0.2 }
                },
                significance: 0.9,
                priority: 1,
                metadata: {
                    direction: 'left-to-right',
                    timeSegments: ['past', 'present', 'future']
                }
            }
        ];
    });

    test('should generate layout from reference zones', async () => {
        // Générer un layout à partir des zones
        const layout = await layoutGenerator.generateLayout(testZones);

        // Vérifier que le layout est correctement généré
        expect(layout).toBeDefined();
        expect(layout.zones).toBe(testZones);
        expect(layout.elements.size).toBeGreaterThan(0);
        expect(layout.relations.length).toBeGreaterThan(0);

        // Vérifier que les éléments ont été placés pour chaque type de zone
        const actantElement = Array.from(layout.elements.values())
            .find(e => e.type === 'entity');
        const timeElement = Array.from(layout.elements.values())
            .find(e => e.properties.timeSegment !== undefined);

        expect(actantElement).toBeDefined();
        expect(timeElement).toBeDefined();

        // Vérifier que chaque élément référence sa zone
        expect(actantElement?.referenceZone).toBe('actant-left');
        expect(timeElement?.referenceZone).toBe('timeline-main');
    });

    test('should place elements in appropriate zones', async () => {
        // Créer un layout initial avec les zones
        const initialLayout = {
            zones: testZones,
            elements: new Map(),
            relations: [],
            getZones: () => testZones,
            getRelations: () => []
        };

        // Placer des éléments dans les zones
        const layoutWithElements = await layoutGenerator.placeElements(initialLayout);

        // Vérifier que des éléments ont été placés
        expect(layoutWithElements.elements.size).toBeGreaterThan(0);

        // Vérifier les éléments pour chaque type de zone
        const actantElements = Array.from(layoutWithElements.elements.values())
            .filter(e => e.type === 'entity');
        const timeElements = Array.from(layoutWithElements.elements.values())
            .filter(e => e.properties.timeSegment !== undefined);

        expect(actantElements.length).toBeGreaterThan(0);
        expect(timeElements.length).toBeGreaterThan(0);

        // Vérifier que les éléments sont positionnés dans leurs zones respectives
        const actantZone = testZones.find(z => z.type === ReferenceZoneType.ACTANT)!;
        const actantElement = actantElements[0];

        // La position de l'élément doit correspondre approximativement au centre de la zone
        expect(actantElement.position.x).toBeCloseTo(actantZone.area.center.x, 1);
        expect(actantElement.position.y).toBeCloseTo(actantZone.area.center.y, 1);
        expect(actantElement.position.z).toBeCloseTo(actantZone.area.center.z, 1);
    });

    test('should create relations between elements', async () => {
        // Créer un layout initial avec des éléments
        const elementsMap = new Map();
        elementsMap.set('actant-1', {
            id: 'actant-1',
            type: 'entity',
            position: { x: -0.5, y: 0, z: 0.3 },
            properties: { role: 'subject' },
            referenceZone: 'actant-left'
        });
        elementsMap.set('actant-2', {
            id: 'actant-2',
            type: 'entity',
            position: { x: 0.5, y: 0, z: 0.3 },
            properties: { role: 'object' },
            referenceZone: 'actant-right'
        });
        elementsMap.set('time-present', {
            id: 'time-present',
            type: 'landmark',
            position: { x: 0, y: 0, z: 0.5 },
            properties: { timeSegment: 'present' },
            referenceZone: 'timeline-main'
        });

        const initialLayout = {
            zones: testZones,
            elements: elementsMap,
            relations: [],
            getZones: () => testZones,
            getRelations: () => []
        };

        // Créer des relations entre les éléments
        const layoutWithRelations = await layoutGenerator.createRelations(initialLayout);

        // Vérifier que des relations ont été créées
        expect(layoutWithRelations.relations.length).toBeGreaterThan(0);

        // Vérifier les relations entre actants
        const actantRelations = layoutWithRelations.relations
            .filter(r => r.sourceId.includes('actant') && r.targetId.includes('actant'));
        expect(actantRelations.length).toBeGreaterThan(0);

        // Vérifier les relations entre marqueurs de temps et actants
        const timeRelations = layoutWithRelations.relations
            .filter(r => r.sourceId.includes('time') || r.targetId.includes('time'));
        expect(timeRelations.length).toBeGreaterThan(0);
    });

    test('should optimize element positions', async () => {
        // Créer un layout avec des éléments qui se chevauchent
        const elementsMap = new Map();
        elementsMap.set('element-1', {
            id: 'element-1',
            type: 'entity',
            position: { x: 0, y: 0, z: 0 },
            dimensions: { width: 0.3, height: 0.3, depth: 0.3 },
            properties: { importance: 0.8 },
            referenceZone: 'actant-left'
        });
        elementsMap.set('element-2', {
            id: 'element-2',
            type: 'entity',
            position: { x: 0.1, y: 0, z: 0 }, // Chevauchement volontaire
            dimensions: { width: 0.3, height: 0.3, depth: 0.3 },
            properties: { importance: 0.6 },
            referenceZone: 'actant-right'
        });

        const initialLayout = {
            zones: testZones,
            elements: elementsMap,
            relations: [],
            getZones: () => testZones,
            getRelations: () => []
        };

        // Optimiser les positions
        const optimizedLayout = await layoutGenerator.optimizeElementPositions(initialLayout);

        // Récupérer les éléments optimisés
        const element1 = optimizedLayout.elements.get('element-1')!;
        const element2 = optimizedLayout.elements.get('element-2')!;

        // Calculer la distance après optimisation
        const dx = element1.position.x - element2.position.x;
        const dy = element1.position.y - element2.position.y;
        const dz = element1.position.z - element2.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // La distance devrait être suffisante pour éviter le chevauchement
        const minExpectedDistance = (element1.dimensions!.width + element2.dimensions!.width) / 2;
        expect(distance).toBeGreaterThanOrEqual(minExpectedDistance);
    });

    test('should validate layout correctly', async () => {
        // Layout valide
        const validLayout = {
            zones: testZones,
            elements: new Map([
                ['element-1', {
                    id: 'element-1',
                    type: 'entity',
                    position: { x: 0, y: 0, z: 0 },
                    properties: {},
                    referenceZone: 'actant-left'
                }]
            ]),
            relations: [],
            getZones: () => testZones,
            getRelations: () => []
        };

        // Validation du layout valide
        const isValid = await layoutGenerator.validateLayout(validLayout);
        expect(isValid).toBe(true);

        // Layout invalide (référence à une zone inexistante)
        const invalidLayout = {
            zones: testZones,
            elements: new Map([
                ['element-1', {
                    id: 'element-1',
                    type: 'entity',
                    position: { x: 0, y: 0, z: 0 },
                    properties: {},
                    referenceZone: 'non-existent-zone'
                }]
            ]),
            relations: [],
            getZones: () => testZones,
            getRelations: () => []
        };

        // Validation du layout invalide
        const isInvalid = await layoutGenerator.validateLayout(invalidLayout);
        expect(isInvalid).toBe(false);
    });

    test('should throw error for invalid layout', async () => {
        // Zones vides pour provoquer une erreur
        const emptyZones: ReferenceZone[] = [];

        // La génération devrait échouer avec un layout invalide
        await expect(layoutGenerator.generateLayout(emptyZones))
            .rejects
            .toThrow(SpatialLayoutError);
    });
});