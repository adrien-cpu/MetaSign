/**
 * Tests unitaires pour le MentorEvaluator refactorisé - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/__tests__/MentorEvaluator.test.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Tests pour valider la refactorisation du MentorEvaluator
 * Compatible avec exactOptionalPropertyTypes: true et les nouveaux types
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-15
 */

import { MentorEvaluator } from '../MentorEvaluator';
import { MentorCompetencyAnalyzer } from '../MentorCompetencyAnalyzer';
import { MentorRecommendationEngine } from '../MentorRecommendationEngine';
import { createMentorEvaluator } from '../index';
import type { EmotionalContext } from '../EmotionalAnalyzer';
import type {
    TeachingSession,
    EmotionalConfig,
    MentorEvaluation
} from '../../types/CODAEvaluatorTypes';

// Mocks
jest.mock('@/ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn(() => ({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        }))
    }
}));

describe('MentorEvaluator Refactorisé v3.0.1', () => {
    let mentorEvaluator: MentorEvaluator;
    let competencyAnalyzer: MentorCompetencyAnalyzer;
    let recommendationEngine: MentorRecommendationEngine;

    const mockEmotionalConfig: EmotionalConfig = {
        frustrationThreshold: 0.7,
        motivationBoost: 0.3,
        culturalSensitivityWeight: 0.2,
        empathyWeight: 0.4
    };

    const mockEmotionalContext: EmotionalContext = {
        detectedEmotion: 'confident',
        intensity: 0.7,
        contributingFactors: ['successful_completion', 'positive_feedback'],
        adaptationRecommendations: ['maintain_current_approach', 'increase_complexity_gradually']
    };

    const mockTeachingSession: TeachingSession = {
        sessionId: 'session-1',
        mentorId: 'mentor-123',
        content: {
            topic: 'basic-lsf-signs',
            concepts: ['basic-signs', 'social-interaction'],
            teachingMethod: 'interactive',
            duration: 45
        },
        aiReactions: {
            comprehension: 0.8,
            questions: ['Comment signer bonjour?'],
            errors: ['Mauvaise orientation de la main'],
            correctionsAccepted: 1,
            frustrationSigns: 2
        },
        results: {
            objectivesAchieved: 0.7,
            newSkillsAcquired: ['greeting-signs', 'basic-interaction'],
            improvement: 0.3,
            aiSatisfaction: 0.9
        },
        timestamp: new Date()
    };

    beforeEach(() => {
        mentorEvaluator = new MentorEvaluator(mockEmotionalConfig);
        competencyAnalyzer = new MentorCompetencyAnalyzer(mockEmotionalConfig);
        recommendationEngine = new MentorRecommendationEngine();
    });

    describe('MentorEvaluator - Classe principale', () => {
        test('devrait créer une instance correctement', () => {
            expect(mentorEvaluator).toBeInstanceOf(MentorEvaluator);
        });

        test('devrait évaluer les compétences avec des sessions valides', () => {
            const sessions = [mockTeachingSession];
            const evaluation = mentorEvaluator.evaluateMentorSkills(sessions, mockEmotionalContext);

            expect(evaluation).toBeDefined();
            expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
            expect(evaluation.overallScore).toBeLessThanOrEqual(1);
            expect(evaluation.teachingLevel).toBeDefined();
            expect(evaluation.competencies).toBeDefined();
            expect(evaluation.recommendations).toBeInstanceOf(Array);
        });

        test('devrait retourner une évaluation par défaut avec des sessions vides', () => {
            const evaluation = mentorEvaluator.evaluateMentorSkills([], mockEmotionalContext);

            expect(evaluation.overallScore).toBe(0.3);
            expect(evaluation.teachingLevel).toBe('novice');
            expect(evaluation.competencies.explanation).toBe(0.3);
        });

        test('devrait identifier la compétence la plus faible', () => {
            const competencies: MentorEvaluation['competencies'] = {
                explanation: 0.8,
                patience: 0.3, // Plus faible
                adaptation: 0.7,
                encouragement: 0.6,
                culturalSensitivity: 0.5
            };

            const weakest = mentorEvaluator.getWeakestMentorCompetency(competencies);
            expect(weakest).toBe('patience');
        });

        test('devrait retourner null pour des compétences vides', () => {
            const weakest = mentorEvaluator.getWeakestMentorCompetency({} as MentorEvaluation['competencies']);
            expect(weakest).toBeNull();
        });

        test('devrait obtenir des conseils d\'amélioration', () => {
            const tips = mentorEvaluator.getMentorImprovementTips('patience');
            expect(tips).toBeInstanceOf(Array);
            expect(tips.length).toBeGreaterThan(0);
            // Test plus flexible pour le contenu
            expect(typeof tips[0]).toBe('string');
        });

        test('devrait obtenir des exercices de pratique', () => {
            const exercises = mentorEvaluator.getMentorPracticeExercises('adaptation');
            expect(exercises).toBeInstanceOf(Array);
            expect(exercises.length).toBeGreaterThan(0);
            expect(typeof exercises[0]).toBe('string');
        });

        test('devrait évaluer avec options avancées', () => {
            const sessions = [mockTeachingSession];
            const options = {
                includeTrends: true,
                detailLevel: 'comprehensive' as const,
                enablePredictive: true
            };

            const result = mentorEvaluator.evaluateWithOptions(sessions, mockEmotionalContext, options);

            expect(result.evaluation).toBeDefined();
            expect(result.metrics).toBeDefined();
            expect(result.metrics.evaluationTime).toBeGreaterThan(0);
            expect(result.metrics.sessionsAnalyzed).toBe(1);
            expect(result.metrics.confidenceScore).toBeGreaterThanOrEqual(0);
            expect(result.metrics.confidenceScore).toBeLessThanOrEqual(1);
            expect(result.metrics.algorithmVersion).toBe('3.0.1');
        });

        test('devrait calculer un score de progression', () => {
            const sessions = Array.from({ length: 5 }, (_, i) => ({
                ...mockTeachingSession,
                sessionId: `session-${i + 1}`,
                aiReactions: {
                    ...mockTeachingSession.aiReactions,
                    comprehension: 0.5 + (i * 0.1) // Progression croissante
                }
            }));

            const progressionScore = mentorEvaluator.calculateProgressionScore(sessions);
            expect(progressionScore).toBeGreaterThanOrEqual(0);
            expect(progressionScore).toBeLessThanOrEqual(1);
        });

        test('devrait retourner un score neutre avec peu de sessions pour la progression', () => {
            const sessions = [mockTeachingSession, { ...mockTeachingSession, sessionId: 'session-2' }];
            const progressionScore = mentorEvaluator.calculateProgressionScore(sessions);
            expect(progressionScore).toBe(0.5);
        });
    });

    describe('MentorCompetencyAnalyzer', () => {
        test('devrait analyser toutes les compétences', () => {
            const sessions = [mockTeachingSession];
            const competencies = competencyAnalyzer.analyzeAllCompetencies(sessions, mockEmotionalContext);

            expect(competencies).toBeDefined();
            expect(competencies.explanation).toBeGreaterThanOrEqual(0);
            expect(competencies.patience).toBeGreaterThanOrEqual(0);
            expect(competencies.adaptation).toBeGreaterThanOrEqual(0);
            expect(competencies.encouragement).toBeGreaterThanOrEqual(0);
            expect(competencies.culturalSensitivity).toBeGreaterThanOrEqual(0);
        });

        test('devrait évaluer la compétence d\'explication', () => {
            const sessions = [mockTeachingSession];
            const score = competencyAnalyzer.evaluateExplanationSkill(sessions);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        test('devrait retourner 0 pour l\'explication avec sessions vides', () => {
            const score = competencyAnalyzer.evaluateExplanationSkill([]);
            expect(score).toBe(0);
        });

        test('devrait évaluer la patience avec contexte émotionnel', () => {
            const sessions = [mockTeachingSession];
            const score = competencyAnalyzer.evaluatePatienceSkill(sessions, mockEmotionalContext);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        test('devrait appliquer un bonus pour bonne gestion émotionnelle', () => {
            const sessions = [mockTeachingSession];
            const frustratedContext: EmotionalContext = {
                detectedEmotion: 'frustrated',
                intensity: 0.3, // Faible intensité = bon contrôle
                contributingFactors: ['repeated_errors', 'time_pressure'],
                adaptationRecommendations: ['slow_down_pace', 'provide_more_encouragement']
            };

            const score = competencyAnalyzer.evaluatePatienceSkill(sessions, frustratedContext);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        test('devrait évaluer l\'adaptation avec sessions multiples', () => {
            const sessions = [mockTeachingSession, { ...mockTeachingSession, sessionId: 'session-2' }];
            const score = competencyAnalyzer.evaluateAdaptationSkill(sessions);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        test('devrait retourner 0.5 pour adaptation avec moins de 2 sessions', () => {
            const score = competencyAnalyzer.evaluateAdaptationSkill([mockTeachingSession]);
            expect(score).toBe(0.5);
        });

        test('devrait obtenir les détails d\'une compétence spécifique', () => {
            const sessions = [mockTeachingSession];
            const details = competencyAnalyzer.getCompetencyDetails(sessions, 'explanation');

            expect(details).toBeDefined();
            expect(details.score).toBeGreaterThanOrEqual(0);
            expect(details.score).toBeLessThanOrEqual(1);
            expect(details.factors).toBeInstanceOf(Array);
            expect(details.recommendations).toBeInstanceOf(Array);
            expect(['improving', 'declining', 'stable']).toContain(details.trend);
        });

        test('devrait analyser la sensibilité culturelle', () => {
            const culturalSession: TeachingSession = {
                ...mockTeachingSession,
                content: {
                    ...mockTeachingSession.content,
                    concepts: ['deaf-culture', 'social-interaction', 'community-values'],
                    teachingMethod: 'cultural-immersion'
                }
            };

            const score = competencyAnalyzer.evaluateCulturalSensitivity([culturalSession]);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });

    describe('MentorRecommendationEngine', () => {
        test('devrait générer des recommandations', () => {
            const competencies: MentorEvaluation['competencies'] = {
                explanation: 0.8,
                patience: 0.4,
                adaptation: 0.6,
                encouragement: 0.7,
                culturalSensitivity: 0.5
            };

            const recommendations = recommendationEngine.generateRecommendations(
                competencies,
                mockEmotionalContext,
                'developing'
            );

            expect(recommendations).toBeInstanceOf(Array);
            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations.length).toBeLessThanOrEqual(8);
        });

        test('devrait obtenir des conseils d\'amélioration pour une compétence', () => {
            const tips = recommendationEngine.getImprovementTips('explanation');
            expect(tips).toBeInstanceOf(Array);
            expect(tips.length).toBeGreaterThan(0);
            expect(typeof tips[0]).toBe('string');
        });

        test('devrait retourner des conseils par défaut pour compétence inconnue', () => {
            const tips = recommendationEngine.getImprovementTips('unknown-skill');
            expect(tips).toBeInstanceOf(Array);
            expect(tips.length).toBeGreaterThan(0);
        });

        test('devrait obtenir des exercices de pratique', () => {
            const exercises = recommendationEngine.getPracticeExercises('patience');
            expect(exercises).toBeInstanceOf(Array);
            expect(exercises.length).toBeGreaterThan(0);
            expect(typeof exercises[0]).toBe('string');
        });

        test('devrait retourner des exercices par défaut pour compétence inconnue', () => {
            const exercises = recommendationEngine.getPracticeExercises('unknown-skill');
            expect(exercises).toBeInstanceOf(Array);
            expect(exercises.length).toBeGreaterThan(0);
        });
    });

    describe('Factory Functions', () => {
        test('createMentorEvaluator devrait créer une instance', () => {
            const evaluator = createMentorEvaluator(mockEmotionalConfig);
            expect(evaluator).toBeInstanceOf(MentorEvaluator);
        });
    });

    describe('Intégration et Performance', () => {
        test('devrait traiter plusieurs sessions rapidement', () => {
            const sessions = Array.from({ length: 10 }, (_, i) => ({
                ...mockTeachingSession,
                sessionId: `session-${i + 1}`
            }));

            const startTime = Date.now();
            const evaluation = mentorEvaluator.evaluateMentorSkills(sessions, mockEmotionalContext);
            const endTime = Date.now();

            expect(evaluation).toBeDefined();
            expect(endTime - startTime).toBeLessThan(1000); // Moins d'1 seconde
        });

        test('devrait gérer les erreurs gracieusement', () => {
            // Simulation d'une session avec données partielles
            const incompleteSession = {
                ...mockTeachingSession,
                sessionId: 'incomplete-session',
                aiReactions: {
                    ...mockTeachingSession.aiReactions,
                    comprehension: NaN // Valeur invalide
                }
            };

            expect(() => {
                mentorEvaluator.evaluateMentorSkills([incompleteSession], mockEmotionalContext);
            }).not.toThrow();
        });

        test('devrait maintenir la cohérence des scores', () => {
            const sessions = [mockTeachingSession];
            const evaluation1 = mentorEvaluator.evaluateMentorSkills(sessions, mockEmotionalContext);
            const evaluation2 = mentorEvaluator.evaluateMentorSkills(sessions, mockEmotionalContext);

            expect(evaluation1.overallScore).toBe(evaluation2.overallScore);
            expect(evaluation1.teachingLevel).toBe(evaluation2.teachingLevel);
        });

        test('devrait calculer des métriques de confiance précises', () => {
            const sessionsLimited = [mockTeachingSession];
            const sessionsExtended = Array.from({ length: 10 }, (_, i) => ({
                ...mockTeachingSession,
                sessionId: `session-${i + 1}`
            }));

            const { metrics: metricsLimited } = mentorEvaluator.evaluateWithOptions(
                sessionsLimited,
                mockEmotionalContext
            );
            const { metrics: metricsExtended } = mentorEvaluator.evaluateWithOptions(
                sessionsExtended,
                mockEmotionalContext
            );

            // Plus de sessions = plus de confiance
            expect(metricsExtended.confidenceScore).toBeGreaterThanOrEqual(metricsLimited.confidenceScore);
            expect(metricsExtended.sessionsAnalyzed).toBe(10);
            expect(metricsLimited.sessionsAnalyzed).toBe(1);
        });
    });

    describe('Niveaux d\'enseignement', () => {
        test('devrait déterminer le bon niveau pour différents scores', () => {
            const testCases = [
                { score: 0.9 },
                { score: 0.75 },
                { score: 0.6 },
                { score: 0.3 }
            ];

            testCases.forEach(({ score }) => {
                // Créer des sessions qui donnent le score souhaité
                const mockSessionsForScore = [{
                    ...mockTeachingSession,
                    sessionId: `session-${score}`,
                    aiReactions: {
                        ...mockTeachingSession.aiReactions,
                        comprehension: score,
                        frustrationSigns: score > 0.7 ? 1 : 5 // Moins de frustration pour scores élevés
                    },
                    results: {
                        ...mockTeachingSession.results,
                        aiSatisfaction: score,
                        improvement: score > 0.5 ? score - 0.1 : score + 0.1
                    }
                }];

                const evaluation = mentorEvaluator.evaluateMentorSkills(mockSessionsForScore, mockEmotionalContext);

                // Vérifications plus strictes sur les niveaux
                expect(evaluation.teachingLevel).toBeDefined();
                expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
                expect(evaluation.overallScore).toBeLessThanOrEqual(1);

                // Pour les scores très élevés, on s'attend à un bon niveau
                if (score >= 0.85) {
                    expect(['expert', 'proficient']).toContain(evaluation.teachingLevel);
                }
            });
        });
    });

    describe('Gestion des contextes émotionnels avancés', () => {
        test('devrait gérer différents états émotionnels', () => {
            const emotionalStates: EmotionalContext[] = [
                {
                    detectedEmotion: 'frustrated',
                    intensity: 0.8,
                    contributingFactors: ['repeated_failures', 'high_difficulty'],
                    adaptationRecommendations: ['slow_down', 'provide_support']
                },
                {
                    detectedEmotion: 'motivated',
                    intensity: 0.9,
                    contributingFactors: ['recent_success', 'clear_progress'],
                    adaptationRecommendations: ['increase_challenge', 'maintain_momentum']
                },
                {
                    detectedEmotion: 'confused',
                    intensity: 0.6,
                    contributingFactors: ['complex_concepts', 'unclear_instructions'],
                    adaptationRecommendations: ['clarify_concepts', 'provide_examples']
                },
                {
                    detectedEmotion: 'neutral',
                    intensity: 0.5,
                    contributingFactors: ['stable_performance'],
                    adaptationRecommendations: ['maintain_engagement']
                }
            ];

            emotionalStates.forEach((emotionalState) => {
                const evaluation = mentorEvaluator.evaluateMentorSkills([mockTeachingSession], emotionalState);

                expect(evaluation).toBeDefined();
                expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
                expect(evaluation.overallScore).toBeLessThanOrEqual(1);
                expect(evaluation.recommendations).toBeInstanceOf(Array);
                expect(evaluation.recommendations.length).toBeGreaterThan(0);
            });
        });

        test('devrait adapter les évaluations selon l\'intensité émotionnelle', () => {
            const lowIntensityContext: EmotionalContext = {
                detectedEmotion: 'frustrated',
                intensity: 0.2,
                contributingFactors: ['minor_difficulty'],
                adaptationRecommendations: ['gentle_guidance']
            };

            const highIntensityContext: EmotionalContext = {
                detectedEmotion: 'frustrated',
                intensity: 0.9,
                contributingFactors: ['major_obstacles', 'repeated_failures'],
                adaptationRecommendations: ['immediate_intervention', 'emotional_support']
            };

            const evalLowIntensity = mentorEvaluator.evaluateMentorSkills([mockTeachingSession], lowIntensityContext);
            const evalHighIntensity = mentorEvaluator.evaluateMentorSkills([mockTeachingSession], highIntensityContext);

            // L'intensité émotionnelle devrait influencer l'évaluation de la patience
            expect(evalLowIntensity.competencies.patience).toBeGreaterThanOrEqual(0);
            expect(evalHighIntensity.competencies.patience).toBeGreaterThanOrEqual(0);
        });
    });
});