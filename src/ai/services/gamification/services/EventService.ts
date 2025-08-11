/**
 * Service pour la gestion des événements de gamification
 * 
 * @file src/ai/services/learning/gamification/services/EventService.ts
 */

import { Badge, Challenge, GamificationEvent, GamificationResult } from '../types';

/**
 * Service de gestion des événements
 */
export class EventService {
    private eventSubscribers: Array<(event: GamificationEvent) => void>;

    /**
     * Initialise le service d'événements
     */
    constructor() {
        this.eventSubscribers = [];
    }

    /**
     * Diffuse un événement de gamification aux abonnés
     * @param event Événement à diffuser
     */
    public broadcastEvent(event: GamificationEvent): void {
        for (const subscriber of this.eventSubscribers) {
            try {
                subscriber(event);
            } catch (error) {
                console.error('Error in gamification event subscriber:', error);
            }
        }
    }

    /**
     * S'abonne aux événements de gamification
     * @param callback Fonction de rappel
     * @returns Fonction pour se désabonner
     */
    public subscribeToEvents(callback: (event: GamificationEvent) => void): () => void {
        this.eventSubscribers.push(callback);

        // Retourner une fonction pour se désabonner
        return () => {
            const index = this.eventSubscribers.indexOf(callback);
            if (index !== -1) {
                this.eventSubscribers.splice(index, 1);
            }
        };
    }

    /**
     * Crée un événement pour un exercice complété
     * @param userId Identifiant de l'utilisateur
     * @param exerciseId Identifiant de l'exercice
     * @param score Score obtenu
     * @param correct Indique si l'exercice est correct
     * @param pointsEarned Points gagnés
     * @returns Événement créé
     */
    public createExerciseCompletedEvent(
        userId: string,
        exerciseId: string,
        score: number,
        correct: boolean,
        pointsEarned: number
    ): GamificationEvent {
        const event: GamificationEvent = {
            type: 'exercise_completed',
            userId,
            timestamp: new Date(),
            data: {
                exerciseId,
                score,
                correct
            },
            pointsEarned
        };

        this.broadcastEvent(event);
        return event;
    }

    /**
     * Crée un événement pour un badge gagné
     * @param userId Identifiant de l'utilisateur
     * @param badge Badge gagné
     * @param fromLevelUp Indique si le badge provient d'une montée de niveau
     * @returns Événement créé
     */
    public createBadgeEarnedEvent(
        userId: string,
        badge: Badge,
        fromLevelUp = false
    ): GamificationEvent {
        const event: GamificationEvent = {
            type: 'badge_earned',
            userId,
            timestamp: new Date(),
            data: {
                badgeId: badge.id,
                title: badge.title,
                level: badge.level,
                fromLevelUp
            },
            pointsEarned: badge.bonusPoints,
            badgeEarned: badge.id
        };

        this.broadcastEvent(event);
        return event;
    }

    /**
     * Crée un événement pour un défi complété
     * @param userId Identifiant de l'utilisateur
     * @param challenge Défi complété
     * @returns Événement créé
     */
    public createChallengeCompletedEvent(
        userId: string,
        challenge: Challenge
    ): GamificationEvent {
        const event: GamificationEvent = {
            type: 'challenge_completed',
            userId,
            timestamp: new Date(),
            data: {
                challengeId: challenge.id,
                title: challenge.title
            },
            pointsEarned: challenge.rewardPoints,
            challengeCompleted: challenge.id
        };

        this.broadcastEvent(event);
        return event;
    }

    /**
        * Crée un événement pour une montée de niveau
        * @param userId Identifiant de l'utilisateur
        * @param previousLevel Niveau précédent
        * @param newLevel Nouveau niveau
        * @param bonusPoints Points bonus
        * @param unlockedFeatures Fonctionnalités débloquées
        * @returns Événement créé
        */
    public createLevelUpEvent(
        userId: string,
        previousLevel: number,
        newLevel: number,
        bonusPoints?: number,
        unlockedFeatures?: string[]
    ): GamificationEvent {
        const event: GamificationEvent = {
            type: 'level_up',
            userId,
            timestamp: new Date(),
            data: {
                previousLevel,
                newLevel,
                unlockedFeatures: unlockedFeatures || []
            },
            // Rendre explicitement les propriétés optionnelles pour satisfaire exactOptionalPropertyTypes
            ...(bonusPoints !== undefined ? { pointsEarned: bonusPoints } : {}),
            newLevel
        };

        this.broadcastEvent(event);
        return event;
    }

    /**
     * Crée un événement pour une mise à jour de séquence
     * @param userId Identifiant de l'utilisateur
     * @param currentStreak Séquence actuelle
     * @param bestStreak Meilleure séquence
     * @returns Événement créé
     */
    public createStreakUpdatedEvent(
        userId: string,
        currentStreak: number,
        bestStreak: number
    ): GamificationEvent {
        const event: GamificationEvent = {
            type: 'streak_updated',
            userId,
            timestamp: new Date(),
            data: {
                currentStreak,
                bestStreak
            }
        };

        this.broadcastEvent(event);
        return event;
    }

    /**
         * Crée un événement personnalisé
         * @param userId Identifiant de l'utilisateur
         * @param eventName Nom de l'événement
         * @param data Données associées à l'événement
         * @param pointsEarned Points gagnés
         * @returns Événement créé
         */
    public createCustomEvent(
        userId: string,
        eventName: string,
        data: Record<string, unknown>,
        pointsEarned?: number
    ): GamificationEvent {
        const event: GamificationEvent = {
            type: 'custom',
            userId,
            timestamp: new Date(),
            data: {
                eventName,
                ...data
            },
            // Rendre explicitement les propriétés optionnelles pour satisfaire exactOptionalPropertyTypes
            ...(pointsEarned !== undefined ? { pointsEarned } : {})
        };

        this.broadcastEvent(event);
        return event;
    }

    /**
     * Génère un feedback descriptif pour un résultat de gamification
     * @param result Résultat de gamification
     * @returns Feedback descriptif
     */
    public generateFeedback(result: GamificationResult): string {
        const messages: string[] = [];

        // Message de base pour les points
        if (result.pointsEarned > 0) {
            messages.push(`Vous avez gagné ${result.pointsEarned} points !`);
        }

        // Message pour les badges
        if (result.badgesEarned.length > 0) {
            if (result.badgesEarned.length === 1) {
                messages.push(`Vous avez gagné le badge "${result.badgesEarned[0].title}" !`);
            } else {
                messages.push(`Vous avez gagné ${result.badgesEarned.length} nouveaux badges !`);
            }
        }

        // Message pour les défis
        if (result.challengesCompleted.length > 0) {
            if (result.challengesCompleted.length === 1) {
                messages.push(`Défi "${result.challengesCompleted[0].title}" complété !`);
            } else {
                messages.push(`Vous avez complété ${result.challengesCompleted.length} défis !`);
            }
        }

        // Message pour la montée de niveau
        if (result.levelUp && result.newLevel) {
            messages.push(`Félicitations ! Vous avez atteint le niveau ${result.newLevel} !`);
        }

        // Message par défaut
        if (messages.length === 0) {
            messages.push('Continuez votre progression !');
        }

        return messages.join(' ');
    }
}