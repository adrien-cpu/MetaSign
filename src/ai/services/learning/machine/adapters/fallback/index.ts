// src/ai/learning/adapters/fallback/index.ts

// Nous créerons le service de fallback ici pour éviter les problèmes d'import
import { Adaptation } from '@ai/learning/types/AdaptedContent';
import { LearningContext, UserProfile } from '@ai/learning/types';
import { LearningAdaptation, AdaptationContext, AdaptationMetadata } from '@ai/learning/types/learning-interfaces';

/**
 * Service responsable de fournir des adaptations de secours en cas d'erreur
 */
export class FallbackService {
    /**
     * Crée une adaptation de secours simple
     */
    public getFallbackAdaptation(): Adaptation {
        // Une adaptation minimale et sûre
        return {
            type: 'assistance',
            description: "Assistance de base pour vous accompagner dans votre apprentissage",
            appliedElements: ["minimal_assistance", "fallback"],
            reason: "Adaptation de secours suite à une erreur",
            action: 'provide',
            intensity: 0.3,
            explanation: "Assistance de base pour vous accompagner dans votre apprentissage",
            overridable: true,
            metadata: {
                isFallback: true
            }
        };
    }

    /**
     * Crée un résultat d'adaptation complet de secours
     * 
     * @param context Contexte d'apprentissage
     * @param errorMessage Message d'erreur (optionnel)
     * @returns Adaptation de secours
     */
    public getFallbackAdaptationResult(
        context: LearningContext,
        errorMessage?: string
    ): LearningAdaptation {
        const now = new Date();
        const formattedError = errorMessage ? String(errorMessage) : "Erreur inconnue";

        // Créer le contexte
        const adaptationContext: AdaptationContext = {
            userId: context.userId,
            timestamp: now.getTime(),
            lastUpdate: now.getTime(),
            error: formattedError,
            hasError: true
        };

        // Créer les métadonnées
        const metadata: AdaptationMetadata = {
            adaptationCount: 1,
            confidence: 0.3,
            processingTime: 0,
            error: formattedError
        };

        // Créer le résultat final
        return {
            adaptations: [this.getFallbackAdaptation()],
            context: adaptationContext,
            metadata
        };
    }

    /**
     * Détermine si une adaptation de secours devrait être proposée suite à une erreur
     * Plutôt que de manquer de fournir un résultat
     * 
     * @param error L'erreur rencontrée
     * @param context Le contexte d'apprentissage
     * @param profile Le profil utilisateur
     * @returns Vrai si une adaptation de secours devrait être fournie
     */
    public shouldProvideFallback(
        error: unknown,
        context: LearningContext,
        profile?: UserProfile
    ): boolean {
        // Si l'erreur est critique (comme un problème de connexion), fournir un fallback
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("network") || errorMessage.includes("timeout") || errorMessage.includes("connection")) {
            return true;
        }

        // Si le contexte indique un besoin d'assistance, fournir un fallback
        const frustrationLevel = context.currentFrustration ?? 0;
        if (frustrationLevel > 0.7) {
            return true;
        }

        // Si le profil indique une préférence pour l'assistance, fournir un fallback
        if (profile?.preferences?.assistanceLevel && profile.preferences.assistanceLevel > 0.7) {
            return true;
        }

        // Par défaut, toujours fournir un fallback pour éviter de laisser l'utilisateur sans assistance
        return true;
    }
}