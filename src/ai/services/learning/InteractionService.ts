/**
 * Service de gestion des interactions utilisateur pour MetaSign
 * 
 * @file src/ai/services/learning/InteractionService.ts
 * @module ai/services/learning
 * @description Service pour la récupération, stockage et analyse des interactions utilisateur LSF
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-07-01
 */

import type {
    UserInteraction,
    InteractionServiceConfig,
    InteractionFilter,
    InteractionStatistics
} from './types/interaction';
import { InteractionType } from './types/base';
import { LEARNING_CONSTANTS } from './types/constants';
import { LearningTypeUtils } from './types/index';
import { InteractionUtils } from './types/interaction-utils';
import { Logger } from '@/ai/utils/Logger';

// Validation simple intégrée pour éviter les dépendances circulaires
const validateInteraction = (interaction: UserInteraction): void => {
    if (!LearningTypeUtils.validateUserInteraction(interaction)) {
        throw new Error('Structure d\'interaction invalide');
    }
    if (interaction.timestamp > new Date()) {
        throw new Error('La date d\'interaction ne peut pas être dans le futur');
    }
    if (interaction.duration < 0) {
        throw new Error('La durée d\'interaction ne peut pas être négative');
    }
};

/**
 * Service responsable de la gestion des interactions utilisateur
 * 
 * @example
 * ```typescript
 * const service = new InteractionService();
 * 
 * // Enregistrer une interaction
 * await service.recordInteraction({
 *     userId: 'user-123',
 *     timestamp: new Date(),
 *     activityId: 'lesson-greetings',
 *     interactionType: InteractionType.COMPLETE,
 *     duration: 120000,
 *     details: { screen: 'lesson_complete', success: true },
 *     deviceInfo: { type: 'desktop', os: 'windows' }
 * });
 * 
 * // Récupérer les interactions récentes
 * const interactions = await service.getRecentInteractions('user-123');
 * ```
 */
export class InteractionService {
    private readonly logger = Logger.getInstance('InteractionService');
    private readonly config: InteractionServiceConfig;
    private readonly interactionsCache: Map<string, UserInteraction[]> = new Map();
    private readonly cacheTimestamps: Map<string, number> = new Map();
    private cleanupInterval?: NodeJS.Timeout;

    /**
     * Constructeur du service d'interaction
     * 
     * @param config Configuration du service (optionnelle)
     */
    constructor(config?: Partial<InteractionServiceConfig>) {
        this.config = {
            ...LEARNING_CONSTANTS.DEFAULT_INTERACTION_SERVICE_CONFIG,
            ...config
        };

        this.startCleanupTimer();
        this.logger.info('InteractionService initialisé', this.config);
    }

    /**
     * Récupère les interactions récentes d'un utilisateur
     * 
     * @param userId Identifiant de l'utilisateur
     * @param limit Nombre maximum d'interactions à récupérer
     * @returns Liste des interactions récentes
     */
    public async getRecentInteractions(userId: string, limit = 50): Promise<UserInteraction[]> {
        try {
            this.logger.debug('Récupération des interactions récentes', { userId, limit });

            const cachedInteractions = this.getCachedInteractions(userId);
            if (cachedInteractions) {
                return this.sortAndLimitInteractions(cachedInteractions, limit);
            }

            const interactions = await this.fetchInteractionsFromStorage(userId);
            this.setCachedInteractions(userId, interactions);

            return this.sortAndLimitInteractions(interactions, limit);

        } catch (error) {
            this.logger.error('Erreur lors de la récupération des interactions', { userId, error });
            return [];
        }
    }

    /**
     * Enregistre une nouvelle interaction utilisateur
     * 
     * @param interaction Interaction à enregistrer
     * @throws {Error} Si l'interaction est invalide
     */
    public async recordInteraction(interaction: UserInteraction): Promise<void> {
        try {
            this.logger.debug('Enregistrement d\'une interaction', {
                userId: interaction.userId,
                type: interaction.interactionType,
                activityId: interaction.activityId
            });

            validateInteraction(interaction);
            await this.persistInteraction(interaction);
            this.updateCacheWithNewInteraction(interaction);

            this.logger.info('Interaction enregistrée avec succès', {
                userId: interaction.userId,
                activityId: interaction.activityId,
                duration: interaction.duration
            });

        } catch (error) {
            this.logger.error('Erreur lors de l\'enregistrement de l\'interaction', {
                userId: interaction.userId,
                error
            });
            throw new Error(`Échec de l'enregistrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Recherche des interactions selon des critères spécifiques
     * 
     * @param filter Critères de recherche
     * @returns Liste des interactions correspondantes
     */
    public async searchInteractions(filter: InteractionFilter): Promise<UserInteraction[]> {
        try {
            this.logger.debug('Recherche d\'interactions', { filter });
            const interactions = await this.fetchFilteredInteractions(filter);
            this.logger.debug('Interactions trouvées', { count: interactions.length });
            return interactions;

        } catch (error) {
            this.logger.error('Erreur lors de la recherche d\'interactions', { filter, error });
            return [];
        }
    }

    /**
     * Génère des statistiques sur les interactions d'un utilisateur
     * 
     * @param userId Identifiant de l'utilisateur
     * @param startDate Date de début pour les statistiques (optionnelle)
     * @param endDate Date de fin pour les statistiques (optionnelle)
     * @returns Statistiques détaillées
     */
    public async getInteractionStatistics(
        userId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<InteractionStatistics> {
        try {
            const interactions = await this.searchInteractions({ userId, startDate, endDate });
            return InteractionUtils.calculateBasicStatistics(interactions);

        } catch (error) {
            this.logger.error('Erreur lors du calcul des statistiques', { userId, error });
            throw error;
        }
    }

    /**
     * Supprime les interactions anciennes d'un utilisateur
     * 
     * @param userId Identifiant de l'utilisateur
     * @param olderThan Date limite
     * @returns Nombre d'interactions supprimées
     */
    public async cleanupOldInteractions(userId: string, olderThan: Date): Promise<number> {
        try {
            const removedCount = await this.removeOldInteractions(userId, olderThan);
            this.invalidateUserCache(userId);

            this.logger.info('Nettoyage des interactions anciennes', {
                userId,
                removedCount,
                olderThan
            });

            return removedCount;

        } catch (error) {
            this.logger.error('Erreur lors du nettoyage des interactions', { userId, error });
            throw error;
        }
    }

    /**
     * Nettoie les ressources et arrête le service
     */
    public dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }

        this.interactionsCache.clear();
        this.cacheTimestamps.clear();
        this.logger.info('InteractionService disposé');
    }

    // ===== MÉTHODES PRIVÉES =====

    /**
     * Trie et limite une liste d'interactions
     */
    private sortAndLimitInteractions(interactions: UserInteraction[], limit: number): UserInteraction[] {
        return interactions
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    /**
     * Récupère les interactions depuis le stockage
     */
    private async fetchInteractionsFromStorage(userId: string): Promise<UserInteraction[]> {
        // Simulation - remplacer par un appel réel à la base de données
        return this.generateMockInteractions(userId);
    }

    /**
     * Persiste une interaction dans le stockage
     * 
     * @param interaction Interaction à persister
     * @description Version stub - sera remplacée par l'implémentation réelle de la base de données
     */
    private async persistInteraction(interaction: UserInteraction): Promise<void> {
        // Simulation d'une persistence - remplacer par un appel réel à la base de données
        // Log de l'interaction pour le développement et debugging
        this.logger.debug('Persistance d\'interaction (mode simulation)', {
            userId: interaction.userId,
            activityId: interaction.activityId,
            type: interaction.interactionType,
            timestamp: interaction.timestamp,
            duration: interaction.duration
        });

        // Simulation d'un délai de réseau/base de données
        await new Promise(resolve => setTimeout(resolve, 10));

        // Dans l'implémentation réelle, ceci sera remplacé par :
        // await this.database.saveInteraction(interaction);
        // ou
        // await this.apiClient.postInteraction(interaction);
    }

    /**
     * Récupère des interactions filtrées
     */
    private async fetchFilteredInteractions(filter: InteractionFilter): Promise<UserInteraction[]> {
        if (!filter.userId) return [];

        const allInteractions = await this.fetchInteractionsFromStorage(filter.userId);
        return this.applyFilter(allInteractions, filter);
    }

    /**
     * Applique un filtre à une liste d'interactions
     */
    private applyFilter(interactions: UserInteraction[], filter: InteractionFilter): UserInteraction[] {
        return interactions
            .filter(item => this.matchesFilter(item, filter))
            .slice(0, filter.limit || 100);
    }

    /**
     * Vérifie si une interaction correspond aux critères du filtre
     */
    private matchesFilter(item: UserInteraction, filter: InteractionFilter): boolean {
        if (filter.interactionTypes && !filter.interactionTypes.includes(item.interactionType)) {
            return false;
        }
        if (filter.activityIds && !filter.activityIds.includes(item.activityId)) {
            return false;
        }
        if (filter.startDate && item.timestamp < filter.startDate) {
            return false;
        }
        if (filter.endDate && item.timestamp > filter.endDate) {
            return false;
        }
        return true;
    }

    /**
     * Supprime les interactions anciennes
     */
    private async removeOldInteractions(userId: string, olderThan: Date): Promise<number> {
        const interactions = await this.fetchInteractionsFromStorage(userId);
        return interactions.filter(i => i.timestamp < olderThan).length;
    }

    /**
     * Génère des interactions simulées pour le développement et les tests
     */
    private generateMockInteractions(userId: string): UserInteraction[] {
        const interactions: UserInteraction[] = [];
        const activities = ['lesson-greetings', 'exercise-vocabulary', 'practice-expressions'];
        const types = [InteractionType.START, InteractionType.COMPLETE, InteractionType.PAUSE, InteractionType.RESUME];

        for (let i = 0; i < 20; i++) {
            interactions.push(LearningTypeUtils.createDefaultUserInteraction(
                userId,
                activities[i % activities.length],
                types[i % types.length]
            ));
        }

        return interactions;
    }

    // ===== MÉTHODES DE GESTION DU CACHE =====

    private getCachedInteractions(userId: string): UserInteraction[] | undefined {
        const timestamp = this.cacheTimestamps.get(userId);
        if (!timestamp || Date.now() - timestamp > this.config.retentionTime) {
            this.invalidateUserCache(userId);
            return undefined;
        }
        return this.interactionsCache.get(userId);
    }

    private setCachedInteractions(userId: string, interactions: UserInteraction[]): void {
        if (this.interactionsCache.size >= this.config.maxCacheSize) {
            this.evictOldestCacheEntry();
        }
        this.interactionsCache.set(userId, interactions);
        this.cacheTimestamps.set(userId, Date.now());
    }

    private updateCacheWithNewInteraction(newInteraction: UserInteraction): void {
        const cached = this.getCachedInteractions(newInteraction.userId);
        if (cached) {
            cached.unshift(newInteraction);
            if (cached.length > 100) cached.splice(100);
            this.setCachedInteractions(newInteraction.userId, cached);
        }
    }

    private invalidateUserCache(userId: string): void {
        this.interactionsCache.delete(userId);
        this.cacheTimestamps.delete(userId);
    }

    private evictOldestCacheEntry(): void {
        const oldestEntry = Array.from(this.cacheTimestamps.entries())
            .sort(([, a], [, b]) => a - b)[0];
        if (oldestEntry) {
            this.invalidateUserCache(oldestEntry[0]);
        }
    }

    private startCleanupTimer(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredCache();
        }, this.config.cleanupInterval);
    }

    private cleanupExpiredCache(): void {
        const now = Date.now();
        let removedCount = 0;

        for (const [userId, timestamp] of this.cacheTimestamps.entries()) {
            if (now - timestamp > this.config.retentionTime) {
                this.invalidateUserCache(userId);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            this.logger.debug('Cache nettoyé', {
                removedUsers: removedCount,
                remainingUsers: this.interactionsCache.size
            });
        }
    }
}