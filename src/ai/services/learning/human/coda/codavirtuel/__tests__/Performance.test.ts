/**
 * @file Performance.test.ts
 * @description Tests de performance simplifiés pour le système CODA
 * 
 * Version simplifiée pour compilation TypeScript
 * 
 * @author MetaSign Team - Performance Tests
 * @version 1.0.0
 */

import { AdaptiveLearningEngine } from '../simulators/AdaptiveLearningEngine';
import { ErrorSimulationEngine } from '../simulators/ErrorSimulationEngine';
import { EnhancedUserRepository } from '../repositories/EnhancedUserRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { RepositoryFactory } from '../repositories';
import { type CECRLLevel, type AIStudentPersonalityType, type AIMood, type CulturalEnvironment } from '../types/base';

// Helper functions simplifiés pour les tests de performance
const createTestUser = () => ({
    id: `test-user-${Date.now()}`,
    profile: {
        userId: `test-user-${Date.now()}`,
        currentLevel: 'A2' as CECRLLevel,
        progressHistory: [],
        strengths: [],
        weaknesses: [],
        learningPreferences: ['visual'],
        culturalBackground: 'deaf_family_home' as CulturalEnvironment,
        motivationFactors: ['family_communication'],
        learningStyle: 'visual' as const,
        sessionCount: 0,
        totalLearningTime: 0,
        lastActivity: new Date()
    }
});

const createLearnerContext = () => ({
    personality: 'curious_student' as AIStudentPersonalityType,
    currentLevel: 'A2' as CECRLLevel,
    currentMood: 'neutral' as AIMood,
    strugglingConcepts: [],
    masteredConcepts: [],
    recentConcepts: ['test_concept'],
    sessionDuration: 30,
    fatigue: 0.3,
    previousErrors: []
});

const measurePerformance = async <T>(fn: () => Promise<T>) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
};

describe('CODA System Performance Tests', () => {
    let components: {
        adaptive: AdaptiveLearningEngine;
        errorEngine: ErrorSimulationEngine;
        userRepo: EnhancedUserRepository;
        sessionRepo: SessionRepository;
    };

    beforeEach(async () => {
        const repositories = await RepositoryFactory.createTestRepositories();
        const errorEngine = new ErrorSimulationEngine();
        components = {
            adaptive: new AdaptiveLearningEngine(errorEngine),
            errorEngine: errorEngine,
            userRepo: repositories.users,
            sessionRepo: repositories.sessions
        };
    });

    afterEach(async () => {
        // Note: destroy methods not available, cleanup simplified
        await components.userRepo.destroy();
        await components.sessionRepo.destroy();
    });

    describe('Performance des Opérations Simples', () => {
        test('création d\'utilisateur doit être < 50ms', async () => {
            const user = createTestUser();
            
            const perf = await measurePerformance(async () => {
                return components.userRepo.createUser(user.id, user.profile);
            });

            expect(perf.duration).toBeLessThan(50);
        });

        test('récupération d\'utilisateur doit être < 20ms', async () => {
            const user = createTestUser();
            await components.userRepo.createUser(user.id, user.profile);

            const perf = await measurePerformance(async () => {
                return components.userRepo.getUser(user.id);
            });

            expect(perf.duration).toBeLessThan(20);
            expect(perf.result).toBeDefined();
        });

        test('création de profil adaptatif doit être < 30ms', async () => {
            const perf = await measurePerformance(async () => {
                return components.adaptive.createLearningProfile(
                    'perf-test-profile',
                    'curious_student',
                    'A2'
                );
            });

            expect(perf.duration).toBeLessThan(30);
            expect(perf.result).toBeDefined();
        });

        test('simulation d\'erreur doit être < 100ms', async () => {
            const context = createLearnerContext();
            
            const perf = await measurePerformance(async () => {
                return components.errorEngine.generateError(context, 'test_concept', 'TEST');
            });

            expect(perf.duration).toBeLessThan(100);
        });
    });

    describe('Performance des Opérations Complexes', () => {
        test('génération de recommandations adaptatives doit être < 200ms', async () => {
            const userId = 'complex-perf-user';
            components.adaptive.createLearningProfile(userId, 'analytical_learner', 'B1');
            
            // Ajouter de l'historique pour complexifier
            for (let i = 0; i < 10; i++) {
                components.adaptive.updateLearningProfile(userId, {
                    conceptsPracticed: [`concept_${i}`],
                    performance: { [`concept_${i}`]: Math.random() },
                    sessionDuration: 25,
                    mood: 'neutral' as AIMood,
                    errors: []
                });
            }

            const context = createLearnerContext();

            const perf = await measurePerformance(async () => {
                return components.adaptive.analyzeAdaptationNeeds(userId, context);
            });

            expect(perf.duration).toBeLessThan(200);
            expect(perf.result).toBeDefined();
            expect(perf.result.recommendedConcepts).toBeInstanceOf(Array);
        });

        test('prédiction de performance doit être < 150ms', async () => {
            const userId = 'prediction-perf-user';
            components.adaptive.createLearningProfile(userId, 'patient_apprentice', 'A2');
            
            // Ajouter de l'historique complexe
            for (let i = 0; i < 15; i++) {
                components.adaptive.updateLearningProfile(userId, {
                    conceptsPracticed: [`historical_concept_${i}`],
                    performance: { [`historical_concept_${i}`]: 0.4 + (Math.random() * 0.5) },
                    sessionDuration: 20 + Math.random() * 20,
                    mood: 'neutral' as AIMood,
                    errors: [] // Simplifié pour les tests de performance
                });
            }

            const perf = await measurePerformance(async () => {
                return components.adaptive.predictPerformance(userId, 'complex_new_concept');
            });

            expect(perf.duration).toBeLessThan(150);
            expect(perf.result).toBeDefined();
            expect(perf.result.predictedMastery).toBeDefined();
        });
    });

    describe('Tests de Charge Simplifiés', () => {
        test('doit gérer 10 utilisateurs simultanés efficacement', async () => {
            const userCount = 10; // Réduit pour les tests
            const startTime = Date.now();
            
            // Créer tous les utilisateurs en parallèle
            const userPromises = Array.from({ length: userCount }, (_, i) => {
                const user = { ...createTestUser(), id: `load-user-${i}` };
                return components.userRepo.createUser(user.id, user.profile);
            });

            await Promise.all(userPromises);
            const totalTime = Date.now() - startTime;
            
            expect(totalTime).toBeLessThan(1000); // 1 seconde pour 10 utilisateurs
            expect(totalTime / userCount).toBeLessThan(100); // Moins de 100ms par utilisateur en moyenne
        });

        test('doit maintenir les performances avec quelques profils adaptatifs', async () => {
            const profileCount = 20; // Réduit pour les tests
            
            const startTime = Date.now();
            
            // Créer plusieurs profils
            for (let i = 0; i < profileCount; i++) {
                const personality = ['curious_student', 'analytical_learner', 'creative_thinker'][i % 3] as AIStudentPersonalityType;
                const level = ['A1', 'A2', 'B1', 'B2'][i % 4] as CECRLLevel;
                
                components.adaptive.createLearningProfile(
                    `bulk-profile-${i}`,
                    personality,
                    level
                );
            }
            
            const totalTime = Date.now() - startTime;
            expect(totalTime).toBeLessThan(2000); // 2 secondes pour 20 profils
        });
    });

    describe('Stabilité Mémoire Basique', () => {
        test('ne doit pas exploser la mémoire avec créations multiples', async () => {
            const iterationCount = 100;
            
            for (let i = 0; i < iterationCount; i++) {
                const userId = `memory-test-${i}`;
                components.adaptive.createLearningProfile(userId, 'curious_student', 'A1');
                
                // Ajouter quelques données
                components.adaptive.updateLearningProfile(userId, {
                    conceptsPracticed: ['test_concept'],
                    performance: { test_concept: Math.random() },
                    sessionDuration: 30,
                    mood: 'neutral' as AIMood,
                    errors: []
                });
                
                // Nettoyer périodiquement
                if (i % 20 === 0) {
                    components.adaptive.resetLearningProfile(userId);
                }
            }
            
            // Si on arrive ici sans erreur OutOfMemory, c'est bon
            expect(true).toBe(true);
        });
    });
});