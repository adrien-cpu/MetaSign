// src/ai/specialized/spatial/core/__tests__/SigningSpace.test.ts

import { SigningSpace } from '../SigningSpace';
import {
    CulturalContext,
    ReferenceZone,
    ReferenceZoneType,
    SigningSpaceConfig,
    Point3D
} from '../../types';

describe('SigningSpace', () => {
    let signingSpace: SigningSpace;
    let defaultContext: CulturalContext;

    beforeEach(() => {
        signingSpace = new SigningSpace();
        defaultContext = {
            region: 'france',
            formalityLevel: 0.5,
            context: 'standard'
        };
    });

    test('should be properly initialized with default values', () => {
        // Vérifier l'initialisation par défaut
        expect(signingSpace.scale).toBe(1);
        expect(signingSpace.origin).toEqual({ x: 0, y: 0, z: 0 });
        expect(signingSpace.orientation).toEqual({ x: 0, y: 0, z: 1 });
        expect(signingSpace.mainArea).toBeDefined();
        expect(signingSpace.activeZones.size).toBe(0);
    });

    test('should apply configuration correctly', () => {
        const config: SigningSpaceConfig = {
            scale: 1.5,
            origin: { x: 0.1, y: 0.2, z: 0.3 },
            orientation: { x: 0, y: 1, z: 0 },
            size: {
                width: 3,
                height: 2.5,
                depth: 2
            }
        };

        signingSpace.configure(config);

        // Vérifier que la configuration a été appliquée
        expect(signingSpace.scale).toBe(1.5);
        expect(signingSpace.origin).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
        expect(signingSpace.orientation).toEqual({ x: 0, y: 1, z: 0 });
        expect(signingSpace.mainArea.dimensions).toEqual({
            width: 3,
            height: 2.5,
            depth: 2
        });
    });

    test('should initialize correctly for a cultural context', async () => {
        await signingSpace.initialize(defaultContext);

        // Vérifier l'adaptation au contexte
        expect(signingSpace.scale).toBeGreaterThan(0);

        // Vérifier l'initialisation des zones de base
        expect(signingSpace.activeZones.size).toBeGreaterThan(0);
        expect(signingSpace.activeZones.has('neutral-center')).toBe(true);
    });

    test('should adapt to formal context differently than standard', async () => {
        const formalContext: CulturalContext = {
            ...defaultContext,
            context: 'formal',
            formalityLevel: 0.9
        };

        const standardContext: CulturalContext = {
            ...defaultContext,
            context: 'standard',
            formalityLevel: 0.3
        };

        // Initialiser deux espaces avec des contextes différents
        const formalSpace = new SigningSpace();
        const standardSpace = new SigningSpace();

        await formalSpace.initialize(formalContext);
        await standardSpace.initialize(standardContext);

        // Le contexte formel devrait avoir une échelle plus grande
        expect(formalSpace.scale).toBeGreaterThan(standardSpace.scale);

        // Le contexte formel devrait avoir des zones supplémentaires
        expect(formalSpace.activeZones.size).toBeGreaterThan(standardSpace.activeZones.size);
        expect(formalSpace.activeZones.has('formal-space')).toBe(true);
    });

    test('should add and remove zones correctly', () => {
        const testZone: ReferenceZone = {
            id: 'test-zone',
            name: 'Test Zone',
            type: ReferenceZoneType.NEUTRAL,
            area: {
                center: { x: 0.5, y: 0.5, z: 0.5 },
                dimensions: { width: 0.5, height: 0.5, depth: 0.5 }
            },
            significance: 0.7,
            priority: 3,
            metadata: {}
        };

        // Ajouter la zone
        const addResult = signingSpace.addZone(testZone);
        expect(addResult).toBe(true);
        expect(signingSpace.activeZones.has('test-zone')).toBe(true);

        // Ajouter la même zone une seconde fois devrait échouer
        const secondAddResult = signingSpace.addZone(testZone);
        expect(secondAddResult).toBe(false);

        // Récupérer la zone
        const retrievedZone = signingSpace.getZone('test-zone');
        expect(retrievedZone).toBeDefined();
        expect(retrievedZone?.id).toBe('test-zone');

        // Supprimer la zone
        const removeResult = signingSpace.removeZone('test-zone');
        expect(removeResult).toBe(true);
        expect(signingSpace.activeZones.has('test-zone')).toBe(false);

        // Supprimer une zone inexistante devrait échouer
        const secondRemoveResult = signingSpace.removeZone('test-zone');
        expect(secondRemoveResult).toBe(false);
    });

    test('should transform points correctly between space and world', () => {
        // Configurer l'espace
        signingSpace.configure({
            scale: 2,
            origin: { x: 1, y: 1, z: 1 }
        });

        // Point dans le monde réel
        const worldPoint: Point3D = { x: 3, y: 3, z: 3 };

        // Transformer en coordonnées de l'espace
        const spacePoint = signingSpace.transformToSpace(worldPoint);

        // Le point dans l'espace devrait être (point_monde - origine) / échelle
        expect(spacePoint.x).toBe(1); // (3 - 1) / 2
        expect(spacePoint.y).toBe(1); // (3 - 1) / 2
        expect(spacePoint.z).toBe(1); // (3 - 1) / 2

        // Transformer le point de l'espace vers le monde
        const backToWorld = signingSpace.transformFromSpace(spacePoint);

        // On devrait retrouver les coordonnées du monde d'origine
        expect(backToWorld.x).toBeCloseTo(worldPoint.x);
        expect(backToWorld.y).toBeCloseTo(worldPoint.y);
        expect(backToWorld.z).toBeCloseTo(worldPoint.z);
    });

    test('should clone the signing space correctly', () => {
        // Configurer l'espace et ajouter une zone
        signingSpace.configure({
            scale: 1.5,
            orientation: { x: 0, y: 1, z: 0 }
        });

        const testZone: ReferenceZone = {
            id: 'test-zone',
            name: 'Test Zone',
            type: ReferenceZoneType.NEUTRAL,
            area: {
                center: { x: 0.5, y: 0.5, z: 0.5 },
                dimensions: { width: 0.5, height: 0.5, depth: 0.5 }
            },
            significance: 0.7,
            priority: 3,
            metadata: {}
        };

        signingSpace.addZone(testZone);

        // Cloner l'espace
        const clonedSpace = signingSpace.clone();

        // Vérifier que les propriétés sont identiques
        expect(clonedSpace.scale).toBe(signingSpace.scale);
        expect(clonedSpace.orientation).toEqual(signingSpace.orientation);
        expect(clonedSpace.mainArea).toEqual(signingSpace.mainArea);

        // Vérifier que les zones sont copiées
        expect(clonedSpace.activeZones.size).toBe(signingSpace.activeZones.size);
        expect(clonedSpace.activeZones.has('test-zone')).toBe(true);

        // Vérifier que c'est une copie profonde (pas de référence partagée)
        const originalZone = signingSpace.getZone('test-zone');
        const clonedZone = clonedSpace.getZone('test-zone');

        // Modifier la zone dans l'espace d'origine
        if (originalZone) {
            originalZone.significance = 0.9;
        }

        // La zone clonée ne devrait pas être affectée
        expect(clonedZone?.significance).toBe(0.7);
    });

    test('should reset to default state', async () => {
        // Configurer l'espace et ajouter une zone
        await signingSpace.initialize(defaultContext);

        // Vérifier que l'espace est configuré et a des zones
        expect(signingSpace.scale).not.toBe(1); // Devrait être modifié par l'initialisation
        expect(signingSpace.activeZones.size).toBeGreaterThan(0);

        // Réinitialiser l'espace
        signingSpace.reset();

        // Vérifier que l'espace est revenu à l'état par défaut
        expect(signingSpace.scale).toBe(1);
        expect(signingSpace.origin).toEqual({ x: 0, y: 0, z: 0 });
        expect(signingSpace.orientation).toEqual({ x: 0, y: 0, z: 1 });
        expect(signingSpace.activeZones.size).toBe(0);
    });
});