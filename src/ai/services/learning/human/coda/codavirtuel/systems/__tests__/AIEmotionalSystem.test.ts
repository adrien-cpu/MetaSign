/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/AIEmotionalSystem.test.ts
 * @description Tests unitaires pour le système émotionnel révolutionnaire
 * 
 * Tests couverts :
 * - 🎭 Génération d'états émotionnels
 * - 🔄 Transitions émotionnelles
 * - 🔍 Détection de patterns
 * - 📊 Gestion d'historique
 * - ⚙️ Configuration et validation
 * - 🧠 Adaptation personnalisée
 * 
 * @module AIEmotionalSystemTests
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AIEmotionalSystem } from '../AIEmotionalSystem';
import type {
    EmotionGenerationParams,
    AIEmotionalSystemConfig,
    EmotionalState
} from '../types/EmotionalTypes';
import type { AIPersonalityProfile } from '../AIPersonalitySystem';
import {
    createEmotionalSystem,
    createAdaptiveLearningConfig,
    createSensitiveStudentConfig,
    createIntensiveLearningConfig,
    validateEmotionalConfig
} from '../index';

// Mock du logger
jest.mock('@/ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn(() => ({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn()
        }))
    }
}));

describe('AIEmotionalSystem', () => {
    let emotionalSystem: AIEmotionalSystem;
    let mockPersonality: AIPersonalityProfile;
    let mockGenerationParams: EmotionGenerationParams;

    beforeEach(() => {
        // Configuration de test
        const config: Partial<AIEmotionalSystemConfig> = {
            baseVolatility: 0.5,
            defaultTransitionSpeed: 1000,
            emotionalPersistence: 0.7,
            triggerSensitivity: 0.6,
            enablePatternDetection: true,
            historyDepth: 50
        };

        emotionalSystem = new AIEmotionalSystem(config);

        // Mock du profil de personnalité
        mockPersonality = {
            personalityId: 'test-personality',
            bigFiveTraits: {
                openness: 0.7,
                conscientiousness: 0.6,
                extraversion: 0.5,
                agreeableness: 0.8,
                neuroticism: 0.4
            },
            learningStyle: 'visual',
            motivationFactors: ['achievement', 'social_interaction'],
            stressThreshold: 0.6,
            adaptabilityScore: 0.7,
            culturalBackground: 'deaf_community',
            preferredFeedbackStyle: 'positive_reinforcement',
            timestamp: new Date()
        };

        // Mock des paramètres de génération
        mockGenerationParams = {
            learningContext: 'basic_signs_practice',
            stimulus: 'successful_sign_execution',
            stimulusIntensity: 0.8,
            learningOutcome: 'success',
            contextualFactors: ['first_success', 'after_struggle']
        };
    });

    describe('Initialization', () => {
        it('should initialize with default configuration', () => {
            const system = new AIEmotionalSystem();
            expect(system).toBeInstanceOf(AIEmotionalSystem);
        });

        it('should initialize with custom configuration', () => {
            const customConfig: Partial<AIEmotionalSystemConfig> = {
                baseVolatility: 0.8,
                enablePatternDetection: false
            };

            const system = new AIEmotionalSystem(customConfig);
            expect(system).toBeInstanceOf(AIEmotionalSystem);
        });

        it('should provide system statistics', () => {
            const stats = emotionalSystem.getSystemStatistics();

            expect(stats).toHaveProperty('totalActiveStudents');
            expect(stats).toHaveProperty('studentsWithPersonalityProfiles');
            expect(stats).toHaveProperty('currentEmotionDistribution');
            expect(stats).toHaveProperty('systemConfig');
        });
    });

    describe('Emotional State Generation', () => {
        it('should generate emotional state for success outcome', async () => {
            const studentId = 'test-student-1';

            const state = await emotionalSystem.generateEmotionalState(
                studentId,
                mockGenerationParams
            );

            expect(state).toHaveProperty('primaryEmotion');
            expect(state).toHaveProperty('intensity');
            expect(state).toHaveProperty('valence');
            expect(state).toHaveProperty('arousal');
            expect(state).toHaveProperty('trigger');
            expect(state).toHaveProperty('timestamp');
            expect(state).toHaveProperty('expectedDuration');

            // Vérifier que l'intensité est dans la plage valide
            expect(state.intensity).toBeGreaterThanOrEqual(0);
            expect(state.intensity).toBeLessThanOrEqual(1);

            // Pour un succès, l'émotion devrait être positive
            expect(['joy', 'trust', 'surprise']).toContain(state.primaryEmotion);
        });

        it('should generate different emotional state for failure outcome', async () => {
            const studentId = 'test-student-2';
            const failureParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                learningOutcome: 'failure',
                stimulus: 'failed_sign_execution'
            };

            const state = await emotionalSystem.generateEmotionalState(
                studentId,
                failureParams
            );

            // Pour un échec, l'émotion devrait être négative
            expect(['sadness', 'anger', 'fear']).toContain(state.primaryEmotion);
            expect(state.valence).toBeLessThan(0.5);
        });

        it('should adapt to personality profile', async () => {
            const studentId = 'test-student-with-personality';

            // Enregistrer le profil de personnalité
            emotionalSystem.registerPersonalityProfile(studentId, mockPersonality);

            const state = await emotionalSystem.generateEmotionalState(
                studentId,
                mockGenerationParams
            );

            expect(state).toBeDefined();
            expect(state.primaryEmotion).toBeDefined();
        });

        it('should handle partial success outcome', async () => {
            const studentId = 'test-student-partial';
            const partialParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                learningOutcome: 'partial'
            };

            const state = await emotionalSystem.generateEmotionalState(
                studentId,
                partialParams
            );

            // Pour un succès partiel, les émotions devraient être modérées
            expect(['anticipation', 'trust', 'joy']).toContain(state.primaryEmotion);
        });
    });

    describe('State Management', () => {
        it('should track current emotional state', async () => {
            const studentId = 'test-student-tracking';

            await emotionalSystem.generateEmotionalState(
                studentId,
                mockGenerationParams
            );

            const currentState = emotionalSystem.getCurrentEmotionalState(studentId);
            expect(currentState).toBeDefined();
            expect(currentState!.primaryEmotion).toBeDefined();
        });

        it('should handle multiple students simultaneously', async () => {
            const studentId1 = 'student-1';
            const studentId2 = 'student-2';

            await emotionalSystem.generateEmotionalState(studentId1, mockGenerationParams);

            const failureParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                learningOutcome: 'failure'
            };
            await emotionalSystem.generateEmotionalState(studentId2, failureParams);

            const state1 = emotionalSystem.getCurrentEmotionalState(studentId1);
            const state2 = emotionalSystem.getCurrentEmotionalState(studentId2);

            expect(state1).toBeDefined();
            expect(state2).toBeDefined();
            expect(state1!.primaryEmotion).not.toBe(state2!.primaryEmotion);
        });

        it('should return undefined for non-existent student', () => {
            const state = emotionalSystem.getCurrentEmotionalState('non-existent');
            expect(state).toBeUndefined();
        });
    });

    describe('Complete Analysis', () => {
        it('should perform complete emotional analysis', async () => {
            const studentId = 'test-student-analysis';

            // Générer plusieurs états pour avoir un historique
            await emotionalSystem.generateEmotionalState(studentId, mockGenerationParams);

            await emotionalSystem.generateEmotionalState(studentId, {
                ...mockGenerationParams,
                stimulus: 'second_success'
            });

            await emotionalSystem.generateEmotionalState(studentId, {
                ...mockGenerationParams,
                learningOutcome: 'partial',
                stimulus: 'partial_success'
            });

            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);

            expect(analysis).toHaveProperty('currentState');
            expect(analysis).toHaveProperty('patterns');
            expect(analysis).toHaveProperty('recentHistory');
            expect(analysis).toHaveProperty('confidence');
            expect(analysis).toHaveProperty('recommendations');

            expect(analysis.currentState).toBeDefined();
            expect(Array.isArray(analysis.patterns)).toBe(true);
            expect(Array.isArray(analysis.recentHistory)).toBe(true);
            expect(Array.isArray(analysis.recommendations)).toBe(true);
            expect(typeof analysis.confidence).toBe('number');
        });

        it('should throw error for non-existent student analysis', async () => {
            await expect(
                emotionalSystem.performCompleteAnalysis('non-existent')
            ).rejects.toThrow();
        });

        it('should provide meaningful recommendations', async () => {
            const studentId = 'test-student-recommendations';

            // Générer un état négatif
            const negativeParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                learningOutcome: 'failure',
                stimulusIntensity: 0.9
            };

            await emotionalSystem.generateEmotionalState(studentId, negativeParams);

            const analysis = await emotionalSystem.performCompleteAnalysis(studentId);

            expect(analysis.recommendations.length).toBeGreaterThan(0);
            expect(analysis.recommendations[0]).toContain('émotionnel');
        });
    });

    describe('History Management', () => {
        it('should retrieve emotional history', async () => {
            const studentId = 'test-student-history';

            // Générer plusieurs états
            for (let i = 0; i < 5; i++) {
                await emotionalSystem.generateEmotionalState(studentId, {
                    ...mockGenerationParams,
                    stimulus: `stimulus_${i}`
                });
            }

            const history = await emotionalSystem.getEmotionalHistory(studentId);

            expect(history).toBeDefined();
            expect(history!.stateHistory.length).toBeGreaterThan(0);
            expect(Array.isArray(history!.detectedPatterns)).toBe(true);
            expect(history!.lastAnalysis).toBeInstanceOf(Date);
        });

        it('should return undefined for empty history', async () => {
            const history = await emotionalSystem.getEmotionalHistory('empty-student');
            expect(history).toBeUndefined();
        });
    });

    describe('Personality Integration', () => {
        it('should register personality profile', () => {
            const studentId = 'test-personality-registration';

            expect(() => {
                emotionalSystem.registerPersonalityProfile(studentId, mockPersonality);
            }).not.toThrow();
        });

        it('should influence emotion generation with high neuroticism', async () => {
            const studentId = 'neurotic-student';
            const neuroticPersonality: AIPersonalityProfile = {
                ...mockPersonality,
                bigFiveTraits: {
                    ...mockPersonality.bigFiveTraits,
                    neuroticism: 0.9 // Très névrotique
                }
            };

            emotionalSystem.registerPersonalityProfile(studentId, neuroticPersonality);

            const failureParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                learningOutcome: 'failure'
            };

            const state = await emotionalSystem.generateEmotionalState(studentId, failureParams);

            // Avec un score de neuroticisme élevé, les réactions négatives devraient être plus intenses
            expect(['anger', 'fear']).toContain(state.primaryEmotion);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid student ID gracefully', async () => {
            // Test avec un ID invalide (undefined converti en string)
            const invalidId = String(undefined);

            await expect(
                emotionalSystem.generateEmotionalState(invalidId, mockGenerationParams)
            ).resolves.toBeDefined();
        });

        it('should handle extreme stimulus intensity', async () => {
            const studentId = 'extreme-stimulus-student';
            const extremeParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                stimulusIntensity: 1.5 // Au-delà de la plage normale
            };

            const state = await emotionalSystem.generateEmotionalState(studentId, extremeParams);

            // L'intensité devrait être normalisée
            expect(state.intensity).toBeLessThanOrEqual(1);
            expect(state.intensity).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Configuration Validation', () => {
        it('should work with minimal configuration', () => {
            const minimalSystem = new AIEmotionalSystem({
                baseVolatility: 0.1
            });

            expect(minimalSystem).toBeInstanceOf(AIEmotionalSystem);
        });

        it('should work with maximum configuration', () => {
            const maximalSystem = new AIEmotionalSystem({
                baseVolatility: 1.0,
                defaultTransitionSpeed: 10000,
                emotionalPersistence: 1.0,
                triggerSensitivity: 1.0,
                enablePatternDetection: true,
                historyDepth: 1000
            });

            expect(maximalSystem).toBeInstanceOf(AIEmotionalSystem);
        });
    });

    describe('Performance', () => {
        it('should generate emotional states quickly', async () => {
            const studentId = 'performance-test-student';
            const startTime = Date.now();

            await emotionalSystem.generateEmotionalState(studentId, mockGenerationParams);

            const endTime = Date.now();
            const duration = endTime - startTime;

            // La génération devrait prendre moins de 100ms
            expect(duration).toBeLessThan(100);
        });

        it('should handle multiple rapid generation requests', async () => {
            const studentId = 'rapid-generation-student';
            const promises: Promise<EmotionalState>[] = [];

            // Générer 10 états rapidement
            for (let i = 0; i < 10; i++) {
                promises.push(
                    emotionalSystem.generateEmotionalState(studentId, {
                        ...mockGenerationParams,
                        stimulus: `rapid_stimulus_${i}`
                    })
                );
            }

            const states = await Promise.all(promises);
            expect(states).toHaveLength(10);
            states.forEach(state => {
                expect(state).toBeDefined();
                expect(state.primaryEmotion).toBeDefined();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should maintain consistency across operations', async () => {
            const studentId = 'consistency-test-student';

            // Enregistrer personnalité
            emotionalSystem.registerPersonalityProfile(studentId, mockPersonality);

            // Générer état initial
            const initialState = await emotionalSystem.generateEmotionalState(
                studentId,
                mockGenerationParams
            );

            // Vérifier état actuel
            const currentState = emotionalSystem.getCurrentEmotionalState(studentId);
            expect(currentState).toEqual(initialState);

            // Générer un nouvel état (transition)
            const newParams: EmotionGenerationParams = {
                ...mockGenerationParams,
                stimulus: 'new_learning_challenge',
                learningOutcome: 'partial'
            };

            const newState = await emotionalSystem.generateEmotionalState(studentId, newParams);

            // L'état actuel devrait avoir changé
            const updatedCurrentState = emotionalSystem.getCurrentEmotionalState(studentId);
            expect(updatedCurrentState).toEqual(newState);
            expect(updatedCurrentState).not.toEqual(initialState);

            // L'historique devrait contenir les deux états
            const history = await emotionalSystem.getEmotionalHistory(studentId);
            expect(history).toBeDefined();
            expect(history!.stateHistory.length).toBeGreaterThanOrEqual(2);
        });
    });
});

describe('🎨 Configurations prédéfinies et fonctions utilitaires', () => {
    it('devrait créer un système émotionnel par défaut', () => {
        // Act
        const system = createEmotionalSystem();

        // Assert
        expect(system).toBeInstanceOf(AIEmotionalSystem);
    });

    it('devrait créer une configuration d\'apprentissage adaptatif', () => {
        // Act
        const config = createAdaptiveLearningConfig();

        // Assert
        expect(config.baseVolatility).toBe(0.6);
        expect(config.enablePatternDetection).toBe(true);
        expect(config.triggerSensitivity).toBe(0.5);
        expect(config.learningBias).toBe('positive');
    });

    it('devrait créer une configuration pour étudiant sensible', () => {
        // Act
        const config = createSensitiveStudentConfig();

        // Assert
        expect(config.baseVolatility).toBe(0.4);
        expect(config.triggerSensitivity).toBe(0.6);
        expect(config.emotionalResilience).toBe(0.3);
    });

    it('devrait créer une configuration d\'apprentissage intensif', () => {
        // Act
        const config = createIntensiveLearningConfig();

        // Assert
        expect(config.baseVolatility).toBe(0.8);
        expect(config.triggerSensitivity).toBe(0.9);
        expect(config.focusIntensity).toBe(0.9);
    });

    it('devrait valider une configuration valide', () => {
        // Arrange
        const validConfig = {
            baseVolatility: 0.5,
            enablePatternDetection: true,
            triggerSensitivity: 0.6,
            transitionSpeed: 1500,
            historyDepth: 100
        };

        // Act & Assert
        expect(() => validateEmotionalConfig(validConfig)).not.toThrow();
        const result = validateEmotionalConfig(validConfig);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('devrait détecter les erreurs dans une configuration invalide', () => {
        // Arrange
        const invalidConfig = {
            baseVolatility: 1.5, // Invalide: > 1
            enablePatternDetection: true,
            triggerSensitivity: -0.1, // Invalide: < 0
            transitionSpeed: -500, // Invalide: négatif
            historyDepth: 0 // Invalide: doit être >= 1
        };

        // Act & Assert
        expect(() => validateEmotionalConfig(invalidConfig)).toThrow();
    });

    it('devrait accepter des configurations partielles valides', () => {
        // Arrange
        const partialConfig = {
            baseVolatility: 0.6,
            triggerSensitivity: 0.7
            // transitionSpeed et historyDepth sont optionnels
        };

        // Act
        const result = validateEmotionalConfig(partialConfig);

        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});

describe('Utility Functions', () => {
    describe('createEmotionalSystem', () => {
        it('should create system with factory function', async () => {
            const system = createEmotionalSystem();
            expect(system).toBeInstanceOf(AIEmotionalSystem);
        });
    });

    describe('Configuration Presets', () => {
        it('should create adaptive learning configuration', async () => {
            const config = createAdaptiveLearningConfig();
            expect(config.baseVolatility).toBe(0.6);
            expect(config.enablePatternDetection).toBe(true);
            expect(config.historyDepth).toBe(150);
        });

        it('should create sensitive student configuration', async () => {
            const config = createSensitiveStudentConfig();
            expect(config.baseVolatility).toBe(0.4);
            expect(config.defaultTransitionSpeed).toBe(3000);
            expect(config.emotionalPersistence).toBe(0.9);
        });

        it('should create intensive learning configuration', async () => {
            const config = createIntensiveLearningConfig();
            expect(config.baseVolatility).toBe(0.8);
            expect(config.defaultTransitionSpeed).toBe(1000);
            expect(config.triggerSensitivity).toBe(0.9);
        });
    });

    describe('Configuration Validation', () => {
        it('should validate correct configuration', async () => {
            const validConfig = {
                baseVolatility: 0.5,
                defaultTransitionSpeed: 2000,
                emotionalPersistence: 0.7
            };

            expect(() => validateEmotionalConfig(validConfig)).not.toThrow();
        });

        it('should reject invalid baseVolatility', async () => {
            const invalidConfig = { baseVolatility: 1.5 };
            expect(() => validateEmotionalConfig(invalidConfig)).toThrow('baseVolatility doit être entre 0 et 1');
        });

        it('should reject invalid defaultTransitionSpeed', async () => {
            const invalidConfig = { defaultTransitionSpeed: 50 };
            expect(() => validateEmotionalConfig(invalidConfig)).toThrow('defaultTransitionSpeed doit être entre 100ms et 10000ms');
        });
    });
});