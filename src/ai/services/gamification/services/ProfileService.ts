/**
 * Service pour la gestion des profils utilisateurs dans le système de gamification
 * 
 * @file src/ai/services/learning/gamification/services/ProfileService.ts
 */

import { Badge, GamificationProfile } from '../types';

/**
 * Service de gestion des profils utilisateurs
 */
export class ProfileService {
    private profiles: Map<string, GamificationProfile>;

    /**
     * Initialise le service de profils
     */
    constructor() {
        this.profiles = new Map();
    }

    /**
     * Obtient ou crée un profil de gamification
     * @param userId Identifiant de l'utilisateur
     * @param createNewProfile Fonction de création d'un nouveau profil
     * @returns Profil de gamification
     */
    public async getOrCreateProfile(
        userId: string,
        createNewProfile: () => GamificationProfile
    ): Promise<GamificationProfile> {
        // Vérifier si le profil existe déjà en cache
        if (this.profiles.has(userId)) {
            return this.profiles.get(userId)!;
        }

        // Tenter de charger le profil depuis le stockage
        const storedProfile = await this.loadProfile(userId);

        if (storedProfile) {
            // Mettre en cache
            this.profiles.set(userId, storedProfile);
            return storedProfile;
        }

        // Créer un nouveau profil
        const newProfile = createNewProfile();

        // Mettre en cache
        this.profiles.set(userId, newProfile);

        // Sauvegarder
        await this.saveProfile(newProfile);

        return newProfile;
    }

    /**
     * Charge un profil depuis le stockage
     * @param userId Identifiant de l'utilisateur
     * @returns Profil chargé ou undefined si non trouvé
     * @private
     */
    public async loadProfile(userId: string): Promise<GamificationProfile | undefined> {
        // Simulation - à remplacer par une véritable implémentation
        // Par exemple, récupération depuis une base de données
        console.log(`Chargement du profil pour l'utilisateur ${userId}`);
        return undefined;
    }

    /**
     * Sauvegarde un profil dans le stockage
     * @param profile Profil à sauvegarder
     * @private
     */
    public async saveProfile(profile: GamificationProfile): Promise<void> {
        // Simulation - à remplacer par une véritable implémentation
        // Par exemple, sauvegarde dans une base de données
        console.log(`Sauvegarde du profil pour l'utilisateur ${profile.userId}`);
    }

    /**
     * Met à jour l'historique d'activité d'un profil
     * @param profile Profil de l'utilisateur
     * @param points Points gagnés
     */
    public updateActivityHistory(profile: GamificationProfile, points: number): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliser à minuit

        // Vérifier si une entrée existe déjà pour aujourd'hui
        const todayEntry = profile.activityHistory.find(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });

        if (todayEntry) {
            // Mettre à jour l'entrée existante
            todayEntry.points += points;
        } else {
            // Créer une nouvelle entrée
            profile.activityHistory.push({
                date: today,
                points
            });

            // Incrémenter le compteur de jours actifs
            profile.stats.activeDays += 1;
        }

        // Limiter la taille de l'historique (garder les 90 derniers jours)
        if (profile.activityHistory.length > 90) {
            profile.activityHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
            profile.activityHistory = profile.activityHistory.slice(0, 90);
        }
    }

    /**
     * Met à jour la séquence d'activité d'un profil
     * @param profile Profil de l'utilisateur
     * @returns Liste des badges de séquence obtenus
     */
    public updateStreak(profile: GamificationProfile): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliser à minuit

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastActivity = new Date(profile.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);

        if (lastActivity.getTime() === yesterday.getTime()) {
            // Activité consécutive
            profile.currentStreak += 1;
        } else if (lastActivity.getTime() < yesterday.getTime()) {
            // Séquence interrompue
            profile.currentStreak = 1;
        }
        // Si lastActivity est aujourd'hui, on ne change pas la séquence

        // Mettre à jour la meilleure séquence si nécessaire
        if (profile.currentStreak > profile.bestStreak) {
            profile.bestStreak = profile.currentStreak;
        }

        // Mettre à jour la date de dernière activité
        profile.lastActivityDate = today;
    }

    /**
     * Ajoute un badge au profil
     * @param profile Profil de l'utilisateur
     * @param badge Badge à ajouter
     * @returns Badge ajouté
     */
    public addBadge(profile: GamificationProfile, badge: Badge): Badge {
        const badgeWithDate = { ...badge, earnedAt: new Date() };
        profile.badges.push(badgeWithDate);
        profile.totalPoints += badge.bonusPoints;
        return badgeWithDate;
    }

    /**
     * Met à jour la moyenne de points quotidiens
     * @param profile Profil de l'utilisateur
     */
    public updateAverageDailyPoints(profile: GamificationProfile): void {
        if (profile.activityHistory.length === 0) {
            profile.stats.averageDailyPoints = 0;
            return;
        }

        // Calculer la moyenne des points par jour actif
        const totalPoints = profile.activityHistory.reduce((sum, entry) => sum + entry.points, 0);
        profile.stats.averageDailyPoints = totalPoints / profile.activityHistory.length;
    }

    /**
     * Met à jour les préférences de gamification d'un utilisateur
     * @param profile Profil de l'utilisateur
     * @param preferences Nouvelles préférences
     * @returns Profil mis à jour
     */
    public updatePreferences(
        profile: GamificationProfile,
        preferences: Partial<GamificationProfile['preferences']>
    ): GamificationProfile {
        // Mettre à jour les préférences
        profile.preferences = {
            ...profile.preferences,
            ...preferences
        };

        return profile;
    }

    /**
     * Crée un profil par défaut pour un nouvel utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Nouveau profil
     */
    public createDefaultProfile(userId: string): GamificationProfile {
        return {
            userId,
            totalPoints: 0,
            currentLevel: 1,
            pointsToNextLevel: 100, // Sera mis à jour lors de l'attribution des niveaux
            badges: [],
            activeChallenges: [],
            completedChallenges: [],
            currentStreak: 0,
            bestStreak: 0,
            lastActivityDate: new Date(0), // Date zéro
            activityHistory: [],
            stats: {
                exercisesCompleted: 0,
                activeDays: 0,
                pointsByCategory: {},
                averageDailyPoints: 0
            },
            preferences: {
                notificationsEnabled: true,
                leaderboardEnabled: true,
                socialChallengesEnabled: true,
                visualStyle: 'default'
            }
        };
    }
}