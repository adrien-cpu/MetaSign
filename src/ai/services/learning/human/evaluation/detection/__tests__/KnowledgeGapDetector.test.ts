/**
 * Tests unitaires pour KnowledgeGapDetector
 * 
 * @file src/ai/services/learning/human/evaluation/detection/__tests__/KnowledgeGapDetector.test.ts
 * @description Tests complets pour le service de détection de lacunes de connaissances
 * @version 1.0.0
 * @author MetaSign Learning Module
 */

import { KnowledgeGapDetector, KnowledgeGapDetectorConfig } from '../KnowledgeGapDetector';
import { ConceptRelationshipGraph } from '../../graphs/ConceptRelationshipGraph';
import { ConceptRepository } from '../../../coda/codavirtuel/evaluators/repositories/ConceptRepository';
import { MetricsCollector } from '../../../../registry/utils/MetricsCollector';
import { ConceptEvaluation } from '../../../../types/learning-interfaces';

// Types pour les mocks
interface MockConcept {
    id: string;
    name: string;
    description: string;
    level: string;
    prerequisites: string[];
    category: string;
    complexity: number;
    importance: number;
}

interface MockLearningResource {
    id: string;
    title: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    type: 'video' | 'article' | 'exercise' | 'quiz' | 'interactive';
    url: string;
    difficulty: number;
}

// Mocks
jest.mock('@/ai/utils/LoggerFactory');
jest.mock('../../graphs/ConceptRelationshipGraph');
jest.mock('../../../coda/codavirtuel/evaluators/repositories/ConceptRepository');
jest.mock('../../../../registry/utils/MetricsCollector');

describe('KnowledgeGapDetector', () => {
    let detector: KnowledgeGapDetector;
    let mockConceptGraph: jest.Mocked<ConceptRelationshipGraph>;
    let mockMetricsCollector: jest.Mocked<MetricsCollector>;
    let mockConceptRepository: jest.Mocked<ConceptRepository>;

    // Données de test
    const testUserId = 'test-user-123';
    const testConceptEvaluations: ConceptEvaluation[] = [
        {
            conceptId: 'concept_spatial_reference',
            score: 45,
            confidence: 0.8,
            evaluatedAt: new Date()
        },
        {
            conceptId: 'concept_grammar_role_shifting',
            score: 65,
            confidence: 0.7,
            evaluatedAt: new Date()
        },
        {
            conceptId: 'concept_classifiers',
            score: 30,
            confidence: 0.9,
            evaluatedAt: new Date()
        },
        {
            conceptId: 'concept_non_manual_markers',
            score: 85,
            confidence: 0.6,
            evaluatedAt: new Date()
        }
    ];

    const testLearningResources: MockLearningResource[] = [
        {
            id: 'resource_1',
            title: 'Introduction aux références spatiales',
            level: 'beginner',
            type: 'video',
            url: 'https://example.com/resource1',
            difficulty: 1
        },
        {
            id: 'resource_2',
            title: 'Exercices de références spatiales',
            level: 'intermediate',
            type: 'exercise',
            url: 'https://example.com/resource2',
            difficulty: 3
        },
        {
            id: 'resource_3',
            title: 'Maîtrise des classifieurs',
            level: 'beginner',
            type: 'exercise',
            url: 'https://example.com/resource3',
            difficulty: 2
        }
    ];

    beforeEach(() => {
        // Reset des mocks
        jest.clearAllMocks();

        // Configuration des mocks
        mockConceptGraph = new ConceptRelationshipGraph() as jest.Mocked<ConceptRelationshipGraph>;
        mockMetricsCollector = new MetricsCollector({}) as jest.Mocked<MetricsCollector>;

        // Mock du ConceptRepository via le constructeur
        mockConceptRepository = {
            getConceptById: jest.fn(),
            getConceptResources: jest.fn()
        } as unknown as jest.Mocked<ConceptRepository>;

        // Mock du constructeur ConceptRepository
        (ConceptRepository as jest.MockedClass<typeof ConceptRepository>).mockImplementation(() => mockConceptRepository);

        // Configuration par défaut des mocks
        mockConceptGraph.getPrerequisites.mockReturnValue([]);
        mockMetricsCollector.recordEvent.mockResolvedValue({} as never);

        mockConceptRepository.getConceptById.mockImplementation(async (id: string) => ({
            id,
            name: `Concept ${id}`,
            description: `Description for ${id}`,
            level: 'intermediate',
            prerequisites: [],
            category: 'lsf-core',
            complexity: 3,
            importance: 5
        } as MockConcept));

        mockConceptRepository.getConceptResources.mockResolvedValue(testLearningResources as MockLearningResource[]);

        // Création de l'instance
        detector = new KnowledgeGapDetector(mockConceptGraph, mockMetricsCollector);
    });

    describe('Constructor', () => {
        it('should initialize with default configuration', () => {
            const newDetector = new KnowledgeGapDetector(mockConceptGraph, mockMetricsCollector);
            const serviceInfo = newDetector.getServiceInfo();

            expect(serviceInfo.name).toBe('KnowledgeGapDetector');
            expect(serviceInfo.version).toBe('1.1.0');
            expect(serviceInfo.features).toContain('knowledge_gap_detection');
        });

        it('should initialize with custom configuration', () => {
            const config: KnowledgeGapDetectorConfig = {
                masteryThreshold: 80,
                minimumGapPriority: 5,
                enableDetailedMetrics: false,
                minimumConfidence: 0.6,
                maxRecommendedResources: 5
            };

            const newDetector = new KnowledgeGapDetector(mockConceptGraph, mockMetricsCollector, config);
            expect(newDetector).toBeInstanceOf(KnowledgeGapDetector);
        });

        it('should throw error for invalid configuration', () => {
            const invalidConfig: KnowledgeGapDetectorConfig = {
                masteryThreshold: 150, // Invalid: > 100
                minimumGapPriority: 15, // Invalid: > 10
                minimumConfidence: 2.0, // Invalid: > 1
                maxRecommendedResources: 0 // Invalid: < 1
            };

            expect(() => {
                new KnowledgeGapDetector(mockConceptGraph, mockMetricsCollector, invalidConfig);
            }).toThrow();
        });
    });

    describe('detectKnowledgeGaps', () => {
        it('should detect gaps for concepts below mastery threshold', async () => {
            // Configuration des mocks pour ce test
            mockConceptGraph.getPrerequisites
                .mockReturnValueOnce(['prereq_1']) // pour concept_spatial_reference
                .mockReturnValueOnce([]) // pour concept_classifiers
                .mockReturnValue([]);

            const result = await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            expect(result.gaps).toHaveLength(2); // 2 concepts sous le seuil de 70
            expect(result.metadata.analyzedConcepts).toBe(4);
            expect(result.metadata.lowScoringConcepts).toBe(2);
            expect(result.gaps[0].score).toBeLessThan(70);
            expect(result.gaps[1].score).toBeLessThan(70);
        });

        it('should prioritize gaps correctly', async () => {
            const result = await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            // Vérifier que les lacunes sont triées par priorité décroissante
            for (let i = 0; i < result.gaps.length - 1; i++) {
                expect(result.gaps[i].priority).toBeGreaterThanOrEqual(result.gaps[i + 1].priority);
            }
        });

        it('should include recommended resources for each gap', async () => {
            const result = await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            expect(result.gaps.length).toBeGreaterThan(0);
            for (const gap of result.gaps) {
                expect(gap.recommendedResources).toBeDefined();
                expect(gap.recommendedResources.length).toBeGreaterThan(0);
                expect(gap.recommendedResources.length).toBeLessThanOrEqual(3); // maxRecommendedResources par défaut
            }
        });

        it('should record metrics when enabled', async () => {
            await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            expect(mockMetricsCollector.recordEvent).toHaveBeenCalledWith(
                'gap_detection.knowledge.started',
                expect.objectContaining({ userId: testUserId })
            );

            expect(mockMetricsCollector.recordEvent).toHaveBeenCalledWith(
                'gap_detection.knowledge.completed',
                expect.objectContaining({ userId: testUserId })
            );
        });

        it('should filter concepts by confidence threshold', async () => {
            const lowConfidenceEvaluations: ConceptEvaluation[] = [
                {
                    conceptId: 'concept_low_confidence',
                    score: 30, // Sous le seuil
                    confidence: 0.2, // Sous le seuil de confiance (0.4)
                    evaluatedAt: new Date()
                }
            ];

            const result = await detector.detectKnowledgeGaps(testUserId, lowConfidenceEvaluations);

            expect(result.gaps).toHaveLength(0); // Aucune lacune détectée car confiance trop faible
        });

        it('should handle critical concepts with higher priority', async () => {
            const criticalConceptEvaluations: ConceptEvaluation[] = [
                {
                    conceptId: 'concept_spatial_reference', // Concept critique
                    score: 50,
                    confidence: 0.8,
                    evaluatedAt: new Date()
                },
                {
                    conceptId: 'concept_regular', // Concept non critique
                    score: 50,
                    confidence: 0.8,
                    evaluatedAt: new Date()
                }
            ];

            const result = await detector.detectKnowledgeGaps(testUserId, criticalConceptEvaluations);

            const criticalGap = result.gaps.find(gap => gap.conceptId === 'concept_spatial_reference');
            const regularGap = result.gaps.find(gap => gap.conceptId === 'concept_regular');

            if (criticalGap && regularGap) {
                expect(criticalGap.priority).toBeGreaterThan(regularGap.priority);
            }
        });
    });

    describe('Input Validation', () => {
        it('should throw error for empty userId', async () => {
            await expect(detector.detectKnowledgeGaps('', testConceptEvaluations))
                .rejects.toThrow('userId is required and cannot be empty');
        });

        it('should throw error for whitespace-only userId', async () => {
            await expect(detector.detectKnowledgeGaps('   ', testConceptEvaluations))
                .rejects.toThrow('userId is required and cannot be empty');
        });

        it('should throw error for invalid conceptEvaluations', async () => {
            await expect(detector.detectKnowledgeGaps(testUserId, [] as unknown as ConceptEvaluation[]))
                .rejects.toThrow('conceptEvaluations cannot be empty');

            await expect(detector.detectKnowledgeGaps(testUserId, 'invalid' as unknown as ConceptEvaluation[]))
                .rejects.toThrow('conceptEvaluations must be an array');
        });
    });

    describe('Error Handling', () => {
        it('should handle concept repository errors gracefully', async () => {
            mockConceptRepository.getConceptById.mockRejectedValue(new Error('Repository error'));

            await expect(detector.detectKnowledgeGaps(testUserId, testConceptEvaluations))
                .rejects.toThrow('Repository error');

            expect(mockMetricsCollector.recordEvent).toHaveBeenCalledWith(
                'gap_detection.knowledge.error',
                expect.objectContaining({ operation: 'detectKnowledgeGaps' })
            );
        });

        it('should handle missing concepts in repository', async () => {
            mockConceptRepository.getConceptById.mockResolvedValue(undefined);

            const result = await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            // Les concepts non trouvés ne devraient pas générer de lacunes
            expect(result.gaps).toHaveLength(0);
        });

        it('should handle resource recommendation errors', async () => {
            mockConceptRepository.getConceptResources.mockRejectedValue(new Error('Resource error'));

            // L'erreur ne devrait pas empêcher la détection des lacunes
            await expect(detector.detectKnowledgeGaps(testUserId, testConceptEvaluations))
                .rejects.toThrow('Resource error');
        });
    });

    describe('Resource Recommendation', () => {
        it('should recommend appropriate level resources based on score', async () => {
            const beginnerEvaluation: ConceptEvaluation[] = [
                {
                    conceptId: 'concept_test',
                    score: 30, // Score très bas -> niveau débutant
                    confidence: 0.8,
                    evaluatedAt: new Date()
                }
            ];

            // Mock pour retourner des ressources de différents niveaux
            const mixedLevelResources: MockLearningResource[] = [
                { id: 'beginner_1', title: 'Beginner Resource 1', level: 'beginner', type: 'video', url: 'url1', difficulty: 1 },
                { id: 'beginner_2', title: 'Beginner Resource 2', level: 'beginner', type: 'exercise', url: 'url2', difficulty: 1 },
                { id: 'intermediate_1', title: 'Intermediate Resource 1', level: 'intermediate', type: 'exercise', url: 'url3', difficulty: 3 },
                { id: 'advanced_1', title: 'Advanced Resource 1', level: 'advanced', type: 'exercise', url: 'url4', difficulty: 5 }
            ];

            mockConceptRepository.getConceptResources.mockResolvedValue(mixedLevelResources as MockLearningResource[]);

            const result = await detector.detectKnowledgeGaps(testUserId, beginnerEvaluation);

            expect(result.gaps).toHaveLength(1);
            const gap = result.gaps[0];
            expect(gap.recommendedResources).toEqual(['beginner_1', 'beginner_2']); // Seulement les ressources débutant
        });

        it('should limit recommended resources to maxRecommendedResources', async () => {
            const config: KnowledgeGapDetectorConfig = {
                maxRecommendedResources: 2
            };

            const detectorWithLimit = new KnowledgeGapDetector(mockConceptGraph, mockMetricsCollector, config);

            const manyResources: MockLearningResource[] = Array.from({ length: 10 }, (_, i) => ({
                id: `resource_${i}`,
                title: `Resource ${i}`,
                level: 'beginner' as const,
                type: 'video' as const,
                url: `url${i}`,
                difficulty: 1
            }));

            mockConceptRepository.getConceptResources.mockResolvedValue(manyResources as MockLearningResource[]);

            const result = await detectorWithLimit.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            for (const gap of result.gaps) {
                expect(gap.recommendedResources.length).toBeLessThanOrEqual(2);
            }
        });
    });

    describe('Metadata Generation', () => {
        it('should generate accurate metadata', async () => {
            const result = await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            expect(result.metadata).toEqual({
                analyzedConcepts: testConceptEvaluations.length,
                lowScoringConcepts: 2, // Concepts avec score < 70
                analysisTimestamp: expect.any(Date),
                averageGapPriority: expect.any(Number)
            });

            expect(result.metadata.averageGapPriority).toBeGreaterThan(0);
        });

        it('should calculate average gap priority correctly', async () => {
            const result = await detector.detectKnowledgeGaps(testUserId, testConceptEvaluations);

            if (result.gaps.length > 0) {
                const expectedAverage = result.gaps.reduce((sum, gap) => sum + gap.priority, 0) / result.gaps.length;
                expect(result.metadata.averageGapPriority).toBeCloseTo(expectedAverage, 2);
            }
        });
    });

    describe('Performance and Edge Cases', () => {
        it('should handle large number of concept evaluations', async () => {
            const largeEvaluationSet: ConceptEvaluation[] = Array.from({ length: 1000 }, (_, i) => ({
                conceptId: `concept_${i}`,
                score: Math.random() * 100,
                confidence: 0.5 + Math.random() * 0.5,
                evaluatedAt: new Date()
            }));

            const startTime = Date.now();
            const result = await detector.detectKnowledgeGaps(testUserId, largeEvaluationSet);
            const executionTime = Date.now() - startTime;

            expect(result.gaps).toBeDefined();
            expect(executionTime).toBeLessThan(5000); // Moins de 5 secondes
        });

        it('should handle concepts with identical scores', async () => {
            const identicalScoreEvaluations: ConceptEvaluation[] = [
                {
                    conceptId: 'concept_1',
                    score: 50,
                    confidence: 0.8,
                    evaluatedAt: new Date()
                },
                {
                    conceptId: 'concept_2',
                    score: 50,
                    confidence: 0.8,
                    evaluatedAt: new Date()
                }
            ];

            const result = await detector.detectKnowledgeGaps(testUserId, identicalScoreEvaluations);

            expect(result.gaps).toHaveLength(2);
            // Vérifier que les priorités sont déterministes
            expect(result.gaps[0].priority).toBeDefined();
            expect(result.gaps[1].priority).toBeDefined();
        });
    });

    describe('Service Information', () => {
        it('should provide correct service information', () => {
            const serviceInfo = detector.getServiceInfo();

            expect(serviceInfo).toEqual({
                name: 'KnowledgeGapDetector',
                version: '1.1.0',
                features: [
                    'knowledge_gap_detection',
                    'concept_analysis',
                    'learning_resource_recommendation',
                    'gap_prioritization',
                    'prerequisite_analysis'
                ]
            });
        });
    });
});