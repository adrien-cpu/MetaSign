/**
 * Tests d'intégration pour l'architecture CODA complète
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/__tests__/integration.test.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/__tests__
 * @description Tests d'intégration pour valider le bon fonctionnement de l'ensemble du système CODA
 * Compatible avec exactOptionalPropertyTypes: true et sans usage d'any
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2025
 * @lastModified 2025-01-20
 */

import { createCODAEvaluator } from '../index';
import type { TeachingSession, CODAEvaluatorConfig } from '../types/CODAEvaluatorTypes';

describe('CODA Integration Tests', () => {
    const mockSessions: TeachingSession[] = [
        {
            sessionId: 'session-1',
            mentorId: 'mentor-integration-test',
            content: {
                topic: 'basic_signs',
                concepts: ['salutation', 'culture'],
                teachingMethod: 'visual',
                duration: 30
            },
            // Conforme au type aiReactions défini dans CODAEvaluatorTypes.ts
            aiReactions: {
                comprehension: 0.8,
                questions: ['Comment dit-on bonjour?', 'Quelle est la différence entre salut et bonjour?'],
                errors: ['erreur-gestuelle-1', 'erreur-timing-2'],
                correctionsAccepted: 0.9,
                frustrationSigns: 0.1
            },
            results: {
                objectivesAchieved: 0.85,
                newSkillsAcquired: ['salutation', 'politesse'],
                improvement: 0.15,
                aiSatisfaction: 0.9
            },
            timestamp: new Date('2025-01-15T10:00:00Z')
        },
        {
            sessionId: 'session-2',
            mentorId: 'mentor-integration-test',
            content: {
                topic: 'emotions_expressions',
                concepts: ['joie', 'tristesse', 'colère'],
                teachingMethod: 'interactive',
                duration: 25
            },
            aiReactions: {
                comprehension: 0.75,
                questions: ['Les expressions faciales sont-elles universelles?'],
                errors: ['expression-faciale-trop-subtile'],
                correctionsAccepted: 0.85,
                frustrationSigns: 0.2
            },
            results: {
                objectivesAchieved: 0.8,
                newSkillsAcquired: ['expressions_emotions'],
                improvement: 0.12,
                aiSatisfaction: 0.85
            },
            timestamp: new Date('2025-01-15T10:30:00Z')
        }
    ];

    test('should perform complete evaluation flow', async () => {
        // Configuration conforme au type CODAEvaluatorConfig
        const config: CODAEvaluatorConfig = {
            aiIntelligenceLevel: 'intermediate',
            culturalAuthenticity: true,
            emotionalSensitivity: 0.8
        };

        const evaluator = createCODAEvaluator(config);

        const evaluation = await evaluator.evaluateCODAExperience(
            'mentor-integration-test',
            mockSessions
        );

        // Vérifier la structure conforme à CODAExperienceEvaluation
        expect(evaluation).toBeDefined();
        expect(evaluation.mentorEvaluation).toBeDefined();
        expect(evaluation.aiStudent).toBeDefined();
        expect(evaluation.teachingSupports).toBeDefined();
        expect(evaluation.predictions).toBeDefined();
        expect(evaluation.confidence).toBeDefined();
        expect(evaluation.culturalContext).toBeDefined();
        expect(evaluation.emotionalContext).toBeDefined();
        expect(evaluation.userNeeds).toBeDefined();

        // Vérifier les types de données retournées
        expect(typeof evaluation.confidence).toBe('number');
        expect(evaluation.confidence).toBeGreaterThanOrEqual(0);
        expect(evaluation.confidence).toBeLessThanOrEqual(1);

        // Vérifier l'évaluation du mentor
        expect(evaluation.mentorEvaluation.overallScore).toBeGreaterThan(0);
        expect(evaluation.mentorEvaluation.teachingLevel).toBeDefined();
        expect(['novice', 'developing', 'proficient', 'expert']).toContain(evaluation.mentorEvaluation.teachingLevel);

        // Vérifier l'IA-élève
        expect(evaluation.aiStudent.name).toBeDefined();
        expect(evaluation.aiStudent.currentLevel).toBeDefined();
        expect(['happy', 'confused', 'frustrated', 'excited', 'neutral']).toContain(evaluation.aiStudent.mood);

        // Vérifier les supports d'enseignement
        expect(Array.isArray(evaluation.teachingSupports)).toBe(true);
        evaluation.teachingSupports.forEach(support => {
            expect(support.id).toBeDefined();
            expect(support.type).toBeDefined();
            expect(['visual_aid', 'exercise_template', 'explanation_guide', 'cultural_context']).toContain(support.type);
        });

        // Vérifier les prédictions
        expect(Array.isArray(evaluation.predictions)).toBe(true);
        evaluation.predictions.forEach(prediction => {
            expect(prediction.area).toBeDefined();
            expect(['easy', 'medium', 'hard', 'expert']).toContain(prediction.difficulty);
            expect(prediction.confidence).toBeGreaterThanOrEqual(0);
            expect(prediction.confidence).toBeLessThanOrEqual(1);
        });
    });

    test('should handle configuration variations', async () => {
        // Configuration minimale
        const fastConfig: CODAEvaluatorConfig = {
            aiIntelligenceLevel: 'basic',
            culturalAuthenticity: false,
            emotionalSensitivity: 0.5
        };

        const fastEvaluator = createCODAEvaluator(fastConfig);

        const evaluation = await fastEvaluator.evaluateCODAExperience(
            'mentor-fast-test',
            mockSessions
        );

        // Vérifier que l'évaluation fonctionne même avec une configuration minimale
        expect(evaluation.mentorEvaluation).toBeDefined();
        expect(evaluation.aiStudent).toBeDefined();
        expect(evaluation.teachingSupports).toBeDefined();
        expect(evaluation.predictions).toBeDefined();

        // Vérifier la cohérence avec la configuration
        expect(evaluation.culturalContext.authenticityLevel).toBeDefined();
        expect(evaluation.emotionalContext.intensity).toBeDefined();
    });

    test('should maintain performance with multiple evaluations', async () => {
        const evaluator = createCODAEvaluator({
            aiIntelligenceLevel: 'advanced',
            culturalAuthenticity: true,
            emotionalSensitivity: 0.7
        });

        const startTime = Date.now();

        // Effectuer plusieurs évaluations avec différents mentors
        const promises = Array.from({ length: 5 }, (_, i) =>
            evaluator.evaluateCODAExperience(`mentor-perf-${i}`, mockSessions)
        );

        const results = await Promise.all(promises);

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Vérifier que toutes les évaluations ont réussi
        expect(results).toHaveLength(5);
        results.forEach((result) => {
            expect(result.mentorEvaluation).toBeDefined();
            expect(result.aiStudent).toBeDefined();

            // Vérifier que chaque mentor a son propre IA-élève avec un nom unique (ou déterministe)
            expect(result.aiStudent.name).toBeDefined();
            expect(typeof result.aiStudent.name).toBe('string');
        });

        // Vérifier les performances (doit être raisonnable)
        expect(totalTime).toBeLessThan(10000); // Moins de 10 secondes pour 5 évaluations

        console.log(`Performance test: ${results.length} évaluations complétées en ${totalTime}ms`);
    });

    test('should handle edge cases gracefully', async () => {
        const evaluator = createCODAEvaluator({
            aiIntelligenceLevel: 'expert',
            culturalAuthenticity: true
        });

        // Test avec une session unique
        const singleSession = [mockSessions[0]];

        const evaluation = await evaluator.evaluateCODAExperience(
            'mentor-single-session',
            singleSession
        );

        expect(evaluation).toBeDefined();
        expect(evaluation.mentorEvaluation).toBeDefined();
        expect(evaluation.aiStudent).toBeDefined();
    });

    test('should produce consistent results for same input', async () => {
        const config: CODAEvaluatorConfig = {
            aiIntelligenceLevel: 'intermediate',
            culturalAuthenticity: true,
            emotionalSensitivity: 0.7
        };

        const evaluator1 = createCODAEvaluator(config);
        const evaluator2 = createCODAEvaluator(config);

        const mentorId = 'mentor-consistency-test';

        const result1 = await evaluator1.evaluateCODAExperience(mentorId, mockSessions);
        const result2 = await evaluator2.evaluateCODAExperience(mentorId, mockSessions);

        // Les noms d'IA-élèves devraient être identiques pour le même mentor
        expect(result1.aiStudent.name).toBe(result2.aiStudent.name);

        // Les scores généraux devraient être similaires (permettre une petite variation)
        const scoreDifference = Math.abs(result1.mentorEvaluation.overallScore - result2.mentorEvaluation.overallScore);
        expect(scoreDifference).toBeLessThan(0.1);
    });

    test('should validate all supported intelligence levels', async () => {
        const levels: Array<CODAEvaluatorConfig['aiIntelligenceLevel']> = ['basic', 'intermediate', 'advanced', 'expert'];

        const promises = levels.map(level => {
            const evaluator = createCODAEvaluator({
                aiIntelligenceLevel: level,
                culturalAuthenticity: true
            });

            return evaluator.evaluateCODAExperience(`mentor-${level}`, mockSessions);
        });

        const results = await Promise.all(promises);

        // Vérifier que tous les niveaux d'intelligence fonctionnent
        expect(results).toHaveLength(4);
        results.forEach((result) => {
            expect(result).toBeDefined();
            expect(result.mentorEvaluation).toBeDefined();
            expect(result.aiStudent).toBeDefined();
        });
    });

    test('should handle cultural authenticity settings', async () => {
        const authenticEvaluator = createCODAEvaluator({
            aiIntelligenceLevel: 'advanced',
            culturalAuthenticity: true,
            emotionalSensitivity: 0.8
        });

        const nonAuthenticEvaluator = createCODAEvaluator({
            aiIntelligenceLevel: 'advanced',
            culturalAuthenticity: false,
            emotionalSensitivity: 0.8
        });

        const authenticResult = await authenticEvaluator.evaluateCODAExperience('mentor-authentic', mockSessions);
        const nonAuthenticResult = await nonAuthenticEvaluator.evaluateCODAExperience('mentor-non-authentic', mockSessions);

        // Les deux devraient fonctionner
        expect(authenticResult.culturalContext).toBeDefined();
        expect(nonAuthenticResult.culturalContext).toBeDefined();

        // L'authenticité culturelle pourrait influencer les résultats
        expect(authenticResult.culturalContext.authenticityLevel).toBeDefined();
        expect(nonAuthenticResult.culturalContext.authenticityLevel).toBeDefined();
    });

    test('should maintain state consistency across evaluations', async () => {
        const evaluator = createCODAEvaluator({
            aiIntelligenceLevel: 'intermediate'
        });

        // Première évaluation
        const firstEvaluation = await evaluator.evaluateCODAExperience('mentor-state-test', mockSessions);

        // Deuxième évaluation avec le même mentor (devrait utiliser le cache)
        const secondEvaluation = await evaluator.evaluateCODAExperience('mentor-state-test', mockSessions);

        // Les résultats devraient être identiques si le cache fonctionne
        expect(firstEvaluation.aiStudent.name).toBe(secondEvaluation.aiStudent.name);
        expect(firstEvaluation.mentorEvaluation.overallScore).toBe(secondEvaluation.mentorEvaluation.overallScore);
        expect(firstEvaluation.confidence).toBe(secondEvaluation.confidence);
    });
});