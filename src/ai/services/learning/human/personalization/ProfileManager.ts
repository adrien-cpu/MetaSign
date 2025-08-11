/**
 * @file src/ai/services/learning/human/personalization/ProfileManager.ts
 * @description Gestionnaire de profil utilisateur pour le système d'apprentissage adaptatif.
 * 
 * Ce module gère la récupération, la mise à jour et l'analyse des profils d'utilisateurs,
 * ainsi que le suivi de la progression des utilisateurs.
 * 
 * @module UserProfileManager
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { Logger } from '@/ai/utils/Logger';
import {
    ProfilType,
    CompetencyLevel,
    LearningStyle
} from '../../types';
import type {
    ExtendedUserProfile,
    LearningPreferences,
    ProgressData,
    UserPerformanceData,
    LearningHistory,
    UserSettings
} from '../../types';
import type { IUserProfileManager } from './interfaces/IUserProfileManager';

/**
 * Interface pour le stockage des profils utilisateurs
 * Définie localement pour éviter les problèmes d'import circulaire
 */
export interface IUserProfileStorage {
    saveProfile(profile: ExtendedUserProfile): Promise<void>;
    getProfile(userId: string): Promise<ExtendedUserProfile | null>;
    profileExists(userId: string): Promise<boolean>;
    deleteProfile(userId: string): Promise<void>;
    listUserIds(): Promise<string[]>;
}

/**
 * Stockage en mémoire pour les profils utilisateurs
 * Implémentation simple pour les tests et développement
 */
export class InMemoryUserProfileStorage implements IUserProfileStorage {
    private readonly profiles = new Map<string, ExtendedUserProfile>();
    private readonly logger = Logger.getInstance('InMemoryUserProfileStorage');

    /**
     * Sauvegarde un profil utilisateur en mémoire
     * 
     * @param profile - Profil à sauvegarder
     */
    public async saveProfile(profile: ExtendedUserProfile): Promise<void> {
        this.logger.debug(`Saving profile for user ${profile.userId}`);
        this.profiles.set(profile.userId, { ...profile });
    }

    /**
     * Récupère un profil utilisateur de la mémoire
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Profil utilisateur ou null si inexistant
     */
    public async getProfile(userId: string): Promise<ExtendedUserProfile | null> {
        const profile = this.profiles.get(userId);
        return profile ? { ...profile } : null;
    }

    /**
     * Vérifie si un profil existe en mémoire
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns true si le profil existe
     */
    public async profileExists(userId: string): Promise<boolean> {
        return this.profiles.has(userId);
    }

    /**
     * Supprime un profil utilisateur de la mémoire
     * 
     * @param userId - Identifiant de l'utilisateur
     */
    public async deleteProfile(userId: string): Promise<void> {
        this.logger.debug(`Deleting profile for user ${userId}`);
        this.profiles.delete(userId);
    }

    /**
     * Liste tous les identifiants d'utilisateurs
     * 
     * @returns Liste des identifiants
     */
    public async listUserIds(): Promise<string[]> {
        return Array.from(this.profiles.keys());
    }
}

/**
 * Gestionnaire de profil utilisateur pour le système d'apprentissage adaptatif.
 * Responsable de la gestion, la récupération et la mise à jour des profils d'utilisateurs.
 */
export class UserProfileManager implements IUserProfileManager {
    private readonly logger = Logger.getInstance('UserProfileManager');
    private readonly profileCache = new Map<string, { profile: ExtendedUserProfile; timestamp: number }>();
    private readonly storage: IUserProfileStorage;

    // Durée de validité du cache en millisecondes (15 minutes)
    private readonly cacheTTL = 15 * 60 * 1000;
    // Seuil de maîtrise pour considérer un concept comme acquis
    private readonly masteryThreshold = 0.8;

    constructor(storage?: IUserProfileStorage) {
        this.storage = storage || new InMemoryUserProfileStorage();
    }

    /**
     * Récupère le profil d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Profil complet de l'utilisateur
     */
    public async getProfile(userId: string): Promise<ExtendedUserProfile> {
        try {
            this.logger.debug(`Getting profile for user ${userId}`);

            // Vérifier si le profil est en cache et valide
            const cachedEntry = this.profileCache.get(userId);
            if (cachedEntry && (Date.now() - cachedEntry.timestamp < this.cacheTTL)) {
                this.logger.debug(`Using cached profile for user ${userId}`);
                return cachedEntry.profile;
            }

            // Récupérer le profil depuis le stockage
            const profile = await this.storage.getProfile(userId);
            if (!profile) {
                throw new Error(`Profile not found for user ${userId}`);
            }

            // Mettre en cache
            this.profileCache.set(userId, {
                profile,
                timestamp: Date.now()
            });

            return profile;
        } catch (error) {
            this.logger.error(`Error getting profile for user ${userId}`, { error });
            throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Récupère ou crée un profil utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Profil utilisateur (existant ou nouvellement créé)
     */
    public async getOrCreateProfile(userId: string): Promise<ExtendedUserProfile> {
        try {
            // Tenter de récupérer le profil existant
            const existingProfile = await this.storage.getProfile(userId);
            if (existingProfile) {
                return existingProfile;
            }

            // Créer un nouveau profil avec des valeurs par défaut
            const newProfile = this.createDefaultProfile(userId);
            await this.storage.saveProfile(newProfile);

            this.logger.info(`Created new profile for user ${userId}`);
            return newProfile;
        } catch (error) {
            this.logger.error(`Error getting or creating profile for user ${userId}`, { error });
            throw new Error(`Failed to get or create user profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Alias pour getProfile, utilisé par RealTimeAdapter
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Profil complet de l'utilisateur
     */
    public async getUserProfile(userId: string): Promise<ExtendedUserProfile> {
        return this.getOrCreateProfile(userId);
    }

    /**
     * Met à jour le profil d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param updates - Mises à jour à appliquer au profil
     * @returns Profil mis à jour
     */
    public async updateProfile(userId: string, updates: Partial<ExtendedUserProfile>): Promise<ExtendedUserProfile> {
        try {
            this.logger.info(`Updating profile for user ${userId}`);

            // Récupérer ou créer le profil actuel
            const currentProfile = await this.getOrCreateProfile(userId);

            // Fusionner les mises à jour avec le profil actuel
            const updatedProfile = this.mergeProfiles(currentProfile, updates);

            // Mettre à jour les métadonnées
            if (updatedProfile.metadata) {
                updatedProfile.metadata = {
                    ...updatedProfile.metadata,
                    lastUpdated: new Date()
                };
            } else {
                updatedProfile.metadata = {
                    lastUpdated: new Date()
                };
            }

            // Sauvegarder
            await this.storage.saveProfile(updatedProfile);

            // Mettre à jour le cache
            this.profileCache.set(userId, {
                profile: updatedProfile,
                timestamp: Date.now()
            });

            return updatedProfile;
        } catch (error) {
            this.logger.error(`Error updating profile for user ${userId}`, { error });
            throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyse les préférences d'apprentissage
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Préférences d'apprentissage analysées
     */
    public async analyzePreferences(userId: string): Promise<LearningPreferences> {
        try {
            this.logger.info(`Analyzing learning preferences for user ${userId}`);

            // Récupérer le profil
            const profile = await this.getOrCreateProfile(userId);

            // Utiliser les préférences existantes ou créer de nouvelles préférences
            if (profile.preferences) {
                return profile.preferences;
            }

            // Créer des préférences par défaut
            const defaultPreferences = this.createDefaultPreferences();

            // Mettre à jour le profil avec les préférences par défaut
            await this.updateProfile(userId, { preferences: defaultPreferences });

            return defaultPreferences;
        } catch (error) {
            this.logger.error(`Error analyzing preferences for user ${userId}`, { error });
            throw new Error(`Failed to analyze learning preferences: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Met à jour les préférences d'apprentissage d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param preferences - Nouvelles préférences à appliquer
     * @returns Profil mis à jour
     */
    public async updatePreferences(userId: string, preferences: Partial<LearningPreferences>): Promise<ExtendedUserProfile> {
        try {
            const profile = await this.getOrCreateProfile(userId);
            const currentPreferences = profile.preferences || this.createDefaultPreferences();

            const updatedPreferences: LearningPreferences = {
                ...currentPreferences,
                ...preferences
            };

            return await this.updateProfile(userId, { preferences: updatedPreferences });
        } catch (error) {
            this.logger.error(`Error updating preferences for user ${userId}`, { error });
            throw new Error(`Failed to update user preferences: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Suit la progression de l'utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param progressData - Données de progression
     */
    public async trackProgress(userId: string, progressData: ProgressData): Promise<void> {
        try {
            this.logger.info(`Tracking progress for user ${userId}`);

            // Vérifier que les données de progression correspondent à l'utilisateur
            if (progressData.userId !== userId) {
                throw new Error('User ID mismatch in progress data');
            }

            // Récupérer le profil
            const profile = await this.getOrCreateProfile(userId);

            // Mettre à jour l'historique
            const history = profile.history || this.createDefaultHistory();

            // Ajouter l'activité complétée
            if (progressData.completionStatus === 'completed' && !history.completedActivities.includes(progressData.activityId)) {
                history.completedActivities.push(progressData.activityId);
            }

            // Ajouter les concepts maîtrisés
            if (progressData.masteredConcepts && progressData.masteredConcepts.length > 0) {
                for (const concept of progressData.masteredConcepts) {
                    if (!history.masteredConcepts.includes(concept)) {
                        history.masteredConcepts.push(concept);
                    }
                }
            }

            // Mettre à jour le temps total
            history.totalLearningTime += progressData.timeSpent;

            // Sauvegarder les modifications
            await this.updateProfile(userId, { history });

            this.logger.debug(`Progress tracked successfully for user ${userId}`);
        } catch (error) {
            this.logger.error(`Error tracking progress for user ${userId}`, { error });
            throw new Error(`Failed to track progress: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Met à jour les compétences d'un utilisateur basé sur ses performances
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param performanceData - Données de performance
     * @returns Profil mis à jour
     */
    public async updateSkills(userId: string, performanceData: UserPerformanceData): Promise<ExtendedUserProfile> {
        try {
            this.logger.info(`Updating skills for user ${userId}`);

            const profile = await this.getOrCreateProfile(userId);
            const skills = profile.skills || {};
            const history = profile.history || this.createDefaultHistory();

            // Analyser les exercices
            for (const exercise of performanceData.exercises) {
                const currentSkill = skills[exercise.conceptId] || 0;

                // Calculer la nouvelle compétence basée sur le taux de réussite
                const weight = 0.3; // Poids de la nouvelle performance
                const newSkill = currentSkill * (1 - weight) + exercise.successRate * weight;
                skills[exercise.conceptId] = Math.max(0, Math.min(1, newSkill));

                // Vérifier la maîtrise
                if (newSkill >= this.masteryThreshold && !history.masteredConcepts.includes(exercise.conceptId)) {
                    history.masteredConcepts.push(exercise.conceptId);
                }
            }

            // Identifier les difficultés récurrentes
            for (const difficulty of performanceData.interactionPatterns.hesitations) {
                if (!history.recurringDifficulties.includes(difficulty)) {
                    history.recurringDifficulties.push(difficulty);
                }
            }

            // Calculer le niveau de compétence global
            const averageSkill = Object.values(skills).reduce((sum, skill) => sum + skill, 0) / Object.keys(skills).length;
            const skillLevel = this.calculateSkillLevel(averageSkill);

            // Mettre à jour l'historique avec les nouveaux exercices
            history.completedActivities.push(...performanceData.exercises.map(ex => ex.id));
            history.totalLearningTime += performanceData.exercises.reduce((total, ex) => total + ex.completionTime, 0);

            return await this.updateProfile(userId, {
                skills,
                skillLevel,
                history
            });
        } catch (error) {
            this.logger.error(`Error updating skills for user ${userId}`, { error });
            throw new Error(`Failed to update skills: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyse les intérêts d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Liste des intérêts
     */
    public async analyzeInterests(userId: string): Promise<string[]> {
        try {
            this.logger.info(`Analyzing interests for user ${userId}`);

            const profile = await this.getOrCreateProfile(userId);

            // Retourner les intérêts existants s'ils sont définis
            if (profile.interests && profile.interests.length > 0) {
                return profile.interests;
            }

            // Déduire les intérêts à partir des compétences
            const skills = profile.skills || {};
            const interests: string[] = [];

            // Identifier les domaines de forte compétence comme intérêts
            for (const [concept, skillLevel] of Object.entries(skills)) {
                if (skillLevel >= 0.6) { // Seuil pour considérer comme intérêt
                    interests.push(concept);
                }
            }

            // Mettre à jour le profil avec les intérêts déduits
            if (interests.length > 0) {
                await this.updateProfile(userId, { interests });
            }

            return interests;
        } catch (error) {
            this.logger.error(`Error analyzing interests for user ${userId}`, { error });
            throw new Error(`Failed to analyze interests: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Calcule la compatibilité entre un utilisateur et des sujets de contenu
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param contentTopics - Liste des sujets du contenu
     * @returns Score de compatibilité (0-1)
     */
    public async calculateContentCompatibility(userId: string, contentTopics: string[]): Promise<number> {
        try {
            this.logger.debug(`Calculating content compatibility for user ${userId}`);

            // Analyser les intérêts de l'utilisateur
            const interests = await this.analyzeInterests(userId);

            if (interests.length === 0 || contentTopics.length === 0) {
                return 0;
            }

            // Calculer le nombre de correspondances
            const matches = contentTopics.filter(topic => interests.includes(topic)).length;

            // Calculer le score de compatibilité
            const compatibilityScore = matches / Math.max(interests.length, contentTopics.length);

            return Math.min(1, Math.max(0, compatibilityScore));
        } catch (error) {
            this.logger.error(`Error calculating content compatibility for user ${userId}`, { error });
            throw new Error(`Failed to calculate content compatibility: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Supprime le profil d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     */
    public async deleteUserProfile(userId: string): Promise<void> {
        try {
            this.logger.info(`Deleting profile for user ${userId}`);

            // Supprimer du stockage
            await this.storage.deleteProfile(userId);

            // Supprimer du cache
            this.profileCache.delete(userId);

            this.logger.info(`Profile deleted successfully for user ${userId}`);
        } catch (error) {
            this.logger.error(`Error deleting profile for user ${userId}`, { error });
            throw new Error(`Failed to delete user profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Crée un profil par défaut pour un nouvel utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @returns Profil par défaut
     */
    private createDefaultProfile(userId: string): ExtendedUserProfile {
        const now = new Date();

        return {
            id: userId,
            userId,
            profilType: ProfilType.ENTENDANT,
            learningPreferences: {
                preferredContentTypes: ['video', 'interactive'],
                preferredPace: 'moderate' as const,
                preferredFeedbackFrequency: 'medium' as const
            },
            skillLevels: {},
            completedCourses: [],
            inProgressCourses: [],
            badges: [],
            experience: 0,
            level: 1,
            lastActive: now,
            preferredEnvironments: [],
            hasFederatedLearningConsent: false,
            skillLevel: CompetencyLevel.BEGINNER,
            skills: {},
            gaps: {},
            interests: [],
            competencies: {},
            history: this.createDefaultHistory(),
            settings: this.createDefaultSettings(),
            preferences: this.createDefaultPreferences(),
            metadata: {
                lastLogin: now.toISOString(),
                preferredLanguage: 'fr',
                createdAt: now,
                lastUpdated: now
            }
        };
    }

    /**
     * Crée des préférences d'apprentissage par défaut
     * 
     * @returns Préférences par défaut
     */
    private createDefaultPreferences(): LearningPreferences {
        return {
            preferredPace: 5,
            preferredLearningStyle: LearningStyle.VISUAL,
            preferredContentTypes: ['video', 'interactive'],
            goalOrientation: 'mastery',
            preferredTimeOfDay: ['afternoon'],
            pacePreference: 'moderate',
            assistanceLevel: 0.5,
            adaptivityLevel: 0.7,
            controlPreference: 'medium',
            socialPreference: 'individual',
            requiresStructure: true,
            prefersFeedback: true
        };
    }

    /**
     * Crée un historique d'apprentissage par défaut
     * 
     * @returns Historique par défaut
     */
    private createDefaultHistory(): LearningHistory {
        return {
            completedActivities: [],
            startedButNotCompletedActivities: [],
            assessmentResults: {},
            masteredConcepts: [],
            recurringDifficulties: [],
            totalLearningTime: 0
        };
    }

    /**
     * Crée des paramètres utilisateur par défaut
     * 
     * @returns Paramètres par défaut
     */
    private createDefaultSettings(): UserSettings {
        return {
            notifications: true,
            assistanceLevel: 5,
            dataCollectionConsent: false
        };
    }

    /**
     * Calcule le niveau de compétence basé sur la moyenne des compétences
     * 
     * @param averageSkill - Compétence moyenne (0-1)
     * @returns Niveau de compétence
     */
    private calculateSkillLevel(averageSkill: number): CompetencyLevel {
        if (averageSkill >= 0.8) return CompetencyLevel.EXPERT;
        if (averageSkill >= 0.6) return CompetencyLevel.ADVANCED;
        if (averageSkill >= 0.4) return CompetencyLevel.INTERMEDIATE;
        return CompetencyLevel.BEGINNER;
    }

    /**
     * Fusionne un profil existant avec des mises à jour partielles
     * 
     * @param currentProfile - Profil utilisateur actuel
     * @param updates - Mises à jour partielles à appliquer
     * @returns Profil utilisateur fusionné
     */
    private mergeProfiles(currentProfile: ExtendedUserProfile, updates: Partial<ExtendedUserProfile>): ExtendedUserProfile {
        // Copie profonde du profil actuel en tant qu'objet générique
        const result = JSON.parse(JSON.stringify(currentProfile)) as Record<string, unknown>;

        // Traiter chaque propriété de premier niveau
        for (const [key, value] of Object.entries(updates)) {
            if (value === undefined) continue;

            // Pour les objets, fusionner récursivement
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && key in result) {
                const currentValue = result[key];
                if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
                    result[key] = {
                        ...currentValue,
                        ...value
                    };
                    continue;
                }
            }

            // Pour les autres types ou si la propriété n'existe pas, remplacer directement
            result[key] = value;
        }

        // Cast final vers ExtendedUserProfile via unknown pour la sécurité TypeScript
        return result as unknown as ExtendedUserProfile;
    }
}