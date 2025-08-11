// src/ai/validation/interfaces/INativeValidator.ts

import {
    CollaborativeValidationRequest,
    ExpertProfile,
    ValidationFeedback
} from '../types';

/**
 * Interface pour le validateur natif
 * Gère l'interaction avec les validateurs natifs LSF
 */
export interface INativeValidator {
    /**
     * Initialise le système de validation native
     * @returns Succès de l'initialisation
     */
    initialize(): Promise<boolean>;

    /**
     * Soumet une requête aux validateurs natifs
     * @param request Requête de validation
     * @param experts Liste des experts natifs disponibles
     * @returns ID de la soumission créée
     */
    submitForValidation(
        request: CollaborativeValidationRequest,
        experts: ExpertProfile[]
    ): Promise<string>;

    /**
     * Obtient les retours des validateurs natifs
     * @param submissionId ID de la soumission
     * @returns Liste des retours des validateurs natifs
     */
    getNativeFeedback(submissionId: string): Promise<ValidationFeedback[]>;

    /**
     * Vérifie si une validation native est complète
     * @param submissionId ID de la soumission
     * @returns True si la validation est complète
     */
    isValidationComplete(submissionId: string): Promise<boolean>;

    /**
     * Obtient la liste des validateurs natifs disponibles
     * @param specialties Spécialités requises (optionnel)
     * @returns Liste des profils des validateurs natifs
     */
    getAvailableValidators(specialties?: string[]): Promise<ExpertProfile[]>;

    /**
     * Demande une validation prioritaire
     * @param request Requête de validation
     * @param reason Raison de la priorité
     * @returns ID de la soumission prioritaire
     */
    requestPriorityValidation(
        request: CollaborativeValidationRequest,
        reason: string
    ): Promise<string>;

    /**
     * Libère les ressources et arrête le validateur
     */
    shutdown(): Promise<void>;
}