// src/ai/specialized/spatial/generators/__tests__/ReferenceZoneGenerator.test.ts

import { ReferenceZoneGenerator } from '../ReferenceZoneGenerator';
import {
    CulturalContext,
    ReferenceZone,
    ReferenceZoneType,
    SigningSpace
} from '../../types';

// Mock pour SigningSpace
const mockSigningSpace: SigningSpace = {
    mainArea: {
        center: { x: 0, y: 0, z: 0 },
        dimensions: { width: 2, height: 2, depth: 2 }
    },
    scale: 1,
    orientation: { x: 0, y: 0, z: 1 },
    origin: { x: 0, y: 0, z: 0 },
    activeZones: new Map(),
    configure: jest.fn()
};

describe('ReferenceZoneGenerator', () => {
    let generator: ReferenceZoneGenerator;
    let defaultContext: CulturalContext;

    beforeEach(() => {
        generator = new ReferenceZoneGenerator(mockSigningSpace);
        defaultContext = {
            region: 'france',
            formalityLevel: 0.5,
            context: 'standard'
        };
    });

    test('should generate all zones for a given context', async () => {
        const zones = await generator.generateZones(defaultContext);

        // Vérifier que des zones ont été générées
        expect(zones).toBeDefined();
        expect(Array.isArray(zones)).toBe(true);
        expect(zones.length).toBeGreaterThan(0);

        // Vérifier qu'il y a différents types de zones
        const zoneTypes = new Set(zones.map(zone => zone.type));
        expect(zoneTypes.size).toBeGreaterThan(1);
    });

    test('should generate zones by specific type', async () => {
        const timelineZones = await generator.generateZonesByType(
            defaultContext,
            ReferenceZoneType.TIMELINE
        );

        // Vérifier les zones de timeline
        expect(timelineZones).toBeDefined();
        expect(Array.isArray(timelineZones)).toBe(true);
        expect(timelineZones.length).toBeGreaterThan(0);

        // Toutes les zones doivent être du type demandé
        expect(timelineZones.every(zone => zone.type === ReferenceZoneType.TIMELINE)).toBe(true);

        // Test pour un autre type
        const actantZones = await generator.generateZonesByType(
            defaultContext,
            ReferenceZoneType.ACTANT
        );
        expect(actantZones.every(zone => zone.type === ReferenceZoneType.ACTANT)).toBe(true);
    });

    test('should create timeline zones with appropriate properties', async () => {
        const timelineZones = await generator.generateZonesByType(
            defaultContext,
            ReferenceZoneType.TIMELINE
        );

        expect(timelineZones.length).toBeGreaterThan(0);

        const timeline = timelineZones[0];
        expect(timeline).toHaveProperty('id');
        expect(timeline).toHaveProperty('name');
        expect(timeline).toHaveProperty('area');
        expect(timeline).toHaveProperty('significance');
        expect(timeline).toHaveProperty('priority');
        expect(timeline).toHaveProperty('metadata');
        expect(timeline.metadata).toHaveProperty('direction');
        expect(timeline.metadata).toHaveProperty('timeSegments');
    });

    test('should create actant zones with role information', async () => {
        const actantZones = await generator.generateZonesByType(
            defaultContext,
            ReferenceZoneType.ACTANT
        );

        expect(actantZones.length).toBeGreaterThan(0);

        // Vérifier qu'il y a des zones pour différents rôles
        const roles = new Set(actantZones.map(zone => zone.metadata.defaultRole));
        expect(roles.size).toBeGreaterThan(0);

        // Vérifier les propriétés
        const actant = actantZones[0];
        expect(actant.metadata).toHaveProperty('defaultRole');
        expect(actant.metadata).toHaveProperty('contextualUsage');
    });

    test('should adapt zones based on formality level', async () => {
        // Contexte avec niveau de formalité élevé
        const formalContext: CulturalContext = {
            ...defaultContext,
            formalityLevel: 0.9
        };

        // Contexte avec niveau de formalité bas
        const informalContext: CulturalContext = {
            ...defaultContext,
            formalityLevel: 0.1
        };

        const formalZones = await generator.generateZonesByType(
            formalContext,
            ReferenceZoneType.ACTANT
        );

        const informalZones = await generator.generateZonesByType(
            informalContext,
            ReferenceZoneType.ACTANT
        );

        // Les zones formelles devraient être différentes des zones informelles
        // (par exemple dans leurs dimensions ou leur position)
        const formalZone = formalZones[0];
        const informalZone = informalZones[0];

        // Comparaison des dimensions (on s'attend à ce que les zones formelles soient plus grandes)
        const formalSize = formalZone.area.dimensions.width +
            formalZone.area.dimensions.height +
            formalZone.area.dimensions.depth;

        const informalSize = informalZone.area.dimensions.width +
            informalZone.area.dimensions.height +
            informalZone.area.dimensions.depth;

        expect(formalSize).toBeGreaterThan(informalSize);
    });

    test('should optimize zone layout to avoid overlaps', async () => {
        // Créer des zones qui se chevauchent
        const overlappingZones: ReferenceZone[] = [
            {
                id: 'zone1',
                name: 'Zone 1',
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
                id: 'zone2',
                name: 'Zone 2',
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

        const optimizedZones = await generator.optimizeZoneLayout(overlappingZones);

        // Vérifier que les zones ont été ajustées pour éviter le chevauchement
        // Les identifiants doivent être préservés
        expect(optimizedZones.map(z => z.id)).toEqual(overlappingZones.map(z => z.id));

        // Vérifier qu'il n'y a plus de chevauchement
        const zone1 = optimizedZones.find(z => z.id === 'zone1')!;
        const zone2 = optimizedZones.find(z => z.id === 'zone2')!;

        // Fonction pour vérifier le chevauchement (version simplifiée de celle dans la classe)
        const checkOverlap = (z1: ReferenceZone, z2: ReferenceZone): boolean => {
            const halfWidth1 = z1.area.dimensions.width / 2;
            const halfHeight1 = z1.area.dimensions.height / 2;
            const halfDepth1 = z1.area.dimensions.depth / 2;

            const halfWidth2 = z2.area.dimensions.width / 2;
            const halfHeight2 = z2.area.dimensions.height / 2;
            const halfDepth2 = z2.area.dimensions.depth / 2;

            const overlapX = Math.abs(z1.area.center.x - z2.area.center.x) < (halfWidth1 + halfWidth2);
            const overlapY = Math.abs(z1.area.center.y - z2.area.center.y) < (halfHeight1 + halfHeight2);
            const overlapZ = Math.abs(z1.area.center.z - z2.area.center.z) < (halfDepth1 + halfDepth2);

            return overlapX && overlapY && overlapZ;
        };

        // Si l'optimisation fonctionne correctement, les zones ne devraient plus se chevaucher
        expect(checkOverlap(zone1, zone2)).toBe(false);
    });

    test('should respect zone priorities during optimization', async () => {
        // Créer des zones avec des priorités différentes
        const prioritizedZones: ReferenceZone[] = [
            {
                id: 'highPriority',
                name: 'High Priority Zone',
                type: ReferenceZoneType.NEUTRAL,
                area: {
                    center: { x: 0, y: 0, z: 0 },
                    dimensions: { width: 1, height: 1, depth: 1 }
                },
                significance: 0.9,
                priority: 1, // Priorité élevée
                metadata: {}
            },
            {
                id: 'lowPriority',
                name: 'Low Priority Zone',
                type: ReferenceZoneType.NEUTRAL,
                area: {
                    center: { x: 0.2, y: 0.2, z: 0.2 },
                    dimensions: { width: 1, height: 1, depth: 1 }
                },
                significance: 0.7,
                priority: 3, // Priorité faible
                metadata: {}
            }
        ];

        const originalHighPriority = { ...prioritizedZones[0].area.center };
        const originalLowPriority = { ...prioritizedZones[1].area.center };

        const optimizedZones = await generator.optimizeZoneLayout(prioritizedZones);

        // Trouver les zones optimisées
        const highPriorityZone = optimizedZones.find(z => z.id === 'highPriority')!;
        const lowPriorityZone = optimizedZones.find(z => z.id === 'lowPriority')!;

        // La zone à haute priorité ne devrait pas bouger (ou très peu)
        expect(highPriorityZone.area.center.x).toBeCloseTo(originalHighPriority.x, 1);
        expect(highPriorityZone.area.center.y).toBeCloseTo(originalHighPriority.y, 1);
        expect(highPriorityZone.area.center.z).toBeCloseTo(originalHighPriority.z, 1);

        // La zone à basse priorité devrait être celle qui bouge
        const lowPriorityMoved =
            Math.abs(lowPriorityZone.area.center.x - originalLowPriority.x) > 0.1 ||
            Math.abs(lowPriorityZone.area.center.y - originalLowPriority.y) > 0.1 ||
            Math.abs(lowPriorityZone.area.center.z - originalLowPriority.z) > 0.1;

        expect(lowPriorityMoved).toBe(true);
    });
});