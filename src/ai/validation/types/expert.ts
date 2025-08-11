// src/ai/validation/types/expert.ts
export interface ExpertProfile {
    /**
     * Identifiant unique de l'expert
     */
    id: string;

    /**
     * Nom de l'expert
     */
    name: string;

    /**
     * Indique si l'expert est un locuteur natif
     */
    isNative?: boolean;

    /**
     * Domaines d'expertise
     */
    domains?: string[];

    /**
     * Métadonnées additionnelles pour stocker des informations flexibles
     */
    metadata?: {
        /**
         * Date d'enregistrement du profil
         */
        registrationDate?: Date;

        /**
         * Date de dernière activité
         */
        lastActivity?: Date;

        /**
         * Compétences spécifiques
         */
        skills?: string[];

        /**
         * Années d'expérience
         */
        yearsOfExperience?: number;

        /**
         * Langues parlées/signées
         */
        languages?: string[];

        /**
         * Autres métadonnées
         */
        [key: string]: unknown;
    };
}

export interface ExpertStats {
    /**
     * Identifiant de l'expert
     */
    expertId: string;

    /**
     * Nombre total de validations effectuées
     */
    totalValidations: number;

    /**
     * Nombre de validations approuvées
     */
    approvedCount: number;

    /**
     * Nombre de validations rejetées
     */
    rejectionCount: number;

    /**
     * Taux d'approbation (ratio approuvées / total)
     */
    approvalRate: number;

    /**
     * Alignement avec le consensus (ratio décisions concordantes / total)
     */
    consensusAlignment: number;

    /**
     * Score moyen attribué
     */
    averageScore: number;

    /**
     * Temps de réponse moyen (en millisecondes)
     */
    averageResponseTime: number;

    /**
     * Date de dernière activité
     */
    lastActivity: Date;

    /**
     * Domaines d'expertise
     */
    domains: string[];
}