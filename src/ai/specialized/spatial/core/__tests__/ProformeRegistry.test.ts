/**
 * Tests pour le registre de proformes qui gère les configurations manuelles en LSF
 * 
 * @file src/ai/specialized/spatial/core/__tests__/ProformeRegistry.test.ts
 */

import { ProformeRegistry } from '../ProformeRegistry';
import { CulturalContext, Proforme, FingerConfig } from '../../types';

// Dans un environnement de test réel, nous aurions un vrai TestProformeRegistry importé.
// Pour cette démonstration, nous allons créer une classe de test inline.
// Note: Dans un environnement de production, cette classe serait dans son propre fichier.
class TestProformeRegistry extends ProformeRegistry {
    // Méthodes de test pour accéder aux propriétés protégées
    public setTestProformes(proformes: Proforme[]): void {
        // Réinitialiser d'abord
        this.reset();

        // Ajouter les proformes de test
        proformes.forEach(proforme => {
            this.addProforme(proforme);
            // Accéder à la propriété privée via une méthode protégée
            this.activateProforme(proforme.id);
        });
    }

    public getTestProformeIds(): string[] {
        // Récupérer les IDs via une méthode protégée
        return Array.from(this.getActiveProformeIds());
    }

    public simulateAdaptProformalityLevel(level: number): void {
        // Appeler la méthode protégée
        this.adaptProformesToFormalityLevel(level);
    }
}

describe('ProformeRegistry', () => {
    let registry: TestProformeRegistry;
    let defaultContext: CulturalContext;

    // Fonction helper pour créer une configuration de doigts de base
    const createBasicFingers = (): FingerConfig[] => {
        return [
            { finger: 'index', bend: 0, spread: 0 },
            { finger: 'middle', bend: 0, spread: 0 },
            { finger: 'ring', bend: 0, spread: 0 },
            { finger: 'pinky', bend: 0, spread: 0 },
            { finger: 'thumb', bend: 0, spread: 0 }
        ];
    };

    // Fonction helper pour créer une proforme valide selon la définition dans types.ts
    const createValidProforme = (id: string, handshapeType: string, represents: string): Proforme => {
        return {
            id,
            name: `Proforme ${id}`,
            handshape: {
                type: handshapeType,
                fingers: createBasicFingers(),
                tension: 0.5
            },
            orientation: {
                palm: 'forward',
                fingers: 'up'
            },
            represents,
            associatedConcepts: [represents],
            properties: {}
        };
    };

    beforeEach(() => {
        registry = new TestProformeRegistry();

        defaultContext = {
            region: 'france',
            formalityLevel: 0.5,
            context: 'conversational' // Valeur valide selon l'enum dans types.ts
        };
    });

    test('should be initialized with base proformes', () => {
        // Vérifier que le registre contient des proformes de base
        const activeProformes = registry.getActiveProformes();
        expect(activeProformes.length).toBeGreaterThan(0);

        // Vérifier que les proformes de base sont présentes
        expect(registry.getProforme('base-index-pointing')).toBeDefined();
        expect(registry.getProforme('base-flat-hand')).toBeDefined();
        expect(registry.getProforme('base-c-handshape')).toBeDefined();
    });

    test('should prepare proformes for a specific cultural context', async () => {
        // Nombre initial de proformes actives
        const initialCount = registry.getActiveProformes().length;

        // Préparer pour le contexte français
        await registry.prepareForContext(defaultContext);

        // Vérifier que des proformes spécifiques à la région ont été ajoutées
        const afterPrepCount = registry.getActiveProformes().length;
        expect(afterPrepCount).toBeGreaterThan(initialCount);

        // Vérifier que les proformes spécifiques à la France sont présentes
        expect(registry.getProforme('region-france-vehicle')).toBeDefined();
        expect(registry.getProforme('region-france-person')).toBeDefined();
    });

    test('should adapt to different regions', async () => {
        // Contexte québécois
        const quebecContext: CulturalContext = {
            ...defaultContext,
            region: 'quebec'
        };

        // Préparer pour le Québec
        await registry.prepareForContext(quebecContext);

        // Vérifier que les proformes spécifiques au Québec sont présentes
        expect(registry.getProforme('region-quebec-vehicle')).toBeDefined();

        // Les proformes spécifiques à la France ne devraient pas être actives
        const activeProformes = registry.getActiveProformes();
        const hasFranceProforme = activeProformes.some((proforme: Proforme) => proforme.id === 'region-france-vehicle');
        expect(hasFranceProforme).toBe(false);
    });

    test('should add and remove proformes correctly', () => {
        // Créer une proforme de test valide
        const testProforme = createValidProforme(
            'test-proforme',
            'fist',
            'test-concept'
        );

        // Ajouter la proforme
        const addResult = registry.addProforme(testProforme);
        expect(addResult).toBe(true);

        // Vérifier que la proforme a été ajoutée
        const retrievedProforme = registry.getProforme('test-proforme');
        expect(retrievedProforme).toBeDefined();
        expect(retrievedProforme?.id).toBe('test-proforme');

        // Ajouter la même proforme à nouveau devrait échouer
        const secondAddResult = registry.addProforme(testProforme);
        expect(secondAddResult).toBe(false);

        // Supprimer la proforme
        const removeResult = registry.removeProforme('test-proforme');
        expect(removeResult).toBe(true);

        // Vérifier que la proforme a été supprimée
        expect(registry.getProforme('test-proforme')).toBeUndefined();

        // Supprimer une proforme inexistante devrait échouer
        const secondRemoveResult = registry.removeProforme('test-proforme');
        expect(secondRemoveResult).toBe(false);
    });

    test('should retrieve proformes by representation', async () => {
        // Créer des proformes représentant le même concept
        const vehicleProformes = [
            createValidProforme('active-vehicle-1', 'vehicle-handshape-1', 'vehicle'),
            createValidProforme('active-vehicle-2', 'vehicle-handshape-2', 'vehicle')
        ];

        // Préparer pour un contexte
        await registry.prepareForContext(defaultContext);

        // Utiliser notre méthode de test pour définir les proformes actives
        registry.setTestProformes(vehicleProformes);

        // Récupérer les proformes par représentation
        const retrievedProformes = registry.getProformesByRepresentation('vehicle');

        // Vérifier que les proformes actives sont retournées
        expect(retrievedProformes.length).toBe(2);

        // Vérifier que les proformes sont correctement indexées par concept
        const vehicleIds = retrievedProformes.map((proforme: Proforme) => proforme.id);
        expect(vehicleIds).toContain('active-vehicle-1');
        expect(vehicleIds).toContain('active-vehicle-2');

        // Les recherches doivent être insensibles à la casse
        const upperCaseProformes = registry.getProformesByRepresentation('VEHICLE');
        expect(upperCaseProformes.length).toBe(retrievedProformes.length);
    });

    test('should reset the registry correctly', async () => {
        // Préparer pour un contexte spécifique
        await registry.prepareForContext(defaultContext);

        // Vérifier que des proformes spécifiques au contexte sont présentes
        expect(registry.getProforme('region-france-vehicle')).toBeDefined();

        // Réinitialiser le registre
        registry.reset();

        // Vérifier que seules les proformes de base sont présentes
        const proformes = registry.getActiveProformes();
        expect(proformes.length).toBeGreaterThan(0);
        expect(proformes.every((proforme: Proforme) => proforme.id.startsWith('base-'))).toBe(true);

        // Les proformes spécifiques à la région devraient être supprimées
        expect(registry.getProforme('region-france-vehicle')).toBeUndefined();
    });

    test('should adapt proformes based on formality level', async () => {
        // Contexte très formel
        const formalContext: CulturalContext = {
            ...defaultContext,
            formalityLevel: 0.9
        };

        // Contexte informel
        const informalContext: CulturalContext = {
            ...defaultContext,
            formalityLevel: 0.1
        };

        // Préparer deux registres avec des niveaux de formalité différents
        const formalRegistry = new TestProformeRegistry();
        await formalRegistry.prepareForContext(formalContext);

        const informalRegistry = new TestProformeRegistry();
        await informalRegistry.prepareForContext(informalContext);

        // Créer une proforme de test identique pour les deux registres
        const testProforme = createValidProforme('test-formality', 'test-handshape', 'test-concept');

        // Ajouter et activer la même proforme dans les deux registres
        formalRegistry.setTestProformes([testProforme]);
        informalRegistry.setTestProformes([testProforme]);

        // Simuler l'adaptation au niveau de formalité via notre classe de test
        formalRegistry.simulateAdaptProformalityLevel(0.9);
        informalRegistry.simulateAdaptProformalityLevel(0.1);

        // Récupérer les proformes adaptées
        const formalProformes = formalRegistry.getActiveProformes();
        const informalProformes = informalRegistry.getActiveProformes();

        // Vérifier l'impact de la formalité
        expect(formalProformes.length).toBe(informalProformes.length);

        // Récupérer les proformes spécifiques pour comparaison
        const formalTestProforme = formalRegistry.getProforme('test-formality');
        const informalTestProforme = informalRegistry.getProforme('test-formality');

        // Vérifier que la tension est différente selon le niveau de formalité
        if (formalTestProforme && informalTestProforme) {
            expect(formalTestProforme.handshape.tension).toBeGreaterThan(informalTestProforme.handshape.tension);
        }
    });
});