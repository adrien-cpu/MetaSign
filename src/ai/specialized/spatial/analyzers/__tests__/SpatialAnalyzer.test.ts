// src/ai/specialized/spatial/analyzers/__tests__/SpatialAnalyzer.test.ts

// Utiliser @jest/globals au lieu d'importer directement de 'jest'
import { describe, it, expect, beforeEach } from '@jest/globals';
import { SpatialAnalyzer } from '../SpatialAnalyzer';
import {
    LSFInput,
    LSFInputType,
    SpatialComponent,
    SpatialComponentType,
    // SpatialAnalysis - supprimé car non utilisé
    SpatialRelation,
    SpatialRelationType
} from '../../types';

describe('SpatialAnalyzer', () => {
    let analyzer: SpatialAnalyzer;

    beforeEach(() => {
        analyzer = new SpatialAnalyzer();
    });

    describe('analyzeLSFInput', () => {
        it('should analyze text input and generate valid spatial analysis', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.TEXT_CONVERSION,
                data: 'La personne montre le livre sur la table',
                culturalContext: {
                    region: 'france',
                    formalityLevel: 0.7
                }
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.components.length).toBeGreaterThan(0);
            expect(result.metadata).toBeDefined();
            expect(result.metadata.processingTime).toBeGreaterThan(0);

            // Verify each component has required fields
            result.components.forEach((component) => {
                expect(component.id).toBeDefined();
                expect(component.type).toBeDefined();
                expect(component.properties).toBeDefined();
            });

            // Verify relations if present
            if (result.relations.length > 0) {
                result.relations.forEach((relation) => {
                    expect(relation.id).toBeDefined();
                    expect(relation.sourceId).toBeDefined();
                    expect(relation.targetId).toBeDefined();
                    expect(relation.type).toBeDefined();
                    expect(relation.strength).toBeGreaterThanOrEqual(0);
                    expect(relation.strength).toBeLessThanOrEqual(1);
                });
            }
        });

        it('should analyze structured input and generate valid spatial analysis', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.STRUCTURE_DEFINITION,
                data: {
                    components: [
                        {
                            type: 'zone',
                            x: 0,
                            y: 0,
                            z: 0,
                            intensity: 0.8,
                            name: 'Zone principale'
                        },
                        {
                            type: 'pointing',
                            x: 1,
                            y: 0,
                            z: 0,
                            intensity: 0.9,
                            name: 'Pointage objet'
                        }
                    ],
                    relations: [
                        {
                            source: 'comp_0_1234567890',
                            target: 'comp_1_1234567890',
                            type: 'spatial',
                            strength: 0.7
                        }
                    ]
                }
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            expect(result).toBeDefined();
            expect(result.components.length).toBeGreaterThanOrEqual(1);
            expect(result.graph).toBeDefined();
            expect(result.graph?.nodes.length).toBe(result.components.length);
        });
    });

    describe('graph building and metadata generation', () => {
        it('should generate coherent metadata with complexity and coherence scores', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.TEXT_CONVERSION,
                data: 'Exemple court',
                options: {
                    detailLevel: 'detailed',
                    includeGraph: true
                }
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            expect(result.metadata).toBeDefined();
            expect(result.metadata.confidenceScore).toBeGreaterThanOrEqual(0);
            expect(result.metadata.confidenceScore).toBeLessThanOrEqual(1);
            expect(result.metadata.statistics.complexityScore).toBeGreaterThanOrEqual(0);
            expect(result.metadata.statistics.complexityScore).toBeLessThanOrEqual(1);
            expect(result.metadata.statistics.coherenceScore).toBeGreaterThanOrEqual(0);
            expect(result.metadata.statistics.coherenceScore).toBeLessThanOrEqual(1);
        });
    });

    describe('component and relation handling', () => {
        it('should correctly identify component types from text', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.TEXT_CONVERSION,
                data: 'Le regard montre le mouvement',
                options: {
                    detailLevel: 'standard'
                }
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            // Find components by their properties containing specific words
            const gazeComponent = result.components.find((c) =>
                typeof c.properties.word === 'string' &&
                c.properties.word.includes('regard')
            );

            const pointingComponent = result.components.find((c) =>
                typeof c.properties.word === 'string' &&
                c.properties.word.includes('montre')
            );

            const movementComponent = result.components.find((c) =>
                typeof c.properties.word === 'string' &&
                c.properties.word.includes('mouvement')
            );

            expect(gazeComponent?.type).toBe(SpatialComponentType.GAZE);
            expect(pointingComponent?.type).toBe(SpatialComponentType.POINTING);
            expect(movementComponent?.type).toBe(SpatialComponentType.MOVEMENT);
        });

        it('should create valid relations between components', async () => {
            // Arrange
            const components: SpatialComponent[] = [
                {
                    id: 'comp1',
                    type: SpatialComponentType.ZONE,
                    position: { x: 0, y: 0, z: 0 },
                    properties: { name: 'Zone 1' }
                },
                {
                    id: 'comp2',
                    type: SpatialComponentType.POINTING,
                    position: { x: 1, y: 0, z: 0 },
                    properties: { name: 'Pointing 1' }
                }
            ];

            const relations: SpatialRelation[] = [
                {
                    id: 'rel1',
                    sourceId: 'comp1',
                    targetId: 'comp2',
                    type: SpatialRelationType.SPATIAL,
                    strength: 0.8,
                    properties: { name: 'Relation 1' }
                }
            ];

            // Create a private method accessor for testing
            // @ts-expect-error Accessing private method for testing
            const graph = analyzer.buildSpatialGraph(components, relations);

            // Assert
            expect(graph.nodes).toEqual(components);
            expect(graph.edges).toEqual(relations);
            expect(graph.properties.nodeCount).toBe(components.length);
            expect(graph.properties.edgeCount).toBe(relations.length);
        });
    });

    describe('error handling', () => {
        it('should handle empty input gracefully', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.TEXT_CONVERSION,
                data: '',
                options: {
                    detailLevel: 'basic'
                }
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            expect(result).toBeDefined();
            expect(result.components).toEqual([]);
            expect(result.metadata.warnings.length).toBeGreaterThan(0);
            expect(result.metadata.statistics.coherenceScore).toBe(0);
        });

        it('should generate warnings for problematic inputs', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.STRUCTURE_DEFINITION,
                data: {
                    components: [],
                    relations: []
                }
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            expect(result.metadata.warnings.length).toBeGreaterThan(0);
            expect(result.metadata.warnings.some(w => w.includes('No components'))).toBeTruthy();
        });
    });

    describe('performance metrics', () => {
        it('should record processing time in metadata', async () => {
            // Arrange
            const input: LSFInput = {
                type: LSFInputType.TEXT_CONVERSION,
                data: 'Test simple'
            };

            // Act
            const result = await analyzer.analyzeLSFInput(input);

            // Assert
            expect(result.metadata.processingTime).toBeGreaterThan(0);
        });
    });
});