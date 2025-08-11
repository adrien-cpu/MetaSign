// src/ai/validation/services/thematic-club-service.ts

import { ThematicClubType, ExpertProfile, Result } from '@ai/validation/types';
import { success, failure, notFound, ErrorCode } from '@ai/validation/utils/result-helpers';
import { IThematicClubManager } from '@ai/validation/interfaces/collaborative-validation.interfaces';
import { Logger } from '@ai/utils/Logger';
import {
    ThematicClub,
    CollaborativeValidationRequest,
    ExpertiseLevel
} from '@ai/validation/types';

/**
 * Interface pour les stats des clubs thématiques
 */
export interface ClubStats {
    totalValidations: number;
    pendingValidations: number;
    completedValidations: number;
    consensusRate: number;
    memberParticipationRate: number;
    averageResponseTime: number;
}

/**
 * Service de gestion des clubs thématiques
 */
export class ThematicClubService {
    private readonly logger = Logger.getInstance('ThematicClubService');
    private clubs = new Map<string, ThematicClub>();
    private clubsByType = new Map<ThematicClubType, Set<string>>();
    private clubMemberships = new Map<string, Set<string>>(); // expertId -> clubIds
    private thematicClubManager: IThematicClubManager | null = null;

    /**
     * Crée une nouvelle instance du service de clubs thématiques
     * @param thematicClubManager Gestionnaire de clubs thématiques optionnel
     */
    constructor(thematicClubManager?: IThematicClubManager) {
        if (thematicClubManager) {
            this.thematicClubManager = thematicClubManager;
        }
    }

    /**
     * Configure les clubs thématiques
     */
    public async setupThematicClubs(): Promise<void> {
        if (!this.thematicClubManager) {
            this.logger.warn('No ThematicClubManager available, skipping setup');
            return;
        }

        try {
            this.logger.info('Setting up thematic clubs');
            await this.thematicClubManager.initializeClubs();

            // Charger les experts existants depuis le gestionnaire
            for (const clubType of Object.values(ThematicClubType)) {
                const experts = await this.thematicClubManager.getClubExperts(clubType);
                const expertSet = this.clubsByType.get(clubType) || new Set<string>();

                // Ajouter les experts au club
                for (const expert of experts) {
                    this.addExpertToClub(clubType, expert);
                }

                this.logger.info(`Loaded ${expertSet.size} experts for club type: ${clubType}`);
            }
        } catch (error) {
            this.logger.error('Error setting up thematic clubs', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Configure le gestionnaire de clubs thématiques
     * @param thematicClubManager Gestionnaire de clubs thématiques
     */
    public setThematicClubManager(thematicClubManager: IThematicClubManager): void {
        this.thematicClubManager = thematicClubManager;
        this.logger.info('ThematicClubManager has been set');
    }

    /**
     * Crée un nouveau club thématique
     * @param club Données du club à créer
     * @returns ID du club créé
     */
    async createClub(club: Omit<ThematicClub, 'id' | 'createdAt'>): Promise<Result<string>> {
        try {
            // Générer un ID unique
            const clubId = `club_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            // Créer le club avec métadonnées supplémentaires
            const newClub: ThematicClub = {
                ...club,
                id: clubId,
                createdAt: new Date(),
                members: club.members || [],
                memberCount: club.members?.length || 0,
                stats: {
                    totalValidations: 0,
                    pendingValidations: 0,
                    completedValidations: 0,
                    consensusRate: 0
                }
            };

            // Stocker le club
            this.clubs.set(clubId, newClub);

            // Indexer par type
            if (!this.clubsByType.has(newClub.type)) {
                this.clubsByType.set(newClub.type, new Set());
            }
            this.clubsByType.get(newClub.type)?.add(clubId);

            // Indexer les membres
            if (newClub.members) {
                for (const member of newClub.members) {
                    this.addMemberToIndex(member.expertId, clubId);
                }
            }

            return success(clubId);
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to create thematic club',
                { error: String(error) }
            );
        }
    }

    /**
     * Obtient un club par son ID
     * @param clubId ID du club
     * @returns Données du club
     */
    async getClub(clubId: string): Promise<Result<ThematicClub>> {
        try {
            if (!this.clubs.has(clubId)) {
                return notFound('club', clubId);
            }

            const club = this.clubs.get(clubId);
            if (!club) {
                return notFound('club', clubId);
            }

            return success(club);
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to retrieve club',
                { error: String(error) }
            );
        }
    }

    /**
     * Ajoute un expert à un club thématique
     * @param clubType Type de club thématique
     * @param expert Profil de l'expert à ajouter
     * @returns Succès de l'ajout
     */
    public addExpertToClub(clubType: ThematicClubType, expert: ExpertProfile): boolean {
        try {
            // Vérifier si le type de club existe
            if (!this.clubsByType.has(clubType)) {
                this.clubsByType.set(clubType, new Set<string>());
            }

            // Ajouter l'expert via le gestionnaire si disponible
            if (this.thematicClubManager) {
                this.thematicClubManager.addExpertToClub(clubType, expert)
                    .catch(error => {
                        this.logger.error(`Error adding expert to club via manager: ${clubType}`, {
                            error: error instanceof Error ? error.message : String(error),
                            expertId: expert.id
                        });
                    });
            }

            this.logger.info(`Added expert to club type: ${clubType}`, {
                expertId: expert.id,
                expertName: expert.name
            });

            return true;
        } catch (error) {
            this.logger.error(`Failed to add expert to club type: ${clubType}`, {
                error: error instanceof Error ? error.message : String(error),
                expertId: expert.id
            });
            return false;
        }
    }

    /**
     * Obtient les experts d'un club thématique
     * @param clubType Type de club thématique
     * @returns Ensemble des profils d'experts
     */
    public getThematicClubExperts(clubType: ThematicClubType): Set<ExpertProfile> {
        const result = new Set<ExpertProfile>();

        // Si un gestionnaire est disponible, l'utiliser pour récupérer les experts
        if (this.thematicClubManager) {
            this.thematicClubManager.getClubExperts(clubType)
                .then(experts => {
                    for (const expert of experts) {
                        result.add(expert);
                    }
                })
                .catch(error => {
                    this.logger.error(`Error getting experts from club manager: ${clubType}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                });
        }

        // Ajouter aussi les experts des clubs locaux
        const clubIds = this.clubsByType.get(clubType) || new Set<string>();
        for (const clubId of clubIds) {
            const club = this.clubs.get(clubId);
            if (club && club.members) {
                for (const member of club.members) {
                    // Ici, on devrait récupérer le profil complet de l'expert
                    // Mais comme on n'a pas accès à cette information, on crée un profil minimal
                    const expertProfile: ExpertProfile = {
                        id: member.expertId,
                        name: "Expert " + member.expertId,
                        expertiseLevel: ExpertiseLevel.EXPERT,
                        isNative: true
                    };
                    result.add(expertProfile);
                }
            }
        }

        return result;
    }

    /**
     * Obtient le club thématique approprié pour un type de contenu
     * @param contentType Type de contenu
     * @returns Type de club thématique approprié
     */
    public getAppropriateClub(contentType: string): ThematicClubType {
        // Logique de mapping entre types de contenu et clubs thématiques
        switch (contentType.toLowerCase()) {
            case 'sign':
            case 'signs':
                return ThematicClubType.PRATIQUES_CULTURELLES;
            case 'expression':
            case 'expressions':
                return ThematicClubType.REGISTRES_SPECIALISES;
            case 'etymology':
            case 'history':
                return ThematicClubType.HISTOIRE_LSF;
            case 'innovation':
            case 'neologism':
                return ThematicClubType.INNOVATIONS_LINGUISTIQUES;
            case 'international':
            case 'foreign':
                return ThematicClubType.ASPECTS_INTERNATIONAUX;
            default:
                return ThematicClubType.PRATIQUES_CULTURELLES; // Club par défaut
        }
    }

    /**
     * Obtient les experts pour un type de club
     * @param clubType Type de club thématique
     * @returns Liste des profils d'experts
     */
    public getExpertsForClubType(clubType: ThematicClubType): ExpertProfile[] {
        const experts = this.getThematicClubExperts(clubType);
        return Array.from(experts);
    }

    /**
     * Soumet une requête aux clubs thématiques pertinents
     * @param request Requête de validation
     */
    public async submitToRelevantClubs(request: CollaborativeValidationRequest): Promise<void> {
        if (!this.thematicClubManager) {
            this.logger.warn('No ThematicClubManager available, skipping club submission');
            return;
        }

        try {
            // Déterminer le club approprié
            const clubType = this.getAppropriateClub(request.type);

            // Soumettre au club via le gestionnaire
            await this.thematicClubManager.submitToClub(clubType, request);

            this.logger.info(`Submitted request to club: ${clubType}`, {
                requestId: request.id,
                requestType: request.type
            });
        } catch (error) {
            this.logger.error('Error submitting to relevant clubs', {
                error: error instanceof Error ? error.message : String(error),
                requestId: request.id,
                requestType: request.type
            });
        }
    }

    /**
     * Recherche des clubs selon des critères
     * @param criteria Critères de recherche
     * @returns Liste des clubs correspondants
     */
    async searchClubs(criteria: {
        type?: ThematicClubType;
        expertId?: string;
        keyword?: string;
    }): Promise<Result<ThematicClub[]>> {
        try {
            let candidates: ThematicClub[] = [];

            // Filtrer par type si spécifié
            if (criteria.type && this.clubsByType.has(criteria.type)) {
                const clubIds = this.clubsByType.get(criteria.type)!;
                candidates = Array.from(clubIds)
                    .map(id => this.clubs.get(id))
                    .filter((club): club is ThematicClub => club !== undefined);
            } else {
                candidates = Array.from(this.clubs.values());
            }

            // Filtrer par expert si spécifié
            if (criteria.expertId) {
                if (this.clubMemberships.has(criteria.expertId)) {
                    const clubIds = this.clubMemberships.get(criteria.expertId)!;
                    candidates = candidates.filter(club => clubIds.has(club.id));
                } else {
                    return success([]); // L'expert n'est membre d'aucun club
                }
            }

            // Filtrer par mot-clé si spécifié
            if (criteria.keyword) {
                const keyword = criteria.keyword.toLowerCase();
                candidates = candidates.filter(club =>
                    club.name.toLowerCase().includes(keyword) ||
                    club.description.toLowerCase().includes(keyword)
                );
            }

            return success(candidates);
        } catch (error) {
            return failure(
                ErrorCode.OPERATION_FAILED,
                'Failed to search clubs',
                { error: String(error) }
            );
        }
    }

    /**
     * Ajoute un membre à l'index des appartenances aux clubs
     * @param expertId ID de l'expert
     * @param clubId ID du club
     */
    private addMemberToIndex(expertId: string, clubId: string): void {
        if (!this.clubMemberships.has(expertId)) {
            this.clubMemberships.set(expertId, new Set());
        }

        const membership = this.clubMemberships.get(expertId);
        if (membership) {
            membership.add(clubId);
        }
    }

    /**
     * Retire un membre de l'index des appartenances aux clubs
     * @param expertId ID de l'expert
     * @param clubId ID du club
     */
    private removeMemberFromIndex(expertId: string, clubId: string): void {
        if (this.clubMemberships.has(expertId)) {
            const membership = this.clubMemberships.get(expertId);
            if (membership) {
                membership.delete(clubId);

                // Si l'expert n'est plus membre d'aucun club, le retirer de l'index
                if (membership.size === 0) {
                    this.clubMemberships.delete(expertId);
                }
            }
        }
    }
}

// Singleton pour un accès global
let globalThematicClubService: ThematicClubService | null = null;

/**
 * Obtient l'instance globale du service de clubs thématiques
 * @param thematicClubManager Gestionnaire de clubs thématiques optionnel
 * @returns Instance du service
 */
export function getThematicClubService(thematicClubManager?: IThematicClubManager): ThematicClubService {
    if (!globalThematicClubService) {
        globalThematicClubService = new ThematicClubService(thematicClubManager);

        // Configurer les clubs thématiques
        globalThematicClubService.setupThematicClubs().catch(error => {
            Logger.getInstance('ThematicClubService').error('Failed to setup thematic clubs:', {
                error: error instanceof Error ? error.message : String(error)
            });
        });
    }

    return globalThematicClubService;
}

/**
 * Réinitialise l'instance globale du service
 * Utile principalement pour les tests
 */
export function resetThematicClubService(): void {
    globalThematicClubService = null;
}