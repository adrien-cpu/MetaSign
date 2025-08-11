/**
 * Service central de gamification pour l'application MetaSign
 * 
 * @file src/ai/services/gamification/GamificationManager.ts
 */

import { ActivityData, Badge, Challenge, GamificationEvent, GamificationProfile, GamificationResult } from './types';
import { ActionData, ActionType } from './types/action';
import { BadgeService } from './services/BadgeService';
import { ChallengeService } from './services/ChallengeService';
import { EventService } from './services/EventService';
import { LevelService } from './services/LevelService';
import { ProfileService } from './services/ProfileService';

// Import des adaptateurs pour assurer la rétrocompatibilité
import { LearningAdapter } from './adapters';
import { EvaluationResult } from '../learning/human/coda/codavirtuel/exercises/ExerciseGeneratorService';

/**
 * Gestionnaire central de gamification pour l'application
 */
export class GamificationManager {
    private badgeService: BadgeService;
    private challengeService: ChallengeService;
    private eventService: EventService;
    private levelService: LevelService;
    private profileService: ProfileService;

    /**
     * Constructeur du gestionnaire de gamification
     */
    constructor() {
        this.badgeService = new BadgeService();
        this.challengeService = new ChallengeService();
        this.eventService = new EventService();
        this.levelService = new LevelService();
        this.profileService = new ProfileService();
    }

    /**
     * Méthode centrale pour traiter n'importe quelle action de gamification
     * @param userId Identifiant de l'utilisateur
     * @param actionData Données de l'action
     * @returns Résultat de gamification
     */
    public async processAction(
        userId: string,
        actionData: ActionData
    ): Promise<GamificationResult> {
        // Obtenir le profil de l'utilisateur
        const profile = await this.getOrCreateProfile(userId);

        // Initialiser le résultat
        const gamificationResult: GamificationResult = {
            pointsEarned: 0,
            badgesEarned: [],
            challengesCompleted: [],
            levelUp: false,
            events: []
        };

        // Calculer les points de base pour cette action
        let basePoints = this.calculateBasePointsForAction(actionData);

        // Mettre à jour le profil
        profile.totalPoints += basePoints;

        // Mettre à jour les compteurs spécifiques basés sur le type d'action
        if (actionData.type === ActionType.EXERCISE_COMPLETED) {
            profile.stats.exercisesCompleted += 1;

            // Mettre à jour les statistiques par catégorie
            if (!profile.stats.pointsByCategory['exercises']) {
                profile.stats.pointsByCategory['exercises'] = 0;
            }
            profile.stats.pointsByCategory['exercises'] += basePoints;
        } else if (actionData.type === ActionType.SKILL_MASTERED) {
            // Mettre à jour les statistiques par catégorie
            if (!profile.stats.pointsByCategory['skills']) {
                profile.stats.pointsByCategory['skills'] = 0;
            }
            profile.stats.pointsByCategory['skills'] += basePoints;
        }

        // Ajouter l'activité à l'historique
        this.profileService.updateActivityHistory(profile, basePoints);

        // Mettre à jour la séquence d'activité
        this.profileService.updateStreak(profile);

        // Vérifier les défis complétés
        const eventData: ActivityData = {
            type: actionData.type,
            context: actionData.context,
            ...actionData.metadata,
            score: actionData.result.score,
            details: actionData.result.details
        };

        const completedChallenges = this.challengeService.updateChallengesProgress(profile, eventData);
        gamificationResult.challengesCompleted = completedChallenges;

        // Ajouter les points pour les défis complétés
        for (const challenge of completedChallenges) {
            profile.totalPoints += challenge.rewardPoints;
            basePoints += challenge.rewardPoints;

            // Ajouter l'événement de défi complété
            const event = this.eventService.createChallengeCompletedEvent(userId, challenge);
            gamificationResult.events.push(event);

            // Attribuer le badge si applicable
            if (challenge.rewardBadgeId) {
                const badge = this.badgeService.getBadgeById(challenge.rewardBadgeId);
                if (badge && !this.badgeService.hasBadge(profile, badge.id)) {
                    const badgeWithDate = this.profileService.addBadge(profile, badge);
                    basePoints += badge.bonusPoints;

                    // Ajouter le badge gagné au résultat
                    gamificationResult.badgesEarned.push(badgeWithDate);

                    // Ajouter l'événement de badge gagné
                    const badgeEvent = this.eventService.createBadgeEarnedEvent(userId, badge);
                    gamificationResult.events.push(badgeEvent);
                }
            }
        }

        // Vérifier les badges spécifiques basés sur l'action
        const earnedBadges = this.checkBadgesForAction(profile, actionData);
        for (const badge of earnedBadges) {
            const badgeWithDate = this.profileService.addBadge(profile, badge);
            basePoints += badge.bonusPoints;

            // Ajouter le badge gagné au résultat
            gamificationResult.badgesEarned.push(badgeWithDate);

            // Ajouter l'événement de badge gagné
            const event = this.eventService.createBadgeEarnedEvent(userId, badge);
            gamificationResult.events.push(event);
        }

        // Vérifier si l'utilisateur monte de niveau
        const levelUpResult = this.levelService.checkLevelUp(profile);
        if (levelUpResult.levelUp) {
            gamificationResult.levelUp = true;
            gamificationResult.newLevel = levelUpResult.newLevel;

            // Ajouter les points bonus du niveau
            const levelRewards = this.levelService.getLevelInfo(levelUpResult.newLevel)?.rewards;
            if (levelRewards && levelRewards.bonusPoints) {
                profile.totalPoints += levelRewards.bonusPoints;
                basePoints += levelRewards.bonusPoints;
            }

            // Ajouter le badge du niveau si applicable
            if (levelRewards && levelRewards.badgeId) {
                const badge = this.badgeService.getBadgeById(levelRewards.badgeId);
                if (badge && !this.badgeService.hasBadge(profile, badge.id)) {
                    const badgeWithDate = this.profileService.addBadge(profile, badge);
                    basePoints += badge.bonusPoints;

                    // Ajouter le badge gagné au résultat
                    gamificationResult.badgesEarned.push(badgeWithDate);
                }
            }

            // Ajouter l'événement de montée de niveau
            const event = this.eventService.createLevelUpEvent(
                userId,
                levelUpResult.previousLevel,
                levelUpResult.newLevel,
                levelRewards?.bonusPoints,
                levelRewards?.unlockedFeatures
            );
            gamificationResult.events.push(event);
        }

        // Ajouter l'événement d'action complétée
        const actionEvent = this.eventService.createCustomEvent(
            userId,
            String(actionData.type),
            {
                context: actionData.context,
                ...actionData.metadata,
                success: actionData.result.success,
                score: actionData.result.score
            },
            basePoints
        );
        gamificationResult.events.push(actionEvent);

        // Mettre à jour les points gagnés dans le résultat
        gamificationResult.pointsEarned = basePoints;

        // Mettre à jour la moyenne de points quotidiens
        this.profileService.updateAverageDailyPoints(profile);

        // Sauvegarder le profil
        await this.profileService.saveProfile(profile);

        // Générer un feedback descriptif
        gamificationResult.feedback = this.eventService.generateFeedback(gamificationResult);

        return gamificationResult;
    }

    /**
     * Traite la complétion d'un exercice (pour rétrocompatibilité avec learning)
     * @param userId Identifiant de l'utilisateur
     * @param exerciseId Identifiant de l'exercice
     * @param result Résultat de l'évaluation
     * @returns Résultat de gamification
     */
    public async processExerciseResult(
        userId: string,
        exerciseId: string,
        result: EvaluationResult
    ): Promise<GamificationResult> {
        // Utiliser l'adaptateur pour convertir le résultat d'exercice en action générique
        const actionData = LearningAdapter.convertExerciseResult(userId, exerciseId, result);
        return this.processAction(userId, actionData);
    }

    /**
     * Gère l'événement de montée de niveau (pour rétrocompatibilité)
     * @param userId Identifiant de l'utilisateur
     * @param newLevel Nouveau niveau
     * @returns Résultat de gamification
     */
    public async handleLevelUp(
        userId: string,
        newLevel: number
    ): Promise<GamificationResult> {
        // Obtenir le profil pour connaître le niveau précédent
        const profile = await this.getOrCreateProfile(userId);
        const previousLevel = profile.currentLevel;

        // Utiliser l'adaptateur pour convertir en action générique
        const actionData = LearningAdapter.convertLevelUp(userId, previousLevel, newLevel);
        return this.processAction(userId, actionData);
    }

    /**
     * Gère l'événement de maîtrise d'une compétence (pour rétrocompatibilité)
     * @param userId Identifiant de l'utilisateur
     * @param skillId Identifiant de la compétence
     * @returns Résultat de gamification
     */
    public async handleSkillMastered(
        userId: string,
        skillId: string
    ): Promise<GamificationResult> {
        // Utiliser l'adaptateur pour convertir en action générique
        const actionData = LearningAdapter.convertSkillMastery(userId, skillId);
        return this.processAction(userId, actionData);
    }

    /**
     * Traite la complétion d'un exercice par l'interface d'événement
     * @param data Données de l'événement
     */
    public handleExerciseCompleted(data: unknown): void {
        if (typeof data !== 'object' || data === null) {
            return; // Données invalides
        }

        const eventData = data as Record<string, unknown>;

        if (!eventData.sessionId || !eventData.userId || !eventData.exerciseId || typeof eventData.score !== 'number') {
            return; // Données incomplètes
        }

        // Conversion en types attendus
        const userId = String(eventData.userId);
        const exerciseId = String(eventData.exerciseId);
        const score = Number(eventData.score);

        // Créer un résultat d'exercice factice pour le traitement
        const mockResult: EvaluationResult = {
            correct: score >= 0.6,
            score,
            details: {}
        };

        // Traiter le résultat en arrière-plan
        this.processExerciseResult(userId, exerciseId, mockResult)
            .catch(error => console.error('Error processing exercise result:', error));
    }

    /**
     * Vérifie quels badges peuvent être attribués pour une action spécifique
     * @param profile Profil de l'utilisateur
     * @param actionData Données de l'action
     * @returns Liste des badges gagnés
     * @private
     */
    private checkBadgesForAction(profile: GamificationProfile, actionData: ActionData): Badge[] {
        // Selon le type d'action, vérifier les badges appropriés
        switch (actionData.type) {
            case ActionType.EXERCISE_COMPLETED:
                return this.badgeService.checkExerciseBadges(profile);

            case ActionType.SKILL_MASTERED:
                return this.badgeService.checkSkillBadges();

            case ActionType.STREAK_ACHIEVED:
                return this.badgeService.checkStreakBadges(profile);

            default:
                return [];
        }
    }

    /**
     * Calcule les points de base pour une action
     * @param actionData Données de l'action
     * @returns Points de base
     * @private
     */
    private calculateBasePointsForAction(actionData: ActionData): number {
        // Points de base selon le type d'action
        let basePoints = 0;

        switch (actionData.type) {
            case ActionType.EXERCISE_COMPLETED:
                // Points de base pour la complétion d'exercice
                basePoints = 5;

                // Ajouter des points basés sur le score si disponible
                if (typeof actionData.result.score === 'number') {
                    basePoints += Math.floor(actionData.result.score * 20);
                }
                break;

            case ActionType.SKILL_MASTERED:
                // Points de base pour la maîtrise d'une compétence
                basePoints = 20;
                break;

            case ActionType.COURSE_COMPLETED:
                // Points de base pour la complétion d'un cours
                basePoints = 50;
                break;

            case ActionType.SESSION_COMPLETED:
                // Points de base pour la complétion d'une session
                basePoints = 10;
                break;

            case ActionType.TRANSLATION_COMPLETED:
                // Points de base pour la complétion d'une traduction
                basePoints = 15;
                break;

            case ActionType.TRANSLATION_VALIDATED:
                // Points de base pour la validation d'une traduction
                basePoints = 25;
                break;

            case ActionType.CONTENT_CREATED:
                // Points de base pour la création de contenu
                basePoints = 30;
                break;

            case ActionType.FEEDBACK_PROVIDED:
                // Points de base pour la fourniture de feedback
                basePoints = 10;
                break;

            case ActionType.CONTENT_SHARED:
                // Points de base pour le partage de contenu
                basePoints = 5;
                break;

            case ActionType.FEATURE_DISCOVERED:
                // Points de base pour la découverte d'une fonctionnalité
                basePoints = 5;
                break;

            default:
                // Points de base par défaut
                basePoints = 1;
                break;
        }

        return basePoints;
    }

    /**
     * Obtient ou crée un profil de gamification
     * @param userId Identifiant de l'utilisateur
     * @returns Profil de gamification
     * @private
     */
    private async getOrCreateProfile(userId: string): Promise<GamificationProfile> {
        return this.profileService.getOrCreateProfile(userId, () => {
            const newProfile = this.profileService.createDefaultProfile(userId);

            // Ajouter le badge de bienvenue
            const welcomeBadge = this.badgeService.getBadgeById('welcome');
            if (welcomeBadge) {
                this.profileService.addBadge(newProfile, welcomeBadge);
            }

            // Ajouter des défis quotidiens
            this.challengeService.assignDailyChallenges(newProfile);

            return newProfile;
        });
    }

    /**
     * S'abonne aux événements de gamification
     * @param callback Fonction de rappel
     * @returns Fonction pour se désabonner
     */
    public subscribeToEvents(callback: (event: GamificationEvent) => void): () => void {
        return this.eventService.subscribeToEvents(callback);
    }

    /**
     * Obtient le profil de gamification d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Profil de gamification
     */
    public async getUserProfile(userId: string): Promise<GamificationProfile> {
        return this.getOrCreateProfile(userId);
    }

    /**
     * Obtient les badges d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Liste des badges
     */
    public async getUserBadges(userId: string): Promise<Badge[]> {
        const profile = await this.getOrCreateProfile(userId);
        return [...profile.badges];
    }

    /**
     * Obtient les défis actifs d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Liste des défis actifs
     */
    public async getUserActiveChallenges(userId: string): Promise<Challenge[]> {
        const profile = await this.getOrCreateProfile(userId);
        return [...profile.activeChallenges];
    }

    /**
     * Met à jour les préférences de gamification d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @param preferences Nouvelles préférences
     * @returns Profil mis à jour
     */
    public async updateUserPreferences(
        userId: string,
        preferences: Partial<GamificationProfile['preferences']>
    ): Promise<GamificationProfile> {
        const profile = await this.getOrCreateProfile(userId);

        // Mettre à jour les préférences
        this.profileService.updatePreferences(profile, preferences);

        // Sauvegarder le profil
        await this.profileService.saveProfile(profile);

        return profile;
    }

    /**
     * Réinitialise les défis quotidiens d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Nouveaux défis
     */
    public async resetDailyChallenges(userId: string): Promise<Challenge[]> {
        const profile = await this.getOrCreateProfile(userId);

        // Réinitialiser les défis
        const newChallenges = this.challengeService.resetDailyChallenges(profile);

        // Sauvegarder le profil
        await this.profileService.saveProfile(profile);

        return newChallenges;
    }
}