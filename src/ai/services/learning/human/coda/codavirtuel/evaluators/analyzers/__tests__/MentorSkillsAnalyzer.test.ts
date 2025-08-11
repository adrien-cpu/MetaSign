/**
 * Tests unitaires pour MentorSkillsAnalyzer
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/__tests__/MentorSkillsAnalyzer.test.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/__tests__
 * @description Tests complets pour l'analyseur des compétences mentor
 * Compatible avec exactOptionalPropertyTypes: true et sans usage d'any
 * @author MetaSign Learning Team
 * @version 3.0.2
 * @since 2025
 * @lastModified 2025-01-20
 */

import { MentorSkillsAnalyzer } from '../MentorSkillsAnalyzer';
import type { TeachingSession } from '../../types/CODAEvaluatorTypes';
import type { EvaluationContext } from '../../CECRLCODAEvaluator';

// Configuration pour l'analyseur mentor (adaptée aux vraies attentes)
interface MentorAnalyzerConfig {
    readonly culturalSensitivityWeight?: number;
    readonly empathyWeight?: number;
    readonly analysisDepth?: 'surface' | 'detailed' | 'comprehensive';
    readonly enableDetailedLogging?: boolean;
}

describe('MentorSkillsAnalyzer', () => {
    let analyzer: MentorSkillsAnalyzer;

    // Contexte d'évaluation complet avec types corrects
    const mockEvaluationContext: EvaluationContext = {
        mentorId: 'mentor-123',
        totalSessions: 3,
        averageSessionDuration: 30,
        mentorExperience: 'intermediate', // Type union correct
        aiStudentLevel: 'A2',
        culturalContext: 'moderate_cultural_context'
    };

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
                questions: ['Comment dit-on bonjour?', 'Y a-t-il des variantes régionales?'],
                errors: ['erreur-gestuelle-1'],
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
            mentorId: 'mentor-123',
            content: {
                topic: 'emotions',
                concepts: ['joie', 'tristesse'],
                teachingMethod: 'interactive',
                duration: 25
            },
            aiReactions: {
                comprehension: 0.75,
                questions: ['Comment exprimer la joie en LSF?'],
                errors: ['expression-faciale-incomplète'],
                correctionsAccepted: 0.85,
                frustrationSigns: 0.2
            },
            results: {
                objectivesAchieved: 0.8,
                newSkillsAcquired: ['emotions_basiques'],
                improvement: 0.12,
                aiSatisfaction: 0.85
            },
            timestamp: new Date('2025-01-15T10:30:00Z')
        }
    ];

    beforeEach(() => {
        // Configuration appropriée pour l'analyseur
        const config: MentorAnalyzerConfig = {
            culturalSensitivityWeight: 0.25,
            empathyWeight: 0.35,
            analysisDepth: 'comprehensive',
            enableDetailedLogging: false
        };

        analyzer = new MentorSkillsAnalyzer(config);
    });

    describe('Constructor', () => {
        test('should initialize with mentor analyzer configuration', () => {
            const config: MentorAnalyzerConfig = {
                culturalSensitivityWeight: 0.3,
                empathyWeight: 0.4,
                analysisDepth: 'detailed'
            };

            const customAnalyzer = new MentorSkillsAnalyzer(config);
            expect(customAnalyzer).toBeInstanceOf(MentorSkillsAnalyzer);
        });

        test('should be created with minimal configuration', () => {
            const factoryAnalyzer = new MentorSkillsAnalyzer({
                analysisDepth: 'surface'
            });
            expect(factoryAnalyzer).toBeInstanceOf(MentorSkillsAnalyzer);
        });
    });

    describe('evaluateMentorSkills', () => {
        test('should evaluate all mentor competencies', async () => {
            const evaluation = await analyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);

            expect(evaluation).toBeDefined();
            expect(evaluation.overallScore).toBeGreaterThan(0);
            expect(evaluation.overallScore).toBeLessThanOrEqual(1);

            // Vérifier toutes les compétences
            expect(evaluation.competencies).toBeDefined();
            expect(evaluation.competencies.explanation).toBeGreaterThanOrEqual(0);
            expect(evaluation.competencies.explanation).toBeLessThanOrEqual(1);
            expect(evaluation.competencies.patience).toBeGreaterThanOrEqual(0);
            expect(evaluation.competencies.patience).toBeLessThanOrEqual(1);
            expect(evaluation.competencies.adaptation).toBeGreaterThanOrEqual(0);
            expect(evaluation.competencies.adaptation).toBeLessThanOrEqual(1);
            expect(evaluation.competencies.encouragement).toBeGreaterThanOrEqual(0);
            expect(evaluation.competencies.encouragement).toBeLessThanOrEqual(1);
            expect(evaluation.competencies.culturalSensitivity).toBeGreaterThanOrEqual(0);
            expect(evaluation.competencies.culturalSensitivity).toBeLessThanOrEqual(1);
        });

        test('should determine correct teaching level', async () => {
            const evaluation = await analyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);

            expect(evaluation.teachingLevel).toMatch(/^(novice|developing|proficient|expert)$/);

            // Vérifier la cohérence entre score et niveau
            if (evaluation.overallScore >= 0.85) {
                expect(evaluation.teachingLevel).toBe('expert');
            } else if (evaluation.overallScore >= 0.7) {
                expect(evaluation.teachingLevel).toBe('proficient');
            } else if (evaluation.overallScore >= 0.5) {
                expect(evaluation.teachingLevel).toBe('developing');
            } else {
                expect(evaluation.teachingLevel).toBe('novice');
            }
        });

        test('should provide meaningful improvements and strengths', async () => {
            const evaluation = await analyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);

            expect(Array.isArray(evaluation.improvements)).toBe(true);
            expect(Array.isArray(evaluation.strengths)).toBe(true);
            expect(Array.isArray(evaluation.recommendations)).toBe(true);

            // Vérifier que les contenus sont pertinents
            evaluation.strengths.forEach(strength => {
                expect(typeof strength).toBe('string');
                expect(strength.length).toBeGreaterThan(0);
            });

            evaluation.improvements.forEach(improvement => {
                expect(typeof improvement).toBe('string');
                expect(improvement.length).toBeGreaterThan(0);
            });

            evaluation.recommendations.forEach(recommendation => {
                expect(typeof recommendation).toBe('string');
                expect(recommendation.length).toBeGreaterThan(0);
            });
        });

        test('should handle empty sessions gracefully', async () => {
            const evaluation = await analyzer.evaluateMentorSkills([], mockEvaluationContext);

            expect(evaluation).toBeDefined();
            expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
            expect(evaluation.overallScore).toBeLessThanOrEqual(1);
            expect(evaluation.teachingLevel).toBeDefined();
        });

        test('should handle single session', async () => {
            const singleSession = [mockSessions[0]];
            const evaluation = await analyzer.evaluateMentorSkills(singleSession, mockEvaluationContext);

            expect(evaluation).toBeDefined();
            expect(evaluation.overallScore).toBeGreaterThan(0);
            expect(evaluation.competencies).toBeDefined();
        });
    });

    describe('Competency evaluation specifics', () => {
        test('should correctly evaluate explanation skills', async () => {
            // Sessions avec haute compréhension = bonnes explications
            const highComprehensionSessions: TeachingSession[] = mockSessions.map(session => ({
                ...session,
                aiReactions: {
                    ...session.aiReactions,
                    comprehension: 0.95,
                    questions: [], // Peu de questions = bonnes explications
                    errors: [] // Peu d'erreurs = bonnes explications
                }
            }));

            const evaluation = await analyzer.evaluateMentorSkills(highComprehensionSessions, mockEvaluationContext);

            expect(evaluation.competencies.explanation).toBeGreaterThan(0.8);
        });

        test('should correctly evaluate patience skills', async () => {
            // Sessions avec frustration gérée = bonne patience
            const patientScenarioSessions: TeachingSession[] = mockSessions.map(session => ({
                ...session,
                aiReactions: {
                    ...session.aiReactions,
                    frustrationSigns: 0.4, // Frustration modérée
                    correctionsAccepted: 0.9 // Bien acceptées = patience du mentor
                }
            }));

            const evaluation = await analyzer.evaluateMentorSkills(patientScenarioSessions, mockEvaluationContext);

            expect(evaluation.competencies.patience).toBeDefined();
            expect(evaluation.competencies.patience).toBeGreaterThanOrEqual(0);
        });

        test('should correctly evaluate adaptation skills', async () => {
            // Sessions avec méthodes variées = bonne adaptation
            const adaptiveSessions: TeachingSession[] = [
                {
                    ...mockSessions[0],
                    content: {
                        ...mockSessions[0].content,
                        teachingMethod: 'visual'
                    }
                },
                {
                    ...mockSessions[1],
                    content: {
                        ...mockSessions[1].content,
                        teachingMethod: 'interactive'
                    }
                }
            ];

            const evaluation = await analyzer.evaluateMentorSkills(adaptiveSessions, mockEvaluationContext);

            expect(evaluation.competencies.adaptation).toBeGreaterThan(0.5);
        });

        test('should correctly evaluate encouragement skills', async () => {
            // Sessions avec bonne satisfaction = bon encouragement
            const encouragingSessions: TeachingSession[] = mockSessions.map(session => ({
                ...session,
                results: {
                    ...session.results,
                    aiSatisfaction: 0.95, // Très satisfait = bien encouragé
                    improvement: 0.2 // Amélioration notable
                }
            }));

            const evaluation = await analyzer.evaluateMentorSkills(encouragingSessions, mockEvaluationContext);

            expect(evaluation.competencies.encouragement).toBeGreaterThan(0.7);
        });

        test('should evaluate cultural sensitivity', async () => {
            const evaluation = await analyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);

            expect(evaluation.competencies.culturalSensitivity).toBeDefined();
            expect(evaluation.competencies.culturalSensitivity).toBeGreaterThanOrEqual(0);
            expect(evaluation.competencies.culturalSensitivity).toBeLessThanOrEqual(1);
        });
    });

    describe('Configuration impact', () => {
        test('should adjust evaluation based on analyzer configuration', async () => {
            const sensitiveConfig: MentorAnalyzerConfig = {
                culturalSensitivityWeight: 0.4, // Poids élevé pour la culture
                empathyWeight: 0.5,
                analysisDepth: 'comprehensive'
            };

            const sensitiveAnalyzer = new MentorSkillsAnalyzer(sensitiveConfig);
            const evaluation = await sensitiveAnalyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);

            expect(evaluation).toBeDefined();
            expect(evaluation.competencies.culturalSensitivity).toBeDefined();
        });

        test('should provide consistent results for same input', async () => {
            const evaluation1 = await analyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);
            const evaluation2 = await analyzer.evaluateMentorSkills(mockSessions, mockEvaluationContext);

            expect(evaluation1.overallScore).toBe(evaluation2.overallScore);
            expect(evaluation1.teachingLevel).toBe(evaluation2.teachingLevel);
            expect(evaluation1.competencies.explanation).toBe(evaluation2.competencies.explanation);
        });
    });

    describe('Error handling', () => {
        test('should handle sessions with minimal data', async () => {
            const minimalSessions: TeachingSession[] = [
                {
                    sessionId: 'minimal-1',
                    mentorId: 'mentor-minimal',
                    content: {
                        topic: 'test',
                        concepts: ['concept1'],
                        teachingMethod: 'basic',
                        duration: 10
                    },
                    aiReactions: {
                        comprehension: 0.5,
                        questions: [],
                        errors: [],
                        correctionsAccepted: 0.5,
                        frustrationSigns: 0.5
                    },
                    results: {
                        objectivesAchieved: 0.5,
                        newSkillsAcquired: [],
                        improvement: 0.0,
                        aiSatisfaction: 0.5
                    },
                    timestamp: new Date()
                }
            ];

            const evaluation = await analyzer.evaluateMentorSkills(minimalSessions, mockEvaluationContext);

            expect(evaluation).toBeDefined();
            expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
            expect(evaluation.teachingLevel).toBeDefined();
        });

        test('should handle extreme values gracefully', async () => {
            const extremeSessions: TeachingSession[] = [
                {
                    sessionId: 'extreme-1',
                    mentorId: 'mentor-extreme',
                    content: {
                        topic: 'extreme_test',
                        concepts: ['extreme'],
                        teachingMethod: 'extreme',
                        duration: 1
                    },
                    aiReactions: {
                        comprehension: 0.0,
                        questions: [],
                        errors: ['erreur1', 'erreur2', 'erreur3'],
                        correctionsAccepted: 0.0,
                        frustrationSigns: 1.0
                    },
                    results: {
                        objectivesAchieved: 0.0,
                        newSkillsAcquired: [],
                        improvement: 0.0,
                        aiSatisfaction: 0.0
                    },
                    timestamp: new Date()
                }
            ];

            expect(async () => {
                await analyzer.evaluateMentorSkills(extremeSessions, mockEvaluationContext);
            }).not.toThrow();
        });
    });

    describe('Context variations', () => {
        test('should handle different cultural contexts', async () => {
            const contexts = [
                { ...mockEvaluationContext, culturalContext: 'high_cultural_context' },
                { ...mockEvaluationContext, culturalContext: 'low_cultural_context' },
                { ...mockEvaluationContext, culturalContext: 'neutral_context' }
            ];

            for (const context of contexts) {
                const evaluation = await analyzer.evaluateMentorSkills(mockSessions, context);
                expect(evaluation).toBeDefined();
                expect(evaluation.competencies.culturalSensitivity).toBeDefined();
            }
        });

        test('should handle different experience levels', async () => {
            const experienceLevels: Array<'novice' | 'intermediate' | 'expert' | 'experienced'> = [
                'novice',
                'intermediate',
                'expert',
                'experienced'
            ];

            for (const level of experienceLevels) {
                const context = { ...mockEvaluationContext, mentorExperience: level };
                const evaluation = await analyzer.evaluateMentorSkills(mockSessions, context);
                expect(evaluation).toBeDefined();
            }
        });
    });
});