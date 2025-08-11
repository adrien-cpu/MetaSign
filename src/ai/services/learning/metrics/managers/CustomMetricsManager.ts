/**
 * @file src/ai/services/learning/metrics/managers/CustomMetricsManager.ts
 * @description Gestionnaire de métriques personnalisées
 * @module CustomMetricsManager
 * @requires @/ai/services/learning/metrics/MetricsStore
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/services/learning/metrics/interfaces/MetricsInterfaces
 * @requires @/ai/utils/LoggerFactory
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère les métriques personnalisées définies par les utilisateurs ou les modules
 * d'apprentissage spécifiques.
 */

import { MetricsStore } from '../MetricsStore';
import { DetailedUserMetricsProfile } from '../types/DetailedMetricsTypes';
import { LearningMetric } from '../interfaces/MetricsInterfaces';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Gestionnaire de métriques personnalisées
 * 
 * @class CustomMetricsManager
 * @description Gère le cycle de vie des métriques personnalisées, y compris
 * leur création, mise à jour et suppression
 */
export class CustomMetricsManager {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('CustomMetricsManager');

    /**
     * Store de métriques
     * @private
     * @readonly
     */
    private readonly metricsStore: MetricsStore;

    /**
     * Constructeur du gestionnaire de métriques personnalisées
     * 
     * @constructor
     * @param {MetricsStore} metricsStore - Store de métriques
     */
    constructor(metricsStore: MetricsStore) {
        this.metricsStore = metricsStore;
    }

    /**
     * Crée une métrique personnalisée
     * 
     * @method createMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {Omit<LearningMetric, 'updatedAt'>} metric - Définition de la métrique
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {Promise<LearningMetric>} Métrique créée
     * @public
     * @throws {Error} Si la métrique existe déjà
     */
    public async createMetric(
        userId: string,
        metric: Omit<LearningMetric, 'updatedAt'>,
        profile: DetailedUserMetricsProfile
    ): Promise<LearningMetric> {
        // Vérifier si la métrique existe déjà
        if (profile.customMetrics[metric.id]) {
            throw new Error(`La métrique ${metric.id} existe déjà pour l'utilisateur ${userId}`);
        }

        // Créer la nouvelle métrique
        const now = new Date();
        const newMetric: LearningMetric = {
            ...metric,
            updatedAt: now
        };

        // Ajouter au profil
        profile.customMetrics[newMetric.id] = newMetric;

        // Créer un snapshot
        await this.metricsStore.saveMetricSnapshot(userId, newMetric);

        this.logger.info(`Métrique personnalisée ${newMetric.id} créée pour l'utilisateur ${userId}`);

        return newMetric;
    }

    /**
     * Met à jour une métrique personnalisée
     * 
     * @method updateMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {unknown} value - Nouvelle valeur
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @param {Record<string, unknown>} [metadata] - Métadonnées optionnelles
     * @returns {Promise<LearningMetric>} Métrique mise à jour
     * @public
     * @throws {Error} Si la métrique n'existe pas
     */
    public async updateMetric(
        userId: string,
        metricId: string,
        value: unknown,
        profile: DetailedUserMetricsProfile,
        metadata?: Record<string, unknown>
    ): Promise<LearningMetric> {
        // Vérifier si la métrique existe
        const existingMetric = profile.customMetrics[metricId];
        if (!existingMetric) {
            throw new Error(`La métrique ${metricId} n'existe pas pour l'utilisateur ${userId}`);
        }

        // Mettre à jour la métrique
        const updatedMetric: LearningMetric = {
            ...existingMetric,
            value,
            updatedAt: new Date()
        };

        // Ajouter les métadonnées si fournies
        if (metadata) {
            updatedMetric.metadata = {
                ...(existingMetric.metadata || {}),
                ...metadata
            };
        }

        // Mettre à jour le profil
        profile.customMetrics[metricId] = updatedMetric;

        // Créer un snapshot
        await this.metricsStore.saveMetricSnapshot(userId, updatedMetric);

        this.logger.info(`Métrique personnalisée ${metricId} mise à jour pour l'utilisateur ${userId}`);

        return updatedMetric;
    }

    /**
     * Supprime une métrique personnalisée
     * 
     * @method deleteMetric
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} metricId - Identifiant de la métrique
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {Promise<boolean>} Vrai si la suppression a réussi
     * @public
     */
    public async deleteMetric(
        userId: string,
        metricId: string,
        profile: DetailedUserMetricsProfile
    ): Promise<boolean> {
        // Vérifier si la métrique existe
        if (!profile.customMetrics[metricId]) {
            return false;
        }

        // Supprimer la métrique du profil
        delete profile.customMetrics[metricId];

        // Supprimer l'historique de la métrique
        await this.metricsStore.deleteCustomMetric(userId, metricId);

        this.logger.info(`Métrique personnalisée ${metricId} supprimée pour l'utilisateur ${userId}`);

        return true;
    }

    /**
     * Récupère une métrique personnalisée
     * 
     * @method getMetric
     * @param {string} metricId - Identifiant de la métrique
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {LearningMetric | undefined} Métrique ou undefined
     * @public
     */
    public getMetric(
        metricId: string,
        profile: DetailedUserMetricsProfile
    ): LearningMetric | undefined {
        return profile.customMetrics[metricId];
    }

    /**
     * Vérifie si une métrique personnalisée existe
     * 
     * @method metricExists
     * @param {string} metricId - Identifiant de la métrique
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {boolean} Vrai si la métrique existe
     * @public
     */
    public metricExists(
        metricId: string,
        profile: DetailedUserMetricsProfile
    ): boolean {
        return !!profile.customMetrics[metricId];
    }

    /**
     * Récupère toutes les métriques personnalisées
     * 
     * @method getAllMetrics
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @returns {Record<string, LearningMetric>} Métriques personnalisées
     * @public
     */
    public getAllMetrics(profile: DetailedUserMetricsProfile): Record<string, LearningMetric> {
        return { ...profile.customMetrics };
    }

    /**
     * Filtre les métriques personnalisées par catégorie
     * 
     * @method filterMetricsByCategory
     * @param {DetailedUserMetricsProfile} profile - Profil utilisateur
     * @param {string} category - Catégorie à filtrer
     * @returns {Record<string, LearningMetric>} Métriques filtrées
     * @public
     */
    public filterMetricsByCategory(
        profile: DetailedUserMetricsProfile,
        category: string
    ): Record<string, LearningMetric> {
        const filtered: Record<string, LearningMetric> = {};

        for (const [id, metric] of Object.entries(profile.customMetrics)) {
            if (metric.category === category) {
                filtered[id] = metric;
            }
        }

        return filtered;
    }
}