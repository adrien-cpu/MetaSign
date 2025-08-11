/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/legacy/MockServices.ts
 * @description Services mock pour assurer la compatibilité pendant le développement
 * 
 * Ces services mock permettent de faire fonctionner les modules legacy
 * en attendant l'implémentation complète des services réels.
 * 
 * @module legacy
 * @version 1.0.0 - Services mock temporaires
 * @since 2025
 * @author MetaSign Team - CODA Legacy Mock Services
 * @lastModified 2025-08-03
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des types harmonisés - ✅ Correction : Suppression de EvaluationResult inutilisé
import type {
    ExerciseGenerationParams,
    UserReverseProfile
} from '../../types/index';

/**
 * Interface pour les exercices générés
 */
export interface MockGeneratedExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Record<string, unknown>;
    readonly level: string;
    readonly difficulty: number;
}

/**
 * Interface pour les résultats d'évaluation legacy
 */
export interface MockLegacyEvaluationResult {
    readonly score: number;
    readonly feedback: string;
    readonly isCorrect: boolean;
    readonly suggestions: readonly string[];
    readonly timeSpent?: number;
    readonly difficulty?: number;
}

/**
 * Service mock pour ExerciseGeneratorService
 * À remplacer par le vrai service une fois implémenté
 */
export class MockExerciseGeneratorService {
    private static instance: MockExerciseGeneratorService;
    private readonly logger = LoggerFactory.getLogger('MockExerciseGeneratorService');

    private constructor() {
        this.logger.info('🔄 MockExerciseGeneratorService initialisé (mode temporaire)');
    }

    public static getInstance(): MockExerciseGeneratorService {
        if (!MockExerciseGeneratorService.instance) {
            MockExerciseGeneratorService.instance = new MockExerciseGeneratorService();
        }
        return MockExerciseGeneratorService.instance;
    }

    public async generateExercise(params: ExerciseGenerationParams): Promise<MockGeneratedExercise> {
        this.logger.debug('🎯 Génération exercice mock', { params });

        // Simulation d'un exercice généré
        const exercise: MockGeneratedExercise = {
            id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: params.type,
            content: {
                instruction: `Exercice ${params.type} de niveau ${params.level}`,
                difficulty: params.difficulty,
                focusAreas: params.focusAreas || [],
                mockGenerated: true
            },
            level: params.level,
            difficulty: params.difficulty
        };

        // Simuler un délai de génération
        await new Promise(resolve => setTimeout(resolve, 100));

        this.logger.debug('✅ Exercice mock généré', { exerciseId: exercise.id });
        return exercise;
    }

    public async getExerciseById(exerciseId: string): Promise<MockGeneratedExercise | null> {
        this.logger.debug('🔍 Recherche exercice mock', { exerciseId });

        // Simuler la récupération d'un exercice
        if (exerciseId.startsWith('mock_')) {
            return {
                id: exerciseId,
                type: 'mock_exercise',
                content: {
                    instruction: 'Exercice mock récupéré',
                    mockRetrieved: true
                },
                level: 'A1',
                difficulty: 0.5
            };
        }

        return null;
    }

    public async evaluateResponse(
        exercise: MockGeneratedExercise,
        response: unknown
    ): Promise<MockLegacyEvaluationResult> {
        this.logger.debug('📊 Évaluation réponse mock', {
            exerciseId: exercise.id,
            responseType: typeof response
        });

        // Simulation d'une évaluation
        const score = Math.random() * 0.4 + 0.6; // Score entre 0.6 et 1.0
        const isCorrect = score >= 0.7;

        const evaluation: MockLegacyEvaluationResult = {
            score,
            feedback: isCorrect
                ? 'Excellente réponse ! Continuez ainsi.'
                : 'Bonne tentative, mais il y a quelques points à améliorer.',
            isCorrect,
            suggestions: isCorrect
                ? ['Essayez un exercice plus difficile']
                : ['Révisez les concepts de base', 'Pratiquez davantage'],
            timeSpent: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
            difficulty: exercise.difficulty
        };

        this.logger.debug('✅ Évaluation mock complétée', {
            score: evaluation.score.toFixed(2),
            isCorrect: evaluation.isCorrect
        });

        return evaluation;
    }
}

/**
 * Service mock pour ExerciseAdapter
 * À remplacer par le vrai service une fois implémenté
 */
export class MockExerciseAdapter {
    private readonly logger = LoggerFactory.getLogger('MockExerciseAdapter');

    constructor() {
        this.logger.info('🔄 MockExerciseAdapter initialisé (mode temporaire)');
    }

    public async adaptExercise(
        exercise: MockGeneratedExercise,
        userProfile: UserReverseProfile,
        simulateErrors: boolean = false,
        errorRate?: number
    ): Promise<{
        id: string;
        type: string;
        content: Record<string, unknown>;
    }> {
        this.logger.debug('🎯 Adaptation exercice mock', {
            exerciseId: exercise.id,
            userId: userProfile.userId,
            simulateErrors
        });

        // ✅ Correction : Création de l'objet adaptedContent avec typage correct
        const adaptedContent: Record<string, unknown> = {
            ...exercise.content,
            adaptedForUser: userProfile.userId,
            adaptedLevel: userProfile.currentLevel,
            adaptedStyle: userProfile.learningStyle,
            culturalAdaptation: userProfile.culturalBackground,
            simulatedErrors: simulateErrors ? (errorRate || 0) : 0,
            adaptationTimestamp: new Date().toISOString()
        };

        // ✅ Correction : Ajouter simulatedErrorTypes conditionnellement
        if (simulateErrors && errorRate && errorRate > 0) {
            adaptedContent.simulatedErrorTypes = [
                'spatial_reference_error',
                'movement_timing_error'
            ];
        }

        const adaptedExercise = {
            id: exercise.id,
            type: exercise.type,
            content: adaptedContent
        };

        this.logger.debug('✅ Exercice mock adapté', {
            exerciseId: exercise.id,
            adaptationsApplied: Object.keys(adaptedContent).length
        });

        return adaptedExercise;
    }
}

/**
 * Factory pour créer les services mock
 */
export class MockServiceFactory {
    private static readonly logger = LoggerFactory.getLogger('MockServiceFactory');

    /**
     * Crée une instance du service de génération d'exercices mock
     */
    public static createExerciseGeneratorService(): MockExerciseGeneratorService {
        this.logger.info('🏭 Création ExerciseGeneratorService mock');
        return MockExerciseGeneratorService.getInstance();
    }

    /**
     * Crée une instance de l'adaptateur d'exercices mock
     */
    public static createExerciseAdapter(): MockExerciseAdapter {
        this.logger.info('🏭 Création ExerciseAdapter mock');
        return new MockExerciseAdapter();
    }
}

/**
 * Configuration pour basculer entre services mock et réels
 */
export const MOCK_CONFIG = {
    USE_MOCK_EXERCISE_GENERATOR: true,
    USE_MOCK_EXERCISE_ADAPTER: true,
    MOCK_MODE_WARNING: true
} as const;

/**
 * Utilitaire pour vérifier si les services mock sont activés
 */
export function isMockMode(): boolean {
    return MOCK_CONFIG.USE_MOCK_EXERCISE_GENERATOR || MOCK_CONFIG.USE_MOCK_EXERCISE_ADAPTER;
}

/**
 * Affiche un avertissement si les services mock sont utilisés
 */
export function warnIfMockMode(): void {
    if (MOCK_CONFIG.MOCK_MODE_WARNING && isMockMode()) {
        const logger = LoggerFactory.getLogger('MockServices');
        logger.warn('⚠️ ATTENTION: Services mock utilisés en mode développement', {
            exerciseGenerator: MOCK_CONFIG.USE_MOCK_EXERCISE_GENERATOR,
            exerciseAdapter: MOCK_CONFIG.USE_MOCK_EXERCISE_ADAPTER,
            recommendation: 'Remplacer par les vrais services en production'
        });
    }
}