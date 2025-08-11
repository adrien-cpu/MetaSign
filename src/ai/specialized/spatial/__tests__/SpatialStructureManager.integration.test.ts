// src/ai/specialized/spatial/__tests__/SpatialStructureManager.integration.test.ts

import { SpatialStructureManager } from '../SpatialStructureManager';
import { CulturalContext, LSFInput, LSFInputType } from '../types';

/**
 * Tests d'intégration pour le SpatialStructureManager refactorisé
 * Ces tests vérifient l'interaction correcte entre tous les composants
 */
describe('SpatialStructureManager Integration', () => {
    let manager: SpatialStructureManager;
    let defaultContext: CulturalContext;
    let testInput: LSFInput;

    beforeEach(() => {
        // Créer une instance du gestionnaire avec ses dépendances par défaut
        manager = new SpatialStructureManager();

        // Préparer un contexte culturel standard
        defaultContext = {
            region: 'france',
            formalityLevel: 0.5,
            context: 'standard'
        };

        // Préparer une entrée LSF de test
        testInput = {
            type: LSFInputType.TEXT_CONVERSION,
            data: "Test input data",
            culturalContext: defaultContext
        };
    });

    test('should generate spatial structure for a cultural context', async () => {
        // Générer une structure spatiale
        const structure = await manager.generateSpatialStructure(defaultContext);

        // Vérifier que la structure est correctement générée
        expect(structure).toBeDefined();
        expect(structure.zones).toBeDefined();
        expect(structure.zones.length).toBeGreaterThan(0);
        expect(structure.proformes).toBeDefined();
        expect(structure.proformes.length).toBeGreaterThan(0);
        expect(structure.metadata).toBeDefined();
        expect(structure.metadata.context).toBe(defaultContext);
    });

    test('should analyze LSF input correctly', async () => {
        // Analyser une entrée LSF
        const analysis = await manager.analyzeSpatialStructure(testInput);

        // Vérifier que l'analyse est correctement générée
        expect(analysis).toBeDefined();
        expect(analysis.components).toBeDefined();
        expect(analysis.relations).toBeDefined();
        expect(analysis.graph).toBeDefined();
        expect(analysis.metadata).toBeDefined();

        // Vérifier que des composants ont été extraits
        expect(analysis.components.length).toBeGreaterThan(0);
    });

    test('should measure coherence of a spatial structure', async () => {
        // Générer une structure spatiale d'abord
        const structure = await manager.generateSpatialStructure(defaultContext);

        // Mesurer la cohérence
        const coherence = await manager.measureCoherence(structure);

        // Vérifier que le score est dans la plage valide
        expect(coherence).toBeGreaterThanOrEqual(0);
        expect(coherence).toBeLessThanOrEqual(1);

        // Pour une structure bien formée, le score devrait être élevé
        expect(coherence).toBeGreaterThan(0.8);
    });

    test('should adapt to different cultural contexts', async () => {
        // Contexte formel
        const formalContext: CulturalContext = {
            region: 'france',
            formalityLevel: 0.9,
            context: 'formal'
        };

        // Contexte informel
        const informalContext: CulturalContext = {
            region: 'france',
            formalityLevel: 0.1,
            context: 'informal'
        };

        // Générer des structures pour les différents contextes
        const formalStructure = await manager.generateSpatialStructure(formalContext);
        const informalStructure = await manager.generateSpatialStructure(informalContext);

        // Les structures devraient être différentes
        expect(formalStructure).not.toEqual(informalStructure);

        // Vérifier des aspects spécifiques aux contextes
        // Par exemple, le contexte formel pourrait avoir plus de zones ou des proformes différentes
        expect(formalStructure.metadata.context.formalityLevel).toBe(0.9);
        expect(informalStructure.metadata.context.formalityLevel).toBe(0.1);
    });

    test('should handle different regions correctly', async () => {
        // Contexte pour la France
        const franceContext: CulturalContext = {
            region: 'france',
            formalityLevel: 0.5
        };

        // Contexte pour le Québec
        const quebecContext: CulturalContext = {
            region: 'quebec',
            formalityLevel: 0.5
        };

        // Générer des structures pour les différentes régions
        const franceStructure = await manager.generateSpatialStructure(franceContext);
        const quebecStructure = await manager.generateSpatialStructure(quebecContext);

        // Les structures devraient être différentes
        expect(franceStructure).not.toEqual(quebecStructure);

        // Vérifier que les régions sont correctement enregistrées
        expect(franceStructure.metadata.context.region).toBe('france');
        expect(quebecStructure.metadata.context.region).toBe('quebec');
    });

    test('should throw specific error for invalid inputs', async () => {
        // Créer un contexte invalide (sans région)
        const invalidContext: CulturalContext = {
            formalityLevel: 0.5
        } as CulturalContext;

        // La génération devrait échouer avec une erreur spécifique
        await expect(manager.generateSpatialStructure(invalidContext))
            .rejects
            .toThrow(SpatialStructureError);
    });
});