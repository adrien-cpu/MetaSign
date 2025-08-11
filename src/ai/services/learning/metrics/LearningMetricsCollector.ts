/**
 * @file src/ai/services/learning/metrics/LearningMetricsCollector.ts
 * @description Collecteur principal de métriques d'apprentissage - Orchestrateur
 * @module LearningMetricsCollector
 * @requires @/ai/services/learning/LearningService
 * @requires @/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @requires @/ai/utils/LoggerFactory
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module orchestre la collecte et l'analyse des métriques d'apprentissage
 * en coordonnant les différents services spécialisés.
 */

import { LearningSession } from './interfaces/MetricsInterfaces';
import { UserReverseProfile } from '../human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { ExerciseResult } from '../human/coda/codavirtuel/repositories/UserReverseApprenticeshipRepository';
import {
    ILearningMetricsCollector,
    UserMetricsProfile,
    LearningMetric,
    MetricsFilterOptions
} from './interfaces/MetricsInterfaces';

// Services refactorisés
import { MetricsStore } from './MetricsStore';
import { MetricsProfileManager } from './managers/MetricsProfileManager';
import { MetricsCalculator } from './calculators/MetricsCalculator';
import { PerformanceMetricsProcessor } from './processors/PerformanceMetricsProcessor';
import { MasteryMetricsProcessor } from './processors/MasteryMetricsProcessor';
import { CustomMetricsManager } from './managers/CustomMetricsManager';
import { MetricsSnapshotManager } from './managers/MetricsSnapshotManager';

// Helpers et transformateurs
import { MetricsTransformers } from './utils/MetricsTransformers';
import { MetricsUpdateHelpers } from './utils/MetricsUpdateHelpers';

// Types étendus
import { MetricsConfiguration } from './types';

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { createPerformanceProxy } from '@/ai/services/learning/utils/performance-wrapper';

/**
 * Service principal de collecte et d'analyse des métriques d'apprentissage
 * 
 * @class LearningMetricsCollector
 * @implements {ILearningMetricsCollector}
 * @description Orchestrateur qui coordonne les différents services de métriques
 * pour fournir une interface unifiée de collecte et d'analyse
 * 
 * @example
 * ```typescript
 * const collector = new LearningMetricsCollector();
 * const profile = await collector.recordExerciseResult(userId, exerciseResult);
 * ```
 */
export class LearningMetricsCollector implements ILearningMetricsCollector {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LearningMetricsCollector');

    /**
     * Services spécialisés
     * @private
     * @readonly
     */
    private readonly metricsStore: MetricsStore;
    private readonly profileManager: MetricsProfileManager;
    private readonly calculator: MetricsCalculator;
    private readonly performanceProcessor: PerformanceMetricsProcessor;
    private readonly masteryProcessor: MasteryMetricsProcessor;
    private readonly customMetricsManager: CustomMetricsManager;
    private readonly snapshotManager: MetricsSnapshotManager;

    /**
     * Helpers
     * @private
     * @readonly
     */
    private readonly transformers: MetricsTransformers;
    private readonly updateHelpers: MetricsUpdateHelpers;

    /**
     * Configuration du collecteur
     * @private
     * @readonly
     */
    private readonly config: MetricsConfiguration;

    /**
     * Constructeur du collecteur de métriques
     * 
     * @constructor
     * @param {Partial<MetricsConfiguration>} [config={}] - Configuration optionnelle
     */
    constructor(config: Partial<MetricsConfiguration> = {}) {
        // Configuration par défaut
        this.config = {
            rollingAverageWindow: config.rollingAverageWindow ?? 20,
            successThreshold: config.successThreshold ?? 0.6,
            cacheTTL: config.cacheTTL ?? 60000,
            enableAutoSnapshots: config.enableAutoSnapshots ?? true,
            snapshotInterval: config.snapshotInterval ?? 5
        };

        // Initialisation des services
        this.metricsStore = new MetricsStore();
        this.profileManager = new MetricsProfileManager(
            this.metricsStore,
            { ttl: this.config.cacheTTL }
        );
        this.calculator = new MetricsCalculator();
        this.performanceProcessor = new PerformanceMetricsProcessor({
            successThreshold: this.config.successThreshold,
            rollingWindowSize: this.config.rollingAverageWindow
        });
        this.masteryProcessor = new MasteryMetricsProcessor();
        this.customMetricsManager = new CustomMetricsManager(this.metricsStore);
        this.snapshotManager = new MetricsSnapshotManager(
            this.metricsStore,
            {
                snapshotPerExercise: this.config.enableAutoSnapshots,
                minSnapshotInterval: this.config.snapshotInterval * 60 * 1000
            }
        );

        // Initialisation des helpers
        this.transformers = new MetricsTransformers();
        this.updateHelpers = new MetricsUpdateHelpers();

        this.logger.info('LearningMetricsCollector initialisé');

        // Retourner une instance proxifiée avec tracking de performance
        return createPerformanceProxy(this, {
            className: 'LearningMetricsCollector',
            metricsCollector: this.metricsStore, // Correction ici: suppression du cast incorrect
            warnThreshold: 1000
        }, [
            'recordExerciseResult',
            'recordSessionMetrics',
            'updateLearningProfile',
            'getUserMetricsProfile'
        ]);
    }

    /**
     * Enregistre un résultat d'exercice
     * 
     * @method recordExerciseResult
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ExerciseResult} exerciseResult - Résultat de l'exercice
     * @returns {Promise<UserMetricsProfile>} Profil de métriques mis à jour
     * @throws {Error} En cas d'erreur lors de l'enregistrement
     */
    public async recordExerciseResult(
        userId: string,
        exerciseResult: ExerciseResult
    ): Promise<UserMetricsProfile> {
        try {
            // Récupérer le profil détaillé
            const profile = await this.profileManager.getOrCreateProfile(userId);

            // Transformer ExerciseResult en ExtendedExerciseResult
            const extendedResult = this.transformers.transformExerciseResult(exerciseResult);

            // Mettre à jour les métriques de performance
            profile.performance = this.performanceProcessor.updateMetrics(
                profile.performance,
                extendedResult
            );

            // Mettre à jour les métriques de maîtrise
            profile.mastery = this.masteryProcessor.updateMetrics(
                profile.mastery,
                extendedResult
            );

            // Créer des snapshots si activé
            if (this.config.enableAutoSnapshots) {
                await this.snapshotManager.createExerciseSnapshots(
                    userId,
                    extendedResult,
                    profile
                );
            }

            // Sauvegarder le profil mis à jour
            const updatedProfile = await this.profileManager.saveProfile(profile);

            // Transformer en format de base pour l'interface
            return this.transformers.transformToBaseProfile(updatedProfile);

        } catch (error) {
            this.logger.error(
                `Erreur lors de l'enregistrement du résultat: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
            );
            throw error;
        }
    }

    /**
     * Enregistre les métriques d'une session d'apprentissage
     * 
     * @method recordSessionMetrics
     * @async
     * @param {LearningSession} session - Session d'apprentissage
     * @returns {Promise<UserMetricsProfile>} Profil de métriques mis à jour
     * @throws {Error} En cas d'erreur lors de l'enregistrement
     */
    public async recordSessionMetrics(session: LearningSession): Promise<UserMetricsProfile> {
        try {
            const userId = session.userId;
            const profile = await this.profileManager.getOrCreateProfile(userId);

            // Calculer la durée de la session
            const sessionDuration = session.endTime
                ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000)
                : 0;

            // Mettre à jour les métriques d'engagement
            this.updateHelpers.updateSessionEngagement(
                profile,
                sessionDuration,
                session.stats.exercisesCompleted
            );

            // Mettre à jour la fréquence d'utilisation
            profile.engagement.usageFrequency = await this.updateHelpers.calculateUsageFrequency(userId);

            // Créer des snapshots de session
            await this.snapshotManager.createSessionSnapshots(
                userId,
                session.sessionId,
                profile
            );

            // Sauvegarder le profil
            const updatedProfile = await this.profileManager.saveProfile(profile);

            return this.transformers.transformToBaseProfile(updatedProfile);

        } catch (error) {
            this.logger.error(
                `Erreur lors de l'enregistrement de la session: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
            );
            throw error;
        }
    }

    /**
     * Met à jour le profil d'apprentissage d'un utilisateur
     * 
     * @method updateLearningProfile
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {UserReverseProfile} reverseProfile - Profil d'apprentissage inversé
     * @returns {Promise<UserMetricsProfile>} Profil de métriques mis à jour
     * @throws {Error} En cas d'erreur lors de la mise à jour
     */
    public async updateLearningProfile(
        userId: string,
        reverseProfile: UserReverseProfile
    ): Promise<UserMetricsProfile> {
        try {
            const profile = await this.profileManager.getOrCreateProfile(userId);

            // Synchroniser la progression
            this.updateHelpers.syncProgressionWithReverseProfile(profile, reverseProfile);

            // Synchroniser les compétences
            this.updateHelpers.syncMasteryWithReverseProfile(profile, reverseProfile);

            // Sauvegarder
            const updatedProfile = await this.profileManager.saveProfile(profile);

            return this.transformers.transformToBaseProfile(updatedProfile);

        } catch (error) {
            this.logger.error(
                `Erreur lors de la mise à jour du profil: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
            );
            throw error;
        }
    }

    /**
     * Obtient le profil de métriques d'un utilisateur
     * 
     * @method getUserMetricsProfile
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<UserMetricsProfile>} Profil de métriques
     */
    public async getUserMetricsProfile(userId: string): Promise<UserMetricsProfile> {
        const profile = await this.profileManager.getOrCreateProfile(userId);
        return this.transformers.transformToBaseProfile(profile);
    }

    /**
     * Obtient des métriques spécifiques d'un utilisateur
     * 
     * @method getUserMetrics
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string[]} metricIds - Liste des identifiants de métriques
     * @returns {Promise<LearningMetric[]>} Métriques demandées
     */
    public async getUserMetrics(userId: string, metricIds: string[]): Promise<LearningMetric[]> {
        const profile = await this.profileManager.getOrCreateProfile(userId);
        const metrics: LearningMetric[] = [];

        for (const metricId of metricIds) {
            const metric = this.transformers.extractMetricFromProfile(metricId, profile);
            if (metric) {
                metrics.push(metric);
            }
        }

        return metrics;
    }

    /**
     * Obtient l'historique des métriques d'un utilisateur
     * 
     * @method getMetricHistory
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {MetricsFilterOptions} [options] - Options de filtrage
     * @returns {Promise<Array<{ timestamp: Date; value: unknown }>>} Historique
     */
    public async getMetricHistory(
        userId: string,
        metricId: string,
        options?: MetricsFilterOptions
    ): Promise<Array<{ timestamp: Date; value: unknown }>> {
        return this.metricsStore.loadMetricHistory(userId, metricId, options);
    }

    /**
     * Crée une métrique personnalisée
     * 
     * @method createCustomMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {Omit<LearningMetric, 'updatedAt'>} metric - Définition de la métrique
     * @returns {Promise<LearningMetric>} Métrique créée
     */
    public async createCustomMetric(
        userId: string,
        metric: Omit<LearningMetric, 'updatedAt'>
    ): Promise<LearningMetric> {
        const profile = await this.profileManager.getOrCreateProfile(userId);
        const newMetric = await this.customMetricsManager.createMetric(userId, metric, profile);
        await this.profileManager.saveProfile(profile);
        return newMetric;
    }

    /**
     * Met à jour une métrique personnalisée
     * 
     * @method updateCustomMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {unknown} value - Nouvelle valeur
     * @param {Record<string, unknown>} [metadata] - Métadonnées optionnelles
     * @returns {Promise<LearningMetric>} Métrique mise à jour
     */
    public async updateCustomMetric(
        userId: string,
        metricId: string,
        value: unknown,
        metadata?: Record<string, unknown>
    ): Promise<LearningMetric> {
        const profile = await this.profileManager.getOrCreateProfile(userId);
        const updatedMetric = await this.customMetricsManager.updateMetric(
            userId,
            metricId,
            value,
            profile,
            metadata
        );
        await this.profileManager.saveProfile(profile);
        return updatedMetric;
    }
}