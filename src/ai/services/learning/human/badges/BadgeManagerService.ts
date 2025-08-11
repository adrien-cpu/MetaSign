/**
 * @file src/ai/services/learning/human/badges/BadgeManagerService.ts
 * @description Service de gestion des badges et récompenses avec système d'évaluation
 * automatique des critères et attribution dynamique des récompenses.
 * @module BadgeManager
 * @requires @/ai/services/learning/types/LearningExtensions
 * @requires @/ai/services/learning/registry/utils/MetricsCollector
 * @requires @/ai/services/learning/utils/logger
 * @requires @/ai/services/learning/utils/performance-wrapper
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import type {
    Badge,
    LearningProgress,
    BadgeSystemConfig,
    BadgeEvaluationResult
} from '@/ai/services/learning/types/LearningExtensions';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';
import { LearningLogger } from '@/ai/services/learning/utils/logger';
import { createPerformanceProxy } from '@/ai/services/learning/utils/performance-wrapper';

/**
 * Extension du type Badge avec propriétés additionnelles pour le système MetaSign
 * @interface ExtendedBadge
 * @extends Badge
 * @property {string} id - Identifiant unique du badge
 * @property {string} title - Titre du badge
 * @property {string} description - Description du badge
 * @property {string} name - Nom du badge (alias pour title)
 * @property {string} imageUrl - URL de l'image du badge
 * @property {string} criteria - Critères d'obtention
 * @property {string} icon - Icône du badge
 * @property {number} pointsReward - Points attribués
 * @property {'easy' | 'medium' | 'hard' | 'legendary'} difficulty - Difficulté
 * @property {'progression' | 'completion' | 'achievement' | 'consistency'} category - Catégorie
 */
export interface ExtendedBadge extends Badge {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly name: string;
    readonly imageUrl: string;
    readonly criteria: string;
    readonly icon: string;
    readonly pointsReward: number;
    readonly difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    readonly category: 'progression' | 'completion' | 'achievement' | 'consistency';
}

/**
 * Critères d'évaluation personnalisés pour les badges
 * @interface CustomBadgeCriteria
 * @property {string} type - Type de critère (progression, completion, achievement, consistency, custom)
 * @property {number} threshold - Valeur seuil à atteindre
 * @property {Function} [evaluator] - Fonction d'évaluation personnalisée
 */
export interface CustomBadgeCriteria {
    /** Type de critère */
    type: 'progression' | 'completion' | 'achievement' | 'consistency' | 'custom';
    /** Valeur seuil à atteindre */
    threshold: number;
    /** Fonction d'évaluation personnalisée */
    evaluator?: (progress: LearningProgress) => boolean;
}

/**
 * Service de gestion des badges et récompenses avec attribution automatique
 * et système d'évaluation flexible des critères d'obtention.
 * 
 * @class BadgeManagerService
 * @description Gère l'ensemble du cycle de vie des badges : création, évaluation,
 * attribution et suivi statistique. Supporte des critères personnalisés et
 * l'attribution automatique basée sur la progression de l'utilisateur.
 * 
 * @example
 * ```typescript
 * const badgeManager = new BadgeManagerService(metricsCollector);
 * badgeManager.setBadge({
 *   id: 'first_steps',
 *   name: 'Premiers Pas',
 *   // ... autres propriétés
 * });
 * 
 * const newBadges = badgeManager.checkAndAwardBadges(userProgress);
 * ```
 */
export class BadgeManagerService {
    private readonly badgeMap: Map<string, ExtendedBadge> = new Map();
    private readonly customCriteria: Map<string, CustomBadgeCriteria> = new Map();
    private readonly metricsCollector: MetricsCollector;
    private readonly config: BadgeSystemConfig;

    /**
     * Initialise le service de gestion des badges
     * @param {MetricsCollector} metricsCollector - Collecteur de métriques pour le suivi des performances
     * @param {Partial<BadgeSystemConfig>} [config={}] - Configuration du système de badges
     * @constructor
     */
    constructor(
        metricsCollector: MetricsCollector,
        config: Partial<BadgeSystemConfig> = {}
    ) {
        this.metricsCollector = metricsCollector;
        this.config = {
            enableAutoAward: true,
            enableDefaultBadges: true,
            dailyBadgeLimit: 5,
            ...config
        };

        LearningLogger.info('BadgeManagerService initialisé', {
            enableAutoAward: this.config.enableAutoAward,
            enableDefaultBadges: this.config.enableDefaultBadges,
            dailyBadgeLimit: this.config.dailyBadgeLimit
        });

        if (this.config.enableDefaultBadges) {
            this.initializeDefaultBadges();
        }

        // Retourner une instance proxifiée avec tracking de performance
        return createPerformanceProxy(this, {
            className: 'BadgeManagerService',
            metricsCollector: this.metricsCollector,
            warnThreshold: 500
        }, [
            'setBadge',
            'evaluateAndAwardBadges',
            'checkAndAwardBadges',
            'getBadgeStatistics'
        ]);
    }

    /**
     * Ajoute ou met à jour un badge dans le système
     * @param {ExtendedBadge} badgeItem - Badge à ajouter/mettre à jour
     * @throws {Error} Si le badge n'a pas d'identifiant unique
     * @public
     */
    public setBadge(badgeItem: ExtendedBadge): void {
        this.validateBadge(badgeItem);

        const isUpdate = this.badgeMap.has(badgeItem.id);
        this.badgeMap.set(badgeItem.id, { ...badgeItem });

        this.metricsCollector.recordEvent(
            isUpdate ? 'badge_updated' : 'badge_created',
            {
                badgeId: badgeItem.id,
                category: badgeItem.category,
                difficulty: badgeItem.difficulty
            }
        );

        LearningLogger.debug(`Badge ${isUpdate ? 'mis à jour' : 'créé'}`, {
            badgeId: badgeItem.id,
            title: badgeItem.title
        });
    }

    /**
     * Récupère un badge par son identifiant
     * @param {string} badgeId - Identifiant unique du badge
     * @returns {ExtendedBadge | undefined} Badge correspondant ou undefined si non trouvé
     * @public
     */
    public getBadge(badgeId: string): ExtendedBadge | undefined {
        if (!badgeId?.trim()) {
            LearningLogger.warn('Tentative de récupération de badge avec ID invalide', { badgeId });
            return undefined;
        }

        const badge = this.badgeMap.get(badgeId);
        if (badge) {
            this.metricsCollector.recordEvent('badge_viewed', { badgeId });
        }

        return badge ? { ...badge } : undefined;
    }

    /**
     * Récupère tous les badges du système
     * @returns {ExtendedBadge[]} Tableau de tous les badges (copie pour éviter les mutations)
     * @public
     */
    public getAllBadges(): ExtendedBadge[] {
        return Array.from(this.badgeMap.values()).map(badge => ({ ...badge }));
    }

    /**
     * Vérifie si un badge a été obtenu par un utilisateur
     * @param {string} badgeId - Identifiant du badge
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {boolean} true si l'utilisateur possède le badge
     * @public
     */
    public checkBadgeUnlocked(badgeId: string, userProgress: LearningProgress): boolean {
        return userProgress.earnedBadges.includes(badgeId);
    }

    /**
     * Évalue et attribue automatiquement les nouveaux badges
     * @param {LearningProgress} userProgress - Progression actuelle de l'utilisateur
     * @returns {BadgeEvaluationResult[]} Résultats détaillés de l'évaluation des badges
     * @public
     */
    public evaluateAndAwardBadges(userProgress: LearningProgress): BadgeEvaluationResult[] {
        if (!this.config.enableAutoAward) {
            return [];
        }

        const results: BadgeEvaluationResult[] = [];
        const candidateBadges = this.getAllBadges()
            .filter(badge => !userProgress.earnedBadges.includes(badge.id));

        for (const badge of candidateBadges) {
            const result = this.evaluateBadge(badge, userProgress);
            results.push(result);

            if (result.awarded) {
                this.metricsCollector.recordEvent('badge_earned', {
                    badgeId: badge.id,
                    userId: userProgress.userId,
                    category: badge.category
                });
            }
        }

        const newBadges = results.filter(r => r.awarded);
        if (newBadges.length > 0) {
            LearningLogger.info(`${newBadges.length} nouveaux badges attribués`, {
                userId: userProgress.userId,
                badges: newBadges.map(b => b.badgeId)
            });
        }

        return results;
    }

    /**
     * Obtient la liste des identifiants des nouveaux badges attribués
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {string[]} Identifiants des nouveaux badges
     * @public
     */
    public checkAndAwardBadges(userProgress: LearningProgress): string[] {
        const results = this.evaluateAndAwardBadges(userProgress);
        return results.filter(result => result.awarded).map(result => result.badgeId);
    }

    /**
     * Ajoute des critères personnalisés pour un badge
     * @param {string} badgeId - Identifiant du badge
     * @param {CustomBadgeCriteria} criteria - Critères d'évaluation personnalisés
     * @public
     */
    public setCustomCriteria(badgeId: string, criteria: CustomBadgeCriteria): void {
        this.customCriteria.set(badgeId, criteria);
        LearningLogger.debug('Critères personnalisés définis', { badgeId, type: criteria.type });
    }

    /**
     * Obtient des statistiques sur les badges
     * @returns {Object} Statistiques détaillées des badges
     * @returns {number} .totalBadges - Nombre total de badges
     * @returns {Record<string, number>} .badgesByCategory - Badges groupés par catégorie
     * @returns {Record<string, number>} .badgesByDifficulty - Badges groupés par difficulté
     * @public
     */
    public getBadgeStatistics(): {
        totalBadges: number;
        badgesByCategory: Record<string, number>;
        badgesByDifficulty: Record<string, number>;
    } {
        const badges = this.getAllBadges();

        return {
            totalBadges: badges.length,
            badgesByCategory: this.groupByProperty(badges, 'category'),
            badgesByDifficulty: this.groupByProperty(badges, 'difficulty')
        };
    }

    /**
     * Supprime un badge du système
     * @param {string} badgeId - Identifiant du badge à supprimer
     * @returns {boolean} true si le badge a été supprimé
     * @public
     */
    public removeBadge(badgeId: string): boolean {
        const badgeExists = this.badgeMap.has(badgeId);

        if (badgeExists) {
            this.badgeMap.delete(badgeId);
            this.customCriteria.delete(badgeId);
            this.metricsCollector.recordEvent('badge_removed', { badgeId });
            LearningLogger.info('Badge supprimé', { badgeId });
        }

        return badgeExists;
    }

    /**
     * Valide la structure d'un badge
     * @param {ExtendedBadge} badge - Badge à valider
     * @throws {Error} Si le badge est invalide
     * @private
     */
    private validateBadge(badge: ExtendedBadge): void {
        if (!badge.id?.trim()) {
            throw new Error('Un badge doit avoir un identifiant unique non vide');
        }

        if (!badge.title?.trim()) {
            throw new Error('Un badge doit avoir un titre non vide');
        }

        if (!badge.description?.trim()) {
            throw new Error('Un badge doit avoir une description non vide');
        }

        const validCategories = ['progression', 'completion', 'achievement', 'consistency'];
        if (!validCategories.includes(badge.category)) {
            throw new Error(`Catégorie de badge invalide: ${badge.category}`);
        }

        const validDifficulties = ['easy', 'medium', 'hard', 'legendary'];
        if (!validDifficulties.includes(badge.difficulty)) {
            throw new Error(`Difficulté de badge invalide: ${badge.difficulty}`);
        }
    }

    /**
     * Évalue si un badge doit être attribué
     * @param {ExtendedBadge} badge - Badge à évaluer
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {BadgeEvaluationResult} Résultat de l'évaluation
     * @private
     */
    private evaluateBadge(badge: ExtendedBadge, userProgress: LearningProgress): BadgeEvaluationResult {
        // Vérifier d'abord les critères personnalisés
        const customCriteria = this.customCriteria.get(badge.id);
        if (customCriteria?.evaluator) {
            const awarded = customCriteria.evaluator(userProgress);
            return {
                badgeId: badge.id,
                awarded,
                reason: awarded ? 'Critères personnalisés satisfaits' : 'Critères personnalisés non satisfaits',
                progressTowards: awarded ? 100 : 0
            };
        }

        // Évaluation selon les critères standard
        return this.evaluateStandardCriteria(badge, userProgress);
    }

    /**
     * Évalue les critères standard d'un badge
     * @param {ExtendedBadge} badge - Badge à évaluer
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {BadgeEvaluationResult} Résultat de l'évaluation
     * @private
     */
    private evaluateStandardCriteria(badge: ExtendedBadge, userProgress: LearningProgress): BadgeEvaluationResult {
        switch (badge.category) {
            case 'progression':
                return this.evaluateProgressionBadge(badge, userProgress);
            case 'completion':
                return this.evaluateCompletionBadge(badge, userProgress);
            case 'achievement':
                return this.evaluateAchievementBadge(badge, userProgress);
            case 'consistency':
                return this.evaluateConsistencyBadge(badge, userProgress);
            default:
                return {
                    badgeId: badge.id,
                    awarded: false,
                    reason: `Catégorie de badge non reconnue: ${badge.category}`,
                    progressTowards: 0
                };
        }
    }

    /**
     * Évalue les badges de progression
     * @param {ExtendedBadge} badge - Badge à évaluer
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {BadgeEvaluationResult} Résultat de l'évaluation
     * @private
     */
    private evaluateProgressionBadge(badge: ExtendedBadge, userProgress: LearningProgress): BadgeEvaluationResult {
        const result: BadgeEvaluationResult = {
            badgeId: badge.id,
            awarded: false,
            reason: '',
            progressTowards: 0
        };

        if (badge.id.startsWith('level_')) {
            const targetLevel = parseInt(badge.id.split('_')[1]);
            result.awarded = userProgress.level >= targetLevel;
            result.progressTowards = Math.min(100, (userProgress.level / targetLevel) * 100);
            result.reason = result.awarded ? `Niveau ${targetLevel} atteint` : `Niveau ${userProgress.level}/${targetLevel}`;
        } else if (badge.id.startsWith('experience_')) {
            const targetXP = parseInt(badge.id.split('_')[1]);
            result.awarded = userProgress.totalExperience >= targetXP;
            result.progressTowards = Math.min(100, (userProgress.totalExperience / targetXP) * 100);
            result.reason = result.awarded ? `${targetXP} XP atteints` : `${userProgress.totalExperience}/${targetXP} XP`;
        }

        return result;
    }

    /**
     * Évalue les badges de complétion
     * @param {ExtendedBadge} badge - Badge à évaluer
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {BadgeEvaluationResult} Résultat de l'évaluation
     * @private
     */
    private evaluateCompletionBadge(badge: ExtendedBadge, userProgress: LearningProgress): BadgeEvaluationResult {
        const result: BadgeEvaluationResult = {
            badgeId: badge.id,
            awarded: false,
            reason: '',
            progressTowards: 0
        };

        if (badge.id.startsWith('complete_') && badge.id.includes('_modules')) {
            const targetModules = parseInt(badge.id.split('_')[1]);
            const completedCount = userProgress.completedModules.length;
            result.awarded = completedCount >= targetModules;
            result.progressTowards = Math.min(100, (completedCount / targetModules) * 100);
            result.reason = result.awarded ? `${targetModules} modules complétés` : `${completedCount}/${targetModules} modules`;
        }

        return result;
    }

    /**
     * Évalue les badges de réalisation
     * @param {ExtendedBadge} badge - Badge à évaluer
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {BadgeEvaluationResult} Résultat de l'évaluation
     * @private
     */
    private evaluateAchievementBadge(badge: ExtendedBadge, userProgress: LearningProgress): BadgeEvaluationResult {
        const result: BadgeEvaluationResult = {
            badgeId: badge.id,
            awarded: false,
            reason: '',
            progressTowards: 0
        };

        if (badge.id === 'perfect_quiz') {
            result.awarded = this.hasPerfectQuiz(userProgress);
            result.reason = result.awarded ? 'Quiz parfait réalisé' : 'Aucun quiz parfait';
            result.progressTowards = result.awarded ? 100 : 0;
        }

        return result;
    }

    /**
     * Évalue les badges de régularité
     * @param {ExtendedBadge} badge - Badge à évaluer
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {BadgeEvaluationResult} Résultat de l'évaluation
     * @private
     */
    private evaluateConsistencyBadge(badge: ExtendedBadge, userProgress: LearningProgress): BadgeEvaluationResult {
        const result: BadgeEvaluationResult = {
            badgeId: badge.id,
            awarded: false,
            reason: '',
            progressTowards: 0
        };

        if (badge.id.startsWith('study_streak_')) {
            const targetDays = parseInt(badge.id.split('_')[2]);
            const currentStreak = this.calculateStudyStreak(userProgress);
            result.awarded = currentStreak >= targetDays;
            result.progressTowards = Math.min(100, (currentStreak / targetDays) * 100);
            result.reason = result.awarded ? `${targetDays} jours consécutifs` : `${currentStreak}/${targetDays} jours`;
        }

        return result;
    }

    /**
     * Vérifie si l'utilisateur a réalisé un quiz parfait
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {boolean} true si au moins un quiz parfait a été réalisé
     * @private
     */
    private hasPerfectQuiz(userProgress: LearningProgress): boolean {
        for (const attempts of Object.values(userProgress.quizAttempts)) {
            if (Array.isArray(attempts)) {
                for (const attempt of attempts) {
                    if (attempt.score === 100 && attempt.correctAnswers === attempt.totalQuestions) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Calcule la série d'étude actuelle de l'utilisateur
     * @param {LearningProgress} userProgress - Progression de l'utilisateur
     * @returns {number} Nombre de jours consécutifs d'étude
     * @private
     */
    private calculateStudyStreak(userProgress: LearningProgress): number {
        // Implémentation simplifiée - dans un vrai système, cela nécessiterait un tracking des dates
        return userProgress.interactionHistory.length >= 7 ? 7 : userProgress.interactionHistory.length;
    }

    /**
     * Groupe les badges par propriété
     * @param {ExtendedBadge[]} badges - Badges à grouper
     * @param {K} property - Propriété de regroupement
     * @returns {Record<string, number>} Objet avec le compte par valeur de propriété
     * @private
     * @template K
     */
    private groupByProperty<K extends keyof ExtendedBadge>(
        badges: ExtendedBadge[],
        property: K
    ): Record<string, number> {
        return badges.reduce((acc, badge) => {
            const key = String(badge[property]);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    /**
     * Initialise les badges par défaut du système
     * @private
     */
    private initializeDefaultBadges(): void {
        const defaultBadges: ExtendedBadge[] = [
            {
                id: 'first_steps',
                name: 'Premiers Pas',
                title: 'Premiers Pas',
                description: 'Complétez votre premier module d\'apprentissage',
                imageUrl: '/badges/first-steps.png',
                criteria: 'Complétez le module de base LSF',
                icon: 'first-steps.png',
                pointsReward: 100,
                difficulty: 'easy',
                category: 'progression'
            },
            {
                id: 'level_5',
                name: 'Apprenant Confirmé',
                title: 'Apprenant Confirmé',
                description: 'Atteignez le niveau 5',
                imageUrl: '/badges/level-5.png',
                criteria: 'Atteindre le niveau 5',
                icon: 'level-5.png',
                pointsReward: 500,
                difficulty: 'medium',
                category: 'progression'
            },
            {
                id: 'perfect_quiz',
                name: 'Perfectionniste',
                title: 'Perfectionniste',
                description: 'Obtenez un score parfait à un quiz',
                imageUrl: '/badges/perfect-quiz.png',
                criteria: 'Score de 100% à un quiz',
                icon: 'perfect-quiz.png',
                pointsReward: 250,
                difficulty: 'hard',
                category: 'achievement'
            }
        ];

        defaultBadges.forEach(badge => {
            this.setBadge(badge);
        });

        LearningLogger.info(`${defaultBadges.length} badges par défaut initialisés`);
    }
}