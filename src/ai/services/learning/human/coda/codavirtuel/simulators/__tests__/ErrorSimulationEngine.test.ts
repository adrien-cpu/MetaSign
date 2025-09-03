/**
 * @file ErrorSimulationEngine.test.ts
 * @description Tests unitaires complets pour le moteur de simulation d'erreurs LSF
 * 
 * Tests de qualité couvrant:
 * - Configuration des erreurs par niveau CECRL
 * - Influence de la personnalité et de l'humeur
 * - Génération d'erreurs réalistes et contextuelles
 * - Gestion des corrections pédagogiques
 * - Validation des types d'erreurs LSF
 * 
 * @author MetaSign Team - CODA Tests
 * @version 1.0.0
 */

import { ErrorSimulationEngine, LSFErrorType, type SimulatedError } from '../ErrorSimulationEngine';
import { type LearnerContext, type CECRLLevel, type AIStudentPersonalityType, type AIMood } from '../../types/base';

// Configuration de test avec données réalistes
const mockLearnerContext: LearnerContext = {
    personality: 'curious_student',
    currentLevel: 'A2',
    currentMood: 'excited',
    strugglingConcepts: ['placement_spatial', 'expressions_faciales'],
    masteredConcepts: ['salutations_base', 'chiffres_simples'],
    recentConcepts: ['famille', 'couleurs'],
    sessionDuration: 30,
    fatigueLevel: 0.3,
    concentrationLevel: 0.7
};

describe('ErrorSimulationEngine', () => {
    let errorEngine: ErrorSimulationEngine;

    beforeEach(() => {
        errorEngine = new ErrorSimulationEngine();
    });

    afterEach(() => {
        errorEngine.destroy();
    });

    describe('Configuration et Initialisation', () => {
        test('doit s\'initialiser avec des configurations d\'erreur par défaut', () => {
            expect(errorEngine).toBeInstanceOf(ErrorSimulationEngine);
            
            // Vérifier que toutes les configurations CECRL sont présentes
            const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            levels.forEach(level => {
                const errors = (errorEngine as any).getErrorsForLevel(level);
                expect(errors).toBeDefined();
                expect(Array.isArray(errors)).toBe(true);
            });
        });

        test('doit supporter tous les types d\'erreur LSF', () => {
            const expectedErrorTypes = [
                LSFErrorType.HAND_SHAPE_ERROR,
                LSFErrorType.MOVEMENT_ERROR,
                LSFErrorType.PLACEMENT_ERROR,
                LSFErrorType.ORIENTATION_ERROR,
                LSFErrorType.FACIAL_EXPRESSION_ERROR,
                LSFErrorType.HEAD_MOVEMENT_ERROR,
                LSFErrorType.EYE_GAZE_ERROR,
                LSFErrorType.SYNTAX_ERROR,
                LSFErrorType.TEMPORAL_ERROR,
                LSFErrorType.MODAL_ERROR,
                LSFErrorType.SIGN_CONFUSION,
                LSFErrorType.NEOLOGISM,
                LSFErrorType.REGIONAL_VARIANT,
                LSFErrorType.REFERENCE_ERROR,
                LSFErrorType.COHESION_ERROR,
                LSFErrorType.PRAGMATIC_ERROR
            ];

            expectedErrorTypes.forEach(errorType => {
                expect(Object.values(LSFErrorType)).toContain(errorType);
            });
        });
    });

    describe('Génération d\'Erreurs Contextuelles', () => {
        test('doit générer des erreurs appropriées pour le niveau A1', async () => {
            const contextA1: LearnerContext = { ...mockLearnerContext, currentLevel: 'A1' };
            
            const error = await errorEngine.simulateError(contextA1, 'bonjour', 'BONJOUR');
            
            expect(error).toBeDefined();
            expect(error!.concept).toBe('bonjour');
            expect(error!.id).toMatch(/^error_\d+_[a-z0-9]+$/);
            expect(['minor', 'moderate', 'major']).toContain(error!.severity);
            expect(error!.correctionHints).toBeInstanceOf(Array);
            expect(error!.correctionHints.length).toBeGreaterThan(0);
        });

        test('doit générer des erreurs plus complexes pour les niveaux avancés', async () => {
            const contextC1: LearnerContext = { ...mockLearnerContext, currentLevel: 'C1' };
            
            const error = await errorEngine.simulateError(contextC1, 'discours_politique', 'DISCOURS');
            
            if (error) {
                // Les erreurs de niveau C1 devraient être plus subtiles (pragmatiques, discursives)
                expect([
                    LSFErrorType.PRAGMATIC_ERROR,
                    LSFErrorType.COHESION_ERROR,
                    LSFErrorType.REFERENCE_ERROR,
                    LSFErrorType.MODAL_ERROR
                ]).toContain(error.type);
            }
        });

        test('doit prendre en compte la personnalité dans la génération d\'erreurs', async () => {
            const testPersonalities: AIStudentPersonalityType[] = [
                'curious_student',
                'shy_learner',
                'energetic_pupil',
                'patient_apprentice',
                'analytical_learner',
                'creative_thinker'
            ];

            for (const personality of testPersonalities) {
                const context: LearnerContext = { ...mockLearnerContext, personality };
                const error = await errorEngine.simulateError(context, 'test_concept', 'TEST');
                
                // Chaque personnalité devrait potentiellement générer des erreurs
                // (peut être null selon la probabilité)
                if (error) {
                    expect(error.concept).toBe('test_concept');
                    expect(error.pedagogicalNote).toBeDefined();
                }
            }
        });

        test('doit adapter les erreurs selon l\'humeur de l\'apprenant', async () => {
            const testMoods: AIMood[] = ['happy', 'confused', 'frustrated', 'excited', 'neutral', 'curious'];
            const errorFrequencies: Record<string, number> = {};

            for (const mood of testMoods) {
                const context: LearnerContext = { ...mockLearnerContext, currentMood: mood };
                let errorCount = 0;
                
                // Test sur plusieurs tentatives pour évaluer la fréquence
                for (let i = 0; i < 10; i++) {
                    const error = await errorEngine.simulateError(context, 'test_mood', 'TEST');
                    if (error) errorCount++;
                }
                
                errorFrequencies[mood] = errorCount / 10;
            }

            // L'humeur confuse/frustrée devrait générer plus d'erreurs que l'humeur heureuse
            expect(errorFrequencies.confused).toBeGreaterThanOrEqual(errorFrequencies.happy);
        });
    });

    describe('Correction et Pédagogie', () => {
        test('doit fournir des conseils de correction spécifiques au type d\'erreur', async () => {
            const error = await errorEngine.simulateError(mockLearnerContext, 'famille', 'FAMILLE');
            
            if (error) {
                expect(error.correctionHints).toBeInstanceOf(Array);
                expect(error.correctionHints.length).toBeGreaterThan(0);
                
                // Les conseils doivent être des chaînes non vides
                error.correctionHints.forEach(hint => {
                    expect(typeof hint).toBe('string');
                    expect(hint.length).toBeGreaterThan(0);
                });
                
                expect(error.pedagogicalNote).toBeDefined();
                expect(typeof error.pedagogicalNote).toBe('string');
                expect(error.pedagogicalNote.length).toBeGreaterThan(0);
            }
        });

        test('doit générer des descriptions d\'erreur contextualisées', async () => {
            const error = await errorEngine.simulateError(mockLearnerContext, 'maison', 'MAISON');
            
            if (error) {
                expect(error.description).toBeDefined();
                expect(error.description).toContain('maison');
                expect(typeof error.description).toBe('string');
                expect(error.description.length).toBeGreaterThan(10);
            }
        });

        test('doit identifier les concepts liés pour l\'apprentissage', async () => {
            const error = await errorEngine.simulateError(mockLearnerContext, 'rouge', 'ROUGE');
            
            if (error) {
                expect(error.relatedConcepts).toBeInstanceOf(Array);
                expect(error.relatedConcepts).toContain('rouge');
                
                // Devrait inclure d'autres concepts de la même famille
                const relatedColors = error.relatedConcepts.filter(concept => 
                    ['bleu', 'vert', 'jaune', 'rouge'].includes(concept)
                );
                expect(relatedColors.length).toBeGreaterThan(1);
            }
        });
    });

    describe('Gestion des Concepts Difficiles', () => {
        test('doit augmenter la probabilité d\'erreur pour les concepts en difficulté', async () => {
            const contextWithStruggles: LearnerContext = {
                ...mockLearnerContext,
                strugglingConcepts: ['test_difficult']
            };

            let errorCount = 0;
            const iterations = 20;

            for (let i = 0; i < iterations; i++) {
                const error = await errorEngine.simulateError(contextWithStruggles, 'test_difficult', 'TEST');
                if (error) errorCount++;
            }

            // Les concepts difficiles devraient générer plus d'erreurs
            const errorRate = errorCount / iterations;
            expect(errorRate).toBeGreaterThan(0.3); // Au moins 30% d'erreurs
        });

        test('doit réduire les erreurs pour les concepts maîtrisés', async () => {
            const contextMastered: LearnerContext = {
                ...mockLearnerContext,
                masteredConcepts: ['test_mastered']
            };

            let errorCount = 0;
            const iterations = 20;

            for (let i = 0; i < iterations; i++) {
                const error = await errorEngine.simulateError(contextMastered, 'test_mastered', 'TEST');
                if (error) errorCount++;
            }

            // Les concepts maîtrisés devraient générer moins d'erreurs
            const errorRate = errorCount / iterations;
            expect(errorRate).toBeLessThan(0.5); // Moins de 50% d'erreurs
        });
    });

    describe('Validation des Structures de Données', () => {
        test('doit créer des erreurs avec tous les champs obligatoires', async () => {
            const error = await errorEngine.simulateError(mockLearnerContext, 'validation', 'VALIDATION');
            
            if (error) {
                // Vérification de tous les champs obligatoires de SimulatedError
                expect(error.id).toBeDefined();
                expect(error.type).toBeDefined();
                expect(error.originalSign).toBe('validation');
                expect(error.errorSign).toBeDefined();
                expect(error.description).toBeDefined();
                expect(['minor', 'moderate', 'major']).toContain(error.severity);
                expect(error.concept).toBe('validation');
                expect(error.correctionHints).toBeInstanceOf(Array);
                expect(error.pedagogicalNote).toBeDefined();
                expect(typeof error.canBeRepeated).toBe('boolean');
                expect(error.relatedConcepts).toBeInstanceOf(Array);
                expect(error.timestamp).toBeInstanceOf(Date);
            }
        });

        test('doit gérer gracieusement les contextes invalides', async () => {
            const invalidContext = {
                ...mockLearnerContext,
                currentLevel: 'INVALID' as CECRLLevel
            };

            // Ne devrait pas lever d'exception
            const error = await errorEngine.simulateError(invalidContext, 'test', 'TEST');
            expect(error).toBeDefined(); // Peut être null ou une erreur valide
        });
    });

    describe('Performance et Stabilité', () => {
        test('doit maintenir des performances correctes avec de multiples simulations', async () => {
            const startTime = Date.now();
            const promises = [];

            for (let i = 0; i < 50; i++) {
                promises.push(errorEngine.simulateError(mockLearnerContext, `concept_${i}`, `TEST_${i}`));
            }

            const results = await Promise.all(promises);
            const endTime = Date.now();
            
            expect(endTime - startTime).toBeLessThan(1000); // Moins d'1 seconde pour 50 simulations
            expect(results).toHaveLength(50);
        });

        test('doit nettoyer correctement les ressources lors de la destruction', () => {
            const engine = new ErrorSimulationEngine();
            expect(() => engine.destroy()).not.toThrow();
        });
    });

    describe('Cohérence Pédagogique', () => {
        test('doit maintenir la cohérence entre le type d\'erreur et les conseils', async () => {
            const error = await errorEngine.simulateError(mockLearnerContext, 'cohérence', 'COHERENCE');
            
            if (error) {
                const errorTypeLower = error.type.toLowerCase();
                const hintsText = error.correctionHints.join(' ').toLowerCase();
                
                // Les conseils devraient être en rapport avec le type d'erreur
                if (errorTypeLower.includes('hand')) {
                    expect(hintsText).toMatch(/main|doigt|forme/);
                } else if (errorTypeLower.includes('movement')) {
                    expect(hintsText).toMatch(/mouvement|lent|décompos/);
                } else if (errorTypeLower.includes('facial')) {
                    expect(hintsText).toMatch(/visage|expression|regard/);
                }
            }
        });
    });
});