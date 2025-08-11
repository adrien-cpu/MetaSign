//src/ai/validation/interfaces/IExpertProfileManager.ts
import {
    ExpertProfile,
    Result,
    PaginationOptions,
    PaginatedResult,
    ExpertStats
} from '../types';

/**
 * Interface pour le gestionnaire de profils d'experts
 * Responsable de la gestion des experts et de leurs compétences
 */
export interface IExpertProfileManager {
    /**
     * Enregistre un nouveau profil d'expert
     * @param profile Profil de l'expert
     */
    registerExpertProfile(profile: ExpertProfile): Promise<Result<string>>;

    /**
     * Récupère le profil d'un expert
     * @param expertId ID de l'expert
     */
    getExpertProfile(expertId: string): Promise<Result<ExpertProfile>>;

    /**
     * Met à jour le profil d'un expert
     * @param expertId ID de l'expert
     * @param updates Mises à jour à appliquer
     */
    updateExpertProfile(
        expertId: string,
        updates: Partial<ExpertProfile>
    ): Promise<Result<ExpertProfile>>;

    /**
     * Récupère les statistiques d'un expert
     * @param expertId ID de l'expert
     */
    getExpertStats(expertId: string): Promise<Result<ExpertStats>>;

    /**
     * Trouve des experts qualifiés pour une validation
     * @param validationId ID de la validation
     * @param count Nombre d'experts à trouver
     */
    findQualifiedExperts(
        validationId: string,
        count?: number
    ): Promise<Result<ExpertProfile[]>>;

    /**
     * Recherche des experts selon des critères
     * @param criteria Critères de recherche
     * @param options Options de pagination
     */
    searchExperts(
        criteria: {
            domains?: string[];
            isNative?: boolean;
            skills?: string[];
            minExperience?: number;
            languages?: string[];
        },
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ExpertProfile>>>;
}