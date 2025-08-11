/**
 * @file src/ai/services/learning/human/personalization/__tests__/ProfileManager.test.ts
 * @description Tests unitaires pour le gestionnaire de profils utilisateur avec support complet de la LSF
 * @module UserProfileManager
 * @version 2.1.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * // Utilisation des tests
 * import { UserProfileManager, InMemoryUserProfileStorage } from '../ProfileManager';
 * const storage = new InMemoryUserProfileStorage();
 * const manager = new UserProfileManager(storage);
 * ```
 */

import { UserProfileManager, InMemoryUserProfileStorage } from '../ProfileManager';
import {
    CompetencyLevel,
    LearningStyle,
    ProfilType
} from '../../../types';
import type {
    ExtendedUserProfile,
    UserPerformanceData,
    LearningPreferences,
    ProgressData
} from '../../../types';

// Mock du logger avec types stricts
jest.mock('@/ai/utils/Logger', () => ({
    Logger: {
        getInstance: jest.fn().mockReturnValue({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        })
    }
}));

/**
 * Suite de tests pour le UserProfileManager
 * Teste toutes les fonctionnalités de gestion de profils utilisateur
 */
describe('UserProfileManager', () => {
    let manager: UserProfileManager;
    let storage: InMemoryUserProfileStorage;

    /**
     * Configuration de l'environnement de test avant chaque test
     */
    beforeEach(() => {
        storage = new InMemoryUserProfileStorage();
        manager = new UserProfileManager(storage);
    });

    /**
     * Nettoyage après chaque test
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getOrCreateProfile', () => {
        /**
         * Test: Création d'un nouveau profil utilisateur
         */
        test('should create a new profile with LSF-specific defaults if none exists', async () => {
            const userId = 'new-user';
            const profile = await manager.getOrCreateProfile(userId);

            expect(profile).toBeDefined();
            expect(profile.userId).toBe(userId);
            expect(profile.skillLevel).toBe(CompetencyLevel.BEGINNER);
            expect(profile.preferences).toBeDefined();
            expect(profile.profilType).toBeDefined();
            expect(profile.hasFederatedLearningConsent).toBe(false);
            expect(profile.metadata?.createdAt).toBeInstanceOf(Date);
        });

        /**
         * Test: Récupération d'un profil existant
         */
        test('should return existing profile with all LSF data if it exists', async () => {
            const userId = 'existing-user';
            const existingProfile: ExtendedUserProfile = {
                id: userId,
                userId,
                profilType: ProfilType.SOURD,
                learningPreferences: {
                    preferredContentTypes: ['video', 'interactive'],
                    preferredPace: 'moderate',
                    preferredFeedbackFrequency: 'high'
                },
                skillLevels: { 'lsf-basics': 0.7, 'lsf-grammar': 0.5 },
                completedCourses: ['intro-lsf'],
                inProgressCourses: ['intermediate-lsf'],
                badges: ['first-signs'],
                experience: 150,
                level: 2,
                lastActive: new Date(),
                preferredEnvironments: ['visual', 'tactile'],
                hasFederatedLearningConsent: true,
                skillLevel: CompetencyLevel.INTERMEDIATE,
                skills: {
                    'lsf-basics': 0.7,
                    'lsf-grammar': 0.5,
                    'spatial-awareness': 0.6
                },
                interests: ['lsf-history', 'deaf-culture'],
                metadata: {
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                    learningPathVersion: '2.0',
                    preferredLanguage: 'fr'
                }
            };

            await storage.saveProfile(existingProfile);
            const profile = await manager.getOrCreateProfile(userId);

            expect(profile).toBeDefined();
            expect(profile.userId).toBe(userId);
            expect(profile.skillLevel).toBe(CompetencyLevel.INTERMEDIATE);
            expect(profile.skills?.['lsf-basics']).toBe(0.7);
            expect(profile.profilType).toBe(ProfilType.SOURD);
            expect(profile.interests).toContain('lsf-history');
            expect(profile.hasFederatedLearningConsent).toBe(true);
        });
    });

    describe('updateProfile', () => {
        /**
         * Test: Mise à jour partielle d'un profil
         */
        test('should update an existing profile with partial LSF data', async () => {
            const userId = 'user-to-update';

            await manager.getOrCreateProfile(userId);

            const updatedProfile = await manager.updateProfile(userId, {
                skillLevel: CompetencyLevel.ADVANCED,
                interests: ['lsf-poetry', 'sign-linguistics'],
                profilType: ProfilType.EDUCATEUR
            });

            expect(updatedProfile.skillLevel).toBe(CompetencyLevel.ADVANCED);
            expect(updatedProfile.interests).toEqual(['lsf-poetry', 'sign-linguistics']);
            expect(updatedProfile.profilType).toBe(ProfilType.EDUCATEUR);
            expect(updatedProfile.preferences).toBeDefined();
            expect(updatedProfile.metadata?.lastUpdated).toBeInstanceOf(Date);
        });

        /**
         * Test: Création d'un profil lors de la mise à jour d'un utilisateur inexistant
         */
        test('should create a new profile if updating non-existent profile', async () => {
            const userId = 'non-existent-user';

            const updatedProfile = await manager.updateProfile(userId, {
                skillLevel: CompetencyLevel.EXPERT,
                interests: ['lsf-interpretation'],
                profilType: ProfilType.INTERPRETE
            });

            expect(updatedProfile.userId).toBe(userId);
            expect(updatedProfile.skillLevel).toBe(CompetencyLevel.EXPERT);
            expect(updatedProfile.interests).toEqual(['lsf-interpretation']);
            expect(updatedProfile.profilType).toBe(ProfilType.INTERPRETE);
        });

        /**
         * Test: Gestion correcte des métadonnées
         */
        test('should handle metadata updates correctly with proper typing', async () => {
            const userId = 'user-metadata';

            const initialProfile = await manager.getOrCreateProfile(userId);
            const createdAt = initialProfile.metadata?.createdAt;

            // Attendre un délai fixe pour éviter les problèmes de typage avec setTimeout
            await new Promise<void>(resolve => {
                const timeoutId = setTimeout(() => resolve(), 10);
                // Nettoyer le timeout si nécessaire
                if (timeoutId) {
                    // Le timeout se nettoiera automatiquement
                }
            });

            const updatedProfile = await manager.updateProfile(userId, {
                metadata: {
                    customField: 'lsf-specialized',
                    lastLogin: new Date().toISOString(),
                    preferredLanguage: 'fr',
                    learningPathVersion: '3.0'
                }
            });

            expect(updatedProfile.metadata?.customField).toBe('lsf-specialized');
            expect(updatedProfile.metadata?.lastLogin).toBeDefined();
            expect(updatedProfile.metadata?.preferredLanguage).toBe('fr');
            expect(updatedProfile.metadata?.learningPathVersion).toBe('3.0');
            expect(updatedProfile.metadata?.createdAt).toEqual(createdAt);
            expect(updatedProfile.metadata?.lastUpdated).toBeDefined();

            const lastUpdated = updatedProfile.metadata?.lastUpdated;
            if (lastUpdated) {
                expect(lastUpdated).toBeInstanceOf(Date);
                const timeDiff = Date.now() - lastUpdated.getTime();
                expect(timeDiff).toBeLessThan(10000); // 10 secondes
            }
        });
    });

    describe('updateSkills', () => {
        /**
         * Test: Mise à jour des compétences basée sur les performances LSF
         */
        test('should update LSF skills based on performance data', async () => {
            const userId = 'skill-update-user';

            const performanceData: UserPerformanceData = {
                userId,
                exercises: [
                    {
                        id: 'ex1',
                        conceptId: 'lsf-alphabet',
                        successRate: 0.9,
                        completionTime: 120,
                        attempts: 1
                    },
                    {
                        id: 'ex2',
                        conceptId: 'lsf-spatial-grammar',
                        successRate: 0.6,
                        completionTime: 180,
                        attempts: 3
                    }
                ],
                quizzes: [
                    {
                        id: 'quiz1',
                        conceptIds: ['lsf-alphabet', 'lsf-spatial-grammar'],
                        score: 85,
                        timeSpent: 300
                    }
                ],
                interactionPatterns: {
                    hesitations: ['lsf-spatial-grammar'],
                    repeatedMistakes: ['spatial-reference'],
                    avoidedTopics: []
                },
                lastActivity: new Date()
            };

            const updatedProfile = await manager.updateSkills(userId, performanceData);

            expect(updatedProfile.skills).toBeDefined();
            expect(updatedProfile.skills?.['lsf-alphabet']).toBeGreaterThan(0.6);

            const alphabetSkill = updatedProfile.skills?.['lsf-alphabet'];
            const spatialSkill = updatedProfile.skills?.['lsf-spatial-grammar'];

            if (alphabetSkill && spatialSkill) {
                expect(spatialSkill).toBeLessThan(alphabetSkill);
            }

            expect(updatedProfile.history?.recurringDifficulties).toContain('lsf-spatial-grammar');
            expect(updatedProfile.history?.completedActivities).toContain('ex1');
            expect(updatedProfile.history?.completedActivities).toContain('ex2');
            expect(updatedProfile.history?.totalLearningTime).toBe(300);
        });

        /**
         * Test: Identification correcte des concepts maîtrisés en LSF
         */
        test('should identify mastered LSF concepts correctly', async () => {
            const userId = 'mastery-user';

            await manager.updateProfile(userId, {
                skills: {
                    'lsf-fingerspelling': 0.7,
                    'lsf-numbers': 0.5
                }
            });

            const performanceData: UserPerformanceData = {
                userId,
                exercises: [
                    {
                        id: 'ex1',
                        conceptId: 'lsf-fingerspelling',
                        successRate: 1.0,
                        completionTime: 90,
                        attempts: 1
                    }
                ],
                quizzes: [],
                interactionPatterns: {
                    hesitations: [],
                    repeatedMistakes: [],
                    avoidedTopics: []
                },
                lastActivity: new Date()
            };

            const updatedProfile = await manager.updateSkills(userId, performanceData);

            expect(updatedProfile.skills?.['lsf-fingerspelling']).toBeGreaterThan(0.8);
            expect(updatedProfile.history?.masteredConcepts).toContain('lsf-fingerspelling');
            expect(updatedProfile.history?.masteredConcepts).not.toContain('lsf-numbers');
        });

        /**
         * Test: Calcul correct du niveau de compétence basé sur la moyenne
         */
        test('should calculate correct skill level based on average LSF skills', async () => {
            const userId = 'level-calculation-user';

            const performanceData: UserPerformanceData = {
                userId,
                exercises: [
                    {
                        id: 'ex1',
                        conceptId: 'lsf-basic-signs',
                        successRate: 0.95,
                        completionTime: 100,
                        attempts: 1
                    },
                    {
                        id: 'ex2',
                        conceptId: 'lsf-grammar-rules',
                        successRate: 0.9,
                        completionTime: 100,
                        attempts: 1
                    },
                    {
                        id: 'ex3',
                        conceptId: 'lsf-spatial-concepts',
                        successRate: 0.85,
                        completionTime: 100,
                        attempts: 1
                    }
                ],
                quizzes: [],
                interactionPatterns: {
                    hesitations: [],
                    repeatedMistakes: [],
                    avoidedTopics: []
                },
                lastActivity: new Date()
            };

            const updatedProfile = await manager.updateSkills(userId, performanceData);

            expect(updatedProfile.skillLevel).toBe(CompetencyLevel.ADVANCED);
        });
    });

    describe('updatePreferences', () => {
        /**
         * Test: Mise à jour des préférences d'apprentissage LSF
         */
        test('should update LSF learning preferences correctly', async () => {
            const userId = 'preferences-user';

            await manager.getOrCreateProfile(userId);

            const updatedProfile = await manager.updatePreferences(userId, {
                preferredLearningStyle: LearningStyle.VISUAL,
                pacePreference: 'fast',
                prefersFeedback: false,
                goalOrientation: 'mastery',
                adaptivityLevel: 0.8
            });

            expect(updatedProfile.preferences?.preferredLearningStyle).toBe(LearningStyle.VISUAL);
            expect(updatedProfile.preferences?.pacePreference).toBe('fast');
            expect(updatedProfile.preferences?.prefersFeedback).toBe(false);
            expect(updatedProfile.preferences?.goalOrientation).toBe('mastery');
            expect(updatedProfile.preferences?.adaptivityLevel).toBe(0.8);
        });

        /**
         * Test: Gestion des mises à jour partielles de préférences
         */
        test('should handle partial preference updates for LSF learning', async () => {
            const userId = 'partial-preferences-user';

            const initialPreferences: LearningPreferences = {
                preferredPace: 3,
                preferredLearningStyle: LearningStyle.VISUAL,
                preferredContentTypes: ['video', 'interactive'],
                goalOrientation: 'mastery',
                pacePreference: 'slow',
                assistanceLevel: 0.3,
                adaptivityLevel: 0.3,
                requiresStructure: true,
                prefersFeedback: true
            };

            await manager.updateProfile(userId, {
                preferences: initialPreferences
            });

            const updatedProfile = await manager.updatePreferences(userId, {
                pacePreference: 'moderate',
                assistanceLevel: 0.7
            });

            expect(updatedProfile.preferences?.preferredLearningStyle).toBe(LearningStyle.VISUAL);
            expect(updatedProfile.preferences?.pacePreference).toBe('moderate');
            expect(updatedProfile.preferences?.adaptivityLevel).toBe(0.3);
            expect(updatedProfile.preferences?.assistanceLevel).toBe(0.7);
        });
    });

    describe('trackProgress', () => {
        /**
         * Test: Suivi de la progression d'apprentissage LSF
         */
        test('should track LSF learning progress correctly', async () => {
            const userId = 'progress-user';

            await manager.getOrCreateProfile(userId);

            const progressData: ProgressData = {
                userId,
                activityId: 'lsf-lesson-greetings',
                completionStatus: 'completed',
                score: 85,
                timeSpent: 300,
                masteredConcepts: ['greeting-signs', 'polite-expressions'],
                timestamp: new Date()
            };

            // La méthode trackProgress retourne void, donc nous récupérons le profil après
            await manager.trackProgress(userId, progressData);
            const updatedProfile = await manager.getOrCreateProfile(userId);

            expect(updatedProfile.history?.completedActivities).toContain('lsf-lesson-greetings');
            expect(updatedProfile.history?.masteredConcepts).toContain('greeting-signs');
            expect(updatedProfile.history?.masteredConcepts).toContain('polite-expressions');
            expect(updatedProfile.history?.totalLearningTime).toBeGreaterThan(0);
        });
    });

    describe('deleteUserProfile', () => {
        /**
         * Test: Suppression d'un profil existant
         */
        test('should delete an existing profile', async () => {
            const userId = 'user-to-delete';

            await manager.getOrCreateProfile(userId);
            expect(await storage.profileExists(userId)).toBe(true);

            await manager.deleteUserProfile(userId);
            expect(await storage.profileExists(userId)).toBe(false);
        });

        /**
         * Test: Gestion gracieuse de la suppression d'un profil inexistant
         */
        test('should not throw an error when deleting a non-existent profile', async () => {
            const userId = 'non-existent-user';

            await expect(manager.deleteUserProfile(userId)).resolves.not.toThrow();
        });
    });

    describe('analyzeInterests', () => {
        /**
         * Test: Retour des intérêts existants liés à la LSF
         */
        test('should return existing LSF interests if defined', async () => {
            const userId = 'user-with-interests';

            await manager.updateProfile(userId, {
                interests: ['lsf-history', 'deaf-culture', 'sign-linguistics']
            });

            const interests = await manager.analyzeInterests(userId);

            expect(interests).toEqual(['lsf-history', 'deaf-culture', 'sign-linguistics']);
        });

        /**
         * Test: Déduction des intérêts LSF basée sur les compétences
         */
        test('should deduce LSF interests from skills if not defined', async () => {
            const userId = 'user-without-interests';

            await manager.updateProfile(userId, {
                skills: {
                    'lsf-fingerspelling': 0.8,
                    'lsf-spatial-grammar': 0.7,
                    'lsf-basic-vocabulary': 0.3
                }
            });

            const interests = await manager.analyzeInterests(userId);

            expect(interests).toContain('lsf-fingerspelling');
            expect(interests).toContain('lsf-spatial-grammar');
            expect(interests).not.toContain('lsf-basic-vocabulary');

            const updatedProfile = await manager.getOrCreateProfile(userId);
            expect(updatedProfile.interests).toEqual(interests);
        });
    });

    describe('calculateContentCompatibility', () => {
        /**
         * Test: Calcul de compatibilité basé sur les intérêts LSF
         */
        test('should calculate compatibility based on LSF interests overlap', async () => {
            const userId = 'compatibility-user';

            await manager.updateProfile(userId, {
                interests: ['lsf-grammar', 'spatial-reference', 'deaf-culture']
            });

            const highMatch = await manager.calculateContentCompatibility(
                userId,
                ['lsf-grammar', 'spatial-reference', 'sign-linguistics']
            );
            const mediumMatch = await manager.calculateContentCompatibility(
                userId,
                ['lsf-grammar', 'fingerspelling']
            );
            const lowMatch = await manager.calculateContentCompatibility(
                userId,
                ['mathematics', 'history']
            );

            expect(highMatch).toBeGreaterThan(0.6);
            expect(mediumMatch).toBeGreaterThan(0.3);
            expect(mediumMatch).toBeLessThan(0.6);
            expect(lowMatch).toBe(0);
        });

        /**
         * Test: Analyse automatique des intérêts LSF si non définis
         */
        test('should analyze LSF interests first if none defined', async () => {
            const userId = 'user-needs-analysis';

            await manager.updateProfile(userId, {
                skills: {
                    'lsf-numbers': 0.9,
                    'lsf-colors': 0.8
                }
            });

            const compatibility = await manager.calculateContentCompatibility(
                userId,
                ['lsf-numbers', 'basic-math-signs']
            );

            expect(compatibility).toBeGreaterThan(0);

            const updatedProfile = await manager.getOrCreateProfile(userId);
            expect(updatedProfile.interests).toBeDefined();
            expect(updatedProfile.interests?.length).toBeGreaterThan(0);
        });
    });

    describe('analyzePreferences', () => {
        /**
         * Test: Analyse des préférences d'apprentissage LSF
         */
        test('should analyze LSF learning preferences correctly', async () => {
            const userId = 'preferences-analysis-user';

            await manager.updateProfile(userId, {
                preferences: {
                    preferredPace: 4,
                    preferredLearningStyle: LearningStyle.VISUAL,
                    preferredContentTypes: ['video', 'interactive'],
                    goalOrientation: 'mastery',
                    pacePreference: 'moderate',
                    assistanceLevel: 0.5,
                    adaptivityLevel: 0.7,
                    requiresStructure: true,
                    prefersFeedback: true
                }
            });

            const preferences = await manager.analyzePreferences(userId);

            expect(preferences.preferredLearningStyle).toBe(LearningStyle.VISUAL);
            expect(preferences.goalOrientation).toBe('mastery');
            expect(preferences.requiresStructure).toBe(true);
            expect(preferences.prefersFeedback).toBe(true);
        });
    });
});