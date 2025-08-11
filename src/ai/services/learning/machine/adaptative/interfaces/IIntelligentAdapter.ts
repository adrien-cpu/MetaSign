// src/ai/learning/interfaces/IIntelligentAdapter.ts

import { LearningContext, UserProfile } from '@ai/learning/types';
import { UserFeatures } from '@ai/learning/types/prediction-types';
import { Adaptation } from '@ai/learning/types/AdaptedContent';
import { LearningAdaptation } from '@ai/learning/types/learning-interfaces';

/**
 * Interface pour un adaptateur intelligent qui utilise des modèles prédictifs
 * pour optimiser l'expérience d'apprentissage.
 */
export interface IIntelligentAdapter {
    /**
     * Méthode principale pour adapter l'expérience d'apprentissage
     * 
     * @param context Contexte d'apprentissage actuel
     * @param userProfile Profil de l'utilisateur
     * @returns Résultat d'adaptation avec les actions recommandées
     */
    adapt(
        context: LearningContext,
        userProfile: UserProfile
    ): Promise<LearningAdaptation>;

    /**
     * Génère des adaptations pour l'utilisateur en fonction des données d'entrée
     * 
     * @param context Contexte d'apprentissage actuel
     * @param userProfile Profil de l'utilisateur
     * @returns Liste des adaptations générées
     */
    generateAdaptations(
        context: LearningContext,
        userProfile: UserProfile
    ): Promise<Adaptation[]>;

    /**
     * Évalue les adaptations proposées et retourne les adaptations validées
     * 
     * @param userId Identifiant de l'utilisateur
     * @param context Contexte d'apprentissage actuel
     * @param adaptations Adaptations à évaluer
     * @returns Adaptations validées
     */
    evaluateAdaptations(
        userId: string,
        context: LearningContext,
        adaptations: Adaptation[]
    ): Promise<Adaptation[]>;

    /**
     * Met à jour le modèle d'adaptation basé sur le feedback
     * 
     * @param userId Identifiant de l'utilisateur
     * @param adaptationResults Résultats des adaptations précédentes (id d'adaptation => succès)
     * @returns Succès de la mise à jour
     */
    updateModel(
        userId: string,
        adaptationResults: Record<string, boolean>
    ): Promise<boolean>;

    /**
     * Construit les caractéristiques utilisateur pour les prédictions
     * 
     * @param context Contexte d'apprentissage actuel
     * @returns Caractéristiques utilisateur pour les modèles prédictifs
     */
    buildUserFeatures(
        context: LearningContext
    ): UserFeatures;
}