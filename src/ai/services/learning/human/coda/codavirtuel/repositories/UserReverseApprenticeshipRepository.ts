/**
 * Dépôt pour les données d'apprentissage inversé des utilisateurs
 * @file src/ai/services/learning/codavirtuel/repositories/UserReverseApprenticeshipRepository.ts
 * @description Gère les profils et résultats d'exercices des utilisateurs
 * @module UserReverseApprenticeshipRepository
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { UserReverseProfile } from '../types/index';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Structure pour les résultats d'exercices
 */
export interface ExerciseResult {
    /** Identifiant de l'utilisateur */
    userId: string;

    /** Identifiant de l'exercice */
    exerciseId: string;

    /** Date de réalisation */
    date: Date;

    /** Score global (0-1) */
    score: number;

    /** Scores par compétence */
    skillScores: Record<string, number>;

    /** Type d'exercice */
    exerciseType: string;

    /** Niveau de l'utilisateur au moment de l'exercice */
    userLevel: string;
}

/**
 * Dépôt pour gérer les données d'apprentissage inversé des utilisateurs
 */
export class UserReverseApprenticeshipRepository {
    private readonly logger = LoggerFactory.getLogger('UserReverseApprenticeshipRepository');
    private profiles: Map<string, UserReverseProfile> = new Map();
    private exerciseResults: Map<string, ExerciseResult[]> = new Map();

    /**
     * Construit un nouveau dépôt de données d'apprentissage
     */
    constructor() {
        this.logger.debug('UserReverseApprenticeshipRepository initialized');
    }

    /**
     * Récupère le profil d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Profil de l'utilisateur ou null s'il n'existe pas
     */
    public async getUserProfile(userId: string): Promise<UserReverseProfile | null> {
        return this.profiles.get(userId) || null;
    }

    /**
     * Enregistre le profil d'un utilisateur
     * @param profile Profil à enregistrer
     */
    public async saveUserProfile(profile: UserReverseProfile): Promise<void> {
        this.profiles.set(profile.userId, structuredClone(profile));
        this.logger.debug(`Saved profile for user ${profile.userId}`);
    }

    /**
     * Récupère l'historique des exercices d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @returns Liste des résultats d'exercices
     */
    public async getUserExerciseHistory(userId: string): Promise<ExerciseResult[]> {
        return this.exerciseResults.get(userId) || [];
    }

    /**
     * Enregistre le résultat d'un exercice
     * @param userId Identifiant de l'utilisateur
     * @param exerciseId Identifiant de l'exercice
     * @param score Score global (0-1)
     * @param skillScores Scores par compétence
     * @param exerciseType Type d'exercice
     * @param userLevel Niveau de l'utilisateur
     */
    public async saveExerciseResult(
        userId: string,
        exerciseId: string,
        score: number,
        skillScores: Record<string, number>,
        exerciseType: string,
        userLevel: string
    ): Promise<void> {
        const result: ExerciseResult = {
            userId,
            exerciseId,
            date: new Date(),
            score,
            skillScores,
            exerciseType,
            userLevel
        };

        // Récupérer l'historique existant ou créer un nouveau tableau
        const history = this.exerciseResults.get(userId) || [];
        history.push(result);
        this.exerciseResults.set(userId, history);

        this.logger.debug(`Saved exercise result for user ${userId}, exercise ${exerciseId}`);
    }

    /**
     * Supprime toutes les données d'un utilisateur
     * @param userId Identifiant de l'utilisateur
     */
    public async deleteUserData(userId: string): Promise<void> {
        this.profiles.delete(userId);
        this.exerciseResults.delete(userId);
        this.logger.debug(`Deleted all data for user ${userId}`);
    }
}