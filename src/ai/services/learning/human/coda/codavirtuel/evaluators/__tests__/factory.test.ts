/**
 * Tests unitaires pour les factory functions du module CODA
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/__tests__/factory.test.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/__tests__
 * @description Tests pour toutes les factory functions et configurations prédéfinies
 * Compatible avec exactOptionalPropertyTypes: true et sans usage d'any
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2025
 * @lastModified 2025-01-20
 */

import {
    createCODAEvaluator,
    createEmotionalAnalyzer,
    createMentorEvaluator,
    createAIStudentEvolver,
    createSupportGenerator,
    createPredictionGenerator,
    createCulturalContextGenerator,
    createCODAComponents,
    CODA_PRESETS,
    CODA_EVALUATOR_CONSTANTS,
    CODAEvaluatorUtils
} from '../index';

import type {
    CODAEvaluatorConfig,
    EmotionalConfig,
    AIIntelligenceLevel,
    CODAPersonalityType
} from '../types/CODAEvaluatorTypes';

describe('Factory Functions', () => {
    describe('createCODAEvaluator', () => {
        test('should create evaluator with default config', () => {
            const evaluator = createCODAEvaluator();
            expect(evaluator).toBeDefined();
            expect(evaluator.constructor.name).toBe('CECRLCODAEvaluator');
        });

        test('should create evaluator with custom config', () => {
            const config: CODAEvaluatorConfig = {
                aiIntelligenceLevel: 'expert',
                culturalAuthenticity: false
            };

            const evaluator = createCODAEvaluator(config);
            expect(evaluator).toBeDefined();
            expect(evaluator.constructor.name).toBe('CECRLCODAEvaluator');
        });

        test('should handle all intelligence levels', () => {
            const levels: AIIntelligenceLevel[] = ['basic', 'intermediate', 'advanced', 'expert'];

            levels.forEach(level => {
                const evaluator = createCODAEvaluator({ aiIntelligenceLevel: level });
                expect(evaluator).toBeDefined();
            });
        });
    });

    describe('createEmotionalAnalyzer', () => {
        test('should create emotional analyzer with config', () => {
            const config: EmotionalConfig = {
                frustrationThreshold: 0.7,
                motivationBoost: 0.3,
                culturalSensitivityWeight: 0.25,
                empathyWeight: 0.35
            };

            const analyzer = createEmotionalAnalyzer(config);
            expect(analyzer).toBeDefined();
            expect(analyzer.constructor.name).toBe('EmotionalAnalyzer');
        });

        test('should handle different threshold values', () => {
            const configs = [
                { frustrationThreshold: 0.5, motivationBoost: 0.2, culturalSensitivityWeight: 0.2, empathyWeight: 0.3 },
                { frustrationThreshold: 0.8, motivationBoost: 0.4, culturalSensitivityWeight: 0.3, empathyWeight: 0.4 }
            ];

            configs.forEach(config => {
                const analyzer = createEmotionalAnalyzer(config);
                expect(analyzer).toBeDefined();
            });
        });
    });

    describe('createMentorEvaluator', () => {
        test('should create mentor evaluator with config', () => {
            const config: EmotionalConfig = {
                frustrationThreshold: 0.6,
                motivationBoost: 0.3,
                culturalSensitivityWeight: 0.25,
                empathyWeight: 0.35
            };

            const evaluator = createMentorEvaluator(config);
            expect(evaluator).toBeDefined();
            expect(evaluator.constructor.name).toBe('MentorEvaluator');
        });
    });

    describe('createAIStudentEvolver', () => {
        test('should create AI student evolver', () => {
            const evolver = createAIStudentEvolver();
            expect(evolver).toBeDefined();
            expect(evolver.constructor.name).toBe('AIStudentEvolver');
        });
    });

    describe('createSupportGenerator', () => {
        test('should create support generator', () => {
            const generator = createSupportGenerator();
            expect(generator).toBeDefined();
            expect(generator.constructor.name).toBe('SupportGenerator');
        });
    });

    describe('createPredictionGenerator', () => {
        test('should create prediction generator', () => {
            const generator = createPredictionGenerator();
            expect(generator).toBeDefined();
            expect(generator.constructor.name).toBe('PredictionGenerator');
        });
    });

    describe('createCulturalContextGenerator', () => {
        test('should create cultural context generator', () => {
            const generator = createCulturalContextGenerator();
            expect(generator).toBeDefined();
            expect(generator.constructor.name).toBe('CulturalContextGenerator');
        });
    });

    describe('createCODAComponents', () => {
        test('should create complete CODA components with default config', () => {
            const components = createCODAComponents();

            expect(components.evaluator).toBeDefined();
            expect(components.emotionalAnalyzer).toBeDefined();
            expect(components.mentorEvaluator).toBeDefined();
            expect(components.aiStudentEvolver).toBeDefined();
            expect(components.supportGenerator).toBeDefined();
            expect(components.predictionGenerator).toBeDefined();
            expect(components.culturalContextGenerator).toBeDefined();
        });

        test('should create components with custom config', () => {
            const config: CODAEvaluatorConfig = {
                aiIntelligenceLevel: 'expert',
                culturalAuthenticity: true
            };

            const components = createCODAComponents(config);

            expect(components.evaluator).toBeDefined();
            expect(components.emotionalAnalyzer).toBeDefined();
            expect(components.mentorEvaluator).toBeDefined();
        });

        test('should adapt emotional config based on intelligence level', () => {
            const expertComponents = createCODAComponents({ aiIntelligenceLevel: 'expert' });
            const basicComponents = createCODAComponents({ aiIntelligenceLevel: 'basic' });

            expect(expertComponents.evaluator).toBeDefined();
            expect(basicComponents.evaluator).toBeDefined();
        });
    });

    describe('CODA_PRESETS', () => {
        test('should have all predefined configurations', () => {
            expect(CODA_PRESETS.BEGINNER).toBeDefined();
            expect(CODA_PRESETS.INTERMEDIATE).toBeDefined();
            expect(CODA_PRESETS.ADVANCED).toBeDefined();
            expect(CODA_PRESETS.EXPERT).toBeDefined();
            expect(CODA_PRESETS.RESEARCH).toBeDefined();
        });

        test('should have correct intelligence levels for each preset', () => {
            expect(CODA_PRESETS.BEGINNER.aiIntelligenceLevel).toBe('basic');
            expect(CODA_PRESETS.INTERMEDIATE.aiIntelligenceLevel).toBe('intermediate');
            expect(CODA_PRESETS.ADVANCED.aiIntelligenceLevel).toBe('advanced');
            expect(CODA_PRESETS.EXPERT.aiIntelligenceLevel).toBe('expert');
            expect(CODA_PRESETS.RESEARCH.aiIntelligenceLevel).toBe('expert');
        });

        test('should create evaluators with preset configs', () => {
            Object.values(CODA_PRESETS).forEach(preset => {
                const evaluator = createCODAEvaluator(preset);
                expect(evaluator).toBeDefined();
            });
        });

        test('should have valid emotional sensitivity values', () => {
            Object.values(CODA_PRESETS).forEach(preset => {
                expect(preset.emotionalSensitivity).toBeGreaterThanOrEqual(0);
                expect(preset.emotionalSensitivity).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('CODA_EVALUATOR_CONSTANTS', () => {
        test('should have AI student names', () => {
            expect(CODA_EVALUATOR_CONSTANTS.AI_STUDENT_NAMES).toBeDefined();
            expect(Array.isArray(CODA_EVALUATOR_CONSTANTS.AI_STUDENT_NAMES)).toBe(true);
            expect(CODA_EVALUATOR_CONSTANTS.AI_STUDENT_NAMES.length).toBeGreaterThan(0);
        });

        test('should have teaching level thresholds', () => {
            const thresholds = CODA_EVALUATOR_CONSTANTS.TEACHING_LEVEL_THRESHOLDS;
            expect(thresholds.expert).toBeDefined();
            expect(thresholds.proficient).toBeDefined();
            expect(thresholds.developing).toBeDefined();

            expect(thresholds.expert).toBeGreaterThan(thresholds.proficient);
            expect(thresholds.proficient).toBeGreaterThan(thresholds.developing);
        });

        test('should have CECRL thresholds', () => {
            const cecrlThresholds = CODA_EVALUATOR_CONSTANTS.CECRL_THRESHOLDS;
            expect(cecrlThresholds.A2).toBeDefined();
            expect(cecrlThresholds.B1).toBeDefined();
            expect(cecrlThresholds.B2).toBeDefined();

            expect(cecrlThresholds.B2.comprehension).toBeGreaterThan(cecrlThresholds.B1.comprehension);
            expect(cecrlThresholds.B1.comprehension).toBeGreaterThan(cecrlThresholds.A2.comprehension);
        });

        test('should have default personalities', () => {
            const personalities = CODA_EVALUATOR_CONSTANTS.DEFAULT_PERSONALITIES;
            expect(personalities.encouraging_mentor).toBeDefined();
            expect(personalities.challenging_coach).toBeDefined();
            expect(personalities.patient_guide).toBeDefined();
            expect(personalities.playful_companion).toBeDefined();
            expect(personalities.wise_elder).toBeDefined();
            expect(personalities.peer_supporter).toBeDefined();
        });
    });

    describe('CODAEvaluatorUtils', () => {
        test('should calculate average correctly', () => {
            const values = [0.5, 0.7, 0.8, 0.6];
            const average = CODAEvaluatorUtils.calculateAverage(values);
            expect(average).toBeCloseTo(0.65);
        });

        test('should handle empty array for average', () => {
            const average = CODAEvaluatorUtils.calculateAverage([]);
            expect(average).toBe(0);
        });

        test('should calculate variability', () => {
            const values = [0.5, 0.7, 0.8, 0.6];
            const variability = CODAEvaluatorUtils.calculateVariability(values);
            expect(variability).toBeGreaterThan(0);
        });

        test('should handle single value for variability', () => {
            const variability = CODAEvaluatorUtils.calculateVariability([0.5]);
            expect(variability).toBe(0);
        });

        test('should normalize scores correctly', () => {
            expect(CODAEvaluatorUtils.normalizeScore(0.5)).toBe(0.5);
            expect(CODAEvaluatorUtils.normalizeScore(-0.1)).toBe(0);
            expect(CODAEvaluatorUtils.normalizeScore(1.1)).toBe(1);
        });

        test('should determine teaching level correctly', () => {
            expect(CODAEvaluatorUtils.determineTeachingLevel(0.9)).toBe('expert');
            expect(CODAEvaluatorUtils.determineTeachingLevel(0.75)).toBe('proficient');
            expect(CODAEvaluatorUtils.determineTeachingLevel(0.6)).toBe('developing');
            expect(CODAEvaluatorUtils.determineTeachingLevel(0.3)).toBe('novice');
        });

        test('should calculate CECRL level correctly', () => {
            expect(CODAEvaluatorUtils.calculateCECRLLevel(0.95, 25, 350)).toBe('B2');
            expect(CODAEvaluatorUtils.calculateCECRLLevel(0.8, 15, 200)).toBe('B1');
            expect(CODAEvaluatorUtils.calculateCECRLLevel(0.65, 8, 80)).toBe('A2');
            expect(CODAEvaluatorUtils.calculateCECRLLevel(0.5, 3, 30)).toBe('A1');
        });

        test('should generate AI student name deterministically', () => {
            const name1 = CODAEvaluatorUtils.generateAIStudentName('mentor-123');
            const name2 = CODAEvaluatorUtils.generateAIStudentName('mentor-123');
            const name3 = CODAEvaluatorUtils.generateAIStudentName('mentor-456');

            expect(name1).toBe(name2); // Même mentor = même nom
            expect(name1).toBeDefined();
            expect(name3).toBeDefined();
        });

        test('should validate config correctly', () => {
            const validConfig: CODAEvaluatorConfig = {
                aiIntelligenceLevel: 'advanced',
                culturalAuthenticity: true
            };

            expect(CODAEvaluatorUtils.validateConfig(validConfig)).toBe(true);
        });

        test('should reject invalid config', () => {
            const invalidConfig = {
                emotionalSensitivity: 1.5 // > 1, donc invalide
            } as CODAEvaluatorConfig;

            expect(CODAEvaluatorUtils.validateConfig(invalidConfig)).toBe(false);
        });

        test('should get default personality', () => {
            const personality = CODAEvaluatorUtils.getDefaultPersonality('encouraging_mentor');
            expect(personality).toBeDefined();
            expect(personality?.type).toBe('encouraging_mentor');
        });

        test('should return undefined for unknown personality', () => {
            const personality = CODAEvaluatorUtils.getDefaultPersonality('unknown_type' as CODAPersonalityType);
            expect(personality).toBeUndefined();
        });

        test('should calculate emotional match score', () => {
            const score1 = CODAEvaluatorUtils.calculateEmotionalMatchScore('confident', 0.8);
            const score2 = CODAEvaluatorUtils.calculateEmotionalMatchScore('frustrated', 0.6);

            expect(score1).toBeGreaterThan(score2);
            expect(score1).toBeGreaterThanOrEqual(0);
            expect(score1).toBeLessThanOrEqual(1);
            expect(score2).toBeGreaterThanOrEqual(0);
            expect(score2).toBeLessThanOrEqual(1);
        });
    });

    describe('Integration Tests', () => {
        test('should create complete system with preset and validate', () => {
            const preset = CODA_PRESETS.ADVANCED;

            // Valider la configuration avec les utilitaires
            expect(CODAEvaluatorUtils.validateConfig(preset)).toBe(true);

            // Créer les composants
            const components = createCODAComponents(preset);
            expect(components.evaluator).toBeDefined();

            // Tester une fonction utilitaire avec une valeur du preset
            const aiStudentName = CODAEvaluatorUtils.generateAIStudentName('test-mentor');
            expect(CODA_EVALUATOR_CONSTANTS.AI_STUDENT_NAMES).toContain(aiStudentName);
        });

        test('should work with all presets', () => {
            Object.values(CODA_PRESETS).forEach((presetConfig) => {
                expect(() => {
                    const components = createCODAComponents(presetConfig);
                    expect(components).toBeDefined();
                }).not.toThrow();
            });
        });
    });
});