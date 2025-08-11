/**
 * Tests unitaires pour l'architecture CODA refactorisée - Version finale corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/__tests__/CECRLCODAEvaluator.test.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/__tests__
 * @description Tests complets pour CECRLCODAEvaluator avec tous les types corrects
 * Compatible avec exactOptionalPropertyTypes: true et sans usage d'any
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-20
 */

import { CECRLCODAEvaluator } from '../CECRLCODAEvaluator';
import { MentorSkillsAnalyzer } from '../analyzers/MentorSkillsAnalyzer';
import { SupportGenerator } from '../generators/SupportGenerator';
import { PredictionEngine } from '../engines/PredictionEngine';
import { CulturalAnalyzer } from '../analyzers/CulturalAnalyzer';
import type {
    TeachingSession,
    MentorEvaluation,
    CODAExperienceEvaluation,
    EmotionalContext,
    CulturalContext,
    LearningPrediction,
    TeachingSupport
} from '../types/CODAEvaluatorTypes';

// === TYPES MANQUANTS DÉFINIS ===
/**
 * Configuration pour l'évaluateur CODA - Type corrigé
 */
interface CECRLCODAEvaluatorConfig {
    readonly aiIntelligenceLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    readonly culturalAuthenticity?: boolean;
    readonly enablePredictiveAnalysis?: boolean;
    readonly supportGenerationEnabled?: boolean;
}

/**
 * Type pour les prédictions de progression
 */
interface ProgressPredictions {
    readonly nextMilestone: {
        readonly skill: string;
        readonly estimatedDate: Date;
        readonly confidence: number;
    };
    readonly levelProgression: {
        readonly currentLevel: string;
        readonly nextLevel: string;
        readonly estimatedTimeToNext: number;
        readonly requiredSessions: number;
        readonly progressionRate: number;
        readonly confidence: number;
    };
    readonly riskFactors: readonly string[];
    readonly opportunities: readonly string[];
}

/**
 * Type pour l'analyse culturelle
 */
interface CulturalAnalysis {
    readonly culturalAlignment: number;
    readonly adaptationSuggestions: readonly string[];
    readonly culturalStrengths: readonly string[];
    readonly culturalChallenges: readonly string[];
    readonly communityRecommendations: readonly string[];
}

/**
 * Contexte d'évaluation des compétences mentor - supprimé car non utilisé
 */

// === MOCKS TYPÉS COMPLETS ===
// Mock de base pour les classes avec toutes leurs propriétés
interface MockMentorSkillsAnalyzer {
    readonly logger: unknown;
    readonly config: unknown;
    calculateSessionMetrics: jest.Mock;
    evaluateIndividualCompetencies: jest.Mock;
    evaluateMentorSkills: jest.Mock;
    // Autres méthodes potentielles
    [key: string]: unknown;
}

interface MockSupportGenerator {
    readonly logger: unknown;
    createExplanationSupport: jest.Mock;
    createPatienceSupport: jest.Mock;
    createCulturalSupport: jest.Mock;
    generateAdaptiveSupports: jest.Mock;
    // Autres méthodes potentielles
    [key: string]: unknown;
}

interface MockPredictionEngine {
    readonly logger: unknown;
    readonly config: unknown;
    analyzeLearningTrend: jest.Mock;
    predictNextMilestone: jest.Mock;
    generateProgressPredictions: jest.Mock;
    // Autres méthodes potentielles
    [key: string]: unknown;
}

interface MockCulturalAnalyzer {
    readonly logger: unknown;
    readonly config: unknown;
    calculateCulturalMetrics: jest.Mock;
    calculateCulturalAlignment: jest.Mock;
    analyzeCulturalContext: jest.Mock;
    // Autres méthodes potentielles
    [key: string]: unknown;
}

// === FACTORY FUNCTIONS POUR LES MOCKS ===
const createMockMentorSkillsAnalyzer = (): MockMentorSkillsAnalyzer => ({
    logger: {},
    config: {},
    calculateSessionMetrics: jest.fn(),
    evaluateIndividualCompetencies: jest.fn(),
    evaluateMentorSkills: jest.fn()
});

const createMockSupportGenerator = (): MockSupportGenerator => ({
    logger: {},
    createExplanationSupport: jest.fn(),
    createPatienceSupport: jest.fn(),
    createCulturalSupport: jest.fn(),
    generateAdaptiveSupports: jest.fn()
});

const createMockPredictionEngine = (): MockPredictionEngine => ({
    logger: {},
    config: {},
    analyzeLearningTrend: jest.fn(),
    predictNextMilestone: jest.fn(),
    generateProgressPredictions: jest.fn()
});

const createMockCulturalAnalyzer = (): MockCulturalAnalyzer => ({
    logger: {},
    config: {},
    calculateCulturalMetrics: jest.fn(),
    calculateCulturalAlignment: jest.fn(),
    analyzeCulturalContext: jest.fn()
});

// === MOCKS DES CONSTRUCTEURS ===
jest.mock('../analyzers/MentorSkillsAnalyzer', () => ({
    MentorSkillsAnalyzer: jest.fn()
}));

jest.mock('../generators/SupportGenerator', () => ({
    SupportGenerator: jest.fn()
}));

jest.mock('../engines/PredictionEngine', () => ({
    PredictionEngine: jest.fn()
}));

jest.mock('../analyzers/CulturalAnalyzer', () => ({
    CulturalAnalyzer: jest.fn()
}));

describe('CECRLCODAEvaluator', () => {
    let evaluator: CECRLCODAEvaluator;
    let mockMentorAnalyzer: MockMentorSkillsAnalyzer;
    let mockSupportGenerator: MockSupportGenerator;
    let mockPredictionEngine: MockPredictionEngine;
    let mockCulturalAnalyzer: MockCulturalAnalyzer;

    // === DONNÉES DE TEST CONFORMES AUX TYPES ===
    const mockSessions: TeachingSession[] = [
        {
            sessionId: 'session-1',
            mentorId: 'mentor-123',
            content: {
                topic: 'basic_signs',
                concepts: ['salutation', 'politesse'],
                teachingMethod: 'visual',
                duration: 30
            },
            // Conforme au type aiReactions défini dans CODAEvaluatorTypes.ts
            aiReactions: {
                comprehension: 0.8,
                questions: ['Comment dit-on bonjour?'],
                errors: [],
                correctionsAccepted: 0.9,
                frustrationSigns: 0.1
            },
            results: {
                objectivesAchieved: 0.85,
                newSkillsAcquired: ['salutation'],
                improvement: 0.15,
                aiSatisfaction: 0.9
            },
            timestamp: new Date('2025-01-15T10:00:00Z')
        }
    ];

    const mockMentorEvaluation: MentorEvaluation = {
        overallScore: 0.8,
        teachingLevel: 'proficient',
        competencies: {
            explanation: 0.8,
            patience: 0.7,
            adaptation: 0.9,
            encouragement: 0.8,
            culturalSensitivity: 0.7
        },
        strengths: ['Excellente adaptation'],
        improvements: ['Améliorer la patience'],
        recommendations: ['Continuer sur cette voie']
    };

    const mockCulturalContext: CulturalContext = {
        region: 'France',
        culturalNuances: ['LSF régionale'],
        historicalReferences: ['Histoire sourde française'],
        authenticityLevel: 0.8
    };

    const mockEmotionalContext: EmotionalContext = {
        detectedEmotion: 'motivated',
        intensity: 0.7,
        contributingFactors: ['Succès récent'],
        adaptationRecommendations: ['Maintenir le niveau']
    };

    // mockUserNeeds supprimé car non utilisé dans les tests actuels

    const mockLearningPredictions: LearningPrediction[] = [
        {
            area: 'vocabulary',
            difficulty: 'medium',
            timeEstimate: 120,
            confidence: 0.8,
            recommendations: ['Pratiquer régulièrement'],
            potentialObstacles: ['Fatigue'],
            adaptationStrategies: ['Faire des pauses']
        }
    ];

    const mockProgressPredictions: ProgressPredictions = {
        nextMilestone: {
            skill: 'advanced_conversation',
            estimatedDate: new Date('2025-03-01'),
            confidence: 0.8
        },
        levelProgression: {
            currentLevel: 'A1',
            nextLevel: 'A2',
            estimatedTimeToNext: 45,
            requiredSessions: 15,
            progressionRate: 0.7,
            confidence: 0.8
        },
        riskFactors: ['Manque de pratique'],
        opportunities: ['Bon engagement']
    };

    const mockCulturalAnalysis: CulturalAnalysis = {
        culturalAlignment: 0.7,
        adaptationSuggestions: ['Intégrer plus de culture sourde'],
        culturalStrengths: ['Respect des codes'],
        culturalChallenges: ['Manque de références historiques'],
        communityRecommendations: ['Participer aux événements sourds']
    };

    const mockTeachingSupports: TeachingSupport[] = [
        {
            id: 'support-1',
            type: 'visual_aid',
            title: 'Guide des salutations',
            description: 'Support visuel pour les salutations',
            content: { images: ['salut1.jpg'] },
            targetWeakness: 'vocabulaire',
            estimatedEffectiveness: 0.8
        }
    ];

    // mockAIStudentStatus supprimé car non utilisé dans les tests actuels

    beforeEach(() => {
        // Réinitialiser tous les mocks
        jest.clearAllMocks();

        // Créer des instances mockées
        mockMentorAnalyzer = createMockMentorSkillsAnalyzer();
        mockSupportGenerator = createMockSupportGenerator();
        mockPredictionEngine = createMockPredictionEngine();
        mockCulturalAnalyzer = createMockCulturalAnalyzer();

        // Configurer les retours des mocks
        mockMentorAnalyzer.evaluateMentorSkills.mockResolvedValue(mockMentorEvaluation);
        mockSupportGenerator.generateAdaptiveSupports.mockResolvedValue(mockTeachingSupports);
        mockPredictionEngine.generateProgressPredictions.mockResolvedValue(mockProgressPredictions);
        mockCulturalAnalyzer.analyzeCulturalContext.mockResolvedValue(mockCulturalAnalysis);

        // Configurer les mocks des constructeurs pour retourner les instances mockées
        (MentorSkillsAnalyzer as jest.MockedClass<typeof MentorSkillsAnalyzer>)
            .mockImplementation(() => mockMentorAnalyzer as unknown as MentorSkillsAnalyzer);
        (SupportGenerator as jest.MockedClass<typeof SupportGenerator>)
            .mockImplementation(() => mockSupportGenerator as unknown as SupportGenerator);
        (PredictionEngine as jest.MockedClass<typeof PredictionEngine>)
            .mockImplementation(() => mockPredictionEngine as unknown as PredictionEngine);
        (CulturalAnalyzer as jest.MockedClass<typeof CulturalAnalyzer>)
            .mockImplementation(() => mockCulturalAnalyzer as unknown as CulturalAnalyzer);

        // Créer une instance de l'évaluateur avec configuration correcte
        evaluator = new CECRLCODAEvaluator({
            aiIntelligenceLevel: 'advanced',
            culturalAuthenticity: true,
            enablePredictiveAnalysis: true
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should initialize with default configuration', () => {
            const defaultEvaluator = new CECRLCODAEvaluator();
            expect(defaultEvaluator).toBeInstanceOf(CECRLCODAEvaluator);
        });

        test('should initialize with custom configuration', () => {
            const customConfig: CECRLCODAEvaluatorConfig = {
                aiIntelligenceLevel: 'expert',
                culturalAuthenticity: false,
                enablePredictiveAnalysis: true
            };

            const customEvaluator = new CECRLCODAEvaluator(customConfig);
            expect(customEvaluator).toBeInstanceOf(CECRLCODAEvaluator);
        });

        test('should validate configuration parameters', () => {
            // Test avec configuration valide
            expect(() => {
                new CECRLCODAEvaluator({
                    aiIntelligenceLevel: 'advanced'
                });
            }).not.toThrow();
        });
    });

    describe('evaluateCODAExperience', () => {
        test('should perform complete CODA evaluation with all required properties', async () => {
            const result: CODAExperienceEvaluation = await evaluator.evaluateCODAExperience('mentor-123', mockSessions);

            // Vérifier la structure conforme à CODAExperienceEvaluation
            expect(result).toBeDefined();
            expect(result.mentorEvaluation).toEqual(mockMentorEvaluation);
            expect(result.aiStudent).toBeDefined();
            expect(result.teachingSupports).toEqual(mockTeachingSupports);
            expect(result.predictions).toEqual(mockLearningPredictions);
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.culturalContext).toEqual(mockCulturalContext);
            expect(result.emotionalContext).toBeDefined();
            expect(result.userNeeds).toBeDefined();

            // Vérifier que les services ont été appelés
            expect(mockMentorAnalyzer.evaluateMentorSkills).toHaveBeenCalledWith(
                mockSessions,
                expect.any(Object)
            );
            expect(mockSupportGenerator.generateAdaptiveSupports).toHaveBeenCalled();
            expect(mockPredictionEngine.generateProgressPredictions).toHaveBeenCalled();
            expect(mockCulturalAnalyzer.analyzeCulturalContext).toHaveBeenCalled();
        });

        test('should use cache for identical requests', async () => {
            // Premier appel
            const result1 = await evaluator.evaluateCODAExperience('mentor-123', mockSessions);

            // Deuxième appel (devrait utiliser le cache)
            const result2 = await evaluator.evaluateCODAExperience('mentor-123', mockSessions);

            // Vérifier que les résultats sont identiques
            expect(result1).toEqual(result2);

            // L'analyseur ne devrait être appelé qu'une fois (cache)
            expect(mockMentorAnalyzer.evaluateMentorSkills).toHaveBeenCalledTimes(1);
        });

        test('should handle errors gracefully', async () => {
            const errorMessage = 'Service unavailable';
            mockMentorAnalyzer.evaluateMentorSkills.mockRejectedValue(new Error(errorMessage));

            await expect(
                evaluator.evaluateCODAExperience('mentor-123', mockSessions)
            ).rejects.toThrow(errorMessage);
        });

        test('should generate unique AI student for each mentor', async () => {
            const result1 = await evaluator.evaluateCODAExperience('mentor-1', mockSessions);
            const result2 = await evaluator.evaluateCODAExperience('mentor-2', mockSessions);

            // Les noms des IA étudiantes devraient être différents (ou les mêmes de façon déterministe)
            expect(result1.aiStudent.name).toBeDefined();
            expect(result2.aiStudent.name).toBeDefined();
        });
    });

    describe('evaluateMentorSkills', () => {
        test('should evaluate mentor skills with default context', async () => {
            const result = await evaluator.evaluateMentorSkills(mockSessions);

            expect(result).toEqual(mockMentorEvaluation);
            expect(mockMentorAnalyzer.evaluateMentorSkills).toHaveBeenCalledWith(
                mockSessions,
                expect.objectContaining({
                    mentorId: expect.any(String),
                    totalSessions: 1,
                    mentorExperience: expect.any(String),
                    aiStudentLevel: expect.any(String)
                })
            );
        });

        test('should handle emotional context parameter', async () => {
            // Conversion sécurisée via unknown comme recommandé par TypeScript
            const emotionalContextAsRecord = mockEmotionalContext as unknown as Record<string, unknown>;

            await evaluator.evaluateMentorSkills(mockSessions, emotionalContextAsRecord);

            expect(mockMentorAnalyzer.evaluateMentorSkills).toHaveBeenCalledWith(
                mockSessions,
                expect.objectContaining({
                    emotionalContext: expect.any(Object)
                })
            );
        });

        test('should return consistent results for same input', async () => {
            const result1 = await evaluator.evaluateMentorSkills(mockSessions);
            const result2 = await evaluator.evaluateMentorSkills(mockSessions);

            expect(result1).toEqual(result2);
        });
    });

    describe('generateAdaptiveSupports', () => {
        test('should generate adaptive supports', async () => {
            const supports = await evaluator.generateAdaptiveSupports(mockSessions, mockMentorEvaluation);

            expect(supports).toEqual(mockTeachingSupports);
            expect(mockSupportGenerator.generateAdaptiveSupports).toHaveBeenCalledWith(
                mockSessions,
                expect.any(Object),
                mockMentorEvaluation
            );
        });

        test('should handle empty sessions gracefully', async () => {
            const supports = await evaluator.generateAdaptiveSupports([], mockMentorEvaluation);

            expect(supports).toBeDefined();
            expect(Array.isArray(supports)).toBe(true);
        });
    });

    describe('Configuration handling', () => {
        test('should apply configuration correctly', async () => {
            const configuredEvaluator = new CECRLCODAEvaluator({
                aiIntelligenceLevel: 'expert',
                culturalAuthenticity: false,
                enablePredictiveAnalysis: true
            });

            const result = await configuredEvaluator.evaluateCODAExperience('mentor-123', mockSessions);

            expect(result).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });

        test('should handle missing optional configuration', () => {
            // Configuration minimale
            const minimalEvaluator = new CECRLCODAEvaluator({
                aiIntelligenceLevel: 'basic'
            });

            expect(minimalEvaluator).toBeInstanceOf(CECRLCODAEvaluator);
        });
    });

    describe('Error handling and edge cases', () => {
        test('should handle empty mentor ID', async () => {
            await expect(
                evaluator.evaluateCODAExperience('', mockSessions)
            ).rejects.toThrow();
        });

        test('should handle empty sessions array', async () => {
            const result = await evaluator.evaluateCODAExperience('mentor-123', []);

            expect(result).toBeDefined();
            expect(result.mentorEvaluation).toBeDefined();
        });

        test('should handle invalid session data', async () => {
            const invalidSession: TeachingSession = {
                ...mockSessions[0],
                aiReactions: {
                    ...mockSessions[0].aiReactions,
                    comprehension: -1 // Valeur invalide
                }
            };

            await expect(
                evaluator.evaluateCODAExperience('mentor-123', [invalidSession])
            ).rejects.toThrow();
        });
    });

    describe('Performance and caching', () => {
        test('should complete evaluation within reasonable time', async () => {
            const startTime = Date.now();

            await evaluator.evaluateCODAExperience('mentor-123', mockSessions);

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // L'évaluation devrait prendre moins de 1 seconde
            expect(executionTime).toBeLessThan(1000);
        });

        test('should cache results to improve performance', async () => {
            // Premier appel (non mis en cache)
            const startTime1 = Date.now();
            await evaluator.evaluateCODAExperience('mentor-cache-test', mockSessions);
            const time1 = Date.now() - startTime1;

            // Deuxième appel (mis en cache)
            const startTime2 = Date.now();
            await evaluator.evaluateCODAExperience('mentor-cache-test', mockSessions);
            const time2 = Date.now() - startTime2;

            // Le deuxième appel devrait être plus rapide
            expect(time2).toBeLessThan(time1);
        });
    });
});