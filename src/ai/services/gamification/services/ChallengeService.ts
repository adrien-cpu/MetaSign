/**
 * Service pour la gestion des défis dans le système de gamification
 * 
 * @file src/ai/services/learning/gamification/services/ChallengeService.ts
 */

import { ActivityData, Challenge, ChallengeType, GamificationProfile } from '../types';

/**
 * Service de gestion des défis
 */
export class ChallengeService {
    private challengeCatalog: Challenge[];

    /**
     * Initialise le service de défis
     */
    constructor() {
        this.challengeCatalog = this.initializeChallenges();
    }

    /**
     * Initialise le catalogue de défis
     * @returns Liste des défis
     * @private
     */
    private initializeChallenges(): Challenge[] {
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return [
            // Défis quotidiens
            {
                id: 'daily_exercises',
                title: 'Exercices Quotidiens',
                description: 'Complétez 5 exercices aujourd\'hui',
                type: ChallengeType.DAILY,
                difficulty: 1,
                startDate: now,
                endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                rewardPoints: 15,
                criteria: {
                    type: 'exercise_count',
                    target: 5
                },
                progress: 0,
                completed: false
            },
            {
                id: 'daily_perfect',
                title: 'Perfection Quotidienne',
                description: 'Obtenez un score parfait sur 3 exercices aujourd\'hui',
                type: ChallengeType.DAILY,
                difficulty: 2,
                startDate: now,
                endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                rewardPoints: 25,
                criteria: {
                    type: 'success_rate',
                    target: 1,
                    params: {
                        exerciseCount: 3,
                        minScore: 1
                    }
                },
                progress: 0,
                completed: false
            },

            // Défis hebdomadaires
            {
                id: 'weekly_streak',
                title: 'Séquence Hebdomadaire',
                description: 'Pratiquez chaque jour pendant une semaine',
                type: ChallengeType.WEEKLY,
                difficulty: 3,
                startDate: now,
                endDate: weekLater,
                rewardPoints: 100,
                rewardBadgeId: 'one_week_streak',
                criteria: {
                    type: 'streak',
                    target: 7
                },
                progress: 0,
                completed: false
            },
            {
                id: 'weekly_mastery',
                title: 'Maîtrise Hebdomadaire',
                description: 'Maîtrisez 10 nouveaux signes cette semaine',
                type: ChallengeType.WEEKLY,
                difficulty: 2,
                startDate: now,
                endDate: weekLater,
                rewardPoints: 75,
                criteria: {
                    type: 'skill_mastery',
                    target: 10
                },
                progress: 0,
                completed: false
            },
            {
                id: 'weekly_time',
                title: 'Temps d\'Étude',
                description: 'Étudiez pendant au moins 2 heures cette semaine',
                type: ChallengeType.WEEKLY,
                difficulty: 2,
                startDate: now,
                endDate: weekLater,
                rewardPoints: 50,
                criteria: {
                    type: 'time_spent',
                    target: 120 // minutes
                },
                progress: 0,
                completed: false
            },

            // Défis spéciaux
            {
                id: 'video_challenge',
                title: 'Défi Vidéo',
                description: 'Complétez 5 exercices de réponse vidéo',
                type: ChallengeType.SPECIAL,
                difficulty: 3,
                startDate: now,
                endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                rewardPoints: 150,
                rewardBadgeId: 'video_master',
                criteria: {
                    type: 'exercise_count',
                    target: 5,
                    params: {
                        exerciseType: 'VideoResponse'
                    }
                },
                progress: 0,
                completed: false
            },
            {
                id: 'conversation_challenge',
                title: 'Défi Conversation',
                description: 'Participez à 3 conversations en LSF',
                type: ChallengeType.SPECIAL,
                difficulty: 4,
                startDate: now,
                endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                rewardPoints: 200,
                rewardBadgeId: 'conversation_master',
                criteria: {
                    type: 'custom',
                    target: 3,
                    params: {
                        activity: 'conversation'
                    }
                },
                progress: 0,
                completed: false
            }
        ];
    }

    /**
     * Assigne des défis quotidiens à un utilisateur
     * @param profile Profil de l'utilisateur
     */
    public assignDailyChallenges(profile: GamificationProfile): void {
        // Filtrer les défis quotidiens du catalogue
        const dailyChallenges = this.challengeCatalog.filter(challenge =>
            challenge.endDate.getTime() - challenge.startDate.getTime() <= 24 * 60 * 60 * 1000
        );

        // Sélectionner 2 défis aléatoires
        const selectedChallenges = this.getRandomElements(dailyChallenges, 2);

        // Créer des copies pour l'utilisateur
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        for (const challenge of selectedChallenges) {
            const userChallenge: Challenge = {
                ...challenge,
                id: `${challenge.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                startDate: now,
                endDate: tomorrow,
                progress: 0,
                completed: false,
                type: challenge.type
            };

            profile.activeChallenges.push(userChallenge);
        }
    }

    /**
     * Met à jour la progression des défis
     * @param profile Profil de l'utilisateur
     * @param eventData Données de l'événement
     * @returns Défis complétés
     */
    public updateChallengesProgress(
        profile: GamificationProfile,
        eventData: ActivityData
    ): Challenge[] {
        const completedChallenges: Challenge[] = [];
        const now = new Date();

        // Mettre à jour les défis actifs
        for (let i = 0; i < profile.activeChallenges.length; i++) {
            const challenge = profile.activeChallenges[i];

            // Vérifier si le défi est toujours actif
            if (challenge.endDate < now) {
                // Défi expiré, le déplacer vers les défis expirés
                profile.activeChallenges.splice(i, 1);
                i--; // Ajuster l'index
                continue;
            }

            // Mettre à jour la progression selon le type de défi
            switch (challenge.criteria.type) {
                case 'exercise_count':
                    if (eventData.type === 'exercise') {
                        // Vérifier le type d'exercice si spécifié
                        const exerciseType = challenge.criteria.params?.exerciseType;
                        if (exerciseType && eventData.exerciseType !== exerciseType) {
                            continue; // Ne pas compter cet exercice
                        }

                        challenge.progress += 1 / challenge.criteria.target;
                    }
                    break;

                case 'success_rate':
                    if (eventData.type === 'exercise' && typeof eventData.score === 'number') {
                        const minScore = challenge.criteria.params?.minScore as number || 0.7;
                        const exerciseCount = challenge.criteria.params?.exerciseCount as number || 1;

                        if (eventData.score >= minScore) {
                            challenge.progress += 1 / exerciseCount;
                        }
                    }
                    break;

                case 'streak':
                    // Mis à jour ailleurs
                    break;

                case 'skill_mastery':
                    if (eventData.type === 'skill' && eventData.mastered) {
                        challenge.progress += 1 / challenge.criteria.target;
                    }
                    break;

                case 'time_spent':
                    // Mis à jour ailleurs
                    break;

                case 'custom':
                    // Traitement personnalisé selon les paramètres
                    const activityType = challenge.criteria.params?.activity;
                    if (activityType && eventData.type === activityType) {
                        challenge.progress += 1 / challenge.criteria.target;
                    }
                    break;
            }

            // Limiter la progression à 1
            challenge.progress = Math.min(1, challenge.progress);

            // Vérifier si le défi est complété
            if (challenge.progress >= 1 && !challenge.completed) {
                challenge.completed = true;
                challenge.completedAt = new Date();

                // Déplacer vers les défis complétés
                completedChallenges.push(challenge);
                profile.completedChallenges.push(challenge);
                profile.activeChallenges.splice(i, 1);
                i--; // Ajuster l'index
            }
        }

        // Si les défis quotidiens sont épuisés, en assigner de nouveaux
        if (profile.activeChallenges.length === 0) {
            this.assignDailyChallenges(profile);
        }

        return completedChallenges;
    }

    /**
     * Réinitialise les défis quotidiens d'un utilisateur
     * @param profile Profil de l'utilisateur
     * @returns Nouveaux défis quotidiens
     */
    public resetDailyChallenges(profile: GamificationProfile): Challenge[] {
        // Filtrer les défis non quotidiens
        const nonDailyChallenges = profile.activeChallenges.filter(challenge =>
            challenge.endDate.getTime() - challenge.startDate.getTime() > 24 * 60 * 60 * 1000
        );

        // Réinitialiser les défis
        profile.activeChallenges = nonDailyChallenges;

        // Assigner de nouveaux défis quotidiens
        this.assignDailyChallenges(profile);

        // Retourner les défis quotidiens
        return profile.activeChallenges.filter(challenge =>
            challenge.endDate.getTime() - challenge.startDate.getTime() <= 24 * 60 * 60 * 1000
        );
    }

    /**
     * Obtient tous les défis disponibles
     * @returns Liste de tous les défis
     */
    public getAllChallenges(): Challenge[] {
        return [...this.challengeCatalog];
    }

    /**
     * Sélectionne aléatoirement des éléments dans un tableau
     * @param array Tableau source
     * @param count Nombre d'éléments à sélectionner
     * @returns Éléments sélectionnés
     * @private
     */
    private getRandomElements<T>(array: T[], count: number): T[] {
        if (array.length <= count) {
            return [...array];
        }

        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}