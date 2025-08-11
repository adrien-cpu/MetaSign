// src/ai/validation/implementations/ExpertProfileManager.ts
import {
    ExpertProfile,
    Result,
    PaginationOptions,
    PaginatedResult,
    ExpertStats
} from '../types';
import { IExpertProfileManager } from '../interfaces/IExpertProfileManager';
import { IEventManager } from '../interfaces/IEventManager';
import { BaseManager, BaseManagerConfig } from './BaseManager';
import {
    failure,
    notFound,
    success,
    tryCatch,
    ErrorCode
} from '../utils/result-helpers';
import {
    paginate,
    normalizePaginationOptions
} from '../utils/pagination-helpers';

/**
 * Configuration pour le ExpertProfileManager
 */
export interface ExpertProfileManagerConfig extends BaseManagerConfig {
    /**
     * Exiger une validation des profils experts
     */
    requireProfileValidation?: boolean;
}

/**
 * Implémentation du gestionnaire de profils d'experts
 */
export class ExpertProfileManager extends BaseManager implements IExpertProfileManager {
    private readonly expertProfiles = new Map<string, ExpertProfile>();
    private readonly managerConfig: Required<ExpertProfileManagerConfig>;
    private readonly getExpertFeedback: (expertId: string) => Promise<{ validationId: string; approved: boolean; score?: number }[]>;
    private readonly getConsensusResults: () => Promise<Map<string, { approved: boolean; score?: number }>>;

    /**
     * Crée une nouvelle instance de ExpertProfileManager
     * @param eventManager Gestionnaire d'événements
     * @param getExpertFeedback Fonction pour récupérer les feedbacks d'un expert
     * @param getConsensusResults Fonction pour récupérer les résultats de consensus
     * @param config Configuration optionnelle
     */
    constructor(
        eventManager: IEventManager,
        getExpertFeedback: (expertId: string) => Promise<{ validationId: string; approved: boolean; score?: number }[]>,
        getConsensusResults: () => Promise<Map<string, { approved: boolean; score?: number }>>,
        config: ExpertProfileManagerConfig = {}
    ) {
        super(eventManager, 'ExpertProfileManager', config);

        this.getExpertFeedback = getExpertFeedback;
        this.getConsensusResults = getConsensusResults;

        this.managerConfig = {
            ...this.getDefaultConfig(),
            requireProfileValidation: config.requireProfileValidation || false
        };
    }

    /**
     * Obtient la configuration par défaut
     */
    private getDefaultConfig(): Required<ExpertProfileManagerConfig> {
        return {
            requireProfileValidation: false,
            logLevel: 'info',
            enableLogging: true,
            appId: 'expert-profile-manager'
        };
    }

    /**
     * Crée un objet Result typé à partir d'un Result<void>
     * @param result Résultat à convertir
     * @returns Résultat typé
     */
    private createTypedResultFromInitCheck<T>(result: Result<void>): Result<T> {
        if (result.success) {
            // Si le check est successful, on ne devrait jamais arriver ici
            throw new Error('Unexpected successful initialization check result');
        }
        // S'assurer que l'erreur n'est jamais undefined
        const error = result.error || {
            code: ErrorCode.OPERATION_FAILED,
            message: 'Unknown initialization error'
        };
        return {
            success: false,
            error
        };
    }

    /**
     * Enregistre un nouveau profil d'expert
     * @param profile Profil de l'expert
     */
    async registerExpertProfile(profile: ExpertProfile): Promise<Result<string>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<string>(initCheck);
        }

        // Vérifier si l'expert existe déjà
        if (this.expertProfiles.has(profile.id)) {
            return failure(
                ErrorCode.DUPLICATE_ENTRY,
                `Expert with ID ${profile.id} already exists`,
                { expertId: profile.id }
            );
        }

        return tryCatch(
            async () => {
                // Valider le profil si nécessaire
                if (this.managerConfig.requireProfileValidation) {
                    this.validateExpertProfile(profile);
                }

                // Ajouter des métadonnées
                const enrichedProfile: ExpertProfile = {
                    ...profile,
                    metadata: {
                        ...profile.metadata,
                        registrationDate: new Date(),
                        lastActivity: new Date()
                    }
                };

                // Stocker le profil
                this.expertProfiles.set(profile.id, enrichedProfile);

                this.logInfo(`Expert profile registered: ${profile.id}`);

                return profile.id;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to register expert profile'
        );
    }

    /**
     * Récupère le profil d'un expert
     * @param expertId ID de l'expert
     */
    async getExpertProfile(expertId: string): Promise<Result<ExpertProfile>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<ExpertProfile>(initCheck);
        }

        // Vérifier si l'expert existe
        if (!this.expertProfiles.has(expertId)) {
            return notFound('expert', expertId);
        }

        const profile = this.expertProfiles.get(expertId)!;
        return success(profile);
    }

    /**
     * Met à jour le profil d'un expert
     * @param expertId ID de l'expert
     * @param updates Mises à jour à appliquer
     */
    async updateExpertProfile(
        expertId: string,
        updates: Partial<ExpertProfile>
    ): Promise<Result<ExpertProfile>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<ExpertProfile>(initCheck);
        }

        // Vérifier si l'expert existe
        if (!this.expertProfiles.has(expertId)) {
            return notFound('expert', expertId);
        }

        return tryCatch(
            async () => {
                const existingProfile = this.expertProfiles.get(expertId)!;

                // Créer le profil mis à jour
                const updatedProfile: ExpertProfile = {
                    ...existingProfile,
                    ...updates,
                    id: expertId, // Préserver l'ID
                    metadata: {
                        ...existingProfile.metadata,
                        ...updates.metadata,
                        lastActivity: new Date() // Mettre à jour l'activité
                    }
                };

                // Valider le profil mis à jour si nécessaire
                if (this.managerConfig.requireProfileValidation) {
                    this.validateExpertProfile(updatedProfile);
                }

                // Stocker le profil mis à jour
                this.expertProfiles.set(expertId, updatedProfile);

                this.logInfo(`Expert profile updated: ${expertId}`);

                return updatedProfile;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to update expert profile'
        );
    }

    /**
     * Récupère les statistiques d'un expert
     * @param expertId ID de l'expert
     */
    async getExpertStats(expertId: string): Promise<Result<ExpertStats>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<ExpertStats>(initCheck);
        }

        // Vérifier si l'expert existe
        if (!this.expertProfiles.has(expertId)) {
            return notFound('expert', expertId);
        }

        return tryCatch(
            async () => {
                // Récupérer le profil
                const profile = this.expertProfiles.get(expertId)!;

                // Récupérer les feedbacks de l'expert
                const feedbacks = await this.getExpertFeedback(expertId);

                // Récupérer les résultats de consensus
                const consensusResults = await this.getConsensusResults();;

                // Calculer les statistiques
                const totalFeedbacks = feedbacks.length;
                const approvedFeedbacks = feedbacks.filter(f => f.approved).length;
                const rejectedFeedbacks = totalFeedbacks - approvedFeedbacks;

                // Calculer l'alignement avec le consensus
                let alignmentCount = 0;
                let consensusCount = 0;

                for (const feedback of feedbacks) {
                    const consensusResult = consensusResults.get(feedback.validationId);
                    if (consensusResult) {
                        consensusCount++;
                        if (feedback.approved === consensusResult.approved) {
                            alignmentCount++;
                        }
                    }
                }

                const consensusAlignment = consensusCount > 0
                    ? alignmentCount / consensusCount
                    : 0;

                const lastActivity = profile.metadata?.lastActivity instanceof Date
                    ? profile.metadata.lastActivity
                    : new Date();

                // Créer les stats
                const stats: ExpertStats = {
                    expertId,
                    totalValidations: totalFeedbacks,
                    approvedCount: approvedFeedbacks,
                    rejectionCount: rejectedFeedbacks,
                    approvalRate: totalFeedbacks > 0 ? approvedFeedbacks / totalFeedbacks : 0,
                    consensusAlignment,
                    averageScore: this.calculateAverageScore(feedbacks),
                    averageResponseTime: this.calculateAverageResponseTime(),
                    lastActivity,
                    domains: profile.domains || []
                };

                return stats;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to calculate expert statistics'
        );
    }

    /**
     * Trouve des experts qualifiés pour une validation
     * @param validationId ID de la validation
     * @param count Nombre d'experts à trouver
     */
    async findQualifiedExperts(
        validationId: string,
        count: number = 3
    ): Promise<Result<ExpertProfile[]>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<ExpertProfile[]>(initCheck);
        }

        return tryCatch(
            async () => {
                // Récupérer tous les experts
                const allExperts = Array.from(this.expertProfiles.values());

                if (allExperts.length === 0) {
                    return [];
                }

                // Dans une implémentation réelle, on utiliserait des critères plus sophistiqués
                // Pour l'instant, on fait une sélection aléatoire
                return this.selectRandomExperts(allExperts, count);
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to find qualified experts'
        );
    }

    /**
     * Recherche des experts selon des critères
     * @param criteria Critères de recherche
     * @param options Options de pagination
     */
    async searchExperts(
        criteria: {
            domains?: string[];
            isNative?: boolean;
            skills?: string[];
            minExperience?: number;
            languages?: string[];
        },
        options?: PaginationOptions
    ): Promise<Result<PaginatedResult<ExpertProfile>>> {
        const initCheck = this.checkInitialized();
        if (initCheck !== null && !initCheck.success) {
            return this.createTypedResultFromInitCheck<PaginatedResult<ExpertProfile>>(initCheck);
        }

        return tryCatch(
            async () => {
                // Filtrer les experts selon les critères
                const filteredExperts = Array.from(this.expertProfiles.values())
                    .filter(profile => {
                        let matches = true;

                        // Filtre par domaines
                        if (criteria.domains && criteria.domains.length > 0) {
                            if (!profile.domains || !criteria.domains.some(d => profile.domains?.includes(d))) {
                                matches = false;
                            }
                        }

                        // Filtre par statut natif
                        if (criteria.isNative !== undefined) {
                            if (profile.isNative !== criteria.isNative) {
                                matches = false;
                            }
                        }

                        // Filtre par compétences
                        if (criteria.skills && criteria.skills.length > 0) {
                            const skills = Array.isArray(profile.metadata?.skills)
                                ? profile.metadata.skills
                                : [];

                            if (skills.length === 0 || !criteria.skills.some(s => skills.includes(s))) {
                                matches = false;
                            }
                        }

                        // Filtre par expérience minimale
                        if (criteria.minExperience !== undefined) {
                            const experience = typeof profile.metadata?.yearsOfExperience === 'number'
                                ? profile.metadata.yearsOfExperience
                                : 0;

                            if (experience < criteria.minExperience) {
                                matches = false;
                            }
                        }

                        // Filtre par langues
                        if (criteria.languages && criteria.languages.length > 0) {
                            const languages = Array.isArray(profile.metadata?.languages)
                                ? profile.metadata.languages
                                : [];

                            if (languages.length === 0 || !criteria.languages.some(l => languages.includes(l))) {
                                matches = false;
                            }
                        }

                        return matches;
                    });

                // Normaliser les options de pagination
                const normalizedOptions = normalizePaginationOptions(options);

                // Appliquer la pagination et convertir le résultat au type attendu
                const paginationResult = paginate(
                    filteredExperts.map(profile => ({ ...profile })),
                    normalizedOptions
                );

                return paginationResult as PaginatedResult<ExpertProfile>;
            },
            ErrorCode.OPERATION_FAILED,
            'Failed to search experts'
        );
    }

    /**
     * Sélectionne aléatoirement un nombre d'experts
     * @param experts Liste des experts disponibles
     * @param count Nombre d'experts à sélectionner
     * @returns Liste d'experts sélectionnés
     */
    private selectRandomExperts(experts: ExpertProfile[], count: number): ExpertProfile[] {
        if (experts.length <= count) {
            return [...experts];
        }

        const shuffled = [...experts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Valide un profil d'expert
     * @param profile Profil à valider
     * @throws Error si le profil est invalide
     */
    private validateExpertProfile(profile: ExpertProfile): void {
        if (!profile.id) {
            throw new Error('Expert profile must have an ID');
        }

        if (!profile.name) {
            throw new Error('Expert profile must have a name');
        }

        // Valider les autres champs selon les besoins
    }

    /**
     * Calcule le score moyen d'un expert
     * @param feedbacks Feedbacks de l'expert
     */
    private calculateAverageScore(
        feedbacks: { validationId: string; approved: boolean; score?: number }[]
    ): number {
        const scores = feedbacks
            .map(f => f.score)
            .filter((s): s is number => s !== undefined);

        if (scores.length === 0) {
            return 0;
        }

        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    /**
     * Calcule le temps de réponse moyen d'un expert
     * @returns Temps de réponse par défaut en millisecondes
     */
    private calculateAverageResponseTime(): number {
        // Cette méthode nécessiterait plus d'informations sur les temps de réponse
        // Pour l'instant, on renvoie une valeur par défaut
        return 24 * 60 * 60 * 1000; // 24 heures en ms
    }

    /**
     * Implémentation de l'initialisation interne
     */
    protected async initializeInternal(): Promise<void> {
        // Rien de spécial à initialiser
    }

    /**
     * Implémentation de l'arrêt interne
     */
    protected async shutdownInternal(): Promise<void> {
        // Vider la cache
        this.expertProfiles.clear();
    }
}