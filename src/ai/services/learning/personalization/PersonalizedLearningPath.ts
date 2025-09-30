/**
 * Service de personnalisation des parcours d'apprentissage - Version refactorisée
 * 
 * @file src/ai/services/learning/personalization/PersonalizedLearningPath.ts
 * @module ai/services/learning/personalization
 * @description Service principal pour la génération et gestion des parcours d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-22
 */

// Types et interfaces
import type {
    PersonalizedLearningPathModel,
    PathGenerationOptions,
    PathStatistics,
    StepGeneratorConfig,
    CECRLLevel
} from '@learning/types/LearningPathTypes';

import type { UserReverseProfile } from '@learning/human/coda/codavirtuel/types';
import type { LearningMetricsCollector } from '@learning/metrics/LearningMetricsCollector';
import type { MetricsAnalyzer } from '@learning/metrics/MetricsAnalyzer';

// Utilitaires et services
import { LearningPathTypeUtils, LEARNING_PATH_CONSTANTS } from '@learning/types/LearningPathTypes';
import { PathStepGenerator } from './generators/PathStepGenerator';
import { PathProgressManager } from './managers/PathProgressManager';
import { PathCacheManager } from './cache/PathCacheManager';
import { PathValidationService } from './validation/PathValidationService';
import { Logger } from '@ai/utils/Logger';

/**
 * Configuration pour le service de parcours personnalisés
 * Compatible avec exactOptionalPropertyTypes: true
 * 
 * @interface PersonalizedLearningPathConfig
 */
interface PersonalizedLearningPathConfig {
    /** Activer la génération automatique d'identifiants */
    readonly enableAutoIdGeneration: boolean;
    /** Taille maximale du cache */
    readonly maxCacheSize: number;
    /** Durée de vie du cache (ms) */
    readonly cacheTTL: number;
    /** Activer l'adaptation automatique */
    readonly enableAutoAdaptation: boolean;
}

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: PersonalizedLearningPathConfig = {
    enableAutoIdGeneration: true,
    maxCacheSize: 100,
    cacheTTL: 30 * 60 * 1000, // 30 minutes
    enableAutoAdaptation: true
} as const;

/**
 * Résultat d'adaptation de parcours
 * 
 * @interface PathAdaptationResult
 */
interface PathAdaptationResult {
    /** Parcours adapté */
    readonly adaptedPath: PersonalizedLearningPathModel;
    /** Liste des changements apportés */
    readonly changes: readonly string[];
    /** Indicateur de succès */
    readonly success: boolean;
}

/**
 * Service de gestion des parcours d'apprentissage personnalisés
 * Respecte les principes SOLID et les bonnes pratiques du projet LSF
 * 
 * @class PersonalizedLearningPath
 * @example
 * ```typescript
 * const service = new PersonalizedLearningPath(metricsCollector, metricsAnalyzer);
 * const path = await service.generatePath(userId, profile, options);
 * console.log(`Parcours "${path.name}" créé avec ${path.steps.length} étapes`);
 * ```
 */
export class PersonalizedLearningPath {
    private readonly logger = Logger.getInstance('PersonalizedLearningPath');
    private readonly config: PersonalizedLearningPathConfig;
    private readonly stepGenerator: PathStepGenerator;
    private readonly progressManager: PathProgressManager;
    private readonly cacheManager: PathCacheManager;
    private readonly validationService: PathValidationService;

    /**
     * Constructeur du service de parcours personnalisés
     * 
     * @param metricsCollector - Collecteur de métriques (optionnel)
     * @param metricsAnalyzer - Analyseur de métriques (optionnel)
     * @param config - Configuration du service (optionnelle)
     */
    constructor(
        private readonly metricsCollector?: LearningMetricsCollector,
        private readonly metricsAnalyzer?: MetricsAnalyzer,
        config?: Partial<PersonalizedLearningPathConfig>
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.stepGenerator = new PathStepGenerator();
        this.progressManager = new PathProgressManager({
            enableAutoAdaptation: this.config.enableAutoAdaptation
        });
        this.cacheManager = new PathCacheManager({
            maxSize: this.config.maxCacheSize,
            ttl: this.config.cacheTTL
        });
        this.validationService = new PathValidationService();

        this.logger.info('PersonalizedLearningPath initialisé', this.config);
    }

    /**
     * Génère un parcours d'apprentissage personnalisé
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param profile - Profil d'apprentissage de l'utilisateur
     * @param options - Options de génération du parcours
     * @returns Promise<PersonalizedLearningPathModel> Parcours d'apprentissage généré
     * 
     * @throws {Error} Si les paramètres ne sont pas valides ou si la génération échoue
     * 
     * @example
     * ```typescript
     * const path = await service.generatePath('user-123', profile, {
     *     targetLevel: 'A2',
     *     mode: 'balanced',
     *     intensity: 3
     * });
     * ```
     */
    public async generatePath(
        userId: string,
        profile: UserReverseProfile,
        options: PathGenerationOptions
    ): Promise<PersonalizedLearningPathModel> {
        this.logger.info('Génération d\'un nouveau parcours', {
            userId,
            currentLevel: profile.currentLevel,
            targetLevel: options.targetLevel,
            mode: options.mode
        });

        try {
            // Validation des paramètres
            this.validationService.validateGenerationParams(userId, profile, options);

            // Création du modèle de base du parcours
            const pathModel = this.createBasePathModel(userId, profile, options);

            // Configuration du générateur d'étapes
            const generatorConfig: StepGeneratorConfig = {
                profile,
                path: pathModel,
                options,
                mode: options.mode ?? 'balanced',
                intensity: options.intensity ?? LEARNING_PATH_CONSTANTS.DEFAULT_INTENSITY
            };

            // Génération des étapes
            const steps = await this.stepGenerator.generateAllSteps(generatorConfig);
            pathModel.steps.push(...steps);

            // Mise à jour initiale des statuts
            this.progressManager.updateStepsStatus(pathModel);

            // Mise en cache
            this.cacheManager.set(pathModel.id, pathModel);

            this.logger.info('Parcours généré avec succès', {
                pathId: pathModel.id,
                totalSteps: pathModel.steps.length,
                estimatedDuration: this.calculateTotalDuration(pathModel.steps)
            });

            return pathModel;

        } catch (error) {
            this.logger.error('Erreur lors de la génération du parcours', {
                userId,
                targetLevel: options.targetLevel,
                error
            });
            throw new Error(`Génération du parcours échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Obtient un parcours d'apprentissage existant
     * 
     * @param pathId - Identifiant du parcours
     * @returns PersonalizedLearningPathModel | undefined Parcours d'apprentissage ou undefined si non trouvé
     */
    public getPath(pathId: string): PersonalizedLearningPathModel | undefined {
        const cachedPath = this.cacheManager.get(pathId);
        if (cachedPath) {
            this.logger.debug('Parcours récupéré depuis le cache', { pathId });
        }
        return cachedPath;
    }

    /**
     * Obtient tous les parcours d'apprentissage d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns PersonalizedLearningPathModel[] Liste des parcours d'apprentissage
     */
    public getUserPaths(userId: string): PersonalizedLearningPathModel[] {
        const userPaths = this.cacheManager.getUserPaths(userId);

        this.logger.debug('Parcours utilisateur récupérés', {
            userId,
            pathCount: userPaths.length
        });

        return userPaths;
    }

    /**
     * Marque une étape comme terminée et met à jour la progression
     * 
     * @param pathId - Identifiant du parcours
     * @param stepId - Identifiant de l'étape
     * @param success - Indique si l'étape a été complétée avec succès
     * @returns PersonalizedLearningPathModel | undefined Parcours mis à jour ou undefined si non trouvé
     */
    public completeStep(
        pathId: string,
        stepId: string,
        success: boolean
    ): PersonalizedLearningPathModel | undefined {
        const path = this.cacheManager.get(pathId);
        if (!path) {
            this.logger.warn('Tentative de completion d\'étape sur parcours inexistant', {
                pathId,
                stepId
            });
            return undefined;
        }

        try {
            const updateResult = this.progressManager.updateProgress(path, stepId, success);

            // Mettre à jour le cache
            this.cacheManager.set(pathId, updateResult.updatedPath);

            this.logger.info('Étape complétée avec succès', {
                pathId,
                stepId,
                success,
                newProgress: updateResult.newProgress,
                unlockedSteps: updateResult.unlockedSteps.length,
                isCompleted: updateResult.isCompleted
            });

            return updateResult.updatedPath;

        } catch (error) {
            this.logger.error('Erreur lors de la completion d\'étape', {
                pathId,
                stepId,
                error
            });
            throw error;
        }
    }

    /**
     * Adapte un parcours d'apprentissage en fonction des performances
     * 
     * @param pathId - Identifiant du parcours
     * @param userId - Identifiant de l'utilisateur
     * @returns Promise<PersonalizedLearningPathModel | undefined> Parcours adapté ou undefined si non trouvé
     */
    public async adaptPath(
        pathId: string,
        userId: string
    ): Promise<PersonalizedLearningPathModel | undefined> {
        const path = this.cacheManager.get(pathId);
        if (!path || path.userId !== userId) {
            this.logger.warn('Tentative d\'adaptation sur parcours inexistant ou non autorisé', {
                pathId,
                userId
            });
            return undefined;
        }

        try {
            const adaptationResult = await this.performPathAdaptation(path, userId);

            if (adaptationResult.success) {
                // Mettre à jour le cache
                this.cacheManager.set(pathId, adaptationResult.adaptedPath);

                this.logger.info('Parcours adapté avec succès', {
                    pathId,
                    userId,
                    changesCount: adaptationResult.changes.length
                });

                return adaptationResult.adaptedPath;
            }

            return undefined;

        } catch (error) {
            this.logger.error('Erreur lors de l\'adaptation du parcours', {
                pathId,
                userId,
                error
            });
            throw error;
        }
    }

    /**
     * Génère des statistiques détaillées sur un parcours
     * 
     * @param pathId - Identifiant du parcours
     * @returns PathStatistics | undefined Statistiques du parcours ou undefined si non trouvé
     */
    public getPathStatistics(pathId: string): PathStatistics | undefined {
        const path = this.cacheManager.get(pathId);
        return path ? this.progressManager.generatePathStatistics(path) : undefined;
    }

    /**
     * Supprime un parcours d'apprentissage
     * 
     * @param pathId - Identifiant du parcours
     * @returns boolean True si le parcours a été supprimé
     */
    public deletePath(pathId: string): boolean {
        const deleted = this.cacheManager.delete(pathId);

        if (deleted) {
            this.logger.info('Parcours supprimé', { pathId });
        }

        return deleted;
    }

    /**
     * Nettoie le cache des entrées expirées
     * 
     * @returns number Nombre d'entrées supprimées
     */
    public cleanupCache(): number {
        const removedCount = this.cacheManager.cleanup();

        if (removedCount > 0) {
            this.logger.info('Cache nettoyé', { removedEntries: removedCount });
        }

        return removedCount;
    }

    /**
     * Crée le modèle de base d'un parcours
     * 
     * @param userId - Identifiant utilisateur
     * @param profile - Profil utilisateur
     * @param options - Options de génération
     * @returns PersonalizedLearningPathModel Modèle de base du parcours
     * @private
     */
    private createBasePathModel(
        userId: string,
        profile: UserReverseProfile,
        options: PathGenerationOptions
    ): PersonalizedLearningPathModel {
        const pathId = this.generatePathId(userId);
        const targetLevel = LearningPathTypeUtils.normalizeCECRLLevel(options.targetLevel);
        const currentLevel = LearningPathTypeUtils.normalizeCECRLLevel(profile.currentLevel);

        const focusAreas = options.focusAreas ?? profile.weaknessAreas ?? [];
        const preferredExerciseTypes = options.preferredExerciseTypes ??
            profile.exercisePreferences.preferredTypes ??
            [];

        const targetDuration = options.targetDuration ??
            this.estimateDefaultDuration(currentLevel, targetLevel);

        return {
            id: pathId,
            userId,
            name: `Parcours ${currentLevel} → ${targetLevel}`,
            description: `Apprentissage personnalisé de ${currentLevel} vers ${targetLevel}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            startDate: new Date(),
            targetEndDate: new Date(Date.now() + targetDuration * 24 * 60 * 60 * 1000),
            targetLevel,
            currentLevel,
            overallProgress: 0,
            steps: [],
            focusAreas,
            preferences: {
                difficultyPreference: profile.exercisePreferences.difficultyPreference ?? 0.5,
                preferredExerciseTypes,
                preferredSessionDuration: LEARNING_PATH_CONSTANTS.DEFAULT_SESSION_DURATION,
                learningStyle: 'mixed'
            }
        };
    }

    /**
     * Effectue l'adaptation d'un parcours
     * 
     * @param path - Parcours à adapter
     * @param userId - Identifiant utilisateur
     * @returns Promise<PathAdaptationResult> Résultat de l'adaptation
     * @private
     */
    private async performPathAdaptation(
        path: PersonalizedLearningPathModel,
        userId: string
    ): Promise<PathAdaptationResult> {
        // Analyser les performances si disponible
        let strengthAreas: string[] = [];
        let weaknessAreas: string[] = [];

        if (this.metricsAnalyzer) {
            const analysis = await this.metricsAnalyzer.identifyStrengthsAndWeaknesses(userId);
            strengthAreas = analysis.strengths.map(skill => skill.toLowerCase().trim());
            weaknessAreas = analysis.weaknesses.map(skill => skill.toLowerCase().trim());
        }

        // Adapter le parcours
        const adaptationResult = this.progressManager.adaptPath(path, strengthAreas, weaknessAreas);

        return {
            adaptedPath: adaptationResult.adaptedPath,
            changes: adaptationResult.changes,
            success: true
        };
    }

    /**
     * Génère un identifiant unique pour un parcours
     * 
     * @param userId - Identifiant utilisateur
     * @returns string Identifiant unique
     * @private
     */
    private generatePathId(userId: string): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `path-${userId}-${timestamp}-${random}`;
    }

    /**
     * Estime la durée par défaut pour passer d'un niveau à un autre
     * 
     * @param currentLevel - Niveau actuel
     * @param targetLevel - Niveau cible
     * @returns number Durée estimée en jours
     * @private
     */
    private estimateDefaultDuration(currentLevel: CECRLLevel, targetLevel: CECRLLevel): number {
        const currentIndex = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(currentLevel);
        const targetIndex = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS.indexOf(targetLevel);

        if (currentIndex === -1 || targetIndex === -1 || targetIndex <= currentIndex) {
            return LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS.A1;
        }

        let totalDuration = 0;
        for (let i = currentIndex + 1; i <= targetIndex; i++) {
            const level = LEARNING_PATH_CONSTANTS.VALID_CECRL_LEVELS[i];
            totalDuration += LEARNING_PATH_CONSTANTS.DEFAULT_LEVEL_DURATIONS[level];
        }

        return totalDuration;
    }

    /**
     * Calcule la durée totale d'une liste d'étapes
     * 
     * @param steps - Liste des étapes
     * @returns number Durée totale en minutes
     * @private
     */
    private calculateTotalDuration(steps: readonly unknown[]): number {
        return steps.reduce((total, step: any) => total + (step.estimatedDuration ?? 0), 0);
    }
}