// src/ai/validation/utils/adaptation-service.ts

import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ExpertProfile,
    AdaptedValidationRequest,
    AdaptedFeedback,
    AdaptedExpertProfile
} from '@ai/validation/types';

/**
 * Service d'adaptation pour convertir les données entre différents formats
 * Élimine l'utilisation de `any` et `unknown` en utilisant des types stricts
 */
export class AdaptationService {
    /**
     * Adapte une requête de validation au format attendu par les interfaces
     * @param request Requête de validation
     * @param generateId Fonction optionnelle de génération d'ID
     * @returns Requête adaptée
     */
    public adaptRequest(
        request: CollaborativeValidationRequest,
        generateId?: () => string
    ): AdaptedValidationRequest {
        return {
            ...request,
            id: request.id || (generateId ? generateId() : this.generateValidationId()),
            requiresNativeValidation: request.requiresNativeValidation === undefined
                ? false
                : request.requiresNativeValidation
        };
    }

    /**
     * Adapte un feedback au format attendu par les interfaces
     * @param feedback Feedback
     * @param validationId ID de la validation
     * @returns Feedback adapté
     */
    public adaptFeedback(
        feedback: ValidationFeedback,
        validationId: string
    ): AdaptedFeedback {
        return {
            ...feedback,
            id: feedback.id || this.generateFeedbackId(),
            validationId: validationId
        };
    }

    /**
     * Adapte des profils d'experts au format attendu par les interfaces
     * @param experts Profils d'experts
     * @returns Profils adaptés
     */
    public adaptExpertProfiles(experts: ExpertProfile[]): AdaptedExpertProfile[] {
        return experts.map(expert => ({
            ...expert,
            specialties: expert.specialties || [],
            domains: expert.domains || []
        }));
    }

    /**
     * Génère un ID unique pour une validation
     * @returns ID de validation unique
     */
    private generateValidationId(): string {
        return `val_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    /**
     * Génère un ID unique pour un feedback
     * @returns ID de feedback unique
     */
    private generateFeedbackId(): string {
        return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
}

// Singleton pour éviter des instances multiples
export const adaptationService = new AdaptationService();