// src/ai/learning/adapters/__tests__/IntelligentAdapter.test.ts

import { IntelligentAdapter } from '../../../services/learning/personalization/IntelligentAdapter';
import { EngagementPredictionModel, FrustrationPredictionModel } from '../../models/PredictiveModels';
import { EthicalValidator } from '../../ethics/EthicalValidator';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import {
    LearningContext,
    UserProfile,
    CompetencyLevel,
    LearningPreferences,
    LearningStyle
} from '../../types/index';
import { EthicalValidationResult } from '../../types/learning-interfaces';
import { Adaptation } from '../../types/AdaptedContent';

// Mock des dépendances
jest.mock('../../models/PredictiveModels');
jest.mock('../../ethics/EthicalValidator');
jest.mock('@ai/utils/LoggerFactory', () => ({
    LoggerFactory: {
        getLogger: jest.fn().mockReturnValue({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        })
    }
}));

describe('IntelligentAdapter', () => {
    let adapter: IntelligentAdapter;
    let mockEngagementModel: jest.Mocked<EngagementPredictionModel>;
    let mockFrustrationModel: jest.Mocked<FrustrationPredictionModel>;
    let mockEthicalValidator: jest.Mocked<EthicalValidator>;

    let sampleContext: LearningContext;
    let sampleProfile: UserProfile;

    beforeEach(() => {
        // Initialiser les mocks
        mockEngagementModel = new EngagementPredictionModel() as jest.Mocked<EngagementPredictionModel>;
        mockFrustrationModel = new FrustrationPredictionModel() as jest.Mocked<FrustrationPredictionModel>;
        mockEthicalValidator = new EthicalValidator(null as unknown as SystemeControleEthique) as jest.Mocked<EthicalValidator>;

        // Configurer les comportements des mocks
        mockEngagementModel.predict = jest.fn().mockResolvedValue({
            predictedEngagement: 0.7,
            confidence: 0.8,
            factors: ['time_spent', 'completion_rate'],
            timestamp: new Date()
        });

        mockFrustrationModel.predict = jest.fn().mockReturnValue({
            score: 0.3,
            level: 'low',
            confidence: 0.75,
            contributingFactors: ['pace_appropriate'],
            recommendedInterventions: ['monitor_closely'],
            timestamp: new Date()
        });

        mockEthicalValidator.validateAdaptation = jest.fn().mockResolvedValue({
            valid: true
        } as EthicalValidationResult);

        // Initialiser l'adaptateur avec les mocks
        adapter = new IntelligentAdapter(
            mockEngagementModel,
            mockFrustrationModel,
            mockEthicalValidator
        );

        // Préparer des données de test
        sampleContext = {
            userId: 'user-123',
            timestamp: new Date(),
            lastActivityTime: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
            totalTimeSpent: 3600, // 1 hour
            sessionCount: 5,
            completionRate: 0.7,
            averageScore: 75,
            interactionRate: 20,
            pauseFrequency: 0.5,
            errorRate: 0.2,
            performanceTrend: 0.1,
            contentTags: ['math', 'algebra', 'equations'],
            timeSpent: 3600 // Champ requis
        };

        // Création d'un objet LearningPreferences conforme
        const learningPrefs: LearningPreferences = {
            preferredPace: 0.5,
            preferredLearningStyle: LearningStyle.VISUAL,
            preferredContentTypes: ['video', 'interactive'],
            goalOrientation: 'mastery', // Champ obligatoire manquant précédemment
            // Autres champs optionnels
            learningStyle: 'visual',
            pacePreference: 'moderate',
            assistanceLevel: 0.5,
            adaptivityLevel: 0.7,
            prefersFeedback: true,
            controlPreference: 'medium'
        };

        // Création du profil utilisateur conforme à l'interface
        sampleProfile = {
            userId: 'user-123',
            learningPreferences: {
                preferredPace: 0.5,
                preferredLearningStyle: LearningStyle.VISUAL,
                preferredContentTypes: ['video', 'interactive']
            },
            competencies: {
                'math': {
                    level: CompetencyLevel.INTERMEDIATE,
                    lastAssessedAt: new Date(),
                    progress: 70 // 0-100
                },
                'algebra': {
                    level: CompetencyLevel.BEGINNER,
                    lastAssessedAt: new Date(),
                    progress: 60
                },
                'equations': {
                    level: CompetencyLevel.BEGINNER,
                    lastAssessedAt: new Date(),
                    progress: 50
                }
            },
            history: {
                completedActivities: ['math-101', 'algebra-basics'],
                startedButNotCompletedActivities: ['equations-advanced'],
                assessmentResults: {
                    'math-101': 80,
                    'algebra-basics': 75
                },
                masteredConcepts: ['equation_solving', 'variable_substitution'],
                totalLearningTime: 36000 // 10 heures en secondes
            },
            settings: {
                notifications: true,
                assistanceLevel: 7, // 0-10
                dataCollectionConsent: true
            },
            // Champs additionnels pour la compatibilité
            skillLevel: CompetencyLevel.INTERMEDIATE,
            skills: {
                'math': 0.7,
                'algebra': 0.6,
                'equations': 0.5
            },
            interests: ['math', 'physics', 'programming'],
            preferences: learningPrefs
        };
    });

    test('should create multiple adaptations based on context and predictions', async () => {
        const result = await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier que le résultat contient des adaptations
        expect(result.adaptations).toBeDefined();
        expect(result.adaptations.length).toBeGreaterThan(0);

        // Vérifier que les prédictions sont incluses
        expect(result.predictions).toBeDefined();
        expect(result.predictions?.engagement?.predictedEngagement).toBe(0.7);
        expect(result.predictions?.frustration?.score).toBe(0.3);

        // Vérifier que les métadonnées sont correctes
        expect(result.metadata.adaptationCount).toBe(result.adaptations.length);
        expect(result.metadata.confidence).toBeGreaterThan(0);
    });

    test('should adapt difficulty when engagement is low', async () => {
        // Modifier la prédiction d'engagement pour simuler un faible engagement
        mockEngagementModel.predict = jest.fn().mockResolvedValue({
            predictedEngagement: 0.3, // Engagement faible
            confidence: 0.8,
            factors: ['time_spent', 'low_interaction'],
            timestamp: new Date()
        });

        const result = await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier qu'une adaptation de difficulté est présente
        const difficultyAdaptation = result.adaptations.find((a: Adaptation) => a.type === 'difficulty');
        expect(difficultyAdaptation).toBeDefined();

        // Vérifier que l'action est de diminuer la difficulté
        expect(difficultyAdaptation?.action).toBe('decrease');
    });

    test('should provide assistance when frustration is high', async () => {
        // Modifier la prédiction de frustration pour simuler une frustration élevée
        mockFrustrationModel.predict = jest.fn().mockReturnValue({
            score: 0.7, // Frustration élevée
            level: 'high',
            confidence: 0.85,
            contributingFactors: ['repeated_errors', 'increasing_time_per_task'],
            recommendedInterventions: ['provide_detailed_help', 'adjust_difficulty'],
            timestamp: new Date()
        });

        const result = await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier qu'une adaptation d'assistance est présente
        const assistanceAdaptation = result.adaptations.find((a: Adaptation) => a.type === 'assistance');
        expect(assistanceAdaptation).toBeDefined();

        // Vérifier que l'action est de fournir de l'assistance
        expect(assistanceAdaptation?.action).toBe('provide');

        // Vérifier que l'intensité est élevée
        expect(assistanceAdaptation?.intensity).toBeGreaterThan(0.5);
    });

    test('should personalize content based on user preferences', async () => {
        const result = await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier qu'une adaptation de contenu est présente
        const contentAdaptation = result.adaptations.find((a: Adaptation) => a.type === 'content');
        expect(contentAdaptation).toBeDefined();

        // Vérifier que l'action est de personnaliser
        expect(contentAdaptation?.action).toBe('personalize');

        // Vérifier que les métadonnées contiennent le style d'apprentissage
        expect(contentAdaptation?.metadata?.learningStyle).toBe('visual');
    });

    test('should validate adaptations with the ethical validator', async () => {
        await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier que le validateur éthique a été appelé
        expect(mockEthicalValidator.validateAdaptation).toHaveBeenCalled();
    });

    test('should handle rejected adaptations and use alternatives', async () => {
        // Configurer le validateur pour rejeter une adaptation
        mockEthicalValidator.validateAdaptation = jest.fn().mockImplementation((_userId, _context, adaptation) => {
            if (adaptation.type === 'difficulty') {
                return Promise.resolve({
                    valid: false,
                    issues: [{
                        type: 'equity',
                        description: 'Could create inequities between learners',
                        severity: 'medium'
                    }],
                    suggestions: [{
                        type: 'difficulty',
                        action: 'maintain',
                        intensity: 0.2,
                        explanation: 'Maintien du niveau avec légère adaptation',
                        overridable: true
                    }]
                } as EthicalValidationResult);
            }
            return Promise.resolve({ valid: true } as EthicalValidationResult);
        });

        // Forcer une adaptation de difficulté
        mockEngagementModel.predict = jest.fn().mockResolvedValue({
            predictedEngagement: 0.2,
            confidence: 0.8,
            factors: ['low_engagement'],
            timestamp: new Date()
        });

        const result = await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier si l'alternative a été utilisée
        const difficultyAdaptation = result.adaptations.find((a: Adaptation) => a.type === 'difficulty');
        expect(difficultyAdaptation).toBeDefined();
        expect(difficultyAdaptation?.action).toBe('maintain');
    });

    test('should provide fallback adaptations in case of error', async () => {
        // Forcer une erreur dans le modèle de prédiction
        mockEngagementModel.predict = jest.fn().mockRejectedValue(
            new Error('Prediction failed')
        );

        const result = await adapter.adapt(sampleContext, sampleProfile);

        // Vérifier qu'une adaptation de secours est fournie
        expect(result.adaptations).toHaveLength(1);
        expect(result.adaptations[0].type).toBe('assistance');
        expect(result.adaptations[0].metadata?.isFallback).toBe(true);

        // Vérifier que le contexte inclut le flag d'erreur
        expect(result.context.hasError).toBe(true);

        // Vérifier que les métadonnées incluent l'erreur
        expect(result.metadata.error).toBeDefined();
    });

    test('should adjust adaptation intensities based on user preferences', async () => {
        // Créer un objet LearningPreferences complet avec faible adaptativité
        const lowAdaptivityPrefs: LearningPreferences = {
            preferredPace: 0.5,
            preferredLearningStyle: LearningStyle.VISUAL,
            preferredContentTypes: ['video', 'interactive'],
            goalOrientation: 'mastery',
            adaptivityLevel: 0.3, // Préférence pour une adaptativité faible
            controlPreference: 'high' // Préférence pour un contrôle élevé
        };

        // Définir des préférences utilisateur avec une adaptativité faible
        const lowAdaptivityProfile: UserProfile = {
            ...sampleProfile,
            preferences: lowAdaptivityPrefs
        };

        const standardResult = await adapter.adapt(sampleContext, sampleProfile);
        const lowAdaptivityResult = await adapter.adapt(sampleContext, lowAdaptivityProfile);

        // Trouver des adaptations du même type dans les deux résultats
        const findMatchingAdaptations = (type: string) => {
            return {
                standard: standardResult.adaptations.find((a: Adaptation) => a.type === type),
                lowAdaptivity: lowAdaptivityResult.adaptations.find((a: Adaptation) => a.type === type)
            };
        };

        // Comparer les intensités pour les adaptations de contenu
        const contentAdaptations = findMatchingAdaptations('content');
        if (contentAdaptations.standard && contentAdaptations.lowAdaptivity) {
            // L'intensité devrait être plus faible pour le profil à faible adaptativité
            const standardIntensity = contentAdaptations.standard.intensity || 0;
            const lowAdaptivityIntensity = contentAdaptations.lowAdaptivity.intensity || 0;
            expect(lowAdaptivityIntensity).toBeLessThan(standardIntensity);
        }
    });
});