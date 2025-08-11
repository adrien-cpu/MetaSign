/**
 * @file src/ai/services/learning/human/evaluation/repositories/UserPerformanceRepository.ts
 * @description Référentiel pour les performances des utilisateurs
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * @interface UserPerformance
 * @description Performances d'un utilisateur
 */
export interface UserPerformance {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Performances par concept
     */
    performances: Array<{
        conceptId: string;
        score: number;
        timestamp: Date;
        context?: string;
    }>;
}

/**
 * Type pour les entrées de performance
 */
type PerformanceEntry = {
    conceptId: string;
    score: number;
    timestamp: Date;
    context?: string;
};

/**
 * @class UserPerformanceRepository
 * @description Gère l'accès aux données de performance des utilisateurs
 */
export class UserPerformanceRepository {
    private readonly logger = LoggerFactory.getLogger('UserPerformanceRepository');
    // Cache en mémoire pour simuler une base de données pendant le développement
    private userPerformanceCache: Map<string, PerformanceEntry[]> = new Map();

    /**
     * @constructor
     */
    constructor() {
        this.logger.info('UserPerformanceRepository initialized');
    }

    /**
     * @method getUserPerformance
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} [courseId] - Identifiant du cours (filtrage optionnel)
     * @returns {Promise<UserPerformance>} - Performances de l'utilisateur
     * @description Récupère les performances d'un utilisateur
     */
    public async getUserPerformance(userId: string, courseId?: string): Promise<UserPerformance> {
        this.logger.debug(`Getting performances for user ${userId}${courseId ? ` in course ${courseId}` : ''}`);

        try {
            // Récupération des données de performance
            const performances = await this.fetchUserPerformanceData(userId, courseId);

            return {
                userId,
                performances
            };
        } catch (error) {
            this.logger.error(`Error getting user performance: ${error instanceof Error ? error.message : 'Unknown error'}`);

            // Retourner un objet vide en cas d'erreur
            return {
                userId,
                performances: []
            };
        }
    }

    /**
     * @method getConceptPerformance
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} conceptId - Identifiant du concept
     * @returns {Promise<Array<{score: number, timestamp: Date}>>} - Performances pour ce concept
     * @description Récupère les performances d'un utilisateur pour un concept spécifique
     */
    public async getConceptPerformance(
        userId: string,
        conceptId: string
    ): Promise<Array<{ score: number, timestamp: Date }>> {
        this.logger.debug(`Getting performances for user ${userId}, concept ${conceptId}`);

        try {
            // Récupération de toutes les performances
            const userPerformance = await this.getUserPerformance(userId);

            // Filtrage par concept
            return userPerformance.performances
                .filter(perf => perf.conceptId === conceptId)
                .map(perf => ({
                    score: perf.score,
                    timestamp: perf.timestamp
                }));
        } catch (error) {
            this.logger.error(`Error getting concept performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }
    }

    /**
     * @method recordExercisePerformance
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} exerciseId - Identifiant de l'exercice
     * @param {number} globalScore - Score global
     * @param {Record<string, number>} conceptScores - Scores par concept
     * @param {Date} timestamp - Date de l'exercice
     * @returns {Promise<void>}
     * @description Enregistre les performances d'un exercice
     */
    public async recordExercisePerformance(
        userId: string,
        exerciseId: string,
        globalScore: number,
        conceptScores: Record<string, number>,
        timestamp: Date
    ): Promise<void> {
        this.logger.debug(`Recording performance for user ${userId}, exercise ${exerciseId}, score ${globalScore}`);

        try {
            const context = `exercise:${exerciseId}`;
            const entries: PerformanceEntry[] = [];

            // Création des entrées de performance pour chaque concept
            for (const [conceptId, score] of Object.entries(conceptScores)) {
                entries.push({
                    conceptId,
                    score,
                    timestamp,
                    context
                });
            }

            // Enregistrement de toutes les performances en une seule opération
            await this.savePerformanceData(userId, entries);

            this.logger.debug(`Performance recorded successfully for user ${userId}, exercise ${exerciseId}`);
        } catch (error) {
            this.logger.error(`Error recording exercise performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new Error(`Failed to record exercise performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * @method fetchUserPerformanceData
     * @private
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} [courseId] - Identifiant du cours (filtrage optionnel)
     * @returns {Promise<PerformanceEntry[]>} - Données de performance
     * @description Récupère les données de performance depuis la source de données
     */
    private async fetchUserPerformanceData(
        userId: string,
        courseId?: string
    ): Promise<PerformanceEntry[]> {
        // Vérifier si des données existent dans le cache
        if (!this.userPerformanceCache.has(userId)) {
            // Générer des données simulées pour démonstration
            const mockData = this.generateMockPerformanceData();
            this.userPerformanceCache.set(userId, mockData);
        }

        // Récupérer les données depuis le cache
        const entries = this.userPerformanceCache.get(userId) || [];

        // Filtrer par cours si spécifié
        if (courseId) {
            return entries.filter(entry =>
                entry.context && entry.context.includes(`course:${courseId}`)
            );
        }

        return entries;
    }

    /**
     * @method savePerformanceData
     * @private
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {PerformanceEntry[]} entries - Entrées de performance à sauvegarder
     * @returns {Promise<void>}
     * @description Enregistre les données de performance dans la source de données
     */
    private async savePerformanceData(
        userId: string,
        entries: PerformanceEntry[]
    ): Promise<void> {
        // Récupérer les données existantes ou initialiser un tableau vide
        const existingData = this.userPerformanceCache.get(userId) || [];

        // Ajouter les nouvelles entrées
        const updatedData = [...existingData, ...entries];

        // Mettre à jour le cache
        this.userPerformanceCache.set(userId, updatedData);

        // Simulation d'un délai d'enregistrement en base de données
        await new Promise(resolve => setTimeout(resolve, 10));

        this.logger.debug(`[MOCK] Saved ${entries.length} performance entries for user ${userId}`);
    }

    /**
     * @method generateMockPerformanceData
     * @private
     * @returns {PerformanceEntry[]} - Données de performance simulées
     * @description Génère des données de performance simulées pour démonstration
     */
    private generateMockPerformanceData(): PerformanceEntry[] {
        // Concepts de base en LSF
        const concepts = [
            'concept_basic_handshapes',
            'concept_spatial_reference',
            'concept_non_manual_markers',
            'concept_classifiers',
            'concept_verb_agreement',
            'concept_role_shifting',
            'concept_conditional_structures'
        ];

        const now = new Date();
        const mockData: PerformanceEntry[] = [];

        // Simuler des entrées de données pour chaque concept
        for (const concept of concepts) {
            // Entre 1 et 5 entrées par concept
            const entryCount = Math.floor(Math.random() * 5) + 1;

            for (let i = 0; i < entryCount; i++) {
                // Date aléatoire dans les 90 derniers jours
                const days = Math.floor(Math.random() * 90);
                const timestamp = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

                // Score entre 30 et 100
                const score = Math.floor(Math.random() * 70) + 30;

                // Contexte aléatoire
                const contextTypes = ['exercise', 'quiz', 'assessment', 'practice'];
                const contextType = contextTypes[Math.floor(Math.random() * contextTypes.length)];
                const contextId = Math.floor(Math.random() * 1000).toString();

                mockData.push({
                    conceptId: concept,
                    score,
                    timestamp,
                    context: `${contextType}:${contextId}`
                });
            }
        }

        return mockData;
    }
}