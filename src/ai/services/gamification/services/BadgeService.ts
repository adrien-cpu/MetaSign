/**
 * Service pour la gestion des badges dans le système de gamification
 * 
 * @file src/ai/services/learning/gamification/services/BadgeService.ts
 */

import { Badge, GamificationProfile } from '../types';

/**
 * Service de gestion des badges
 */
export class BadgeService {
    private badgeCatalog: Badge[];

    /**
     * Initialise le service de badges
     */
    constructor() {
        this.badgeCatalog = this.initializeBadges();
    }

    /**
     * Initialise le catalogue de badges
     * @returns Liste des badges
     * @private
     */
    private initializeBadges(): Badge[] {
        return [
            // Badges de bienvenue
            {
                id: 'welcome',
                title: 'Bienvenue',
                description: 'Bienvenue dans votre parcours d\'apprentissage de la LSF',
                category: 'special',
                level: 1,
                criteria: 'S\'inscrire à la plateforme',
                bonusPoints: 10
            },
            {
                id: 'welcome_explorer',
                title: 'Explorateur',
                description: 'Vous avez commencé à explorer le monde de la LSF',
                category: 'progress',
                level: 1,
                criteria: 'Atteindre le niveau 2',
                bonusPoints: 20
            },
            {
                id: 'learning_apprentice',
                title: 'Apprenti',
                description: 'Vos efforts commencent à porter leurs fruits',
                category: 'progress',
                level: 1,
                criteria: 'Atteindre le niveau 3',
                bonusPoints: 30
            },

            // Badges de compétence
            {
                id: 'vocabulary_novice',
                title: 'Vocabulaire Novice',
                description: 'Vous avez appris vos premiers signes',
                category: 'skill',
                level: 1,
                criteria: 'Apprendre 20 signes',
                bonusPoints: 15
            },
            {
                id: 'vocabulary_student',
                title: 'Vocabulaire Étudiant',
                description: 'Votre vocabulaire s\'enrichit',
                category: 'skill',
                level: 2,
                criteria: 'Apprendre 100 signes',
                bonusPoints: 30
            },
            {
                id: 'vocabulary_master',
                title: 'Vocabulaire Maître',
                description: 'Votre vocabulaire est maintenant très riche',
                category: 'skill',
                level: 3,
                criteria: 'Apprendre 500 signes',
                bonusPoints: 100
            },

            // Badges de progression
            {
                id: 'first_exercise',
                title: 'Premier Pas',
                description: 'Vous avez complété votre premier exercice',
                category: 'progress',
                level: 1,
                criteria: 'Compléter 1 exercice',
                bonusPoints: 5
            },
            {
                id: 'tenth_exercise',
                title: 'Sur la bonne voie',
                description: 'Vous avez complété 10 exercices',
                category: 'progress',
                level: 1,
                criteria: 'Compléter 10 exercices',
                bonusPoints: 20
            },
            {
                id: 'fiftieth_exercise',
                title: 'Persévérance',
                description: 'Vous avez complété 50 exercices',
                category: 'progress',
                level: 2,
                criteria: 'Compléter 50 exercices',
                bonusPoints: 50
            },
            {
                id: 'hundredth_exercise',
                title: 'Dévouement',
                description: 'Vous avez complété 100 exercices',
                category: 'progress',
                level: 2,
                criteria: 'Compléter 100 exercices',
                bonusPoints: 100
            },
            {
                id: 'master_exercises',
                title: 'Maître des Exercices',
                description: 'Vous avez complété 500 exercices',
                category: 'progress',
                level: 3,
                criteria: 'Compléter 500 exercices',
                bonusPoints: 200
            },

            // Badges de réussite
            {
                id: 'perfect_score',
                title: 'Score Parfait',
                description: 'Vous avez obtenu un score parfait',
                category: 'achievement',
                level: 1,
                criteria: 'Obtenir 100% sur un exercice',
                bonusPoints: 10
            },
            {
                id: 'perfect_session',
                title: 'Session Parfaite',
                description: 'Vous avez obtenu un score parfait sur tous les exercices d\'une session',
                category: 'achievement',
                level: 2,
                criteria: 'Obtenir 100% sur tous les exercices d\'une session',
                bonusPoints: 50
            },
            {
                id: 'perfect_streak',
                title: 'Série Parfaite',
                description: 'Vous avez obtenu 10 scores parfaits consécutifs',
                category: 'achievement',
                level: 3,
                criteria: 'Obtenir 10 scores parfaits consécutifs',
                bonusPoints: 100
            },

            // Badges de régularité
            {
                id: 'one_week_streak',
                title: 'Une Semaine Régulière',
                description: 'Vous avez pratiqué 7 jours consécutifs',
                category: 'achievement',
                level: 1,
                criteria: 'Pratiquer 7 jours consécutifs',
                bonusPoints: 20
            },
            {
                id: 'one_month_streak',
                title: 'Un Mois Régulier',
                description: 'Vous avez pratiqué 30 jours consécutifs',
                category: 'achievement',
                level: 2,
                criteria: 'Pratiquer 30 jours consécutifs',
                bonusPoints: 100
            },
            {
                id: 'three_month_streak',
                title: 'Trois Mois Réguliers',
                description: 'Vous avez pratiqué 90 jours consécutifs',
                category: 'achievement',
                level: 3,
                criteria: 'Pratiquer 90 jours consécutifs',
                bonusPoints: 300
            },

            // Badges spéciaux
            {
                id: 'night_owl',
                title: 'Oiseau de Nuit',
                description: 'Vous aimez étudier tard dans la nuit',
                category: 'special',
                level: 1,
                criteria: 'Étudier après minuit 5 fois',
                bonusPoints: 20
            },
            {
                id: 'early_bird',
                title: 'Lève-Tôt',
                description: 'Vous aimez étudier tôt le matin',
                category: 'special',
                level: 1,
                criteria: 'Étudier avant 7h du matin 5 fois',
                bonusPoints: 20
            },
            {
                id: 'weekend_warrior',
                title: 'Guerrier du Weekend',
                description: 'Vous étudiez même le weekend',
                category: 'special',
                level: 2,
                criteria: 'Étudier 10 weekends consécutifs',
                bonusPoints: 50
            }
        ];
    }

    /**
     * Récupère un badge par son identifiant
     * @param badgeId Identifiant du badge
     * @returns Badge trouvé ou undefined si non trouvé
     */
    public getBadgeById(badgeId: string): Badge | undefined {
        return this.badgeCatalog.find(badge => badge.id === badgeId);
    }

    /**
     * Vérifie si un utilisateur possède un badge
     * @param profile Profil de l'utilisateur
     * @param badgeId Identifiant du badge
     * @returns Vrai si l'utilisateur possède le badge
     */
    public hasBadge(profile: GamificationProfile, badgeId: string): boolean {
        return profile.badges.some(badge => badge.id === badgeId);
    }

    /**
     * Vérifie les badges liés aux exercices
     * @param profile Profil de l'utilisateur
     * @returns Badges obtenus
     */
    public checkExerciseBadges(profile: GamificationProfile): Badge[] {
        const earnedBadges: Badge[] = [];

        // Badges de progression d'exercice
        const exerciseCountBadges = [
            { id: 'first_exercise', count: 1 },
            { id: 'tenth_exercise', count: 10 },
            { id: 'fiftieth_exercise', count: 50 },
            { id: 'hundredth_exercise', count: 100 },
            { id: 'master_exercises', count: 500 }
        ];

        for (const badgeInfo of exerciseCountBadges) {
            if (profile.stats.exercisesCompleted >= badgeInfo.count &&
                !this.hasBadge(profile, badgeInfo.id)) {
                const badge = this.getBadgeById(badgeInfo.id);
                if (badge) {
                    badge.earnedAt = new Date();
                    earnedBadges.push({ ...badge });
                }
            }
        }

        return earnedBadges;
    }

    /**
         * Vérifie les badges liés aux compétences
         * @returns Badges obtenus
         */
    public checkSkillBadges(): Badge[] {
        // Note: Ceci est une implémentation simplifiée
        // Dans une implémentation réelle, il faudrait avoir un compteur de compétences maîtrisées
        return [];
    }

    /**
     * Vérifie les badges liés aux séquences d'activité
     * @param profile Profil de l'utilisateur
     * @returns Badges obtenus
     */
    public checkStreakBadges(profile: GamificationProfile): Badge[] {
        const earnedBadges: Badge[] = [];

        // Badges de séquence
        const streakBadges = [
            { id: 'one_week_streak', days: 7 },
            { id: 'one_month_streak', days: 30 },
            { id: 'three_month_streak', days: 90 }
        ];

        for (const badgeInfo of streakBadges) {
            if (profile.currentStreak >= badgeInfo.days &&
                !this.hasBadge(profile, badgeInfo.id)) {
                const badge = this.getBadgeById(badgeInfo.id);
                if (badge) {
                    earnedBadges.push({ ...badge });
                }
            }
        }

        return earnedBadges;
    }

    /**
     * Obtient tous les badges disponibles
     * @returns Liste de tous les badges
     */
    public getAllBadges(): Badge[] {
        return [...this.badgeCatalog];
    }
}