/**
 * @file test-setup.ts
 * @description Configuration globale pour les tests Jest
 * 
 * Fournit:
 * - Configuration des matchers personnalisés
 * - Setup des mocks globaux
 * - Utilitaires de test partagés
 * - Configuration de l'environnement de test
 * 
 * @author MetaSign Team - Test Configuration
 * @version 1.0.0
 */

import '@testing-library/jest-dom';

// Configuration globale des timeouts
jest.setTimeout(30000); // 30 secondes pour les tests d'intégration

// Mock des APIs externes si nécessaires
global.console = {
    ...console,
    // Réduire le bruit dans les tests sauf pour les erreurs
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error,
    debug: jest.fn(),
};

// Mock Date.now pour la reproductibilité des tests
const mockDateNow = jest.spyOn(Date, 'now');
const FIXED_TIMESTAMP = new Date('2024-01-01T10:00:00.000Z').getTime();

// Mock des APIs du navigateur pour Node.js
Object.defineProperty(global, 'requestAnimationFrame', {
    writable: true,
    value: jest.fn((cb: FrameRequestCallback) => setTimeout(cb, 16))
});

Object.defineProperty(global, 'cancelAnimationFrame', {
    writable: true,
    value: jest.fn((id: number) => clearTimeout(id))
});

// Mock de performance.now()
Object.defineProperty(global, 'performance', {
    writable: true,
    value: {
        now: jest.fn(() => Date.now())
    }
});

beforeEach(() => {
    mockDateNow.mockReturnValue(FIXED_TIMESTAMP);
});

afterEach(() => {
    mockDateNow.mockRestore();
});

// Matchers personnalisés pour les tests CODA
expect.extend({
    toBeValidCECRLLevel(received: string) {
        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const pass = validLevels.includes(received);
        
        return {
            message: () => 
                pass 
                    ? `Expected ${received} not to be a valid CECRL level`
                    : `Expected ${received} to be a valid CECRL level (${validLevels.join(', ')})`,
            pass,
        };
    },

    toBeValidAIPersonality(received: string) {
        const validPersonalities = [
            'curious_student', 'shy_learner', 'energetic_pupil',
            'patient_apprentice', 'analytical_learner', 'creative_thinker'
        ];
        const pass = validPersonalities.includes(received);
        
        return {
            message: () => 
                pass 
                    ? `Expected ${received} not to be a valid AI personality type`
                    : `Expected ${received} to be a valid AI personality type (${validPersonalities.join(', ')})`,
            pass,
        };
    },

    toBeValidLSFErrorType(received: string) {
        const validErrorTypes = [
            'hand_shape_error', 'movement_error', 'placement_error', 'orientation_error',
            'facial_expression_error', 'head_movement_error', 'eye_gaze_error',
            'syntax_error', 'temporal_error', 'modal_error',
            'sign_confusion', 'neologism', 'regional_variant',
            'reference_error', 'cohesion_error', 'pragmatic_error'
        ];
        const pass = validErrorTypes.includes(received);
        
        return {
            message: () => 
                pass 
                    ? `Expected ${received} not to be a valid LSF error type`
                    : `Expected ${received} to be a valid LSF error type`,
            pass,
        };
    },

    toHaveValidUserProfile(received: any) {
        const requiredFields = [
            'currentLevel', 'progressHistory', 'strengths', 'weaknesses',
            'learningPreferences', 'culturalBackground', 'motivationFactors',
            'learningStyle', 'sessionCount', 'totalLearningTime', 'lastActivity'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in received));
        const pass = missingFields.length === 0;
        
        return {
            message: () => 
                pass 
                    ? `Expected user profile not to have all required fields`
                    : `Expected user profile to have all required fields. Missing: ${missingFields.join(', ')}`,
            pass,
        };
    },

    toHaveValidSessionData(received: any) {
        const requiredFields = [
            'sessionId', 'teacherId', 'aiStudentId', 'startTime',
            'content', 'aiReactions', 'metrics', 'status'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in received));
        const pass = missingFields.length === 0;
        
        return {
            message: () => 
                pass 
                    ? `Expected session data not to have all required fields`
                    : `Expected session data to have all required fields. Missing: ${missingFields.join(', ')}`,
            pass,
        };
    }
});

// Déclaration des types pour TypeScript
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidCECRLLevel(): R;
            toBeValidAIPersonality(): R;
            toBeValidLSFErrorType(): R;
            toHaveValidUserProfile(): R;
            toHaveValidSessionData(): R;
        }
    }
}

// Utilitaires de test réutilisables
export const TestHelpers = {
    /**
     * Génère des données utilisateur de test valides
     */
    createTestUser: (overrides: Partial<any> = {}) => ({
        id: `test-user-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Test User',
        email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
        profile: {
            currentLevel: 'A2',
            progressHistory: [],
            strengths: ['vocabulaire_base'],
            weaknesses: ['grammaire_complexe'],
            learningPreferences: ['visual'],
            culturalBackground: 'deaf_family_home',
            motivationFactors: ['family_communication'],
            learningStyle: 'visual',
            sessionCount: 0,
            totalLearningTime: 0,
            lastActivity: new Date(),
            ...overrides.profile
        },
        preferences: {
            language: 'fr',
            theme: 'light',
            notifications: true,
            difficultyPreference: 'adaptive',
            ...overrides.preferences
        },
        metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: new Date(),
            deviceInfo: 'Test Environment',
            timezone: 'Europe/Paris',
            ...overrides.metadata
        },
        ...overrides
    }),

    /**
     * Génère des données de session de test valides
     */
    createTestSession: (overrides: Partial<any> = {}) => ({
        sessionId: `test-session-${Math.random().toString(36).substr(2, 9)}`,
        teacherId: 'test-teacher-001',
        aiStudentId: 'test-ai-student-001',
        startTime: new Date(),
        content: {
            topic: 'Test Topic',
            targetLevel: 'A2',
            teachingMethod: 'interactive',
            duration: 30,
            materials: ['test-material'],
            exercises: ['test-exercise'],
            visualAids: ['test-visual'],
            ...overrides.content
        },
        aiReactions: {
            comprehension: 0.7,
            textualReactions: ['Test reaction'],
            questions: ['Test question?'],
            errors: [],
            emotion: 'neutral',
            engagementEvolution: [0.6, 0.7],
            strugglingMoments: [],
            ...overrides.aiReactions
        },
        metrics: {
            actualDuration: 30,
            participationRate: 0.8,
            teacherInterventions: 2,
            successScore: 0.75,
            conceptsMastered: ['test-concept'],
            conceptsToReview: [],
            ...overrides.metrics
        },
        status: 'completed',
        ...overrides
    }),

    /**
     * Génère un contexte d'apprenant de test
     */
    createLearnerContext: (overrides: Partial<any> = {}) => ({
        personality: 'curious_student',
        currentLevel: 'A2',
        currentMood: 'neutral',
        strugglingConcepts: [],
        masteredConcepts: ['salutations'],
        recentConcepts: ['famille'],
        sessionDuration: 30,
        fatigueLevel: 0.3,
        concentrationLevel: 0.7,
        ...overrides
    }),

    /**
     * Attend que toutes les promesses en attente soient résolues
     */
    waitForPromises: () => new Promise(setImmediate),

    /**
     * Simule un délai (pour les tests de performance)
     */
    delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Génère des métriques de performance pour les tests
     */
    measurePerformance: async (operation: () => Promise<any>) => {
        const start = Date.now();
        const result = await operation();
        const duration = Date.now() - start;
        
        return {
            result,
            duration,
            isAcceptable: duration < 1000 // Moins d'1 seconde acceptable par défaut
        };
    },

    /**
     * Valide la structure d'un objet SimulatedError
     */
    validateSimulatedError: (error: any) => {
        const requiredFields = [
            'id', 'type', 'originalSign', 'errorSign', 'description',
            'severity', 'concept', 'correctionHints', 'pedagogicalNote',
            'canBeRepeated', 'relatedConcepts', 'timestamp'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in error));
        return {
            isValid: missingFields.length === 0,
            missingFields,
            error
        };
    }
};

// Setup et cleanup globaux
beforeAll(() => {
    // Configuration globale avant tous les tests
});

afterAll(() => {
    // Nettoyage global après tous les tests
    jest.restoreAllMocks();
});