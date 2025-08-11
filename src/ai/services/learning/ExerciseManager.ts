/**
 * @file src/ai/services/learning/ExerciseManager.ts
 * @description Gestionnaire d'exercices et d'évaluations d'apprentissage
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { EventBus } from '@/ai/services/learning/shared/events/EventBus';
import { LearningServiceConfig } from '@/ai/services/learning/types';
import { ReverseApprenticeshipSystem } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/types';
import {
    ExerciseGeneratorService,
    Exercise,
    EvaluationResult,
    ExerciseGenerationParams,
    SupportedExerciseType,
    CECRLLevel
} from '@/ai/services/learning/human/coda/codavirtuel/exercises';
import { LearningPyramidIntegration } from '@/ai/services/learning/integration/pyramid/LearningPyramidIntegration';
import { ServiceAdapter, ServiceAdapterFactory } from '@/ai/services/learning/interfaces';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ExtendedEvaluationResult } from './LearningService';

/**
 * Interface compatible avec ExtendedEvaluationResult pour la gamification
 * Compatible avec la définition dans LearningService.ts
 */
interface ExtendedEvaluationGamification {
    pointsEarned: number;
    achievements?: string[];
    levelUp?: boolean;
    newLevel?: number;
}

/**
 * Interface pour les données de gamification avec signature d'index
 */
interface GamificationResultData extends Record<string, unknown> {
    readonly pointsEarned: number;
    readonly achievements?: string[];
    readonly badges?: string[];
    readonly levelUp?: boolean;
    readonly newLevel?: number;
}

/**
 * Interface pour un service de gamification compatible avec BaseService
 */
interface GamificationService {
    processExerciseResult(
        userId: string,
        exerciseId: string,
        result: EvaluationResult
    ): Promise<GamificationResultData | null>;
}

/**
 * @class ExerciseManager
 * @description Gère la génération et l'évaluation des exercices avec intégration de services modulaires
 */
export class ExerciseManager {
    private readonly logger = LoggerFactory.getLogger('ExerciseManager');
    private readonly registry: LearningServiceRegistry;
    private readonly eventBus: EventBus;
    private readonly config: LearningServiceConfig;
    private reverseApprenticeshipService: ServiceAdapter<ReverseApprenticeshipSystem> | null = null;
    private exerciseGeneratorService: ServiceAdapter<ExerciseGeneratorService> | null = null;
    private pyramidIntegrationService: ServiceAdapter<LearningPyramidIntegration> | null = null;
    private gamificationService: GamificationService | null = null;

    /**
     * @constructor
     * @param registry Registre des services
     * @param eventBus Bus d'événements
     * @param config Configuration du service d'apprentissage
     */
    constructor(
        registry: LearningServiceRegistry,
        eventBus: EventBus,
        config: LearningServiceConfig
    ) {
        this.registry = registry;
        this.eventBus = eventBus;
        this.config = config;

        this.initializeServices();
    }

    /**
     * Initialise les services depuis le registre en utilisant des adaptateurs
     * @private
     */
    private initializeServices(): void {
        try {
            // Récupérer les services avec adaptation BaseService
            this.exerciseGeneratorService = this.getServiceWithAdapter<ExerciseGeneratorService>(
                'exerciseGenerator',
                'ExerciseGeneratorService'
            );

            this.reverseApprenticeshipService = this.getServiceWithAdapter<ReverseApprenticeshipSystem>(
                'reverseApprenticeship',
                'ReverseApprenticeshipSystem'
            );

            this.pyramidIntegrationService = this.getServiceWithAdapter<LearningPyramidIntegration>(
                'pyramidIntegration',
                'LearningPyramidIntegration'
            );

            this.gamificationService = this.getServiceSafely<GamificationService>('gamification');

            this.logger.info('Services initialized', {
                exerciseGenerator: !!this.exerciseGeneratorService,
                reverseApprenticeship: !!this.reverseApprenticeshipService,
                pyramidIntegration: !!this.pyramidIntegrationService,
                gamification: !!this.gamificationService
            });
        } catch (error) {
            this.logger.error('Error initializing services', { error });
        }
    }

    /**
     * Récupère un service du registre et l'enveloppe dans un adaptateur BaseService
     * @param serviceName Nom du service
     * @param displayName Nom d'affichage pour les logs
     * @returns Service adapté ou null si indisponible
     * @private
     */
    private getServiceWithAdapter<T = unknown>(serviceName: string, displayName: string): ServiceAdapter<T> | null {
        try {
            const service = this.registry.getService<T>(serviceName);
            if (!service) {
                this.logger.warn(`Service ${displayName} not found in registry`);
                return null;
            }

            // Vérifier si le service implémente déjà BaseService
            if (ServiceAdapterFactory.implementsBaseService(service)) {
                // Créer un adaptateur wrapper pour maintenir la cohérence
                return ServiceAdapterFactory.createAdapter(service, displayName);
            }

            // Créer un adaptateur pour les services non-BaseService
            return ServiceAdapterFactory.createAdapter(service, displayName);
        } catch (error) {
            this.logger.warn(`Service ${displayName} not available`, { error });
            return null;
        }
    }

    /**
     * Récupère un service du registre de façon sécurisée
     * @param serviceName Nom du service
     * @returns Service ou null si indisponible
     * @private
     */
    private getServiceSafely<T = unknown>(serviceName: string): T | null {
        try {
            return this.registry.getService<T>(serviceName) || null;
        } catch (error) {
            this.logger.warn(`Service ${serviceName} not available`, { error });
            return null;
        }
    }

    /**
     * Génère un exercice adapté pour un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @param sessionId Identifiant de la session
     * @param exerciseType Type d'exercice (optionnel)
     * @returns Exercice généré
     * @throws {Error} Si aucun service de génération n'est disponible
     */
    public async generateExercise(
        userId: string,
        sessionId: string,
        exerciseType?: string
    ): Promise<Exercise> {
        this.logger.info('Generating exercise', {
            userId,
            sessionId,
            exerciseType
        });

        // Vérifier la validité de la session
        this.validateSession(sessionId);

        // Utiliser le système d'apprentissage inversé si disponible
        if (this.reverseApprenticeshipService) {
            const reverseSystem = this.reverseApprenticeshipService.getWrappedService();
            const exercise = await reverseSystem.generateExercise(
                userId,
                exerciseType
            );

            // Enrichir l'exercice avec l'intégration pyramide IA si disponible
            if (this.pyramidIntegrationService) {
                await this.enrichExerciseWithPyramid(exercise, userId);
            }

            return exercise;
        }

        // Utiliser le générateur d'exercices standard
        if (this.exerciseGeneratorService) {
            const exerciseGenerator = this.exerciseGeneratorService.getWrappedService();
            const params = this.createExerciseParams(exerciseType, userId);
            return await exerciseGenerator.generateExercise(params);
        }

        throw new Error('No exercise generation service available');
    }

    /**
     * Évalue la réponse d'un utilisateur à un exercice
     * @param userId Identifiant de l'utilisateur
     * @param sessionId Identifiant de la session
     * @param exerciseId Identifiant de l'exercice
     * @param response Réponse de l'utilisateur
     * @returns Résultat de l'évaluation
     */
    public async evaluateResponse(
        userId: string,
        sessionId: string,
        exerciseId: string,
        response: unknown
    ): Promise<ExtendedEvaluationResult> {
        this.logger.info('Evaluating response', {
            userId,
            sessionId,
            exerciseId
        });

        // Vérifier la validité de la session
        this.validateSession(sessionId);

        let result: EvaluationResult;

        // Utiliser le système d'apprentissage inversé si disponible
        if (this.reverseApprenticeshipService) {
            const reverseSystem = this.reverseApprenticeshipService.getWrappedService();
            result = await reverseSystem.evaluateResponse(
                userId,
                exerciseId,
                response
            );
        } else if (this.exerciseGeneratorService) {
            result = await this.evaluateWithStandardGenerator(exerciseId, response);
        } else {
            throw new Error('No exercise evaluation service available');
        }

        // Publier l'événement de complétion d'exercice
        this.publishExerciseEvent(sessionId, userId, exerciseId, result);

        // Traiter la gamification si activée
        if (this.config.enableGamification && this.gamificationService) {
            return await this.processGamification(userId, exerciseId, result);
        }

        // Retourner le résultat standard
        return {
            ...result,
            feedback: this.generateFeedback(result)
        };
    }

    /**
     * Évalue le niveau global d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Résultat de l'évaluation de niveau
     */
    public async evaluateUserLevel(userId: string): Promise<unknown> {
        if (this.reverseApprenticeshipService) {
            const reverseSystem = this.reverseApprenticeshipService.getWrappedService();
            return await reverseSystem.evaluateUserLevel(userId);
        }
        throw new Error('Level evaluation service not available');
    }

    /**
     * Récupère le profil d'apprentissage d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Profil d'apprentissage
     */
    public async getUserProfile(userId: string): Promise<UserReverseProfile | undefined> {
        if (this.reverseApprenticeshipService) {
            const reverseSystem = this.reverseApprenticeshipService.getWrappedService();
            return await reverseSystem.initializeUserProfile(userId);
        }
        return undefined;
    }

    /**
     * Crée les paramètres d'exercice avec types stricts
     * @param exerciseType Type d'exercice
     * @param userId Identifiant utilisateur
     * @returns Paramètres d'exercice valides
     * @private
     */
    private createExerciseParams(exerciseType: string | undefined, userId: string): ExerciseGenerationParams {
        // Assurer la compatibilité avec SupportedExerciseType
        const validType: SupportedExerciseType = this.isValidExerciseType(exerciseType)
            ? exerciseType
            : 'MultipleChoice';

        // Assurer la compatibilité avec CECRLLevel
        const validLevel: CECRLLevel = this.isValidCECRLLevel(this.config.defaultInitialLevel)
            ? this.config.defaultInitialLevel
            : 'A1';

        return {
            type: validType,
            level: validLevel,
            difficulty: 0.5,
            userId
        };
    }

    /**
     * Vérifie si un type d'exercice est valide
     * @param type Type à vérifier
     * @returns True si le type est valide
     * @private
     */
    private isValidExerciseType(type: string | undefined): type is SupportedExerciseType {
        const validTypes: readonly string[] = [
            'MultipleChoice',
            'DragDrop',
            'FillBlank',
            'TextEntry',
            'VideoResponse',
            'SigningPractice'
        ];
        return type !== undefined && validTypes.includes(type);
    }

    /**
     * Vérifie si un niveau CECRL est valide
     * @param level Niveau à vérifier
     * @returns True si le niveau est valide
     * @private
     */
    private isValidCECRLLevel(level: string | undefined): level is CECRLLevel {
        const validLevels: readonly string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return level !== undefined && validLevels.includes(level);
    }

    /**
     * Évalue avec le générateur standard
     * @param exerciseId ID de l'exercice
     * @param response Réponse utilisateur
     * @returns Résultat d'évaluation
     * @private
     */
    private async evaluateWithStandardGenerator(
        exerciseId: string,
        response: unknown
    ): Promise<EvaluationResult> {
        if (!this.exerciseGeneratorService) {
            throw new Error('Exercise generator not available');
        }

        const exerciseGenerator = this.exerciseGeneratorService.getWrappedService();
        const exercise = await exerciseGenerator.getExerciseById(exerciseId);
        if (!exercise) {
            throw new Error(`Exercise ${exerciseId} not found`);
        }

        return await exerciseGenerator.evaluateResponse(exercise, response);
    }

    /**
     * Enrichit un exercice avec l'intégration pyramide
     * @param exercise Exercice à enrichir
     * @param userId ID utilisateur
     * @private
     */
    private async enrichExerciseWithPyramid(exercise: Exercise, userId: string): Promise<void> {
        if (!this.pyramidIntegrationService) return;

        try {
            const pyramidIntegration = this.pyramidIntegrationService.getWrappedService();
            // Vérifier si la méthode enrichExercise existe
            if (pyramidIntegration &&
                typeof pyramidIntegration === 'object' &&
                'enrichExercise' in pyramidIntegration) {
                const enrichMethod = (pyramidIntegration as Record<string, unknown>).enrichExercise;
                if (typeof enrichMethod === 'function') {
                    await (enrichMethod as (exercise: Exercise, userId: string) => Promise<void>).call(
                        pyramidIntegration,
                        exercise,
                        userId
                    );
                }
            }
        } catch (error) {
            this.logger.warn('Failed to enrich exercise with pyramid integration', { error });
        }
    }

    /**
     * Traite la gamification pour un résultat d'exercice
     * @param userId ID utilisateur
     * @param exerciseId ID exercice
     * @param result Résultat d'évaluation
     * @returns Résultat étendu avec gamification
     * @private
     */
    private async processGamification(
        userId: string,
        exerciseId: string,
        result: EvaluationResult
    ): Promise<ExtendedEvaluationResult> {
        if (!this.gamificationService) {
            return {
                ...result,
                feedback: this.generateFeedback(result)
            };
        }

        try {
            const gamificationResult = await this.gamificationService.processExerciseResult(
                userId,
                exerciseId,
                result
            );

            if (gamificationResult) {
                const gamificationData = this.formatGamificationData(gamificationResult);
                return {
                    ...result,
                    gamification: gamificationData,
                    feedback: this.generateFeedback(result, gamificationData)
                };
            }
        } catch (error) {
            this.logger.error('Gamification processing failed', { error });
        }

        return {
            ...result,
            feedback: this.generateFeedback(result)
        };
    }

    /**
     * Formate les données de gamification pour ExtendedEvaluationResult
     * @param result Résultat brut
     * @returns Données formatées compatibles avec ExtendedEvaluationResult
     * @private
     */
    private formatGamificationData(result: GamificationResultData): ExtendedEvaluationGamification {
        const data: ExtendedEvaluationGamification = {
            pointsEarned: result.pointsEarned
        };

        // Ajouter les propriétés optionnelles seulement si elles existent
        if (result.achievements) {
            data.achievements = result.achievements;
        }
        if (result.levelUp !== undefined) {
            data.levelUp = result.levelUp;
        }
        if (result.newLevel !== undefined) {
            data.newLevel = result.newLevel;
        }

        return data;
    }

    /**
     * Publie un événement de complétion d'exercice
     * @param sessionId ID session
     * @param userId ID utilisateur
     * @param exerciseId ID exercice
     * @param result Résultat
     * @private
     */
    private publishExerciseEvent(
        sessionId: string,
        userId: string,
        exerciseId: string,
        result: EvaluationResult
    ): void {
        this.eventBus.publish('exercise.completed', {
            sessionId,
            userId,
            exerciseId,
            score: result.score,
            timestamp: new Date()
        });
    }

    /**
     * Génère un feedback basé sur les résultats d'évaluation et de gamification
     * @param result Résultat de l'évaluation
     * @param gamificationResult Résultat de gamification (optionnel)
     * @returns Message de feedback
     * @private
     */
    private generateFeedback(
        result: EvaluationResult,
        gamificationResult?: ExtendedEvaluationGamification
    ): string {
        // Base du feedback sur le score
        let feedback = result.correct
            ? "Excellent travail ! Votre réponse est correcte."
            : "Votre réponse n'est pas tout à fait exacte. Continuez vos efforts !";

        // Ajouter l'explication si disponible
        if (result.explanation) {
            feedback += ` ${result.explanation}`;
        }

        // Ajouter des informations de gamification si disponibles
        if (gamificationResult) {
            feedback += ` Vous avez gagné ${gamificationResult.pointsEarned} points.`;

            if (gamificationResult.levelUp) {
                feedback += ` Félicitations, vous avez atteint le niveau ${gamificationResult.newLevel || 'supérieur'} !`;
            }
        }

        return feedback;
    }

    /**
     * Valide l'existence d'une session
     * @param sessionId Identifiant de la session
     * @throws {Error} si la session n'existe pas
     * @private
     */
    private validateSession(sessionId: string): void {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        // Validation supplémentaire avec SessionManager pourrait être ajoutée ici
    }
}