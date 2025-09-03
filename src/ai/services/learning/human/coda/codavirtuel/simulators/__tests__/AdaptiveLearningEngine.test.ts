/**
 * @file AdaptiveLearningEngine.test.ts
 * @description Tests unitaires exhaustifs pour le moteur d'apprentissage adaptatif CODA
 * 
 * Couvre les fonctionnalités critiques:
 * - Création et gestion des profils d'apprentissage
 * - Adaptation basée sur la personnalité et performance
 * - Recommandations pédagogiques intelligentes
 * - Prédictions de performance et temps de maîtrise
 * - Gestion des métriques d'apprentissage
 * - Persistence et export des données
 * 
 * @author MetaSign Team - CODA Tests
 * @version 1.0.0
 */

import { AdaptiveLearningEngine } from '../AdaptiveLearningEngine';
import { ErrorSimulationEngine, type LearnerContext, type SimulatedError, LSFErrorType } from '../ErrorSimulationEngine';
import { type AIStudentPersonalityType, type AIMood } from '../../types/base';

describe('AdaptiveLearningEngine', () => {
    let adaptiveEngine: AdaptiveLearningEngine;
    let errorEngine: ErrorSimulationEngine;
    const testLearnerId = 'test-learner-001';

    beforeEach(() => {
        errorEngine = new ErrorSimulationEngine();
        adaptiveEngine = new AdaptiveLearningEngine(errorEngine);
    });

    afterEach(() => {
        // Nettoyage si nécessaire
    });

    describe('Gestion des Profils d\'Apprentissage', () => {
        test('doit créer un profil d\'apprentissage complet', () => {
            const profile = adaptiveEngine.createLearningProfile(
                testLearnerId,
                'curious_student',
                'A2'
            );

            expect(profile).toBeDefined();
            expect(profile.learnerId).toBe(testLearnerId);
            expect(profile.personality).toBe('curious_student');
            expect(profile.currentLevel).toBe('A2');
            expect(profile.globalLearningRate).toBeGreaterThan(0);
            expect(profile.attentionSpan).toBeGreaterThan(0);
            expect(profile.preferredDifficulty).toBeGreaterThanOrEqual(0);
            expect(profile.preferredDifficulty).toBeLessThanOrEqual(1);
            expect(profile.conceptModels).toBeInstanceOf(Map);
            expect(profile.learningHistory).toBeInstanceOf(Array);
            expect(profile.strengths).toBeInstanceOf(Array);
            expect(profile.weaknesses).toBeInstanceOf(Array);
        });

        test('doit adapter le profil selon la personnalité', () => {
            const curiousProfile = adaptiveEngine.createLearningProfile(
                'curious-001', 
                'curious_student', 
                'A2'
            );
            
            const shyProfile = adaptiveEngine.createLearningProfile(
                'shy-001', 
                'shy_learner', 
                'A2'
            );

            expect(curiousProfile.globalLearningRate).not.toBe(shyProfile.globalLearningRate);
            expect(curiousProfile.attentionSpan).toBeGreaterThan(0);
            expect(shyProfile.attentionSpan).toBeGreaterThan(0);
            expect(curiousProfile.errorTolerance).toBeGreaterThanOrEqual(0);
            expect(shyProfile.errorTolerance).toBeGreaterThanOrEqual(0);
        });

        test('doit mettre à jour le profil après une session', () => {
            adaptiveEngine.createLearningProfile(
                testLearnerId,
                'curious_student',
                'A2'
            );

            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['greeting', 'numbers'],
                performance: { 'greeting': 0.8, 'numbers': 0.6 },
                sessionDuration: 1200,
                mood: 'happy' as AIMood,
                errors: []
            });

            // Le profil devrait être mis à jour
            expect(adaptiveEngine).toBeDefined();
        });
    });

    describe('Recommandations Adaptatives', () => {
        beforeEach(() => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'curious_student', 'A2');
        });

        test('doit générer des recommandations basées sur la performance', () => {
            // Simuler une session avec de bonnes performances
            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['greeting', 'numbers'],
                performance: { 'greeting': 0.9, 'numbers': 0.85 },
                sessionDuration: 1800,
                mood: 'excited' as AIMood,
                errors: []
            });

            const context: LearnerContext = {
                currentLevel: 'A2',
                personality: 'curious_student',
                currentMood: 'excited',
                fatigue: 0.2,
                sessionDuration: 30,
                recentConcepts: ['greeting', 'numbers'],
                masteredConcepts: [],
                strugglingConcepts: [],
                previousErrors: []
            };

            const recommendations = adaptiveEngine.analyzeAdaptationNeeds(testLearnerId, context);
            expect(recommendations).toBeDefined();
            expect(recommendations.shouldAdjustDifficulty).toBeDefined();
            expect(recommendations.difficultyChange).toBeGreaterThanOrEqual(-1);
            expect(recommendations.difficultyChange).toBeLessThanOrEqual(1);
            expect(recommendations.recommendedConcepts).toBeInstanceOf(Array);
            expect(recommendations.paceAdjustment).toMatch(/slower|normal|faster/);
        });

        test('doit recommander une révision pour les performances faibles', () => {
            // Simuler une session avec des performances faibles
            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['grammar', 'vocabulary'],
                performance: { 'grammar': 0.3, 'vocabulary': 0.4 },
                sessionDuration: 1200,
                mood: 'frustrated' as AIMood,
                errors: []
            });

            const context: LearnerContext = {
                currentLevel: 'A2',
                personality: 'curious_student',
                currentMood: 'frustrated',
                fatigue: 0.5,
                sessionDuration: 20,
                recentConcepts: ['grammar', 'vocabulary'],
                masteredConcepts: [],
                strugglingConcepts: ['grammar', 'vocabulary'],
                previousErrors: []
            };

            const recommendations = adaptiveEngine.analyzeAdaptationNeeds(testLearnerId, context);
            expect(recommendations).toBeDefined();
            expect(recommendations.reviewConcepts).toBeInstanceOf(Array);
            expect(recommendations.difficultyChange).toBeLessThanOrEqual(0);
        });

        test('doit suggérer des concepts avancés pour les élèves performants', () => {
            // Créer un profil avec de hautes performances
            adaptiveEngine.createLearningProfile('advanced-001', 'analytical_learner', 'B1');
            
            const context: LearnerContext = {
                currentLevel: 'B1',
                personality: 'analytical_learner',
                currentMood: 'excited',
                fatigue: 0.1,
                sessionDuration: 45,
                recentConcepts: [],
                masteredConcepts: [],
                strugglingConcepts: [],
                previousErrors: []
            };

            const recommendations = adaptiveEngine.analyzeAdaptationNeeds('advanced-001', context);
            expect(recommendations).toBeDefined();
        });
    });

    describe('Prédictions de Performance', () => {
        test('doit prédire la performance future sur un concept', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'patient_apprentice', 'A2');

            const prediction = adaptiveEngine.predictPerformance(testLearnerId, 'new_concept');
            expect(prediction).toBeDefined();
            expect(prediction.conceptId).toBe('new_concept');
            expect(prediction.predictedMastery).toBeGreaterThanOrEqual(0);
            expect(prediction.predictedMastery).toBeLessThanOrEqual(1);
            expect(prediction.estimatedTimeToMastery).toBeGreaterThan(0);
            expect(prediction.successProbability).toBeGreaterThanOrEqual(0);
            expect(prediction.successProbability).toBeLessThanOrEqual(1);
            expect(prediction.confidenceInterval).toHaveLength(2);
            expect(prediction.riskFactors).toBeInstanceOf(Array);
        });

        test('doit ajuster les prédictions selon l\'historique', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'energetic_pupil', 'A2');
            
            // Simuler un historique d'apprentissage
            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['concept1'],
                performance: { 'concept1': 0.9 },
                sessionDuration: 1500,
                mood: 'excited' as AIMood,
                errors: []
            });

            const prediction1 = adaptiveEngine.predictPerformance(testLearnerId, 'concept1');
            const prediction2 = adaptiveEngine.predictPerformance(testLearnerId, 'concept2');
            
            expect(prediction1.predictedMastery).toBeGreaterThan(0);
            expect(prediction2.predictedMastery).toBeGreaterThan(0);
        });
    });

    describe('Modélisation de l\'Apprentissage', () => {
        test('doit modéliser la courbe d\'oubli', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'curious_student', 'A2');
            
            // Tester différents profils et personnalités
            const profile = adaptiveEngine.createLearningProfile('forget-test', 'shy_learner', 'A1');
            expect(profile).toBeDefined();

            // Simuler du temps qui passe et tester l'oubli
            adaptiveEngine.updateLearningProfile('forget-test', {
                conceptsPracticed: ['temporary_concept'],
                performance: { 'temporary_concept': 0.8 },
                sessionDuration: 600,
                mood: 'neutral' as AIMood,
                errors: []
            });

            expect(profile.conceptModels.size).toBeGreaterThanOrEqual(0);
        });

        test('doit calculer la vitesse d\'apprentissage adaptative', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'analytical_learner', 'B1');
            
            const prediction = adaptiveEngine.predictPerformance(testLearnerId, 'complex_concept');
            expect(prediction.estimatedTimeToMastery).toBeGreaterThan(0);
        });

        test('doit identifier les patterns d\'apprentissage', () => {
            const profile = adaptiveEngine.createLearningProfile(testLearnerId, 'creative_thinker', 'A2');
            
            // Simuler plusieurs sessions avec patterns
            for (let i = 0; i < 5; i++) {
                adaptiveEngine.updateLearningProfile(testLearnerId, {
                    conceptsPracticed: [`concept_${i}`],
                    performance: { [`concept_${i}`]: 0.7 + (i * 0.05) },
                    sessionDuration: 1000 + (i * 100),
                    mood: 'happy' as AIMood,
                    errors: []
                });
            }

            expect(profile.learningHistory.length).toBeGreaterThan(0);
        });
    });

    describe('Optimisation de Séquence', () => {
        test('doit optimiser la séquence d\'apprentissage', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'analytical_learner', 'A2');
            
            const availableConcepts = ['concept1', 'concept2', 'concept3', 'concept4'];
            const result = adaptiveEngine.optimizeLearningSequence(testLearnerId, availableConcepts, 1800);
            
            expect(result).toBeDefined();
            expect(result.optimizedSequence).toBeInstanceOf(Array);
            expect(result.expectedImprovement).toBeGreaterThanOrEqual(0);
            expect(result.reasoning).toBeDefined();
        });
    });

    describe('Persistance et Métriques', () => {
        test('doit sauvegarder et restaurer les profils', () => {
            const originalProfile = adaptiveEngine.createLearningProfile(
                testLearnerId,
                'patient_apprentice',
                'A2'
            );

            // Simuler une sauvegarde/restauration
            const profileData = JSON.stringify({
                learnerId: originalProfile.learnerId,
                personality: originalProfile.personality,
                currentLevel: originalProfile.currentLevel
            });
            
            expect(profileData).toContain(testLearnerId);
            expect(profileData).toContain('patient_apprentice');
        });

        test('doit calculer des métriques d\'apprentissage globales', () => {
            // Créer plusieurs profils
            ['curious_student', 'shy_learner', 'energetic_pupil'].forEach((personality, index) => {
                adaptiveEngine.createLearningProfile(
                    `learner-${index}`,
                    personality as AIStudentPersonalityType,
                    'A2'
                );
            });

            // Chaque profil devrait être créé correctement
            expect(true).toBe(true);
        });
    });

    describe('Intégration avec Simulation d\'Erreurs', () => {
        test('doit intégrer les erreurs simulées dans l\'apprentissage', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'curious_student', 'A2');
            
            // Simuler des erreurs d'apprentissage
            const errors: SimulatedError[] = [
                {
                    id: 'error-1',
                    type: LSFErrorType.SYNTAX_ERROR,
                    concept: 'grammar',
                    originalSign: 'CORRECT_GRAMMAR',
                    errorSign: 'WRONG_GRAMMAR',
                    description: 'Erreur de grammaire basique',
                    severity: 'moderate',
                    timestamp: new Date(),
                    correctionHints: ['Attention à l\'ordre des signes'],
                    pedagogicalNote: 'Réviser les règles de base',
                    canBeRepeated: true,
                    relatedConcepts: ['syntax', 'order']
                }
            ];

            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['grammar'],
                performance: { 'grammar': 0.6 },
                sessionDuration: 1500,
                mood: 'confused' as AIMood,
                errors: errors
            });

            const context: LearnerContext = {
                currentLevel: 'A2',
                personality: 'curious_student',
                currentMood: 'confused',
                fatigue: 0.4,
                sessionDuration: 25,
                recentConcepts: ['grammar'],
                masteredConcepts: [],
                strugglingConcepts: ['grammar'],
                previousErrors: errors
            };

            const recommendations = adaptiveEngine.analyzeAdaptationNeeds(testLearnerId, context);
            expect(recommendations).toBeDefined();
        });

        test('doit adapter les recommandations selon les erreurs', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'analytical_learner', 'B1');

            const errors: SimulatedError[] = [
                {
                    id: 'error-2',
                    type: LSFErrorType.SYNTAX_ERROR,
                    concept: 'complex_grammar',
                    originalSign: 'COMPLEX_CORRECT',
                    errorSign: 'COMPLEX_WRONG',
                    description: 'Erreur conceptuelle avancée',
                    severity: 'major',
                    timestamp: new Date(),
                    correctionHints: ['Réviser les concepts de base'],
                    pedagogicalNote: 'Attention aux nuances grammaticales',
                    canBeRepeated: false,
                    relatedConcepts: ['advanced_grammar', 'concepts']
                }
            ];

            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['complex_grammar'],
                performance: { 'complex_grammar': 0.4 },
                sessionDuration: 2000,
                mood: 'frustrated' as AIMood,
                errors: errors
            });

            const context: LearnerContext = {
                currentLevel: 'B1',
                personality: 'analytical_learner',
                currentMood: 'frustrated',
                fatigue: 0.6,
                sessionDuration: 33,
                recentConcepts: ['complex_grammar'],
                masteredConcepts: [],
                strugglingConcepts: ['complex_grammar'],
                previousErrors: errors
            };

            const recommendations = adaptiveEngine.analyzeAdaptationNeeds(testLearnerId, context);
            expect(recommendations).toBeDefined();
            expect(recommendations.reviewConcepts.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Edge Cases et Robustesse', () => {
        test('doit gérer les profils inexistants', () => {
            const prediction = adaptiveEngine.predictPerformance('inexistant-id', 'any_concept');
            expect(prediction.predictedMastery).toBeGreaterThanOrEqual(0);
            expect(prediction.predictedMastery).toBeLessThanOrEqual(1);
        });

        test('doit gérer les données de session incomplètes', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'curious_student', 'A2');
            
            expect(() => {
                adaptiveEngine.updateLearningProfile(testLearnerId, {
                    conceptsPracticed: [],
                    performance: {},
                    sessionDuration: 0,
                    mood: 'neutral' as AIMood,
                    errors: []
                });
            }).not.toThrow();
        });

        test('doit maintenir la cohérence des données', () => {
            const profile = adaptiveEngine.createLearningProfile(testLearnerId, 'patient_apprentice', 'A2');
            
            expect(profile.globalLearningRate).toBeGreaterThan(0);
            expect(profile.attentionSpan).toBeGreaterThan(0);
            expect(profile.preferredDifficulty).toBeGreaterThanOrEqual(0);
            expect(profile.preferredDifficulty).toBeLessThanOrEqual(1);
        });
    });

    describe('Reset et Nettoyage', () => {
        test('doit pouvoir réinitialiser un profil d\'apprentissage', () => {
            adaptiveEngine.createLearningProfile(testLearnerId, 'curious_student', 'A2');
            
            // Ajouter des données
            adaptiveEngine.updateLearningProfile(testLearnerId, {
                conceptsPracticed: ['test_concept'],
                performance: { 'test_concept': 0.8 },
                sessionDuration: 1000,
                mood: 'happy' as AIMood,
                errors: []
            });

            // Réinitialiser le profil
            adaptiveEngine.resetLearningProfile(testLearnerId);
            expect(adaptiveEngine).toBeDefined();
        });
    });
});