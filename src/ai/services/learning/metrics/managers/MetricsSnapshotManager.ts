/**
 * @file src/ai/services/learning/metrics/managers/MetricsSnapshotManager.ts
 * @description Gestionnaire de snapshots de métriques d'apprentissage
 * @module MetricsSnapshotManager
 * @requires @/ai/services/learning/metrics/MetricsStore
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @requires @/ai/services/learning/metrics/processors/PerformanceMetricsProcessor
 * @requires @/ai/utils/LoggerFactory
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère la création et la gestion des snapshots de métriques d'apprentissage,
 * permettant de suivre l'évolution des profils utilisateurs dans le temps.
 */

import { MetricsStore } from '../MetricsStore';
import { DetailedUserMetricsProfile } from '../types/DetailedMetricsTypes';
import { LearningMetric } from '../interfaces/MetricsInterfaces';
import { ExtendedExerciseResult } from '../processors/PerformanceMetricsProcessor';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Options du gestionnaire de snapshots
 * @interface SnapshotManagerOptions
 */
interface SnapshotManagerOptions {
    /**
     * Créer un snapshot après chaque exercice
     */
    snapshotPerExercise?: boolean;

    /**
     * Créer un snapshot après chaque session
     */
    snapshotPerSession?: boolean;

    /**
     * Intervalle minimum entre snapshots (en ms)
     */
    minSnapshotInterval?: number;

    /**
     * Liste des métriques standards à inclure dans les snapshots
     */
    standardMetricsToTrack?: string[];

    /**
     * Nombre maximum de snapshots par métrique
     */
    maxSnapshotsPerMetric?: number;
}

/**
 * Types de snapshots
 * @enum {string}
 */
enum SnapshotType {
    EXERCISE = 'exercise',
    SESSION = 'session',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CUSTOM = 'custom'
}

/**
 * Interface pour les métadonnées de snapshot
 * @interface SnapshotMetadata
 */
interface SnapshotMetadata {
    /**
     * Type de snapshot
     */
    type: SnapshotType;

    /**
     * ID de l'exercice associé (si applicable)
     */
    exerciseId?: string;

    /**
     * ID de la session associée (si applicable)
     */
    sessionId?: string;

    /**
     * Étiquettes personnalisées
     */
    tags?: string[];

    /**
     * Horodatage
     */
    timestamp: Date;

    /**
     * Données spécifiques au type de snapshot
     */
    [key: string]: unknown;
}

/**
 * Gestionnaire de snapshots de métriques
 * 
 * @class MetricsSnapshotManager
 * @description Gère la création et la gestion des snapshots de métriques d'apprentissage
 */
export class MetricsSnapshotManager {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('MetricsSnapshotManager');

    /**
     * Store de métriques
     * @private
     * @readonly
     */
    private readonly metricsStore: MetricsStore;

    /**
     * Options de configuration
     * @private
     * @readonly
     */
    private readonly options: Required<SnapshotManagerOptions>;

    /**
     * Timestamps des derniers snapshots par utilisateur
     * @private
     */
    private readonly lastSnapshotTimes: Map<string, number>;

    /**
     * Constructeur du gestionnaire de snapshots
     * 
     * @constructor
     * @param {MetricsStore} metricsStore - Store de métriques
     * @param {SnapshotManagerOptions} [options={}] - Options de configuration
     */
    constructor(metricsStore: MetricsStore, options: SnapshotManagerOptions = {}) {
        this.metricsStore = metricsStore;
        this.lastSnapshotTimes = new Map();

        // Options par défaut
        this.options = {
            snapshotPerExercise: options.snapshotPerExercise ?? false,
            snapshotPerSession: options.snapshotPerSession ?? true,
            minSnapshotInterval: options.minSnapshotInterval ?? 5 * 60 * 1000, // 5 minutes
            standardMetricsToTrack: options.standardMetricsToTrack ?? [
                'progression.currentLevel',
                'progression.progressInCurrentLevel',
                'performance.successRate',
                'mastery.masteredSkillsCount',
                'engagement.averageSessionDuration',
                'engagement.usageFrequency'
            ],
            maxSnapshotsPerMetric: options.maxSnapshotsPerMetric ?? 100
        };
    }

    /**
     * Crée des snapshots après un exercice
     * 
     * @method createExerciseSnapshots
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ExtendedExerciseResult} result - Résultat de l'exercice
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {Promise<void>}
     * @public
     */
    public async createExerciseSnapshots(
        userId: string,
        result: ExtendedExerciseResult,
        profile: DetailedUserMetricsProfile
    ): Promise<void> {
        if (!this.options.snapshotPerExercise) {
            return;
        }

        // Vérifier l'intervalle minimum
        if (!this.canCreateSnapshot(userId)) {
            return;
        }

        try {
            // Métadonnées du snapshot
            const metadata: SnapshotMetadata = {
                type: SnapshotType.EXERCISE,
                exerciseId: result.exerciseId,
                timestamp: new Date(),
                exerciseType: result.exerciseType,
                score: result.score,
                skills: result.skills
            };

            // Créer les snapshots des métriques standards
            await this.createStandardMetricsSnapshots(userId, profile, metadata);

            // Créer des snapshots spécifiques à l'exercice
            await this.createExerciseSpecificSnapshots(userId, result, profile, metadata);

            // Mettre à jour le timestamp du dernier snapshot
            this.updateLastSnapshotTime(userId);

            this.logger.info(`Snapshots créés après exercice ${result.exerciseId} pour l'utilisateur ${userId}`);
        } catch (error) {
            this.logger.error(`Erreur lors de la création des snapshots d'exercice: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Crée des snapshots après une session
     * 
     * @method createSessionSnapshots
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} sessionId - Identifiant de la session
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {Promise<void>}
     * @public
     */
    public async createSessionSnapshots(
        userId: string,
        sessionId: string,
        profile: DetailedUserMetricsProfile
    ): Promise<void> {
        if (!this.options.snapshotPerSession) {
            return;
        }

        // Vérifier l'intervalle minimum
        if (!this.canCreateSnapshot(userId)) {
            return;
        }

        try {
            // Métadonnées du snapshot
            const metadata: SnapshotMetadata = {
                type: SnapshotType.SESSION,
                sessionId,
                timestamp: new Date(),
                totalExercises: profile.performance.totalExercisesCompleted,
                totalLearningTime: profile.engagement.totalLearningTime
            };

            // Créer les snapshots des métriques standards
            await this.createStandardMetricsSnapshots(userId, profile, metadata);

            // Créer des snapshots spécifiques à la session
            await this.createSessionSpecificSnapshots(userId, profile, metadata);

            // Mettre à jour le timestamp du dernier snapshot
            this.updateLastSnapshotTime(userId);

            this.logger.info(`Snapshots créés après session ${sessionId} pour l'utilisateur ${userId}`);
        } catch (error) {
            this.logger.error(`Erreur lors de la création des snapshots de session: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Crée un snapshot personnalisé
     * 
     * @method createCustomSnapshot
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {unknown} value - Valeur de la métrique
     * @param {Record<string, unknown>} [metadata] - Métadonnées
     * @returns {Promise<void>}
     * @public
     */
    public async createCustomSnapshot(
        userId: string,
        metricId: string,
        value: unknown,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        try {
            // Créer la métrique
            const metric: LearningMetric = {
                id: metricId,
                name: metricId,
                value,
                updatedAt: new Date(),
                metadata: {
                    type: SnapshotType.CUSTOM,
                    timestamp: new Date(),
                    ...metadata
                }
            };

            // Sauvegarder le snapshot
            await this.metricsStore.saveMetricSnapshot(userId, metric);

            this.logger.info(`Snapshot personnalisé créé pour la métrique ${metricId} de l'utilisateur ${userId}`);
        } catch (error) {
            this.logger.error(`Erreur lors de la création du snapshot personnalisé: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Vérifie si un snapshot peut être créé
     * 
     * @method canCreateSnapshot
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {boolean} Vrai si un snapshot peut être créé
     * @private
     */
    private canCreateSnapshot(userId: string): boolean {
        const lastTime = this.lastSnapshotTimes.get(userId);

        if (!lastTime) {
            return true;
        }

        const now = Date.now();
        return now - lastTime >= this.options.minSnapshotInterval;
    }

    /**
     * Met à jour le timestamp du dernier snapshot
     * 
     * @method updateLastSnapshotTime
     * @param {string} userId - Identifiant de l'utilisateur
     * @private
     */
    private updateLastSnapshotTime(userId: string): void {
        this.lastSnapshotTimes.set(userId, Date.now());
    }

    /**
     * Crée des snapshots des métriques standards
     * 
     * @method createStandardMetricsSnapshots
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @param {SnapshotMetadata} metadata - Métadonnées
     * @returns {Promise<void>}
     * @private
     */
    private async createStandardMetricsSnapshots(
        userId: string,
        profile: DetailedUserMetricsProfile,
        metadata: SnapshotMetadata
    ): Promise<void> {
        // Créer des snapshots pour chaque métrique standard à suivre
        for (const metricPath of this.options.standardMetricsToTrack) {
            // Extraire la valeur de la métrique du profil
            const value = this.extractMetricValue(profile, metricPath);

            if (value !== undefined) {
                // Créer la métrique
                const metric: LearningMetric = {
                    id: metricPath,
                    name: metricPath,
                    value,
                    updatedAt: new Date(),
                    metadata: {
                        ...metadata
                    }
                };

                // Sauvegarder le snapshot
                await this.metricsStore.saveMetricSnapshot(userId, metric);
            }
        }
    }

    /**
     * Crée des snapshots spécifiques à un exercice
     * 
     * @method createExerciseSpecificSnapshots
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ExtendedExerciseResult} result - Résultat de l'exercice
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @param {SnapshotMetadata} metadata - Métadonnées
     * @returns {Promise<void>}
     * @private
     */
    private async createExerciseSpecificSnapshots(
        userId: string,
        result: ExtendedExerciseResult,
        profile: DetailedUserMetricsProfile,
        metadata: SnapshotMetadata
    ): Promise<void> {
        // Suivre les scores par compétence
        for (const skill of result.skills) {
            const skillScore = result.skillScores[skill] || 0;

            // Créer la métrique
            const metric: LearningMetric = {
                id: `skill.${skill}.score`,
                name: `Score de compétence: ${skill}`,
                value: skillScore,
                updatedAt: new Date(),
                category: 'skill_scores',
                metadata: {
                    ...metadata,
                    skill
                }
            };

            // Sauvegarder le snapshot
            await this.metricsStore.saveMetricSnapshot(userId, metric);
        }

        // Suivre le temps passé par type d'exercice
        const metric: LearningMetric = {
            id: `exerciseType.${result.exerciseType}.timeSpent`,
            name: `Temps passé: ${result.exerciseType}`,
            value: result.timeSpent,
            updatedAt: new Date(),
            category: 'exercise_times',
            metadata: {
                ...metadata,
                exerciseType: result.exerciseType
            }
        };

        // Sauvegarder le snapshot
        await this.metricsStore.saveMetricSnapshot(userId, metric);
    }

    /**
     * Crée des snapshots spécifiques à une session
     * 
     * @method createSessionSpecificSnapshots
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @param {SnapshotMetadata} metadata - Métadonnées
     * @returns {Promise<void>}
     * @private
     */
    private async createSessionSpecificSnapshots(
        userId: string,
        profile: DetailedUserMetricsProfile,
        metadata: SnapshotMetadata
    ): Promise<void> {
        // Créer un snapshot pour le nombre de compétences maîtrisées
        const masteredSkillsMetric: LearningMetric = {
            id: 'mastery.masteredSkillsCount',
            name: 'Nombre de compétences maîtrisées',
            value: profile.mastery.masteredSkillsCount,
            updatedAt: new Date(),
            category: 'mastery',
            metadata: {
                ...metadata,
                skills: profile.mastery.masteredSkills
            }
        };

        await this.metricsStore.saveMetricSnapshot(userId, masteredSkillsMetric);

        // Créer un snapshot pour le niveau actuel
        const currentLevelMetric: LearningMetric = {
            id: 'progression.currentLevel',
            name: 'Niveau actuel',
            value: profile.progression.currentLevel,
            updatedAt: new Date(),
            category: 'progression',
            metadata: {
                ...metadata,
                progressInLevel: profile.progression.progressInCurrentLevel
            }
        };

        await this.metricsStore.saveMetricSnapshot(userId, currentLevelMetric);

        // Créer un snapshot pour le temps total d'apprentissage
        const totalTimeMetric: LearningMetric = {
            id: 'engagement.totalLearningTime',
            name: 'Temps total d\'apprentissage',
            value: profile.engagement.totalLearningTime,
            updatedAt: new Date(),
            category: 'engagement',
            metadata
        };

        await this.metricsStore.saveMetricSnapshot(userId, totalTimeMetric);
    }

    /**
     * Extrait la valeur d'une métrique d'un profil
     * 
     * @method extractMetricValue
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @param {string} path - Chemin de la métrique
     * @returns {unknown} Valeur de la métrique
     * @private
     */
    private extractMetricValue(profile: DetailedUserMetricsProfile, path: string): unknown {
        const parts = path.split('.');
        let current: any = profile;

        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }

            current = current[part];
        }

        return current;
    }
}