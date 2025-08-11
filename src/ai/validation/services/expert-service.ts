// src/ai/validation/services/expert-service.ts

import { Logger } from '@ai/utils/Logger';
import {
    ExpertProfile,
    ExpertSearchCriteria,
    ExpertiseLevel,
    ThematicClubType
} from '@ai/validation/types';
import { IExpertManager } from '@ai/validation/interfaces/collaborative-validation.interfaces';
import { ThematicClubService } from '@ai/validation/services/thematic-club-service';

/**
 * Service de gestion des experts
 * Centralise les opérations liées à la recherche et à la gestion des experts
 */
export class ExpertService {
    private readonly logger = Logger.getInstance('ExpertService');
    private expertManager: IExpertManager | undefined;
    private thematicClubService: ThematicClubService;

    /**
     * Constructeur
     * @param thematicClubService Service de gestion des clubs thématiques
     * @param expertManager Gestionnaire d'experts (optionnel)
     */
    constructor(
        thematicClubService: ThematicClubService,
        expertManager?: IExpertManager
    ) {
        this.thematicClubService = thematicClubService;
        this.expertManager = expertManager;
    }

    /**
     * Recherche des experts selon des critères
     * @param criteria Critères de recherche
     * @returns Experts correspondants
     */
    public async findExperts(criteria: ExpertSearchCriteria): Promise<ExpertProfile[]> {
        // Utiliser le gestionnaire d'experts s'il est disponible
        if (this.expertManager) {
            return this.expertManager.findExperts(criteria);
        }

        // Implémentation de fallback
        try {
            const experts = await this.collectExpertsFromAllClubs();
            const filteredExperts = this.filterExpertsByCriteria(experts, criteria);
            const uniqueExperts = this.removeExpertDuplicates(filteredExperts);
            return this.applyLimitIfNeeded(uniqueExperts, criteria.limit);
        } catch (error) {
            this.logger.error('Error finding experts', {
                error: error instanceof Error ? error.message : String(error),
                criteria
            });
            return [];
        }
    }

    /**
     * Collecte tous les experts de tous les clubs
     * @returns Liste d'experts
     */
    private async collectExpertsFromAllClubs(): Promise<ExpertProfile[]> {
        let experts: ExpertProfile[] = [];

        try {
            // Parcourir tous les types de clubs et collecter les experts
            for (const clubType of Object.values(ThematicClubType)) {
                const clubExperts = this.thematicClubService.getThematicClubExperts(clubType);
                experts = experts.concat(Array.from(clubExperts));
            }
        } catch (error) {
            this.logger.error('Error collecting experts from clubs', {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        return experts;
    }

    /**
     * Récupère les profils d'experts par leurs IDs
     * Note: Dans une implémentation réelle, cette méthode devrait accéder à une source de données
     * d'experts, comme une base de données ou un service API.
     * @param expertIds Liste d'IDs d'experts
     * @returns Liste des profils d'experts correspondants
     */
    private async getExpertsByIds(expertIds: string[]): Promise<ExpertProfile[]> {
        // Cette implémentation est un exemple et devrait être remplacée
        // par une implémentation réelle qui recherche les experts.
        if (this.expertManager) {
            // Utiliser findExperts avec un critère spécial pour filtrer par IDs
            // Note: Cela suppose que l'implémentation de findExperts peut gérer ce cas
            try {
                const experts = await this.expertManager.findExperts({
                    // Nous utilisons une propriété spéciale ici qui n'est pas dans l'interface standard
                    // Dans une implémentation réelle, vous pourriez avoir besoin d'adapter cette approche
                    // selon les capacités réelles de votre IExpertManager
                    ids: expertIds
                } as ExpertSearchCriteria);

                return experts.filter(expert => expertIds.includes(expert.id));
            } catch (error) {
                this.logger.warn('Failed to retrieve experts by IDs', {
                    error: error instanceof Error ? error.message : String(error),
                    expertIds
                });
            }
        }

        // En l'absence d'un gestionnaire d'experts ou en cas d'erreur, retourner une liste vide
        // Dans une implémentation réelle, cela devrait accéder à une autre source de données
        this.logger.warn('No expert manager available to retrieve expert profiles');
        return [];
    }

    /**
     * Filtre les experts selon les critères
     * @param experts Liste d'experts
     * @param criteria Critères de recherche
     * @returns Experts filtrés
     */
    private filterExpertsByCriteria(
        experts: ExpertProfile[],
        criteria: ExpertSearchCriteria
    ): ExpertProfile[] {
        return experts.filter(expert => {
            // Vérifier le niveau d'expertise minimal
            if (!this.meetsExpertiseLevelCriteria(expert, criteria.minExpertiseLevel)) {
                return false;
            }

            // Vérifier si un expert natif est requis
            if (criteria.requireNative && !expert.isNative) {
                return false;
            }

            // Vérifier les spécialités requises
            if (!this.meetsSpecialtiesCriteria(expert, criteria.specialties)) {
                return false;
            }

            // Vérifier l'expérience minimale
            if (!this.meetsExperienceCriteria(expert, criteria.minExperience)) {
                return false;
            }

            // Vérifier l'affiliation
            if (!this.meetsAffiliationCriteria(expert, criteria.affiliation)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Vérifie si l'expert satisfait le critère de niveau d'expertise
     * @param expert Profil d'expert
     * @param minExpertiseLevel Niveau d'expertise minimal requis
     * @returns True si le critère est satisfait
     */
    private meetsExpertiseLevelCriteria(
        expert: ExpertProfile,
        minExpertiseLevel?: ExpertiseLevel
    ): boolean {
        if (!minExpertiseLevel) {
            return true;
        }

        const expertLevels = Object.values(ExpertiseLevel);
        const minLevelIndex = expertLevels.indexOf(minExpertiseLevel);
        const expertLevelIndex = expertLevels.indexOf(expert.expertiseLevel);

        return expertLevelIndex >= minLevelIndex;
    }

    /**
     * Vérifie si l'expert satisfait le critère de spécialités
     * @param expert Profil d'expert
     * @param requiredSpecialties Spécialités requises
     * @returns True si le critère est satisfait
     */
    private meetsSpecialtiesCriteria(
        expert: ExpertProfile,
        requiredSpecialties?: string[]
    ): boolean {
        if (!requiredSpecialties || requiredSpecialties.length === 0) {
            return true;
        }

        const expertSpecialties = expert.specialties || [];
        const expertDomains = expert.domains || [];
        const allExpertSpecialties = [...expertSpecialties, ...expertDomains];

        return requiredSpecialties.some(
            specialty => allExpertSpecialties.includes(specialty)
        );
    }

    /**
     * Vérifie si l'expert satisfait le critère d'expérience
     * @param expert Profil d'expert
     * @param minExperience Expérience minimale requise en années
     * @returns True si le critère est satisfait
     */
    private meetsExperienceCriteria(
        expert: ExpertProfile,
        minExperience?: number
    ): boolean {
        if (minExperience === undefined) {
            return true;
        }

        return expert.experience !== undefined && expert.experience >= minExperience;
    }

    /**
     * Vérifie si l'expert satisfait le critère d'affiliation
     * @param expert Profil d'expert
     * @param affiliation Affiliation requise
     * @returns True si le critère est satisfait
     */
    private meetsAffiliationCriteria(
        expert: ExpertProfile,
        affiliation?: string
    ): boolean {
        if (!affiliation) {
            return true;
        }

        return expert.affiliation !== undefined && expert.affiliation.includes(affiliation);
    }

    /**
     * Supprime les experts en double
     * @param experts Liste d'experts
     * @returns Liste d'experts sans doublons
     */
    private removeExpertDuplicates(experts: ExpertProfile[]): ExpertProfile[] {
        return Array.from(
            new Map(experts.map(expert => [expert.id, expert])).values()
        );
    }

    /**
     * Applique une limite au nombre d'experts
     * @param experts Liste d'experts
     * @param limit Limite
     * @returns Liste d'experts limitée
     */
    private applyLimitIfNeeded(experts: ExpertProfile[], limit?: number): ExpertProfile[] {
        if (limit && limit > 0 && experts.length > limit) {
            return experts.slice(0, limit);
        }
        return experts;
    }

    /**
     * Définit le gestionnaire d'experts
     * @param manager Gestionnaire d'experts
     */
    public setExpertManager(manager: IExpertManager): void {
        this.expertManager = manager;
    }
}