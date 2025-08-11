/**
 * Service de personnalisation des parcours d'apprentissage - Version refactorisée
 * 
 * @file src/ai/services/learning/personalization/PersonalizedLearningPath.ts
 * @module ai/services/learning/personalization
 * @description Service principal pour la génération et gestion des parcours d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    PersonalizedLearningPathModel,
    PathGenerationOptions,
    LearningPathStep,
    PathStatistics,
    StepGeneratorConfig,
    CECRLLevel
} from './types/LearningPathTypes';

import {
    LearningPathTypeUtils,
    LEARNING_PATH_CONSTANTS
} from './types/LearningPathTypes';
import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/types/index';
import type { LearningMetricsCollector } from '@/ai/services/learning/metrics/LearningMetricsCollector';
import type { MetricsAnalyzer } from '@/ai/services/learning/metrics/MetricsAnalyzer';

import { PathStepGenerator } from './generators/PathStepGenerator';
import { PathProgressManager } from './managers/PathProgressManager';
import { PathFormatUtils } from './utils/PathFormatUtils';
import { Logger } from '@/ai/utils/Logger';

/**
 * Configuration pour le service de parcours personnalisés
 */
interface PersonalizedLearningPathConfig {
    /**
     * Activer la génération automatique d'identifiants
     */
    readonly enableAutoIdGeneration: boolean;

    /**
     * Taille maximale du cache
     */
    readonly maxCacheSize: number;

    /**
     * Durée de vie du cache (ms)
     */
    readonly cacheTTL: number;

    /**
     * Activer l'adaptation automatique
     */
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
 * Service de gestion des parcours d'apprentissage personnalisés
 * 
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
    private readonly pathsCache: Map<string, PersonalizedLearningPathModel>;
    private readonly cacheTimestamps: Map<string, number>;

    /**
     * Constructeur du service de parcours personnalisés
     * 
     * @param metricsCollector Collecteur de métriques (optionnel)
     * @param metricsAnalyzer Analyseur de métriques (optionnel)
     * @param config Configuration du service (optionnelle)
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
        this.pathsCache = new Map();
        this.cacheTimestamps = new Map();

        this.logger.info('PersonalizedLearningPath initialisé', this.config);
    }

    /**
     * Génère un parcours d'apprentissage personnalisé
     * 
     * @param userId Identifiant de l'utilisateur
     * @param profile Profil d'apprentissage de l'utilisateur
     * @param options Options de génération du parcours
     * @returns Parcours d'apprentissage généré
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
            this.validateGenerationParams(userId, profile, options);

            // Création du modèle de base du parcours
            const pathModel = this.createBasePathModel(userId, profile, options);

            // Configuration du générateur d'étapes
            const generatorConfig: StepGeneratorConfig = {
                profile,
                path: pathModel,
                options,
                mode: options.mode || 'balanced',
                intensity: options.intensity || LEARNING_PATH_CONSTANTS.DEFAULT_INTENSITY
            };

            // Génération des étapes
            const steps = await this.stepGenerator.generateAllSteps(generatorConfig);
            pathModel.steps.push(...steps);

            // Mise à jour initiale des statuts
            this.progressManager.updateStepsStatus(pathModel);

            // Mise en cache
            this.setCacheEntry(pathModel.id, pathModel);

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
     * @param pathId Identifiant du parcours
     * @returns Parcours d'apprentissage ou undefined si non trouvé
     */
    public getPath(pathId: string): PersonalizedLearningPathModel | undefined {
        const cachedPath = this.getCacheEntry(pathId);
        if (cachedPath) {
            this.logger.debug('Parcours récupéré depuis le cache', { pathId });
        }
        return cachedPath;
    }

    /**
     * Obtient tous les parcours d'apprentissage d'un utilisateur
     * 
     * @param userId Identifiant de l'utilisateur
     * @returns Liste des parcours d'apprentissage
     */
    public getUserPaths(userId: string): PersonalizedLearningPathModel[] {
        const userPaths: PersonalizedLearningPathModel[] = [];

        for (const path of this.pathsCache.values()) {
            if (path.userId === userId) {
                userPaths.push(path);
            }
        }

        this.logger.debug('Parcours utilisateur récupérés', {
            userId,
            pathCount: userPaths.length
        });

        return userPaths;
    }

    /**
     * Marque une étape comme terminée et met à jour la progression
     * 
     * @param pathId Identifiant du parcours
     * @param stepId Identifiant de l'étape
     * @param success Indique si l'étape a été complétée avec succès
     * @returns Parcours mis à jour ou undefined si non trouvé
     */
    public completeStep(
        pathId: string,
        stepId: string,
        success: boolean
    ): PersonalizedLearningPathModel | undefined {
        const path = this.getCacheEntry(pathId);
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
            this.setCacheEntry(pathId, updateResult.updatedPath);

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
     * @param pathId Identifiant du parcours
     * @param userId Identifiant de l'utilisateur
     * @returns Parcours adapté ou undefined si non trouvé
     */
    public async adaptPath(
        pathId: string,
        userId: string
    ): Promise<PersonalizedLearningPathModel | undefined> {
        const path = this.getCacheEntry(pathId);
        if (!path || path.userId !== userId) {
            this.logger.warn('Tentative d\'adaptation sur parcours inexistant ou non autorisé', {
                pathId,
                userId
            });
            return undefined;
        }

        try {
            // Analyser les performances si disponible
            let strengthAreas: string[] = [];
            let weaknessAreas: string[] = [];

            if (this.metricsAnalyzer) {
                const analysis = await this.metricsAnalyzer.identifyStrengthsAndWeaknesses(userId);
                strengthAreas = analysis.strengths.map(PathFormatUtils.normalizeSkillName);
                weaknessAreas = analysis.weaknesses.map(PathFormatUtils.normalizeSkillName);
            }

            // Adapter le parcours
            const adaptationResult = this.progressManager.adaptPath(path, strengthAreas, weaknessAreas);

            // Mettre à jour le cache
            this.setCacheEntry(pathId, adaptationResult.adaptedPath);

            this.logger.info('Parcours adapté avec succès', {
                pathId,
                userId,
                changesCount: adaptationResult.changes.length,
                strengthAreas: strengthAreas.length,
                weaknessAreas: weaknessAreas.length
            });

            return adaptationResult.adaptedPath;

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
     * @param pathId Identifiant du parcours
     * @returns Statistiques du parcours ou undefined si non trouvé
     */
    public getPathStatistics(pathId: string): PathStatistics | undefined {
        const path = this.getCacheEntry(pathId);
        if (!path) {
            return undefined;
        }

        return this.progressManager.generatePathStatistics(path);
    }

    /**
     * Supprime un parcours d'apprentissage
     * 
     * @param pathId Identifiant du parcours
     * @returns True si le parcours a été supprimé
     */
    public deletePath(pathId: string): boolean {
        const deleted = this.pathsCache.delete(pathId);
        this.cacheTimestamps.delete(pathId);

        if (deleted) {
            this.logger.info('Parcours supprimé', { pathId });
        }

        return deleted;
    }

    /**
     * Nettoie le cache des entrées expirées
     * 
     * @returns Nombre d'entrées supprimées
     */
    public cleanupCache(): number {
        const now = Date.now();
        let removedCount = 0;

        for (const [pathId, timestamp] of this.cacheTimestamps.entries()) {
            if (now - timestamp > this.config.cacheTTL) {
                this.pathsCache.delete(pathId);
                this.cacheTimestamps.delete(pathId);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            this.logger.info('Cache nettoyé', { removedEntries: removedCount });
        }

        return removedCount;
    }

    /**
     * Valide les paramètres de génération
     * 
     * @param userId Identifiant utilisateur
     * @param profile Profil utilisateur
     * @param options Options de génération
     * @throws {Error} Si les paramètres ne sont pas valides
     * @private
     */
    private validateGenerationParams(
        userId: string,
        profile: UserReverseProfile,
        options: PathGenerationOptions
    ): void {
        if (!userId || typeof userId !== 'string') {
            throw new Error('ID utilisateur requis');
        }

        if (!profile?.currentLevel) {
            throw new Error('Niveau actuel requis dans le profil');
        }

        if (!LearningPathTypeUtils.isValidCECRLLevel(options.targetLevel)) {
            throw new Error(`Niveau cible invalide: ${options.targetLevel}`);
        }

        if (options.mode && !LearningPathTypeUtils.isValidGenerationMode(options.mode)) {
            throw new Error(`Mode de génération invalide: ${options.mode}`);
        }

        if (options.intensity !== undefined && (options.intensity < 1 || options.intensity > 5)) {
            throw new Error('L\'intensité doit être entre 1 et 5');
        }
    }

    /**
     * Crée le modèle de base d'un parcours
     * 
     * @param userId Identifiant utilisateur
     * @param profile Profil utilisateur
     * @param options Options de génération
     * @returns Modèle de base du parcours
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

        const focusAreas = options.focusAreas || profile.weaknessAreas || [];

        // Extraire les types d'exercice préférés depuis les préférences d'exercice
        const preferredExerciseTypes = options.preferredExerciseTypes ||
            profile.exercisePreferences.preferredTypes ||
            [];

        const targetDuration = options.targetDuration ||
            this.estimateDefaultDuration(currentLevel, targetLevel);

        return {
            id: pathId,
            userId,
            name: PathFormatUtils.generatePathTitle(currentLevel, targetLevel, focusAreas),
            description: PathFormatUtils.generatePathDescription(currentLevel, targetLevel, focusAreas),
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
                difficultyPreference: profile.exercisePreferences.difficultyPreference || 0.5,
                preferredExerciseTypes,
                preferredSessionDuration: LEARNING_PATH_CONSTANTS.DEFAULT_SESSION_DURATION,
                learningStyle: 'mixed'
            }
        };
    }

    /**
     * Génère un identifiant unique pour un parcours
     * 
     * @param userId Identifiant utilisateur
     * @returns Identifiant unique
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
     * @param currentLevel Niveau actuel
     * @param targetLevel Niveau cible
     * @returns Durée estimée en jours
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
     * @param steps Liste des étapes
     * @returns Durée totale en minutes
     * @private
     */
    private calculateTotalDuration(steps: readonly LearningPathStep[]): number {
        return steps.reduce((total, step) => total + step.estimatedDuration, 0);
    }

    /**
     * Récupère une entrée du cache si elle est valide
     * 
     * @param pathId Identifiant du parcours
     * @returns Parcours en cache ou undefined
     * @private
     */
    private getCacheEntry(pathId: string): PersonalizedLearningPathModel | undefined {
        const timestamp = this.cacheTimestamps.get(pathId);

        if (!timestamp || Date.now() - timestamp > this.config.cacheTTL) {
            this.pathsCache.delete(pathId);
            this.cacheTimestamps.delete(pathId);
            return undefined;
        }

        return this.pathsCache.get(pathId);
    }

    /**
     * Ajoute une entrée au cache
     * 
     * @param pathId Identifiant du parcours
     * @param path Parcours à mettre en cache
     * @private
     */
    private setCacheEntry(pathId: string, path: PersonalizedLearningPathModel): void {
        // Vérifier la taille du cache
        if (this.pathsCache.size >= this.config.maxCacheSize) {
            this.cleanupCache();

            // Si toujours plein, supprimer l'entrée la plus ancienne
            if (this.pathsCache.size >= this.config.maxCacheSize) {
                const oldestEntry = Array.from(this.cacheTimestamps.entries())
                    .sort(([, a], [, b]) => a - b)[0];

                if (oldestEntry) {
                    this.pathsCache.delete(oldestEntry[0]);
                    this.cacheTimestamps.delete(oldestEntry[0]);
                }
            }
        }

        this.pathsCache.set(pathId, path);
        this.cacheTimestamps.set(pathId, Date.now());
    }
}